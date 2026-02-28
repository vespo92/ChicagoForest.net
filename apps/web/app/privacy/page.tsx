/**
 * Privacy Architecture Page
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * This page describes conceptual privacy mechanisms inspired by Tor and other anonymity networks.
 */

import Disclaimer from '../../components/Disclaimer';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Architecture - Chicago Forest Network',
  description: 'Tor-inspired onion routing and privacy-first design for anonymous, censorship-resistant P2P communication',
};

const privacyLayers = [
  {
    name: 'Layer 1: Identity Privacy',
    icon: '🔐',
    description: 'Cryptographic node identity without personal information',
    features: [
      'Ed25519 keypair-based identity',
      'No registration or central authority',
      'Identity rotation support',
      'Pseudonymous networking',
    ],
    code: `// Generate anonymous identity
const identity = await generateIdentity();
// Identity is just a keypair - no email, no phone, no tracking
console.log(identity.publicKey); // This is your only identifier`,
  },
  {
    name: 'Layer 2: Transport Encryption',
    icon: '🔒',
    description: 'End-to-end encryption for all network traffic',
    features: [
      'Perfect forward secrecy',
      'ChaCha20-Poly1305 encryption',
      'Authenticated key exchange',
      'No plaintext metadata',
    ],
    code: `// All connections are encrypted by default
const connection = await node.connect(peerId);
// Uses Noise Protocol framework
// Even metadata is protected`,
  },
  {
    name: 'Layer 3: Onion Routing',
    icon: '🧅',
    description: 'Multi-hop routing where each node only knows previous/next hop',
    features: [
      '3-6 hop circuits',
      'Layered encryption (like an onion)',
      'Circuit isolation',
      'Regular circuit rotation',
    ],
    code: `import { OnionRouter } from '@chicago-forest/anon-routing';

const router = new OnionRouter({ hopCount: 3 });
const circuit = await router.createCircuit(destination);

// Your traffic is wrapped in 3 layers of encryption
// Each relay peels one layer and forwards
// No single node knows both source AND destination`,
  },
  {
    name: 'Layer 4: Traffic Analysis Resistance',
    icon: '📊',
    description: 'Protection against surveillance through traffic patterns',
    features: [
      'Constant-rate traffic padding',
      'Fixed-size cells',
      'Timing obfuscation',
      'Cover traffic generation',
    ],
    code: `const circuit = await router.createCircuit(destination, {
  padding: true,        // Add noise traffic
  cellSize: 512,        // Fixed packet sizes
  burstMode: false,     // Smooth traffic patterns
});`,
  },
  {
    name: 'Layer 5: Hidden Services',
    icon: '👻',
    description: 'Host services without revealing your IP address',
    features: [
      'Rendezvous-based connections',
      'Service descriptor encryption',
      'Introduction points',
      'No server IP exposure',
    ],
    code: `// Create a hidden service
const service = await node.createHiddenService({
  port: 80,
  handler: (request) => handleRequest(request),
});

console.log(service.onionAddress);
// Clients connect via .onion address
// Your real IP is never revealed`,
  },
];

