/**
 * @chicago-forest/sentinel - Privacy Protection Utilities
 *
 * Privacy-enhancing technologies and data protection utilities
 * for the Chicago Forest Network.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * Features:
 * - Data anonymization and pseudonymization
 * - PII detection and redaction
 * - Privacy-preserving data sharing
 * - Differential privacy utilities
 * - Data retention policies
 *
 * @example
 * ```typescript
 * import {
 *   PrivacyGuard,
 *   anonymizeData,
 *   detectPII,
 * } from '@chicago-forest/sentinel/privacy';
 *
 * const guard = new PrivacyGuard({ strictMode: true });
 * const cleaned = guard.scrub(userData);
 * const pii = detectPII(userMessage);
 * ```
 */

import { hashSha256, bytesToHex, secureRandomBytes } from '../crypto';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Types of personally identifiable information
 */
export type PIIType =
  | 'email'
  | 'phone'
  | 'ssn'
  | 'credit-card'
  | 'ip-address'
  | 'address'
  | 'name'
  | 'date-of-birth'
  | 'passport'
  | 'driver-license'
  | 'biometric'
  | 'location'
  | 'device-id';

/**
 * PII detection result
 */
export interface PIIDetection {
  /** Type of PII detected */
  type: PIIType;
  /** Matched text */
  match: string;
  /** Start position in original text */
  start: number;
  /** End position in original text */
  end: number;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Anonymization method
 */
export type AnonymizationMethod =
  | 'hash'
  | 'pseudonymize'
  | 'generalize'
  | 'redact'
  | 'mask'
  | 'encrypt'
  | 'suppress';

/**
 * Anonymization options
 */
export interface AnonymizationOptions {
  /** Method to use */
  method: AnonymizationMethod;
  /** Salt for hashing/pseudonymization */
  salt?: string;
  /** Mask character */
  maskChar?: string;
  /** Number of characters to preserve */
  preserveChars?: number;
  /** Generalization level */
  generalizationLevel?: number;
}

/**
 * Privacy guard configuration
 */
export interface PrivacyGuardConfig {
  /** Enable strict mode (more aggressive PII detection) */
  strictMode: boolean;
  /** Default anonymization method */
  defaultMethod: AnonymizationMethod;
  /** PII types to detect */
  detectTypes: PIIType[];
  /** Custom patterns for PII detection */
  customPatterns?: Map<string, RegExp>;
  /** Salt for consistent pseudonymization */
  pseudonymSalt?: string;
  /** Enable automatic PII scrubbing */
  autoScrub: boolean;
}

/**
 * Data retention policy
 */
export interface RetentionPolicy {
  /** Policy name */
  name: string;
  /** Data category */
  dataCategory: string;
  /** Retention period in days */
  retentionDays: number;
  /** Action after retention period */
  expiryAction: 'delete' | 'anonymize' | 'archive';
  /** Legal basis for retention */
  legalBasis?: string;
}

/**
 * Privacy consent record
 */
export interface ConsentRecord {
  /** Unique consent ID */
  id: string;
  /** User/node ID */
  subjectId: string;
  /** Purpose of data processing */
  purpose: string;
  /** Data categories consented to */
  dataCategories: string[];
  /** Consent granted */
  granted: boolean;
  /** Consent timestamp */
  timestamp: number;
  /** Consent expires at */
  expiresAt?: number;
  /** Consent was revoked */
  revoked: boolean;
  /** Revocation timestamp */
  revokedAt?: number;
}

// =============================================================================
// PII PATTERNS
// =============================================================================

const PII_PATTERNS: Record<PIIType, RegExp> = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
  'credit-card': /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  'ip-address': /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  address: /\b\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct)\b/gi,
  name: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
  'date-of-birth': /\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12]\d|3[01])[-/](?:19|20)\d{2}\b/g,
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
  'driver-license': /\b[A-Z]{1,2}\d{5,8}\b/g,
  biometric: /\b(?:fingerprint|face|iris|voice|dna)\s*(?:id|data|scan)?\b/gi,
  location: /\b(?:lat(?:itude)?|lng|long(?:itude)?)\s*[=:]\s*[-]?\d+\.?\d*\b/gi,
  'device-id': /\b[A-Fa-f0-9]{8}[-]?[A-Fa-f0-9]{4}[-]?[A-Fa-f0-9]{4}[-]?[A-Fa-f0-9]{4}[-]?[A-Fa-f0-9]{12}\b/g,
};

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_CONFIG: PrivacyGuardConfig = {
  strictMode: false,
  defaultMethod: 'redact',
  detectTypes: ['email', 'phone', 'ssn', 'credit-card', 'ip-address'],
  autoScrub: true,
};

// =============================================================================
// PRIVACY GUARD
// =============================================================================

/**
 * Privacy Guard - Comprehensive privacy protection
 */
