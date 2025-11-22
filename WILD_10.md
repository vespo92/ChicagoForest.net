# WILD_10: Parallel Agent Task Breakdown

> **10 Agents, 10 Domains, Zero Conflicts**
> Each agent owns exclusive files/directories to enable parallel development and clean merges.

---

## Mission Alignment

All agents must adhere to [CLAUDE.md](./CLAUDE.md) principles:
- **Document REAL historical research** with verifiable sources
- **Mark theoretical content** as AI-generated/speculative
- **Never claim** any system is operational
- **Provide clickable URLs** for all sources

---

## Agent Task Matrix

| Agent | Domain | Exclusive Ownership | Estimated Files |
|-------|--------|---------------------|-----------------|
| 1 | Tesla Deep Research | `packages/tesla-archive/` | 12+ |
| 2 | LENR Scientific Database | `packages/lenr-database/` | 15+ |
| 3 | Nutrient Exchange Economy | `packages/nutrient-exchange/src/` expansion | 8+ |
| 4 | Spore Propagation Protocol | `packages/spore-propagation/src/` expansion | 10+ |
| 5 | Hive Mind Governance | `packages/hive-mind/src/` expansion | 12+ |
| 6 | Hardware Specifications | `packages/hardware-hal/src/` expansion | 10+ |
| 7 | Community Mesh Deployment | `packages/node-deploy/` expansion | 8+ |
| 8 | Web Research Portal | `apps/web/app/research/` (new pages) | 6+ |
| 9 | API & SDK Development | `packages/canopy-api/src/` expansion | 10+ |
| 10 | Test Suite & Quality | `packages/*/tests/` (test files only) | 20+ |

---

## Agent 1: Tesla Deep Research Archive

**Domain**: Historical Tesla research documentation and patent analysis

**Exclusive Files**:
```
packages/tesla-archive/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── patents/
│   │   ├── wireless-transmission.ts    # US645576A, US649621A
│   │   ├── magnifying-transmitter.ts   # US787412A, US1119732A
│   │   ├── radiant-energy.ts           # US685957A
│   │   └── index.ts
│   ├── wardenclyffe/
│   │   ├── tower-specs.ts
│   │   ├── financial-history.ts
│   │   └── index.ts
│   ├── colorado-springs/
│   │   ├── experiments.ts
│   │   └── diary-notes.ts
│   └── sources.ts                      # Verified source links
└── README.md
```

**Research Objectives**:
1. Catalog all Tesla wireless power patents with Google Patents links
2. Document Wardenclyffe Tower specifications from historical records
3. Analyze Colorado Springs diary notes (publicly available)
4. Link to FBI Vault declassified Tesla files
5. Create TypeScript interfaces for patent metadata

**Required Sources** (must verify all):
- patents.google.com/patent/US645576A
- patents.google.com/patent/US787412A
- vault.fbi.gov/nikola-tesla
- teslauniverse.com (verified archive)

**Deliverables**:
- [ ] Complete patent catalog with links
- [ ] Wardenclyffe technical documentation
- [ ] Source verification report
- [ ] TypeScript data models

---

## Agent 2: LENR Scientific Database

**Domain**: Low Energy Nuclear Reactions research compilation

**Exclusive Files**:
```
packages/lenr-database/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── papers/
│   │   ├── fleischmann-pons.ts         # Original 1989 paper
│   │   ├── nasa-studies.ts             # NASA Glenn research
│   │   ├── mit-colloquium.ts           # MIT LENR work
│   │   └── index.ts
│   ├── companies/
│   │   ├── brillouin-energy.ts
│   │   ├── clean-planet.ts
│   │   ├── industrial-heat.ts
│   │   └── index.ts
│   ├── government/
│   │   ├── darpa.ts
│   │   ├── japan-nedo.ts
│   │   └── index.ts
│   ├── database.ts                     # Paper database with DOIs
│   └── sources.ts
└── README.md
```

**Research Objectives**:
1. Compile LENR papers with DOI links (lenr-canr.org archive)
2. Document active companies with real websites
3. Track government funding programs (NASA, DARPA, NEDO)
4. Create searchable paper database structure
5. Verify all 3500+ papers claim with actual sources

**Required Sources** (must verify all):
- lenr-canr.org (primary LENR archive)
- doi.org links for peer-reviewed papers
- brillouinenergy.com
- cleanplanet.co.jp

**Deliverables**:
- [ ] Paper database with 100+ verified DOIs
- [ ] Company profiles with real URLs
- [ ] Government program documentation
- [ ] Research timeline visualization data

---

