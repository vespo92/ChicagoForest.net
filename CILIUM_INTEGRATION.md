# Cilium eBPF Integration Architecture

> **DISCLAIMER**: This is an AI-generated theoretical framework for educational and research purposes.
> The Chicago Forest Network is a conceptual design, not operational infrastructure.

## Why Cilium + Mycelium

Cilium and the Mycelium Protocol are **complementary layers**, not competitors. They operate at fundamentally different levels of the stack and together create a defense-in-depth network architecture where security, observability, and routing happen at both the **kernel level** (Cilium/eBPF) and the **application level** (Mycelium).

```
╔════════════════════════════════════════════════════════════════════════════╗
║                    INTERLACED ARCHITECTURE                                ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  ┌──────────────────────────────────────────────────────────────────────┐║
║  │ MYCELIUM APPLICATION LAYER                                          │║
║  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │║
║  │  │  gossip    │ │ nutrient   │ │ hive-mind  │ │   spore    │       │║
║  │  │ protocol   │ │ exchange   │ │ governance │ │propagation │       │║
║  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘       │║
║  └────────┼──────────────┼──────────────┼──────────────┼───────────────┘║
║           │              │              │              │                  ║
║  ┌────────┼──────────────┼──────────────┼──────────────┼───────────────┐║
║  │ MNP OVERLAY     ──────┴──────────────┴──────────────┘               │║
║  │  256-bit addressing │ DHT routing │ Geohash proximity               │║
║  └─────────────────────┼───────────────────────────────────────────────┘║
║                        │                                                  ║
║  ┌─────────────────────┼───────────────────────────────────────────────┐║
║  │ ★ CILIUM eBPF LAYER │  @chicago-forest/cilium-mesh                  │║
║  │  ┌──────────────────┴──────────────────────────────────────┐       │║
║  │  │                                                          │       │║
║  │  │   ┌──────────┐   ┌──────────┐   ┌──────────┐            │       │║
║  │  │   │ Network  │   │  Hubble  │   │ Tetragon │            │       │║
║  │  │   │ Policies │   │  Flows   │   │ Runtime  │            │       │║
║  │  │   │ L3/L4/L7 │   │Observ-  │   │ Security │            │       │║
║  │  │   │  eBPF    │   │ ability  │   │  eBPF    │            │       │║
║  │  │   └──────────┘   └──────────┘   └──────────┘            │       │║
║  │  │                                                          │       │║
║  │  │   ┌──────────┐   ┌──────────┐   ┌──────────┐            │       │║
║  │  │   │  Custom  │   │ Cluster  │   │   CFW    │            │       │║
║  │  │   │  eBPF    │   │  Mesh    │   │  Sync    │            │       │║
║  │  │   │ Programs │   │  Multi-  │   │Cilium ↔  │            │       │║
║  │  │   │ MNP/XDP  │   │  Forest  │   │Firewall  │            │       │║
║  │  │   └──────────┘   └──────────┘   └──────────┘            │       │║
║  │  │                                                          │       │║
║  │  └──────────────────────────────────────────────────────────┘       │║
║  └─────────────────────────────────────────────────────────────────────┘║
║                        │                                                  ║
║  ┌─────────────────────┼───────────────────────────────────────────────┐║
║  │ MESH TRANSPORT      │                                               │║
║  │  B.A.T.M.A.N. │ WireGuard │ Yggdrasil │ LoRa                      │║
║  └─────────────────────┼───────────────────────────────────────────────┘║
║                        │                                                  ║
║  ┌─────────────────────┼───────────────────────────────────────────────┐║
║  │ PHYSICAL            │                                               │║
║  │  WiFi │ Ethernet │ LoRa Radios │ Backhaul                          │║
║  └─────────────────────────────────────────────────────────────────────┘║
║                                                                          ║
╚════════════════════════════════════════════════════════════════════════════╝
```

---

## How Cilium Interlaces with Mycelium

### 1. Network Policies ↔ Chicago Forest Firewall

