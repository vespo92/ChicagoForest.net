/**
 * @chicago-forest/libp2p-transport - Discovery Module
 *
 * Peer discovery integration using libp2p DHT, mDNS, and bootstrap.
 * Provides production-grade peer discovery for the Chicago Forest Network.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { createLibp2p, type Libp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { identify } from '@libp2p/identify';
import { kadDHT } from '@libp2p/kad-dht';
import { mdns } from '@libp2p/mdns';
import { bootstrap } from '@libp2p/bootstrap';
import { multiaddr } from '@multiformats/multiaddr';
import { ForestNode, type PeerAddress } from './node';

/**
 * Simplified peer info type
 */
export interface SimplePeerInfo {
  id: string;
  multiaddrs: string[];
}

/**
 * Forest PeerInfo type (local definition)
 */
export interface PeerInfo {
  nodeId: string;
  addresses: PeerAddress[];
  lastSeen: number;
}

/**
 * Discovery mode configuration
 */
export type DiscoveryMode = 'client' | 'server' | 'hybrid';

/**
 * Configuration for Forest Discovery
 */
export interface ForestDiscoveryConfig {
  /** Enable Kademlia DHT */
  enableDHT?: boolean;
  /** DHT mode: client only queries, server stores */
  dhtMode?: DiscoveryMode;
  /** Enable mDNS for local peer discovery */
  enableMdns?: boolean;
  /** mDNS service name */
  mdnsServiceName?: string;
  /** Bootstrap peer multiaddrs */
  bootstrapPeers?: string[];
  /** Discovery interval in ms */
  discoveryInterval?: number;
  /** Maximum peers to discover per round */
  maxDiscoveredPeers?: number;
}

/**
 * Default discovery configuration
 */
export const DEFAULT_DISCOVERY_CONFIG: Required<ForestDiscoveryConfig> = {
  enableDHT: true,
  dhtMode: 'hybrid',
  enableMdns: true,
  mdnsServiceName: 'chicago-forest-network',
  bootstrapPeers: [],
  discoveryInterval: 30000,
  maxDiscoveredPeers: 50,
};

/**
 * Discovered peer event data
 */
export interface DiscoveredPeerEvent {
  peerId: string;
  multiaddrs: string[];
  source: 'dht' | 'mdns' | 'bootstrap';
}

/**
 * Event handler type
 */
export type DiscoveryEventHandler = (event: DiscoveredPeerEvent) => void;

/**
 * Forest Discovery - Integrated peer discovery system
 *
 * Combines multiple discovery mechanisms:
 * - Kademlia DHT for global peer discovery
 * - mDNS for local network discovery
 * - Bootstrap nodes for initial peer set
 */
export class ForestDiscovery {
  private node: Libp2p | null = null;
  private readonly config: Required<ForestDiscoveryConfig>;
  private started = false;
  private discoveryHandlers: DiscoveryEventHandler[] = [];
  private discoveredPeers: Map<string, DiscoveredPeerEvent> = new Map();

  constructor(config: ForestDiscoveryConfig = {}) {
    this.config = { ...DEFAULT_DISCOVERY_CONFIG, ...config };
  }

  /**
   * Get the underlying libp2p node
   */
  get libp2p(): Libp2p {
    if (!this.node) {
      throw new Error('ForestDiscovery not started');
    }
    return this.node;
  }

  /**
   * Start discovery services
   */
  async start(existingNode?: Libp2p): Promise<void> {
    if (this.started) return;

    if (existingNode) {
      this.node = existingNode;
    } else {
      // Create a new node with discovery services
      this.node = await this.createDiscoveryNode();
      await this.node.start();
    }

    // Set up peer discovery event handlers
    this.node.addEventListener('peer:discovery', (evt: CustomEvent) => {
      const peerInfo = evt.detail as { id: { toString(): string }; multiaddrs: Array<{ toString(): string }> };
      this.handlePeerDiscovery(peerInfo, 'dht');
    });

    this.started = true;
  }

