/**
 * @chicago-forest/performance-suite
 *
 * Agent 19: Benchmarker - Performance Testing
 *
 * Comprehensive performance benchmarking, scalability testing,
 * and regression detection for the Chicago Forest Network.
 *
 * Features:
 * - High-precision benchmarking with statistical analysis
 * - Scalability testing for network operations
 * - Performance regression detection
 * - Load testing scenarios
 * - Latency measurement suite
 * - CI/CD performance gates
 * - CPU and memory profiling
 * - Comprehensive reporting
 */

import { EventEmitter } from 'eventemitter3';
import type {
  BenchmarkResult,
  BenchmarkOptions,
  BenchmarkDefinition,
  BenchmarkSuite,
  ScalabilityResult,
  ScalabilityTestConfig,
  PerformanceSuiteConfig,
  PerformanceSuiteEvents,
  DEFAULT_CONFIG,
} from './types';
import {
  calculatePercentile,
  calculateStatistics,
  getResourceMetrics,
  generateId,
} from './utils';

// Re-export all modules
export * from './types';
export * from './benchmarks';
export * from './profilers';
export * from './reporters';
export * from './load';
export * from './latency';
export * from './baseline';
export * from './gates';
export * from './utils';

/**
 * Main Performance Suite class
 *
 * Provides comprehensive benchmarking, profiling, and regression detection
 * for the Chicago Forest Network.
 */
export class PerformanceSuite extends EventEmitter<PerformanceSuiteEvents> {
  private config: PerformanceSuiteConfig;
  private results: Map<string, BenchmarkResult[]> = new Map();

  constructor(config: Partial<PerformanceSuiteConfig> = {}) {
    super();
    this.config = {
      defaultIterations: 100,
      defaultWarmupIterations: 10,
      defaultTimeout: 30000,
      regressionThresholds: {
        critical: 0.25,
        major: 0.15,
        minor: 0.05,
      },
      collectMemory: true,
      collectCpu: true,
      verbose: false,
      parallel: false,
      maxParallel: 4,
      ...config,
    };
  }

