/**
 * IPV7 Cryptographic Utilities
 *
 * THEORETICAL FRAMEWORK - Simplified crypto for demonstration.
 * Production would use libsodium/nacl for proper Ed25519/X25519.
 */

import { createHash, randomBytes } from 'crypto';
import type { KeyPair } from '../types.js';

/**
 * Generate a new Ed25519-like key pair
 * Note: This is simplified - real implementation would use proper Ed25519
 */
export function generateKeyPair(): KeyPair {
  // In production: use ed25519 from libsodium
  const privateKey = randomBytes(32);
  const publicKey = derivePublicKey(privateKey);

  return {
    publicKey,
    privateKey,
    algorithm: 'ed25519-sim', // Simulated for demo
  };
}

/**
 * Derive public key from private key
 */
export function derivePublicKey(privateKey: Uint8Array): Uint8Array {
  // Simplified: hash the private key
  // Real Ed25519 uses scalar multiplication on curve
  const hash = createHash('sha256').update(privateKey).digest();
  return new Uint8Array(hash);
}

/**
 * Generate node ID from public key (truncated hash)
 */
export function generateNodeId(publicKey: Uint8Array): Uint8Array {
  const hash = createHash('sha256').update(publicKey).digest();
  // Take first 16 bytes (128 bits) for node ID
  return new Uint8Array(hash.subarray(0, 16));
}

/**
 * Sign data with private key
 */
export function sign(data: Uint8Array, privateKey: Uint8Array): Uint8Array {
  // Simplified signing - real implementation uses Ed25519
  const combined = Buffer.concat([privateKey, data]);
  const signature = createHash('sha256').update(combined).digest();
  return new Uint8Array(signature);
}

/**
 * Verify signature
 */
export function verify(
  data: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  // Simplified verification
  // Real Ed25519 verifies against the curve
  const privateKeyGuess = createHash('sha256').update(publicKey).digest();
  const combined = Buffer.concat([privateKeyGuess, data]);
  const expectedSig = createHash('sha256').update(combined).digest();

  // Timing-safe comparison would be needed in production
  return Buffer.compare(signature, expectedSig) === 0;
}

/**
 * Hash data with SHA-256
 */
export function hash(data: Uint8Array): Uint8Array {
  return new Uint8Array(createHash('sha256').update(data).digest());
}

/**
 * Generate random bytes
 */
export function random(length: number): Uint8Array {
  return new Uint8Array(randomBytes(length));
}

/**
 * XOR two byte arrays (for DHT distance calculation)
 */
export function xorDistance(a: Uint8Array, b: Uint8Array): Uint8Array {
  const length = Math.max(a.length, b.length);
  const result = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = (a[i] || 0) ^ (b[i] || 0);
  }
  return result;
}

/**
 * Calculate leading zeros in XOR distance (for DHT bucket index)
 */
export function leadingZeros(distance: Uint8Array): number {
  let zeros = 0;
  for (const byte of distance) {
    if (byte === 0) {
      zeros += 8;
    } else {
      // Count leading zeros in this byte
      zeros += Math.clz32(byte) - 24;
      break;
    }
  }
  return zeros;
}

/**
 * Compute CRC16 checksum
 */
export function crc16(data: Uint8Array): number {
  let crc = 0xffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      if (crc & 1) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}
