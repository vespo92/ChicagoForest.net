# Chicago Forest Network - Canopy API Documentation

**DISCLAIMER**: This is an AI-generated theoretical framework for educational and research purposes. The API represents a conceptual design for a decentralized energy network inspired by Tesla's wireless transmission research and modern mesh networking.

## Overview

The Canopy API is the public interface to the Chicago Forest Network. Like a forest canopy that connects the ecosystem above ground, this API provides the visible interface through which applications interact with the underlying mycelium (P2P) network.

## Quick Start

### Installation

```bash
npm install @chicago-forest/canopy-api
```

### Basic Usage

```typescript
import { createClient } from '@chicago-forest/canopy-api/sdk';

// Create a client
const client = createClient({
  baseUrl: 'https://api.chicago-forest.network/v1',
  apiKey: 'cfn_your_api_key', // Optional for read operations
});

// Check health
const health = await client.health();
console.log(health.data); // { status: 'healthy', version: '0.1.0' }

// List nodes
const nodes = await client.listNodes({
  capabilities: ['relay'],
  minReputation: 0.8,
});

// Get network stats
const stats = await client.getNetworkStats();
```

### WebSocket Real-Time Updates

```typescript
import { createWebSocketServer } from '@chicago-forest/canopy-api/websocket';

const ws = new WebSocket('wss://api.chicago-forest.network/ws');

ws.onopen = () => {
  // Subscribe to node events
  ws.send(JSON.stringify({
    type: 'subscribe',
    id: 'sub-1',
    payload: { topic: 'nodes' },
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'event') {
    console.log('Node event:', message.payload);
  }
};
```

### GraphQL

```graphql
query GetNetworkOverview {
  node {
    id
    name
    status
    capabilities
  }
  networkStats {
    nodeCount
    onlineNodes
    routeCount
  }
  research(query: { category: TESLA_WIRELESS, limit: 5 }) {
    documents {
      title
      authors
      sourceUrl
      isTheoretical
    }
  }
}
```

## API Reference

### REST API

Base URL: `https://api.chicago-forest.network/api/v1`

#### Authentication

Most read operations are public. Write operations require authentication:

| Method | Header | Format |
|--------|--------|--------|
| API Key | `X-API-Key` | `cfn_your_key` |
| Bearer Token | `Authorization` | `Bearer <token>` |
| Node Signature | `Authorization` | `NodeSig <nodeId>:<timestamp>:<signature>` |

#### Rate Limits

| Tier | Requests/Minute | Burst |
|------|-----------------|-------|
| Anonymous | 60 | 10 |
| Authenticated | 300 | 30 |
| Node | 600 | 60 |
| Premium | 3000 | 100 |

### Endpoints

#### Health & Info

- `GET /health` - Health check
- `GET /version` - API version

#### Nodes

- `GET /nodes` - List nodes
- `GET /nodes/:nodeId` - Get node details
- `POST /nodes/register` - Register node [THEORETICAL]
- `PUT /nodes/:nodeId/status` - Update status
- `GET /nodes/:nodeId/metrics` - Get metrics
- `GET /nodes/:nodeId/peers` - Get connected peers

#### Routing

- `GET /routing/table` - Get routing table
- `POST /routing/discover` - Discover paths [THEORETICAL]
- `GET /routing/neighbors` - Get mesh neighbors
- `GET /routing/tunnels` - Get SD-WAN tunnels
- `GET /routing/traffic` - Get traffic stats
- `GET /routing/rules` - Get traffic rules
- `POST /routing/rules` - Create traffic rule
- `DELETE /routing/rules/:ruleId` - Delete rule
- `POST /routing/optimize` - Optimize routes [THEORETICAL]

#### Research

- `GET /research/documents` - Search documents
- `GET /research/documents/:id` - Get document
- `GET /research/pioneers` - Get historical pioneers
- `GET /research/organizations` - Get active organizations
- `GET /research/categories` - Get categories
- `GET /research/bibliography` - Get full bibliography

## SDK Reference

### CanopyClient

Main client for API operations.

```typescript
import { CanopyClient, createClient } from '@chicago-forest/canopy-api/sdk';

const client = new CanopyClient({
  baseUrl: 'http://localhost:3000/api/v1',
  apiKey: 'optional-api-key',
  timeout: 30000,
  debug: true,
});
```

#### Methods

