/**
 * Scalability Stress Testing
 *
 * Test network performance at various scales from 100 to 10,000+ nodes.
 *
 * DISCLAIMER: This simulates the theoretical Chicago Forest Network.
 * The network itself is a conceptual framework, not an operational system.
 */

import { NetworkSimulator, SimulationConfig, SimulationState } from '../index';
import { EventEmitter } from 'eventemitter3';

export interface StressTestConfig {
  minNodes: number;
  maxNodes: number;
  nodeIncrements: number[];
  ticksPerTest: number;
  warmupTicks: number;
  cooldownTicks: number;
  collectMetricsEvery: number;
}

export interface StressTestResult {
  nodeCount: number;
  topology: string;
  metrics: {
    averageTickTimeMs: number;
    maxTickTimeMs: number;
    minTickTimeMs: number;
    memoryUsageMB: number;
    throughputOpsPerSec: number;
    partitionDuringTest: number;
    nodeFailures: number;
    recoveries: number;
  };
  passed: boolean;
  errors: string[];
}

export interface ScalabilityReport {
  testId: string;
  startTime: Date;
  endTime: Date;
  totalDurationMs: number;
  results: StressTestResult[];
  summary: {
    maxViableNodes: number;
    degradationThreshold: number;
    recommendation: string;
  };
}

export class StressTester extends EventEmitter {
  private defaultConfig: StressTestConfig = {
    minNodes: 100,
    maxNodes: 10000,
    nodeIncrements: [100, 250, 500, 1000, 2500, 5000, 10000],
    ticksPerTest: 100,
    warmupTicks: 10,
    cooldownTicks: 5,
    collectMetricsEvery: 10,
  };

  constructor(private config: Partial<StressTestConfig> = {}) {
    super();
    this.config = { ...this.defaultConfig, ...config };
  }

  async runScalabilityTest(
    topology: SimulationConfig['networkTopology'] = 'random'
  ): Promise<ScalabilityReport> {
    const testId = `stress-${Date.now()}`;
    const startTime = new Date();
    const results: StressTestResult[] = [];

    const config = { ...this.defaultConfig, ...this.config };

    for (const nodeCount of config.nodeIncrements) {
      if (nodeCount < config.minNodes || nodeCount > config.maxNodes) continue;

      this.emit('testStart', { nodeCount, topology });
      const result = await this.runSingleTest(nodeCount, topology, config);
      results.push(result);
      this.emit('testComplete', result);

      // Stop if test failed catastrophically
      if (result.metrics.averageTickTimeMs > 5000) {
        this.emit('testAborted', { reason: 'Performance degradation too severe' });
        break;
      }
    }

    const endTime = new Date();
    const summary = this.generateSummary(results);

    return {
      testId,
      startTime,
      endTime,
      totalDurationMs: endTime.getTime() - startTime.getTime(),
      results,
      summary,
    };
  }

