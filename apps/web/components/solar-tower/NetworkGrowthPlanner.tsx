"use client";

import { useState, useMemo } from "react";

interface FiberUpgradeStep {
  id: string;
  name: string;
  capacityGbps: number;
  opticsCost: number;
  opticsType: string;
  yearAvailable: number;
  notes: string;
}

const fiberUpgradePath: FiberUpgradeStep[] = [
  {
    id: "10g",
    name: "10G SFP+ LR",
    capacityGbps: 10,
    opticsCost: 300,
    opticsType: "SFP+ 10GBASE-LR (1310nm)",
    yearAvailable: 2026,
    notes: "Launch day. Standard 10G optics, widely available, $150/each.",
  },
  {
    id: "25g",
    name: "25G SFP28 LR",
    capacityGbps: 25,
    opticsCost: 500,
    opticsType: "SFP28 25GBASE-LR",
    yearAvailable: 2027,
    notes: "Drop-in upgrade. Same fiber pair, swap optics + upgrade switch ports to SFP28.",
  },
  {
    id: "100g",
    name: "100G QSFP28 Coherent",
    capacityGbps: 100,
    opticsCost: 3000,
    opticsType: "QSFP28 100G-LR4 or Coherent ZR",
    yearAvailable: 2028,
    notes: "Same dark fiber. Coherent optics push 100G over single fiber pair. Need QSFP28 router ports.",
  },
  {
    id: "400g",
    name: "400G QSFP-DD ZR+",
    capacityGbps: 400,
    opticsCost: 8000,
    opticsType: "QSFP-DD 400G ZR+",
    yearAvailable: 2030,
    notes: "Endgame on single fiber pair. DWDM can push multiple 400G channels = terabits on one strand.",
  },
];

interface ContentCache {
  id: string;
  provider: string;
  trafficReduction: number; // percentage
  cost: string;
  requirements: string;
  description: string;
}

const contentCaches: ContentCache[] = [
  {
    id: "netflix",
    provider: "Netflix Open Connect",
    trafficReduction: 18,
    cost: "Free (Netflix provides hardware)",
    requirements: "~1,000+ subs, rack space, power, 10G port",
    description:
      "Netflix ships you an appliance pre-loaded with their content library. Serves streams locally instead of pulling from the internet. Handles ~15-20% of all internet traffic.",
  },
  {
    id: "google",
    provider: "Google Global Cache (GGC)",
    trafficReduction: 14,
    cost: "Free (Google provides hardware)",
    requirements: "~500+ subs, rack space, power, 10G port",
    description:
      "Caches YouTube, Google Play, Android updates, Chrome downloads locally. YouTube alone is 10-15% of traffic. Google is aggressive about deploying these.",
  },
  {
    id: "akamai",
    provider: "Akamai / Cloudflare Cache",
    trafficReduction: 8,
    cost: "Free-low cost (peering agreement)",
    requirements: "ASN + peering at IX or direct",
    description:
      "CDN edge caching for major web properties. Reduces latency and transit costs. Available through peering at Chicago IX.",
  },
  {
    id: "steam",
    provider: "Steam/Valve Cache",
    trafficReduction: 3,
    cost: "Free (community program)",
    requirements: "SteamCache/lancache container, local storage",
    description:
      "Cache game downloads (Steam, Epic, Microsoft, PlayStation). A single Call of Duty update is 50-100 GB x number of gamers. Saves massive burst bandwidth.",
  },
  {
    id: "microsoft",
    provider: "Microsoft Connected Cache",
    trafficReduction: 5,
    cost: "Free",
    requirements: "Linux server or container",
    description:
      "Caches Windows Updates, Office 365 downloads, Xbox updates. Patch Tuesday can spike bandwidth significantly across hundreds of subscribers.",
  },
];

interface PeeringOption {
  name: string;
  location: string;
  reachVia: string;
  benefit: string;
  cost: string;
}

