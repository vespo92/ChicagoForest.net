/**
 * @chicago-forest/canopy-api - WebSocket Server
 *
 * Real-time WebSocket server for the Chicago Forest Network, providing
 * bidirectional communication for node events, mesh updates, and subscriptions.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. The WebSocket implementation demonstrates patterns
 * but is not production-ready infrastructure.
 */

import { EventEmitter } from 'eventemitter3';
import type { Subscription, CanopyEvents } from '../types';
import type { NodeId } from '@chicago-forest/shared-types';
import {
  NodeEventsHandler,
  createNodeEventsHandler,
  type NodeEvent,
  type NodeEventFilter,
} from './handlers/node-events';
import {
  MeshUpdatesHandler,
  createMeshUpdatesHandler,
  type MeshUpdateEvent,
  type MeshUpdateFilter,
  type MeshSnapshot,
} from './handlers/mesh-updates';

// =============================================================================
// Types
// =============================================================================

/**
 * WebSocket message types
 */
export type WSMessageType =
  | 'subscribe'
  | 'unsubscribe'
  | 'event'
  | 'request'
  | 'response'
  | 'ping'
  | 'pong'
  | 'error'
  | 'snapshot';

/**
 * WebSocket message structure
 */
export interface WSMessage {
  type: WSMessageType;
  id: string;
  topic?: string;
  payload: unknown;
  timestamp: number;
}

/**
 * Client connection
 */
export interface WSClient {
  id: string;
  connectedAt: number;
  lastActivity: number;
  authenticated: boolean;
  subscriptions: Map<string, ClientSubscription>;
  metadata: Record<string, unknown>;
}

/**
 * Client subscription
 */
export interface ClientSubscription {
  id: string;
  topic: string;
  filter: NodeEventFilter | MeshUpdateFilter;
  createdAt: number;
}

/**
 * Available subscription topics
 */
export type SubscriptionTopic =
  | 'nodes'
  | 'mesh'
  | 'routing'
  | 'research'
  | 'system';

/**
 * Server configuration
 */
export interface WSServerConfig {
  /** Port to listen on */
  port: number;
  /** Path for WebSocket endpoint */
  path: string;
  /** Ping interval (ms) */
  pingInterval: number;
  /** Client timeout (ms) */
  clientTimeout: number;
  /** Max clients */
  maxClients: number;
  /** Require authentication */
  requireAuth: boolean;
}

/**
 * Server statistics
 */
export interface WSServerStats {
  connectedClients: number;
  totalSubscriptions: number;
  messagesIn: number;
  messagesOut: number;
  uptime: number;
  topicSubscribers: Record<string, number>;
}

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CONFIG: WSServerConfig = {
  port: 3001,
  path: '/ws',
  pingInterval: 30000,
  clientTimeout: 120000,
  maxClients: 1000,
  requireAuth: false,
};

// =============================================================================
// WebSocket Server
// =============================================================================

/**
 * Chicago Forest WebSocket Server
 */
export class CanopyWebSocketServer extends EventEmitter<CanopyEvents> {
  private config: WSServerConfig;
  private clients: Map<string, WSClient> = new Map();
  private nodeEvents: NodeEventsHandler;
  private meshUpdates: MeshUpdatesHandler;
  private pingTimer?: ReturnType<typeof setInterval>;
  private startTime: number = 0;
  private messageCounter: number = 0;
  private stats: {
    messagesIn: number;
    messagesOut: number;
  } = { messagesIn: 0, messagesOut: 0 };

  // Sender callback (set by transport layer)
  private sendToClient: (clientId: string, message: WSMessage) => void = () => {};

  constructor(config: Partial<WSServerConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize handlers
    this.nodeEvents = createNodeEventsHandler();
    this.meshUpdates = createMeshUpdatesHandler();

    // Wire up event handlers
    this.setupEventHandlers();
  }

  /**
   * Set the message sender function
   */
  setSender(sender: (clientId: string, message: WSMessage) => void): void {
    this.sendToClient = sender;
  }

  /**
   * Start the WebSocket server
   */
  async start(): Promise<void> {
    this.startTime = Date.now();

    // Start ping interval
    this.pingTimer = setInterval(() => this.pingClients(), this.config.pingInterval);

    console.log(`
===============================================
  Chicago Forest WebSocket Server
===============================================
  Port: ${this.config.port}
  Path: ${this.config.path}
  Max Clients: ${this.config.maxClients}

  DISCLAIMER: Theoretical framework for
  educational and research purposes.
===============================================
`);
  }

  /**
   * Stop the WebSocket server
   */
  async stop(): Promise<void> {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }

    // Disconnect all clients gracefully
    for (const clientId of this.clients.keys()) {
      this.handleDisconnect(clientId);
    }

