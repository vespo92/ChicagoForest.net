/**
 * @chicago-forest/libp2p-transport - Protocols Module
 *
 * Protocol handlers for Chicago Forest message types over libp2p.
 * Implements custom protocols for the Forest Network communication.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type { Libp2p, Stream, Connection } from '@libp2p/interface';
import { fromString, toString } from 'uint8arrays';
import type { PeerAddress } from './node';

/**
 * Node ID type
 */
export type NodeId = string;

/**
 * Message types
 */
export type MessageType =
  | 'HELLO'
  | 'HELLO_ACK'
  | 'FIND_NODE'
  | 'FIND_NODE_RESPONSE'
  | 'PING'
  | 'PONG'
  | 'STORE'
  | 'STORE_ACK'
  | 'RETRIEVE'
  | 'RETRIEVE_RESPONSE'
  | 'RELAY'
  | 'RELAY_ACK'
  | 'ANNOUNCE'
  | 'DATA'
  | 'ERROR';

/**
 * Message interface
 */
export interface Message {
  type: MessageType;
  id: string;
  from: NodeId;
  to?: NodeId;
  timestamp: number;
  payload: unknown;
  signature?: string;
}

/**
 * Simplified PeerInfo
 */
export interface PeerInfo {
  nodeId: NodeId;
  addresses: PeerAddress[];
  lastSeen: number;
}

/**
 * Protocol version prefix
 */
export const PROTOCOL_PREFIX = '/chicago-forest';

/**
 * Protocol IDs for different message types
 */
export const FOREST_PROTOCOLS = {
  /** Main message exchange protocol */
  MESSAGE: `${PROTOCOL_PREFIX}/message/1.0.0`,
  /** Peer discovery and exchange */
  PEER_EXCHANGE: `${PROTOCOL_PREFIX}/peer-exchange/1.0.0`,
  /** DHT operations */
  DHT: `${PROTOCOL_PREFIX}/dht/1.0.0`,
  /** Relay requests */
  RELAY: `${PROTOCOL_PREFIX}/relay/1.0.0`,
  /** Anonymous routing */
  ANONYMOUS: `${PROTOCOL_PREFIX}/anonymous/1.0.0`,
  /** File/data transfer */
  DATA_TRANSFER: `${PROTOCOL_PREFIX}/data/1.0.0`,
} as const;

/**
 * Protocol handler function type
 */
export type ProtocolHandler<T = unknown, R = unknown> = (
  data: T,
  stream: Stream,
  connection: Connection
) => Promise<R | void>;

/**
 * Message protocol request/response
 */
export interface MessageRequest {
  message: Message;
}

export interface MessageResponse {
  success: boolean;
  messageId: string;
  error?: string;
}

/**
 * Peer exchange request/response
 */
export interface PeerExchangeRequest {
  requestType: 'get_peers' | 'announce';
  maxPeers?: number;
  peer?: Partial<PeerInfo>;
}

export interface PeerExchangeResponse {
  peers: Partial<PeerInfo>[];
}

/**
 * Forest Protocol Manager
 *
 * Manages custom protocol handlers for the Chicago Forest Network.
 */
export class ForestProtocolManager {
  private readonly node: Libp2p;
  private readonly handlers: Map<string, ProtocolHandler> = new Map();
  private messageHandler?: (message: Message, peerId: string) => Promise<void>;
  private peerExchangeHandler?: (request: PeerExchangeRequest, peerId: string) => Promise<PeerExchangeResponse>;

  constructor(node: Libp2p) {
    this.node = node;
  }

  /**
   * Register all Forest protocols
   */
  async registerProtocols(): Promise<void> {
    // Register message protocol
    await this.node.handle(FOREST_PROTOCOLS.MESSAGE, async ({ stream, connection }) => {
      await this.handleMessageProtocol(stream, connection);
    });

    // Register peer exchange protocol
    await this.node.handle(FOREST_PROTOCOLS.PEER_EXCHANGE, async ({ stream, connection }) => {
      await this.handlePeerExchangeProtocol(stream, connection);
    });

    // Register relay protocol
    await this.node.handle(FOREST_PROTOCOLS.RELAY, async ({ stream, connection }) => {
      await this.handleRelayProtocol(stream, connection);
    });

    // Register data transfer protocol
    await this.node.handle(FOREST_PROTOCOLS.DATA_TRANSFER, async ({ stream, connection }) => {
      await this.handleDataTransferProtocol(stream, connection);
    });
  }

