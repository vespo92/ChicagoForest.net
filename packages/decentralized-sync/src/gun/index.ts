/**
 * @fileoverview GUN.js adapter for CRDT-based decentralized sync
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * NOT operational infrastructure. Based on real distributed systems research.
 *
 * GUN.js is a real, production-ready decentralized database:
 * @see https://gun.eco/ - Official GUN.js website
 * @see https://github.com/amark/gun - GUN.js GitHub repository
 *
 * GUN's internal CRDT is based on:
 * - HAM (Hypothetical Amnesia Machine) conflict resolution
 * - Convergent state through "greater-than" semantic ordering
 *
 * This adapter provides:
 * - Type-safe wrapper around GUN.js
 * - Integration with forest-registry and hive-mind
 * - Custom CRDT merging for Chicago Forest data types
 */

import EventEmitter3 from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  DecentralizedDB,
  DecentralizedSyncConfig,
  GUNConfig,
  SyncResult,
  SyncStats,
  SyncOp,
  SyncEvents,
  ConnectionState,
  VectorClock,
  RegistryRecord,
  GovernanceRecord,
} from '../types';
import {
  createVectorClock,
  incrementClock,
  mergeClock,
  createLWWRegister,
  mergeLWWRegister,
} from '../crdt';

// ============================================================================
// GUN Type Declarations
// ============================================================================

/**
 * GUN instance type (simplified for our use case)
 * Full types available at @types/gun if needed
 */
interface GunInstance {
  get(path: string): GunChain;
  put(data: unknown, callback?: (ack: GunAck) => void): GunChain;
  set(data: unknown, callback?: (ack: GunAck) => void): GunChain;
  on(callback: (data: unknown, key: string) => void): void;
  once(callback: (data: unknown, key: string) => void): void;
  off(): void;
  map(): GunChain;
  opt(): { peers: Record<string, unknown> };
}

interface GunChain extends GunInstance {
  back(): GunChain;
}

interface GunAck {
  ok?: boolean;
  err?: string;
}

interface GunConstructor {
  new (options?: GUNConfig & { peers?: string[] }): GunInstance;
  SEA?: {
    pair(): Promise<SEAKeyPair>;
    sign(data: unknown, pair: SEAKeyPair): Promise<string>;
    verify(data: string, pair: SEAKeyPair): Promise<unknown>;
    encrypt(data: unknown, key: string): Promise<string>;
    decrypt(data: string, key: string): Promise<unknown>;
  };
}

interface SEAKeyPair {
  pub: string;
  priv: string;
  epub: string;
  epriv: string;
}

// ============================================================================
// GUN Database Adapter
// ============================================================================

/**
 * GUN.js database adapter implementing the DecentralizedDB interface
 */
export class GUNAdapter extends EventEmitter3<SyncEvents> implements DecentralizedDB {
  private gun: GunInstance | null = null;
  private config: DecentralizedSyncConfig;
  private state: ConnectionState = 'disconnected';
  private nodeId: NodeId;
  private vectorClock: VectorClock;
  private subscriptions: Map<string, () => void> = new Map();
  private pendingOps: SyncOp[] = [];
  private seaPair: SEAKeyPair | null = null;

  constructor(config: DecentralizedSyncConfig) {
    super();
    this.config = config;
    this.nodeId = config.nodeId;
    this.vectorClock = createVectorClock();
  }

