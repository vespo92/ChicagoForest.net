/**
 * @chicago-forest/headscale-integration
 *
 * Headscale/Tailscale control plane integration for the Chicago Forest Network.
 * Provides API client, gossip sync, and enrollment configuration generation
 * for bridging Headscale-managed nodes into the Forest mesh.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

// Types
export type {
  HeadscaleNode,
  HeadscaleUser,
  HeadscalePreAuthKey,
  HeadscaleRoute,
  HeadscaleDNSEntry,
  HeadscaleRegisterMethod,
  HeadscaleAuthMethod,
  HeadscaleClientConfig,
  HeadscaleApiResponse,
  CreateUserRequest,
  CreatePreAuthKeyRequest,
  ListNodesRequest,
  DeleteNodeRequest,
  GetRoutesRequest,
  EnableRouteRequest,
  ForestHeadscaleSyncConfig,
  EnrollmentConfig,
} from './types';

// Client
export { HeadscaleClient, HeadscaleApiError } from './client';

// Sync
export { ForestHeadscaleSync } from './sync';
export type { ForestHeadscaleSyncEvents } from './sync';

// Enrollment
export {
  generateEnrollmentConfig,
  serializeEnrollmentConfig,
  parseEnrollmentConfig,
  ENROLLMENT_CONFIG_PATH,
} from './enrollment';
export type { GenerateEnrollmentOptions } from './enrollment';
