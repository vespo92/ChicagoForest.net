/**
 * Verification Report Generators
 *
 * Agent 11: Verifier - Report generation exports
 */

import type { VerificationReport } from '../types';

// Main report generator
export * from './report-generator';
export { default as ReportGenerator } from './report-generator';

// Re-export types
export interface ReportFormat {
  format: 'json' | 'markdown' | 'html' | 'csv';
}

/**
 * Generate markdown report (convenience function)
 */
export function generateMarkdownReport(report: VerificationReport): string {
  const { default: ReportGenerator } = require('./report-generator');
  return new ReportGenerator().toMarkdown(report);
}

/**
 * Generate JSON report (convenience function)
 */
export function generateJsonReport(report: VerificationReport): string {
  const { default: ReportGenerator } = require('./report-generator');
  return new ReportGenerator().toJson(report);
}

/**
 * Generate HTML report (convenience function)
 */
export function generateHtmlReport(report: VerificationReport): string {
  const { default: ReportGenerator } = require('./report-generator');
  return new ReportGenerator().toHtml(report);
}

/**
 * Generate CSV report (convenience function)
 */
export function generateCsvReport(report: VerificationReport): string {
  const { default: ReportGenerator } = require('./report-generator');
  return new ReportGenerator().toCsv(report);
}
