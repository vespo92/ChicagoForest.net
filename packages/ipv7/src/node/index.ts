/**
 * IPV7 Node - Main P2P Node Implementation
 *
 * THEORETICAL FRAMEWORK - A complete mesh network node
 * that combines addressing, routing, and transport.
 */

import { EventEmitter } from 'events';
import {
  IPV7Address,
  NodeConfig,
  NodeStats,
  Packet,
  PacketType,
  PeerInfo,
  PeerCapabilities,
  TransportEndpoint,
  KeyPair,
  GeoCoordinates,
} from '../types.js';
import {
  generateAddress,
  formatAddress,
  addressEquals,
} from '../address/index.js';
import { generateKeyPair } from '../crypto/index.js';
import {
  createPacket,
  createAnnounce,
  createHeartbeat,
  createRouteRequest,
  serializePacket,
  decrementTTL,
  HEADER_SIZE,
} from '../packet/index.js';
import { DHT } from '../routing/dht.js';
import { Router } from '../routing/router.js';
import {
  TransportManager,
  TCPTransport,
  UDPTransport,
  MemoryTransport,
} from '../transport/index.js';

/** Heartbeat interval in ms */
const HEARTBEAT_INTERVAL = 30000;

/** Announce interval in ms */
const ANNOUNCE_INTERVAL = 60000;

/** Peer timeout in ms */
const PEER_TIMEOUT = 90000;

/**
 * IPV7 Node - Core P2P network participant
 */
export class IPV7Node extends EventEmitter {
  readonly address: IPV7Address;
  readonly keyPair: KeyPair;
  readonly location?: GeoCoordinates;

  private readonly dht: DHT;
  private readonly router: Router;
  private readonly transports: TransportManager;
  private readonly config: NodeConfig;
  private readonly stats: NodeStats;

  private running = false;
  private heartbeatTimer?: NodeJS.Timeout;
  private announceTimer?: NodeJS.Timeout;

  constructor(config: NodeConfig = {}) {
    super();

    this.config = {
      maxPeers: 50,
      enableRelay: true,
      dhtReplication: 3,
      ...config,
    };

    // Generate or use provided key pair
    this.keyPair = config.keyPair ?? generateKeyPair();
    this.location = config.location;

    // Generate address
    this.address = generateAddress(this.keyPair, this.location);

    // Initialize routing
    this.dht = new DHT(this.address);
    this.router = new Router(this.address, this.dht);

    // Initialize transports
    this.transports = new TransportManager();

    // Initialize stats
    this.stats = {
      packetsSent: 0,
      packetsReceived: 0,
      packetsForwarded: 0,
      bytesSent: BigInt(0),
      bytesReceived: BigInt(0),
      connectedPeers: 0,
      uptime: 0,
      routeCount: 0,
    };

    this.setupEventHandlers();
  }

  /**
   * Set up internal event handlers
   */
  private setupEventHandlers(): void {
    // DHT events
    this.dht.on('peer:added', (peer: PeerInfo) => {
      this.emit('peer:discovered', peer);
    });

    this.dht.on('peer:removed', (address: IPV7Address) => {
      this.emit('peer:disconnected', address);
      this.router.handlePeerDisconnect(address);
    });

    // Router events
    this.router.on('route:request', (destination: IPV7Address) => {
      this.sendRouteRequest(destination);
    });

    // Transport events
    this.transports.on('packet:received', (packet: Packet, from: TransportEndpoint) => {
      this.handlePacket(packet, from);
    });

    this.transports.on('peer:connected', (_endpoint: TransportEndpoint) => {
      // Could trigger peer discovery here
    });

    this.transports.on('error', (err: Error) => {
      this.emit('error', err);
    });
  }

  /**
   * Start the node
   */
  async start(): Promise<void> {
    if (this.running) {
      throw new Error('Node already running');
    }

    // Set up transports based on config
    if (this.config.listen?.tcp) {
      this.transports.addTransport(new TCPTransport(this.config.listen.tcp));
    }
    if (this.config.listen?.udp) {
      this.transports.addTransport(new UDPTransport(this.config.listen.udp));
    }

    // Start transports
    await this.transports.startAll();

    // Connect to bootstrap peers
    if (this.config.bootstrapPeers) {
      for (const peer of this.config.bootstrapPeers) {
        try {
          await this.connectToPeer(peer);
        } catch (err) {
          // Bootstrap peer unavailable, continue
        }
      }
    }

    // Start periodic tasks
    this.heartbeatTimer = setInterval(() => this.sendHeartbeats(), HEARTBEAT_INTERVAL);
    this.announceTimer = setInterval(() => this.announce(), ANNOUNCE_INTERVAL);

    // Initial announcement
    this.announce();

    this.running = true;
    this.stats.uptime = Date.now();
  }

