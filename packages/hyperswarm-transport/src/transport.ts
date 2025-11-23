/**
 * @chicago-forest/hyperswarm-transport - Main Transport Implementation
 *
 * Implements the p2p-core Transport interface using Hyperswarm for
 * excellent NAT traversal and peer discovery.
 *
 * Hyperswarm (Holepunch ecosystem) provides:
 * - DHT-based peer discovery using topic hashes
 * - Automatic UDP and TCP hole punching
 * - Noise protocol encryption
 * - Relay fallback for strict NATs
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. Part of Chicago Forest Network's P2P infrastructure.
 */

import { EventEmitter } from 'eventemitter3';
import type { Transport, TransportConnection } from '@chicago-forest/p2p-core';
import type { PeerAddress } from '@chicago-forest/shared-types';
import {
  type HyperswarmTransportConfig,
  type HyperswarmTransportEvents,
  type HyperswarmPeerInfo,
  type NATStats,
  type NATType,
  type SwarmTopic,
  DEFAULT_HYPERSWARM_CONFIG,
  publicKeyToNodeId,
  createPeerAddress,
} from './types';
import { HyperswarmConnection, ConnectionPool } from './connection';

// Import Hyperswarm and HyperDHT (these are native ESM modules)
// The actual imports happen dynamically to support both Node.js and bundlers
let Hyperswarm: typeof import('hyperswarm');
let HyperDHT: typeof import('hyperdht');
let b4a: typeof import('b4a');

/**
 * Load Hyperswarm dependencies
 */
async function loadDependencies(): Promise<void> {
  if (!Hyperswarm) {
    Hyperswarm = (await import('hyperswarm')).default;
    HyperDHT = (await import('hyperdht')).default;
    b4a = await import('b4a');
  }
}

/**
 * HyperswarmTransport - P2P transport with excellent NAT traversal
 *
 * This transport uses Hyperswarm from the Holepunch ecosystem to provide:
 *
 * 1. **NAT Traversal**: Automatic UDP/TCP hole punching handles most NAT types
 * 2. **DHT Discovery**: Topic-based peer discovery via distributed hash table
 * 3. **Relay Fallback**: For symmetric NATs, connections relay through helpers
 * 4. **Simple API**: Much simpler than raw libp2p, great for mesh networks
 *
 * Usage:
 * ```typescript
 * const transport = new HyperswarmTransport({
 *   dhtServer: true, // Help others with NAT traversal
 * });
 *
 * await transport.ready();
 *
 * // Join a topic to find peers
 * await transport.joinTopic('chicago-forest-network');
 *
 * // Handle connections
 * transport.on('connection', (info) => {
 *   console.log('Connected to:', info.publicKey);
 * });
 * ```
 */
