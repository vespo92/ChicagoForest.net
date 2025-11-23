# @chicago-forest/performance-suite

**Agent 19: Benchmarker** - Performance Testing & Regression Detection

Comprehensive performance benchmarking, scalability testing, and regression detection for the Chicago Forest Network.

## Features

- **High-precision Benchmarking** - Statistical analysis with percentiles, standard deviation, and confidence intervals
- **Scalability Testing** - Test network behavior under varying node counts
- **Performance Regression Detection** - Automatic comparison against baselines with statistical significance testing
- **Load Testing** - Simulate high-traffic scenarios with configurable patterns
- **Latency Measurement** - Track operation timing with labels and threshold alerts
- **CI/CD Performance Gates** - Automatic pass/fail decisions for pipelines
- **CPU & Memory Profiling** - Resource monitoring during benchmarks
- **Comprehensive Reporting** - Markdown, JSON, and CI-friendly output formats

## Installation

```bash
pnpm add @chicago-forest/performance-suite
```

## Quick Start

```typescript
import { PerformanceSuite } from '@chicago-forest/performance-suite';

const suite = new PerformanceSuite();

// Run a simple benchmark
const result = await suite.benchmark('json-parse', () => {
  JSON.parse('{"key": "value"}');
}, { iterations: 1000 });

console.log(`Average time: ${result.averageTimeMs.toFixed(3)}ms`);
console.log(`Operations/sec: ${result.opsPerSecond.toFixed(0)}`);
```

## Benchmarking

### Basic Benchmark

```typescript
import { PerformanceSuite } from '@chicago-forest/performance-suite';

const suite = new PerformanceSuite({
  defaultIterations: 100,
  defaultWarmupIterations: 10,
  collectMemory: true,
  collectCpu: true,
});

const result = await suite.benchmark('my-operation', async () => {
  await someAsyncOperation();
}, {
  iterations: 1000,
  warmupIterations: 50,
});

console.log(result);
// {
//   name: 'my-operation',
//   iterations: 1000,
//   averageTimeMs: 0.125,
//   minTimeMs: 0.089,
//   maxTimeMs: 0.341,
//   p95TimeMs: 0.178,
//   p99TimeMs: 0.245,
//   standardDeviation: 0.034,
//   opsPerSecond: 8000,
//   memoryUsageMb: 0.5,
// }
```

### Benchmark Suites

```typescript
const results = await suite.runSuite({
  name: 'Network Operations',
  description: 'Benchmarks for core network functionality',
  beforeAll: async () => initializeNetwork(),
  afterAll: async () => cleanupNetwork(),
  benchmarks: [
    {
      name: 'peer-discovery',
      description: 'Time to discover peers',
      category: 'network',
      run: async () => await discoverPeers(),
    },
    {
      name: 'message-routing',
      description: 'Time to route a message',
      category: 'network',
      run: async () => await routeMessage(),
    },
  ],
});
```

### Pre-defined Benchmarks

```typescript
import { getAllBenchmarks, getBenchmarksByCategory } from '@chicago-forest/performance-suite/benchmarks';

// Run all pre-defined benchmarks
const results = await suite.runBenchmarks(getAllBenchmarks());

// Run only network benchmarks
const networkResults = await suite.runBenchmarks(getBenchmarksByCategory('network'));
```

## Regression Detection

### Baseline Management

```typescript
import { BaselineManager } from '@chicago-forest/performance-suite/baseline';

const manager = new BaselineManager({
  storagePath: '.performance-baselines.json',
  autoSave: true,
  thresholds: {
    critical: 0.25, // 25% regression
    major: 0.15,    // 15% regression
    minor: 0.05,    // 5% regression
  },
});

// Save a baseline
manager.saveBaseline('api-latency', benchmarkResult);

// Compare current results to baselines
const regressions = manager.compareAll(currentResults);

for (const regression of regressions) {
  if (regression.isRegression) {
    console.log(`Regression detected: ${regression.benchmark}`);
    console.log(`  Change: ${(regression.changePercent * 100).toFixed(1)}%`);
    console.log(`  Severity: ${regression.severity}`);
    console.log(`  Recommendation: ${regression.analysis.recommendation}`);
  }
}
```

