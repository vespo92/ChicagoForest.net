/**
 * @chicago-forest/p2p-core - Discovery Module
 *
 * Kademlia-style DHT for peer discovery in Chicago Forest Network.
 * Enables decentralized peer finding without central servers.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import type {
  NodeId,
  PeerInfo,
  PeerAddress,
  NodeIdentity,
} from '@chicago-forest/shared-types';
import { xorDistance, getBucketIndex } from '../identity';
import { ForestEventEmitter, getEventBus } from '../events';

/**
 * Configuration for the DHT
 */
export interface DHTConfig {
  /** Number of peers to keep in each bucket */
  bucketSize: number;
  /** Number of peers to query in parallel */
  alpha: number;
  /** Number of bits in node IDs (128 = 16 bytes) */
  idBits: number;
  /** Maximum time before a peer is considered stale (ms) */
  peerTimeout: number;
  /** Interval for refreshing buckets (ms) */
  refreshInterval: number;
  /** Maximum number of peers to return in a query */
  maxQueryResults: number;
}

/**
 * Default DHT configuration
 */
export const DEFAULT_DHT_CONFIG: DHTConfig = {
  bucketSize: 20, // k parameter in Kademlia
  alpha: 3,       // α parameter - parallelism
  idBits: 128,    // 16 bytes = 128 bits
  peerTimeout: 15 * 60 * 1000, // 15 minutes
  refreshInterval: 60 * 60 * 1000, // 1 hour
  maxQueryResults: 20,
};

/**
 * A bucket in the routing table
 */
interface RoutingBucket {
  peers: PeerInfo[];
  lastRefresh: number;
}

/**
 * Distributed Hash Table for peer discovery
 */
