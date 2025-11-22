/**
 * Symbiont - Cross-Network Federation Orchestrator
 *
 * The central coordination service for inter-forest federation.
 * Manages discovery, negotiation, and lifecycle of cross-network relationships.
 *
 * Named after symbiotic relationships in nature:
 * - Mutualism: Both networks benefit from the relationship
 * - Commensalism: One network benefits, other is unaffected
 * - Parasitism detection: Identify and isolate malicious actors
 *
 * ⚠️ DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import { GatewayNode } from '../gateway';
import { FederationManager } from '../federation';
import type {
  Forest,
  ForestInfo,
  FederationAgreement,
  FederationType,
  FederationTerms,
  GatewayConfig,
  BridgeConnection,
  SymbiosisEvents,
} from '../types';

/**
 * Symbiont configuration
 */
export interface SymbiontConfig {
  /** This forest's identifier */
  forestId: string;

  /** This forest's display name */
  forestName: string;

  /** Gateway node configuration */
  gateway: GatewayConfig;

  /** Minimum trust score for auto-federation */
  minAutoFederateTrust: number;

  /** Enable automatic discovery */
  autoDiscovery: boolean;

  /** Discovery interval (ms) */
  discoveryInterval: number;

  /** Enable automatic federation with trusted forests */
  autoFederate: boolean;

  /** Maximum concurrent federations */
  maxFederations: number;

  /** Health check interval (ms) */
  healthCheckInterval: number;
}

/**
 * Federation status for monitoring
 */
export interface FederationStatus {
  /** Total forests discovered */
  forestsDiscovered: number;

  /** Active federations */
  activeFederations: number;

  /** Pending proposals */
  pendingProposals: number;

  /** Active bridges */
  activeBridges: number;

  /** Degraded bridges */
  degradedBridges: number;

  /** Network health score (0-100) */
  healthScore: number;

  /** Last discovery run */
  lastDiscovery: number;

  /** Last health check */
  lastHealthCheck: number;
}

/**
 * Events specific to Symbiont orchestrator
 */
export interface SymbiontEvents extends SymbiosisEvents {
  'symbiont:started': () => void;
  'symbiont:stopped': () => void;
  'symbiont:discovery:started': () => void;
  'symbiont:discovery:completed': (forests: ForestInfo[]) => void;
  'symbiont:health:check': (status: FederationStatus) => void;
  'symbiont:auto:federate': (forest: ForestInfo) => void;
  'symbiont:warning': (message: string) => void;
  'symbiont:error': (error: Error) => void;
}

const DEFAULT_CONFIG: Partial<SymbiontConfig> = {
  minAutoFederateTrust: 0.7,
  autoDiscovery: true,
  discoveryInterval: 60000, // 1 minute
  autoFederate: false,
  maxFederations: 10,
  healthCheckInterval: 30000, // 30 seconds
};

/**
 * Symbiont - Cross-Network Federation Orchestrator
 *
 * Coordinates all aspects of inter-forest federation:
 * - Discovery: Finding other forests in the ecosystem
 * - Negotiation: Proposing and accepting federation agreements
 * - Bridge Management: Maintaining connections between forests
 * - Health Monitoring: Tracking federation health and performance
 */
export class Symbiont extends EventEmitter<SymbiontEvents> {
  private config: SymbiontConfig;
  private gateway: GatewayNode;
  private federationManager: FederationManager;
  private running: boolean = false;
  private discoveryTimer?: ReturnType<typeof setInterval>;
  private healthCheckTimer?: ReturnType<typeof setInterval>;
  private discoveredForests: Map<string, ForestInfo> = new Map();
  private status: FederationStatus = {
    forestsDiscovered: 0,
    activeFederations: 0,
    pendingProposals: 0,
    activeBridges: 0,
    degradedBridges: 0,
    healthScore: 100,
    lastDiscovery: 0,
    lastHealthCheck: 0,
  };

