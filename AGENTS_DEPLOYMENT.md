# Chicago Forest Network - 10 Agent Deployment Strategy

> **Purpose**: Parallel AI agent development across ChicagoForest.net ecosystem
> **Integration**: Works with NPCPU and ConstitutionalShrinkage repositories
> **Methodology**: Exclusive file ownership enables conflict-free parallel development

---

## Agent Overview Matrix

| Agent | Codename | Domain | Primary Repository | Integration Focus |
|-------|----------|--------|-------------------|-------------------|
| 1 | **Mycelia** | Neural Network Core | ChicagoForest | NPCPU consciousness |
| 2 | **Rhizome** | Network Propagation | ChicagoForest | Distributed growth |
| 3 | **Symbiont** | Cross-Network Federation | ChicagoForest + NPCPU | Multi-repo bridges |
| 4 | **Sentinel** | Security & Privacy | ChicagoForest | Anonymous routing |
| 5 | **Archivist** | Historical Research | ChicagoForest | Source verification |
| 6 | **Beacon** | Hardware & Deployment | ChicagoForest | Physical layer |
| 7 | **Nexus** | API & SDK Development | ChicagoForest | Developer tools |
| 8 | **Delegate** | Governance Systems | ChicagoForest + ConShrink | Democratic processes |
| 9 | **Weaver** | Integration Testing | All repositories | Quality assurance |
| 10 | **Oracle** | Documentation & UX | All repositories | User-facing content |

---

## Agent 1: Mycelia - Neural Network Core

**Mission**: Develop the mycelium-core neural fabric that enables distributed signal propagation and emergent network topology.

### Exclusive Ownership
```
packages/mycelium-core/
├── src/
│   ├── hyphal/                    # Hyphal pathway algorithms
│   │   ├── pathway-builder.ts
│   │   ├── connection-graph.ts
│   │   └── index.ts
│   ├── signals/                   # Signal propagation
│   │   ├── gossip-protocol.ts
│   │   ├── signal-types.ts
│   │   └── index.ts
│   ├── topology/                  # Emergent topology
│   │   ├── self-organization.ts
│   │   ├── topology-optimizer.ts
│   │   └── index.ts
│   └── growth/                    # Network growth patterns
│       ├── growth-engine.ts
│       ├── adaptation.ts
│       └── index.ts
└── tests/
    └── *.test.ts
```

### NPCPU Integration
- Connect hyphal pathways to NPCPU cognitive processing layer
- Enable consciousness-aware signal routing
- Implement neural pattern recognition for network optimization
- Share topology data with NPCPU distributed intelligence

### Key Deliverables
- [ ] HyphalNetwork class with multi-path routing
- [ ] SignalPropagation using gossip protocols
- [ ] TopologyManager for dynamic optimization
- [ ] GrowthEngine for organic network expansion
- [ ] Integration hooks for NPCPU consciousness layer

### Technical Specifications
```typescript
// Core interfaces to implement
interface HyphalNode {
  id: NodeId;
  connections: HyphalConnection[];
  signalStrength: number;
  cognitiveBinding?: NPCPUReference;  // NPCPU integration
}

interface SignalPacket {
  type: 'nutrient' | 'warning' | 'discovery' | 'cognitive';
  origin: NodeId;
  ttl: number;
  payload: Uint8Array;
}
```

---

## Agent 2: Rhizome - Network Propagation

**Mission**: Design and implement protocols for organic network growth, node bootstrapping, and self-healing resilience.

### Exclusive Ownership
```
packages/spore-propagation/
├── src/
│   ├── bootstrap/                 # Node initialization
│   │   ├── seed-node.ts
│   │   ├── discovery-beacon.ts
│   │   ├── trust-bootstrap.ts
│   │   └── index.ts
│   ├── distribution/              # Spore distribution
│   │   ├── torrent-spore.ts
│   │   ├── ipfs-spore.ts
│   │   ├── qr-spore.ts
│   │   └── index.ts
│   ├── germination/               # Node activation
│   │   ├── activation-sequence.ts
│   │   ├── identity-creation.ts
│   │   └── index.ts
│   └── resilience/                # Self-healing
│       ├── failover.ts
│       ├── redundancy.ts
│       └── index.ts
└── tests/
    └── *.test.ts
```

### Growth Algorithms
Inspired by real biological research:
- Physarum polycephalum (slime mold) optimization (doi.org/10.1126/science.1177894)
- Mycelium nutrient gradient following
- Ant colony optimization for path discovery

