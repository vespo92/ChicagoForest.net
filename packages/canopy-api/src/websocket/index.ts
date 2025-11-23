/**
 * WebSocket Handler - Real-time bidirectional communication
 *
 * @chicago-forest/canopy-api WebSocket Module
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. Not operational infrastructure.
 */

import { EventEmitter } from 'eventemitter3';
import type {
  ApiRequest,
  ApiResponse,
  Subscription,
  CanopyEvents,
} from '../types';

// Export handlers
export * from './handlers/node-events';
export * from './handlers/mesh-updates';

// Export server
export {
  CanopyWebSocketServer,
  createWebSocketServer,
  type WSServerConfig,
  type WSServerStats,
  type WSMessage,
  type WSClient,
} from './server';

/**
 * WebSocket message types
 */
export type MessageType =
  | 'request'
  | 'response'
  | 'subscribe'
  | 'unsubscribe'
  | 'event'
  | 'ping'
  | 'pong';

export interface WebSocketMessage {
  type: MessageType;
  id: string;
  payload: unknown;
  timestamp: number;
}

/**
 * Client connection state
 */
export interface ClientConnection {
  id: string;
  connectedAt: number;
  lastActivity: number;
  subscriptions: Set<string>;
  authenticated: boolean;
}

/**
 * WebSocket server for real-time communication
 */
export class WebSocketServer extends EventEmitter<CanopyEvents> {
  private clients: Map<string, ClientConnection> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private topicSubscribers: Map<string, Set<string>> = new Map();
  private pingInterval?: ReturnType<typeof setInterval>;

  // Callbacks
  private sendToClient: (clientId: string, message: WebSocketMessage) => void = () => {};
  private handleRequest: (request: ApiRequest) => Promise<ApiResponse> = async () => ({
    id: '',
    status: 500,
    success: false,
    timestamp: Date.now(),
  });

  constructor() {
    super();
  }

  /**
   * Set message sender callback
   */
  setSender(sender: (clientId: string, message: WebSocketMessage) => void): void {
    this.sendToClient = sender;
  }

  /**
   * Set request handler callback
   */
  setRequestHandler(handler: (request: ApiRequest) => Promise<ApiResponse>): void {
    this.handleRequest = handler;
  }

  /**
   * Start the WebSocket server
   */
  start(): void {
    // Start ping interval
    this.pingInterval = setInterval(() => this.pingClients(), 30000);
  }

  /**
   * Stop the WebSocket server
   */
  stop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
    }
    this.clients.clear();
    this.subscriptions.clear();
    this.topicSubscribers.clear();
  }

  /**
   * Handle client connection
   */
  handleConnect(clientId: string): void {
    const connection: ClientConnection = {
      id: clientId,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      subscriptions: new Set(),
      authenticated: false,
    };
    this.clients.set(clientId, connection);
    this.emit('client:connected', clientId);
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      // Clean up subscriptions
      for (const subId of client.subscriptions) {
        this.removeSubscription(subId);
      }
      this.clients.delete(clientId);
      this.emit('client:disconnected', clientId);
    }
  }

  /**
   * Handle incoming message
   */
  async handleMessage(clientId: string, message: WebSocketMessage): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = Date.now();

    switch (message.type) {
      case 'request':
        await this.handleClientRequest(clientId, message);
        break;
      case 'subscribe':
        await this.handleSubscribe(clientId, message);
        break;
      case 'unsubscribe':
        await this.handleUnsubscribe(clientId, message);
        break;
      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          id: message.id,
          payload: {},
          timestamp: Date.now(),
        });
        break;
    }
  }

  /**
   * Broadcast an event to subscribers
   */
  broadcast(topic: string, event: unknown): void {
    const subscribers = this.topicSubscribers.get(topic);
    if (!subscribers) return;

    const message: WebSocketMessage = {
      type: 'event',
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      payload: { topic, data: event },
      timestamp: Date.now(),
    };

    for (const clientId of subscribers) {
      this.sendToClient(clientId, message);
    }
  }

  /**
   * Get connection statistics
   */
  getStats(): WebSocketStats {
    return {
      connectedClients: this.clients.size,
      activeSubscriptions: this.subscriptions.size,
      topicCount: this.topicSubscribers.size,
    };
  }

  /**
   * Get client info
   */
  getClient(clientId: string): ClientConnection | undefined {
    return this.clients.get(clientId);
  }

  // Private methods

  private async handleClientRequest(
    clientId: string,
    message: WebSocketMessage
  ): Promise<void> {
    const payload = message.payload as Partial<ApiRequest>;

    const request: ApiRequest = {
      id: message.id,
      method: (payload.method ?? 'GET') as ApiRequest['method'],
      path: payload.path ?? '/',
      headers: payload.headers ?? {},
      query: payload.query ?? {},
      body: payload.body,
      timestamp: Date.now(),
      clientId,
    };

    const response = await this.handleRequest(request);

    this.sendToClient(clientId, {
      type: 'response',
      id: message.id,
      payload: response,
      timestamp: Date.now(),
    });
  }

  private async handleSubscribe(
    clientId: string,
    message: WebSocketMessage
  ): Promise<void> {
    const payload = message.payload as { topic: string; filter?: Record<string, unknown> };
    const client = this.clients.get(clientId);
    if (!client) return;

    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      topic: payload.topic,
      filter: payload.filter,
      clientId,
      createdAt: Date.now(),
      active: true,
    };

    this.subscriptions.set(subscription.id, subscription);
    client.subscriptions.add(subscription.id);

    if (!this.topicSubscribers.has(payload.topic)) {
      this.topicSubscribers.set(payload.topic, new Set());
    }
    this.topicSubscribers.get(payload.topic)!.add(clientId);

    this.emit('subscription:created', subscription);

    this.sendToClient(clientId, {
      type: 'response',
      id: message.id,
      payload: { subscriptionId: subscription.id },
      timestamp: Date.now(),
    });
  }

  private async handleUnsubscribe(
    clientId: string,
    message: WebSocketMessage
  ): Promise<void> {
    const payload = message.payload as { subscriptionId: string };
    const subscription = this.subscriptions.get(payload.subscriptionId);

    if (subscription && subscription.clientId === clientId) {
      this.removeSubscription(payload.subscriptionId);
      this.emit('subscription:cancelled', payload.subscriptionId);
    }

    this.sendToClient(clientId, {
      type: 'response',
      id: message.id,
      payload: { success: true },
      timestamp: Date.now(),
    });
  }

  private removeSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return;

    this.subscriptions.delete(subscriptionId);

    const client = this.clients.get(subscription.clientId);
    if (client) {
      client.subscriptions.delete(subscriptionId);
    }

    const topicSubs = this.topicSubscribers.get(subscription.topic);
    if (topicSubs) {
      topicSubs.delete(subscription.clientId);
      if (topicSubs.size === 0) {
        this.topicSubscribers.delete(subscription.topic);
      }
    }
  }

  private pingClients(): void {
    const now = Date.now();
    for (const [clientId, client] of this.clients) {
      // Check for stale connections
      if (now - client.lastActivity > 120000) {
        this.handleDisconnect(clientId);
        continue;
      }

      this.sendToClient(clientId, {
        type: 'ping',
        id: `ping_${now}`,
        payload: {},
        timestamp: now,
      });
    }
  }
}

export interface WebSocketStats {
  connectedClients: number;
  activeSubscriptions: number;
  topicCount: number;
}

export { Subscription };
