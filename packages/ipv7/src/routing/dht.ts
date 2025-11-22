/**
 * IPV7 Distributed Hash Table (DHT)
 *
 * THEORETICAL FRAMEWORK - Kademlia-inspired DHT for decentralized
 * peer discovery and data storage.
 *
 * Key features:
 * - XOR-based distance metric
 * - k-bucket structure for routing
 * - Geohash-aware peer selection
 */

import { EventEmitter } from 'events';
import {
  IPV7Address,
  PeerInfo,
  DHTEntry,
} from '../types.js';
import { xorDistance, leadingZeros, hash } from '../crypto/index.js';
import { addressEquals, routingDistance } from '../address/index.js';

/** Number of bits in node ID */
const ID_BITS = 128;

/** k-bucket size (max peers per bucket) */
const K = 20;

/** Replication factor */
const REPLICATION = 3;

/** Entry TTL in milliseconds */
const ENTRY_TTL = 3600000; // 1 hour

/**
 * K-Bucket for storing peers at a specific distance
 */
class KBucket {
  readonly peers: PeerInfo[] = [];
  readonly maxSize: number;
  lastUpdated: number = Date.now();

  constructor(maxSize: number = K) {
    this.maxSize = maxSize;
  }

  /**
   * Add or update a peer in the bucket
   */
  add(peer: PeerInfo): boolean {
    // Check if peer already exists
    const existingIndex = this.peers.findIndex((p) =>
      addressEquals(p.address, peer.address)
    );

    if (existingIndex >= 0) {
      // Update existing peer (move to end = most recently seen)
      this.peers.splice(existingIndex, 1);
      this.peers.push(peer);
      this.lastUpdated = Date.now();
      return true;
    }

    // Add new peer if space available
    if (this.peers.length < this.maxSize) {
      this.peers.push(peer);
      this.lastUpdated = Date.now();
      return true;
    }

    // Bucket full - could ping oldest peer and evict if unresponsive
    // For now, reject new peer
    return false;
  }

