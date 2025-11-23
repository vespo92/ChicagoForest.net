/**
 * Neural Network Metrics - Network Analysis and Visualization
 *
 * Comprehensive metrics collection and visualization utilities for
 * analyzing the health, structure, and behavior of the mycelium network.
 *
 * ⚠️ DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 */

import type { NodeId } from '@chicago-forest/shared-types';
import type {
  TopologySnapshot,
  NetworkHealth,
  HyphalPath,
  NodeInfo,
  Signal,
} from '../types';

/**
 * Comprehensive network metrics snapshot
 */
export interface NetworkMetrics {
  /** Timestamp of metrics collection */
  timestamp: number;

  /** Node-level metrics */
  nodes: NodeMetricsSummary;

  /** Path-level metrics */
  paths: PathMetricsSummary;

  /** Signal propagation metrics */
  signals: SignalMetricsSummary;

  /** Topology metrics */
  topology: TopologyMetricsSummary;

  /** Growth and dynamics metrics */
  dynamics: DynamicsMetricsSummary;
}

export interface NodeMetricsSummary {
  /** Total node count */
  total: number;

  /** Active nodes (seen in last minute) */
  active: number;

  /** Average connections per node */
  avgDegree: number;

  /** Degree distribution (key: degree, value: count) */
  degreeDistribution: Map<number, number>;

  /** Most connected nodes (hubs) */
  topHubs: Array<{ nodeId: NodeId; connections: number }>;

  /** Isolated nodes (degree < 2) */
  isolatedCount: number;

  /** Average node uptime in milliseconds */
  avgUptime: number;
}

export interface PathMetricsSummary {
  /** Total paths */
  total: number;

  /** Active paths */
  active: number;

  /** Stressed paths */
  stressed: number;

  /** Dying/dead paths */
  failing: number;

  /** Average path latency */
  avgLatency: number;

  /** Median path latency */
  medianLatency: number;

  /** 95th percentile latency */
  p95Latency: number;

  /** Average reliability */
  avgReliability: number;

  /** Average hop count */
  avgHops: number;

  /** Path churn rate (paths changed per minute) */
  churnRate: number;
}

export interface SignalMetricsSummary {
  /** Signals per second (send rate) */
  sendRate: number;

  /** Signals per second (receive rate) */
  receiveRate: number;

  /** Average propagation hops */
  avgPropagationHops: number;

  /** Signal type distribution */
  typeDistribution: Map<string, number>;

  /** Duplicate signal rate */
  duplicateRate: number;

  /** Average signal latency */
  avgSignalLatency: number;
}

export interface TopologyMetricsSummary {
  /** Network diameter (longest shortest path) */
  diameter: number;

  /** Average path length between any two nodes */
  avgPathLength: number;

  /** Clustering coefficient */
  clusteringCoefficient: number;

  /** Modularity score */
  modularity: number;

  /** Number of detected communities */
  communityCount: number;

  /** Network centralization */
  centralization: number;

  /** Betweenness centrality of top nodes */
  topBetweenness: Array<{ nodeId: NodeId; centrality: number }>;
}

export interface DynamicsMetricsSummary {
  /** Growth rate (nodes per hour) */
  growthRate: number;

  /** Churn rate (nodes leaving per hour) */
  churnRate: number;

  /** Network age in milliseconds */
  networkAge: number;

  /** Healing success rate */
  healingSuccessRate: number;

  /** Average time to heal a path */
  avgHealTime: number;

  /** Self-organization score (0-1) */
  selfOrganizationScore: number;
}

/**
 * Time-series data point for visualization
 */
export interface TimeSeriesPoint {
  timestamp: number;
  value: number;
  label?: string;
}

/**
 * Graph visualization data
 */
export interface VisualizationData {
  /** Nodes for rendering */
  nodes: VisualizationNode[];

  /** Edges for rendering */
  edges: VisualizationEdge[];

  /** Suggested layout positions */
  layout: Map<NodeId, { x: number; y: number }>;

