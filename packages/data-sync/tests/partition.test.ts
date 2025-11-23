/**
 * Partition Detection Tests
 *
 * Tests for network partition detection and healing
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PartitionDetector, PartitionHealer } from '../src/partition';

describe('PartitionDetector', () => {
  let detector: PartitionDetector;

  beforeEach(() => {
    vi.useFakeTimers();
    detector = new PartitionDetector({
      nodeId: 'node1',
      heartbeatIntervalMs: 100,
      suspectThresholdMs: 300,
      unreachableThresholdMs: 1000,
      failureThreshold: 3,
      healingDelayMs: 500,
      quorumPercentage: 51,
    });
  });

  afterEach(() => {
    detector.stop();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should start in unknown state', () => {
      expect(detector.getState()).toBe('unknown');
    });

    it('should change to connected after start', () => {
      detector.start(['peer1', 'peer2']);
      expect(detector.getState()).toBe('connected');
    });

    it('should track peers', () => {
      detector.start(['peer1', 'peer2']);
      const peers = detector.getAllPeers();
      expect(peers).toHaveLength(2);
    });
  });

  describe('Heartbeat Handling', () => {
    beforeEach(() => {
      detector.start(['peer1', 'peer2']);
    });

    it('should mark peer as healthy on heartbeat', () => {
      detector.handleHeartbeat({
        sourceNode: 'peer1',
        timestamp: Date.now(),
        sequence: 1,
        knownPeers: ['node1', 'peer2'],
      });

      const status = detector.getPeerStatus('peer1');
      expect(status?.health).toBe('healthy');
    });

    it('should calculate round trip time', () => {
      const timestamp = Date.now() - 50; // 50ms ago
      detector.handleHeartbeat({
        sourceNode: 'peer1',
        timestamp,
        sequence: 1,
        knownPeers: [],
      });

      const status = detector.getPeerStatus('peer1');
      expect(status?.roundTripTime).toBeGreaterThanOrEqual(50);
    });

    it('should track consecutive failures', () => {
      detector.recordHeartbeatFailure('peer1');
      expect(detector.getPeerStatus('peer1')?.consecutiveFailures).toBe(1);

      detector.recordHeartbeatFailure('peer1');
      expect(detector.getPeerStatus('peer1')?.consecutiveFailures).toBe(2);
    });

    it('should mark peer as suspect after failures', () => {
      detector.recordHeartbeatFailure('peer1');
      detector.recordHeartbeatFailure('peer1');

      const status = detector.getPeerStatus('peer1');
      expect(status?.health).toBe('suspect');
    });

    it('should mark peer as unreachable after threshold', () => {
      for (let i = 0; i < 5; i++) {
        detector.recordHeartbeatFailure('peer1');
      }

      const status = detector.getPeerStatus('peer1');
      expect(status?.health).toBe('unreachable');
    });

    it('should recover peer on successful heartbeat', () => {
      // Mark as unreachable
      for (let i = 0; i < 5; i++) {
        detector.recordHeartbeatFailure('peer1');
      }
      expect(detector.getPeerStatus('peer1')?.health).toBe('unreachable');

      // Receive heartbeat
      detector.handleHeartbeat({
        sourceNode: 'peer1',
        timestamp: Date.now(),
        sequence: 10,
        knownPeers: [],
      });

      expect(detector.getPeerStatus('peer1')?.health).toBe('healthy');
      expect(detector.getPeerStatus('peer1')?.consecutiveFailures).toBe(0);
    });
  });

  describe('Events', () => {
    beforeEach(() => {
      detector.start(['peer1', 'peer2']);
    });

    it('should emit peer:suspect event', () => {
      const listener = vi.fn();
      detector.on('peer:suspect', listener);

      detector.recordHeartbeatFailure('peer1');
      detector.recordHeartbeatFailure('peer1');

      expect(listener).toHaveBeenCalledWith('peer1');
    });

    it('should emit peer:lost event', () => {
      const listener = vi.fn();
      detector.on('peer:lost', listener);

      for (let i = 0; i < 5; i++) {
        detector.recordHeartbeatFailure('peer1');
      }

      expect(listener).toHaveBeenCalledWith('peer1');
    });

    it('should emit peer:recovered event', () => {
      const listener = vi.fn();
      detector.on('peer:recovered', listener);

      // Make peer unreachable
      for (let i = 0; i < 5; i++) {
        detector.recordHeartbeatFailure('peer1');
      }

      // Recover
      detector.handleHeartbeat({
        sourceNode: 'peer1',
        timestamp: Date.now(),
        sequence: 1,
        knownPeers: [],
      });

      expect(listener).toHaveBeenCalledWith('peer1');
    });

    it('should emit health:changed event', () => {
      const listener = vi.fn();
      detector.on('health:changed', listener);

      detector.recordHeartbeatFailure('peer1');
      detector.recordHeartbeatFailure('peer1');

      expect(listener).toHaveBeenCalledWith('peer1', 'unknown', 'suspect');
    });
  });

  describe('Heartbeat Generation', () => {
    it('should generate heartbeats', () => {
      detector.start(['peer1']);

      const hb1 = detector.generateHeartbeat();
      const hb2 = detector.generateHeartbeat();

      expect(hb1?.sourceNode).toBe('node1');
      expect(hb2?.sequence).toBe(hb1!.sequence + 1);
    });

    it('should include known peers', () => {
      detector.start(['peer1', 'peer2']);

      const hb = detector.generateHeartbeat();
      expect(hb?.knownPeers).toContain('peer1');
      expect(hb?.knownPeers).toContain('peer2');
    });
  });

  describe('Quorum', () => {
    it('should report quorum when majority healthy', () => {
      detector.start(['peer1', 'peer2']);

      // Mark one peer healthy
      detector.handleHeartbeat({
        sourceNode: 'peer1',
        timestamp: Date.now(),
        sequence: 1,
        knownPeers: [],
      });

      // 2 out of 3 (including self) are healthy = 66%
      expect(detector.hasQuorum()).toBe(true);
    });

    it('should report no quorum when minority healthy', () => {
      detector.start(['peer1', 'peer2', 'peer3', 'peer4']);

      // All peers unreachable - only self is healthy
      // 1 out of 5 = 20% < 51%
      expect(detector.hasQuorum()).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      detector.start(['peer1', 'peer2', 'peer3']);

      // Make peer1 healthy
      detector.handleHeartbeat({
        sourceNode: 'peer1',
        timestamp: Date.now(),
        sequence: 1,
        knownPeers: [],
      });

      // Make peer2 suspect
      detector.recordHeartbeatFailure('peer2');
      detector.recordHeartbeatFailure('peer2');

      // Make peer3 unreachable
      for (let i = 0; i < 5; i++) {
        detector.recordHeartbeatFailure('peer3');
      }

      const stats = detector.getStats();
      expect(stats.totalPeers).toBe(3);
      expect(stats.healthyPeers).toBe(1);
      expect(stats.suspectPeers).toBe(1);
      expect(stats.unreachablePeers).toBe(1);
    });
  });

  describe('Healthy Peers', () => {
    it('should return only healthy peers', () => {
      detector.start(['peer1', 'peer2', 'peer3']);

      detector.handleHeartbeat({
        sourceNode: 'peer1',
        timestamp: Date.now(),
        sequence: 1,
        knownPeers: [],
      });

      for (let i = 0; i < 5; i++) {
        detector.recordHeartbeatFailure('peer2');
      }

      const healthy = detector.getHealthyPeers();
      expect(healthy).toHaveLength(1);
      expect(healthy[0].nodeId).toBe('peer1');
    });
  });
});

describe('PartitionHealer', () => {
  it('should call healing callbacks', async () => {
    const onStart = vi.fn();
    const onComplete = vi.fn();

    const healer = new PartitionHealer('node1', {
      onHealingStart: onStart,
      onHealingComplete: onComplete,
    });

    const syncFn = vi.fn().mockResolvedValue(undefined);

    await healer.startHealing(
      [
        {
          id: 0,
          nodes: new Set(['node1', 'peer1']),
          leaderNode: 'node1',
          createdAt: new Date(),
          lastActivity: new Date(),
        },
      ],
      syncFn
    );

    expect(onStart).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
    expect(syncFn).toHaveBeenCalled();
  });

  it('should prioritize leaders for healing', () => {
    const healer = new PartitionHealer('node1');

    const priority = healer.getHealingPriority([
      {
        id: 0,
        nodes: new Set(['node1', 'peer1']),
        leaderNode: 'peer1',
        createdAt: new Date(),
        lastActivity: new Date(),
      },
      {
        id: 1,
        nodes: new Set(['peer2', 'peer3']),
        leaderNode: 'peer2',
        createdAt: new Date(),
        lastActivity: new Date(),
      },
    ]);

    // Leaders should come first
    expect(priority[0]).toBe('peer1');
    expect(priority[1]).toBe('peer2');
  });

  it('should exclude self from healing list', () => {
    const healer = new PartitionHealer('node1');

    const priority = healer.getHealingPriority([
      {
        id: 0,
        nodes: new Set(['node1', 'peer1', 'peer2']),
        leaderNode: 'node1',
        createdAt: new Date(),
        lastActivity: new Date(),
      },
    ]);

    expect(priority).not.toContain('node1');
    expect(priority).toContain('peer1');
    expect(priority).toContain('peer2');
  });
});
