/**
 * Synchronization Engine
 *
 * Core sync logic for distributed data coordination.
 */

import type { Change, SyncState } from '../index';

export interface SyncMessage {
  type: 'request' | 'response' | 'push' | 'ack';
  sourceNode: string;
  targetNode: string;
  vectorClock: Map<string, number>;
  changes?: Change[];
  timestamp: number;
}

export interface SyncSession {
  id: string;
  peerNode: string;
  startedAt: Date;
  status: 'connecting' | 'syncing' | 'completed' | 'failed';
  changesSent: number;
  changesReceived: number;
}

export function createSyncRequest(state: SyncState, targetNode: string): SyncMessage {
  return {
    type: 'request',
    sourceNode: state.nodeId,
    targetNode,
    vectorClock: new Map(state.vectorClock),
    timestamp: Date.now(),
  };
}

export function createSyncResponse(
  state: SyncState,
  requestMessage: SyncMessage,
  changes: Change[]
): SyncMessage {
  return {
    type: 'response',
    sourceNode: state.nodeId,
    targetNode: requestMessage.sourceNode,
    vectorClock: new Map(state.vectorClock),
    changes,
    timestamp: Date.now(),
  };
}

export function compareVectorClocks(
  local: Map<string, number>,
  remote: Map<string, number>
): 'ahead' | 'behind' | 'concurrent' | 'equal' {
  let localAhead = false;
  let remoteAhead = false;

  const allNodes = new Set([...local.keys(), ...remote.keys()]);

  for (const node of allNodes) {
    const localVersion = local.get(node) || 0;
    const remoteVersion = remote.get(node) || 0;

    if (localVersion > remoteVersion) localAhead = true;
    if (remoteVersion > localVersion) remoteAhead = true;
  }

  if (localAhead && remoteAhead) return 'concurrent';
  if (localAhead) return 'ahead';
  if (remoteAhead) return 'behind';
  return 'equal';
}

export function mergeVectorClocks(
  local: Map<string, number>,
  remote: Map<string, number>
): Map<string, number> {
  const merged = new Map(local);

  for (const [node, version] of remote) {
    const currentVersion = merged.get(node) || 0;
    merged.set(node, Math.max(currentVersion, version));
  }

  return merged;
}

export function getChangesSince(
  changes: Change[],
  vectorClock: Map<string, number>
): Change[] {
  return changes.filter(change => {
    const knownVersion = vectorClock.get(change.nodeId) || 0;
    return change.timestamp > knownVersion;
  });
}

export function orderChanges(changes: Change[]): Change[] {
  return [...changes].sort((a, b) => {
    // First by timestamp
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    // Then by node ID for deterministic ordering
    return a.nodeId.localeCompare(b.nodeId);
  });
}