  private async runSingleTest(
    nodeCount: number,
    topology: SimulationConfig['networkTopology'],
    config: StressTestConfig
  ): Promise<StressTestResult> {
    const errors: string[] = [];
    const tickTimes: number[] = [];
    let nodeFailures = 0;
    let recoveries = 0;
    let partitions = 0;

    try {
      const simulator = new NetworkSimulator({
        nodeCount,
        networkTopology: topology,
        failureRate: 0.01,
        recoveryRate: 0.1,
        tickIntervalMs: 10,
      });

      // Warmup phase
      for (let i = 0; i < config.warmupTicks; i++) {
        simulator.tick();
      }

      // Measurement phase
      const memoryBefore = process.memoryUsage().heapUsed;

      for (let i = 0; i < config.ticksPerTest; i++) {
        const tickStart = performance.now();
        const events = simulator.tick();
        const tickEnd = performance.now();

        tickTimes.push(tickEnd - tickStart);

        // Count events
        for (const event of events) {
          if (event.type === 'node_down') nodeFailures++;
          if (event.type === 'node_up') recoveries++;
          if (event.type === 'partition') partitions++;
        }
      }

      const memoryAfter = process.memoryUsage().heapUsed;

      // Cooldown phase
      for (let i = 0; i < config.cooldownTicks; i++) {
        simulator.tick();
      }

      const averageTickTime = tickTimes.reduce((a, b) => a + b, 0) / tickTimes.length;
      const throughput = 1000 / averageTickTime;

      return {
        nodeCount,
        topology,
        metrics: {
          averageTickTimeMs: averageTickTime,
          maxTickTimeMs: Math.max(...tickTimes),
          minTickTimeMs: Math.min(...tickTimes),
          memoryUsageMB: (memoryAfter - memoryBefore) / (1024 * 1024),
          throughputOpsPerSec: throughput,
          partitionDuringTest: partitions,
          nodeFailures,
          recoveries,
        },
        passed: averageTickTime < 1000,
        errors,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
      return {
        nodeCount,
        topology,
        metrics: {
          averageTickTimeMs: -1,
          maxTickTimeMs: -1,
          minTickTimeMs: -1,
          memoryUsageMB: -1,
          throughputOpsPerSec: 0,
          partitionDuringTest: 0,
          nodeFailures: 0,
          recoveries: 0,
        },
        passed: false,
        errors,
      };
    }
  }

  private generateSummary(results: StressTestResult[]): ScalabilityReport['summary'] {
    const passedTests = results.filter(r => r.passed);
    const maxViableNodes = passedTests.length > 0
      ? Math.max(...passedTests.map(r => r.nodeCount))
      : 0;

    // Find where performance starts degrading (>100ms average tick)
    const degradationThreshold = results.find(r => r.metrics.averageTickTimeMs > 100)?.nodeCount || maxViableNodes;

    let recommendation: string;
    if (maxViableNodes >= 10000) {
      recommendation = 'Excellent scalability. Network can handle enterprise-scale deployments.';
    } else if (maxViableNodes >= 5000) {
      recommendation = 'Good scalability. Suitable for large regional deployments.';
    } else if (maxViableNodes >= 1000) {
      recommendation = 'Moderate scalability. Appropriate for city-scale networks.';
    } else if (maxViableNodes >= 100) {
      recommendation = 'Limited scalability. Best for neighborhood or small community networks.';
    } else {
      recommendation = 'Poor scalability. Requires optimization before deployment.';
    }

    return {
      maxViableNodes,
      degradationThreshold,
      recommendation,
    };
  }

  formatReport(report: ScalabilityReport): string {
    const lines: string[] = [
      '╔══════════════════════════════════════════════════════════╗',
      '║          NETWORK SIMULATOR - SCALABILITY REPORT          ║',
      '╚══════════════════════════════════════════════════════════╝',
      '',
      `Test ID: ${report.testId}`,
      `Duration: ${(report.totalDurationMs / 1000).toFixed(2)}s`,
      `Started: ${report.startTime.toISOString()}`,
      '',
      '┌─────────────────────────────────────────────────────────┐',
      '│                    RESULTS BY SCALE                     │',
      '├──────────┬──────────┬──────────┬──────────┬────────────┤',
      '│  Nodes   │ Avg Tick │ Max Tick │  Memory  │   Status   │',
      '├──────────┼──────────┼──────────┼──────────┼────────────┤',
    ];

    for (const result of report.results) {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      const avgTick = result.metrics.averageTickTimeMs >= 0
        ? `${result.metrics.averageTickTimeMs.toFixed(2)}ms`
        : 'ERROR';
      const maxTick = result.metrics.maxTickTimeMs >= 0
        ? `${result.metrics.maxTickTimeMs.toFixed(2)}ms`
        : 'N/A';
      const memory = result.metrics.memoryUsageMB >= 0
        ? `${result.metrics.memoryUsageMB.toFixed(1)}MB`
        : 'N/A';

      lines.push(
        `│ ${String(result.nodeCount).padStart(8)} │ ${avgTick.padStart(8)} │ ${maxTick.padStart(8)} │ ${memory.padStart(8)} │ ${status.padStart(10)} │`
      );
    }

    lines.push('└──────────┴──────────┴──────────┴──────────┴────────────┘');
    lines.push('');
    lines.push('┌─────────────────────────────────────────────────────────┐');
    lines.push('│                       SUMMARY                           │');
    lines.push('├─────────────────────────────────────────────────────────┤');
    lines.push(`│ Max Viable Nodes: ${String(report.summary.maxViableNodes).padEnd(38)} │`);
    lines.push(`│ Degradation Threshold: ${String(report.summary.degradationThreshold).padEnd(33)} │`);
    lines.push('├─────────────────────────────────────────────────────────┤');
    lines.push(`│ ${report.summary.recommendation.substring(0, 55).padEnd(55)} │`);
    lines.push('└─────────────────────────────────────────────────────────┘');
    lines.push('');
    lines.push('DISCLAIMER: This tests a theoretical network simulation.');
    lines.push('Results do not represent any operational system performance.');

    return lines.join('\n');
  }
}

export function runQuickStressTest(nodeCount: number = 1000): Promise<StressTestResult> {
  const tester = new StressTester({
    nodeIncrements: [nodeCount],
    ticksPerTest: 50,
  });

  return tester.runScalabilityTest().then(report => report.results[0]);
}

export function benchmarkTopologies(): Promise<Map<string, StressTestResult>> {
  const topologies: SimulationConfig['networkTopology'][] = ['mesh', 'star', 'ring', 'tree', 'random'];
  const results = new Map<string, StressTestResult>();

  const tester = new StressTester({
    nodeIncrements: [100],
    ticksPerTest: 50,
  });

  return Promise.all(
    topologies.map(async topology => {
      const report = await tester.runScalabilityTest(topology);
      results.set(topology, report.results[0]);
    })
  ).then(() => results);
}
