# Chicago Forest Network - Home Node Setup Guide

> **DISCLAIMER**: This is part of an AI-generated theoretical framework for educational and research purposes. The Chicago Forest Network is a conceptual project exploring decentralized energy and mesh networking. This guide describes a theoretical setup - the network is NOT currently operational.

## Overview

This guide walks you through setting up a Chicago Forest Network node at home. A home node participates in the decentralized mesh network, contributing to network resilience and potentially earning future network credits.

## Table of Contents

1. [Hardware Requirements](#hardware-requirements)
2. [Network Requirements](#network-requirements)
3. [Software Installation](#software-installation)
4. [Configuration](#configuration)
5. [Running Your Node](#running-your-node)
6. [Monitoring](#monitoring)
7. [Security](#security)
8. [FAQ](#faq)

## Hardware Requirements

### Minimum Specifications

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 2 GB | 4+ GB |
| Storage | 20 GB SSD | 100+ GB SSD |
| Network | 10 Mbps | 100+ Mbps |

### Recommended Hardware

**Option 1: Raspberry Pi 4/5**
- Raspberry Pi 4B (4GB+ RAM) or Pi 5
- 64GB+ microSD or USB SSD
- Official power supply
- Case with cooling

**Option 2: Mini PC**
- Intel N100 or similar
- 8GB RAM
- 128GB NVMe SSD
- Dual Ethernet preferred

**Option 3: Repurposed Hardware**
- Old laptop or desktop
- Any x86_64 CPU from last 10 years
- Minimum 4GB RAM
- SSD recommended (HDD possible)

### Network Interface Considerations

For best mesh performance, consider:
- **Dedicated NIC**: Separate interface for Forest network
- **Dual-port Ethernet**: One for WAN, one for Forest
- **USB Ethernet adapter**: Low-cost option for dedicated interface

## Network Requirements

### Internet Connection

- Stable internet connection (DSL, Cable, Fiber)
- Static IP or DDNS recommended for gateway mode
- Ability to forward ports (or UPnP enabled)

### Required Ports

| Port | Protocol | Purpose | Direction |
|------|----------|---------|-----------|
| 42000 | UDP | P2P mesh | Inbound |
| 51820 | UDP | WireGuard | Inbound |
| 8080 | TCP | API (local only) | Local |

### Router Configuration

1. Log into your router admin panel
2. Navigate to Port Forwarding
3. Add rules for ports 42000/UDP and 51820/UDP
4. Point to your node's local IP address

## Software Installation

### Option 1: Docker (Recommended)

Docker provides the simplest deployment method.

#### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then verify
docker --version
```

#### Install Forest Node

```bash
# Create directory
mkdir -p ~/forest-node && cd ~/forest-node

# Download docker-compose
curl -LO https://raw.githubusercontent.com/chicago-forest/chicago-forest/main/packages/node-deploy/docker/docker-compose.yml

# Create environment file
cat > .env << EOF
FOREST_NODE_NAME=my-home-node
FOREST_INTERFACE=eth0
ENABLE_FIREWALL=true
ENABLE_RELAY=false
LOG_LEVEL=info
EOF

# Start the node
docker compose up -d
```

### Option 2: Ansible

For more control over the installation:

```bash
# Install Ansible
sudo apt install ansible -y

# Clone repository
git clone https://github.com/vespo92/ChicagoForest.net.git
cd ChicagoForest.net/packages/node-deploy/ansible

# Create inventory
cat > inventory.yml << EOF
all:
  hosts:
    localhost:
      ansible_connection: local
  vars:
    node_name: my-home-node
    forest_interface: eth0
EOF

# Run playbook
ansible-playbook -i inventory.yml playbooks/install-node.yml
```

### Option 3: Manual Installation

For advanced users who want full control:

```bash
# Install dependencies
sudo apt install -y \
    wireguard-tools \
    batctl \
    iproute2 \
    nftables \
    curl \
    jq

# Create directories
sudo mkdir -p /var/lib/forest/keys /etc/forest /var/log/forest

# Generate WireGuard keys
wg genkey | sudo tee /var/lib/forest/keys/wireguard.key | wg pubkey | sudo tee /var/lib/forest/keys/wireguard.pub

# Clone and build
git clone https://github.com/vespo92/ChicagoForest.net.git
cd ChicagoForest.net
npm install
npm run build

# Run node
node packages/node-deploy/dist/index.js --start
```

## Configuration

### Basic Configuration

Edit your configuration file:

```bash
# Docker: ~/forest-node/.env
# Manual: /etc/forest/config.yaml
```

#### config.yaml

```yaml
# Chicago Forest Network Node Configuration

# Node identity
nodeName: my-home-node
# nodeId: auto-generated

# Network interface for Forest mesh
forestInterface: eth0

# Features
features:
  firewall: true
  relay: false        # Enable to help route traffic
  storage: false      # Enable to store data for network
  anonymousRouting: false

# Storage settings (if enabled)
storage:
  path: /var/lib/forest/data
  limit: 50GB

# Network settings
network:
  p2pPort: 42000
  wireguardPort: 51820
  apiPort: 8080

# Bootstrap peers (theoretical)
bootstrapPeers: []
  # - forest-chicago-1.example.com:42000
  # - 10.42.0.1:42000

# Logging
logging:
  level: info
  file: /var/log/forest/node.log
```

### Advanced Configuration

#### Enable Relay Mode

Relay mode allows your node to help route traffic for other nodes:

```yaml
features:
  relay: true

relay:
  maxBandwidth: 50Mbps   # Limit bandwidth contribution
  maxConnections: 100    # Maximum simultaneous connections
```

#### Enable Storage

Storage mode allows your node to store encrypted data for the network:

```yaml
features:
  storage: true

storage:
  path: /mnt/forest-storage
  limit: 500GB
  encryption: true
```

## Running Your Node

### Start the Node

```bash
# Docker
cd ~/forest-node
docker compose up -d

# Systemd (manual install)
sudo systemctl start forest-node
```

### Check Status

```bash
# Docker
docker logs -f forest-node

# CLI status
docker exec forest-node forest-cli status

# Or via API
curl http://localhost:8080/health
```

### Expected Output

```json
{
  "status": "healthy",
  "nodeId": "a1b2c3d4e5f6g7h8",
  "nodeName": "my-home-node",
  "uptime": "2h 15m 30s",
  "peers": 5,
  "meshStatus": "connected",
  "wireguard": "active"
}
```

### Auto-start on Boot

```bash
# Docker with compose
docker compose up -d  # Already set to restart unless-stopped

# Enable systemd service
sudo systemctl enable forest-node
```

## Monitoring

### View Logs

```bash
# Docker
docker logs -f forest-node

# Systemd
journalctl -u forest-node -f

# Log file
tail -f /var/log/forest/node.log
```

### Check Metrics

```bash
# Prometheus metrics
curl http://localhost:9090/metrics

# Key metrics to watch
curl -s http://localhost:9090/metrics | grep -E "forest_(peers|bandwidth|uptime)"
```

### Dashboard (Optional)

Deploy Grafana for visualization:

```bash
# In your forest-node directory
docker compose --profile monitoring up -d

# Access at http://localhost:3000
# Default: admin/admin
```

### Check Peer Connections

```bash
# Forest CLI
docker exec forest-node forest-cli peers

# WireGuard status
docker exec forest-node wg show

# BATMAN-adv neighbors
docker exec forest-node batctl meshif bat0 neighbors
```

## Security

### Firewall Configuration

The node includes built-in firewall rules. For additional host protection:

```bash
# UFW (Ubuntu)
sudo ufw allow 42000/udp comment "Forest P2P"
sudo ufw allow 51820/udp comment "Forest WireGuard"
sudo ufw enable

# nftables (manual)
sudo nft add rule inet filter input udp dport 42000 accept
sudo nft add rule inet filter input udp dport 51820 accept
```

### Key Security

Your node identity is stored in `/var/lib/forest/keys/`:

```bash
# Backup your keys!
sudo tar czf forest-keys-backup.tar.gz /var/lib/forest/keys

# Secure permissions
sudo chmod 600 /var/lib/forest/keys/*
```

### Updates

Keep your node updated:

```bash
# Docker
docker compose pull
docker compose up -d

# Manual
cd chicago-forest
git pull
npm install
npm run build
sudo systemctl restart forest-node
```

## Troubleshooting

### Node Won't Start

```bash
# Check logs
docker logs forest-node

# Common issues:
# 1. Port already in use
sudo ss -tulpn | grep -E "42000|51820|8080"

# 2. Missing kernel modules
sudo modprobe wireguard
sudo modprobe batman_adv

# 3. Insufficient permissions
# Ensure CAP_NET_ADMIN capability
```

### No Peers Connecting

```bash
# Check port forwarding
# From external device or use online port checker
nc -uvz YOUR.PUBLIC.IP 42000

# Verify WireGuard is listening
sudo wg show

# Check firewall
sudo iptables -L -n
```

### High Resource Usage

```bash
# Check resource usage
docker stats forest-node

# Limit resources in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
```

### Reset Node

```bash
# Stop and remove
docker compose down -v

# Remove data (WARNING: loses identity)
sudo rm -rf /var/lib/forest/*

# Reinstall
docker compose up -d
```

## FAQ

### Q: Is this consuming my bandwidth?

A: In default mode, bandwidth usage is minimal (similar to a VPN). Enabling relay mode will use more bandwidth but is optional.

### Q: Will this increase my electricity bill?

A: A Raspberry Pi or mini PC uses 5-15W, costing roughly $1-3/month in electricity.

### Q: Is my data safe?

A: Your node only routes encrypted traffic. It cannot see the contents of data passing through. Your personal data stays on your devices.

### Q: Do I need a static IP?

A: No, but it helps. The node can work with dynamic IPs, though peers may need to reconnect when your IP changes.

### Q: Can I run multiple nodes?

A: Yes, but each node needs unique ports if on the same network.

### Q: What if the network isn't active yet?

A: Your node will wait for peers and bootstrap nodes. This is a theoretical framework - full network operation is aspirational.

## Getting Help

- **Documentation**: [chicago-forest.network/docs](https://chicago-forest.network/docs) (theoretical)
- **Community**: [discord.gg/chicago-forest](https://discord.gg/chicago-forest) (theoretical)
- **Issues**: [GitHub Issues](https://github.com/vespo92/ChicagoForest.net/issues)

## Next Steps

1. [Configure as Community Gateway](./community-gateway.md) - Share your connection
2. [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions
3. Join the community (theoretical)

---

*Remember: The Chicago Forest Network is a theoretical framework. This guide is educational and demonstrates what a decentralized mesh network deployment could look like.*
