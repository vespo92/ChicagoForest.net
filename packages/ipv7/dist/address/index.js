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
import { AddressFlags, } from '../types.js';
import { generateNodeId, crc16 } from '../crypto/index.js';
import * as geohash from './geohash.js';
export { geohash };
/** Current protocol version */
export const IPV7_VERSION = 7;
/** Address byte length (256 bits = 32 bytes) */
export const ADDRESS_LENGTH = 32;
/** Node ID byte length (128 bits = 16 bytes) */
export const NODE_ID_LENGTH = 16;
/** Geohash precision for routing */
export const GEOHASH_PRECISION = 4;
/**
 * Generate a new IPV7 address from a key pair and location
 */
export function generateAddress(keyPair, location, flags = AddressFlags.UNICAST) {
    const nodeId = generateNodeId(keyPair.publicKey);
    // Default to 0,0 if no location (e.g., "s000" geohash)
    const geoStr = location
        ? geohash.encode(location.latitude, location.longitude, GEOHASH_PRECISION)
        : 's000';
    // Calculate checksum of version + flags + geohash + nodeId
    const checksumData = new Uint8Array([
        IPV7_VERSION,
        flags,
        ...Buffer.from(geoStr),
        ...nodeId,
    ]);
    const checksum = crc16(checksumData);
    return {
        version: IPV7_VERSION,
        flags,
        geohash: geoStr,
        nodeId,
        checksum,
    };
}
/**
 * Parse a human-readable IPV7 address string
 * Format: ipv7:<geohash>:<nodeId>:<port>
 */
export function parseAddress(addressStr) {
    const parts = addressStr.split(':');
    if (parts[0] !== 'ipv7') {
        throw new Error('Invalid IPV7 address: must start with "ipv7:"');
    }
    if (parts.length < 3) {
        throw new Error('Invalid IPV7 address: format is ipv7:<geohash>:<nodeId>:<port?>');
    }
    const geoStr = parts[1];
    const nodeIdHex = parts[2];
    const port = parts[3] ? parseInt(parts[3], 10) : undefined;
    if (geoStr.length !== GEOHASH_PRECISION) {
        throw new Error(`Invalid geohash: must be ${GEOHASH_PRECISION} characters`);
    }
    if (nodeIdHex.length !== NODE_ID_LENGTH * 2) {
        throw new Error(`Invalid node ID: must be ${NODE_ID_LENGTH * 2} hex chars`);
    }
    const nodeId = hexToBytes(nodeIdHex);
    // Recalculate checksum
    const checksumData = new Uint8Array([
        IPV7_VERSION,
        AddressFlags.UNICAST,
        ...Buffer.from(geoStr),
        ...nodeId,
    ]);
    const checksum = crc16(checksumData);
    return {
        version: IPV7_VERSION,
        flags: AddressFlags.UNICAST,
        geohash: geoStr,
        nodeId,
        checksum,
        port,
    };
}
/**
 * Format an IPV7 address as a human-readable string
 */
export function formatAddress(address) {
    const nodeIdHex = bytesToHex(address.nodeId);
    let str = `ipv7:${address.geohash}:${nodeIdHex}`;
    if (address.port !== undefined) {
        str += `:${address.port}`;
    }
    return str;
}
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
export function serializeAddress(address) {
    const buffer = new Uint8Array(ADDRESS_LENGTH);
    // Byte 0: Version (high nibble) + Flags (low nibble)
    buffer[0] = ((address.version & 0x0f) << 4) | (address.flags & 0x0f);
    // Bytes 1-4: Geohash
    const geoBytes = Buffer.from(address.geohash);
    buffer.set(geoBytes.subarray(0, 4), 1);
    // Bytes 5-20: Node ID
    buffer.set(address.nodeId.subarray(0, 16), 5);
    // Bytes 21-22: Checksum
    buffer[21] = (address.checksum >> 8) & 0xff;
    buffer[22] = address.checksum & 0xff;
    // Bytes 23-24: Port
    const port = address.port || 0;
    buffer[23] = (port >> 8) & 0xff;
    buffer[24] = port & 0xff;
    // Bytes 25-31: Reserved (zeros)
    return buffer;
}
/**
 * Deserialize an IPV7 address from bytes
 */
