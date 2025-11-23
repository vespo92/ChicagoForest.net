/**
 * Visualization Tests
 *
 * Tests for visualization generators.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NetworkSimulator, SimulationState } from '../src/index';
import {
  generateVisualizationData,
  generateAsciiMap,
  generateMetricsSummary,
  generateMermaidTopology,
  generateSporeVisualization,
  generateGrowthChart,
  toD3Format,
} from '../src/visualization';

describe('visualization', () => {
  let state: SimulationState;

  beforeEach(() => {
    const simulator = new NetworkSimulator({
      nodeCount: 10,
      networkTopology: 'mesh',
    });
    simulator.tick();
    state = simulator.getState();
  });

  describe('generateVisualizationData', () => {
    it('should generate nodes with correct properties', () => {
      const data = generateVisualizationData(state);
      expect(data.nodes.length).toBe(10);

      for (const node of data.nodes) {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('x');
        expect(node).toHaveProperty('y');
        expect(node).toHaveProperty('status');
        expect(node).toHaveProperty('color');
        expect(node).toHaveProperty('size');
      }
    });

    it('should generate edges for connections', () => {
      const data = generateVisualizationData(state);
      expect(data.edges.length).toBeGreaterThan(0);

      for (const edge of data.edges) {
        expect(edge).toHaveProperty('source');
        expect(edge).toHaveProperty('target');
        expect(edge).toHaveProperty('active');
        expect(edge).toHaveProperty('latency');
      }
    });

    it('should assign colors based on status', () => {
      const data = generateVisualizationData(state);
      const onlineNode = data.nodes.find(n => n.status === 'online');
      expect(onlineNode?.color).toBe('#28a745');
    });
  });

  describe('generateAsciiMap', () => {
    it('should generate ASCII representation', () => {
      const map = generateAsciiMap(state, 30, 10);
      expect(typeof map).toBe('string');
      expect(map.length).toBeGreaterThan(0);
    });

    it('should respect width and height', () => {
      const map = generateAsciiMap(state, 40, 15);
      const lines = map.split('\n');
      expect(lines.length).toBe(15);
      expect(lines[0].length).toBe(40);
    });

    it('should show node symbols', () => {
      const map = generateAsciiMap(state);
      expect(map).toContain('O'); // Online nodes
    });
  });

  describe('generateMetricsSummary', () => {
    it('should include tick count', () => {
      const summary = generateMetricsSummary(state);
      expect(summary).toContain('Tick:');
    });

    it('should include node statistics', () => {
      const summary = generateMetricsSummary(state);
      expect(summary).toContain('Nodes:');
      expect(summary).toContain('online');
    });

    it('should include packet statistics', () => {
      const summary = generateMetricsSummary(state);
      expect(summary).toContain('Packets');
    });
  });

  describe('generateMermaidTopology', () => {
    it('should generate valid Mermaid graph syntax', () => {
      const mermaid = generateMermaidTopology(state);
      expect(mermaid).toContain('graph TD');
    });

    it('should include node definitions', () => {
      const mermaid = generateMermaidTopology(state);
      expect(mermaid).toContain('node-0');
    });

    it('should include edge connections', () => {
      const mermaid = generateMermaidTopology(state);
      expect(mermaid).toContain('---');
    });

    it('should include style classes', () => {
      const mermaid = generateMermaidTopology(state);
      expect(mermaid).toContain('classDef online');
      expect(mermaid).toContain('classDef offline');
    });
  });

  describe('generateSporeVisualization', () => {
    it('should track node count changes', () => {
      const sporeData = generateSporeVisualization(state, 5);
      expect(sporeData.currentNodes).toBe(10);
      expect(sporeData.newNodes).toBe(5);
    });

    it('should calculate growth rate', () => {
      const sporeData = generateSporeVisualization(state, 5);
      expect(sporeData.growthRate).toBe(100); // 5 new from 5 = 100%
    });

    it('should generate propagation waves', () => {
      const sporeData = generateSporeVisualization(state, 5);
      expect(sporeData.propagationWaves.length).toBeGreaterThan(0);
    });

    it('should generate heatmap data', () => {
      const sporeData = generateSporeVisualization(state, 0);
      expect(Array.isArray(sporeData.heatmap)).toBe(true);
    });
  });

  describe('generateGrowthChart', () => {
    it('should generate ASCII chart', () => {
      const timeline = [
        { tick: 0, nodeCount: 10 },
        { tick: 1, nodeCount: 15 },
        { tick: 2, nodeCount: 25 },
        { tick: 3, nodeCount: 40 },
      ];

      const chart = generateGrowthChart(timeline);
      expect(chart).toContain('Network Growth');
      expect(chart).toContain('█');
    });

    it('should handle empty timeline', () => {
      const chart = generateGrowthChart([]);
      expect(chart).toBe('No data');
    });

    it('should show axis labels', () => {
      const timeline = [
        { tick: 0, nodeCount: 10 },
        { tick: 1, nodeCount: 100 },
      ];

      const chart = generateGrowthChart(timeline);
      expect(chart).toContain('100');
      expect(chart).toContain('Time');
    });
  });

  describe('toD3Format', () => {
    it('should convert to D3 compatible format', () => {
      const d3Data = toD3Format(state);
      expect(d3Data).toHaveProperty('nodes');
      expect(d3Data).toHaveProperty('links');
    });

    it('should include node positions', () => {
      const d3Data = toD3Format(state);
      for (const node of d3Data.nodes) {
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
      }
    });

    it('should group nodes by status', () => {
      const d3Data = toD3Format(state);
      const onlineNode = d3Data.nodes.find(n => n.status === 'online');
      expect(onlineNode?.group).toBe(1);
    });

    it('should set link values based on status', () => {
      const d3Data = toD3Format(state);
      const activeLink = d3Data.links.find(l => l.value === 1);
      expect(activeLink).toBeDefined();
    });
  });
});
