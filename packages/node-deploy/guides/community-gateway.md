# Chicago Forest Network - Community Gateway Guide

> **DISCLAIMER**: This is part of an AI-generated theoretical framework for educational and research purposes. The Chicago Forest Network is a conceptual project exploring decentralized energy and mesh networking. This guide describes a theoretical setup - the network is NOT currently operational.

## Overview

A Community Gateway is a Forest node that bridges the mesh network to the internet, providing connectivity for other nodes and local devices. Gateways are the backbone of the Forest network, enabling offline areas to connect.

## What is a Community Gateway?

```
                        Internet
                            |
                      [ISP Router]
                            |
                    [Community Gateway]
                    /       |        \
                   /        |         \
            [Node 1]    [Node 2]    [Local Devices]
                |           |            |
                +-----------+------------+
                      Forest Mesh
```

A gateway provides:
- **Internet Bridge**: Routes Forest traffic to/from the internet
- **NAT/Firewall**: Protects internal nodes from external threats
- **DHCP**: Automatically assigns addresses to joining devices
- **DNS**: Resolves names within the Forest network
- **VPN Endpoint**: Allows remote nodes to connect securely

## Hardware Requirements

### Minimum Specifications

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 4 GB | 8+ GB |
| Storage | 50 GB SSD | 256+ GB NVMe |
| Network | 100 Mbps | 1 Gbps+ |
| NICs | 2 (WAN + LAN) | 3+ (WAN + Forest + LAN) |

### Recommended Hardware

**Option 1: Mini PC / NUC**
- Intel N100/N305 or AMD Ryzen
- 16GB RAM
- 256GB NVMe
- Dual/Triple Ethernet

**Option 2: Used Enterprise Hardware**
- Dell OptiPlex Micro
- HP EliteDesk Mini
- Add USB or PCIe NICs for multiple interfaces

**Option 3: Purpose-built Router Hardware**
- Protectli Vault (4-6 port)
- PC Engines APU4
- QOTOM mini PC with multiple NICs

### Network Interface Setup

For a complete gateway, you need:

| Interface | Purpose | Connection |
|-----------|---------|------------|
| WAN (eth0) | Internet | ISP Router/Modem |
| FOREST (eth1) | Mesh Network | Forest switch/AP |
| LAN (eth2) | Local devices | Home/office LAN |

## Installation

### Method 1: Docker (Recommended)

```bash
# Create gateway directory
mkdir -p ~/forest-gateway && cd ~/forest-gateway

# Download gateway compose file
curl -LO https://raw.githubusercontent.com/chicago-forest/chicago-forest/main/packages/node-deploy/docker/docker-compose.yml

# Create gateway environment
cat > .env << EOF
FOREST_NODE_NAME=community-gateway-1
NETWORK_MODE=host
GATEWAY_MODE=true

# Interfaces
WAN_INTERFACE=eth0
FOREST_INTERFACE=eth1
LAN_INTERFACE=eth2

# Gateway features
ENABLE_NAT=true
ENABLE_DHCP=true
ENABLE_DNS=true

# DHCP settings
FOREST_SUBNET=10.42.0.0/16
DHCP_RANGE_START=10.42.1.100
DHCP_RANGE_END=10.42.1.200

# Resources
GATEWAY_CPU_LIMIT=4
GATEWAY_MEMORY_LIMIT=4G
EOF

# Start gateway
docker compose --profile gateway up -d
```

### Method 2: Ansible

```bash
# Clone repository
git clone https://github.com/chicago-forest/chicago-forest.git
cd chicago-forest/packages/node-deploy/ansible

# Create gateway inventory
cat > inventory.yml << EOF
all:
  hosts:
    gateway:
      ansible_host: localhost
      ansible_connection: local
  vars:
    mesh_role: gateway
    forest_interface: eth1
    wan_interface: eth0
    lan_interface: eth2
EOF

# Run playbooks
ansible-playbook -i inventory.yml playbooks/install-node.yml
ansible-playbook -i inventory.yml playbooks/configure-mesh.yml
```

### Method 3: Virtual Machine (OPNsense/pfSense)

For maximum control, run a dedicated firewall VM:

```bash
# Download OPNsense ISO
wget https://mirror.ams1.nl.leaseweb.net/opnsense/releases/latest/OPNsense-latest-amd64.iso

# Create VM with QEMU (example)
qemu-system-x86_64 \
    -name "forest-gateway" \
    -m 4096 \
    -smp 4 \
    -enable-kvm \
    -drive file=gateway.qcow2,format=qcow2 \
    -cdrom OPNsense-latest-amd64.iso \
    -netdev bridge,id=wan,br=br-wan \
    -device virtio-net-pci,netdev=wan \
    -netdev bridge,id=forest,br=br-forest \
    -device virtio-net-pci,netdev=forest \
    -netdev bridge,id=lan,br=br-lan \
    -device virtio-net-pci,netdev=lan
```

