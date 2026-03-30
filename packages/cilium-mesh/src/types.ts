/**
 * @chicago-forest/cilium-mesh - Type Definitions
 *
 * Types for Cilium eBPF integration with the Chicago Forest Network.
 * Cilium provides kernel-level networking, security enforcement, and
 * observability via eBPF programs loaded directly into the Linux kernel.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type { NodeId, FirewallZone } from '@chicago-forest/shared-types';

// =============================================================================
// CILIUM CONFIGURATION
// =============================================================================

/** Top-level Cilium integration configuration */
export interface CiliumConfig {
  /** Cilium cluster name */
  clusterName: string;

  /** Cilium cluster ID (1-255 for ClusterMesh) */
  clusterId: number;

  /** eBPF datapath mode */
  datapathMode: DatapathMode;

  /** Tunnel protocol for overlay networking */
  tunnelProtocol: TunnelProtocol;

  /** Pod CIDR for Cilium IPAM */
  podCIDR: string;

  /** Service CIDR for Cilium */
  serviceCIDR: string;

  /** Enable Hubble observability */
  hubble: HubbleConfig;

  /** Enable Tetragon runtime security */
  tetragon: TetragonConfig;

  /** Network policy enforcement mode */
  policyEnforcement: PolicyEnforcementMode;

  /** Enable ClusterMesh for multi-forest connectivity */
  clusterMesh: ClusterMeshConfig;

  /** eBPF map configuration */
  ebpfMaps: EBPFMapConfig;

  /** Forest-specific Cilium extensions */
  forestExtensions: ForestCiliumExtensions;
}

export type DatapathMode =
  | 'veth'           // Standard veth pair (default)
  | 'ipvlan'         // IPvlan for lower overhead
  | 'native-routing'; // Direct routing without overlay

export type TunnelProtocol =
  | 'vxlan'    // VXLAN encapsulation (default)
  | 'geneve'   // Generic Network Virtualization Encapsulation
  | 'disabled'; // No tunnel (native routing)

export type PolicyEnforcementMode =
  | 'default'       // Enforce when policies exist
  | 'always'        // Always enforce (zero-trust)
  | 'never';        // Disable enforcement

// =============================================================================
// CILIUM NETWORK POLICY
// =============================================================================

/** Cilium Network Policy - L3/L4/L7 enforcement */
export interface CiliumNetworkPolicy {
  apiVersion: 'cilium.io/v2';
  kind: 'CiliumNetworkPolicy' | 'CiliumClusterwideNetworkPolicy';
  metadata: PolicyMetadata;
  spec: PolicySpec;
}

export interface PolicyMetadata {
  name: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

export interface PolicySpec {
  /** Endpoint selector (which pods this applies to) */
  endpointSelector?: EndpointSelector;

  /** Node selector (which nodes this applies to) */
  nodeSelector?: EndpointSelector;

  /** Ingress rules */
  ingress?: IngressRule[];

  /** Egress rules */
  egress?: EgressRule[];

  /** Ingress deny rules (higher priority than allow) */
  ingressDeny?: IngressRule[];