| Method | Description |
|--------|-------------|
| `health()` | Check API health |
| `listNodes(filter?)` | List network nodes |
| `getNode(nodeId)` | Get specific node |
| `registerNode(data)` | Register new node |
| `getRoutingTable()` | Get routing table |
| `discoverPath(dest, prefs?)` | Discover paths |
| `getNetworkStats()` | Get network statistics |

### NodeManager

High-level node lifecycle management.

```typescript
import { NodeManager, createNodeManager } from '@chicago-forest/canopy-api/sdk';

const manager = createNodeManager({
  heartbeatInterval: 60000,
  minPeers: 5,
  maxPeers: 50,
});

// Register and start
await manager.register({
  publicKey: 'pk_...',
  capabilities: ['relay', 'storage'],
});

await manager.start();

// Monitor events
manager.on('peer:connected', (peer) => {
  console.log('New peer:', peer.nodeId);
});

manager.on('health:changed', (health, previous) => {
  console.log(`Health: ${previous} -> ${health}`);
});
```

### ResearchAPI

Access historical research documentation.

```typescript
import { ResearchAPI, createResearchAPI } from '@chicago-forest/canopy-api/sdk';

const research = createResearchAPI();

// Search Tesla patents
const teslaPatents = await research.search({
  author: 'Nikola Tesla',
  type: 'patent',
  historicalOnly: true,
});

// Get LENR papers
const lenrPapers = await research.searchByCategory('lenr-cold-fusion');

// Get pioneers
const pioneers = await research.getPioneers();
```

## WebSocket API

Connect to `wss://api.chicago-forest.network/ws`

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `subscribe` | -> Server | Subscribe to topic |
| `unsubscribe` | -> Server | Unsubscribe |
| `request` | -> Server | Make request |
| `response` | <- Server | Request response |
| `event` | <- Server | Topic event |
| `ping`/`pong` | Both | Keep-alive |

### Topics

- `nodes` - Node online/offline, status changes
- `mesh` - Topology changes, link quality
- `routing` - Route updates
- `system` - System events

### Example Subscription

```json
{
  "type": "subscribe",
  "id": "sub-123",
  "payload": {
    "topic": "nodes",
    "filter": {
      "capabilities": ["relay"],
      "eventTypes": ["node:online", "node:offline"]
    }
  }
}
```

## GraphQL API

Endpoint: `https://api.chicago-forest.network/graphql`

### Schema Overview

```graphql
type Query {
  node: Node
  nodes(filter: NodeFilter): NodeConnection!
  networkStats: NetworkStats!
  meshTopology: MeshTopology!
  research(query: ResearchQuery!): ResearchConnection!
  pioneers: [Pioneer!]!
}

type Mutation {
  registerNode(input: RegisterNodeInput!): RegisterNodePayload!
  updateNodeStatus(input: NodeStatusInput!): NodeStatusPayload!
  optimizeRoutes(aggressive: Boolean): OptimizeRoutesPayload!
}

type Subscription {
  nodeEvents(filter: NodeEventFilter): NodeEvent!
  meshUpdates(filter: MeshUpdateFilter): MeshUpdate!
}
```

## Research Sources

All research endpoints provide REAL, verifiable sources:

### Tesla Research
- Patents: https://patents.google.com
- Archives: https://teslauniverse.com
- FBI Files: https://vault.fbi.gov/nikola-tesla

### LENR/Cold Fusion
- Research Library: https://lenr-canr.org
- 3500+ documented papers

### Active Organizations
- Brillouin Energy: https://brillouinenergy.com
- Clean Planet: https://cleanplanet.co.jp
- NASA Glenn: https://nasa.gov/glenn

## Important Notes

1. **Theoretical Framework**: This API represents a conceptual design. The [THEORETICAL] markers indicate endpoints that would require actual network infrastructure to function.

2. **Real Sources**: All research documentation links are REAL and have been verified. The `isTheoretical` field clearly marks AI-generated theoretical content.

3. **Not Financial Advice**: This project makes no investment promises or claims about operational free energy devices.

4. **Educational Purpose**: The primary goal is documenting historical research and inspiring community discussion about decentralized energy networks.

## OpenAPI Specification

Full OpenAPI 3.1 spec available at:
- File: `packages/canopy-api/src/docs/openapi.yaml`
- Runtime: `GET /api/v1/docs/openapi.yaml`

## Contributing

See the main repository CLAUDE.md for contribution guidelines and ethical principles.

---

**Together, we preserve the past and envision the future - honestly, transparently, and hopefully.**
