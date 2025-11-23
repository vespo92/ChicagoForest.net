# @chicago-forest/decentralized-sync

> CRDT-based decentralized database sync using GUN.js and OrbitDB

**DISCLAIMER: This is an AI-generated theoretical framework for educational purposes. NOT operational infrastructure.**

## Overview

This package provides CRDT (Conflict-free Replicated Data Types) implementations and adapters for decentralized databases, enabling peer-to-peer synchronization for the Chicago Forest Network.

### Supported Backends

- **GUN.js** - Decentralized graph database with real-time sync
- **OrbitDB** - Peer-to-peer database on IPFS
- **Hybrid** - Combines both for real-time + persistent storage

## Installation

```bash
pnpm add @chicago-forest/decentralized-sync
```

## Quick Start

```typescript
import { createDecentralizedSync } from '@chicago-forest/decentralized-sync';

// Create a sync instance
const sync = await createDecentralizedSync('my-node-id', 'gun', [
  'https://relay1.example.com/gun',
  'https://relay2.example.com/gun',
]);

// Store data
await sync.put('forests/chicago', {
  name: 'Chicago Plasma Forest',
  nodes: 42,
  active: true,
});

// Get data
const forest = await sync.get('forests/chicago');
console.log(forest); // { name: 'Chicago Plasma Forest', nodes: 42, active: true }

// Subscribe to changes
const unsubscribe = sync.subscribe('forests/chicago', (value, meta) => {
  console.log('Forest updated:', value);
  console.log('By node:', meta.origin, 'at:', new Date(meta.timestamp));
});

// Query data
const activeForests = await sync.query('forests', (f) => f.active);

// Cleanup
unsubscribe();
await sync.close();
```

## CRDT Implementations

All CRDT implementations are based on academic research:
- Shapiro et al. (2011) - "Conflict-free Replicated Data Types"
- Preguiça et al. (2018) - "Conflict-free Replicated Data Types: An Overview"

### Vector Clocks

Track causality across distributed nodes.

```typescript
import {
  createVectorClock,
  incrementClock,
  mergeClock,
  compareClock,
} from '@chicago-forest/decentralized-sync/crdt';

let clock = createVectorClock();
clock = incrementClock(clock, 'node-1'); // { 'node-1': 1 }
clock = incrementClock(clock, 'node-1'); // { 'node-1': 2 }

const otherClock = { 'node-1': 1, 'node-2': 3 };
const merged = mergeClock(clock, otherClock); // { 'node-1': 2, 'node-2': 3 }

const relation = compareClock(clock, otherClock);
// 'before' | 'after' | 'concurrent' | 'equal'
```

### G-Counter (Grow-only Counter)

```typescript
import {
  createGCounter,
  incrementGCounter,
  getGCounterValue,
  mergeGCounter,
} from '@chicago-forest/decentralized-sync/crdt';

let counter = createGCounter();
counter = incrementGCounter(counter, 'node-1', 5);
counter = incrementGCounter(counter, 'node-2', 3);

console.log(getGCounterValue(counter)); // 8

// Merge with remote counter
const merged = mergeGCounter(counter, remoteCounter);
```

### PN-Counter (Positive-Negative Counter)

```typescript
import {
  createPNCounter,
  incrementPNCounter,
  decrementPNCounter,
  getPNCounterValue,
} from '@chicago-forest/decentralized-sync/crdt';

let counter = createPNCounter();
counter = incrementPNCounter(counter, 'node-1', 10);
counter = decrementPNCounter(counter, 'node-1', 3);

console.log(getPNCounterValue(counter)); // 7
```

### LWW-Register (Last-Write-Wins Register)

```typescript
import {
  createLWWRegister,
  updateLWWRegister,
  mergeLWWRegister,
} from '@chicago-forest/decentralized-sync/crdt';

let register = createLWWRegister('initial', 'node-1');
register = updateLWWRegister(register, 'updated', 'node-2');

// Merge with remote - higher timestamp wins
const merged = mergeLWWRegister(register, remoteRegister);
```

### OR-Set (Observed-Remove Set)

```typescript
import {
  createORSet,
  addToORSet,
  removeFromORSet,
  orSetHas,
  mergeORSet,
} from '@chicago-forest/decentralized-sync/crdt';

let set = createORSet<string>();
set = addToORSet(set, 'item-1', 'node-1');
set = addToORSet(set, 'item-2', 'node-1');
set = removeFromORSet(set, 'item-1');

console.log(orSetHas(set, 'item-1')); // false
console.log(orSetHas(set, 'item-2')); // true
```

## GUN.js Adapter

Real-time decentralized sync with offline support.

