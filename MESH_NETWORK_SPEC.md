# Chicago Community Mesh Network (CCMN)
## Technical Specification for Resilient P2P Infrastructure

**Version**: 1.0.0
**Status**: Open Source Implementation Blueprint
**License**: MIT / Apache 2.0 Dual License

---

## Executive Summary

This document specifies a **real, implementable** decentralized mesh network system designed to operate independently of traditional ISP infrastructure. Built on proven technologies (B.A.T.M.A.N., CJDNS, Yggdrasil) and affordable hardware (UniFi, UISP), this network provides:

- **Resilience**: Operates when internet services fail
- **Decentralization**: No single point of failure or control
- **Proximity-based**: Automatic local discovery and routing
- **Multi-protocol**: WiFi, Ethernet, LoRa, point-to-point wireless
- **Community-owned**: Democratic governance and open source

---

## 1. Network Architecture

### 1.1 Layer Model

```
┌─────────────────────────────────────────────┐
│  Layer 5: Application                       │
│  (Apps, Services, Content)                  │
├─────────────────────────────────────────────┤
│  Layer 4: Overlay Routing                   │
│  (CJDNS/Yggdrasil encrypted routing)        │
├─────────────────────────────────────────────┤
│  Layer 3: Mesh Routing                      │
│  (B.A.T.M.A.N. adv Layer 2 mesh)            │
├─────────────────────────────────────────────┤
│  Layer 2: Physical Links                    │
│  (WiFi 5GHz/2.4GHz, Ethernet, LoRa)         │
├─────────────────────────────────────────────┤
│  Layer 1: Hardware                          │
│  (UniFi APs, UISP radios, Routers)          │
└─────────────────────────────────────────────┘
```

### 1.2 Real-World Protocol Stack

**Physical Layer (L1/L2)**:
- IEEE 802.11ac/ax (WiFi 5/6) - 5GHz primary, 2.4GHz fallback
- IEEE 802.3 (Gigabit Ethernet) - wired backbone
- IEEE 802.11s (802.11 mesh networking)
- LoRaWAN 915MHz (long-range coordination)

**Mesh Routing (L2/L3)**:
- **B.A.T.M.A.N. adv** (Better Approach To Mobile Adhoc Networking)
  - Version: batman-adv v2024.x (latest stable)
  - Mode: Layer 2 mesh with VLAN support
  - Metric: Throughput-based routing (BATMAN V)

**Encrypted Overlay (L3/L4)**:
- **Yggdrasil Network** (primary) - Modern, actively maintained
  - Go implementation: `yggdrasil-go`
  - End-to-end encryption
  - Self-arranging topology
  - Cross-platform support
- **CJDNS** (optional/fallback) - Battle-tested alternative
  - Hyperboria network compatible
  - DHT-based routing

**Content Distribution (L5)**:
- IPFS (InterPlanetary File System)
- Local DNS (CoreDNS/dnsmasq)
- mDNS/Avahi for local service discovery

---

## 2. Custom Addressing Scheme: CFN (Community Forest Network) Addresses

### 2.1 Why Beyond IPv4/IPv6?

**Problems with Traditional IP**:
- IPv4: Address exhaustion, NAT complexity
- IPv6: Still requires centralized allocation (IANA/RIRs)
- Both: No built-in security or proximity awareness
- Both: Designed for hierarchical ISP routing, not mesh

**CFN Solution**: Cryptographically-derived, self-allocated, proximity-aware addresses

### 2.2 CFN Address Format

```
Format: <prefix>:<geo-hash>:<node-id>:<port>

Example: cfn:c0w3:a7f2b8d4c9e1:8080
         │   │    │            │
         │   │    │            └─ Service port (optional)
         │   │    └─────────────── 48-bit node ID (crypto hash)
         │   └──────────────────── 16-bit proximity hash
         └──────────────────────── Network prefix
```

#### Components:

1. **Prefix**: `cfn` (Community Forest Network)
2. **Geo-Hash**: 4-character proximity identifier
   - Derived from GPS coordinates (Geohash algorithm)
   - Enables proximity-based routing
   - Updates automatically as nodes move
3. **Node-ID**: 12-character cryptographic identifier
   - SHA-256 hash of node's public key (truncated)
   - Globally unique, self-generated
   - No central authority needed
4. **Port**: Optional service identifier

### 2.3 Address Generation

