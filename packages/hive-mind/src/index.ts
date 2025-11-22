/**
 * @chicago-forest/hive-mind
 *
 * Collective intelligence and decentralized governance.
 * Like how bee colonies make decisions without central control,
 * the forest network enables emergent decision-making.
 *
 * Governance mechanisms:
 * - Lazy Consensus: Accept unless objection
 * - Weighted Voting: Reputation + stake
 * - Conviction Voting: Time-locked commitment
 * - Futarchy: Prediction markets for policy
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * It represents conceptual designs for decentralized governance inspired by:
 * - Aragon DAO Framework
 * - Compound Governance
 * - MolochDAO
 * - Gitcoin Grants
 * - Kleros Decentralized Court
 * - Ostrom's Commons Governance Principles
 *
 * This code is NOT operational and represents aspirational design patterns
 * for community-owned energy network governance.
 */

// Core modules
export * from './consensus';
export * from './governance';
export * from './proposals';

// Extended modules
export * from './disputes';
export * from './treasury';
export * from './models';

// Core types
export type {
  Proposal,
  Vote,
  ConsensusResult,
  GovernanceConfig,
  ProposalType,
  ProposalStatus,
  VoteChoice,
  VotingWeight,
  Delegation,
  ConvictionState,
  GovernanceEvents,
} from './types';