```typescript
import { createGUNAdapter } from '@chicago-forest/decentralized-sync/gun';

const adapter = createGUNAdapter({
  nodeId: 'my-node',
  gun: {
    peers: ['https://relay.example.com/gun'],
    localStorage: true,
    indexedDB: true,
    webRTC: true,
  },
});

await adapter.initialize();

// Use the adapter
await adapter.put('data/key', { value: 42 });
const data = await adapter.get('data/key');
```

## OrbitDB Adapter

IPFS-backed persistent storage with content addressing.

```typescript
import { createOrbitDBAdapter } from '@chicago-forest/decentralized-sync/orbitdb';

const adapter = createOrbitDBAdapter({
  nodeId: 'my-node',
  orbitdb: {
    directory: './orbitdb',
    accessController: 'orbitdb',
    replication: 3,
  },
});

await adapter.initialize();

// Use the adapter
await adapter.put('data/key', { value: 42 });
const data = await adapter.get('data/key');
```

## Forest Registry Integration

```typescript
import { createRegistrySync } from '@chicago-forest/forest-registry/sync';
import { createForestRegistryGUN } from '@chicago-forest/decentralized-sync/gun';

const adapter = createForestRegistryGUN('node-123', ['wss://relay.example.com/gun']);
await adapter.initialize();

const registry = createRegistrySync({
  nodeId: 'node-123',
  adapter,
});

await registry.start();

// Register a forest
await registry.putForest({
  id: 'chicago-forest',
  name: 'Chicago Plasma Forest',
  description: 'Community mesh network in Chicago',
  createdAt: Date.now(),
});

// Query forests
const forests = await registry.queryForests();

// Subscribe to changes
registry.on('forest:updated', (forest) => {
  console.log('Forest updated:', forest.name);
});
```

## Hive Mind Integration

```typescript
import { createGovernanceSync } from '@chicago-forest/hive-mind/sync';
import { createHiveMindGUN } from '@chicago-forest/decentralized-sync/gun';

const adapter = createHiveMindGUN('node-123', ['wss://relay.example.com/gun']);
await adapter.initialize();

const governance = createGovernanceSync({
  forestId: 'chicago-forest',
  nodeId: 'node-123',
  adapter,
});

await governance.start();

// Create a proposal
const proposal = await governance.createProposal({
  title: 'Add new node to network',
  description: 'Proposal to add node-456 to the Chicago Forest',
  type: 'membership',
  proposer: 'node-123',
});

// Cast a vote (CRDT-mergeable)
await governance.castVote({
  proposalId: proposal.id,
  voterId: 'node-123',
  choice: 'yes',
  weight: 1,
});

// Get vote tally
const tally = await governance.getVoteTally(proposal.id);
console.log('Yes votes:', tally.get('yes'));

// Subscribe to events
governance.on('vote:cast', (vote) => {
  console.log(`${vote.voterId} voted ${vote.choice}`);
});

governance.on('proposal:passed', (proposalId) => {
  console.log('Proposal passed:', proposalId);
});
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐              ┌─────────────────┐       │
│  │  forest-registry│              │    hive-mind    │       │
│  │    /sync        │              │     /sync       │       │
│  └────────┬────────┘              └────────┬────────┘       │
│           │                                │                 │
│           └────────────┬───────────────────┘                │
│                        │                                     │
│           ┌────────────▼───────────────┐                    │
│           │    decentralized-sync      │                    │
│           │                            │                    │
│           │  ┌──────────────────────┐  │                    │
│           │  │     CRDT Layer       │  │                    │
│           │  │  G-Counter, LWW-Reg  │  │                    │
│           │  │  OR-Set, RGA, etc.   │  │                    │
│           │  └──────────────────────┘  │                    │
│           │                            │                    │
│           │  ┌──────────────────────┐  │                    │
│           │  │   Adapter Layer      │  │                    │
│           │  │  ┌────┐   ┌───────┐  │  │                    │
│           │  │  │GUN │   │OrbitDB│  │  │                    │
│           │  │  └────┘   └───────┘  │  │                    │
│           │  └──────────────────────┘  │                    │
│           └────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Network Layer                          │
│                                                             │
│     ┌───────────────┐       ┌────────────────────┐         │
│     │  GUN Relays   │       │  IPFS/libp2p Peers │         │
│     │  (WebSocket)  │       │  (OrbitDB)         │         │
│     └───────────────┘       └────────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## References

### Academic Research
- Shapiro et al. (2011) - "Conflict-free Replicated Data Types"
- Kleppmann et al. (2017) - "A Conflict-Free Replicated JSON Datatype"
- Van der Linde et al. (2016) - "Delta State Replicated Data Types"

### Technologies
- [GUN.js](https://gun.eco/) - Decentralized graph database
- [OrbitDB](https://orbitdb.org/) - Peer-to-peer databases on IPFS
- [Helia](https://helia.io/) - IPFS implementation in JavaScript
- [libp2p](https://libp2p.io/) - Modular peer-to-peer networking

## License

MIT
