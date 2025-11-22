/**
 * Contributor Node Model for the Nutrient Exchange System
 *
 * ============================================================================
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational
 * and conceptual exploration purposes only. This does NOT represent a working
 * system or proven technology. All concepts described herein are speculative.
 * ============================================================================
 *
 * THEORETICAL CONCEPT:
 * This module could potentially model individual nodes that contribute
 * resources to the network, tracking their capabilities, reputation,
 * and economic interactions.
 *
 * INSPIRATIONS:
 * - BitTorrent Peers: Nodes that both upload and download content
 * - Tor Relays: Anonymous routing nodes with reputation
 * - IPFS Nodes: Content-addressed storage providers
 * - Ethereum Validators: Staked participants in network consensus
 *
 * @packageDocumentation
 * @module @chicago-forest/nutrient-exchange/models
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type { ResourceType, Resource, AvailabilityWindow } from '../types';

/**
 * A contributor node in the network.
 *
 * THEORETICAL: Nodes could maintain a comprehensive profile of their
 * capabilities, reputation, and economic state.
 */
export interface ContributorNode {
  /** Unique node identifier */
  readonly id: NodeId;

  /** Human-readable name */
  name: string;

  /** Node type/role */
  type: NodeType;

  /** Available resources */
  resources: NodeResources;

  /** Reputation information */
  reputation: NodeReputation;

  /** Economic state */
  economics: NodeEconomics;

  /** Connection information */
  connection: ConnectionInfo;

  /** Node capabilities */
  capabilities: NodeCapabilities;

  /** Node status */
  status: NodeStatus;

  /** Metadata */
  metadata: NodeMetadata;
}

/**
 * Types of nodes in the network.
 *
 * THEORETICAL: Different node types could have different roles
 * and contribution expectations.
 */
export type NodeType =
  | 'leaf'        // End-user node with minimal contribution
  | 'branch'      // Standard contributor node
  | 'trunk'       // High-capacity provider
  | 'root'        // Infrastructure/backbone node
  | 'sapling';    // New node building reputation

/**
 * Node status values.
 */
export type NodeStatus =
  | 'online'      // Currently connected and available
  | 'busy'        // Connected but at capacity
  | 'idle'        // Connected but underutilized
  | 'offline'     // Not connected
  | 'suspended'   // Temporarily suspended
  | 'banned';     // Permanently banned

/**
 * Resources available from a node.
 */
export interface NodeResources {
  /** Bandwidth capacity */
  bandwidth: ResourceCapacity;

  /** Storage capacity */
  storage: ResourceCapacity;

  /** Compute capacity */
  compute: ResourceCapacity;

  /** Connectivity capacity */
  connectivity: ResourceCapacity;

  /** Overall availability */
  availability: AvailabilityWindow;
}

/**
 * Capacity for a specific resource type.
 */
export interface ResourceCapacity {
  /** Total capacity */
  total: number;

  /** Currently allocated */
  allocated: number;

  /** Reserved (pending allocations) */
  reserved: number;

  /** Available for new allocations */
  available: number;

  /** Quality rating (0-1) */
  quality: number;

  /** Enabled for contribution */
  enabled: boolean;
}

/**
 * Node reputation information.
 *
 * THEORETICAL: Reputation could determine priority, rates, and
 * trustworthiness in exchanges.
 */
export interface NodeReputation {
  /** Overall reputation score (0-1) */
  score: number;

  /** Reputation tier */
  tier: ReputationTier;

  /** Number of successful exchanges */
  successfulExchanges: number;

  /** Number of failed exchanges */
  failedExchanges: number;

  /** Average quality delivered */
  averageQuality: number;

  /** Average response time (ms) */
  averageResponseTime: number;

  /** Uptime percentage */
  uptime: number;

  /** Trust score from other nodes */
  trustScore: number;

  /** Reports against this node */
  reports: ReputationReport[];

  /** Badges/achievements */
  badges: string[];

  /** First seen timestamp */
  firstSeen: number;
}

/**
 * Reputation tier levels.
 */
export type ReputationTier =
  | 'untrusted'   // New or problematic node
  | 'newcomer'    // Recently joined
  | 'contributor' // Regular contributor
  | 'trusted'     // Established, trusted node
  | 'guardian'    // Highly trusted, long-standing
  | 'elder';      // Founding/core contributor