### Key Deliverables
- [ ] SeedNode bootstrap protocol
- [ ] Multiple distribution methods (torrent, IPFS, QR, USB)
- [ ] Germination sequence with identity creation
- [ ] Self-healing network recovery
- [ ] Growth analytics and metrics

---

## Agent 3: Symbiont - Cross-Network Federation

**Mission**: Enable communication and resource sharing between different forest networks and external systems (NPCPU, ConstitutionalShrinkage).

### Exclusive Ownership
```
packages/symbiosis/
├── src/
│   ├── gateway/                   # Inter-network gateways
│   │   ├── forest-gateway.ts
│   │   ├── npcpu-bridge.ts        # NPCPU integration
│   │   ├── conshrink-bridge.ts    # ConstitutionalShrinkage
│   │   └── index.ts
│   ├── protocols/                 # Federation protocols
│   │   ├── universal-protocol.ts
│   │   ├── trust-federation.ts
│   │   ├── resource-bridge.ts
│   │   └── index.ts
│   ├── translation/               # Protocol translation
│   │   ├── address-translation.ts
│   │   ├── message-transform.ts
│   │   └── index.ts
│   └── monitoring/                # Federation health
│       ├── link-monitor.ts
│       ├── latency-tracker.ts
│       └── index.ts
└── tests/
    └── *.test.ts
```

### Cross-Repository Integration

**NPCPU Bridge**:
```typescript
interface NPCPUBridge {
  // Route cognitive queries through forest mesh
  routeCognitiveQuery(query: CognitiveQuery): Promise<CognitiveResponse>;

  // Distribute AI workloads across nodes
  distributeProcessing(task: AITask): Promise<TaskResult>;

  // Sync consciousness state across networks
  syncConsciousnessState(state: ConsciousnessSnapshot): Promise<void>;
}
```

**ConstitutionalShrinkage Bridge**:
```typescript
interface ConShrinkBridge {
  // Submit proposals to governance layer
  submitProposal(proposal: GovernanceProposal): Promise<ProposalId>;

  // Route votes through anonymous network
  routeVote(vote: EncryptedVote): Promise<VoteReceipt>;

  // Sync regional pod data
  syncRegionalData(region: RegionId): Promise<RegionState>;
}
```

### Key Deliverables
- [ ] Universal Forest Protocol specification
- [ ] NPCPU cognitive bridge
- [ ] ConstitutionalShrinkage governance bridge
- [ ] Trust federation across networks
- [ ] Protocol translation layer

---

## Agent 4: Sentinel - Security & Privacy

**Mission**: Implement anonymous routing, firewall rules, and privacy-preserving communication across the network.

### Exclusive Ownership
```
packages/anon-routing/
├── src/
│   ├── circuits/                  # Onion circuits
│   │   ├── circuit-builder.ts
│   │   ├── path-selection.ts
│   │   ├── circuit-manager.ts
│   │   └── index.ts
│   ├── encryption/                # Layered encryption
│   │   ├── onion-layer.ts
│   │   ├── key-exchange.ts
│   │   └── index.ts
│   ├── hidden-services/           # Anonymous hosting
│   │   ├── hidden-endpoint.ts
│   │   ├── introduction-points.ts
│   │   └── index.ts
│   └── traffic/                   # Traffic analysis resistance
│       ├── padding.ts
│       ├── timing-obfuscation.ts
│       └── index.ts
└── tests/
    └── *.test.ts

packages/firewall/
├── src/
│   ├── rules/                     # Rule expansion
│   │   ├── forest-rules.ts
│   │   ├── privacy-rules.ts
│   │   └── index.ts
└── tests/
    └── security.test.ts
```

