/**
 * Anti-Entropy Protocol
 *
 * Implements gossip-based anti-entropy for eventually consistent
 * data synchronization across distributed nodes.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for the Chicago Plasma Forest Network project.
 */

import { EventEmitter } from 'eventemitter3';
import type { Change, SyncState } from '../index';
import { VectorClock } from '../crdt';

/**
 * Anti-entropy message types
 */
export type AntiEntropyMessageType =
  | 'digest'      // Send digest of local state
  | 'request'     // Request missing entries
  | 'response'    // Send requested entries
  | 'push'        // Push updates without request
  | 'ack';        // Acknowledge receipt

/**
 * Merkle tree node for efficient state comparison
 */
export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  key?: string;
  value?: unknown;
}

/**
 * Anti-entropy message
 */
export interface AntiEntropyMessage {
  type: AntiEntropyMessageType;
  sourceNode: string;
  targetNode: string;
  sessionId: string;
  timestamp: number;
  vectorClock: Record<string, number>;
  payload: {
    digest?: StateDigest;
    entries?: DigestEntry[];
    requestedKeys?: string[];
    merkleRoot?: string;
  };
}

/**
 * State digest for efficient comparison
 */
export interface StateDigest {
  merkleRoot: string;
  entryCount: number;
  vectorClock: Record<string, number>;
  ranges: DigestRange[];
}

export interface DigestRange {
  startKey: string;
  endKey: string;
  hash: string;
  count: number;
}

export interface DigestEntry {
  key: string;
  value: unknown;
  vectorClock: Record<string, number>;
  timestamp: number;
}

/**
 * Anti-entropy session state
 */
export interface AntiEntropySession {
  id: string;
  peerNode: string;
  startedAt: Date;
  lastActivity: Date;
  status: 'active' | 'completed' | 'failed' | 'timeout';
  messagesExchanged: number;
  entriesSynced: number;
  direction: 'push' | 'pull' | 'bidirectional';
}

/**
 * Anti-entropy events
 */
export interface AntiEntropyEvents {
  'session:start': (session: AntiEntropySession) => void;
  'session:complete': (session: AntiEntropySession) => void;
  'session:failed': (session: AntiEntropySession, error: Error) => void;
  'sync:progress': (session: AntiEntropySession, progress: number) => void;
  'conflict:detected': (key: string, local: DigestEntry, remote: DigestEntry) => void;
  'entry:synced': (entry: DigestEntry) => void;
}

/**
 * Configuration for anti-entropy protocol
 */
export interface AntiEntropyConfig {
  nodeId: string;
  gossipIntervalMs: number;      // How often to initiate gossip
  gossipFanout: number;          // Number of peers to gossip with
  sessionTimeoutMs: number;      // Session timeout
  maxConcurrentSessions: number; // Max parallel sync sessions
  digestRangeCount: number;      // Number of ranges in digest
  enableMerkleTree: boolean;     // Use Merkle trees for comparison
}

const DEFAULT_CONFIG: AntiEntropyConfig = {
  nodeId: '',
  gossipIntervalMs: 5000,
  gossipFanout: 3,
  sessionTimeoutMs: 30000,
  maxConcurrentSessions: 5,
  digestRangeCount: 16,
  enableMerkleTree: true,
};

/**
 * Anti-Entropy Protocol implementation
 */
export class AntiEntropyProtocol extends EventEmitter<AntiEntropyEvents> {
  private config: AntiEntropyConfig;
  private data: Map<string, DigestEntry>;
  private vectorClock: VectorClock;
  private sessions: Map<string, AntiEntropySession>;
  private gossipTimer?: ReturnType<typeof setInterval>;
  private peers: string[];

  constructor(config: Partial<AntiEntropyConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.data = new Map();
    this.vectorClock = new VectorClock();
    this.sessions = new Map();
    this.peers = [];
  }

  /**
   * Start the anti-entropy protocol
   */
  start(peers: string[]): void {
    this.peers = peers;
    this.gossipTimer = setInterval(() => {
      this.initiateGossipRound();
    }, this.config.gossipIntervalMs);
  }

  /**
   * Stop the anti-entropy protocol
   */
  stop(): void {
    if (this.gossipTimer) {
      clearInterval(this.gossipTimer);
      this.gossipTimer = undefined;
    }
  }

