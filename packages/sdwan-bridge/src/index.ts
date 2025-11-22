/**
 * @chicago-forest/sdwan-bridge
 *
 * SD-WAN Virtual Bridge for Chicago Forest Network.
 * Enables users to create encrypted tunnels to the UNAbridged network
 * with intelligent path selection and traffic engineering.
 *
 * Users connect via their firewalls (OPNsense, custom CFW) through
 * two ports - one for traditional internet, one for Forest network.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @example
 * ```typescript
 * import { SDWANBridge, ForestTunnel } from '@chicago-forest/sdwan-bridge';
 *
 * const bridge = new SDWANBridge({
 *   nodeIdentity: myIdentity,
 *   forestInterface: 'eth1',  // Dedicated Forest port
 *   pathSelection: 'lowest-latency',
 * });
 *
 * await bridge.start();
 *
 * // Create tunnel to another forest node
 * const tunnel = await bridge.createTunnel({
 *   remoteNodeId: 'CFN-abc123...',
 *   type: 'wireguard',
 * });
 * ```
 */

import type {
  NodeIdentity,
  NodeId,
  PeerInfo,
  PeerAddress,
  TunnelConfig,
  TunnelState,
  TunnelType,
  TrafficRule,
  PathSelectionPolicy,
} from '@chicago-forest/shared-types';
import { ForestEventEmitter, getEventBus } from '@chicago-forest/p2p-core';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * SD-WAN Bridge configuration
 */
export interface SDWANBridgeConfig {
  /** Node identity for authentication */
  nodeIdentity: NodeIdentity;
  /** Interface connected to Forest network */
  forestInterface: string;
  /** Interface connected to traditional internet (optional) */
  wanInterface?: string;
  /** Path selection policy */
  pathSelection: PathSelectionPolicy;
  /** Enable multi-path TCP concepts */
  multipath: boolean;
  /** Maximum concurrent tunnels */
  maxTunnels: number;
  /** Keepalive interval for tunnels (ms) */
  tunnelKeepalive: number;
  /** MTU for tunnel interfaces */
  tunnelMtu: number;
  /** Enable traffic statistics */
  enableStats: boolean;
  /** Stats collection interval (ms) */
  statsInterval: number;
}

/**
 * Default SD-WAN configuration
 */
export const DEFAULT_SDWAN_CONFIG: Partial<SDWANBridgeConfig> = {
  forestInterface: 'forest0',
  pathSelection: 'lowest-latency',
  multipath: true,
  maxTunnels: 50,
  tunnelKeepalive: 25000,  // 25 seconds (WireGuard default)
  tunnelMtu: 1420,         // WireGuard MTU
  enableStats: true,
  statsInterval: 10000,
};

// =============================================================================
// TUNNEL ABSTRACTION
// =============================================================================

/**
 * Forest tunnel - encrypted connection to another node
 */
export class ForestTunnel {
  readonly id: string;
  readonly config: TunnelConfig;
  private state: TunnelState;
  private eventBus: ForestEventEmitter;
  private keepaliveTimer?: ReturnType<typeof setInterval>;

  constructor(config: TunnelConfig, eventBus?: ForestEventEmitter) {
    this.id = config.id;
    this.config = config;
    this.eventBus = eventBus ?? getEventBus();
    this.state = {
      config,
      status: 'down',
      bytesIn: 0,
      bytesOut: 0,
      packetsIn: 0,
      packetsOut: 0,
    };
  }

