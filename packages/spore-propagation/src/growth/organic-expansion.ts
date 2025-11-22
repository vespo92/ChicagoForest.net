/**
 * Organic Network Expansion System
 *
 * DISCLAIMER: This is a THEORETICAL framework inspired by biological systems.
 * This code represents a conceptual design for network growth and is NOT
 * a working energy distribution system.
 *
 * AI-GENERATED CONTENT: Created as part of the Chicago Plasma Forest Network
 * theoretical framework - an educational project exploring decentralized energy.
 *
 * BIOLOGICAL INSPIRATION:
 * Based on the remarkable network optimization abilities of Physarum polycephalum:
 * - Tero et al., "Rules for Biologically Inspired Adaptive Network Design"
 *   Science 327(5964):439-442, 2010
 *   DOI: 10.1126/science.1177894
 *
 * The slime mold famously recreated the Tokyo rail network when food sources
 * were placed at station locations, demonstrating optimal network design
 * through simple biological rules.
 *
 * Also inspired by:
 * - Mycelium network growth patterns
 *   Boddy et al., "Saprotrophic cord systems: dispersal mechanisms in space and time"
 *   Mycoscience 50:9-19, 2009
 *   DOI: 10.1007/s10267-008-0450-4
 */

import { EventEmitter } from 'events';

// ============================================================================
// THEORETICAL FRAMEWORK - NOT OPERATIONAL
// ============================================================================

/**
 * Growth Modes - Inspired by Physarum's behavioral states
 *
 * THEORETICAL: Different expansion strategies based on conditions
 */
export enum GrowthMode {
  /** Rapid exploration in all directions */
  EXPLORATORY = 'EXPLORATORY',

  /** Focused growth toward specific targets */
  DIRECTED = 'DIRECTED',

  /** Balanced growth maintaining efficiency */
  BALANCED = 'BALANCED',

  /** Conservative growth, consolidating connections */
  CONSERVATIVE = 'CONSERVATIVE',

  /** Emergency expansion to fill critical gaps */
  EMERGENCY = 'EMERGENCY',

  /** Dormant - no active growth */
  DORMANT = 'DORMANT'
}

/**
 * Growth Vector
 *
 * THEORETICAL: Direction and magnitude of expansion
 */
export interface GrowthVector {
  /** Direction angle (degrees, 0 = east, counterclockwise) */
  direction: number;

  /** Growth magnitude (0-1) */
  magnitude: number;

  /** Target attraction (if any) */
  targetAttraction?: {
    nodeId: string;
    strength: number;
  };

  /** Reason for this vector */
  reason: 'exploration' | 'attraction' | 'repulsion' | 'gradient';
}

/**
 * Environmental Gradient
 *
 * THEORETICAL: Represents resource or demand gradients in the network,
 * similar to chemical gradients that guide slime mold growth.
 */
export interface EnvironmentalGradient {
  /** Gradient type */
  type: 'demand' | 'supply' | 'population' | 'infrastructure';

  /** Source location */
  source: { latitude: number; longitude: number };

  /** Gradient direction (degrees) */
  direction: number;

  /** Gradient strength */
  strength: number;

  /** Detection confidence (0-1) */
  confidence: number;
}

/**
 * Network Tendril
 *
 * THEORETICAL: A growing extension of the network, analogous to
 * a Physarum pseudopod or mycelium hypha.
 */
export interface NetworkTendril {
  /** Unique tendril identifier */
  tendrilId: string;

  /** Origin node */
  originNodeId: string;

  /** Current tip location */
  tipLocation: { latitude: number; longitude: number };

  /** Growth vector */
  vector: GrowthVector;

  /** Energy invested */
  energyInvested: number;

  /** Length (in abstract units) */
  length: number;

  /** Age (milliseconds since creation) */
  age: number;

  /** Active state */
  active: boolean;

  /** Nodes encountered */
  nodesEncountered: string[];
}

/**
 * Expansion Opportunity
 *
 * THEORETICAL: A detected opportunity for network growth
 */
export interface ExpansionOpportunity {
  /** Opportunity identifier */
  opportunityId: string;

  /** Location of opportunity */
  location: { latitude: number; longitude: number };