  /** Visualization metadata */
  meta: {
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
    center: { x: number; y: number };
    scale: number;
  };
}

export interface VisualizationNode {
  id: NodeId;
  label: string;
  size: number;
  color: string;
  cluster?: string;
  role?: string;
  metrics: {
    degree: number;
    betweenness: number;
    health: number;
  };
}

export interface VisualizationEdge {
  source: NodeId;
  target: NodeId;
  weight: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
  metrics: {
    latency: number;
    reliability: number;
    bandwidth: number;
  };
}

/**
 * Configuration for metrics collection
 */
export interface MetricsConfig {
  /** Retention period for time-series data (ms) */
  retentionPeriod: number;

  /** Collection interval (ms) */
  collectionInterval: number;

  /** Number of top items to track */
  topN: number;

  /** Enable detailed per-node metrics */
  detailedNodeMetrics: boolean;

  /** Enable path history tracking */
  pathHistory: boolean;
}

const DEFAULT_CONFIG: MetricsConfig = {
  retentionPeriod: 3600000, // 1 hour
  collectionInterval: 10000, // 10 seconds
  topN: 10,
  detailedNodeMetrics: true,
  pathHistory: true,
};

/**
 * Metrics collector and analyzer for the mycelium network
 */
export class MetricsCollector {
  private config: MetricsConfig;
  private history: NetworkMetrics[] = [];
  private signalCounts: Map<string, number[]> = new Map();
  private pathChanges: number[] = [];
  private startTime: number;

  constructor(config: Partial<MetricsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = Date.now();
  }

  /**
   * Collect comprehensive metrics from a topology snapshot
   */
  collect(snapshot: TopologySnapshot): NetworkMetrics {
    const metrics: NetworkMetrics = {
      timestamp: Date.now(),
      nodes: this.collectNodeMetrics(snapshot),
      paths: this.collectPathMetrics(snapshot),
      signals: this.collectSignalMetrics(),
      topology: this.collectTopologyMetrics(snapshot),
      dynamics: this.collectDynamicsMetrics(snapshot),
    };

    // Store in history
    this.history.push(metrics);

    // Cleanup old history
    this.pruneHistory();

    return metrics;
  }

  /**
   * Record a signal event
   */
  recordSignal(signal: Signal): void {
    const key = signal.type;
    if (!this.signalCounts.has(key)) {
      this.signalCounts.set(key, []);
    }
    this.signalCounts.get(key)!.push(Date.now());
  }

  /**
   * Record a path change event
   */
  recordPathChange(): void {
    this.pathChanges.push(Date.now());
  }

  /**
   * Get historical metrics time series
   */
  getTimeSeries(metric: keyof NetworkHealth): TimeSeriesPoint[] {
    return this.history.map(m => ({
      timestamp: m.timestamp,
      value: this.extractMetricValue(m, metric),
    }));
  }

