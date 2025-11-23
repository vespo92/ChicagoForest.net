/**
 * Agent 13: Compliance - Scanner Tests
 *
 * Tests for file scanning and violation detection.
 */

import { describe, it, expect } from 'vitest';
import {
  scanForRedLines,
  scanForMissingDisclaimers,
  scanForFabricatedUrls,
  scanFile,
} from '../src/scanners';

describe('scanForRedLines', () => {
  it('should detect "working energy" violations', () => {
    const content = 'This working energy device is available now.';
    const violations = scanForRedLines(content, 'test.md');
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].type).toBe('red_line');
    expect(violations[0].severity).toBe('critical');
  });

  it('should detect "proven technology" violations', () => {
    const content = 'This is proven technology validated by scientists.';
    const violations = scanForRedLines(content, 'test.md');
    expect(violations.some(v => v.message.includes('proof'))).toBe(true);
  });

  it('should detect "investment opportunity" violations', () => {
    const content = 'This is a great investment opportunity.';
    const violations = scanForRedLines(content, 'test.md');
    expect(violations.some(v => v.message.includes('financial'))).toBe(true);
  });

  it('should detect "guaranteed" violations', () => {
    const content = 'Results are guaranteed with this system.';
    const violations = scanForRedLines(content, 'test.md');
    expect(violations.some(v => v.message.includes('promise'))).toBe(true);
  });

  it('should include correct line numbers', () => {
    const content = 'Line 1\nLine 2\nThis is working energy here\nLine 4';
    const violations = scanForRedLines(content, 'test.md');
    expect(violations[0].location.line).toBe(3);
  });

  it('should return no violations for clean content', () => {
    const content = 'This theoretical framework explores possibilities.';
    const violations = scanForRedLines(content, 'test.md');
    expect(violations).toHaveLength(0);
  });
});

describe('scanForMissingDisclaimers', () => {
  it('should detect missing disclaimer in markdown files', () => {
    const content = 'A'.repeat(600); // Content over 500 chars without disclaimer
    const violations = scanForMissingDisclaimers(content, 'content.md');
    expect(violations).toHaveLength(1);
    expect(violations[0].type).toBe('missing_disclaimer');
    expect(violations[0].severity).toBe('high');
  });

  it('should pass when disclaimer is present', () => {
    const content = 'A'.repeat(600) + ' This is AI-generated content.';
    const violations = scanForMissingDisclaimers(content, 'content.md');
    expect(violations).toHaveLength(0);
  });

  it('should pass when theoretical disclaimer is present', () => {
    const content = 'A'.repeat(600) + ' This is a theoretical framework.';
    const violations = scanForMissingDisclaimers(content, 'content.md');
    expect(violations).toHaveLength(0);
  });

  it('should skip non-content files', () => {
    const content = 'A'.repeat(600); // No disclaimer
    const violations = scanForMissingDisclaimers(content, 'utils.ts');
    expect(violations).toHaveLength(0);
  });

  it('should skip short content', () => {
    const content = 'Short content without disclaimer';
    const violations = scanForMissingDisclaimers(content, 'content.md');
    expect(violations).toHaveLength(0);
  });
});

describe('scanForFabricatedUrls', () => {
  it('should detect example.com URLs', () => {
    const content = 'See https://example.com/fake-source for more info.';
    const violations = scanForFabricatedUrls(content, 'test.md');
    expect(violations).toHaveLength(1);
    expect(violations[0].type).toBe('fabricated_url');
  });

  it('should detect localhost URLs', () => {
    const content = 'API endpoint: http://localhost:3000/api';
    const violations = scanForFabricatedUrls(content, 'test.md');
    expect(violations.some(v => v.message.includes('localhost'))).toBe(true);
  });

  it('should detect 127.0.0.1 URLs', () => {
    const content = 'Test at http://127.0.0.1:8080/test';
    const violations = scanForFabricatedUrls(content, 'test.md');
    expect(violations.some(v => v.message.includes('127.0.0.1'))).toBe(true);
  });

  it('should detect placeholder URLs', () => {
    const content = 'Source: https://placeholder.com/source';
    const violations = scanForFabricatedUrls(content, 'test.md');
    expect(violations).toHaveLength(1);
  });

  it('should pass legitimate URLs', () => {
    const content = `
      Patent: https://patents.google.com/patent/US645576A
      Archive: https://archive.org/details/teslapapers
      Research: https://lenr-canr.org/acrobat/paper.pdf
    `;
    const violations = scanForFabricatedUrls(content, 'test.md');
    expect(violations).toHaveLength(0);
  });
});

describe('scanFile', () => {
  it('should run all scans by default', () => {
    const content = `
      This working energy device is available.
      See https://example.com for more info.
    `;
    const result = scanFile('A'.repeat(600) + content, 'content.md');
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations.some(v => v.type === 'red_line')).toBe(true);
    expect(result.violations.some(v => v.type === 'fabricated_url')).toBe(true);
  });

  it('should respect scan options', () => {
    const content = 'This working energy device uses example.com';
    const result = scanFile(content, 'test.md', {
      checkRedLines: true,
      checkUrls: false,
      checkDisclaimer: false,
    });
    expect(result.violations.some(v => v.type === 'red_line')).toBe(true);
    expect(result.violations.some(v => v.type === 'fabricated_url')).toBe(false);
  });

  it('should include scan timestamp', () => {
    const result = scanFile('Clean content', 'test.md');
    expect(result.scannedAt).toBeInstanceOf(Date);
  });

  it('should include file path in result', () => {
    const result = scanFile('Clean content', '/path/to/file.md');
    expect(result.path).toBe('/path/to/file.md');
  });
});
