/**
 * Rhizome Network Propagation System
 *
 * DISCLAIMER: This is a THEORETICAL framework inspired by biological systems.
 * This code represents a conceptual design for decentralized network propagation
 * and is NOT a working energy distribution system.
 *
 * AI-GENERATED CONTENT: Created as part of the Chicago Plasma Forest Network
 * theoretical framework - an educational project exploring decentralized networks.
 *
 * BIOLOGICAL INSPIRATION:
 * The rhizome is a type of underground plant stem (like ginger, bamboo, or iris)
 * that spreads horizontally, sending out roots and shoots from its nodes. This
 * creates a resilient, interconnected network that:
 *
 * - Has no central root - any node can be the starting point
 * - Spreads in all directions simultaneously
 * - Creates redundant connections for resilience
 * - Shares resources across the network
 * - Can regenerate from any surviving node
 *
 * Philosophical Reference:
 * - Deleuze & Guattari, "A Thousand Plateaus", 1980
 *   "Unlike trees or their roots, the rhizome connects any point to any other point"
 *
 * Biological References:
 * - Bell, "Plant Form: An Illustrated Guide to Flowering Plant Morphology"
 *   Cambridge University Press, 2008
 *   ISBN: 978-0521749688
 */

import { EventEmitter } from 'events';
import {
  RhizomeGossipProtocol,
  GossipMessageType,
  DisseminationStrategy,
  createGossipProtocol,
  createReliableGossip
} from './gossip-protocol';
import {
  RhizomeStateSync,
  SyncStateType,
  ConflictResolution,
  createStateSync
} from './state-sync';
import {
  RhizomeLateralGrowth,
  GrowthDirection,
  SegmentType,
  createLateralGrowth
} from './lateral-growth';

// Re-export all sub-modules
export * from './gossip-protocol';
export * from './state-sync';
export * from './lateral-growth';

// ============================================================================
// THEORETICAL FRAMEWORK - NOT OPERATIONAL
// ============================================================================

/**
 * Rhizome Network Phases
 *
 * THEORETICAL: Lifecycle phases of a rhizome network
 */
export enum RhizomePhase {
  /** Initial setup and configuration */
  INITIALIZING = 'INITIALIZING',

  /** Establishing first connections */
  SPROUTING = 'SPROUTING',

  /** Active growth and expansion */
  GROWING = 'GROWING',

  /** Stable network with maintenance */
  MATURE = 'MATURE',

  /** Network consolidation and optimization */
  CONSOLIDATING = 'CONSOLIDATING',

  /** Dormant state (low activity) */
  DORMANT = 'DORMANT',

  /** Error or compromised state */
  COMPROMISED = 'COMPROMISED'
}

/**
 * Propagation Event Types
 *
 * THEORETICAL: Events that occur during network propagation
 */
export enum PropagationEvent {
  /** New node joined the network */
  NODE_JOINED = 'NODE_JOINED',

  /** Node left the network */
  NODE_LEFT = 'NODE_LEFT',

  /** Connection established between nodes */
  CONNECTION_ESTABLISHED = 'CONNECTION_ESTABLISHED',

  /** Connection lost between nodes */
  CONNECTION_LOST = 'CONNECTION_LOST',

  /** State synchronized across nodes */
  STATE_SYNCHRONIZED = 'STATE_SYNCHRONIZED',

  /** Growth wave propagated */
  GROWTH_WAVE = 'GROWTH_WAVE',

  /** Network partition detected */
  PARTITION_DETECTED = 'PARTITION_DETECTED',

  /** Network partition healed */
  PARTITION_HEALED = 'PARTITION_HEALED',

  /** Resource distribution changed */
  RESOURCE_CHANGED = 'RESOURCE_CHANGED'
}

/**
 * Rhizome Node Identity
 *
 * THEORETICAL: Identity information for a rhizome node
 */
export interface RhizomeIdentity {
  /** Unique node identifier */
  nodeId: string;

  /** Human-readable name */
  name: string;

  /** Public key for authentication */
  publicKey: string;

  /** Geographic location */
  location: {
    latitude: number;
    longitude: number;
    region?: string;
  };

  /** Node capabilities */
  capabilities: string[];

  /** Creation timestamp */
  createdAt: number;

