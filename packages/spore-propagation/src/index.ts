/**
 * @chicago-forest/spore-propagation
 *
 * Network growth through spore distribution - lightweight node bootstrappers
 * that can be distributed, planted, and grown into full network participants.
 *
 * EXPANDED: Now includes bio-inspired modules for:
 * - Bootstrap (seed nodes, connections, trust)
 * - Growth (organic expansion, recruitment, coverage)
 * - Resilience (redundancy, failover, self-healing)
 * - Metrics (analytics, health monitoring)
 *
 * Primary Biological Inspiration:
 * Tero et al., "Rules for Biologically Inspired Adaptive Network Design"
 * Science 327(5964):439-442, 2010
 * DOI: 10.1126/science.1177894
 *
 * Distribution methods:
 * - Torrent/Magnet links (P2P)
 * - IPFS CIDs (content-addressed)
 * - QR Codes (physical world)
 * - USB Dead Drops (sneakernet)
 * - Mesh Broadcast (over-the-air)
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * This is NOT a working energy distribution system.
 */

// ============================================================================
// ORIGINAL EXPORTS (preserved)
// ============================================================================
export * from './spore';
export * from './distribution';
export * from './germination';

export type {
  Spore,
  SporeConfig,
  DistributionMethod,
  GerminationResult,
} from './types';

// ============================================================================
// BOOTSTRAP MODULE - Seed node initialization and trust
// ============================================================================
export {
  SeedNodeBootstrap,
  SeedNodeState,
  createSeedNode,
  createChicagoSeedNode
} from './bootstrap/seed-node';
export type { SeedNodeConfig, ConnectionStrength } from './bootstrap/seed-node';

export {
  InitialConnectionManager,
  ConnectionPhase,
  broadcastConnect,
  sequentialConnect
} from './bootstrap/initial-connection';
export type {
  NodeCapabilities,
  ConnectionRequest,
  ConnectionResponse,
  PseudopodProbe
} from './bootstrap/initial-connection';

export {
  TrustEstablishmentManager,
  TrustLevel,
  createTrustManager
} from './bootstrap/trust-establishment';
export type {
  TrustScore,
  TrustEvidence,
  VouchingRecord,
  TrustChallenge,
  QuorumState
} from './bootstrap/trust-establishment';

// ============================================================================
// GROWTH MODULE - Organic expansion and recruitment
// ============================================================================
export {
  OrganicExpansionManager,
  GrowthMode,
  physarumGrowthStep
} from './growth/organic-expansion';
export type {
  GrowthVector,
  EnvironmentalGradient,
  NetworkTendril,
  ExpansionOpportunity
} from './growth/organic-expansion';

export {
  NodeRecruitmentManager,
  RecruitmentStrategy,
  RecruitmentPhase,
  antColonyRecruitment
} from './growth/node-recruitment';
export type {
  CandidateProfile,
  PheromoneTrail,
  WaggleDanceMessage,
  RecruitmentIncentive
} from './growth/node-recruitment';

export {
  CoverageOptimizationManager
} from './growth/coverage-optimization';
export type {
  GeographicCell,
  CoverageMetrics,
  OptimizationTarget,
  OptimizationRecommendation,
  VoronoiRegion
} from './growth/coverage-optimization';

// ============================================================================
// RESILIENCE MODULE - Redundancy, failover, and self-healing
// ============================================================================
export {
  RedundancyPlanningManager,
  RedundancyLevel
} from './resilience/redundancy-planning';
export type {
  CriticalityAssessment,
  RedundantPath,
  RedundancyZone,
  RedundancyMetrics
} from './resilience/redundancy-planning';

export {
  FailoverMechanismsManager,
  FailoverState,
  FailureType
} from './resilience/failover-mechanisms';
export type {
  FailureEvent,
  FailoverAction,
  FailoverPlan,
  HealthCheckConfig,
  EntityHealth
} from './resilience/failover-mechanisms';