### Statistical Analysis

The regression detector includes:
- **T-test** for statistical significance
- **Effect size** calculation (Cohen's d)
- **Sample size adequacy** checking
- **Confidence intervals**

## Load Testing

### Basic Load Test

```typescript
import { LoadTester, createScenario, loadPatterns } from '@chicago-forest/performance-suite/load';

const tester = new LoadTester();

const scenario = createScenario('api-request', 1, async () => {
  await fetch('/api/data');
});

const result = await tester.run({
  name: 'API Load Test',
  targetRps: 100,
  duration: 30000, // 30 seconds
  scenarios: [scenario],
});

console.log(`Actual RPS: ${result.actualRps.toFixed(0)}`);
console.log(`P95 Latency: ${result.latency.p95.toFixed(2)}ms`);
console.log(`Error Rate: ${(result.failedRequests / result.totalRequests * 100).toFixed(2)}%`);
```

### Load Patterns

```typescript
// Constant load
const config1 = loadPatterns.constant(100, 30000, scenarios);

// Ramp up, hold, ramp down
const config2 = loadPatterns.rampUpDown(100, 5000, 20000, scenarios);

// Spike test
const config3 = loadPatterns.spike(50, 200, 5000, scenarios);

// Stress test
const config4 = loadPatterns.stress(10, 500, 10000, 10, scenarios);
```

### Progress Monitoring

```typescript
tester.on('progress', (point) => {
  console.log(`RPS: ${point.rps.toFixed(0)}, Latency: ${point.latency.toFixed(2)}ms`);
});
```

## Latency Measurement

### Basic Measurement

```typescript
import { LatencyMeter } from '@chicago-forest/performance-suite/latency';

const meter = new LatencyMeter();

// Manual timing
const timerId = meter.start();
await performOperation();
const latency = meter.stop(timerId);

// Measure function
const { result, latency } = await meter.measureAsync(
  async () => await someOperation(),
  'operation-label'
);

// Get metrics
const metrics = meter.getMetrics('operation-label');
console.log(`P95: ${metrics.p95.toFixed(2)}ms`);
```

### Threshold Alerts

```typescript
meter.setThreshold(100, 'api-calls'); // 100ms threshold

meter.on('threshold-exceeded', (latency, threshold, label) => {
  console.warn(`Slow operation detected: ${label} took ${latency}ms`);
});
```

### Event Loop Monitoring

```typescript
import { EventLoopMonitor } from '@chicago-forest/performance-suite/latency';

const monitor = new EventLoopMonitor();
monitor.start(100); // Check every 100ms

// Later
const metrics = monitor.getMetrics();
console.log(`Event loop latency p99: ${metrics.p99.toFixed(2)}ms`);
console.log(`Utilization: ${monitor.getUtilization().toFixed(1)}%`);

monitor.stop();
```

## CI/CD Performance Gates

### Define Gates

```typescript
import { GateEvaluator, gateTemplates, generateCIReport } from '@chicago-forest/performance-suite/gates';

const evaluator = new GateEvaluator([
  gateTemplates.latency('api-endpoint', 100),        // Avg < 100ms
  gateTemplates.p95Latency('api-endpoint', 200),     // P95 < 200ms
  gateTemplates.throughput('batch-process', 1000),   // >= 1000 ops/s
  gateTemplates.softLatency('optional-check', 50),   // Warning only
]);
```

### Evaluate Results

```typescript
const summary = evaluator.evaluate(benchmarkResults);

console.log(`Status: ${summary.overallStatus}`);
console.log(`Passed: ${summary.passed}/${summary.totalGates}`);

if (summary.overallStatus === 'failed') {
  console.error('Performance gates failed!');
  process.exit(1);
}
```

### CI Report Generation

```typescript
// Markdown report
const report = generateCIReport(summary);
console.log(report);

// GitHub Actions output
import { generateGitHubActionsOutput } from '@chicago-forest/performance-suite/gates';
console.log(generateGitHubActionsOutput(summary));
```

## Scalability Testing

```typescript
const results = await suite.runScalabilityTest({
  name: 'Network Scalability',
  nodeCounts: [10, 50, 100, 500, 1000],
  iterationsPerNode: 100,
  testFn: async (nodeCount) => {
    const network = await createNetwork(nodeCount);
    const latencies = await measureOperations(network);
    return {
      throughput: network.getMessagesPerSecond(),
      latencies,
    };
  },
});

// Generate scalability report
import { generateScalabilityReport } from '@chicago-forest/performance-suite/reporters';
console.log(generateScalabilityReport(results));
```

## Profiling

```typescript
import { Profiler } from '@chicago-forest/performance-suite/profilers';

const profiler = new Profiler();

const sessionId = profiler.startSession('my-profile');

// Run operations...
await performOperations();

const session = profiler.stopSession();

console.log(`Duration: ${session.summary.duration}ms`);
console.log(`Avg CPU: ${session.summary.cpu.avg.toFixed(1)}%`);
console.log(`Max Memory: ${session.summary.memory.maxMb.toFixed(1)}MB`);
```

## Reporting

### Generate Reports

```typescript
import {
  generateBenchmarkReport,
  generateScalabilityReport,
  generateRegressionReport,
  generateProfileReport,
} from '@chicago-forest/performance-suite/reporters';

// Benchmark report
const benchReport = generateBenchmarkReport(results);

// Scalability report
const scaleReport = generateScalabilityReport(scalabilityResults);

// Regression report
const regReport = generateRegressionReport(regressionResults);
```

## Events

```typescript
suite.on('benchmark:start', (name) => {
  console.log(`Starting: ${name}`);
});

suite.on('benchmark:complete', (result) => {
  console.log(`Completed: ${result.name} - ${result.averageTimeMs}ms`);
});

suite.on('regression:detected', (result) => {
  console.warn(`Regression: ${result.benchmark} is ${result.changePercent * 100}% slower`);
});

suite.on('gate:failed', (result) => {
  console.error(`Gate failed: ${result.message}`);
});
```

## Configuration

```typescript
const suite = new PerformanceSuite({
  // Benchmark settings
  defaultIterations: 100,
  defaultWarmupIterations: 10,
  defaultTimeout: 30000,

  // Regression thresholds
  regressionThresholds: {
    critical: 0.25,
    major: 0.15,
    minor: 0.05,
  },

  // Resource collection
  collectMemory: true,
  collectCpu: true,

  // Execution
  verbose: false,
  parallel: false,
  maxParallel: 4,
});
```

## Integration with Chicago Forest Network

This package integrates with the Chicago Forest Network ecosystem:

```typescript
import { PerformanceSuite } from '@chicago-forest/performance-suite';
import { MyceliumNetwork } from '@chicago-forest/mycelium-core';

const suite = new PerformanceSuite();

// Benchmark mycelium operations
const result = await suite.benchmark('hyphal-path-creation', async () => {
  const network = new MyceliumNetwork({ nodeId: 'test-node' });
  await network.establishPath('target-node');
});
```

## API Reference

### Classes

- `PerformanceSuite` - Main benchmarking class
- `LatencyMeter` - Latency measurement and tracking
- `NetworkLatencyProbe` - Network latency probing
- `EventLoopMonitor` - Event loop latency monitoring
- `LoadTester` - Load testing engine
- `BaselineManager` - Baseline storage and comparison
- `GateEvaluator` - Performance gate evaluation
- `Profiler` - CPU and memory profiling

### Utilities

- `calculatePercentile()` - Percentile calculation
- `calculateStatistics()` - Statistical analysis
- `calculateLatencyMetrics()` - Latency metrics
- `formatDuration()` - Duration formatting
- `formatBytes()` - Byte size formatting

## License

MIT
