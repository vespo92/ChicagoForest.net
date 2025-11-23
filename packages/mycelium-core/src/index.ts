/**
 * @chicago-forest/mycelium-core
 *
 * The neural network substrate of the Chicago Forest Network.
 * Like fungal mycelium, this package provides the connective tissue
 * that enables all network behavior - hyphal pathways, signal propagation,
 * emergent topology, and intelligent routing.
 *
 * ⚠️ DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 */

// Core modules
export * from './hyphal';
export * from './signal';
export * from './topology';
export * from './growth';

// Neural network enhancements
export * from './clustering';
export * from './pathfinding';
export * from './metrics';

// Re-export commonly used types
export type {
  MyceliumConfig,
  HyphalPath,
  SignalType,
  TopologySnapshot,
  GrowthPattern,
} from './types';

// Re-export neural network types
export type {
  NetworkCluster,
  ClusterConfig,
} from './clustering';

export type {
  Route,
  PathfindingConfig,
  Heuristic,
} from './pathfinding';

export type {
  NetworkMetrics,
  VisualizationData,
  MetricsConfig,
} from './metrics';

export { MyceliumNetwork } from './network';
