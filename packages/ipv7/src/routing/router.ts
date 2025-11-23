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
import {
  IPV7Address,
  RouteEntry,
  Packet,
  PacketType,
} from '../types.js';
import {
  addressEquals,
  routingDistance,
  formatAddress,
} from '../address/index.js';
import { DHT } from './dht.js';

/** Route expiry time in ms */
const ROUTE_EXPIRY = 300000; // 5 minutes

/** Maximum routes per destination */
const MAX_ROUTES_PER_DEST = 3;

/** Route refresh interval */
const ROUTE_REFRESH_INTERVAL = 60000;

/**
 * Mesh Router for IPV7
 */
export class Router extends EventEmitter {
  private readonly localAddress: IPV7Address;
  private readonly dht: DHT;
  private readonly routes: Map<string, RouteEntry[]>;
  private readonly pendingRequests: Map<string, {
    resolve: (route: RouteEntry | null) => void;
    timeout: NodeJS.Timeout;
  }>;

  constructor(localAddress: IPV7Address, dht: DHT) {
    super();
    this.localAddress = localAddress;
    this.dht = dht;
    this.routes = new Map();
    this.pendingRequests = new Map();

    // Periodic route maintenance
    setInterval(() => this.maintainRoutes(), ROUTE_REFRESH_INTERVAL);
  }

  /**
   * Get address key for route lookup
   */
  private getAddressKey(address: IPV7Address): string {
    return formatAddress(address);
  }

  /**
   * Add or update a route
   */
  addRoute(route: RouteEntry): void {
    const destKey = this.getAddressKey(route.destination);
    let routeList = this.routes.get(destKey);

    if (!routeList) {
      routeList = [];
      this.routes.set(destKey, routeList);
    }

    // Check if route via same next hop exists
    const existingIndex = routeList.findIndex((r) =>
      addressEquals(r.nextHop, route.nextHop)
    );

    if (existingIndex >= 0) {
      // Update existing route
      routeList[existingIndex] = route;
    } else {
      // Add new route
      routeList.push(route);
    }

    // Sort by metric and keep only best routes
    routeList.sort((a, b) => a.metric - b.metric);
    if (routeList.length > MAX_ROUTES_PER_DEST) {
      routeList.splice(MAX_ROUTES_PER_DEST);
    }

    this.emit('route:added', route);
  }

  /**
   * Remove routes to a destination
   */
  removeRoute(destination: IPV7Address, nextHop?: IPV7Address): void {
    const destKey = this.getAddressKey(destination);
    const routeList = this.routes.get(destKey);

    if (!routeList) return;

    if (nextHop) {
      // Remove specific route
      const index = routeList.findIndex((r) =>
        addressEquals(r.nextHop, nextHop)
      );
      if (index >= 0) {
        const removed = routeList.splice(index, 1)[0];
        this.emit('route:removed', removed);
      }
    } else {
      // Remove all routes to destination
      this.routes.delete(destKey);
      this.emit('route:removed', { destination });
    }
  }

  /**
   * Find the best route to a destination
   */
  findRoute(destination: IPV7Address): RouteEntry | null {
    // Check if destination is local
    if (addressEquals(destination, this.localAddress)) {
      return {
        destination,
        prefixLength: 128,
        nextHop: this.localAddress,
        metric: 0,
        expiry: Infinity,
        hopCount: 0,
        interface: 'local',
      };
    }

    // Check direct routes
    const destKey = this.getAddressKey(destination);
    const directRoutes = this.routes.get(destKey);
    if (directRoutes && directRoutes.length > 0) {
      // Filter expired routes
      const validRoutes = directRoutes.filter((r) => r.expiry > Date.now());
      if (validRoutes.length > 0) {
        return validRoutes[0]; // Return best route
      }
    }

    // Check geohash-based routes (prefix matching)
    for (let prefixLen = 4; prefixLen > 0; prefixLen--) {
      const prefix = destination.geohash.substring(0, prefixLen);
      for (const [, routeList] of this.routes) {
        const route = routeList[0];
        if (route.destination.geohash.startsWith(prefix)) {
          return {
            ...route,
            destination,
            prefixLength: prefixLen * 5, // ~5 bits per geohash char
          };
        }
      }
    }

    // Fall back to DHT closest peers
    const closestPeers = this.dht.findClosestPeers(destination, 3);
    if (closestPeers.length > 0) {
      const peer = closestPeers[0];
      return {
        destination,
        prefixLength: 0,
        nextHop: peer.address,
        metric: routingDistance(peer.address, destination) * 100,
        expiry: Date.now() + 60000,
        hopCount: 1,
        interface: 'dht',
      };
    }

    return null;
  }

