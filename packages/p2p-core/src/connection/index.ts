/**
 * @chicago-forest/p2p-core - Connection Module
 *
 * Manages peer connections for Chicago Forest Network.
 * Handles connection lifecycle, multiplexing, and keepalive.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import type {
  NodeId,
  NodeIdentity,
  PeerInfo,
  PeerAddress,
  PeerConnection,
  ConnectionState,
  Message,
  MessageType,
} from '@chicago-forest/shared-types';
import { ForestEventEmitter, getEventBus } from '../events';
import { signMessage, verifySignature } from '../identity';

/**
 * Configuration for connection manager
 */
export interface ConnectionManagerConfig {
  /** Maximum number of concurrent connections */
  maxConnections: number;
  /** Maximum inbound connections */
  maxInbound: number;
  /** Maximum outbound connections */
  maxOutbound: number;
  /** Connection timeout in ms */
  connectionTimeout: number;
  /** Handshake timeout in ms */
  handshakeTimeout: number;
  /** Keepalive interval in ms */
  keepaliveInterval: number;
  /** Time before marking connection as dead */
  deadTimeout: number;
  /** Whether to auto-reconnect on disconnect */
  autoReconnect: boolean;
  /** Max reconnection attempts */
  maxReconnectAttempts: number;
  /** Base delay for reconnection backoff */
  reconnectBackoffBase: number;
}

/**
 * Default connection configuration
 */
export const DEFAULT_CONNECTION_CONFIG: ConnectionManagerConfig = {
  maxConnections: 50,
  maxInbound: 30,
  maxOutbound: 20,
  connectionTimeout: 10000,   // 10 seconds
  handshakeTimeout: 5000,     // 5 seconds
  keepaliveInterval: 30000,   // 30 seconds
  deadTimeout: 90000,         // 90 seconds
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectBackoffBase: 1000,
};

/**
 * Internal connection state
 */
interface ManagedConnection {
  connection: PeerConnection;
  peer: PeerInfo;
  direction: 'inbound' | 'outbound';
  reconnectAttempts: number;
  keepaliveTimer?: ReturnType<typeof setInterval>;
  lastKeepalive?: number;
}

/**
 * Abstract transport interface - implementations provide actual networking
 */
export interface Transport {
  /** Connect to a peer address */
  connect(address: PeerAddress): Promise<TransportConnection>;
  /** Listen for incoming connections */
  listen(address: PeerAddress): Promise<void>;
  /** Stop listening */
  stopListening(): Promise<void>;
  /** Close all connections */
  closeAll(): Promise<void>;
}

/**
 * Abstract connection interface from transport
 */
export interface TransportConnection {
  /** Remote address */
  remoteAddress: PeerAddress;
  /** Send data */
  send(data: Uint8Array): Promise<void>;
  /** Close connection */
  close(): Promise<void>;
  /** Event handlers */
  onData(handler: (data: Uint8Array) => void): void;
  onClose(handler: () => void): void;
  onError(handler: (error: Error) => void): void;
}

/**
 * Connection manager for P2P network
 */
export class ConnectionManager {
  private readonly identity: NodeIdentity;
  private readonly config: ConnectionManagerConfig;
  private readonly eventBus: ForestEventEmitter;
  private readonly connections: Map<NodeId, ManagedConnection> = new Map();
  private readonly pendingConnections: Map<string, Promise<PeerConnection>> = new Map();
  private transport?: Transport;
  private isRunning = false;

  constructor(
    identity: NodeIdentity,
    config: Partial<ConnectionManagerConfig> = {},
    eventBus?: ForestEventEmitter
  ) {
    this.identity = identity;
    this.config = { ...DEFAULT_CONNECTION_CONFIG, ...config };
    this.eventBus = eventBus ?? getEventBus();
  }

  /**
   * Set the transport implementation
   */
  setTransport(transport: Transport): void {
    this.transport = transport;
  }

