/**
 * MyceliumNetwork - The unified network substrate
 *
 * This is the main entry point that coordinates all mycelium subsystems:
 * hyphal pathways, signal propagation, topology management, and growth.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId, PeerInfo } from '@chicago-forest/shared-types';
import type {
  MyceliumConfig,
  MyceliumEvents,
  TopologySnapshot,
  Signal,
  SignalType,
  GrowthDirective,
  GrowthPattern,
  NodeInfo,
  HyphalPath,
} from './types';
import { HyphalNetwork } from './hyphal';
import { SignalPropagator } from './signal';
import { TopologyManager } from './topology';
import { GrowthEngine } from './growth';

const DEFAULT_CONFIG: MyceliumConfig = {
  nodeId: '' as NodeId,
  maxHyphalConnections: 50,
  signalTTL: 7,
  topologyOptimizationInterval: 30000,
  growthRateLimit: 10,
  selfHealingEnabled: true,
  bootstrapNodes: [],
};

/**
 * The main mycelium network coordinator
 */
export class MyceliumNetwork extends EventEmitter<MyceliumEvents> {
  private config: MyceliumConfig;
  private hyphal: HyphalNetwork;
  private signals: SignalPropagator;
  private topology: TopologyManager;
  private growth: GrowthEngine;
  private running: boolean = false;
  private peers: Map<NodeId, PeerInfo> = new Map();

  constructor(config: Partial<MyceliumConfig> & { nodeId: NodeId }) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize subsystems
    this.hyphal = new HyphalNetwork(this.config.nodeId);
    this.signals = new SignalPropagator(this.config.nodeId, {
      defaultTTL: this.config.signalTTL,
    });
    this.topology = new TopologyManager(this.config.nodeId, {
      snapshotInterval: this.config.topologyOptimizationInterval,
    });
    this.growth = new GrowthEngine(this.config.nodeId, {
      maxGrowthRate: this.config.growthRateLimit,
    });

