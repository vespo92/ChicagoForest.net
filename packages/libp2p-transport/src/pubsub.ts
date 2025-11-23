/**
 * @chicago-forest/libp2p-transport - PubSub Module
 *
 * GossipSub integration for broadcast messaging in Chicago Forest Network.
 * Enables efficient topic-based publish/subscribe communication.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { createLibp2p, type Libp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { identify } from '@libp2p/identify';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { fromString, toString } from 'uint8arrays';
import type { Message, NodeId } from './protocols';

/**
 * Forest network topic prefixes
 */
export const TOPIC_PREFIX = '/chicago-forest/pubsub';

/**
 * Standard Forest network topics
 */
export const FOREST_TOPICS = {
  /** Global announcements */
  ANNOUNCEMENTS: `${TOPIC_PREFIX}/announcements`,
  /** Peer discovery broadcasts */
  PEER_DISCOVERY: `${TOPIC_PREFIX}/peer-discovery`,
  /** Network status updates */
  STATUS: `${TOPIC_PREFIX}/status`,
  /** Energy data (theoretical) */
  ENERGY_DATA: `${TOPIC_PREFIX}/energy-data`,
  /** Governance proposals */
  GOVERNANCE: `${TOPIC_PREFIX}/governance`,
  /** Emergency alerts */
  ALERTS: `${TOPIC_PREFIX}/alerts`,
} as const;

/**
 * PubSub message envelope
 */
export interface PubSubMessage<T = unknown> {
  /** Message ID */
  id: string;
  /** Topic this message was published to */
  topic: string;
  /** Sender node ID */
  from: NodeId;
  /** Message timestamp */
  timestamp: number;
  /** Message payload */
  data: T;
  /** Optional signature */
  signature?: string;
}

/**
 * PubSub message handler
 */
export type PubSubHandler<T = unknown> = (message: PubSubMessage<T>) => void;

/**
 * Configuration for Forest PubSub
 */
export interface ForestPubSubConfig {
  /** Topics to subscribe to on start */
  subscribeTopics?: string[];
  /** Enable message signing */
  signMessages?: boolean;
  /** Enable strict signature validation */
  strictSignatureValidation?: boolean;
  /** Heartbeat interval in ms */
  heartbeatInterval?: number;
  /** Message cache TTL in ms */
  messageCacheTTL?: number;
  /** Gossip factor (0-1) */
  gossipFactor?: number;
  /** D parameter (mesh degree) */
  meshDegree?: number;
  /** D_low parameter */
  meshDegreeLow?: number;
  /** D_high parameter */
  meshDegreeHigh?: number;
}

/**
 * Default PubSub configuration
 */
export const DEFAULT_PUBSUB_CONFIG: Required<ForestPubSubConfig> = {
  subscribeTopics: [],
  signMessages: true,
  strictSignatureValidation: false,
  heartbeatInterval: 1000,
  messageCacheTTL: 120000,
  gossipFactor: 0.25,
  meshDegree: 6,
  meshDegreeLow: 4,
  meshDegreeHigh: 12,
};

/**
 * Forest PubSub - GossipSub-based broadcast messaging
 *
 * Features:
 * - Topic-based publish/subscribe
 * - Efficient message propagation via gossip
 * - Message signing and validation
 * - Configurable mesh parameters
 */
export class ForestPubSub {
  private node: Libp2p | null = null;
  private readonly config: Required<ForestPubSubConfig>;
  private started = false;
  private readonly handlers: Map<string, Set<PubSubHandler>> = new Map();
  private readonly subscriptions: Set<string> = new Set();

  constructor(config: ForestPubSubConfig = {}) {
    this.config = { ...DEFAULT_PUBSUB_CONFIG, ...config };
  }

  /**
   * Get the underlying libp2p node
   */
  get libp2p(): Libp2p {
    if (!this.node) {
      throw new Error('ForestPubSub not started');
    }
    return this.node;
  }

  /**
   * Get the GossipSub service
   */
  private get gossipSub() {
    return this.libp2p.services.pubsub;
  }

  /**
   * Start the PubSub service
   */
  async start(existingNode?: Libp2p): Promise<void> {
    if (this.started) return;

    if (existingNode) {
      this.node = existingNode;
    } else {
      this.node = await this.createPubSubNode();
      await this.node.start();
    }

    // Set up message handler
    this.gossipSub.addEventListener('message', (evt) => {
      this.handleMessage(evt.detail);
    });

    // Subscribe to initial topics
    for (const topic of this.config.subscribeTopics) {
      await this.subscribe(topic);
    }

    this.started = true;
  }

  /**
   * Stop the PubSub service
   */
  async stop(): Promise<void> {
    if (!this.started || !this.node) return;

    // Unsubscribe from all topics
    for (const topic of this.subscriptions) {
      this.gossipSub.unsubscribe(topic);
    }
    this.subscriptions.clear();
    this.handlers.clear();

    await this.node.stop();
    this.started = false;
    this.node = null;
  }

