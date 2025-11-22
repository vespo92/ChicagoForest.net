/**
 * Redundancy Planning System
 *
 * DISCLAIMER: This is a THEORETICAL framework inspired by biological systems.
 * This code represents a conceptual design for network redundancy and is NOT
 * a working energy distribution system.
 *
 * AI-GENERATED CONTENT: Created as part of the Chicago Plasma Forest Network
 * theoretical framework - an educational project exploring decentralized energy.
 *
 * BIOLOGICAL INSPIRATION:
 * Based on redundancy patterns in biological networks:
 *
 * - Vascular plant redundancy (multiple vessels for water transport)
 *   Brodribb et al., "Leaf Maximum Photosynthetic Rate and Venation"
 *   Plant Physiology 144(3):1890-1898, 2007
 *   DOI: 10.1104/pp.107.101352
 *
 * - Brain network redundancy and fault tolerance
 *   Sporns, "Network Analysis, Complexity, and Brain Function"
 *   Complexity 8(1):56-60, 2002
 *   DOI: 10.1002/cplx.10047
 *
 * - Physarum's robust network design
 *   Tero et al., Science 2010 - networks maintain function even with damage
 */

import { EventEmitter } from 'events';

// ============================================================================
// THEORETICAL FRAMEWORK - NOT OPERATIONAL
// ============================================================================

/**
 * Redundancy Levels
 *
 * THEORETICAL: Different levels of protection against failure
 */
export enum RedundancyLevel {
  /** No redundancy - single point of failure */
  NONE = 0,

  /** N+1 redundancy */
  STANDARD = 1,

  /** N+2 redundancy */
  ENHANCED = 2,

  /** Full mesh redundancy */
  CRITICAL = 3
}

/**
 * Criticality Assessment
 *
 * THEORETICAL: How critical a node or path is to network function
 */
export interface CriticalityAssessment {
  /** Entity being assessed */
  entityId: string;

  /** Entity type */
  entityType: 'node' | 'path' | 'region';

  /** Criticality score (0-100) */
  criticalityScore: number;

  /** Impact of failure */
  failureImpact: {
    /** Percentage of network affected */
    affectedPercentage: number;

    /** Estimated recovery time (seconds) */
    recoveryTime: number;

    /** Cascade risk (0-1) */
    cascadeRisk: number;
  };

  /** Required redundancy level */
  requiredRedundancy: RedundancyLevel;

  /** Current redundancy level */
  currentRedundancy: RedundancyLevel;

  /** Redundancy gap */
  redundancyGap: number;
}

/**
 * Redundant Path
 *
 * THEORETICAL: Alternative route between two points
 */
export interface RedundantPath {
  /** Path identifier */
  pathId: string;

  /** Source node */
  sourceNodeId: string;

  /** Destination node */
  destinationNodeId: string;

  /** Intermediate nodes */
  intermediateNodes: string[];

  /** Path type */
  pathType: 'primary' | 'secondary' | 'emergency';

  /** Path capacity */
  capacity: number;

  /** Path latency (relative units) */
  latency: number;

  /** Disjointness from primary (0-1) */
  disjointness: number;

  /** Current status */
  status: 'active' | 'standby' | 'degraded' | 'failed';
}

/**
 * Redundancy Zone
 *
 * THEORETICAL: A region with specific redundancy requirements,
 * similar to how organisms have varying protection for different tissues.
 */
export interface RedundancyZone {
  /** Zone identifier */
  zoneId: string;

  /** Zone name */
  name: string;

  /** Zone bounds */
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };

  /** Required redundancy level */
  requiredLevel: RedundancyLevel;

  /** Current redundancy level */
  currentLevel: RedundancyLevel;

  /** Nodes in zone */
  nodeIds: string[];

  /** Zone criticality */
  criticality: 'low' | 'medium' | 'high' | 'critical';

  /** Compliance status */
  compliant: boolean;
}

/**
 * Redundancy Metric
 *
 * THEORETICAL: Measurements of network redundancy
 */
export interface RedundancyMetrics {
  /** Overall redundancy score (0-100) */
  overallScore: number;

  /** Percentage of nodes with adequate redundancy */
  nodeRedundancyCoverage: number;

  /** Percentage of paths with backups */
  pathRedundancyCoverage: number;

  /** Average path diversity (0-1) */
  averagePathDiversity: number;

  /** Single point of failure count */
  singlePointsOfFailure: number;

  /** Critical paths without redundancy */
  unprotectedCriticalPaths: number;

