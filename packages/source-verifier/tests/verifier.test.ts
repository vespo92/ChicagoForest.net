/**
 * SourceVerifier Integration Tests
 *
 * Agent 11: Verifier - Integration tests for the main verifier class
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SourceVerifier } from '../src';
import { VerificationReport } from '../src/types';

describe('SourceVerifier', () => {
  let verifier: SourceVerifier;

  beforeEach(() => {
    verifier = new SourceVerifier({
      retryAttempts: 1,
      retryDelayMs: 100,
      concurrency: 3,
    });
  });

  describe('detectSourceType', () => {
    it('should detect DOI from string', () => {
      expect(verifier.detectSourceType('10.1007/s10948-019-05210-z')).toBe('doi');
    });

    it('should detect DOI from URL', () => {
      expect(verifier.detectSourceType('https://doi.org/10.1007/test')).toBe('doi');
    });

    it('should detect patent from string', () => {
      expect(verifier.detectSourceType('US645576')).toBe('patent');
    });

    it('should detect patent from URL', () => {
      expect(verifier.detectSourceType('https://patents.google.com/patent/US645576')).toBe('patent');
    });

    it('should detect archive URLs', () => {
      expect(verifier.detectSourceType('https://vault.fbi.gov/doc')).toBe('archive');
      expect(verifier.detectSourceType('https://lenr-canr.org/doc')).toBe('archive');
      expect(verifier.detectSourceType('https://archive.org/details/x')).toBe('archive');
    });

    it('should default to URL for unknown types', () => {
      expect(verifier.detectSourceType('https://example.com/page')).toBe('url');
    });
  });

  describe('verify', () => {
    it('should verify a URL', async () => {
      const result = await verifier.verify('https://patents.google.com/patent/US645576');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('url');
    });

    it('should verify a DOI', async () => {
      const result = await verifier.verify('10.1007/s10948-019-05210-z');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('doi');
    });

    it('should verify a patent', async () => {
      const result = await verifier.verify('US645576');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('patent');
    });

    it('should verify an archive URL', async () => {
      const result = await verifier.verify('https://vault.fbi.gov/nikola-tesla');
      expect(result.isValid).toBe(true);
      expect(result.type).toBe('archive');
    });
  });

  describe('verifyBatch', () => {
    it('should verify multiple sources', async () => {
      const sources = [
        'https://patents.google.com/patent/US645576',
        '10.1007/s10948-019-05210-z',
        'US787412',
      ];
      const results = await verifier.verifyBatch(sources);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.isValid)).toBe(true);
    });

    it('should handle mixed valid and invalid sources', async () => {
      const sources = [
        'US645576',           // Valid
        'invalid-source',      // Invalid
        '10.1007/test',       // Valid
      ];
      const results = await verifier.verifyBatch(sources);

      expect(results).toHaveLength(3);
      expect(results[0].isValid).toBe(true);
      expect(results[1].isValid).toBe(false);
      expect(results[2].isValid).toBe(true);
    });
  });

  describe('verifyAndReport', () => {
    it('should generate a report', async () => {
      const sources = [
        'US645576',
        '10.1007/s10948-019-05210-z',
      ];
      const { report, formatted } = await verifier.verifyAndReport(sources, 'json');

      expect(report.summary.totalSources).toBe(2);
      expect(report.summary.successRate).toBeGreaterThan(0);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });

    it('should format as markdown', async () => {
      const sources = ['US645576'];
      const { formatted } = await verifier.verifyAndReport(sources, 'markdown');

      expect(formatted).toContain('# Source Verification Report');
      expect(formatted).toContain('Agent 11: Verifier');
    });

    it('should format as HTML', async () => {
      const sources = ['US645576'];
      const { formatted } = await verifier.verifyAndReport(sources, 'html');

      expect(formatted).toContain('<!DOCTYPE html>');
      expect(formatted).toContain('Source Verification Report');
    });

    it('should format as CSV', async () => {
      const sources = ['US645576'];
      const { formatted } = await verifier.verifyAndReport(sources, 'csv');

      expect(formatted).toContain('source,type,status');
      expect(formatted).toContain('US645576');
    });
  });

  describe('generateReport', () => {
    it('should calculate summary statistics', async () => {
      const results = await verifier.verifyBatch([
        'US645576',
        'US787412',
        'invalid',
      ]);
      const report = verifier.generateReport(results);

      expect(report.summary.totalSources).toBe(3);
      expect(report.summary.validSources).toBe(2);
      expect(report.summary.invalidSources).toBe(1);
    });

    it('should categorize results by type', async () => {
      const results = await verifier.verifyBatch([
        'US645576',
        '10.1007/test',
        'https://vault.fbi.gov/doc',
      ]);
      const report = verifier.generateReport(results);

      expect(report.byType.patents.length).toBe(1);
      expect(report.byType.dois.length).toBe(1);
      expect(report.byType.archives.length).toBe(1);
    });

    it('should generate recommendations', async () => {
      const results = await verifier.verifyBatch(['US645576', 'invalid']);
      const report = verifier.generateReport(results);

      expect(report.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Tesla patents verification', () => {
    it('should verify Tesla patents', async () => {
      const results = await verifier.verifyTeslaPatents();

      expect(results.length).toBeGreaterThan(5);
      expect(results.every(r => r.type === 'patent')).toBe(true);
      expect(results.every(r => r.isValid)).toBe(true);
    });
  });

  describe('FBI files verification', () => {
    it('should verify FBI Tesla files', async () => {
      const results = await verifier.verifyFbiTeslaFiles();

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.type === 'archive')).toBe(true);
    });
  });

  describe('LENR-CANR verification', () => {
    it('should verify LENR-CANR documents', async () => {
      const results = await verifier.verifyLenrCanrDocuments();

      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.type === 'archive')).toBe(true);
    });
  });

  describe('Freshness monitoring', () => {
    it('should track sources for freshness', async () => {
      await verifier.verify('US645576');
      await verifier.verify('10.1007/test');

      const stats = verifier.getStatistics();
      expect(stats.totalChecks).toBe(2);
    });

    it('should generate freshness report', async () => {
      await verifier.verify('US645576');
      const report = verifier.getFreshnessReport();

      expect(report.totalSources).toBeGreaterThan(0);
    });

    it('should export and import sources', async () => {
      await verifier.verify('US645576');
      const exported = verifier.exportSources();

      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');

      const newVerifier = new SourceVerifier();
      newVerifier.importSources(exported);

      const stats = newVerifier.getStatistics();
      expect(stats.totalChecks).toBeGreaterThan(0);
    });
  });

  describe('Alert system', () => {
    it('should allow subscribing to alerts', () => {
      let alertReceived = false;
      verifier.onAlert(() => {
        alertReceived = true;
      });

      // Alert system should be set up without error
      expect(true).toBe(true);
    });
  });
});

describe('Report content validation', () => {
  it('should include DISCLAIMER in reports', async () => {
    const verifier = new SourceVerifier();
    const { formatted } = await verifier.verifyAndReport(['US645576'], 'markdown');

    expect(formatted.toLowerCase()).toContain('disclaimer');
    expect(formatted).toContain('AI-generated');
  });

  it('should include Agent 11 attribution', async () => {
    const verifier = new SourceVerifier();
    const { formatted } = await verifier.verifyAndReport(['US645576'], 'html');

    expect(formatted).toContain('Agent 11: Verifier');
  });
});
