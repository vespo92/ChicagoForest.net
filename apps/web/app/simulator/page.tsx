/**
 * Network Simulator Page
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * This page provides interactive simulation of the Chicago Forest Network concepts.
 */

import Disclaimer from '../../components/Disclaimer';
import Link from 'next/link';

export const metadata = {
  title: 'Network Simulator - Chicago Forest Network',
  description: 'Interactive network simulation, failure modeling, and propagation visualization for educational purposes',
};

const scenarios = [
  {
    name: 'Normal Operation',
    key: 'normalOperation',
    description: 'Standard network operation with low failure rates',
    nodeCount: 50,
    topology: 'mesh',
    category: 'basic',
  },
  {
    name: 'Educational Demo',
    key: 'educationalDemo',
    description: 'Slow-paced demo for learning network concepts',
    nodeCount: 15,
    topology: 'ring',
    category: 'basic',
  },
  {
    name: 'Cascading Failure',
    key: 'cascadingFailure',
    description: 'Simulate hub node failure and its network-wide effects',
    nodeCount: 100,
    topology: 'star',
    category: 'failure',
  },
  {
    name: 'Network Partition',
    key: 'networkPartition',
    description: 'Test network behavior during split-brain scenarios',
    nodeCount: 30,
    topology: 'mesh',
    category: 'failure',
  },
  {
    name: 'Sybil Attack',
    key: 'sybilAttack',
    description: 'Simulate malicious nodes flooding the network',
    nodeCount: 50,
    topology: 'mesh',
    category: 'attack',
  },
  {
    name: 'Eclipse Attack',
    key: 'eclipseAttack',
    description: 'Attackers isolating a target node from honest peers',
    nodeCount: 30,
    topology: 'mesh',
    category: 'attack',
  },
  {
    name: 'DDoS Attack',
    key: 'ddosAttack',
    description: 'Distributed denial of service on key nodes',
    nodeCount: 60,
    topology: 'star',
    category: 'attack',
  },
  {
    name: 'Spore Propagation',
    key: 'sporePropagation',
    description: 'Organic network growth through node germination',
    nodeCount: 5,
    topology: 'random',
    category: 'growth',
  },
];

const scaleTests = [
  { nodes: 100, description: 'Baseline neighborhood scale' },
  { nodes: 1000, description: 'City-scale deployment' },
  { nodes: 10000, description: 'Regional network stress test' },
];

const simulatorFeatures = [
  {
    icon: '🌐',
    title: 'Network Topology',
    description: 'Simulate various network topologies including mesh, star, ring, tree, and random configurations.',
  },
  {
    icon: '📉',
    title: 'Failure Modeling',
    description: 'Model packet loss, latency, node failures, and recovery patterns.',
  },
  {
    icon: '🎯',
    title: 'Attack Scenarios',
    description: 'Test network resilience against Sybil, Eclipse, DDoS, and routing attacks.',
  },
  {
    icon: '🌱',
    title: 'Growth Visualization',
    description: 'Visualize spore propagation and organic network expansion patterns.',
  },
  {
    icon: '📊',
    title: 'Scalability Testing',
    description: 'Stress test network performance from 100 to 10,000+ nodes.',
  },
  {
    icon: '📖',
    title: 'Educational Mode',
    description: 'Slow-paced demonstrations for learning and teaching network concepts.',
  },
];

const cliCommands = [
  { command: 'pnpm simulate list', description: 'List all available scenarios' },
  { command: 'pnpm simulate run normalOperation', description: 'Run normal operation scenario' },
  { command: 'pnpm simulate run sybilAttack', description: 'Run Sybil attack simulation' },
  { command: 'pnpm simulate stress', description: 'Run scalability stress tests' },
  { command: 'pnpm simulate demo', description: 'Run educational demonstration' },
];

