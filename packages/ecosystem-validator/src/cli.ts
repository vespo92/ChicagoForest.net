#!/usr/bin/env node
/**
 * Ecosystem Validator CLI
 *
 * Agent 20: Validator - Command line interface for ecosystem validation
 *
 * Usage:
 *   npx ecosystem-validator validate    - Run full ecosystem validation
 *   npx ecosystem-validator health      - Generate health dashboard
 *   npx ecosystem-validator report      - Generate compatibility report
 *   npx ecosystem-validator test        - Generate integration tests
 */

import {
  EcosystemValidator,
  NPCPU_INTEGRATION_POINTS,
  CONSHRINK_INTEGRATION_POINTS,
} from './index';
import { generateHealthDashboard, generateIntegrationTest, generateMigrationGuide } from './generators';
import { detectBreakingChanges } from './checkers';

const validator = new EcosystemValidator();

function printHeader(): void {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Chicago Forest Network - Ecosystem Validator           ║');
  console.log('║     Agent 20: Cross-Repository Integration Validation      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();
}

function runValidation(): void {
  printHeader();
  console.log('🔍 Running ecosystem validation...\n');

  const points = validator.getAllIntegrationPoints();
  let hasErrors = false;

  console.log(`Found ${points.length} integration points\n`);

  for (const point of points) {
    const changes = validator.validateIntegrationPoint(point);
    const status = changes.length === 0 ? '✅' : '❌';
    console.log(`${status} ${point.sourceRepo}/${point.name}`);
    console.log(`   Interface: ${point.interface}`);
    console.log(`   Target: ${point.targetPackage}`);
    console.log(`   Version: ${point.version}`);

    if (changes.length > 0) {
      hasErrors = true;
      for (const change of changes) {
        console.log(`   ⚠️  ${change.description}`);
      }
    }
    console.log();
  }

  console.log('─'.repeat(60));
  if (hasErrors) {
    console.log('❌ Validation completed with errors');
    process.exit(1);
  } else {
    console.log('✅ All integration points validated successfully');
  }
}

function generateHealth(): void {
  printHeader();
  console.log('📊 Generating health dashboard...\n');

  const health = validator.getEcosystemHealth();
  const dashboard = generateHealthDashboard(
    health.repositories.map(r => ({
      name: r.name,
      status: r.status,
      issues: r.issues,
    }))
  );

  console.log(dashboard);
}

function generateReport(): void {
  printHeader();
  console.log('📋 Generating compatibility reports...\n');

  // NPCPU compatibility
  console.log('## NPCPU Integration Report\n');
  for (const pkg of ['@chicago-forest/mycelium-core', '@chicago-forest/symbiosis', '@chicago-forest/canopy-api']) {
    const report = validator.generateCompatibilityReport(pkg, 'NPCPU');
    if (report.integrationPoints.length > 0) {
      console.log(`### ${pkg}`);
      console.log(`Compatible: ${report.isCompatible ? '✅ Yes' : '❌ No'}`);
      console.log(`Integration Points: ${report.integrationPoints.length}`);
      if (report.warnings.length > 0) {
        console.log('Warnings:');
        report.warnings.forEach(w => console.log(`  - ${w}`));
      }
      console.log();
    }
  }

  // ConstitutionalShrinkage compatibility
  console.log('## ConstitutionalShrinkage Integration Report\n');
  for (const pkg of ['@chicago-forest/hive-mind', '@chicago-forest/symbiosis']) {
    const report = validator.generateCompatibilityReport(pkg, 'ConstitutionalShrinkage');
    if (report.integrationPoints.length > 0) {
      console.log(`### ${pkg}`);
      console.log(`Compatible: ${report.isCompatible ? '✅ Yes' : '❌ No'}`);
      console.log(`Integration Points: ${report.integrationPoints.length}`);
      if (report.warnings.length > 0) {
        console.log('Warnings:');
        report.warnings.forEach(w => console.log(`  - ${w}`));
      }
      console.log();
    }
  }
}

function generateTests(): void {
  printHeader();
  console.log('🧪 Generating integration tests...\n');

  const allPoints = [...NPCPU_INTEGRATION_POINTS, ...CONSHRINK_INTEGRATION_POINTS];

  for (const point of allPoints) {
    const test = generateIntegrationTest(point);
    console.log(`Generated: ${test.name}`);
    console.log(`  Description: ${test.description}`);
    console.log(`  Dependencies: ${test.dependencies.join(', ')}`);
    console.log();
  }

  console.log('─'.repeat(60));
  console.log(`Generated ${allPoints.length} integration test files`);
}

function showHelp(): void {
  printHeader();
  console.log('Usage: ecosystem-validator <command>\n');
  console.log('Commands:');
  console.log('  validate    Run full ecosystem validation');
  console.log('  health      Generate health dashboard');
  console.log('  report      Generate compatibility reports');
  console.log('  test        Generate integration test templates');
  console.log('  help        Show this help message');
  console.log();
  console.log('Integration Points:');
  console.log('  NPCPU:');
  for (const point of NPCPU_INTEGRATION_POINTS) {
    console.log(`    - ${point.name}: ${point.interface}`);
  }
  console.log('  ConstitutionalShrinkage:');
  for (const point of CONSHRINK_INTEGRATION_POINTS) {
    console.log(`    - ${point.name}: ${point.interface}`);
  }
}

// Main CLI entry
const command = process.argv[2] || 'help';

switch (command) {
  case 'validate':
    runValidation();
    break;
  case 'health':
    generateHealth();
    break;
  case 'report':
    generateReport();
    break;
  case 'test':
    generateTests();
    break;
  case 'help':
  default:
    showHelp();
    break;
}
