/**
 * @chicago-forest/wireless-mesh
 *
 * Wireless mesh networking layer for Chicago Forest Network.
 * Provides WiFi Direct, ad-hoc networking, and mesh routing abstractions.
 *
 * This package enables P2P wireless communication without traditional
 * infrastructure - perfect for community-owned mesh networks.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @example
 * ```typescript
 * import {
 *   WirelessMeshManager,
 *   WirelessInterface,
 *   MeshRouter,
 * } from '@chicago-forest/wireless-mesh';
 *
 * // Initialize wireless mesh
 * const mesh = new WirelessMeshManager({
 *   protocol: 'batman-adv',
 *   interface: 'wlan0',
 *   channel: 6,
 * });
 *
 * await mesh.start();
 * mesh.on('neighbor:discovered', (neighbor) => {
 *   console.log('Found neighbor:', neighbor.macAddress);
 * });
 * ```
 */

import type {
  WirelessInterface,
  WirelessMode,
  FrequencyBand,
  LinkQuality,
  MeshConfig,
  MeshRoutingProtocol,
  NodeId,
  PeerInfo,
} from '@chicago-forest/shared-types';
import { ForestEventEmitter, getEventBus } from '@chicago-forest/p2p-core';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Configuration for wireless mesh manager
 */
export interface WirelessMeshConfig {
  /** Mesh routing protocol to use */
  protocol: MeshRoutingProtocol;
  /** Wireless interface name */
  interface: string;
  /** WiFi channel */
  channel: number;
  /** Network ESSID */
  essid: string;
  /** Optional BSSID for mesh */
  bssid?: string;
  /** MTU size */
  mtu: number;
  /** Encryption type */
  encryption: 'none' | 'wpa2' | 'wpa3' | 'forest';
  /** Encryption key (if using encryption) */
  encryptionKey?: string;
  /** TX power in dBm (if adjustable) */
  txPower?: number;
  /** Enable mesh gate (bridge to other networks) */
  meshGate?: boolean;
  /** Interval for neighbor scanning (ms) */
  scanInterval: number;
  /** Link quality update interval (ms) */
  linkQualityInterval: number;
}

/**
 * Default wireless mesh configuration
 */
export const DEFAULT_MESH_CONFIG: WirelessMeshConfig = {
  protocol: 'batman-adv',
  interface: 'wlan0',
  channel: 6,
  essid: 'ChicagoForest',
  mtu: 1500,
  encryption: 'forest',
  meshGate: false,
  scanInterval: 30000,      // 30 seconds
  linkQualityInterval: 5000, // 5 seconds
};

// =============================================================================
// WIRELESS INTERFACE ABSTRACTION
// =============================================================================

/**
 * Represents a discovered wireless interface on the system
 */
export interface DiscoveredInterface {
  name: string;
  macAddress: string;
  driver: string;
  modes: WirelessMode[];
  bands: FrequencyBand[];
  maxTxPower: number;
  currentMode?: WirelessMode;
  currentChannel?: number;
  isUp: boolean;
}

/**
 * Abstract interface manager - platform implementations provide actual control
 */
export interface InterfaceController {
  /** Discover all wireless interfaces */
  discoverInterfaces(): Promise<DiscoveredInterface[]>;
  /** Set interface mode */
  setMode(iface: string, mode: WirelessMode): Promise<void>;
  /** Set channel */
  setChannel(iface: string, channel: number): Promise<void>;
  /** Set TX power */
  setTxPower(iface: string, dbm: number): Promise<void>;
  /** Bring interface up */
  up(iface: string): Promise<void>;
  /** Bring interface down */
  down(iface: string): Promise<void>;
  /** Get interface info */
  getInfo(iface: string): Promise<DiscoveredInterface | null>;
}

/**
 * Stub interface controller for non-native environments
 */
export class StubInterfaceController implements InterfaceController {
  async discoverInterfaces(): Promise<DiscoveredInterface[]> {
    // In non-native environment, return simulated interface
    return [{
      name: 'wlan0',
      macAddress: '00:00:00:00:00:00',
      driver: 'stub',
      modes: ['managed', 'adhoc', 'mesh'],
      bands: ['2.4ghz', '5ghz'],
      maxTxPower: 20,
      isUp: false,
    }];
  }

  async setMode(_iface: string, _mode: WirelessMode): Promise<void> {
    // Stub - no-op
  }

  async setChannel(_iface: string, _channel: number): Promise<void> {
    // Stub - no-op
  }

