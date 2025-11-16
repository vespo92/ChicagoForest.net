#!/bin/bash
#
# Chicago Community Mesh Network - Quick Install Script
# https://chicagoforest.net/mesh
#
# This script sets up a mesh network node using:
# - B.A.T.M.A.N. adv for Layer 2 mesh routing
# - Yggdrasil for encrypted overlay networking
# - IPFS for content distribution
# - Avahi for local service discovery
#
# Supported platforms: Debian/Ubuntu/Raspbian
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MESH_INTERFACE="wlan0"
MESH_SSID="CCMN-Mesh"
MESH_CHANNEL="149"  # 5GHz
BATMAN_INTERFACE="bat0"

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Chicago Community Mesh Network          ║${NC}"
echo -e "${GREEN}║   Installation Script v1.0                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run as root (use sudo)${NC}"
  exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
else
  echo -e "${RED}Error: Cannot detect OS${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Detected OS: $PRETTY_NAME${NC}"

# Update package list
echo ""
echo -e "${YELLOW}Updating package lists...${NC}"
apt-get update -qq

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
apt-get install -y \
  batctl \
  bridge-utils \
  curl \
  dnsmasq \
  git \
  gnupg \
  hostapd \
  iw \
  jq \
  net-tools \
  wireless-tools \
  wpasupplicant

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Install B.A.T.M.A.N.
echo ""
echo -e "${YELLOW}Installing B.A.T.M.A.N. advanced...${NC}"

# Load kernel module
modprobe batman-adv

# Make it load on boot
if ! grep -q "batman-adv" /etc/modules; then
  echo "batman-adv" >> /etc/modules
fi

BATMAN_VERSION=$(batctl -v | head -n1)
echo -e "${GREEN}✓ $BATMAN_VERSION installed${NC}"

# Install Yggdrasil
echo ""
echo -e "${YELLOW}Installing Yggdrasil Network...${NC}"

# Add repository
if [ ! -f /etc/apt/sources.list.d/yggdrasil.list ]; then
  gpg --fetch-keys https://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/key.txt
  gpg --export 569130E8CA20FBC4CB3FDE555898470A764B32C9 | apt-key add -
  echo 'deb http://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/ debian yggdrasil' | tee /etc/apt/sources.list.d/yggdrasil.list
  apt-get update -qq
fi

apt-get install -y yggdrasil

YGGDRASIL_VERSION=$(yggdrasil -version | head -n1)
echo -e "${GREEN}✓ $YGGDRASIL_VERSION installed${NC}"

# Install IPFS
echo ""
echo -e "${YELLOW}Installing IPFS...${NC}"

IPFS_VERSION="v0.28.0"
IPFS_URL="https://dist.ipfs.io/kubo/$IPFS_VERSION/kubo_${IPFS_VERSION}_linux-amd64.tar.gz"

if [ ! -f /usr/local/bin/ipfs ]; then
  cd /tmp
  wget -q --show-progress "$IPFS_URL"
  tar xzf "kubo_${IPFS_VERSION}_linux-amd64.tar.gz"
  cd kubo
  bash install.sh
  cd ..
  rm -rf kubo "kubo_${IPFS_VERSION}_linux-amd64.tar.gz"
fi

IPFS_INSTALLED_VERSION=$(ipfs version -n)
echo -e "${GREEN}✓ IPFS $IPFS_INSTALLED_VERSION installed${NC}"

# Install Avahi
echo ""
echo -e "${YELLOW}Installing Avahi (service discovery)...${NC}"
apt-get install -y avahi-daemon avahi-utils
systemctl enable avahi-daemon
systemctl start avahi-daemon
echo -e "${GREEN}✓ Avahi installed${NC}"

# Configure network interface
echo ""
echo -e "${YELLOW}Configuring mesh network interface...${NC}"

# Detect WiFi interfaces
WIFI_INTERFACES=$(iw dev | grep Interface | awk '{print $2}')

if [ -z "$WIFI_INTERFACES" ]; then
  echo -e "${RED}Error: No WiFi interfaces found${NC}"
  echo "Please ensure you have a WiFi adapter installed"
  exit 1
fi

echo "Available WiFi interfaces:"
echo "$WIFI_INTERFACES"
echo ""
read -p "Enter interface to use for mesh (default: wlan0): " USER_INTERFACE
MESH_INTERFACE=${USER_INTERFACE:-wlan0}

echo -e "${GREEN}✓ Using interface: $MESH_INTERFACE${NC}"

# Configure B.A.T.M.A.N. interface
echo ""
echo -e "${YELLOW}Configuring B.A.T.M.A.N. mesh...${NC}"