  /**
   * Remove a peer from the bucket
   */
  remove(address: IPV7Address): boolean {
    const index = this.peers.findIndex((p) =>
      addressEquals(p.address, address)
    );
    if (index >= 0) {
      this.peers.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all peers in the bucket
   */
  getAll(): PeerInfo[] {
    return [...this.peers];
  }

  /**
   * Get bucket size
   */
  get size(): number {
    return this.peers.length;
  }
}

/**
 * DHT for IPV7 network
 */
export class DHT extends EventEmitter {
  private readonly localAddress: IPV7Address;
  private readonly buckets: KBucket[];
  private readonly storage: Map<string, DHTEntry>;

  constructor(localAddress: IPV7Address) {
    super();
    this.localAddress = localAddress;
    this.buckets = Array.from({ length: ID_BITS }, () => new KBucket());
    this.storage = new Map();

    // Periodic cleanup
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get bucket index for a peer based on XOR distance
   */
  private getBucketIndex(address: IPV7Address): number {
    const distance = xorDistance(this.localAddress.nodeId, address.nodeId);
    const zeros = leadingZeros(distance);
    return Math.min(zeros, ID_BITS - 1);
  }

  /**
   * Add a peer to the routing table
   */
  addPeer(peer: PeerInfo): boolean {
    if (addressEquals(peer.address, this.localAddress)) {
      return false; // Don't add self
    }

    const bucketIndex = this.getBucketIndex(peer.address);
    const added = this.buckets[bucketIndex].add(peer);

    if (added) {
      this.emit('peer:added', peer);
    }

    return added;
  }

  /**
   * Remove a peer from the routing table
   */
  removePeer(address: IPV7Address): boolean {
    const bucketIndex = this.getBucketIndex(address);
    const removed = this.buckets[bucketIndex].remove(address);

    if (removed) {
      this.emit('peer:removed', address);
    }

    return removed;
  }

  /**
   * Update peer's last seen time
   */
  updatePeer(address: IPV7Address): void {
    const bucketIndex = this.getBucketIndex(address);
    const peer = this.buckets[bucketIndex].peers.find((p) =>
      addressEquals(p.address, address)
    );
    if (peer) {
      peer.lastSeen = Date.now();
    }
  }

  /**
   * Find the k closest peers to a target address
   */
  findClosestPeers(target: IPV7Address, count: number = K): PeerInfo[] {
    const allPeers: PeerInfo[] = [];

    for (const bucket of this.buckets) {
      allPeers.push(...bucket.getAll());
    }

    // Sort by routing distance (combines geohash proximity and XOR distance)
    allPeers.sort(
      (a, b) =>
        routingDistance(a.address, target) - routingDistance(b.address, target)
    );

    return allPeers.slice(0, count);
  }

  /**
   * Find peers in the same geographic area
   */
  findPeersByGeohash(geohash: string): PeerInfo[] {
    const peers: PeerInfo[] = [];

    for (const bucket of this.buckets) {
      for (const peer of bucket.getAll()) {
        if (peer.address.geohash.startsWith(geohash)) {
          peers.push(peer);
        }
      }
    }

    return peers;
  }

  /**
   * Store a value in the DHT
   */
  store(key: Uint8Array, value: Uint8Array, publisher: IPV7Address): void {
    const keyHex = Buffer.from(key).toString('hex');

    const entry: DHTEntry = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ENTRY_TTL,
      publisher,
      signature: new Uint8Array(0), // Would be signed in production
    };

    this.storage.set(keyHex, entry);
    this.emit('entry:stored', entry);
  }

  /**
   * Retrieve a value from the DHT
   */
  get(key: Uint8Array): DHTEntry | undefined {
    const keyHex = Buffer.from(key).toString('hex');
    const entry = this.storage.get(keyHex);

    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry;
    }

    return undefined;
  }

  /**
   * Delete a value from the DHT
   */
  delete(key: Uint8Array): boolean {
    const keyHex = Buffer.from(key).toString('hex');
    return this.storage.delete(keyHex);
  }

  /**
   * Get peers that should store a key (based on closeness)
   */
  getStorageNodes(key: Uint8Array): PeerInfo[] {
    // Create a fake address from the key for distance calculation
    const targetAddress: IPV7Address = {
      version: 7,
      flags: 0,
      geohash: '0000',
      nodeId: new Uint8Array(key.subarray(0, 16)),
      checksum: 0,
    };

    return this.findClosestPeers(targetAddress, REPLICATION);
  }

  /**
   * Get total number of peers
   */
  getPeerCount(): number {
    return this.buckets.reduce((sum, bucket) => sum + bucket.size, 0);
  }

  /**
   * Get all known peers
   */
  getAllPeers(): PeerInfo[] {
    const peers: PeerInfo[] = [];
    for (const bucket of this.buckets) {
      peers.push(...bucket.getAll());
    }
    return peers;
  }

  /**
   * Get a random peer (for bootstrap/discovery)
   */
  getRandomPeer(): PeerInfo | undefined {
    const allPeers = this.getAllPeers();
    if (allPeers.length === 0) return undefined;
    return allPeers[Math.floor(Math.random() * allPeers.length)];
  }

  /**
   * Cleanup expired entries and stale peers
   */
  private cleanup(): void {
    const now = Date.now();
    const staleThreshold = 300000; // 5 minutes

    // Clean up storage
    for (const [keyHex, entry] of this.storage) {
      if (now - entry.timestamp > entry.ttl) {
        this.storage.delete(keyHex);
        this.emit('entry:expired', entry);
      }
    }

    // Mark stale peers
    for (const bucket of this.buckets) {
      for (const peer of bucket.peers) {
        if (now - peer.lastSeen > staleThreshold) {
          this.emit('peer:stale', peer);
        }
      }
    }
  }

  /**
   * Get routing table statistics
   */
  getStats(): {
    totalPeers: number;
    bucketSizes: number[];
    storageEntries: number;
  } {
    return {
      totalPeers: this.getPeerCount(),
      bucketSizes: this.buckets.map((b) => b.size),
      storageEntries: this.storage.size,
    };
  }
}

/**
 * Generate a DHT key from arbitrary data
 */
export function generateDHTKey(data: string | Uint8Array): Uint8Array {
  const input = typeof data === 'string' ? Buffer.from(data) : data;
  return hash(input);
}
