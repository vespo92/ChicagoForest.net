/**
 * @fileoverview Decentralized sync integration for hive-mind governance
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * NOT operational infrastructure.
 *
 * Provides CRDT-based synchronization for governance data across the network:
 * - Proposals: Governance proposals with voting
 * - Votes: Cast votes with cryptographic signatures
 * - Delegations: Vote delegation relationships
 * - Members: Forest member records
 * - Constitution: Foundational rules and amendments
 * - Treasury: Community fund transactions
 *
 * Uses GUN.js and/or OrbitDB for decentralized storage and sync.
 * Inspired by DAOs: Aragon, Compound, MolochDAO, Gitcoin
 */

import EventEmitter3 from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  Proposal,
  Vote,
  Delegation,
  ProposalStatus,
  ProposalType,
  VoteChoice,
} from '../types';

// ============================================================================
// Types
// ============================================================================

/**
 * Sync adapter interface (matches decentralized-sync package)
 */
interface SyncAdapter {
  get<T>(path: string): Promise<T | undefined>;
  put<T>(path: string, value: T): Promise<{ success: boolean }>;
  delete(path: string): Promise<{ success: boolean }>;
  subscribe<T>(
    path: string,
    callback: (value: T, meta: { origin: NodeId; timestamp: number }) => void
  ): () => void;
  query<T>(path: string, filter?: (value: T) => boolean): Promise<T[]>;
  sync(): Promise<{ keysProcessed: number }>;
  close(): Promise<void>;
}

/**
 * Sync configuration
 */
export interface GovernanceSyncConfig {
  /** Forest ID for this governance instance */
  forestId: string;
  /** Node identity */
  nodeId: NodeId;
  /** Sync adapter (GUN or OrbitDB) */
  adapter: SyncAdapter;
  /** Sync interval in milliseconds */
  syncInterval?: number;
  /** Enable auto-sync */
  autoSync?: boolean;
  /** Enable vote aggregation */
  aggregateVotes?: boolean;
}

/**
 * Member record for governance
 */
export interface MemberRecord {
  id: string;
  nodeId: NodeId;
  forestId: string;
  name?: string;
  reputation: number;
  stake: number;
  joinedAt: number;
  lastActiveAt: number;
  status: 'active' | 'inactive' | 'suspended';
}

/**
 * Constitution article
 */
export interface ConstitutionArticle {
  id: string;
  forestId: string;
  title: string;
  content: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  updatedBy: NodeId;
  ratifiedAt?: number;
  amendmentOf?: string;
}

/**
 * Treasury transaction
 */
export interface TreasuryTransaction {
  id: string;
  forestId: string;
  type: 'deposit' | 'withdrawal' | 'grant' | 'fee';
  amount: number;
  currency: string;
  from?: string;
  to?: string;
  proposalId?: string;
  description: string;
  createdAt: number;
  createdBy: NodeId;
  signatures: Array<{
    nodeId: NodeId;
    signature: string;
    timestamp: number;
  }>;
}

/**
 * Events emitted by the governance sync manager
 */
export interface GovernanceSyncEvents {
  'proposal:created': (proposal: Proposal) => void;
  'proposal:updated': (proposal: Proposal) => void;
  'proposal:deleted': (id: string) => void;
  'vote:cast': (vote: Vote) => void;
  'vote:updated': (vote: Vote) => void;
  'delegation:created': (delegation: Delegation) => void;
  'delegation:revoked': (delegation: Delegation) => void;
  'member:joined': (member: MemberRecord) => void;
  'member:updated': (member: MemberRecord) => void;
  'member:left': (id: string) => void;
  'constitution:amended': (article: ConstitutionArticle) => void;
  'treasury:transaction': (tx: TreasuryTransaction) => void;
  'quorum:reached': (proposalId: string) => void;
  'proposal:passed': (proposalId: string) => void;
  'proposal:rejected': (proposalId: string) => void;
  'sync:complete': (stats: { keysProcessed: number }) => void;
  'error': (error: Error) => void;
}

// ============================================================================
// Governance Sync Manager
// ============================================================================

/**
 * Manages decentralized sync for hive-mind governance data
 */