cat > /etc/systemd/system/batman-mesh.service << EOF
[Unit]
Description=B.A.T.M.A.N. Mesh Network
After=network.target

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/bin/batman-start.sh
ExecStop=/usr/local/bin/batman-stop.sh

[Install]
WantedBy=multi-user.target
EOF

cat > /usr/local/bin/batman-start.sh << EOF
#!/bin/bash
# Disable network manager control
ip link set $MESH_INTERFACE down
iw dev $MESH_INTERFACE set type ibss
ip link set $MESH_INTERFACE up

# Join mesh network
iw dev $MESH_INTERFACE ibss join $MESH_SSID 5745 fixed-freq 02:BA:00:00:00:01

# Add to batman interface
batctl if add $MESH_INTERFACE

# Bring up batman interface
ip link set up dev $BATMAN_INTERFACE

# Configure IP (mesh network is 10.mesh.0.0/16)
NODE_ID=\$(cat /sys/class/net/eth0/address | tail -c 4 | tr -d ':' | xargs printf '%d')
ip addr add 10.mesh.0.\$NODE_ID/16 dev $BATMAN_INTERFACE

echo "B.A.T.M.A.N. mesh started on $MESH_INTERFACE"
EOF

cat > /usr/local/bin/batman-stop.sh << EOF
#!/bin/bash
batctl if del $MESH_INTERFACE
ip link set down dev $BATMAN_INTERFACE
iw dev $MESH_INTERFACE ibss leave
EOF

chmod +x /usr/local/bin/batman-start.sh
chmod +x /usr/local/bin/batman-stop.sh

systemctl enable batman-mesh.service
echo -e "${GREEN}✓ B.A.T.M.A.N. mesh configured${NC}"

# Configure Yggdrasil
echo ""
echo -e "${YELLOW}Configuring Yggdrasil overlay network...${NC}"

if [ ! -f /etc/yggdrasil/yggdrasil.conf ]; then
  yggdrasil -genconf > /etc/yggdrasil/yggdrasil.conf
fi

# Add public peers for internet connectivity
cat > /tmp/yggdrasil_peers.json << 'EOF'
[
  "tls://[2a05:fc84::2]:61994",
  "tls://[2a05:fc84::3]:61995",
  "tls://ygg.mkg20001.io:443",
  "tls://51.15.118.10:62486"
]
EOF

# Merge peers into config
python3 << 'PYTHON_SCRIPT'
import json

config_path = "/etc/yggdrasil/yggdrasil.conf"
peers_path = "/tmp/yggdrasil_peers.json"

with open(config_path, "r") as f:
    config = json.load(f)

with open(peers_path, "r") as f:
    new_peers = json.load(f)

if "Peers" not in config:
    config["Peers"] = []

config["Peers"].extend(new_peers)
config["Peers"] = list(set(config["Peers"]))  # Remove duplicates

with open(config_path, "w") as f:
    json.dump(config, f, indent=2)

print(f"Added {len(new_peers)} peers to Yggdrasil config")
PYTHON_SCRIPT

systemctl enable yggdrasil
systemctl start yggdrasil

# Get Yggdrasil address
sleep 2
YGGDRASIL_IP=$(yggdrasilctl getSelf | grep "IPv6 address" | awk '{print $3}')
echo -e "${GREEN}✓ Yggdrasil configured${NC}"
echo -e "   IPv6 address: ${YELLOW}$YGGDRASIL_IP${NC}"

# Configure IPFS
echo ""
echo -e "${YELLOW}Configuring IPFS...${NC}"

if [ ! -d /root/.ipfs ]; then
  sudo -u root ipfs init
fi

# Configure IPFS as systemd service
cat > /etc/systemd/system/ipfs.service << EOF
[Unit]
Description=IPFS Daemon
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/ipfs daemon
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl enable ipfs
systemctl start ipfs

echo -e "${GREEN}✓ IPFS configured${NC}"

# Configure local DNS
echo ""
echo -e "${YELLOW}Configuring local DNS (.mesh domain)...${NC}"

cat > /etc/dnsmasq.d/mesh.conf << EOF
# Mesh network DNS
interface=$BATMAN_INTERFACE
domain=mesh
local=/mesh/
expand-hosts

# DHCP for mesh clients (optional)
# dhcp-range=10.mesh.100.1,10.mesh.200.254,12h

# Upstream DNS
server=1.1.1.1
server=9.9.9.9
EOF

systemctl enable dnsmasq
systemctl restart dnsmasq

echo -e "${GREEN}✓ DNS configured${NC}"

# Configure Avahi service announcement
echo ""
echo -e "${YELLOW}Configuring service discovery...${NC}"

