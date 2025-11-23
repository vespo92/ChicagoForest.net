/**
 * @chicago-forest/nutrient-exchange
 *
 * Resource sharing economy for the forest network.
 * Like trees sharing nutrients through mycorrhizal networks,
 * nodes share bandwidth, storage, compute, and trust.
 *
 * Resource Types:
 * - Bandwidth: Network capacity for relaying
 * - Storage: Disk space for distributed data
 * - Compute: CPU/GPU for processing tasks
 * - Connectivity: Internet gateway access
 *
 * ============================================================================
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational
 * and conceptual exploration purposes only. This does NOT represent a working
 * system or proven technology. All concepts described herein are speculative.
 *
 * INSPIRATIONS:
 * - BitTorrent's tit-for-tat incentive mechanism
 * - Filecoin's proof-of-storage and retrieval markets
 * - Ethereum's gas and fee markets
 * - Traditional resource pool economics
 * ============================================================================
 *
 * @packageDocumentation
 * @module @chicago-forest/nutrient-exchange
 */

// Core exports
export * from './resources';
export * from './credits';
export * from './exchange';

// Economy module - bandwidth, storage, and compute credit systems
export * from './economy';

// Protocols module - negotiation, fair exchange, and proof of contribution
export * from './protocols';

// Models module - resource pools, contributor nodes, and exchange rates
export * from './models';

// Simulation module - network economics simulation
export * from './simulation';

// Type exports
export type {
  Resource,
  ResourceType,
  ResourceOffer,
  ResourceRequest,
  CreditBalance,
  ExchangeResult,
  Exchange,
  ExchangeStatus,
  UsageMetrics,
  AvailabilityWindow,
  ResourceUnit,
  OfferStatus,
  NutrientEvents,
} from './types';
