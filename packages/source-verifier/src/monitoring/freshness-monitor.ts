/**
 * Source Freshness Monitoring and Alerts
 *
 * Agent 11: Verifier - Source freshness tracking and notification
 *
 * Features:
 * - Track when sources were last verified
 * - Alert on stale sources that need re-verification
 * - Monitor source availability over time
 * - Generate freshness reports
 * - Schedule automated verification checks
 */

import { EventEmitter } from 'eventemitter3';
import {
  VerificationResult,
  VerificationEvent,
  VerificationEventType,
  SourceEntry,
  DEFAULT_OPTIONS,
  type VerificationOptions,
} from '../types';

/**
 * Source verification record for tracking
 */
export interface SourceRecord {
  url: string;
  type: 'url' | 'doi' | 'patent' | 'archive';
  label?: string;
  category?: string;
  firstVerified: Date;
  lastVerified: Date;
  lastStatus: 'valid' | 'invalid' | 'unreachable' | 'stale';
  verificationCount: number;
  failureCount: number;
  consecutiveFailures: number;
  averageResponseTime?: number;
  history: VerificationHistoryEntry[];
}

/**
 * Historical verification entry
 */
export interface VerificationHistoryEntry {
  timestamp: Date;
  status: 'valid' | 'invalid' | 'unreachable';
  responseTime?: number;
  errorMessage?: string;
}

/**
 * Freshness alert
 */
export interface FreshnessAlert {
  type: 'stale' | 'failing' | 'recovered' | 'new-failure';
  severity: 'info' | 'warning' | 'error';
  source: string;
  message: string;
  timestamp: Date;
  details: {
    daysSinceLastCheck?: number;
    consecutiveFailures?: number;
    lastStatus?: string;
  };
}

/**
 * Freshness report summary
 */
export interface FreshnessReport {
  timestamp: Date;
  totalSources: number;
  freshSources: number;
  staleSources: number;
  failingSources: number;
  averageFreshness: number;
  oldestSource?: SourceRecord;
  newestSource?: SourceRecord;
  alerts: FreshnessAlert[];
  recommendations: string[];
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  maxAgeDays: number;
  checkIntervalHours: number;
  maxConsecutiveFailures: number;
  alertOnStale: boolean;
  alertOnFailure: boolean;
  historyLimit: number;
}

const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  maxAgeDays: 30,
  checkIntervalHours: 24,
  maxConsecutiveFailures: 3,
  alertOnStale: true,
  alertOnFailure: true,
  historyLimit: 100,
};

/**
 * Source Freshness Monitor
 */
export class FreshnessMonitor extends EventEmitter {
  private readonly config: MonitoringConfig;
  private sources: Map<string, SourceRecord> = new Map();
  private alerts: FreshnessAlert[] = [];

  constructor(config: Partial<MonitoringConfig> = {}) {
    super();
    this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
  }

  /**
   * Register a source for monitoring
   */
  registerSource(entry: SourceEntry): SourceRecord {
    const existing = this.sources.get(entry.url);

    if (existing) {
      return existing;
    }

    const record: SourceRecord = {
      url: entry.url,
      type: entry.type || 'url',
      label: entry.label,
      category: entry.category,
      firstVerified: entry.lastVerified || new Date(),
      lastVerified: entry.lastVerified || new Date(),
      lastStatus: 'stale',
      verificationCount: 0,
      failureCount: 0,
      consecutiveFailures: 0,
      history: [],
    };

    this.sources.set(entry.url, record);
    return record;
  }

