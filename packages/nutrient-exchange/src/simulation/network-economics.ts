/**
 * Network Economics Simulation for the Nutrient Exchange System
 *
 * ============================================================================
 * DISCLAIMER: This is an AI-generated THEORETICAL framework for educational
 * and conceptual exploration purposes only. This does NOT represent a working
 * system or proven technology. All concepts described herein are speculative
 * and intended for simulation/exploration purposes.
 * ============================================================================
 *
 * THEORETICAL CONCEPT:
 * This module could potentially simulate the economic dynamics of a
 * decentralized resource sharing network, allowing exploration of different
 * incentive mechanisms, pricing models, and network behaviors.
 *
 * INSPIRATIONS:
 * - Agent-Based Modeling: Simulating individual actors and emergent behavior
 * - Token Engineering: Designing economic systems for networks
 * - Game Theory: Analyzing strategic interactions
 * - Network Economics: Understanding network effects and externalities
 *
 * @packageDocumentation
 * @module @chicago-forest/nutrient-exchange/simulation
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type { ResourceType } from '../types';

/**
 * Configuration for the network economics simulation.
 */
export interface SimulationConfig {
  /** Number of nodes to simulate */
  nodeCount: number;

  /** Simulation tick duration (ms) */
  tickDuration: number;

  /** Number of ticks to run */
  totalTicks: number;

  /** Initial credit distribution per node */
  initialCredits: number;

  /** Resource generation rate */
  resourceGeneration: Record<ResourceType, number>;

  /** Resource consumption rate */
  resourceConsumption: Record<ResourceType, number>;

  /** Base price for resources */
  basePrices: Record<ResourceType, number>;

  /** Price elasticity */
  priceElasticity: number;

  /** Network growth rate (nodes per tick) */
  networkGrowthRate: number;

  /** Churn rate (probability of node leaving per tick) */
  churnRate: number;

  /** Free rider ratio */
  freeRiderRatio: number;

  /** Malicious node ratio */
  maliciousRatio: number;

  /** Random seed for reproducibility */
  randomSeed?: number;
}

/**
 * A simulated node in the network.
 */
export interface SimulatedNode {
  /** Node ID */
  readonly id: NodeId;

  /** Node behavior type */
  readonly behaviorType: NodeBehaviorType;

  /** Current credit balance */
  credits: number;

  /** Resources available */
  resources: Record<ResourceType, number>;

  /** Resources consumed per tick */
  consumption: Record<ResourceType, number>;

  /** Reputation score */
  reputation: number;

  /** Join timestamp (tick) */
  readonly joinedAt: number;

  /** Whether node is active */
  active: boolean;

  /** Node statistics */
  stats: NodeSimStats;
}

/**
 * Types of node behavior in simulation.
 *
 * THEORETICAL: Different behavior types could help analyze how
 * various actor types affect network economics.
 */
export type NodeBehaviorType =
  | 'cooperative'   // Contributes fairly
  | 'altruistic'    // Over-contributes
  | 'rational'      // Maximizes own utility
  | 'free-rider'    // Consumes without contributing
  | 'malicious';    // Tries to exploit the system

/**
 * Per-node statistics in simulation.
 */
export interface NodeSimStats {
  /** Total credits earned */
  totalEarned: number;

  /** Total credits spent */
  totalSpent: number;

  /** Exchanges completed */
  exchangesCompleted: number;

  /** Exchanges failed */
  exchangesFailed: number;

  /** Resources contributed */
  resourcesContributed: Record<ResourceType, number>;

  /** Resources consumed */
  resourcesConsumed: Record<ResourceType, number>;
}

/**
 * Simulation state snapshot.
 */
export interface SimulationSnapshot {
  /** Current tick */
  tick: number;

  /** Active node count */
  activeNodes: number;

  /** Total credits in circulation */
  totalCredits: number;

  /** Gini coefficient (inequality measure) */
  giniCoefficient: number;

  /** Current prices */
  prices: Record<ResourceType, number>;

  /** Total resources available */
  totalResources: Record<ResourceType, number>;

  /** Total resources consumed this tick */
  consumedThisTick: Record<ResourceType, number>;

  /** Exchange success rate */
  exchangeSuccessRate: number;

