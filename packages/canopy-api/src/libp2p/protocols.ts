/**
 * @chicago-forest/canopy-api - LibP2P Protocol Definitions
 *
 * Protocol identifiers and message types for P2P communication.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes.
 */

import type { NodeId } from '@chicago-forest/shared-types';

// =============================================================================
// Protocol Identifiers
// =============================================================================

/**
 * Chicago Forest Network protocol identifiers
 * Following LibP2P protocol naming conventions
 */
export const PROTOCOLS = {
  /** Base forest protocol */
  FOREST: '/chicago-forest/1.0.0',
  /** Node discovery and registration */
  DISCOVERY: '/chicago-forest/discovery/1.0.0',
  /** Routing and path finding */
  ROUTING: '/chicago-forest/routing/1.0.0',
  /** Governance and voting */
  GOVERNANCE: '/chicago-forest/governance/1.0.0',
  /** Distributed storage */
  STORAGE: '/chicago-forest/storage/1.0.0',
  /** Research data sharing */
  RESEARCH: '/chicago-forest/research/1.0.0',
  /** Real-time mesh events */
  EVENTS: '/chicago-forest/events/1.0.0',
  /** Anonymous circuit protocol */
  ANON: '/chicago-forest/anon/1.0.0',
} as const;

export type ProtocolId = typeof PROTOCOLS[keyof typeof PROTOCOLS];

// =============================================================================
// Message Types
// =============================================================================

/**
 * Base message structure
 */
export interface P2PMessage<T = unknown> {
  /** Message ID */
  id: string;
  /** Protocol this message belongs to */
  protocol: ProtocolId;
  /** Message type within protocol */
  type: string;
  /** Sender node ID */
  sender: NodeId;
  /** Recipient node ID (empty for broadcast) */
  recipient?: NodeId;
  /** Message payload */
  payload: T;
  /** Timestamp */
  timestamp: number;
  /** Time-to-live (hops remaining) */
  ttl: number;
  /** Message signature */
  signature?: string;
}

// =============================================================================
// Discovery Protocol Messages
// =============================================================================

export type DiscoveryMessageType =
  | 'announce'
  | 'find-node'
  | 'find-node-response'
  | 'ping'
  | 'pong';

export interface AnnouncePayload {
  nodeId: NodeId;
  publicKey: string;
  capabilities: string[];
  addresses: { protocol: string; address: string }[];
  metadata?: Record<string, unknown>;
}

export interface FindNodePayload {
  targetId: NodeId;
  maxResults?: number;
}

export interface FindNodeResponsePayload {
  nodes: Array<{
    nodeId: NodeId;
    publicKey: string;
    addresses: { protocol: string; address: string }[];
    distance: number;
  }>;
}

// =============================================================================
// Routing Protocol Messages
// =============================================================================

export type RoutingMessageType =
  | 'route-request'
  | 'route-response'
  | 'route-update'
  | 'path-probe'
  | 'path-probe-response';

export interface RouteRequestPayload {
  destination: NodeId;
  preferences?: {
    lowLatency?: boolean;
    highBandwidth?: boolean;
    anonymous?: boolean;
    maxHops?: number;
  };
}

export interface RouteResponsePayload {
  destination: NodeId;
  paths: Array<{
    pathId: string;
    hops: NodeId[];
    metrics: {
      latency: number;
      bandwidth: number;
      reliability: number;
    };
    expiresAt: number;
  }>;
}

export interface RouteUpdatePayload {
  routes: Array<{
    destination: string;
    nextHop: NodeId;
    metric: number;
    sequence: number;
  }>;
}

// =============================================================================
// Governance Protocol Messages
// =============================================================================

export type GovernanceMessageType =
  | 'proposal-announce'
  | 'vote-cast'
  | 'vote-receipt'
  | 'delegation-update'
  | 'reputation-query'
  | 'reputation-response';

export interface ProposalAnnouncePayload {
  proposalId: string;
  title: string;
  category: string;
  proposer: NodeId;
  votingStartsAt: number;
  votingEndsAt: number;
  contentHash: string;
}

export interface VoteCastPayload {
  proposalId: string;
  choice: 'for' | 'against' | 'abstain';
  weight: number;
  conviction?: number;
  signature: string;
}

export interface VoteReceiptPayload {
  proposalId: string;
  voteId: string;
  recorded: boolean;
  currentTally: {
    for: number;
    against: number;
    abstain: number;
  };
}

// =============================================================================
// Storage Protocol Messages
// =============================================================================

export type StorageMessageType =
  | 'store-request'
  | 'store-response'
  | 'retrieve-request'
  | 'retrieve-response'
  | 'pin-request'
  | 'pin-response'
  | 'provide-announce'
  | 'find-providers';

export interface StoreRequestPayload {
  cid: string;
  size: number;
  encrypted: boolean;
  replicas: number;
  ttl?: number;
}

export interface StoreResponsePayload {
  cid: string;
  stored: boolean;
  providers: NodeId[];
}

export interface RetrieveRequestPayload {
  cid: string;
  chunkIndex?: number;
}

export interface RetrieveResponsePayload {
  cid: string;
  found: boolean;
  data?: Uint8Array;
  chunkIndex?: number;
  totalChunks?: number;
}

export interface ProvideAnnouncePayload {
  cids: string[];
  capacity: number;
  reputation: number;
}

// =============================================================================
// Events Protocol Messages
// =============================================================================

export type EventsMessageType =
  | 'subscribe'
  | 'unsubscribe'
  | 'event'
  | 'heartbeat';

export interface SubscribePayload {
  topics: string[];
  filters?: Record<string, unknown>;
}

export interface EventPayload {
  topic: string;
  eventType: string;
  data: unknown;
  source: NodeId;
}

// =============================================================================
// Protocol Handlers Interface
// =============================================================================

/**
 * Handler function type for protocol messages
 */
export type ProtocolHandler<T = unknown, R = unknown> = (
  message: P2PMessage<T>,
  respond: (response: R) => Promise<void>
) => Promise<void>;

/**
 * Protocol handler registration
 */
export interface ProtocolRegistration {
  protocol: ProtocolId;
  handler: ProtocolHandler;
  version: string;
  description: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create a new P2P message
 */
export function createMessage<T>(
  protocol: ProtocolId,
  type: string,
  sender: NodeId,
  payload: T,
  options: {
    recipient?: NodeId;
    ttl?: number;
  } = {}
): P2PMessage<T> {
  return {
    id: generateMessageId(),
    protocol,
    type,
    sender,
    recipient: options.recipient,
    payload,
    timestamp: Date.now(),
    ttl: options.ttl ?? 64,
  };
}

/**
 * Generate unique message ID
 */
function generateMessageId(): string {
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Validate message structure
 */
export function validateMessage(message: unknown): message is P2PMessage {
  if (!message || typeof message !== 'object') return false;

  const msg = message as Record<string, unknown>;

  return (
    typeof msg.id === 'string' &&
    typeof msg.protocol === 'string' &&
    typeof msg.type === 'string' &&
    typeof msg.sender === 'string' &&
    typeof msg.timestamp === 'number' &&
    typeof msg.ttl === 'number'
  );
}
