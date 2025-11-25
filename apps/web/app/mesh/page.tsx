import Link from 'next/link'

export default function MeshNetworkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-green-950 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-green-400 text-sm font-semibold">REAL TECHNOLOGY • ACTIVE DEPLOYMENTS</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-6">
              Chicago Community
              <br />
              Mesh Network
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Build a resilient, decentralized internet that works when everything else fails.
              Based on proven technologies deployed in 40,000+ nodes worldwide.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/mesh#quickstart"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Get Started
              </Link>
              <Link
                href="/MESH_NETWORK_SPEC.md"
                target="_blank"
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition border border-slate-700"
              >
                Read Technical Spec
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Mesh? */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Why Build a Mesh Network?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-white mb-3">Resilience</h3>
              <p className="text-gray-400">
                When internet services fail—natural disasters, infrastructure attacks, ISP outages—the mesh keeps running.
                Self-healing, multi-path routing ensures connectivity.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-white mb-3">Decentralization</h3>
              <p className="text-gray-400">
                No single point of failure. No ISP gatekeepers. No surveillance chokepoints.
                Every node is equal. The network belongs to the community.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-white mb-3">Privacy</h3>
              <p className="text-gray-400">
                End-to-end encryption via Yggdrasil. No ISP monitoring. No centralized logs.
                Your traffic is yours—encrypted from source to destination.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Technology Stack
          </h2>
          <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8">
            <div className="space-y-6">
              {/* Layer 5 */}
              <div className="border-l-4 border-purple-500 pl-6">
                <h3 className="text-xl font-bold text-purple-400 mb-2">Layer 5: Applications</h3>
                <p className="text-gray-400 mb-2">
                  IPFS content distribution, local DNS (.mesh domains), chat, file sharing
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">IPFS</span>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">CoreDNS</span>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">mDNS</span>
                </div>
              </div>

              {/* Layer 4 */}
              <div className="border-l-4 border-blue-500 pl-6">
                <h3 className="text-xl font-bold text-blue-400 mb-2">Layer 4: Encrypted Overlay</h3>
                <p className="text-gray-400 mb-2">
                  Yggdrasil Network - End-to-end encrypted IPv6 routing with automatic peer discovery
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Yggdrasil</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">CJDNS (alt)</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">DHT Routing</span>
                </div>
              </div>

              {/* Layer 3 */}
              <div className="border-l-4 border-green-500 pl-6">
                <h3 className="text-xl font-bold text-green-400 mb-2">Layer 3: Mesh Routing</h3>
                <p className="text-gray-400 mb-2">
                  B.A.T.M.A.N. advanced - Layer 2 mesh with self-healing, multi-path routing
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">B.A.T.M.A.N. V</span>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Linux Kernel</span>
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">batctl</span>
                </div>
              </div>

              {/* Layer 2 */}
              <div className="border-l-4 border-yellow-500 pl-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">Layer 2: Physical Links</h3>
                <p className="text-gray-400 mb-2">
                  WiFi (802.11ac/ax), Ethernet (1Gbps+), Point-to-Point (5GHz/60GHz), LoRa (long-range)
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">802.11ac/ax</span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">802.11s</span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">Ethernet</span>
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">LoRaWAN</span>
                </div>
              </div>

              {/* Layer 1 */}
              <div className="border-l-4 border-red-500 pl-6">
                <h3 className="text-xl font-bold text-red-400 mb-2">Layer 1: Hardware</h3>
                <p className="text-gray-400 mb-2">
                  UniFi Access Points, UISP radios, Raspberry Pi nodes, OpenWrt routers
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">UniFi 6 LR</span>
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">UISP AirFiber</span>
                  <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">Raspberry Pi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CFN Addressing */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            CFN Addressing: Beyond IPv4/IPv6
          </h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-green-400 mb-4">Community Forest Network (CFN) Addresses</h3>
              <p className="text-gray-300 mb-6">
                A cryptographically-derived, proximity-aware addressing scheme designed for decentralized mesh networks.
              </p>
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-6 mb-6">
                <div className="font-mono text-green-400 text-xl mb-4">
                  cfn:dp3w:7a3f2b1c5d8e:8080
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-4">
                    <span className="text-gray-500 w-24">Prefix:</span>
                    <div>
                      <span className="text-white font-semibold">cfn</span>
                      <span className="text-gray-400 ml-2">- Network identifier</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-gray-500 w-24">Geo-hash:</span>
                    <div>
                      <span className="text-white font-semibold">dp3w</span>
                      <span className="text-gray-400 ml-2">- Proximity identifier (Chicago area)</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-gray-500 w-24">Node-ID:</span>
                    <div>
                      <span className="text-white font-semibold">7a3f2b1c5d8e</span>
                      <span className="text-gray-400 ml-2">- Cryptographic hash of public key</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-gray-500 w-24">Port:</span>
                    <div>
                      <span className="text-white font-semibold">8080</span>
                      <span className="text-gray-400 ml-2">- Service port (optional)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-600 rounded p-4">
                  <h4 className="font-bold text-white mb-2">✓ Self-Generated</h4>
                  <p className="text-gray-400 text-sm">No central authority needed. Derive from your public key.</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-600 rounded p-4">
                  <h4 className="font-bold text-white mb-2">✓ Proximity-Aware</h4>
                  <p className="text-gray-400 text-sm">Geo-hash enables efficient local routing and discovery.</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-600 rounded p-4">
                  <h4 className="font-bold text-white mb-2">✓ Cryptographically Secure</h4>
                  <p className="text-gray-400 text-sm">Addresses tied to public keys—impossible to spoof.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quickstart" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Quick Start Guide
          </h2>

          <div className="space-y-8">
            {/* Option 1: Raspberry Pi */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-green-400 mb-4">Option 1: Raspberry Pi Node ($100)</h3>
              <p className="text-gray-300 mb-4">
                Build a mesh node with consumer hardware in under 30 minutes.
              </p>
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-bold text-gray-400 mb-3">Hardware Needed:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Raspberry Pi 4 (4GB+) - $55</li>
                  <li>• WiFi 5GHz USB adapter - $25</li>
                  <li>• MicroSD card (32GB+) - $10</li>
                  <li>• Power supply - $10</li>
                </ul>
              </div>
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-4">
                <pre className="text-sm text-green-400 overflow-x-auto">
{`# Install Raspberry Pi OS Lite
# Then run:

curl -sSL https://mesh.chicagoforest.net/install.sh | sudo bash

# Configure your location
sudo mesh-config --lat 41.8781 --lon -87.6298 --name "MyNode"

# Join the network
sudo mesh-join chicago`}
                </pre>
              </div>
            </div>

            {/* Option 2: UniFi */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Option 2: UniFi Professional Deployment</h3>
              <p className="text-gray-300 mb-4">
                Deploy production-grade mesh using Ubiquiti UniFi hardware (NYC Mesh proven).
              </p>
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-bold text-gray-400 mb-3">Recommended Hardware:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• UniFi Dream Machine Pro - Gateway/router</li>
                  <li>• UniFi 6 LR Access Point - WiFi mesh nodes ($99 each)</li>
                  <li>• UniFi Switch 16 PoE - Wired backbone</li>
                  <li>• UISP LiteBeam 5AC Gen2 - Point-to-point links (optional)</li>
                </ul>
              </div>
              <div className="text-sm text-gray-300">
                <p className="mb-2"><strong className="text-white">Deployment Pattern:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• 1 wired AP per 2-3 mesh APs (reliability)</li>
                  <li>• Firmware 4.3.20 (critical - later versions break meshing)</li>
                  <li>• 5GHz for mesh backhaul, 2.4GHz for clients</li>
                  <li>• Max 1 wireless hop per path</li>
                </ul>
              </div>
            </div>

            {/* Option 3: OpenWrt */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Option 3: OpenWrt Router ($50-150)</h3>
              <p className="text-gray-300 mb-4">
                Flash consumer routers with open-source firmware for budget-friendly mesh nodes.
              </p>
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-400 mb-3">Compatible Routers:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• GL.iNet GL-AX1800 - $130 (pre-configured OpenWrt)</li>
                  <li>• TP-Link Archer C7 - $70</li>
                  <li>• Netgear Nighthawk R7800 - $150</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/MESH_NETWORK_SPEC.md"
              target="_blank"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Read Full Technical Specification →
            </Link>
          </div>
        </div>
      </section>

      {/* Real-World Examples */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            Proven Deployments Worldwide
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">NYC Mesh</h3>
              <p className="text-gray-400 text-sm mb-3">New York City, USA</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nodes:</span>
                  <span className="text-white font-semibold">1,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Members:</span>
                  <span className="text-white font-semibold">500+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Since:</span>
                  <span className="text-white font-semibold">2014</span>
                </div>
              </div>
              <a
                href="https://nycmesh.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-sm mt-4 block"
              >
                nycmesh.net →
              </a>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">Guifi.net</h3>
              <p className="text-gray-400 text-sm mb-3">Catalonia, Spain</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nodes:</span>
                  <span className="text-white font-semibold">37,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Links:</span>
                  <span className="text-white font-semibold">63,000 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Since:</span>
                  <span className="text-white font-semibold">2004</span>
                </div>
              </div>
              <a
                href="https://guifi.net/en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-sm mt-4 block"
              >
                guifi.net →
              </a>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">Freifunk</h3>
              <p className="text-gray-400 text-sm mb-3">Germany</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nodes:</span>
                  <span className="text-white font-semibold">40,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Protocol:</span>
                  <span className="text-white font-semibold">B.A.T.M.A.N.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Since:</span>
                  <span className="text-white font-semibold">2002</span>
                </div>
              </div>
              <a
                href="https://freifunk.net/en"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-sm mt-4 block"
              >
                freifunk.net →
              </a>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">Toronto Mesh</h3>
              <p className="text-gray-400 text-sm mb-3">Toronto, Canada</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nodes:</span>
                  <span className="text-white font-semibold">50+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Protocol:</span>
                  <span className="text-white font-semibold">CJDNS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Since:</span>
                  <span className="text-white font-semibold">2016</span>
                </div>
              </div>
              <a
                href="https://tomesh.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-sm mt-4 block"
              >
                tomesh.net →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Build the Decentralized Internet
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            This is REAL technology. These protocols work. The hardware exists.
            Communities worldwide are building this TODAY. You can too.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-3">Join the Community</h3>
              <p className="text-gray-400 text-sm mb-4">
                Connect with mesh network builders in Chicago and beyond.
              </p>
              <a
                href="https://discord.gg/chicagoforest"
                className="text-green-400 hover:text-green-300 text-sm font-semibold"
              >
                Discord →
              </a>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-3">Deploy a Node</h3>
              <p className="text-gray-400 text-sm mb-4">
                Install mesh software on Raspberry Pi or UniFi hardware.
              </p>
              <Link
                href="#quickstart"
                className="text-green-400 hover:text-green-300 text-sm font-semibold"
              >
                Installation Guide →
              </Link>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-3">Contribute Code</h3>
              <p className="text-gray-400 text-sm mb-4">
                Help improve mesh protocols and deployment tools.
              </p>
              <a
                href="https://github.com/vespo92/ChicagoForest.net"
                className="text-green-400 hover:text-green-300 text-sm font-semibold"
              >
                GitHub →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Let&apos;s Build This Together
          </h2>
          <p className="text-green-100 mb-6">
            Community-owned. Decentralized. Resilient. Free.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/MESH_NETWORK_SPEC.md"
              target="_blank"
              className="bg-white hover:bg-gray-100 text-green-600 px-6 py-3 rounded-lg font-semibold transition"
            >
              Technical Specification
            </Link>
            <a
              href="https://github.com/vespo92/ChicagoForest.net"
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
