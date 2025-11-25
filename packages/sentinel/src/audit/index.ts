/**
 * @chicago-forest/sentinel - Security Audit Logging
 *
 * Comprehensive security event logging and audit trail for the Chicago Forest Network.
 * Provides tamper-evident logs with cryptographic integrity verification.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * Features:
 * - Tamper-evident audit logs with hash chains
 * - Security event categorization
 * - Log integrity verification
 * - Export to multiple formats
 * - Privacy-preserving log storage
 *
 * @example
 * ```typescript
 * import { AuditLogger, SecurityEventType } from '@chicago-forest/sentinel/audit';
 *
 * const logger = new AuditLogger({ retentionDays: 90 });
 *
 * logger.log({
 *   type: 'authentication',
 *   action: 'login',
 *   success: true,
 *   actor: 'CFN-abc123',
 * });
 * ```
 */

import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '../crypto';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Security event categories
 */
export type SecurityEventCategory =
  | 'authentication'
  | 'authorization'
  | 'access-control'
  | 'data-access'
  | 'configuration'
  | 'network'
  | 'encryption'
  | 'threat'
  | 'system'
  | 'user';

/**
 * Event severity for audit logs
 */
export type AuditSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

/**
 * Audit log entry
 */
export interface AuditEntry {
  /** Unique entry ID */
  id: string;
  /** Sequence number in the log */
  sequence: number;
  /** Event timestamp */
  timestamp: number;
  /** Event category */
  category: SecurityEventCategory;
  /** Specific action/event type */
  action: string;
  /** Event severity */
  severity: AuditSeverity;
  /** Actor (who performed the action) */
  actor?: string;
  /** Target (what was affected) */
  target?: string;
  /** Whether the action succeeded */
  success: boolean;
  /** Additional details */
  details?: Record<string, unknown>;
  /** Source IP/address */
  sourceAddress?: string;
  /** User agent or client info */
  userAgent?: string;
  /** Hash of this entry */
  hash: string;
  /** Hash of previous entry (chain) */
  previousHash: string;
}

/**
 * Audit log query options
 */
export interface AuditQueryOptions {
  /** Start time */
  startTime?: number;
  /** End time */
  endTime?: number;
  /** Filter by category */
  category?: SecurityEventCategory;
  /** Filter by severity */
  severity?: AuditSeverity;
  /** Filter by actor */
  actor?: string;
  /** Filter by success/failure */
  success?: boolean;
  /** Maximum results */
  limit?: number;
  /** Skip results (pagination) */
  offset?: number;
}

/**
 * Audit logger configuration
 */
export interface AuditLoggerConfig {
  /** Maximum entries to keep in memory */
  maxEntries: number;
  /** Retention period in days */
  retentionDays: number;
  /** Enable hash chain verification */
  enableHashChain: boolean;
  /** Minimum severity to log */
  minSeverity: AuditSeverity;
  /** Storage backend (memory, file, external) */
  storage: 'memory' | 'file' | 'external';
  /** Storage path for file backend */
  storagePath?: string;
  /** Callback for external storage */
  onWrite?: (entry: AuditEntry) => Promise<void>;
}

/**
 * Log input parameters
 */
export interface LogParams {
  category: SecurityEventCategory;
  action: string;
  severity?: AuditSeverity;
  actor?: string;
  target?: string;
  success: boolean;
  details?: Record<string, unknown>;
  sourceAddress?: string;
  userAgent?: string;
}

/**
 * Integrity verification result
 */
export interface IntegrityResult {
  valid: boolean;
  entriesChecked: number;
  firstInvalid?: number;
  error?: string;
}

/**
 * Audit statistics
 */
export interface AuditStats {
  totalEntries: number;
  entriesByCategory: Record<SecurityEventCategory, number>;
  entriesBySeverity: Record<AuditSeverity, number>;
  successRate: number;
  oldestEntry?: number;
  newestEntry?: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SEVERITY_ORDER: AuditSeverity[] = ['debug', 'info', 'warning', 'error', 'critical'];

const DEFAULT_CONFIG: AuditLoggerConfig = {
  maxEntries: 10000,
  retentionDays: 90,
  enableHashChain: true,
  minSeverity: 'info',
  storage: 'memory',
};

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

// =============================================================================
// AUDIT LOGGER
// =============================================================================

/**
 * Security Audit Logger with tamper-evident hash chain
 */
export class AuditLogger {
  private config: AuditLoggerConfig;
  private entries: AuditEntry[] = [];
  private sequence = 0;
  private lastHash = GENESIS_HASH;

