/**
 * @chicago-forest/forest-control-plane - Mesh Coordinator
 *
 * Tracks mesh topology, distributes batman-adv configuration,
 * and computes mesh health metrics.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type { ForestStore } from '../store/sqlite';
import type { ForestCPConfig } from '../config';
import type {
  MeshTopology,
  MeshHealth,
  MeshLink,
  MeshNodeConfig,
} from '../types';
import type { FrequencyBand, MeshRoutingProtocol } from '@chicago-forest/shared-types';

export class MeshCoordinator {
  private linkPruneTimer?: ReturnType<typeof setInterval>;

  /** Max age of a mesh link before it's pruned (5 minutes) */
  private static readonly LINK_MAX_AGE_SEC = 300;

  constructor(
    private store: ForestStore,
    private config: ForestCPConfig,
  ) {}

  /** Start periodic link pruning */
  start(): void {
    this.linkPruneTimer = setInterval(() => {
      this.store.pruneStaleLinks(MeshCoordinator.LINK_MAX_AGE_SEC);
    }, 60_000);
  }

  /** Stop periodic tasks */
  stop(): void {
    if (this.linkPruneTimer) {
      clearInterval(this.linkPruneTimer);
      this.linkPruneTimer = undefined;
    }
  }

  /** Get the current mesh topology graph */
  getTopology(): MeshTopology {
    const nodes = this.store.listNodes().filter((n) => n.status !== 'deregistered');
    const links = this.store.getMeshLinks();

    return {
      nodes: nodes.map((n) => ({
        nodeId: n.nodeId,
        name: n.name,
        status: n.status,
        ipAddresses: n.ipAddresses,
        location: n.location,
      })),
      links,
      updatedAt: new Date().toISOString(),
    };
  }

  /** Get mesh health summary */
  getHealth(): MeshHealth {
    const nodes = this.store.listNodes().filter((n) => n.status !== 'deregistered');
    const links = this.store.getMeshLinks();

    const activeNodes = nodes.filter((n) => n.status === 'active').length;
    const degradedNodes = nodes.filter((n) => n.status === 'degraded').length;
    const offlineNodes = nodes.filter((n) => n.status === 'offline').length;

    const avgQuality = links.length > 0
      ? links.reduce((sum, l) => sum + l.quality, 0) / links.length
      : 0;

    return {
      totalNodes: nodes.length,
      activeNodes,
      degradedNodes,
      offlineNodes,
      totalLinks: links.length,
      averageLinkQuality: Math.round(avgQuality * 100) / 100,
      updatedAt: new Date().toISOString(),
    };
  }

  /** Record a mesh link (called during heartbeat processing) */
  recordLink(link: MeshLink): void {
    this.store.upsertMeshLink(link);
  }

  /** Get the default mesh configuration for new nodes */
  getDefaultMeshConfig(): MeshNodeConfig {
    return {
      protocol: this.config.mesh.protocol as MeshRoutingProtocol,
      interface: this.config.mesh.interface,
      channel: this.config.mesh.channel,
      essid: this.config.mesh.essid,
      band: this.config.mesh.band as FrequencyBand,
      mtu: this.config.mesh.mtu,
      hopPenalty: 15,
      origInterval: 1000,
    };
  }
}
