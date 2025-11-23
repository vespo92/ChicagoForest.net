/**
 * Rhizome State Synchronization System
 *
 * DISCLAIMER: This is a THEORETICAL framework inspired by biological systems.
 * This code represents a conceptual design for distributed state synchronization
 * and is NOT a working energy distribution system.
 *
 * AI-GENERATED CONTENT: Created as part of the Chicago Plasma Forest Network
 * theoretical framework - an educational project exploring decentralized networks.
 *
 * BIOLOGICAL INSPIRATION:
 * Based on how rhizome networks maintain consistent resource distribution
 * across interconnected nodes, combined with distributed systems concepts:
 *
 * - CRDTs (Conflict-free Replicated Data Types)
 *   Shapiro et al., "Conflict-free Replicated Data Types"
 *   SSS'11, DOI: 10.1007/978-3-642-24550-3_29
 *
 * - Eventual Consistency
 *   Vogels, "Eventually Consistent", Communications of the ACM, 2009
 *   DOI: 10.1145/1466443.1466448
 */

import { EventEmitter } from 'events';
import type { RhizomeGossipProtocol, GossipMessageType } from './gossip-protocol';

// ============================================================================
// THEORETICAL FRAMEWORK - NOT OPERATIONAL
// ============================================================================

/**
 * Sync State Types
 *
 * THEORETICAL: Categories of state that can be synchronized
 */
export enum SyncStateType {
  /** Node membership and health */
  MEMBERSHIP = 'MEMBERSHIP',

  /** Network topology information */
  TOPOLOGY = 'TOPOLOGY',

  /** Resource availability */
  RESOURCES = 'RESOURCES',

  /** Configuration settings */
  CONFIG = 'CONFIG',

  /** Governance decisions */
  GOVERNANCE = 'GOVERNANCE',

  /** Application data */
  APPLICATION = 'APPLICATION'
}

/**
 * Sync Conflict Resolution Strategies
 *
 * THEORETICAL: How to resolve conflicting updates
 */
export enum ConflictResolution {
  /** Last-writer-wins based on timestamp */
  LAST_WRITE_WINS = 'LAST_WRITE_WINS',

  /** Merge all changes (for CRDTs) */
  MERGE = 'MERGE',

  /** Higher priority wins */
  PRIORITY = 'PRIORITY',

  /** Custom resolver function */
  CUSTOM = 'CUSTOM'
}

/**
 * State Version Vector
 *
 * THEORETICAL: Track causality across distributed nodes
 */
export interface VersionVector {
  /** Node ID to version number mapping */
  versions: Map<string, number>;

  /** Timestamp of last update */
  timestamp: number;
}

/**
 * State Entry
 *
 * THEORETICAL: A single piece of synchronized state
 */
export interface StateEntry<T = unknown> {
  /** Unique key for this state */
  key: string;

  /** State type classification */
  type: SyncStateType;

  /** The actual value */
  value: T;

  /** Version vector for causality */
  version: VersionVector;

  /** Origin node that created/updated this */
  originNode: string;

  /** Conflict resolution strategy */
  conflictResolution: ConflictResolution;

  /** Creation timestamp */
  createdAt: number;

  /** Last update timestamp */
  updatedAt: number;

  /** Tombstone flag (for deletions) */
  deleted: boolean;

  /** Time-to-live (0 = permanent) */
  ttl: number;
}

/**
 * State Delta
 *
 * THEORETICAL: A change to synchronized state
 */
export interface StateDelta<T = unknown> {
  /** Delta identifier */
  deltaId: string;

  /** Target state key */
  key: string;

  /** Operation type */
  operation: 'SET' | 'UPDATE' | 'DELETE' | 'MERGE';

  /** New value (for SET/UPDATE) */
  newValue?: T;

  /** Partial update (for MERGE) */
  partialValue?: Partial<T>;

  /** Version vector */
  version: VersionVector;

  /** Origin node */
  originNode: string;

  /** Timestamp */
  timestamp: number;
}

/**
 * Merkle Tree Node for Efficient Sync
 *
 * THEORETICAL: Hash tree for efficient state comparison
 */
export interface MerkleNode {
  /** Hash of this node */
  hash: string;

  /** Level in tree (0 = leaf) */
  level: number;

  /** Range of keys covered */
  keyRange: { min: string; max: string };

  /** Child hashes (if not leaf) */
  children?: string[];

  /** Leaf data reference (if leaf) */
  dataKey?: string;
}

/**
 * Sync Session
 *
 * THEORETICAL: An active synchronization session with a peer
 */
