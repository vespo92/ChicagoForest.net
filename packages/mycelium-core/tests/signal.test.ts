/**
 * SignalPropagator Unit Tests
 *
 * Tests for the gossip protocol signal propagation system.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SignalPropagator } from '../src/signal';
import type { Signal, SignalType } from '../src/types';
import type { NodeId } from '@chicago-forest/shared-types';

// Test helpers
function createTestNodeId(seed: number): NodeId {
  return `CFN-${seed.toString(16).padStart(32, '0')}`;
}

function createTestSignal(
  type: SignalType,
  origin: NodeId,
  payload: unknown,
  ttl: number = 7
): Signal {
  return {
    type,
    origin,
    payload,
    ttl,
    id: `signal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    signature: '',
  };
}

describe('SignalPropagator', () => {
  let propagator: SignalPropagator;
  const localNodeId = createTestNodeId(0);

  beforeEach(() => {
    propagator = new SignalPropagator(localNodeId);
    vi.useFakeTimers();
  });

  afterEach(() => {
    propagator.stop();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      const stats = propagator.getStats();
      expect(stats.cacheSize).toBe(0);
      expect(stats.handlersRegistered).toBe(0);
      expect(stats.pendingBatchSize).toBe(0);
    });

    it('should accept custom configuration', () => {
      const customPropagator = new SignalPropagator(localNodeId, {
        defaultTTL: 10,
        maxCacheSize: 5000,
        cacheExpiry: 120000,
        rateLimit: 50,
        batchingEnabled: false,
        batchInterval: 200,
      });

      expect(customPropagator.getStats().availableTokens).toBe(50);
      customPropagator.stop();
    });
  });

  describe('broadcast', () => {
    it('should create and propagate a new signal', async () => {
      const peers = [createTestNodeId(1), createTestNodeId(2)];
      propagator.setPeerProvider(() => peers);

      const sentSignals: Signal[] = [];
      propagator.setPeerSender(async (peer, signal) => {
        sentSignals.push(signal);
      });

      propagator.start();

      const signal = await propagator.broadcast('discovery', { nodeId: localNodeId });

      // Flush batch
      vi.advanceTimersByTime(200);

      expect(signal.type).toBe('discovery');
      expect(signal.origin).toBe(localNodeId);
      expect(signal.payload).toEqual({ nodeId: localNodeId });
    });

    it('should use default TTL when not specified', async () => {
      propagator.setPeerProvider(() => []);
      propagator.start();

      const signal = await propagator.broadcast('heartbeat', {});

      expect(signal.ttl).toBe(7); // Default TTL
    });

    it('should use custom TTL when specified', async () => {
      propagator.setPeerProvider(() => []);
      propagator.start();

      const signal = await propagator.broadcast('alert', { severity: 'high' }, 3);

      expect(signal.ttl).toBe(3);
    });

    it('should generate unique signal IDs', async () => {
      propagator.setPeerProvider(() => []);
      propagator.start();

      const signal1 = await propagator.broadcast('heartbeat', {});
      const signal2 = await propagator.broadcast('heartbeat', {});

      expect(signal1.id).not.toBe(signal2.id);
    });
  });

  describe('onSignal', () => {
    it('should register signal handlers', () => {
      const handler = vi.fn();
      propagator.onSignal('discovery', handler);

      const stats = propagator.getStats();
      expect(stats.handlersRegistered).toBe(1);
    });

    it('should return unsubscribe function', () => {
      const handler = vi.fn();
      const unsubscribe = propagator.onSignal('discovery', handler);

      expect(propagator.getStats().handlersRegistered).toBe(1);

      unsubscribe();

      expect(propagator.getStats().handlersRegistered).toBe(0);
    });

    it('should allow multiple handlers per signal type', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      propagator.onSignal('alert', handler1);
      propagator.onSignal('alert', handler2);

      expect(propagator.getStats().handlersRegistered).toBe(2);
    });
  });

  describe('handleIncoming', () => {
    it('should call registered handlers', async () => {
      const handler = vi.fn();
      propagator.onSignal('discovery', handler);

      const signal = createTestSignal('discovery', createTestNodeId(1), { test: true });
      await propagator.handleIncoming(signal);

      expect(handler).toHaveBeenCalledWith(signal);
    });

    it('should emit signal:received event', async () => {
      const receivedHandler = vi.fn();
      propagator.on('signal:received', receivedHandler);

      const signal = createTestSignal('heartbeat', createTestNodeId(1), {});
      await propagator.handleIncoming(signal);

      expect(receivedHandler).toHaveBeenCalledWith(signal);
    });

    it('should deduplicate signals', async () => {
      const handler = vi.fn();
      propagator.onSignal('discovery', handler);

      const signal = createTestSignal('discovery', createTestNodeId(1), {});

      await propagator.handleIncoming(signal);
      await propagator.handleIncoming(signal); // Same signal again

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should forward signals with TTL > 1', async () => {
      const peers = [createTestNodeId(2), createTestNodeId(3)];
      propagator.setPeerProvider(() => peers);

      const forwardedSignals: { peer: NodeId; signal: Signal }[] = [];
      propagator.setPeerSender(async (peer, signal) => {
        forwardedSignals.push({ peer, signal });
      });

      propagator.start();

      const signal = createTestSignal('discovery', createTestNodeId(1), {}, 5);
      await propagator.handleIncoming(signal);

      // Flush batch
      vi.advanceTimersByTime(200);

      expect(forwardedSignals.length).toBe(2); // Sent to both peers
      expect(forwardedSignals[0].signal.ttl).toBe(4); // TTL decremented
    });

    it('should not forward signals with TTL = 1', async () => {
      const peers = [createTestNodeId(2)];
      propagator.setPeerProvider(() => peers);

      const forwardedSignals: Signal[] = [];
      propagator.setPeerSender(async (peer, signal) => {
        forwardedSignals.push(signal);
      });

      propagator.start();

      const signal = createTestSignal('discovery', createTestNodeId(1), {}, 1);
      await propagator.handleIncoming(signal);

      vi.advanceTimersByTime(200);

      expect(forwardedSignals).toHaveLength(0);
    });

    it('should not send signal back to origin', async () => {
      const origin = createTestNodeId(1);
      const peers = [origin, createTestNodeId(2)];
      propagator.setPeerProvider(() => peers);

      const sentTo: NodeId[] = [];
      propagator.setPeerSender(async (peer, signal) => {
        sentTo.push(peer);
      });

      propagator.start();

      const signal = createTestSignal('discovery', origin, {}, 5);
      await propagator.handleIncoming(signal);

      vi.advanceTimersByTime(200);

      expect(sentTo).not.toContain(origin);
    });

    it('should handle errors in signal handlers gracefully', async () => {
      const errorHandler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      const successHandler = vi.fn();

      propagator.onSignal('discovery', errorHandler);
      propagator.onSignal('discovery', successHandler);

      const signal = createTestSignal('discovery', createTestNodeId(1), {});

      // Should not throw
      await expect(propagator.handleIncoming(signal)).resolves.not.toThrow();

      // Both handlers should have been called
      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
    });
  });

  describe('batching', () => {
    it('should batch signals when enabled', async () => {
      const peers = [createTestNodeId(1)];
      propagator.setPeerProvider(() => peers);

      let sendCount = 0;
      propagator.setPeerSender(async () => {
        sendCount++;
      });

      propagator.start();

      await propagator.broadcast('heartbeat', {});
      await propagator.broadcast('heartbeat', {});
      await propagator.broadcast('heartbeat', {});

      // Before flush
      expect(sendCount).toBe(0);
      expect(propagator.getStats().pendingBatchSize).toBe(3);

      // Flush batch
      vi.advanceTimersByTime(200);

      // After flush
      expect(sendCount).toBe(3);
      expect(propagator.getStats().pendingBatchSize).toBe(0);
    });

    it('should send immediately when batching disabled', async () => {
      const noBatchPropagator = new SignalPropagator(localNodeId, {
        batchingEnabled: false,
      });

      const peers = [createTestNodeId(1)];
      noBatchPropagator.setPeerProvider(() => peers);

      let sendCount = 0;
      noBatchPropagator.setPeerSender(async () => {
        sendCount++;
      });

      await noBatchPropagator.broadcast('heartbeat', {});

      expect(sendCount).toBe(1);

      noBatchPropagator.stop();
    });
  });

  describe('rate limiting', () => {
    it('should respect rate limits', async () => {
      const limitedPropagator = new SignalPropagator(localNodeId, {
        rateLimit: 2,
        batchingEnabled: false,
      });

      const peers = [createTestNodeId(1)];
      limitedPropagator.setPeerProvider(() => peers);

      let sendCount = 0;
      limitedPropagator.setPeerSender(async () => {
        sendCount++;
      });

      // Broadcast multiple signals rapidly
      await limitedPropagator.broadcast('heartbeat', {});
      await limitedPropagator.broadcast('heartbeat', {});
      await limitedPropagator.broadcast('heartbeat', {}); // Should be rate limited

      // Only 2 should have been sent
      expect(sendCount).toBe(2);

      limitedPropagator.stop();
    });

    it('should refill tokens over time', async () => {
      const limitedPropagator = new SignalPropagator(localNodeId, {
        rateLimit: 1,
        batchingEnabled: false,
      });

      const peers = [createTestNodeId(1)];
      limitedPropagator.setPeerProvider(() => peers);

      let sendCount = 0;
      limitedPropagator.setPeerSender(async () => {
        sendCount++;
      });

      // Use up token
      await limitedPropagator.broadcast('heartbeat', {});
      expect(sendCount).toBe(1);

      // Wait for refill
      vi.advanceTimersByTime(2000);

      // Should be able to send again
      await limitedPropagator.broadcast('heartbeat', {});
      expect(sendCount).toBe(2);

      limitedPropagator.stop();
    });
  });

  describe('cache management', () => {
    it('should cache seen signals', async () => {
      const signal = createTestSignal('discovery', createTestNodeId(1), {});
      await propagator.handleIncoming(signal);

      expect(propagator.getStats().cacheSize).toBe(1);
    });

    it('should expire old cache entries', async () => {
      const shortCachePropagator = new SignalPropagator(localNodeId, {
        cacheExpiry: 1000,
      });
      shortCachePropagator.start();

      const signal = createTestSignal('discovery', createTestNodeId(1), {});
      await shortCachePropagator.handleIncoming(signal);

      expect(shortCachePropagator.getStats().cacheSize).toBe(1);

      // Advance past expiry
      vi.advanceTimersByTime(2000);

      expect(shortCachePropagator.getStats().cacheSize).toBe(0);

      shortCachePropagator.stop();
    });

    it('should enforce max cache size', async () => {
      const smallCachePropagator = new SignalPropagator(localNodeId, {
        maxCacheSize: 3,
        cacheExpiry: 60000, // Long expiry so cache cleanup is based on size
      });
      smallCachePropagator.start();

      // Add more signals than cache can hold
      for (let i = 0; i < 5; i++) {
        const signal = createTestSignal('heartbeat', createTestNodeId(i + 1), {});
        await smallCachePropagator.handleIncoming(signal);
      }

      // Trigger cleanup
      vi.advanceTimersByTime(35000);

      expect(smallCachePropagator.getStats().cacheSize).toBeLessThanOrEqual(3);

      smallCachePropagator.stop();
    });
  });

  describe('lifecycle', () => {
    it('should start batch timer', () => {
      propagator.start();

      const stats = propagator.getStats();
      expect(stats.pendingBatchSize).toBe(0);
    });

    it('should flush remaining batch on stop', async () => {
      const peers = [createTestNodeId(1)];
      propagator.setPeerProvider(() => peers);

      let sendCount = 0;
      propagator.setPeerSender(async () => {
        sendCount++;
      });

      propagator.start();
      await propagator.broadcast('heartbeat', {});

      expect(sendCount).toBe(0); // Not yet flushed

      propagator.stop();

      expect(sendCount).toBe(1); // Flushed on stop
    });
  });

  describe('getStats', () => {
    it('should return accurate statistics', async () => {
      propagator.onSignal('discovery', vi.fn());
      propagator.onSignal('alert', vi.fn());
      propagator.onSignal('alert', vi.fn());

      propagator.start();
      await propagator.broadcast('heartbeat', {});

      const stats = propagator.getStats();

      expect(stats.handlersRegistered).toBe(3);
      expect(stats.pendingBatchSize).toBe(1);
      expect(stats.availableTokens).toBeLessThanOrEqual(100);
    });
  });
});
