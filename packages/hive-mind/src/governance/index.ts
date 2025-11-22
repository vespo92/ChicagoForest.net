/**
 * Governance Manager - High-level governance coordination
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  Proposal,
  ProposalType,
  GovernanceConfig,
  GovernanceEvents,
  Delegation,
  VotingWeight,
} from '../types';
import { ConsensusEngine } from '../consensus';

const DEFAULT_CONFIG: GovernanceConfig = {
  defaultQuorum: 0.2,
  defaultThreshold: 0.5,
  defaultDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  delegationEnabled: true,
  maxDelegationDepth: 3,
  convictionEnabled: false,
  convictionGrowthRate: 0.1,
};

/**
 * Main governance coordinator
 */
export class GovernanceManager extends EventEmitter<GovernanceEvents> {
  private config: GovernanceConfig;
  private localNodeId: NodeId;
  private consensus: ConsensusEngine;
  private delegations: Map<string, Delegation> = new Map();
  private reputations: Map<NodeId, number> = new Map();
  private stakes: Map<NodeId, number> = new Map();

  constructor(localNodeId: NodeId, config: Partial<GovernanceConfig> = {}) {
    super();
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.consensus = new ConsensusEngine();

    // Wire consensus events
    this.consensus.on('proposal:passed', (result) =>
      this.emit('proposal:passed', result)
    );
    this.consensus.on('proposal:rejected', (result) =>
      this.emit('proposal:rejected', result)
    );
    this.consensus.on('vote:cast', (vote) =>
      this.emit('vote:cast', vote)
    );

    // Set up weight calculation
    this.consensus.setWeightProvider((nodeId) => this.calculateWeight(nodeId));
    this.consensus.setTotalWeightProvider(() => this.getTotalWeight());
  }

  /**
   * Create a new proposal
   */
  createProposal(
    type: ProposalType,
    title: string,
    description: string,
    options: Partial<{
      quorum: number;
      threshold: number;
      duration: number;
      payload: unknown;
      tags: string[];
    }> = {}
  ): Proposal {
    const now = Date.now();
    const proposal: Proposal = {
      id: this.generateProposalId(),
      type,
      title,
      description,
      proposer: this.localNodeId,
      createdAt: now,
      deadline: now + (options.duration ?? this.config.defaultDuration),
      quorum: options.quorum ?? this.getDefaultQuorum(type),
      threshold: options.threshold ?? this.getDefaultThreshold(type),
      status: 'draft',
      payload: options.payload,
      tags: options.tags ?? [],
    };

    this.emit('proposal:created', proposal);
    return proposal;
  }

  /**
   * Submit a proposal for voting
   */
  submitProposal(proposal: Proposal): void {
    proposal.status = 'active';
    this.consensus.registerProposal(proposal);
    this.emit('proposal:activated', proposal);
  }

  /**
   * Vote on a proposal
   */
  vote(
    proposalId: string,
    choice: 'approve' | 'reject' | 'abstain',
    reason?: string
  ) {
    return this.consensus.castVote(proposalId, this.localNodeId, choice, reason);
  }

  /**
   * Delegate voting power
   */
  delegate(
    to: NodeId,
    proposalTypes: ProposalType[],
    percentage: number,
    duration?: number
  ): Delegation | null {
    if (!this.config.delegationEnabled) {
      return null;
    }

    // Check delegation depth
    if (this.getDelegationDepth(to) >= this.config.maxDelegationDepth) {
      return null;
    }

    const delegation: Delegation = {
      id: this.generateDelegationId(),
      from: this.localNodeId,
      to,
      proposalTypes,
      percentage: Math.min(100, Math.max(0, percentage)),
      startTime: Date.now(),
      endTime: duration ? Date.now() + duration : 0,
      revocable: true,
    };

    this.delegations.set(delegation.id, delegation);
    this.emit('delegation:created', delegation);
    return delegation;
  }

