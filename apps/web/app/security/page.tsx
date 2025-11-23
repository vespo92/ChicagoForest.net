/**
 * Security Dashboard Page
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * This page describes conceptual security mechanisms for the Chicago Forest Network.
 */

import Disclaimer from '../../components/Disclaimer';
import Link from 'next/link';

export const metadata = {
  title: 'Sentinel Security Dashboard - Chicago Forest Network',
  description: 'Comprehensive security orchestration, threat detection, and privacy protection for the Chicago Forest Network',
};

const securityFeatures = [
  {
    icon: '🔐',
    title: 'Cryptographic Core',
    description: 'Production-grade encryption using audited libraries',
    features: [
      'ChaCha20-Poly1305 authenticated encryption',
      'X25519 key exchange (ECDH)',
      'HKDF key derivation',
      'Ed25519 signatures',
    ],
    code: `import { encrypt, decrypt, generateSecretKey } from '@chicago-forest/sentinel/crypto';

const key = generateSecretKey();
const encrypted = encrypt('Hello, Forest!', key);
const decrypted = decrypt(encrypted, key);`,
  },
  {
    icon: '🛡️',
    title: 'Threat Detection',
    description: 'Real-time intrusion monitoring and anomaly detection',
    features: [
      'Pattern-based intrusion detection',
      'DDoS and brute-force protection',
      'Sybil and eclipse attack detection',
      'Reputation-based peer blocking',
    ],
    code: `import { ThreatMonitor } from '@chicago-forest/sentinel/threat';

const monitor = new ThreatMonitor({
  sensitivity: 'high',
  enableAutoBlock: true,
});

monitor.on('threat:detected', (event) => {
  console.log(\`Threat: \${event.type} from \${event.sourceId}\`);
});`,
  },
  {
    icon: '📋',
    title: 'Audit Logging',
    description: 'Tamper-evident security event logging',
    features: [
      'Hash-chain integrity verification',
      'Security event categorization',
      'Compliance-ready exports',
      'Privacy-preserving storage',
    ],
    code: `import { AuditLogger } from '@chicago-forest/sentinel/audit';

const logger = new AuditLogger({ retentionDays: 90 });

await logger.logAuth('login', true, 'CFN-abc123');
const integrity = logger.verifyIntegrity();`,
  },
  {
    icon: '👤',
    title: 'Privacy Protection',
    description: 'PII detection, anonymization, and consent management',
    features: [
      'Automatic PII detection',
      'Multiple anonymization methods',
      'GDPR-style consent tracking',
      'Data retention policies',
    ],
    code: `import { PrivacyGuard, scrubPII } from '@chicago-forest/sentinel/privacy';

const guard = new PrivacyGuard({ strictMode: true });
const pii = guard.detectPII(userMessage);
const cleaned = scrubPII(sensitiveData);`,
  },
];

const threatTypes = [
  { type: 'Port Scan', severity: 'medium', description: 'Rapid connection attempts to multiple ports' },
  { type: 'Brute Force', severity: 'high', description: 'Repeated authentication failures' },
  { type: 'DDoS Attempt', severity: 'critical', description: 'Distributed denial of service' },
  { type: 'Replay Attack', severity: 'high', description: 'Duplicate message signatures' },
  { type: 'Sybil Attack', severity: 'high', description: 'Multiple identities from same source' },
  { type: 'Protocol Violation', severity: 'medium', description: 'Malformed or invalid messages' },
];