read -p "Enter a friendly name for this node (default: mesh-node): " NODE_NAME
NODE_NAME=${NODE_NAME:-mesh-node}

read -p "Enter latitude (e.g., 41.8781): " LATITUDE
read -p "Enter longitude (e.g., -87.6298): " LONGITUDE

# Generate CFN address
PUBLIC_KEY=$(yggdrasilctl getSelf | grep "Public key" | awk '{print $3}')
NODE_ID=$(echo -n "$PUBLIC_KEY" | sha256sum | cut -c1-12)

# Simple geohash (using first 4 chars of lat/lon hash)
GEO_STRING="${LATITUDE},${LONGITUDE}"
GEO_HASH=$(echo -n "$GEO_STRING" | sha256sum | cut -c1-4)

CFN_ADDRESS="cfn:${GEO_HASH}:${NODE_ID}"

cat > /etc/avahi/services/mesh-node.service << EOF
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name>$NODE_NAME</name>
  <service>
    <type>_cfn._tcp</type>
    <port>9001</port>
    <txt-record>cfn=$CFN_ADDRESS</txt-record>
    <txt-record>lat=$LATITUDE</txt-record>
    <txt-record>lon=$LONGITUDE</txt-record>
    <txt-record>yggdrasil=$YGGDRASIL_IP</txt-record>
  </service>
</service-group>
EOF

systemctl restart avahi-daemon

echo -e "${GREEN}✓ Service discovery configured${NC}"
echo -e "   CFN Address: ${YELLOW}$CFN_ADDRESS${NC}"

# Save node config
mkdir -p /etc/ccmn
cat > /etc/ccmn/node.json << EOF
{
  "name": "$NODE_NAME",
  "cfn_address": "$CFN_ADDRESS",
  "yggdrasil_ip": "$YGGDRASIL_IP",
  "location": {
    "latitude": $LATITUDE,
    "longitude": $LONGITUDE
  },
  "mesh_interface": "$MESH_INTERFACE",
  "batman_interface": "$BATMAN_INTERFACE",
  "installed_at": "$(date -Iseconds)"
}
EOF

# Create management script
cat > /usr/local/bin/mesh-status << 'EOF'
#!/bin/bash
# Display mesh network status

echo "╔════════════════════════════════════════════╗"
echo "║   Chicago Community Mesh Network          ║"
echo "║   Node Status                             ║"
echo "╚════════════════════════════════════════════╝"
echo ""

if [ -f /etc/ccmn/node.json ]; then
  echo "Node Configuration:"
  cat /etc/ccmn/node.json | jq .
  echo ""
fi

echo "B.A.T.M.A.N. Neighbors:"
batctl n
echo ""

echo "B.A.T.M.A.N. Originators:"
batctl o
echo ""

echo "Yggdrasil Peers:"
yggdrasilctl getPeers | jq .
echo ""

echo "IPFS Status:"
ipfs swarm peers | wc -l | xargs echo "Connected peers:"
EOF

chmod +x /usr/local/bin/mesh-status

# Start all services
echo ""
echo -e "${YELLOW}Starting mesh network services...${NC}"

systemctl start batman-mesh
systemctl restart yggdrasil
systemctl restart ipfs

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Installation Complete! 🎉                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Your mesh node is now active:"
echo -e "  ${GREEN}✓${NC} B.A.T.M.A.N. mesh routing"
echo -e "  ${GREEN}✓${NC} Yggdrasil encrypted overlay"
echo -e "  ${GREEN}✓${NC} IPFS content distribution"
echo -e "  ${GREEN}✓${NC} Local service discovery"
echo ""
echo -e "Node Details:"
echo -e "  Name:         ${YELLOW}$NODE_NAME${NC}"
echo -e "  CFN Address:  ${YELLOW}$CFN_ADDRESS${NC}"
echo -e "  Yggdrasil IP: ${YELLOW}$YGGDRASIL_IP${NC}"
echo ""
echo -e "Commands:"
echo -e "  ${YELLOW}mesh-status${NC}       - View network status"
echo -e "  ${YELLOW}batctl n${NC}          - View mesh neighbors"
echo -e "  ${YELLOW}yggdrasilctl getPeers${NC} - View Yggdrasil peers"
echo -e "  ${YELLOW}ipfs swarm peers${NC}  - View IPFS connections"
echo ""
echo -e "Documentation: ${YELLOW}https://chicagoforest.net/mesh${NC}"
echo -e "Community: ${YELLOW}https://discord.gg/chicagoforest${NC}"
echo ""
echo -e "${GREEN}Welcome to the mesh! 🌲⚡🌐${NC}"
echo ""
