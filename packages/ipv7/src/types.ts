/**
 * IPV7 Protocol Types
 *
 * THEORETICAL FRAMEWORK - This is an AI-generated conceptual protocol
 * that extends beyond IPv6 with mesh-native, cryptographically-secure,
 * geolocation-aware addressing for P2P networks.
 *
 * IPV7 = "1 better than IPv6":
 * - 256-bit addresses (vs IPv6's 128-bit)
 * - Built-in cryptographic identity
 * - Native geolocation for proximity routing
 * - Mesh-first design for P2P networks
 * - Multi-path routing support
 */

/**
 * IPV7 Address - 256-bit (32 bytes) address structure
 *
 * Format: [version:4][flags:4][geohash:32][nodeId:128][checksum:16] = 256 bits
 *
 * Human-readable: ipv7:<geohash>:<nodeId>:<port>
 * Example: ipv7:dp3w:7a3f2b1c5d8e9f0a1b2c3d4e5f6a7b8c:8080
 */
export interface IPV7Address {
  /** Protocol version (4 bits) */
  version: number;
  /** Address flags (4 bits) - multicast, anycast, etc. */
  flags: AddressFlags;
  /** Geohash prefix for proximity routing (32 bits / 4 bytes) */
  geohash: string;
  /** Cryptographic node identifier (128 bits / 16 bytes) - derived from public key */
  nodeId: Uint8Array;
  /** Checksum for validation (16 bits) */
  checksum: number;
  /** Optional service port */
  port?: number;
}

/**
 * Address flags for special routing behavior
 */
export enum AddressFlags {
  /** Standard unicast address */
  UNICAST = 0b0000,
  /** Multicast to group */
  MULTICAST = 0b0001,
  /** Anycast - route to nearest */
  ANYCAST = 0b0010,
  /** Broadcast to all reachable nodes */
  BROADCAST = 0b0011,
  /** Reserved for future use */
  RESERVED = 0b1111,
}

/**
 * Public/Private key pair for node identity
 */
export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  /** Key algorithm (ed25519, x25519, etc.) */
  algorithm: string;
}

/**
 * Geographic coordinates for geohash generation
 */
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  /** Optional altitude in meters */
  altitude?: number;
  /** Accuracy in meters */
  accuracy?: number;
}

/**
 * IPV7 Packet Types
 */
export enum PacketType {
  /** Standard data packet */
  DATA = 0x01,
  /** Control/signaling packet */
  CONTROL = 0x02,
  /** Route discovery request */
  ROUTE_REQUEST = 0x03,
  /** Route discovery reply */
  ROUTE_REPLY = 0x04,
  /** Peer discovery announcement */
  ANNOUNCE = 0x05,
  /** Keep-alive/heartbeat */
  HEARTBEAT = 0x06,
  /** Error/rejection */
  ERROR = 0x07,
  /** Acknowledgment */
  ACK = 0x08,
}

/**
 * IPV7 Packet Header - Fixed 64-byte header
 */
export interface PacketHeader {
  /** Protocol version (1 byte) */
  version: number;
  /** Packet type (1 byte) */
  type: PacketType;
  /** Header flags (2 bytes) */
  flags: number;
  /** Time-to-live / hop limit (1 byte) */
  ttl: number;
  /** Flow label for QoS (3 bytes) */
  flowLabel: number;
  /** Payload length in bytes (4 bytes) */
  payloadLength: number;
  /** Source address (32 bytes) */
  source: IPV7Address;
  /** Destination address (32 bytes) */
  destination: IPV7Address;
  /** Sequence number (4 bytes) */
  sequenceNumber: number;
  /** Timestamp - Unix milliseconds (8 bytes) */
  timestamp: bigint;
}

/**
 * Complete IPV7 Packet
 */
export interface Packet {
  header: PacketHeader;
  /** Variable-length payload */
  payload: Uint8Array;
  /** Optional extensions */
  extensions?: PacketExtension[];
}

/**
 * Packet extension for additional features
 */
export interface PacketExtension {
  type: ExtensionType;
  length: number;
  data: Uint8Array;
}

export enum ExtensionType {
  /** Routing hints */
  ROUTING = 0x01,
  /** Fragmentation info */
  FRAGMENT = 0x02,
  /** Encryption metadata */
  ENCRYPTION = 0x03,
  /** Quality of service */
  QOS = 0x04,
  /** Source routing path */
  SOURCE_ROUTE = 0x05,
}