  async setTxPower(_iface: string, _dbm: number): Promise<void> {
    // Stub - no-op
  }

  async up(_iface: string): Promise<void> {
    // Stub - no-op
  }

  async down(_iface: string): Promise<void> {
    // Stub - no-op
  }

  async getInfo(iface: string): Promise<DiscoveredInterface | null> {
    const interfaces = await this.discoverInterfaces();
    return interfaces.find((i) => i.name === iface) ?? null;
  }
}

// =============================================================================
// MESH NEIGHBOR
// =============================================================================

/**
 * Represents a mesh neighbor (directly reachable peer)
 */
export interface MeshNeighbor {
  /** MAC address of neighbor */
  macAddress: string;
  /** Associated node ID (if known) */
  nodeId?: NodeId;
  /** Interface through which neighbor is reachable */
  interface: string;
  /** Link quality metrics */
  linkQuality: LinkQuality;
  /** Time neighbor was first seen */
  firstSeen: number;
  /** Time neighbor was last seen */
  lastSeen: number;
  /** Is this neighbor a mesh gate? */
  isMeshGate: boolean;
  /** Hop count to this neighbor (1 = direct) */
  hopCount: number;
}

// =============================================================================
// MESH ROUTING ABSTRACTION
// =============================================================================

/**
 * Abstract mesh router interface
 * Implementations wrap specific protocols (BATMAN, OLSR, Babel, etc.)
 */
export interface MeshRouter {
  /** Protocol name */
  readonly protocol: MeshRoutingProtocol;
  /** Start the routing daemon */
  start(): Promise<void>;
  /** Stop the routing daemon */
  stop(): Promise<void>;
  /** Get current neighbors */
  getNeighbors(): Promise<MeshNeighbor[]>;
  /** Get route to a destination */
  getRoute(destination: string): Promise<MeshRoute | null>;
  /** Get all routes */
  getRoutes(): Promise<MeshRoute[]>;
  /** Get originator table (BATMAN-specific) */
  getOriginators?(): Promise<MeshOriginator[]>;
  /** Check if running */
  isRunning(): boolean;
}

/**
 * Mesh route information
 */
export interface MeshRoute {
  destination: string;
  nextHop: string;
  interface: string;
  metric: number;
  hopCount: number;
  lastUpdate: number;
}

/**
 * BATMAN-adv originator entry
 */
export interface MeshOriginator {
  originator: string;
  lastSeen: number;
  nextHop: string;
  outgoingInterface: string;
  tq: number; // Transmission Quality (0-255)
}

// =============================================================================
// BATMAN-ADV ROUTER
// =============================================================================

/**
 * BATMAN-adv mesh router implementation (stub)
 * In production, this would use batctl or netlink
 */
export class BatmanAdvRouter implements MeshRouter {
  readonly protocol: MeshRoutingProtocol = 'batman-adv';
  private running = false;
  private neighbors: MeshNeighbor[] = [];
  private originators: MeshOriginator[] = [];
  private config: WirelessMeshConfig;

  constructor(config: WirelessMeshConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.running) return;

    // In production:
    // 1. Load batman-adv kernel module
    // 2. Create bat0 interface
    // 3. Add slave interfaces
    // 4. Configure mesh parameters

    this.running = true;
  }

  async stop(): Promise<void> {
    if (!this.running) return;

    // In production:
    // 1. Remove slave interfaces
    // 2. Delete bat0
    // 3. Optionally unload module

    this.running = false;
  }

  async getNeighbors(): Promise<MeshNeighbor[]> {
    // In production: parse batctl neighbors or read from debugfs
    return this.neighbors;
  }

  async getRoute(destination: string): Promise<MeshRoute | null> {
    const routes = await this.getRoutes();
    return routes.find((r) => r.destination === destination) ?? null;
  }

  async getRoutes(): Promise<MeshRoute[]> {
    // In production: parse routing table from batctl or debugfs
    return this.originators.map((orig) => ({
      destination: orig.originator,
      nextHop: orig.nextHop,
      interface: orig.outgoingInterface,
      metric: 255 - orig.tq, // Lower is better
      hopCount: Math.ceil((255 - orig.tq) / 50), // Estimate
      lastUpdate: orig.lastSeen,
    }));
  }

  async getOriginators(): Promise<MeshOriginator[]> {
    // In production: batctl o or read /sys/kernel/debug/batman_adv/bat0/originators
    return this.originators;
  }

  isRunning(): boolean {
    return this.running;
  }

  /**
   * Simulate neighbor discovery (for testing)
   */
  addSimulatedNeighbor(neighbor: MeshNeighbor): void {
    this.neighbors.push(neighbor);
  }

  /**
   * Simulate originator update (for testing)
   */
  addSimulatedOriginator(originator: MeshOriginator): void {
    this.originators.push(originator);
  }
}