/**
 * A report against a node.
 */
export interface ReputationReport {
  /** Reporter node */
  readonly reporter: NodeId;

  /** Report reason */
  readonly reason: string;

  /** Report category */
  readonly category: 'quality' | 'availability' | 'honesty' | 'spam' | 'abuse';

  /** Report timestamp */
  readonly timestamp: number;

  /** Evidence reference */
  readonly evidence?: string;

  /** Report status */
  status: 'pending' | 'verified' | 'rejected';
}

/**
 * Node economic state.
 */
export interface NodeEconomics {
  /** Credit balance */
  balance: number;

  /** Total credits earned */
  totalEarned: number;

  /** Total credits spent */
  totalSpent: number;

  /** Currently escrowed credits */
  escrowed: number;

  /** Staked credits */
  staked: number;

  /** Pending rewards */
  pendingRewards: number;

  /** Credit earning rate (per hour) */
  earningRate: number;

  /** Credit spending rate (per hour) */
  spendingRate: number;

  /** Economic efficiency score */
  efficiency: number;
}

/**
 * Node connection information.
 */
export interface ConnectionInfo {
  /** Connection endpoints */
  endpoints: Endpoint[];

  /** Geographic location */
  location?: GeoLocation;

  /** Current latency to network (ms) */
  latency: number;

  /** Connection type */
  connectionType: 'residential' | 'commercial' | 'datacenter' | 'mobile';

  /** NAT type */
  natType: 'none' | 'full-cone' | 'restricted' | 'symmetric';

  /** IPv4 address */
  ipv4?: string;

  /** IPv6 address */
  ipv6?: string;

  /** Last seen timestamp */
  lastSeen: number;
}

/**
 * Network endpoint.
 */
export interface Endpoint {
  /** Protocol */
  protocol: 'tcp' | 'udp' | 'quic' | 'websocket';

  /** Address */
  address: string;

  /** Port */
  port: number;

  /** Public or private */
  public: boolean;
}

/**
 * Geographic location.
 */
export interface GeoLocation {
  /** Country code */
  country: string;

  /** Region/state */
  region?: string;

  /** City */
  city?: string;

  /** Latitude */
  latitude?: number;

  /** Longitude */
  longitude?: number;

  /** Timezone */
  timezone?: string;
}

/**
 * Node capabilities.
 */
export interface NodeCapabilities {
  /** Supported protocols */
  protocols: string[];

  /** Can relay for other nodes */
  canRelay: boolean;

  /** Can serve as exit node */
  canExit: boolean;

  /** Can provide compute */
  canCompute: boolean;

  /** Can provide storage */
  canStore: boolean;

  /** Hardware specifications */
  hardware: HardwareSpec;

  /** Features supported */
  features: string[];
}

/**
 * Hardware specifications.
 */
export interface HardwareSpec {
  /** CPU cores */
  cpuCores: number;

  /** CPU frequency (GHz) */
  cpuFrequency: number;

  /** Total memory (bytes) */
  totalMemory: number;

  /** Available memory (bytes) */
  availableMemory: number;

  /** Total storage (bytes) */
  totalStorage: number;

  /** Available storage (bytes) */
  availableStorage: number;

  /** GPU available */
  hasGpu: boolean;

  /** GPU model */
  gpuModel?: string;
}

/**
 * Node metadata.
 */
export interface NodeMetadata {
  /** Software version */
  version: string;

  /** Platform */
  platform: string;

  /** Join timestamp */
  joinedAt: number;

  /** Last configuration update */
  lastConfigUpdate: number;

  /** Custom tags */
  tags: string[];

  /** Node operator */
  operator?: string;
}

/**
 * Events emitted by contributor nodes.
 */
export interface ContributorNodeEvents {
  'node:created': (node: ContributorNode) => void;
  'node:updated': (nodeId: NodeId, changes: Partial<ContributorNode>) => void;
  'node:status-changed': (nodeId: NodeId, oldStatus: NodeStatus, newStatus: NodeStatus) => void;
  'reputation:changed': (nodeId: NodeId, oldScore: number, newScore: number) => void;
  'reputation:tier-changed': (nodeId: NodeId, oldTier: ReputationTier, newTier: ReputationTier) => void;
  'balance:changed': (nodeId: NodeId, oldBalance: number, newBalance: number) => void;
  'resource:updated': (nodeId: NodeId, resourceType: ResourceType) => void;
  'report:filed': (nodeId: NodeId, report: ReputationReport) => void;
}

