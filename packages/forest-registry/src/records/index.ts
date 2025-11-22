/**
 * Record Manager - Creating and managing registry records
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  BaseRecord,
  ForestRecord,
  NodeRecord,
  ServiceRecord,
  RouteRecord,
  RecordType,
  RegistryConfig,
  RegistryEvents,
} from '../types';

const DEFAULT_CONFIG: RegistryConfig = {
  defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
  maxRecordsPerNode: 100,
  replicationFactor: 3,
  refreshInterval: 60 * 60 * 1000, // 1 hour
  cachingEnabled: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

/**
 * Manages registry records locally
 */
export class RecordManager extends EventEmitter<RegistryEvents> {
  private config: RegistryConfig;
  private localNodeId: NodeId;
  private records: Map<string, BaseRecord> = new Map();
  private recordsByOwner: Map<NodeId, Set<string>> = new Map();
  private expiryTimer?: ReturnType<typeof setInterval>;

  constructor(localNodeId: NodeId, config: Partial<RegistryConfig> = {}) {
    super();
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the record manager
   */
  start(): void {
    this.expiryTimer = setInterval(
      () => this.checkExpiry(),
      this.config.refreshInterval
    );
  }

  /**
   * Stop the record manager
   */
  stop(): void {
    if (this.expiryTimer) {
      clearInterval(this.expiryTimer);
      this.expiryTimer = undefined;
    }
  }

  /**
   * Create a forest record
   */
  createForestRecord(data: Omit<ForestRecord, keyof BaseRecord>): ForestRecord {
    const record: ForestRecord = {
      ...this.createBaseRecord('forest'),
      ...data,
    };
    return this.store(record) as ForestRecord;
  }

  /**
   * Create a node record
   */
  createNodeRecord(data: Omit<NodeRecord, keyof BaseRecord>): NodeRecord {
    const record: NodeRecord = {
      ...this.createBaseRecord('node'),
      ...data,
    };
    return this.store(record) as NodeRecord;
  }

  /**
   * Create a service record
   */
  createServiceRecord(data: Omit<ServiceRecord, keyof BaseRecord>): ServiceRecord {
    const record: ServiceRecord = {
      ...this.createBaseRecord('service'),
      ...data,
    };
    return this.store(record) as ServiceRecord;
  }

  /**
   * Create a route record
   */
  createRouteRecord(data: Omit<RouteRecord, keyof BaseRecord>): RouteRecord {
    const record: RouteRecord = {
      ...this.createBaseRecord('route'),
      ...data,
    };
    return this.store(record) as RouteRecord;
  }

  /**
   * Get a record by ID
   */
  get<T extends BaseRecord>(id: string): T | undefined {
    return this.records.get(id) as T | undefined;
  }

  /**
   * Update a record
   */
  update<T extends BaseRecord>(id: string, updates: Partial<T>): T | null {
    const existing = this.records.get(id);
    if (!existing || existing.owner !== this.localNodeId) {
      return null;
    }

    const updated: BaseRecord = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
      version: existing.version + 1,
    };

    this.records.set(id, updated);
    this.emit('record:updated', updated);
    return updated as T;
  }

  /**
   * Delete a record
   */
  delete(id: string): boolean {
    const record = this.records.get(id);
    if (!record || record.owner !== this.localNodeId) {
      return false;
    }

    this.records.delete(id);
    this.recordsByOwner.get(record.owner)?.delete(id);
    this.emit('record:deleted', id);
    return true;
  }

  /**
   * Get all records of a type
   */
  getByType<T extends BaseRecord>(type: RecordType): T[] {
    return Array.from(this.records.values())
      .filter((r): r is T => r.type === type);
  }

  /**
   * Get records by owner
   */
  getByOwner(owner: NodeId): BaseRecord[] {
    const ids = this.recordsByOwner.get(owner);
    if (!ids) return [];

    return Array.from(ids)
      .map(id => this.records.get(id))
      .filter((r): r is BaseRecord => r !== undefined);
  }

  /**
   * Import a record from another node
   */
  import(record: BaseRecord): boolean {
    // Verify signature would happen here
    if (this.records.has(record.id)) {
      const existing = this.records.get(record.id)!;
      if (record.version <= existing.version) {
        return false; // Older version
      }
    }

    this.store(record);
    return true;
  }

  /**
   * Export all local records
   */
  export(): BaseRecord[] {
    return Array.from(this.records.values())
      .filter(r => r.owner === this.localNodeId);
  }

  /**
   * Get total record count
   */
  get count(): number {
    return this.records.size;
  }

  // Private methods

  private createBaseRecord(type: RecordType): BaseRecord {
    const now = Date.now();
    return {
      type,
      id: this.generateId(type),
      owner: this.localNodeId,
      createdAt: now,
      updatedAt: now,
      expiresAt: now + this.config.defaultTTL,
      version: 1,
      signature: '', // Would be signed
    };
  }

  private store(record: BaseRecord): BaseRecord {
    this.records.set(record.id, record);

    if (!this.recordsByOwner.has(record.owner)) {
      this.recordsByOwner.set(record.owner, new Set());
    }
    this.recordsByOwner.get(record.owner)!.add(record.id);

    this.emit('record:created', record);
    return record;
  }

  private checkExpiry(): void {
    const now = Date.now();
    for (const [id, record] of this.records) {
      if (record.expiresAt > 0 && record.expiresAt < now) {
        this.records.delete(id);
        this.recordsByOwner.get(record.owner)?.delete(id);
        this.emit('record:expired', id);
      }
    }
  }

  private generateId(type: RecordType): string {
    const prefix = type.slice(0, 3);
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export { ForestRecord, NodeRecord, ServiceRecord, RouteRecord };