  /**
   * Initialize GUN connection
   */
  async initialize(): Promise<void> {
    this.state = 'connecting';
    this.emit('connection:change', this.state);

    try {
      // Dynamic import for GUN (works in Node.js and browser)
      const Gun = await this.loadGUN();

      const gunConfig = this.config.gun || {
        peers: [],
        localStorage: true,
        indexedDB: true,
        webRTC: false,
      };

      // Initialize GUN instance
      this.gun = new Gun({
        peers: gunConfig.peers,
        localStorage: gunConfig.localStorage,
        indexedDB: gunConfig.indexedDB,
        radisk: gunConfig.radisk,
        multicast: gunConfig.multicast,
      } as GUNConfig & { peers?: string[] });

      // Initialize SEA if configured
      if (gunConfig.sea?.enabled && Gun.SEA) {
        if (gunConfig.sea.pair) {
          this.seaPair = gunConfig.sea.pair;
        } else {
          this.seaPair = await Gun.SEA.pair();
        }
      }

      // Monitor peer connections
      this.monitorPeers();

      this.state = 'connected';
      this.emit('connection:change', this.state);

      // Process any pending operations
      await this.processPendingOps();
    } catch (error) {
      this.state = 'error';
      this.emit('connection:change', this.state);
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Load GUN dynamically
   */
  private async loadGUN(): Promise<GunConstructor> {
    // In a real implementation, this would use dynamic import
    // For the theoretical framework, we simulate the interface
    const Gun = await import('gun').then(m => m.default || m);
    return Gun as unknown as GunConstructor;
  }

  /**
   * Monitor peer connections
   */
  private monitorPeers(): void {
    if (!this.gun) return;

    // Check peer status periodically
    setInterval(() => {
      if (!this.gun) return;

      const opt = this.gun.opt();
      const peers = Object.keys(opt.peers || {});

      for (const peerId of peers) {
        this.emit('peer:discovered', peerId);
      }
    }, 5000);
  }

  /**
   * Process pending offline operations
   */
  private async processPendingOps(): Promise<void> {
    if (this.pendingOps.length === 0) return;

    const ops = [...this.pendingOps];
    this.pendingOps = [];

    for (const op of ops) {
      try {
        if (op.type === 'put') {
          await this.put(op.path, op.data);
        } else if (op.type === 'delete') {
          await this.delete(op.path);
        }
      } catch {
        // Re-queue failed ops
        this.pendingOps.push(op);
      }
    }
  }

  /**
   * Get a value by path
   */
  async get<T = unknown>(path: string): Promise<T | undefined> {
    if (!this.gun) {
      throw new Error('GUN not initialized. Call initialize() first.');
    }

    return new Promise((resolve) => {
      const pathParts = path.split('/').filter(Boolean);
      let ref: GunChain = this.gun as GunChain;

      for (const part of pathParts) {
        ref = ref.get(part);
      }

      ref.once((data: unknown) => {
        if (data === null || data === undefined) {
          resolve(undefined);
          return;
        }

        // Remove GUN metadata
        const cleaned = this.cleanGunData(data);
        resolve(cleaned as T);
      });
    });
  }

  /**
   * Put a value at path
   */
  async put<T = unknown>(path: string, value: T): Promise<SyncResult<T>> {
    // Queue for offline-first mode
    if (this.config.offlineFirst && this.state !== 'connected') {
      const op: SyncOp = {
        id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        type: 'put',
        path,
        data: value,
        timestamp: Date.now(),
        origin: this.nodeId,
        version: this.vectorClock,
        retries: 0,
      };
      this.pendingOps.push(op);

      return {
        success: true,
        value,
        stats: {
          keysProcessed: 1,
          conflictsDetected: 0,
          conflictsResolved: 0,
          bytesTransferred: 0,
          duration: 0,
          peers: [],
        },
      };
    }

    if (!this.gun) {
      throw new Error('GUN not initialized. Call initialize() first.');
    }

    // Update vector clock
    this.vectorClock = incrementClock(this.vectorClock, this.nodeId);

    const startTime = Date.now();

    return new Promise((resolve) => {
      const pathParts = path.split('/').filter(Boolean);
      let ref: GunChain = this.gun as GunChain;

      for (const part of pathParts) {
        ref = ref.get(part);
      }

      // Wrap with metadata for CRDT
      const wrappedValue = {
        _value: value,
        _timestamp: Date.now(),
        _origin: this.nodeId,
        _version: this.vectorClock,
      };

      ref.put(wrappedValue, (ack: GunAck) => {
        const duration = Date.now() - startTime;

        if (ack.err) {
          resolve({
            success: false,
            error: new Error(ack.err),
            stats: {
              keysProcessed: 0,
              conflictsDetected: 0,
              conflictsResolved: 0,
              bytesTransferred: 0,
              duration,
              peers: [],
            },
          });
        } else {
          this.emit('data:synced', path, value);

          resolve({
            success: true,
            value,
            stats: {
              keysProcessed: 1,
              conflictsDetected: 0,
              conflictsResolved: 0,
              bytesTransferred: JSON.stringify(value).length,
              duration,
              peers: [],
            },
          });
        }
      });
    });
  }

  /**
   * Delete a value (create tombstone)
   */
  async delete(path: string): Promise<SyncResult<void>> {
    // In GUN, deletion is done by putting null
    // We use a tombstone pattern for CRDT
    return this.put(path, {
      _deleted: true,
      _deletedAt: Date.now(),
      _deletedBy: this.nodeId,
    }) as unknown as SyncResult<void>;
  }

  /**
   * Subscribe to changes on a path
   */
  subscribe<T = unknown>(
    path: string,
    callback: (value: T, meta: { origin: NodeId; timestamp: number }) => void
  ): () => void {
    if (!this.gun) {
      throw new Error('GUN not initialized. Call initialize() first.');
    }

    const pathParts = path.split('/').filter(Boolean);
    let ref: GunChain = this.gun as GunChain;

    for (const part of pathParts) {
      ref = ref.get(part);
    }

    const handler = (data: unknown) => {
      if (data === null || data === undefined) return;

      const cleaned = this.cleanGunData(data);

      // Extract metadata if present
      const wrapped = data as {
        _value?: T;
        _timestamp?: number;
        _origin?: NodeId;
      };

      const value = wrapped._value !== undefined ? wrapped._value : (cleaned as T);
      const meta = {
        origin: wrapped._origin || 'unknown',
        timestamp: wrapped._timestamp || Date.now(),
      };

      callback(value, meta);
      this.emit('data:received', path, value, meta.origin);
    };

    ref.on(handler);

    // Store unsubscribe function
    const unsubscribe = () => {
      ref.off();
      this.subscriptions.delete(path);
    };

    this.subscriptions.set(path, unsubscribe);
    return unsubscribe;
  }

  /**
   * Query with filter
   */
  async query<T = unknown>(
    path: string,
    filter?: (value: T) => boolean
  ): Promise<T[]> {
    if (!this.gun) {
      throw new Error('GUN not initialized. Call initialize() first.');
    }

    return new Promise((resolve) => {
      const pathParts = path.split('/').filter(Boolean);
      let ref: GunChain = this.gun as GunChain;

      for (const part of pathParts) {
        ref = ref.get(part);
      }

      const results: T[] = [];

      ref.map().once((data: unknown, key: string) => {
        if (data === null || data === undefined) return;
        if (key.startsWith('_')) return; // Skip metadata keys

        const cleaned = this.cleanGunData(data) as T;

        // Check for tombstones
        const asAny = data as { _deleted?: boolean };
        if (asAny._deleted) return;

        if (!filter || filter(cleaned)) {
          results.push(cleaned);
        }
      });

      // GUN doesn't have a "done" event for map().once()
      // Use timeout to collect results
      setTimeout(() => resolve(results), 100);
    });
  }

  /**
   * Execute batch operations
   */
  async batch(ops: SyncOp[]): Promise<SyncResult<void>> {
    const results = await Promise.all(
      ops.map(async (op) => {
        if (op.type === 'put') {
          return this.put(op.path, op.data);
        } else if (op.type === 'delete') {
          return this.delete(op.path);
        }
        return { success: true };
      })
    );

    const failed = results.filter((r) => !r.success);

    return {
      success: failed.length === 0,
      error: failed.length > 0 ? new Error(`${failed.length} operations failed`) : undefined,
      stats: {
        keysProcessed: ops.length,
        conflictsDetected: 0,
        conflictsResolved: 0,
        bytesTransferred: 0,
        duration: 0,
        peers: [],
      },
    };
  }

  /**
   * Force sync with peers
   */
  async sync(): Promise<SyncStats> {
    this.state = 'syncing';
    this.emit('connection:change', this.state);

    const startTime = Date.now();

    // In GUN, sync is automatic via peer connections
    // This method processes any pending offline operations
    await this.processPendingOps();

    this.state = 'connected';
    this.emit('connection:change', this.state);

    const stats: SyncStats = {
      keysProcessed: this.pendingOps.length,
      conflictsDetected: 0,
      conflictsResolved: 0,
      bytesTransferred: 0,
      duration: Date.now() - startTime,
      peers: [],
    };

    this.emit('sync:complete', stats);
    return stats;
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    // Unsubscribe all listeners
    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();

    this.gun = null;
    this.state = 'disconnected';
    this.emit('connection:change', this.state);
  }

  /**
   * Clean GUN metadata from data
   */
  private cleanGunData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.cleanGunData(item));
    }