  /** Network utility (aggregate satisfaction) */
  networkUtility: number;

  /** Average reputation */
  averageReputation: number;

  /** Node counts by behavior type */
  behaviorDistribution: Record<NodeBehaviorType, number>;
}

/**
 * An economic event in the simulation.
 */
export interface EconomicEvent {
  /** Event type */
  readonly type: EconomicEventType;

  /** Tick when event occurred */
  readonly tick: number;

  /** Affected nodes */
  readonly nodes: NodeId[];

  /** Event data */
  readonly data: Record<string, unknown>;
}

/**
 * Types of economic events.
 */
export type EconomicEventType =
  | 'node_joined'
  | 'node_left'
  | 'exchange_completed'
  | 'exchange_failed'
  | 'price_changed'
  | 'reputation_updated'
  | 'credit_transfer'
  | 'resource_depleted'
  | 'demand_spike'
  | 'supply_shortage';

/**
 * Events emitted by the simulation.
 */
export interface SimulationEvents {
  'simulation:started': (config: SimulationConfig) => void;
  'simulation:tick': (snapshot: SimulationSnapshot) => void;
  'simulation:completed': (results: SimulationResults) => void;
  'event:occurred': (event: EconomicEvent) => void;
  'node:behavior-change': (nodeId: NodeId, oldBehavior: NodeBehaviorType, newBehavior: NodeBehaviorType) => void;
}

/**
 * Final results of a simulation run.
 */
export interface SimulationResults {
  /** Simulation configuration used */
  config: SimulationConfig;

  /** Total ticks completed */
  ticksCompleted: number;

  /** Final snapshot */
  finalSnapshot: SimulationSnapshot;

  /** History of snapshots */
  history: SimulationSnapshot[];

  /** All economic events */
  events: EconomicEvent[];

  /** Analysis metrics */
  analysis: SimulationAnalysis;
}

/**
 * Analysis of simulation results.
 */
export interface SimulationAnalysis {
  /** Was the network economically sustainable */
  sustainable: boolean;

  /** Did free riders get punished effectively */
  freeRiderPunishment: number;

  /** Credit velocity (transactions per credit per tick) */
  creditVelocity: number;

  /** Price stability (standard deviation) */
  priceStability: Record<ResourceType, number>;

  /** Network efficiency (utility / resources) */
  networkEfficiency: number;

  /** Equilibrium reached */
  equilibriumReached: boolean;

  /** Recommendations */
  recommendations: string[];
}

/**
 * Default simulation configuration.
 */
export const DEFAULT_SIM_CONFIG: SimulationConfig = {
  nodeCount: 100,
  tickDuration: 1000,
  totalTicks: 1000,
  initialCredits: 1000,
  resourceGeneration: {
    bandwidth: 1000,
    storage: 10000,
    compute: 100,
    connectivity: 10,
  },
  resourceConsumption: {
    bandwidth: 800,
    storage: 8000,
    compute: 80,
    connectivity: 8,
  },
  basePrices: {
    bandwidth: 0.001,
    storage: 0.0001,
    compute: 0.01,
    connectivity: 0.005,
  },
  priceElasticity: 0.5,
  networkGrowthRate: 0.01,
  churnRate: 0.005,
  freeRiderRatio: 0.1,
  maliciousRatio: 0.02,
};

/**
 * NetworkEconomicsSimulator - THEORETICAL economic simulation.
 *
 * This class might potentially simulate the economic dynamics of a
 * decentralized resource sharing network to explore incentive designs
 * and predict emergent behaviors.
 *
 * DISCLAIMER: This is a conceptual implementation for educational purposes.
 * Simulation results are theoretical and should not be used for real
 * economic decisions without extensive validation.
 *
 * @example
 * ```typescript
 * // THEORETICAL usage example
 * const simulator = new NetworkEconomicsSimulator({
 *   nodeCount: 200,
 *   totalTicks: 500,
 *   freeRiderRatio: 0.15, // Test with 15% free riders
 * });
 *
 * // Run simulation
 * const results = await simulator.run();
 *
 * // Analyze results
 * console.log(`Sustainable: ${results.analysis.sustainable}`);
 * console.log(`Free rider punishment: ${results.analysis.freeRiderPunishment}`);
 * console.log(`Recommendations: ${results.analysis.recommendations.join(', ')}`);
 * ```
 */
