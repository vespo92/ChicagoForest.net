/**
 * Simulation Scenarios
 *
 * Pre-defined scenarios for testing network behavior.
 */

import type { SimulationConfig } from '../index';

export interface Scenario {
  name: string;
  description: string;
  config: Partial<SimulationConfig>;
  events: ScheduledEvent[];
}

export interface ScheduledEvent {
  atTick: number;
  action: 'fail_node' | 'recover_node' | 'partition' | 'heal_partition' | 'spike_traffic';
  targets?: string[];
  data?: Record<string, unknown>;
}

export const scenarios: Record<string, Scenario> = {
  normalOperation: {
    name: 'Normal Operation',
    description: 'Simulate standard network operation with low failure rates',
    config: {
      nodeCount: 50,
      networkTopology: 'mesh',
      failureRate: 0.001,
      recoveryRate: 0.1,
    },
    events: [],
  },

  cascadingFailure: {
    name: 'Cascading Failure',
    description: 'Simulate a cascading failure starting from hub nodes',
    config: {
      nodeCount: 100,
      networkTopology: 'star',
      failureRate: 0.05,
      recoveryRate: 0.02,
    },
    events: [
      { atTick: 100, action: 'fail_node', targets: ['node-0'] }, // Hub fails
    ],
  },

  networkPartition: {
    name: 'Network Partition',
    description: 'Simulate a network split into isolated segments',
    config: {
      nodeCount: 30,
      networkTopology: 'mesh',
      failureRate: 0,
      recoveryRate: 0,
    },
    events: [
      { atTick: 50, action: 'partition', data: { groups: 2 } },
      { atTick: 200, action: 'heal_partition' },
    ],
  },

  rapidGrowth: {
    name: 'Rapid Growth',
    description: 'Simulate rapid network expansion (spore propagation)',
    config: {
      nodeCount: 10,
      networkTopology: 'random',
      failureRate: 0.005,
      recoveryRate: 0.2,
    },
    events: Array.from({ length: 20 }, (_, i) => ({
      atTick: i * 10,
      action: 'spike_traffic' as const,
      data: { newNodes: 5 },
    })),
  },

  stressTest: {
    name: 'Stress Test',
    description: 'High load stress test with aggressive failure injection',
    config: {
      nodeCount: 200,
      networkTopology: 'mesh',
      failureRate: 0.1,
      recoveryRate: 0.15,
    },
    events: [],
  },

  educationalDemo: {
    name: 'Educational Demo',
    description: 'Slow-paced demo for educational visualization',
    config: {
      nodeCount: 15,
      networkTopology: 'ring',
      simulationDurationMs: 120000,
      tickIntervalMs: 500,
      failureRate: 0.01,
      recoveryRate: 0.05,
    },
    events: [
      { atTick: 20, action: 'fail_node', targets: ['node-3'] },
      { atTick: 40, action: 'recover_node', targets: ['node-3'] },
      { atTick: 60, action: 'partition', data: { groups: 2 } },
      { atTick: 100, action: 'heal_partition' },
    ],
  },

  // Attack Scenarios
  sybilAttack: {
    name: 'Sybil Attack',
    description: 'Simulate malicious nodes flooding the network with fake identities',
    config: {
      nodeCount: 50,
      networkTopology: 'mesh',
      failureRate: 0.02,
      recoveryRate: 0.05,
    },
    events: [
      { atTick: 50, action: 'spike_traffic', data: { maliciousNodes: 20, type: 'sybil' } },
      { atTick: 100, action: 'spike_traffic', data: { maliciousNodes: 30, type: 'sybil' } },
    ],
  },

  eclipseAttack: {
    name: 'Eclipse Attack',
    description: 'Simulate attackers isolating a target node from honest peers',
    config: {
      nodeCount: 30,
      networkTopology: 'mesh',
      failureRate: 0,
      recoveryRate: 0.1,
    },
    events: [
      { atTick: 30, action: 'partition', targets: ['node-5'], data: { isolated: true } },
      { atTick: 80, action: 'fail_node', targets: ['node-4', 'node-6', 'node-7'] },
    ],
  },

  routingAttack: {
    name: 'Routing Attack',
    description: 'Simulate BGP-style routing manipulation',
    config: {
      nodeCount: 40,
      networkTopology: 'tree',
      failureRate: 0.01,
      recoveryRate: 0.08,
    },
    events: [
      { atTick: 40, action: 'spike_traffic', data: { type: 'route_hijack', affectedPaths: 5 } },
      { atTick: 70, action: 'partition', data: { groups: 3 } },
    ],
  },

  ddosAttack: {
    name: 'DDoS Attack',
    description: 'Simulate distributed denial of service attack on key nodes',
    config: {
      nodeCount: 60,
      networkTopology: 'star',
      failureRate: 0.15,
      recoveryRate: 0.02,
    },
    events: [
      { atTick: 20, action: 'spike_traffic', data: { type: 'ddos', intensity: 'high' } },
      { atTick: 30, action: 'fail_node', targets: ['node-0'] }, // Hub overwhelmed
      { atTick: 60, action: 'recover_node', targets: ['node-0'] },
    ],
  },

  // Scalability Scenarios
  scaleTest100: {
    name: 'Scale Test - 100 Nodes',
    description: 'Baseline scalability test with 100 nodes',
    config: {
      nodeCount: 100,
      networkTopology: 'mesh',
      failureRate: 0.005,
      recoveryRate: 0.1,
      tickIntervalMs: 50,
    },
    events: [],
  },

  scaleTest1000: {
    name: 'Scale Test - 1000 Nodes',
    description: 'Large scale test with 1000 nodes',
    config: {
      nodeCount: 1000,
      networkTopology: 'random',
      failureRate: 0.002,
      recoveryRate: 0.08,
      tickIntervalMs: 100,
    },
    events: [],
  },

  scaleTest10000: {
    name: 'Scale Test - 10000 Nodes',
    description: 'Massive scale stress test with 10000 nodes',
    config: {
      nodeCount: 10000,
      networkTopology: 'random',
      failureRate: 0.001,
      recoveryRate: 0.05,
      tickIntervalMs: 200,
    },
    events: [],
  },

  sporePropagation: {
    name: 'Spore Propagation',
    description: 'Simulate organic network growth via spore propagation',
    config: {
      nodeCount: 5,
      networkTopology: 'random',
      failureRate: 0.001,
      recoveryRate: 0.2,
      simulationDurationMs: 180000,
    },
    events: [
      ...Array.from({ length: 50 }, (_, i) => ({
        atTick: i * 5 + 10,
        action: 'spike_traffic' as const,
        data: { newNodes: Math.floor(Math.random() * 3) + 1, type: 'spore_germination' },
      })),
    ],
  },
};

export function getScenario(name: string): Scenario | undefined {
  return scenarios[name];
}

export function listScenarios(): { name: string; description: string }[] {
  return Object.entries(scenarios).map(([key, scenario]) => ({
    name: key,
    description: scenario.description,
  }));
}

export function createCustomScenario(
  name: string,
  description: string,
  config: Partial<SimulationConfig>,
  events: ScheduledEvent[] = []
): Scenario {
  return { name, description, config, events };
}
