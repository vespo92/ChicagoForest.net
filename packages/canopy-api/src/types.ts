/**
 * Types for the Canopy API
 */

import type { NodeId } from '@chicago-forest/shared-types';

/**
 * Configuration for Canopy API
 */
export interface CanopyConfig {
  /** Enable REST API */
  enableRest: boolean;

  /** REST port */
  restPort: number;

  /** Enable WebSocket */
  enableWebSocket: boolean;

  /** WebSocket port */
  wsPort: number;

  /** Enable authentication */
  authEnabled: boolean;

  /** API key (if auth enabled) */
  apiKey?: string;

  /** Rate limiting */
  rateLimit: RateLimitConfig;

  /** CORS configuration */
  cors: CorsConfig;
}

export interface RateLimitConfig {
  /** Requests per minute */
  requestsPerMinute: number;

  /** Burst limit */
  burst: number;

  /** Enable rate limiting */
  enabled: boolean;
}

export interface CorsConfig {
  /** Allowed origins */
  origins: string[];

  /** Allow credentials */
  credentials: boolean;
}

/**
 * API request structure
 */
export interface ApiRequest {
  /** Request ID */
  id: string;

  /** HTTP method or action */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'SUBSCRIBE';

  /** Request path */
  path: string;

  /** Request headers */
  headers: Record<string, string>;

  /** Query parameters */
  query: Record<string, string>;

  /** Request body */
  body?: unknown;

  /** Request timestamp */
  timestamp: number;

  /** Client identifier */
  clientId?: string;
}

/**
 * API response structure
 */
export interface ApiResponse<T = unknown> {
  /** Response ID (matches request) */
  id: string;

  /** HTTP status code */
  status: number;

  /** Success indicator */
  success: boolean;

  /** Response data */
  data?: T;

  /** Error message if failed */
  error?: ApiError;

  /** Response timestamp */
  timestamp: number;

  /** Response metadata */
  meta?: ResponseMeta;
}

export interface ApiError {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Additional details */
  details?: unknown;
}

export interface ResponseMeta {
  /** Request duration (ms) */
  duration: number;

  /** Pagination info */
  pagination?: PaginationMeta;

  /** Rate limit info */
  rateLimit?: RateLimitMeta;
}

export interface PaginationMeta {
  /** Current page */
  page: number;

  /** Items per page */
  perPage: number;

  /** Total items */
  total: number;

  /** Total pages */
  totalPages: number;
}

export interface RateLimitMeta {
  /** Remaining requests */
  remaining: number;

  /** Reset timestamp */
  reset: number;
}

/**
 * Subscription for real-time updates
 */
export interface Subscription {
  /** Subscription ID */
  id: string;

  /** Topic being subscribed to */
  topic: string;

  /** Filter parameters */
  filter?: Record<string, unknown>;

  /** Client ID */
  clientId: string;

  /** Created timestamp */
  createdAt: number;

  /** Is subscription active */
  active: boolean;
}

/**
 * API domains and their endpoints
 */
export type ApiDomain =
  | 'identity'    // Node identity management
  | 'network'     // Connection and routing
  | 'storage'     // Distributed storage
  | 'compute'     // Distributed compute
  | 'messaging'   // Secure communication
  | 'governance'; // Voting and proposals

/**
 * Identity API types
 */
export interface IdentityInfo {
  nodeId: NodeId;
  publicKey: string;
  name?: string;
  reputation: number;
  createdAt: number;
}

/**
 * Network API types
 */
export interface NetworkStats {
  connectedPeers: number;
  activePaths: number;
  bandwidth: BandwidthStats;
  latency: LatencyStats;
}

export interface BandwidthStats {
  incoming: number;
  outgoing: number;
  total: number;
}

export interface LatencyStats {
  min: number;
  max: number;
  avg: number;
  p95: number;
}

/**
 * Storage API types
 */
export interface StorageInfo {
  available: number;
  used: number;
  total: number;
}

export interface StoredObject {
  id: string;
  size: number;
  checksum: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Events emitted by Canopy API
 */
export interface CanopyEvents {
  'request:received': (request: ApiRequest) => void;
  'request:completed': (request: ApiRequest, response: ApiResponse) => void;
  'subscription:created': (subscription: Subscription) => void;
  'subscription:cancelled': (subscriptionId: string) => void;
  'client:connected': (clientId: string) => void;
  'client:disconnected': (clientId: string) => void;
  'ratelimit:exceeded': (clientId: string) => void;
}