    const result: Record<string, unknown> = {};
    const obj = data as Record<string, unknown>;

    for (const [key, value] of Object.entries(obj)) {
      // Skip GUN internal properties
      if (key === '_' || key === '#' || key === '>') continue;
      // Skip our metadata unless explicitly requested
      if (key.startsWith('_')) continue;

      result[key] = this.cleanGunData(value);
    }

    // If this was a wrapped value, extract it
    if ('_value' in obj) {
      return this.cleanGunData(obj._value);
    }

    return result;
  }

  // ===========================================================================
  // Domain-Specific Methods for Forest Registry
  // ===========================================================================

  /**
   * Store a registry record
   */
  async putRegistryRecord(record: RegistryRecord): Promise<SyncResult<RegistryRecord>> {
    const path = `forest-registry/${record.type}/${record.id}`;
    return this.put(path, record);
  }

  /**
   * Get a registry record
   */
  async getRegistryRecord(
    type: RegistryRecord['type'],
    id: string
  ): Promise<RegistryRecord | undefined> {
    const path = `forest-registry/${type}/${id}`;
    return this.get<RegistryRecord>(path);
  }

  /**
   * Query registry records by type
   */
  async queryRegistryRecords(
    type: RegistryRecord['type'],
    filter?: (record: RegistryRecord) => boolean
  ): Promise<RegistryRecord[]> {
    const path = `forest-registry/${type}`;
    return this.query<RegistryRecord>(path, filter);
  }

  /**
   * Subscribe to registry changes
   */
  subscribeToRegistry(
    type: RegistryRecord['type'],
    callback: (record: RegistryRecord, meta: { origin: NodeId; timestamp: number }) => void
  ): () => void {
    const path = `forest-registry/${type}`;
    return this.subscribe(path, callback);
  }

  // ===========================================================================
  // Domain-Specific Methods for Hive Mind
  // ===========================================================================

  /**
   * Store a governance record
   */
  async putGovernanceRecord(record: GovernanceRecord): Promise<SyncResult<GovernanceRecord>> {
    const path = `hive-mind/${record.forestId}/${record.type}/${record.id}`;
    return this.put(path, record);
  }

  /**
   * Get a governance record
   */
  async getGovernanceRecord(
    forestId: string,
    type: GovernanceRecord['type'],
    id: string
  ): Promise<GovernanceRecord | undefined> {
    const path = `hive-mind/${forestId}/${type}/${id}`;
    return this.get<GovernanceRecord>(path);
  }

  /**
   * Query governance records
   */
  async queryGovernanceRecords(
    forestId: string,
    type: GovernanceRecord['type'],
    filter?: (record: GovernanceRecord) => boolean
  ): Promise<GovernanceRecord[]> {
    const path = `hive-mind/${forestId}/${type}`;
    return this.query<GovernanceRecord>(path, filter);
  }

  /**
   * Subscribe to governance changes
   */
  subscribeToGovernance(
    forestId: string,
    type: GovernanceRecord['type'],
    callback: (record: GovernanceRecord, meta: { origin: NodeId; timestamp: number }) => void
  ): () => void {
    const path = `hive-mind/${forestId}/${type}`;
    return this.subscribe(path, callback);
  }

  /**
   * Merge governance records with CRDT semantics
   * Used for votes and signatures that accumulate
   */
  async mergeGovernanceRecord(record: GovernanceRecord): Promise<SyncResult<GovernanceRecord>> {
    const existing = await this.getGovernanceRecord(
      record.forestId,
      record.type,
      record.id
    );

    if (!existing) {
      return this.putGovernanceRecord(record);
    }

    // Merge using LWW for most fields, but union for signatures
    const merged: GovernanceRecord = {
      ...existing,
      ...record,
      updated: Math.max(existing.updated, record.updated),
      signatures: this.mergeSignatures(
        existing.signatures || [],
        record.signatures || []
      ),
    };

    return this.putGovernanceRecord(merged);
  }

  /**
   * Merge signature arrays (union by node ID)
   */
  private mergeSignatures(
    a: GovernanceRecord['signatures'],
    b: GovernanceRecord['signatures']
  ): GovernanceRecord['signatures'] {
    if (!a && !b) return undefined;
    if (!a) return b;
    if (!b) return a;

    const byNode = new Map<NodeId, GovernanceRecord['signatures'][0]>();

    for (const sig of [...a, ...b]) {
      const existing = byNode.get(sig.nodeId);
      if (!existing || sig.timestamp > existing.timestamp) {
        byNode.set(sig.nodeId, sig);
      }
    }

    return [...byNode.values()];
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a GUN adapter with default configuration
 */
export function createGUNAdapter(config: Partial<DecentralizedSyncConfig>): GUNAdapter {
  const fullConfig: DecentralizedSyncConfig = {
    backend: 'gun',
    nodeId: config.nodeId || `node-${Date.now()}`,
    defaultMergeStrategy: 'last-write-wins',
    offlineFirst: true,
    syncInterval: 5000,
    maxRetries: 3,
    retryBackoff: 2,
    debug: false,
    ...config,
    gun: {
      peers: [],
      localStorage: true,
      indexedDB: true,
      webRTC: false,
      ...config.gun,
    },
  };

  return new GUNAdapter(fullConfig);
}

/**
 * Create a GUN adapter for forest-registry
 */
export function createForestRegistryGUN(
  nodeId: NodeId,
  peers: string[] = []
): GUNAdapter {
  return createGUNAdapter({
    nodeId,
    gun: {
      peers,
      localStorage: true,
      indexedDB: true,
      webRTC: true,
    },
  });
}

/**
 * Create a GUN adapter for hive-mind governance
 */
export function createHiveMindGUN(
  nodeId: NodeId,
  peers: string[] = []
): GUNAdapter {
  return createGUNAdapter({
    nodeId,
    gun: {
      peers,
      localStorage: true,
      indexedDB: true,
      webRTC: true,
      sea: {
        enabled: true, // Enable encryption for sensitive governance data
      },
    },
  });
}

// ============================================================================
// Exports
// ============================================================================

export { GUNAdapter as default };