| Aspect | CFW (Existing) | Cilium Policies (New) |
|--------|----------------|----------------------|
| **Layer** | Application/userspace | Kernel/eBPF |
| **Enforcement** | Packet inspection in node process | eBPF programs in kernel |
| **Performance** | Per-packet userspace overhead | Near-zero overhead |
| **L7 Awareness** | Not implemented | HTTP, DNS, Kafka rules |
| **Scope** | Per-node | Cluster-wide |
| **Identity** | IP-based | Kubernetes label-based |

**Sync Mode**: Cilium is the primary enforcer. CFW rules are translated to CiliumNetworkPolicies. CFW remains for non-Kubernetes deployments (bare-metal, OpenWrt).

### 2. Hubble ↔ MetricsEngine

```
         KERNEL                              USERSPACE
┌───────────────────┐              ┌───────────────────────────┐
│                   │              │                           │
│  eBPF Datapath    │   gRPC      │  HubbleFlowCollector      │
│  ┌─────────────┐  │  Stream     │  ┌─────────────────────┐  │
│  │ Every packet │──┼────────────┼──│ Annotate with       │  │
│  │ decision     │  │            │  │ forest metadata:    │  │
│  │ logged by    │  │            │  │  - MNP addresses    │  │
│  │ Hubble agent │  │            │  │  - Signal types     │  │
│  └─────────────┘  │            │  │  - Zone class.      │  │
│                   │            │  │  - Node roles       │  │
│                   │            │  └──────────┬──────────┘  │
│                   │            │             │              │
│                   │            │  ┌──────────▼──────────┐  │
│                   │            │  │  Aggregate into     │  │
│                   │            │  │  ForestFlowMetrics  │  │
│                   │            │  └──────────┬──────────┘  │
│                   │            │             │              │
└───────────────────┘            │  ┌──────────▼──────────┐  │
                                 │  │  Export to:         │  │
                                 │  │  • Prometheus       │  │
                                 │  │  • MetricsEngine    │  │
                                 │  │  • Canopy API       │  │
                                 │  └─────────────────────┘  │
                                 └───────────────────────────┘
```

Hubble sees **every packet** at the kernel level — something the mycelium MetricsEngine can never do from userspace. The HubbleFlowCollector bridges this gap by:

1. Collecting raw eBPF flow events from Hubble Relay
2. Annotating them with forest-specific metadata (zone, role, MNP address)
3. Aggregating into `ForestFlowMetrics` with per-node and per-zone breakdowns
4. Exporting to Prometheus and the mycelium MetricsEngine

### 3. Tetragon ↔ Sentinel

Tetragon operates **inside the kernel** to enforce runtime security. It complements the existing `@chicago-forest/sentinel` package:

| Protection | Tetragon (Kernel) | Sentinel (Userspace) |
|-----------|-------------------|---------------------|
| Process allowlist | Kill unauthorized binaries at execve() | Log process spawning |
| Privilege escalation | Block setuid(0) at syscall level | Detect via process monitoring |
| File access | Alert on /etc/forest/keys/ access at fd_install() | Periodic filesystem scans |
| Container escape | Kill unshare/setns/mount at syscall | Not possible from inside container |
| Network connections | Log tcp_connect/udp_sendmsg | Connection tracking |
| Crypto protection | Restrict read() on key files by process | Key rotation scheduling |

**Key insight**: Tetragon catches attacks that are invisible from userspace. A container escape attempt manipulates kernel namespaces — by the time userspace notices, it's too late. Tetragon kills the process at the syscall boundary.

### 4. Custom eBPF ↔ MNP Protocol

Four custom eBPF programs extend Cilium's datapath for forest protocols:

| Program | Hook Point | Purpose |
|---------|-----------|---------|
| `forest_mnp_xdp` | XDP | Parse MNP 256-bit headers at wire speed |
| `forest_zone_classifier` | TC ingress | Classify packets by forest zone |
| `forest_gossip_fastpath` | cgroup/skb | Deduplicate gossip signals in kernel |
| `forest_sock_ops` | sock_ops | TCP optimization for forest-to-forest traffic |

