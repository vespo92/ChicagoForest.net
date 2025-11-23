/**
 * Security Validators
 *
 * Validate security configurations and practices.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCryptoConfig(config: {
  algorithm?: string;
  keySize?: number;
  mode?: string;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const strongAlgorithms = ['aes-256-gcm', 'chacha20-poly1305', 'aes-128-gcm'];
  const weakAlgorithms = ['des', '3des', 'rc4', 'blowfish', 'md5', 'sha1'];

  if (config.algorithm) {
    const algo = config.algorithm.toLowerCase();
    if (weakAlgorithms.some(w => algo.includes(w))) {
      errors.push(`Weak algorithm detected: ${config.algorithm}`);
    } else if (!strongAlgorithms.some(s => algo.includes(s))) {
      warnings.push(`Algorithm not in recommended list: ${config.algorithm}`);
    }
  }

  if (config.keySize) {
    if (config.keySize < 128) {
      errors.push(`Key size too small: ${config.keySize} bits (minimum 128)`);
    } else if (config.keySize < 256) {
      warnings.push(`Consider using 256-bit keys for better security`);
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validatePasswordPolicy(password: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    warnings.push('Consider adding special characters');
  }

  // Check for common patterns
  const commonPatterns = ['password', '123456', 'qwerty', 'admin'];
  if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
    errors.push('Password contains common weak patterns');
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateTLSConfig(config: {
  minVersion?: string;
  ciphers?: string[];
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const secureVersions = ['TLSv1.2', 'TLSv1.3'];
  const insecureVersions = ['SSLv2', 'SSLv3', 'TLSv1.0', 'TLSv1.1'];

  if (config.minVersion) {
    if (insecureVersions.includes(config.minVersion)) {
      errors.push(`Insecure TLS version: ${config.minVersion}`);
    } else if (!secureVersions.includes(config.minVersion)) {
      warnings.push(`Unknown TLS version: ${config.minVersion}`);
    }
  }

  const weakCiphers = ['RC4', 'DES', '3DES', 'MD5', 'NULL', 'EXPORT', 'anon'];
  if (config.ciphers) {
    for (const cipher of config.ciphers) {
      if (weakCiphers.some(w => cipher.toUpperCase().includes(w))) {
        errors.push(`Weak cipher detected: ${cipher}`);
      }
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateKeyRotation(
  keyCreatedAt: Date,
  maxAgeDays: number = 90
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const ageMs = Date.now() - keyCreatedAt.getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays > maxAgeDays) {
    errors.push(`Key is ${Math.floor(ageDays)} days old (max: ${maxAgeDays})`);
  } else if (ageDays > maxAgeDays * 0.75) {
    warnings.push(`Key will expire in ${Math.floor(maxAgeDays - ageDays)} days`);
  }

  return { isValid: errors.length === 0, errors, warnings };
}
