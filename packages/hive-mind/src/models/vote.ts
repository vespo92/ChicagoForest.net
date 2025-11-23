/**
 * Vote Model - Enhanced vote data structures
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * These are conceptual data models for decentralized governance, NOT operational.
 */

import type { NodeId } from '@chicago-forest/shared-types';

export enum VoteChoice {
  APPROVE = 'approve',
  REJECT = 'reject',
  ABSTAIN = 'abstain'
}

export enum VotePowerSource {
  STAKE = 'stake',
  DELEGATION = 'delegation',
  REPUTATION = 'reputation',
  VESTING = 'vesting',
  CONVICTION = 'conviction'
}

export enum VoteVisibility {
  PUBLIC = 'public',
  COMMIT_REVEAL = 'commit_reveal',
  ENCRYPTED = 'encrypted'
}

export interface EnhancedVote {
  id: string;
  proposalId: string;
  voter: NodeId;
  choice: VoteChoice;
  rankings?: string[];
  weight: number;
  weightBreakdown: VoteWeightBreakdown;
  commitment?: VoteCommitment;
  revealed: boolean;
  convictionData?: ConvictionData;
  reason?: string;
  timestamp: number;
  signature: string;
  signatureScheme: string;
  changeCount: number;
}

export interface VoteWeightBreakdown {
  base: number;
  stake: number;
  reputation: number;
  delegation: number;
  conviction: number;
  multipliers: VoteMultiplier[];
  total: number;
}

export interface VoteMultiplier {
  source: string;
  factor: number;
  reason: string;
}

export interface VoteCommitment {
  hash: string;
  salt?: string;
  committedAt: number;
  revealDeadline: number;
  revealed: boolean;
}

export interface ConvictionData {
  startTime: number;
  currentConviction: number;
  maxConviction: number;
  growthRate: number;
  decayRate: number;
}

export interface VoteReceipt {
  voteId: string;
  proposalId: string;
  voter: NodeId;
  choice: VoteChoice;
  weight: number;
  timestamp: number;
  signature: string;
}

export interface VoteStatistics {
  proposalId: string;
  totalVotes: number;
  totalWeight: number;
  approveCount: number;
  approveWeight: number;
  rejectCount: number;
  rejectWeight: number;
  abstainCount: number;
  abstainWeight: number;
  approvalRate: number;
  participationRate: number;
  quorumRequired: number;
  quorumMet: boolean;
  thresholdRequired: number;
  thresholdMet: boolean;
  weightDistribution: WeightDistribution;
  firstVoteAt: number;
  lastVoteAt: number;
  votesPerHour: number[];
  voteChanges: number;
  averageReasoning: number;
}

export interface WeightDistribution {
  median: number;
  mean: number;
  stdDev: number;
  giniCoefficient: number;
  top10Percentage: number;
  smallVotersPercentage: number;
}

export class VoteBuilder {
  private vote: Partial<EnhancedVote>;

  constructor(proposalId: string, voter: NodeId) {
    this.vote = {
      id: `vote_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      proposalId,
      voter,
      revealed: true,
      timestamp: Date.now(),
      changeCount: 0,
      weightBreakdown: { base: 1, stake: 0, reputation: 0, delegation: 0, conviction: 0, multipliers: [], total: 1 }
    };
  }

  choice(choice: VoteChoice): this { this.vote.choice = choice; return this; }
  weight(weight: number): this { this.vote.weight = weight; return this; }
  reason(reason: string): this { this.vote.reason = reason; return this; }
  signature(signature: string, scheme = 'ed25519'): this {
    this.vote.signature = signature;
    this.vote.signatureScheme = scheme;
    return this;
  }

  build(): EnhancedVote {
    if (!this.vote.choice) throw new Error('Choice is required');
    if (!this.vote.signature) {
      this.vote.signature = `sig_${Date.now().toString(36)}`;
      this.vote.signatureScheme = 'demo';
    }
    return this.vote as EnhancedVote;
  }
}

export function calculateVoteStatistics(
  proposalId: string,
  votes: EnhancedVote[],
  totalEligibleWeight: number,
  quorumRequired: number,
  thresholdRequired: number
): VoteStatistics {
  let approveWeight = 0, rejectWeight = 0, abstainWeight = 0;

  for (const vote of votes) {
    switch (vote.choice) {
      case VoteChoice.APPROVE: approveWeight += vote.weight; break;
      case VoteChoice.REJECT: rejectWeight += vote.weight; break;
      case VoteChoice.ABSTAIN: abstainWeight += vote.weight; break;
    }
  }

  const totalWeight = approveWeight + rejectWeight + abstainWeight;
  const votingWeight = approveWeight + rejectWeight;
  const approvalRate = votingWeight > 0 ? approveWeight / votingWeight : 0;
  const participationRate = totalEligibleWeight > 0 ? totalWeight / totalEligibleWeight : 0;

  return {
    proposalId,
    totalVotes: votes.length,
    totalWeight,
    approveCount: votes.filter(v => v.choice === VoteChoice.APPROVE).length,
    approveWeight,
    rejectCount: votes.filter(v => v.choice === VoteChoice.REJECT).length,
    rejectWeight,
    abstainCount: votes.filter(v => v.choice === VoteChoice.ABSTAIN).length,
    abstainWeight,
    approvalRate,
    participationRate,
    quorumRequired,
    quorumMet: participationRate >= quorumRequired,
    thresholdRequired,
    thresholdMet: approvalRate >= thresholdRequired,
    weightDistribution: { median: 0, mean: 0, stdDev: 0, giniCoefficient: 0, top10Percentage: 0, smallVotersPercentage: 0 },
    firstVoteAt: Math.min(...votes.map(v => v.timestamp)),
    lastVoteAt: Math.max(...votes.map(v => v.timestamp)),
    votesPerHour: [],
    voteChanges: votes.reduce((sum, v) => sum + v.changeCount, 0),
    averageReasoning: votes.filter(v => v.reason).length / votes.length
  };
}

export default { VoteBuilder, VoteChoice, calculateVoteStatistics };