```python
# Pseudocode for CFN address generation
import hashlib
import geohash

def generate_cfn_address(public_key, latitude, longitude):
    # Generate node ID from public key
    node_id = hashlib.sha256(public_key).hexdigest()[:12]

    # Generate proximity hash from coordinates
    geo_hash = geohash.encode(latitude, longitude, precision=4)

    # Combine into CFN address
    return f"cfn:{geo_hash}:{node_id}"

# Example:
# Public key: 0x7a3f2b1...
# Location: 41.8781° N, 87.6298° W (Chicago)
# Result: cfn:dp3w:7a3f2b1c5d8e
```

### 2.4 Routing with CFN Addresses

**Proximity-First Routing**:
1. Check geo-hash prefix - prefer local routes
2. Use DHT for global lookups
3. Cache frequently-accessed routes
4. Multi-path routing for resilience

**Address Resolution**:
- Local: mDNS/Avahi announces CFN addresses
- Network: DHT stores CFN → Yggdrasil IPv6 mapping
- Internet: DNS bridge for external access

---

## 3. Hardware Integration: UniFi/UISP Deployment

### 3.1 Recommended Hardware

**Core Network Nodes** (NYC Mesh proven):
- **UniFi Dream Machine Pro** - Gateway/router
- **UniFi 6 LR Access Point** - WiFi mesh nodes
- **UniFi Switch 16 PoE** - Wired backbone
- **UISP LiteBeam 5AC Gen2** - Point-to-point links

**Budget Community Nodes**:
- **UniFi 6 Lite** - Basic mesh node ($99)
- **Raspberry Pi 4 + WiFi adapter** - DIY node (<$100)
- **GL.iNet routers** - Pre-configured OpenWrt ($50-150)

**Long-Range Links**:
- **UISP AirFiber 60 LR** - 60GHz backhaul (1+ Gbps, 1km)
- **UISP PowerBeam 5AC Gen2** - 5GHz PtP (450+ Mbps, 10km)

### 3.2 UniFi Configuration for Mesh

**Based on NYC Mesh best practices**:

```bash
# 1. Flash to firmware 4.3.20 (critical!)
# Later versions have mesh reliability issues
ssh ubnt@<AP-IP>
upgrade https://dl.ui.com/unifi/firmware/U6LR/4.3.20.12361/BZ.qca956x.v4.3.20.12361.210708.1528.bin

# 2. Enable mesh connectivity
# Via UniFi Controller:
# Settings → Wireless Networks → Create New
# - Name: CCMN-Mesh
# - Security: WPA2-Enterprise (802.1X)
# - WiFi Band: 5GHz only
# - Channel Width: 80MHz (VHT80)

# 3. Configure mesh uplink
# Settings → Devices → AP → Config → Services
# - Enable "Allow Meshing to Another AP"
# - Prefer wired uplink when available
```

**Network Topology**:
```
Internet ─┬─ UDM Pro ─── UniFi Switch PoE ─┬─ AP1 (wired)
          │                                 ├─ AP2 (wired)
          │                                 └─ AP3 (wired)
          │                                      │
          │                                      ├─ AP4 (mesh) ─┬─ AP7 (mesh)
          │                                      │              └─ AP8 (mesh)
          │                                      └─ AP5 (mesh) ─── AP9 (mesh)
          │
          └─ UISP Gateway ─── AirFiber 60 ─── Neighbor Building
```

**Key Rules** (NYC Mesh validated):
- Max 1 wireless hop per path (reliability)
- 2-3 mesh APs per wired AP (load balancing)
- Wired backbone wherever possible
- 5GHz for mesh, 2.4GHz for clients

### 3.3 BATMAN Integration on UniFi

```bash
# Install batman-adv on UniFi devices
# (Requires SSH access and persistence script)

# 1. Enable persistent SSH
ssh ubnt@<AP-IP>
touch /etc/persistent/ct-readonly

# 2. Install batman-adv kernel module
opkg update
opkg install kmod-batman-adv

# 3. Create mesh interface
batctl if add wlan1  # 5GHz radio
ip link set up dev bat0
ip addr add 10.mesh.0.x/16 dev bat0

# 4. Make persistent (add to /etc/rc.local)
cat >> /etc/persistent/rc.poststart << 'EOF'
#!/bin/sh
sleep 30
batctl if add wlan1
ip link set up dev bat0
ip addr add 10.mesh.0.$(cat /sys/class/net/eth0/address | tail -c 4 | tr -d ':' | xargs printf '%d') dev bat0
EOF
chmod +x /etc/persistent/rc.poststart
```