const securityStats = [
  { label: 'Encryption Algorithm', value: 'ChaCha20-Poly1305' },
  { label: 'Key Exchange', value: 'X25519 (ECDH)' },
  { label: 'Signatures', value: 'Ed25519' },
  { label: 'Key Derivation', value: 'HKDF-SHA256' },
  { label: 'Threat Detection', value: '6 Detection Rules' },
  { label: 'PII Types', value: '13 Categories' },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-900/30 via-background to-orange-900/20 py-20">
        <div className="absolute inset-0">
          {/* Animated shield */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-64 h-64 border-4 border-red-500 rounded-full animate-pulse" />
            <div className="absolute w-48 h-48 border-2 border-orange-500 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-2xl">🛡️</span>
              <span className="text-red-400 text-sm font-medium">Sentinel Security System</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              Security & Privacy
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Comprehensive security orchestration with threat detection, audit logging,
              and privacy protection for the Chicago Forest Network.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">Threat Detection Active</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">Audit Logging Enabled</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">Privacy Protection On</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Disclaimer />
      </div>

      {/* Security Stats */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {securityStats.map((stat, index) => (
            <div key={index} className="bg-card border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-sm font-bold text-cyan-400">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Security Features */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Security Modules</h2>

          <div className="max-w-5xl mx-auto space-y-8">
            {securityFeatures.map((feature) => (
              <div key={feature.title} className="bg-card border rounded-xl overflow-hidden">
                <div className="p-6 border-b flex items-center gap-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
                  <div className="p-6">
                    <h4 className="text-sm font-semibold mb-3 text-cyan-400">Capabilities</h4>
                    <ul className="space-y-2">
                      {feature.features.map((f, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="text-green-500">&#10003;</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6">
                    <h4 className="text-sm font-semibold mb-3 text-cyan-400">Example Usage</h4>
                    <pre className="bg-black/50 rounded-lg p-3 text-xs overflow-x-auto border border-white/10">
                      <code className="text-green-400">{feature.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Threat Detection */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Threat Detection Rules</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Built-in detection rules identify common attack patterns and automatically
          respond to protect the network.
        </p>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4">
          {threatTypes.map((threat, index) => (
            <div key={index} className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">{threat.type}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  threat.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                  threat.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {threat.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{threat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sentinel Architecture */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Sentinel Architecture</h2>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card border rounded-xl p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🔐</span>
                  </div>
                  <h3 className="font-bold mb-2">Crypto Layer</h3>
                  <p className="text-sm text-muted-foreground">
                    Encryption, signatures, key exchange using @noble libraries
                  </p>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/10 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🛡️</span>
                  </div>
                  <h3 className="font-bold mb-2">Detection Engine</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time threat analysis with pattern matching and anomaly detection
                  </p>
                </div>
                <div className="p-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <span className="text-3xl">👤</span>
                  </div>
                  <h3 className="font-bold mb-2">Privacy Guard</h3>
                  <p className="text-sm text-muted-foreground">
                    PII detection, anonymization, and consent management
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t text-center">
                <div className="inline-flex items-center gap-4 bg-green-500/10 border border-green-500/30 rounded-lg px-6 py-3">
                  <span className="text-2xl">🎯</span>
                  <div className="text-left">
                    <p className="font-bold text-green-400">Unified Security Controller</p>
                    <p className="text-sm text-muted-foreground">
                      The Sentinel class orchestrates all security components
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Defense in Depth */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Defense in Depth</h2>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Visual layers */}
            <div className="space-y-4">
              {[
                { layer: 'Network Layer', items: ['Firewall Rules', 'Rate Limiting', 'DDoS Protection'], color: 'red' },
                { layer: 'Identity Layer', items: ['Ed25519 Signatures', 'Node Authentication', 'Reputation System'], color: 'orange' },
                { layer: 'Transport Layer', items: ['ChaCha20-Poly1305', 'Perfect Forward Secrecy', 'Onion Routing'], color: 'yellow' },
                { layer: 'Application Layer', items: ['Audit Logging', 'PII Protection', 'Access Control'], color: 'green' },
              ].map((layer, index) => (
                <div
                  key={layer.layer}
                  className={`bg-${layer.color}-500/10 border border-${layer.color}-500/30 rounded-xl p-6`}
                  style={{
                    marginLeft: `${index * 20}px`,
                    marginRight: `${index * 20}px`,
                  }}
                >
                  <h3 className="font-bold mb-3">{layer.layer}</h3>
                  <div className="flex flex-wrap gap-2">
                    {layer.items.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 bg-background/50 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Quick Start</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Get started with the Sentinel security package in minutes.
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="bg-black/80 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground ml-2">sentinel-example.ts</span>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-green-400">{`import { Sentinel } from '@chicago-forest/sentinel';

// Create unified security controller
const sentinel = new Sentinel({
  enableThreatDetection: true,
  enableAuditLogging: true,
  enablePrivacyProtection: true,
});

// Start security services
await sentinel.start();

// Process incoming events
sentinel.threats?.on('threat:detected', (event) => {
  console.log(\`[ALERT] \${event.type}: \${event.description}\`);
});

// Log security events
await sentinel.log({
  category: 'authentication',
  action: 'login',
  actor: 'CFN-node123',
  success: true,
});

// Protect sensitive data
const safeMessage = sentinel.scrubPII(userMessage);

// Check blocked status
if (sentinel.isBlocked(suspiciousNode)) {
  console.log('Node is blocked');
}

// Get security status
const status = sentinel.getStatus();
console.log(\`Threats detected: \${status.threatMonitor.totalThreats}\`);`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Related Security Features</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore other security and privacy components of the Chicago Forest Network.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/privacy"
              className="px-6 py-3 bg-purple-500 text-white font-medium rounded-lg hover:bg-purple-600 transition-colors"
            >
              Privacy Architecture
            </Link>
            <Link
              href="/packages"
              className="px-6 py-3 bg-card border font-medium rounded-lg hover:bg-muted transition-colors"
            >
              View All Packages
            </Link>
            <Link
              href="/get-started"
              className="px-6 py-3 bg-card border font-medium rounded-lg hover:bg-muted transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
