/**
 * Tests for ForestNode - libp2p node wrapper
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ForestNode, createForestNode, DEFAULT_FOREST_NODE_CONFIG } from '../src/node';

describe('ForestNode', () => {
  let node: ForestNode;

  afterEach(async () => {
    if (node?.isStarted) {
      await node.stop();
    }
  });

  describe('constructor', () => {
    it('should create node with default config', () => {
      node = new ForestNode();
      expect(node).toBeInstanceOf(ForestNode);
      expect(node.isStarted).toBe(false);
    });

    it('should create node with custom config', () => {
      node = new ForestNode({
        enableTCP: true,
        enableWebSockets: false,
        maxConnections: 50,
      });
      expect(node).toBeInstanceOf(ForestNode);
    });
  });

  describe('start/stop', () => {
    it('should start the node', async () => {
      node = new ForestNode({
        enableTCP: true,
        enableWebSockets: false,
        enableWebRTC: false,
      });

      await node.start();

      expect(node.isStarted).toBe(true);
      expect(node.peerId).toBeDefined();
      expect(node.getMultiaddrs().length).toBeGreaterThan(0);
    });

    it('should stop the node', async () => {
      node = new ForestNode({
        enableTCP: true,
        enableWebSockets: false,
        enableWebRTC: false,
      });

      await node.start();
      await node.stop();

      expect(node.isStarted).toBe(false);
    });

    it('should be idempotent on multiple starts', async () => {
      node = new ForestNode({
        enableTCP: true,
        enableWebSockets: false,
        enableWebRTC: false,
      });

      await node.start();
      await node.start(); // Should not throw

      expect(node.isStarted).toBe(true);
    });

    it('should be safe to stop when not started', async () => {
      node = new ForestNode();
      await node.stop(); // Should not throw
    });
  });

  describe('createForestNode helper', () => {
    it('should create and start a node', async () => {
      node = await createForestNode({
        enableTCP: true,
        enableWebSockets: false,
        enableWebRTC: false,
      });

      expect(node.isStarted).toBe(true);
      expect(node.peerId).toBeDefined();
    });
  });

  describe('address conversion', () => {
    it('should convert PeerAddress to multiaddr', () => {
      const addr = {
        protocol: 'tcp' as const,
        host: '127.0.0.1',
        port: 4001,
      };

      const ma = ForestNode.peerAddressToMultiaddr(addr);
      expect(ma).toBe('/ip4/127.0.0.1/tcp/4001');
    });

    it('should convert WebSocket address', () => {
      const addr = {
        protocol: 'ws' as const,
        host: '127.0.0.1',
        port: 4002,
      };

      const ma = ForestNode.peerAddressToMultiaddr(addr);
      expect(ma).toBe('/ip4/127.0.0.1/tcp/4002/ws');
    });

    it('should convert IPv6 address', () => {
      const addr = {
        protocol: 'tcp' as const,
        host: '::1',
        port: 4001,
      };

      const ma = ForestNode.peerAddressToMultiaddr(addr);
      expect(ma).toBe('/ip6/::1/tcp/4001');
    });
  });

  describe('peer management', () => {
    it('should start with no connected peers', async () => {
      node = await createForestNode({
        enableTCP: true,
        enableWebSockets: false,
        enableWebRTC: false,
      });

      expect(node.getConnectedPeers()).toHaveLength(0);
      expect(node.getConnectionCount()).toBe(0);
    });
  });
});

describe('DEFAULT_FOREST_NODE_CONFIG', () => {
  it('should have sensible defaults', () => {
    expect(DEFAULT_FOREST_NODE_CONFIG.enableTCP).toBe(true);
    expect(DEFAULT_FOREST_NODE_CONFIG.enableWebSockets).toBe(true);
    expect(DEFAULT_FOREST_NODE_CONFIG.enableWebRTC).toBe(true);
    expect(DEFAULT_FOREST_NODE_CONFIG.maxConnections).toBe(100);
  });
});