    // Wire up subsystems
    this.wireSubsystems();
  }

  /**
   * Start the mycelium network
   */
  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    // Start all subsystems
    this.hyphal.start();
    this.signals.start();
    this.topology.start();

    // Bootstrap from known nodes
    await this.bootstrap();
  }

  /**
   * Stop the mycelium network
   */
  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;

    this.hyphal.stop();
    this.signals.stop();
    this.topology.stop();
  }

  /**
   * Get the local node ID
   */
  get nodeId(): NodeId {
    return this.config.nodeId;
  }

  /**
   * Check if the network is running
   */
  get isRunning(): boolean {
    return this.running;
  }

  // === Peer Management ===

  /**
   * Connect to a peer node
   */
  async connect(peer: PeerInfo): Promise<boolean> {
    if (this.peers.has(peer.nodeId)) {
      return true; // Already connected
    }

    try {
      // Establish hyphal path
      const path = await this.hyphal.establishPath(peer.nodeId);

      // Register peer
      this.peers.set(peer.nodeId, peer);

      // Update topology
      const nodeInfo: NodeInfo = {
        id: peer.nodeId,
        peer,
        connectionCount: 1,
        role: 'relay',
        resources: {
          bandwidth: 0,
          storage: 0,
          compute: 0,
          shareability: 1,
        },
        lastSeen: Date.now(),
      };
      this.topology.registerNode(nodeInfo);
      this.topology.registerPath(path);

      this.emit('node:discovered', nodeInfo);
      return true;
    } catch (error) {
      console.error(`Failed to connect to ${peer.nodeId}:`, error);
      return false;
    }
  }

  /**
   * Disconnect from a peer
   */
  async disconnect(nodeId: NodeId): Promise<void> {
    this.peers.delete(nodeId);
    this.topology.unregisterNode(nodeId);
  }

  /**
   * Get all connected peers
   */
  getPeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }

  /**
   * Get peer by node ID
   */
  getPeer(nodeId: NodeId): PeerInfo | undefined {
    return this.peers.get(nodeId);
  }

  // === Signal Propagation ===

  /**
   * Broadcast a signal through the network
   */
  async broadcast(type: SignalType, payload: unknown): Promise<Signal> {
    return this.signals.broadcast(type, payload);
  }

  /**
   * Subscribe to a signal type
   */
  onSignal(
    type: SignalType,
    handler: (signal: Signal) => void | Promise<void>
  ): () => void {
    return this.signals.onSignal(type, handler);
  }

  /**
   * Handle an incoming signal from a peer
   */
  async handleSignal(signal: Signal): Promise<void> {
    await this.signals.handleIncoming(signal);
  }

  // === Path Management ===

  /**
   * Get the best path to a destination
   */
  getPath(destination: NodeId): HyphalPath | undefined {
    return this.hyphal.getBestPath(destination);
  }

  /**
   * Get all paths to a destination
   */
  getAllPaths(destination: NodeId): HyphalPath[] {
    return this.hyphal.getAllPaths(destination);
  }

  // === Topology ===

  /**
   * Get current topology snapshot
   */
  getTopology(): TopologySnapshot | undefined {
    return this.topology.getSnapshot();
  }

  /**
   * Get network health metrics
   */
  getHealth() {
    return this.topology.calculateHealth();
  }

  // === Growth ===

  /**
   * Initiate network growth
   */
  async grow(pattern?: GrowthPattern): Promise<void> {
    const health = this.topology.calculateHealth();
    const effectivePattern = pattern ?? this.growth.recommendPattern(
      health.score,
      this.peers.size
    );

    const directive: GrowthDirective = {
      pattern: effectivePattern,
      targets: Array.from(this.growth.getTargets().map(t => t.id)),
      priority: health.score < 50 ? 1 : 0.5,
      maxConnections: 5,
      deadline: Date.now() + 60000,
    };

    await this.growth.initiateGrowth(directive);
  }

  // === Private Methods ===

  private wireSubsystems(): void {
    // Forward events from subsystems
    this.hyphal.on('path:established', (path) => this.emit('path:established', path));
    this.hyphal.on('path:degraded', (path) => this.emit('path:degraded', path));
    this.hyphal.on('path:healed', (path) => this.emit('path:healed', path));
    this.hyphal.on('path:died', (id) => this.emit('path:died', id));

    this.signals.on('signal:received', (signal) => this.emit('signal:received', signal));
    this.signals.on('signal:propagated', (signal, hops) =>
      this.emit('signal:propagated', signal, hops)
    );

    this.topology.on('topology:changed', (snapshot) =>
      this.emit('topology:changed', snapshot)
    );
    this.topology.on('node:discovered', (node) => this.emit('node:discovered', node));
    this.topology.on('node:lost', (id) => this.emit('node:lost', id));
    this.topology.on('health:warning', (health) => this.emit('health:warning', health));
    this.topology.on('health:critical', (health) => this.emit('health:critical', health));

    this.growth.on('growth:started', (directive) =>
      this.emit('growth:started', directive)
    );
    this.growth.on('growth:completed', (directive) =>
      this.emit('growth:completed', directive)
    );

    // Wire signal propagator to peers
    this.signals.setPeerProvider(() => Array.from(this.peers.keys()));

    // Wire growth engine
    this.growth.setConnectionHandlers(
      async (nodeId) => {
        const peer = this.peers.get(nodeId);
        if (peer) return true;
        // Would discover and connect to peer
        return false;
      },
      async (nodeId) => {
        await this.disconnect(nodeId);
      }
    );

    // Handle self-healing
    if (this.config.selfHealingEnabled) {
      this.hyphal.on('path:degraded', async (path) => {
        await this.hyphal.healPath(path.id);
      });
    }
  }

  private async bootstrap(): Promise<void> {
    // Connect to bootstrap nodes
    for (const bootstrap of this.config.bootstrapNodes) {
      // Parse bootstrap address and connect
      // In real implementation, would resolve address to PeerInfo
      console.log(`Would bootstrap from: ${bootstrap}`);
    }

    // Announce ourselves
    await this.broadcast('discovery', {
      nodeId: this.config.nodeId,
      capabilities: ['relay', 'storage'],
      timestamp: Date.now(),
    });
  }
}