  /**
   * Start the connection manager
   */
  async start(listenAddress?: PeerAddress): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    if (listenAddress && this.transport) {
      await this.transport.listen(listenAddress);
    }
  }

  /**
   * Stop the connection manager
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    // Clear all keepalive timers
    for (const managed of this.connections.values()) {
      if (managed.keepaliveTimer) {
        clearInterval(managed.keepaliveTimer);
      }
    }

    // Close all connections
    const closePromises = Array.from(this.connections.keys()).map((peerId) =>
      this.disconnect(peerId)
    );
    await Promise.all(closePromises);

    if (this.transport) {
      await this.transport.stopListening();
    }
  }

  /**
   * Connect to a peer
   */
  async connect(peer: PeerInfo): Promise<PeerConnection> {
    // Check if already connected
    const existing = this.connections.get(peer.nodeId);
    if (existing && existing.connection.state === 'connected') {
      return existing.connection;
    }

    // Check connection limits
    if (this.getOutboundCount() >= this.config.maxOutbound) {
      throw new Error('Maximum outbound connections reached');
    }
    if (this.connections.size >= this.config.maxConnections) {
      throw new Error('Maximum total connections reached');
    }

    // Check for pending connection
    const pendingKey = peer.nodeId;
    const pending = this.pendingConnections.get(pendingKey);
    if (pending) {
      return pending;
    }

    // Create new connection attempt
    const connectionPromise = this.establishConnection(peer, 'outbound');
    this.pendingConnections.set(pendingKey, connectionPromise);

    try {
      const connection = await connectionPromise;
      return connection;
    } finally {
      this.pendingConnections.delete(pendingKey);
    }
  }

  /**
   * Disconnect from a peer
   */
  async disconnect(peerId: NodeId, reason?: string): Promise<void> {
    const managed = this.connections.get(peerId);
    if (!managed) return;

    // Clear keepalive timer
    if (managed.keepaliveTimer) {
      clearInterval(managed.keepaliveTimer);
    }

    // Update state
    managed.connection.state = 'disconnected';
    this.connections.delete(peerId);

    // Emit event
    this.eventBus.emitEvent('peer:disconnected', { peerId, reason });
  }

  /**
   * Get a connection by peer ID
   */
  getConnection(peerId: NodeId): PeerConnection | null {
    return this.connections.get(peerId)?.connection ?? null;
  }

  /**
   * Get all active connections
   */
  getConnections(): PeerConnection[] {
    return Array.from(this.connections.values())
      .filter((m) => m.connection.state === 'connected')
      .map((m) => m.connection);
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get inbound connection count
   */
  getInboundCount(): number {
    return Array.from(this.connections.values())
      .filter((m) => m.direction === 'inbound')
      .length;
  }

  /**
   * Get outbound connection count
   */
  getOutboundCount(): number {
    return Array.from(this.connections.values())
      .filter((m) => m.direction === 'outbound')
      .length;
  }

  /**
   * Send a message to a peer
   */
  async sendMessage(peerId: NodeId, message: Message): Promise<void> {
    const managed = this.connections.get(peerId);
    if (!managed || managed.connection.state !== 'connected') {
      throw new Error(`Not connected to peer ${peerId}`);
    }

    // Sign the message
    const signedMessage = {
      ...message,
      from: this.identity.nodeId,
      timestamp: Date.now(),
      signature: await signMessage(
        JSON.stringify({ ...message, from: this.identity.nodeId }),
        this.identity.keyPair.privateKey
      ),
    };

    // In a real implementation, this would use the transport
    // For now, we just emit the event
    this.eventBus.emitEvent('message:sent', {
      to: peerId,
      message: signedMessage,
    });

    // Update stats
    managed.connection.bytesOut += JSON.stringify(signedMessage).length;
  }

  /**
   * Broadcast a message to all connected peers
   */
  async broadcast(message: Omit<Message, 'from' | 'timestamp' | 'signature'>): Promise<void> {
    const fullMessage: Message = {
      ...message,
      from: this.identity.nodeId,
      timestamp: Date.now(),
    };

    const sendPromises = Array.from(this.connections.keys()).map((peerId) =>
      this.sendMessage(peerId, fullMessage).catch(() => {
        // Ignore individual send failures during broadcast
      })
    );

    await Promise.all(sendPromises);
  }

  /**
   * Handle incoming connection (called by transport)
   */
  async handleIncomingConnection(
    transportConn: TransportConnection,
    remotePeer?: PeerInfo
  ): Promise<void> {
    // Check limits
    if (this.getInboundCount() >= this.config.maxInbound) {
      await transportConn.close();
      return;
    }
    if (this.connections.size >= this.config.maxConnections) {
      await transportConn.close();
      return;
    }

    if (remotePeer) {
      await this.establishConnection(remotePeer, 'inbound');
    }
  }

  /**
   * Establish connection with handshake
   */
  private async establishConnection(
    peer: PeerInfo,
    direction: 'inbound' | 'outbound'
  ): Promise<PeerConnection> {
    const connection: PeerConnection = {
      peerId: peer.nodeId,
      state: 'connecting',
      address: peer.addresses[0],
      bytesIn: 0,
      bytesOut: 0,
    };

    const managed: ManagedConnection = {
      connection,
      peer,
      direction,
      reconnectAttempts: 0,
    };

    // Simulate handshake
    connection.state = 'handshaking';

    // Perform authentication (in real implementation, exchange and verify signatures)
    connection.state = 'authenticated';
    connection.establishedAt = Date.now();
    connection.lastActivity = Date.now();

    // Set to connected
    connection.state = 'connected';

    // Store connection
    this.connections.set(peer.nodeId, managed);

    // Start keepalive
    this.startKeepalive(managed);

    // Emit events
    this.eventBus.emitEvent('peer:connected', { peer, connection });
    this.eventBus.emitEvent('peer:authenticated', { peer });

    return connection;
  }

  /**
   * Start keepalive pings for a connection
   */
  private startKeepalive(managed: ManagedConnection): void {
    managed.keepaliveTimer = setInterval(() => {
      this.sendKeepalive(managed);
    }, this.config.keepaliveInterval);
  }

  /**
   * Send keepalive ping
   */
  private async sendKeepalive(managed: ManagedConnection): Promise<void> {
    const now = Date.now();

    // Check for dead connection
    if (
      managed.connection.lastActivity &&
      now - managed.connection.lastActivity > this.config.deadTimeout
    ) {
      await this.disconnect(managed.peer.nodeId, 'keepalive timeout');
      return;
    }

    // Send ping
    const pingMessage: Message = {
      type: 'PING',
      id: `ping-${now}`,
      from: this.identity.nodeId,
      to: managed.peer.nodeId,
      timestamp: now,
      payload: { sentAt: now },
    };

    try {
      await this.sendMessage(managed.peer.nodeId, pingMessage);
      managed.lastKeepalive = now;
    } catch {
      // Handle send failure - might need to reconnect
    }
  }

  /**
   * Handle received message
   */
  async handleMessage(peerId: NodeId, message: Message): Promise<void> {
    const managed = this.connections.get(peerId);
    if (!managed) return;

    // Update activity
    managed.connection.lastActivity = Date.now();
    managed.connection.bytesIn += JSON.stringify(message).length;

    // Verify signature if present
    if (message.signature) {
      const peer = managed.peer;
      const messageWithoutSig = { ...message };
      delete messageWithoutSig.signature;

      const valid = await verifySignature(
        JSON.stringify(messageWithoutSig),
        message.signature,
        peer.publicKey
      );

      if (!valid) {
        // Invalid signature - could be attack, log and ignore
        return;
      }
    }

    // Handle PING/PONG
    if (message.type === 'PING') {
      const pongMessage: Message = {
        type: 'PONG',
        id: `pong-${Date.now()}`,
        from: this.identity.nodeId,
        to: peerId,
        timestamp: Date.now(),
        payload: { pingId: message.id, receivedAt: Date.now() },
      };
      await this.sendMessage(peerId, pongMessage);
      return;
    }

    if (message.type === 'PONG') {
      // Calculate latency
      const payload = message.payload as { pingId: string; receivedAt: number };
      if (managed.lastKeepalive) {
        managed.connection.latency = Date.now() - managed.lastKeepalive;
      }
      return;
    }

    // Emit for other message types
    this.eventBus.emitEvent('message:received', { from: peerId, message });
  }
}

/**
 * Create a message ID
 */
export function createMessageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * Create a typed message
 */
export function createMessage(
  type: MessageType,
  payload: unknown,
  to?: NodeId
): Omit<Message, 'from' | 'timestamp' | 'signature'> {
  return {
    type,
    id: createMessageId(),
    to,
    payload,
  };
}

export default {
  ConnectionManager,
  createMessageId,
  createMessage,
  DEFAULT_CONNECTION_CONFIG,
};