  /** Egress deny rules (higher priority than allow) */
  egressDeny?: EgressRule[];
}

export interface EndpointSelector {
  matchLabels?: Record<string, string>;
  matchExpressions?: LabelSelectorRequirement[];
}

export interface LabelSelectorRequirement {
  key: string;
  operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist';
  values?: string[];
}

export interface IngressRule {
  fromEndpoints?: EndpointSelector[];
  fromCIDR?: string[];
  fromCIDRSet?: CIDRRule[];
  fromEntities?: CiliumEntity[];
  toPorts?: PortRule[];
}

export interface EgressRule {
  toEndpoints?: EndpointSelector[];
  toCIDR?: string[];
  toCIDRSet?: CIDRRule[];
  toEntities?: CiliumEntity[];
  toServices?: ServiceReference[];
  toPorts?: PortRule[];
  toFQDNs?: FQDNRule[];
}

export interface CIDRRule {
  cidr: string;
  except?: string[];
}

/** Cilium identity entities */
export type CiliumEntity =
  | 'host'           // Local host
  | 'remote-node'    // Remote cluster nodes
  | 'world'          // Everything outside cluster
  | 'all'            // All identities
  | 'cluster'        // All cluster identities
  | 'init'           // Init identity
  | 'kube-apiserver'; // Kubernetes API server

export interface PortRule {
  ports: PortProtocol[];
  rules?: L7Rules;
}

export interface PortProtocol {
  port: string;
  protocol: 'TCP' | 'UDP' | 'SCTP' | 'ICMP' | 'ICMPv6' | 'ANY';
}

/** L7 protocol-aware rules */
export interface L7Rules {
  http?: HTTPRule[];
  kafka?: KafkaRule[];
  dns?: DNSRule[];
}

export interface HTTPRule {
  method?: string;
  path?: string;
  host?: string;
  headers?: string[];
}

export interface KafkaRule {
  apiKey?: string;
  apiVersion?: string;
  clientID?: string;
  topic?: string;
}

export interface DNSRule {
  matchName?: string;
  matchPattern?: string;
}

export interface ServiceReference {
  k8sService?: string;
  k8sServiceNamespace?: string;
}

export interface FQDNRule {
  matchName?: string;
  matchPattern?: string;
}

// =============================================================================
// HUBBLE OBSERVABILITY
// =============================================================================

export interface HubbleConfig {
  enabled: boolean;

  /** Enable Hubble Relay for cluster-wide visibility */
  relay: boolean;

  /** Enable Hubble UI */
  ui: boolean;

  /** Metrics to export to Prometheus */
  metrics: HubbleMetric[];

  /** Flow export targets */
  exportTargets: FlowExportTarget[];

  /** Retention settings */
  flowRingBufferSize: number;

  /** Forest-specific flow annotations */
  forestAnnotations: boolean;
}

export type HubbleMetric =
  | 'dns'
  | 'drop'
  | 'flow'
  | 'httpV2'
  | 'icmp'
  | 'port-distribution'
  | 'tcp'
  | 'policy';

export interface FlowExportTarget {
  type: 'prometheus' | 'opentelemetry' | 'syslog' | 'forest-metrics';
  endpoint: string;
  config?: Record<string, string>;
}

/** Hubble flow observation */
export interface HubbleFlow {
  time: string;
  verdict: FlowVerdict;
  dropReason?: DropReason;
  ethernet?: EthernetInfo;
  ip?: IPInfo;
  l4?: L4Info;
  l7?: L7Info;
  source?: FlowEndpoint;
  destination?: FlowEndpoint;
  type: FlowType;
  nodeName: string;
  summary: string;

  /** Forest-specific annotations */
  forestMeta?: ForestFlowMeta;
}

export type FlowVerdict = 'FORWARDED' | 'DROPPED' | 'AUDIT' | 'REDIRECTED' | 'ERROR' | 'TRACED';
export type FlowType = 'L3_L4' | 'L7' | 'TRACE' | 'DROP' | 'POLICY_VERDICT';

export type DropReason =
  | 'POLICY_DENIED'
  | 'INVALID_SOURCE_MAC'
  | 'INVALID_DESTINATION_MAC'
  | 'MISSING_CT_ENTRY'
  | 'STALE_CT_ENTRY'
  | 'UNSUPPORTED_L3_PROTOCOL'
  | 'NO_MAPPING'
  | 'CT_TRUNCATED_OR_INVALID_HEADER';

export interface EthernetInfo {
  source: string;
  destination: string;
}

export interface IPInfo {
  source: string;
  destination: string;
  ipVersion: 'IPv4' | 'IPv6';
}

export interface L4Info {
  tcp?: { sourcePort: number; destinationPort: number; flags: string };
  udp?: { sourcePort: number; destinationPort: number };
  icmpv4?: { type: number; code: number };
}

export interface L7Info {
  type: 'REQUEST' | 'RESPONSE';
  http?: { code: number; method: string; url: string; headers: Record<string, string> };
  dns?: { query: string; rcode: number; qtypes: string[] };
  kafka?: { apiKey: string; apiVersion: number; topic: string };
}

export interface FlowEndpoint {
  id: number;
  identity: number;
  namespace: string;
  labels: string[];
  podName: string;
}

/** Forest-specific flow metadata */
export interface ForestFlowMeta {
  /** MNP address if applicable */
  mnpSource?: string;
  mnpDestination?: string;

