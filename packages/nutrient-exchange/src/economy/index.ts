/**
 * Economy Module - Resource Sharing Economy for the Nutrient Exchange System
 *
 * ============================================================================
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational
 * and conceptual exploration purposes only. This does NOT represent a working
 * system or proven technology. All concepts described are speculative.
 * ============================================================================
 *
 * THEORETICAL CONCEPT:
 * This module could potentially provide a comprehensive resource economy for
 * decentralized networks, enabling fair exchange of bandwidth, storage, and
 * compute resources through credit-based incentive mechanisms.
 *
 * @packageDocumentation
 * @module @chicago-forest/nutrient-exchange/economy
 */

// Bandwidth Credit System
export {
  BandwidthCreditManager,
  type BandwidthCredit,
  type BandwidthTier,
  type BandwidthCreditConfig,
  type BandwidthCreditEvents,
  type BandwidthEconomyStats,
  DEFAULT_BANDWIDTH_CONFIG,
} from './bandwidth-credits';

// Storage Economy System
export {
  StorageEconomyManager,
  type StorageCommitment,
  type StorageTier,
  type StorageCommitmentStatus,
  type StoredShard,
  type StorageEconomyConfig,
  type StorageEconomyEvents,
  type StorageNetworkStats,
  type NodeStorageInfo,
  DEFAULT_STORAGE_CONFIG,
} from './storage-economy';

// Compute Sharing System
export {
  ComputeSharingManager,
  type ComputeTask,
  type ComputeTaskType,
  type ComputeTaskStatus,
  type ComputeCapabilities,
  type ComputeAssignment,
  type VerificationLevel,
  type ComputeSharingConfig,
  type ComputeSharingEvents,
  type ComputeResult,
  type ComputeNetworkStats,
  DEFAULT_COMPUTE_CONFIG,
} from './compute-sharing';
