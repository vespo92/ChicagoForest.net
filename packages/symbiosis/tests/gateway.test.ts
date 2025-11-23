/**
 * Gateway Node Tests
 *
 * Tests for the GatewayNode class that bridges multiple forests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GatewayNode } from '../src/gateway';
import type { GatewayConfig, ForestInfo, BridgeConnection } from '../src/types';

describe('GatewayNode', () => {
  let gateway: GatewayNode;
  const mockConfig: GatewayConfig = {
    nodeId: 'gateway-test-001' as any,
    connectedForests: ['forest-alpha', 'forest-beta'],
    maxConnectionsPerForest: 5,
    autoPeering: true,
    trafficRules: [],
  };

  beforeEach(() => {
    vi.useFakeTimers();
    gateway = new GatewayNode(mockConfig);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Lifecycle', () => {
    it('should emit gateway:online when started', async () => {
      const onlineHandler = vi.fn();
      gateway.on('gateway:online', onlineHandler);

      await gateway.start();

      expect(onlineHandler).toHaveBeenCalledWith(mockConfig.nodeId);
    });

    it('should emit gateway:offline when stopped', async () => {
      const offlineHandler = vi.fn();
      gateway.on('gateway:offline', offlineHandler);

      await gateway.start();
      await gateway.stop();

      expect(offlineHandler).toHaveBeenCalledWith(mockConfig.nodeId);
    });

    it('should not start twice', async () => {
      const onlineHandler = vi.fn();
      gateway.on('gateway:online', onlineHandler);

      await gateway.start();
      await gateway.start();

      expect(onlineHandler).toHaveBeenCalledTimes(1);
    });

    it('should not stop if not running', async () => {
      const offlineHandler = vi.fn();
      gateway.on('gateway:offline', offlineHandler);

      await gateway.stop();

      expect(offlineHandler).not.toHaveBeenCalled();
    });
  });

  describe('Forest Connection', () => {
    it('should connect to configured forests on start', async () => {
      const discoveredHandler = vi.fn();
      gateway.on('forest:discovered', discoveredHandler);

      await gateway.start();

      expect(discoveredHandler).toHaveBeenCalledTimes(2);
    });

    it('should emit bridge:established on successful connection', async () => {
      const bridgeHandler = vi.fn();
      gateway.on('bridge:established', bridgeHandler);

      await gateway.start();

      expect(bridgeHandler).toHaveBeenCalledTimes(2);
    });

    it('should connect to new forest dynamically', async () => {
      await gateway.start();
      const discoveredHandler = vi.fn();
      gateway.on('forest:discovered', discoveredHandler);

      const result = await gateway.connectToForest('forest-gamma');

      expect(result).toBe(true);
      expect(discoveredHandler).toHaveBeenCalled();
    });

    it('should not reconnect to already connected forest', async () => {
      await gateway.start();
      const bridgeHandler = vi.fn();
      gateway.on('bridge:established', bridgeHandler);

      const result = await gateway.connectToForest('forest-alpha');

      expect(result).toBe(true);
      expect(bridgeHandler).not.toHaveBeenCalled(); // Already connected
    });

    it('should disconnect from forest', async () => {
      await gateway.start();

      await gateway.disconnectFromForest('forest-alpha');
      const status = gateway.getBridgeStatus('forest-alpha');

      expect(status).toBeUndefined();
    });
  });

  describe('Forest Discovery', () => {
    it('should return connected forests', async () => {
      await gateway.start();

      const forests = gateway.getConnectedForests();

      expect(forests.length).toBe(2);
      expect(forests.map(f => f.id)).toContain('forest-alpha');
      expect(forests.map(f => f.id)).toContain('forest-beta');
    });

    it('should return bridge status', async () => {
      await gateway.start();

      const status = gateway.getBridgeStatus('forest-alpha');

      expect(status).toBeDefined();
      expect(status?.state).toBe('active');
    });
  });

  describe('Message Routing', () => {
    it('should route message to connected forest', async () => {
      await gateway.start();

      const result = await gateway.routeMessage('forest-alpha', { data: 'test' });

      expect(result).toBe(true);
    });

    it('should fail routing to disconnected forest', async () => {
      await gateway.start();

      const result = await gateway.routeMessage('forest-unknown', { data: 'test' });

      expect(result).toBe(false);
    });

    it('should increment message counter on successful route', async () => {
      await gateway.start();
      const statusBefore = gateway.getBridgeStatus('forest-alpha');
      const countBefore = statusBefore?.metrics.messagesExchanged || 0;

      await gateway.routeMessage('forest-alpha', { data: 'test' });

      const statusAfter = gateway.getBridgeStatus('forest-alpha');
      expect(statusAfter?.metrics.messagesExchanged).toBe(countBefore + 1);
    });
  });

  describe('Traffic Rules', () => {
    it('should add traffic rule', async () => {
      gateway.addTrafficRule({
        id: 'rule-1',
        source: 'forest-alpha',
        destination: 'forest-beta',
        action: 'allow',
      });

      await gateway.start();
      const result = await gateway.routeMessage('forest-beta', { data: 'test' });

      expect(result).toBe(true);
    });

    it('should deny traffic based on rule', async () => {
      gateway.addTrafficRule({
        id: 'rule-deny',
        source: 'local',
        destination: 'forest-alpha',
        action: 'deny',
      });

      await gateway.start();
      const result = await gateway.routeMessage('forest-alpha', { data: 'test' });

      expect(result).toBe(false);
    });

    it('should remove traffic rule', () => {
      gateway.addTrafficRule({
        id: 'rule-to-remove',
        source: '*',
        destination: '*',
        action: 'deny',
      });

      const removed = gateway.removeTrafficRule('rule-to-remove');

      expect(removed).toBe(true);
    });

    it('should return false when removing non-existent rule', () => {
      const removed = gateway.removeTrafficRule('non-existent');

      expect(removed).toBe(false);
    });
  });
});
