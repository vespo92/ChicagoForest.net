/**
 * @chicago-forest/data-sync
 *
 * Agent 18: Synchronizer - Data Synchronization with CRDT
 *
 * Manage real-time data sync across nodes, handle conflicts using
 * Conflict-free Replicated Data Types (CRDTs), and ensure consistency
 * during network splits with anti-entropy protocols.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for the Chicago Plasma Forest Network project.
 *
 * Features:
 * - State-based CRDTs (G-Counter, PN-Counter, G-Set, OR-Set, LWW-Register, LWW-Map)
 * - Vector clock-based causality tracking
 * - Anti-entropy gossip protocol for eventual consistency
 * - Network partition detection and healing
 * - Event-driven synchronization with EventEmitter
 */

import { EventEmitter } from 'eventemitter3';

// Re-export all modules
export * from './sync';
export * from './conflict';
export * from './replication';
export * from './crdt';
export * from './anti-entropy';
export * from './partition';

// Import CRDT types for internal use
import { VectorClock, LWWMap, ORSet, PNCounter, CRDTDocument } from './crdt';
import { AntiEntropyProtocol, type DigestEntry } from './anti-entropy';
import { PartitionDetector, PartitionHealer, type PartitionEvent } from './partition';

/**
 * Sync state representing current synchronization status
 */
export interface SyncState {
  nodeId: string;
  vectorClock: Map<string, number>;
  lastSync: Date;
  pendingChanges: Change[];
  status: 'synced' | 'syncing' | 'behind' | 'ahead' | 'conflict' | 'partitioned';
}

/**
 * Change record for tracking modifications
 */
export interface Change {
  id: string;
  nodeId: string;
  timestamp: number;
  operation: 'create' | 'update' | 'delete';
  key: string;
  value?: unknown;
  previousValue?: unknown;
}

/**
 * Conflict resolution configuration
 */
export interface ConflictResolution {
  strategy: 'last-write-wins' | 'first-write-wins' | 'merge' | 'manual' | 'crdt';
  resolver?: (a: Change, b: Change) => Change;
}

/**
 * Configuration for the DataSynchronizer
 */
export interface SyncConfig {
  nodeId: string;
  peers: string[];
  conflictResolution: ConflictResolution;
  syncIntervalMs: number;
  maxRetries: number;
  enableCRDT: boolean;
  enableAntiEntropy: boolean;
  enablePartitionDetection: boolean;
  gossipIntervalMs: number;
  heartbeatIntervalMs: number;
}

/**
 * Events emitted by the DataSynchronizer
 */
export interface SyncEvents {
  'change:local': (change: Change) => void;
  'change:remote': (change: Change) => void;
  'sync:start': (peerId: string) => void;
  'sync:complete': (peerId: string, changesExchanged: number) => void;
  'sync:failed': (peerId: string, error: Error) => void;
  'conflict:detected': (key: string, local: Change, remote: Change) => void;
  'conflict:resolved': (key: string, winner: Change) => void;
  'partition:detected': (event: PartitionEvent) => void;
  'partition:healed': (event: PartitionEvent) => void;
  'status:changed': (oldStatus: SyncState['status'], newStatus: SyncState['status']) => void;
}

const DEFAULT_CONFIG: SyncConfig = {
  nodeId: '',
  peers: [],
  conflictResolution: { strategy: 'last-write-wins' },
  syncIntervalMs: 5000,
  maxRetries: 3,
  enableCRDT: true,
  enableAntiEntropy: true,
  enablePartitionDetection: true,
  gossipIntervalMs: 5000,
  heartbeatIntervalMs: 1000,
};

/**
 * DataSynchronizer - Main class for distributed data synchronization
 *
 * Combines CRDTs, anti-entropy protocol, and partition detection
 * for robust distributed data management.
 */
export class DataSynchronizer extends EventEmitter<SyncEvents> {
  private config: SyncConfig;
  private state: SyncState;
  private data: Map<string, { value: unknown; version: number }>;

  // CRDT support
  private crdtDocument?: CRDTDocument;
  private vectorClock: VectorClock;

