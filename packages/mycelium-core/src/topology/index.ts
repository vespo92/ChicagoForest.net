/**
 * Topology Manager - Dynamic network shape optimization
 *
 * The mycelium doesn't just connect - it optimizes. This module
 * analyzes and reshapes the network topology for resilience and efficiency.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  TopologySnapshot,
  NodeInfo,
  NetworkHealth,
  TopologyShape,
  NodeRole,
  HyphalPath,
  MyceliumEvents,
} from '../types';

/**
 * Configuration for topology management
 */
export interface TopologyConfig {
  /** Snapshot interval in milliseconds */
  snapshotInterval: number;

  /** Target average connections per node */
  targetDegree: number;

  /** Maximum connections per node */
  maxDegree: number;

  /** Minimum connections per node */
  minDegree: number;

  /** Health check threshold for warnings */
  warningThreshold: number;

  /** Health check threshold for critical alerts */
  criticalThreshold: number;

  /** Enable automatic optimization */
  autoOptimize: boolean;
}

const DEFAULT_CONFIG: TopologyConfig = {
  snapshotInterval: 10000,
  targetDegree: 6,
  maxDegree: 20,
  minDegree: 2,
  warningThreshold: 60,
  criticalThreshold: 30,
  autoOptimize: true,
};

/**
 * Manages network topology analysis and optimization
 */
export class TopologyManager extends EventEmitter<MyceliumEvents> {
  private config: TopologyConfig;
  private localNodeId: NodeId;
  private nodes: Map<NodeId, NodeInfo> = new Map();
  private paths: Map<string, HyphalPath> = new Map();
  private lastSnapshot?: TopologySnapshot;
  private snapshotTimer?: ReturnType<typeof setInterval>;