### Security Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    SENTINEL SECURITY STACK                   │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4: Traffic Obfuscation                                │
│  • Timing padding    • Size normalization   • Dummy packets  │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: Onion Routing                                      │
│  • Multi-hop circuits • Layered encryption  • Path selection│
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: End-to-End Encryption                              │
│  • Ed25519 identity  • X25519 key exchange  • ChaCha20      │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: Firewall Enforcement                               │
│  • Zone isolation    • Rate limiting        • DDoS protect  │
└─────────────────────────────────────────────────────────────┘
```

### Key Deliverables
- [ ] Circuit-based onion routing
- [ ] Hidden service protocol
- [ ] Traffic padding and obfuscation
- [ ] Guard node selection algorithm
- [ ] Privacy-preserving voting bridge (for ConShrinkage)

---

## Agent 5: Archivist - Historical Research

**Mission**: Document and index historical free energy research with verified sources, creating a searchable knowledge base.

### Exclusive Ownership
```
packages/tesla-archive/
├── src/
│   ├── patents/
│   │   ├── wireless-transmission.ts   # US645576A, US649621A
│   │   ├── magnifying-transmitter.ts  # US787412A
│   │   ├── radiant-energy.ts          # US685957A
│   │   └── index.ts
│   ├── wardenclyffe/
│   │   ├── tower-specifications.ts
│   │   ├── historical-documents.ts
│   │   └── index.ts
│   ├── sources/
│   │   ├── verified-links.ts
│   │   └── citation-generator.ts
│   └── index.ts
└── README.md

packages/lenr-database/
├── src/
│   ├── papers/
│   │   ├── fleischmann-pons-1989.ts
│   │   ├── nasa-studies.ts
│   │   ├── mit-research.ts
│   │   └── index.ts
│   ├── companies/
│   │   ├── brillouin-energy.ts
│   │   ├── clean-planet.ts
│   │   └── index.ts
│   ├── government/
│   │   ├── darpa-programs.ts
│   │   ├── japan-nedo.ts
│   │   └── index.ts
│   └── database/
│       ├── paper-index.ts
│       ├── doi-resolver.ts
│       └── index.ts
└── README.md
```

### Source Verification Requirements
Every source MUST include:
- Direct URL (clickable, verified accessible)
- DOI for academic papers
- Archive reference for historical documents
- Last verification date

### Verified Sources to Index
| Category | Source | URL |
|----------|--------|-----|
| Tesla Patents | Google Patents | patents.google.com/patent/US645576A |
| Tesla Patents | Google Patents | patents.google.com/patent/US787412A |
| FBI Files | FBI Vault | vault.fbi.gov/nikola-tesla |
| LENR Archive | LENR-CANR | lenr-canr.org |
| LENR Company | Brillouin Energy | brillouinenergy.com |
| LENR Company | Clean Planet | cleanplanet.co.jp |

### Key Deliverables
- [ ] Tesla patent catalog (20+ patents with links)
- [ ] LENR paper database (100+ verified DOIs)
- [ ] Company profiles with real URLs
- [ ] Citation generator for proper attribution
- [ ] Source verification report

---

## Agent 6: Beacon - Hardware & Deployment

**Mission**: Define hardware specifications and create deployment configurations for mesh nodes across various platforms.

### Exclusive Ownership
```
packages/hardware-hal/
├── src/
│   ├── radios/
│   │   ├── lora-sx1262.ts
│   │   ├── wifi-802-11s.ts
│   │   ├── wifi-halow.ts          # 802.11ah long-range
│   │   └── index.ts
│   ├── platforms/
│   │   ├── raspberry-pi.ts
│   │   ├── openwrt-router.ts
│   │   ├── esp32-node.ts
│   │   └── index.ts
│   ├── power/
│   │   ├── solar-systems.ts
│   │   ├── battery-management.ts
│   │   └── index.ts
│   └── calculators/
│       ├── link-budget.ts
│       ├── coverage-estimator.ts
│       └── index.ts
└── tests/
    └── *.test.ts

packages/node-deploy/
├── docker/
│   ├── Dockerfile.mesh-node
│   ├── Dockerfile.gateway
│   ├── docker-compose.cluster.yml
│   └── README.md
├── kubernetes/
│   ├── mesh-node-deployment.yaml
│   ├── gateway-statefulset.yaml
│   ├── network-policies.yaml
│   └── README.md
├── ansible/
│   ├── playbooks/
│   │   ├── install-mesh-node.yml
│   │   ├── configure-lora.yml
│   │   └── update-fleet.yml
│   └── README.md
└── terraform/
    ├── aws-mesh-vpc/
    ├── digital-ocean-droplets/
    └── README.md
