/**
 * @chicago-forest/headscale-integration - Enrollment Configuration
 *
 * Generates enrollment configuration files for new routers joining
 * the Chicago Forest mesh network via Headscale.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type { PeerAddress } from '@chicago-forest/shared-types';
import type { EnrollmentConfig } from './types';

/** Options for generating enrollment configuration */
export interface GenerateEnrollmentOptions {
  /** URL of the Headscale control server */
  headscaleUrl: string;
  /** Pre-authentication key for the node to register */
  headscaleAuthKey: string;
  /** Bootstrap peers the new node should connect to first */
  bootstrapPeers: PeerAddress[];
  /** Optional node identity (nodeId and publicKey) if pre-generated */
  nodeIdentity?: {
    nodeId: string;
    publicKey: string;
  };
  /** Enable mesh networking on the enrolled node (default: true) */
  meshEnabled?: boolean;
  /** Enable relay capability on the enrolled node (default: false) */
  relayEnabled?: boolean;
  /** Expiration time for the enrollment config as ISO 8601 string */
  expiresAt?: string;
}

/** Default output path for enrollment config */
export const ENROLLMENT_CONFIG_PATH = '/etc/forest/config.json';

/**
 * Generate an enrollment configuration for a new router joining the mesh.
 *
 * The resulting config is intended to be written to /etc/forest/config.json
 * on the target device. It contains everything the Forest daemon needs to
 * register with Headscale and bootstrap into the gossip network.
 *
 * @param options - Enrollment generation options
 * @returns The enrollment configuration object
 *
 * @example
 * ```ts
 * const config = generateEnrollmentConfig({
 *   headscaleUrl: 'https://headscale.forest.example.com',
 *   headscaleAuthKey: 'hskey-auth-abc123...',
 *   bootstrapPeers: [
 *     { protocol: 'udp', host: '10.0.10.1', port: 41641 },
 *     { protocol: 'tcp', host: '10.0.10.2', port: 9000 },
 *   ],
 * });
 *
 * // Write to the node's filesystem
 * fs.writeFileSync('/etc/forest/config.json', JSON.stringify(config, null, 2));
 * ```
 */
export function generateEnrollmentConfig(options: GenerateEnrollmentOptions): EnrollmentConfig {
  if (!options.headscaleUrl) {
    throw new Error('headscaleUrl is required');
  }
  if (!options.headscaleAuthKey) {
    throw new Error('headscaleAuthKey is required');
  }
  if (!options.bootstrapPeers || options.bootstrapPeers.length === 0) {
    throw new Error('At least one bootstrap peer is required');
  }

  const config: EnrollmentConfig = {
    headscaleUrl: options.headscaleUrl.replace(/\/+$/, ''),
    headscaleAuthKey: options.headscaleAuthKey,
    bootstrapPeers: options.bootstrapPeers.map((peer) => ({
      protocol: peer.protocol,
      host: peer.host,
      port: peer.port,
      ...(peer.path ? { path: peer.path } : {}),
    })),
    forestNetwork: {
      meshEnabled: options.meshEnabled ?? true,
      relayEnabled: options.relayEnabled ?? false,
    },
    createdAt: new Date().toISOString(),
  };

  if (options.nodeIdentity) {
    config.nodeIdentity = {
      nodeId: options.nodeIdentity.nodeId,
      publicKey: options.nodeIdentity.publicKey,
    };
  }

  if (options.expiresAt) {
    config.expiresAt = options.expiresAt;
  }

  return config;
}

/**
 * Serialize an enrollment config to a JSON string suitable for writing
 * to the filesystem.
 *
 * @param config - The enrollment configuration
 * @returns Pretty-printed JSON string
 */
export function serializeEnrollmentConfig(config: EnrollmentConfig): string {
  return JSON.stringify(config, null, 2);
}

/**
 * Parse and validate an enrollment config read from disk.
 *
 * @param raw - Raw JSON string from /etc/forest/config.json
 * @returns Parsed and validated enrollment configuration
 * @throws Error if the config is invalid or expired
 */
export function parseEnrollmentConfig(raw: string): EnrollmentConfig {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid enrollment config: not valid JSON');
  }

  const config = parsed as Record<string, unknown>;

  if (typeof config.headscaleUrl !== 'string') {
    throw new Error('Invalid enrollment config: missing headscaleUrl');
  }
  if (typeof config.headscaleAuthKey !== 'string') {
    throw new Error('Invalid enrollment config: missing headscaleAuthKey');
  }
  if (!Array.isArray(config.bootstrapPeers) || config.bootstrapPeers.length === 0) {
    throw new Error('Invalid enrollment config: missing or empty bootstrapPeers');
  }

  // Check expiration
  if (typeof config.expiresAt === 'string') {
    const expiry = new Date(config.expiresAt);
    if (expiry.getTime() < Date.now()) {
      throw new Error(`Enrollment config expired at ${config.expiresAt}`);
    }
  }

  return parsed as EnrollmentConfig;
}
