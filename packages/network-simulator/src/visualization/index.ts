/**
 * Simulation Visualization
 *
 * Generate visual representations of simulation state.
 */

import type { SimulatedNode, SimulationState } from '../index';

export interface VisualizationData {
  nodes: {
    id: string;
    x: number;
    y: number;
    status: string;
    size: number;
    color: string;
  }[];
  edges: {
    source: string;
    target: string;
    active: boolean;
    latency: number;
  }[];
}

export function generateVisualizationData(state: SimulationState): VisualizationData {
  const statusColors: Record<string, string> = {
    online: '#28a745',
    offline: '#dc3545',
    degraded: '#ffc107',
    booting: '#17a2b8',
  };

  const nodes = Array.from(state.nodes.values()).map(node => ({
    id: node.id,
    x: node.position.x,
    y: node.position.y,
    status: node.status,
    size: 10 + node.throughputMbps / 10,
    color: statusColors[node.status] || '#6c757d',
  }));

  const edges: VisualizationData['edges'] = [];
  const addedEdges = new Set<string>();

  for (const node of state.nodes.values()) {
    for (const targetId of node.connections) {
      const edgeKey = [node.id, targetId].sort().join('-');
      if (!addedEdges.has(edgeKey)) {
        addedEdges.add(edgeKey);
        const targetNode = state.nodes.get(targetId);
        edges.push({
          source: node.id,
          target: targetId,
          active: node.status === 'online' && targetNode?.status === 'online',
          latency: (node.latencyMs + (targetNode?.latencyMs || 0)) / 2,
        });
      }
    }
  }

  return { nodes, edges };
}

export function generateAsciiMap(state: SimulationState, width: number = 60, height: number = 20): string {
  const canvas: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ' ')
  );

  // Find bounds
  const nodes = Array.from(state.nodes.values());
  const minX = Math.min(...nodes.map(n => n.position.x));
  const maxX = Math.max(...nodes.map(n => n.position.x));
  const minY = Math.min(...nodes.map(n => n.position.y));
  const maxY = Math.max(...nodes.map(n => n.position.y));

  // Plot nodes
  for (const node of nodes) {
    const x = Math.floor(((node.position.x - minX) / (maxX - minX || 1)) * (width - 1));
    const y = Math.floor(((node.position.y - minY) / (maxY - minY || 1)) * (height - 1));

    const symbol = node.status === 'online' ? 'O' :
                   node.status === 'offline' ? 'X' :
                   node.status === 'degraded' ? '!' : '?';

    canvas[y][x] = symbol;
  }

  return canvas.map(row => row.join('')).join('\n');
}

export function generateMetricsSummary(state: SimulationState): string {
  const onlineCount = Array.from(state.nodes.values()).filter(n => n.status === 'online').length;
  const totalCount = state.nodes.size;

  return [
    '=== Network Simulation Metrics ===',
    `Tick: ${state.tick}`,
    `Elapsed: ${state.elapsedMs}ms`,
    `Nodes: ${onlineCount}/${totalCount} online (${((onlineCount / totalCount) * 100).toFixed(1)}%)`,
    `Packets Sent: ${state.metrics.totalPacketsSent}`,
    `Packets Lost: ${state.metrics.totalPacketsLost}`,
    `Avg Latency: ${state.metrics.averageLatencyMs.toFixed(2)}ms`,
    `Partitions: ${state.metrics.partitionCount}`,
    '================================',
  ].join('\n');
}

export function generateMermaidTopology(state: SimulationState): string {
  const lines: string[] = ['graph TD'];

  for (const node of state.nodes.values()) {
    const style = node.status === 'online' ? ':::online' :
                  node.status === 'offline' ? ':::offline' : '';
    lines.push(`    ${node.id}[${node.id}]${style}`);
  }

  const addedEdges = new Set<string>();
  for (const node of state.nodes.values()) {
    for (const target of node.connections) {
      const key = [node.id, target].sort().join('-');
      if (!addedEdges.has(key)) {
        addedEdges.add(key);
        lines.push(`    ${node.id} --- ${target}`);
      }
    }
  }

  lines.push('');
  lines.push('classDef online fill:#28a745');
  lines.push('classDef offline fill:#dc3545');

  return lines.join('\n');
}
