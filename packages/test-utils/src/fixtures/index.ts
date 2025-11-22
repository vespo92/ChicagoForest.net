/**
 * Test Fixtures
 *
 * Pre-built test data for Chicago Forest Network testing.
 */

import type {
  NodeId,
  NodeIdentity,
  PeerInfo,
  PeerAddress,
  PeerConnection,
  Message,
} from '@chicago-forest/shared-types';

// ============================================================================
// Node ID Fixtures
// ============================================================================

export const TEST_NODE_IDS = {
  alice: 'CFN-00000000000000000000000000000001' as NodeId,
  bob: 'CFN-00000000000000000000000000000002' as NodeId,
  charlie: 'CFN-00000000000000000000000000000003' as NodeId,
  diana: 'CFN-00000000000000000000000000000004' as NodeId,
  eve: 'CFN-00000000000000000000000000000005' as NodeId,
  frank: 'CFN-00000000000000000000000000000006' as NodeId,
  grace: 'CFN-00000000000000000000000000000007' as NodeId,
  henry: 'CFN-00000000000000000000000000000008' as NodeId,
};

// ============================================================================
// Address Fixtures
// ============================================================================

export const TEST_ADDRESSES: Record<string, PeerAddress> = {
  local: {
    protocol: 'tcp',
    host: '127.0.0.1',
    port: 8000,
  },
  remote1: {
    protocol: 'tcp',
    host: '192.168.1.100',
    port: 8001,
  },
  remote2: {
    protocol: 'tcp',
    host: '192.168.1.101',
    port: 8002,
  },
  websocket: {
    protocol: 'ws',
    host: 'localhost',
    port: 9000,
    path: '/forest',
  },
  secure: {
    protocol: 'wss',
    host: 'example.com',
    port: 443,
    path: '/forest',
  },
};

// ============================================================================
// Identity Fixtures
// ============================================================================

export const TEST_IDENTITIES: Record<string, NodeIdentity> = {
  alice: {
    nodeId: TEST_NODE_IDS.alice,
    keyPair: {
      publicKey: '0'.repeat(64) + '01',
      privateKey: '1'.repeat(64) + '01',
    },
    createdAt: 1700000000000,
    version: 1,
  },
  bob: {
    nodeId: TEST_NODE_IDS.bob,
    keyPair: {
      publicKey: '0'.repeat(64) + '02',
      privateKey: '2'.repeat(64) + '02',
    },
    createdAt: 1700000000000,
    version: 1,
  },
  charlie: {
    nodeId: TEST_NODE_IDS.charlie,
    keyPair: {
      publicKey: '0'.repeat(64) + '03',
      privateKey: '3'.repeat(64) + '03',
    },
    createdAt: 1700000000000,
    version: 1,
  },
};

// ============================================================================
// Peer Info Fixtures
// ============================================================================

export const TEST_PEERS: Record<string, PeerInfo> = {
  alice: {
    nodeId: TEST_NODE_IDS.alice,
    publicKey: TEST_IDENTITIES.alice.keyPair.publicKey,
    addresses: [TEST_ADDRESSES.local],
    lastSeen: Date.now(),
    reputation: 100,
    capabilities: ['relay', 'storage'],
    metadata: { name: 'Alice' },
  },
  bob: {
    nodeId: TEST_NODE_IDS.bob,
    publicKey: TEST_IDENTITIES.bob.keyPair.publicKey,
    addresses: [TEST_ADDRESSES.remote1],
    lastSeen: Date.now(),
    reputation: 90,
    capabilities: ['relay'],
    metadata: { name: 'Bob' },
  },
  charlie: {
    nodeId: TEST_NODE_IDS.charlie,
    publicKey: TEST_IDENTITIES.charlie.keyPair.publicKey,
    addresses: [TEST_ADDRESSES.remote2],
    lastSeen: Date.now(),
    reputation: 80,
    capabilities: ['storage', 'exit'],
    metadata: { name: 'Charlie' },
  },
};

