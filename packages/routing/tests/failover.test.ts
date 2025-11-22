/**
 * Route Failover and Maintenance Tests
 *
 * Tests for route expiration, state management, and failover behavior.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { UnifiedRouter, createRouter } from '../src';
import type { Route, RouteState, RoutingProtocol, RoutingStats } from '../src';
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
    path: [createTestNodeId(100)],
    cost: 20,
    createdAt: now,
    expiresAt: now + 300000, // 5 minutes default
    ...overrides,
  };
}

describe('Route Expiration', () => {
  let router: UnifiedRouter;
  const localNodeId = createTestNodeId(0);

  beforeEach(async () => {
    router = createRouter({
      nodeId: localNodeId,
      routeTimeout: 60000, // 1 minute
      refreshInterval: 10000, // 10 seconds
    });
    await router.start();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await router.stop();
    vi.useRealTimers();
  });

  it('should expire routes after timeout', () => {
    const now = Date.now();
    const route = createTestRoute(createTestNodeId(1), 'dht', {
      expiresAt: now + 30000, // 30 seconds
    });
    router.addRoute(route);

    expect(router.getRoute(route.id)).toBeDefined();

    // Advance past expiration and trigger refresh
    vi.advanceTimersByTime(40000);

    expect(router.getRoute(route.id)).toBeUndefined();
  });

  it('should emit route:expired on expiration', () => {
    const expiredHandler = vi.fn();
    router.on('route:expired', expiredHandler);

    const now = Date.now();
    const route = createTestRoute(createTestNodeId(1), 'dht', {
      expiresAt: now + 5000,
    });
    router.addRoute(route);

    vi.advanceTimersByTime(15000);

    expect(expiredHandler).toHaveBeenCalledWith(route.id);
  });

  it('should keep routes that have not expired', () => {
    const now = Date.now();
    const longLivedRoute = createTestRoute(createTestNodeId(1), 'dht', {
      id: 'long-lived',
      expiresAt: now + 600000, // 10 minutes
    });
    const shortLivedRoute = createTestRoute(createTestNodeId(2), 'mesh', {
      id: 'short-lived',
      expiresAt: now + 5000, // 5 seconds
    });

    router.addRoute(longLivedRoute);
    router.addRoute(shortLivedRoute);

    vi.advanceTimersByTime(30000);

    expect(router.getRoute('long-lived')).toBeDefined();
    expect(router.getRoute('short-lived')).toBeUndefined();
  });
});

describe('Route State Management', () => {
  let router: UnifiedRouter;
  const localNodeId = createTestNodeId(0);

  beforeEach(async () => {
    router = createRouter({
      nodeId: localNodeId,
      refreshInterval: 5000,
    });
    await router.start();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await router.stop();
    vi.useRealTimers();
  });

  it('should transition to degraded on high packet loss', () => {
    const route = createTestRoute(createTestNodeId(1), 'dht', {
      metrics: {
        latencyMs: 50,
        bandwidthMbps: 100,
        packetLoss: 20, // 20% loss
        hopCount: 3,
        jitterMs: 5,
        lastUpdated: Date.now(),
      },
    });
    router.addRoute(route);

    // Trigger refresh to evaluate state
    vi.advanceTimersByTime(10000);

    expect(route.state).toBe('degraded');
  });

  it('should transition to failed on severe packet loss', () => {
    const route = createTestRoute(createTestNodeId(1), 'dht', {
      metrics: {
        latencyMs: 50,
        bandwidthMbps: 100,
        packetLoss: 60, // 60% loss
        hopCount: 3,
        jitterMs: 5,
        lastUpdated: Date.now(),
      },
    });
    router.addRoute(route);

    vi.advanceTimersByTime(10000);

    expect(route.state).toBe('failed');
  });

  it('should transition to degraded on high latency', () => {
    const route = createTestRoute(createTestNodeId(1), 'dht', {
      metrics: {
        latencyMs: 1500, // Very high latency
        bandwidthMbps: 100,
        packetLoss: 0,
        hopCount: 3,
        jitterMs: 5,
        lastUpdated: Date.now(),
      },
    });
    router.addRoute(route);

    vi.advanceTimersByTime(10000);

    expect(route.state).toBe('degraded');
  });

  it('should emit route:updated on state change', () => {
    const updatedHandler = vi.fn();
    router.on('route:updated', updatedHandler);

    const route = createTestRoute(createTestNodeId(1), 'dht', {
      metrics: {
        latencyMs: 50,
        bandwidthMbps: 100,
        packetLoss: 25,
        hopCount: 3,
        jitterMs: 5,
        lastUpdated: Date.now(),
      },
    });
    router.addRoute(route);

    vi.advanceTimersByTime(10000);

    expect(updatedHandler).toHaveBeenCalled();
  });

  it('should keep active state for healthy routes', () => {
    const route = createTestRoute(createTestNodeId(1), 'dht', {
      metrics: {
        latencyMs: 20,
        bandwidthMbps: 500,
        packetLoss: 0,
        hopCount: 2,
        jitterMs: 2,
        lastUpdated: Date.now(),
      },
    });
    router.addRoute(route);

    vi.advanceTimersByTime(10000);

    expect(route.state).toBe('active');
  });
});

describe('Failover Behavior', () => {
  let router: UnifiedRouter;
  const localNodeId = createTestNodeId(0);
  const destination = createTestNodeId(1);

  beforeEach(async () => {
    router = createRouter({
      nodeId: localNodeId,
      refreshInterval: 5000,
    });
    await router.start();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await router.stop();
    vi.useRealTimers();
  });

  it('should select alternative route when preferred fails', () => {
    // Add primary route (best metrics)
    const primaryRoute = createTestRoute(destination, 'direct', {
      id: 'primary',
      cost: 1,
      metrics: { latencyMs: 10, bandwidthMbps: 1000, packetLoss: 0, hopCount: 1, jitterMs: 1, lastUpdated: Date.now() },
    });

    // Add backup route
    const backupRoute = createTestRoute(destination, 'dht', {
      id: 'backup',
      cost: 20,
      metrics: { latencyMs: 50, bandwidthMbps: 100, packetLoss: 0, hopCount: 3, jitterMs: 5, lastUpdated: Date.now() },
    });

    router.addRoute(primaryRoute);
    router.addRoute(backupRoute);

    // Primary should be preferred
    expect(router.getPreferredRoute(destination)?.id).toBe('primary');

    // Fail primary
    primaryRoute.state = 'failed';
    primaryRoute.metrics.packetLoss = 100;

    // Force re-evaluation by triggering refresh
    vi.advanceTimersByTime(10000);

    // Backup should now be preferred
    const preferred = router.getPreferredRoute(destination);
    expect(preferred?.id).toBe('backup');
  });

  it('should select from active routes only', () => {
    router.addRoute(createTestRoute(destination, 'direct', {
      id: 'failed',
      state: 'failed',
      cost: 1,
    }));
    router.addRoute(createTestRoute(destination, 'dht', {
      id: 'degraded',
      state: 'degraded',
      cost: 10,
    }));
    router.addRoute(createTestRoute(destination, 'mesh', {
      id: 'active',
      state: 'active',
      cost: 50,
    }));

    const preferred = router.getPreferredRoute(destination);

    // Should skip failed, use degraded if no active, otherwise active
    // In this case, should get either degraded or active based on scoring
    expect(preferred?.state).not.toBe('failed');
  });

  it('should handle all routes failing gracefully', () => {
    const route1 = createTestRoute(destination, 'direct', {
      id: 'route-1',
      state: 'failed',
    });
    const route2 = createTestRoute(destination, 'dht', {
      id: 'route-2',
      state: 'failed',
    });

    router.addRoute(route1);
    router.addRoute(route2);

    // Should fall back to first route (degraded preference)
    const preferred = router.getPreferredRoute(destination);
    expect(preferred).toBeDefined();
  });
});

describe('Statistics', () => {
  let router: UnifiedRouter;
  const localNodeId = createTestNodeId(0);

  beforeEach(async () => {
    router = createRouter({ nodeId: localNodeId });
    await router.start();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await router.stop();
    vi.useRealTimers();
  });

  it('should track total routes', () => {
    router.addRoute(createTestRoute(createTestNodeId(1), 'dht'));
    router.addRoute(createTestRoute(createTestNodeId(2), 'mesh'));
    router.addRoute(createTestRoute(createTestNodeId(3), 'sdwan'));

    const stats = router.getStats();
    expect(stats.totalRoutes).toBe(3);
  });

  it('should track routes by state', () => {
    router.addRoute(createTestRoute(createTestNodeId(1), 'dht', { state: 'active' }));
    router.addRoute(createTestRoute(createTestNodeId(2), 'mesh', { state: 'active' }));
    router.addRoute(createTestRoute(createTestNodeId(3), 'sdwan', { state: 'degraded' }));
    router.addRoute(createTestRoute(createTestNodeId(4), 'onion', { state: 'failed' }));

    const stats = router.getStats();
    expect(stats.activeRoutes).toBe(2);
    expect(stats.degradedRoutes).toBe(1);
    expect(stats.failedRoutes).toBe(1);
  });

  it('should track routes by protocol', () => {
    router.addRoute(createTestRoute(createTestNodeId(1), 'dht'));
    router.addRoute(createTestRoute(createTestNodeId(2), 'dht'));
    router.addRoute(createTestRoute(createTestNodeId(3), 'mesh'));
    router.addRoute(createTestRoute(createTestNodeId(4), 'sdwan'));

    const stats = router.getStats();
    expect(stats.routesByProtocol.dht).toBe(2);
    expect(stats.routesByProtocol.mesh).toBe(1);
    expect(stats.routesByProtocol.sdwan).toBe(1);
    expect(stats.routesByProtocol.direct).toBe(0);
    expect(stats.routesByProtocol.onion).toBe(0);
  });

  it('should calculate average latency', () => {
    router.addRoute(createTestRoute(createTestNodeId(1), 'dht', {
      metrics: { latencyMs: 20, bandwidthMbps: 100, packetLoss: 0, hopCount: 2, jitterMs: 2, lastUpdated: Date.now() },
    }));
    router.addRoute(createTestRoute(createTestNodeId(2), 'mesh', {
      metrics: { latencyMs: 40, bandwidthMbps: 50, packetLoss: 0, hopCount: 3, jitterMs: 5, lastUpdated: Date.now() },
    }));
    router.addRoute(createTestRoute(createTestNodeId(3), 'sdwan', {
      metrics: { latencyMs: 60, bandwidthMbps: 200, packetLoss: 0, hopCount: 2, jitterMs: 3, lastUpdated: Date.now() },
    }));

    const stats = router.getStats();
    expect(stats.averageLatency).toBe(40); // (20 + 40 + 60) / 3
  });

  it('should calculate average hop count', () => {
    router.addRoute(createTestRoute(createTestNodeId(1), 'direct', {
      metrics: { latencyMs: 10, bandwidthMbps: 1000, packetLoss: 0, hopCount: 1, jitterMs: 1, lastUpdated: Date.now() },
    }));
    router.addRoute(createTestRoute(createTestNodeId(2), 'dht', {
      metrics: { latencyMs: 50, bandwidthMbps: 100, packetLoss: 0, hopCount: 4, jitterMs: 5, lastUpdated: Date.now() },
    }));
    router.addRoute(createTestRoute(createTestNodeId(3), 'onion', {
      metrics: { latencyMs: 200, bandwidthMbps: 10, packetLoss: 0, hopCount: 7, jitterMs: 20, lastUpdated: Date.now() },
    }));

    const stats = router.getStats();
    expect(stats.averageHopCount).toBe(4); // (1 + 4 + 7) / 3
  });

  it('should emit stats:updated periodically', () => {
    const statsHandler = vi.fn();
    router.on('stats:updated', statsHandler);

    router.addRoute(createTestRoute(createTestNodeId(1), 'dht'));

    // Trigger refresh cycle
    vi.advanceTimersByTime(35000);

    expect(statsHandler).toHaveBeenCalled();
  });

  it('should handle empty routing table', () => {
    const stats = router.getStats();

    expect(stats.totalRoutes).toBe(0);
    expect(stats.activeRoutes).toBe(0);
    expect(stats.averageLatency).toBe(0);
    expect(stats.averageHopCount).toBe(0);
  });
});

describe('Routing Table Export', () => {
  let router: UnifiedRouter;
  const localNodeId = createTestNodeId(0);

  beforeEach(async () => {
    router = createRouter({ nodeId: localNodeId });
    await router.start();
  });

  afterEach(async () => {
    await router.stop();
  });

  it('should export all routing table entries', () => {
    router.addRoute(createTestRoute(createTestNodeId(1), 'dht'));
    router.addRoute(createTestRoute(createTestNodeId(2), 'mesh'));

    const entries = router.exportRoutingTable();

    expect(entries).toHaveLength(2);
    entries.forEach(entry => {
      expect(entry.destination).toBeDefined();
      expect(entry.routes).toBeDefined();
      expect(Array.isArray(entry.routes)).toBe(true);
    });
  });

  it('should include preferred route in entries', () => {
    router.addRoute(createTestRoute(createTestNodeId(1), 'dht', { id: 'route-1' }));

    const entries = router.exportRoutingTable();
    const entry = entries.find(e => e.destination === createTestNodeId(1));

    expect(entry?.preferredRoute).toBe('route-1');
  });
});

describe('Configuration', () => {
  it('should get current configuration', async () => {
    const router = createRouter({
      nodeId: createTestNodeId(0),
      protocols: ['dht', 'mesh'],
      pathSelectionPolicy: 'lowest-latency',
      routeTimeout: 120000,
    });

    const config = router.getConfig();

    expect(config.protocols).toEqual(['dht', 'mesh']);
    expect(config.pathSelectionPolicy).toBe('lowest-latency');
    expect(config.routeTimeout).toBe(120000);
  });

  it('should update configuration', async () => {
    const router = createRouter({ nodeId: createTestNodeId(0) });

    router.updateConfig({
      pathSelectionPolicy: 'highest-bandwidth',
      enableAnonymous: true,
    });

    const config = router.getConfig();
    expect(config.pathSelectionPolicy).toBe('highest-bandwidth');
    expect(config.enableAnonymous).toBe(true);
  });

  it('should preserve other config when updating', () => {
    const router = createRouter({
      nodeId: createTestNodeId(0),
      protocols: ['dht', 'mesh'],
      maxRoutes: 500,
    });

    router.updateConfig({ pathSelectionPolicy: 'anonymous' });

    const config = router.getConfig();
    expect(config.protocols).toEqual(['dht', 'mesh']);
    expect(config.maxRoutes).toBe(500);
    expect(config.pathSelectionPolicy).toBe('anonymous');
  });
});