## Configuration

### Network Interface Configuration

#### System Network Setup (Ubuntu/Debian)

```bash
# /etc/netplan/01-forest-gateway.yaml
network:
  version: 2
  ethernets:
    # WAN - DHCP from ISP
    eth0:
      dhcp4: true

    # FOREST - Static IP for mesh
    eth1:
      addresses:
        - 10.42.1.1/16
      routes:
        - to: 10.42.0.0/16
          via: 10.42.1.1

    # LAN - Local network
    eth2:
      addresses:
        - 192.168.42.1/24
```

Apply: `sudo netplan apply`

### Gateway Configuration

#### /etc/forest/gateway.yaml

```yaml
# Chicago Forest Network Gateway Configuration

gateway:
  mode: full          # full, bridge, or relay
  name: community-gateway-1

# Interface mapping
interfaces:
  wan: eth0           # Internet connection
  forest: eth1        # Forest mesh network
  lan: eth2           # Local devices

# NAT Configuration
nat:
  enabled: true
  masquerade:
    - interface: eth0
      source: 10.42.0.0/16

# DHCP Server
dhcp:
  enabled: true
  interface: eth1
  range:
    start: 10.42.1.100
    end: 10.42.1.200
  lease_time: 12h
  options:
    router: 10.42.1.1
    dns: 10.42.1.1
    domain: forest.local

# DNS Server
dns:
  enabled: true
  upstream:
    - 1.1.1.1
    - 8.8.8.8
  local_domain: forest.local
  cache_size: 10000

# WireGuard VPN Server
vpn:
  enabled: true
  port: 51820
  subnet: 10.42.2.0/24
  dns: 10.42.1.1

# Traffic Shaping (optional)
qos:
  enabled: false
  download_limit: 100Mbps
  upload_limit: 20Mbps
  priority:
    high: [42000, 51820]  # P2P and VPN
    normal: [80, 443]      # Web traffic

# Firewall
firewall:
  enabled: true
  default_policy: drop
  rules:
    - name: allow-established
      action: accept
      state: established,related

    - name: allow-p2p
      action: accept
      protocol: udp
      port: 42000
      interface: any

    - name: allow-wireguard
      action: accept
      protocol: udp
      port: 51820
      interface: eth0

    - name: allow-forest-all
      action: accept
      interface: eth1

    - name: allow-lan-all
      action: accept
      interface: eth2
```

### Firewall Rules

The gateway automatically configures these rules:

```bash
# View current rules
sudo nft list ruleset

# Or via CLI
docker exec forest-gateway forest-cli firewall show
```

#### Manual nftables Configuration

```nft
# /etc/nftables.conf
#!/usr/sbin/nft -f

flush ruleset

table inet forest_gateway {
    chain input {
        type filter hook input priority 0; policy drop;

        # Established connections
        ct state established,related accept

        # Loopback
        iif lo accept

        # ICMP
        ip protocol icmp accept
        ip6 nexthdr icmpv6 accept

        # Forest interface - trust
        iifname "eth1" accept

        # LAN interface - trust
        iifname "eth2" accept

        # WAN - specific services only
        iifname "eth0" {
            udp dport 42000 accept  # P2P
            udp dport 51820 accept  # WireGuard
        }
    }

    chain forward {
        type filter hook forward priority 0; policy drop;

        ct state established,related accept

        # Forest to WAN (internet access)
        iifname "eth1" oifname "eth0" accept

        # LAN to WAN
        iifname "eth2" oifname "eth0" accept

        # Forest to LAN and vice versa
        iifname "eth1" oifname "eth2" accept
        iifname "eth2" oifname "eth1" accept
    }

    chain output {
        type filter hook output priority 0; policy accept;
    }
}

table ip forest_nat {
    chain postrouting {
        type nat hook postrouting priority 100;
        oifname "eth0" masquerade
    }
}
```

## Running the Gateway

### Start Services

```bash
# Docker
docker compose --profile gateway up -d

# Check status
docker compose ps
docker logs forest-gateway
```

### Verify Services

```bash
# Check DHCP
docker exec forest-gateway cat /var/lib/dhcp/dhcpd.leases

# Check DNS
dig @10.42.1.1 forest.local

# Check NAT
docker exec forest-gateway iptables -t nat -L -n

# Check WireGuard
docker exec forest-gateway wg show
```

### Monitor Traffic

```bash
# Real-time traffic
docker exec forest-gateway iftop -i eth1

# Connection tracking
docker exec forest-gateway conntrack -L

# Bandwidth usage
docker exec forest-gateway vnstat -i eth1
```

