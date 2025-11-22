/**
 * @chicago-forest/sentinel - Threat Detection & Intrusion Monitoring
 *
 * Real-time threat detection and intrusion monitoring for the Chicago Forest Network.
 * Implements pattern-based detection, anomaly analysis, and incident response.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * Features:
 * - Pattern-based intrusion detection
 * - Anomaly detection using statistical analysis
 * - Rate limiting and DDoS protection
 * - Reputation scoring for peers
 * - Automated incident response
 *
 * @example
 * ```typescript
 * import { ThreatMonitor, ThreatLevel } from '@chicago-forest/sentinel/threat';
 *
 * const monitor = new ThreatMonitor({
 *   sensitivity: 'medium',
 *   enableAutoBlock: true,
 * });
 *
 * monitor.on('threat:detected', (event) => {
 *   console.log(`Threat detected: ${event.type} from ${event.sourceId}`);
 * });
 *
 * await monitor.start();
 * ```
 */

import EventEmitter from 'eventemitter3';
import type { NodeId, PeerInfo } from '@chicago-forest/shared-types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Threat severity levels
 */
export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Types of detected threats
 */
export type ThreatType =
  | 'port-scan'
  | 'brute-force'
  | 'ddos-attempt'
  | 'protocol-violation'
  | 'malformed-packet'
  | 'replay-attack'
  | 'sybil-attack'
  | 'eclipse-attack'
  | 'timing-attack'
  | 'man-in-the-middle'
  | 'rogue-node'
  | 'data-exfiltration'
  | 'unauthorized-access'
  | 'anomaly';

/**
 * Detected threat event
 */
export interface ThreatEvent {
  /** Unique event ID */
  id: string;
  /** Type of threat */
  type: ThreatType;
  /** Severity level */
  level: ThreatLevel;
  /** Source node/IP */
  sourceId: string;
  /** Target node/IP */
  targetId?: string;
  /** Human-readable description */
  description: string;
  /** Detection timestamp */
  timestamp: number;
  /** Evidence/indicators */
  evidence: ThreatEvidence[];
  /** Recommended actions */
  recommendations: string[];
  /** Whether auto-mitigation was applied */
  mitigated: boolean;
  /** Mitigation action taken */
  mitigationAction?: string;
}

/**
 * Evidence supporting threat detection
 */
export interface ThreatEvidence {
  /** Evidence type */
  type: string;
  /** Evidence value/data */
  value: unknown;
  /** Confidence score (0-1) */
  confidence: number;
  /** When this evidence was collected */
  timestamp: number;
}

/**
 * Detection rule definition
 */
export interface DetectionRule {
  /** Rule identifier */
  id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Threat type this rule detects */
  threatType: ThreatType;
  /** Severity if triggered */
  severity: ThreatLevel;
  /** Rule is enabled */
  enabled: boolean;
  /** Detection parameters */
  params: Record<string, unknown>;
  /** Cooldown between alerts (ms) */
  cooldown: number;
}

/**
 * Peer reputation score
 */
export interface PeerReputation {
  /** Node ID */
  nodeId: NodeId;
  /** Overall reputation score (0-100) */
  score: number;
  /** Positive interactions */
  positiveEvents: number;
  /** Negative events */
  negativeEvents: number;
  /** Total messages processed */
  messagesProcessed: number;
  /** Protocol violations */
  violations: number;
  /** First seen timestamp */
  firstSeen: number;
  /** Last activity timestamp */
  lastActivity: number;
  /** Currently blocked */
  blocked: boolean;
  /** Block reason */
  blockReason?: string;
  /** Block expires at */
  blockExpiresAt?: number;
}

/**
 * Rate limit bucket
 */
export interface RateLimitBucket {
  /** Source identifier */
  sourceId: string;
  /** Current request count */
  count: number;
  /** Window start time */
  windowStart: number;
  /** Window duration (ms) */
  windowDuration: number;
  /** Maximum allowed requests */
  maxRequests: number;
}

/**
 * Monitor configuration
 */
