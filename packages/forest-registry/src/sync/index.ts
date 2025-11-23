/**
 * @fileoverview Decentralized sync integration for forest-registry
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * NOT operational infrastructure.
 *
 * Provides CRDT-based synchronization for registry records across the network:
 * - Forest records: Network identity and configuration
 * - Node records: Peer identity and capabilities
 * - Service records: Available services and endpoints
 * - Route records: Inter-forest connectivity
 *
 * Uses GUN.js and/or OrbitDB for decentralized storage and sync.
 */

import EventEmitter3 from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  ForestRecord,
  NodeRecord,
  ServiceRecord,
  RouteRecord,
} from '../types';

// ============================================================================
// Types
// ============================================================================

/**
 * Sync adapter interface (matches decentralized-sync package)
 */
interface SyncAdapter {
  get<T>(path: string): Promise<T | undefined>;
  put<T>(path: string, value: T): Promise<{ success: boolean }>;
  delete(path: string): Promise<{ success: boolean }>;
  subscribe<T>(
    path: string,
    callback: (value: T, meta: { origin: NodeId; timestamp: number }) => void
  ): () => void;
  query<T>(path: string, filter?: (value: T) => boolean): Promise<T[]>;
  sync(): Promise<{ keysProcessed: number }>;
  close(): Promise<void>;
}

/**
 * Sync configuration
 */
export interface RegistrySyncConfig {
  /** Node identity */
  nodeId: NodeId;
  /** Sync adapter (GUN or OrbitDB) */
  adapter: SyncAdapter;
  /** Sync interval in milliseconds */
  syncInterval?: number;
  /** Enable auto-sync */
  autoSync?: boolean;
}

/**
 * Events emitted by the sync manager
 */
export interface RegistrySyncEvents {
  'forest:created': (record: ForestRecord) => void;
  'forest:updated': (record: ForestRecord) => void;
  'forest:deleted': (id: string) => void;
  'node:created': (record: NodeRecord) => void;
  'node:updated': (record: NodeRecord) => void;
  'node:deleted': (id: string) => void;
  'service:created': (record: ServiceRecord) => void;
  'service:updated': (record: ServiceRecord) => void;
  'service:deleted': (id: string) => void;
  'route:created': (record: RouteRecord) => void;
  'route:updated': (record: RouteRecord) => void;
  'route:deleted': (id: string) => void;
  'sync:complete': (stats: { keysProcessed: number }) => void;
  'error': (error: Error) => void;
}

// ============================================================================
// Registry Sync Manager
// ============================================================================

/**
 * Manages decentralized sync for forest registry records
 */
export class RegistrySyncManager extends EventEmitter3<RegistrySyncEvents> {
  private config: Required<RegistrySyncConfig>;
  private adapter: SyncAdapter;
  private subscriptions: Map<string, () => void> = new Map();
  private syncTimer?: NodeJS.Timeout;
  private localCache: Map<string, unknown> = new Map();

  constructor(config: RegistrySyncConfig) {
    super();
    this.config = {
      syncInterval: 30000,
      autoSync: true,
      ...config,
    };
    this.adapter = config.adapter;
  }

  /**
   * Start the sync manager
   */
  async start(): Promise<void> {
    // Subscribe to all record types
    this.subscribeToForests();
    this.subscribeToNodes();
    this.subscribeToServices();
    this.subscribeToRoutes();

    // Start auto-sync if enabled
    if (this.config.autoSync) {
      this.startAutoSync();
    }

    // Initial sync
    await this.sync();
  }

  /**
   * Stop the sync manager
   */
  async stop(): Promise<void> {
    // Stop auto-sync
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }

    // Unsubscribe all
    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();

