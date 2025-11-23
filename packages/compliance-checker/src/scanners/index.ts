/**
 * Compliance Scanners
 *
 * Scan files and directories for compliance issues.
 */

import type { ComplianceViolation } from '../index';

export interface ScanResult {
  path: string;
  violations: ComplianceViolation[];
  scannedAt: Date;
}

export interface ScanOptions {
  includePatterns: string[];
  excludePatterns: string[];
  checkDisclaimer: boolean;
  checkRedLines: boolean;
  checkUrls: boolean;
}

const defaultOptions: ScanOptions = {
  includePatterns: ['**/*.md', '**/*.tsx', '**/*.ts'],
  excludePatterns: ['**/node_modules/**', '**/dist/**'],
  checkDisclaimer: true,
  checkRedLines: true,
  checkUrls: true,
};

export function scanForRedLines(content: string, path: string): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const lines = content.split('\n');

  const redLinePatterns = [
    { pattern: /working (free )?energy/i, category: 'operational claim' },
    { pattern: /proven technology/i, category: 'false proof' },
    { pattern: /investment opportunity/i, category: 'financial language' },
    { pattern: /guaranteed/i, category: 'false promise' },
  ];

  lines.forEach((line, lineNumber) => {
    for (const { pattern, category } of redLinePatterns) {
      if (pattern.test(line)) {
        violations.push({
          type: 'red_line',
          severity: 'critical',
          location: { file: path, line: lineNumber + 1 },
          message: `Red line violation (${category}): ${line.trim().slice(0, 50)}...`,
          suggestion: `Remove or rephrase to avoid ${category}`,
        });
      }
    }
  });

  return violations;
}

export function scanForMissingDisclaimers(content: string, path: string): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  // Only check content files, not code
  if (path.endsWith('.md') || path.includes('/content/')) {
    const hasDisclaimer = /disclaimer|AI[- ]generated|theoretical/i.test(content);

    if (!hasDisclaimer && content.length > 500) {
      violations.push({
        type: 'missing_disclaimer',
        severity: 'high',
        location: { file: path },
        message: 'Content file missing required disclaimer',
        suggestion: 'Add disclaimer at the top of the file',
      });
    }
  }

  return violations;
}

export function scanForFabricatedUrls(content: string, path: string): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];
  const urlPattern = /https?:\/\/[^\s)"']+/g;
  const urls = content.match(urlPattern) || [];

  const suspiciousPatterns = [
    /example\.com/,
    /test\.com/,
    /fake/i,
    /placeholder/i,
    /localhost/,
    /127\.0\.0\.1/,
  ];

  for (const url of urls) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        violations.push({
          type: 'fabricated_url',
          severity: 'high',
          location: { file: path },
          message: `Suspicious URL detected: ${url}`,
          suggestion: 'Replace with real, verifiable source URL',
        });
        break;
      }
    }
  }

  return violations;
}

export function scanFile(
  content: string,
  path: string,
  options: Partial<ScanOptions> = {}
): ScanResult {
  const opts = { ...defaultOptions, ...options };
  const violations: ComplianceViolation[] = [];

  if (opts.checkRedLines) {
    violations.push(...scanForRedLines(content, path));
  }

  if (opts.checkDisclaimer) {
    violations.push(...scanForMissingDisclaimers(content, path));
  }

  if (opts.checkUrls) {
    violations.push(...scanForFabricatedUrls(content, path));
  }

  return {
    path,
    violations,
    scannedAt: new Date(),
  };
}