export interface SyncSession {
  /** Session identifier */
  sessionId: string;

  /** Remote peer ID */
  peerId: string;

  /** Session state */
  state: 'INITIATING' | 'COMPARING' | 'TRANSFERRING' | 'COMPLETING' | 'FAILED';

  /** Keys being synced */
  pendingKeys: Set<string>;

  /** Deltas to send */
  outboundDeltas: StateDelta[];

  /** Deltas received */
  inboundDeltas: StateDelta[];

  /** Session start time */
  startedAt: number;

  /** Last activity time */
  lastActivity: number;
}

/**
 * State Sync Configuration
 *
 * THEORETICAL: Tunable parameters for state synchronization
 */
export interface StateSyncConfig {
  /** Node's own ID */
  nodeId: string;

  /** Default conflict resolution */
  defaultConflictResolution: ConflictResolution;

  /** Enable Merkle tree optimization */
  enableMerkleTree: boolean;

  /** Merkle tree branching factor */
  merkleBranching: number;

  /** Maximum concurrent sync sessions */
  maxSyncSessions: number;

  /** Sync session timeout (ms) */
  sessionTimeout: number;

  /** Enable delta compression */
  enableCompression: boolean;

  /** Maximum state entries to hold */
  maxStateEntries: number;

  /** Tombstone retention period (ms) */
  tombstoneRetention: number;
}

const DEFAULT_CONFIG: StateSyncConfig = {
  nodeId: '',
  defaultConflictResolution: ConflictResolution.LAST_WRITE_WINS,
  enableMerkleTree: true,
  merkleBranching: 16,
  maxSyncSessions: 5,
  sessionTimeout: 30000,
  enableCompression: true,
  maxStateEntries: 10000,
  tombstoneRetention: 86400000 // 24 hours
};

/**
 * Rhizome State Synchronization Manager
 *
 * THEORETICAL FRAMEWORK: Manages distributed state synchronization across
 * the rhizome network using CRDTs and eventual consistency principles.
 *
 * Inspired by:
 * - Plant rhizomes sharing nutrients across the network
 * - CRDT research for conflict-free replication
 * - Merkle trees for efficient synchronization
 */
export class RhizomeStateSync extends EventEmitter {
  private config: StateSyncConfig;
  private localVersion: number = 0;
  private versionVector: Map<string, number> = new Map();

  // State storage
  private stateStore: Map<string, StateEntry> = new Map();
  private pendingDeltas: Map<string, StateDelta[]> = new Map();

  // Merkle tree
  private merkleRoot: string = '';
  private merkleTree: Map<string, MerkleNode> = new Map();

  // Sync sessions
  private activeSessions: Map<string, SyncSession> = new Map();

  // Statistics
  private totalSyncs: number = 0;
  private totalConflicts: number = 0;
  private totalResolutions: number = 0;

  // Gossip protocol integration
  private gossip?: RhizomeGossipProtocol;