  /**
   * Establish the tunnel
   */
  async connect(): Promise<void> {
    try {
      // In production: Create actual tunnel based on type
      switch (this.config.type) {
        case 'wireguard':
          await this.setupWireGuard();
          break;
        case 'vxlan':
          await this.setupVXLAN();
          break;
        case 'forest-tunnel':
          await this.setupForestTunnel();
          break;
        default:
          throw new Error(`Unsupported tunnel type: ${this.config.type}`);
      }

      this.state.status = 'up';
      this.state.connectedAt = Date.now();
      this.startKeepalive();

      this.eventBus.emitEvent('tunnel:up', { tunnel: this.state });
    } catch (error) {
      this.state.status = 'error';
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Disconnect the tunnel
   */
  async disconnect(): Promise<void> {
    this.stopKeepalive();

    // In production: Tear down the actual tunnel
    this.state.status = 'down';
    this.eventBus.emitEvent('tunnel:down', {
      tunnelId: this.id,
      reason: 'disconnected',
    });
  }

  /**
   * Get current state
   */
  getState(): TunnelState {
    return { ...this.state };
  }

  /**
   * Update traffic statistics
   */
  updateStats(bytesIn: number, bytesOut: number): void {
    this.state.bytesIn += bytesIn;
    this.state.bytesOut += bytesOut;
    this.state.packetsIn++;
    this.state.packetsOut++;
  }

  /**
   * Record a successful handshake
   */
  recordHandshake(): void {
    this.state.lastHandshake = Date.now();
  }

  /**
   * Set up WireGuard tunnel
   */
  private async setupWireGuard(): Promise<void> {
    // In production:
    // 1. Create WireGuard interface (wg0, wg1, etc.)
    // 2. Set private key
    // 3. Add peer with public key and endpoint
    // 4. Set allowed IPs
    // 5. Bring interface up
    //
    // Example commands (would execute via child_process):
    // ip link add dev wg0 type wireguard
    // wg set wg0 private-key /path/to/key peer <pubkey> endpoint <ip:port> allowed-ips <cidr>
    // ip addr add <local-ip> dev wg0
    // ip link set wg0 up
  }

  /**
   * Set up VXLAN tunnel
   */
  private async setupVXLAN(): Promise<void> {
    // In production:
    // ip link add vxlan0 type vxlan id <vni> remote <remote-ip> dstport 4789
    // ip link set vxlan0 up
  }

  /**
   * Set up Forest-specific tunnel (custom protocol)
   */
  private async setupForestTunnel(): Promise<void> {
    // Forest tunnel uses the P2P core for encrypted communication
    // with additional privacy features
  }

  /**
   * Start keepalive
   */
  private startKeepalive(): void {
    const interval = this.config.keepalive || 25000;
    this.keepaliveTimer = setInterval(() => {
      // In production: Send keepalive packet
      // Check if handshake is stale
      if (this.state.lastHandshake) {
        const staleness = Date.now() - this.state.lastHandshake;
        if (staleness > interval * 4) {
          // Connection may be dead
          this.state.status = 'error';
          this.state.error = 'Keepalive timeout';
        }
      }
    }, interval);
  }

  /**
   * Stop keepalive
   */
  private stopKeepalive(): void {
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = undefined;
    }
  }
}

// =============================================================================
// PATH SELECTION
// =============================================================================

/**
 * Path metrics for a tunnel
 */
export interface PathMetrics {
  tunnelId: string;
  latency: number;      // ms
  jitter: number;       // ms
  packetLoss: number;   // percentage 0-100
  bandwidth: number;    // Mbps estimated
  cost: number;         // Administrative cost
  lastUpdate: number;
}

/**
 * Path selector - chooses best tunnel based on policy
 */
export class PathSelector {
  private policy: PathSelectionPolicy;
  private metrics: Map<string, PathMetrics> = new Map();
  private weights: Map<string, number> = new Map();

  constructor(policy: PathSelectionPolicy) {
    this.policy = policy;
  }

  /**
   * Update metrics for a tunnel
   */
  updateMetrics(metrics: PathMetrics): void {
    this.metrics.set(metrics.tunnelId, metrics);
  }

  /**
   * Set weight for weighted policy
   */
  setWeight(tunnelId: string, weight: number): void {
    this.weights.set(tunnelId, weight);
  }

  /**
   * Select best tunnel for traffic
   */
  selectPath(tunnelIds: string[]): string | null {
    const available = tunnelIds.filter((id) => this.metrics.has(id));
    if (available.length === 0) return null;

    switch (this.policy) {
      case 'lowest-latency':
        return this.selectLowestLatency(available);
      case 'highest-bandwidth':
        return this.selectHighestBandwidth(available);
      case 'lowest-cost':
        return this.selectLowestCost(available);
      case 'round-robin':
        return this.selectRoundRobin(available);
      case 'weighted':
        return this.selectWeighted(available);
      case 'failover':
        return this.selectFailover(available);
      default:
        return available[0];
    }
  }

  private roundRobinIndex = 0;

  private selectLowestLatency(tunnelIds: string[]): string {
    let best = tunnelIds[0];
    let bestLatency = Infinity;

    for (const id of tunnelIds) {
      const metrics = this.metrics.get(id);
      if (metrics && metrics.latency < bestLatency && metrics.packetLoss < 50) {
        bestLatency = metrics.latency;
        best = id;
      }
    }

    return best;
  }

