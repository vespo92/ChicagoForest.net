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
import { IPV7Address, PeerInfo, DHTEntry } from '../types.js';
/**
 * DHT for IPV7 network
 */
export declare class DHT extends EventEmitter {
    private readonly localAddress;
    private readonly buckets;
    private readonly storage;
    constructor(localAddress: IPV7Address);
    /**
     * Get bucket index for a peer based on XOR distance
     */
    private getBucketIndex;
    /**
     * Add a peer to the routing table
     */
    addPeer(peer: PeerInfo): boolean;
    /**
     * Remove a peer from the routing table
     */
    removePeer(address: IPV7Address): boolean;
    /**
     * Update peer's last seen time
     */
    updatePeer(address: IPV7Address): void;
    /**
     * Find the k closest peers to a target address
     */
    findClosestPeers(target: IPV7Address, count?: number): PeerInfo[];
    /**
     * Find peers in the same geographic area
     */
    findPeersByGeohash(geohash: string): PeerInfo[];
    /**
     * Store a value in the DHT
     */
    store(key: Uint8Array, value: Uint8Array, publisher: IPV7Address): void;
    /**
     * Retrieve a value from the DHT
     */
    get(key: Uint8Array): DHTEntry | undefined;
    /**
     * Delete a value from the DHT
     */
    delete(key: Uint8Array): boolean;
    /**
     * Get peers that should store a key (based on closeness)
     */
    getStorageNodes(key: Uint8Array): PeerInfo[];
    /**
     * Get total number of peers
     */
    getPeerCount(): number;
    /**
     * Get all known peers
     */
    getAllPeers(): PeerInfo[];
    /**
     * Get a random peer (for bootstrap/discovery)
     */
    getRandomPeer(): PeerInfo | undefined;
    /**
     * Cleanup expired entries and stale peers
     */
    private cleanup;
    /**
     * Get routing table statistics
     */
    getStats(): {
        totalPeers: number;
        bucketSizes: number[];
        storageEntries: number;
    };
}
/**
 * Generate a DHT key from arbitrary data
 */
export declare function generateDHTKey(data: string | Uint8Array): Uint8Array;
//# sourceMappingURL=dht.d.ts.map