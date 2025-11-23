/**
 * @fileoverview Type definitions for CRDT-based decentralized sync
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * NOT operational infrastructure. Based on real distributed systems research:
 * - Shapiro et al. (2011) - "Conflict-free Replicated Data Types"
 * - Kleppmann et al. (2017) - "A Conflict-Free Replicated JSON Datatype"
 * - Van der Linde et al. (2016) - "Delta State Replicated Data Types"
 *
 * Inspired by:
 * - GUN.js (https://gun.eco/) - Decentralized graph database
 * - OrbitDB (https://orbitdb.org/) - Peer-to-peer databases for the distributed web
 *
 * @see https://crdt.tech/ for CRDT fundamentals
 */

import type { NodeId } from '@chicago-forest/shared-types';

// ============================================================================
// Core Sync Types
// ============================================================================

/**
 * Supported decentralized database backends
 */
export type SyncBackend = 'gun' | 'orbitdb' | 'hybrid';

/**
 * CRDT merge strategies for conflict resolution
 */
export type MergeStrategy =
  | 'last-write-wins'      // Timestamp-based, simplest
  | 'first-write-wins'     // Keep original value
  | 'multi-value'          // Keep all concurrent values (MV-Register)
  | 'counter'              // Numeric merge (G-Counter, PN-Counter)
  | 'set-union'            // Set merge (G-Set, OR-Set)
  | 'map-merge'            // Deep object merge (LWW-Map)
  | 'sequence'             // Ordered list merge (RGA)
  | 'custom';              // User-defined resolver

/**
 * Sync operation types
 */
export type SyncOperation =
  | 'put'      // Create or update
  | 'delete'   // Remove (tombstone)
  | 'merge'    // CRDT merge
  | 'batch';   // Multiple operations

/**
 * Connection state for sync backends
 */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'error';

// ============================================================================
// Vector Clock and Causality
// ============================================================================

/**
 * Vector clock for tracking causality across nodes
 * Maps node IDs to their logical timestamps
 */
export interface VectorClock {
  [nodeId: string]: number;
}

/**
 * Causality relationship between two vector clocks
 */
export type CausalityRelation =
  | 'before'      // A happened before B
  | 'after'       // A happened after B
  | 'concurrent'  // A and B are concurrent (conflict)
  | 'equal';      // A and B are identical

/**
 * Hybrid Logical Clock (HLC) for better timestamp resolution
 * Combines physical time with logical counter
 */
export interface HybridLogicalClock {
  /** Physical timestamp (milliseconds since epoch) */
  physical: number;
  /** Logical counter for same-millisecond ordering */
  logical: number;
  /** Origin node ID */
  nodeId: NodeId;
}

// ============================================================================
// CRDT Data Structures
// ============================================================================

/**
 * Base interface for all CRDT values
 */
export interface CRDTValue<T = unknown> {
  /** The actual value */
  value: T;
  /** Timestamp for LWW semantics */
  timestamp: number;
  /** Origin node that created this value */
  origin: NodeId;
  /** Version vector for causality tracking */
  version: VectorClock;
  /** Whether this is a tombstone (deleted) */
  deleted?: boolean;
}

/**
 * G-Counter (Grow-only Counter)
 * Only supports increment, never decrements
 */
export interface GCounter {
  type: 'g-counter';
  /** Per-node increment counts */
  counts: Record<NodeId, number>;
}

/**
 * PN-Counter (Positive-Negative Counter)
 * Supports both increment and decrement
 */
export interface PNCounter {
  type: 'pn-counter';
  /** Positive increments per node */
  positive: Record<NodeId, number>;
  /** Negative decrements per node */
  negative: Record<NodeId, number>;
}

/**
 * LWW-Register (Last-Write-Wins Register)
 * Simple value with timestamp-based resolution
 */
export interface LWWRegister<T = unknown> {
  type: 'lww-register';
  value: T;
  timestamp: number;
  origin: NodeId;
}

/**
 * MV-Register (Multi-Value Register)
 * Keeps all concurrent values until explicitly resolved
 */
export interface MVRegister<T = unknown> {
  type: 'mv-register';
  values: Array<{
    value: T;
    version: VectorClock;
    origin: NodeId;
  }>;
}

/**
 * G-Set (Grow-only Set)
 * Elements can only be added, never removed
 */
