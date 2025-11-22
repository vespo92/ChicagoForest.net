/**
 * Fair Exchange Protocol for the Nutrient Exchange System
 *
 * ============================================================================
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational
 * and conceptual exploration purposes only. This does NOT represent a working
 * system or proven technology. All concepts described herein are speculative.
 * ============================================================================
 *
 * THEORETICAL CONCEPT:
 * This module could potentially implement fair exchange protocols that ensure
 * both parties in a resource exchange receive their agreed-upon goods or
 * services, preventing fraud and ensuring trustless transactions.
 *
 * INSPIRATIONS:
 * - Atomic Swaps: Trustless cryptocurrency exchange
 * - Hash Time-Locked Contracts (HTLCs): Conditional payments
 * - Fair Exchange Protocols: Cryptographic fair exchange
 * - Escrow Systems: Third-party mediated transactions
 *
 * @packageDocumentation
 * @module @chicago-forest/nutrient-exchange/protocols
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type { ResourceType, Exchange } from '../types';

/**
 * A fair exchange transaction between two parties.
 *
 * THEORETICAL: This could ensure both parties receive their agreed
 * goods/services or neither does (atomicity).
 */
export interface FairExchangeTransaction {
  /** Unique transaction identifier */
  readonly id: string;

  /** Party A (typically the resource provider) */
  readonly partyA: NodeId;

  /** Party B (typically the credit provider) */
  readonly partyB: NodeId;

  /** Resource being exchanged by Party A */
  readonly resourceOffered: ExchangeItem;

  /** Credits being exchanged by Party B */
  readonly creditsOffered: number;

  /** Exchange mechanism in use */
  readonly mechanism: FairExchangeMechanism;

  /** Current transaction state */
  state: FairExchangeState;

  /** Escrow details */
  escrow: EscrowState;

  /** Timeout for the exchange */
  readonly timeout: number;

  /** Creation timestamp */
  readonly createdAt: number;

  /** Last state change timestamp */
  lastUpdated: number;

  /** Dispute details (if any) */
  dispute?: DisputeDetails;
}

/**
 * An item being exchanged.
 */
export interface ExchangeItem {
  /** Type of resource */
  readonly type: ResourceType;

  /** Amount of resource */
  readonly amount: number;

  /** Duration of access (for services) */
  readonly duration: number;

  /** Quality commitment */
  readonly quality: number;

  /** Commitment hash */
  readonly commitmentHash: string;
}

/**
 * Fair exchange mechanisms available.
 *
 * THEORETICAL: Different mechanisms offer different trade-offs
 * between security, speed, and resource requirements.
 */
export type FairExchangeMechanism =
  | 'hash-lock'       // Hash time-locked contracts
  | 'escrow'          // Third-party escrow
  | 'gradual'         // Gradual release of assets
  | 'optimistic'      // Optimistic with dispute resolution
  | 'cut-and-choose'; // Cryptographic cut-and-choose

/**
 * States of a fair exchange transaction.
 */
export type FairExchangeState =
  | 'initiated'       // Transaction created
  | 'committed'       // Both parties committed
  | 'locked'          // Assets locked in escrow
  | 'executing'       // Exchange in progress
  | 'revealing'       // Secrets being revealed
  | 'completed'       // Successfully finished
  | 'refunding'       // Refund in progress
  | 'refunded'        // Assets returned
  | 'disputed'        // In dispute
  | 'resolved'        // Dispute resolved
  | 'expired';        // Timed out

/**
 * Escrow state for a transaction.
 */
export interface EscrowState {
  /** Credits locked from Party A */
  creditsLockedA: number;

  /** Credits locked from Party B */
  creditsLockedB: number;

  /** Resource commitment locked */
  resourceCommitment: string;

  /** Escrow lock time */
  lockTime: number;

  /** Escrow release conditions */
  releaseConditions: ReleaseCondition[];

  /** Timeout action */
  timeoutAction: 'refund' | 'complete' | 'arbitrate';
}

/**
 * A condition for releasing escrowed assets.
 */
export interface ReleaseCondition {
  /** Condition type */
  readonly type: 'hash-reveal' | 'time-lock' | 'signature' | 'confirmation';

  /** Condition-specific parameters */
  readonly params: Record<string, unknown>;

