/**
 * Cluster Detection - Neural Network Community Detection
 *
 * Identifies clusters and communities within the mycelium network topology,
 * using algorithms inspired by both graph theory and biological neural networks.
 *
 * ⚠️ DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 */

import type { NodeId } from '@chicago-forest/shared-types';
import type { HyphalPath, NodeInfo, TopologySnapshot } from '../types';

/**
 * A detected cluster of nodes in the network
 */
export interface NetworkCluster {
  /** Unique cluster identifier */
  id: string;

  /** Nodes belonging to this cluster */
  members: Set<NodeId>;

  /** Central/hub node of the cluster */
  centroid: NodeId;

  /** Cluster density (internal connections / possible connections) */
  density: number;

  /** Cluster cohesion score (0-1) */
  cohesion: number;

  /** Separation score from other clusters (0-1) */
  separation: number;

  /** Average distance between cluster members */
  avgInternalDistance: number;

  /** Cluster formation timestamp */
  detectedAt: number;
}

/**
 * Edge representation for cluster analysis
 */
export interface ClusterEdge {
  source: NodeId;
  target: NodeId;
  weight: number;
}

/**
 * Configuration for cluster detection
 */
export interface ClusterConfig {
  /** Minimum cluster size to detect */
  minClusterSize: number;

  /** Maximum number of clusters to identify */
  maxClusters: number;

  /** Similarity threshold for joining clusters (0-1) */
  similarityThreshold: number;

  /** Use modularity optimization */
  useModularity: boolean;

  /** Resolution parameter for modularity */
  resolution: number;
}

const DEFAULT_CONFIG: ClusterConfig = {
  minClusterSize: 3,
  maxClusters: 20,
  similarityThreshold: 0.5,
  useModularity: true,
  resolution: 1.0,
};

/**
 * Cluster detection engine for mycelium network analysis
 */
export class ClusterDetector {
  private config: ClusterConfig;
  private adjacencyMatrix: Map<NodeId, Map<NodeId, number>> = new Map();
  private clusters: Map<string, NetworkCluster> = new Map();
  private nodeToCluster: Map<NodeId, string> = new Map();

