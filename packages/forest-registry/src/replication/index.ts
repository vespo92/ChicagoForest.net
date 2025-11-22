/**
 * Registry Replication - Distributed record synchronization
 */

import { EventEmitter } from 'eventemitter3';
import type { NodeId } from '@chicago-forest/shared-types';
import type { BaseRecord, RegistryEvents } from '../types';

/**
 * Configuration for replication
 */
export interface ReplicationConfig {
  /** Replication factor (copies per record) */
  replicationFactor: number;

  /** Sync interval (ms) */
  syncInterval: number;

  /** Batch size for sync */
  batchSize: number;

  /** Enable anti-entropy repair */
  antiEntropyEnabled: boolean;

  /** Anti-entropy interval (ms) */
  antiEntropyInterval: number;
}

const DEFAULT_CONFIG: ReplicationConfig = {
  replicationFactor: 3,
  syncInterval: 60000,
  batchSize: 100,
  antiEntropyEnabled: true,
  antiEntropyInterval: 300000, // 5 minutes
};

/**
 * Sync state with a peer
 */
interface PeerSyncState {
  nodeId: NodeId;
  lastSync: number;
  recordCount: number;
  version: number;
}

/**
 * Manages distributed replication of registry records
 */
export class ReplicationManager extends EventEmitter<RegistryEvents> {
  private config: ReplicationConfig;
  private localNodeId: NodeId;
  private peerStates: Map<NodeId, PeerSyncState> = new Map();
  private syncTimer?: ReturnType<typeof setInterval>;
  private antiEntropyTimer?: ReturnType<typeof setInterval>;

  // Callbacks
  private getLocalRecords: () => BaseRecord[] = () => [];
  private getPeers: () => NodeId[] = () => [];
  private sendRecords: (peer: NodeId, records: BaseRecord[]) => Promise<void> =
    async () => {};
  private requestRecords: (peer: NodeId, since: number) => Promise<BaseRecord[]> =
    async () => [];
  private importRecord: (record: BaseRecord) => boolean = () => false;

  constructor(localNodeId: NodeId, config: Partial<ReplicationConfig> = {}) {
    super();
    this.localNodeId = localNodeId;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set record provider
   */
  setRecordProvider(provider: () => BaseRecord[]): void {
    this.getLocalRecords = provider;
  }

  /**
   * Set peer provider
   */
  setPeerProvider(provider: () => NodeId[]): void {
    this.getPeers = provider;
  }

  /**
   * Set record sender
   */
  setRecordSender(sender: (peer: NodeId, records: BaseRecord[]) => Promise<void>): void {
    this.sendRecords = sender;
  }

  /**
   * Set record requester
   */
  setRecordRequester(requester: (peer: NodeId, since: number) => Promise<BaseRecord[]>): void {
    this.requestRecords = requester;
  }

  /**
   * Set record importer
   */
  setRecordImporter(importer: (record: BaseRecord) => boolean): void {
    this.importRecord = importer;
  }

  /**
   * Start replication
   */
  start(): void {
    this.syncTimer = setInterval(
      () => this.syncWithPeers(),
      this.config.syncInterval
    );

    if (this.config.antiEntropyEnabled) {
      this.antiEntropyTimer = setInterval(
        () => this.runAntiEntropy(),
        this.config.antiEntropyInterval
      );
    }

    // Initial sync
    this.syncWithPeers();
  }

  /**
   * Stop replication
   */
  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
    if (this.antiEntropyTimer) {
      clearInterval(this.antiEntropyTimer);
      this.antiEntropyTimer = undefined;
    }
  }

  /**
   * Manually trigger sync
   */
  async sync(): Promise<number> {
    return this.syncWithPeers();
  }

  /**
   * Handle incoming records from peer
   */
  handleIncomingRecords(peer: NodeId, records: BaseRecord[]): number {
    let imported = 0;
    for (const record of records) {
      if (this.importRecord(record)) {
        imported++;
      }
    }

    // Update peer state
    const state = this.peerStates.get(peer) ?? {
      nodeId: peer,
      lastSync: 0,
      recordCount: 0,
      version: 0,
    };
    state.lastSync = Date.now();
    state.recordCount = records.length;
    state.version++;
    this.peerStates.set(peer, state);

    return imported;
  }

  /**
   * Get replication status
   */
  getStatus(): ReplicationStatus {
    const peers = this.getPeers();
    const records = this.getLocalRecords();

    return {
      localRecords: records.length,
      peerCount: peers.length,
      replicationFactor: this.config.replicationFactor,
      lastSync: Math.max(
        ...Array.from(this.peerStates.values()).map(s => s.lastSync),
        0
      ),
      syncedPeers: this.peerStates.size,
    };
  }

  // Private methods

  private async syncWithPeers(): Promise<number> {
    this.emit('sync:started');

    const peers = this.getPeers();
    const localRecords = this.getLocalRecords();
    let totalImported = 0;

    // Select peers for sync
    const syncPeers = this.selectSyncPeers(peers);

    for (const peer of syncPeers) {
      try {
        // Push local records
        const recordsToSend = this.selectRecordsForPeer(peer, localRecords);
        if (recordsToSend.length > 0) {
          await this.sendRecords(peer, recordsToSend);
        }

        // Pull remote records
        const peerState = this.peerStates.get(peer);
        const since = peerState?.lastSync ?? 0;
        const remoteRecords = await this.requestRecords(peer, since);

        totalImported += this.handleIncomingRecords(peer, remoteRecords);
      } catch (error) {
        console.error(`Sync with ${peer} failed:`, error);
      }
    }

    this.emit('sync:completed', totalImported);
    return totalImported;
  }

  private async runAntiEntropy(): Promise<void> {
    // Anti-entropy compares merkle trees of records
    // to find and repair inconsistencies
    const peers = this.getPeers();
    const localHash = this.computeRecordHash();

    for (const peer of peers.slice(0, this.config.replicationFactor)) {
      try {
        // Would exchange merkle tree roots and sync differences
        const remoteRecords = await this.requestRecords(peer, 0);
        for (const record of remoteRecords) {
          this.importRecord(record);
        }
      } catch {
        // Ignore anti-entropy failures
      }
    }
  }

  private selectSyncPeers(peers: NodeId[]): NodeId[] {
    // Select random subset of peers
    const shuffled = [...peers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, this.config.replicationFactor);
  }

  private selectRecordsForPeer(peer: NodeId, records: BaseRecord[]): BaseRecord[] {
    const peerState = this.peerStates.get(peer);
    const since = peerState?.lastSync ?? 0;

    // Select records updated since last sync
    const updated = records.filter(r => r.updatedAt > since);

    // Batch
    return updated.slice(0, this.config.batchSize);
  }

  private computeRecordHash(): string {
    // Would compute merkle root of all records
    const records = this.getLocalRecords();
    return `hash_${records.length}_${Date.now()}`;
  }
}

export interface ReplicationStatus {
  localRecords: number;
  peerCount: number;
  replicationFactor: number;
  lastSync: number;
  syncedPeers: number;
}