// =============================================================================
// OLSR ROUTER (Stub)
// =============================================================================

/**
 * OLSR mesh router implementation (stub)
 */
export class OlsrRouter implements MeshRouter {
  readonly protocol: MeshRoutingProtocol = 'olsr';
  private running = false;

  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  async getNeighbors(): Promise<MeshNeighbor[]> {
    return [];
  }

  async getRoute(_destination: string): Promise<MeshRoute | null> {
    return null;
  }

  async getRoutes(): Promise<MeshRoute[]> {
    return [];
  }

  isRunning(): boolean {
    return this.running;
  }
}

// =============================================================================
// BABEL ROUTER (Stub)
// =============================================================================

/**
 * Babel mesh router implementation (stub)
 */
export class BabelRouter implements MeshRouter {
  readonly protocol: MeshRoutingProtocol = 'babel';
  private running = false;

  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  async getNeighbors(): Promise<MeshNeighbor[]> {
    return [];
  }

  async getRoute(_destination: string): Promise<MeshRoute | null> {
    return null;
  }

  async getRoutes(): Promise<MeshRoute[]> {
    return [];
  }

  isRunning(): boolean {
    return this.running;
  }
}

// =============================================================================
// WIFI DIRECT MANAGER
// =============================================================================

/**
 * WiFi Direct (P2P) group information
 */
export interface WiFiDirectGroup {
  groupId: string;
  isOwner: boolean;
  ssid: string;
  passphrase?: string;
  frequency: number;
  members: string[]; // MAC addresses
}

/**
 * WiFi Direct manager for P2P connections
 */
export class WiFiDirectManager {
  private eventBus: ForestEventEmitter;
  private groups: Map<string, WiFiDirectGroup> = new Map();
  private running = false;

  constructor(eventBus?: ForestEventEmitter) {
    this.eventBus = eventBus ?? getEventBus();
  }

  /**
   * Start WiFi Direct
   */
  async start(): Promise<void> {
    if (this.running) return;
    // In production: Enable P2P on wpa_supplicant
    this.running = true;
  }

  /**
   * Stop WiFi Direct
   */
  async stop(): Promise<void> {
    if (!this.running) return;
    // In production: Disable P2P and leave all groups
    for (const group of this.groups.values()) {
      await this.leaveGroup(group.groupId);
    }
    this.running = false;
  }

  /**
   * Discover nearby P2P devices
   */
  async discover(timeout = 10000): Promise<WiFiDirectPeer[]> {
    // In production: p2p_find via wpa_cli
    return [];
  }

  /**
   * Create a new P2P group (become Group Owner)
   */
  async createGroup(ssid?: string): Promise<WiFiDirectGroup> {
    const groupId = `forest-${Date.now().toString(36)}`;
    const group: WiFiDirectGroup = {
      groupId,
      isOwner: true,
      ssid: ssid ?? `ChicagoForest-${groupId}`,
      passphrase: this.generatePassphrase(),
      frequency: 2437, // Channel 6
      members: [],
    };

    this.groups.set(groupId, group);
    return group;
  }

  /**
   * Join an existing P2P group
   */
  async joinGroup(peer: WiFiDirectPeer): Promise<WiFiDirectGroup | null> {
    // In production: p2p_connect via wpa_cli
    return null;
  }

  /**
   * Leave a P2P group
   */
  async leaveGroup(groupId: string): Promise<void> {
    this.groups.delete(groupId);
    // In production: p2p_group_remove via wpa_cli
  }

  /**
   * Get current groups
   */
  getGroups(): WiFiDirectGroup[] {
    return Array.from(this.groups.values());
  }