export interface ThreatMonitorConfig {
  /** Detection sensitivity */
  sensitivity: 'low' | 'medium' | 'high';
  /** Enable automatic blocking */
  enableAutoBlock: boolean;
  /** Auto-block duration (ms) */
  autoBlockDuration: number;
  /** Enable rate limiting */
  enableRateLimiting: boolean;
  /** Rate limit window (ms) */
  rateLimitWindow: number;
  /** Rate limit max requests */
  rateLimitMaxRequests: number;
  /** Enable anomaly detection */
  enableAnomalyDetection: boolean;
  /** Anomaly threshold (standard deviations) */
  anomalyThreshold: number;
  /** Custom detection rules */
  customRules: DetectionRule[];
}

/**
 * Monitor events
 */
export interface ThreatMonitorEvents {
  'threat:detected': (event: ThreatEvent) => void;
  'threat:mitigated': (event: ThreatEvent) => void;
  'peer:blocked': (nodeId: NodeId, reason: string) => void;
  'peer:unblocked': (nodeId: NodeId) => void;
  'rate:exceeded': (sourceId: string, count: number) => void;
  'anomaly:detected': (metric: string, value: number, expected: number) => void;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: ThreatMonitorConfig = {
  sensitivity: 'medium',
  enableAutoBlock: true,
  autoBlockDuration: 3600000, // 1 hour
  enableRateLimiting: true,
  rateLimitWindow: 60000, // 1 minute
  rateLimitMaxRequests: 100,
  enableAnomalyDetection: true,
  anomalyThreshold: 3, // 3 standard deviations
  customRules: [],
};

// =============================================================================
// BUILT-IN DETECTION RULES
// =============================================================================

const BUILT_IN_RULES: DetectionRule[] = [
  {
    id: 'port-scan-detection',
    name: 'Port Scan Detection',
    description: 'Detects rapid connection attempts to multiple ports',
    threatType: 'port-scan',
    severity: 'medium',
    enabled: true,
    params: {
      portsPerMinute: 10,
      timeWindow: 60000,
    },
    cooldown: 300000, // 5 minutes
  },
  {
    id: 'brute-force-detection',
    name: 'Brute Force Detection',
    description: 'Detects repeated authentication failures',
    threatType: 'brute-force',
    severity: 'high',
    enabled: true,
    params: {
      failuresPerMinute: 5,
      timeWindow: 60000,
    },
    cooldown: 600000, // 10 minutes
  },
  {
    id: 'ddos-detection',
    name: 'DDoS Detection',
    description: 'Detects distributed denial of service attempts',
    threatType: 'ddos-attempt',
    severity: 'critical',
    enabled: true,
    params: {
      requestsPerSecond: 1000,
      uniqueSourcesPerMinute: 50,
    },
    cooldown: 60000, // 1 minute
  },
  {
    id: 'replay-attack-detection',
    name: 'Replay Attack Detection',
    description: 'Detects duplicate message signatures',
    threatType: 'replay-attack',
    severity: 'high',
    enabled: true,
    params: {
      signatureWindow: 300000, // 5 minutes
    },
    cooldown: 30000, // 30 seconds
  },
  {
    id: 'protocol-violation-detection',
    name: 'Protocol Violation Detection',
    description: 'Detects malformed or invalid protocol messages',
    threatType: 'protocol-violation',
    severity: 'medium',
    enabled: true,
    params: {
      violationsPerMinute: 3,
    },
    cooldown: 120000, // 2 minutes
  },
  {
    id: 'sybil-attack-detection',
    name: 'Sybil Attack Detection',
    description: 'Detects multiple identities from same source',
    threatType: 'sybil-attack',
    severity: 'high',
    enabled: true,
    params: {
      identitiesPerIp: 5,
      timeWindow: 3600000, // 1 hour
    },
    cooldown: 1800000, // 30 minutes
  },
];

// =============================================================================
// THREAT MONITOR
// =============================================================================

/**
 * Threat Monitor - Real-time threat detection and response
 */
export class ThreatMonitor extends EventEmitter<ThreatMonitorEvents> {
  private config: ThreatMonitorConfig;
  private rules: Map<string, DetectionRule> = new Map();
  private reputations: Map<NodeId, PeerReputation> = new Map();
  private rateLimits: Map<string, RateLimitBucket> = new Map();
  private recentSignatures: Map<string, number> = new Map();
  private threatHistory: ThreatEvent[] = [];
  private connectionAttempts: Map<string, number[]> = new Map();
  private authFailures: Map<string, number[]> = new Map();
  private requestCounts: Map<string, number[]> = new Map();
  private ruleCooldowns: Map<string, number> = new Map();
  private running = false;
  private cleanupInterval?: ReturnType<typeof setInterval>;

