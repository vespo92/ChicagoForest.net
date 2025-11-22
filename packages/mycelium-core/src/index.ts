/**
 * @chicago-forest/mycelium-core
 *
 * The neural network substrate of the Chicago Forest Network.
 * Like fungal mycelium, this package provides the connective tissue
 * that enables all network behavior - hyphal pathways, signal propagation,
 * and emergent topology.
 *
 * ⚠️ DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 */

export * from './hyphal';
export * from './signal';
export * from './topology';
export * from './growth';

// Re-export commonly used types
export type {
  MyceliumConfig,
  HyphalPath,
  SignalType,
  TopologySnapshot,
  GrowthPattern,
} from './types';

export { MyceliumNetwork } from './network';
