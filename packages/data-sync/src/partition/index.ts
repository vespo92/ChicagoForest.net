/**
 * Network Partition Detection and Healing
 *
 * Detects network partitions (splits) and orchestrates healing
 * when connectivity is restored.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for the Chicago Plasma Forest Network project.
 */

import { EventEmitter } from 'eventemitter3';

/**
 * Peer health status
 */
export type PeerHealth = 'healthy' | 'suspect' | 'unreachable' | 'unknown';

/**
 * Partition state
 */
export type PartitionState =
  | 'connected'      // Full connectivity
  | 'partial'        // Some nodes unreachable
  | 'split'          // Network is partitioned
  | 'healing'        // Partition being healed
  | 'unknown';       // State unknown

/**
 * Peer information for partition detection
 */
export interface PeerStatus {
  nodeId: string;
  health: PeerHealth;
  lastSeen: Date;
  consecutiveFailures: number;
  roundTripTime: number | null;
  reachableFrom: Set<string>;
  partitionGroup: number;
}

/**
 * Partition group - nodes that can communicate with each other
 */
export interface PartitionGroup {
  id: number;
  nodes: Set<string>;
  leaderNode: string;
  createdAt: Date;
  lastActivity: Date;
}

/**
 * Partition event
 */
export interface PartitionEvent {
  type: 'detected' | 'healed' | 'peer_lost' | 'peer_recovered';
  timestamp: Date;
  affectedNodes: string[];
  partitionGroups: PartitionGroup[];
  description: string;
}

/**
 * Heartbeat message
 */
export interface Heartbeat {
  sourceNode: string;
  timestamp: number;
  sequence: number;
  knownPeers: string[];
  vectorClock: Record<string, number>;
}

/**
 * Partition detection events
 */
export interface PartitionEvents {
  'partition:detected': (event: PartitionEvent) => void;
  'partition:healed': (event: PartitionEvent) => void;
  'peer:lost': (nodeId: string) => void;
  'peer:recovered': (nodeId: string) => void;
  'peer:suspect': (nodeId: string) => void;
  'health:changed': (nodeId: string, oldHealth: PeerHealth, newHealth: PeerHealth) => void;
}

/**
 * Configuration for partition detection
 */
export interface PartitionConfig {
  nodeId: string;
  heartbeatIntervalMs: number;     // How often to send heartbeats
  suspectThresholdMs: number;      // Time before marking peer suspect
  unreachableThresholdMs: number;  // Time before marking peer unreachable
  failureThreshold: number;        // Consecutive failures before unreachable
  healingDelayMs: number;          // Delay before starting healing
  quorumPercentage: number;        // Minimum % of nodes for quorum
}

const DEFAULT_CONFIG: PartitionConfig = {
  nodeId: '',
  heartbeatIntervalMs: 1000,
  suspectThresholdMs: 3000,
  unreachableThresholdMs: 10000,
  failureThreshold: 5,
  healingDelayMs: 5000,
  quorumPercentage: 51,
};

/**
 * Partition Detector - detects and manages network partitions
 */
export class PartitionDetector extends EventEmitter<PartitionEvents> {
  private config: PartitionConfig;
  private peers: Map<string, PeerStatus>;
  private partitionGroups: Map<number, PartitionGroup>;
  private currentState: PartitionState;
  private heartbeatSequence: number;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private checkTimer?: ReturnType<typeof setInterval>;
  private eventHistory: PartitionEvent[];

  constructor(config: Partial<PartitionConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.peers = new Map();
    this.partitionGroups = new Map();
    this.currentState = 'unknown';
    this.heartbeatSequence = 0;
    this.eventHistory = [];
  }

