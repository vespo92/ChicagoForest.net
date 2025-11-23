/**
 * @chicago-forest/libp2p-transport - Transport Adapter Module
 *
 * Bridges libp2p to the existing Transport interface from p2p-core.
 * Enables drop-in replacement of stub transport with production networking.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { multiaddr, type Multiaddr } from '@multiformats/multiaddr';
import type { Stream, Connection } from '@libp2p/interface';
import { ForestNode, type PeerAddress } from './node';
import { fromString, toString } from 'uint8arrays';

/**
 * Transport interface (matches p2p-core)
 */
export interface Transport {
  connect(address: PeerAddress): Promise<TransportConnection>;
  listen(address: PeerAddress): Promise<void>;
  stopListening(): Promise<void>;
  closeAll(): Promise<void>;
}

/**
 * TransportConnection interface (matches p2p-core)
 */
export interface TransportConnection {
  remoteAddress: PeerAddress;
  send(data: Uint8Array): Promise<void>;
  close(): Promise<void>;
  onData(handler: (data: Uint8Array) => void): void;
  onClose(handler: () => void): void;
  onError(handler: (error: Error) => void): void;
}

/**
 * Protocol ID for Chicago Forest messages
 */
export const FOREST_PROTOCOL = '/chicago-forest/1.0.0';

/**
 * Adapter wrapping a libp2p Stream as TransportConnection
 */
export class Libp2pStreamConnection implements TransportConnection {
  private readonly stream: Stream;
  private readonly connection: Connection;
  private dataHandler?: (data: Uint8Array) => void;
  private closeHandler?: () => void;
  private errorHandler?: (error: Error) => void;
  private closed = false;

  constructor(stream: Stream, connection: Connection, public remoteAddress: PeerAddress) {
    this.stream = stream;
    this.connection = connection;
    this.startReading();
  }

  /**
   * Start reading from the stream
   */
  private async startReading(): Promise<void> {
    try {
      for await (const chunk of this.stream.source) {
        if (this.closed) break;
        const data = chunk.subarray();
        if (this.dataHandler) {
          this.dataHandler(data);
        }
      }
    } catch (err) {
      if (!this.closed && this.errorHandler) {
        this.errorHandler(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (!this.closed) {
        this.handleClose();
      }
    }
  }

  /**
   * Handle connection close
   */
  private handleClose(): void {
    this.closed = true;
    if (this.closeHandler) {
      this.closeHandler();
    }
  }

  /**
   * Send data to the remote peer
   */
  async send(data: Uint8Array): Promise<void> {
    if (this.closed) {
      throw new Error('Connection closed');
    }

    // Use push source to write data
    const writer = this.stream.sink;
    await writer([data]);
  }

  /**
   * Close the connection
   */
  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;

    try {
      await this.stream.close();
    } catch {
      // Ignore close errors
    }

    this.handleClose();
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
   * Get the remote peer ID
   */
  get remotePeerId(): string {
    return this.connection.remotePeer.toString();
  }
}

/**
 * Libp2p Transport implementation for Chicago Forest Network
 *
 * Implements the Transport interface using libp2p for actual networking.
 */
export class Libp2pTransport implements Transport {
  private readonly node: ForestNode;
  private readonly protocol: string;
  private incomingHandler?: (conn: TransportConnection) => void;
  private listening = false;

  constructor(node: ForestNode, protocol: string = FOREST_PROTOCOL) {
    this.node = node;
    this.protocol = protocol;
  }

  /**
   * Set handler for incoming connections
   */
  onIncomingConnection(handler: (conn: TransportConnection) => void): void {
    this.incomingHandler = handler;
  }

  /**
   * Connect to a peer address
   */
  async connect(address: PeerAddress): Promise<TransportConnection> {
    const ma = multiaddr(ForestNode.peerAddressToMultiaddr(address));

    // Dial the peer
    const connection = await this.node.libp2p.dial(ma);

    // Open a stream for the forest protocol
    const stream = await connection.newStream(this.protocol);

    // Create peer address from connection
    const remotePeerAddress: PeerAddress = {
      protocol: address.protocol,
      host: address.host,
      port: address.port,
    };

    return new Libp2pStreamConnection(stream, connection, remotePeerAddress);
  }

  /**
   * Connect to a peer by multiaddr string
   */
  async connectMultiaddr(addr: string | Multiaddr): Promise<TransportConnection> {
    const ma = typeof addr === 'string' ? multiaddr(addr) : addr;

    // Dial the peer
    const connection = await this.node.libp2p.dial(ma);

    // Open a stream for the forest protocol
    const stream = await connection.newStream(this.protocol);

    // Convert multiaddr to PeerAddress
    const remotePeerAddress = ForestNode.multiaddrToPeerAddress(ma);

    return new Libp2pStreamConnection(stream, connection, remotePeerAddress);
  }

  /**
   * Start listening for incoming connections
   */
  async listen(_address: PeerAddress): Promise<void> {
    if (this.listening) return;

    // Register protocol handler
    await this.node.libp2p.handle(this.protocol, (data: { stream: Stream; connection: Connection }) => {
      const remotePeerAddress = ForestNode.multiaddrToPeerAddress(
        data.connection.remoteAddr
      );

      const transportConn = new Libp2pStreamConnection(
        data.stream,
        data.connection,
        remotePeerAddress
      );

      if (this.incomingHandler) {
        this.incomingHandler(transportConn);
      }
    });

    this.listening = true;
  }

  /**
   * Stop listening for incoming connections
   */
  async stopListening(): Promise<void> {
    if (!this.listening) return;

    await this.node.libp2p.unhandle(this.protocol);
    this.listening = false;
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    const peers = this.node.getConnectedPeers();
    await Promise.all(
      peers.map((peerId) => this.node.libp2p.hangUp(peerId))
    );
  }

  /**
   * Get the underlying ForestNode
   */
  getNode(): ForestNode {
    return this.node;
  }

  /**
   * Check if listening
   */
  isListening(): boolean {
    return this.listening;
  }
}

/**
 * Create a Libp2pTransport with a new ForestNode
 */
export async function createLibp2pTransport(
  nodeConfig?: ConstructorParameters<typeof ForestNode>[0],
  protocol?: string
): Promise<Libp2pTransport> {
  const node = new ForestNode(nodeConfig);
  await node.start();
  return new Libp2pTransport(node, protocol);
}

/**
 * Message encoder/decoder for transport
 */
export const MessageCodec = {
  /**
   * Encode a message object to bytes
   */
  encode(message: unknown): Uint8Array {
    const json = JSON.stringify(message);
    return fromString(json);
  },

  /**
   * Decode bytes to message object
   */
  decode<T = unknown>(data: Uint8Array): T {
    const json = toString(data);
    return JSON.parse(json) as T;
  },
};

export default Libp2pTransport;