---

## 4. Network Protocols and Services

### 4.1 Yggdrasil Encrypted Overlay

**Installation** (all nodes):
```bash
# Debian/Ubuntu
sudo add-apt-repository ppa:yggdrasil-network/yggdrasil
sudo apt-get update
sudo apt-get install yggdrasil

# Generate config
yggdrasil -genconf > /etc/yggdrasil/yggdrasil.conf

# Configure peers (local mesh + internet peers)
sudo nano /etc/yggdrasil/yggdrasil.conf
# Add:
# Peers: [
#   "tcp://[mesh-neighbor]:9001"
#   "tls://[internet-peer]:9002"
# ]

# Start service
sudo systemctl enable yggdrasil
sudo systemctl start yggdrasil
```

**Features**:
- Auto-generated IPv6 address: `200:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx`
- End-to-end encryption (all traffic)
- Zero-config peer discovery
- Works over any transport (WiFi, Ethernet, Internet)

### 4.2 Local Services

**DNS Resolution**:
```yaml
# CoreDNS config for .mesh TLD
mesh:53 {
    forward . 10.mesh.0.1  # Local DNS resolver
    cache 30
}

. {
    forward . 1.1.1.1 9.9.9.9  # Fallback to internet
    cache 3600
}
```

**Service Discovery** (mDNS):
```bash
# Avahi announces CFN addresses
sudo apt-get install avahi-daemon

# Add custom service
cat > /etc/avahi/services/mesh-node.service << 'EOF'
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name>CCMN Node</name>
  <service>
    <type>_cfn._tcp</type>
    <port>9001</port>
    <txt-record>cfn=cfn:dp3w:7a3f2b1c5d8e</txt-record>
  </service>
</service-group>
EOF
```

**Content Hosting** (IPFS):
```bash
# Install IPFS
wget https://dist.ipfs.io/go-ipfs/v0.28.0/go-ipfs_v0.28.0_linux-amd64.tar.gz
tar xvfz go-ipfs_*.tar.gz
cd go-ipfs
sudo bash install.sh

# Initialize and configure
ipfs init
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
ipfs config --json Addresses.Swarm '["/ip4/0.0.0.0/tcp/4001", "/ip6/::/tcp/4001"]'

# Start daemon
ipfs daemon &
```

### 4.3 Network Monitoring

**B.A.T.M.A.N. Status**:
```bash
# View mesh neighbors
batctl n

# View routing table
batctl o

# Monitor throughput
batctl tp

# Gateway status
batctl gw
```

**Yggdrasil Diagnostics**:
```bash
# Show peers
yggdrasilctl getPeers

# Show routing table
yggdrasilctl getSelf

# Monitor traffic
yggdrasilctl getMulticast
```

---

## 5. Resilience and Failover

### 5.1 Internet Outage Mode

When internet connectivity fails:

1. **Local mesh continues operating**
   - B.A.T.M.A.N. handles local routing
   - Yggdrasil maintains encryption
   - Services remain accessible via .mesh TLD

2. **Content caching**
   - IPFS pins critical content locally
   - DNS cache serves recent lookups
   - Local mirrors of essential sites

3. **Inter-neighborhood bridges**
   - LoRa gateway provides 10km+ range
   - UISP point-to-point links to adjacent meshes
   - Satellite backup (Starlink, OneWeb) for critical nodes

### 5.2 Multi-Path Routing

```
User Device
    │
    ├─ Path 1: WiFi → AP1 (mesh) → AP4 (wired) → Internet
    │
    ├─ Path 2: Ethernet → Switch → Gateway → Internet
    │
    └─ Path 3: WiFi → AP2 (mesh) → LoRa → Remote Mesh → Satellite
```

### 5.3 Self-Healing

**Automatic failover**:
- B.A.T.M.A.N. recalculates routes every 5 seconds
- Yggdrasil switches paths in <1 second
- TCP connections survive path changes (MPTCP)

---

## 6. Security Model

### 6.1 Encryption Layers

1. **Transport**: WPA2/WPA3 (WiFi), 802.1X (mesh)
2. **Network**: Yggdrasil end-to-end encryption
3. **Application**: TLS for services (HTTPS, etc.)

