/**
 * Quorum Calculation - Dynamic quorum and threshold management
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by adaptive quorum biasing and participation incentives.
 * This code is NOT operational.
 */

import type { NodeId } from '@chicago-forest/shared-types';

export enum QuorumType {
  FIXED = 'fixed',
  PARTICIPATION_BASED = 'participation_based',
  ADAPTIVE = 'adaptive',
  SLIDING = 'sliding',
  TIME_WEIGHTED = 'time_weighted'
}

export interface QuorumConfig {
  type: QuorumType;
  baseQuorum: number;
  minQuorum: number;
  maxQuorum: number;
  adaptationRate: number;
  lookbackPeriod: number;
  emergencyMultiplier: number;
  highImpactMultiplier: number;
}

export interface ParticipationHistory {
  proposalId: string;
  timestamp: number;
  eligibleVoters: number;
  actualVoters: number;
  totalWeight: number;
  usedWeight: number;
  quorumRequired: number;
  quorumAchieved: boolean;
}

export interface QuorumContext {
  proposalType: string;
  proposalImpact: 'low' | 'medium' | 'high' | 'critical';
  isEmergency: boolean;
  currentParticipation: number;
  historicalParticipation: number;
  timeRemaining: number;
  totalDuration: number;
}

export interface ThresholdConfig {
  baseThreshold: number;
  minThreshold: number;
  maxThreshold: number;
  typeOverrides: Record<string, number>;
  impactOverrides: Record<string, number>;
}

export interface QuorumResult {
  requiredQuorum: number;
  requiredThreshold: number;
  quorumMet: boolean;
  thresholdMet: boolean;
  participationRate: number;
  approvalRate: number;
  adjustments: QuorumAdjustment[];
}

export interface QuorumAdjustment {
  factor: string;
  originalValue: number;
  adjustedValue: number;
  reason: string;
}

const DEFAULT_QUORUM_CONFIG: QuorumConfig = {
  type: QuorumType.ADAPTIVE,
  baseQuorum: 0.1,
  minQuorum: 0.05,
  maxQuorum: 0.5,
  adaptationRate: 0.1,
  lookbackPeriod: 30 * 24 * 60 * 60 * 1000,
  emergencyMultiplier: 0.5,
  highImpactMultiplier: 1.5
};

const DEFAULT_THRESHOLD_CONFIG: ThresholdConfig = {
  baseThreshold: 0.5,
  minThreshold: 0.5,
  maxThreshold: 0.9,
  typeOverrides: {
    protocol: 0.66,
    governance: 0.66,
    emergency: 0.75,
    parameter: 0.5,
    treasury: 0.6
  },
  impactOverrides: {
    low: 0.5,
    medium: 0.55,
    high: 0.66,
    critical: 0.75
  }
};

export class QuorumCalculator {
  private config: QuorumConfig;
  private thresholdConfig: ThresholdConfig;
  private participationHistory: ParticipationHistory[] = [];

  constructor(
    config: Partial<QuorumConfig> = {},
    thresholdConfig: Partial<ThresholdConfig> = {}
  ) {
    this.config = { ...DEFAULT_QUORUM_CONFIG, ...config };
    this.thresholdConfig = { ...DEFAULT_THRESHOLD_CONFIG, ...thresholdConfig };
  }

  calculateQuorum(context: QuorumContext): number {
    let quorum = this.config.baseQuorum;
    const adjustments: QuorumAdjustment[] = [];

    switch (this.config.type) {
      case QuorumType.FIXED:
        break;

      case QuorumType.PARTICIPATION_BASED:
        quorum = this.participationBasedQuorum(context.historicalParticipation, adjustments);
        break;

      case QuorumType.ADAPTIVE:
        quorum = this.adaptiveQuorum(context, adjustments);
        break;

      case QuorumType.SLIDING:
        quorum = this.slidingQuorum(context, adjustments);
        break;

      case QuorumType.TIME_WEIGHTED:
        quorum = this.timeWeightedQuorum(context, adjustments);
        break;
    }

    if (context.isEmergency) {
      const originalQuorum = quorum;
      quorum *= this.config.emergencyMultiplier;
      adjustments.push({
        factor: 'emergency',
        originalValue: originalQuorum,
        adjustedValue: quorum,
        reason: 'Emergency proposal requires faster resolution'
      });
    }

    if (context.proposalImpact === 'high' || context.proposalImpact === 'critical') {
      const originalQuorum = quorum;
      quorum *= this.config.highImpactMultiplier;
      adjustments.push({
        factor: 'impact',
        originalValue: originalQuorum,
        adjustedValue: quorum,
        reason: `${context.proposalImpact} impact requires higher participation`
      });
    }

    return Math.max(this.config.minQuorum, Math.min(this.config.maxQuorum, quorum));
  }

  calculateThreshold(proposalType: string, impact: string): number {
    let threshold = this.thresholdConfig.baseThreshold;

    if (this.thresholdConfig.typeOverrides[proposalType]) {
      threshold = Math.max(threshold, this.thresholdConfig.typeOverrides[proposalType]);
    }

    if (this.thresholdConfig.impactOverrides[impact]) {
      threshold = Math.max(threshold, this.thresholdConfig.impactOverrides[impact]);
    }

    return Math.max(
      this.thresholdConfig.minThreshold,
      Math.min(this.thresholdConfig.maxThreshold, threshold)
    );
  }

