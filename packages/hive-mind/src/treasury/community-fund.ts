/**
 * Community Fund - Collective treasury management
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by Gnosis Safe, MolochDAO, and Gitcoin Grants.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

export enum AssetType {
  ENERGY_CREDITS = 'energy_credits',
  GOVERNANCE_TOKENS = 'governance_tokens',
  INFRASTRUCTURE_BONDS = 'infrastructure_bonds',
  RESERVES = 'reserves',
  GRANT_POOL = 'grant_pool'
}

export interface AssetBalance {
  type: AssetType;
  amount: number;
  reserved: number;
  available: number;
  lastUpdated: number;
}

export interface AllocationBucket {
  id: string;
  name: string;
  description: string;
  targetPercentage: number;
  currentAmount: number;
  minReserve: number;
  spendingRules: SpendingRule[];
  authorizedSpenders: NodeId[];
}

export interface SpendingRule {
  maxSingleTransaction: number;
  maxPerPeriod: number;
  periodLength: number;
  approvalThreshold: number;
  requiredApprovals: number;
}

export interface TreasuryTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'allocation';
  assetType: AssetType;
  amount: number;
  from: string;
  to: string;
  reason: string;
  proposalId?: string;
  approvals: NodeId[];
  status: 'pending' | 'approved' | 'executed' | 'rejected' | 'cancelled';
  timestamp: number;
  executedAt?: number;
}

export interface TreasurySnapshot {
  timestamp: number;
  totalValue: number;
  balances: Map<AssetType, AssetBalance>;
  buckets: Map<string, AllocationBucket>;
  pendingTransactions: number;
  healthScore: number;
}

export interface TreasuryEvents {
  'deposit:received': (transaction: TreasuryTransaction) => void;
  'withdrawal:executed': (transaction: TreasuryTransaction) => void;
  'allocation:changed': (bucket: AllocationBucket) => void;
  'reserve:warning': (assetType: AssetType, currentLevel: number) => void;
}

export interface TreasuryConfig {
  minReserveRatio: number;
  maxUngovernedWithdrawal: number;
  approvalTimeout: number;
  snapshotInterval: number;
  quadraticFundingEnabled: boolean;
}

const DEFAULT_CONFIG: TreasuryConfig = {
  minReserveRatio: 0.2,
  maxUngovernedWithdrawal: 100,
  approvalTimeout: 7 * 24 * 60 * 60 * 1000,
  snapshotInterval: 24 * 60 * 60 * 1000,
  quadraticFundingEnabled: true
};

export class CommunityFund extends EventEmitter<TreasuryEvents> {
  private config: TreasuryConfig;
  private balances: Map<AssetType, AssetBalance> = new Map();
  private buckets: Map<string, AllocationBucket> = new Map();
  private transactions: Map<string, TreasuryTransaction> = new Map();

  constructor(config: Partial<TreasuryConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDefaultBuckets();
  }

  deposit(depositor: NodeId, assetType: AssetType, amount: number, reason: string): TreasuryTransaction {
    const now = Date.now();
    const transaction: TreasuryTransaction = {
      id: this.generateId('txn'),
      type: 'deposit',
      assetType,
      amount,
      from: depositor,
      to: 'treasury',
      reason,
      approvals: [],
      status: 'executed',
      timestamp: now,
      executedAt: now
    };

    const balance = this.getOrCreateBalance(assetType);
    balance.amount += amount;
    balance.available += amount;
    balance.lastUpdated = now;

    this.transactions.set(transaction.id, transaction);
    this.emit('deposit:received', transaction);
    return transaction;
  }

  getBalance(assetType: AssetType): AssetBalance | undefined {
    return this.balances.get(assetType);
  }

  getTotalValue(): number {
    let total = 0;
    for (const balance of this.balances.values()) {
      total += balance.amount;
    }
    return total;
  }

  calculateQuadraticMatch(contributions: Map<NodeId, number>): number {
    if (!this.config.quadraticFundingEnabled) {
      return Array.from(contributions.values()).reduce((a, b) => a + b, 0);
    }
    let sumOfSqrts = 0;
    for (const amount of contributions.values()) {
      sumOfSqrts += Math.sqrt(amount);
    }
    return sumOfSqrts * sumOfSqrts;
  }

  private initializeDefaultBuckets(): void {
    const buckets = [
      { id: 'operations', name: 'Operations Fund', target: 30 },
      { id: 'development', name: 'Development Fund', target: 25 },
      { id: 'grants', name: 'Grants Pool', target: 20 },
      { id: 'emergency', name: 'Emergency Reserve', target: 15 },
      { id: 'insurance', name: 'Insurance Pool', target: 10 }
    ];

    for (const b of buckets) {
      this.buckets.set(b.id, {
        id: b.id,
        name: b.name,
        description: `${b.name} for network operations`,
        targetPercentage: b.target,
        currentAmount: 0,
        minReserve: 0,
        spendingRules: [],
        authorizedSpenders: []
      });
    }
  }

  private getOrCreateBalance(assetType: AssetType): AssetBalance {
    let balance = this.balances.get(assetType);
    if (!balance) {
      balance = { type: assetType, amount: 0, reserved: 0, available: 0, lastUpdated: Date.now() };
      this.balances.set(assetType, balance);
    }
    return balance;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default CommunityFund;
