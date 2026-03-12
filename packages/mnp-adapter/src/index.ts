/**
 * @chicago-forest/mnp-adapter
 *
 * Integration layer for the companion MNP protocol package.
 * This adapter bridges between the wireless mesh layer and the
 * theoretical MNP (Mycelium Network Protocol).
 *
 * The MNP package handles physical/wired connections while this
 * adapter enables interoperability with the wireless mesh.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @example
 * ```typescript
 * import { MNPAdapter, createMNPAddress } from '@chicago-forest/mnp-adapter';
 *
 * const adapter = new MNPAdapter({
 *   localAddress: createMNPAddress('forest', 1, 1),
 *   translateToIPv4: false,
 *   translateToIPv6: true,
 * });
 *
 * await adapter.start();
 * ```
 */

import type {
  MNPAddress,
  MNPHeader,
  MNPAdapterConfig,
  NodeId,
  PeerAddress,
} from '@chicago-forest/shared-types';
import { ForestEventEmitter, getEventBus } from '@chicago-forest/p2p-core';

// =============================================================================
// MNP ADDRESS FORMAT
// =============================================================================

/**
 * MNP address structure
 * Format: <realm>:<zone>:<node>:<subnet>:<host>
 *
 * Realms:
 * - forest: Chicago Forest Network
 * - global: Internet-accessible
 * - local: Local network only
 * - anon: Anonymous/onion addresses
 */
export interface MNPAddressComponents {
  realm: 'forest' | 'global' | 'local' | 'anon';
  zone: number;     // Geographic/logical zone (0-65535)
  node: number;     // Node identifier (0-65535)
  subnet: number;   // Subnet (0-255)
  host: number;     // Host (0-255)
}

/**
 * Create an MNP address string
 */
export function createMNPAddress(
  realm: MNPAddressComponents['realm'],
  zone: number,
  node: number,
  subnet = 0,
  host = 1
): MNPAddress {
  return `${realm}:${zone.toString(16).padStart(4, '0')}:${node.toString(16).padStart(4, '0')}:${subnet.toString(16).padStart(2, '0')}:${host.toString(16).padStart(2, '0')}`;
}

/**
 * Parse an MNP address string
 */
export function parseMNPAddress(address: MNPAddress): MNPAddressComponents | null {
  const parts = address.split(':');
  if (parts.length !== 5) return null;

  const realm = parts[0] as MNPAddressComponents['realm'];
  if (!['forest', 'global', 'local', 'anon'].includes(realm)) return null;

  return {
    realm,
    zone: parseInt(parts[1], 16),
    node: parseInt(parts[2], 16),
    subnet: parseInt(parts[3], 16),
    host: parseInt(parts[4], 16),
  };
}

/**
 * Convert MNP address to IPv6 (for compatibility)
 */
export function mnpToIPv6(address: MNPAddress): string {
  const components = parseMNPAddress(address);
  if (!components) return '::1';

  // Map realm to IPv6 prefix
  const realmPrefix: Record<string, string> = {
    forest: 'fd42',  // Unique local address
    global: '2001',  // Global unicast
    local: 'fe80',   // Link-local
    anon: 'fc00',    // Unique local
  };

  const prefix = realmPrefix[components.realm] || 'fd42';

  return `${prefix}:${components.zone.toString(16)}:${components.node.toString(16)}::${components.subnet.toString(16)}:${components.host.toString(16)}`;
}

/**
 * Convert IPv6 to MNP address
 */
export function ipv6ToMNP(ipv6: string): MNPAddress {
  // Simplified conversion - in production, more complex mapping
  const parts = ipv6.split(':').filter(Boolean);

  let realm: MNPAddressComponents['realm'] = 'forest';
  if (parts[0] === '2001') realm = 'global';
  else if (parts[0] === 'fe80') realm = 'local';
  else if (parts[0] === 'fc00') realm = 'anon';

  const zone = parseInt(parts[1] || '0', 16);
  const node = parseInt(parts[2] || '0', 16);

  return createMNPAddress(realm, zone, node);
}

/**
 * Convert MNP to Node ID
 */
export function mnpToNodeId(address: MNPAddress): NodeId {
  const components = parseMNPAddress(address);
  if (!components) return 'CFN-0000000000000000';

  const hash = `${components.zone.toString(16).padStart(8, '0')}${components.node.toString(16).padStart(8, '0')}`;
  return `CFN-${hash}`;
}

// =============================================================================
// MNP PACKET
// =============================================================================

/**
 * MNP packet structure
 */
export interface MNPPacket {
  header: MNPHeader;
  payload: Uint8Array;
}

/**
 * Create an MNP packet header
 */
export function createMNPHeader(
  source: MNPAddress,
  destination: MNPAddress,
  payloadLength: number,
  nextHeader = 17 // UDP by default
): MNPHeader {
  return {
    version: 7,
    sourceAddress: source,
    destAddress: destination,
    hopLimit: 64,
    payloadLength,
    nextHeader,
  };
}

/**
 * Serialize MNP header to bytes
 */
