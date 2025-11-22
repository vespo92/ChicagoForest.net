/**
 * Gateway Node - Connecting forests together
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  GatewayConfig,
  ForestInfo,
  BridgeConnection,
  BridgeState,
  SymbiosisEvents,
  TrafficRule,
} from '../types';

const DEFAULT_CONFIG: Partial<GatewayConfig> = {
  maxConnectionsPerForest: 5,
  autoPeering: true,
  trafficRules: [],
};

/**
 * Gateway node that bridges multiple forests
 */
export class GatewayNode extends EventEmitter<SymbiosisEvents> {
  private config: GatewayConfig;
  private knownForests: Map<string, ForestInfo> = new Map();
  private bridges: Map<string, BridgeConnection> = new Map();
  private running: boolean = false;

  constructor(config: GatewayConfig) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config } as GatewayConfig;
  }

  /**
   * Start the gateway
   */
  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    // Announce ourselves as a gateway
    this.emit('gateway:online', this.config.nodeId);

    // Connect to configured forests
    for (const forestId of this.config.connectedForests) {
      await this.connectToForest(forestId);
    }
  }

  /**
   * Stop the gateway
   */
  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;

    // Close all bridges
    for (const bridge of this.bridges.values()) {
      await this.closeBridge(bridge.id);
    }

    this.emit('gateway:offline', this.config.nodeId);
  }

  /**
   * Connect to a new forest
   */
  async connectToForest(forestId: string): Promise<boolean> {
    if (this.bridges.has(forestId)) {
      return true; // Already connected
    }

    // Discover forest info
    const forest = await this.discoverForest(forestId);
    if (!forest) {
      return false;
    }

    // Create bridge connection
    const bridge: BridgeConnection = {
      id: `bridge_${this.config.nodeId}_${forestId}`,
      localForest: 'local', // Would be actual local forest ID
      remoteForest: forestId,
      localGateway: this.config.nodeId,
      remoteGateway: '' as NodeId, // Would be discovered
      state: 'connecting',
      metrics: {
        latency: 0,
        throughput: 0,
        packetLoss: 0,
        messagesExchanged: 0,
        uptime: 100,
      },
      establishedAt: Date.now(),
    };

    this.bridges.set(forestId, bridge);

    // Establish connection
    try {
      await this.establishBridge(bridge);
      bridge.state = 'active';
      this.emit('bridge:established', bridge);
      return true;
    } catch (error) {
      bridge.state = 'failed';
      this.emit('bridge:failed', bridge.id);
      return false;
    }
  }

  /**
   * Disconnect from a forest
   */
  async disconnectFromForest(forestId: string): Promise<void> {
    const bridge = this.bridges.get(forestId);
    if (bridge) {
      await this.closeBridge(bridge.id);
      this.bridges.delete(forestId);
    }
  }

  /**
   * Route a message to another forest
   */
  async routeMessage(
    destination: string,
    message: unknown
  ): Promise<boolean> {
    const bridge = this.bridges.get(destination);
    if (!bridge || bridge.state !== 'active') {
      return false;
    }

    // Check traffic rules
    if (!this.checkTrafficRules('local', destination)) {
      return false;
    }

    // Send message through bridge
    bridge.metrics.messagesExchanged++;
    return true;
  }

  /**
   * Get all connected forests
   */
  getConnectedForests(): ForestInfo[] {
    return Array.from(this.knownForests.values())
      .filter(f => this.bridges.has(f.id) && this.bridges.get(f.id)?.state === 'active');
  }

  /**
   * Get bridge status
   */
  getBridgeStatus(forestId: string): BridgeConnection | undefined {
    return this.bridges.get(forestId);
  }

  /**
   * Add traffic rule
   */
  addTrafficRule(rule: TrafficRule): void {
    this.config.trafficRules.push(rule);
  }

  /**
   * Remove traffic rule
   */
  removeTrafficRule(ruleId: string): boolean {
    const index = this.config.trafficRules.findIndex(r => r.id === ruleId);
    if (index >= 0) {
      this.config.trafficRules.splice(index, 1);
      return true;
    }
    return false;
  }

  // Private methods

  private async discoverForest(forestId: string): Promise<ForestInfo | null> {
    // Would query forest registry
    const forest: ForestInfo = {
      id: forestId,
      name: forestId,
      description: 'Discovered forest',
      region: 'unknown',
      network: {
        nodeCount: 0,
        entryPoints: [],
        protocols: ['chicago-forest-v1'],
        capabilities: [],
      },
      governance: 'democratic',
      createdAt: Date.now(),
      lastSeen: Date.now(),
      health: 100,
      publicKey: '',
      federations: [],
      trustScore: 0.5,
      resources: {
        bandwidth: 0,
        storage: 0,
        compute: 0,
      },
    };

    this.knownForests.set(forestId, forest);
    this.emit('forest:discovered', forest);
    return forest;
  }

  private async establishBridge(bridge: BridgeConnection): Promise<void> {
    // Would establish actual connection
    // For now, simulate successful connection
    bridge.metrics.latency = Math.random() * 100;
    bridge.metrics.throughput = 100_000_000;
  }

  private async closeBridge(bridgeId: string): Promise<void> {
    const bridge = this.bridges.get(bridgeId);
    if (bridge) {
      bridge.state = 'failed';
    }
  }

  private checkTrafficRules(source: string, destination: string): boolean {
    for (const rule of this.config.trafficRules) {
      const sourceMatch = rule.source === '*' || rule.source === source;
      const destMatch = rule.destination === '*' || rule.destination === destination;

      if (sourceMatch && destMatch) {
        return rule.action === 'allow';
      }
    }
    return true; // Default allow
  }
}

export { GatewayConfig };