  constructor(config: SymbiontConfig) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config } as SymbiontConfig;

    // Initialize gateway
    this.gateway = new GatewayNode(this.config.gateway);

    // Initialize federation manager
    this.federationManager = new FederationManager({
      localForestId: this.config.forestId,
      minTrustScore: this.config.minAutoFederateTrust,
    });

    this.setupEventHandlers();
  }

  /**
   * Start the Symbiont orchestrator
   */
  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    // Start gateway
    await this.gateway.start();

    // Start discovery if enabled
    if (this.config.autoDiscovery) {
      this.startDiscovery();
    }

    // Start health monitoring
    this.startHealthMonitoring();

    this.emit('symbiont:started');
    console.log(`[Symbiont] Started for forest: ${this.config.forestName}`);
  }

  /**
   * Stop the Symbiont orchestrator
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.running = false;

    // Stop timers
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = undefined;
    }

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    // Stop gateway
    await this.gateway.stop();

    this.emit('symbiont:stopped');
    console.log(`[Symbiont] Stopped for forest: ${this.config.forestName}`);
  }

  /**
   * Propose federation with another forest
   */
  async proposeFederation(
    targetForestId: string,
    type: FederationType = 'mutual',
    terms?: FederationTerms
  ): Promise<FederationAgreement> {
    // Check max federations
    const activeCount = this.federationManager.getActiveAgreements().length;
    if (activeCount >= this.config.maxFederations) {
      throw new Error(`Maximum federations (${this.config.maxFederations}) reached`);
    }

    const federationTerms = terms || FederationManager.createDefaultTerms();

    return this.federationManager.proposeAgreement(
      targetForestId,
      type,
      federationTerms
    );
  }

  /**
   * Accept a federation proposal
   */
  async acceptFederation(
    agreementId: string,
    expiryDuration?: number
  ): Promise<boolean> {
    const accepted = await this.federationManager.acceptAgreement(agreementId, expiryDuration);

    if (accepted) {
      const agreement = this.federationManager.getAgreement(agreementId);
      if (agreement) {
        // Establish bridge connection
        const remoteForestId = agreement.forestA === this.config.forestId
          ? agreement.forestB
          : agreement.forestA;
        await this.gateway.connectToForest(remoteForestId);
      }
    }

    return accepted;
  }

  /**
   * Reject a federation proposal
   */
  async rejectFederation(agreementId: string, reason: string): Promise<void> {
    await this.federationManager.rejectAgreement(agreementId, reason);
  }

  /**
   * Terminate an existing federation
   */
  async terminateFederation(agreementId: string): Promise<boolean> {
    const agreement = this.federationManager.getAgreement(agreementId);
    if (!agreement) {
      return false;
    }

    // Disconnect from the remote forest
    const remoteForestId = agreement.forestA === this.config.forestId
      ? agreement.forestB
      : agreement.forestA;
    await this.gateway.disconnectFromForest(remoteForestId);

    return this.federationManager.terminateAgreement(agreementId);
  }

  /**
   * Get current federation status
   */
  getStatus(): FederationStatus {
    return { ...this.status };
  }

  /**
   * Get all discovered forests
   */
  getDiscoveredForests(): ForestInfo[] {
    return Array.from(this.discoveredForests.values());
  }

  /**
   * Get federated forests
   */
  getFederatedForests(): ForestInfo[] {
    const activeAgreements = this.federationManager.getActiveAgreements();
    const federatedIds = new Set<string>();

    for (const agreement of activeAgreements) {
      if (agreement.forestA === this.config.forestId) {
        federatedIds.add(agreement.forestB);
      } else {
        federatedIds.add(agreement.forestA);
      }
    }

    return Array.from(this.discoveredForests.values())
      .filter(f => federatedIds.has(f.id));
  }

  /**
   * Get all active agreements
   */
  getActiveAgreements(): FederationAgreement[] {
    return this.federationManager.getActiveAgreements();
  }

  /**
   * Check if federated with a specific forest
   */
  isFederatedWith(forestId: string): boolean {
    return this.federationManager.isFederatedWith(forestId);
  }

  /**
   * Send message to federated forest
   */
  async sendToForest(forestId: string, message: unknown): Promise<boolean> {
    if (!this.isFederatedWith(forestId)) {
      this.emit('symbiont:warning', `Cannot send to non-federated forest: ${forestId}`);
      return false;
    }

    return this.gateway.routeMessage(forestId, message);
  }

  /**
   * Manually trigger discovery
   */
  async triggerDiscovery(): Promise<ForestInfo[]> {
    return this.runDiscovery();
  }

  /**
   * Get gateway instance for advanced operations
   */
  getGateway(): GatewayNode {
    return this.gateway;
  }

  /**
   * Get federation manager for advanced operations
   */
  getFederationManager(): FederationManager {
    return this.federationManager;
  }

  // Private methods

  private setupEventHandlers(): void {
    // Forward gateway events
    this.gateway.on('forest:discovered', (forest) => {
      this.discoveredForests.set(forest.id, forest);
      this.status.forestsDiscovered = this.discoveredForests.size;
      this.emit('forest:discovered', forest);

      // Auto-federate if enabled and trust is high enough
      if (this.config.autoFederate && forest.trustScore >= this.config.minAutoFederateTrust) {
        this.autoFederateWith(forest);
      }
    });

    this.gateway.on('forest:lost', (forestId) => {
      this.discoveredForests.delete(forestId);
      this.status.forestsDiscovered = this.discoveredForests.size;
      this.emit('forest:lost', forestId);
    });

    this.gateway.on('bridge:established', (bridge) => {
      this.status.activeBridges++;
      this.emit('bridge:established', bridge);
    });

    this.gateway.on('bridge:degraded', (bridge) => {
      this.status.degradedBridges++;
      this.emit('bridge:degraded', bridge);
    });

    this.gateway.on('bridge:failed', (bridgeId) => {
      this.status.activeBridges = Math.max(0, this.status.activeBridges - 1);
      this.emit('bridge:failed', bridgeId);
    });

    // Forward federation events
    this.federationManager.on('federation:proposed', (agreement) => {
      this.status.pendingProposals++;
      this.emit('federation:proposed', agreement);
    });

    this.federationManager.on('federation:accepted', (agreement) => {
      this.status.pendingProposals = Math.max(0, this.status.pendingProposals - 1);
      this.status.activeFederations++;
      this.emit('federation:accepted', agreement);
    });

    this.federationManager.on('federation:rejected', (agreementId, reason) => {
      this.status.pendingProposals = Math.max(0, this.status.pendingProposals - 1);
      this.emit('federation:rejected', agreementId, reason);
    });

    this.federationManager.on('federation:terminated', (agreementId) => {
      this.status.activeFederations = Math.max(0, this.status.activeFederations - 1);
      this.emit('federation:terminated', agreementId);
    });
  }

  private startDiscovery(): void {
    // Run initial discovery
    this.runDiscovery();

    // Schedule periodic discovery
    this.discoveryTimer = setInterval(
      () => this.runDiscovery(),
      this.config.discoveryInterval
    );
  }

  private async runDiscovery(): Promise<ForestInfo[]> {
    this.emit('symbiont:discovery:started');
    this.status.lastDiscovery = Date.now();

    // Discovery logic would query forest registry
    // For now, simulate discovery through gateway connections
    const connectedForests = this.gateway.getConnectedForests();

    for (const forest of connectedForests) {
      if (!this.discoveredForests.has(forest.id)) {
        this.discoveredForests.set(forest.id, forest);
      }
    }

    this.status.forestsDiscovered = this.discoveredForests.size;
    const forests = Array.from(this.discoveredForests.values());

    this.emit('symbiont:discovery:completed', forests);
    return forests;
  }

  private startHealthMonitoring(): void {
    this.runHealthCheck();

    this.healthCheckTimer = setInterval(
      () => this.runHealthCheck(),
      this.config.healthCheckInterval
    );
  }

  private runHealthCheck(): void {
    this.status.lastHealthCheck = Date.now();

    // Calculate health score
    let healthScore = 100;

    // Penalize for degraded bridges
    if (this.status.activeBridges > 0) {
      const degradedRatio = this.status.degradedBridges / this.status.activeBridges;
      healthScore -= degradedRatio * 50;
    }

    // Check for expiring agreements
    const expiring = this.federationManager.getExpiringAgreements();
    if (expiring.length > 0) {
      healthScore -= expiring.length * 5;
      for (const agreement of expiring) {
        this.emit('symbiont:warning', `Agreement ${agreement.id} expiring soon`);
      }
    }

    this.status.healthScore = Math.max(0, Math.min(100, healthScore));
    this.emit('symbiont:health:check', this.status);
  }

  private async autoFederateWith(forest: ForestInfo): Promise<void> {
    // Check if already federated
    if (this.isFederatedWith(forest.id)) {
      return;
    }

    // Check max federations
    if (this.status.activeFederations >= this.config.maxFederations) {
      return;
    }

    this.emit('symbiont:auto:federate', forest);

    try {
      const agreement = await this.proposeFederation(forest.id, 'mutual');
      console.log(`[Symbiont] Auto-proposed federation with ${forest.name}: ${agreement.id}`);
    } catch (error) {
      this.emit('symbiont:error', error as Error);
    }
  }
}

// Types are exported inline via their declarations above