export class GovernanceSyncManager extends EventEmitter3<GovernanceSyncEvents> {
  private config: Required<GovernanceSyncConfig>;
  private adapter: SyncAdapter;
  private subscriptions: Map<string, () => void> = new Map();
  private syncTimer?: NodeJS.Timeout;
  private localCache: Map<string, unknown> = new Map();
  private voteAggregates: Map<string, Map<VoteChoice, number>> = new Map();

  constructor(config: GovernanceSyncConfig) {
    super();
    this.config = {
      syncInterval: 30000,
      autoSync: true,
      aggregateVotes: true,
      ...config,
    };
    this.adapter = config.adapter;
  }

  /**
   * Start the sync manager
   */
  async start(): Promise<void> {
    // Subscribe to all governance data types
    this.subscribeToProposals();
    this.subscribeToVotes();
    this.subscribeToDelegations();
    this.subscribeToMembers();
    this.subscribeToConstitution();
    this.subscribeToTreasury();

    // Start auto-sync if enabled
    if (this.config.autoSync) {
      this.startAutoSync();
    }

    // Initial sync
    await this.sync();
  }

  /**
   * Stop the sync manager
   */
  async stop(): Promise<void> {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }

    for (const unsubscribe of this.subscriptions.values()) {
      unsubscribe();
    }
    this.subscriptions.clear();