```

### Hardware Compatibility Matrix
| Platform | CPU | RAM | Storage | Radio Options |
|----------|-----|-----|---------|---------------|
| Raspberry Pi 4 | ARM Cortex-A72 | 4GB | 32GB SD | USB WiFi, LoRa HAT |
| OpenWRT Router | MIPS/ARM | 256MB | 16MB Flash | Built-in WiFi |
| ESP32-S3 | Xtensa LX7 | 512KB | 4MB Flash | WiFi, BLE |
| x86 Mini PC | Intel N5105 | 8GB | 128GB SSD | PCIe WiFi, USB LoRa |

### Key Deliverables
- [ ] Hardware specification library
- [ ] Link budget calculator
- [ ] Docker containerization suite
- [ ] Kubernetes mesh deployment
- [ ] Ansible automation playbooks
- [ ] Terraform cloud templates

---

## Agent 7: Nexus - API & SDK Development

**Mission**: Build the public API layer and developer SDKs for interacting with the forest network.

### Exclusive Ownership
```
packages/canopy-api/
├── src/
│   ├── rest/
│   │   ├── routes/
│   │   │   ├── nodes.ts
│   │   │   ├── routing.ts
│   │   │   ├── governance.ts
│   │   │   └── research.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── rate-limit.ts
│   │   │   └── cors.ts
│   │   └── server.ts
│   ├── websocket/
│   │   ├── handlers/
│   │   │   ├── mesh-events.ts
│   │   │   ├── node-status.ts
│   │   │   └── governance-updates.ts
│   │   └── server.ts
│   ├── graphql/
│   │   ├── schema/
│   │   │   ├── node.graphql
│   │   │   ├── network.graphql
│   │   │   └── governance.graphql
│   │   └── resolvers/
│   └── sdk/
│       ├── forest-client.ts
│       ├── node-manager.ts
│       ├── governance-client.ts
│       └── index.ts
└── docs/
    ├── openapi.yaml
    └── README.md
```

### API Endpoints Design
```
REST API (v1)
├── /api/v1/nodes
│   ├── GET  /                 # List nodes
│   ├── GET  /:id              # Get node details
│   ├── POST /                 # Register node
│   └── PUT  /:id/status       # Update status
├── /api/v1/routing
│   ├── GET  /paths            # Get routing paths
│   ├── POST /optimize         # Trigger optimization
│   └── GET  /metrics          # Routing metrics
├── /api/v1/governance
│   ├── GET  /proposals        # List proposals
│   ├── POST /proposals        # Submit proposal
│   └── POST /votes            # Cast vote
└── /api/v1/research
    ├── GET  /patents          # Search patents
    └── GET  /papers           # Search papers
```

### SDK Integration with NPCPU
```typescript
// SDK can route requests through NPCPU for cognitive processing
import { ForestClient } from '@chicago-forest/canopy-api';
import { NPCPUConnector } from '@npcpu/sdk';

const forest = new ForestClient({
  cognitiveLayer: new NPCPUConnector(),
  enableAIRouting: true
});

// AI-enhanced node discovery
const nodes = await forest.discoverNodes({
  useConsciousness: true,
  optimizationGoal: 'latency'
});
```

### Key Deliverables
- [ ] REST API with OpenAPI spec
- [ ] WebSocket real-time events
- [ ] GraphQL schema and resolvers
- [ ] TypeScript SDK with full types
- [ ] NPCPU cognitive integration
- [ ] API documentation

---

## Agent 8: Delegate - Governance Systems

**Mission**: Implement decentralized governance, voting mechanisms, and proposal systems that bridge hive-mind with ConstitutionalShrinkage.

### Exclusive Ownership
```
packages/hive-mind/
├── src/
│   ├── consensus/
│   │   ├── proposal-manager.ts
│   │   ├── voting-engine.ts
│   │   ├── quorum-calculator.ts
│   │   ├── conviction-voting.ts
│   │   └── index.ts
│   ├── reputation/
│   │   ├── node-reputation.ts
│   │   ├── stake-weighting.ts
│   │   ├── delegation.ts
│   │   └── index.ts
│   ├── treasury/
│   │   ├── community-fund.ts
│   │   ├── grant-system.ts
│   │   └── index.ts
│   └── bridges/
│       ├── conshrink-adapter.ts     # ConstitutionalShrinkage
│       └── index.ts
└── tests/
    └── *.test.ts

packages/forest-registry/
├── src/
│   ├── registry/
│   │   ├── forest-record.ts
│   │   ├── node-record.ts
│   │   ├── service-record.ts
│   │   └── index.ts
│   ├── resolution/
│   │   ├── name-resolver.ts
│   │   ├── service-discovery.ts
│   │   └── index.ts
│   └── replication/
│       ├── distributed-ledger.ts
│       └── index.ts
└── tests/
    └── *.test.ts