// ============================================================================
// Connection Fixtures
// ============================================================================

export function createTestConnection(peer: PeerInfo): PeerConnection {
  return {
    peerId: peer.nodeId,
    state: 'connected',
    address: peer.addresses[0],
    bytesIn: 0,
    bytesOut: 0,
    establishedAt: Date.now(),
    lastActivity: Date.now(),
    latency: 50,
  };
}

export const TEST_CONNECTIONS: Record<string, PeerConnection> = {
  toAlice: createTestConnection(TEST_PEERS.alice),
  toBob: createTestConnection(TEST_PEERS.bob),
  toCharlie: createTestConnection(TEST_PEERS.charlie),
};

// ============================================================================
// Message Fixtures
// ============================================================================

export function createTestMessage(
  type: string,
  from: NodeId,
  payload: unknown
): Message {
  return {
    type: type as any,
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    from,
    timestamp: Date.now(),
    payload,
  };
}

export const TEST_MESSAGES = {
  ping: createTestMessage('PING', TEST_NODE_IDS.alice, { sentAt: Date.now() }),
  pong: createTestMessage('PONG', TEST_NODE_IDS.bob, { receivedAt: Date.now() }),
  hello: createTestMessage('HELLO', TEST_NODE_IDS.alice, {
    version: '1.0',
    capabilities: ['relay'],
  }),
  findNode: createTestMessage('FIND_NODE', TEST_NODE_IDS.alice, {
    targetId: TEST_NODE_IDS.charlie,
  }),
};

// ============================================================================
// Network Topology Fixtures
// ============================================================================

export interface NetworkTopologyFixture {
  nodes: PeerInfo[];
  connections: Array<[NodeId, NodeId]>;
}

export const TEST_TOPOLOGIES: Record<string, NetworkTopologyFixture> = {
  // Linear: A -> B -> C
  linear: {
    nodes: [TEST_PEERS.alice, TEST_PEERS.bob, TEST_PEERS.charlie],
    connections: [
      [TEST_NODE_IDS.alice, TEST_NODE_IDS.bob],
      [TEST_NODE_IDS.bob, TEST_NODE_IDS.charlie],
    ],
  },
  // Triangle: A <-> B <-> C <-> A
  triangle: {
    nodes: [TEST_PEERS.alice, TEST_PEERS.bob, TEST_PEERS.charlie],
    connections: [
      [TEST_NODE_IDS.alice, TEST_NODE_IDS.bob],
      [TEST_NODE_IDS.bob, TEST_NODE_IDS.charlie],
      [TEST_NODE_IDS.charlie, TEST_NODE_IDS.alice],
    ],
  },
  // Star: A is hub, B, C, D connect to A
  star: {
    nodes: Object.values(TEST_PEERS),
    connections: [
      [TEST_NODE_IDS.alice, TEST_NODE_IDS.bob],
      [TEST_NODE_IDS.alice, TEST_NODE_IDS.charlie],
    ],
  },
};

// ============================================================================
// Routing Fixtures
// ============================================================================

export interface RouteFixture {
  id: string;
  destination: NodeId;
  nextHop: NodeId | null;
  protocol: 'dht' | 'mesh' | 'sdwan' | 'onion' | 'direct';
  state: 'active' | 'degraded' | 'failed';
  metrics: {
    latencyMs: number;
    bandwidthMbps: number;
    packetLoss: number;
    hopCount: number;
  };
  cost: number;
}

