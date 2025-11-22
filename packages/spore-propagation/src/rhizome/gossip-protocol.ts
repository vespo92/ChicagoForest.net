/**
 * Rhizome Gossip Protocol
 *
 * DISCLAIMER: This is a THEORETICAL framework inspired by biological systems.
 * This code represents a conceptual design for epidemic information spreading
 * and is NOT a working energy distribution system.
 *
 * AI-GENERATED CONTENT: Created as part of the Chicago Plasma Forest Network
 * theoretical framework - an educational project exploring decentralized networks.
 *
 * BIOLOGICAL INSPIRATION:
 * Based on how rhizomes (underground plant stems) spread information and resources
 * laterally through interconnected nodes, combined with epidemic spreading algorithms:
 *
 * - Demers et al., "Epidemic Algorithms for Replicated Database Maintenance"
 *   PODC '87: Proceedings of the sixth annual ACM Symposium on Principles of
 *   distributed computing, 1987
 *   DOI: 10.1145/41840.41841
 *
 * - Birman et al., "Bimodal Multicast"
 *   ACM TOCS 17(2):41-88, 1999
 *   DOI: 10.1145/312203.312207
 */

import { EventEmitter } from 'events';

// ============================================================================
// THEORETICAL FRAMEWORK - NOT OPERATIONAL
// ============================================================================

/**
 * Gossip Message Types
 *
 * THEORETICAL: Different categories of information that can spread through
 * the rhizome network using epidemic protocols.
 */
export enum GossipMessageType {
  /** Node discovery announcements */
  DISCOVERY = 'DISCOVERY',

  /** Heartbeat/liveness signals */
  HEARTBEAT = 'HEARTBEAT',

  /** State updates for synchronization */
  STATE_UPDATE = 'STATE_UPDATE',

  /** Alert messages (high priority) */
  ALERT = 'ALERT',

  /** Network topology changes */
  TOPOLOGY = 'TOPOLOGY',

  /** Resource availability updates */
  RESOURCE = 'RESOURCE',

  /** Governance proposals and votes */
  GOVERNANCE = 'GOVERNANCE',

  /** Anti-entropy repair requests */
  REPAIR = 'REPAIR'
}

/**
 * Gossip Dissemination Strategies
 *
 * THEORETICAL: Different approaches to spreading information,
 * inspired by epidemiological models.
 */
export enum DisseminationStrategy {
  /** Push-based: actively send to random peers */
  PUSH = 'PUSH',

  /** Pull-based: request updates from peers */
  PULL = 'PULL',

  /** Push-pull hybrid for faster convergence */
  PUSH_PULL = 'PUSH_PULL',

  /** Bimodal: reliable multicast with gossip repair */
  BIMODAL = 'BIMODAL'
}

/**
 * Gossip Message Structure
 *
 * THEORETICAL: Core message format for epidemic spreading
 */
export interface GossipMessage {
  /** Unique message identifier */
  messageId: string;

  /** Message type classification */
  type: GossipMessageType;

  /** Original sender node ID */
  originNodeId: string;

  /** Message payload (type-specific) */
  payload: unknown;

  /** Lamport timestamp for ordering */
  timestamp: number;

  /** Vector clock for causal ordering */
  vectorClock: Map<string, number>;

  /** Time-to-live (hops remaining) */
  ttl: number;

  /** Hop count (hops traveled) */
  hopCount: number;

  /** Priority level (0-10, higher = more urgent) */
  priority: number;

  /** Signature for authenticity */
  signature: string;

  /** Creation time (Unix timestamp) */
  createdAt: number;

  /** Expiration time (Unix timestamp, 0 = never) */
  expiresAt: number;
}

/**
 * Peer Selection Configuration
 *
 * THEORETICAL: How to select peers for gossip exchanges
 */
export interface PeerSelectionConfig {
  /** Number of peers to contact per round */
  fanout: number;

  /** Prefer peers not recently contacted */
  preferFresh: boolean;

  /** Weight geographic proximity */
  proximityWeight: number;

  /** Weight connection quality */
  qualityWeight: number;

