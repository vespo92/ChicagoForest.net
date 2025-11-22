/**
 * Mock implementations for testing
 *
 * Provides mock classes and factories for Chicago Forest Network components.
 */

import { EventEmitter } from 'eventemitter3';
import type {
  NodeId,
  NodeIdentity,
  PeerInfo,
  PeerConnection,
  PeerAddress,
  Message,
} from '@chicago-forest/shared-types';
import { createTestNodeId, createTestPeerInfo, createTestNodeIdentity } from '../helpers';

// ============================================================================
// Mock Transport
// ============================================================================

export interface MockTransportConnection {
  remoteAddress: PeerAddress;
  send: (data: Uint8Array) => Promise<void>;
  close: () => Promise<void>;
  onData: (handler: (data: Uint8Array) => void) => void;
  onClose: (handler: () => void) => void;
  onError: (handler: (error: Error) => void) => void;
}

export class MockTransport {
  private connections: Map<string, MockTransportConnection> = new Map();
  private listeners: Map<string, (conn: MockTransportConnection) => void> = new Map();
  private isListening = false;

  async connect(address: PeerAddress): Promise<MockTransportConnection> {
    const conn = this.createMockConnection(address);
    const key = `${address.host}:${address.port}`;
    this.connections.set(key, conn);
    return conn;
  }

  async listen(address: PeerAddress): Promise<void> {
    this.isListening = true;
  }

  async stopListening(): Promise<void> {
    this.isListening = false;
  }

  async closeAll(): Promise<void> {
    for (const conn of this.connections.values()) {
      await conn.close();
    }
    this.connections.clear();
  }

  private createMockConnection(address: PeerAddress): MockTransportConnection {
    let dataHandler: ((data: Uint8Array) => void) | null = null;
    let closeHandler: (() => void) | null = null;
    let errorHandler: ((error: Error) => void) | null = null;

    return {
      remoteAddress: address,
      send: async (data: Uint8Array) => {
        // Simulate network send
      },
      close: async () => {
        closeHandler?.();
      },
      onData: (handler) => {
        dataHandler = handler;
      },
      onClose: (handler) => {
        closeHandler = handler;
      },
      onError: (handler) => {
        errorHandler = handler;
      },
    };
  }

  // Test helper: simulate incoming data
  simulateIncomingData(address: PeerAddress, data: Uint8Array): void {
    const key = `${address.host}:${address.port}`;
    const conn = this.connections.get(key);
    // Would trigger data handler
  }

  // Test helper: simulate connection close
  simulateClose(address: PeerAddress): void {
    const key = `${address.host}:${address.port}`;
    const conn = this.connections.get(key);
    // Would trigger close handler
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
}

// ============================================================================
// Mock Event Emitter
// ============================================================================

export class MockEventEmitter<T extends Record<string, (...args: unknown[]) => void>> extends EventEmitter<T> {
  private emittedEvents: Array<{ event: string; args: unknown[] }> = [];

  emit<E extends keyof T>(event: E, ...args: Parameters<T[E]>): boolean {
    this.emittedEvents.push({ event: event as string, args });
    return super.emit(event, ...args);
  }

  getEmittedEvents(): Array<{ event: string; args: unknown[] }> {
    return [...this.emittedEvents];
  }

  getEventsByName(name: string): Array<{ event: string; args: unknown[] }> {
    return this.emittedEvents.filter((e) => e.event === name);
  }

  clearEmittedEvents(): void {
    this.emittedEvents = [];
  }
}

// ============================================================================
// Mock Peer Discovery
// ============================================================================

export class MockPeerDiscovery {
  private peers: Map<NodeId, PeerInfo> = new Map();
  private discoveryCalls = 0;

  addPeer(peer: PeerInfo): void {
    this.peers.set(peer.nodeId, peer);
  }

  removePeer(nodeId: NodeId): void {
    this.peers.delete(nodeId);
  }

  async findPeers(count: number = 10): Promise<PeerInfo[]> {
    this.discoveryCalls++;
    return Array.from(this.peers.values()).slice(0, count);
  }

  async findClosestPeers(targetId: NodeId, count: number = 10): Promise<PeerInfo[]> {
    this.discoveryCalls++;
    return Array.from(this.peers.values()).slice(0, count);
  }

  getDiscoveryCallCount(): number {
    return this.discoveryCalls;
  }

  reset(): void {
    this.peers.clear();
    this.discoveryCalls = 0;
  }

  // Populate with test peers
  populateWithTestPeers(count: number): void {
    for (let i = 0; i < count; i++) {
      this.addPeer(createTestPeerInfo({ nodeId: createTestNodeId(i) }));
    }
  }
}

// ============================================================================
// Mock Connection Manager
// ============================================================================

export class MockConnectionManager {
  private connections: Map<NodeId, PeerConnection> = new Map();
  private sentMessages: Array<{ to: NodeId; message: Message }> = [];
  private identity: NodeIdentity;

  constructor(identity?: NodeIdentity) {
    this.identity = identity ?? createTestNodeIdentity();
  }

  async connect(peer: PeerInfo): Promise<PeerConnection> {
    const conn: PeerConnection = {
      peerId: peer.nodeId,
      state: 'connected',
      address: peer.addresses[0],
      bytesIn: 0,
      bytesOut: 0,
      establishedAt: Date.now(),
      lastActivity: Date.now(),
    };
    this.connections.set(peer.nodeId, conn);
    return conn;
  }

  async disconnect(peerId: NodeId): Promise<void> {
    this.connections.delete(peerId);
  }