### 6.2 Access Control

**Public mesh** (open to community):
- Anyone can connect
- Bandwidth throttling for fairness
- No logging of user traffic

**Private mesh** (authenticated nodes):
- Public key authentication
- Yggdrasil peer allowlisting
- Node reputation system

### 6.3 Attack Mitigation

- **DDoS**: Yggdrasil rate limiting
- **Sybil**: Proof-of-location (GPS/geo-hash)
- **Routing attacks**: B.A.T.M.A.N. loop detection
- **Eavesdropping**: End-to-end encryption

---

## 7. Deployment Guide

### 7.1 Quick Start (Single Node)

**Hardware needed**:
- Raspberry Pi 4 (4GB+) - $55
- WiFi 5GHz USB adapter - $25
- MicroSD card (32GB+) - $10
- Power supply - $10
- **Total**: ~$100

**Software setup**:
```bash
# 1. Install Raspberry Pi OS Lite
# Download from raspberrypi.com/software

# 2. Install mesh software
sudo apt-get update
sudo apt-get install -y batman-adv yggdrasil avahi-daemon

# 3. Run setup script
curl -sSL https://mesh.chicagoforest.net/install.sh | bash

# 4. Configure location
sudo mesh-config --lat 41.8781 --lon -87.6298 --name "MyNode"

# 5. Join network
sudo mesh-join chicago
```

### 7.2 UniFi Deployment (10+ nodes)

**Phase 1: Backbone** (Week 1)
- Deploy 3-5 wired UniFi APs
- Configure controller
- Test wired connectivity

**Phase 2: Mesh** (Week 2)
- Add mesh APs (2-3 per wired AP)
- Verify mesh uplinks
- Optimize placement

**Phase 3: Services** (Week 3)
- Deploy Yggdrasil on all nodes
- Configure local DNS/IPFS
- Launch community services

**Phase 4: Optimization** (Ongoing)
- Monitor performance (UniFi analytics)
- Adjust channel selection
- Add point-to-point links as needed

### 7.3 Neighborhood Scale (100+ nodes)

**Infrastructure**:
- Fiber backbone between buildings
- Rooftop point-to-point links (UISP)
- Ground-level mesh (UniFi APs)
- LoRa gateways for redundancy

**Governance**:
- Node operator collective
- Shared infrastructure costs
- Democratic decision-making
- Open technical documentation

---

## 8. Real-World Examples

### 8.1 NYC Mesh (New York City)
- **Scale**: 1000+ nodes, 500+ active members
- **Hardware**: Primarily Ubiquiti (UniFi, AirFiber)
- **Coverage**: Manhattan, Brooklyn, Queens
- **Status**: Operational since 2014
- **Docs**: https://docs.nycmesh.net

### 8.2 Freifunk (Germany)
- **Scale**: 40,000+ nodes across Germany
- **Hardware**: OpenWrt routers, custom firmware
- **Protocol**: B.A.T.M.A.N. adv
- **Status**: Active since 2002
- **Docs**: https://freifunk.net/en

### 8.3 Guifi.net (Spain/Catalonia)
- **Scale**: 37,000+ nodes, largest community network
- **Coverage**: 63,000+ km of wireless links
- **Governance**: Foundation + cooperatives
- **Status**: Operational since 2004
- **Docs**: https://guifi.net/en

### 8.4 Toronto Mesh (Canada)
- **Scale**: 50+ nodes, growing
- **Protocol**: CJDNS (Hyperboria)
- **Hardware**: Raspberry Pi, OpenWrt
- **Status**: Active since 2016
- **Docs**: https://tomesh.net

---

## 9. Technical Roadmap

### Phase 1: Prototype (Months 1-3)
- [x] Document existing mesh protocols
- [ ] Build reference implementation (5-node testbed)
- [ ] Test UniFi + B.A.T.M.A.N. integration
- [ ] Benchmark throughput and latency
- [ ] Create installation guides

### Phase 2: Pilot (Months 4-6)
- [ ] Deploy 20-node neighborhood pilot
- [ ] Implement CFN addressing
- [ ] Launch local services (DNS, IPFS, chat)
- [ ] Gather community feedback
- [ ] Optimize routing algorithms

### Phase 3: Scale (Months 7-12)
- [ ] Expand to 100+ nodes
- [ ] Inter-neighborhood bridges
- [ ] Mobile app for users
- [ ] Hardware partnerships (bulk pricing)
- [ ] Training programs for installers