export default function SimulatorPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-900/30 via-background to-purple-900/20 py-20">
        <div className="absolute inset-0">
          {/* Animated network visualization */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <svg className="w-96 h-96" viewBox="0 0 200 200">
              {/* Animated nodes */}
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const x = 100 + Math.cos(angle) * 70;
                const y = 100 + Math.sin(angle) * 70;
                return (
                  <g key={i}>
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="#22d3ee"
                      className="animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                    <line
                      x1="100"
                      y1="100"
                      x2={x}
                      y2={y}
                      stroke="#22d3ee"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="12" fill="#a855f7" className="animate-ping" style={{ animationDuration: '2s' }} />
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-2xl">🔬</span>
              <span className="text-cyan-400 text-sm font-medium">Agent 15: Simulator</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Network Simulator
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Interactive simulation of network behavior, failure modeling, and propagation
              visualization for testing and educational purposes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
                <span className="text-2xl">🌐</span>
                <span className="text-sm">5 Topologies</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
                <span className="text-2xl">⚔️</span>
                <span className="text-sm">4 Attack Types</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
                <span className="text-2xl">📊</span>
                <span className="text-sm">10K+ Node Scale</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Disclaimer />
      </div>

      {/* Simulator Features */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Simulation Capabilities</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {simulatorFeatures.map((feature, index) => (
            <div key={index} className="bg-card border rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scenarios Grid */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simulation Scenarios</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Pre-configured scenarios for testing various network conditions and attack vectors.
          </p>

          {/* Basic Scenarios */}
          <div className="max-w-5xl mx-auto mb-12">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-green-500">●</span> Basic Scenarios
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {scenarios.filter(s => s.category === 'basic').map((scenario) => (
                <div key={scenario.key} className="bg-card border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{scenario.name}</h4>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      {scenario.topology}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{scenario.description}</p>
                  <p className="text-xs text-muted-foreground">Nodes: {scenario.nodeCount}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Failure Scenarios */}
          <div className="max-w-5xl mx-auto mb-12">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-orange-500">●</span> Failure Scenarios
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {scenarios.filter(s => s.category === 'failure').map((scenario) => (
                <div key={scenario.key} className="bg-card border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{scenario.name}</h4>
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                      {scenario.topology}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{scenario.description}</p>
                  <p className="text-xs text-muted-foreground">Nodes: {scenario.nodeCount}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Attack Scenarios */}
          <div className="max-w-5xl mx-auto mb-12">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-red-500">●</span> Attack Scenarios
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {scenarios.filter(s => s.category === 'attack').map((scenario) => (
                <div key={scenario.key} className="bg-card border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-sm">{scenario.name}</h4>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                      {scenario.topology}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{scenario.description}</p>
                  <p className="text-xs text-muted-foreground">Nodes: {scenario.nodeCount}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Scenarios */}
          <div className="max-w-5xl mx-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-cyan-500">●</span> Growth Scenarios
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {scenarios.filter(s => s.category === 'growth').map((scenario) => (
                <div key={scenario.key} className="bg-card border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{scenario.name}</h4>
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded">
                      {scenario.topology}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{scenario.description}</p>
                  <p className="text-xs text-muted-foreground">Starting Nodes: {scenario.nodeCount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scalability Testing */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Scalability Testing</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Test network performance at various scales from neighborhood to regional deployments.
        </p>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {scaleTests.map((test, index) => (
            <div key={index} className="bg-card border rounded-xl p-6 text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {test.nodes.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">nodes</p>
              <p className="text-xs text-muted-foreground mt-2">{test.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-card border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Stress Test Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Avg Tick Time</p>
                <p className="text-sm font-mono">measured in ms</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Memory Usage</p>
                <p className="text-sm font-mono">MB per 1k nodes</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Throughput</p>
                <p className="text-sm font-mono">ops/second</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Partitions</p>
                <p className="text-sm font-mono">detected count</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLI Usage */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Command Line Interface</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Run simulations directly from your terminal using the CLI tool.
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="bg-black/80 rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground ml-2">terminal</span>
              </div>
              <div className="p-4 space-y-3">
                {cliCommands.map((cmd, index) => (
                  <div key={index} className="flex flex-col md:flex-row md:items-center gap-2">
                    <code className="text-cyan-400 text-sm font-mono">$ {cmd.command}</code>
                    <span className="text-xs text-muted-foreground md:ml-auto"># {cmd.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Programmatic Usage</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Use the simulator package in your own applications.
        </p>

        <div className="max-w-4xl mx-auto">
          <div className="bg-black/80 rounded-xl p-6 border border-white/10">
            <pre className="text-sm overflow-x-auto">
              <code className="text-green-400">{`import {
  NetworkSimulator,
  scenarios,
  generateVisualizationData,
  StressTester
} from '@chicago-forest/network-simulator';

// Create a simulator with custom config
const simulator = new NetworkSimulator({
  nodeCount: 50,
  networkTopology: 'mesh',
  failureRate: 0.01,
  recoveryRate: 0.1,
});

// Run simulation ticks
for (let i = 0; i < 100; i++) {
  const events = simulator.tick();

  for (const event of events) {
    console.log(\`[\${event.type}] \${event.nodeId}\`);
  }
}

// Get visualization data
const state = simulator.getState();
const vizData = generateVisualizationData(state);

// Or use a pre-defined scenario
const { config, events } = scenarios.sybilAttack;
const attackSim = new NetworkSimulator(config);

// Run scalability tests
const tester = new StressTester({
  nodeIncrements: [100, 500, 1000],
  ticksPerTest: 50,
});

const report = await tester.runScalabilityTest('random');
console.log(tester.formatReport(report));`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Visualization Outputs */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Visualization Outputs</h2>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-bold mb-4">ASCII Network Map</h3>
              <pre className="bg-black/50 rounded-lg p-4 text-xs font-mono text-green-400 overflow-x-auto">
{`    O     O        O
       O      O
    O     O     O      O
       O     O     O
O        O     O       O
    O        O     O
       O  O     O
    O        O     O

Legend: O=Online X=Offline`}
              </pre>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-bold mb-4">Metrics Summary</h3>
              <pre className="bg-black/50 rounded-lg p-4 text-xs font-mono text-cyan-400 overflow-x-auto">
{`=== Network Simulation Metrics ===
Tick: 150
Elapsed: 15000ms
Nodes: 47/50 online (94.0%)
Packets Sent: 1,234
Packets Lost: 23
Avg Latency: 45.23ms
Partitions: 0
================================`}
              </pre>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-bold mb-4">Mermaid Topology</h3>
              <pre className="bg-black/50 rounded-lg p-4 text-xs font-mono text-purple-400 overflow-x-auto">
{`graph TD
    node-0[node-0]:::online
    node-1[node-1]:::online
    node-2[node-2]:::offline
    node-0 --- node-1
    node-1 --- node-2

classDef online fill:#28a745
classDef offline fill:#dc3545`}
              </pre>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-bold mb-4">D3 Compatible Format</h3>
              <pre className="bg-black/50 rounded-lg p-4 text-xs font-mono text-yellow-400 overflow-x-auto">
{`{
  "nodes": [
    { "id": "node-0", "group": 1,
      "x": 100, "y": 50, "status": "online" },
    { "id": "node-1", "group": 1,
      "x": 150, "y": 80, "status": "online" }
  ],
  "links": [
    { "source": "node-0",
      "target": "node-1", "value": 1 }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Related Links */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Explore More</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Learn about other components of the Chicago Forest Network ecosystem.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/mesh"
              className="px-6 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Mesh Network
            </Link>
            <Link
              href="/security"
              className="px-6 py-3 bg-card border font-medium rounded-lg hover:bg-muted transition-colors"
            >
              Security Dashboard
            </Link>
            <Link
              href="/packages"
              className="px-6 py-3 bg-card border font-medium rounded-lg hover:bg-muted transition-colors"
            >
              View All Packages
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
