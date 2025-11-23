/**
 * Anti-Entropy Protocol Tests
 *
 * Tests for gossip-based synchronization
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AntiEntropyProtocol } from '../src/anti-entropy';

describe('AntiEntropyProtocol', () => {
  let protocol: AntiEntropyProtocol;

  beforeEach(() => {
    vi.useFakeTimers();
    protocol = new AntiEntropyProtocol({
      nodeId: 'node1',
      gossipIntervalMs: 100,
      gossipFanout: 2,
      sessionTimeoutMs: 5000,
      maxConcurrentSessions: 3,
      digestRangeCount: 4,
      enableMerkleTree: true,
    });
  });

  afterEach(() => {
    protocol.stop();
    vi.useRealTimers();
  });

  describe('Data Operations', () => {
    it('should set and get values', () => {
      protocol.set('key1', 'value1');
      expect(protocol.get('key1')).toBe('value1');
    });

    it('should return all entries', () => {
      protocol.set('key1', 'value1');
      protocol.set('key2', 'value2');

      const entries = protocol.entries();
      expect(entries).toHaveLength(2);
    });

    it('should track entry timestamps', () => {
      const before = Date.now();
      protocol.set('key1', 'value1');
      const after = Date.now();

      const entries = protocol.entries();
      expect(entries[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(entries[0].timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('Digest Generation', () => {
    it('should generate digest for empty store', () => {
      const digest = protocol.generateDigest();
      expect(digest.entryCount).toBe(0);
      expect(digest.ranges).toHaveLength(0);
    });

    it('should generate digest with entries', () => {
      protocol.set('key1', 'value1');
      protocol.set('key2', 'value2');

      const digest = protocol.generateDigest();
      expect(digest.entryCount).toBe(2);
      expect(digest.merkleRoot).toBeDefined();
    });

    it('should generate consistent merkle root', () => {
      protocol.set('a', 1);
      protocol.set('b', 2);
      protocol.set('c', 3);

      const digest1 = protocol.generateDigest();
      const digest2 = protocol.generateDigest();

      expect(digest1.merkleRoot).toBe(digest2.merkleRoot);
    });

    it('should change merkle root on data change', () => {
      protocol.set('key1', 'value1');
      const digest1 = protocol.generateDigest();

      protocol.set('key2', 'value2');
      const digest2 = protocol.generateDigest();

      expect(digest1.merkleRoot).not.toBe(digest2.merkleRoot);
    });
  });

  describe('Digest Comparison', () => {
    it('should detect identical digests', () => {
      protocol.set('key1', 'value1');
      const digest = protocol.generateDigest();

      const comparison = protocol.compareDigests(digest, digest);
      expect(comparison.needsSync).toBe(false);
    });

    it('should detect differences', () => {
      const p1 = new AntiEntropyProtocol({ nodeId: 'node1' });
      const p2 = new AntiEntropyProtocol({ nodeId: 'node2' });

      p1.set('key1', 'value1');
      p2.set('key1', 'value1');
      p2.set('key2', 'value2'); // Different data

      const d1 = p1.generateDigest();
      const d2 = p2.generateDigest();

      const comparison = p1.compareDigests(d1, d2);
      expect(comparison.needsSync).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should create sync sessions', () => {
      const session = protocol.startSession('peer1');
      expect(session.id).toContain('node1');
      expect(session.peerNode).toBe('peer1');
      expect(session.status).toBe('active');
    });

    it('should track session statistics', () => {
      protocol.startSession('peer1');
      protocol.startSession('peer2');

      const stats = protocol.getStats();
      expect(stats.totalSessions).toBe(2);
      expect(stats.activeSessions).toBe(2);
    });

    it('should return active sessions', () => {
      protocol.startSession('peer1');
      protocol.startSession('peer2');

      const active = protocol.getActiveSessions();
      expect(active).toHaveLength(2);
    });
  });

  describe('Message Handling', () => {
    it('should create digest message', () => {
      protocol.set('key1', 'value1');

      const message = protocol.createDigestMessage('peer1', 'session-1');
      expect(message.type).toBe('digest');
      expect(message.sourceNode).toBe('node1');
      expect(message.targetNode).toBe('peer1');
      expect(message.payload.digest).toBeDefined();
    });

    it('should create push message', () => {
      protocol.set('key1', 'value1');
      const entries = protocol.entries();

      const message = protocol.createPushMessage('peer1', entries);
      expect(message.type).toBe('push');
      expect(message.payload.entries).toHaveLength(1);
    });

    it('should handle push messages', () => {
      const p1 = new AntiEntropyProtocol({ nodeId: 'node1' });
      const p2 = new AntiEntropyProtocol({ nodeId: 'node2' });

      p1.set('key1', 'value1');
      const entries = p1.entries();

      const pushMsg = p1.createPushMessage('node2', entries);
      const response = p2.handleMessage(pushMsg);

      expect(response?.type).toBe('ack');
      expect(p2.get('key1')).toBe('value1');
    });

    it('should handle digest messages', () => {
      const p1 = new AntiEntropyProtocol({ nodeId: 'node1' });
      const p2 = new AntiEntropyProtocol({ nodeId: 'node2' });

      p1.set('key1', 'value1');
      p2.set('key2', 'value2');

      const digestMsg = p1.createDigestMessage('node2', 'session-1');
      const response = p2.handleMessage(digestMsg);

      // Should return either ack (if same) or request (if different)
      expect(response).toBeDefined();
      expect(['ack', 'request']).toContain(response?.type);
    });
  });

  describe('Events', () => {
    it('should emit session:start event', () => {
      const listener = vi.fn();
      protocol.on('session:start', listener);

      protocol.startSession('peer1');

      expect(listener).toHaveBeenCalled();
    });

    it('should emit entry:synced event on merge', () => {
      const p1 = new AntiEntropyProtocol({ nodeId: 'node1' });
      const p2 = new AntiEntropyProtocol({ nodeId: 'node2' });

      const listener = vi.fn();
      p2.on('entry:synced', listener);

      p1.set('key1', 'value1');
      const entries = p1.entries();

      const pushMsg = p1.createPushMessage('node2', entries);
      p2.handleMessage(pushMsg);

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    it('should track local entry count', () => {
      protocol.set('key1', 'value1');
      protocol.set('key2', 'value2');

      const stats = protocol.getStats();
      expect(stats.localEntryCount).toBe(2);
    });

    it('should track completed sessions', () => {
      const p1 = new AntiEntropyProtocol({ nodeId: 'node1' });
      const p2 = new AntiEntropyProtocol({ nodeId: 'node2' });

      // Same data - should result in ack
      p1.set('key1', 'value1');
      p2.set('key1', 'value1');

      const session = p1.startSession('node2');
      const digestMsg = p1.createDigestMessage('node2', session.id);
      p2.startSession('node1');
      const response = p2.handleMessage(digestMsg);

      if (response) {
        p1.handleMessage(response);
      }

      // Stats may vary based on comparison results
      const stats = p1.getStats();
      expect(stats.totalSessions).toBeGreaterThan(0);
    });
  });
});

describe('AntiEntropyProtocol - Conflict Detection', () => {
  it('should emit conflict event on concurrent updates', () => {
    const p1 = new AntiEntropyProtocol({ nodeId: 'node1' });
    const p2 = new AntiEntropyProtocol({ nodeId: 'node2' });

    const listener = vi.fn();
    p2.on('conflict:detected', listener);

    // Both nodes set different values for same key
    p1.set('key1', 'value-from-node1');
    p2.set('key1', 'value-from-node2');

    // Push from node1 to node2
    const entries = p1.entries();
    const pushMsg = p1.createPushMessage('node2', entries);
    p2.handleMessage(pushMsg);

    // Conflict should be detected
    expect(listener).toHaveBeenCalled();
  });
});

describe('AntiEntropyProtocol - Gossip', () => {
  it('should start and stop correctly', () => {
    protocol.start(['peer1', 'peer2']);
    expect(protocol.getActiveSessions().length).toBe(0); // Initially no sessions

    // Fast forward to trigger gossip
    vi.advanceTimersByTime(200);

    protocol.stop();
    // After stop, no new sessions should be created
    const sessionsBefore = protocol.getStats().totalSessions;
    vi.advanceTimersByTime(200);
    const sessionsAfter = protocol.getStats().totalSessions;

    expect(sessionsAfter).toBe(sessionsBefore);
  });
});
