"use client";

import { useState, useMemo } from "react";

interface RelaySite {
  id: string;
  city: string;
  population: number;
  distanceFromMendota: number;
  bearing: string;
  phase: number;
  phaseYear: number;
  towerCost: number;
  fiberAvailable: boolean;
  localSubsPotential: number;
  avgRevPerSub: number;
  carrierLeaseMonthly: number;
  backhaulToMendotaMbps: number;
  notes: string;
  tiers: string[]; // which radio tiers to deploy
  competitors: string[]; // existing ISPs in the market
  marketGap: string; // what's missing that we fill
}

const relaySites: RelaySite[] = [
  {
    id: "lasalle",
    city: "LaSalle-Peru",
    population: 20000,
    distanceFromMendota: 23,
    bearing: "S",
    phase: 1,
    phaseYear: 2026,
    towerCost: 200000,
    fiberAvailable: true,
    localSubsPotential: 400,
    avgRevPerSub: 70,
    carrierLeaseMonthly: 5000,
    backhaulToMendotaMbps: 1000,
    notes: "First relay. Illinois Valley market. Fiber POP backup for Mendota. Immediate revenue.",
    tiers: ["Cambium 6 GHz", "LTU 5 GHz", "MikroTik 60G (downtown)"],
    competitors: ["Comcast", "AT&T DSL", "T-Mobile Home Internet"],
    marketGap: "No fiber ISP. Comcast monopoly pricing. DSL max 25 Mbps. We offer 50-200 Mbps at lower cost.",
  },
  {
    id: "dekalb",
    city: "DeKalb",
    population: 45000,
    distanceFromMendota: 46,
    bearing: "NE",
    phase: 2,
    phaseYear: 2027,
    towerCost: 250000,
    fiberAvailable: true,
    localSubsPotential: 800,
    avgRevPerSub: 75,
    carrierLeaseMonthly: 6000,
    backhaulToMendotaMbps: 750,
    notes: "NIU campus = student market. Gateway to Chicago peering. High sub density.",
    tiers: ["Tarana G1", "Cambium 6 GHz", "CBRS", "MikroTik 60G (campus area)"],
    competitors: ["Comcast", "Sparklight (Cable One)", "NIU campus WiFi"],
    marketGap: "Student housing off-campus underserved. Sparklight speeds are poor. We target 100-200 Mbps for students.",
  },
  {
    id: "sterling",
    city: "Sterling-Rock Falls",
    population: 22000,
    distanceFromMendota: 53,
    bearing: "W",
    phase: 2,
    phaseYear: 2027,
    towerCost: 200000,
    fiberAvailable: true,
    localSubsPotential: 400,
    avgRevPerSub: 65,
    carrierLeaseMonthly: 4000,
    backhaulToMendotaMbps: 500,
    notes: "Western expansion. Bridge to Quad Cities. Underserved market.",
    tiers: ["Cambium 6 GHz", "LTU 5 GHz"],
    competitors: ["Comcast", "Lumen DSL"],
    marketGap: "Rural areas around Sterling have no broadband options. Lumen DSL maxes at 10 Mbps.",
  },
  {
    id: "rockford",
    city: "Rockford",
    population: 150000,
    distanceFromMendota: 80,
    bearing: "N",
    phase: 3,
    phaseYear: 2028,
    towerCost: 350000,
    fiberAvailable: true,
    localSubsPotential: 2000,
    avgRevPerSub: 80,
    carrierLeaseMonthly: 8000,
    backhaulToMendotaMbps: 1200,
    notes: "Largest market in range. Metro area with multiple tower opportunities. Competitive market.",
    tiers: ["Tarana G1", "Cambium 6 GHz", "CBRS", "LTU 5 GHz", "MikroTik 60G"],
    competitors: ["Comcast", "AT&T Fiber (partial)", "Frontier", "T-Mobile 5G Home"],
    marketGap: "AT&T fiber only covers select neighborhoods. Outer suburbs and industrial areas underserved. Business market opportunity.",
  },
  {
    id: "ottawa",
    city: "Ottawa",
    population: 19000,
    distanceFromMendota: 30,
    bearing: "SE",
    phase: 2,
    phaseYear: 2027,
    towerCost: 180000,
    fiberAvailable: true,
    localSubsPotential: 350,
    avgRevPerSub: 65,
    carrierLeaseMonthly: 4000,
    backhaulToMendotaMbps: 750,
    notes: "Close to LaSalle-Peru. Can share backhaul. Starved Rock tourism area.",
    tiers: ["Cambium 6 GHz", "LTU 5 GHz"],
    competitors: ["Comcast", "Lumen DSL"],
    marketGap: "Tourism area (Starved Rock) with seasonal demand. Year-round residents have few options beyond Comcast.",
  },
  {
    id: "quadcities",
    city: "Quad Cities (via Sterling)",
    population: 380000,
    distanceFromMendota: 110,
    bearing: "W",
    phase: 3,
    phaseYear: 2029,
    towerCost: 400000,
    fiberAvailable: true,
    localSubsPotential: 3000,
    avgRevPerSub: 80,
    carrierLeaseMonthly: 10000,
    backhaulToMendotaMbps: 500,
    notes: "Massive metro market. Reached via Sterling relay. Mississippi River crossing complicates links.",
    tiers: ["Tarana G1", "Cambium 6 GHz", "CBRS", "LTU 5 GHz", "MikroTik 60G"],
    competitors: ["Mediacom", "Lumen", "Metronet (fiber, expanding)"],
    marketGap: "Metronet rolling out fiber but slow. Mediacom has reliability issues. Huge opportunity in Rock Island/Moline industrial corridor.",
  },
  {
    id: "peoria",
    city: "Peoria (via LaSalle)",
    population: 115000,
    distanceFromMendota: 100,
    bearing: "SW",
    phase: 3,
    phaseYear: 2029,
    towerCost: 300000,
    fiberAvailable: true,
    localSubsPotential: 1500,
    avgRevPerSub: 75,
    carrierLeaseMonthly: 7000,
    backhaulToMendotaMbps: 500,
    notes: "Reached via LaSalle-Peru relay. Large metro. Bradley University market.",
    tiers: ["Tarana G1", "Cambium 6 GHz", "CBRS", "LTU 5 GHz"],
    competitors: ["Comcast", "AT&T", "i3 Broadband (fiber, expanding)"],
    marketGap: "i3 Broadband building fiber but not citywide yet. Suburban areas outside fiber footprint are underserved. Bradley University area = student market.",
  },
];

