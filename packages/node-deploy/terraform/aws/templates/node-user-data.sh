#!/bin/bash
# Chicago Forest Network Node - AWS User Data Script
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
echo "Chicago Forest Network Node Setup"
echo "Node: $NODE_NAME"
echo "Environment: $ENVIRONMENT"
echo "========================================"

# =============================================================================
# System Updates
# =============================================================================

echo "Updating system packages..."
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

# =============================================================================
# Install Dependencies
# =============================================================================

echo "Installing dependencies..."
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
    awscli

# =============================================================================
# Install Docker
# =============================================================================

echo "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable docker
systemctl start docker

# =============================================================================
# Configure Kernel
# =============================================================================

echo "Configuring kernel parameters..."
cat > /etc/sysctl.d/99-forest.conf << EOF
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1
net.ipv4.conf.all.rp_filter = 0
net.ipv4.conf.default.rp_filter = 0
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
EOF

sysctl -p /etc/sysctl.d/99-forest.conf

# Load kernel modules
modprobe wireguard
modprobe batman_adv
modprobe tun

cat > /etc/modules-load.d/forest.conf << EOF
wireguard
batman_adv
tun
vxlan
EOF

# =============================================================================
# Mount Data Volume
# =============================================================================

echo "Setting up data volume..."
# Wait for EBS volume
while [ ! -e /dev/xvdf ] && [ ! -e /dev/nvme1n1 ]; do
    echo "Waiting for EBS volume..."
    sleep 5
done

# Determine device name
if [ -e /dev/nvme1n1 ]; then
    DEVICE=/dev/nvme1n1
else
    DEVICE=/dev/xvdf
fi

# Format if needed
if ! blkid $DEVICE; then
    mkfs.ext4 $DEVICE
fi

# Mount
mkdir -p /var/lib/forest
mount $DEVICE /var/lib/forest

# Add to fstab
echo "$DEVICE /var/lib/forest ext4 defaults,nofail 0 2" >> /etc/fstab

# =============================================================================
# Create Forest User
# =============================================================================

echo "Creating forest user..."
useradd -r -s /bin/false -d /var/lib/forest forest || true
usermod -aG docker forest || true

mkdir -p /var/lib/forest/keys /etc/forest /var/log/forest
chown -R forest:forest /var/lib/forest /etc/forest /var/log/forest

# =============================================================================
# Generate Node Identity
# =============================================================================

echo "Generating node identity..."
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
# Forest Node Configuration
# =============================================================================

echo "Creating forest configuration..."
cat > /etc/forest/config.yaml << EOF
nodeName: $NODE_NAME
nodeIndex: $NODE_INDEX

network:
  forestSubnet: $FOREST_SUBNET
  p2pPort: 42000
  wireguardPort: 51820
  apiPort: 8080
  metricsPort: 9090

features:
  firewall: true
  relay: false
  storage: false

logging:
  level: info
  file: /var/log/forest/node.log

cloud:
  provider: aws
  environment: $ENVIRONMENT
EOF

# =============================================================================
# Docker Compose Configuration
# =============================================================================

echo "Creating docker-compose configuration..."
mkdir -p /opt/forest

cat > /opt/forest/docker-compose.yml << EOF
version: '3.8'

services:
  forest-node:
    image: $DOCKER_IMAGE
    container_name: $NODE_NAME
    hostname: $NODE_NAME
    restart: unless-stopped
    network_mode: host
    cap_add:
      - NET_ADMIN
      - NET_RAW
      - SYS_MODULE
    environment:
      - FOREST_NODE_NAME=$NODE_NAME
      - FOREST_INTERFACE=eth0
      - ENABLE_FIREWALL=true
      - ENABLE_RELAY=false
      - LOG_LEVEL=info
      - AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
    volumes:
      - /var/lib/forest:/var/lib/forest
      - /etc/forest:/etc/forest
      - /var/log/forest:/var/log/forest
      - /dev/net/tun:/dev/net/tun
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    healthcheck:
      test: ["CMD", "curl", "-sf", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  forest-data:
    driver: local
EOF

# =============================================================================
# Systemd Service
# =============================================================================

echo "Creating systemd service..."
cat > /etc/systemd/system/forest-node.service << EOF
[Unit]
Description=Chicago Forest Network Node
After=docker.service network-online.target
Requires=docker.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/forest
ExecStartPre=/usr/bin/docker compose pull
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
ExecReload=/usr/bin/docker compose restart

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable forest-node

# =============================================================================
# CloudWatch Agent (Optional)
# =============================================================================

echo "Setting up CloudWatch agent..."
# Download and install CloudWatch agent
wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb || true
rm amazon-cloudwatch-agent.deb

# =============================================================================
# Start Services
# =============================================================================

echo "Starting forest node..."
systemctl start forest-node

# =============================================================================
# Verification
# =============================================================================

echo "Waiting for node to become healthy..."
sleep 30

if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
    echo "Node is healthy!"
else
    echo "WARNING: Node health check failed"
fi

echo "========================================"
echo "Forest node setup complete!"
echo "Node ID: $NODE_ID"
echo "Public Key: $WG_PUBKEY"
echo "========================================"
