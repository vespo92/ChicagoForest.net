/**
 * Member Model - Network participant data structures
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * These are conceptual data models for decentralized governance, NOT operational.
 */

import type { NodeId } from '@chicago-forest/shared-types';

export enum MemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
  REMOVED = 'removed',
  EXITED = 'exited'
}

export enum MemberRole {
  MEMBER = 'member',
  PROPOSER = 'proposer',
  REVIEWER = 'reviewer',
  ARBITRATOR = 'arbitrator',
  EXECUTOR = 'executor',
  ADMIN = 'admin',
  FOUNDER = 'founder'
}

export enum MemberType {
  PRODUCER = 'producer',
  CONSUMER = 'consumer',
  PROSUMER = 'prosumer',
  INFRASTRUCTURE = 'infrastructure',
  SERVICE = 'service',
  OBSERVER = 'observer'
}

export interface Member {
  id: NodeId;
  alias?: string;
  displayName?: string;
  status: MemberStatus;
  type: MemberType;
  roles: MemberRole[];
  reputation: MemberReputation;
  stake: MemberStake;
  delegations: MemberDelegations;
  votingHistory: VotingHistorySummary;
  contribution: ContributionMetrics;
  joinedAt: number;
  lastActiveAt: number;
  metadata: MemberMetadata;
  verified: boolean;
  verificationLevel: number;
  badges: Badge[];
}

export interface MemberReputation {
  score: number;
  tier: string;
  factors: { reliability: number; contribution: number; governance: number; endorsements: number; history: number; technical: number };
  history: Array<{ score: number; timestamp: number }>;
  lastUpdated: number;
}

export interface MemberStake {
  total: number;
  available: number;
  locked: number;
  lockedUntil?: number;
  breakdown: Array<{ type: string; amount: number; multiplier: number }>;
}

export interface MemberDelegations {
  outgoing: Array<{ to: NodeId; percentage: number; topics: string[]; since: number }>;
  incoming: Array<{ from: NodeId; percentage: number; topics: string[]; since: number }>;
  totalDelegatedOut: number;
  totalDelegatedIn: number;
}

export interface VotingHistorySummary {
  totalVotes: number;
  approveVotes: number;
  rejectVotes: number;
  abstainVotes: number;
  proposalsCreated: number;
  proposalsPassed: number;
  participationRate: number;
  coherenceScore: number;
  lastVoteAt?: number;
}

export interface ContributionMetrics {
  energyContributed: number;
  energyConsumed: number;
  netContribution: number;
  uptime: number;
  infrastructure: { nodes: number; storage: number; bandwidth: number };
  economicValue: number;
  grantsFunded: number;
  disputesResolved: number;
}

export interface MemberMetadata {
  location?: { region: string; timezone: string };
  preferences: { notifications: boolean; privacy: 'public' | 'members' | 'private'; language: string };
  social?: { website?: string; github?: string; twitter?: string };
  bio?: string;
  avatar?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: 'governance' | 'contribution' | 'community' | 'technical' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: number;
}

export interface MemberActivity {
  id: string;
  memberId: NodeId;
  type: ActivityType;
  details: Record<string, unknown>;
  timestamp: number;
  impact: number;
}

export type ActivityType = 'vote_cast' | 'proposal_created' | 'proposal_sponsored' | 'delegation_created' | 'stake_deposited' | 'grant_contributed' | 'reputation_changed' | 'badge_earned';

export class MemberBuilder {
  private member: Partial<Member>;

  constructor(id: NodeId) {
    const now = Date.now();
    this.member = {
      id,
      status: MemberStatus.PENDING,
      type: MemberType.CONSUMER,
      roles: [MemberRole.MEMBER],
      reputation: { score: 0.5, tier: 'seedling', factors: { reliability: 0.5, contribution: 0, governance: 0.5, endorsements: 0, history: 0.5, technical: 0.5 }, history: [], lastUpdated: now },
      stake: { total: 0, available: 0, locked: 0, breakdown: [] },
      delegations: { outgoing: [], incoming: [], totalDelegatedOut: 0, totalDelegatedIn: 0 },
      votingHistory: { totalVotes: 0, approveVotes: 0, rejectVotes: 0, abstainVotes: 0, proposalsCreated: 0, proposalsPassed: 0, participationRate: 0, coherenceScore: 0.5 },
      contribution: { energyContributed: 0, energyConsumed: 0, netContribution: 0, uptime: 0, infrastructure: { nodes: 0, storage: 0, bandwidth: 0 }, economicValue: 0, grantsFunded: 0, disputesResolved: 0 },
      joinedAt: now,
      lastActiveAt: now,
      metadata: { preferences: { notifications: true, privacy: 'members', language: 'en' } },
      verified: false,
      verificationLevel: 0,
      badges: []
    };
  }

  alias(alias: string): this { this.member.alias = alias; return this; }
  displayName(name: string): this { this.member.displayName = name; return this; }
  status(status: MemberStatus): this { this.member.status = status; return this; }
  type(type: MemberType): this { this.member.type = type; return this; }
  roles(roles: MemberRole[]): this { this.member.roles = roles; return this; }

  build(): Member { return this.member as Member; }
}

export function canPerformAction(member: Member, action: string): boolean {
  if (member.status !== MemberStatus.ACTIVE) return false;

  const rolePermissions: Record<MemberRole, string[]> = {
    [MemberRole.MEMBER]: ['vote', 'view_proposals'],
    [MemberRole.PROPOSER]: ['create_proposal', 'sponsor_proposal'],
    [MemberRole.REVIEWER]: ['review_proposal', 'review_grant'],
    [MemberRole.ARBITRATOR]: ['arbitrate', 'vote_on_disputes'],
    [MemberRole.EXECUTOR]: ['execute_proposal'],
    [MemberRole.ADMIN]: ['manage_members', 'manage_roles'],
    [MemberRole.FOUNDER]: ['all']
  };

  for (const role of member.roles) {
    const permissions = rolePermissions[role];
    if (permissions.includes('all') || permissions.includes(action)) return true;
  }
  return false;
}

export function calculateVotingPower(member: Member): number {
  const stakePower = Math.sqrt(member.stake.total);
  const reputationMultiplier = 0.5 + member.reputation.score;
  const delegatedOut = member.delegations.totalDelegatedOut / 100;
  const delegatedIn = member.delegations.totalDelegatedIn;
  return Math.max(0, stakePower * reputationMultiplier * (1 - delegatedOut) + delegatedIn);
}

export default { MemberBuilder, canPerformAction, calculateVotingPower };
