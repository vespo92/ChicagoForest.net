/**
 * Proposal Model - Enhanced proposal data structures
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * These are conceptual data models for decentralized governance, NOT operational.
 */

import type { NodeId } from '@chicago-forest/shared-types';

export enum ProposalVisibility {
  PUBLIC = 'public',
  MEMBERS_ONLY = 'members',
  PRIVATE = 'private',
  ENCRYPTED = 'encrypted'
}

export enum ProposalImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ExecutionStrategy {
  IMMEDIATE = 'immediate',
  TIMELOCKED = 'timelocked',
  SCHEDULED = 'scheduled',
  MANUAL = 'manual',
  BATCHED = 'batched'
}

export type ProposalType = 'protocol' | 'resource' | 'governance' | 'membership' | 'emergency' | 'custom' | 'treasury' | 'federation' | 'parameter';
export type ProposalStatus = 'draft' | 'active' | 'passed' | 'rejected' | 'expired' | 'executed' | 'vetoed' | 'cancelled';

export interface EnhancedProposal {
  id: string;
  version: number;
  type: ProposalType;
  category: string;
  impact: ProposalImpact;
  visibility: ProposalVisibility;
  title: string;
  summary: string;
  description: string;
  specification?: ProposalSpecification;
  rationale: string;
  proposer: NodeId;
  coAuthors: NodeId[];
  sponsors: NodeId[];
  quorum: number;
  threshold: number;
  votingPeriod: number;
  executionDelay: number;
  executionStrategy: ExecutionStrategy;
  status: ProposalStatus;
  stage: string;
  createdAt: number;
  updatedAt: number;
  payload?: ProposalPayload;
  executionResult?: ExecutionResult;
  tags: string[];
  links: ProposalLink[];
  attachments: ProposalAttachment[];
}

export interface ProposalSpecification {
  technical?: { changes: ParameterChange[]; migrations?: MigrationStep[] };
  economic?: { budget?: number; fundingSource?: string };
  timeline?: { phases: ImplementationPhase[] };
}

export interface ParameterChange {
  parameter: string;
  currentValue: unknown;
  proposedValue: unknown;
  justification: string;
}

export interface MigrationStep {
  order: number;
  description: string;
  reversible: boolean;
  estimatedDuration: number;
}

export interface ImplementationPhase {
  name: string;
  description: string;
  startOffset: number;
  duration: number;
  deliverables: string[];
}

export interface ProposalPayload {
  type: string;
  version: string;
  data: unknown;
  targets: PayloadTarget[];
}

export interface PayloadTarget {
  type: 'contract' | 'parameter' | 'action' | 'custom';
  address?: string;
  method?: string;
  args?: unknown[];
}

export interface ExecutionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  logs: string[];
  timestamp: number;
}

export interface ProposalLink {
  type: 'discussion' | 'documentation' | 'implementation' | 'reference' | 'other';
  url: string;
  title: string;
}

export interface ProposalAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  hash: string;
}

export class ProposalBuilder {
  private proposal: Partial<EnhancedProposal>;

  constructor(proposer: NodeId) {
    this.proposal = {
      id: `prop_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      version: 1,
      proposer,
      coAuthors: [],
      sponsors: [proposer],
      status: 'draft',
      stage: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      links: [],
      attachments: [],
      visibility: ProposalVisibility.PUBLIC,
      impact: ProposalImpact.MEDIUM,
      executionStrategy: ExecutionStrategy.TIMELOCKED
    };
  }

  type(type: ProposalType): this { this.proposal.type = type; return this; }
  title(title: string): this { this.proposal.title = title; return this; }
  summary(summary: string): this { this.proposal.summary = summary; return this; }
  description(description: string): this { this.proposal.description = description; return this; }
  rationale(rationale: string): this { this.proposal.rationale = rationale; return this; }
  impact(impact: ProposalImpact): this { this.proposal.impact = impact; return this; }
  quorum(quorum: number): this { this.proposal.quorum = quorum; return this; }
  threshold(threshold: number): this { this.proposal.threshold = threshold; return this; }

  build(): EnhancedProposal {
    if (!this.proposal.type) throw new Error('Type is required');
    if (!this.proposal.title) throw new Error('Title is required');
    return this.proposal as EnhancedProposal;
  }
}

export default { ProposalBuilder };
