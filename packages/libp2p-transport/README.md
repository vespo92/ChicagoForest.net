# @chicago-forest/libp2p-transport

> **DISCLAIMER**: This is part of an AI-generated theoretical framework for educational and research purposes. Not operational infrastructure.

Production P2P networking layer using [libp2p](https://libp2p.io/) for Chicago Forest Network.

## Features

- **Multiple Transports**: TCP, WebSocket, WebRTC
- **NAT Traversal**: Circuit Relay, DCUtR (Direct Connection Upgrade through Relay)
- **Secure Connections**: Noise protocol encryption
- **Stream Multiplexing**: Yamux protocol
- **Peer Discovery**: Kademlia DHT, mDNS, Bootstrap nodes
- **PubSub**: GossipSub for broadcast messaging
- **Protocol Handlers**: Custom Forest network protocols

## Installation

```bash
pnpm add @chicago-forest/libp2p-transport
```

## Quick Start

```typescript
import { createForestStack } from '@chicago-forest/libp2p-transport';

// Create a complete P2P stack
const stack = await createForestStack({
  enableDHT: true,
  enablePubSub: true,
  bootstrapPeers: [
    '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
  ],
});

// Get node info
console.log('Peer ID:', stack.node.peerId.toString());
console.log('Addresses:', stack.node.getMultiaddrs().map(ma => ma.toString()));

// Subscribe to announcements
stack.pubsub?.on('announcements', (msg) => {
  console.log('Announcement:', msg.data);
});

// Cleanup
await stack.stop();
```

## Usage with p2p-core

The libp2p transport implements the `Transport` interface from `@chicago-forest/p2p-core`:

```typescript
import { ConnectionManager } from '@chicago-forest/p2p-core';
import { createLibp2pTransport } from '@chicago-forest/libp2p-transport';

// Create transport
const transport = await createLibp2pTransport({
  enableTCP: true,
  enableWebSockets: true,
});

// Use with ConnectionManager
const connectionManager = new ConnectionManager(identity);
connectionManager.setTransport(transport);
await connectionManager.start();
```

## Components

### ForestNode

Core libp2p node wrapper with transport configuration:

```typescript
import { ForestNode, createForestNode } from '@chicago-forest/libp2p-transport';

const node = await createForestNode({
  enableTCP: true,
  enableWebSockets: true,
  enableWebRTC: true,
  enableRelayServer: false,
  maxConnections: 100,
});

// Connect to peer
await node.dial('/ip4/127.0.0.1/tcp/4001/p2p/...');

// Event handling
node.addEventListener('peer:connect', (evt) => {
  console.log('Connected:', evt.detail.toString());
});
```

### ForestDiscovery

Peer discovery using DHT and mDNS:

```typescript
import { ForestDiscovery } from '@chicago-forest/libp2p-transport';

const discovery = new ForestDiscovery({
  enableDHT: true,
  enableMdns: true,
  bootstrapPeers: [...],
});

await discovery.start();

discovery.onPeerDiscovered((event) => {
  console.log('Found peer:', event.peerId);
});

// DHT operations
await discovery.put(key, value);
const value = await discovery.get(key);
```

### ForestPubSub

GossipSub-based publish/subscribe:

```typescript
import { ForestPubSub, FOREST_TOPICS } from '@chicago-forest/libp2p-transport';

const pubsub = new ForestPubSub({
  subscribeTopics: [FOREST_TOPICS.ANNOUNCEMENTS],
});

await pubsub.start();

// Subscribe and handle messages
pubsub.on(FOREST_TOPICS.ANNOUNCEMENTS, (msg) => {
  console.log('From:', msg.from);
  console.log('Data:', msg.data);
});

// Publish
await pubsub.announce({ message: 'Hello Forest!' }, nodeId);
```

### ForestProtocolManager

Custom protocol handlers:

```typescript
import { ForestProtocolManager, MessageFactory } from '@chicago-forest/libp2p-transport';

const protocols = new ForestProtocolManager(node.libp2p);
await protocols.registerProtocols();

// Handle incoming messages
protocols.onMessage(async (message, peerId) => {
  console.log('Message from', peerId, ':', message);
});

// Send messages
const response = await protocols.sendMessage(peerId, MessageFactory.hello(nodeId));
```

## Topics

Standard topics for Forest network communication:

| Topic | Description |
|-------|-------------|
| `/chicago-forest/pubsub/announcements` | Global announcements |
| `/chicago-forest/pubsub/peer-discovery` | Peer discovery broadcasts |
| `/chicago-forest/pubsub/status` | Network status updates |
| `/chicago-forest/pubsub/energy-data` | Energy data (theoretical) |
| `/chicago-forest/pubsub/governance` | Governance proposals |
| `/chicago-forest/pubsub/alerts` | Emergency alerts |

## Protocols

Custom protocols for direct peer communication:

| Protocol | Description |
|----------|-------------|
| `/chicago-forest/message/1.0.0` | Message exchange |
| `/chicago-forest/peer-exchange/1.0.0` | Peer discovery/exchange |
| `/chicago-forest/dht/1.0.0` | DHT operations |
| `/chicago-forest/relay/1.0.0` | Relay requests |
| `/chicago-forest/data/1.0.0` | Data transfer |

## Testing

```bash
pnpm test
```

## Building

```bash
pnpm build
```

## License

MIT

---

**Note**: This package is part of the Chicago Plasma Forest Network theoretical framework. It provides real, functional P2P networking capabilities using battle-tested libp2p, but the overall network vision is a conceptual framework for educational purposes.
