/**
 * Types for the symbiosis layer
 */

import type { NodeId } from '@chicago-forest/shared-types';

/**
 * A forest represents a complete network instance
 */
export interface Forest {
  /** Unique forest identifier */
  id: string;

  /** Human-readable name */
  name: string;

  /** Forest description */
  description: string;

  /** Geographic region */
  region: string;

  /** Network information */
  network: ForestNetwork;

  /** Governance model */
  governance: GovernanceModel;

  /** Creation timestamp */
  createdAt: number;

  /** Last activity */
  lastSeen: number;

  /** Forest health score */
  health: number;
}

export interface ForestNetwork {
  /** Number of active nodes */
  nodeCount: number;

  /** Entry points for this forest */
  entryPoints: string[];

  /** Supported protocols */
  protocols: string[];

  /** Network capabilities */
  capabilities: string[];
}

export type GovernanceModel = 'democratic' | 'reputation' | 'stake' | 'hybrid';

/**
 * Detailed information about a forest
 */
export interface ForestInfo extends Forest {
  /** Public key for verification */
  publicKey: string;

  /** Federation agreements */
  federations: string[];

  /** Trust score from our perspective */
  trustScore: number;

  /** Resource availability */
  resources: {
    bandwidth: number;
    storage: number;
    compute: number;
  };
}

/**
 * Agreement between two forests to federate
 */
export interface FederationAgreement {
  /** Agreement ID */
  id: string;

  /** First forest */
  forestA: string;

  /** Second forest */
  forestB: string;

  /** Type of relationship */
  type: FederationType;

  /** Terms of the agreement */
  terms: FederationTerms;

  /** When the agreement was created */
  createdAt: number;

  /** When the agreement expires (0 = never) */
  expiresAt: number;

  /** Current status */
  status: AgreementStatus;

  /** Signatures from both forests */
  signatures: {
    forestA: string;
    forestB: string;
  };
}

export type FederationType =
  | 'mutual'      // Full bidirectional federation
  | 'one-way'     // One forest provides to another
  | 'limited'     // Specific services only
  | 'emergency';  // Temporary emergency access

export interface FederationTerms {
  /** Resource sharing rules */
  resourceSharing: ResourceSharingTerms;

  /** Traffic routing rules */
  routingPolicy: RoutingPolicy;

  /** Trust requirements */
  trustRequirements: TrustRequirements;

  /** Dispute resolution */
  disputeResolution: string;
}

export interface ResourceSharingTerms {
  /** Allow bandwidth sharing */
  shareBandwidth: boolean;

  /** Allow storage sharing */
  shareStorage: boolean;

  /** Allow compute sharing */
  shareCompute: boolean;

  /** Maximum resource percentage to share */
  maxSharePercentage: number;

  /** Credit exchange rate */
  creditExchangeRate: number;
}

export interface RoutingPolicy {
  /** Allow transit traffic */
  allowTransit: boolean;

  /** Priority for federated traffic */
  priority: 'low' | 'normal' | 'high';

  /** Latency requirements */
  maxLatency: number;

  /** Bandwidth reservation */
  reservedBandwidth: number;
}

export interface TrustRequirements {
  /** Minimum trust score */
  minTrustScore: number;

  /** Required attestations */
  requiredAttestations: number;

  /** Verification interval */
  verificationInterval: number;
}

export type AgreementStatus =
  | 'proposed'    // Awaiting acceptance
  | 'active'      // Currently in effect
  | 'suspended'   // Temporarily halted
  | 'terminated'; // Permanently ended

/**
 * Configuration for a gateway node
 */
export interface GatewayConfig {
  /** Node ID of this gateway */
  nodeId: NodeId;

  /** Forests this gateway connects */
  connectedForests: string[];

  /** Maximum connections per forest */
  maxConnectionsPerForest: number;

  /** Enable automatic peering */
  autoPeering: boolean;

  /** Traffic filtering rules */
  trafficRules: TrafficRule[];
}

export interface TrafficRule {
  /** Rule ID */
  id: string;

  /** Source forest (or '*' for any) */
  source: string;

  /** Destination forest (or '*' for any) */
  destination: string;

  /** Action to take */
  action: 'allow' | 'deny' | 'rate-limit';

  /** Rate limit (if action is rate-limit) */
  rateLimit?: number;
}

/**
 * A bridge connection between two forests
 */
export interface BridgeConnection {
  /** Bridge ID */
  id: string;

  /** Local forest */
  localForest: string;

  /** Remote forest */
  remoteForest: string;

  /** Local gateway node */
  localGateway: NodeId;

  /** Remote gateway node */
  remoteGateway: NodeId;

  /** Connection state */
  state: BridgeState;

  /** Metrics */
  metrics: BridgeMetrics;

  /** Established timestamp */
  establishedAt: number;
}

export type BridgeState =
  | 'connecting'
  | 'active'
  | 'degraded'
  | 'reconnecting'
  | 'failed';

export interface BridgeMetrics {
  /** Round-trip latency (ms) */
  latency: number;

  /** Throughput (bytes/sec) */
  throughput: number;

  /** Packet loss (%) */
  packetLoss: number;

  /** Messages exchanged */
  messagesExchanged: number;

  /** Uptime (%) */
  uptime: number;
}

/**
 * Events emitted by symbiosis layer
 */
export interface SymbiosisEvents {
  'forest:discovered': (forest: ForestInfo) => void;
  'forest:lost': (forestId: string) => void;
  'federation:proposed': (agreement: FederationAgreement) => void;
  'federation:accepted': (agreement: FederationAgreement) => void;
  'federation:rejected': (agreementId: string, reason: string) => void;
  'federation:terminated': (agreementId: string) => void;
  'bridge:established': (bridge: BridgeConnection) => void;
  'bridge:degraded': (bridge: BridgeConnection) => void;
  'bridge:failed': (bridgeId: string) => void;
  'gateway:online': (nodeId: NodeId) => void;
  'gateway:offline': (nodeId: NodeId) => void;
}
