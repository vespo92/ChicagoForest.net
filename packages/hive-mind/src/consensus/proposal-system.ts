/**
 * Proposal System - Comprehensive proposal lifecycle management
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by Aragon, Compound Governor, and Snapshot voting systems.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

export enum ProposalPhase {
  DRAFT = 'draft',
  DISCUSSION = 'discussion',
  PENDING = 'pending',
  ACTIVE = 'active',
  SUCCEEDED = 'succeeded',
  DEFEATED = 'defeated',
  QUEUED = 'queued',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum ProposalCategory {
  PROTOCOL = 'protocol',
  GOVERNANCE = 'governance',
  TREASURY = 'treasury',
  MEMBERSHIP = 'membership',
  EMERGENCY = 'emergency',
  PARAMETER = 'parameter',
  GRANT = 'grant'
}

export interface ProposalSubmission {
  title: string;
  summary: string;
  description: string;
  category: ProposalCategory;
  proposer: NodeId;
  sponsors?: NodeId[];
  targets?: ProposalTarget[];
  discussionPeriod?: number;
  votingPeriod?: number;
  executionDelay?: number;
  quorumOverride?: number;
  thresholdOverride?: number;
}

export interface ProposalTarget {
  type: 'parameter' | 'action' | 'contract' | 'custom';
  target: string;
  method?: string;
  data?: unknown;
  value?: number;
}

export interface ProposalRecord {
  id: string;
  version: number;
  title: string;
  summary: string;
  description: string;
  category: ProposalCategory;
  phase: ProposalPhase;
  proposer: NodeId;
  sponsors: NodeId[];
  targets: ProposalTarget[];
  quorum: number;
  threshold: number;
  discussionStart?: number;
  discussionEnd?: number;
  votingStart?: number;
  votingEnd?: number;
  executionTime?: number;
  createdAt: number;
  updatedAt: number;
  votes: { approve: number; reject: number; abstain: number };
  voterCount: number;
  executed: boolean;
  executionResult?: { success: boolean; data?: unknown; error?: string };
  cancelled: boolean;
  cancelReason?: string;
}

export interface ProposalEvents {
  'proposal:created': (proposal: ProposalRecord) => void;
  'proposal:sponsored': (proposalId: string, sponsor: NodeId) => void;
  'proposal:phase-changed': (proposalId: string, oldPhase: ProposalPhase, newPhase: ProposalPhase) => void;
  'proposal:voting-started': (proposalId: string) => void;
  'proposal:voting-ended': (proposalId: string, result: 'succeeded' | 'defeated') => void;
  'proposal:executed': (proposalId: string, success: boolean) => void;
  'proposal:cancelled': (proposalId: string, reason: string) => void;
}

export interface ProposalSystemConfig {
  minDiscussionPeriod: number;
  maxDiscussionPeriod: number;
  minVotingPeriod: number;
  maxVotingPeriod: number;
  minExecutionDelay: number;
  maxExecutionDelay: number;
  defaultQuorum: number;
  defaultThreshold: number;
  requiredSponsors: number;
  maxActiveProposals: number;
  proposalCooldown: number;
}

const DEFAULT_CONFIG: ProposalSystemConfig = {
  minDiscussionPeriod: 24 * 60 * 60 * 1000,
  maxDiscussionPeriod: 14 * 24 * 60 * 60 * 1000,
  minVotingPeriod: 3 * 24 * 60 * 60 * 1000,
  maxVotingPeriod: 14 * 24 * 60 * 60 * 1000,
  minExecutionDelay: 24 * 60 * 60 * 1000,
  maxExecutionDelay: 7 * 24 * 60 * 60 * 1000,
  defaultQuorum: 0.1,
  defaultThreshold: 0.5,
  requiredSponsors: 2,
  maxActiveProposals: 10,
  proposalCooldown: 24 * 60 * 60 * 1000
};

export class ProposalSystem extends EventEmitter<ProposalEvents> {
  private config: ProposalSystemConfig;
  private proposals: Map<string, ProposalRecord> = new Map();
  private proposerCooldowns: Map<NodeId, number> = new Map();

  constructor(config: Partial<ProposalSystemConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  submitProposal(submission: ProposalSubmission): ProposalRecord | null {
    const cooldown = this.proposerCooldowns.get(submission.proposer);
    if (cooldown && Date.now() < cooldown) {
      return null;
    }

    const activeCount = Array.from(this.proposals.values()).filter(
      p => p.proposer === submission.proposer &&
           [ProposalPhase.DRAFT, ProposalPhase.DISCUSSION, ProposalPhase.ACTIVE].includes(p.phase)
    ).length;

    if (activeCount >= this.config.maxActiveProposals) {
      return null;
    }

    const now = Date.now();
    const proposal: ProposalRecord = {
      id: this.generateId(),
      version: 1,
      title: submission.title,
      summary: submission.summary,
      description: submission.description,
      category: submission.category,
      phase: ProposalPhase.DRAFT,
      proposer: submission.proposer,
      sponsors: submission.sponsors || [submission.proposer],
      targets: submission.targets || [],
      quorum: submission.quorumOverride ?? this.config.defaultQuorum,
      threshold: submission.thresholdOverride ?? this.config.defaultThreshold,
      createdAt: now,
      updatedAt: now,
      votes: { approve: 0, reject: 0, abstain: 0 },
      voterCount: 0,
      executed: false,
      cancelled: false
    };

    this.proposals.set(proposal.id, proposal);
    this.proposerCooldowns.set(submission.proposer, now + this.config.proposalCooldown);
    this.emit('proposal:created', proposal);
    return proposal;
  }

  sponsorProposal(proposalId: string, sponsor: NodeId): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.phase !== ProposalPhase.DRAFT) {
      return false;
    }

    if (!proposal.sponsors.includes(sponsor)) {
      proposal.sponsors.push(sponsor);
      proposal.updatedAt = Date.now();
      this.emit('proposal:sponsored', proposalId, sponsor);

      if (proposal.sponsors.length >= this.config.requiredSponsors) {
        this.transitionPhase(proposalId, ProposalPhase.DISCUSSION);
      }
    }
    return true;
  }

  startVoting(proposalId: string): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.phase !== ProposalPhase.DISCUSSION) {
      return false;
    }

    const now = Date.now();
    if (proposal.discussionEnd && now < proposal.discussionEnd) {
      return false;
    }

    proposal.votingStart = now;
    proposal.votingEnd = now + this.config.minVotingPeriod;
    this.transitionPhase(proposalId, ProposalPhase.ACTIVE);
    this.emit('proposal:voting-started', proposalId);
    return true;
  }

  recordVote(proposalId: string, choice: 'approve' | 'reject' | 'abstain', weight: number): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.phase !== ProposalPhase.ACTIVE) {
      return false;
    }

    proposal.votes[choice] += weight;
    proposal.voterCount++;
    proposal.updatedAt = Date.now();
    return true;
  }

  finalizeVoting(proposalId: string, totalEligibleWeight: number): 'succeeded' | 'defeated' | null {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.phase !== ProposalPhase.ACTIVE) {
      return null;
    }

    const now = Date.now();
    if (proposal.votingEnd && now < proposal.votingEnd) {
      return null;
    }

    const totalVotes = proposal.votes.approve + proposal.votes.reject + proposal.votes.abstain;
    const participationRate = totalVotes / totalEligibleWeight;
    const votingWeight = proposal.votes.approve + proposal.votes.reject;
    const approvalRate = votingWeight > 0 ? proposal.votes.approve / votingWeight : 0;

    const quorumMet = participationRate >= proposal.quorum;
    const thresholdMet = approvalRate >= proposal.threshold;

    const result = quorumMet && thresholdMet ? 'succeeded' : 'defeated';
    this.transitionPhase(proposalId, result === 'succeeded' ? ProposalPhase.SUCCEEDED : ProposalPhase.DEFEATED);
    this.emit('proposal:voting-ended', proposalId, result);
    return result;
  }

  queueForExecution(proposalId: string): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.phase !== ProposalPhase.SUCCEEDED) {
      return false;
    }

    proposal.executionTime = Date.now() + this.config.minExecutionDelay;
    this.transitionPhase(proposalId, ProposalPhase.QUEUED);
    return true;
  }

  executeProposal(proposalId: string): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.phase !== ProposalPhase.QUEUED) {
      return false;
    }

    const now = Date.now();
    if (proposal.executionTime && now < proposal.executionTime) {
      return false;
    }

    proposal.executed = true;
    proposal.executionResult = { success: true, data: { executedAt: now } };
    this.transitionPhase(proposalId, ProposalPhase.EXECUTED);
    this.emit('proposal:executed', proposalId, true);
    return true;
  }

  cancelProposal(proposalId: string, canceller: NodeId, reason: string): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || [ProposalPhase.EXECUTED, ProposalPhase.CANCELLED].includes(proposal.phase)) {
      return false;
    }

    if (proposal.proposer !== canceller) {
      return false;
    }

    proposal.cancelled = true;
    proposal.cancelReason = reason;
    this.transitionPhase(proposalId, ProposalPhase.CANCELLED);
    this.emit('proposal:cancelled', proposalId, reason);
    return true;
  }

  getProposal(proposalId: string): ProposalRecord | undefined {
    return this.proposals.get(proposalId);
  }

  getProposalsByPhase(phase: ProposalPhase): ProposalRecord[] {
    return Array.from(this.proposals.values()).filter(p => p.phase === phase);
  }

  getProposalsByProposer(proposer: NodeId): ProposalRecord[] {
    return Array.from(this.proposals.values()).filter(p => p.proposer === proposer);
  }

  private transitionPhase(proposalId: string, newPhase: ProposalPhase): void {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) return;

    const oldPhase = proposal.phase;
    proposal.phase = newPhase;
    proposal.updatedAt = Date.now();
    this.emit('proposal:phase-changed', proposalId, oldPhase, newPhase);
  }

  private generateId(): string {
    return `prop_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default ProposalSystem;
