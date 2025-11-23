/**
 * @chicago-forest/compliance-checker
 *
 * Agent 13: Compliance - Disclaimer & Accuracy Enforcement
 *
 * Ensures all content meets transparency requirements, AI-disclosure standards,
 * and prevents false claims about operational status or investment potential.
 *
 * CRITICAL: This package enforces the project's ethical guidelines.
 */

export * from './validators';
export * from './scanners';
export * from './classifiers';

// Red line violations - NEVER allow these
export const RED_LINES = {
  operationalClaims: [
    'working device',
    'proven technology',
    'operational system',
    'generates power',
    'produces energy',
    'free energy device',
  ],
  investmentLanguage: [
    'investment opportunity',
    'guaranteed returns',
    'profit potential',
    'financial gain',
    'buy now',
    'limited time',
  ],
  falsePromises: [
    'will solve',
    'guaranteed to',
    'proven to work',
    'scientifically proven',
    'breakthrough device',
  ],
};

export interface ComplianceViolation {
  type: 'red_line' | 'missing_disclaimer' | 'missing_label' | 'false_claim' | 'fabricated_url';
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: { file?: string; line?: number; column?: number };
  message: string;
  suggestion: string;
}

export interface ComplianceReport {
  timestamp: Date;
  totalFiles: number;
  compliantFiles: number;
  violations: ComplianceViolation[];
  overallStatus: 'pass' | 'fail' | 'warning';
}

export class ComplianceChecker {
  private readonly requiredDisclaimers = [
    'AI-generated',
    'theoretical framework',
    'not operational',
  ];

  checkContent(content: string, filePath?: string): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check for red line violations
    for (const [category, phrases] of Object.entries(RED_LINES)) {
      for (const phrase of phrases) {
        if (content.toLowerCase().includes(phrase.toLowerCase())) {
          violations.push({
            type: 'red_line',
            severity: 'critical',
            location: { file: filePath },
            message: `Red line violation: "${phrase}" found (${category})`,
            suggestion: `Remove or rephrase content that suggests ${category.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          });
        }
      }
    }

    return violations;
  }

  checkDisclaimer(content: string, filePath?: string): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check if required disclaimers are present
    const hasDisclaimer = this.requiredDisclaimers.some(
      d => content.toLowerCase().includes(d.toLowerCase())
    );

    if (!hasDisclaimer) {
      violations.push({
        type: 'missing_disclaimer',
        severity: 'high',
        location: { file: filePath },
        message: 'Required disclaimer not found in content',
        suggestion: 'Add a disclaimer indicating AI-generated theoretical framework',
      });
    }

    return violations;
  }

  checkUrls(content: string, filePath?: string): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    // Check for potentially fabricated URLs
    const urlPattern = /https?:\/\/[^\s)]+/g;
    const urls = content.match(urlPattern) || [];

    const trustedDomains = [
      'patents.google.com',
      'doi.org',
      'archive.org',
      'lenr-canr.org',
      'vault.fbi.gov',
      'github.com',
      'teslauniverse.com',
    ];

    for (const url of urls) {
      try {
        const parsed = new URL(url);
        const isTrusted = trustedDomains.some(
          d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`)
        );

        if (!isTrusted) {
          violations.push({
            type: 'fabricated_url',
            severity: 'medium',
            location: { file: filePath },
            message: `Unverified URL domain: ${parsed.hostname}`,
            suggestion: 'Verify this URL points to a real, trustworthy source',
          });
        }
      } catch {
        violations.push({
          type: 'fabricated_url',
          severity: 'high',
          location: { file: filePath },
          message: `Invalid URL format: ${url}`,
          suggestion: 'Fix the URL format or remove if invalid',
        });
      }
    }

    return violations;
  }

  generateReport(files: { path: string; content: string }[]): ComplianceReport {
    const allViolations: ComplianceViolation[] = [];

    for (const file of files) {
      allViolations.push(...this.checkContent(file.content, file.path));
      allViolations.push(...this.checkDisclaimer(file.content, file.path));
      allViolations.push(...this.checkUrls(file.content, file.path));
    }

    const criticalCount = allViolations.filter(v => v.severity === 'critical').length;
    const highCount = allViolations.filter(v => v.severity === 'high').length;

    let overallStatus: 'pass' | 'fail' | 'warning';
    if (criticalCount > 0) {
      overallStatus = 'fail';
    } else if (highCount > 0) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'pass';
    }

    return {
      timestamp: new Date(),
      totalFiles: files.length,
      compliantFiles: files.length - new Set(allViolations.map(v => v.location.file)).size,
      violations: allViolations,
      overallStatus,
    };
  }
}

export default ComplianceChecker;
