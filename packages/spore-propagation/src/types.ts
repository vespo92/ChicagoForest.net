/**
 * Types for spore propagation system
 */

import type { NodeId } from '@chicago-forest/shared-types';

/**
 * A spore is a lightweight bootstrap package that contains everything
 * needed to join the forest network
 */
export interface Spore {
  /** Unique spore identifier */
  id: string;

  /** Version of the spore format */
  version: string;

  /** Creation timestamp */
  createdAt: number;

  /** Expiry timestamp (0 = never expires) */
  expiresAt: number;

  /** Parent node that released this spore */
  parentNode: NodeId;

  /** Bootstrap configuration */
  bootstrap: BootstrapConfig;

  /** Cryptographic signature from parent */
  signature: string;

  /** Optional: IPFS CID of full node software */
  softwareCID?: string;

  /** Optional: Magnet link for P2P download */
  magnetLink?: string;

  /** Distribution metadata */
  distribution: DistributionMeta;
}

export interface BootstrapConfig {
  /** Known entry points to the network */
  entryPoints: EntryPoint[];

  /** Network identifier */
  networkId: string;

  /** Minimum software version required */
  minVersion: string;

  /** Network capabilities offered */
  capabilities: string[];

  /** Geographic region (optional) */
  region?: string;
}

export interface EntryPoint {
  /** Node ID of the entry point */
  nodeId: NodeId;

  /** Connection addresses */
  addresses: string[];

  /** Entry point reliability score */
  reliability: number;

  /** Last known active timestamp */
  lastSeen: number;
}

export interface DistributionMeta {
  /** How this spore was distributed */
  method: DistributionMethod;

  /** Distribution channel identifier */
  channel: string;

  /** Number of times this spore has germinated */
  germinationCount: number;

  /** Distribution constraints */
  constraints: DistributionConstraints;
}

export type DistributionMethod =
  | 'p2p'        // Torrent/BitTorrent
  | 'ipfs'       // IPFS network
  | 'qr'         // QR code
  | 'usb'        // USB dead drop
  | 'mesh'       // Mesh broadcast
  | 'http'       // Traditional web
  | 'nfc'        // Near-field communication
  | 'bluetooth'  // Bluetooth transfer
  | 'manual';    // Manual entry

export interface DistributionConstraints {
  /** Maximum number of germinations allowed */
  maxGerminations: number;

  /** Geographic restrictions */
  allowedRegions?: string[];

  /** Required capabilities */
  requiredCapabilities?: string[];
}

/**
 * Configuration for creating new spores
 */
export interface SporeConfig {
  /** Time until spore expires (in milliseconds) */
  ttl: number;

  /** Distribution method to use */
  distributionMethod: DistributionMethod;

  /** Maximum germinations allowed */
  maxGerminations: number;

  /** Include full software package */
  includeSoftware: boolean;

  /** Geographic region targeting */
  targetRegion?: string;
}

/**
 * Result of a germination attempt
 */
export interface GerminationResult {
  /** Whether germination was successful */
  success: boolean;

  /** The germinated node ID */
  nodeId?: NodeId;

  /** Error message if failed */
  error?: string;

  /** Time taken to germinate (ms) */
  duration: number;

  /** Entry point that was used */
  entryPoint?: EntryPoint;

  /** Capabilities discovered */
  capabilities: string[];
}

/**
 * State of a germinating spore
 */
export type GerminationState =
  | 'dormant'     // Spore not yet activated
  | 'validating'  // Checking spore validity
  | 'connecting'  // Connecting to entry points
  | 'identifying' // Generating node identity
  | 'joining'     // Joining the network
  | 'active'      // Successfully germinated
  | 'failed';     // Germination failed

/**
 * Events emitted during spore lifecycle
 */
export interface SporeEvents {
  'spore:created': (spore: Spore) => void;
  'spore:distributed': (spore: Spore, method: DistributionMethod) => void;
  'spore:received': (spore: Spore) => void;
  'germination:started': (sporeId: string) => void;
  'germination:progress': (sporeId: string, state: GerminationState) => void;
  'germination:completed': (result: GerminationResult) => void;
  'germination:failed': (sporeId: string, error: string) => void;
}
