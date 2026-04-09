import NetworkGrowthPlanner from "@/components/solar-tower/NetworkGrowthPlanner";
import RegionalBackboneExpansion from "@/components/solar-tower/RegionalBackboneExpansion";
import Link from "next/link";

export const metadata = {
  title:
    "Network Growth & Regional Expansion | Mendota Solar Tower | Chicago Forest Network",
  description:
    "Long-term network growth planning for the Mendota solar tower WISP. Dark fiber upgrade path, content caching, peering strategy, 6 GHz migration, and regional backbone expansion across northern Illinois.",
};

export default function NetworkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-emerald-950/10 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Link
                href="/solar-tower"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                &larr; Solar Tower
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                href="/solar-tower/WISP"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                WISP Launch Plan
              </Link>
            </div>
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-emerald-400 text-sm font-semibold">
                LONG-TERM NETWORK GROWTH
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Network Growth
              <br />
              & Regional Backbone
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              From one tower to a regional backbone. Dark fiber upgrade path, content caching,
              peering strategy, technology migration, and multi-site expansion modeling.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              The 5-year plan: 10G to 100G on the same fiber. 500 subs to 8,000+.
              Mendota to the Quad Cities.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">10G→100G</div>
                <div className="text-xs text-gray-400">Same Dark Fiber</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-400">~40%</div>
                <div className="text-xs text-gray-400">Traffic Cached Free</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-400">7 Sites</div>
                <div className="text-xs text-gray-400">Regional Backbone</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-amber-400">750K+</div>
                <div className="text-xs text-gray-400">Population Reach</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-400">6 GHz</div>
                <div className="text-xs text-gray-400">Next-Gen Migration</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-200">
            <strong className="text-amber-400">AI-Generated Planning Framework:</strong>{" "}
            This is a theoretical growth model for educational and planning purposes.
            Subscriber projections, revenue estimates, and expansion timelines are
            illustrative. Real-world outcomes depend on market conditions, competition,
            regulatory environment, and execution quality.
          </div>
        </div>
      </section>

      {/* Network Growth Planner */}
      <section id="growth" className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Bandwidth Growth & Fiber Planning
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-4">
            Model subscriber growth, usage trends, and fiber upgrade timing.
            Toggle content caches to see how free caching appliances extend your
            backhaul capacity by 30-40%.
          </p>
          <p className="text-sm text-emerald-400 text-center max-w-2xl mx-auto mb-8">
            Dark fiber is the only backhaul strategy where your capacity grows
            without your monthly cost changing. Upgrade the light, not the glass.
          </p>
          <NetworkGrowthPlanner />
        </div>
      </section>

      {/* Regional Backbone Expansion */}
      <section id="expansion" className="py-12 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Regional Backbone Expansion
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-4">
            Each PtP relay destination becomes its own tower site with local WISP coverage
            and carrier lease revenue. Toggle sites to model different expansion scenarios
            and see aggregate revenue, backhaul demand, and payback periods.
          </p>
          <p className="text-sm text-blue-400 text-center max-w-2xl mx-auto mb-8">
            The Mendota hub connects to 750,000+ people across northern Illinois.
            Every relay site replicates the model: tower + WISP + carrier leases.
          </p>
          <RegionalBackboneExpansion />
        </div>
      </section>

      {/* Page Navigation */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/solar-tower/WISP"
              className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 hover:bg-blue-500/20 transition block"
            >
              <div className="text-blue-400 font-bold mb-2">&larr; WISP Launch Plan</div>
              <p className="text-sm text-gray-400">
                Mixed-architecture capacity planning, subscriber modeling,
                bandwidth distribution, and initial backhaul design.
              </p>
            </Link>
            <Link
              href="/solar-tower"
              className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 hover:bg-amber-500/20 transition block"
            >
              <div className="text-amber-400 font-bold mb-2">&larr; Solar Tower Hub</div>
              <p className="text-sm text-gray-400">
                Tower site planning, RF link budget calculator,
                revenue model, and construction proposal.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Source Attribution */}
      <section className="py-8 px-4 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm text-gray-400">
            <strong className="text-gray-300">Sources:</strong>{" "}
            Fiber upgrade specifications based on IEEE 802.3 standards.
            Content caching programs:{" "}
            <a href="https://openconnect.netflix.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Netflix Open Connect
            </a>
            {" | "}
            <a href="https://peering.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Google Peering
            </a>
            . Internet exchange:{" "}
            <a href="https://www.chi-ix.net" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              CHI-IX Chicago
            </a>
            . Usage growth trends from{" "}
            <a href="https://www.sandvine.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Sandvine Global Internet Phenomena Report
            </a>
            . Equipment from{" "}
            <a href="https://www.cambiumnetworks.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Cambium Networks
            </a>
            {" | "}
            <a href="https://www.taranawireless.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Tarana Wireless
            </a>
            . Population data from U.S. Census Bureau.
          </div>
        </div>
      </section>
    </div>
  );
}
