/**
 * @chicago-forest/shared-types
 * Core type definitions for Chicago Forest Network
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

// =============================================================================
// NODE IDENTITY
// =============================================================================

/** Unique identifier for a forest node, derived from public key */
export type NodeId = string;

/** Ed25519 public key in hex format */
export type PublicKey = string;

/** Ed25519 private key in hex format */
export type PrivateKey = string;

/** Cryptographic keypair for node identity */
export interface KeyPair {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}

/** Complete node identity including cryptographic keys */
export interface NodeIdentity {
  nodeId: NodeId;
  keyPair: KeyPair;
  createdAt: number;
  version: number;
}

// =============================================================================
// PEER INFORMATION
// =============================================================================

/** Network address for connecting to a peer */
export interface PeerAddress {
  protocol: 'tcp' | 'udp' | 'ws' | 'wss' | 'quic' | 'forest';
  host: string;
  port: number;
  path?: string;
}

/** Complete peer information for discovery and connection */
export interface PeerInfo {
  nodeId: NodeId;
  publicKey: PublicKey;
  addresses: PeerAddress[];
  lastSeen: number;
  reputation: number;
  capabilities: NodeCapability[];
  metadata: Record<string, string>;
}

/** Capabilities that a node can advertise */
export type NodeCapability =
  | 'relay'           // Can relay traffic for others
  | 'storage'         // Can store data for the network
  | 'exit'            // Can serve as exit node
  | 'bootstrap'       // Can serve as bootstrap node
  | 'bridge'          // Can bridge to external networks
  | 'antenna'         // Has wireless transmission capability
  | 'tower'           // Tower/elevated node with extended range
  | 'firewall'        // Running Chicago Forest Firewall
  | 'anonymous';      // Supports anonymous routing

// =============================================================================
// CONNECTION & MESSAGING
// =============================================================================

/** Connection state between two nodes */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'handshaking'
  | 'connected'
  | 'authenticated'
  | 'error';

/** Active connection to a peer */
export interface PeerConnection {
  peerId: NodeId;
  state: ConnectionState;
  address: PeerAddress;
  establishedAt?: number;
  lastActivity?: number;
  latency?: number;
  bytesIn: number;
  bytesOut: number;
}

/** Protocol message types */
export type MessageType =
  | 'HELLO'
  | 'HELLO_ACK'
  | 'FIND_NODE'
  | 'FIND_NODE_RESPONSE'
  | 'PING'
  | 'PONG'
  | 'STORE'
  | 'STORE_ACK'
  | 'RETRIEVE'
  | 'RETRIEVE_RESPONSE'
  | 'RELAY'
  | 'RELAY_ACK'
  | 'ANNOUNCE'
  | 'DATA'
  | 'ERROR';

/** Base message structure */
export interface Message {
  type: MessageType;
  id: string;
  from: NodeId;
  to?: NodeId;
  timestamp: number;
  payload: unknown;
  signature?: string;
}

// =============================================================================
// WIRELESS MESH
// =============================================================================

/** Wireless interface modes */
export type WirelessMode =
  | 'managed'       // Client mode
  | 'adhoc'         // Ad-hoc/IBSS mode
  | 'ap'            // Access Point mode
  | 'mesh'          // 802.11s mesh mode
  | 'monitor';      // Monitor mode

/** Frequency bands */
export type FrequencyBand =
  | '900mhz'        // ISM band (LoRa)
  | '2.4ghz'        // WiFi 2.4GHz
  | '5ghz'          // WiFi 5GHz
  | '6ghz'          // WiFi 6E
  | '60ghz';        // WiGig backhaul

/** Wireless interface information */
export interface WirelessInterface {
  name: string;
  macAddress: string;
  mode: WirelessMode;
  band: FrequencyBand;
  channel: number;
  txPower: number;         // in dBm
  supported: boolean;
}

/** Wireless link quality metrics */
export interface LinkQuality {
  peerId: NodeId;
  rssi: number;           // Signal strength in dBm
  noise: number;          // Noise floor in dBm
  snr: number;            // Signal-to-noise ratio
  txRate: number;         // Transmit rate in Mbps
  rxRate: number;         // Receive rate in Mbps
  quality: number;        // Quality percentage 0-100
  lastUpdate: number;
}

/** Mesh routing protocols */
export type MeshRoutingProtocol =
  | 'batman-adv'    // Better Approach To Mobile Ad-hoc Networking
  | 'olsr'          // Optimized Link State Routing
  | 'babel'         // Babel routing protocol
  | 'bmx7'          // BMX7 mesh routing
  | 'cjdns';        // cjdns encrypted routing

