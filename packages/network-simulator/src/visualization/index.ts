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

/**
 * Spore Propagation Visualization
 *
 * Generates visualization data specifically for spore propagation patterns,
 * showing how new nodes germinate and integrate into the network.
 */

export interface SporeVisualizationData {
  currentNodes: number;
  newNodes: number;
  growthRate: number;
  propagationWaves: PropagationWave[];
  heatmap: HeatmapCell[];
}

export interface PropagationWave {
  waveNumber: number;
  originNode: string;
  reachedNodes: string[];
  timestamp: number;
  coverage: number;
}

export interface HeatmapCell {
  x: number;
  y: number;
  intensity: number;
  nodeCount: number;
}

export function generateSporeVisualization(
  state: SimulationState,
  previousNodeCount: number
): SporeVisualizationData {
  const currentNodes = state.nodes.size;
  const newNodes = currentNodes - previousNodeCount;
  const growthRate = previousNodeCount > 0 ? (newNodes / previousNodeCount) * 100 : 0;

  // Generate propagation waves (simulated based on node connections)
  const propagationWaves: PropagationWave[] = [];
  const processedNodes = new Set<string>();
  let waveNumber = 0;

  // Start from first online node
  const startNode = Array.from(state.nodes.values()).find(n => n.status === 'online');
  if (startNode) {
    const queue: { node: SimulatedNode; wave: number }[] = [{ node: startNode, wave: 0 }];

    while (queue.length > 0) {
      const currentWave = queue[0].wave;
      const nodesInWave: string[] = [];

      while (queue.length > 0 && queue[0].wave === currentWave) {
        const { node } = queue.shift()!;
        if (processedNodes.has(node.id)) continue;
        processedNodes.add(node.id);
        nodesInWave.push(node.id);

        for (const connId of node.connections) {
          const connNode = state.nodes.get(connId);
          if (connNode && !processedNodes.has(connId)) {
            queue.push({ node: connNode, wave: currentWave + 1 });
          }
        }
      }

      if (nodesInWave.length > 0) {
        propagationWaves.push({
          waveNumber,
          originNode: nodesInWave[0],
          reachedNodes: nodesInWave,
          timestamp: state.elapsedMs,
          coverage: processedNodes.size / state.nodes.size,
        });
        waveNumber++;
      }
    }
  }

  // Generate heatmap
  const heatmap = generateNetworkHeatmap(state, 10, 10);

  return {
    currentNodes,
    newNodes,
    growthRate,
    propagationWaves,
    heatmap,
  };
}

function generateNetworkHeatmap(
  state: SimulationState,
  gridWidth: number,
  gridHeight: number
): HeatmapCell[] {
  const nodes = Array.from(state.nodes.values());
  if (nodes.length === 0) return [];

  const minX = Math.min(...nodes.map(n => n.position.x));
  const maxX = Math.max(...nodes.map(n => n.position.x));
  const minY = Math.min(...nodes.map(n => n.position.y));
  const maxY = Math.max(...nodes.map(n => n.position.y));

  const cellWidth = (maxX - minX) / gridWidth || 1;
  const cellHeight = (maxY - minY) / gridHeight || 1;

  const grid: Map<string, { count: number; connections: number }> = new Map();

  for (const node of nodes) {
    const cellX = Math.floor((node.position.x - minX) / cellWidth);
    const cellY = Math.floor((node.position.y - minY) / cellHeight);
    const key = `${cellX},${cellY}`;

    const existing = grid.get(key) || { count: 0, connections: 0 };
    existing.count++;
    existing.connections += node.connections.length;
    grid.set(key, existing);
  }

  const maxCount = Math.max(...Array.from(grid.values()).map(v => v.count));

  return Array.from(grid.entries()).map(([key, value]) => {
    const [x, y] = key.split(',').map(Number);
    return {
      x,
      y,
      intensity: value.count / maxCount,
      nodeCount: value.count,
    };
  });
}

export function generateSporeAsciiAnimation(
  frames: SimulationState[],
  width: number = 50,
  height: number = 20
): string[] {
  return frames.map((state, index) => {
    const map = generateAsciiMap(state, width, height);
    const nodeCount = state.nodes.size;
    const onlineCount = Array.from(state.nodes.values()).filter(n => n.status === 'online').length;

    return [
      `Frame ${index + 1}/${frames.length}`,
      `Nodes: ${nodeCount} | Online: ${onlineCount}`,
      '─'.repeat(width),
      map,
      '─'.repeat(width),
    ].join('\n');
  });
}

export function generateGrowthChart(
  timeline: { tick: number; nodeCount: number }[],
  width: number = 60,
  height: number = 15
): string {
  if (timeline.length === 0) return 'No data';

  const maxNodes = Math.max(...timeline.map(t => t.nodeCount));
  const minNodes = Math.min(...timeline.map(t => t.nodeCount));
  const range = maxNodes - minNodes || 1;

  const lines: string[] = [];
  lines.push('Network Growth Over Time');
  lines.push('─'.repeat(width));

  // Create ASCII chart
  const chartWidth = width - 10;
  const chart: string[][] = Array.from({ length: height }, () =>
    Array.from({ length: chartWidth }, () => ' ')
  );

  for (let i = 0; i < timeline.length && i < chartWidth; i++) {
    const normalized = (timeline[i].nodeCount - minNodes) / range;
    const y = Math.floor((1 - normalized) * (height - 1));
    chart[y][i] = '█';

    // Fill below the point
    for (let j = y + 1; j < height; j++) {
      chart[j][i] = '│';
    }
  }

  // Add axis labels
  lines.push(`${String(maxNodes).padStart(6)} ┤${chart[0].join('')}`);
  for (let i = 1; i < height - 1; i++) {
    lines.push(`       │${chart[i].join('')}`);
  }
  lines.push(`${String(minNodes).padStart(6)} ┴${'─'.repeat(chartWidth)}`);
  lines.push(`       0${' '.repeat(chartWidth - 10)}Time →`);

  return lines.join('\n');
}

export interface D3CompatibleData {
  nodes: { id: string; group: number; x: number; y: number; status: string }[];
  links: { source: string; target: string; value: number }[];
}

export function toD3Format(state: SimulationState): D3CompatibleData {
  const nodes = Array.from(state.nodes.values()).map((node, index) => ({
    id: node.id,
    group: node.status === 'online' ? 1 : node.status === 'offline' ? 2 : 3,
    x: node.position.x,
    y: node.position.y,
    status: node.status,
  }));

  const links: D3CompatibleData['links'] = [];
  const addedLinks = new Set<string>();

  for (const node of state.nodes.values()) {
    for (const targetId of node.connections) {
      const key = [node.id, targetId].sort().join('-');
      if (!addedLinks.has(key)) {
        addedLinks.add(key);
        const targetNode = state.nodes.get(targetId);
        links.push({
          source: node.id,
          target: targetId,
          value: targetNode?.status === 'online' && node.status === 'online' ? 1 : 0.3,
        });
      }
    }
  }

  return { nodes, links };
}
