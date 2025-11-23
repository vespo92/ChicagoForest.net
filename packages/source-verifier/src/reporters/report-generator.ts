/**
 * Verification Report Generator
 *
 * Agent 11: Verifier - Comprehensive report generation
 *
 * Features:
 * - Multiple output formats (JSON, Markdown, HTML, CSV)
 * - Summary statistics
 * - Issue categorization
 * - Recommendations generation
 * - CI/CD integration support
 */

import {
  VerificationReport,
  VerificationResult,
  VerificationIssue,
  UrlVerificationResult,
  DoiVerificationResult,
  PatentVerificationResult,
  ArchiveVerificationResult,
  ReportFormat,
} from '../types';

/**
 * Generate unique report ID
 */
function generateReportId(): string {
  return `vr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Classify verification result into issue
 */
function classifyIssue(result: VerificationResult): VerificationIssue | null {
  if (result.isValid) return null;

  const baseIssue = {
    source: result.source,
    type: result.type,
  };

  if (result.status === 'unreachable') {
    return {
      ...baseIssue,
      severity: 'error',
      message: `Source is unreachable: ${result.errorMessage || 'Network error'}`,
      suggestion: 'Verify the URL is correct and the server is accessible',
    };
  }

  if (result.status === 'invalid') {
    return {
      ...baseIssue,
      severity: 'warning',
      message: `Invalid source format: ${result.errorMessage || 'Validation failed'}`,
      suggestion: 'Check the source format and update if necessary',
    };
  }

  return {
    ...baseIssue,
    severity: 'info',
    message: result.errorMessage || 'Unknown issue',
  };
}

/**
 * Generate recommendations based on results
 */
function generateRecommendations(
  results: VerificationResult[],
  issues: VerificationIssue[]
): string[] {
  const recommendations: string[] = [];

  // Count issues by severity
  const errors = issues.filter(i => i.severity === 'error').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;

  if (errors > 0) {
    recommendations.push(
      `${errors} source(s) are unreachable and need immediate attention.`
    );
  }

  if (warnings > 0) {
    recommendations.push(
      `${warnings} source(s) have validation warnings that should be reviewed.`
    );
  }

  // Check for specific issue patterns
  const urlIssues = results.filter(r => r.type === 'url' && !r.isValid);
  if (urlIssues.length > results.filter(r => r.type === 'url').length * 0.1) {
    recommendations.push(
      'More than 10% of URLs are failing. Consider reviewing link maintenance process.'
    );
  }

  // Check DOI issues
  const doiIssues = results.filter(r => r.type === 'doi' && !r.isValid);
  if (doiIssues.length > 0) {
    recommendations.push(
      'Some DOIs are invalid. Verify DOI format follows the 10.xxxx/suffix pattern.'
    );
  }

  // Check patent issues
  const patentIssues = results.filter(r => r.type === 'patent' && !r.isValid);
  if (patentIssues.length > 0) {
    recommendations.push(
      'Some patent numbers have invalid formats. Verify patent number conventions.'
    );
  }

  // General recommendations
  const successRate =
    results.filter(r => r.isValid).length / results.length;
  if (successRate < 0.9) {
    recommendations.push(
      `Overall success rate is ${(successRate * 100).toFixed(1)}%. Target is 90%+.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'All sources verified successfully. Continue regular monitoring.'
    );
  }

  return recommendations;
}

/**
 * Report Generator class
 */
export class ReportGenerator {
  /**
   * Generate verification report from results
   */
  generate(results: VerificationResult[]): VerificationReport {
    const startTime = Date.now();

    // Categorize results by type
    const urls = results.filter(
      (r): r is UrlVerificationResult => r.type === 'url'
    );
    const dois = results.filter(
      (r): r is DoiVerificationResult => r.type === 'doi'
    );
    const patents = results.filter(
      (r): r is PatentVerificationResult => r.type === 'patent'
    );
    const archives = results.filter(
      (r): r is ArchiveVerificationResult => r.type === 'archive'
    );

    // Calculate summary
    const totalSources = results.length;
    const validSources = results.filter(r => r.isValid).length;
    const invalidSources = results.filter(
      r => !r.isValid && r.status === 'invalid'
    ).length;
    const unreachableSources = results.filter(
      r => r.status === 'unreachable'
    ).length;
    const staleSources = results.filter(r => r.status === 'stale').length;

    // Generate issues
    const issues = results
      .map(classifyIssue)
      .filter((i): i is VerificationIssue => i !== null);

    // Generate recommendations
    const recommendations = generateRecommendations(results, issues);

    return {
      id: generateReportId(),
      timestamp: new Date(),
      duration: Date.now() - startTime,
      summary: {
        totalSources,
        validSources,
        invalidSources,
        unreachableSources,
        staleSources,
        successRate:
          totalSources > 0 ? (validSources / totalSources) * 100 : 0,
      },
      byType: {
        urls,
        dois,
        patents,
        archives,
      },
      issues,
      recommendations,
    };
  }

