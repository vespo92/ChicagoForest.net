/**
 * Models Module - Data Models for the Nutrient Exchange System
 *
 * ============================================================================
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational
 * and conceptual exploration purposes only. This does NOT represent a working
 * system or proven technology. All concepts described are speculative.
 * ============================================================================
 *
 * THEORETICAL CONCEPT:
 * This module could potentially provide data models for resource pools,
 * contributor nodes, and exchange rates in a decentralized resource
 * sharing economy.
 *
 * @packageDocumentation
 * @module @chicago-forest/nutrient-exchange/models
 */

// Resource Pool Model
export {
  ResourcePoolManager,
  type ResourcePool,
  type PoolStatus,
  type DistributionStrategy,
  type PoolStats,
  type PoolConfig,
  type PoolContribution,
  type ContributionStatus,
  type AllocationStats,
  type PoolAllocation,
  type AllocatedResource,
  type AllocationStatus,
  type QoSMetrics,
  type ResourcePoolEvents,
} from './resource-pool';

// Contributor Node Model
export {
  ContributorNodeManager,
  type ContributorNode,
  type NodeType,
  type NodeStatus,
  type NodeResources,
  type ResourceCapacity,
  type NodeReputation,
  type ReputationTier,
  type ReputationReport,
  type NodeEconomics,
  type ConnectionInfo,
  type Endpoint,
  type GeoLocation,
  type NodeCapabilities,
  type HardwareSpec,
  type NodeMetadata,
  type ContributorNodeEvents,
  type ContributorNodeConfig,
  type NetworkStats,
  DEFAULT_CONTRIBUTOR_CONFIG,
} from './contributor-node';

// Exchange Rate Model
export {
  ExchangeRateManager,
  type ExchangeRate,
  type PricePoint,
  type MarketOrder,
  type OrderStatus,
  type Trade,
  type OrderBook,
  type OrderBookEntry,
  type ExchangeRateConfig,
  type ExchangeRateEvents,
  type PriceImpactEstimate,
  DEFAULT_EXCHANGE_CONFIG,
} from './exchange-rate';
