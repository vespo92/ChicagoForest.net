/**
 * @chicago-forest/headscale-integration - Type Definitions
 *
 * Types matching the Headscale v0.28 gRPC/REST API.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

// =============================================================================
// HEADSCALE API TYPES (v0.28)
// =============================================================================

/** Headscale user (formerly "namespace" in older versions) */
export interface HeadscaleUser {
  id: string;
  createdAt: string;
  name: string;
  displayName?: string;
  email?: string;
  providerId?: string;
  provider?: string;
  profilePicUrl?: string;
}

/** Headscale node (machine registered with the control server) */
export interface HeadscaleNode {
  id: string;
  machineKey: string;
  nodeKey: string;
  discoKey: string;
  ipAddresses: string[];
  name: string;
  user: HeadscaleUser;
  lastSeen: string;
  expiry: string;
  createdAt: string;
  registerMethod: HeadscaleRegisterMethod;
  forcedTags: string[];
  invalidTags: string[];
  validTags: string[];
  givenName: string;
  online: boolean;
}

/** How a node was registered */
export type HeadscaleRegisterMethod =
  | 'REGISTER_METHOD_UNSPECIFIED'
  | 'REGISTER_METHOD_AUTH_KEY'
  | 'REGISTER_METHOD_CLI'
  | 'REGISTER_METHOD_OIDC';

/** Pre-authentication key for automated node enrollment */
export interface HeadscalePreAuthKey {
  id: string;
  key: string;
  user: string;
  reusable: boolean;
  ephemeral: boolean;
  used: boolean;
  expiration: string;
  createdAt: string;
  aclTags: string[];
}

/** Headscale route (subnet router advertisement) */
export interface HeadscaleRoute {
  id: string;
  node: HeadscaleNode;
  prefix: string;
  advertised: boolean;
  enabled: boolean;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/** DNS configuration entry */
export interface HeadscaleDNSEntry {
  name: string;
  type: 'A' | 'AAAA' | 'CNAME';
  value: string;
}

// =============================================================================
// CLIENT CONFIGURATION
// =============================================================================

/** Authentication method for connecting to Headscale */
export type HeadscaleAuthMethod =
  | { type: 'apiKey'; apiKey: string }
  | { type: 'unixSocket'; socketPath: string };

/** Configuration for the Headscale client */
export interface HeadscaleClientConfig {
  /** Base URL of the Headscale server (e.g., https://headscale.example.com) */
  serverUrl: string;
  /** Authentication method */
  auth: HeadscaleAuthMethod;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Whether to skip TLS certificate verification (default: false) */
  insecure?: boolean;
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

export interface CreateUserRequest {
  name: string;
}

export interface CreatePreAuthKeyRequest {
  user: string;
  reusable?: boolean;
  ephemeral?: boolean;
  expiration?: string;
  aclTags?: string[];
}

export interface ListNodesRequest {
  user?: string;
}

export interface DeleteNodeRequest {
  nodeId: string;
}

export interface GetRoutesRequest {
  nodeId?: string;
}

export interface EnableRouteRequest {
  routeId: string;
}

export interface HeadscaleApiResponse<T> {
  data: T;
  status: number;
}

// =============================================================================
// SYNC CONFIGURATION
// =============================================================================

/** Configuration for syncing Headscale nodes to the Forest gossip network */
export interface ForestHeadscaleSyncConfig {
  /** Headscale client configuration */
  headscale: HeadscaleClientConfig;
  /** Sync interval in milliseconds (default: 30000) */
  syncIntervalMs?: number;
  /** Whether to bridge MagicDNS records to Headscale (default: true) */
  bridgeDns?: boolean;
  /** Forest gossip broadcast function */
  gossipBroadcast: (peers: import('@chicago-forest/shared-types').PeerAddress[]) => void;
  /** Optional filter: only sync nodes matching these tags */
  tagFilter?: string[];
}

// =============================================================================
// ENROLLMENT
// =============================================================================

/** Configuration written to /etc/forest/config.json for new mesh routers */
export interface EnrollmentConfig {
  headscaleUrl: string;
  headscaleAuthKey: string;
  bootstrapPeers: import('@chicago-forest/shared-types').PeerAddress[];
  nodeIdentity?: {
    nodeId: string;
    publicKey: string;
  };
  forestNetwork: {
    meshEnabled: boolean;
    relayEnabled: boolean;
  };
  createdAt: string;
  expiresAt?: string;
}