/** Mesh network configuration */
export interface MeshConfig {
  protocol: MeshRoutingProtocol;
  interface: string;
  channel: number;
  essid: string;
  bssid?: string;
  mtu: number;
  encryption: 'none' | 'wpa2' | 'wpa3' | 'forest';
}

// =============================================================================
// SD-WAN & TUNNELING
// =============================================================================

/** Tunnel types supported by SD-WAN bridge */
export type TunnelType =
  | 'wireguard'
  | 'vxlan'
  | 'gre'
  | 'ipip'
  | 'forest-tunnel';

/** Tunnel configuration */
export interface TunnelConfig {
  id: string;
  type: TunnelType;
  localEndpoint: PeerAddress;
  remoteEndpoint: PeerAddress;
  encryptionKey?: string;
  mtu: number;
  keepalive: number;
  enabled: boolean;
}

/** Active tunnel state */
export interface TunnelState {
  config: TunnelConfig;
  status: 'up' | 'down' | 'error';
  connectedAt?: number;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  lastHandshake?: number;
  error?: string;
}

/** SD-WAN path selection policy */
export type PathSelectionPolicy =
  | 'lowest-latency'
  | 'highest-bandwidth'
  | 'lowest-cost'
  | 'round-robin'
  | 'weighted'
  | 'failover';

/** Traffic classification rule */
export interface TrafficRule {
  id: string;
  name: string;
  priority: number;
  match: {
    srcNetwork?: string;
    dstNetwork?: string;
    srcPort?: number;
    dstPort?: number;
    protocol?: 'tcp' | 'udp' | 'icmp' | 'any';
    application?: string;
  };
  action: {
    tunnel?: string;
    policy?: PathSelectionPolicy;
    qos?: {
      priority: number;
      maxBandwidth?: number;
      minBandwidth?: number;
    };
  };
}

// =============================================================================
// FIREWALL
// =============================================================================

/** Firewall rule action */
export type FirewallAction = 'allow' | 'deny' | 'drop' | 'reject' | 'log' | 'nat';

/** Firewall rule direction */
export type FirewallDirection = 'in' | 'out' | 'forward';

/** Firewall zone types */
export type FirewallZone =
  | 'wan'           // Traditional internet
  | 'lan'           // Local network
  | 'forest'        // Chicago Forest Network
  | 'dmz'           // Demilitarized zone
  | 'guest'         // Guest network
  | 'trusted'       // Trusted internal
  | 'untrusted';    // Untrusted external

/** Firewall rule definition */
export interface FirewallRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  direction: FirewallDirection;
  sourceZone?: FirewallZone;
  destZone?: FirewallZone;
  sourceAddress?: string;
  destAddress?: string;
  sourcePort?: string;
  destPort?: string;
  protocol?: 'tcp' | 'udp' | 'icmp' | 'any';
  action: FirewallAction;
  logging: boolean;
  rateLimit?: {
    requests: number;
    period: number;  // seconds
  };
}

/** Firewall configuration for Chicago Forest */
export interface ForestFirewallConfig {
  version: string;
  zones: {
    [K in FirewallZone]?: {
      interfaces: string[];
      description: string;
    };
  };
  rules: FirewallRule[];
  nat: NatRule[];
  defaults: {
    inbound: FirewallAction;
    outbound: FirewallAction;
    forward: FirewallAction;
  };
}

/** NAT rule definition */
export interface NatRule {
  id: string;
  name: string;
  enabled: boolean;
  type: 'snat' | 'dnat' | 'masquerade';
  sourceAddress?: string;
  destAddress?: string;
  sourcePort?: string;
  destPort?: string;
  translateAddress?: string;
  translatePort?: string;
  interface?: string;
}

// =============================================================================
// ANONYMOUS ROUTING
// =============================================================================

/** Onion layer for anonymous routing */
export interface OnionLayer {
  nodeId: NodeId;
  publicKey: PublicKey;
  encryptedPayload: Uint8Array;
}

/** Anonymous circuit through the network */
export interface AnonymousCircuit {
  id: string;
  hops: NodeId[];
  createdAt: number;
  expiresAt: number;
  state: 'building' | 'ready' | 'extending' | 'destroyed';
}

/** Hidden service descriptor */
export interface HiddenServiceDescriptor {
  serviceId: string;
  publicKey: PublicKey;
  introductionPoints: NodeId[];
  timestamp: number;
  signature: string;
}

// =============================================================================
// HARDWARE ABSTRACTION
// =============================================================================

/** Hardware device types */
export type HardwareDeviceType =
  | 'wifi-adapter'
  | 'lora-radio'
  | 'backhaul-radio'
  | 'antenna'
  | 'amplifier'
  | 'router'
  | 'switch';

