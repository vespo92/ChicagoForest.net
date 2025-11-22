/**
 * Spore Factory - Creating and packaging spores for distribution
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  Spore,
  SporeConfig,
  SporeEvents,
  DistributionMethod,
  BootstrapConfig,
  EntryPoint,
} from '../types';

const DEFAULT_CONFIG: SporeConfig = {
  ttl: 7 * 24 * 60 * 60 * 1000, // 1 week
  distributionMethod: 'p2p',
  maxGerminations: 100,
  includeSoftware: false,
};

/**
 * Factory for creating and managing spores
 */
export class SporeFactory extends EventEmitter<SporeEvents> {
  private localNodeId: NodeId;
  private activeSpores: Map<string, Spore> = new Map();
  private config: SporeConfig;

  constructor(localNodeId: NodeId, config: Partial<SporeConfig> = {}) {
    super();
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a new spore for distribution
   */
  async createSpore(
    entryPoints: EntryPoint[],
    options: Partial<SporeConfig> = {}
  ): Promise<Spore> {
    const config = { ...this.config, ...options };
    const now = Date.now();

    const bootstrap: BootstrapConfig = {
      entryPoints,
      networkId: 'chicago-forest-v1',
      minVersion: '0.1.0',
      capabilities: ['relay', 'storage', 'compute'],
      region: config.targetRegion,
    };

    const spore: Spore = {
      id: this.generateSporeId(),
      version: '1.0.0',
      createdAt: now,
      expiresAt: config.ttl > 0 ? now + config.ttl : 0,
      parentNode: this.localNodeId,
      bootstrap,
      signature: '', // Would be signed in real implementation
      distribution: {
        method: config.distributionMethod,
        channel: 'default',
        germinationCount: 0,
        constraints: {
          maxGerminations: config.maxGerminations,
          allowedRegions: config.targetRegion ? [config.targetRegion] : undefined,
        },
      },
    };

    // Add software reference if requested
    if (config.includeSoftware) {
      spore.softwareCID = await this.getSoftwareCID();
      spore.magnetLink = await this.generateMagnetLink(spore);
    }

    // Sign the spore
    spore.signature = await this.signSpore(spore);

    this.activeSpores.set(spore.id, spore);
    this.emit('spore:created', spore);

    return spore;
  }

  /**
   * Validate a received spore
   */
  async validateSpore(spore: Spore): Promise<boolean> {
    // Check expiry
    if (spore.expiresAt > 0 && Date.now() > spore.expiresAt) {
      return false;
    }

    // Check germination limit
    if (
      spore.distribution.germinationCount >=
      spore.distribution.constraints.maxGerminations
    ) {
      return false;
    }

    // Verify signature
    const signatureValid = await this.verifySignature(spore);
    if (!signatureValid) {
      return false;
    }

    // Check entry points
    if (spore.bootstrap.entryPoints.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Serialize spore for distribution
   */
  serialize(spore: Spore): string {
    return Buffer.from(JSON.stringify(spore)).toString('base64');
  }

  /**
   * Deserialize a spore from string
   */
  deserialize(data: string): Spore {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
  }

  /**
   * Generate QR code data for a spore
   */
  toQRCode(spore: Spore): string {
    // Minimal spore data for QR code
    const minimal = {
      id: spore.id,
      ep: spore.bootstrap.entryPoints.slice(0, 3).map(e => ({
        n: e.nodeId,
        a: e.addresses[0],
      })),
      s: spore.signature.slice(0, 16),
    };
    return `forest://${Buffer.from(JSON.stringify(minimal)).toString('base64')}`;
  }

  /**
   * Get all active spores
   */
  getActiveSpores(): Spore[] {
    return Array.from(this.activeSpores.values());
  }

  /**
   * Revoke a spore
   */
  revokeSpore(sporeId: string): boolean {
    return this.activeSpores.delete(sporeId);
  }

  // Private methods

  private generateSporeId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    return `spore_${timestamp}_${random}`;
  }

  private async getSoftwareCID(): Promise<string> {
    // Would return actual IPFS CID of node software
    return 'bafybeig...'; // Placeholder
  }

  private async generateMagnetLink(spore: Spore): Promise<string> {
    // Would generate actual magnet link
    return `magnet:?xt=urn:btih:${spore.id}&dn=chicago-forest-node`;
  }

  private async signSpore(spore: Spore): Promise<string> {
    // Would sign with node's private key
    const data = JSON.stringify({
      id: spore.id,
      parentNode: spore.parentNode,
      bootstrap: spore.bootstrap,
      expiresAt: spore.expiresAt,
    });
    return Buffer.from(data).toString('base64').slice(0, 64);
  }

  private async verifySignature(spore: Spore): Promise<boolean> {
    // Would verify with parent node's public key
    return spore.signature.length > 0;
  }
}

export { Spore, SporeConfig, DistributionMethod };
