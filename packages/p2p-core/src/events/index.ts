/**
 * @chicago-forest/p2p-core - Events Module
 *
 * Event emitter and handling for network events.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import EventEmitter from 'eventemitter3';
import type {
  NetworkEventType,
  NetworkEvent,
  EventHandler,
  NodeId,
  PeerInfo,
  PeerConnection,
  Message,
  LinkQuality,
  TunnelState,
  AnonymousCircuit,
} from '@chicago-forest/shared-types';

/**
 * Event data types for each event type
 */
export interface EventDataMap {
  'peer:discovered': { peer: PeerInfo };
  'peer:connected': { peer: PeerInfo; connection: PeerConnection };
  'peer:disconnected': { peerId: NodeId; reason?: string };
  'peer:authenticated': { peer: PeerInfo };
  'message:received': { from: NodeId; message: Message };
  'message:sent': { to: NodeId; message: Message };
  'tunnel:up': { tunnel: TunnelState };
  'tunnel:down': { tunnelId: string; reason?: string };
  'link:quality-changed': { peerId: NodeId; quality: LinkQuality };
  'circuit:built': { circuit: AnonymousCircuit };
  'circuit:destroyed': { circuitId: string; reason?: string };
  'firewall:rule-matched': { ruleId: string; action: string; details: unknown };
  error: { code: string; message: string; details?: unknown };
}

/**
 * Type-safe event emitter for Chicago Forest Network
 */
export class ForestEventEmitter extends EventEmitter {
  /**
   * Emit a typed network event
   */
  emitEvent<T extends NetworkEventType>(
    type: T,
    data: T extends keyof EventDataMap ? EventDataMap[T] : unknown
  ): boolean {
    const event: NetworkEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    return this.emit(type, event);
  }

  /**
   * Subscribe to a typed network event
   */
  onEvent<T extends NetworkEventType>(
    type: T,
    handler: EventHandler<T extends keyof EventDataMap ? EventDataMap[T] : unknown>
  ): this {
    return this.on(type, handler);
  }

  /**
   * Subscribe to event once
   */
  onceEvent<T extends NetworkEventType>(
    type: T,
    handler: EventHandler<T extends keyof EventDataMap ? EventDataMap[T] : unknown>
  ): this {
    return this.once(type, handler);
  }

  /**
   * Unsubscribe from event
   */
  offEvent<T extends NetworkEventType>(
    type: T,
    handler?: EventHandler<T extends keyof EventDataMap ? EventDataMap[T] : unknown>
  ): this {
    return this.off(type, handler);
  }

  /**
   * Emit an error event
   */
  emitError(code: string, message: string, details?: unknown): boolean {
    return this.emitEvent('error', { code, message, details });
  }
}

/**
 * Global event bus singleton for the network
 */
let globalEventBus: ForestEventEmitter | null = null;

/**
 * Get or create the global event bus
 */
export function getEventBus(): ForestEventEmitter {
  if (!globalEventBus) {
    globalEventBus = new ForestEventEmitter();
  }
  return globalEventBus;
}

/**
 * Reset the global event bus (useful for testing)
 */
export function resetEventBus(): void {
  if (globalEventBus) {
    globalEventBus.removeAllListeners();
    globalEventBus = null;
  }
}

/**
 * Create an event filter that only passes events matching criteria
 */
export function createEventFilter<T extends NetworkEventType>(
  eventBus: ForestEventEmitter,
  type: T,
  predicate: (data: T extends keyof EventDataMap ? EventDataMap[T] : unknown) => boolean
): ForestEventEmitter {
  const filtered = new ForestEventEmitter();

  eventBus.onEvent(type, (event) => {
    if (predicate(event.data as T extends keyof EventDataMap ? EventDataMap[T] : unknown)) {
      filtered.emitEvent(type, event.data as T extends keyof EventDataMap ? EventDataMap[T] : unknown);
    }
  });

  return filtered;
}

/**
 * Create a debounced event handler
 */
export function debounceEventHandler<T>(
  handler: EventHandler<T>,
  waitMs: number
): EventHandler<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastEvent: (NetworkEvent & { data: T }) | null = null;

  return (event: NetworkEvent & { data: T }) => {
    lastEvent = event;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      if (lastEvent) {
        handler(lastEvent);
      }
      timeout = null;
    }, waitMs);
  };
}

/**
 * Create a throttled event handler
 */
export function throttleEventHandler<T>(
  handler: EventHandler<T>,
  limitMs: number
): EventHandler<T> {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastEvent: (NetworkEvent & { data: T }) | null = null;

  return (event: NetworkEvent & { data: T }) => {
    const now = Date.now();
    lastEvent = event;

    if (now - lastCall >= limitMs) {
      lastCall = now;
      handler(event);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        if (lastEvent) {
          handler(lastEvent);
        }
        timeout = null;
      }, limitMs - (now - lastCall));
    }
  };
}

export default {
  ForestEventEmitter,
  getEventBus,
  resetEventBus,
  createEventFilter,
  debounceEventHandler,
  throttleEventHandler,
};
