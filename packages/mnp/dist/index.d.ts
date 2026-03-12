/**
 * IPV7 Protocol - Next-Generation P2P Addressing for Mesh Networks
 *
 * ⚠️ THEORETICAL FRAMEWORK - AI-GENERATED CONCEPTUAL PROTOCOL ⚠️
 *
 * This is an experimental protocol implementation for the Chicago Forest Network.
 * IPV7 is "1 better than IPv6" - a conceptual next-generation protocol featuring:
 *
 * - 256-bit addresses (double IPv6's 128-bit)
 * - Built-in cryptographic identity (derived from public keys)
 * - Native geolocation awareness (geohash prefix for proximity routing)
 * - Mesh-native DHT routing (no centralized infrastructure)
 * - Multi-path support for resilience
 * - P2P-first design (works over WiFi, Ethernet, radio)
 *
 * This package is for educational and experimental purposes.
 * It is NOT a replacement for standard internet protocols.
 *
 * @packageDocumentation
 */
export * from './types.js';
export { generateAddress, parseAddress, formatAddress, serializeAddress, deserializeAddress, validateAddress, addressEquals, routingDistance, createBroadcastAddress, matchesBroadcast, bytesToHex, hexToBytes, geohash, IPV7_VERSION, ADDRESS_LENGTH, NODE_ID_LENGTH, GEOHASH_PRECISION, } from './address/index.js';
export { generateKeyPair, derivePublicKey, generateNodeId, sign, verify, hash, random, xorDistance, leadingZeros, crc16, } from './crypto/index.js';
export { createPacket, createRouteRequest, createRouteReply, createAnnounce, createHeartbeat, createAck, serializePacket, deserializePacket, decrementTTL, isExpired, calculateChecksum, getPacketTypeName, HEADER_SIZE, MAX_PACKET_SIZE, MAX_PAYLOAD_SIZE, MAX_TTL, DEFAULT_TTL, } from './packet/index.js';
export { DHT, generateDHTKey, Router } from './routing/index.js';
export { Transport, TCPTransport, UDPTransport, MemoryTransport, TransportManager, } from './transport/index.js';
export { IPV7Node, createTestNode } from './node/index.js';
/**
 * Protocol version
 */
export declare const VERSION = "0.1.0";
/**
 * Protocol identifier
 */
export declare const PROTOCOL_ID = "ipv7";
/**
 * Quick start: Create and start an IPV7 node
 *
 * @example
 * ```typescript
 * import { createNode } from '@chicago-forest/ipv7';
 *
 * const node = await createNode({
 *   location: { latitude: 41.8781, longitude: -87.6298 }, // Chicago
 *   listen: { tcp: 7777, udp: 7778 }
 * });
 *
 * console.log('Node address:', node.getAddressString());
 *
 * // Listen for messages
 * node.on('packet:received', (packet) => {
 *   console.log('Received:', packet.payload);
 * });
 *
 * // Send message to another node
 * await node.send(otherNodeAddress, Buffer.from('Hello, Forest!'));
 * ```
 */
export declare function createNode(config?: {
    location?: {
        latitude: number;
        longitude: number;
    };
    listen?: {
        tcp?: number;
        udp?: number;
    };
    bootstrapPeers?: Array<{
        type: string;
        address: string;
        port: number;
    }>;
}): Promise<import("./node/index.js").IPV7Node>;
//# sourceMappingURL=index.d.ts.map