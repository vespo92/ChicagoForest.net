/**
 * @chicago-forest/cilium-mesh
 *
 * Cilium eBPF integration layer for the Chicago Forest Network.
 *
 * Cilium provides kernel-level networking, security enforcement, and
 * observability by loading eBPF programs directly into the Linux kernel.
 * This package integrates Cilium into the forest ecosystem as the
 * infrastructure substrate beneath the mycelium protocol layer.
 *
 * Architecture Position:
 * ```
 * ┌────────────────────────────────────────────────────────────┐
 * │  MYCELIUM APPLICATION LAYER                                │
 * │  (gossip, nutrient-exchange, hive-mind, spore-propagation) │
 * ├────────────────────────────────────────────────────────────┤
 * │  MNP OVERLAY NETWORK                                       │
 * │  (256-bit addressing, DHT routing, geohash)                │
 * ├────────────────────────────────────────────────────────────┤
 * │  ★ CILIUM eBPF LAYER (this package)                        │
 * │  (L3/L4/L7 policy, Hubble flows, Tetragon security)       │
 * ├────────────────────────────────────────────────────────────┤
 * │  MESH TRANSPORT                                            │
 * │  (B.A.T.M.A.N., WireGuard, Yggdrasil)                    │
 * ├────────────────────────────────────────────────────────────┤
 * │  PHYSICAL LAYER                                            │
 * │  (WiFi, Ethernet, LoRa)                                   │
 * └────────────────────────────────────────────────────────────┘
 * ```
 *
 * Key capabilities:
 * - **Network Policies**: Zero-trust L3/L4/L7 enforcement between forest nodes
 * - **Hubble Observability**: Kernel-level flow visibility for every packet decision
 * - **Tetragon Security**: Runtime enforcement preventing container escapes,
 *   privilege escalation, and unauthorized process execution
 * - **Custom eBPF**: Forest-specific kernel programs for MNP parsing,
 *   zone classification, and gossip deduplication
 * - **ClusterMesh**: Multi-forest connectivity via Cilium's cluster federation
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @see https://github.com/cilium - Cilium project
 * @see https://docs.cilium.io - Cilium documentation
 * @see https://ebpf.io - eBPF technology overview
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  CiliumConfig,
  CiliumStatus,
  CiliumEvent,
  CiliumEventType,
  CiliumNetworkPolicy,
  CiliumHealthStatus,
} from './types.js';
import { generateForestPolicies, type ForestPolicySet } from './policies/index.js';
import { HubbleFlowCollector, createDefaultHubbleConfig } from './hubble/index.js';
import { createDefaultTetragonConfig, generateForestTracingPolicies } from './tetragon/index.js';
import { createDefaultEBPFMapConfig, getForestEBPFPrograms } from './ebpf/index.js';

// =============================================================================
// MAIN CILIUM MESH MANAGER
// =============================================================================

interface CiliumMeshEvents {
  'status:changed': (status: CiliumStatus) => void;
  'policy:applied': (policy: CiliumNetworkPolicy) => void;
  'policy:violated': (event: CiliumEvent) => void;
  'health:changed': (health: CiliumHealthStatus) => void;
  'event': (event: CiliumEvent) => void;
  'error': (error: Error) => void;
}

/**
 * CiliumMeshManager - Central coordinator for Cilium integration.
 *
 * Manages the lifecycle of:
 * - Network policies (zero-trust enforcement)
 * - Hubble flow collection (observability)
 * - Tetragon tracing policies (runtime security)
 * - Custom eBPF programs (forest protocol handling)
 * - ClusterMesh connections (multi-forest)
 */
export class CiliumMeshManager extends EventEmitter<CiliumMeshEvents> {
  private config: CiliumConfig;
  private hubbleCollector: HubbleFlowCollector;
  private policies: ForestPolicySet;
  private isRunning = false;

