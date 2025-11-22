/**
 * MultiSig Governance - Multi-signature authorization for critical actions
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by Gnosis Safe, Aragon Agent, and traditional multi-party authorization.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

/**
 * Transaction status
 */
export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

/**
 * Transaction type for categorization
 */
export enum TransactionType {
  TREASURY_TRANSFER = 'treasury_transfer',
  PARAMETER_CHANGE = 'parameter_change',
  EMERGENCY_ACTION = 'emergency_action',
  CONTRACT_UPGRADE = 'contract_upgrade',
  OWNERSHIP_CHANGE = 'ownership_change',
  CUSTOM = 'custom'
}

/**
 * MultiSig wallet configuration
 */
export interface MultiSigWallet {
  id: string;
  name: string;
  owners: NodeId[];
  threshold: number;          // Minimum signatures required
  dailyLimit: number;         // Max value per day without full threshold
  createdAt: number;
  updatedAt: number;
  nonce: number;              // For replay protection
  paused: boolean;
  policies: WalletPolicy[];
}

/**
 * Wallet policy for automated rules
 */
export interface WalletPolicy {
  id: string;
  name: string;
  condition: PolicyCondition;
  requiredSignatures: number;
  cooldown: number;
  maxPerPeriod: number;
  periodLength: number;
}

/**
 * Policy condition types
 */
export interface PolicyCondition {
  type: 'amount_threshold' | 'transaction_type' | 'recipient' | 'custom';
  operator: 'lt' | 'lte' | 'eq' | 'gte' | 'gt' | 'in' | 'not_in';
  value: unknown;
}

/**
 * MultiSig transaction
 */
export interface MultiSigTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  proposer: NodeId;
  to: string;
  value: number;
  data: unknown;
  description: string;
  status: TransactionStatus;
  signatures: Signature[];
  requiredSignatures: number;
  nonce: number;
  deadline: number;
  createdAt: number;
  executedAt?: number;
  executedBy?: NodeId;
  gasUsed?: number;
  result?: TransactionResult;
}

/**
 * Cryptographic signature
 */
export interface Signature {
  signer: NodeId;
  signature: string;
  timestamp: number;
  approved: boolean;
  reason?: string;
}

/**
 * Transaction execution result
 */
export interface TransactionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  logs?: string[];
}

/**
 * Ownership change proposal
 */
export interface OwnershipChange {
  id: string;
  walletId: string;
  type: 'add' | 'remove' | 'replace' | 'threshold';
  targetOwner?: NodeId;
  newOwner?: NodeId;
  newThreshold?: number;
  signatures: Signature[];
  status: TransactionStatus;
  createdAt: number;
}

/**
 * MultiSig events
 */
export interface MultiSigEvents {
  'wallet:created': (wallet: MultiSigWallet) => void;
  'wallet:updated': (wallet: MultiSigWallet) => void;
  'transaction:proposed': (tx: MultiSigTransaction) => void;
  'transaction:signed': (txId: string, signer: NodeId) => void;
  'transaction:rejected': (txId: string, signer: NodeId, reason: string) => void;
  'transaction:executed': (tx: MultiSigTransaction) => void;
  'transaction:expired': (txId: string) => void;
  'ownership:changed': (walletId: string, change: OwnershipChange) => void;
}

/**
 * MultiSig configuration
 */
export interface MultiSigConfig {
  minOwners: number;
  maxOwners: number;
  defaultThreshold: number;
  transactionExpiry: number;
  executionDelay: number;
  maxDailyTransactions: number;
}

const DEFAULT_CONFIG: MultiSigConfig = {
  minOwners: 2,
  maxOwners: 20,
  defaultThreshold: 2,
  transactionExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  executionDelay: 24 * 60 * 60 * 1000, // 24 hours
  maxDailyTransactions: 10
};

/**
 * MultiSig Governance System
 *
 * Provides multi-party authorization for critical network operations:
 * - Treasury management
 * - Parameter changes
 * - Emergency actions
 * - Contract upgrades
 */
export class MultiSigGovernance extends EventEmitter<MultiSigEvents> {
  private config: MultiSigConfig;
  private wallets: Map<string, MultiSigWallet> = new Map();
  private transactions: Map<string, MultiSigTransaction> = new Map();
  private ownershipChanges: Map<string, OwnershipChange> = new Map();
  private dailyTransactionCounts: Map<string, { date: string; count: number }> = new Map();