```

### ConstitutionalShrinkage Integration
```typescript
// Bridge hive-mind governance to ConstitutionalShrinkage
interface ConShrinkAdapter {
  // Map Forest proposals to ConShrink legislative format
  translateProposal(forestProposal: ForestProposal): ConShrinkBill;

  // Route votes through both systems
  syncVotingResults(results: VotingResults): Promise<void>;

  // Regional pod coordination
  coordinateRegionalNodes(region: RegionId): Promise<NodeList>;
}
```

### Governance Mechanisms
| Mechanism | Description | Use Case |
|-----------|-------------|----------|
| Lazy Consensus | Accept unless objection | Minor changes |
| Conviction Voting | Time-locked commitment | Resource allocation |
| Quadratic Voting | Square root weighting | Prevent plutocracy |
| Liquid Democracy | Delegation chains | Complex decisions |

### Key Deliverables
- [ ] Proposal lifecycle management
- [ ] Multiple voting mechanisms
- [ ] Reputation and stake systems
- [ ] ConstitutionalShrinkage bridge
- [ ] Forest registry with distributed ledger
- [ ] Service discovery protocol

---

## Agent 9: Weaver - Integration Testing

**Mission**: Build comprehensive test suites that verify integration across all packages and companion repositories.

### Exclusive Ownership
```
packages/test-utils/
├── src/
│   ├── mocks/
│   │   ├── mock-network.ts
│   │   ├── mock-node.ts
│   │   ├── mock-npcpu.ts          # NPCPU mocks
│   │   ├── mock-conshrink.ts      # ConShrinkage mocks
│   │   └── index.ts
│   ├── fixtures/
│   │   ├── network-fixtures.ts
│   │   ├── node-fixtures.ts
│   │   └── index.ts
│   ├── helpers/
│   │   ├── network-simulator.ts
│   │   ├── timing-helpers.ts
│   │   └── index.ts
│   └── index.ts
└── README.md

