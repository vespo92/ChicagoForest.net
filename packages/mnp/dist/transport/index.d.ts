/**
 * IPV7 Transport Layer
 *
 * THEORETICAL FRAMEWORK - Abstract transport for P2P connectivity
 * over various physical media (WiFi, Ethernet, WebRTC, etc.)
 */
import { EventEmitter } from 'events';
import { TransportType, TransportEndpoint, Packet } from '../types.js';
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
export declare abstract class Transport extends EventEmitter {
    abstract readonly type: TransportType;
    abstract start(): Promise<void>;
    abstract stop(): Promise<void>;
    abstract send(packet: Packet, endpoint: TransportEndpoint): Promise<void>;
    abstract getLocalEndpoint(): TransportEndpoint;
}
/**
 * TCP Transport for reliable connections
 */
export declare class TCPTransport extends Transport {
    readonly type = TransportType.TCP;
    private server;
    private connections;
    private readonly port;
    private readonly host;
    constructor(port?: number, host?: string);
    start(): Promise<void>;
    stop(): Promise<void>;
    send(packet: Packet, endpoint: TransportEndpoint): Promise<void>;
    private connect;
    private handleConnection;
    private setupSocket;
    getLocalEndpoint(): TransportEndpoint;
}
/**
 * UDP Transport for fast, connectionless messaging
 */
export declare class UDPTransport extends Transport {
    readonly type = TransportType.UDP;
    private socket;
    private readonly port;
    private readonly host;
    constructor(port?: number, host?: string);
    start(): Promise<void>;
    stop(): Promise<void>;
    send(packet: Packet, endpoint: TransportEndpoint): Promise<void>;
    getLocalEndpoint(): TransportEndpoint;
}
/**
 * In-Memory Transport for testing
 */
export declare class MemoryTransport extends Transport {
    readonly type = TransportType.WIFI_DIRECT;
    private static instances;
    private readonly id;
    constructor(id: string);
    start(): Promise<void>;
    stop(): Promise<void>;
    send(packet: Packet, endpoint: TransportEndpoint): Promise<void>;
    getLocalEndpoint(): TransportEndpoint;
    /**
     * Get all in-memory transport instances (for testing)
     */
    static getAllInstances(): Map<string, MemoryTransport>;
    /**
     * Clear all instances (for testing)
     */
    static clearAll(): void;
}
/**
 * Multi-Transport manager
 */
export declare class TransportManager extends EventEmitter {
    private transports;
    /**
     * Add a transport
     */
    addTransport(transport: Transport): void;
    /**
     * Start all transports
     */
    startAll(): Promise<void>;
    /**
     * Stop all transports
     */
    stopAll(): Promise<void>;
    /**
     * Send packet via appropriate transport
     */
    send(packet: Packet, endpoint: TransportEndpoint): Promise<void>;
    /**
     * Get all local endpoints
     */
    getLocalEndpoints(): TransportEndpoint[];
}
//# sourceMappingURL=index.d.ts.map