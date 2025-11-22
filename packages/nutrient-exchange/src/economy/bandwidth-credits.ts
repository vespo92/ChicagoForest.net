/**
 * Bandwidth Credit System for the Nutrient Exchange Economy
 *
 * ============================================================================
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational
 * and conceptual exploration purposes only. This does NOT represent a working
 * system or proven technology. All concepts described herein are speculative
 * and inspired by existing technologies like BitTorrent's tit-for-tat and
 * Filecoin's proof-of-storage mechanisms.
 * ============================================================================
 *
 * THEORETICAL CONCEPT:
 * This module could potentially model bandwidth as a tradeable resource within
 * a decentralized network. Inspired by how mycorrhizal networks share nutrients
 * between trees, this system might enable fair bandwidth allocation between
 * participating nodes.
 *
 * INSPIRATIONS:
 * - BitTorrent's tit-for-tat: Peers who upload more get faster downloads
 * - Filecoin's proof-of-storage: Verifiable resource contribution
 * - Tor's incentive proposals: Anonymous bandwidth sharing
 *
 * @packageDocumentation
 * @module @chicago-forest/nutrient-exchange/economy
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type { Resource, CreditBalance, ResourceType } from '../types';

/**
 * Represents bandwidth as a quantifiable, tradeable resource unit.
 *
 * THEORETICAL: This interface might enable bandwidth to be metered and
 * credited in a decentralized economy.
 */
export interface BandwidthCredit {
  /** Unique credit identifier */
  readonly id: string;

  /** Amount of bandwidth represented (bytes transferred) */
  readonly amount: number;

  /** Quality tier (affects credit multiplier) */
  readonly tier: BandwidthTier;

  /** Timestamp when credit was earned */
  readonly earnedAt: number;

  /** Expiration timestamp (0 = never expires) */
  readonly expiresAt: number;

  /** Node that earned this credit */
  readonly earnedBy: NodeId;

  /** Verification proof hash */
  readonly proofHash: string;
}

/**
 * Bandwidth quality tiers that could potentially affect credit value.
 *
 * THEORETICAL: Higher quality bandwidth might earn more credits in a
 * functioning system.
 */
export type BandwidthTier =
  | 'best-effort'  // Standard quality, 1x multiplier
  | 'reliable'     // Guaranteed uptime, 1.5x multiplier
  | 'premium'      // High-speed + low latency, 2x multiplier
  | 'backbone';    // Infrastructure-grade, 3x multiplier

/**
 * Configuration for the bandwidth credit system.
 */
export interface BandwidthCreditConfig {
  /** Base credits per GB transferred */
  creditsPerGB: number;

  /** Multipliers for each bandwidth tier */
  tierMultipliers: Record<BandwidthTier, number>;

  /** Credit decay rate (per day, 0-1) */
  decayRate: number;

  /** Minimum transfer size to earn credits */
  minimumTransferBytes: number;

  /** Maximum credits earnable per hour per node */
  hourlyEarningCap: number;

  /** Proof verification threshold (0-1) */
  proofThreshold: number;
}

/**
 * Events emitted by the bandwidth credit system.
 */
export interface BandwidthCreditEvents {
  'credit:earned': (credit: BandwidthCredit) => void;
  'credit:spent': (creditId: string, amount: number) => void;
  'credit:expired': (creditId: string) => void;
  'credit:verified': (creditId: string, valid: boolean) => void;
  'tier:upgraded': (nodeId: NodeId, oldTier: BandwidthTier, newTier: BandwidthTier) => void;
  'balance:updated': (nodeId: NodeId, balance: number) => void;
}

/**
 * Default configuration values for the bandwidth credit system.
 *
 * THEORETICAL: These values are illustrative and would require extensive
 * economic modeling to determine optimal real-world parameters.
 */
export const DEFAULT_BANDWIDTH_CONFIG: BandwidthCreditConfig = {
  creditsPerGB: 100,
  tierMultipliers: {
    'best-effort': 1.0,
    'reliable': 1.5,
    'premium': 2.0,
    'backbone': 3.0,
  },
  decayRate: 0.01, // 1% per day
  minimumTransferBytes: 1024 * 1024, // 1 MB minimum
  hourlyEarningCap: 10000,
  proofThreshold: 0.95,
};

/**
 * BandwidthCreditManager - THEORETICAL bandwidth economy implementation.
 *
 * This class might potentially manage the creation, verification, and exchange
 * of bandwidth credits within a decentralized network. Inspired by BitTorrent's
 * reciprocity mechanisms and Filecoin's storage market.
 *
 * DISCLAIMER: This is a conceptual implementation for educational purposes.
 * A real system would require extensive cryptographic verification, consensus
 * mechanisms, and economic modeling.
 *
 * @example
 * ```typescript
 * // THEORETICAL usage example
 * const manager = new BandwidthCreditManager();
 *
 * // A node reports bandwidth contribution
 * const credit = await manager.recordContribution({
 *   nodeId: 'node-123',
 *   bytesTransferred: 1024 * 1024 * 100, // 100 MB
 *   tier: 'reliable',
 *   proof: 'proof-hash-here'
 * });
 *
 * console.log(`Earned ${credit.amount} credits`);
 * ```
 */
