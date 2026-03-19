/**
 * @chicago-forest/cilium-mesh - Hubble Observability Integration
 *
 * Bridges Cilium Hubble's eBPF-powered flow visibility into the
 * mycelium network's MetricsEngine. Hubble captures every packet
 * decision in the kernel — this module translates those flows into
 * forest-meaningful telemetry.
 *
 * Architecture:
 *   Kernel eBPF → Hubble Agent → Hubble Relay → This Module → MetricsEngine
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  HubbleConfig,
  HubbleFlow,
  FlowVerdict,
  FlowExportTarget,
  HubbleMetric,
  ForestFlowMeta,
} from '../types.js';

// =============================================================================
// HUBBLE FLOW COLLECTOR
// =============================================================================

export interface HubbleCollectorConfig {
  /** Hubble Relay gRPC endpoint */
  relayEndpoint: string;

  /** Reconnect interval on disconnect (ms) */
  reconnectInterval: number;

  /** Flow buffer size before flushing to consumers */
  bufferSize: number;

  /** Flow filter — only collect flows matching these criteria */
  filters: HubbleFlowFilter[];

  /** Aggregate flows for forest-level metrics */
  enableAggregation: boolean;

  /** Aggregation window in seconds */
  aggregationWindow: number;
}

export interface HubbleFlowFilter {
  sourceLabels?: Record<string, string>;
  destinationLabels?: Record<string, string>;
  verdicts?: FlowVerdict[];
  protocols?: string[];
  ports?: number[];
}

/** Events emitted by the Hubble collector */
interface HubbleCollectorEvents {
  'flow:received': (flow: HubbleFlow) => void;
  'flow:dropped': (flow: HubbleFlow) => void;
  'flow:policy-denied': (flow: HubbleFlow) => void;
  'metrics:aggregated': (metrics: ForestFlowMetrics) => void;
  'connected': () => void;
  'disconnected': (error?: Error) => void;
  'error': (error: Error) => void;
}

/**
 * Collects Hubble flows and translates them into forest-meaningful events.
 *
 * In production, this would connect to Hubble Relay's gRPC stream.
 * Currently provides the integration interface and local aggregation.
 */
export class HubbleFlowCollector extends EventEmitter<HubbleCollectorEvents> {
  private config: HubbleCollectorConfig;
  private flowBuffer: HubbleFlow[] = [];
  private aggregationTimer: ReturnType<typeof setInterval> | null = null;
  private isConnected = false;

  /** Running flow statistics */
  private stats: FlowStatistics = {
    totalFlows: 0,
    forwardedFlows: 0,
    droppedFlows: 0,
    policyDeniedFlows: 0,
    bytesForwarded: 0,
    bytesDropped: 0,
    flowsPerSecond: 0,
    lastReset: Date.now(),
  };

  constructor(config: Partial<HubbleCollectorConfig> = {}) {
    super();
    this.config = {
      relayEndpoint: config.relayEndpoint ?? 'hubble-relay.kube-system.svc.cluster.local:4245',
      reconnectInterval: config.reconnectInterval ?? 5000,
      bufferSize: config.bufferSize ?? 1000,
      filters: config.filters ?? [],
      enableAggregation: config.enableAggregation ?? true,
      aggregationWindow: config.aggregationWindow ?? 30,
    };
  }

  /** Start collecting flows from Hubble Relay */
  async start(): Promise<void> {
    if (this.isConnected) return;

    // In production: establish gRPC stream to Hubble Relay
    // hubble.Observer.GetFlows({ whitelist: this.buildFilters() })
    this.isConnected = true;
    this.emit('connected');

    if (this.config.enableAggregation) {
      this.aggregationTimer = setInterval(
        () => this.flushAggregation(),
        this.config.aggregationWindow * 1000,
      );
    }
  }

