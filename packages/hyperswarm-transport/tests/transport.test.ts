/**
 * @chicago-forest/hyperswarm-transport - Tests
 *
 * Unit tests for the Hyperswarm transport implementation.
 * These tests use mocks since actual Hyperswarm requires a network.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'eventemitter3';
import {
  publicKeyToNodeId,
  createPeerAddress,
  DEFAULT_HYPERSWARM_CONFIG,
  type HyperswarmPeerInfo,
} from '../src/types';
import { HyperswarmConnection, ConnectionPool } from '../src/connection';

// =============================================================================
// Type Utilities Tests
// =============================================================================

describe('Type Utilities', () => {
  describe('publicKeyToNodeId', () => {
    it('should convert public key buffer to node ID', () => {
      const publicKey = Buffer.alloc(32);
      publicKey.fill(0xab, 0, 16);

      const nodeId = publicKeyToNodeId(publicKey);

      expect(nodeId).toMatch(/^CFN-/);
      expect(nodeId).toBe('CFN-abababababababababababababababab');
    });

    it('should handle different key values', () => {
      const key1 = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');
      const key2 = Buffer.from('fedcba9876543210fedcba9876543210', 'hex');

      expect(publicKeyToNodeId(key1)).not.toBe(publicKeyToNodeId(key2));
    });

    it('should use first 16 bytes only', () => {
      const key = Buffer.alloc(32);
      key.fill(0xaa, 0, 16);
      key.fill(0xbb, 16, 32); // Second half different

      const nodeId = publicKeyToNodeId(key);
      expect(nodeId).not.toContain('bb');
    });
  });

  describe('createPeerAddress', () => {
    it('should create peer address from connection info', () => {
      const info: HyperswarmPeerInfo = {
        publicKey: Buffer.from('0123456789abcdef0123456789abcdef', 'hex'),
        remoteAddress: '192.168.1.100',
        remotePort: 49152,
        client: true,
        type: 'tcp',
        holepunched: true,
      };

      const address = createPeerAddress(info);

      expect(address.host).toBe('192.168.1.100');
      expect(address.port).toBe(49152);
      expect(address.protocol).toBe('tcp');
      expect(address.publicKey).toBe('0123456789abcdef0123456789abcdef');
    });

    it('should handle relay connections', () => {
      const info: HyperswarmPeerInfo = {
        publicKey: Buffer.alloc(16),
        client: false,
        type: 'relay',
        holepunched: false,
      };

      const address = createPeerAddress(info);

      expect(address.protocol).toBe('relay');
      expect(address.host).toBe('unknown');
      expect(address.port).toBe(0);
    });
  });

  describe('DEFAULT_HYPERSWARM_CONFIG', () => {
    it('should have sensible defaults', () => {
      expect(DEFAULT_HYPERSWARM_CONFIG.maxPeers).toBe(64);
      expect(DEFAULT_HYPERSWARM_CONFIG.connectionTimeout).toBe(10000);
      expect(DEFAULT_HYPERSWARM_CONFIG.enableRelay).toBe(true);
      expect(DEFAULT_HYPERSWARM_CONFIG.dhtServer).toBe(false);
      expect(Array.isArray(DEFAULT_HYPERSWARM_CONFIG.bootstrap)).toBe(true);
    });
  });
});

// =============================================================================
// Mock Socket for Testing
// =============================================================================

class MockSocket extends EventEmitter {
  remotePublicKey: Buffer;
  publicKey: Buffer;
  handshakeHash: Buffer;
  destroyed = false;
  writtenData: Buffer[] = [];

  constructor(publicKey: Buffer) {
    super();
    this.remotePublicKey = publicKey;
    this.publicKey = Buffer.alloc(32).fill(0x01);
    this.handshakeHash = Buffer.alloc(32).fill(0x02);
  }

  write(data: string | Buffer): boolean {
    this.writtenData.push(Buffer.from(data));
    return true;
  }

  end(): void {
    setTimeout(() => this.emit('close'), 10);
  }

  destroy(): void {
    this.destroyed = true;
    this.emit('close');
  }
}

// =============================================================================
// HyperswarmConnection Tests
// =============================================================================

describe('HyperswarmConnection', () => {
  let mockSocket: MockSocket;
  let peerInfo: HyperswarmPeerInfo;

  beforeEach(() => {
    const publicKey = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');
    mockSocket = new MockSocket(publicKey);
    peerInfo = {
      publicKey,
      remoteAddress: '10.0.0.1',
      remotePort: 12345,
      client: true,
      type: 'tcp',
      holepunched: true,
    };
  });

  it('should create connection with peer info', () => {
    const conn = new HyperswarmConnection(mockSocket, peerInfo);

    expect(conn.remotePublicKey).toBe(peerInfo.publicKey);
    expect(conn.remoteNodeId).toMatch(/^CFN-/);
    expect(conn.info).toBe(peerInfo);
    expect(conn.wasHolepunched).toBe(true);
    expect(conn.connectionType).toBe('tcp');
  });

  it('should send data with length prefix framing', async () => {
    const conn = new HyperswarmConnection(mockSocket, peerInfo);
    const data = new TextEncoder().encode('Hello, World!');

    await conn.send(data);

    expect(mockSocket.writtenData.length).toBe(1);
    const frame = mockSocket.writtenData[0];

    // Check length prefix (4 bytes, big-endian)
    const length = frame.readUInt32BE(0);
    expect(length).toBe(data.length);

    // Check payload
    const payload = frame.subarray(4);
    expect(payload.toString()).toBe('Hello, World!');
  });

  it('should receive data with length prefix framing', async () => {
    const conn = new HyperswarmConnection(mockSocket, peerInfo);
    const receivedData: Uint8Array[] = [];

    conn.onData((data) => {
      receivedData.push(data);
    });

    // Send a framed message
    const message = Buffer.from('Test message');
    const frame = Buffer.alloc(4 + message.length);
    frame.writeUInt32BE(message.length, 0);
    message.copy(frame, 4);

    mockSocket.emit('data', frame);

    // Wait for event processing
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(receivedData.length).toBe(1);
    expect(Buffer.from(receivedData[0]).toString()).toBe('Test message');
  });

  it('should handle chunked data correctly', async () => {
    const conn = new HyperswarmConnection(mockSocket, peerInfo);
    const receivedData: Uint8Array[] = [];

    conn.onData((data) => {
      receivedData.push(data);
    });

    // Create a large message
    const message = Buffer.from('This is a longer test message for chunking');
    const frame = Buffer.alloc(4 + message.length);
    frame.writeUInt32BE(message.length, 0);
    message.copy(frame, 4);

    // Send in chunks
    mockSocket.emit('data', frame.subarray(0, 10)); // First chunk
    mockSocket.emit('data', frame.subarray(10));    // Rest

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(receivedData.length).toBe(1);
    expect(Buffer.from(receivedData[0]).toString()).toBe(message.toString());
  });

  it('should close gracefully', async () => {
    const conn = new HyperswarmConnection(mockSocket, peerInfo);
    let closed = false;

    conn.onClose(() => {
      closed = true;
    });

    await conn.close();

    expect(closed).toBe(true);
    expect(conn.isOpen).toBe(false);
  });

  it('should emit error events', async () => {
    const conn = new HyperswarmConnection(mockSocket, peerInfo);
    let receivedError: Error | null = null;

    conn.onError((err) => {
      receivedError = err;
    });

    mockSocket.emit('error', new Error('Test error'));

    expect(receivedError).not.toBeNull();
    expect(receivedError!.message).toBe('Test error');
  });

  it('should throw when sending on closed connection', async () => {
    const conn = new HyperswarmConnection(mockSocket, peerInfo);
    await conn.close();

    await expect(conn.send(new Uint8Array([1, 2, 3]))).rejects.toThrow(
      'Connection is closed'
    );
  });
});

// =============================================================================
// ConnectionPool Tests
// =============================================================================

describe('ConnectionPool', () => {
  let pool: ConnectionPool;

  beforeEach(() => {
    pool = new ConnectionPool(10);
  });

  afterEach(async () => {
    await pool.closeAll();
  });

  it('should add connections', () => {
    const publicKey = Buffer.alloc(32).fill(0x01);
    const socket = new MockSocket(publicKey);
    const conn = new HyperswarmConnection(socket, {
      publicKey,
      client: true,
      type: 'tcp',
      holepunched: false,
    });

    const added = pool.add(conn);

    expect(added).toBe(true);
    expect(pool.size).toBe(1);
    expect(pool.has(publicKey)).toBe(true);
  });

  it('should reject duplicate connections', () => {
    const publicKey = Buffer.alloc(32).fill(0x01);

    const socket1 = new MockSocket(publicKey);
    const conn1 = new HyperswarmConnection(socket1, {
      publicKey,
      client: true,
      type: 'tcp',
      holepunched: false,
    });

    const socket2 = new MockSocket(publicKey);
    const conn2 = new HyperswarmConnection(socket2, {
      publicKey,
      client: true,
      type: 'tcp',
      holepunched: false,
    });

    pool.add(conn1);
    const added = pool.add(conn2);

    expect(added).toBe(false);
    expect(pool.size).toBe(1);
  });

  it('should respect max connections limit', () => {
    const smallPool = new ConnectionPool(2);

    for (let i = 0; i < 3; i++) {
      const publicKey = Buffer.alloc(32).fill(i);
      const socket = new MockSocket(publicKey);
      const conn = new HyperswarmConnection(socket, {
        publicKey,
        client: true,
        type: 'tcp',
        holepunched: false,
      });
      smallPool.add(conn);
    }

    expect(smallPool.size).toBe(2);
  });

  it('should remove connections', () => {
    const publicKey = Buffer.alloc(32).fill(0x01);
    const socket = new MockSocket(publicKey);
    const conn = new HyperswarmConnection(socket, {
      publicKey,
      client: true,
      type: 'tcp',
      holepunched: false,
    });

    pool.add(conn);
    const removed = pool.remove(publicKey);

    expect(removed).toBe(true);
    expect(pool.size).toBe(0);
  });

  it('should get connection by public key', () => {
    const publicKey = Buffer.alloc(32).fill(0x01);
    const socket = new MockSocket(publicKey);
    const conn = new HyperswarmConnection(socket, {
      publicKey,
      client: true,
      type: 'tcp',
      holepunched: false,
    });

    pool.add(conn);
    const retrieved = pool.get(publicKey);

    expect(retrieved).toBe(conn);
  });

  it('should get all connections', () => {
    for (let i = 0; i < 3; i++) {
      const publicKey = Buffer.alloc(32).fill(i);
      const socket = new MockSocket(publicKey);
      const conn = new HyperswarmConnection(socket, {
        publicKey,
        client: true,
        type: 'tcp',
        holepunched: i % 2 === 0,
      });
      pool.add(conn);
    }

    expect(pool.getAll().length).toBe(3);
  });

  it('should calculate stats correctly', () => {
    // Add TCP connection
    const tcpKey = Buffer.alloc(32).fill(0x01);
    const tcpSocket = new MockSocket(tcpKey);
    pool.add(new HyperswarmConnection(tcpSocket, {
      publicKey: tcpKey,
      client: true,
      type: 'tcp',
      holepunched: true,
    }));

    // Add relay connection
    const relayKey = Buffer.alloc(32).fill(0x02);
    const relaySocket = new MockSocket(relayKey);
    pool.add(new HyperswarmConnection(relaySocket, {
      publicKey: relayKey,
      client: true,
      type: 'relay',
      holepunched: false,
    }));

    // Add UTP connection
    const utpKey = Buffer.alloc(32).fill(0x03);
    const utpSocket = new MockSocket(utpKey);
    pool.add(new HyperswarmConnection(utpSocket, {
      publicKey: utpKey,
      client: true,
      type: 'utp',
      holepunched: true,
    }));

    const stats = pool.getStats();

    expect(stats.total).toBe(3);
    expect(stats.holepunched).toBe(2);
    expect(stats.relay).toBe(1);
    expect(stats.tcp).toBe(1);
    expect(stats.utp).toBe(1);
  });

  it('should emit events on add/remove', () => {
    const added: HyperswarmConnection[] = [];
    const removed: Buffer[] = [];

    pool.on('connection:added', (conn) => added.push(conn));
    pool.on('connection:removed', (key) => removed.push(key));

    const publicKey = Buffer.alloc(32).fill(0x01);
    const socket = new MockSocket(publicKey);
    const conn = new HyperswarmConnection(socket, {
      publicKey,
      client: true,
      type: 'tcp',
      holepunched: false,
    });

    pool.add(conn);
    pool.remove(publicKey);

    expect(added.length).toBe(1);
    expect(removed.length).toBe(1);
  });
});

// =============================================================================
// Integration Note
// =============================================================================

describe('Integration', () => {
  it('should note that full transport tests require network', () => {
    // Full HyperswarmTransport tests would require:
    // 1. Running Hyperswarm DHT bootstrap nodes
    // 2. Multiple test peers
    // 3. Network connectivity
    //
    // These would be integration tests, not unit tests.
    // For unit testing, we test the components (connection, pool, types).

    expect(true).toBe(true);
  });
});
