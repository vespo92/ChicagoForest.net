/**
 * @chicago-forest/doc-generator
 *
 * Agent 14: Prophet - Documentation Automation
 *
 * Auto-generate API documentation, READMEs, architecture diagrams,
 * and integration guides from source code.
 *
 * Features:
 * - TypeScript AST parsing for accurate code extraction
 * - API documentation generation
 * - Package README auto-generation
 * - Architecture diagram generation (Mermaid)
 * - Breaking change detection and documentation
 * - Changelog automation
 * - Example code generation
 * - NPCPU integration for AI-enhanced documentation
 *
 * @example
 * ```typescript
 * import { DocGenerator, createNPCPUClient } from '@chicago-forest/doc-generator';
 *
 * const generator = new DocGenerator({
 *   packagesPath: './packages',
 *   outputPath: './docs/generated',
 *   generateDiagrams: true,
 * });
 *
 * const result = await generator.generate();
 * console.log(`Generated ${result.stats.filesCreated} files`);
 * ```
 */

// Re-export types
export * from './types';

// Re-export extractors
export * from './extractors';
export { parseTypeScriptFile, parsePackage } from './extractors/typescript-parser';

// Re-export generators
export * from './generators';

// Re-export breaking change detection
export {
  detectBreakingChanges,
  generateBreakingChangeDoc,
  suggestVersionBump,
} from './breaking-changes';

// Re-export example generation
export {
  generatePackageExamples,
  generateQuickStart,
  validateExampleSyntax,
} from './examples';

// Re-export NPCPU integration
export {
  NPCPUDocClient,
  createNPCPUClient,
  isNPCPUAvailable,
  getNPCPUConfigFromEnv,
} from './npcpu';

// Re-export templates
export {
  getTemplate,
  registerTemplate,
  renderTemplate,
  renderReadme,
  renderApiReference,
  renderArchitectureDiagram,
  README_TEMPLATE,
  API_REFERENCE_TEMPLATE,
  CHANGELOG_TEMPLATE,
  INTEGRATION_GUIDE_TEMPLATE,
  ARCHITECTURE_TEMPLATE,
} from './templates';

import EventEmitter from 'eventemitter3';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve, basename } from 'path';
import { parseTypeScriptFile } from './extractors/typescript-parser';
import { generateApiMarkdown, generateMermaidDiagram } from './generators';
import { detectBreakingChanges, generateBreakingChangeDoc } from './breaking-changes';
import { generateQuickStart } from './examples';
import { createNPCPUClient } from './npcpu';
import type {
  DocGeneratorConfig,
  PackageDoc,
  ExtractedDoc,
  PackageDependency,
  GenerationResult,
  GeneratedFile,
  DiagramNode,
  DiagramEdge,
} from './types';

export const DEFAULT_CONFIG: DocGeneratorConfig = {
  packagesPath: './packages',
  outputPath: './docs/generated',
  includePrivate: false,
  generateDiagrams: true,
  generateGuides: true,
  format: 'markdown',
  enableNPCPU: false,
  verbose: false,
};

export interface DocGeneratorEvents {
  'extraction:start': (packageName: string) => void;
  'extraction:complete': (packageName: string, exports: number) => void;
  'extraction:error': (packageName: string, error: Error) => void;
  'generation:start': () => void;
  'generation:complete': (result: GenerationResult) => void;
  'generation:error': (error: Error) => void;
  'breaking-change:detected': (packageName: string, count: number) => void;
}

/**
 * Main documentation generator class
 *
 * Orchestrates the documentation generation process including:
 * - Package discovery and parsing
 * - API documentation extraction
 * - Diagram generation
 * - Breaking change detection
 * - NPCPU integration for AI enhancement
 */
export class DocGenerator extends EventEmitter<DocGeneratorEvents> {
  private readonly config: DocGeneratorConfig;
  private readonly npcpuClient;
  private packages: PackageDoc[] = [];

  constructor(config: Partial<DocGeneratorConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize NPCPU client if enabled
    this.npcpuClient = createNPCPUClient({
      enabled: this.config.enableNPCPU,
    });
  }

