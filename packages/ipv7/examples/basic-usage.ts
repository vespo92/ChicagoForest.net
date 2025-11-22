/**
 * IPV7 Basic Usage Example
 *
 * This example demonstrates how to:
 * 1. Generate IPV7 addresses
 * 2. Create and start nodes
 * 3. Send messages between nodes
 *
 * ⚠️ THEORETICAL FRAMEWORK - Educational/Experimental Use
 */

import {
  // Address functions
  generateAddress,
  parseAddress,
  formatAddress,
  validateAddress,
  addressEquals,
  geohash,

  // Crypto
  generateKeyPair,

  // Packets
  createPacket,
  PacketType,

  // Node
  IPV7Node,
  createTestNode,

  // Types
  IPV7Address,
  GeoCoordinates,
} from '../src/index.js';

// ============================================
// Example 1: Generate an IPV7 Address
// ============================================

console.log('=== Example 1: Generate Address ===\n');

// Generate a key pair (like creating a crypto wallet)
const keyPair = generateKeyPair();
console.log('Generated key pair');
console.log('Public key:', Buffer.from(keyPair.publicKey).toString('hex').substring(0, 32) + '...');

// Define your location (Chicago)
const chicagoLocation: GeoCoordinates = {
  latitude: 41.8781,
  longitude: -87.6298,
};

// Generate address from key pair + location
const myAddress = generateAddress(keyPair, chicagoLocation);
console.log('\nGenerated IPV7 address:');
console.log('  Full:', formatAddress(myAddress));
console.log('  Geohash:', myAddress.geohash, '(Chicago area)');
console.log('  Version:', myAddress.version);
console.log('  Valid:', validateAddress(myAddress));

// ============================================
// Example 2: Parse an Address String
// ============================================

console.log('\n=== Example 2: Parse Address ===\n');

const addressString = 'ipv7:dp3w:7a3f2b1c5d8e9f0a1b2c3d4e:8080';
try {
  const parsed = parseAddress(addressString);
  console.log('Parsed:', addressString);
  console.log('  Geohash:', parsed.geohash);
  console.log('  Node ID:', Buffer.from(parsed.nodeId).toString('hex'));
  console.log('  Port:', parsed.port);
} catch (err) {
  console.error('Parse error:', err);
}

// ============================================
// Example 3: Geohash for Location-Based Routing
// ============================================

console.log('\n=== Example 3: Geohash Proximity ===\n');

// Locations in Chicago
const locations = [
  { name: 'Lincoln Park', lat: 41.9214, lon: -87.6513 },
  { name: 'Loop', lat: 41.8819, lon: -87.6278 },
  { name: 'Hyde Park', lat: 41.7943, lon: -87.5907 },
  { name: 'Evanston', lat: 42.0451, lon: -87.6877 },
];

console.log('Geohashes for Chicago neighborhoods:');
for (const loc of locations) {
  const hash = geohash.encode(loc.lat, loc.lon, 4);
  console.log(`  ${loc.name}: ${hash}`);
}

// Check proximity
const loopHash = geohash.encode(41.8819, -87.6278, 4);
const lincolnHash = geohash.encode(41.9214, -87.6513, 4);
const prefixMatch = geohash.commonPrefixLength(loopHash, lincolnHash);
console.log(`\nLoop to Lincoln Park prefix match: ${prefixMatch} chars`);
console.log(`Distance: ~${geohash.distance(loopHash, lincolnHash).toFixed(2)} km`);

// ============================================
// Example 4: In-Memory P2P Communication
// ============================================

console.log('\n=== Example 4: P2P Messaging (In-Memory) ===\n');

// Create two test nodes
const alice = createTestNode('alice', { latitude: 41.8781, longitude: -87.6298 });
const bob = createTestNode('bob', { latitude: 41.9214, longitude: -87.6513 });

console.log('Created nodes:');
console.log('  Alice:', alice.getAddressString());
console.log('  Bob:', bob.getAddressString());

// Set up message handlers
alice.on('packet:received', (packet) => {
  console.log('\n[Alice received]:', Buffer.from(packet.payload).toString());
});

bob.on('packet:received', (packet) => {
  console.log('\n[Bob received]:', Buffer.from(packet.payload).toString());
});

// Add each other as peers (in real network, this happens via discovery)
alice.addPeer({
  address: bob.address,
  publicKey: bob.keyPair.publicKey,
  lastSeen: Date.now(),
  capabilities: { relay: true, multipath: true, storage: false, gateway: false },
  endpoints: [{ type: 'wifi-direct' as any, address: 'bob', port: 0, priority: 0 }],
  reputation: 50,
});

bob.addPeer({
  address: alice.address,
  publicKey: alice.keyPair.publicKey,
  lastSeen: Date.now(),
  capabilities: { relay: true, multipath: true, storage: false, gateway: false },
  endpoints: [{ type: 'wifi-direct' as any, address: 'alice', port: 0, priority: 0 }],
  reputation: 50,
});

// Start nodes
await alice.start();
await bob.start();

// Send message from Alice to Bob
console.log('\nAlice sending message to Bob...');
await alice.send(bob.address, Buffer.from('Hello Bob! This is Alice from Chicago.'));

// Small delay for async processing
await new Promise((r) => setTimeout(r, 100));

// Get stats
console.log('\nNode statistics:');
console.log('  Alice:', alice.getStats());
console.log('  Bob:', bob.getStats());

// Cleanup
await alice.stop();
await bob.stop();

// ============================================
// Example 5: Address Comparison
// ============================================

console.log('\n=== Example 5: Address Operations ===\n');

const addr1 = generateAddress(generateKeyPair(), chicagoLocation);
const addr2 = generateAddress(generateKeyPair(), chicagoLocation);

console.log('Address 1:', formatAddress(addr1));
console.log('Address 2:', formatAddress(addr2));
console.log('Same address?', addressEquals(addr1, addr2));
console.log('Same geohash?', addr1.geohash === addr2.geohash);

console.log('\n✓ All examples completed!');
console.log('\n⚠️  Remember: IPV7 is a THEORETICAL FRAMEWORK for educational purposes.');
console.log('For real mesh networks, see: Yggdrasil, CJDNS, B.A.T.M.A.N.\n');
