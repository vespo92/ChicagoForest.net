/**
 * Consensus Engine - Reaching agreement across the network
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  Proposal,
  Vote,
  VoteChoice,
  ConsensusResult,
  GovernanceEvents,
  VotingWeight,
} from '../types';

/**
 * Configuration for consensus engine
 */
export interface ConsensusConfig {
  /** Minimum quorum for validity */
  minQuorum: number;

  /** Supermajority threshold for protocol changes */
  supermajorityThreshold: number;

  /** Simple majority threshold */
  majorityThreshold: number;

  /** Time before lazy consensus (ms) */
  lazyConsensusTimeout: number;

  /** Enable veto power for high-reputation nodes */
  vetoEnabled: boolean;

  /** Minimum reputation for veto */
  vetoReputationThreshold: number;
}

const DEFAULT_CONFIG: ConsensusConfig = {
  minQuorum: 0.1,
  supermajorityThreshold: 0.67,
  majorityThreshold: 0.5,
  lazyConsensusTimeout: 72 * 60 * 60 * 1000, // 72 hours
  vetoEnabled: false,
  vetoReputationThreshold: 0.9,
};

/**
 * Manages consensus building for proposals
 */
export class ConsensusEngine extends EventEmitter<GovernanceEvents> {
  private config: ConsensusConfig;
  private proposals: Map<string, Proposal> = new Map();
  private votes: Map<string, Map<NodeId, Vote>> = new Map();
  private deadlineTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // Callbacks for weight calculation
  private getWeight: (nodeId: NodeId) => VotingWeight = () => ({
    base: 1,
    reputation: 1,
    stake: 1,
    conviction: 1,
    delegated: 0,
    total: 1,
  });

  // Callback for total network weight
  private getTotalWeight: () => number = () => 100;

  constructor(config: Partial<ConsensusConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set weight calculation callback
   */
  setWeightProvider(provider: (nodeId: NodeId) => VotingWeight): void {
    this.getWeight = provider;
  }

  /**
   * Set total weight callback
   */
  setTotalWeightProvider(provider: () => number): void {
    this.getTotalWeight = provider;
  }

  /**
   * Register a proposal for voting
   */
  registerProposal(proposal: Proposal): void {
    this.proposals.set(proposal.id, proposal);
    this.votes.set(proposal.id, new Map());

    // Set deadline timer
    const timeUntilDeadline = proposal.deadline - Date.now();
    if (timeUntilDeadline > 0) {
      const timer = setTimeout(
        () => this.finalizeProposal(proposal.id),
        timeUntilDeadline
      );
      this.deadlineTimers.set(proposal.id, timer);
    }

    this.emit('proposal:activated', proposal);
  }

  /**
   * Cast a vote
   */
  castVote(
    proposalId: string,
    voter: NodeId,
    choice: VoteChoice,
    reason?: string
  ): Vote | null {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'active') {
      return null;
    }

    if (Date.now() > proposal.deadline) {
      return null;
    }

    const weight = this.getWeight(voter);
    const vote: Vote = {
      id: `vote_${proposalId}_${voter}`,
      proposalId,
      voter,
      choice,
      weight: weight.total,
      reason,
      timestamp: Date.now(),
      signature: '', // Would be signed
    };

    const proposalVotes = this.votes.get(proposalId)!;
    const existingVote = proposalVotes.get(voter);

    if (existingVote) {
      this.emit('vote:changed', vote);
    } else {
      this.emit('vote:cast', vote);
    }

    proposalVotes.set(voter, vote);

    // Check if quorum reached
    const stats = this.calculateStats(proposalId);
    if (stats.participationPercentage >= proposal.quorum * 100) {
      this.emit('quorum:reached', proposalId);
    }

    return vote;
  }

  /**
   * Get current voting stats for a proposal
   */
  getStats(proposalId: string): VotingStats | null {
    if (!this.proposals.has(proposalId)) {
      return null;
    }
    return this.calculateStats(proposalId);
  }

  /**
   * Finalize a proposal (called at deadline or manually)
   */
  finalizeProposal(proposalId: string): ConsensusResult | null {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'active') {
      return null;
    }

    // Clear deadline timer
    const timer = this.deadlineTimers.get(proposalId);
    if (timer) {
      clearTimeout(timer);
      this.deadlineTimers.delete(proposalId);
    }

    const stats = this.calculateStats(proposalId);
    const consensusReached = stats.participationPercentage >= proposal.quorum * 100;

    let status: Proposal['status'];
    if (!consensusReached) {
      status = 'expired';
      this.emit('proposal:expired', proposalId);
    } else if (stats.approvalPercentage >= proposal.threshold * 100) {
      status = 'passed';
    } else {
      status = 'rejected';
    }

    proposal.status = status;

    const result: ConsensusResult = {
      proposalId,
      consensusReached,
      status,
      totalVotes: stats.totalVotes,
      totalWeight: stats.totalWeight,
      approvalPercentage: stats.approvalPercentage,
      participationPercentage: stats.participationPercentage,
      finalizedAt: Date.now(),
    };

    if (status === 'passed') {
      this.emit('proposal:passed', result);
    } else if (status === 'rejected') {
      this.emit('proposal:rejected', result);
    }

    return result;
  }

  /**
   * Veto a proposal (if enabled and authorized)
   */
  vetoProposal(proposalId: string, vetoer: NodeId): boolean {
    if (!this.config.vetoEnabled) {
      return false;
    }

    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'active') {
      return false;
    }

    const weight = this.getWeight(vetoer);
    if (weight.reputation < this.config.vetoReputationThreshold) {
      return false;
    }

    proposal.status = 'vetoed';
    this.emit('proposal:vetoed', proposalId, vetoer);
    return true;
  }

  /**
   * Get a proposal by ID
   */
  getProposal(proposalId: string): Proposal | undefined {
    return this.proposals.get(proposalId);
  }

  /**
   * Get votes for a proposal
   */
  getVotes(proposalId: string): Vote[] {
    const votes = this.votes.get(proposalId);
    return votes ? Array.from(votes.values()) : [];
  }

  // Private methods

  private calculateStats(proposalId: string): VotingStats {
    const votes = this.votes.get(proposalId);
    if (!votes) {
      return {
        totalVotes: 0,
        totalWeight: 0,
        approveWeight: 0,
        rejectWeight: 0,
        abstainWeight: 0,
        approvalPercentage: 0,
        participationPercentage: 0,
      };
    }

    let approveWeight = 0;
    let rejectWeight = 0;
    let abstainWeight = 0;

    for (const vote of votes.values()) {
      switch (vote.choice) {
        case 'approve':
          approveWeight += vote.weight;
          break;
        case 'reject':
          rejectWeight += vote.weight;
          break;
        case 'abstain':
          abstainWeight += vote.weight;
          break;
      }
    }

    const totalWeight = approveWeight + rejectWeight + abstainWeight;
    const networkWeight = this.getTotalWeight();
    const votingWeight = approveWeight + rejectWeight; // Abstains don't count

    return {
      totalVotes: votes.size,
      totalWeight,
      approveWeight,
      rejectWeight,
      abstainWeight,
      approvalPercentage: votingWeight > 0
        ? (approveWeight / votingWeight) * 100
        : 0,
      participationPercentage: networkWeight > 0
        ? (totalWeight / networkWeight) * 100
        : 0,
    };
  }
}

export interface VotingStats {
  totalVotes: number;
  totalWeight: number;
  approveWeight: number;
  rejectWeight: number;
  abstainWeight: number;
  approvalPercentage: number;
  participationPercentage: number;
}

export { ConsensusResult, VoteChoice };
