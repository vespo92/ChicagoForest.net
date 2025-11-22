/**
 * Node Recruitment System
 *
 * DISCLAIMER: This is a THEORETICAL framework inspired by biological systems.
 * This code represents a conceptual design for recruiting new nodes into
 * a decentralized network and is NOT a working energy distribution system.
 *
 * AI-GENERATED CONTENT: Created as part of the Chicago Plasma Forest Network
 * theoretical framework - an educational project exploring decentralized energy.
 *
 * BIOLOGICAL INSPIRATION:
 * Based on recruitment mechanisms in biological networks:
 *
 * - Ant colony recruitment via pheromone trails
 *   Camazine et al., "Self-Organization in Biological Systems"
 *   Princeton University Press, 2001
 *   ISBN: 978-0691116242
 *
 * - Bee waggle dance for resource communication
 *   von Frisch, "The Dance Language and Orientation of Bees"
 *   Harvard University Press, 1967
 *
 * - Mycelium network invitation of host plants
 *   van der Heijden et al., "Mycorrhizal ecology and evolution"
 *   New Phytologist 205(4):1406-1423, 2015
 *   DOI: 10.1111/nph.13288
 */

import { EventEmitter } from 'events';

// ============================================================================
// THEORETICAL FRAMEWORK - NOT OPERATIONAL
// ============================================================================

/**
 * Recruitment Strategies - Inspired by social insects
 *
 * THEORETICAL: Different approaches to bringing new nodes into the network
 */
export enum RecruitmentStrategy {
  /** Active outreach - like ant scouts */
  ACTIVE_SCOUT = 'ACTIVE_SCOUT',

  /** Passive attraction - like flower scent */
  PASSIVE_ATTRACTION = 'PASSIVE_ATTRACTION',

  /** Referral-based - like bee waggle dance */
  REFERRAL = 'REFERRAL',

  /** Incentive-based - like mycorrhizal nutrient exchange */
  INCENTIVE = 'INCENTIVE',

  /** Emergency recruitment - mass mobilization */
  EMERGENCY = 'EMERGENCY'
}

/**
 * Candidate Node Profile
 *
 * THEORETICAL: Information about potential network members
 */
export interface CandidateProfile {
  /** Candidate identifier */
  candidateId: string;

  /** Geographic location */
  location: {
    latitude: number;
    longitude: number;
    region: string;
  };

  /** Candidate type */
  type: 'residential' | 'commercial' | 'industrial' | 'community' | 'infrastructure';

  /** Estimated capacity contribution */
  estimatedCapacity: number;

  /** Estimated demand */
  estimatedDemand: number;

  /** Network value score (0-100) */
  networkValue: number;

  /** Recruitment difficulty (0-100) */
  recruitmentDifficulty: number;

  /** Discovery method */
  discoveryMethod: RecruitmentStrategy;

  /** Referrer node (if applicable) */
  referrerNodeId?: string;

  /** First contact timestamp */
  firstContact: Date;

  /** Last interaction timestamp */
  lastInteraction: Date;

  /** Current recruitment phase */
  phase: RecruitmentPhase;
}

/**
 * Recruitment Phases
 *
 * THEORETICAL: Stages of bringing a node into the network
 */
export enum RecruitmentPhase {
  /** Just discovered */
  DISCOVERED = 'DISCOVERED',

  /** Initial contact made */
  CONTACTED = 'CONTACTED',

  /** In discussion/negotiation */
  EVALUATING = 'EVALUATING',

  /** Terms agreed, awaiting integration */
  COMMITTED = 'COMMITTED',

  /** Successfully integrated */
  INTEGRATED = 'INTEGRATED',

  /** Declined to join */
  DECLINED = 'DECLINED',

  /** Lost contact */
  LOST = 'LOST'
}

/**
 * Pheromone Trail
 *
 * THEORETICAL: Like ant pheromones, signals that indicate
 * valuable recruitment paths.
 *
 * Reference: Camazine et al., "Self-Organization in Biological Systems"
 */
