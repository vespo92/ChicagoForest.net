/**
 * @chicago-forest/canopy-api - WebSocket Node Events Handler
 *
 * Real-time event handling for node lifecycle, status changes, and
 * peer interactions in the Chicago Forest Network.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. Event handling patterns follow standard practices
 * but represent conceptual design for a decentralized energy network.
 */

import { EventEmitter } from 'eventemitter3';
import type {
  NodeId,
  PeerInfo,
  NodeCapability,
  NodeStatus,
} from '@chicago-forest/shared-types';

// =============================================================================
// Types
// =============================================================================

/**
 * Node event types
 */
export type NodeEventType =
  | 'node:online'
  | 'node:offline'
  | 'node:status-changed'
  | 'node:capability-changed'
  | 'node:reputation-changed'
  | 'node:registered'
  | 'node:deregistered'
  | 'peer:connected'
  | 'peer:disconnected'
  | 'peer:discovered'
  | 'peer:lost';

/**
 * Base node event
 */
export interface NodeEvent {
  type: NodeEventType;
  nodeId: NodeId;
  timestamp: number;
  data: unknown;
}

/**
 * Node online event
 */
export interface NodeOnlineEvent extends NodeEvent {
  type: 'node:online';
  data: {
    publicKey: string;
    addresses: string[];
    capabilities: NodeCapability[];
    version: string;
  };
}

/**
 * Node offline event
 */
export interface NodeOfflineEvent extends NodeEvent {
  type: 'node:offline';
  data: {
    reason: 'graceful' | 'timeout' | 'error';
    lastSeen: number;
    message?: string;
  };
}

/**
 * Node status change event
 */
export interface NodeStatusChangedEvent extends NodeEvent {
  type: 'node:status-changed';
  data: {
    previousStatus: NodeStatus;
    currentStatus: NodeStatus;
    changedFields: string[];
  };
}

/**
 * Peer connection event
 */
export interface PeerConnectedEvent extends NodeEvent {
  type: 'peer:connected';
  data: {
    peerId: NodeId;
    peerInfo: PeerInfo;
    connectionType: 'inbound' | 'outbound';
    latency: number;
  };
}

/**
 * Peer disconnection event
 */
export interface PeerDisconnectedEvent extends NodeEvent {
  type: 'peer:disconnected';
  data: {
    peerId: NodeId;
    reason: 'graceful' | 'timeout' | 'error' | 'kicked';
    duration: number;
    bytesExchanged: number;
  };
}

/**
 * Subscription filter for node events
 */
export interface NodeEventFilter {
  /** Specific node IDs to watch */
  nodeIds?: NodeId[];
  /** Event types to receive */
  eventTypes?: NodeEventType[];
  /** Filter by capabilities */
  capabilities?: NodeCapability[];
  /** Geographic region filter */
  region?: string;
  /** Minimum reputation threshold */
  minReputation?: number;
}

/**
 * Node event handler interface
 */
export interface NodeEventHandlerEvents {
  event: (event: NodeEvent) => void;
  subscribed: (filter: NodeEventFilter) => void;
  unsubscribed: (subscriptionId: string) => void;
  error: (error: Error) => void;
}

// =============================================================================
// Node Events Handler
// =============================================================================

/**
 * Handler for real-time node events
 */
export class NodeEventsHandler extends EventEmitter<NodeEventHandlerEvents> {
  private subscriptions: Map<string, NodeEventFilter> = new Map();
  private eventBuffer: NodeEvent[] = [];
  private bufferSize: number = 1000;
  private eventCounter: number = 0;

  constructor() {
    super();
  }

  /**
   * Subscribe to node events with filter
   */
  subscribe(filter: NodeEventFilter = {}): string {
    const subscriptionId = `node-sub-${Date.now()}-${++this.eventCounter}`;
    this.subscriptions.set(subscriptionId, filter);
    this.emit('subscribed', filter);
    return subscriptionId;
  }

  /**
   * Unsubscribe from node events
   */
  unsubscribe(subscriptionId: string): boolean {
    const existed = this.subscriptions.delete(subscriptionId);
    if (existed) {
      this.emit('unsubscribed', subscriptionId);
    }
    return existed;
  }

  /**
   * Process incoming node event
   */
  handleEvent(event: NodeEvent): void {
    // Buffer event
    this.bufferEvent(event);

    // Emit to matching subscriptions
    for (const [subId, filter] of this.subscriptions) {
      if (this.matchesFilter(event, filter)) {
        this.emit('event', event);
      }
    }
  }