export function serializeMNPHeader(header: MNPHeader): Uint8Array {
  const buffer = new ArrayBuffer(40); // Fixed header size
  const view = new DataView(buffer);

  // Version (4 bits) + Traffic Class (8 bits) + Flow Label (20 bits)
  view.setUint32(0, (header.version << 28) | 0);

  // Payload Length (16 bits) + Next Header (8 bits) + Hop Limit (8 bits)
  view.setUint16(4, header.payloadLength);
  view.setUint8(6, header.nextHeader);
  view.setUint8(7, header.hopLimit);

  // Source Address (encoded as bytes)
  const srcBytes = encodeMNPAddress(header.sourceAddress);
  new Uint8Array(buffer, 8, 16).set(srcBytes);

  // Destination Address
  const dstBytes = encodeMNPAddress(header.destAddress);
  new Uint8Array(buffer, 24, 16).set(dstBytes);

  return new Uint8Array(buffer);
}

/**
 * Deserialize MNP header from bytes
 */
export function deserializeMNPHeader(data: Uint8Array): MNPHeader | null {
  if (data.length < 40) return null;

  const view = new DataView(data.buffer, data.byteOffset);

  const versionField = view.getUint32(0);
  const version = (versionField >> 28) & 0xf;

  if (version !== 7) return null;

  return {
    version: 7,
    payloadLength: view.getUint16(4),
    nextHeader: view.getUint8(6),
    hopLimit: view.getUint8(7),
    sourceAddress: decodeMNPAddress(data.slice(8, 24)),
    destAddress: decodeMNPAddress(data.slice(24, 40)),
  };
}

/**
 * Encode MNP address to bytes
 */
function encodeMNPAddress(address: MNPAddress): Uint8Array {
  const components = parseMNPAddress(address);
  if (!components) return new Uint8Array(16);

  const bytes = new Uint8Array(16);
  const view = new DataView(bytes.buffer);

  // Realm indicator
  const realmByte = { forest: 0x42, global: 0x01, local: 0x80, anon: 0xfc }[components.realm] || 0x42;
  bytes[0] = realmByte;

  view.setUint16(2, components.zone);
  view.setUint16(4, components.node);
  bytes[14] = components.subnet;
  bytes[15] = components.host;

  return bytes;
}

/**
 * Decode MNP address from bytes
 */
function decodeMNPAddress(bytes: Uint8Array): MNPAddress {
  const view = new DataView(bytes.buffer, bytes.byteOffset);

  const realmByte = bytes[0];
  const realm: MNPAddressComponents['realm'] =
    realmByte === 0x01 ? 'global' :
    realmByte === 0x80 ? 'local' :
    realmByte === 0xfc ? 'anon' : 'forest';

  const zone = view.getUint16(2);
  const node = view.getUint16(4);
  const subnet = bytes[14];
  const host = bytes[15];

  return createMNPAddress(realm, zone, node, subnet, host);
}

// =============================================================================
// MNP ADAPTER
// =============================================================================

/**
 * MNP Protocol Adapter
 * Bridges between wireless mesh and MNP protocol
 */
export class MNPAdapter {
  private config: MNPAdapterConfig;
  private eventBus: ForestEventEmitter;
  private running = false;
  private addressTable: Map<MNPAddress, NodeId> = new Map();

  constructor(config: MNPAdapterConfig, eventBus?: ForestEventEmitter) {
    this.config = config;
    this.eventBus = eventBus ?? getEventBus();
  }

  /**
   * Start the adapter
   */
  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
  }

  /**
   * Stop the adapter
   */
  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;
  }

  /**
   * Get local MNP address
   */
  getLocalAddress(): MNPAddress {
    return this.config.localAddress;
  }

  /**
   * Register a node ID with an MNP address
   */
  registerAddress(address: MNPAddress, nodeId: NodeId): void {
    this.addressTable.set(address, nodeId);
  }

  /**
   * Lookup node ID for an MNP address
   */
  lookupNodeId(address: MNPAddress): NodeId | null {
    return this.addressTable.get(address) ?? null;
  }

  /**
   * Encapsulate payload in MNP packet
   */
  encapsulate(
    destination: MNPAddress,
    payload: Uint8Array
  ): MNPPacket {
    const header = createMNPHeader(
      this.config.localAddress,
      destination,
      payload.length
    );

    return { header, payload };
  }

  /**
   * Decapsulate MNP packet
   */
  decapsulate(packet: MNPPacket): {
    source: MNPAddress;
    destination: MNPAddress;
    payload: Uint8Array;
  } {
    return {
      source: packet.header.sourceAddress,
      destination: packet.header.destAddress,
      payload: packet.payload,
    };
  }

  /**
   * Translate MNP packet to IPv6 (if enabled)
   */
  translateToIPv6(packet: MNPPacket): Uint8Array | null {
    if (!this.config.translateToIPv6) return null;

    // In production: Create proper IPv6 packet
    // This is a stub
    return packet.payload;
  }

  /**
   * Check if adapter is running
   */
  isRunning(): boolean {
    return this.running;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// All functions, classes, constants, and types are already exported inline above.
// No additional re-exports needed.
