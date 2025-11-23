/**
 * @chicago-forest/p2p-core
 *
 * Core P2P networking primitives for Chicago Forest Network.
 * Provides node identity, peer discovery, and connection management.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @example
 * ```typescript
 * import {
 *   createNodeIdentity,
 *   KademliaDHT,
 *   ConnectionManager,
 *   getEventBus,
 * } from '@chicago-forest/p2p-core';
 *
 * // Create a new node
 * const identity = await createNodeIdentity();
 * console.log('Node ID:', identity.nodeId);
 *
 * // Set up peer discovery
 * const dht = new KademliaDHT(identity.nodeId);
 * dht.start();
 *
 * // Set up connection manager
 * const connections = new ConnectionManager(identity);
 * await connections.start();
 *
 * // Listen for events
 * getEventBus().onEvent('peer:discovered', (event) => {
 *   console.log('Found peer:', event.data.peer.nodeId);
 * });
 * ```
 */

// Identity exports
export {
  generateKeyPair,
  generateKeyPairSync,
  createNodeIdentity,
  createNodeIdentitySync,
  restoreIdentity,
  deriveNodeId,
  signMessage,
  signMessageSync,
  verifySignature,
  verifySignatureSync,
  validateNodeId,
  createPeerInfo,
  serializeIdentity,
  deserializeIdentity,
  xorDistance,
  getBucketIndex,
  IDENTITY_VERSION,
  NODE_ID_PREFIX,
} from './identity';

// Events exports
export {
  ForestEventEmitter,
  getEventBus,
  resetEventBus,
  createEventFilter,
  debounceEventHandler,
  throttleEventHandler,
  type EventDataMap,
} from './events';

// Discovery exports
export {
  KademliaDHT,
  bootstrapDHT,
  generateRandomNodeId,
  DEFAULT_DHT_CONFIG,
  BOOTSTRAP_PEERS,
  type DHTConfig,
} from './discovery';

// Connection exports
export {
  ConnectionManager,
  createMessageId,
  createMessage,
  DEFAULT_CONNECTION_CONFIG,
  type ConnectionManagerConfig,
  type Transport,
  type TransportConnection,
} from './connection';

// Re-export types from shared-types for convenience
export type {
  NodeId,
  PublicKey,
  PrivateKey,
  KeyPair,
  NodeIdentity,
  PeerAddress,
  PeerInfo,
  NodeCapability,
  ConnectionState,
  PeerConnection,
  MessageType,
  Message,
  NetworkEventType,
  NetworkEvent,
  EventHandler,
} from '@chicago-forest/shared-types';

/**
 * Package version
 */
export const VERSION = '0.1.0';

/**
 * Forest network identifier
 */
export const NETWORK_ID = 'chicago-forest-mainnet';

/**
 * Protocol version
 */
export const PROTOCOL_VERSION = 1;
