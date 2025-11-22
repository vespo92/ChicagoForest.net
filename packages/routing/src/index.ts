/**
 * @chicago-forest/routing
 *
 * Unified Routing Layer for Chicago Forest Network
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * This code represents a conceptual design for P2P mesh networking and is not
 * intended for production use without significant real-world testing and validation.
 *
 * This package integrates multiple routing protocols:
 * - Kademlia DHT (peer discovery)
 * - Wireless Mesh (BATMAN-adv, OLSR, Babel)
 * - SD-WAN (tunnel management and path selection)
 * - Anonymous Routing (onion routing)
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId, PeerInfo } from '@chicago-forest/shared-types';

// ============================================================================
// Types and Interfaces
// ============================================================================

export type RoutingProtocol = 'dht' | 'mesh' | 'sdwan' | 'onion' | 'direct';

export type RouteState = 'active' | 'degraded' | 'failed' | 'unknown';

export type PathSelectionPolicy =
  | 'lowest-latency'
  | 'highest-bandwidth'
  | 'lowest-cost'
  | 'balanced'
  | 'multipath'
  | 'anonymous';

export interface RouteMetrics {
  latencyMs: number;
  bandwidthMbps: number;
  packetLoss: number;
  hopCount: number;
  jitterMs: number;
  lastUpdated: number;
}

export interface Route {
  id: string;
  destination: NodeId;
  nextHop: NodeId | null;
  protocol: RoutingProtocol;
  state: RouteState;
  metrics: RouteMetrics;
  path: NodeId[];
  cost: number;
  createdAt: number;
  expiresAt: number;
}

export interface RoutingTableEntry {
  destination: NodeId;
  routes: Route[];
  preferredRoute: string | null;
  lastAccessed: number;
}

export interface RouterConfig {
  nodeId: NodeId;
  protocols: RoutingProtocol[];
  pathSelectionPolicy: PathSelectionPolicy;
  routeTimeout: number;
  maxRoutes: number;
  refreshInterval: number;
  enableMultipath: boolean;
  enableAnonymous: boolean;
}

export interface RoutingStats {
  totalRoutes: number;
  activeRoutes: number;
  degradedRoutes: number;
  failedRoutes: number;
  routesByProtocol: Record<RoutingProtocol, number>;
  averageLatency: number;
  averageHopCount: number;
  routeDiscoveryTime: number;
}

export interface RouteDiscoveryResult {
  routes: Route[];
  discoveryTimeMs: number;
  protocolsUsed: RoutingProtocol[];
}

// ============================================================================
// Router Events
// ============================================================================

export interface RouterEvents {
  'route:discovered': (route: Route) => void;
  'route:updated': (route: Route) => void;
  'route:expired': (routeId: string) => void;
  'route:failed': (routeId: string, error: Error) => void;
  'protocol:connected': (protocol: RoutingProtocol) => void;
  'protocol:disconnected': (protocol: RoutingProtocol) => void;
  'path:selected': (destination: NodeId, route: Route) => void;
  'stats:updated': (stats: RoutingStats) => void;
}

// ============================================================================
// Unified Router Implementation
// ============================================================================

const DEFAULT_CONFIG: RouterConfig = {
  nodeId: '' as NodeId,
  protocols: ['dht', 'mesh', 'sdwan'],
  pathSelectionPolicy: 'balanced',
  routeTimeout: 300000, // 5 minutes
  maxRoutes: 1000,
  refreshInterval: 30000, // 30 seconds
  enableMultipath: true,
  enableAnonymous: false,
};

/**
 * UnifiedRouter - Central routing coordinator for Chicago Forest Network
 *
 * Aggregates routes from multiple protocols and provides intelligent
 * path selection based on configurable policies.
 */
export class UnifiedRouter extends EventEmitter<RouterEvents> {
  private config: RouterConfig;
  private routingTable: Map<NodeId, RoutingTableEntry> = new Map();
  private routes: Map<string, Route> = new Map();
  private protocolStates: Map<RoutingProtocol, boolean> = new Map();
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private started: boolean = false;

  constructor(config: Partial<RouterConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize protocol states
    for (const protocol of this.config.protocols) {
      this.protocolStates.set(protocol, false);
    }
  }