const peeringOptions: PeeringOption[] = [
  {
    name: "Chicago IX (CHI-IX)",
    location: "350 E Cermak, Chicago",
    reachVia: "DeKalb PtP → Chicago fiber",
    benefit: "Direct peering with major content providers, reduced transit costs",
    cost: "$500-1,000/mo port fee + cross-connect",
  },
  {
    name: "Equinix Chicago",
    location: "350 E Cermak, Chicago",
    reachVia: "DeKalb PtP → Chicago fiber",
    benefit: "Private peering with Netflix, Google, AWS, Azure, Cloudflare",
    cost: "$1,500-3,000/mo (cabinet + cross-connects)",
  },
  {
    name: "Hurricane Electric (HE)",
    location: "Distributed / tunnel",
    reachVia: "Any internet connection",
    benefit: "Free IPv6 transit, BGP looking glass, route server",
    cost: "Free (tunnel) / $200/mo (direct)",
  },
];

export default function NetworkGrowthPlanner() {
  const [startYear] = useState(2026);
  const [initialSubs, setInitialSubs] = useState(300);
  const [subGrowthPct, setSubGrowthPct] = useState(40);
  const [usageGrowthPct, setUsageGrowthPct] = useState(28);
  const [avgUsageMbps, setAvgUsageMbps] = useState(3);
  const [peakMultiplier, setPeakMultiplier] = useState(3.5);
  const [enabledCaches, setEnabledCaches] = useState<Record<string, boolean>>({
    netflix: true,
    google: true,
    akamai: false,
    steam: false,
    microsoft: false,
  });

  const toggleCache = (id: string) => {
    setEnabledCaches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalCacheReduction = useMemo(() => {
    return contentCaches
      .filter((c) => enabledCaches[c.id])
      .reduce((sum, c) => sum + c.trafficReduction, 0);
  }, [enabledCaches]);

  const projections = useMemo(() => {
    const years: Array<{
      year: number;
      subs: number;
      avgUsage: number;
      peakDemandGbps: number;
      cachedDemandGbps: number;
      fiberStep: FiberUpgradeStep;
      headroomPct: number;
      status: "comfortable" | "tight" | "maxed" | "oversubscribed";
    }> = [];

    for (let i = 0; i < 6; i++) {
      const year = startYear + i;
      const subs = Math.round(initialSubs * Math.pow(1 + subGrowthPct / 100, i));
      const usage = avgUsageMbps * Math.pow(1 + usageGrowthPct / 100, i);
      const peakDemandGbps = (subs * usage * peakMultiplier) / 1000;
      const cachedDemandGbps = peakDemandGbps * (1 - totalCacheReduction / 100);

      // Find the right fiber step for this year
      const availableSteps = fiberUpgradePath.filter((s) => s.yearAvailable <= year);
      const fiberStep = availableSteps[availableSteps.length - 1];

      const headroomPct = ((fiberStep.capacityGbps - cachedDemandGbps) / fiberStep.capacityGbps) * 100;

      let status: "comfortable" | "tight" | "maxed" | "oversubscribed";
      if (headroomPct > 40) status = "comfortable";
      else if (headroomPct > 15) status = "tight";
      else if (headroomPct > 0) status = "maxed";
      else status = "oversubscribed";

      years.push({
        year,
        subs,
        avgUsage: Math.round(usage * 10) / 10,
        peakDemandGbps: Math.round(peakDemandGbps * 10) / 10,
        cachedDemandGbps: Math.round(cachedDemandGbps * 10) / 10,
        fiberStep,
        headroomPct: Math.round(headroomPct),
        status,
      });
    }

    return years;
  }, [initialSubs, subGrowthPct, usageGrowthPct, avgUsageMbps, peakMultiplier, totalCacheReduction, startYear]);

  const statusColor = (status: string) => {
    switch (status) {
      case "comfortable": return "text-green-400";
      case "tight": return "text-yellow-400";
      case "maxed": return "text-orange-400";
      case "oversubscribed": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case "comfortable": return "bg-green-500";
      case "tight": return "bg-yellow-500";
      case "maxed": return "bg-orange-500";
      case "oversubscribed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-8">
      {/* Dark Fiber Upgrade Path */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-2">
          Dark Fiber Upgrade Path
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          One fiber pair. Four generations of optics. Same glass from 2026 to 2030+.
          You never outgrow the fiber — you just upgrade the light.
        </p>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-slate-700 rounded" />
          <div className="grid grid-cols-4 gap-4 relative">
            {fiberUpgradePath.map((step, i) => (
              <div key={step.id} className="relative pt-12">
                {/* Dot on timeline */}
                <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 ${
                  i === 0
                    ? "bg-green-500 border-green-400"
                    : "bg-slate-800 border-slate-500"
                }`}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                    {step.yearAvailable}
                  </div>
                </div>

                <div className={`rounded-lg p-4 border ${
                  i === 0
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-slate-900/50 border-slate-700"
                }`}>
                  <div className="text-lg font-bold text-white mb-1">
                    {step.capacityGbps}G
                  </div>
                  <div className="text-xs text-blue-400 mb-2">{step.opticsType}</div>
                  <div className="text-xs text-gray-400 mb-2">
                    Optics cost: <span className="text-white">${step.opticsCost.toLocaleString()}</span> (pair)
                  </div>
                  <p className="text-xs text-gray-500">{step.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-sm text-gray-400">
          <strong className="text-green-400">Key insight:</strong> Going from 10G to 100G on
          dark fiber costs ~$3,000 in optics. The same upgrade on lit service means renegotiating
          a contract at 5-10x the monthly cost. Dark fiber pays for itself within the first upgrade cycle.
        </div>
      </div>

      {/* Growth Parameters */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Growth Projection Parameters
        </h3>
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Launch subscribers</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min="100" max="800" step="50"
                value={initialSubs}
                onChange={(e) => setInitialSubs(parseInt(e.target.value))}
                className="flex-1 accent-green-500"
              />
              <span className="text-white font-mono text-sm w-12 text-right">{initialSubs}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Sub growth %/year</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min="10" max="80" step="5"
                value={subGrowthPct}
                onChange={(e) => setSubGrowthPct(parseInt(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-white font-mono text-sm w-12 text-right">{subGrowthPct}%</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Usage growth %/year</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min="10" max="50" step="2"
                value={usageGrowthPct}
                onChange={(e) => setUsageGrowthPct(parseInt(e.target.value))}
                className="flex-1 accent-purple-500"
              />
              <span className="text-white font-mono text-sm w-12 text-right">{usageGrowthPct}%</span>
            </div>
            <div className="text-xs text-gray-600">Industry avg: 25-30%</div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Avg usage (Mbps/sub)</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min="1" max="10" step="0.5"
                value={avgUsageMbps}
                onChange={(e) => setAvgUsageMbps(parseFloat(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <span className="text-white font-mono text-sm w-12 text-right">{avgUsageMbps}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Peak multiplier</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min="2" max="5" step="0.5"
                value={peakMultiplier}
                onChange={(e) => setPeakMultiplier(parseFloat(e.target.value))}
                className="flex-1 accent-red-500"
              />
              <span className="text-white font-mono text-sm w-12 text-right">{peakMultiplier}x</span>
            </div>
            <div className="text-xs text-gray-600">Evening prime time</div>
          </div>
        </div>
      </div>

      {/* 5-Year Projection Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          5-Year Bandwidth Projection
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-gray-400 font-normal">Year</th>
                <th className="text-right py-2 text-gray-400 font-normal">Subscribers</th>
                <th className="text-right py-2 text-gray-400 font-normal">Avg Usage</th>
                <th className="text-right py-2 text-gray-400 font-normal">Peak Demand</th>
                <th className="text-right py-2 text-gray-400 font-normal">After Caching</th>
                <th className="text-right py-2 text-gray-400 font-normal">Fiber Tier</th>
                <th className="text-right py-2 text-gray-400 font-normal">Headroom</th>
                <th className="text-right py-2 text-gray-400 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => (
                <tr key={p.year} className="border-b border-slate-700/50">
                  <td className="py-3 text-white font-semibold">{p.year}</td>
                  <td className="py-3 text-right text-white font-mono">{p.subs.toLocaleString()}</td>
                  <td className="py-3 text-right text-gray-300 font-mono">{p.avgUsage} Mbps</td>
                  <td className="py-3 text-right text-white font-mono">{p.peakDemandGbps} Gbps</td>
                  <td className="py-3 text-right text-blue-400 font-mono">{p.cachedDemandGbps} Gbps</td>
                  <td className="py-3 text-right text-white font-mono">{p.fiberStep.capacityGbps}G</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${statusBg(p.status)}`}
                          style={{ width: `${Math.max(Math.min(100 - p.headroomPct, 100), 0)}%` }}
                        />
                      </div>
                      <span className={`font-mono ${statusColor(p.status)}`}>
                        {p.headroomPct > 0 ? `${p.headroomPct}%` : "OVER"}
                      </span>
                    </div>
                  </td>
                  <td className={`py-3 text-right font-semibold ${statusColor(p.status)}`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual bar chart */}
        <div className="mt-6 space-y-2">
          <div className="text-xs text-gray-500 mb-2">Peak demand vs. fiber capacity (with caching)</div>
          {projections.map((p) => (
            <div key={p.year} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-10">{p.year}</span>
              <div className="flex-1 relative h-6">
                {/* Fiber capacity background */}
                <div className="absolute inset-0 bg-slate-700/50 rounded" />
                {/* Demand bar */}
                <div
                  className={`absolute top-0 left-0 h-full rounded ${statusBg(p.status)} opacity-80`}
                  style={{
                    width: `${Math.min((p.cachedDemandGbps / p.fiberStep.capacityGbps) * 100, 100)}%`,
                  }}
                />
                {/* Labels */}
                <div className="absolute inset-0 flex items-center justify-between px-2 text-xs">
                  <span className="text-white font-mono">{p.cachedDemandGbps}G demand</span>
                  <span className="text-gray-400">{p.fiberStep.capacityGbps}G capacity</span>
                </div>
              </div>
              <span className="text-xs text-gray-500 w-16 text-right">{p.subs} subs</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content Caching */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Content Caching Layer</h3>
            <p className="text-sm text-gray-400">
              Cache popular content locally. Reduces transit costs and backhaul demand by{" "}
              <span className="text-blue-400 font-semibold">{totalCacheReduction}%</span>.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">{totalCacheReduction}%</div>
            <div className="text-xs text-gray-500">traffic saved</div>
          </div>
        </div>

        <div className="space-y-3">
          {contentCaches.map((cache) => (
            <div
              key={cache.id}
              className={`rounded-lg p-4 border transition ${
                enabledCaches[cache.id]
                  ? "bg-blue-500/5 border-blue-500/20"
                  : "bg-slate-900/30 border-slate-700 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCache(cache.id)}
                    className={`w-10 h-6 rounded-full transition ${
                      enabledCaches[cache.id] ? "bg-blue-500" : "bg-slate-600"
                    } relative`}
                  >
                    <div
                      className={`absolute w-4 h-4 bg-white rounded-full top-1 transition ${
                        enabledCaches[cache.id] ? "left-5" : "left-1"
                      }`}
                    />
                  </button>
                  <div>
                    <span className="text-white font-semibold">{cache.provider}</span>
                    <span className="text-green-400 text-xs ml-2">
                      -{cache.trafficReduction}% traffic
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{cache.cost}</span>
              </div>
              {enabledCaches[cache.id] && (
                <div className="ml-13 mt-2 grid md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">Requirements: </span>
                    <span className="text-gray-300">{cache.requirements}</span>
                  </div>
                  <div className="text-gray-400">{cache.description}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-sm">
          <strong className="text-blue-400">Impact:</strong>{" "}
          <span className="text-gray-400">
            With {totalCacheReduction}% caching, a 10G link effectively becomes{" "}
            <span className="text-white font-semibold">
              {Math.round(10 / (1 - totalCacheReduction / 100))}G
            </span>{" "}
            of equivalent capacity. Netflix + Google alone eliminate ~30% of transit traffic
            and they provide the hardware for free.
          </span>
        </div>
      </div>

      {/* Peering Strategy */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-2">
          Peering & Internet Exchange
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Peering at an Internet Exchange reduces transit costs and improves latency by connecting
          directly to content providers instead of routing through a transit middleman.
          The DeKalb PtP link is your path to Chicago&apos;s peering ecosystem.
        </p>

        <div className="space-y-3">
          {peeringOptions.map((peer) => (
            <div
              key={peer.name}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{peer.name}</span>
                <span className="text-xs text-gray-500">{peer.cost}</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Location: </span>
                  <span className="text-gray-300">{peer.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Reach via: </span>
                  <span className="text-blue-400">{peer.reachVia}</span>
                </div>
                <div>
                  <span className="text-gray-500">Benefit: </span>
                  <span className="text-gray-300">{peer.benefit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg text-sm text-gray-400">
          <strong className="text-white">Path to Chicago IX:</strong> Mendota → 46km PtP → DeKalb →
          fiber to Chicago (113km) → 350 E Cermak (Equinix/CHI-IX). Once peered, Netflix, Google,
          Cloudflare, and AWS traffic comes direct — no transit provider markup.
        </div>
      </div>

      {/* Technology Migration Timeline */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Radio Technology Migration Path
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Wireless technology moves fast. Plan for migration to next-gen platforms without
          disrupting existing subscribers.
        </p>

        <div className="space-y-4">
          {[
            {
              year: "2026",
              phase: "Launch",
              color: "border-amber-500/30 bg-amber-500/5",
              dot: "bg-amber-500",
              items: [
                { tech: "Tarana G1", band: "5 GHz", role: "Premium tier", status: "Deploy" },
                { tech: "Cambium ePMP 4500", band: "5 GHz", role: "Standard tier", status: "Deploy" },
                { tech: "Ubiquiti LTU Rocket", band: "5 GHz", role: "Basic tier", status: "Deploy" },
              ],
            },
            {
              year: "2027",
              phase: "6 GHz Migration",
              color: "border-blue-500/30 bg-blue-500/5",
              dot: "bg-blue-500",
              items: [
                { tech: "Cambium ePMP 4600", band: "6 GHz AFC", role: "Replace Standard tier", status: "Upgrade" },
                { tech: "MikroTik 60G mesh", band: "60 GHz", role: "In-town gigabit tier", status: "New tier" },
                { tech: "Wi-Fi 7 outdoor APs", band: "6 GHz", role: "Evaluate for CPE cost reduction", status: "Pilot" },
              ],
            },
            {
              year: "2028-29",
              phase: "Next-Gen",
              color: "border-purple-500/30 bg-purple-500/5",
              dot: "bg-purple-500",
              items: [
                { tech: "Tarana G2 (expected)", band: "5/6 GHz", role: "Premium tier upgrade", status: "Evaluate" },
                { tech: "Wi-Fi 7 PtMP", band: "6 GHz (320 MHz)", role: "High-capacity sectors", status: "Evaluate" },
                { tech: "5G FWA (CBRS)", band: "3.5 GHz", role: "If spectrum cost drops", status: "Watch" },
              ],
            },
            {
              year: "2030+",
              phase: "Future",
              color: "border-green-500/30 bg-green-500/5",
              dot: "bg-green-500",
              items: [
                { tech: "6G R&D", band: "Sub-THz", role: "Research phase", status: "Monitor" },
                { tech: "LEO satellite (Starlink)", band: "Ku/Ka", role: "Rural backup / gap fill", status: "Partner?" },
                { tech: "Free-space optical", band: "Optical", role: "Multi-Gbps PtP in clear weather", status: "Emerging" },
              ],
            },
          ].map((phase) => (
            <div key={phase.year} className={`rounded-lg p-4 border ${phase.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${phase.dot}`} />
                <span className="text-white font-bold">{phase.year}</span>
                <span className="text-gray-400 text-sm">— {phase.phase}</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {phase.items.map((item) => (
                  <div key={item.tech} className="bg-slate-800/50 rounded p-3 text-xs">
                    <div className="text-white font-semibold">{item.tech}</div>
                    <div className="text-blue-400">{item.band}</div>
                    <div className="text-gray-400 mt-1">{item.role}</div>
                    <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs ${
                      item.status === "Deploy"
                        ? "bg-green-500/20 text-green-400"
                        : item.status === "Upgrade"
                          ? "bg-blue-500/20 text-blue-400"
                          : item.status === "New tier"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-slate-600/50 text-gray-400"
                    }`}>
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Model */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-2">
          5-Year Financial Model
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Projected P&L based on subscriber growth, ARPU trends, and operational costs.
          Assumes mixed-architecture WISP with tower carrier leases.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-gray-400 font-normal">Year</th>
                <th className="text-right py-2 text-gray-400 font-normal">Subscribers</th>
                <th className="text-right py-2 text-gray-400 font-normal">ISP Revenue</th>
                <th className="text-right py-2 text-gray-400 font-normal">Carrier Leases</th>
                <th className="text-right py-2 text-gray-400 font-normal">Total Revenue</th>
                <th className="text-right py-2 text-gray-400 font-normal">OpEx</th>
                <th className="text-right py-2 text-gray-400 font-normal">Net Income</th>
                <th className="text-right py-2 text-gray-400 font-normal">Margin</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p, i) => {
                const subs = p.subs;
                const arpu = 75 - (i * 2); // ARPU trends down as basic tier grows faster
                const ispRevenue = subs * arpu * 12;
                // Carrier leases grow as we add relay sites
                const carrierLeaseAnnual = (8000 + i * 4000) * 12;
                const totalRevenue = ispRevenue + carrierLeaseAnnual;

                // OpEx components
                const transitCost = Math.max(600, p.cachedDemandGbps * 0.3 * 1000) * 12; // $/Mbps/mo x 12
                const fiberLease = 2500 * 12;
                const staffCost = i < 2 ? 45000 : i < 4 ? 90000 : 135000; // 0.5 FTE -> 1 FTE -> 1.5 FTE
                const power = (1200 + i * 400) * 12; // Tower power
                const insurance = 6000 + i * 2000;
                const maintenance = 12000 + subs * 5; // $5/sub/year for truck rolls, replacements
                const totalOpex = transitCost + fiberLease + staffCost + power + insurance + maintenance;

                const netIncome = totalRevenue - totalOpex;
                const margin = (netIncome / totalRevenue) * 100;

                return (
                  <tr key={p.year} className="border-b border-slate-700/50">
                    <td className="py-3 text-white font-semibold">{p.year}</td>
                    <td className="py-3 text-right text-white font-mono">{subs.toLocaleString()}</td>
                    <td className="py-3 text-right text-white font-mono">${(ispRevenue / 1000).toFixed(0)}K</td>
                    <td className="py-3 text-right text-gray-300 font-mono">${(carrierLeaseAnnual / 1000).toFixed(0)}K</td>
                    <td className="py-3 text-right text-white font-mono font-bold">${(totalRevenue / 1000).toFixed(0)}K</td>
                    <td className="py-3 text-right text-red-400 font-mono">${(totalOpex / 1000).toFixed(0)}K</td>
                    <td className={`py-3 text-right font-mono font-bold ${netIncome > 0 ? "text-green-400" : "text-red-400"}`}>
                      ${(netIncome / 1000).toFixed(0)}K
                    </td>
                    <td className={`py-3 text-right font-semibold ${margin > 30 ? "text-green-400" : margin > 0 ? "text-yellow-400" : "text-red-400"}`}>
                      {margin.toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* OpEx Breakdown */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-3">Monthly OpEx Breakdown (Year 1)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "Fiber lease", cost: 2500, note: "Dark fiber pair" },
              { name: "IP transit (2G)", cost: 600, note: "After caching savings" },
              { name: "Staff (0.5 FTE)", cost: 3750, note: "NOC/field tech" },
              { name: "Tower power", cost: 1200, note: "Radios + shelter" },
              { name: "Insurance", cost: 500, note: "Tower + E&O" },
              { name: "Maintenance", cost: 1000, note: "Truck rolls, spares" },
            ].map((item) => (
              <div key={item.name} className="bg-slate-900/50 rounded p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-400">{item.name}</span>
                  <span className="text-xs text-white font-mono">${item.cost.toLocaleString()}/mo</span>
                </div>
                <div className="text-xs text-gray-600">{item.note}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-sm bg-slate-900/50 rounded p-3">
            <span className="text-gray-300 font-semibold">Total monthly OpEx (Year 1):</span>
            <span className="text-white font-mono font-bold">~$9,550/mo</span>
          </div>
        </div>

        {/* CapEx & Break-Even */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-3">CapEx & Break-Even</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Total CapEx (Mendota only)</div>
              <div className="text-xl font-bold text-white">~$450K</div>
              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                <div>Tower: $250-400K</div>
                <div>Fiber bore: $15K</div>
                <div>Radio equipment: $25K</div>
                <div>Router/switching: $5K</div>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Monthly cash flow at 300 subs</div>
              <div className="text-xl font-bold text-green-400">+$21K/mo</div>
              <div className="text-xs text-gray-500 mt-1">
                Revenue ~$30.5K - OpEx ~$9.5K
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-1">Break-even (CapEx recovery)</div>
              <div className="text-xl font-bold text-green-400">~22 months</div>
              <div className="text-xs text-gray-500 mt-1">
                $450K / $21K = 21.4 months. Under 2 years.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