  /**
   * Format report as JSON
   */
  toJson(report: VerificationReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Format report as Markdown
   */
  toMarkdown(report: VerificationReport): string {
    const lines: string[] = [
      '# Source Verification Report',
      '',
      `**Report ID:** ${report.id}`,
      `**Generated:** ${report.timestamp.toISOString()}`,
      `**Duration:** ${report.duration}ms`,
      '',
      '## Summary',
      '',
      '| Metric | Count |',
      '|--------|-------|',
      `| Total Sources | ${report.summary.totalSources} |`,
      `| Valid | ${report.summary.validSources} |`,
      `| Invalid | ${report.summary.invalidSources} |`,
      `| Unreachable | ${report.summary.unreachableSources} |`,
      `| Stale | ${report.summary.staleSources} |`,
      '',
      `**Success Rate:** ${report.summary.successRate.toFixed(1)}%`,
      '',
    ];

    // By Type breakdown
    lines.push('## Results by Type', '');

    if (report.byType.urls.length > 0) {
      lines.push(
        `### URLs (${report.byType.urls.length})`,
        '',
        `- Valid: ${report.byType.urls.filter(u => u.isValid).length}`,
        `- Invalid: ${report.byType.urls.filter(u => !u.isValid).length}`,
        ''
      );
    }

    if (report.byType.dois.length > 0) {
      lines.push(
        `### DOIs (${report.byType.dois.length})`,
        '',
        `- Valid: ${report.byType.dois.filter(d => d.isValid).length}`,
        `- Invalid: ${report.byType.dois.filter(d => !d.isValid).length}`,
        ''
      );
    }

    if (report.byType.patents.length > 0) {
      lines.push(
        `### Patents (${report.byType.patents.length})`,
        '',
        `- Valid: ${report.byType.patents.filter(p => p.isValid).length}`,
        `- Invalid: ${report.byType.patents.filter(p => !p.isValid).length}`,
        ''
      );
    }

    if (report.byType.archives.length > 0) {
      lines.push(
        `### Archives (${report.byType.archives.length})`,
        '',
        `- Valid: ${report.byType.archives.filter(a => a.isValid).length}`,
        `- Invalid: ${report.byType.archives.filter(a => !a.isValid).length}`,
        ''
      );
    }

    // Issues section
    if (report.issues.length > 0) {
      lines.push('## Issues Found', '');

      const errors = report.issues.filter(i => i.severity === 'error');
      const warnings = report.issues.filter(i => i.severity === 'warning');

      if (errors.length > 0) {
        lines.push('### Errors', '');
        for (const issue of errors) {
          lines.push(`- **${issue.source}**`);
          lines.push(`  - ${issue.message}`);
          if (issue.suggestion) {
            lines.push(`  - *Suggestion:* ${issue.suggestion}`);
          }
        }
        lines.push('');
      }

      if (warnings.length > 0) {
        lines.push('### Warnings', '');
        for (const issue of warnings) {
          lines.push(`- **${issue.source}**`);
          lines.push(`  - ${issue.message}`);
          if (issue.suggestion) {
            lines.push(`  - *Suggestion:* ${issue.suggestion}`);
          }
        }
        lines.push('');
      }
    }

    // Recommendations
    lines.push('## Recommendations', '');
    for (const rec of report.recommendations) {
      lines.push(`- ${rec}`);
    }
    lines.push('');

    // Footer
    lines.push(
      '---',
      '',
      '*Generated by Chicago Forest Network Source Verifier (Agent 11: Verifier)*',
      '',
      '**DISCLAIMER:** This is part of an AI-generated theoretical framework.',
      'All source verification is performed against real, documented archives.'
    );

    return lines.join('\n');
  }

  /**
   * Format report as HTML
   */
  toHtml(report: VerificationReport): string {
    const successRate = report.summary.successRate.toFixed(1);
    const statusColor =
      parseFloat(successRate) >= 90
        ? '#28a745'
        : parseFloat(successRate) >= 70
        ? '#ffc107'
        : '#dc3545';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Source Verification Report - ${report.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #2c3e50; margin-bottom: 10px; }
    h2 { color: #34495e; margin: 20px 0 10px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
    .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat { text-align: center; padding: 15px; border-radius: 8px; background: #f8f9fa; }
    .stat.valid { background: #d4edda; }
    .stat.invalid { background: #f8d7da; }
    .stat.unreachable { background: #fff3cd; }
    .stat-value { font-size: 2em; font-weight: bold; }
    .stat-label { font-size: 0.85em; color: #666; }
    .success-rate { text-align: center; font-size: 2.5em; font-weight: bold; color: ${statusColor}; margin: 20px 0; }
    .issue { padding: 10px 15px; margin: 10px 0; border-left: 4px solid; border-radius: 0 4px 4px 0; background: #f8f9fa; }
    .issue.error { border-color: #dc3545; }
    .issue.warning { border-color: #ffc107; }
    .issue.info { border-color: #17a2b8; }
    .issue-source { font-weight: bold; font-family: monospace; }
    .issue-message { margin-top: 5px; }
    .issue-suggestion { margin-top: 5px; font-style: italic; color: #666; }
    .recommendation { padding: 10px 15px; margin: 5px 0; background: #e3f2fd; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; font-weight: 600; }
    .valid-badge { color: #28a745; }
    .invalid-badge { color: #dc3545; }
    .disclaimer { font-size: 0.85em; color: #666; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Source Verification Report</h1>
    <div class="meta">
      <strong>Report ID:</strong> ${report.id}<br>
      <strong>Generated:</strong> ${report.timestamp.toISOString()}<br>
      <strong>Duration:</strong> ${report.duration}ms
    </div>

    <h2>Summary</h2>
    <div class="summary">
      <div class="stat"><div class="stat-value">${report.summary.totalSources}</div><div class="stat-label">Total</div></div>
      <div class="stat valid"><div class="stat-value">${report.summary.validSources}</div><div class="stat-label">Valid</div></div>
      <div class="stat invalid"><div class="stat-value">${report.summary.invalidSources}</div><div class="stat-label">Invalid</div></div>
      <div class="stat unreachable"><div class="stat-value">${report.summary.unreachableSources}</div><div class="stat-label">Unreachable</div></div>
    </div>
    <div class="success-rate">${successRate}% Success Rate</div>
  </div>

  ${
    report.issues.length > 0
      ? `
  <div class="card">
    <h2>Issues (${report.issues.length})</h2>
    ${report.issues
      .map(
        issue => `
    <div class="issue ${issue.severity}">
      <div class="issue-source">${issue.source}</div>
      <div class="issue-message">${issue.message}</div>
      ${issue.suggestion ? `<div class="issue-suggestion">Suggestion: ${issue.suggestion}</div>` : ''}
    </div>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }

  <div class="card">
    <h2>Recommendations</h2>
    ${report.recommendations.map(r => `<div class="recommendation">${r}</div>`).join('')}
  </div>

  <div class="disclaimer">
    <p><strong>Chicago Forest Network Source Verifier (Agent 11: Verifier)</strong></p>
    <p>DISCLAIMER: This is part of an AI-generated theoretical framework.<br>
    All source verification is performed against real, documented archives.</p>
  </div>
</body>
</html>`;
  }

  /**
   * Format report as CSV
   */
  toCsv(report: VerificationReport): string {
    const lines: string[] = [
      'source,type,status,isValid,responseTime,errorMessage,lastChecked',
    ];

    const allResults = [
      ...report.byType.urls,
      ...report.byType.dois,
      ...report.byType.patents,
      ...report.byType.archives,
    ];

    for (const result of allResults) {
      const row = [
        `"${result.source.replace(/"/g, '""')}"`,
        result.type,
        result.status,
        result.isValid,
        result.responseTime || '',
        result.errorMessage ? `"${result.errorMessage.replace(/"/g, '""')}"` : '',
        result.lastChecked.toISOString(),
      ];
      lines.push(row.join(','));
    }

    return lines.join('\n');
  }

  /**
   * Format report to specified format
   */
  format(report: VerificationReport, format: ReportFormat): string {
    switch (format) {
      case 'json':
        return this.toJson(report);
      case 'markdown':
        return this.toMarkdown(report);
      case 'html':
        return this.toHtml(report);
      case 'csv':
        return this.toCsv(report);
      default:
        return this.toJson(report);
    }
  }
}

export default ReportGenerator;
