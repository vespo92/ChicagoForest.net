/**
 * Packages Page
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * These packages represent conceptual implementations for P2P networking.
 */

import Disclaimer from '../../components/Disclaimer';
import Link from 'next/link';

export const metadata = {
  title: 'Packages - Chicago Forest Network',
  description: 'Open-source npm packages for building decentralized P2P networks with privacy-first design',
};

interface Package {
  name: string;
  description: string;
  fullName: string;
  category: 'core' | 'networking' | 'privacy' | 'infrastructure' | 'tools';
  features: string[];
  installCommand: string;
  status: 'stable' | 'beta' | 'alpha';
  icon: string;
}

const packages: Package[] = [
  {
    name: 'p2p-core',
    fullName: '@chicago-forest/p2p-core',
    description: 'Core P2P primitives including node identity, peer discovery, and connection management',
    category: 'core',
    features: [
      'Ed25519 cryptographic identity',
      'Kademlia DHT peer discovery',
      'Connection lifecycle management',
      'Type-safe event emitter',
    ],
    installCommand: 'npm install @chicago-forest/p2p-core',
    status: 'beta',
    icon: '🔌',
  },
  {
    name: 'routing',
    fullName: '@chicago-forest/routing',
    description: 'Unified routing layer integrating multiple protocols with intelligent path selection',
    category: 'core',
    features: [
      'Multi-protocol aggregation',
      'Configurable path selection policies',
      'Route metrics and monitoring',
      'Automatic failover',
    ],
    installCommand: 'npm install @chicago-forest/routing',
    status: 'beta',
    icon: '🛤️',
  },
  {
    name: 'shared-types',
    fullName: '@chicago-forest/shared-types',
    description: 'TypeScript type definitions shared across all Chicago Forest packages',
    category: 'core',
    features: [
      'Comprehensive type coverage',
      'Strict TypeScript support',
      'Protocol message types',
      'Configuration interfaces',
    ],
    installCommand: 'npm install @chicago-forest/shared-types',
    status: 'stable',
    icon: '📝',
  },
  {
    name: 'wireless-mesh',
    fullName: '@chicago-forest/wireless-mesh',
    description: 'WiFi Direct, ad-hoc networking, and mesh routing protocols (BATMAN-adv, OLSR, Babel)',
    category: 'networking',
    features: [
      'BATMAN-adv mesh routing',
      'OLSR and Babel support',
      'Link quality monitoring',
      'Channel management',
    ],
    installCommand: 'npm install @chicago-forest/wireless-mesh',
    status: 'alpha',
    icon: '📡',
  },
  {
    name: 'sdwan-bridge',
    fullName: '@chicago-forest/sdwan-bridge',
    description: 'SD-WAN tunnel management with WireGuard, VXLAN, and traffic engineering',
    category: 'networking',
    features: [
      'WireGuard tunnel support',
      'VXLAN overlay networks',
      'Multi-path load balancing',
      'Traffic classification',
    ],
    installCommand: 'npm install @chicago-forest/sdwan-bridge',
    status: 'alpha',
    icon: '🌉',
  },
  {
    name: 'anon-routing',
    fullName: '@chicago-forest/anon-routing',
    description: 'Tor-inspired onion routing for anonymous, censorship-resistant communication',
    category: 'privacy',
    features: [
      'Multi-hop encrypted circuits',
      'Hidden services support',
      'Traffic padding',
      'Circuit isolation',
    ],
    installCommand: 'npm install @chicago-forest/anon-routing',
    status: 'alpha',
    icon: '🧅',
  },
  {
    name: 'firewall',
    fullName: '@chicago-forest/firewall',
    description: 'Chicago Forest Firewall engine with OPNsense integration and rule generation',
    category: 'infrastructure',
    features: [
      'nftables/iptables generation',
      'OPNsense config export',
      'Fluent rule builder DSL',
      'Two-port WAN/FOREST config',
    ],
    installCommand: 'npm install @chicago-forest/firewall',
    status: 'alpha',
    icon: '🛡️',
  },
  {
    name: 'hardware-hal',
    fullName: '@chicago-forest/hardware-hal',
    description: 'Hardware abstraction for WiFi adapters, LoRa radios, and 60GHz backhaul',
    category: 'infrastructure',
    features: [
      'WiFi adapter abstraction',
      'LoRa SX1262/SX1276 support',
      '60GHz backhaul interface',
      'UISP compatibility',
    ],
    installCommand: 'npm install @chicago-forest/hardware-hal',
    status: 'alpha',
    icon: '🔧',
  },
  {
    name: 'node-deploy',
    fullName: '@chicago-forest/node-deploy',
    description: 'Deployment configurations for Docker, Kubernetes, and VMs with NIC passthrough',
    category: 'infrastructure',
    features: [
      'Docker Compose configs',
      'Kubernetes manifests',
      'cloud-init for VMs',
      'Helm chart support',
    ],
    installCommand: 'npm install @chicago-forest/node-deploy',
    status: 'alpha',
    icon: '🐳',
  },
  {
    name: 'ipv7',
    fullName: '@chicago-forest/ipv7',
    description: 'Experimental IPV7 protocol with 256-bit addresses and mesh-native routing',
    category: 'networking',
    features: [
      '256-bit address space',
      'Geohash-based routing',
      'Cryptographic identity',
      'No central infrastructure',
    ],
    installCommand: 'npm install @chicago-forest/ipv7',
    status: 'alpha',
    icon: '🌐',
  },
  {
    name: 'ipv7-adapter',
    fullName: '@chicago-forest/ipv7-adapter',
    description: 'Bridge between IPV7 and traditional IPv4/IPv6 networks',
    category: 'networking',
    features: [
      'Address translation',
      'Packet encapsulation',
      'IPv6 compatibility mode',
      'Gateway functionality',
    ],
    installCommand: 'npm install @chicago-forest/ipv7-adapter',
    status: 'alpha',
    icon: '🔄',
  },
  {
    name: 'cli',
    fullName: '@chicago-forest/cli',
    description: 'Command-line interface for node management, deployment, and network operations',
    category: 'tools',
    features: [
      '10+ CLI commands',
      'Node initialization',
      'Peer management',
      'Deployment generation',
    ],
    installCommand: 'npm install -g @chicago-forest/cli',
    status: 'beta',
    icon: '💻',
  },
];

