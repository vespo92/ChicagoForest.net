/**
 * IPV7 Mesh Router
 *
 * THEORETICAL FRAMEWORK - Proximity-aware mesh routing
 * combining geohash proximity with XOR-distance metrics.
 *
 * Features:
 * - Geohash-first routing (prefer geographically close peers)
 * - Multi-path routing for resilience
 * - Automatic route discovery and maintenance
 */
import { EventEmitter } from 'events';
import { IPV7Address, RouteEntry, Packet } from '../types.js';
import { DHT } from './dht.js';
/**
 * Mesh Router for IPV7
 */
export declare class Router extends EventEmitter {
    private readonly localAddress;
    private readonly dht;
    private readonly routes;
    private readonly pendingRequests;
    constructor(localAddress: IPV7Address, dht: DHT);
    /**
     * Get address key for route lookup
     */
    private getAddressKey;
    /**
     * Add or update a route
     */
    addRoute(route: RouteEntry): void;
    /**
     * Remove routes to a destination
     */
    removeRoute(destination: IPV7Address, nextHop?: IPV7Address): void;
    /**
     * Find the best route to a destination
     */
    findRoute(destination: IPV7Address): RouteEntry | null;
    /**
     * Find multiple routes to a destination (for multipath)
     */
    findMultipleRoutes(destination: IPV7Address, count?: number): RouteEntry[];
    /**
     * Process a route request packet
     */
    processRouteRequest(packet: Packet): Packet | null;
    /**
     * Process a route reply packet
     */
    processRouteReply(packet: Packet, receivedFrom: IPV7Address): void;
    /**
     * Request a route discovery
     */
    requestRoute(destination: IPV7Address, timeoutMs?: number): Promise<RouteEntry | null>;
    /**
     * Handle peer going offline
     */
    handlePeerDisconnect(peerAddress: IPV7Address): void;
    /**
     * Learn route from received packet
     */
    learnRoute(packet: Packet, receivedFrom: IPV7Address): void;
    /**
     * Maintain routes - clean expired, refresh important
     */
    private maintainRoutes;
    /**
     * Get routing table statistics
     */
    getStats(): {
        totalRoutes: number;
        destinations: number;
        averageMetric: number;
    };
    /**
     * Get all routes as array
     */
    getAllRoutes(): RouteEntry[];
}
//# sourceMappingURL=router.d.ts.map