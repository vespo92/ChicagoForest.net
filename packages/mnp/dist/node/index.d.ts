/**
 * IPV7 Node - Main P2P Node Implementation
 *
 * THEORETICAL FRAMEWORK - A complete mesh network node
 * that combines addressing, routing, and transport.
 */
import { EventEmitter } from 'events';
import { IPV7Address, NodeConfig, NodeStats, PeerInfo, TransportEndpoint, KeyPair, GeoCoordinates } from '../types.js';
/**
 * IPV7 Node - Core P2P network participant
 */
export declare class IPV7Node extends EventEmitter {
    readonly address: IPV7Address;
    readonly keyPair: KeyPair;
    readonly location?: GeoCoordinates;
    private readonly dht;
    private readonly router;
    private readonly transports;
    private readonly config;
    private readonly stats;
    private running;
    private heartbeatTimer?;
    private announceTimer?;
    constructor(config?: NodeConfig);
    /**
     * Set up internal event handlers
     */
    private setupEventHandlers;
    /**
     * Start the node
     */
    start(): Promise<void>;
    /**
     * Stop the node
     */
    stop(): Promise<void>;
    /**
     * Send data to another node
     */
    send(destination: IPV7Address, data: Uint8Array, _options?: {
        reliable?: boolean;
    }): Promise<void>;
    /**
     * Send a packet (handles routing)
     */
    private sendPacket;
    /**
     * Handle received packet
     */
    private handlePacket;
    /**
     * Process a packet destined for us
     */
    private processPacket;
    /**
     * Forward a packet to next hop
     */
    private forwardPacket;
    /**
     * Handle peer announcement
     */
    private handleAnnounce;
    /**
     * Handle route request
     */
    private handleRouteRequest;
    /**
     * Send route request
     */
    private sendRouteRequest;
    /**
     * Send heartbeats to all peers
     */
    private sendHeartbeats;
    /**
     * Broadcast announcement to network
     */
    private announce;
    /**
     * Connect to a peer endpoint
     */
    connectToPeer(endpoint: TransportEndpoint): Promise<void>;
    /**
     * Find IPV7 address for a transport endpoint
     */
    private findAddressForEndpoint;
    /**
     * Add a peer manually (for testing)
     */
    addPeer(peer: PeerInfo): void;
    /**
     * Get node statistics
     */
    getStats(): NodeStats;
    /**
     * Get all known peers
     */
    getPeers(): PeerInfo[];
    /**
     * Get all routes
     */
    getRoutes(): import("../types.js").RouteEntry[];
    /**
     * Check if node is running
     */
    isRunning(): boolean;
    /**
     * Get formatted address string
     */
    getAddressString(): string;
}
/**
 * Create a simple in-memory node for testing
 */
export declare function createTestNode(id: string, location?: GeoCoordinates): IPV7Node;
//# sourceMappingURL=index.d.ts.map