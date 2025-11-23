/**
 * @chicago-forest/hyperswarm-transport - Type Definitions
 *
 * Type definitions for Hyperswarm-based NAT traversal transport.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. Part of Chicago Forest Network's P2P infrastructure.
 */

import type { PeerAddress, NodeId } from '@chicago-forest/shared-types';

/**
 * Hyperswarm transport configuration
 */
export interface HyperswarmTransportConfig {
  /** Bootstrap DHT nodes for initial discovery */
  bootstrap?: string[];
  /** Maximum number of peer connections */
  maxPeers?: number;
  /** Firewall function to filter incoming connections */
  firewall?: (remotePublicKey: Buffer, payload: unknown) => boolean;
  /** Enable DHT server mode (helps other peers with NAT traversal) */
  dhtServer?: boolean;
  /** Custom DHT instance (for testing or advanced use) */
  dht?: unknown;
  /** Seed for deterministic key generation (32 bytes) */
  seed?: Buffer;
  /** Connection timeout in ms */
  connectionTimeout?: number;
  /** Enable relay connections for peers behind strict NAT */
  enableRelay?: boolean;
}

/**
 * Default transport configuration
 */
export const DEFAULT_HYPERSWARM_CONFIG: Required<
  Omit<HyperswarmTransportConfig, 'dht' | 'seed' | 'firewall'>
> = {
  bootstrap: [],
  maxPeers: 64,
  dhtServer: false,
  connectionTimeout: 10000,
  enableRelay: true,
};

/**
 * Connection info from Hyperswarm
 */
export interface HyperswarmPeerInfo {
  /** Remote peer's public key */
  publicKey: Buffer;
  /** Remote address (if known) */
  remoteAddress?: string;
  /** Remote port (if known) */
  remotePort?: number;
  /** Whether this is an incoming connection */
  client: boolean;
  /** Connection type */
  type: 'tcp' | 'utp' | 'relay';
  /** Whether NAT hole punching was used */
  holepunched: boolean;
}

/**
 * Topic for peer discovery
 */
export interface SwarmTopic {
  /** Topic hash (32 bytes) */
  topic: Buffer;
  /** Human-readable name (optional) */
  name?: string;
  /** Whether we're announcing on this topic */
  announcing: boolean;
  /** Whether we're looking for peers on this topic */
  looking: boolean;
}

/**
 * Peer discovery event
 */
export interface PeerDiscoveryEvent {
  /** Discovered peer info */
  peer: HyperswarmPeerInfo;
  /** Topic where peer was found */
  topic?: Buffer;
  /** Discovery source */
  source: 'dht' | 'local' | 'relay';
}

/**
 * NAT traversal statistics
 */
export interface NATStats {
  /** Our detected NAT type */
  natType: NATType;
  /** Whether we can accept incoming connections */
  reachable: boolean;
  /** Number of successful hole punches */
  holepunchesSucceeded: number;
  /** Number of failed hole punches */
  holepunchesFailed: number;
  /** Number of relay connections */
  relayConnections: number;
  /** Public IP address (if detected) */
  publicAddress?: string;
  /** Public port (if detected) */
  publicPort?: number;
}

/**
 * NAT type classification
 */
export type NATType =
  | 'open'              // Direct connectivity, no NAT
  | 'full-cone'         // Easy NAT traversal
  | 'restricted-cone'   // Moderate difficulty
  | 'port-restricted'   // Harder NAT traversal
  | 'symmetric'         // Most difficult, may require relay
  | 'unknown';          // Not yet determined

/**
 * Transport events
 */
export interface HyperswarmTransportEvents {
  'connection': (info: HyperswarmPeerInfo) => void;
  'disconnection': (publicKey: Buffer) => void;
  'peer:discovered': (event: PeerDiscoveryEvent) => void;
  'topic:joined': (topic: SwarmTopic) => void;
  'topic:left': (topic: Buffer) => void;
  'nat:updated': (stats: NATStats) => void;
  'error': (error: Error) => void;
  'ready': () => void;
  'close': () => void;
}

/**
 * Convert Hyperswarm public key to CFN node ID
 */
export function publicKeyToNodeId(publicKey: Buffer): NodeId {
  const hex = publicKey.slice(0, 16).toString('hex');
  return `CFN-${hex}` as NodeId;
}

/**
 * Create a peer address from Hyperswarm connection info
 */
export function createPeerAddress(info: HyperswarmPeerInfo): PeerAddress {
  const host = info.remoteAddress ?? 'unknown';
  const port = info.remotePort ?? 0;
  const protocol = info.type === 'relay' ? 'relay' : info.type;

  return {
    protocol: protocol as PeerAddress['protocol'],
    host,
    port,
    publicKey: info.publicKey.toString('hex'),
  };
}
