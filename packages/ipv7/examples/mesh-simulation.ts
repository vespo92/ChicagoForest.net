/**
 * IPV7 Mesh Network Simulation
 *
 * Simulates a small mesh network with multiple nodes
 * to demonstrate routing and message passing.
 *
 * ⚠️ THEORETICAL FRAMEWORK - Educational/Experimental Use
 */

import {
  IPV7Node,
  createTestNode,
  formatAddress,
  geohash,
  GeoCoordinates,
  PeerInfo,
  TransportType,
} from '../src/index.js';

// Chicago neighborhood coordinates
const CHICAGO_NEIGHBORHOODS: Record<string, GeoCoordinates> = {
  'lincoln-park': { latitude: 41.9214, longitude: -87.6513 },
  'loop': { latitude: 41.8819, longitude: -87.6278 },
  'hyde-park': { latitude: 41.7943, longitude: -87.5907 },
  'wicker-park': { latitude: 41.9088, longitude: -87.6796 },
  'pilsen': { latitude: 41.8569, longitude: -87.6615 },
  'rogers-park': { latitude: 42.0087, longitude: -87.6676 },
};

/**
 * Create a mesh network of nodes
 */
async function createMeshNetwork(nodeCount: number): Promise<Map<string, IPV7Node>> {
  const nodes = new Map<string, IPV7Node>();
  const neighborhoods = Object.entries(CHICAGO_NEIGHBORHOODS);

  console.log(`Creating ${nodeCount} nodes across Chicago...\n`);

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const [name, location] = neighborhoods[i % neighborhoods.length];
    const nodeId = `${name}-${i}`;
    const node = createTestNode(nodeId, location);
    nodes.set(nodeId, node);

    const hash = geohash.encode(location.latitude, location.longitude, 4);
    console.log(`  ${nodeId}: ${formatAddress(node.address).substring(0, 30)}... (${hash})`);
  }

  // Connect nodes to nearby peers (based on geohash proximity)
  console.log('\nEstablishing peer connections...');

  for (const [id1, node1] of nodes) {
    for (const [id2, node2] of nodes) {
      if (id1 === id2) continue;

      // Connect if geohash matches (same area)
      const prefixMatch = geohash.commonPrefixLength(
        node1.address.geohash,
        node2.address.geohash
      );

      // Connect nodes in same area or with high prefix match
      if (prefixMatch >= 2 || Math.random() < 0.3) {
        const peerInfo: PeerInfo = {
          address: node2.address,
          publicKey: node2.keyPair.publicKey,
          lastSeen: Date.now(),
          capabilities: { relay: true, multipath: true, storage: false, gateway: false },
          endpoints: [{
            type: TransportType.WIFI_DIRECT,
            address: id2,
            port: 0,
            priority: prefixMatch,
          }],
          reputation: 50 + prefixMatch * 10,
        };

        node1.addPeer(peerInfo);
      }
    }
  }

  // Start all nodes
  console.log('\nStarting nodes...');
  for (const node of nodes.values()) {
    await node.start();
  }

  return nodes;
}

/**
 * Simulate message routing through the mesh
 */
async function simulateRouting(nodes: Map<string, IPV7Node>) {
  console.log('\n=== Routing Simulation ===\n');

  const nodeList = Array.from(nodes.entries());
  const [sourceId, sourceNode] = nodeList[0];
  const [destId, destNode] = nodeList[nodeList.length - 1];

  console.log(`Source: ${sourceId} (${sourceNode.address.geohash})`);
  console.log(`Destination: ${destId} (${destNode.address.geohash})`);

  // Set up message tracking
  const messages: string[] = [];

  destNode.on('packet:received', (packet) => {
    messages.push(Buffer.from(packet.payload).toString());
  });

  // Send test message
  const testMessage = `Hello from ${sourceId} to ${destId}!`;
  console.log(`\nSending: "${testMessage}"`);

  try {
    await sourceNode.send(destNode.address, Buffer.from(testMessage));
    console.log('Message sent successfully!');
  } catch (err: any) {
    console.log(`Send failed: ${err.message}`);
  }

  // Wait for delivery
  await new Promise((r) => setTimeout(r, 200));

  if (messages.length > 0) {
    console.log(`\nReceived at ${destId}: "${messages[0]}"`);
  } else {
    console.log('\n(Message still routing through mesh...)');
  }
}

/**
 * Display network statistics
 */
function displayStats(nodes: Map<string, IPV7Node>) {
  console.log('\n=== Network Statistics ===\n');

  let totalPeers = 0;
  let totalRoutes = 0;
  let totalPackets = 0;

  for (const [id, node] of nodes) {
    const stats = node.getStats();
    totalPeers += stats.connectedPeers;
    totalRoutes += stats.routeCount;
    totalPackets += stats.packetsSent + stats.packetsReceived;

    console.log(`${id}:`);
    console.log(`  Peers: ${stats.connectedPeers}, Routes: ${stats.routeCount}`);
    console.log(`  Packets: ${stats.packetsSent} sent, ${stats.packetsReceived} received`);
  }

  console.log('\n--- Totals ---');
  console.log(`Total peer connections: ${totalPeers}`);
  console.log(`Total routes: ${totalRoutes}`);
  console.log(`Total packets: ${totalPackets}`);
}

/**
 * Main simulation
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           IPV7 Mesh Network Simulation                        ║');
  console.log('║                Chicago Forest Network                         ║');
  console.log('║                                                               ║');
  console.log('║  ⚠️  THEORETICAL FRAMEWORK - Educational Use                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Create mesh network
  const nodes = await createMeshNetwork(6);

  // Display initial stats
  displayStats(nodes);

  // Run routing simulation
  await simulateRouting(nodes);

  // Final stats
  displayStats(nodes);

  // Cleanup
  console.log('\nShutting down nodes...');
  for (const node of nodes.values()) {
    await node.stop();
  }

  console.log('\n✓ Simulation complete!\n');
  console.log('This demonstrates how IPV7 could enable P2P mesh networking');
  console.log('across Chicago neighborhoods using geohash-based routing.\n');
  console.log('⚠️  Remember: This is a THEORETICAL framework.');
  console.log('Real implementations would use Yggdrasil, CJDNS, or B.A.T.M.A.N.\n');
}

main().catch(console.error);