## Adding VPN Clients

Allow remote nodes or users to connect via WireGuard:

### Generate Client Config

```bash
# Generate client keys
wg genkey | tee client1.key | wg pubkey > client1.pub

# Add peer to gateway
docker exec forest-gateway wg set wg-forest peer $(cat client1.pub) \
    allowed-ips 10.42.2.2/32

# Generate client config
cat > client1.conf << EOF
[Interface]
PrivateKey = $(cat client1.key)
Address = 10.42.2.2/32
DNS = 10.42.1.1

[Peer]
PublicKey = $(docker exec forest-gateway cat /var/lib/forest/keys/wireguard.pub)
Endpoint = YOUR_PUBLIC_IP:51820
AllowedIPs = 10.42.0.0/16
PersistentKeepalive = 25
EOF
```

### Client Connection

```bash
# On client device
sudo wg-quick up ./client1.conf

# Verify
wg show
ping 10.42.1.1
```

## High Availability

For critical community infrastructure, deploy redundant gateways:

### Active-Passive Setup

```yaml
# On primary gateway
gateway:
  ha:
    mode: primary
    vrrp_id: 42
    priority: 100
    virtual_ip: 10.42.1.1

# On backup gateway
gateway:
  ha:
    mode: backup
    vrrp_id: 42
    priority: 50
    virtual_ip: 10.42.1.1
```

### Load Balancing

For high-traffic deployments:

```yaml
gateway:
  ha:
    mode: loadbalanced
    peers:
      - 10.42.1.2
      - 10.42.1.3
    algorithm: round-robin
```

## Security Considerations

### Hardening Checklist

- [ ] Change default passwords
- [ ] Disable unused services
- [ ] Enable automatic updates
- [ ] Configure intrusion detection
- [ ] Set up log monitoring
- [ ] Regular security audits

### Intrusion Detection (Optional)

```bash
# Install Suricata
apt install suricata

# Configure for Forest interfaces
cat >> /etc/suricata/suricata.yaml << EOF
af-packet:
  - interface: eth0
  - interface: eth1
EOF

# Start
systemctl enable suricata
systemctl start suricata
```

### Monitoring and Alerts

```bash
# Simple uptime monitoring
curl -X POST https://heartbeat.monitoring.service/forest-gateway

# Prometheus alerting
docker exec forest-gateway curl -s localhost:9090/metrics | \
    grep forest_gateway_
```

## Troubleshooting

### No Internet for Forest Nodes

```bash
# Check NAT is working
docker exec forest-gateway iptables -t nat -L POSTROUTING -n

# Check IP forwarding
cat /proc/sys/net/ipv4/ip_forward  # Should be 1

# Test routing
docker exec forest-gateway traceroute 8.8.8.8
```

### DHCP Not Working

```bash
# Check DHCP server status
docker exec forest-gateway systemctl status isc-dhcp-server

# View DHCP logs
docker exec forest-gateway journalctl -u isc-dhcp-server

# Manual test
sudo dhclient -v eth1
```

### DNS Resolution Failing

```bash
# Test DNS server
dig @10.42.1.1 google.com

# Check dnsmasq
docker exec forest-gateway systemctl status dnsmasq

# View DNS cache
docker exec forest-gateway kill -USR1 $(pidof dnsmasq)
docker exec forest-gateway journalctl -u dnsmasq | tail -50
```

### Performance Issues

```bash
# Check CPU usage
docker stats forest-gateway

# Check network throughput
docker exec forest-gateway iperf3 -s &
# From another node:
iperf3 -c 10.42.1.1

# Check for packet drops
docker exec forest-gateway netstat -i
```

## FAQ

### Q: How much bandwidth does a gateway need?

A: Depends on connected nodes. Each active node uses 1-10 Mbps typically. A community gateway should have at least 100 Mbps.

### Q: Can I run a gateway on a Raspberry Pi?

A: Not recommended for full gateway mode due to limited network performance. Pi works better as a relay node.

### Q: Do I need a static IP?

A: Highly recommended. Use a static IP or reliable DDNS service so nodes can find your gateway.

### Q: Is my internet usage visible?

A: The gateway only routes encrypted traffic. Content is not visible to the gateway operator.

### Q: What's the liability for running a gateway?

A: This is a theoretical framework. Consult local laws regarding network services before operating real infrastructure.

## Next Steps

1. [Home Node Setup](./home-node-setup.md) - Basic node deployment
2. [Troubleshooting](./troubleshooting.md) - Common issues
3. Monitor your gateway health
4. Connect with other gateway operators (theoretical)

---

*The Chicago Forest Network is a theoretical framework. This guide demonstrates what community-owned network infrastructure could look like.*