  /** Mycelium signal type if this is a signal propagation */
  signalType?: string;

  /** Forest zone classification */
  forestZone?: FirewallZone;

  /** Node role in the mycelium topology */
  nodeRole?: string;

  /** Nutrient exchange session ID */
  exchangeSessionId?: string;
}

// =============================================================================
// TETRAGON RUNTIME SECURITY
// =============================================================================

export interface TetragonConfig {
  enabled: boolean;

  /** Tracing policies to enforce */
  tracingPolicies: TracingPolicy[];

  /** Export targets for security events */
  exportTargets: SecurityExportTarget[];

  /** Forest-specific runtime protections */
  forestProtections: ForestRuntimeProtection[];
}

/** Tetragon tracing policy */
export interface TracingPolicy {
  apiVersion: 'cilium.io/v1alpha1';
  kind: 'TracingPolicy' | 'TracingPolicyNamespaced';
  metadata: PolicyMetadata;
  spec: TracingPolicySpec;
}

export interface TracingPolicySpec {
  /** Kprobes to hook */
  kprobes?: KprobeSpec[];

  /** Tracepoints to hook */
  tracepoints?: TracepointSpec[];

  /** uprobes to hook */
  uprobes?: UprobeSpec[];
}

export interface KprobeSpec {
  call: string;
  syscall: boolean;
  return?: boolean;
  args?: ArgSpec[];
  returnArg?: ArgSpec;
  selectors?: EventSelector[];
}

export interface TracepointSpec {
  subsystem: string;
  event: string;
  args?: ArgSpec[];
  selectors?: EventSelector[];
}

export interface UprobeSpec {
  path: string;
  symbol: string;
  args?: ArgSpec[];
  selectors?: EventSelector[];
}

export interface ArgSpec {
  index: number;
  type: 'int' | 'uint64' | 'size_t' | 'string' | 'fd' | 'file' | 'filename' | 'nop' | 'char_buf' | 'char_iovec' | 'sock' | 'skb';
  sizeArgIndex?: number;
  returnCopy?: boolean;
}

export interface EventSelector {
  matchPIDs?: PIDSelector[];
  matchNamespaces?: NamespaceSelector[];
  matchCapabilities?: CapabilitySelector[];
  matchArgs?: ArgSelector[];
  matchActions?: ActionSelector[];
  matchBinaries?: BinarySelector[];
}

export interface PIDSelector {
  operator: 'In' | 'NotIn';
  values: number[];
}

export interface NamespaceSelector {
  namespace: string;
  operator: 'In' | 'NotIn';
  values: string[];
}

export interface CapabilitySelector {
  type: 'Effective' | 'Inheritable' | 'Permitted';
  operator: 'In' | 'NotIn';
  values: string[];
}

export interface ArgSelector {
  index: number;
  operator: 'Equal' | 'NotEqual' | 'Prefix' | 'Postfix' | 'Mask';
  values: string[];
}

export interface ActionSelector {
  action: 'Sigkill' | 'Signal' | 'Override' | 'FollowFD' | 'UnfollowFD' | 'CopyFD' | 'Post' | 'NoPost';
  argSig?: number;
  argError?: number;
}

export interface BinarySelector {
  operator: 'In' | 'NotIn';
  values: string[];
}

export interface SecurityExportTarget {
  type: 'prometheus' | 'json' | 'forest-sentinel';
  endpoint: string;
}

/** Forest-specific runtime protection */
export interface ForestRuntimeProtection {
  name: string;
  description: string;
  category: 'process' | 'network' | 'file' | 'privilege';
  action: 'audit' | 'enforce';
  tracingPolicy: TracingPolicy;
}

// =============================================================================
// CLUSTERMESH (Multi-Forest Connectivity)
// =============================================================================

export interface ClusterMeshConfig {
  enabled: boolean;

