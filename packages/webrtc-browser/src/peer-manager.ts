/**
 * WebRTC Peer Manager
 *
 * Manages WebRTC peer connections using PeerJS for browser-based
 * P2P networking with zero installation required.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import Peer, { DataConnection } from 'peerjs';
import EventEmitter from 'eventemitter3';
import type { NodeIdentity } from '@chicago-forest/shared-types';
import {
  WebRTCConfig,
  DEFAULT_WEBRTC_CONFIG,
  WebRTCPeerConnection,
  WebRTCConnectionState,
  WebRTCMessage,
  WebRTCMessageType,
  WebRTCEventType,
  WebRTCEventDataMap,
  WebRTCStats,
  BrowserPeerInfo,
  BROWSER_CAPABILITIES,
} from './types';
import { generatePeerId, getOrCreateIdentity } from './identity';

/**
 * Generate a unique message ID
 */
function generateMessageId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * WebRTC Peer Manager
 *
 * Handles browser-to-browser P2P connections via WebRTC/PeerJS.
 */
export class WebRTCPeerManager extends EventEmitter<WebRTCEventDataMap> {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private peerStates: Map<string, WebRTCPeerConnection> = new Map();
  private discoveredPeers: Map<string, BrowserPeerInfo> = new Map();
  private config: Required<WebRTCConfig>;
  private identity: NodeIdentity | null = null;
  private startTime: number = 0;
  private stats = {
    messagesSent: 0,
    messagesReceived: 0,
    totalBytesSent: 0,
    totalBytesReceived: 0,
  };

  constructor(config: WebRTCConfig = {}) {
    super();
    this.config = { ...DEFAULT_WEBRTC_CONFIG, ...config };
  }

  /**
   * Initialize the peer manager and connect to signaling server
   */
  async initialize(identity?: NodeIdentity): Promise<string> {
    if (this.peer) {
      throw new Error('Peer manager already initialized');
    }

    // Get or create identity
    this.identity = identity || await getOrCreateIdentity();

    // Generate peer ID
    const peerId = generatePeerId(this.config.peerIdPrefix);

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.config.connectionTimeout);

      this.peer = new Peer(peerId, {
        host: this.config.peerServer.host,
        port: this.config.peerServer.port,
        path: this.config.peerServer.path,
        secure: this.config.peerServer.secure,
        key: this.config.peerServer.key,
        config: {
          iceServers: this.config.iceServers,
        },
        debug: this.config.debug ? 3 : 0,
      });

      this.peer.on('open', (id) => {
        clearTimeout(timeoutId);
        this.startTime = Date.now();
        this.emit('open', { peerId: id });
        resolve(id);
      });

      this.peer.on('connection', (conn) => {
        this.handleIncomingConnection(conn);
      });

      this.peer.on('close', () => {
        this.emit('close', { reason: 'Peer connection closed' });
      });

      this.peer.on('error', (error) => {
        clearTimeout(timeoutId);
        this.emit('error', { error, type: error.type });
        if (!this.peer?.open) {
          reject(error);
        }
      });

