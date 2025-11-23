/**
 * @chicago-forest/source-verifier - Type Definitions
 *
 * Agent 11: Verifier - Source Verification Types
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 * All source verification is performed against real, documented archives.
 */

/**
 * Supported source types for verification
 */
export type SourceType = 'url' | 'doi' | 'patent' | 'archive';

/**
 * Verification status for a source
 */
export type VerificationStatus =
  | 'valid'
  | 'invalid'
  | 'unreachable'
  | 'redirect'
  | 'pending'
  | 'stale';

/**
 * Trusted domains for source verification
 */
export const TRUSTED_DOMAINS = [
  'patents.google.com',
  'doi.org',
  'dx.doi.org',
  'archive.org',
  'web.archive.org',
  'lenr-canr.org',
  'vault.fbi.gov',
  'teslauniverse.com',
  'nasa.gov',
  'osti.gov',
  'sciencedirect.com',
  'nature.com',
  'springer.com',
  'wiley.com',
  'jstor.org',
  'arxiv.org',
  'pubmed.ncbi.nlm.nih.gov',
  'brillouinenergy.com',
  'cleanplanet.co.jp',
  'infiniteenergy.com',
] as const;

/**
 * Known archive sites for historical research
 */
export const ARCHIVE_SITES = {
  'lenr-canr.org': {
    name: 'LENR-CANR Library',
    description: 'Low Energy Nuclear Reactions research library',
    category: 'research',
  },
  'vault.fbi.gov': {
    name: 'FBI Vault',
    description: 'FBI declassified documents repository',
    category: 'government',
  },
  'archive.org': {
    name: 'Internet Archive',
    description: 'Wayback Machine and digital library',
    category: 'archive',
  },
  'web.archive.org': {
    name: 'Wayback Machine',
    description: 'Web page archive snapshots',
    category: 'archive',
  },
  'teslauniverse.com': {
    name: 'Tesla Universe',
    description: 'Nikola Tesla research and documents',
    category: 'research',
  },
  'osti.gov': {
    name: 'OSTI',
    description: 'Office of Scientific and Technical Information',
    category: 'government',
  },
} as const;

/**
 * DOI registrant codes for known publishers
 */
export const DOI_REGISTRANTS: Record<string, string> = {
  '1038': 'Nature Publishing Group',
  '1126': 'Science/AAAS',
  '1103': 'American Physical Society',
  '1016': 'Elsevier',
  '1007': 'Springer',
  '1021': 'American Chemical Society',
  '1063': 'AIP Publishing',
  '1088': 'IOP Publishing',
  '1109': 'IEEE',
  '1002': 'Wiley',
  '3390': 'MDPI',
  '1080': 'Taylor & Francis',
};

/**
 * Patent jurisdiction prefixes
 */
export const PATENT_JURISDICTIONS: Record<string, string> = {
  US: 'United States Patent and Trademark Office',
  EP: 'European Patent Office',
  WO: 'World Intellectual Property Organization',
  GB: 'UK Intellectual Property Office',
  DE: 'German Patent and Trade Mark Office',
  JP: 'Japan Patent Office',
  CN: 'China National Intellectual Property Administration',
  CA: 'Canadian Intellectual Property Office',
  AU: 'IP Australia',
};

/**
 * Base verification result interface
 */
export interface BaseVerificationResult {
  source: string;
  type: SourceType;
  status: VerificationStatus;
  isValid: boolean;
  lastChecked: Date;
  responseTime?: number;
  errorMessage?: string;
  retryCount?: number;
}

/**
 * URL verification result
 */
export interface UrlVerificationResult extends BaseVerificationResult {
  type: 'url';
  statusCode?: number;
  contentType?: string;
  redirectUrl?: string;
  isTrustedDomain: boolean;
  isHttps: boolean;
}

/**
 * DOI verification result
 */
export interface DoiVerificationResult extends BaseVerificationResult {
  type: 'doi';
  resolvedUrl?: string;
  title?: string;
  authors?: string[];
  journal?: string;
  year?: number;
  publisher?: string;
  registrant?: string;
}

/**
 * Patent verification result
 */
export interface PatentVerificationResult extends BaseVerificationResult {
  type: 'patent';
  patentNumber: string;
  title?: string;
  inventor?: string;
  assignee?: string;
  filingDate?: Date;
  publicationDate?: Date;
  patentUrl: string;
  jurisdiction: string;
  jurisdictionName: string;
}

/**
 * Archive verification result
 */
export interface ArchiveVerificationResult extends BaseVerificationResult {
  type: 'archive';
  archiveName: string;
  archiveCategory: string;
  isKnownArchive: boolean;
  snapshotDate?: Date;
  originalUrl?: string;
}

/**
 * Union type for all verification results
 */
export type VerificationResult =
  | UrlVerificationResult
  | DoiVerificationResult
  | PatentVerificationResult
  | ArchiveVerificationResult;

/**
 * Comprehensive verification report
 */
export interface VerificationReport {
  id: string;
  timestamp: Date;
  duration: number;
  summary: {
    totalSources: number;
    validSources: number;
    invalidSources: number;
    unreachableSources: number;
    staleSources: number;
    successRate: number;
  };
  byType: {
    urls: UrlVerificationResult[];
    dois: DoiVerificationResult[];
    patents: PatentVerificationResult[];
    archives: ArchiveVerificationResult[];
  };
  issues: VerificationIssue[];
  recommendations: string[];
}

/**
 * Verification issue for reporting
 */
export interface VerificationIssue {
  source: string;
  type: SourceType;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
}

/**
 * Verification options
 */
export interface VerificationOptions {
  retryAttempts?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  concurrency?: number;
  checkFreshness?: boolean;
  maxAgeDays?: number;
  validateContent?: boolean;
  followRedirects?: boolean;
}

/**
 * Default verification options
 */
export const DEFAULT_OPTIONS: Required<VerificationOptions> = {
  retryAttempts: 3,
  retryDelayMs: 1000,
  timeoutMs: 30000,
  concurrency: 5,
  checkFreshness: true,
  maxAgeDays: 30,
  validateContent: false,
  followRedirects: true,
};

/**
 * Source entry for batch verification
 */
export interface SourceEntry {
  url: string;
  type?: SourceType;
  label?: string;
  category?: string;
  lastVerified?: Date;
}

/**
 * Verification event types for monitoring
 */
export type VerificationEventType =
  | 'verification:start'
  | 'verification:complete'
  | 'verification:error'
  | 'source:valid'
  | 'source:invalid'
  | 'source:unreachable'
  | 'report:generated'
  | 'alert:broken-link'
  | 'alert:stale-source';

/**
 * Verification event payload
 */
export interface VerificationEvent {
  type: VerificationEventType;
  timestamp: Date;
  source?: string;
  result?: VerificationResult;
  error?: Error;
  metadata?: Record<string, unknown>;
}

/**
 * Report format options
 */
export type ReportFormat = 'json' | 'markdown' | 'html' | 'csv';

/**
 * CI/CD integration configuration
 */
export interface CiIntegrationConfig {
  failOnInvalid: boolean;
  failOnUnreachable: boolean;
  minSuccessRate: number;
  outputFormat: ReportFormat;
  outputPath?: string;
  slackWebhook?: string;
  emailNotify?: string[];
}
