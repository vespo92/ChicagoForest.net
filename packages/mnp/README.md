# @chicago-forest/mnp

> **⚠️ THEORETICAL FRAMEWORK** - This is an AI-generated conceptual protocol for the Chicago Forest Network. It is NOT a replacement for standard internet protocols.

**MNP (Mycelium Network Protocol)** is a next-generation P2P addressing and routing protocol designed for mesh networks, inspired by the organic resilience of mycelium networks.

## Features

- **256-bit addresses** - Double IPv6's address space
- **Cryptographic identity** - Addresses derived from public keys (no central authority)
- **Geographic awareness** - Geohash prefix for proximity-based routing
- **Mesh-native DHT** - Kademlia-inspired distributed routing
- **Multi-path support** - Resilient routing with fallbacks
- **Multiple transports** - TCP, UDP, WebRTC, WiFi Direct

## Installation

```bash
npm install @chicago-forest/mnp
# or
bun add @chicago-forest/mnp
```

## Quick Start

```typescript
import { createNode } from '@chicago-forest/mnp';

// Create and start a node
const node = await createNode({
  location: { latitude: 41.8781, longitude: -87.6298 }, // Chicago
  listen: { tcp: 7777, udp: 7778 }
});

console.log('Node address:', node.getAddressString());
// Output: mnp:dp3w:7a3f2b1c5d8e9f0a1b2c3d4e

// Listen for messages
node.on('packet:received', (packet) => {
  console.log('Received:', Buffer.from(packet.payload).toString());
});

// Send message to another node
const destination = parseAddress('mnp:dp3w:abc123def456789:8080');
await node.send(destination, Buffer.from('Hello, Forest!'));
```

## CLI Usage

```bash
# Start a node
npx @chicago-forest/mnp start --lat 41.8781 --lon -87.6298 --tcp 7777

# Generate an address
npx @chicago-forest/mnp address --lat 41.8781 --lon -87.6298

# Parse an address
npx @chicago-forest/mnp parse mnp:dp3w:7a3f2b1c5d8e9f0a1b2c3d4e:8080

# Show protocol info
npx @chicago-forest/mnp info
```

## Address Format

```
mnp:<geohash>:<nodeId>:<port>

Example: mnp:dp3w:7a3f2b1c5d8e9f0a1b2c3d4e:8080
         │    │    │                        │
         │    │    │                        └─ Service port (optional)
         │    │    └──────────────────────────── 128-bit node ID (crypto hash)
         │    └───────────────────────────────── 4-char geohash (location)
         └────────────────────────────────────── Protocol identifier
```

## API Reference

### Address Functions

```typescript
import {
  generateAddress,   // Create address from key pair + location
  parseAddress,      // Parse address string
  formatAddress,     // Format address as string
  validateAddress,   // Check address validity
  addressEquals,     // Compare two addresses
  routingDistance,   // Calculate routing metric
} from '@chicago-forest/mnp';
```

### Cryptography

```typescript
import {
  generateKeyPair,  // Generate Ed25519-like key pair
  sign,             // Sign data with private key
  verify,           // Verify signature
  hash,             // SHA-256 hash
} from '@chicago-forest/mnp';
```

### Packets

```typescript
import {
  createPacket,       // Create data packet
  createAnnounce,     // Create peer announcement
  createHeartbeat,    // Create keepalive packet
  serializePacket,    // Serialize to bytes
  deserializePacket,  // Parse from bytes
} from '@chicago-forest/mnp';
```

### Node

```typescript
import { MNPNode } from '@chicago-forest/mnp';

const node = new MNPNode({
  location: { latitude: 41.8781, longitude: -87.6298 },
  listen: { tcp: 7777, udp: 7778 },
  enableRelay: true,
  maxPeers: 50,
});

await node.start();

// Events
node.on('peer:discovered', (peer) => { /* ... */ });
node.on('peer:disconnected', (address) => { /* ... */ });
node.on('packet:received', (packet) => { /* ... */ });

// Send data
await node.send(destinationAddress, payload);

// Get stats
const stats = node.getStats();

await node.stop();
```

## How It Works

### Addressing

1. Generate a cryptographic key pair
2. Hash the public key to create a 128-bit node ID
3. Encode your location as a 4-character geohash
4. Combine into a 256-bit address

### Routing

1. **Geohash-first**: Prefer routes to nodes with similar geohash prefixes
2. **DHT fallback**: Use Kademlia-style XOR distance for global lookups
3. **Multi-path**: Maintain multiple routes for resilience
4. **Learning**: Automatically learn routes from received packets

### Transport

The protocol supports multiple transport layers:

- **TCP**: Reliable, ordered delivery
- **UDP**: Fast, connectionless messaging
- **Memory**: In-process transport for testing

## Comparison with IPv6

| Feature | IPv6 | MNP |
|---------|------|------|
| Address Size | 128-bit | 256-bit |
| Identity | None | Cryptographic |
| Location | None | Geohash prefix |
| Allocation | IANA/RIRs | Self-allocated |
| Routing | Hierarchical | DHT/Mesh |
| NAT Traversal | Complex | Native |

## Use Cases

- **Community mesh networks** - Neighbor-to-neighbor connectivity
- **Disaster resilience** - Works without internet infrastructure
- **IoT networks** - Self-organizing device networks
- **Educational** - Learn about P2P protocols

## Limitations

This is a **theoretical framework**:

- Not tested at scale
- Simplified cryptography (demo purposes)
- No formal security audit
- Not compatible with internet protocols

For production mesh networks, consider:
- [Yggdrasil](https://yggdrasil-network.github.io/)
- [CJDNS](https://github.com/cjdelisle/cjdns)
- [B.A.T.M.A.N.](https://www.open-mesh.org/)

## Contributing

Contributions welcome! This is an open-source project of the Chicago Forest Network.

## License

MIT License - See [LICENSE](./LICENSE)

## Links

- [Chicago Forest Network](https://chicagoforest.net)
- [Mesh Network Specification](https://chicagoforest.net/mesh)
- [Protocol Whitepaper](https://chicagoforest.net/whitepaper)

---

*Part of the Chicago Forest Network - Building community-owned infrastructure for a sustainable future.*

**⚠️ This is an AI-generated theoretical framework. It is not operational technology.**