  constructor(config: Partial<MultiSigConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a new MultiSig wallet
   */
  createWallet(
    name: string,
    owners: NodeId[],
    threshold: number,
    dailyLimit: number = 0
  ): MultiSigWallet | null {
    if (owners.length < this.config.minOwners || owners.length > this.config.maxOwners) {
      return null;
    }

    if (threshold < 1 || threshold > owners.length) {
      return null;
    }

    // Check for duplicate owners
    const uniqueOwners = new Set(owners);
    if (uniqueOwners.size !== owners.length) {
      return null;
    }

    const now = Date.now();
    const wallet: MultiSigWallet = {
      id: this.generateId('wallet'),
      name,
      owners: [...owners],
      threshold,
      dailyLimit,
      createdAt: now,
      updatedAt: now,
      nonce: 0,
      paused: false,
      policies: []
    };

    this.wallets.set(wallet.id, wallet);
    this.emit('wallet:created', wallet);
    return wallet;
  }

  /**
   * Propose a transaction
   */
  proposeTransaction(
    walletId: string,
    proposer: NodeId,
    type: TransactionType,
    to: string,
    value: number,
    data: unknown,
    description: string
  ): MultiSigTransaction | null {
    const wallet = this.wallets.get(walletId);
    if (!wallet || wallet.paused) {
      return null;
    }

    if (!wallet.owners.includes(proposer)) {
      return null;
    }

    // Check daily limit
    if (!this.checkDailyLimit(walletId)) {
      return null;
    }

    const requiredSignatures = this.getRequiredSignatures(wallet, type, value);
    const now = Date.now();

    const transaction: MultiSigTransaction = {
      id: this.generateId('tx'),
      walletId,
      type,
      proposer,
      to,
      value,
      data,
      description,
      status: TransactionStatus.PENDING,
      signatures: [{
        signer: proposer,
        signature: '', // Would be actual signature
        timestamp: now,
        approved: true
      }],
      requiredSignatures,
      nonce: wallet.nonce,
      deadline: now + this.config.transactionExpiry,
      createdAt: now
    };

    wallet.nonce++;
    wallet.updatedAt = now;

    this.transactions.set(transaction.id, transaction);
    this.incrementDailyCount(walletId);
    this.emit('transaction:proposed', transaction);

    // Check if already has enough signatures
    this.checkTransactionApproval(transaction.id);

    return transaction;
  }

  /**
   * Sign a transaction
   */
  signTransaction(txId: string, signer: NodeId, approve: boolean, reason?: string): boolean {
    const transaction = this.transactions.get(txId);
    if (!transaction || transaction.status !== TransactionStatus.PENDING) {
      return false;
    }

    const wallet = this.wallets.get(transaction.walletId);
    if (!wallet || !wallet.owners.includes(signer)) {
      return false;
    }

    // Check if already signed
    const existingSignature = transaction.signatures.find(s => s.signer === signer);
    if (existingSignature) {
      return false;
    }

    // Check if expired
    if (Date.now() > transaction.deadline) {
      transaction.status = TransactionStatus.EXPIRED;
      this.emit('transaction:expired', txId);
      return false;
    }

    const signature: Signature = {
      signer,
      signature: '', // Would be actual signature
      timestamp: Date.now(),
      approved: approve,
      reason
    };

    transaction.signatures.push(signature);

    if (approve) {
      this.emit('transaction:signed', txId, signer);
      this.checkTransactionApproval(txId);
    } else {
      this.emit('transaction:rejected', txId, signer, reason || 'No reason provided');
      // Check if enough rejections to fail
      this.checkTransactionRejection(txId);
    }

    return true;
  }

  /**
   * Execute an approved transaction
   */
  executeTransaction(txId: string, executor: NodeId): TransactionResult | null {
    const transaction = this.transactions.get(txId);
    if (!transaction || transaction.status !== TransactionStatus.APPROVED) {
      return null;
    }

    const wallet = this.wallets.get(transaction.walletId);
    if (!wallet || !wallet.owners.includes(executor)) {
      return null;
    }

    // Check execution delay
    const approvalTime = Math.max(...transaction.signatures.map(s => s.timestamp));
    if (Date.now() < approvalTime + this.config.executionDelay) {
      return { success: false, error: 'Execution delay not met' };
    }

    // Execute (in real implementation, this would execute the action)
    const result: TransactionResult = {
      success: true,
      data: { executed: true, type: transaction.type },
      logs: [`Transaction ${txId} executed by ${executor}`]
    };

    transaction.status = TransactionStatus.EXECUTED;
    transaction.executedAt = Date.now();
    transaction.executedBy = executor;
    transaction.result = result;

    this.emit('transaction:executed', transaction);
    return result;
  }

  /**
   * Cancel a pending transaction
   */
  cancelTransaction(txId: string, canceller: NodeId): boolean {
    const transaction = this.transactions.get(txId);
    if (!transaction || transaction.status !== TransactionStatus.PENDING) {
      return false;
    }

    // Only proposer can cancel
    if (transaction.proposer !== canceller) {
      return false;
    }

    transaction.status = TransactionStatus.CANCELLED;
    return true;
  }

  /**
   * Propose ownership change
   */
  proposeOwnershipChange(
    walletId: string,
    proposer: NodeId,
    type: 'add' | 'remove' | 'replace' | 'threshold',
    targetOwner?: NodeId,
    newOwner?: NodeId,
    newThreshold?: number
  ): OwnershipChange | null {
    const wallet = this.wallets.get(walletId);
    if (!wallet || !wallet.owners.includes(proposer)) {
      return null;
    }

    // Validate change
    if (!this.validateOwnershipChange(wallet, type, targetOwner, newOwner, newThreshold)) {
      return null;
    }

    const change: OwnershipChange = {
      id: this.generateId('change'),
      walletId,
      type,
      targetOwner,
      newOwner,
      newThreshold,
      signatures: [{
        signer: proposer,
        signature: '',
        timestamp: Date.now(),
        approved: true
      }],
      status: TransactionStatus.PENDING,
      createdAt: Date.now()
    };

    this.ownershipChanges.set(change.id, change);
    return change;
  }

  /**
   * Sign ownership change
   */
  signOwnershipChange(changeId: string, signer: NodeId, approve: boolean): boolean {
    const change = this.ownershipChanges.get(changeId);
    if (!change || change.status !== TransactionStatus.PENDING) {
      return false;
    }

    const wallet = this.wallets.get(change.walletId);
    if (!wallet || !wallet.owners.includes(signer)) {
      return false;
    }

    const existingSignature = change.signatures.find(s => s.signer === signer);
    if (existingSignature) {
      return false;
    }

    change.signatures.push({
      signer,
      signature: '',
      timestamp: Date.now(),
      approved: approve
    });

    // Check if we have threshold approvals
    const approvals = change.signatures.filter(s => s.approved).length;
    if (approvals >= wallet.threshold) {
      this.executeOwnershipChange(change, wallet);
    }

    return true;
  }

  /**
   * Get wallet by ID
   */
  getWallet(walletId: string): MultiSigWallet | undefined {
    return this.wallets.get(walletId);
  }

  /**
   * Get transaction by ID
   */
  getTransaction(txId: string): MultiSigTransaction | undefined {
    return this.transactions.get(txId);
  }

  /**
   * Get pending transactions for a wallet
   */
  getPendingTransactions(walletId: string): MultiSigTransaction[] {
    return Array.from(this.transactions.values())
      .filter(tx => tx.walletId === walletId && tx.status === TransactionStatus.PENDING);
  }

  /**
   * Get transactions requiring a signer
   */
  getTransactionsAwaitingSignature(walletId: string, signer: NodeId): MultiSigTransaction[] {
    return this.getPendingTransactions(walletId)
      .filter(tx => !tx.signatures.some(s => s.signer === signer));
  }

  /**
   * Add a policy to a wallet
   */
  addPolicy(walletId: string, policy: Omit<WalletPolicy, 'id'>): WalletPolicy | null {
    const wallet = this.wallets.get(walletId);
    if (!wallet) return null;

    const fullPolicy: WalletPolicy = {
      ...policy,
      id: this.generateId('policy')
    };

    wallet.policies.push(fullPolicy);
    wallet.updatedAt = Date.now();
    this.emit('wallet:updated', wallet);
    return fullPolicy;
  }

  /**
   * Pause a wallet
   */
  pauseWallet(walletId: string, pauser: NodeId): boolean {
    const wallet = this.wallets.get(walletId);
    if (!wallet || !wallet.owners.includes(pauser)) {
      return false;
    }

    wallet.paused = true;
    wallet.updatedAt = Date.now();
    this.emit('wallet:updated', wallet);
    return true;
  }

  /**
   * Unpause a wallet (requires threshold signatures)
   */
  unpauseWallet(walletId: string, signers: NodeId[]): boolean {
    const wallet = this.wallets.get(walletId);
    if (!wallet || !wallet.paused) {
      return false;
    }

    // Verify all signers are owners
    const validSigners = signers.filter(s => wallet.owners.includes(s));
    if (validSigners.length < wallet.threshold) {
      return false;
    }

    wallet.paused = false;
    wallet.updatedAt = Date.now();
    this.emit('wallet:updated', wallet);
    return true;
  }

  // Private methods

  private checkTransactionApproval(txId: string): void {
    const transaction = this.transactions.get(txId);
    if (!transaction) return;

    const approvals = transaction.signatures.filter(s => s.approved).length;
    if (approvals >= transaction.requiredSignatures) {
      transaction.status = TransactionStatus.APPROVED;
    }
  }

  private checkTransactionRejection(txId: string): void {
    const transaction = this.transactions.get(txId);
    if (!transaction) return;

    const wallet = this.wallets.get(transaction.walletId);
    if (!wallet) return;

    const rejections = transaction.signatures.filter(s => !s.approved).length;
    const remainingOwners = wallet.owners.length - transaction.signatures.length;

    // If even with all remaining owners approving, we can't reach threshold
    const maxPossibleApprovals = transaction.signatures.filter(s => s.approved).length + remainingOwners;
    if (maxPossibleApprovals < transaction.requiredSignatures) {
      transaction.status = TransactionStatus.REJECTED;
    }
  }

  private getRequiredSignatures(wallet: MultiSigWallet, type: TransactionType, value: number): number {
    // Check if value is under daily limit
    if (wallet.dailyLimit > 0 && value <= wallet.dailyLimit) {
      return 1;
    }

    // Check policies
    for (const policy of wallet.policies) {
      if (this.matchesPolicy(policy, type, value)) {
        return policy.requiredSignatures;
      }
    }

    // Default to wallet threshold
    return wallet.threshold;
  }

  private matchesPolicy(policy: WalletPolicy, type: TransactionType, value: number): boolean {
    const { condition } = policy;

    switch (condition.type) {
      case 'amount_threshold':
        return this.compareValues(value, condition.operator, condition.value as number);
      case 'transaction_type':
        if (condition.operator === 'eq') return type === condition.value;
        if (condition.operator === 'in') return (condition.value as string[]).includes(type);
        return false;
      default:
        return false;
    }
  }

  private compareValues(a: number, op: string, b: number): boolean {
    switch (op) {
      case 'lt': return a < b;
      case 'lte': return a <= b;
      case 'eq': return a === b;
      case 'gte': return a >= b;
      case 'gt': return a > b;
      default: return false;
    }
  }

  private checkDailyLimit(walletId: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    const record = this.dailyTransactionCounts.get(walletId);

    if (!record || record.date !== today) {
      return true;
    }

    return record.count < this.config.maxDailyTransactions;
  }

  private incrementDailyCount(walletId: string): void {
    const today = new Date().toISOString().split('T')[0];
    const record = this.dailyTransactionCounts.get(walletId);

    if (!record || record.date !== today) {
      this.dailyTransactionCounts.set(walletId, { date: today, count: 1 });
    } else {
      record.count++;
    }
  }

  private validateOwnershipChange(
    wallet: MultiSigWallet,
    type: string,
    targetOwner?: NodeId,
    newOwner?: NodeId,
    newThreshold?: number
  ): boolean {
    switch (type) {
      case 'add':
        if (!newOwner) return false;
        if (wallet.owners.includes(newOwner)) return false;
        if (wallet.owners.length >= this.config.maxOwners) return false;
        return true;

      case 'remove':
        if (!targetOwner) return false;
        if (!wallet.owners.includes(targetOwner)) return false;
        if (wallet.owners.length <= this.config.minOwners) return false;
        if (wallet.owners.length - 1 < wallet.threshold) return false;
        return true;

      case 'replace':
        if (!targetOwner || !newOwner) return false;
        if (!wallet.owners.includes(targetOwner)) return false;
        if (wallet.owners.includes(newOwner)) return false;
        return true;

      case 'threshold':
        if (newThreshold === undefined) return false;
        if (newThreshold < 1 || newThreshold > wallet.owners.length) return false;
        return true;

      default:
        return false;
    }
  }

  private executeOwnershipChange(change: OwnershipChange, wallet: MultiSigWallet): void {
    switch (change.type) {
      case 'add':
        if (change.newOwner) {
          wallet.owners.push(change.newOwner);
        }
        break;

      case 'remove':
        if (change.targetOwner) {
          wallet.owners = wallet.owners.filter(o => o !== change.targetOwner);
        }
        break;

      case 'replace':
        if (change.targetOwner && change.newOwner) {
          const index = wallet.owners.indexOf(change.targetOwner);
          if (index >= 0) {
            wallet.owners[index] = change.newOwner;
          }
        }
        break;

      case 'threshold':
        if (change.newThreshold !== undefined) {
          wallet.threshold = change.newThreshold;
        }
        break;
    }

    change.status = TransactionStatus.EXECUTED;
    wallet.updatedAt = Date.now();
    this.emit('ownership:changed', wallet.id, change);
    this.emit('wallet:updated', wallet);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default MultiSigGovernance;
