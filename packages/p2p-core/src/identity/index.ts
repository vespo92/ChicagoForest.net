/**
 * @chicago-forest/p2p-core - Identity Module
 *
 * Handles node identity generation, key management, and peer ID derivation.
 * Uses Ed25519 for digital signatures and X25519 for key exchange.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import type {
  NodeIdentity,
  KeyPair,
  NodeId,
  PublicKey,
  PrivateKey,
  PeerInfo,
  PeerAddress,
  NodeCapability,
} from '@chicago-forest/shared-types';

// Configure ed25519 to use sha512
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

/**
 * Version number for identity format - increment on breaking changes
 */
export const IDENTITY_VERSION = 1;

/**
 * Prefix for Chicago Forest node IDs
 */
export const NODE_ID_PREFIX = 'CFN';

/**
 * Generate a new Ed25519 keypair for node identity
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const privateKeyBytes = ed25519.utils.randomPrivateKey();
  const publicKeyBytes = await ed25519.getPublicKeyAsync(privateKeyBytes);

  return {
    privateKey: bytesToHex(privateKeyBytes),
    publicKey: bytesToHex(publicKeyBytes),
  };
}

/**
 * Generate keypair synchronously (blocking)
 */
export function generateKeyPairSync(): KeyPair {
  const privateKeyBytes = ed25519.utils.randomPrivateKey();
  const publicKeyBytes = ed25519.getPublicKey(privateKeyBytes);

  return {
    privateKey: bytesToHex(privateKeyBytes),
    publicKey: bytesToHex(publicKeyBytes),
  };
}

/**
 * Derive a Node ID from a public key
 * Format: CFN-<first 16 bytes of sha256(pubkey) as hex>
 */
export function deriveNodeId(publicKey: PublicKey): NodeId {
  const pubKeyBytes = hexToBytes(publicKey);
  const hash = sha256(pubKeyBytes);
  const shortHash = bytesToHex(hash.slice(0, 16));
  return `${NODE_ID_PREFIX}-${shortHash}`;
}

/**
 * Create a complete node identity
 */
export async function createNodeIdentity(): Promise<NodeIdentity> {
  const keyPair = await generateKeyPair();
  const nodeId = deriveNodeId(keyPair.publicKey);

  return {
    nodeId,
    keyPair,
    createdAt: Date.now(),
    version: IDENTITY_VERSION,
  };
}

/**
 * Create identity synchronously
 */
export function createNodeIdentitySync(): NodeIdentity {
  const keyPair = generateKeyPairSync();
  const nodeId = deriveNodeId(keyPair.publicKey);

  return {
    nodeId,
    keyPair,
    createdAt: Date.now(),
    version: IDENTITY_VERSION,
  };
}

/**
 * Restore identity from stored keypair
 */
export function restoreIdentity(keyPair: KeyPair, createdAt?: number): NodeIdentity {
  const nodeId = deriveNodeId(keyPair.publicKey);

  return {
    nodeId,
    keyPair,
    createdAt: createdAt ?? Date.now(),
    version: IDENTITY_VERSION,
  };
}

/**
 * Sign a message with the node's private key
 */
export async function signMessage(
  message: Uint8Array | string,
  privateKey: PrivateKey
): Promise<string> {
  const msgBytes = typeof message === 'string'
    ? new TextEncoder().encode(message)
    : message;
  const privKeyBytes = hexToBytes(privateKey);
  const signature = await ed25519.signAsync(msgBytes, privKeyBytes);
  return bytesToHex(signature);
}

/**
 * Sign message synchronously
 */
export function signMessageSync(
  message: Uint8Array | string,
  privateKey: PrivateKey
): string {
  const msgBytes = typeof message === 'string'
    ? new TextEncoder().encode(message)
    : message;
  const privKeyBytes = hexToBytes(privateKey);
  const signature = ed25519.sign(msgBytes, privKeyBytes);
  return bytesToHex(signature);
}

/**
 * Verify a signature against a public key
 */
export async function verifySignature(
  message: Uint8Array | string,
  signature: string,
  publicKey: PublicKey
): Promise<boolean> {
  try {
    const msgBytes = typeof message === 'string'
      ? new TextEncoder().encode(message)
      : message;
    const sigBytes = hexToBytes(signature);
    const pubKeyBytes = hexToBytes(publicKey);
    return await ed25519.verifyAsync(sigBytes, msgBytes, pubKeyBytes);
  } catch {
    return false;
  }
}

