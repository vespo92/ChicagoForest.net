/**
 * @chicago-forest/canopy-api
 *
 * The public interface to the forest network.
 * The canopy is what's visible above ground - the API that
 * applications use to interact with the mycelium network.
 *
 * Interfaces:
 * - REST/GraphQL: Traditional HTTP APIs
 * - WebSocket: Real-time bidirectional
 * - gRPC: High-performance RPC
 * - LibP2P: Native P2P protocol
 *
 * ⚠️ DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 */

// REST API
export * from './rest';

// WebSocket real-time
export * from './websocket';

// SDK clients
export * from './sdk';

// LibP2P native P2P protocol
export * from './libp2p';

// GraphQL
export * from './graphql/server';

// Types
export type {
  CanopyConfig,
  ApiRequest,
  ApiResponse,
  Subscription,
  RateLimitConfig,
  CorsConfig,
  ApiError,
  ResponseMeta,
  PaginationMeta,
  RateLimitMeta,
  ApiDomain,
  IdentityInfo,
  NetworkStats,
  BandwidthStats,
  LatencyStats,
  StorageInfo,
  StoredObject,
  CanopyEvents,
} from './types';