  /**
   * Generate a secure passphrase
   */
  private generatePassphrase(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Discovered WiFi Direct peer
 */
export interface WiFiDirectPeer {
  macAddress: string;
  deviceName: string;
  deviceType: string;
  groupCapability: number;
  rssi?: number;
}

// =============================================================================
// MAIN WIRELESS MESH MANAGER
// =============================================================================

/**
 * Main wireless mesh manager
 * Coordinates interface control, mesh routing, and WiFi Direct
 */
export class WirelessMeshManager {
  private config: WirelessMeshConfig;
  private eventBus: ForestEventEmitter;
  private interfaceController: InterfaceController;
  private router: MeshRouter;
  private wifiDirect: WiFiDirectManager;
  private running = false;
  private scanTimer?: ReturnType<typeof setInterval>;
  private linkQualityTimer?: ReturnType<typeof setInterval>;
  private neighbors: Map<string, MeshNeighbor> = new Map();

  constructor(
    config: Partial<WirelessMeshConfig> = {},
    eventBus?: ForestEventEmitter
  ) {
    this.config = { ...DEFAULT_MESH_CONFIG, ...config };
    this.eventBus = eventBus ?? getEventBus();
    this.interfaceController = new StubInterfaceController();

    // Select router based on protocol
    switch (this.config.protocol) {
      case 'olsr':
        this.router = new OlsrRouter();
        break;
      case 'babel':
        this.router = new BabelRouter();
        break;
      case 'batman-adv':
      default:
        this.router = new BatmanAdvRouter(this.config);
        break;
    }

    this.wifiDirect = new WiFiDirectManager(this.eventBus);
  }

  /**
   * Set custom interface controller (for native implementations)
   */
  setInterfaceController(controller: InterfaceController): void {
    this.interfaceController = controller;
  }

  /**
   * Start the wireless mesh
   */
  async start(): Promise<void> {
    if (this.running) return;

    // Configure interface
    await this.configureInterface();

    // Start mesh router
    await this.router.start();

    // Start WiFi Direct
    await this.wifiDirect.start();

    // Start periodic tasks
    this.scanTimer = setInterval(() => {
      this.scanNeighbors();
    }, this.config.scanInterval);

    this.linkQualityTimer = setInterval(() => {
      this.updateLinkQuality();
    }, this.config.linkQualityInterval);

    this.running = true;
  }

  /**
   * Stop the wireless mesh
   */
  async stop(): Promise<void> {
    if (!this.running) return;

    // Stop timers
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = undefined;
    }
    if (this.linkQualityTimer) {
      clearInterval(this.linkQualityTimer);
      this.linkQualityTimer = undefined;
    }

    // Stop components
    await this.wifiDirect.stop();
    await this.router.stop();

    this.running = false;
  }

  /**
   * Get current neighbors
   */
  async getNeighbors(): Promise<MeshNeighbor[]> {
    return this.router.getNeighbors();
  }

  /**
   * Get routes
   */
  async getRoutes(): Promise<MeshRoute[]> {
    return this.router.getRoutes();
  }

  /**
   * Get link quality for a neighbor
   */
  getLinkQuality(macAddress: string): LinkQuality | null {
    const neighbor = this.neighbors.get(macAddress);
    return neighbor?.linkQuality ?? null;
  }

  /**
   * Get mesh statistics
   */
  async getStats(): Promise<MeshStats> {
    const neighbors = await this.getNeighbors();
    const routes = await this.getRoutes();

    return {
      isRunning: this.running,
      protocol: this.config.protocol,
      interface: this.config.interface,
      channel: this.config.channel,
      neighborCount: neighbors.length,
      routeCount: routes.length,
      meshGateEnabled: this.config.meshGate ?? false,
    };
  }

  /**
   * Get WiFi Direct manager
   */
  getWiFiDirect(): WiFiDirectManager {
    return this.wifiDirect;
  }

  /**
   * Configure the wireless interface
   */
  private async configureInterface(): Promise<void> {
    const iface = this.config.interface;

    // Get interface info
    const info = await this.interfaceController.getInfo(iface);
    if (!info) {
      throw new Error(`Interface ${iface} not found`);
    }

    // Check if mesh mode is supported
    if (!info.modes.includes('mesh') && !info.modes.includes('adhoc')) {
      throw new Error(`Interface ${iface} does not support mesh or ad-hoc mode`);
    }

    // Configure interface
    await this.interfaceController.down(iface);

    // Set mode (prefer mesh, fallback to adhoc)
    const mode: WirelessMode = info.modes.includes('mesh') ? 'mesh' : 'adhoc';
    await this.interfaceController.setMode(iface, mode);

    // Set channel
    await this.interfaceController.setChannel(iface, this.config.channel);

    // Set TX power if specified
    if (this.config.txPower) {
      await this.interfaceController.setTxPower(iface, this.config.txPower);
    }

    // Bring interface up
    await this.interfaceController.up(iface);
  }

  /**
   * Scan for neighbors
   */
  private async scanNeighbors(): Promise<void> {
    const neighbors = await this.router.getNeighbors();

    for (const neighbor of neighbors) {
      const existing = this.neighbors.get(neighbor.macAddress);

      if (!existing) {
        // New neighbor discovered
        this.neighbors.set(neighbor.macAddress, neighbor);
        this.eventBus.emit('neighbor:discovered', neighbor);
      } else {
        // Update existing neighbor
        this.neighbors.set(neighbor.macAddress, neighbor);
      }
    }

    // Check for lost neighbors
    const now = Date.now();
    for (const [mac, neighbor] of this.neighbors) {
      if (now - neighbor.lastSeen > this.config.scanInterval * 3) {
        this.neighbors.delete(mac);
        this.eventBus.emit('neighbor:lost', neighbor);
      }
    }
  }

  /**
   * Update link quality metrics
   */
  private async updateLinkQuality(): Promise<void> {
    const neighbors = await this.router.getNeighbors();

    for (const neighbor of neighbors) {
      const prev = this.neighbors.get(neighbor.macAddress);
      if (prev && neighbor.nodeId) {
        // Check for significant quality change
        const qualityDiff = Math.abs(
          prev.linkQuality.quality - neighbor.linkQuality.quality
        );
        if (qualityDiff > 10) {
          this.eventBus.emitEvent('link:quality-changed', {
            peerId: neighbor.nodeId,
            quality: neighbor.linkQuality,
          });
        }
      }
    }
  }
}

/**
 * Mesh network statistics
 */
export interface MeshStats {
  isRunning: boolean;
  protocol: MeshRoutingProtocol;
  interface: string;
  channel: number;
  neighborCount: number;
  routeCount: number;
  meshGateEnabled: boolean;
}

// =============================================================================
// CHANNEL SELECTION
// =============================================================================

/**
 * 2.4GHz channel information
 */
export const CHANNELS_2_4GHZ = [
  { channel: 1, frequency: 2412 },
  { channel: 2, frequency: 2417 },
  { channel: 3, frequency: 2422 },
  { channel: 4, frequency: 2427 },
  { channel: 5, frequency: 2432 },
  { channel: 6, frequency: 2437 },
  { channel: 7, frequency: 2442 },
  { channel: 8, frequency: 2447 },
  { channel: 9, frequency: 2452 },
  { channel: 10, frequency: 2457 },
  { channel: 11, frequency: 2462 },
  // Channels 12-14 not available in US
];

/**
 * 5GHz channel information (UNII bands)
 */
export const CHANNELS_5GHZ = [
  // UNII-1
  { channel: 36, frequency: 5180 },
  { channel: 40, frequency: 5200 },
  { channel: 44, frequency: 5220 },
  { channel: 48, frequency: 5240 },
  // UNII-2A
  { channel: 52, frequency: 5260 },
  { channel: 56, frequency: 5280 },
  { channel: 60, frequency: 5300 },
  { channel: 64, frequency: 5320 },
  // UNII-2C
  { channel: 100, frequency: 5500 },
  { channel: 104, frequency: 5520 },
  { channel: 108, frequency: 5540 },
  { channel: 112, frequency: 5560 },
  { channel: 116, frequency: 5580 },
  { channel: 120, frequency: 5600 },
  { channel: 124, frequency: 5620 },
  { channel: 128, frequency: 5640 },
  { channel: 132, frequency: 5660 },
  { channel: 136, frequency: 5680 },
  { channel: 140, frequency: 5700 },
  { channel: 144, frequency: 5720 },
  // UNII-3
  { channel: 149, frequency: 5745 },
  { channel: 153, frequency: 5765 },
  { channel: 157, frequency: 5785 },
  { channel: 161, frequency: 5805 },
  { channel: 165, frequency: 5825 },
];

/**
 * Get non-overlapping 2.4GHz channels (1, 6, 11)
 */
export function getNonOverlappingChannels(): number[] {
  return [1, 6, 11];
}

/**
 * Recommend best channel based on interference
 * In production, this would scan and analyze
 */
export async function recommendChannel(
  _band: '2.4ghz' | '5ghz'
): Promise<number> {
  // In production: scan and find least congested channel
  // For now, return standard non-overlapping channel
  return 6;
}

// =============================================================================
// EXPORTS
// =============================================================================

// All functions, classes, constants, and types are already exported inline above.
// No additional re-exports needed.
