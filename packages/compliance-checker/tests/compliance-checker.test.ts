/**
 * Agent 13: Compliance - Main ComplianceChecker Tests
 *
 * Tests for the main ComplianceChecker class and report generation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComplianceChecker, RED_LINES, type ComplianceReport } from '../src/index';

describe('RED_LINES', () => {
  it('should contain operational claim patterns', () => {
    expect(RED_LINES.operationalClaims).toContain('working device');
    expect(RED_LINES.operationalClaims).toContain('proven technology');
    expect(RED_LINES.operationalClaims).toContain('generates power');
  });

  it('should contain investment language patterns', () => {
    expect(RED_LINES.investmentLanguage).toContain('investment opportunity');
    expect(RED_LINES.investmentLanguage).toContain('guaranteed returns');
    expect(RED_LINES.investmentLanguage).toContain('buy now');
  });

  it('should contain false promise patterns', () => {
    expect(RED_LINES.falsePromises).toContain('will solve');
    expect(RED_LINES.falsePromises).toContain('guaranteed to');
    expect(RED_LINES.falsePromises).toContain('scientifically proven');
  });
});

describe('ComplianceChecker', () => {
  let checker: ComplianceChecker;

  beforeEach(() => {
    checker = new ComplianceChecker();
  });

  describe('checkContent', () => {
    it('should detect operational claims', () => {
      const violations = checker.checkContent('This working device generates power.');
      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.type === 'red_line')).toBe(true);
    });

    it('should detect investment language', () => {
      const violations = checker.checkContent('Great investment opportunity here!');
      expect(violations.some(v => v.message.includes('investmentLanguage'))).toBe(true);
    });

    it('should detect false promises', () => {
      const violations = checker.checkContent('This will solve all energy problems.');
      expect(violations.some(v => v.message.includes('falsePromises'))).toBe(true);
    });

    it('should return empty array for clean content', () => {
      const violations = checker.checkContent('This theoretical framework is AI-generated.');
      expect(violations).toHaveLength(0);
    });

    it('should include file path in violations', () => {
      const violations = checker.checkContent('Working device available!', 'test.md');
      expect(violations[0].location.file).toBe('test.md');
    });

    it('should be case insensitive', () => {
      const violations = checker.checkContent('WORKING DEVICE generates POWER');
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('checkDisclaimer', () => {
    it('should pass when AI-generated disclaimer present', () => {
      const violations = checker.checkDisclaimer('This is AI-generated content.');
      expect(violations).toHaveLength(0);
    });

    it('should pass when theoretical framework present', () => {
      const violations = checker.checkDisclaimer('This theoretical framework describes...');
      expect(violations).toHaveLength(0);
    });

    it('should pass when not operational present', () => {
      const violations = checker.checkDisclaimer('This system is not operational.');
      expect(violations).toHaveLength(0);
    });

    it('should fail when no disclaimer present', () => {
      const violations = checker.checkDisclaimer('The plasma network transmits energy.');
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].type).toBe('missing_disclaimer');
      expect(violations[0].severity).toBe('high');
    });
  });

  describe('checkUrls', () => {
    it('should pass trusted domains', () => {
      const violations = checker.checkUrls('See https://patents.google.com/patent/US645576A');
      expect(violations).toHaveLength(0);
    });

    it('should pass DOI links', () => {
      const violations = checker.checkUrls('Reference: https://doi.org/10.1234/example');
      expect(violations).toHaveLength(0);
    });

    it('should pass archive.org links', () => {
      const violations = checker.checkUrls('Archive: https://archive.org/details/tesla');
      expect(violations).toHaveLength(0);
    });

    it('should flag unverified domains', () => {
      const violations = checker.checkUrls('See https://unknowndomain.xyz/source');
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].severity).toBe('medium');
    });

    it('should flag invalid URLs', () => {
      const violations = checker.checkUrls('See https://[invalid-url');
      expect(violations.some(v => v.message.includes('Invalid URL'))).toBe(true);
    });
  });

  describe('generateReport', () => {
    it('should generate report for multiple files', () => {
      const files = [
        { path: 'file1.md', content: 'This is AI-generated content.' },
        { path: 'file2.md', content: 'This theoretical framework is valid.' },
      ];
      const report = checker.generateReport(files);
      expect(report.totalFiles).toBe(2);
      expect(report.overallStatus).toBe('pass');
    });

    it('should fail on critical violations', () => {
      const files = [
        { path: 'file1.md', content: 'This working device generates power.' },
      ];
      const report = checker.generateReport(files);
      expect(report.overallStatus).toBe('fail');
      expect(report.violations.some(v => v.severity === 'critical')).toBe(true);
    });

    it('should warn on high severity violations', () => {
      const files = [
        { path: 'file1.md', content: 'The plasma network transmits energy efficiently.' },
      ];
      const report = checker.generateReport(files);
      expect(report.overallStatus).toBe('warning');
    });

    it('should track compliant files count', () => {
      const files = [
        { path: 'clean.md', content: 'This is AI-generated theoretical content.' },
        { path: 'bad.md', content: 'Working device for sale!' },
      ];
      const report = checker.generateReport(files);
      expect(report.compliantFiles).toBe(1);
    });

    it('should include timestamp', () => {
      const report = checker.generateReport([]);
      expect(report.timestamp).toBeInstanceOf(Date);
    });
  });
});

describe('ComplianceReport interface', () => {
  it('should have correct structure', () => {
    const checker = new ComplianceChecker();
    const report = checker.generateReport([
      { path: 'test.md', content: 'AI-generated content' },
    ]);

    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('totalFiles');
    expect(report).toHaveProperty('compliantFiles');
    expect(report).toHaveProperty('violations');
    expect(report).toHaveProperty('overallStatus');
    expect(Array.isArray(report.violations)).toBe(true);
  });
});
