/**
 * Exchange Manager - Matching offers with requests
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  ResourceOffer,
  ResourceRequest,
  Exchange,
  ExchangeResult,
  ExchangeStatus,
  NutrientEvents,
  ResourceType,
} from '../types';
import { ResourceManager } from '../resources';
import { CreditLedger } from '../credits';

/**
 * Configuration for exchange matching
 */
export interface ExchangeConfig {
  /** Maximum pending requests per node */
  maxPendingRequests: number;

  /** Request expiry time (ms) */
  requestExpiry: number;

  /** Enable automatic matching */
  autoMatch: boolean;

  /** Matching interval (ms) */
  matchInterval: number;

  /** Escrow percentage (0-1) */
  escrowPercentage: number;
}

const DEFAULT_CONFIG: ExchangeConfig = {
  maxPendingRequests: 10,
  requestExpiry: 3600000, // 1 hour
  autoMatch: true,
  matchInterval: 5000,
  escrowPercentage: 0.1,
};

/**
 * Manages resource exchange matching and execution
 */
export class ExchangeManager extends EventEmitter<NutrientEvents> {
  private config: ExchangeConfig;
  private localNodeId: NodeId;
  private requests: Map<string, ResourceRequest> = new Map();
  private exchanges: Map<string, Exchange> = new Map();
  private matchTimer?: ReturnType<typeof setInterval>;

  // External managers
  private resourceManager?: ResourceManager;
  private creditLedger?: CreditLedger;

  // Callback to get available offers from network
  private getOffers: () => ResourceOffer[] = () => [];

