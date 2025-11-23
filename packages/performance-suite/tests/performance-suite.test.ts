/**
 * Performance Suite Tests
 *
 * Agent 19: Benchmarker - Performance Testing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PerformanceSuite,
  LatencyMeter,
  LoadTester,
  BaselineManager,
  GateEvaluator,
  calculatePercentile,
  calculateStatistics,
  calculateLatencyMetrics,
  gateTemplates,
  loadPatterns,
  createScenario,
} from '../src';

describe('PerformanceSuite', () => {
  let suite: PerformanceSuite;

  beforeEach(() => {
    suite = new PerformanceSuite({
      defaultIterations: 10,
      defaultWarmupIterations: 2,
    });
  });

  describe('benchmark', () => {
    it('should run a simple benchmark', async () => {
      const result = await suite.benchmark('simple-test', () => {
        let sum = 0;
        for (let i = 0; i < 100; i++) sum += i;
      });

      expect(result.name).toBe('simple-test');
      expect(result.iterations).toBe(10);
      expect(result.averageTimeMs).toBeGreaterThan(0);
      expect(result.opsPerSecond).toBeGreaterThan(0);
    });

    it('should run an async benchmark', async () => {
      const result = await suite.benchmark('async-test', async () => {
        await new Promise(resolve => setTimeout(resolve, 1));
      });

      expect(result.name).toBe('async-test');
      expect(result.averageTimeMs).toBeGreaterThanOrEqual(1);
    });

    it('should calculate correct statistics', async () => {
      const result = await suite.benchmark('stats-test', () => {
        // Deterministic operation
        JSON.parse('{"a":1}');
      });

      expect(result.minTimeMs).toBeLessThanOrEqual(result.averageTimeMs);
      expect(result.maxTimeMs).toBeGreaterThanOrEqual(result.averageTimeMs);
      expect(result.standardDeviation).toBeGreaterThanOrEqual(0);
      expect(result.p95TimeMs).toBeLessThanOrEqual(result.maxTimeMs);
      expect(result.p99TimeMs).toBeLessThanOrEqual(result.maxTimeMs);
    });

    it('should emit events', async () => {
      const startHandler = vi.fn();
      const completeHandler = vi.fn();

      suite.on('benchmark:start', startHandler);
      suite.on('benchmark:complete', completeHandler);

      await suite.benchmark('event-test', () => {});

      expect(startHandler).toHaveBeenCalledWith('event-test');
      expect(completeHandler).toHaveBeenCalled();
    });
  });

  describe('runSuite', () => {
    it('should run a benchmark suite', async () => {
      const results = await suite.runSuite({
        name: 'Test Suite',
        description: 'Testing suite execution',
        benchmarks: [
          { name: 'bench-1', description: 'First', category: 'data', run: () => {} },
          { name: 'bench-2', description: 'Second', category: 'data', run: () => {} },
        ],
      });

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('bench-1');
      expect(results[1].name).toBe('bench-2');
    });

    it('should execute lifecycle hooks', async () => {
      const beforeAll = vi.fn();
      const afterAll = vi.fn();
      const beforeEach = vi.fn();
      const afterEach = vi.fn();

      await suite.runSuite({
        name: 'Hook Suite',
        description: 'Testing hooks',
        beforeAll,
        afterAll,
        beforeEach,
        afterEach,
        benchmarks: [
          { name: 'bench-1', description: 'First', category: 'data', run: () => {} },
          { name: 'bench-2', description: 'Second', category: 'data', run: () => {} },
        ],
      });

      expect(beforeAll).toHaveBeenCalledTimes(1);
      expect(afterAll).toHaveBeenCalledTimes(1);
      expect(beforeEach).toHaveBeenCalledTimes(2);
      expect(afterEach).toHaveBeenCalledTimes(2);
    });
  });

  describe('detectRegression', () => {
    it('should detect regression when performance degrades', async () => {
      // First benchmark (baseline)
      await suite.benchmark('regression-test', () => {
        let x = 0;
        for (let i = 0; i < 10; i++) x++;
      });

      // Simulate slower second run by storing a slower result
      const results = suite.getResults();
      const baselineResults = results.get('regression-test')!;
      baselineResults.push({
        ...baselineResults[0],
        averageTimeMs: baselineResults[0].averageTimeMs * 2, // 100% slower
      });

      const regression = suite.detectRegression('regression-test', 0.1);

      expect(regression).not.toBeNull();
      expect(regression!.isRegression).toBe(true);
      expect(regression!.changePercent).toBeGreaterThan(0);
    });

    it('should return null if no baseline exists', () => {
      const regression = suite.detectRegression('non-existent');
      expect(regression).toBeNull();
    });
  });
});

describe('LatencyMeter', () => {
  let meter: LatencyMeter;

  beforeEach(() => {
    meter = new LatencyMeter();
  });

  describe('start/stop', () => {
    it('should measure timing', () => {
      const id = meter.start('test');
      const latency = meter.stop(id);

      expect(latency).toBeGreaterThanOrEqual(0);
    });

    it('should support marks', () => {
      const id = meter.start('marked-test');
      meter.mark(id, 'middle');
      const latency = meter.stop(id);

      expect(latency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('measure', () => {
    it('should measure synchronous function', () => {
      const { result, latency } = meter.measure(() => {
        return 42;
      });

      expect(result).toBe(42);
      expect(latency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('measureAsync', () => {
    it('should measure async function', async () => {
      const { result, latency } = await meter.measureAsync(async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return 'done';
      });

      expect(result).toBe('done');
      expect(latency).toBeGreaterThanOrEqual(5);
    });
  });

  describe('getMetrics', () => {
    it('should return correct metrics', () => {
      meter.recordSample(10);
      meter.recordSample(20);
      meter.recordSample(30);

      const metrics = meter.getMetrics();

      expect(metrics.min).toBe(10);
      expect(metrics.max).toBe(30);
      expect(metrics.mean).toBe(20);
    });

    it('should track labeled samples', () => {
      meter.recordSample(100, 'api');
      meter.recordSample(200, 'api');
      meter.recordSample(50, 'db');

      const apiMetrics = meter.getMetrics('api');
      const dbMetrics = meter.getMetrics('db');

      expect(apiMetrics.mean).toBe(150);
      expect(dbMetrics.mean).toBe(50);
    });
  });

  describe('threshold alerts', () => {
    it('should emit event when threshold exceeded', () => {
      const handler = vi.fn();
      meter.on('threshold-exceeded', handler);

      meter.setThreshold(100);
      meter.recordSample(50);
      meter.recordSample(150);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(150, 100, undefined);
    });
  });
});

describe('GateEvaluator', () => {
  let evaluator: GateEvaluator;

  beforeEach(() => {
    evaluator = new GateEvaluator();
  });

  describe('evaluate', () => {
    it('should pass when threshold is met', () => {
      evaluator.addGate(gateTemplates.latency('api-call', 100));

      const summary = evaluator.evaluate([
        {
          id: '1',
          name: 'api-call',
          category: 'api',
          iterations: 100,
          totalTimeMs: 5000,
          averageTimeMs: 50, // Under 100ms threshold
          minTimeMs: 40,
          maxTimeMs: 80,
          medianTimeMs: 50,
          p95TimeMs: 70,
          p99TimeMs: 75,
          standardDeviation: 10,
          opsPerSecond: 20,
          timestamp: new Date(),
        },
      ]);

      expect(summary.overallStatus).toBe('passed');
      expect(summary.passed).toBe(1);
      expect(summary.failed).toBe(0);
    });

    it('should fail when threshold is exceeded', () => {
      evaluator.addGate(gateTemplates.latency('slow-api', 50));

      const summary = evaluator.evaluate([
        {
          id: '1',
          name: 'slow-api',
          category: 'api',
          iterations: 100,
          totalTimeMs: 10000,
          averageTimeMs: 100, // Over 50ms threshold
          minTimeMs: 80,
          maxTimeMs: 150,
          medianTimeMs: 100,
          p95TimeMs: 130,
          p99TimeMs: 145,
          standardDeviation: 20,
          opsPerSecond: 10,
          timestamp: new Date(),
        },
      ]);

      expect(summary.overallStatus).toBe('failed');
      expect(summary.failed).toBe(1);
    });

    it('should warn for soft gates', () => {
      evaluator.addGate(gateTemplates.softLatency('optional-api', 50));

      const summary = evaluator.evaluate([
        {
          id: '1',
          name: 'optional-api',
          category: 'api',
          iterations: 100,
          totalTimeMs: 10000,
          averageTimeMs: 100,
          minTimeMs: 80,
          maxTimeMs: 150,
          medianTimeMs: 100,
          p95TimeMs: 130,
          p99TimeMs: 145,
          standardDeviation: 20,
          opsPerSecond: 10,
          timestamp: new Date(),
        },
      ]);

      expect(summary.overallStatus).toBe('warning');
      expect(summary.warnings).toBe(1);
      expect(summary.failed).toBe(0);
    });
  });
});

describe('BaselineManager', () => {
  let manager: BaselineManager;

  beforeEach(() => {
    manager = new BaselineManager({ autoSave: false });
  });

  describe('saveBaseline', () => {
    it('should save and retrieve baselines', () => {
      const result = {
        id: '1',
        name: 'test-benchmark',
        category: 'data' as const,
        iterations: 100,
        totalTimeMs: 1000,
        averageTimeMs: 10,
        minTimeMs: 8,
        maxTimeMs: 15,
        medianTimeMs: 10,
        p95TimeMs: 14,
        p99TimeMs: 15,
        standardDeviation: 2,
        opsPerSecond: 100,
        timestamp: new Date(),
      };

      manager.saveBaseline('test-benchmark', result);

      expect(manager.hasBaseline('test-benchmark')).toBe(true);
      expect(manager.getBaseline('test-benchmark')).toEqual(result);
    });
  });

  describe('compareToBaseline', () => {
    it('should detect regression', () => {
      const baseline = {
        id: '1',
        name: 'perf-test',
        category: 'data' as const,
        iterations: 100,
        totalTimeMs: 1000,
        averageTimeMs: 10,
        minTimeMs: 8,
        maxTimeMs: 15,
        medianTimeMs: 10,
        p95TimeMs: 14,
        p99TimeMs: 15,
        standardDeviation: 2,
        opsPerSecond: 100,
        timestamp: new Date(),
      };

      manager.saveBaseline('perf-test', baseline);

      const current = {
        ...baseline,
        averageTimeMs: 15, // 50% slower
      };

      const comparison = manager.compareToBaseline('perf-test', current);

      expect(comparison).not.toBeNull();
      expect(comparison!.isRegression).toBe(true);
      expect(comparison!.changePercent).toBeCloseTo(0.5, 1);
    });
  });
});

describe('LoadTester', () => {
  let tester: LoadTester;

  beforeEach(() => {
    tester = new LoadTester();
  });

  it('should execute load test', async () => {
    const scenario = createScenario('simple', 1, async () => {
      await new Promise(resolve => setTimeout(resolve, 1));
    });

    const result = await tester.run({
      name: 'Quick Test',
      targetRps: 10,
      duration: 100,
      scenarios: [scenario],
    });

    expect(result.totalRequests).toBeGreaterThan(0);
    expect(result.duration).toBeGreaterThanOrEqual(100);
  });
});

describe('Utility Functions', () => {
  describe('calculatePercentile', () => {
    it('should calculate correct percentiles', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      expect(calculatePercentile(values, 50)).toBe(5.5);
      expect(calculatePercentile(values, 0)).toBe(1);
      expect(calculatePercentile(values, 100)).toBe(10);
    });

    it('should handle empty arrays', () => {
      expect(calculatePercentile([], 50)).toBe(0);
    });
  });

  describe('calculateStatistics', () => {
    it('should calculate all statistics', () => {
      const values = [1, 2, 3, 4, 5];
      const stats = calculateStatistics(values);

      expect(stats.count).toBe(5);
      expect(stats.sum).toBe(15);
      expect(stats.mean).toBe(3);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(5);
    });
  });

  describe('calculateLatencyMetrics', () => {
    it('should calculate latency metrics', () => {
      const latencies = [10, 20, 30, 40, 50];
      const metrics = calculateLatencyMetrics(latencies);

      expect(metrics.min).toBe(10);
      expect(metrics.max).toBe(50);
      expect(metrics.mean).toBe(30);
      expect(metrics.median).toBe(30);
    });
  });
});

describe('loadPatterns', () => {
  it('should create constant load config', () => {
    const config = loadPatterns.constant(100, 1000, []);
    expect(config.targetRps).toBe(100);
    expect(config.duration).toBe(1000);
  });

  it('should create ramp up/down config', () => {
    const config = loadPatterns.rampUpDown(100, 500, 1000, []);
    expect(config.targetRps).toBe(100);
    expect(config.rampUpDuration).toBe(500);
    expect(config.rampDownDuration).toBe(500);
  });
});