export class BandwidthCreditManager extends EventEmitter<BandwidthCreditEvents> {
  private readonly config: BandwidthCreditConfig;
  private readonly credits: Map<string, BandwidthCredit> = new Map();
  private readonly nodeBalances: Map<NodeId, number> = new Map();
  private readonly hourlyEarnings: Map<NodeId, { hour: number; amount: number }> = new Map();
  private readonly nodeTiers: Map<NodeId, BandwidthTier> = new Map();

  /**
   * Creates a new BandwidthCreditManager instance.
   *
   * THEORETICAL: In a real system, this would connect to a distributed
   * ledger or consensus mechanism for credit verification.
   *
   * @param config - Configuration options for the credit system
   */
  constructor(config: Partial<BandwidthCreditConfig> = {}) {
    super();
    this.config = { ...DEFAULT_BANDWIDTH_CONFIG, ...config };
  }

  /**
   * Records a bandwidth contribution and potentially awards credits.
   *
   * THEORETICAL: This method could validate bandwidth contributions and
   * award proportional credits based on the amount and quality of service.
   *
   * Inspired by BitTorrent's tit-for-tat: Nodes that contribute more
   * bandwidth earn more credits to spend on their own bandwidth needs.
   *
   * @param contribution - Details of the bandwidth contribution
   * @returns The earned credit if successful, null if rejected
   */
  async recordContribution(contribution: {
    nodeId: NodeId;
    bytesTransferred: number;
    tier: BandwidthTier;
    proof: string;
    recipientNode?: NodeId;
  }): Promise<BandwidthCredit | null> {
    const { nodeId, bytesTransferred, tier, proof } = contribution;

    // THEORETICAL: Validate minimum transfer size
    if (bytesTransferred < this.config.minimumTransferBytes) {
      return null;
    }

    // THEORETICAL: Check hourly earning cap
    if (this.isHourlyCapped(nodeId)) {
      return null;
    }

    // THEORETICAL: Verify proof of bandwidth contribution
    // In a real system, this would involve cryptographic verification
    const proofValid = await this.verifyProof(proof, bytesTransferred);
    if (!proofValid) {
      return null;
    }

    // Calculate credits earned
    const gbTransferred = bytesTransferred / (1024 * 1024 * 1024);
    const baseCredits = gbTransferred * this.config.creditsPerGB;
    const multiplier = this.config.tierMultipliers[tier];
    const earnedCredits = Math.floor(baseCredits * multiplier);

    // Create the credit
    const credit: BandwidthCredit = {
      id: this.generateCreditId(),
      amount: earnedCredits,
      tier,
      earnedAt: Date.now(),
      expiresAt: 0, // Could add expiration logic
      earnedBy: nodeId,
      proofHash: proof,
    };

    // Store and update balances
    this.credits.set(credit.id, credit);
    this.updateBalance(nodeId, earnedCredits);
    this.updateHourlyEarnings(nodeId, earnedCredits);

    this.emit('credit:earned', credit);

    return credit;
  }

  /**
   * Gets the current credit balance for a node.
   *
   * THEORETICAL: This might return the spendable balance after
   * accounting for reserved and expired credits.
   *
   * @param nodeId - The node to check balance for
   * @returns Current available credit balance
   */
  getBalance(nodeId: NodeId): number {
    return this.nodeBalances.get(nodeId) ?? 0;
  }

  /**
   * Spends credits from a node's balance.
   *
   * THEORETICAL: This could deduct credits when a node consumes
   * bandwidth from another node.
   *
   * @param nodeId - The node spending credits
   * @param amount - Amount of credits to spend
   * @returns True if successful, false if insufficient balance
   */
  spendCredits(nodeId: NodeId, amount: number): boolean {
    const balance = this.getBalance(nodeId);

    if (balance < amount) {
      return false;
    }

    this.updateBalance(nodeId, -amount);
    this.emit('balance:updated', nodeId, this.getBalance(nodeId));

    return true;
  }

  /**
   * Transfers credits between nodes.
   *
   * THEORETICAL: This might enable direct credit transfers for
   * bilateral resource agreements.
   *
   * @param from - Source node
   * @param to - Destination node
   * @param amount - Amount to transfer
   * @returns True if successful
   */
  transferCredits(from: NodeId, to: NodeId, amount: number): boolean {
    if (!this.spendCredits(from, amount)) {
      return false;
    }

    this.updateBalance(to, amount);
    this.emit('balance:updated', to, this.getBalance(to));

    return true;
  }

  /**
   * Gets the bandwidth tier for a node.
   *
   * THEORETICAL: Tier could be determined by historical contribution
   * quality and reliability metrics.
   *
   * @param nodeId - The node to check tier for
   * @returns The node's current bandwidth tier
   */
  getNodeTier(nodeId: NodeId): BandwidthTier {
    return this.nodeTiers.get(nodeId) ?? 'best-effort';
  }

