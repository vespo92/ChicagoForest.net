/**
 * @fileoverview Unified adapter interface for decentralized databases
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * NOT operational infrastructure. Provides a unified interface to switch between
 * GUN.js and OrbitDB backends.
 *
 * Design Pattern: Adapter Pattern + Strategy Pattern
 * - Adapter: Provides consistent interface across different backends
 * - Strategy: Allows switching backends at runtime
 */

import type { NodeId } from '@chicago-forest/shared-types';
import type {
  DecentralizedDB,
  DecentralizedSyncConfig,
  SyncBackend,
  SyncResult,
  SyncStats,
  SyncOp,
  ConnectionState,
  RegistryRecord,
  GovernanceRecord,
} from '../types';
import { GUNAdapter, createGUNAdapter } from '../gun';
import { OrbitDBAdapter, createOrbitDBAdapter } from '../orbitdb';

// ============================================================================
// Hybrid Adapter (Uses both GUN and OrbitDB)
// ============================================================================

/**
 * Hybrid adapter that uses GUN for real-time sync and OrbitDB for persistent storage
 *
 * Strategy:
 * - GUN: Real-time updates, presence, ephemeral data
 * - OrbitDB: Persistent records, content-addressed history
 *
 * This provides the best of both worlds:
 * - GUN's instant sync and simple API
 * - OrbitDB's IPFS-backed immutable history
 */
export class HybridAdapter implements DecentralizedDB {
  private gun: GUNAdapter;
  private orbitdb: OrbitDBAdapter;
  private config: DecentralizedSyncConfig;
  private state: ConnectionState = 'disconnected';
  private initialized = false;

  constructor(config: DecentralizedSyncConfig) {
    this.config = config;
    this.gun = createGUNAdapter(config);
    this.orbitdb = createOrbitDBAdapter(config);
  }

  /**
   * Initialize both backends
   */
  async initialize(): Promise<void> {
    this.state = 'connecting';

    // Initialize both in parallel
    await Promise.all([
      this.gun.initialize(),
      this.orbitdb.initialize(),
    ]);

    // Forward events from both backends
    this.setupEventForwarding();

    this.state = 'connected';
    this.initialized = true;
  }

  /**
   * Forward events from child adapters
   */
  private setupEventForwarding(): void {
    // GUN events (real-time)
    this.gun.on('data:received', (key, value, from) => {
      // Also store in OrbitDB for persistence
      this.orbitdb.put(key, value).catch(() => {});
    });

    // OrbitDB events (persistent sync)
    this.orbitdb.on('sync:complete', (stats) => {
      // Sync OrbitDB data to GUN for real-time availability
    });
  }

  /**
   * Get - try GUN first (faster), fall back to OrbitDB
   */
  async get<T = unknown>(path: string): Promise<T | undefined> {
    // Try GUN first for speed
    const gunValue = await this.gun.get<T>(path);
    if (gunValue !== undefined) {
      return gunValue;
    }

    // Fall back to OrbitDB
    return this.orbitdb.get<T>(path);
  }

  /**
   * Put - write to both backends
   */
  async put<T = unknown>(path: string, value: T): Promise<SyncResult<T>> {
    // Write to both in parallel
    const [gunResult, orbitResult] = await Promise.all([
      this.gun.put(path, value),
      this.orbitdb.put(path, value),
    ]);

    // Return success if either succeeded
    return {
      success: gunResult.success || orbitResult.success,
      value,
      error: gunResult.success ? undefined : gunResult.error || orbitResult.error,
      stats: this.mergeStats(gunResult.stats, orbitResult.stats),
    };
  }

  /**
   * Delete from both backends
   */
  async delete(path: string): Promise<SyncResult<void>> {
    const [gunResult, orbitResult] = await Promise.all([
      this.gun.delete(path),
      this.orbitdb.delete(path),
    ]);

    return {
      success: gunResult.success && orbitResult.success,
      error: gunResult.error || orbitResult.error,
    };
  }

  /**
   * Subscribe - use GUN for real-time updates
   */
  subscribe<T = unknown>(
    path: string,
    callback: (value: T, meta: { origin: string; timestamp: number }) => void
  ): () => void {
    // GUN provides real-time updates
    return this.gun.subscribe(path, callback);
  }

  /**
   * Query - use OrbitDB for complete data
   */
  async query<T = unknown>(
    path: string,
    filter?: (value: T) => boolean
  ): Promise<T[]> {
    // OrbitDB has complete history
    return this.orbitdb.query(path, filter);
  }

  /**
   * Batch operations
   */
  async batch(ops: SyncOp[]): Promise<SyncResult<void>> {
    const [gunResult, orbitResult] = await Promise.all([
      this.gun.batch(ops),
      this.orbitdb.batch(ops),
    ]);

    return {
      success: gunResult.success && orbitResult.success,
      error: gunResult.error || orbitResult.error,
    };
  }

