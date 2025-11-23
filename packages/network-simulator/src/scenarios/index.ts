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
