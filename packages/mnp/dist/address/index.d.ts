/**
 * IPV7 Addressing System
 *
 * THEORETICAL FRAMEWORK - 256-bit addresses with:
 * - Cryptographic node identity (derived from public key)
 * - Geographic proximity encoding (geohash)
 * - Self-allocation (no central authority)
 *
 * Human-readable format: ipv7:<geohash>:<nodeId>:<port>
 * Example: ipv7:dp3w:7a3f2b1c5d8e9f0a1b2c3d4e:8080
 */
import { IPV7Address, AddressFlags, GeoCoordinates, KeyPair } from '../types.js';
import * as geohash from './geohash.js';
export { geohash };
/** Current protocol version */
export declare const IPV7_VERSION = 7;
/** Address byte length (256 bits = 32 bytes) */
export declare const ADDRESS_LENGTH = 32;
/** Node ID byte length (128 bits = 16 bytes) */
export declare const NODE_ID_LENGTH = 16;
/** Geohash precision for routing */
export declare const GEOHASH_PRECISION = 4;
/**
 * Generate a new IPV7 address from a key pair and location
 */
export declare function generateAddress(keyPair: KeyPair, location?: GeoCoordinates, flags?: AddressFlags): IPV7Address;
/**
 * Parse a human-readable IPV7 address string
 * Format: ipv7:<geohash>:<nodeId>:<port>
 */
export declare function parseAddress(addressStr: string): IPV7Address;
/**
 * Format an IPV7 address as a human-readable string
 */
export declare function formatAddress(address: IPV7Address): string;
/**
 * Serialize an IPV7 address to bytes (32 bytes / 256 bits)
 *
 * Layout:
 * - Byte 0: Version (4 bits) + Flags (4 bits)
 * - Bytes 1-4: Geohash as 4 ASCII bytes
 * - Bytes 5-20: Node ID (16 bytes / 128 bits)
 * - Bytes 21-22: Checksum (2 bytes)
 * - Bytes 23-24: Port (2 bytes, 0 if unset)
 * - Bytes 25-31: Reserved for future use
 */
export declare function serializeAddress(address: IPV7Address): Uint8Array;
/**
 * Deserialize an IPV7 address from bytes
 */
export declare function deserializeAddress(buffer: Uint8Array): IPV7Address;
/**
 * Validate an IPV7 address
 */
export declare function validateAddress(address: IPV7Address): boolean;
/**
 * Check if two addresses are equal
 */
export declare function addressEquals(a: IPV7Address, b: IPV7Address): boolean;
/**
 * Calculate routing distance between two addresses
 * Combines geohash proximity and XOR distance
 */
export declare function routingDistance(a: IPV7Address, b: IPV7Address): number;
/**
 * Create a broadcast address for a geohash area
 */
export declare function createBroadcastAddress(geoArea: string): IPV7Address;
/**
 * Check if address matches a broadcast address
 */
export declare function matchesBroadcast(address: IPV7Address, broadcast: IPV7Address): boolean;
declare function bytesToHex(bytes: Uint8Array): string;
declare function hexToBytes(hex: string): Uint8Array;
export { bytesToHex, hexToBytes };
//# sourceMappingURL=index.d.ts.map