/**
 * Network Simulation Core
 *
 * Core simulation logic for network behavior modeling.
 */

export interface PacketSimulation {
  id: string;
  sourceNode: string;
  targetNode: string;
  payload: unknown;
  hops: string[];
  startTime: number;
  endTime?: number;
  status: 'in_transit' | 'delivered' | 'lost' | 'timeout';
}

export interface LatencyModel {
  baseLatencyMs: number;
  jitterMs: number;
  packetLossRate: number;
}

export function simulatePacketTransmission(
  packet: Omit<PacketSimulation, 'status' | 'endTime'>,
  model: LatencyModel
): PacketSimulation {
  // Simulate packet loss
  if (Math.random() < model.packetLossRate) {
    return {
      ...packet,
      status: 'lost',
      endTime: packet.startTime,
    };
  }

  // Calculate total latency
  const hopLatency = packet.hops.length * (model.baseLatencyMs + (Math.random() - 0.5) * model.jitterMs * 2);

  return {
    ...packet,
    status: 'delivered',
    endTime: packet.startTime + hopLatency,
  };
}

export function findShortestPath(
  graph: Map<string, string[]>,
  source: string,
  target: string
): string[] | null {
  if (source === target) return [source];

  const visited = new Set<string>();
  const queue: { node: string; path: string[] }[] = [{ node: source, path: [source] }];

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;

    if (visited.has(node)) continue;
    visited.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (neighbor === target) {
        return [...path, neighbor];
      }
      if (!visited.has(neighbor)) {
        queue.push({ node: neighbor, path: [...path, neighbor] });
      }
    }
  }

  return null; // No path found
}

export function calculateNetworkPartitions(
  nodes: Map<string, { connections: string[]; status: string }>
): string[][] {
  const onlineNodes = new Set<string>();
  for (const [id, node] of nodes) {
    if (node.status === 'online') {
      onlineNodes.add(id);
    }
  }

  const visited = new Set<string>();
  const partitions: string[][] = [];

  for (const startNode of onlineNodes) {
    if (visited.has(startNode)) continue;

    const partition: string[] = [];
    const stack = [startNode];

    while (stack.length > 0) {
      const node = stack.pop()!;
      if (visited.has(node)) continue;

      visited.add(node);
      partition.push(node);

      const nodeData = nodes.get(node);
      if (nodeData) {
        for (const neighbor of nodeData.connections) {
          if (onlineNodes.has(neighbor) && !visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
    }

    if (partition.length > 0) {
      partitions.push(partition);
    }
  }

  return partitions;
}

export function simulateGrowth(
  currentNodes: number,
  targetNodes: number,
  growthRate: number
): number[] {
  const timeline: number[] = [currentNodes];
  let nodes = currentNodes;

  while (nodes < targetNodes) {
    nodes = Math.min(targetNodes, Math.floor(nodes * (1 + growthRate)));
    timeline.push(nodes);
  }

  return timeline;
}