  /**
   * Set a value in the local store
   */
  set(key: string, value: unknown): void {
    this.vectorClock.increment(this.config.nodeId);
    this.data.set(key, {
      key,
      value,
      vectorClock: this.vectorClock.toJSON(),
      timestamp: Date.now(),
    });
  }

  /**
   * Get a value from the local store
   */
  get(key: string): unknown {
    return this.data.get(key)?.value;
  }

  /**
   * Get all entries
   */
  entries(): DigestEntry[] {
    return Array.from(this.data.values());
  }

  /**
   * Initiate a gossip round with random peers
   */
  private initiateGossipRound(): void {
    // Check if we can start new sessions
    const activeSessions = Array.from(this.sessions.values())
      .filter(s => s.status === 'active').length;

    if (activeSessions >= this.config.maxConcurrentSessions) {
      return;
    }

    // Select random peers for gossip
    const availablePeers = this.peers.filter(
      peer => !this.sessions.has(`${this.config.nodeId}-${peer}`)
    );

    const selectedPeers = this.selectRandomPeers(
      availablePeers,
      Math.min(this.config.gossipFanout, this.config.maxConcurrentSessions - activeSessions)
    );

    for (const peer of selectedPeers) {
      this.startSession(peer);
    }
  }

  /**
   * Select random peers for gossip
   */
  private selectRandomPeers(peers: string[], count: number): string[] {
    const shuffled = [...peers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Start a sync session with a peer
   */
  startSession(peerNode: string): AntiEntropySession {
    const sessionId = `${this.config.nodeId}-${peerNode}-${Date.now()}`;
    const session: AntiEntropySession = {
      id: sessionId,
      peerNode,
      startedAt: new Date(),
      lastActivity: new Date(),
      status: 'active',
      messagesExchanged: 0,
      entriesSynced: 0,
      direction: 'bidirectional',
    };

    this.sessions.set(sessionId, session);
    this.emit('session:start', session);

    // Set session timeout
    setTimeout(() => {
      this.checkSessionTimeout(sessionId);
    }, this.config.sessionTimeoutMs);

    return session;
  }

  /**
   * Check if session has timed out
   */
  private checkSessionTimeout(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'active') {
      const elapsed = Date.now() - session.lastActivity.getTime();
      if (elapsed >= this.config.sessionTimeoutMs) {
        session.status = 'timeout';
        this.emit('session:failed', session, new Error('Session timeout'));
      }
    }
  }

  /**
   * Generate state digest for comparison
   */
  generateDigest(): StateDigest {
    const sortedKeys = Array.from(this.data.keys()).sort();
    const ranges: DigestRange[] = [];

    if (sortedKeys.length === 0) {
      return {
        merkleRoot: this.hashString('empty'),
        entryCount: 0,
        vectorClock: this.vectorClock.toJSON(),
        ranges: [],
      };
    }

    // Split into ranges
    const rangeSize = Math.max(1, Math.ceil(sortedKeys.length / this.config.digestRangeCount));

    for (let i = 0; i < sortedKeys.length; i += rangeSize) {
      const rangeKeys = sortedKeys.slice(i, i + rangeSize);
      const rangeHash = this.hashRange(rangeKeys);

      ranges.push({
        startKey: rangeKeys[0],
        endKey: rangeKeys[rangeKeys.length - 1],
        hash: rangeHash,
        count: rangeKeys.length,
      });
    }

    // Calculate merkle root
    const merkleRoot = this.config.enableMerkleTree
      ? this.buildMerkleRoot(ranges.map(r => r.hash))
      : this.hashString(ranges.map(r => r.hash).join(''));

    return {
      merkleRoot,
      entryCount: this.data.size,
      vectorClock: this.vectorClock.toJSON(),
      ranges,
    };
  }

  /**
   * Compare digests and find differences
   */
  compareDigests(local: StateDigest, remote: StateDigest): {
    needsSync: boolean;
    missingRanges: DigestRange[];
    conflictRanges: DigestRange[];
  } {
    if (local.merkleRoot === remote.merkleRoot) {
      return { needsSync: false, missingRanges: [], conflictRanges: [] };
    }

    const missingRanges: DigestRange[] = [];
    const conflictRanges: DigestRange[] = [];

    // Compare ranges
    const localRangeMap = new Map(local.ranges.map(r => [r.startKey, r]));
    const remoteRangeMap = new Map(remote.ranges.map(r => [r.startKey, r]));

    // Find missing ranges in local
    for (const [key, remoteRange] of remoteRangeMap) {
      const localRange = localRangeMap.get(key);
      if (!localRange) {
        missingRanges.push(remoteRange);
      } else if (localRange.hash !== remoteRange.hash) {
        conflictRanges.push(remoteRange);
      }
    }

    return {
      needsSync: missingRanges.length > 0 || conflictRanges.length > 0,
      missingRanges,
      conflictRanges,
    };
  }

  /**
   * Handle incoming anti-entropy message
   */
  handleMessage(message: AntiEntropyMessage): AntiEntropyMessage | null {
    const session = this.sessions.get(message.sessionId);
    if (session) {
      session.lastActivity = new Date();
      session.messagesExchanged++;
    }

    switch (message.type) {
      case 'digest':
        return this.handleDigest(message);
      case 'request':
        return this.handleRequest(message);
      case 'response':
        return this.handleResponse(message);
      case 'push':
        return this.handlePush(message);
      case 'ack':
        return this.handleAck(message);
      default:
        return null;
    }
  }

  /**
   * Handle digest message
   */
  private handleDigest(message: AntiEntropyMessage): AntiEntropyMessage | null {
    if (!message.payload.digest) return null;

    const localDigest = this.generateDigest();
    const comparison = this.compareDigests(localDigest, message.payload.digest);

    if (!comparison.needsSync) {
      // States are synchronized
      return {
        type: 'ack',
        sourceNode: this.config.nodeId,
        targetNode: message.sourceNode,
        sessionId: message.sessionId,
        timestamp: Date.now(),
        vectorClock: this.vectorClock.toJSON(),
        payload: {},
      };
    }

    // Request missing/conflicting entries
    const requestedKeys: string[] = [];
    for (const range of [...comparison.missingRanges, ...comparison.conflictRanges]) {
      // Request all keys in the range
      requestedKeys.push(range.startKey);
      if (range.startKey !== range.endKey) {
        requestedKeys.push(range.endKey);
      }
    }

    return {
      type: 'request',
      sourceNode: this.config.nodeId,
      targetNode: message.sourceNode,
      sessionId: message.sessionId,
      timestamp: Date.now(),
      vectorClock: this.vectorClock.toJSON(),
      payload: {
        requestedKeys,
        digest: localDigest,
      },
    };
  }

  /**
   * Handle request message
   */
  private handleRequest(message: AntiEntropyMessage): AntiEntropyMessage | null {
    const requestedKeys = message.payload.requestedKeys || [];
    const entries: DigestEntry[] = [];

    for (const key of requestedKeys) {
      const entry = this.data.get(key);
      if (entry) {
        entries.push(entry);
      }
    }

    // Also include all entries if remote needs full sync
    if (message.payload.digest) {
      const comparison = this.compareDigests(
        this.generateDigest(),
        message.payload.digest
      );

      // Include entries from missing ranges in remote
      for (const range of comparison.missingRanges) {
        for (const [key, entry] of this.data) {
          if (key >= range.startKey && key <= range.endKey) {
            if (!entries.find(e => e.key === key)) {
              entries.push(entry);
            }
          }
        }
      }
    }

    return {
      type: 'response',
      sourceNode: this.config.nodeId,
      targetNode: message.sourceNode,
      sessionId: message.sessionId,
      timestamp: Date.now(),
      vectorClock: this.vectorClock.toJSON(),
      payload: { entries },
    };
  }

  /**
   * Handle response message
   */
  private handleResponse(message: AntiEntropyMessage): AntiEntropyMessage | null {
    const entries = message.payload.entries || [];
    let synced = 0;

    for (const entry of entries) {
      const merged = this.mergeEntry(entry);
      if (merged) {
        synced++;
        this.emit('entry:synced', entry);
      }
    }

    const session = this.sessions.get(message.sessionId);
    if (session) {
      session.entriesSynced += synced;
      session.status = 'completed';
      this.emit('session:complete', session);
    }

    return {
      type: 'ack',
      sourceNode: this.config.nodeId,
      targetNode: message.sourceNode,
      sessionId: message.sessionId,
      timestamp: Date.now(),
      vectorClock: this.vectorClock.toJSON(),
      payload: {},
    };
  }

  /**
   * Handle push message
   */
  private handlePush(message: AntiEntropyMessage): AntiEntropyMessage | null {
    const entries = message.payload.entries || [];

    for (const entry of entries) {
      this.mergeEntry(entry);
    }

    return {
      type: 'ack',
      sourceNode: this.config.nodeId,
      targetNode: message.sourceNode,
      sessionId: message.sessionId,
      timestamp: Date.now(),
      vectorClock: this.vectorClock.toJSON(),
      payload: {},
    };
  }

  /**
   * Handle ack message
   */
  private handleAck(message: AntiEntropyMessage): AntiEntropyMessage | null {
    const session = this.sessions.get(message.sessionId);
    if (session && session.status === 'active') {
      session.status = 'completed';
      this.emit('session:complete', session);
    }
    return null;
  }

  /**
   * Merge a remote entry with local state
   */
  private mergeEntry(remote: DigestEntry): boolean {
    const local = this.data.get(remote.key);

    if (!local) {
      // New entry
      this.data.set(remote.key, remote);
      this.vectorClock.merge(VectorClock.fromJSON(remote.vectorClock));
      return true;
    }

    // Compare vector clocks
    const localClock = VectorClock.fromJSON(local.vectorClock);
    const remoteClock = VectorClock.fromJSON(remote.vectorClock);
    const comparison = localClock.compare(remoteClock);

    switch (comparison) {
      case 'before':
        // Remote is newer
        this.data.set(remote.key, remote);
        this.vectorClock.merge(remoteClock);
        return true;

      case 'after':
        // Local is newer, keep local
        return false;

      case 'concurrent':
        // Conflict - emit event and use LWW
        this.emit('conflict:detected', remote.key, local, remote);
        if (remote.timestamp > local.timestamp) {
          this.data.set(remote.key, remote);
          this.vectorClock.merge(remoteClock);
          return true;
        }
        return false;

      case 'equal':
        // Same version
        return false;
    }
  }

  /**
   * Hash a string using simple hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Hash a range of keys
   */
  private hashRange(keys: string[]): string {
    const values = keys.map(k => {
      const entry = this.data.get(k);
      return entry ? JSON.stringify(entry.value) : '';
    });
    return this.hashString(values.join('|'));
  }

  /**
   * Build Merkle tree root from hashes
   */
  private buildMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return this.hashString('empty');
    if (hashes.length === 1) return hashes[0];

    const nextLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left;
      nextLevel.push(this.hashString(left + right));
    }