  /**
   * Simulate node online event
   * [THEORETICAL] Would be triggered by P2P layer
   */
  simulateNodeOnline(nodeId: NodeId, data: NodeOnlineEvent['data']): void {
    const event: NodeOnlineEvent = {
      type: 'node:online',
      nodeId,
      timestamp: Date.now(),
      data,
    };
    this.handleEvent(event);
  }

  /**
   * Simulate node offline event
   */
  simulateNodeOffline(nodeId: NodeId, reason: NodeOfflineEvent['data']['reason']): void {
    const event: NodeOfflineEvent = {
      type: 'node:offline',
      nodeId,
      timestamp: Date.now(),
      data: {
        reason,
        lastSeen: Date.now(),
      },
    };
    this.handleEvent(event);
  }

  /**
   * Simulate peer connection
   */
  simulatePeerConnected(
    nodeId: NodeId,
    peerId: NodeId,
    peerInfo: PeerInfo,
    connectionType: 'inbound' | 'outbound'
  ): void {
    const event: PeerConnectedEvent = {
      type: 'peer:connected',
      nodeId,
      timestamp: Date.now(),
      data: {
        peerId,
        peerInfo,
        connectionType,
        latency: Math.random() * 100,
      },
    };
    this.handleEvent(event);
  }

  /**
   * Simulate peer disconnection
   */
  simulatePeerDisconnected(
    nodeId: NodeId,
    peerId: NodeId,
    reason: PeerDisconnectedEvent['data']['reason']
  ): void {
    const event: PeerDisconnectedEvent = {
      type: 'peer:disconnected',
      nodeId,
      timestamp: Date.now(),
      data: {
        peerId,
        reason,
        duration: Math.random() * 86400000,
        bytesExchanged: Math.random() * 1000000000,
      },
    };
    this.handleEvent(event);
  }

  /**
   * Get recent events from buffer
   */
  getRecentEvents(count: number = 100, filter?: NodeEventFilter): NodeEvent[] {
    let events = [...this.eventBuffer].reverse();

    if (filter) {
      events = events.filter(e => this.matchesFilter(e, filter));
    }

    return events.slice(0, count);
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions(): Map<string, NodeEventFilter> {
    return new Map(this.subscriptions);
  }

  // Private methods

  private bufferEvent(event: NodeEvent): void {
    this.eventBuffer.push(event);
    if (this.eventBuffer.length > this.bufferSize) {
      this.eventBuffer.shift();
    }
  }

  private matchesFilter(event: NodeEvent, filter: NodeEventFilter): boolean {
    // Node ID filter
    if (filter.nodeIds && filter.nodeIds.length > 0) {
      if (!filter.nodeIds.includes(event.nodeId)) {
        return false;
      }
    }

    // Event type filter
    if (filter.eventTypes && filter.eventTypes.length > 0) {
      if (!filter.eventTypes.includes(event.type)) {
        return false;
      }
    }

    // Capability filter (for online events)
    if (filter.capabilities && filter.capabilities.length > 0) {
      if (event.type === 'node:online') {
        const onlineEvent = event as NodeOnlineEvent;
        const hasCapability = filter.capabilities.some(cap =>
          onlineEvent.data.capabilities.includes(cap)
        );
        if (!hasCapability) {
          return false;
        }
      }
    }

    return true;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create node events handler
 */
export function createNodeEventsHandler(): NodeEventsHandler {
  return new NodeEventsHandler();
}

// =============================================================================
// Event Formatters
// =============================================================================

/**
 * Format event for WebSocket transmission
 */
export function formatEventForTransmission(event: NodeEvent): {
  type: string;
  payload: unknown;
  timestamp: number;
} {
  return {
    type: event.type,
    payload: {
      nodeId: event.nodeId,
      ...event.data,
    },
    timestamp: event.timestamp,
  };
}

/**
 * Create aggregated status update
 * [THEORETICAL] Would aggregate multiple events into periodic summary
 */
export function createStatusSummary(events: NodeEvent[]): {
  period: { start: number; end: number };
  nodesOnline: number;
  nodesOffline: number;
  peersConnected: number;
  peersDisconnected: number;
  totalEvents: number;
} {
  const now = Date.now();
  const periodStart = events.length > 0 ? events[0].timestamp : now;

  return {
    period: { start: periodStart, end: now },
    nodesOnline: events.filter(e => e.type === 'node:online').length,
    nodesOffline: events.filter(e => e.type === 'node:offline').length,
    peersConnected: events.filter(e => e.type === 'peer:connected').length,
    peersDisconnected: events.filter(e => e.type === 'peer:disconnected').length,
    totalEvents: events.length,
  };
}