  private selectHighestBandwidth(tunnelIds: string[]): string {
    let best = tunnelIds[0];
    let bestBandwidth = 0;

    for (const id of tunnelIds) {
      const metrics = this.metrics.get(id);
      if (metrics && metrics.bandwidth > bestBandwidth && metrics.packetLoss < 50) {
        bestBandwidth = metrics.bandwidth;
        best = id;
      }
    }

    return best;
  }

  private selectLowestCost(tunnelIds: string[]): string {
    let best = tunnelIds[0];
    let bestCost = Infinity;

    for (const id of tunnelIds) {
      const metrics = this.metrics.get(id);
      if (metrics && metrics.cost < bestCost && metrics.packetLoss < 50) {
        bestCost = metrics.cost;
        best = id;
      }
    }

    return best;
  }

  private selectRoundRobin(tunnelIds: string[]): string {
    const index = this.roundRobinIndex % tunnelIds.length;
    this.roundRobinIndex++;
    return tunnelIds[index];
  }

  private selectWeighted(tunnelIds: string[]): string {
    const totalWeight = tunnelIds.reduce((sum, id) => {
      return sum + (this.weights.get(id) || 1);
    }, 0);

    let random = Math.random() * totalWeight;
    for (const id of tunnelIds) {
      random -= this.weights.get(id) || 1;
      if (random <= 0) {
        return id;
      }
    }

    return tunnelIds[0];
  }

  private selectFailover(tunnelIds: string[]): string {
    // Return first tunnel with acceptable metrics
    for (const id of tunnelIds) {
      const metrics = this.metrics.get(id);
      if (metrics && metrics.packetLoss < 10 && metrics.latency < 200) {
        return id;
      }
    }
    // If no good tunnel, return first available
    return tunnelIds[0];
  }
}

// =============================================================================
// TRAFFIC CLASSIFICATION
// =============================================================================

/**
 * Traffic classifier - matches packets to rules
 */
export class TrafficClassifier {
  private rules: TrafficRule[] = [];

  /**
   * Add a traffic rule
   */
  addRule(rule: TrafficRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Remove a rule
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
  }

  /**
   * Get all rules
   */
  getRules(): TrafficRule[] {
    return [...this.rules];
  }

  /**
   * Classify a packet and return matching rule
   */
  classify(packet: PacketInfo): TrafficRule | null {
    for (const rule of this.rules) {
      if (this.matches(packet, rule)) {
        return rule;
      }
    }
    return null;
  }

  /**
   * Check if packet matches rule
   */
  private matches(packet: PacketInfo, rule: TrafficRule): boolean {
    const match = rule.match;

    if (match.srcNetwork && !this.matchesCIDR(packet.srcAddr, match.srcNetwork)) {
      return false;
    }

    if (match.dstNetwork && !this.matchesCIDR(packet.dstAddr, match.dstNetwork)) {
      return false;
    }

    if (match.srcPort !== undefined && packet.srcPort !== match.srcPort) {
      return false;
    }

    if (match.dstPort !== undefined && packet.dstPort !== match.dstPort) {
      return false;
    }

    if (match.protocol && match.protocol !== 'any' && packet.protocol !== match.protocol) {
      return false;
    }

    return true;
  }

  /**
   * Check if IP matches CIDR
   */
  private matchesCIDR(ip: string, cidr: string): boolean {
    // Simplified CIDR matching
    // In production, use proper IP/netmask calculation
    if (cidr === '0.0.0.0/0') return true;

    const [network, mask] = cidr.split('/');
    if (!mask) return ip === network;

    // For now, just check prefix
    const prefix = network.split('.').slice(0, parseInt(mask) / 8).join('.');
    return ip.startsWith(prefix);
  }
}

/**
 * Packet information for classification
 */
export interface PacketInfo {
  srcAddr: string;
  dstAddr: string;
  srcPort?: number;
  dstPort?: number;
  protocol: 'tcp' | 'udp' | 'icmp';
  length: number;
}

// =============================================================================
// VIRTUAL BRIDGE
// =============================================================================

/**
 * Virtual bridge configuration
 */
export interface VirtualBridgeConfig {
  name: string;
  interfaces: string[];
  mode: 'transparent' | 'routed';
  vlanId?: number;
}

/**
 * Virtual bridge - connects Forest network to local network
 */
export class VirtualBridge {
  readonly name: string;
  private config: VirtualBridgeConfig;
  private isUp = false;

