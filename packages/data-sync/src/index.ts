/**
 * @chicago-forest/data-sync
 *
 * Agent 18: Synchronizer - Data Synchronization
 *
 * Manage real-time data sync across nodes, handle conflicts,
 * and ensure consistency during network splits.
 */

export * from './sync';
export * from './conflict';
export * from './replication';

export interface SyncState {
  nodeId: string;
  vectorClock: Map<string, number>;
  lastSync: Date;
  pendingChanges: Change[];
  status: 'synced' | 'syncing' | 'behind' | 'ahead' | 'conflict';
}

export interface Change {
  id: string;
  nodeId: string;
  timestamp: number;
  operation: 'create' | 'update' | 'delete';
  key: string;
  value?: unknown;
  previousValue?: unknown;
}

export interface ConflictResolution {
  strategy: 'last-write-wins' | 'first-write-wins' | 'merge' | 'manual';
  resolver?: (a: Change, b: Change) => Change;
}

export interface SyncConfig {
  nodeId: string;
  peers: string[];
  conflictResolution: ConflictResolution;
  syncIntervalMs: number;
  maxRetries: number;
}

export class DataSynchronizer {
  private config: SyncConfig;
  private state: SyncState;
  private data: Map<string, { value: unknown; version: number }>;

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      nodeId: config.nodeId || `node-${Date.now()}`,
      peers: config.peers || [],
      conflictResolution: config.conflictResolution || { strategy: 'last-write-wins' },
      syncIntervalMs: config.syncIntervalMs || 5000,
      maxRetries: config.maxRetries || 3,
    };

    this.state = {
      nodeId: this.config.nodeId,
      vectorClock: new Map([[this.config.nodeId, 0]]),
      lastSync: new Date(),
      pendingChanges: [],
      status: 'synced',
    };

    this.data = new Map();
  }

  set(key: string, value: unknown): Change {
    const previousValue = this.data.get(key)?.value;
    const version = (this.state.vectorClock.get(this.config.nodeId) || 0) + 1;

    this.state.vectorClock.set(this.config.nodeId, version);
    this.data.set(key, { value, version });

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
    this.state.status = 'ahead';

    return change;
  }

  get(key: string): unknown {
    return this.data.get(key)?.value;
  }

  delete(key: string): Change | null {
    const existing = this.data.get(key);
    if (!existing) return null;

    const version = (this.state.vectorClock.get(this.config.nodeId) || 0) + 1;
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
    return change;
  }

  applyChange(change: Change): boolean {
    // Check for conflicts
    const existing = this.data.get(change.key);

    if (existing && change.operation === 'create') {
      // Conflict: item already exists
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

    return true;
  }

  private resolveConflict(incoming: Change, existing: Change): boolean {
    switch (this.config.conflictResolution.strategy) {
      case 'last-write-wins':
        if (incoming.timestamp > existing.timestamp) {
          this.data.set(incoming.key, { value: incoming.value, version: incoming.timestamp });
          return true;
        }
        return false;

      case 'first-write-wins':
        return false; // Keep existing

      case 'merge':
        if (this.config.conflictResolution.resolver) {
          const resolved = this.config.conflictResolution.resolver(incoming, existing);
          this.data.set(resolved.key, { value: resolved.value, version: resolved.timestamp });
          return true;
        }
        return false;

      default:
        this.state.status = 'conflict';
        return false;
    }
  }

  getState(): SyncState {
    return { ...this.state };
  }

  getPendingChanges(): Change[] {
    return [...this.state.pendingChanges];
  }

  clearPendingChanges(): void {
    this.state.pendingChanges = [];
    this.state.status = 'synced';
    this.state.lastSync = new Date();
  }
}

export default DataSynchronizer;
