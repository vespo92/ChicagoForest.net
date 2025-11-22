'use client';

/**
 * Protocol Explainer Component
 *
 * Educational content about the routing protocols used in Chicago Forest Network.
 */

import { useState } from 'react';

interface Protocol {
  id: string;
  name: string;
  shortName: string;
  color: string;
  description: string;
  useCases: string[];
  characteristics: {
    latency: 'low' | 'medium' | 'high';
    bandwidth: 'low' | 'medium' | 'high';
    privacy: 'low' | 'medium' | 'high';
    reliability: 'low' | 'medium' | 'high';
  };
  technicalDetails: string;
  realWorldBasis: string;
}

const PROTOCOLS: Protocol[] = [
  {
    id: 'dht',
    name: 'Distributed Hash Table (Kademlia)',
    shortName: 'DHT',
    color: 'green',
    description:
      'A distributed peer discovery protocol that enables nodes to find each other without central servers. Uses XOR distance metrics for efficient routing.',
    useCases: [
      'Peer discovery across the network',
      'Decentralized name resolution',
      'Content-addressable storage lookup',
      'Bootstrap node discovery',
    ],
    characteristics: {
      latency: 'medium',
      bandwidth: 'medium',
      privacy: 'low',
      reliability: 'high',
    },
    technicalDetails:
      'Based on Kademlia protocol with 128-bit node IDs, 128 routing buckets, and O(log n) lookup complexity. Implements periodic bucket refresh and peer timeout mechanisms.',
    realWorldBasis:
      'Used by BitTorrent, IPFS, Ethereum, and other major P2P networks. Originally described in the 2002 paper by Maymounkov and Mazieres.',
  },
  {
    id: 'mesh',
    name: 'Wireless Mesh Routing',
    shortName: 'MESH',
    color: 'blue',
    description:
      'Layer 2/3 mesh routing protocols for local wireless connectivity. Supports BATMAN-adv, OLSR, and Babel routing algorithms.',
    useCases: [
      'Local neighborhood connectivity',
      'WiFi mesh networking',
      'Community wireless networks',
      'Emergency communication networks',
    ],
    characteristics: {
      latency: 'low',
      bandwidth: 'high',
      privacy: 'low',
      reliability: 'medium',
    },
    technicalDetails:
      'Implements BATMAN-adv for Layer 2 mesh, OLSR for proactive routing, and Babel for distance-vector routing with loop avoidance. Supports channel hopping and link quality monitoring.',
    realWorldBasis:
      'BATMAN-adv is used by Freifunk community networks. OLSR powers many community mesh networks worldwide. Babel is used in mesh networks requiring mobility support.',
  },
  {
    id: 'sdwan',
    name: 'Software-Defined WAN',
    shortName: 'SD-WAN',
    color: 'purple',
    description:
      'Encrypted overlay tunnels with intelligent path selection. Provides secure connectivity across untrusted networks with traffic engineering capabilities.',
    useCases: [
      'Secure inter-node communication',
      'Multi-path redundancy',
      'Traffic engineering and QoS',
      'Bridging disparate networks',
    ],
    characteristics: {
      latency: 'low',
      bandwidth: 'high',
      privacy: 'medium',
      reliability: 'high',
    },
    technicalDetails:
      'Supports WireGuard, VXLAN, and custom Forest-Tunnel protocols. Implements path selection policies including lowest-latency, highest-bandwidth, and balanced modes.',
    realWorldBasis:
      'Inspired by enterprise SD-WAN solutions like VMware VeloCloud, Cisco Viptela, and open-source alternatives like Tailscale and WireGuard.',
  },
  {
    id: 'onion',
    name: 'Onion Routing',
    shortName: 'ONION',
    color: 'orange',
    description:
      'Anonymous multi-hop encrypted circuits for privacy-preserving communication. Each relay only knows the previous and next hop in the circuit.',
    useCases: [
      'Anonymous communication',
      'Privacy-sensitive traffic',
      'Censorship circumvention',
      'Hidden services',
    ],
    characteristics: {
      latency: 'high',
      bandwidth: 'low',
      privacy: 'high',
      reliability: 'medium',
    },
    technicalDetails:
      'Implements layered encryption with 3-6 hop circuits. Each layer is encrypted with the relay\'s key, providing forward secrecy. Includes traffic padding to resist traffic analysis.',
    realWorldBasis:
      'Based on the Tor network architecture, which has operated since 2002 and serves millions of users. Also draws from I2P and mixnet research.',
  },
  {
    id: 'direct',
    name: 'Direct Connection',
    shortName: 'DIRECT',
    color: 'cyan',
    description:
      'Point-to-point connections between nodes with direct network reachability. The fastest but least flexible routing option.',
    useCases: [
      'Same-network peers',
      'Low-latency requirements',
      'High-bandwidth transfers',
      'Trusted peer connections',
    ],
    characteristics: {
      latency: 'low',
      bandwidth: 'high',
      privacy: 'low',
      reliability: 'medium',
    },
    technicalDetails:
      'Uses direct TCP/UDP connections with optional TLS encryption. Requires both peers to have direct network reachability (no NAT traversal).',
    realWorldBasis:
      'Standard networking approach used when NAT is not an obstacle. Often used in conjunction with hole-punching techniques like STUN/TURN.',
  },
];