  constructor(config: Partial<StateSyncConfig> & { nodeId: string }) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.versionVector.set(this.config.nodeId, 0);
  }

  /**
   * Connect to gossip protocol for message transport
   */
  connectGossip(gossip: RhizomeGossipProtocol): void {
    this.gossip = gossip;

    // Listen for state update messages
    gossip.on('stateUpdate', (message) => {
      const delta = message.payload as StateDelta;
      this.applyDelta(delta);
    });

    this.emit('gossipConnected', { nodeId: this.config.nodeId });
  }

  /**
   * Set a state value
   *
   * THEORETICAL: Create or update a synchronized state entry
   */
  set<T>(
    key: string,
    value: T,
    options: Partial<{
      type: SyncStateType;
      conflictResolution: ConflictResolution;
      ttl: number;
    }> = {}
  ): StateEntry<T> {
    // Increment local version
    this.localVersion++;
    this.versionVector.set(this.config.nodeId, this.localVersion);

    const now = Date.now();
    const existing = this.stateStore.get(key);

    const entry: StateEntry<T> = {
      key,
      type: options.type ?? SyncStateType.APPLICATION,
      value,
      version: {
        versions: new Map(this.versionVector),
        timestamp: now
      },
      originNode: this.config.nodeId,
      conflictResolution: options.conflictResolution ?? this.config.defaultConflictResolution,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      deleted: false,
      ttl: options.ttl ?? 0
    };

    this.stateStore.set(key, entry as StateEntry);

    // Create delta for propagation
    const delta: StateDelta<T> = {
      deltaId: this.generateDeltaId(),
      key,
      operation: existing ? 'UPDATE' : 'SET',
      newValue: value,
      version: entry.version,
      originNode: this.config.nodeId,
      timestamp: now
    };

    // Propagate via gossip
    this.propagateDelta(delta);

    // Update Merkle tree
    if (this.config.enableMerkleTree) {
      this.updateMerkleTree(key);
    }

    this.emit('stateSet', { key, entry });

    return entry;
  }

  /**
   * Get a state value
   */
  get<T>(key: string): T | undefined {
    const entry = this.stateStore.get(key) as StateEntry<T> | undefined;

    if (!entry || entry.deleted) {
      return undefined;
    }

    // Check TTL
    if (entry.ttl > 0 && Date.now() > entry.createdAt + entry.ttl) {
      this.stateStore.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Delete a state value
   *
   * THEORETICAL: Mark as tombstone for eventual deletion
   */
  delete(key: string): boolean {
    const existing = this.stateStore.get(key);
    if (!existing) {
      return false;
    }

    // Increment local version
    this.localVersion++;
    this.versionVector.set(this.config.nodeId, this.localVersion);

    const now = Date.now();

    // Mark as tombstone
    existing.deleted = true;
    existing.updatedAt = now;
    existing.version = {
      versions: new Map(this.versionVector),
      timestamp: now
    };

    // Create delete delta
    const delta: StateDelta = {
      deltaId: this.generateDeltaId(),
      key,
      operation: 'DELETE',
      version: existing.version,
      originNode: this.config.nodeId,
      timestamp: now
    };

    // Propagate
    this.propagateDelta(delta);

    this.emit('stateDeleted', { key });

    return true;
  }

  /**
   * Merge a partial update (for CRDT-style operations)
   *
   * THEORETICAL: Conflict-free merge of partial updates
   */
  merge<T extends object>(key: string, partial: Partial<T>): StateEntry<T> | null {
    const existing = this.stateStore.get(key) as StateEntry<T> | undefined;
    if (!existing || existing.deleted) {
      return null;
    }

    // Increment local version
    this.localVersion++;
    this.versionVector.set(this.config.nodeId, this.localVersion);

    const now = Date.now();

    // Merge values
    const mergedValue = { ...existing.value, ...partial } as T;
    existing.value = mergedValue;
    existing.updatedAt = now;
    existing.version = {
      versions: new Map(this.versionVector),
      timestamp: now
    };

    // Create merge delta
    const delta: StateDelta<T> = {
      deltaId: this.generateDeltaId(),
      key,
      operation: 'MERGE',
      partialValue: partial,
      version: existing.version,
      originNode: this.config.nodeId,
      timestamp: now
    };

    // Propagate
    this.propagateDelta(delta);

    this.emit('stateMerged', { key, entry: existing });

    return existing;
  }

  /**
   * Apply a delta from remote node
   *
   * THEORETICAL: Process incoming state changes
   */
  applyDelta<T>(delta: StateDelta<T>): boolean {
    console.log(`[THEORETICAL] Applying delta ${delta.operation} for key ${delta.key}`);

    const existing = this.stateStore.get(delta.key) as StateEntry<T> | undefined;

    // Check causality using version vectors
    if (existing && !this.happensBefore(existing.version, delta.version)) {
      // Concurrent update - need conflict resolution
      return this.resolveConflict(existing, delta);
    }

    // Apply the delta
    switch (delta.operation) {
      case 'SET':
      case 'UPDATE':
        this.applySetDelta(delta);
        break;
      case 'DELETE':
        this.applyDeleteDelta(delta);
        break;
      case 'MERGE':
        this.applyMergeDelta(delta);
        break;
    }

    // Merge version vectors
    this.mergeVersionVector(delta.version.versions);

    // Update Merkle tree
    if (this.config.enableMerkleTree) {
      this.updateMerkleTree(delta.key);
    }

    this.emit('deltaApplied', { delta });

    return true;
  }

  /**
   * Check if version A happens-before version B
   *
   * THEORETICAL: Causality comparison using version vectors
   */
  private happensBefore(a: VersionVector, b: VersionVector): boolean {
    let aBeforeB = true;
    let atLeastOneLess = false;

    for (const [nodeId, versionB] of b.versions) {
      const versionA = a.versions.get(nodeId) ?? 0;

      if (versionA > versionB) {
        aBeforeB = false;
        break;
      }

      if (versionA < versionB) {
        atLeastOneLess = true;
      }
    }

    return aBeforeB && atLeastOneLess;
  }

  /**
   * Resolve a conflict between existing state and incoming delta
   *
   * THEORETICAL: Apply conflict resolution strategy
   */
  private resolveConflict<T>(existing: StateEntry<T>, delta: StateDelta<T>): boolean {
    this.totalConflicts++;

    console.log(`[THEORETICAL] Resolving conflict for key ${delta.key}`);

    const resolution = existing.conflictResolution;

    switch (resolution) {
      case ConflictResolution.LAST_WRITE_WINS:
        // Compare timestamps
        if (delta.timestamp > existing.updatedAt) {
          this.applySetDelta(delta);
          this.totalResolutions++;
          return true;
        }
        return false;

      case ConflictResolution.MERGE:
        // Merge both values (for object types)
        if (delta.operation === 'MERGE' && delta.partialValue) {
          this.applyMergeDelta(delta);
          this.totalResolutions++;
          return true;
        }
        // Fall through to LWW for non-merge operations
        if (delta.timestamp > existing.updatedAt) {
          this.applySetDelta(delta);
          this.totalResolutions++;
          return true;
        }
        return false;

      case ConflictResolution.PRIORITY:
        // Compare origin node priority (simplified: alphabetical)
        if (delta.originNode < existing.originNode) {
          this.applySetDelta(delta);
          this.totalResolutions++;
          return true;
        }
        return false;

      case ConflictResolution.CUSTOM:
        // Emit event for custom handling
        this.emit('conflictDetected', { existing, delta });
        return false;

      default:
        return false;
    }
  }

  /**
   * Apply a SET/UPDATE delta
   */
  private applySetDelta<T>(delta: StateDelta<T>): void {
    const entry: StateEntry<T> = {
      key: delta.key,
      type: SyncStateType.APPLICATION,
      value: delta.newValue as T,
      version: delta.version,
      originNode: delta.originNode,
      conflictResolution: this.config.defaultConflictResolution,
      createdAt: this.stateStore.get(delta.key)?.createdAt ?? delta.timestamp,
      updatedAt: delta.timestamp,
      deleted: false,
      ttl: 0
    };

    this.stateStore.set(delta.key, entry as StateEntry);
  }

  /**
   * Apply a DELETE delta
   */
  private applyDeleteDelta(delta: StateDelta): void {
    const existing = this.stateStore.get(delta.key);
    if (existing) {
      existing.deleted = true;
      existing.updatedAt = delta.timestamp;
      existing.version = delta.version;
    }
  }

  /**
   * Apply a MERGE delta
   */
  private applyMergeDelta<T extends object>(delta: StateDelta<T>): void {
    const existing = this.stateStore.get(delta.key) as StateEntry<T> | undefined;
    if (existing && delta.partialValue) {
      existing.value = { ...existing.value, ...delta.partialValue } as T;
      existing.updatedAt = delta.timestamp;
      existing.version = delta.version;
    }
  }

  /**
   * Propagate delta via gossip protocol
   */
  private propagateDelta(delta: StateDelta): void {
    if (this.gossip) {
      this.gossip.broadcast('STATE_UPDATE' as GossipMessageType, delta, {
        priority: 5
      });
    }

    this.emit('deltaPropagated', { delta });
  }

  /**
   * Merge remote version vector into local
   */
  private mergeVersionVector(remote: Map<string, number>): void {
    for (const [nodeId, version] of remote) {
      const local = this.versionVector.get(nodeId) ?? 0;
      this.versionVector.set(nodeId, Math.max(local, version));
    }
  }

  /**
   * Start a sync session with a peer
   *
   * THEORETICAL: Initiate full state synchronization
   */
  async startSyncSession(peerId: string): Promise<SyncSession> {
    if (this.activeSessions.size >= this.config.maxSyncSessions) {
      throw new Error('Maximum sync sessions reached');
    }

    const session: SyncSession = {
      sessionId: this.generateSessionId(),
      peerId,
      state: 'INITIATING',
      pendingKeys: new Set(),
      outboundDeltas: [],
      inboundDeltas: [],
      startedAt: Date.now(),
      lastActivity: Date.now()
    };

    this.activeSessions.set(session.sessionId, session);
    this.totalSyncs++;

    console.log(`[THEORETICAL] Starting sync session ${session.sessionId} with ${peerId}`);

    // Phase 1: Compare state using Merkle tree (if enabled)
    session.state = 'COMPARING';

    if (this.config.enableMerkleTree) {
      // Would send Merkle root hash to peer
      console.log(`[THEORETICAL] Sending Merkle root ${this.merkleRoot} to peer`);
    } else {
      // Send full key list
      session.pendingKeys = new Set(this.stateStore.keys());
    }

    this.emit('syncSessionStarted', { session });

    return session;
  }

  /**
   * Complete a sync session
   */
  completeSyncSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.state = 'COMPLETING';

    console.log(`[THEORETICAL] Completing sync session ${sessionId}`);

    this.activeSessions.delete(sessionId);

    this.emit('syncSessionCompleted', {
      sessionId,
      deltasReceived: session.inboundDeltas.length,
      deltasSent: session.outboundDeltas.length
    });
  }

  /**
   * Update Merkle tree for a key
   *
   * THEORETICAL: Efficient state comparison structure
   */
  private updateMerkleTree(key: string): void {
    // Simplified Merkle tree update
    // In reality, would recompute path from leaf to root

    const entry = this.stateStore.get(key);
    if (entry) {
      const hash = this.hashEntry(entry);

      const node: MerkleNode = {
        hash,
        level: 0,
        keyRange: { min: key, max: key },
        dataKey: key
      };

      this.merkleTree.set(key, node);

      // Recompute root (simplified)
      this.merkleRoot = this.computeMerkleRoot();
    }
  }

  /**
   * Compute Merkle tree root hash
   */
  private computeMerkleRoot(): string {
    const hashes = Array.from(this.merkleTree.values())
      .map(node => node.hash)
      .sort()
      .join('');

    return this.simpleHash(hashes);
  }

  /**
   * Hash a state entry
   */
  private hashEntry(entry: StateEntry): string {
    const data = JSON.stringify({
      key: entry.key,
      value: entry.value,
      version: Array.from(entry.version.versions.entries()),
      deleted: entry.deleted
    });

    return this.simpleHash(data);
  }

  /**
   * Simple hash function (for theoretical framework)
   */
  private simpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Generate unique delta ID
   */
  private generateDeltaId(): string {
    return `delta-${this.config.nodeId}-${this.localVersion}-${Date.now()}`;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Garbage collect tombstones and expired entries
   */
  garbageCollect(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.stateStore) {
      // Remove old tombstones
      if (entry.deleted && now - entry.updatedAt > this.config.tombstoneRetention) {
        this.stateStore.delete(key);
        this.merkleTree.delete(key);
        removed++;
        continue;
      }

      // Remove expired entries
      if (entry.ttl > 0 && now > entry.createdAt + entry.ttl) {
        this.stateStore.delete(key);
        this.merkleTree.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      this.merkleRoot = this.computeMerkleRoot();
      this.emit('garbageCollected', { removed });
    }

    return removed;
  }

  /**
   * Get all state entries of a specific type
   */
  getByType(type: SyncStateType): StateEntry[] {
    return Array.from(this.stateStore.values())
      .filter(entry => entry.type === type && !entry.deleted);
  }

  /**
   * Get state snapshot
   */
  getSnapshot(): Map<string, StateEntry> {
    const snapshot = new Map<string, StateEntry>();

    for (const [key, entry] of this.stateStore) {
      if (!entry.deleted) {
        snapshot.set(key, { ...entry });
      }
    }

    return snapshot;
  }

  /**
   * Get synchronization statistics
   */
  getStats(): {
    nodeId: string;
    localVersion: number;
    totalEntries: number;
    activeEntries: number;
    deletedEntries: number;
    activeSessions: number;
    totalSyncs: number;
    totalConflicts: number;
    totalResolutions: number;
    merkleRoot: string;
  } {
    const entries = Array.from(this.stateStore.values());

    return {
      nodeId: this.config.nodeId,
      localVersion: this.localVersion,
      totalEntries: this.stateStore.size,
      activeEntries: entries.filter(e => !e.deleted).length,
      deletedEntries: entries.filter(e => e.deleted).length,
      activeSessions: this.activeSessions.size,
      totalSyncs: this.totalSyncs,
      totalConflicts: this.totalConflicts,
      totalResolutions: this.totalResolutions,
      merkleRoot: this.merkleRoot
    };
  }
}

// ============================================================================
// CRDT IMPLEMENTATIONS
// ============================================================================

/**
 * G-Counter CRDT (Grow-only Counter)
 *
 * THEORETICAL: Conflict-free replicated counter
 *
 * Reference: Shapiro et al., "Conflict-free Replicated Data Types", 2011
 */
export class GCounter {
  private counts: Map<string, number> = new Map();

  constructor(private nodeId: string) {
    this.counts.set(nodeId, 0);
  }

  increment(amount: number = 1): void {
    const current = this.counts.get(this.nodeId) ?? 0;
    this.counts.set(this.nodeId, current + amount);
  }

  value(): number {
    let total = 0;
    for (const count of this.counts.values()) {
      total += count;
    }
    return total;
  }

  merge(other: GCounter): void {
    for (const [nodeId, count] of other.counts) {
      const current = this.counts.get(nodeId) ?? 0;
      this.counts.set(nodeId, Math.max(current, count));
    }
  }

  toJSON(): Record<string, number> {
    return Object.fromEntries(this.counts);
  }

  static fromJSON(nodeId: string, data: Record<string, number>): GCounter {
    const counter = new GCounter(nodeId);
    for (const [key, value] of Object.entries(data)) {
      counter.counts.set(key, value);
    }
    return counter;
  }
}

/**
 * PN-Counter CRDT (Positive-Negative Counter)
 *
 * THEORETICAL: Counter supporting increments and decrements
 */
export class PNCounter {
  private positive: GCounter;
  private negative: GCounter;

  constructor(private nodeId: string) {
    this.positive = new GCounter(nodeId);
    this.negative = new GCounter(nodeId);
  }

  increment(amount: number = 1): void {
    this.positive.increment(amount);
  }

  decrement(amount: number = 1): void {
    this.negative.increment(amount);
  }

  value(): number {
    return this.positive.value() - this.negative.value();
  }

  merge(other: PNCounter): void {
    this.positive.merge(other.positive);
    this.negative.merge(other.negative);
  }
}

/**
 * LWW-Register CRDT (Last-Writer-Wins Register)
 *
 * THEORETICAL: Register that resolves conflicts by timestamp
 */
export class LWWRegister<T> {
  private val: T;
  private ts: number;

  constructor(private nodeId: string, initialValue: T) {
    this.val = initialValue;
    this.ts = Date.now();
  }

  set(value: T, timestamp?: number): void {
    const newTs = timestamp ?? Date.now();
    if (newTs >= this.ts) {
      this.val = value;
      this.ts = newTs;
    }
  }

  value(): T {
    return this.val;
  }

  timestamp(): number {
    return this.ts;
  }

  merge(other: LWWRegister<T>): void {
    if (other.ts > this.ts) {
      this.val = other.val;
      this.ts = other.ts;
    }
  }
}

/**
 * G-Set CRDT (Grow-only Set)
 *
 * THEORETICAL: Set that only allows additions
 */
export class GSet<T> {
  private elements: Set<T> = new Set();

  add(element: T): void {
    this.elements.add(element);
  }

  has(element: T): boolean {
    return this.elements.has(element);
  }

  values(): T[] {
    return Array.from(this.elements);
  }

  merge(other: GSet<T>): void {
    for (const element of other.elements) {
      this.elements.add(element);
    }
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a state sync manager with default settings
 *
 * THEORETICAL: Factory for creating state sync instances
 */
export function createStateSync(nodeId: string): RhizomeStateSync {
  return new RhizomeStateSync({ nodeId });
}

/**
 * Create a high-consistency state sync manager
 *
 * THEORETICAL: Optimized for strong consistency requirements
 */
export function createHighConsistencySync(nodeId: string): RhizomeStateSync {
  return new RhizomeStateSync({
    nodeId,
    defaultConflictResolution: ConflictResolution.LAST_WRITE_WINS,
    enableMerkleTree: true,
    merkleBranching: 32,
    sessionTimeout: 60000
  });
}

// ============================================================================
// DISCLAIMER
// ============================================================================
/*
 * IMPORTANT NOTICE:
 *
 * This code is part of a THEORETICAL FRAMEWORK exploring concepts for
 * distributed state synchronization inspired by biological systems
 * and distributed systems research.
 *
 * It is NOT:
 * - A working distributed database
 * - A proven technology
 * - Ready for production deployment
 * - An energy distribution solution
 *
 * It IS:
 * - An educational exploration of CRDTs and eventual consistency
 * - Based on real research (Shapiro et al. 2011, Vogels 2009)
 * - A conceptual framework for community discussion
 *
 * References:
 * - Shapiro et al., "Conflict-free Replicated Data Types"
 *   SSS'11, DOI: 10.1007/978-3-642-24550-3_29
 * - Vogels, "Eventually Consistent", Communications of the ACM 2009
 *   DOI: 10.1145/1466443.1466448
 */
