# @chicago-forest/hyperswarm-transport

Hyperswarm-based P2P transport with excellent NAT traversal for the Chicago Forest Network.

> **DISCLAIMER**: This is an AI-generated theoretical framework for educational and research purposes. Part of the Chicago Forest Network's P2P infrastructure.

## Features

- **Excellent NAT Traversal**: Automatic UDP/TCP hole punching handles most NAT types
- **DHT Discovery**: Topic-based peer discovery via distributed hash table
- **Relay Fallback**: Connections can relay through helpers for symmetric NATs
- **Simple API**: Much simpler than raw libp2p
- **Noise Encryption**: All connections are encrypted end-to-end
- **Holepunch Ecosystem**: Built on the battle-tested Holepunch/Hypercore stack

## Why Hyperswarm?

| Feature | libp2p | Hyperswarm |
|---------|--------|------------|
| NAT Traversal | Good (requires config) | Excellent (automatic) |
| API Complexity | High | Low |
| DHT Discovery | Yes | Yes |
| Encryption | Configurable | Always (Noise) |
| Relay Support | Yes | Yes |
| Browser Support | Yes | Limited |

Hyperswarm is ideal for mesh networks where:
- Peers are behind various NAT types
- Simple setup is preferred over configurability
- Server-grade NAT traversal is needed
- Topic-based discovery fits the use case

## Installation

```bash
pnpm add @chicago-forest/hyperswarm-transport
```

## Quick Start

```typescript
import { createHyperswarmTransport } from '@chicago-forest/hyperswarm-transport';

// Create and initialize transport
const transport = createHyperswarmTransport({
  dhtServer: true, // Help other peers with NAT traversal
  maxPeers: 64,
});

await transport.ready();

// Join a topic to find peers
await transport.joinTopic('my-application-topic');

// Handle new connections
transport.on('connection', (info) => {
  console.log('Connected to:', info.publicKey.toString('hex'));
  console.log('Connection type:', info.type); // tcp, utp, or relay
  console.log('Holepunched:', info.holepunched);
});

// Get a connection wrapper to send/receive data
const connection = transport.getConnection(peerPublicKey);
if (connection) {
  await connection.send(new TextEncoder().encode('Hello!'));

  connection.onData((data) => {
    console.log('Received:', new TextDecoder().decode(data));
  });
}
```

## Chicago Forest Network Integration

```typescript
import { createChicagoForestTransport } from '@chicago-forest/hyperswarm-transport';

// Create pre-configured transport for Chicago Forest Network
const transport = await createChicagoForestTransport({
  server: true, // Run as DHT server to help network
});

// Already joined the Chicago Forest topic
console.log('Connected peers:', transport.connections.size);
console.log('NAT type:', transport.natStats.natType);
```

## API Reference

### `HyperswarmTransport`

Main transport class implementing the p2p-core `Transport` interface.

#### Constructor Options

```typescript
interface HyperswarmTransportConfig {
  bootstrap?: string[];        // DHT bootstrap nodes
  maxPeers?: number;          // Max connections (default: 64)
  dhtServer?: boolean;        // Help others with NAT (default: false)
  connectionTimeout?: number; // Connect timeout ms (default: 10000)
  enableRelay?: boolean;      // Use relays (default: true)
  seed?: Buffer;              // Deterministic key seed (32 bytes)
  firewall?: (key, payload) => boolean; // Filter connections
}
```

#### Methods

- `ready(): Promise<void>` - Initialize the swarm
- `joinTopic(topic, options): Promise<SwarmTopic>` - Join a discovery topic
- `leaveTopic(topic): Promise<void>` - Leave a topic
- `connect(address): Promise<TransportConnection>` - Connect to peer (prefer topics)
- `listen(address): Promise<void>` - Start listening
- `stopListening(): Promise<void>` - Stop listening
- `closeAll(): Promise<void>` - Close all connections
- `destroy(): Promise<void>` - Destroy transport and cleanup

#### Properties

- `publicKey: Buffer` - Our public key
- `nodeId: string` - Our CFN node ID
- `natStats: NATStats` - NAT traversal statistics
- `connections: ConnectionPool` - Active connections
- `activeTopics: SwarmTopic[]` - Joined topics
- `isReady: boolean` - Whether transport is initialized

### `HyperswarmConnection`

Wraps a Hyperswarm socket for the p2p-core interface.

#### Methods

- `send(data: Uint8Array): Promise<void>` - Send data
- `close(): Promise<void>` - Close connection
- `onData(handler): void` - Handle incoming data
- `onClose(handler): void` - Handle close
- `onError(handler): void` - Handle errors

#### Properties

- `remotePublicKey: Buffer` - Peer's public key
- `remoteNodeId: string` - Peer's CFN node ID
- `wasHolepunched: boolean` - If NAT was holepunched
- `connectionType: 'tcp' | 'utp' | 'relay'` - Connection type
- `isOpen: boolean` - Connection state

### NAT Types

The transport detects and reports NAT types:

| Type | Traversal | Description |
|------|-----------|-------------|
| `open` | Direct | No NAT, public IP |
| `full-cone` | Easy | Most permissive NAT |
| `restricted-cone` | Moderate | Some filtering |
| `port-restricted` | Harder | More filtering |
| `symmetric` | Relay needed | Different port per dest |
| `unknown` | TBD | Not yet determined |

## Events

```typescript
transport.on('connection', (info: HyperswarmPeerInfo) => {});
transport.on('disconnection', (publicKey: Buffer) => {});
transport.on('peer:discovered', (event: PeerDiscoveryEvent) => {});
transport.on('topic:joined', (topic: SwarmTopic) => {});
transport.on('topic:left', (topic: Buffer) => {});
transport.on('nat:updated', (stats: NATStats) => {});
transport.on('error', (error: Error) => {});
transport.on('ready', () => {});
transport.on('close', () => {});
```

## Testing

```bash
pnpm test
```

Note: Full integration tests require network connectivity and multiple peers. Unit tests use mocks.

## Related Packages

- `@chicago-forest/p2p-core` - Core P2P primitives this transport plugs into
- `@chicago-forest/shared-types` - Shared type definitions
- `hyperswarm` - Underlying Holepunch library
- `hyperdht` - DHT implementation

## Resources

- [Hyperswarm Documentation](https://docs.holepunch.to/building-blocks/hyperswarm)
- [Holepunch Platform](https://holepunch.to/)
- [NAT Traversal Techniques](https://docs.holepunch.to/building-blocks/hyperdht#nat-traversal)

## License

MIT
