/**
 * Rhizome Lateral Growth Coordinator
 *
 * DISCLAIMER: This is a THEORETICAL framework inspired by biological systems.
 * This code represents a conceptual design for horizontal network expansion
 * and is NOT a working energy distribution system.
 *
 * AI-GENERATED CONTENT: Created as part of the Chicago Plasma Forest Network
 * theoretical framework - an educational project exploring decentralized networks.
 *
 * BIOLOGICAL INSPIRATION:
 * Based on how rhizomes (underground plant stems like ginger, bamboo, and
 * Bermuda grass) spread horizontally through the soil, creating interconnected
 * networks of nodes that can:
 * - Spread in all directions simultaneously
 * - Create new growth points at intervals (nodes)
 * - Form dense, resilient networks
 * - Share resources between connected nodes
 *
 * References:
 * - Hutchings & de Kroon, "Foraging in Plants: the Role of Morphological
 *   Plasticity in Resource Acquisition", Advances in Ecological Research 25:159-238
 *   DOI: 10.1016/S0065-2504(08)60215-9
 *
 * - de Kroon & Hutchings, "Morphological Plasticity in Clonal Plants: The
 *   Foraging Concept Reconsidered", Journal of Ecology 83(1):143-152, 1995
 */

import { EventEmitter } from 'events';

// ============================================================================
// THEORETICAL FRAMEWORK - NOT OPERATIONAL
// ============================================================================

/**
 * Growth Direction Types
 *
 * THEORETICAL: Directions of lateral expansion
 */
export enum GrowthDirection {
  /** Cardinal directions */
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',

  /** Intercardinal directions */
  NORTHEAST = 'NORTHEAST',
  NORTHWEST = 'NORTHWEST',
  SOUTHEAST = 'SOUTHEAST',
  SOUTHWEST = 'SOUTHWEST',

  /** Opportunistic (any direction) */
  OPPORTUNISTIC = 'OPPORTUNISTIC'
}

/**
 * Growth Segment Types
 *
 * THEORETICAL: Types of rhizome segments like biological rhizomes
 */
export enum SegmentType {
  /** Primary growth axis (thick, resource-rich) */
  PRIMARY = 'PRIMARY',

  /** Secondary branching segments */
  SECONDARY = 'SECONDARY',

  /** Exploratory thin segments */
  EXPLORATORY = 'EXPLORATORY',

  /** Dormant segment (can reactivate) */
  DORMANT = 'DORMANT',

  /** Storage segment (resource reserves) */
  STORAGE = 'STORAGE'
}

/**
 * Rhizome Node (Growth Point)
 *
 * THEORETICAL: A node in the rhizome network, like an internode in plant rhizomes
 */
export interface RhizomeNode {
  /** Unique node identifier */
  nodeId: string;

  /** Geographic location */
  location: {
    latitude: number;
    longitude: number;
  };

  /** Parent node (null for root) */
  parentId: string | null;

  /** Child nodes */
  childIds: string[];

  /** Segment type from parent to this node */
  segmentType: SegmentType;

  /** Growth energy available (0-1) */
  growthEnergy: number;

  /** Resources stored at this node */
  resourceLevel: number;

  /** Can sprout new segments */
  canSprout: boolean;

  /** Active growth state */
  isActive: boolean;

  /** Age (time since creation) */
  age: number;

  /** Depth in the rhizome (distance from root) */
  depth: number;

  /** Creation timestamp */
  createdAt: number;
}

/**
 * Growth Segment (Connection between nodes)
 *
 * THEORETICAL: A segment connecting two rhizome nodes
 */
export interface GrowthSegment {
  /** Unique segment identifier */
  segmentId: string;

  /** Source node */
  sourceNodeId: string;

  /** Target node */
  targetNodeId: string;

  /** Segment type */
  type: SegmentType;

  /** Segment length (abstract units) */
  length: number;

  /** Resource flow capacity */
  flowCapacity: number;

  /** Current resource flow */
  currentFlow: number;

  /** Segment health (0-1) */
  health: number;

  /** Growth direction */
  direction: GrowthDirection;

  /** Creation timestamp */
  createdAt: number;
}

/**
 * Growth Wave
 *
 * THEORETICAL: A coordinated expansion wave across the network
 */
export interface GrowthWave {
  /** Wave identifier */
  waveId: string;

  /** Wave origin node */
  originNodeId: string;

  /** Current frontier nodes */
  frontierNodes: string[];

