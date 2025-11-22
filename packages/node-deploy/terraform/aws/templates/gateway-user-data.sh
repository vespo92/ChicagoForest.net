#!/bin/bash
# Chicago Forest Network Gateway - AWS User Data Script
#
# DISCLAIMER: This is part of an AI-generated theoretical framework
# for educational and research purposes.

set -e

# Configuration from Terraform
NODE_NAME="${node_name}"
NODE_INDEX="${node_index}"
DOCKER_IMAGE="${docker_image}"
FOREST_SUBNET="${forest_subnet}"
ENVIRONMENT="${environment}"

# Logging
exec > >(tee /var/log/forest-init.log|logger -t forest-init -s 2>/dev/console) 2>&1

echo "========================================"
echo "Chicago Forest Network Gateway Setup"
echo "Gateway: $NODE_NAME"
echo "Environment: $ENVIRONMENT"
echo "========================================"

# =============================================================================
# System Updates and Dependencies
# =============================================================================

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    jq \
    wireguard-tools \
    batctl \
    iproute2 \
    nftables \
    iptables-persistent \
    dnsmasq \
    awscli

# =============================================================================
# Install Docker
# =============================================================================

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable docker
systemctl start docker

# =============================================================================
# Kernel Configuration
# =============================================================================

cat > /etc/sysctl.d/99-forest-gateway.conf << EOF
# IP Forwarding
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1

# Disable reverse path filtering
net.ipv4.conf.all.rp_filter = 0
net.ipv4.conf.default.rp_filter = 0

# Network buffers
net.core.rmem_max = 26214400
net.core.wmem_max = 26214400
net.ipv4.tcp_rmem = 4096 87380 26214400
net.ipv4.tcp_wmem = 4096 65536 26214400

# Connection tracking
net.netfilter.nf_conntrack_max = 524288
EOF

sysctl -p /etc/sysctl.d/99-forest-gateway.conf

# Load modules
modprobe wireguard
modprobe batman_adv
modprobe tun
modprobe nf_conntrack

cat > /etc/modules-load.d/forest.conf << EOF
wireguard
batman_adv
tun
nf_conntrack
nf_nat
EOF

# =============================================================================
# Create Directories and User
# =============================================================================

useradd -r -s /bin/false -d /var/lib/forest forest || true
usermod -aG docker forest || true

mkdir -p /var/lib/forest/keys /etc/forest /var/log/forest /opt/forest
chown -R forest:forest /var/lib/forest /etc/forest /var/log/forest

# =============================================================================
# Generate Identity
# =============================================================================

cd /var/lib/forest/keys

if [ ! -f wireguard.key ]; then
    wg genkey | tee wireguard.key | wg pubkey > wireguard.pub
    chmod 600 wireguard.key
fi

WG_PUBKEY=$(cat wireguard.pub)
NODE_ID=$(echo "$WG_PUBKEY" | sha256sum | head -c 16)

cat > node_identity.json << EOF
{
    "nodeId": "$NODE_ID",
    "nodeName": "$NODE_NAME",
    "role": "gateway",
    "nodeIndex": $NODE_INDEX,
    "environment": "$ENVIRONMENT",
    "cloud": "aws",
    "wireguard": {
        "publicKey": "$WG_PUBKEY"
    },
    "created": "$(date -Iseconds)"
}
EOF

chmod 600 node_identity.json

# =============================================================================
# Gateway Configuration
# =============================================================================

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)

cat > /etc/forest/gateway.yaml << EOF
nodeName: $NODE_NAME
role: gateway

network:
  publicIp: $PUBLIC_IP
  privateIp: $PRIVATE_IP
  forestSubnet: $FOREST_SUBNET
  wanInterface: eth0
  forestInterface: eth0

gateway:
  enableNat: true
  enableDhcp: false
  enableDns: false

vpn:
  enabled: true
  port: 51820

logging:
  level: info

cloud:
  provider: aws
  environment: $ENVIRONMENT
EOF

# =============================================================================
# Firewall Rules
# =============================================================================

cat > /etc/forest/iptables-gateway.sh << 'FIREWALL'
#!/bin/bash
# Gateway firewall rules

iptables -F
iptables -t nat -F

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Loopback
iptables -A INPUT -i lo -j ACCEPT

# Established
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# ICMP
iptables -A INPUT -p icmp -j ACCEPT

# SSH (AWS internal)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# P2P
iptables -A INPUT -p udp --dport 42000 -j ACCEPT

# WireGuard
iptables -A INPUT -p udp --dport 51820 -j ACCEPT

# API
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT

# Metrics
iptables -A INPUT -p tcp --dport 9090 -j ACCEPT

# NAT
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE

# Forward from VPN
iptables -A FORWARD -i wg-forest -j ACCEPT
iptables -A FORWARD -o wg-forest -j ACCEPT

# Save
iptables-save > /etc/iptables/rules.v4
FIREWALL

chmod +x /etc/forest/iptables-gateway.sh
/etc/forest/iptables-gateway.sh

# =============================================================================
# Docker Compose
# =============================================================================

cat > /opt/forest/docker-compose.yml << EOF
version: '3.8'

services:
  forest-gateway:
    image: $DOCKER_IMAGE
    container_name: $NODE_NAME
    hostname: $NODE_NAME
    restart: unless-stopped
    network_mode: host
    privileged: true
    environment:
      - FOREST_NODE_NAME=$NODE_NAME
      - GATEWAY_MODE=true
      - WAN_INTERFACE=eth0
      - FOREST_INTERFACE=eth0
      - FOREST_SUBNET=$FOREST_SUBNET
      - ENABLE_NAT=true
      - PUBLIC_IP=$PUBLIC_IP
      - LOG_LEVEL=info
    volumes:
      - /var/lib/forest:/var/lib/forest
      - /etc/forest:/etc/forest
      - /var/log/forest:/var/log/forest
      - /dev/net/tun:/dev/net/tun
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
    healthcheck:
      test: ["CMD", "curl", "-sf", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

# =============================================================================
# Systemd Service
# =============================================================================

cat > /etc/systemd/system/forest-gateway.service << EOF
[Unit]
Description=Chicago Forest Network Gateway
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/forest
ExecStartPre=/etc/forest/iptables-gateway.sh
ExecStartPre=/usr/bin/docker compose pull
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable forest-gateway

# =============================================================================
# Start Services
# =============================================================================

systemctl start forest-gateway

sleep 30

if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
    echo "Gateway is healthy!"
else
    echo "WARNING: Gateway health check failed"
fi

echo "========================================"
echo "Gateway setup complete!"
echo "Node ID: $NODE_ID"
echo "Public IP: $PUBLIC_IP"
echo "========================================"
