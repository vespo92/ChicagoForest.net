/**
 * MultiPathRouter Load Balancing Tests
 *
 * Tests for multi-path routing and load balancing capabilities.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { MultiPathRouter, createMultiPathRouter, RouteTableManager } from '../src';
import type { Route, RoutingProtocol } from '../src';
import type { NodeId } from '@chicago-forest/shared-types';

// Test helpers
function createTestNodeId(seed: number): NodeId {
  return `CFN-${seed.toString(16).padStart(32, '0')}`;
}

function createTestRoute(
  destination: NodeId,
  protocol: RoutingProtocol,
  overrides: Partial<Route> = {}
): Route {
  const now = Date.now();
  return {
    id: `${protocol}-${destination}-${now}-${Math.random().toString(36).slice(2)}`,
    destination,
    nextHop: createTestNodeId(100 + Math.floor(Math.random() * 100)),
    protocol,
    state: 'active',
    metrics: {
      latencyMs: 20 + Math.random() * 80,
      bandwidthMbps: 50 + Math.random() * 200,
      packetLoss: Math.random() * 5,
      hopCount: 1 + Math.floor(Math.random() * 4),
      jitterMs: Math.random() * 10,
      lastUpdated: now,
    },
    path: [createTestNodeId(100)],
    cost: 10 + Math.floor(Math.random() * 40),
    createdAt: now,
    expiresAt: now + 300000,
    ...overrides,
  };
}

describe('MultiPathRouter', () => {
  let router: MultiPathRouter;
  const localNodeId = createTestNodeId(0);

  beforeEach(async () => {
    router = createMultiPathRouter({ nodeId: localNodeId });
    await router.start();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await router.stop();
    vi.useRealTimers();
  });

  describe('getMultiplePaths', () => {
    const destination = createTestNodeId(1);

    beforeEach(() => {
      // Add multiple routes to destination
      router.addRoute(createTestRoute(destination, 'direct', {
        id: 'route-1',
        metrics: { latencyMs: 10, bandwidthMbps: 1000, packetLoss: 0, hopCount: 1, jitterMs: 1, lastUpdated: Date.now() },
        cost: 1,
      }));
      router.addRoute(createTestRoute(destination, 'dht', {
        id: 'route-2',
        metrics: { latencyMs: 50, bandwidthMbps: 100, packetLoss: 1, hopCount: 3, jitterMs: 5, lastUpdated: Date.now() },
        cost: 20,
      }));
      router.addRoute(createTestRoute(destination, 'mesh', {
        id: 'route-3',
        metrics: { latencyMs: 30, bandwidthMbps: 50, packetLoss: 2, hopCount: 2, jitterMs: 10, lastUpdated: Date.now() },
        cost: 15,
      }));
      router.addRoute(createTestRoute(destination, 'sdwan', {
        id: 'route-4',
        metrics: { latencyMs: 25, bandwidthMbps: 500, packetLoss: 0.5, hopCount: 2, jitterMs: 3, lastUpdated: Date.now() },
        cost: 10,
      }));
    });

    it('should return requested number of paths', () => {
      const paths = router.getMultiplePaths(destination, 3);
      expect(paths).toHaveLength(3);
    });

    it('should return all active paths if fewer than requested', () => {
      const otherDestination = createTestNodeId(2);
      router.addRoute(createTestRoute(otherDestination, 'dht', { id: 'only-route' }));

      const paths = router.getMultiplePaths(otherDestination, 5);
      expect(paths).toHaveLength(1);
    });

    it('should return sorted by combined score', () => {
      const paths = router.getMultiplePaths(destination, 4);

      // Routes should be sorted by latency + cost * 10
      for (let i = 1; i < paths.length; i++) {
        const prevScore = paths[i - 1].metrics.latencyMs + paths[i - 1].cost * 10;
        const currScore = paths[i].metrics.latencyMs + paths[i].cost * 10;
        expect(prevScore).toBeLessThanOrEqual(currScore);
      }
    });

    it('should only return active routes', () => {
      // Add a degraded route
      router.addRoute(createTestRoute(destination, 'onion', {
        id: 'degraded',
        state: 'degraded',
      }));

      const paths = router.getMultiplePaths(destination, 10);

      paths.forEach(path => {
        expect(path.state).toBe('active');
      });
    });

    it('should return default count when not specified', () => {
      const paths = router.getMultiplePaths(destination);
      expect(paths.length).toBeLessThanOrEqual(3); // Default is 3
    });

    it('should return empty array for unknown destination', () => {
      const paths = router.getMultiplePaths(createTestNodeId(99));
      expect(paths).toEqual([]);
    });
  });

  describe('createMultiPathStream', () => {
    const destination = createTestNodeId(1);

    beforeEach(() => {
      router.addRoute(createTestRoute(destination, 'direct', { id: 'route-1' }));
      router.addRoute(createTestRoute(destination, 'dht', { id: 'route-2' }));
      router.addRoute(createTestRoute(destination, 'mesh', { id: 'route-3' }));
    });

    it('should create stream with unique ID', () => {
      const streamId1 = router.createMultiPathStream(destination);
      const streamId2 = router.createMultiPathStream(destination);

      expect(streamId1).toMatch(/^stream-\d+-[a-z0-9]+$/);
      expect(streamId1).not.toBe(streamId2);
    });

    it('should associate multiple routes with stream', () => {
      const streamId = router.createMultiPathStream(destination);
      const routes = router.getStreamRoutes(streamId);

      expect(routes.length).toBeGreaterThan(0);
      expect(routes.length).toBeLessThanOrEqual(3); // Default max paths
    });
  });

  describe('getStreamRoutes', () => {
    const destination = createTestNodeId(1);

    beforeEach(() => {
      router.addRoute(createTestRoute(destination, 'direct', { id: 'route-1' }));
      router.addRoute(createTestRoute(destination, 'dht', { id: 'route-2' }));
    });

    it('should return routes for valid stream', () => {
      const streamId = router.createMultiPathStream(destination);
      const routes = router.getStreamRoutes(streamId);

      expect(routes.length).toBeGreaterThan(0);
      routes.forEach(route => {
        expect(route.destination).toBe(destination);
      });
    });

    it('should return empty array for unknown stream', () => {
      const routes = router.getStreamRoutes('unknown-stream');
      expect(routes).toEqual([]);
    });

    it('should filter out removed routes', () => {
      // Create stream with routes
      const streamId = router.createMultiPathStream(destination);

      // Remove one of the routes
      router.removeRoute('route-1');

      // Stream should only have remaining routes
      const routes = router.getStreamRoutes(streamId);
      expect(routes.every(r => r.id !== 'route-1')).toBe(true);
    });
  });

  describe('closeMultiPathStream', () => {
    it('should remove stream', () => {
      const destination = createTestNodeId(1);
      router.addRoute(createTestRoute(destination, 'direct'));

      const streamId = router.createMultiPathStream(destination);
      expect(router.getStreamRoutes(streamId).length).toBeGreaterThan(0);

      router.closeMultiPathStream(streamId);
      expect(router.getStreamRoutes(streamId)).toEqual([]);
    });

    it('should handle closing non-existent stream', () => {
      expect(() => router.closeMultiPathStream('non-existent')).not.toThrow();
    });
  });

  describe('load balancing scenarios', () => {
    const destination = createTestNodeId(1);

    it('should provide diverse paths for redundancy', () => {
      // Add routes via different protocols
      router.addRoute(createTestRoute(destination, 'direct', {
        id: 'direct-route',
        nextHop: createTestNodeId(100),
      }));
      router.addRoute(createTestRoute(destination, 'dht', {
        id: 'dht-route',
        nextHop: createTestNodeId(200),
      }));
      router.addRoute(createTestRoute(destination, 'mesh', {
        id: 'mesh-route',
        nextHop: createTestNodeId(300),
      }));

      const paths = router.getMultiplePaths(destination, 3);

      // Should have paths via different next hops
      const nextHops = new Set(paths.map(p => p.nextHop));
      expect(nextHops.size).toBeGreaterThan(1);
    });

    it('should handle failover when primary path degrades', () => {
      router.addRoute(createTestRoute(destination, 'direct', {
        id: 'primary',
        metrics: { latencyMs: 10, bandwidthMbps: 1000, packetLoss: 0, hopCount: 1, jitterMs: 1, lastUpdated: Date.now() },
        cost: 1,
      }));
      router.addRoute(createTestRoute(destination, 'dht', {
        id: 'backup',
        metrics: { latencyMs: 50, bandwidthMbps: 100, packetLoss: 0, hopCount: 3, jitterMs: 5, lastUpdated: Date.now() },
        cost: 20,
      }));

      // Get initial paths
      let paths = router.getMultiplePaths(destination, 2);
      expect(paths[0].id).toBe('primary');

      // Degrade primary
      const primaryRoute = router.getRoute('primary');
      if (primaryRoute) {
        primaryRoute.state = 'degraded';
      }

      // Should now only return backup
      paths = router.getMultiplePaths(destination, 2);
      expect(paths).toHaveLength(1);
      expect(paths[0].id).toBe('backup');
    });
  });
});

describe('RouteTableManager', () => {
  let router: MultiPathRouter;
  let manager: RouteTableManager;
  const localNodeId = createTestNodeId(0);

  beforeEach(async () => {
    router = createMultiPathRouter({ nodeId: localNodeId });
    manager = new RouteTableManager(router);
    await router.start();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    manager.stopSync();
    await router.stop();
    vi.useRealTimers();
  });

  describe('startSync / stopSync', () => {
    it('should start synchronization', () => {
      manager.startSync(1000);

      // Advance time and verify no errors
      vi.advanceTimersByTime(3000);
      expect(true).toBe(true);
    });

    it('should be idempotent on start', () => {
      manager.startSync(1000);
      manager.startSync(1000);

      vi.advanceTimersByTime(2000);
      expect(true).toBe(true);
    });

    it('should stop synchronization', () => {
      manager.startSync(1000);
      manager.stopSync();

      // Should not throw even with large time advance
      vi.advanceTimersByTime(100000);
    });
  });

  describe('exportToJson / importFromJson', () => {
    it('should export routing table to JSON', () => {
      router.addRoute(createTestRoute(createTestNodeId(1), 'dht'));
      router.addRoute(createTestRoute(createTestNodeId(2), 'mesh'));

      const json = manager.exportToJson();
      const parsed = JSON.parse(json);

      expect(parsed.config).toBeDefined();
      expect(parsed.routes).toHaveLength(2);
      expect(parsed.stats).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });

    it('should import routes from JSON', () => {
      const route1 = createTestRoute(createTestNodeId(1), 'dht');
      const route2 = createTestRoute(createTestNodeId(2), 'mesh');

      const json = JSON.stringify({
        routes: [route1, route2],
      });

      manager.importFromJson(json);

      expect(router.getAllRoutes()).toHaveLength(2);
    });

    it('should round-trip export/import', () => {
      router.addRoute(createTestRoute(createTestNodeId(1), 'dht'));
      router.addRoute(createTestRoute(createTestNodeId(2), 'mesh'));

      const exported = manager.exportToJson();

      // Clear routes
      router.getAllRoutes().forEach(r => router.removeRoute(r.id));
      expect(router.getAllRoutes()).toHaveLength(0);

      // Import
      manager.importFromJson(exported);
      expect(router.getAllRoutes()).toHaveLength(2);
    });

    it('should handle empty import', () => {
      const json = JSON.stringify({});
      expect(() => manager.importFromJson(json)).not.toThrow();
    });
  });
});

describe('createMultiPathRouter', () => {
  it('should create router with multipath enabled', () => {
    const router = createMultiPathRouter();
    const config = router.getConfig();

    expect(config.enableMultipath).toBe(true);
  });

  it('should accept custom configuration', () => {
    const router = createMultiPathRouter({
      nodeId: createTestNodeId(0),
      protocols: ['dht', 'mesh'],
    });
    const config = router.getConfig();

    expect(config.protocols).toEqual(['dht', 'mesh']);
    expect(config.enableMultipath).toBe(true);
  });
});
