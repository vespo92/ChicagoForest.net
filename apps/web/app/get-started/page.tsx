/**
 * Get Started Page
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * This guide presents a conceptual approach to joining a decentralized P2P network.
 */

import Disclaimer from '../../components/Disclaimer';
import Link from 'next/link';

export const metadata = {
  title: 'Get Started - Chicago Forest Network',
  description: 'Learn how to join the Chicago Forest P2P Network - install packages, configure your node, and connect to the mesh',
};

const steps = [
  {
    number: 1,
    title: 'Understand the Vision',
    description: 'Learn about decentralized, community-owned network infrastructure',
    icon: '🌲',
    content: `The Chicago Forest Network is a theoretical framework for building resilient,
    privacy-preserving peer-to-peer networks. We draw inspiration from mesh networking,
    Tor's onion routing, and community wireless initiatives.`,
    links: [
      { label: 'Read the Whitepaper', href: '/whitepaper' },
      { label: 'Explore Research', href: '/free-energy' },
    ],
  },
  {
    number: 2,
    title: 'Install the Packages',
    description: 'Add Chicago Forest packages to your Node.js project',
    icon: '📦',
    content: `Our packages are designed as building blocks for P2P applications.
    Each package handles a specific aspect of networking - from peer discovery to
    encrypted tunneling to anonymous routing.`,
    code: `# Install core packages
npm install @chicago-forest/p2p-core
npm install @chicago-forest/routing
npm install @chicago-forest/wireless-mesh

# Or install everything
npm install @chicago-forest/cli`,
    links: [
      { label: 'View All Packages', href: '/packages' },
      { label: 'GitHub Repository', href: 'https://github.com/vespo92/ChicagoForest.net' },
    ],
  },
  {
    number: 3,
    title: 'Configure Your Node',
    description: 'Set up your node identity and network preferences',
    icon: '⚙️',
    content: `Each node in the network has a unique cryptographic identity.
    Configuration includes setting your routing preferences, privacy level,
    and connection policies.`,
    code: `import { createNode } from '@chicago-forest/p2p-core';

const node = await createNode({
  // Generate a new identity
  identity: await generateIdentity(),

  // Choose your routing preferences
  routing: {
    protocols: ['dht', 'mesh', 'onion'],
    pathSelection: 'balanced',
    enableAnonymous: true,
  },

  // Set privacy level
  privacy: 'high', // 'low' | 'medium' | 'high'
});

await node.start();`,
    links: [
      { label: 'Configuration Guide', href: '/docs/configuration' },
      { label: 'View Routing Options', href: '/routing' },
    ],
  },
  {
    number: 4,
    title: 'Connect to Peers',
    description: 'Discover and connect to other nodes in the network',
    icon: '🔗',
    content: `The network uses multiple discovery mechanisms: Kademlia DHT for global
    peer discovery, local mesh routing for nearby nodes, and bootstrap nodes for
    initial connection.`,
    code: `// Discover peers using DHT
const peers = await node.discover();

// Connect to specific peer
await node.connect(peerId);

// Listen for incoming connections
node.on('peer:connected', (peer) => {
  console.log('New peer:', peer.id);
});`,
    links: [
      { label: 'Network Topology', href: '/mesh' },
    ],
  },
  {
    number: 5,
    title: 'Enable Privacy Features',
    description: 'Configure onion routing for anonymous communication',
    icon: '🧅',
    content: `For maximum privacy, enable onion routing. Your traffic will be
    encrypted in layers and routed through multiple nodes, making it extremely
    difficult to trace the origin or destination.`,
    code: `import { OnionRouter } from '@chicago-forest/anon-routing';

const router = new OnionRouter({
  hopCount: 3,        // Route through 3 nodes
  circuitTimeout: 300000,  // 5 minute circuits
  paddingEnabled: true,    // Traffic analysis resistance
});

// Create anonymous circuit
const circuit = await router.createCircuit(destination);

// Send data anonymously
await circuit.send(encryptedData);`,
    links: [
      { label: 'Privacy Architecture', href: '/privacy' },
    ],
  },
  {
    number: 6,
    title: 'Contribute to the Network',
    description: 'Run a relay node to strengthen the network',
    icon: '🌐',
    content: `The network grows stronger with more participants. By running a relay
    node, you help others maintain their privacy and improve network resilience.
    You can choose what traffic to relay based on your resources and preferences.`,
    code: `// Configure as relay node
const relay = await createRelayNode({
  bandwidth: '100mbps',     // Available bandwidth
  relayTypes: ['mesh', 'onion'],
  exitPolicy: 'no-exit',    // Don't act as exit node
});

await relay.start();
console.log('Relay node active:', relay.id);`,
    links: [
      { label: 'Deployment Guide', href: '/docs/deployment' },
      { label: 'Contribution Guide', href: '/contribute' },
    ],
  },
];

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-green-900/20 via-background to-cyan-900/20 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-2xl">🚀</span>
              <span className="text-green-400 text-sm font-medium">Start Your Journey</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Get Started with Chicago Forest
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Build privacy-preserving, decentralized applications using our open-source
              P2P networking packages. No central servers. No tracking. Just pure mesh.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/vespo92/ChicagoForest.net"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                View on GitHub
              </a>
              <Link
                href="/packages"
                className="px-6 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Explore Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Disclaimer />
      </div>

      {/* Steps Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Follow These Steps</h2>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-linear-to-b from-cyan-500/50 to-transparent" />
                )}

                <div className="flex gap-6">
                  {/* Step number */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-card border rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                        Step {step.number}
                      </span>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                    <p className="text-muted-foreground mb-4 whitespace-pre-line">{step.content}</p>

                    {step.code && (
                      <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm mb-4 border border-white/10">
                        <code className="text-green-400">{step.code}</code>
                      </pre>
                    )}

                    {step.links && (
                      <div className="flex flex-wrap gap-2">
                        {step.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline"
                          >
                            {link.label} &rarr;
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/packages" className="group bg-card border rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors">NPM Packages</h3>
              <p className="text-sm text-muted-foreground">
                Browse all available packages with installation guides and API documentation.
              </p>
            </Link>
            <Link href="/privacy" className="group bg-card border rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
              <div className="text-4xl mb-4">🧅</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors">Privacy Guide</h3>
              <p className="text-sm text-muted-foreground">
                Learn about our Tor-inspired onion routing and privacy-first architecture.
              </p>
            </Link>
            <a
              href="https://github.com/vespo92/ChicagoForest.net"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card border rounded-xl p-6 hover:border-cyan-500/50 transition-colors"
            >
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors">Contribute</h3>
              <p className="text-sm text-muted-foreground">
                Join the community, report issues, and submit pull requests.
              </p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
