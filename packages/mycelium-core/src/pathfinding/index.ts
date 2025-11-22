/**
 * Pathfinding - Neural Network Routing Optimization
 *
 * Implements efficient pathfinding algorithms for the mycelium network,
 * inspired by both classical graph algorithms and biological path optimization.
 *
 * ⚠️ DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 */

import type { NodeId } from '@chicago-forest/shared-types';
import type { HyphalPath, PathMetrics, TopologySnapshot } from '../types';

/**
 * A calculated route through the network
 */
export interface Route {
  /** Route identifier */
  id: string;

  /** Source node */
  source: NodeId;

  /** Destination node */
  destination: NodeId;

  /** Ordered list of nodes in the path */
  path: NodeId[];

  /** Total cost/distance of the route */
  cost: number;

  /** Estimated latency in milliseconds */
  estimatedLatency: number;

  /** Minimum bandwidth available along the route */
  minBandwidth: number;

  /** Number of hops */
  hopCount: number;

  /** Route reliability score (0-1) */
  reliability: number;

  /** Calculation timestamp */
  calculatedAt: number;
}

/**
 * Priority queue node for Dijkstra's algorithm
 */
interface PriorityNode {
  nodeId: NodeId;
  cost: number;
  path: NodeId[];
}

/**
 * Edge in the routing graph
 */
export interface RoutingEdge {
  target: NodeId;
  cost: number;
  latency: number;
  bandwidth: number;
  reliability: number;
}

/**
 * Configuration for pathfinding
 */
export interface PathfindingConfig {
  /** Cost metric: 'latency', 'hops', 'reliability', 'balanced' */
  costMetric: 'latency' | 'hops' | 'reliability' | 'balanced';

  /** Maximum acceptable hops */
  maxHops: number;

  /** Minimum acceptable reliability (0-1) */
  minReliability: number;

  /** Minimum acceptable bandwidth */
  minBandwidth: number;

  /** Number of alternative paths to calculate */
  alternativePaths: number;

  /** Preference for diverse paths (0-1) */
  diversityPreference: number;
}

const DEFAULT_CONFIG: PathfindingConfig = {
  costMetric: 'balanced',
  maxHops: 10,
  minReliability: 0.5,
  minBandwidth: 1000,
  alternativePaths: 3,
  diversityPreference: 0.3,
};

/**
 * A* heuristic function type
 */
export type Heuristic = (from: NodeId, to: NodeId) => number;

/**
 * Pathfinding engine for optimal routing through the mycelium network
 */
export class Pathfinder {
  private config: PathfindingConfig;
  private graph: Map<NodeId, RoutingEdge[]> = new Map();
  private nodePositions: Map<NodeId, { x: number; y: number }> = new Map();

  constructor(config: Partial<PathfindingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Build routing graph from topology snapshot
   */
  buildGraph(snapshot: TopologySnapshot): void {
    this.graph.clear();

    for (const path of snapshot.paths.values()) {
      if (path.state !== 'active' && path.state !== 'growing') continue;

      // Add direct edge
      this.addEdge(path.source, path.destination, path.metrics);

      // Add edges through intermediate hops
      const allNodes = [path.source, ...path.hops, path.destination];
      for (let i = 0; i < allNodes.length - 1; i++) {
        const hopMetrics: PathMetrics = {
          ...path.metrics,
          latency: path.metrics.latency / allNodes.length,
          hopCount: 1,
        };
        this.addEdge(allNodes[i], allNodes[i + 1], hopMetrics);
      }
    }
  }

  /**
   * Find optimal path using Dijkstra's algorithm
   */
  findPath(source: NodeId, destination: NodeId): Route | null {
    if (!this.graph.has(source)) return null;
    if (source === destination) {
      return this.createRoute(source, destination, [source], 0);
    }

    const distances = new Map<NodeId, number>();
    const previous = new Map<NodeId, NodeId>();
    const visited = new Set<NodeId>();
    const queue: PriorityNode[] = [];

    distances.set(source, 0);
    queue.push({ nodeId: source, cost: 0, path: [source] });

    while (queue.length > 0) {
      // Get minimum cost node
      queue.sort((a, b) => a.cost - b.cost);
      const current = queue.shift()!;

      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);

      if (current.nodeId === destination) {
        return this.createRouteFromPath(
          source,
          destination,
          current.path,
          current.cost
        );
      }

      const edges = this.graph.get(current.nodeId);
      if (!edges) continue;

      for (const edge of edges) {
        if (visited.has(edge.target)) continue;
        if (!this.isEdgeAcceptable(edge)) continue;

        const cost = current.cost + this.calculateEdgeCost(edge);
        const existingDist = distances.get(edge.target) ?? Infinity;

        if (cost < existingDist) {
          distances.set(edge.target, cost);
          previous.set(edge.target, current.nodeId);

          const newPath = [...current.path, edge.target];
          if (newPath.length <= this.config.maxHops + 1) {
            queue.push({
              nodeId: edge.target,
              cost,
              path: newPath,
            });
          }
        }
      }
    }

    return null; // No path found
  }

