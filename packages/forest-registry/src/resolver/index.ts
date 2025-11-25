/**
 * Registry Resolver - Querying and resolving records
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  BaseRecord,
  ForestRecord,
  NodeRecord,
  ServiceRecord,
  RouteRecord,
  RegistryQuery,
  RegistryEvents,
} from '../types';

/**
 * Cache entry
 */
interface CacheEntry {
  record: BaseRecord;
  cachedAt: number;
  hits: number;
}

/**
 * Configuration for resolver
 */
export interface ResolverConfig {
  /** Enable caching */
  cachingEnabled: boolean;

  /** Cache TTL (ms) */
  cacheTTL: number;

  /** Maximum cache size */
  maxCacheSize: number;

  /** Query timeout (ms) */
  queryTimeout: number;

  /** Maximum query results */
  maxResults: number;
}

const DEFAULT_CONFIG: ResolverConfig = {
  cachingEnabled: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 10000,
  queryTimeout: 5000,
  maxResults: 100,
};

/**
 * Resolves registry queries across the network
 */
export class RegistryResolver extends EventEmitter<RegistryEvents> {
  private config: ResolverConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupTimer?: ReturnType<typeof setInterval>;

  // Callback to fetch records from network
  private fetchFromNetwork: (query: RegistryQuery) => Promise<BaseRecord[]> =
    async () => [];

  // Callback to get local records
  private getLocalRecords: (query: RegistryQuery) => BaseRecord[] = () => [];

  constructor(config: Partial<ResolverConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the resolver
   */
  start(): void {
    if (this.config.cachingEnabled) {
      this.cleanupTimer = setInterval(
        () => this.cleanupCache(),
        this.config.cacheTTL
      );
    }
  }

  /**
   * Stop the resolver
   */
  stop(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Set network fetch callback
   */
  setNetworkFetcher(fetcher: (query: RegistryQuery) => Promise<BaseRecord[]>): void {
    this.fetchFromNetwork = fetcher;
  }

  /**
   * Set local records provider
   */
  setLocalProvider(provider: (query: RegistryQuery) => BaseRecord[]): void {
    this.getLocalRecords = provider;
  }

  /**
   * Resolve a forest by name or ID
   */
  async resolveForest(nameOrId: string): Promise<ForestRecord | null> {
    // Check cache
    const cached = this.getFromCache(`forest:${nameOrId}`);
    if (cached && cached.type === 'forest') {
      return cached as ForestRecord;
    }

    // Query local and network
    const query: RegistryQuery = {
      type: 'forest',
      namePattern: nameOrId,
      limit: 1,
    };

    const results = await this.query<ForestRecord>(query);
    return results[0] ?? null;
  }

  /**
   * Resolve a node by ID
   */
  async resolveNode(nodeId: NodeId): Promise<NodeRecord | null> {
    const cached = this.getFromCache(`node:${nodeId}`);
    if (cached && cached.type === 'node') {
      return cached as NodeRecord;
    }

    const query: RegistryQuery = {
      type: 'node',
      owner: nodeId,
      limit: 1,
    };

    const results = await this.query<NodeRecord>(query);
    return results[0] ?? null;
  }

  /**
   * Find services of a type
   */
  async findServices(
    serviceType: string,
    forestId?: string
  ): Promise<ServiceRecord[]> {
    const query: RegistryQuery = {
      type: 'service',
      forestId,
      capabilities: [serviceType],
      limit: this.config.maxResults,
      sortBy: 'reputation',
    };

    return this.query<ServiceRecord>(query);
  }

  /**
   * Find routes between forests
   */
  async findRoutes(
    sourceForest: string,
    destForest: string
  ): Promise<RouteRecord[]> {
    const cacheKey = `route:${sourceForest}:${destForest}`;
    const cached = this.getCachedList(cacheKey);
    if (cached.length > 0) {
      return cached as RouteRecord[];
    }

    const query: RegistryQuery = {
      type: 'route',
      forestId: sourceForest,
      limit: 10,
    };

    const results = await this.query<RouteRecord>(query);
    return results.filter(r => r.destForest === destForest);
  }

  /**
   * General query
   */
  async query<T extends BaseRecord>(query: RegistryQuery): Promise<T[]> {
    // Get local results
    const localResults = this.getLocalRecords(query) as T[];

    // Fetch from network
    let networkResults: T[] = [];
    try {
      networkResults = await Promise.race([
        this.fetchFromNetwork(query) as Promise<T[]>,
        this.timeout(this.config.queryTimeout),
      ]);
    } catch {
      // Network timeout, use only local results
    }

    // Merge and deduplicate
    const merged = this.mergeResults([...localResults, ...networkResults]);

    // Apply filters
    let filtered = merged.filter(r => this.matchesQuery(r, query));

    // Sort
    if (query.sortBy) {
      filtered = this.sortResults(filtered, query.sortBy);
    }

    // Limit
    const limit = query.limit ?? this.config.maxResults;
    filtered = filtered.slice(0, limit);

    // Cache results
    if (this.config.cachingEnabled) {
      for (const record of filtered) {
        this.addToCache(record);
      }
    }

    return filtered as T[];
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hits: number; misses: number } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }
    return {
      size: this.cache.size,
      hits: totalHits,
      misses: 0, // Would need to track this
    };
  }

