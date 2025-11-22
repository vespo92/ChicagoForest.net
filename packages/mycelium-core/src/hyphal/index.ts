/**
 * Hyphal Network - Multi-path connections between nodes
 *
 * Like fungal hyphae that form the physical network of mycelium,
 * this module manages the pathways between nodes.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type { HyphalPath, PathMetrics, HyphalState, MyceliumEvents } from '../types';

/**
 * Configuration for the hyphal network manager
 */
export interface HyphalConfig {
  /** Maximum paths per destination */
  maxPathsPerDestination: number;

  /** Path timeout in milliseconds */
  pathTimeout: number;

  /** Health check interval */
  healthCheckInterval: number;

  /** Enable multi-path redundancy */
  multiPathEnabled: boolean;

  /** Minimum reliability threshold */
  minReliability: number;
}

const DEFAULT_CONFIG: HyphalConfig = {
  maxPathsPerDestination: 3,
  pathTimeout: 30000,
  healthCheckInterval: 5000,
  multiPathEnabled: true,
  minReliability: 0.7,
};

/**
 * Manages hyphal pathways - the connective tissue of the network
 */
export class HyphalNetwork extends EventEmitter<MyceliumEvents> {
  private paths: Map<string, HyphalPath> = new Map();
  private pathsByDestination: Map<NodeId, Set<string>> = new Map();
  private config: HyphalConfig;
  private healthCheckTimer?: ReturnType<typeof setInterval>;
  private localNodeId: NodeId;