  /**
   * Find path using A* algorithm with heuristic
   */
  findPathAStar(
    source: NodeId,
    destination: NodeId,
    heuristic?: Heuristic
  ): Route | null {
    if (!this.graph.has(source)) return null;
    if (source === destination) {
      return this.createRoute(source, destination, [source], 0);
    }

    const h = heuristic ?? ((from, to) => this.euclideanHeuristic(from, to));

    const gScore = new Map<NodeId, number>();
    const fScore = new Map<NodeId, number>();
    const previous = new Map<NodeId, NodeId>();
    const visited = new Set<NodeId>();
    const openSet: Array<{ nodeId: NodeId; f: number }> = [];

    gScore.set(source, 0);
    fScore.set(source, h(source, destination));
    openSet.push({ nodeId: source, f: fScore.get(source)! });

    while (openSet.length > 0) {
      // Get node with lowest f score
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;

      if (current.nodeId === destination) {
        return this.reconstructPath(source, destination, previous, gScore);
      }

      visited.add(current.nodeId);
      const edges = this.graph.get(current.nodeId);
      if (!edges) continue;

      for (const edge of edges) {
        if (visited.has(edge.target)) continue;
        if (!this.isEdgeAcceptable(edge)) continue;

        const tentativeG = (gScore.get(current.nodeId) ?? Infinity) +
          this.calculateEdgeCost(edge);

        if (tentativeG < (gScore.get(edge.target) ?? Infinity)) {
          previous.set(edge.target, current.nodeId);
          gScore.set(edge.target, tentativeG);
          fScore.set(edge.target, tentativeG + h(edge.target, destination));

          if (!openSet.some(n => n.nodeId === edge.target)) {
            openSet.push({
              nodeId: edge.target,
              f: fScore.get(edge.target)!,
            });
          }
        }
      }
    }

    return null;
  }

  /**
   * Find k-shortest paths using Yen's algorithm
   */
  findKShortestPaths(
    source: NodeId,
    destination: NodeId,
    k?: number
  ): Route[] {
    const numPaths = k ?? this.config.alternativePaths;
    const result: Route[] = [];

    // Find shortest path
    const shortest = this.findPath(source, destination);
    if (!shortest) return [];

    result.push(shortest);

    // Use Yen's algorithm for k-1 more paths
    const candidates: Route[] = [];

    for (let i = 1; i < numPaths; i++) {
      const previousPath = result[i - 1];

      for (let j = 0; j < previousPath.path.length - 1; j++) {
        const spurNode = previousPath.path[j];
        const rootPath = previousPath.path.slice(0, j + 1);

        // Remove edges that are part of previously found paths
        const removedEdges: Array<{ from: NodeId; edge: RoutingEdge }> = [];

        for (const path of result) {
          if (this.pathStartsWith(path.path, rootPath)) {
            const nextNode = path.path[j + 1];
            if (nextNode) {
              const edges = this.graph.get(spurNode);
              if (edges) {
                const edgeIdx = edges.findIndex(e => e.target === nextNode);
                if (edgeIdx !== -1) {
                  removedEdges.push({ from: spurNode, edge: edges[edgeIdx] });
                  edges.splice(edgeIdx, 1);
                }
              }
            }
          }
        }

        // Find spur path
        const spurPath = this.findPath(spurNode, destination);

        // Restore removed edges
        for (const { from, edge } of removedEdges) {
          const edges = this.graph.get(from);
          if (edges) edges.push(edge);
        }

        if (spurPath) {
          const totalPath = [...rootPath.slice(0, -1), ...spurPath.path];
          const totalCost = this.calculateTotalCost(totalPath);

          const route = this.createRoute(source, destination, totalPath, totalCost);

          // Check for diversity
          const isDiverse = this.isPathDiverse(route, result);
          if (isDiverse && !candidates.some(c => this.pathsEqual(c.path, route.path))) {
            candidates.push(route);
          }
        }
      }

      if (candidates.length === 0) break;

      // Sort candidates and get best
      candidates.sort((a, b) => a.cost - b.cost);
      result.push(candidates.shift()!);
    }

    return result;
  }