  constructor(config: Partial<ClusterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Build adjacency matrix from topology snapshot
   */
  buildAdjacencyMatrix(paths: Map<string, HyphalPath>): void {
    this.adjacencyMatrix.clear();

    for (const path of paths.values()) {
      if (path.state !== 'active' && path.state !== 'growing') continue;

      const weight = this.calculateEdgeWeight(path);

      // Add bidirectional edge
      this.addEdge(path.source, path.destination, weight);

      // Add edges through hops
      const allNodes = [path.source, ...path.hops, path.destination];
      for (let i = 0; i < allNodes.length - 1; i++) {
        this.addEdge(allNodes[i], allNodes[i + 1], weight * 0.9); // Hop edges weighted slightly less
      }
    }
  }

  /**
   * Detect clusters using the Louvain modularity algorithm
   */
  detectClusters(snapshot: TopologySnapshot): NetworkCluster[] {
    this.buildAdjacencyMatrix(snapshot.paths);

    // Initialize: each node is its own cluster
    const nodes = Array.from(this.adjacencyMatrix.keys());
    let communities = new Map<NodeId, string>();
    let clusterCounter = 0;

    for (const node of nodes) {
      communities.set(node, `cluster-${clusterCounter++}`);
    }

    if (this.config.useModularity) {
      // Louvain algorithm - Phase 1: Modularity optimization
      let improved = true;
      let iterations = 0;
      const maxIterations = 100;

      while (improved && iterations < maxIterations) {
        improved = false;
        iterations++;

        for (const node of nodes) {
          const currentCluster = communities.get(node)!;
          const neighbors = this.adjacencyMatrix.get(node);
          if (!neighbors) continue;

          // Find best cluster to move to
          let bestCluster = currentCluster;
          let bestGain = 0;

          const neighborClusters = new Set<string>();
          for (const [neighbor] of neighbors) {
            neighborClusters.add(communities.get(neighbor)!);
          }

          for (const targetCluster of neighborClusters) {
            if (targetCluster === currentCluster) continue;

            const gain = this.calculateModularityGain(
              node,
              currentCluster,
              targetCluster,
              communities
            );

            if (gain > bestGain) {
              bestGain = gain;
              bestCluster = targetCluster;
            }
          }

          if (bestCluster !== currentCluster) {
            communities.set(node, bestCluster);
            improved = true;
          }
        }
      }
    } else {
      // Simple hierarchical clustering
      communities = this.hierarchicalClustering(nodes);
    }

    // Build cluster objects
    this.clusters.clear();
    this.nodeToCluster.clear();

    const clusterMembers = new Map<string, Set<NodeId>>();
    for (const [node, clusterId] of communities) {
      if (!clusterMembers.has(clusterId)) {
        clusterMembers.set(clusterId, new Set());
      }
      clusterMembers.get(clusterId)!.add(node);
      this.nodeToCluster.set(node, clusterId);
    }

    // Create cluster objects
    for (const [clusterId, members] of clusterMembers) {
      if (members.size < this.config.minClusterSize) continue;

      const cluster = this.buildCluster(clusterId, members, snapshot);
      this.clusters.set(clusterId, cluster);
    }

    // Sort by size and limit
    const sortedClusters = Array.from(this.clusters.values())
      .sort((a, b) => b.members.size - a.members.size)
      .slice(0, this.config.maxClusters);

    return sortedClusters;
  }

  /**
   * Find the cluster a node belongs to
   */
  getNodeCluster(nodeId: NodeId): NetworkCluster | undefined {
    const clusterId = this.nodeToCluster.get(nodeId);
    return clusterId ? this.clusters.get(clusterId) : undefined;
  }

  /**
   * Get all detected clusters
   */
  getClusters(): NetworkCluster[] {
    return Array.from(this.clusters.values());
  }

  /**
   * Find bridge nodes connecting different clusters
   */
  findBridgeNodes(): NodeId[] {
    const bridges: NodeId[] = [];

    for (const [node, neighbors] of this.adjacencyMatrix) {
      const nodeCluster = this.nodeToCluster.get(node);
      if (!nodeCluster) continue;

      const neighborClusters = new Set<string>();
      for (const [neighbor] of neighbors) {
        const nc = this.nodeToCluster.get(neighbor);
        if (nc) neighborClusters.add(nc);
      }

      // Node connects to multiple clusters
      if (neighborClusters.size > 1) {
        bridges.push(node);
      }
    }

    return bridges;
  }

  /**
   * Calculate inter-cluster distance
   */
  calculateInterClusterDistance(cluster1: string, cluster2: string): number {
    const c1 = this.clusters.get(cluster1);
    const c2 = this.clusters.get(cluster2);
    if (!c1 || !c2) return Infinity;

    let minDistance = Infinity;
    let totalDistance = 0;
    let edgeCount = 0;

    for (const node1 of c1.members) {
      for (const node2 of c2.members) {
        const weight = this.adjacencyMatrix.get(node1)?.get(node2);
        if (weight !== undefined) {
          const distance = 1 / weight;
          minDistance = Math.min(minDistance, distance);
          totalDistance += distance;
          edgeCount++;
        }
      }
    }

    return edgeCount > 0 ? totalDistance / edgeCount : Infinity;
  }

  // Private methods

  private addEdge(source: NodeId, target: NodeId, weight: number): void {
    if (!this.adjacencyMatrix.has(source)) {
      this.adjacencyMatrix.set(source, new Map());
    }
    if (!this.adjacencyMatrix.has(target)) {
      this.adjacencyMatrix.set(target, new Map());
    }

    // Update with max weight if edge exists
    const existingWeight = this.adjacencyMatrix.get(source)!.get(target) ?? 0;
    const newWeight = Math.max(existingWeight, weight);

    this.adjacencyMatrix.get(source)!.set(target, newWeight);
    this.adjacencyMatrix.get(target)!.set(source, newWeight);
  }

  private calculateEdgeWeight(path: HyphalPath): number {
    const { reliability, latency, bandwidth } = path.metrics;

    // Combined weight based on path quality
    const latencyScore = Math.max(0, 1 - latency / 500);
    const bandwidthScore = Math.min(1, bandwidth / 100_000_000);

    return reliability * 0.5 + latencyScore * 0.3 + bandwidthScore * 0.2;
  }

  private calculateModularityGain(
    node: NodeId,
    fromCluster: string,
    toCluster: string,
    communities: Map<NodeId, string>
  ): number {
    const neighbors = this.adjacencyMatrix.get(node);
    if (!neighbors) return 0;

    let gain = 0;
    const m = this.getTotalEdgeWeight();

    // Sum of weights to nodes in target cluster
    let sumIn = 0;
    let sumTot = 0;
    let ki = 0;

    for (const [neighbor, weight] of neighbors) {
      ki += weight;
      if (communities.get(neighbor) === toCluster) {
        sumIn += weight;
      }
    }

    // Calculate sum_tot for target cluster
    for (const [n, c] of communities) {
      if (c === toCluster) {
        const nNeighbors = this.adjacencyMatrix.get(n);
        if (nNeighbors) {
          for (const [, w] of nNeighbors) {
            sumTot += w;
          }
        }
      }
    }
    sumTot /= 2;

    // Modularity gain formula
    const res = this.config.resolution;
    gain = sumIn / m - res * ((sumTot * ki) / (2 * m * m));

    return gain;
  }

  private getTotalEdgeWeight(): number {
    let total = 0;
    for (const [, neighbors] of this.adjacencyMatrix) {
      for (const [, weight] of neighbors) {
        total += weight;
      }
    }
    return total / 2; // Each edge counted twice
  }

  private hierarchicalClustering(nodes: NodeId[]): Map<NodeId, string> {
    // Simple agglomerative clustering
    const communities = new Map<NodeId, string>();
    const clusterSets = new Map<string, Set<NodeId>>();

    // Initialize each node as its own cluster
    for (let i = 0; i < nodes.length; i++) {
      const clusterId = `cluster-${i}`;
      communities.set(nodes[i], clusterId);
      clusterSets.set(clusterId, new Set([nodes[i]]));
    }

    // Merge similar clusters
    while (clusterSets.size > this.config.maxClusters) {
      let bestPair: [string, string] | null = null;
      let bestSimilarity = 0;

      const clusterIds = Array.from(clusterSets.keys());

      for (let i = 0; i < clusterIds.length; i++) {
        for (let j = i + 1; j < clusterIds.length; j++) {
          const similarity = this.clusterSimilarity(
            clusterSets.get(clusterIds[i])!,
            clusterSets.get(clusterIds[j])!
          );

          if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
            bestPair = [clusterIds[i], clusterIds[j]];
          }
        }
      }

      if (!bestPair || bestSimilarity < this.config.similarityThreshold) break;

      // Merge clusters
      const [c1, c2] = bestPair;
      const merged = new Set([...clusterSets.get(c1)!, ...clusterSets.get(c2)!]);

      clusterSets.delete(c2);
      clusterSets.set(c1, merged);

      for (const node of merged) {
        communities.set(node, c1);
      }
    }

    return communities;
  }

