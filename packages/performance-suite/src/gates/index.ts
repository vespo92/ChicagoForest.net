/**
 * CI/CD Performance Gates
 *
 * Agent 19: Benchmarker - Performance Testing
 *
 * Implements performance gates for continuous integration pipelines,
 * allowing automatic pass/fail decisions based on benchmark results.
 */

import { EventEmitter } from 'eventemitter3';
import type {
  BenchmarkResult,
  PerformanceGate,
  GateResult,
  GateSummary,
  RegressionResult,
} from '../types';

export interface GateEvaluatorEvents {
  'gate:passed': (result: GateResult) => void;
  'gate:failed': (result: GateResult) => void;
  'gate:warning': (result: GateResult) => void;
  'evaluation:complete': (summary: GateSummary) => void;
}

export class GateEvaluator extends EventEmitter<GateEvaluatorEvents> {
  private gates: PerformanceGate[] = [];

  constructor(gates: PerformanceGate[] = []) {
    super();
    this.gates = gates;
  }

  /**
   * Add a performance gate
   */
  addGate(gate: PerformanceGate): void {
    this.gates.push(gate);
  }

  /**
   * Remove a gate by name
   */
  removeGate(name: string): boolean {
    const index = this.gates.findIndex(g => g.name === name);
    if (index >= 0) {
      this.gates.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all gates
   */
  getGates(): PerformanceGate[] {
    return [...this.gates];
  }

  /**
   * Evaluate all gates against benchmark results
   */
  evaluate(results: BenchmarkResult[]): GateSummary {
    const gateResults: GateResult[] = [];
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    for (const gate of this.gates) {
      const benchmarkResult = results.find(r => r.name === gate.benchmark);

      if (!benchmarkResult) {
        const result: GateResult = {
          gate,
          passed: false,
          actualValue: 0,
          message: `Benchmark '${gate.benchmark}' not found in results`,
        };
        gateResults.push(result);
        if (gate.failureAction === 'fail') {
          failed++;
          this.emit('gate:failed', result);
        } else {
          warnings++;
          this.emit('gate:warning', result);
        }
        continue;
      }

      const actualValue = this.extractMetricValue(benchmarkResult, gate.metric);
      const comparisonResult = this.compare(actualValue, gate.operator, gate.threshold);

      const result: GateResult = {
        gate,
        passed: comparisonResult,
        actualValue,
        message: this.formatMessage(gate, actualValue, comparisonResult),
      };

      gateResults.push(result);

      if (comparisonResult) {
        passed++;
        this.emit('gate:passed', result);
      } else if (gate.failureAction === 'fail') {
        failed++;
        this.emit('gate:failed', result);
      } else {
        warnings++;
        this.emit('gate:warning', result);
      }
    }

    const summary: GateSummary = {
      totalGates: this.gates.length,
      passed,
      failed,
      warnings,
      overallStatus: failed > 0 ? 'failed' : warnings > 0 ? 'warning' : 'passed',
      results: gateResults,
    };

    this.emit('evaluation:complete', summary);

    return summary;
  }

  /**
   * Evaluate gates with regression results
   */
  evaluateWithRegressions(
    results: BenchmarkResult[],
    regressions: RegressionResult[]
  ): GateSummary {
    const benchmarkSummary = this.evaluate(results);

    // Add regression failures
    const criticalRegressions = regressions.filter(r => r.severity === 'critical');
    const majorRegressions = regressions.filter(r => r.severity === 'major');

    for (const regression of criticalRegressions) {
      const result: GateResult = {
        gate: {
          name: `regression:${regression.benchmark}`,
          benchmark: regression.benchmark,
          metric: 'avg',
          operator: 'lt',
          threshold: regression.baseline.averageTimeMs * 1.25,
          failureAction: 'fail',
        },
        passed: false,
        actualValue: regression.current.averageTimeMs,
        message: `Critical regression: ${regression.benchmark} is ${(regression.changePercent * 100).toFixed(1)}% slower`,
      };

      benchmarkSummary.results.push(result);
      benchmarkSummary.failed++;
      this.emit('gate:failed', result);
    }

    for (const regression of majorRegressions) {
      const result: GateResult = {
        gate: {
          name: `regression:${regression.benchmark}`,
          benchmark: regression.benchmark,
          metric: 'avg',
          operator: 'lt',
          threshold: regression.baseline.averageTimeMs * 1.15,
          failureAction: 'warn',
        },
        passed: false,
        actualValue: regression.current.averageTimeMs,
        message: `Major regression: ${regression.benchmark} is ${(regression.changePercent * 100).toFixed(1)}% slower`,
      };

      benchmarkSummary.results.push(result);
      benchmarkSummary.warnings++;
      this.emit('gate:warning', result);
    }

    benchmarkSummary.totalGates += criticalRegressions.length + majorRegressions.length;
    benchmarkSummary.overallStatus =
      benchmarkSummary.failed > 0
        ? 'failed'
        : benchmarkSummary.warnings > 0
          ? 'warning'
          : 'passed';

    return benchmarkSummary;
  }

  private extractMetricValue(
    result: BenchmarkResult,
    metric: PerformanceGate['metric']
  ): number {
    switch (metric) {
      case 'avg':
        return result.averageTimeMs;
      case 'p95':
        return result.p95TimeMs;
      case 'p99':
        return result.p99TimeMs;
      case 'max':
        return result.maxTimeMs;
      case 'throughput':
        return result.opsPerSecond;
      default:
        return result.averageTimeMs;
    }
  }

  private compare(
    actual: number,
    operator: PerformanceGate['operator'],
    threshold: number
  ): boolean {
    switch (operator) {
      case 'lt':
        return actual < threshold;
      case 'lte':
        return actual <= threshold;
      case 'gt':
        return actual > threshold;
      case 'gte':
        return actual >= threshold;
      case 'eq':
        return Math.abs(actual - threshold) < 0.0001;
      default:
        return false;
    }
  }

  private formatMessage(gate: PerformanceGate, actual: number, passed: boolean): string {
    const operatorText = {
      lt: 'less than',
      lte: 'at most',
      gt: 'greater than',
      gte: 'at least',
      eq: 'equal to',
    }[gate.operator];

    const metricText = {
      avg: 'average time',
      p95: 'p95 latency',
      p99: 'p99 latency',
      max: 'max time',
      throughput: 'throughput',
    }[gate.metric];

    const unit = gate.metric === 'throughput' ? 'ops/s' : 'ms';

    if (passed) {
      return `${gate.name}: ${metricText} (${actual.toFixed(2)}${unit}) is ${operatorText} ${gate.threshold}${unit}`;
    } else {
      return `${gate.name}: ${metricText} (${actual.toFixed(2)}${unit}) should be ${operatorText} ${gate.threshold}${unit}`;
    }
  }
}

/**
 * Pre-defined gate templates
 */
export const gateTemplates = {
  /**
   * Create a latency gate (average time must be below threshold)
   */
  latency(benchmark: string, thresholdMs: number, name?: string): PerformanceGate {
    return {
      name: name ?? `latency:${benchmark}`,
      description: `Average latency must be below ${thresholdMs}ms`,
      benchmark,
      metric: 'avg',
      operator: 'lt',
      threshold: thresholdMs,
      failureAction: 'fail',
    };
  },

  /**
   * Create a p95 latency gate
   */
  p95Latency(benchmark: string, thresholdMs: number, name?: string): PerformanceGate {
    return {
      name: name ?? `p95:${benchmark}`,
      description: `P95 latency must be below ${thresholdMs}ms`,
      benchmark,
      metric: 'p95',
      operator: 'lt',
      threshold: thresholdMs,
      failureAction: 'fail',
    };
  },

  /**
   * Create a p99 latency gate
   */
  p99Latency(benchmark: string, thresholdMs: number, name?: string): PerformanceGate {
    return {
      name: name ?? `p99:${benchmark}`,
      description: `P99 latency must be below ${thresholdMs}ms`,
      benchmark,
      metric: 'p99',
      operator: 'lt',
      threshold: thresholdMs,
      failureAction: 'fail',
    };
  },

  /**
   * Create a throughput gate (ops/s must be above threshold)
   */
  throughput(benchmark: string, minOpsPerSecond: number, name?: string): PerformanceGate {
    return {
      name: name ?? `throughput:${benchmark}`,
      description: `Throughput must be at least ${minOpsPerSecond} ops/s`,
      benchmark,
      metric: 'throughput',
      operator: 'gte',
      threshold: minOpsPerSecond,
      failureAction: 'fail',
    };
  },

  /**
   * Create a soft latency gate (warning only)
   */
  softLatency(benchmark: string, thresholdMs: number, name?: string): PerformanceGate {
    return {
      name: name ?? `soft-latency:${benchmark}`,
      description: `Target average latency below ${thresholdMs}ms (warning only)`,
      benchmark,
      metric: 'avg',
      operator: 'lt',
      threshold: thresholdMs,
      failureAction: 'warn',
    };
  },
};

/**
 * Generate a CI report from gate summary
 */
export function generateCIReport(summary: GateSummary): string {
  const lines: string[] = [];
  const statusIcon = {
    passed: '✅',
    failed: '❌',
    warning: '⚠️',
  }[summary.overallStatus];

  lines.push(`# Performance Gate Report ${statusIcon}`);
  lines.push('');
  lines.push(`**Status:** ${summary.overallStatus.toUpperCase()}`);
  lines.push(`**Total Gates:** ${summary.totalGates}`);
  lines.push(`**Passed:** ${summary.passed}`);
  lines.push(`**Failed:** ${summary.failed}`);
  lines.push(`**Warnings:** ${summary.warnings}`);
  lines.push('');

  if (summary.failed > 0) {
    lines.push('## Failed Gates');
    lines.push('');
    for (const result of summary.results.filter(r => !r.passed && r.gate.failureAction === 'fail')) {
      lines.push(`- ❌ ${result.message}`);
    }
    lines.push('');
  }

  if (summary.warnings > 0) {
    lines.push('## Warnings');
    lines.push('');
    for (const result of summary.results.filter(r => !r.passed && r.gate.failureAction === 'warn')) {
      lines.push(`- ⚠️ ${result.message}`);
    }
    lines.push('');
  }

  if (summary.passed > 0) {
    lines.push('## Passed Gates');
    lines.push('');
    for (const result of summary.results.filter(r => r.passed)) {
      lines.push(`- ✅ ${result.message}`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate GitHub Actions output
 */
export function generateGitHubActionsOutput(summary: GateSummary): string {
  const outputs: string[] = [];

  outputs.push(`::set-output name=status::${summary.overallStatus}`);
  outputs.push(`::set-output name=passed::${summary.passed}`);
  outputs.push(`::set-output name=failed::${summary.failed}`);
  outputs.push(`::set-output name=warnings::${summary.warnings}`);

  if (summary.overallStatus === 'failed') {
    outputs.push('::error::Performance gates failed!');
    for (const result of summary.results.filter(r => !r.passed && r.gate.failureAction === 'fail')) {
      outputs.push(`::error::${result.message}`);
    }
  }

  if (summary.warnings > 0) {
    for (const result of summary.results.filter(r => !r.passed && r.gate.failureAction === 'warn')) {
      outputs.push(`::warning::${result.message}`);
    }
  }

  return outputs.join('\n');
}

export default GateEvaluator;