  /** Wave velocity (nodes per cycle) */
  velocity: number;

  /** Wave energy (decreases with distance) */
  energy: number;

  /** Direction of propagation */
  direction: GrowthDirection;

  /** Nodes created by this wave */
  nodesCreated: string[];

  /** Start time */
  startedAt: number;

  /** Is wave active */
  active: boolean;
}

/**
 * Environmental Condition for Growth
 *
 * THEORETICAL: Factors affecting growth decisions
 */
export interface EnvironmentalCondition {
  /** Resource availability in area */
  resourceAvailability: number;

  /** Existing node density */
  nodeDensity: number;

  /** Demand level in area */
  demandLevel: number;

  /** Competition level (other networks) */
  competition: number;

  /** Infrastructure suitability */
  suitability: number;
}

/**
 * Lateral Growth Configuration
 *
 * THEORETICAL: Tunable parameters for lateral growth
 */
export interface LateralGrowthConfig {
  /** Node's own ID */
  nodeId: string;

  /** Maximum network depth */
  maxDepth: number;

  /** Maximum children per node */
  maxChildren: number;

  /** Minimum segment length */
  minSegmentLength: number;

  /** Maximum segment length */
  maxSegmentLength: number;

  /** Energy decay per hop */
  energyDecay: number;

  /** Resource sharing ratio */
  resourceSharingRatio: number;

  /** Growth interval (ms) */
  growthInterval: number;

  /** Enable adaptive growth */
  adaptiveGrowth: boolean;

  /** Dormancy threshold */
  dormancyThreshold: number;
}

const DEFAULT_CONFIG: LateralGrowthConfig = {
  nodeId: '',
  maxDepth: 10,
  maxChildren: 6,
  minSegmentLength: 1,
  maxSegmentLength: 10,
  energyDecay: 0.1,
  resourceSharingRatio: 0.3,
  growthInterval: 5000,
  adaptiveGrowth: true,
  dormancyThreshold: 0.1
};

/**
 * Rhizome Lateral Growth Coordinator
 *
 * THEORETICAL FRAMEWORK: Manages horizontal network expansion using
 * patterns inspired by plant rhizome growth.
 *
 * Like a rhizome underground:
 * - Spreads horizontally in multiple directions
 * - Creates nodes at intervals that can sprout new growth
 * - Adapts growth patterns to environmental conditions
 * - Shares resources across the network
 */
export class RhizomeLateralGrowth extends EventEmitter {
  private config: LateralGrowthConfig;

  // Network structure
  private nodes: Map<string, RhizomeNode> = new Map();
  private segments: Map<string, GrowthSegment> = new Map();
  private activeWaves: Map<string, GrowthWave> = new Map();

  // Root node reference
  private rootNodeId: string | null = null;

  // Growth statistics
  private totalNodesCreated: number = 0;
  private totalSegmentsCreated: number = 0;
  private totalWavesLaunched: number = 0;