  constructor(config: VirtualBridgeConfig) {
    this.name = config.name;
    this.config = config;
  }

  /**
   * Create and bring up the bridge
   */
  async up(): Promise<void> {
    if (this.isUp) return;

    // In production:
    // ip link add name <bridge> type bridge
    // ip link set <interface> master <bridge>
    // ip link set <bridge> up

    this.isUp = true;
  }

  /**
   * Bring down and remove the bridge
   */
  async down(): Promise<void> {
    if (!this.isUp) return;

    // In production:
    // ip link set <bridge> down
    // ip link del <bridge>

    this.isUp = false;
  }

  /**
   * Add interface to bridge
   */
  async addInterface(iface: string): Promise<void> {
    if (!this.config.interfaces.includes(iface)) {
      this.config.interfaces.push(iface);
    }
    // In production: ip link set <iface> master <bridge>
  }

  /**
   * Remove interface from bridge
   */
  async removeInterface(iface: string): Promise<void> {
    this.config.interfaces = this.config.interfaces.filter((i) => i !== iface);
    // In production: ip link set <iface> nomaster
  }

  /**
   * Get bridge status
   */
  getStatus(): { isUp: boolean; interfaces: string[] } {
    return {
      isUp: this.isUp,
      interfaces: [...this.config.interfaces],
    };
  }
}

// =============================================================================
// MAIN SD-WAN BRIDGE
// =============================================================================

/**
 * Main SD-WAN Bridge manager
 * Coordinates tunnels, path selection, and traffic engineering
 */
export class SDWANBridge {
  private config: SDWANBridgeConfig;
  private eventBus: ForestEventEmitter;
  private tunnels: Map<string, ForestTunnel> = new Map();
  private pathSelector: PathSelector;
  private classifier: TrafficClassifier;
  private virtualBridge?: VirtualBridge;
  private running = false;
  private statsTimer?: ReturnType<typeof setInterval>;

  constructor(
    config: Partial<SDWANBridgeConfig> & { nodeIdentity: NodeIdentity },
    eventBus?: ForestEventEmitter
  ) {
    this.config = { ...DEFAULT_SDWAN_CONFIG, ...config } as SDWANBridgeConfig;
    this.eventBus = eventBus ?? getEventBus();
    this.pathSelector = new PathSelector(this.config.pathSelection);
    this.classifier = new TrafficClassifier();
  }

  /**
   * Start the SD-WAN bridge
   */
  async start(): Promise<void> {
    if (this.running) return;

    // Create virtual bridge for Forest interface
    this.virtualBridge = new VirtualBridge({
      name: 'forest-br0',
      interfaces: [this.config.forestInterface],
      mode: 'transparent',
    });

    await this.virtualBridge.up();

    // Start stats collection
    if (this.config.enableStats) {
      this.statsTimer = setInterval(() => {
        this.collectStats();
      }, this.config.statsInterval);
    }

    this.running = true;
  }

  /**
   * Stop the SD-WAN bridge
   */
  async stop(): Promise<void> {
    if (!this.running) return;

    // Stop stats collection
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = undefined;
    }

    // Disconnect all tunnels
    for (const tunnel of this.tunnels.values()) {
      await tunnel.disconnect();
    }
    this.tunnels.clear();

    // Bring down virtual bridge
    if (this.virtualBridge) {
      await this.virtualBridge.down();
    }

    this.running = false;
  }

