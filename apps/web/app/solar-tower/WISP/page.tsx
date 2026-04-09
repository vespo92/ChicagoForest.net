import WISPCapacityPlanner from "@/components/solar-tower/WISPCapacityPlanner";
import BackhaulArchitecture from "@/components/solar-tower/BackhaulArchitecture";
import Link from "next/link";

export const metadata = {
  title:
    "WISP Capacity & Backhaul Planning | Mendota Solar Tower | Chicago Forest Network",
  description:
    "Interactive capacity planning for a mixed-architecture WISP deployment at the Mendota solar tower. Tarana G1, CBRS 3.5 GHz, and Ubiquiti LTU tiers with fiber and wireless backhaul modeling.",
};

export default function WISPPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950">
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
                href="/solar-tower/network"
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Network Growth &rarr;
              </Link>
            </div>
            <div className="inline-block bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6 ml-4">
              <span className="text-blue-400 text-sm font-semibold">
                WISP CAPACITY PLANNING
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent mb-6">
              Mixed-Architecture
              <br />
              WISP Design
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              Three-tier wireless ISP architecture combining Tarana G1, CBRS 3.5 GHz, and
              Ubiquiti LTU for the Mendota solar tower. Interactive capacity planning,
              bandwidth distribution, and backhaul modeling.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Every subscriber gets real broadband speeds. No more 25/5 Mbps plans.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-400">200/50</div>
                <div className="text-xs text-gray-400">Premium Mbps</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-400">100/20</div>
                <div className="text-xs text-gray-400">Standard Mbps</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-amber-400">50/10</div>
                <div className="text-xs text-gray-400">Basic Mbps</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-400">~500</div>
                <div className="text-xs text-gray-400">Total Subs</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-white">12</div>
                <div className="text-xs text-gray-400">Sectors (3 tiers)</div>
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
            This is a theoretical capacity model for educational and planning purposes.
            Equipment specifications are based on manufacturer datasheets. Real-world
            performance varies based on terrain, interference, weather, and deployment quality.
            Always validate with site surveys and professional RF engineering before purchasing equipment.
          </div>
        </div>
      </section>

      {/* Capacity Planner */}
      <section id="capacity" className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Subscriber Capacity Planner
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8">
            Configure each tier independently. Adjust subscriber counts, plan speeds, and
            pricing to model different scenarios. Watch sector utilization to avoid overloading.
          </p>
          <WISPCapacityPlanner />
        </div>
      </section>

      {/* Backhaul Architecture */}
      <section id="backhaul" className="py-12 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Backhaul & Transit Architecture
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-4">
            Fiber primary with wireless PtP backup ring. BGP multi-homing across two transit
            providers for automatic failover. Model different fiber options and backup link
            configurations.
          </p>
          <p className="text-sm text-blue-400 text-center max-w-2xl mx-auto mb-8">
            Dark fiber on the I-80/I-39 corridor is the best long-term play.
            10G optics today, upgrade to 100G by swapping a $300 SFP module.
          </p>
          <BackhaulArchitecture />
        </div>
      </section>

      {/* Regional Expansion Vision */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Regional Backbone Vision
          </h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <p className="text-gray-400 mb-6 text-center max-w-3xl mx-auto">
              Each PtP backhaul link destination becomes a potential tower site with
              its own WISP deployment. The Mendota tower is the junction hub - the
              first node in a regional backbone.
            </p>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  city: "LaSalle-Peru",
                  pop: "~20,000",
                  distance: "23 km",
                  phase: "Phase 1",
                  phaseColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
                  notes: "Closest relay. Fiber POP backup. Serves Illinois Valley.",
                },
                {
                  city: "DeKalb",
                  pop: "~45,000",
                  distance: "46 km",
                  phase: "Phase 2",
                  phaseColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
                  notes: "NIU campus. Gateway to Chicago metro. Student market.",
                },
                {
                  city: "Sterling-Rock Falls",
                  pop: "~22,000",
                  distance: "53 km",
                  phase: "Phase 2",
                  phaseColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
                  notes: "Western expansion. Path to Quad Cities market.",
                },
                {
                  city: "Rockford",
                  pop: "~150,000",
                  distance: "80 km",
                  phase: "Phase 3",
                  phaseColor: "text-green-400 border-green-500/30 bg-green-500/10",
                  notes: "Largest market in range. Metro fiber access. Big revenue potential.",
                },
              ].map((site) => (
                <div
                  key={site.city}
                  className={`rounded-lg p-4 border ${site.phaseColor}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{site.city}</span>
                    <span className="text-xs">{site.phase}</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div>Population: {site.pop}</div>
                    <div>Distance: {site.distance}</div>
                    <div className="pt-1 text-gray-300">{site.notes}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Each relay site replicates the mixed-architecture model: tower + WISP + carrier leases.
                Revenue compounds as the network grows. The backbone{" "}
                <strong className="text-gray-300">pays for itself</strong> through subscriber fees
                while the carrier leases are pure profit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Source Attribution */}
      <section className="py-8 px-4 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm text-gray-400">
            <strong className="text-gray-300">Equipment specifications sourced from:</strong>{" "}
            <a href="https://ui.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Ubiquiti (ui.com)
            </a>
            {" | "}
            <a href="https://www.taranawireless.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Tarana Wireless
            </a>
            {" | "}
            <a href="https://www.baicells.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Baicells (CBRS)
            </a>
            {" | "}
            <a href="https://www.fcc.gov/wireless/bureau-divisions/mobility-division/35-ghz-band/35-ghz-band-overview" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              FCC CBRS Band Overview
            </a>
            . Pricing estimates based on WISP industry benchmarks and publicly available MSRP.
            Transit pricing reflects typical Midwest US rates (2024-2026).
          </div>
        </div>
      </section>
    </div>
  );
}