  // Anti-entropy protocol
  private antiEntropy?: AntiEntropyProtocol;

  // Partition detection
  private partitionDetector?: PartitionDetector;
  private partitionHealer?: PartitionHealer;

  // Sync management
  private syncTimer?: ReturnType<typeof setInterval>;
  private isRunning: boolean = false;

  constructor(config: Partial<SyncConfig> = {}) {
    super();

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      nodeId: config.nodeId || `node-${Date.now()}`,
    };

    this.state = {
      nodeId: this.config.nodeId,
      vectorClock: new Map([[this.config.nodeId, 0]]),
      lastSync: new Date(),
      pendingChanges: [],
      status: 'synced',
    };

    this.data = new Map();
    this.vectorClock = new VectorClock();
    this.vectorClock.increment(this.config.nodeId);

    // Initialize CRDT document if enabled
    if (this.config.enableCRDT) {
      this.crdtDocument = new CRDTDocument(this.config.nodeId);
    }

    // Initialize anti-entropy protocol if enabled
    if (this.config.enableAntiEntropy) {
      this.antiEntropy = new AntiEntropyProtocol({
        nodeId: this.config.nodeId,
        gossipIntervalMs: this.config.gossipIntervalMs,
      });

      this.antiEntropy.on('entry:synced', (entry) => {
        this.handleRemoteEntry(entry);
      });

      this.antiEntropy.on('conflict:detected', (key, local, remote) => {
        this.emit('conflict:detected', key, this.digestToChange(local), this.digestToChange(remote));
      });
    }

