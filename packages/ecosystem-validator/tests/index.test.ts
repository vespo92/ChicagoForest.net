/**
 * Ecosystem Validator Tests
 *
 * Agent 20: Validator - Test suite for ecosystem integration validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  EcosystemValidator,
  NPCPU_INTEGRATION_POINTS,
  CONSHRINK_INTEGRATION_POINTS,
  type IntegrationPoint,
  type BreakingChange,
} from '../src/index';
import {
  validateInterfaceContract,
  validateDependencyVersion,
  validateExportCompatibility,
  type InterfaceContract,
} from '../src/validators';
import {
  detectBreakingChanges,
  checkVersionCompatibility,
  checkCrossRepoIntegration,
  generateCompatibilityMatrix,
} from '../src/checkers';
import {
  generateIntegrationTest,
  generateMigrationGuide,
  generateHealthDashboard,
  generateAPIContract,
} from '../src/generators';

describe('EcosystemValidator', () => {
  let validator: EcosystemValidator;

  beforeEach(() => {
    validator = new EcosystemValidator();
  });

  describe('constructor', () => {
    it('should initialize with all integration points', () => {
      const points = validator.getAllIntegrationPoints();
      expect(points.length).toBe(
        NPCPU_INTEGRATION_POINTS.length + CONSHRINK_INTEGRATION_POINTS.length
      );
    });
  });

  describe('validateIntegrationPoint', () => {
    it('should return no breaking changes for valid point', () => {
      const validPoint: IntegrationPoint = {
        name: 'test-point',
        sourceRepo: 'NPCPU',
        targetPackage: '@chicago-forest/test',
        interface: 'TestInterface',
        version: '0.1.0',
        status: 'compatible',
      };

      const changes = validator.validateIntegrationPoint(validPoint);
      expect(changes).toHaveLength(0);
    });

    it('should detect missing interface', () => {
      const invalidPoint: IntegrationPoint = {
        name: 'test-point',
        sourceRepo: 'NPCPU',
        targetPackage: '@chicago-forest/test',
        interface: '',
        version: '0.1.0',
        status: 'compatible',
      };

      const changes = validator.validateIntegrationPoint(invalidPoint);
      expect(changes.length).toBeGreaterThan(0);
      expect(changes[0].impact).toBe('high');
    });
  });

  describe('generateCompatibilityReport', () => {
    it('should generate report for NPCPU integration', () => {
      const report = validator.generateCompatibilityReport(
        '@chicago-forest/mycelium-core',
        'NPCPU'
      );

      expect(report.sourcePackage).toBe('@chicago-forest/mycelium-core');
      expect(report.targetRepo).toBe('NPCPU');
      expect(report.timestamp).toBeInstanceOf(Date);
    });

    it('should generate report for ConstitutionalShrinkage integration', () => {
      const report = validator.generateCompatibilityReport(
        '@chicago-forest/hive-mind',
        'ConstitutionalShrinkage'
      );

      expect(report.targetRepo).toBe('ConstitutionalShrinkage');
    });
  });

  describe('getEcosystemHealth', () => {
    it('should return health for all repositories', () => {
      const health = validator.getEcosystemHealth();

      expect(health.repositories).toHaveLength(3);
      expect(health.repositories.map(r => r.name)).toContain('ChicagoForest.net');
      expect(health.repositories.map(r => r.name)).toContain('NPCPU');
      expect(health.repositories.map(r => r.name)).toContain('ConstitutionalShrinkage');
    });

    it('should calculate overall status correctly', () => {
      const health = validator.getEcosystemHealth();
      expect(['healthy', 'warning', 'critical']).toContain(health.overallStatus);
    });
  });
});

describe('Validators', () => {
  describe('validateInterfaceContract', () => {
    it('should validate matching contracts', () => {
      const expected: InterfaceContract = {
        name: 'TestContract',
        methods: [{ name: 'doSomething', signature: '() => void' }],
        types: [{ name: 'TestType', definition: '{ id: string }' }],
        version: '1.0.0',
      };

      const result = validateInterfaceContract(expected, expected);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect major version mismatch', () => {
      const expected: InterfaceContract = {
        name: 'Test',
        methods: [],
        types: [],
        version: '1.0.0',
      };
      const actual: InterfaceContract = {
        name: 'Test',
        methods: [],
        types: [],
        version: '2.0.0',
      };

      const result = validateInterfaceContract(expected, actual);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Major version'))).toBe(true);
    });

    it('should detect missing methods', () => {
      const expected: InterfaceContract = {
        name: 'Test',
        methods: [{ name: 'requiredMethod', signature: '() => void' }],
        types: [],
        version: '1.0.0',
      };
      const actual: InterfaceContract = {
        name: 'Test',
        methods: [],
        types: [],
        version: '1.0.0',
      };

      const result = validateInterfaceContract(expected, actual);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Missing method'))).toBe(true);
    });
  });

  describe('validateDependencyVersion', () => {
    it('should accept compatible versions', () => {
      const result = validateDependencyVersion('1.2.0', '1.3.0');
      expect(result.isValid).toBe(true);
    });

    it('should reject major version mismatch', () => {
      const result = validateDependencyVersion('1.0.0', '2.0.0');
      expect(result.isValid).toBe(false);
    });

    it('should reject lower minor version', () => {
      const result = validateDependencyVersion('1.5.0', '1.3.0');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateExportCompatibility', () => {
    it('should detect removed exports', () => {
      const result = validateExportCompatibility(
        ['exportA', 'exportB'],
        ['exportA']
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Removed export'))).toBe(true);
    });

    it('should warn on new exports', () => {
      const result = validateExportCompatibility(
        ['exportA'],
        ['exportA', 'exportB']
      );
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('New export'))).toBe(true);
    });
  });
});

describe('Checkers', () => {
  describe('detectBreakingChanges', () => {
    it('should detect removed methods', () => {
      const changes = detectBreakingChanges(
        { methods: ['methodA', 'methodB'], types: [] },
        { methods: ['methodA'], types: [] }
      );

      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('removed');
      expect(changes[0].location).toBe('method:methodB');
    });

    it('should detect removed types', () => {
      const changes = detectBreakingChanges(
        { methods: [], types: ['TypeA'] },
        { methods: [], types: [] }
      );

      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('removed');
      expect(changes[0].location).toBe('type:TypeA');
    });
  });

  describe('checkCrossRepoIntegration', () => {
    it('should validate complete configuration', () => {
      const result = checkCrossRepoIntegration(
        '@chicago-forest/test',
        'NPCPU',
        {
          expectedInterfaces: ['TestInterface'],
          requiredMethods: ['init', 'process'],
        }
      );

      expect(result.compatible).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect missing interfaces', () => {
      const result = checkCrossRepoIntegration(
        '@chicago-forest/test',
        'NPCPU',
        {
          expectedInterfaces: [],
          requiredMethods: ['init'],
        }
      );

      expect(result.compatible).toBe(false);
    });
  });

  describe('generateCompatibilityMatrix', () => {
    it('should generate dependency matrix', () => {
      const packages = [
        { name: 'pkg-a', version: '1.0.0', dependencies: { 'shared': '1.0.0' } },
        { name: 'pkg-b', version: '1.0.0', dependencies: { 'shared': '1.0.0' } },
      ];

      const matrix = generateCompatibilityMatrix(packages);
      expect(matrix.has('shared@1.0.0')).toBe(true);
      expect(matrix.get('shared@1.0.0')?.size).toBe(2);
    });
  });
});

describe('Generators', () => {
  describe('generateIntegrationTest', () => {
    it('should generate valid test code', () => {
      const point: IntegrationPoint = {
        name: 'test-integration',
        sourceRepo: 'NPCPU',
        targetPackage: '@chicago-forest/test',
        interface: 'TestInterface',
        version: '1.0.0',
        status: 'compatible',
      };

      const test = generateIntegrationTest(point);

      expect(test.name).toBe('test-integration.integration.test.ts');
      expect(test.code).toContain('describe');
      expect(test.code).toContain('TestInterface');
      expect(test.dependencies).toContain('@chicago-forest/test');
      expect(test.dependencies).toContain('vitest');
    });
  });

  describe('generateMigrationGuide', () => {
    it('should generate guide for breaking changes', () => {
      const changes: BreakingChange[] = [
        {
          type: 'removed',
          location: 'method:oldMethod',
          description: 'oldMethod has been removed',
          impact: 'high',
          migration: 'Use newMethod instead',
        },
      ];

      const guide = generateMigrationGuide(changes);

      expect(guide).toContain('# Migration Guide');
      expect(guide).toContain('High Impact');
      expect(guide).toContain('oldMethod');
    });

    it('should handle no breaking changes', () => {
      const guide = generateMigrationGuide([]);
      expect(guide).toContain('No breaking changes');
    });
  });

  describe('generateHealthDashboard', () => {
    it('should generate markdown dashboard', () => {
      const repos = [
        { name: 'Repo1', status: 'healthy', issues: [] },
        { name: 'Repo2', status: 'warning', issues: ['Issue 1'] },
      ];

      const dashboard = generateHealthDashboard(repos);

      expect(dashboard).toContain('# Ecosystem Health Dashboard');
      expect(dashboard).toContain('Repo1');
      expect(dashboard).toContain('Repo2');
      expect(dashboard).toContain('Agent 20: Validator');
    });
  });

  describe('generateAPIContract', () => {
    it('should generate OpenAPI schema', () => {
      const schema = {
        name: 'Test API',
        version: '1.0.0',
        endpoints: [
          {
            path: '/health',
            method: 'GET',
            responseSchema: { type: 'object', properties: { status: { type: 'string' } } },
          },
        ],
      };

      const contract = generateAPIContract(schema);
      const parsed = JSON.parse(contract);

      expect(parsed.openapi).toBe('3.0.0');
      expect(parsed.info.title).toBe('Test API');
      expect(parsed.paths['/health']).toBeDefined();
    });
  });
});

describe('Integration Points', () => {
  describe('NPCPU Integration Points', () => {
    it('should have valid structure', () => {
      for (const point of NPCPU_INTEGRATION_POINTS) {
        expect(point.name).toBeDefined();
        expect(point.sourceRepo).toBe('NPCPU');
        expect(point.targetPackage).toMatch(/^@chicago-forest\//);
        expect(point.interface).toBeDefined();
        expect(point.version).toMatch(/^\d+\.\d+\.\d+$/);
      }
    });
  });

  describe('ConstitutionalShrinkage Integration Points', () => {
    it('should have valid structure', () => {
      for (const point of CONSHRINK_INTEGRATION_POINTS) {
        expect(point.name).toBeDefined();
        expect(point.sourceRepo).toBe('ConstitutionalShrinkage');
        expect(point.targetPackage).toMatch(/^@chicago-forest\//);
        expect(point.interface).toBeDefined();
        expect(point.version).toMatch(/^\d+\.\d+\.\d+$/);
      }
    });
  });
});