/**
 * Configuration for the contributor node manager.
 */
export interface ContributorNodeConfig {
  /** Initial reputation score for new nodes */
  initialReputation: number;

  /** Reputation decay rate (per day) */
  reputationDecay: number;

  /** Success weight for reputation */
  successWeight: number;

  /** Failure penalty for reputation */
  failurePenalty: number;

  /** Minimum reputation to participate */
  minReputationToParticipate: number;

  /** Reports required for suspension */
  reportsForSuspension: number;

  /** Initial credit grant for new nodes */
  initialCredits: number;

  /** Offline timeout (ms) */
  offlineTimeout: number;
}

/**
 * Default configuration values.
 */
export const DEFAULT_CONTRIBUTOR_CONFIG: ContributorNodeConfig = {
  initialReputation: 0.5,
  reputationDecay: 0.001,
  successWeight: 0.01,
  failurePenalty: 0.05,
  minReputationToParticipate: 0.2,
  reportsForSuspension: 3,
  initialCredits: 100,
  offlineTimeout: 5 * 60 * 1000, // 5 minutes
};

/**
 * ContributorNodeManager - THEORETICAL node management system.
 *
 * This class might potentially manage contributor nodes in the network,
 * tracking their resources, reputation, and economic interactions.
 *
 * DISCLAIMER: This is a conceptual implementation for educational purposes.
 * A real system would require distributed identity, cryptographic proofs,
 * and Byzantine fault tolerance.
 *
 * @example
 * ```typescript
 * // THEORETICAL usage example
 * const manager = new ContributorNodeManager();
 *
 * // Register a new contributor node
 * const node = await manager.registerNode({
 *   id: 'node-123',
 *   name: 'Chicago-Node-A',
 *   type: 'branch',
 *   resources: {
 *     bandwidth: { total: 100e6, quality: 0.95 },
 *     storage: { total: 500e9, quality: 0.99 },
 *   },
 * });
 *
 * // Record a successful exchange
 * await manager.recordExchange(node.id, {
 *   success: true,
 *   quality: 0.98,
 *   responseTime: 50,
 * });
 * ```
 */
export class ContributorNodeManager extends EventEmitter<ContributorNodeEvents> {
  private readonly config: ContributorNodeConfig;
  private readonly nodes: Map<NodeId, ContributorNode> = new Map();
  private readonly nodesByType: Map<NodeType, Set<NodeId>> = new Map();
  private readonly onlineNodes: Set<NodeId> = new Set();

  /**
   * Creates a new ContributorNodeManager instance.
   *
   * @param config - Configuration options
   */
  constructor(config: Partial<ContributorNodeConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONTRIBUTOR_CONFIG, ...config };