    // Close adapter
    await this.adapter.close();
  }

  /**
   * Force sync with peers
   */
  async sync(): Promise<void> {
    try {
      const stats = await this.adapter.sync();
      this.emit('sync:complete', stats);
    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // ===========================================================================
  // Forest Record Operations
  // ===========================================================================

  /**
   * Create or update a forest record
   */
  async putForest(record: ForestRecord): Promise<boolean> {
    const path = `registry/forests/${record.id}`;
    const result = await this.adapter.put(path, {
      ...record,
      updatedAt: Date.now(),
      updatedBy: this.config.nodeId,
    });

    if (result.success) {
      this.localCache.set(path, record);
    }

    return result.success;
  }

  /**
   * Get a forest record
   */
  async getForest(id: string): Promise<ForestRecord | undefined> {
    const path = `registry/forests/${id}`;

    // Check local cache first
    const cached = this.localCache.get(path) as ForestRecord | undefined;
    if (cached) return cached;

    return this.adapter.get<ForestRecord>(path);
  }

  /**
   * Query all forests
   */
  async queryForests(filter?: (record: ForestRecord) => boolean): Promise<ForestRecord[]> {
    return this.adapter.query<ForestRecord>('registry/forests', filter);
  }

  /**
   * Delete a forest record
   */
  async deleteForest(id: string): Promise<boolean> {
    const path = `registry/forests/${id}`;
    const result = await this.adapter.delete(path);

    if (result.success) {
      this.localCache.delete(path);
      this.emit('forest:deleted', id);
    }

    return result.success;
  }

  /**
   * Subscribe to forest changes
   */
  private subscribeToForests(): void {
    const unsubscribe = this.adapter.subscribe<ForestRecord>(
      'registry/forests',
      (record, meta) => {
        const path = `registry/forests/${record.id}`;
        const existing = this.localCache.get(path) as ForestRecord | undefined;

        this.localCache.set(path, record);

        if (existing) {
          this.emit('forest:updated', record);
        } else {
          this.emit('forest:created', record);
        }
      }
    );

    this.subscriptions.set('forests', unsubscribe);
  }

  // ===========================================================================
  // Node Record Operations
  // ===========================================================================

  /**
   * Create or update a node record
   */
  async putNode(record: NodeRecord): Promise<boolean> {
    const path = `registry/nodes/${record.id}`;
    const result = await this.adapter.put(path, {
      ...record,
      updatedAt: Date.now(),
      updatedBy: this.config.nodeId,
    });

    if (result.success) {
      this.localCache.set(path, record);
    }

    return result.success;
  }

  /**
   * Get a node record
   */
  async getNode(id: string): Promise<NodeRecord | undefined> {
    const path = `registry/nodes/${id}`;

    const cached = this.localCache.get(path) as NodeRecord | undefined;
    if (cached) return cached;

    return this.adapter.get<NodeRecord>(path);
  }

  /**
   * Query nodes by forest
   */
  async queryNodes(
    forestId?: string,
    filter?: (record: NodeRecord) => boolean
  ): Promise<NodeRecord[]> {
    const baseFilter = forestId
      ? (record: NodeRecord) => record.forestId === forestId
      : undefined;

    const combinedFilter = baseFilter && filter
      ? (record: NodeRecord) => baseFilter(record) && filter(record)
      : baseFilter || filter;

    return this.adapter.query<NodeRecord>('registry/nodes', combinedFilter);
  }

  /**
   * Delete a node record
   */
  async deleteNode(id: string): Promise<boolean> {
    const path = `registry/nodes/${id}`;
    const result = await this.adapter.delete(path);

    if (result.success) {
      this.localCache.delete(path);
      this.emit('node:deleted', id);
    }

    return result.success;
  }

  /**
   * Subscribe to node changes
   */
  private subscribeToNodes(): void {
    const unsubscribe = this.adapter.subscribe<NodeRecord>(
      'registry/nodes',
      (record, meta) => {
        const path = `registry/nodes/${record.id}`;
        const existing = this.localCache.get(path) as NodeRecord | undefined;

        this.localCache.set(path, record);

        if (existing) {
          this.emit('node:updated', record);
        } else {
          this.emit('node:created', record);
        }
      }
    );

    this.subscriptions.set('nodes', unsubscribe);
  }

  // ===========================================================================
  // Service Record Operations
  // ===========================================================================

  /**
   * Create or update a service record
   */
  async putService(record: ServiceRecord): Promise<boolean> {
    const path = `registry/services/${record.id}`;
    const result = await this.adapter.put(path, {
      ...record,
      updatedAt: Date.now(),
      updatedBy: this.config.nodeId,
    });

    if (result.success) {
      this.localCache.set(path, record);
    }

    return result.success;
  }

  /**
   * Get a service record
   */
  async getService(id: string): Promise<ServiceRecord | undefined> {
    const path = `registry/services/${id}`;

    const cached = this.localCache.get(path) as ServiceRecord | undefined;
    if (cached) return cached;

    return this.adapter.get<ServiceRecord>(path);
  }

  /**
   * Query services
   */
  async queryServices(
    nodeId?: string,
    filter?: (record: ServiceRecord) => boolean
  ): Promise<ServiceRecord[]> {
    const baseFilter = nodeId
      ? (record: ServiceRecord) => record.nodeId === nodeId
      : undefined;

    const combinedFilter = baseFilter && filter
      ? (record: ServiceRecord) => baseFilter(record) && filter(record)
      : baseFilter || filter;

    return this.adapter.query<ServiceRecord>('registry/services', combinedFilter);
  }

  /**
   * Delete a service record
   */
  async deleteService(id: string): Promise<boolean> {
    const path = `registry/services/${id}`;
    const result = await this.adapter.delete(path);

    if (result.success) {
      this.localCache.delete(path);
      this.emit('service:deleted', id);
    }

    return result.success;
  }

  /**
   * Subscribe to service changes
   */
  private subscribeToServices(): void {
    const unsubscribe = this.adapter.subscribe<ServiceRecord>(
      'registry/services',
      (record, meta) => {
        const path = `registry/services/${record.id}`;
        const existing = this.localCache.get(path) as ServiceRecord | undefined;

        this.localCache.set(path, record);

        if (existing) {
          this.emit('service:updated', record);
        } else {
          this.emit('service:created', record);
        }
      }
    );

    this.subscriptions.set('services', unsubscribe);
  }

  // ===========================================================================
  // Route Record Operations
  // ===========================================================================

  /**
   * Create or update a route record
   */
  async putRoute(record: RouteRecord): Promise<boolean> {
    const path = `registry/routes/${record.id}`;
    const result = await this.adapter.put(path, {
      ...record,
      updatedAt: Date.now(),
      updatedBy: this.config.nodeId,
    });

    if (result.success) {
      this.localCache.set(path, record);
    }

    return result.success;
  }

  /**
   * Get a route record
   */
  async getRoute(id: string): Promise<RouteRecord | undefined> {
    const path = `registry/routes/${id}`;

    const cached = this.localCache.get(path) as RouteRecord | undefined;
    if (cached) return cached;

    return this.adapter.get<RouteRecord>(path);
  }

  /**
   * Query routes
   */
  async queryRoutes(
    forestId?: string,
    filter?: (record: RouteRecord) => boolean
  ): Promise<RouteRecord[]> {
    const baseFilter = forestId
      ? (record: RouteRecord) =>
          record.sourceForestId === forestId || record.targetForestId === forestId
      : undefined;

    const combinedFilter = baseFilter && filter
      ? (record: RouteRecord) => baseFilter(record) && filter(record)
      : baseFilter || filter;

    return this.adapter.query<RouteRecord>('registry/routes', combinedFilter);
  }

  /**
   * Delete a route record
   */
  async deleteRoute(id: string): Promise<boolean> {
    const path = `registry/routes/${id}`;
    const result = await this.adapter.delete(path);

    if (result.success) {
      this.localCache.delete(path);
      this.emit('route:deleted', id);
    }

    return result.success;
  }

  /**
   * Subscribe to route changes
   */
  private subscribeToRoutes(): void {
    const unsubscribe = this.adapter.subscribe<RouteRecord>(
      'registry/routes',
      (record, meta) => {
        const path = `registry/routes/${record.id}`;
        const existing = this.localCache.get(path) as RouteRecord | undefined;

        this.localCache.set(path, record);

        if (existing) {
          this.emit('route:updated', record);
        } else {
          this.emit('route:created', record);
        }
      }
    );

    this.subscriptions.set('routes', unsubscribe);
  }

  // ===========================================================================
  // Auto-Sync
  // ===========================================================================

  /**
   * Start auto-sync timer
   */
  private startAutoSync(): void {
    this.syncTimer = setInterval(() => {
      this.sync().catch((error) => {
        this.emit('error', error);
      });
    }, this.config.syncInterval);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a registry sync manager
 *
 * @example
 * ```typescript
 * import { createRegistrySync } from '@chicago-forest/forest-registry/sync';
 * import { createForestRegistryGUN } from '@chicago-forest/decentralized-sync/gun';
 *
 * const adapter = createForestRegistryGUN('node-123', ['https://relay.example.com']);
 * await adapter.initialize();
 *
 * const sync = createRegistrySync({
 *   nodeId: 'node-123',
 *   adapter,
 * });
 *
 * await sync.start();
 *
 * // Create a forest record
 * await sync.putForest({
 *   id: 'chicago-forest',
 *   name: 'Chicago Plasma Forest',
 *   description: 'Community mesh network in Chicago',
 *   createdAt: Date.now(),
 * });
 *
 * // Subscribe to changes
 * sync.on('forest:updated', (record) => {
 *   console.log('Forest updated:', record.name);
 * });
 * ```
 */
export function createRegistrySync(config: RegistrySyncConfig): RegistrySyncManager {
  return new RegistrySyncManager(config);
}

// ============================================================================
// Exports
// ============================================================================

export default RegistrySyncManager;
