/**
 * IPV7 Packet System
 *
 * THEORETICAL FRAMEWORK - Packet structure for P2P mesh networks
 *
 * Packet Layout (variable length):
 * - Header: 64 bytes fixed
 * - Extensions: Variable (optional)
 * - Payload: Variable
 */

import {
  Packet,
  PacketHeader,
  PacketType,
  PacketExtension,
  ExtensionType,
  IPV7Address,
} from '../types.js';
import {
  serializeAddress,
  deserializeAddress,
  ADDRESS_LENGTH,
} from '../address/index.js';
import { crc16 } from '../crypto/index.js';

/** Header size in bytes */
export const HEADER_SIZE = 64;

/** Maximum packet size */
export const MAX_PACKET_SIZE = 65535;

/** Maximum payload size */
export const MAX_PAYLOAD_SIZE = MAX_PACKET_SIZE - HEADER_SIZE;

/** Maximum TTL */
export const MAX_TTL = 64;

/** Default TTL */
export const DEFAULT_TTL = 32;

// Sequence number counter
let sequenceCounter = 0;

/**
 * Create a new data packet
 */
export function createPacket(
  source: IPV7Address,
  destination: IPV7Address,
  payload: Uint8Array,
  options: {
    type?: PacketType;
    ttl?: number;
    flowLabel?: number;
    extensions?: PacketExtension[];
  } = {}
): Packet {
  if (payload.length > MAX_PAYLOAD_SIZE) {
    throw new Error(`Payload too large: ${payload.length} > ${MAX_PAYLOAD_SIZE}`);
  }

  const header: PacketHeader = {
    version: 7,
    type: options.type ?? PacketType.DATA,
    flags: 0,
    ttl: options.ttl ?? DEFAULT_TTL,
    flowLabel: options.flowLabel ?? 0,
    payloadLength: payload.length,
    source,
    destination,
    sequenceNumber: sequenceCounter++,
    timestamp: BigInt(Date.now()),
  };

  return {
    header,
    payload,
    extensions: options.extensions,
  };
}

/**
 * Create a route request packet
 */
export function createRouteRequest(
  source: IPV7Address,
  destination: IPV7Address,
  ttl: number = MAX_TTL
): Packet {
  return createPacket(source, destination, new Uint8Array(0), {
    type: PacketType.ROUTE_REQUEST,
    ttl,
  });
}

/**
 * Create a route reply packet
 */
export function createRouteReply(
  source: IPV7Address,
  destination: IPV7Address,
  hops: IPV7Address[]
): Packet {
  // Encode hops in payload
  const payload = new Uint8Array(hops.length * ADDRESS_LENGTH);
  hops.forEach((hop, i) => {
    payload.set(serializeAddress(hop), i * ADDRESS_LENGTH);
  });

  return createPacket(source, destination, payload, {
    type: PacketType.ROUTE_REPLY,
  });
}

/**
 * Create an announcement packet (peer discovery)
 */
export function createAnnounce(
  source: IPV7Address,
  capabilities: Uint8Array
): Packet {
  // Broadcast destination (all 0xff in node ID)
  const broadcastDest: IPV7Address = {
    version: 7,
    flags: 0x03, // BROADCAST
    geohash: source.geohash,
    nodeId: new Uint8Array(16).fill(0xff),
    checksum: 0,
  };

  return createPacket(source, broadcastDest, capabilities, {
    type: PacketType.ANNOUNCE,
    ttl: 4, // Limited hop announcement
  });
}

/**
 * Create a heartbeat/keepalive packet
 */
export function createHeartbeat(
  source: IPV7Address,
  destination: IPV7Address
): Packet {
  return createPacket(source, destination, new Uint8Array(0), {
    type: PacketType.HEARTBEAT,
    ttl: 1,
  });
}

/**
 * Create an acknowledgment packet
 */
export function createAck(
  source: IPV7Address,
  destination: IPV7Address,
  sequenceNumber: number
): Packet {
  const payload = new Uint8Array(4);
  new DataView(payload.buffer).setUint32(0, sequenceNumber, false);

  return createPacket(source, destination, payload, {
    type: PacketType.ACK,
    ttl: DEFAULT_TTL,
  });
}

/**
 * Serialize a packet to bytes
 */
