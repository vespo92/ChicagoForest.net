/**
 * OWASP Compliance Checker
 *
 * Validates code against OWASP Top 10 security risks.
 * https://owasp.org/www-project-top-ten/
 */

export interface OWASPFinding {
  category: OWASPCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location?: { file: string; line?: number };
  remediation: string;
  reference: string;
}

export type OWASPCategory =
  | 'A01:2021-Broken-Access-Control'
  | 'A02:2021-Cryptographic-Failures'
  | 'A03:2021-Injection'
  | 'A04:2021-Insecure-Design'
  | 'A05:2021-Security-Misconfiguration'
  | 'A06:2021-Vulnerable-Components'
  | 'A07:2021-Auth-Failures'
  | 'A08:2021-Software-Data-Integrity'
  | 'A09:2021-Security-Logging-Failures'
  | 'A10:2021-SSRF';

export interface OWASPComplianceReport {
  timestamp: Date;
  filesScanned: number;
  findings: OWASPFinding[];
  compliance: {
    category: OWASPCategory;
    passed: boolean;
    findingCount: number;
  }[];
  overallScore: number; // 0-100
}

const OWASP_PATTERNS: {
  category: OWASPCategory;
  patterns: { regex: RegExp; title: string; severity: OWASPFinding['severity'] }[];
  reference: string;
}[] = [
  {
    category: 'A01:2021-Broken-Access-Control',
    patterns: [
      { regex: /\.role\s*===?\s*['"]admin['"]/i, title: 'Hardcoded role check', severity: 'medium' },
      { regex: /req\.user\.id\s*!==?\s*\w+\.userId/i, title: 'Direct object reference', severity: 'high' },
      { regex: /isAdmin\s*:\s*true/i, title: 'Hardcoded admin flag', severity: 'high' },
      { regex: /cors\(\s*\)/i, title: 'CORS without configuration', severity: 'medium' },
    ],
    reference: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
  },
  {
    category: 'A02:2021-Cryptographic-Failures',
    patterns: [
      { regex: /md5\s*\(/i, title: 'MD5 hash usage', severity: 'high' },
      { regex: /sha1\s*\(/i, title: 'SHA1 hash usage', severity: 'medium' },
      { regex: /createCipher\s*\(/i, title: 'Deprecated crypto.createCipher', severity: 'high' },
      { regex: /http:\/\/(?!localhost|127\.0\.0\.1)/i, title: 'Unencrypted HTTP URL', severity: 'medium' },
      { regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/, title: 'Embedded private key', severity: 'critical' },
    ],
    reference: 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/',
  },
  {
    category: 'A03:2021-Injection',
    patterns: [
      { regex: /eval\s*\([^)]*\$\{/, title: 'eval() with template string', severity: 'critical' },
      { regex: /exec\s*\([^)]*\$\{/, title: 'exec() with template string', severity: 'critical' },
      { regex: /innerHTML\s*=\s*[^'"]/i, title: 'Dynamic innerHTML assignment', severity: 'high' },
      { regex: /\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/i, title: 'SQL injection risk', severity: 'critical' },
      { regex: /document\.write\s*\(/i, title: 'document.write usage', severity: 'high' },
    ],
    reference: 'https://owasp.org/Top10/A03_2021-Injection/',
  },
  {
    category: 'A04:2021-Insecure-Design',
    patterns: [
      { regex: /TODO:?\s*security/i, title: 'Security TODO comment', severity: 'medium' },
      { regex: /FIXME:?\s*auth/i, title: 'Auth FIXME comment', severity: 'medium' },
      { regex: /\/\/\s*disable.*security/i, title: 'Disabled security comment', severity: 'high' },
    ],
    reference: 'https://owasp.org/Top10/A04_2021-Insecure_Design/',
  },
  {
    category: 'A05:2021-Security-Misconfiguration',
    patterns: [
      { regex: /debug\s*:\s*true/i, title: 'Debug mode enabled', severity: 'medium' },
      { regex: /NODE_ENV.*development/i, title: 'Development environment reference', severity: 'low' },
      { regex: /helmet\(\s*\{[^}]*contentSecurityPolicy\s*:\s*false/, title: 'CSP disabled', severity: 'high' },
      { regex: /X-Powered-By/, title: 'X-Powered-By header exposure', severity: 'low' },
    ],
    reference: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/',
  },
  {
    category: 'A06:2021-Vulnerable-Components',
    patterns: [
      { regex: /require\s*\(\s*['"](?:request|node-fetch@1|lodash@[0-3])['"]\s*\)/, title: 'Potentially vulnerable package import', severity: 'medium' },
    ],
    reference: 'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/',
  },
  {
    category: 'A07:2021-Auth-Failures',
    patterns: [
      { regex: /password\s*===?\s*['"][^'"]+['"]/i, title: 'Hardcoded password comparison', severity: 'critical' },
      { regex: /jwt\.verify.*algorithms?\s*:\s*\[?\s*['"]none['"]/i, title: 'JWT none algorithm allowed', severity: 'critical' },
      { regex: /session.*secure\s*:\s*false/i, title: 'Insecure session cookie', severity: 'high' },
      { regex: /maxLoginAttempts\s*:\s*(?:10\d+|999)/i, title: 'Excessive login attempts allowed', severity: 'medium' },
    ],
    reference: 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/',
  },
  {
    category: 'A08:2021-Software-Data-Integrity',
    patterns: [
      { regex: /integrity\s*:\s*false/i, title: 'Integrity check disabled', severity: 'high' },
      { regex: /verify\s*:\s*false/i, title: 'Verification disabled', severity: 'high' },
      { regex: /--no-verify/, title: 'Git no-verify flag', severity: 'medium' },
    ],
    reference: 'https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/',
  },
  {
    category: 'A09:2021-Security-Logging-Failures',
    patterns: [
      { regex: /console\.log\s*\(.*(?:password|token|secret|key)/i, title: 'Sensitive data logged', severity: 'high' },
      { regex: /catch\s*\(\s*\w*\s*\)\s*\{\s*\}/, title: 'Empty catch block', severity: 'medium' },
      { regex: /\.catch\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)/, title: 'Swallowed promise error', severity: 'medium' },
    ],
    reference: 'https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/',
  },
  {
    category: 'A10:2021-SSRF',
    patterns: [
      { regex: /fetch\s*\([^)]*req\.(body|query|params)/i, title: 'User-controlled fetch URL', severity: 'high' },
      { regex: /axios\s*\([^)]*\$\{/i, title: 'Dynamic axios URL', severity: 'high' },
      { regex: /http\.request\s*\([^)]*req\./i, title: 'User-controlled HTTP request', severity: 'high' },
    ],
    reference: 'https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/',
  },
];

export class OWASPComplianceChecker {
  private findings: OWASPFinding[] = [];

  async check(files: { path: string; content: string }[]): Promise<OWASPComplianceReport> {
    this.findings = [];

    for (const file of files) {
      this.scanFile(file);
    }

    const categoryResults = this.calculateCategoryCompliance();
    const overallScore = this.calculateOverallScore(categoryResults);

    return {
      timestamp: new Date(),
      filesScanned: files.length,
      findings: this.findings,
      compliance: categoryResults,
      overallScore,
    };
  }

  private scanFile(file: { path: string; content: string }): void {
    const lines = file.content.split('\n');

    for (const owaspCategory of OWASP_PATTERNS) {
      for (const pattern of owaspCategory.patterns) {
        lines.forEach((line, lineNumber) => {
          if (pattern.regex.test(line)) {
            this.findings.push({
              category: owaspCategory.category,
              severity: pattern.severity,
              title: pattern.title,
              description: `Potential ${owaspCategory.category} violation detected`,
              location: { file: file.path, line: lineNumber + 1 },
              remediation: this.getRemediation(owaspCategory.category),
              reference: owaspCategory.reference,
            });
          }
        });
      }
    }
  }

  private getRemediation(category: OWASPCategory): string {
    const remediations: Record<OWASPCategory, string> = {
      'A01:2021-Broken-Access-Control': 'Implement proper access control checks at every access point. Use role-based access control (RBAC) and verify permissions server-side.',
      'A02:2021-Cryptographic-Failures': 'Use strong, modern cryptographic algorithms. Encrypt sensitive data at rest and in transit. Never store passwords in plain text.',
      'A03:2021-Injection': 'Use parameterized queries and prepared statements. Validate and sanitize all user input. Use context-aware output encoding.',
      'A04:2021-Insecure-Design': 'Follow secure design patterns. Conduct threat modeling. Implement security requirements early in development.',
      'A05:2021-Security-Misconfiguration': 'Implement secure configuration defaults. Remove unnecessary features and frameworks. Keep software updated.',
      'A06:2021-Vulnerable-Components': 'Regularly audit and update dependencies. Use tools like npm audit. Remove unused dependencies.',
      'A07:2021-Auth-Failures': 'Implement MFA. Use secure session management. Implement rate limiting and account lockout.',
      'A08:2021-Software-Data-Integrity': 'Verify integrity of software updates and dependencies. Use digital signatures. Implement proper CI/CD security.',
      'A09:2021-Security-Logging-Failures': 'Log all authentication events. Ensure logs are tamper-proof. Implement log monitoring and alerting.',
      'A10:2021-SSRF': 'Validate and sanitize all URLs. Use allowlists for external resources. Implement network segmentation.',
    };
    return remediations[category];
  }

  private calculateCategoryCompliance(): OWASPComplianceReport['compliance'] {
    const categories: OWASPCategory[] = [
      'A01:2021-Broken-Access-Control',
      'A02:2021-Cryptographic-Failures',
      'A03:2021-Injection',
      'A04:2021-Insecure-Design',
      'A05:2021-Security-Misconfiguration',
      'A06:2021-Vulnerable-Components',
      'A07:2021-Auth-Failures',
      'A08:2021-Software-Data-Integrity',
      'A09:2021-Security-Logging-Failures',
      'A10:2021-SSRF',
    ];

    return categories.map(category => {
      const categoryFindings = this.findings.filter(f => f.category === category);
      const hasCritical = categoryFindings.some(f => f.severity === 'critical');
      const hasHigh = categoryFindings.some(f => f.severity === 'high');

      return {
        category,
        passed: !hasCritical && !hasHigh,
        findingCount: categoryFindings.length,
      };
    });
  }

  private calculateOverallScore(compliance: OWASPComplianceReport['compliance']): number {
    const passedCategories = compliance.filter(c => c.passed).length;
    const totalCategories = compliance.length;
    const severityPenalty = this.findings.reduce((penalty, finding) => {
      switch (finding.severity) {
        case 'critical': return penalty + 10;
        case 'high': return penalty + 5;
        case 'medium': return penalty + 2;
        case 'low': return penalty + 1;
        default: return penalty;
      }
    }, 0);

    const baseScore = (passedCategories / totalCategories) * 100;
    return Math.max(0, Math.round(baseScore - severityPenalty));
  }

  generateReport(report: OWASPComplianceReport): string {
    const lines: string[] = [
      '# OWASP Top 10 Compliance Report',
      '',
      `**Date:** ${report.timestamp.toISOString()}`,
      `**Files Scanned:** ${report.filesScanned}`,
      `**Overall Score:** ${report.overallScore}/100`,
      '',
      '## Category Compliance',
      '',
      '| Category | Status | Findings |',
      '|----------|--------|----------|',
    ];

    for (const category of report.compliance) {
      const status = category.passed ? '✅ PASS' : '❌ FAIL';
      lines.push(`| ${category.category} | ${status} | ${category.findingCount} |`);
    }

    if (report.findings.length > 0) {
      lines.push('', '## Detailed Findings', '');

      const grouped = report.findings.reduce((acc, finding) => {
        if (!acc[finding.category]) acc[finding.category] = [];
        acc[finding.category].push(finding);
        return acc;
      }, {} as Record<OWASPCategory, OWASPFinding[]>);

      for (const [category, findings] of Object.entries(grouped)) {
        lines.push(`### ${category}`, '');
        for (const finding of findings) {
          lines.push(`#### ${finding.severity.toUpperCase()}: ${finding.title}`);
          lines.push('');
          lines.push(finding.description);
          if (finding.location) {
            lines.push(`**Location:** ${finding.location.file}${finding.location.line ? `:${finding.location.line}` : ''}`);
          }
          lines.push(`**Remediation:** ${finding.remediation}`);
          lines.push(`**Reference:** ${finding.reference}`);
          lines.push('');
        }
      }
    }

    return lines.join('\n');
  }
}

export default OWASPComplianceChecker;
