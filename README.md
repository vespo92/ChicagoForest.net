# Chicago Forest Network 🌲⚡🌐

[![GitHub](https://img.shields.io/badge/GitHub-vespo92%2FChicagoForest.net-blue?logo=github)](https://github.com/vespo92/ChicagoForest.net)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Repository:** [https://github.com/vespo92/ChicagoForest.net](https://github.com/vespo92/ChicagoForest.net)

## ⚠️ IMPORTANT DISCLAIMER ⚠️

**This is an AI-generated theoretical framework for educational and research purposes.**

This repository contains:
1. **P2P Wireless Mesh Packages** - TypeScript packages for building decentralized wireless networks
2. **Theoretical Energy Framework** - Conceptual documentation inspired by Tesla's research

**None of this is operational infrastructure.** It's a vision of what community-owned networks could look like.

---

## 📦 Monorepo Structure

This is a **Turborepo** monorepo containing multiple packages for building the Chicago Forest P2P network.

```
chicago-forest-network/
├── apps/
│   └── web/                          # Next.js documentation website
├── packages/
│   │
│   │ === MYCELIUM ECOSYSTEM (NEW) ===
│   ├── mycelium-core/                # 🍄 Neural network substrate - hyphal pathways, signal propagation
│   ├── spore-propagation/            # 🌱 Network growth - bootstrap, distribution, germination
│   ├── nutrient-exchange/            # 🔄 Resource sharing - bandwidth, storage, compute credits
│   ├── symbiosis/                    # 🤝 Inter-forest federation - gateways, bridges
│   ├── hive-mind/                    # 🧠 Collective governance - consensus, proposals, voting
│   ├── forest-registry/              # 📖 Global discovery - decentralized DNS for forests
│   ├── canopy-api/                   # 🌿 Public API - REST, WebSocket, SDK
│   │
│   │ === FOUNDATION LAYER ===
│   ├── p2p-core/                     # Core P2P networking primitives
│   ├── routing/                      # Unified routing layer
│   ├── wireless-mesh/                # WiFi Direct, ad-hoc, mesh routing
│   ├── sdwan-bridge/                 # SD-WAN virtual bridge & tunneling
│   ├── firewall/                     # Chicago Forest Firewall (CFW)
│   ├── node-deploy/                  # Docker/K8s/VM deployment configs
│   ├── mnp-adapter/                 # MNP protocol integration
│   ├── anon-routing/                 # Anonymous onion routing
│   ├── hardware-hal/                 # Hardware abstraction (radios, antennas)
│   ├── cli/                          # Command-line interface
│   └── shared-types/                 # Shared TypeScript types
├── turbo.json                        # Turborepo configuration
└── pnpm-workspace.yaml               # Workspace configuration
```

---

## 🍄 The Mycelium Ecosystem

The Chicago Forest Network is evolving from a branch architecture to a **mycelium network** - a self-organizing, resilient global ecosystem like the fungal networks that connect trees underground.

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                         MYCELIUM ECOSYSTEM                                 ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  CANOPY LAYER         @chicago-forest/canopy-api                          ║
║  External API, SDKs, Documentation                                         ║
║───────────────────────────────────────────────────────────────────────────║
║  GOVERNANCE LAYER                                                          ║
║  hive-mind (Consensus) | forest-registry (DNS) | symbiosis (Federation)  ║
║───────────────────────────────────────────────────────────────────────────║
║  RESOURCE LAYER                                                            ║
║  nutrient-exchange (Credits) | spore-propagation (Growth)                 ║
║───────────────────────────────────────────────────────────────────────────║
║  MYCELIUM CORE         @chicago-forest/mycelium-core                       ║
║  Hyphal Networks | Signal Propagation | Emergent Topology                  ║
║───────────────────────────────────────────────────────────────────────────║
║  FOUNDATION LAYER                                                          ║
║  p2p-core | routing | mesh | firewall | sdwan | anon-routing | hardware   ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

See [MYCELIUM_ECOSYSTEM.md](./MYCELIUM_ECOSYSTEM.md) for the complete vision.

---

## 🤖 AI Agent Development

This project supports parallel development through **10 specialized AI agents**, each with exclusive file ownership to enable conflict-free collaboration.

| Agent | Codename | Domain | Focus Area |
|-------|----------|--------|------------|
| 1 | Mycelia | Neural Network Core | Hyphal pathways, signal propagation |
| 2 | Rhizome | Network Propagation | Bootstrap, growth, self-healing |
| 3 | Symbiont | Federation | Cross-network bridges |
| 4 | Sentinel | Security | Anonymous routing, privacy |
| 5 | Archivist | Research | Historical documentation |
| 6 | Beacon | Hardware | Deployment, infrastructure |
| 7 | Nexus | API/SDK | Developer tools |
| 8 | Delegate | Governance | Voting, proposals |
| 9 | Weaver | Testing | Quality assurance |
| 10 | Oracle | Documentation | UX, web portal |

**Integration with companion repositories:**
- [NPCPU](https://github.com/vespo92/NPCPU) - Cognitive AI agent framework
- [ConstitutionalShrinkage](https://github.com/vespo92/ConstititutionalShrinkage) - Decentralized governance

See [AGENTS_DEPLOYMENT.md](./AGENTS_DEPLOYMENT.md) for detailed agent specifications and [ECOSYSTEM_ANALYSIS.md](./ECOSYSTEM_ANALYSIS.md) for integration architecture.

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development mode
pnpm dev

# Run the CLI
pnpm --filter @chicago-forest/cli build
npx forest --help
```

---

## 📦 Package Overview

### `@chicago-forest/p2p-core`
Core P2P networking primitives including:
- **Node Identity**: Ed25519 keypairs, peer ID derivation
- **Peer Discovery**: Kademlia DHT for decentralized discovery
- **Connection Manager**: Peer connection lifecycle and messaging
- **Event System**: Type-safe network event handling

```typescript
import { createNodeIdentity, KademliaDHT, ConnectionManager } from '@chicago-forest/p2p-core';

const identity = await createNodeIdentity();
const dht = new KademliaDHT(identity.nodeId);
```

### `@chicago-forest/wireless-mesh`
Wireless mesh networking layer:
- **WiFi Direct**: P2P connections without infrastructure
- **Ad-hoc Mode**: Decentralized wireless networks
- **Mesh Routing**: BATMAN-adv, OLSR, Babel protocol support
- **Link Quality**: Signal monitoring and neighbor discovery

```typescript
import { WirelessMeshManager } from '@chicago-forest/wireless-mesh';

const mesh = new WirelessMeshManager({
  protocol: 'batman-adv',
  interface: 'wlan0',
  channel: 6,
});
await mesh.start();
```

### `@chicago-forest/sdwan-bridge`
SD-WAN virtual bridge for the UNAbridged network:
- **WireGuard Tunnels**: Encrypted point-to-point connections
- **VXLAN Overlay**: Virtual network segments
- **Traffic Classification**: Application-aware routing
- **Path Selection**: Latency, bandwidth, cost-based policies

```typescript
import { SDWANBridge } from '@chicago-forest/sdwan-bridge';

const bridge = new SDWANBridge({
  nodeIdentity: myIdentity,
  forestInterface: 'eth1',
  pathSelection: 'lowest-latency',
});
```

### `@chicago-forest/firewall`
Chicago Forest Firewall (CFW):
- **Two-Port Configuration**: WAN + FOREST interfaces
- **Rule DSL**: Fluent API for firewall rules
- **OPNsense Export**: Generate OPNsense-compatible configs
- **nftables/iptables**: Native Linux firewall support

```typescript
import { ChicagoForestFirewall, RuleBuilder, generateOPNsenseConfig } from '@chicago-forest/firewall';

const firewall = new ChicagoForestFirewall();
firewall.addRule(
  RuleBuilder.create('allow-forest')
    .name('Allow Forest Traffic')
    .fromZone('forest')
    .allow()
    .build()
);
```

### `@chicago-forest/node-deploy`
Deployment configurations:
- **Docker**: docker-compose for containerized nodes
- **Kubernetes**: Deployments with NIC passthrough, SR-IOV
- **VMs**: cloud-init for OPNsense/custom VMs
- **Helm Charts**: Kubernetes package manager support

```typescript
import { generateDockerCompose, generateKubernetesManifest } from '@chicago-forest/node-deploy';

const compose = generateDockerCompose({
  nodeName: 'forest-node-1',
  forestInterface: 'eth1',
  enableFirewall: true,
});
```

### `@chicago-forest/anon-routing`
Anonymous routing layer:
- **Onion Routing**: Multi-hop encrypted circuits
- **Hidden Services**: Anonymous hosting (like .onion)
- **Traffic Padding**: Timing attack resistance
- **Circuit Building**: Tor-inspired path selection

### `@chicago-forest/hardware-hal`
Hardware Abstraction Layer:
- **WiFi Adapters**: 2.4GHz, 5GHz, 6GHz support
- **LoRa Radios**: Long-range mesh (SX1262/SX1276)
- **60GHz Backhaul**: High-speed point-to-point
- **DIY Equipment**: Support for custom radios

### `@chicago-forest/cli`
Command-line interface:
```bash
forest init               # Initialize a new node
forest start              # Start the node
forest status             # Show node status
forest peers              # List connected peers
forest mesh --neighbors   # Show mesh neighbors
forest tunnel --create    # Create SD-WAN tunnel
forest firewall --rules   # List firewall rules
forest deploy --docker    # Generate Docker config
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CHICAGO FOREST NETWORK STACK                         │
├─────────────────────────────────────────────────────────────────────────┤
│  USER DEPLOYMENT (Docker / Kubernetes / VM / Bare Metal)                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       @chicago-forest/cli                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│  ┌─────────────────────────────────┼───────────────────────────────┐   │
│  │               @chicago-forest/node-deploy                        │   │
│  └─────────────────────────────────┼───────────────────────────────┘   │
├────────────────────────────────────┼────────────────────────────────────┤
│  SECURITY LAYER                    │                                    │
│  ┌─────────────────────┐    ┌──────┴──────────────────────────────┐   │
│  │ @chicago-forest/    │    │    @chicago-forest/anon-routing     │   │
│  │     firewall        │◄───│      Onion/Anonymous Routing        │   │
│  └─────────────────────┘    └─────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│  NETWORK LAYER                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  @chicago-forest/sdwan-bridge                    │   │
│  │     SD-WAN Overlay | Virtual Tunnels | Traffic Engineering      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────┐    ┌─────────────────────────────────────┐   │
│  │ @chicago-forest/    │    │    @chicago-forest/p2p-core         │   │
│  │   mnp-adapter      │◄───│  Node Identity | Peer Discovery     │   │
│  └─────────────────────┘    └─────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│  TRANSPORT LAYER                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                 @chicago-forest/wireless-mesh                    │   │
│  │      WiFi Direct | Ad-hoc | Mesh Routing (BATMAN/OLSR)          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│  PHYSICAL LAYER                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  @chicago-forest/hardware-hal                    │   │
│  │   Custom Radios | UISP Equipment | LoRa | DIY Antennas          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Development

### Prerequisites
- Node.js 18+
- pnpm 9.0+
- TypeScript 5+

### Building

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Build specific package
pnpm --filter @chicago-forest/p2p-core build

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

### Package Development

Each package follows the same structure:
```
packages/[name]/
├── src/
│   └── index.ts      # Main entry point
├── package.json      # Package configuration
├── tsconfig.json     # TypeScript config
└── tsup.config.ts    # Build configuration (optional)
```

---

## 🐳 Deployment

### Docker

```bash
# Generate docker-compose
forest deploy --target docker --output docker-compose.yml

# Run
docker-compose up -d
```

### Kubernetes

```bash
# Generate K8s manifests
forest deploy --target kubernetes --output forest-node.yaml

# Apply
kubectl apply -f forest-node.yaml
```

### Two-Port Firewall Setup

Users connect with:
- **Port 1 (WAN)**: Traditional internet (optional)
- **Port 2 (FOREST)**: Chicago Forest Network

Supports:
- OPNsense
- pfSense
- Custom Chicago Forest Firewall
- VMs with NIC passthrough
- Docker with host networking
- Kubernetes with Multus CNI

---

## 📚 Documentation

- [Mycelium Ecosystem](./MYCELIUM_ECOSYSTEM.md) - **NEW** The global network vision
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Full architecture and task breakdown
- [Mesh Network Spec](./MESH_NETWORK_SPEC.md) - Technical mesh networking details
- [Protocol Whitepaper](./PROTOCOL_WHITEPAPER.md) - Theoretical protocol specification
- [Project Guidelines](./CLAUDE.md) - Development principles

---

## 🌍 Community Mesh Networks (Real-World Inspiration)

This project is inspired by real community mesh networks:

| Network | Location | Nodes | Status |
|---------|----------|-------|--------|
| [NYC Mesh](https://nycmesh.net) | New York | 1,000+ | Active |
| [Freifunk](https://freifunk.net) | Germany | 40,000+ | Active |
| [Guifi.net](https://guifi.net) | Spain | 37,000+ | Active |
| [Toronto Mesh](https://tomesh.net) | Canada | 50+ | Active |

---

## 📄 License

MIT License - See [LICENSE](./LICENSE)

---

## ⚠️ Final Disclaimer

**This is a theoretical framework and educational project.**

- No working free energy devices exist in this codebase
- No operational P2P network is deployed
- All code is for research and educational purposes
- Sources are documented in [BIBLIOGRAPHY.md](./public/research/BIBLIOGRAPHY.md)

**Together, we preserve historical research and envision what could be possible.**

*Chicago Forest Network - Energy Democracy for All* 🌲