export function serializePacket(packet: Packet): Uint8Array {
  const extensionsSize =
    packet.extensions?.reduce((sum, ext) => sum + 4 + ext.data.length, 0) ?? 0;
  const totalSize = HEADER_SIZE + extensionsSize + packet.payload.length;

  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);

  let offset = 0;

  // Header serialization
  buffer[offset++] = packet.header.version;
  buffer[offset++] = packet.header.type;
  view.setUint16(offset, packet.header.flags, false);
  offset += 2;
  buffer[offset++] = packet.header.ttl;
  buffer[offset++] = (packet.header.flowLabel >> 16) & 0xff;
  view.setUint16(offset, packet.header.flowLabel & 0xffff, false);
  offset += 2;
  view.setUint32(offset, packet.header.payloadLength, false);
  offset += 4;

  // Source address (32 bytes)
  buffer.set(serializeAddress(packet.header.source), offset);
  offset += ADDRESS_LENGTH;

  // Destination address (32 bytes)
  buffer.set(serializeAddress(packet.header.destination), offset);
  offset += ADDRESS_LENGTH;

  // Sequence number (4 bytes)
  view.setUint32(offset, packet.header.sequenceNumber, false);
  offset += 4;

  // Timestamp (8 bytes)
  view.setBigUint64(offset, packet.header.timestamp, false);
  offset += 8;

  // Extensions (if any)
  if (packet.extensions) {
    for (const ext of packet.extensions) {
      buffer[offset++] = ext.type;
      buffer[offset++] = 0; // Reserved
      view.setUint16(offset, ext.data.length, false);
      offset += 2;
      buffer.set(ext.data, offset);
      offset += ext.data.length;
    }
  }

  // Payload
  buffer.set(packet.payload, offset);

  return buffer;
}

/**
 * Deserialize a packet from bytes
 */
export function deserializePacket(buffer: Uint8Array): Packet {
  if (buffer.length < HEADER_SIZE) {
    throw new Error(`Packet too small: ${buffer.length} < ${HEADER_SIZE}`);
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset);
  let offset = 0;

  // Header deserialization
  const version = buffer[offset++];
  const type = buffer[offset++] as PacketType;
  const flags = view.getUint16(offset, false);
  offset += 2;
  const ttl = buffer[offset++];
  const flowLabelHigh = buffer[offset++];
  const flowLabelLow = view.getUint16(offset, false);
  const flowLabel = (flowLabelHigh << 16) | flowLabelLow;
  offset += 2;
  const payloadLength = view.getUint32(offset, false);
  offset += 4;

  // Source address
  const source = deserializeAddress(buffer.subarray(offset, offset + ADDRESS_LENGTH));
  offset += ADDRESS_LENGTH;

  // Destination address
  const destination = deserializeAddress(
    buffer.subarray(offset, offset + ADDRESS_LENGTH)
  );
  offset += ADDRESS_LENGTH;

  // Sequence number
  const sequenceNumber = view.getUint32(offset, false);
  offset += 4;

  // Timestamp
  const timestamp = view.getBigUint64(offset, false);
  offset += 8;

  const header: PacketHeader = {
    version,
    type,
    flags,
    ttl,
    flowLabel,
    payloadLength,
    source,
    destination,
    sequenceNumber,
    timestamp,
  };

  // Parse extensions and payload
  const extensions: PacketExtension[] = [];
  const expectedPayloadStart = buffer.length - payloadLength;

  while (offset < expectedPayloadStart) {
    const extType = buffer[offset++] as ExtensionType;
    offset++; // Skip reserved byte
    const extLength = view.getUint16(offset, false);
    offset += 2;
    const extData = new Uint8Array(buffer.subarray(offset, offset + extLength));
    offset += extLength;

    extensions.push({
      type: extType,
      length: extLength,
      data: extData,
    });
  }

  // Payload
  const payload = new Uint8Array(buffer.subarray(offset, offset + payloadLength));

  return {
    header,
    payload,
    extensions: extensions.length > 0 ? extensions : undefined,
  };
}

/**
 * Decrement TTL and check if packet should be forwarded
 */
export function decrementTTL(packet: Packet): boolean {
  if (packet.header.ttl <= 1) {
    return false; // Drop packet
  }
  packet.header.ttl--;
  return true;
}

/**
 * Check if packet is expired (based on timestamp)
 */
export function isExpired(packet: Packet, maxAgeMs: number = 60000): boolean {
  const age = Date.now() - Number(packet.header.timestamp);
  return age > maxAgeMs;
}

/**
 * Calculate packet checksum
 */
export function calculateChecksum(packet: Packet): number {
  const serialized = serializePacket(packet);
  return crc16(serialized);
}

/**
 * Get packet type name
 */
export function getPacketTypeName(type: PacketType): string {
  const names: Record<PacketType, string> = {
    [PacketType.DATA]: 'DATA',
    [PacketType.CONTROL]: 'CONTROL',
    [PacketType.ROUTE_REQUEST]: 'ROUTE_REQUEST',
    [PacketType.ROUTE_REPLY]: 'ROUTE_REPLY',
    [PacketType.ANNOUNCE]: 'ANNOUNCE',
    [PacketType.HEARTBEAT]: 'HEARTBEAT',
    [PacketType.ERROR]: 'ERROR',
    [PacketType.ACK]: 'ACK',
  };
  return names[type] ?? 'UNKNOWN';
}