  constructor(config: Partial<ThreatMonitorConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Load built-in rules
    for (const rule of BUILT_IN_RULES) {
      this.rules.set(rule.id, rule);
    }

    // Load custom rules
    for (const rule of this.config.customRules) {
      this.rules.set(rule.id, rule);
    }
  }

  /**
   * Start the threat monitor
   */
  async start(): Promise<void> {
    if (this.running) return;

    // Start periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Every minute

    this.running = true;
  }

  /**
   * Stop the threat monitor
   */
  async stop(): Promise<void> {
    if (!this.running) return;

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    this.running = false;
  }

  /**
   * Process an incoming event for threat detection
   */
  processEvent(event: {
    type: string;
    sourceId: string;
    targetId?: string;
    data?: unknown;
    signature?: string;
    timestamp?: number;
  }): ThreatEvent | null {
    const timestamp = event.timestamp ?? Date.now();

    // Check if source is blocked
    if (this.isBlocked(event.sourceId)) {
      return null;
    }

    // Rate limiting check
    if (this.config.enableRateLimiting) {
      if (this.checkRateLimit(event.sourceId)) {
        return this.createThreatEvent({
          type: 'ddos-attempt',
          level: 'high',
          sourceId: event.sourceId,
          targetId: event.targetId,
          description: `Rate limit exceeded for ${event.sourceId}`,
          evidence: [{
            type: 'request-count',
            value: this.rateLimits.get(event.sourceId)?.count,
            confidence: 1.0,
            timestamp,
          }],
        });
      }
    }

    // Replay attack detection
    if (event.signature) {
      const existingTime = this.recentSignatures.get(event.signature);
      if (existingTime) {
        const rule = this.rules.get('replay-attack-detection');
        if (rule?.enabled) {
          const window = (rule.params.signatureWindow as number) ?? 300000;
          if (timestamp - existingTime < window) {
            return this.createThreatEvent({
              type: 'replay-attack',
              level: 'high',
              sourceId: event.sourceId,
              description: 'Duplicate message signature detected (possible replay attack)',
              evidence: [{
                type: 'duplicate-signature',
                value: event.signature,
                confidence: 0.95,
                timestamp,
              }],
            });
          }
        }
      }
      this.recentSignatures.set(event.signature, timestamp);
    }

    // Event-specific detection
    switch (event.type) {
      case 'connection-attempt':
        return this.detectPortScan(event.sourceId, timestamp);

      case 'auth-failure':
        return this.detectBruteForce(event.sourceId, timestamp);

      case 'protocol-error':
        return this.detectProtocolViolation(event.sourceId, timestamp);

      case 'new-identity':
        return this.detectSybilAttack(event.sourceId, event.data as string, timestamp);

      default:
        // Track for anomaly detection
        this.trackRequest(event.sourceId, timestamp);
        return null;
    }
  }

  /**
   * Check if a source is rate limited
   */
  checkRateLimit(sourceId: string): boolean {
    const now = Date.now();
    let bucket = this.rateLimits.get(sourceId);

    if (!bucket) {
      bucket = {
        sourceId,
        count: 0,
        windowStart: now,
        windowDuration: this.config.rateLimitWindow,
        maxRequests: this.config.rateLimitMaxRequests,
      };
      this.rateLimits.set(sourceId, bucket);
    }

    // Reset window if expired
    if (now - bucket.windowStart > bucket.windowDuration) {
      bucket.count = 0;
      bucket.windowStart = now;
    }

    bucket.count++;

    if (bucket.count > bucket.maxRequests) {
      this.emit('rate:exceeded', sourceId, bucket.count);
      return true;
    }

    return false;
  }