  evaluateQuorum(
    context: QuorumContext,
    votes: { approve: number; reject: number; abstain: number },
    totalEligibleWeight: number
  ): QuorumResult {
    const requiredQuorum = this.calculateQuorum(context);
    const requiredThreshold = this.calculateThreshold(context.proposalType, context.proposalImpact);

    const totalVoteWeight = votes.approve + votes.reject + votes.abstain;
    const participationRate = totalVoteWeight / totalEligibleWeight;
    const votingWeight = votes.approve + votes.reject;
    const approvalRate = votingWeight > 0 ? votes.approve / votingWeight : 0;

    const quorumMet = participationRate >= requiredQuorum;
    const thresholdMet = approvalRate >= requiredThreshold;

    return {
      requiredQuorum,
      requiredThreshold,
      quorumMet,
      thresholdMet,
      participationRate,
      approvalRate,
      adjustments: []
    };
  }

  recordParticipation(history: ParticipationHistory): void {
    this.participationHistory.push(history);
    const cutoff = Date.now() - this.config.lookbackPeriod;
    this.participationHistory = this.participationHistory.filter(h => h.timestamp > cutoff);
  }

  getAverageParticipation(): number {
    if (this.participationHistory.length === 0) return this.config.baseQuorum;
    const total = this.participationHistory.reduce(
      (sum, h) => sum + (h.actualVoters / h.eligibleVoters),
      0
    );
    return total / this.participationHistory.length;
  }

  getQuorumSuccessRate(): number {
    if (this.participationHistory.length === 0) return 1;
    const successful = this.participationHistory.filter(h => h.quorumAchieved).length;
    return successful / this.participationHistory.length;
  }

  private participationBasedQuorum(
    historicalParticipation: number,
    adjustments: QuorumAdjustment[]
  ): number {
    const target = historicalParticipation * 0.8;
    adjustments.push({
      factor: 'participation_based',
      originalValue: this.config.baseQuorum,
      adjustedValue: target,
      reason: 'Based on 80% of historical participation'
    });
    return target;
  }

  private adaptiveQuorum(
    context: QuorumContext,
    adjustments: QuorumAdjustment[]
  ): number {
    const avgParticipation = this.getAverageParticipation();
    const successRate = this.getQuorumSuccessRate();

    let quorum = this.config.baseQuorum;

    if (successRate < 0.7) {
      quorum = Math.max(avgParticipation * 0.7, this.config.minQuorum);
      adjustments.push({
        factor: 'low_success_rate',
        originalValue: this.config.baseQuorum,
        adjustedValue: quorum,
        reason: `Low quorum success rate (${(successRate * 100).toFixed(1)}%)`
      });
    } else if (successRate > 0.95) {
      quorum = Math.min(avgParticipation * 0.9, this.config.maxQuorum);
      adjustments.push({
        factor: 'high_success_rate',
        originalValue: this.config.baseQuorum,
        adjustedValue: quorum,
        reason: `High quorum success rate (${(successRate * 100).toFixed(1)}%)`
      });
    }

    return quorum;
  }

  private slidingQuorum(
    context: QuorumContext,
    adjustments: QuorumAdjustment[]
  ): number {
    const timeProgress = 1 - (context.timeRemaining / context.totalDuration);
    const slidingFactor = 1 - (timeProgress * 0.5);
    const quorum = this.config.baseQuorum * slidingFactor;

    adjustments.push({
      factor: 'time_sliding',
      originalValue: this.config.baseQuorum,
      adjustedValue: quorum,
      reason: `Time-based sliding: ${(timeProgress * 100).toFixed(0)}% elapsed`
    });

    return quorum;
  }

  private timeWeightedQuorum(
    context: QuorumContext,
    adjustments: QuorumAdjustment[]
  ): number {
    const recentHistory = this.participationHistory.slice(-10);
    if (recentHistory.length === 0) return this.config.baseQuorum;

    let weightedSum = 0;
    let weightSum = 0;
    const now = Date.now();

    for (let i = 0; i < recentHistory.length; i++) {
      const age = now - recentHistory[i].timestamp;
      const weight = 1 / (1 + age / (7 * 24 * 60 * 60 * 1000));
      weightedSum += (recentHistory[i].actualVoters / recentHistory[i].eligibleVoters) * weight;
      weightSum += weight;
    }

    const quorum = (weightedSum / weightSum) * 0.85;

    adjustments.push({
      factor: 'time_weighted',
      originalValue: this.config.baseQuorum,
      adjustedValue: quorum,
      reason: 'Weighted by recency of participation'
    });

    return quorum;
  }
}

export function calculateMinimumVoters(
  totalEligible: number,
  quorum: number,
  averageWeight: number
): number {
  const requiredWeight = totalEligible * quorum;
  return Math.ceil(requiredWeight / averageWeight);
}

export function estimateTimeToQuorum(
  currentParticipation: number,
  quorum: number,
  votesPerHour: number,
  eligibleVoters: number
): number {
  const remainingVoters = Math.ceil((quorum - currentParticipation) * eligibleVoters);
  if (votesPerHour <= 0) return Infinity;
  return remainingVoters / votesPerHour;
}

export default QuorumCalculator;
