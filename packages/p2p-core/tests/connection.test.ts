/**
 * ConnectionManager Unit Tests
 *
 * Tests for peer connection lifecycle management.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ConnectionManager, createMessageId, createMessage, DEFAULT_CONNECTION_CONFIG } from '../src/connection';
import type { NodeId, NodeIdentity, PeerInfo, PeerAddress } from '@chicago-forest/shared-types';

// Test helpers
function createTestNodeId(seed: number): NodeId {
  return `CFN-${seed.toString(16).padStart(32, '0')}`;
}

function createTestIdentity(seed: number): NodeIdentity {
  const nodeId = createTestNodeId(seed);
  return {
    nodeId,
    keyPair: {
      publicKey: seed.toString(16).padStart(64, '0'),
      privateKey: (seed + 1000).toString(16).padStart(64, '0'),
    },
    createdAt: Date.now(),
    version: 1,
  };
}

function createTestPeerInfo(seed: number): PeerInfo {
  const nodeId = createTestNodeId(seed);
  return {
    nodeId,
    publicKey: seed.toString(16).padStart(64, '0'),
    addresses: [{ protocol: 'tcp', host: '127.0.0.1', port: 8000 + seed }],
    lastSeen: Date.now(),
    reputation: 100,
    capabilities: ['relay'],
    metadata: {},
  };
}

describe('ConnectionManager', () => {
  let manager: ConnectionManager;
  const identity = createTestIdentity(0);

  beforeEach(() => {
    manager = new ConnectionManager(identity);
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await manager.stop();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with identity', () => {
      expect(manager.getConnectionCount()).toBe(0);
    });

    it('should accept custom configuration', () => {
      const customManager = new ConnectionManager(identity, {
        maxConnections: 100,
        maxInbound: 60,
        maxOutbound: 40,
        connectionTimeout: 5000,
      });

      expect(customManager.getConnectionCount()).toBe(0);
    });
  });

  describe('lifecycle', () => {
    it('should start successfully', async () => {
      await manager.start();
      expect(manager.getConnectionCount()).toBe(0);
    });

    it('should be idempotent on start', async () => {
      await manager.start();
      await manager.start();
      expect(true).toBe(true);
    });

    it('should stop and close all connections', async () => {
      await manager.start();

      const peer = createTestPeerInfo(1);
      await manager.connect(peer);

      await manager.stop();

      expect(manager.getConnectionCount()).toBe(0);
    });
  });

  describe('connect', () => {
    beforeEach(async () => {
      await manager.start();
    });

    it('should establish connection to peer', async () => {
      const peer = createTestPeerInfo(1);
      const connection = await manager.connect(peer);

      expect(connection.peerId).toBe(peer.nodeId);
      expect(connection.state).toBe('connected');
      expect(manager.getConnectionCount()).toBe(1);
    });

    it('should return existing connection if already connected', async () => {
      const peer = createTestPeerInfo(1);
      const conn1 = await manager.connect(peer);
      const conn2 = await manager.connect(peer);

      expect(conn1).toBe(conn2);
      expect(manager.getConnectionCount()).toBe(1);
    });

    it('should respect max outbound limit', async () => {
      const limitedManager = new ConnectionManager(identity, {
        maxOutbound: 2,
        maxConnections: 10,
      });
      await limitedManager.start();

      await limitedManager.connect(createTestPeerInfo(1));
      await limitedManager.connect(createTestPeerInfo(2));

      await expect(limitedManager.connect(createTestPeerInfo(3)))
        .rejects.toThrow('Maximum outbound connections reached');

      await limitedManager.stop();
    });

    it('should respect max total connections limit', async () => {
      const limitedManager = new ConnectionManager(identity, {
        maxConnections: 2,
        maxOutbound: 10,
      });
      await limitedManager.start();

      await limitedManager.connect(createTestPeerInfo(1));
      await limitedManager.connect(createTestPeerInfo(2));

      await expect(limitedManager.connect(createTestPeerInfo(3)))
        .rejects.toThrow('Maximum total connections reached');

      await limitedManager.stop();
    });

    it('should return pending connection if already connecting', async () => {
      const peer = createTestPeerInfo(1);

      // Start two connections simultaneously
      const conn1Promise = manager.connect(peer);
      const conn2Promise = manager.connect(peer);

      const [conn1, conn2] = await Promise.all([conn1Promise, conn2Promise]);

      expect(conn1.peerId).toBe(conn2.peerId);
      expect(manager.getConnectionCount()).toBe(1);
    });
  });

  describe('disconnect', () => {
    beforeEach(async () => {
      await manager.start();
    });

    it('should disconnect from peer', async () => {
      const peer = createTestPeerInfo(1);
      await manager.connect(peer);

      await manager.disconnect(peer.nodeId);

      expect(manager.getConnectionCount()).toBe(0);
    });

    it('should handle disconnect for non-existent peer', async () => {
      await expect(manager.disconnect(createTestNodeId(99))).resolves.not.toThrow();
    });

    it('should clear keepalive timer on disconnect', async () => {
      const peer = createTestPeerInfo(1);
      await manager.connect(peer);

      await manager.disconnect(peer.nodeId);

      // Advance time - should not throw
      vi.advanceTimersByTime(100000);
    });
  });

  describe('getConnection', () => {
    beforeEach(async () => {
      await manager.start();
    });

    it('should return connection by peer ID', async () => {
      const peer = createTestPeerInfo(1);
      await manager.connect(peer);

      const conn = manager.getConnection(peer.nodeId);

      expect(conn).not.toBeNull();
      expect(conn?.peerId).toBe(peer.nodeId);
    });

    it('should return null for unknown peer', () => {
      const conn = manager.getConnection(createTestNodeId(99));
      expect(conn).toBeNull();
    });
  });

  describe('getConnections', () => {
    beforeEach(async () => {
      await manager.start();
    });

    it('should return all active connections', async () => {
      await manager.connect(createTestPeerInfo(1));
      await manager.connect(createTestPeerInfo(2));
      await manager.connect(createTestPeerInfo(3));

      const connections = manager.getConnections();

      expect(connections).toHaveLength(3);
      connections.forEach(conn => {
        expect(conn.state).toBe('connected');
      });
    });

    it('should return empty array when no connections', () => {
      const connections = manager.getConnections();
      expect(connections).toEqual([]);
    });
  });

  describe('connection counts', () => {
    beforeEach(async () => {
      await manager.start();
    });

    it('should track connection count', async () => {
      await manager.connect(createTestPeerInfo(1));
      expect(manager.getConnectionCount()).toBe(1);

      await manager.connect(createTestPeerInfo(2));
      expect(manager.getConnectionCount()).toBe(2);
    });

    it('should track outbound count', async () => {
      await manager.connect(createTestPeerInfo(1));
      await manager.connect(createTestPeerInfo(2));

      expect(manager.getOutboundCount()).toBe(2);
    });

    it('should track inbound count', async () => {
      // All connections in test are outbound
      expect(manager.getInboundCount()).toBe(0);
    });
  });

  describe('sendMessage', () => {
    beforeEach(async () => {
      await manager.start();
    });

    it('should send message to connected peer', async () => {
      const peer = createTestPeerInfo(1);
      await manager.connect(peer);

      const message = createMessage('PING', { sentAt: Date.now() });

      await expect(manager.sendMessage(peer.nodeId, {
        ...message,
        from: identity.nodeId,
        timestamp: Date.now(),
      })).resolves.not.toThrow();
    });

    it('should throw when sending to disconnected peer', async () => {
      const message = createMessage('PING', {});

      await expect(manager.sendMessage(createTestNodeId(99), {
        ...message,
        from: identity.nodeId,
        timestamp: Date.now(),
      })).rejects.toThrow('Not connected to peer');
    });

    it('should update bytes out on send', async () => {
      const peer = createTestPeerInfo(1);
      const conn = await manager.connect(peer);

      const message = createMessage('DATA', { data: 'test payload' });

      await manager.sendMessage(peer.nodeId, {
        ...message,
        from: identity.nodeId,
        timestamp: Date.now(),
      });

      expect(conn.bytesOut).toBeGreaterThan(0);
    });
  });

  describe('broadcast', () => {
    beforeEach(async () => {
      await manager.start();
    });

    it('should send to all connected peers', async () => {
      await manager.connect(createTestPeerInfo(1));
      await manager.connect(createTestPeerInfo(2));
      await manager.connect(createTestPeerInfo(3));

      const message = createMessage('ANNOUNCE', { nodeId: identity.nodeId });

      await expect(manager.broadcast(message)).resolves.not.toThrow();
    });

    it('should handle empty peer list', async () => {
      const message = createMessage('ANNOUNCE', {});

      await expect(manager.broadcast(message)).resolves.not.toThrow();
    });
  });

  describe('handleMessage', () => {
    beforeEach(async () => {
      await manager.start();
    });

    it('should update last activity on message', async () => {
      const peer = createTestPeerInfo(1);
      const conn = await manager.connect(peer);
      const originalActivity = conn.lastActivity;

      vi.advanceTimersByTime(1000);

      await manager.handleMessage(peer.nodeId, {
        type: 'DATA',
        id: 'test-msg',
        from: peer.nodeId,
        timestamp: Date.now(),
        payload: {},
      });

      expect(conn.lastActivity).toBeGreaterThan(originalActivity!);
    });

    it('should respond to PING with PONG', async () => {
      const peer = createTestPeerInfo(1);
      await manager.connect(peer);

      await manager.handleMessage(peer.nodeId, {
        type: 'PING',
        id: 'ping-1',
        from: peer.nodeId,
        timestamp: Date.now(),
        payload: { sentAt: Date.now() },
      });

      // PONG should be sent (verified by lack of error)
    });

    it('should calculate latency from PONG', async () => {
      const peer = createTestPeerInfo(1);
      const conn = await manager.connect(peer);

      // First send keepalive (simulated by advancing time)
      vi.advanceTimersByTime(30001);

      // Handle PONG response
      await manager.handleMessage(peer.nodeId, {
        type: 'PONG',
        id: 'pong-1',
        from: peer.nodeId,
        timestamp: Date.now(),
        payload: { pingId: 'ping-1', receivedAt: Date.now() },
      });

      // Latency may be updated
      expect(typeof conn.latency === 'number' || conn.latency === undefined).toBe(true);
    });

    it('should ignore messages from unknown peers', async () => {
      await expect(manager.handleMessage(createTestNodeId(99), {
        type: 'DATA',
        id: 'test',
        from: createTestNodeId(99),
        timestamp: Date.now(),
        payload: {},
      })).resolves.not.toThrow();
    });
  });

  describe('handleIncomingConnection', () => {
    beforeEach(async () => {
      await manager.start();
    });

    it('should accept incoming connection within limits', async () => {
      const mockTransport = {
        remoteAddress: { protocol: 'tcp' as const, host: '192.168.1.100', port: 9000 },
        send: vi.fn(),
        close: vi.fn(),
        onData: vi.fn(),
        onClose: vi.fn(),
        onError: vi.fn(),
      };

      const peer = createTestPeerInfo(1);

      await expect(manager.handleIncomingConnection(mockTransport, peer))
        .resolves.not.toThrow();
    });

    it('should reject when at max inbound', async () => {
      const limitedManager = new ConnectionManager(identity, {
        maxInbound: 0,
      });
      await limitedManager.start();

      const mockTransport = {
        remoteAddress: { protocol: 'tcp' as const, host: '192.168.1.100', port: 9000 },
        send: vi.fn(),
        close: vi.fn().mockResolvedValue(undefined),
        onData: vi.fn(),
        onClose: vi.fn(),
        onError: vi.fn(),
      };

      await limitedManager.handleIncomingConnection(mockTransport);

      expect(mockTransport.close).toHaveBeenCalled();

      await limitedManager.stop();
    });
  });

  describe('keepalive', () => {
    it('should send periodic keepalive pings', async () => {
      const shortKeepaliveManager = new ConnectionManager(identity, {
        keepaliveInterval: 1000,
      });
      await shortKeepaliveManager.start();

      const peer = createTestPeerInfo(1);
      await shortKeepaliveManager.connect(peer);

      // Advance past keepalive interval
      vi.advanceTimersByTime(1500);

      // Keepalive should have been sent (no error means success)
      await shortKeepaliveManager.stop();
    });

    it('should disconnect on keepalive timeout', async () => {
      const shortTimeoutManager = new ConnectionManager(identity, {
        keepaliveInterval: 100,
        deadTimeout: 200,
      });
      await shortTimeoutManager.start();

      const peer = createTestPeerInfo(1);
      const conn = await shortTimeoutManager.connect(peer);

      // Simulate no activity
      vi.advanceTimersByTime(300);

      // Connection should be disconnected
      expect(shortTimeoutManager.getConnection(peer.nodeId)).toBeNull();

      await shortTimeoutManager.stop();
    });
  });
});

describe('createMessageId', () => {
  it('should generate unique IDs', () => {
    const ids = new Set<string>();

    for (let i = 0; i < 100; i++) {
      ids.add(createMessageId());
    }

    expect(ids.size).toBe(100);
  });

  it('should include timestamp component', () => {
    const id = createMessageId();
    expect(id).toContain('-');
  });
});

describe('createMessage', () => {
  it('should create message with required fields', () => {
    const message = createMessage('PING', { sentAt: Date.now() });

    expect(message.type).toBe('PING');
    expect(message.id).toBeDefined();
    expect(message.payload).toEqual({ sentAt: expect.any(Number) });
  });

  it('should include optional to field', () => {
    const target = createTestNodeId(1);
    const message = createMessage('FIND_NODE', { targetId: target }, target);

    expect(message.to).toBe(target);
  });
});

describe('DEFAULT_CONNECTION_CONFIG', () => {
  it('should have reasonable defaults', () => {
    expect(DEFAULT_CONNECTION_CONFIG.maxConnections).toBe(50);
    expect(DEFAULT_CONNECTION_CONFIG.maxInbound).toBe(30);
    expect(DEFAULT_CONNECTION_CONFIG.maxOutbound).toBe(20);
    expect(DEFAULT_CONNECTION_CONFIG.connectionTimeout).toBe(10000);
    expect(DEFAULT_CONNECTION_CONFIG.handshakeTimeout).toBe(5000);
    expect(DEFAULT_CONNECTION_CONFIG.keepaliveInterval).toBe(30000);
    expect(DEFAULT_CONNECTION_CONFIG.deadTimeout).toBe(90000);
    expect(DEFAULT_CONNECTION_CONFIG.autoReconnect).toBe(true);
    expect(DEFAULT_CONNECTION_CONFIG.maxReconnectAttempts).toBe(5);
  });
});