export interface PheromoneTrail {
  /** Trail identifier */
  trailId: string;

  /** Trail type */
  type: 'recruitment' | 'resource' | 'warning';

  /** Path nodes */
  path: string[];

  /** Signal strength (decays over time) */
  strength: number;

  /** Deposit time */
  depositedAt: Date;

  /** Decay rate per hour */
  decayRate: number;
}

/**
 * Waggle Dance Message
 *
 * THEORETICAL: Like bee waggle dances, communicating location
 * and value of recruitment opportunities.
 *
 * Reference: von Frisch, "The Dance Language"
 */
export interface WaggleDanceMessage {
  /** Message identifier */
  messageId: string;

  /** Sender node */
  senderNodeId: string;

  /** Direction to opportunity (degrees from reference) */
  direction: number;

  /** Distance to opportunity */
  distance: number;

  /** Quality assessment (dance duration analog) */
  quality: number;

  /** Opportunity type */
  opportunityType: 'candidate' | 'resource' | 'strategic';

  /** Target candidate (if applicable) */
  candidateId?: string;

  /** Broadcast time */
  broadcastAt: Date;
}

/**
 * Recruitment Incentive
 *
 * THEORETICAL: Like mycorrhizal nutrient exchange, benefits
 * offered to encourage participation.
 */
export interface RecruitmentIncentive {
  /** Incentive identifier */
  incentiveId: string;

  /** Target candidate */
  candidateId: string;

  /** Incentive type */
  type: 'capacity_bonus' | 'priority_access' | 'reduced_cost' | 'network_credit';

  /** Incentive value */
  value: number;

  /** Duration (if time-limited) */
  duration?: number;

  /** Requirements to receive */
  requirements: string[];

  /** Valid until */
  validUntil: Date;
}

/**
 * Node Recruitment Manager
 *
 * THEORETICAL FRAMEWORK: Manages the recruitment of new nodes into
 * the network using strategies inspired by social insects and fungi.
 */
