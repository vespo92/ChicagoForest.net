/**
 * Tests for ForestProtocolManager and message handling
 */

import { describe, it, expect } from 'vitest';
import {
  PROTOCOL_PREFIX,
  FOREST_PROTOCOLS,
  MessageFactory,
} from '../src/protocols';

describe('FOREST_PROTOCOLS', () => {
  it('should have correct protocol prefix', () => {
    expect(PROTOCOL_PREFIX).toBe('/chicago-forest');
  });

  it('should define MESSAGE protocol', () => {
    expect(FOREST_PROTOCOLS.MESSAGE).toBe('/chicago-forest/message/1.0.0');
  });

  it('should define PEER_EXCHANGE protocol', () => {
    expect(FOREST_PROTOCOLS.PEER_EXCHANGE).toBe('/chicago-forest/peer-exchange/1.0.0');
  });

  it('should define DHT protocol', () => {
    expect(FOREST_PROTOCOLS.DHT).toBe('/chicago-forest/dht/1.0.0');
  });

  it('should define RELAY protocol', () => {
    expect(FOREST_PROTOCOLS.RELAY).toBe('/chicago-forest/relay/1.0.0');
  });

  it('should define ANONYMOUS protocol', () => {
    expect(FOREST_PROTOCOLS.ANONYMOUS).toBe('/chicago-forest/anonymous/1.0.0');
  });

  it('should define DATA_TRANSFER protocol', () => {
    expect(FOREST_PROTOCOLS.DATA_TRANSFER).toBe('/chicago-forest/data/1.0.0');
  });
});

describe('MessageFactory', () => {
  const testNodeId = 'CFN-abc123';

  describe('hello', () => {
    it('should create HELLO message', () => {
      const msg = MessageFactory.hello(testNodeId, ['relay', 'storage']);

      expect(msg.type).toBe('HELLO');
      expect(msg.from).toBe(testNodeId);
      expect(msg.id).toBeDefined();
      expect(msg.timestamp).toBeGreaterThan(0);
      expect(msg.payload).toEqual({
        capabilities: ['relay', 'storage'],
        version: '1.0.0',
      });
    });

    it('should create HELLO with empty capabilities', () => {
      const msg = MessageFactory.hello(testNodeId);

      expect(msg.payload).toEqual({
        capabilities: [],
        version: '1.0.0',
      });
    });
  });

  describe('ping', () => {
    it('should create PING message', () => {
      const msg = MessageFactory.ping(testNodeId, 'CFN-target');

      expect(msg.type).toBe('PING');
      expect(msg.from).toBe(testNodeId);
      expect(msg.to).toBe('CFN-target');
      expect(msg.payload).toHaveProperty('sentAt');
    });

    it('should create PING without target', () => {
      const msg = MessageFactory.ping(testNodeId);

      expect(msg.to).toBeUndefined();
    });
  });

  describe('pong', () => {
    it('should create PONG message', () => {
      const msg = MessageFactory.pong(testNodeId, 'CFN-target', 'ping-123');

      expect(msg.type).toBe('PONG');
      expect(msg.from).toBe(testNodeId);
      expect(msg.to).toBe('CFN-target');
      expect(msg.payload).toHaveProperty('pingId', 'ping-123');
      expect(msg.payload).toHaveProperty('receivedAt');
    });
  });

  describe('findNode', () => {
    it('should create FIND_NODE message', () => {
      const msg = MessageFactory.findNode(testNodeId, 'CFN-target');

      expect(msg.type).toBe('FIND_NODE');
      expect(msg.from).toBe(testNodeId);
      expect(msg.payload).toEqual({ targetId: 'CFN-target' });
    });
  });

  describe('store', () => {
    it('should create STORE message', () => {
      const msg = MessageFactory.store(testNodeId, 'my-key', { data: 'value' });

      expect(msg.type).toBe('STORE');
      expect(msg.from).toBe(testNodeId);
      expect(msg.payload).toEqual({
        key: 'my-key',
        value: { data: 'value' },
      });
    });
  });

  describe('data', () => {
    it('should create DATA message', () => {
      const payload = { content: 'Hello, Forest!' };
      const msg = MessageFactory.data(testNodeId, 'CFN-target', payload);

      expect(msg.type).toBe('DATA');
      expect(msg.from).toBe(testNodeId);
      expect(msg.to).toBe('CFN-target');
      expect(msg.payload).toEqual(payload);
    });
  });

  describe('message IDs', () => {
    it('should generate unique IDs', () => {
      const msg1 = MessageFactory.ping(testNodeId);
      const msg2 = MessageFactory.ping(testNodeId);

      expect(msg1.id).not.toBe(msg2.id);
    });

    it('should generate IDs in expected format', () => {
      const msg = MessageFactory.ping(testNodeId);

      // ID should be timestamp-random format
      expect(msg.id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    });
  });
});