## Agent 3: Nutrient Exchange Economy

**Domain**: Theoretical resource sharing and bandwidth economy

**Exclusive Files** (expand existing package):
```
packages/nutrient-exchange/src/
├── economy/
│   ├── bandwidth-credits.ts
│   ├── storage-economy.ts
│   ├── compute-sharing.ts
│   └── index.ts
├── protocols/
│   ├── resource-negotiation.ts
│   ├── fair-exchange.ts
│   ├── proof-of-contribution.ts
│   └── index.ts
├── models/
│   ├── resource-pool.ts
│   ├── contributor-node.ts
│   ├── exchange-rate.ts
│   └── index.ts
└── simulation/
    ├── network-economics.ts
    └── index.ts
```

**Development Objectives**:
1. Design bandwidth credit system (theoretical)
2. Create resource negotiation protocols
3. Implement fair exchange algorithms
4. Build proof-of-contribution model
5. Simulate network economics

**Theoretical Framework**:
- Inspired by BitTorrent's tit-for-tat
- References Filecoin's proof-of-storage
- Extends mesh network resource sharing

**Deliverables**:
- [ ] Complete economy model TypeScript
- [ ] Protocol specifications
- [ ] Simulation framework
- [ ] Integration with mycelium-core

---

## Agent 4: Spore Propagation Protocol

**Domain**: Network growth, bootstrap, and organic expansion

**Exclusive Files** (expand existing package):
```
packages/spore-propagation/src/
├── bootstrap/
│   ├── seed-node.ts
│   ├── initial-connection.ts
│   ├── trust-establishment.ts
│   └── index.ts
├── growth/
│   ├── organic-expansion.ts
│   ├── node-recruitment.ts
│   ├── coverage-optimization.ts
│   └── index.ts
├── resilience/
│   ├── redundancy-planning.ts
│   ├── failover-mechanisms.ts
│   ├── self-healing.ts
│   └── index.ts
└── metrics/
    ├── growth-analytics.ts
    ├── health-monitoring.ts
    └── index.ts
```

**Development Objectives**:
1. Design seed node bootstrap protocol
2. Create organic network growth algorithms
3. Implement coverage optimization
4. Build self-healing mechanisms
5. Create growth analytics dashboard data

**Biological Inspiration**:
- Mycelium spore dispersal patterns
- Rhizome network growth
- Slime mold optimization (real research: doi.org/10.1126/science.1177894)

**Deliverables**:
- [ ] Bootstrap protocol implementation
- [ ] Growth algorithm library
- [ ] Resilience framework
- [ ] Metrics collection system

---

## Agent 5: Hive Mind Governance

**Domain**: Decentralized decision-making and consensus

**Exclusive Files** (expand existing package):
```
packages/hive-mind/src/
├── consensus/
│   ├── proposal-system.ts
│   ├── voting-mechanisms.ts
│   ├── quorum-calculation.ts
│   └── index.ts
├── governance/
│   ├── node-reputation.ts
│   ├── stake-weighted-voting.ts
│   ├── delegation.ts
│   └── index.ts
├── disputes/
│   ├── conflict-resolution.ts
│   ├── arbitration.ts
│   └── index.ts
├── treasury/
│   ├── community-fund.ts
│   ├── grant-proposals.ts
│   └── index.ts
└── models/
    ├── proposal.ts
    ├── vote.ts
    ├── member.ts
    └── index.ts
```

**Development Objectives**:
1. Design proposal and voting system
2. Implement reputation-based governance
3. Create conflict resolution mechanisms
4. Build community treasury model
5. Integrate with forest registry

**Governance Inspiration**:
- DAO governance patterns (Aragon, Compound)
- Liquid democracy concepts
- Sociocracy decision-making
- Reference: Ostrom's commons governance

**Deliverables**:
- [ ] Complete governance framework
- [ ] Voting mechanism library
- [ ] Reputation system
- [ ] Treasury management

---

## Agent 6: Hardware Specifications

**Domain**: Physical hardware layer and device specifications

**Exclusive Files** (expand existing package):
```
packages/hardware-hal/src/
├── radios/
│   ├── lora-specs.ts              # LoRa for long-range mesh
│   ├── wifi-mesh.ts               # 802.11s mesh specs
│   ├── ubiquiti-integration.ts    # Real hardware
│   └── index.ts
├── antennas/
│   ├── directional.ts
│   ├── omnidirectional.ts
│   ├── diy-designs.ts
│   └── index.ts
├── nodes/
│   ├── raspberry-pi-node.ts
│   ├── openwrt-router.ts
│   ├── solar-powered.ts
│   └── index.ts
├── power/
│   ├── solar-specs.ts
│   ├── battery-systems.ts
│   ├── power-budget.ts
│   └── index.ts
└── calculators/
    ├── link-budget.ts
    ├── coverage-area.ts
    └── index.ts
```