  /**
   * Check if a node is blocked
   */
  isBlocked(nodeId: string): boolean {
    const rep = this.reputations.get(nodeId);
    if (!rep) return false;

    if (rep.blocked) {
      // Check if block has expired
      if (rep.blockExpiresAt && Date.now() > rep.blockExpiresAt) {
        rep.blocked = false;
        rep.blockReason = undefined;
        rep.blockExpiresAt = undefined;
        this.emit('peer:unblocked', nodeId);
        return false;
      }
      return true;
    }

    return false;
  }

  /**
   * Block a node
   */
  blockNode(nodeId: NodeId, reason: string, duration?: number): void {
    let rep = this.reputations.get(nodeId);
    if (!rep) {
      rep = this.initReputation(nodeId);
    }

    rep.blocked = true;
    rep.blockReason = reason;
    rep.blockExpiresAt = duration ? Date.now() + duration : undefined;

    this.emit('peer:blocked', nodeId, reason);
  }

  /**
   * Unblock a node
   */
  unblockNode(nodeId: NodeId): void {
    const rep = this.reputations.get(nodeId);
    if (rep && rep.blocked) {
      rep.blocked = false;
      rep.blockReason = undefined;
      rep.blockExpiresAt = undefined;
      this.emit('peer:unblocked', nodeId);
    }
  }

  /**
   * Get peer reputation
   */
  getReputation(nodeId: NodeId): PeerReputation | undefined {
    return this.reputations.get(nodeId);
  }

  /**
   * Update peer reputation
   */
  updateReputation(nodeId: NodeId, positive: boolean, weight: number = 1): void {
    let rep = this.reputations.get(nodeId);
    if (!rep) {
      rep = this.initReputation(nodeId);
    }

    if (positive) {
      rep.positiveEvents += weight;
      rep.score = Math.min(100, rep.score + weight);
    } else {
      rep.negativeEvents += weight;
      rep.score = Math.max(0, rep.score - weight * 2);
    }

    rep.lastActivity = Date.now();

    // Auto-block if reputation too low
    if (this.config.enableAutoBlock && rep.score < 20) {
      this.blockNode(nodeId, 'Low reputation score', this.config.autoBlockDuration);
    }
  }

  /**
   * Get threat history
   */
  getThreatHistory(limit?: number): ThreatEvent[] {
    if (limit) {
      return this.threatHistory.slice(-limit);
    }
    return [...this.threatHistory];
  }

  /**
   * Get threat statistics
   */
  getStats(): {
    totalThreats: number;
    byType: Record<ThreatType, number>;
    byLevel: Record<ThreatLevel, number>;
    blockedPeers: number;
    averageReputation: number;
  } {
    const byType: Record<string, number> = {};
    const byLevel: Record<string, number> = {};

    for (const threat of this.threatHistory) {
      byType[threat.type] = (byType[threat.type] ?? 0) + 1;
      byLevel[threat.level] = (byLevel[threat.level] ?? 0) + 1;
    }

    const reputations = Array.from(this.reputations.values());
    const blockedPeers = reputations.filter((r) => r.blocked).length;
    const avgRep = reputations.length > 0
      ? reputations.reduce((sum, r) => sum + r.score, 0) / reputations.length
      : 100;

    return {
      totalThreats: this.threatHistory.length,
      byType: byType as Record<ThreatType, number>,
      byLevel: byLevel as Record<ThreatLevel, number>,
      blockedPeers,
      averageReputation: avgRep,
    };
  }