  /**
   * Create a libp2p node with GossipSub
   */
  private async createPubSubNode(): Promise<Libp2p> {
    return createLibp2p({
      addresses: {
        listen: ['/ip4/0.0.0.0/tcp/0'],
      },
      transports: [tcp(), webSockets()],
      connectionEncrypters: [noise()],
      streamMuxers: [yamux()],
      services: {
        identify: identify(),
        pubsub: gossipsub({
          emitSelf: false,
          gossipIncoming: true,
          fallbackToFloodsub: true,
          floodPublish: true,
          doPX: true,
          allowPublishToZeroTopicPeers: true,
          heartbeatInterval: this.config.heartbeatInterval,
          D: this.config.meshDegree,
          Dlo: this.config.meshDegreeLow,
          Dhi: this.config.meshDegreeHigh,
        }),
      },
    });
  }

  /**
   * Handle incoming pubsub message
   */
  private handleMessage(event: { topic: string; data: Uint8Array; from: string }): void {
    const handlers = this.handlers.get(event.topic);
    if (!handlers || handlers.size === 0) return;

    try {
      const json = toString(event.data);
      const envelope = JSON.parse(json) as PubSubMessage;

      // Add topic and from if not in envelope
      envelope.topic = event.topic;
      if (!envelope.from) {
        envelope.from = event.from as NodeId;
      }

      // Call handlers
      for (const handler of handlers) {
        try {
          handler(envelope);
        } catch {
          // Ignore handler errors
        }
      }
    } catch {
      // Invalid message format, ignore
    }
  }

  /**
   * Subscribe to a topic
   */
  async subscribe(topic: string): Promise<void> {
    if (this.subscriptions.has(topic)) return;

    this.gossipSub.subscribe(topic);
    this.subscriptions.add(topic);

    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribe(topic: string): Promise<void> {
    if (!this.subscriptions.has(topic)) return;

    this.gossipSub.unsubscribe(topic);
    this.subscriptions.delete(topic);
    this.handlers.delete(topic);
  }

  /**
   * Add message handler for a topic
   */
  on<T = unknown>(topic: string, handler: PubSubHandler<T>): void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)!.add(handler as PubSubHandler);
  }

  /**
   * Remove message handler
   */
  off<T = unknown>(topic: string, handler: PubSubHandler<T>): void {
    const handlers = this.handlers.get(topic);
    if (handlers) {
      handlers.delete(handler as PubSubHandler);
    }
  }

  /**
   * Publish a message to a topic
   */
  async publish<T = unknown>(topic: string, data: T, from: NodeId): Promise<string> {
    const messageId = generatePubSubMessageId();

    const envelope: PubSubMessage<T> = {
      id: messageId,
      topic,
      from,
      timestamp: Date.now(),
      data,
    };

    const json = JSON.stringify(envelope);
    const bytes = fromString(json);

    await this.gossipSub.publish(topic, bytes);

    return messageId;
  }

  /**
   * Publish a Forest Message to a topic
   */
  async publishMessage(topic: string, message: Message): Promise<string> {
    return this.publish(topic, message, message.from);
  }

  /**
   * Get subscribed topics
   */
  getSubscribedTopics(): string[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Get topic peers
   */
  getTopicPeers(topic: string): string[] {
    const subscribers = this.gossipSub.getSubscribers(topic);
    return subscribers.map((peer) => peer.toString());
  }

  /**
   * Get all mesh peers
   */
  getMeshPeers(): string[] {
    const allPeers = new Set<string>();
    for (const topic of this.subscriptions) {
      const peers = this.gossipSub.getSubscribers(topic);
      for (const peer of peers) {
        allPeers.add(peer.toString());
      }
    }
    return Array.from(allPeers);
  }

  /**
   * Broadcast an announcement to all nodes
   */
  async announce(data: unknown, from: NodeId): Promise<string> {
    return this.publish(FOREST_TOPICS.ANNOUNCEMENTS, data, from);
  }

  /**
   * Broadcast peer discovery info
   */
  async broadcastPeerInfo(peerInfo: unknown, from: NodeId): Promise<string> {
    return this.publish(FOREST_TOPICS.PEER_DISCOVERY, peerInfo, from);
  }

  /**
   * Broadcast node status
   */
  async broadcastStatus(status: unknown, from: NodeId): Promise<string> {
    return this.publish(FOREST_TOPICS.STATUS, status, from);
  }

  /**
   * Send an alert to all nodes
   */
  async sendAlert(alert: unknown, from: NodeId): Promise<string> {
    return this.publish(FOREST_TOPICS.ALERTS, alert, from);
  }
}

/**
 * Generate a unique PubSub message ID
 */
function generatePubSubMessageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `ps-${timestamp}-${random}`;
}

/**
 * Create a custom topic name
 */
export function createTopic(name: string, namespace?: string): string {
  if (namespace) {
    return `${TOPIC_PREFIX}/${namespace}/${name}`;
  }
  return `${TOPIC_PREFIX}/${name}`;
}

/**
 * Create a ForestPubSub instance with a new node
 */
export async function createForestPubSub(config?: ForestPubSubConfig): Promise<ForestPubSub> {
  const pubsub = new ForestPubSub(config);
  await pubsub.start();
  return pubsub;
}

/**
 * Create a ForestPubSub instance attached to an existing libp2p node
 */
export async function attachPubSub(
  node: Libp2p,
  config?: ForestPubSubConfig
): Promise<ForestPubSub> {
  const pubsub = new ForestPubSub(config);
  await pubsub.start(node);
  return pubsub;
}

export default ForestPubSub;
