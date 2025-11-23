/**
 * @chicago-forest/doc-generator
 *
 * Agent 14: Prophet - Documentation Automation
 *
 * Auto-generate API documentation, READMEs, architecture diagrams,
 * and integration guides from source code.
 */

export * from './extractors';
export * from './generators';

export interface DocConfig {
  packagePath: string;
  outputPath: string;
  includePrivate: boolean;
  generateDiagrams: boolean;
  format: 'markdown' | 'html' | 'json';
}

export interface ExtractedDoc {
  name: string;
  type: 'function' | 'class' | 'interface' | 'type' | 'constant';
  description: string;
  parameters?: { name: string; type: string; description?: string }[];
  returns?: { type: string; description?: string };
  examples?: string[];
  since?: string;
  deprecated?: boolean;
}

export interface PackageDoc {
  name: string;
  version: string;
  description: string;
  exports: ExtractedDoc[];
  dependencies: string[];
  readme?: string;
}

export interface ArchitectureDiagram {
  type: 'mermaid' | 'plantuml';
  content: string;
  title: string;
}

export class DocGenerator {
  private readonly config: DocConfig;

  constructor(config: Partial<DocConfig> = {}) {
    this.config = {
      packagePath: config.packagePath || './packages',
      outputPath: config.outputPath || './docs/generated',
      includePrivate: config.includePrivate || false,
      generateDiagrams: config.generateDiagrams || true,
      format: config.format || 'markdown',
    };
  }

  generateReadme(pkg: PackageDoc): string {
    const lines: string[] = [
      `# ${pkg.name}`,
      '',
      `> ${pkg.description}`,
      '',
      '## Installation',
      '',
      '```bash',
      `pnpm add ${pkg.name}`,
      '```',
      '',
      '## API Reference',
      '',
    ];

    for (const exp of pkg.exports) {
      lines.push(`### ${exp.name}`);
      lines.push('');
      lines.push(exp.description);
      lines.push('');

      if (exp.parameters && exp.parameters.length > 0) {
        lines.push('**Parameters:**');
        lines.push('');
        for (const param of exp.parameters) {
          lines.push(`- \`${param.name}\` (${param.type})${param.description ? `: ${param.description}` : ''}`);
        }
        lines.push('');
      }

      if (exp.returns) {
        lines.push(`**Returns:** \`${exp.returns.type}\`${exp.returns.description ? ` - ${exp.returns.description}` : ''}`);
        lines.push('');
      }

      if (exp.examples && exp.examples.length > 0) {
        lines.push('**Example:**');
        lines.push('');
        lines.push('```typescript');
        lines.push(exp.examples[0]);
        lines.push('```');
        lines.push('');
      }
    }

    lines.push('## License');
    lines.push('');
    lines.push('MIT');

    return lines.join('\n');
  }

  generateArchitectureDiagram(packages: string[], dependencies: Map<string, string[]>): ArchitectureDiagram {
    const lines: string[] = [
      'graph TD',
    ];

    for (const pkg of packages) {
      const shortName = pkg.replace('@chicago-forest/', '');
      lines.push(`    ${shortName}[${shortName}]`);
    }

    lines.push('');

    for (const [pkg, deps] of dependencies) {
      const shortPkg = pkg.replace('@chicago-forest/', '');
      for (const dep of deps) {
        const shortDep = dep.replace('@chicago-forest/', '');
        if (packages.includes(dep)) {
          lines.push(`    ${shortPkg} --> ${shortDep}`);
        }
      }
    }

    return {
      type: 'mermaid',
      content: lines.join('\n'),
      title: 'Package Dependencies',
    };
  }

  generateChangelog(commits: { hash: string; message: string; date: Date }[]): string {
    const lines: string[] = [
      '# Changelog',
      '',
      'All notable changes to this project will be documented in this file.',
      '',
    ];

    // Group by date
    const byDate = new Map<string, typeof commits>();
    for (const commit of commits) {
      const dateKey = commit.date.toISOString().split('T')[0];
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, []);
      }
      byDate.get(dateKey)!.push(commit);
    }

    for (const [date, dateCommits] of byDate) {
      lines.push(`## ${date}`);
      lines.push('');
      for (const commit of dateCommits) {
        lines.push(`- ${commit.message} (${commit.hash.slice(0, 7)})`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}

export default DocGenerator;
