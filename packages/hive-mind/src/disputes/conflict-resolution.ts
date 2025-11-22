/**
 * Conflict Resolution - Dispute handling mechanisms
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by Kleros, Aragon Court, and restorative justice principles.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

export enum DisputeType {
  RESOURCE = 'resource',
  VIOLATION = 'violation',
  SERVICE = 'service',
  GOVERNANCE = 'governance',
  INTERPERSONAL = 'interpersonal',
  TECHNICAL = 'technical',
  ECONOMIC = 'economic'
}

export enum DisputeStage {
  FILED = 'filed',
  AWAITING_RESPONSE = 'awaiting_response',
  MEDIATION = 'mediation',
  ARBITRATION = 'arbitration',
  COMMUNITY_VOTE = 'community_vote',
  RESOLUTION_PROPOSED = 'resolution_proposed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
  APPEALED = 'appealed'
}

export enum ResolutionType {
  DISMISSAL = 'dismissal',
  SETTLEMENT = 'settlement',
  ARBITRATION_RULING = 'arbitration_ruling',
  COMMUNITY_DECISION = 'community_decision',
  COMPENSATION = 'compensation',
  PENALTY = 'penalty',
  RESTORATION = 'restoration'
}

export interface Dispute {
  id: string;
  type: DisputeType;
  stage: DisputeStage;
  claimant: NodeId;
  respondent: NodeId;
  description: string;
  evidence: Evidence[];
  resolutionAttempts: ResolutionAttempt[];
  currentResolution?: ResolutionProposal;
  handlers: NodeId[];
  stakeAmount: number;
  filedAt: number;
  updatedAt: number;
  deadline: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidential: boolean;
}

export interface Evidence {
  id: string;
  submitter: NodeId;
  type: 'document' | 'log' | 'testimony' | 'transaction' | 'screenshot' | 'other';
  description: string;
  hash: string;
  submittedAt: number;
  verified: boolean;
}

export interface ResolutionAttempt {
  id: string;
  stage: DisputeStage;
  proposer: NodeId;
  proposal: string;
  accepted: boolean;
  claimantApproved?: boolean;
  respondentApproved?: boolean;
  timestamp: number;
  notes?: string;
}

export interface ResolutionProposal {
  id: string;
  disputeId: string;
  proposer: NodeId;
  type: ResolutionType;
  description: string;
  actions: ResolutionAction[];
  approvals: Map<NodeId, boolean>;
  responseDeadline: number;
  createdAt: number;
}

export interface ResolutionAction {
  type: 'transfer' | 'penalty' | 'restore' | 'ban' | 'warn' | 'custom';
  target: NodeId;
  amount?: number;
  duration?: number;
  description: string;
}

export interface ConflictEvents {
  'dispute:filed': (dispute: Dispute) => void;
  'dispute:stage-changed': (disputeId: string, oldStage: DisputeStage, newStage: DisputeStage) => void;
  'dispute:resolved': (dispute: Dispute, resolution: ResolutionProposal) => void;
  'dispute:dismissed': (disputeId: string, reason: string) => void;
}

export interface ConflictConfig {
  minStakeToFile: number;
  responseDeadline: number;
  mediationTimeout: number;
  arbitrationTimeout: number;
  arbitratorsRequired: number;
  minArbitratorReputation: number;
  appealsEnabled: boolean;
  appealDeadline: number;
  autoEscalate: boolean;
}

const DEFAULT_CONFIG: ConflictConfig = {
  minStakeToFile: 10,
  responseDeadline: 7 * 24 * 60 * 60 * 1000,
  mediationTimeout: 14 * 24 * 60 * 60 * 1000,
  arbitrationTimeout: 21 * 24 * 60 * 60 * 1000,
  arbitratorsRequired: 3,
  minArbitratorReputation: 0.7,
  appealsEnabled: true,
  appealDeadline: 7 * 24 * 60 * 60 * 1000,
  autoEscalate: true
};

export class ConflictResolver extends EventEmitter<ConflictEvents> {
  private config: ConflictConfig;
  private disputes: Map<string, Dispute> = new Map();

  constructor(config: Partial<ConflictConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  fileDispute(
    claimant: NodeId,
    respondent: NodeId,
    type: DisputeType,
    description: string
  ): Dispute | null {
    if (claimant === respondent) return null;

    const now = Date.now();
    const dispute: Dispute = {
      id: this.generateId('dsp'),
      type,
      stage: DisputeStage.FILED,
      claimant,
      respondent,
      description,
      evidence: [],
      resolutionAttempts: [],
      handlers: [],
      stakeAmount: this.config.minStakeToFile,
      filedAt: now,
      updatedAt: now,
      deadline: now + this.config.responseDeadline,
      tags: [],
      priority: 'medium',
      confidential: false
    };

    this.disputes.set(dispute.id, dispute);
    this.changeStage(dispute, DisputeStage.AWAITING_RESPONSE);
    this.emit('dispute:filed', dispute);
    return dispute;
  }

  getDispute(disputeId: string): Dispute | undefined {
    return this.disputes.get(disputeId);
  }

  getActiveDisputes(): Dispute[] {
    return Array.from(this.disputes.values())
      .filter(d => ![DisputeStage.RESOLVED, DisputeStage.DISMISSED].includes(d.stage));
  }

  private changeStage(dispute: Dispute, newStage: DisputeStage): void {
    const oldStage = dispute.stage;
    dispute.stage = newStage;
    dispute.updatedAt = Date.now();
    this.emit('dispute:stage-changed', dispute.id, oldStage, newStage);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default ConflictResolver;
