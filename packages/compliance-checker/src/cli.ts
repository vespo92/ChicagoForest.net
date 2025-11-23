#!/usr/bin/env node
/**
 * Compliance Checker CLI
 *
 * Agent 13: Compliance - Command-line interface for running compliance checks
 *
 * Usage:
 *   npx tsx src/cli.ts [options] [paths...]
 *
 * Options:
 *   --help, -h       Show help message
 *   --verbose, -v    Show detailed output
 *   --json           Output results as JSON
 *   --fix            Suggest fixes for violations
 *   --strict         Fail on any violation (including warnings)
 */

import * as fs from 'fs';
import * as path from 'path';
import { ComplianceChecker, RED_LINES, type ComplianceReport, type ComplianceViolation } from './index';
import { validateAll } from './validators';
import { scanFile } from './scanners';
import { classifyContent } from './classifiers';

interface CliOptions {
  help: boolean;
  verbose: boolean;
  json: boolean;
  fix: boolean;
  strict: boolean;
  paths: string[];
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    help: false,
    verbose: false,
    json: false,
    fix: false,
    strict: false,
    paths: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--fix':
        options.fix = true;
        break;
      case '--strict':
        options.strict = true;
        break;
      default:
        if (!arg.startsWith('-')) {
          options.paths.push(arg);
        }
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    AGENT 13: COMPLIANCE CHECKER                              ║
║           Disclaimer Enforcement & False Claim Detection                      ║
╚══════════════════════════════════════════════════════════════════════════════╝

USAGE:
  npx tsx src/cli.ts [options] [paths...]

OPTIONS:
  --help, -h       Show this help message
  --verbose, -v    Show detailed output including all checks
  --json           Output results as JSON for programmatic use
  --fix            Show suggested fixes for each violation
  --strict         Exit with error on any violation (including warnings)

PATHS:
  Specify files or directories to check. Defaults to current directory.
  Supports: *.md, *.tsx, *.ts, *.html files

EXAMPLES:
  npx tsx src/cli.ts                       Check current directory
  npx tsx src/cli.ts --verbose ./content   Check content folder with details
  npx tsx src/cli.ts --json ./docs         Output JSON report
  npx tsx src/cli.ts --strict --fix .      Strict mode with fix suggestions

RED LINE VIOLATIONS (CRITICAL):
  - Operational claims: "working device", "proven technology"
  - Investment language: "guaranteed returns", "profit potential"
  - False promises: "will solve", "scientifically proven"

REQUIRED DISCLAIMERS:
  All content must include AI-generated/theoretical framework notices.

For more information, see CLAUDE.md in the project root.
`);
}

function collectFiles(targetPath: string, extensions: string[]): string[] {
  const files: string[] = [];

  try {
    const stat = fs.statSync(targetPath);

    if (stat.isFile()) {
      const ext = path.extname(targetPath);
      if (extensions.includes(ext)) {
        files.push(targetPath);
      }
    } else if (stat.isDirectory()) {
      const entries = fs.readdirSync(targetPath);
      for (const entry of entries) {
        // Skip node_modules and dist directories
        if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) {
          continue;
        }
        const fullPath = path.join(targetPath, entry);
        files.push(...collectFiles(fullPath, extensions));
      }
    }
  } catch (error) {
    // Skip files we can't read
  }

  return files;
}

function formatSeverity(severity: string): string {
  switch (severity) {
    case 'critical':
      return '\x1b[31m[CRITICAL]\x1b[0m';
    case 'high':
      return '\x1b[33m[HIGH]\x1b[0m';
    case 'medium':
      return '\x1b[36m[MEDIUM]\x1b[0m';
    case 'low':
      return '\x1b[90m[LOW]\x1b[0m';
    default:
      return `[${severity.toUpperCase()}]`;
  }
}

function formatViolation(v: ComplianceViolation, showFix: boolean): string {
  const lines: string[] = [];
  const location = v.location.file
    ? v.location.line
      ? `${v.location.file}:${v.location.line}`
      : v.location.file
    : 'unknown';

  lines.push(`  ${formatSeverity(v.severity)} ${v.type}`);
  lines.push(`    Location: ${location}`);
  lines.push(`    Message: ${v.message}`);

  if (showFix) {
    lines.push(`    Suggestion: ${v.suggestion}`);
  }

  return lines.join('\n');
}

function printReport(report: ComplianceReport, options: CliOptions): void {
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log('\n' + '═'.repeat(80));
  console.log('                    COMPLIANCE CHECK REPORT');
  console.log('═'.repeat(80) + '\n');

  console.log(`Timestamp: ${report.timestamp.toISOString()}`);
  console.log(`Files Scanned: ${report.totalFiles}`);
  console.log(`Compliant Files: ${report.compliantFiles}`);
  console.log(`Violations Found: ${report.violations.length}`);

  // Group violations by severity
  const critical = report.violations.filter(v => v.severity === 'critical');
  const high = report.violations.filter(v => v.severity === 'high');
  const medium = report.violations.filter(v => v.severity === 'medium');
  const low = report.violations.filter(v => v.severity === 'low');

  if (critical.length > 0) {
    console.log(`\n\x1b[31m━━━ CRITICAL VIOLATIONS (${critical.length}) ━━━\x1b[0m\n`);
    for (const v of critical) {
      console.log(formatViolation(v, options.fix));
      console.log();
    }
  }

  if (high.length > 0) {
    console.log(`\n\x1b[33m━━━ HIGH SEVERITY (${high.length}) ━━━\x1b[0m\n`);
    for (const v of high) {
      console.log(formatViolation(v, options.fix));
      console.log();
    }
  }

  if (options.verbose) {
    if (medium.length > 0) {
      console.log(`\n\x1b[36m━━━ MEDIUM SEVERITY (${medium.length}) ━━━\x1b[0m\n`);
      for (const v of medium) {
        console.log(formatViolation(v, options.fix));
        console.log();
      }
    }

    if (low.length > 0) {
      console.log(`\n\x1b[90m━━━ LOW SEVERITY (${low.length}) ━━━\x1b[0m\n`);
      for (const v of low) {
        console.log(formatViolation(v, options.fix));
        console.log();
      }
    }
  }

  console.log('═'.repeat(80));

  // Overall status
  let statusColor: string;
  let statusIcon: string;
  switch (report.overallStatus) {
    case 'pass':
      statusColor = '\x1b[32m';
      statusIcon = '✓';
      break;
    case 'warning':
      statusColor = '\x1b[33m';
      statusIcon = '⚠';
      break;
    case 'fail':
      statusColor = '\x1b[31m';
      statusIcon = '✗';
      break;
  }

  console.log(`${statusColor}${statusIcon} Overall Status: ${report.overallStatus.toUpperCase()}\x1b[0m`);
  console.log('═'.repeat(80) + '\n');

  // Show summary of red lines being enforced
  if (options.verbose) {
    console.log('Red Lines Being Enforced:');
    console.log('  Operational Claims:', RED_LINES.operationalClaims.join(', '));
    console.log('  Investment Language:', RED_LINES.investmentLanguage.join(', '));
    console.log('  False Promises:', RED_LINES.falsePromises.join(', '));
    console.log();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Default to current directory if no paths specified
  const targetPaths = options.paths.length > 0 ? options.paths : ['.'];
  const extensions = ['.md', '.tsx', '.ts', '.html'];

  // Collect all files to check
  const files: string[] = [];
  for (const targetPath of targetPaths) {
    files.push(...collectFiles(targetPath, extensions));
  }

  if (files.length === 0) {
    console.log('No files found to check.');
    process.exit(0);
  }

  if (options.verbose && !options.json) {
    console.log(`\nScanning ${files.length} files for compliance...\n`);
  }

  // Read file contents
  const fileContents: { path: string; content: string }[] = [];
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      fileContents.push({ path: filePath, content });

      if (options.verbose && !options.json) {
        const classification = classifyContent(content);
        console.log(`  Checking: ${filePath} (${classification.type})`);
      }
    } catch (error) {
      // Skip files we can't read
    }
  }

  // Run compliance check
  const checker = new ComplianceChecker();
  const report = checker.generateReport(fileContents);

  // Print report
  printReport(report, options);

  // Exit with appropriate code
  if (report.overallStatus === 'fail') {
    process.exit(1);
  } else if (options.strict && report.overallStatus === 'warning') {
    process.exit(1);
  }

  process.exit(0);
}

main().catch(error => {
  console.error('Error running compliance check:', error);
  process.exit(1);
});
