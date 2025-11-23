/**
 * Conflict Resolution
 *
 * Strategies for resolving data conflicts in distributed systems.
 */

import type { Change } from '../index';

export type ConflictStrategy =
  | 'last-write-wins'
  | 'first-write-wins'
  | 'merge'
  | 'manual'
  | 'priority-node';

export interface Conflict {
  id: string;
  key: string;
  localChange: Change;
  remoteChange: Change;
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: Change;
  strategy?: ConflictStrategy;
}

export interface ConflictResolver {
  strategy: ConflictStrategy;
  resolve(local: Change, remote: Change): Change;
}

export const lastWriteWins: ConflictResolver = {
  strategy: 'last-write-wins',
  resolve(local: Change, remote: Change): Change {
    return local.timestamp >= remote.timestamp ? local : remote;
  },
};

export const firstWriteWins: ConflictResolver = {
  strategy: 'first-write-wins',
  resolve(local: Change, remote: Change): Change {
    return local.timestamp <= remote.timestamp ? local : remote;
  },
};

export function createMergeResolver(
  mergeFn: (localValue: unknown, remoteValue: unknown) => unknown
): ConflictResolver {
  return {
    strategy: 'merge',
    resolve(local: Change, remote: Change): Change {
      return {
        ...local,
        value: mergeFn(local.value, remote.value),
        timestamp: Math.max(local.timestamp, remote.timestamp),
      };
    },
  };
}

export function createPriorityNodeResolver(priorityNodes: string[]): ConflictResolver {
  return {
    strategy: 'priority-node',
    resolve(local: Change, remote: Change): Change {
      const localPriority = priorityNodes.indexOf(local.nodeId);
      const remotePriority = priorityNodes.indexOf(remote.nodeId);

      // Lower index = higher priority
      if (localPriority === -1) return remote;
      if (remotePriority === -1) return local;
      return localPriority <= remotePriority ? local : remote;
    },
  };
}

// CRDT-like merge functions for common types
export const crdtMergers = {
  // G-Counter: only grows, take max
  gCounter(local: number, remote: number): number {
    return Math.max(local || 0, remote || 0);
  },

  // G-Set: grow-only set, union
  gSet<T>(local: T[], remote: T[]): T[] {
    return [...new Set([...(local || []), ...(remote || [])])];
  },

  // LWW-Register: last write wins for nested objects
  lwwRegister(
    local: { value: unknown; timestamp: number },
    remote: { value: unknown; timestamp: number }
  ): { value: unknown; timestamp: number } {
    return local.timestamp >= remote.timestamp ? local : remote;
  },

  // MV-Register: keep all concurrent values
  mvRegister(local: unknown[], remote: unknown[]): unknown[] {
    const set = new Set([
      ...(local || []).map(v => JSON.stringify(v)),
      ...(remote || []).map(v => JSON.stringify(v)),
    ]);
    return Array.from(set).map(s => JSON.parse(s));
  },
};

export function detectConflict(local: Change, remote: Change): Conflict | null {
  if (local.key !== remote.key) return null;
  if (local.nodeId === remote.nodeId) return null;

  // Same key, different nodes, overlapping timestamps
  const timeDiff = Math.abs(local.timestamp - remote.timestamp);
  if (timeDiff < 1000) {
    // Within 1 second, consider potential conflict
    return {
      id: `conflict-${Date.now()}`,
      key: local.key,
      localChange: local,
      remoteChange: remote,
      detectedAt: new Date(),
    };
  }

  return null;
}
