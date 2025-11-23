/**
 * @chicago-forest/canopy-api
 *
 * The public interface to the forest network.
 * The canopy is what's visible above ground - the API that
 * applications use to interact with the mycelium network.
 *
 * Interfaces:
 * - REST: HTTP APIs with OpenAPI specification
 * - WebSocket: Real-time bidirectional communication
 * - GraphQL: Flexible query interface
 * - SDK: TypeScript client libraries
 * - LibP2P: Native P2P protocol
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. Not operational infrastructure.
 *
 * All research content provides REAL, verifiable sources (Tesla patents,
 * LENR papers, etc.) with clear markers for theoretical extensions.
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
export { CanopyGraphQLServer, createGraphQLServer, resolvers } from './graphql/server';
export type { GraphQLServerConfig, GraphQLRequest, GraphQLResponse } from './graphql/server';

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