  /**
   * Stop the node
   */
  async stop(): Promise<void> {
    if (!this.running) return;

    this.running = false;

    // Clear timers
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.announceTimer) clearInterval(this.announceTimer);

    // Stop transports
    await this.transports.stopAll();
  }

  /**
   * Send data to another node
   */
  async send(
    destination: IPV7Address,
    data: Uint8Array,
    _options: { reliable?: boolean } = {}
  ): Promise<void> {
    const packet = createPacket(this.address, destination, data);
    await this.sendPacket(packet);
  }

  /**
   * Send a packet (handles routing)
   */
  private async sendPacket(packet: Packet): Promise<void> {
    const { destination } = packet.header;

    // Check if destination is us
    if (addressEquals(destination, this.address)) {
      // Loopback
      this.handlePacket(packet, this.transports.getLocalEndpoints()[0]);
      return;
    }

    // Find route
    const route = this.router.findRoute(destination);
    if (!route) {
      throw new Error(`No route to ${formatAddress(destination)}`);
    }

    // Find peer info for next hop
    const peer = this.dht.getAllPeers().find((p) =>
      addressEquals(p.address, route.nextHop)
    );

    if (!peer || peer.endpoints.length === 0) {
      throw new Error(`No endpoint for next hop ${formatAddress(route.nextHop)}`);
    }

    // Send via best endpoint
    const endpoint = peer.endpoints.sort((a, b) => a.priority - b.priority)[0];
    await this.transports.send(packet, endpoint);

    // Update stats
    this.stats.packetsSent++;
    this.stats.bytesSent += BigInt(serializePacket(packet).length);

    this.emit('packet:sent', packet);
  }

  /**
   * Handle received packet
   */
  private handlePacket(packet: Packet, from: TransportEndpoint): void {
    this.stats.packetsReceived++;
    this.stats.bytesReceived += BigInt(HEADER_SIZE + packet.payload.length);

    const { source, destination } = packet.header;

    // Learn route from source
    this.router.learnRoute(packet, this.findAddressForEndpoint(from) ?? source);

    // Update peer last seen
    this.dht.updatePeer(source);

    // Check if packet is for us
    const isForUs = addressEquals(destination, this.address) ||
                    destination.flags === 0x03; // Broadcast

    if (isForUs) {
      this.processPacket(packet, from);
    } else if (this.config.enableRelay) {
      // Forward packet
      this.forwardPacket(packet);
    }
  }

  /**
   * Process a packet destined for us
   */
  private processPacket(packet: Packet, from: TransportEndpoint): void {
    const { type, source } = packet.header;

    switch (type) {
      case PacketType.DATA:
        this.emit('packet:received', packet);
        break;

      case PacketType.ANNOUNCE:
        this.handleAnnounce(packet, from);
        break;

      case PacketType.HEARTBEAT:
        // Just updates lastSeen, already done
        break;

      case PacketType.ROUTE_REQUEST:
        this.handleRouteRequest(packet);
        break;

      case PacketType.ROUTE_REPLY:
        this.router.processRouteReply(
          packet,
          this.findAddressForEndpoint(from) ?? source
        );
        break;

      case PacketType.ACK:
        // Handle acknowledgment
        break;

      default:
        // Unknown packet type
        break;
    }
  }

  /**
   * Forward a packet to next hop
   */
  private async forwardPacket(packet: Packet): Promise<void> {
    // Decrement TTL
    if (!decrementTTL(packet)) {
      return; // TTL expired, drop
    }

    try {
      await this.sendPacket(packet);
      this.stats.packetsForwarded++;
    } catch {
      // Failed to forward
    }
  }

  /**
   * Handle peer announcement
   */
  private handleAnnounce(packet: Packet, from: TransportEndpoint): void {
    const { source } = packet.header;

    // Parse capabilities from payload
    const capabilities: PeerCapabilities = {
      relay: (packet.payload[0] & 0x01) !== 0,
      multipath: (packet.payload[0] & 0x02) !== 0,
      storage: (packet.payload[0] & 0x04) !== 0,
      gateway: (packet.payload[0] & 0x08) !== 0,
    };

    // Add peer to DHT
    const peer: PeerInfo = {
      address: source,
      publicKey: new Uint8Array(32), // Would be in payload
      lastSeen: Date.now(),
      capabilities,
      endpoints: [from],
      reputation: 50, // Start neutral
    };

    this.dht.addPeer(peer);
  }

  /**
   * Handle route request
   */
  private handleRouteRequest(packet: Packet): void {
    const reply = this.router.processRouteRequest(packet);
    if (reply) {
      this.sendPacket(reply).catch(() => {});
    }
  }

  /**
   * Send route request
   */
  private async sendRouteRequest(destination: IPV7Address): Promise<void> {
    const packet = createRouteRequest(this.address, destination);

    // Send to closest known peers
    const closestPeers = this.dht.findClosestPeers(destination, 3);
    for (const peer of closestPeers) {
      if (peer.endpoints.length > 0) {
        try {
          await this.transports.send(packet, peer.endpoints[0]);
        } catch {
          // Peer unreachable
        }
      }
    }
  }

  /**
   * Send heartbeats to all peers
   */
  private sendHeartbeats(): void {
    const peers = this.dht.getAllPeers();
    const now = Date.now();

    for (const peer of peers) {
      // Check if peer is stale
      if (now - peer.lastSeen > PEER_TIMEOUT) {
        this.dht.removePeer(peer.address);
        continue;
      }

      // Send heartbeat
      const heartbeat = createHeartbeat(this.address, peer.address);
      if (peer.endpoints.length > 0) {
        this.transports.send(heartbeat, peer.endpoints[0]).catch(() => {
          // Peer might be offline
        });
      }
    }
  }

  /**
   * Broadcast announcement to network
   */
  private announce(): void {
    const capabilities = new Uint8Array([
      (this.config.enableRelay ? 0x01 : 0) |
      0x02 | // multipath support
      0x04,  // storage
    ]);

    const announcement = createAnnounce(this.address, capabilities);

    // Send to all known peers
    for (const peer of this.dht.getAllPeers()) {
      if (peer.endpoints.length > 0) {
        this.transports.send(announcement, peer.endpoints[0]).catch(() => {});
      }
    }
  }

  /**
   * Connect to a peer endpoint
   */
  async connectToPeer(endpoint: TransportEndpoint): Promise<void> {
    // Send announcement to initiate connection
    const capabilities = new Uint8Array([0x07]);
    const announcement = createAnnounce(this.address, capabilities);
    await this.transports.send(announcement, endpoint);
  }

  /**
   * Find IPV7 address for a transport endpoint
   */
  private findAddressForEndpoint(endpoint: TransportEndpoint): IPV7Address | null {
    for (const peer of this.dht.getAllPeers()) {
      for (const ep of peer.endpoints) {
        if (ep.address === endpoint.address && ep.port === endpoint.port) {
          return peer.address;
        }
      }
    }
    return null;
  }

  /**
   * Add a peer manually (for testing)
   */
  addPeer(peer: PeerInfo): void {
    this.dht.addPeer(peer);
  }

  /**
   * Get node statistics
   */
  getStats(): NodeStats {
    return {
      ...this.stats,
      connectedPeers: this.dht.getPeerCount(),
      routeCount: this.router.getAllRoutes().length,
      uptime: this.running ? Math.floor((Date.now() - this.stats.uptime) / 1000) : 0,
    };
  }

  /**
   * Get all known peers
   */
  getPeers(): PeerInfo[] {
    return this.dht.getAllPeers();
  }

  /**
   * Get all routes
   */
  getRoutes() {
    return this.router.getAllRoutes();
  }

  /**
   * Check if node is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get formatted address string
   */
  getAddressString(): string {
    return formatAddress(this.address);
  }
}

/**
 * Create a simple in-memory node for testing
 */
export function createTestNode(
  id: string,
  location?: GeoCoordinates
): IPV7Node {
  const node = new IPV7Node({ location });

  // Add memory transport
  const transport = new MemoryTransport(id);
  (node as any).transports.addTransport(transport);

  return node;
}