**Development Objectives**:
1. Document real mesh hardware (Ubiquiti, Mikrotik)
2. Create LoRa specification library
3. Design solar-powered node specs
4. Build link budget calculators
5. Provide DIY antenna designs (with real sources)

**Real Hardware References**:
- ui.com (Ubiquiti documentation)
- mikrotik.com (RouterOS specs)
- lora-alliance.org (LoRa specifications)
- OpenWRT.org (router firmware)

**Deliverables**:
- [ ] Hardware catalog with real products
- [ ] RF calculation library
- [ ] Solar power specifications
- [ ] DIY build guides data

---

## Agent 7: Community Mesh Deployment

**Domain**: Deployment guides and infrastructure templates

**Exclusive Files** (expand existing package):
```
packages/node-deploy/
├── docker/
│   ├── Dockerfile.node
│   ├── Dockerfile.gateway
│   ├── docker-compose.yml
│   └── README.md
├── kubernetes/
│   ├── node-deployment.yaml
│   ├── gateway-service.yaml
│   ├── configmaps/
│   └── README.md
├── ansible/
│   ├── playbooks/
│   │   ├── install-node.yml
│   │   ├── configure-mesh.yml
│   │   └── update-network.yml
│   ├── inventory/
│   └── README.md
├── terraform/
│   ├── aws/
│   ├── gcp/
│   ├── digital-ocean/
│   └── README.md
└── guides/
    ├── home-node-setup.md
    ├── community-gateway.md
    └── troubleshooting.md
```

**Development Objectives**:
1. Create Docker deployment configurations
2. Build Kubernetes manifests for cloud nodes
3. Write Ansible playbooks for automation
4. Provide Terraform for cloud infrastructure
5. Write deployment guides

**Real Technology Stack**:
- Docker/Podman containerization
- K8s for orchestration
- Ansible for configuration management
- Terraform for IaC

**Deliverables**:
- [ ] Complete Docker setup
- [ ] Kubernetes manifests
- [ ] Ansible automation
- [ ] Cloud deployment templates

---

## Agent 8: Web Research Portal

**Domain**: Frontend research pages and interactive content

**Exclusive Files** (new pages in web app):
```
apps/web/app/research/
├── page.tsx                        # Research hub landing
├── layout.tsx                      # Research section layout
├── tesla/
│   ├── page.tsx                    # Tesla research page
│   └── [patent]/page.tsx           # Dynamic patent pages
├── lenr/
│   ├── page.tsx                    # LENR overview
│   └── papers/page.tsx             # Paper database browser
├── moray/
│   └── page.tsx                    # Moray research
├── mallove/
│   └── page.tsx                    # Mallove & Infinite Energy
├── timeline/
│   └── page.tsx                    # Historical timeline
└── sources/
    └── page.tsx                    # Source verification page

apps/web/components/research/
├── PatentViewer.tsx                # Patent display component
├── PaperDatabase.tsx               # Searchable paper list
├── ResearchTimeline.tsx            # Interactive timeline
├── SourceVerifier.tsx              # Source link checker
└── CitationCard.tsx                # Citation display
```

**Development Objectives**:
1. Build research hub landing page
2. Create interactive Tesla patent viewer
3. Design LENR paper database browser
4. Implement historical timeline
5. Add source verification display

**UI/UX Requirements**:
- Clear AI-generated disclaimers on every page
- Clickable source links throughout
- Distinguish REAL research from THEORETICAL
- Mobile-responsive design

**Deliverables**:
- [ ] Research hub with navigation
- [ ] Patent viewer component
- [ ] Paper database interface
- [ ] Timeline visualization
- [ ] Source verification display

---

## Agent 9: API & SDK Development

**Domain**: Public API and developer SDK

**Exclusive Files** (expand existing package):
```
packages/canopy-api/src/
├── rest/
│   ├── routes/
│   │   ├── nodes.ts
│   │   ├── routing.ts
│   │   ├── research.ts
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rate-limit.ts
│   │   └── index.ts
│   └── server.ts
├── websocket/
│   ├── handlers/
│   │   ├── node-events.ts
│   │   ├── mesh-updates.ts
│   │   └── index.ts
│   └── server.ts
├── graphql/
│   ├── schema/
│   │   ├── node.graphql
│   │   ├── network.graphql
│   │   └── research.graphql
│   ├── resolvers/
│   └── server.ts
├── sdk/
│   ├── client.ts
│   ├── node-manager.ts
│   ├── research-api.ts
│   └── index.ts
└── docs/
    ├── openapi.yaml
    └── README.md
```

