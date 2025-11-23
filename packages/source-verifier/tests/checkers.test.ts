/**
 * Checker Tests
 *
 * Agent 11: Verifier - Unit tests for source checkers
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  UrlChecker,
  DoiChecker,
  PatentChecker,
  ArchiveChecker,
  isTrustedDomain,
  validateUrlFormat,
  extractDoiFromUrl,
  normalizeDoi,
  getRegistrantFromDoi,
  validateDoiFormat,
  extractPatentFromUrl,
  validatePatentFormat,
  normalizePatentNumber,
  generatePatentUrl,
  extractArchiveInfo,
  isKnownArchive,
} from '../src/checkers';

describe('UrlChecker', () => {
  let checker: UrlChecker;

  beforeEach(() => {
    checker = new UrlChecker({ retryAttempts: 1, retryDelayMs: 100 });
  });

  it('should check a valid URL', async () => {
    const result = await checker.check('https://patents.google.com/patent/US645576');
    expect(result.type).toBe('url');
    expect(result.isValid).toBe(true);
    expect(result.isTrustedDomain).toBe(true);
    expect(result.isHttps).toBe(true);
  });

  it('should report response time', async () => {
    const result = await checker.check('https://example.com');
    expect(result.responseTime).toBeDefined();
    expect(result.responseTime).toBeGreaterThanOrEqual(0);
  });

  it('should identify untrusted domains', async () => {
    const result = await checker.check('https://unknown-site.com/page');
    expect(result.isTrustedDomain).toBe(false);
  });

  it('should batch check multiple URLs', async () => {
    const urls = [
      'https://patents.google.com/patent/US645576',
      'https://doi.org/10.1234/test',
    ];
    const results = await checker.checkBatch(urls);
    expect(results).toHaveLength(2);
  });
});

describe('isTrustedDomain', () => {
  it('should identify trusted domains', () => {
    expect(isTrustedDomain('patents.google.com')).toBe(true);
    expect(isTrustedDomain('doi.org')).toBe(true);
    expect(isTrustedDomain('lenr-canr.org')).toBe(true);
    expect(isTrustedDomain('vault.fbi.gov')).toBe(true);
    expect(isTrustedDomain('archive.org')).toBe(true);
  });

  it('should identify subdomains of trusted domains', () => {
    expect(isTrustedDomain('www.archive.org')).toBe(true);
    expect(isTrustedDomain('web.archive.org')).toBe(true);
  });

  it('should reject untrusted domains', () => {
    expect(isTrustedDomain('example.com')).toBe(false);
    expect(isTrustedDomain('fake-archive.org')).toBe(false);
  });
});

describe('validateUrlFormat', () => {
  it('should validate HTTPS URLs', () => {
    const result = validateUrlFormat('https://example.com');
    expect(result.isValid).toBe(true);
  });

  it('should validate HTTP URLs', () => {
    const result = validateUrlFormat('http://example.com');
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid protocols', () => {
    const result = validateUrlFormat('ftp://example.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid protocol');
  });

  it('should reject malformed URLs', () => {
    const result = validateUrlFormat('not-a-url');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid URL format');
  });
});

describe('DoiChecker', () => {
  let checker: DoiChecker;

  beforeEach(() => {
    checker = new DoiChecker();
  });

  it('should check a valid DOI', async () => {
    const result = await checker.check('10.1007/s10948-019-05210-z');
    expect(result.type).toBe('doi');
    expect(result.isValid).toBe(true);
    expect(result.resolvedUrl).toBe('https://doi.org/10.1007/s10948-019-05210-z');
  });

  it('should check a DOI with URL prefix', async () => {
    const result = await checker.check('https://doi.org/10.1016/j.nima.2009.10.113');
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid DOI format', async () => {
    const result = await checker.check('invalid-doi');
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('invalid');
  });

  it('should identify scientific publishers', () => {
    expect(checker.isScientificPublisher('10.1038/s41586-020-2491-6')).toBe(true);
    expect(checker.isScientificPublisher('10.9999/unknown')).toBe(false);
  });
});

describe('extractDoiFromUrl', () => {
  it('should extract DOI from doi.org URL', () => {
    const doi = extractDoiFromUrl('https://doi.org/10.1007/s10948-019-05210-z');
    expect(doi).toBe('10.1007/s10948-019-05210-z');
  });

  it('should extract DOI from dx.doi.org URL', () => {
    const doi = extractDoiFromUrl('https://dx.doi.org/10.1016/j.nima.2009.10.113');
    expect(doi).toBe('10.1016/j.nima.2009.10.113');
  });

  it('should return null for non-DOI URLs', () => {
    const doi = extractDoiFromUrl('https://example.com/page');
    expect(doi).toBeNull();
  });
});

describe('normalizeDoi', () => {
  it('should remove URL prefixes', () => {
    expect(normalizeDoi('https://doi.org/10.1234/test')).toBe('10.1234/test');
    expect(normalizeDoi('https://dx.doi.org/10.1234/test')).toBe('10.1234/test');
    expect(normalizeDoi('doi:10.1234/test')).toBe('10.1234/test');
  });

  it('should trim whitespace', () => {
    expect(normalizeDoi('  10.1234/test  ')).toBe('10.1234/test');
  });
});

describe('getRegistrantFromDoi', () => {
  it('should identify Nature Publishing', () => {
    expect(getRegistrantFromDoi('10.1038/nature12373')).toBe('Nature Publishing Group');
  });

  it('should identify Springer', () => {
    expect(getRegistrantFromDoi('10.1007/s10948-019-05210-z')).toBe('Springer');
  });

  it('should identify Elsevier', () => {
    expect(getRegistrantFromDoi('10.1016/j.nima.2009.10.113')).toBe('Elsevier');
  });

  it('should return Other for unknown registrants', () => {
    expect(getRegistrantFromDoi('10.9999/unknown')).toBe('Other Publisher');
  });
});

describe('PatentChecker', () => {
  let checker: PatentChecker;

  beforeEach(() => {
    checker = new PatentChecker();
  });

  it('should check a valid US patent', async () => {
    const result = await checker.check('US645576');
    expect(result.type).toBe('patent');
    expect(result.isValid).toBe(true);
    expect(result.patentUrl).toBe('https://patents.google.com/patent/US645576');
    expect(result.jurisdiction).toBe('US');
  });

  it('should check a known Tesla patent', async () => {
    const result = await checker.check('US645576');
    expect(result.isValid).toBe(true);
    expect(result.title).toBe('System of Transmission of Electrical Energy');
    expect(result.inventor).toBe('Nikola Tesla');
  });

  it('should reject invalid patent format', async () => {
    const result = await checker.check('invalid');
    expect(result.isValid).toBe(false);
    expect(result.status).toBe('invalid');
  });

  it('should identify Tesla patents', () => {
    expect(checker.isTeslaPatent('US645576')).toBe(true);
    expect(checker.isTeslaPatent('US787412')).toBe(true);
    expect(checker.isTeslaPatent('US123456')).toBe(false);
  });

  it('should list Tesla patents', () => {
    const patents = checker.getTeslaPatents();
    expect(patents).toContain('US645576');
    expect(patents).toContain('US787412');
    expect(patents.length).toBeGreaterThan(5);
  });
});

describe('extractPatentFromUrl', () => {
  it('should extract patent from Google Patents URL', () => {
    const patent = extractPatentFromUrl('https://patents.google.com/patent/US645576');
    expect(patent).toBe('US645576');
  });

  it('should return null for non-patent URLs', () => {
    const patent = extractPatentFromUrl('https://example.com/page');
    expect(patent).toBeNull();
  });
});

describe('validatePatentFormat', () => {
  it('should validate US patents', () => {
    expect(validatePatentFormat('US645576').isValid).toBe(true);
    expect(validatePatentFormat('US645576').jurisdiction).toBe('US');
  });

  it('should validate EP patents', () => {
    expect(validatePatentFormat('EP1234567').isValid).toBe(true);
    expect(validatePatentFormat('EP1234567').jurisdiction).toBe('EP');
  });

  it('should validate WO patents', () => {
    expect(validatePatentFormat('WO2020123456').isValid).toBe(true);
    expect(validatePatentFormat('WO2020123456').jurisdiction).toBe('WO');
  });

  it('should reject invalid formats', () => {
    expect(validatePatentFormat('invalid').isValid).toBe(false);
  });
});

describe('generatePatentUrl', () => {
  it('should generate Google Patents URL', () => {
    const url = generatePatentUrl('US645576');
    expect(url).toBe('https://patents.google.com/patent/US645576');
  });

  it('should normalize patent number', () => {
    const url = generatePatentUrl('us 645576');
    expect(url).toBe('https://patents.google.com/patent/US645576');
  });
});

describe('ArchiveChecker', () => {
  let checker: ArchiveChecker;

  beforeEach(() => {
    checker = new ArchiveChecker();
  });

  it('should check FBI vault URL', async () => {
    const result = await checker.check('https://vault.fbi.gov/nikola-tesla');
    expect(result.type).toBe('archive');
    expect(result.isValid).toBe(true);
    expect(result.archiveName).toBe('FBI Vault');
    expect(result.isKnownArchive).toBe(true);
  });

  it('should check LENR-CANR URL', async () => {
    const result = await checker.check('https://lenr-canr.org/acrobat/document.pdf');
    expect(result.isValid).toBe(true);
    expect(result.archiveName).toBe('LENR-CANR Library');
  });

  it('should check Internet Archive URL', async () => {
    const result = await checker.check('https://archive.org/details/document');
    expect(result.isValid).toBe(true);
    expect(result.archiveName).toBe('Internet Archive');
  });

  it('should reject non-archive URLs', async () => {
    const result = await checker.check('https://example.com/page');
    expect(result.isValid).toBe(false);
    expect(result.isKnownArchive).toBe(false);
  });

  it('should generate Wayback URL', () => {
    const url = checker.getWaybackUrl('https://example.com');
    expect(url).toContain('web.archive.org');
    expect(url).toContain('example.com');
  });

  it('should list known archives', () => {
    const archives = checker.getKnownArchives();
    expect(archives.length).toBeGreaterThan(0);
    expect(archives.some(a => a.name === 'FBI Vault')).toBe(true);
    expect(archives.some(a => a.name === 'LENR-CANR Library')).toBe(true);
  });
});

describe('extractArchiveInfo', () => {
  it('should extract Wayback Machine info', () => {
    const info = extractArchiveInfo(
      'https://web.archive.org/web/20200101120000/https://example.com'
    );
    expect(info).not.toBeNull();
    expect(info?.archiveName).toBe('Wayback Machine');
    expect(info?.snapshotDate).toBeInstanceOf(Date);
    expect(info?.originalUrl).toBe('https://example.com');
  });

  it('should extract FBI vault info', () => {
    const info = extractArchiveInfo('https://vault.fbi.gov/nikola-tesla');
    expect(info).not.toBeNull();
    expect(info?.archiveName).toBe('FBI Vault');
    expect(info?.archiveCategory).toBe('government');
  });

  it('should return null for unknown archives', () => {
    const info = extractArchiveInfo('https://example.com/page');
    expect(info).toBeNull();
  });
});

describe('isKnownArchive', () => {
  it('should identify known archives', () => {
    expect(isKnownArchive('https://vault.fbi.gov/doc')).toBe(true);
    expect(isKnownArchive('https://lenr-canr.org/doc')).toBe(true);
    expect(isKnownArchive('https://archive.org/details/x')).toBe(true);
  });

  it('should reject unknown archives', () => {
    expect(isKnownArchive('https://example.com/doc')).toBe(false);
  });
});
