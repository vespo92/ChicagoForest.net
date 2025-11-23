/**
 * Compliance Validators
 *
 * Validate content against project guidelines and ethical standards.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDisclaimerPresence(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const disclaimerPatterns = [
    /AI[- ]generated/i,
    /theoretical framework/i,
    /conceptual framework/i,
    /not operational/i,
    /disclaimer/i,
  ];

  const hasDisclaimer = disclaimerPatterns.some(p => p.test(content));

  if (!hasDisclaimer) {
    errors.push('Content must include a disclaimer about AI-generated theoretical nature');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateNoFalseClaims(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const falseClaims = [
    { pattern: /working (free )?energy device/i, message: 'Claims of working energy devices' },
    { pattern: /proven (to work|technology)/i, message: 'Unsubstantiated proof claims' },
    { pattern: /operational (system|device|network)/i, message: 'Claims of operational status' },
    { pattern: /generates? (free )?energy/i, message: 'Claims of energy generation' },
  ];

  for (const { pattern, message } of falseClaims) {
    if (pattern.test(content)) {
      errors.push(`False claim detected: ${message}`);
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateNoInvestmentLanguage(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const investmentPatterns = [
    { pattern: /investment opportunity/i, severity: 'error' as const },
    { pattern: /guaranteed returns?/i, severity: 'error' as const },
    { pattern: /profit potential/i, severity: 'error' as const },
    { pattern: /financial (gain|opportunity)/i, severity: 'warning' as const },
    { pattern: /buy now/i, severity: 'error' as const },
    { pattern: /limited (time|offer)/i, severity: 'warning' as const },
  ];

  for (const { pattern, severity } of investmentPatterns) {
    if (pattern.test(content)) {
      const message = `Investment/financial language detected: ${pattern.source}`;
      if (severity === 'error') {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateSourceAttribution(content: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for claims without sources
  const claimPatterns = [
    /Tesla (discovered|invented|created|developed)/i,
    /Mallove (proved|showed|demonstrated)/i,
    /Moray (built|created|demonstrated)/i,
    /research (shows|proves|demonstrates)/i,
  ];

  for (const pattern of claimPatterns) {
    const match = content.match(pattern);
    if (match) {
      // Check if there's a source link nearby (within ~200 chars)
      const matchIndex = content.indexOf(match[0]);
      const surroundingText = content.slice(
        Math.max(0, matchIndex - 100),
        Math.min(content.length, matchIndex + match[0].length + 200)
      );

      const hasSourceNearby = /\[.*?\]\(https?:\/\/.*?\)/.test(surroundingText) ||
        /https?:\/\/[^\s]+/.test(surroundingText);

      if (!hasSourceNearby) {
        warnings.push(`Claim without nearby source: "${match[0]}"`);
      }
    }
  }

  return { isValid: true, errors, warnings };
}

export function validateAll(content: string): ValidationResult {
  const results = [
    validateDisclaimerPresence(content),
    validateNoFalseClaims(content),
    validateNoInvestmentLanguage(content),
    validateSourceAttribution(content),
  ];

  return {
    isValid: results.every(r => r.isValid),
    errors: results.flatMap(r => r.errors),
    warnings: results.flatMap(r => r.warnings),
  };
}