export class NetworkEconomicsSimulator extends EventEmitter<SimulationEvents> {
  private readonly config: SimulationConfig;
  private readonly nodes: Map<NodeId, SimulatedNode> = new Map();
  private readonly events: EconomicEvent[] = [];
  private readonly history: SimulationSnapshot[] = [];
  private currentTick = 0;
  private prices: Record<ResourceType, number>;
  private rng: () => number;
  private running = false;

  /**
   * Creates a new NetworkEconomicsSimulator instance.
   *
   * @param config - Simulation configuration
   */
  constructor(config: Partial<SimulationConfig> = {}) {
    super();
    this.config = { ...DEFAULT_SIM_CONFIG, ...config };
    this.prices = { ...this.config.basePrices };

    // Initialize pseudo-random number generator
    this.rng = this.createRng(this.config.randomSeed ?? Date.now());
  }

  /**
   * Runs the simulation.
   *
   * THEORETICAL: The simulation could model various scenarios to
   * understand network economic dynamics.
   *
   * @returns Simulation results
   */
  async run(): Promise<SimulationResults> {
    if (this.running) {
      throw new Error('Simulation already running');
    }

    this.running = true;
    this.emit('simulation:started', this.config);

    // Initialize nodes
    this.initializeNodes();

    // Run simulation loop
    for (this.currentTick = 0; this.currentTick < this.config.totalTicks; this.currentTick++) {
      await this.simulateTick();

      const snapshot = this.createSnapshot();
      this.history.push(snapshot);
      this.emit('simulation:tick', snapshot);
    }

    // Analyze results
    const analysis = this.analyzeResults();
    const results: SimulationResults = {
      config: this.config,
      ticksCompleted: this.currentTick,
      finalSnapshot: this.history[this.history.length - 1],
      history: this.history,
      events: this.events,
      analysis,
    };

    this.running = false;
    this.emit('simulation:completed', results);

    return results;
  }

  /**
   * Initializes the simulated nodes.
   */
  private initializeNodes(): void {
    for (let i = 0; i < this.config.nodeCount; i++) {
      const behaviorType = this.assignBehaviorType();
      this.createNode(behaviorType, 0);
    }
  }

  /**
   * Creates a new simulated node.
   *
   * @param behaviorType - Node behavior type
   * @param joinTick - Tick when node joined
   * @returns The created node
   */
  private createNode(behaviorType: NodeBehaviorType, joinTick: number): SimulatedNode {
    const id = `sim-node-${this.nodes.size}-${Date.now()}` as NodeId;

    // Generate resources based on behavior type
    const resourceMultiplier = this.getResourceMultiplier(behaviorType);

    const node: SimulatedNode = {
      id,
      behaviorType,
      credits: this.config.initialCredits,
      resources: {
        bandwidth: this.config.resourceGeneration.bandwidth * resourceMultiplier * (0.5 + this.rng() * 0.5),
        storage: this.config.resourceGeneration.storage * resourceMultiplier * (0.5 + this.rng() * 0.5),
        compute: this.config.resourceGeneration.compute * resourceMultiplier * (0.5 + this.rng() * 0.5),
        connectivity: this.config.resourceGeneration.connectivity * resourceMultiplier * (0.5 + this.rng() * 0.5),
      },
      consumption: {
        bandwidth: this.config.resourceConsumption.bandwidth * (0.5 + this.rng() * 0.5),
        storage: this.config.resourceConsumption.storage * (0.5 + this.rng() * 0.5),
        compute: this.config.resourceConsumption.compute * (0.5 + this.rng() * 0.5),
        connectivity: this.config.resourceConsumption.connectivity * (0.5 + this.rng() * 0.5),
      },
      reputation: 0.5,
      joinedAt: joinTick,
      active: true,
      stats: {
        totalEarned: 0,
        totalSpent: 0,
        exchangesCompleted: 0,
        exchangesFailed: 0,
        resourcesContributed: { bandwidth: 0, storage: 0, compute: 0, connectivity: 0 },
        resourcesConsumed: { bandwidth: 0, storage: 0, compute: 0, connectivity: 0 },
      },
    };

    this.nodes.set(id, node);

    this.recordEvent({
      type: 'node_joined',
      tick: joinTick,
      nodes: [id],
      data: { behaviorType },
    });

    return node;
  }

