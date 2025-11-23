/**
 * @chicago-forest/hyperswarm-transport
 *
 * Hyperswarm-based P2P transport with excellent NAT traversal for Chicago Forest Network.
 *
 * This package provides a transport implementation using Hyperswarm from the Holepunch
 * ecosystem. It offers several advantages:
 *
 * - **Simple API**: Much easier to use than raw libp2p
 * - **Excellent NAT Traversal**: Automatic UDP/TCP hole punching
 * - **DHT Discovery**: Topic-based peer discovery
 * - **Relay Fallback**: For symmetric NATs that can't be hole-punched
 * - **Noise Encryption**: Secure peer-to-peer connections
 *
 * @example
 * ```typescript
 * import { createHyperswarmTransport } from '@chicago-forest/hyperswarm-transport';
 *
 * // Create transport
 * const transport = createHyperswarmTransport({
 *   dhtServer: true, // Help other peers with NAT traversal
 * });
 *
 * // Initialize
 * await transport.ready();
 *
 * // Join the Chicago Forest Network topic
 * await transport.joinTopic('chicago-forest-mainnet');
 *
 * // Handle connections
 * transport.on('connection', (info) => {
 *   console.log('New peer:', info.publicKey.toString('hex'));
 *   console.log('Connection type:', info.type);
 *   console.log('Holepunched:', info.holepunched);
 * });
 *
 * // Get connection stats
 * console.log('NAT Type:', transport.natStats.natType);
 * console.log('Connected peers:', transport.connections.size);
 * ```
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. Part of Chicago Forest Network's P2P infrastructure.
 *
 * @packageDocumentation
 */

// Main transport class
export { HyperswarmTransport, createHyperswarmTransport } from './transport';

// Connection wrapper
export { HyperswarmConnection, ConnectionPool } from './connection';

// Types
export {
  // Configuration
  type HyperswarmTransportConfig,
  DEFAULT_HYPERSWARM_CONFIG,
  // Connection info
  type HyperswarmPeerInfo,
  type SwarmTopic,
  type PeerDiscoveryEvent,
  // NAT types
  type NATStats,
  type NATType,
  // Events
  type HyperswarmTransportEvents,
  // Utilities
  publicKeyToNodeId,
  createPeerAddress,
} from './types';

/**
 * Package version
 */
export const VERSION = '0.1.0';

/**
 * Default network topic for Chicago Forest Network
 */
export const CHICAGO_FOREST_TOPIC = 'chicago-forest-mainnet-v1';

/**
 * Bootstrap DHT nodes for the Chicago Forest Network
 *
 * These are public Hyperswarm DHT bootstrap nodes.
 * In production, we would add our own community-maintained bootstrap nodes.
 */
export const BOOTSTRAP_NODES: string[] = [
  // Using default Hyperswarm bootstrap nodes
  // Community nodes would be added here
];

/**
 * Create a preconfigured transport for Chicago Forest Network
 */
export async function createChicagoForestTransport(options: {
  /** Enable DHT server mode to help with NAT traversal */
  server?: boolean;
  /** Maximum peer connections */
  maxPeers?: number;
  /** Additional bootstrap nodes */
  additionalBootstrap?: string[];
} = {}): Promise<import('./transport').HyperswarmTransport> {
  const { HyperswarmTransport } = await import('./transport');

  const transport = new HyperswarmTransport({
    dhtServer: options.server ?? false,
    maxPeers: options.maxPeers ?? 64,
    bootstrap: [
      ...BOOTSTRAP_NODES,
      ...(options.additionalBootstrap ?? []),
    ],
    enableRelay: true,
  });

  await transport.ready();
  await transport.joinTopic(CHICAGO_FOREST_TOPIC, {
    name: 'Chicago Forest Network',
    announce: true,
    lookup: true,
  });

  return transport;
}
