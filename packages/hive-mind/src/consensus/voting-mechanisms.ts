/**
 * Voting Mechanisms - Multiple voting system implementations
 *
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational purposes.
 * Inspired by quadratic voting, conviction voting, and ranked choice systems.
 * This code is NOT operational.
 */

import type { NodeId } from '@chicago-forest/shared-types';

export enum VotingMechanism {
  SIMPLE_MAJORITY = 'simple_majority',
  SUPERMAJORITY = 'supermajority',
  QUADRATIC = 'quadratic',
  CONVICTION = 'conviction',
  RANKED_CHOICE = 'ranked_choice',
  APPROVAL = 'approval',
  LAZY_CONSENSUS = 'lazy_consensus',
  CONSENT = 'consent'
}

export interface VoteInput {
  voter: NodeId;
  weight: number;
  choice: string | string[];
  conviction?: number;
  timestamp: number;
}

export interface VotingResult {
  mechanism: VotingMechanism;
  winner?: string;
  passed: boolean;
  results: Map<string, number>;
  participation: number;
  quorumMet: boolean;
  details: VotingDetails;
}

export interface VotingDetails {
  totalVotes: number;
  totalWeight: number;
  threshold: number;
  quorum: number;
  breakdown: Record<string, { count: number; weight: number }>;
}

export interface ConvictionState {
  voterId: NodeId;
  choice: string;
  startTime: number;
  currentConviction: number;
  maxConviction: number;
}

export interface RankedChoiceRound {
  round: number;
  counts: Map<string, number>;
  eliminated?: string;
  winner?: string;
}

export class VotingMechanisms {
  private readonly CONVICTION_DECAY = 0.5;
  private readonly CONVICTION_MAX = 6;

  simpleMajority(
    votes: VoteInput[],
    choices: string[],
    quorum: number,
    totalEligible: number
  ): VotingResult {
    const results = new Map<string, number>();
    for (const choice of choices) results.set(choice, 0);

    let totalWeight = 0;
    for (const vote of votes) {
      const choice = vote.choice as string;
      if (results.has(choice)) {
        results.set(choice, (results.get(choice) || 0) + vote.weight);
        totalWeight += vote.weight;
      }
    }

    const participation = totalWeight / totalEligible;
    const quorumMet = participation >= quorum;

    let winner: string | undefined;
    let maxWeight = 0;
    for (const [choice, weight] of results.entries()) {
      if (weight > maxWeight) {
        maxWeight = weight;
        winner = choice;
      }
    }

    const passed = quorumMet && maxWeight > totalWeight / 2;

    return {
      mechanism: VotingMechanism.SIMPLE_MAJORITY,
      winner,
      passed,
      results,
      participation,
      quorumMet,
      details: this.buildDetails(votes, choices, 0.5, quorum)
    };
  }

  supermajority(
    votes: VoteInput[],
    choices: string[],
    threshold: number,
    quorum: number,
    totalEligible: number
  ): VotingResult {
    const results = new Map<string, number>();
    for (const choice of choices) results.set(choice, 0);

    let totalWeight = 0;
    for (const vote of votes) {
      const choice = vote.choice as string;
      if (results.has(choice)) {
        results.set(choice, (results.get(choice) || 0) + vote.weight);
        totalWeight += vote.weight;
      }
    }

    const participation = totalWeight / totalEligible;
    const quorumMet = participation >= quorum;

    let winner: string | undefined;
    let maxWeight = 0;
    for (const [choice, weight] of results.entries()) {
      if (weight > maxWeight) {
        maxWeight = weight;
        winner = choice;
      }
    }

    const passed = quorumMet && maxWeight / totalWeight >= threshold;

    return {
      mechanism: VotingMechanism.SUPERMAJORITY,
      winner,
      passed,
      results,
      participation,
      quorumMet,
      details: this.buildDetails(votes, choices, threshold, quorum)
    };
  }

