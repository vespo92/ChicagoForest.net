#!/usr/bin/env node
/**
 * Source Verifier CLI
 *
 * Agent 11: Verifier - Command line interface for source verification
 *
 * Usage:
 *   npx @chicago-forest/source-verifier verify <source>
 *   npx @chicago-forest/source-verifier batch <file>
 *   npx @chicago-forest/source-verifier tesla-patents
 *   npx @chicago-forest/source-verifier fbi-files
 *   npx @chicago-forest/source-verifier lenr-docs
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 * All source verification is performed against real, documented archives.
 */

import { SourceVerifier } from './index';
import { ReportFormat } from './types';
import * as fs from 'fs';
import * as path from 'path';

const VERSION = '0.1.0';

interface CliOptions {
  format: ReportFormat;
  output?: string;
  verbose: boolean;
  failOnInvalid: boolean;
  minSuccessRate: number;
}

function parseArgs(): { command: string; args: string[]; options: CliOptions } {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    format: 'markdown',
    verbose: false,
    failOnInvalid: false,
    minSuccessRate: 90,
  };

  const positionalArgs: string[] = [];
  let command = 'help';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--format' || arg === '-f') {
      options.format = (args[++i] as ReportFormat) || 'markdown';
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--fail-on-invalid') {
      options.failOnInvalid = true;
    } else if (arg === '--min-success-rate') {
      options.minSuccessRate = parseFloat(args[++i]) || 90;
    } else if (arg === '--version' || arg === '-V') {
      console.log(`source-verifier v${VERSION}`);
      process.exit(0);
    } else if (arg === '--help' || arg === '-h') {
      command = 'help';
    } else if (!arg.startsWith('-')) {
      positionalArgs.push(arg);
    }
  }

  if (positionalArgs.length > 0) {
    command = positionalArgs[0];
  }

  return { command, args: positionalArgs.slice(1), options };
}

function printHelp(): void {
  console.log(`
Source Verifier CLI - Agent 11: Verifier
Chicago Forest Network Source Verification Tool

USAGE:
  source-verifier <command> [options] [args]

COMMANDS:
  verify <source>       Verify a single source (URL, DOI, or patent)
  batch <file>          Verify multiple sources from a file (one per line)
  tesla-patents         Verify all known Tesla patents
  fbi-files             Verify FBI vault Tesla files
  lenr-docs             Verify LENR-CANR library documents
  validate <source>     Validate source format without HTTP checks
  help                  Show this help message

OPTIONS:
  -f, --format <type>   Output format: json, markdown, html, csv (default: markdown)
  -o, --output <file>   Write report to file instead of stdout
  -v, --verbose         Show detailed output
  --fail-on-invalid     Exit with error code if any source is invalid
  --min-success-rate    Minimum success rate (default: 90%)
  -V, --version         Show version number
  -h, --help            Show this help message

EXAMPLES:
  # Verify a URL
  source-verifier verify https://patents.google.com/patent/US645576

  # Verify a DOI
  source-verifier verify 10.1007/s10948-019-05210-z

  # Verify a patent
  source-verifier verify US645576

  # Verify sources from a file
  source-verifier batch sources.txt --format html -o report.html

  # Verify Tesla patents with CI/CD integration
  source-verifier tesla-patents --fail-on-invalid --min-success-rate 95

  # Validate format only (no HTTP checks)
  source-verifier validate US645576

SUPPORTED SOURCE TYPES:
  - URLs (any HTTP/HTTPS URL)
  - DOIs (10.xxxx/xxxxx format)
  - Patents (US645576, EP1234567, WO2020123456, etc.)
  - Archives (FBI vault, LENR-CANR, Internet Archive, Tesla Universe)

DISCLAIMER:
  This is part of an AI-generated theoretical framework.
  All source verification is performed against real, documented archives.
`);
}

