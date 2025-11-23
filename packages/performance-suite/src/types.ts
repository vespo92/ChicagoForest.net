/**
 * @chicago-forest/performance-suite - Type Definitions
 *
 * Agent 19: Benchmarker - Performance Testing
 *
 * Comprehensive type definitions for performance benchmarking,
 * scalability testing, and regression detection.
 */

import type { EventEmitter } from 'eventemitter3';

// ============================================================================
// Core Types
// ============================================================================

export type NodeId = string;
export type BenchmarkId = string;
export type SessionId = string;

export type BenchmarkCategory = 'network' | 'crypto' | 'data' | 'api' | 'load' | 'latency';
export type BenchmarkStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type RegressionSeverity = 'critical' | 'major' | 'minor' | 'none';

// ============================================================================
// Benchmark Types
// ============================================================================

export interface BenchmarkResult {
  id: BenchmarkId;
  name: string;
  category: BenchmarkCategory;
  iterations: number;
  totalTimeMs: number;
  averageTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  medianTimeMs: number;
  p95TimeMs: number;
  p99TimeMs: number;
  standardDeviation: number;
  opsPerSecond: number;
  memoryUsageMb?: number;
  cpuUsagePercent?: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface BenchmarkDefinition {
  id?: BenchmarkId;
  name: string;
  description: string;
  category: BenchmarkCategory;
  tags?: string[];
  timeout?: number;
  iterations?: number;
  warmupIterations?: number;
  setup?: () => void | Promise<void>;
  teardown?: () => void | Promise<void>;
  run: () => void | Promise<void>;
}

export interface BenchmarkSuite {
  name: string;
  description: string;
  benchmarks: BenchmarkDefinition[];
  beforeAll?: () => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
}

export interface BenchmarkOptions {
  iterations?: number;
  warmupIterations?: number;
  timeout?: number;
  collectMemory?: boolean;
  collectCpu?: boolean;
  verbose?: boolean;
}

// ============================================================================
// Performance Metrics Types
// ============================================================================

export interface PerformanceMetrics {
  timestamp: Date;
  duration: number;
  throughput: number;
  requestCount: number;
  errorCount: number;
  errorRate: number;
  latency: LatencyMetrics;
  resources: ResourceMetrics;
}

export interface LatencyMetrics {
  min: number;
  max: number;
  mean: number;
  median: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  p999: number;
  standardDeviation: number;
}

export interface ResourceMetrics {
  cpuUsage: number;
  cpuUser: number;
  cpuSystem: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  memoryPercent: number;
  heapUsedMb: number;
  heapTotalMb: number;
  eventLoopLatencyMs: number;
  activeHandles: number;
  activeRequests: number;
}

// ============================================================================
// Scalability Types
// ============================================================================

export interface ScalabilityResult {
  nodeCount: number;
  throughput: number;
  latency: LatencyMetrics;
  efficiency: number;
  overhead: number;
  resources: ResourceMetrics;
  timestamp: Date;
}

export interface ScalabilityTestConfig {
  name: string;
  description?: string;
  nodeCounts: number[];
  iterationsPerNode: number;
  warmupDuration?: number;
  cooldownDuration?: number;
  testFn: (nodeCount: number) => Promise<{ throughput: number; latencies: number[] }>;
}

export interface ScalabilityReport {
  config: ScalabilityTestConfig;
  results: ScalabilityResult[];
  scalingFactor: number;
  efficiency: number;
  bottleneckAt?: number;
  recommendation: string;
}

// ============================================================================
// Load Testing Types
// ============================================================================

export interface LoadTestConfig {
  name: string;
  description?: string;
  targetRps: number;
  duration: number;
  rampUpDuration?: number;
  rampDownDuration?: number;
  maxConcurrent?: number;
  connectionTimeout?: number;
  requestTimeout?: number;
  scenarios: LoadScenario[];
}

export interface LoadScenario {
  name: string;
  weight: number;
  request: () => Promise<LoadScenarioResult>;
}

export interface LoadScenarioResult {
  success: boolean;
  latencyMs: number;
  statusCode?: number;
  bytesReceived?: number;
  error?: string;
}

export interface LoadTestResult {
  config: LoadTestConfig;
  startTime: Date;
  endTime: Date;
  duration: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  actualRps: number;
  latency: LatencyMetrics;
  resources: ResourceMetrics;
  timeline: LoadTimelinePoint[];
  scenarioResults: Map<string, LoadScenarioStats>;
}

export interface LoadTimelinePoint {
  timestamp: Date;
  rps: number;
  latency: number;
  errors: number;
  activeConnections: number;
}

export interface LoadScenarioStats {
  name: string;
  totalRequests: number;
  successCount: number;
  failureCount: number;
  avgLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
}

// ============================================================================
// Regression Detection Types
// ============================================================================

export interface RegressionResult {
  benchmark: string;
  baseline: BenchmarkResult;
  current: BenchmarkResult;
  changePercent: number;
  absoluteChange: number;
  isRegression: boolean;
  severity: RegressionSeverity;
  threshold: number;
  confidence: number;
  analysis: RegressionAnalysis;
}

export interface RegressionAnalysis {
  isStatisticallySignificant: boolean;
  pValue: number;
  effectSize: number;
  sampleSizeAdequate: boolean;
  recommendation: string;
}

export interface RegressionThresholds {
  critical: number;
  major: number;
  minor: number;
}

export interface BaselineStore {
  version: string;
  createdAt: Date;
  updatedAt: Date;
  commit?: string;
  branch?: string;
  baselines: Map<string, BenchmarkResult>;
}

// ============================================================================
// Performance Gate Types
// ============================================================================

export interface PerformanceGate {
  name: string;
  description?: string;
  benchmark: string;
  metric: 'avg' | 'p95' | 'p99' | 'max' | 'throughput';
  operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq';
  threshold: number;
  failureAction: 'warn' | 'fail';
}

export interface GateResult {
  gate: PerformanceGate;
  passed: boolean;
  actualValue: number;
  message: string;
}

export interface GateSummary {
  totalGates: number;
  passed: number;
  failed: number;
  warnings: number;
  overallStatus: 'passed' | 'failed' | 'warning';
  results: GateResult[];
}

// ============================================================================
// Profiler Types
// ============================================================================

export interface ProfileSnapshot {
  timestamp: Date;
  cpu: CpuSnapshot;
  memory: MemorySnapshot;
  eventLoop: EventLoopSnapshot;
  gc?: GcSnapshot;
}

export interface CpuSnapshot {
  user: number;
  system: number;
  percent: number;
  idle: number;
}

export interface MemorySnapshot {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
}

export interface EventLoopSnapshot {
  latency: number;
  utilization: number;
  idlePercent: number;
}

export interface GcSnapshot {
  collections: number;
  pauseTimeMs: number;
  reclaimedBytes: number;
}

export interface ProfileSession {
  id: SessionId;
  name?: string;
  startTime: Date;
  endTime?: Date;
  snapshots: ProfileSnapshot[];
  summary?: ProfileSummary;
  metadata?: Record<string, unknown>;
}

export interface ProfileSummary {
  duration: number;
  snapshotCount: number;
  cpu: {
    avg: number;
    max: number;
    min: number;
  };
  memory: {
    avgMb: number;
    maxMb: number;
    minMb: number;
    growth: number;
  };
  eventLoop: {
    avgLatency: number;
    maxLatency: number;
    avgUtilization: number;
  };
}

// ============================================================================
// Reporter Types
// ============================================================================

export type ReportFormat = 'markdown' | 'json' | 'html' | 'csv';

export interface ReportConfig {
  format: ReportFormat;
  includeCharts?: boolean;
  includeRawData?: boolean;
  comparisons?: BenchmarkResult[];
  outputPath?: string;
}

export interface BenchmarkReport {
  title: string;
  generatedAt: Date;
  results: BenchmarkResult[];
  summary: BenchmarkSummary;
  regressions?: RegressionResult[];
  gates?: GateSummary;
}

export interface BenchmarkSummary {
  totalBenchmarks: number;
  passedBenchmarks: number;
  failedBenchmarks: number;
  avgTimeMs: number;
  totalTimeMs: number;
  fastestBenchmark: string;
  slowestBenchmark: string;
}

// ============================================================================
// Event Types
// ============================================================================

export interface PerformanceSuiteEvents {
  'benchmark:start': (name: string) => void;
  'benchmark:complete': (result: BenchmarkResult) => void;
  'benchmark:error': (name: string, error: Error) => void;
  'suite:start': (name: string) => void;
  'suite:complete': (results: BenchmarkResult[]) => void;
  'regression:detected': (result: RegressionResult) => void;
  'gate:failed': (result: GateResult) => void;
  'profile:snapshot': (snapshot: ProfileSnapshot) => void;
  'load:progress': (progress: LoadTimelinePoint) => void;
}

export interface PerformanceSuiteEmitter extends EventEmitter<PerformanceSuiteEvents> {}

// ============================================================================
// Configuration Types
// ============================================================================

export interface PerformanceSuiteConfig {
  defaultIterations: number;
  defaultWarmupIterations: number;
  defaultTimeout: number;
  regressionThresholds: RegressionThresholds;
  baselineStorePath?: string;
  outputDirectory?: string;
  collectMemory: boolean;
  collectCpu: boolean;
  verbose: boolean;
  parallel: boolean;
  maxParallel: number;
}

export const DEFAULT_CONFIG: PerformanceSuiteConfig = {
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
};

// ============================================================================
// Utility Types
// ============================================================================

export interface TimerHandle {
  id: string;
  start: number;
  marks: Map<string, number>;
}

export interface Statistics {
  count: number;
  sum: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  variance: number;
  standardDeviation: number;
  percentiles: Map<number, number>;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