  /**
   * Calculate all-pairs shortest paths (Floyd-Warshall)
   */
  calculateAllPairsShortestPaths(): Map<string, Route> {
    const nodes = Array.from(this.graph.keys());
    const dist = new Map<string, number>();
    const next = new Map<string, NodeId>();

    // Initialize
    for (const u of nodes) {
      for (const v of nodes) {
        const key = `${u}:${v}`;
        if (u === v) {
          dist.set(key, 0);
        } else {
          const edge = this.graph.get(u)?.find(e => e.target === v);
          if (edge) {
            dist.set(key, this.calculateEdgeCost(edge));
            next.set(key, v);
          } else {
            dist.set(key, Infinity);
          }
        }
      }
    }

    // Floyd-Warshall
    for (const k of nodes) {
      for (const i of nodes) {
        for (const j of nodes) {
          const ik = `${i}:${k}`;
          const kj = `${k}:${j}`;
          const ij = `${i}:${j}`;

          const distIK = dist.get(ik) ?? Infinity;
          const distKJ = dist.get(kj) ?? Infinity;
          const distIJ = dist.get(ij) ?? Infinity;

          if (distIK + distKJ < distIJ) {
            dist.set(ij, distIK + distKJ);
            next.set(ij, next.get(ik)!);
          }
        }
      }
    }

    // Reconstruct paths
    const routes = new Map<string, Route>();

    for (const u of nodes) {
      for (const v of nodes) {
        if (u === v) continue;

        const key = `${u}:${v}`;
        const d = dist.get(key);
        if (d === undefined || d === Infinity) continue;

        const path = this.reconstructFloydPath(u, v, next);
        if (path.length > 0) {
          routes.set(key, this.createRoute(u, v, path, d));
        }
      }
    }

    return routes;
  }

  /**
   * Set node positions for heuristic calculation
   */
  setNodePositions(positions: Map<NodeId, { x: number; y: number }>): void {
    this.nodePositions = positions;
  }

  /**
   * Get graph statistics
   */
  getGraphStats(): {
    nodeCount: number;
    edgeCount: number;
    avgDegree: number;
    diameter: number;
  } {
    const nodeCount = this.graph.size;
    let edgeCount = 0;
    let totalDegree = 0;

    for (const edges of this.graph.values()) {
      edgeCount += edges.length;
      totalDegree += edges.length;
    }

    edgeCount = edgeCount / 2; // Undirected

    // Calculate diameter (longest shortest path) - sampling for large graphs
    let diameter = 0;
    const nodes = Array.from(this.graph.keys());
    const sampleSize = Math.min(nodes.length, 20);

    for (let i = 0; i < sampleSize; i++) {
      const source = nodes[Math.floor(Math.random() * nodes.length)];
      for (let j = 0; j < sampleSize; j++) {
        const dest = nodes[Math.floor(Math.random() * nodes.length)];
        if (source === dest) continue;

        const route = this.findPath(source, dest);
        if (route && route.hopCount > diameter) {
          diameter = route.hopCount;
        }
      }
    }

    return {
      nodeCount,
      edgeCount,
      avgDegree: nodeCount > 0 ? totalDegree / nodeCount : 0,
      diameter,
    };
  }

  // Private methods

  private addEdge(source: NodeId, target: NodeId, metrics: PathMetrics): void {
    const edge: RoutingEdge = {
      target,
      cost: this.calculateEdgeCost({
        target,
        latency: metrics.latency,
        bandwidth: metrics.bandwidth,
        reliability: metrics.reliability,
        cost: 0,
      }),
      latency: metrics.latency,
      bandwidth: metrics.bandwidth,
      reliability: metrics.reliability,
    };

    if (!this.graph.has(source)) {
      this.graph.set(source, []);
    }

    // Update or add edge
    const edges = this.graph.get(source)!;
    const existing = edges.findIndex(e => e.target === target);
    if (existing >= 0) {
      // Keep the better edge
      if (edge.cost < edges[existing].cost) {
        edges[existing] = edge;
      }
    } else {
      edges.push(edge);
    }

    // Add reverse edge (bidirectional)
    if (!this.graph.has(target)) {
      this.graph.set(target, []);
    }
    const reverseEdges = this.graph.get(target)!;
    const reverseExisting = reverseEdges.findIndex(e => e.target === source);
    if (reverseExisting >= 0) {
      if (edge.cost < reverseEdges[reverseExisting].cost) {
        reverseEdges[reverseExisting] = { ...edge, target: source };
      }
    } else {
      reverseEdges.push({ ...edge, target: source });
    }
  }