/**
 * Verify signature synchronously
 */
export function verifySignatureSync(
  message: Uint8Array | string,
  signature: string,
  publicKey: PublicKey
): boolean {
  try {
    const msgBytes = typeof message === 'string'
      ? new TextEncoder().encode(message)
      : message;
    const sigBytes = hexToBytes(signature);
    const pubKeyBytes = hexToBytes(publicKey);
    return ed25519.verify(sigBytes, msgBytes, pubKeyBytes);
  } catch {
    return false;
  }
}

/**
 * Validate that a node ID matches a public key
 */
export function validateNodeId(nodeId: NodeId, publicKey: PublicKey): boolean {
  const derived = deriveNodeId(publicKey);
  return derived === nodeId;
}

/**
 * Create peer info from identity
 */
export function createPeerInfo(
  identity: NodeIdentity,
  addresses: PeerAddress[] = [],
  capabilities: NodeCapability[] = []
): PeerInfo {
  return {
    nodeId: identity.nodeId,
    publicKey: identity.keyPair.publicKey,
    addresses,
    lastSeen: Date.now(),
    reputation: 100, // Start with neutral reputation
    capabilities,
    metadata: {},
  };
}

/**
 * Serialize identity for storage (EXCLUDES private key by default)
 */
export function serializeIdentity(
  identity: NodeIdentity,
  includePrivateKey = false
): string {
  const serialized = {
    nodeId: identity.nodeId,
    publicKey: identity.keyPair.publicKey,
    privateKey: includePrivateKey ? identity.keyPair.privateKey : undefined,
    createdAt: identity.createdAt,
    version: identity.version,
  };
  return JSON.stringify(serialized);
}

/**
 * Deserialize identity from storage
 */
export function deserializeIdentity(data: string): NodeIdentity | null {
  try {
    const parsed = JSON.parse(data);
    if (!parsed.nodeId || !parsed.publicKey) {
      return null;
    }

    // If private key is missing, we can't fully restore
    if (!parsed.privateKey) {
      throw new Error('Identity data missing private key');
    }

    return {
      nodeId: parsed.nodeId,
      keyPair: {
        publicKey: parsed.publicKey,
        privateKey: parsed.privateKey,
      },
      createdAt: parsed.createdAt ?? Date.now(),
      version: parsed.version ?? IDENTITY_VERSION,
    };
  } catch {
    return null;
  }
}

/**
 * Calculate XOR distance between two node IDs (for DHT routing)
 */
export function xorDistance(nodeId1: NodeId, nodeId2: NodeId): bigint {
  // Extract the hash portion (after CFN-)
  const hash1 = nodeId1.replace(`${NODE_ID_PREFIX}-`, '');
  const hash2 = nodeId2.replace(`${NODE_ID_PREFIX}-`, '');

  const bytes1 = hexToBytes(hash1);
  const bytes2 = hexToBytes(hash2);

  let result = 0n;
  for (let i = 0; i < bytes1.length; i++) {
    result = (result << 8n) | BigInt(bytes1[i] ^ bytes2[i]);
  }

  return result;
}

/**
 * Get the bucket index for a peer (based on XOR distance)
 * Used for Kademlia-style DHT routing
 */
export function getBucketIndex(localNodeId: NodeId, remoteNodeId: NodeId): number {
  const distance = xorDistance(localNodeId, remoteNodeId);
  if (distance === 0n) return 0;

  // Find the position of the most significant bit
  let bucket = 0;
  let temp = distance;
  while (temp > 0n) {
    temp >>= 1n;
    bucket++;
  }

  return bucket - 1;
}

export default {
  generateKeyPair,
  generateKeyPairSync,
  createNodeIdentity,
  createNodeIdentitySync,
  restoreIdentity,
  deriveNodeId,
  signMessage,
  signMessageSync,
  verifySignature,
  verifySignatureSync,
  validateNodeId,
  createPeerInfo,
  serializeIdentity,
  deserializeIdentity,
  xorDistance,
  getBucketIndex,
  IDENTITY_VERSION,
  NODE_ID_PREFIX,
};
