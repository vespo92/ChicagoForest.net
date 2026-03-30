/**
 * @chicago-forest/cilium-mesh - Network Policy Generator
 *
 * Generates Cilium Network Policies that enforce zero-trust security
 * between forest nodes. These policies operate at the kernel level via
 * eBPF, providing L3/L4/L7 enforcement without proxies.
 *
 * Policy Hierarchy:
 *   1. Cluster-wide deny rules (highest priority)
 *   2. Namespace-scoped allow rules
 *   3. Pod-level fine-grained rules
 *   4. Default deny-all (zero-trust baseline)
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type {
  CiliumNetworkPolicy,
  EndpointSelector,
  IngressRule,
  EgressRule,
  PortRule,
  HTTPRule,
} from '../types.js';

// =============================================================================
// FOREST NODE LABELS
// =============================================================================

/** Standard labels applied to all forest node pods */
export const FOREST_LABELS = {
  APP: 'app.kubernetes.io/name',
  COMPONENT: 'app.kubernetes.io/component',
  ZONE: 'chicago-forest.net/zone',
  ROLE: 'chicago-forest.net/role',
  TRUST_LEVEL: 'chicago-forest.net/trust-level',
  CLUSTER: 'chicago-forest.net/cluster',
} as const;

/** Forest node roles for policy targeting */
export type ForestNodeRole =
  | 'forest-node'
  | 'forest-gateway'
  | 'control-plane'
  | 'canopy-api'
  | 'registry'
  | 'monitoring'
  | 'bootstrap';

/** Trust levels for graduated access */
export type TrustLevel = 'untrusted' | 'verified' | 'trusted' | 'privileged';

// =============================================================================
// POLICY BUILDER
// =============================================================================

/** Fluent builder for CiliumNetworkPolicy objects */
export class CiliumPolicyBuilder {
  private policy: CiliumNetworkPolicy;

  constructor(name: string, namespace = 'chicago-forest') {
    this.policy = {
      apiVersion: 'cilium.io/v2',
      kind: 'CiliumNetworkPolicy',
      metadata: {
        name,
        namespace,
        labels: {
          'app.kubernetes.io/part-of': 'chicago-forest',
          'chicago-forest.net/policy-generator': 'cilium-mesh',
        },
      },
      spec: {},
    };
  }

  /** Make this a cluster-wide policy */
  clusterWide(): this {
    this.policy.kind = 'CiliumClusterwideNetworkPolicy';
    delete this.policy.metadata.namespace;
    return this;
  }

  /** Select endpoints this policy applies to */
  selectEndpoints(labels: Record<string, string>): this {
    this.policy.spec.endpointSelector = { matchLabels: labels };
    return this;
  }

  /** Select by forest role */
  selectRole(role: ForestNodeRole): this {
    return this.selectEndpoints({ [FOREST_LABELS.COMPONENT]: role });
  }

  /** Add ingress allow rule */
  allowIngress(rule: IngressRule): this {
    if (!this.policy.spec.ingress) this.policy.spec.ingress = [];
    this.policy.spec.ingress.push(rule);
    return this;
  }

  /** Add egress allow rule */
  allowEgress(rule: EgressRule): this {
    if (!this.policy.spec.egress) this.policy.spec.egress = [];
    this.policy.spec.egress.push(rule);
    return this;
  }

  /** Add ingress deny rule */
  denyIngress(rule: IngressRule): this {
    if (!this.policy.spec.ingressDeny) this.policy.spec.ingressDeny = [];
    this.policy.spec.ingressDeny.push(rule);
    return this;
  }

  /** Add egress deny rule */
  denyEgress(rule: EgressRule): this {
    if (!this.policy.spec.egressDeny) this.policy.spec.egressDeny = [];
    this.policy.spec.egressDeny.push(rule);
    return this;
  }

  /** Build the final policy */
  build(): CiliumNetworkPolicy {
    return structuredClone(this.policy);
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function fromForestPods(role?: ForestNodeRole): EndpointSelector[] {
  const labels: Record<string, string> = {
    'app.kubernetes.io/part-of': 'chicago-forest',
  };
  if (role) labels[FOREST_LABELS.COMPONENT] = role;
  return [{ matchLabels: labels }];
}

function ports(...specs: Array<{ port: string; protocol?: 'TCP' | 'UDP' }>): PortRule[] {
  return [{
    ports: specs.map(s => ({
      port: s.port,
      protocol: s.protocol ?? 'TCP',
    })),
  }];
}

function portsWithHTTP(
  port: string,
  httpRules: HTTPRule[]
): PortRule[] {
  return [{
    ports: [{ port, protocol: 'TCP' as const }],
    rules: { http: httpRules },
  }];
}

// =============================================================================
// CORE FOREST POLICIES
// =============================================================================

/**
 * Default deny-all policy — zero-trust baseline.
 * All traffic is denied unless explicitly allowed by other policies.
 */
export function createDefaultDenyPolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-default-deny')
    .selectEndpoints({
      'app.kubernetes.io/part-of': 'chicago-forest',
    })
    .build();
  // Empty ingress/egress = deny all
}

/**
 * Allow P2P mesh traffic between forest nodes.
 * Port 42000/UDP for mycelium protocol, 42001/UDP for gossip protocol.
 */
export function createP2PMeshPolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-p2p-mesh')
    .selectRole('forest-node')
    .allowIngress({
      fromEndpoints: fromForestPods('forest-node'),
      toPorts: ports(
        { port: '42000', protocol: 'UDP' },  // MNP P2P
        { port: '42001', protocol: 'UDP' },  // Gossip/Signal propagation
      ),
    })
    .allowEgress({
      toEndpoints: fromForestPods('forest-node'),
      toPorts: ports(
        { port: '42000', protocol: 'UDP' },
        { port: '42001', protocol: 'UDP' },
      ),
    })
    .build();
}