These programs use shared eBPF maps:

| Map | Type | Purpose |
|-----|------|---------|
| `forest_mnp_geohash_routes` | LPM Trie | Geohash prefix → next-hop routing |
| `forest_node_zones` | Hash | Node ID → zone classification |
| `forest_exchange_rates` | LRU Hash | Per-node nutrient exchange rate limiting |
| `forest_events` | Ring Buffer | Kernel → userspace event channel |
| `forest_signal_dedup` | LRU Hash | Gossip signal deduplication cache |

### 5. ClusterMesh ↔ Symbiosis

Cilium ClusterMesh maps directly to the symbiosis layer for multi-forest connectivity:

```
    CHICAGO FOREST (cluster-id: 1)     DETROIT MESH (cluster-id: 2)
    ══════════════════════════════     ═══════════════════════════
    ┌──────────────────────────┐      ┌──────────────────────────┐
    │  Cilium Agent            │      │  Cilium Agent            │
    │  ┌────────────────────┐  │      │  ┌────────────────────┐  │
    │  │ ClusterMesh API    │◄─┼──────┼──│ ClusterMesh API    │  │
    │  │ Server (etcd)      │──┼──────┼──│ Server (etcd)      │  │
    │  └────────────────────┘  │      │  └────────────────────┘  │
    │                          │      │                          │
    │  Shared:                 │      │  Shared:                 │
    │  • Service endpoints     │      │  • Service endpoints     │
    │  • Network policies      │      │  • Network policies      │
    │  • Node identities       │      │  • Node identities       │
    └──────────────────────────┘      └──────────────────────────┘
              ▲                                   ▲
              │         eBPF IDENTITY             │
              │         TRANSLATION               │
              ▼                                   ▼
    ┌──────────────────────────┐      ┌──────────────────────────┐
    │  Symbiosis Gateway       │      │  Symbiosis Gateway       │
    │  • Protocol bridging     │      │  • Protocol bridging     │
    │  • Trust federation      │      │  • Trust federation      │
    │  • Resource exchange     │      │  • Resource exchange     │
    └──────────────────────────┘      └──────────────────────────┘
```

---

## Package Structure

```
packages/cilium-mesh/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # CiliumMeshManager + re-exports
│   ├── types.ts              # Full type system (policies, Hubble, Tetragon, eBPF)
│   ├── policies/
│   │   └── index.ts          # Network policy generator (11 policies)
│   ├── hubble/
│   │   └── index.ts          # HubbleFlowCollector + Prometheus export
│   ├── tetragon/
│   │   └── index.ts          # TracingPolicy generator (6 policies)
│   └── ebpf/
│       └── index.ts          # Custom eBPF program defs + map configs

packages/node-deploy/kubernetes/cilium/
├── cilium-forest-install.yaml    # Cilium Helm values + all CiliumNetworkPolicies
└── tetragon-forest-policies.yaml # All Tetragon TracingPolicies
```

---

## Network Policies Overview

### Zero-Trust Model

All traffic is **denied by default**. Each policy explicitly allows specific flows:

| Policy | Source | Destination | Ports | Protocol Level |
|--------|--------|-------------|-------|---------------|
| Default Deny | * | * | * | L3 |
| P2P Mesh | forest-node | forest-node | 42000-42001/UDP | L4 |
| WireGuard | forest-* | forest-* | 51820/UDP | L4 |
| Canopy API (public) | world | canopy-api | 8080/TCP | L7 HTTP |
| Canopy API (internal) | forest-* | canopy-api | 8080/TCP | L7 HTTP |
| Control Plane | privileged | control-plane | 8090/TCP | L4 |
| Registry | forest-* | registry | 8053/UDP+TCP, 8080/TCP | L4 |
| Monitoring | monitoring | forest-* | 9090/TCP | L4 |
| Gateway Egress | forest-gateway | world | 80,443/TCP, 53/UDP | L4 |
| ClusterMesh | remote-node | forest-gateway | 42000/UDP, 2379/TCP | L4 |
| DNS | forest-* | cluster (kube-dns) | 53/UDP+TCP | L7 DNS |
| Nutrient Exchange | verified nodes | forest-node | 8080/TCP | L7 HTTP |