# Test files across all packages
packages/*/tests/
├── unit/
│   └── *.test.ts
├── integration/
│   └── *.integration.test.ts
└── e2e/
    └── *.e2e.test.ts
```

### Test Coverage Requirements
| Package | Unit | Integration | E2E |
|---------|------|-------------|-----|
| mycelium-core | 80% | 60% | N/A |
| p2p-core | 85% | 70% | 50% |
| routing | 80% | 65% | N/A |
| hive-mind | 75% | 60% | 40% |
| canopy-api | 80% | 70% | 60% |

### Cross-Repository Testing
```typescript
// Integration test spanning all three repositories
describe('Ecosystem Integration', () => {
  it('should route NPCPU cognitive query through forest mesh', async () => {
    const forest = createTestForest();
    const npcpu = createMockNPCPU();

    const query = { type: 'cognitive', payload: 'analyze-topology' };
    const result = await forest.routeToNPCPU(query);

    expect(result.processed).toBe(true);
    expect(result.route.hops).toBeGreaterThan(2);
  });

  it('should submit governance proposal to ConShrinkage', async () => {
    const hiveMind = createTestHiveMind();
    const conShrink = createMockConShrink();

    const proposal = await hiveMind.createProposal({
      title: 'Network Upgrade',
      category: 'infrastructure'
    });

    const bill = await hiveMind.bridgeToConShrink(proposal);
    expect(bill.status).toBe('submitted');
  });
});
```

### Key Deliverables
- [ ] Test utilities package with mocks
- [ ] Unit tests for all core packages
- [ ] Integration tests for package interactions
- [ ] E2E tests for critical workflows
- [ ] CI/CD pipeline configuration
- [ ] Coverage reporting

---

## Agent 10: Oracle - Documentation & UX

**Mission**: Create comprehensive documentation, user guides, and frontend interfaces for the research portal and network visualization.

### Exclusive Ownership
```
apps/web/
├── app/
│   ├── research/                  # Research portal
│   │   ├── page.tsx
│   │   ├── tesla/
│   │   │   └── page.tsx
│   │   ├── lenr/
│   │   │   └── page.tsx
│   │   └── timeline/
│   │       └── page.tsx
│   ├── network/                   # Network visualization
│   │   ├── page.tsx
│   │   ├── topology/
│   │   │   └── page.tsx
│   │   └── metrics/
│   │       └── page.tsx
│   └── governance/                # Governance dashboard
│       ├── page.tsx
│       ├── proposals/
│       │   └── page.tsx
│       └── voting/
│           └── page.tsx
├── components/
│   ├── research/
│   │   ├── PatentViewer.tsx
│   │   ├── PaperDatabase.tsx
│   │   └── SourceVerifier.tsx
│   ├── network/
│   │   ├── TopologyMap.tsx
│   │   ├── NodeStatus.tsx
│   │   └── MetricsChart.tsx
│   └── governance/
│       ├── ProposalCard.tsx
│       ├── VotingBooth.tsx
│       └── DelegationTree.tsx
└── lib/
    ├── hooks/
    │   ├── useNetwork.ts
    │   ├── useGovernance.ts
    │   └── useResearch.ts
    └── api/
        └── forest-client.ts
```

### Documentation Standards
- Every page includes AI-generated disclaimer
- Real sources have clickable URLs
- Theoretical content clearly marked
- Mobile-responsive design
- Accessibility (WCAG 2.1 AA)

### Key Deliverables
- [ ] Research portal with Tesla/LENR pages
- [ ] Interactive network topology visualization
- [ ] Governance dashboard with voting UI
- [ ] API documentation site
- [ ] User guides and tutorials
- [ ] CLI documentation

---

## Deployment Workflow

### Branch Naming Convention
```
claude/agent-{N}-{codename}-{session_id}

Examples:
claude/agent-1-mycelia-abc123
claude/agent-2-rhizome-def456
claude/agent-5-archivist-ghi789
```

### Merge Order (Minimal Conflicts)
```
1. Agent 9 (Weaver)    → Test utilities first
2. Agent 5 (Archivist) → Research data (no deps)
3. Agent 6 (Beacon)    → Hardware specs (no deps)
4. Agent 1 (Mycelia)   → Core network
5. Agent 2 (Rhizome)   → Depends on mycelium-core
6. Agent 4 (Sentinel)  → Security layer
7. Agent 8 (Delegate)  → Governance
8. Agent 3 (Symbiont)  → Cross-repo bridges
9. Agent 7 (Nexus)     → API layer
10. Agent 10 (Oracle)  → Frontend (last)
```

### CI/CD Integration
```yaml
# .github/workflows/agent-merge.yml
name: Agent Merge Validation

on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check exclusive ownership
        run: |
          # Verify PR only modifies agent's exclusive files
          scripts/validate-ownership.sh ${{ github.event.pull_request.number }}

      - name: Build affected packages
        run: pnpm turbo build --filter=...[origin/main]

      - name: Run tests
        run: pnpm turbo test --filter=...[origin/main]
```

---

## Success Metrics

### Per-Agent Completion Criteria
- [ ] All exclusive files created/updated
- [ ] TypeScript compiles without errors
- [ ] 80%+ test coverage for new code
- [ ] README.md in each package
- [ ] All sources verified (research agents)
- [ ] Integration hooks documented

### Ecosystem Integration Criteria
- [ ] NPCPU bridge functional
- [ ] ConstitutionalShrinkage bridge functional
- [ ] All packages build together
- [ ] Integration tests pass
- [ ] API serves all endpoints
- [ ] Web portal renders correctly

---

## Quick Reference

### Environment Setup
```bash
# Clone all three repositories
git clone https://github.com/vespo92/ChicagoForest.net.git
git clone https://github.com/vespo92/NPCPU.git
git clone https://github.com/vespo92/ConstititutionalShrinkage.git

# Setup ChicagoForest
cd ChicagoForest.net
pnpm install
pnpm build

# Create agent branch
git checkout -b claude/agent-{N}-{codename}-{session_id}
```

### Agent Quick Start Template
```bash
# Work on exclusive files
# ... make changes ...

# Build and test
pnpm turbo build --filter=@chicago-forest/{package}
pnpm turbo test --filter=@chicago-forest/{package}

# Commit with conventional commits
git add .
git commit -m "feat(agent-{N}): Add {feature description}"

# Push
git push -u origin claude/agent-{N}-{codename}-{session_id}
```

---

*This deployment strategy is AI-generated for the Chicago Forest Network theoretical framework.*
*All agents operate under CLAUDE.md principles: transparency, verified sources, clear disclaimers.*

**Let the forest grow through distributed intelligence.**