  /**
   * Sync both backends
   */
  async sync(): Promise<SyncStats> {
    const [gunStats, orbitStats] = await Promise.all([
      this.gun.sync(),
      this.orbitdb.sync(),
    ]);

    return this.mergeStats(gunStats, orbitStats)!;
  }

  /**
   * Get connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Close both backends
   */
  async close(): Promise<void> {
    await Promise.all([
      this.gun.close(),
      this.orbitdb.close(),
    ]);
    this.state = 'disconnected';
  }

  /**
   * Merge stats from both backends
   */
  private mergeStats(a?: SyncStats, b?: SyncStats): SyncStats | undefined {
    if (!a && !b) return undefined;
    if (!a) return b;
    if (!b) return a;

    return {
      keysProcessed: a.keysProcessed + b.keysProcessed,
      conflictsDetected: a.conflictsDetected + b.conflictsDetected,
      conflictsResolved: a.conflictsResolved + b.conflictsResolved,
      bytesTransferred: a.bytesTransferred + b.bytesTransferred,
      duration: Math.max(a.duration, b.duration),
      peers: [...new Set([...a.peers, ...b.peers])],
    };
  }

  // ===========================================================================
  // Domain-Specific Methods
  // ===========================================================================

  /**
   * Registry record operations (use both)
   */
  async putRegistryRecord(record: RegistryRecord): Promise<SyncResult<RegistryRecord>> {
    const path = `forest-registry/${record.type}/${record.id}`;
    return this.put(path, record);
  }

  async getRegistryRecord(
    type: RegistryRecord['type'],
    id: string
  ): Promise<RegistryRecord | undefined> {
    const path = `forest-registry/${type}/${id}`;
    return this.get<RegistryRecord>(path);
  }

  async queryRegistryRecords(
    type: RegistryRecord['type'],
    filter?: (record: RegistryRecord) => boolean
  ): Promise<RegistryRecord[]> {
    return this.orbitdb.queryRegistryRecords(type, filter);
  }

  /**
   * Governance record operations (use both)
   */
  async putGovernanceRecord(record: GovernanceRecord): Promise<SyncResult<GovernanceRecord>> {
    const path = `hive-mind/${record.forestId}/${record.type}/${record.id}`;
    return this.put(path, record);
  }

  async getGovernanceRecord(
    forestId: string,
    type: GovernanceRecord['type'],
    id: string
  ): Promise<GovernanceRecord | undefined> {
    const path = `hive-mind/${forestId}/${type}/${id}`;
    return this.get<GovernanceRecord>(path);
  }

  async queryGovernanceRecords(
    forestId: string,
    type: GovernanceRecord['type'],
    filter?: (record: GovernanceRecord) => boolean
  ): Promise<GovernanceRecord[]> {
    return this.orbitdb.queryGovernanceRecords(forestId, type, filter);
  }
}

// ============================================================================
// Adapter Factory
// ============================================================================

/**
 * Create a decentralized database adapter based on configuration
 */
export function createAdapter(config: Partial<DecentralizedSyncConfig>): DecentralizedDB {
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
  };

  switch (fullConfig.backend) {
    case 'gun':
      return createGUNAdapter(fullConfig);

    case 'orbitdb':
      return createOrbitDBAdapter(fullConfig);

    case 'hybrid':
      return new HybridAdapter(fullConfig);

    default:
      throw new Error(`Unknown backend: ${fullConfig.backend}`);
  }
}

/**
 * Create adapter for forest-registry
 */
export function createForestRegistryAdapter(
  nodeId: NodeId,
  backend: SyncBackend = 'gun',
  peers: string[] = []
): DecentralizedDB {
  return createAdapter({
    nodeId,
    backend,
    gun: {
      peers,
      localStorage: true,
      indexedDB: true,
      webRTC: true,
    },
    orbitdb: {
      directory: './orbitdb/forest-registry',
      accessController: 'orbitdb',
      replication: 5,
    },
  });
}

/**
 * Create adapter for hive-mind
 */
export function createHiveMindAdapter(
  nodeId: NodeId,
  backend: SyncBackend = 'gun',
  peers: string[] = []
): DecentralizedDB {
  return createAdapter({
    nodeId,
    backend,
    gun: {
      peers,
      localStorage: true,
      indexedDB: true,
      webRTC: true,
      sea: { enabled: true },
    },
    orbitdb: {
      directory: './orbitdb/hive-mind',
      accessController: 'orbitdb',
      replication: 3,
    },
  });
}

// ============================================================================
// Exports
// ============================================================================

export {
  GUNAdapter,
  OrbitDBAdapter,
  createGUNAdapter,
  createOrbitDBAdapter,
};
