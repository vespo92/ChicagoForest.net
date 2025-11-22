/**
 * GrowthEngine Unit Tests
 *
 * Tests for the organic network expansion algorithms.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GrowthEngine } from '../src/growth';
import type { GrowthDirective, GrowthPattern, NodeInfo } from '../src/types';
import type { NodeId } from '@chicago-forest/shared-types';

// Test helpers
function createTestNodeId(seed: number): NodeId {
  return `CFN-${seed.toString(16).padStart(32, '0')}`;
}

function createMockNodeInfo(seed: number): NodeInfo {
  return {
    id: createTestNodeId(seed),
    peer: {
      nodeId: createTestNodeId(seed),
      publicKey: '0'.repeat(64),
      addresses: [{ protocol: 'tcp', host: '127.0.0.1', port: 8000 + seed }],
      lastSeen: Date.now(),
      reputation: 100,
      capabilities: ['relay'],
      metadata: {},
    },
    connectionCount: 1,
    role: 'relay',
    resources: {
      bandwidth: 100000,
      storage: 1000000,
      compute: 50,
      shareability: 0.8,
    },
    lastSeen: Date.now(),
  };
}

describe('GrowthEngine', () => {
  let engine: GrowthEngine;
  const localNodeId = createTestNodeId(0);

  beforeEach(() => {
    engine = new GrowthEngine(localNodeId);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const stats = engine.getStats();
      expect(stats.activeDirectives).toBe(0);
      expect(stats.pendingTargets).toBe(0);
      expect(stats.recentGrowthAttempts).toBe(0);
    });

    it('should accept custom configuration', () => {
      const customEngine = new GrowthEngine(localNodeId, {
        maxGrowthRate: 20,
        growthCooldown: 10000,
        autonomousGrowth: false,
        targetSize: 100,
        pruneThreshold: 0.5,
        defensiveGrowth: false,
      });

      expect(customEngine.canGrow()).toBe(true);
    });
  });

  describe('canGrow', () => {
    it('should allow growth initially', () => {
      expect(engine.canGrow()).toBe(true);
    });

    it('should respect growth cooldown', async () => {
      // Set up mock providers
      engine.setDiscoveryProvider(async () => [createMockNodeInfo(1)]);
      engine.setConnectionHandlers(
        async () => true,
        async () => {}
      );

      // Initiate growth
      const directive: GrowthDirective = {
        pattern: 'organic',
        targets: [],
        priority: 0.5,
        maxConnections: 1,
        deadline: Date.now() + 60000,
      };
      await engine.initiateGrowth(directive);

      // Should not allow immediate re-growth
      expect(engine.canGrow()).toBe(false);

      // Advance time past cooldown
      vi.advanceTimersByTime(6000);
      expect(engine.canGrow()).toBe(true);
    });
  });

  describe('registerTarget', () => {
    it('should register growth targets', () => {
      engine.registerTarget({
        id: 'target-1',
        type: 'node',
        priority: 0.8,
        cost: 10,
        benefit: 50,
        discoveredAt: Date.now(),
      });

      const targets = engine.getTargets();
      expect(targets).toHaveLength(1);
      expect(targets[0].id).toBe('target-1');
    });

    it('should sort targets by priority', () => {
      engine.registerTarget({
        id: 'low-priority',
        type: 'node',
        priority: 0.2,
        cost: 10,
        benefit: 20,
        discoveredAt: Date.now(),
      });
      engine.registerTarget({
        id: 'high-priority',
        type: 'gateway',
        priority: 0.9,
        cost: 5,
        benefit: 100,
        discoveredAt: Date.now(),
      });

      const targets = engine.getTargets();
      expect(targets[0].id).toBe('high-priority');
      expect(targets[1].id).toBe('low-priority');
    });
  });

  describe('recommendPattern', () => {
    it('should recommend defensive growth for low health', () => {
      const pattern = engine.recommendPattern(30, 20);
      expect(pattern).toBe('defensive');
    });

    it('should recommend consolidation near target size', () => {
      const customEngine = new GrowthEngine(localNodeId, { targetSize: 100 });
      const pattern = customEngine.recommendPattern(80, 95);
      expect(pattern).toBe('consolidation');
    });

    it('should recommend exploratory for small networks', () => {
      const pattern = engine.recommendPattern(70, 5);
      expect(pattern).toBe('exploratory');
    });

    it('should recommend directed when targets are available', () => {
      engine.registerTarget({
        id: 'target-1',
        type: 'node',
        priority: 0.5,
        cost: 10,
        benefit: 20,
        discoveredAt: Date.now(),
      });

      const pattern = engine.recommendPattern(80, 20);
      expect(pattern).toBe('directed');
    });

    it('should default to organic growth', () => {
      const pattern = engine.recommendPattern(80, 20);
      expect(pattern).toBe('organic');
    });
  });

  describe('initiateGrowth', () => {
    beforeEach(() => {
      engine.setDiscoveryProvider(async () => [
        createMockNodeInfo(1),
        createMockNodeInfo(2),
        createMockNodeInfo(3),
      ]);
    });

    it('should emit growth:started event', async () => {
      const startedHandler = vi.fn();
      engine.on('growth:started', startedHandler);

      engine.setConnectionHandlers(
        async () => true,
        async () => {}
      );

      const directive: GrowthDirective = {
        pattern: 'organic',
        targets: [],
        priority: 0.5,
        maxConnections: 3,
        deadline: Date.now() + 60000,
      };

      await engine.initiateGrowth(directive);

      expect(startedHandler).toHaveBeenCalledWith(directive);
    });

    it('should emit growth:completed event', async () => {
      const completedHandler = vi.fn();
      engine.on('growth:completed', completedHandler);

      engine.setConnectionHandlers(
        async () => true,
        async () => {}
      );

      const directive: GrowthDirective = {
        pattern: 'organic',
        targets: [],
        priority: 0.5,
        maxConnections: 3,
        deadline: Date.now() + 60000,
      };

      await engine.initiateGrowth(directive);

      expect(completedHandler).toHaveBeenCalledWith(directive);
    });

    it('should track successful connections in organic growth', async () => {
      let connectCalls = 0;
      engine.setConnectionHandlers(
        async () => {
          connectCalls++;
          return true;
        },
        async () => {}
      );

      const directive: GrowthDirective = {
        pattern: 'organic',
        targets: [],
        priority: 0.5,
        maxConnections: 2,
        deadline: Date.now() + 60000,
      };

      const result = await engine.initiateGrowth(directive);

      expect(result.success).toBe(true);
      expect(result.newConnections).toBe(2);
      expect(connectCalls).toBe(2);
    });

    it('should handle connection failures gracefully', async () => {
      engine.setConnectionHandlers(
        async () => false,
        async () => {}
      );

      const directive: GrowthDirective = {
        pattern: 'organic',
        targets: [],
        priority: 0.5,
        maxConnections: 3,
        deadline: Date.now() + 60000,
      };

      const result = await engine.initiateGrowth(directive);

      expect(result.success).toBe(false);
      expect(result.newConnections).toBe(0);
    });

    it('should execute directed growth to specific targets', async () => {
      const connectedTargets: NodeId[] = [];

      engine.setConnectionHandlers(
        async (nodeId) => {
          connectedTargets.push(nodeId);
          return true;
        },
        async () => {}
      );

      // Register targets
      const target1 = createTestNodeId(10);
      const target2 = createTestNodeId(20);

      engine.registerTarget({
        id: target1,
        type: 'node',
        priority: 0.8,
        cost: 5,
        benefit: 50,
        discoveredAt: Date.now(),
      });
      engine.registerTarget({
        id: target2,
        type: 'node',
        priority: 0.6,
        cost: 10,
        benefit: 30,
        discoveredAt: Date.now(),
      });

      const directive: GrowthDirective = {
        pattern: 'directed',
        targets: [target1, target2],
        priority: 0.8,
        maxConnections: 2,
        deadline: Date.now() + 60000,
      };

      const result = await engine.initiateGrowth(directive);

      expect(result.success).toBe(true);
      expect(connectedTargets).toContain(target1);
      expect(connectedTargets).toContain(target2);
    });

    it('should execute defensive growth', async () => {
      engine.setConnectionHandlers(
        async () => true,
        async () => {}
      );

      const directive: GrowthDirective = {
        pattern: 'defensive',
        targets: [],
        priority: 1.0,
        maxConnections: 5,
        deadline: Date.now() + 60000,
      };

      const result = await engine.initiateGrowth(directive);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should execute exploratory growth and register gateways', async () => {
      engine.setConnectionHandlers(
        async () => true,
        async () => {}
      );

      const directive: GrowthDirective = {
        pattern: 'exploratory',
        targets: [],
        priority: 0.5,
        maxConnections: 3,
        deadline: Date.now() + 60000,
      };

      await engine.initiateGrowth(directive);

      // Should have registered discovered peers as potential gateways
      const targets = engine.getTargets();
      expect(targets.length).toBeGreaterThan(0);
      expect(targets.some(t => t.type === 'gateway')).toBe(true);
    });

    it('should handle consolidation growth (no new connections)', async () => {
      engine.setConnectionHandlers(
        async () => true,
        async () => {}
      );

      const directive: GrowthDirective = {
        pattern: 'consolidation',
        targets: [],
        priority: 0.5,
        maxConnections: 5,
        deadline: Date.now() + 60000,
      };

      const result = await engine.initiateGrowth(directive);

      expect(result.success).toBe(false); // No new connections
      expect(result.newConnections).toBe(0);
    });

    it('should capture errors during growth', async () => {
      engine.setDiscoveryProvider(async () => {
        throw new Error('Discovery failed');
      });

      const directive: GrowthDirective = {
        pattern: 'organic',
        targets: [],
        priority: 0.5,
        maxConnections: 3,
        deadline: Date.now() + 60000,
      };

      const result = await engine.initiateGrowth(directive);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Discovery failed');
    });
  });

  describe('getStats', () => {
    it('should return accurate statistics', async () => {
      engine.setDiscoveryProvider(async () => [createMockNodeInfo(1)]);
      engine.setConnectionHandlers(
        async () => true,
        async () => {}
      );

      // Add a target
      engine.registerTarget({
        id: 'target-1',
        type: 'node',
        priority: 0.5,
        cost: 10,
        benefit: 20,
        discoveredAt: Date.now(),
      });

      // Execute growth
      await engine.initiateGrowth({
        pattern: 'organic',
        targets: [],
        priority: 0.5,
        maxConnections: 1,
        deadline: Date.now() + 60000,
      });

      const stats = engine.getStats();

      expect(stats.pendingTargets).toBe(1);
      expect(stats.recentGrowthAttempts).toBe(1);
      expect(stats.successRate).toBe(1);
      expect(stats.totalNewConnections).toBe(1);
    });

    it('should calculate success rate correctly', async () => {
      engine.setDiscoveryProvider(async () => [createMockNodeInfo(1)]);

      let shouldSucceed = true;
      engine.setConnectionHandlers(
        async () => {
          const result = shouldSucceed;
          shouldSucceed = !shouldSucceed;
          return result;
        },
        async () => {}
      );

      // First attempt: success
      vi.advanceTimersByTime(6000);
      await engine.initiateGrowth({
        pattern: 'organic',
        targets: [],
        priority: 0.5,
        maxConnections: 1,
        deadline: Date.now() + 60000,
      });

      // Second attempt: failure
      vi.advanceTimersByTime(6000);
      await engine.initiateGrowth({
        pattern: 'organic',
        targets: [],
        priority: 0.5,
        maxConnections: 1,
        deadline: Date.now() + 60000,
      });

      const stats = engine.getStats();
      expect(stats.successRate).toBe(0.5);
    });
  });
});