  /** Stop collecting flows */
  async stop(): Promise<void> {
    if (!this.isConnected) return;

    if (this.aggregationTimer) {
      clearInterval(this.aggregationTimer);
      this.aggregationTimer = null;
    }

    this.flushAggregation();
    this.isConnected = false;
    this.emit('disconnected');
  }

  /**
   * Process an incoming Hubble flow.
   * Called by the gRPC stream handler in production,
   * or manually for testing/simulation.
   */
  processFlow(flow: HubbleFlow): void {
    // Annotate with forest metadata
    flow.forestMeta = this.annotateFlow(flow);

    // Update statistics
    this.stats.totalFlows++;
    if (flow.verdict === 'FORWARDED') {
      this.stats.forwardedFlows++;
      this.emit('flow:received', flow);
    } else if (flow.verdict === 'DROPPED') {
      this.stats.droppedFlows++;
      if (flow.dropReason === 'POLICY_DENIED') {
        this.stats.policyDeniedFlows++;
        this.emit('flow:policy-denied', flow);
      }
      this.emit('flow:dropped', flow);
    }

    // Buffer for aggregation
    this.flowBuffer.push(flow);
    if (this.flowBuffer.length >= this.config.bufferSize) {
      this.flushAggregation();
    }
  }

  /** Annotate a raw Hubble flow with forest-specific metadata */
  private annotateFlow(flow: HubbleFlow): ForestFlowMeta {
    const meta: ForestFlowMeta = {};

    // Detect forest zone from pod labels
    const srcLabels = flow.source?.labels ?? [];
    const dstLabels = flow.destination?.labels ?? [];

    const srcZoneLabel = srcLabels.find(l => l.startsWith('chicago-forest.net/zone='));
    const dstZoneLabel = dstLabels.find(l => l.startsWith('chicago-forest.net/zone='));

    if (srcZoneLabel) meta.forestZone = srcZoneLabel.split('=')[1] as ForestFlowMeta['forestZone'];

    // Detect node role
    const roleLabel = srcLabels.find(l => l.startsWith('chicago-forest.net/role='));
    if (roleLabel) meta.nodeRole = roleLabel.split('=')[1];

    // Detect if this is a mycelium signal by port
    if (flow.l4?.udp?.destinationPort === 42001) {
      meta.signalType = 'gossip';
    }

    // Detect nutrient exchange sessions by API path
    if (flow.l7?.http?.url?.includes('/exchange/')) {
      meta.exchangeSessionId = extractExchangeSessionId(flow.l7.http.url);
    }

    return meta;
  }

  /** Flush the flow buffer and emit aggregated metrics */
  private flushAggregation(): void {
    if (this.flowBuffer.length === 0) return;

    const metrics = this.aggregateFlows(this.flowBuffer);
    this.emit('metrics:aggregated', metrics);
    this.flowBuffer = [];
  }

  /** Aggregate raw flows into forest-level metrics */
  private aggregateFlows(flows: HubbleFlow[]): ForestFlowMetrics {
    const now = Date.now();
    const nodeTraffic = new Map<string, NodeTrafficMetrics>();
    const zoneTraffic = new Map<string, ZoneTrafficMetrics>();
    const policyViolations: PolicyViolation[] = [];

    for (const flow of flows) {
      // Per-node aggregation
      const srcPod = flow.source?.podName ?? 'unknown';
      const dstPod = flow.destination?.podName ?? 'unknown';

      updateNodeTraffic(nodeTraffic, srcPod, 'egress', flow);
      updateNodeTraffic(nodeTraffic, dstPod, 'ingress', flow);

      // Per-zone aggregation
      const zone = flow.forestMeta?.forestZone ?? 'unknown';
      updateZoneTraffic(zoneTraffic, zone, flow);

      // Track policy violations
      if (flow.verdict === 'DROPPED' && flow.dropReason === 'POLICY_DENIED') {
        policyViolations.push({
          timestamp: now,
          sourceNode: srcPod,
          destinationNode: dstPod,
          sourceZone: flow.forestMeta?.forestZone,
          port: flow.l4?.tcp?.destinationPort ?? flow.l4?.udp?.destinationPort,
          protocol: flow.l4?.tcp ? 'TCP' : 'UDP',
          reason: flow.dropReason,
        });
      }
    }

    const elapsed = (now - this.stats.lastReset) / 1000;
    this.stats.flowsPerSecond = elapsed > 0 ? this.stats.totalFlows / elapsed : 0;

    return {
      timestamp: now,
      window: this.config.aggregationWindow,
      totalFlows: flows.length,
      nodeTraffic: Object.fromEntries(nodeTraffic),
      zoneTraffic: Object.fromEntries(zoneTraffic),
      policyViolations,
      statistics: { ...this.stats },
    };
  }