### L7 HTTP Enforcement (Canopy API)

External users can **only** hit read-only endpoints:
```
GET /api/v1/status
GET /api/v1/network/topology
GET /api/v1/network/health
GET /api/v1/registry/*
GET /health
GET /ready
```

Internal forest nodes get full CRUD access. This is enforced at the **kernel level** via Cilium's HTTP-aware eBPF proxy — no sidecar or application changes needed.

---

## Deployment

### Install Cilium as CNI

```bash
# Add Cilium Helm repo
helm repo add cilium https://helm.cilium.io/
helm repo update

# Install Cilium with forest configuration
helm install cilium cilium/cilium \
  --namespace kube-system \
  --set cluster.name=chicago-forest \
  --set cluster.id=1 \
  --set kubeProxyReplacement=true \
  --set policyEnforcementMode=always \
  --set hubble.enabled=true \
  --set hubble.relay.enabled=true \
  --set hubble.ui.enabled=true \
  --set tetragon.enabled=true

# Apply forest network policies
kubectl apply -f packages/node-deploy/kubernetes/cilium/cilium-forest-install.yaml

# Apply Tetragon runtime security policies
kubectl apply -f packages/node-deploy/kubernetes/cilium/tetragon-forest-policies.yaml
```

### Verify Installation

```bash
# Check Cilium status
cilium status

# Verify Hubble is collecting flows
hubble observe --namespace chicago-forest

# Check Tetragon events
kubectl logs -n kube-system -l app.kubernetes.io/name=tetragon -c export-stdout

# Test policy enforcement
cilium policy get --namespace chicago-forest
```

---

## Integration with Existing Packages

| Existing Package | Cilium Integration Point |
|-----------------|-------------------------|
| `@chicago-forest/firewall` | CFW rules sync to CiliumNetworkPolicies |
| `@chicago-forest/mycelium-core` | Hubble feeds MetricsEngine; eBPF handles signal dedup |
| `@chicago-forest/mnp` | XDP program parses MNP headers at wire speed |
| `@chicago-forest/sentinel` | Tetragon events feed into Sentinel alerts |
| `@chicago-forest/canopy-api` | L7 HTTP policies restrict API access |
| `@chicago-forest/nutrient-exchange` | L7 rules + eBPF rate limiting for exchanges |
| `@chicago-forest/symbiosis` | ClusterMesh enables multi-forest connectivity |
| `@chicago-forest/forest-registry` | DNS-aware policies for registry resolution |
| `@chicago-forest/node-deploy` | K8s manifests include Cilium policies |
| `@chicago-forest/routing` | Geohash LPM trie for kernel-level routing |

---

## References

- [Cilium Documentation](https://docs.cilium.io/) — Official docs
- [Cilium GitHub](https://github.com/cilium/cilium) — Source code
- [Hubble Documentation](https://docs.cilium.io/en/stable/observability/) — Flow observability
- [Tetragon Documentation](https://tetragon.io/docs/) — Runtime security
- [eBPF.io](https://ebpf.io/) — eBPF technology overview
- [Cilium Network Policy Reference](https://docs.cilium.io/en/stable/security/policy/) — Policy syntax
- [ClusterMesh Documentation](https://docs.cilium.io/en/stable/network/clustermesh/) — Multi-cluster

---

*The mycelium grows through the forest floor. Cilium grows through the kernel.
Together, they create a network that is secure at every layer — from syscall to signal.*

**⚠️ REMINDER: This is a theoretical framework. All claims about network
capabilities are aspirational, not operational.**
