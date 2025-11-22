/**
 * Arbitration System - Decentralized dispute arbitration
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by Kleros Protocol and Schelling point coordination games.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

export enum ArbitratorStatus {
  AVAILABLE = 'available',
  ASSIGNED = 'assigned',
  UNAVAILABLE = 'unavailable',
  SUSPENDED = 'suspended'
}

export enum RulingChoice {
  CLAIMANT = 'claimant',
  RESPONDENT = 'respondent',
  SPLIT = 'split',
  DISMISSED = 'dismissed',
  INSUFFICIENT_EVIDENCE = 'insufficient_evidence'
}

export interface Arbitrator {
  nodeId: NodeId;
  status: ArbitratorStatus;
  stake: number;
  reputation: number;
  expertise: string[];
  casesHandled: number;
  successfulArbitrations: number;
  coherenceScore: number;
  currentCases: string[];
  registeredAt: number;
  lastActiveAt: number;
}

export interface ArbitrationPanel {
  disputeId: string;
  arbitrators: NodeId[];
  requiredVotes: number;
  votes: Map<NodeId, ArbitratorVote>;
  formedAt: number;
  deadline: number;
  ruling?: ArbitrationRuling;
  round: number;
}

export interface ArbitratorVote {
  arbitrator: NodeId;
  disputeId: string;
  ruling: RulingChoice;
  justification: string;
  confidence: number;
  suggestedAmount?: number;
  evidenceReferences: string[];
  votedAt: number;
  revealed: boolean;
  commitmentHash?: string;
}

export interface ArbitrationRuling {
  disputeId: string;
  winner: 'claimant' | 'respondent' | 'neither' | 'both';
  ruling: RulingChoice;
  summary: string;
  orders: ArbitrationOrder[];
  voteBreakdown: Map<RulingChoice, number>;
  coherentArbitrators: NodeId[];
  incoherentArbitrators: NodeId[];
  issuedAt: number;
  appealable: boolean;
  appealDeadline?: number;
}

export interface ArbitrationOrder {
  type: 'compensate' | 'penalty' | 'restore' | 'ban' | 'warn' | 'apology';
  from: NodeId;
  to?: NodeId;
  amount?: number;
  duration?: number;
  description: string;
}

export interface ArbitrationEvents {
  'arbitrator:registered': (arbitrator: Arbitrator) => void;
  'panel:formed': (panel: ArbitrationPanel) => void;
  'ruling:issued': (ruling: ArbitrationRuling) => void;
  'coherence:updated': (arbitrator: NodeId, newScore: number) => void;
}

export interface ArbitrationConfig {
  minArbitratorStake: number;
  minArbitratorReputation: number;
  panelSize: number;
  votingPeriod: number;
  revealPeriod: number;
  commitReveal: boolean;
  incoherencePenalty: number;
  coherenceReward: number;
  noShowSlash: number;
}

const DEFAULT_CONFIG: ArbitrationConfig = {
  minArbitratorStake: 100,
  minArbitratorReputation: 0.6,
  panelSize: 5,
  votingPeriod: 7 * 24 * 60 * 60 * 1000,
  revealPeriod: 2 * 24 * 60 * 60 * 1000,
  commitReveal: true,
  incoherencePenalty: 0.05,
  coherenceReward: 0.02,
  noShowSlash: 0.1
};

export class ArbitrationSystem extends EventEmitter<ArbitrationEvents> {
  private config: ArbitrationConfig;
  private arbitrators: Map<NodeId, Arbitrator> = new Map();
  private panels: Map<string, ArbitrationPanel> = new Map();
  private rulings: Map<string, ArbitrationRuling> = new Map();

  constructor(config: Partial<ArbitrationConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  registerArbitrator(
    nodeId: NodeId,
    stake: number,
    reputation: number,
    expertise: string[] = []
  ): Arbitrator | null {
    if (stake < this.config.minArbitratorStake || reputation < this.config.minArbitratorReputation) {
      return null;
    }

    const now = Date.now();
    const arbitrator: Arbitrator = {
      nodeId,
      status: ArbitratorStatus.AVAILABLE,
      stake,
      reputation,
      expertise,
      casesHandled: 0,
      successfulArbitrations: 0,
      coherenceScore: 0.5,
      currentCases: [],
      registeredAt: now,
      lastActiveAt: now
    };

    this.arbitrators.set(nodeId, arbitrator);
    this.emit('arbitrator:registered', arbitrator);
    return arbitrator;
  }

  formPanel(disputeId: string, excludeNodes: NodeId[]): ArbitrationPanel | null {
    const candidates = Array.from(this.arbitrators.values())
      .filter(a => a.status === ArbitratorStatus.AVAILABLE)
      .filter(a => !excludeNodes.includes(a.nodeId));

    if (candidates.length < this.config.panelSize) return null;

    const selected = candidates
      .sort((a, b) => b.coherenceScore - a.coherenceScore)
      .slice(0, this.config.panelSize);

    const now = Date.now();
    const panel: ArbitrationPanel = {
      disputeId,
      arbitrators: selected.map(a => a.nodeId),
      requiredVotes: Math.ceil(this.config.panelSize / 2) + 1,
      votes: new Map(),
      formedAt: now,
      deadline: now + this.config.votingPeriod,
      round: 1
    };

    this.panels.set(disputeId, panel);
    this.emit('panel:formed', panel);
    return panel;
  }

  getArbitrator(nodeId: NodeId): Arbitrator | undefined {
    return this.arbitrators.get(nodeId);
  }

  getPanel(disputeId: string): ArbitrationPanel | undefined {
    return this.panels.get(disputeId);
  }

  getRuling(disputeId: string): ArbitrationRuling | undefined {
    return this.rulings.get(disputeId);
  }
}

export default ArbitrationSystem;