  /** Get current flow statistics */
  getStatistics(): FlowStatistics {
    return { ...this.stats };
  }

  /** Reset flow statistics */
  resetStatistics(): void {
    this.stats = {
      totalFlows: 0,
      forwardedFlows: 0,
      droppedFlows: 0,
      policyDeniedFlows: 0,
      bytesForwarded: 0,
      bytesDropped: 0,
      flowsPerSecond: 0,
      lastReset: Date.now(),
    };
  }
}

// =============================================================================
// METRICS TYPES
// =============================================================================

export interface FlowStatistics {
  totalFlows: number;
  forwardedFlows: number;
  droppedFlows: number;
  policyDeniedFlows: number;
  bytesForwarded: number;
  bytesDropped: number;
  flowsPerSecond: number;
  lastReset: number;
}

export interface ForestFlowMetrics {
  timestamp: number;
  window: number;
  totalFlows: number;
  nodeTraffic: Record<string, NodeTrafficMetrics>;
  zoneTraffic: Record<string, ZoneTrafficMetrics>;
  policyViolations: PolicyViolation[];
  statistics: FlowStatistics;
}

export interface NodeTrafficMetrics {
  ingressFlows: number;
  egressFlows: number;
  ingressBytes: number;
  egressBytes: number;
  droppedFlows: number;
  policyDeniedFlows: number;
}

export interface ZoneTrafficMetrics {
  totalFlows: number;
  forwardedFlows: number;
  droppedFlows: number;
  topSources: string[];
  topDestinations: string[];
}

export interface PolicyViolation {
  timestamp: number;
  sourceNode: string;
  destinationNode: string;
  sourceZone?: string;
  port?: number;
  protocol: string;
  reason: string;
}

// =============================================================================
// PROMETHEUS METRICS GENERATOR
// =============================================================================

