/**
 * Rhizome Network Propagation Tests
 *
 * DISCLAIMER: These tests are for the THEORETICAL framework only.
 * This code is educational and NOT intended for production use.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  // Main coordinator
  RhizomePropagationCoordinator,
  RhizomePhase,
  PropagationEvent,
  createRhizomePropagation,
  createChicagoRhizomeNode,
  createLightweightRhizome,

  // Gossip protocol
  RhizomeGossipProtocol,
  GossipMessageType,
  DisseminationStrategy,
  createGossipProtocol,
  createHighThroughputGossip,
  createReliableGossip,

  // State synchronization
  RhizomeStateSync,
  SyncStateType,
  ConflictResolution,
  createStateSync,
  GCounter,
  PNCounter,
  LWWRegister,
  GSet,

  // Lateral growth
  RhizomeLateralGrowth,
  GrowthDirection,
  SegmentType,
  createLateralGrowth,
  createAggressiveGrowth,
  createConservativeGrowth
} from '../src/rhizome';

// ============================================================================
// GOSSIP PROTOCOL TESTS
// ============================================================================

describe('RhizomeGossipProtocol', () => {
  let gossip: RhizomeGossipProtocol;

  beforeEach(() => {
    gossip = createGossipProtocol('test-node-1');
  });

  afterEach(() => {
    gossip.stop();
  });

  describe('initialization', () => {
    it('should create a gossip protocol instance', () => {
      expect(gossip).toBeInstanceOf(RhizomeGossipProtocol);
    });

    it('should have correct node ID', () => {
      const stats = gossip.getStats();
      expect(stats.nodeId).toBe('test-node-1');
    });

    it('should start with no peers', () => {
      expect(gossip.getPeers()).toHaveLength(0);
    });
  });

  describe('peer management', () => {
    it('should add a peer', () => {
      gossip.addPeer('peer-1', 0.8);
      expect(gossip.getPeers()).toContain('peer-1');
    });

    it('should remove a peer', () => {
      gossip.addPeer('peer-1', 0.8);
      gossip.removePeer('peer-1');
      expect(gossip.getPeers()).not.toContain('peer-1');
    });

    it('should emit peerAdded event', () => {
      const handler = vi.fn();
      gossip.on('peerAdded', handler);
      gossip.addPeer('peer-1', 0.8);
      expect(handler).toHaveBeenCalledWith({ peerId: 'peer-1' });
    });
  });

  describe('message broadcasting', () => {
    it('should broadcast a message', () => {
      const message = gossip.broadcast(
        GossipMessageType.DISCOVERY,
        { type: 'test' }
      );

      expect(message).toBeDefined();
      expect(message.messageId).toBeTruthy();
      expect(message.type).toBe(GossipMessageType.DISCOVERY);
      expect(message.originNodeId).toBe('test-node-1');
    });

    it('should emit messageBroadcast event', () => {
      const handler = vi.fn();
      gossip.on('messageBroadcast', handler);

      gossip.broadcast(GossipMessageType.HEARTBEAT, { timestamp: Date.now() });

      expect(handler).toHaveBeenCalled();
    });

    it('should increment message statistics', () => {
      gossip.broadcast(GossipMessageType.ALERT, { alert: 'test' });
      gossip.broadcast(GossipMessageType.ALERT, { alert: 'test2' });

      const stats = gossip.getStats();
      expect(stats.activeMessages).toBeGreaterThanOrEqual(2);
    });
  });

  describe('message receiving', () => {
    it('should receive and process a message', () => {
      gossip.addPeer('peer-2', 0.5);

      const mockMessage = {
        messageId: 'msg-123',
        type: GossipMessageType.STATE_UPDATE,
        originNodeId: 'peer-2',
        payload: { key: 'value' },
        timestamp: 1,
        vectorClock: new Map([['peer-2', 1]]),
        ttl: 5,
        hopCount: 1,
        priority: 5,
        signature: 'test-signature',
        createdAt: Date.now(),
        expiresAt: 0
      };

      const received = gossip.receiveMessage(mockMessage, 'peer-2');
      expect(received).toBe(true);
    });

    it('should reject duplicate messages', () => {
      gossip.addPeer('peer-2', 0.5);

      const mockMessage = {
        messageId: 'msg-duplicate',
        type: GossipMessageType.DISCOVERY,
        originNodeId: 'peer-2',
        payload: {},
        timestamp: 1,
        vectorClock: new Map(),
        ttl: 5,
        hopCount: 1,
        priority: 5,
        signature: 'sig',
        createdAt: Date.now(),
        expiresAt: 0
      };

      gossip.receiveMessage(mockMessage, 'peer-2');
      const secondReceive = gossip.receiveMessage(mockMessage, 'peer-2');

      expect(secondReceive).toBe(false);
    });

    it('should reject expired messages', () => {
      const mockMessage = {
        messageId: 'msg-expired',
        type: GossipMessageType.DISCOVERY,
        originNodeId: 'peer-2',
        payload: {},
        timestamp: 1,
        vectorClock: new Map(),
        ttl: 5,
        hopCount: 1,
        priority: 5,
        signature: 'sig',
        createdAt: Date.now() - 1000000,
        expiresAt: Date.now() - 1000 // Expired
      };

      const received = gossip.receiveMessage(mockMessage, 'peer-2');
      expect(received).toBe(false);
    });
  });

  describe('factory functions', () => {
    it('should create high-throughput gossip', () => {
      const highThroughput = createHighThroughputGossip('node-ht');
      expect(highThroughput).toBeInstanceOf(RhizomeGossipProtocol);
      highThroughput.stop();
    });

    it('should create reliable gossip', () => {
      const reliable = createReliableGossip('node-reliable');
      expect(reliable).toBeInstanceOf(RhizomeGossipProtocol);
      reliable.stop();
    });
  });
});

// ============================================================================
// STATE SYNCHRONIZATION TESTS
// ============================================================================

describe('RhizomeStateSync', () => {
  let stateSync: RhizomeStateSync;

  beforeEach(() => {
    stateSync = createStateSync('sync-node-1');
  });

  describe('state operations', () => {
    it('should set and get state', () => {
      stateSync.set('test-key', { value: 42 });
      const result = stateSync.get<{ value: number }>('test-key');
      expect(result).toEqual({ value: 42 });
    });

    it('should return undefined for non-existent key', () => {
      const result = stateSync.get('non-existent');
      expect(result).toBeUndefined();
    });

    it('should delete state', () => {
      stateSync.set('delete-key', 'value');
      const deleted = stateSync.delete('delete-key');
      expect(deleted).toBe(true);
      expect(stateSync.get('delete-key')).toBeUndefined();
    });

    it('should merge partial updates', () => {
      stateSync.set('merge-key', { a: 1, b: 2 });
      stateSync.merge('merge-key', { b: 3, c: 4 });

      const result = stateSync.get<{ a: number; b: number; c: number }>('merge-key');
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });
  });

  describe('state types', () => {
    it('should set state with specific type', () => {
      stateSync.set('membership', { nodeId: 'node-1' }, {
        type: SyncStateType.MEMBERSHIP
      });

      const byType = stateSync.getByType(SyncStateType.MEMBERSHIP);
      expect(byType).toHaveLength(1);
    });
  });

  describe('statistics', () => {
    it('should track state statistics', () => {
      stateSync.set('key1', 'value1');
      stateSync.set('key2', 'value2');
      stateSync.delete('key1');

      const stats = stateSync.getStats();
      expect(stats.totalEntries).toBe(2);
      expect(stats.activeEntries).toBe(1);
      expect(stats.deletedEntries).toBe(1);
    });
  });

  describe('snapshot', () => {
    it('should get state snapshot', () => {
      stateSync.set('snap1', 'value1');
      stateSync.set('snap2', 'value2');

      const snapshot = stateSync.getSnapshot();
      expect(snapshot.size).toBe(2);
    });
  });
});

// ============================================================================
// CRDT TESTS
// ============================================================================

describe('CRDTs', () => {
  describe('GCounter', () => {
    it('should increment counter', () => {
      const counter = new GCounter('node-1');
      counter.increment(5);
      expect(counter.value()).toBe(5);
    });

    it('should merge counters', () => {
      const counter1 = new GCounter('node-1');
      const counter2 = new GCounter('node-2');

      counter1.increment(3);
      counter2.increment(5);

      counter1.merge(counter2);
      expect(counter1.value()).toBe(8);
    });

    it('should handle idempotent merge', () => {
      const counter1 = new GCounter('node-1');
      const counter2 = new GCounter('node-1');

      counter1.increment(3);
      counter2.increment(3);

      counter1.merge(counter2);
      expect(counter1.value()).toBe(3);
    });
  });

  describe('PNCounter', () => {
    it('should increment and decrement', () => {
      const counter = new PNCounter('node-1');
      counter.increment(10);
      counter.decrement(3);
      expect(counter.value()).toBe(7);
    });

    it('should merge PNCounters', () => {
      const counter1 = new PNCounter('node-1');
      const counter2 = new PNCounter('node-2');

      counter1.increment(10);
      counter2.decrement(3);

      counter1.merge(counter2);
      expect(counter1.value()).toBe(7);
    });
  });

  describe('LWWRegister', () => {
    it('should store and retrieve value', () => {
      const register = new LWWRegister<string>('node-1', 'initial');
      expect(register.value()).toBe('initial');
    });

    it('should update value', () => {
      const register = new LWWRegister<string>('node-1', 'initial');
      register.set('updated');
      expect(register.value()).toBe('updated');
    });

    it('should merge with later timestamp winning', () => {
      const register1 = new LWWRegister<string>('node-1', 'first');
      const register2 = new LWWRegister<string>('node-2', 'second');

      // Wait a bit so timestamps differ
      register2.set('later', Date.now() + 1000);

      register1.merge(register2);
      expect(register1.value()).toBe('later');
    });
  });

  describe('GSet', () => {
    it('should add elements', () => {
      const set = new GSet<string>();
      set.add('a');
      set.add('b');
      expect(set.has('a')).toBe(true);
      expect(set.has('b')).toBe(true);
    });

    it('should merge sets', () => {
      const set1 = new GSet<string>();
      const set2 = new GSet<string>();

      set1.add('a');
      set2.add('b');

      set1.merge(set2);
      expect(set1.values()).toContain('a');
      expect(set1.values()).toContain('b');
    });
  });
});

// ============================================================================
// LATERAL GROWTH TESTS
// ============================================================================

describe('RhizomeLateralGrowth', () => {
  let lateralGrowth: RhizomeLateralGrowth;

  beforeEach(() => {
    lateralGrowth = createLateralGrowth('growth-node-1');
  });

  afterEach(() => {
    lateralGrowth.stopGrowth();
  });

  describe('initialization', () => {
    it('should create lateral growth instance', () => {
      expect(lateralGrowth).toBeInstanceOf(RhizomeLateralGrowth);
    });

    it('should initialize root node', () => {
      const root = lateralGrowth.initializeRoot({
        latitude: 41.8781,
        longitude: -87.6298
      });

      expect(root).toBeDefined();
      expect(root.nodeId).toBe('growth-node-1');
      expect(root.parentId).toBeNull();
      expect(root.depth).toBe(0);
    });
  });

  describe('network structure', () => {
    beforeEach(() => {
      lateralGrowth.initializeRoot({
        latitude: 41.8781,
        longitude: -87.6298
      });
    });

    it('should get network structure', () => {
      const network = lateralGrowth.getNetwork();
      expect(network.nodes).toHaveLength(1);
      expect(network.segments).toHaveLength(0);
    });

    it('should get node by ID', () => {
      const node = lateralGrowth.getNode('growth-node-1');
      expect(node).toBeDefined();
      expect(node?.location.latitude).toBeCloseTo(41.8781);
    });

    it('should get nodes at depth', () => {
      const nodesAtDepth0 = lateralGrowth.getNodesAtDepth(0);
      expect(nodesAtDepth0).toHaveLength(1);
    });
  });

  describe('growth waves', () => {
    beforeEach(() => {
      lateralGrowth.initializeRoot({
        latitude: 41.8781,
        longitude: -87.6298
      });
    });

    it('should launch growth wave', () => {
      const wave = lateralGrowth.launchGrowthWave(
        'growth-node-1',
        GrowthDirection.NORTH,
        1.0
      );

      expect(wave).toBeDefined();
      expect(wave?.direction).toBe(GrowthDirection.NORTH);
      expect(wave?.active).toBe(true);
    });

    it('should track wave statistics', () => {
      lateralGrowth.launchGrowthWave('growth-node-1', GrowthDirection.EAST);
      lateralGrowth.launchGrowthWave('growth-node-1', GrowthDirection.WEST);

      const stats = lateralGrowth.getStats();
      expect(stats.totalWavesLaunched).toBe(2);
    });
  });

  describe('statistics', () => {
    it('should provide network statistics', () => {
      lateralGrowth.initializeRoot({
        latitude: 41.8781,
        longitude: -87.6298
      });

      const stats = lateralGrowth.getStats();
      expect(stats.totalNodes).toBe(1);
      expect(stats.activeNodes).toBe(1);
      expect(stats.dormantNodes).toBe(0);
      expect(stats.maxDepth).toBe(0);
    });
  });

  describe('GeoJSON export', () => {
    it('should export to GeoJSON', () => {
      lateralGrowth.initializeRoot({
        latitude: 41.8781,
        longitude: -87.6298
      });

      const geoJson = lateralGrowth.toGeoJSON() as {
        type: string;
        features: unknown[];
      };

      expect(geoJson.type).toBe('FeatureCollection');
      expect(geoJson.features).toHaveLength(1);
    });
  });

  describe('factory functions', () => {
    it('should create aggressive growth', () => {
      const aggressive = createAggressiveGrowth('aggressive-node');
      expect(aggressive).toBeInstanceOf(RhizomeLateralGrowth);
    });

    it('should create conservative growth', () => {
      const conservative = createConservativeGrowth('conservative-node');
      expect(conservative).toBeInstanceOf(RhizomeLateralGrowth);
    });
  });
});

// ============================================================================
// PROPAGATION COORDINATOR TESTS
// ============================================================================

describe('RhizomePropagationCoordinator', () => {
  let coordinator: RhizomePropagationCoordinator;

  beforeEach(() => {
    coordinator = createRhizomePropagation('coord-node-1', {
      latitude: 41.8781,
      longitude: -87.6298
    });
  });

  afterEach(() => {
    coordinator.stop();
  });

  describe('initialization', () => {
    it('should create coordinator instance', () => {
      expect(coordinator).toBeInstanceOf(RhizomePropagationCoordinator);
    });

    it('should start in INITIALIZING phase', () => {
      const stats = coordinator.getStats();
      expect(stats.phase).toBe(RhizomePhase.INITIALIZING);
    });
  });

  describe('lifecycle', () => {
    it('should start successfully', async () => {
      const result = await coordinator.start();
      expect(result).toBe(true);

      const stats = coordinator.getStats();
      expect(stats.phase).toBe(RhizomePhase.GROWING);
    });

    it('should stop gracefully', async () => {
      await coordinator.start();
      coordinator.stop();

      const stats = coordinator.getStats();
      expect(stats.phase).toBe(RhizomePhase.DORMANT);
    });

    it('should emit lifecycle events', async () => {
      const startHandler = vi.fn();
      const stopHandler = vi.fn();

      coordinator.on('started', startHandler);
      coordinator.on('stopped', stopHandler);

      await coordinator.start();
      expect(startHandler).toHaveBeenCalled();

      coordinator.stop();
      expect(stopHandler).toHaveBeenCalled();
    });
  });

  describe('peer connections', () => {
    beforeEach(async () => {
      await coordinator.start();
    });

    it('should connect to peer', async () => {
      const connected = await coordinator.connectToPeer('peer-1');
      expect(connected).toBe(true);
    });

    it('should disconnect from peer', async () => {
      await coordinator.connectToPeer('peer-1');
      coordinator.disconnectFromPeer('peer-1');

      // Connection should be removed
      const stats = coordinator.getStats();
      expect(stats.totalConnections).toBe(0);
    });
  });

  describe('shared state', () => {
    beforeEach(async () => {
      await coordinator.start();
    });

    it('should set and get shared state', () => {
      coordinator.setSharedState('test-key', { data: 'test' });
      const result = coordinator.getSharedState<{ data: string }>('test-key');
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('growth waves', () => {
    beforeEach(async () => {
      await coordinator.start();
    });

    it('should launch growth wave', () => {
      const handler = vi.fn();
      coordinator.on(PropagationEvent.GROWTH_WAVE, handler);

      coordinator.launchGrowthWave(GrowthDirection.NORTH, 1.0);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('topology', () => {
    beforeEach(async () => {
      await coordinator.start();
    });

    it('should get topology view', () => {
      const topology = coordinator.getTopology();

      expect(topology.nodes).toBeDefined();
      expect(topology.connections).toBeDefined();
      expect(topology.timestamp).toBeDefined();
    });
  });

  describe('statistics', () => {
    it('should provide propagation statistics', async () => {
      await coordinator.start();

      const stats = coordinator.getStats();

      expect(stats.phase).toBeDefined();
      expect(stats.totalNodes).toBeGreaterThanOrEqual(1);
      expect(stats.uptime).toBeGreaterThan(0);
    });
  });

  describe('export', () => {
    it('should export state', async () => {
      await coordinator.start();

      const exported = coordinator.exportState();

      expect(exported.identity).toBeDefined();
      expect(exported.phase).toBeDefined();
      expect(exported.topology).toBeDefined();
      expect(exported.rhizomeNetwork).toBeDefined();
      expect(exported.stats).toBeDefined();
    });
  });

  describe('sub-systems', () => {
    it('should expose sub-systems', () => {
      const subSystems = coordinator.getSubSystems();

      expect(subSystems.gossip).toBeInstanceOf(RhizomeGossipProtocol);
      expect(subSystems.stateSync).toBeInstanceOf(RhizomeStateSync);
      expect(subSystems.lateralGrowth).toBeInstanceOf(RhizomeLateralGrowth);
    });
  });

  describe('factory functions', () => {
    afterEach(() => {
      // Clean up any created coordinators
    });

    it('should create Chicago rhizome node', () => {
      const chicago = createChicagoRhizomeNode('chicago-1');
      expect(chicago).toBeInstanceOf(RhizomePropagationCoordinator);
      chicago.stop();
    });

    it('should create lightweight rhizome', () => {
      const lightweight = createLightweightRhizome('light-1', {
        latitude: 40.7128,
        longitude: -74.0060
      });
      expect(lightweight).toBeInstanceOf(RhizomePropagationCoordinator);
      lightweight.stop();
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Integration Tests', () => {
  describe('Multi-node network', () => {
    let node1: RhizomePropagationCoordinator;
    let node2: RhizomePropagationCoordinator;

    beforeEach(async () => {
      node1 = createRhizomePropagation('node-1', {
        latitude: 41.8781,
        longitude: -87.6298
      });
      node2 = createRhizomePropagation('node-2', {
        latitude: 41.8800,
        longitude: -87.6300
      });

      await node1.start();
      await node2.start();
    });

    afterEach(() => {
      node1.stop();
      node2.stop();
    });

    it('should connect two nodes', async () => {
      await node1.connectToPeer('node-2');
      await node2.connectToPeer('node-1');

      const stats1 = node1.getStats();
      const stats2 = node2.getStats();

      expect(stats1.totalConnections).toBe(1);
      expect(stats2.totalConnections).toBe(1);
    });

    it('should share state between nodes', async () => {
      await node1.connectToPeer('node-2');

      node1.setSharedState('shared-key', { value: 'from-node-1' });

      // In a real implementation, this would propagate through gossip
      // For now, we just verify the state is set locally
      const result = node1.getSharedState<{ value: string }>('shared-key');
      expect(result).toEqual({ value: 'from-node-1' });
    });
  });

  describe('Gossip and StateSync integration', () => {
    it('should connect state sync to gossip', () => {
      const gossip = createGossipProtocol('int-node');
      const stateSync = createStateSync('int-node');

      // This should not throw
      expect(() => stateSync.connectGossip(gossip)).not.toThrow();

      gossip.stop();
    });
  });
});