  // Growth timer
  private growthTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<LateralGrowthConfig> & { nodeId: string }) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize the rhizome network with a root node
   *
   * THEORETICAL: Create the first node of the rhizome
   */
  initializeRoot(location: { latitude: number; longitude: number }): RhizomeNode {
    const rootNode: RhizomeNode = {
      nodeId: this.config.nodeId,
      location,
      parentId: null,
      childIds: [],
      segmentType: SegmentType.PRIMARY,
      growthEnergy: 1.0,
      resourceLevel: 1.0,
      canSprout: true,
      isActive: true,
      age: 0,
      depth: 0,
      createdAt: Date.now()
    };

    this.nodes.set(rootNode.nodeId, rootNode);
    this.rootNodeId = rootNode.nodeId;
    this.totalNodesCreated++;

    console.log(`[THEORETICAL] Rhizome root initialized at (${location.latitude}, ${location.longitude})`);

    this.emit('rootInitialized', { node: rootNode });

    return rootNode;
  }

  /**
   * Start autonomous lateral growth
   *
   * THEORETICAL: Begin periodic growth cycles
   */
  startGrowth(): void {
    if (this.growthTimer) {
      console.log('[THEORETICAL] Growth already active');
      return;
    }

    console.log('[THEORETICAL] Starting lateral growth cycle');

    this.growthTimer = setInterval(() => {
      this.executeGrowthCycle();
    }, this.config.growthInterval);

    this.emit('growthStarted', { nodeId: this.config.nodeId });
  }

  /**
   * Stop autonomous growth
   */
  stopGrowth(): void {
    if (this.growthTimer) {
      clearInterval(this.growthTimer);
      this.growthTimer = null;

      this.emit('growthStopped', { nodeId: this.config.nodeId });
    }
  }

  /**
   * Execute a single growth cycle
   *
   * THEORETICAL: Process all active nodes and waves
   */
  private executeGrowthCycle(): void {
    console.log('[THEORETICAL] Executing growth cycle...');

    // Update node ages
    for (const node of this.nodes.values()) {
      node.age += this.config.growthInterval;
    }

    // Process active growth waves
    for (const [waveId, wave] of this.activeWaves) {
      if (wave.active) {
        this.processGrowthWave(wave);
      } else {
        this.activeWaves.delete(waveId);
      }
    }

    // Autonomous sprouting from active nodes
    for (const node of this.nodes.values()) {
      if (this.shouldSprout(node)) {
        this.sproutFromNode(node);
      }
    }

    // Resource redistribution
    this.redistributeResources();

    // Check for dormancy
    this.checkDormancy();

    this.emit('growthCycleCompleted', {
      activeNodes: this.getActiveNodeCount(),
      activeWaves: this.activeWaves.size
    });
  }

  /**
   * Launch a growth wave from a node
   *
   * THEORETICAL: Initiate coordinated expansion in a direction
   */
  launchGrowthWave(
    originNodeId: string,
    direction: GrowthDirection,
    energy: number = 1.0
  ): GrowthWave | null {
    const origin = this.nodes.get(originNodeId);
    if (!origin || !origin.isActive) {
      return null;
    }

    const wave: GrowthWave = {
      waveId: this.generateId('wave'),
      originNodeId,
      frontierNodes: [originNodeId],
      velocity: 1,
      energy,
      direction,
      nodesCreated: [],
      startedAt: Date.now(),
      active: true
    };

    this.activeWaves.set(wave.waveId, wave);
    this.totalWavesLaunched++;

    console.log(`[THEORETICAL] Growth wave ${wave.waveId} launched from ${originNodeId}`);

    this.emit('waveLaunched', { wave });

    return wave;
  }

  /**
   * Process a growth wave
   *
   * THEORETICAL: Advance the wave frontier
   */
  private processGrowthWave(wave: GrowthWave): void {
    if (wave.energy <= 0) {
      wave.active = false;
      this.emit('waveExhausted', { waveId: wave.waveId });
      return;
    }

    const newFrontier: string[] = [];

    for (const frontierNodeId of wave.frontierNodes) {
      const node = this.nodes.get(frontierNodeId);
      if (!node || !node.canSprout) continue;

      // Try to grow in wave direction
      const newNode = this.growInDirection(node, wave.direction, wave.energy);

      if (newNode) {
        wave.nodesCreated.push(newNode.nodeId);
        newFrontier.push(newNode.nodeId);

        this.emit('nodeCreatedByWave', { waveId: wave.waveId, node: newNode });
      }
    }

    // Update wave state
    wave.frontierNodes = newFrontier;
    wave.energy -= this.config.energyDecay;

    if (newFrontier.length === 0) {
      wave.active = false;
      this.emit('waveStalled', { waveId: wave.waveId });
    }
  }

  /**
   * Grow a new node in a specific direction
   *
   * THEORETICAL: Create a new node extending from a parent
   */
  private growInDirection(
    parent: RhizomeNode,
    direction: GrowthDirection,
    energy: number
  ): RhizomeNode | null {
    // Check constraints
    if (parent.childIds.length >= this.config.maxChildren) {
      return null;
    }

    if (parent.depth >= this.config.maxDepth) {
      return null;
    }

    // Calculate new location based on direction
    const offset = this.calculateDirectionOffset(direction);
    const segmentLength = this.calculateSegmentLength(energy);

    const newLocation = {
      latitude: parent.location.latitude + offset.lat * segmentLength * 0.001,
      longitude: parent.location.longitude + offset.lon * segmentLength * 0.001
    };

    // Check environmental conditions (theoretical)
    const conditions = this.assessEnvironment(newLocation);
    if (conditions.suitability < 0.3) {
      return null;
    }

    // Create new node
    const newNode: RhizomeNode = {
      nodeId: this.generateId('node'),
      location: newLocation,
      parentId: parent.nodeId,
      childIds: [],
      segmentType: this.determineSegmentType(parent, energy),
      growthEnergy: energy * (1 - this.config.energyDecay),
      resourceLevel: parent.resourceLevel * this.config.resourceSharingRatio,
      canSprout: energy > 0.3,
      isActive: true,
      age: 0,
      depth: parent.depth + 1,
      createdAt: Date.now()
    };

    // Create connecting segment
    const segment: GrowthSegment = {
      segmentId: this.generateId('segment'),
      sourceNodeId: parent.nodeId,
      targetNodeId: newNode.nodeId,
      type: newNode.segmentType,
      length: segmentLength,
      flowCapacity: 1.0,
      currentFlow: 0,
      health: 1.0,
      direction,
      createdAt: Date.now()
    };

    // Update parent
    parent.childIds.push(newNode.nodeId);
    parent.resourceLevel -= parent.resourceLevel * this.config.resourceSharingRatio;

    // Store new entities
    this.nodes.set(newNode.nodeId, newNode);
    this.segments.set(segment.segmentId, segment);

    this.totalNodesCreated++;
    this.totalSegmentsCreated++;

    this.emit('nodeCreated', { node: newNode, segment });

    return newNode;
  }

  /**
   * Determine if a node should spontaneously sprout
   *
   * THEORETICAL: Probabilistic sprouting based on conditions
   */
  private shouldSprout(node: RhizomeNode): boolean {
    if (!node.canSprout || !node.isActive) return false;
    if (node.childIds.length >= this.config.maxChildren) return false;
    if (node.growthEnergy < 0.3) return false;

    // Probabilistic based on resources and age
    const sproutProbability =
      node.growthEnergy * 0.5 +
      (1 - node.childIds.length / this.config.maxChildren) * 0.3 +
      Math.min(node.age / 60000, 1) * 0.2;

    return Math.random() < sproutProbability * 0.1; // Low per-cycle probability
  }

  /**
   * Sprout new growth from a node
   *
   * THEORETICAL: Create new branches in random directions
   */
  private sproutFromNode(node: RhizomeNode): void {
    const availableDirections = this.getAvailableDirections(node);
    if (availableDirections.length === 0) return;

    // Choose random direction
    const direction = availableDirections[
      Math.floor(Math.random() * availableDirections.length)
    ];

    this.growInDirection(node, direction, node.growthEnergy);
  }

  /**
   * Get available directions for growth
   *
   * THEORETICAL: Exclude directions already used by children
   */
  private getAvailableDirections(node: RhizomeNode): GrowthDirection[] {
    const allDirections = [
      GrowthDirection.NORTH,
      GrowthDirection.SOUTH,
      GrowthDirection.EAST,
      GrowthDirection.WEST,
      GrowthDirection.NORTHEAST,
      GrowthDirection.NORTHWEST,
      GrowthDirection.SOUTHEAST,
      GrowthDirection.SOUTHWEST
    ];

    // Get directions already used
    const usedDirections = new Set<GrowthDirection>();

    for (const childId of node.childIds) {
      // Find segment to child
      for (const segment of this.segments.values()) {
        if (segment.sourceNodeId === node.nodeId && segment.targetNodeId === childId) {
          usedDirections.add(segment.direction);
          break;
        }
      }
    }

    return allDirections.filter(d => !usedDirections.has(d));
  }

  /**
   * Calculate direction offset for growth
   */
  private calculateDirectionOffset(direction: GrowthDirection): { lat: number; lon: number } {
    switch (direction) {
      case GrowthDirection.NORTH: return { lat: 1, lon: 0 };
      case GrowthDirection.SOUTH: return { lat: -1, lon: 0 };
      case GrowthDirection.EAST: return { lat: 0, lon: 1 };
      case GrowthDirection.WEST: return { lat: 0, lon: -1 };
      case GrowthDirection.NORTHEAST: return { lat: 0.707, lon: 0.707 };
      case GrowthDirection.NORTHWEST: return { lat: 0.707, lon: -0.707 };
      case GrowthDirection.SOUTHEAST: return { lat: -0.707, lon: 0.707 };
      case GrowthDirection.SOUTHWEST: return { lat: -0.707, lon: -0.707 };
      case GrowthDirection.OPPORTUNISTIC:
        // Random direction
        const angle = Math.random() * 2 * Math.PI;
        return { lat: Math.sin(angle), lon: Math.cos(angle) };
    }
  }

  /**
   * Calculate segment length based on energy
   */
  private calculateSegmentLength(energy: number): number {
    const range = this.config.maxSegmentLength - this.config.minSegmentLength;
    return this.config.minSegmentLength + range * energy;
  }

  /**
   * Determine segment type based on parent and energy
   */
  private determineSegmentType(parent: RhizomeNode, energy: number): SegmentType {
    if (parent.segmentType === SegmentType.PRIMARY && energy > 0.7) {
      return SegmentType.PRIMARY;
    } else if (energy > 0.5) {
      return SegmentType.SECONDARY;
    } else if (energy > 0.2) {
      return SegmentType.EXPLORATORY;
    } else {
      return SegmentType.DORMANT;
    }
  }

  /**
   * Assess environmental conditions at a location
   *
   * THEORETICAL: Evaluate suitability for growth
   */
  private assessEnvironment(location: { latitude: number; longitude: number }): EnvironmentalCondition {
    // Check for nearby nodes
    const nearbyNodes = Array.from(this.nodes.values()).filter(node => {
      const dist = this.calculateDistance(location, node.location);
      return dist < 0.01; // ~1km
    });

    const nodeDensity = nearbyNodes.length / 10; // Normalize

    return {
      resourceAvailability: 0.7, // Simulated
      nodeDensity: Math.min(nodeDensity, 1),
      demandLevel: 0.5, // Simulated
      competition: 0, // Simulated
      suitability: 1 - nodeDensity * 0.5 // Lower suitability in dense areas
    };
  }

  /**
   * Calculate distance between two locations
   */
  private calculateDistance(
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ): number {
    const dLat = b.latitude - a.latitude;
    const dLon = b.longitude - a.longitude;
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /**
   * Redistribute resources across the network
   *
   * THEORETICAL: Share resources like a plant rhizome
   */
  private redistributeResources(): void {
    // Process each segment for resource flow
    for (const segment of this.segments.values()) {
      const source = this.nodes.get(segment.sourceNodeId);
      const target = this.nodes.get(segment.targetNodeId);

      if (!source || !target) continue;

      // Flow from higher to lower resource nodes
      const diff = source.resourceLevel - target.resourceLevel;
      const flowAmount = diff * 0.1 * segment.flowCapacity;

      if (flowAmount > 0) {
        source.resourceLevel -= flowAmount;
        target.resourceLevel += flowAmount;
        segment.currentFlow = flowAmount;
      } else {
        // Reverse flow
        const reverseFlow = Math.abs(flowAmount);
        target.resourceLevel -= reverseFlow;
        source.resourceLevel += reverseFlow;
        segment.currentFlow = -reverseFlow;
      }
    }

    this.emit('resourcesRedistributed', {
      totalFlow: Array.from(this.segments.values())
        .reduce((sum, s) => sum + Math.abs(s.currentFlow), 0)
    });
  }

  /**
   * Check nodes for dormancy conditions
   *
   * THEORETICAL: Low-energy nodes become dormant
   */
  private checkDormancy(): void {
    for (const node of this.nodes.values()) {
      if (node.growthEnergy < this.config.dormancyThreshold && node.isActive) {
        node.isActive = false;
        node.canSprout = false;
        node.segmentType = SegmentType.DORMANT;

        this.emit('nodeWentDormant', { nodeId: node.nodeId });
      }
    }
  }

  /**
   * Reactivate a dormant node
   *
   * THEORETICAL: Provide energy to wake up a dormant node
   */
  reactivateNode(nodeId: string, energy: number): boolean {
    const node = this.nodes.get(nodeId);
    if (!node || node.isActive) return false;

    node.growthEnergy = energy;
    node.isActive = true;
    node.canSprout = energy > 0.3;
    node.segmentType = SegmentType.SECONDARY;

    this.emit('nodeReactivated', { nodeId, energy });

    return true;
  }

  /**
   * Get count of active nodes
   */
  private getActiveNodeCount(): number {
    return Array.from(this.nodes.values()).filter(n => n.isActive).length;
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the full network structure
   */
  getNetwork(): {
    nodes: RhizomeNode[];
    segments: GrowthSegment[];
  } {
    return {
      nodes: Array.from(this.nodes.values()),
      segments: Array.from(this.segments.values())
    };
  }

  /**
   * Get a specific node
   */
  getNode(nodeId: string): RhizomeNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes at a specific depth
   */
  getNodesAtDepth(depth: number): RhizomeNode[] {
    return Array.from(this.nodes.values()).filter(n => n.depth === depth);
  }

  /**
   * Get network statistics
   */
  getStats(): {
    totalNodes: number;
    activeNodes: number;
    dormantNodes: number;
    totalSegments: number;
    maxDepth: number;
    averageChildren: number;
    totalWavesLaunched: number;
    activeWaves: number;
  } {
    const nodes = Array.from(this.nodes.values());
    const activeNodes = nodes.filter(n => n.isActive);
    const dormantNodes = nodes.filter(n => !n.isActive);

    const maxDepth = nodes.reduce((max, n) => Math.max(max, n.depth), 0);
    const avgChildren = nodes.length > 0
      ? nodes.reduce((sum, n) => sum + n.childIds.length, 0) / nodes.length
      : 0;

    return {
      totalNodes: nodes.length,
      activeNodes: activeNodes.length,
      dormantNodes: dormantNodes.length,
      totalSegments: this.segments.size,
      maxDepth,
      averageChildren: avgChildren,
      totalWavesLaunched: this.totalWavesLaunched,
      activeWaves: this.activeWaves.size
    };
  }

  /**
   * Export network to GeoJSON for visualization
   *
   * THEORETICAL: Create visualizable output
   */
  toGeoJSON(): object {
    const features: object[] = [];

    // Add nodes as points
    for (const node of this.nodes.values()) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [node.location.longitude, node.location.latitude]
        },
        properties: {
          id: node.nodeId,
          type: 'rhizome_node',
          segmentType: node.segmentType,
          depth: node.depth,
          isActive: node.isActive,
          growthEnergy: node.growthEnergy,
          resourceLevel: node.resourceLevel
        }
      });
    }

    // Add segments as lines
    for (const segment of this.segments.values()) {
      const source = this.nodes.get(segment.sourceNodeId);
      const target = this.nodes.get(segment.targetNodeId);

      if (source && target) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [source.location.longitude, source.location.latitude],
              [target.location.longitude, target.location.latitude]
            ]
          },
          properties: {
            id: segment.segmentId,
            type: 'rhizome_segment',
            segmentType: segment.type,
            direction: segment.direction,
            health: segment.health,
            currentFlow: segment.currentFlow
          }
        });
      }
    }

    return {
      type: 'FeatureCollection',
      features
    };
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a lateral growth coordinator with default settings
 *
 * THEORETICAL: Factory for creating growth coordinators
 */