export interface GSet<T = unknown> {
  type: 'g-set';
  elements: Set<T>;
}

/**
 * OR-Set (Observed-Remove Set)
 * Elements can be added and removed with proper conflict resolution
 */
export interface ORSet<T = unknown> {
  type: 'or-set';
  /** Elements with their unique tags */
  elements: Map<T, Set<string>>;
  /** Tombstones for removed elements */
  tombstones: Map<T, Set<string>>;
}

/**
 * LWW-Map (Last-Write-Wins Map)
 * Nested object with per-field LWW semantics
 */
export interface LWWMap<T extends Record<string, unknown> = Record<string, unknown>> {
  type: 'lww-map';
  /** Per-field values with timestamps */
  fields: {
    [K in keyof T]: LWWRegister<T[K]>;
  };
}

/**
 * RGA (Replicated Growable Array)
 * Ordered list with insert/delete operations
 */
export interface RGA<T = unknown> {
  type: 'rga';
  /** Ordered elements with unique IDs */
  elements: Array<{
    id: string;
    value: T;
    deleted: boolean;
    origin: NodeId;
    timestamp: number;
  }>;
}

/**
 * Union type for all CRDT structures
 */
export type CRDTStructure<T = unknown> =
  | GCounter
  | PNCounter
  | LWWRegister<T>
  | MVRegister<T>
  | GSet<T>
  | ORSet<T>
  | LWWMap<T extends Record<string, unknown> ? T : never>
  | RGA<T>;

// ============================================================================
// Sync Configuration
// ============================================================================

/**
 * Configuration for the decentralized sync system
 */
export interface DecentralizedSyncConfig {
  /** Which backend(s) to use */
  backend: SyncBackend;

  /** Node identity */
  nodeId: NodeId;

  /** GUN-specific configuration */
  gun?: GUNConfig;

  /** OrbitDB-specific configuration */
  orbitdb?: OrbitDBConfig;

  /** Default merge strategy */
  defaultMergeStrategy: MergeStrategy;

  /** Enable offline-first mode */
  offlineFirst: boolean;

  /** Sync interval in milliseconds */
  syncInterval: number;

  /** Maximum retry attempts */
  maxRetries: number;

  /** Retry backoff multiplier */
  retryBackoff: number;

  /** Enable debug logging */
  debug: boolean;
}

/**
 * GUN.js specific configuration
 */
export interface GUNConfig {
  /** Peer URLs for relay servers */
  peers: string[];

  /** Local storage adapter */
  localStorage: boolean;

  /** IndexedDB storage */
  indexedDB: boolean;

  /** WebRTC for peer-to-peer */
  webRTC: boolean;

  /** Radix storage path (file-based) */
  radisk?: string;

  /** Multicast for LAN discovery */
  multicast?: boolean;

  /** SEA (Security, Encryption, Authorization) */
  sea?: {
    enabled: boolean;
    pair?: {
      pub: string;
      priv: string;
      epub: string;
      epriv: string;
    };
  };
}

/**
 * OrbitDB specific configuration
 */
export interface OrbitDBConfig {
  /** IPFS/Helia configuration */
  ipfs?: {
    /** Bootstrap peers */
    bootstrap: string[];
    /** Swarm addresses */
    swarm: string[];
    /** Enable relay */
    relay: boolean;
  };

  /** Database directory */
  directory: string;

  /** Access controller type */
  accessController: 'ipfs' | 'orbitdb' | 'custom';

  /** Replication factor */
  replication: number;
}

// ============================================================================
// Sync Events
// ============================================================================

/**
 * Events emitted by the sync system
 */
export interface SyncEvents {
  /** Connection state changed */
  'connection:change': (state: ConnectionState) => void;

  /** New peer discovered */
  'peer:discovered': (peerId: string) => void;

  /** Peer connected */
  'peer:connected': (peerId: string) => void;

  /** Peer disconnected */
  'peer:disconnected': (peerId: string) => void;

  /** Data received from peer */
  'data:received': (key: string, value: unknown, from: string) => void;

  /** Data synced successfully */
  'data:synced': (key: string, value: unknown) => void;

  /** Conflict detected */
  'conflict:detected': (key: string, local: unknown, remote: unknown) => void;

  /** Conflict resolved */
  'conflict:resolved': (key: string, resolved: unknown, strategy: MergeStrategy) => void;