  /**
   * Upgrades a node's bandwidth tier based on contribution history.
   *
   * THEORETICAL: This might automatically promote nodes that
   * consistently provide high-quality bandwidth.
   *
   * @param nodeId - The node to potentially upgrade
   * @param metrics - Performance metrics for evaluation
   */
  evaluateTierUpgrade(nodeId: NodeId, metrics: {
    uptimePercentage: number;
    averageSpeed: number;
    totalContributed: number;
    reliability: number;
  }): void {
    const currentTier = this.getNodeTier(nodeId);
    let newTier = currentTier;

    // THEORETICAL tier promotion logic
    // In a real system, these thresholds would be carefully calibrated
    if (metrics.reliability > 0.99 && metrics.totalContributed > 1e12) {
      newTier = 'backbone';
    } else if (metrics.reliability > 0.95 && metrics.totalContributed > 1e11) {
      newTier = 'premium';
    } else if (metrics.reliability > 0.90 && metrics.totalContributed > 1e10) {
      newTier = 'reliable';
    }

    if (newTier !== currentTier) {
      this.nodeTiers.set(nodeId, newTier);
      this.emit('tier:upgraded', nodeId, currentTier, newTier);
    }
  }

  /**
   * Calculates the exchange rate between bandwidth and other resources.
   *
   * THEORETICAL: This might enable dynamic pricing based on supply
   * and demand within the network.
   *
   * @param targetResource - The resource type to convert to
   * @returns Exchange rate (credits per unit of target resource)
   */
  getExchangeRate(targetResource: ResourceType): number {
    // THEORETICAL: These would be dynamically calculated based on
    // market conditions in a real implementation
    const baseRates: Record<ResourceType, number> = {
      bandwidth: 1.0,
      storage: 0.1,    // Storage is cheaper (persistent but slow)
      compute: 5.0,    // Compute is expensive (high demand)
      connectivity: 2.0, // Gateway access is valuable
    };

    return baseRates[targetResource];
  }

  /**
   * Applies credit decay to encourage active participation.
   *
   * THEORETICAL: Idle credits might slowly decay to prevent hoarding
   * and encourage continuous network participation.
   */
  applyDecay(): void {
    const decayFactor = 1 - this.config.decayRate;

    for (const [nodeId, balance] of this.nodeBalances) {
      const newBalance = Math.floor(balance * decayFactor);
      this.nodeBalances.set(nodeId, newBalance);
      this.emit('balance:updated', nodeId, newBalance);
    }
  }

  /**
   * Gets statistics about the bandwidth credit economy.
   *
   * THEORETICAL: This could provide insights into the health of
   * the network's resource sharing economy.
   *
   * @returns Economy statistics
   */
  getEconomyStats(): BandwidthEconomyStats {
    let totalCreditsInCirculation = 0;
    let totalNodes = 0;
    const tierDistribution: Record<BandwidthTier, number> = {
      'best-effort': 0,
      'reliable': 0,
      'premium': 0,
      'backbone': 0,
    };

    for (const balance of this.nodeBalances.values()) {
      totalCreditsInCirculation += balance;
      totalNodes++;
    }

    for (const tier of this.nodeTiers.values()) {
      tierDistribution[tier]++;
    }

    return {
      totalCreditsInCirculation,
      totalNodes,
      averageBalance: totalNodes > 0 ? totalCreditsInCirculation / totalNodes : 0,
      tierDistribution,
      configuredDecayRate: this.config.decayRate,
    };
  }

  // Private helper methods

  private isHourlyCapped(nodeId: NodeId): boolean {
    const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
    const hourlyData = this.hourlyEarnings.get(nodeId);

    if (!hourlyData || hourlyData.hour !== currentHour) {
      return false;
    }

    return hourlyData.amount >= this.config.hourlyEarningCap;
  }

  private updateHourlyEarnings(nodeId: NodeId, amount: number): void {
    const currentHour = Math.floor(Date.now() / (1000 * 60 * 60));
    const hourlyData = this.hourlyEarnings.get(nodeId);

    if (!hourlyData || hourlyData.hour !== currentHour) {
      this.hourlyEarnings.set(nodeId, { hour: currentHour, amount });
    } else {
      hourlyData.amount += amount;
    }
  }

  private updateBalance(nodeId: NodeId, delta: number): void {
    const current = this.nodeBalances.get(nodeId) ?? 0;
    this.nodeBalances.set(nodeId, Math.max(0, current + delta));
  }

  private async verifyProof(proof: string, bytesTransferred: number): Promise<boolean> {
    // THEORETICAL: In a real system, this would verify cryptographic
    // proofs of bandwidth contribution, potentially using:
    // - Merkle proofs of data transferred
    // - Challenge-response protocols
    // - Multi-party verification
    // - Zero-knowledge proofs
    return proof.length > 0 && bytesTransferred > 0;
  }

  private generateCreditId(): string {
    return `bw-credit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

/**
 * Statistics about the bandwidth credit economy.
 */
export interface BandwidthEconomyStats {
  totalCreditsInCirculation: number;
  totalNodes: number;
  averageBalance: number;
  tierDistribution: Record<BandwidthTier, number>;
  configuredDecayRate: number;
}
