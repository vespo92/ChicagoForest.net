/**
 * Performance Suite Utilities
 *
 * Agent 19: Benchmarker - Performance Testing
 *
 * Utility functions for statistics, metrics calculations,
 * and resource monitoring.
 */

import type { LatencyMetrics, ResourceMetrics, Statistics } from '../types';

/**
 * Calculate percentile value from a sorted array
 */
export function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }

  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sortedValues.length) {
    return sortedValues[sortedValues.length - 1];
  }

  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Calculate comprehensive statistics for a data set
 */
export function calculateStatistics(values: number[]): Statistics {
  if (values.length === 0) {
    return {
      count: 0,
      sum: 0,
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      variance: 0,
      standardDeviation: 0,
      percentiles: new Map(),
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / count;

  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / count;
  const standardDeviation = Math.sqrt(variance);

  const percentiles = new Map<number, number>();
  [1, 5, 10, 25, 50, 75, 90, 95, 99, 99.9].forEach(p => {
    percentiles.set(p, calculatePercentile(sorted, p));
  });

  return {
    count,
    sum,
    min: sorted[0],
    max: sorted[count - 1],
    mean,
    median: calculatePercentile(sorted, 50),
    variance,
    standardDeviation,
    percentiles,
  };
}

/**
 * Calculate latency metrics from raw latency values
 */
export function calculateLatencyMetrics(latencies: number[]): LatencyMetrics {
  if (latencies.length === 0) {
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

  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = latencies.reduce((a, b) => a + b, 0);
  const mean = sum / latencies.length;

  const squaredDiffs = latencies.map(l => Math.pow(l - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / latencies.length;

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
 * Get current resource metrics
 */
export function getResourceMetrics(): ResourceMetrics {
  const memUsage = process.memoryUsage?.() ?? {
    heapUsed: 0,
    heapTotal: 0,
    external: 0,
    rss: 0,
  };

  const cpuUsage = process.cpuUsage?.() ?? { user: 0, system: 0 };

  // Convert microseconds to percentages (rough estimate)
  const totalCpu = cpuUsage.user + cpuUsage.system;
  const cpuPercent = totalCpu / 10000; // Very rough estimate

  return {
    cpuUsage: cpuPercent,
    cpuUser: cpuUsage.user / 1000000,
    cpuSystem: cpuUsage.system / 1000000,
    memoryUsedMb: memUsage.rss / (1024 * 1024),
    memoryTotalMb: 0, // Not directly available in Node.js
    memoryPercent: 0,
    heapUsedMb: memUsage.heapUsed / (1024 * 1024),
    heapTotalMb: memUsage.heapTotal / (1024 * 1024),
    eventLoopLatencyMs: 0, // Would need perf_hooks for accurate measurement
    activeHandles: 0,
    activeRequests: 0,
  };
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}μs`;
  }
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let value = bytes;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate operations per second from execution time
 */
export function calculateOpsPerSecond(timeMs: number): number {
  if (timeMs <= 0) return 0;
  return 1000 / timeMs;
}

/**
 * Calculate throughput from count and duration
 */
export function calculateThroughput(count: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  return count / (durationMs / 1000);
}

/**
 * Perform a t-test to determine statistical significance
 */
export function tTest(
  sample1: number[],
  sample2: number[]
): { tValue: number; pValue: number; isSignificant: boolean } {
  if (sample1.length < 2 || sample2.length < 2) {
    return { tValue: 0, pValue: 1, isSignificant: false };
  }

  const n1 = sample1.length;
  const n2 = sample2.length;

  const mean1 = sample1.reduce((a, b) => a + b, 0) / n1;
  const mean2 = sample2.reduce((a, b) => a + b, 0) / n2;

  const var1 = sample1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) / (n1 - 1);
  const var2 = sample2.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) / (n2 - 1);

  const pooledSE = Math.sqrt(var1 / n1 + var2 / n2);

  if (pooledSE === 0) {
    return { tValue: 0, pValue: 1, isSignificant: false };
  }

  const tValue = (mean1 - mean2) / pooledSE;

  // Approximate degrees of freedom using Welch–Satterthwaite equation
  const df =
    Math.pow(var1 / n1 + var2 / n2, 2) /
    (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1));

  // Approximate p-value using simplified t-distribution
  const pValue = approximatePValue(Math.abs(tValue), df);

  return {
    tValue,
    pValue,
    isSignificant: pValue < 0.05,
  };
}

/**
 * Approximate p-value for t-distribution
 */
function approximatePValue(t: number, df: number): number {
  // Simple approximation for two-tailed test
  const x = df / (df + t * t);
  return Math.min(1, Math.max(0, x));
}

/**
 * Calculate Cohen's d effect size
 */
export function effectSize(sample1: number[], sample2: number[]): number {
  if (sample1.length === 0 || sample2.length === 0) {
    return 0;
  }

  const mean1 = sample1.reduce((a, b) => a + b, 0) / sample1.length;
  const mean2 = sample2.reduce((a, b) => a + b, 0) / sample2.length;

  const var1 = sample1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) / sample1.length;
  const var2 = sample2.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0) / sample2.length;

  const pooledStd = Math.sqrt((var1 + var2) / 2);

  if (pooledStd === 0) {
    return 0;
  }

  return (mean1 - mean2) / pooledStd;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number; maxDelay?: number } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelay = options.baseDelay ?? 100;
  const maxDelay = options.maxDelay ?? 5000;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}