    console.log('WebSocket server stopped');
  }

  /**
   * Handle new client connection
   */
  handleConnect(clientId: string, metadata: Record<string, unknown> = {}): void {
    if (this.clients.size >= this.config.maxClients) {
      this.sendToClient(clientId, {
        type: 'error',
        id: this.generateMessageId(),
        payload: {
          code: 'MAX_CLIENTS',
          message: 'Maximum client limit reached',
        },
        timestamp: Date.now(),
      });
      return;
    }

    const client: WSClient = {
      id: clientId,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      authenticated: !this.config.requireAuth,
      subscriptions: new Map(),
      metadata,
    };

    this.clients.set(clientId, client);
    this.emit('client:connected', clientId);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'response',
      id: this.generateMessageId(),
      payload: {
        message: 'Connected to Chicago Forest Network',
        clientId,
        serverTime: Date.now(),
        disclaimer: 'AI-generated theoretical framework for educational purposes',
      },
      timestamp: Date.now(),
    });
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Clean up subscriptions
    for (const [subId, sub] of client.subscriptions) {
      this.unsubscribeFromTopic(clientId, sub.topic, subId);
    }

    this.clients.delete(clientId);
    this.emit('client:disconnected', clientId);
  }

  /**
   * Handle incoming message
   */
  async handleMessage(clientId: string, message: WSMessage): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = Date.now();
    this.stats.messagesIn++;

    switch (message.type) {
      case 'subscribe':
        await this.handleSubscribe(clientId, message);
        break;

      case 'unsubscribe':
        await this.handleUnsubscribe(clientId, message);
        break;

      case 'request':
        await this.handleRequest(clientId, message);
        break;

      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          id: message.id,
          payload: { serverTime: Date.now() },
          timestamp: Date.now(),
        });
        break;

      case 'pong':
        // Update last activity (already done above)
        break;

      default:
        this.sendToClient(clientId, {
          type: 'error',
          id: message.id,
          payload: {
            code: 'UNKNOWN_MESSAGE_TYPE',
            message: `Unknown message type: ${message.type}`,
          },
          timestamp: Date.now(),
        });
    }
  }

  /**
   * Broadcast event to topic subscribers
   */
  broadcast(topic: SubscriptionTopic, event: unknown): void {
    const message: WSMessage = {
      type: 'event',
      id: this.generateMessageId(),
      topic,
      payload: event,
      timestamp: Date.now(),
    };

    for (const [clientId, client] of this.clients) {
      for (const [, sub] of client.subscriptions) {
        if (sub.topic === topic) {
          this.sendToClient(clientId, message);
          this.stats.messagesOut++;
        }
      }
    }
  }

  /**
   * Get server statistics
   */
  getStats(): WSServerStats {
    const topicSubscribers: Record<string, number> = {
      nodes: 0,
      mesh: 0,
      routing: 0,
      research: 0,
      system: 0,
    };

    let totalSubscriptions = 0;

    for (const client of this.clients.values()) {
      for (const sub of client.subscriptions.values()) {
        totalSubscriptions++;
        if (sub.topic in topicSubscribers) {
          topicSubscribers[sub.topic]++;
        }
      }
    }

    return {
      connectedClients: this.clients.size,
      totalSubscriptions,
      messagesIn: this.stats.messagesIn,
      messagesOut: this.stats.messagesOut,
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      topicSubscribers,
    };
  }

  /**
   * Get connected clients
   */
  getClients(): WSClient[] {
    return Array.from(this.clients.values());
  }

  /**
   * Get client by ID
   */
  getClient(clientId: string): WSClient | undefined {
    return this.clients.get(clientId);
  }

  // Private methods

  private setupEventHandlers(): void {
    // Forward node events to subscribers
    this.nodeEvents.on('event', (event: NodeEvent) => {
      this.broadcast('nodes', {
        eventType: event.type,
        nodeId: event.nodeId,
        data: event.data,
        timestamp: event.timestamp,
      });
    });

    // Forward mesh updates to subscribers
    this.meshUpdates.on('update', (update: MeshUpdateEvent) => {
      this.broadcast('mesh', {
        eventType: update.type,
        source: update.source,
        data: update.data,
        timestamp: update.timestamp,
      });
    });

    // Send mesh snapshots
    this.meshUpdates.on('snapshot', (snapshot: MeshSnapshot) => {
      // Find clients subscribed to mesh and send snapshot
      for (const [clientId, client] of this.clients) {
        for (const sub of client.subscriptions.values()) {
          if (sub.topic === 'mesh') {
            this.sendToClient(clientId, {
              type: 'snapshot',
              id: this.generateMessageId(),
              topic: 'mesh',
              payload: snapshot,
              timestamp: Date.now(),
            });
          }
        }
      }
    });
  }

  private async handleSubscribe(clientId: string, message: WSMessage): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    const payload = message.payload as {
      topic: SubscriptionTopic;
      filter?: NodeEventFilter | MeshUpdateFilter;
    };

    if (!payload.topic) {
      this.sendToClient(clientId, {
        type: 'error',
        id: message.id,
        payload: {
          code: 'MISSING_TOPIC',
          message: 'Subscription topic is required',
        },
        timestamp: Date.now(),
      });
      return;
    }

    const subscriptionId = this.subscribeToTopic(clientId, payload.topic, payload.filter);

    const subscription: ClientSubscription = {
      id: subscriptionId,
      topic: payload.topic,
      filter: payload.filter || {},
      createdAt: Date.now(),
    };

    client.subscriptions.set(subscriptionId, subscription);

    this.sendToClient(clientId, {
      type: 'response',
      id: message.id,
      payload: {
        subscriptionId,
        topic: payload.topic,
        message: `Subscribed to ${payload.topic}`,
      },
      timestamp: Date.now(),
    });

    this.emit('subscription:created', {
      id: subscriptionId,
      topic: payload.topic,
      clientId,
      createdAt: Date.now(),
      active: true,
    } as Subscription);
  }

  private async handleUnsubscribe(clientId: string, message: WSMessage): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    const payload = message.payload as { subscriptionId: string };

    if (!payload.subscriptionId) {
      this.sendToClient(clientId, {
        type: 'error',
        id: message.id,
        payload: {
          code: 'MISSING_SUBSCRIPTION_ID',
          message: 'Subscription ID is required',
        },
        timestamp: Date.now(),
      });
      return;
    }

    const subscription = client.subscriptions.get(payload.subscriptionId);
    if (!subscription) {
      this.sendToClient(clientId, {
        type: 'error',
        id: message.id,
        payload: {
          code: 'SUBSCRIPTION_NOT_FOUND',
          message: 'Subscription not found',
        },
        timestamp: Date.now(),
      });
      return;
    }

    this.unsubscribeFromTopic(clientId, subscription.topic, payload.subscriptionId);
    client.subscriptions.delete(payload.subscriptionId);

    this.sendToClient(clientId, {
      type: 'response',
      id: message.id,
      payload: {
        subscriptionId: payload.subscriptionId,
        message: 'Unsubscribed successfully',
      },
      timestamp: Date.now(),
    });

    this.emit('subscription:cancelled', payload.subscriptionId);
  }

  private async handleRequest(clientId: string, message: WSMessage): Promise<void> {
    const payload = message.payload as { action: string; data?: unknown };

    // Handle different request actions
    switch (payload.action) {
      case 'getStats':
        this.sendToClient(clientId, {
          type: 'response',
          id: message.id,
          payload: this.getStats(),
          timestamp: Date.now(),
        });
        break;

      case 'getMeshSnapshot':
        this.sendToClient(clientId, {
          type: 'response',
          id: message.id,
          payload: this.meshUpdates.getSnapshot(),
          timestamp: Date.now(),
        });
        break;

      case 'getMeshHealth':
        this.sendToClient(clientId, {
          type: 'response',
          id: message.id,
          payload: this.meshUpdates.getHealthSummary(),
          timestamp: Date.now(),
        });
        break;

      default:
        this.sendToClient(clientId, {
          type: 'error',
          id: message.id,
          payload: {
            code: 'UNKNOWN_ACTION',
            message: `Unknown action: ${payload.action}`,
          },
          timestamp: Date.now(),
        });
    }
  }

  private subscribeToTopic(
    clientId: string,
    topic: SubscriptionTopic,
    filter?: NodeEventFilter | MeshUpdateFilter
  ): string {
    switch (topic) {
      case 'nodes':
        return this.nodeEvents.subscribe(filter as NodeEventFilter);
      case 'mesh':
        return this.meshUpdates.subscribe(filter as MeshUpdateFilter);
      default:
        return `sub-${topic}-${Date.now()}`;
    }
  }

  private unsubscribeFromTopic(
    clientId: string,
    topic: SubscriptionTopic,
    subscriptionId: string
  ): void {
    switch (topic) {
      case 'nodes':
        this.nodeEvents.unsubscribe(subscriptionId);
        break;
      case 'mesh':
        this.meshUpdates.unsubscribe(subscriptionId);
        break;
    }
  }

  private pingClients(): void {
    const now = Date.now();

    for (const [clientId, client] of this.clients) {
      // Check for timeout
      if (now - client.lastActivity > this.config.clientTimeout) {
        console.log(`Client ${clientId} timed out`);
        this.handleDisconnect(clientId);
        continue;
      }

      // Send ping
      this.sendToClient(clientId, {
        type: 'ping',
        id: this.generateMessageId(),
        payload: { serverTime: now },
        timestamp: now,
      });
      this.stats.messagesOut++;
    }
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${++this.messageCounter}`;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create WebSocket server
 */
export function createWebSocketServer(
  config?: Partial<WSServerConfig>
): CanopyWebSocketServer {
  return new CanopyWebSocketServer(config);
}

// =============================================================================
// Exports
// =============================================================================

export { NodeEventsHandler, MeshUpdatesHandler };
export * from './handlers/node-events';
export * from './handlers/mesh-updates';