/** Generate Prometheus metric lines from forest flow metrics */
export function toPrometheusMetrics(metrics: ForestFlowMetrics): string {
  const lines: string[] = [];

  // Global metrics
  lines.push('# HELP forest_cilium_flows_total Total Hubble flows observed');
  lines.push('# TYPE forest_cilium_flows_total counter');
  lines.push(`forest_cilium_flows_total ${metrics.statistics.totalFlows}`);

  lines.push('# HELP forest_cilium_flows_dropped_total Dropped flows');
  lines.push('# TYPE forest_cilium_flows_dropped_total counter');
  lines.push(`forest_cilium_flows_dropped_total ${metrics.statistics.droppedFlows}`);

  lines.push('# HELP forest_cilium_policy_denied_total Policy denied flows');
  lines.push('# TYPE forest_cilium_policy_denied_total counter');
  lines.push(`forest_cilium_policy_denied_total ${metrics.statistics.policyDeniedFlows}`);

  lines.push('# HELP forest_cilium_flows_per_second Current flow rate');
  lines.push('# TYPE forest_cilium_flows_per_second gauge');
  lines.push(`forest_cilium_flows_per_second ${metrics.statistics.flowsPerSecond.toFixed(2)}`);

  // Per-node metrics
  lines.push('# HELP forest_cilium_node_ingress_flows Ingress flows per node');
  lines.push('# TYPE forest_cilium_node_ingress_flows gauge');
  for (const [node, traffic] of Object.entries(metrics.nodeTraffic)) {
    lines.push(`forest_cilium_node_ingress_flows{node="${node}"} ${traffic.ingressFlows}`);
  }

  lines.push('# HELP forest_cilium_node_egress_flows Egress flows per node');
  lines.push('# TYPE forest_cilium_node_egress_flows gauge');
  for (const [node, traffic] of Object.entries(metrics.nodeTraffic)) {
    lines.push(`forest_cilium_node_egress_flows{node="${node}"} ${traffic.egressFlows}`);
  }

  // Per-zone metrics
  lines.push('# HELP forest_cilium_zone_flows Zone traffic flows');
  lines.push('# TYPE forest_cilium_zone_flows gauge');
  for (const [zone, traffic] of Object.entries(metrics.zoneTraffic)) {
    lines.push(`forest_cilium_zone_flows{zone="${zone}",verdict="forwarded"} ${traffic.forwardedFlows}`);
    lines.push(`forest_cilium_zone_flows{zone="${zone}",verdict="dropped"} ${traffic.droppedFlows}`);
  }

  // Policy violations
  lines.push('# HELP forest_cilium_policy_violations Policy violations in current window');
  lines.push('# TYPE forest_cilium_policy_violations gauge');
  lines.push(`forest_cilium_policy_violations ${metrics.policyViolations.length}`);

  return lines.join('\n');
}

// =============================================================================
// HUBBLE CONFIG GENERATOR
// =============================================================================

/** Generate the default Hubble configuration for Chicago Forest */
export function createDefaultHubbleConfig(): HubbleConfig {
  return {
    enabled: true,
    relay: true,
    ui: true,
    metrics: [
      'dns',
      'drop',
      'flow',
      'httpV2',
      'tcp',
      'port-distribution',
      'policy',
    ],
    exportTargets: [
      {
        type: 'prometheus',
        endpoint: 'prometheus.chicago-forest.svc.cluster.local:9090',
      },
      {
        type: 'forest-metrics',
        endpoint: 'canopy-api.chicago-forest.svc.cluster.local:8080/api/v1/metrics/hubble',
      },
    ],
    flowRingBufferSize: 16384,
    forestAnnotations: true,
  };
}

// =============================================================================
// HELPERS
// =============================================================================

function updateNodeTraffic(
  map: Map<string, NodeTrafficMetrics>,
  node: string,
  direction: 'ingress' | 'egress',
  flow: HubbleFlow,
): void {
  if (!map.has(node)) {
    map.set(node, {
      ingressFlows: 0, egressFlows: 0,
      ingressBytes: 0, egressBytes: 0,
      droppedFlows: 0, policyDeniedFlows: 0,
    });
  }
  const metrics = map.get(node)!;
  if (direction === 'ingress') {
    metrics.ingressFlows++;
  } else {
    metrics.egressFlows++;
  }
  if (flow.verdict === 'DROPPED') {
    metrics.droppedFlows++;
    if (flow.dropReason === 'POLICY_DENIED') {
      metrics.policyDeniedFlows++;
    }
  }
}

function updateZoneTraffic(
  map: Map<string, ZoneTrafficMetrics>,
  zone: string,
  flow: HubbleFlow,
): void {
  if (!map.has(zone)) {
    map.set(zone, {
      totalFlows: 0, forwardedFlows: 0, droppedFlows: 0,
      topSources: [], topDestinations: [],
    });
  }
  const metrics = map.get(zone)!;
  metrics.totalFlows++;
  if (flow.verdict === 'FORWARDED') {
    metrics.forwardedFlows++;
  } else if (flow.verdict === 'DROPPED') {
    metrics.droppedFlows++;
  }
}

function extractExchangeSessionId(url: string): string | undefined {
  const match = url.match(/\/exchange\/(?:status|commit|proof)\/([a-f0-9-]+)/);
  return match?.[1];
}
