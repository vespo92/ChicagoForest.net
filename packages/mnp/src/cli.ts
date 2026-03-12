#!/usr/bin/env node
/**
 * MNP CLI - Command-line interface for MNP nodes
 *
 * Usage:
 *   npx @chicago-forest/mnp start [options]
 *   npx @chicago-forest/mnp address --lat <lat> --lon <lon>
 *   npx @chicago-forest/mnp info
 */

import { MNPNode } from './node/index.js';
import { generateAddress, formatAddress, parseAddress } from './address/index.js';
import { generateKeyPair } from './crypto/index.js';
import { VERSION } from './index.js';

const HELP = `
MNP Protocol CLI v${VERSION}
Chicago Forest Network - Next-Generation P2P Addressing

⚠️  THEORETICAL FRAMEWORK - For educational/experimental use

COMMANDS:
  start           Start an MNP node
  address         Generate an MNP address
  parse <addr>    Parse and validate an MNP address
  info            Show protocol information

OPTIONS:
  --tcp <port>    TCP listen port (default: 7777)
  --udp <port>    UDP listen port (default: 7778)
  --lat <lat>     Latitude for geohash
  --lon <lon>     Longitude for geohash
  --help          Show this help

EXAMPLES:
  # Start a node in Chicago
  mnp start --lat 41.8781 --lon -87.6298 --tcp 7777

  # Generate an address
  mnp address --lat 41.8781 --lon -87.6298

  # Parse an address
  mnp parse mnp:dp3w:7a3f2b1c5d8e9f0a1b2c3d4e:8080

LEARN MORE:
  https://chicagoforest.net/mesh
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log(HELP);
    process.exit(0);
  }

  // Parse options
  const options: Record<string, string> = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].substring(2);
      options[key] = args[i + 1] || 'true';
      i++;
    }
  }

  switch (command) {
    case 'start':
      await startNode(options);
      break;

    case 'address':
      generateNewAddress(options);
      break;

    case 'parse':
      parseAndValidate(args[1]);
      break;

    case 'info':
      showInfo();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.log(HELP);
      process.exit(1);
  }
}

async function startNode(options: Record<string, string>) {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   MNP Node Starting...                       ║
║               Chicago Forest Network v${VERSION}                  ║
║                                                               ║
║  ⚠️  THEORETICAL FRAMEWORK - Educational/Experimental Use     ║
╚═══════════════════════════════════════════════════════════════╝
`);

  const config = {
    location: options.lat && options.lon
      ? { latitude: parseFloat(options.lat), longitude: parseFloat(options.lon) }
      : undefined,
    listen: {
      tcp: options.tcp ? parseInt(options.tcp) : 7777,
      udp: options.udp ? parseInt(options.udp) : 7778,
    },
    enableRelay: true,
  };

  const node = new MNPNode(config);

  // Set up event handlers
  node.on('peer:discovered', (peer) => {
    console.log(`[PEER] Discovered: ${formatAddress(peer.address)}`);
  });

  node.on('peer:disconnected', (address) => {
    console.log(`[PEER] Disconnected: ${formatAddress(address)}`);
  });

  node.on('packet:received', (packet) => {
    console.log(`[PACKET] Received ${packet.payload.length} bytes from ${formatAddress(packet.header.source)}`);
  });

  node.on('error', (err) => {
    console.error(`[ERROR] ${err.message}`);
  });

  try {
    await node.start();

    console.log(`
┌───────────────────────────────────────────────────────────────┐
│  Node Started Successfully!                                   │
├───────────────────────────────────────────────────────────────┤
│  Address: ${node.getAddressString().padEnd(50)}│
│  Location: ${config.location ? `${config.location.latitude}, ${config.location.longitude}` : 'Not set'.padEnd(47)}│
│  TCP Port: ${String(config.listen.tcp).padEnd(51)}│
│  UDP Port: ${String(config.listen.udp).padEnd(51)}│
└───────────────────────────────────────────────────────────────┘

Listening for peers... Press Ctrl+C to stop.
`);

    // Keep running
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      await node.stop();
      process.exit(0);
    });

    // Print stats periodically
    setInterval(() => {
      const stats = node.getStats();
      console.log(`[STATS] Peers: ${stats.connectedPeers} | Routes: ${stats.routeCount} | Packets: ${stats.packetsSent}/${stats.packetsReceived}`);
    }, 30000);

  } catch (err: any) {
    console.error(`Failed to start node: ${err.message}`);
    process.exit(1);
  }
}

