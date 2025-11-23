/**
 * Scenario Tests
 *
 * Tests for simulation scenarios including attack modeling.
 */

import { describe, it, expect } from 'vitest';
import {
  scenarios,
  getScenario,
  listScenarios,
  createCustomScenario,
  Scenario,
} from '../src/scenarios';

describe('scenarios', () => {
  describe('predefined scenarios', () => {
    it('should have normalOperation scenario', () => {
      const scenario = scenarios.normalOperation;
      expect(scenario).toBeDefined();
      expect(scenario.name).toBe('Normal Operation');
      expect(scenario.config.nodeCount).toBe(50);
    });

    it('should have cascadingFailure scenario', () => {
      const scenario = scenarios.cascadingFailure;
      expect(scenario).toBeDefined();
      expect(scenario.config.nodeCount).toBe(100);
      expect(scenario.events.length).toBeGreaterThan(0);
    });

    it('should have networkPartition scenario', () => {
      const scenario = scenarios.networkPartition;
      expect(scenario).toBeDefined();
      expect(scenario.events.some(e => e.action === 'partition')).toBe(true);
    });

    it('should have educationalDemo scenario', () => {
      const scenario = scenarios.educationalDemo;
      expect(scenario).toBeDefined();
      expect(scenario.config.tickIntervalMs).toBe(500);
    });
  });

  describe('attack scenarios', () => {
    it('should have sybilAttack scenario', () => {
      const scenario = scenarios.sybilAttack;
      expect(scenario).toBeDefined();
      expect(scenario.name).toBe('Sybil Attack');
      expect(scenario.events.some(e => e.data?.type === 'sybil')).toBe(true);
    });

    it('should have eclipseAttack scenario', () => {
      const scenario = scenarios.eclipseAttack;
      expect(scenario).toBeDefined();
      expect(scenario.name).toBe('Eclipse Attack');
    });

    it('should have routingAttack scenario', () => {
      const scenario = scenarios.routingAttack;
      expect(scenario).toBeDefined();
      expect(scenario.config.networkTopology).toBe('tree');
    });

    it('should have ddosAttack scenario', () => {
      const scenario = scenarios.ddosAttack;
      expect(scenario).toBeDefined();
      expect(scenario.config.failureRate).toBeGreaterThan(0.1);
    });
  });

  describe('scalability scenarios', () => {
    it('should have scaleTest100 scenario', () => {
      const scenario = scenarios.scaleTest100;
      expect(scenario).toBeDefined();
      expect(scenario.config.nodeCount).toBe(100);
    });

    it('should have scaleTest1000 scenario', () => {
      const scenario = scenarios.scaleTest1000;
      expect(scenario).toBeDefined();
      expect(scenario.config.nodeCount).toBe(1000);
    });

    it('should have scaleTest10000 scenario', () => {
      const scenario = scenarios.scaleTest10000;
      expect(scenario).toBeDefined();
      expect(scenario.config.nodeCount).toBe(10000);
    });
  });

  describe('spore propagation scenario', () => {
    it('should have sporePropagation scenario', () => {
      const scenario = scenarios.sporePropagation;
      expect(scenario).toBeDefined();
      expect(scenario.config.nodeCount).toBe(5); // Starts small
      expect(scenario.events.length).toBeGreaterThan(10);
    });

    it('should have spore germination events', () => {
      const scenario = scenarios.sporePropagation;
      const sporeEvents = scenario.events.filter(
        e => e.data?.type === 'spore_germination'
      );
      expect(sporeEvents.length).toBeGreaterThan(0);
    });
  });
});

describe('getScenario', () => {
  it('should return scenario by name', () => {
    const scenario = getScenario('normalOperation');
    expect(scenario).toBeDefined();
    expect(scenario?.name).toBe('Normal Operation');
  });

  it('should return undefined for unknown scenario', () => {
    const scenario = getScenario('unknownScenario');
    expect(scenario).toBeUndefined();
  });
});

describe('listScenarios', () => {
  it('should return array of scenario info', () => {
    const list = listScenarios();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  it('should include name and description', () => {
    const list = listScenarios();
    for (const item of list) {
      expect(item.name).toBeDefined();
      expect(item.description).toBeDefined();
    }
  });

  it('should include all predefined scenarios', () => {
    const list = listScenarios();
    const names = list.map(l => l.name);
    expect(names).toContain('normalOperation');
    expect(names).toContain('sybilAttack');
    expect(names).toContain('scaleTest1000');
  });
});

describe('createCustomScenario', () => {
  it('should create scenario with custom config', () => {
    const scenario = createCustomScenario(
      'Custom Test',
      'A custom test scenario',
      { nodeCount: 25, networkTopology: 'ring' }
    );

    expect(scenario.name).toBe('Custom Test');
    expect(scenario.description).toBe('A custom test scenario');
    expect(scenario.config.nodeCount).toBe(25);
    expect(scenario.config.networkTopology).toBe('ring');
  });

  it('should create scenario with custom events', () => {
    const events = [
      { atTick: 10, action: 'fail_node' as const, targets: ['node-0'] },
      { atTick: 20, action: 'recover_node' as const, targets: ['node-0'] },
    ];

    const scenario = createCustomScenario(
      'Event Test',
      'Test with events',
      { nodeCount: 10 },
      events
    );

    expect(scenario.events.length).toBe(2);
    expect(scenario.events[0].atTick).toBe(10);
  });

  it('should default to empty events array', () => {
    const scenario = createCustomScenario('No Events', 'No events', {});
    expect(scenario.events).toEqual([]);
  });
});
