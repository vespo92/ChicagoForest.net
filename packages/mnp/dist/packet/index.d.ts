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
import { Packet, PacketType, PacketExtension, IPV7Address } from '../types.js';
/** Header size in bytes */
export declare const HEADER_SIZE = 64;
/** Maximum packet size */
export declare const MAX_PACKET_SIZE = 65535;
/** Maximum payload size */
export declare const MAX_PAYLOAD_SIZE: number;
/** Maximum TTL */
export declare const MAX_TTL = 64;
/** Default TTL */
export declare const DEFAULT_TTL = 32;
/**
 * Create a new data packet
 */
export declare function createPacket(source: IPV7Address, destination: IPV7Address, payload: Uint8Array, options?: {
    type?: PacketType;
    ttl?: number;
    flowLabel?: number;
    extensions?: PacketExtension[];
}): Packet;
/**
 * Create a route request packet
 */
export declare function createRouteRequest(source: IPV7Address, destination: IPV7Address, ttl?: number): Packet;
/**
 * Create a route reply packet
 */
export declare function createRouteReply(source: IPV7Address, destination: IPV7Address, hops: IPV7Address[]): Packet;
/**
 * Create an announcement packet (peer discovery)
 */
export declare function createAnnounce(source: IPV7Address, capabilities: Uint8Array): Packet;
/**
 * Create a heartbeat/keepalive packet
 */
export declare function createHeartbeat(source: IPV7Address, destination: IPV7Address): Packet;
/**
 * Create an acknowledgment packet
 */
export declare function createAck(source: IPV7Address, destination: IPV7Address, sequenceNumber: number): Packet;
/**
 * Serialize a packet to bytes
 */
export declare function serializePacket(packet: Packet): Uint8Array;
/**
 * Deserialize a packet from bytes
 */
export declare function deserializePacket(buffer: Uint8Array): Packet;
/**
 * Decrement TTL and check if packet should be forwarded
 */
export declare function decrementTTL(packet: Packet): boolean;
/**
 * Check if packet is expired (based on timestamp)
 */
export declare function isExpired(packet: Packet, maxAgeMs?: number): boolean;
/**
 * Calculate packet checksum
 */
export declare function calculateChecksum(packet: Packet): number;
/**
 * Get packet type name
 */
export declare function getPacketTypeName(type: PacketType): string;
//# sourceMappingURL=index.d.ts.map