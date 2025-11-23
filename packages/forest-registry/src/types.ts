/**
 * Types for the forest registry
 */

import type { NodeId } from '@chicago-forest/shared-types';

/**
 * Record types in the registry
 */
export type RecordType = 'forest' | 'node' | 'service' | 'route';

/**
 * Base record interface
 */
export interface BaseRecord {
  /** Record type */
  type: RecordType;

  /** Unique record ID */
  id: string;

  /** Record owner (who can update) */
  owner: NodeId;

  /** Creation timestamp */
  createdAt: number;

  /** Last update timestamp */
  updatedAt: number;

  /** Expiry timestamp (0 = never) */
  expiresAt: number;

  /** Record version */
  version: number;

  /** Cryptographic signature */
  signature: string;
}

/**
 * Forest record - describes a network
 */
export interface ForestRecord extends BaseRecord {
  type: 'forest';

  /** Forest name (human-readable) */
  name: string;

  /** Forest description */
  description: string;

  /** Geographic region */
  region: string;

  /** Bootstrap nodes for joining */
  bootstrapNodes: BootstrapNode[];

  /** Supported protocols */
  protocols: string[];

  /** Network capabilities */
  capabilities: string[];

  /** Governance model */
  governance: string;

  /** Public key for verification */
  publicKey: string;

  /** Federation whitelist */
  federationWhitelist?: string[];

  /** Network statistics */
  stats: ForestStats;
}

export interface BootstrapNode {
  /** Node ID */
  nodeId: NodeId;

  /** Connection addresses */
  addresses: string[];

  /** Reliability score */
  reliability: number;
}

export interface ForestStats {
  /** Active node count */
  nodeCount: number;

  /** Total bandwidth (bytes/sec) */
  totalBandwidth: number;

  /** Total storage (bytes) */
  totalStorage: number;

  /** Uptime percentage */
  uptime: number;
}

/**
 * Node record - describes a network participant
 */
export interface NodeRecord extends BaseRecord {
  type: 'node';

  /** Node's public key */
  publicKey: string;

  /** Human-readable name */
  name?: string;

  /** Forest this node belongs to */
  forestId: string;

  /** Connection addresses */
  addresses: string[];

  /** Node capabilities */
  capabilities: string[];

  /** Node role */
  role: NodeRole;

  /** Reputation score (0-1) */
  reputation: number;

  /** Online status */
  online: boolean;

  /** Last seen timestamp */
  lastSeen: number;

  /** Resource availability */
  resources: NodeResources;
}

export type NodeRole = 'hub' | 'bridge' | 'leaf' | 'gateway' | 'relay';

export interface NodeResources {
  /** Available bandwidth (bytes/sec) */
  bandwidth: number;

  /** Available storage (bytes) */
  storage: number;

  /** Available compute (FLOPS) */
  compute: number;

  /** Willingness to share (0-1) */
  shareability: number;
}

/**
 * Service record - describes an offered service
 */
export interface ServiceRecord extends BaseRecord {
  type: 'service';

  /** Service name */
  name: string;

  /** Service type */
  serviceType: ServiceType;

  /** Providing node */
  provider: NodeId;

  /** Forest this service is in */
  forestId: string;

  /** Service endpoint */
  endpoint: string;

  /** Service description */
  description: string;

  /** Service version */
  serviceVersion: string;

  /** Required capabilities to use */
  requirements: string[];

  /** Service pricing (credits per unit) */
  pricing?: ServicePricing;

  /** Health status */
  health: ServiceHealth;
}

export type ServiceType =
  | 'storage'      // Distributed storage
  | 'compute'      // Computation
  | 'relay'        // Traffic relay
  | 'gateway'      // Internet gateway
  | 'dns'          // Name resolution
  | 'messaging'    // Message passing
  | 'custom';      // Application-defined

export interface ServicePricing {
  /** Unit type */
  unit: 'bytes' | 'seconds' | 'requests' | 'custom';

  /** Credits per unit */
  pricePerUnit: number;

  /** Minimum purchase */
  minimum: number;
}

export interface ServiceHealth {
  /** Is service available */
  available: boolean;

  /** Response time (ms) */
  latency: number;

  /** Success rate (0-1) */
  successRate: number;

  /** Last health check */
  lastCheck: number;
}

/**
 * Route record - describes inter-forest connectivity
 */
export interface RouteRecord extends BaseRecord {
  type: 'route';

  /** Source forest */
  sourceForest: string;

  /** Destination forest */
  destForest: string;

  /** Gateway nodes */
  gateways: NodeId[];

  /** Route quality metrics */
  metrics: RouteMetrics;

  /** Route priority */
  priority: number;

  /** Is route active */
  active: boolean;
}

export interface RouteMetrics {
  /** Latency (ms) */
  latency: number;

  /** Bandwidth (bytes/sec) */
  bandwidth: number;

  /** Packet loss (%) */
  packetLoss: number;

  /** Hop count */
  hops: number;
}

/**
 * Registry configuration
 */
export interface RegistryConfig {
  /** Record TTL (ms) */
  defaultTTL: number;

  /** Maximum records per node */
  maxRecordsPerNode: number;

  /** Replication factor */
  replicationFactor: number;

  /** Refresh interval (ms) */
  refreshInterval: number;

  /** Enable caching */
  cachingEnabled: boolean;

  /** Cache TTL (ms) */
  cacheTTL: number;
}

/**
 * Registry query
 */
export interface RegistryQuery {
  /** Record type to search */
  type?: RecordType;

  /** Forest filter */
  forestId?: string;

  /** Owner filter */
  owner?: NodeId;

  /** Name pattern (supports wildcards) */
  namePattern?: string;

  /** Capability filter */
  capabilities?: string[];

  /** Maximum results */
  limit?: number;

  /** Sort order */
  sortBy?: 'name' | 'reputation' | 'updatedAt';
}

/**
 * Events emitted by registry
 */
export interface RegistryEvents {
  'record:created': (record: BaseRecord) => void;
  'record:updated': (record: BaseRecord) => void;
  'record:expired': (recordId: string) => void;
  'record:deleted': (recordId: string) => void;
  'forest:discovered': (forest: ForestRecord) => void;
  'node:online': (node: NodeRecord) => void;
  'node:offline': (nodeId: NodeId) => void;
  'service:available': (service: ServiceRecord) => void;
  'service:unavailable': (serviceId: string) => void;
  'sync:started': () => void;
  'sync:completed': (recordCount: number) => void;
}
