# @chicago-forest/node-deploy

> Deployment configurations for Chicago Forest Network mesh nodes

**DISCLAIMER:** This is part of an AI-generated theoretical framework for educational and research purposes. The Chicago Forest Network is a conceptual project exploring decentralized mesh networking.

## Overview

This package provides deployment configurations for Chicago Forest Network nodes across multiple platforms:

- **Docker** - Containerized deployment for testing and development
- **Kubernetes** - Production-grade orchestration with NIC passthrough
- **Terraform** - Infrastructure as Code for AWS, GCP, and DigitalOcean
- **Ansible** - Configuration management and fleet updates
- **Cloud-init** - VM provisioning for any cloud provider

## Quick Start

### Docker Deployment (Fastest)

```bash
# Clone the repository
git clone https://github.com/chicago-forest/chicago-forest.git
cd chicago-forest/packages/node-deploy/docker

# Start a mesh node
docker-compose up -d

# Check status
docker logs -f forest-node-1

# Access CLI
docker exec -it forest-node-1 forest-cli status
```

### Kubernetes Deployment

```bash
# Apply namespace and configs
kubectl apply -f kubernetes/

# Check pod status
kubectl get pods -n chicago-forest

# View logs
kubectl logs -n chicago-forest -l app=forest-node
```

## Docker Deployment

### Single Node

```bash
cd packages/node-deploy/docker
docker build -t chicago-forest/forest-node -f Dockerfile.node .
docker run -d \
  --name forest-node \
  --cap-add=NET_ADMIN \
  --cap-add=NET_RAW \
  -p 42000:42000/udp \
  -p 8080:8080 \
  chicago-forest/forest-node
```

### Multi-Node Cluster

```yaml
# docker-compose.yml
version: '3.8'

services:
  node-1:
    image: chicago-forest/forest-node:latest
    network_mode: host
    cap_add:
      - NET_ADMIN
      - NET_RAW
    environment:
      - FOREST_NODE_NAME=node-1
      - BOOTSTRAP_PEERS=node-2:42000,node-3:42000
    volumes:
      - node1-data:/var/lib/forest

  node-2:
    image: chicago-forest/forest-node:latest
    network_mode: host
    cap_add:
      - NET_ADMIN
      - NET_RAW
    environment:
      - FOREST_NODE_NAME=node-2
      - BOOTSTRAP_PEERS=node-1:42000,node-3:42000
    volumes:
      - node2-data:/var/lib/forest

volumes:
  node1-data:
  node2-data:
```

### Gateway Node

The gateway image includes NAT, DHCP, and DNS for sharing internet with mesh clients:

```bash
docker build -t chicago-forest/forest-gateway -f Dockerfile.gateway .
docker run -d \
  --name forest-gateway \
  --privileged \
  --network=host \
  -e WAN_INTERFACE=eth0 \
  -e FOREST_INTERFACE=eth1 \
  chicago-forest/forest-gateway
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes 1.20+
- Multus CNI (for NIC passthrough)
- SR-IOV device plugin (optional, for high performance)

### Basic Deployment

```bash
# Create namespace
kubectl create namespace chicago-forest

# Apply configurations
kubectl apply -f kubernetes/configmaps/
kubectl apply -f kubernetes/node-deployment.yaml
kubectl apply -f kubernetes/gateway-service.yaml
```

### NIC Passthrough Configuration

For direct hardware access, configure Multus CNI:

```yaml
apiVersion: k8s.cni.cncf.io/v1
kind: NetworkAttachmentDefinition
metadata:
  name: forest-mesh-net
  namespace: chicago-forest
spec:
  config: |
    {
      "cniVersion": "0.3.1",
      "type": "macvlan",
      "master": "eth1",
      "mode": "bridge",
      "ipam": {
        "type": "whereabouts",
        "range": "10.42.0.0/16"
      }
    }
```

### SR-IOV for High Performance

```yaml
# Require SR-IOV virtual function
resources:
  limits:
    intel.com/sriov_netdevice: "1"
```

## Terraform Deployment

### AWS

```bash
cd terraform/aws

# Initialize
terraform init

# Plan
terraform plan -var="node_count=3"

# Apply
terraform apply -var="node_count=3"
```

Configuration options in `terraform.tfvars`:

```hcl
# AWS Configuration
region           = "us-east-1"
node_count       = 3
instance_type    = "t3.medium"
enable_gateway   = true
vpc_cidr         = "10.0.0.0/16"
forest_cidr      = "10.42.0.0/16"
```

### GCP

```bash
cd terraform/gcp
terraform init
terraform apply -var="project_id=my-project"
```

### DigitalOcean

```bash
cd terraform/digital-ocean
terraform init
terraform apply -var="do_token=$DIGITALOCEAN_TOKEN"
```

## Ansible Configuration

### Prerequisites

```bash
# Install Ansible
pip install ansible

# Install required collections
ansible-galaxy collection install community.general
ansible-galaxy collection install community.docker
```

### Inventory

Create `inventory.yml`:

```yaml
all:
  children:
    forest_nodes:
      hosts:
        node-1:
          ansible_host: 192.168.1.101
        node-2:
          ansible_host: 192.168.1.102
        node-3:
          ansible_host: 192.168.1.103
    forest_gateways:
      hosts:
        gateway-1:
          ansible_host: 192.168.1.100
          wan_interface: eth0
          forest_interface: eth1
