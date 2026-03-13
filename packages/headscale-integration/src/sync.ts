/**
 * @chicago-forest/headscale-integration - Forest/Headscale Sync
 *
 * Synchronizes the Headscale node list with the Forest gossip peer list
 * and bridges MagicDNS records to Headscale DNS entries.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { EventEmitter } from 'eventemitter3';
import type { PeerAddress } from '@chicago-forest/shared-types';
import { HeadscaleClient } from './client';
import type {
  HeadscaleNode,
  HeadscaleDNSEntry,
  ForestHeadscaleSyncConfig,
} from './types';

/** Events emitted by ForestHeadscaleSync */
export interface ForestHeadscaleSyncEvents {
  'sync:started': () => void;
  'sync:completed': (nodeCount: number) => void;
  'sync:error': (error: Error) => void;
  'node:discovered': (node: HeadscaleNode) => void;
  'node:removed': (nodeId: string) => void;
  'dns:bridged': (entry: HeadscaleDNSEntry) => void;
}

/** Default sync interval: 30 seconds */
const DEFAULT_SYNC_INTERVAL_MS = 30_000;

/**
 * ForestHeadscaleSync continuously synchronizes the Headscale control plane
 * with the Forest gossip network.
 *
 * On each sync interval it:
 * 1. Fetches the current Headscale node list
 * 2. Converts nodes to Forest PeerAddress format
 * 3. Broadcasts the peer list via the gossip network
 * 4. Optionally bridges MagicDNS records
 */
export class ForestHeadscaleSync extends EventEmitter<ForestHeadscaleSyncEvents> {
  private readonly client: HeadscaleClient;
  private readonly config: Required<
    Pick<ForestHeadscaleSyncConfig, 'syncIntervalMs' | 'bridgeDns'>
  > &
    ForestHeadscaleSyncConfig;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private knownNodeIds: Set<string> = new Set();
  private dnsEntries: Map<string, HeadscaleDNSEntry> = new Map();
  private running = false;

  constructor(config: ForestHeadscaleSyncConfig) {
    super();
    this.config = {
      syncIntervalMs: DEFAULT_SYNC_INTERVAL_MS,
      bridgeDns: true,
      ...config,
    };
    this.client = new HeadscaleClient(config.headscale);
  }

  /** Start the periodic sync loop */
  start(): void {
    if (this.running) return;
    this.running = true;

    // Run an initial sync immediately
    void this.sync();

    // Schedule periodic syncs
    this.syncTimer = setInterval(() => {
      void this.sync();
    }, this.config.syncIntervalMs);
  }

  /** Stop the periodic sync loop */
  stop(): void {
    this.running = false;
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /** Whether the sync loop is currently running */
  get isRunning(): boolean {
    return this.running;
  }

  /** Get the current set of known Headscale node IDs */
  get currentNodeIds(): ReadonlySet<string> {
    return this.knownNodeIds;
  }

  /** Get the current DNS bridge entries */
  get currentDnsEntries(): ReadonlyMap<string, HeadscaleDNSEntry> {
    return this.dnsEntries;
  }

  /** Execute a single sync cycle */
  async sync(): Promise<void> {
    this.emit('sync:started');

    try {
      const response = await this.client.listNodes();
      let nodes = response.data;

      // Apply tag filter if configured
      if (this.config.tagFilter && this.config.tagFilter.length > 0) {
        const filterTags = new Set(this.config.tagFilter);
        nodes = nodes.filter((node) =>
          node.forcedTags.some((tag) => filterTags.has(tag)) ||
          node.validTags.some((tag) => filterTags.has(tag)),
        );
      }

      // Detect new and removed nodes
      const currentIds = new Set(nodes.map((n) => n.id));
      for (const node of nodes) {
        if (!this.knownNodeIds.has(node.id)) {
          this.emit('node:discovered', node);
        }
      }
      for (const oldId of this.knownNodeIds) {
        if (!currentIds.has(oldId)) {
          this.emit('node:removed', oldId);
        }
      }
      this.knownNodeIds = currentIds;

      // Convert to Forest PeerAddress format and broadcast
      const peers = this.nodesToPeerAddresses(nodes);
      this.config.gossipBroadcast(peers);

      // Bridge DNS if enabled
      if (this.config.bridgeDns) {
        this.bridgeDnsEntries(nodes);
      }

      this.emit('sync:completed', nodes.length);
    } catch (error) {
      this.emit('sync:error', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Convert Headscale nodes to Forest PeerAddress format.
   *
   * Each Headscale node has one or more IP addresses assigned by the
   * control server. We map each to a PeerAddress using the Tailscale
   * WireGuard port (41641) over UDP, which is the standard Tailscale
   * data plane transport.
   */
  private nodesToPeerAddresses(nodes: HeadscaleNode[]): PeerAddress[] {
    const peers: PeerAddress[] = [];

    for (const node of nodes) {
      if (!node.online) continue;

      for (const ip of node.ipAddresses) {
        peers.push({
          protocol: 'udp',
          host: ip,
          port: 41641,
          path: `/headscale/${node.givenName}`,
        });
      }
    }

    return peers;
  }

  /**
   * Bridge Headscale MagicDNS names into DNS entries that can be
   * shared with the Forest network.
   *
   * Headscale assigns each node a MagicDNS name based on
   * `<givenName>.<user>.headscale.net`. We create corresponding
   * A/AAAA records for Forest DNS resolution.
   */
  private bridgeDnsEntries(nodes: HeadscaleNode[]): void {
    for (const node of nodes) {
      const baseName = `${node.givenName}.${node.user.name}`;

      for (const ip of node.ipAddresses) {
        const isV6 = ip.includes(':');
        const entryKey = `${baseName}-${isV6 ? 'AAAA' : 'A'}`;
        const entry: HeadscaleDNSEntry = {
          name: `${baseName}.forest.local`,
          type: isV6 ? 'AAAA' : 'A',
          value: ip,
        };

        if (!this.dnsEntries.has(entryKey)) {
          this.dnsEntries.set(entryKey, entry);
          this.emit('dns:bridged', entry);
        }
      }
    }
  }
}
