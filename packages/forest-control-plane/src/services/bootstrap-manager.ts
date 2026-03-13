/**
 * @chicago-forest/forest-control-plane - Bootstrap Manager
 *
 * Maintains the list of bootstrap peers that new nodes connect to
 * when first joining the Forest mesh. Periodically health-checks peers.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type { PeerAddress } from '@chicago-forest/shared-types';
import type { ForestStore } from '../store/sqlite';
import type { ForestCPConfig } from '../config';
import type { BootstrapPeer } from '../types';

export class BootstrapManager {
  private healthCheckTimer?: ReturnType<typeof setInterval>;

  constructor(
    private store: ForestStore,
    private config: ForestCPConfig,
  ) {}

  /** Start periodic health-checking of bootstrap peers */
  start(): void {
    this.healthCheckTimer = setInterval(() => {
      this.healthCheckAll().catch(() => {
        // Health check failures are expected for offline peers
      });
    }, this.config.bootstrapCheckIntervalSec * 1000);
  }

  /** Stop periodic health checks */
  stop(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /** Add or update a bootstrap peer */
  addPeer(peer: BootstrapPeer): void {
    this.store.upsertBootstrapPeer(peer);
  }

  /** Remove a bootstrap peer */
  removePeer(nodeId: string): boolean {
    return this.store.removeBootstrapPeer(nodeId);
  }

  /** Get all bootstrap peers (healthy only by default) */
  getBootstrapPeers(healthyOnly = true): BootstrapPeer[] {
    return this.store.getBootstrapPeers(healthyOnly);
  }

  /** Get flattened list of bootstrap peer addresses (for enrollment bundles) */
  getBootstrapPeerAddresses(): PeerAddress[] {
    const peers = this.store.getBootstrapPeers(true);
    return peers.flatMap((p) => p.addresses);
  }

  /** Health-check all bootstrap peers */
  private async healthCheckAll(): Promise<void> {
    const peers = this.store.getBootstrapPeers(false);
    const now = new Date().toISOString();

    for (const peer of peers) {
      const healthy = await this.checkPeerHealth(peer);
      this.store.upsertBootstrapPeer({
        ...peer,
        lastHealthCheck: now,
        healthy,
      });
    }
  }

  /**
   * Check if a bootstrap peer is reachable.
   * In a real implementation this would attempt a TCP/UDP connection.
   * For now, we check if the peer has a recent heartbeat in the node registry.
   */
  private async checkPeerHealth(peer: BootstrapPeer): Promise<boolean> {
    // Check if the node is registered and active
    const node = this.store.getBootstrapPeers(false).find((p) => p.nodeId === peer.nodeId);
    if (!node) return false;

    // Consider healthy if last health check was within 2x the check interval
    const lastCheck = new Date(peer.lastHealthCheck).getTime();
    const maxAge = this.config.bootstrapCheckIntervalSec * 2 * 1000;
    return Date.now() - lastCheck < maxAge;
  }
}
