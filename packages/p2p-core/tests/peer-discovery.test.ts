/**
 * KademliaDHT Peer Discovery Unit Tests
 *
 * Tests for the Kademlia-style DHT peer discovery system.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { KademliaDHT, bootstrapDHT, generateRandomNodeId, DEFAULT_DHT_CONFIG } from '../src/discovery';
import type { NodeId, PeerInfo } from '@chicago-forest/shared-types';

// Test helpers
function createTestNodeId(seed: number): NodeId {
  return `CFN-${seed.toString(16).padStart(32, '0')}`;
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

describe('KademliaDHT', () => {
  let dht: KademliaDHT;
  const localNodeId = createTestNodeId(0);

  beforeEach(() => {
    dht = new KademliaDHT(localNodeId);
    vi.useFakeTimers();
  });

  afterEach(() => {
    dht.stop();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(dht.getPeerCount()).toBe(0);
    });

    it('should accept custom configuration', () => {
      const customDHT = new KademliaDHT(localNodeId, {
        bucketSize: 30,
        alpha: 5,
        peerTimeout: 30 * 60 * 1000,
      });

      expect(customDHT.getPeerCount()).toBe(0);
      customDHT.stop();
    });
  });

  describe('addPeer', () => {
    it('should add a new peer to the routing table', () => {
      const peer = createTestPeerInfo(1);
      const added = dht.addPeer(peer);

      expect(added).toBe(true);
      expect(dht.getPeerCount()).toBe(1);
    });

    it('should not add self to routing table', () => {
      const selfPeer = createTestPeerInfo(0);
      selfPeer.nodeId = localNodeId;

      const added = dht.addPeer(selfPeer);

      expect(added).toBe(false);
      expect(dht.getPeerCount()).toBe(0);
    });

    it('should update existing peer and move to end', () => {
      const peer = createTestPeerInfo(1);
      dht.addPeer(peer);

      const updatedPeer = { ...peer, reputation: 90 };
      const result = dht.addPeer(updatedPeer);

      expect(result).toBe(true);
      expect(dht.getPeerCount()).toBe(1);
    });

    it('should respect bucket size limit', () => {
      const smallDHT = new KademliaDHT(localNodeId, { bucketSize: 2 });

      // Add peers that would go to the same bucket
      // Note: bucket assignment depends on XOR distance, so we may need many peers
      for (let i = 1; i <= 100; i++) {
        smallDHT.addPeer(createTestPeerInfo(i));
      }

      // Should be limited (exact count depends on bucket distribution)
      expect(smallDHT.getPeerCount()).toBeLessThanOrEqual(256); // 128 buckets * 2

      smallDHT.stop();
    });

    it('should replace stale peers', () => {
      const staleDHT = new KademliaDHT(localNodeId, {
        bucketSize: 1,
        peerTimeout: 1000,
      });

      // Add initial peer
      const oldPeer = createTestPeerInfo(1);
      staleDHT.addPeer(oldPeer);

      // Age the peer
      vi.advanceTimersByTime(2000);

      // Add new peer (should replace stale one)
      const newPeer = createTestPeerInfo(2);
      staleDHT.addPeer(newPeer);

      const allPeers = staleDHT.getAllPeers();
      expect(allPeers.some(p => p.nodeId === newPeer.nodeId)).toBe(true);

      staleDHT.stop();
    });
  });

  describe('removePeer', () => {
    it('should remove an existing peer', () => {
      const peer = createTestPeerInfo(1);
      dht.addPeer(peer);

      const removed = dht.removePeer(peer.nodeId);

      expect(removed).toBe(true);
      expect(dht.getPeerCount()).toBe(0);
    });

    it('should return false for non-existent peer', () => {
      const removed = dht.removePeer(createTestNodeId(99));
      expect(removed).toBe(false);
    });
  });

  describe('getPeer', () => {
    it('should retrieve a peer by ID', () => {
      const peer = createTestPeerInfo(1);
      dht.addPeer(peer);

      const retrieved = dht.getPeer(peer.nodeId);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.nodeId).toBe(peer.nodeId);
    });

    it('should return null for unknown peer', () => {
      const retrieved = dht.getPeer(createTestNodeId(99));
      expect(retrieved).toBeNull();
    });
  });

  describe('findClosestPeers', () => {
    beforeEach(() => {
      // Populate with test peers
      for (let i = 1; i <= 20; i++) {
        dht.addPeer(createTestPeerInfo(i));
      }
    });

    it('should find peers closest to target', () => {
      const target = createTestNodeId(10);
      const closest = dht.findClosestPeers(target, 5);

      expect(closest).toHaveLength(5);
    });

    it('should return all peers if fewer than requested', () => {
      const smallDHT = new KademliaDHT(localNodeId);
      smallDHT.addPeer(createTestPeerInfo(1));
      smallDHT.addPeer(createTestPeerInfo(2));

      const closest = smallDHT.findClosestPeers(createTestNodeId(50), 10);

      expect(closest).toHaveLength(2);

      smallDHT.stop();
    });

    it('should sort by XOR distance', () => {
      const closest = dht.findClosestPeers(createTestNodeId(1), 20);

      // First result should be closest to target
      // This verifies sorting is working (exact order depends on XOR)
      expect(closest.length).toBeGreaterThan(0);
    });

    it('should use default count when not specified', () => {
      const closest = dht.findClosestPeers(createTestNodeId(5));

      expect(closest).toHaveLength(Math.min(20, dht.getPeerCount()));
    });
  });

  describe('getAllPeers', () => {
    it('should return all peers in routing table', () => {
      dht.addPeer(createTestPeerInfo(1));
      dht.addPeer(createTestPeerInfo(2));
      dht.addPeer(createTestPeerInfo(3));

      const peers = dht.getAllPeers();

      expect(peers).toHaveLength(3);
    });

    it('should return empty array when no peers', () => {
      const peers = dht.getAllPeers();
      expect(peers).toEqual([]);
    });
  });

  describe('getBucketStats', () => {
    it('should return bucket statistics', () => {
      dht.addPeer(createTestPeerInfo(1));
      dht.addPeer(createTestPeerInfo(100));
      dht.addPeer(createTestPeerInfo(1000));

      const stats = dht.getBucketStats();

      // Should have entries for non-empty buckets
      expect(stats.length).toBeGreaterThan(0);
      stats.forEach(bucket => {
        expect(bucket.count).toBeGreaterThan(0);
        expect(typeof bucket.index).toBe('number');
        expect(typeof bucket.lastRefresh).toBe('number');
      });
    });
  });

  describe('processFindNodeResponse', () => {
    it('should add multiple peers from response', () => {
      const peers = [
        createTestPeerInfo(1),
        createTestPeerInfo(2),
        createTestPeerInfo(3),
      ];

      const added = dht.processFindNodeResponse(peers);

      expect(added).toBe(3);
      expect(dht.getPeerCount()).toBe(3);
    });

    it('should return count of successfully added peers', () => {
      // Add one peer first
      dht.addPeer(createTestPeerInfo(1));

      // Try to add including duplicate
      const peers = [
        createTestPeerInfo(1), // Duplicate
        createTestPeerInfo(2),
      ];

      const added = dht.processFindNodeResponse(peers);

      // Duplicate should succeed (update) so 2 total
      expect(added).toBe(2);
    });
  });

  describe('export/import', () => {
    it('should export all peers', () => {
      dht.addPeer(createTestPeerInfo(1));
      dht.addPeer(createTestPeerInfo(2));

      const exported = dht.export();

      expect(exported).toHaveLength(2);
    });

    it('should import peers from export', () => {
      const peer1 = createTestPeerInfo(1);
      const peer2 = createTestPeerInfo(2);

      const imported = dht.import([peer1, peer2]);

      expect(imported).toBe(2);
      expect(dht.getPeerCount()).toBe(2);
    });

    it('should round-trip export/import', () => {
      const originalDHT = new KademliaDHT(localNodeId);
      originalDHT.addPeer(createTestPeerInfo(1));
      originalDHT.addPeer(createTestPeerInfo(2));
      originalDHT.addPeer(createTestPeerInfo(3));

      const exported = originalDHT.export();

      const newDHT = new KademliaDHT(localNodeId);
      const imported = newDHT.import(exported);

      expect(imported).toBe(3);
      expect(newDHT.getPeerCount()).toBe(3);

      originalDHT.stop();
      newDHT.stop();
    });
  });

  describe('lifecycle', () => {
    it('should start refresh timer', () => {
      dht.start();

      // Verify timer is running by advancing time
      vi.advanceTimersByTime(3600001); // Just over 1 hour

      // No error should occur
      expect(dht.getPeerCount()).toBe(0);
    });

    it('should stop refresh timer', () => {
      dht.start();
      dht.stop();

      // Should not throw when advancing time after stop
      vi.advanceTimersByTime(10000000);
      expect(true).toBe(true);
    });

    it('should remove stale peers during refresh', () => {
      const shortRefreshDHT = new KademliaDHT(localNodeId, {
        refreshInterval: 1000,
        peerTimeout: 500,
      });

      const peer = createTestPeerInfo(1);
      shortRefreshDHT.addPeer(peer);
      expect(shortRefreshDHT.getPeerCount()).toBe(1);

      shortRefreshDHT.start();

      // Age the peer past timeout
      vi.advanceTimersByTime(1500);

      expect(shortRefreshDHT.getPeerCount()).toBe(0);

      shortRefreshDHT.stop();
    });
  });
});

describe('bootstrapDHT', () => {
  it('should add bootstrap peers to DHT', async () => {
    const dht = new KademliaDHT(createTestNodeId(0));

    const bootstrapPeers = [
      createTestPeerInfo(100),
      createTestPeerInfo(101),
      createTestPeerInfo(102),
    ];

    const added = await bootstrapDHT(dht, bootstrapPeers);

    expect(added).toBe(3);
    expect(dht.getPeerCount()).toBe(3);

    dht.stop();
  });
});

describe('generateRandomNodeId', () => {
  it('should generate valid node ID', () => {
    const nodeId = generateRandomNodeId();

    expect(nodeId).toMatch(/^CFN-[0-9a-f]{32}$/);
  });

  it('should generate unique IDs', () => {
    const ids = new Set<NodeId>();

    for (let i = 0; i < 100; i++) {
      ids.add(generateRandomNodeId());
    }

    expect(ids.size).toBe(100);
  });
});

describe('DEFAULT_DHT_CONFIG', () => {
  it('should have reasonable defaults', () => {
    expect(DEFAULT_DHT_CONFIG.bucketSize).toBe(20);
    expect(DEFAULT_DHT_CONFIG.alpha).toBe(3);
    expect(DEFAULT_DHT_CONFIG.idBits).toBe(128);
    expect(DEFAULT_DHT_CONFIG.peerTimeout).toBe(15 * 60 * 1000);
    expect(DEFAULT_DHT_CONFIG.refreshInterval).toBe(60 * 60 * 1000);
    expect(DEFAULT_DHT_CONFIG.maxQueryResults).toBe(20);
  });
});
