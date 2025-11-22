/**
 * @chicago-forest/sentinel
 *
 * Sentinel - Security Orchestration, Threat Detection & Privacy Protection
 * for the Chicago Forest Network.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * This package provides comprehensive security capabilities:
 *
 * 1. **Cryptographic Primitives** - Encryption, key exchange, hashing
 * 2. **Threat Detection** - Intrusion monitoring, anomaly detection
 * 3. **Audit Logging** - Tamper-evident security event logging
 * 4. **Privacy Protection** - PII detection, anonymization, consent management
 *
 * @example
 * ```typescript
 * import {
 *   Sentinel,
 *   ThreatMonitor,
 *   AuditLogger,
 *   PrivacyGuard,
 * } from '@chicago-forest/sentinel';
 *
 * // Create unified security controller
 * const sentinel = new Sentinel({
 *   enableThreatDetection: true,
 *   enableAuditLogging: true,
 *   enablePrivacyProtection: true,
 * });
 *
 * await sentinel.start();
 * ```
 *
 * @packageDocumentation
 */

// Re-export all crypto utilities
export {
  // Functions
  encrypt,
  decrypt,
  encryptToBase64,
  decryptFromBase64,
  generateSecretKey,
  generateNonce,
  generateSalt,
  hashSha256,
  hashSha512,
  hashHex,
  deriveKey,
  deriveMultipleKeys,
  generateX25519PrivateKey,
  deriveX25519PublicKey,
  x25519SharedSecret,
  deriveSharedEncryptionKey,
  secureRandomBytes,
  concatBytes,
  constantTimeEqual,
  bytesToHex,
  hexToBytes,
  bytesToBase64,
  base64ToBytes,
  wipeKey,
  // Constants
  CHACHA_NONCE_SIZE,
  CHACHA_KEY_SIZE,
  CHACHA_TAG_SIZE,
  X25519_PRIVATE_KEY_SIZE,
  X25519_PUBLIC_KEY_SIZE,
  // Types
  type EncryptedData,
  type KeyDerivationParams,
  type EncryptOptions,
} from './crypto';

// Re-export all threat detection
export {
  ThreatMonitor,
  type ThreatLevel,
  type ThreatType,
  type ThreatEvent,
  type ThreatEvidence,
  type DetectionRule,
  type PeerReputation,
  type RateLimitBucket,
  type ThreatMonitorConfig,
  type ThreatMonitorEvents,
} from './threat';

// Re-export all audit logging
export {
  AuditLogger,
  createAuditLogger,
  type SecurityEventCategory,
  type AuditSeverity,
  type AuditEntry,
  type AuditQueryOptions,
  type AuditLoggerConfig,
  type LogParams,
  type IntegrityResult,
  type AuditStats,
} from './audit';

// Re-export all privacy utilities
export {
  PrivacyGuard,
  detectPII,
  anonymizeData,
  scrubPII,
  generatePrivacyId,
  type PIIType,
  type PIIDetection,
  type AnonymizationMethod,
  type AnonymizationOptions,
  type PrivacyGuardConfig,
  type RetentionPolicy,
  type ConsentRecord,
  type PrivacyReport,
} from './privacy';

import EventEmitter from 'eventemitter3';
import { ThreatMonitor, type ThreatMonitorConfig, type ThreatEvent } from './threat';
import { AuditLogger, type AuditLoggerConfig, type AuditEntry } from './audit';
import { PrivacyGuard, type PrivacyGuardConfig } from './privacy';

// =============================================================================
// SENTINEL CONTROLLER
// =============================================================================

/**
 * Sentinel configuration
 */
export interface SentinelConfig {
  /** Enable threat detection module */
  enableThreatDetection: boolean;
  /** Enable audit logging module */
  enableAuditLogging: boolean;
  /** Enable privacy protection module */
  enablePrivacyProtection: boolean;
  /** Threat monitor configuration */
  threatConfig?: Partial<ThreatMonitorConfig>;
  /** Audit logger configuration */
  auditConfig?: Partial<AuditLoggerConfig>;
  /** Privacy guard configuration */
  privacyConfig?: Partial<PrivacyGuardConfig>;
}

/**
 * Sentinel events
 */
export interface SentinelEvents {
  'started': () => void;
  'stopped': () => void;
  'threat': (event: ThreatEvent) => void;
  'audit': (entry: AuditEntry) => void;
  'error': (error: Error) => void;
}

/**
 * Sentinel status
 */
export interface SentinelStatus {
  running: boolean;
  uptime: number;
  threatMonitor: {
    enabled: boolean;
    totalThreats: number;
    blockedPeers: number;
  };
  auditLogger: {
    enabled: boolean;
    totalEntries: number;
    integrityValid: boolean;
  };
  privacyGuard: {
    enabled: boolean;
    piiDetected: number;
  };
}

const DEFAULT_SENTINEL_CONFIG: SentinelConfig = {
  enableThreatDetection: true,
  enableAuditLogging: true,
  enablePrivacyProtection: true,
};

/**
 * Sentinel - Unified Security Controller
 *
 * The Sentinel class provides a unified interface for all security
 * capabilities of the Chicago Forest Network.
 */
