"use client"

import { FileText, Github, Download, ExternalLink } from "lucide-react"

export default function ProtocolSpecs() {
  const specs = [
    {
      title: "ENP Protocol Specification",
      version: "v0.1.0-alpha",
      description: "Electromagnetic Network Protocol for energy and data transmission",
      size: "2.4 MB",
      format: "PDF"
    },
    {
      title: "Node Hardware Requirements",
      version: "v0.1.0",
      description: "Technical specifications for building plasma forest nodes",
      size: "1.8 MB",
      format: "PDF"
    },
    {
      title: "Quantum Coherence Layer",
      version: "v0.0.1-experimental",
      description: "Experimental quantum entanglement protocol documentation",
      size: "3.2 MB",
      format: "PDF"
    },
    {
      title: "API Reference",
      version: "v0.1.0",
      description: "REST and GraphQL APIs for network interaction",
      size: "890 KB",
      format: "HTML"
    }
  ]

  return (
    <section className="py-24 px-4 md:px-6 bg-secondary/5">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Technical Documentation
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Open-source specifications and implementation guides for the Chicago Plasma Forest network
          </p>
        </div>

        {/* Research Link */}
        <div className="mb-8 p-6 rounded-lg bg-primary/5 border border-primary/20 text-center max-w-5xl mx-auto">
          <h3 className="text-xl font-semibold mb-3">Free Energy Research Foundation</h3>
          <p className="text-muted-foreground mb-4">
            Explore the complete archive of Tesla, Mallove, and Moray&apos;s revolutionary energy research
          </p>
          <a
            href="/free-energy"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span>View Research Archive</span>
          </a>
        </div>

        {/* Documentation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {specs.map((spec, idx) => (
            <div key={idx} className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <span className="text-sm text-muted-foreground">{spec.version}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{spec.title}</h3>
              <p className="text-muted-foreground mb-4">{spec.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{spec.format} • {spec.size}</span>
                <button className="flex items-center space-x-2 text-primary hover:underline">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Code Example */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6">Quick Start Example</h3>
          <div className="rounded-lg bg-card border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">Node.js / TypeScript</span>
              <button className="text-sm text-primary hover:underline">Copy Code</button>
            </div>
            <pre className="overflow-x-auto text-sm">
              <code>{`import { PlasmaNode, ENPProtocol } from '@chicago-forest/core';

// Initialize a new plasma forest node
const node = new PlasmaNode({
  nodeId: 'residential-001',
  location: { lat: 41.8781, lng: -87.6298 },
  type: 'residential',
  powerCapacity: 10, // kW
});

// Configure ENP protocol
const protocol = new ENPProtocol({
  frequency: 175000, // Hz
  modulation: 'QAM-256',
  encryption: 'lattice-based',
});

// Connect to the network
await node.connect(protocol);

// Start energy transmission
node.on('energyRequest', async (request) => {
  const { amount, destination } = request;
  await node.transmitEnergy(destination, amount);
});

// Handle incoming data packets
node.on('dataPacket', (packet) => {
  console.log('Received:', packet.payload);
});

// Join the mesh network
await node.joinMesh('chicago-north');`}</code>
            </pre>
          </div>
        </div>

        {/* GitHub Links */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <a
              href="https://github.com/vespo92/ChicagoForest.net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span>View on GitHub</span>
            </a>
            <a
              href="/docs"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Full Documentation</span>
            </a>
          </div>
        </div>

        {/* Implementation Timeline */}
        <div className="mt-16 max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold mb-8 text-center">Implementation Roadmap</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-24 text-right text-sm text-muted-foreground">Q1 2026</div>
              <div className="w-4 h-4 rounded-full bg-primary" />
              <div className="flex-1 p-4 rounded-lg bg-card border">
                <div className="font-semibold">Protocol Development</div>
                <div className="text-sm text-muted-foreground">ENP specification finalization and reference implementation</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 text-right text-sm text-muted-foreground">Q2 2026</div>
              <div className="w-4 h-4 rounded-full bg-primary/70" />
              <div className="flex-1 p-4 rounded-lg bg-card border">
                <div className="font-semibold">Pilot Deployment</div>
                <div className="text-sm text-muted-foreground">Initial 10-node test network in Lincoln Park</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 text-right text-sm text-muted-foreground">Q3 2026</div>
              <div className="w-4 h-4 rounded-full bg-primary/50" />
              <div className="flex-1 p-4 rounded-lg bg-card border">
                <div className="font-semibold">Community Expansion</div>
                <div className="text-sm text-muted-foreground">Open source hardware kits and community workshops</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-24 text-right text-sm text-muted-foreground">Q4 2026</div>
              <div className="w-4 h-4 rounded-full bg-primary/30" />
              <div className="flex-1 p-4 rounded-lg bg-card border">
                <div className="font-semibold">City-Wide Launch</div>
                <div className="text-sm text-muted-foreground">100+ nodes across Chicago neighborhoods</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}