  /**
   * Start partition detection
   */
  start(knownPeers: string[]): void {
    // Initialize peer statuses
    for (const peerId of knownPeers) {
      this.peers.set(peerId, {
        nodeId: peerId,
        health: 'unknown',
        lastSeen: new Date(0),
        consecutiveFailures: 0,
        roundTripTime: null,
        reachableFrom: new Set(),
        partitionGroup: 0,
      });
    }

    // Start heartbeat
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeats();
    }, this.config.heartbeatIntervalMs);

    // Start health check
    this.checkTimer = setInterval(() => {
      this.checkPeerHealth();
      this.detectPartitions();
    }, this.config.heartbeatIntervalMs);

    this.currentState = 'connected';
  }

  /**
   * Stop partition detection
   */
  stop(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = undefined;
    }
  }

  /**
   * Generate heartbeat message
   */
  generateHeartbeat(): Heartbeat {
    this.heartbeatSequence++;
    return {
      sourceNode: this.config.nodeId,
      timestamp: Date.now(),
      sequence: this.heartbeatSequence,
      knownPeers: Array.from(this.peers.keys()),
      vectorClock: {},
    };
  }

  /**
   * Handle incoming heartbeat
   */
  handleHeartbeat(heartbeat: Heartbeat): void {
    const peer = this.peers.get(heartbeat.sourceNode);
    if (!peer) {
      // New peer discovered
      this.peers.set(heartbeat.sourceNode, {
        nodeId: heartbeat.sourceNode,
        health: 'healthy',
        lastSeen: new Date(),
        consecutiveFailures: 0,
        roundTripTime: Date.now() - heartbeat.timestamp,
        reachableFrom: new Set([this.config.nodeId]),
        partitionGroup: 0,
      });
      return;
    }

    const oldHealth = peer.health;
    peer.lastSeen = new Date();
    peer.consecutiveFailures = 0;
    peer.roundTripTime = Date.now() - heartbeat.timestamp;
    peer.health = 'healthy';

    // Update reachability information
    peer.reachableFrom.add(this.config.nodeId);
    for (const knownPeer of heartbeat.knownPeers) {
      peer.reachableFrom.add(knownPeer);
    }

    if (oldHealth !== 'healthy') {
      this.emit('health:changed', peer.nodeId, oldHealth, 'healthy');
      if (oldHealth === 'unreachable') {
        this.emit('peer:recovered', peer.nodeId);
        this.recordEvent({
          type: 'peer_recovered',
          timestamp: new Date(),
          affectedNodes: [peer.nodeId],
          partitionGroups: Array.from(this.partitionGroups.values()),
          description: `Peer ${peer.nodeId} recovered`,
        });
      }
    }
  }

  /**
   * Record heartbeat failure for a peer
   */
  recordHeartbeatFailure(nodeId: string): void {
    const peer = this.peers.get(nodeId);
    if (!peer) return;

    peer.consecutiveFailures++;

    if (peer.consecutiveFailures >= this.config.failureThreshold) {
      if (peer.health !== 'unreachable') {
        const oldHealth = peer.health;
        peer.health = 'unreachable';
        this.emit('health:changed', nodeId, oldHealth, 'unreachable');
        this.emit('peer:lost', nodeId);
        this.recordEvent({
          type: 'peer_lost',
          timestamp: new Date(),
          affectedNodes: [nodeId],
          partitionGroups: Array.from(this.partitionGroups.values()),
          description: `Peer ${nodeId} became unreachable`,
        });
      }
    } else if (peer.consecutiveFailures >= 2) {
      if (peer.health !== 'suspect' && peer.health !== 'unreachable') {
        const oldHealth = peer.health;
        peer.health = 'suspect';
        this.emit('health:changed', nodeId, oldHealth, 'suspect');
        this.emit('peer:suspect', nodeId);
      }
    }
  }

  /**
   * Send heartbeats (placeholder - actual network send handled externally)
   */
  private sendHeartbeats(): void {
    // This method generates heartbeats - actual sending is done by the network layer
    // Consumer should call generateHeartbeat() and send to each peer
  }

  /**
   * Check peer health based on timeouts
   */
  private checkPeerHealth(): void {
    const now = Date.now();

    for (const [nodeId, peer] of this.peers) {
      const timeSinceLastSeen = now - peer.lastSeen.getTime();

      if (peer.health === 'healthy') {
        if (timeSinceLastSeen > this.config.unreachableThresholdMs) {
          peer.health = 'unreachable';
          this.emit('health:changed', nodeId, 'healthy', 'unreachable');
          this.emit('peer:lost', nodeId);
        } else if (timeSinceLastSeen > this.config.suspectThresholdMs) {
          peer.health = 'suspect';
          this.emit('health:changed', nodeId, 'healthy', 'suspect');
          this.emit('peer:suspect', nodeId);
        }
      } else if (peer.health === 'suspect') {
        if (timeSinceLastSeen > this.config.unreachableThresholdMs) {
          peer.health = 'unreachable';
          this.emit('health:changed', nodeId, 'suspect', 'unreachable');
          this.emit('peer:lost', nodeId);
        }
      }
    }
  }

  /**
   * Detect network partitions using reachability graph
   */
  private detectPartitions(): void {
    const healthyPeers = Array.from(this.peers.values())
      .filter(p => p.health === 'healthy');

    if (healthyPeers.length === 0) {
      if (this.peers.size > 0 && this.currentState !== 'split') {
        this.currentState = 'split';
        this.recordEvent({
          type: 'detected',
          timestamp: new Date(),
          affectedNodes: Array.from(this.peers.keys()),
          partitionGroups: [],
          description: 'All peers unreachable - possible network isolation',
        });
      }
      return;
    }

    // Build reachability groups using Union-Find
    const groups = this.findPartitionGroups();

    if (groups.length > 1) {
      // Network is partitioned
      if (this.currentState !== 'split') {
        this.currentState = 'split';
        this.partitionGroups.clear();
        for (const group of groups) {
          this.partitionGroups.set(group.id, group);
        }
        this.recordEvent({
          type: 'detected',
          timestamp: new Date(),
          affectedNodes: Array.from(this.peers.keys()),
          partitionGroups: groups,
          description: `Network split into ${groups.length} partitions`,
        });
        this.emit('partition:detected', this.eventHistory[this.eventHistory.length - 1]);
      }
    } else if (groups.length === 1 && this.currentState === 'split') {
      // Partition healed
      this.currentState = 'healing';
      setTimeout(() => {
        if (this.currentState === 'healing') {
          this.currentState = 'connected';
          const event: PartitionEvent = {
            type: 'healed',
            timestamp: new Date(),
            affectedNodes: Array.from(groups[0].nodes),
            partitionGroups: groups,
            description: 'Network partition healed',
          };
          this.recordEvent(event);
          this.emit('partition:healed', event);
          this.partitionGroups.clear();
        }
      }, this.config.healingDelayMs);
    } else if (groups.length === 1) {
      this.currentState = 'connected';
    }
  }

  /**
   * Find partition groups using reachability
   */
  private findPartitionGroups(): PartitionGroup[] {
    const healthyPeers = Array.from(this.peers.values())
      .filter(p => p.health === 'healthy' || p.health === 'suspect');

    if (healthyPeers.length === 0) {
      return [];
    }

    // Simple Union-Find implementation
    const parent = new Map<string, string>();
    const rank = new Map<string, number>();

    const find = (x: string): string => {
      if (!parent.has(x)) {
        parent.set(x, x);
        rank.set(x, 0);
      }
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x)!));
      }
      return parent.get(x)!;
    };

    const union = (x: string, y: string): void => {
      const px = find(x);
      const py = find(y);
      if (px === py) return;

      const rx = rank.get(px) || 0;
      const ry = rank.get(py) || 0;

      if (rx < ry) {
        parent.set(px, py);
      } else if (rx > ry) {
        parent.set(py, px);
      } else {
        parent.set(py, px);
        rank.set(px, rx + 1);
      }
    };

    // Initialize with self
    find(this.config.nodeId);

    // Union nodes that can reach each other
    for (const peer of healthyPeers) {
      find(peer.nodeId);
      // If we can reach this peer, they're in our group
      if (peer.health === 'healthy') {
        union(this.config.nodeId, peer.nodeId);
      }
      // Union peers that can reach each other
      for (const reachableFrom of peer.reachableFrom) {
        if (this.peers.get(reachableFrom)?.health === 'healthy') {
          union(peer.nodeId, reachableFrom);
        }
      }
    }

    // Group nodes by their root
    const groupMap = new Map<string, Set<string>>();
    for (const nodeId of [this.config.nodeId, ...healthyPeers.map(p => p.nodeId)]) {
      const root = find(nodeId);
      if (!groupMap.has(root)) {
        groupMap.set(root, new Set());
      }
      groupMap.get(root)!.add(nodeId);
    }

    // Create partition groups
    const groups: PartitionGroup[] = [];
    let groupId = 0;
    for (const [leader, nodes] of groupMap) {
      groups.push({
        id: groupId++,
        nodes,
        leaderNode: leader,
        createdAt: new Date(),
        lastActivity: new Date(),
      });
    }

    return groups;
  }

  /**
   * Record a partition event
   */
  private recordEvent(event: PartitionEvent): void {
    this.eventHistory.push(event);
    // Keep only last 100 events
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(-100);
    }
  }

  /**
   * Get current partition state
   */
  getState(): PartitionState {
    return this.currentState;
  }

  /**
   * Get peer status
   */
  getPeerStatus(nodeId: string): PeerStatus | undefined {
    return this.peers.get(nodeId);
  }

  /**
   * Get all peers
   */
  getAllPeers(): PeerStatus[] {
    return Array.from(this.peers.values());
  }

  /**
   * Get healthy peers
   */
  getHealthyPeers(): PeerStatus[] {
    return Array.from(this.peers.values())
      .filter(p => p.health === 'healthy');
  }

  /**
   * Get current partition groups
   */
  getPartitionGroups(): PartitionGroup[] {
    return Array.from(this.partitionGroups.values());
  }

  /**
   * Get event history
   */
  getEventHistory(): PartitionEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Check if we have quorum
   */
  hasQuorum(): boolean {
    const totalPeers = this.peers.size + 1; // Include self
    const healthyPeers = this.getHealthyPeers().length + 1; // Include self
    const quorumNeeded = Math.ceil(totalPeers * this.config.quorumPercentage / 100);
    return healthyPeers >= quorumNeeded;
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalPeers: number;
    healthyPeers: number;
    suspectPeers: number;
    unreachablePeers: number;
    partitionCount: number;
    hasQuorum: boolean;
    state: PartitionState;
  } {
    const peers = Array.from(this.peers.values());
    return {
      totalPeers: peers.length,
      healthyPeers: peers.filter(p => p.health === 'healthy').length,
      suspectPeers: peers.filter(p => p.health === 'suspect').length,
      unreachablePeers: peers.filter(p => p.health === 'unreachable').length,
      partitionCount: this.partitionGroups.size,
      hasQuorum: this.hasQuorum(),
      state: this.currentState,
    };
  }
}

