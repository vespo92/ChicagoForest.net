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
 * - Constitutional Governance: Foundational rules and amendments
 * - MultiSig: Multi-party authorization for critical actions
 * - Emergency Governance: Crisis management protocols
 * - Policy Engine: Rule enforcement and compliance
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * It represents conceptual designs for decentralized governance inspired by:
 * - Aragon DAO Framework
 * - Compound Governance
 * - MolochDAO
 * - Gitcoin Grants
 * - Kleros Decentralized Court
 * - Ostrom's Commons Governance Principles
 * - Gnosis Safe MultiSig
 * - Constitutional Law Principles
 *
 * This code is NOT operational and represents aspirational design patterns
 * for community-owned energy network governance.
 */

// Core modules
export * from './consensus';
export * from './governance';
export * from './proposals';
export * from './disputes';
export * from './treasury';
export * from './models';
export * from './sync';

// Extended governance modules
export * from './controller';
export * from './constitution';
export * from './multisig';
export * from './emergency';
export * from './policies';

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
