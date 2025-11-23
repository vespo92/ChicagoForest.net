/**
 * Validator Tests
 *
 * Agent 11: Verifier - Unit tests for source validators
 */

import { describe, it, expect } from 'vitest';
import {
  validateUrl,
  validateDOI,
  validatePatentNumber,
  validateArchiveUrl,
  validateSource,
} from '../src/validators';

describe('validateUrl', () => {
  it('should validate correct HTTPS URLs', () => {
    const result = validateUrl('https://patents.google.com/patent/US645576');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should warn about HTTP URLs', () => {
    const result = validateUrl('http://example.com');
    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('URL does not use HTTPS');
  });

  it('should reject invalid URLs', () => {
    const result = validateUrl('not-a-url');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid URL format');
  });

  it('should validate trusted domains', () => {
    const result = validateUrl('https://doi.org/10.1234/test');
    expect(result.isValid).toBe(true);
    expect(result.warnings).not.toContain('URL is from an unverified domain');
  });

  it('should warn about untrusted domains', () => {
    const result = validateUrl('https://unknown-domain.com/page');
    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('URL is from an unverified domain');
  });
});

describe('validateDOI', () => {
  it('should validate correct DOI format', () => {
    const result = validateDOI('10.1007/s10948-019-05210-z');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate DOI with URL prefix', () => {
    const result = validateDOI('https://doi.org/10.1007/s10948-019-05210-z');
    expect(result.isValid).toBe(true);
  });

  it('should validate DOI with dx.doi.org prefix', () => {
    const result = validateDOI('https://dx.doi.org/10.1016/j.nima.2009.10.113');
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid DOI format', () => {
    const result = validateDOI('invalid-doi');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid DOI format. Expected: 10.xxxx/xxxxx');
  });

  it('should reject DOI without prefix 10', () => {
    const result = validateDOI('11.1234/test');
    expect(result.isValid).toBe(false);
  });

  it('should identify known publishers', () => {
    // Nature Publishing (10.1038)
    const natureResult = validateDOI('10.1038/s41586-020-2491-6');
    expect(natureResult.isValid).toBe(true);
    expect(natureResult.warnings).not.toContain('DOI is from an unknown registrant');
  });
});

describe('validatePatentNumber', () => {
  it('should validate US patent format', () => {
    const result = validatePatentNumber('US645576');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate US patent with letter suffix', () => {
    const result = validatePatentNumber('US645576A');
    expect(result.isValid).toBe(true);
  });

  it('should validate longer US patent numbers', () => {
    const result = validatePatentNumber('US10234567');
    expect(result.isValid).toBe(true);
  });

  it('should validate European patents', () => {
    const result = validatePatentNumber('EP1234567');
    expect(result.isValid).toBe(true);
  });

  it('should validate WIPO patents', () => {
    const result = validatePatentNumber('WO2020123456');
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid patent format', () => {
    const result = validatePatentNumber('invalid');
    expect(result.isValid).toBe(false);
  });

  it('should handle lowercase input', () => {
    const result = validatePatentNumber('us645576');
    expect(result.isValid).toBe(true);
  });

  it('should handle spaces in input', () => {
    const result = validatePatentNumber('US 645576');
    expect(result.isValid).toBe(true);
  });
});

describe('validateArchiveUrl', () => {
  it('should validate FBI vault URLs', () => {
    const result = validateArchiveUrl('https://vault.fbi.gov/nikola-tesla');
    expect(result.isValid).toBe(true);
  });

  it('should validate LENR-CANR URLs', () => {
    const result = validateArchiveUrl('https://lenr-canr.org/acrobat/document.pdf');
    expect(result.isValid).toBe(true);
  });

  it('should validate Internet Archive URLs', () => {
    const result = validateArchiveUrl('https://archive.org/details/document');
    expect(result.isValid).toBe(true);
  });

  it('should validate Wayback Machine URLs', () => {
    const result = validateArchiveUrl('https://web.archive.org/web/20200101/https://example.com');
    expect(result.isValid).toBe(true);
  });

  it('should warn about unrecognized archive URLs', () => {
    const result = validateArchiveUrl('https://other-archive.com/doc');
    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('URL is not from a recognized archive');
  });
});

describe('validateSource', () => {
  it('should auto-detect DOI', () => {
    const result = validateSource('10.1007/s10948-019-05210-z');
    expect(result.isValid).toBe(true);
  });

  it('should auto-detect DOI URL', () => {
    const result = validateSource('https://doi.org/10.1007/s10948-019-05210-z');
    expect(result.isValid).toBe(true);
  });

  it('should auto-detect patent', () => {
    const result = validateSource('US645576');
    expect(result.isValid).toBe(true);
  });

  it('should auto-detect patent URL', () => {
    const result = validateSource('https://patents.google.com/patent/US645576');
    expect(result.isValid).toBe(true);
  });

  it('should auto-detect URL', () => {
    const result = validateSource('https://example.com/page');
    expect(result.isValid).toBe(true);
  });

  it('should reject unknown formats', () => {
    const result = validateSource('unknown-format');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Unknown source format');
  });
});
