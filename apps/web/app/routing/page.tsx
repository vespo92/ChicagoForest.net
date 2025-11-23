/**
 * Routing Dashboard Page
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational purposes.
 * This dashboard displays simulated routing data and does not represent operational
 * network infrastructure.
 */

import Disclaimer from '../../components/Disclaimer';
import { RoutingDashboard } from '../../components/routing/RoutingDashboard';
import { RoutingHero } from '../../components/routing/RoutingHero';
import { ProtocolExplainer } from '../../components/routing/ProtocolExplainer';

export const metadata = {
  title: 'Routing Dashboard - Chicago Forest Network',
  description: 'Unified routing visualization for the Chicago Forest P2P Network - theoretical framework for educational purposes',
};

export default function RoutingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Disclaimer />

      <RoutingHero />

      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Unified Routing Dashboard</h2>
          <p className="text-muted-foreground max-w-3xl">
            The Chicago Forest Network integrates multiple routing protocols to provide
            resilient, decentralized connectivity. This dashboard visualizes the theoretical
            routing architecture that would enable peer-to-peer communication across the network.
          </p>
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-600 dark:text-amber-400 text-sm">
              <strong>Educational Note:</strong> All data shown below is simulated for demonstration
              purposes. This represents a conceptual framework, not operational infrastructure.
            </p>
          </div>
        </div>

        <RoutingDashboard />
      </section>

      <ProtocolExplainer />

      <section className="container mx-auto px-4 py-12">
        <div className="bg-card border rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-4">Routing Protocol Integration</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-3">Multi-Protocol Architecture</h4>
              <p className="text-muted-foreground mb-4">
                The unified routing layer aggregates routes from multiple protocols:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">&#8226;</span>
                  <span><strong>Kademlia DHT</strong> - Distributed peer discovery across the network</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">&#8226;</span>
                  <span><strong>Mesh Routing</strong> - BATMAN-adv, OLSR, Babel for local connectivity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500">&#8226;</span>
                  <span><strong>SD-WAN</strong> - Encrypted tunnels with intelligent path selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">&#8226;</span>
                  <span><strong>Onion Routing</strong> - Anonymous multi-hop circuits</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Path Selection Policies</h4>
              <p className="text-muted-foreground mb-4">
                Intelligent path selection based on configurable policies:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500">&#8226;</span>
                  <span><strong>Lowest Latency</strong> - Minimize round-trip time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500">&#8226;</span>
                  <span><strong>Highest Bandwidth</strong> - Maximize throughput</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500">&#8226;</span>
                  <span><strong>Balanced</strong> - Multi-factor optimization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500">&#8226;</span>
                  <span><strong>Multipath</strong> - Distribute across multiple routes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500">&#8226;</span>
                  <span><strong>Anonymous</strong> - Prioritize privacy via onion routing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