```

### Playbooks

```bash
# Install nodes
ansible-playbook -i inventory.yml ansible/playbooks/install-node.yml

# Configure mesh
ansible-playbook -i inventory.yml ansible/playbooks/configure-mesh.yml

# Update all nodes
ansible-playbook -i inventory.yml ansible/playbooks/update-network.yml
```

## Cloud-Init (VM Deployment)

Use the cloud-init generator for any cloud provider:

```typescript
import { generateCloudInit } from '@chicago-forest/node-deploy';

const config = generateCloudInit({
  nodeName: 'forest-node-1',
  forestInterface: 'eth1',
  enableFirewall: true,
  enableRelay: true,
  enableStorage: false,
});

// Use config as user-data for VM creation
```

## Configuration Reference

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FOREST_NODE_NAME` | Node identifier | hostname |
| `FOREST_INTERFACE` | Mesh network interface | `eth1` |
| `WAN_INTERFACE` | Internet-facing interface | - |
| `ENABLE_FIREWALL` | Enable Chicago Forest Firewall | `true` |
| `ENABLE_RELAY` | Relay traffic for other nodes | `false` |
| `ENABLE_STORAGE` | Store data for the network | `false` |
| `BOOTSTRAP_PEERS` | Comma-separated peer addresses | - |
| `LOG_LEVEL` | Logging verbosity | `info` |

### Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 42000 | UDP | P2P mesh communication |
| 51820 | UDP | WireGuard tunnels |
| 8080 | TCP | REST API |
| 9090 | TCP | Prometheus metrics |

### Resource Requirements

| Role | CPU | Memory | Storage |
|------|-----|--------|---------|
| Minimal node | 0.5 | 512MB | 1GB |
| Standard node | 1 | 1GB | 10GB |
| Gateway | 2 | 2GB | 20GB |
| Storage node | 2 | 4GB | 100GB+ |

## Deployment Guides

### Home Node Setup

See [guides/home-node-setup.md](guides/home-node-setup.md) for detailed instructions on:

- Hardware requirements
- Raspberry Pi setup
- Network configuration
- Initial joining process

### Community Gateway

See [guides/community-gateway.md](guides/community-gateway.md) for:

- Multi-interface configuration
- Internet sharing setup
- Traffic management
- Monitoring and alerting

### Troubleshooting

See [guides/troubleshooting.md](guides/troubleshooting.md) for:

- Common issues and solutions
- Network debugging
- Log analysis
- Recovery procedures

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Chicago Forest Network                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │  Gateway     │────▶│  Relay Node  │────▶│  Edge Node   │        │
│  │  (Internet)  │     │              │     │              │        │
│  └──────────────┘     └──────────────┘     └──────────────┘        │
│         │                    │                    │                 │
│         ▼                    ▼                    ▼                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │  WireGuard   │     │  BATMAN-adv  │     │  P2P Core    │        │
│  │  Tunnels     │     │  Mesh        │     │  Discovery   │        │
│  └──────────────┘     └──────────────┘     └──────────────┘        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Chicago Forest Firewall                    │   │
│  │              (OPNsense-compatible ruleset)                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Security Considerations

### Network Isolation

- Forest network uses dedicated interface
- WireGuard provides encrypted tunnels
- Firewall rules isolate zones

### Key Management

- Node keys stored in `/var/lib/forest/keys`
- Automatic key rotation (configurable)
- No sensitive data in environment variables

### Updates

- Use Ansible for fleet-wide updates
- Rolling updates prevent downtime
- Automatic rollback on failure

## Monitoring

### Prometheus Metrics

Metrics available at `:9090/metrics`:

- `forest_peers_connected` - Number of connected peers
- `forest_bandwidth_bytes` - Bandwidth usage
- `forest_latency_seconds` - Peer latency
- `forest_storage_used_bytes` - Storage utilization

### Health Checks

```bash
# HTTP health endpoint
curl http://localhost:8080/health

# CLI status
docker exec forest-node forest-cli status
```

## Development

### Building from Source

```bash
# Install dependencies
pnpm install

# Build package
pnpm --filter @chicago-forest/node-deploy build

# Run tests
pnpm --filter @chicago-forest/node-deploy test
```

### Local Testing

```bash
# Start local network
docker-compose -f docker/docker-compose.yml up

# Connect to node
docker exec -it forest-node-1 /bin/sh

# View mesh status
batctl o  # BATMAN-adv originators
wg show   # WireGuard tunnels
```

## Related Packages

- `@chicago-forest/hardware-hal` - Hardware specifications and calculators
- `@chicago-forest/p2p-core` - Peer discovery and networking
- `@chicago-forest/wireless-mesh` - Mesh routing protocols
- `@chicago-forest/firewall` - Chicago Forest Firewall

## License

MIT - See LICENSE file for details.

---

**Remember:** This is a THEORETICAL framework for educational purposes. The Chicago Forest Network is not operational infrastructure. Always consult with network professionals before deploying mesh networks.
