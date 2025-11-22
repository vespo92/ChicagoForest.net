/**
 * Credit System - Tracking resource exchange currency
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type { CreditBalance, NutrientEvents } from '../types';

/**
 * Configuration for credit system
 */
export interface CreditConfig {
  /** Initial credits for new nodes */
  initialCredits: number;

  /** Maximum credit balance */
  maxCredits: number;

  /** Credit decay rate per day (0-1) */
  decayRate: number;

  /** Enable decay (encourages spending) */
  enableDecay: boolean;

  /** Minimum credits to maintain */
  minCredits: number;
}

const DEFAULT_CONFIG: CreditConfig = {
  initialCredits: 100,
  maxCredits: 10000,
  decayRate: 0.01,
  enableDecay: false,
  minCredits: 0,
};

/**
 * Manages credit balances for all nodes
 */
export class CreditLedger extends EventEmitter<NutrientEvents> {
  private config: CreditConfig;
  private balances: Map<NodeId, CreditBalance> = new Map();
  private decayTimer?: ReturnType<typeof setInterval>;

  constructor(config: Partial<CreditConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the ledger (enables decay if configured)
   */
  start(): void {
    if (this.config.enableDecay) {
      this.decayTimer = setInterval(
        () => this.applyDecay(),
        24 * 60 * 60 * 1000 // Daily
      );
    }
  }

  /**
   * Stop the ledger
   */
  stop(): void {
    if (this.decayTimer) {
      clearInterval(this.decayTimer);
      this.decayTimer = undefined;
    }
  }

  /**
   * Get or create a balance for a node
   */
  getBalance(nodeId: NodeId): CreditBalance {
    let balance = this.balances.get(nodeId);
    if (!balance) {
      balance = this.createBalance(nodeId);
      this.balances.set(nodeId, balance);
    }
    return balance;
  }

  /**
   * Credit a node (they earned credits)
   */
  credit(nodeId: NodeId, amount: number, reason?: string): boolean {
    if (amount <= 0) return false;

    const balance = this.getBalance(nodeId);
    const actualAmount = Math.min(
      amount,
      this.config.maxCredits - balance.balance
    );

    if (actualAmount <= 0) return false;

    balance.balance += actualAmount;
    balance.earned += actualAmount;
    balance.lastActivity = Date.now();

    this.emit('credits:earned', nodeId, actualAmount);
    return true;
  }

  /**
   * Debit a node (they spent credits)
   */
  debit(nodeId: NodeId, amount: number, reason?: string): boolean {
    if (amount <= 0) return false;

    const balance = this.getBalance(nodeId);
    if (balance.balance - balance.reserved < amount) {
      return false; // Insufficient funds
    }

    balance.balance -= amount;
    balance.spent += amount;
    balance.lastActivity = Date.now();

    this.emit('credits:spent', nodeId, amount);
    return true;
  }

  /**
   * Reserve credits for a pending exchange
   */
  reserve(nodeId: NodeId, amount: number): boolean {
    const balance = this.getBalance(nodeId);
    if (balance.balance - balance.reserved < amount) {
      return false;
    }

    balance.reserved += amount;
    return true;
  }

  /**
   * Release reserved credits
   */
  unreserve(nodeId: NodeId, amount: number): void {
    const balance = this.getBalance(nodeId);
    balance.reserved = Math.max(0, balance.reserved - amount);
  }

  /**
   * Transfer credits from one node to another
   */
  transfer(from: NodeId, to: NodeId, amount: number): boolean {
    if (!this.debit(from, amount)) {
      return false;
    }
    this.credit(to, amount);
    return true;
  }

  /**
   * Get all balances (for monitoring)
   */
  getAllBalances(): Map<NodeId, CreditBalance> {
    return new Map(this.balances);
  }

  /**
   * Get total credits in circulation
   */
  getTotalCredits(): number {
    return Array.from(this.balances.values())
      .reduce((sum, b) => sum + b.balance, 0);
  }

  /**
   * Set reputation multiplier for a node
   */
  setReputationMultiplier(nodeId: NodeId, multiplier: number): void {
    const balance = this.getBalance(nodeId);
    balance.reputationMultiplier = Math.max(0.1, Math.min(2.0, multiplier));
  }

  // Private methods

  private createBalance(nodeId: NodeId): CreditBalance {
    return {
      nodeId,
      balance: this.config.initialCredits,
      earned: 0,
      spent: 0,
      reserved: 0,
      reputationMultiplier: 1.0,
      lastActivity: Date.now(),
    };
  }

  private applyDecay(): void {
    const decayAmount = this.config.decayRate;

    for (const balance of this.balances.values()) {
      const decay = balance.balance * decayAmount;
      balance.balance = Math.max(
        this.config.minCredits,
        balance.balance - decay
      );
    }
  }
}

export { CreditBalance };
