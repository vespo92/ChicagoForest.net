/**
 * Tests for Libp2pTransport - transport adapter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  Libp2pTransport,
  createLibp2pTransport,
  MessageCodec,
  FOREST_PROTOCOL,
} from '../src/transport-adapter';
import { ForestNode } from '../src/node';

describe('Libp2pTransport', () => {
  let node: ForestNode;
  let transport: Libp2pTransport;

  beforeEach(async () => {
    node = new ForestNode({
      enableTCP: true,
      enableWebSockets: false,
      enableWebRTC: false,
    });
    await node.start();
    transport = new Libp2pTransport(node);
  });

  afterEach(async () => {
    if (transport?.isListening()) {
      await transport.stopListening();
    }
    await transport?.closeAll();
    if (node?.isStarted) {
      await node.stop();
    }
  });

  describe('constructor', () => {
    it('should create transport with node', () => {
      expect(transport).toBeInstanceOf(Libp2pTransport);
      expect(transport.getNode()).toBe(node);
    });

    it('should use default protocol', () => {
      expect(FOREST_PROTOCOL).toBe('/chicago-forest/1.0.0');
    });

    it('should allow custom protocol', () => {
      const customTransport = new Libp2pTransport(node, '/custom/1.0.0');
      expect(customTransport).toBeInstanceOf(Libp2pTransport);
    });
  });

  describe('listen/stopListening', () => {
    it('should start listening', async () => {
      await transport.listen({
        protocol: 'tcp',
        host: '127.0.0.1',
        port: 0,
      });

      expect(transport.isListening()).toBe(true);
    });

    it('should stop listening', async () => {
      await transport.listen({
        protocol: 'tcp',
        host: '127.0.0.1',
        port: 0,
      });

      await transport.stopListening();

      expect(transport.isListening()).toBe(false);
    });

    it('should be idempotent on multiple listens', async () => {
      await transport.listen({
        protocol: 'tcp',
        host: '127.0.0.1',
        port: 0,
      });

      await transport.listen({
        protocol: 'tcp',
        host: '127.0.0.1',
        port: 0,
      }); // Should not throw

      expect(transport.isListening()).toBe(true);
    });
  });

  describe('closeAll', () => {
    it('should close all connections', async () => {
      await transport.closeAll();
      // Should not throw even with no connections
    });
  });
});

describe('MessageCodec', () => {
  it('should encode object to bytes', () => {
    const message = { type: 'HELLO', id: '123' };
    const encoded = MessageCodec.encode(message);

    expect(encoded).toBeInstanceOf(Uint8Array);
    expect(encoded.length).toBeGreaterThan(0);
  });

  it('should decode bytes to object', () => {
    const original = { type: 'HELLO', id: '123', nested: { value: 42 } };
    const encoded = MessageCodec.encode(original);
    const decoded = MessageCodec.decode(encoded);

    expect(decoded).toEqual(original);
  });

  it('should handle arrays', () => {
    const original = [1, 2, 3, { key: 'value' }];
    const encoded = MessageCodec.encode(original);
    const decoded = MessageCodec.decode(encoded);

    expect(decoded).toEqual(original);
  });

  it('should handle strings', () => {
    const original = 'Hello, Forest!';
    const encoded = MessageCodec.encode(original);
    const decoded = MessageCodec.decode<string>(encoded);

    expect(decoded).toBe(original);
  });
});

describe('createLibp2pTransport helper', () => {
  let transport: Libp2pTransport;

  afterEach(async () => {
    if (transport) {
      await transport.closeAll();
      await transport.getNode().stop();
    }
  });

  it('should create transport with new node', async () => {
    transport = await createLibp2pTransport({
      enableTCP: true,
      enableWebSockets: false,
      enableWebRTC: false,
    });

    expect(transport).toBeInstanceOf(Libp2pTransport);
    expect(transport.getNode().isStarted).toBe(true);
  });
});
