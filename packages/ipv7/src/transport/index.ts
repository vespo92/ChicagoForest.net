/**
 * IPV7 Transport Layer
 *
 * THEORETICAL FRAMEWORK - Abstract transport for P2P connectivity
 * over various physical media (WiFi, Ethernet, WebRTC, etc.)
 */

import { EventEmitter } from 'events';
import { createServer, Socket, Server } from 'net';
import { createSocket, Socket as UDPSocket } from 'dgram';
import {
  TransportType,
  TransportEndpoint,
  Packet,
} from '../types.js';
import { serializePacket, deserializePacket } from '../packet/index.js';

/**
 * Transport events
 */
export interface TransportEvents {
  'packet:received': (packet: Packet, from: TransportEndpoint) => void;
  'peer:connected': (endpoint: TransportEndpoint) => void;
  'peer:disconnected': (endpoint: TransportEndpoint) => void;
  'error': (error: Error) => void;
}

/**
 * Abstract base transport
 */
export abstract class Transport extends EventEmitter {
  abstract readonly type: TransportType;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract send(packet: Packet, endpoint: TransportEndpoint): Promise<void>;
  abstract getLocalEndpoint(): TransportEndpoint;
}

/**
 * TCP Transport for reliable connections
 */
export class TCPTransport extends Transport {
  readonly type = TransportType.TCP;
  private server: Server | null = null;
  private connections: Map<string, Socket> = new Map();
  private readonly port: number;
  private readonly host: string;

