# Chicago Forest Network - Ansible Deployment

**DISCLAIMER: This is part of an AI-generated theoretical framework for educational and research purposes. The Chicago Forest Network is a conceptual project exploring decentralized community mesh networks. No operational network currently exists.**

## Overview

This directory contains Ansible playbooks for automated deployment and configuration of Chicago Forest Network nodes. The playbooks support various deployment scenarios from single home nodes to multi-node community mesh networks.

## Prerequisites

- Ansible 2.12 or higher
- SSH access to target nodes with sudo privileges
- Target systems running Debian 11+, Ubuntu 22.04+, or Raspberry Pi OS
- Python 3.8+ on control machine

### Installation

```bash
# Install Ansible
pip install ansible

# Clone the repository
git clone https://github.com/vespo92/ChicagoForest.net.git
cd ChicagoForest.net/packages/node-deploy/ansible

# Install required collections
ansible-galaxy collection install -r requirements.yml
```

## Quick Start

### 1. Create Your Inventory

Copy the example inventory and customize it for your network:

```bash
cp inventory.example.yml inventory.yml
```

Edit `inventory.yml` with your node information:

```yaml
all:
  children:
    forest_nodes:
      hosts:
        node1:
          ansible_host: 192.168.1.100
          forest_ip: 10.42.1.1
          role: gateway
        node2:
          ansible_host: 192.168.1.101
          forest_ip: 10.42.1.2
          role: node
```

### 2. Run the Installation Playbook

```bash
# Install on all nodes
ansible-playbook -i inventory.yml playbooks/install-node.yml

# Install on specific nodes
ansible-playbook -i inventory.yml playbooks/install-node.yml --limit node1

# Dry run first
ansible-playbook -i inventory.yml playbooks/install-node.yml --check
```

### 3. Configure the Mesh Network

```bash
# Configure mesh on all nodes
ansible-playbook -i inventory.yml playbooks/configure-mesh.yml

# Configure WireGuard only
ansible-playbook -i inventory.yml playbooks/configure-mesh.yml --tags wireguard
```

## Playbooks

### install-node.yml

Installs all required software and creates node identity.

**What it does:**
- Updates system packages
- Installs Docker, WireGuard, batctl, and dependencies
- Creates forest user and directories
- Generates node identity and WireGuard keys
- Sets up kernel parameters for mesh networking
- Creates systemd service for forest node

**Tags:**
- `preflight` - System compatibility checks
- `system` - System packages and user creation
- `directories` - Create required directories
- `kernel` - Kernel module and sysctl configuration
- `docker` - Docker installation
- `identity` - Node identity generation
- `config` - Configuration files
- `service` - Systemd service setup
- `verify` - Verification steps

**Variables:**
```yaml
forest_node_name: "forest-node-{{ ansible_hostname }}"
forest_interface: "eth1"
enable_firewall: true
enable_relay: false
enable_storage: false
enable_docker: true
```

### configure-mesh.yml

Configures BATMAN-adv mesh networking and WireGuard tunnels.

**What it does:**
- Configures BATMAN-adv mesh interface
- Sets up WireGuard interfaces and peer connections
- Creates bridge interfaces for gateway nodes
- Configures nftables firewall rules
- Creates persistent network configuration

**Tags:**
- `batman` - BATMAN-adv configuration
- `wireguard` - WireGuard VPN setup
- `peers` - Peer connection configuration
- `bridge` - Bridge interface (gateway only)
- `firewall` - Firewall rules
- `network` - Network persistence scripts
- `verify` - Verification and status

**Variables:**
```yaml
mesh_interface: "bat0"
mesh_protocol: "BATMAN_V"
wireguard_interface: "wg-forest"
wireguard_port: 51820
mesh_role: "node"  # or "gateway", "relay"
```

### update-network.yml

Updates existing nodes with new configurations or software versions.

**What it does:**
- Pulls latest Docker images
- Updates peer configurations
- Refreshes firewall rules
- Applies new kernel parameters

**Tags:**
- `update` - Full update
- `peers` - Update peer connections only
- `firewall` - Update firewall only
- `docker` - Update Docker images only

