/**
 * Types for the nutrient exchange system
 */

import type { NodeId } from '@chicago-forest/shared-types';

/**
 * Types of resources that can be exchanged
 */
export type ResourceType = 'bandwidth' | 'storage' | 'compute' | 'connectivity';

/**
 * A resource instance
 */
export interface Resource {
  /** Resource type */
  type: ResourceType;

  /** Available amount */
  available: number;

  /** Unit of measurement */
  unit: ResourceUnit;

  /** Quality/speed rating (0-1) */
  quality: number;

  /** Time constraints */
  availability: AvailabilityWindow;
}

export type ResourceUnit =
  | 'bytes'           // Storage
  | 'bytes_per_second' // Bandwidth
  | 'flops'           // Compute
  | 'connections';    // Connectivity slots

export interface AvailabilityWindow {
  /** Start time (0 = always) */
  start: number;

  /** End time (0 = indefinite) */
  end: number;

  /** Recurring schedule (cron-like) */
  schedule?: string;
}

/**
 * An offer to provide resources
 */
export interface ResourceOffer {
  /** Unique offer ID */
  id: string;

  /** Node making the offer */
  offerer: NodeId;

  /** Resources being offered */
  resources: Resource[];

  /** Credit price per unit per hour */
  pricePerUnit: number;

  /** Minimum commitment period (ms) */
  minCommitment: number;

  /** Maximum commitment period (ms) */
  maxCommitment: number;

  /** Creation timestamp */
  createdAt: number;

  /** Expiry timestamp */
  expiresAt: number;

  /** Current status */
  status: OfferStatus;
}

export type OfferStatus = 'active' | 'reserved' | 'fulfilled' | 'expired' | 'cancelled';

/**
 * A request for resources
 */
export interface ResourceRequest {
  /** Unique request ID */
  id: string;

  /** Node making the request */
  requester: NodeId;

  /** Resource type needed */
  resourceType: ResourceType;

  /** Amount needed */
  amount: number;

  /** Minimum quality required */
  minQuality: number;

  /** Duration needed (ms) */
  duration: number;

  /** Maximum credits willing to pay */
  maxCredits: number;

  /** Creation timestamp */
  createdAt: number;

  /** Priority level */
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

/**
 * Credit balance for a node
 */
export interface CreditBalance {
  /** Node ID */
  nodeId: NodeId;

  /** Current credit balance */
  balance: number;

  /** Credits earned all-time */
  earned: number;

  /** Credits spent all-time */
  spent: number;

  /** Reserved credits (in pending exchanges) */
  reserved: number;

  /** Reputation multiplier (1.0 = normal) */
  reputationMultiplier: number;

  /** Last activity timestamp */
  lastActivity: number;
}

/**
 * Result of a resource exchange
 */
export interface ExchangeResult {
  /** Whether exchange was successful */
  success: boolean;

  /** Exchange ID */
  exchangeId: string;

  /** Credits transferred */
  creditsTransferred: number;

  /** Resources allocated */
  resourcesAllocated: Resource[];

  /** Start time of resource access */
  startTime: number;

  /** End time of resource access */
  endTime: number;

  /** Error if failed */
  error?: string;
}

/**
 * A completed or ongoing exchange
 */
export interface Exchange {
  /** Unique exchange ID */
  id: string;

  /** The offer being fulfilled */
  offer: ResourceOffer;

  /** The request being satisfied */
  request: ResourceRequest;

  /** Provider node */
  provider: NodeId;

  /** Consumer node */
  consumer: NodeId;

  /** Credits locked for this exchange */
  creditsLocked: number;

  /** Exchange status */
  status: ExchangeStatus;

  /** Start time */
  startTime: number;

  /** End time (actual or expected) */
  endTime: number;

  /** Resource usage metrics */
  usage: UsageMetrics;
}

export type ExchangeStatus =
  | 'pending'     // Waiting to start
  | 'active'      // Currently in progress
  | 'completed'   // Successfully finished
  | 'disputed'    // In dispute resolution
  | 'cancelled';  // Cancelled before completion

export interface UsageMetrics {
  /** Amount of resource used */
  amountUsed: number;

  /** Quality delivered */
  qualityDelivered: number;

  /** Uptime percentage */
  uptime: number;

  /** Consumer satisfaction (0-1) */
  satisfaction: number;
}

/**
 * Events emitted by the nutrient exchange system
 */
export interface NutrientEvents {
  'offer:created': (offer: ResourceOffer) => void;
  'offer:matched': (offer: ResourceOffer, request: ResourceRequest) => void;
  'offer:expired': (offerId: string) => void;
  'request:created': (request: ResourceRequest) => void;
  'request:fulfilled': (request: ResourceRequest, exchange: Exchange) => void;
  'exchange:started': (exchange: Exchange) => void;
  'exchange:completed': (exchange: Exchange) => void;
  'exchange:disputed': (exchange: Exchange, reason: string) => void;
  'credits:earned': (nodeId: NodeId, amount: number) => void;
  'credits:spent': (nodeId: NodeId, amount: number) => void;
}
