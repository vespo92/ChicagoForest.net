/**
 * Performance Baseline Storage
 *
 * Agent 19: Benchmarker - Performance Testing
 *
 * Manages performance baselines for regression detection,
 * supporting both local file storage and in-memory caching.
 */

import { EventEmitter } from 'eventemitter3';
import * as fs from 'fs';
import * as path from 'path';
import type {
  BaselineStore,
  BenchmarkResult,
  RegressionResult,
  RegressionAnalysis,
  RegressionSeverity,
  RegressionThresholds,
} from '../types';
import { tTest, effectSize, calculateStatistics } from '../utils';

export interface BaselineManagerEvents {
  'baseline:saved': (name: string, result: BenchmarkResult) => void;
  'baseline:loaded': (store: BaselineStore) => void;
  'regression:detected': (result: RegressionResult) => void;
}

export interface BaselineManagerConfig {
  storagePath?: string;
  autoSave?: boolean;
  thresholds?: RegressionThresholds;
}

const DEFAULT_THRESHOLDS: RegressionThresholds = {
  critical: 0.25, // 25% slower
  major: 0.15, // 15% slower
  minor: 0.05, // 5% slower
};

export class BaselineManager extends EventEmitter<BaselineManagerEvents> {
  private store: BaselineStore;
  private config: Required<BaselineManagerConfig>;
  private dirty = false;

  constructor(config: BaselineManagerConfig = {}) {
    super();

    this.config = {
      storagePath: config.storagePath ?? '.performance-baselines.json',
      autoSave: config.autoSave ?? true,
      thresholds: config.thresholds ?? DEFAULT_THRESHOLDS,
    };

    this.store = {
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      baselines: new Map(),
    };

    this.load();
  }

  /**
   * Save a benchmark result as a baseline
   */
  saveBaseline(name: string, result: BenchmarkResult): void {
    this.store.baselines.set(name, result);
    this.store.updatedAt = new Date();
    this.dirty = true;

    this.emit('baseline:saved', name, result);

    if (this.config.autoSave) {
      this.persist();
    }
  }

  /**
   * Get a baseline by name
   */
  getBaseline(name: string): BenchmarkResult | undefined {
    return this.store.baselines.get(name);
  }

  /**
   * Get all baseline names
   */
  getBaselineNames(): string[] {
    return Array.from(this.store.baselines.keys());
  }

  /**
   * Check if a baseline exists
   */
  hasBaseline(name: string): boolean {
    return this.store.baselines.has(name);
  }

  /**
   * Remove a baseline
   */
  removeBaseline(name: string): boolean {
    const removed = this.store.baselines.delete(name);
    if (removed) {
      this.dirty = true;
      if (this.config.autoSave) {
        this.persist();
      }
    }
    return removed;
  }

  /**
   * Compare a current result against its baseline
   */
  compareToBaseline(name: string, current: BenchmarkResult): RegressionResult | null {
    const baseline = this.store.baselines.get(name);
    if (!baseline) {
      return null;
    }

    return this.analyzeRegression(baseline, current);
  }

  /**
   * Compare multiple results against their baselines
   */
  compareAll(results: BenchmarkResult[]): RegressionResult[] {
    const regressions: RegressionResult[] = [];

    for (const result of results) {
      const comparison = this.compareToBaseline(result.name, result);
      if (comparison) {
        regressions.push(comparison);
        if (comparison.isRegression) {
          this.emit('regression:detected', comparison);
        }
      }
    }

    return regressions;
  }

  /**
   * Update baselines with new results (only if improved or no baseline exists)
   */
  updateBaselines(
    results: BenchmarkResult[],
    mode: 'always' | 'improved' | 'missing' = 'improved'
  ): { updated: string[]; skipped: string[] } {
    const updated: string[] = [];
    const skipped: string[] = [];

    for (const result of results) {
      const existing = this.store.baselines.get(result.name);

      let shouldUpdate = false;

      switch (mode) {
        case 'always':
          shouldUpdate = true;
          break;
        case 'improved':
          shouldUpdate = !existing || result.averageTimeMs < existing.averageTimeMs;
          break;
        case 'missing':
          shouldUpdate = !existing;
          break;
      }

      if (shouldUpdate) {
        this.saveBaseline(result.name, result);
        updated.push(result.name);
      } else {
        skipped.push(result.name);
      }
    }

    return { updated, skipped };
  }

  /**
   * Set git commit information for the baselines
   */
  setCommitInfo(commit: string, branch?: string): void {
    this.store.commit = commit;
    this.store.branch = branch;
    this.dirty = true;
  }

  /**
   * Get store metadata
   */
  getMetadata(): {
    version: string;
    createdAt: Date;
    updatedAt: Date;
    commit?: string;
    branch?: string;
    baselineCount: number;
  } {
    return {
      version: this.store.version,
      createdAt: this.store.createdAt,
      updatedAt: this.store.updatedAt,
      commit: this.store.commit,
      branch: this.store.branch,
      baselineCount: this.store.baselines.size,
    };
  }