    await this.adapter.close();
  }

  /**
   * Force sync with peers
   */
  async sync(): Promise<void> {
    try {
      const stats = await this.adapter.sync();
      this.emit('sync:complete', stats);
    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // ===========================================================================
  // Proposal Operations
  // ===========================================================================

  /**
   * Create a new proposal
   */
  async createProposal(proposal: Omit<Proposal, 'id' | 'createdAt' | 'status'>): Promise<Proposal> {
    const fullProposal: Proposal = {
      ...proposal,
      id: this.generateId('proposal'),
      createdAt: Date.now(),
      status: 'pending' as ProposalStatus,
    };

    const path = `governance/${this.config.forestId}/proposals/${fullProposal.id}`;
    const result = await this.adapter.put(path, fullProposal);

    if (result.success) {
      this.localCache.set(path, fullProposal);
      this.emit('proposal:created', fullProposal);
    }

    return fullProposal;
  }

  /**
   * Update a proposal
   */
  async updateProposal(id: string, updates: Partial<Proposal>): Promise<boolean> {
    const existing = await this.getProposal(id);
    if (!existing) return false;

    const updated: Proposal = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };

    const path = `governance/${this.config.forestId}/proposals/${id}`;
    const result = await this.adapter.put(path, updated);

    if (result.success) {
      this.localCache.set(path, updated);
      this.emit('proposal:updated', updated);
    }

    return result.success;
  }

  /**
   * Get a proposal
   */
  async getProposal(id: string): Promise<Proposal | undefined> {
    const path = `governance/${this.config.forestId}/proposals/${id}`;

    const cached = this.localCache.get(path) as Proposal | undefined;
    if (cached) return cached;

    return this.adapter.get<Proposal>(path);
  }

  /**
   * Query proposals
   */
  async queryProposals(
    status?: ProposalStatus,
    type?: ProposalType,
    filter?: (proposal: Proposal) => boolean
  ): Promise<Proposal[]> {
    let combinedFilter: ((p: Proposal) => boolean) | undefined;

    if (status || type || filter) {
      combinedFilter = (p: Proposal) => {
        if (status && p.status !== status) return false;
        if (type && p.type !== type) return false;
        if (filter && !filter(p)) return false;
        return true;
      };
    }

    return this.adapter.query<Proposal>(
      `governance/${this.config.forestId}/proposals`,
      combinedFilter
    );
  }

  /**
   * Subscribe to proposal changes
   */
  private subscribeToProposals(): void {
    const unsubscribe = this.adapter.subscribe<Proposal>(
      `governance/${this.config.forestId}/proposals`,
      (proposal, meta) => {
        const path = `governance/${this.config.forestId}/proposals/${proposal.id}`;
        const existing = this.localCache.get(path) as Proposal | undefined;

        this.localCache.set(path, proposal);

        if (existing) {
          this.emit('proposal:updated', proposal);

          // Check for status changes
          if (existing.status !== proposal.status) {
            if (proposal.status === 'passed') {
              this.emit('proposal:passed', proposal.id);
            } else if (proposal.status === 'rejected') {
              this.emit('proposal:rejected', proposal.id);
            }
          }
        } else {
          this.emit('proposal:created', proposal);
        }
      }
    );

    this.subscriptions.set('proposals', unsubscribe);
  }

  // ===========================================================================
  // Vote Operations (CRDT-friendly)
  // ===========================================================================

  /**
   * Cast a vote
   *
   * Votes are stored individually per voter, making them CRDT-mergeable.
   * The vote count is computed from individual votes rather than stored.
   */
  async castVote(vote: Omit<Vote, 'id' | 'timestamp'>): Promise<Vote> {
    const fullVote: Vote = {
      ...vote,
      id: this.generateId('vote'),
      timestamp: Date.now(),
    };

    // Store vote by proposalId + voterId for idempotency
    const path = `governance/${this.config.forestId}/votes/${vote.proposalId}/${vote.voterId}`;
    const result = await this.adapter.put(path, fullVote);

    if (result.success) {
      this.localCache.set(path, fullVote);
      this.emit('vote:cast', fullVote);

      // Update vote aggregates
      await this.updateVoteAggregate(vote.proposalId);
    }

    return fullVote;
  }

  /**
   * Get a vote
   */
  async getVote(proposalId: string, voterId: string): Promise<Vote | undefined> {
    const path = `governance/${this.config.forestId}/votes/${proposalId}/${voterId}`;

    const cached = this.localCache.get(path) as Vote | undefined;
    if (cached) return cached;

    return this.adapter.get<Vote>(path);
  }

  /**
   * Get all votes for a proposal
   */
  async getVotesForProposal(proposalId: string): Promise<Vote[]> {
    return this.adapter.query<Vote>(
      `governance/${this.config.forestId}/votes/${proposalId}`
    );
  }

  /**
   * Get vote tally for a proposal
   */
  async getVoteTally(proposalId: string): Promise<Map<VoteChoice, number>> {
    // Check cache first
    const cached = this.voteAggregates.get(proposalId);
    if (cached) return cached;

    // Compute from votes
    const votes = await this.getVotesForProposal(proposalId);
    const tally = new Map<VoteChoice, number>();

    for (const vote of votes) {
      const current = tally.get(vote.choice) || 0;
      tally.set(vote.choice, current + (vote.weight || 1));
    }

    this.voteAggregates.set(proposalId, tally);
    return tally;
  }

  /**
   * Update vote aggregate for a proposal
   */
  private async updateVoteAggregate(proposalId: string): Promise<void> {
    // Recompute tally
    const tally = await this.getVoteTally(proposalId);
    this.voteAggregates.set(proposalId, tally);

    // Check for quorum
    const proposal = await this.getProposal(proposalId);
    if (proposal && proposal.quorum) {
      const totalVotes = Array.from(tally.values()).reduce((a, b) => a + b, 0);
      if (totalVotes >= proposal.quorum && proposal.status === 'active') {
        this.emit('quorum:reached', proposalId);
      }
    }
  }

  /**
   * Subscribe to vote changes
   */
  private subscribeToVotes(): void {
    const unsubscribe = this.adapter.subscribe<Vote>(
      `governance/${this.config.forestId}/votes`,
      (vote, meta) => {
        const path = `governance/${this.config.forestId}/votes/${vote.proposalId}/${vote.voterId}`;
        const existing = this.localCache.get(path) as Vote | undefined;

        this.localCache.set(path, vote);

        if (existing) {
          this.emit('vote:updated', vote);
        } else {
          this.emit('vote:cast', vote);
        }

        // Update aggregates if enabled
        if (this.config.aggregateVotes) {
          this.updateVoteAggregate(vote.proposalId);
        }
      }
    );

    this.subscriptions.set('votes', unsubscribe);
  }

  // ===========================================================================
  // Delegation Operations
  // ===========================================================================

  /**
   * Create a delegation
   */
  async delegate(delegation: Omit<Delegation, 'id' | 'createdAt'>): Promise<Delegation> {
    const fullDelegation: Delegation = {
      ...delegation,
      id: this.generateId('delegation'),
      createdAt: Date.now(),
    };

    // Store by delegator for easy lookup
    const path = `governance/${this.config.forestId}/delegations/${delegation.from}`;
    const result = await this.adapter.put(path, fullDelegation);

    if (result.success) {
      this.localCache.set(path, fullDelegation);
      this.emit('delegation:created', fullDelegation);
    }

    return fullDelegation;
  }

  /**
   * Revoke a delegation
   */
  async revokeDelegation(from: string): Promise<boolean> {
    const path = `governance/${this.config.forestId}/delegations/${from}`;
    const existing = this.localCache.get(path) as Delegation | undefined;

    const result = await this.adapter.delete(path);

    if (result.success) {
      this.localCache.delete(path);
      if (existing) {
        this.emit('delegation:revoked', existing);
      }
    }

    return result.success;
  }

  /**
   * Get delegations for a delegator
   */
  async getDelegation(from: string): Promise<Delegation | undefined> {
    const path = `governance/${this.config.forestId}/delegations/${from}`;

    const cached = this.localCache.get(path) as Delegation | undefined;
    if (cached) return cached;

    return this.adapter.get<Delegation>(path);
  }

  /**
   * Get delegations to a delegate
   */
  async getDelegationsTo(to: string): Promise<Delegation[]> {
    return this.adapter.query<Delegation>(
      `governance/${this.config.forestId}/delegations`,
      (d) => d.to === to
    );
  }

  /**
   * Subscribe to delegation changes
   */
  private subscribeToDelegations(): void {
    const unsubscribe = this.adapter.subscribe<Delegation>(
      `governance/${this.config.forestId}/delegations`,
      (delegation, meta) => {
        const path = `governance/${this.config.forestId}/delegations/${delegation.from}`;
        const existing = this.localCache.get(path) as Delegation | undefined;

        if ((delegation as { revoked?: boolean }).revoked) {
          this.localCache.delete(path);
          if (existing) {
            this.emit('delegation:revoked', existing);
          }
        } else {
          this.localCache.set(path, delegation);
          if (!existing) {
            this.emit('delegation:created', delegation);
          }
        }
      }
    );

    this.subscriptions.set('delegations', unsubscribe);
  }

  // ===========================================================================
  // Member Operations
  // ===========================================================================

  /**
   * Add or update a member
   */
  async putMember(member: MemberRecord): Promise<boolean> {
    const path = `governance/${this.config.forestId}/members/${member.id}`;
    const result = await this.adapter.put(path, {
      ...member,
      lastActiveAt: Date.now(),
    });

    if (result.success) {
      const existing = this.localCache.get(path);
      this.localCache.set(path, member);

      if (existing) {
        this.emit('member:updated', member);
      } else {
        this.emit('member:joined', member);
      }
    }

    return result.success;
  }

  /**
   * Get a member
   */
  async getMember(id: string): Promise<MemberRecord | undefined> {
    const path = `governance/${this.config.forestId}/members/${id}`;

    const cached = this.localCache.get(path) as MemberRecord | undefined;
    if (cached) return cached;

    return this.adapter.get<MemberRecord>(path);
  }

  /**
   * Query members
   */
  async queryMembers(filter?: (member: MemberRecord) => boolean): Promise<MemberRecord[]> {
    return this.adapter.query<MemberRecord>(
      `governance/${this.config.forestId}/members`,
      filter
    );
  }

  /**
   * Subscribe to member changes
   */
  private subscribeToMembers(): void {
    const unsubscribe = this.adapter.subscribe<MemberRecord>(
      `governance/${this.config.forestId}/members`,
      (member, meta) => {
        const path = `governance/${this.config.forestId}/members/${member.id}`;
        const existing = this.localCache.get(path) as MemberRecord | undefined;

        this.localCache.set(path, member);

        if (existing) {
          this.emit('member:updated', member);
        } else {
          this.emit('member:joined', member);
        }
      }
    );

    this.subscriptions.set('members', unsubscribe);
  }

  // ===========================================================================
  // Constitution Operations
  // ===========================================================================

  /**
   * Add or amend a constitution article
   */
  async amendConstitution(article: Omit<ConstitutionArticle, 'updatedAt' | 'updatedBy'>): Promise<boolean> {
    const fullArticle: ConstitutionArticle = {
      ...article,
      updatedAt: Date.now(),
      updatedBy: this.config.nodeId,
    };

    const path = `governance/${this.config.forestId}/constitution/${article.id}`;
    const result = await this.adapter.put(path, fullArticle);

    if (result.success) {
      this.localCache.set(path, fullArticle);
      this.emit('constitution:amended', fullArticle);
    }

    return result.success;
  }

  /**
   * Get a constitution article
   */
  async getArticle(id: string): Promise<ConstitutionArticle | undefined> {
    const path = `governance/${this.config.forestId}/constitution/${id}`;

    const cached = this.localCache.get(path) as ConstitutionArticle | undefined;
    if (cached) return cached;

    return this.adapter.get<ConstitutionArticle>(path);
  }

  /**
   * Get full constitution
   */
  async getConstitution(): Promise<ConstitutionArticle[]> {
    return this.adapter.query<ConstitutionArticle>(
      `governance/${this.config.forestId}/constitution`
    );
  }

  /**
   * Subscribe to constitution changes
   */
  private subscribeToConstitution(): void {
    const unsubscribe = this.adapter.subscribe<ConstitutionArticle>(
      `governance/${this.config.forestId}/constitution`,
      (article, meta) => {
        const path = `governance/${this.config.forestId}/constitution/${article.id}`;
        this.localCache.set(path, article);
        this.emit('constitution:amended', article);
      }
    );

    this.subscriptions.set('constitution', unsubscribe);
  }

  // ===========================================================================
  // Treasury Operations
  // ===========================================================================

  /**
   * Record a treasury transaction
   */
  async recordTransaction(tx: Omit<TreasuryTransaction, 'id' | 'createdAt' | 'createdBy'>): Promise<TreasuryTransaction> {
    const fullTx: TreasuryTransaction = {
      ...tx,
      id: this.generateId('tx'),
      createdAt: Date.now(),
      createdBy: this.config.nodeId,
    };

    const path = `governance/${this.config.forestId}/treasury/${fullTx.id}`;
    const result = await this.adapter.put(path, fullTx);

    if (result.success) {
      this.localCache.set(path, fullTx);
      this.emit('treasury:transaction', fullTx);
    }

    return fullTx;
  }

  /**
   * Query treasury transactions
   */
  async queryTransactions(filter?: (tx: TreasuryTransaction) => boolean): Promise<TreasuryTransaction[]> {
    return this.adapter.query<TreasuryTransaction>(
      `governance/${this.config.forestId}/treasury`,
      filter
    );
  }

  /**
   * Subscribe to treasury changes
   */
  private subscribeToTreasury(): void {
    const unsubscribe = this.adapter.subscribe<TreasuryTransaction>(
      `governance/${this.config.forestId}/treasury`,
      (tx, meta) => {
        const path = `governance/${this.config.forestId}/treasury/${tx.id}`;
        this.localCache.set(path, tx);
        this.emit('treasury:transaction', tx);
      }
    );

    this.subscriptions.set('treasury', unsubscribe);
  }

  // ===========================================================================
  // Utilities
  // ===========================================================================

  /**
   * Generate a unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Start auto-sync timer
   */
  private startAutoSync(): void {
    this.syncTimer = setInterval(() => {
      this.sync().catch((error) => {
        this.emit('error', error);
      });
    }, this.config.syncInterval);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a governance sync manager
 *
 * @example
 * ```typescript
 * import { createGovernanceSync } from '@chicago-forest/hive-mind/sync';
 * import { createHiveMindGUN } from '@chicago-forest/decentralized-sync/gun';
 *
 * const adapter = createHiveMindGUN('node-123', ['https://relay.example.com']);
 * await adapter.initialize();
 *
 * const sync = createGovernanceSync({
 *   forestId: 'chicago-forest',
 *   nodeId: 'node-123',
 *   adapter,
 * });
 *
 * await sync.start();
 *
 * // Create a proposal
 * const proposal = await sync.createProposal({
 *   title: 'Add new node to network',
 *   description: 'Proposal to add...',
 *   type: 'membership',
 *   proposer: 'node-123',
 * });
 *
 * // Cast a vote
 * await sync.castVote({
 *   proposalId: proposal.id,
 *   voterId: 'node-123',
 *   choice: 'yes',
 *   weight: 1,
 * });
 *
 * // Subscribe to changes
 * sync.on('vote:cast', (vote) => {
 *   console.log('Vote cast:', vote.choice, 'by', vote.voterId);
 * });
 * ```
 */
export function createGovernanceSync(config: GovernanceSyncConfig): GovernanceSyncManager {
  return new GovernanceSyncManager(config);
}

// ============================================================================
// Exports
// ============================================================================

export type {
  MemberRecord,
  ConstitutionArticle,
  TreasuryTransaction,
};

export default GovernanceSyncManager;
