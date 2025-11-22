/**
 * Bridge Protocol - Low-level inter-forest communication
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type {
  BridgeConnection,
  BridgeState,
  BridgeMetrics,
  SymbiosisEvents,
} from '../types';

/**
 * Configuration for bridge protocol
 */
export interface BridgeConfig {
  /** Keepalive interval (ms) */
  keepaliveInterval: number;

  /** Connection timeout (ms) */
  connectionTimeout: number;

  /** Maximum reconnection attempts */
  maxReconnectAttempts: number;

  /** Reconnection delay (ms) */
  reconnectDelay: number;

  /** Enable metrics collection */
  metricsEnabled: boolean;

  /** Metrics collection interval (ms) */
  metricsInterval: number;
}

const DEFAULT_CONFIG: BridgeConfig = {
  keepaliveInterval: 30000,
  connectionTimeout: 10000,
  maxReconnectAttempts: 5,
  reconnectDelay: 5000,
  metricsEnabled: true,
  metricsInterval: 60000,
};

/**
 * Message types for bridge protocol
 */
export type BridgeMessageType =
  | 'handshake'
  | 'handshake-ack'
  | 'keepalive'
  | 'keepalive-ack'
  | 'data'
  | 'data-ack'
  | 'close'
  | 'error';

export interface BridgeMessage {
  type: BridgeMessageType;
  bridgeId: string;
  sequence: number;
  timestamp: number;
  payload?: unknown;
}

/**
 * Manages a single bridge connection
 */
export class BridgeProtocol extends EventEmitter<SymbiosisEvents> {
  private config: BridgeConfig;
  private connection: BridgeConnection;
  private sequence: number = 0;
  private keepaliveTimer?: ReturnType<typeof setInterval>;
  private metricsTimer?: ReturnType<typeof setInterval>;
  private reconnectAttempts: number = 0;
  private pendingAcks: Map<number, { resolve: () => void; timeout: ReturnType<typeof setTimeout> }> = new Map();

  constructor(connection: BridgeConnection, config: Partial<BridgeConfig> = {}) {
    super();
    this.connection = connection;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start the bridge protocol
   */
  async start(): Promise<boolean> {
    try {
      // Send handshake
      await this.sendHandshake();

      // Start keepalive
      this.keepaliveTimer = setInterval(
        () => this.sendKeepalive(),
        this.config.keepaliveInterval
      );

      // Start metrics collection
      if (this.config.metricsEnabled) {
        this.metricsTimer = setInterval(
          () => this.collectMetrics(),
          this.config.metricsInterval
        );
      }

      this.connection.state = 'active';
      this.emit('bridge:established', this.connection);
      return true;
    } catch (error) {
      this.connection.state = 'failed';
      this.emit('bridge:failed', this.connection.id);
      return false;
    }
  }

  /**
   * Stop the bridge protocol
   */
  async stop(): Promise<void> {
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = undefined;
    }
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }

    // Clear pending acks
    for (const [, pending] of this.pendingAcks) {
      clearTimeout(pending.timeout);
    }
    this.pendingAcks.clear();

    // Send close message
    await this.sendMessage('close', {});
    this.connection.state = 'failed';
  }

  /**
   * Send data through the bridge
   */
  async send(data: unknown): Promise<boolean> {
    if (this.connection.state !== 'active') {
      return false;
    }

    try {
      await this.sendMessage('data', data);
      this.connection.metrics.messagesExchanged++;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: BridgeMessage): Promise<void> {
    switch (message.type) {
      case 'handshake':
        await this.sendMessage('handshake-ack', {});
        break;

      case 'handshake-ack':
        this.resolvePending(message.sequence);
        break;

      case 'keepalive':
        await this.sendMessage('keepalive-ack', {});
        this.connection.metrics.uptime = 100;
        break;

      case 'keepalive-ack':
        this.resolvePending(message.sequence);
        this.updateLatency(message);
        break;

      case 'data':
        await this.sendMessage('data-ack', { seq: message.sequence });
        // Would deliver data to application
        break;

      case 'data-ack':
        this.resolvePending(message.sequence);
        break;

      case 'close':
        await this.handleClose();
        break;

      case 'error':
        await this.handleError(message.payload as string);
        break;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): BridgeMetrics {
    return { ...this.connection.metrics };
  }

  /**
   * Get bridge state
   */
  getState(): BridgeState {
    return this.connection.state;
  }

  // Private methods

  private async sendHandshake(): Promise<void> {
    await this.sendMessage('handshake', {
      forest: this.connection.localForest,
      gateway: this.connection.localGateway,
      protocols: ['bridge-v1'],
    });
  }

  private async sendKeepalive(): Promise<void> {
    const startTime = Date.now();
    try {
      await this.sendMessage('keepalive', { timestamp: startTime });
    } catch (error) {
      this.handleKeepaliveFailure();
    }
  }

  private async sendMessage(type: BridgeMessageType, payload: unknown): Promise<void> {
    const seq = ++this.sequence;
    const message: BridgeMessage = {
      type,
      bridgeId: this.connection.id,
      sequence: seq,
      timestamp: Date.now(),
      payload,
    };

    // Would send message over network
    console.log(`Bridge ${this.connection.id}: Sending ${type}`);

    // For types requiring ack, wait for response
    if (['handshake', 'keepalive', 'data'].includes(type)) {
      await this.waitForAck(seq);
    }
  }

  private waitForAck(sequence: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingAcks.delete(sequence);
        reject(new Error('Ack timeout'));
      }, this.config.connectionTimeout);

      this.pendingAcks.set(sequence, { resolve, timeout });
    });
  }

  private resolvePending(sequence: number): void {
    const pending = this.pendingAcks.get(sequence);
    if (pending) {
      clearTimeout(pending.timeout);
      pending.resolve();
      this.pendingAcks.delete(sequence);
    }
  }

  private updateLatency(message: BridgeMessage): void {
    const now = Date.now();
    const sent = message.timestamp;
    this.connection.metrics.latency = now - sent;
  }

  private handleKeepaliveFailure(): void {
    this.connection.state = 'degraded';
    this.emit('bridge:degraded', this.connection);

    // Attempt reconnection
    this.attemptReconnection();
  }

  private async attemptReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.connection.state = 'failed';
      this.emit('bridge:failed', this.connection.id);
      return;
    }

    this.reconnectAttempts++;
    this.connection.state = 'reconnecting';

    await new Promise(resolve =>
      setTimeout(resolve, this.config.reconnectDelay)
    );

    const success = await this.start();
    if (success) {
      this.reconnectAttempts = 0;
    }
  }

  private async handleClose(): Promise<void> {
    this.connection.state = 'failed';
    await this.stop();
  }

  private async handleError(error: string): Promise<void> {
    console.error(`Bridge error: ${error}`);
    this.connection.state = 'degraded';
    this.emit('bridge:degraded', this.connection);
  }

  private collectMetrics(): void {
    // Would collect actual network metrics
    // For now, simulate stable connection
    this.connection.metrics.uptime = Math.min(
      100,
      this.connection.metrics.uptime + 0.1
    );
  }
}

export { BridgeConnection, BridgeState, BridgeMetrics };