  /** Sync error occurred */
  'error': (error: Error) => void;

  /** Full sync completed */
  'sync:complete': (stats: SyncStats) => void;
}

/**
 * Statistics from a sync operation
 */
export interface SyncStats {
  /** Total keys synced */
  keysProcessed: number;

  /** Conflicts detected */
  conflictsDetected: number;

  /** Conflicts resolved */
  conflictsResolved: number;

  /** Bytes transferred */
  bytesTransferred: number;

  /** Duration in milliseconds */
  duration: number;

  /** Peers involved */
  peers: string[];
}

// ============================================================================
// Sync Operations
// ============================================================================

/**
 * A queued sync operation
 */
export interface SyncOp {
  /** Unique operation ID */
  id: string;

  /** Operation type */
  type: SyncOperation;

  /** Data path/key */
  path: string;

  /** The data */
  data?: unknown;

  /** Timestamp when queued */
  timestamp: number;

  /** Origin node */
  origin: NodeId;

  /** Version vector */
  version: VectorClock;

  /** Retry count */
  retries: number;
}

/**
 * Result of a sync operation
 */
export interface SyncResult<T = unknown> {
  /** Whether the operation succeeded */
  success: boolean;

  /** The resulting value */
  value?: T;

  /** Error if failed */
  error?: Error;

  /** Whether a conflict occurred */
  conflict?: boolean;

  /** Merge strategy used */
  mergeStrategy?: MergeStrategy;

  /** Sync statistics */
  stats?: SyncStats;
}

// ============================================================================
// Database Interface
// ============================================================================

/**
 * Abstract interface for decentralized database operations
 */
export interface DecentralizedDB {
  /** Get a value by key */
  get<T = unknown>(path: string): Promise<T | undefined>;

  /** Set a value */
  put<T = unknown>(path: string, value: T): Promise<SyncResult<T>>;

  /** Delete a value (tombstone) */
  delete(path: string): Promise<SyncResult<void>>;

  /** Subscribe to changes on a path */
  subscribe<T = unknown>(
    path: string,
    callback: (value: T, meta: { origin: NodeId; timestamp: number }) => void
  ): () => void;

  /** Query with a filter */
  query<T = unknown>(
    path: string,
    filter?: (value: T) => boolean
  ): Promise<T[]>;

  /** Batch operations */
  batch(ops: SyncOp[]): Promise<SyncResult<void>>;

  /** Force sync with peers */
  sync(): Promise<SyncStats>;

  /** Get connection state */
  getState(): ConnectionState;

  /** Close the database */
  close(): Promise<void>;
}

// ============================================================================
// Forest Registry Types (Domain-Specific)
// ============================================================================

/**
 * Registry record types for forest-registry integration
 */
export type RegistryRecordType = 'forest' | 'node' | 'service' | 'route' | 'zone';

/**
 * A registry record stored in the decentralized database
 */
export interface RegistryRecord {
  /** Unique record ID */
  id: string;

  /** Record type */
  type: RegistryRecordType;

  /** Human-readable name */
  name: string;

  /** Record data */
  data: Record<string, unknown>;

  /** Owner node ID */
  owner: NodeId;

  /** Creation timestamp */
  created: number;

  /** Last update timestamp */
  updated: number;

  /** TTL in seconds (0 = no expiry) */
  ttl: number;

  /** Signature for verification */
  signature?: string;
}

// ============================================================================
// Hive Mind Types (Domain-Specific)
// ============================================================================

/**
 * Governance data types for hive-mind integration
 */
export type GovernanceDataType =
  | 'proposal'
  | 'vote'
  | 'delegation'
  | 'member'
  | 'constitution'
  | 'treasury';

/**
 * A governance record stored in the decentralized database
 */
export interface GovernanceRecord {
  /** Unique record ID */
  id: string;

  /** Record type */
  type: GovernanceDataType;

  /** Forest/community ID */
  forestId: string;

  /** Record data */
  data: Record<string, unknown>;

  /** Creator node ID */
  creator: NodeId;

  /** Creation timestamp */
  created: number;

  /** Last update timestamp */
  updated: number;

  /** Required signatures for validity */
  requiredSignatures?: number;

  /** Collected signatures */
  signatures?: Array<{
    nodeId: NodeId;
    signature: string;
    timestamp: number;
  }>;
}