  // --------------------------------------------------------------------------
  // Lifecycle Management
  // --------------------------------------------------------------------------

  async start(): Promise<void> {
    if (this.started) return;

    this.started = true;

    // Connect to configured protocols
    for (const protocol of this.config.protocols) {
      await this.connectProtocol(protocol);
    }

    // Start route refresh timer
    this.refreshTimer = setInterval(
      () => this.refreshRoutes(),
      this.config.refreshInterval
    );

    // Emit initial stats
    this.emit('stats:updated', this.getStats());
  }

  async stop(): Promise<void> {
    if (!this.started) return;

    this.started = false;

    // Stop refresh timer
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Disconnect from protocols
    for (const protocol of this.config.protocols) {
      await this.disconnectProtocol(protocol);
    }

    // Clear routing table
    this.routingTable.clear();
    this.routes.clear();
  }

  // --------------------------------------------------------------------------
  // Protocol Management
  // --------------------------------------------------------------------------

  private async connectProtocol(protocol: RoutingProtocol): Promise<void> {
    // In a real implementation, this would connect to the actual protocol
    // For now, we simulate the connection
    this.protocolStates.set(protocol, true);
    this.emit('protocol:connected', protocol);
  }

  private async disconnectProtocol(protocol: RoutingProtocol): Promise<void> {
    this.protocolStates.set(protocol, false);
    this.emit('protocol:disconnected', protocol);
  }

  isProtocolConnected(protocol: RoutingProtocol): boolean {
    return this.protocolStates.get(protocol) ?? false;
  }

  getConnectedProtocols(): RoutingProtocol[] {
    return Array.from(this.protocolStates.entries())
      .filter(([_, connected]) => connected)
      .map(([protocol]) => protocol);
  }

  // --------------------------------------------------------------------------
  // Route Discovery
  // --------------------------------------------------------------------------

  /**
   * Discover routes to a destination using all available protocols
   */
  async discoverRoutes(destination: NodeId): Promise<RouteDiscoveryResult> {
    const startTime = Date.now();
    const discoveredRoutes: Route[] = [];
    const protocolsUsed: RoutingProtocol[] = [];

    // Query each connected protocol in parallel
    const discoveries = await Promise.allSettled(
      this.getConnectedProtocols().map(async (protocol) => {
        const routes = await this.discoverViaProtocol(protocol, destination);
        return { protocol, routes };
      })
    );

    for (const result of discoveries) {
      if (result.status === 'fulfilled') {
        discoveredRoutes.push(...result.value.routes);
        if (result.value.routes.length > 0) {
          protocolsUsed.push(result.value.protocol);
        }
      }
    }

    // Add routes to routing table
    for (const route of discoveredRoutes) {
      this.addRoute(route);
    }

    return {
      routes: discoveredRoutes,
      discoveryTimeMs: Date.now() - startTime,
      protocolsUsed,
    };
  }

  private async discoverViaProtocol(
    protocol: RoutingProtocol,
    destination: NodeId
  ): Promise<Route[]> {
    // Simulate protocol-specific route discovery
    // In a real implementation, this would delegate to the actual protocol

    const route = this.createRoute(destination, protocol);
    return [route];
  }

  private createRoute(destination: NodeId, protocol: RoutingProtocol): Route {
    const now = Date.now();
    const routeId = `${protocol}-${destination}-${now}`;

    return {
      id: routeId,
      destination,
      nextHop: null,
      protocol,
      state: 'active',
      metrics: {
        latencyMs: this.estimateLatency(protocol),
        bandwidthMbps: this.estimateBandwidth(protocol),
        packetLoss: 0,
        hopCount: this.estimateHopCount(protocol),
        jitterMs: Math.random() * 10,
        lastUpdated: now,
      },
      path: [],
      cost: this.calculateRouteCost(protocol),
      createdAt: now,
      expiresAt: now + this.config.routeTimeout,
    };
  }

  private estimateLatency(protocol: RoutingProtocol): number {
    const baseLatency: Record<RoutingProtocol, number> = {
      direct: 5,
      dht: 50,
      mesh: 30,
      sdwan: 20,
      onion: 200,
    };
    return baseLatency[protocol] + Math.random() * 20;
  }