  /** Whether condition is met */
  met: boolean;

  /** When condition was met */
  metAt?: number;
}

/**
 * Details of a dispute.
 */
export interface DisputeDetails {
  /** Dispute initiator */
  readonly initiatedBy: NodeId;

  /** Reason for dispute */
  readonly reason: string;

  /** Evidence provided */
  readonly evidence: DisputeEvidence[];

  /** Arbitrator (if any) */
  arbitrator?: NodeId;

  /** Resolution */
  resolution?: DisputeResolution;
}

/**
 * Evidence for a dispute.
 */
export interface DisputeEvidence {
  /** Evidence type */
  readonly type: 'delivery-proof' | 'quality-measurement' | 'timeout-proof' | 'witness-attestation';

  /** Evidence data reference */
  readonly dataRef: string;

  /** Timestamp */
  readonly timestamp: number;

  /** Submitting party */
  readonly submittedBy: NodeId;
}

/**
 * Resolution of a dispute.
 */
export interface DisputeResolution {
  /** Resolution type */
  readonly outcome: 'favor-a' | 'favor-b' | 'split' | 'mutual-refund';

  /** Credits awarded to Party A */
  readonly creditsToA: number;

  /** Credits awarded to Party B */
  readonly creditsToB: number;

  /** Resolution timestamp */
  readonly resolvedAt: number;

  /** Resolution reason */
  readonly reason: string;
}

/**
 * Configuration for the fair exchange protocol.
 */
export interface FairExchangeConfig {
  /** Default transaction timeout (ms) */
  defaultTimeout: number;

  /** Escrow deposit percentage */
  escrowDepositPct: number;

  /** Dispute filing deadline (ms after completion) */
  disputeDeadline: number;

  /** Arbitration fee percentage */
  arbitrationFeePct: number;

  /** Minimum confirmations required */
  minConfirmations: number;

  /** Gradual release interval (ms) */
  gradualReleaseInterval: number;

  /** Gradual release percentage per interval */
  gradualReleasePct: number;
}

/**
 * Events emitted by the fair exchange system.
 */
export interface FairExchangeEvents {
  'exchange:initiated': (transaction: FairExchangeTransaction) => void;
  'exchange:committed': (txId: string, party: NodeId) => void;
  'exchange:locked': (txId: string) => void;
  'exchange:executing': (txId: string) => void;
  'exchange:completed': (txId: string) => void;
  'exchange:refunded': (txId: string) => void;
  'exchange:expired': (txId: string) => void;
  'dispute:filed': (txId: string, details: DisputeDetails) => void;
  'dispute:resolved': (txId: string, resolution: DisputeResolution) => void;
  'escrow:locked': (txId: string, amount: number) => void;
  'escrow:released': (txId: string, recipient: NodeId, amount: number) => void;
  'condition:met': (txId: string, conditionType: string) => void;
}

/**
 * Default configuration values.
 */
export const DEFAULT_FAIR_EXCHANGE_CONFIG: FairExchangeConfig = {
  defaultTimeout: 30 * 60 * 1000, // 30 minutes
  escrowDepositPct: 0.1, // 10% deposit
  disputeDeadline: 24 * 60 * 60 * 1000, // 24 hours
  arbitrationFeePct: 0.05, // 5% fee
  minConfirmations: 3,
  gradualReleaseInterval: 60 * 1000, // 1 minute
  gradualReleasePct: 0.1, // 10% per interval
};

/**
 * FairExchangeProtocol - THEORETICAL trustless exchange implementation.
 *
 * This class might potentially enable secure resource exchange between
 * untrusted parties, ensuring fairness through cryptographic mechanisms
 * and escrow systems.
 *
 * DISCLAIMER: This is a conceptual implementation for educational purposes.
 * A real system would require cryptographic primitives, secure escrow,
 * and robust arbitration mechanisms.
 *
 * @example
 * ```typescript
 * // THEORETICAL usage example
 * const protocol = new FairExchangeProtocol();
 *
 * // Initiate a fair exchange
 * const tx = await protocol.initiateExchange({
 *   partyA: 'provider-123',
 *   partyB: 'consumer-456',
 *   resource: {
 *     type: 'bandwidth',
 *     amount: 1000000,
 *     duration: 3600000,
 *     quality: 0.95,
 *   },
 *   credits: 500,
 *   mechanism: 'hash-lock',
 * });
 *
 * // Party B commits their credits
 * await protocol.commit(tx.id, 'consumer-456');
 *
 * // Party A reveals the secret after service delivery
 * await protocol.revealSecret(tx.id, 'the-secret');
 * ```
 */