  /**
   * Persist baselines to storage
   */
  persist(): void {
    if (!this.dirty) return;

    try {
      const data = this.serialize();
      const dir = path.dirname(this.config.storagePath);

      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.config.storagePath, data, 'utf-8');
      this.dirty = false;
    } catch (error) {
      console.error('Failed to persist baselines:', error);
    }
  }

  /**
   * Load baselines from storage
   */
  load(): void {
    try {
      if (!fs.existsSync(this.config.storagePath)) {
        return;
      }

      const data = fs.readFileSync(this.config.storagePath, 'utf-8');
      this.deserialize(data);
      this.emit('baseline:loaded', this.store);
    } catch (error) {
      console.error('Failed to load baselines:', error);
    }
  }

  /**
   * Clear all baselines
   */
  clear(): void {
    this.store.baselines.clear();
    this.store.updatedAt = new Date();
    this.dirty = true;

    if (this.config.autoSave) {
      this.persist();
    }
  }

  /**
   * Export baselines to JSON string
   */
  export(): string {
    return this.serialize();
  }

  /**
   * Import baselines from JSON string
   */
  import(data: string): void {
    this.deserialize(data);
    this.dirty = true;

    if (this.config.autoSave) {
      this.persist();
    }
  }

  private serialize(): string {
    const obj = {
      version: this.store.version,
      createdAt: this.store.createdAt.toISOString(),
      updatedAt: this.store.updatedAt.toISOString(),
      commit: this.store.commit,
      branch: this.store.branch,
      baselines: Object.fromEntries(
        Array.from(this.store.baselines.entries()).map(([key, value]) => [
          key,
          {
            ...value,
            timestamp: value.timestamp.toISOString(),
          },
        ])
      ),
    };

    return JSON.stringify(obj, null, 2);
  }

  private deserialize(data: string): void {
    const obj = JSON.parse(data);

    this.store = {
      version: obj.version ?? '1.0.0',
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
      commit: obj.commit,
      branch: obj.branch,
      baselines: new Map(
        Object.entries(obj.baselines ?? {}).map(([key, value]: [string, any]) => [
          key,
          {
            ...value,
            timestamp: new Date(value.timestamp),
          } as BenchmarkResult,
        ])
      ),
    };
  }

  private analyzeRegression(baseline: BenchmarkResult, current: BenchmarkResult): RegressionResult {
    const changePercent = (current.averageTimeMs - baseline.averageTimeMs) / baseline.averageTimeMs;
    const absoluteChange = current.averageTimeMs - baseline.averageTimeMs;

    // Determine severity based on thresholds
    let severity: RegressionSeverity = 'none';
    const thresholds = this.config.thresholds;

    if (changePercent >= thresholds.critical) {
      severity = 'critical';
    } else if (changePercent >= thresholds.major) {
      severity = 'major';
    } else if (changePercent >= thresholds.minor) {
      severity = 'minor';
    }

    const isRegression = severity !== 'none';

    // Perform statistical analysis
    const analysis = this.performStatisticalAnalysis(baseline, current, changePercent);

    return {
      benchmark: current.name,
      baseline,
      current,
      changePercent,
      absoluteChange,
      isRegression,
      severity,
      threshold: thresholds.minor,
      confidence: 1 - analysis.pValue,
      analysis,
    };
  }

  private performStatisticalAnalysis(
    baseline: BenchmarkResult,
    current: BenchmarkResult,
    changePercent: number
  ): RegressionAnalysis {
    // Create synthetic samples for t-test based on mean and std dev
    const baselineSamples = this.generateSyntheticSamples(
      baseline.averageTimeMs,
      baseline.standardDeviation,
      baseline.iterations
    );
    const currentSamples = this.generateSyntheticSamples(
      current.averageTimeMs,
      current.standardDeviation,
      current.iterations
    );

    const { pValue, isSignificant } = tTest(baselineSamples, currentSamples);
    const effect = effectSize(baselineSamples, currentSamples);

    const sampleSizeAdequate = baseline.iterations >= 30 && current.iterations >= 30;

    let recommendation: string;
    if (!isSignificant) {
      recommendation = 'Change is not statistically significant. No action required.';
    } else if (Math.abs(effect) < 0.2) {
      recommendation = 'Small effect size. Consider monitoring but no immediate action needed.';
    } else if (changePercent > 0) {
      if (Math.abs(effect) > 0.8) {
        recommendation = 'Large regression detected. Immediate investigation recommended.';
      } else {
        recommendation = 'Moderate regression detected. Investigation recommended.';
      }
    } else {
      recommendation = 'Performance improvement detected. Consider updating baseline.';
    }

    return {
      isStatisticallySignificant: isSignificant,
      pValue,
      effectSize: effect,
      sampleSizeAdequate,
      recommendation,
    };
  }

  private generateSyntheticSamples(mean: number, stdDev: number, count: number): number[] {
    // Generate samples using Box-Muller transform
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      samples.push(mean + z * stdDev);
    }
    return samples;
  }
}

/**
 * Create an in-memory baseline manager (no persistence)
 */
export function createInMemoryBaselineManager(
  thresholds?: RegressionThresholds
): BaselineManager {
  return new BaselineManager({
    autoSave: false,
    thresholds,
  });
}

export default BaselineManager;
