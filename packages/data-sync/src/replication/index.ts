/**
 * Replication Strategies
 *
 * Data replication across distributed nodes.
 */

export interface ReplicationConfig {
  factor: number; // Number of replicas
  strategy: 'full' | 'partial' | 'sharded';
  consistency: 'eventual' | 'strong' | 'quorum';
  quorumSize?: number;
}

export interface Replica {
  nodeId: string;
  keys: Set<string>;
  lastUpdate: Date;
  status: 'healthy' | 'stale' | 'unreachable';
  lagMs: number;
}

export interface ReplicationStatus {
  totalKeys: number;
  replicatedKeys: number;
  replicationFactor: number;
  healthyReplicas: number;
  totalReplicas: number;
}

export function calculateReplicationStatus(
  replicas: Replica[],
  totalKeys: number
): ReplicationStatus {
  const healthyReplicas = replicas.filter(r => r.status === 'healthy').length;
  const allKeys = new Set<string>();
  for (const replica of replicas) {
    for (const key of replica.keys) {
      allKeys.add(key);
    }
  }

  return {
    totalKeys,
    replicatedKeys: allKeys.size,
    replicationFactor: replicas.length > 0 ? allKeys.size / replicas.length : 0,
    healthyReplicas,
    totalReplicas: replicas.length,
  };
}

export function selectReplicaNodes(
  allNodes: string[],
  key: string,
  replicationFactor: number
): string[] {
  // Consistent hashing - simple implementation
  const hash = simpleHash(key);
  const sortedNodes = [...allNodes].sort((a, b) => {
    const hashA = simpleHash(a + key);
    const hashB = simpleHash(b + key);
    return hashA - hashB;
  });

  return sortedNodes.slice(0, Math.min(replicationFactor, sortedNodes.length));
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function needsReplication(
  key: string,
  currentReplicas: string[],
  targetFactor: number,
  healthyNodes: string[]
): { add: string[]; remove: string[] } {
  const healthyReplicas = currentReplicas.filter(r => healthyNodes.includes(r));
  const deficit = targetFactor - healthyReplicas.length;

  const add: string[] = [];
  const remove: string[] = [];

  if (deficit > 0) {
    // Need more replicas
    const candidates = healthyNodes.filter(n => !currentReplicas.includes(n));
    add.push(...candidates.slice(0, deficit));
  } else if (deficit < 0) {
    // Too many replicas, can remove some
    remove.push(...healthyReplicas.slice(targetFactor));
  }

  // Remove unhealthy replicas from consideration
  const unhealthy = currentReplicas.filter(r => !healthyNodes.includes(r));
  remove.push(...unhealthy);

  return { add, remove };
}

export function generateBackupSchedule(
  replicationConfig: ReplicationConfig,
  nodeCount: number
): { hour: number; nodes: string[] }[] {
  const schedule: { hour: number; nodes: string[] }[] = [];

  // Stagger backups across day to avoid load spikes
  const nodesPerHour = Math.ceil(nodeCount / 24);

  for (let hour = 0; hour < 24; hour++) {
    const startIndex = hour * nodesPerHour;
    const endIndex = Math.min(startIndex + nodesPerHour, nodeCount);
    const nodes: string[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      nodes.push(`node-${i}`);
    }

    if (nodes.length > 0) {
      schedule.push({ hour, nodes });
    }
  }

  return schedule;
}
