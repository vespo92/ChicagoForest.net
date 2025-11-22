/**
 * Types for the hive mind governance system
 */

import type { NodeId } from '@chicago-forest/shared-types';

/**
 * Types of proposals that can be submitted
 */
export type ProposalType =
  | 'protocol'    // Protocol changes
  | 'resource'    // Resource allocation
  | 'governance'  // Governance rule changes
  | 'membership'  // Node membership
  | 'emergency'   // Emergency decisions
  | 'custom';     // Application-defined

/**
 * A proposal for the network to vote on
 */
export interface Proposal {
  /** Unique proposal ID */
  id: string;

  /** Proposal type */
  type: ProposalType;

  /** Proposal title */
  title: string;

  /** Detailed description */
  description: string;

  /** Proposer node */
  proposer: NodeId;

  /** Creation timestamp */
  createdAt: number;

  /** Voting deadline */
  deadline: number;

  /** Required quorum (0-1) */
  quorum: number;

  /** Required approval (0-1) */
  threshold: number;

  /** Current status */
  status: ProposalStatus;

  /** Execution payload (if approved) */
  payload?: unknown;

  /** Tags for categorization */
  tags: string[];
}

export type ProposalStatus =
  | 'draft'      // Still being written
  | 'active'     // Open for voting
  | 'passed'     // Approved
  | 'rejected'   // Not approved
  | 'expired'    // Deadline passed without quorum
  | 'executed'   // Successfully executed
  | 'vetoed';    // Blocked by veto

/**
 * A vote on a proposal
 */
export interface Vote {
  /** Vote ID */
  id: string;

  /** Proposal being voted on */
  proposalId: string;

  /** Voting node */
  voter: NodeId;

  /** Vote choice */
  choice: VoteChoice;

  /** Voting weight */
  weight: number;

  /** Optional reasoning */
  reason?: string;

  /** Vote timestamp */
  timestamp: number;

  /** Cryptographic signature */
  signature: string;
}

export type VoteChoice = 'approve' | 'reject' | 'abstain';

/**
 * Result of a consensus process
 */
export interface ConsensusResult {
  /** Proposal ID */
  proposalId: string;

  /** Whether consensus was reached */
  consensusReached: boolean;

  /** Final status */
  status: ProposalStatus;

  /** Total votes cast */
  totalVotes: number;

  /** Total weight of votes */
  totalWeight: number;

  /** Approval percentage */
  approvalPercentage: number;

  /** Participation percentage */
  participationPercentage: number;

  /** Finalization timestamp */
  finalizedAt: number;
}

/**
 * Configuration for governance system
 */
export interface GovernanceConfig {
  /** Default quorum requirement */
  defaultQuorum: number;

  /** Default approval threshold */
  defaultThreshold: number;

  /** Default voting duration (ms) */
  defaultDuration: number;

  /** Enable delegation */
  delegationEnabled: boolean;

  /** Maximum delegation depth */
  maxDelegationDepth: number;

  /** Enable conviction voting */
  convictionEnabled: boolean;

  /** Conviction growth rate */
  convictionGrowthRate: number;
}

/**
 * Voting weight factors
 */
export interface VotingWeight {
  /** Base voting weight */
  base: number;

  /** Reputation multiplier */
  reputation: number;

  /** Stake multiplier */
  stake: number;

  /** Conviction multiplier */
  conviction: number;

  /** Delegated weight */
  delegated: number;

  /** Total calculated weight */
  total: number;
}

/**
 * Delegation of voting power
 */
export interface Delegation {
  /** Delegation ID */
  id: string;

  /** Node delegating */
  from: NodeId;

  /** Node receiving delegation */
  to: NodeId;

  /** Proposal types this applies to */
  proposalTypes: ProposalType[];

  /** Percentage delegated (0-100) */
  percentage: number;

  /** Start time */
  startTime: number;

  /** End time (0 = indefinite) */
  endTime: number;

  /** Is revocable */
  revocable: boolean;
}

/**
 * Conviction voting state
 */
export interface ConvictionState {
  /** Node ID */
  nodeId: NodeId;

  /** Proposal ID */
  proposalId: string;

  /** Current conviction level */
  conviction: number;

  /** Time voting started */
  startTime: number;

  /** Maximum conviction reached */
  maxConviction: number;
}

/**
 * Events emitted by governance system
 */
export interface GovernanceEvents {
  'proposal:created': (proposal: Proposal) => void;
  'proposal:activated': (proposal: Proposal) => void;
  'proposal:passed': (result: ConsensusResult) => void;
  'proposal:rejected': (result: ConsensusResult) => void;
  'proposal:expired': (proposalId: string) => void;
  'proposal:executed': (proposalId: string) => void;
  'proposal:vetoed': (proposalId: string, by: NodeId) => void;
  'vote:cast': (vote: Vote) => void;
  'vote:changed': (vote: Vote) => void;
  'delegation:created': (delegation: Delegation) => void;
  'delegation:revoked': (delegationId: string) => void;
  'quorum:reached': (proposalId: string) => void;
}
