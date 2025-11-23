/**
 * @chicago-forest/canopy-api - Comprehensive Test Suite
 *
 * Tests for the Canopy API including REST server, WebSocket, SDK clients,
 * and LibP2P protocol handlers.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createRestServer,
  CanopyRestServer,
} from '../rest/server';
import type { ApiRequest } from '../types';
import {
  createWebSocketServer,
  CanopyWebSocketServer,
} from '../websocket/server';
import { CanopyClient, createClient } from '../sdk/client';
import { GovernanceClient, createGovernanceClient } from '../sdk/governance-client';
import { StorageClient, createStorageClient } from '../sdk/storage-client';
import { createP2PServer, CanopyP2PServer } from '../libp2p/server';
import { createMessageHandler, P2PMessageHandler } from '../libp2p/handler';
import { PROTOCOLS, createMessage, validateMessage } from '../libp2p/protocols';
import type { NodeId } from '@chicago-forest/shared-types';

// =============================================================================
// REST Server Tests
// =============================================================================

describe('CanopyRestServer', () => {
  let server: CanopyRestServer;

  beforeEach(() => {
    server = createRestServer({ logging: false });
  });

  afterEach(async () => {
    await server.stop();
  });

  describe('Health endpoints', () => {
    it('should respond to health check', async () => {
      const request: ApiRequest = {
        id: 'test-1',
        method: 'GET',
        path: '/api/v1/health',
        headers: {},
        query: {},
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
      expect(response.data).toHaveProperty('disclaimer');
    });

    it('should return version information', async () => {
      const request: ApiRequest = {
        id: 'test-2',
        method: 'GET',
        path: '/api/v1/version',
        headers: {},
        query: {},
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('version', '0.1.0');
      expect(response.data).toHaveProperty('name', '@chicago-forest/canopy-api');
    });
  });

  describe('Node routes', () => {
    it('should list nodes', async () => {
      const request: ApiRequest = {
        id: 'test-3',
        method: 'GET',
        path: '/api/v1/nodes',
        headers: {},
        query: {},
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('nodes');
      expect(response.data).toHaveProperty('total');
    });

    it('should handle node registration', async () => {
      const request: ApiRequest = {
        id: 'test-4',
        method: 'POST',
        path: '/api/v1/nodes/register',
        headers: { 'Authorization': 'Bearer test-key' },
        query: {},
        body: {
          publicKey: 'pk_test123',
          name: 'Test Node',
          capabilities: ['relay', 'storage'],
        },
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('nodeId');
    });
  });

  describe('Routing routes', () => {
    it('should return routing table', async () => {
      const request: ApiRequest = {
        id: 'test-5',
        method: 'GET',
        path: '/api/v1/routing/table',
        headers: {},
        query: {},
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('routes');
      expect(response.data).toHaveProperty('protocol');
    });

    it('should discover paths', async () => {
      const request: ApiRequest = {
        id: 'test-6',
        method: 'POST',
        path: '/api/v1/routing/discover',
        headers: {},
        query: {},
        body: {
          destination: 'target-node-1',
          preferences: { lowLatency: true },
        },
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('Governance routes', () => {
    it('should list proposals', async () => {
      const request: ApiRequest = {
        id: 'test-7',
        method: 'GET',
        path: '/api/v1/governance/proposals',
        headers: {},
        query: {},
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('proposals');
      expect(response.data).toHaveProperty('total');
    });

    it('should get treasury info', async () => {
      const request: ApiRequest = {
        id: 'test-8',
        method: 'GET',
        path: '/api/v1/governance/treasury',
        headers: {},
        query: {},
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('balance');
      expect(response.data).toHaveProperty('available');
    });
  });

  describe('Storage routes', () => {
    it('should list storage objects', async () => {
      const request: ApiRequest = {
        id: 'test-9',
        method: 'GET',
        path: '/api/v1/storage/objects',
        headers: {},
        query: {},
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('objects');
      expect(response.data).toHaveProperty('total');
    });

    it('should return storage quota', async () => {
      const request: ApiRequest = {
        id: 'test-10',
        method: 'GET',
        path: '/api/v1/storage/quota',
        headers: {},
        query: {},
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('total');
      expect(response.data).toHaveProperty('used');
      expect(response.data).toHaveProperty('available');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown routes', async () => {
      const request: ApiRequest = {
        id: 'test-11',
        method: 'GET',
        path: '/api/v1/unknown/endpoint',
        headers: {},
        query: {},
        timestamp: Date.now(),
      };

      const response = await server.handleRequest(request);

      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
      expect(response.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('Server statistics', () => {
    it('should track request statistics', async () => {
      const request: ApiRequest = {
        id: 'test-12',
        method: 'GET',
        path: '/api/v1/health',
        headers: {},
        query: {},
        timestamp: Date.now(),
      };

      await server.handleRequest(request);
      await server.handleRequest(request);

      const stats = server.getStats();

      expect(stats.totalRequests).toBe(2);
      expect(stats.successfulRequests).toBe(2);
      expect(stats.routeCount).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// WebSocket Server Tests
// =============================================================================

describe('CanopyWebSocketServer', () => {
  let server: CanopyWebSocketServer;

  beforeEach(() => {
    server = createWebSocketServer({ pingInterval: 60000 });
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should handle client connection', () => {
    server.handleConnect('client-1');

    const clients = server.getClients();
    expect(clients).toHaveLength(1);
    expect(clients[0].id).toBe('client-1');
    expect(clients[0].connectedAt).toBeDefined();
  });

  it('should handle client disconnection', () => {
    server.handleConnect('client-1');
    server.handleDisconnect('client-1');

    const clients = server.getClients();
    expect(clients).toHaveLength(0);
  });

  it('should handle subscriptions', async () => {
    server.handleConnect('client-1');

    await server.handleMessage('client-1', {
      type: 'subscribe',
      id: 'msg-1',
      payload: { topic: 'nodes' },
      timestamp: Date.now(),
    });

    const client = server.getClient('client-1');
    expect(client?.subscriptions.size).toBe(1);
  });

  it('should track statistics', () => {
    server.handleConnect('client-1');
    server.handleConnect('client-2');

    const stats = server.getStats();

    expect(stats.connectedClients).toBe(2);
    expect(stats).toHaveProperty('messagesIn');
    expect(stats).toHaveProperty('messagesOut');
  });
});

// =============================================================================
// SDK Client Tests
// =============================================================================

describe('CanopyClient', () => {
  let client: CanopyClient;

  beforeEach(() => {
    client = createClient({ debug: false });
  });

  it('should check health', async () => {
    const result = await client.health();

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('status');
  });

  it('should get version', async () => {
    const result = await client.version();

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('version');
  });

  it('should list nodes', async () => {
    const result = await client.listNodes();

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('nodes');
  });

  it('should get network stats', async () => {
    const result = await client.getNetworkStats();

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('connectedPeers');
    expect(result.data).toHaveProperty('latency');
  });
});

describe('GovernanceClient', () => {
  let client: GovernanceClient;

  beforeEach(() => {
    client = createGovernanceClient();
  });

  it('should list proposals', async () => {
    const result = await client.listProposals();

    expect(result.success).toBe(true);
  });

  it('should get reputation', async () => {
    const result = await client.getReputation();

    expect(result.success).toBe(true);
  });

  it('should get treasury info', async () => {
    const result = await client.getTreasury();

    expect(result.success).toBe(true);
  });
});

describe('StorageClient', () => {
  let client: StorageClient;

  beforeEach(() => {
    client = createStorageClient();
  });

  it('should list objects', async () => {
    const result = await client.listObjects();

    expect(result.success).toBe(true);
  });

  it('should get quota', async () => {
    const result = await client.getQuota();

    expect(result.success).toBe(true);
  });

  it('should list pins', async () => {
    const result = await client.listPins();

    expect(result.success).toBe(true);
  });
});

// =============================================================================
// LibP2P Tests
// =============================================================================

describe('P2PMessageHandler', () => {
  let handler: P2PMessageHandler;

  beforeEach(() => {
    handler = createMessageHandler();
  });

  it('should have default protocols registered', () => {
    const protocols = handler.getProtocols();

    expect(protocols).toContain(PROTOCOLS.DISCOVERY);
    expect(protocols).toContain(PROTOCOLS.ROUTING);
    expect(protocols).toContain(PROTOCOLS.GOVERNANCE);
    expect(protocols).toContain(PROTOCOLS.STORAGE);
  });

  it('should validate messages', () => {
    const validMessage = {
      id: 'msg-1',
      protocol: PROTOCOLS.DISCOVERY,
      type: 'ping',
      sender: 'node-1',
      payload: {},
      timestamp: Date.now(),
      ttl: 64,
    };

    expect(validateMessage(validMessage)).toBe(true);
    expect(validateMessage(null)).toBe(false);
    expect(validateMessage({})).toBe(false);
  });

  it('should create messages', () => {
    const message = createMessage(
      PROTOCOLS.DISCOVERY,
      'ping',
      'node-1' as NodeId,
      { data: 'test' }
    );

    expect(message.protocol).toBe(PROTOCOLS.DISCOVERY);
    expect(message.type).toBe('ping');
    expect(message.sender).toBe('node-1');
    expect(message.ttl).toBe(64);
  });

  it('should handle messages', async () => {
    const message = createMessage(
      PROTOCOLS.DISCOVERY,
      'ping',
      'node-1' as NodeId,
      {}
    );

    // Should not throw
    await handler.handleMessage(message);

    const stats = handler.getStats();
    expect(stats.messagesReceived).toBe(1);
  });

  it('should track statistics', async () => {
    const message = createMessage(
      PROTOCOLS.DISCOVERY,
      'ping',
      'node-1' as NodeId,
      {}
    );

    await handler.handleMessage(message);
    await handler.handleMessage(message);

    const stats = handler.getStats();

    expect(stats.messagesReceived).toBe(2);
    expect(stats.protocolsRegistered).toBeGreaterThan(0);
  });
});

describe('CanopyP2PServer', () => {
  let server: CanopyP2PServer;

  beforeEach(() => {
    server = createP2PServer({
      nodeId: 'test-node' as NodeId,
      listenAddresses: ['/ip4/127.0.0.1/tcp/4001'],
    });
  });

  afterEach(async () => {
    await server.stop();
  });

  it('should not be running initially', () => {
    expect(server.isRunning()).toBe(false);
  });

  it('should start and stop', async () => {
    await server.start();
    expect(server.isRunning()).toBe(true);

    await server.stop();
    expect(server.isRunning()).toBe(false);
  });

  it('should return node ID', () => {
    expect(server.getNodeId()).toBe('test-node');
  });

  it('should have protocols', () => {
    const protocols = server.getProtocols();
    expect(protocols.length).toBeGreaterThan(0);
  });

  it('should track peer connections', async () => {
    await server.start();

    const peer = await server.connectToPeer('/ip4/192.168.1.1/tcp/4001');

    expect(peer).not.toBeNull();
    expect(server.getPeers().length).toBe(1);

    await server.disconnectPeer(peer!.id);
    expect(server.getPeers().length).toBe(0);
  });
});

// =============================================================================
// Integration Tests
// =============================================================================

describe('Integration', () => {
  it('should have consistent route registration', () => {
    const server = createRestServer({ logging: false });
    const routes = server.getRoutes();

    // Check that all expected route categories exist
    const routePaths = routes.map(r => r.path);

    expect(routePaths.some(p => p.includes('/health'))).toBe(true);
    expect(routePaths.some(p => p.includes('/nodes'))).toBe(true);
    expect(routePaths.some(p => p.includes('/routing'))).toBe(true);
    expect(routePaths.some(p => p.includes('/governance'))).toBe(true);
    expect(routePaths.some(p => p.includes('/storage'))).toBe(true);
    expect(routePaths.some(p => p.includes('/research'))).toBe(true);
  });

  it('should export all required modules', () => {
    // Verify that all exports are available
    expect(createRestServer).toBeDefined();
    expect(createWebSocketServer).toBeDefined();
    expect(createClient).toBeDefined();
    expect(createGovernanceClient).toBeDefined();
    expect(createStorageClient).toBeDefined();
    expect(createP2PServer).toBeDefined();
    expect(createMessageHandler).toBeDefined();
    expect(PROTOCOLS).toBeDefined();
  });
});
