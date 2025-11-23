/**
 * Resource Manager - Tracking and advertising available resources
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  Resource,
  ResourceType,
  ResourceOffer,
  NutrientEvents,
  OfferStatus,
} from '../types';

/**
 * Configuration for resource management
 */
export interface ResourceConfig {
  /** How often to re-measure resources (ms) */
  measurementInterval: number;

  /** Minimum offer duration (ms) */
  minOfferDuration: number;

  /** Default offer expiry (ms) */
  defaultOfferExpiry: number;

  /** Reserve margin for system use (0-1) */
  reserveMargin: number;
}

const DEFAULT_CONFIG: ResourceConfig = {
  measurementInterval: 60000,
  minOfferDuration: 3600000, // 1 hour
  defaultOfferExpiry: 86400000, // 24 hours
  reserveMargin: 0.2,
};

/**
 * Manages local resources and creates offers
 */
export class ResourceManager extends EventEmitter<NutrientEvents> {
  private config: ResourceConfig;
  private localNodeId: NodeId;
  private resources: Map<ResourceType, Resource> = new Map();
  private activeOffers: Map<string, ResourceOffer> = new Map();
  private measurementTimer?: ReturnType<typeof setInterval>;

  constructor(localNodeId: NodeId, config: Partial<ResourceConfig> = {}) {
    super();
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start resource monitoring
   */
  start(): void {
    this.measureResources();
    this.measurementTimer = setInterval(
      () => this.measureResources(),
      this.config.measurementInterval
    );
  }

  /**
   * Stop resource monitoring
   */
  stop(): void {
    if (this.measurementTimer) {
      clearInterval(this.measurementTimer);
      this.measurementTimer = undefined;
    }
  }

  /**
   * Get current resource availability
   */
  getResources(): Map<ResourceType, Resource> {
    return new Map(this.resources);
  }

  /**
   * Get a specific resource
   */
  getResource(type: ResourceType): Resource | undefined {
    return this.resources.get(type);
  }

  /**
   * Create an offer for a resource
   */
  createOffer(
    type: ResourceType,
    amount: number,
    pricePerUnit: number,
    options: Partial<{
      minCommitment: number;
      maxCommitment: number;
      expiresIn: number;
    }> = {}
  ): ResourceOffer | null {
    const resource = this.resources.get(type);
    if (!resource || resource.available < amount) {
      return null;
    }

    const now = Date.now();
    const offer: ResourceOffer = {
      id: this.generateOfferId(),
      offerer: this.localNodeId,
      resources: [{
        ...resource,
        available: amount,
      }],
      pricePerUnit,
      minCommitment: options.minCommitment ?? this.config.minOfferDuration,
      maxCommitment: options.maxCommitment ?? this.config.defaultOfferExpiry,
      createdAt: now,
      expiresAt: now + (options.expiresIn ?? this.config.defaultOfferExpiry),
      status: 'active',
    };

    this.activeOffers.set(offer.id, offer);
    this.emit('offer:created', offer);

    return offer;
  }

  /**
   * Cancel an offer
   */
  cancelOffer(offerId: string): boolean {
    const offer = this.activeOffers.get(offerId);
    if (offer && offer.status === 'active') {
      offer.status = 'cancelled';
      this.activeOffers.delete(offerId);
      return true;
    }
    return false;
  }

  /**
   * Get all active offers
   */
  getActiveOffers(): ResourceOffer[] {
    const now = Date.now();
    return Array.from(this.activeOffers.values())
      .filter(offer => {
        if (offer.expiresAt < now) {
          offer.status = 'expired';
          this.activeOffers.delete(offer.id);
          this.emit('offer:expired', offer.id);
          return false;
        }
        return offer.status === 'active';
      });
  }

  /**
   * Reserve resources for an exchange
   */
  reserveResources(offerId: string): boolean {
    const offer = this.activeOffers.get(offerId);
    if (offer && offer.status === 'active') {
      offer.status = 'reserved';
      return true;
    }
    return false;
  }

  /**
   * Release reserved resources
   */
  releaseResources(offerId: string): void {
    const offer = this.activeOffers.get(offerId);
    if (offer && offer.status === 'reserved') {
      offer.status = 'active';
    }
  }

  /**
   * Mark offer as fulfilled
   */
  fulfillOffer(offerId: string): void {
    const offer = this.activeOffers.get(offerId);
    if (offer) {
      offer.status = 'fulfilled';
      this.activeOffers.delete(offerId);
    }
  }

  // Private methods

  private measureResources(): void {
    // Measure available bandwidth
    this.resources.set('bandwidth', {
      type: 'bandwidth',
      available: this.measureBandwidth(),
      unit: 'bytes_per_second',
      quality: 0.9,
      availability: { start: 0, end: 0 },
    });

    // Measure available storage
    this.resources.set('storage', {
      type: 'storage',
      available: this.measureStorage(),
      unit: 'bytes',
      quality: 0.95,
      availability: { start: 0, end: 0 },
    });

    // Measure available compute
    this.resources.set('compute', {
      type: 'compute',
      available: this.measureCompute(),
      unit: 'flops',
      quality: 0.85,
      availability: { start: 0, end: 0 },
    });

    // Measure connectivity
    this.resources.set('connectivity', {
      type: 'connectivity',
      available: this.measureConnectivity(),
      unit: 'connections',
      quality: 1.0,
      availability: { start: 0, end: 0 },
    });
  }

  private measureBandwidth(): number {
    // Would measure actual network capacity
    // Returns bytes per second available
    return 100_000_000 * (1 - this.config.reserveMargin);
  }

  private measureStorage(): number {
    // Would measure actual disk space
    // Returns bytes available
    return 100_000_000_000 * (1 - this.config.reserveMargin);
  }

  private measureCompute(): number {
    // Would measure CPU/GPU capacity
    // Returns FLOPS available
    return 1_000_000_000 * (1 - this.config.reserveMargin);
  }

  private measureConnectivity(): number {
    // Would measure available connection slots
    return 50 * (1 - this.config.reserveMargin);
  }

  private generateOfferId(): string {
    return `offer_${this.localNodeId.slice(0, 8)}_${Date.now().toString(36)}`;
  }
}

export { Resource, ResourceType, ResourceOffer };