  getConnection(peerId: NodeId): PeerConnection | null {
    return this.connections.get(peerId) ?? null;
  }

  getConnections(): PeerConnection[] {
    return Array.from(this.connections.values());
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  async sendMessage(peerId: NodeId, message: Message): Promise<void> {
    this.sentMessages.push({ to: peerId, message });
  }

  async broadcast(message: Omit<Message, 'from' | 'timestamp'>): Promise<void> {
    for (const peerId of this.connections.keys()) {
      this.sentMessages.push({
        to: peerId,
        message: {
          ...message,
          from: this.identity.nodeId,
          timestamp: Date.now(),
        } as Message,
      });
    }
  }

  getSentMessages(): Array<{ to: NodeId; message: Message }> {
    return [...this.sentMessages];
  }

  clearSentMessages(): void {
    this.sentMessages = [];
  }

  reset(): void {
    this.connections.clear();
    this.sentMessages = [];
  }
}

// ============================================================================
// Mock Signal Propagator
// ============================================================================

export interface MockSignal {
  type: string;
  origin: NodeId;
  payload: unknown;
  ttl: number;
  id: string;
  timestamp: number;
}

export class MockSignalPropagator extends MockEventEmitter<{
  'signal:received': (signal: MockSignal) => void;
  'signal:propagated': (signal: MockSignal, hops: number) => void;
}> {
  private signals: MockSignal[] = [];
  private handlers: Map<string, Set<(signal: MockSignal) => void>> = new Map();

  async broadcast(type: string, payload: unknown, ttl: number = 7): Promise<MockSignal> {
    const signal: MockSignal = {
      type,
      origin: 'CFN-mock',
      payload,
      ttl,
      id: `signal-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    this.signals.push(signal);
    this.emit('signal:propagated', signal, 0);
    return signal;
  }

  onSignal(type: string, handler: (signal: MockSignal) => void): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  async handleIncoming(signal: MockSignal): Promise<void> {
    this.signals.push(signal);
    this.emit('signal:received', signal);

    const handlers = this.handlers.get(signal.type);
    if (handlers) {
      for (const handler of handlers) {
        handler(signal);
      }
    }
  }

  getSignals(): MockSignal[] {
    return [...this.signals];
  }

  clearSignals(): void {
    this.signals = [];
  }
}

// ============================================================================
// Mock Hyphal Network
// ============================================================================

export interface MockHyphalPath {
  id: string;
  source: NodeId;
  destination: NodeId;
  hops: NodeId[];
  state: 'growing' | 'active' | 'stressed' | 'dormant' | 'dying' | 'dead';
  metrics: {
    latency: number;
    bandwidth: number;
    packetLoss: number;
    reliability: number;
    hopCount: number;
  };
}

export class MockHyphalNetwork extends MockEventEmitter<{
  'path:established': (path: MockHyphalPath) => void;
  'path:degraded': (path: MockHyphalPath) => void;
  'path:healed': (path: MockHyphalPath) => void;
  'path:died': (pathId: string) => void;
}> {
  private paths: Map<string, MockHyphalPath> = new Map();
  private localNodeId: NodeId;

  constructor(localNodeId: NodeId) {
    super();
    this.localNodeId = localNodeId;
  }

  async establishPath(destination: NodeId, hops: NodeId[] = []): Promise<MockHyphalPath> {
    const pathId = `${this.localNodeId}:${hops.join(':')}:${destination}`;
    const path: MockHyphalPath = {
      id: pathId,
      source: this.localNodeId,
      destination,
      hops,
      state: 'active',
      metrics: {
        latency: 10 + hops.length * 5,
        bandwidth: 100_000_000,
        packetLoss: 0,
        reliability: 0.95,
        hopCount: hops.length + 1,
      },
    };
    this.paths.set(pathId, path);
    this.emit('path:established', path);
    return path;
  }

  getBestPath(destination: NodeId): MockHyphalPath | undefined {
    for (const path of this.paths.values()) {
      if (path.destination === destination && path.state === 'active') {
        return path;
      }
    }
    return undefined;
  }

  getAllPaths(destination: NodeId): MockHyphalPath[] {
    return Array.from(this.paths.values()).filter(
      (p) => p.destination === destination && p.state === 'active'
    );
  }

  degradePath(pathId: string): void {
    const path = this.paths.get(pathId);
    if (path) {
      path.state = 'stressed';
      this.emit('path:degraded', path);
    }
  }

  healPath(pathId: string): boolean {
    const path = this.paths.get(pathId);
    if (path && path.state !== 'dead') {
      path.state = 'active';
      this.emit('path:healed', path);
      return true;
    }
    return false;
  }

  removePath(pathId: string): void {
    this.paths.delete(pathId);
    this.emit('path:died', pathId);
  }

  get pathCount(): number {
    return this.paths.size;
  }

  start(): void {}
  stop(): void {}
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createMockTransport(): MockTransport {
  return new MockTransport();
}

export function createMockPeerDiscovery(peerCount: number = 10): MockPeerDiscovery {
  const discovery = new MockPeerDiscovery();
  discovery.populateWithTestPeers(peerCount);
  return discovery;
}

export function createMockConnectionManager(identity?: NodeIdentity): MockConnectionManager {
  return new MockConnectionManager(identity);
}

export function createMockSignalPropagator(): MockSignalPropagator {
  return new MockSignalPropagator();
}

export function createMockHyphalNetwork(localNodeId?: NodeId): MockHyphalNetwork {
  return new MockHyphalNetwork(localNodeId ?? createTestNodeId(0));
}
