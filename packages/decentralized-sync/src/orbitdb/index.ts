/**
 * @fileoverview OrbitDB adapter for CRDT-based decentralized sync
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * NOT operational infrastructure. Based on real distributed systems research.
 *
 * OrbitDB is a real, production-ready peer-to-peer database:
 * @see https://orbitdb.org/ - Official OrbitDB website
 * @see https://github.com/orbitdb/orbitdb - OrbitDB GitHub repository
 *
 * OrbitDB provides several database types:
 * - Log: Append-only log with traversable history
 * - Feed: Same as log, but entries can be removed
 * - KeyValue: Key-value store
 * - Docs: Document store with JSON documents
 * - Counter: CRDT counter
 *
 * Built on IPFS/Helia for content-addressed storage and libp2p for networking.
 *
 * @see https://github.com/ipfs/helia - Helia IPFS implementation
 */

import EventEmitter3 from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  DecentralizedDB,
  DecentralizedSyncConfig,
  OrbitDBConfig,
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
} from '../crdt';

// ============================================================================
// OrbitDB Type Declarations
// ============================================================================

/**
 * OrbitDB database types
 */
type OrbitDBType = 'keyvalue' | 'log' | 'feed' | 'docs' | 'counter';

/**
 * OrbitDB instance (simplified)
 */
interface OrbitDBInstance {
  open<T = unknown>(name: string, options?: OrbitDBOpenOptions): Promise<OrbitDBDatabase<T>>;
  stop(): Promise<void>;
  id: string;
  identity: OrbitDBIdentity;
}

interface OrbitDBOpenOptions {
  type?: OrbitDBType;
  create?: boolean;
  overwrite?: boolean;
  directory?: string;
  AccessController?: unknown;
  replicate?: boolean;
}

interface OrbitDBIdentity {
  id: string;
  publicKey: string;
  signatures: {
    id: string;
    publicKey: string;
  };
}

/**
 * OrbitDB database base interface
 */
interface OrbitDBDatabase<T = unknown> {
  address: { toString(): string };
  type: OrbitDBType;
  close(): Promise<void>;
  drop(): Promise<void>;
  load(amount?: number): Promise<void>;

  // Events
  events: EventEmitter3<{
    replicated: () => void;
    replicate: (address: string) => void;
    'replicate.progress': (address: string, hash: string, entry: unknown, progress: number, have: number) => void;
    load: (address: string) => void;
    'load.progress': (address: string, hash: string, entry: unknown, progress: number, total: number) => void;
    ready: (address: string) => void;
    write: (address: string, entry: unknown, heads: unknown[]) => void;
  }>;

  // KeyValue methods
  get?(key: string): T | undefined;
  put?(key: string, value: T): Promise<string>;
  del?(key: string): Promise<string>;
  all?(): Record<string, T>;

  // Docs methods
  query?(mapper: (doc: T) => boolean): T[];

  // Log/Feed methods
  add?(data: T): Promise<string>;
  iterator?(options?: { limit?: number; reverse?: boolean }): IterableIterator<{ payload: { value: T } }>;

  // Counter methods
  inc?(value?: number): Promise<string>;
  value?: number;
}

/**
 * Helia IPFS node interface (simplified)
 */
interface HeliaNode {
  start(): Promise<void>;
  stop(): Promise<void>;
  libp2p: {
    peerId: { toString(): string };
    getConnections(): Array<{ remotePeer: { toString(): string } }>;
  };
}

// ============================================================================
// OrbitDB Database Adapter
// ============================================================================

/**
 * OrbitDB adapter implementing the DecentralizedDB interface
 */
export class OrbitDBAdapter extends EventEmitter3<SyncEvents> implements DecentralizedDB {
  private helia: HeliaNode | null = null;
  private orbitdb: OrbitDBInstance | null = null;
  private databases: Map<string, OrbitDBDatabase> = new Map();
  private config: DecentralizedSyncConfig;
  private state: ConnectionState = 'disconnected';
  private nodeId: NodeId;
  private vectorClock: VectorClock;
  private subscriptions: Map<string, () => void> = new Map();
  private pendingOps: SyncOp[] = [];