const categoryLabels = {
  core: { label: 'Core', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  networking: { label: 'Networking', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  privacy: { label: 'Privacy', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  infrastructure: { label: 'Infrastructure', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  tools: { label: 'Tools', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
};

const statusLabels = {
  stable: { label: 'Stable', color: 'bg-green-500/20 text-green-400' },
  beta: { label: 'Beta', color: 'bg-yellow-500/20 text-yellow-400' },
  alpha: { label: 'Alpha', color: 'bg-red-500/20 text-red-400' },
};

export default function PackagesPage() {
  const categories = ['core', 'networking', 'privacy', 'infrastructure', 'tools'] as const;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-2xl">📦</span>
              <span className="text-purple-400 text-sm font-medium">Open Source Packages</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Chicago Forest Packages
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Modular npm packages for building decentralized, privacy-preserving P2P networks.
              Each package handles a specific aspect of mesh networking.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <code className="px-6 py-3 bg-black/50 border border-white/10 rounded-lg text-green-400 font-mono">
                npm install @chicago-forest/p2p-core
              </code>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Disclaimer />
      </div>

      {/* Quick Install */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-card border rounded-xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Quick Install</h2>
          <p className="text-muted-foreground mb-6">
            Install all packages at once using the CLI, or pick individual packages for your needs:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-black/50 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-muted-foreground mb-2">Install CLI globally:</p>
              <code className="text-green-400 text-sm">npm install -g @chicago-forest/cli</code>
            </div>
            <div className="bg-black/50 rounded-lg p-4 border border-white/10">
              <p className="text-xs text-muted-foreground mb-2">Or clone the repo:</p>
              <code className="text-green-400 text-sm">git clone https://github.com/vespo92/ChicagoForest.net</code>
            </div>
          </div>
        </div>
      </section>

      {/* Package List by Category */}
      <section className="container mx-auto px-4 py-12">
        {categories.map((category) => {
          const categoryPackages = packages.filter((p) => p.category === category);
          if (categoryPackages.length === 0) return null;

          return (
            <div key={category} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${categoryLabels[category].color}`}>
                  {categoryLabels[category].label}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="bg-card border rounded-xl p-6 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{pkg.icon}</div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[pkg.status].color}`}>
                        {statusLabels[pkg.status].label}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-1">{pkg.name}</h3>
                    <p className="text-xs text-cyan-400 font-mono mb-3">{pkg.fullName}</p>
                    <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>

                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Features:</p>
                      <ul className="space-y-1">
                        {pkg.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="text-green-500">&#10003;</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-black/50 rounded-lg p-3 border border-white/10">
                      <code className="text-xs text-green-400 break-all">{pkg.installCommand}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Architecture Overview */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Package Architecture</h2>
          <div className="max-w-4xl mx-auto bg-card border rounded-xl p-8">
            <pre className="text-sm text-muted-foreground overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────┐
│                     @chicago-forest/cli                      │
│              (Command-line interface for all operations)     │
└─────────────────────────────────────────────────────────────┘
                              │
    ┌─────────────────────────┼─────────────────────────┐
    │                         │                         │
    ▼                         ▼                         ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│   routing   │       │  wireless-  │       │  anon-routing   │
│  (unified)  │◄─────►│    mesh     │       │   (privacy)     │
└─────────────┘       └─────────────┘       └─────────────────┘
    │                         │                         │
    └─────────────────────────┼─────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    p2p-core     │
                    │ (peer discovery │
                    │   & identity)   │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  shared-types   │
                    │  (TypeScript)   │
                    └─────────────────┘`}
            </pre>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with our getting started guide or dive into the source code on GitHub.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/get-started"
              className="px-6 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Get Started Guide
            </Link>
            <a
              href="https://github.com/vespo92/ChicagoForest.net"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-card border font-medium rounded-lg hover:bg-muted transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
