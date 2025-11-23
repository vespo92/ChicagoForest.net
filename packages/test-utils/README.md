# @chicago-forest/test-utils

Testing utilities, mocks, and fixtures for Chicago Forest Network packages.

## Installation

```bash
pnpm add -D @chicago-forest/test-utils
```

## Usage

### Helpers

```typescript
import {
  createTestNodeId,
  createTestPeerInfo,
  createTestNodeIdentity,
  delay,
  waitFor,
  measureTime,
} from '@chicago-forest/test-utils';

// Create deterministic test IDs
const nodeId = createTestNodeId(1); // CFN-00000000000000000000000000000001

// Create test peer info
const peer = createTestPeerInfo({ nodeId });

// Wait for conditions
await waitFor(() => connection.state === 'connected', { timeout: 5000 });

// Measure execution time
const { result, duration } = await measureTime(() => router.discoverRoutes(target));
```

### Mocks

```typescript
import {
  MockTransport,
  MockPeerDiscovery,
  MockConnectionManager,
  MockSignalPropagator,
  MockHyphalNetwork,
} from '@chicago-forest/test-utils/mocks';

// Mock transport layer
const transport = new MockTransport();
await transport.connect({ protocol: 'tcp', host: '127.0.0.1', port: 8000 });

// Mock peer discovery with pre-populated peers
const discovery = new MockPeerDiscovery();
discovery.populateWithTestPeers(10);
const peers = await discovery.findPeers(5);

// Track sent messages
const connections = new MockConnectionManager();
await connections.sendMessage(peerId, message);
const sent = connections.getSentMessages();
```

### Fixtures

```typescript
import {
  TEST_NODE_IDS,
  TEST_PEERS,
  TEST_IDENTITIES,
  TEST_ROUTES,
  TEST_SIGNALS,
} from '@chicago-forest/test-utils/fixtures';

// Use consistent test identifiers
const alice = TEST_NODE_IDS.alice;
const bob = TEST_NODE_IDS.bob;

// Pre-built peer information
const alicePeer = TEST_PEERS.alice;

// Test routes with realistic metrics
const route = TEST_ROUTES.directToBob;
```

## API Reference

### Helpers

| Function | Description |
|----------|-------------|
| `createTestNodeId(seed)` | Generate deterministic node ID |
| `createRandomNodeId()` | Generate random node ID |
| `createTestPeerInfo(options)` | Create test PeerInfo object |
| `createTestNodeIdentity(seed)` | Create test NodeIdentity |
| `delay(ms)` | Wait for specified duration |
| `waitFor(condition, options)` | Wait for condition to be true |
| `createDeferredPromise()` | Create externally resolvable promise |
| `measureTime(fn)` | Measure async function execution time |
| `collectEvents(emitter, events)` | Collect emitted events |
| `createSpy(impl)` | Create spy function |
| `expectThrows(fn, errorMatch)` | Assert function throws |

### Mocks

| Class | Description |
|-------|-------------|
| `MockTransport` | Mock network transport layer |
| `MockEventEmitter` | EventEmitter that tracks emissions |
| `MockPeerDiscovery` | Mock DHT peer discovery |
| `MockConnectionManager` | Mock connection management |
| `MockSignalPropagator` | Mock gossip protocol |
| `MockHyphalNetwork` | Mock hyphal path management |

### Fixtures

| Export | Description |
|--------|-------------|
| `TEST_NODE_IDS` | Pre-defined node identifiers |
| `TEST_ADDRESSES` | Network address fixtures |
| `TEST_IDENTITIES` | Node identity fixtures |
| `TEST_PEERS` | Peer information fixtures |
| `TEST_CONNECTIONS` | Connection state fixtures |
| `TEST_MESSAGES` | Protocol message fixtures |
| `TEST_TOPOLOGIES` | Network topology fixtures |
| `TEST_ROUTES` | Routing table fixtures |
| `TEST_SIGNALS` | Signal propagation fixtures |

## Writing Tests

Example test using this package:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTestNodeId,
  MockHyphalNetwork,
  TEST_NODE_IDS,
} from '@chicago-forest/test-utils';

describe('MyComponent', () => {
  let hyphal: MockHyphalNetwork;

  beforeEach(() => {
    hyphal = new MockHyphalNetwork(TEST_NODE_IDS.alice);
  });

  it('should establish paths', async () => {
    const path = await hyphal.establishPath(TEST_NODE_IDS.bob);

    expect(path.state).toBe('active');
    expect(path.destination).toBe(TEST_NODE_IDS.bob);
    expect(hyphal.pathCount).toBe(1);
  });

  it('should emit events', async () => {
    const events = hyphal.getEmittedEvents();
    await hyphal.establishPath(TEST_NODE_IDS.charlie);

    expect(events).toHaveLength(1);
    expect(events[0].event).toBe('path:established');
  });
});
```

## Cross-Repository Mocks

### NPCPU Mock

Mock implementation for NPCPU (Neural Processing Cognitive Processing Unit) integration:

```typescript
import {
  createMockNPCPU,
  createTestCognitiveQuery,
  createTestAITask,
} from '@chicago-forest/test-utils';

const npcpu = createMockNPCPU({ processingDelay: 50 });
await npcpu.connect();

// Route cognitive queries
const query = createTestCognitiveQuery({ type: 'analyze' });
const response = await npcpu.routeCognitiveQuery(query);
expect(response.success).toBe(true);

// Distribute AI tasks
const task = createTestAITask({ type: 'inference' });
const result = await npcpu.distributeProcessing(task);

// Simulate failures
npcpu.setFailureRate(0.5); // 50% failure rate
```

### ConstitutionalShrinkage Mock

Mock implementation for governance bridge integration:

```typescript
import {
  createMockConShrink,
  createTestProposal,
  createTestEncryptedVote,
} from '@chicago-forest/test-utils';

const conShrink = createMockConShrink();
await conShrink.connect();

// Submit governance proposals
const proposal = createTestProposal({ title: 'Network Upgrade' });
const billId = await conShrink.submitProposal(proposal);

// Route encrypted votes
const vote = createTestEncryptedVote(billId);
const receipt = await conShrink.routeVote(vote);

// Coordinate regional pods
const nodes = await conShrink.coordinateRegionalNodes('chicago-north');
```

### Network Simulator

Comprehensive network simulation for integration testing:

```typescript
import { createTestNetwork, NetworkSimulator } from '@chicago-forest/test-utils';

// Create mesh network with 10 nodes
const network = createTestNetwork({ type: 'mesh', nodeCount: 10 });

// Simulate message delivery
await network.sendMessage(fromNode, toNode, message);

// Simulate network partition
network.partition([node1, node2, node3]);

// Simulate node failures
network.setNodeStatus(nodeId, false);

// Get network statistics
const stats = network.getStats();
```

## Integration Testing

Run integration tests spanning all packages:

```bash
# Run all integration tests
pnpm --filter @chicago-forest/test-utils test

# Run with coverage
pnpm test -- --coverage
```

## CI/CD Pipeline

The Weaver integration testing pipeline validates:

1. **File Ownership** - Ensures PRs only modify agent-owned files
2. **Build & Typecheck** - Compiles all packages
3. **Unit Tests** - Runs tests for individual packages
4. **Integration Tests** - Tests cross-package interactions
5. **Mock Validation** - Validates NPCPU/ConShrink mock interfaces
6. **Coverage Report** - Generates coverage summaries
7. **Quality Gate** - Enforces coverage thresholds

---

**DISCLAIMER**: This is part of an AI-generated theoretical framework for the Chicago Forest Network project.

## License

MIT
