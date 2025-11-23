/**
 * Source Validators
 *
 * Validation utilities for different source types including URLs, DOIs, and patents.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateUrl(url: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:') {
      warnings.push('URL does not use HTTPS');
    }

    // Check for known trusted domains
    const trustedDomains = [
      'patents.google.com',
      'doi.org',
      'archive.org',
      'lenr-canr.org',
      'vault.fbi.gov',
      'teslauniverse.com',
    ];

    const isTrusted = trustedDomains.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );

    if (!isTrusted) {
      warnings.push('URL is from an unverified domain');
    }

  } catch {
    errors.push('Invalid URL format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateDOI(doi: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // DOI format: 10.xxxx/xxxxx
  const doiRegex = /^10\.\d{4,}\/[^\s]+$/;

  if (!doiRegex.test(doi)) {
    errors.push('Invalid DOI format. Expected: 10.xxxx/xxxxx');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validatePatentNumber(patent: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // US Patent formats
  const usPatentRegex = /^US\d{6,}[A-Z]?\d?$/;
  const usApplicationRegex = /^US\d{4}\/\d{7}$/;

  if (!usPatentRegex.test(patent) && !usApplicationRegex.test(patent)) {
    errors.push('Invalid patent number format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateArchiveUrl(url: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const archiveDomains = [
    'archive.org',
    'web.archive.org',
    'vault.fbi.gov',
    'lenr-canr.org',
  ];

  try {
    const parsed = new URL(url);
    const isArchive = archiveDomains.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );

    if (!isArchive) {
      warnings.push('URL is not from a recognized archive');
    }
  } catch {
    errors.push('Invalid URL format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