const LEVEL_COLORS = {
  low: 'bg-red-500/20 text-red-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-green-500/20 text-green-400',
};

export function ProtocolExplainer() {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  const selected = PROTOCOLS.find((p) => p.id === selectedProtocol);

  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Routing Protocols Explained</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The Chicago Forest Network leverages multiple proven routing protocols,
            each optimized for different use cases. Click on a protocol to learn more.
          </p>
        </div>

        {/* Protocol selector */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {PROTOCOLS.map((protocol) => {
            const colorClasses: Record<string, string> = {
              green: 'border-green-500 bg-green-500/10 text-green-400',
              blue: 'border-blue-500 bg-blue-500/10 text-blue-400',
              purple: 'border-purple-500 bg-purple-500/10 text-purple-400',
              orange: 'border-orange-500 bg-orange-500/10 text-orange-400',
              cyan: 'border-cyan-500 bg-cyan-500/10 text-cyan-400',
            };

            const isSelected = selectedProtocol === protocol.id;

            return (
              <button
                key={protocol.id}
                onClick={() =>
                  setSelectedProtocol(isSelected ? null : protocol.id)
                }
                className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                  isSelected
                    ? colorClasses[protocol.color]
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                {protocol.shortName}
              </button>
            );
          })}
        </div>

        {/* Protocol details */}
        {selected ? (
          <div className="max-w-4xl mx-auto bg-card border rounded-xl overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold mb-2">{selected.name}</h3>
              <p className="text-muted-foreground">{selected.description}</p>
            </div>

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Use cases */}
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-4">Use Cases</h4>
                <ul className="space-y-2">
                  {selected.useCases.map((useCase, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-cyan-500 mt-1">&#10003;</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Characteristics */}
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-4">Characteristics</h4>
                <div className="space-y-3">
                  {Object.entries(selected.characteristics).map(
                    ([key, level]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${LEVEL_COLORS[level]}`}
                        >
                          {level}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Technical details */}
            <div className="p-6 border-t">
              <h4 className="text-lg font-semibold mb-3">Technical Details</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {selected.technicalDetails}
              </p>

              <h4 className="text-lg font-semibold mb-3">Real-World Basis</h4>
              <p className="text-sm text-muted-foreground">
                {selected.realWorldBasis}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-card/50 border border-dashed rounded-xl p-12 text-center">
            <p className="text-muted-foreground">
              Select a protocol above to see detailed information
            </p>
          </div>
        )}

        {/* Protocol comparison table */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-center">Protocol Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full bg-card border rounded-xl overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Protocol</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Latency</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Bandwidth</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Privacy</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Reliability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PROTOCOLS.map((protocol) => (
                  <tr key={protocol.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{protocol.shortName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${LEVEL_COLORS[protocol.characteristics.latency]}`}>
                        {protocol.characteristics.latency}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${LEVEL_COLORS[protocol.characteristics.bandwidth]}`}>
                        {protocol.characteristics.bandwidth}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${LEVEL_COLORS[protocol.characteristics.privacy]}`}>
                        {protocol.characteristics.privacy}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${LEVEL_COLORS[protocol.characteristics.reliability]}`}>
                        {protocol.characteristics.reliability}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