    // Initialize partition detection if enabled
    if (this.config.enablePartitionDetection) {
      this.partitionDetector = new PartitionDetector({
        nodeId: this.config.nodeId,
        heartbeatIntervalMs: this.config.heartbeatIntervalMs,
      });

      this.partitionDetector.on('partition:detected', (event) => {
        this.setStatus('partitioned');
        this.emit('partition:detected', event);
      });

      this.partitionDetector.on('partition:healed', (event) => {
        this.emit('partition:healed', event);
        this.startHealing(event);
      });

      this.partitionHealer = new PartitionHealer(this.config.nodeId);
    }
  }

  /**
   * Start the synchronization engine
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Start anti-entropy
    if (this.antiEntropy) {
      this.antiEntropy.start(this.config.peers);
    }

    // Start partition detection
    if (this.partitionDetector) {
      this.partitionDetector.start(this.config.peers);
    }

    // Start periodic sync
    this.syncTimer = setInterval(() => {
      this.syncWithPeers();
    }, this.config.syncIntervalMs);
  }

  /**
   * Stop the synchronization engine
   */
  stop(): void {
    this.isRunning = false;

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }

    this.antiEntropy?.stop();
    this.partitionDetector?.stop();
  }

  /**
   * Set a value in the synchronized store
   */
  set(key: string, value: unknown): Change {
    const previousValue = this.data.get(key)?.value;
    this.vectorClock.increment(this.config.nodeId);
    const version = this.vectorClock.get(this.config.nodeId);

    this.state.vectorClock.set(this.config.nodeId, version);
    this.data.set(key, { value, version });

    // Update anti-entropy store
    if (this.antiEntropy) {
      this.antiEntropy.set(key, value);
    }

    const change: Change = {
      id: `${this.config.nodeId}-${version}`,
      nodeId: this.config.nodeId,
      timestamp: Date.now(),
      operation: previousValue === undefined ? 'create' : 'update',
      key,
      value,
      previousValue,
    };

    this.state.pendingChanges.push(change);
    this.setStatus('ahead');
    this.emit('change:local', change);

    return change;
  }

  /**
   * Get a value from the synchronized store
   */
  get(key: string): unknown {
    return this.data.get(key)?.value;
  }

  /**
   * Delete a value from the synchronized store
   */
  delete(key: string): Change | null {
    const existing = this.data.get(key);
    if (!existing) return null;

    this.vectorClock.increment(this.config.nodeId);
    const version = this.vectorClock.get(this.config.nodeId);
    this.state.vectorClock.set(this.config.nodeId, version);
    this.data.delete(key);

    const change: Change = {
      id: `${this.config.nodeId}-${version}`,
      nodeId: this.config.nodeId,
      timestamp: Date.now(),
      operation: 'delete',
      key,
      previousValue: existing.value,
    };

    this.state.pendingChanges.push(change);
    this.emit('change:local', change);

    return change;
  }

  /**
   * Apply a change from a remote node
   */
  applyChange(change: Change): boolean {
    const existing = this.data.get(change.key);

    // Check for conflicts
    if (existing && change.operation === 'create') {
      return this.resolveConflict(change, {
        ...change,
        value: existing.value,
        nodeId: this.config.nodeId,
      });
    }

    switch (change.operation) {
      case 'create':
      case 'update':
        this.data.set(change.key, {
          value: change.value,
          version: change.timestamp,
        });
        break;
      case 'delete':
        this.data.delete(change.key);
        break;
    }

    // Update vector clock
    const currentVersion = this.state.vectorClock.get(change.nodeId) || 0;
    if (change.timestamp > currentVersion) {
      this.state.vectorClock.set(change.nodeId, change.timestamp);
    }

    this.emit('change:remote', change);
    return true;
  }

  /**
   * Access CRDT document for complex data types
   */
  crdt(): CRDTDocument {
    if (!this.crdtDocument) {
      throw new Error('CRDT is not enabled. Set enableCRDT: true in config.');
    }
    return this.crdtDocument;
  }

  /**
   * Get a CRDT counter by name
   */
  counter(name: string): PNCounter {
    return this.crdt().counter(name);
  }

  /**
   * Get a CRDT set by name
   */
  orSet<T>(name: string): ORSet<T> {
    return this.crdt().set<T>(name);
  }

  /**
   * Get a CRDT map by name
   */
  lwwMap<V>(name: string): LWWMap<string, V> {
    return this.crdt().map<V>(name);
  }

  /**
   * Merge with another node's CRDT document
   */
  mergeCRDT(other: CRDTDocument): void {
    if (!this.crdtDocument) {
      throw new Error('CRDT is not enabled');
    }
    this.crdtDocument.merge(other);
  }

  /**
   * Handle heartbeat from a peer
   */
  handleHeartbeat(heartbeat: { sourceNode: string; timestamp: number; sequence: number; knownPeers: string[] }): void {
    if (this.partitionDetector) {
      this.partitionDetector.handleHeartbeat(heartbeat);
    }
  }

  /**
   * Record heartbeat failure for a peer
   */
  recordHeartbeatFailure(nodeId: string): void {
    if (this.partitionDetector) {
      this.partitionDetector.recordHeartbeatFailure(nodeId);
    }
  }

  /**
   * Generate a heartbeat to send to peers
   */
  generateHeartbeat(): { sourceNode: string; timestamp: number; sequence: number; knownPeers: string[] } | undefined {
    return this.partitionDetector?.generateHeartbeat();
  }

  /**
   * Resolve a conflict between two changes
   */
  private resolveConflict(incoming: Change, existing: Change): boolean {
    this.emit('conflict:detected', incoming.key, existing, incoming);

    let winner: Change;

    switch (this.config.conflictResolution.strategy) {
      case 'last-write-wins':
        winner = incoming.timestamp >= existing.timestamp ? incoming : existing;
        break;

      case 'first-write-wins':
        winner = incoming.timestamp <= existing.timestamp ? incoming : existing;
        break;

      case 'merge':
        if (this.config.conflictResolution.resolver) {
          winner = this.config.conflictResolution.resolver(incoming, existing);
        } else {
          winner = incoming.timestamp >= existing.timestamp ? incoming : existing;
        }
        break;

      case 'crdt':
        // With CRDT strategy, both values are kept in the CRDT
        // This just updates the main store with LWW
        winner = incoming.timestamp >= existing.timestamp ? incoming : existing;
        break;

      default:
        this.setStatus('conflict');
        return false;
    }

    this.data.set(winner.key, { value: winner.value, version: winner.timestamp });
    this.emit('conflict:resolved', winner.key, winner);

    return winner === incoming;
  }

  /**
   * Convert digest entry to change format
   */
  private digestToChange(entry: DigestEntry): Change {
    return {
      id: `${entry.key}-${entry.timestamp}`,
      nodeId: Object.keys(entry.vectorClock)[0] || 'unknown',
      timestamp: entry.timestamp,
      operation: 'update',
      key: entry.key,
      value: entry.value,
    };
  }

  /**
   * Handle a remote entry from anti-entropy
   */
  private handleRemoteEntry(entry: DigestEntry): void {
    const change = this.digestToChange(entry);
    this.applyChange(change);
  }

  /**
   * Start healing after partition is detected as healed
   */
  private async startHealing(event: PartitionEvent): Promise<void> {
    if (!this.partitionHealer) return;

    await this.partitionHealer.startHealing(
      event.partitionGroups,
      async (peerNodes) => {
        for (const peer of peerNodes) {
          await this.syncWithPeer(peer);
        }
      }
    );

    this.setStatus('synced');
  }

  /**
   * Sync with all configured peers
   */
  private async syncWithPeers(): Promise<void> {
    if (this.state.status === 'partitioned') return;

    const healthyPeers = this.partitionDetector?.getHealthyPeers() || [];
    const peersToSync = healthyPeers.map(p => p.nodeId);

    if (peersToSync.length === 0 && this.config.peers.length > 0) {
      // Fall back to configured peers if partition detection not available
      peersToSync.push(...this.config.peers);
    }

    for (const peer of peersToSync) {
      await this.syncWithPeer(peer);
    }
  }

  /**
   * Sync with a specific peer
   */
  private async syncWithPeer(peerId: string): Promise<void> {
    this.emit('sync:start', peerId);
    this.setStatus('syncing');

    try {
      // In a real implementation, this would exchange changes over the network
      // For now, we just mark pending changes as synced
      const changesExchanged = this.state.pendingChanges.length;

      this.state.pendingChanges = [];
      this.state.lastSync = new Date();
      this.setStatus('synced');

      this.emit('sync:complete', peerId, changesExchanged);
    } catch (error) {
      this.emit('sync:failed', peerId, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Update status and emit event
   */
  private setStatus(newStatus: SyncState['status']): void {
    if (this.state.status !== newStatus) {
      const oldStatus = this.state.status;
      this.state.status = newStatus;
      this.emit('status:changed', oldStatus, newStatus);
    }
  }

  /**
   * Get current sync state
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Get pending changes
   */
  getPendingChanges(): Change[] {
    return [...this.state.pendingChanges];
  }

  /**
   * Clear pending changes
   */
  clearPendingChanges(): void {
    this.state.pendingChanges = [];
    this.state.status = 'synced';
    this.state.lastSync = new Date();
  }

  /**
   * Check if synchronizer has quorum
   */
  hasQuorum(): boolean {
    return this.partitionDetector?.hasQuorum() ?? true;
  }

  /**
   * Get partition detection statistics
   */
  getPartitionStats(): ReturnType<PartitionDetector['getStats']> | null {
    return this.partitionDetector?.getStats() ?? null;
  }

  /**
   * Get anti-entropy statistics
   */
  getAntiEntropyStats(): ReturnType<AntiEntropyProtocol['getStats']> | null {
    return this.antiEntropy?.getStats() ?? null;
  }

  /**
   * Get all entries as an array
   */
  entries(): Array<{ key: string; value: unknown; version: number }> {
    return Array.from(this.data.entries()).map(([key, data]) => ({
      key,
      value: data.value,
      version: data.version,
    }));
  }

  /**
   * Get the number of entries
   */
  size(): number {
    return this.data.size;
  }

  /**
   * Check if a key exists
   */
  has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.data.keys());
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.data.clear();
    this.vectorClock = new VectorClock();
    this.vectorClock.increment(this.config.nodeId);
    this.state.pendingChanges = [];
    this.state.vectorClock = new Map([[this.config.nodeId, this.vectorClock.get(this.config.nodeId)]]);
  }
}

export default DataSynchronizer;