  /** Last seen timestamp */
  lastSeen: number;
}

/**
 * Network Topology View
 *
 * THEORETICAL: Current view of the network topology
 */
export interface TopologyView {
  /** Known nodes in the network */
  nodes: Map<string, RhizomeIdentity>;

  /** Known connections */
  connections: Map<string, {
    sourceId: string;
    targetId: string;
    strength: number;
    latency: number;
  }>;

  /** Network diameter (max hops between any two nodes) */
  diameter: number;

  /** Average node degree (connections per node) */
  averageDegree: number;

  /** Clustering coefficient */
  clusteringCoefficient: number;

  /** View timestamp */
  timestamp: number;
}

/**
 * Propagation Statistics
 *
 * THEORETICAL: Metrics for network propagation
 */
export interface PropagationStats {
  /** Current phase */
  phase: RhizomePhase;

  /** Total nodes in network */
  totalNodes: number;

  /** Active nodes */
  activeNodes: number;

  /** Total connections */
  totalConnections: number;

  /** Messages propagated */
  messagesPropagated: number;

  /** State sync operations */
  stateSyncOps: number;

  /** Growth waves launched */
  growthWavesLaunched: number;

  /** Network uptime (ms) */
  uptime: number;

  /** Coverage area (km^2, theoretical) */
  coverageArea: number;
}

/**
 * Rhizome Propagation Configuration
 *
 * THEORETICAL: Configuration for the rhizome network
 */
export interface RhizomePropagationConfig {
  /** Node's own ID */
  nodeId: string;

  /** Node's geographic location */
  location: {
    latitude: number;
    longitude: number;
  };

  /** Bootstrap peers to connect to */
  bootstrapPeers: string[];

  /** Enable automatic growth */
  autoGrowth: boolean;

  /** Enable state synchronization */
  enableStateSync: boolean;

  /** Enable gossip protocol */
  enableGossip: boolean;

  /** Target network size (nodes) */
  targetNetworkSize: number;

  /** Maximum connections per node */
  maxConnections: number;

  /** Health check interval (ms) */
  healthCheckInterval: number;
}

const DEFAULT_CONFIG: RhizomePropagationConfig = {
  nodeId: '',
  location: { latitude: 0, longitude: 0 },
  bootstrapPeers: [],
  autoGrowth: true,
  enableStateSync: true,
  enableGossip: true,
  targetNetworkSize: 100,
  maxConnections: 20,
  healthCheckInterval: 30000
};

/**
 * Rhizome Network Propagation Coordinator
 *
 * THEORETICAL FRAMEWORK: The main coordinator that orchestrates all aspects
 * of rhizome network propagation, including:
 *
 * - Gossip-based message propagation (epidemic spreading)
 * - Distributed state synchronization (CRDTs, eventual consistency)
 * - Lateral network growth (bio-inspired expansion)
 * - Network topology management
 * - Health monitoring and self-healing
 *
 * Inspired by how plant rhizomes create resilient, decentralized networks
 * without a central root, where any node can regenerate the whole network.
 */
export class RhizomePropagationCoordinator extends EventEmitter {
  private config: RhizomePropagationConfig;
  private phase: RhizomePhase = RhizomePhase.INITIALIZING;

  // Sub-systems
  private gossip: RhizomeGossipProtocol;
  private stateSync: RhizomeStateSync;
  private lateralGrowth: RhizomeLateralGrowth;

  // Network state
  private identity: RhizomeIdentity;
  private knownNodes: Map<string, RhizomeIdentity> = new Map();
  private connections: Map<string, {
    peerId: string;
    established: number;
    strength: number;
    lastActivity: number;
  }> = new Map();

  // Statistics
  private startTime: number = 0;
  private messagesPropagated: number = 0;
  private stateSyncOps: number = 0;