export const TEST_ROUTES: Record<string, RouteFixture> = {
  directToBob: {
    id: 'route-direct-bob',
    destination: TEST_NODE_IDS.bob,
    nextHop: TEST_NODE_IDS.bob,
    protocol: 'direct',
    state: 'active',
    metrics: {
      latencyMs: 10,
      bandwidthMbps: 1000,
      packetLoss: 0,
      hopCount: 1,
    },
    cost: 1,
  },
  dhtToCharlie: {
    id: 'route-dht-charlie',
    destination: TEST_NODE_IDS.charlie,
    nextHop: TEST_NODE_IDS.bob,
    protocol: 'dht',
    state: 'active',
    metrics: {
      latencyMs: 50,
      bandwidthMbps: 100,
      packetLoss: 1,
      hopCount: 3,
    },
    cost: 20,
  },
  meshToAlice: {
    id: 'route-mesh-alice',
    destination: TEST_NODE_IDS.alice,
    nextHop: TEST_NODE_IDS.bob,
    protocol: 'mesh',
    state: 'active',
    metrics: {
      latencyMs: 30,
      bandwidthMbps: 50,
      packetLoss: 2,
      hopCount: 2,
    },
    cost: 10,
  },
  degradedRoute: {
    id: 'route-degraded',
    destination: TEST_NODE_IDS.diana,
    nextHop: TEST_NODE_IDS.charlie,
    protocol: 'sdwan',
    state: 'degraded',
    metrics: {
      latencyMs: 200,
      bandwidthMbps: 10,
      packetLoss: 15,
      hopCount: 5,
    },
    cost: 50,
  },
};

// ============================================================================
// Growth Directive Fixtures
// ============================================================================

export interface GrowthDirectiveFixture {
  pattern: 'organic' | 'directed' | 'defensive' | 'exploratory' | 'consolidation';
  targets: string[];
  priority: number;
  maxConnections: number;
  deadline: number;
}

export const TEST_GROWTH_DIRECTIVES: Record<string, GrowthDirectiveFixture> = {
  organic: {
    pattern: 'organic',
    targets: [],
    priority: 0.5,
    maxConnections: 5,
    deadline: Date.now() + 60000,
  },
  directed: {
    pattern: 'directed',
    targets: [TEST_NODE_IDS.charlie, TEST_NODE_IDS.diana],
    priority: 0.8,
    maxConnections: 3,
    deadline: Date.now() + 30000,
  },
  defensive: {
    pattern: 'defensive',
    targets: [],
    priority: 1.0,
    maxConnections: 10,
    deadline: Date.now() + 120000,
  },
};

// ============================================================================
// Signal Fixtures
// ============================================================================

export interface SignalFixture {
  type: string;
  origin: NodeId;
  payload: unknown;
  ttl: number;
  id: string;
  timestamp: number;
  signature: string;
}

export const TEST_SIGNALS: Record<string, SignalFixture> = {
  discovery: {
    type: 'discovery',
    origin: TEST_NODE_IDS.alice,
    payload: {
      nodeId: TEST_NODE_IDS.alice,
      capabilities: ['relay', 'storage'],
    },
    ttl: 7,
    id: 'signal-discovery-001',
    timestamp: Date.now(),
    signature: '',
  },
  heartbeat: {
    type: 'heartbeat',
    origin: TEST_NODE_IDS.bob,
    payload: { status: 'healthy', uptime: 3600 },
    ttl: 3,
    id: 'signal-heartbeat-001',
    timestamp: Date.now(),
    signature: '',
  },
  alert: {
    type: 'alert',
    origin: TEST_NODE_IDS.charlie,
    payload: { severity: 'warning', message: 'High latency detected' },
    ttl: 5,
    id: 'signal-alert-001',
    timestamp: Date.now(),
    signature: '',
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get a list of all test peers
 */
export function getAllTestPeers(): PeerInfo[] {
  return Object.values(TEST_PEERS);
}

/**
 * Get a list of all test node IDs
 */
export function getAllTestNodeIds(): NodeId[] {
  return Object.values(TEST_NODE_IDS);
}

/**
 * Create a deep copy of a fixture
 */
export function cloneFixture<T>(fixture: T): T {
  return JSON.parse(JSON.stringify(fixture));
}