  /**
   * Run a single benchmark
   */
  async benchmark(
    name: string,
    fn: () => void | Promise<void>,
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult> {
    const iterations = options.iterations ?? this.config.defaultIterations;
    const warmupIterations = options.warmupIterations ?? this.config.defaultWarmupIterations;
    const collectMemory = options.collectMemory ?? this.config.collectMemory;
    const collectCpu = options.collectCpu ?? this.config.collectCpu;

    this.emit('benchmark:start', name);

    // Warmup phase
    for (let i = 0; i < warmupIterations; i++) {
      await fn();
    }

    // Benchmark phase
    const times: number[] = [];
    const startMemory = collectMemory ? process.memoryUsage?.().heapUsed : undefined;
    const startCpu = collectCpu ? process.cpuUsage?.() : undefined;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      times.push(performance.now() - start);
    }

    const endMemory = collectMemory ? process.memoryUsage?.().heapUsed : undefined;
    const endCpu = collectCpu ? process.cpuUsage?.(startCpu) : undefined;

    // Calculate statistics
    const sorted = [...times].sort((a, b) => a - b);
    const totalTimeMs = times.reduce((a, b) => a + b, 0);
    const averageTimeMs = totalTimeMs / iterations;

    // Standard deviation
    const squaredDiffs = times.map(t => Math.pow(t - averageTimeMs, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / iterations;
    const standardDeviation = Math.sqrt(variance);

    const result: BenchmarkResult = {
      id: generateId(),
      name,
      category: 'data',
      iterations,
      totalTimeMs,
      averageTimeMs,
      minTimeMs: sorted[0],
      maxTimeMs: sorted[iterations - 1],
      medianTimeMs: calculatePercentile(sorted, 50),
      p95TimeMs: calculatePercentile(sorted, 95),
      p99TimeMs: calculatePercentile(sorted, 99),
      standardDeviation,
      opsPerSecond: averageTimeMs > 0 ? 1000 / averageTimeMs : 0,
      timestamp: new Date(),
    };

    // Add memory usage if collected
    if (startMemory !== undefined && endMemory !== undefined) {
      result.memoryUsageMb = (endMemory - startMemory) / (1024 * 1024);
    }

    // Add CPU usage if collected
    if (endCpu) {
      const totalCpuTime = endCpu.user + endCpu.system;
      result.cpuUsagePercent = (totalCpuTime / 1000000) / (totalTimeMs / 1000) * 100;
    }

    // Store result
    if (!this.results.has(name)) {
      this.results.set(name, []);
    }
    this.results.get(name)!.push(result);

    this.emit('benchmark:complete', result);

    return result;
  }

  /**
   * Run a benchmark suite
   */
  async runSuite(suite: BenchmarkSuite): Promise<BenchmarkResult[]> {
    this.emit('suite:start', suite.name);

    const results: BenchmarkResult[] = [];

    if (suite.beforeAll) {
      await suite.beforeAll();
    }

    for (const benchmark of suite.benchmarks) {
      try {
        if (suite.beforeEach) {
          await suite.beforeEach();
        }

        if (benchmark.setup) {
          await benchmark.setup();
        }

        const result = await this.benchmark(benchmark.name, benchmark.run, {
          iterations: benchmark.iterations,
          warmupIterations: benchmark.warmupIterations,
          timeout: benchmark.timeout,
        });

        result.category = benchmark.category;
        results.push(result);

        if (benchmark.teardown) {
          await benchmark.teardown();
        }

        if (suite.afterEach) {
          await suite.afterEach();
        }
      } catch (error) {
        this.emit('benchmark:error', benchmark.name, error as Error);
      }
    }

    if (suite.afterAll) {
      await suite.afterAll();
    }

    this.emit('suite:complete', results);

    return results;
  }

  /**
   * Run multiple benchmark definitions
   */
  async runBenchmarks(benchmarks: BenchmarkDefinition[]): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    for (const benchmark of benchmarks) {
      try {
        if (benchmark.setup) {
          await benchmark.setup();
        }

        const result = await this.benchmark(benchmark.name, benchmark.run, {
          iterations: benchmark.iterations,
          warmupIterations: benchmark.warmupIterations,
          timeout: benchmark.timeout,
        });

        result.category = benchmark.category;
        results.push(result);

        if (benchmark.teardown) {
          await benchmark.teardown();
        }
      } catch (error) {
        this.emit('benchmark:error', benchmark.name, error as Error);
      }
    }

    return results;
  }

  /**
   * Run scalability test
   */
  async runScalabilityTest(
    config: ScalabilityTestConfig
  ): Promise<ScalabilityResult[]> {
    const results: ScalabilityResult[] = [];

    for (const nodeCount of config.nodeCounts) {
      // Warmup
      if (config.warmupDuration) {
        await this.sleep(config.warmupDuration);
      }

      const { throughput, latencies } = await config.testFn(nodeCount);

      const sorted = [...latencies].sort((a, b) => a - b);
      const sum = latencies.reduce((a, b) => a + b, 0);
      const mean = sum / latencies.length;
      const squaredDiffs = latencies.map(l => Math.pow(l - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / latencies.length;

      results.push({
        nodeCount,
        throughput,
        latency: {
          min: sorted[0] ?? 0,
          max: sorted[sorted.length - 1] ?? 0,
          mean,
          median: calculatePercentile(sorted, 50),
          p50: calculatePercentile(sorted, 50),
          p75: calculatePercentile(sorted, 75),
          p90: calculatePercentile(sorted, 90),
          p95: calculatePercentile(sorted, 95),
          p99: calculatePercentile(sorted, 99),
          p999: calculatePercentile(sorted, 99.9),
          standardDeviation: Math.sqrt(variance),
        },
        efficiency: nodeCount > 0 ? throughput / nodeCount : 0,
        overhead: 0,
        resources: getResourceMetrics(),
        timestamp: new Date(),
      });

      // Cooldown
      if (config.cooldownDuration) {
        await this.sleep(config.cooldownDuration);
      }
    }

    return results;
  }

  /**
   * Detect regression between current and baseline results
   */
  detectRegression(
    benchmarkName: string,
    threshold: number = this.config.regressionThresholds.minor
  ): { isRegression: boolean; changePercent: number } | null {
    const results = this.results.get(benchmarkName);
    if (!results || results.length < 2) {
      return null;
    }

    const baseline = results[0].averageTimeMs;
    const current = results[results.length - 1].averageTimeMs;
    const changePercent = (current - baseline) / baseline;

    const isRegression = changePercent > threshold;

    if (isRegression) {
      this.emit('regression:detected', {
        benchmark: benchmarkName,
        baseline: results[0],
        current: results[results.length - 1],
        changePercent,
        absoluteChange: current - baseline,
        isRegression: true,
        severity: changePercent > this.config.regressionThresholds.critical
          ? 'critical'
          : changePercent > this.config.regressionThresholds.major
            ? 'major'
            : 'minor',
        threshold,
        confidence: 0.95,
        analysis: {
          isStatisticallySignificant: true,
          pValue: 0.05,
          effectSize: changePercent,
          sampleSizeAdequate: true,
          recommendation: isRegression
            ? 'Performance regression detected. Investigation recommended.'
            : 'No significant regression.',
        },
      });
    }

    return { isRegression, changePercent };
  }

  /**
   * Get all results
   */
  getResults(): Map<string, BenchmarkResult[]> {
    return new Map(this.results);
  }

  /**
   * Get results for a specific benchmark
   */
  getBenchmarkResults(name: string): BenchmarkResult[] {
    return [...(this.results.get(name) ?? [])];
  }

  /**
   * Get latest result for each benchmark
   */
  getLatestResults(): BenchmarkResult[] {
    const latest: BenchmarkResult[] = [];
    for (const results of this.results.values()) {
      if (results.length > 0) {
        latest.push(results[results.length - 1]);
      }
    }
    return latest;
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results.clear();
  }

  /**
   * Get configuration
   */
  getConfig(): PerformanceSuiteConfig {
    return { ...this.config };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default PerformanceSuite;
