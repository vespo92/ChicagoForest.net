/**
 * Germination Manager - Growing spores into full network nodes
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  Spore,
  SporeEvents,
  GerminationResult,
  GerminationState,
  EntryPoint,
} from '../types';

/**
 * Configuration for germination process
 */
export interface GerminationConfig {
  /** Maximum connection attempts per entry point */
  maxAttempts: number;

  /** Connection timeout (ms) */
  connectionTimeout: number;

  /** Retry delay (ms) */
  retryDelay: number;

  /** Enable parallel entry point attempts */
  parallelAttempts: boolean;

  /** Number of parallel attempts */
  parallelCount: number;
}

const DEFAULT_CONFIG: GerminationConfig = {
  maxAttempts: 3,
  connectionTimeout: 10000,
  retryDelay: 2000,
  parallelAttempts: true,
  parallelCount: 3,
};

/**
 * Manages the germination of spores into network nodes
 */
export class GerminationManager extends EventEmitter<SporeEvents> {
  private config: GerminationConfig;
  private activeGerminations: Map<string, GerminationState> = new Map();

  // Callbacks for node operations
  private generateIdentity: () => Promise<NodeId> = async () => '' as NodeId;
  private connectToNode: (address: string) => Promise<boolean> = async () => false;
  private joinNetwork: (nodeId: NodeId) => Promise<boolean> = async () => false;

  constructor(config: Partial<GerminationConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set identity generation callback
   */
  setIdentityGenerator(generator: () => Promise<NodeId>): void {
    this.generateIdentity = generator;
  }

  /**
   * Set connection callback
   */
  setConnectionHandler(handler: (address: string) => Promise<boolean>): void {
    this.connectToNode = handler;
  }

  /**
   * Set network join callback
   */
  setNetworkJoinHandler(handler: (nodeId: NodeId) => Promise<boolean>): void {
    this.joinNetwork = handler;
  }

  /**
   * Germinate a spore into a full network node
   */
  async germinate(spore: Spore): Promise<GerminationResult> {
    const startTime = Date.now();
    this.activeGerminations.set(spore.id, 'dormant');
    this.emit('germination:started', spore.id);

    try {
      // Step 1: Validate spore
      this.updateState(spore.id, 'validating');
      const isValid = await this.validateSpore(spore);
      if (!isValid) {
        throw new Error('Invalid spore');
      }

      // Step 2: Connect to entry points
      this.updateState(spore.id, 'connecting');
      const entryPoint = await this.findWorkingEntryPoint(spore.bootstrap.entryPoints);
      if (!entryPoint) {
        throw new Error('No working entry points found');
      }

      // Step 3: Generate identity
      this.updateState(spore.id, 'identifying');
      const nodeId = await this.generateIdentity();

      // Step 4: Join network
      this.updateState(spore.id, 'joining');
      const joined = await this.joinNetwork(nodeId);
      if (!joined) {
        throw new Error('Failed to join network');
      }

      // Step 5: Success!
      this.updateState(spore.id, 'active');

      const result: GerminationResult = {
        success: true,
        nodeId,
        duration: Date.now() - startTime,
        entryPoint,
        capabilities: spore.bootstrap.capabilities,
      };

      this.emit('germination:completed', result);
      return result;
    } catch (error) {
      this.updateState(spore.id, 'failed');
      this.emit('germination:failed', spore.id, String(error));

      return {
        success: false,
        error: String(error),
        duration: Date.now() - startTime,
        capabilities: [],
      };
    } finally {
      this.activeGerminations.delete(spore.id);
    }
  }

  /**
   * Get the current state of a germination
   */
  getState(sporeId: string): GerminationState | undefined {
    return this.activeGerminations.get(sporeId);
  }

  /**
   * Check if germination is in progress
   */
  isGerminating(sporeId: string): boolean {
    const state = this.activeGerminations.get(sporeId);
    return state !== undefined && state !== 'active' && state !== 'failed';
  }

  /**
   * Get all active germinations
   */
  getActiveGerminations(): Map<string, GerminationState> {
    return new Map(this.activeGerminations);
  }

  // Private methods

  private updateState(sporeId: string, state: GerminationState): void {
    this.activeGerminations.set(sporeId, state);
    this.emit('germination:progress', sporeId, state);
  }

  private async validateSpore(spore: Spore): Promise<boolean> {
    // Check expiry
    if (spore.expiresAt > 0 && Date.now() > spore.expiresAt) {
      return false;
    }

    // Check signature (simplified)
    if (!spore.signature || spore.signature.length === 0) {
      return false;
    }

    // Check entry points exist
    if (spore.bootstrap.entryPoints.length === 0) {
      return false;
    }

    return true;
  }

  private async findWorkingEntryPoint(
    entryPoints: EntryPoint[]
  ): Promise<EntryPoint | null> {
    // Sort by reliability
    const sorted = [...entryPoints].sort((a, b) => b.reliability - a.reliability);

    if (this.config.parallelAttempts) {
      // Try multiple entry points in parallel
      const batch = sorted.slice(0, this.config.parallelCount);
      const results = await Promise.all(
        batch.map(async ep => {
          for (const address of ep.addresses) {
            for (let i = 0; i < this.config.maxAttempts; i++) {
              const connected = await this.tryConnect(address);
              if (connected) {
                return ep;
              }
              await this.delay(this.config.retryDelay);
            }
          }
          return null;
        })
      );

      return results.find(r => r !== null) ?? null;
    } else {
      // Try sequentially
      for (const ep of sorted) {
        for (const address of ep.addresses) {
          for (let i = 0; i < this.config.maxAttempts; i++) {
            const connected = await this.tryConnect(address);
            if (connected) {
              return ep;
            }
            await this.delay(this.config.retryDelay);
          }
        }
      }
      return null;
    }
  }

  private async tryConnect(address: string): Promise<boolean> {
    try {
      return await Promise.race([
        this.connectToNode(address),
        this.timeout(this.config.connectionTimeout),
      ]);
    } catch {
      return false;
    }
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection timeout')), ms)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export { GerminationResult, GerminationState };