  private clusterSimilarity(c1: Set<NodeId>, c2: Set<NodeId>): number {
    let totalWeight = 0;
    let edgeCount = 0;

    for (const n1 of c1) {
      for (const n2 of c2) {
        const weight = this.adjacencyMatrix.get(n1)?.get(n2);
        if (weight !== undefined) {
          totalWeight += weight;
          edgeCount++;
        }
      }
    }

    // Normalize by potential edges
    const potentialEdges = c1.size * c2.size;
    return edgeCount > 0 ? totalWeight / potentialEdges : 0;
  }

  private buildCluster(
    id: string,
    members: Set<NodeId>,
    snapshot: TopologySnapshot
  ): NetworkCluster {
    // Find centroid (most connected node within cluster)
    let centroid = Array.from(members)[0];
    let maxConnections = 0;

    for (const node of members) {
      const neighbors = this.adjacencyMatrix.get(node);
      if (!neighbors) continue;

      let internalConnections = 0;
      for (const [neighbor] of neighbors) {
        if (members.has(neighbor)) {
          internalConnections++;
        }
      }

      if (internalConnections > maxConnections) {
        maxConnections = internalConnections;
        centroid = node;
      }
    }

    // Calculate density
    const possibleEdges = (members.size * (members.size - 1)) / 2;
    let actualEdges = 0;
    let totalInternalWeight = 0;

    for (const n1 of members) {
      for (const n2 of members) {
        if (n1 >= n2) continue; // Avoid double counting
        const weight = this.adjacencyMatrix.get(n1)?.get(n2);
        if (weight !== undefined) {
          actualEdges++;
          totalInternalWeight += weight;
        }
      }
    }

    const density = possibleEdges > 0 ? actualEdges / possibleEdges : 0;
    const cohesion = actualEdges > 0 ? totalInternalWeight / actualEdges : 0;

    // Calculate separation (average distance to nodes outside cluster)
    let externalWeight = 0;
    let externalEdges = 0;

    for (const node of members) {
      const neighbors = this.adjacencyMatrix.get(node);
      if (!neighbors) continue;

      for (const [neighbor, weight] of neighbors) {
        if (!members.has(neighbor)) {
          externalWeight += weight;
          externalEdges++;
        }
      }
    }

    const separation =
      externalEdges > 0 ? 1 - externalWeight / externalEdges : 1;

    return {
      id,
      members,
      centroid,
      density,
      cohesion,
      separation,
      avgInternalDistance:
        actualEdges > 0 ? members.size / actualEdges : Infinity,
      detectedAt: Date.now(),
    };
  }
}
