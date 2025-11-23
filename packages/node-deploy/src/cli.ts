#!/usr/bin/env node

/**
 * Chicago Forest Node Deployment CLI
 *
 * Command-line tool for generating deployment configurations,
 * provisioning hardware, and managing mesh network nodes.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes.
 *
 * Usage:
 *   forest-deploy generate docker --name my-node
 *   forest-deploy generate kubernetes --name my-node --nic-passthrough
 *   forest-deploy generate cloud-init --name my-node
 *   forest-deploy bom lorawan-gateway
 *   forest-deploy bom meshtastic-relay
 *
 * @module @chicago-forest/node-deploy/cli
 */

import {
  generateDockerCompose,
  generateKubernetesManifest,
  generateCloudInit,
  generateHelmValues,
  generateDockerfile,
  type ForestNodeDeploymentOptions,
} from './index';

// =============================================================================
// COMMAND LINE PARSING
// =============================================================================

interface CLIArgs {
  command: string;
  subcommand: string;
  options: Record<string, string | boolean>;
}

function parseArgs(args: string[]): CLIArgs {
  const result: CLIArgs = {
    command: args[0] || 'help',
    subcommand: args[1] || '',
    options: {},
  };

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (nextArg && !nextArg.startsWith('--')) {
        result.options[key] = nextArg;
        i++;
      } else {
        result.options[key] = true;
      }
    }
  }

  return result;
}

// =============================================================================
// HELP TEXT
// =============================================================================

const HELP_TEXT = `
Chicago Forest Node Deployment CLI
===================================

DISCLAIMER: This is part of an AI-generated theoretical framework
for educational and research purposes. Not operational infrastructure.

Usage:
  forest-deploy <command> <subcommand> [options]

Commands:
  generate docker         Generate Docker Compose configuration
  generate kubernetes     Generate Kubernetes manifests
  generate cloud-init     Generate cloud-init for VM deployment
  generate helm           Generate Helm values.yaml
  generate dockerfile     Generate Dockerfile
  bom <config>            Generate Bill of Materials
  help                    Show this help message

Generate Options:
  --name <name>           Node name (required)
  --interface <if>        Forest network interface (default: eth1)
  --wan <if>              WAN interface for gateway
  --firewall              Enable Chicago Forest Firewall
  --relay                 Enable relay mode
  --storage               Enable storage mode
  --nic-passthrough       Enable NIC passthrough (K8s/VMs)
  --sriov-vf <n>          SR-IOV virtual function index
  --cpu <n>               CPU limit (default: 2)
  --memory <size>         Memory limit (default: 2Gi)

BOM Configurations:
  lorawan-gateway         Full LoRaWAN gateway with Pi 4
  meshtastic-relay        Solar-powered Meshtastic relay
  wifi-mesh-gateway       WiFi mesh gateway node
  portable-meshtastic     Portable Meshtastic handheld
  solar-relay             Solar ESP32 relay node
  fixed-relay             Fixed infrastructure relay

Examples:
  # Generate Docker config for a basic node
  forest-deploy generate docker --name forest-node-1

  # Generate K8s manifest with NIC passthrough
  forest-deploy generate kubernetes --name forest-node-1 --nic-passthrough

  # Generate cloud-init for VM
  forest-deploy generate cloud-init --name forest-node-1 --firewall --relay

  # Generate BOM for LoRaWAN gateway
  forest-deploy bom lorawan-gateway

  # Generate BOM for portable Meshtastic node
  forest-deploy bom portable-meshtastic
`;

// =============================================================================
// GENERATE COMMAND
// =============================================================================

function handleGenerate(subcommand: string, options: Record<string, string | boolean>): void {
  if (!options.name) {
    console.error('Error: --name is required');
    process.exit(1);
  }

  const deployOptions: ForestNodeDeploymentOptions = {
    nodeName: options.name as string,
    forestInterface: (options.interface as string) || 'eth1',
    wanInterface: options.wan as string | undefined,
    enableFirewall: !!options.firewall,
    enableAnonymousRouting: !!options['anon-routing'],
    enableRelay: !!options.relay,
    enableStorage: !!options.storage,
    nicPassthrough: !!options['nic-passthrough'],
    sriovVf: options['sriov-vf'] ? parseInt(options['sriov-vf'] as string) : undefined,
    cpuLimit: (options.cpu as string) || '2',
    memoryLimit: (options.memory as string) || '2Gi',
  };

  let output: string;

  switch (subcommand) {
    case 'docker':
      output = generateDockerCompose(deployOptions);
      console.log(output);
      break;

    case 'kubernetes':
      output = generateKubernetesManifest(deployOptions);
      console.log(output);
      break;

    case 'cloud-init':
      output = generateCloudInit(deployOptions);
      console.log(output);
      break;

    case 'helm':
      output = generateHelmValues(deployOptions);
      console.log(output);
      break;

    case 'dockerfile':
      output = generateDockerfile();
      console.log(output);
      break;

    default:
      console.error(`Unknown generate subcommand: ${subcommand}`);
      console.error('Valid subcommands: docker, kubernetes, cloud-init, helm, dockerfile');
      process.exit(1);
  }
}