  /** Remote forests to connect to */
  remoteForests: RemoteForestConfig[];

  /** Service affinity mode */
  serviceAffinity: 'local' | 'remote' | 'none';

  /** Enable global services across forests */
  globalServices: boolean;
}

export interface RemoteForestConfig {
  name: string;
  clusterId: number;
  endpoints: string[];
  caCert?: string;
  clientCert?: string;
  clientKey?: string;
}

// =============================================================================
// EBPF MAP CONFIGURATION
// =============================================================================

export interface EBPFMapConfig {
  /** Connection tracking table size */
  ctTableSize: number;

  /** NAT table size */
  natTableSize: number;

  /** Policy map size */
  policyMapSize: number;

  /** Neighbor table size */
  neighTableSize: number;

  /** Custom forest maps */
  forestMaps: ForestEBPFMap[];
}

export interface ForestEBPFMap {
  name: string;
  type: 'hash' | 'lru_hash' | 'array' | 'lpm_trie' | 'ringbuf';
  keySize: number;
  valueSize: number;
  maxEntries: number;
  description: string;
}

// =============================================================================
// FOREST-SPECIFIC EXTENSIONS
// =============================================================================

export interface ForestCiliumExtensions {
  /** Map mycelium zones to Cilium identities */
  zoneIdentityMapping: ZoneIdentityMapping;

  /** Custom eBPF programs for forest protocols */
  customPrograms: ForestEBPFProgram[];

  /** Integration with Chicago Forest Firewall */
  cfwIntegration: CFWIntegrationConfig;

  /** MNP protocol awareness */
  mnpAwareness: MNPAwarenessConfig;
}

export interface ZoneIdentityMapping {
  [zone: string]: {
    ciliumIdentity: number;
    labels: Record<string, string>;
    securityGroup: string;
  };
}

export interface ForestEBPFProgram {
  name: string;
  attachPoint: 'tc-ingress' | 'tc-egress' | 'xdp' | 'cgroup-skb' | 'sock-ops';
  description: string;
  source: string;
}

export interface CFWIntegrationConfig {
  enabled: boolean;
  syncMode: 'cilium-primary' | 'cfw-primary' | 'bidirectional';
  syncInterval: number;
}

export interface MNPAwarenessConfig {
  enabled: boolean;
  parseHeaders: boolean;
  routeByGeohash: boolean;
}

// =============================================================================
// CILIUM STATUS & EVENTS
// =============================================================================

export interface CiliumStatus {
  clusterName: string;
  nodeCount: number;
  endpointCount: number;
  identityCount: number;
  policyCount: number;
  hubbleFlowsPerSecond: number;
  tetragonEventsPerSecond: number;
  ebpfProgramsLoaded: number;
  health: CiliumHealthStatus;
}

export type CiliumHealthStatus = 'ok' | 'degraded' | 'error' | 'unknown';

export type CiliumEventType =
  | 'policy:applied'
  | 'policy:violated'
  | 'flow:dropped'
  | 'flow:forwarded'
  | 'endpoint:created'
  | 'endpoint:deleted'
  | 'identity:created'
  | 'identity:deleted'
  | 'clustermesh:connected'
  | 'clustermesh:disconnected'
  | 'tetragon:alert'
  | 'tetragon:enforcement'
  | 'forest:zone-violation'
  | 'forest:mnp-routed';

export interface CiliumEvent {
  type: CiliumEventType;
  timestamp: number;
  nodeId?: NodeId;
  details: Record<string, unknown>;
}