export class NodeRecruitmentManager extends EventEmitter {
  private nodeId: string;
  private strategy: RecruitmentStrategy = RecruitmentStrategy.PASSIVE_ATTRACTION;
  private candidates: Map<string, CandidateProfile> = new Map();
  private pheromoneTrails: Map<string, PheromoneTrail> = new Map();
  private waggleDances: WaggleDanceMessage[] = [];
  private activeIncentives: Map<string, RecruitmentIncentive> = new Map();
  private recruitmentMetrics: {
    totalDiscovered: number;
    totalContacted: number;
    totalIntegrated: number;
    totalDeclined: number;
  } = {
    totalDiscovered: 0,
    totalContacted: 0,
    totalIntegrated: 0,
    totalDeclined: 0
  };

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;
  }

  /**
   * Set recruitment strategy
   */
  setStrategy(strategy: RecruitmentStrategy): void {
    const oldStrategy = this.strategy;
    this.strategy = strategy;

    this.emit('strategyChanged', { oldStrategy, newStrategy: strategy });
  }

  /**
   * Discover a potential candidate
   *
   * THEORETICAL: Like an ant scout finding a food source
   */
  discoverCandidate(
    location: { latitude: number; longitude: number; region: string },
    type: CandidateProfile['type'],
    estimatedCapacity: number,
    estimatedDemand: number
  ): CandidateProfile {
    console.log(`[THEORETICAL] Discovered potential candidate in ${location.region}...`);

    const networkValue = this.calculateNetworkValue(location, estimatedCapacity, estimatedDemand);
    const recruitmentDifficulty = this.estimateRecruitmentDifficulty(type);

    const candidate: CandidateProfile = {
      candidateId: `candidate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      location,
      type,
      estimatedCapacity,
      estimatedDemand,
      networkValue,
      recruitmentDifficulty,
      discoveryMethod: this.strategy,
      firstContact: new Date(),
      lastInteraction: new Date(),
      phase: RecruitmentPhase.DISCOVERED
    };

    this.candidates.set(candidate.candidateId, candidate);
    this.recruitmentMetrics.totalDiscovered++;

    // Deposit pheromone trail
    this.depositPheromone(candidate.candidateId, networkValue / 100);

    this.emit('candidateDiscovered', { candidate });

    return candidate;
  }

  /**
   * Calculate network value of adding a candidate
   *
   * THEORETICAL: Assesses strategic value of a new node
   */
  private calculateNetworkValue(
    location: { latitude: number; longitude: number },
    capacity: number,
    demand: number
  ): number {
    // Value factors:
    // 1. Capacity contribution (40%)
    // 2. Strategic location (30%)
    // 3. Demand balancing (30%)

    const capacityScore = Math.min(100, capacity / 10);

    // Location value - simulated based on distance from network center
    const distanceFromCenter = Math.sqrt(
      Math.pow(location.latitude - 41.8781, 2) +
      Math.pow(location.longitude + 87.6298, 2)
    );
    const locationScore = Math.max(0, 100 - distanceFromCenter * 100);

    // Demand balance - prefer nodes that improve supply/demand ratio
    const demandScore = demand > capacity ? 30 : 70;

    return capacityScore * 0.4 + locationScore * 0.3 + demandScore * 0.3;
  }

  /**
   * Estimate recruitment difficulty
   */
  private estimateRecruitmentDifficulty(type: CandidateProfile['type']): number {
    const difficultyByType: Record<string, number> = {
      residential: 40,
      community: 30,
      commercial: 60,
      industrial: 70,
      infrastructure: 80
    };

    return difficultyByType[type] || 50;
  }

  /**
   * Deposit a pheromone trail
   *
   * THEORETICAL: Like ants marking a path to food
   */
  depositPheromone(targetId: string, strength: number): PheromoneTrail {
    const trail: PheromoneTrail = {
      trailId: `trail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'recruitment',
      path: [this.nodeId, targetId],
      strength: Math.min(1.0, strength),
      depositedAt: new Date(),
      decayRate: 0.1 // 10% decay per hour
    };

    this.pheromoneTrails.set(trail.trailId, trail);
    this.emit('pheromoneDeposited', { trail });

    return trail;
  }

  /**
   * Update pheromone strengths (decay and reinforcement)
   *
   * THEORETICAL: Pheromones naturally evaporate, requiring reinforcement
   */
  updatePheromones(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [trailId, trail] of this.pheromoneTrails.entries()) {
      // Calculate hours since deposit
      const hoursElapsed = (now - trail.depositedAt.getTime()) / (60 * 60 * 1000);

      // Apply decay
      trail.strength *= Math.pow(1 - trail.decayRate, hoursElapsed);

      // Remove if too weak
      if (trail.strength < 0.01) {
        toRemove.push(trailId);
      }
    }

    for (const trailId of toRemove) {
      this.pheromoneTrails.delete(trailId);
      this.emit('pheromoneEvaporated', { trailId });
    }
  }

  /**
   * Perform waggle dance to communicate opportunity
   *
   * THEORETICAL: Like a bee's waggle dance, sharing information
   * about valuable recruitment opportunities with the network.
   */
  waggleDance(
    candidateId: string,
    direction: number,
    distance: number
  ): WaggleDanceMessage {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    console.log(`[THEORETICAL] Performing waggle dance for candidate ${candidateId}...`);

    const message: WaggleDanceMessage = {
      messageId: `dance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderNodeId: this.nodeId,
      direction,
      distance,
      quality: candidate.networkValue / 100,
      opportunityType: 'candidate',
      candidateId,
      broadcastAt: new Date()
    };

    this.waggleDances.push(message);
    this.emit('waggleDanceBroadcast', { message });

    return message;
  }

  /**
   * Receive and interpret a waggle dance
   *
   * THEORETICAL: Decode the information from another node's dance
   */
  receiveWaggleDance(message: WaggleDanceMessage): void {
    console.log(`[THEORETICAL] Received waggle dance from ${message.senderNodeId}...`);

    // Decide whether to follow this lead based on quality
    if (message.quality > 0.6) {
      this.emit('waggleDanceReceived', {
        message,
        action: 'investigate',
        priority: message.quality
      });
    } else {
      this.emit('waggleDanceReceived', {
        message,
        action: 'ignore',
        reason: 'low_quality'
      });
    }
  }

  /**
   * Initiate contact with a candidate
   *
   * THEORETICAL: First formal communication with potential node
   */
  async initiateContact(candidateId: string): Promise<boolean> {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) {
      console.warn('[THEORETICAL] Candidate not found');
      return false;
    }

    console.log(`[THEORETICAL] Initiating contact with ${candidateId}...`);

    candidate.phase = RecruitmentPhase.CONTACTED;
    candidate.lastInteraction = new Date();
    this.recruitmentMetrics.totalContacted++;

    this.emit('contactInitiated', { candidateId });

    return true;
  }

  /**
   * Create an incentive offer
   *
   * THEORETICAL: Like mycorrhizal networks offering nutrients
   * to potential host plants.
   */
  createIncentive(
    candidateId: string,
    type: RecruitmentIncentive['type'],
    value: number,
    requirements: string[],
    validDays: number = 30
  ): RecruitmentIncentive {
    console.log(`[THEORETICAL] Creating ${type} incentive for ${candidateId}...`);

    const incentive: RecruitmentIncentive = {
      incentiveId: `incentive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      candidateId,
      type,
      value,
      requirements,
      validUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000)
    };

    this.activeIncentives.set(incentive.incentiveId, incentive);

    // Update candidate phase
    const candidate = this.candidates.get(candidateId);
    if (candidate) {
      candidate.phase = RecruitmentPhase.EVALUATING;
      candidate.lastInteraction = new Date();
    }

    this.emit('incentiveCreated', { incentive });

    return incentive;
  }

  /**
   * Process candidate commitment
   *
   * THEORETICAL: Candidate agrees to join
   */
  processCommitment(candidateId: string): boolean {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) {
      return false;
    }

    console.log(`[THEORETICAL] Processing commitment from ${candidateId}...`);

    candidate.phase = RecruitmentPhase.COMMITTED;
    candidate.lastInteraction = new Date();

    // Reinforce pheromone trail
    this.depositPheromone(candidateId, 1.0);

    this.emit('commitmentReceived', { candidateId });

    return true;
  }

  /**
   * Complete integration of new node
   *
   * THEORETICAL: Finalize adding node to network
   */
  completeIntegration(candidateId: string): boolean {
    const candidate = this.candidates.get(candidateId);
    if (!candidate || candidate.phase !== RecruitmentPhase.COMMITTED) {
      return false;
    }

    console.log(`[THEORETICAL] Completing integration of ${candidateId}...`);

    candidate.phase = RecruitmentPhase.INTEGRATED;
    candidate.lastInteraction = new Date();
    this.recruitmentMetrics.totalIntegrated++;

    // Clean up incentives
    for (const [incentiveId, incentive] of this.activeIncentives.entries()) {
      if (incentive.candidateId === candidateId) {
        this.activeIncentives.delete(incentiveId);
      }
    }

    this.emit('integrationComplete', {
      candidateId,
      nodeId: `node-${candidateId}`, // New node ID
      metrics: this.recruitmentMetrics
    });

    return true;
  }

  /**
   * Handle candidate decline
   *
   * THEORETICAL: Process refusal to join
   */
  handleDecline(candidateId: string, reason?: string): void {
    const candidate = this.candidates.get(candidateId);
    if (!candidate) return;

    console.log(`[THEORETICAL] Candidate ${candidateId} declined: ${reason || 'no reason given'}`);

    candidate.phase = RecruitmentPhase.DECLINED;
    candidate.lastInteraction = new Date();
    this.recruitmentMetrics.totalDeclined++;

    // Weaken pheromone trail
    for (const [, trail] of this.pheromoneTrails.entries()) {
      if (trail.path.includes(candidateId)) {
        trail.strength *= 0.5;
      }
    }

    this.emit('candidateDeclined', { candidateId, reason });
  }

  /**
   * Get recruitment funnel metrics
   */
  getFunnelMetrics(): {
    discovered: number;
    contacted: number;
    evaluating: number;
    committed: number;
    integrated: number;
    declined: number;
    conversionRate: number;
  } {
    let discovered = 0, contacted = 0, evaluating = 0, committed = 0, integrated = 0, declined = 0;

    for (const candidate of this.candidates.values()) {
      switch (candidate.phase) {
        case RecruitmentPhase.DISCOVERED: discovered++; break;
        case RecruitmentPhase.CONTACTED: contacted++; break;
        case RecruitmentPhase.EVALUATING: evaluating++; break;
        case RecruitmentPhase.COMMITTED: committed++; break;
        case RecruitmentPhase.INTEGRATED: integrated++; break;
        case RecruitmentPhase.DECLINED: declined++; break;
      }
    }

    const conversionRate = this.recruitmentMetrics.totalDiscovered > 0
      ? this.recruitmentMetrics.totalIntegrated / this.recruitmentMetrics.totalDiscovered
      : 0;

    return { discovered, contacted, evaluating, committed, integrated, declined, conversionRate };
  }

  /**
   * Get strongest pheromone trails
   */
  getStrongestTrails(limit: number = 10): PheromoneTrail[] {
    return Array.from(this.pheromoneTrails.values())
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }

  /**
   * Get candidates by phase
   */
  getCandidatesByPhase(phase: RecruitmentPhase): CandidateProfile[] {
    return Array.from(this.candidates.values()).filter(c => c.phase === phase);
  }
}