  /** Avoid sending same message to peer twice */
  deduplication: boolean;
}

/**
 * Gossip Round Statistics
 *
 * THEORETICAL: Metrics for a single gossip round
 */
export interface GossipRoundStats {
  /** Round number */
  round: number;

  /** Messages sent this round */
  messagesSent: number;

  /** Messages received this round */
  messagesReceived: number;

  /** New messages (not previously seen) */
  newMessages: number;

  /** Duplicate messages filtered */
  duplicatesFiltered: number;

  /** Peers contacted */
  peersContacted: number;

  /** Round duration (ms) */
  duration: number;

  /** Timestamp */
  timestamp: Date;
}

/**
 * Gossip Protocol Configuration
 *
 * THEORETICAL: Tunable parameters for the gossip system
 */
export interface GossipConfig {
  /** Node's own ID */
  nodeId: string;

  /** Dissemination strategy */
  strategy: DisseminationStrategy;

  /** Peer selection config */
  peerSelection: PeerSelectionConfig;

  /** Gossip round interval (ms) */
  roundInterval: number;

  /** Default message TTL (hops) */
  defaultTTL: number;

  /** Maximum message age before expiry (ms) */
  maxMessageAge: number;

  /** Message buffer size */
  bufferSize: number;

  /** Enable anti-entropy protocol */
  enableAntiEntropy: boolean;

  /** Anti-entropy interval (ms) */
  antiEntropyInterval: number;
}

const DEFAULT_CONFIG: GossipConfig = {
  nodeId: '',
  strategy: DisseminationStrategy.PUSH_PULL,
  peerSelection: {
    fanout: 3,
    preferFresh: true,
    proximityWeight: 0.3,
    qualityWeight: 0.4,
    deduplication: true
  },
  roundInterval: 1000, // 1 second
  defaultTTL: 10,
  maxMessageAge: 300000, // 5 minutes
  bufferSize: 1000,
  enableAntiEntropy: true,
  antiEntropyInterval: 30000 // 30 seconds
};

/**
 * Rhizome Gossip Protocol Manager
 *
 * THEORETICAL FRAMEWORK: Implements epidemic spreading algorithms for
 * decentralized information dissemination across the rhizome network.
 *
 * Inspired by:
 * - Plant rhizome networks sharing nutrients underground
 * - Epidemic/gossip protocols from distributed systems research
 * - SWIM (Scalable Weakly-consistent Infection-style Membership)
 */
export class RhizomeGossipProtocol extends EventEmitter {
  private config: GossipConfig;
  private localClock: number = 0;
  private vectorClock: Map<string, number> = new Map();

  // Message tracking
  private seenMessages: Map<string, number> = new Map(); // messageId -> timestamp
  private messageBuffer: Map<string, GossipMessage> = new Map();
  private pendingMessages: GossipMessage[] = [];

  // Peer tracking
  private activePeers: Map<string, {
    lastContact: number;
    messagesSent: number;
    messagesReceived: number;
    quality: number;
  }> = new Map();

  // Statistics
  private roundNumber: number = 0;
  private totalMessagesSent: number = 0;
  private totalMessagesReceived: number = 0;
  private roundStats: GossipRoundStats[] = [];

