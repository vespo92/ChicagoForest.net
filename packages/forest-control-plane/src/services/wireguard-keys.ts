/**
 * @chicago-forest/forest-control-plane - WireGuard Key Service
 *
 * Manages WireGuard keypair operations via the Headscale integration.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { HeadscaleClient } from '@chicago-forest/headscale-integration';
import type { HeadscalePreAuthKey, HeadscaleNode } from '@chicago-forest/headscale-integration';
import type { ForestCPConfig } from '../config';

export class WireGuardKeyService {
  private client: HeadscaleClient;

  constructor(private config: ForestCPConfig) {
    this.client = new HeadscaleClient({
      serverUrl: config.headscaleUrl,
      auth: { type: 'apiKey', apiKey: config.headscaleApiKey },
    });
  }

  /** Create a pre-auth key for node enrollment */
  async createPreauthKey(user: string, validityHours: number): Promise<HeadscalePreAuthKey> {
    const expiration = new Date(Date.now() + validityHours * 60 * 60 * 1000).toISOString();
    const response = await this.client.createPreauthKey({
      user,
      reusable: false,
      ephemeral: false,
      expiration,
      aclTags: ['tag:forest-node'],
    });
    return response.data;
  }

  /** Get a node from Headscale by ID */
  async getHeadscaleNode(nodeId: string): Promise<HeadscaleNode | undefined> {
    try {
      const response = await this.client.getNode(nodeId);
      return response.data;
    } catch {
      return undefined;
    }
  }

  /** Delete a node from Headscale */
  async deleteHeadscaleNode(nodeId: string): Promise<boolean> {
    try {
      await this.client.deleteNode({ nodeId });
      return true;
    } catch {
      return false;
    }
  }

  /** List all Headscale nodes, optionally for a specific user */
  async listHeadscaleNodes(user?: string): Promise<HeadscaleNode[]> {
    const response = await this.client.listNodes(user ? { user } : undefined);
    return response.data;
  }

  /** Ensure the forest user exists in Headscale */
  async ensureUser(user: string): Promise<void> {
    try {
      await this.client.createUser({ name: user });
    } catch {
      // User already exists, that's fine
    }
  }
}