  /**
   * Unregister all Forest protocols
   */
  async unregisterProtocols(): Promise<void> {
    await Promise.all([
      this.node.unhandle(FOREST_PROTOCOLS.MESSAGE),
      this.node.unhandle(FOREST_PROTOCOLS.PEER_EXCHANGE),
      this.node.unhandle(FOREST_PROTOCOLS.RELAY),
      this.node.unhandle(FOREST_PROTOCOLS.DATA_TRANSFER),
    ]);
  }

  /**
   * Set message handler
   */
  onMessage(handler: (message: Message, peerId: string) => Promise<void>): void {
    this.messageHandler = handler;
  }

  /**
   * Set peer exchange handler
   */
  onPeerExchange(handler: (request: PeerExchangeRequest, peerId: string) => Promise<PeerExchangeResponse>): void {
    this.peerExchangeHandler = handler;
  }

  /**
   * Handle incoming message protocol stream
   */
  private async handleMessageProtocol(stream: Stream, connection: Connection): Promise<void> {
    const peerId = connection.remotePeer.toString();

    try {
      // Read the message
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream.source) {
        chunks.push(chunk.subarray());
      }

      const data = concatUint8Arrays(chunks);
      const request = JSON.parse(toString(data)) as MessageRequest;

      // Process message
      if (this.messageHandler) {
        await this.messageHandler(request.message, peerId);
      }

      // Send response
      const response: MessageResponse = {
        success: true,
        messageId: request.message.id,
      };

      await writeToStream(stream, response);
    } catch (err) {
      // Send error response
      const response: MessageResponse = {
        success: false,
        messageId: '',
        error: err instanceof Error ? err.message : 'Unknown error',
      };

      try {
        await writeToStream(stream, response);
      } catch {
        // Ignore write errors on error response
      }
    } finally {
      await stream.close();
    }
  }

  /**
   * Handle peer exchange protocol
   */
  private async handlePeerExchangeProtocol(stream: Stream, connection: Connection): Promise<void> {
    const peerId = connection.remotePeer.toString();

    try {
      // Read request
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream.source) {
        chunks.push(chunk.subarray());
      }

      const data = concatUint8Arrays(chunks);
      const request = JSON.parse(toString(data)) as PeerExchangeRequest;

      // Process request
      let response: PeerExchangeResponse;

      if (this.peerExchangeHandler) {
        response = await this.peerExchangeHandler(request, peerId);
      } else {
        response = { peers: [] };
      }

      // Send response
      await writeToStream(stream, response);
    } catch {
      // Send empty response on error
      await writeToStream(stream, { peers: [] });
    } finally {
      await stream.close();
    }
  }

  /**
   * Handle relay protocol
   */
  private async handleRelayProtocol(stream: Stream, connection: Connection): Promise<void> {
    // Relay protocol implementation - for forwarding messages through this node
    try {
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream.source) {
        chunks.push(chunk.subarray());
      }

      const data = concatUint8Arrays(chunks);
      const relayRequest = JSON.parse(toString(data)) as {
        targetPeerId: string;
        payload: unknown;
      };

      // In a full implementation, this would forward to the target peer
      // For now, acknowledge receipt
      await writeToStream(stream, { relayed: true, targetPeerId: relayRequest.targetPeerId });
    } catch {
      await writeToStream(stream, { relayed: false, error: 'Relay failed' });
    } finally {
      await stream.close();
    }
  }

  /**
   * Handle data transfer protocol
   */
  private async handleDataTransferProtocol(stream: Stream, connection: Connection): Promise<void> {
    // Data transfer for large payloads
    try {
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      for await (const chunk of stream.source) {
        chunks.push(chunk.subarray());
        totalBytes += chunk.length;

        // Limit to 100MB
        if (totalBytes > 100 * 1024 * 1024) {
          throw new Error('Data transfer too large');
        }
      }

      // Acknowledge receipt
      await writeToStream(stream, { received: true, bytes: totalBytes });
    } catch (err) {
      await writeToStream(stream, { received: false, error: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      await stream.close();
    }
  }

  /**
   * Send a message to a peer
   */
  async sendMessage(peerId: string, message: Message): Promise<MessageResponse> {
    const connection = this.node.getConnections().find(
      (c) => c.remotePeer.toString() === peerId
    );

    if (!connection) {
      throw new Error(`Not connected to peer ${peerId}`);
    }

    const stream = await connection.newStream(FOREST_PROTOCOLS.MESSAGE);

    try {
      const request: MessageRequest = { message };
      await writeToStream(stream, request);

      // Read response
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream.source) {
        chunks.push(chunk.subarray());
      }

      const data = concatUint8Arrays(chunks);
      return JSON.parse(toString(data)) as MessageResponse;
    } finally {
      await stream.close();
    }
  }

  /**
   * Request peers from another node
   */
  async requestPeers(peerId: string, maxPeers: number = 20): Promise<Partial<PeerInfo>[]> {
    const connection = this.node.getConnections().find(
      (c) => c.remotePeer.toString() === peerId
    );

    if (!connection) {
      throw new Error(`Not connected to peer ${peerId}`);
    }

    const stream = await connection.newStream(FOREST_PROTOCOLS.PEER_EXCHANGE);

    try {
      const request: PeerExchangeRequest = {
        requestType: 'get_peers',
        maxPeers,
      };
      await writeToStream(stream, request);

      // Read response
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream.source) {
        chunks.push(chunk.subarray());
      }

      const data = concatUint8Arrays(chunks);
      const response = JSON.parse(toString(data)) as PeerExchangeResponse;
      return response.peers;
    } finally {
      await stream.close();
    }
  }

  /**
   * Announce self to a peer
   */
  async announceSelf(peerId: string, selfInfo: Partial<PeerInfo>): Promise<void> {
    const connection = this.node.getConnections().find(
      (c) => c.remotePeer.toString() === peerId
    );

    if (!connection) {
      throw new Error(`Not connected to peer ${peerId}`);
    }

    const stream = await connection.newStream(FOREST_PROTOCOLS.PEER_EXCHANGE);

    try {
      const request: PeerExchangeRequest = {
        requestType: 'announce',
        peer: selfInfo,
      };
      await writeToStream(stream, request);

      // Consume response
      for await (const _ of stream.source) {
        // Discard
      }
    } finally {
      await stream.close();
    }
  }
}

