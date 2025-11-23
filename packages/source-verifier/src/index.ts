/**
 * @chicago-forest/source-verifier
 *
 * Agent 11: Verifier - Source Verification
 *
 * Continuously validates research sources, verifies URLs, DOIs, and patent links
 * for accuracy and accessibility in the Chicago Forest Network.
 *
 * Features:
 * - URL availability checker with retry logic
 * - DOI resolver and validator
 * - Patent link verification (patents.google.com)
 * - Archive accessibility checker (FBI vault, LENR-CANR)
 * - Source freshness monitoring and alerts
 * - Verification report generator
 * - CI/CD integration for automated source checks
 * - Broken link detection and notification
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 * All source verification is performed against real, documented archives.
 */

// Types
export * from './types';

// Validators
export * from './validators';

// Checkers
export * from './checkers';

// Reporters
export * from './reporters';

// Monitoring
export * from './monitoring';

// Import checkers and reporters for main class
import { UrlChecker } from './checkers/url-checker';
import { DoiChecker } from './checkers/doi-checker';
import { PatentChecker } from './checkers/patent-checker';
import { ArchiveChecker } from './checkers/archive-checker';
import { ReportGenerator } from './reporters/report-generator';
import { FreshnessMonitor } from './monitoring/freshness-monitor';
import {
  VerificationResult,
  VerificationReport,
  VerificationOptions,
  DEFAULT_OPTIONS,
  SourceEntry,
  ReportFormat,
} from './types';

/**
 * Main SourceVerifier class
 *
 * Comprehensive source verification for the Chicago Forest Network
 */
export class SourceVerifier {
  private readonly options: Required<VerificationOptions>;
  private readonly urlChecker: UrlChecker;
  private readonly doiChecker: DoiChecker;
  private readonly patentChecker: PatentChecker;
  private readonly archiveChecker: ArchiveChecker;
  private readonly reportGenerator: ReportGenerator;
  private readonly freshnessMonitor: FreshnessMonitor;

  constructor(options: VerificationOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.urlChecker = new UrlChecker(this.options);
    this.doiChecker = new DoiChecker(this.options);
    this.patentChecker = new PatentChecker(this.options);
    this.archiveChecker = new ArchiveChecker(this.options);
    this.reportGenerator = new ReportGenerator();
    this.freshnessMonitor = new FreshnessMonitor({
      maxAgeDays: this.options.maxAgeDays,
    });
  }

  /**
   * Detect source type from string
   */
  detectSourceType(source: string): 'url' | 'doi' | 'patent' | 'archive' {
    // Check for DOI pattern
    if (source.match(/^10\.\d{4,}/) || source.includes('doi.org/10.')) {
      return 'doi';
    }

    // Check for patent pattern
    if (source.match(/^[A-Z]{2}\d{5,}/) || source.includes('patents.google.com')) {
      return 'patent';
    }

    // Check for known archives
    const archiveHosts = [
      'vault.fbi.gov',
      'lenr-canr.org',
      'archive.org',
      'web.archive.org',
      'teslauniverse.com',
    ];

    try {
      const url = new URL(source);
      if (archiveHosts.some(h => url.hostname.includes(h))) {
        return 'archive';
      }
    } catch {
      // Not a valid URL
    }

    return 'url';
  }

  /**
   * Verify a single URL
   */
  async verifyUrl(url: string): Promise<VerificationResult> {
    const result = await this.urlChecker.check(url);
    this.freshnessMonitor.updateSource(result);
    return result;
  }

  /**
   * Verify a single DOI
   */
  async verifyDOI(doi: string): Promise<VerificationResult> {
    const result = await this.doiChecker.check(doi);
    this.freshnessMonitor.updateSource(result);
    return result;
  }

  /**
   * Verify a single patent
   */
  async verifyPatent(patentNumber: string): Promise<VerificationResult> {
    const result = await this.patentChecker.check(patentNumber);
    this.freshnessMonitor.updateSource(result);
    return result;
  }

  /**
   * Verify a single archive URL
   */
  async verifyArchive(url: string): Promise<VerificationResult> {
    const result = await this.archiveChecker.check(url);
    this.freshnessMonitor.updateSource(result);
    return result;
  }