  quadratic(
    votes: VoteInput[],
    choices: string[],
    quorum: number,
    totalEligible: number
  ): VotingResult {
    const results = new Map<string, number>();
    for (const choice of choices) results.set(choice, 0);

    let totalWeight = 0;
    for (const vote of votes) {
      const choice = vote.choice as string;
      if (results.has(choice)) {
        const quadraticWeight = Math.sqrt(vote.weight);
        results.set(choice, (results.get(choice) || 0) + quadraticWeight);
        totalWeight += quadraticWeight;
      }
    }

    const participation = votes.length / totalEligible;
    const quorumMet = participation >= quorum;

    let winner: string | undefined;
    let maxWeight = 0;
    for (const [choice, weight] of results.entries()) {
      if (weight > maxWeight) {
        maxWeight = weight;
        winner = choice;
      }
    }

    const passed = quorumMet && maxWeight > totalWeight / 2;

    return {
      mechanism: VotingMechanism.QUADRATIC,
      winner,
      passed,
      results,
      participation,
      quorumMet,
      details: this.buildDetails(votes, choices, 0.5, quorum)
    };
  }

  conviction(
    convictionStates: ConvictionState[],
    threshold: number,
    availableFunding: number
  ): VotingResult {
    const results = new Map<string, number>();

    for (const state of convictionStates) {
      const current = results.get(state.choice) || 0;
      results.set(state.choice, current + state.currentConviction);
    }

    let winner: string | undefined;
    let maxConviction = 0;
    for (const [choice, conviction] of results.entries()) {
      if (conviction > maxConviction) {
        maxConviction = conviction;
        winner = choice;
      }
    }

    const requiredConviction = threshold * availableFunding;
    const passed = maxConviction >= requiredConviction;

    return {
      mechanism: VotingMechanism.CONVICTION,
      winner,
      passed,
      results,
      participation: convictionStates.length,
      quorumMet: true,
      details: {
        totalVotes: convictionStates.length,
        totalWeight: maxConviction,
        threshold,
        quorum: 0,
        breakdown: {}
      }
    };
  }

  calculateConviction(state: ConvictionState, currentTime: number): number {
    const elapsedDays = (currentTime - state.startTime) / (24 * 60 * 60 * 1000);
    const conviction = state.maxConviction * (1 - Math.pow(this.CONVICTION_DECAY, elapsedDays));
    return Math.min(conviction, this.CONVICTION_MAX);
  }

  rankedChoice(
    votes: VoteInput[],
    choices: string[],
    quorum: number,
    totalEligible: number
  ): VotingResult {
    const rounds: RankedChoiceRound[] = [];
    let remainingChoices = [...choices];
    const rankings = votes.map(v => ({ voter: v.voter, ranking: v.choice as string[], weight: v.weight }));

    const participation = votes.length / totalEligible;
    const quorumMet = participation >= quorum;

    let winner: string | undefined;
    let round = 0;

    while (!winner && remainingChoices.length > 1) {
      round++;
      const counts = new Map<string, number>();
      for (const choice of remainingChoices) counts.set(choice, 0);

      for (const ranking of rankings) {
        const topChoice = ranking.ranking.find(c => remainingChoices.includes(c));
        if (topChoice) {
          counts.set(topChoice, (counts.get(topChoice) || 0) + ranking.weight);
        }
      }

      const totalWeight = Array.from(counts.values()).reduce((a, b) => a + b, 0);
      const majorityThreshold = totalWeight / 2;

      for (const [choice, weight] of counts.entries()) {
        if (weight > majorityThreshold) {
          winner = choice;
          rounds.push({ round, counts, winner });
          break;
        }
      }

      if (!winner) {
        let minWeight = Infinity;
        let eliminated: string | undefined;
        for (const [choice, weight] of counts.entries()) {
          if (weight < minWeight) {
            minWeight = weight;
            eliminated = choice;
          }
        }

        if (eliminated) {
          remainingChoices = remainingChoices.filter(c => c !== eliminated);
          rounds.push({ round, counts, eliminated });
        }
      }
    }

    if (!winner && remainingChoices.length === 1) {
      winner = remainingChoices[0];
    }

    const finalResults = new Map<string, number>();
    for (const choice of choices) finalResults.set(choice, 0);
    if (rounds.length > 0) {
      const lastRound = rounds[rounds.length - 1];
      for (const [choice, count] of lastRound.counts.entries()) {
        finalResults.set(choice, count);
      }
    }

    return {
      mechanism: VotingMechanism.RANKED_CHOICE,
      winner,
      passed: quorumMet && !!winner,
      results: finalResults,
      participation,
      quorumMet,
      details: this.buildDetails(votes, choices, 0.5, quorum)
    };
  }

