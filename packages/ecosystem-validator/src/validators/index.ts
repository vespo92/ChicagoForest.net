/**
 * Integration Validators
 *
 * Validate integration interfaces and contracts.
 */

export interface InterfaceContract {
  name: string;
  methods: { name: string; signature: string }[];
  types: { name: string; definition: string }[];
  version: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateInterfaceContract(
  expected: InterfaceContract,
  actual: InterfaceContract
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check version compatibility
  const [expectedMajor] = expected.version.split('.').map(Number);
  const [actualMajor] = actual.version.split('.').map(Number);

  if (expectedMajor !== actualMajor) {
    errors.push(`Major version mismatch: expected ${expected.version}, got ${actual.version}`);
  }

  // Check methods
  for (const expectedMethod of expected.methods) {
    const actualMethod = actual.methods.find(m => m.name === expectedMethod.name);

    if (!actualMethod) {
      errors.push(`Missing method: ${expectedMethod.name}`);
    } else if (actualMethod.signature !== expectedMethod.signature) {
      errors.push(`Method signature mismatch for ${expectedMethod.name}`);
    }
  }

  // Check for unexpected methods (potential additions)
  for (const actualMethod of actual.methods) {
    if (!expected.methods.find(m => m.name === actualMethod.name)) {
      warnings.push(`New method detected: ${actualMethod.name}`);
    }
  }

  // Check types
  for (const expectedType of expected.types) {
    const actualType = actual.types.find(t => t.name === expectedType.name);

    if (!actualType) {
      errors.push(`Missing type: ${expectedType.name}`);
    } else if (actualType.definition !== expectedType.definition) {
      warnings.push(`Type definition changed for ${expectedType.name}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateDependencyVersion(
  required: string,
  installed: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Parse semver (simplified)
  const parseVersion = (v: string) => {
    const clean = v.replace(/[\^~>=<]/g, '');
    const [major, minor, patch] = clean.split('.').map(Number);
    return { major: major || 0, minor: minor || 0, patch: patch || 0 };
  };

  const req = parseVersion(required);
  const inst = parseVersion(installed);

  // Major version must match
  if (req.major !== inst.major) {
    errors.push(`Major version mismatch: requires ${required}, installed ${installed}`);
  }
  // Minor version should be >= required
  else if (inst.minor < req.minor) {
    errors.push(`Minor version too low: requires ${required}, installed ${installed}`);
  }
  // Patch version warning if lower
  else if (inst.minor === req.minor && inst.patch < req.patch) {
    warnings.push(`Patch version lower than recommended: ${installed} < ${required}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateExportCompatibility(
  baseExports: string[],
  newExports: string[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for removed exports (breaking change)
  for (const exp of baseExports) {
    if (!newExports.includes(exp)) {
      errors.push(`Removed export: ${exp}`);
    }
  }

  // Check for new exports (non-breaking)
  for (const exp of newExports) {
    if (!baseExports.includes(exp)) {
      warnings.push(`New export: ${exp}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