      this.peer.on('disconnected', () => {
        // Try to reconnect
        if (this.peer && !this.peer.destroyed) {
          this.peer.reconnect();
        }
      });
    });
  }

  /**
   * Get the local peer ID
   */
  get peerId(): string | null {
    return this.peer?.id || null;
  }

  /**
   * Get the local node identity
   */
  get nodeIdentity(): NodeIdentity | null {
    return this.identity;
  }

  /**
   * Check if peer manager is connected
   */
  get isConnected(): boolean {
    return this.peer?.open || false;
  }

  /**
   * Connect to a peer by ID
   */
  async connect(remotePeerId: string): Promise<WebRTCPeerConnection> {
    if (!this.peer || !this.peer.open) {
      throw new Error('Peer manager not initialized');
    }

    if (this.connections.has(remotePeerId)) {
      const existing = this.peerStates.get(remotePeerId);
      if (existing) {
        return existing;
      }
    }

    if (this.connections.size >= this.config.maxConnections) {
      throw new Error('Maximum connections reached');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.config.connectionTimeout);

      const conn = this.peer!.connect(remotePeerId, {
        reliable: true,
        serialization: 'json',
      });

      const peerConnection: WebRTCPeerConnection = {
        peerId: remotePeerId,
        state: 'connecting',
        bytesReceived: 0,
        bytesSent: 0,
      };

      this.peerStates.set(remotePeerId, peerConnection);
      this.updateConnectionState(remotePeerId, 'connecting');

      conn.on('open', () => {
        clearTimeout(timeoutId);
        this.connections.set(remotePeerId, conn);
        this.updateConnectionState(remotePeerId, 'connected');
        peerConnection.connectedAt = Date.now();
        peerConnection.state = 'connected';

        // Send handshake
        this.sendHandshake(remotePeerId);

        this.emit('peer:connected', { peer: peerConnection });
        resolve(peerConnection);
      });

      conn.on('data', (data) => {
        this.handleMessage(remotePeerId, data as WebRTCMessage);
      });

      conn.on('close', () => {
        this.handleDisconnection(remotePeerId, 'Connection closed');
      });

      conn.on('error', (error) => {
        clearTimeout(timeoutId);
        this.updateConnectionState(remotePeerId, 'failed');
        reject(error);
      });
    });
  }

  /**
   * Disconnect from a peer
   */
  disconnect(remotePeerId: string): void {
    const conn = this.connections.get(remotePeerId);
    if (conn) {
      conn.close();
      this.connections.delete(remotePeerId);
      this.peerStates.delete(remotePeerId);
      this.emit('peer:disconnected', { peerId: remotePeerId, reason: 'Manual disconnect' });
    }
  }

  /**
   * Send a message to a specific peer
   */
  send(remotePeerId: string, type: WebRTCMessageType, payload: unknown): void {
    const conn = this.connections.get(remotePeerId);
    if (!conn || !conn.open) {
      throw new Error(`No open connection to peer: ${remotePeerId}`);
    }

    const message: WebRTCMessage = {
      type,
      id: generateMessageId(),
      from: this.peerId!,
      to: remotePeerId,
      timestamp: Date.now(),
      payload,
    };

    const serialized = JSON.stringify(message);
    conn.send(message);

    // Update stats
    this.stats.messagesSent++;
    this.stats.totalBytesSent += serialized.length;

    const peerState = this.peerStates.get(remotePeerId);
    if (peerState) {
      peerState.bytesSent += serialized.length;
      peerState.lastActivity = Date.now();
    }

    this.emit('message:sent', { message, to: remotePeerId });
  }

  /**
   * Broadcast a message to all connected peers
   */
  broadcast(type: WebRTCMessageType, payload: unknown): void {
    for (const peerId of this.connections.keys()) {
      try {
        this.send(peerId, type, payload);
      } catch (error) {
        // Continue broadcasting to other peers
        if (this.config.debug) {
          console.warn(`Failed to broadcast to ${peerId}:`, error);
        }
      }
    }
  }

  /**
   * Request peer list from connected peers
   */
  requestPeers(): void {
    this.broadcast('PEER_REQUEST', { timestamp: Date.now() });
  }

  /**
   * Get list of connected peers
   */
  getConnectedPeers(): WebRTCPeerConnection[] {
    return Array.from(this.peerStates.values()).filter(
      (p) => p.state === 'connected'
    );
  }

  /**
   * Get list of discovered peers
   */
  getDiscoveredPeers(): BrowserPeerInfo[] {
    return Array.from(this.discoveredPeers.values());
  }

  /**
   * Get network statistics
   */
  getStats(): WebRTCStats {
    const connectedPeers = this.getConnectedPeers();
    const avgLatency =
      connectedPeers.length > 0
        ? connectedPeers.reduce((sum, p) => sum + (p.latency || 0), 0) /
          connectedPeers.length
        : undefined;

    return {
      peerId: this.peerId || '',
      connectedPeers: connectedPeers.length,
      totalBytesSent: this.stats.totalBytesSent,
      totalBytesReceived: this.stats.totalBytesReceived,
      messagesSent: this.stats.messagesSent,
      messagesReceived: this.stats.messagesReceived,
      uptime: this.startTime > 0 ? Date.now() - this.startTime : 0,
      averageLatency: avgLatency,
    };
  }

  /**
   * Measure latency to a peer
   */
  async measureLatency(remotePeerId: string): Promise<number> {
    const start = Date.now();
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Ping timeout'));
      }, 5000);

      const messageId = generateMessageId();

      const handlePong = (event: WebRTCEventDataMap['message:received']) => {
        if (
          event.message.type === 'PONG' &&
          event.from === remotePeerId &&
          (event.message.payload as { id: string }).id === messageId
        ) {
          clearTimeout(timeoutId);
          this.off('message:received', handlePong);
          const latency = Date.now() - start;

          const peerState = this.peerStates.get(remotePeerId);
          if (peerState) {
            peerState.latency = latency;
          }

          resolve(latency);
        }
      };

      this.on('message:received', handlePong);
      this.send(remotePeerId, 'PING', { id: messageId, timestamp: start });
    });
  }

  /**
   * Destroy the peer manager and clean up all connections
   */
  destroy(): void {
    // Close all connections
    for (const conn of this.connections.values()) {
      conn.close();
    }
    this.connections.clear();
    this.peerStates.clear();

    // Destroy peer
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.removeAllListeners();
  }

  // Private methods

  private handleIncomingConnection(conn: DataConnection): void {
    const remotePeerId = conn.peer;

    if (this.connections.size >= this.config.maxConnections) {
      conn.close();
      return;
    }

    const peerConnection: WebRTCPeerConnection = {
      peerId: remotePeerId,
      state: 'connecting',
      bytesReceived: 0,
      bytesSent: 0,
    };

    this.peerStates.set(remotePeerId, peerConnection);

    conn.on('open', () => {
      this.connections.set(remotePeerId, conn);
      peerConnection.connectedAt = Date.now();
      this.updateConnectionState(remotePeerId, 'connected');
      this.emit('peer:connected', { peer: peerConnection });
    });

    conn.on('data', (data) => {
      this.handleMessage(remotePeerId, data as WebRTCMessage);
    });

    conn.on('close', () => {
      this.handleDisconnection(remotePeerId, 'Connection closed');
    });

    conn.on('error', () => {
      this.updateConnectionState(remotePeerId, 'failed');
    });
  }

  private handleMessage(from: string, message: WebRTCMessage): void {
    const serialized = JSON.stringify(message);
    this.stats.messagesReceived++;
    this.stats.totalBytesReceived += serialized.length;

    const peerState = this.peerStates.get(from);
    if (peerState) {
      peerState.bytesReceived += serialized.length;
      peerState.lastActivity = Date.now();
    }

    // Handle protocol messages
    switch (message.type) {
      case 'PING':
        this.handlePing(from, message);
        break;
      case 'HANDSHAKE':
        this.handleHandshake(from, message);
        break;
      case 'HANDSHAKE_ACK':
        this.handleHandshakeAck(from, message);
        break;
      case 'PEER_REQUEST':
        this.handlePeerRequest(from);
        break;
      case 'PEER_LIST':
        this.handlePeerList(message);
        break;
      default:
        // Emit for application-level handling
        this.emit('message:received', { message, from });
    }
  }

  private handlePing(from: string, message: WebRTCMessage): void {
    this.send(from, 'PONG', message.payload);
  }

  private sendHandshake(remotePeerId: string): void {
    const handshake = {
      nodeId: this.identity?.nodeId,
      publicKey: this.identity?.keyPair.publicKey,
      capabilities: BROWSER_CAPABILITIES,
      browserInfo: this.getBrowserInfo(),
    };
    this.send(remotePeerId, 'HANDSHAKE', handshake);
  }

  private handleHandshake(from: string, message: WebRTCMessage): void {
    const payload = message.payload as {
      nodeId?: string;
      publicKey?: string;
      capabilities?: string[];
      browserInfo?: Record<string, string>;
    };

    // Store peer info
    const peerInfo: BrowserPeerInfo = {
      peerId: from,
      nodeId: payload.nodeId || from,
      publicKey: payload.publicKey || '',
      lastSeen: Date.now(),
      reputation: 50, // Default reputation
      capabilities: (payload.capabilities as any) || [],
      metadata: {},
      browserInfo: payload.browserInfo,
    };

    this.discoveredPeers.set(from, peerInfo);

    const peerState = this.peerStates.get(from);
    if (peerState) {
      peerState.nodeId = payload.nodeId;
    }

    // Send ack
    this.send(from, 'HANDSHAKE_ACK', {
      nodeId: this.identity?.nodeId,
      publicKey: this.identity?.keyPair.publicKey,
      capabilities: BROWSER_CAPABILITIES,
    });

    this.emit('peer:discovered', { peer: peerInfo });
  }

  private handleHandshakeAck(from: string, message: WebRTCMessage): void {
    const payload = message.payload as {
      nodeId?: string;
      publicKey?: string;
      capabilities?: string[];
    };

    const peerInfo: BrowserPeerInfo = {
      peerId: from,
      nodeId: payload.nodeId || from,
      publicKey: payload.publicKey || '',
      lastSeen: Date.now(),
      reputation: 50,
      capabilities: (payload.capabilities as any) || [],
      metadata: {},
    };

    this.discoveredPeers.set(from, peerInfo);

    const peerState = this.peerStates.get(from);
    if (peerState) {
      peerState.nodeId = payload.nodeId;
    }

    this.emit('peer:discovered', { peer: peerInfo });
  }

  private handlePeerRequest(from: string): void {
    const peers = this.getConnectedPeers()
      .filter((p) => p.peerId !== from)
      .map((p) => ({
        peerId: p.peerId,
        nodeId: p.nodeId,
      }));

    this.send(from, 'PEER_LIST', { peers });
  }

  private handlePeerList(message: WebRTCMessage): void {
    const payload = message.payload as {
      peers: Array<{ peerId: string; nodeId?: string }>;
    };

    for (const peer of payload.peers) {
      if (
        !this.connections.has(peer.peerId) &&
        !this.discoveredPeers.has(peer.peerId) &&
        peer.peerId !== this.peerId
      ) {
        const peerInfo: BrowserPeerInfo = {
          peerId: peer.peerId,
          nodeId: peer.nodeId || peer.peerId,
          publicKey: '',
          lastSeen: Date.now(),
          reputation: 50,
          capabilities: [],
          metadata: {},
        };
        this.discoveredPeers.set(peer.peerId, peerInfo);
        this.emit('peer:discovered', { peer: peerInfo });
      }
    }
  }

  private handleDisconnection(remotePeerId: string, reason: string): void {
    this.connections.delete(remotePeerId);
    this.updateConnectionState(remotePeerId, 'disconnected');
    this.emit('peer:disconnected', { peerId: remotePeerId, reason });
  }

  private updateConnectionState(peerId: string, state: WebRTCConnectionState): void {
    const peerState = this.peerStates.get(peerId);
    if (peerState) {
      peerState.state = state;
    }
    this.emit('connection:state-changed', { peerId, state });
  }

  private getBrowserInfo(): Record<string, string> {
    if (typeof navigator === 'undefined') {
      return {};
    }
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    };
  }
}

/**
 * Create a new WebRTC peer manager instance
 */
export function createPeerManager(config?: WebRTCConfig): WebRTCPeerManager {
  return new WebRTCPeerManager(config);
}