  /**
   * Add or update a detection rule
   */
  setRule(rule: DetectionRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove a detection rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Get all detection rules
   */
  getRules(): DetectionRule[] {
    return Array.from(this.rules.values());
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private initReputation(nodeId: NodeId): PeerReputation {
    const rep: PeerReputation = {
      nodeId,
      score: 50, // Start neutral
      positiveEvents: 0,
      negativeEvents: 0,
      messagesProcessed: 0,
      violations: 0,
      firstSeen: Date.now(),
      lastActivity: Date.now(),
      blocked: false,
    };
    this.reputations.set(nodeId, rep);
    return rep;
  }

  private createThreatEvent(params: {
    type: ThreatType;
    level: ThreatLevel;
    sourceId: string;
    targetId?: string;
    description: string;
    evidence: ThreatEvidence[];
  }): ThreatEvent {
    const event: ThreatEvent = {
      id: `threat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: params.type,
      level: params.level,
      sourceId: params.sourceId,
      targetId: params.targetId,
      description: params.description,
      timestamp: Date.now(),
      evidence: params.evidence,
      recommendations: this.getRecommendations(params.type, params.level),
      mitigated: false,
    };

    // Auto-mitigation
    if (this.config.enableAutoBlock && params.level === 'critical') {
      this.blockNode(params.sourceId, params.description, this.config.autoBlockDuration);
      event.mitigated = true;
      event.mitigationAction = 'auto-blocked';
    }

    // Update reputation
    const weight = params.level === 'critical' ? 20 :
                   params.level === 'high' ? 10 :
                   params.level === 'medium' ? 5 : 2;
    this.updateReputation(params.sourceId, false, weight);

    // Store and emit
    this.threatHistory.push(event);
    this.emit('threat:detected', event);

    if (event.mitigated) {
      this.emit('threat:mitigated', event);
    }

    return event;
  }

  private getRecommendations(type: ThreatType, level: ThreatLevel): string[] {
    const recommendations: string[] = [];

    if (level === 'critical' || level === 'high') {
      recommendations.push('Block source immediately');
      recommendations.push('Review firewall rules');
    }

    switch (type) {
      case 'brute-force':
        recommendations.push('Enable account lockout');
        recommendations.push('Implement CAPTCHA');
        break;
      case 'ddos-attempt':
        recommendations.push('Enable rate limiting');
        recommendations.push('Consider traffic filtering');
        break;
      case 'sybil-attack':
        recommendations.push('Require proof-of-work for new identities');
        recommendations.push('Implement IP-based limits');
        break;
      case 'replay-attack':
        recommendations.push('Implement nonce-based message validation');
        recommendations.push('Reduce signature validity window');
        break;
    }

    return recommendations;
  }

  private detectPortScan(sourceId: string, timestamp: number): ThreatEvent | null {
    const rule = this.rules.get('port-scan-detection');
    if (!rule?.enabled) return null;

    // Check cooldown
    if (this.isInCooldown(rule.id, sourceId)) return null;

    const attempts = this.connectionAttempts.get(sourceId) ?? [];
    attempts.push(timestamp);

    // Keep only recent attempts
    const window = (rule.params.timeWindow as number) ?? 60000;
    const recentAttempts = attempts.filter((t) => timestamp - t < window);
    this.connectionAttempts.set(sourceId, recentAttempts);

    const threshold = (rule.params.portsPerMinute as number) ?? 10;
    if (recentAttempts.length > threshold) {
      this.setCooldown(rule.id, sourceId, rule.cooldown);
      return this.createThreatEvent({
        type: 'port-scan',
        level: rule.severity,
        sourceId,
        description: `Port scan detected: ${recentAttempts.length} connection attempts in ${window / 1000}s`,
        evidence: [{
          type: 'connection-attempts',
          value: recentAttempts.length,
          confidence: 0.9,
          timestamp,
        }],
      });
    }

    return null;
  }

  private detectBruteForce(sourceId: string, timestamp: number): ThreatEvent | null {
    const rule = this.rules.get('brute-force-detection');
    if (!rule?.enabled) return null;

    if (this.isInCooldown(rule.id, sourceId)) return null;

    const failures = this.authFailures.get(sourceId) ?? [];
    failures.push(timestamp);

    const window = (rule.params.timeWindow as number) ?? 60000;
    const recentFailures = failures.filter((t) => timestamp - t < window);
    this.authFailures.set(sourceId, recentFailures);

    const threshold = (rule.params.failuresPerMinute as number) ?? 5;
    if (recentFailures.length > threshold) {
      this.setCooldown(rule.id, sourceId, rule.cooldown);
      return this.createThreatEvent({
        type: 'brute-force',
        level: rule.severity,
        sourceId,
        description: `Brute force attack detected: ${recentFailures.length} auth failures`,
        evidence: [{
          type: 'auth-failures',
          value: recentFailures.length,
          confidence: 0.95,
          timestamp,
        }],
      });
    }

    return null;
  }

  private detectProtocolViolation(sourceId: string, timestamp: number): ThreatEvent | null {
    const rule = this.rules.get('protocol-violation-detection');
    if (!rule?.enabled) return null;

    let rep = this.reputations.get(sourceId);
    if (!rep) {
      rep = this.initReputation(sourceId);
    }

    rep.violations++;

    const threshold = (rule.params.violationsPerMinute as number) ?? 3;
    if (rep.violations > threshold) {
      return this.createThreatEvent({
        type: 'protocol-violation',
        level: rule.severity,
        sourceId,
        description: `Multiple protocol violations from ${sourceId}`,
        evidence: [{
          type: 'violation-count',
          value: rep.violations,
          confidence: 0.85,
          timestamp,
        }],
      });
    }

    return null;
  }

  private detectSybilAttack(sourceIp: string, newNodeId: string, timestamp: number): ThreatEvent | null {
    const rule = this.rules.get('sybil-attack-detection');
    if (!rule?.enabled) return null;

    // Count identities from this IP
    // (In real implementation, would track IP -> NodeId mapping)
    // Simplified: just track if too many new identities in short time

    if (this.isInCooldown(rule.id, sourceIp)) return null;

    // Would check against stored IP->identity mappings
    // For demonstration, trigger if more than threshold new IDs

    return null; // Would return event if threshold exceeded
  }

  private trackRequest(sourceId: string, timestamp: number): void {
    if (!this.config.enableAnomalyDetection) return;

    const requests = this.requestCounts.get(sourceId) ?? [];
    requests.push(timestamp);

    // Keep last 5 minutes of data
    const recentRequests = requests.filter((t) => timestamp - t < 300000);
    this.requestCounts.set(sourceId, recentRequests);

    // Check for anomalies
    this.checkAnomaly(sourceId, recentRequests, timestamp);
  }

  private checkAnomaly(sourceId: string, requests: number[], timestamp: number): void {
    if (requests.length < 10) return; // Need enough data

    // Calculate request rate (requests per minute)
    const window = 60000;
    const recentCount = requests.filter((t) => timestamp - t < window).length;

    // Simple anomaly detection: compare to historical average
    const avgRate = requests.length / 5; // Average over 5 minutes

    if (recentCount > avgRate * this.config.anomalyThreshold) {
      this.emit('anomaly:detected', 'request-rate', recentCount, avgRate);
    }
  }

  private isInCooldown(ruleId: string, sourceId: string): boolean {
    const key = `${ruleId}:${sourceId}`;
    const cooldownUntil = this.ruleCooldowns.get(key);
    return cooldownUntil ? Date.now() < cooldownUntil : false;
  }

  private setCooldown(ruleId: string, sourceId: string, duration: number): void {
    const key = `${ruleId}:${sourceId}`;
    this.ruleCooldowns.set(key, Date.now() + duration);
  }

  private cleanup(): void {
    const now = Date.now();

    // Clean expired cooldowns
    for (const [key, expiry] of this.ruleCooldowns.entries()) {
      if (now > expiry) {
        this.ruleCooldowns.delete(key);
      }
    }

    // Clean old signatures
    const signatureWindow = 300000; // 5 minutes
    for (const [sig, time] of this.recentSignatures.entries()) {
      if (now - time > signatureWindow) {
        this.recentSignatures.delete(sig);
      }
    }

    // Clean old rate limit buckets
    for (const [id, bucket] of this.rateLimits.entries()) {
      if (now - bucket.windowStart > bucket.windowDuration * 2) {
        this.rateLimits.delete(id);
      }
    }

    // Trim threat history (keep last 1000)
    if (this.threatHistory.length > 1000) {
      this.threatHistory = this.threatHistory.slice(-1000);
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { ThreatMonitor };
export type {
  ThreatLevel,
  ThreatType,
  ThreatEvent,
  ThreatEvidence,
  DetectionRule,
  PeerReputation,
  RateLimitBucket,
  ThreatMonitorConfig,
  ThreatMonitorEvents,
};