  /** Type of opportunity */
  type: 'coverage_gap' | 'demand_center' | 'resource_source' | 'strategic_position';

  /** Estimated value (0-100) */
  value: number;

  /** Estimated cost to reach */
  cost: number;

  /** Time sensitivity (higher = more urgent) */
  urgency: number;

  /** Detection timestamp */
  detectedAt: Date;

  /** Expiration timestamp */
  expiresAt: Date;
}

/**
 * Organic Expansion Manager
 *
 * THEORETICAL FRAMEWORK: Manages the organic growth of the network
 * using algorithms inspired by Physarum polycephalum and mycelium networks.
 */
export class OrganicExpansionManager extends EventEmitter {
  private nodeId: string;
  private mode: GrowthMode = GrowthMode.BALANCED;
  private activeTendrils: Map<string, NetworkTendril> = new Map();
  private detectedGradients: EnvironmentalGradient[] = [];
  private opportunities: Map<string, ExpansionOpportunity> = new Map();
  private expansionHistory: Array<{
    tendrilId: string;
    success: boolean;
    nodesCreated: number;
    timestamp: Date;
  }> = [];

  // Growth parameters inspired by biological systems
  private readonly params = {
    /** Maximum active tendrils */
    maxTendrils: 10,

    /** Energy per tendril step */
    stepEnergy: 0.1,

    /** Maximum tendril length before pruning */
    maxTendrilLength: 100,

    /** Tendril timeout (ms) */
    tendrilTimeout: 300000, // 5 minutes

    /** Exploration randomness (0-1) */
    explorationBias: 0.3,

    /** Gradient following strength */
    gradientWeight: 0.6,

    /** Minimum success rate before mode change */
    minSuccessRate: 0.3
  };

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;
  }

  /**
   * Set the current growth mode
   */
  setMode(mode: GrowthMode): void {
    const oldMode = this.mode;
    this.mode = mode;

    this.emit('modeChanged', { oldMode, newMode: mode });

    // Adjust parameters based on mode
    this.adjustParametersForMode(mode);
  }

  /**
   * Adjust growth parameters based on mode
   */
  private adjustParametersForMode(mode: GrowthMode): void {
    switch (mode) {
      case GrowthMode.EXPLORATORY:
        this.params.explorationBias = 0.7;
        this.params.gradientWeight = 0.3;
        this.params.maxTendrils = 20;
        break;
      case GrowthMode.DIRECTED:
        this.params.explorationBias = 0.1;
        this.params.gradientWeight = 0.9;
        this.params.maxTendrils = 5;
        break;
      case GrowthMode.BALANCED:
        this.params.explorationBias = 0.3;
        this.params.gradientWeight = 0.6;
        this.params.maxTendrils = 10;
        break;
      case GrowthMode.CONSERVATIVE:
        this.params.explorationBias = 0.1;
        this.params.gradientWeight = 0.5;
        this.params.maxTendrils = 3;
        break;
      case GrowthMode.EMERGENCY:
        this.params.explorationBias = 0.5;
        this.params.gradientWeight = 0.8;
        this.params.maxTendrils = 30;
        break;
    }
  }

  /**
   * Sense the environment for gradients
   *
   * THEORETICAL: Like Physarum's chemotaxis, sensing chemical gradients
   * to guide growth toward resources.
   *
   * Reference: Tero et al., Science 2010
   */
  async senseEnvironment(): Promise<EnvironmentalGradient[]> {
    console.log('[THEORETICAL] Sensing environmental gradients...');

    // Clear old gradients
    this.detectedGradients = [];

    // Simulated gradient detection
    // In reality, this would query network demand/supply data

    // Detect demand gradient (simulated)
    this.detectedGradients.push({
      type: 'demand',
      source: { latitude: 41.9, longitude: -87.65 }, // North Chicago
      direction: 0,
      strength: 0.7,
      confidence: 0.8
    });

    // Detect population gradient (simulated)
    this.detectedGradients.push({
      type: 'population',
      source: { latitude: 41.85, longitude: -87.7 }, // West Chicago
      direction: 270,
      strength: 0.5,
      confidence: 0.6
    });

    this.emit('gradientsSensed', { gradients: this.detectedGradients });

    return this.detectedGradients;
  }

  /**
   * Spawn a new growth tendril
   *
   * THEORETICAL: Like a Physarum pseudopod extending to explore
   */
  spawnTendril(
    originLocation: { latitude: number; longitude: number },
    initialVector?: Partial<GrowthVector>
  ): NetworkTendril | null {
    if (this.mode === GrowthMode.DORMANT) {
      console.log('[THEORETICAL] Cannot spawn tendril in DORMANT mode');
      return null;
    }

    if (this.activeTendrils.size >= this.params.maxTendrils) {
      console.log('[THEORETICAL] Maximum tendrils reached');
      return null;
    }

    // Calculate initial vector if not provided
    const vector = this.calculateGrowthVector(originLocation, initialVector);

    const tendril: NetworkTendril = {
      tendrilId: `tendril-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originNodeId: this.nodeId,
      tipLocation: { ...originLocation },
      vector,
      energyInvested: this.params.stepEnergy,
      length: 0,
      age: 0,
      active: true,
      nodesEncountered: []
    };

    this.activeTendrils.set(tendril.tendrilId, tendril);
    this.emit('tendrilSpawned', { tendril });

    return tendril;
  }

  /**
   * Calculate growth vector based on gradients and exploration
   *
   * THEORETICAL: Combines gradient-following with random exploration,
   * similar to Physarum's probabilistic foraging behavior.
   */
  private calculateGrowthVector(
    location: { latitude: number; longitude: number },
    override?: Partial<GrowthVector>
  ): GrowthVector {
    // Start with exploration (random direction)
    let direction = Math.random() * 360;
    let magnitude = 0.5;
    let reason: GrowthVector['reason'] = 'exploration';

    // Apply gradient influence
    if (this.detectedGradients.length > 0 && Math.random() > this.params.explorationBias) {
      // Find strongest relevant gradient
      const strongestGradient = this.detectedGradients.reduce((best, current) =>
        current.strength * current.confidence > best.strength * best.confidence
          ? current
          : best
      );

      // Calculate direction toward gradient source
      const dx = strongestGradient.source.longitude - location.longitude;
      const dy = strongestGradient.source.latitude - location.latitude;
      direction = Math.atan2(dy, dx) * (180 / Math.PI);

      // Adjust magnitude based on gradient strength
      magnitude = strongestGradient.strength * this.params.gradientWeight;
      reason = 'gradient';
    }

    return {
      direction: override?.direction ?? direction,
      magnitude: override?.magnitude ?? magnitude,
      reason: override?.targetAttraction ? 'attraction' : reason,
      targetAttraction: override?.targetAttraction
    };
  }

  /**
   * Grow active tendrils one step
   *
   * THEORETICAL: Advance all tendrils according to their vectors
   */
  async growStep(): Promise<void> {
    if (this.mode === GrowthMode.DORMANT) {
      return;
    }

    console.log(`[THEORETICAL] Growing ${this.activeTendrils.size} tendrils...`);

    const toRemove: string[] = [];

    for (const [tendrilId, tendril] of this.activeTendrils.entries()) {
      if (!tendril.active) {
        toRemove.push(tendrilId);
        continue;
      }

      // Update tendril age
      tendril.age += 1000; // Assume 1 second per step

      // Check for timeout
      if (tendril.age > this.params.tendrilTimeout) {
        console.log(`[THEORETICAL] Tendril ${tendrilId} timed out`);
        toRemove.push(tendrilId);
        continue;
      }

      // Check for max length
      if (tendril.length >= this.params.maxTendrilLength) {
        console.log(`[THEORETICAL] Tendril ${tendrilId} reached max length`);
        toRemove.push(tendrilId);
        continue;
      }

      // Calculate step movement
      const stepSize = tendril.vector.magnitude * 0.001; // Degrees
      const radians = tendril.vector.direction * (Math.PI / 180);

      // Update tip location
      tendril.tipLocation.longitude += Math.cos(radians) * stepSize;
      tendril.tipLocation.latitude += Math.sin(radians) * stepSize;

      // Update length and energy
      tendril.length += 1;
      tendril.energyInvested += this.params.stepEnergy;

      // Check for node encounter (simulated)
      const encountered = await this.checkForNodeEncounter(tendril);
      if (encountered) {
        tendril.nodesEncountered.push(encountered);
        this.emit('nodeEncountered', { tendrilId, nodeId: encountered });

        // Success - mark for removal
        toRemove.push(tendrilId);
        this.recordExpansion(tendrilId, true, 1);
      }

      // Recalculate vector periodically
      if (tendril.length % 10 === 0) {
        tendril.vector = this.calculateGrowthVector(tendril.tipLocation);
      }
    }

    // Remove completed/failed tendrils
    for (const tendrilId of toRemove) {
      this.activeTendrils.delete(tendrilId);
    }
  }

  /**
   * Check if tendril has encountered a potential connection
   *
   * THEORETICAL: Detection of nearby nodes or opportunities
   */
  private async checkForNodeEncounter(tendril: NetworkTendril): Promise<string | null> {
    // Simulated - in reality would query network for nearby nodes
    const encounterProbability = 0.05;

    if (Math.random() < encounterProbability) {
      return `discovered-node-${Math.random().toString(36).substr(2, 9)}`;
    }

    return null;
  }

  /**
   * Record expansion attempt result
   */
  private recordExpansion(tendrilId: string, success: boolean, nodesCreated: number): void {
    this.expansionHistory.push({
      tendrilId,
      success,
      nodesCreated,
      timestamp: new Date()
    });

    // Check if we need to adjust mode based on success rate
    this.checkModeAdjustment();
  }

  /**
   * Check if growth mode should be adjusted based on performance
   */
  private checkModeAdjustment(): void {
    const recentHistory = this.expansionHistory.slice(-20);
    if (recentHistory.length < 5) return;

    const successRate = recentHistory.filter(h => h.success).length / recentHistory.length;

    if (successRate < this.params.minSuccessRate && this.mode !== GrowthMode.EXPLORATORY) {
      console.log('[THEORETICAL] Low success rate, switching to EXPLORATORY mode');
      this.setMode(GrowthMode.EXPLORATORY);
    } else if (successRate > 0.7 && this.mode === GrowthMode.EXPLORATORY) {
      console.log('[THEORETICAL] High success rate, switching to BALANCED mode');
      this.setMode(GrowthMode.BALANCED);
    }
  }

  /**
   * Detect expansion opportunities
   *
   * THEORETICAL: Identify valuable locations for network expansion
   */
  async detectOpportunities(): Promise<ExpansionOpportunity[]> {
    console.log('[THEORETICAL] Scanning for expansion opportunities...');

    const newOpportunities: ExpansionOpportunity[] = [];

    // Analyze gradients for opportunities
    for (const gradient of this.detectedGradients) {
      if (gradient.strength > 0.5) {
        const opportunity: ExpansionOpportunity = {
          opportunityId: `opp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          location: gradient.source,
          type: gradient.type === 'demand' ? 'demand_center' : 'resource_source',
          value: gradient.strength * 100,
          cost: 100 - (gradient.confidence * 100),
          urgency: gradient.type === 'demand' ? 8 : 5,
          detectedAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000) // 1 hour
        };

        newOpportunities.push(opportunity);
        this.opportunities.set(opportunity.opportunityId, opportunity);
      }
    }

    this.emit('opportunitiesDetected', { opportunities: newOpportunities });

    return newOpportunities;
  }

  /**
   * Pursue an expansion opportunity
   *
   * THEORETICAL: Direct tendrils toward a specific opportunity
   */
  pursueOpportunity(opportunityId: string, originLocation: { latitude: number; longitude: number }): NetworkTendril | null {
    const opportunity = this.opportunities.get(opportunityId);
    if (!opportunity) {
      console.warn('[THEORETICAL] Opportunity not found');
      return null;
    }

    // Calculate direction toward opportunity
    const dx = opportunity.location.longitude - originLocation.longitude;
    const dy = opportunity.location.latitude - originLocation.latitude;
    const direction = Math.atan2(dy, dx) * (180 / Math.PI);

    return this.spawnTendril(originLocation, {
      direction,
      magnitude: Math.min(1.0, opportunity.urgency / 10),
      targetAttraction: {
        nodeId: opportunityId,
        strength: opportunity.value / 100
      }
    });
  }

  /**
   * Prune unsuccessful tendrils
   *
   * THEORETICAL: Like Physarum retracting inefficient pseudopods
   */
  pruneInactiveTendrils(): number {
    console.log('[THEORETICAL] Pruning inactive tendrils...');

    let pruned = 0;

    for (const [tendrilId, tendril] of this.activeTendrils.entries()) {
      const efficiency = tendril.nodesEncountered.length / tendril.energyInvested;

      if (efficiency < 0.01 && tendril.age > 60000) {
        this.activeTendrils.delete(tendrilId);
        pruned++;
        this.emit('tendrilPruned', { tendrilId, reason: 'low_efficiency' });
      }
    }

    return pruned;
  }

  /**
   * Get current expansion state
   */
  getState(): {
    mode: GrowthMode;
    activeTendrils: number;
    detectedGradients: number;
    opportunities: number;
    successRate: number;
  } {
    const recentHistory = this.expansionHistory.slice(-20);
    const successRate = recentHistory.length > 0
      ? recentHistory.filter(h => h.success).length / recentHistory.length
      : 0;

    return {
      mode: this.mode,
      activeTendrils: this.activeTendrils.size,
      detectedGradients: this.detectedGradients.length,
      opportunities: this.opportunities.size,
      successRate
    };
  }

  /**
   * Get active tendrils
   */
  getTendrils(): NetworkTendril[] {
    return Array.from(this.activeTendrils.values());
  }
}

