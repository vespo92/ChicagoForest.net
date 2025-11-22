# Chicago Forest Network - Docker Deployment

> **DISCLAIMER**: This is part of an AI-generated theoretical framework for educational and research purposes. The Chicago Forest Network is a conceptual project exploring decentralized energy and mesh networking. This deployment configuration is NOT operational infrastructure.

## Overview

This directory contains Docker deployment configurations for the Chicago Forest Network:

- **Dockerfile.node** - Forest mesh network node
- **Dockerfile.gateway** - Internet bridge/gateway node
- **docker-compose.yml** - Full deployment orchestration
- **entrypoint.sh** - Node initialization script

## Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+
- Linux host with kernel 5.6+ (for WireGuard)
- NET_ADMIN and NET_RAW capabilities

### Basic Node Deployment

```bash
# Clone the repository
git clone https://github.com/chicago-forest/chicago-forest.git
cd chicago-forest/packages/node-deploy/docker

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start the node
docker-compose up -d forest-node

# Check status
docker-compose logs -f forest-node
docker exec forest-node-1 forest-cli status
```

### Gateway Deployment

The gateway provides NAT, DHCP, and DNS services for LAN clients:

```bash
# Enable gateway profile
docker-compose --profile gateway up -d

# Check gateway status
docker exec forest-node-1-gateway forest-cli gateway status
```

### With Monitoring Stack

Deploy with Prometheus and Grafana for metrics:

```bash
# Enable monitoring
docker-compose --profile gateway --profile monitoring up -d

# Access Grafana at http://localhost:3000
# Default credentials: admin/admin
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FOREST_NODE_NAME` | `forest-node-1` | Node identifier |
| `FOREST_INTERFACE` | `eth1` | Network interface for mesh |
| `WAN_INTERFACE` | `eth0` | Internet-facing interface |
| `LAN_INTERFACE` | `eth2` | LAN interface (gateway mode) |
| `ENABLE_FIREWALL` | `true` | Enable Chicago Forest Firewall |
| `ENABLE_RELAY` | `false` | Relay traffic for other nodes |
| `ENABLE_STORAGE` | `false` | Store data for the network |
| `ENABLE_ANONYMOUS_ROUTING` | `false` | Enable onion-style routing |
| `BOOTSTRAP_PEERS` | `` | Comma-separated peer addresses |
| `LOG_LEVEL` | `info` | Logging verbosity |
| `CPU_LIMIT` | `2` | CPU core limit |
| `MEMORY_LIMIT` | `2G` | Memory limit |

### .env Example

```bash
# Node Configuration
FOREST_NODE_NAME=my-forest-node
FOREST_INTERFACE=enp3s0
WAN_INTERFACE=enp2s0

# Features
ENABLE_FIREWALL=true
ENABLE_RELAY=true
ENABLE_STORAGE=false

# Resources
CPU_LIMIT=4
MEMORY_LIMIT=4G

# Bootstrap (theoretical addresses)
BOOTSTRAP_PEERS=10.42.0.1:42000,10.42.0.2:42000

# Monitoring
GRAFANA_PASSWORD=your-secure-password
```

## Network Requirements

### Ports

| Port | Protocol | Service |
|------|----------|---------|
| 42000 | UDP | P2P mesh communication |
| 51820 | UDP | WireGuard tunnel |
| 8080 | TCP | HTTP API |
| 9090 | TCP | Prometheus metrics |
| 53 | TCP/UDP | DNS (gateway only) |
| 67-68 | UDP | DHCP (gateway only) |

### Capabilities

The containers require elevated privileges for network operations:

- `NET_ADMIN` - Network configuration
- `NET_RAW` - Raw socket access
- `SYS_MODULE` - Kernel module loading

### Kernel Modules

These modules are loaded by the entrypoint script:

- `wireguard` - VPN tunnels
- `batman-adv` - Mesh networking
- `tun` - Virtual network devices
- `vxlan` - Overlay networking

## Architecture

```
                    Internet
                        |
                   [WAN: eth0]
                        |
              +-------------------+
              |  Forest Gateway   |
              |   (NAT, DHCP,    |
              |    DNS, Routing)  |
              +-------------------+
              [FOREST: eth1] [LAN: eth2]
                    |              |
        +-----------+----------+   |
        |           |          |   |
   +--------+  +--------+  +--------+
   | Node 1 |  | Node 2 |  | Node 3 |
   +--------+  +--------+  +--------+
        \          |          /
         \         |         /
          +--------+--------+
                   |
          [Chicago Forest Mesh]
          (BATMAN-adv + WireGuard)
```

## Volume Management

### Persistent Data

| Volume | Purpose |
|--------|---------|
| `forest-data` | Node data, peer database |
| `forest-config` | Configuration files |
| `forest-logs` | Application logs |
| `wireguard-keys` | WireGuard keypairs |

### Backup

```bash
# Backup node identity and keys
docker run --rm -v forest-data:/data -v $(pwd):/backup \
    alpine tar czf /backup/forest-backup.tar.gz /data/keys

# Restore
docker run --rm -v forest-data:/data -v $(pwd):/backup \
    alpine tar xzf /backup/forest-backup.tar.gz -C /
```

## Troubleshooting

### Common Issues

**Interface not found:**
```bash
# List available interfaces
ip link show

# Update FOREST_INTERFACE in .env
```

**Kernel module errors:**
```bash
# Check if modules are available
modprobe -n wireguard
modprobe -n batman-adv

# Install if missing (Debian/Ubuntu)
apt install wireguard-tools batctl
```

**Permission denied:**
```bash
# Ensure proper capabilities
docker run --cap-add=NET_ADMIN --cap-add=NET_RAW ...

# Or use privileged mode (not recommended for production)
docker run --privileged ...
```

### Health Checks

```bash
# Check node health
curl http://localhost:8080/health

# Check peer connectivity
docker exec forest-node-1 forest-cli peers

# Check WireGuard status
docker exec forest-node-1 wg show
```

### Logs

```bash
# View all logs
docker-compose logs -f

# Node logs only
docker logs -f forest-node-1

# Filter by level
docker logs forest-node-1 2>&1 | grep ERROR
```

## Building Images

### Build Locally

```bash
# Build node image
docker build -t chicago-forest/forest-node -f Dockerfile.node ../..

# Build gateway image
docker build -t chicago-forest/forest-gateway -f Dockerfile.gateway ../..
```

### Multi-architecture Build

```bash
# Setup buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t ghcr.io/chicago-forest/forest-node:latest \
    -f Dockerfile.node \
    --push \
    ../..
```

## Security Considerations

1. **Key Management**: Node identity keys are stored in `/var/lib/forest/keys`. Ensure proper backup and access controls.

2. **Network Isolation**: Use Docker networks or VLANs to isolate mesh traffic from other services.

3. **Capabilities**: Minimize privileges. Use specific capabilities instead of `--privileged`.

4. **Updates**: Regularly update base images for security patches.

## Contributing

This is part of the Chicago Forest Network theoretical framework. Contributions that improve deployment reliability, security, or documentation are welcome.

## License

MIT License - See repository root for details.

## Related Documentation

- [Home Node Setup Guide](../guides/home-node-setup.md)
- [Community Gateway Guide](../guides/community-gateway.md)
- [Troubleshooting Guide](../guides/troubleshooting.md)
- [Kubernetes Deployment](../kubernetes/README.md)