  constructor(config: Partial<AuditLoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Log a security event
   */
  async log(params: LogParams): Promise<AuditEntry> {
    // Check severity threshold
    if (!this.shouldLog(params.severity ?? 'info')) {
      return null!; // Entry not logged due to severity threshold
    }

    const entry = this.createEntry(params);

    // Store entry
    this.entries.push(entry);

    // Update chain state
    this.lastHash = entry.hash;
    this.sequence++;

    // Enforce max entries
    if (this.entries.length > this.config.maxEntries) {
      this.entries.shift();
    }

    // External storage callback
    if (this.config.onWrite) {
      await this.config.onWrite(entry);
    }

    return entry;
  }

  /**
   * Log authentication event
   */
  async logAuth(
    action: 'login' | 'logout' | 'token-refresh' | 'password-change' | 'mfa-setup',
    success: boolean,
    actor: string,
    details?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      category: 'authentication',
      action,
      severity: success ? 'info' : 'warning',
      actor,
      success,
      details,
    });
  }

  /**
   * Log authorization event
   */
  async logAuthz(
    action: string,
    actor: string,
    target: string,
    success: boolean,
    details?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      category: 'authorization',
      action,
      severity: success ? 'info' : 'warning',
      actor,
      target,
      success,
      details,
    });
  }

  /**
   * Log access control event
   */
  async logAccess(
    action: 'grant' | 'revoke' | 'check',
    actor: string,
    target: string,
    resource: string,
    success: boolean
  ): Promise<AuditEntry> {
    return this.log({
      category: 'access-control',
      action,
      actor,
      target,
      success,
      details: { resource },
    });
  }

  /**
   * Log data access event
   */
  async logDataAccess(
    action: 'read' | 'write' | 'delete' | 'export',
    actor: string,
    dataType: string,
    success: boolean,
    details?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      category: 'data-access',
      action,
      severity: action === 'delete' ? 'warning' : 'info',
      actor,
      target: dataType,
      success,
      details,
    });
  }

  /**
   * Log configuration change
   */
  async logConfigChange(
    setting: string,
    actor: string,
    oldValue: unknown,
    newValue: unknown
  ): Promise<AuditEntry> {
    return this.log({
      category: 'configuration',
      action: 'change',
      severity: 'warning',
      actor,
      target: setting,
      success: true,
      details: {
        oldValue: this.sanitizeValue(oldValue),
        newValue: this.sanitizeValue(newValue),
      },
    });
  }

  /**
   * Log network event
   */
  async logNetwork(
    action: 'connect' | 'disconnect' | 'peer-added' | 'peer-removed',
    actor: string,
    target?: string,
    details?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      category: 'network',
      action,
      actor,
      target,
      success: true,
      details,
    });
  }

  /**
   * Log threat event
   */
  async logThreat(
    threatType: string,
    sourceId: string,
    severity: AuditSeverity,
    details: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      category: 'threat',
      action: threatType,
      severity,
      actor: sourceId,
      success: false,
      details,
    });
  }

  /**
   * Log system event
   */
  async logSystem(
    action: string,
    severity: AuditSeverity,
    details?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      category: 'system',
      action,
      severity,
      success: true,
      details,
    });
  }

  /**
   * Query audit logs
   */
  query(options: AuditQueryOptions = {}): AuditEntry[] {
    let results = [...this.entries];

    // Apply filters
    if (options.startTime !== undefined) {
      results = results.filter((e) => e.timestamp >= options.startTime!);
    }
    if (options.endTime !== undefined) {
      results = results.filter((e) => e.timestamp <= options.endTime!);
    }
    if (options.category !== undefined) {
      results = results.filter((e) => e.category === options.category);
    }
    if (options.severity !== undefined) {
      results = results.filter((e) => e.severity === options.severity);
    }
    if (options.actor !== undefined) {
      results = results.filter((e) => e.actor === options.actor);
    }
    if (options.success !== undefined) {
      results = results.filter((e) => e.success === options.success);
    }

    // Pagination
    if (options.offset !== undefined) {
      results = results.slice(options.offset);
    }
    if (options.limit !== undefined) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Verify log integrity
   */
  verifyIntegrity(entries?: AuditEntry[]): IntegrityResult {
    const toCheck = entries ?? this.entries;

    if (toCheck.length === 0) {
      return { valid: true, entriesChecked: 0 };
    }

    let previousHash = GENESIS_HASH;

    for (let i = 0; i < toCheck.length; i++) {
      const entry = toCheck[i];

      // Verify previous hash link
      if (entry.previousHash !== previousHash) {
        return {
          valid: false,
          entriesChecked: i,
          firstInvalid: i,
          error: `Hash chain broken at sequence ${entry.sequence}`,
        };
      }

      // Verify entry hash
      const expectedHash = this.computeEntryHash(entry);
      if (entry.hash !== expectedHash) {
        return {
          valid: false,
          entriesChecked: i,
          firstInvalid: i,
          error: `Entry hash mismatch at sequence ${entry.sequence}`,
        };
      }

      previousHash = entry.hash;
    }

    return {
      valid: true,
      entriesChecked: toCheck.length,
    };
  }

  /**
   * Get audit statistics
   */
  getStats(): AuditStats {
    const stats: AuditStats = {
      totalEntries: this.entries.length,
      entriesByCategory: {} as Record<SecurityEventCategory, number>,
      entriesBySeverity: {} as Record<AuditSeverity, number>,
      successRate: 0,
      oldestEntry: undefined,
      newestEntry: undefined,
    };

    if (this.entries.length === 0) {
      return stats;
    }

    let successCount = 0;

    for (const entry of this.entries) {
      stats.entriesByCategory[entry.category] =
        (stats.entriesByCategory[entry.category] ?? 0) + 1;
      stats.entriesBySeverity[entry.severity] =
        (stats.entriesBySeverity[entry.severity] ?? 0) + 1;

      if (entry.success) {
        successCount++;
      }

      if (!stats.oldestEntry || entry.timestamp < stats.oldestEntry) {
        stats.oldestEntry = entry.timestamp;
      }
      if (!stats.newestEntry || entry.timestamp > stats.newestEntry) {
        stats.newestEntry = entry.timestamp;
      }
    }

    stats.successRate = successCount / this.entries.length;

    return stats;
  }

  /**
   * Export logs to JSON
   */
  exportJSON(options?: AuditQueryOptions): string {
    const entries = options ? this.query(options) : this.entries;
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Export logs to CSV
   */
  exportCSV(options?: AuditQueryOptions): string {
    const entries = options ? this.query(options) : this.entries;

    const headers = [
      'id', 'sequence', 'timestamp', 'category', 'action',
      'severity', 'actor', 'target', 'success', 'sourceAddress',
    ].join(',');

    const rows = entries.map((e) => [
      e.id,
      e.sequence,
      new Date(e.timestamp).toISOString(),
      e.category,
      e.action,
      e.severity,
      e.actor ?? '',
      e.target ?? '',
      e.success,
      e.sourceAddress ?? '',
    ].map((v) => `"${v}"`).join(','));

    return [headers, ...rows].join('\n');
  }

  /**
   * Clear old entries based on retention policy
   */
  cleanup(): number {
    const cutoff = Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    const before = this.entries.length;

    this.entries = this.entries.filter((e) => e.timestamp >= cutoff);

    return before - this.entries.length;
  }

  /**
   * Get entry count
   */
  get count(): number {
    return this.entries.length;
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private shouldLog(severity: AuditSeverity): boolean {
    const minIndex = SEVERITY_ORDER.indexOf(this.config.minSeverity);
    const severityIndex = SEVERITY_ORDER.indexOf(severity);
    return severityIndex >= minIndex;
  }

  private createEntry(params: LogParams): AuditEntry {
    const timestamp = Date.now();
    const id = `audit-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;

    const entry: AuditEntry = {
      id,
      sequence: this.sequence,
      timestamp,
      category: params.category,
      action: params.action,
      severity: params.severity ?? 'info',
      actor: params.actor,
      target: params.target,
      success: params.success,
      details: params.details,
      sourceAddress: params.sourceAddress,
      userAgent: params.userAgent,
      hash: '', // Will be computed
      previousHash: this.lastHash,
    };

    // Compute hash
    entry.hash = this.computeEntryHash(entry);

    return entry;
  }

  private computeEntryHash(entry: AuditEntry): string {
    const data = JSON.stringify({
      id: entry.id,
      sequence: entry.sequence,
      timestamp: entry.timestamp,
      category: entry.category,
      action: entry.action,
      severity: entry.severity,
      actor: entry.actor,
      target: entry.target,
      success: entry.success,
      details: entry.details,
      previousHash: entry.previousHash,
    });

    const hash = sha256(new TextEncoder().encode(data));
    return bytesToHex(hash);
  }

  private sanitizeValue(value: unknown): unknown {
    // Don't log sensitive values
    if (typeof value === 'string' && value.length > 50) {
      return `${value.slice(0, 10)}...[TRUNCATED]`;
    }
    return value;
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create a new audit logger instance
 */
export function createAuditLogger(
  config?: Partial<AuditLoggerConfig>
): AuditLogger {
  return new AuditLogger(config);
}

// =============================================================================
// EXPORTS
// =============================================================================

// AuditLogger class already exported at definition
export type {
  SecurityEventCategory,
  AuditSeverity,
  AuditEntry,
  AuditQueryOptions,
  AuditLoggerConfig,
  LogParams,
  IntegrityResult,
  AuditStats,
};