/**
 * Write JSON data to a stream
 */
async function writeToStream(stream: Stream, data: unknown): Promise<void> {
  const json = JSON.stringify(data);
  const bytes = fromString(json);
  await stream.sink([bytes]);
}

/**
 * Concatenate Uint8Arrays
 */
function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/**
 * Create a Forest protocol handler for a libp2p node
 */
export function createProtocolManager(node: Libp2p): ForestProtocolManager {
  return new ForestProtocolManager(node);
}

/**
 * Message factory functions
 */
export const MessageFactory = {
  /**
   * Create a HELLO message
   */
  hello(from: NodeId, capabilities: string[] = []): Message {
    return {
      type: 'HELLO',
      id: generateMessageId(),
      from,
      timestamp: Date.now(),
      payload: { capabilities, version: '1.0.0' },
    };
  },

  /**
   * Create a PING message
   */
  ping(from: NodeId, to?: NodeId): Message {
    return {
      type: 'PING',
      id: generateMessageId(),
      from,
      to,
      timestamp: Date.now(),
      payload: { sentAt: Date.now() },
    };
  },

  /**
   * Create a PONG message
   */
  pong(from: NodeId, to: NodeId, pingId: string): Message {
    return {
      type: 'PONG',
      id: generateMessageId(),
      from,
      to,
      timestamp: Date.now(),
      payload: { pingId, receivedAt: Date.now() },
    };
  },

  /**
   * Create a FIND_NODE message
   */
  findNode(from: NodeId, targetId: NodeId): Message {
    return {
      type: 'FIND_NODE',
      id: generateMessageId(),
      from,
      timestamp: Date.now(),
      payload: { targetId },
    };
  },

  /**
   * Create a STORE message
   */
  store(from: NodeId, key: string, value: unknown): Message {
    return {
      type: 'STORE',
      id: generateMessageId(),
      from,
      timestamp: Date.now(),
      payload: { key, value },
    };
  },

  /**
   * Create a DATA message
   */
  data(from: NodeId, to: NodeId, payload: unknown): Message {
    return {
      type: 'DATA',
      id: generateMessageId(),
      from,
      to,
      timestamp: Date.now(),
      payload,
    };
  },
};

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

export default ForestProtocolManager;
