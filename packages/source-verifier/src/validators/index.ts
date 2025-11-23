/**
 * Source Validators
 *
 * Agent 11: Verifier - Validation utilities for different source types.
 */

import {
  TRUSTED_DOMAINS,
  PATENT_JURISDICTIONS,
  DOI_REGISTRANTS,
} from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate URL format and trustworthiness
 */
export function validateUrl(url: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      errors.push('Invalid protocol. Expected http or https');
    }

    if (parsed.protocol !== 'https:') {
      warnings.push('URL does not use HTTPS');
    }

    if (!parsed.hostname) {
      errors.push('Missing hostname');
    }

    const isTrusted = TRUSTED_DOMAINS.some(
      domain =>
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

/**
 * Validate DOI format
 */
export function validateDOI(doi: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Clean the DOI
  const cleanDoi = doi
    .trim()
    .replace(/^https?:\/\/doi\.org\//, '')
    .replace(/^https?:\/\/dx\.doi\.org\//, '')
    .replace(/^doi:/, '');

  // DOI format: 10.xxxx/xxxxx
  const doiRegex = /^10\.\d{4,}(?:\.\d+)*\/[^\s]+$/;

  if (!doiRegex.test(cleanDoi)) {
    errors.push('Invalid DOI format. Expected: 10.xxxx/xxxxx');
  }

  // Check if from known registrant
  const registrantMatch = cleanDoi.match(/^10\.(\d+)/);
  if (registrantMatch) {
    const registrantCode = registrantMatch[1];
    if (!DOI_REGISTRANTS[registrantCode]) {
      warnings.push('DOI is from an unknown registrant');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate patent number format
 */
export function validatePatentNumber(patent: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const cleanPatent = patent.trim().toUpperCase().replace(/\s+/g, '');

  // Extract jurisdiction prefix
  const jurisdictionMatch = cleanPatent.match(/^([A-Z]{2})/);
  if (!jurisdictionMatch) {
    errors.push('Patent number must start with a 2-letter jurisdiction code (e.g., US, EP, WO)');
    return { isValid: false, errors, warnings };
  }

  const jurisdiction = jurisdictionMatch[1];
  if (!PATENT_JURISDICTIONS[jurisdiction]) {
    warnings.push(`Unknown jurisdiction: ${jurisdiction}`);
  }

  // Patent number patterns
  const patterns: Record<string, RegExp> = {
    US: /^US\d{5,8}[A-Z]?\d?$/,
    EP: /^EP\d{7}[A-Z]?\d?$/,
    WO: /^WO\d{4}\d{6}$/,
    GB: /^GB\d{7}[A-Z]?$/,
    DE: /^DE\d{12}[A-Z]?\d?$/,
    JP: /^JP\d{4}-?\d{6}$/,
    CN: /^CN\d{9}[A-Z]?$/,
  };

  const pattern = patterns[jurisdiction];
  if (pattern && !pattern.test(cleanPatent)) {
    errors.push(`Invalid ${jurisdiction} patent number format`);
  } else if (!pattern) {
    // For unknown jurisdictions, just check basic format
    if (!/^[A-Z]{2}\d{5,}/.test(cleanPatent)) {
      errors.push('Invalid patent number format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate archive URL
 */
export function validateArchiveUrl(url: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const archiveDomains = [
    'archive.org',
    'web.archive.org',
    'vault.fbi.gov',
    'lenr-canr.org',
    'teslauniverse.com',
    'osti.gov',
  ];

  try {
    const parsed = new URL(url);
    const isArchive = archiveDomains.some(
      domain =>
        parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );

    if (!isArchive) {
      warnings.push('URL is not from a recognized archive');
    }

    if (parsed.protocol !== 'https:') {
      warnings.push('Archive URL should use HTTPS');
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

/**
 * Validate any source with auto-detection
 */
export function validateSource(source: string): ValidationResult {
  // Try to detect type
  if (source.match(/^10\.\d{4,}/) || source.includes('doi.org/10.')) {
    return validateDOI(source);
  }

  if (source.match(/^[A-Z]{2}\d{5,}/) || source.includes('patents.google.com')) {
    // Extract patent number from URL if needed
    const patentMatch = source.match(/patents\.google\.com\/patent\/([A-Z]{2}\d+)/);
    return validatePatentNumber(patentMatch ? patentMatch[1] : source);
  }

  if (source.startsWith('http://') || source.startsWith('https://')) {
    return validateUrl(source);
  }

  return {
    isValid: false,
    errors: ['Unknown source format'],
    warnings: [],
  };
}

/**
 * Batch validate sources
 */
export function validateSources(sources: string[]): Map<string, ValidationResult> {
  const results = new Map<string, ValidationResult>();
  for (const source of sources) {
    results.set(source, validateSource(source));
  }
  return results;
}
