/**
 * Identity Module Unit Tests
 *
 * Tests for node identity generation, key management, and cryptographic operations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
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
} from '../src/identity';
import type { NodeId, KeyPair, NodeIdentity } from '@chicago-forest/shared-types';

describe('generateKeyPair', () => {
  it('should generate valid keypair asynchronously', async () => {
    const keyPair = await generateKeyPair();

    expect(keyPair.publicKey).toBeDefined();
    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey).toHaveLength(64);
    expect(keyPair.privateKey).toHaveLength(64);
  });

  it('should generate unique keypairs', async () => {
    const kp1 = await generateKeyPair();
    const kp2 = await generateKeyPair();

    expect(kp1.publicKey).not.toBe(kp2.publicKey);
    expect(kp1.privateKey).not.toBe(kp2.privateKey);
  });
});

describe('generateKeyPairSync', () => {
  it('should generate valid keypair synchronously', () => {
    const keyPair = generateKeyPairSync();

    expect(keyPair.publicKey).toBeDefined();
    expect(keyPair.privateKey).toBeDefined();
    expect(keyPair.publicKey).toHaveLength(64);
    expect(keyPair.privateKey).toHaveLength(64);
  });

  it('should generate unique keypairs', () => {
    const kp1 = generateKeyPairSync();
    const kp2 = generateKeyPairSync();

    expect(kp1.publicKey).not.toBe(kp2.publicKey);
  });
});

describe('deriveNodeId', () => {
  it('should derive node ID from public key', () => {
    const keyPair = generateKeyPairSync();
    const nodeId = deriveNodeId(keyPair.publicKey);

    expect(nodeId).toMatch(/^CFN-[0-9a-f]{32}$/);
  });

  it('should be deterministic', () => {
    const keyPair = generateKeyPairSync();
    const nodeId1 = deriveNodeId(keyPair.publicKey);
    const nodeId2 = deriveNodeId(keyPair.publicKey);

    expect(nodeId1).toBe(nodeId2);
  });

  it('should generate unique IDs for different keys', () => {
    const kp1 = generateKeyPairSync();
    const kp2 = generateKeyPairSync();

    const id1 = deriveNodeId(kp1.publicKey);
    const id2 = deriveNodeId(kp2.publicKey);

    expect(id1).not.toBe(id2);
  });
});

describe('createNodeIdentity', () => {
  it('should create complete identity asynchronously', async () => {
    const identity = await createNodeIdentity();

    expect(identity.nodeId).toMatch(/^CFN-[0-9a-f]{32}$/);
    expect(identity.keyPair.publicKey).toHaveLength(64);
    expect(identity.keyPair.privateKey).toHaveLength(64);
    expect(identity.createdAt).toBeLessThanOrEqual(Date.now());
    expect(identity.version).toBe(IDENTITY_VERSION);
  });

  it('should create consistent node ID from keypair', async () => {
    const identity = await createNodeIdentity();
    const derivedId = deriveNodeId(identity.keyPair.publicKey);

    expect(identity.nodeId).toBe(derivedId);
  });
});

describe('createNodeIdentitySync', () => {
  it('should create complete identity synchronously', () => {
    const identity = createNodeIdentitySync();

    expect(identity.nodeId).toMatch(/^CFN-[0-9a-f]{32}$/);
    expect(identity.keyPair.publicKey).toHaveLength(64);
    expect(identity.keyPair.privateKey).toHaveLength(64);
    expect(identity.createdAt).toBeLessThanOrEqual(Date.now());
    expect(identity.version).toBe(IDENTITY_VERSION);
  });
});

describe('restoreIdentity', () => {
  it('should restore identity from keypair', () => {
    const original = createNodeIdentitySync();
    const restored = restoreIdentity(original.keyPair);

    expect(restored.nodeId).toBe(original.nodeId);
    expect(restored.keyPair).toEqual(original.keyPair);
  });

  it('should use provided createdAt timestamp', () => {
    const keyPair = generateKeyPairSync();
    const timestamp = 1700000000000;

    const identity = restoreIdentity(keyPair, timestamp);

    expect(identity.createdAt).toBe(timestamp);
  });

  it('should use current time if createdAt not provided', () => {
    const keyPair = generateKeyPairSync();
    const before = Date.now();
    const identity = restoreIdentity(keyPair);
    const after = Date.now();

    expect(identity.createdAt).toBeGreaterThanOrEqual(before);
    expect(identity.createdAt).toBeLessThanOrEqual(after);
  });
});

describe('signMessage / verifySignature', () => {
  let identity: NodeIdentity;

  beforeEach(() => {
    identity = createNodeIdentitySync();
  });

  it('should sign and verify string message async', async () => {
    const message = 'Hello, Chicago Forest!';
    const signature = await signMessage(message, identity.keyPair.privateKey);

    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);

    const valid = await verifySignature(message, signature, identity.keyPair.publicKey);
    expect(valid).toBe(true);
  });

  it('should sign and verify Uint8Array message', async () => {
    const message = new TextEncoder().encode('Binary message');
    const signature = await signMessage(message, identity.keyPair.privateKey);

    const valid = await verifySignature(message, signature, identity.keyPair.publicKey);
    expect(valid).toBe(true);
  });

  it('should fail verification with wrong public key', async () => {
    const message = 'Secret message';
    const signature = await signMessage(message, identity.keyPair.privateKey);

    const otherIdentity = createNodeIdentitySync();
    const valid = await verifySignature(message, signature, otherIdentity.keyPair.publicKey);

    expect(valid).toBe(false);
  });

  it('should fail verification with tampered message', async () => {
    const signature = await signMessage('Original', identity.keyPair.privateKey);

    const valid = await verifySignature('Tampered', signature, identity.keyPair.publicKey);
    expect(valid).toBe(false);
  });

  it('should fail verification with invalid signature', async () => {
    const valid = await verifySignature(
      'Message',
      'invalid-signature-not-hex',
      identity.keyPair.publicKey
    );

    expect(valid).toBe(false);
  });
});

describe('signMessageSync / verifySignatureSync', () => {
  let identity: NodeIdentity;

  beforeEach(() => {
    identity = createNodeIdentitySync();
  });

  it('should sign and verify synchronously', () => {
    const message = 'Sync message';
    const signature = signMessageSync(message, identity.keyPair.privateKey);

    expect(signature).toBeDefined();

    const valid = verifySignatureSync(message, signature, identity.keyPair.publicKey);
    expect(valid).toBe(true);
  });

  it('should fail verification with wrong key', () => {
    const message = 'Test';
    const signature = signMessageSync(message, identity.keyPair.privateKey);

    const other = createNodeIdentitySync();
    const valid = verifySignatureSync(message, signature, other.keyPair.publicKey);

    expect(valid).toBe(false);
  });
});

describe('validateNodeId', () => {
  it('should validate matching node ID and public key', () => {
    const identity = createNodeIdentitySync();
    const valid = validateNodeId(identity.nodeId, identity.keyPair.publicKey);

    expect(valid).toBe(true);
  });

  it('should reject mismatched node ID and public key', () => {
    const identity1 = createNodeIdentitySync();
    const identity2 = createNodeIdentitySync();

    const valid = validateNodeId(identity1.nodeId, identity2.keyPair.publicKey);
    expect(valid).toBe(false);
  });
});

describe('createPeerInfo', () => {
  it('should create peer info from identity', () => {
    const identity = createNodeIdentitySync();
    const peerInfo = createPeerInfo(identity);

    expect(peerInfo.nodeId).toBe(identity.nodeId);
    expect(peerInfo.publicKey).toBe(identity.keyPair.publicKey);
    expect(peerInfo.addresses).toEqual([]);
    expect(peerInfo.reputation).toBe(100);
    expect(peerInfo.capabilities).toEqual([]);
  });

  it('should include provided addresses and capabilities', () => {
    const identity = createNodeIdentitySync();
    const addresses = [{ protocol: 'tcp' as const, host: '127.0.0.1', port: 8000 }];
    const capabilities = ['relay' as const, 'storage' as const];

    const peerInfo = createPeerInfo(identity, addresses, capabilities);

    expect(peerInfo.addresses).toEqual(addresses);
    expect(peerInfo.capabilities).toEqual(capabilities);
  });
});

describe('serializeIdentity / deserializeIdentity', () => {
  it('should serialize without private key by default', () => {
    const identity = createNodeIdentitySync();
    const serialized = serializeIdentity(identity);
    const parsed = JSON.parse(serialized);

    expect(parsed.nodeId).toBe(identity.nodeId);
    expect(parsed.publicKey).toBe(identity.keyPair.publicKey);
    expect(parsed.privateKey).toBeUndefined();
  });

  it('should serialize with private key when requested', () => {
    const identity = createNodeIdentitySync();
    const serialized = serializeIdentity(identity, true);
    const parsed = JSON.parse(serialized);

    expect(parsed.privateKey).toBe(identity.keyPair.privateKey);
  });

  it('should deserialize complete identity', () => {
    const identity = createNodeIdentitySync();
    const serialized = serializeIdentity(identity, true);
    const restored = deserializeIdentity(serialized);

    expect(restored).not.toBeNull();
    expect(restored?.nodeId).toBe(identity.nodeId);
    expect(restored?.keyPair.publicKey).toBe(identity.keyPair.publicKey);
    expect(restored?.keyPair.privateKey).toBe(identity.keyPair.privateKey);
  });

  it('should return null for invalid JSON', () => {
    const restored = deserializeIdentity('not-json');
    expect(restored).toBeNull();
  });

  it('should throw for missing private key', () => {
    const identity = createNodeIdentitySync();
    const serialized = serializeIdentity(identity, false);

    expect(() => deserializeIdentity(serialized)).toThrow('missing private key');
  });

  it('should return null for missing required fields', () => {
    const restored = deserializeIdentity(JSON.stringify({ foo: 'bar' }));
    expect(restored).toBeNull();
  });
});

describe('xorDistance', () => {
  it('should return 0 for identical node IDs', () => {
    const nodeId: NodeId = 'CFN-00000000000000000000000000000001';
    const distance = xorDistance(nodeId, nodeId);

    expect(distance).toBe(0n);
  });

  it('should be symmetric', () => {
    const id1: NodeId = 'CFN-00000000000000000000000000000001';
    const id2: NodeId = 'CFN-00000000000000000000000000000002';

    const d1 = xorDistance(id1, id2);
    const d2 = xorDistance(id2, id1);

    expect(d1).toBe(d2);
  });

  it('should give larger distance for more different IDs', () => {
    const base: NodeId = 'CFN-00000000000000000000000000000000';
    const close: NodeId = 'CFN-00000000000000000000000000000001';
    const far: NodeId = 'CFN-ffffffffffffffffffffffffffffffff';

    const closeDistance = xorDistance(base, close);
    const farDistance = xorDistance(base, far);

    expect(closeDistance).toBeLessThan(farDistance);
  });

  it('should handle real node IDs', () => {
    const identity1 = createNodeIdentitySync();
    const identity2 = createNodeIdentitySync();

    const distance = xorDistance(identity1.nodeId, identity2.nodeId);

    expect(typeof distance).toBe('bigint');
    expect(distance).toBeGreaterThan(0n);
  });
});

describe('getBucketIndex', () => {
  it('should return 0 for identical IDs', () => {
    const nodeId: NodeId = 'CFN-00000000000000000000000000000001';
    const index = getBucketIndex(nodeId, nodeId);

    expect(index).toBe(0);
  });

  it('should return higher index for more distant IDs', () => {
    const local: NodeId = 'CFN-00000000000000000000000000000000';
    const close: NodeId = 'CFN-00000000000000000000000000000001';
    const far: NodeId = 'CFN-80000000000000000000000000000000';

    const closeIndex = getBucketIndex(local, close);
    const farIndex = getBucketIndex(local, far);

    expect(closeIndex).toBeLessThan(farIndex);
  });

  it('should be consistent for same inputs', () => {
    const local: NodeId = 'CFN-00000000000000000000000000000000';
    const remote: NodeId = 'CFN-12345678901234567890123456789012';

    const index1 = getBucketIndex(local, remote);
    const index2 = getBucketIndex(local, remote);

    expect(index1).toBe(index2);
  });

  it('should return valid bucket index', () => {
    const identity1 = createNodeIdentitySync();
    const identity2 = createNodeIdentitySync();

    const index = getBucketIndex(identity1.nodeId, identity2.nodeId);

    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(128); // 128-bit IDs
  });
});

describe('constants', () => {
  it('should have correct IDENTITY_VERSION', () => {
    expect(IDENTITY_VERSION).toBe(1);
  });

  it('should have correct NODE_ID_PREFIX', () => {
    expect(NODE_ID_PREFIX).toBe('CFN');
  });
});