  approval(
    votes: VoteInput[],
    choices: string[],
    quorum: number,
    totalEligible: number
  ): VotingResult {
    const results = new Map<string, number>();
    for (const choice of choices) results.set(choice, 0);

    for (const vote of votes) {
      const approved = vote.choice as string[];
      for (const choice of approved) {
        if (results.has(choice)) {
          results.set(choice, (results.get(choice) || 0) + vote.weight);
        }
      }
    }

    const participation = votes.length / totalEligible;
    const quorumMet = participation >= quorum;

    let winner: string | undefined;
    let maxApprovals = 0;
    for (const [choice, approvals] of results.entries()) {
      if (approvals > maxApprovals) {
        maxApprovals = approvals;
        winner = choice;
      }
    }

    return {
      mechanism: VotingMechanism.APPROVAL,
      winner,
      passed: quorumMet && !!winner,
      results,
      participation,
      quorumMet,
      details: this.buildDetails(votes, choices, 0, quorum)
    };
  }

  lazyConsensus(
    votes: VoteInput[],
    objectionPeriod: number,
    startTime: number
  ): VotingResult {
    const now = Date.now();
    const periodEnded = now > startTime + objectionPeriod;

    const objections = votes.filter(v => v.choice === 'object');
    const passed = periodEnded && objections.length === 0;

    const results = new Map<string, number>();
    results.set('approve', votes.filter(v => v.choice === 'approve').length);
    results.set('object', objections.length);

    return {
      mechanism: VotingMechanism.LAZY_CONSENSUS,
      winner: passed ? 'approve' : 'object',
      passed,
      results,
      participation: votes.length,
      quorumMet: true,
      details: {
        totalVotes: votes.length,
        totalWeight: votes.reduce((sum, v) => sum + v.weight, 0),
        threshold: 0,
        quorum: 0,
        breakdown: {}
      }
    };
  }

  consent(
    votes: VoteInput[],
    quorum: number,
    totalEligible: number
  ): VotingResult {
    const objections = votes.filter(v => v.choice === 'object');
    const consents = votes.filter(v => v.choice === 'consent');

    const participation = votes.length / totalEligible;
    const quorumMet = participation >= quorum;
    const passed = quorumMet && objections.length === 0;

    const results = new Map<string, number>();
    results.set('consent', consents.length);
    results.set('object', objections.length);

    return {
      mechanism: VotingMechanism.CONSENT,
      winner: passed ? 'consent' : 'object',
      passed,
      results,
      participation,
      quorumMet,
      details: this.buildDetails(votes, ['consent', 'object'], 1, quorum)
    };
  }

  private buildDetails(
    votes: VoteInput[],
    choices: string[],
    threshold: number,
    quorum: number
  ): VotingDetails {
    const breakdown: Record<string, { count: number; weight: number }> = {};
    for (const choice of choices) {
      breakdown[choice] = { count: 0, weight: 0 };
    }

    for (const vote of votes) {
      const choice = Array.isArray(vote.choice) ? vote.choice[0] : vote.choice;
      if (breakdown[choice]) {
        breakdown[choice].count++;
        breakdown[choice].weight += vote.weight;
      }
    }

    return {
      totalVotes: votes.length,
      totalWeight: votes.reduce((sum, v) => sum + v.weight, 0),
      threshold,
      quorum,
      breakdown
    };
  }
}

export default VotingMechanisms;
