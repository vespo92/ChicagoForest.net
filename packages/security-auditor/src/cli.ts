#!/usr/bin/env node
/**
 * Security Auditor CLI
 *
 * Agent 16: Auditor - Command-line interface for security auditing
 */

import * as fs from 'fs';
import * as path from 'path';
import { SecurityAuditor, AuditConfig } from './index';
import { OWASPComplianceChecker } from './owasp';
import { SecurityIncidentSimulator } from './simulator';

interface CLIOptions {
  path: string;
  output?: string;
  format: 'text' | 'json' | 'markdown';
  scanSecrets: boolean;
  scanDependencies: boolean;
  scanCrypto: boolean;
  scanCode: boolean;
  owasp: boolean;
  simulate: boolean;
  dryRun: boolean;
  severityThreshold: 'critical' | 'high' | 'medium' | 'low' | 'info';
  exclude: string[];
  verbose: boolean;
}

const DEFAULT_EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/*.min.js',
  '**/*.bundle.js',
];

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    path: process.cwd(),
    format: 'text',
    scanSecrets: true,
    scanDependencies: true,
    scanCrypto: true,
    scanCode: true,
    owasp: false,
    simulate: false,
    dryRun: true,
    severityThreshold: 'high',
    exclude: [...DEFAULT_EXCLUDE_PATTERNS],
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '-p':
      case '--path':
        options.path = nextArg;
        i++;
        break;
      case '-o':
      case '--output':
        options.output = nextArg;
        i++;
        break;
      case '-f':
      case '--format':
        options.format = nextArg as CLIOptions['format'];
        i++;
        break;
      case '--no-secrets':
        options.scanSecrets = false;
        break;
      case '--no-deps':
        options.scanDependencies = false;
        break;
      case '--no-crypto':
        options.scanCrypto = false;
        break;
      case '--no-code':
        options.scanCode = false;
        break;
      case '--owasp':
        options.owasp = true;
        break;
      case '--simulate':
        options.simulate = true;
        break;
      case '--live':
        options.dryRun = false;
        break;
      case '-s':
      case '--severity':
        options.severityThreshold = nextArg as CLIOptions['severityThreshold'];
        i++;
        break;
      case '-e':
      case '--exclude':
        options.exclude.push(nextArg);
        i++;
        break;
      case '-v':
      case '--verbose':
        options.verbose = true;
        break;
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Security Auditor CLI - Agent 16: Auditor
=========================================

Usage: npx tsx src/cli.ts [options]

Options:
  -p, --path <path>        Path to scan (default: current directory)
  -o, --output <file>      Output file path
  -f, --format <format>    Output format: text, json, markdown (default: text)
  -s, --severity <level>   Severity threshold: critical, high, medium, low, info
  -e, --exclude <pattern>  Glob pattern to exclude (can be repeated)
  -v, --verbose            Enable verbose output
  -h, --help               Show this help message

Scan Options:
  --no-secrets             Skip secret detection
  --no-deps                Skip dependency scanning
  --no-crypto              Skip cryptographic analysis
  --no-code                Skip code vulnerability scanning
  --owasp                  Run OWASP Top 10 compliance check
  --simulate               Run security incident simulations
  --live                   Run simulations in live mode (default: dry run)

Examples:
  npx tsx src/cli.ts -p ./src
  npx tsx src/cli.ts --owasp -f markdown -o report.md
  npx tsx src/cli.ts --simulate --verbose
  npx tsx src/cli.ts -s critical --no-secrets

Exit codes:
  0 - All checks passed
  1 - Findings above threshold
  2 - Error during execution
`);
}

function collectFiles(
  dirPath: string,
  excludePatterns: string[],
  collected: { path: string; content: string }[] = []
): { path: string; content: string }[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = fullPath;

    // Check exclusions
    const isExcluded = excludePatterns.some(pattern => {
      const regex = new RegExp(
        pattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\//g, '\\/')
      );
      return regex.test(relativePath);
    });

    if (isExcluded) continue;

    if (entry.isDirectory()) {
      collectFiles(fullPath, excludePatterns, collected);
    } else if (entry.isFile()) {
      // Only scan source files
      const ext = path.extname(entry.name).toLowerCase();
      const sourceExts = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.yml', '.yaml', '.env'];

      if (sourceExts.includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          collected.push({ path: fullPath, content });
        } catch {
          // Skip files that can't be read
        }
      }
    }
  }

  return collected;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  console.log('🔒 Security Auditor - Agent 16: Auditor');
  console.log('=======================================\n');

  if (options.verbose) {
    console.log('Options:', JSON.stringify(options, null, 2), '\n');
  }

  try {
    // Collect files
    console.log(`📁 Scanning: ${options.path}`);
    const files = collectFiles(options.path, options.exclude);
    console.log(`   Found ${files.length} files to analyze\n`);

    const outputs: string[] = [];

    // Run standard security audit
    if (options.scanSecrets || options.scanCrypto || options.scanCode) {
      console.log('🔍 Running security audit...');

      const config: Partial<AuditConfig> = {
        scanSecrets: options.scanSecrets,
        scanDependencies: options.scanDependencies,
        scanCrypto: options.scanCrypto,
        scanCode: options.scanCode,
        excludePatterns: options.exclude,
        severityThreshold: options.severityThreshold,
      };

      const auditor = new SecurityAuditor(config);
      const report = await auditor.audit(files);

      if (options.format === 'json') {
        outputs.push(JSON.stringify(report, null, 2));
      } else if (options.format === 'markdown') {
        outputs.push(auditor.generateReport(report));
      } else {
        outputs.push(auditor.generateReport(report));
      }

      const statusIcon = report.passed ? '✅' : '❌';
      console.log(`   ${statusIcon} Audit ${report.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`   Found ${report.findings.length} issues (${report.summary.critical} critical, ${report.summary.high} high)\n`);
    }

    // Run OWASP check
    if (options.owasp) {
      console.log('📋 Running OWASP Top 10 compliance check...');

      const checker = new OWASPComplianceChecker();
      const owaspReport = await checker.check(files);

      if (options.format === 'json') {
        outputs.push(JSON.stringify(owaspReport, null, 2));
      } else {
        outputs.push(checker.generateReport(owaspReport));
      }

      console.log(`   Score: ${owaspReport.overallScore}/100`);
      console.log(`   Categories passing: ${owaspReport.compliance.filter(c => c.passed).length}/10\n`);
    }

    // Run simulations
    if (options.simulate) {
      console.log('🎭 Running security incident simulations...');
      console.log(`   Mode: ${options.dryRun ? 'Dry Run' : 'Live'}`);

      const simulator = new SecurityIncidentSimulator({
        dryRun: options.dryRun,
        logLevel: options.verbose ? 'verbose' : 'normal',
      });

      const simResults = await simulator.runAllScenarios();

      if (options.format === 'json') {
        outputs.push(JSON.stringify(simResults, null, 2));
      } else {
        outputs.push(simulator.generateReport());
      }

      const simPassed = simResults.filter(r => r.passed).length;
      console.log(`   ${simPassed}/${simResults.length} scenarios passed\n`);
    }

    // Output results
    const fullOutput = outputs.join('\n\n---\n\n');

    if (options.output) {
      fs.writeFileSync(options.output, fullOutput);
      console.log(`📄 Report saved to: ${options.output}`);
    } else {
      console.log('\n' + '='.repeat(60) + '\n');
      console.log(fullOutput);
    }

    console.log('\n✨ Security audit complete!');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(2);
  }
}

main().catch(console.error);