export {
  SelfHealingManager,
  HealingPhase,
  DamageType
} from './resilience/self-healing';
export type {
  DamageAssessment,
  HealingAction,
  RegenerationBlueprint,
  HealingSignal
} from './resilience/self-healing';

// ============================================================================
// METRICS MODULE - Analytics and health monitoring
// ============================================================================
export {
  GrowthAnalyticsManager,
  GrowthMetricType
} from './metrics/growth-analytics';
export type {
  TimeSeriesPoint,
  GrowthRateAnalysis,
  TopologyMetrics,
  ScalingAnalysis,
  GrowthEfficiencyMetrics,
  CohortAnalysis
} from './metrics/growth-analytics';

export {
  HealthMonitoringManager,
  HealthStatus
} from './metrics/health-monitoring';
export type {
  VitalSign,
  HealthCheckResult,
  HealthReport,
  Alert,
  HomeostaticControl
} from './metrics/health-monitoring';

// ============================================================================
// RHIZOME MODULE - Network Propagation
// ============================================================================
export {
  // Main coordinator
  RhizomePropagationCoordinator,
  RhizomePhase,
  PropagationEvent,
  createRhizomePropagation,
  createChicagoRhizomeNode,
  createLightweightRhizome,
  RHIZOME_PROPAGATION_INFO,

  // Gossip protocol
  RhizomeGossipProtocol,
  GossipMessageType,
  DisseminationStrategy,
  createGossipProtocol,
  createHighThroughputGossip,
  createReliableGossip,

  // State synchronization
  RhizomeStateSync,
  SyncStateType,
  ConflictResolution,
  createStateSync,
  createHighConsistencySync,
  GCounter,
  PNCounter,
  LWWRegister,
  GSet,

  // Lateral growth
  RhizomeLateralGrowth,
  GrowthDirection,
  SegmentType,
  createLateralGrowth,
  createAggressiveGrowth,
  createConservativeGrowth
} from './rhizome';

export type {
  // Rhizome types
  RhizomeIdentity,
  TopologyView,
  PropagationStats,
  RhizomePropagationConfig,

  // Gossip types
  GossipMessage,
  GossipConfig,
  PeerSelectionConfig,
  GossipRoundStats,

  // State sync types
  StateEntry,
  StateDelta,
  VersionVector,
  SyncSession,
  StateSyncConfig,
  MerkleNode,

  // Lateral growth types
  RhizomeNode,
  GrowthSegment,
  GrowthWave,
  EnvironmentalCondition,
  LateralGrowthConfig
} from './rhizome';

// ============================================================================
// PACKAGE METADATA
// ============================================================================
export const SPORE_PROPAGATION_INFO = {
  name: '@chicago-forest/spore-propagation',
  version: '0.1.0-theoretical',
  description: 'Bio-inspired network growth, bootstrap, organic expansion, and rhizome propagation',

  modules: [
    'bootstrap - Seed node initialization and trust establishment',
    'distribution - Spore distribution across multiple channels',
    'germination - Growing spores into network nodes',
    'growth - Organic expansion and node recruitment',
    'resilience - Redundancy, failover, and self-healing',
    'metrics - Analytics and health monitoring',
    'rhizome - Network propagation with gossip, state sync, and lateral growth'
  ],

  references: [
    {
      title: 'Rules for Biologically Inspired Adaptive Network Design',
      authors: 'Tero et al.',
      journal: 'Science',
      year: 2010,
      doi: '10.1126/science.1177894'
    },
    {
      title: 'Epidemic Algorithms for Replicated Database Maintenance',
      authors: 'Demers et al.',
      venue: 'PODC 1987',
      doi: '10.1145/41840.41841'
    },
    {
      title: 'Conflict-free Replicated Data Types',
      authors: 'Shapiro et al.',
      venue: 'SSS 2011',
      doi: '10.1007/978-3-642-24550-3_29'
    }
  ],

  disclaimer: 'THEORETICAL framework - NOT operational'
};
