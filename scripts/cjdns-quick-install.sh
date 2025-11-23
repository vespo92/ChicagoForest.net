#!/bin/bash
#
# CJDNS Quick Install Script
# Build and install CJDNS encrypted mesh network
#
# Usage: curl -sL https://chicagoforest.net/scripts/cjdns-quick-install.sh | sudo bash
#
# Documentation: https://github.com/cjdelisle/cjdns
# Chicago Forest: https://chicagoforest.net/mesh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     CJDNS Network Quick Install               ║${NC}"
echo -e "${BLUE}║     Encrypted IPv6 Mesh (fc00::/8)            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if already installed
if command -v cjdroute &> /dev/null; then
    echo -e "${GREEN}CJDNS is already installed${NC}"
    CJDNS_VERSION=$(cjdroute --version 2>/dev/null | head -1 || echo "installed")
    echo "Version: $CJDNS_VERSION"

    read -p "Reinstall? [y/N] " REINSTALL
    if [ "$REINSTALL" != "y" ] && [ "$REINSTALL" != "Y" ]; then
        echo "Keeping existing installation."

        # Just ensure service is running
        if [ -f /etc/cjdns/cjdroute.conf ]; then
            systemctl restart cjdns 2>/dev/null || true
            echo -e "${GREEN}Service restarted${NC}"
        fi
        exit 0
    fi
fi

# Install build dependencies
echo -e "${YELLOW}Installing build dependencies...${NC}"

if command -v apt-get &> /dev/null; then
    apt-get update -qq
    apt-get install -y build-essential python3 git nodejs npm
elif command -v dnf &> /dev/null; then
    dnf install -y @development-tools python3 git nodejs npm
elif command -v pacman &> /dev/null; then
    pacman -S --noconfirm base-devel python git nodejs npm
else
    echo -e "${RED}Unsupported package manager${NC}"
    echo "Please install: build-essential, python3, git, nodejs"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Clone and build CJDNS
echo ""
echo -e "${YELLOW}Building CJDNS from source...${NC}"
echo "(This may take a few minutes)"

BUILD_DIR="/tmp/cjdns-build-$$"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

git clone --depth 1 https://github.com/cjdelisle/cjdns.git
cd cjdns

# Build
./do

if [ ! -f cjdroute ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ CJDNS built successfully${NC}"

# Install
echo ""
echo -e "${YELLOW}Installing CJDNS...${NC}"

cp cjdroute /usr/local/bin/
chmod +x /usr/local/bin/cjdroute

# Copy tools
cp -r tools /usr/local/lib/cjdns-tools 2>/dev/null || true

mkdir -p /etc/cjdns

echo -e "${GREEN}✓ CJDNS installed to /usr/local/bin/cjdroute${NC}"

# Generate configuration
echo ""
echo -e "${YELLOW}Generating configuration...${NC}"

if [ ! -f /etc/cjdns/cjdroute.conf ]; then
    cjdroute --genconf > /etc/cjdns/cjdroute.conf
    chmod 600 /etc/cjdns/cjdroute.conf
    echo -e "${GREEN}✓ New configuration generated${NC}"
else
    echo -e "${GREEN}✓ Using existing configuration${NC}"
fi

# Extract node info
IPV6=$(grep -oP '"ipv6":\s*"\K[^"]+' /etc/cjdns/cjdroute.conf | head -1)
PUBKEY=$(grep -oP '"publicKey":\s*"\K[^"]+' /etc/cjdns/cjdroute.conf | head -1)

# Create systemd service
echo ""
echo -e "${YELLOW}Creating systemd service...${NC}"

cat > /etc/systemd/system/cjdns.service << 'EOF'
[Unit]
Description=CJDNS Encrypted Mesh Network
After=network.target

[Service]
Type=forking
ExecStart=/bin/sh -c '/usr/local/bin/cjdroute < /etc/cjdns/cjdroute.conf'
Restart=on-failure
RestartSec=5
ProtectHome=true
ProtectSystem=full
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable cjdns

echo -e "${GREEN}✓ Systemd service created${NC}"

# Start service
echo ""
echo -e "${YELLOW}Starting CJDNS...${NC}"

systemctl start cjdns
sleep 2

# Verify
if systemctl is-active --quiet cjdns; then
    echo -e "${GREEN}✓ CJDNS is running${NC}"
else
    echo -e "${RED}Warning: Service may not be running${NC}"
    echo "Check: journalctl -u cjdns"
fi

# Check TUN interface
if ip addr show tun0 &>/dev/null; then
    echo -e "${GREEN}✓ TUN interface created${NC}"
else
    echo -e "${YELLOW}Note: TUN interface not yet visible${NC}"
fi

# Cleanup build directory
cd /
rm -rf "$BUILD_DIR"

# Display info
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}     CJDNS Installation Complete!              ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "Your CJDNS Node:"
echo -e "  IPv6 Address: ${YELLOW}$IPV6${NC}"
echo -e "  Public Key:   ${BLUE}${PUBKEY:0:30}...${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: To join the network, you need peers!${NC}"
echo ""
echo -e "Finding Peers:"
echo -e "  1. Visit: ${BLUE}https://peers.fc00.io/${NC}"
echo -e "  2. Reddit: ${BLUE}r/darknetplan${NC}"
echo -e "  3. Matrix: ${BLUE}#cjdns:matrix.org${NC}"
echo ""
echo -e "Adding a Peer:"
echo -e "  Edit ${BLUE}/etc/cjdns/cjdroute.conf${NC}"
echo -e "  Add peer credentials to the 'connectTo' section"
echo -e "  Then: ${BLUE}sudo systemctl restart cjdns${NC}"
echo ""
echo -e "Example peer entry:"
echo -e '  "1.2.3.4:12345": {'
echo -e '    "login": "default-login",'
echo -e '    "password": "peer-password",'
echo -e '    "publicKey": "peer-public-key.k"'
echo -e '  }'
echo ""
echo -e "Useful Commands:"
echo -e "  ${BLUE}systemctl status cjdns${NC}       - Check service status"
echo -e "  ${BLUE}ip addr show tun0${NC}            - Show CJDNS interface"
echo -e "  ${BLUE}journalctl -u cjdns -f${NC}       - View logs"
echo ""
echo -e "Configuration: ${BLUE}/etc/cjdns/cjdroute.conf${NC}"
echo ""
echo -e "${GREEN}Welcome to the cjdns/Hyperboria network!${NC}"
echo ""