// ============================================================================
// RECRUITMENT ALGORITHMS
// ============================================================================

/**
 * Ant Colony Recruitment Algorithm
 *
 * THEORETICAL: Uses pheromone-based pathfinding to identify
 * optimal recruitment targets.
 */
export function antColonyRecruitment(
  trails: PheromoneTrail[],
  explorationRate: number = 0.1
): string[] {
  console.log('[THEORETICAL] Running ant colony recruitment algorithm...');

  const recommendations: string[] = [];

  // Calculate selection probabilities based on pheromone strength
  const totalStrength = trails.reduce((sum, t) => sum + t.strength, 0);

  for (const trail of trails) {
    // Probability = strength / total (or explore randomly)
    const selectionProbability = totalStrength > 0
      ? trail.strength / totalStrength
      : 1 / trails.length;

    // Add exploration randomness
    const adjustedProbability = (1 - explorationRate) * selectionProbability +
      explorationRate * (1 / trails.length);

    if (Math.random() < adjustedProbability) {
      const targetId = trail.path[trail.path.length - 1];
      if (!recommendations.includes(targetId)) {
        recommendations.push(targetId);
      }
    }
  }

  return recommendations;
}

// ============================================================================
// DISCLAIMER
// ============================================================================
/*
 * IMPORTANT NOTICE:
 *
 * This code is part of a THEORETICAL FRAMEWORK exploring concepts for
 * node recruitment in decentralized networks.
 *
 * It is NOT:
 * - A working recruitment system
 * - A proven technology
 * - Ready for production deployment
 * - An actual marketing or outreach tool
 *
 * It IS:
 * - An educational exploration of bio-inspired algorithms
 * - Based on real biological research on social insects
 * - A conceptual framework for community discussion
 *
 * For actual community building and network growth, please consult
 * established practices in community organizing and network development.
 */
