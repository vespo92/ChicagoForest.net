/**
 * Tests for documentation generators
 */

import { describe, it, expect } from 'vitest';
import {
  generateApiMarkdown,
  generateMermaidDiagram,
  generatePackageTree,
  generateIntegrationGuide,
} from '../src/generators';
import type { PackageDoc, DiagramNode, DiagramEdge } from '../src/types';

describe('generateApiMarkdown', () => {
  const mockPackage: PackageDoc = {
    name: '@chicago-forest/test-package',
    version: '1.0.0',
    description: 'A test package for documentation',
    exports: [
      {
        name: 'TestClass',
        type: 'class',
        description: 'A test class',
        examples: [],
        internal: false,
        filePath: 'src/test.ts',
        lineNumber: 1,
      },
      {
        name: 'TestInterface',
        type: 'interface',
        description: 'A test interface',
        examples: [],
        internal: false,
        filePath: 'src/test.ts',
        lineNumber: 10,
      },
      {
        name: 'testFunction',
        type: 'function',
        description: 'A test function',
        parameters: [
          { name: 'input', type: 'string', optional: false },
          { name: 'options', type: 'Options', optional: true },
        ],
        returns: { type: 'Promise<Result>', description: 'The result' },
        examples: [],
        internal: false,
        filePath: 'src/test.ts',
        lineNumber: 20,
      },
    ],
    dependencies: [],
    peerDependencies: [],
    entryPoints: ['./src/index.ts'],
  };

  it('should generate markdown with package info', () => {
    const result = generateApiMarkdown(mockPackage);

    expect(result).toContain('# @chicago-forest/test-package API Reference');
    expect(result).toContain('Version: 1.0.0');
    expect(result).toContain('A test package for documentation');
  });

  it('should group exports by type', () => {
    const result = generateApiMarkdown(mockPackage);

    expect(result).toContain('## Classes');
    expect(result).toContain('## Interfaces');
    expect(result).toContain('## Functions');
  });

  it('should document classes', () => {
    const result = generateApiMarkdown(mockPackage);

    expect(result).toContain('### `TestClass`');
    expect(result).toContain('A test class');
  });

  it('should document interfaces', () => {
    const result = generateApiMarkdown(mockPackage);

    expect(result).toContain('### `TestInterface`');
    expect(result).toContain('A test interface');
  });

  it('should document functions with parameters', () => {
    const result = generateApiMarkdown(mockPackage);

    expect(result).toContain('### `testFunction()`');
    expect(result).toContain('| `input` | `string`');
    expect(result).toContain('| `options` | `Options`');
    expect(result).toContain('**Returns:** `Promise<Result>`');
  });
});

describe('generateMermaidDiagram', () => {
  it('should generate valid Mermaid diagram', () => {
    const nodes: DiagramNode[] = [
      { id: 'pkg_a', label: 'Package A', type: 'package' },
      { id: 'pkg_b', label: 'Package B', type: 'package' },
      { id: 'pkg_c', label: 'Package C', type: 'package' },
    ];

    const edges: DiagramEdge[] = [
      { from: 'pkg_a', to: 'pkg_b', type: 'dependency' },
      { from: 'pkg_b', to: 'pkg_c', type: 'dependency' },
    ];

    const result = generateMermaidDiagram('Test Dependencies', nodes, edges);

    expect(result.type).toBe('mermaid');
    expect(result.title).toBe('Test Dependencies');
    expect(result.content).toContain('graph TD');
    expect(result.content).toContain('pkg_a["Package A"]');
    expect(result.content).toContain('pkg_b["Package B"]');
    expect(result.content).toContain('pkg_c["Package C"]');
    expect(result.content).toContain('pkg_a --> pkg_b');
    expect(result.content).toContain('pkg_b --> pkg_c');
  });

  it('should handle labeled edges', () => {
    const nodes: DiagramNode[] = [
      { id: 'a', label: 'A', type: 'package' },
      { id: 'b', label: 'B', type: 'package' },
    ];

    const edges: DiagramEdge[] = [
      { from: 'a', to: 'b', label: 'uses', type: 'uses' },
    ];

    const result = generateMermaidDiagram('Labeled', nodes, edges);

    expect(result.content).toContain('a -->|uses| b');
  });

  it('should handle empty graphs', () => {
    const result = generateMermaidDiagram('Empty', [], []);

    expect(result.content).toContain('graph TD');
    expect(result.title).toBe('Empty');
  });
});

describe('generatePackageTree', () => {
  it('should generate package tree documentation', () => {
    const packages = [
      { name: '@chicago-forest/core', deps: [] },
      { name: '@chicago-forest/api', deps: ['@chicago-forest/core'] },
      { name: '@chicago-forest/cli', deps: ['@chicago-forest/core', '@chicago-forest/api'] },
    ];

    const result = generatePackageTree(packages);

    expect(result).toContain('# Package Structure');
    expect(result).toContain('## core');
    expect(result).toContain('## api');
    expect(result).toContain('## cli');
    expect(result).toContain('No internal dependencies');
    expect(result).toContain('- @chicago-forest/core');
  });

  it('should handle empty packages', () => {
    const result = generatePackageTree([]);

    expect(result).toContain('# Package Structure');
  });
});

describe('generateIntegrationGuide', () => {
  it('should generate integration guide', () => {
    const steps = [
      'Install both packages',
      'Import required modules',
      'Configure integration',
      'Initialize connection',
    ];

    const result = generateIntegrationGuide(
      '@chicago-forest/core',
      '@chicago-forest/api',
      steps
    );

    expect(result).toContain('# Integrating @chicago-forest/core with @chicago-forest/api');
    expect(result).toContain('## Prerequisites');
    expect(result).toContain('## Integration Steps');
    expect(result).toContain('1. Install both packages');
    expect(result).toContain('4. Initialize connection');
    expect(result).toContain('## Example');
    expect(result).toContain("import { ... } from '@chicago-forest/core';");
    expect(result).toContain("import { ... } from '@chicago-forest/api';");
  });
});
