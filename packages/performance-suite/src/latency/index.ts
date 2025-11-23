/**
 * Latency Measurement Suite
 *
 * Agent 19: Benchmarker - Performance Testing
 *
 * Comprehensive latency measurement and analysis tools for
 * network operations, API calls, and system interactions.
 */

import { EventEmitter } from 'eventemitter3';
import type { LatencyMetrics, Statistics, TimerHandle } from '../types';
import { calculatePercentile, calculateStatistics } from '../utils';

export interface LatencyMeterEvents {
  'sample': (latency: number, label?: string) => void;
  'threshold-exceeded': (latency: number, threshold: number, label?: string) => void;
}

/**
 * High-precision latency meter for measuring operation timing
 */
export class LatencyMeter extends EventEmitter<LatencyMeterEvents> {
  private samples: number[] = [];
  private samplesByLabel: Map<string, number[]> = new Map();
  private thresholds: Map<string, number> = new Map();
  private maxSamples: number;
  private activeTimers: Map<string, TimerHandle> = new Map();

  constructor(options: { maxSamples?: number } = {}) {
    super();
    this.maxSamples = options.maxSamples ?? 10000;
  }

  /**
   * Start a timing measurement
   */
  start(id?: string): string {
    const timerId = id ?? `timer-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    this.activeTimers.set(timerId, {
      id: timerId,
      start: performance.now(),
      marks: new Map(),
    });
    return timerId;
  }

  /**
   * Add a mark during a timing measurement
   */
  mark(timerId: string, markName: string): void {
    const timer = this.activeTimers.get(timerId);
    if (timer) {
      timer.marks.set(markName, performance.now());
    }
  }

  /**
   * Stop a timing measurement and record the latency
   */
  stop(timerId: string, label?: string): number {
    const timer = this.activeTimers.get(timerId);
    if (!timer) {
      return -1;
    }

    const latency = performance.now() - timer.start;
    this.activeTimers.delete(timerId);
    this.recordSample(latency, label);

    return latency;
  }

  /**
   * Measure a synchronous function's execution time
   */
  measure<T>(fn: () => T, label?: string): { result: T; latency: number } {
    const start = performance.now();
    const result = fn();
    const latency = performance.now() - start;
    this.recordSample(latency, label);
    return { result, latency };
  }

  /**
   * Measure an async function's execution time
   */
  async measureAsync<T>(fn: () => Promise<T>, label?: string): Promise<{ result: T; latency: number }> {
    const start = performance.now();
    const result = await fn();
    const latency = performance.now() - start;
    this.recordSample(latency, label);
    return { result, latency };
  }

  /**
   * Measure multiple iterations and return aggregate metrics
   */
  async measureIterations<T>(
    fn: () => T | Promise<T>,
    iterations: number,
    label?: string
  ): Promise<LatencyMetrics> {
    const latencies: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const result = fn();
      if (result instanceof Promise) {
        await result;
      }
      latencies.push(performance.now() - start);
    }

    // Record all samples
    for (const latency of latencies) {
      this.recordSample(latency, label);
    }

    return this.calculateMetrics(latencies);
  }

  /**
   * Record a latency sample
   */
  recordSample(latency: number, label?: string): void {
    // Add to global samples
    this.samples.push(latency);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    // Add to labeled samples
    if (label) {
      if (!this.samplesByLabel.has(label)) {
        this.samplesByLabel.set(label, []);
      }
      const labeledSamples = this.samplesByLabel.get(label)!;
      labeledSamples.push(latency);
      if (labeledSamples.length > this.maxSamples) {
        labeledSamples.shift();
      }
    }

    this.emit('sample', latency, label);

    // Check thresholds
    const thresholdKey = label ?? 'default';
    const threshold = this.thresholds.get(thresholdKey);
    if (threshold && latency > threshold) {
      this.emit('threshold-exceeded', latency, threshold, label);
    }
  }

  /**
   * Set a latency threshold for alerts
   */
  setThreshold(threshold: number, label?: string): void {
    this.thresholds.set(label ?? 'default', threshold);
  }

  /**
   * Get latency metrics for all samples
   */
  getMetrics(label?: string): LatencyMetrics {
    const samples = label ? (this.samplesByLabel.get(label) ?? []) : this.samples;
    return this.calculateMetrics(samples);
  }

  /**
   * Get statistics for samples
   */
  getStatistics(label?: string): Statistics {
    const samples = label ? (this.samplesByLabel.get(label) ?? []) : this.samples;
    return calculateStatistics(samples);
  }

  /**
   * Get all labels with recorded samples
   */
  getLabels(): string[] {
    return Array.from(this.samplesByLabel.keys());
  }

  /**
   * Clear all samples
   */
  clear(label?: string): void {
    if (label) {
      this.samplesByLabel.delete(label);
    } else {
      this.samples = [];
      this.samplesByLabel.clear();
    }
  }

  /**
   * Get raw samples
   */
  getSamples(label?: string): number[] {
    if (label) {
      return [...(this.samplesByLabel.get(label) ?? [])];
    }
    return [...this.samples];
  }

  private calculateMetrics(samples: number[]): LatencyMetrics {
    if (samples.length === 0) {
      return {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        p50: 0,
        p75: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        p999: 0,
        standardDeviation: 0,
      };
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const sum = samples.reduce((a, b) => a + b, 0);
    const mean = sum / samples.length;

    // Calculate standard deviation
    const squaredDiffs = samples.map(s => Math.pow(s - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / samples.length;
    const standardDeviation = Math.sqrt(avgSquaredDiff);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean,
      median: calculatePercentile(sorted, 50),
      p50: calculatePercentile(sorted, 50),
      p75: calculatePercentile(sorted, 75),
      p90: calculatePercentile(sorted, 90),
      p95: calculatePercentile(sorted, 95),
      p99: calculatePercentile(sorted, 99),
      p999: calculatePercentile(sorted, 99.9),
      standardDeviation,
    };
  }
}

/**
 * Network latency probe for measuring round-trip times
 */
export class NetworkLatencyProbe {
  private meter: LatencyMeter;

  constructor() {
    this.meter = new LatencyMeter();
  }

  /**
   * Measure latency to a simulated network endpoint
   */
  async probe(
    endpoint: string,
    options: { count?: number; interval?: number } = {}
  ): Promise<{
    endpoint: string;
    metrics: LatencyMetrics;
    results: Array<{ success: boolean; latency: number; error?: string }>;
  }> {
    const count = options.count ?? 5;
    const interval = options.interval ?? 100;
    const results: Array<{ success: boolean; latency: number; error?: string }> = [];

    for (let i = 0; i < count; i++) {
      try {
        // Simulate network probe (in real implementation, would use actual network calls)
        const latency = await this.simulateNetworkCall(endpoint);
        results.push({ success: true, latency });
        this.meter.recordSample(latency, endpoint);
      } catch (error) {
        results.push({
          success: false,
          latency: -1,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      if (i < count - 1 && interval > 0) {
        await this.sleep(interval);
      }
    }

    return {
      endpoint,
      metrics: this.meter.getMetrics(endpoint),
      results,
    };
  }

  /**
   * Run continuous latency monitoring
   */
  async startMonitoring(
    endpoint: string,
    intervalMs: number,
    callback: (latency: number) => void
  ): Promise<() => void> {
    let isRunning = true;

    const runProbe = async () => {
      while (isRunning) {
        try {
          const latency = await this.simulateNetworkCall(endpoint);
          this.meter.recordSample(latency, endpoint);
          callback(latency);
        } catch {
          // Ignore errors in monitoring
        }
        await this.sleep(intervalMs);
      }
    };

    runProbe();

    return () => {
      isRunning = false;
    };
  }

  getMetrics(endpoint: string): LatencyMetrics {
    return this.meter.getMetrics(endpoint);
  }

  private async simulateNetworkCall(endpoint: string): Promise<number> {
    // Simulate variable network latency (1-50ms with some variance)
    const baseLatency = endpoint.length % 10 + 1;
    const variance = Math.random() * 10;
    const latency = baseLatency + variance;
    await this.sleep(latency);
    return latency;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Event loop latency monitor
 */
export class EventLoopMonitor {
  private samples: number[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private lastCheck = 0;
  private expectedInterval = 100;

  /**
   * Start monitoring event loop latency
   */
  start(intervalMs = 100): void {
    if (this.intervalId) {
      return;
    }

    this.expectedInterval = intervalMs;
    this.lastCheck = performance.now();

    this.intervalId = setInterval(() => {
      const now = performance.now();
      const elapsed = now - this.lastCheck;
      const latency = elapsed - this.expectedInterval;

      if (latency > 0) {
        this.samples.push(latency);
        if (this.samples.length > 1000) {
          this.samples.shift();
        }
      }

      this.lastCheck = now;
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Get event loop latency metrics
   */
  getMetrics(): LatencyMetrics {
    if (this.samples.length === 0) {
      return {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        p50: 0,
        p75: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        p999: 0,
        standardDeviation: 0,
      };
    }

    const sorted = [...this.samples].sort((a, b) => a - b);
    const sum = this.samples.reduce((a, b) => a + b, 0);
    const mean = sum / this.samples.length;

    const squaredDiffs = this.samples.map(s => Math.pow(s - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / this.samples.length;

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean,
      median: calculatePercentile(sorted, 50),
      p50: calculatePercentile(sorted, 50),
      p75: calculatePercentile(sorted, 75),
      p90: calculatePercentile(sorted, 90),
      p95: calculatePercentile(sorted, 95),
      p99: calculatePercentile(sorted, 99),
      p999: calculatePercentile(sorted, 99.9),
      standardDeviation: Math.sqrt(variance),
    };
  }

  /**
   * Get utilization estimate (percentage of time event loop was blocked)
   */
  getUtilization(): number {
    if (this.samples.length === 0) {
      return 0;
    }

    const totalLatency = this.samples.reduce((a, b) => a + b, 0);
    const totalExpectedTime = this.samples.length * this.expectedInterval;
    return Math.min(100, (totalLatency / totalExpectedTime) * 100);
  }

  /**
   * Clear samples
   */
  clear(): void {
    this.samples = [];
  }
}

/**
 * Create a decorator for measuring method latency
 */
export function measureLatency(meter: LatencyMeter, label?: string) {
  return function <T extends (...args: unknown[]) => unknown>(
    _target: unknown,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ): TypedPropertyDescriptor<T> {
    const originalMethod = descriptor.value!;
    const methodLabel = label ?? propertyKey;

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      const result = meter.measure(() => originalMethod.apply(this, args), methodLabel);
      return result.result;
    } as T;

    return descriptor;
  };
}

export default LatencyMeter;
