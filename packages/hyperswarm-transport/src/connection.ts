/**
 * @chicago-forest/hyperswarm-transport - Connection Wrapper
 *
 * Wraps Hyperswarm socket connections to implement the p2p-core
 * TransportConnection interface.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. Part of Chicago Forest Network's P2P infrastructure.
 */

import type { TransportConnection } from '@chicago-forest/p2p-core';
import type { PeerAddress } from '@chicago-forest/shared-types';
import { EventEmitter } from 'eventemitter3';
import {
  type HyperswarmPeerInfo,
  createPeerAddress,
  publicKeyToNodeId,
} from './types';

/**
 * Events emitted by HyperswarmConnection
 */
interface ConnectionEvents {
  'data': (data: Uint8Array) => void;
  'close': () => void;
  'error': (error: Error) => void;
}

/**
 * Wraps a Hyperswarm socket to provide the TransportConnection interface.
 *
 * Hyperswarm provides:
 * - Automatic NAT hole punching (UDP + TCP)
 * - End-to-end encryption via Noise protocol
 * - Multiplexed streams over single connection
 *
 * This wrapper adapts the Hyperswarm socket API to our generic transport interface.
 */
export class HyperswarmConnection
  extends EventEmitter<ConnectionEvents>
  implements TransportConnection
{
  /** Underlying Hyperswarm socket */
  private readonly socket: NodeJS.ReadWriteStream & {
    remotePublicKey: Buffer;
    publicKey: Buffer;
    handshakeHash?: Buffer;
    destroy: (err?: Error) => void;
    end: () => void;
  };

  /** Connection info from Hyperswarm */
  private readonly peerInfo: HyperswarmPeerInfo;

  /** Remote peer address */
  public readonly remoteAddress: PeerAddress;

  /** Whether connection is open */
  private _isOpen: boolean = true;

  /** Data handler callback */
  private dataHandler?: (data: Uint8Array) => void;

  /** Close handler callback */
  private closeHandler?: () => void;

  /** Error handler callback */
  private errorHandler?: (error: Error) => void;

  /** Buffer for incomplete messages */
  private receiveBuffer: Buffer = Buffer.alloc(0);

  /** Message length prefix size (4 bytes for uint32) */
  private static readonly LENGTH_PREFIX_SIZE = 4;

  constructor(socket: unknown, peerInfo: HyperswarmPeerInfo) {
    super();
    this.socket = socket as HyperswarmConnection['socket'];
    this.peerInfo = peerInfo;
    this.remoteAddress = createPeerAddress(peerInfo);

    this.setupSocketHandlers();
  }

  /**
   * Set up event handlers on the underlying socket
   */
  private setupSocketHandlers(): void {
    // Handle incoming data with length-prefix framing
    this.socket.on('data', (chunk: Buffer) => {
      this.handleIncomingData(chunk);
    });

    // Handle socket close
    this.socket.on('close', () => {
      this._isOpen = false;
      this.emit('close');
      if (this.closeHandler) {
        this.closeHandler();
      }
    });

    this.socket.on('end', () => {
      this._isOpen = false;
      this.emit('close');
      if (this.closeHandler) {
        this.closeHandler();
      }
    });

    // Handle errors
    this.socket.on('error', (err: Error) => {
      this.emit('error', err);
      if (this.errorHandler) {
        this.errorHandler(err);
      }
    });
  }

  /**
   * Handle incoming data with message framing
   *
   * Uses length-prefix framing: [4-byte length][message bytes]
   * This allows us to handle message boundaries correctly over streams.
   */
  private handleIncomingData(chunk: Buffer): void {
    // Append to buffer
    this.receiveBuffer = Buffer.concat([this.receiveBuffer, chunk]);

    // Process complete messages
    while (this.receiveBuffer.length >= HyperswarmConnection.LENGTH_PREFIX_SIZE) {
      const messageLength = this.receiveBuffer.readUInt32BE(0);

      // Check if we have the complete message
      const totalLength = HyperswarmConnection.LENGTH_PREFIX_SIZE + messageLength;
      if (this.receiveBuffer.length < totalLength) {
        // Wait for more data
        break;
      }

      // Extract message
      const message = this.receiveBuffer.subarray(
        HyperswarmConnection.LENGTH_PREFIX_SIZE,
        totalLength
      );

      // Update buffer
      this.receiveBuffer = this.receiveBuffer.subarray(totalLength);

      // Emit data
      const data = new Uint8Array(message);
      this.emit('data', data);
      if (this.dataHandler) {
        this.dataHandler(data);
      }
    }
  }

  /**
   * Send data to the remote peer
   *
   * Frames the message with a 4-byte length prefix.
   */
  async send(data: Uint8Array): Promise<void> {
    if (!this._isOpen) {
      throw new Error('Connection is closed');
    }

    return new Promise((resolve, reject) => {
      // Create length-prefixed message
      const buffer = Buffer.from(data);
      const lengthPrefix = Buffer.alloc(HyperswarmConnection.LENGTH_PREFIX_SIZE);
      lengthPrefix.writeUInt32BE(buffer.length, 0);
      const frame = Buffer.concat([lengthPrefix, buffer]);

      // Write to socket
      const canContinue = this.socket.write(frame as unknown as string);

      if (canContinue) {
        resolve();
      } else {
        // Wait for drain event
        this.socket.once('drain', () => resolve());
        this.socket.once('error', reject);
      }
    });
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (!this._isOpen) {
      return;
    }

    this._isOpen = false;

    return new Promise((resolve) => {
      // Gracefully end the socket
      this.socket.end();

      // Set timeout for force close
      const timeout = setTimeout(() => {
        this.socket.destroy();
        resolve();
      }, 5000);

      this.socket.once('close', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  /**
   * Register data handler
   */
  onData(handler: (data: Uint8Array) => void): void {
    this.dataHandler = handler;
  }

  /**
   * Register close handler
   */
  onClose(handler: () => void): void {
    this.closeHandler = handler;
  }

  /**
   * Register error handler
   */
  onError(handler: (error: Error) => void): void {
    this.errorHandler = handler;
  }

  /**
   * Check if connection is open
   */
  get isOpen(): boolean {
    return this._isOpen;
  }

  /**
   * Get remote peer's public key
   */
  get remotePublicKey(): Buffer {
    return this.peerInfo.publicKey;
  }

  /**
   * Get remote peer's node ID
   */
  get remoteNodeId(): string {
    return publicKeyToNodeId(this.peerInfo.publicKey);
  }

  /**
   * Get connection info
   */
  get info(): HyperswarmPeerInfo {
    return this.peerInfo;
  }

  /**
   * Whether this connection was hole-punched
   */
  get wasHolepunched(): boolean {
    return this.peerInfo.holepunched;
  }

  /**
   * Connection type (tcp, utp, or relay)
   */
  get connectionType(): 'tcp' | 'utp' | 'relay' {
    return this.peerInfo.type;
  }

  /**
   * Get handshake hash (can be used for session verification)
   */
  get handshakeHash(): Buffer | undefined {
    return this.socket.handshakeHash;
  }
}

/**
 * Connection pool for managing multiple Hyperswarm connections
 */
export class ConnectionPool extends EventEmitter<{
  'connection:added': (conn: HyperswarmConnection) => void;
  'connection:removed': (publicKey: Buffer) => void;
}> {
  private connections: Map<string, HyperswarmConnection> = new Map();
  private readonly maxConnections: number;

  constructor(maxConnections: number = 64) {
    super();
    this.maxConnections = maxConnections;
  }

  /**
   * Add a connection to the pool
   */
  add(connection: HyperswarmConnection): boolean {
    if (this.connections.size >= this.maxConnections) {
      return false;
    }

    const key = connection.remotePublicKey.toString('hex');

    if (this.connections.has(key)) {
      // Already connected to this peer
      return false;
    }

    this.connections.set(key, connection);

    // Handle connection close
    connection.onClose(() => {
      this.remove(connection.remotePublicKey);
    });

    this.emit('connection:added', connection);
    return true;
  }

  /**
   * Remove a connection from the pool
   */
  remove(publicKey: Buffer): boolean {
    const key = publicKey.toString('hex');
    const existed = this.connections.delete(key);

    if (existed) {
      this.emit('connection:removed', publicKey);
    }

    return existed;
  }

  /**
   * Get a connection by public key
   */
  get(publicKey: Buffer): HyperswarmConnection | undefined {
    return this.connections.get(publicKey.toString('hex'));
  }

  /**
   * Get all connections
   */
  getAll(): HyperswarmConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection count
   */
  get size(): number {
    return this.connections.size;
  }

  /**
   * Check if connected to a peer
   */
  has(publicKey: Buffer): boolean {
    return this.connections.has(publicKey.toString('hex'));
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    const closePromises = this.getAll().map((conn) => conn.close());
    await Promise.all(closePromises);
    this.connections.clear();
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    holepunched: number;
    relay: number;
    tcp: number;
    utp: number;
  } {
    const connections = this.getAll();
    return {
      total: connections.length,
      holepunched: connections.filter((c) => c.wasHolepunched).length,
      relay: connections.filter((c) => c.connectionType === 'relay').length,
      tcp: connections.filter((c) => c.connectionType === 'tcp').length,
      utp: connections.filter((c) => c.connectionType === 'utp').length,
    };
  }
}