  /**
   * Revoke a delegation
   */
  revokeDelegation(delegationId: string): boolean {
    const delegation = this.delegations.get(delegationId);
    if (!delegation || delegation.from !== this.localNodeId) {
      return false;
    }

    if (!delegation.revocable) {
      return false;
    }

    this.delegations.delete(delegationId);
    this.emit('delegation:revoked', delegationId);
    return true;
  }

  /**
   * Set reputation for a node
   */
  setReputation(nodeId: NodeId, reputation: number): void {
    this.reputations.set(nodeId, Math.max(0, Math.min(1, reputation)));
  }

  /**
   * Set stake for a node
   */
  setStake(nodeId: NodeId, stake: number): void {
    this.stakes.set(nodeId, Math.max(0, stake));
  }

  /**
   * Get active proposals
   */
  getActiveProposals(): Proposal[] {
    const proposals: Proposal[] = [];
    // Would iterate through consensus engine proposals
    return proposals;
  }

  /**
   * Get proposal by ID
   */
  getProposal(proposalId: string): Proposal | undefined {
    return this.consensus.getProposal(proposalId);
  }

  /**
   * Get voting stats
   */
  getVotingStats(proposalId: string) {
    return this.consensus.getStats(proposalId);
  }

  /**
   * Get delegations for a node
   */
  getDelegationsFrom(nodeId: NodeId): Delegation[] {
    return Array.from(this.delegations.values())
      .filter(d => d.from === nodeId);
  }

  /**
   * Get delegations to a node
   */
  getDelegationsTo(nodeId: NodeId): Delegation[] {
    return Array.from(this.delegations.values())
      .filter(d => d.to === nodeId);
  }

  // Private methods

  private calculateWeight(nodeId: NodeId): VotingWeight {
    const reputation = this.reputations.get(nodeId) ?? 0.5;
    const stake = this.stakes.get(nodeId) ?? 1;
    const delegated = this.calculateDelegatedWeight(nodeId);

    const base = 1;
    const total = base * (1 + reputation) * Math.sqrt(stake) + delegated;

    return {
      base,
      reputation,
      stake,
      conviction: 1,
      delegated,
      total,
    };
  }

  private calculateDelegatedWeight(nodeId: NodeId): number {
    let delegatedWeight = 0;

    for (const delegation of this.delegations.values()) {
      if (delegation.to !== nodeId) continue;
      if (delegation.endTime > 0 && Date.now() > delegation.endTime) continue;

      const delegatorWeight = this.calculateWeight(delegation.from);
      delegatedWeight += delegatorWeight.base * (delegation.percentage / 100);
    }

    return delegatedWeight;
  }

  private getTotalWeight(): number {
    let total = 0;
    const counted = new Set<NodeId>();

    for (const nodeId of this.reputations.keys()) {
      if (!counted.has(nodeId)) {
        total += this.calculateWeight(nodeId).total;
        counted.add(nodeId);
      }
    }

    for (const nodeId of this.stakes.keys()) {
      if (!counted.has(nodeId)) {
        total += this.calculateWeight(nodeId).total;
        counted.add(nodeId);
      }
    }

    return Math.max(total, 1);
  }

  private getDelegationDepth(nodeId: NodeId): number {
    const visited = new Set<NodeId>();
    let current = nodeId;
    let depth = 0;

    while (depth < this.config.maxDelegationDepth + 1) {
      const delegation = Array.from(this.delegations.values())
        .find(d => d.from === current);

      if (!delegation || visited.has(delegation.to)) {
        break;
      }

      visited.add(current);
      current = delegation.to;
      depth++;
    }

    return depth;
  }

  private getDefaultQuorum(type: ProposalType): number {
    switch (type) {
      case 'protocol':
        return 0.4;
      case 'emergency':
        return 0.1;
      default:
        return this.config.defaultQuorum;
    }
  }

  private getDefaultThreshold(type: ProposalType): number {
    switch (type) {
      case 'protocol':
        return 0.67;
      case 'governance':
        return 0.67;
      default:
        return this.config.defaultThreshold;
    }
  }

  private generateProposalId(): string {
    return `prop_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private generateDelegationId(): string {
    return `del_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export { GovernanceConfig, Delegation };