/** Hardware device information */
export interface HardwareDevice {
  id: string;
  type: HardwareDeviceType;
  name: string;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  capabilities: string[];
  status: 'online' | 'offline' | 'error' | 'updating';
  metrics?: HardwareMetrics;
}

/** Hardware metrics */
export interface HardwareMetrics {
  temperature?: number;    // Celsius
  powerDraw?: number;      // Watts
  uptime?: number;         // Seconds
  cpuUsage?: number;       // Percentage
  memoryUsage?: number;    // Percentage
}

// =============================================================================
// NODE DEPLOYMENT
// =============================================================================

/** Deployment target types */
export type DeploymentTarget =
  | 'docker'
  | 'kubernetes'
  | 'vm'
  | 'bare-metal'
  | 'openwrt'
  | 'opnsense';

/** Deployment configuration */
export interface DeploymentConfig {
  target: DeploymentTarget;
  nodeIdentity?: NodeIdentity;
  networkConfig: {
    interfaces: NetworkInterfaceConfig[];
    meshConfig?: MeshConfig;
    tunnels?: TunnelConfig[];
  };
  firewallConfig?: ForestFirewallConfig;
  resources?: {
    cpuLimit?: string;
    memoryLimit?: string;
    storageLimit?: string;
  };
  features: {
    anonymousRouting: boolean;
    relay: boolean;
    storage: boolean;
    bridgeToInternet: boolean;
  };
}

/** Network interface configuration */
export interface NetworkInterfaceConfig {
  name: string;
  type: 'physical' | 'virtual' | 'bridge' | 'vlan';
  zone: FirewallZone;
  addresses?: string[];
  dhcp?: boolean;
  passthrough?: boolean;  // For NIC passthrough
  sriovVf?: number;       // SR-IOV Virtual Function number
}

// =============================================================================
// IPV7 INTEGRATION (Stub for companion package)
// =============================================================================

/** IPV7 address format (placeholder for companion package) */
export type IPv7Address = string;

/** IPV7 packet header (placeholder) */
export interface IPv7Header {
  version: 7;
  sourceAddress: IPv7Address;
  destAddress: IPv7Address;
  hopLimit: number;
  payloadLength: number;
  nextHeader: number;
}

/** IPV7 adapter configuration */
export interface IPv7AdapterConfig {
  enabled: boolean;
  localAddress: IPv7Address;
  gateway?: IPv7Address;
  translateToIPv4: boolean;
  translateToIPv6: boolean;
}

// =============================================================================
// EVENTS
// =============================================================================

/** Network event types */
export type NetworkEventType =
  | 'peer:discovered'
  | 'peer:connected'
  | 'peer:disconnected'
  | 'peer:authenticated'
  | 'message:received'
  | 'message:sent'
  | 'tunnel:up'
  | 'tunnel:down'
  | 'link:quality-changed'
  | 'circuit:built'
  | 'circuit:destroyed'
  | 'firewall:rule-matched'
  | 'error';

/** Base network event */
export interface NetworkEvent {
  type: NetworkEventType;
  timestamp: number;
  data: unknown;
}

/** Event handler function */
export type EventHandler<T = unknown> = (event: NetworkEvent & { data: T }) => void;

// =============================================================================
// CONFIGURATION
// =============================================================================

/** Complete forest node configuration */
export interface ForestNodeConfig {
  identity: NodeIdentity;
  network: {
    listenAddresses: PeerAddress[];
    bootstrapPeers: PeerInfo[];
    maxConnections: number;
    connectionTimeout: number;
  };
  mesh?: MeshConfig;
  sdwan?: {
    enabled: boolean;
    tunnels: TunnelConfig[];
    trafficRules: TrafficRule[];
    pathSelection: PathSelectionPolicy;
  };
  firewall?: ForestFirewallConfig;
  anonymousRouting?: {
    enabled: boolean;
    circuitLength: number;
    circuitTimeout: number;
    allowExit: boolean;
  };
  ipv7?: IPv7AdapterConfig;
  storage?: {
    enabled: boolean;
    maxSize: number;
    path: string;
  };
}

// =============================================================================
// API RESPONSES
// =============================================================================

/** Standard API response */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: number;
}

/** Node status response */
export interface NodeStatus {
  nodeId: NodeId;
  version: string;
  uptime: number;
  connections: {
    total: number;
    inbound: number;
    outbound: number;
  };
  bandwidth: {
    in: number;
    out: number;
  };
  mesh?: {
    protocol: MeshRoutingProtocol;
    neighbors: number;
    routes: number;
  };
  tunnels?: {
    total: number;
    active: number;
  };
  anonymousCircuits?: number;
}