  private estimateBandwidth(protocol: RoutingProtocol): number {
    const baseBandwidth: Record<RoutingProtocol, number> = {
      direct: 1000,
      dht: 100,
      mesh: 50,
      sdwan: 500,
      onion: 10,
    };
    return baseBandwidth[protocol] * (0.8 + Math.random() * 0.4);
  }

  private estimateHopCount(protocol: RoutingProtocol): number {
    const baseHops: Record<RoutingProtocol, number> = {
      direct: 1,
      dht: 4,
      mesh: 3,
      sdwan: 2,
      onion: 6,
    };
    return baseHops[protocol] + Math.floor(Math.random() * 2);
  }

  private calculateRouteCost(protocol: RoutingProtocol): number {
    const baseCost: Record<RoutingProtocol, number> = {
      direct: 1,
      mesh: 10,
      dht: 20,
      sdwan: 15,
      onion: 50,
    };
    return baseCost[protocol];
  }

  // --------------------------------------------------------------------------
  // Route Management
  // --------------------------------------------------------------------------

  addRoute(route: Route): void {
    // Add to routes map
    this.routes.set(route.id, route);

    // Add to routing table
    let entry = this.routingTable.get(route.destination);
    if (!entry) {
      entry = {
        destination: route.destination,
        routes: [],
        preferredRoute: null,
        lastAccessed: Date.now(),
      };
      this.routingTable.set(route.destination, entry);
    }

    // Add route if not duplicate
    if (!entry.routes.find(r => r.id === route.id)) {
      entry.routes.push(route);

      // Limit routes per destination
      if (entry.routes.length > 10) {
        const removed = entry.routes.shift();
        if (removed) {
          this.routes.delete(removed.id);
        }
      }

      // Select preferred route
      this.selectPreferredRoute(entry);

      this.emit('route:discovered', route);
    }
  }

  removeRoute(routeId: string): void {
    const route = this.routes.get(routeId);
    if (!route) return;

    this.routes.delete(routeId);

    const entry = this.routingTable.get(route.destination);
    if (entry) {
      entry.routes = entry.routes.filter(r => r.id !== routeId);

      if (entry.routes.length === 0) {
        this.routingTable.delete(route.destination);
      } else if (entry.preferredRoute === routeId) {
        this.selectPreferredRoute(entry);
      }
    }

    this.emit('route:expired', routeId);
  }

  getRoute(routeId: string): Route | undefined {
    return this.routes.get(routeId);
  }

  getRoutesTo(destination: NodeId): Route[] {
    const entry = this.routingTable.get(destination);
    return entry?.routes ?? [];
  }

  getPreferredRoute(destination: NodeId): Route | undefined {
    const entry = this.routingTable.get(destination);
    if (!entry?.preferredRoute) return undefined;
    return this.routes.get(entry.preferredRoute);
  }

  getAllRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  // --------------------------------------------------------------------------
  // Path Selection
  // --------------------------------------------------------------------------

  private selectPreferredRoute(entry: RoutingTableEntry): void {
    if (entry.routes.length === 0) {
      entry.preferredRoute = null;
      return;
    }

    const activeRoutes = entry.routes.filter(r => r.state === 'active');
    if (activeRoutes.length === 0) {
      entry.preferredRoute = entry.routes[0].id;
      return;
    }

    let selected: Route;

    switch (this.config.pathSelectionPolicy) {
      case 'lowest-latency':
        selected = this.selectByLatency(activeRoutes);
        break;
      case 'highest-bandwidth':
        selected = this.selectByBandwidth(activeRoutes);
        break;
      case 'lowest-cost':
        selected = this.selectByCost(activeRoutes);
        break;
      case 'anonymous':
        selected = this.selectByAnonymity(activeRoutes);
        break;
      case 'multipath':
      case 'balanced':
      default:
        selected = this.selectBalanced(activeRoutes);
    }

    entry.preferredRoute = selected.id;
    this.emit('path:selected', entry.destination, selected);
  }

