/**
 * @chicago-forest/libp2p-transport - Node Module
 *
 * Production-ready libp2p node wrapper for Chicago Forest Network.
 * Provides battle-tested P2P networking with multiple transports.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { createLibp2p, type Libp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import { webRTC } from '@libp2p/webrtc';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { identify } from '@libp2p/identify';
import { ping } from '@libp2p/ping';
import { circuitRelayTransport, circuitRelayServer } from '@libp2p/circuit-relay-v2';
import { dcutr } from '@libp2p/dcutr';
import { multiaddr, type Multiaddr } from '@multiformats/multiaddr';
import type { PeerId } from '@libp2p/interface';

/**
 * PeerAddress type (local definition to avoid import issues)
 */
export interface PeerAddress {
  protocol: 'tcp' | 'udp' | 'ws' | 'wss' | 'quic' | 'forest';
  host: string;
  port: number;
  path?: string;
}

/**
 * NodeCapability type
 */
export type NodeCapability =
  | 'relay'
  | 'storage'
  | 'exit'
  | 'bootstrap'
  | 'bridge'
  | 'antenna'
  | 'tower'
  | 'firewall'
  | 'anonymous';

/**
 * Configuration for ForestNode
 */
export interface ForestNodeConfig {
  /** Listen addresses */
  listenAddresses?: string[];
  /** Bootstrap peer multiaddrs */
  bootstrapPeers?: string[];
  /** Enable relay server (allow relaying for others) */
  enableRelayServer?: boolean;
  /** Enable WebRTC transport */
  enableWebRTC?: boolean;
  /** Enable TCP transport */
  enableTCP?: boolean;
  /** Enable WebSocket transport */
  enableWebSockets?: boolean;
  /** Maximum connections */
  maxConnections?: number;
  /** Node capabilities to advertise */
  capabilities?: NodeCapability[];
  /** Agent version string */
  agentVersion?: string;
}

/**
 * Default configuration
 */
export const DEFAULT_FOREST_NODE_CONFIG: Required<Omit<ForestNodeConfig, 'capabilities'>> & { capabilities: NodeCapability[] } = {
  listenAddresses: [
    '/ip4/0.0.0.0/tcp/0',
    '/ip4/0.0.0.0/tcp/0/ws',
  ],
  bootstrapPeers: [],
  enableRelayServer: false,
  enableWebRTC: true,
  enableTCP: true,
  enableWebSockets: true,
  maxConnections: 100,
  capabilities: [],
  agentVersion: 'chicago-forest/0.1.0',
};

/**
 * ForestNode - Production P2P node using libp2p
 *
 * Provides:
 * - Multiple transports (TCP, WebSocket, WebRTC)
 * - Encrypted connections (Noise protocol)
 * - Stream multiplexing (Yamux)
 * - NAT traversal (Circuit Relay, DCUtR)
 * - Peer identification
 */
export class ForestNode {
  private node: Libp2p | null = null;
  private readonly config: Required<Omit<ForestNodeConfig, 'capabilities'>> & { capabilities: NodeCapability[] };
  private started = false;

  constructor(config: ForestNodeConfig = {}) {
    this.config = {
      ...DEFAULT_FOREST_NODE_CONFIG,
      ...config,
      listenAddresses: config.listenAddresses ?? DEFAULT_FOREST_NODE_CONFIG.listenAddresses,
      capabilities: config.capabilities ?? DEFAULT_FOREST_NODE_CONFIG.capabilities,
    };
  }

  /**
   * Get the underlying libp2p node
   */
  get libp2p(): Libp2p {
    if (!this.node) {
      throw new Error('ForestNode not started. Call start() first.');
    }
    return this.node;
  }

  /**
   * Get the node's peer ID
   */
  get peerId(): PeerId {
    return this.libp2p.peerId;
  }

  /**
   * Check if node is running
   */
  get isStarted(): boolean {
    return this.started;
  }

  /**
   * Get current listen addresses
   */
  getMultiaddrs(): Multiaddr[] {
    return this.libp2p.getMultiaddrs();
  }

  /**
   * Get connected peers
   */
  getConnectedPeers(): PeerId[] {
    return this.libp2p.getPeers();
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.libp2p.getConnections().length;
  }

