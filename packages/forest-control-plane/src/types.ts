/**
 * @chicago-forest/forest-control-plane - Type Definitions
 *
 * Types for the Forest mesh control plane: node management,
 * enrollment, mesh coordination, and bootstrap.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type {
  NodeCapability,
  PeerAddress,
  MeshRoutingProtocol,
  FrequencyBand,
  FirewallRule,
} from '@chicago-forest/shared-types';

// =============================================================================
// NODE REGISTRY
// =============================================================================

/** Status of a node in the Forest mesh */
export type ForestNodeStatus = 'pending' | 'active' | 'degraded' | 'offline' | 'deregistered';

/** Hardware profile reported by a node during registration */
export interface HardwareProfile {
  model: string;
  cpu: string;
  ramMb: number;
  flashMb: number;
  wirelessInterfaces: number;
  ethernetPorts: number;
  hasGps: boolean;
}

/** A registered Forest mesh node */
export interface ForestNode {
  /** Unique node identifier (forest-scoped) */
  nodeId: string;
  /** Human-readable name */
  name: string;
  /** Node capabilities */
  capabilities: NodeCapability[];
  /** Hardware description */
  hardware: HardwareProfile;
  /** Current status */
  status: ForestNodeStatus;
  /** WireGuard public key (from Headscale) */
  wgPublicKey: string;
  /** Headscale node ID (for cross-referencing) */
  headscaleNodeId?: string;
  /** IP addresses assigned by Headscale */
  ipAddresses: string[];
  /** Geographic coordinates (if GPS-equipped) */
  location?: { lat: number; lng: number };
  /** Last heartbeat timestamp (ISO 8601) */
  lastHeartbeat: string;
  /** Registration timestamp (ISO 8601) */
  registeredAt: string;
  /** Mesh neighbors (node IDs) */
  meshNeighbors: string[];
  /** Arbitrary metadata */
  metadata: Record<string, string>;
}

/** Request body for registering a new node */
export interface RegisterNodeRequest {
  nodeId: string;
  name: string;
  capabilities: NodeCapability[];
  hardware: HardwareProfile;
  wgPublicKey: string;
  headscaleNodeId?: string;
  ipAddresses?: string[];
  location?: { lat: number; lng: number };
  metadata?: Record<string, string>;
}

/** Heartbeat payload sent by nodes */
export interface HeartbeatPayload {
  status: ForestNodeStatus;
  uptime: number;
  load: number;
  meshNeighbors: string[];
  linkQualities?: Record<string, number>;
  metadata?: Record<string, string>;
}

// =============================================================================
// ENROLLMENT
// =============================================================================

/** Status of an enrollment token */
export type EnrollmentStatus = 'pending' | 'claimed' | 'expired' | 'revoked';

/** An enrollment record */
export interface EnrollmentRecord {
  /** Unique enrollment token */
  token: string;
  /** Node name to assign */
  nodeName: string;
  /** Capabilities to grant */
  capabilities: NodeCapability[];
  /** Headscale pre-auth key */
  headscaleAuthKey: string;
  /** Status */
  status: EnrollmentStatus;
  /** Node ID that claimed this enrollment (if claimed) */
  claimedBy?: string;
  /** Created timestamp */
  createdAt: string;
  /** Expiration timestamp */
  expiresAt: string;
  /** Claimed timestamp */
  claimedAt?: string;
}

/** Request body for creating an enrollment */
export interface CreateEnrollmentRequest {
  nodeName: string;
  capabilities?: NodeCapability[];
  /** Headscale user to create the pre-auth key under (default: "forest") */
  headscaleUser?: string;
  /** Token validity duration in hours (default: 24) */
  validityHours?: number;
}

/** Config bundle returned when a router claims an enrollment token */
export interface EnrollmentConfigBundle {
  /** Enrollment token */
  token: string;
  /** Headscale server URL */
  headscaleUrl: string;
  /** Headscale pre-auth key */
  headscaleAuthKey: string;
  /** Bootstrap peers to connect to */
  bootstrapPeers: PeerAddress[];
  /** batman-adv mesh configuration */
  meshConfig: MeshNodeConfig;
  /** Firewall rules */
  firewallRules: FirewallRule[];
  /** Forest control plane URL (for heartbeat + API) */
  controlPlaneUrl: string;
  /** Assigned node name */
  nodeName: string;
  /** Granted capabilities */
  capabilities: NodeCapability[];
}

// =============================================================================
// MESH COORDINATION
// =============================================================================

/** batman-adv mesh configuration pushed to nodes */
export interface MeshNodeConfig {
  protocol: MeshRoutingProtocol;
  interface: string;
  channel: number;
  essid: string;
  bssid?: string;
  band: FrequencyBand;
  mtu: number;
  hopPenalty?: number;
  origInterval?: number;
}

/** A link between two mesh nodes */
export interface MeshLink {
  sourceNodeId: string;
  targetNodeId: string;
  quality: number;
  lastSeen: string;
}

/** Full mesh topology graph */
export interface MeshTopology {
  nodes: Array<{
    nodeId: string;
    name: string;
    status: ForestNodeStatus;
    ipAddresses: string[];
    location?: { lat: number; lng: number };
  }>;
  links: MeshLink[];
  updatedAt: string;
}

/** Mesh health summary */
export interface MeshHealth {
  totalNodes: number;
  activeNodes: number;
  degradedNodes: number;
  offlineNodes: number;
  totalLinks: number;
  averageLinkQuality: number;
  updatedAt: string;
}

// =============================================================================
// BOOTSTRAP
// =============================================================================

/** A bootstrap peer entry */
export interface BootstrapPeer {
  nodeId: string;
  addresses: PeerAddress[];
  lastHealthCheck: string;
  healthy: boolean;
}