  /**
   * Generate documentation for all packages
   */
  async generate(): Promise<GenerationResult> {
    const startTime = Date.now();
    const generatedFiles: GeneratedFile[] = [];
    const errors: { file: string; message: string }[] = [];

    this.emit('generation:start');

    try {
      // Discover and parse packages
      await this.discoverPackages();

      // Enhance with NPCPU if enabled
      if (this.config.enableNPCPU) {
        this.packages = await Promise.all(
          this.packages.map(pkg => this.npcpuClient.enhancePackage(pkg))
        );
      }

      // Generate output
      const outputBase = resolve(this.config.outputPath);
      this.ensureDir(outputBase);

      // Generate API documentation
      const apiDir = join(outputBase, 'api');
      this.ensureDir(apiDir);

      for (const pkg of this.packages) {
        const shortName = pkg.name.replace('@chicago-forest/', '');
        const apiContent = generateApiMarkdown(pkg);
        const apiPath = join(apiDir, `${shortName}.md`);
        writeFileSync(apiPath, apiContent);
        generatedFiles.push({ path: apiPath, type: 'api-reference', size: apiContent.length });
      }

      // Generate examples
      const examplesDir = join(outputBase, 'examples');
      this.ensureDir(examplesDir);

      for (const pkg of this.packages) {
        const shortName = pkg.name.replace('@chicago-forest/', '');
        const quickStart = generateQuickStart(pkg);
        const examplesPath = join(examplesDir, `${shortName}-quickstart.md`);
        writeFileSync(examplesPath, quickStart);
        generatedFiles.push({ path: examplesPath, type: 'readme', size: quickStart.length });
      }

      // Generate diagrams
      if (this.config.generateDiagrams) {
        const diagramsDir = join(outputBase, 'diagrams');
        this.ensureDir(diagramsDir);

        const diagram = this.generateDependencyDiagram();
        const diagramPath = join(diagramsDir, 'dependencies.md');
        const diagramContent = `# Package Dependencies\n\n\`\`\`mermaid\n${diagram.content}\n\`\`\``;
        writeFileSync(diagramPath, diagramContent);
        generatedFiles.push({ path: diagramPath, type: 'architecture', size: diagramContent.length });
      }

      // Generate index
      const indexContent = this.generateIndex();
      const indexPath = join(outputBase, 'README.md');
      writeFileSync(indexPath, indexContent);
      generatedFiles.push({ path: indexPath, type: 'readme', size: indexContent.length });

      const result: GenerationResult = {
        success: errors.length === 0,
        outputPath: outputBase,
        files: generatedFiles,
        errors,
        stats: {
          packagesProcessed: this.packages.length,
          exportsDocumented: this.packages.reduce((sum, p) => sum + p.exports.length, 0),
          diagramsGenerated: this.config.generateDiagrams ? 1 : 0,
          filesCreated: generatedFiles.length,
          duration: Date.now() - startTime,
        },
      };

      this.emit('generation:complete', result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.emit('generation:error', err);
      throw err;
    }
  }

  /**
   * Generate documentation for a specific package
   */
  async generateForPackage(packageName: string): Promise<GenerationResult> {
    const originalFilter = this.config.packageFilter;
    this.config.packageFilter = packageName;
    const result = await this.generate();
    this.config.packageFilter = originalFilter;
    return result;
  }

  /**
   * Detect breaking changes between versions
   */
  async detectBreakingChanges(
    previousPkg: PackageDoc,
    currentPkg: PackageDoc
  ): Promise<string> {
    const report = detectBreakingChanges(previousPkg, currentPkg);

    if (report.changes.length > 0) {
      this.emit('breaking-change:detected', currentPkg.name, report.changes.length);
    }

    return generateBreakingChangeDoc(report);
  }

  /**
   * Get parsed packages
   */
  getPackages(): PackageDoc[] {
    return this.packages;
  }

  /**
   * Discover and parse all packages
   */
  private async discoverPackages(): Promise<void> {
    const packagesPath = resolve(this.config.packagesPath);
    if (!existsSync(packagesPath)) {
      throw new Error(`Packages directory not found: ${packagesPath}`);
    }

    const packageDirs = readdirSync(packagesPath)
      .map(name => join(packagesPath, name))
      .filter(p => {
        if (!statSync(p).isDirectory()) return false;
        if (!existsSync(join(p, 'package.json'))) return false;
        if (this.config.packageFilter) {
          return basename(p).includes(this.config.packageFilter);
        }
        return true;
      });

    this.packages = [];

    for (const pkgDir of packageDirs) {
      const pkgName = basename(pkgDir);
      this.emit('extraction:start', pkgName);

      try {
        const pkgDoc = this.extractPackageDocs(pkgDir);
        if (pkgDoc) {
          this.packages.push(pkgDoc);
          this.emit('extraction:complete', pkgName, pkgDoc.exports.length);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        this.emit('extraction:error', pkgName, err);
        if (this.config.verbose) {
          console.warn(`Failed to extract docs from ${pkgName}: ${err.message}`);
        }
      }
    }
  }

  /**
   * Extract documentation from a package
   */
  private extractPackageDocs(packagePath: string): PackageDoc | null {
    const pkgJsonPath = join(packagePath, 'package.json');
    if (!existsSync(pkgJsonPath)) return null;

    const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
    const srcPath = join(packagePath, 'src');
    const files = this.findTypeScriptFiles(srcPath);

    const exports: ExtractedDoc[] = [];

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const docs = parseTypeScriptFile(file, content, {
          includePrivate: this.config.includePrivate,
        });
        exports.push(...docs);
      } catch {
        // Skip files that can't be parsed
      }
    }

    const dependencies: PackageDependency[] = [];
    if (pkgJson.dependencies) {
      for (const [name, version] of Object.entries(pkgJson.dependencies)) {
        dependencies.push({
          name,
          version: String(version),
          internal: name.startsWith('@chicago-forest/'),
        });
      }
    }

    return {
      name: pkgJson.name,
      version: pkgJson.version,
      description: pkgJson.description || '',
      exports,
      dependencies,
      peerDependencies: [],
      entryPoints: ['./src/index.ts'],
    };
  }

