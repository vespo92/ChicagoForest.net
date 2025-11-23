/**
 * Documentation Generators
 *
 * Generate various documentation formats from extracted data.
 */

import type { PackageDoc, ArchitectureDiagram } from '../index';

export function generateApiMarkdown(pkg: PackageDoc): string {
  const lines: string[] = [
    `# ${pkg.name} API Reference`,
    '',
    `Version: ${pkg.version}`,
    '',
    pkg.description,
    '',
    '---',
    '',
  ];

  // Group exports by type
  const functions = pkg.exports.filter(e => e.type === 'function');
  const classes = pkg.exports.filter(e => e.type === 'class');
  const interfaces = pkg.exports.filter(e => e.type === 'interface');
  const types = pkg.exports.filter(e => e.type === 'type');

  if (classes.length > 0) {
    lines.push('## Classes');
    lines.push('');
    for (const cls of classes) {
      lines.push(`### \`${cls.name}\``);
      lines.push('');
      lines.push(cls.description);
      lines.push('');
    }
  }

  if (interfaces.length > 0) {
    lines.push('## Interfaces');
    lines.push('');
    for (const iface of interfaces) {
      lines.push(`### \`${iface.name}\``);
      lines.push('');
      lines.push(iface.description);
      lines.push('');
    }
  }

  if (functions.length > 0) {
    lines.push('## Functions');
    lines.push('');
    for (const fn of functions) {
      lines.push(`### \`${fn.name}()\``);
      lines.push('');
      lines.push(fn.description);
      lines.push('');

      if (fn.parameters && fn.parameters.length > 0) {
        lines.push('| Parameter | Type | Description |');
        lines.push('|-----------|------|-------------|');
        for (const param of fn.parameters) {
          lines.push(`| \`${param.name}\` | \`${param.type}\` | ${param.description || '-'} |`);
        }
        lines.push('');
      }

      if (fn.returns) {
        lines.push(`**Returns:** \`${fn.returns.type}\``);
        if (fn.returns.description) {
          lines.push('');
          lines.push(fn.returns.description);
        }
        lines.push('');
      }
    }
  }

  if (types.length > 0) {
    lines.push('## Types');
    lines.push('');
    for (const type of types) {
      lines.push(`### \`${type.name}\``);
      lines.push('');
      lines.push(type.description);
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function generateMermaidDiagram(
  title: string,
  nodes: { id: string; label: string }[],
  edges: { from: string; to: string; label?: string }[]
): ArchitectureDiagram {
  const lines: string[] = [
    `%% ${title}`,
    'graph TD',
  ];

  for (const node of nodes) {
    lines.push(`    ${node.id}["${node.label}"]`);
  }

  lines.push('');

  for (const edge of edges) {
    if (edge.label) {
      lines.push(`    ${edge.from} -->|${edge.label}| ${edge.to}`);
    } else {
      lines.push(`    ${edge.from} --> ${edge.to}`);
    }
  }

  return {
    type: 'mermaid',
    title,
    content: lines.join('\n'),
  };
}

export function generatePackageTree(packages: { name: string; deps: string[] }[]): string {
  const lines: string[] = ['# Package Structure', ''];

  for (const pkg of packages) {
    const shortName = pkg.name.replace('@chicago-forest/', '');
    lines.push(`## ${shortName}`);
    lines.push('');

    if (pkg.deps.length > 0) {
      lines.push('Dependencies:');
      for (const dep of pkg.deps) {
        lines.push(`- ${dep}`);
      }
    } else {
      lines.push('No internal dependencies');
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function generateIntegrationGuide(
  sourcePkg: string,
  targetPkg: string,
  steps: string[]
): string {
  return [
    `# Integrating ${sourcePkg} with ${targetPkg}`,
    '',
    '## Prerequisites',
    '',
    `- ${sourcePkg} installed`,
    `- ${targetPkg} installed`,
    '',
    '## Integration Steps',
    '',
    ...steps.map((step, i) => `${i + 1}. ${step}`),
    '',
    '## Example',
    '',
    '```typescript',
    `import { ... } from '${sourcePkg}';`,
    `import { ... } from '${targetPkg}';`,
    '',
    '// Integration code here',
    '```',
  ].join('\n');
}
