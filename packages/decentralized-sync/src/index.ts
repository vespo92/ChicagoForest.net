/**
 * @fileoverview Decentralized CRDT-based sync for Chicago Forest Network
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * NOT operational infrastructure. Based on real distributed systems research:
 *
 * - Shapiro et al. (2011) - "Conflict-free Replicated Data Types"
 * - Kleppmann et al. (2017) - "A Conflict-Free Replicated JSON Datatype"
 * - Van der Linde et al. (2016) - "Delta State Replicated Data Types"
 *
 * Uses production-ready decentralized databases:
 * - GUN.js (https://gun.eco/) - Decentralized graph database
 * - OrbitDB (https://orbitdb.org/) - Peer-to-peer databases on IPFS
 *
 * This package provides:
 * - CRDT implementations (G-Counter, PN-Counter, LWW-Register, MV-Register, OR-Set, RGA)
 * - GUN.js adapter for real-time sync
 * - OrbitDB adapter for IPFS-based persistence
 * - Hybrid adapter combining both backends
 * - Integration with forest-registry and hive-mind packages
 *
 * @see https://crdt.tech/ for CRDT fundamentals
 * @see https://gun.eco/docs/ for GUN documentation
 * @see https://orbitdb.org/api/ for OrbitDB documentation
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Core sync types
  SyncBackend,
  MergeStrategy,
  SyncOperation,
  ConnectionState,

  // Vector clocks and causality
  VectorClock,
  CausalityRelation,
  HybridLogicalClock,

  // CRDT structures
  CRDTValue,
  GCounter,
  PNCounter,
  LWWRegister,
  MVRegister,
  GSet,
  ORSet,
  LWWMap,
  RGA,
  CRDTStructure,

  // Configuration
  DecentralizedSyncConfig,
  GUNConfig,
  OrbitDBConfig,

  // Events
  SyncEvents,
  SyncStats,

  // Operations
  SyncOp,
  SyncResult,

  // Database interface
  DecentralizedDB,

  // Domain types
  RegistryRecordType,
  RegistryRecord,
  GovernanceDataType,
  GovernanceRecord,
} from './types';

// ============================================================================
// CRDT Exports
// ============================================================================

export {
  // Vector Clock operations
  createVectorClock,
  incrementClock,
  mergeClock,
  compareClock,
  happensBefore,

  // Hybrid Logical Clock operations
  createHLC,
  hlcSend,
  hlcReceive,
  compareHLC,

  // G-Counter operations
  createGCounter,
  incrementGCounter,
  getGCounterValue,
  mergeGCounter,

  // PN-Counter operations
  createPNCounter,
  incrementPNCounter,
  decrementPNCounter,
  getPNCounterValue,
  mergePNCounter,

  // LWW-Register operations
  createLWWRegister,
  updateLWWRegister,
  mergeLWWRegister,

  // MV-Register operations
  createMVRegister,
  updateMVRegister,
  mergeMVRegister,
  getMVRegisterValues,

  // G-Set operations
  createGSet,
  addToGSet,
  gSetHas,
  mergeGSet,

  // OR-Set operations
  createORSet,
  addToORSet,
  removeFromORSet,
  orSetHas,
  mergeORSet,

  // LWW-Map operations
  createLWWMap,
  setLWWMapField,
  mergeLWWMap,
  getLWWMapValue,

  // RGA operations
  createRGA,
  insertIntoRGA,
  appendToRGA,
  deleteFromRGA,
  getRGAValues,
  mergeRGA,
} from './crdt';

// ============================================================================
// Adapter Exports
// ============================================================================

export {
  // GUN adapter
  GUNAdapter,
  createGUNAdapter,
  createForestRegistryGUN,
  createHiveMindGUN,
} from './gun';

export {
  // OrbitDB adapter
  OrbitDBAdapter,
  createOrbitDBAdapter,
  createForestRegistryOrbitDB,
  createHiveMindOrbitDB,
} from './orbitdb';

export {
  // Unified adapters
  HybridAdapter,
  createAdapter,
  createForestRegistryAdapter,
  createHiveMindAdapter,
} from './adapters';

// ============================================================================
// Convenience Factory
// ============================================================================

import type { NodeId } from '@chicago-forest/shared-types';
import type { SyncBackend, DecentralizedDB } from './types';
import { createAdapter } from './adapters';

/**
 * Quick start function to create a decentralized sync instance
 *
 * @example
 * ```typescript
 * import { createDecentralizedSync } from '@chicago-forest/decentralized-sync';
 *
 * // Using GUN (default)
 * const sync = await createDecentralizedSync('my-node-id');
 *
 * // Using OrbitDB
 * const sync = await createDecentralizedSync('my-node-id', 'orbitdb');
 *
 * // Using Hybrid (both)
 * const sync = await createDecentralizedSync('my-node-id', 'hybrid');
 *
 * // Store data
 * await sync.put('forests/chicago', { name: 'Chicago Forest', nodes: 42 });
 *
 * // Get data
 * const forest = await sync.get('forests/chicago');
 *
 * // Subscribe to changes
 * const unsubscribe = sync.subscribe('forests/chicago', (value, meta) => {
 *   console.log('Forest updated:', value, 'by', meta.origin);
 * });
 * ```
 */
export async function createDecentralizedSync(
  nodeId: NodeId,
  backend: SyncBackend = 'gun',
  peers: string[] = []
): Promise<DecentralizedDB> {
  const adapter = createAdapter({
    nodeId,
    backend,
    gun: {
      peers,
      localStorage: true,
      indexedDB: true,
      webRTC: true,
    },
    orbitdb: {
      directory: './orbitdb',
      accessController: 'orbitdb',
      replication: 3,
    },
  });

  // Initialize the adapter
  if ('initialize' in adapter && typeof adapter.initialize === 'function') {
    await (adapter as { initialize: () => Promise<void> }).initialize();
  }

  return adapter;
}

// ============================================================================
// Re-export for convenience
// ============================================================================

export default createDecentralizedSync;
