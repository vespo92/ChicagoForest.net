/**
 * Network Simulator
 *
 * Comprehensive network simulation for integration and E2E testing.
 * Simulates a complete Chicago Forest Network with configurable topology,
 * latency, packet loss, and failure scenarios.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId, PeerInfo, PeerAddress, Message } from '@chicago-forest/shared-types';
import { createTestNodeId, createTestPeerInfo } from '../helpers';

// ============================================================================
// Types
// ============================================================================

export interface SimulatedNode {
  id: NodeId;
  info: PeerInfo;
  connections: Set<NodeId>;
  messageQueue: Message[];
  isOnline: boolean;
  latencyMs: number;
  packetLoss: number;
}

export interface NetworkTopology {
  type: 'mesh' | 'star' | 'ring' | 'tree' | 'random';
  nodeCount: number;
  connectionDensity?: number; // 0-1, only for random topology
}

export interface NetworkConditions {
  baseLatencyMs: number;
  latencyJitter: number;
  packetLoss: number;
  bandwidth: number; // Mbps
}

export interface MessageDelivery {
  message: Message;
  from: NodeId;
  to: NodeId;
  deliveredAt: number;
  hops: number;
}

export interface NetworkSimulatorEvents {
  'node:online': (nodeId: NodeId) => void;
  'node:offline': (nodeId: NodeId) => void;
  'message:sent': (from: NodeId, to: NodeId, message: Message) => void;
  'message:delivered': (delivery: MessageDelivery) => void;
  'message:dropped': (from: NodeId, to: NodeId, reason: string) => void;
  'network:partition': (group1: NodeId[], group2: NodeId[]) => void;
  'network:healed': () => void;
}

// ============================================================================
// Network Simulator
// ============================================================================

export class NetworkSimulator extends EventEmitter<NetworkSimulatorEvents> {
  private nodes: Map<NodeId, SimulatedNode> = new Map();
  private conditions: NetworkConditions;
  private messageLog: MessageDelivery[] = [];
  private droppedMessages: Array<{ from: NodeId; to: NodeId; reason: string }> = [];
  private isPartitioned = false;
  private partitionGroups: [Set<NodeId>, Set<NodeId>] = [new Set(), new Set()];

  constructor(conditions: Partial<NetworkConditions> = {}) {
    super();
    this.conditions = {
      baseLatencyMs: conditions.baseLatencyMs ?? 10,
      latencyJitter: conditions.latencyJitter ?? 5,
      packetLoss: conditions.packetLoss ?? 0,
      bandwidth: conditions.bandwidth ?? 100,
    };
  }

  /**
   * Create a network with specified topology
   */
  createNetwork(topology: NetworkTopology): Map<NodeId, SimulatedNode> {
    this.nodes.clear();

    // Create nodes
    for (let i = 0; i < topology.nodeCount; i++) {
      const nodeId = createTestNodeId(i);
      const node: SimulatedNode = {
        id: nodeId,
        info: createTestPeerInfo({ nodeId }),
        connections: new Set(),
        messageQueue: [],
        isOnline: true,
        latencyMs: this.conditions.baseLatencyMs,
        packetLoss: this.conditions.packetLoss,
      };
      this.nodes.set(nodeId, node);
    }

    // Create connections based on topology
    const nodeIds = Array.from(this.nodes.keys());
    switch (topology.type) {
      case 'mesh':
        this.createMeshTopology(nodeIds);
        break;
      case 'star':
        this.createStarTopology(nodeIds);
        break;
      case 'ring':
        this.createRingTopology(nodeIds);
        break;
      case 'tree':
        this.createTreeTopology(nodeIds);
        break;
      case 'random':
        this.createRandomTopology(nodeIds, topology.connectionDensity ?? 0.3);
        break;
    }

    return this.nodes;
  }

  /**
   * Add a node to the network
   */
  addNode(nodeId?: NodeId): SimulatedNode {
    const id = nodeId ?? createTestNodeId(this.nodes.size);
    const node: SimulatedNode = {
      id,
      info: createTestPeerInfo({ nodeId: id }),
      connections: new Set(),
      messageQueue: [],
      isOnline: true,
      latencyMs: this.conditions.baseLatencyMs,
      packetLoss: this.conditions.packetLoss,
    };
    this.nodes.set(id, node);
    this.emit('node:online', id);
    return node;
  }

  /**
   * Remove a node from the network
   */
  removeNode(nodeId: NodeId): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // Remove all connections to this node
    for (const connectedId of node.connections) {
      const connectedNode = this.nodes.get(connectedId);
      if (connectedNode) {
        connectedNode.connections.delete(nodeId);
      }
    }

    this.nodes.delete(nodeId);
    this.emit('node:offline', nodeId);
    return true;
  }

  /**
   * Connect two nodes
   */
  connect(nodeA: NodeId, nodeB: NodeId): boolean {
    const a = this.nodes.get(nodeA);
    const b = this.nodes.get(nodeB);
    if (!a || !b) return false;

    a.connections.add(nodeB);
    b.connections.add(nodeA);
    return true;
  }

  /**
   * Disconnect two nodes
   */
  disconnect(nodeA: NodeId, nodeB: NodeId): boolean {
    const a = this.nodes.get(nodeA);
    const b = this.nodes.get(nodeB);
    if (!a || !b) return false;

    a.connections.delete(nodeB);
    b.connections.delete(nodeA);
    return true;
  }

  /**
   * Set a node online/offline
   */
  setNodeStatus(nodeId: NodeId, online: boolean): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.isOnline = online;
      if (online) {
        this.emit('node:online', nodeId);
      } else {
        this.emit('node:offline', nodeId);
      }
    }
  }

  /**
   * Send a message between nodes
   */
  async sendMessage(from: NodeId, to: NodeId, message: Message): Promise<boolean> {
    const fromNode = this.nodes.get(from);
    const toNode = this.nodes.get(to);

    if (!fromNode || !toNode) {
      this.droppedMessages.push({ from, to, reason: 'Node not found' });
      this.emit('message:dropped', from, to, 'Node not found');
      return false;
    }

    if (!fromNode.isOnline) {
      this.droppedMessages.push({ from, to, reason: 'Sender offline' });
      this.emit('message:dropped', from, to, 'Sender offline');
      return false;
    }

    if (!toNode.isOnline) {
      this.droppedMessages.push({ from, to, reason: 'Receiver offline' });
      this.emit('message:dropped', from, to, 'Receiver offline');
      return false;
    }

    // Check for network partition
    if (this.isPartitioned) {
      const fromInGroup1 = this.partitionGroups[0].has(from);
      const toInGroup1 = this.partitionGroups[0].has(to);
      if (fromInGroup1 !== toInGroup1) {
        this.droppedMessages.push({ from, to, reason: 'Network partition' });
        this.emit('message:dropped', from, to, 'Network partition');
        return false;
      }
    }

    // Simulate packet loss
    if (Math.random() < fromNode.packetLoss) {
      this.droppedMessages.push({ from, to, reason: 'Packet loss' });
      this.emit('message:dropped', from, to, 'Packet loss');
      return false;
    }

    this.emit('message:sent', from, to, message);

    // Find path and calculate hops
    const path = this.findPath(from, to);
    if (!path) {
      this.droppedMessages.push({ from, to, reason: 'No path available' });
      this.emit('message:dropped', from, to, 'No path available');
      return false;
    }

    // Simulate latency
    const totalLatency = this.calculatePathLatency(path);
    await this.delay(totalLatency);

    const delivery: MessageDelivery = {
      message,
      from,
      to,
      deliveredAt: Date.now(),
      hops: path.length - 1,
    };

    toNode.messageQueue.push(message);
    this.messageLog.push(delivery);
    this.emit('message:delivered', delivery);

    return true;
  }

  /**
   * Broadcast a message to all connected nodes
   */
  async broadcast(from: NodeId, message: Message): Promise<number> {
    const fromNode = this.nodes.get(from);
    if (!fromNode) return 0;

    let delivered = 0;
    const promises: Promise<boolean>[] = [];

    for (const connectedId of fromNode.connections) {
      promises.push(this.sendMessage(from, connectedId, message));
    }

    const results = await Promise.all(promises);
    delivered = results.filter(Boolean).length;

    return delivered;
  }

  /**
   * Create a network partition
   */
  partition(group1: NodeId[]): void {
    this.isPartitioned = true;
    this.partitionGroups[0] = new Set(group1);
    this.partitionGroups[1] = new Set(
      Array.from(this.nodes.keys()).filter((id) => !this.partitionGroups[0].has(id))
    );
    this.emit('network:partition', group1, Array.from(this.partitionGroups[1]));
  }

  /**
   * Heal network partition
   */
  healPartition(): void {
    this.isPartitioned = false;
    this.partitionGroups = [new Set(), new Set()];
    this.emit('network:healed');
  }

  /**
   * Set network conditions for a specific node
   */
  setNodeConditions(nodeId: NodeId, conditions: Partial<{ latencyMs: number; packetLoss: number }>): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      if (conditions.latencyMs !== undefined) node.latencyMs = conditions.latencyMs;
      if (conditions.packetLoss !== undefined) node.packetLoss = conditions.packetLoss;
    }
  }

  /**
   * Set global network conditions
   */
  setGlobalConditions(conditions: Partial<NetworkConditions>): void {
    Object.assign(this.conditions, conditions);
    // Apply to all nodes
    for (const node of this.nodes.values()) {
      node.latencyMs = this.conditions.baseLatencyMs;
      node.packetLoss = this.conditions.packetLoss;
    }
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: NodeId): SimulatedNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): SimulatedNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get online nodes
   */
  getOnlineNodes(): SimulatedNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.isOnline);
  }

  /**
   * Get message log
   */
  getMessageLog(): MessageDelivery[] {
    return [...this.messageLog];
  }

  /**
   * Get dropped messages
   */
  getDroppedMessages(): Array<{ from: NodeId; to: NodeId; reason: string }> {
    return [...this.droppedMessages];
  }

  /**
   * Get messages received by a node
   */
  getNodeMessages(nodeId: NodeId): Message[] {
    const node = this.nodes.get(nodeId);
    return node ? [...node.messageQueue] : [];
  }

  /**
   * Clear message queue for a node
   */
  clearNodeMessages(nodeId: NodeId): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.messageQueue = [];
    }
  }

  /**
   * Get network statistics
   */
  getStats(): {
    totalNodes: number;
    onlineNodes: number;
    totalConnections: number;
    messagesDelivered: number;
    messagesDropped: number;
    averageLatency: number;
  } {
    let totalConnections = 0;
    for (const node of this.nodes.values()) {
      totalConnections += node.connections.size;
    }

    const avgLatency =
      this.messageLog.length > 0
        ? this.messageLog.reduce((sum, d) => sum + d.hops * this.conditions.baseLatencyMs, 0) /
          this.messageLog.length
        : 0;

    return {
      totalNodes: this.nodes.size,
      onlineNodes: this.getOnlineNodes().length,
      totalConnections: totalConnections / 2, // Each connection is counted twice
      messagesDelivered: this.messageLog.length,
      messagesDropped: this.droppedMessages.length,
      averageLatency: avgLatency,
    };
  }

  /**
   * Reset the simulator
   */
  reset(): void {
    this.nodes.clear();
    this.messageLog = [];
    this.droppedMessages = [];
    this.isPartitioned = false;
    this.partitionGroups = [new Set(), new Set()];
    this.removeAllListeners();
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private createMeshTopology(nodeIds: NodeId[]): void {
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        this.connect(nodeIds[i], nodeIds[j]);
      }
    }
  }

  private createStarTopology(nodeIds: NodeId[]): void {
    if (nodeIds.length < 2) return;
    const hub = nodeIds[0];
    for (let i = 1; i < nodeIds.length; i++) {
      this.connect(hub, nodeIds[i]);
    }
  }

  private createRingTopology(nodeIds: NodeId[]): void {
    for (let i = 0; i < nodeIds.length; i++) {
      const next = (i + 1) % nodeIds.length;
      this.connect(nodeIds[i], nodeIds[next]);
    }
  }

  private createTreeTopology(nodeIds: NodeId[]): void {
    // Binary tree
    for (let i = 0; i < nodeIds.length; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < nodeIds.length) {
        this.connect(nodeIds[i], nodeIds[left]);
      }
      if (right < nodeIds.length) {
        this.connect(nodeIds[i], nodeIds[right]);
      }
    }
  }

  private createRandomTopology(nodeIds: NodeId[], density: number): void {
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        if (Math.random() < density) {
          this.connect(nodeIds[i], nodeIds[j]);
        }
      }
    }
    // Ensure connectivity - connect any isolated nodes
    for (const nodeId of nodeIds) {
      const node = this.nodes.get(nodeId);
      if (node && node.connections.size === 0) {
        // Connect to a random existing node
        const others = nodeIds.filter((id) => id !== nodeId);
        if (others.length > 0) {
          const randomPeer = others[Math.floor(Math.random() * others.length)];
          this.connect(nodeId, randomPeer);
        }
      }
    }
  }

  private findPath(from: NodeId, to: NodeId): NodeId[] | null {
    // BFS to find shortest path
    const visited = new Set<NodeId>();
    const queue: Array<{ node: NodeId; path: NodeId[] }> = [{ node: from, path: [from] }];

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;

      if (node === to) {
        return path;
      }

      if (visited.has(node)) continue;
      visited.add(node);

      const nodeData = this.nodes.get(node);
      if (!nodeData || !nodeData.isOnline) continue;

      for (const neighbor of nodeData.connections) {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, path: [...path, neighbor] });
        }
      }
    }

    return null;
  }

  private calculatePathLatency(path: NodeId[]): number {
    let totalLatency = 0;
    for (const nodeId of path) {
      const node = this.nodes.get(nodeId);
      if (node) {
        const jitter = (Math.random() - 0.5) * 2 * this.conditions.latencyJitter;
        totalLatency += node.latencyMs + jitter;
      }
    }
    return Math.max(0, totalLatency);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createNetworkSimulator(
  conditions?: Partial<NetworkConditions>
): NetworkSimulator {
  return new NetworkSimulator(conditions);
}

export function createTestNetwork(
  topology: NetworkTopology,
  conditions?: Partial<NetworkConditions>
): NetworkSimulator {
  const simulator = new NetworkSimulator(conditions);
  simulator.createNetwork(topology);
  return simulator;
}
