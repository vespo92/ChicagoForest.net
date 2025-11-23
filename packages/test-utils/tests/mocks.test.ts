/**
 * Mock Tests
 *
 * Unit tests for all mock implementations in test-utils package.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  // NPCPU mocks
  createMockNPCPU,
  createTestCognitiveQuery,
  createTestAITask,
  MockNPCPUConnector,
  // ConShrink mocks
  createMockConShrink,
  createTestProposal,
  createTestEncryptedVote,
  MockConShrinkBridge,
  // Network simulator
  createNetworkSimulator,
  NetworkSimulator,
  // Core mocks
  MockTransport,
  MockPeerDiscovery,
  MockConnectionManager,
  MockSignalPropagator,
  MockHyphalNetwork,
  createMockTransport,
  createMockPeerDiscovery,
  createMockConnectionManager,
  createMockSignalPropagator,
  createMockHyphalNetwork,
  // Helpers
  createTestNodeId,
  createTestPeerInfo,
} from '../src';

describe('MockNPCPUConnector', () => {
  let npcpu: MockNPCPUConnector;

  beforeEach(async () => {
    npcpu = createMockNPCPU({ processingDelay: 5 });
    await npcpu.connect();
  });

  afterEach(() => {
    npcpu.reset();
  });

  it('should connect and disconnect', async () => {
    expect(npcpu.isConnected()).toBe(true);
    await npcpu.disconnect();
    expect(npcpu.isConnected()).toBe(false);
  });

  it('should process cognitive queries', async () => {
    const query = createTestCognitiveQuery({ type: 'analyze' });
    const response = await npcpu.routeCognitiveQuery(query);

    expect(response.success).toBe(true);
    expect(response.queryId).toBe(query.id);
    expect(response.processingTime).toBeGreaterThan(0);
  });

  it('should track received queries', async () => {
    const query1 = createTestCognitiveQuery({ type: 'predict' });
    const query2 = createTestCognitiveQuery({ type: 'optimize' });

    await npcpu.routeCognitiveQuery(query1);
    await npcpu.routeCognitiveQuery(query2);

    const queries = npcpu.getReceivedQueries();
    expect(queries.length).toBe(2);
    expect(queries[0].id).toBe(query1.id);
    expect(queries[1].id).toBe(query2.id);
  });

  it('should distribute AI tasks', async () => {
    const task = createTestAITask({ type: 'inference' });
    const result = await npcpu.distributeProcessing(task);

    expect(result.success).toBe(true);
    expect(result.taskId).toBe(task.id);
  });

  it('should simulate failures when failure rate is set', async () => {
    npcpu.setFailureRate(1.0);

    const query = createTestCognitiveQuery();
    const response = await npcpu.routeCognitiveQuery(query);

    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });

  it('should throw when not connected', async () => {
    await npcpu.disconnect();

    await expect(npcpu.routeCognitiveQuery(createTestCognitiveQuery())).rejects.toThrow(
      'NPCPU connector not connected'
    );
  });
});

describe('MockConShrinkBridge', () => {
  let conShrink: MockConShrinkBridge;

  beforeEach(async () => {
    conShrink = createMockConShrink({ processingDelay: 5 });
    await conShrink.connect();
  });

  afterEach(() => {
    conShrink.reset();
  });

  it('should connect and disconnect', async () => {
    expect(conShrink.isConnected()).toBe(true);
    await conShrink.disconnect();
    expect(conShrink.isConnected()).toBe(false);
  });

  it('should submit proposals', async () => {
    const proposal = createTestProposal({ title: 'Test Proposal' });
    const billId = await conShrink.submitProposal(proposal);

    expect(billId).toMatch(/^BILL-/);

    const bill = conShrink.getBill(billId);
    expect(bill).toBeDefined();
    expect(bill?.status).toBe('submitted');
  });

  it('should route votes', async () => {
    const proposal = createTestProposal();
    const billId = await conShrink.submitProposal(proposal);

    const vote = createTestEncryptedVote(billId);
    const receipt = await conShrink.routeVote(vote);

    expect(receipt.accepted).toBe(true);
    expect(receipt.billId).toBe(billId);
  });

  it('should track votes for bills', async () => {
    const proposal = createTestProposal();
    const billId = await conShrink.submitProposal(proposal);

    await conShrink.routeVote(createTestEncryptedVote(billId));
    await conShrink.routeVote(createTestEncryptedVote(billId));
    await conShrink.routeVote(createTestEncryptedVote(billId));

    const votes = conShrink.getVotesForBill(billId);
    expect(votes.length).toBe(3);
  });

  it('should simulate bill outcomes', async () => {
    const proposal = createTestProposal();
    const billId = await conShrink.submitProposal(proposal);

    conShrink.simulateBillOutcome(billId, true);

    const bill = conShrink.getBill(billId);
    expect(bill?.status).toBe('passed');
  });

  it('should initialize test regions on connect', async () => {
    const regions = conShrink.getAllRegions();
    expect(regions.length).toBeGreaterThan(0);
    expect(regions.some((r) => r.regionId === 'chicago-north')).toBe(true);
  });

  it('should throw when not connected', async () => {
    await conShrink.disconnect();

    await expect(conShrink.submitProposal(createTestProposal())).rejects.toThrow(
      'ConShrink bridge not connected'
    );
  });
});

describe('NetworkSimulator', () => {
  let network: NetworkSimulator;

  beforeEach(() => {
    network = createNetworkSimulator({ baseLatencyMs: 5 });
  });

  afterEach(() => {
    network.reset();
  });

  it('should create mesh topology', () => {
    network.createNetwork({ type: 'mesh', nodeCount: 4 });

    const stats = network.getStats();
    expect(stats.totalNodes).toBe(4);
    expect(stats.totalConnections).toBe(6); // 4*3/2
  });

  it('should create star topology', () => {
    network.createNetwork({ type: 'star', nodeCount: 5 });

    const stats = network.getStats();
    expect(stats.totalNodes).toBe(5);
    expect(stats.totalConnections).toBe(4); // Hub to 4 nodes
  });

  it('should create ring topology', () => {
    network.createNetwork({ type: 'ring', nodeCount: 5 });

    const stats = network.getStats();
    expect(stats.totalNodes).toBe(5);
    expect(stats.totalConnections).toBe(5);
  });

  it('should add and remove nodes', () => {
    network.createNetwork({ type: 'mesh', nodeCount: 3 });

    const newNode = network.addNode();
    expect(network.getStats().totalNodes).toBe(4);

    network.removeNode(newNode.id);
    expect(network.getStats().totalNodes).toBe(3);
  });

  it('should connect and disconnect nodes', () => {
    network.createNetwork({ type: 'star', nodeCount: 3 });
    const node0 = createTestNodeId(0);
    const node1 = createTestNodeId(1);
    const node2 = createTestNodeId(2);

    // Star: 0 is hub, connected to 1 and 2
    // Connect 1 to 2
    network.connect(node1, node2);
    expect(network.getNode(node1)?.connections.has(node2)).toBe(true);

    network.disconnect(node1, node2);
    expect(network.getNode(node1)?.connections.has(node2)).toBe(false);
  });

  it('should deliver messages between nodes', async () => {
    network.createNetwork({ type: 'mesh', nodeCount: 3 });
    const from = createTestNodeId(0);
    const to = createTestNodeId(1);

    const message = {
      type: 'PING' as const,
      id: 'test-msg',
      from,
      timestamp: Date.now(),
      payload: {},
    };

    const result = await network.sendMessage(from, to, message);
    expect(result).toBe(true);

    const received = network.getNodeMessages(to);
    expect(received.length).toBe(1);
  });

  it('should handle offline nodes', async () => {
    network.createNetwork({ type: 'mesh', nodeCount: 3 });
    const from = createTestNodeId(0);
    const to = createTestNodeId(1);

    network.setNodeStatus(to, false);

    const result = await network.sendMessage(from, to, {
      type: 'PING' as const,
      id: 'test',
      from,
      timestamp: Date.now(),
      payload: {},
    });

    expect(result).toBe(false);
    expect(network.getDroppedMessages().some((d) => d.reason === 'Receiver offline')).toBe(true);
  });

  it('should handle network partitions', async () => {
    network.createNetwork({ type: 'mesh', nodeCount: 4 });

    network.partition([createTestNodeId(0), createTestNodeId(1)]);

    // Cross-partition should fail
    const result = await network.sendMessage(createTestNodeId(0), createTestNodeId(2), {
      type: 'PING' as const,
      id: 'cross',
      from: createTestNodeId(0),
      timestamp: Date.now(),
      payload: {},
    });

    expect(result).toBe(false);
    expect(network.getDroppedMessages().some((d) => d.reason === 'Network partition')).toBe(true);
  });
});

describe('Core Mocks', () => {
  describe('MockTransport', () => {
    it('should connect and track connections', async () => {
      const transport = createMockTransport();

      await transport.connect({ protocol: 'tcp', host: '127.0.0.1', port: 8000 });
      await transport.connect({ protocol: 'tcp', host: '127.0.0.1', port: 8001 });

      expect(transport.getConnectionCount()).toBe(2);

      await transport.closeAll();
      expect(transport.getConnectionCount()).toBe(0);
    });
  });

  describe('MockPeerDiscovery', () => {
    it('should add and find peers', async () => {
      const discovery = createMockPeerDiscovery(5);

      const peers = await discovery.findPeers(3);
      expect(peers.length).toBe(3);

      discovery.reset();
      const afterReset = await discovery.findPeers();
      expect(afterReset.length).toBe(0);
    });
  });

  describe('MockConnectionManager', () => {
    it('should manage connections and messages', async () => {
      const manager = createMockConnectionManager();
      const peer = createTestPeerInfo();

      await manager.connect(peer);
      expect(manager.getConnectionCount()).toBe(1);

      const message = {
        type: 'PING' as const,
        id: 'test',
        from: createTestNodeId(0),
        timestamp: Date.now(),
        payload: {},
      };

      await manager.sendMessage(peer.nodeId, message);

      const sent = manager.getSentMessages();
      expect(sent.length).toBe(1);
      expect(sent[0].to).toBe(peer.nodeId);
    });
  });

  describe('MockSignalPropagator', () => {
    it('should broadcast and handle signals', async () => {
      const propagator = createMockSignalPropagator();

      const receivedSignals: any[] = [];
      propagator.onSignal('discovery', (signal) => receivedSignals.push(signal));

      const signal = await propagator.broadcast('discovery', { nodeId: 'test' });

      await propagator.handleIncoming(signal);

      expect(receivedSignals.length).toBe(1);
      expect(propagator.getSignals().length).toBe(2); // broadcast + incoming
    });
  });

  describe('MockHyphalNetwork', () => {
    it('should establish and manage paths', async () => {
      const hyphal = createMockHyphalNetwork(createTestNodeId(0));

      const path = await hyphal.establishPath(createTestNodeId(1), [createTestNodeId(5)]);

      expect(path.state).toBe('active');
      expect(hyphal.pathCount).toBe(1);

      hyphal.degradePath(path.id);
      expect(hyphal.getBestPath(createTestNodeId(1))?.state).toBe('stressed');

      hyphal.healPath(path.id);
      expect(hyphal.getBestPath(createTestNodeId(1))?.state).toBe('active');

      hyphal.removePath(path.id);
      expect(hyphal.pathCount).toBe(0);
    });
  });
});
