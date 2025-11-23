/**
 * @chicago-forest/cli
 *
 * Command Line Interface for Chicago Forest Network.
 * Manage nodes, peers, tunnels, firewall, mesh networking, and federation.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 */

export * from './commands';
export { VERSION, BANNER } from './cli';

// Re-export command functions for programmatic use
export {
  initCommand,
  startCommand,
  stopCommand,
  statusCommand,
  joinCommand,
  peersCommand,
  meshCommand,
  tunnelCommand,
  firewallCommand,
  configCommand,
  deployCommand,
  federationCommand,
  symbiontCommand,
} from './commands';