  constructor(config?: Partial<CiliumConfig>) {
    super();

    this.config = {
      clusterName: config?.clusterName ?? 'chicago-forest',
      clusterId: config?.clusterId ?? 1,
      datapathMode: config?.datapathMode ?? 'veth',
      tunnelProtocol: config?.tunnelProtocol ?? 'vxlan',
      podCIDR: config?.podCIDR ?? '10.42.0.0/16',
      serviceCIDR: config?.serviceCIDR ?? '10.43.0.0/16',
      hubble: config?.hubble ?? createDefaultHubbleConfig(),
      tetragon: config?.tetragon ?? createDefaultTetragonConfig(),
      policyEnforcement: config?.policyEnforcement ?? 'always',
      clusterMesh: config?.clusterMesh ?? {
        enabled: false,
        remoteForests: [],
        serviceAffinity: 'local',
        globalServices: false,
      },
      ebpfMaps: config?.ebpfMaps ?? createDefaultEBPFMapConfig(),
      forestExtensions: config?.forestExtensions ?? {
        zoneIdentityMapping: {
          wan: { ciliumIdentity: 100, labels: { zone: 'wan' }, securityGroup: 'external' },
          lan: { ciliumIdentity: 200, labels: { zone: 'lan' }, securityGroup: 'internal' },
          forest: { ciliumIdentity: 300, labels: { zone: 'forest' }, securityGroup: 'mesh' },
          trusted: { ciliumIdentity: 400, labels: { zone: 'trusted' }, securityGroup: 'privileged' },
        },
        customPrograms: getForestEBPFPrograms(),
        cfwIntegration: {
          enabled: true,
          syncMode: 'cilium-primary',
          syncInterval: 30,
        },
        mnpAwareness: {
          enabled: true,
          parseHeaders: true,
          routeByGeohash: true,
        },
      },
    };

    // Initialize subsystems
    this.policies = generateForestPolicies();
    this.hubbleCollector = new HubbleFlowCollector({
      relayEndpoint: 'hubble-relay.kube-system.svc.cluster.local:4245',
      enableAggregation: true,
      aggregationWindow: 30,
    });

    // Wire up Hubble events to manager
    this.hubbleCollector.on('flow:policy-denied', (flow) => {
      this.emit('policy:violated', {
        type: 'policy:violated',
        timestamp: Date.now(),
        details: {
          source: flow.source?.podName,
          destination: flow.destination?.podName,
          reason: flow.dropReason,
          forestZone: flow.forestMeta?.forestZone,
        },
      });
    });

    this.hubbleCollector.on('metrics:aggregated', (metrics) => {
      this.emit('event', {
        type: 'flow:forwarded',
        timestamp: Date.now(),
        details: {
          totalFlows: metrics.totalFlows,
          policyViolations: metrics.policyViolations.length,
          flowsPerSecond: metrics.statistics.flowsPerSecond,
        },
      });
    });
  }

  /** Start the Cilium mesh manager */
  async start(): Promise<void> {
    if (this.isRunning) return;

    // In production, these would:
    // 1. Apply CiliumNetworkPolicies via kubectl/API
    // 2. Connect to Hubble Relay gRPC stream
    // 3. Apply Tetragon TracingPolicies
    // 4. Load custom eBPF programs

    await this.hubbleCollector.start();
    this.isRunning = true;

    this.emit('status:changed', this.getStatus());
    this.emit('health:changed', 'ok');
  }

  /** Stop the Cilium mesh manager */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    await this.hubbleCollector.stop();
    this.isRunning = false;

