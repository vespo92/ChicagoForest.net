/**
 * Tests for breaking change detection
 */

import { describe, it, expect } from 'vitest';
import {
  detectBreakingChanges,
  generateBreakingChangeDoc,
  suggestVersionBump,
} from '../src/breaking-changes';
import type { PackageDoc, ExtractedDoc } from '../src/types';

function createMockPackage(
  name: string,
  version: string,
  exports: Partial<ExtractedDoc>[]
): PackageDoc {
  return {
    name,
    version,
    description: 'Test package',
    exports: exports.map(e => ({
      name: e.name || 'unnamed',
      type: e.type || 'function',
      description: e.description || '',
      parameters: e.parameters,
      returns: e.returns,
      properties: e.properties,
      methods: e.methods,
      examples: [],
      internal: e.internal || false,
      filePath: 'test.ts',
      lineNumber: 1,
    })) as ExtractedDoc[],
    dependencies: [],
    peerDependencies: [],
    entryPoints: ['./src/index.ts'],
  };
}

describe('detectBreakingChanges', () => {
  it('should detect removed exports', () => {
    const previous = createMockPackage('test', '1.0.0', [
      { name: 'foo', type: 'function' },
      { name: 'bar', type: 'function' },
    ]);

    const current = createMockPackage('test', '2.0.0', [
      { name: 'foo', type: 'function' },
    ]);

    const report = detectBreakingChanges(previous, current);

    expect(report.changes).toHaveLength(1);
    expect(report.changes[0].type).toBe('removed-export');
    expect(report.changes[0].description).toContain('bar');
    expect(report.changes[0].severity).toBe('major');
  });

  it('should detect type changes', () => {
    const previous = createMockPackage('test', '1.0.0', [
      { name: 'foo', type: 'function' },
    ]);

    const current = createMockPackage('test', '2.0.0', [
      { name: 'foo', type: 'class' },
    ]);

    const report = detectBreakingChanges(previous, current);

    expect(report.changes).toHaveLength(1);
    expect(report.changes[0].type).toBe('changed-type');
    expect(report.changes[0].previousValue).toBe('function');
    expect(report.changes[0].currentValue).toBe('class');
  });

  it('should detect removed parameters', () => {
    const previous = createMockPackage('test', '1.0.0', [
      {
        name: 'foo',
        type: 'function',
        parameters: [
          { name: 'a', type: 'string', optional: false },
          { name: 'b', type: 'number', optional: false },
        ],
      },
    ]);

    const current = createMockPackage('test', '2.0.0', [
      {
        name: 'foo',
        type: 'function',
        parameters: [
          { name: 'a', type: 'string', optional: false },
        ],
      },
    ]);

    const report = detectBreakingChanges(previous, current);

    expect(report.changes.some(c => c.type === 'removed-parameter')).toBe(true);
  });

  it('should detect new required parameters', () => {
    const previous = createMockPackage('test', '1.0.0', [
      {
        name: 'foo',
        type: 'function',
        parameters: [
          { name: 'a', type: 'string', optional: false },
        ],
      },
    ]);

    const current = createMockPackage('test', '2.0.0', [
      {
        name: 'foo',
        type: 'function',
        parameters: [
          { name: 'a', type: 'string', optional: false },
          { name: 'b', type: 'number', optional: false },
        ],
      },
    ]);

    const report = detectBreakingChanges(previous, current);

    expect(report.changes.some(c => c.type === 'required-parameter-added')).toBe(true);
  });

  it('should detect return type changes', () => {
    const previous = createMockPackage('test', '1.0.0', [
      {
        name: 'foo',
        type: 'function',
        returns: { type: 'string' },
      },
    ]);

    const current = createMockPackage('test', '2.0.0', [
      {
        name: 'foo',
        type: 'function',
        returns: { type: 'number' },
      },
    ]);

    const report = detectBreakingChanges(previous, current);

    expect(report.changes.some(c => c.type === 'return-type-changed')).toBe(true);
  });

  it('should not report changes for internal exports when ignored', () => {
    const previous = createMockPackage('test', '1.0.0', [
      { name: 'internal', type: 'function', internal: true },
    ]);

    const current = createMockPackage('test', '2.0.0', []);

    const report = detectBreakingChanges(previous, current, { ignoreInternal: true });

    expect(report.changes).toHaveLength(0);
  });

  it('should report no changes when packages are identical', () => {
    const pkg = createMockPackage('test', '1.0.0', [
      { name: 'foo', type: 'function' },
    ]);

    const report = detectBreakingChanges(pkg, pkg);

    expect(report.changes).toHaveLength(0);
  });
});

describe('generateBreakingChangeDoc', () => {
  it('should generate documentation for breaking changes', () => {
    const previous = createMockPackage('test', '1.0.0', [
      { name: 'removed', type: 'function' },
      { name: 'changed', type: 'function' },
    ]);

    const current = createMockPackage('test', '2.0.0', [
      { name: 'changed', type: 'class' },
    ]);

    const report = detectBreakingChanges(previous, current);
    const doc = generateBreakingChangeDoc(report);

    expect(doc).toContain('# Breaking Changes: test');
    expect(doc).toContain('1.0.0 → 2.0.0');
    expect(doc).toContain('## Major Changes');
    expect(doc).toContain('removed');
  });

  it('should indicate no breaking changes when none exist', () => {
    const pkg = createMockPackage('test', '1.0.0', [
      { name: 'foo', type: 'function' },
    ]);

    const report = detectBreakingChanges(pkg, pkg);
    const doc = generateBreakingChangeDoc(report);

    expect(doc).toContain('No breaking changes detected');
  });
});

describe('suggestVersionBump', () => {
  it('should suggest major bump for breaking changes', () => {
    const changes = [
      { type: 'removed-export' as const, severity: 'major' as const, location: '', description: '' },
    ];

    const result = suggestVersionBump('1.2.3', changes);

    expect(result.major).toBe(2);
    expect(result.minor).toBe(0);
    expect(result.patch).toBe(0);
    expect(result.suggestion).toContain('2.0.0');
    expect(result.suggestion).toContain('major');
  });

  it('should suggest minor bump for minor changes', () => {
    const changes = [
      { type: 'changed-type' as const, severity: 'minor' as const, location: '', description: '' },
    ];

    const result = suggestVersionBump('1.2.3', changes);

    expect(result.major).toBe(1);
    expect(result.minor).toBe(3);
    expect(result.patch).toBe(0);
  });

  it('should suggest patch bump for no changes', () => {
    const result = suggestVersionBump('1.2.3', []);

    expect(result.major).toBe(1);
    expect(result.minor).toBe(2);
    expect(result.patch).toBe(4);
    expect(result.suggestion).toContain('1.2.4');
  });
});