  private selectByLatency(routes: Route[]): Route {
    return routes.reduce((best, current) =>
      current.metrics.latencyMs < best.metrics.latencyMs ? current : best
    );
  }

  private selectByBandwidth(routes: Route[]): Route {
    return routes.reduce((best, current) =>
      current.metrics.bandwidthMbps > best.metrics.bandwidthMbps ? current : best
    );
  }

  private selectByCost(routes: Route[]): Route {
    return routes.reduce((best, current) =>
      current.cost < best.cost ? current : best
    );
  }

  private selectByAnonymity(routes: Route[]): Route {
    // Prefer onion routing for anonymity
    const onionRoutes = routes.filter(r => r.protocol === 'onion');
    if (onionRoutes.length > 0) {
      return this.selectByLatency(onionRoutes);
    }
    return this.selectBalanced(routes);
  }

  private selectBalanced(routes: Route[]): Route {
    // Weighted scoring based on multiple factors
    const scored = routes.map(route => ({
      route,
      score: this.calculateBalancedScore(route),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0].route;
  }

  private calculateBalancedScore(route: Route): number {
    const { metrics } = route;

    // Normalize metrics (higher is better)
    const latencyScore = 100 / (metrics.latencyMs + 1);
    const bandwidthScore = metrics.bandwidthMbps / 100;
    const hopScore = 10 / (metrics.hopCount + 1);
    const lossScore = 1 - metrics.packetLoss;
    const costScore = 100 / (route.cost + 1);

    // Weighted combination
    return (
      latencyScore * 0.3 +
      bandwidthScore * 0.25 +
      hopScore * 0.15 +
      lossScore * 0.15 +
      costScore * 0.15
    );
  }

  setPathSelectionPolicy(policy: PathSelectionPolicy): void {
    this.config.pathSelectionPolicy = policy;

    // Re-evaluate all preferred routes
    for (const entry of this.routingTable.values()) {
      this.selectPreferredRoute(entry);
    }
  }

  // --------------------------------------------------------------------------
  // Route Maintenance
  // --------------------------------------------------------------------------

  private async refreshRoutes(): Promise<void> {
    const now = Date.now();

    // Remove expired routes
    for (const [routeId, route] of this.routes) {
      if (route.expiresAt < now) {
        this.removeRoute(routeId);
      }
    }

    // Update route states based on metrics
    for (const route of this.routes.values()) {
      const newState = this.evaluateRouteState(route);
      if (newState !== route.state) {
        route.state = newState;
        this.emit('route:updated', route);
      }
    }

    // Emit updated stats
    this.emit('stats:updated', this.getStats());
  }

  private evaluateRouteState(route: Route): RouteState {
    const { metrics } = route;

    if (metrics.packetLoss > 0.5) return 'failed';
    if (metrics.packetLoss > 0.1) return 'degraded';
    if (metrics.latencyMs > 1000) return 'degraded';

    return 'active';
  }

  async probeRoute(routeId: string): Promise<RouteMetrics | null> {
    const route = this.routes.get(routeId);
    if (!route) return null;

    // Simulate probe (in real implementation, send actual probe packets)
    const metrics: RouteMetrics = {
      latencyMs: route.metrics.latencyMs + (Math.random() - 0.5) * 10,
      bandwidthMbps: route.metrics.bandwidthMbps * (0.9 + Math.random() * 0.2),
      packetLoss: Math.random() * 0.05,
      hopCount: route.metrics.hopCount,
      jitterMs: Math.random() * 15,
      lastUpdated: Date.now(),
    };

    route.metrics = metrics;
    route.expiresAt = Date.now() + this.config.routeTimeout;

    this.emit('route:updated', route);
    return metrics;
  }

  // --------------------------------------------------------------------------
  // Statistics and Monitoring
  // --------------------------------------------------------------------------

  getStats(): RoutingStats {
    const routes = Array.from(this.routes.values());

    const routesByProtocol: Record<RoutingProtocol, number> = {
      dht: 0,
      mesh: 0,
      sdwan: 0,
      onion: 0,
      direct: 0,
    };

    let totalLatency = 0;
    let totalHops = 0;
    let activeCount = 0;
    let degradedCount = 0;
    let failedCount = 0;

    for (const route of routes) {
      routesByProtocol[route.protocol]++;
      totalLatency += route.metrics.latencyMs;
      totalHops += route.metrics.hopCount;

      switch (route.state) {
        case 'active': activeCount++; break;
        case 'degraded': degradedCount++; break;
        case 'failed': failedCount++; break;
      }
    }

    return {
      totalRoutes: routes.length,
      activeRoutes: activeCount,
      degradedRoutes: degradedCount,
      failedRoutes: failedCount,
      routesByProtocol,
      averageLatency: routes.length > 0 ? totalLatency / routes.length : 0,
      averageHopCount: routes.length > 0 ? totalHops / routes.length : 0,
      routeDiscoveryTime: 0,
    };
  }

  getRoutingTableSize(): number {
    return this.routingTable.size;
  }

  exportRoutingTable(): RoutingTableEntry[] {
    return Array.from(this.routingTable.values());
  }

  // --------------------------------------------------------------------------
  // Configuration
  // --------------------------------------------------------------------------

  getConfig(): RouterConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<RouterConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// ============================================================================
// Route Table Manager
// ============================================================================

/**
 * RouteTableManager - Manages routing table persistence and synchronization
 */
export class RouteTableManager {
  private router: UnifiedRouter;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor(router: UnifiedRouter) {
    this.router = router;
  }

  startSync(intervalMs: number = 60000): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.syncTable();
    }, intervalMs);
  }

  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private syncTable(): void {
    // In a real implementation, this would sync with persistent storage
    // or peer nodes for distributed routing table consistency
    const stats = this.router.getStats();
    console.log(`[RouteTableManager] Synced ${stats.totalRoutes} routes`);
  }