  /**
   * Generate visualization data from snapshot
   */
  generateVisualization(snapshot: TopologySnapshot): VisualizationData {
    const nodes: VisualizationNode[] = [];
    const edges: VisualizationEdge[] = [];
    const layout = new Map<NodeId, { x: number; y: number }>();

    // Calculate node metrics
    const degrees = this.calculateDegrees(snapshot);
    const betweenness = this.calculateBetweenness(snapshot);

    // Generate nodes
    for (const [nodeId, info] of snapshot.nodes) {
      const degree = degrees.get(nodeId) ?? 0;
      const bet = betweenness.get(nodeId) ?? 0;

      nodes.push({
        id: nodeId,
        label: nodeId.substring(0, 8),
        size: 10 + Math.log2(degree + 1) * 5,
        color: this.getNodeColor(info.role),
        cluster: undefined, // Set by cluster detector
        role: info.role,
        metrics: {
          degree,
          betweenness: bet,
          health: this.calculateNodeHealth(info, snapshot),
        },
      });
    }

    // Generate edges
    const seenEdges = new Set<string>();
    for (const path of snapshot.paths.values()) {
      const edgeKey = [path.source, path.destination].sort().join(':');
      if (seenEdges.has(edgeKey)) continue;
      seenEdges.add(edgeKey);

      edges.push({
        source: path.source,
        target: path.destination,
        weight: path.metrics.reliability,
        color: this.getEdgeColor(path),
        style: this.getEdgeStyle(path),
        metrics: {
          latency: path.metrics.latency,
          reliability: path.metrics.reliability,
          bandwidth: path.metrics.bandwidth,
        },
      });
    }

    // Calculate force-directed layout
    this.calculateLayout(nodes, edges, layout);

    // Calculate bounds
    const positions = Array.from(layout.values());
    const bounds = {
      minX: Math.min(...positions.map(p => p.x)),
      maxX: Math.max(...positions.map(p => p.x)),
      minY: Math.min(...positions.map(p => p.y)),
      maxY: Math.max(...positions.map(p => p.y)),
    };

    return {
      nodes,
      edges,
      layout,
      meta: {
        bounds,
        center: {
          x: (bounds.minX + bounds.maxX) / 2,
          y: (bounds.minY + bounds.maxY) / 2,
        },
        scale: 1,
      },
    };
  }

  /**
   * Export metrics as JSON for external tools
   */
  exportJSON(): string {
    const latest = this.history[this.history.length - 1];
    if (!latest) return '{}';

    return JSON.stringify(
      {
        ...latest,
        nodes: {
          ...latest.nodes,
          degreeDistribution: Object.fromEntries(latest.nodes.degreeDistribution),
        },
        signals: {
          ...latest.signals,
          typeDistribution: Object.fromEntries(latest.signals.typeDistribution),
        },
      },
      null,
      2
    );
  }

