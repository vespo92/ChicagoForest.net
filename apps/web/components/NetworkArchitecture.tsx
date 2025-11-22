"use client"

import { Radio, Wifi, Activity, Shield, Lock, Globe } from "lucide-react"

export default function NetworkArchitecture() {
  return (
    <section className="py-24 px-4 md:px-6 bg-secondary/5">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Revolutionary P2P Network Protocol
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Moving beyond traditional IPv4/IPv6 with a multi-layer protocol stack designed for energy and data transmission
          </p>
        </div>

        {/* Protocol Stack */}
        <div className="max-w-5xl mx-auto mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">Multi-Layer Protocol Stack</h3>
          
          <div className="space-y-4">
            {/* Layer 1 */}
            <div className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <Radio className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold mb-2">Layer 1: Electromagnetic Network Protocol (ENP)</h4>
                  <p className="text-muted-foreground mb-3">
                    Primary carrier wave using Tesla coil RF emissions (150-200 kHz) for both power and data transmission
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Frequency</div>
                      <div className="text-sm text-muted-foreground">150-200 kHz carrier</div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Modulation</div>
                      <div className="text-sm text-muted-foreground">QAM-256 on subcarriers</div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Range</div>
                      <div className="text-sm text-muted-foreground">5-10 km radius</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 2 */}
            <div className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <Wifi className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold mb-2">Layer 2: LoRaWAN Mesh Coordination</h4>
                  <p className="text-muted-foreground mb-3">
                    Long-range, low-power mesh network for control signaling and network coordination
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Frequency</div>
                      <div className="text-sm text-muted-foreground">915 MHz (US ISM)</div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Data Rate</div>
                      <div className="text-sm text-muted-foreground">0.3-50 kbps</div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Range</div>
                      <div className="text-sm text-muted-foreground">15+ km urban</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 3 */}
            <div className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <Activity className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold mb-2">Layer 3: Quantum Coherence Channel</h4>
                  <p className="text-muted-foreground mb-3">
                    Experimental quantum entanglement layer for instantaneous state synchronization
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Technology</div>
                      <div className="text-sm text-muted-foreground">Quantum dots</div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Entanglement</div>
                      <div className="text-sm text-muted-foreground">Bell state pairs</div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Latency</div>
                      <div className="text-sm text-muted-foreground">~0 ms theoretical</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layer 4 */}
            <div className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <Globe className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold mb-2">Layer 4: IPFS Content Distribution</h4>
                  <p className="text-muted-foreground mb-3">
                    Distributed content storage and retrieval using InterPlanetary File System
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Storage</div>
                      <div className="text-sm text-muted-foreground">Content-addressed</div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Redundancy</div>
                      <div className="text-sm text-muted-foreground">3x replication</div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded">
                      <div className="text-sm font-semibold">Gateway</div>
                      <div className="text-sm text-muted-foreground">HTTP bridge</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-card border">
            <Shield className="h-8 w-8 text-primary mb-4" />
            <h4 className="text-lg font-semibold mb-2">Byzantine Fault Tolerance</h4>
            <p className="text-sm text-muted-foreground">
              Consensus mechanism resistant to malicious nodes using practical BFT algorithms
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border">
            <Lock className="h-8 w-8 text-primary mb-4" />
            <h4 className="text-lg font-semibold mb-2">End-to-End Encryption</h4>
            <p className="text-sm text-muted-foreground">
              Quantum-resistant cryptography using lattice-based algorithms
            </p>
          </div>
          
          <div className="p-6 rounded-lg bg-card border">
            <Activity className="h-8 w-8 text-primary mb-4" />
            <h4 className="text-lg font-semibold mb-2">Self-Healing Mesh</h4>
            <p className="text-sm text-muted-foreground">
              Automatic route discovery and failover with sub-second convergence
            </p>
          </div>
        </div>

        {/* Protocol Specification */}
        <div className="mt-16 p-8 rounded-lg bg-card border">
          <h3 className="text-2xl font-semibold mb-6">Protocol Packet Structure</h3>
          <pre className="p-4 bg-secondary/50 rounded overflow-x-auto text-sm">
{`ENP Packet Format (Layer 1):
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Preamble │  Header  │ Payload  │   CRC    │   ECC    │
│ 16 bytes │ 32 bytes │ Variable │ 4 bytes  │ 32 bytes │
└──────────┴──────────┴──────────┴──────────┴──────────┘

Header Structure:
├─ Version (1 byte)
├─ Type (1 byte): POWER | DATA | CONTROL | QUANTUM
├─ Source Node ID (16 bytes)
├─ Destination Node ID (16 bytes)
├─ Sequence Number (4 bytes)
├─ Timestamp (8 bytes)
└─ Flags (2 bytes)`}
          </pre>
        </div>
      </div>
    </section>
  )
}