  // Private methods

  private getFromCache(key: string): BaseRecord | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.cachedAt > this.config.cacheTTL) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.record;
  }

  private getCachedList(keyPrefix: string): BaseRecord[] {
    const results: BaseRecord[] = [];
    for (const [key, entry] of this.cache) {
      if (key.startsWith(keyPrefix)) {
        if (Date.now() - entry.cachedAt <= this.config.cacheTTL) {
          results.push(entry.record);
          entry.hits++;
        }
      }
    }
    return results;
  }

  private addToCache(record: BaseRecord): void {
    const key = `${record.type}:${record.id}`;

    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      record,
      cachedAt: Date.now(),
      hits: 0,
    });
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruHits = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.hits < lruHits) {
        lruHits = entry.hits;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.cachedAt > this.config.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

  private mergeResults<T extends BaseRecord>(records: T[]): T[] {
    const byId = new Map<string, T>();
    for (const record of records) {
      const existing = byId.get(record.id);
      if (!existing || record.version > existing.version) {
        byId.set(record.id, record);
      }
    }
    return Array.from(byId.values());
  }

  private matchesQuery(record: BaseRecord, query: RegistryQuery): boolean {
    if (query.type && record.type !== query.type) return false;
    if (query.owner && record.owner !== query.owner) return false;

    if (query.forestId) {
      const rec = record as NodeRecord | ServiceRecord;
      if ('forestId' in rec && rec.forestId !== query.forestId) return false;
    }

    if (query.namePattern) {
      const rec = record as ForestRecord | NodeRecord | ServiceRecord;
      if ('name' in rec && rec.name) {
        const pattern = query.namePattern.replace(/\*/g, '.*');
        if (!new RegExp(`^${pattern}$`, 'i').test(rec.name)) return false;
      }
    }

    return true;
  }

  private sortResults<T extends BaseRecord>(records: T[], sortBy: string): T[] {
    return [...records].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const aName = ('name' in a ? a.name : a.id) as string;
          const bName = ('name' in b ? b.name : b.id) as string;
          return aName.localeCompare(bName);
        case 'reputation':
          const aRep = ('reputation' in a ? a.reputation : 0) as number;
          const bRep = ('reputation' in b ? b.reputation : 0) as number;
          return bRep - aRep;
        case 'updatedAt':
          return b.updatedAt - a.updatedAt;
        default:
          return 0;
      }
    });
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
  }
}

export { RegistryQuery };