    // Initialize type maps
    const types: NodeType[] = ['leaf', 'branch', 'trunk', 'root', 'sapling'];
    for (const type of types) {
      this.nodesByType.set(type, new Set());
    }
  }

  /**
   * Registers a new contributor node.
   *
   * THEORETICAL: New nodes could join the network and start building
   * reputation through contributions.
   *
   * @param params - Node registration parameters
   * @returns The registered node
   */
  async registerNode(params: {
    id: NodeId;
    name: string;
    type?: NodeType;
    resources?: Partial<NodeResources>;
    connection?: Partial<ConnectionInfo>;
    capabilities?: Partial<NodeCapabilities>;
  }): Promise<ContributorNode> {
    const { id, name, type = 'sapling', resources = {}, connection = {}, capabilities = {} } = params;

    if (this.nodes.has(id)) {
      throw new Error('Node already registered');
    }

    const defaultResources: NodeResources = {
      bandwidth: { total: 0, allocated: 0, reserved: 0, available: 0, quality: 0.9, enabled: false },
      storage: { total: 0, allocated: 0, reserved: 0, available: 0, quality: 0.9, enabled: false },
      compute: { total: 0, allocated: 0, reserved: 0, available: 0, quality: 0.9, enabled: false },
      connectivity: { total: 0, allocated: 0, reserved: 0, available: 0, quality: 0.9, enabled: false },
      availability: { start: 0, end: 0 },
    };

    const node: ContributorNode = {
      id,
      name,
      type,
      resources: this.mergeResources(defaultResources, resources),
      reputation: {
        score: this.config.initialReputation,
        tier: this.calculateTier(this.config.initialReputation),
        successfulExchanges: 0,
        failedExchanges: 0,
        averageQuality: 0,
        averageResponseTime: 0,
        uptime: 1.0,
        trustScore: this.config.initialReputation,
        reports: [],
        badges: [],
        firstSeen: Date.now(),
      },
      economics: {
        balance: this.config.initialCredits,
        totalEarned: 0,
        totalSpent: 0,
        escrowed: 0,
        staked: 0,
        pendingRewards: 0,
        earningRate: 0,
        spendingRate: 0,
        efficiency: 1.0,
      },
      connection: {
        endpoints: [],
        latency: 0,
        connectionType: 'residential',
        natType: 'none',
        lastSeen: Date.now(),
        ...connection,
      },
      capabilities: {
        protocols: ['tcp', 'udp'],
        canRelay: false,
        canExit: false,
        canCompute: false,
        canStore: false,
        hardware: {
          cpuCores: 0,
          cpuFrequency: 0,
          totalMemory: 0,
          availableMemory: 0,
          totalStorage: 0,
          availableStorage: 0,
          hasGpu: false,
        },
        features: [],
        ...capabilities,
      },
      status: 'online',
      metadata: {
        version: '0.1.0',
        platform: 'unknown',
        joinedAt: Date.now(),
        lastConfigUpdate: Date.now(),
        tags: [],
      },
    };

    this.nodes.set(id, node);
    this.nodesByType.get(type)?.add(id);
    this.onlineNodes.add(id);

    this.emit('node:created', node);

    return node;
  }

  /**
   * Updates node resources.
   *
   * @param nodeId - Node to update
   * @param resources - Resource updates
   */
  async updateResources(nodeId: NodeId, resources: Partial<NodeResources>): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }

    node.resources = this.mergeResources(node.resources, resources);

    // Update available capacities
    for (const key of ['bandwidth', 'storage', 'compute', 'connectivity'] as const) {
      const res = node.resources[key];
      res.available = res.total - res.allocated - res.reserved;
    }

    this.emit('node:updated', nodeId, { resources: node.resources });
  }

  /**
   * Records the result of an exchange.
   *
   * THEORETICAL: Exchange results could affect node reputation
   * and economic metrics.
   *
   * @param nodeId - Node involved in exchange
   * @param result - Exchange result
   */
  async recordExchange(nodeId: NodeId, result: {
    success: boolean;
    quality: number;
    responseTime: number;
    creditsEarned?: number;
    creditsSpent?: number;
  }): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }

    const oldScore = node.reputation.score;
    const oldBalance = node.economics.balance;

    // Update exchange counts
    if (result.success) {
      node.reputation.successfulExchanges++;
      node.reputation.score = Math.min(1, node.reputation.score + this.config.successWeight);
    } else {
      node.reputation.failedExchanges++;
      node.reputation.score = Math.max(0, node.reputation.score - this.config.failurePenalty);
    }

    // Update averages
    const totalExchanges = node.reputation.successfulExchanges + node.reputation.failedExchanges;
    node.reputation.averageQuality =
      (node.reputation.averageQuality * (totalExchanges - 1) + result.quality) / totalExchanges;
    node.reputation.averageResponseTime =
      (node.reputation.averageResponseTime * (totalExchanges - 1) + result.responseTime) / totalExchanges;

    // Update economics
    if (result.creditsEarned) {
      node.economics.balance += result.creditsEarned;
      node.economics.totalEarned += result.creditsEarned;
    }
    if (result.creditsSpent) {
      node.economics.balance -= result.creditsSpent;
      node.economics.totalSpent += result.creditsSpent;
    }

    // Check tier change
    const newTier = this.calculateTier(node.reputation.score);
    if (newTier !== node.reputation.tier) {
      const oldTier = node.reputation.tier;
      node.reputation.tier = newTier;
      this.emit('reputation:tier-changed', nodeId, oldTier, newTier);
    }

    // Check type promotion
    await this.checkTypePromotion(node);

    if (node.reputation.score !== oldScore) {
      this.emit('reputation:changed', nodeId, oldScore, node.reputation.score);
    }

    if (node.economics.balance !== oldBalance) {
      this.emit('balance:changed', nodeId, oldBalance, node.economics.balance);
    }
  }

  /**
   * Files a report against a node.
   *
   * @param nodeId - Node being reported
   * @param report - Report details
   */
  async fileReport(nodeId: NodeId, report: Omit<ReputationReport, 'timestamp' | 'status'>): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }

    const fullReport: ReputationReport = {
      ...report,
      timestamp: Date.now(),
      status: 'pending',
    };

    node.reputation.reports.push(fullReport);
    this.emit('report:filed', nodeId, fullReport);

    // Check for automatic suspension
    const pendingReports = node.reputation.reports.filter(r => r.status === 'pending');
    if (pendingReports.length >= this.config.reportsForSuspension) {
      await this.setNodeStatus(nodeId, 'suspended');
    }
  }

  /**
   * Sets node status.
   *
   * @param nodeId - Node to update
   * @param status - New status
   */
  async setNodeStatus(nodeId: NodeId, status: NodeStatus): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }

    const oldStatus = node.status;
    node.status = status;

    if (status === 'online') {
      this.onlineNodes.add(nodeId);
      node.connection.lastSeen = Date.now();
    } else {
      this.onlineNodes.delete(nodeId);
    }

    this.emit('node:status-changed', nodeId, oldStatus, status);
  }

  /**
   * Updates node connection info.
   *
   * @param nodeId - Node to update
   * @param connection - Connection updates
   */
  async updateConnection(nodeId: NodeId, connection: Partial<ConnectionInfo>): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }

    node.connection = { ...node.connection, ...connection, lastSeen: Date.now() };
    this.emit('node:updated', nodeId, { connection: node.connection });
  }

  /**
   * Gets a node by ID.
   *
   * @param nodeId - Node ID
   * @returns Node or null
   */
  getNode(nodeId: NodeId): ContributorNode | null {
    return this.nodes.get(nodeId) ?? null;
  }

  /**
   * Gets all nodes of a specific type.
   *
   * @param type - Node type
   * @returns Nodes of the specified type
   */
  getNodesByType(type: NodeType): ContributorNode[] {
    const ids = this.nodesByType.get(type);
    if (!ids) return [];

    return Array.from(ids)
      .map(id => this.nodes.get(id))
      .filter((n): n is ContributorNode => n !== undefined);
  }

  /**
   * Gets online nodes with available resources.
   *
   * @param resourceType - Type of resource needed
   * @param minAmount - Minimum amount required
   * @param minQuality - Minimum quality required
   * @returns Matching nodes
   */
  getAvailableNodes(
    resourceType: ResourceType,
    minAmount: number,
    minQuality: number
  ): ContributorNode[] {
    return Array.from(this.onlineNodes)
      .map(id => this.nodes.get(id))
      .filter((node): node is ContributorNode => {
        if (!node) return false;
        if (node.reputation.score < this.config.minReputationToParticipate) return false;

        const resource = node.resources[resourceType];
        return resource.enabled &&
               resource.available >= minAmount &&
               resource.quality >= minQuality;
      })
      .sort((a, b) => {
        // Sort by reputation, then by available capacity
        const repDiff = b.reputation.score - a.reputation.score;
        if (Math.abs(repDiff) > 0.1) return repDiff;
        return b.resources[resourceType].available - a.resources[resourceType].available;
      });
  }

  /**
   * Gets network statistics.
   *
   * @returns Network statistics
   */
  getNetworkStats(): NetworkStats {
    const stats: NetworkStats = {
      totalNodes: this.nodes.size,
      onlineNodes: this.onlineNodes.size,
      nodesByType: {},
      nodesByTier: {},
      totalCapacity: {
        bandwidth: 0,
        storage: 0,
        compute: 0,
        connectivity: 0,
      },
      availableCapacity: {
        bandwidth: 0,
        storage: 0,
        compute: 0,
        connectivity: 0,
      },
      totalCreditsInCirculation: 0,
      averageReputation: 0,
    };

    for (const [type, ids] of this.nodesByType) {
      stats.nodesByType[type] = ids.size;
    }

    let reputationSum = 0;
    for (const node of this.nodes.values()) {
      reputationSum += node.reputation.score;
      stats.totalCreditsInCirculation += node.economics.balance;

      // Count by tier
      stats.nodesByTier[node.reputation.tier] = (stats.nodesByTier[node.reputation.tier] ?? 0) + 1;

      // Sum capacities for online nodes
      if (this.onlineNodes.has(node.id)) {
        for (const key of ['bandwidth', 'storage', 'compute', 'connectivity'] as const) {
          stats.totalCapacity[key] += node.resources[key].total;
          stats.availableCapacity[key] += node.resources[key].available;
        }
      }
    }

    stats.averageReputation = this.nodes.size > 0 ? reputationSum / this.nodes.size : 0;

    return stats;
  }

  /**
   * Applies daily reputation decay.
   *
   * THEORETICAL: Reputation could decay over time to encourage
   * continued active participation.
   */
  applyReputationDecay(): void {
    for (const node of this.nodes.values()) {
      const oldScore = node.reputation.score;
      node.reputation.score = Math.max(
        this.config.minReputationToParticipate,
        node.reputation.score * (1 - this.config.reputationDecay)
      );

      if (node.reputation.score !== oldScore) {
        const newTier = this.calculateTier(node.reputation.score);
        if (newTier !== node.reputation.tier) {
          const oldTier = node.reputation.tier;
          node.reputation.tier = newTier;
          this.emit('reputation:tier-changed', node.id, oldTier, newTier);
        }
        this.emit('reputation:changed', node.id, oldScore, node.reputation.score);
      }
    }
  }

  // Private helper methods

  private calculateTier(score: number): ReputationTier {
    if (score >= 0.95) return 'elder';
    if (score >= 0.85) return 'guardian';
    if (score >= 0.7) return 'trusted';
    if (score >= 0.5) return 'contributor';
    if (score >= 0.3) return 'newcomer';
    return 'untrusted';
  }

  private async checkTypePromotion(node: ContributorNode): Promise<void> {
    // THEORETICAL: Promote node type based on contribution history
    let newType = node.type;

    const totalContributed = node.economics.totalEarned;
    const reputation = node.reputation.score;

    if (node.type === 'sapling' && reputation >= 0.5 && totalContributed > 1000) {
      newType = 'leaf';
    } else if (node.type === 'leaf' && reputation >= 0.6 && totalContributed > 10000) {
      newType = 'branch';
    } else if (node.type === 'branch' && reputation >= 0.8 && totalContributed > 100000) {
      newType = 'trunk';
    } else if (node.type === 'trunk' && reputation >= 0.95 && totalContributed > 1000000) {
      newType = 'root';
    }

    if (newType !== node.type) {
      this.nodesByType.get(node.type)?.delete(node.id);
      node.type = newType;
      this.nodesByType.get(newType)?.add(node.id);
      this.emit('node:updated', node.id, { type: newType });
    }
  }

  private mergeResources(
    existing: NodeResources,
    updates: Partial<NodeResources>
  ): NodeResources {
    const result = { ...existing };

    for (const key of ['bandwidth', 'storage', 'compute', 'connectivity'] as const) {
      if (updates[key]) {
        result[key] = { ...existing[key], ...updates[key] };
        result[key].available = result[key].total - result[key].allocated - result[key].reserved;
      }
    }

    if (updates.availability) {
      result.availability = { ...existing.availability, ...updates.availability };
    }

    return result;
  }
}

/**
 * Network-wide statistics.
 */
export interface NetworkStats {
  totalNodes: number;
  onlineNodes: number;
  nodesByType: Partial<Record<NodeType, number>>;
  nodesByTier: Partial<Record<ReputationTier, number>>;
  totalCapacity: Record<ResourceType, number>;
  availableCapacity: Record<ResourceType, number>;
  totalCreditsInCirculation: number;
  averageReputation: number;
}
