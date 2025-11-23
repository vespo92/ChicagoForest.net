/**
 * UnifiedRouter Path Finding Tests
 *
 * Tests for route discovery and path selection algorithms.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { UnifiedRouter, createRouter } from '../src';
import type { Route, RouteMetrics, RoutingProtocol, PathSelectionPolicy } from '../src';
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
    id: `${protocol}-${destination}-${now}-${Math.random()}`,
    destination,
    nextHop: createTestNodeId(100),
    protocol,
    state: 'active',
    metrics: {
      latencyMs: 50,
      bandwidthMbps: 100,
      packetLoss: 0,
      hopCount: 3,
      jitterMs: 5,
      lastUpdated: now,
    },
    path: [createTestNodeId(100), createTestNodeId(101)],
    cost: 20,
    createdAt: now,
    expiresAt: now + 300000,
    ...overrides,
  };
}

describe('UnifiedRouter', () => {
  let router: UnifiedRouter;
  const localNodeId = createTestNodeId(0);

  beforeEach(() => {
    router = new UnifiedRouter({ nodeId: localNodeId });
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await router.stop();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(router.getRoutingTableSize()).toBe(0);
      expect(router.getStats().totalRoutes).toBe(0);
    });

    it('should accept custom configuration', () => {
      const customRouter = createRouter({
        nodeId: localNodeId,
        protocols: ['dht', 'mesh'],
        pathSelectionPolicy: 'lowest-latency',
        routeTimeout: 600000,
        maxRoutes: 500,
      });

      const config = customRouter.getConfig();
      expect(config.protocols).toEqual(['dht', 'mesh']);
      expect(config.pathSelectionPolicy).toBe('lowest-latency');
    });
  });

  describe('lifecycle', () => {
    it('should start and connect protocols', async () => {
      const connectedHandler = vi.fn();
      router.on('protocol:connected', connectedHandler);

      await router.start();

      expect(connectedHandler).toHaveBeenCalled();
    });

    it('should stop and disconnect protocols', async () => {
      await router.start();

      const disconnectedHandler = vi.fn();
      router.on('protocol:disconnected', disconnectedHandler);

      await router.stop();

      expect(disconnectedHandler).toHaveBeenCalled();
    });

    it('should be idempotent on start', async () => {
      await router.start();
      await router.start();
      expect(true).toBe(true);
    });

    it('should be idempotent on stop', async () => {
      await router.start();
      await router.stop();
      await router.stop();
      expect(true).toBe(true);
    });
  });

  describe('discoverRoutes', () => {
    beforeEach(async () => {
      await router.start();
    });

    it('should discover routes to destination', async () => {
      const destination = createTestNodeId(1);
      const result = await router.discoverRoutes(destination);

      expect(result.routes.length).toBeGreaterThan(0);
      expect(result.discoveryTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.protocolsUsed.length).toBeGreaterThan(0);
    });

    it('should add discovered routes to routing table', async () => {
      const destination = createTestNodeId(1);
      await router.discoverRoutes(destination);

      const routes = router.getRoutesTo(destination);
      expect(routes.length).toBeGreaterThan(0);
    });

    it('should emit route:discovered events', async () => {
      const discoveredHandler = vi.fn();
      router.on('route:discovered', discoveredHandler);

      const destination = createTestNodeId(1);
      await router.discoverRoutes(destination);

      expect(discoveredHandler).toHaveBeenCalled();
    });

    it('should query all connected protocols', async () => {
      const multiProtocolRouter = createRouter({
        nodeId: localNodeId,
        protocols: ['dht', 'mesh', 'sdwan'],
      });
      await multiProtocolRouter.start();

      const destination = createTestNodeId(1);
      const result = await multiProtocolRouter.discoverRoutes(destination);

      // Should have routes from each protocol
      expect(result.routes.length).toBeGreaterThanOrEqual(1);

      await multiProtocolRouter.stop();
    });
  });

  describe('addRoute', () => {
    it('should add route to routing table', () => {
      const destination = createTestNodeId(1);
      const route = createTestRoute(destination, 'dht');

      router.addRoute(route);

      expect(router.getRoute(route.id)).toBeDefined();
      expect(router.getRoutingTableSize()).toBe(1);
    });

    it('should not add duplicate routes', () => {
      const destination = createTestNodeId(1);
      const route = createTestRoute(destination, 'dht');

      router.addRoute(route);
      router.addRoute(route);

      expect(router.getRoutesTo(destination)).toHaveLength(1);
    });

    it('should limit routes per destination', () => {
      const destination = createTestNodeId(1);

      // Add many routes to same destination
      for (let i = 0; i < 15; i++) {
        const route = createTestRoute(destination, 'dht', {
          id: `route-${i}`,
        });
        router.addRoute(route);
      }

      // Should be limited to 10 per destination
      expect(router.getRoutesTo(destination).length).toBeLessThanOrEqual(10);
    });

    it('should select preferred route on add', async () => {
      await router.start();

      const pathSelectedHandler = vi.fn();
      router.on('path:selected', pathSelectedHandler);

      const destination = createTestNodeId(1);
      const route = createTestRoute(destination, 'dht');

      router.addRoute(route);

      expect(pathSelectedHandler).toHaveBeenCalled();
    });
  });

  describe('removeRoute', () => {
    it('should remove route from routing table', () => {
      const destination = createTestNodeId(1);
      const route = createTestRoute(destination, 'dht');

      router.addRoute(route);
      router.removeRoute(route.id);

      expect(router.getRoute(route.id)).toBeUndefined();
    });

    it('should emit route:expired event', () => {
      const expiredHandler = vi.fn();
      router.on('route:expired', expiredHandler);

      const route = createTestRoute(createTestNodeId(1), 'dht');
      router.addRoute(route);
      router.removeRoute(route.id);

      expect(expiredHandler).toHaveBeenCalledWith(route.id);
    });

    it('should update preferred route when removing current preferred', async () => {
      await router.start();

      const destination = createTestNodeId(1);
      const route1 = createTestRoute(destination, 'dht', { id: 'route-1' });
      const route2 = createTestRoute(destination, 'mesh', { id: 'route-2' });

      router.addRoute(route1);
      router.addRoute(route2);

      const pathSelectedHandler = vi.fn();
      router.on('path:selected', pathSelectedHandler);

      router.removeRoute(route1.id);

      // Should select new preferred route
      const preferred = router.getPreferredRoute(destination);
      expect(preferred).toBeDefined();
    });

    it('should remove routing table entry when no routes remain', () => {
      const destination = createTestNodeId(1);
      const route = createTestRoute(destination, 'dht');

      router.addRoute(route);
      expect(router.getRoutingTableSize()).toBe(1);

      router.removeRoute(route.id);
      expect(router.getRoutingTableSize()).toBe(0);
    });
  });

  describe('getRoute', () => {
    it('should return route by ID', () => {
      const route = createTestRoute(createTestNodeId(1), 'dht');
      router.addRoute(route);

      const retrieved = router.getRoute(route.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(route.id);
    });

    it('should return undefined for unknown ID', () => {
      const route = router.getRoute('unknown-route');
      expect(route).toBeUndefined();
    });
  });

  describe('getRoutesTo', () => {
    it('should return all routes to destination', () => {
      const destination = createTestNodeId(1);

      router.addRoute(createTestRoute(destination, 'dht'));
      router.addRoute(createTestRoute(destination, 'mesh'));
      router.addRoute(createTestRoute(destination, 'sdwan'));

      const routes = router.getRoutesTo(destination);
      expect(routes).toHaveLength(3);
    });

    it('should return empty array for unknown destination', () => {
      const routes = router.getRoutesTo(createTestNodeId(99));
      expect(routes).toEqual([]);
    });
  });

  describe('getPreferredRoute', () => {
    it('should return preferred route for destination', async () => {
      await router.start();

      const destination = createTestNodeId(1);
      router.addRoute(createTestRoute(destination, 'dht'));

      const preferred = router.getPreferredRoute(destination);
      expect(preferred).toBeDefined();
    });

    it('should return undefined for unknown destination', () => {
      const preferred = router.getPreferredRoute(createTestNodeId(99));
      expect(preferred).toBeUndefined();
    });
  });

  describe('getAllRoutes', () => {
    it('should return all routes across destinations', () => {
      router.addRoute(createTestRoute(createTestNodeId(1), 'dht'));
      router.addRoute(createTestRoute(createTestNodeId(2), 'mesh'));
      router.addRoute(createTestRoute(createTestNodeId(3), 'sdwan'));

      const allRoutes = router.getAllRoutes();
      expect(allRoutes).toHaveLength(3);
    });
  });

  describe('isProtocolConnected', () => {
    it('should return true for connected protocol', async () => {
      await router.start();
      expect(router.isProtocolConnected('dht')).toBe(true);
    });

    it('should return false for disconnected protocol', () => {
      expect(router.isProtocolConnected('onion')).toBe(false);
    });
  });

  describe('getConnectedProtocols', () => {
    it('should return list of connected protocols', async () => {
      await router.start();
      const connected = router.getConnectedProtocols();

      expect(connected.length).toBeGreaterThan(0);
      expect(connected).toContain('dht');
    });
  });

  describe('probeRoute', () => {
    it('should update route metrics', async () => {
      const route = createTestRoute(createTestNodeId(1), 'dht');
      router.addRoute(route);

      const originalLatency = route.metrics.latencyMs;
      const metrics = await router.probeRoute(route.id);

      expect(metrics).not.toBeNull();
      // Metrics should be updated (may be same or different due to random variation)
      expect(typeof metrics?.latencyMs).toBe('number');
    });

    it('should emit route:updated event', async () => {
      const updatedHandler = vi.fn();
      router.on('route:updated', updatedHandler);

      const route = createTestRoute(createTestNodeId(1), 'dht');
      router.addRoute(route);

      await router.probeRoute(route.id);

      expect(updatedHandler).toHaveBeenCalled();
    });

    it('should return null for unknown route', async () => {
      const metrics = await router.probeRoute('unknown-route');
      expect(metrics).toBeNull();
    });

    it('should extend route expiration', async () => {
      const route = createTestRoute(createTestNodeId(1), 'dht');
      const originalExpiry = route.expiresAt;
      router.addRoute(route);

      vi.advanceTimersByTime(60000);
      await router.probeRoute(route.id);

      expect(route.expiresAt).toBeGreaterThan(originalExpiry);
    });
  });
});

describe('Path Selection Policies', () => {
  let router: UnifiedRouter;
  const localNodeId = createTestNodeId(0);
  const destination = createTestNodeId(1);

  beforeEach(async () => {
    router = new UnifiedRouter({ nodeId: localNodeId });
    await router.start();
  });

  afterEach(async () => {
    await router.stop();
  });

  describe('lowest-latency', () => {
    it('should select route with lowest latency', () => {
      router.setPathSelectionPolicy('lowest-latency');

      const slowRoute = createTestRoute(destination, 'dht', {
        id: 'slow',
        metrics: { latencyMs: 200, bandwidthMbps: 100, packetLoss: 0, hopCount: 2, jitterMs: 5, lastUpdated: Date.now() },
      });
      const fastRoute = createTestRoute(destination, 'direct', {
        id: 'fast',
        metrics: { latencyMs: 10, bandwidthMbps: 50, packetLoss: 0, hopCount: 1, jitterMs: 2, lastUpdated: Date.now() },
      });

      router.addRoute(slowRoute);
      router.addRoute(fastRoute);

      const preferred = router.getPreferredRoute(destination);
      expect(preferred?.id).toBe('fast');
    });
  });

  describe('highest-bandwidth', () => {
    it('should select route with highest bandwidth', () => {
      router.setPathSelectionPolicy('highest-bandwidth');

      const lowBw = createTestRoute(destination, 'mesh', {
        id: 'low-bw',
        metrics: { latencyMs: 50, bandwidthMbps: 10, packetLoss: 0, hopCount: 3, jitterMs: 5, lastUpdated: Date.now() },
      });
      const highBw = createTestRoute(destination, 'sdwan', {
        id: 'high-bw',
        metrics: { latencyMs: 100, bandwidthMbps: 1000, packetLoss: 0, hopCount: 2, jitterMs: 5, lastUpdated: Date.now() },
      });

      router.addRoute(lowBw);
      router.addRoute(highBw);

      const preferred = router.getPreferredRoute(destination);
      expect(preferred?.id).toBe('high-bw');
    });
  });

  describe('lowest-cost', () => {
    it('should select route with lowest cost', () => {
      router.setPathSelectionPolicy('lowest-cost');

      const expensive = createTestRoute(destination, 'onion', {
        id: 'expensive',
        cost: 100,
      });
      const cheap = createTestRoute(destination, 'direct', {
        id: 'cheap',
        cost: 5,
      });

      router.addRoute(expensive);
      router.addRoute(cheap);

      const preferred = router.getPreferredRoute(destination);
      expect(preferred?.id).toBe('cheap');
    });
  });

  describe('anonymous', () => {
    it('should prefer onion routes for anonymity', () => {
      router.setPathSelectionPolicy('anonymous');

      const directRoute = createTestRoute(destination, 'direct', {
        id: 'direct',
        metrics: { latencyMs: 10, bandwidthMbps: 1000, packetLoss: 0, hopCount: 1, jitterMs: 1, lastUpdated: Date.now() },
      });
      const onionRoute = createTestRoute(destination, 'onion', {
        id: 'onion',
        metrics: { latencyMs: 200, bandwidthMbps: 10, packetLoss: 0, hopCount: 6, jitterMs: 20, lastUpdated: Date.now() },
      });

      router.addRoute(directRoute);
      router.addRoute(onionRoute);

      const preferred = router.getPreferredRoute(destination);
      expect(preferred?.id).toBe('onion');
    });

    it('should fall back to balanced when no onion routes', () => {
      router.setPathSelectionPolicy('anonymous');

      const route1 = createTestRoute(destination, 'dht', { id: 'dht-1' });
      const route2 = createTestRoute(destination, 'mesh', { id: 'mesh-1' });

      router.addRoute(route1);
      router.addRoute(route2);

      const preferred = router.getPreferredRoute(destination);
      expect(preferred).toBeDefined();
    });
  });

  describe('balanced', () => {
    it('should consider multiple factors', () => {
      router.setPathSelectionPolicy('balanced');

      // Route with good all-around metrics
      const balanced = createTestRoute(destination, 'sdwan', {
        id: 'balanced',
        cost: 15,
        metrics: { latencyMs: 30, bandwidthMbps: 200, packetLoss: 0.5, hopCount: 2, jitterMs: 5, lastUpdated: Date.now() },
      });

      // Route with extreme low latency but poor bandwidth
      const extreme = createTestRoute(destination, 'direct', {
        id: 'extreme',
        cost: 1,
        metrics: { latencyMs: 5, bandwidthMbps: 1, packetLoss: 5, hopCount: 1, jitterMs: 20, lastUpdated: Date.now() },
      });

      router.addRoute(balanced);
      router.addRoute(extreme);

      const preferred = router.getPreferredRoute(destination);
      // Balanced should win due to overall better metrics
      expect(preferred?.id).toBe('balanced');
    });
  });

  describe('setPathSelectionPolicy', () => {
    it('should re-evaluate all preferred routes', () => {
      const pathSelectedHandler = vi.fn();
      router.on('path:selected', pathSelectedHandler);

      // Add routes with default policy
      router.addRoute(createTestRoute(destination, 'dht'));
      router.addRoute(createTestRoute(createTestNodeId(2), 'mesh'));

      const callsBefore = pathSelectedHandler.mock.calls.length;

      // Change policy
      router.setPathSelectionPolicy('lowest-latency');

      // Should have re-evaluated routes
      expect(pathSelectedHandler.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });
});
