/**
 * @chicago-forest/security-auditor
 *
 * Agent 16: Auditor - Security Auditing
 *
 * Continuous security analysis, vulnerability scanning, and cryptographic
 * validation across the codebase.
 */

export * from './scanners';
export * from './validators';
export * from './analyzers';
export * from './owasp';
export * from './simulator';

export interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'vulnerability' | 'secret' | 'crypto' | 'dependency' | 'configuration';
  title: string;
  description: string;
  location?: { file: string; line?: number };
  recommendation: string;
  cweId?: string;
}

export interface AuditReport {
  timestamp: Date;
  duration: number;
  findings: SecurityFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  passed: boolean;
}

export interface AuditConfig {
  scanSecrets: boolean;
  scanDependencies: boolean;
  scanCrypto: boolean;
  scanCode: boolean;
  excludePatterns: string[];
  severityThreshold: SecurityFinding['severity'];
}

const defaultConfig: AuditConfig = {
  scanSecrets: true,
  scanDependencies: true,
  scanCrypto: true,
  scanCode: true,
  excludePatterns: ['**/node_modules/**', '**/dist/**', '**/*.test.ts'],
  severityThreshold: 'high',
};

export class SecurityAuditor {
  private config: AuditConfig;
  private findings: SecurityFinding[] = [];

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async audit(files: { path: string; content: string }[]): Promise<AuditReport> {
    const startTime = Date.now();
    this.findings = [];

    for (const file of files) {
      if (this.isExcluded(file.path)) continue;

      if (this.config.scanSecrets) {
        this.findings.push(...this.scanForSecrets(file));
      }
      if (this.config.scanCrypto) {
        this.findings.push(...this.scanCryptoUsage(file));
      }
      if (this.config.scanCode) {
        this.findings.push(...this.scanCodeVulnerabilities(file));
      }
    }

    const summary = {
      critical: this.findings.filter(f => f.severity === 'critical').length,
      high: this.findings.filter(f => f.severity === 'high').length,
      medium: this.findings.filter(f => f.severity === 'medium').length,
      low: this.findings.filter(f => f.severity === 'low').length,
      info: this.findings.filter(f => f.severity === 'info').length,
    };

    const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
    const thresholdIndex = severityOrder.indexOf(this.config.severityThreshold);
    const passed = !this.findings.some(
      f => severityOrder.indexOf(f.severity) <= thresholdIndex
    );

    return {
      timestamp: new Date(),
      duration: Date.now() - startTime,
      findings: this.findings,
      summary,
      passed,
    };
  }

  private isExcluded(path: string): boolean {
    return this.config.excludePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
      return regex.test(path);
    });
  }

  private scanForSecrets(file: { path: string; content: string }): SecurityFinding[] {
    const findings: SecurityFinding[] = [];
    const lines = file.content.split('\n');

    const secretPatterns = [
      { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i, name: 'API Key' },
      { pattern: /password\s*[:=]\s*['"][^'"]+['"]/i, name: 'Password' },
      { pattern: /secret\s*[:=]\s*['"][^'"]+['"]/i, name: 'Secret' },
      { pattern: /token\s*[:=]\s*['"][^'"]+['"]/i, name: 'Token' },
      { pattern: /private[_-]?key/i, name: 'Private Key Reference' },
      { pattern: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/, name: 'Private Key' },
    ];

    lines.forEach((line, lineNumber) => {
      for (const { pattern, name } of secretPatterns) {
        if (pattern.test(line)) {
          findings.push({
            id: `SEC-${Date.now()}-${lineNumber}`,
            severity: 'critical',
            category: 'secret',
            title: `Potential ${name} Exposure`,
            description: `Found what appears to be a ${name.toLowerCase()} in source code`,
            location: { file: file.path, line: lineNumber + 1 },
            recommendation: 'Remove secret from source code and use environment variables',
            cweId: 'CWE-798',
          });
        }
      }
    });

    return findings;
  }

  private scanCryptoUsage(file: { path: string; content: string }): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    const weakCrypto = [
      { pattern: /md5/i, name: 'MD5', severity: 'high' as const },
      { pattern: /sha1(?!256|384|512)/i, name: 'SHA1', severity: 'medium' as const },
      { pattern: /des(?!3)/i, name: 'DES', severity: 'high' as const },
      { pattern: /rc4/i, name: 'RC4', severity: 'high' as const },
    ];

    for (const { pattern, name, severity } of weakCrypto) {
      if (pattern.test(file.content)) {
        findings.push({
          id: `CRYPTO-${Date.now()}`,
          severity,
          category: 'crypto',
          title: `Weak Cryptographic Algorithm: ${name}`,
          description: `Usage of ${name} detected, which is considered cryptographically weak`,
          location: { file: file.path },
          recommendation: `Replace ${name} with a stronger algorithm (SHA-256, AES-256, etc.)`,
          cweId: 'CWE-327',
        });
      }
    }

    return findings;
  }

  private scanCodeVulnerabilities(file: { path: string; content: string }): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    const vulnPatterns = [
      { pattern: /eval\s*\(/, name: 'eval() usage', cwe: 'CWE-94', severity: 'high' as const },
      { pattern: /innerHTML\s*=/, name: 'innerHTML assignment', cwe: 'CWE-79', severity: 'medium' as const },
      { pattern: /dangerouslySetInnerHTML/, name: 'dangerouslySetInnerHTML', cwe: 'CWE-79', severity: 'medium' as const },
      { pattern: /child_process\.exec\s*\(/, name: 'Command injection risk', cwe: 'CWE-78', severity: 'high' as const },
    ];

    for (const { pattern, name, cwe, severity } of vulnPatterns) {
      if (pattern.test(file.content)) {
        findings.push({
          id: `VULN-${Date.now()}`,
          severity,
          category: 'vulnerability',
          title: name,
          description: `Potential security vulnerability detected: ${name}`,
          location: { file: file.path },
          recommendation: 'Review and sanitize input, use safer alternatives',
          cweId: cwe,
        });
      }
    }

    return findings;
  }

  generateReport(report: AuditReport): string {
    const lines: string[] = [
      '# Security Audit Report',
      '',
      `**Date:** ${report.timestamp.toISOString()}`,
      `**Duration:** ${report.duration}ms`,
      `**Status:** ${report.passed ? '✅ PASSED' : '❌ FAILED'}`,
      '',
      '## Summary',
      '',
      `| Severity | Count |`,
      `|----------|-------|`,
      `| Critical | ${report.summary.critical} |`,
      `| High | ${report.summary.high} |`,
      `| Medium | ${report.summary.medium} |`,
      `| Low | ${report.summary.low} |`,
      `| Info | ${report.summary.info} |`,
      '',
    ];

    if (report.findings.length > 0) {
      lines.push('## Findings');
      lines.push('');
      for (const finding of report.findings) {
        lines.push(`### ${finding.severity.toUpperCase()}: ${finding.title}`);
        lines.push('');
        lines.push(finding.description);
        if (finding.location) {
          lines.push(`**Location:** ${finding.location.file}${finding.location.line ? `:${finding.location.line}` : ''}`);
        }
        lines.push(`**Recommendation:** ${finding.recommendation}`);
        if (finding.cweId) {
          lines.push(`**CWE:** ${finding.cweId}`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}

export default SecurityAuditor;
