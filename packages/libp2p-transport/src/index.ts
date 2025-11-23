/**
 * @chicago-forest/libp2p-transport
 *
 * Production P2P networking layer using libp2p for Chicago Forest Network.
 * Provides battle-tested networking with full transport support.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @example
 * ```typescript
 * import {
 *   createForestNode,
 *   createLibp2pTransport,
 *   ForestDiscovery,
 *   ForestPubSub,
 * } from '@chicago-forest/libp2p-transport';
 *
 * // Create a production P2P node
 * const node = await createForestNode({
 *   enableTCP: true,
 *   enableWebSockets: true,
 *   enableWebRTC: true,
 * });
 *
 * // Get listen addresses
 * console.log('Listening on:', node.getMultiaddrs());
 *
 * // Create transport adapter for p2p-core
 * const transport = await createLibp2pTransport();
 *
 * // Use with ConnectionManager
 * connectionManager.setTransport(transport);
 * ```
 */

// Node exports
export {
  ForestNode,
  createForestNode,
  DEFAULT_FOREST_NODE_CONFIG,
  type ForestNodeConfig,
} from './node';

// Transport adapter exports
export {
  Libp2pTransport,
  Libp2pStreamConnection,
  createLibp2pTransport,
  MessageCodec,
  FOREST_PROTOCOL,
} from './transport-adapter';

// Discovery exports
export {
  ForestDiscovery,
  createDiscoveryNode,
  DEFAULT_DISCOVERY_CONFIG,
  type ForestDiscoveryConfig,
  type DiscoveryMode,
  type DiscoveredPeerEvent,
  type DiscoveryEventHandler,
} from './discovery';

// Protocol exports
export {
  ForestProtocolManager,
  createProtocolManager,
  MessageFactory,
  PROTOCOL_PREFIX,
  FOREST_PROTOCOLS,
  type ProtocolHandler,
  type MessageRequest,
  type MessageResponse,
  type PeerExchangeRequest,
  type PeerExchangeResponse,
} from './protocols';

// PubSub exports
export {
  ForestPubSub,
  createForestPubSub,
  attachPubSub,
  createTopic,
  DEFAULT_PUBSUB_CONFIG,
  TOPIC_PREFIX,
  FOREST_TOPICS,
  type ForestPubSubConfig,
  type PubSubMessage,
  type PubSubHandler,
} from './pubsub';

// Re-export useful libp2p types
export type { Multiaddr } from '@multiformats/multiaddr';
export { multiaddr } from '@multiformats/multiaddr';

/**
 * Package version
 */
export const VERSION = '0.1.0';

/**
 * Package identifier
 */
export const PACKAGE_ID = '@chicago-forest/libp2p-transport';

/**
 * Quick start - create a complete Forest P2P stack
 *
 * @example
 * ```typescript
 * const stack = await createForestStack({
 *   enableDHT: true,
 *   enablePubSub: true,
 *   bootstrapPeers: ['/ip4/...'],
 * });
 *
 * // Access components
 * stack.node;      // ForestNode
 * stack.transport; // Libp2pTransport
 * stack.discovery; // ForestDiscovery
 * stack.pubsub;    // ForestPubSub
 * ```
 */
export interface ForestStackConfig {
  /** Node configuration */
  nodeConfig?: import('./node').ForestNodeConfig;
  /** Discovery configuration */
  discoveryConfig?: import('./discovery').ForestDiscoveryConfig;
  /** PubSub configuration */
  pubsubConfig?: import('./pubsub').ForestPubSubConfig;
  /** Enable DHT discovery */
  enableDHT?: boolean;
  /** Enable PubSub */
  enablePubSub?: boolean;
  /** Bootstrap peer multiaddrs */
  bootstrapPeers?: string[];
}

/**
 * Complete Forest P2P stack
 */
export interface ForestStack {
  /** The libp2p node */
  node: import('./node').ForestNode;
  /** Transport adapter for p2p-core */
  transport: import('./transport-adapter').Libp2pTransport;
  /** Discovery service (if enabled) */
  discovery?: import('./discovery').ForestDiscovery;
  /** PubSub service (if enabled) */
  pubsub?: import('./pubsub').ForestPubSub;
  /** Protocol manager */
  protocols: import('./protocols').ForestProtocolManager;
  /** Stop all services */
  stop: () => Promise<void>;
}

/**
 * Create a complete Forest P2P stack with all services
 */
export async function createForestStack(config: ForestStackConfig = {}): Promise<ForestStack> {
  const { ForestNode } = await import('./node');
  const { Libp2pTransport } = await import('./transport-adapter');
  const { ForestDiscovery } = await import('./discovery');
  const { ForestPubSub } = await import('./pubsub');
  const { ForestProtocolManager } = await import('./protocols');

  // Create node with bootstrap peers
  const node = new ForestNode({
    ...config.nodeConfig,
    bootstrapPeers: config.bootstrapPeers ?? config.nodeConfig?.bootstrapPeers,
  });
  await node.start();

  // Create transport
  const transport = new Libp2pTransport(node);

  // Create protocol manager
  const protocols = new ForestProtocolManager(node.libp2p);
  await protocols.registerProtocols();

  // Create discovery if enabled
  let discovery: ForestDiscovery | undefined;
  if (config.enableDHT !== false) {
    discovery = new ForestDiscovery({
      ...config.discoveryConfig,
      bootstrapPeers: config.bootstrapPeers ?? config.discoveryConfig?.bootstrapPeers,
    });
    await discovery.start(node.libp2p);
  }

  // Create pubsub if enabled
  let pubsub: ForestPubSub | undefined;
  if (config.enablePubSub !== false) {
    pubsub = new ForestPubSub(config.pubsubConfig);
    await pubsub.start(node.libp2p);
  }

  // Stop function
  const stop = async () => {
    await protocols.unregisterProtocols();
    if (pubsub) await pubsub.stop();
    if (discovery) await discovery.stop();
    await transport.closeAll();
    await node.stop();
  };

  return {
    node,
    transport,
    discovery,
    pubsub,
    protocols,
    stop,
  };
}

export default {
  VERSION,
  PACKAGE_ID,
  createForestStack,
};
