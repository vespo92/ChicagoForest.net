/**
 * Grant Proposals - Community funding allocation system
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by Gitcoin Grants, MolochDAO, and retroactive public goods funding.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

export enum GrantType {
  INFRASTRUCTURE = 'infrastructure',
  RESEARCH = 'research',
  COMMUNITY = 'community',
  EDUCATION = 'education',
  EMERGENCY = 'emergency',
  RETROACTIVE = 'retroactive'
}

export enum GrantStatus {
  DRAFT = 'draft',
  FUNDING = 'funding',
  FUNDED = 'funded',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  UNDER_REVIEW = 'under_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export interface GrantProposal {
  id: string;
  type: GrantType;
  status: GrantStatus;
  proposer: NodeId;
  team: NodeId[];
  title: string;
  description: string;
  specification: string;
  requestedAmount: number;
  contributions: Map<NodeId, number>;
  matchAmount: number;
  totalFunded: number;
  milestones: Milestone[];
  currentMilestone: number;
  deliverables: Deliverable[];
  startDate?: number;
  endDate?: number;
  createdAt: number;
  updatedAt: number;
  fundingDeadline?: number;
  tags: string[];
  links: string[];
  budgetBreakdown: BudgetItem[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  targetDate: number;
  completedAt?: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  evidence?: string;
  feedback?: string;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  type: 'code' | 'documentation' | 'report' | 'design' | 'event' | 'other';
  delivered: boolean;
  link?: string;
}

export interface BudgetItem {
  category: string;
  description: string;
  amount: number;
  percentage: number;
}

export interface Contribution {
  id: string;
  grantId: string;
  contributor: NodeId;
  amount: number;
  timestamp: number;
  message?: string;
  isAnonymous: boolean;
}

export interface FundingRound {
  id: string;
  name: string;
  matchingPool: number;
  remainingMatch: number;
  startTime: number;
  endTime: number;
  minContribution: number;
  maxContribution: number;
  eligibleTypes: GrantType[];
  grants: string[];
  active: boolean;
}

export interface GrantEvents {
  'grant:proposed': (grant: GrantProposal) => void;
  'grant:contribution-received': (grantId: string, contribution: Contribution) => void;
  'grant:funded': (grant: GrantProposal) => void;
  'grant:completed': (grant: GrantProposal) => void;
  'round:created': (round: FundingRound) => void;
}

export interface GrantConfig {
  minGrantAmount: number;
  maxGrantAmount: number;
  minContribution: number;
  defaultFundingPeriod: number;
  maxMilestones: number;
  useQuadraticFunding: boolean;
  quadraticCap: number;
  milestonesRequiredAbove: number;
  reviewersRequired: number;
}

const DEFAULT_CONFIG: GrantConfig = {
  minGrantAmount: 10,
  maxGrantAmount: 10000,
  minContribution: 1,
  defaultFundingPeriod: 30 * 24 * 60 * 60 * 1000,
  maxMilestones: 10,
  useQuadraticFunding: true,
  quadraticCap: 5000,
  milestonesRequiredAbove: 500,
  reviewersRequired: 3
};

export class GrantSystem extends EventEmitter<GrantEvents> {
  private config: GrantConfig;
  private grants: Map<string, GrantProposal> = new Map();
  private contributions: Map<string, Contribution> = new Map();
  private rounds: Map<string, FundingRound> = new Map();
  private activeRound?: FundingRound;

  constructor(config: Partial<GrantConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  createProposal(
    proposer: NodeId,
    type: GrantType,
    title: string,
    description: string,
    requestedAmount: number
  ): GrantProposal | null {
    if (requestedAmount < this.config.minGrantAmount || requestedAmount > this.config.maxGrantAmount) {
      return null;
    }

    const now = Date.now();
    const grant: GrantProposal = {
      id: this.generateId('grant'),
      type,
      status: GrantStatus.DRAFT,
      proposer,
      team: [proposer],
      title,
      description,
      specification: '',
      requestedAmount,
      contributions: new Map(),
      matchAmount: 0,
      totalFunded: 0,
      milestones: [],
      currentMilestone: 0,
      deliverables: [],
      createdAt: now,
      updatedAt: now,
      tags: [],
      links: [],
      budgetBreakdown: []
    };

    this.grants.set(grant.id, grant);
    this.emit('grant:proposed', grant);
    return grant;
  }

  contribute(grantId: string, contributor: NodeId, amount: number): Contribution | null {
    const grant = this.grants.get(grantId);
    if (!grant || grant.status !== GrantStatus.FUNDING || amount < this.config.minContribution) {
      return null;
    }

    const contribution: Contribution = {
      id: this.generateId('contrib'),
      grantId,
      contributor,
      amount,
      timestamp: Date.now(),
      isAnonymous: false
    };

    this.contributions.set(contribution.id, contribution);
    const existing = grant.contributions.get(contributor) ?? 0;
    grant.contributions.set(contributor, existing + amount);
    this.calculateMatch(grantId);

    if (grant.totalFunded >= grant.requestedAmount) {
      grant.status = GrantStatus.FUNDED;
      this.emit('grant:funded', grant);
    }

    this.emit('grant:contribution-received', grantId, contribution);
    return contribution;
  }

  calculateMatch(grantId: string): void {
    if (!this.config.useQuadraticFunding) return;

    const grant = this.grants.get(grantId);
    if (!grant) return;

    let sumOfSqrts = 0;
    for (const amount of grant.contributions.values()) {
      sumOfSqrts += Math.sqrt(amount);
    }

    const rawMatch = sumOfSqrts * sumOfSqrts;
    const directContributions = Array.from(grant.contributions.values()).reduce((a, b) => a + b, 0);
    grant.matchAmount = Math.min(rawMatch - directContributions, this.config.quadraticCap);
    grant.totalFunded = directContributions + grant.matchAmount;
    grant.updatedAt = Date.now();
  }

  getGrant(grantId: string): GrantProposal | undefined {
    return this.grants.get(grantId);
  }

  getGrantsByStatus(status: GrantStatus): GrantProposal[] {
    return Array.from(this.grants.values()).filter(g => g.status === status);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default GrantSystem;