  constructor(localNodeId: NodeId, config: Partial<HyphalConfig> = {}) {
    super();
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the hyphal network manager
   */
  start(): void {
    this.healthCheckTimer = setInterval(
      () => this.performHealthCheck(),
      this.config.healthCheckInterval
    );
  }

  /**
   * Stop the hyphal network manager
   */
  stop(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Establish a new hyphal path to a destination
   */
  async establishPath(
    destination: NodeId,
    hops: NodeId[] = []
  ): Promise<HyphalPath> {
    const pathId = this.generatePathId(destination, hops);

    // Check if path already exists
    if (this.paths.has(pathId)) {
      return this.paths.get(pathId)!;
    }

    // Check max paths limit
    const existingPaths = this.pathsByDestination.get(destination);
    if (existingPaths && existingPaths.size >= this.config.maxPathsPerDestination) {
      // Remove worst performing path
      await this.pruneWorstPath(destination);
    }

    const now = Date.now();
    const path: HyphalPath = {
      id: pathId,
      source: this.localNodeId,
      destination,
      hops,
      metrics: await this.measurePath(hops),
      state: 'growing',
      establishedAt: now,
      lastActivity: now,
    };

    this.paths.set(pathId, path);

    // Index by destination
    if (!this.pathsByDestination.has(destination)) {
      this.pathsByDestination.set(destination, new Set());
    }
    this.pathsByDestination.get(destination)!.add(pathId);

    // Transition to active after successful establishment
    path.state = 'active';
    this.emit('path:established', path);

    return path;
  }

  /**
   * Get the best path to a destination
   */
  getBestPath(destination: NodeId): HyphalPath | undefined {
    const pathIds = this.pathsByDestination.get(destination);
    if (!pathIds || pathIds.size === 0) {
      return undefined;
    }

    let bestPath: HyphalPath | undefined;
    let bestScore = -1;

    for (const pathId of pathIds) {
      const path = this.paths.get(pathId);
      if (path && path.state === 'active') {
        const score = this.calculatePathScore(path);
        if (score > bestScore) {
          bestScore = score;
          bestPath = path;
        }
      }
    }

    return bestPath;
  }

  /**
   * Get all paths to a destination (for multi-path routing)
   */
  getAllPaths(destination: NodeId): HyphalPath[] {
    const pathIds = this.pathsByDestination.get(destination);
    if (!pathIds) return [];

    return Array.from(pathIds)
      .map(id => this.paths.get(id))
      .filter((p): p is HyphalPath => p !== undefined && p.state === 'active');
  }

  /**
   * Record activity on a path
   */
  recordActivity(pathId: string): void {
    const path = this.paths.get(pathId);
    if (path) {
      path.lastActivity = Date.now();
    }
  }

  /**
   * Update path metrics after measurement
   */
  updateMetrics(pathId: string, metrics: Partial<PathMetrics>): void {
    const path = this.paths.get(pathId);
    if (path) {
      path.metrics = { ...path.metrics, ...metrics };
      this.updatePathState(path);
    }
  }

  /**
   * Heal a degraded or dying path
   */
  async healPath(pathId: string): Promise<boolean> {
    const path = this.paths.get(pathId);
    if (!path) return false;

    if (path.state === 'dead') {
      // Cannot heal dead paths, must establish new one
      return false;
    }

    // Attempt to restore path health
    const newMetrics = await this.measurePath(path.hops);
    path.metrics = newMetrics;

    if (newMetrics.reliability >= this.config.minReliability) {
      path.state = 'active';
      this.emit('path:healed', path);
      return true;
    }

    return false;
  }

  /**
   * Get total path count
   */
  get pathCount(): number {
    return this.paths.size;
  }

  /**
   * Get active path count
   */
  get activePathCount(): number {
    return Array.from(this.paths.values())
      .filter(p => p.state === 'active')
      .length;
  }

  // Private methods

  private generatePathId(destination: NodeId, hops: NodeId[]): string {
    return `${this.localNodeId}:${hops.join(':')}:${destination}`;
  }

  private async measurePath(hops: NodeId[]): Promise<PathMetrics> {
    // Simulate path measurement (in real implementation, send probes)
    const hopCount = hops.length + 1;
    const baseLatency = 10; // ms per hop

    return {
      latency: baseLatency * hopCount + Math.random() * 5,
      bandwidth: 100_000_000 / hopCount, // Bandwidth degrades with hops
      packetLoss: Math.random() * hopCount * 0.5,
      reliability: Math.max(0.5, 1 - (hopCount * 0.05) - Math.random() * 0.1),
      hopCount,
    };
  }

  private calculatePathScore(path: HyphalPath): number {
    const { latency, bandwidth, packetLoss, reliability } = path.metrics;

    // Weighted scoring: lower latency and higher reliability are better
    const latencyScore = Math.max(0, 1 - latency / 500);
    const bandwidthScore = Math.min(1, bandwidth / 100_000_000);
    const lossScore = Math.max(0, 1 - packetLoss / 100);

    return (
      reliability * 0.4 +
      latencyScore * 0.3 +
      bandwidthScore * 0.2 +
      lossScore * 0.1
    );
  }

  private updatePathState(path: HyphalPath): void {
    const { reliability, packetLoss } = path.metrics;
    const previousState = path.state;

    if (reliability < 0.3 || packetLoss > 50) {
      path.state = 'dying';
    } else if (reliability < 0.5 || packetLoss > 20) {
      path.state = 'stressed';
    } else if (reliability >= this.config.minReliability) {
      path.state = 'active';
    }

    if (previousState !== path.state) {
      if (path.state === 'stressed' || path.state === 'dying') {
        this.emit('path:degraded', path);
      } else if (path.state === 'active' && previousState !== 'growing') {
        this.emit('path:healed', path);
      }
    }
  }

  private async pruneWorstPath(destination: NodeId): Promise<void> {
    const pathIds = this.pathsByDestination.get(destination);
    if (!pathIds || pathIds.size === 0) return;

    let worstPath: HyphalPath | undefined;
    let worstScore = Infinity;

    for (const pathId of pathIds) {
      const path = this.paths.get(pathId);
      if (path) {
        const score = this.calculatePathScore(path);
        if (score < worstScore) {
          worstScore = score;
          worstPath = path;
        }
      }
    }

    if (worstPath) {
      this.paths.delete(worstPath.id);
      pathIds.delete(worstPath.id);
      this.emit('path:died', worstPath.id);
    }
  }

  private performHealthCheck(): void {
    const now = Date.now();

    for (const [pathId, path] of this.paths) {
      // Check for timed out paths
      if (now - path.lastActivity > this.config.pathTimeout) {
        if (path.state === 'active') {
          path.state = 'dormant';
          this.emit('path:degraded', path);
        } else if (path.state === 'dormant') {
          path.state = 'dying';
        } else if (path.state === 'dying') {
          path.state = 'dead';
          this.paths.delete(pathId);
          this.pathsByDestination.get(path.destination)?.delete(pathId);
          this.emit('path:died', pathId);
        }
      }
    }
  }
}

export { HyphalPath, PathMetrics, HyphalState };
