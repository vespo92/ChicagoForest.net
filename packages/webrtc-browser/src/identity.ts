/**
 * Browser-compatible identity generation
 *
 * Uses Web Crypto API for key generation in browser environments.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type { NodeId, NodeIdentity, KeyPair, PublicKey } from '@chicago-forest/shared-types';

const IDENTITY_VERSION = 1;
const NODE_ID_PREFIX = 'cf';

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Generate a cryptographic hash using Web Crypto API
 */
async function sha256(data: Uint8Array): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', data);
}

/**
 * Generate a random hex string
 */
function randomHex(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bufferToHex(bytes.buffer);
}

/**
 * Derive a node ID from a public key
 */
export async function deriveNodeId(publicKey: PublicKey): Promise<NodeId> {
  const keyBytes = hexToBuffer(publicKey);
  const hash = await sha256(keyBytes);
  const hashHex = bufferToHex(hash);
  return `${NODE_ID_PREFIX}:${hashHex.slice(0, 40)}`;
}

/**
 * Generate a keypair using Web Crypto API (ECDSA P-256 for browser compatibility)
 */
export async function generateBrowserKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  );

  const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: bufferToHex(publicKeyBuffer),
    privateKey: bufferToHex(privateKeyBuffer),
  };
}

/**
 * Create a browser node identity
 */
export async function createBrowserIdentity(): Promise<NodeIdentity> {
  const keyPair = await generateBrowserKeyPair();
  const nodeId = await deriveNodeId(keyPair.publicKey);

  return {
    nodeId,
    keyPair,
    createdAt: Date.now(),
    version: IDENTITY_VERSION,
  };
}

/**
 * Generate a short peer ID for WebRTC (PeerJS compatible)
 */
export function generatePeerId(prefix: string = 'cf-'): string {
  return `${prefix}${randomHex(8)}`;
}

/**
 * Serialize identity to JSON for storage
 */
export function serializeBrowserIdentity(identity: NodeIdentity): string {
  return JSON.stringify(identity);
}

/**
 * Deserialize identity from JSON
 */
export function deserializeBrowserIdentity(json: string): NodeIdentity {
  const parsed = JSON.parse(json);
  if (!parsed.nodeId || !parsed.keyPair) {
    throw new Error('Invalid identity format');
  }
  return parsed as NodeIdentity;
}

/**
 * Store identity in browser localStorage
 */
export function storeIdentity(identity: NodeIdentity, key: string = 'forest-identity'): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, serializeBrowserIdentity(identity));
  }
}

/**
 * Retrieve identity from browser localStorage
 */
export function retrieveIdentity(key: string = 'forest-identity'): NodeIdentity | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  const stored = localStorage.getItem(key);
  if (!stored) {
    return null;
  }
  try {
    return deserializeBrowserIdentity(stored);
  } catch {
    return null;
  }
}

/**
 * Get or create browser identity
 */
export async function getOrCreateIdentity(storageKey: string = 'forest-identity'): Promise<NodeIdentity> {
  const existing = retrieveIdentity(storageKey);
  if (existing) {
    return existing;
  }

  const newIdentity = await createBrowserIdentity();
  storeIdentity(newIdentity, storageKey);
  return newIdentity;
}

/**
 * Sign a message using the stored private key
 */
export async function signMessage(
  message: Uint8Array,
  privateKeyHex: string
): Promise<string> {
  const privateKeyBuffer = hexToBuffer(privateKeyHex);

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    message
  );

  return bufferToHex(signature);
}

/**
 * Verify a signature
 */
export async function verifySignature(
  message: Uint8Array,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    const publicKeyBuffer = hexToBuffer(publicKeyHex);
    const signatureBuffer = hexToBuffer(signatureHex);

    const publicKey = await crypto.subtle.importKey(
      'raw',
      publicKeyBuffer,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );

    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      signatureBuffer,
      message
    );
  } catch {
    return false;
  }
}
