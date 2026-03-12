/**
 * IPV7 Cryptographic Utilities
 *
 * THEORETICAL FRAMEWORK - Simplified crypto for demonstration.
 * Production would use libsodium/nacl for proper Ed25519/X25519.
 */
import type { KeyPair } from '../types.js';
/**
 * Generate a new Ed25519-like key pair
 * Note: This is simplified - real implementation would use proper Ed25519
 */
export declare function generateKeyPair(): KeyPair;
/**
 * Derive public key from private key
 */
export declare function derivePublicKey(privateKey: Uint8Array): Uint8Array;
/**
 * Generate node ID from public key (truncated hash)
 */
export declare function generateNodeId(publicKey: Uint8Array): Uint8Array;
/**
 * Sign data with private key
 */
export declare function sign(data: Uint8Array, privateKey: Uint8Array): Uint8Array;
/**
 * Verify signature
 */
export declare function verify(data: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean;
/**
 * Hash data with SHA-256
 */
export declare function hash(data: Uint8Array): Uint8Array;
/**
 * Generate random bytes
 */
export declare function random(length: number): Uint8Array;
/**
 * XOR two byte arrays (for DHT distance calculation)
 */
export declare function xorDistance(a: Uint8Array, b: Uint8Array): Uint8Array;
/**
 * Calculate leading zeros in XOR distance (for DHT bucket index)
 */
export declare function leadingZeros(distance: Uint8Array): number;
/**
 * Compute CRC16 checksum
 */
export declare function crc16(data: Uint8Array): number;
//# sourceMappingURL=index.d.ts.map