    this.emit('health:changed', 'unknown');
  }

  /** Get current Cilium status */
  getStatus(): CiliumStatus {
    const hubbleStats = this.hubbleCollector.getStatistics();
    return {
      clusterName: this.config.clusterName,
      nodeCount: 0,     // Populated from Cilium API in production
      endpointCount: 0,
      identityCount: Object.keys(this.config.forestExtensions.zoneIdentityMapping).length,
      policyCount: Object.keys(this.policies).length,
      hubbleFlowsPerSecond: hubbleStats.flowsPerSecond,
      tetragonEventsPerSecond: 0,
      ebpfProgramsLoaded: this.config.forestExtensions.customPrograms.length,
      health: this.isRunning ? 'ok' : 'unknown',
    };
  }

  /** Get all network policies */
  getPolicies(): ForestPolicySet {
    return this.policies;
  }

  /** Get the Hubble flow collector instance */
  getHubbleCollector(): HubbleFlowCollector {
    return this.hubbleCollector;
  }

  /** Get the full Cilium configuration */
  getConfig(): CiliumConfig {
    return structuredClone(this.config);
  }

  /** Generate Helm values for Cilium installation */
  generateHelmValues(): Record<string, unknown> {
    return {
      cluster: {
        name: this.config.clusterName,
        id: this.config.clusterId,
      },
      ipam: {
        mode: 'kubernetes',
        operator: {
          clusterPoolIPv4PodCIDRList: [this.config.podCIDR],
        },
      },
      tunnel: this.config.tunnelProtocol,
      policyEnforcementMode: this.config.policyEnforcement,
      hubble: {
        enabled: this.config.hubble.enabled,
        relay: { enabled: this.config.hubble.relay },
        ui: { enabled: this.config.hubble.ui },
        metrics: {
          enabled: this.config.hubble.metrics,
        },
      },
      tetragon: {
        enabled: this.config.tetragon.enabled,
      },
      bpf: {
        mapDynamic: {
          configs: this.config.ebpfMaps.forestMaps.reduce(
            (acc, map) => {
              acc[map.name] = { max_entries: map.maxEntries };
              return acc;
            },
            {} as Record<string, { max_entries: number }>,
          ),
        },
        ctTcpMax: this.config.ebpfMaps.ctTableSize,
        ctAnyMax: this.config.ebpfMaps.ctTableSize,
        natMax: this.config.ebpfMaps.natTableSize,
        policyMapMax: this.config.ebpfMaps.policyMapSize,
        neighMax: this.config.ebpfMaps.neighTableSize,
      },
      clustermesh: {
        useAPIServer: this.config.clusterMesh.enabled,
        config: {
          enabled: this.config.clusterMesh.enabled,
        },
      },
    };
  }
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Types
export type {
  CiliumConfig,
  CiliumStatus,
  CiliumEvent,
  CiliumEventType,
  CiliumNetworkPolicy,
  CiliumHealthStatus,
  HubbleConfig,
  HubbleFlow,
  TetragonConfig,
  TracingPolicy,
  ForestEBPFProgram,
  ForestEBPFMap,
  ClusterMeshConfig,
  ForestCiliumExtensions,
} from './types.js';

// Policies
export {
  CiliumPolicyBuilder,
  generateForestPolicies,
  serializePolicies,
  createDefaultDenyPolicy,
  createP2PMeshPolicy,
  createWireGuardPolicy,
  createCanopyAPIPolicy,
  createControlPlanePolicy,
  createRegistryPolicy,
  createMonitoringPolicy,
  createGatewayPolicy,
  createClusterMeshPolicy,
  createDNSPolicy,
  createNutrientExchangePolicy,
  FOREST_LABELS,
} from './policies/index.js';
export type { ForestPolicySet, ForestNodeRole, TrustLevel } from './policies/index.js';

// Hubble
export {
  HubbleFlowCollector,
  createDefaultHubbleConfig,
  toPrometheusMetrics,
} from './hubble/index.js';
export type {
  HubbleCollectorConfig,
  ForestFlowMetrics,
  NodeTrafficMetrics,
  FlowStatistics,
  PolicyViolation,
} from './hubble/index.js';

// Tetragon
export {
  TracingPolicyBuilder,
  generateForestTracingPolicies,
  createDefaultTetragonConfig,
  createProcessExecutionPolicy,
  createPrivilegeEscalationPolicy,
  createSensitiveFileAccessPolicy,
  createContainerEscapePolicy,
  createNetworkConnectionPolicy,
  createCryptoProtectionPolicy,
} from './tetragon/index.js';
export type { ForestTracingPolicySet } from './tetragon/index.js';

// eBPF
export {
  getForestEBPFMaps,
  getForestEBPFPrograms,
  createDefaultEBPFMapConfig,
  MNP_XDP_PARSER,
  ZONE_CLASSIFIER,
  GOSSIP_FAST_PATH,
  SOCK_OPS_OPTIMIZER,
  MNP_GEOHASH_ROUTE_MAP,
  NODE_ZONE_MAP,
  EXCHANGE_RATE_MAP,
  FOREST_EVENT_RINGBUF,
  SIGNAL_DEDUP_MAP,
} from './ebpf/index.js';