### Phase 4: Sustainability (Year 2+)
- [ ] Cooperative governance structure
- [ ] Funding model (membership, grants)
- [ ] Replicate in other cities
- [ ] Contribute improvements to B.A.T.M.A.N./Yggdrasil
- [ ] Policy advocacy (municipal broadband, etc.)

---

## 10. Get Involved

### 10.1 For Developers
- **GitHub**: https://github.com/vespo92/ChicagoForest.net
- **Code**: Reference implementations, scripts, configs
- **Issues**: Bug reports, feature requests
- **PRs**: Contributions welcome!

### 10.2 For Node Operators
- **Discord**: https://discord.gg/chicagoforest
- **Matrix**: #chicagoforest:matrix.org
- **Meetups**: Monthly technical workshops
- **Training**: Installation and configuration courses

### 10.3 For Community Members
- **Host a node**: Share internet, earn credits
- **Volunteer**: Help with installs
- **Donate**: Hardware, funds, bandwidth
- **Advocate**: Talk to your building/HOA/city

---

## 11. Frequently Asked Questions

**Q: Is this legal?**
A: Yes. Mesh networking is completely legal in the US and most countries. You're simply sharing your internet connection (check your ISP ToS) and using unlicensed spectrum (2.4/5GHz WiFi).

**Q: What about bandwidth? Won't this be slow?**
A: NYC Mesh members regularly get 100+ Mbps. Modern WiFi (802.11ac/ax) can handle gigabit speeds. Wired backbone and point-to-point links provide plenty of capacity.

**Q: Can the government shut this down?**
A: No single entity can shut down a mesh network. It's distributed by design. Even if internet backhaul is cut, the local mesh continues operating.

**Q: How much does it cost?**
A: Entry-level node: $100. Professional deployment: $300-500/node. NYC Mesh installations average $200-300 including labor.

**Q: What if my neighbor is doing illegal things on the network?**
A: You're sharing bandwidth, not liable for others' actions (Section 230). Use Yggdrasil encryption—you can't see their traffic. Same as sharing WiFi at a coffee shop.

**Q: Can I still use regular internet?**
A: Yes! The mesh is additive. You can use both your ISP connection AND the mesh. Devices auto-switch to the fastest path.

**Q: What about privacy?**
A: Better than regular internet! Yggdrasil provides end-to-end encryption. No ISP monitoring. No centralized logs. Mesh routing is pseudonymous.

---

## 12. References and Resources

### Protocol Documentation
- **B.A.T.M.A.N.**: https://www.open-mesh.org/projects/batman-adv/wiki
- **CJDNS**: https://github.com/cjdelisle/cjdns
- **Yggdrasil**: https://yggdrasil-network.github.io/
- **IPFS**: https://docs.ipfs.io/

### Community Networks
- **NYC Mesh**: https://nycmesh.net
- **Freifunk**: https://freifunk.net/en
- **Guifi.net**: https://guifi.net/en
- **Toronto Mesh**: https://tomesh.net

### Hardware Guides
- **UniFi Documentation**: https://help.ui.com
- **UISP Documentation**: https://help.ui.com/hc/en-us/categories/360003683933
- **OpenWrt Project**: https://openwrt.org

### Academic Research
- **"B.A.T.M.A.N. Unpacked"** (TUM 2024): https://www.net.in.tum.de/fileadmin/TUM/NET/NET-2024-09-1/NET-2024-09-1_02.pdf
- **CJDNS Whitepaper**: https://github.com/cjdelisle/cjdns/blob/master/doc/Whitepaper.md
- **Yggdrasil Implementation**: https://github.com/yggdrasil-network/yggdrasil-network.github.io/blob/master/implementation.md

---

## License

This specification is released under dual license:

- **MIT License**: For open source implementations
- **Apache 2.0**: For patent protection

**TL;DR**: Free to use, modify, and distribute. Build this network. Share it. Improve it. Make it real.

---

**Contact**: mesh@chicagoforest.net
**Version**: 1.0.0 (2025-11-16)
**Status**: Living document - contributions welcome!

---

*This is REAL technology. These protocols work. The hardware exists. Communities worldwide are building this TODAY. You can too.*

**Let's build the decentralized internet together.** 🌲⚡🌐
