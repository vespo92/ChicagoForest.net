/**
 * Core types for the Mycelium Network
 */

import type { NodeId, PeerInfo } from '@chicago-forest/shared-types';

/**
 * Configuration for the mycelium network substrate
 */
export interface MyceliumConfig {
  /** Unique identifier for this mycelium instance */
  nodeId: NodeId;

  /** Maximum number of hyphal connections per node */
  maxHyphalConnections: number;

  /** Signal propagation TTL (time-to-live in hops) */
  signalTTL: number;

  /** Topology optimization interval in milliseconds */
  topologyOptimizationInterval: number;

  /** Growth rate limiter (new connections per minute) */
  growthRateLimit: number;

  /** Enable self-healing (automatic reconnection) */
  selfHealingEnabled: boolean;

  /** Bootstrap nodes for initial network discovery */
  bootstrapNodes: string[];
}

/**
 * A hyphal path represents a connection route between nodes,
 * like the fungal highways that connect trees underground
 */
export interface HyphalPath {
  /** Unique identifier for this pathway */
  id: string;

  /** Source node */
  source: NodeId;

  /** Destination node */
  destination: NodeId;

  /** Intermediate nodes in the path */
  hops: NodeId[];

  /** Path quality metrics */
  metrics: PathMetrics;

  /** Path state */
  state: HyphalState;

  /** When this path was established */
  establishedAt: number;

  /** Last activity timestamp */
  lastActivity: number;
}

export interface PathMetrics {
  /** Round-trip latency in milliseconds */
  latency: number;

  /** Available bandwidth in bytes/second */
  bandwidth: number;

  /** Packet loss percentage (0-100) */
  packetLoss: number;

  /** Path reliability score (0-1) */
  reliability: number;

  /** Number of hops */
  hopCount: number;
}

export type HyphalState =
  | 'growing'      // Path is being established
  | 'active'       // Path is healthy and active
  | 'stressed'     // Path is degraded but functional
  | 'dormant'      // Path is inactive but can be revived
  | 'dying'        // Path is failing
  | 'dead';        // Path has failed

/**
 * Signal types that propagate through the mycelium
 */
export type SignalType =
  | 'discovery'    // New node announcement
  | 'heartbeat'    // Keepalive signal
  | 'alert'        // Warning about network issues
  | 'nutrient'     // Resource availability update
  | 'governance'   // Voting/consensus signal
  | 'growth'       // Network expansion coordination
  | 'defense'      // Security threat notification
  | 'custom';      // Application-defined signal

export interface Signal {
  /** Signal type */
  type: SignalType;

  /** Originating node */
  origin: NodeId;

  /** Signal payload */
  payload: unknown;

  /** Remaining TTL */
  ttl: number;

  /** Unique signal ID for deduplication */
  id: string;

  /** Creation timestamp */
  timestamp: number;

  /** Cryptographic signature */
  signature: string;
}

/**
 * Snapshot of current network topology
 */
export interface TopologySnapshot {
  /** Timestamp of this snapshot */
  timestamp: number;

  /** All known nodes */
  nodes: Map<NodeId, NodeInfo>;

  /** All active hyphal paths */
  paths: Map<string, HyphalPath>;

  /** Network health metrics */
  health: NetworkHealth;

  /** Topology shape classification */
  shape: TopologyShape;
}

export interface NodeInfo {
  /** Node identifier */
  id: NodeId;

  /** Peer information */
  peer: PeerInfo;

  /** Number of connections */
  connectionCount: number;

  /** Node role in topology */
  role: NodeRole;

  /** Resource availability */
  resources: ResourceInfo;

  /** Last seen timestamp */
  lastSeen: number;
}

export type NodeRole =
  | 'hub'          // Highly connected node
  | 'bridge'       // Connects different clusters
  | 'leaf'         // Edge node with few connections
  | 'gateway'      // Connects to other forests
  | 'relay';       // Primarily routes traffic

export interface ResourceInfo {
  /** Available bandwidth */
  bandwidth: number;

  /** Available storage */
  storage: number;

  /** Available compute */
  compute: number;

  /** Willingness to share (0-1) */
  shareability: number;
}

export interface NetworkHealth {
  /** Overall health score (0-100) */
  score: number;

  /** Number of active nodes */
  activeNodes: number;

  /** Average path reliability */
  avgReliability: number;

  /** Network partition risk */
  partitionRisk: number;

  /** Growth rate (nodes per hour) */
  growthRate: number;
}

export type TopologyShape =
  | 'mesh'         // Highly interconnected
  | 'ring'         // Circular topology
  | 'star'         // Hub and spoke
  | 'tree'         // Hierarchical
  | 'random'       // No clear pattern
  | 'small-world'; // Clustered with shortcuts

/**
 * Growth patterns for network expansion
 */
export type GrowthPattern =
  | 'organic'      // Natural, unstructured growth
  | 'directed'     // Targeted expansion toward resources
  | 'defensive'    // Growth to improve redundancy
  | 'exploratory'  // Probing new areas
  | 'consolidation'; // Strengthening existing connections

export interface GrowthDirective {
  /** Growth pattern to follow */
  pattern: GrowthPattern;

  /** Target regions or nodes */
  targets: string[];

  /** Growth priority (0-1) */
  priority: number;

  /** Maximum new connections */
  maxConnections: number;

  /** Time limit for growth phase */
  deadline: number;
}

/**
 * Events emitted by the mycelium network
 */
export interface MyceliumEvents {
  'path:established': (path: HyphalPath) => void;
  'path:degraded': (path: HyphalPath) => void;
  'path:healed': (path: HyphalPath) => void;
  'path:died': (pathId: string) => void;
  'signal:received': (signal: Signal) => void;
  'signal:propagated': (signal: Signal, hops: number) => void;
  'topology:changed': (snapshot: TopologySnapshot) => void;
  'node:discovered': (node: NodeInfo) => void;
  'node:lost': (nodeId: NodeId) => void;
  'growth:started': (directive: GrowthDirective) => void;
  'growth:completed': (directive: GrowthDirective) => void;
  'health:warning': (health: NetworkHealth) => void;
  'health:critical': (health: NetworkHealth) => void;
}