  constructor(config: DecentralizedSyncConfig) {
    super();
    this.config = config;
    this.nodeId = config.nodeId;
    this.vectorClock = createVectorClock();
  }

  /**
   * Initialize OrbitDB with Helia
   */
  async initialize(): Promise<void> {
    this.state = 'connecting';
    this.emit('connection:change', this.state);

    try {
      // Initialize Helia (IPFS implementation)
      this.helia = await this.createHeliaNode();
      await this.helia.start();

      // Initialize OrbitDB
      this.orbitdb = await this.createOrbitDB();

      // Monitor peer connections
      this.monitorPeers();

      this.state = 'connected';
      this.emit('connection:change', this.state);

      // Process pending operations
      await this.processPendingOps();
    } catch (error) {
      this.state = 'error';
      this.emit('connection:change', this.state);
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Create Helia IPFS node
   */
  private async createHeliaNode(): Promise<HeliaNode> {
    const { createHelia } = await import('helia');
    const { createLibp2p } = await import('libp2p');
    const { webSockets } = await import('@libp2p/websockets');
    const { MemoryBlockstore } = await import('blockstore-core');

    const orbitConfig = this.config.orbitdb || {
      directory: './orbitdb',
      accessController: 'orbitdb',
      replication: 3,
    };

    const libp2p = await createLibp2p({
      transports: [webSockets()],
      ...(orbitConfig.ipfs?.bootstrap?.length && {
        peerDiscovery: [], // Configure bootstrap peers
      }),
    });

    const helia = await createHelia({
      libp2p,
      blockstore: new MemoryBlockstore(),
    });

    return helia as unknown as HeliaNode;
  }

  /**
   * Create OrbitDB instance
   */
  private async createOrbitDB(): Promise<OrbitDBInstance> {
    const { createOrbitDB } = await import('@orbitdb/core');

    if (!this.helia) {
      throw new Error('Helia not initialized');
    }

    const orbitdb = await createOrbitDB({
      ipfs: this.helia,
      directory: this.config.orbitdb?.directory || './orbitdb',
    });

    return orbitdb as unknown as OrbitDBInstance;
  }

  /**
   * Monitor peer connections
   */
  private monitorPeers(): void {
    if (!this.helia) return;

    setInterval(() => {
      if (!this.helia) return;

      const connections = this.helia.libp2p.getConnections();
      for (const conn of connections) {
        const peerId = conn.remotePeer.toString();
        this.emit('peer:connected', peerId);
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
        this.pendingOps.push(op);
      }
    }
  }

  /**
   * Get or create a database for a path
   */
  private async getDatabase<T>(path: string): Promise<OrbitDBDatabase<T>> {
    const dbName = this.pathToDbName(path);

    if (this.databases.has(dbName)) {
      return this.databases.get(dbName) as OrbitDBDatabase<T>;
    }

    if (!this.orbitdb) {
      throw new Error('OrbitDB not initialized');
    }

    // Determine database type from path structure
    const dbType = this.getDbType(path);

    const db = await this.orbitdb.open<T>(dbName, {
      type: dbType,
      create: true,
      replicate: true,
    });

    // Set up event listeners
    db.events.on('replicated', () => {
      this.emit('sync:complete', {
        keysProcessed: 1,
        conflictsDetected: 0,
        conflictsResolved: 0,
        bytesTransferred: 0,
        duration: 0,
        peers: [],
      });
    });

    db.events.on('write', (address, entry) => {
      this.emit('data:synced', path, entry);
    });

    await db.load();

    this.databases.set(dbName, db);
    return db as OrbitDBDatabase<T>;
  }

  /**
   * Convert path to database name
   */
  private pathToDbName(path: string): string {
    // Use first two path segments as db name
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return parts[0] || 'default';
  }

  /**
   * Get key within database from path
   */
  private pathToKey(path: string): string {
    const parts = path.split('/').filter(Boolean);
    return parts.slice(2).join('/') || 'root';
  }

  /**
   * Determine database type from path
   */
  private getDbType(path: string): OrbitDBType {
    // Use docs for governance (proposals, votes)
    if (path.includes('hive-mind') && path.includes('proposal')) {
      return 'docs';
    }
    // Use keyvalue for registry records
    if (path.includes('forest-registry')) {
      return 'keyvalue';
    }
    // Default to keyvalue
    return 'keyvalue';
  }

  /**
   * Get a value by path
   */
  async get<T = unknown>(path: string): Promise<T | undefined> {
    const db = await this.getDatabase<T>(path);
    const key = this.pathToKey(path);

    if (db.type === 'keyvalue' && db.get) {
      const value = db.get(key);
      return this.cleanOrbitDBData(value) as T | undefined;
    }

    if (db.type === 'docs' && db.query) {
      const results = db.query((doc: T) => {
        const asAny = doc as { id?: string };
        return asAny.id === key;
      });
      return results[0] as T | undefined;
    }

    return undefined;
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

    const startTime = Date.now();

    try {
      const db = await this.getDatabase<T>(path);
      const key = this.pathToKey(path);

      // Update vector clock
      this.vectorClock = incrementClock(this.vectorClock, this.nodeId);

      // Wrap with metadata
      const wrappedValue = {
        ...value as object,
        _timestamp: Date.now(),
        _origin: this.nodeId,
        _version: this.vectorClock,
      };

      if (db.type === 'keyvalue' && db.put) {
        await db.put(key, wrappedValue as T);
      } else if (db.type === 'docs' && db.put) {
        await db.put(key, { id: key, ...wrappedValue } as T);
      }

      this.emit('data:synced', path, value);

      return {
        success: true,
        value,
        stats: {
          keysProcessed: 1,
          conflictsDetected: 0,
          conflictsResolved: 0,
          bytesTransferred: JSON.stringify(value).length,
          duration: Date.now() - startTime,
          peers: [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        stats: {
          keysProcessed: 0,
          conflictsDetected: 0,
          conflictsResolved: 0,
          bytesTransferred: 0,
          duration: Date.now() - startTime,
          peers: [],
        },
      };
    }
  }

  /**
   * Delete a value (create tombstone)
   */
  async delete(path: string): Promise<SyncResult<void>> {
    const db = await this.getDatabase(path);
    const key = this.pathToKey(path);

    try {
      if (db.type === 'keyvalue' && db.del) {
        await db.del(key);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Subscribe to changes on a path
   */
  subscribe<T = unknown>(
    path: string,
    callback: (value: T, meta: { origin: NodeId; timestamp: number }) => void
  ): () => void {
    // Set up database event listener
    this.getDatabase<T>(path).then((db) => {
      const handler = () => {
        // Fetch latest value
        this.get<T>(path).then((value) => {
          if (value) {
            const wrapped = value as { _origin?: NodeId; _timestamp?: number };
            callback(value, {
              origin: wrapped._origin || 'unknown',
              timestamp: wrapped._timestamp || Date.now(),
            });
          }
        });
      };

      db.events.on('replicated', handler);
      db.events.on('write', handler);

      this.subscriptions.set(path, () => {
        db.events.removeListener('replicated', handler);
        db.events.removeListener('write', handler);
      });
    });

    return () => {
      const unsubscribe = this.subscriptions.get(path);
      if (unsubscribe) {
        unsubscribe();
        this.subscriptions.delete(path);
      }
    };
  }

  /**
   * Query with filter
   */
  async query<T = unknown>(
    path: string,
    filter?: (value: T) => boolean
  ): Promise<T[]> {
    const db = await this.getDatabase<T>(path);

    if (db.type === 'keyvalue' && db.all) {
      const all = db.all();
      const values = Object.values(all) as T[];

      const cleaned = values
        .map((v) => this.cleanOrbitDBData(v) as T)
        .filter((v) => v !== undefined);

      return filter ? cleaned.filter(filter) : cleaned;
    }

    if (db.type === 'docs' && db.query) {
      const results = db.query(filter || (() => true));
      return results.map((r) => this.cleanOrbitDBData(r) as T);
    }

    return [];
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
    };
  }

  /**
   * Force sync with peers
   */
  async sync(): Promise<SyncStats> {
    this.state = 'syncing';
    this.emit('connection:change', this.state);

    const startTime = Date.now();

    // Reload all databases to trigger replication
    for (const db of this.databases.values()) {
      await db.load();
    }

    // Process pending operations
    await this.processPendingOps();

    this.state = 'connected';
    this.emit('connection:change', this.state);

    const stats: SyncStats = {
      keysProcessed: this.databases.size,
      conflictsDetected: 0,
      conflictsResolved: 0,
      bytesTransferred: 0,
      duration: Date.now() - startTime,
      peers: this.getPeerIds(),
    };

    this.emit('sync:complete', stats);
    return stats;
  }

  /**
   * Get connected peer IDs
   */
  private getPeerIds(): string[] {
    if (!this.helia) return [];
    return this.helia.libp2p
      .getConnections()
      .map((c) => c.remotePeer.toString());
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

    // Close all databases
    for (const db of this.databases.values()) {
      await db.close();
    }
    this.databases.clear();

    // Stop OrbitDB
    if (this.orbitdb) {
      await this.orbitdb.stop();
      this.orbitdb = null;
    }

    // Stop Helia
    if (this.helia) {
      await this.helia.stop();
      this.helia = null;
    }

    this.state = 'disconnected';
    this.emit('connection:change', this.state);
  }

  /**
   * Clean OrbitDB metadata from data
   */
  private cleanOrbitDBData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.cleanOrbitDBData(item));
    }

    const result: Record<string, unknown> = {};
    const obj = data as Record<string, unknown>;

    for (const [key, value] of Object.entries(obj)) {
      // Skip metadata keys
      if (key.startsWith('_') && key !== '_id') continue;
      result[key] = this.cleanOrbitDBData(value);
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
   * Get the OrbitDB address for sharing
   */
  async getAddress(path: string): Promise<string> {
    const db = await this.getDatabase(path);
    return db.address.toString();
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create an OrbitDB adapter with default configuration
 */
export function createOrbitDBAdapter(config: Partial<DecentralizedSyncConfig>): OrbitDBAdapter {
  const fullConfig: DecentralizedSyncConfig = {
    backend: 'orbitdb',
    nodeId: config.nodeId || `node-${Date.now()}`,
    defaultMergeStrategy: 'last-write-wins',
    offlineFirst: true,
    syncInterval: 5000,
    maxRetries: 3,
    retryBackoff: 2,
    debug: false,
    ...config,
    orbitdb: {
      directory: './orbitdb',
      accessController: 'orbitdb',
      replication: 3,
      ...config.orbitdb,
    },
  };

  return new OrbitDBAdapter(fullConfig);
}

/**
 * Create an OrbitDB adapter for forest-registry
 */
export function createForestRegistryOrbitDB(
  nodeId: NodeId,
  directory = './orbitdb/forest-registry'
): OrbitDBAdapter {
  return createOrbitDBAdapter({
    nodeId,
    orbitdb: {
      directory,
      accessController: 'orbitdb',
      replication: 5, // Higher replication for registry
    },
  });
}

/**
 * Create an OrbitDB adapter for hive-mind governance
 */
export function createHiveMindOrbitDB(
  nodeId: NodeId,
  directory = './orbitdb/hive-mind'
): OrbitDBAdapter {
  return createOrbitDBAdapter({
    nodeId,
    orbitdb: {
      directory,
      accessController: 'orbitdb',
      replication: 3,
    },
  });
}

// ============================================================================
// Exports
// ============================================================================

export { OrbitDBAdapter as default };