/**
 * WireGuard tunnel policy — allow encrypted overlay traffic.
 */
export function createWireGuardPolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-wireguard')
    .selectRole('forest-node')
    .allowIngress({
      fromEndpoints: fromForestPods(),
      toPorts: ports({ port: '51820', protocol: 'UDP' }),
    })
    .allowEgress({
      toEndpoints: fromForestPods(),
      toPorts: ports({ port: '51820', protocol: 'UDP' }),
    })
    .build();
}

/**
 * Canopy API policy — L7-aware HTTP policy for the public API.
 * Enforces path-based access control at the kernel level.
 */
export function createCanopyAPIPolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-canopy-api')
    .selectRole('canopy-api')
    .allowIngress({
      // Allow external world to hit specific API paths only
      fromEntities: ['world'],
      toPorts: portsWithHTTP('8080', [
        { method: 'GET', path: '/api/v1/status' },
        { method: 'GET', path: '/api/v1/network/topology' },
        { method: 'GET', path: '/api/v1/network/health' },
        { method: 'GET', path: '/api/v1/registry/.*' },
        { method: 'GET', path: '/health' },
        { method: 'GET', path: '/ready' },
      ]),
    })
    .allowIngress({
      // Forest nodes can hit all API endpoints
      fromEndpoints: fromForestPods(),
      toPorts: portsWithHTTP('8080', [
        { method: 'GET', path: '/api/v1/.*' },
        { method: 'POST', path: '/api/v1/.*' },
        { method: 'PUT', path: '/api/v1/.*' },
        { method: 'DELETE', path: '/api/v1/.*' },
      ]),
    })
    .allowEgress({
      // API can talk to forest nodes for data
      toEndpoints: fromForestPods('forest-node'),
      toPorts: ports(
        { port: '8080' },
        { port: '9090' },
      ),
    })
    .build();
}

/**
 * Control plane policy — restricts access to cluster management.
 */
export function createControlPlanePolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-control-plane')
    .selectRole('control-plane')
    .allowIngress({
      // Only privileged forest nodes and monitoring can reach control plane
      fromEndpoints: [{
        matchLabels: {
          [FOREST_LABELS.TRUST_LEVEL]: 'privileged',
        },
      }],
      toPorts: ports({ port: '8090' }),
    })
    .allowIngress({
      // Monitoring can scrape metrics
      fromEndpoints: fromForestPods('monitoring'),
      toPorts: ports({ port: '9090' }),
    })
    .allowEgress({
      // Control plane can talk to the Kubernetes API
      toEntities: ['kube-apiserver'],
      toPorts: ports({ port: '443' }),
    })
    .allowEgress({
      // Control plane can coordinate all forest nodes
      toEndpoints: fromForestPods(),
      toPorts: ports({ port: '8080' }),
    })
    .build();
}

/**
 * Forest registry (decentralized DNS) policy.
 */
export function createRegistryPolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-registry')
    .selectRole('registry')
    .allowIngress({
      // All forest pods can query the registry
      fromEndpoints: fromForestPods(),
      toPorts: ports(
        { port: '8053', protocol: 'UDP' },  // DNS-like resolution
        { port: '8053', protocol: 'TCP' },
        { port: '8080' },                   // REST API
      ),
    })
    .allowEgress({
      // Registry syncs with other registries
      toEndpoints: fromForestPods('registry'),
      toPorts: ports(
        { port: '8053', protocol: 'UDP' },
        { port: '8053', protocol: 'TCP' },
        { port: '8080' },
      ),
    })
    .build();
}

/**
 * Monitoring stack policy — Prometheus/Grafana/Hubble access.
 */
export function createMonitoringPolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-monitoring')
    .selectRole('monitoring')
    .allowIngress({
      // Grafana UI access from LAN
      fromCIDR: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
      toPorts: ports({ port: '3000' }),
    })
    .allowEgress({
      // Prometheus scrapes all forest node metrics
      toEndpoints: fromForestPods(),
      toPorts: ports({ port: '9090' }),
    })
    .allowEgress({
      // Hubble Relay for flow data
      toEndpoints: [{
        matchLabels: { 'k8s-app': 'hubble-relay' },
      }],
      toPorts: ports({ port: '4245' }),
    })
    .build();
}