export class HyperswarmTransport
  extends EventEmitter<HyperswarmTransportEvents>
  implements Transport
{
  /** Transport configuration */
  private readonly config: Required<
    Omit<HyperswarmTransportConfig, 'dht' | 'seed' | 'firewall'>
  > & Pick<HyperswarmTransportConfig, 'dht' | 'seed' | 'firewall'>;

  /** Hyperswarm instance */
  private swarm?: InstanceType<typeof import('hyperswarm').default>;

  /** Custom DHT instance */
  private dht?: InstanceType<typeof import('hyperdht').default>;

  /** Our public key */
  private _publicKey?: Buffer;

  /** Connection pool */
  private readonly connectionPool: ConnectionPool;

  /** Active topics */
  private readonly topics: Map<string, SwarmTopic> = new Map();

  /** NAT statistics */
  private _natStats: NATStats = {
    natType: 'unknown',
    reachable: false,
    holepunchesSucceeded: 0,
    holepunchesFailed: 0,
    relayConnections: 0,
  };

  /** Whether transport is ready */
  private _ready: boolean = false;

  /** Listen address (not used by Hyperswarm but kept for interface) */
  private listenAddress?: PeerAddress;

  constructor(config: HyperswarmTransportConfig = {}) {
    super();

    this.config = {
      ...DEFAULT_HYPERSWARM_CONFIG,
      ...config,
    };

    this.connectionPool = new ConnectionPool(this.config.maxPeers);

    // Forward connection pool events
    this.connectionPool.on('connection:added', (conn) => {
      this.emit('connection', conn.info);
    });

    this.connectionPool.on('connection:removed', (publicKey) => {
      this.emit('disconnection', publicKey);
    });
  }

  /**
   * Initialize and start the swarm
   */
  async ready(): Promise<void> {
    if (this._ready) return;

    // Load dependencies
    await loadDependencies();

    // Create DHT instance if not provided
    if (!this.config.dht) {
      this.dht = new HyperDHT({
        bootstrap: this.config.bootstrap.length > 0
          ? this.config.bootstrap.map((addr) => {
              const [host, port] = addr.split(':');
              return { host, port: parseInt(port, 10) };
            })
          : undefined,
      });
    }

    // Create Hyperswarm instance
    this.swarm = new Hyperswarm({
      dht: this.config.dht ?? this.dht,
      seed: this.config.seed,
      firewall: this.config.firewall,
      maxPeers: this.config.maxPeers,
    });

    // Store our public key
    this._publicKey = this.swarm.keyPair.publicKey;

    // Set up connection handler
    this.swarm.on('connection', (socket: unknown, info: unknown) => {
      this.handleConnection(socket, info);
    });

    // Set up update handler for NAT status
    this.swarm.on('update', () => {
      this.updateNATStats();
    });

    this._ready = true;
    this.emit('ready');

    console.log(`
===============================================
  Hyperswarm Transport Initialized
===============================================
  Public Key:    ${this._publicKey?.toString('hex').slice(0, 16)}...
  Node ID:       ${publicKeyToNodeId(this._publicKey!)}
  DHT Server:    ${this.config.dhtServer ? 'enabled' : 'disabled'}
  Max Peers:     ${this.config.maxPeers}
  Relay:         ${this.config.enableRelay ? 'enabled' : 'disabled'}

  DISCLAIMER: Part of Chicago Forest Network
  AI-generated theoretical framework.
===============================================
`);
  }

  /**
   * Handle new connection from Hyperswarm
   */
  private handleConnection(socket: unknown, info: unknown): void {
    const swarmInfo = info as {
      publicKey: Buffer;
      client: boolean;
      type: string;
    };

    // Determine connection details
    const peerInfo: HyperswarmPeerInfo = {
      publicKey: swarmInfo.publicKey,
      client: swarmInfo.client,
      type: this.determineConnectionType(swarmInfo),
      holepunched: this.wasHolepunched(swarmInfo),
    };

    // Update NAT stats
    if (peerInfo.holepunched) {
      this._natStats.holepunchesSucceeded++;
    }
    if (peerInfo.type === 'relay') {
      this._natStats.relayConnections++;
    }

    // Create connection wrapper
    const connection = new HyperswarmConnection(socket, peerInfo);

    // Add to pool
    if (!this.connectionPool.add(connection)) {
      // Pool full or duplicate, close connection
      connection.close();
      return;
    }

    console.log(
      `[Hyperswarm] New ${peerInfo.client ? 'outgoing' : 'incoming'} connection:`,
      `${publicKeyToNodeId(peerInfo.publicKey)} (${peerInfo.type}${peerInfo.holepunched ? ', holepunched' : ''})`
    );
  }

  /**
   * Determine connection type from Hyperswarm info
   */
  private determineConnectionType(info: { type: string }): 'tcp' | 'utp' | 'relay' {
    const type = info.type?.toLowerCase();
    if (type === 'relay') return 'relay';
    if (type === 'utp') return 'utp';
    return 'tcp';
  }

  /**
   * Check if connection was hole-punched
   */
  private wasHolepunched(info: unknown): boolean {
    // Hyperswarm marks holepunched connections
    const swarmInfo = info as { holepunched?: boolean; ban?: boolean };
    return swarmInfo.holepunched === true;
  }

  /**
   * Update NAT statistics from DHT
   */
  private updateNATStats(): void {
    if (!this.swarm || !this.dht) return;

    // Get DHT status
    const dhtInfo = this.dht as unknown as {
      host?: string;
      port?: number;
      firewalled?: boolean;
    };

    // Determine NAT type based on connectivity
    const stats = this.connectionPool.getStats();

    if (dhtInfo.firewalled === false) {
      this._natStats.natType = 'open';
      this._natStats.reachable = true;
    } else if (stats.holepunched > 0) {
      this._natStats.natType = stats.relay > stats.holepunched ? 'symmetric' : 'port-restricted';
      this._natStats.reachable = true;
    } else if (stats.relay > 0) {
      this._natStats.natType = 'symmetric';
      this._natStats.reachable = false;
    }

    if (dhtInfo.host) {
      this._natStats.publicAddress = dhtInfo.host;
    }
    if (dhtInfo.port) {
      this._natStats.publicPort = dhtInfo.port;
    }

    this.emit('nat:updated', this._natStats);
  }

  // ==========================================================================
  // Transport Interface Implementation
  // ==========================================================================

  /**
   * Connect to a peer address
   *
   * Note: Hyperswarm uses topic-based discovery, not direct addresses.
   * This method is provided for interface compatibility but joining
   * topics is the preferred way to discover peers.
   */
  async connect(address: PeerAddress): Promise<TransportConnection> {
    if (!this._ready || !this.swarm) {
      throw new Error('Transport not ready. Call ready() first.');
    }

    // If address has a public key, we can try to connect directly via DHT
    if (address.publicKey) {
      const publicKey = b4a.from(address.publicKey, 'hex');

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, this.config.connectionTimeout);

        // Look for existing connection
        const existing = this.connectionPool.get(publicKey);
        if (existing) {
          clearTimeout(timeout);
          resolve(existing);
          return;
        }

        // Listen for new connection with this public key
        const connectionHandler = (conn: HyperswarmConnection) => {
          if (b4a.equals(conn.remotePublicKey, publicKey)) {
            clearTimeout(timeout);
            this.connectionPool.off('connection:added', connectionHandler);
            resolve(conn);
          }
        };

        this.connectionPool.on('connection:added', connectionHandler);

        // Try to establish connection via DHT lookup
        // This is a best-effort approach - topic joining is more reliable
        this.attemptDirectConnection(publicKey).catch(() => {
          // Ignore errors, we're waiting for any connection
        });
      });
    }

    throw new Error(
      'Hyperswarm requires topic-based discovery. Use joinTopic() instead.'
    );
  }

  /**
   * Attempt direct connection via DHT
   */
  private async attemptDirectConnection(publicKey: Buffer): Promise<void> {
    // Create a private topic for this peer
    const topic = this.createPeerTopic(publicKey);
    await this.joinTopic(topic, { announce: false, lookup: true });
  }

  /**
   * Create a deterministic topic for peer-to-peer connection
   */
  private createPeerTopic(publicKey: Buffer): Buffer {
    // XOR our public key with theirs for a shared topic
    const topic = Buffer.alloc(32);
    for (let i = 0; i < 32; i++) {
      topic[i] = this._publicKey![i] ^ publicKey[i];
    }
    return topic;
  }

  /**
   * Listen for incoming connections
   *
   * Note: Hyperswarm automatically listens when joining topics.
   * This method just stores the address for interface compatibility.
   */
  async listen(address: PeerAddress): Promise<void> {
    if (!this._ready) {
      await this.ready();
    }
    this.listenAddress = address;

    console.log('[Hyperswarm] Ready to accept connections');
    console.log('  Node ID:', publicKeyToNodeId(this._publicKey!));
    console.log('  Public Key:', this._publicKey?.toString('hex').slice(0, 32) + '...');
  }

  /**
   * Stop listening for connections
   */
  async stopListening(): Promise<void> {
    // Leave all topics (stops announcing)
    for (const topic of this.topics.values()) {
      if (topic.announcing) {
        await this.leaveTopic(topic.topic);
      }
    }
    this.listenAddress = undefined;
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    await this.connectionPool.closeAll();
  }

  // ==========================================================================
  // Topic-based Peer Discovery
  // ==========================================================================

  /**
   * Join a topic to discover and connect to peers
   *
   * Topics are the primary way to find peers in Hyperswarm.
   * Peers joining the same topic will automatically discover each other
   * and establish connections.
   *
   * @param topic - Topic hash (32 bytes) or string to hash
   * @param options - Join options
   */
  async joinTopic(
    topic: Buffer | string,
    options: { announce?: boolean; lookup?: boolean; name?: string } = {}
  ): Promise<SwarmTopic> {
    if (!this._ready || !this.swarm) {
      throw new Error('Transport not ready. Call ready() first.');
    }

    const { announce = true, lookup = true, name } = options;

    // Convert string to topic hash
    const topicBuffer = typeof topic === 'string'
      ? await this.hashTopic(topic)
      : topic;

    const topicHex = topicBuffer.toString('hex');

    // Check if already joined
    if (this.topics.has(topicHex)) {
      return this.topics.get(topicHex)!;
    }

    // Join the swarm topic
    const discovery = this.swarm.join(topicBuffer, {
      server: announce, // Announce we're available
      client: lookup,   // Look for other peers
    });

    // Wait for initial flush (first DHT round)
    await discovery.flushed();

    const swarmTopic: SwarmTopic = {
      topic: topicBuffer,
      name: name ?? (typeof topic === 'string' ? topic : undefined),
      announcing: announce,
      looking: lookup,
    };

    this.topics.set(topicHex, swarmTopic);
    this.emit('topic:joined', swarmTopic);

    console.log(
      `[Hyperswarm] Joined topic: ${name ?? topicHex.slice(0, 16)}... ` +
      `(announce: ${announce}, lookup: ${lookup})`
    );

    return swarmTopic;
  }

  /**
   * Leave a topic
   */
  async leaveTopic(topic: Buffer | string): Promise<void> {
    if (!this.swarm) return;

    const topicBuffer = typeof topic === 'string'
      ? await this.hashTopic(topic)
      : topic;

    const topicHex = topicBuffer.toString('hex');

    if (this.topics.has(topicHex)) {
      await this.swarm.leave(topicBuffer);
      this.topics.delete(topicHex);
      this.emit('topic:left', topicBuffer);

      console.log(`[Hyperswarm] Left topic: ${topicHex.slice(0, 16)}...`);
    }
  }

  /**
   * Hash a string to a topic buffer
   */
  private async hashTopic(name: string): Promise<Buffer> {
    // Use crypto for hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(name);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Buffer.from(hashBuffer);
  }

  // ==========================================================================
  // Getters and Utilities
  // ==========================================================================

  /**
   * Get our public key
   */
  get publicKey(): Buffer | undefined {
    return this._publicKey;
  }

  /**
   * Get our node ID
   */
  get nodeId(): string | undefined {
    return this._publicKey ? publicKeyToNodeId(this._publicKey) : undefined;
  }

  /**
   * Get NAT statistics
   */
  get natStats(): NATStats {
    return { ...this._natStats };
  }

  /**
   * Get connection pool
   */
  get connections(): ConnectionPool {
    return this.connectionPool;
  }

  /**
   * Get active topics
   */
  get activeTopics(): SwarmTopic[] {
    return Array.from(this.topics.values());
  }

  /**
   * Check if transport is ready
   */
  get isReady(): boolean {
    return this._ready;
  }

  /**
   * Get a connection by public key
   */
  getConnection(publicKey: Buffer): HyperswarmConnection | undefined {
    return this.connectionPool.get(publicKey);
  }

  /**
   * Get all connections
   */
  getConnections(): HyperswarmConnection[] {
    return this.connectionPool.getAll();
  }

  /**
   * Destroy the transport and clean up resources
   */
  async destroy(): Promise<void> {
    if (!this.swarm) return;

    // Leave all topics
    for (const topic of this.topics.keys()) {
      await this.leaveTopic(Buffer.from(topic, 'hex'));
    }

    // Close all connections
    await this.connectionPool.closeAll();

    // Destroy swarm
    await this.swarm.destroy();

    // Destroy DHT if we created it
    if (this.dht) {
      await this.dht.destroy();
    }

    this._ready = false;
    this._publicKey = undefined;

    this.emit('close');
    console.log('[Hyperswarm] Transport destroyed');
  }
}

/**
 * Create a new Hyperswarm transport
 */
export function createHyperswarmTransport(
  config?: HyperswarmTransportConfig
): HyperswarmTransport {
  return new HyperswarmTransport(config);
}