function generateNewAddress(options: Record<string, string>) {
  const keyPair = generateKeyPair();

  const location = options.lat && options.lon
    ? { latitude: parseFloat(options.lat), longitude: parseFloat(options.lon) }
    : undefined;

  const address = generateAddress(keyPair, location);

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              MNP Address Generated                           ║
╚═══════════════════════════════════════════════════════════════╝

Address: ${formatAddress(address)}

Components:
  Version:  ${address.version}
  Geohash:  ${address.geohash} ${location ? `(${location.latitude}, ${location.longitude})` : '(default)'}
  Node ID:  ${Buffer.from(address.nodeId).toString('hex')}
  Checksum: 0x${address.checksum.toString(16).padStart(4, '0')}

Public Key (hex):
  ${Buffer.from(keyPair.publicKey).toString('hex')}

Private Key (hex) - KEEP SECRET:
  ${Buffer.from(keyPair.privateKey).toString('hex')}

⚠️  Save your private key securely - it cannot be recovered!
`);
}

function parseAndValidate(addressStr: string) {
  if (!addressStr) {
    console.error('Please provide an address to parse');
    process.exit(1);
  }

  try {
    const address = parseAddress(addressStr);

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              MNP Address Parsed                              ║
╚═══════════════════════════════════════════════════════════════╝

Input:    ${addressStr}
Valid:    ✓ Yes

Components:
  Version:  ${address.version}
  Flags:    0x${address.flags.toString(16).padStart(2, '0')}
  Geohash:  ${address.geohash}
  Node ID:  ${Buffer.from(address.nodeId).toString('hex')}
  Checksum: 0x${address.checksum.toString(16).padStart(4, '0')}
  Port:     ${address.port ?? 'not specified'}

Canonical: ${formatAddress(address)}
`);
  } catch (err: any) {
    console.error(`
Invalid address: ${err.message}

Expected format: mnp:<geohash>:<nodeId>:<port?>
Example: mnp:dp3w:7a3f2b1c5d8e9f0a1b2c3d4e:8080
`);
    process.exit(1);
  }
}

function showInfo() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    MNP Protocol Info                         ║
║               Chicago Forest Network v${VERSION}                  ║
╚═══════════════════════════════════════════════════════════════╝

⚠️  THEORETICAL FRAMEWORK - AI-Generated Conceptual Protocol

WHAT IS MNP?

  MNP (Mycelium Network Protocol) is a next-generation addressing scheme
  for peer-to-peer mesh networks, featuring:

  • 256-bit addresses (double IPv6's 128-bit)
  • Cryptographic identity (addresses derived from public keys)
  • Geographic awareness (geohash prefix for proximity routing)
  • Mesh-native DHT routing (no central authority)
  • Multi-path support (resilient routing)

ADDRESS FORMAT

  mnp:<geohash>:<nodeId>:<port>

  Example: mnp:dp3w:7a3f2b1c5d8e9f0a1b2c3d4e:8080

  • geohash: 4-char location prefix (dp3w = Chicago area)
  • nodeId:  24-char hex (128-bit crypto identity)
  • port:    optional service port

WHY MYCELIUM?

  Like underground fungal networks that connect forest trees,
  MNP creates organic, self-healing mesh networks:

  IPv4: 32-bit addresses, centralized
  IPv6: 128-bit addresses, still hierarchical
  MNP:  256-bit addresses, cryptographic, geographic, decentralized

COMPARISON

  Feature         IPv6          MNP
  ─────────────────────────────────────────
  Address Size    128-bit       256-bit
  Identity        None          Cryptographic
  Location        None          Geohash
  Routing         Hierarchical  DHT/Mesh
  Authority       IANA/RIRs     Self-allocated

LEARN MORE

  Website:  https://chicagoforest.net/mesh
  GitHub:   https://github.com/vespo92/ChicagoForest.net
  Discord:  discord.gg/chicagoforest

This is a theoretical framework for educational purposes.
Real mesh networks use protocols like Yggdrasil, CJDNS, B.A.T.M.A.N.
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
