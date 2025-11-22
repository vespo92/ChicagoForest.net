/**
 * Distribution Manager - Methods for spreading spores across the network
 */

import { EventEmitter } from 'eventemitter3';
import type { Spore, SporeEvents, DistributionMethod } from '../types';

/**
 * Configuration for distribution channels
 */
export interface DistributionConfig {
  /** Enable P2P distribution */
  enableP2P: boolean;

  /** Enable IPFS distribution */
  enableIPFS: boolean;

  /** Enable mesh broadcast */
  enableMesh: boolean;

  /** Maximum concurrent distributions */
  maxConcurrent: number;

  /** Distribution timeout (ms) */
  timeout: number;
}

const DEFAULT_CONFIG: DistributionConfig = {
  enableP2P: true,
  enableIPFS: true,
  enableMesh: true,
  maxConcurrent: 10,
  timeout: 30000,
};

/**
 * Result of a distribution attempt
 */
export interface DistributionResult {
  /** Whether distribution was successful */
  success: boolean;

  /** Method used */
  method: DistributionMethod;

  /** Distribution endpoint/address */
  endpoint: string;

  /** Time taken (ms) */
  duration: number;

  /** Error if failed */
  error?: string;
}

/**
 * Manages spore distribution across multiple channels
 */
export class DistributionManager extends EventEmitter<SporeEvents> {
  private config: DistributionConfig;
  private activeDistributions: Map<string, Set<DistributionMethod>> = new Map();

  constructor(config: Partial<DistributionConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Distribute a spore using the specified method
   */
  async distribute(
    spore: Spore,
    method?: DistributionMethod
  ): Promise<DistributionResult> {
    const effectiveMethod = method ?? spore.distribution.method;
    const startTime = Date.now();

    // Track active distribution
    if (!this.activeDistributions.has(spore.id)) {
      this.activeDistributions.set(spore.id, new Set());
    }
    this.activeDistributions.get(spore.id)!.add(effectiveMethod);

    try {
      let endpoint: string;

      switch (effectiveMethod) {
        case 'p2p':
          endpoint = await this.distributeP2P(spore);
          break;
        case 'ipfs':
          endpoint = await this.distributeIPFS(spore);
          break;
        case 'qr':
          endpoint = await this.generateQR(spore);
          break;
        case 'mesh':
          endpoint = await this.broadcastMesh(spore);
          break;
        case 'http':
          endpoint = await this.distributeHTTP(spore);
          break;
        case 'usb':
          endpoint = this.prepareUSB(spore);
          break;
        default:
          throw new Error(`Unsupported distribution method: ${effectiveMethod}`);
      }

      const result: DistributionResult = {
        success: true,
        method: effectiveMethod,
        endpoint,
        duration: Date.now() - startTime,
      };

      this.emit('spore:distributed', spore, effectiveMethod);
      return result;
    } catch (error) {
      return {
        success: false,
        method: effectiveMethod,
        endpoint: '',
        duration: Date.now() - startTime,
        error: String(error),
      };
    } finally {
      this.activeDistributions.get(spore.id)?.delete(effectiveMethod);
    }
  }

  /**
   * Distribute using all enabled methods
   */
  async distributeAll(spore: Spore): Promise<DistributionResult[]> {
    const methods: DistributionMethod[] = [];

    if (this.config.enableP2P) methods.push('p2p');
    if (this.config.enableIPFS) methods.push('ipfs');
    if (this.config.enableMesh) methods.push('mesh');

    const results = await Promise.all(
      methods.map(method => this.distribute(spore, method))
    );

    return results;
  }

  /**
   * Check if a spore is currently being distributed
   */
  isDistributing(sporeId: string): boolean {
    const methods = this.activeDistributions.get(sporeId);
    return methods !== undefined && methods.size > 0;
  }

  // Private distribution methods

  private async distributeP2P(spore: Spore): Promise<string> {
    // Would create torrent and seed it
    const infoHash = Buffer.from(spore.id).toString('hex').slice(0, 40);
    return `magnet:?xt=urn:btih:${infoHash}&dn=forest-spore-${spore.id}`;
  }

  private async distributeIPFS(spore: Spore): Promise<string> {
    // Would pin to IPFS and return CID
    const mockCID = `Qm${Buffer.from(spore.id).toString('base64').slice(0, 44)}`;
    return `ipfs://${mockCID}`;
  }

  private async generateQR(spore: Spore): Promise<string> {
    // Would generate QR code image
    const data = Buffer.from(JSON.stringify({
      id: spore.id,
      ep: spore.bootstrap.entryPoints[0]?.addresses[0],
    })).toString('base64');
    return `forest://qr/${data}`;
  }

  private async broadcastMesh(spore: Spore): Promise<string> {
    // Would broadcast via mesh network
    return `mesh://broadcast/${spore.id}`;
  }

  private async distributeHTTP(spore: Spore): Promise<string> {
    // Would upload to HTTP endpoint
    return `https://spores.forest.net/${spore.id}`;
  }

  private prepareUSB(spore: Spore): string {
    // Would prepare file for USB drive
    return `/spores/${spore.id}.spore`;
  }
}

export { DistributionMethod };
