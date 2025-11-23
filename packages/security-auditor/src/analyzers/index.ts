/**
 * Security Analyzers
 *
 * Analyze code patterns for security issues.
 */

export interface AnalysisResult {
  file: string;
  issues: {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    line?: number;
    description: string;
  }[];
}

export function analyzeAuthFlow(content: string, filePath: string): AnalysisResult {
  const issues: AnalysisResult['issues'] = [];

  // Check for insecure auth patterns
  if (/password.*==/.test(content) && !/timingSafeEqual/.test(content)) {
    issues.push({
      type: 'timing-attack',
      severity: 'high',
      description: 'Password comparison vulnerable to timing attacks. Use crypto.timingSafeEqual()',
    });
  }

  if (/jwt\.verify.*algorithm.*none/i.test(content)) {
    issues.push({
      type: 'jwt-none-algo',
      severity: 'critical',
      description: 'JWT verification allows "none" algorithm, bypassing signature verification',
    });
  }

  if (/session.*cookie.*secure:\s*false/i.test(content)) {
    issues.push({
      type: 'insecure-cookie',
      severity: 'high',
      description: 'Session cookie not marked as secure',
    });
  }

  return { file: filePath, issues };
}

export function analyzeInputValidation(content: string, filePath: string): AnalysisResult {
  const issues: AnalysisResult['issues'] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for unvalidated input usage
    if (/req\.(body|query|params)\.\w+/.test(line) && !/validate|sanitize|escape/.test(line)) {
      issues.push({
        type: 'unvalidated-input',
        severity: 'medium',
        line: index + 1,
        description: 'Request parameter used without apparent validation',
      });
    }

    // Check for direct database queries with user input
    if (/\$\{req\./.test(line) && /query|exec|find/.test(line)) {
      issues.push({
        type: 'injection-risk',
        severity: 'high',
        line: index + 1,
        description: 'User input interpolated directly into query',
      });
    }
  });

  return { file: filePath, issues };
}

export function analyzeErrorHandling(content: string, filePath: string): AnalysisResult {
  const issues: AnalysisResult['issues'] = [];

  // Check for stack trace exposure
  if (/res\.(send|json)\s*\(\s*err(or)?\.stack/.test(content)) {
    issues.push({
      type: 'stack-exposure',
      severity: 'medium',
      description: 'Error stack trace may be exposed to client',
    });
  }

  // Check for generic error messages that reveal internals
  if (/catch.*console\.log\(err/.test(content) && !/production/.test(content)) {
    issues.push({
      type: 'error-logging',
      severity: 'low',
      description: 'Errors logged to console without environment check',
    });
  }

  return { file: filePath, issues };
}

export function analyzeThreatModel(
  components: string[],
  dataFlows: { from: string; to: string; data: string }[]
): {
  threats: { name: string; description: string; mitigation: string }[];
  riskScore: number;
} {
  const threats: { name: string; description: string; mitigation: string }[] = [];
  let riskScore = 0;

  // STRIDE analysis
  for (const flow of dataFlows) {
    // Spoofing
    if (flow.data.includes('credentials') || flow.data.includes('auth')) {
      threats.push({
        name: 'Spoofing',
        description: `Authentication data flowing from ${flow.from} to ${flow.to}`,
        mitigation: 'Implement strong authentication, use secure tokens',
      });
      riskScore += 2;
    }

    // Tampering
    if (!flow.data.includes('signed') && !flow.data.includes('encrypted')) {
      threats.push({
        name: 'Tampering',
        description: `Unsigned data flow from ${flow.from} to ${flow.to}`,
        mitigation: 'Sign data, use integrity checks',
      });
      riskScore += 1;
    }

    // Information Disclosure
    if (flow.data.includes('pii') || flow.data.includes('sensitive')) {
      threats.push({
        name: 'Information Disclosure',
        description: `Sensitive data in ${flow.from} to ${flow.to} flow`,
        mitigation: 'Encrypt sensitive data, implement access controls',
      });
      riskScore += 3;
    }
  }

  return { threats, riskScore: Math.min(10, riskScore) };
}
