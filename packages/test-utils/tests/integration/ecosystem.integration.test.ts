/**
 * Ecosystem Integration Tests
 *
 * Comprehensive integration tests spanning Chicago Forest Network,
 * NPCPU, and ConstitutionalShrinkage systems.
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
  createTestNetwork,
  NetworkSimulator,
  // Core mocks
  createMockConnectionManager,
  createMockSignalPropagator,
  createMockHyphalNetwork,
  // Helpers
  createTestNodeId,
  createTestPeerInfo,
  delay,
  waitFor,
} from '../../src';

describe('Ecosystem Integration', () => {
  let npcpu: MockNPCPUConnector;
  let conShrink: MockConShrinkBridge;
  let network: NetworkSimulator;

  beforeEach(async () => {
    npcpu = createMockNPCPU({ processingDelay: 10 });
    conShrink = createMockConShrink({ processingDelay: 10 });
    network = createTestNetwork({ type: 'mesh', nodeCount: 5 });

    await npcpu.connect();
    await conShrink.connect();
  });

  afterEach(() => {
    npcpu.reset();
    conShrink.reset();
    network.reset();
  });

  describe('NPCPU Integration', () => {
    it('should route cognitive query through forest mesh', async () => {
      const query = createTestCognitiveQuery({
        type: 'analyze',
        payload: { topology: 'mesh', nodes: 5 },
        originNode: createTestNodeId(0),
      });

      const response = await npcpu.routeCognitiveQuery(query);

      expect(response.success).toBe(true);
      expect(response.queryId).toBe(query.id);
      expect(response.confidenceScore).toBeGreaterThan(0.8);
      expect(response.nodesTouched).toBeGreaterThan(0);
    });

    it('should distribute AI task across multiple nodes', async () => {
      const task = createTestAITask({
        type: 'inference',
        requirements: { minMemory: 256, gpuRequired: false },
      });

      const result = await npcpu.distributeProcessing(task);

      expect(result.success).toBe(true);
      expect(result.taskId).toBe(task.id);
      expect(result.distributedNodes.length).toBeGreaterThan(0);
      expect(result.resourcesUsed.memory).toBeGreaterThan(0);
    });

    it('should sync consciousness state across network', async () => {
      const snapshot = {
        timestamp: Date.now(),
        globalState: { networkHealth: 'optimal', activeQueries: 5 },
        activeNodes: [createTestNodeId(0), createTestNodeId(1)],
        syncVersion: 1,
      };

      await npcpu.syncConsciousnessState(snapshot);

      const retrieved = npcpu.getConsciousnessState();
      expect(retrieved).toEqual(snapshot);
    });

    it('should handle NPCPU failures gracefully', async () => {
      npcpu.setFailureRate(1.0); // 100% failure rate

      const query = createTestCognitiveQuery();
      const response = await npcpu.routeCognitiveQuery(query);

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });

    it('should emit events for query processing', async () => {
      const events: string[] = [];
      npcpu.on('query:received', () => events.push('received'));
      npcpu.on('query:processed', () => events.push('processed'));

      await npcpu.routeCognitiveQuery(createTestCognitiveQuery());

      expect(events).toContain('received');
      expect(events).toContain('processed');
    });
  });

  describe('ConstitutionalShrinkage Integration', () => {
    it('should submit governance proposal to ConShrinkage', async () => {
      const proposal = createTestProposal({
        title: 'Network Upgrade Proposal',
        category: 'infrastructure',
      });

      const billId = await conShrink.submitProposal(proposal);

      expect(billId).toMatch(/^BILL-/);

      const bill = conShrink.getBill(billId);
      expect(bill).toBeDefined();
      expect(bill?.status).toBe('submitted');
    });

    it('should route encrypted votes through anonymous network', async () => {
      const proposal = createTestProposal();
      const billId = await conShrink.submitProposal(proposal);

      const vote = createTestEncryptedVote(billId);
      const receipt = await conShrink.routeVote(vote);

      expect(receipt.accepted).toBe(true);
      expect(receipt.billId).toBe(billId);
      expect(receipt.blockHeight).toBeGreaterThan(0);
    });

    it('should coordinate regional pods', async () => {
      const regionId = 'chicago-north';
      const nodes = await conShrink.coordinateRegionalNodes(regionId);

      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes.every((n) => n.includes(regionId))).toBe(true);
    });

    it('should sync regional data', async () => {
      const regionId = 'chicago-central';
      const state = await conShrink.syncRegionalData(regionId);

      expect(state.regionId).toBe(regionId);
      expect(state.activeNodes.length).toBeGreaterThan(0);
      expect(state.delegateNode).toBeDefined();
    });

    it('should translate forest proposal to ConShrink bill', () => {
      const forestProposal = createTestProposal({
        id: 'FOREST-001',
        title: 'Mesh Expansion',
      });

      const bill = conShrink.translateProposal(forestProposal);

      expect(bill.proposalId).toBe('FOREST-001');
      expect(bill.status).toBe('draft');
    });

    it('should finalize voting and determine outcome', async () => {
      const proposal = createTestProposal();
      const billId = await conShrink.submitProposal(proposal);

      // Cast several votes
      for (let i = 0; i < 5; i++) {
        await conShrink.routeVote(createTestEncryptedVote(billId));
      }

      // Sync results
      const finalBill = await conShrink.syncVotingResults(billId);

      const totalVotes = finalBill.votes.for + finalBill.votes.against + finalBill.votes.abstain;
      expect(totalVotes).toBe(5);
    });
  });

  describe('Network Simulation', () => {
    it('should simulate mesh network topology', () => {
      const stats = network.getStats();

      expect(stats.totalNodes).toBe(5);
      expect(stats.onlineNodes).toBe(5);
      // Mesh topology: n*(n-1)/2 connections
      expect(stats.totalConnections).toBe(10);
    });

    it('should deliver messages between connected nodes', async () => {
      const from = createTestNodeId(0);
      const to = createTestNodeId(1);
      const message = {
        type: 'PING' as const,
        id: 'test-msg-1',
        from,
        timestamp: Date.now(),
        payload: { test: true },
      };

      const delivered = await network.sendMessage(from, to, message);

      expect(delivered).toBe(true);

      const receivedMessages = network.getNodeMessages(to);
      expect(receivedMessages.length).toBe(1);
      expect(receivedMessages[0].id).toBe('test-msg-1');
    });

    it('should handle network partitions', async () => {
      const group1 = [createTestNodeId(0), createTestNodeId(1)];
      network.partition(group1);

      // Message within partition should succeed
      const intraPartition = await network.sendMessage(
        createTestNodeId(0),
        createTestNodeId(1),
        { type: 'PING' as const, id: 'intra', from: createTestNodeId(0), timestamp: Date.now(), payload: {} }
      );
      expect(intraPartition).toBe(true);

      // Message across partition should fail
      const crossPartition = await network.sendMessage(
        createTestNodeId(0),
        createTestNodeId(2),
        { type: 'PING' as const, id: 'cross', from: createTestNodeId(0), timestamp: Date.now(), payload: {} }
      );
      expect(crossPartition).toBe(false);

      const dropped = network.getDroppedMessages();
      expect(dropped.some((d) => d.reason === 'Network partition')).toBe(true);
    });

    it('should heal network partitions', async () => {
      network.partition([createTestNodeId(0)]);

      // Verify partition is active
      let result = await network.sendMessage(
        createTestNodeId(0),
        createTestNodeId(2),
        { type: 'PING' as const, id: 'test', from: createTestNodeId(0), timestamp: Date.now(), payload: {} }
      );
      expect(result).toBe(false);

      // Heal partition
      network.healPartition();

      // Verify connectivity restored
      result = await network.sendMessage(
        createTestNodeId(0),
        createTestNodeId(2),
        { type: 'PING' as const, id: 'test2', from: createTestNodeId(0), timestamp: Date.now(), payload: {} }
      );
      expect(result).toBe(true);
    });

    it('should simulate node failures', async () => {
      const nodeId = createTestNodeId(2);
      network.setNodeStatus(nodeId, false);

      // Messages to offline node should fail
      const result = await network.sendMessage(
        createTestNodeId(0),
        nodeId,
        { type: 'PING' as const, id: 'test', from: createTestNodeId(0), timestamp: Date.now(), payload: {} }
      );

      expect(result).toBe(false);
      expect(network.getOnlineNodes().length).toBe(4);
    });

    it('should broadcast to all connected nodes', async () => {
      const from = createTestNodeId(0);
      const message = {
        type: 'ANNOUNCE' as const,
        id: 'broadcast-1',
        from,
        timestamp: Date.now(),
        payload: { announcement: 'hello network' },
      };

      const delivered = await network.broadcast(from, message);

      expect(delivered).toBe(4); // All other nodes in mesh
    });

    it('should support different network topologies', () => {
      // Star topology
      const starNetwork = createTestNetwork({ type: 'star', nodeCount: 5 });
      const starStats = starNetwork.getStats();
      expect(starStats.totalConnections).toBe(4); // Hub to 4 nodes

      // Ring topology
      const ringNetwork = createTestNetwork({ type: 'ring', nodeCount: 5 });
      const ringStats = ringNetwork.getStats();
      expect(ringStats.totalConnections).toBe(5); // Each node connects to 2 neighbors

      starNetwork.reset();
      ringNetwork.reset();
    });
  });

  describe('Cross-System Integration', () => {
    it('should route NPCPU cognitive query through forest mesh with governance', async () => {
      // 1. Start with a network proposal
      const proposal = createTestProposal({
        title: 'Enable AI Routing',
        category: 'infrastructure',
      });
      const billId = await conShrink.submitProposal(proposal);

      // 2. Simulate voting
      for (let i = 0; i < 3; i++) {
        await conShrink.routeVote(createTestEncryptedVote(billId));
      }

      // 3. Once passed, route cognitive query
      conShrink.simulateBillOutcome(billId, true);

      const query = createTestCognitiveQuery({
        type: 'optimize',
        payload: { target: 'network-routing' },
      });

      const response = await npcpu.routeCognitiveQuery(query);
      expect(response.success).toBe(true);

      // 4. Verify governance tracked the proposal
      const bill = conShrink.getBill(billId);
      expect(bill?.status).toBe('passed');
    });

    it('should coordinate regional nodes with NPCPU distribution', async () => {
      // Get regional nodes
      const regionNodes = await conShrink.coordinateRegionalNodes('chicago-west');

      // Distribute AI task across regional nodes
      const task = createTestAITask({
        type: 'regional-analysis',
        payload: { region: 'chicago-west', nodes: regionNodes },
      });

      const result = await npcpu.distributeProcessing(task);

      expect(result.success).toBe(true);
      expect(result.distributedNodes.length).toBeGreaterThan(0);
    });

    it('should handle full ecosystem workflow', async () => {
      // 1. Create network
      const meshNetwork = createTestNetwork({ type: 'mesh', nodeCount: 10 });

      // 2. Submit governance proposal
      const proposal = createTestProposal({
        title: 'Network Expansion',
        category: 'infrastructure',
      });
      const billId = await conShrink.submitProposal(proposal);

      // 3. Vote on proposal
      for (let i = 0; i < 7; i++) {
        await conShrink.routeVote(createTestEncryptedVote(billId));
      }

      // 4. Process with NPCPU
      const analysisQuery = createTestCognitiveQuery({
        type: 'analyze',
        payload: { proposal: billId, networkState: meshNetwork.getStats() },
      });
      const analysis = await npcpu.routeCognitiveQuery(analysisQuery);

      // 5. Broadcast result across network
      const broadcastMessage = {
        type: 'DATA' as const,
        id: 'analysis-result',
        from: createTestNodeId(0),
        timestamp: Date.now(),
        payload: { analysis: analysis.result },
      };
      const delivered = await meshNetwork.broadcast(createTestNodeId(0), broadcastMessage);

      expect(analysis.success).toBe(true);
      expect(delivered).toBe(9); // 10 nodes - 1 sender

      meshNetwork.reset();
    });
  });
});

describe('Component Integration', () => {
  describe('Connection Manager + Signal Propagator', () => {
    it('should propagate signals through connection manager', async () => {
      const connectionManager = createMockConnectionManager();
      const signalPropagator = createMockSignalPropagator();

      // Connect some peers
      const peers = [
        createTestPeerInfo({ nodeId: createTestNodeId(1) }),
        createTestPeerInfo({ nodeId: createTestNodeId(2) }),
        createTestPeerInfo({ nodeId: createTestNodeId(3) }),
      ];

      for (const peer of peers) {
        await connectionManager.connect(peer);
      }

      // Broadcast signal
      const signal = await signalPropagator.broadcast('discovery', { nodeId: createTestNodeId(0) });

      expect(signal.type).toBe('discovery');
      expect(connectionManager.getConnectionCount()).toBe(3);
    });
  });

  describe('Hyphal Network + Routing', () => {
    it('should establish hyphal paths between nodes', async () => {
      const hyphalNetwork = createMockHyphalNetwork(createTestNodeId(0));

      // Establish paths to multiple destinations
      const destinations = [createTestNodeId(1), createTestNodeId(2), createTestNodeId(3)];

      for (const dest of destinations) {
        const path = await hyphalNetwork.establishPath(dest, [createTestNodeId(10)]);
        expect(path.state).toBe('active');
        expect(path.destination).toBe(dest);
      }

      expect(hyphalNetwork.pathCount).toBe(3);
    });

    it('should handle path degradation and healing', async () => {
      const hyphalNetwork = createMockHyphalNetwork(createTestNodeId(0));

      const path = await hyphalNetwork.establishPath(createTestNodeId(1));
      expect(path.state).toBe('active');

      // Degrade path
      hyphalNetwork.degradePath(path.id);
      const degradedPath = hyphalNetwork.getBestPath(createTestNodeId(1));
      expect(degradedPath?.state).toBe('stressed');

      // Heal path
      const healed = hyphalNetwork.healPath(path.id);
      expect(healed).toBe(true);

      const healedPath = hyphalNetwork.getBestPath(createTestNodeId(1));
      expect(healedPath?.state).toBe('active');
    });
  });
});