  /**
   * Update source with verification result
   */
  updateSource(result: VerificationResult): SourceRecord {
    let record = this.sources.get(result.source);

    if (!record) {
      record = this.registerSource({
        url: result.source,
        type: result.type,
      });
    }

    // Determine status
    const status = result.isValid ? 'valid' : result.status === 'unreachable' ? 'unreachable' : 'invalid';
    const wasValid = record.lastStatus === 'valid';

    // Update record
    record.lastVerified = new Date();
    record.lastStatus = status;
    record.verificationCount++;

    if (!result.isValid) {
      record.failureCount++;
      record.consecutiveFailures++;
    } else {
      record.consecutiveFailures = 0;
    }

    // Update average response time
    if (result.responseTime) {
      if (record.averageResponseTime) {
        record.averageResponseTime =
          (record.averageResponseTime + result.responseTime) / 2;
      } else {
        record.averageResponseTime = result.responseTime;
      }
    }

    // Add to history
    record.history.push({
      timestamp: new Date(),
      status,
      responseTime: result.responseTime,
      errorMessage: result.errorMessage,
    });

    // Trim history
    if (record.history.length > this.config.historyLimit) {
      record.history = record.history.slice(-this.config.historyLimit);
    }

    // Generate alerts
    this.checkAndGenerateAlerts(record, wasValid);

    return record;
  }

  /**
   * Check source status and generate alerts
   */
  private checkAndGenerateAlerts(record: SourceRecord, wasValid: boolean): void {
    // Alert on new failure
    if (wasValid && record.lastStatus !== 'valid' && this.config.alertOnFailure) {
      const alert: FreshnessAlert = {
        type: 'new-failure',
        severity: 'warning',
        source: record.url,
        message: `Source ${record.url} has become unavailable`,
        timestamp: new Date(),
        details: {
          lastStatus: record.lastStatus,
        },
      };
      this.alerts.push(alert);
      this.emit('alert', alert);
    }

    // Alert on consecutive failures
    if (
      record.consecutiveFailures >= this.config.maxConsecutiveFailures &&
      this.config.alertOnFailure
    ) {
      const alert: FreshnessAlert = {
        type: 'failing',
        severity: 'error',
        source: record.url,
        message: `Source ${record.url} has failed ${record.consecutiveFailures} consecutive times`,
        timestamp: new Date(),
        details: {
          consecutiveFailures: record.consecutiveFailures,
          lastStatus: record.lastStatus,
        },
      };
      this.alerts.push(alert);
      this.emit('alert', alert);
    }

    // Alert on recovery
    if (!wasValid && record.lastStatus === 'valid') {
      const alert: FreshnessAlert = {
        type: 'recovered',
        severity: 'info',
        source: record.url,
        message: `Source ${record.url} has recovered and is now accessible`,
        timestamp: new Date(),
        details: {},
      };
      this.alerts.push(alert);
      this.emit('alert', alert);
    }
  }

  /**
   * Check if a source is stale (needs re-verification)
   */
  isStale(url: string): boolean {
    const record = this.sources.get(url);
    if (!record) return true;

    const maxAgeMs = this.config.maxAgeDays * 24 * 60 * 60 * 1000;
    return Date.now() - record.lastVerified.getTime() > maxAgeMs;
  }

  /**
   * Get all stale sources
   */
  getStaleSources(): SourceRecord[] {
    const maxAgeMs = this.config.maxAgeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    return Array.from(this.sources.values()).filter(
      record => now - record.lastVerified.getTime() > maxAgeMs
    );
  }

  /**
   * Get all failing sources
   */
  getFailingSources(): SourceRecord[] {
    return Array.from(this.sources.values()).filter(
      record => record.lastStatus !== 'valid'
    );
  }

  /**
   * Get sources due for check
   */
  getSourcesDueForCheck(): SourceRecord[] {
    const checkIntervalMs = this.config.checkIntervalHours * 60 * 60 * 1000;
    const now = Date.now();

    return Array.from(this.sources.values()).filter(
      record => now - record.lastVerified.getTime() > checkIntervalMs
    );
  }