  /** Zone compliance percentage */
  zoneCompliance: number;
}

/**
 * Redundancy Planning Manager
 *
 * THEORETICAL FRAMEWORK: Plans and manages network redundancy,
 * inspired by how biological systems maintain resilience.
 */
export class RedundancyPlanningManager extends EventEmitter {
  private nodes: Map<string, { id: string; location: { lat: number; lon: number }; capacity: number }> = new Map();
  private paths: Map<string, RedundantPath> = new Map();
  private zones: Map<string, RedundancyZone> = new Map();
  private assessments: Map<string, CriticalityAssessment> = new Map();

  // Redundancy parameters inspired by biological systems
  private readonly params = {
    /** Minimum acceptable redundancy level */
    minRedundancyLevel: RedundancyLevel.STANDARD,

    /** Maximum single point of failure tolerance */
    maxSPOF: 5,

    /** Target path diversity */
    targetDiversity: 0.7,

    /** Critical node threshold (connectivity) */
    criticalNodeThreshold: 0.1
  };

  constructor() {
    super();
    this.initializeDefaultZones();
  }

  /**
   * Initialize default redundancy zones
   */
  private initializeDefaultZones(): void {
    // Chicago downtown - critical zone
    this.zones.set('downtown', {
      zoneId: 'downtown',
      name: 'Downtown Chicago',
      bounds: { minLat: 41.87, maxLat: 41.90, minLon: -87.65, maxLon: -87.62 },
      requiredLevel: RedundancyLevel.CRITICAL,
      currentLevel: RedundancyLevel.NONE,
      nodeIds: [],
      criticality: 'critical',
      compliant: false
    });

    // Residential areas - standard zone
    this.zones.set('residential', {
      zoneId: 'residential',
      name: 'Residential Areas',
      bounds: { minLat: 41.75, maxLat: 42.0, minLon: -87.8, maxLon: -87.55 },
      requiredLevel: RedundancyLevel.STANDARD,
      currentLevel: RedundancyLevel.NONE,
      nodeIds: [],
      criticality: 'medium',
      compliant: false
    });
  }

  /**
   * Register a node for redundancy planning
   */
  registerNode(nodeId: string, location: { lat: number; lon: number }, capacity: number): void {
    this.nodes.set(nodeId, { id: nodeId, location, capacity });

    // Assign to zone
    for (const zone of this.zones.values()) {
      if (this.isInZone(location, zone)) {
        zone.nodeIds.push(nodeId);
      }
    }

    // Assess criticality
    this.assessCriticality(nodeId, 'node');

    this.emit('nodeRegistered', { nodeId, location, capacity });
  }

  /**
   * Check if location is within a zone
   */
  private isInZone(location: { lat: number; lon: number }, zone: RedundancyZone): boolean {
    return (
      location.lat >= zone.bounds.minLat &&
      location.lat <= zone.bounds.maxLat &&
      location.lon >= zone.bounds.minLon &&
      location.lon <= zone.bounds.maxLon
    );
  }

  /**
   * Assess criticality of a network entity
   *
   * THEORETICAL: Similar to how organisms prioritize protection
   * for vital organs vs less critical tissues.
   */
  assessCriticality(entityId: string, entityType: 'node' | 'path' | 'region'): CriticalityAssessment {
    console.log(`[THEORETICAL] Assessing criticality of ${entityType} ${entityId}...`);

    let criticalityScore = 50; // Default
    let affectedPercentage = 0;
    let recoveryTime = 3600;
    let cascadeRisk = 0.1;

    if (entityType === 'node') {
      const node = this.nodes.get(entityId);
      if (node) {
        // Calculate based on connectivity and capacity
        const connectionCount = this.countConnections(entityId);
        const networkSize = this.nodes.size || 1;

        criticalityScore = Math.min(100, (connectionCount / networkSize) * 100 + (node.capacity / 100) * 20);
        affectedPercentage = connectionCount / networkSize * 100;
        cascadeRisk = connectionCount > networkSize * 0.2 ? 0.7 : 0.2;
        recoveryTime = 3600 * (criticalityScore / 50);
      }
    } else if (entityType === 'path') {
      const path = this.paths.get(entityId);
      if (path) {
        criticalityScore = path.pathType === 'primary' ? 80 : path.pathType === 'secondary' ? 50 : 30;
        affectedPercentage = 2; // Path affects fewer nodes directly
        cascadeRisk = path.pathType === 'primary' ? 0.5 : 0.1;
      }
    }

    // Determine required redundancy
    let requiredRedundancy = RedundancyLevel.NONE;
    if (criticalityScore >= 80) {
      requiredRedundancy = RedundancyLevel.CRITICAL;
    } else if (criticalityScore >= 60) {
      requiredRedundancy = RedundancyLevel.ENHANCED;
    } else if (criticalityScore >= 30) {
      requiredRedundancy = RedundancyLevel.STANDARD;
    }

    // Get current redundancy
    const currentRedundancy = this.getCurrentRedundancy(entityId, entityType);

    const assessment: CriticalityAssessment = {
      entityId,
      entityType,
      criticalityScore,
      failureImpact: {
        affectedPercentage,
        recoveryTime,
        cascadeRisk
      },
      requiredRedundancy,
      currentRedundancy,
      redundancyGap: Math.max(0, requiredRedundancy - currentRedundancy)
    };

    this.assessments.set(entityId, assessment);
    this.emit('criticalityAssessed', assessment);

    return assessment;
  }