  constructor(localNodeId: NodeId, config: Partial<TopologyConfig> = {}) {
    super();
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start topology monitoring
   */
  start(): void {
    this.snapshotTimer = setInterval(
      () => this.takeSnapshot(),
      this.config.snapshotInterval
    );
    this.takeSnapshot();
  }

  /**
   * Stop topology monitoring
   */
  stop(): void {
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer);
      this.snapshotTimer = undefined;
    }
  }

  /**
   * Register a node in the topology
   */
  registerNode(info: NodeInfo): void {
    this.nodes.set(info.id, info);
  }

  /**
   * Remove a node from the topology
   */
  unregisterNode(nodeId: NodeId): void {
    this.nodes.delete(nodeId);
    this.emit('node:lost', nodeId);
  }

  /**
   * Update node information
   */
  updateNode(nodeId: NodeId, update: Partial<NodeInfo>): void {
    const existing = this.nodes.get(nodeId);
    if (existing) {
      this.nodes.set(nodeId, { ...existing, ...update });
    }
  }

  /**
   * Register a path in the topology
   */
  registerPath(path: HyphalPath): void {
    this.paths.set(path.id, path);
  }

  /**
   * Remove a path from the topology
   */
  unregisterPath(pathId: string): void {
    this.paths.delete(pathId);
  }

  /**
   * Get the current topology snapshot
   */
  getSnapshot(): TopologySnapshot | undefined {
    return this.lastSnapshot;
  }

  /**
   * Calculate network health metrics
   */
  calculateHealth(): NetworkHealth {
    const nodeCount = this.nodes.size;
    if (nodeCount === 0) {
      return {
        score: 0,
        activeNodes: 0,
        avgReliability: 0,
        partitionRisk: 1,
        growthRate: 0,
      };
    }

    // Calculate average reliability from paths
    let totalReliability = 0;
    let pathCount = 0;
    for (const path of this.paths.values()) {
      if (path.state === 'active') {
        totalReliability += path.metrics.reliability;
        pathCount++;
      }
    }
    const avgReliability = pathCount > 0 ? totalReliability / pathCount : 0;

    // Calculate partition risk based on connectivity
    const partitionRisk = this.calculatePartitionRisk();

    // Calculate growth rate (would need historical data in real implementation)
    const growthRate = 0; // Placeholder

    // Overall health score
    const score = this.calculateHealthScore(avgReliability, partitionRisk, nodeCount);

    return {
      score,
      activeNodes: nodeCount,
      avgReliability,
      partitionRisk,
      growthRate,
    };
  }

  /**
   * Classify the current topology shape
   */
  classifyShape(): TopologyShape {
    const nodeCount = this.nodes.size;
    if (nodeCount < 3) return 'random';

    const degrees = this.calculateDegreeDistribution();
    const avgDegree = degrees.reduce((a, b) => a + b, 0) / degrees.length;
    const maxDegree = Math.max(...degrees);
    const minDegree = Math.min(...degrees);

    // Classify based on degree distribution
    if (maxDegree > avgDegree * 3 && minDegree < avgDegree * 0.5) {
      return 'star'; // Hub and spoke pattern
    }

    if (maxDegree - minDegree <= 2) {
      if (avgDegree === 2) return 'ring';
      if (avgDegree >= 4) return 'mesh';
    }

    // Check for small-world characteristics
    const clusteringCoefficient = this.calculateClusteringCoefficient();
    if (clusteringCoefficient > 0.3 && this.hasShortcuts()) {
      return 'small-world';
    }

    // Check for tree structure
    if (this.isTreeLike()) {
      return 'tree';
    }

    return 'random';
  }

  /**
   * Determine the role of a node in the topology
   */
  determineNodeRole(nodeId: NodeId): NodeRole {
    const connections = this.getConnectionCount(nodeId);
    const avgConnections = this.calculateAverageConnections();

    if (connections > avgConnections * 2) {
      return 'hub';
    }

    if (this.isBridgeNode(nodeId)) {
      return 'bridge';
    }

    if (this.isGatewayNode(nodeId)) {
      return 'gateway';
    }

    if (connections <= 2) {
      return 'leaf';
    }

    return 'relay';
  }

  /**
   * Suggest topology optimizations
   */
  suggestOptimizations(): TopologyOptimization[] {
    const optimizations: TopologyOptimization[] = [];
    const health = this.calculateHealth();

    // Check for under-connected nodes
    for (const [nodeId, info] of this.nodes) {
      const connections = info.connectionCount;

      if (connections < this.config.minDegree) {
        optimizations.push({
          type: 'add_connection',
          priority: 'high',
          sourceNode: nodeId,
          reason: `Node has only ${connections} connections, below minimum of ${this.config.minDegree}`,
        });
      } else if (connections > this.config.maxDegree) {
        optimizations.push({
          type: 'remove_connection',
          priority: 'medium',
          sourceNode: nodeId,
          reason: `Node has ${connections} connections, above maximum of ${this.config.maxDegree}`,
        });
      }
    }

    // Check partition risk
    if (health.partitionRisk > 0.5) {
      optimizations.push({
        type: 'add_bridge',
        priority: 'critical',
        reason: `High partition risk (${(health.partitionRisk * 100).toFixed(1)}%)`,
      });
    }

    return optimizations;
  }

  // Private methods

  private takeSnapshot(): void {
    const health = this.calculateHealth();
    const shape = this.classifyShape();

    const snapshot: TopologySnapshot = {
      timestamp: Date.now(),
      nodes: new Map(this.nodes),
      paths: new Map(this.paths),
      health,
      shape,
    };

    const previousSnapshot = this.lastSnapshot;
    this.lastSnapshot = snapshot;

    // Emit events based on health changes
    if (previousSnapshot) {
      if (health.score !== previousSnapshot.health.score) {
        this.emit('topology:changed', snapshot);
      }
    }

    if (health.score < this.config.criticalThreshold) {
      this.emit('health:critical', health);
    } else if (health.score < this.config.warningThreshold) {
      this.emit('health:warning', health);
    }
  }

  private calculatePartitionRisk(): number {
    // Simplified partition risk based on minimum cut
    const nodeCount = this.nodes.size;
    const pathCount = this.paths.size;

    if (nodeCount <= 1) return 0;
    if (pathCount < nodeCount - 1) return 1; // Not even a spanning tree

    // More paths = lower risk
    const redundancy = pathCount / (nodeCount - 1);
    return Math.max(0, 1 - (redundancy - 1) / 3);
  }

  private calculateHealthScore(
    avgReliability: number,
    partitionRisk: number,
    nodeCount: number
  ): number {
    // Weight factors
    const reliabilityWeight = 0.4;
    const partitionWeight = 0.4;
    const sizeWeight = 0.2;

    // Size score (logarithmic, caps at 100 nodes)
    const sizeScore = Math.min(1, Math.log10(nodeCount + 1) / 2);

    return (
      avgReliability * reliabilityWeight * 100 +
      (1 - partitionRisk) * partitionWeight * 100 +
      sizeScore * sizeWeight * 100
    );
  }

  private calculateDegreeDistribution(): number[] {
    return Array.from(this.nodes.values()).map(n => n.connectionCount);
  }

  private calculateAverageConnections(): number {
    if (this.nodes.size === 0) return 0;
    const total = Array.from(this.nodes.values())
      .reduce((sum, n) => sum + n.connectionCount, 0);
    return total / this.nodes.size;
  }

  private getConnectionCount(nodeId: NodeId): number {
    return this.nodes.get(nodeId)?.connectionCount ?? 0;
  }

  private calculateClusteringCoefficient(): number {
    // Simplified clustering coefficient
    // In real implementation, would analyze triangle formations
    return 0.3; // Placeholder
  }

  private hasShortcuts(): boolean {
    // Check for long-range connections that reduce average path length
    // Simplified implementation
    return this.paths.size > this.nodes.size * 1.5;
  }

  private isTreeLike(): boolean {
    // A tree has exactly n-1 edges for n nodes
    return this.paths.size === this.nodes.size - 1;
  }

  private isBridgeNode(nodeId: NodeId): boolean {
    // A bridge node, if removed, would disconnect parts of the network
    // Simplified: nodes with connections to otherwise disconnected clusters
    return false; // Would need full graph analysis
  }

  private isGatewayNode(nodeId: NodeId): boolean {
    // Gateway nodes connect to other forests
    // Would check for external connections
    return false;
  }
}

export interface TopologyOptimization {
  type: 'add_connection' | 'remove_connection' | 'add_bridge' | 'rebalance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  sourceNode?: NodeId;
  targetNode?: NodeId;
  reason: string;
}

export { TopologySnapshot, NetworkHealth, TopologyShape, NodeRole };