  constructor(port: number = 7777, host: string = '0.0.0.0') {
    super();
    this.port = port;
    this.host = host;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((socket) => this.handleConnection(socket));

      this.server.on('error', (err) => {
        this.emit('error', err);
        reject(err);
      });

      this.server.listen(this.port, this.host, () => {
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    // Close all connections
    for (const socket of this.connections.values()) {
      socket.destroy();
    }
    this.connections.clear();

    // Close server
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  async send(packet: Packet, endpoint: TransportEndpoint): Promise<void> {
    const key = `${endpoint.address}:${endpoint.port}`;
    let socket = this.connections.get(key);

    if (!socket) {
      // Create new connection
      socket = await this.connect(endpoint);
    }

    const data = serializePacket(packet);
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32BE(data.length, 0);

    return new Promise((resolve, reject) => {
      socket!.write(lengthBuffer, (err) => {
        if (err) {
          reject(err);
          return;
        }
        socket!.write(data, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  private async connect(endpoint: TransportEndpoint): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const socket = new Socket();
      const key = `${endpoint.address}:${endpoint.port}`;

      socket.connect(endpoint.port, endpoint.address, () => {
        this.connections.set(key, socket);
        this.setupSocket(socket, endpoint);
        this.emit('peer:connected', endpoint);
        resolve(socket);
      });

      socket.on('error', reject);
    });
  }

  private handleConnection(socket: Socket): void {
    const remoteAddress = socket.remoteAddress || 'unknown';
    const remotePort = socket.remotePort || 0;
    const endpoint: TransportEndpoint = {
      type: TransportType.TCP,
      address: remoteAddress,
      port: remotePort,
      priority: 1,
    };

    const key = `${remoteAddress}:${remotePort}`;
    this.connections.set(key, socket);
    this.setupSocket(socket, endpoint);
    this.emit('peer:connected', endpoint);
  }

  private setupSocket(socket: Socket, endpoint: TransportEndpoint): void {
    const key = `${endpoint.address}:${endpoint.port}`;
    let buffer = Buffer.alloc(0);
    let expectedLength = 0;

    socket.on('data', (data) => {
      buffer = Buffer.concat([buffer, data]);

      while (buffer.length >= 4) {
        if (expectedLength === 0) {
          expectedLength = buffer.readUInt32BE(0);
          buffer = buffer.subarray(4);
        }

        if (buffer.length >= expectedLength) {
          const packetData = buffer.subarray(0, expectedLength);
          buffer = buffer.subarray(expectedLength);
          expectedLength = 0;

          try {
            const packet = deserializePacket(new Uint8Array(packetData));
            this.emit('packet:received', packet, endpoint);
          } catch (err) {
            this.emit('error', err as Error);
          }
        } else {
          break;
        }
      }
    });

    socket.on('close', () => {
      this.connections.delete(key);
      this.emit('peer:disconnected', endpoint);
    });

    socket.on('error', (err) => {
      this.emit('error', err);
    });
  }

  getLocalEndpoint(): TransportEndpoint {
    return {
      type: TransportType.TCP,
      address: this.host === '0.0.0.0' ? '127.0.0.1' : this.host,
      port: this.port,
      priority: 1,
    };
  }
}

/**
 * UDP Transport for fast, connectionless messaging
 */
export class UDPTransport extends Transport {
  readonly type = TransportType.UDP;
  private socket: UDPSocket | null = null;
  private readonly port: number;
  private readonly host: string;

  constructor(port: number = 7778, host: string = '0.0.0.0') {
    super();
    this.port = port;
    this.host = host;
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = createSocket('udp4');

      this.socket.on('error', (err) => {
        this.emit('error', err);
        reject(err);
      });

      this.socket.on('message', (msg, rinfo) => {
        const endpoint: TransportEndpoint = {
          type: TransportType.UDP,
          address: rinfo.address,
          port: rinfo.port,
          priority: 2,
        };

        try {
          const packet = deserializePacket(new Uint8Array(msg));
          this.emit('packet:received', packet, endpoint);
        } catch (err) {
          this.emit('error', err as Error);
        }
      });

      this.socket.bind(this.port, this.host, () => {
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  async send(packet: Packet, endpoint: TransportEndpoint): Promise<void> {
    if (!this.socket) {
      throw new Error('UDP transport not started');
    }

    const data = serializePacket(packet);

    return new Promise((resolve, reject) => {
      this.socket!.send(data, endpoint.port, endpoint.address, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getLocalEndpoint(): TransportEndpoint {
    return {
      type: TransportType.UDP,
      address: this.host === '0.0.0.0' ? '127.0.0.1' : this.host,
      port: this.port,
      priority: 2,
    };
  }
}

/**
 * In-Memory Transport for testing
 */
export class MemoryTransport extends Transport {
  readonly type = TransportType.WIFI_DIRECT;
  private static instances: Map<string, MemoryTransport> = new Map();
  private readonly id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  async start(): Promise<void> {
    MemoryTransport.instances.set(this.id, this);
  }

  async stop(): Promise<void> {
    MemoryTransport.instances.delete(this.id);
  }

  async send(packet: Packet, endpoint: TransportEndpoint): Promise<void> {
    const target = MemoryTransport.instances.get(endpoint.address);
    if (!target) {
      throw new Error(`No transport found for ${endpoint.address}`);
    }

    // Simulate async delivery
    setImmediate(() => {
      target.emit('packet:received', packet, this.getLocalEndpoint());
    });
  }

  getLocalEndpoint(): TransportEndpoint {
    return {
      type: TransportType.WIFI_DIRECT,
      address: this.id,
      port: 0,
      priority: 0,
    };
  }

  /**
   * Get all in-memory transport instances (for testing)
   */
  static getAllInstances(): Map<string, MemoryTransport> {
    return MemoryTransport.instances;
  }

  /**
   * Clear all instances (for testing)
   */
  static clearAll(): void {
    MemoryTransport.instances.clear();
  }
}

/**
 * Multi-Transport manager
 */
export class TransportManager extends EventEmitter {
  private transports: Map<TransportType, Transport> = new Map();

  /**
   * Add a transport
   */
  addTransport(transport: Transport): void {
    this.transports.set(transport.type, transport);

    transport.on('packet:received', (packet, from) => {
      this.emit('packet:received', packet, from);
    });

    transport.on('peer:connected', (endpoint) => {
      this.emit('peer:connected', endpoint);
    });

    transport.on('peer:disconnected', (endpoint) => {
      this.emit('peer:disconnected', endpoint);
    });

    transport.on('error', (err) => {
      this.emit('error', err);
    });
  }

  /**
   * Start all transports
   */
  async startAll(): Promise<void> {
    await Promise.all(
      Array.from(this.transports.values()).map((t) => t.start())
    );
  }

  /**
   * Stop all transports
   */
  async stopAll(): Promise<void> {
    await Promise.all(
      Array.from(this.transports.values()).map((t) => t.stop())
    );
  }

  /**
   * Send packet via appropriate transport
   */
  async send(packet: Packet, endpoint: TransportEndpoint): Promise<void> {
    const transport = this.transports.get(endpoint.type);
    if (!transport) {
      throw new Error(`No transport available for ${endpoint.type}`);
    }
    await transport.send(packet, endpoint);
  }

  /**
   * Get all local endpoints
   */
  getLocalEndpoints(): TransportEndpoint[] {
    return Array.from(this.transports.values()).map((t) => t.getLocalEndpoint());
  }
}
