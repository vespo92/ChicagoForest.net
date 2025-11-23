#!/usr/bin/env node
/**
 * Documentation Generator CLI
 *
 * Agent 14: Prophet - Command-line interface for documentation automation.
 *
 * Usage:
 *   pnpm generate                  # Generate docs for all packages
 *   pnpm generate --package mycelium-core
 *   pnpm generate --breaking-changes
 *   pnpm generate --diagrams
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve, basename, dirname } from 'path';
import { DocGenerator } from './index';
import { parseTypeScriptFile } from './extractors/typescript-parser';
import { detectBreakingChanges, generateBreakingChangeDoc, suggestVersionBump } from './breaking-changes';
import { generatePackageExamples, generateQuickStart } from './examples';
import { generateApiMarkdown, generateMermaidDiagram, generateIntegrationGuide } from './generators';
import type {
  DocGeneratorConfig,
  PackageDoc,
  ExtractedDoc,
  PackageDependency,
  DiagramNode,
  DiagramEdge,
  GenerationResult,
  GeneratedFile,
} from './types';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string): void {
  console.log(message);
}

function success(message: string): void {
  console.log(`${colors.green}[success]${colors.reset} ${message}`);
}

function warn(message: string): void {
  console.log(`${colors.yellow}[warn]${colors.reset} ${message}`);
}

function error(message: string): void {
  console.error(`${colors.red}[error]${colors.reset} ${message}`);
}

function info(message: string): void {
  console.log(`${colors.blue}[info]${colors.reset} ${message}`);
}

interface CLIOptions {
  packagesPath: string;
  outputPath: string;
  package?: string;
  breakingChanges: boolean;
  diagrams: boolean;
  examples: boolean;
  guides: boolean;
  format: 'markdown' | 'html' | 'json';
  verbose: boolean;
  help: boolean;
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    packagesPath: './packages',
    outputPath: './docs/generated',
    breakingChanges: false,
    diagrams: true,
    examples: true,
    guides: true,
    format: 'markdown',
    verbose: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-v':
      case '--verbose':
        options.verbose = true;
        break;
      case '-p':
      case '--package':
        options.package = args[++i];
        break;
      case '--packages-path':
        options.packagesPath = args[++i];
        break;
      case '-o':
      case '--output':
        options.outputPath = args[++i];
        break;
      case '--breaking-changes':
        options.breakingChanges = true;
        break;
      case '--no-diagrams':
        options.diagrams = false;
        break;
      case '--no-examples':
        options.examples = false;
        break;
      case '--no-guides':
        options.guides = false;
        break;
      case '--format':
        options.format = args[++i] as 'markdown' | 'html' | 'json';
        break;
    }
  }

  return options;
}

function showHelp(): void {
  log(`
${colors.bright}Chicago Forest Documentation Generator${colors.reset}
${colors.dim}Agent 14: Prophet - Documentation Automation${colors.reset}

${colors.cyan}Usage:${colors.reset}
  npx doc-generator [options]

${colors.cyan}Options:${colors.reset}
  -h, --help              Show this help message
  -v, --verbose           Enable verbose output
  -p, --package <name>    Generate docs for a specific package
  -o, --output <path>     Output directory (default: ./docs/generated)
  --packages-path <path>  Packages directory (default: ./packages)
  --breaking-changes      Detect and document breaking changes
  --no-diagrams           Skip diagram generation
  --no-examples           Skip example generation
  --no-guides             Skip integration guide generation
  --format <type>         Output format: markdown, html, json (default: markdown)

${colors.cyan}Examples:${colors.reset}
  # Generate documentation for all packages
  npx doc-generator

  # Generate docs for a specific package
  npx doc-generator --package mycelium-core

  # Generate with breaking change detection
  npx doc-generator --breaking-changes

  # Output as JSON
  npx doc-generator --format json

${colors.cyan}Output Structure:${colors.reset}
  docs/generated/
    ├── api/              # API reference documentation
    ├── examples/         # Code examples
    ├── diagrams/         # Architecture diagrams
    ├── guides/           # Integration guides
    └── breaking-changes/ # Breaking change reports
`);
}

function findTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];

  if (!existsSync(dir)) return files;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && entry !== 'node_modules' && entry !== 'dist') {
      files.push(...findTypeScriptFiles(fullPath));
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts') && !entry.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function loadPackageJson(packagePath: string): { name: string; version: string; description: string; dependencies?: Record<string, string>; peerDependencies?: Record<string, string> } | null {
  const pkgJsonPath = join(packagePath, 'package.json');
  if (!existsSync(pkgJsonPath)) return null;

  try {
    return JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
  } catch {
    return null;
  }
}

function extractPackageDocs(packagePath: string, verbose: boolean): PackageDoc | null {
  const pkgJson = loadPackageJson(packagePath);
  if (!pkgJson) return null;

  const srcPath = join(packagePath, 'src');
  const files = findTypeScriptFiles(srcPath);

  if (verbose) {
    info(`Found ${files.length} TypeScript files in ${pkgJson.name}`);
  }

  const exports: ExtractedDoc[] = [];

  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const docs = parseTypeScriptFile(file, content, { includePrivate: false });
      exports.push(...docs);
    } catch (err) {
      if (verbose) {
        warn(`Failed to parse ${file}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
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

  const peerDependencies: PackageDependency[] = [];
  if (pkgJson.peerDependencies) {
    for (const [name, version] of Object.entries(pkgJson.peerDependencies)) {
      peerDependencies.push({
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
    peerDependencies,
    entryPoints: ['./src/index.ts'],
  };
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function generateDocs(options: CLIOptions): Promise<GenerationResult> {
  const startTime = Date.now();
  const generatedFiles: GeneratedFile[] = [];
  const errors: { file: string; message: string }[] = [];

  const outputBase = resolve(options.outputPath);
  ensureDir(outputBase);

  // Create output directories
  const apiDir = join(outputBase, 'api');
  const examplesDir = join(outputBase, 'examples');
  const diagramsDir = join(outputBase, 'diagrams');
  const guidesDir = join(outputBase, 'guides');
  const breakingDir = join(outputBase, 'breaking-changes');

  ensureDir(apiDir);
  if (options.examples) ensureDir(examplesDir);
  if (options.diagrams) ensureDir(diagramsDir);
  if (options.guides) ensureDir(guidesDir);
  if (options.breakingChanges) ensureDir(breakingDir);

  // Find packages to process
  const packagesPath = resolve(options.packagesPath);
  let packageDirs: string[] = [];

  if (options.package) {
    const specificPath = join(packagesPath, options.package);
    if (existsSync(specificPath)) {
      packageDirs = [specificPath];
    } else {
      error(`Package not found: ${options.package}`);
      return {
        success: false,
        outputPath: outputBase,
        files: [],
        errors: [{ file: options.package, message: 'Package not found' }],
        stats: { packagesProcessed: 0, exportsDocumented: 0, diagramsGenerated: 0, filesCreated: 0, duration: 0 },
      };
    }
  } else {
    if (existsSync(packagesPath)) {
      packageDirs = readdirSync(packagesPath)
        .map(name => join(packagesPath, name))
        .filter(p => statSync(p).isDirectory() && existsSync(join(p, 'package.json')));
    }
  }

  info(`Processing ${packageDirs.length} packages...`);

  const allPackages: PackageDoc[] = [];
  let totalExports = 0;

  for (const pkgDir of packageDirs) {
    const pkgName = basename(pkgDir);
    if (options.verbose) info(`Processing ${pkgName}...`);

    const pkgDoc = extractPackageDocs(pkgDir, options.verbose);
    if (!pkgDoc) {
      warn(`Skipping ${pkgName}: Could not extract documentation`);
      continue;
    }

    allPackages.push(pkgDoc);
    totalExports += pkgDoc.exports.length;

    // Generate API documentation
    try {
      const apiContent = generateApiMarkdown(pkgDoc);
      const apiPath = join(apiDir, `${pkgName}.md`);
      writeFileSync(apiPath, apiContent);
      generatedFiles.push({ path: apiPath, type: 'api-reference', size: apiContent.length });
      if (options.verbose) success(`Generated API docs: ${pkgName}.md`);
    } catch (err) {
      errors.push({ file: `${pkgName}/api.md`, message: err instanceof Error ? err.message : 'Unknown error' });
    }

    // Generate examples
    if (options.examples) {
      try {
        const quickStart = generateQuickStart(pkgDoc);
        const examplesPath = join(examplesDir, `${pkgName}-quickstart.md`);
        writeFileSync(examplesPath, quickStart);
        generatedFiles.push({ path: examplesPath, type: 'readme', size: quickStart.length });
        if (options.verbose) success(`Generated quick start: ${pkgName}-quickstart.md`);
      } catch (err) {
        errors.push({ file: `${pkgName}/examples.md`, message: err instanceof Error ? err.message : 'Unknown error' });
      }
    }
  }

  // Generate architecture diagrams
  if (options.diagrams && allPackages.length > 0) {
    try {
      const nodes: DiagramNode[] = allPackages.map(pkg => ({
        id: pkg.name.replace('@chicago-forest/', '').replace(/-/g, '_'),
        label: pkg.name.replace('@chicago-forest/', ''),
        type: 'package',
      }));

      const edges: DiagramEdge[] = [];
      for (const pkg of allPackages) {
        const fromId = pkg.name.replace('@chicago-forest/', '').replace(/-/g, '_');
        for (const dep of pkg.dependencies.filter(d => d.internal)) {
          const toId = dep.name.replace('@chicago-forest/', '').replace(/-/g, '_');
          edges.push({ from: fromId, to: toId, type: 'dependency' });
        }
      }

      const diagram = generateMermaidDiagram('Package Dependencies', nodes, edges);
      const diagramPath = join(diagramsDir, 'dependencies.md');
      const diagramContent = `# ${diagram.title}\n\n\`\`\`mermaid\n${diagram.content}\n\`\`\``;
      writeFileSync(diagramPath, diagramContent);
      generatedFiles.push({ path: diagramPath, type: 'architecture', size: diagramContent.length });
      success('Generated dependency diagram');
    } catch (err) {
      errors.push({ file: 'diagrams/dependencies.md', message: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  // Generate integration guides
  if (options.guides && allPackages.length >= 2) {
    const corePackages = ['mycelium-core', 'p2p-core', 'canopy-api', 'hive-mind'];
    const existingCore = allPackages.filter(p =>
      corePackages.some(c => p.name.includes(c))
    );

    for (let i = 0; i < existingCore.length - 1; i++) {
      for (let j = i + 1; j < existingCore.length; j++) {
        const source = existingCore[i];
        const target = existingCore[j];

        // Check if there's a dependency relationship
        const hasDep = source.dependencies.some(d => d.name === target.name) ||
                      target.dependencies.some(d => d.name === source.name);

        if (hasDep) {
          try {
            const guide = generateIntegrationGuide(source.name, target.name, [
              `Install both packages: pnpm add ${source.name} ${target.name}`,
              'Import required modules from each package',
              'Configure integration options',
              'Initialize the integration',
            ]);

            const guideName = `${source.name.replace('@chicago-forest/', '')}-${target.name.replace('@chicago-forest/', '')}.md`;
            const guidePath = join(guidesDir, guideName);
            writeFileSync(guidePath, guide);
            generatedFiles.push({ path: guidePath, type: 'integration-guide', size: guide.length });
            if (options.verbose) success(`Generated integration guide: ${guideName}`);
          } catch (err) {
            errors.push({ file: `guides/${source.name}-${target.name}`, message: err instanceof Error ? err.message : 'Unknown error' });
          }
        }
      }
    }
  }

  // Generate index file
  const indexContent = generateIndex(allPackages, options);
  const indexPath = join(outputBase, 'README.md');
  writeFileSync(indexPath, indexContent);
  generatedFiles.push({ path: indexPath, type: 'readme', size: indexContent.length });

  const duration = Date.now() - startTime;

  return {
    success: errors.length === 0,
    outputPath: outputBase,
    files: generatedFiles,
    errors,
    stats: {
      packagesProcessed: allPackages.length,
      exportsDocumented: totalExports,
      diagramsGenerated: options.diagrams ? 1 : 0,
      filesCreated: generatedFiles.length,
      duration,
    },
  };
}

function generateIndex(packages: PackageDoc[], options: CLIOptions): string {
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

  for (const pkg of packages) {
    const shortName = pkg.name.replace('@chicago-forest/', '');
    lines.push(`### [${shortName}](./api/${shortName}.md)`);
    lines.push('');
    lines.push(pkg.description || 'No description');
    lines.push('');
    lines.push(`- **Version:** ${pkg.version}`);
    lines.push(`- **Exports:** ${pkg.exports.length}`);
    if (pkg.dependencies.filter(d => d.internal).length > 0) {
      lines.push(`- **Internal deps:** ${pkg.dependencies.filter(d => d.internal).map(d => d.name.replace('@chicago-forest/', '')).join(', ')}`);
    }
    lines.push('');
  }

  if (options.examples) {
    lines.push('## Quick Start Guides');
    lines.push('');
    for (const pkg of packages) {
      const shortName = pkg.name.replace('@chicago-forest/', '');
      lines.push(`- [${shortName}](./examples/${shortName}-quickstart.md)`);
    }
    lines.push('');
  }

  if (options.diagrams) {
    lines.push('## Architecture');
    lines.push('');
    lines.push('- [Package Dependencies](./diagrams/dependencies.md)');
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('*This documentation is AI-generated. All technical specifications are part of the Chicago Forest Network theoretical framework.*');

  return lines.join('\n');
}

// Main entry point
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  log('');
  log(`${colors.bright}Chicago Forest Documentation Generator${colors.reset}`);
  log(`${colors.dim}Agent 14: Prophet${colors.reset}`);
  log('');

  try {
    const result = await generateDocs(options);

    log('');
    log(`${colors.bright}Summary${colors.reset}`);
    log(`  Packages processed: ${result.stats.packagesProcessed}`);
    log(`  Exports documented: ${result.stats.exportsDocumented}`);
    log(`  Files created: ${result.stats.filesCreated}`);
    log(`  Duration: ${result.stats.duration}ms`);
    log('');

    if (result.errors.length > 0) {
      warn(`${result.errors.length} errors occurred:`);
      for (const err of result.errors) {
        error(`  ${err.file}: ${err.message}`);
      }
    }

    if (result.success) {
      success(`Documentation generated at: ${result.outputPath}`);
    } else {
      error('Documentation generation completed with errors');
      process.exit(1);
    }
  } catch (err) {
    error(`Fatal error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