export class Sentinel extends EventEmitter<SentinelEvents> {
  private config: SentinelConfig;
  private threatMonitor?: ThreatMonitor;
  private auditLogger?: AuditLogger;
  private privacyGuard?: PrivacyGuard;
  private running = false;
  private startTime?: number;
  private piiDetectedCount = 0;

  constructor(config: Partial<SentinelConfig> = {}) {
    super();
    this.config = { ...DEFAULT_SENTINEL_CONFIG, ...config };

    // Initialize components
    if (this.config.enableThreatDetection) {
      this.threatMonitor = new ThreatMonitor(this.config.threatConfig);

      // Forward threat events
      this.threatMonitor.on('threat:detected', (event) => {
        this.emit('threat', event);

        // Log to audit
        if (this.auditLogger) {
          this.auditLogger.logThreat(
            event.type,
            event.sourceId,
            event.level === 'critical' ? 'critical' : 'warning',
            { eventId: event.id, description: event.description }
          );
        }
      });
    }

    if (this.config.enableAuditLogging) {
      this.auditLogger = new AuditLogger({
        ...this.config.auditConfig,
        onWrite: async (entry) => {
          this.emit('audit', entry);
          if (this.config.auditConfig?.onWrite) {
            await this.config.auditConfig.onWrite(entry);
          }
        },
      });
    }

    if (this.config.enablePrivacyProtection) {
      this.privacyGuard = new PrivacyGuard(this.config.privacyConfig);
    }
  }

  /**
   * Start all security services
   */
  async start(): Promise<void> {
    if (this.running) return;

    if (this.threatMonitor) {
      await this.threatMonitor.start();
    }

    this.running = true;
    this.startTime = Date.now();

    // Log startup
    if (this.auditLogger) {
      await this.auditLogger.logSystem('sentinel-started', 'info', {
        threatDetection: this.config.enableThreatDetection,
        auditLogging: this.config.enableAuditLogging,
        privacyProtection: this.config.enablePrivacyProtection,
      });
    }

    this.emit('started');
  }

  /**
   * Stop all security services
   */
  async stop(): Promise<void> {
    if (!this.running) return;

    if (this.threatMonitor) {
      await this.threatMonitor.stop();
    }

    // Log shutdown
    if (this.auditLogger) {
      await this.auditLogger.logSystem('sentinel-stopped', 'info', {
        uptime: Date.now() - (this.startTime ?? 0),
      });
    }

    this.running = false;
    this.startTime = undefined;

    this.emit('stopped');
  }

  /**
   * Get current status
   */
  getStatus(): SentinelStatus {
    const threatStats = this.threatMonitor?.getStats();
    const auditStats = this.auditLogger?.getStats();
    const auditIntegrity = this.auditLogger?.verifyIntegrity();

    return {
      running: this.running,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      threatMonitor: {
        enabled: !!this.threatMonitor,
        totalThreats: threatStats?.totalThreats ?? 0,
        blockedPeers: threatStats?.blockedPeers ?? 0,
      },
      auditLogger: {
        enabled: !!this.auditLogger,
        totalEntries: auditStats?.totalEntries ?? 0,
        integrityValid: auditIntegrity?.valid ?? true,
      },
      privacyGuard: {
        enabled: !!this.privacyGuard,
        piiDetected: this.piiDetectedCount,
      },
    };
  }

  /**
   * Access the threat monitor
   */
  get threats(): ThreatMonitor | undefined {
    return this.threatMonitor;
  }

  /**
   * Access the audit logger
   */
  get audit(): AuditLogger | undefined {
    return this.auditLogger;
  }

  /**
   * Access the privacy guard
   */
  get privacy(): PrivacyGuard | undefined {
    return this.privacyGuard;
  }

  /**
   * Process a security event
   */
  processEvent(event: {
    type: string;
    sourceId: string;
    targetId?: string;
    data?: unknown;
    signature?: string;
  }): ThreatEvent | null {
    if (!this.threatMonitor) return null;
    return this.threatMonitor.processEvent(event);
  }

  /**
   * Scrub PII from text
   */
  scrubPII(text: string): string {
    if (!this.privacyGuard) return text;

    const detections = this.privacyGuard.detectPII(text);
    this.piiDetectedCount += detections.length;

    return this.privacyGuard.scrub(text);
  }

  /**
   * Log a security event
   */
  async log(params: {
    category: 'authentication' | 'authorization' | 'access-control' | 'data-access' | 'network' | 'system';
    action: string;
    actor?: string;
    target?: string;
    success: boolean;
    details?: Record<string, unknown>;
  }): Promise<AuditEntry | undefined> {
    if (!this.auditLogger) return undefined;
    return this.auditLogger.log(params);
  }

  /**
   * Check if a node is blocked
   */
  isBlocked(nodeId: string): boolean {
    return this.threatMonitor?.isBlocked(nodeId) ?? false;
  }

  /**
   * Block a node
   */
  blockNode(nodeId: string, reason: string, duration?: number): void {
    this.threatMonitor?.blockNode(nodeId, reason, duration);
  }

  /**
   * Unblock a node
   */
  unblockNode(nodeId: string): void {
    this.threatMonitor?.unblockNode(nodeId);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { Sentinel };
export type { SentinelConfig, SentinelEvents, SentinelStatus };