  /**
   * Generate freshness report
   */
  generateReport(): FreshnessReport {
    const sources = Array.from(this.sources.values());
    const now = Date.now();
    const maxAgeMs = this.config.maxAgeDays * 24 * 60 * 60 * 1000;

    const staleSources = sources.filter(
      s => now - s.lastVerified.getTime() > maxAgeMs
    );
    const failingSources = sources.filter(s => s.lastStatus !== 'valid');
    const freshSources = sources.filter(
      s => now - s.lastVerified.getTime() <= maxAgeMs && s.lastStatus === 'valid'
    );

    // Calculate average freshness (days since last check)
    const averageFreshness =
      sources.length > 0
        ? sources.reduce(
            (sum, s) =>
              sum + (now - s.lastVerified.getTime()) / (24 * 60 * 60 * 1000),
            0
          ) / sources.length
        : 0;

    // Find oldest and newest
    const sortedByAge = [...sources].sort(
      (a, b) => a.lastVerified.getTime() - b.lastVerified.getTime()
    );

    // Generate stale alerts
    const staleAlerts: FreshnessAlert[] = staleSources.map(s => ({
      type: 'stale' as const,
      severity: 'warning' as const,
      source: s.url,
      message: `Source has not been verified in over ${this.config.maxAgeDays} days`,
      timestamp: new Date(),
      details: {
        daysSinceLastCheck: Math.floor(
          (now - s.lastVerified.getTime()) / (24 * 60 * 60 * 1000)
        ),
      },
    }));

    // Generate recommendations
    const recommendations: string[] = [];

    if (staleSources.length > 0) {
      recommendations.push(
        `${staleSources.length} source(s) need re-verification. Run verification on stale sources.`
      );
    }

    if (failingSources.length > 0) {
      recommendations.push(
        `${failingSources.length} source(s) are currently failing. Review and update broken links.`
      );
    }

    if (averageFreshness > this.config.maxAgeDays / 2) {
      recommendations.push(
        `Average source age (${averageFreshness.toFixed(1)} days) is high. Consider more frequent verification.`
      );
    }

    return {
      timestamp: new Date(),
      totalSources: sources.length,
      freshSources: freshSources.length,
      staleSources: staleSources.length,
      failingSources: failingSources.length,
      averageFreshness,
      oldestSource: sortedByAge[0],
      newestSource: sortedByAge[sortedByAge.length - 1],
      alerts: [...this.alerts, ...staleAlerts],
      recommendations,
    };
  }

  /**
   * Get source record
   */
  getSource(url: string): SourceRecord | undefined {
    return this.sources.get(url);
  }

  /**
   * Get all source records
   */
  getAllSources(): SourceRecord[] {
    return Array.from(this.sources.values());
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Export sources to JSON
   */
  exportSources(): string {
    return JSON.stringify(Array.from(this.sources.values()), null, 2);
  }

  /**
   * Import sources from JSON
   */
  importSources(json: string): void {
    const records: SourceRecord[] = JSON.parse(json);
    for (const record of records) {
      // Convert date strings back to Date objects
      record.firstVerified = new Date(record.firstVerified);
      record.lastVerified = new Date(record.lastVerified);
      record.history = record.history.map(h => ({
        ...h,
        timestamp: new Date(h.timestamp),
      }));
      this.sources.set(record.url, record);
    }
  }

  /**
   * Calculate uptime percentage for a source
   */
  calculateUptime(url: string): number {
    const record = this.sources.get(url);
    if (!record || record.verificationCount === 0) return 0;

    const successCount = record.verificationCount - record.failureCount;
    return (successCount / record.verificationCount) * 100;
  }

  /**
   * Get verification statistics
   */
  getStatistics(): {
    totalChecks: number;
    totalFailures: number;
    overallUptime: number;
    averageResponseTime: number;
  } {
    const sources = Array.from(this.sources.values());

    const totalChecks = sources.reduce(
      (sum, s) => sum + s.verificationCount,
      0
    );
    const totalFailures = sources.reduce((sum, s) => sum + s.failureCount, 0);
    const avgResponseTime =
      sources
        .filter(s => s.averageResponseTime)
        .reduce((sum, s) => sum + (s.averageResponseTime || 0), 0) /
      sources.filter(s => s.averageResponseTime).length;

    return {
      totalChecks,
      totalFailures,
      overallUptime:
        totalChecks > 0
          ? ((totalChecks - totalFailures) / totalChecks) * 100
          : 100,
      averageResponseTime: avgResponseTime || 0,
    };
  }
}

export default FreshnessMonitor;