  /**
   * Start the node
   */
  async start(): Promise<void> {
    if (this.started) return;

    // Build transports array
    const transports: Array<ReturnType<typeof tcp> | ReturnType<typeof webSockets> | ReturnType<typeof webRTC> | ReturnType<typeof circuitRelayTransport>> = [];

    if (this.config.enableTCP) {
      transports.push(tcp());
    }

    if (this.config.enableWebSockets) {
      transports.push(webSockets());
    }

    if (this.config.enableWebRTC) {
      transports.push(webRTC());
    }

    // Always enable circuit relay for NAT traversal
    transports.push(
      circuitRelayTransport({
        discoverRelays: 1,
      })
    );

    // Build services
    const services: Record<string, unknown> = {
      identify: identify({
        agentVersion: this.config.agentVersion,
      }),
      ping: ping(),
      dcutr: dcutr(),
    };

    // Add relay server if enabled
    if (this.config.enableRelayServer) {
      services.relay = circuitRelayServer({
        reservations: {
          maxReservations: 128,
        },
      });
    }

    // Create libp2p node
    this.node = await createLibp2p({
      addresses: {
        listen: this.config.listenAddresses,
      },
      transports: transports as never,
      connectionEncrypters: [noise()],
      streamMuxers: [yamux()],
      services,
      connectionManager: {
        maxConnections: this.config.maxConnections,
      },
    });

    // Start the node
    await this.node.start();
    this.started = true;
  }

  /**
   * Stop the node
   */
  async stop(): Promise<void> {
    if (!this.started || !this.node) return;

    await this.node.stop();
    this.started = false;
    this.node = null;
  }

  /**
   * Connect to a peer by multiaddr
   */
  async dial(addr: string | Multiaddr): Promise<void> {
    const ma = typeof addr === 'string' ? multiaddr(addr) : addr;
    await this.libp2p.dial(ma);
  }

  /**
   * Disconnect from a peer
   */
  async hangUp(peerId: PeerId): Promise<void> {
    await this.libp2p.hangUp(peerId);
  }

  /**
   * Register event handler
   */
  addEventListener(
    event: string,
    handler: (evt: CustomEvent) => void
  ): void {
    this.libp2p.addEventListener(event, handler as EventListener);
  }

  /**
   * Remove event handler
   */
  removeEventListener(
    event: string,
    handler: (evt: CustomEvent) => void
  ): void {
    this.libp2p.removeEventListener(event, handler as EventListener);
  }

  /**
   * Convert PeerAddress to multiaddr string
   */
  static peerAddressToMultiaddr(address: PeerAddress): string {
    const { protocol, host, port, path } = address;

    // Determine if IPv4 or IPv6
    const ipType = host.includes(':') ? 'ip6' : 'ip4';

    switch (protocol) {
      case 'tcp':
        return `/${ipType}/${host}/tcp/${port}`;
      case 'ws':
        return `/${ipType}/${host}/tcp/${port}/ws${path ? path : ''}`;
      case 'wss':
        return `/${ipType}/${host}/tcp/${port}/wss${path ? path : ''}`;
      case 'quic':
        return `/${ipType}/${host}/udp/${port}/quic-v1`;
      default:
        return `/${ipType}/${host}/tcp/${port}`;
    }
  }

  /**
   * Convert multiaddr to PeerAddress
   */
  static multiaddrToPeerAddress(ma: Multiaddr): PeerAddress {
    const options = ma.toOptions();

    let protocol: PeerAddress['protocol'] = 'tcp';
    const protoNames = ma.protoNames();

    if (protoNames.includes('ws')) {
      protocol = 'ws';
    } else if (protoNames.includes('wss')) {
      protocol = 'wss';
    } else if (protoNames.includes('quic') || protoNames.includes('quic-v1')) {
      protocol = 'quic';
    } else if (protoNames.includes('udp')) {
      protocol = 'udp';
    }

    return {
      protocol,
      host: options.host,
      port: options.port,
    };
  }
}

/**
 * Create and start a ForestNode
 */
export async function createForestNode(config?: ForestNodeConfig): Promise<ForestNode> {
  const node = new ForestNode(config);
  await node.start();
  return node;
}

export default ForestNode;
