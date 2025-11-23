/**
 * Network Simulation Tests
 *
 * Tests for the core simulation engine.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  NetworkSimulator,
  SimulationConfig,
  SimulatedNode,
} from '../src/index';
import {
  simulatePacketTransmission,
  findShortestPath,
  calculateNetworkPartitions,
  simulateGrowth,
} from '../src/simulation';

describe('NetworkSimulator', () => {
  let simulator: NetworkSimulator;

  beforeEach(() => {
    simulator = new NetworkSimulator({
      nodeCount: 10,
      networkTopology: 'mesh',
      failureRate: 0,
      recoveryRate: 0,
    });
  });

  describe('initialization', () => {
    it('should create the correct number of nodes', () => {
      const state = simulator.getState();
      expect(state.nodes.size).toBe(10);
    });

    it('should initialize all nodes as online', () => {
      const state = simulator.getState();
      for (const node of state.nodes.values()) {
        expect(node.status).toBe('online');
      }
    });

    it('should connect nodes based on mesh topology', () => {
      const state = simulator.getState();
      const node = state.nodes.get('node-0');
      expect(node?.connections.length).toBe(9); // Connected to all other nodes
    });

    it('should initialize metrics at zero', () => {
      const state = simulator.getState();
      expect(state.metrics.totalPacketsSent).toBe(0);
      expect(state.metrics.totalPacketsLost).toBe(0);
      expect(state.tick).toBe(0);
    });
  });

  describe('tick', () => {
    it('should increment tick count', () => {
      simulator.tick();
      expect(simulator.getState().tick).toBe(1);
    });

    it('should increment elapsed time', () => {
      simulator.tick();
      expect(simulator.getState().elapsedMs).toBe(100); // Default tickIntervalMs
    });

    it('should return events array', () => {
      const events = simulator.tick();
      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe('topologies', () => {
    it('should create ring topology correctly', () => {
      const ringSimulator = new NetworkSimulator({
        nodeCount: 5,
        networkTopology: 'ring',
      });
      const state = ringSimulator.getState();
      const node = state.nodes.get('node-0');
      expect(node?.connections.length).toBe(2);
    });

    it('should create star topology correctly', () => {
      const starSimulator = new NetworkSimulator({
        nodeCount: 5,
        networkTopology: 'star',
      });
      const state = starSimulator.getState();
      const hub = state.nodes.get('node-0');
      const leaf = state.nodes.get('node-1');
      expect(hub?.connections.length).toBe(4);
      expect(leaf?.connections.length).toBe(1);
    });
  });

  describe('reset', () => {
    it('should reset state to initial values', () => {
      simulator.tick();
      simulator.tick();
      simulator.reset();
      const state = simulator.getState();
      expect(state.tick).toBe(0);
      expect(state.elapsedMs).toBe(0);
    });
  });
});

describe('simulatePacketTransmission', () => {
  const basePacket = {
    id: 'packet-1',
    sourceNode: 'node-0',
    targetNode: 'node-5',
    payload: { data: 'test' },
    hops: ['node-0', 'node-2', 'node-5'],
    startTime: 1000,
  };

  it('should deliver packets with zero loss rate', () => {
    const model = { baseLatencyMs: 10, jitterMs: 0, packetLossRate: 0 };
    const result = simulatePacketTransmission(basePacket, model);
    expect(result.status).toBe('delivered');
    expect(result.endTime).toBeGreaterThan(result.startTime);
  });

  it('should calculate latency based on hops', () => {
    const model = { baseLatencyMs: 10, jitterMs: 0, packetLossRate: 0 };
    const result = simulatePacketTransmission(basePacket, model);
    expect(result.endTime).toBe(1030); // 3 hops * 10ms
  });
});

describe('findShortestPath', () => {
  it('should find direct path', () => {
    const graph = new Map([
      ['A', ['B', 'C']],
      ['B', ['A', 'D']],
      ['C', ['A']],
      ['D', ['B']],
    ]);

    const path = findShortestPath(graph, 'A', 'B');
    expect(path).toEqual(['A', 'B']);
  });

  it('should find multi-hop path', () => {
    const graph = new Map([
      ['A', ['B']],
      ['B', ['A', 'C']],
      ['C', ['B', 'D']],
      ['D', ['C']],
    ]);

    const path = findShortestPath(graph, 'A', 'D');
    expect(path).toEqual(['A', 'B', 'C', 'D']);
  });

  it('should return null for unreachable nodes', () => {
    const graph = new Map([
      ['A', ['B']],
      ['B', ['A']],
      ['C', ['D']],
      ['D', ['C']],
    ]);

    const path = findShortestPath(graph, 'A', 'D');
    expect(path).toBeNull();
  });

  it('should return single node for same source and target', () => {
    const graph = new Map([['A', ['B']]]);
    const path = findShortestPath(graph, 'A', 'A');
    expect(path).toEqual(['A']);
  });
});

describe('calculateNetworkPartitions', () => {
  it('should find single partition for fully connected network', () => {
    const nodes = new Map([
      ['A', { connections: ['B', 'C'], status: 'online' }],
      ['B', { connections: ['A', 'C'], status: 'online' }],
      ['C', { connections: ['A', 'B'], status: 'online' }],
    ]);

    const partitions = calculateNetworkPartitions(nodes);
    expect(partitions.length).toBe(1);
    expect(partitions[0].length).toBe(3);
  });

  it('should find multiple partitions for disconnected network', () => {
    const nodes = new Map([
      ['A', { connections: ['B'], status: 'online' }],
      ['B', { connections: ['A'], status: 'online' }],
      ['C', { connections: ['D'], status: 'online' }],
      ['D', { connections: ['C'], status: 'online' }],
    ]);

    const partitions = calculateNetworkPartitions(nodes);
    expect(partitions.length).toBe(2);
  });

  it('should exclude offline nodes', () => {
    const nodes = new Map([
      ['A', { connections: ['B', 'C'], status: 'online' }],
      ['B', { connections: ['A', 'C'], status: 'offline' }],
      ['C', { connections: ['A', 'B'], status: 'online' }],
    ]);

    const partitions = calculateNetworkPartitions(nodes);
    expect(partitions.length).toBe(1);
    expect(partitions[0]).not.toContain('B');
  });
});

describe('simulateGrowth', () => {
  it('should return growth timeline starting from current nodes', () => {
    const timeline = simulateGrowth(10, 100, 0.5);
    expect(timeline[0]).toBe(10);
    expect(timeline[timeline.length - 1]).toBe(100);
  });

  it('should reach target nodes', () => {
    const timeline = simulateGrowth(1, 1000, 0.3);
    expect(timeline[timeline.length - 1]).toBe(1000);
  });

  it('should show exponential growth pattern', () => {
    const timeline = simulateGrowth(10, 100, 0.5);
    // Each step should be larger than previous growth
    for (let i = 2; i < timeline.length; i++) {
      const prevGrowth = timeline[i - 1] - timeline[i - 2];
      const currGrowth = timeline[i] - timeline[i - 1];
      expect(currGrowth).toBeGreaterThanOrEqual(prevGrowth);
    }
  });
});