async function verifySource(
  source: string,
  options: CliOptions
): Promise<boolean> {
  const verifier = new SourceVerifier();

  console.log(`\nVerifying: ${source}`);
  console.log('-'.repeat(60));

  const result = await verifier.verify(source);

  if (options.verbose) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Type: ${result.type}`);
    console.log(`Status: ${result.status}`);
    console.log(`Valid: ${result.isValid ? 'Yes' : 'No'}`);

    if (result.responseTime) {
      console.log(`Response Time: ${result.responseTime}ms`);
    }

    if (result.errorMessage) {
      console.log(`Error: ${result.errorMessage}`);
    }

    // Type-specific details
    if (result.type === 'patent' && 'patentUrl' in result) {
      console.log(`Patent URL: ${result.patentUrl}`);
      if ('title' in result && result.title) {
        console.log(`Title: ${result.title}`);
      }
      if ('inventor' in result && result.inventor) {
        console.log(`Inventor: ${result.inventor}`);
      }
    }

    if (result.type === 'doi' && 'resolvedUrl' in result) {
      console.log(`Resolved URL: ${result.resolvedUrl}`);
      if ('title' in result && result.title) {
        console.log(`Title: ${result.title}`);
      }
      if ('registrant' in result && result.registrant) {
        console.log(`Publisher: ${result.registrant}`);
      }
    }
  }

  return result.isValid;
}

async function verifyBatch(
  file: string,
  options: CliOptions
): Promise<boolean> {
  if (!fs.existsSync(file)) {
    console.error(`Error: File not found: ${file}`);
    return false;
  }

  const content = fs.readFileSync(file, 'utf-8');
  const sources = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  if (sources.length === 0) {
    console.error('Error: No sources found in file');
    return false;
  }

  console.log(`\nVerifying ${sources.length} sources from ${file}`);
  console.log('='.repeat(60));

  const verifier = new SourceVerifier();
  const { report, formatted } = await verifier.verifyAndReport(
    sources,
    options.format
  );

  // Output report
  if (options.output) {
    fs.writeFileSync(options.output, formatted);
    console.log(`\nReport written to: ${options.output}`);
  } else {
    console.log('\n' + formatted);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('-'.repeat(60));
  console.log(`Total Sources: ${report.summary.totalSources}`);
  console.log(`Valid: ${report.summary.validSources}`);
  console.log(`Invalid: ${report.summary.invalidSources}`);
  console.log(`Unreachable: ${report.summary.unreachableSources}`);
  console.log(`Success Rate: ${report.summary.successRate.toFixed(1)}%`);

  // Check against minimum success rate
  const success = report.summary.successRate >= options.minSuccessRate;

  if (!success) {
    console.log(
      `\nWARNING: Success rate (${report.summary.successRate.toFixed(1)}%) is below minimum (${options.minSuccessRate}%)`
    );
  }

  return success && (options.failOnInvalid ? report.summary.invalidSources === 0 : true);
}

async function verifyTeslaPatents(options: CliOptions): Promise<boolean> {
  console.log('\nVerifying Tesla Patents');
  console.log('='.repeat(60));

  const verifier = new SourceVerifier();
  const results = await verifier.verifyTeslaPatents();
  const report = verifier.generateReport(results);
  const formatted = verifier.formatReport(report, options.format);

  if (options.output) {
    fs.writeFileSync(options.output, formatted);
    console.log(`Report written to: ${options.output}`);
  } else {
    console.log('\n' + formatted);
  }

  const success = report.summary.successRate >= options.minSuccessRate;
  console.log(`\nSuccess Rate: ${report.summary.successRate.toFixed(1)}%`);

  return success;
}

async function verifyFbiFiles(options: CliOptions): Promise<boolean> {
  console.log('\nVerifying FBI Vault Tesla Files');
  console.log('='.repeat(60));

  const verifier = new SourceVerifier();
  const results = await verifier.verifyFbiTeslaFiles();
  const report = verifier.generateReport(results);
  const formatted = verifier.formatReport(report, options.format);

  if (options.output) {
    fs.writeFileSync(options.output, formatted);
    console.log(`Report written to: ${options.output}`);
  } else {
    console.log('\n' + formatted);
  }

  const success = report.summary.successRate >= options.minSuccessRate;
  console.log(`\nSuccess Rate: ${report.summary.successRate.toFixed(1)}%`);

  return success;
}

async function verifyLenrDocs(options: CliOptions): Promise<boolean> {
  console.log('\nVerifying LENR-CANR Library Documents');
  console.log('='.repeat(60));

  const verifier = new SourceVerifier();
  const results = await verifier.verifyLenrCanrDocuments();
  const report = verifier.generateReport(results);
  const formatted = verifier.formatReport(report, options.format);

  if (options.output) {
    fs.writeFileSync(options.output, formatted);
    console.log(`Report written to: ${options.output}`);
  } else {
    console.log('\n' + formatted);
  }

  const success = report.summary.successRate >= options.minSuccessRate;
  console.log(`\nSuccess Rate: ${report.summary.successRate.toFixed(1)}%`);

  return success;
}

function validateSource(source: string, options: CliOptions): boolean {
  const { validateSource } = require('./validators');

  console.log(`\nValidating format: ${source}`);
  console.log('-'.repeat(60));

  const result = validateSource(source);

  console.log(`Valid: ${result.isValid ? 'Yes' : 'No'}`);

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach((e: string) => console.log(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    result.warnings.forEach((w: string) => console.log(`  - ${w}`));
  }

  return result.isValid;
}

async function main(): Promise<void> {
  const { command, args, options } = parseArgs();

  let success = true;

  try {
    switch (command) {
      case 'verify':
        if (args.length === 0) {
          console.error('Error: Source argument required');
          process.exit(1);
        }
        success = await verifySource(args[0], options);
        break;

      case 'batch':
        if (args.length === 0) {
          console.error('Error: File argument required');
          process.exit(1);
        }
        success = await verifyBatch(args[0], options);
        break;

      case 'tesla-patents':
        success = await verifyTeslaPatents(options);
        break;

      case 'fbi-files':
        success = await verifyFbiFiles(options);
        break;

      case 'lenr-docs':
        success = await verifyLenrDocs(options);
        break;

      case 'validate':
        if (args.length === 0) {
          console.error('Error: Source argument required');
          process.exit(1);
        }
        success = validateSource(args[0], options);
        break;

      case 'help':
      default:
        printHelp();
        break;
    }

    if (options.failOnInvalid && !success) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run CLI
main();
