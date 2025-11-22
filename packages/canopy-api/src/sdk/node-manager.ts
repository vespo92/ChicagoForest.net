/**
 * @chicago-forest/canopy-api - Node Manager SDK
 *
 * High-level node management functionality for the Chicago Forest Network.
 * Provides lifecycle management, health monitoring, and peer coordination.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. The node manager represents conceptual functionality
 * for managing participants in a decentralized energy network.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId, NodeCapability, PeerInfo } from '@chicago-forest/shared-types';
import { CanopyClient, type CanopyClientConfig, type NodeInfo } from './client';

// =============================================================================
// Types
// =============================================================================

/**
 * Node manager configuration
 */
export interface NodeManagerConfig {
  /** Heartbeat interval in ms */
  heartbeatInterval: number;
  /** Health check interval in ms */
  healthCheckInterval: number;
  /** Maximum peer connections */
  maxPeers: number;
  /** Minimum peer connections to maintain */
  minPeers: number;
  /** Peer discovery interval in ms */
  discoveryInterval: number;
  /** Auto-reconnect to lost peers */
  autoReconnect: boolean;
  /** Client configuration */
  clientConfig?: Partial<CanopyClientConfig>;
}

/**
 * Node state
 */
export interface NodeState {
  /** Node ID */
  nodeId: NodeId;
  /** Current health status */
  health: 'healthy' | 'degraded' | 'offline';
  /** Current load (0-100) */
  load: number;
  /** Uptime in seconds */
  uptime: number;
  /** Connected peers */
  connectedPeers: PeerInfo[];
  /** Pending peer connections */
  pendingConnections: string[];
  /** Last heartbeat timestamp */
  lastHeartbeat: number;
  /** Registration timestamp */
  registeredAt: number;
}

/**
 * Node manager events
 */
export interface NodeManagerEvents {
  'state:changed': (state: NodeState) => void;
  'health:changed': (health: NodeState['health'], previous: NodeState['health']) => void;
  'peer:connected': (peer: PeerInfo) => void;
  'peer:disconnected': (peerId: NodeId, reason: string) => void;
  'heartbeat:sent': (timestamp: number) => void;
  'heartbeat:failed': (error: Error) => void;
  'error': (error: Error) => void;
}

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CONFIG: NodeManagerConfig = {
  heartbeatInterval: 60000, // 1 minute
  healthCheckInterval: 30000, // 30 seconds
  maxPeers: 50,
  minPeers: 5,
  discoveryInterval: 300000, // 5 minutes
  autoReconnect: true,
};

// =============================================================================
// Node Manager
// =============================================================================

/**
 * Node Manager for Chicago Forest Network
 *
 * Handles node lifecycle, health monitoring, and peer management.
 *
 * @example
 * ```typescript
 * const manager = new NodeManager({
 *   heartbeatInterval: 60000,
 *   clientConfig: { apiKey: 'your-api-key' }
 * });
 *
 * // Register node
 * await manager.register({
 *   publicKey: 'pk_...',
 *   name: 'My Forest Node',
 *   capabilities: ['relay', 'storage']
 * });
 *
 * // Start background processes
 * await manager.start();
 *
 * // Monitor state changes
 * manager.on('state:changed', (state) => {
 *   console.log('Node state:', state);
 * });
 * ```
 */
export class NodeManager extends EventEmitter<NodeManagerEvents> {
  private config: NodeManagerConfig;
  private client: CanopyClient;
  private state: NodeState | null = null;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private healthCheckTimer?: ReturnType<typeof setInterval>;
  private discoveryTimer?: ReturnType<typeof setInterval>;
  private startTime: number = 0;

  constructor(config: Partial<NodeManagerConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = new CanopyClient(this.config.clientConfig);
  }