  /**
   * Assigns a behavior type based on configured ratios.
   *
   * @returns Behavior type
   */
  private assignBehaviorType(): NodeBehaviorType {
    const r = this.rng();

    if (r < this.config.maliciousRatio) {
      return 'malicious';
    } else if (r < this.config.maliciousRatio + this.config.freeRiderRatio) {
      return 'free-rider';
    } else if (r < 0.3) {
      return 'altruistic';
    } else if (r < 0.6) {
      return 'cooperative';
    } else {
      return 'rational';
    }
  }

  /**
   * Gets resource generation multiplier for behavior type.
   *
   * @param type - Behavior type
   * @returns Multiplier
   */
  private getResourceMultiplier(type: NodeBehaviorType): number {
    switch (type) {
      case 'altruistic':
        return 1.5;
      case 'cooperative':
        return 1.0;
      case 'rational':
        return 0.8;
      case 'free-rider':
        return 0.1;
      case 'malicious':
        return 0.2;
      default:
        return 1.0;
    }
  }

  /**
   * Simulates one tick of the economy.
   */
  private async simulateTick(): Promise<void> {
    // 1. Network growth
    this.simulateNetworkGrowth();

    // 2. Node churn
    this.simulateChurn();

    // 3. Resource production
    this.simulateResourceProduction();

    // 4. Exchanges
    await this.simulateExchanges();

    // 5. Price updates
    this.updatePrices();

    // 6. Reputation updates
    this.updateReputations();

    // 7. Behavior adaptation
    this.simulateBehaviorAdaptation();
  }

  /**
   * Simulates network growth.
   */
  private simulateNetworkGrowth(): void {
    if (this.rng() < this.config.networkGrowthRate) {
      const behaviorType = this.assignBehaviorType();
      this.createNode(behaviorType, this.currentTick);
    }
  }

  /**
   * Simulates node churn (nodes leaving).
   */
  private simulateChurn(): void {
    for (const node of this.nodes.values()) {
      if (node.active && this.rng() < this.config.churnRate) {
        node.active = false;

        this.recordEvent({
          type: 'node_left',
          tick: this.currentTick,
          nodes: [node.id],
          data: { credits: node.credits, reputation: node.reputation },
        });
      }
    }
  }

  /**
   * Simulates resource production by nodes.
   */
  private simulateResourceProduction(): void {
    for (const node of this.nodes.values()) {
      if (!node.active) continue;

      // Regenerate resources based on behavior
      const regenRate = this.getResourceMultiplier(node.behaviorType);

      for (const type of ['bandwidth', 'storage', 'compute', 'connectivity'] as ResourceType[]) {
        const maxCapacity = this.config.resourceGeneration[type] * regenRate;
        node.resources[type] = Math.min(
          maxCapacity,
          node.resources[type] + maxCapacity * 0.1
        );
      }
    }
  }

  /**
   * Simulates exchanges between nodes.
   */
  private async simulateExchanges(): Promise<void> {
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.active);

