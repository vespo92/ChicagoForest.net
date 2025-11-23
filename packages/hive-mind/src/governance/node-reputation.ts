/**
 * Node Reputation - Reputation-based governance weight
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by SourceCred, Colony reputation, and Ostrom's commons governance.
 * This code is NOT operational.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';

export enum ReputationTier {
  SEEDLING = 'seedling',
  SAPLING = 'sapling',
  MATURE = 'mature',
  ELDER = 'elder',
  ANCIENT = 'ancient'
}

export enum ReputationFactor {
  RELIABILITY = 'reliability',
  CONTRIBUTION = 'contribution',
  GOVERNANCE = 'governance',
  ENDORSEMENTS = 'endorsements',
  HISTORY = 'history',
  TECHNICAL = 'technical'
}

export interface ReputationScore {
  nodeId: NodeId;
  totalScore: number;
  tier: ReputationTier;
  factors: Record<ReputationFactor, number>;
  history: ReputationHistoryEntry[];
  lastUpdated: number;
  decayRate: number;
}

export interface ReputationHistoryEntry {
  timestamp: number;
  score: number;
  change: number;
  reason: string;
  source: string;
}

export interface ReputationAction {
  type: string;
  weight: number;
  decay: boolean;
  cooldown?: number;
  maxPerPeriod?: number;
}

export interface Endorsement {
  from: NodeId;
  to: NodeId;
  weight: number;
  context: string;
  timestamp: number;
  expires?: number;
}

export interface ReputationEvents {
  'reputation:updated': (nodeId: NodeId, score: ReputationScore) => void;
  'reputation:tier-changed': (nodeId: NodeId, oldTier: ReputationTier, newTier: ReputationTier) => void;
  'endorsement:created': (endorsement: Endorsement) => void;
  'reputation:decayed': (nodeId: NodeId, amount: number) => void;
}

export interface ReputationConfig {
  initialScore: number;
  maxScore: number;
  minScore: number;
  decayRate: number;
  decayPeriod: number;
  tierThresholds: Record<ReputationTier, number>;
  factorWeights: Record<ReputationFactor, number>;
  endorsementDecay: number;
  maxEndorsementsFrom: number;
  selfEndorsementAllowed: boolean;
}

const DEFAULT_CONFIG: ReputationConfig = {
  initialScore: 0.5,
  maxScore: 1.0,
  minScore: 0.0,
  decayRate: 0.01,
  decayPeriod: 7 * 24 * 60 * 60 * 1000,
  tierThresholds: {
    [ReputationTier.SEEDLING]: 0,
    [ReputationTier.SAPLING]: 0.25,
    [ReputationTier.MATURE]: 0.5,
    [ReputationTier.ELDER]: 0.75,
    [ReputationTier.ANCIENT]: 0.9
  },
  factorWeights: {
    [ReputationFactor.RELIABILITY]: 0.2,
    [ReputationFactor.CONTRIBUTION]: 0.25,
    [ReputationFactor.GOVERNANCE]: 0.2,
    [ReputationFactor.ENDORSEMENTS]: 0.1,
    [ReputationFactor.HISTORY]: 0.15,
    [ReputationFactor.TECHNICAL]: 0.1
  },
  endorsementDecay: 0.02,
  maxEndorsementsFrom: 10,
  selfEndorsementAllowed: false
};

const REPUTATION_ACTIONS: Record<string, ReputationAction> = {
  vote_cast: { type: 'vote_cast', weight: 0.01, decay: true, cooldown: 3600000 },
  proposal_created: { type: 'proposal_created', weight: 0.05, decay: true, cooldown: 86400000 },
  proposal_passed: { type: 'proposal_passed', weight: 0.1, decay: true },
  proposal_rejected: { type: 'proposal_rejected', weight: -0.02, decay: false },
  grant_funded: { type: 'grant_funded', weight: 0.08, decay: true },
  dispute_resolved: { type: 'dispute_resolved', weight: 0.05, decay: true },
  uptime_bonus: { type: 'uptime_bonus', weight: 0.02, decay: true, maxPerPeriod: 4 },
  energy_contributed: { type: 'energy_contributed', weight: 0.03, decay: true },
  slashing_event: { type: 'slashing_event', weight: -0.2, decay: false }
};

export class NodeReputation extends EventEmitter<ReputationEvents> {
  private config: ReputationConfig;
  private scores: Map<NodeId, ReputationScore> = new Map();
  private endorsements: Map<string, Endorsement> = new Map();
  private actionCooldowns: Map<string, number> = new Map();

  constructor(config: Partial<ReputationConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getOrCreateScore(nodeId: NodeId): ReputationScore {
    let score = this.scores.get(nodeId);
    if (!score) {
      score = {
        nodeId,
        totalScore: this.config.initialScore,
        tier: this.getTierForScore(this.config.initialScore),
        factors: {
          [ReputationFactor.RELIABILITY]: this.config.initialScore,
          [ReputationFactor.CONTRIBUTION]: 0,
          [ReputationFactor.GOVERNANCE]: this.config.initialScore,
          [ReputationFactor.ENDORSEMENTS]: 0,
          [ReputationFactor.HISTORY]: this.config.initialScore,
          [ReputationFactor.TECHNICAL]: this.config.initialScore
        },
        history: [],
        lastUpdated: Date.now(),
        decayRate: this.config.decayRate
      };
      this.scores.set(nodeId, score);
    }
    return score;
  }

  recordAction(nodeId: NodeId, actionType: string, context?: string): boolean {
    const action = REPUTATION_ACTIONS[actionType];
    if (!action) return false;

    const cooldownKey = `${nodeId}:${actionType}`;
    if (action.cooldown) {
      const lastAction = this.actionCooldowns.get(cooldownKey);
      if (lastAction && Date.now() - lastAction < action.cooldown) {
        return false;
      }
    }

    const score = this.getOrCreateScore(nodeId);
    const change = action.weight;
    const newTotal = Math.max(
      this.config.minScore,
      Math.min(this.config.maxScore, score.totalScore + change)
    );

    const oldTier = score.tier;
    score.totalScore = newTotal;
    score.tier = this.getTierForScore(newTotal);
    score.lastUpdated = Date.now();
    score.history.push({
      timestamp: Date.now(),
      score: newTotal,
      change,
      reason: actionType,
      source: context || 'system'
    });

    if (action.cooldown) {
      this.actionCooldowns.set(cooldownKey, Date.now());
    }

    this.emit('reputation:updated', nodeId, score);
    if (oldTier !== score.tier) {
      this.emit('reputation:tier-changed', nodeId, oldTier, score.tier);
    }

    return true;
  }

  addEndorsement(from: NodeId, to: NodeId, weight: number, context: string): Endorsement | null {
    if (!this.config.selfEndorsementAllowed && from === to) {
      return null;
    }

    const fromEndorsements = Array.from(this.endorsements.values())
      .filter(e => e.from === from);
    if (fromEndorsements.length >= this.config.maxEndorsementsFrom) {
      return null;
    }

    const endorsementId = `${from}:${to}`;
    const endorsement: Endorsement = {
      from,
      to,
      weight: Math.min(weight, 1),
      context,
      timestamp: Date.now()
    };

    this.endorsements.set(endorsementId, endorsement);
    this.updateEndorsementFactor(to);
    this.emit('endorsement:created', endorsement);
    return endorsement;
  }

  removeEndorsement(from: NodeId, to: NodeId): boolean {
    const endorsementId = `${from}:${to}`;
    if (this.endorsements.delete(endorsementId)) {
      this.updateEndorsementFactor(to);
      return true;
    }
    return false;
  }

  applyDecay(): void {
    const now = Date.now();
    for (const [nodeId, score] of this.scores.entries()) {
      const timeSinceUpdate = now - score.lastUpdated;
      const periods = timeSinceUpdate / this.config.decayPeriod;

      if (periods >= 1) {
        const decayAmount = score.totalScore * this.config.decayRate * Math.floor(periods);
        const newScore = Math.max(this.config.minScore, score.totalScore - decayAmount);

        if (newScore !== score.totalScore) {
          const oldTier = score.tier;
          score.totalScore = newScore;
          score.tier = this.getTierForScore(newScore);
          score.lastUpdated = now;

          this.emit('reputation:decayed', nodeId, decayAmount);
          if (oldTier !== score.tier) {
            this.emit('reputation:tier-changed', nodeId, oldTier, score.tier);
          }
        }
      }
    }
  }

  getScore(nodeId: NodeId): ReputationScore | undefined {
    return this.scores.get(nodeId);
  }

  getTopNodes(count: number): ReputationScore[] {
    return Array.from(this.scores.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, count);
  }

  getNodesByTier(tier: ReputationTier): ReputationScore[] {
    return Array.from(this.scores.values()).filter(s => s.tier === tier);
  }

  calculateVotingMultiplier(nodeId: NodeId): number {
    const score = this.scores.get(nodeId);
    if (!score) return 1;
    return 0.5 + score.totalScore;
  }

  private getTierForScore(score: number): ReputationTier {
    const tiers = Object.entries(this.config.tierThresholds)
      .sort(([, a], [, b]) => b - a);

    for (const [tier, threshold] of tiers) {
      if (score >= threshold) {
        return tier as ReputationTier;
      }
    }
    return ReputationTier.SEEDLING;
  }

  private updateEndorsementFactor(nodeId: NodeId): void {
    const score = this.getOrCreateScore(nodeId);
    const nodeEndorsements = Array.from(this.endorsements.values())
      .filter(e => e.to === nodeId);

    let endorsementScore = 0;
    for (const endorsement of nodeEndorsements) {
      const endorserScore = this.scores.get(endorsement.from);
      const endorserWeight = endorserScore ? endorserScore.totalScore : 0.5;
      endorsementScore += endorsement.weight * endorserWeight;
    }

    score.factors[ReputationFactor.ENDORSEMENTS] = Math.min(1, endorsementScore / 10);
    this.recalculateTotalScore(nodeId);
  }

  private recalculateTotalScore(nodeId: NodeId): void {
    const score = this.scores.get(nodeId);
    if (!score) return;

    let total = 0;
    for (const [factor, value] of Object.entries(score.factors)) {
      const weight = this.config.factorWeights[factor as ReputationFactor] || 0;
      total += value * weight;
    }

    const oldTier = score.tier;
    score.totalScore = Math.max(this.config.minScore, Math.min(this.config.maxScore, total));
    score.tier = this.getTierForScore(score.totalScore);

    this.emit('reputation:updated', nodeId, score);
    if (oldTier !== score.tier) {
      this.emit('reputation:tier-changed', nodeId, oldTier, score.tier);
    }
  }
}

export default NodeReputation;
