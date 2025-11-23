/**
 * Source Checkers
 *
 * Agent 11: Verifier - Specialized checkers for different source types.
 */

// URL Checker
export * from './url-checker';
export { default as UrlChecker } from './url-checker';

// DOI Checker
export * from './doi-checker';
export { default as DoiChecker } from './doi-checker';

// Patent Checker
export * from './patent-checker';
export { default as PatentChecker } from './patent-checker';

// Archive Checker
export * from './archive-checker';
export { default as ArchiveChecker } from './archive-checker';

// Legacy exports for backwards compatibility
export interface CheckResult {
  source: string;
  type: 'url' | 'doi' | 'patent' | 'archive';
  isAccessible: boolean;
  isFresh: boolean;
  lastChecked: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Combined checker that auto-detects source type
 */
export class UnifiedChecker {
  private urlChecker: InstanceType<typeof import('./url-checker').default>;
  private doiChecker: InstanceType<typeof import('./doi-checker').default>;
  private patentChecker: InstanceType<typeof import('./patent-checker').default>;
  private archiveChecker: InstanceType<typeof import('./archive-checker').default>;

  constructor() {
    const { default: UrlChecker } = require('./url-checker');
    const { default: DoiChecker } = require('./doi-checker');
    const { default: PatentChecker } = require('./patent-checker');
    const { default: ArchiveChecker } = require('./archive-checker');

    this.urlChecker = new UrlChecker();
    this.doiChecker = new DoiChecker();
    this.patentChecker = new PatentChecker();
    this.archiveChecker = new ArchiveChecker();
  }

  /**
   * Detect source type from string
   */
  detectType(source: string): 'url' | 'doi' | 'patent' | 'archive' {
    // Check for DOI pattern
    if (source.match(/^10\.\d{4,}/)) return 'doi';
    if (source.includes('doi.org/10.')) return 'doi';

    // Check for patent pattern
    if (source.match(/^[A-Z]{2}\d{5,}/)) return 'patent';
    if (source.includes('patents.google.com')) return 'patent';

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
   * Check source with auto-detection
   */
  async check(source: string): Promise<CheckResult> {
    const type = this.detectType(source);
    const startTime = Date.now();

    let result: { isValid: boolean; errorMessage?: string };

    switch (type) {
      case 'doi':
        const doiResult = await this.doiChecker.check(source);
        result = doiResult;
        break;
      case 'patent':
        const patentResult = await this.patentChecker.check(source);
        result = patentResult;
        break;
      case 'archive':
        const archiveResult = await this.archiveChecker.check(source);
        result = archiveResult;
        break;
      default:
        const urlResult = await this.urlChecker.check(source);
        result = urlResult;
    }

    return {
      source,
      type,
      isAccessible: result.isValid,
      isFresh: true,
      lastChecked: new Date(),
      metadata: {
        responseTime: Date.now() - startTime,
        errorMessage: result.errorMessage,
      },
    };
  }

  /**
   * Batch check multiple sources
   */
  async checkBatch(sources: string[]): Promise<CheckResult[]> {
    return Promise.all(sources.map(s => this.check(s)));
  }
}

export { UnifiedChecker };
