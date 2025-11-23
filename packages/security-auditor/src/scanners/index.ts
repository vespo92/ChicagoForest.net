/**
 * Security Scanners
 *
 * Specialized scanners for different security concerns.
 */

export interface DependencyVulnerability {
  package: string;
  version: string;
  vulnerability: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  fixedIn?: string;
  cveId?: string;
}

export interface ScanResult {
  scannedAt: Date;
  itemsScanned: number;
  issuesFound: number;
}

export function scanDependencies(
  packageJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
): DependencyVulnerability[] {
  // In production, this would call npm audit or similar
  // For now, return known patterns to watch for
  const vulnerabilities: DependencyVulnerability[] = [];

  const knownVulnerable: Record<string, { maxSafe: string; severity: DependencyVulnerability['severity'] }> = {
    'lodash': { maxSafe: '4.17.21', severity: 'high' },
    'minimist': { maxSafe: '1.2.6', severity: 'critical' },
    'node-fetch': { maxSafe: '2.6.7', severity: 'high' },
  };

  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  for (const [pkg, version] of Object.entries(allDeps)) {
    if (knownVulnerable[pkg]) {
      // Simple version check (in production use semver)
      vulnerabilities.push({
        package: pkg,
        version: version.replace(/[\^~]/, ''),
        vulnerability: `Known vulnerability in ${pkg}`,
        severity: knownVulnerable[pkg].severity,
        fixedIn: knownVulnerable[pkg].maxSafe,
      });
    }
  }

  return vulnerabilities;
}

export function scanForHardcodedIPs(content: string): string[] {
  const ipPattern = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const matches = content.match(ipPattern) || [];

  // Filter out common safe IPs
  const safeIPs = ['127.0.0.1', '0.0.0.0', '255.255.255.255'];
  return matches.filter(ip => !safeIPs.includes(ip));
}

export function scanForSQLInjection(content: string): { line: number; code: string }[] {
  const issues: { line: number; code: string }[] = [];
  const lines = content.split('\n');

  const sqlPatterns = [
    /`[^`]*\$\{[^}]+\}[^`]*`.*(?:select|insert|update|delete|from|where)/i,
    /'.*\+.*'.*(?:select|insert|update|delete|from|where)/i,
    /query\s*\([^)]*\+/i,
  ];

  lines.forEach((line, index) => {
    for (const pattern of sqlPatterns) {
      if (pattern.test(line)) {
        issues.push({ line: index + 1, code: line.trim() });
        break;
      }
    }
  });

  return issues;
}

export function scanForXSS(content: string): { line: number; issue: string }[] {
  const issues: { line: number; issue: string }[] = [];
  const lines = content.split('\n');

  const xssPatterns = [
    { pattern: /innerHTML\s*=\s*[^"']/, issue: 'Unescaped innerHTML' },
    { pattern: /document\.write\s*\(/, issue: 'document.write usage' },
    { pattern: /\.html\s*\([^)]*\$/, issue: 'jQuery html() with variable' },
    { pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:/, issue: 'dangerouslySetInnerHTML' },
  ];

  lines.forEach((line, index) => {
    for (const { pattern, issue } of xssPatterns) {
      if (pattern.test(line)) {
        issues.push({ line: index + 1, issue });
      }
    }
  });

  return issues;
}