  /**
   * Create a new tunnel to a remote node
   */
  async createTunnel(options: {
    remoteNodeId: NodeId;
    remoteAddress: PeerAddress;
    type?: TunnelType;
    encryptionKey?: string;
  }): Promise<ForestTunnel> {
    if (this.tunnels.size >= this.config.maxTunnels) {
      throw new Error('Maximum tunnel limit reached');
    }

    const tunnelId = `tunnel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const tunnelConfig: TunnelConfig = {
      id: tunnelId,
      type: options.type ?? 'forest-tunnel',
      localEndpoint: {
        protocol: 'udp',
        host: '0.0.0.0',
        port: 0, // Auto-assign
      },
      remoteEndpoint: options.remoteAddress,
      encryptionKey: options.encryptionKey,
      mtu: this.config.tunnelMtu,
      keepalive: this.config.tunnelKeepalive,
      enabled: true,
    };

    const tunnel = new ForestTunnel(tunnelConfig, this.eventBus);
    await tunnel.connect();

    this.tunnels.set(tunnelId, tunnel);

    // Initialize path metrics
    this.pathSelector.updateMetrics({
      tunnelId,
      latency: 0,
      jitter: 0,
      packetLoss: 0,
      bandwidth: 100, // Assume 100 Mbps initially
      cost: 1,
      lastUpdate: Date.now(),
    });

    return tunnel;
  }

  /**
   * Remove a tunnel
   */
  async removeTunnel(tunnelId: string): Promise<void> {
    const tunnel = this.tunnels.get(tunnelId);
    if (!tunnel) return;

    await tunnel.disconnect();
    this.tunnels.delete(tunnelId);
  }

  /**
   * Get a tunnel by ID
   */
  getTunnel(tunnelId: string): ForestTunnel | null {
    return this.tunnels.get(tunnelId) ?? null;
  }

  /**
   * Get all tunnels
   */
  getTunnels(): ForestTunnel[] {
    return Array.from(this.tunnels.values());
  }

  /**
   * Add a traffic rule
   */
  addTrafficRule(rule: TrafficRule): void {
    this.classifier.addRule(rule);
  }

  /**
   * Remove a traffic rule
   */
  removeTrafficRule(ruleId: string): void {
    this.classifier.removeRule(ruleId);
  }

  /**
   * Get traffic rules
   */
  getTrafficRules(): TrafficRule[] {
    return this.classifier.getRules();
  }

  /**
   * Select best path for a packet
   */
  selectPath(packet: PacketInfo): string | null {
    // First, classify the packet
    const rule = this.classifier.classify(packet);

    // If rule specifies a tunnel, use it
    if (rule?.action.tunnel) {
      return rule.action.tunnel;
    }

    // Otherwise, use path selection policy
    const tunnelIds = Array.from(this.tunnels.keys());
    return this.pathSelector.selectPath(tunnelIds);
  }

  /**
   * Get bridge statistics
   */
  getStats(): SDWANStats {
    let totalBytesIn = 0;
    let totalBytesOut = 0;

    for (const tunnel of this.tunnels.values()) {
      const state = tunnel.getState();
      totalBytesIn += state.bytesIn;
      totalBytesOut += state.bytesOut;
    }

    return {
      isRunning: this.running,
      tunnelCount: this.tunnels.size,
      activeTunnels: Array.from(this.tunnels.values())
        .filter((t) => t.getState().status === 'up').length,
      totalBytesIn,
      totalBytesOut,
      pathSelection: this.config.pathSelection,
    };
  }

  /**
   * Collect statistics from tunnels
   */
  private collectStats(): void {
    for (const tunnel of this.tunnels.values()) {
      const state = tunnel.getState();
      // In production: measure actual latency, jitter, packet loss
      // For now, simulate
    }
  }
}

/**
 * SD-WAN statistics
 */
export interface SDWANStats {
  isRunning: boolean;
  tunnelCount: number;
  activeTunnels: number;
  totalBytesIn: number;
  totalBytesOut: number;
  pathSelection: PathSelectionPolicy;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate WireGuard keypair (stub)
 * In production: Use actual WireGuard key generation
 */
export function generateWireGuardKeys(): { privateKey: string; publicKey: string } {
  // In production: wg genkey | tee privatekey | wg pubkey > publickey
  // This is a stub that returns placeholder keys
  const random = () =>
    Array.from({ length: 44 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        .charAt(Math.floor(Math.random() * 64))
    ).join('');

  return {
    privateKey: random(),
    publicKey: random(),
  };
}

/**
 * Create a default traffic rule for Forest network
 */
export function createDefaultForestRule(): TrafficRule {
  return {
    id: 'default-forest',
    name: 'Default Forest Traffic',
    priority: 0,
    match: {
      dstNetwork: '10.42.0.0/16', // Forest network range
      protocol: 'any',
    },
    action: {
      policy: 'lowest-latency',
    },
  };
}

/**
 * Create a split-tunnel rule (only specific traffic goes through Forest)
 */
export function createSplitTunnelRule(
  destinationNetwork: string,
  tunnelId: string
): TrafficRule {
  return {
    id: `split-${Date.now()}`,
    name: `Split tunnel to ${destinationNetwork}`,
    priority: 100,
    match: {
      dstNetwork: destinationNetwork,
      protocol: 'any',
    },
    action: {
      tunnel: tunnelId,
    },
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

// All functions, classes, constants, and types are already exported inline above.
// No additional re-exports needed.