export class KademliaDHT {
  private readonly localNodeId: NodeId;
  private readonly config: DHTConfig;
  private readonly routingTable: RoutingBucket[];
  private readonly eventBus: ForestEventEmitter;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    localNodeId: NodeId,
    config: Partial<DHTConfig> = {},
    eventBus?: ForestEventEmitter
  ) {
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_DHT_CONFIG, ...config };
    this.eventBus = eventBus ?? getEventBus();

    // Initialize routing table buckets
    this.routingTable = Array.from({ length: this.config.idBits }, () => ({
      peers: [],
      lastRefresh: Date.now(),
    }));
  }

  /**
   * Start the DHT (begin refresh cycles)
   */
  start(): void {
    if (this.refreshTimer) return;

    this.refreshTimer = setInterval(() => {
      this.refreshBuckets();
    }, this.config.refreshInterval);
  }

  /**
   * Stop the DHT
   */
  stop(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Add or update a peer in the routing table
   */
  addPeer(peer: PeerInfo): boolean {
    if (peer.nodeId === this.localNodeId) {
      return false; // Don't add ourselves
    }

    const bucketIndex = getBucketIndex(this.localNodeId, peer.nodeId);
    const bucket = this.routingTable[bucketIndex];

    if (!bucket) {
      return false; // Invalid bucket index
    }

    // Check if peer already exists
    const existingIndex = bucket.peers.findIndex((p) => p.nodeId === peer.nodeId);

    if (existingIndex >= 0) {
      // Update existing peer and move to end (most recently seen)
      bucket.peers.splice(existingIndex, 1);
      bucket.peers.push({ ...peer, lastSeen: Date.now() });
      return true;
    }

    // Add new peer
    if (bucket.peers.length < this.config.bucketSize) {
      bucket.peers.push({ ...peer, lastSeen: Date.now() });
      this.eventBus.emitEvent('peer:discovered', { peer });
      return true;
    }

    // Bucket is full - check if oldest peer is stale
    const oldest = bucket.peers[0];
    if (Date.now() - oldest.lastSeen > this.config.peerTimeout) {
      // Replace stale peer
      bucket.peers.shift();
      bucket.peers.push({ ...peer, lastSeen: Date.now() });
      this.eventBus.emitEvent('peer:discovered', { peer });
      return true;
    }

    // Bucket full and no stale peers - discard new peer
    return false;
  }

  /**
   * Remove a peer from the routing table
   */
  removePeer(nodeId: NodeId): boolean {
    const bucketIndex = getBucketIndex(this.localNodeId, nodeId);
    const bucket = this.routingTable[bucketIndex];

    if (!bucket) return false;

    const index = bucket.peers.findIndex((p) => p.nodeId === nodeId);
    if (index >= 0) {
      bucket.peers.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Get a peer by node ID
   */
  getPeer(nodeId: NodeId): PeerInfo | null {
    const bucketIndex = getBucketIndex(this.localNodeId, nodeId);
    const bucket = this.routingTable[bucketIndex];

    if (!bucket) return null;

    return bucket.peers.find((p) => p.nodeId === nodeId) ?? null;
  }

  /**
   * Find the k closest peers to a target node ID
   */
  findClosestPeers(targetNodeId: NodeId, count?: number): PeerInfo[] {
    const k = count ?? this.config.maxQueryResults;
    const allPeers: Array<{ peer: PeerInfo; distance: bigint }> = [];

    // Collect all peers with their distances
    for (const bucket of this.routingTable) {
      for (const peer of bucket.peers) {
        const distance = xorDistance(targetNodeId, peer.nodeId);
        allPeers.push({ peer, distance });
      }
    }

    // Sort by distance and return closest k
    allPeers.sort((a, b) => {
      if (a.distance < b.distance) return -1;
      if (a.distance > b.distance) return 1;
      return 0;
    });

    return allPeers.slice(0, k).map((p) => p.peer);
  }

  /**
   * Get all peers in the routing table
   */
  getAllPeers(): PeerInfo[] {
    const peers: PeerInfo[] = [];
    for (const bucket of this.routingTable) {
      peers.push(...bucket.peers);
    }
    return peers;
  }

  /**
   * Get the count of peers in each bucket (for debugging)
   */
  getBucketStats(): Array<{ index: number; count: number; lastRefresh: number }> {
    return this.routingTable.map((bucket, index) => ({
      index,
      count: bucket.peers.length,
      lastRefresh: bucket.lastRefresh,
    })).filter((b) => b.count > 0);
  }

  /**
   * Get total peer count
   */
  getPeerCount(): number {
    return this.routingTable.reduce((sum, bucket) => sum + bucket.peers.length, 0);
  }

  /**
   * Refresh stale buckets by looking up random IDs in their range
   */
  private refreshBuckets(): void {
    const now = Date.now();

    for (let i = 0; i < this.routingTable.length; i++) {
      const bucket = this.routingTable[i];
      if (now - bucket.lastRefresh > this.config.refreshInterval) {
        // This bucket needs refresh - in a real implementation,
        // we would look up a random ID in this bucket's range
        bucket.lastRefresh = now;

        // Remove stale peers
        bucket.peers = bucket.peers.filter(
          (peer) => now - peer.lastSeen < this.config.peerTimeout
        );
      }
    }
  }

  /**
   * Process a FIND_NODE response and add peers to routing table
   */
  processFindNodeResponse(peers: PeerInfo[]): number {
    let added = 0;
    for (const peer of peers) {
      if (this.addPeer(peer)) {
        added++;
      }
    }
    return added;
  }

  /**
   * Export routing table for persistence
   */
  export(): PeerInfo[] {
    return this.getAllPeers();
  }

  /**
   * Import peers from persistence
   */
  import(peers: PeerInfo[]): number {
    let imported = 0;
    for (const peer of peers) {
      if (this.addPeer(peer)) {
        imported++;
      }
    }
    return imported;
  }
}

/**
 * Bootstrap the DHT with known peers
 */
export async function bootstrapDHT(
  dht: KademliaDHT,
  bootstrapPeers: PeerInfo[]
): Promise<number> {
  let added = 0;
  for (const peer of bootstrapPeers) {
    if (dht.addPeer(peer)) {
      added++;
    }
  }
  return added;
}

/**
 * Hardcoded bootstrap peers for initial network connection
 * In production, these would be well-known stable nodes
 */
export const BOOTSTRAP_PEERS: PeerInfo[] = [
  // These are placeholder addresses for the theoretical network
  // In a real deployment, these would be actual bootstrap nodes
];

/**
 * Create a random node ID for testing or bucket refresh
 */
export function generateRandomNodeId(): NodeId {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `CFN-${hex}`;
}

export default {
  KademliaDHT,
  bootstrapDHT,
  generateRandomNodeId,
  DEFAULT_DHT_CONFIG,
  BOOTSTRAP_PEERS,
};
