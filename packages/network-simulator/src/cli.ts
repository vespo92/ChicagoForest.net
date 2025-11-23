#!/usr/bin/env node
/**
 * Network Simulator CLI
 *
 * Command-line interface for running network simulations.
 *
 * Usage:
 *   pnpm simulate [command] [options]
 *
 * Commands:
 *   run <scenario>     Run a specific scenario
 *   list               List available scenarios
 *   stress             Run scalability stress tests
 *   demo               Run educational demo mode
 *
 * DISCLAIMER: This simulates the theoretical Chicago Forest Network.
 * The network itself is a conceptual framework, not an operational system.
 */

import { NetworkSimulator, SimulationConfig } from './index';
import { scenarios, listScenarios, getScenario } from './scenarios';
import { generateAsciiMap, generateMetricsSummary, generateMermaidTopology } from './visualization';
import { StressTester } from './stress';

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     CHICAGO FOREST NETWORK - SIMULATION ENVIRONMENT      ║');
  console.log('║                                                          ║');
  console.log('║  DISCLAIMER: This is a theoretical framework simulation  ║');
  console.log('║  Not an operational system. AI-generated for education.  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  switch (command) {
    case 'list':
      await listCommand();
      break;
    case 'run':
      await runCommand(args[1]);
      break;
    case 'stress':
      await stressCommand();
      break;
    case 'demo':
      await demoCommand();
      break;
    case 'help':
    default:
      helpCommand();
  }
}

function helpCommand() {
  console.log('Usage: pnpm simulate <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  list              List all available simulation scenarios');
  console.log('  run <scenario>    Run a specific scenario by name');
  console.log('  stress            Run scalability stress tests');
  console.log('  demo              Run educational demonstration mode');
  console.log('  help              Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  pnpm simulate list');
  console.log('  pnpm simulate run normalOperation');
  console.log('  pnpm simulate run sybilAttack');
  console.log('  pnpm simulate stress');
  console.log('  pnpm simulate demo');
}

async function listCommand() {
  console.log('Available Scenarios:');
  console.log('─'.repeat(60));

  const scenarioList = listScenarios();
  for (const scenario of scenarioList) {
    console.log(`  ${scenario.name.padEnd(25)} ${scenario.description}`);
  }

  console.log('');
  console.log(`Total: ${scenarioList.length} scenarios`);
}

async function runCommand(scenarioName?: string) {
  if (!scenarioName) {
    console.error('Error: Please specify a scenario name');
    console.log('Use "pnpm simulate list" to see available scenarios');
    process.exit(1);
  }

  const scenario = getScenario(scenarioName);
  if (!scenario) {
    console.error(`Error: Scenario "${scenarioName}" not found`);
    console.log('Use "pnpm simulate list" to see available scenarios');
    process.exit(1);
  }

  console.log(`Running scenario: ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);
  console.log('─'.repeat(60));

  const simulator = new NetworkSimulator(scenario.config);
  const totalTicks = Math.floor((scenario.config.simulationDurationMs || 60000) / (scenario.config.tickIntervalMs || 100));

  console.log(`Nodes: ${scenario.config.nodeCount}`);
  console.log(`Topology: ${scenario.config.networkTopology}`);
  console.log(`Duration: ${totalTicks} ticks`);
  console.log('');

  // Run simulation
  let eventIndex = 0;
  for (let tick = 0; tick < Math.min(totalTicks, 200); tick++) {
    // Process scheduled events
    while (eventIndex < scenario.events.length && scenario.events[eventIndex].atTick === tick) {
      const event = scenario.events[eventIndex];
      console.log(`[Tick ${tick}] Event: ${event.action} ${event.targets?.join(', ') || ''}`);
      eventIndex++;
    }

    const events = simulator.tick();

    // Log significant events
    for (const event of events) {
      if (event.type === 'node_down' || event.type === 'node_up') {
        console.log(`[Tick ${tick}] ${event.type}: ${event.nodeId}`);
      }
    }

    // Print periodic status
    if (tick % 25 === 0 || tick === totalTicks - 1) {
      const state = simulator.getState();
      console.log('');
      console.log(generateMetricsSummary(state));
    }
  }

  // Final visualization
  const finalState = simulator.getState();
  console.log('');
  console.log('Final Network Map:');
  console.log(generateAsciiMap(finalState, 50, 15));
}

async function stressCommand() {
  console.log('Running Scalability Stress Tests');
  console.log('─'.repeat(60));
  console.log('This will test network performance at various scales.');
  console.log('');

  const tester = new StressTester({
    nodeIncrements: [100, 500, 1000, 2500],
    ticksPerTest: 50,
  });

  tester.on('testStart', ({ nodeCount, topology }) => {
    console.log(`Testing ${nodeCount} nodes (${topology})...`);
  });

  tester.on('testComplete', (result) => {
    const status = result.passed ? '✓' : '✗';
    console.log(`  ${status} Avg tick: ${result.metrics.averageTickTimeMs.toFixed(2)}ms`);
  });

  const report = await tester.runScalabilityTest('random');
  console.log('');
  console.log(tester.formatReport(report));
}

async function demoCommand() {
  console.log('═'.repeat(60));
  console.log('        EDUCATIONAL DEMONSTRATION MODE');
  console.log('═'.repeat(60));
  console.log('');
  console.log('This demo shows how a theoretical decentralized network');
  console.log('might behave, including failure recovery and partitions.');
  console.log('');
  console.log('Legend: O = Online, X = Offline, ! = Degraded, ? = Booting');
  console.log('');

  const scenario = scenarios.educationalDemo;
  const simulator = new NetworkSimulator(scenario.config);

  const tickInterval = 800; // Slow for observation
  const maxTicks = 120;

  for (let tick = 0; tick < maxTicks; tick++) {
    // Clear previous output (simple approach)
    if (tick > 0) {
      console.log('\n'.repeat(2));
    }

    const events = simulator.tick();
    const state = simulator.getState();

    console.log(`╔═══════════════════════════════════════╗`);
    console.log(`║  Tick: ${String(tick).padEnd(5)} │ Elapsed: ${String(state.elapsedMs).padEnd(6)}ms  ║`);
    console.log(`╚═══════════════════════════════════════╝`);
    console.log('');
    console.log(generateAsciiMap(state, 40, 12));
    console.log('');

    // Show events
    for (const event of events) {
      console.log(`  → ${event.type}: ${event.nodeId || ''}`);
    }

    // Show scenario events
    const scenarioEvent = scenario.events.find(e => e.atTick === tick);
    if (scenarioEvent) {
      console.log(`  ★ Scenario Event: ${scenarioEvent.action}`);
    }

    // Simple status bar
    const onlineCount = Array.from(state.nodes.values()).filter(n => n.status === 'online').length;
    const bar = '█'.repeat(Math.floor((onlineCount / state.nodes.size) * 20));
    const empty = '░'.repeat(20 - bar.length);
    console.log(`  Health: [${bar}${empty}] ${onlineCount}/${state.nodes.size}`);

    // Sleep between ticks
    await new Promise(resolve => setTimeout(resolve, tickInterval));

    // Break if user presses Ctrl+C
    if (tick >= maxTicks - 1) {
      console.log('');
      console.log('Demo complete! This was a simulation of theoretical network behavior.');
    }
  }
}

main().catch(error => {
  console.error('Simulation error:', error);
  process.exit(1);
});