  /**
   * Find TypeScript files in a directory
   */
  private findTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    if (!existsSync(dir)) return files;

    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && entry !== 'node_modules' && entry !== 'dist') {
        files.push(...this.findTypeScriptFiles(fullPath));
      } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts') && !entry.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Generate dependency diagram
   */
  private generateDependencyDiagram() {
    const nodes: DiagramNode[] = this.packages.map(pkg => ({
      id: pkg.name.replace('@chicago-forest/', '').replace(/-/g, '_'),
      label: pkg.name.replace('@chicago-forest/', ''),
      type: 'package',
    }));

    const edges: DiagramEdge[] = [];
    for (const pkg of this.packages) {
      const fromId = pkg.name.replace('@chicago-forest/', '').replace(/-/g, '_');
      for (const dep of pkg.dependencies.filter(d => d.internal)) {
        const toId = dep.name.replace('@chicago-forest/', '').replace(/-/g, '_');
        if (nodes.some(n => n.id === toId)) {
          edges.push({ from: fromId, to: toId, type: 'dependency' });
        }
      }
    }

    return generateMermaidDiagram('Package Dependencies', nodes, edges);
  }

  /**
   * Generate index README
   */
  private generateIndex(): string {
    const lines = [
      '# Chicago Forest Network - API Documentation',
      '',
      '> Auto-generated documentation by Agent 14: Prophet',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Packages',
      '',
    ];

    for (const pkg of this.packages) {
      const shortName = pkg.name.replace('@chicago-forest/', '');
      lines.push(`### [${shortName}](./api/${shortName}.md)`);
      lines.push('');
      lines.push(pkg.description || 'No description');
      lines.push('');
      lines.push(`- **Version:** ${pkg.version}`);
      lines.push(`- **Exports:** ${pkg.exports.length}`);
      lines.push('');
    }

    lines.push('## Quick Start Guides');
    lines.push('');
    for (const pkg of this.packages) {
      const shortName = pkg.name.replace('@chicago-forest/', '');
      lines.push(`- [${shortName}](./examples/${shortName}-quickstart.md)`);
    }
    lines.push('');

    if (this.config.generateDiagrams) {
      lines.push('## Architecture');
      lines.push('');
      lines.push('- [Package Dependencies](./diagrams/dependencies.md)');
      lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push('*This documentation is AI-generated. All content is part of the Chicago Forest Network theoretical framework.*');

    return lines.join('\n');
  }

  /**
   * Ensure directory exists
   */
  private ensureDir(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Generate README for a package (legacy method for backward compatibility)
   */
  generateReadme(pkg: { name: string; description: string; exports: Array<{ name: string; description: string; parameters?: Array<{ name: string; type: string; description?: string }>; returns?: { type: string; description?: string }; examples?: string[] }> }): string {
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

  /**
   * Generate architecture diagram (legacy method for backward compatibility)
   */
  generateArchitectureDiagram(packages: string[], dependencies: Map<string, string[]>): { type: 'mermaid' | 'plantuml'; content: string; title: string } {
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

  /**
   * Generate changelog (legacy method for backward compatibility)
   */
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