**Development Objectives**:
1. Build REST API with OpenAPI spec
2. Create WebSocket real-time handlers
3. Design GraphQL schema
4. Implement JavaScript/TypeScript SDK
5. Generate API documentation

**API Features**:
- Node discovery and management
- Routing information
- Research database queries
- Network statistics

**Deliverables**:
- [ ] REST API implementation
- [ ] WebSocket handlers
- [ ] GraphQL schema and resolvers
- [ ] SDK with TypeScript types
- [ ] OpenAPI documentation

---

## Agent 10: Test Suite & Quality

**Domain**: Testing infrastructure across all packages

**Exclusive Files** (test files in all packages):
```
packages/*/tests/                   # Test directories in each package
packages/mycelium-core/tests/
├── growth.test.ts
├── hyphal.test.ts
├── signal.test.ts
└── network.test.ts

packages/p2p-core/tests/
├── peer-discovery.test.ts
├── connection.test.ts
└── identity.test.ts

packages/routing/tests/
├── path-finding.test.ts
├── load-balancing.test.ts
└── failover.test.ts

# Also owns:
vitest.workspace.ts                 # Workspace test config
packages/test-utils/                # Shared testing utilities
├── package.json
├── src/
│   ├── mocks/
│   ├── fixtures/
│   └── helpers.ts
└── README.md
```

**Development Objectives**:
1. Create test utilities package
2. Write unit tests for mycelium-core
3. Write unit tests for p2p-core
4. Write unit tests for routing
5. Set up CI test configuration

**Testing Standards**:
- Vitest for all tests
- 80%+ code coverage goal
- Mock external dependencies
- Integration test examples

**Deliverables**:
- [ ] Test utilities package
- [ ] Unit tests for core packages
- [ ] Integration test examples
- [ ] Coverage reporting setup
- [ ] CI workflow configuration

---

## Merge Strategy

### Branch Naming Convention
Each agent should use a unique branch:
```
claude/agent-1-tesla-archive-{session_id}
claude/agent-2-lenr-database-{session_id}
claude/agent-3-nutrient-exchange-{session_id}
...
claude/agent-10-test-suite-{session_id}
```

### File Ownership Rules
- **NO agent may modify another agent's exclusive files**
- Shared files (`package.json` root, `turbo.json`) require coordination
- Each agent adds their package to `pnpm-workspace.yaml` (append only)

### Merge Order Recommendation
```
1. Agent 10 (Test Utils) - Creates shared testing infrastructure
2. Agents 1, 2 (Research) - No code dependencies
3. Agents 3, 4, 5 (Core Protocols) - Parallel, no conflicts
4. Agent 6 (Hardware) - Independent
5. Agent 7 (Deployment) - Independent
6. Agent 9 (API) - May reference other packages
7. Agent 8 (Web) - Last, can reference all packages
```

### Integration Points
After all agents merge, a final integration PR should:
1. Update root `package.json` with all new packages
2. Verify `turbo.json` pipeline includes new packages
3. Run full test suite
4. Update main README.md with new packages

---

## Success Criteria

Each agent must deliver:
1. **Working TypeScript code** that compiles without errors
2. **Verified sources** with real, clickable URLs
3. **AI-generated disclaimers** where theoretical content exists
4. **README.md** in their package explaining the component
5. **Clean git history** with descriptive commits

---

## Quick Start for Agents

```bash
# Clone and setup
git clone https://github.com/vespo92/ChicagoForest.net.git
cd ChicagoForest.net
pnpm install

# Create agent branch
git checkout -b claude/agent-{N}-{domain}-{session_id}

# Work on exclusive files only
# ...

# Test your package
pnpm turbo build --filter=@chicago-forest/{package-name}

# Commit and push
git add .
git commit -m "feat(agent-{N}): Add {description}"
git push -u origin claude/agent-{N}-{domain}-{session_id}
```

---

## Appendix: Source Verification Checklist

Before adding ANY source, verify:
- [ ] URL is accessible (not 404)
- [ ] Content matches citation
- [ ] Source is from reputable archive
- [ ] DOI links resolve correctly
- [ ] Patent links go to Google Patents
- [ ] Company websites are official

---

**Let's grow the forest together - 10 agents, 10 domains, one vision.**

*This document is AI-generated as part of the Chicago Plasma Forest Network theoretical framework.*
