/**
 * Signal Propagation - Gossip protocol for network-wide communication
 *
 * Like chemical signals that spread through mycelium to warn of threats
 * or share nutrients, this module handles broadcast communication.
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type { Signal, SignalType, MyceliumEvents } from '../types';

/**
 * Configuration for signal propagation
 */
export interface SignalConfig {
  /** Default TTL for signals */
  defaultTTL: number;

  /** Maximum signals to cache for deduplication */
  maxCacheSize: number;

  /** Cache expiry time in milliseconds */
  cacheExpiry: number;

  /** Rate limit for outgoing signals per second */
  rateLimit: number;

  /** Enable signal batching */
  batchingEnabled: boolean;

  /** Batch interval in milliseconds */
  batchInterval: number;
}

const DEFAULT_CONFIG: SignalConfig = {
  defaultTTL: 7,
  maxCacheSize: 10000,
  cacheExpiry: 60000,
  rateLimit: 100,
  batchingEnabled: true,
  batchInterval: 100,
};

/**
 * Signal handler callback type
 */
export type SignalHandler = (signal: Signal) => void | Promise<void>;

/**
 * Manages signal propagation through the mycelium network
 */
export class SignalPropagator extends EventEmitter<MyceliumEvents> {
  private config: SignalConfig;
  private localNodeId: NodeId;
  private seenSignals: Map<string, number> = new Map();
  private handlers: Map<SignalType, Set<SignalHandler>> = new Map();
  private pendingBatch: Signal[] = [];
  private batchTimer?: ReturnType<typeof setInterval>;
  private cleanupTimer?: ReturnType<typeof setInterval>;
  private rateLimitTokens: number;
  private lastTokenRefill: number;

  // Callback to get current peers for forwarding
  private getPeers: () => NodeId[] = () => [];

  // Callback to send signal to a specific peer
  private sendToPeer: (peer: NodeId, signal: Signal) => Promise<void> = async () => {};

  constructor(localNodeId: NodeId, config: Partial<SignalConfig> = {}) {
    super();
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.rateLimitTokens = this.config.rateLimit;
    this.lastTokenRefill = Date.now();
  }

  /**
   * Start the signal propagator
   */
  start(): void {
    if (this.config.batchingEnabled) {
      this.batchTimer = setInterval(
        () => this.flushBatch(),
        this.config.batchInterval
      );
    }

    this.cleanupTimer = setInterval(
      () => this.cleanupCache(),
      this.config.cacheExpiry / 2
    );
  }

  /**
   * Stop the signal propagator
   */
  stop(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = undefined;
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.flushBatch();
  }

  /**
   * Set peer retrieval callback
   */
  setPeerProvider(provider: () => NodeId[]): void {
    this.getPeers = provider;
  }

  /**
   * Set peer send callback
   */
  setPeerSender(sender: (peer: NodeId, signal: Signal) => Promise<void>): void {
    this.sendToPeer = sender;
  }

  /**
   * Create and broadcast a new signal
   */
  async broadcast(
    type: SignalType,
    payload: unknown,
    ttl?: number
  ): Promise<Signal> {
    const signal = this.createSignal(type, payload, ttl);
    await this.propagate(signal);
    return signal;
  }

  /**
   * Register a handler for a signal type
   */
  onSignal(type: SignalType, handler: SignalHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  /**
   * Handle an incoming signal from a peer
   */
  async handleIncoming(signal: Signal): Promise<void> {
    // Check if we've seen this signal before
    if (this.seenSignals.has(signal.id)) {
      return; // Already processed
    }

    // Mark as seen
    this.seenSignals.set(signal.id, Date.now());

    // Emit event
    this.emit('signal:received', signal);

    // Call registered handlers
    const handlers = this.handlers.get(signal.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(signal);
        } catch (error) {
          console.error(`Signal handler error for ${signal.type}:`, error);
        }
      }
    }

    // Forward if TTL allows
    if (signal.ttl > 1) {
      const forwardSignal: Signal = {
        ...signal,
        ttl: signal.ttl - 1,
      };
      await this.propagate(forwardSignal);
    }
  }

  /**
   * Get statistics about signal propagation
   */
  getStats(): SignalStats {
    return {
      cacheSize: this.seenSignals.size,
      handlersRegistered: Array.from(this.handlers.values())
        .reduce((sum, set) => sum + set.size, 0),
      pendingBatchSize: this.pendingBatch.length,
      availableTokens: this.rateLimitTokens,
    };
  }

  // Private methods

  private createSignal(
    type: SignalType,
    payload: unknown,
    ttl?: number
  ): Signal {
    const now = Date.now();
    const id = `${this.localNodeId}:${now}:${Math.random().toString(36).slice(2)}`;

    return {
      type,
      origin: this.localNodeId,
      payload,
      ttl: ttl ?? this.config.defaultTTL,
      id,
      timestamp: now,
      signature: '', // Would be filled by signing in real implementation
    };
  }

  private async propagate(signal: Signal): Promise<void> {
    // Mark our own signals as seen
    this.seenSignals.set(signal.id, Date.now());

    if (this.config.batchingEnabled) {
      this.pendingBatch.push(signal);
    } else {
      await this.sendToAllPeers(signal);
    }
  }

  private async flushBatch(): Promise<void> {
    if (this.pendingBatch.length === 0) return;

    const batch = this.pendingBatch;
    this.pendingBatch = [];

    for (const signal of batch) {
      await this.sendToAllPeers(signal);
    }
  }

  private async sendToAllPeers(signal: Signal): Promise<void> {
    // Refill rate limit tokens
    this.refillTokens();

    if (this.rateLimitTokens <= 0) {
      // Rate limited, drop the signal
      return;
    }

    this.rateLimitTokens--;

    const peers = this.getPeers();
    const sendPromises = peers
      .filter(peer => peer !== signal.origin) // Don't send back to origin
      .map(peer =>
        this.sendToPeer(peer, signal).catch(err => {
          console.error(`Failed to send signal to ${peer}:`, err);
        })
      );

    await Promise.all(sendPromises);
    this.emit('signal:propagated', signal, peers.length);
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastTokenRefill;
    const tokensToAdd = (elapsed / 1000) * this.config.rateLimit;

    this.rateLimitTokens = Math.min(
      this.config.rateLimit,
      this.rateLimitTokens + tokensToAdd
    );
    this.lastTokenRefill = now;
  }

  private cleanupCache(): void {
    const now = Date.now();
    const expiry = this.config.cacheExpiry;

    for (const [id, timestamp] of this.seenSignals) {
      if (now - timestamp > expiry) {
        this.seenSignals.delete(id);
      }
    }

    // Also enforce max cache size
    if (this.seenSignals.size > this.config.maxCacheSize) {
      const entries = Array.from(this.seenSignals.entries())
        .sort((a, b) => a[1] - b[1]); // Sort by timestamp

      const toRemove = entries.slice(0, this.seenSignals.size - this.config.maxCacheSize);
      for (const [id] of toRemove) {
        this.seenSignals.delete(id);
      }
    }
  }
}

export interface SignalStats {
  cacheSize: number;
  handlersRegistered: number;
  pendingBatchSize: number;
  availableTokens: number;
}

export { Signal, SignalType };