// =============================================================================
// BOM COMMAND
// =============================================================================

function handleBOM(configName: string): void {
  // Import BOM generator dynamically to avoid circular dependencies
  // In a real implementation, this would use the @chicago-forest/hardware-hal package

  const bomConfigs: Record<string, { name: string; items: Array<{ item: string; qty: number; price: number; url: string }> }> = {
    'lorawan-gateway': {
      name: 'LoRaWAN Gateway Node',
      items: [
        { item: 'Raspberry Pi 4B (4GB)', qty: 1, price: 55, url: 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/' },
        { item: 'RAK2287 Pi HAT (LoRa Concentrator)', qty: 1, price: 149, url: 'https://store.rakwireless.com/products/rak2287-pi-hat' },
        { item: 'PoE+ HAT', qty: 1, price: 20, url: 'https://www.raspberrypi.com/products/poe-plus-hat/' },
        { item: '915MHz 8dBi Outdoor Antenna', qty: 1, price: 55, url: 'https://www.amazon.com/dp/B09NLFM4QC' },
        { item: 'N-type to U.FL Pigtail', qty: 1, price: 8, url: 'https://www.amazon.com/dp/B01AJQ33Y4' },
        { item: 'IP67 Outdoor Enclosure', qty: 1, price: 35, url: 'https://www.amazon.com/dp/B07VVKR6P7' },
        { item: '32GB microSD Card', qty: 1, price: 15, url: 'https://www.amazon.com/dp/B07P14QHB7' },
        { item: 'PoE Injector', qty: 1, price: 25, url: 'https://www.amazon.com/dp/B07VB27JJL' },
      ],
    },
    'meshtastic-relay': {
      name: 'Solar Meshtastic Relay',
      items: [
        { item: 'Raspberry Pi Zero 2 W', qty: 1, price: 15, url: 'https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/' },
        { item: 'Waveshare SX1262 LoRa HAT', qty: 1, price: 30, url: 'https://www.waveshare.com/sx1262-lorawan-gateway-hat.htm' },
        { item: 'PiJuice HAT', qty: 1, price: 60, url: 'https://uk.pi-supply.com/products/pijuice-standard' },
        { item: '6W Solar Panel', qty: 1, price: 20, url: 'https://www.amazon.com/dp/B00CBT8GJG' },
        { item: '915MHz 5dBi Antenna', qty: 1, price: 35, url: 'https://www.amazon.com/dp/B086YV2QLS' },
        { item: 'IP67 Enclosure (Small)', qty: 1, price: 18, url: 'https://www.amazon.com/dp/B08B3X2K7H' },
        { item: '32GB microSD Card', qty: 1, price: 15, url: 'https://www.amazon.com/dp/B07P14QHB7' },
      ],
    },
    'wifi-mesh-gateway': {
      name: 'WiFi Mesh Gateway',
      items: [
        { item: 'Raspberry Pi 4B (4GB)', qty: 1, price: 55, url: 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/' },
        { item: 'PoE+ HAT', qty: 1, price: 20, url: 'https://www.raspberrypi.com/products/poe-plus-hat/' },
        { item: 'USB WiFi Adapter (802.11ac)', qty: 1, price: 25, url: 'https://www.amazon.com/dp/B08F2ZNC6J' },
        { item: '32GB microSD Card', qty: 1, price: 15, url: 'https://www.amazon.com/dp/B07P14QHB7' },
        { item: 'Outdoor Enclosure', qty: 1, price: 28, url: 'https://www.amazon.com/dp/B07VVKR6P7' },
        { item: 'PoE Switch 5-port', qty: 1, price: 50, url: 'https://www.amazon.com/dp/B076HZFY3F' },
      ],
    },
    'portable-meshtastic': {
      name: 'Portable Meshtastic Node',
      items: [
        { item: 'LILYGO T-Beam Supreme', qty: 1, price: 55, url: 'https://lilygo.cc/products/t-beam-supreme' },
        { item: '18650 3000mAh Battery', qty: 1, price: 8, url: 'https://www.amazon.com/dp/B07H3J6NY8' },
        { item: '915MHz 3dBi Stubby Antenna', qty: 1, price: 12, url: 'https://www.amazon.com/dp/B08LVGGZPR' },
        { item: 'GPS External Antenna (optional)', qty: 1, price: 10, url: 'https://www.amazon.com/dp/B083D59N55' },
      ],
    },
    'solar-relay': {
      name: 'Solar ESP32 Relay Node',
      items: [
        { item: 'Heltec WiFi LoRa 32 V3', qty: 1, price: 22, url: 'https://heltec.org/project/wifi-lora-32-v3/' },
        { item: '3.7V 6000mAh LiPo Battery', qty: 1, price: 18, url: 'https://www.amazon.com/dp/B08214DJLJ' },
        { item: '6W Solar Panel', qty: 1, price: 20, url: 'https://www.amazon.com/dp/B00CBT8GJG' },
        { item: 'Solar Charge Module TP4056', qty: 1, price: 3, url: 'https://www.amazon.com/dp/B06XCXPY86' },
        { item: 'U.FL to SMA Pigtail', qty: 1, price: 6, url: 'https://www.amazon.com/dp/B01AJQ33Y4' },
        { item: '915MHz 5dBi Antenna', qty: 1, price: 35, url: 'https://www.amazon.com/dp/B086YV2QLS' },
        { item: 'IP67 Enclosure (Small)', qty: 1, price: 18, url: 'https://www.amazon.com/dp/B08B3X2K7H' },
        { item: 'Pole Mount Clamp', qty: 1, price: 15, url: 'https://www.amazon.com/dp/B00HXAN39Q' },
      ],
    },
    'fixed-relay': {
      name: 'Fixed Infrastructure Relay',
      items: [
        { item: 'LILYGO T-Beam v1.2', qty: 1, price: 35, url: 'https://lilygo.cc/products/t-beam-v1-1-esp32-lora-gps' },
        { item: '5V 2A Power Supply', qty: 1, price: 10, url: 'https://www.amazon.com/dp/B07DC5LPJZ' },
        { item: '915MHz 8dBi Outdoor Antenna', qty: 1, price: 55, url: 'https://www.amazon.com/dp/B09NLFM4QC' },
        { item: 'Lightning Arrestor (N-type)', qty: 1, price: 25, url: 'https://www.amazon.com/dp/B00HXT83S0' },
        { item: 'IP67 Outdoor Enclosure', qty: 1, price: 28, url: 'https://www.amazon.com/dp/B07VVKR6P7' },
        { item: 'Cable Glands (5-pack)', qty: 1, price: 8, url: 'https://www.amazon.com/dp/B08CV7M3PZ' },
        { item: 'Pole Mount Bracket', qty: 1, price: 15, url: 'https://www.amazon.com/dp/B00HXAN39Q' },
      ],
    },
  };

  const config = bomConfigs[configName];
  if (!config) {
    console.error(`Unknown BOM configuration: ${configName}`);
    console.error('Valid configurations:');
    Object.keys(bomConfigs).forEach(k => console.error(`  - ${k}`));
    process.exit(1);
  }

  // Print BOM as markdown table
  console.log(`# Bill of Materials: ${config.name}`);
  console.log('');
  console.log('**DISCLAIMER:** Prices are estimates and may vary.');
  console.log('');
  console.log('| Item | Qty | Unit Price | Extended | Source |');
  console.log('|------|-----|------------|----------|--------|');

  let total = 0;
  for (const item of config.items) {
    const extended = item.qty * item.price;
    total += extended;
    console.log(`| ${item.item} | ${item.qty} | $${item.price.toFixed(2)} | $${extended.toFixed(2)} | [Link](${item.url}) |`);
  }

  const shipping = Math.round(total * 0.1);
  console.log('');
  console.log(`**Subtotal:** $${total.toFixed(2)}`);
  console.log(`**Est. Shipping (10%):** $${shipping.toFixed(2)}`);
  console.log(`**Grand Total:** $${(total + shipping).toFixed(2)}`);
  console.log('');
  console.log('---');
  console.log('*Generated by Chicago Forest Network Deployment CLI*');
}

// =============================================================================
// MAIN
// =============================================================================

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    console.log(HELP_TEXT);
    return;
  }

  const parsed = parseArgs(args);

  switch (parsed.command) {
    case 'generate':
      handleGenerate(parsed.subcommand, parsed.options);
      break;

    case 'bom':
      handleBOM(parsed.subcommand);
      break;

    default:
      console.error(`Unknown command: ${parsed.command}`);
      console.log(HELP_TEXT);
      process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main, parseArgs, handleGenerate, handleBOM };
