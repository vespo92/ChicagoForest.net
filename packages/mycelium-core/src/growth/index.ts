/**
 * Growth Engine - Algorithms for organic network expansion
 *
 * Like how mycelium grows toward nutrients and away from toxins,
 * this module manages intelligent network expansion and pruning.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type { GrowthPattern, GrowthDirective, MyceliumEvents, NodeInfo } from '../types';

/**
 * Configuration for growth management
 */
export interface GrowthConfig {
  /** Maximum growth rate (new connections per minute) */
  maxGrowthRate: number;

  /** Minimum interval between growth attempts (ms) */
  growthCooldown: number;

  /** Enable autonomous growth */
  autonomousGrowth: boolean;

  /** Target network size (0 = unlimited) */
  targetSize: number;

  /** Pruning threshold - remove paths below this reliability */
  pruneThreshold: number;

  /** Enable defensive growth when health drops */
  defensiveGrowth: boolean;
}

const DEFAULT_CONFIG: GrowthConfig = {
  maxGrowthRate: 10,
  growthCooldown: 5000,
  autonomousGrowth: true,
  targetSize: 0,
  pruneThreshold: 0.3,
  defensiveGrowth: true,
};

/**
 * Growth target representing a potential expansion direction
 */
export interface GrowthTarget {
  /** Target node or region identifier */
  id: string;

  /** Type of target */
  type: 'node' | 'region' | 'resource' | 'gateway';

  /** Priority score (0-1) */
  priority: number;

  /** Estimated cost to reach */
  cost: number;

  /** Estimated benefit of connection */
  benefit: number;

  /** Discovery timestamp */
  discoveredAt: number;
}

/**
 * Growth result tracking
 */
export interface GrowthResult {
  /** The directive that was executed */
  directive: GrowthDirective;

  /** Whether growth was successful */
  success: boolean;

  /** Number of new connections established */
  newConnections: number;

  /** Time taken in milliseconds */
  duration: number;

  /** Any errors encountered */
  errors: string[];
}

/**
 * Manages organic network growth and pruning
 */
export class GrowthEngine extends EventEmitter<MyceliumEvents> {
  private config: GrowthConfig;
  private localNodeId: NodeId;
  private activeDirectives: Map<string, GrowthDirective> = new Map();
  private growthTargets: Map<string, GrowthTarget> = new Map();
  private lastGrowthAttempt: number = 0;
  private growthHistory: GrowthResult[] = [];

  // Callbacks for network operations
  private discoverPeers: () => Promise<NodeInfo[]> = async () => [];
  private connectToPeer: (nodeId: NodeId) => Promise<boolean> = async () => false;
  private disconnectPeer: (nodeId: NodeId) => Promise<void> = async () => {};

