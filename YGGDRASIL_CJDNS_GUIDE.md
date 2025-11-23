# Yggdrasil & CJDNS Mesh Overlay Guide

> **Infrastructure Layer**: Real mesh networks you can join today

This guide covers setting up encrypted mesh overlay networks using **Yggdrasil** and **CJDNS** - two production-ready, decentralized networking protocols that form the infrastructure layer of the Chicago Plasma Forest Network.

---

## Table of Contents

1. [Overview](#overview)
2. [Yggdrasil Network](#yggdrasil-network)
3. [CJDNS Network](#cjdns-network)
4. [Public Peer Lists](#public-peer-lists)
5. [Quick Start Scripts](#quick-start-scripts)
6. [Network Integration](#network-integration)
7. [Troubleshooting](#troubleshooting)
8. [Community Resources](#community-resources)

---

## Overview

### Why Mesh Overlays?

| Feature | Yggdrasil | CJDNS |
|---------|-----------|-------|
| **Protocol** | Spanning tree routing | DHT-based routing |
| **Encryption** | End-to-end (Curve25519) | End-to-end (NaCl) |
| **Address** | IPv6 (200::/7 or 300::/8) | IPv6 (fc00::/8) |
| **Discovery** | Multicast + manual peers | Manual peers only |
| **Maturity** | Active development | Stable, established |
| **Best For** | Dynamic mesh, easy setup | Static infrastructure |

### Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Applications                             │
│              (SSH, HTTP, IPFS, Services)                   │
├────────────────────────────────────────────────────────────┤
│                 Overlay Network (Layer 4)                   │
│         ┌─────────────────┬─────────────────┐              │
│         │   Yggdrasil     │     CJDNS       │              │
│         │   200::/7       │    fc00::/8     │              │
│         └─────────────────┴─────────────────┘              │
├────────────────────────────────────────────────────────────┤
│                Physical Transport Layer                     │
│    (Internet, WiFi Mesh, Ethernet, LoRa, WireGuard)        │
└────────────────────────────────────────────────────────────┘
```

---

## Yggdrasil Network

### What is Yggdrasil?

Yggdrasil is an encrypted IPv6 overlay network that provides:
- **Cryptographic addressing**: Your IPv6 address is derived from your public key
- **End-to-end encryption**: All traffic is encrypted between nodes
- **Decentralized routing**: No central servers, uses spanning tree
- **Automatic peer discovery**: Finds peers on local network via multicast
- **Works anywhere**: Runs over any IP transport (internet, mesh, VPN)

**Official Site**: https://yggdrasil-network.github.io/

### Installation

#### Debian/Ubuntu
```bash
# Add repository
sudo apt-get install -y dirmngr
gpg --fetch-keys https://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/key.txt
gpg --export 569130E8CA20FBC4CB3FDE555898470A764B32C9 | sudo apt-key add -
echo 'deb http://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/ debian yggdrasil' | \
  sudo tee /etc/apt/sources.list.d/yggdrasil.list

# Install
sudo apt-get update
sudo apt-get install -y yggdrasil
```

#### Fedora/RHEL
```bash
sudo dnf copr enable neilalexander/yggdrasil-go
sudo dnf install yggdrasil
```

#### macOS
```bash
brew install yggdrasil
```

#### Windows
Download from: https://github.com/yggdrasil-network/yggdrasil-go/releases

#### Docker
```bash
docker run -d --name yggdrasil \
  --cap-add NET_ADMIN \
  --device /dev/net/tun \
  -v yggdrasil-config:/etc/yggdrasil \
  ghcr.io/yggdrasil-network/yggdrasil-go:latest
```

### Configuration

#### Generate Initial Config
```bash
# Generate config file
sudo yggdrasil -genconf | sudo tee /etc/yggdrasil/yggdrasil.conf

# View your IPv6 address (derived from public key)
sudo yggdrasil -useconf < /etc/yggdrasil/yggdrasil.conf -address
```

#### Configure Public Peers
Edit `/etc/yggdrasil/yggdrasil.conf`:

```json
{
  "Peers": [
    "tls://ygg.mkg20001.io:443",
    "tls://supergay.network:443",
    "tls://ygg.ace.ctrl-c.liu.se:9999",
    "tcp://51.15.118.10:62486",
    "tls://51.38.64.12:28395"
  ],
  "InterfacePeers": {},
  "Listen": [
    "tcp://0.0.0.0:9001",
    "tls://0.0.0.0:9002"
  ],
  "MulticastInterfaces": [
    {
      "Regex": ".*",
      "Beacon": true,
      "Listen": true,
      "Port": 9001,
      "Priority": 0
    }
  ]
}
```

#### Start Service
```bash
# Enable and start
sudo systemctl enable yggdrasil
sudo systemctl start yggdrasil

# Check status
sudo systemctl status yggdrasil

# View logs
sudo journalctl -u yggdrasil -f
```

### Verify Connectivity

```bash
# Check your Yggdrasil address
yggdrasilctl getSelf

# Example output:
# IPv6 address: 200:abcd:1234:5678:90ab:cdef:1234:5678
# IPv6 subnet: 300:abcd:1234:5678::/64
# Public key: 0123456789abcdef...

# List connected peers
yggdrasilctl getPeers

# Ping another Yggdrasil node
ping6 200:1234:5678:90ab:cdef:1234:5678:90ab

# Check routing table
yggdrasilctl getDHT
```

### Yggdrasil Services

Once connected, you can access services on the Yggdrasil network:

| Service | Address | Description |
|---------|---------|-------------|
| Yggdrasil Map | http://[21e:e795:8e82:a9e2:571d:3437:97c7:e1cc]/ | Network visualization |
| IPFS Gateway | Various nodes | Distributed file access |
| Hidden Services | fc00/8 addresses | Decentralized websites |

---

## CJDNS Network

### What is CJDNS?

CJDNS (Caleb James DeLisle's Network Suite) is an encrypted IPv6 network featuring:
- **fc00::/8 addressing**: Uses ULA (Unique Local Address) space
- **Source routing**: Packets carry their own route
- **DHT-based discovery**: Distributed peer lookup
- **Whitelist-based**: Peers must exchange credentials

**Official Repo**: https://github.com/cjdelisle/cjdns

### Installation

#### From Source (Recommended)
```bash
# Install dependencies
sudo apt-get install -y nodejs build-essential python3

# Clone and build
git clone https://github.com/cjdelisle/cjdns.git
cd cjdns
./do

# Install
sudo cp cjdroute /usr/local/bin/
sudo mkdir -p /etc/cjdns
```

#### Generate Configuration
```bash
# Generate config
cjdroute --genconf | sudo tee /etc/cjdns/cjdroute.conf

# Your IPv6 address will be in the config:
grep '"ipv6"' /etc/cjdns/cjdroute.conf
# Example: fc12:3456:789a:bcde:f012:3456:789a:bcde
```

### Peer Exchange

CJDNS requires explicit peer credentials. To connect to another node:

1. **Share your credentials** (from `cjdroute.conf`):
```json
{
  "publicKey": "your-public-key.k",
  "ipv6": "fc12:3456:789a:bcde:f012:3456:789a:bcde"
}
```

2. **Add their credentials** to your `connectTo` section:
```json
"connectTo": {
  "192.168.1.100:12345": {
    "login": "default-login",
    "password": "their-password",
    "publicKey": "their-public-key.k"
  }
}
```

### CJDNS Service

Create systemd service at `/etc/systemd/system/cjdns.service`:
```ini
[Unit]
Description=CJDNS Encrypted Network
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/cjdroute < /etc/cjdns/cjdroute.conf
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable cjdns
sudo systemctl start cjdns
```

### Hyperboria Network

CJDNS powers the **Hyperboria** network - a global mesh of interconnected nodes:
- **Website**: https://hyperboria.net/
- **Peer finder**: https://peers.fc00.io/
- **IRC**: irc.fc00.io (on the network)

---

## Public Peer Lists

### Yggdrasil Public Peers

**Official list**: https://github.com/yggdrasil-network/public-peers

#### North America
```json
"Peers": [
  "tcp://167.160.89.98:7040",
  "tls://167.160.89.98:7041",
  "tcp://44.234.134.124:443",
  "tls://longseason.1200bps.xyz:13121"
]
```

#### Europe
```json
"Peers": [
  "tls://ygg.mkg20001.io:443",
  "tls://51.38.64.12:28395",
  "tcp://51.15.118.10:62486",
  "tls://ygg.ace.ctrl-c.liu.se:9999",
  "tls://supergay.network:443"
]
```

#### Asia-Pacific
```json
"Peers": [
  "tls://108.175.10.127:61216",
  "tcp://[2001:41d0:801:2000::233f]:6010"
]
```

### CJDNS Public Peers

**Peer finder**: https://peers.fc00.io/

CJDNS peers require credential exchange. Visit the peer finder or:
- Reddit: r/darknetplan
- Matrix: #cjdns:matrix.org
- IRC: #cjdns on EFnet

---

## Quick Start Scripts

### Yggdrasil Quick Install
```bash
#!/bin/bash
# yggdrasil-quick-install.sh
# Join the Yggdrasil network in under 2 minutes

set -e

echo "Installing Yggdrasil..."

# Detect package manager
if command -v apt-get &> /dev/null; then
    # Debian/Ubuntu
    gpg --fetch-keys https://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/key.txt 2>/dev/null
    gpg --export 569130E8CA20FBC4CB3FDE555898470A764B32C9 | sudo apt-key add - 2>/dev/null
    echo 'deb http://neilalexander.s3.dualstack.eu-west-2.amazonaws.com/deb/ debian yggdrasil' | \
      sudo tee /etc/apt/sources.list.d/yggdrasil.list
    sudo apt-get update -qq
    sudo apt-get install -y yggdrasil
elif command -v dnf &> /dev/null; then
    # Fedora
    sudo dnf copr enable -y neilalexander/yggdrasil-go
    sudo dnf install -y yggdrasil
elif command -v brew &> /dev/null; then
    # macOS
    brew install yggdrasil
else
    echo "Unsupported package manager. Visit: https://yggdrasil-network.github.io/installation.html"
    exit 1
fi

# Generate config if needed
if [ ! -f /etc/yggdrasil/yggdrasil.conf ]; then
    sudo mkdir -p /etc/yggdrasil
    sudo yggdrasil -genconf | sudo tee /etc/yggdrasil/yggdrasil.conf > /dev/null
fi

# Add public peers
sudo python3 << 'PYTHON'
import json

config_path = "/etc/yggdrasil/yggdrasil.conf"
with open(config_path, "r") as f:
    config = json.load(f)

public_peers = [
    "tls://ygg.mkg20001.io:443",
    "tls://supergay.network:443",
    "tcp://51.15.118.10:62486",
    "tls://51.38.64.12:28395",
    "tls://ygg.ace.ctrl-c.liu.se:9999"
]

config["Peers"] = list(set(config.get("Peers", []) + public_peers))

with open(config_path, "w") as f:
    json.dump(config, f, indent=2)

print(f"Added {len(public_peers)} public peers")
PYTHON

# Start service
sudo systemctl enable yggdrasil
sudo systemctl restart yggdrasil

# Display info
sleep 2
echo ""
echo "=== Yggdrasil Connected ==="
yggdrasilctl getSelf 2>/dev/null | grep -E "(IPv6 address|Public key)" || echo "Connecting..."
echo ""
echo "Peers:"
yggdrasilctl getPeers 2>/dev/null | head -10 || echo "Finding peers..."
echo ""
echo "You're now part of the Yggdrasil network!"
```

### CJDNS Quick Install
```bash
#!/bin/bash
# cjdns-quick-install.sh
# Build and install CJDNS from source

set -e

echo "Installing CJDNS..."

# Install build dependencies
sudo apt-get update
sudo apt-get install -y nodejs build-essential python3 git

# Clone and build
cd /tmp
rm -rf cjdns
git clone https://github.com/cjdelisle/cjdns.git
cd cjdns
./do

# Install
sudo cp cjdroute /usr/local/bin/
sudo mkdir -p /etc/cjdns

# Generate config
if [ ! -f /etc/cjdns/cjdroute.conf ]; then
    cjdroute --genconf | sudo tee /etc/cjdns/cjdroute.conf > /dev/null
fi

# Create systemd service
sudo tee /etc/systemd/system/cjdns.service > /dev/null << 'EOF'
[Unit]
Description=CJDNS Encrypted Network
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/cjdroute < /etc/cjdns/cjdroute.conf
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl enable cjdns
sudo systemctl start cjdns

# Display info
echo ""
echo "=== CJDNS Installed ==="
grep '"ipv6"' /etc/cjdns/cjdroute.conf
echo ""
echo "To connect to peers, exchange credentials at: https://peers.fc00.io/"
```

---

## Network Integration

### Running Both Networks

You can run Yggdrasil and CJDNS simultaneously. They use different address ranges:
- **Yggdrasil**: `200::/7` and `300::/8`
- **CJDNS**: `fc00::/8`

### Integration with Chicago Forest Network

The Chicago Plasma Forest Network uses these overlays as the encrypted transport layer:

```
┌─────────────────────────────────────────────────┐
│           CFN Application Layer                  │
│        (Energy services, monitoring)            │
├─────────────────────────────────────────────────┤
│            CFN Address Layer                     │
│         cfn:geohash:nodeid:port                 │
├─────────────────────────────────────────────────┤
│           Overlay Networks                       │
│  ┌─────────────┐      ┌─────────────┐          │
│  │  Yggdrasil  │      │    CJDNS    │          │
│  │  200::/7    │  OR  │   fc00::/8  │          │
│  └─────────────┘      └─────────────┘          │
├─────────────────────────────────────────────────┤
│         B.A.T.M.A.N. Layer 2 Mesh               │
│        (Local wireless routing)                 │
├─────────────────────────────────────────────────┤
│              Physical Layer                      │
│     (WiFi, Ethernet, LoRa, Internet)            │
└─────────────────────────────────────────────────┘
```

### WireGuard Bridge

For sites needing additional security or SD-WAN capabilities:

```bash
# Create WireGuard interface that routes Yggdrasil traffic
wg genkey | tee /etc/wireguard/privatekey | wg pubkey > /etc/wireguard/publickey

cat > /etc/wireguard/wg-mesh.conf << EOF
[Interface]
PrivateKey = $(cat /etc/wireguard/privatekey)
Address = 10.200.0.1/24
ListenPort = 51820

[Peer]
PublicKey = PEER_PUBLIC_KEY
AllowedIPs = 200::/7, 300::/8, fc00::/8
Endpoint = peer.example.com:51820
PersistentKeepalive = 25
EOF
```

---

## Troubleshooting

### Yggdrasil

**No peers connecting:**
```bash
# Check if service is running
sudo systemctl status yggdrasil

# Verify config syntax
sudo yggdrasil -useconf < /etc/yggdrasil/yggdrasil.conf -verifyconf

# Check firewall (allow TCP/TLS ports)
sudo ufw allow 9001/tcp
sudo ufw allow 9002/tcp

# Test specific peer
nc -zv ygg.mkg20001.io 443
```

**Multicast not working:**
```bash
# Enable multicast on interface
sudo ip link set eth0 multicast on

# Check multicast groups
ip maddr show
```

### CJDNS

**No connectivity:**
```bash
# Check TUN interface
ip addr show tun0

# Verify cjdroute is running
pgrep cjdroute

# Check logs
journalctl -u cjdns -f
```

**Peer not connecting:**
```bash
# Verify credentials match exactly
# Check firewall allows UDP to peer port
# Ensure both sides have each other's credentials
```

---

## Community Resources

### Yggdrasil

| Resource | Link |
|----------|------|
| Documentation | https://yggdrasil-network.github.io/ |
| GitHub | https://github.com/yggdrasil-network/yggdrasil-go |
| Public Peers | https://github.com/yggdrasil-network/public-peers |
| Matrix Chat | #yggdrasil:matrix.org |
| Reddit | r/yggdrasil |

### CJDNS / Hyperboria

| Resource | Link |
|----------|------|
| GitHub | https://github.com/cjdelisle/cjdns |
| Hyperboria | https://hyperboria.net/ |
| Peer Finder | https://peers.fc00.io/ |
| Reddit | r/darknetplan |
| Matrix | #cjdns:matrix.org |

### Chicago Forest Network

| Resource | Link |
|----------|------|
| Website | https://chicagoforest.net/ |
| GitHub | https://github.com/vespo92/ChicagoForest.net |
| Discord | https://discord.gg/chicagoforest |

---

## Summary

Both Yggdrasil and CJDNS are **real, operational mesh overlay networks** that you can join today. They provide:

- **Encrypted transport**: All traffic is end-to-end encrypted
- **Decentralized routing**: No central authority controls the network
- **Resilient connectivity**: Traffic routes around failures
- **Privacy**: Your IP is derived from cryptographic keys

For the Chicago Plasma Forest Network, we recommend:
- **Yggdrasil** for new deployments (easier setup, active development)
- **CJDNS** for established infrastructure (stable, battle-tested)
- **Both** for maximum resilience and reach

---

*This guide documents real, operational infrastructure. For the theoretical energy research and conceptual framework, see the main [README.md](README.md) and [PROTOCOL_WHITEPAPER.md](PROTOCOL_WHITEPAPER.md).*
