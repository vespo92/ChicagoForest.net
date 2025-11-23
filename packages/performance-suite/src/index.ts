/**
 * @chicago-forest/performance-suite
 *
 * Agent 19: Benchmarker - Performance Testing
 *
 * Comprehensive performance benchmarking, scalability testing,
 * and regression detection for the network.
 */

export * from './benchmarks';
export * from './profilers';
export * from './reporters';

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTimeMs: number;
  averageTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  standardDeviation: number;
  opsPerSecond: number;
  memoryUsageMb?: number;
}

export interface PerformanceMetrics {
  timestamp: Date;
  duration: number;
  throughput: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
  errorRate: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

export interface ScalabilityResult {
  nodeCount: number;
  throughput: number;
  latency: number;
  efficiency: number; // throughput / nodeCount
}

export interface RegressionResult {
  benchmark: string;
  baseline: number;
  current: number;
  changePercent: number;
  isRegression: boolean;
  threshold: number;
}

export class PerformanceSuite {
  private results: Map<string, BenchmarkResult[]> = new Map();

  async benchmark(
    name: string,
    fn: () => void | Promise<void>,
    options: { iterations?: number; warmupIterations?: number } = {}
  ): Promise<BenchmarkResult> {
    const iterations = options.iterations ?? 100;
    const warmupIterations = options.warmupIterations ?? 10;

    // Warmup
    for (let i = 0; i < warmupIterations; i++) {
      await fn();
    }

    // Benchmark
    const times: number[] = [];
    const startMemory = process.memoryUsage?.().heapUsed;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      times.push(performance.now() - start);
    }

    const endMemory = process.memoryUsage?.().heapUsed;

    const totalTimeMs = times.reduce((a, b) => a + b, 0);
    const averageTimeMs = totalTimeMs / iterations;
    const minTimeMs = Math.min(...times);
    const maxTimeMs = Math.max(...times);

    // Calculate standard deviation
    const squaredDiffs = times.map(t => Math.pow(t - averageTimeMs, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / iterations;
    const standardDeviation = Math.sqrt(avgSquaredDiff);

    const result: BenchmarkResult = {
      name,
      iterations,
      totalTimeMs,
      averageTimeMs,
      minTimeMs,
      maxTimeMs,
      standardDeviation,
      opsPerSecond: 1000 / averageTimeMs,
      memoryUsageMb: startMemory && endMemory
        ? (endMemory - startMemory) / (1024 * 1024)
        : undefined,
    };

    // Store result
    if (!this.results.has(name)) {
      this.results.set(name, []);
    }
    this.results.get(name)!.push(result);

    return result;
  }

  async runScalabilityTest(
    testFn: (nodeCount: number) => Promise<{ throughput: number; latency: number }>,
    nodeCounts: number[] = [10, 50, 100, 500, 1000]
  ): Promise<ScalabilityResult[]> {
    const results: ScalabilityResult[] = [];

    for (const nodeCount of nodeCounts) {
      const { throughput, latency } = await testFn(nodeCount);
      results.push({
        nodeCount,
        throughput,
        latency,
        efficiency: throughput / nodeCount,
      });
    }

    return results;
  }

  detectRegression(
    benchmarkName: string,
    threshold: number = 0.1
  ): RegressionResult | null {
    const results = this.results.get(benchmarkName);
    if (!results || results.length < 2) return null;

    const baseline = results[0].averageTimeMs;
    const current = results[results.length - 1].averageTimeMs;
    const changePercent = (current - baseline) / baseline;

    return {
      benchmark: benchmarkName,
      baseline,
      current,
      changePercent,
      isRegression: changePercent > threshold,
      threshold,
    };
  }

  getResults(): Map<string, BenchmarkResult[]> {
    return new Map(this.results);
  }

  clearResults(): void {
    this.results.clear();
  }
}

export default PerformanceSuite;
