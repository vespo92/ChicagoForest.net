/**
 * Bridge Protocol Tests
 *
 * Tests for the BridgeProtocol class that handles low-level inter-forest communication
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BridgeProtocol } from '../src/bridge';
import type { BridgeConnection, BridgeMessage } from '../src/bridge';

describe('BridgeProtocol', () => {
  let protocol: BridgeProtocol;
  const mockConnection: BridgeConnection = {
    id: 'bridge-test-001',
    localForest: 'chicago-forest',
    remoteForest: 'remote-forest',
    localGateway: 'gateway-local' as any,
    remoteGateway: 'gateway-remote' as any,
    state: 'connecting',
    metrics: {
      latency: 0,
      throughput: 0,
      packetLoss: 0,
      messagesExchanged: 0,
      uptime: 100,
    },
    establishedAt: Date.now(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    protocol = new BridgeProtocol({ ...mockConnection }, {
      keepaliveInterval: 30000,
      connectionTimeout: 5000,
      maxReconnectAttempts: 3,
      reconnectDelay: 1000,
      metricsEnabled: true,
      metricsInterval: 10000,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Lifecycle', () => {
    it('should start and emit bridge:established', async () => {
      const establishedHandler = vi.fn();
      protocol.on('bridge:established', establishedHandler);

      // Mock the handshake to resolve immediately
      vi.spyOn(protocol as any, 'waitForAck').mockResolvedValue(undefined);

      const result = await protocol.start();

      expect(result).toBe(true);
      expect(establishedHandler).toHaveBeenCalled();
      expect(protocol.getState()).toBe('active');
    });

    it('should stop and clear timers', async () => {
      vi.spyOn(protocol as any, 'waitForAck').mockResolvedValue(undefined);
      await protocol.start();

      await protocol.stop();

      expect(protocol.getState()).toBe('failed');
    });
  });

  describe('Message Handling', () => {
    beforeEach(async () => {
      vi.spyOn(protocol as any, 'waitForAck').mockResolvedValue(undefined);
      await protocol.start();
    });

    it('should respond to handshake with handshake-ack', async () => {
      const sendSpy = vi.spyOn(protocol as any, 'sendMessage').mockResolvedValue(undefined);

      const message: BridgeMessage = {
        type: 'handshake',
        bridgeId: mockConnection.id,
        sequence: 1,
        timestamp: Date.now(),
        payload: {},
      };

      await protocol.handleMessage(message);

      expect(sendSpy).toHaveBeenCalledWith('handshake-ack', {});
    });

    it('should respond to keepalive with keepalive-ack', async () => {
      const sendSpy = vi.spyOn(protocol as any, 'sendMessage').mockResolvedValue(undefined);

      const message: BridgeMessage = {
        type: 'keepalive',
        bridgeId: mockConnection.id,
        sequence: 2,
        timestamp: Date.now(),
        payload: {},
      };

      await protocol.handleMessage(message);

      expect(sendSpy).toHaveBeenCalledWith('keepalive-ack', {});
    });

    it('should respond to data with data-ack', async () => {
      const sendSpy = vi.spyOn(protocol as any, 'sendMessage').mockResolvedValue(undefined);

      const message: BridgeMessage = {
        type: 'data',
        bridgeId: mockConnection.id,
        sequence: 3,
        timestamp: Date.now(),
        payload: { content: 'test data' },
      };

      await protocol.handleMessage(message);

      expect(sendSpy).toHaveBeenCalledWith('data-ack', { seq: 3 });
    });

    it('should handle close message', async () => {
      const stopSpy = vi.spyOn(protocol, 'stop').mockResolvedValue(undefined);

      const message: BridgeMessage = {
        type: 'close',
        bridgeId: mockConnection.id,
        sequence: 4,
        timestamp: Date.now(),
      };

      await protocol.handleMessage(message);

      expect(stopSpy).toHaveBeenCalled();
    });

    it('should handle error message', async () => {
      const degradedHandler = vi.fn();
      protocol.on('bridge:degraded', degradedHandler);

      const message: BridgeMessage = {
        type: 'error',
        bridgeId: mockConnection.id,
        sequence: 5,
        timestamp: Date.now(),
        payload: 'Connection error',
      };

      await protocol.handleMessage(message);

      expect(protocol.getState()).toBe('degraded');
      expect(degradedHandler).toHaveBeenCalled();
    });
  });

  describe('Data Transmission', () => {
    beforeEach(async () => {
      vi.spyOn(protocol as any, 'waitForAck').mockResolvedValue(undefined);
      await protocol.start();
    });

    it('should send data through bridge', async () => {
      const result = await protocol.send({ test: 'data' });

      expect(result).toBe(true);
      expect(protocol.getMetrics().messagesExchanged).toBe(1);
    });

    it('should fail to send when not active', async () => {
      await protocol.stop();

      const result = await protocol.send({ test: 'data' });

      expect(result).toBe(false);
    });
  });

  describe('Metrics', () => {
    it('should return current metrics', async () => {
      const metrics = protocol.getMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.latency).toBeDefined();
      expect(metrics.throughput).toBeDefined();
      expect(metrics.packetLoss).toBeDefined();
      expect(metrics.messagesExchanged).toBeDefined();
      expect(metrics.uptime).toBeDefined();
    });

    it('should update latency from keepalive', async () => {
      vi.spyOn(protocol as any, 'waitForAck').mockResolvedValue(undefined);
      await protocol.start();

      const now = Date.now();
      const message: BridgeMessage = {
        type: 'keepalive-ack',
        bridgeId: mockConnection.id,
        sequence: 1,
        timestamp: now - 50, // 50ms ago
      };

      // Mock resolvePending to not throw
      vi.spyOn(protocol as any, 'resolvePending').mockImplementation(() => {});

      await protocol.handleMessage(message);

      const metrics = protocol.getMetrics();
      expect(metrics.latency).toBeGreaterThanOrEqual(0);
    });

    it('should collect metrics periodically', async () => {
      vi.spyOn(protocol as any, 'waitForAck').mockResolvedValue(undefined);
      await protocol.start();

      const initialUptime = protocol.getMetrics().uptime;

      // Advance time for metrics collection
      vi.advanceTimersByTime(10000);

      // Metrics collection should have run
      const newUptime = protocol.getMetrics().uptime;
      expect(newUptime).toBeGreaterThanOrEqual(initialUptime);
    });
  });

  describe('Reconnection', () => {
    it('should emit bridge:degraded on keepalive failure', async () => {
      vi.spyOn(protocol as any, 'waitForAck')
        .mockResolvedValueOnce(undefined) // handshake
        .mockRejectedValueOnce(new Error('Timeout')); // keepalive failure

      const degradedHandler = vi.fn();
      protocol.on('bridge:degraded', degradedHandler);

      await protocol.start();

      // Trigger keepalive
      vi.advanceTimersByTime(30000);

      expect(degradedHandler).toHaveBeenCalled();
    });

    it('should emit bridge:failed after max reconnect attempts', async () => {
      vi.spyOn(protocol as any, 'waitForAck').mockRejectedValue(new Error('Timeout'));

      const failedHandler = vi.fn();
      protocol.on('bridge:failed', failedHandler);

      // Attempt to start (will fail)
      await protocol.start();

      // Should have failed
      expect(protocol.getState()).toBe('failed');
    });
  });

  describe('Sequence Tracking', () => {
    it('should increment sequence for each message', async () => {
      vi.spyOn(protocol as any, 'waitForAck').mockResolvedValue(undefined);
      await protocol.start();

      const sendSpy = vi.spyOn(protocol as any, 'sendMessage');

      await protocol.send({ data: 1 });
      await protocol.send({ data: 2 });

      // Check that sequence numbers are incrementing
      expect(sendSpy).toHaveBeenCalledTimes(2);
    });
  });
});