    return this.buildMerkleRoot(nextLevel);
  }

  /**
   * Create a push message for broadcasting updates
   */
  createPushMessage(targetNode: string, entries: DigestEntry[]): AntiEntropyMessage {
    return {
      type: 'push',
      sourceNode: this.config.nodeId,
      targetNode,
      sessionId: `push-${Date.now()}`,
      timestamp: Date.now(),
      vectorClock: this.vectorClock.toJSON(),
      payload: { entries },
    };
  }

  /**
   * Create a digest message to initiate sync
   */
  createDigestMessage(targetNode: string, sessionId: string): AntiEntropyMessage {
    return {
      type: 'digest',
      sourceNode: this.config.nodeId,
      targetNode,
      sessionId,
      timestamp: Date.now(),
      vectorClock: this.vectorClock.toJSON(),
      payload: { digest: this.generateDigest() },
    };
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): AntiEntropySession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.status === 'active');
  }

  /**
   * Get session statistics
   */
  getStats(): {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    failedSessions: number;
    totalEntriesSynced: number;
    localEntryCount: number;
  } {
    const sessions = Array.from(this.sessions.values());
    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      failedSessions: sessions.filter(s => s.status === 'failed' || s.status === 'timeout').length,
      totalEntriesSynced: sessions.reduce((sum, s) => sum + s.entriesSynced, 0),
      localEntryCount: this.data.size,
    };
  }
}

export default AntiEntropyProtocol;
