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

export * from './rest';
export * from './websocket';
export * from './sdk';

export type {
  CanopyConfig,
  ApiRequest,
  ApiResponse,
  Subscription,
} from './types';