export class PrivacyGuard {
  private config: PrivacyGuardConfig;
  private pseudonymMap: Map<string, string> = new Map();
  private consentRecords: Map<string, ConsentRecord[]> = new Map();
  private retentionPolicies: RetentionPolicy[] = [];

  constructor(config: Partial<PrivacyGuardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Detect PII in text
   */
  detectPII(text: string): PIIDetection[] {
    const detections: PIIDetection[] = [];

    for (const type of this.config.detectTypes) {
      const pattern = PII_PATTERNS[type];
      if (!pattern) continue;

      // Clone the regex to reset lastIndex
      const regex = new RegExp(pattern.source, pattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        detections.push({
          type,
          match: match[0],
          start: match.index,
          end: match.index + match[0].length,
          confidence: this.calculateConfidence(type, match[0]),
        });
      }
    }

    // Check custom patterns
    if (this.config.customPatterns) {
      for (const [name, pattern] of this.config.customPatterns) {
        const regex = new RegExp(pattern.source, pattern.flags);
        let match: RegExpExecArray | null;

        while ((match = regex.exec(text)) !== null) {
          detections.push({
            type: name as PIIType,
            match: match[0],
            start: match.index,
            end: match.index + match[0].length,
            confidence: 0.8,
          });
        }
      }
    }

    // Sort by position
    return detections.sort((a, b) => a.start - b.start);
  }

  /**
   * Scrub PII from text
   */
  scrub(text: string, options?: Partial<AnonymizationOptions>): string {
    const method = options?.method ?? this.config.defaultMethod;
    const detections = this.detectPII(text);

    if (detections.length === 0) {
      return text;
    }

    let result = text;
    let offset = 0;

    for (const detection of detections) {
      const anonymized = this.anonymize(detection.match, {
        ...options,
        method,
      });

      const start = detection.start + offset;
      const end = detection.end + offset;

      result = result.slice(0, start) + anonymized + result.slice(end);
      offset += anonymized.length - detection.match.length;
    }

    return result;
  }

  /**
   * Anonymize a value
   */
  anonymize(
    value: string,
    options: Partial<AnonymizationOptions> = {}
  ): string {
    const method = options.method ?? this.config.defaultMethod;

    switch (method) {
      case 'hash':
        return this.hashValue(value, options.salt);

      case 'pseudonymize':
        return this.pseudonymize(value);

      case 'generalize':
        return this.generalize(value, options.generalizationLevel);

      case 'redact':
        return '[REDACTED]';

      case 'mask':
        return this.mask(value, options.maskChar, options.preserveChars);

      case 'suppress':
        return '';

      default:
        return '[PROTECTED]';
    }
  }

  /**
   * Create a consistent pseudonym for a value
   */
  pseudonymize(value: string): string {
    // Check if we already have a pseudonym
    const existing = this.pseudonymMap.get(value);
    if (existing) {
      return existing;
    }

    // Generate new pseudonym
    const salt = this.config.pseudonymSalt ?? 'default-salt';
    const hash = this.hashValue(value, salt);
    const pseudonym = `user_${hash.slice(0, 8)}`;

    this.pseudonymMap.set(value, pseudonym);
    return pseudonym;
  }

  /**
   * Reverse pseudonymization (if mapping exists)
   */
  depseudonymize(pseudonym: string): string | null {
    for (const [original, pseudo] of this.pseudonymMap) {
      if (pseudo === pseudonym) {
        return original;
      }
    }
    return null;
  }

  /**
   * Record consent
   */
  recordConsent(
    subjectId: string,
    purpose: string,
    dataCategories: string[],
    granted: boolean,
    expiresAt?: number
  ): ConsentRecord {
    const record: ConsentRecord = {
      id: `consent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      subjectId,
      purpose,
      dataCategories,
      granted,
      timestamp: Date.now(),
      expiresAt,
      revoked: false,
    };

    const records = this.consentRecords.get(subjectId) ?? [];
    records.push(record);
    this.consentRecords.set(subjectId, records);

    return record;
  }

  /**
   * Revoke consent
   */
  revokeConsent(subjectId: string, consentId: string): boolean {
    const records = this.consentRecords.get(subjectId);
    if (!records) return false;

    const record = records.find((r) => r.id === consentId);
    if (!record) return false;

    record.revoked = true;
    record.revokedAt = Date.now();
    return true;
  }

  /**
   * Check if consent exists for purpose
   */
  hasConsent(subjectId: string, purpose: string, dataCategory?: string): boolean {
    const records = this.consentRecords.get(subjectId);
    if (!records) return false;

    const now = Date.now();
    return records.some((r) =>
      r.purpose === purpose &&
      r.granted &&
      !r.revoked &&
      (!r.expiresAt || r.expiresAt > now) &&
      (!dataCategory || r.dataCategories.includes(dataCategory))
    );
  }

  /**
   * Get consent records for subject
   */
  getConsents(subjectId: string): ConsentRecord[] {
    return this.consentRecords.get(subjectId) ?? [];
  }

  /**
   * Add retention policy
   */
  addRetentionPolicy(policy: RetentionPolicy): void {
    this.retentionPolicies.push(policy);
  }

  /**
   * Get applicable retention policy
   */
  getRetentionPolicy(dataCategory: string): RetentionPolicy | undefined {
    return this.retentionPolicies.find((p) => p.dataCategory === dataCategory);
  }

  /**
   * Check if data should be retained
   */
  shouldRetain(dataCategory: string, createdAt: number): boolean {
    const policy = this.getRetentionPolicy(dataCategory);
    if (!policy) return true; // No policy = retain indefinitely

    const expiryTime = createdAt + policy.retentionDays * 24 * 60 * 60 * 1000;
    return Date.now() < expiryTime;
  }

  /**
   * Generate privacy report
   */
  generateReport(subjectId: string): PrivacyReport {
    const consents = this.getConsents(subjectId);
    const activeConsents = consents.filter(
      (c) => c.granted && !c.revoked && (!c.expiresAt || c.expiresAt > Date.now())
    );

    return {
      subjectId,
      generatedAt: Date.now(),
      totalConsents: consents.length,
      activeConsents: activeConsents.length,
      consents,
      dataCategories: [...new Set(consents.flatMap((c) => c.dataCategories))],
      retentionPolicies: this.retentionPolicies,
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private hashValue(value: string, salt?: string): string {
    const data = salt ? `${salt}:${value}` : value;
    const hash = hashSha256(data);
    return bytesToHex(hash);
  }

  private mask(
    value: string,
    maskChar: string = '*',
    preserveChars: number = 4
  ): string {
    if (value.length <= preserveChars) {
      return maskChar.repeat(value.length);
    }

    const preserved = value.slice(-preserveChars);
    const masked = maskChar.repeat(value.length - preserveChars);
    return masked + preserved;
  }

  private generalize(value: string, level: number = 1): string {
    // Generalization reduces precision
    // Level 1: Keep first 3 chars
    // Level 2: Keep first 2 chars
    // Level 3: Keep first char
    // Level 4+: Just type indicator

    if (level >= 4) {
      return '[VALUE]';
    }

    const keepChars = Math.max(1, 4 - level);
    if (value.length <= keepChars) {
      return value[0] + '...';
    }

    return value.slice(0, keepChars) + '...';
  }

  private calculateConfidence(type: PIIType, match: string): number {
    // Higher confidence for more specific patterns
    switch (type) {
      case 'email':
        return match.includes('.') && match.includes('@') ? 0.95 : 0.7;
      case 'ssn':
        return match.length === 11 ? 0.9 : 0.7;
      case 'credit-card':
        return this.isValidLuhn(match.replace(/[-\s]/g, '')) ? 0.95 : 0.5;
      case 'phone':
        return match.length >= 10 ? 0.85 : 0.6;
      case 'ip-address':
        return this.isValidIP(match) ? 0.9 : 0.5;
      default:
        return 0.7;
    }
  }

  private isValidLuhn(number: string): boolean {
    // Luhn algorithm for credit card validation
    let sum = 0;
    let isEven = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  private isValidIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;

    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
}

/**
 * Privacy report
 */
export interface PrivacyReport {
  subjectId: string;
  generatedAt: number;
  totalConsents: number;
  activeConsents: number;
  consents: ConsentRecord[];
  dataCategories: string[];
  retentionPolicies: RetentionPolicy[];
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Detect PII in text (convenience function)
 */
export function detectPII(text: string, types?: PIIType[]): PIIDetection[] {
  const guard = new PrivacyGuard({
    detectTypes: types ?? DEFAULT_CONFIG.detectTypes,
  });
  return guard.detectPII(text);
}

/**
 * Anonymize data (convenience function)
 */
export function anonymizeData(
  value: string,
  method: AnonymizationMethod = 'redact'
): string {
  const guard = new PrivacyGuard();
  return guard.anonymize(value, { method });
}

/**
 * Scrub PII from text (convenience function)
 */
export function scrubPII(text: string, method?: AnonymizationMethod): string {
  const guard = new PrivacyGuard();
  return guard.scrub(text, { method });
}

/**
 * Generate a privacy-safe identifier
 */
export function generatePrivacyId(): string {
  const bytes = secureRandomBytes(16);
  return bytesToHex(bytes);
}

// =============================================================================
// EXPORTS
// =============================================================================

// PrivacyGuard class already exported at definition
export type {
  PIIType,
  PIIDetection,
  AnonymizationMethod,
  AnonymizationOptions,
  PrivacyGuardConfig,
  RetentionPolicy,
  ConsentRecord,
  PrivacyReport,
};