export class FairExchangeProtocol extends EventEmitter<FairExchangeEvents> {
  private readonly config: FairExchangeConfig;
  private readonly transactions: Map<string, FairExchangeTransaction> = new Map();
  private readonly secrets: Map<string, string> = new Map(); // txId -> secret
  private readonly hashes: Map<string, string> = new Map(); // txId -> hash
  private readonly nodeCredits: Map<NodeId, number> = new Map();

  /**
   * Creates a new FairExchangeProtocol instance.
   *
   * @param config - Configuration options
   */
  constructor(config: Partial<FairExchangeConfig> = {}) {
    super();
    this.config = { ...DEFAULT_FAIR_EXCHANGE_CONFIG, ...config };
  }

  /**
   * Initiates a new fair exchange transaction.
   *
   * THEORETICAL: This could create a transaction with appropriate
   * escrow and release conditions based on the selected mechanism.
   *
   * @param params - Exchange parameters
   * @returns The initiated transaction
   */
  async initiateExchange(params: {
    partyA: NodeId;
    partyB: NodeId;
    resource: Omit<ExchangeItem, 'commitmentHash'>;
    credits: number;
    mechanism: FairExchangeMechanism;
    timeout?: number;
  }): Promise<FairExchangeTransaction> {
    const { partyA, partyB, resource, credits, mechanism, timeout = this.config.defaultTimeout } = params;

    // THEORETICAL: Generate commitment hash
    const commitmentHash = await this.generateCommitmentHash(resource);

    const exchangeItem: ExchangeItem = {
      ...resource,
      commitmentHash,
    };

    // THEORETICAL: Set up release conditions based on mechanism
    const releaseConditions = this.createReleaseConditions(mechanism);

    const transaction: FairExchangeTransaction = {
      id: this.generateTransactionId(),
      partyA,
      partyB,
      resourceOffered: exchangeItem,
      creditsOffered: credits,
      mechanism,
      state: 'initiated',
      escrow: {
        creditsLockedA: 0,
        creditsLockedB: 0,
        resourceCommitment: commitmentHash,
        lockTime: 0,
        releaseConditions,
        timeoutAction: 'refund',
      },
      timeout,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    this.transactions.set(transaction.id, transaction);

    // THEORETICAL: Generate and store secret for hash-lock mechanism
    if (mechanism === 'hash-lock') {
      const secret = this.generateSecret();
      const hash = await this.hashSecret(secret);
      this.secrets.set(transaction.id, secret);
      this.hashes.set(transaction.id, hash);
    }

    this.emit('exchange:initiated', transaction);

    // Schedule timeout
    this.scheduleTimeout(transaction.id, timeout);

    return transaction;
  }

  /**
   * Commits a party to the exchange by locking their assets.
   *
   * THEORETICAL: This could lock credits or resources in escrow
   * until release conditions are met.
   *
   * @param txId - Transaction ID
   * @param party - Party committing
   */
  async commit(txId: string, party: NodeId): Promise<void> {
    const tx = this.transactions.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    if (tx.state !== 'initiated' && tx.state !== 'committed') {
      throw new Error('Invalid transaction state for commit');
    }

    if (party !== tx.partyA && party !== tx.partyB) {
      throw new Error('Party not part of transaction');
    }

    // THEORETICAL: Lock appropriate assets
    if (party === tx.partyB) {
      // Lock credits from Party B (consumer)
      const deposit = Math.floor(tx.creditsOffered * (1 + this.config.escrowDepositPct));
      tx.escrow.creditsLockedB = deposit;
      this.emit('escrow:locked', txId, deposit);
    } else {
      // Party A commits resource (provider)
      tx.escrow.creditsLockedA = Math.floor(tx.creditsOffered * this.config.escrowDepositPct);
      this.emit('escrow:locked', txId, tx.escrow.creditsLockedA);
    }

    this.emit('exchange:committed', txId, party);
    tx.lastUpdated = Date.now();

    // Check if both parties committed
    if (tx.escrow.creditsLockedA > 0 && tx.escrow.creditsLockedB > 0) {
      await this.transitionToLocked(tx);
    }
  }

  /**
   * Transitions transaction to locked state.
   *
   * @param tx - Transaction to transition
   */
  private async transitionToLocked(tx: FairExchangeTransaction): Promise<void> {
    tx.state = 'locked';
    tx.escrow.lockTime = Date.now();
    tx.lastUpdated = Date.now();

    this.emit('exchange:locked', tx.id);

    // For hash-lock, we can proceed to executing
    if (tx.mechanism === 'hash-lock') {
      tx.state = 'executing';
      this.emit('exchange:executing', tx.id);
    }
  }

  /**
   * Reveals the secret to claim escrowed assets (for hash-lock mechanism).
   *
   * THEORETICAL: This could verify the secret matches the hash and
   * release escrowed credits to the provider.
   *
   * Inspired by Hash Time-Locked Contracts (HTLCs) used in atomic swaps.
   *
   * @param txId - Transaction ID
   * @param secret - Secret to reveal
   */
  async revealSecret(txId: string, secret: string): Promise<void> {
    const tx = this.transactions.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    if (tx.mechanism !== 'hash-lock') {
      throw new Error('Secret reveal only for hash-lock mechanism');
    }

    if (tx.state !== 'executing') {
      throw new Error('Invalid state for secret reveal');
    }

    const storedSecret = this.secrets.get(txId);
    const expectedHash = this.hashes.get(txId);

    if (!storedSecret || !expectedHash) {
      throw new Error('Hash-lock not initialized');
    }

    // THEORETICAL: Verify secret matches hash
    const revealedHash = await this.hashSecret(secret);
    if (revealedHash !== expectedHash) {
      throw new Error('Invalid secret');
    }

    tx.state = 'revealing';
    tx.lastUpdated = Date.now();

    // Mark hash-reveal condition as met
    const hashCondition = tx.escrow.releaseConditions.find(c => c.type === 'hash-reveal');
    if (hashCondition) {
      hashCondition.met = true;
      hashCondition.metAt = Date.now();
      this.emit('condition:met', txId, 'hash-reveal');
    }

    // Check all conditions
    await this.checkReleaseConditions(tx);
  }

  /**
   * Confirms resource delivery (for optimistic mechanism).
   *
   * THEORETICAL: This could allow the consumer to confirm receipt
   * and trigger credit release to the provider.
   *
   * @param txId - Transaction ID
   * @param party - Confirming party
   */
  async confirmDelivery(txId: string, party: NodeId): Promise<void> {
    const tx = this.transactions.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    if (party !== tx.partyB) {
      throw new Error('Only consumer can confirm delivery');
    }

    // Mark confirmation condition as met
    const confirmCondition = tx.escrow.releaseConditions.find(c => c.type === 'confirmation');
    if (confirmCondition) {
      confirmCondition.met = true;
      confirmCondition.metAt = Date.now();
      this.emit('condition:met', txId, 'confirmation');
    }

    await this.checkReleaseConditions(tx);
  }

  /**
   * Files a dispute for a transaction.
   *
   * THEORETICAL: This could initiate an arbitration process for
   * transactions where parties disagree on outcome.
   *
   * @param txId - Transaction ID
   * @param initiatedBy - Disputing party
   * @param reason - Dispute reason
   * @param evidence - Supporting evidence
   */
  async fileDispute(
    txId: string,
    initiatedBy: NodeId,
    reason: string,
    evidence: Omit<DisputeEvidence, 'timestamp' | 'submittedBy'>[]
  ): Promise<void> {
    const tx = this.transactions.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    if (initiatedBy !== tx.partyA && initiatedBy !== tx.partyB) {
      throw new Error('Only parties can file disputes');
    }

    const fullEvidence: DisputeEvidence[] = evidence.map(e => ({
      ...e,
      timestamp: Date.now(),
      submittedBy: initiatedBy,
    }));

    tx.dispute = {
      initiatedBy,
      reason,
      evidence: fullEvidence,
    };

    tx.state = 'disputed';
    tx.lastUpdated = Date.now();

    this.emit('dispute:filed', txId, tx.dispute);
  }

  /**
   * Resolves a dispute (typically by an arbitrator).
   *
   * THEORETICAL: This could implement various dispute resolution
   * strategies from simple majority to complex arbitration.
   *
   * @param txId - Transaction ID
   * @param resolution - Dispute resolution
   */
  async resolveDispute(txId: string, resolution: Omit<DisputeResolution, 'resolvedAt'>): Promise<void> {
    const tx = this.transactions.get(txId);
    if (!tx || !tx.dispute) {
      throw new Error('Transaction or dispute not found');
    }

    const fullResolution: DisputeResolution = {
      ...resolution,
      resolvedAt: Date.now(),
    };

    tx.dispute.resolution = fullResolution;
    tx.state = 'resolved';
    tx.lastUpdated = Date.now();

    // THEORETICAL: Distribute escrowed funds according to resolution
    await this.distributeEscrow(tx, fullResolution);

    this.emit('dispute:resolved', txId, fullResolution);
  }

  /**
   * Gets the hash for a transaction (for hash-lock mechanism).
   *
   * THEORETICAL: The consumer would use this hash to verify the
   * provider's secret reveal.
   *
   * @param txId - Transaction ID
   * @returns The hash or null if not available
   */
  getTransactionHash(txId: string): string | null {
    return this.hashes.get(txId) ?? null;
  }

  /**
   * Gets the current state of a transaction.
   *
   * @param txId - Transaction ID
   * @returns Transaction state or null if not found
   */
  getTransaction(txId: string): FairExchangeTransaction | null {
    return this.transactions.get(txId) ?? null;
  }

  /**
   * Gets all transactions for a node.
   *
   * @param nodeId - Node to query
   * @returns Transactions involving the node
   */
  getNodeTransactions(nodeId: NodeId): FairExchangeTransaction[] {
    return Array.from(this.transactions.values()).filter(
      tx => tx.partyA === nodeId || tx.partyB === nodeId
    );
  }

  /**
   * Gets protocol statistics.
   *
   * @returns Fair exchange statistics
   */
  getStats(): FairExchangeStats {
    let initiated = 0;
    let completed = 0;
    let disputed = 0;
    let refunded = 0;
    let totalVolume = 0;

    for (const tx of this.transactions.values()) {
      switch (tx.state) {
        case 'initiated':
        case 'committed':
        case 'locked':
        case 'executing':
          initiated++;
          break;
        case 'completed':
        case 'resolved':
          completed++;
          totalVolume += tx.creditsOffered;
          break;
        case 'disputed':
          disputed++;
          break;
        case 'refunded':
        case 'expired':
          refunded++;
          break;
      }
    }

    return {
      activeTransactions: initiated,
      completedTransactions: completed,
      disputedTransactions: disputed,
      refundedTransactions: refunded,
      totalVolumeExchanged: totalVolume,
      disputeRate: completed + disputed > 0
        ? disputed / (completed + disputed)
        : 0,
    };
  }

  // Private helper methods

  private createReleaseConditions(mechanism: FairExchangeMechanism): ReleaseCondition[] {
    switch (mechanism) {
      case 'hash-lock':
        return [
          { type: 'hash-reveal', params: {}, met: false },
          { type: 'time-lock', params: { minTime: Date.now() }, met: true },
        ];
      case 'escrow':
        return [
          { type: 'confirmation', params: { requiredConfirmations: this.config.minConfirmations }, met: false },
        ];
      case 'optimistic':
        return [
          { type: 'confirmation', params: {}, met: false },
          { type: 'time-lock', params: { deadline: Date.now() + this.config.disputeDeadline }, met: false },
        ];
      default:
        return [{ type: 'confirmation', params: {}, met: false }];
    }
  }

  private async checkReleaseConditions(tx: FairExchangeTransaction): Promise<void> {
    const allMet = tx.escrow.releaseConditions.every(c => c.met);

    if (allMet) {
      await this.completeExchange(tx);
    }
  }

  private async completeExchange(tx: FairExchangeTransaction): Promise<void> {
    tx.state = 'completed';
    tx.lastUpdated = Date.now();

    // THEORETICAL: Release escrowed credits to provider
    const providerCredits = this.nodeCredits.get(tx.partyA) ?? 0;
    this.nodeCredits.set(tx.partyA, providerCredits + tx.creditsOffered);
    this.emit('escrow:released', tx.id, tx.partyA, tx.creditsOffered);

    // Return deposit to provider
    if (tx.escrow.creditsLockedA > 0) {
      const current = this.nodeCredits.get(tx.partyA) ?? 0;
      this.nodeCredits.set(tx.partyA, current + tx.escrow.creditsLockedA);
      this.emit('escrow:released', tx.id, tx.partyA, tx.escrow.creditsLockedA);
    }

    // Return excess deposit to consumer
    const consumerReturn = tx.escrow.creditsLockedB - tx.creditsOffered;
    if (consumerReturn > 0) {
      const current = this.nodeCredits.get(tx.partyB) ?? 0;
      this.nodeCredits.set(tx.partyB, current + consumerReturn);
      this.emit('escrow:released', tx.id, tx.partyB, consumerReturn);
    }

    this.emit('exchange:completed', tx.id);
  }

  private async distributeEscrow(tx: FairExchangeTransaction, resolution: DisputeResolution): Promise<void> {
    // Distribute according to resolution
    if (resolution.creditsToA > 0) {
      const current = this.nodeCredits.get(tx.partyA) ?? 0;
      this.nodeCredits.set(tx.partyA, current + resolution.creditsToA);
      this.emit('escrow:released', tx.id, tx.partyA, resolution.creditsToA);
    }

    if (resolution.creditsToB > 0) {
      const current = this.nodeCredits.get(tx.partyB) ?? 0;
      this.nodeCredits.set(tx.partyB, current + resolution.creditsToB);
      this.emit('escrow:released', tx.id, tx.partyB, resolution.creditsToB);
    }
  }

  private async refundTransaction(tx: FairExchangeTransaction): Promise<void> {
    tx.state = 'refunding';
    tx.lastUpdated = Date.now();

    // Return all locked credits
    if (tx.escrow.creditsLockedA > 0) {
      const current = this.nodeCredits.get(tx.partyA) ?? 0;
      this.nodeCredits.set(tx.partyA, current + tx.escrow.creditsLockedA);
      this.emit('escrow:released', tx.id, tx.partyA, tx.escrow.creditsLockedA);
    }

    if (tx.escrow.creditsLockedB > 0) {
      const current = this.nodeCredits.get(tx.partyB) ?? 0;
      this.nodeCredits.set(tx.partyB, current + tx.escrow.creditsLockedB);
      this.emit('escrow:released', tx.id, tx.partyB, tx.escrow.creditsLockedB);
    }

    tx.state = 'refunded';
    this.emit('exchange:refunded', tx.id);
  }

  private scheduleTimeout(txId: string, timeout: number): void {
    setTimeout(async () => {
      const tx = this.transactions.get(txId);
      if (tx && !['completed', 'resolved', 'refunded', 'expired'].includes(tx.state)) {
        tx.state = 'expired';
        tx.lastUpdated = Date.now();

        if (tx.escrow.timeoutAction === 'refund') {
          await this.refundTransaction(tx);
        }

        this.emit('exchange:expired', txId);
      }
    }, timeout);
  }

  private async generateCommitmentHash(resource: Omit<ExchangeItem, 'commitmentHash'>): Promise<string> {
    // THEORETICAL: Would generate cryptographic hash of resource commitment
    return `commitment-${resource.type}-${resource.amount}-${Date.now()}`;
  }

  private generateSecret(): string {
    // THEORETICAL: Would generate cryptographically secure random secret
    return `secret-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }

  private async hashSecret(secret: string): Promise<string> {
    // THEORETICAL: Would use cryptographic hash function (SHA-256, etc.)
    return `hash-${secret.length}-${secret.slice(0, 8)}`;
  }

  private generateTransactionId(): string {
    return `fair-exchange-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

/**
 * Statistics about fair exchange activity.
 */
export interface FairExchangeStats {
  activeTransactions: number;
  completedTransactions: number;
  disputedTransactions: number;
  refundedTransactions: number;
  totalVolumeExchanged: number;
  disputeRate: number;
}
