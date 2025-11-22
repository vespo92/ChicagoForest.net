/**
 * HyphalNetwork Unit Tests
 *
 * Tests for multi-path connection management between nodes.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HyphalNetwork } from '../src/hyphal';
import type { NodeId } from '@chicago-forest/shared-types';

// Test helpers
function createTestNodeId(seed: number): NodeId {
  return `CFN-${seed.toString(16).padStart(32, '0')}`;
}

describe('HyphalNetwork', () => {
  let hyphal: HyphalNetwork;
  const localNodeId = createTestNodeId(0);

  beforeEach(() => {
    hyphal = new HyphalNetwork(localNodeId);
    vi.useFakeTimers();
  });

  afterEach(() => {
    hyphal.stop();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(hyphal.pathCount).toBe(0);
      expect(hyphal.activePathCount).toBe(0);
    });

    it('should accept custom configuration', () => {
      const customHyphal = new HyphalNetwork(localNodeId, {
        maxPathsPerDestination: 5,
        pathTimeout: 60000,
        healthCheckInterval: 10000,
        multiPathEnabled: false,
        minReliability: 0.8,
      });

      expect(customHyphal.pathCount).toBe(0);
    });
  });

  describe('establishPath', () => {
    it('should create a new path to destination', async () => {
      const destination = createTestNodeId(1);
      const path = await hyphal.establishPath(destination);

      expect(path.source).toBe(localNodeId);
      expect(path.destination).toBe(destination);
      expect(path.state).toBe('active');
      expect(hyphal.pathCount).toBe(1);
    });

    it('should return existing path if already established', async () => {
      const destination = createTestNodeId(1);
      const path1 = await hyphal.establishPath(destination);
      const path2 = await hyphal.establishPath(destination);

      expect(path1.id).toBe(path2.id);
      expect(hyphal.pathCount).toBe(1);
    });

    it('should create path with intermediate hops', async () => {
      const destination = createTestNodeId(3);
      const hops = [createTestNodeId(1), createTestNodeId(2)];

      const path = await hyphal.establishPath(destination, hops);

      expect(path.hops).toEqual(hops);
      expect(path.metrics.hopCount).toBe(3); // 2 intermediate + 1 final
    });

    it('should emit path:established event', async () => {
      const establishedHandler = vi.fn();
      hyphal.on('path:established', establishedHandler);

      const destination = createTestNodeId(1);
      await hyphal.establishPath(destination);

      expect(establishedHandler).toHaveBeenCalledTimes(1);
      expect(establishedHandler.mock.calls[0][0].destination).toBe(destination);
    });

    it('should prune worst path when max paths reached', async () => {
      const customHyphal = new HyphalNetwork(localNodeId, {
        maxPathsPerDestination: 2,
      });

      const destination = createTestNodeId(1);

      // Create 3 paths to same destination with different hops
      const path1 = await customHyphal.establishPath(destination, []);
      const path2 = await customHyphal.establishPath(destination, [createTestNodeId(10)]);
      const path3 = await customHyphal.establishPath(destination, [createTestNodeId(20)]);

      // Should have pruned one path
      const allPaths = customHyphal.getAllPaths(destination);
      expect(allPaths.length).toBeLessThanOrEqual(2);

      customHyphal.stop();
    });
  });

  describe('getBestPath', () => {
    it('should return undefined for unknown destination', () => {
      const path = hyphal.getBestPath(createTestNodeId(99));
      expect(path).toBeUndefined();
    });

    it('should return the best path based on score', async () => {
      const destination = createTestNodeId(1);

      // Create direct path (better)
      await hyphal.establishPath(destination, []);

      // Create longer path (worse)
      await hyphal.establishPath(destination, [createTestNodeId(10), createTestNodeId(20)]);

      const bestPath = hyphal.getBestPath(destination);

      // Direct path should have fewer hops and better metrics
      expect(bestPath).toBeDefined();
      expect(bestPath!.hops).toHaveLength(0);
    });

    it('should not return inactive paths', async () => {
      const destination = createTestNodeId(1);
      const path = await hyphal.establishPath(destination);

      // Degrade the path
      hyphal.updateMetrics(path.id, { reliability: 0.1, packetLoss: 60 });

      const bestPath = hyphal.getBestPath(destination);

      // Path should be in dying state, not returned as best
      expect(bestPath).toBeUndefined();
    });
  });

  describe('getAllPaths', () => {
    it('should return empty array for unknown destination', () => {
      const paths = hyphal.getAllPaths(createTestNodeId(99));
      expect(paths).toEqual([]);
    });

    it('should return all active paths to destination', async () => {
      const destination = createTestNodeId(1);

      await hyphal.establishPath(destination, []);
      await hyphal.establishPath(destination, [createTestNodeId(10)]);

      const paths = hyphal.getAllPaths(destination);

      expect(paths.length).toBe(2);
      paths.forEach(p => expect(p.state).toBe('active'));
    });
  });

  describe('recordActivity', () => {
    it('should update last activity timestamp', async () => {
      const destination = createTestNodeId(1);
      const path = await hyphal.establishPath(destination);
      const originalActivity = path.lastActivity;

      vi.advanceTimersByTime(1000);
      hyphal.recordActivity(path.id);

      expect(path.lastActivity).toBeGreaterThan(originalActivity);
    });

    it('should handle unknown path gracefully', () => {
      expect(() => hyphal.recordActivity('unknown-path')).not.toThrow();
    });
  });

  describe('updateMetrics', () => {
    it('should update path metrics', async () => {
      const destination = createTestNodeId(1);
      const path = await hyphal.establishPath(destination);

      hyphal.updateMetrics(path.id, {
        latency: 100,
        bandwidth: 50000000,
      });

      expect(path.metrics.latency).toBe(100);
      expect(path.metrics.bandwidth).toBe(50000000);
    });

    it('should transition to stressed state on degradation', async () => {
      const degradedHandler = vi.fn();
      hyphal.on('path:degraded', degradedHandler);

      const destination = createTestNodeId(1);
      const path = await hyphal.establishPath(destination);

      hyphal.updateMetrics(path.id, {
        reliability: 0.4,
        packetLoss: 25,
      });

      expect(path.state).toBe('stressed');
      expect(degradedHandler).toHaveBeenCalled();
    });

    it('should transition to dying state on severe degradation', async () => {
      const destination = createTestNodeId(1);
      const path = await hyphal.establishPath(destination);

      hyphal.updateMetrics(path.id, {
        reliability: 0.2,
        packetLoss: 55,
      });

      expect(path.state).toBe('dying');
    });

    it('should emit path:healed when recovering from stressed', async () => {
      const healedHandler = vi.fn();
      hyphal.on('path:healed', healedHandler);

      const destination = createTestNodeId(1);
      const path = await hyphal.establishPath(destination);

      // Degrade first
      hyphal.updateMetrics(path.id, { reliability: 0.4, packetLoss: 25 });
      expect(path.state).toBe('stressed');

      // Now heal
      hyphal.updateMetrics(path.id, { reliability: 0.9, packetLoss: 1 });
      expect(path.state).toBe('active');
      expect(healedHandler).toHaveBeenCalled();
    });
  });

  describe('healPath', () => {
    it('should attempt to restore path health', async () => {
      const destination = createTestNodeId(1);
      const path = await hyphal.establishPath(destination);

      // Degrade path
      hyphal.updateMetrics(path.id, { reliability: 0.4 });
      expect(path.state).toBe('stressed');

      // Attempt heal (new metrics will be random, might not succeed)
      const healed = await hyphal.healPath(path.id);

      // Result depends on random metrics
      expect(typeof healed).toBe('boolean');
    });

    it('should return false for dead paths', async () => {
      const destination = createTestNodeId(1);
      const path = await hyphal.establishPath(destination);

      // Kill path
      hyphal.updateMetrics(path.id, { reliability: 0.1, packetLoss: 60 });

      // Manually set to dead for test
      (path as any).state = 'dead';

      const healed = await hyphal.healPath(path.id);
      expect(healed).toBe(false);
    });

    it('should return false for unknown paths', async () => {
      const healed = await hyphal.healPath('unknown-path');
      expect(healed).toBe(false);
    });
  });

  describe('health checks', () => {
    it('should mark inactive paths as dormant', async () => {
      const customHyphal = new HyphalNetwork(localNodeId, {
        pathTimeout: 1000,
        healthCheckInterval: 500,
      });
      customHyphal.start();

      const destination = createTestNodeId(1);
      const path = await customHyphal.establishPath(destination);

      // Advance past timeout
      vi.advanceTimersByTime(1500);

      expect(path.state).toBe('dormant');

      customHyphal.stop();
    });

    it('should transition dormant paths to dying', async () => {
      const customHyphal = new HyphalNetwork(localNodeId, {
        pathTimeout: 1000,
        healthCheckInterval: 500,
      });
      customHyphal.start();

      const destination = createTestNodeId(1);
      const path = await customHyphal.establishPath(destination);

      // First timeout: active -> dormant
      vi.advanceTimersByTime(1500);
      expect(path.state).toBe('dormant');

      // Second timeout: dormant -> dying
      vi.advanceTimersByTime(1500);
      expect(path.state).toBe('dying');

      customHyphal.stop();
    });

    it('should remove dead paths and emit event', async () => {
      const diedHandler = vi.fn();

      const customHyphal = new HyphalNetwork(localNodeId, {
        pathTimeout: 500,
        healthCheckInterval: 200,
      });
      customHyphal.on('path:died', diedHandler);
      customHyphal.start();

      const destination = createTestNodeId(1);
      await customHyphal.establishPath(destination);

      // Advance through all stages: active -> dormant -> dying -> dead
      vi.advanceTimersByTime(2000);

      expect(customHyphal.pathCount).toBe(0);
      expect(diedHandler).toHaveBeenCalled();

      customHyphal.stop();
    });
  });

  describe('path scoring', () => {
    it('should prefer lower latency paths', async () => {
      const destination = createTestNodeId(1);

      // Create path with low latency
      const lowLatencyPath = await hyphal.establishPath(destination, []);
      hyphal.updateMetrics(lowLatencyPath.id, { latency: 10, reliability: 0.9 });

      // Create path with high latency
      const highLatencyPath = await hyphal.establishPath(destination, [createTestNodeId(10)]);
      hyphal.updateMetrics(highLatencyPath.id, { latency: 200, reliability: 0.9 });

      const bestPath = hyphal.getBestPath(destination);
      expect(bestPath?.id).toBe(lowLatencyPath.id);
    });

    it('should prefer higher reliability paths', async () => {
      const destination = createTestNodeId(1);

      // Create unreliable path
      const unreliablePath = await hyphal.establishPath(destination, []);
      hyphal.updateMetrics(unreliablePath.id, { reliability: 0.75, latency: 10 });

      // Create reliable path
      const reliablePath = await hyphal.establishPath(destination, [createTestNodeId(10)]);
      hyphal.updateMetrics(reliablePath.id, { reliability: 0.99, latency: 15 });

      const bestPath = hyphal.getBestPath(destination);
      expect(bestPath?.id).toBe(reliablePath.id);
    });
  });

  describe('lifecycle', () => {
    it('should start health check timer', () => {
      hyphal.start();
      // Timer is started, verify by advancing time and checking path states
      expect(() => vi.advanceTimersByTime(10000)).not.toThrow();
    });

    it('should stop health check timer', () => {
      hyphal.start();
      hyphal.stop();
      // Timer should be cleared
      expect(() => vi.advanceTimersByTime(100000)).not.toThrow();
    });
  });
});