// ============================================================================
// GROWTH ALGORITHMS
// ============================================================================

/**
 * Physarum-Inspired Growth Algorithm
 *
 * THEORETICAL: Implements the core algorithm from Tero et al. 2010
 *
 * The algorithm models network tubes that:
 * 1. Conduct flow between source and sink nodes
 * 2. Increase in diameter with higher flow
 * 3. Shrink when flow is low
 * 4. Eventually disappear if flow ceases
 */
export function physarumGrowthStep(
  nodes: Array<{ id: string; location: { x: number; y: number }; isSource: boolean }>,
  connections: Map<string, { diameter: number; flow: number }>
): Map<string, { diameter: number; flow: number }> {
  console.log('[THEORETICAL] Executing Physarum growth step...');

  const updatedConnections = new Map(connections);

  // Constants from biological observations
  const gamma = 1.8; // Flow-diameter relationship exponent
  const alpha = 0.5; // Reinforcement rate
  const decay = 0.1; // Natural decay rate

  for (const [connId, conn] of updatedConnections.entries()) {
    // Conductivity proportional to diameter^gamma (Hagen-Poiseuille flow)
    const conductivity = Math.pow(conn.diameter, gamma);

    // Update diameter based on flow
    // d(D)/dt = f(|Q|) - decay * D
    const reinforcement = alpha * Math.abs(conn.flow) / (1 + Math.abs(conn.flow));
    const newDiameter = conn.diameter + reinforcement - decay * conn.diameter;

    // Ensure minimum diameter
    updatedConnections.set(connId, {
      diameter: Math.max(0.01, newDiameter),
      flow: conn.flow * conductivity / (conductivity + 0.1)
    });
  }

  return updatedConnections;
}

// ============================================================================
// DISCLAIMER
// ============================================================================
/*
 * IMPORTANT NOTICE:
 *
 * This code is part of a THEORETICAL FRAMEWORK exploring concepts for
 * organic network growth inspired by biological systems.
 *
 * It is NOT:
 * - A working network expansion system
 * - A proven technology
 * - Ready for production deployment
 * - An energy distribution solution
 *
 * It IS:
 * - An educational exploration of bio-inspired algorithms
 * - Based on real scientific research (Tero et al., Science 2010)
 * - A conceptual framework for community discussion
 *
 * The slime mold Physarum polycephalum has demonstrated remarkable
 * optimization abilities, recreating transportation networks similar
 * to the Tokyo rail system. This code explores how such principles
 * might inform decentralized network design.
 */
