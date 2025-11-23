/**
 * @chicago-forest/network-simulator
 *
 * Agent 15: Simulator - Network Simulation
 *
 * Simulate network behavior, model failures, and visualize propagation
 * patterns for testing and educational purposes.
 *
 * DISCLAIMER: This simulates the theoretical Chicago Forest Network.
 * The network itself is a conceptual framework, not an operational system.
 */

export * from './simulation';
export * from './scenarios';
export * from './visualization';

export interface SimulatedNode {
  id: string;
  position: { x: number; y: number; z?: number };
  status: 'online' | 'offline' | 'degraded' | 'booting';
  connections: string[];
  latencyMs: number;
  packetLoss: number;
  throughputMbps: number;
}

export interface SimulationConfig {
  nodeCount: number;
  networkTopology: 'mesh' | 'star' | 'ring' | 'tree' | 'random';
  simulationDurationMs: number;
  tickIntervalMs: number;
  failureRate: number;
  recoveryRate: number;
}

export interface SimulationState {
  tick: number;
  elapsedMs: number;
  nodes: Map<string, SimulatedNode>;
  events: SimulationEvent[];
  metrics: SimulationMetrics;
}

export interface SimulationEvent {
  tick: number;
  type: 'node_up' | 'node_down' | 'connection_lost' | 'packet_sent' | 'packet_received' | 'partition';
  nodeId?: string;
  data?: Record<string, unknown>;
}

export interface SimulationMetrics {
  totalPacketsSent: number;
  totalPacketsReceived: number;
  totalPacketsLost: number;
  averageLatencyMs: number;
  networkUptime: number;
  partitionCount: number;
}

export class NetworkSimulator {
  private config: SimulationConfig;
  private state: SimulationState;
  private running: boolean = false;

  constructor(config: Partial<SimulationConfig> = {}) {
    this.config = {
      nodeCount: config.nodeCount ?? 10,
      networkTopology: config.networkTopology ?? 'mesh',
      simulationDurationMs: config.simulationDurationMs ?? 60000,
      tickIntervalMs: config.tickIntervalMs ?? 100,
      failureRate: config.failureRate ?? 0.01,
      recoveryRate: config.recoveryRate ?? 0.1,
    };

    this.state = this.initializeState();
  }

  private initializeState(): SimulationState {
    const nodes = new Map<string, SimulatedNode>();

    for (let i = 0; i < this.config.nodeCount; i++) {
      const nodeId = `node-${i}`;
      nodes.set(nodeId, {
        id: nodeId,
        position: this.generatePosition(i),
        status: 'online',
        connections: [],
        latencyMs: Math.random() * 50 + 10,
        packetLoss: Math.random() * 0.05,
        throughputMbps: Math.random() * 100 + 10,
      });
    }

    // Connect nodes based on topology
    this.connectNodes(nodes);

    return {
      tick: 0,
      elapsedMs: 0,
      nodes,
      events: [],
      metrics: {
        totalPacketsSent: 0,
        totalPacketsReceived: 0,
        totalPacketsLost: 0,
        averageLatencyMs: 0,
        networkUptime: 100,
        partitionCount: 0,
      },
    };
  }

  private generatePosition(index: number): { x: number; y: number } {
    const angle = (index / this.config.nodeCount) * Math.PI * 2;
    const radius = 100;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  }

  private connectNodes(nodes: Map<string, SimulatedNode>): void {
    const nodeIds = Array.from(nodes.keys());

    switch (this.config.networkTopology) {
      case 'mesh':
        // Full mesh - everyone connects to everyone
        for (const nodeId of nodeIds) {
          const node = nodes.get(nodeId)!;
          node.connections = nodeIds.filter(id => id !== nodeId);
        }
        break;

      case 'ring':
        // Ring - each node connects to neighbors
        for (let i = 0; i < nodeIds.length; i++) {
          const node = nodes.get(nodeIds[i])!;
          const prev = nodeIds[(i - 1 + nodeIds.length) % nodeIds.length];
          const next = nodeIds[(i + 1) % nodeIds.length];
          node.connections = [prev, next];
        }
        break;

      case 'star':
        // Star - all nodes connect to central hub
        const hubId = nodeIds[0];
        const hub = nodes.get(hubId)!;
        hub.connections = nodeIds.slice(1);
        for (const nodeId of nodeIds.slice(1)) {
          nodes.get(nodeId)!.connections = [hubId];
        }
        break;

      default:
        // Random connections
        for (const nodeId of nodeIds) {
          const node = nodes.get(nodeId)!;
          const connectionCount = Math.floor(Math.random() * 3) + 1;
          const available = nodeIds.filter(id => id !== nodeId);
          node.connections = available
            .sort(() => Math.random() - 0.5)
            .slice(0, connectionCount);
        }
    }
  }

  tick(): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    this.state.tick++;
    this.state.elapsedMs += this.config.tickIntervalMs;

    // Process each node
    for (const [nodeId, node] of this.state.nodes) {
      // Random failures
      if (node.status === 'online' && Math.random() < this.config.failureRate) {
        node.status = 'offline';
        events.push({ tick: this.state.tick, type: 'node_down', nodeId });
      }

      // Recovery
      if (node.status === 'offline' && Math.random() < this.config.recoveryRate) {
        node.status = 'booting';
        setTimeout(() => {
          node.status = 'online';
        }, 1000);
        events.push({ tick: this.state.tick, type: 'node_up', nodeId });
      }
    }

    this.state.events.push(...events);
    return events;
  }

  getState(): SimulationState {
    return { ...this.state };
  }

  reset(): void {
    this.state = this.initializeState();
  }
}

export default NetworkSimulator;