  /**
   * Find multiple routes to a destination (for multipath)
   */
  findMultipleRoutes(destination: IPV7Address, count: number = 3): RouteEntry[] {
    const routes: RouteEntry[] = [];

    // Direct routes
    const destKey = this.getAddressKey(destination);
    const directRoutes = this.routes.get(destKey);
    if (directRoutes) {
      routes.push(...directRoutes.filter((r) => r.expiry > Date.now()));
    }

    // DHT routes
    if (routes.length < count) {
      const closestPeers = this.dht.findClosestPeers(destination, count - routes.length);
      for (const peer of closestPeers) {
        // Don't duplicate routes
        if (routes.some((r) => addressEquals(r.nextHop, peer.address))) {
          continue;
        }

        routes.push({
          destination,
          prefixLength: 0,
          nextHop: peer.address,
          metric: routingDistance(peer.address, destination) * 100,
          expiry: Date.now() + 60000,
          hopCount: 1,
          interface: 'dht',
        });
      }
    }

    return routes.slice(0, count);
  }

  /**
   * Process a route request packet
   */
  processRouteRequest(packet: Packet): Packet | null {
    const { source, destination } = packet.header;

    // Check if we know a route
    const route = this.findRoute(destination);
    if (!route) {
      return null;
    }

    // Create route reply with our address in the path
    const hops = [this.localAddress];
    if (!addressEquals(route.nextHop, destination)) {
      hops.push(route.nextHop);
    }

    // Build reply packet
    const replyPayload = new Uint8Array(hops.length * 32);
    // Would serialize hops here

    return {
      header: {
        ...packet.header,
        type: PacketType.ROUTE_REPLY,
        source: this.localAddress,
        destination: source,
        timestamp: BigInt(Date.now()),
      },
      payload: replyPayload,
    };
  }

  /**
   * Process a route reply packet
   */
  processRouteReply(packet: Packet, receivedFrom: IPV7Address): void {
    const { source } = packet.header;

    // Add route to the source
    const route: RouteEntry = {
      destination: source,
      prefixLength: 128,
      nextHop: receivedFrom,
      metric: packet.header.ttl, // Lower TTL = more hops = higher metric
      expiry: Date.now() + ROUTE_EXPIRY,
      hopCount: 64 - packet.header.ttl,
      interface: 'mesh',
    };

    this.addRoute(route);

    // Resolve pending request if any
    const destKey = this.getAddressKey(source);
    const pending = this.pendingRequests.get(destKey);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve(route);
      this.pendingRequests.delete(destKey);
    }
  }

  /**
   * Request a route discovery
   */
  async requestRoute(destination: IPV7Address, timeoutMs: number = 5000): Promise<RouteEntry | null> {
    // Check if we already have a route
    const existing = this.findRoute(destination);
    if (existing && existing.interface !== 'dht') {
      return existing;
    }

    // Set up pending request
    const destKey = this.getAddressKey(destination);

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(destKey);
        resolve(this.findRoute(destination)); // Return DHT route as fallback
      }, timeoutMs);

      this.pendingRequests.set(destKey, { resolve, timeout });
      this.emit('route:request', destination);
    });
  }

  /**
   * Handle peer going offline
   */
  handlePeerDisconnect(peerAddress: IPV7Address): void {
    // Remove all routes via this peer
    for (const [destKey, routeList] of this.routes) {
      const filteredRoutes = routeList.filter(
        (r) => !addressEquals(r.nextHop, peerAddress)
      );

      if (filteredRoutes.length === 0) {
        this.routes.delete(destKey);
      } else if (filteredRoutes.length !== routeList.length) {
        this.routes.set(destKey, filteredRoutes);
      }
    }
  }

  /**
   * Learn route from received packet
   */
  learnRoute(packet: Packet, receivedFrom: IPV7Address): void {
    const { source } = packet.header;

    // Don't learn route to self
    if (addressEquals(source, this.localAddress)) {
      return;
    }

    const route: RouteEntry = {
      destination: source,
      prefixLength: 128,
      nextHop: receivedFrom,
      metric: 64 - packet.header.ttl,
      expiry: Date.now() + ROUTE_EXPIRY,
      hopCount: 64 - packet.header.ttl,
      interface: 'learned',
    };

    this.addRoute(route);
  }

  /**
   * Maintain routes - clean expired, refresh important
   */
  private maintainRoutes(): void {
    const now = Date.now();

    for (const [destKey, routeList] of this.routes) {
      // Remove expired routes
      const validRoutes = routeList.filter((r) => r.expiry > now);

      if (validRoutes.length === 0) {
        this.routes.delete(destKey);
      } else {
        this.routes.set(destKey, validRoutes);
      }
    }

    this.emit('routes:maintained');
  }

  /**
   * Get routing table statistics
   */
  getStats(): {
    totalRoutes: number;
    destinations: number;
    averageMetric: number;
  } {
    let totalRoutes = 0;
    let totalMetric = 0;

    for (const routeList of this.routes.values()) {
      totalRoutes += routeList.length;
      for (const route of routeList) {
        totalMetric += route.metric;
      }
    }

    return {
      totalRoutes,
      destinations: this.routes.size,
      averageMetric: totalRoutes > 0 ? totalMetric / totalRoutes : 0,
    };
  }

  /**
   * Get all routes as array
   */
  getAllRoutes(): RouteEntry[] {
    const routes: RouteEntry[] = [];
    for (const routeList of this.routes.values()) {
      routes.push(...routeList);
    }
    return routes;
  }
}
