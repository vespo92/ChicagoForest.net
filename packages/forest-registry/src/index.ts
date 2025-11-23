/**
 * @chicago-forest/forest-registry
 *
 * Decentralized registry for global forest discovery.
 * The "DNS" of the mycelium network - resolving forest names,
 * node identities, and service endpoints.
 *
 * Record types:
 * - Forest: Network identity, bootstrap nodes, policies
 * - Node: Public key, capabilities, reputation
 * - Service: Offered services, endpoints, requirements
 * - Route: Inter-forest pathways, metrics
 *
 * ⚠️ DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 */

export * from './records';
export * from './resolver';
export * from './replication';

export type {
  ForestRecord,
  NodeRecord,
  ServiceRecord,
  RouteRecord,
  RegistryConfig,
} from './types';
