/**
 * @chicago-forest/forest-control-plane - Node Registry Service
 *
 * Manages node registration, status tracking, and heartbeat processing.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import type { ForestStore } from '../store/sqlite';
import type { ForestCPConfig } from '../config';
import type {
  ForestNode,
  ForestNodeStatus,
  RegisterNodeRequest,
  HeartbeatPayload,
} from '../types';

export class NodeRegistry {
  private offlineCheckTimer?: ReturnType<typeof setInterval>;

  constructor(
    private store: ForestStore,
    private config: ForestCPConfig,
  ) {}

  /** Start periodic offline-node detection */
  start(): void {
    this.offlineCheckTimer = setInterval(() => {
      this.store.markOfflineNodes(this.config.heartbeatTimeoutSec);
    }, this.config.heartbeatTimeoutSec * 1000);
  }

  /** Stop periodic checks */
  stop(): void {
    if (this.offlineCheckTimer) {
      clearInterval(this.offlineCheckTimer);
      this.offlineCheckTimer = undefined;
    }
  }

  /** Register a new node */
  register(req: RegisterNodeRequest): ForestNode {
    const existing = this.store.getNode(req.nodeId);
    if (existing && existing.status !== 'deregistered') {
      throw new NodeRegistryError(`Node ${req.nodeId} is already registered`, 'DUPLICATE_NODE');
    }
    return this.store.insertNode(req);
  }

  /** Get a single node by ID */
  getNode(nodeId: string): ForestNode | undefined {
    return this.store.getNode(nodeId);
  }

  /** List all nodes, optionally filtered by status */
  listNodes(status?: ForestNodeStatus): ForestNode[] {
    return this.store.listNodes(status);
  }

  /** Process a heartbeat from a node */
  heartbeat(nodeId: string, payload: HeartbeatPayload): boolean {
    const node = this.store.getNode(nodeId);
    if (!node || node.status === 'deregistered') {
      return false;
    }

    // Update mesh links based on reported neighbors
    const now = new Date().toISOString();
    for (const neighborId of payload.meshNeighbors) {
      const quality = payload.linkQualities?.[neighborId] ?? 1.0;
      this.store.upsertMeshLink({
        sourceNodeId: nodeId,
        targetNodeId: neighborId,
        quality,
        lastSeen: now,
      });
    }

    return this.store.updateHeartbeat(
      nodeId,
      payload.status,
      payload.meshNeighbors,
      payload.metadata,
    );
  }

  /** Deregister a node */
  deregister(nodeId: string): boolean {
    return this.store.deleteNode(nodeId);
  }
}

export class NodeRegistryError extends Error {
  constructor(
    message: string,
    public readonly code: 'DUPLICATE_NODE' | 'NOT_FOUND' | 'INVALID_STATE',
  ) {
    super(message);
    this.name = 'NodeRegistryError';
  }
}