  // Timers
  private gossipTimer: ReturnType<typeof setInterval> | null = null;
  private antiEntropyTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<GossipConfig> & { nodeId: string }) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.vectorClock.set(this.config.nodeId, 0);
  }

  /**
   * Start the gossip protocol
   *
   * THEORETICAL: Begin periodic gossip rounds
   */
  start(): void {
    console.log(`[THEORETICAL] Starting Rhizome Gossip Protocol for node ${this.config.nodeId}`);

    // Start gossip rounds
    this.gossipTimer = setInterval(() => {
      this.executeGossipRound();
    }, this.config.roundInterval);

    // Start anti-entropy if enabled
    if (this.config.enableAntiEntropy) {
      this.antiEntropyTimer = setInterval(() => {
        this.executeAntiEntropy();
      }, this.config.antiEntropyInterval);
    }

    this.emit('started', { nodeId: this.config.nodeId });
  }

  /**
   * Stop the gossip protocol
   */
  stop(): void {
    console.log(`[THEORETICAL] Stopping Rhizome Gossip Protocol for node ${this.config.nodeId}`);

    if (this.gossipTimer) {
      clearInterval(this.gossipTimer);
      this.gossipTimer = null;
    }

    if (this.antiEntropyTimer) {
      clearInterval(this.antiEntropyTimer);
      this.antiEntropyTimer = null;
    }

    this.emit('stopped', { nodeId: this.config.nodeId });
  }

  /**
   * Broadcast a message to the network
   *
   * THEORETICAL: Initiate epidemic spreading of a message
   */
  broadcast(
    type: GossipMessageType,
    payload: unknown,
    options: Partial<{
      priority: number;
      ttl: number;
      expiresIn: number;
    }> = {}
  ): GossipMessage {
    // Increment local clock
    this.localClock++;
    this.vectorClock.set(this.config.nodeId, this.localClock);

    const message: GossipMessage = {
      messageId: this.generateMessageId(),
      type,
      originNodeId: this.config.nodeId,
      payload,
      timestamp: this.localClock,
      vectorClock: new Map(this.vectorClock),
      ttl: options.ttl ?? this.config.defaultTTL,
      hopCount: 0,
      priority: options.priority ?? 5,
      signature: this.signMessage(payload),
      createdAt: Date.now(),
      expiresAt: options.expiresIn ? Date.now() + options.expiresIn : 0
    };

    // Add to our own buffer
    this.recordMessage(message);

    // Queue for next gossip round
    this.pendingMessages.push(message);

    this.emit('messageBroadcast', { message });

    return message;
  }

  /**
   * Receive a message from a peer
   *
   * THEORETICAL: Process incoming gossip message
   */
  receiveMessage(message: GossipMessage, fromPeerId: string): boolean {
    // Update peer tracking
    this.updatePeerStats(fromPeerId, 'received');

    // Check if already seen
    if (this.seenMessages.has(message.messageId)) {
      this.emit('duplicateMessage', { messageId: message.messageId, fromPeerId });
      return false;
    }

    // Check expiration
    if (message.expiresAt > 0 && Date.now() > message.expiresAt) {
      this.emit('expiredMessage', { messageId: message.messageId });
      return false;
    }

    // Check TTL
    if (message.ttl <= 0) {
      this.emit('ttlExhausted', { messageId: message.messageId });
      return false;
    }

    // Verify signature (simplified)
    if (!this.verifySignature(message)) {
      this.emit('invalidSignature', { messageId: message.messageId });
      return false;
    }

    // Update vector clock (merge)
    this.mergeVectorClock(message.vectorClock);

    // Record message
    this.recordMessage(message);

    // Decrement TTL and increment hop count for forwarding
    const forwardMessage: GossipMessage = {
      ...message,
      ttl: message.ttl - 1,
      hopCount: message.hopCount + 1
    };

    // Queue for forwarding if TTL > 0
    if (forwardMessage.ttl > 0) {
      this.pendingMessages.push(forwardMessage);
    }

    // Emit for processing
    this.emit('messageReceived', { message, fromPeerId });
    this.emitTypedMessage(message);

    this.totalMessagesReceived++;

    return true;
  }

  /**
   * Execute a single gossip round
   *
   * THEORETICAL: Contact random peers and exchange messages
   */
  private executeGossipRound(): void {
    const startTime = Date.now();
    this.roundNumber++;

    console.log(`[THEORETICAL] Gossip round ${this.roundNumber} starting...`);

    // Select peers for this round
    const selectedPeers = this.selectPeers();

    if (selectedPeers.length === 0) {
      console.log('[THEORETICAL] No peers available for gossip');
      return;
    }

    let messagesSent = 0;
    let duplicatesFiltered = 0;
    let newMessages = 0;

    // Execute based on strategy
    switch (this.config.strategy) {
      case DisseminationStrategy.PUSH:
        messagesSent = this.executePush(selectedPeers);
        break;
      case DisseminationStrategy.PULL:
        newMessages = this.executePull(selectedPeers);
        break;
      case DisseminationStrategy.PUSH_PULL:
        const pushResult = this.executePush(selectedPeers);
        const pullResult = this.executePull(selectedPeers);
        messagesSent = pushResult;
        newMessages = pullResult;
        break;
      case DisseminationStrategy.BIMODAL:
        messagesSent = this.executeBimodal(selectedPeers);
        break;
    }

    // Clear pending messages
    this.pendingMessages = [];

    // Garbage collect old messages
    this.garbageCollect();

    // Record stats
    const stats: GossipRoundStats = {
      round: this.roundNumber,
      messagesSent,
      messagesReceived: this.totalMessagesReceived,
      newMessages,
      duplicatesFiltered,
      peersContacted: selectedPeers.length,
      duration: Date.now() - startTime,
      timestamp: new Date()
    };

    this.roundStats.push(stats);

    // Keep only last 100 rounds of stats
    if (this.roundStats.length > 100) {
      this.roundStats.shift();
    }

    this.emit('roundCompleted', { stats });
  }

  /**
   * Execute push-based gossip
   *
   * THEORETICAL: Actively send messages to random peers
   */
  private executePush(peers: string[]): number {
    let sent = 0;

    for (const peerId of peers) {
      for (const message of this.pendingMessages) {
        // Check deduplication
        if (this.config.peerSelection.deduplication) {
          // In real implementation, track which messages sent to which peers
        }

        // Simulate sending (in reality, would use network transport)
        this.simulateSend(peerId, message);
        this.updatePeerStats(peerId, 'sent');
        sent++;
      }
    }

    this.totalMessagesSent += sent;
    return sent;
  }

  /**
   * Execute pull-based gossip
   *
   * THEORETICAL: Request updates from peers
   */
  private executePull(peers: string[]): number {
    // In reality, would send digest requests and receive missing messages
    console.log(`[THEORETICAL] Pulling from ${peers.length} peers`);
    return 0;
  }

  /**
   * Execute bimodal multicast
   *
   * THEORETICAL: Reliable multicast with gossip-based repair
   *
   * Reference: Birman et al., "Bimodal Multicast", ACM TOCS 1999
   */
  private executeBimodal(peers: string[]): number {
    // Phase 1: Reliable multicast (simulated)
    const multicastSent = this.executePush(peers.slice(0, 2));

    // Phase 2: Gossip for repair
    const repairPeers = peers.slice(2);
    for (const peerId of repairPeers) {
      // Send digest for anti-entropy
      this.sendDigest(peerId);
    }

    return multicastSent;
  }

  /**
   * Execute anti-entropy protocol
   *
   * THEORETICAL: Periodic state reconciliation with random peer
   *
   * Reference: Demers et al., "Epidemic Algorithms", PODC 1987
   */
  private executeAntiEntropy(): void {
    console.log('[THEORETICAL] Executing anti-entropy protocol...');

    const peers = Array.from(this.activePeers.keys());
    if (peers.length === 0) return;

    // Select random peer
    const randomPeer = peers[Math.floor(Math.random() * peers.length)];

    // Send digest of our state
    this.sendDigest(randomPeer);

    this.emit('antiEntropyExecuted', { peerId: randomPeer });
  }

  /**
   * Send state digest to peer
   *
   * THEORETICAL: Summary of known messages for reconciliation
   */
  private sendDigest(peerId: string): void {
    const digest = this.computeDigest();

    // In reality, would send over network
    console.log(`[THEORETICAL] Sending digest to ${peerId}: ${digest.size} messages`);

    this.emit('digestSent', { peerId, messageCount: digest.size });
  }

  /**
   * Compute message digest
   */
  private computeDigest(): Map<string, number> {
    const digest = new Map<string, number>();

    for (const [messageId, timestamp] of this.seenMessages) {
      digest.set(messageId, timestamp);
    }

    return digest;
  }

  /**
   * Select peers for gossip round
   *
   * THEORETICAL: Weighted random selection based on configuration
   */
  private selectPeers(): string[] {
    const allPeers = Array.from(this.activePeers.keys());

    if (allPeers.length === 0) return [];

    const numPeers = Math.min(this.config.peerSelection.fanout, allPeers.length);
    const selected: string[] = [];

    // Score and sort peers
    const scoredPeers = allPeers.map(peerId => {
      const peer = this.activePeers.get(peerId)!;
      let score = Math.random(); // Base randomness

      // Apply freshness preference
      if (this.config.peerSelection.preferFresh) {
        const timeSinceContact = Date.now() - peer.lastContact;
        score += (timeSinceContact / 60000) * 0.3; // Bonus for not recently contacted
      }

      // Apply quality weight
      score += peer.quality * this.config.peerSelection.qualityWeight;

      return { peerId, score };
    });

    // Sort by score and select top N
    scoredPeers.sort((a, b) => b.score - a.score);

    for (let i = 0; i < numPeers; i++) {
      selected.push(scoredPeers[i].peerId);
    }

    return selected;
  }

  /**
   * Register a peer as active
   */
  addPeer(peerId: string, quality: number = 0.5): void {
    if (!this.activePeers.has(peerId)) {
      this.activePeers.set(peerId, {
        lastContact: Date.now(),
        messagesSent: 0,
        messagesReceived: 0,
        quality
      });

      this.emit('peerAdded', { peerId });
    }
  }

  /**
   * Remove a peer
   */
  removePeer(peerId: string): void {
    if (this.activePeers.has(peerId)) {
      this.activePeers.delete(peerId);
      this.emit('peerRemoved', { peerId });
    }
  }

  /**
   * Update peer statistics
   */
  private updatePeerStats(peerId: string, action: 'sent' | 'received'): void {
    const peer = this.activePeers.get(peerId);
    if (peer) {
      peer.lastContact = Date.now();
      if (action === 'sent') {
        peer.messagesSent++;
      } else {
        peer.messagesReceived++;
      }
    }
  }

  /**
   * Record a message as seen
   */
  private recordMessage(message: GossipMessage): void {
    this.seenMessages.set(message.messageId, Date.now());
    this.messageBuffer.set(message.messageId, message);

    // Enforce buffer size
    if (this.messageBuffer.size > this.config.bufferSize) {
      const oldest = Array.from(this.messageBuffer.entries())
        .sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
      this.messageBuffer.delete(oldest[0]);
      this.seenMessages.delete(oldest[0]);
    }
  }

  /**
   * Garbage collect old messages
   */
  private garbageCollect(): void {
    const now = Date.now();
    const cutoff = now - this.config.maxMessageAge;

    for (const [messageId, timestamp] of this.seenMessages) {
      if (timestamp < cutoff) {
        this.seenMessages.delete(messageId);
        this.messageBuffer.delete(messageId);
      }
    }
  }

  /**
   * Merge incoming vector clock with local
   */
  private mergeVectorClock(incoming: Map<string, number>): void {
    for (const [nodeId, timestamp] of incoming) {
      const current = this.vectorClock.get(nodeId) ?? 0;
      this.vectorClock.set(nodeId, Math.max(current, timestamp));
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `${this.config.nodeId}-${this.localClock}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sign message (simplified)
   */
  private signMessage(payload: unknown): string {
    // In reality, would use cryptographic signing
    return Buffer.from(JSON.stringify(payload)).toString('base64').slice(0, 32);
  }

  /**
   * Verify message signature (simplified)
   */
  private verifySignature(message: GossipMessage): boolean {
    // In reality, would verify cryptographic signature
    return message.signature && message.signature.length > 0;
  }

  /**
   * Simulate sending message (for theoretical framework)
   */
  private simulateSend(peerId: string, message: GossipMessage): void {
    console.log(`[THEORETICAL] Sending ${message.type} message to ${peerId}`);
  }

  /**
   * Emit typed message event
   */
  private emitTypedMessage(message: GossipMessage): void {
    switch (message.type) {
      case GossipMessageType.DISCOVERY:
        this.emit('discovery', message);
        break;
      case GossipMessageType.HEARTBEAT:
        this.emit('heartbeat', message);
        break;
      case GossipMessageType.STATE_UPDATE:
        this.emit('stateUpdate', message);
        break;
      case GossipMessageType.ALERT:
        this.emit('alert', message);
        break;
      case GossipMessageType.TOPOLOGY:
        this.emit('topologyChange', message);
        break;
      case GossipMessageType.RESOURCE:
        this.emit('resourceUpdate', message);
        break;
      case GossipMessageType.GOVERNANCE:
        this.emit('governance', message);
        break;
      case GossipMessageType.REPAIR:
        this.emit('repair', message);
        break;
    }
  }

  /**
   * Get protocol statistics
   */
  getStats(): {
    nodeId: string;
    roundNumber: number;
    totalMessagesSent: number;
    totalMessagesReceived: number;
    activeMessages: number;
    activePeers: number;
    averageRoundDuration: number;
  } {
    const avgDuration = this.roundStats.length > 0
      ? this.roundStats.reduce((sum, s) => sum + s.duration, 0) / this.roundStats.length
      : 0;

    return {
      nodeId: this.config.nodeId,
      roundNumber: this.roundNumber,
      totalMessagesSent: this.totalMessagesSent,
      totalMessagesReceived: this.totalMessagesReceived,
      activeMessages: this.messageBuffer.size,
      activePeers: this.activePeers.size,
      averageRoundDuration: avgDuration
    };
  }

  /**
   * Get recent round statistics
   */
  getRecentStats(count: number = 10): GossipRoundStats[] {
    return this.roundStats.slice(-count);
  }

  /**
   * Get all active peers
   */
  getPeers(): string[] {
    return Array.from(this.activePeers.keys());
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a gossip protocol instance with default settings
 *
 * THEORETICAL: Factory for creating gossip protocol instances
 */
export function createGossipProtocol(nodeId: string): RhizomeGossipProtocol {
  return new RhizomeGossipProtocol({ nodeId });
}

/**
 * Create a high-throughput gossip protocol
 *
 * THEORETICAL: Optimized for high message volume
 */
export function createHighThroughputGossip(nodeId: string): RhizomeGossipProtocol {
  return new RhizomeGossipProtocol({
    nodeId,
    strategy: DisseminationStrategy.PUSH,
    roundInterval: 500,
    peerSelection: {
      fanout: 5,
      preferFresh: false,
      proximityWeight: 0.1,
      qualityWeight: 0.6,
      deduplication: true
    },
    bufferSize: 5000
  });
}

/**
 * Create a reliable gossip protocol
 *
 * THEORETICAL: Optimized for message delivery guarantees
 */
export function createReliableGossip(nodeId: string): RhizomeGossipProtocol {
  return new RhizomeGossipProtocol({
    nodeId,
    strategy: DisseminationStrategy.BIMODAL,
    roundInterval: 2000,
    defaultTTL: 20,
    enableAntiEntropy: true,
    antiEntropyInterval: 15000,
    peerSelection: {
      fanout: 4,
      preferFresh: true,
      proximityWeight: 0.2,
      qualityWeight: 0.5,
      deduplication: true
    }
  });
}

// ============================================================================
// DISCLAIMER
// ============================================================================
/*
 * IMPORTANT NOTICE:
 *
 * This code is part of a THEORETICAL FRAMEWORK exploring concepts for
 * decentralized information spreading inspired by biological systems
 * and distributed systems research.
 *
 * It is NOT:
 * - A working network protocol
 * - A proven technology
 * - Ready for production deployment
 * - An energy distribution solution
 *
 * It IS:
 * - An educational exploration of gossip/epidemic protocols
 * - Based on real research (Demers et al. 1987, Birman et al. 1999)
 * - A conceptual framework for community discussion
 *
 * References:
 * - Demers et al., "Epidemic Algorithms for Replicated Database Maintenance"
 *   PODC 1987, DOI: 10.1145/41840.41841
 * - Birman et al., "Bimodal Multicast", ACM TOCS 1999
 *   DOI: 10.1145/312203.312207
 */