export function createLateralGrowth(nodeId: string): RhizomeLateralGrowth {
  return new RhizomeLateralGrowth({ nodeId });
}

/**
 * Create an aggressive growth coordinator
 *
 * THEORETICAL: Optimized for rapid expansion
 */
export function createAggressiveGrowth(nodeId: string): RhizomeLateralGrowth {
  return new RhizomeLateralGrowth({
    nodeId,
    maxDepth: 15,
    maxChildren: 8,
    energyDecay: 0.05,
    growthInterval: 2000,
    dormancyThreshold: 0.05
  });
}

/**
 * Create a conservative growth coordinator
 *
 * THEORETICAL: Optimized for resource efficiency
 */
export function createConservativeGrowth(nodeId: string): RhizomeLateralGrowth {
  return new RhizomeLateralGrowth({
    nodeId,
    maxDepth: 5,
    maxChildren: 4,
    energyDecay: 0.2,
    resourceSharingRatio: 0.5,
    growthInterval: 10000,
    dormancyThreshold: 0.2
  });
}

// ============================================================================
// DISCLAIMER
// ============================================================================
/*
 * IMPORTANT NOTICE:
 *
 * This code is part of a THEORETICAL FRAMEWORK exploring concepts for
 * horizontal network expansion inspired by plant rhizome systems.
 *
 * It is NOT:
 * - A working network expansion system
 * - A proven technology
 * - Ready for production deployment
 * - An energy distribution solution
 *
 * It IS:
 * - An educational exploration of bio-inspired network growth
 * - Based on real botanical research on rhizome behavior
 * - A conceptual framework for community discussion
 *
 * References:
 * - Hutchings & de Kroon, "Foraging in Plants: the Role of Morphological
 *   Plasticity in Resource Acquisition", Advances in Ecological Research 1994
 * - de Kroon & Hutchings, "Morphological Plasticity in Clonal Plants"
 *   Journal of Ecology 1995
 */