## Inventory Configuration

### Full Example

```yaml
all:
  vars:
    # Global variables
    forest_subnet: "10.42.0.0/16"
    docker_image: "ghcr.io/chicago-forest/forest-node:latest"
    wireguard_port: 51820

  children:
    # Gateway nodes (connect to internet)
    forest_gateways:
      hosts:
        gateway1:
          ansible_host: 192.168.1.10
          forest_ip: 10.42.0.1
          role: gateway
          wan_interface: eth0
          forest_interface: eth1

    # Regular mesh nodes
    forest_nodes:
      hosts:
        node1:
          ansible_host: 192.168.1.100
          forest_ip: 10.42.1.1
          role: node
        node2:
          ansible_host: 192.168.1.101
          forest_ip: 10.42.1.2
          role: node
        node3:
          ansible_host: 192.168.1.102
          forest_ip: 10.42.1.3
          role: relay
          enable_relay: true

    # Raspberry Pi nodes
    forest_pi_nodes:
      hosts:
        pi-north:
          ansible_host: 192.168.1.200
          forest_ip: 10.42.2.1
          role: node
          ansible_user: pi
        pi-south:
          ansible_host: 192.168.1.201
          forest_ip: 10.42.2.2
          role: node
          ansible_user: pi
```

### Role Definitions

| Role | Description | Features |
|------|-------------|----------|
| `gateway` | Internet gateway node | NAT, DHCP, bridge to WAN |
| `node` | Standard mesh node | Basic mesh participation |
| `relay` | High-capacity relay | Storage, high connection limits |

## Advanced Usage

### Custom Variables

Override variables on the command line:

```bash
ansible-playbook -i inventory.yml playbooks/install-node.yml \
  -e "forest_node_name=my-special-node" \
  -e "enable_relay=true" \
  -e "enable_storage=true"
```

### Limit to Specific Hosts

```bash
# Single host
ansible-playbook -i inventory.yml playbooks/configure-mesh.yml --limit node1

# Multiple hosts
ansible-playbook -i inventory.yml playbooks/configure-mesh.yml --limit "node1,node2"

# Group of hosts
ansible-playbook -i inventory.yml playbooks/configure-mesh.yml --limit forest_gateways
```

### Verbose Output

```bash
# Verbose
ansible-playbook -i inventory.yml playbooks/install-node.yml -v

# Very verbose
ansible-playbook -i inventory.yml playbooks/install-node.yml -vv

# Debug
ansible-playbook -i inventory.yml playbooks/install-node.yml -vvv
```

## Troubleshooting

### Common Issues

**SSH Connection Failed**
```bash
# Test connectivity
ansible -i inventory.yml all -m ping

# Check SSH keys
ssh-copy-id user@node-ip
```

**Permission Denied**
```bash
# Ensure sudo access
ansible -i inventory.yml all -m shell -a "sudo whoami" -b
```

**Module Not Found**
```bash
# Check kernel modules
ansible -i inventory.yml all -m shell -a "modprobe -c | grep batman" -b
```

### Verification Commands

After deployment, verify on each node:

```bash
# Check mesh interface
ip link show bat0
batctl meshif bat0 neighbors
batctl meshif bat0 originators

# Check WireGuard
wg show wg-forest

# Check Docker
docker ps
docker logs forest-node

# Check firewall
nft list ruleset

# Check services
systemctl status forest-node
systemctl status wg-quick@wg-forest
```

## Security Notes

- **Private keys** are generated on target nodes and never transmitted
- **Firewall rules** restrict access to mesh traffic only
- **WireGuard** provides encrypted tunnels between nodes
- All traffic between nodes is encrypted

## Contributing

Contributions to improve the deployment automation are welcome. Please ensure:

1. Playbooks work on Debian 11+, Ubuntu 22.04+, and Raspberry Pi OS
2. All changes are tested with `ansible-lint`
3. Documentation is updated for new features

## License

This project is part of the Chicago Forest Network theoretical framework and is provided for educational purposes only.