  /**
   * Stop discovery services
   */
  async stop(): Promise<void> {
    if (!this.started || !this.node) return;

    await this.node.stop();
    this.started = false;
    this.node = null;
  }

  /**
   * Create a libp2p node configured for discovery
   */
  private async createDiscoveryNode(): Promise<Libp2p> {
    // Build peer discovery modules
    const peerDiscovery: unknown[] = [];

    // Add bootstrap if peers provided
    if (this.config.bootstrapPeers.length > 0) {
      peerDiscovery.push(
        bootstrap({
          list: this.config.bootstrapPeers,
        })
      );
    }

    // Add mDNS if enabled
    if (this.config.enableMdns) {
      peerDiscovery.push(
        mdns({
          interval: this.config.discoveryInterval,
        })
      );
    }

    // Build services
    const services: Record<string, unknown> = {
      identify: identify(),
    };

    // Add DHT if enabled
    if (this.config.enableDHT) {
      const dhtConfig = {
        clientMode: this.config.dhtMode === 'client',
      };

      services.dht = kadDHT(dhtConfig);
    }

    return createLibp2p({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0'],
      },
      transports: [tcp(), webSockets()] as never,
      connectionEncrypters: [noise()],
      streamMuxers: [yamux()],
      peerDiscovery: peerDiscovery as never,
      services,
    });
  }

  /**
   * Handle peer discovery event
   */
  private handlePeerDiscovery(
    peerInfo: { id: { toString(): string }; multiaddrs: Array<{ toString(): string }> },
    source: 'dht' | 'mdns' | 'bootstrap'
  ): void {
    const peerId = peerInfo.id.toString();
    const multiaddrs = peerInfo.multiaddrs.map((ma: { toString(): string }) => ma.toString());

    const event: DiscoveredPeerEvent = {
      peerId,
      multiaddrs,
      source,
    };

    // Update discovered peers cache
    this.discoveredPeers.set(peerId, event);

    // Notify handlers
    for (const handler of this.discoveryHandlers) {
      try {
        handler(event);
      } catch {
        // Ignore handler errors
      }
    }
  }

  /**
   * Register discovery event handler
   */
  onPeerDiscovered(handler: DiscoveryEventHandler): void {
    this.discoveryHandlers.push(handler);
  }

  /**
   * Remove discovery event handler
   */
  offPeerDiscovered(handler: DiscoveryEventHandler): void {
    const index = this.discoveryHandlers.indexOf(handler);
    if (index !== -1) {
      this.discoveryHandlers.splice(index, 1);
    }
  }

  /**
   * Get all discovered peers
   */
  getDiscoveredPeers(): DiscoveredPeerEvent[] {
    return Array.from(this.discoveredPeers.values());
  }

  /**
   * Find peers close to a key using DHT
   */
  async findPeers(key: Uint8Array, count: number = 20): Promise<SimplePeerInfo[]> {
    if (!this.config.enableDHT || !this.node) {
      return [];
    }

    const dht = (this.node.services as Record<string, unknown>).dht as {
      getClosestPeers: (key: Uint8Array) => AsyncIterable<{ name: string; peer?: { id: { toString(): string }; multiaddrs: Array<{ toString(): string }> } }>;
    } | undefined;
    if (!dht) return [];

    const peers: SimplePeerInfo[] = [];

    try {
      for await (const event of dht.getClosestPeers(key)) {
        if (event.name === 'FINAL_PEER' && event.peer) {
          peers.push({
            id: event.peer.id.toString(),
            multiaddrs: event.peer.multiaddrs.map((ma: { toString(): string }) => ma.toString()),
          });
          if (peers.length >= count) break;
        }
      }
    } catch {
      // DHT query failed
    }

    return peers;
  }

  /**
   * Find providers for a content key
   */
  async findProviders(key: Uint8Array, count: number = 20): Promise<SimplePeerInfo[]> {
    if (!this.config.enableDHT || !this.node) {
      return [];
    }

    const dht = (this.node.services as Record<string, unknown>).dht as {
      findProviders: (key: Uint8Array) => AsyncIterable<{ name: string; providers?: Array<{ id: { toString(): string }; multiaddrs: Array<{ toString(): string }> }> }>;
    } | undefined;
    if (!dht) return [];

    const providers: SimplePeerInfo[] = [];

    try {
      for await (const event of dht.findProviders(key)) {
        if (event.name === 'PROVIDER' && event.providers) {
          for (const provider of event.providers) {
            providers.push({
              id: provider.id.toString(),
              multiaddrs: provider.multiaddrs.map((ma: { toString(): string }) => ma.toString()),
            });
            if (providers.length >= count) break;
          }
        }
      }
    } catch {
      // Provider query failed
    }

    return providers;
  }

  /**
   * Announce as provider for a content key
   */
  async provide(key: Uint8Array): Promise<void> {
    if (!this.config.enableDHT || !this.node) {
      return;
    }

    const dht = (this.node.services as Record<string, unknown>).dht as {
      provide: (key: Uint8Array) => Promise<void>;
    } | undefined;
    if (!dht) return;

    try {
      await dht.provide(key);
    } catch {
      // Provide failed
    }
  }

  /**
   * Put a value in the DHT
   */
  async put(key: Uint8Array, value: Uint8Array): Promise<void> {
    if (!this.config.enableDHT || !this.node) {
      return;
    }

    const dht = (this.node.services as Record<string, unknown>).dht as {
      put: (key: Uint8Array, value: Uint8Array) => Promise<void>;
    } | undefined;
    if (!dht) return;

    try {
      await dht.put(key, value);
    } catch {
      // Put failed
    }
  }

  /**
   * Get a value from the DHT
   */
  async get(key: Uint8Array): Promise<Uint8Array | null> {
    if (!this.config.enableDHT || !this.node) {
      return null;
    }

    const dht = (this.node.services as Record<string, unknown>).dht as {
      get: (key: Uint8Array) => AsyncIterable<{ name: string; value?: Uint8Array }>;
    } | undefined;
    if (!dht) return null;

    try {
      for await (const event of dht.get(key)) {
        if (event.name === 'VALUE' && event.value) {
          return event.value;
        }
      }
    } catch {
      // Get failed
    }

    return null;
  }

  /**
   * Convert Forest PeerInfo to multiaddr strings
   */
  static peerInfoToMultiaddrs(peer: PeerInfo): string[] {
    return peer.addresses.map((addr: PeerAddress) => ForestNode.peerAddressToMultiaddr(addr));
  }

  /**
   * Convert discovered peer to Forest PeerInfo (partial)
   */
  static discoveredToPartialPeerInfo(discovered: DiscoveredPeerEvent): Partial<PeerInfo> {
    return {
      nodeId: discovered.peerId,
      addresses: discovered.multiaddrs.map((ma: string) => {
        const parsed = multiaddr(ma);
        return ForestNode.multiaddrToPeerAddress(parsed);
      }),
      lastSeen: Date.now(),
    };
  }
}

/**
 * Create a ForestNode with integrated discovery services
 */
export async function createDiscoveryNode(
  nodeConfig?: ConstructorParameters<typeof ForestNode>[0],
  discoveryConfig?: ForestDiscoveryConfig
): Promise<{ node: ForestNode; discovery: ForestDiscovery }> {
  // Build combined config with discovery peer discovery
  const bootstrapPeers = discoveryConfig?.bootstrapPeers ?? [];

  // Build peer discovery modules
  const peerDiscovery: unknown[] = [];

  if (bootstrapPeers.length > 0) {
    peerDiscovery.push(
      bootstrap({ list: bootstrapPeers })
    );
  }

  if (discoveryConfig?.enableMdns !== false) {
    peerDiscovery.push(
      mdns({ interval: discoveryConfig?.discoveryInterval ?? 30000 })
    );
  }

  // Create node
  const node = new ForestNode({
    ...nodeConfig,
    bootstrapPeers,
  });
  await node.start();

  // Create discovery (use existing node)
  const discovery = new ForestDiscovery(discoveryConfig);
  await discovery.start(node.libp2p);

  return { node, discovery };
}

export default ForestDiscovery;
