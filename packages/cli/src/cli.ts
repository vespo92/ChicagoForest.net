#!/usr/bin/env node
/**
 * @chicago-forest/cli
 *
 * Command Line Interface for Chicago Forest Network.
 * Provides commands for managing forest nodes, peers, tunnels, and more.
 *
 * Usage:
 *   forest init          - Initialize a new forest node
 *   forest start         - Start the forest node
 *   forest stop          - Stop the forest node
 *   forest status        - Show node status
 *   forest peers         - List connected peers
 *   forest mesh          - Manage mesh network
 *   forest tunnel        - Manage SD-WAN tunnels
 *   forest firewall      - Manage firewall rules
 *   forest config        - Show/edit configuration
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

import { Command } from 'commander';
import {
  initCommand,
  startCommand,
  stopCommand,
  statusCommand,
  peersCommand,
  meshCommand,
  tunnelCommand,
  firewallCommand,
  configCommand,
  joinCommand,
  deployCommand,
} from './commands';

export const VERSION = '0.1.0';

export const BANNER = `
 ██████╗██╗  ██╗██╗ ██████╗ █████╗  ██████╗  ██████╗
██╔════╝██║  ██║██║██╔════╝██╔══██╗██╔════╝ ██╔═══██╗
██║     ███████║██║██║     ███████║██║  ███╗██║   ██║
██║     ██╔══██║██║██║     ██╔══██║██║   ██║██║   ██║
╚██████╗██║  ██║██║╚██████╗██║  ██║╚██████╔╝╚██████╔╝
 ╚═════╝╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝
    ███████╗ ██████╗ ██████╗ ███████╗███████╗████████╗
    ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝╚══██╔══╝
    █████╗  ██║   ██║██████╔╝█████╗  ███████╗   ██║
    ██╔══╝  ██║   ██║██╔══██╗██╔══╝  ╚════██║   ██║
    ██║     ╚██████╔╝██║  ██║███████╗███████║   ██║
    ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝

  Chicago Forest Network - P2P Wireless Mesh
  Version ${VERSION}

  ⚠️  DISCLAIMER: AI-generated theoretical framework
      Not operational infrastructure - for research only
`;

const program = new Command();

program
  .name('forest')
  .description('Chicago Forest Network CLI - Manage your forest node')
  .version(VERSION)
  .hook('preAction', () => {
    // Show banner on first run
    if (process.argv.length === 2) {
      console.log(BANNER);
    }
  });

// Initialize command
program
  .command('init')
  .description('Initialize a new forest node')
  .option('-n, --name <name>', 'Node name')
  .option('-d, --data-dir <path>', 'Data directory', '/var/lib/forest')
  .option('--no-firewall', 'Disable firewall')
  .action(initCommand);

// Start command
program
  .command('start')
  .description('Start the forest node')
  .option('-d, --daemon', 'Run as daemon')
  .option('-c, --config <path>', 'Config file path')
  .action(startCommand);

// Stop command
program
  .command('stop')
  .description('Stop the forest node')
  .option('--force', 'Force stop')
  .action(stopCommand);

// Status command
program
  .command('status')
  .description('Show node status')
  .option('-j, --json', 'Output as JSON')
  .option('-v, --verbose', 'Verbose output')
  .action(statusCommand);

// Join command
program
  .command('join <network>')
  .description('Join a forest network')
  .option('-b, --bootstrap <peers...>', 'Bootstrap peers')
  .action(joinCommand);

// Peers command
program
  .command('peers')
  .description('Manage and list peers')
  .option('-l, --list', 'List all peers')
  .option('-a, --add <peer>', 'Add a peer')
  .option('-r, --remove <peer>', 'Remove a peer')
  .option('-j, --json', 'Output as JSON')
  .action(peersCommand);

// Mesh command
program
  .command('mesh')
  .description('Manage wireless mesh network')
  .option('-s, --status', 'Show mesh status')
  .option('-n, --neighbors', 'List mesh neighbors')
  .option('-r, --routes', 'Show mesh routes')
  .option('--start', 'Start mesh networking')
  .option('--stop', 'Stop mesh networking')
  .action(meshCommand);

// Tunnel command
program
  .command('tunnel')
  .description('Manage SD-WAN tunnels')
  .option('-l, --list', 'List tunnels')
  .option('-c, --create', 'Create new tunnel')
  .option('-d, --delete <id>', 'Delete tunnel')
  .option('--remote <node>', 'Remote node for tunnel')
  .option('--type <type>', 'Tunnel type (wireguard, vxlan, forest)')
  .action(tunnelCommand);

// Firewall command
program
  .command('firewall')
  .description('Manage Chicago Forest Firewall')
  .option('-s, --status', 'Show firewall status')
  .option('-r, --rules', 'List firewall rules')
  .option('--add-rule <rule>', 'Add firewall rule')
  .option('--remove-rule <id>', 'Remove firewall rule')
  .option('--export <format>', 'Export config (opnsense, nftables, iptables)')
  .action(firewallCommand);

// Config command
program
  .command('config')
  .description('Show or edit configuration')
  .option('-s, --show', 'Show current config')
  .option('-e, --edit', 'Edit config in editor')
  .option('--set <key=value>', 'Set config value')
  .option('--get <key>', 'Get config value')
  .action(configCommand);

// Deploy command
program
  .command('deploy')
  .description('Generate deployment configurations')
  .option('-t, --target <target>', 'Target (docker, kubernetes, vm)')
  .option('-o, --output <path>', 'Output path')
  .option('--name <name>', 'Node name')
  .action(deployCommand);

// Parse and execute
program.parse();

// Show help if no command
if (process.argv.length === 2) {
  program.help();
}