  exportToJson(): string {
    return JSON.stringify({
      config: this.router.getConfig(),
      routes: this.router.getAllRoutes(),
      stats: this.router.getStats(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  importFromJson(json: string): void {
    const data = JSON.parse(json);

    if (data.routes) {
      for (const route of data.routes) {
        this.router.addRoute(route);
      }
    }
  }
}

// ============================================================================
// Multi-Path Router Extension
// ============================================================================

/**
 * MultiPathRouter - Extends UnifiedRouter with multi-path routing capabilities
 */
export class MultiPathRouter extends UnifiedRouter {
  private activeStreams: Map<string, string[]> = new Map();

  constructor(config: Partial<RouterConfig> = {}) {
    super({ ...config, enableMultipath: true });
  }

  /**
   * Get multiple paths to a destination for load balancing or redundancy
   */
  getMultiplePaths(destination: NodeId, count: number = 3): Route[] {
    const routes = this.getRoutesTo(destination)
      .filter(r => r.state === 'active')
      .sort((a, b) => {
        // Sort by different criteria to get diverse paths
        const scoreA = a.metrics.latencyMs + a.cost * 10;
        const scoreB = b.metrics.latencyMs + b.cost * 10;
        return scoreA - scoreB;
      });

    return routes.slice(0, count);
  }

  /**
   * Create a multi-path stream to a destination
   */
  createMultiPathStream(destination: NodeId): string {
    const streamId = `stream-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const paths = this.getMultiplePaths(destination);

    this.activeStreams.set(streamId, paths.map(p => p.id));

    return streamId;
  }

  /**
   * Get the routes being used by a multi-path stream
   */
  getStreamRoutes(streamId: string): Route[] {
    const routeIds = this.activeStreams.get(streamId);
    if (!routeIds) return [];

    return routeIds
      .map(id => this.getRoute(id))
      .filter((r): r is Route => r !== undefined);
  }

  /**
   * Close a multi-path stream
   */
  closeMultiPathStream(streamId: string): void {
    this.activeStreams.delete(streamId);
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createRouter(config?: Partial<RouterConfig>): UnifiedRouter {
  return new UnifiedRouter(config);
}

export function createMultiPathRouter(config?: Partial<RouterConfig>): MultiPathRouter {
  return new MultiPathRouter(config);
}

// ============================================================================
// Re-exports from dependent packages
// ============================================================================

export type {
  NodeId,
  PeerInfo,
} from '@chicago-forest/shared-types';