  constructor(localNodeId: NodeId, config: Partial<ExchangeConfig> = {}) {
    super();
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set resource manager
   */
  setResourceManager(manager: ResourceManager): void {
    this.resourceManager = manager;
  }

  /**
   * Set credit ledger
   */
  setCreditLedger(ledger: CreditLedger): void {
    this.creditLedger = ledger;
  }

  /**
   * Set offer provider
   */
  setOfferProvider(provider: () => ResourceOffer[]): void {
    this.getOffers = provider;
  }

  /**
   * Start the exchange manager
   */
  start(): void {
    if (this.config.autoMatch) {
      this.matchTimer = setInterval(
        () => this.matchAll(),
        this.config.matchInterval
      );
    }
  }

  /**
   * Stop the exchange manager
   */
  stop(): void {
    if (this.matchTimer) {
      clearInterval(this.matchTimer);
      this.matchTimer = undefined;
    }
  }

  /**
   * Create a request for resources
   */
  createRequest(
    resourceType: ResourceType,
    amount: number,
    duration: number,
    maxCredits: number,
    options: Partial<{
      minQuality: number;
      priority: 'low' | 'normal' | 'high' | 'urgent';
    }> = {}
  ): ResourceRequest {
    const request: ResourceRequest = {
      id: this.generateRequestId(),
      requester: this.localNodeId,
      resourceType,
      amount,
      minQuality: options.minQuality ?? 0.5,
      duration,
      maxCredits,
      createdAt: Date.now(),
      priority: options.priority ?? 'normal',
    };

    this.requests.set(request.id, request);
    this.emit('request:created', request);

    return request;
  }

  /**
   * Cancel a request
   */
  cancelRequest(requestId: string): boolean {
    return this.requests.delete(requestId);
  }

  /**
   * Find matching offers for a request
   */
  findMatches(request: ResourceRequest): ResourceOffer[] {
    const offers = this.getOffers();

    return offers.filter(offer => {
      // Must be active
      if (offer.status !== 'active') return false;

      // Must not be expired
      if (offer.expiresAt < Date.now()) return false;

      // Must have the right resource type
      const resource = offer.resources.find(r => r.type === request.resourceType);
      if (!resource) return false;

      // Must have enough quantity
      if (resource.available < request.amount) return false;

      // Must meet quality requirements
      if (resource.quality < request.minQuality) return false;

      // Must be within budget
      const totalCost = offer.pricePerUnit * request.amount * (request.duration / 3600000);
      if (totalCost > request.maxCredits) return false;

      return true;
    }).sort((a, b) => {
      // Sort by price (lowest first)
      return a.pricePerUnit - b.pricePerUnit;
    });
  }

  /**
   * Execute an exchange between a request and an offer
   */
  async executeExchange(
    request: ResourceRequest,
    offer: ResourceOffer
  ): Promise<ExchangeResult> {
    if (!this.creditLedger || !this.resourceManager) {
      return {
        success: false,
        exchangeId: '',
        creditsTransferred: 0,
        resourcesAllocated: [],
        startTime: 0,
        endTime: 0,
        error: 'Exchange system not fully initialized',
      };
    }

    const totalCost = offer.pricePerUnit * request.amount * (request.duration / 3600000);

    // Reserve credits from requester
    if (!this.creditLedger.reserve(request.requester, totalCost)) {
      return {
        success: false,
        exchangeId: '',
        creditsTransferred: 0,
        resourcesAllocated: [],
        startTime: 0,
        endTime: 0,
        error: 'Insufficient credits',
      };
    }

    // Reserve resources from provider
    if (!this.resourceManager.reserveResources(offer.id)) {
      this.creditLedger.unreserve(request.requester, totalCost);
      return {
        success: false,
        exchangeId: '',
        creditsTransferred: 0,
        resourcesAllocated: [],
        startTime: 0,
        endTime: 0,
        error: 'Resources no longer available',
      };
    }

    const now = Date.now();
    const exchange: Exchange = {
      id: this.generateExchangeId(),
      offer,
      request,
      provider: offer.offerer,
      consumer: request.requester,
      creditsLocked: totalCost,
      status: 'active',
      startTime: now,
      endTime: now + request.duration,
      usage: {
        amountUsed: 0,
        qualityDelivered: 0,
        uptime: 1,
        satisfaction: 1,
      },
    };

    this.exchanges.set(exchange.id, exchange);
    this.requests.delete(request.id);

    this.emit('offer:matched', offer, request);
    this.emit('exchange:started', exchange);

    // Schedule completion
    setTimeout(
      () => this.completeExchange(exchange.id),
      request.duration
    );

    return {
      success: true,
      exchangeId: exchange.id,
      creditsTransferred: totalCost,
      resourcesAllocated: offer.resources,
      startTime: now,
      endTime: now + request.duration,
    };
  }

  /**
   * Complete an exchange
   */
  completeExchange(exchangeId: string): void {
    const exchange = this.exchanges.get(exchangeId);
    if (!exchange || exchange.status !== 'active') return;

    // Transfer credits to provider
    if (this.creditLedger) {
      this.creditLedger.unreserve(exchange.consumer, exchange.creditsLocked);
      this.creditLedger.transfer(
        exchange.consumer,
        exchange.provider,
        exchange.creditsLocked
      );
    }

    // Release resources
    if (this.resourceManager) {
      this.resourceManager.fulfillOffer(exchange.offer.id);
    }

    exchange.status = 'completed';
    this.emit('request:fulfilled', exchange.request, exchange);
    this.emit('exchange:completed', exchange);
  }

  /**
   * Report a dispute
   */
  disputeExchange(exchangeId: string, reason: string): void {
    const exchange = this.exchanges.get(exchangeId);
    if (!exchange || exchange.status !== 'active') return;

    exchange.status = 'disputed';
    this.emit('exchange:disputed', exchange, reason);
  }

  /**
   * Get all active exchanges
   */
  getActiveExchanges(): Exchange[] {
    return Array.from(this.exchanges.values())
      .filter(e => e.status === 'active');
  }

  /**
   * Get all pending requests
   */
  getPendingRequests(): ResourceRequest[] {
    const now = Date.now();
    return Array.from(this.requests.values())
      .filter(r => r.createdAt + this.config.requestExpiry > now);
  }

  // Private methods

  private matchAll(): void {
    for (const request of this.getPendingRequests()) {
      const matches = this.findMatches(request);
      if (matches.length > 0) {
        this.executeExchange(request, matches[0]).catch(console.error);
      }
    }
  }

  private generateRequestId(): string {
    return `req_${this.localNodeId.slice(0, 8)}_${Date.now().toString(36)}`;
  }

  private generateExchangeId(): string {
    return `exc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export { Exchange, ExchangeResult, ExchangeStatus };
