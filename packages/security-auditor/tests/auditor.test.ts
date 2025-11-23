/**
 * Security Auditor Tests
 *
 * Agent 16: Auditor - Test suite for security auditing functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SecurityAuditor,
  SecurityFinding,
  AuditReport,
  OWASPComplianceChecker,
  SecurityIncidentSimulator,
  scanDependencies,
  scanForHardcodedIPs,
  scanForSQLInjection,
  scanForXSS,
  validateCryptoConfig,
  validatePasswordPolicy,
  validateTLSConfig,
  validateKeyRotation,
  analyzeAuthFlow,
  analyzeInputValidation,
  analyzeErrorHandling,
  analyzeThreatModel,
} from '../src';

describe('SecurityAuditor', () => {
  let auditor: SecurityAuditor;

  beforeEach(() => {
    auditor = new SecurityAuditor();
  });

  describe('Secret Detection', () => {
    it('should detect hardcoded API keys', async () => {
      const files = [
        {
          path: 'config.ts',
          content: `const API_KEY = "sk-1234567890abcdef";`,
        },
      ];

      const report = await auditor.audit(files);

      expect(report.findings.length).toBeGreaterThan(0);
      expect(report.findings.some(f => f.category === 'secret')).toBe(true);
    });

    it('should detect hardcoded passwords', async () => {
      const files = [
        {
          path: 'auth.ts',
          content: `const password = "mysecretpassword123";`,
        },
      ];

      const report = await auditor.audit(files);

      expect(report.findings.some(f => f.title.includes('Password'))).toBe(true);
    });

    it('should detect private keys', async () => {
      const files = [
        {
          path: 'keys.ts',
          content: `const key = "-----BEGIN RSA PRIVATE KEY-----\nMIIE..."`,
        },
      ];

      const report = await auditor.audit(files);

      expect(report.findings.some(f => f.title.includes('Private Key'))).toBe(true);
    });
  });

  describe('Crypto Scanning', () => {
    it('should detect weak cryptographic algorithms', async () => {
      const files = [
        {
          path: 'crypto.ts',
          content: `import { md5 } from 'some-lib';`,
        },
      ];

      const report = await auditor.audit(files);

      expect(report.findings.some(f => f.category === 'crypto')).toBe(true);
      expect(report.findings.some(f => f.title.includes('MD5'))).toBe(true);
    });

    it('should detect SHA1 usage', async () => {
      const files = [
        {
          path: 'hash.ts',
          content: `const hash = sha1(data);`,
        },
      ];

      const report = await auditor.audit(files);

      expect(report.findings.some(f => f.title.includes('SHA1'))).toBe(true);
    });
  });

  describe('Vulnerability Detection', () => {
    it('should detect eval usage', async () => {
      const files = [
        {
          path: 'unsafe.ts',
          content: `eval(userInput);`,
        },
      ];

      const report = await auditor.audit(files);

      expect(report.findings.some(f => f.title.includes('eval'))).toBe(true);
    });

    it('should detect innerHTML assignment', async () => {
      const files = [
        {
          path: 'dom.ts',
          content: `element.innerHTML = userContent;`,
        },
      ];

      const report = await auditor.audit(files);

      expect(report.findings.some(f => f.title.includes('innerHTML'))).toBe(true);
    });
  });

  describe('Report Generation', () => {
    it('should generate a valid audit report', async () => {
      const files = [{ path: 'safe.ts', content: 'const x = 1;' }];

      const report = await auditor.audit(files);

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('duration');
      expect(report).toHaveProperty('findings');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('passed');
    });

    it('should generate markdown report', async () => {
      const files = [{ path: 'test.ts', content: 'const password = "secret";' }];

      const report = await auditor.audit(files);
      const markdown = auditor.generateReport(report);

      expect(markdown).toContain('# Security Audit Report');
      expect(markdown).toContain('## Summary');
    });
  });

  describe('Exclusion Patterns', () => {
    it('should exclude files matching patterns', async () => {
      const auditorWithExclusions = new SecurityAuditor({
        excludePatterns: ['**/node_modules/**'],
      });

      const files = [
        { path: 'node_modules/pkg/index.ts', content: 'const API_KEY = "secret";' },
        { path: 'src/index.ts', content: 'const x = 1;' },
      ];

      const report = await auditorWithExclusions.audit(files);

      expect(report.findings.length).toBe(0);
    });
  });
});

describe('Scanners', () => {
  describe('scanDependencies', () => {
    it('should detect known vulnerable packages', () => {
      const packageJson = {
        dependencies: {
          lodash: '^4.17.0',
          minimist: '^1.2.0',
        },
      };

      const vulns = scanDependencies(packageJson);

      expect(vulns.length).toBeGreaterThan(0);
      expect(vulns.some(v => v.package === 'lodash')).toBe(true);
    });
  });

  describe('scanForHardcodedIPs', () => {
    it('should detect hardcoded IP addresses', () => {
      const content = `const server = "192.168.1.100:8080";`;
      const ips = scanForHardcodedIPs(content);

      expect(ips).toContain('192.168.1.100');
    });

    it('should ignore localhost and broadcast addresses', () => {
      const content = `const local = "127.0.0.1"; const broadcast = "255.255.255.255";`;
      const ips = scanForHardcodedIPs(content);

      expect(ips.length).toBe(0);
    });
  });

  describe('scanForSQLInjection', () => {
    it('should detect SQL injection patterns', () => {
      const content = `const query = \`SELECT * FROM users WHERE id = \${userId}\`;`;
      const issues = scanForSQLInjection(content);

      expect(issues.length).toBeGreaterThan(0);
    });
  });

  describe('scanForXSS', () => {
    it('should detect XSS patterns', () => {
      const content = `element.innerHTML = userInput;`;
      const issues = scanForXSS(content);

      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].issue).toContain('innerHTML');
    });
  });
});

describe('Validators', () => {
  describe('validateCryptoConfig', () => {
    it('should reject weak algorithms', () => {
      const result = validateCryptoConfig({ algorithm: 'des' });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should accept strong algorithms', () => {
      const result = validateCryptoConfig({ algorithm: 'aes-256-gcm' });

      expect(result.isValid).toBe(true);
    });

    it('should warn on small key sizes', () => {
      const result = validateCryptoConfig({ keySize: 128 });

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validatePasswordPolicy', () => {
    it('should reject weak passwords', () => {
      const result = validatePasswordPolicy('password123');

      expect(result.isValid).toBe(false);
    });

    it('should accept strong passwords', () => {
      const result = validatePasswordPolicy('MyStr0ng!P@ssw0rd');

      expect(result.isValid).toBe(true);
    });
  });

  describe('validateTLSConfig', () => {
    it('should reject insecure TLS versions', () => {
      const result = validateTLSConfig({ minVersion: 'TLSv1.0' });

      expect(result.isValid).toBe(false);
    });

    it('should accept secure TLS versions', () => {
      const result = validateTLSConfig({ minVersion: 'TLSv1.3' });

      expect(result.isValid).toBe(true);
    });

    it('should reject weak ciphers', () => {
      const result = validateTLSConfig({ ciphers: ['RC4-SHA'] });

      expect(result.isValid).toBe(false);
    });
  });

  describe('validateKeyRotation', () => {
    it('should fail for old keys', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);

      const result = validateKeyRotation(oldDate);

      expect(result.isValid).toBe(false);
    });

    it('should warn for keys approaching expiration', () => {
      const date = new Date();
      date.setDate(date.getDate() - 70);

      const result = validateKeyRotation(date);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});

describe('Analyzers', () => {
  describe('analyzeAuthFlow', () => {
    it('should detect timing attack vulnerabilities', () => {
      const content = `if (password === storedPassword) { return true; }`;
      const result = analyzeAuthFlow(content, 'auth.ts');

      expect(result.issues.some(i => i.type === 'timing-attack')).toBe(true);
    });

    it('should detect JWT none algorithm', () => {
      const content = `jwt.verify(token, secret, { algorithm: 'none' });`;
      const result = analyzeAuthFlow(content, 'jwt.ts');

      expect(result.issues.some(i => i.type === 'jwt-none-algo')).toBe(true);
    });
  });

  describe('analyzeInputValidation', () => {
    it('should detect unvalidated input usage', () => {
      const content = `const name = req.body.name; db.insert(name);`;
      const result = analyzeInputValidation(content, 'api.ts');

      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeErrorHandling', () => {
    it('should detect stack trace exposure', () => {
      const content = `res.send(error.stack);`;
      const result = analyzeErrorHandling(content, 'error.ts');

      expect(result.issues.some(i => i.type === 'stack-exposure')).toBe(true);
    });
  });

  describe('analyzeThreatModel', () => {
    it('should identify threats in data flows', () => {
      const components = ['client', 'server', 'database'];
      const dataFlows = [
        { from: 'client', to: 'server', data: 'credentials' },
        { from: 'server', to: 'database', data: 'pii' },
      ];

      const result = analyzeThreatModel(components, dataFlows);

      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.riskScore).toBeGreaterThan(0);
    });
  });
});

describe('OWASPComplianceChecker', () => {
  let checker: OWASPComplianceChecker;

  beforeEach(() => {
    checker = new OWASPComplianceChecker();
  });

  it('should detect OWASP violations', async () => {
    const files = [
      {
        path: 'unsafe.ts',
        content: `eval(\`command: \${userInput}\`);`,
      },
    ];

    const report = await checker.check(files);

    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.findings.some(f => f.category === 'A03:2021-Injection')).toBe(true);
  });

  it('should calculate compliance score', async () => {
    const files = [{ path: 'safe.ts', content: 'const x = 1;' }];

    const report = await checker.check(files);

    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it('should generate OWASP report', async () => {
    const files = [{ path: 'test.ts', content: 'const x = 1;' }];

    const report = await checker.check(files);
    const markdown = checker.generateReport(report);

    expect(markdown).toContain('# OWASP Top 10 Compliance Report');
    expect(markdown).toContain('## Category Compliance');
  });
});

describe('SecurityIncidentSimulator', () => {
  let simulator: SecurityIncidentSimulator;

  beforeEach(() => {
    simulator = new SecurityIncidentSimulator({ dryRun: true });
  });

  it('should have default scenarios', () => {
    const scenarios = simulator.getScenarios();

    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios.some(s => s.id === 'brute-force-login')).toBe(true);
    expect(scenarios.some(s => s.id === 'sql-injection')).toBe(true);
  });

  it('should run a single scenario', async () => {
    const result = await simulator.runScenario('brute-force-login');

    expect(result).toHaveProperty('scenarioId', 'brute-force-login');
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('stepResults');
    expect(result.stepResults.length).toBeGreaterThan(0);
  });

  it('should run all scenarios', async () => {
    const results = await simulator.runAllScenarios();

    expect(results.length).toBeGreaterThan(0);
  });

  it('should run scenarios by category', async () => {
    const results = await simulator.runByCategory('authentication');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every(r => r.scenarioId.includes('login') || r.scenarioId.includes('session'))).toBe(true);
  });

  it('should generate simulation report', async () => {
    await simulator.runScenario('sql-injection');
    const report = simulator.generateReport();

    expect(report).toContain('# Security Incident Simulation Report');
    expect(report).toContain('SQL Injection Attack');
  });

  it('should allow adding custom scenarios', () => {
    simulator.addScenario({
      id: 'custom-test',
      name: 'Custom Test Scenario',
      description: 'A custom test scenario',
      category: 'authentication',
      severity: 'medium',
      steps: [
        { id: 'step-1', action: 'test-action', expectedOutcome: 'blocked' },
      ],
    });

    const scenarios = simulator.getScenarios();
    expect(scenarios.some(s => s.id === 'custom-test')).toBe(true);
  });
});