    // Each node tries to satisfy its consumption needs
    for (const consumer of activeNodes) {
      for (const type of ['bandwidth', 'storage', 'compute', 'connectivity'] as ResourceType[]) {
        const needed = consumer.consumption[type] - (consumer.resources[type] * 0.5);

        if (needed > 0 && consumer.credits > 0) {
          await this.attemptExchange(consumer, type, needed, activeNodes);
        }
      }
    }
  }

  /**
   * Attempts an exchange between a consumer and available providers.
   *
   * @param consumer - Consuming node
   * @param type - Resource type
   * @param amount - Amount needed
   * @param providers - Available providers
   */
  private async attemptExchange(
    consumer: SimulatedNode,
    type: ResourceType,
    amount: number,
    providers: SimulatedNode[]
  ): Promise<void> {
    // Find a suitable provider
    const suitableProviders = providers
      .filter(p =>
        p.id !== consumer.id &&
        p.resources[type] >= amount &&
        p.behaviorType !== 'malicious' &&
        p.reputation > 0.2
      )
      .sort((a, b) => b.reputation - a.reputation);

    if (suitableProviders.length === 0) {
      consumer.stats.exchangesFailed++;
      return;
    }

    const provider = suitableProviders[0];
    const price = this.prices[type];
    const cost = amount * price;

    // Check if consumer can afford
    if (consumer.credits < cost) {
      consumer.stats.exchangesFailed++;
      return;
    }

    // Execute exchange
    consumer.credits -= cost;
    consumer.stats.totalSpent += cost;
    consumer.stats.resourcesConsumed[type] += amount;
    consumer.stats.exchangesCompleted++;

    provider.credits += cost;
    provider.stats.totalEarned += cost;
    provider.resources[type] -= amount;
    provider.stats.resourcesContributed[type] += amount;
    provider.stats.exchangesCompleted++;

    // Reputation boost for successful exchange
    provider.reputation = Math.min(1, provider.reputation + 0.001);
    consumer.reputation = Math.min(1, consumer.reputation + 0.0005);

    this.recordEvent({
      type: 'exchange_completed',
      tick: this.currentTick,
      nodes: [consumer.id, provider.id],
      data: { resourceType: type, amount, price: cost },
    });
  }

  /**
   * Updates prices based on supply and demand.
   */
  private updatePrices(): void {
    for (const type of ['bandwidth', 'storage', 'compute', 'connectivity'] as ResourceType[]) {
      const supply = Array.from(this.nodes.values())
        .filter(n => n.active)
        .reduce((sum, n) => sum + n.resources[type], 0);

      const demand = Array.from(this.nodes.values())
        .filter(n => n.active)
        .reduce((sum, n) => sum + n.consumption[type], 0);

      // Supply/demand price adjustment
      const ratio = demand / (supply + 1);
      const adjustment = Math.pow(ratio, this.config.priceElasticity);

      const oldPrice = this.prices[type];
      const newPrice = this.config.basePrices[type] * adjustment;

      // Smooth price changes
      this.prices[type] = oldPrice * 0.9 + newPrice * 0.1;

      if (Math.abs(newPrice - oldPrice) / oldPrice > 0.1) {
        this.recordEvent({
          type: 'price_changed',
          tick: this.currentTick,
          nodes: [],
          data: { resourceType: type, oldPrice, newPrice: this.prices[type] },
        });
      }
    }
  }

  /**
   * Updates node reputations.
   */
  private updateReputations(): void {
    for (const node of this.nodes.values()) {
      if (!node.active) continue;

      // Reputation decay
      node.reputation *= 0.999;

      // Punish free riders
      if (node.behaviorType === 'free-rider') {
        const consumeRatio = Object.values(node.stats.resourcesConsumed).reduce((a, b) => a + b, 0);
        const contributeRatio = Object.values(node.stats.resourcesContributed).reduce((a, b) => a + b, 0);

        if (consumeRatio > 0 && contributeRatio / consumeRatio < 0.1) {
          node.reputation = Math.max(0, node.reputation - 0.01);
        }
      }

      // Punish malicious nodes
      if (node.behaviorType === 'malicious') {
        if (this.rng() < 0.1) {
          node.reputation = Math.max(0, node.reputation - 0.05);
        }
      }
    }
  }

  /**
   * Simulates nodes adapting their behavior.
   */
  private simulateBehaviorAdaptation(): void {
    for (const node of this.nodes.values()) {
      if (!node.active) continue;
      if (this.rng() > 0.01) continue; // 1% chance per tick

      // Rational nodes may become free riders if profitable
      if (node.behaviorType === 'rational') {
        const freeRiders = Array.from(this.nodes.values())
          .filter(n => n.behaviorType === 'free-rider' && n.active);

        const avgFreeRiderCredits = freeRiders.length > 0
          ? freeRiders.reduce((sum, n) => sum + n.credits, 0) / freeRiders.length
          : 0;

        if (avgFreeRiderCredits > node.credits * 1.5 && node.reputation > 0.5) {
          // Free riding seems profitable
          const oldBehavior = node.behaviorType;
          node.behaviorType = 'free-rider';
          this.emit('node:behavior-change', node.id, oldBehavior, 'free-rider');
        }
      }

      // Free riders may reform if reputation too low
      if (node.behaviorType === 'free-rider' && node.reputation < 0.2) {
        const oldBehavior = node.behaviorType;
        node.behaviorType = 'cooperative';
        this.emit('node:behavior-change', node.id, oldBehavior, 'cooperative');
      }
    }
  }

  /**
   * Creates a snapshot of current simulation state.
   *
   * @returns Simulation snapshot
   */
  private createSnapshot(): SimulationSnapshot {
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.active);

    const totalCredits = activeNodes.reduce((sum, n) => sum + n.credits, 0);
    const gini = this.calculateGini(activeNodes.map(n => n.credits));

    const totalResources: Record<ResourceType, number> = {
      bandwidth: 0,
      storage: 0,
      compute: 0,
      connectivity: 0,
    };

    const consumedThisTick: Record<ResourceType, number> = {
      bandwidth: 0,
      storage: 0,
      compute: 0,
      connectivity: 0,
    };

    const behaviorDistribution: Record<NodeBehaviorType, number> = {
      cooperative: 0,
      altruistic: 0,
      rational: 0,
      'free-rider': 0,
      malicious: 0,
    };

    let totalExchanges = 0;
    let successfulExchanges = 0;
    let totalReputation = 0;

    for (const node of activeNodes) {
      for (const type of ['bandwidth', 'storage', 'compute', 'connectivity'] as ResourceType[]) {
        totalResources[type] += node.resources[type];
      }

      behaviorDistribution[node.behaviorType]++;
      totalExchanges += node.stats.exchangesCompleted + node.stats.exchangesFailed;
      successfulExchanges += node.stats.exchangesCompleted;
      totalReputation += node.reputation;
    }

    // Estimate consumed this tick from recent events
    const recentExchanges = this.events.filter(
      e => e.type === 'exchange_completed' && e.tick === this.currentTick
    );

    for (const event of recentExchanges) {
      const type = event.data.resourceType as ResourceType;
      const amount = event.data.amount as number;
      consumedThisTick[type] += amount;
    }

    return {
      tick: this.currentTick,
      activeNodes: activeNodes.length,
      totalCredits,
      giniCoefficient: gini,
      prices: { ...this.prices },
      totalResources,
      consumedThisTick,
      exchangeSuccessRate: totalExchanges > 0 ? successfulExchanges / totalExchanges : 1,
      networkUtility: this.calculateNetworkUtility(activeNodes),
      averageReputation: activeNodes.length > 0 ? totalReputation / activeNodes.length : 0,
      behaviorDistribution,
    };
  }

  /**
   * Calculates the Gini coefficient for wealth distribution.
   *
   * @param values - Credit values
   * @returns Gini coefficient (0 = equal, 1 = unequal)
   */
  private calculateGini(values: number[]): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    if (sum === 0) return 0;

    let numerator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (2 * (i + 1) - n - 1) * sorted[i];
    }

    return numerator / (n * sum);
  }

  /**
   * Calculates aggregate network utility.
   *
   * @param nodes - Active nodes
   * @returns Network utility score
   */
  private calculateNetworkUtility(nodes: SimulatedNode[]): number {
    let utility = 0;

    for (const node of nodes) {
      // Utility based on needs satisfaction
      for (const type of ['bandwidth', 'storage', 'compute', 'connectivity'] as ResourceType[]) {
        const satisfied = Math.min(node.resources[type] / node.consumption[type], 1);
        utility += satisfied;
      }

      // Bonus for good reputation
      utility += node.reputation;

      // Penalty for low credits
      if (node.credits < 100) {
        utility -= 0.5;
      }
    }

    return utility / Math.max(nodes.length, 1);
  }

  /**
   * Analyzes simulation results.
   *
   * @returns Analysis
   */
  private analyzeResults(): SimulationAnalysis {
    const activeNodes = Array.from(this.nodes.values()).filter(n => n.active);
    const recommendations: string[] = [];

    // Check sustainability
    const finalSnapshot = this.history[this.history.length - 1];
    const initialSnapshot = this.history[0];

    const creditGrowth = finalSnapshot.totalCredits / initialSnapshot.totalCredits;
    const sustainable = creditGrowth > 0.5 && creditGrowth < 2.0;

    if (!sustainable) {
      if (creditGrowth < 0.5) {
        recommendations.push('Credit deflation detected - consider increasing initial credits or reducing fees');
      } else {
        recommendations.push('Credit inflation detected - consider credit sinks or decay mechanisms');
      }
    }

    // Free rider punishment effectiveness
    const freeRiders = activeNodes.filter(n => n.behaviorType === 'free-rider');
    const cooperators = activeNodes.filter(n => n.behaviorType === 'cooperative');

    const avgFreeRiderCredits = freeRiders.length > 0
      ? freeRiders.reduce((sum, n) => sum + n.credits, 0) / freeRiders.length
      : 0;

    const avgCooperatorCredits = cooperators.length > 0
      ? cooperators.reduce((sum, n) => sum + n.credits, 0) / cooperators.length
      : 0;

    const freeRiderPunishment = avgCooperatorCredits > 0
      ? 1 - (avgFreeRiderCredits / avgCooperatorCredits)
      : 0;

    if (freeRiderPunishment < 0.5) {
      recommendations.push('Free riders not effectively punished - consider stronger reputation penalties');
    }

    // Credit velocity
    const totalTransactions = this.events.filter(e => e.type === 'exchange_completed').length;
    const creditVelocity = totalTransactions / (finalSnapshot.totalCredits + 1) / this.config.totalTicks;

    if (creditVelocity < 0.001) {
      recommendations.push('Low credit velocity - consider reducing transaction costs');
    }

    // Price stability
    const priceStability: Record<ResourceType, number> = {
      bandwidth: 0,
      storage: 0,
      compute: 0,
      connectivity: 0,
    };

    for (const type of ['bandwidth', 'storage', 'compute', 'connectivity'] as ResourceType[]) {
      const prices = this.history.map(s => s.prices[type]);
      const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
      priceStability[type] = Math.sqrt(variance) / mean;

      if (priceStability[type] > 0.5) {
        recommendations.push(`High ${type} price volatility - consider price smoothing mechanisms`);
      }
    }

    // Network efficiency
    const networkEfficiency = finalSnapshot.networkUtility / Math.max(
      Object.values(finalSnapshot.totalResources).reduce((a, b) => a + b, 0),
      1
    );

    // Equilibrium detection
    const recentSnapshots = this.history.slice(-100);
    const priceVariation = recentSnapshots.length > 1
      ? Math.max(...Object.keys(this.prices).map(type =>
          Math.abs(recentSnapshots[recentSnapshots.length - 1].prices[type as ResourceType] -
                   recentSnapshots[0].prices[type as ResourceType]) /
          recentSnapshots[0].prices[type as ResourceType]
        ))
      : 0;

    const equilibriumReached = priceVariation < 0.05;

    if (!equilibriumReached) {
      recommendations.push('Market did not reach equilibrium - consider longer simulation or parameter tuning');
    }

    // Gini coefficient check
    if (finalSnapshot.giniCoefficient > 0.6) {
      recommendations.push('High wealth inequality - consider progressive mechanisms or UBI');
    }

    return {
      sustainable,
      freeRiderPunishment,
      creditVelocity,
      priceStability,
      networkEfficiency,
      equilibriumReached,
      recommendations,
    };
  }

  /**
   * Records an economic event.
   *
   * @param event - Event to record
   */
  private recordEvent(event: Omit<EconomicEvent, 'tick'> & { tick: number }): void {
    const fullEvent = event as EconomicEvent;
    this.events.push(fullEvent);
    this.emit('event:occurred', fullEvent);
  }

  /**
   * Creates a seeded random number generator.
   *
   * @param seed - Random seed
   * @returns RNG function
   */
  private createRng(seed: number): () => number {
    // Simple xorshift RNG
    let state = seed;

    return () => {
      state ^= state << 13;
      state ^= state >> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967295;
    };
  }

  /**
   * Gets current simulation state.
   *
   * @returns Current snapshot or null if not running
   */
  getCurrentState(): SimulationSnapshot | null {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1];
  }

  /**
   * Gets all nodes in simulation.
   *
   * @returns Simulated nodes
   */
  getNodes(): SimulatedNode[] {
    return Array.from(this.nodes.values());
  }
}

/**
 * Simulation index export.
 */
export * from './network-economics';