  /**
   * Count connections for a node
   */
  private countConnections(nodeId: string): number {
    let count = 0;
    for (const path of this.paths.values()) {
      if (path.sourceNodeId === nodeId ||
          path.destinationNodeId === nodeId ||
          path.intermediateNodes.includes(nodeId)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get current redundancy level for an entity
   */
  private getCurrentRedundancy(entityId: string, entityType: 'node' | 'path' | 'region'): RedundancyLevel {
    if (entityType === 'node') {
      const connections = this.countConnections(entityId);
      if (connections >= 4) return RedundancyLevel.CRITICAL;
      if (connections >= 3) return RedundancyLevel.ENHANCED;
      if (connections >= 2) return RedundancyLevel.STANDARD;
      return RedundancyLevel.NONE;
    }

    if (entityType === 'path') {
      const path = this.paths.get(entityId);
      if (!path) return RedundancyLevel.NONE;

      // Check for alternative paths
      const alternatives = this.findAlternativePaths(path.sourceNodeId, path.destinationNodeId);
      return Math.min(RedundancyLevel.CRITICAL, alternatives.length) as RedundancyLevel;
    }

    return RedundancyLevel.NONE;
  }

  /**
   * Plan redundant paths
   *
   * THEORETICAL: Like leaf venation creating multiple pathways
   * for water transport, ensuring survival if one path is damaged.
   *
   * Reference: Brodribb et al., Plant Physiology 2007
   */
  planRedundantPaths(sourceId: string, destinationId: string): RedundantPath[] {
    console.log(`[THEORETICAL] Planning redundant paths from ${sourceId} to ${destinationId}...`);

    const plannedPaths: RedundantPath[] = [];

    // Primary path (most direct)
    const primaryPath = this.computePath(sourceId, destinationId, 'primary');
    if (primaryPath) {
      plannedPaths.push(primaryPath);
      this.paths.set(primaryPath.pathId, primaryPath);
    }

    // Secondary path (disjoint from primary)
    const secondaryPath = this.computeDisjointPath(sourceId, destinationId, primaryPath?.intermediateNodes || []);
    if (secondaryPath) {
      plannedPaths.push(secondaryPath);
      this.paths.set(secondaryPath.pathId, secondaryPath);
    }

    // Emergency path (if needed for critical routes)
    const assessment = this.assessments.get(sourceId);
    if (assessment && assessment.requiredRedundancy >= RedundancyLevel.CRITICAL) {
      const emergencyPath = this.computeDisjointPath(
        sourceId,
        destinationId,
        [...(primaryPath?.intermediateNodes || []), ...(secondaryPath?.intermediateNodes || [])]
      );
      if (emergencyPath) {
        emergencyPath.pathType = 'emergency';
        plannedPaths.push(emergencyPath);
        this.paths.set(emergencyPath.pathId, emergencyPath);
      }
    }

    this.emit('pathsPlanned', { sourceId, destinationId, pathCount: plannedPaths.length });

    return plannedPaths;
  }

  /**
   * Compute a path between nodes
   */
  private computePath(sourceId: string, destinationId: string, pathType: RedundantPath['pathType']): RedundantPath | null {
    // Simplified path computation
    const intermediateNodes: string[] = [];

    // Add some intermediate nodes based on distance
    const source = this.nodes.get(sourceId);
    const destination = this.nodes.get(destinationId);

    if (!source || !destination) return null;

    // Find intermediate nodes
    for (const [nodeId, node] of this.nodes.entries()) {
      if (nodeId !== sourceId && nodeId !== destinationId) {
        const distToSource = Math.sqrt(
          Math.pow(node.location.lat - source.location.lat, 2) +
          Math.pow(node.location.lon - source.location.lon, 2)
        );
        const distToDest = Math.sqrt(
          Math.pow(node.location.lat - destination.location.lat, 2) +
          Math.pow(node.location.lon - destination.location.lon, 2)
        );
        const directDist = Math.sqrt(
          Math.pow(destination.location.lat - source.location.lat, 2) +
          Math.pow(destination.location.lon - source.location.lon, 2)
        );

        // Include if it's on a reasonable path
        if (distToSource + distToDest < directDist * 1.5) {
          intermediateNodes.push(nodeId);
        }
      }
    }

    return {
      pathId: `path-${sourceId}-${destinationId}-${pathType}-${Date.now()}`,
      sourceNodeId: sourceId,
      destinationNodeId: destinationId,
      intermediateNodes: intermediateNodes.slice(0, 3),
      pathType,
      capacity: Math.min(source.capacity, destination.capacity),
      latency: intermediateNodes.length + 1,
      disjointness: pathType === 'primary' ? 0 : 0.5,
      status: pathType === 'primary' ? 'active' : 'standby'
    };
  }

  /**
   * Compute a path disjoint from existing paths
   *
   * THEORETICAL: Like how vascular plants develop alternative
   * transport pathways that don't share common vessels.
   */
  private computeDisjointPath(
    sourceId: string,
    destinationId: string,
    excludeNodes: string[]
  ): RedundantPath | null {
    const path = this.computePath(sourceId, destinationId, 'secondary');
    if (!path) return null;

    // Filter out excluded nodes
    path.intermediateNodes = path.intermediateNodes.filter(n => !excludeNodes.includes(n));

    // Calculate disjointness
    const originalLength = path.intermediateNodes.length;
    path.disjointness = originalLength > 0
      ? path.intermediateNodes.length / originalLength
      : 1;

    return path;
  }

  /**
   * Find alternative paths between two nodes
   */
  findAlternativePaths(sourceId: string, destinationId: string): RedundantPath[] {
    const alternatives: RedundantPath[] = [];

    for (const path of this.paths.values()) {
      if (path.sourceNodeId === sourceId && path.destinationNodeId === destinationId) {
        alternatives.push(path);
      }
    }

    return alternatives;
  }

  /**
   * Identify single points of failure
   *
   * THEORETICAL: Critical nodes whose failure would disconnect
   * the network, similar to vital arteries in organisms.
   */
  identifySinglePointsOfFailure(): string[] {
    console.log('[THEORETICAL] Identifying single points of failure...');

    const spofs: string[] = [];

    for (const nodeId of this.nodes.keys()) {
      // A node is SPOF if its removal disconnects any part of the network
      const wouldDisconnect = this.checkDisconnection(nodeId);

      if (wouldDisconnect) {
        spofs.push(nodeId);
      }
    }

    this.emit('spofsIdentified', { count: spofs.length, nodeIds: spofs });

    return spofs;
  }

  /**
   * Check if removing a node would disconnect the network
   */
  private checkDisconnection(removeNodeId: string): boolean {
    // Simplified check - in reality would use graph connectivity algorithms
    const connectedNodes = new Set<string>();
    const toVisit: string[] = [];

    // Start from any node other than the removed one
    for (const nodeId of this.nodes.keys()) {
      if (nodeId !== removeNodeId) {
        toVisit.push(nodeId);
        break;
      }
    }

    while (toVisit.length > 0) {
      const current = toVisit.pop()!;
      if (connectedNodes.has(current)) continue;
      connectedNodes.add(current);

      // Find connected nodes via paths
      for (const path of this.paths.values()) {
        if (path.intermediateNodes.includes(removeNodeId)) continue;

        if (path.sourceNodeId === current && !connectedNodes.has(path.destinationNodeId)) {
          toVisit.push(path.destinationNodeId);
        }
        if (path.destinationNodeId === current && !connectedNodes.has(path.sourceNodeId)) {
          toVisit.push(path.sourceNodeId);
        }
      }
    }

    // Check if all nodes (except removed) are connected
    return connectedNodes.size < this.nodes.size - 1;
  }

  /**
   * Generate redundancy improvement plan
   *
   * THEORETICAL: Create actionable steps to improve redundancy
   */
  generateImprovementPlan(): Array<{
    action: string;
    targetId: string;
    priority: number;
    expectedImprovement: number;
  }> {
    console.log('[THEORETICAL] Generating redundancy improvement plan...');

    const plan: Array<{
      action: string;
      targetId: string;
      priority: number;
      expectedImprovement: number;
    }> = [];

    // Address single points of failure
    const spofs = this.identifySinglePointsOfFailure();
    for (const spof of spofs) {
      plan.push({
        action: 'add_redundant_connection',
        targetId: spof,
        priority: 100,
        expectedImprovement: 20
      });
    }

    // Address redundancy gaps
    for (const assessment of this.assessments.values()) {
      if (assessment.redundancyGap > 0) {
        plan.push({
          action: assessment.entityType === 'node' ? 'add_backup_node' : 'add_backup_path',
          targetId: assessment.entityId,
          priority: assessment.criticalityScore,
          expectedImprovement: assessment.redundancyGap * 10
        });
      }
    }

    // Sort by priority
    plan.sort((a, b) => b.priority - a.priority);

    this.emit('improvementPlanGenerated', { actionCount: plan.length });

    return plan;
  }

  /**
   * Get redundancy metrics
   */
  getMetrics(): RedundancyMetrics {
    let adequateNodes = 0;
    let pathsWithBackup = 0;
    let totalDiversity = 0;
    let zoneCompliant = 0;

    // Count nodes with adequate redundancy
    for (const nodeId of this.nodes.keys()) {
      const assessment = this.assessments.get(nodeId);
      if (assessment && assessment.redundancyGap === 0) {
        adequateNodes++;
      }
    }

    // Count paths with backups and diversity
    const primaryPaths = Array.from(this.paths.values()).filter(p => p.pathType === 'primary');
    for (const primary of primaryPaths) {
      const alternatives = this.findAlternativePaths(primary.sourceNodeId, primary.destinationNodeId);
      if (alternatives.length > 1) {
        pathsWithBackup++;
        totalDiversity += alternatives.reduce((sum, a) => sum + a.disjointness, 0) / alternatives.length;
      }
    }

    // Check zone compliance
    for (const zone of this.zones.values()) {
      if (zone.currentLevel >= zone.requiredLevel) {
        zoneCompliant++;
      }
    }

    const spofs = this.identifySinglePointsOfFailure();
    const unprotectedCritical = Array.from(this.assessments.values())
      .filter(a => a.entityType === 'path' && a.criticalityScore > 70 && a.redundancyGap > 0)
      .length;

    const nodeCount = this.nodes.size || 1;
    const pathCount = primaryPaths.length || 1;
    const zoneCount = this.zones.size || 1;

    return {
      overallScore: Math.max(0, 100 - spofs.length * 10 - unprotectedCritical * 5),
      nodeRedundancyCoverage: (adequateNodes / nodeCount) * 100,
      pathRedundancyCoverage: (pathsWithBackup / pathCount) * 100,
      averagePathDiversity: pathsWithBackup > 0 ? totalDiversity / pathsWithBackup : 0,
      singlePointsOfFailure: spofs.length,
      unprotectedCriticalPaths: unprotectedCritical,
      zoneCompliance: (zoneCompliant / zoneCount) * 100
    };
  }

  /**
   * Update zone redundancy levels
   */
  updateZoneRedundancy(): void {
    for (const zone of this.zones.values()) {
      if (zone.nodeIds.length === 0) {
        zone.currentLevel = RedundancyLevel.NONE;
        continue;
      }

      // Average redundancy of nodes in zone
      let totalRedundancy = 0;
      for (const nodeId of zone.nodeIds) {
        totalRedundancy += this.getCurrentRedundancy(nodeId, 'node');
      }

      zone.currentLevel = Math.floor(totalRedundancy / zone.nodeIds.length) as RedundancyLevel;
      zone.compliant = zone.currentLevel >= zone.requiredLevel;
    }
  }
}

// ============================================================================
// DISCLAIMER
// ============================================================================
/*
 * IMPORTANT NOTICE:
 *
 * This code is part of a THEORETICAL FRAMEWORK exploring concepts for
 * network redundancy planning inspired by biological systems.
 *
 * It is NOT:
 * - A working redundancy system
 * - A proven technology
 * - Ready for production deployment
 * - An actual infrastructure planning tool
 *
 * It IS:
 * - An educational exploration of redundancy concepts
 * - Inspired by biological fault tolerance (vascular networks, neural redundancy)
 * - A conceptual framework for community discussion
 *
 * For actual redundancy planning, please consult established network
 * engineering practices and reliability engineering standards.
 */