  /**
   * Verify any source with auto-detection
   */
  async verify(source: string): Promise<VerificationResult> {
    const type = this.detectSourceType(source);

    switch (type) {
      case 'doi':
        return this.verifyDOI(source);
      case 'patent':
        return this.verifyPatent(source);
      case 'archive':
        return this.verifyArchive(source);
      default:
        return this.verifyUrl(source);
    }
  }

  /**
   * Verify multiple sources
   */
  async verifyBatch(sources: string[]): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];
    const queue = [...sources];

    // Process in batches based on concurrency setting
    while (queue.length > 0) {
      const batch = queue.splice(0, this.options.concurrency);
      const batchResults = await Promise.all(
        batch.map(source => this.verify(source))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Verify sources and generate report
   */
  async verifyAndReport(
    sources: string[],
    format: ReportFormat = 'json'
  ): Promise<{ report: VerificationReport; formatted: string }> {
    const results = await this.verifyBatch(sources);
    const report = this.reportGenerator.generate(results);
    const formatted = this.reportGenerator.format(report, format);

    return { report, formatted };
  }

  /**
   * Generate report from existing results
   */
  generateReport(results: VerificationResult[]): VerificationReport {
    return this.reportGenerator.generate(results);
  }

  /**
   * Format report to specified format
   */
  formatReport(report: VerificationReport, format: ReportFormat): string {
    return this.reportGenerator.format(report, format);
  }

  /**
   * Register source for freshness monitoring
   */
  registerSource(entry: SourceEntry): void {
    this.freshnessMonitor.registerSource(entry);
  }

  /**
   * Get stale sources that need re-verification
   */
  getStaleSources(): SourceEntry[] {
    return this.freshnessMonitor.getStaleSources().map(record => ({
      url: record.url,
      type: record.type,
      label: record.label,
      lastVerified: record.lastVerified,
    }));
  }

  /**
   * Get failing sources
   */
  getFailingSources(): SourceEntry[] {
    return this.freshnessMonitor.getFailingSources().map(record => ({
      url: record.url,
      type: record.type,
      label: record.label,
      lastVerified: record.lastVerified,
    }));
  }

  /**
   * Get freshness report
   */
  getFreshnessReport() {
    return this.freshnessMonitor.generateReport();
  }

  /**
   * Verify all known Tesla patents
   */
  async verifyTeslaPatents(): Promise<VerificationResult[]> {
    return this.patentChecker.verifyTeslaPatents();
  }

  /**
   * Verify FBI Tesla files
   */
  async verifyFbiTeslaFiles(): Promise<VerificationResult[]> {
    return this.archiveChecker.verifyFbiTeslaFiles();
  }

  /**
   * Verify LENR-CANR documents
   */
  async verifyLenrCanrDocuments(): Promise<VerificationResult[]> {
    return this.archiveChecker.verifyLenrCanrDocuments();
  }

  /**
   * Get verification statistics
   */
  getStatistics() {
    return this.freshnessMonitor.getStatistics();
  }

  /**
   * Subscribe to verification alerts
   */
  onAlert(callback: (alert: unknown) => void): void {
    this.freshnessMonitor.on('alert', callback);
  }

  /**
   * Export monitored sources
   */
  exportSources(): string {
    return this.freshnessMonitor.exportSources();
  }

  /**
   * Import monitored sources
   */
  importSources(json: string): void {
    this.freshnessMonitor.importSources(json);
  }
}

// Default export
export default SourceVerifier;

// Re-export commonly used types for convenience
export type {
  SourceVerificationResult,
  DOIVerificationResult,
  PatentVerificationResult,
} from './types';

// Legacy compatibility types
export interface SourceVerificationResult {
  url: string;
  isValid: boolean;
  statusCode?: number;
  lastChecked: Date;
  errorMessage?: string;
  responseTime?: number;
}

export interface DOIVerificationResult {
  doi: string;
  isValid: boolean;
  resolvedUrl?: string;
  title?: string;
  authors?: string[];
  journal?: string;
  year?: number;
}

export interface PatentVerificationResult {
  patentNumber: string;
  isValid: boolean;
  title?: string;
  inventor?: string;
  filingDate?: Date;
  patentUrl?: string;
}