export function deserializeAddress(buffer) {
    if (buffer.length < ADDRESS_LENGTH) {
        throw new Error(`Invalid address buffer: need ${ADDRESS_LENGTH} bytes`);
    }
    // Byte 0: Version + Flags
    const version = (buffer[0] >> 4) & 0x0f;
    const flags = buffer[0] & 0x0f;
    // Bytes 1-4: Geohash
    const geoStr = Buffer.from(buffer.subarray(1, 5)).toString('ascii');
    // Bytes 5-20: Node ID
    const nodeId = new Uint8Array(buffer.subarray(5, 21));
    // Bytes 21-22: Checksum
    const checksum = (buffer[21] << 8) | buffer[22];
    // Bytes 23-24: Port
    const portRaw = (buffer[23] << 8) | buffer[24];
    const port = portRaw > 0 ? portRaw : undefined;
    return {
        version,
        flags: flags,
        geohash: geoStr,
        nodeId,
        checksum,
        port,
    };
}
/**
 * Validate an IPV7 address
 */
export function validateAddress(address) {
    // Check version
    if (address.version !== IPV7_VERSION) {
        return false;
    }
    // Check geohash length
    if (address.geohash.length !== GEOHASH_PRECISION) {
        return false;
    }
    // Check node ID length
    if (address.nodeId.length !== NODE_ID_LENGTH) {
        return false;
    }
    // Verify checksum
    const checksumData = new Uint8Array([
        address.version,
        address.flags,
        ...Buffer.from(address.geohash),
        ...address.nodeId,
    ]);
    const expectedChecksum = crc16(checksumData);
    return address.checksum === expectedChecksum;
}
/**
 * Check if two addresses are equal
 */
export function addressEquals(a, b) {
    if (a.version !== b.version)
        return false;
    if (a.flags !== b.flags)
        return false;
    if (a.geohash !== b.geohash)
        return false;
    if (a.nodeId.length !== b.nodeId.length)
        return false;
    for (let i = 0; i < a.nodeId.length; i++) {
        if (a.nodeId[i] !== b.nodeId[i])
            return false;
    }
    return true;
}
/**
 * Calculate routing distance between two addresses
 * Combines geohash proximity and XOR distance
 */
export function routingDistance(a, b) {
    // Geographic component (0-1 based on geohash prefix match)
    const geoPrefix = geohash.commonPrefixLength(a.geohash, b.geohash);
    const geoScore = geoPrefix / GEOHASH_PRECISION;
    // XOR distance component (Kademlia-style)
    let xorDistance = 0;
    for (let i = 0; i < NODE_ID_LENGTH; i++) {
        const xor = a.nodeId[i] ^ b.nodeId[i];
        xorDistance += xor;
    }
    const xorScore = xorDistance / (NODE_ID_LENGTH * 255);
    // Combined metric: prefer geographic proximity, use XOR as tiebreaker
    return (1 - geoScore) * 0.7 + xorScore * 0.3;
}
/**
 * Create a broadcast address for a geohash area
 */
export function createBroadcastAddress(geoArea) {
    const nodeId = new Uint8Array(NODE_ID_LENGTH).fill(0xff);
    const checksumData = new Uint8Array([
        IPV7_VERSION,
        AddressFlags.BROADCAST,
        ...Buffer.from(geoArea.padEnd(4, '0').substring(0, 4)),
        ...nodeId,
    ]);
    const checksum = crc16(checksumData);
    return {
        version: IPV7_VERSION,
        flags: AddressFlags.BROADCAST,
        geohash: geoArea.padEnd(4, '0').substring(0, 4),
        nodeId,
        checksum,
    };
}
/**
 * Check if address matches a broadcast address
 */
export function matchesBroadcast(address, broadcast) {
    if (broadcast.flags !== AddressFlags.BROADCAST) {
        return false;
    }
    // Check if address is within broadcast geohash area
    return address.geohash.startsWith(broadcast.geohash.replace(/0+$/, ''));
}
// Utility functions
function bytesToHex(bytes) {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}
function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}
export { bytesToHex, hexToBytes };
//# sourceMappingURL=index.js.map