/**
 * Gateway policy — nodes that bridge to external networks/internet.
 */
export function createGatewayPolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-gateway')
    .selectRole('forest-gateway')
    .allowIngress({
      // Forest nodes can route through gateways
      fromEndpoints: fromForestPods('forest-node'),
      toPorts: ports(
        { port: '42000', protocol: 'UDP' },
        { port: '51820', protocol: 'UDP' },
        { port: '8080' },
      ),
    })
    .allowEgress({
      // Gateways can reach the internet
      toEntities: ['world'],
      toPorts: ports(
        { port: '443' },
        { port: '80' },
        { port: '53', protocol: 'UDP' },
      ),
    })
    .allowEgress({
      // Gateways talk to forest nodes
      toEndpoints: fromForestPods('forest-node'),
      toPorts: ports(
        { port: '42000', protocol: 'UDP' },
        { port: '8080' },
      ),
    })
    .build();
}

/**
 * Inter-forest ClusterMesh policy — for symbiosis layer connections.
 */
export function createClusterMeshPolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-clustermesh')
    .clusterWide()
    .selectEndpoints({
      'app.kubernetes.io/part-of': 'chicago-forest',
      [FOREST_LABELS.COMPONENT]: 'forest-gateway',
    })
    .allowIngress({
      // Accept traffic from remote forest clusters
      fromEntities: ['remote-node'],
      toPorts: ports(
        { port: '42000', protocol: 'UDP' },
        { port: '2379' },  // etcd for ClusterMesh sync
      ),
    })
    .allowEgress({
      toEntities: ['remote-node'],
      toPorts: ports(
        { port: '42000', protocol: 'UDP' },
        { port: '2379' },
      ),
    })
    .build();
}

/**
 * DNS egress policy — allow forest nodes to resolve DNS.
 */
export function createDNSPolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-dns-egress')
    .selectEndpoints({
      'app.kubernetes.io/part-of': 'chicago-forest',
    })
    .allowEgress({
      toEntities: ['cluster'],
      toPorts: [{
        ports: [
          { port: '53', protocol: 'UDP' },
          { port: '53', protocol: 'TCP' },
        ],
        rules: {
          dns: [
            { matchPattern: '*.chicago-forest.svc.cluster.local' },
            { matchPattern: '*.forest.net' },
            { matchName: 'kubernetes.default.svc.cluster.local' },
          ],
        },
      }],
    })
    .build();
}

/**
 * Nutrient exchange policy — resource sharing between nodes.
 * Uses L7 HTTP rules to restrict exchange API endpoints.
 */
export function createNutrientExchangePolicy(): CiliumNetworkPolicy {
  return new CiliumPolicyBuilder('forest-nutrient-exchange')
    .selectRole('forest-node')
    .allowIngress({
      fromEndpoints: [{
        matchLabels: {
          [FOREST_LABELS.TRUST_LEVEL]: 'verified',
        },
      }],
      toPorts: portsWithHTTP('8080', [
        { method: 'POST', path: '/api/v1/exchange/negotiate' },
        { method: 'POST', path: '/api/v1/exchange/commit' },
        { method: 'GET', path: '/api/v1/exchange/status/.*' },
        { method: 'POST', path: '/api/v1/exchange/proof' },
      ]),
    })
    .build();
}

// =============================================================================
// POLICY SET GENERATOR
// =============================================================================

/** All forest policies as a complete set */
export interface ForestPolicySet {
  defaultDeny: CiliumNetworkPolicy;
  p2pMesh: CiliumNetworkPolicy;
  wireGuard: CiliumNetworkPolicy;
  canopyApi: CiliumNetworkPolicy;
  controlPlane: CiliumNetworkPolicy;
  registry: CiliumNetworkPolicy;
  monitoring: CiliumNetworkPolicy;
  gateway: CiliumNetworkPolicy;
  clusterMesh: CiliumNetworkPolicy;
  dns: CiliumNetworkPolicy;
  nutrientExchange: CiliumNetworkPolicy;
}

/** Generate the complete forest network policy set */
export function generateForestPolicies(): ForestPolicySet {
  return {
    defaultDeny: createDefaultDenyPolicy(),
    p2pMesh: createP2PMeshPolicy(),
    wireGuard: createWireGuardPolicy(),
    canopyApi: createCanopyAPIPolicy(),
    controlPlane: createControlPlanePolicy(),
    registry: createRegistryPolicy(),
    monitoring: createMonitoringPolicy(),
    gateway: createGatewayPolicy(),
    clusterMesh: createClusterMeshPolicy(),
    dns: createDNSPolicy(),
    nutrientExchange: createNutrientExchangePolicy(),
  };
}

/** Serialize policies to YAML-ready objects for kubectl apply */
export function serializePolicies(policies: ForestPolicySet): CiliumNetworkPolicy[] {
  return Object.values(policies);
}