const comparisonData = [
  {
    feature: 'Centralized servers',
    traditional: 'Yes - single point of failure',
    chicagoForest: 'No - fully distributed',
  },
  {
    feature: 'IP address visible',
    traditional: 'Always visible to servers',
    chicagoForest: 'Hidden via onion routing',
  },
  {
    feature: 'Metadata collection',
    traditional: 'Extensive logging possible',
    chicagoForest: 'Minimal - no single observer',
  },
  {
    feature: 'Traffic analysis',
    traditional: 'Easy for network observers',
    chicagoForest: 'Resistant via padding & mixing',
  },
  {
    feature: 'Censorship resistance',
    traditional: 'Easily blocked',
    chicagoForest: 'Mesh routing around blocks',
  },
  {
    feature: 'Exit node required',
    traditional: 'N/A',
    chicagoForest: 'Optional - can stay in network',
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-purple-900/30 via-background to-pink-900/20 py-20">
        <div className="absolute inset-0">
          {/* Animated onion layers */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border-2 border-purple-500 animate-pulse"
                style={{
                  width: `${i * 120}px`,
                  height: `${i * 120}px`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${2 + i * 0.5}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-2xl">🧅</span>
              <span className="text-purple-400 text-sm font-medium">Privacy-First Architecture</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Tor-Inspired Privacy
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Built on the same principles that power the Tor network - onion routing,
              layered encryption, and traffic analysis resistance.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">No Central Authority</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">Anonymous Routing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Disclaimer />
      </div>

      {/* How Onion Routing Works */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How Onion Routing Works</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Your data is encrypted in layers, like an onion. Each relay only knows the
            previous and next hop - never the full path.
          </p>

          <div className="bg-card border rounded-xl p-8 mb-12">
            <div className="grid md:grid-cols-5 gap-4 items-center text-center">
              <div className="p-4">
                <div className="text-4xl mb-2">💻</div>
                <p className="text-sm font-medium">You</p>
                <p className="text-xs text-muted-foreground">Encrypt 3 layers</p>
              </div>
              <div className="text-2xl text-muted-foreground">&rarr;</div>
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="text-4xl mb-2">🧅</div>
                <p className="text-sm font-medium">Relay 1</p>
                <p className="text-xs text-muted-foreground">Peels layer 1</p>
              </div>
              <div className="text-2xl text-muted-foreground">&rarr;</div>
              <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/30">
                <div className="text-4xl mb-2">🧅</div>
                <p className="text-sm font-medium">Relay 2</p>
                <p className="text-xs text-muted-foreground">Peels layer 2</p>
              </div>
            </div>
            <div className="grid md:grid-cols-5 gap-4 items-center text-center mt-4">
              <div className="md:col-start-3 p-4">
                <div className="text-2xl text-muted-foreground">&darr;</div>
              </div>
            </div>
            <div className="grid md:grid-cols-5 gap-4 items-center text-center">
              <div className="md:col-start-2 p-4">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm font-medium">Destination</p>
                <p className="text-xs text-muted-foreground">Receives data</p>
              </div>
              <div className="text-2xl text-muted-foreground">&larr;</div>
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <div className="text-4xl mb-2">🧅</div>
                <p className="text-sm font-medium">Relay 3</p>
                <p className="text-xs text-muted-foreground">Peels layer 3</p>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <p className="text-green-400 font-medium">
              No single relay knows both your identity AND your destination.
              Even if one relay is compromised, your privacy remains protected.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Layers */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Five Layers of Privacy</h2>

          <div className="max-w-4xl mx-auto space-y-8">
            {privacyLayers.map((layer) => (
              <div key={layer.name} className="bg-card border rounded-xl overflow-hidden">
                <div className="p-6 border-b flex items-center gap-4">
                  <div className="text-4xl">{layer.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold">{layer.name}</h3>
                    <p className="text-muted-foreground">{layer.description}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                  <div className="p-6">
                    <h4 className="text-sm font-semibold mb-3 text-cyan-400">Features</h4>
                    <ul className="space-y-2">
                      {layer.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="text-green-500">&#10003;</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6">
                    <h4 className="text-sm font-semibold mb-3 text-cyan-400">Example</h4>
                    <pre className="bg-black/50 rounded-lg p-3 text-xs overflow-x-auto border border-white/10">
                      <code className="text-green-400">{layer.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Privacy Comparison</h2>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full bg-card border rounded-xl overflow-hidden">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">Feature</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Traditional Networks</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Chicago Forest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonData.map((row, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="px-6 py-4 font-medium">{row.feature}</td>
                  <td className="px-6 py-4 text-red-400">{row.traditional}</td>
                  <td className="px-6 py-4 text-green-400">{row.chicagoForest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Threat Model */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Threat Model</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Understanding what onion routing protects against - and what it does not.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card border border-green-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <span>&#10003;</span> Protected Against
              </h3>
              <ul className="space-y-3">
                <li className="text-sm text-muted-foreground">
                  <strong>Local network surveillance</strong> - Your ISP cannot see what you are accessing
                </li>
                <li className="text-sm text-muted-foreground">
                  <strong>Server-side tracking</strong> - Servers see relay IP, not yours
                </li>
                <li className="text-sm text-muted-foreground">
                  <strong>Traffic analysis by single observer</strong> - No single point can see full picture
                </li>
                <li className="text-sm text-muted-foreground">
                  <strong>Content inspection</strong> - All data is encrypted end-to-end
                </li>
                <li className="text-sm text-muted-foreground">
                  <strong>Metadata correlation</strong> - Traffic padding hides patterns
                </li>
              </ul>
            </div>

            <div className="bg-card border border-red-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                <span>&#10007;</span> Limitations
              </h3>
              <ul className="space-y-3">
                <li className="text-sm text-muted-foreground">
                  <strong>Global adversary</strong> - An observer controlling all relays can correlate traffic
                </li>
                <li className="text-sm text-muted-foreground">
                  <strong>Endpoint compromise</strong> - If your device is compromised, privacy is lost
                </li>
                <li className="text-sm text-muted-foreground">
                  <strong>User error</strong> - Logging into personal accounts de-anonymizes you
                </li>
                <li className="text-sm text-muted-foreground">
                  <strong>Application leaks</strong> - Applications may leak identifying information
                </li>
                <li className="text-sm text-muted-foreground">
                  <strong>Performance</strong> - Multi-hop routing adds latency
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Start Building Privacy-First Apps</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Use our anon-routing package to add Tor-like privacy to your applications.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/get-started"
              className="px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/packages"
              className="px-6 py-3 bg-card border font-medium rounded-lg hover:bg-muted transition-colors"
            >
              View Packages
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