/**
 * Partition Healer - orchestrates recovery after partition healing
 */
export class PartitionHealer {
  private nodeId: string;
  private onHealingStart?: () => void;
  private onHealingComplete?: () => void;

  constructor(
    nodeId: string,
    options?: {
      onHealingStart?: () => void;
      onHealingComplete?: () => void;
    }
  ) {
    this.nodeId = nodeId;
    this.onHealingStart = options?.onHealingStart;
    this.onHealingComplete = options?.onHealingComplete;
  }

  /**
   * Start healing process after partition detection
   */
  async startHealing(
    partitionGroups: PartitionGroup[],
    syncFunction: (peerNodes: string[]) => Promise<void>
  ): Promise<void> {
    this.onHealingStart?.();

    // Find all nodes that need syncing
    const allNodes = new Set<string>();
    for (const group of partitionGroups) {
      for (const node of group.nodes) {
        if (node !== this.nodeId) {
          allNodes.add(node);
        }
      }
    }

    // Sync with all recovered nodes
    await syncFunction(Array.from(allNodes));

    this.onHealingComplete?.();
  }

  /**
   * Generate healing priority - nodes to sync first
   */
  getHealingPriority(partitionGroups: PartitionGroup[]): string[] {
    // Prioritize leaders from other groups first
    const leaders: string[] = [];
    const others: string[] = [];

    for (const group of partitionGroups) {
      if (group.leaderNode !== this.nodeId) {
        leaders.push(group.leaderNode);
      }
      for (const node of group.nodes) {
        if (node !== this.nodeId && node !== group.leaderNode) {
          others.push(node);
        }
      }
    }

    return [...leaders, ...others];
  }
}

export default PartitionDetector;