  /**
   * Register this node with the network
   * [THEORETICAL] Would register node in distributed registry
   */
  async register(options: {
    publicKey: string;
    name?: string;
    capabilities: NodeCapability[];
  }): Promise<NodeState> {
    const result = await this.client.registerNode(options);

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'Registration failed');
    }

    this.state = {
      nodeId: result.data.nodeId,
      health: 'healthy',
      load: 0,
      uptime: 0,
      connectedPeers: [],
      pendingConnections: [],
      lastHeartbeat: Date.now(),
      registeredAt: result.data.registeredAt,
    };

    // Connect to bootstrap peers
    for (const peer of result.data.bootstrapPeers) {
      await this.connectPeer(peer);
    }

    this.emit('state:changed', this.state);
    return this.state;
  }

  /**
   * Start background processes (heartbeat, health checks, discovery)
   */
  async start(): Promise<void> {
    if (!this.state) {
      throw new Error('Node must be registered before starting');
    }

    this.startTime = Date.now();

    // Start heartbeat
    this.heartbeatTimer = setInterval(
      () => this.sendHeartbeat(),
      this.config.heartbeatInterval
    );

    // Start health checks
    this.healthCheckTimer = setInterval(
      () => this.performHealthCheck(),
      this.config.healthCheckInterval
    );

    // Start peer discovery
    this.discoveryTimer = setInterval(
      () => this.discoverPeers(),
      this.config.discoveryInterval
    );

    console.log('[NodeManager] Started background processes');
  }

  /**
   * Stop background processes
   */
  async stop(): Promise<void> {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = undefined;
    }

    // Gracefully disconnect from peers
    if (this.state) {
      for (const peer of this.state.connectedPeers) {
        await this.disconnectPeer(peer.nodeId, 'shutdown');
      }
    }

    console.log('[NodeManager] Stopped');
  }

  /**
   * Get current node state
   */
  getState(): NodeState | null {
    return this.state;
  }

  /**
   * Get node ID
   */
  getNodeId(): NodeId | null {
    return this.state?.nodeId ?? null;
  }

  /**
   * Get connected peers
   */
  getConnectedPeers(): PeerInfo[] {
    return this.state?.connectedPeers ?? [];
  }

  /**
   * Connect to a peer
   */
  async connectPeer(peer: PeerInfo | string): Promise<boolean> {
    if (!this.state) return false;

    const address = typeof peer === 'string' ? peer : peer.addresses[0]?.host;
    if (!address) return false;

    // Check peer limit
    if (this.state.connectedPeers.length >= this.config.maxPeers) {
      console.log('[NodeManager] Max peers reached');
      return false;
    }

    try {
      const result = await this.client.connectPeer(address);

      if (result.success) {
        const peerInfo: PeerInfo = typeof peer === 'string'
          ? {
              nodeId: `peer-${Date.now()}` as NodeId,
              publicKey: '',
              addresses: [{ protocol: 'tcp', host: peer, port: 9000 }],
              lastSeen: Date.now(),
              reputation: 0,
              capabilities: [],
              metadata: {},
            }
          : peer;

        this.state.connectedPeers.push(peerInfo);
        this.emit('peer:connected', peerInfo);
        this.emit('state:changed', this.state);
        return true;
      }

      return false;
    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Disconnect from a peer
   */
  async disconnectPeer(peerId: NodeId, reason: string = 'manual'): Promise<boolean> {
    if (!this.state) return false;

    try {
      const result = await this.client.disconnectPeer(peerId);

      if (result.success) {
        this.state.connectedPeers = this.state.connectedPeers.filter(
          p => p.nodeId !== peerId
        );
        this.emit('peer:disconnected', peerId, reason);
        this.emit('state:changed', this.state);
        return true;
      }

      return false;
    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Update node load
   */
  setLoad(load: number): void {
    if (this.state) {
      this.state.load = Math.max(0, Math.min(100, load));
      this.emit('state:changed', this.state);
    }
  }

  /**
   * Set node health status
   */
  setHealth(health: NodeState['health']): void {
    if (this.state && this.state.health !== health) {
      const previous = this.state.health;
      this.state.health = health;
      this.emit('health:changed', health, previous);
      this.emit('state:changed', this.state);
    }
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  private async sendHeartbeat(): Promise<void> {
    if (!this.state) return;

    try {
      // Update uptime
      this.state.uptime = Math.floor((Date.now() - this.startTime) / 1000);

      const result = await this.client.updateStatus({
        health: this.state.health,
        load: this.state.load,
        capacity: {
          bandwidth: 100,
          storage: 1000,
          compute: 50,
        },
      });

      if (result.success) {
        this.state.lastHeartbeat = Date.now();
        this.emit('heartbeat:sent', this.state.lastHeartbeat);
      }
    } catch (error) {
      this.emit('heartbeat:failed', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async performHealthCheck(): Promise<void> {
    if (!this.state) return;

    // Check peer health
    const now = Date.now();
    const stalePeers: NodeId[] = [];

    for (const peer of this.state.connectedPeers) {
      if (now - peer.lastSeen > 300000) { // 5 minutes
        stalePeers.push(peer.nodeId);
      }
    }

    // Remove stale peers
    for (const peerId of stalePeers) {
      await this.disconnectPeer(peerId, 'stale');
    }

    // Auto-reconnect if below minimum peers
    if (this.config.autoReconnect && this.state.connectedPeers.length < this.config.minPeers) {
      await this.discoverPeers();
    }

    // Update health based on metrics
    this.updateHealthStatus();
  }

  private async discoverPeers(): Promise<void> {
    if (!this.state) return;

    if (this.state.connectedPeers.length >= this.config.maxPeers) {
      return;
    }

    try {
      // [THEORETICAL] Would query DHT for new peers
      const result = await this.client.listNodes({
        capabilities: ['relay'],
        minReputation: 0.5,
        limit: 10,
      });

      if (result.success && result.data) {
        for (const node of result.data.nodes) {
          if (node.nodeId === this.state.nodeId) continue;
          if (this.state.connectedPeers.some(p => p.nodeId === node.nodeId)) continue;

          // Try to connect
          await this.connectPeer(node.nodeId as unknown as string);

          if (this.state.connectedPeers.length >= this.config.maxPeers) {
            break;
          }
        }
      }
    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private updateHealthStatus(): void {
    if (!this.state) return;

    let health: NodeState['health'] = 'healthy';

    // Check load
    if (this.state.load > 90) {
      health = 'degraded';
    }

    // Check peer count
    if (this.state.connectedPeers.length < this.config.minPeers) {
      health = 'degraded';
    }

    // Check heartbeat
    if (Date.now() - this.state.lastHeartbeat > this.config.heartbeatInterval * 2) {
      health = 'degraded';
    }

    this.setHealth(health);
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new node manager
 */
export function createNodeManager(config?: Partial<NodeManagerConfig>): NodeManager {
  return new NodeManager(config);
}