export default function RegionalBackboneExpansion() {
  const [enabledSites, setEnabledSites] = useState<Record<string, boolean>>({
    lasalle: true,
    dekalb: true,
    sterling: true,
    ottawa: false,
    rockford: false,
    quadcities: false,
    peoria: false,
  });

  const toggleSite = (id: string) => {
    setEnabledSites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeSites = relaySites.filter((s) => enabledSites[s.id]);

  const analysis = useMemo(() => {
    // Mendota base (always included)
    const mendotaSubs = 500;
    const mendotaRevPerSub = 75;
    const mendotaCarrierLease = 8000;

    const totalSubs = mendotaSubs + activeSites.reduce((sum, s) => sum + s.localSubsPotential, 0);
    const totalISPRevenue =
      mendotaSubs * mendotaRevPerSub +
      activeSites.reduce((sum, s) => sum + s.localSubsPotential * s.avgRevPerSub, 0);
    const totalCarrierRevenue =
      mendotaCarrierLease + activeSites.reduce((sum, s) => sum + s.carrierLeaseMonthly, 0);
    const totalMonthlyRevenue = totalISPRevenue + totalCarrierRevenue;

    const totalTowerCapex = activeSites.reduce((sum, s) => sum + s.towerCost, 0);
    // Mendota tower + radios
    const mendotaCapex = 400000;
    const totalCapex = mendotaCapex + totalTowerCapex;

    const totalPopulationServed =
      7300 + activeSites.reduce((sum, s) => sum + s.population, 0);

    // Aggregate backhaul demand (all sites feed through Mendota)
    const totalBackhaulDemandMbps = activeSites.reduce(
      (sum, s) => sum + s.backhaulToMendotaMbps,
      0
    );

    // Phase breakdown
    const phases = [1, 2, 3].map((p) => {
      const phaseSites = activeSites.filter((s) => s.phase === p);
      return {
        phase: p,
        year: p === 1 ? 2026 : p === 2 ? 2027 : "2028+",
        sites: phaseSites,
        subs: phaseSites.reduce((sum, s) => sum + s.localSubsPotential, 0),
        capex: phaseSites.reduce((sum, s) => sum + s.towerCost, 0),
        monthlyRevenue: phaseSites.reduce(
          (sum, s) => sum + s.localSubsPotential * s.avgRevPerSub + s.carrierLeaseMonthly,
          0
        ),
      };
    });

    return {
      totalSubs,
      totalISPRevenue,
      totalCarrierRevenue,
      totalMonthlyRevenue,
      totalAnnualRevenue: totalMonthlyRevenue * 12,
      totalCapex,
      totalTowerCapex,
      totalPopulationServed,
      totalBackhaulDemandMbps,
      phases,
      paybackYears: Math.round((totalCapex / (totalMonthlyRevenue * 12)) * 10) / 10,
    };
  }, [enabledSites, activeSites]);

  const phaseColor = (phase: number) => {
    switch (phase) {
      case 1: return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
      case 2: return { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" };
      case 3: return { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" };
      default: return { text: "text-gray-400", bg: "bg-slate-800/50", border: "border-slate-700" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Network Map */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Regional Backbone Network
        </h3>
        <div className="bg-slate-900/50 rounded-lg p-6 font-mono text-xs leading-relaxed overflow-x-auto">
          <pre className="text-gray-300">
{`                                Rockford (150K pop)
                                ${enabledSites.rockford ? "[ ACTIVE ]" : "[ ------ ]"}
                                     |
                                     | 80km PtP
                                     |
       Quad Cities (380K)       MENDOTA HUB            DeKalb (45K)
       ${enabledSites.quadcities ? "[ ACTIVE ]" : "[ ------ ]"}            [ ORIGIN ]            ${enabledSites.dekalb ? "[ ACTIVE ]" : "[ ------ ]"}
            |                    /    |    \\                  |
            | via Sterling      /     |     \\     46km PtP   |
            |                  /      |      \\               |
       Sterling (22K)         /       |       \\         Chicago Peering
       ${enabledSites.sterling ? "[ ACTIVE ]" : "[ ------ ]"}        /        |        \\        (via fiber)
            53km PtP         /         |         \\
                            /          |          \\
                     Ottawa (19K)      |
                     ${enabledSites.ottawa ? "[ ACTIVE ]" : "[ ------ ]"}     |
                      30km PtP         |
                                       | 23km PtP
                                       |
                                  LaSalle-Peru (20K)
                                  ${enabledSites.lasalle ? "[ ACTIVE ]" : "[ ------ ]"}
                                       |
                                       | via relay
                                       |
                                  Peoria (115K)
                                  ${enabledSites.peoria ? "[ ACTIVE ]" : "[ ------ ]"}`}
          </pre>
        </div>
      </div>

      {/* Site Toggle Grid */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Relay Sites — Toggle to Model Expansion
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {relaySites.map((site) => {
            const colors = phaseColor(site.phase);
            return (
              <div
                key={site.id}
                className={`rounded-lg p-4 border transition ${
                  enabledSites[site.id]
                    ? `${colors.bg} ${colors.border}`
                    : "bg-slate-900/30 border-slate-700 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSite(site.id)}
                      className={`w-9 h-5 rounded-full transition ${
                        enabledSites[site.id] ? "bg-green-500" : "bg-slate-600"
                      } relative`}
                    >
                      <div
                        className={`absolute w-3.5 h-3.5 bg-white rounded-full top-[3px] transition ${
                          enabledSites[site.id] ? "left-[18px]" : "left-[3px]"
                        }`}
                      />
                    </button>
                    <span className="text-white font-semibold text-sm">{site.city}</span>
                  </div>
                  <span className={`text-xs ${colors.text}`}>Phase {site.phase} ({site.phaseYear})</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <span className="text-gray-500">Pop: </span>
                    <span className="text-white">{site.population.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Distance: </span>
                    <span className="text-white">{site.distanceFromMendota} km {site.bearing}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Potential subs: </span>
                    <span className="text-white">{site.localSubsPotential.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tower cost: </span>
                    <span className="text-white">${(site.towerCost / 1000).toFixed(0)}K</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ISP rev: </span>
                    <span className="text-white">${(site.localSubsPotential * site.avgRevPerSub).toLocaleString()}/mo</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Carrier lease: </span>
                    <span className="text-white">${site.carrierLeaseMonthly.toLocaleString()}/mo</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{site.notes}</p>

                {enabledSites[site.id] && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Tiers to deploy: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {site.tiers.map((tier) => (
                          <span key={tier} className={`text-xs px-1.5 py-0.5 rounded ${
                            tier.includes("Tarana") ? "bg-purple-500/20 text-purple-300" :
                            tier.includes("6 GHz") ? "bg-cyan-500/20 text-cyan-300" :
                            tier.includes("CBRS") ? "bg-blue-500/20 text-blue-300" :
                            tier.includes("60G") ? "bg-rose-500/20 text-rose-300" :
                            "bg-amber-500/20 text-amber-300"
                          }`}>{tier}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Competition: </span>
                      <span className="text-xs text-gray-400">{site.competitors.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Market gap: </span>
                      <span className="text-xs text-gray-300">{site.marketGap}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Aggregate Summary */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
          <div className="text-xs text-gray-400">Total Subscribers</div>
          <div className="text-3xl font-bold text-green-400">
            {analysis.totalSubs.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            Mendota (500) + {activeSites.length} relay sites
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
          <div className="text-xs text-gray-400">Monthly Revenue</div>
          <div className="text-2xl font-bold text-green-400">
            ${analysis.totalMonthlyRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            ISP: ${analysis.totalISPRevenue.toLocaleString()} + Carrier: ${analysis.totalCarrierRevenue.toLocaleString()}
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
          <div className="text-xs text-gray-400">Annual Revenue</div>
          <div className="text-2xl font-bold text-green-400">
            ${(analysis.totalAnnualRevenue / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-gray-500">
            ${analysis.totalAnnualRevenue.toLocaleString()}/yr
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <div className="text-xs text-gray-400">Total CapEx</div>
          <div className="text-2xl font-bold text-white">
            ${(analysis.totalCapex / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-gray-500">
            Mendota ($400K) + relays (${(analysis.totalTowerCapex / 1000).toFixed(0)}K)
          </div>
        </div>

        <div className={`rounded-lg p-5 border ${
          analysis.paybackYears <= 2
            ? "bg-green-500/10 border-green-500/30"
            : analysis.paybackYears <= 3
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-orange-500/10 border-orange-500/30"
        }`}>
          <div className="text-xs text-gray-400">Payback Period</div>
          <div className={`text-2xl font-bold ${
            analysis.paybackYears <= 2 ? "text-green-400" : analysis.paybackYears <= 3 ? "text-yellow-400" : "text-orange-400"
          }`}>
            {analysis.paybackYears} years
          </div>
          <div className="text-xs text-gray-500">
            At full projected subscriber counts
          </div>
        </div>
      </div>

      {/* Phase Breakdown */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Phased Deployment Timeline
        </h3>
        <div className="space-y-4">
          {analysis.phases.filter((p) => p.sites.length > 0).map((phase) => {
            const colors = phaseColor(phase.phase);
            return (
              <div key={phase.phase} className={`rounded-lg p-5 border ${colors.bg} ${colors.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${colors.text}`}>
                      Phase {phase.phase}: {phase.year}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {phase.sites.map((s) => s.city).join(", ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      +{phase.subs.toLocaleString()} subs
                    </div>
                    <div className={`text-sm ${colors.text}`}>
                      +${phase.monthlyRevenue.toLocaleString()}/mo
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">CapEx: </span>
                    <span className="text-white">${phase.capex.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Annual revenue: </span>
                    <span className="text-white">${(phase.monthlyRevenue * 12).toLocaleString()}/yr</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phase payback: </span>
                    <span className="text-white">
                      {phase.capex > 0
                        ? `${(phase.capex / (phase.monthlyRevenue * 12)).toFixed(1)} years`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backhaul Aggregation Warning */}
      <div className={`rounded-lg p-6 border ${
        analysis.totalBackhaulDemandMbps > 5000
          ? "bg-red-500/10 border-red-500/30"
          : analysis.totalBackhaulDemandMbps > 3000
            ? "bg-yellow-500/10 border-yellow-500/30"
            : "bg-slate-800/50 border-slate-700"
      }`}>
        <h3 className="text-lg font-bold text-white mb-2">
          Backhaul Aggregation at Mendota Hub
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          All relay sites feed traffic back through Mendota. As the network grows, the hub
          backhaul requirement grows with it. This is why dark fiber with upgradeable optics is critical.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Relay backhaul aggregate</div>
            <div className="text-2xl font-bold text-white font-mono">
              {(analysis.totalBackhaulDemandMbps / 1000).toFixed(1)} Gbps
            </div>
            <div className="text-xs text-gray-500">from {activeSites.length} relay sites</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">+ Mendota local demand</div>
            <div className="text-2xl font-bold text-white font-mono">~2-3 Gbps</div>
            <div className="text-xs text-gray-500">500 local subs at peak</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Total hub requirement</div>
            <div className={`text-2xl font-bold font-mono ${
              analysis.totalBackhaulDemandMbps + 2500 > 10000 ? "text-red-400" : "text-white"
            }`}>
              {((analysis.totalBackhaulDemandMbps + 2500) / 1000).toFixed(1)} Gbps
            </div>
            <div className="text-xs text-gray-500">
              {analysis.totalBackhaulDemandMbps + 2500 > 10000
                ? "Exceeds 10G - upgrade to 25G+ optics"
                : analysis.totalBackhaulDemandMbps + 2500 > 5000
                  ? "Approaching 10G limit"
                  : "Within 10G capacity"}
            </div>
          </div>
        </div>
      </div>

      {/* Population Reach */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Population Reach
        </h3>
        <div className="flex items-center gap-6">
          <div>
            <div className="text-4xl font-bold text-white">
              {analysis.totalPopulationServed.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">people in serviceable area</div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">
              Serviceable population by phase
            </div>
            <div className="w-full bg-slate-700 rounded-full h-6 flex overflow-hidden">
              {/* Mendota */}
              <div
                className="bg-amber-500 h-full flex items-center justify-center text-xs text-white font-semibold"
                style={{ width: `${(7300 / analysis.totalPopulationServed) * 100}%` }}
              >
                {(7300 / analysis.totalPopulationServed * 100) > 5 && "7.3K"}
              </div>
              {/* Phase 1 sites */}
              {activeSites.filter(s => s.phase === 1).map(s => (
                <div
                  key={s.id}
                  className="bg-amber-600 h-full flex items-center justify-center text-xs text-white"
                  style={{ width: `${(s.population / analysis.totalPopulationServed) * 100}%` }}
                >
                  {(s.population / analysis.totalPopulationServed * 100) > 5 && `${(s.population/1000).toFixed(0)}K`}
                </div>
              ))}
              {/* Phase 2 */}
              {activeSites.filter(s => s.phase === 2).map(s => (
                <div
                  key={s.id}
                  className="bg-blue-500 h-full flex items-center justify-center text-xs text-white"
                  style={{ width: `${(s.population / analysis.totalPopulationServed) * 100}%` }}
                >
                  {(s.population / analysis.totalPopulationServed * 100) > 5 && `${(s.population/1000).toFixed(0)}K`}
                </div>
              ))}
              {/* Phase 3 */}
              {activeSites.filter(s => s.phase === 3).map(s => (
                <div
                  key={s.id}
                  className="bg-green-500 h-full flex items-center justify-center text-xs text-white"
                  style={{ width: `${(s.population / analysis.totalPopulationServed) * 100}%` }}
                >
                  {(s.population / analysis.totalPopulationServed * 100) > 5 && `${(s.population/1000).toFixed(0)}K`}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-amber-500" /> Phase 1
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500" /> Phase 2
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" /> Phase 3
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