/**
 * Peer information in the network
 */
export interface PeerInfo {
  /** Peer's IPV7 address */
  address: IPV7Address;
  /** Public key for verification */
  publicKey: Uint8Array;
  /** Last seen timestamp */
  lastSeen: number;
  /** Round-trip time in ms */
  rtt?: number;
  /** Peer's capabilities */
  capabilities: PeerCapabilities;
  /** Transport endpoints */
  endpoints: TransportEndpoint[];
  /** Peer reputation score (0-100) */
  reputation: number;
}

export interface PeerCapabilities {
  /** Can relay packets for others */
  relay: boolean;
  /** Supports multipath routing */
  multipath: boolean;
  /** Has persistent storage */
  storage: boolean;
  /** Connected to internet gateway */
  gateway: boolean;
  /** Maximum bandwidth in Mbps */
  bandwidth?: number;
}

/**
 * Transport endpoint (how to reach a peer)
 */
export interface TransportEndpoint {
  type: TransportType;
  address: string;
  port: number;
  /** Priority (lower = preferred) */
  priority: number;
}

export enum TransportType {
  /** Direct WiFi (ad-hoc or mesh) */
  WIFI_DIRECT = 'wifi-direct',
  /** Standard WiFi through router */
  WIFI = 'wifi',
  /** Ethernet LAN */
  ETHERNET = 'ethernet',
  /** WebRTC for browser compatibility */
  WEBRTC = 'webrtc',
  /** TCP socket */
  TCP = 'tcp',
  /** UDP socket */
  UDP = 'udp',
  /** LoRa radio (long range) */
  LORA = 'lora',
  /** Bluetooth */
  BLUETOOTH = 'bluetooth',
}

/**
 * Routing table entry
 */
export interface RouteEntry {
  /** Destination address or prefix */
  destination: IPV7Address;
  /** Prefix length for CIDR-like routing */
  prefixLength: number;
  /** Next hop peer */
  nextHop: IPV7Address;
  /** Route metric (lower = better) */
  metric: number;
  /** When this route expires */
  expiry: number;
  /** How many hops to destination */
  hopCount: number;
  /** Which interface to use */
  interface: string;
}

/**
 * DHT (Distributed Hash Table) entry
 */
export interface DHTEntry {
  key: Uint8Array;
  value: Uint8Array;
  /** Entry creation time */
  timestamp: number;
  /** Time-to-live in seconds */
  ttl: number;
  /** Publisher's address */
  publisher: IPV7Address;
  /** Signature from publisher */
  signature: Uint8Array;
}

/**
 * Node statistics
 */
export interface NodeStats {
  /** Packets sent */
  packetsSent: number;
  /** Packets received */
  packetsReceived: number;
  /** Packets forwarded/relayed */
  packetsForwarded: number;
  /** Bytes sent */
  bytesSent: bigint;
  /** Bytes received */
  bytesReceived: bigint;
  /** Connected peers count */
  connectedPeers: number;
  /** Uptime in seconds */
  uptime: number;
  /** Routes in routing table */
  routeCount: number;
}

/**
 * Event types emitted by IPV7 node
 */
export interface IPV7Events {
  'peer:discovered': (peer: PeerInfo) => void;
  'peer:connected': (peer: PeerInfo) => void;
  'peer:disconnected': (address: IPV7Address) => void;
  'packet:received': (packet: Packet) => void;
  'packet:sent': (packet: Packet) => void;
  'route:added': (route: RouteEntry) => void;
  'route:removed': (destination: IPV7Address) => void;
  'error': (error: Error) => void;
}

/**
 * Configuration for IPV7 node
 */
export interface NodeConfig {
  /** Node's key pair (generated if not provided) */
  keyPair?: KeyPair;
  /** Geographic location for geohash */
  location?: GeoCoordinates;
  /** Listen ports for different transports */
  listen?: {
    tcp?: number;
    udp?: number;
    webrtc?: boolean;
  };
  /** Bootstrap peers to connect to initially */
  bootstrapPeers?: TransportEndpoint[];
  /** Maximum number of connections */
  maxPeers?: number;
  /** Enable packet relaying */
  enableRelay?: boolean;
  /** DHT replication factor */
  dhtReplication?: number;
}