  private calculateEdgeCost(edge: RoutingEdge): number {
    switch (this.config.costMetric) {
      case 'latency':
        return edge.latency;
      case 'hops':
        return 1;
      case 'reliability':
        return 1 - edge.reliability;
      case 'balanced':
      default:
        // Weighted combination
        const latencyCost = edge.latency / 100;
        const reliabilityCost = (1 - edge.reliability) * 5;
        const hopCost = 1;
        return latencyCost + reliabilityCost + hopCost;
    }
  }

  private isEdgeAcceptable(edge: RoutingEdge): boolean {
    return (
      edge.reliability >= this.config.minReliability &&
      edge.bandwidth >= this.config.minBandwidth
    );
  }

  private createRoute(
    source: NodeId,
    destination: NodeId,
    path: NodeId[],
    cost: number
  ): Route {
    const metrics = this.calculatePathMetrics(path);

    return {
      id: `route-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      source,
      destination,
      path,
      cost,
      estimatedLatency: metrics.latency,
      minBandwidth: metrics.bandwidth,
      hopCount: path.length - 1,
      reliability: metrics.reliability,
      calculatedAt: Date.now(),
    };
  }

  private createRouteFromPath(
    source: NodeId,
    destination: NodeId,
    path: NodeId[],
    cost: number
  ): Route {
    return this.createRoute(source, destination, path, cost);
  }

  private calculatePathMetrics(path: NodeId[]): {
    latency: number;
    bandwidth: number;
    reliability: number;
  } {
    let totalLatency = 0;
    let minBandwidth = Infinity;
    let reliability = 1;

    for (let i = 0; i < path.length - 1; i++) {
      const edge = this.graph.get(path[i])?.find(e => e.target === path[i + 1]);
      if (edge) {
        totalLatency += edge.latency;
        minBandwidth = Math.min(minBandwidth, edge.bandwidth);
        reliability *= edge.reliability;
      }
    }

    return {
      latency: totalLatency,
      bandwidth: minBandwidth === Infinity ? 0 : minBandwidth,
      reliability,
    };
  }

  private calculateTotalCost(path: NodeId[]): number {
    let cost = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const edge = this.graph.get(path[i])?.find(e => e.target === path[i + 1]);
      if (edge) {
        cost += this.calculateEdgeCost(edge);
      } else {
        return Infinity;
      }
    }
    return cost;
  }

  private reconstructPath(
    source: NodeId,
    destination: NodeId,
    previous: Map<NodeId, NodeId>,
    gScore: Map<NodeId, number>
  ): Route {
    const path: NodeId[] = [destination];
    let current = destination;

    while (current !== source) {
      const prev = previous.get(current);
      if (!prev) break;
      path.unshift(prev);
      current = prev;
    }

    return this.createRoute(source, destination, path, gScore.get(destination) ?? 0);
  }

  private reconstructFloydPath(
    source: NodeId,
    destination: NodeId,
    next: Map<string, NodeId>
  ): NodeId[] {
    const key = `${source}:${destination}`;
    if (!next.has(key)) return [];

    const path: NodeId[] = [source];
    let current = source;

    while (current !== destination) {
      const n = next.get(`${current}:${destination}`);
      if (!n) return [];
      path.push(n);
      current = n;

      if (path.length > 100) return []; // Cycle detection
    }

    return path;
  }

  private euclideanHeuristic(from: NodeId, to: NodeId): number {
    const posFrom = this.nodePositions.get(from);
    const posTo = this.nodePositions.get(to);

    if (!posFrom || !posTo) return 0;

    const dx = posTo.x - posFrom.x;
    const dy = posTo.y - posFrom.y;
    return Math.sqrt(dx * dx + dy * dy) * 0.1; // Scaled down
  }

  private pathStartsWith(path: NodeId[], prefix: NodeId[]): boolean {
    if (path.length < prefix.length) return false;
    for (let i = 0; i < prefix.length; i++) {
      if (path[i] !== prefix[i]) return false;
    }
    return true;
  }

  private pathsEqual(path1: NodeId[], path2: NodeId[]): boolean {
    if (path1.length !== path2.length) return false;
    for (let i = 0; i < path1.length; i++) {
      if (path1[i] !== path2[i]) return false;
    }
    return true;
  }

  private isPathDiverse(route: Route, existingRoutes: Route[]): boolean {
    if (existingRoutes.length === 0) return true;

    for (const existing of existingRoutes) {
      const commonNodes = route.path.filter(n =>
        existing.path.includes(n)
      ).length;
      const similarity = commonNodes / Math.max(route.path.length, existing.path.length);

      if (similarity > 1 - this.config.diversityPreference) {
        return false;
      }
    }

    return true;
  }
}