  // Health check timer
  private healthTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<RhizomePropagationConfig> & { nodeId: string }) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize identity
    this.identity = {
      nodeId: this.config.nodeId,
      name: `rhizome-node-${this.config.nodeId.slice(0, 8)}`,
      publicKey: this.generateMockPublicKey(),
      location: this.config.location,
      capabilities: ['gossip', 'state-sync', 'growth'],
      createdAt: Date.now(),
      lastSeen: Date.now()
    };

    // Initialize sub-systems
    this.gossip = createReliableGossip(this.config.nodeId);
    this.stateSync = createStateSync(this.config.nodeId);
    this.lateralGrowth = createLateralGrowth(this.config.nodeId);

    // Connect state sync to gossip
    if (this.config.enableStateSync && this.config.enableGossip) {
      this.stateSync.connectGossip(this.gossip);
    }

    // Wire up event handlers
    this.setupEventHandlers();
  }

  /**
   * Start the rhizome network propagation
   *
   * THEORETICAL: Initialize and begin network operations
   */
  async start(): Promise<boolean> {
    console.log(`[THEORETICAL] Starting Rhizome Propagation for node ${this.config.nodeId}`);

    this.startTime = Date.now();
    this.phase = RhizomePhase.SPROUTING;

    // Register ourselves
    this.knownNodes.set(this.identity.nodeId, this.identity);

    // Store identity in state sync
    this.stateSync.set(`node:${this.identity.nodeId}`, this.identity, {
      type: SyncStateType.MEMBERSHIP
    });

    // Initialize lateral growth with our location
    this.lateralGrowth.initializeRoot(this.config.location);

    // Start gossip protocol
    if (this.config.enableGossip) {
      this.gossip.start();
    }

    // Connect to bootstrap peers
    await this.connectToBootstrapPeers();

    // Start lateral growth
    if (this.config.autoGrowth) {
      this.lateralGrowth.startGrowth();
    }

    // Start health checks
    this.healthTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);

    // Transition to growing phase
    this.setPhase(RhizomePhase.GROWING);

    this.emit('started', { nodeId: this.config.nodeId });

    return true;
  }

  /**
   * Stop the rhizome network propagation
   */
  stop(): void {
    console.log(`[THEORETICAL] Stopping Rhizome Propagation for node ${this.config.nodeId}`);

    // Stop timers
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }

    // Stop sub-systems
    this.gossip.stop();
    this.lateralGrowth.stopGrowth();

    this.setPhase(RhizomePhase.DORMANT);

    this.emit('stopped', { nodeId: this.config.nodeId });
  }

  /**
   * Connect to bootstrap peers
   *
   * THEORETICAL: Establish initial network connections
   */
  private async connectToBootstrapPeers(): Promise<void> {
    console.log(`[THEORETICAL] Connecting to ${this.config.bootstrapPeers.length} bootstrap peers`);

    for (const peerId of this.config.bootstrapPeers) {
      await this.connectToPeer(peerId);
    }
  }

  /**
   * Connect to a specific peer
   *
   * THEORETICAL: Establish connection with another node
   */
  async connectToPeer(peerId: string): Promise<boolean> {
    if (this.connections.has(peerId)) {
      return true; // Already connected
    }

    if (this.connections.size >= this.config.maxConnections) {
      console.log('[THEORETICAL] Maximum connections reached');
      return false;
    }

    console.log(`[THEORETICAL] Connecting to peer ${peerId}`);

    // Simulated connection
    const connection = {
      peerId,
      established: Date.now(),
      strength: 0.5,
      lastActivity: Date.now()
    };

    this.connections.set(peerId, connection);

    // Add to gossip protocol
    this.gossip.addPeer(peerId, connection.strength);

    // Announce our presence
    this.announcePresence();

    this.emit(PropagationEvent.CONNECTION_ESTABLISHED, { peerId });

    return true;
  }

  /**
   * Disconnect from a peer
   */
  disconnectFromPeer(peerId: string): void {
    if (this.connections.has(peerId)) {
      this.connections.delete(peerId);
      this.gossip.removePeer(peerId);

      this.emit(PropagationEvent.CONNECTION_LOST, { peerId });
    }
  }

  /**
   * Announce our presence to the network
   *
   * THEORETICAL: Broadcast discovery message
   */
  private announcePresence(): void {
    this.gossip.broadcast(GossipMessageType.DISCOVERY, {
      type: 'announce',
      identity: this.identity
    }, { priority: 7 });

    this.messagesPropagated++;
  }

  /**
   * Propagate a message through the network
   *
   * THEORETICAL: Use epidemic spreading for message delivery
   */
  propagateMessage(
    type: GossipMessageType,
    payload: unknown,
    options: { priority?: number; ttl?: number } = {}
  ): void {
    this.gossip.broadcast(type, payload, options);
    this.messagesPropagated++;

    this.emit('messagePropagated', { type, payload });
  }

  /**
   * Launch a network growth wave
   *
   * THEORETICAL: Initiate coordinated expansion
   */
  launchGrowthWave(
    direction: GrowthDirection = GrowthDirection.OPPORTUNISTIC,
    energy: number = 1.0
  ): void {
    const wave = this.lateralGrowth.launchGrowthWave(
      this.config.nodeId,
      direction,
      energy
    );

    if (wave) {
      // Announce growth wave to network
      this.propagateMessage(GossipMessageType.TOPOLOGY, {
        type: 'growth_wave',
        waveId: wave.waveId,
        direction,
        origin: this.config.nodeId
      }, { priority: 6 });

      this.emit(PropagationEvent.GROWTH_WAVE, { wave });
    }
  }

  /**
   * Synchronize state with a peer
   *
   * THEORETICAL: Full state synchronization
   */
  async syncWithPeer(peerId: string): Promise<void> {
    console.log(`[THEORETICAL] Syncing state with peer ${peerId}`);

    await this.stateSync.startSyncSession(peerId);
    this.stateSyncOps++;

    this.emit(PropagationEvent.STATE_SYNCHRONIZED, { peerId });
  }

  /**
   * Get shared network state
   */
  getSharedState<T>(key: string): T | undefined {
    return this.stateSync.get<T>(key);
  }

  /**
   * Set shared network state
   */
  setSharedState<T>(
    key: string,
    value: T,
    options: { type?: SyncStateType } = {}
  ): void {
    this.stateSync.set(key, value, options);
    this.stateSyncOps++;
  }

  /**
   * Perform periodic health check
   *
   * THEORETICAL: Monitor network health
   */
  private performHealthCheck(): void {
    console.log('[THEORETICAL] Performing health check...');

    const now = Date.now();

    // Check connection health
    for (const [connId, conn] of this.connections) {
      const age = now - conn.lastActivity;

      if (age > this.config.healthCheckInterval * 3) {
        // Connection seems dead
        console.log(`[THEORETICAL] Connection to ${conn.peerId} appears dead`);
        this.disconnectFromPeer(conn.peerId);
      }
    }

    // Update our last seen time
    this.identity.lastSeen = now;

    // Broadcast heartbeat
    this.gossip.broadcast(GossipMessageType.HEARTBEAT, {
      nodeId: this.config.nodeId,
      timestamp: now
    }, { priority: 2 });

    // Check for phase transitions
    this.checkPhaseTransition();

    // Garbage collect state
    this.stateSync.garbageCollect();

    this.emit('healthCheckCompleted', {
      connections: this.connections.size,
      knownNodes: this.knownNodes.size
    });
  }

  /**
   * Check if we should transition phases
   */
  private checkPhaseTransition(): void {
    const stats = this.getStats();

    switch (this.phase) {
      case RhizomePhase.SPROUTING:
        if (stats.totalConnections >= 3) {
          this.setPhase(RhizomePhase.GROWING);
        }
        break;

      case RhizomePhase.GROWING:
        if (stats.totalNodes >= this.config.targetNetworkSize * 0.8) {
          this.setPhase(RhizomePhase.MATURE);
        }
        break;

      case RhizomePhase.MATURE:
        if (stats.totalNodes < this.config.targetNetworkSize * 0.5) {
          this.setPhase(RhizomePhase.GROWING);
        }
        break;
    }
  }

  /**
   * Set the network phase
   */
  private setPhase(newPhase: RhizomePhase): void {
    if (this.phase === newPhase) return;

    const oldPhase = this.phase;
    this.phase = newPhase;

    console.log(`[THEORETICAL] Phase transition: ${oldPhase} -> ${newPhase}`);

    this.emit('phaseChanged', { oldPhase, newPhase });
  }

  /**
   * Setup event handlers for sub-systems
   */
  private setupEventHandlers(): void {
    // Gossip events
    this.gossip.on('messageReceived', ({ message }) => {
      this.handleGossipMessage(message);
    });

    this.gossip.on('discovery', (message) => {
      const payload = message.payload as { type: string; identity: RhizomeIdentity };
      if (payload.type === 'announce') {
        this.handleNodeDiscovery(payload.identity);
      }
    });

    this.gossip.on('heartbeat', (message) => {
      const payload = message.payload as { nodeId: string; timestamp: number };
      this.handleHeartbeat(payload.nodeId, payload.timestamp);
    });

    // State sync events
    this.stateSync.on('deltaApplied', ({ delta }) => {
      this.emit('stateUpdated', { key: delta.key, operation: delta.operation });
    });

    // Lateral growth events
    this.lateralGrowth.on('nodeCreated', ({ node }) => {
      this.emit(PropagationEvent.NODE_JOINED, { node });
    });

    this.lateralGrowth.on('waveLaunched', ({ wave }) => {
      this.emit(PropagationEvent.GROWTH_WAVE, { wave });
    });
  }

  /**
   * Handle incoming gossip message
   */
  private handleGossipMessage(message: { type: string; payload: unknown }): void {
    // Message already processed by typed handlers
    this.emit('gossipReceived', { type: message.type });
  }

  /**
   * Handle node discovery
   */
  private handleNodeDiscovery(identity: RhizomeIdentity): void {
    if (this.knownNodes.has(identity.nodeId)) {
      // Update existing
      const existing = this.knownNodes.get(identity.nodeId)!;
      existing.lastSeen = Date.now();
    } else {
      // New node
      this.knownNodes.set(identity.nodeId, identity);
      this.emit(PropagationEvent.NODE_JOINED, { identity });
    }
  }

  /**
   * Handle heartbeat message
   */
  private handleHeartbeat(nodeId: string, timestamp: number): void {
    const connection = Array.from(this.connections.values())
      .find(c => c.peerId === nodeId);

    if (connection) {
      connection.lastActivity = Date.now();
    }

    const node = this.knownNodes.get(nodeId);
    if (node) {
      node.lastSeen = timestamp;
    }
  }

  /**
   * Generate mock public key (for theoretical framework)
   */
  private generateMockPublicKey(): string {
    return `pk_${Buffer.from(this.config.nodeId).toString('base64').slice(0, 32)}`;
  }

  /**
   * Get current topology view
   */
  getTopology(): TopologyView {
    const connectionList = Array.from(this.connections.values()).map(c => ({
      sourceId: this.config.nodeId,
      targetId: c.peerId,
      strength: c.strength,
      latency: 50 // Simulated
    }));

    return {
      nodes: new Map(this.knownNodes),
      connections: new Map(connectionList.map(c => [
        `${c.sourceId}-${c.targetId}`,
        c
      ])),
      diameter: this.calculateDiameter(),
      averageDegree: this.connections.size,
      clusteringCoefficient: 0.5, // Simulated
      timestamp: Date.now()
    };
  }

  /**
   * Calculate network diameter (simplified)
   */
  private calculateDiameter(): number {
    // Simplified: use network size as proxy
    return Math.ceil(Math.log2(this.knownNodes.size + 1));
  }

  /**
   * Get propagation statistics
   */
  getStats(): PropagationStats {
    const growthStats = this.lateralGrowth.getStats();
    const gossipStats = this.gossip.getStats();
    const stateSyncStats = this.stateSync.getStats();

    return {
      phase: this.phase,
      totalNodes: this.knownNodes.size + growthStats.totalNodes,
      activeNodes: growthStats.activeNodes,
      totalConnections: this.connections.size,
      messagesPropagated: this.messagesPropagated + gossipStats.totalMessagesSent,
      stateSyncOps: this.stateSyncOps + stateSyncStats.totalSyncs,
      growthWavesLaunched: growthStats.totalWavesLaunched,
      uptime: Date.now() - this.startTime,
      coverageArea: this.estimateCoverageArea()
    };
  }

  /**
   * Estimate network coverage area (simplified)
   */
  private estimateCoverageArea(): number {
    // ~1 sq km per node (theoretical)
    return this.knownNodes.size;
  }

  /**
   * Export network state for visualization
   */
  exportState(): {
    identity: RhizomeIdentity;
    phase: RhizomePhase;
    topology: object;
    rhizomeNetwork: object;
    stats: PropagationStats;
  } {
    return {
      identity: this.identity,
      phase: this.phase,
      topology: {
        nodes: Array.from(this.knownNodes.values()),
        connections: Array.from(this.connections.values())
      },
      rhizomeNetwork: this.lateralGrowth.toGeoJSON(),
      stats: this.getStats()
    };
  }

  /**
   * Get the underlying sub-systems for advanced usage
   */
  getSubSystems(): {
    gossip: RhizomeGossipProtocol;
    stateSync: RhizomeStateSync;
    lateralGrowth: RhizomeLateralGrowth;
  } {
    return {
      gossip: this.gossip,
      stateSync: this.stateSync,
      lateralGrowth: this.lateralGrowth
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a rhizome propagation coordinator with default settings
 *
 * THEORETICAL: Factory for creating propagation coordinators
 */
export function createRhizomePropagation(
  nodeId: string,
  location: { latitude: number; longitude: number }
): RhizomePropagationCoordinator {
  return new RhizomePropagationCoordinator({
    nodeId,
    location
  });
}

/**
 * Create a Chicago-based rhizome node
 *
 * THEORETICAL: Pre-configured for Chicago Forest Network
 */
export function createChicagoRhizomeNode(nodeId: string): RhizomePropagationCoordinator {
  return new RhizomePropagationCoordinator({
    nodeId,
    location: {
      latitude: 41.8781,
      longitude: -87.6298
    },
    targetNetworkSize: 500,
    autoGrowth: true
  });
}

/**
 * Create a lightweight rhizome node
 *
 * THEORETICAL: Minimal resource usage
 */
export function createLightweightRhizome(
  nodeId: string,
  location: { latitude: number; longitude: number }
): RhizomePropagationCoordinator {
  return new RhizomePropagationCoordinator({
    nodeId,
    location,
    autoGrowth: false,
    enableStateSync: false,
    maxConnections: 5,
    healthCheckInterval: 60000
  });
}

// ============================================================================
// PACKAGE INFO
// ============================================================================

export const RHIZOME_PROPAGATION_INFO = {
  name: '@chicago-forest/spore-propagation/rhizome',
  version: '0.1.0-theoretical',
  description: 'Rhizome-inspired network propagation system',

  components: [
    'RhizomePropagationCoordinator - Main orchestrator',
    'RhizomeGossipProtocol - Epidemic message spreading',
    'RhizomeStateSync - Distributed state synchronization',
    'RhizomeLateralGrowth - Horizontal network expansion'
  ],

  references: [
    {
      title: 'A Thousand Plateaus',
      authors: 'Deleuze & Guattari',
      year: 1980,
      note: 'Philosophical concept of rhizome networks'
    },
    {
      title: 'Epidemic Algorithms for Replicated Database Maintenance',
      authors: 'Demers et al.',
      venue: 'PODC 1987',
      doi: '10.1145/41840.41841'
    },
    {
      title: 'Conflict-free Replicated Data Types',
      authors: 'Shapiro et al.',
      venue: 'SSS 2011',
      doi: '10.1007/978-3-642-24550-3_29'
    },
    {
      title: 'Foraging in Plants',
      authors: 'Hutchings & de Kroon',
      venue: 'Advances in Ecological Research',
      doi: '10.1016/S0065-2504(08)60215-9'
    }
  ],

  disclaimer: 'THEORETICAL framework - NOT operational'
};

// ============================================================================
// DISCLAIMER
// ============================================================================
/*
 * IMPORTANT NOTICE:
 *
 * This code is part of a THEORETICAL FRAMEWORK exploring concepts for
 * decentralized network propagation inspired by plant rhizome systems.
 *
 * It is NOT:
 * - A working network protocol
 * - A proven technology
 * - Ready for production deployment
 * - An energy distribution solution
 *
 * It IS:
 * - An educational exploration of distributed systems
 * - Inspired by real biological and distributed systems research
 * - A conceptual framework for community discussion
 * - Part of the Chicago Plasma Forest Network theoretical project
 *
 * The rhizome metaphor comes from Deleuze & Guattari's philosophy:
 * "The rhizome connects any point to any other point...
 *  It has neither beginning nor end, but always a middle from
 *  which it grows and which it overspills."
 */