  constructor(localNodeId: NodeId, config: Partial<GrowthConfig> = {}) {
    super();
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set peer discovery callback
   */
  setDiscoveryProvider(provider: () => Promise<NodeInfo[]>): void {
    this.discoverPeers = provider;
  }

  /**
   * Set connection callbacks
   */
  setConnectionHandlers(
    connect: (nodeId: NodeId) => Promise<boolean>,
    disconnect: (nodeId: NodeId) => Promise<void>
  ): void {
    this.connectToPeer = connect;
    this.disconnectPeer = disconnect;
  }

  /**
   * Initiate a growth phase with the given directive
   */
  async initiateGrowth(directive: GrowthDirective): Promise<GrowthResult> {
    const directiveId = `${directive.pattern}:${Date.now()}`;
    this.activeDirectives.set(directiveId, directive);
    this.emit('growth:started', directive);

    const startTime = Date.now();
    const errors: string[] = [];
    let newConnections = 0;

    try {
      switch (directive.pattern) {
        case 'organic':
          newConnections = await this.organicGrowth(directive);
          break;
        case 'directed':
          newConnections = await this.directedGrowth(directive);
          break;
        case 'defensive':
          newConnections = await this.defensiveGrowth(directive);
          break;
        case 'exploratory':
          newConnections = await this.exploratoryGrowth(directive);
          break;
        case 'consolidation':
          newConnections = await this.consolidationGrowth(directive);
          break;
      }
    } catch (error) {
      errors.push(String(error));
    }

    const result: GrowthResult = {
      directive,
      success: newConnections > 0 && errors.length === 0,
      newConnections,
      duration: Date.now() - startTime,
      errors,
    };

    this.growthHistory.push(result);
    this.activeDirectives.delete(directiveId);
    this.emit('growth:completed', directive);

    return result;
  }

  /**
   * Register a potential growth target
   */
  registerTarget(target: GrowthTarget): void {
    this.growthTargets.set(target.id, target);
  }

  /**
   * Get prioritized growth targets
   */
  getTargets(): GrowthTarget[] {
    return Array.from(this.growthTargets.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate the optimal growth pattern based on current state
   */
  recommendPattern(health: number, nodeCount: number): GrowthPattern {
    // Low health = defensive growth
    if (health < 40) {
      return 'defensive';
    }

    // Near target size = consolidation
    if (this.config.targetSize > 0 && nodeCount > this.config.targetSize * 0.9) {
      return 'consolidation';
    }

    // Small network = exploratory
    if (nodeCount < 10) {
      return 'exploratory';
    }

    // Good health with available targets = directed
    if (this.growthTargets.size > 0) {
      return 'directed';
    }

    // Default = organic
    return 'organic';
  }

  /**
   * Check if growth is currently allowed
   */
  canGrow(): boolean {
    const now = Date.now();
    return now - this.lastGrowthAttempt >= this.config.growthCooldown;
  }

  /**
   * Get growth statistics
   */
  getStats(): GrowthStats {
    const recentHistory = this.growthHistory.slice(-100);
    const successCount = recentHistory.filter(r => r.success).length;
    const totalConnections = recentHistory.reduce((sum, r) => sum + r.newConnections, 0);

    return {
      activeDirectives: this.activeDirectives.size,
      pendingTargets: this.growthTargets.size,
      recentGrowthAttempts: recentHistory.length,
      successRate: recentHistory.length > 0 ? successCount / recentHistory.length : 0,
      totalNewConnections: totalConnections,
    };
  }

  // Private growth implementations

  private async organicGrowth(directive: GrowthDirective): Promise<number> {
    // Organic growth: connect to randomly discovered peers
    const peers = await this.discoverPeers();
    let connections = 0;

    for (const peer of peers.slice(0, directive.maxConnections)) {
      if (await this.connectToPeer(peer.id)) {
        connections++;
      }
    }

    this.lastGrowthAttempt = Date.now();
    return connections;
  }

  private async directedGrowth(directive: GrowthDirective): Promise<number> {
    // Directed growth: connect to specific targets
    let connections = 0;

    for (const targetId of directive.targets.slice(0, directive.maxConnections)) {
      const target = this.growthTargets.get(targetId);
      if (target && target.type === 'node') {
        if (await this.connectToPeer(targetId as NodeId)) {
          connections++;
          this.growthTargets.delete(targetId);
        }
      }
    }

    this.lastGrowthAttempt = Date.now();
    return connections;
  }

  private async defensiveGrowth(directive: GrowthDirective): Promise<number> {
    // Defensive growth: increase redundancy
    const peers = await this.discoverPeers();
    let connections = 0;

    // Prioritize peers that provide alternate paths
    const diversePeers = peers.filter(p => this.providesNewPath(p.id));

    for (const peer of diversePeers.slice(0, directive.maxConnections)) {
      if (await this.connectToPeer(peer.id)) {
        connections++;
      }
    }

    this.lastGrowthAttempt = Date.now();
    return connections;
  }

  private async exploratoryGrowth(directive: GrowthDirective): Promise<number> {
    // Exploratory growth: probe new areas
    const peers = await this.discoverPeers();
    let connections = 0;

    // Prioritize peers in new regions or with new capabilities
    for (const peer of peers.slice(0, directive.maxConnections)) {
      if (await this.connectToPeer(peer.id)) {
        connections++;
        // Register as potential gateway if far away
        this.registerTarget({
          id: peer.id,
          type: 'gateway',
          priority: 0.5,
          cost: 1,
          benefit: 1,
          discoveredAt: Date.now(),
        });
      }
    }

    this.lastGrowthAttempt = Date.now();
    return connections;
  }

  private async consolidationGrowth(directive: GrowthDirective): Promise<number> {
    // Consolidation: strengthen existing connections, prune weak ones
    // This doesn't add new connections, but optimizes existing ones
    // Return 0 as no new connections are made
    this.lastGrowthAttempt = Date.now();
    return 0;
  }

  private providesNewPath(nodeId: NodeId): boolean {
    // Would check if this node provides a path to otherwise unreachable nodes
    // Simplified implementation
    return true;
  }
}

export interface GrowthStats {
  activeDirectives: number;
  pendingTargets: number;
  recentGrowthAttempts: number;
  successRate: number;
  totalNewConnections: number;
}

export { GrowthPattern, GrowthDirective };