  /**
   * Get health dashboard summary
   */
  getHealthDashboard(): {
    overallHealth: number;
    status: 'healthy' | 'degraded' | 'critical';
    alerts: string[];
    recommendations: string[];
  } {
    const latest = this.history[this.history.length - 1];
    if (!latest) {
      return {
        overallHealth: 0,
        status: 'critical',
        alerts: ['No metrics collected'],
        recommendations: ['Start collecting metrics'],
      };
    }

    const alerts: string[] = [];
    const recommendations: string[] = [];

    // Calculate overall health
    let healthScore = 100;

    // Check path health
    const pathHealthRatio = latest.paths.active / Math.max(latest.paths.total, 1);
    if (pathHealthRatio < 0.8) {
      healthScore -= 20;
      alerts.push(`${(1 - pathHealthRatio) * 100}% of paths degraded or failing`);
    }
    if (latest.paths.avgReliability < 0.7) {
      healthScore -= 15;
      recommendations.push('Consider establishing redundant paths');
    }

    // Check node connectivity
    if (latest.nodes.avgDegree < 2) {
      healthScore -= 15;
      recommendations.push('Network is sparsely connected - encourage more connections');
    }
    if (latest.nodes.isolatedCount > latest.nodes.total * 0.1) {
      healthScore -= 10;
      alerts.push(`${latest.nodes.isolatedCount} nodes are isolated`);
    }

    // Check topology health
    if (latest.topology.clusteringCoefficient < 0.2) {
      healthScore -= 10;
      recommendations.push('Network lacks local clustering - may need bridge nodes');
    }

    // Check dynamics
    if (latest.dynamics.churnRate > latest.dynamics.growthRate * 2) {
      healthScore -= 15;
      alerts.push('High node churn rate detected');
    }

    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      overallHealth: healthScore,
      status: healthScore >= 70 ? 'healthy' : healthScore >= 40 ? 'degraded' : 'critical',
      alerts,
      recommendations,
    };
  }

  // Private collection methods

  private collectNodeMetrics(snapshot: TopologySnapshot): NodeMetricsSummary {
    const nodes = Array.from(snapshot.nodes.values());
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    const degrees = this.calculateDegrees(snapshot);
    const degreeDistribution = new Map<number, number>();

    for (const degree of degrees.values()) {
      degreeDistribution.set(degree, (degreeDistribution.get(degree) ?? 0) + 1);
    }

    const sortedByDegree = Array.from(degrees.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.config.topN);

    const activeCount = nodes.filter(n => n.lastSeen > oneMinuteAgo).length;
    const isolatedCount = Array.from(degrees.values()).filter(d => d < 2).length;

    return {
      total: nodes.length,
      active: activeCount,
      avgDegree: nodes.length > 0
        ? Array.from(degrees.values()).reduce((a, b) => a + b, 0) / nodes.length
        : 0,
      degreeDistribution,
      topHubs: sortedByDegree.map(([nodeId, connections]) => ({ nodeId, connections })),
      isolatedCount,
      avgUptime: nodes.length > 0
        ? nodes.reduce((sum, n) => sum + (now - n.lastSeen), 0) / nodes.length
        : 0,
    };
  }

  private collectPathMetrics(snapshot: TopologySnapshot): PathMetricsSummary {
    const paths = Array.from(snapshot.paths.values());
    const now = Date.now();

    const activePaths = paths.filter(p => p.state === 'active');
    const stressedPaths = paths.filter(p => p.state === 'stressed');
    const failingPaths = paths.filter(p => p.state === 'dying' || p.state === 'dead');

    const latencies = paths.map(p => p.metrics.latency).sort((a, b) => a - b);
    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    const medianLatency = latencies.length > 0
      ? latencies[Math.floor(latencies.length / 2)]
      : 0;

    const p95Latency = latencies.length > 0
      ? latencies[Math.floor(latencies.length * 0.95)]
      : 0;

    // Calculate churn rate
    const recentChanges = this.pathChanges.filter(t => t > now - 60000);
    const churnRate = recentChanges.length;

    return {
      total: paths.length,
      active: activePaths.length,
      stressed: stressedPaths.length,
      failing: failingPaths.length,
      avgLatency,
      medianLatency,
      p95Latency,
      avgReliability: paths.length > 0
        ? paths.reduce((sum, p) => sum + p.metrics.reliability, 0) / paths.length
        : 0,
      avgHops: paths.length > 0
        ? paths.reduce((sum, p) => sum + p.metrics.hopCount, 0) / paths.length
        : 0,
      churnRate,
    };
  }

  private collectSignalMetrics(): SignalMetricsSummary {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const typeDistribution = new Map<string, number>();

    let totalSignals = 0;
    let totalHops = 0;

    for (const [type, timestamps] of this.signalCounts) {
      const recent = timestamps.filter(t => t > oneSecondAgo);
      typeDistribution.set(type, recent.length);
      totalSignals += recent.length;
    }

    return {
      sendRate: totalSignals,
      receiveRate: totalSignals, // Simplified
      avgPropagationHops: totalSignals > 0 ? totalHops / totalSignals : 0,
      typeDistribution,
      duplicateRate: 0, // Would need dedup tracking
      avgSignalLatency: 0, // Would need timing tracking
    };
  }

  private collectTopologyMetrics(snapshot: TopologySnapshot): TopologyMetricsSummary {
    const degrees = this.calculateDegrees(snapshot);
    const betweenness = this.calculateBetweenness(snapshot);

    // Simplified clustering coefficient
    const clusteringCoefficient = this.calculateClusteringCoefficient(snapshot);

    // Top betweenness centrality nodes
    const topBetweenness = Array.from(betweenness.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.config.topN)
      .map(([nodeId, centrality]) => ({ nodeId, centrality }));

    // Calculate centralization
    const maxDegree = Math.max(...degrees.values(), 0);
    const sumDiff = Array.from(degrees.values()).reduce(
      (sum, d) => sum + (maxDegree - d),
      0
    );
    const maxPossibleSum = (snapshot.nodes.size - 1) * (snapshot.nodes.size - 2);
    const centralization = maxPossibleSum > 0 ? sumDiff / maxPossibleSum : 0;

    return {
      diameter: this.estimateDiameter(snapshot),
      avgPathLength: this.estimateAvgPathLength(snapshot),
      clusteringCoefficient,
      modularity: 0, // Requires community detection
      communityCount: 0, // Requires community detection
      centralization,
      topBetweenness,
    };
  }

  private collectDynamicsMetrics(snapshot: TopologySnapshot): DynamicsMetricsSummary {
    const now = Date.now();
    const networkAge = now - this.startTime;

    // Calculate rates from history
    let growthRate = 0;
    let churnRate = 0;

    if (this.history.length >= 2) {
      const hourAgo = this.history.find(m => m.timestamp > now - 3600000);
      if (hourAgo) {
        const latestNodes = this.history[this.history.length - 1].nodes.total;
        growthRate = (latestNodes - hourAgo.nodes.total) / (networkAge / 3600000);
      }
    }

    return {
      growthRate,
      churnRate,
      networkAge,
      healingSuccessRate: 0.8, // Would need healing tracking
      avgHealTime: 5000, // Would need healing tracking
      selfOrganizationScore: this.calculateSelfOrganization(snapshot),
    };
  }

  // Private helper methods

  private calculateDegrees(snapshot: TopologySnapshot): Map<NodeId, number> {
    const degrees = new Map<NodeId, number>();

    for (const path of snapshot.paths.values()) {
      degrees.set(path.source, (degrees.get(path.source) ?? 0) + 1);
      degrees.set(path.destination, (degrees.get(path.destination) ?? 0) + 1);
    }

    return degrees;
  }

  private calculateBetweenness(snapshot: TopologySnapshot): Map<NodeId, number> {
    // Simplified betweenness - count how many paths pass through each node
    const betweenness = new Map<NodeId, number>();

    for (const path of snapshot.paths.values()) {
      for (const hop of path.hops) {
        betweenness.set(hop, (betweenness.get(hop) ?? 0) + 1);
      }
    }

    // Normalize
    const maxBet = Math.max(...betweenness.values(), 1);
    for (const [node, value] of betweenness) {
      betweenness.set(node, value / maxBet);
    }

    return betweenness;
  }

  private calculateClusteringCoefficient(snapshot: TopologySnapshot): number {
    // Simplified global clustering coefficient
    const adjacency = new Map<NodeId, Set<NodeId>>();

    for (const path of snapshot.paths.values()) {
      if (!adjacency.has(path.source)) adjacency.set(path.source, new Set());
      if (!adjacency.has(path.destination)) adjacency.set(path.destination, new Set());
      adjacency.get(path.source)!.add(path.destination);
      adjacency.get(path.destination)!.add(path.source);
    }

    let triangles = 0;
    let triplets = 0;

    for (const [node, neighbors] of adjacency) {
      const neighborList = Array.from(neighbors);
      const k = neighborList.length;
      if (k < 2) continue;

      triplets += (k * (k - 1)) / 2;

      for (let i = 0; i < neighborList.length; i++) {
        for (let j = i + 1; j < neighborList.length; j++) {
          if (adjacency.get(neighborList[i])?.has(neighborList[j])) {
            triangles++;
          }
        }
      }
    }

    return triplets > 0 ? triangles / triplets : 0;
  }

  private estimateDiameter(snapshot: TopologySnapshot): number {
    // Simplified - use max hop count from paths
    let maxHops = 0;
    for (const path of snapshot.paths.values()) {
      maxHops = Math.max(maxHops, path.hops.length + 1);
    }
    return maxHops;
  }

  private estimateAvgPathLength(snapshot: TopologySnapshot): number {
    const paths = Array.from(snapshot.paths.values());
    if (paths.length === 0) return 0;
    return paths.reduce((sum, p) => sum + p.hops.length + 1, 0) / paths.length;
  }

  private calculateSelfOrganization(snapshot: TopologySnapshot): number {
    // Score based on topology health and structure
    const health = snapshot.health;
    return Math.min(1, (health.score / 100) * (1 - health.partitionRisk));
  }

  private calculateNodeHealth(info: NodeInfo, snapshot: TopologySnapshot): number {
    const now = Date.now();
    const recency = Math.max(0, 1 - (now - info.lastSeen) / 60000);
    const connectivity = Math.min(1, info.connectionCount / 5);
    return (recency + connectivity) / 2;
  }

  private getNodeColor(role?: string): string {
    switch (role) {
      case 'hub': return '#ff6b6b';
      case 'bridge': return '#4ecdc4';
      case 'gateway': return '#ffe66d';
      case 'relay': return '#95e1d3';
      case 'leaf': return '#a8d8ea';
      default: return '#cccccc';
    }
  }

  private getEdgeColor(path: HyphalPath): string {
    if (path.state === 'dying' || path.state === 'dead') return '#ff6b6b';
    if (path.state === 'stressed') return '#ffd93d';
    if (path.metrics.reliability > 0.9) return '#6bcb77';
    return '#95a5a6';
  }

  private getEdgeStyle(path: HyphalPath): 'solid' | 'dashed' | 'dotted' {
    if (path.state === 'growing') return 'dotted';
    if (path.state === 'stressed') return 'dashed';
    return 'solid';
  }

  private calculateLayout(
    nodes: VisualizationNode[],
    edges: VisualizationEdge[],
    layout: Map<NodeId, { x: number; y: number }>
  ): void {
    // Simple force-directed layout initialization
    const width = 800;
    const height = 600;

    // Initialize positions randomly
    for (const node of nodes) {
      layout.set(node.id, {
        x: Math.random() * width,
        y: Math.random() * height,
      });
    }

    // Run force simulation (simplified)
    const iterations = 50;
    const k = Math.sqrt((width * height) / nodes.length);

    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const pos1 = layout.get(nodes[i].id)!;
          const pos2 = layout.get(nodes[j].id)!;

          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          const force = (k * k) / dist;
          const fx = (dx / dist) * force * 0.1;
          const fy = (dy / dist) * force * 0.1;

          pos1.x -= fx;
          pos1.y -= fy;
          pos2.x += fx;
          pos2.y += fy;
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const pos1 = layout.get(edge.source);
        const pos2 = layout.get(edge.target);
        if (!pos1 || !pos2) continue;

        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = (dist * dist) / k;
        const fx = (dx / dist) * force * 0.05;
        const fy = (dy / dist) * force * 0.05;

        pos1.x += fx;
        pos1.y += fy;
        pos2.x -= fx;
        pos2.y -= fy;
      }

      // Keep in bounds
      for (const pos of layout.values()) {
        pos.x = Math.max(50, Math.min(width - 50, pos.x));
        pos.y = Math.max(50, Math.min(height - 50, pos.y));
      }
    }
  }

  private pruneHistory(): void {
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.history = this.history.filter(m => m.timestamp > cutoff);

    // Prune signal counts
    for (const [type, timestamps] of this.signalCounts) {
      this.signalCounts.set(type, timestamps.filter(t => t > cutoff));
    }

    // Prune path changes
    this.pathChanges = this.pathChanges.filter(t => t > cutoff);
  }

  private extractMetricValue(metrics: NetworkMetrics, key: keyof NetworkHealth): number {
    switch (key) {
      case 'score': return metrics.nodes.active / Math.max(metrics.nodes.total, 1) * 100;
      case 'activeNodes': return metrics.nodes.active;
      case 'avgReliability': return metrics.paths.avgReliability;
      case 'partitionRisk': return metrics.nodes.isolatedCount / Math.max(metrics.nodes.total, 1);
      case 'growthRate': return metrics.dynamics.growthRate;
      default: return 0;
    }
  }
}
