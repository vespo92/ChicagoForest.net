"use client";

import { useState, useMemo } from "react";

interface FiberOption {
  id: string;
  name: string;
  capacity: string;
  capacityGbps: number;
  monthlyCost: number;
  setupCost: number;
  notes: string;
  recommended?: boolean;
}

const fiberOptions: FiberOption[] = [
  {
    id: "dark-fiber",
    name: "Dark Fiber Pair (Zayo/Lumen)",
    capacity: "10G-100G (your optics)",
    capacityGbps: 100,
    monthlyCost: 2500,
    setupCost: 5000,
    notes: "Lease raw fiber strands. Start 10G, upgrade to 100G by swapping optics. Best long-term value.",
    recommended: true,
  },
  {
    id: "lit-40g",
    name: "40G Lit Service",
    capacity: "40 Gbps",
    capacityGbps: 40,
    monthlyCost: 4500,
    setupCost: 2000,
    notes: "Provider-managed wavelength. Overkill now but future-proof. Ask Zayo about I-80 corridor pricing.",
  },
  {
    id: "lit-10g",
    name: "10G Lit Service",
    capacity: "10 Gbps",
    capacityGbps: 10,
    monthlyCost: 2000,
    setupCost: 1500,
    notes: "Sweet spot for initial deployment. i3 Broadband or Lumen in LaSalle County.",
  },
  {
    id: "lit-1g",
    name: "1G Business Fiber (backup only)",
    capacity: "1 Gbps",
    capacityGbps: 1,
    monthlyCost: 600,
    setupCost: 500,
    notes: "Not sufficient as primary. Use as emergency backup only.",
  },
];

interface PtPLink {
  id: string;
  destination: string;
  distanceKm: number;
  bearing: string;
  equipment: string;
  throughputMbps: number;
  cost: number;
  hasFiberPop: boolean;
  fiberProvider: string;
  purpose: string;
  priority: number;
}

const ptpLinks: PtPLink[] = [
  {
    id: "lasalle",
    destination: "LaSalle-Peru",
    distanceKm: 23,
    bearing: "S",
    equipment: "AF5XHD + 34dBi dish",
    throughputMbps: 1000,
    cost: 1800,
    hasFiberPop: true,
    fiberProvider: "Lumen CO (confirmed presence)",
    purpose: "Hot standby - auto-failover if primary fiber cuts",
    priority: 1,
  },
  {
    id: "dekalb",
    destination: "DeKalb (NIU)",
    distanceKm: 46,
    bearing: "NE",
    equipment: "AF5XHD + 34dBi dish",
    throughputMbps: 750,
    cost: 1800,
    hasFiberPop: true,
    fiberProvider: "NIU campus fiber / i3 Broadband",
    purpose: "Diversity path - different provider, route to Chicago",
    priority: 2,
  },
  {
    id: "sterling",
    destination: "Sterling-Rock Falls",
    distanceKm: 53,
    bearing: "W",
    equipment: "AF5XHD + 34dBi dish",
    throughputMbps: 500,
    cost: 1800,
    hasFiberPop: true,
    fiberProvider: "Comcast Business / Lumen",
    purpose: "Western ring - path to Quad Cities expansion",
    priority: 3,
  },
  {
    id: "rockford",
    destination: "Rockford",
    distanceKm: 80,
    bearing: "N",
    equipment: "AF11FX (11GHz licensed)",
    throughputMbps: 1200,
    cost: 4500,
    hasFiberPop: true,
    fiberProvider: "Multiple carriers (metro area)",
    purpose: "Northern backbone - Rockford metro market access",
    priority: 4,
  },
];

interface FailoverScenario {
  name: string;
  description: string;
  primaryDown: boolean;
  secondaryDown: boolean;
  availableCapacity: string;
  impact: string;
  severity: "none" | "low" | "medium" | "high";
}

export default function BackhaulArchitecture() {
  const [selectedFiber, setSelectedFiber] = useState("dark-fiber");
  const [enabledLinks, setEnabledLinks] = useState<Record<string, boolean>>({
    lasalle: true,
    dekalb: true,
    sterling: false,
    rockford: false,
  });
  const [transitCostPerMbps, setTransitCostPerMbps] = useState(0.30);
  const [transitCommitGbps, setTransitCommitGbps] = useState(2);
  const [lagCount, setLagCount] = useState(1); // number of fiber links bonded
  const [enableCaching, setEnableCaching] = useState(true);
  const [cacheReductionPct, setCacheReductionPct] = useState(35); // Netflix + Google + misc

  const toggleLink = (id: string) => {
    setEnabledLinks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fiber = fiberOptions.find((f) => f.id === selectedFiber)!;
  const activeLinks = ptpLinks.filter((l) => enabledLinks[l.id]);

  const analysis = useMemo(() => {
    // Total wireless backhaul capacity
    const wirelessCapacityMbps = activeLinks.reduce((sum, l) => sum + l.throughputMbps, 0);
    const wirelessCapex = activeLinks.reduce((sum, l) => sum + l.cost, 0);

    // Transit costs
    const transitMonthlyCost = transitCommitGbps * 1000 * transitCostPerMbps;

    // LAG bonding
    const lagCapacityGbps = fiber.capacityGbps * lagCount;
    const lagMonthlyCost = fiber.monthlyCost * lagCount;
    const lagSetupCost = fiber.setupCost * lagCount;

    // Caching
    const effectiveCapacityGbps = enableCaching
      ? Math.round(lagCapacityGbps / (1 - cacheReductionPct / 100))
      : lagCapacityGbps;

    // Total monthly opex
    const totalMonthlyOpex = lagMonthlyCost + transitMonthlyCost;

    // BGP setup
    const asnCost = 550; // ARIN annual
    const ipBlockCost = 250; // /22 annual maintenance

    // Router
    const routerCost = 1500; // MikroTik CCR2216

    // Caching hardware (one-time, mostly free)
    const cachingCost = enableCaching ? 2000 : 0; // Rack, power, switch ports for cache appliances

    // Total one-time
    const totalCapex = lagSetupCost + wirelessCapex + routerCost + asnCost + cachingCost;

    // Failover scenarios
    const scenarios: FailoverScenario[] = [
      {
        name: "Normal Operation",
        description: "All links up, traffic via primary fiber",
        primaryDown: false,
        secondaryDown: false,
        availableCapacity: `${fiber.capacityGbps} Gbps fiber + ${(wirelessCapacityMbps / 1000).toFixed(1)} Gbps wireless standby`,
        impact: "Full capacity, all tiers operational",
        severity: "none",
      },
      {
        name: "Primary Fiber Cut",
        description: "Fiber bore damaged (construction, weather). Traffic fails over to LaSalle PtP.",
        primaryDown: true,
        secondaryDown: false,
        availableCapacity: enabledLinks.lasalle
          ? `${(ptpLinks[0].throughputMbps / 1000).toFixed(1)} Gbps via LaSalle-Peru fiber POP`
          : "No backup available!",
        impact: enabledLinks.lasalle
          ? "Premium tier may throttle. Basic + Standard unaffected."
          : "TOTAL OUTAGE - all subscribers down",
        severity: enabledLinks.lasalle ? "medium" : "high",
      },
      {
        name: "Primary + LaSalle Down",
        description: "Fiber cut AND LaSalle link failure (unlikely but plan for it).",
        primaryDown: true,
        secondaryDown: true,
        availableCapacity: enabledLinks.dekalb
          ? `${(ptpLinks[1].throughputMbps / 1000).toFixed(1)} Gbps via DeKalb fiber POP`
          : "No tertiary path!",
        impact: enabledLinks.dekalb
          ? "Reduced capacity. May need to shed Basic tier temporarily."
          : "TOTAL OUTAGE",
        severity: enabledLinks.dekalb ? "medium" : "high",
      },
      {
        name: "DDoS / Congestion Event",
        description: "Volumetric attack or upstream congestion on primary transit.",
        primaryDown: false,
        secondaryDown: false,
        availableCapacity: "BGP shifts traffic to secondary transit provider",
        impact: enabledLinks.lasalle
          ? "BGP multi-homing absorbs the shift. Brief blip during convergence."
          : "Single-homed - no automatic mitigation",
        severity: enabledLinks.lasalle ? "low" : "high",
      },
    ];

    return {
      wirelessCapacityMbps,
      wirelessCapex,
      transitMonthlyCost,
      totalMonthlyOpex,
      lagCapacityGbps,
      lagMonthlyCost,
      lagSetupCost,
      effectiveCapacityGbps,
      asnCost,
      ipBlockCost,
      routerCost,
      cachingCost,
      totalCapex,
      scenarios,
    };
  }, [selectedFiber, enabledLinks, transitCostPerMbps, transitCommitGbps, fiber, activeLinks, lagCount, enableCaching, cacheReductionPct]);

  return (
    <div className="space-y-8">
      {/* Network Topology Diagram */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Backhaul Network Topology
        </h3>
        <div className="bg-slate-900/50 rounded-lg p-6 font-mono text-xs leading-relaxed">
          <pre className="text-gray-300 overflow-x-auto">
{`                         Rockford (80km N)
                         Fiber POP (metro)
                              |
                              | ${enabledLinks.rockford ? "AF11FX 1.2G" : "-- disabled --"}
                              |
  Sterling (53km W)      MENDOTA         DeKalb (46km NE)
  Fiber POP              TOWER           NIU Fiber POP
       ${enabledLinks.sterling ? "|" : " "}                 /|\\                ${enabledLinks.dekalb ? "|" : " "}
       ${enabledLinks.sterling ? "---- AF5XHD 500M -" : "                  "}---+---${enabledLinks.dekalb ? "-- AF5XHD 750M ----" : "                   "}
       ${enabledLinks.sterling ? "|" : " "}                  |                 ${enabledLinks.dekalb ? "|" : " "}
       ${enabledLinks.sterling ? "v" : " "}                  |                 ${enabledLinks.dekalb ? "v" : " "}
  ${enabledLinks.sterling ? "Quad Cities" : "           "}          |            ${enabledLinks.dekalb ? "Chicago/Naperville" : "                  "}
                              |
                         ${enabledLinks.lasalle ? "AF5XHD 1G" : "-- disabled --"}
                              |
                         LaSalle-Peru (23km S)
                         Lumen CO Fiber POP
                              |
                              v
                         Peoria (via relay)

  ===== PRIMARY =====
  [${fiber.name}]
  ${fiber.capacity} | $${fiber.monthlyCost}/mo
  Route: I-80 / I-39 corridor to tower site`}
          </pre>
        </div>
      </div>

      {/* Primary Fiber Selection */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Primary Fiber Backhaul
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Mendota sits near I-80 and I-39 - both major fiber corridors. Zayo, Lumen, and i3 Broadband
          all have infrastructure nearby. Dark fiber is the best long-term play.
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {fiberOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedFiber(opt.id)}
              className={`text-left rounded-lg p-4 border transition ${
                selectedFiber === opt.id
                  ? opt.recommended
                    ? "bg-green-500/10 border-green-500/50 ring-1 ring-green-500/30"
                    : "bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/30"
                  : "bg-slate-900/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white">{opt.name}</span>
                {opt.recommended && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                    Recommended
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mb-2">{opt.capacity}</div>
              <div className="flex gap-4 text-xs">
                <span className="text-white">${opt.monthlyCost.toLocaleString()}/mo</span>
                <span className="text-gray-500">Setup: ${opt.setupCost.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">{opt.notes}</p>
            </button>
          ))}
        </div>
      </div>

      {/* PtP Wireless Backhaul Links */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-2">
          Wireless PtP Backhaul Ring
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Redundant point-to-point links to separate fiber POPs. Each link terminates at a city
          with its own fiber presence, creating multiple independent paths to the internet.
          Toggle links to model different build phases.
        </p>
        <div className="space-y-3">
          {ptpLinks.map((link) => (
            <div
              key={link.id}
              className={`rounded-lg p-4 border transition ${
                enabledLinks[link.id]
                  ? "bg-slate-900/50 border-green-500/30"
                  : "bg-slate-900/30 border-slate-700 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLink(link.id)}
                    className={`w-10 h-6 rounded-full transition ${
                      enabledLinks[link.id] ? "bg-green-500" : "bg-slate-600"
                    } relative`}
                  >
                    <div
                      className={`absolute w-4 h-4 bg-white rounded-full top-1 transition ${
                        enabledLinks[link.id] ? "left-5" : "left-1"
                      }`}
                    />
                  </button>
                  <div>
                    <span className="text-white font-semibold">{link.destination}</span>
                    <span className="text-gray-500 text-xs ml-2">
                      {link.distanceKm} km {link.bearing} | Priority #{link.priority}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-mono text-sm">{link.throughputMbps} Mbps FD</div>
                  <div className="text-gray-500 text-xs">${link.cost.toLocaleString()} one-time</div>
                </div>
              </div>

              {enabledLinks[link.id] && (
                <div className="grid md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-700">
                  <div>
                    <div className="text-xs text-gray-500">Equipment</div>
                    <div className="text-sm text-white">{link.equipment}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Fiber at destination</div>
                    <div className="text-sm text-white">{link.fiberProvider}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Purpose</div>
                    <div className="text-sm text-gray-300">{link.purpose}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Total wireless backhaul capacity:</span>
            <span className="text-white font-bold font-mono">
              {(analysis.wirelessCapacityMbps / 1000).toFixed(1)} Gbps
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-400">Wireless backhaul CapEx:</span>
            <span className="text-white font-mono">
              ${analysis.wirelessCapex.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* LAG Bonding & Content Caching */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* LAG Bonding */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            Link Aggregation (LAG/ECMP)
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Bond multiple fiber links for more capacity and redundancy.
            ECMP (Equal-Cost Multi-Path) distributes traffic across links automatically.
          </p>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">
              Number of fiber links
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range" min="1" max="4" step="1"
                value={lagCount}
                onChange={(e) => setLagCount(parseInt(e.target.value))}
                className="flex-1 accent-green-500"
              />
              <span className="text-white font-mono text-sm w-8 text-right">{lagCount}x</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Per-link capacity:</span>
              <span className="text-white font-mono">{fiber.capacityGbps}G</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-gray-300">Bonded capacity:</span>
              <span className="text-green-400 font-mono">{analysis.lagCapacityGbps}G</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly cost:</span>
              <span className="text-white font-mono">${analysis.lagMonthlyCost.toLocaleString()}/mo</span>
            </div>
          </div>
          {lagCount > 1 && (
            <div className="mt-3 p-2 bg-green-500/5 border border-green-500/20 rounded text-xs text-gray-400">
              {lagCount}x links provide both capacity AND redundancy. If one link fails,
              traffic redistributes across remaining {lagCount - 1} link(s) automatically.
            </div>
          )}
        </div>

        {/* Content Caching */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Content Caching</h3>
            <button
              onClick={() => setEnableCaching(!enableCaching)}
              className={`w-12 h-6 rounded-full transition ${
                enableCaching ? "bg-blue-500" : "bg-slate-600"
              } relative`}
            >
              <div
                className={`absolute w-4 h-4 bg-white rounded-full top-1 transition ${
                  enableCaching ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          {enableCaching ? (
            <>
              <p className="text-sm text-gray-400 mb-4">
                Cache Netflix, YouTube, and software updates locally. Major content providers
                ship you hardware for free — you just provide rack space and power.
              </p>
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-1">
                  Cache traffic reduction
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min="10" max="50" step="5"
                    value={cacheReductionPct}
                    onChange={(e) => setCacheReductionPct(parseInt(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-white font-mono text-sm w-10 text-right">{cacheReductionPct}%</span>
                </div>
                <div className="text-xs text-gray-600">Netflix OCA (~18%) + Google GGC (~14%) + misc = ~35%</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Raw fiber capacity:</span>
                  <span className="text-white font-mono">{analysis.lagCapacityGbps}G</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-gray-300">Effective capacity (with caching):</span>
                  <span className="text-blue-400 font-mono">{analysis.effectiveCapacityGbps}G</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cache hardware cost:</span>
                  <span className="text-green-400">~$2K (rack/power/ports — appliances are free)</span>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span><strong className="text-gray-300">Netflix OCA</strong> — Free appliance, serves ~18% of traffic locally</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span><strong className="text-gray-300">Google GGC</strong> — Free appliance, YouTube + Android + Chrome = ~14%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span><strong className="text-gray-300">Steam/Lancache</strong> — Run your own, game updates cached</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                  <span><strong className="text-gray-300">Microsoft MCC</strong> — Free, Windows/Xbox updates cached</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Caching disabled. All traffic flows through transit. Enable to see how
              free caching appliances can extend your effective capacity by 30-40%.
            </p>
          )}
        </div>
      </div>

      {/* Effective Capacity Summary */}
      <div className={`rounded-lg p-5 border ${
        analysis.effectiveCapacityGbps >= 20
          ? "bg-green-500/10 border-green-500/30"
          : analysis.effectiveCapacityGbps >= 10
            ? "bg-blue-500/10 border-blue-500/30"
            : "bg-yellow-500/10 border-yellow-500/30"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400">Total Effective Backhaul Capacity</div>
            <div className="text-3xl font-bold text-white mt-1">
              {analysis.effectiveCapacityGbps}G effective
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {analysis.lagCapacityGbps}G raw ({lagCount}x {fiber.capacityGbps}G fiber)
              {enableCaching && ` + ${cacheReductionPct}% caching`}
              {` + ${(analysis.wirelessCapacityMbps / 1000).toFixed(1)}G wireless backup`}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Can serve</div>
            <div className="text-2xl font-bold text-green-400">
              ~{Math.round((analysis.effectiveCapacityGbps * 1000) / (5 * 3.5))} subs
            </div>
            <div className="text-xs text-gray-500">at 5 Mbps avg, 3.5x peak</div>
          </div>
        </div>
      </div>

      {/* Transit & BGP */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            IP Transit & BGP
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Transit cost ($/Mbps commit)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.10"
                  max="1.00"
                  step="0.05"
                  value={transitCostPerMbps}
                  onChange={(e) => setTransitCostPerMbps(parseFloat(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-white font-mono text-sm w-16 text-right">
                  ${transitCostPerMbps.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-gray-500">Typical rural IL: $0.20-$0.50/Mbps</div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Commit level (Gbps)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={transitCommitGbps}
                  onChange={(e) => setTransitCommitGbps(parseInt(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-white font-mono text-sm w-16 text-right">
                  {transitCommitGbps} Gbps
                </span>
              </div>
              <div className="text-xs text-gray-500">Start at 2 Gbps, scale with subscribers</div>
            </div>

            <div className="pt-3 border-t border-slate-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Transit monthly:</span>
                <span className="text-white font-mono">${analysis.transitMonthlyCost.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fiber monthly:</span>
                <span className="text-white font-mono">${fiber.monthlyCost.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-700 pt-2">
                <span className="text-gray-300">Total connectivity OpEx:</span>
                <span className="text-white font-mono">${analysis.totalMonthlyOpex.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">
            BGP Multi-Homing Setup
          </h3>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-900/50 rounded p-3">
              <div className="text-white font-semibold mb-1">Own ASN (ARIN)</div>
              <div className="text-gray-400">
                ${analysis.asnCost}/year - Autonomous System Number for BGP peering.
                Required for multi-homing with two transit providers.
              </div>
            </div>
            <div className="bg-slate-900/50 rounded p-3">
              <div className="text-white font-semibold mb-1">IP Space (/22 block)</div>
              <div className="text-gray-400">
                1,024 IPv4 addresses. ${analysis.ipBlockCost}/year maintenance.
                Use CGNAT for residential, direct allocation for business tier.
              </div>
            </div>
            <div className="bg-slate-900/50 rounded p-3">
              <div className="text-white font-semibold mb-1">Core Router</div>
              <div className="text-gray-400">
                MikroTik CCR2216-1G-12XS-2XQ (~${analysis.routerCost}). Handles full BGP table,
                10G/25G SFP28 ports, 100G QSFP28 uplinks. Can route 100 Gbps.
              </div>
            </div>
            <div className="bg-slate-900/50 rounded p-3">
              <div className="text-white font-semibold mb-1">Peering Strategy</div>
              <div className="text-gray-400">
                Provider A at Mendota fiber POP. Provider B at LaSalle-Peru via PtP.
                BGP automatically routes traffic to best path. If one provider goes down,
                all traffic shifts to the other in seconds.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Failover Scenarios */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Failover Scenarios
        </h3>
        <div className="space-y-3">
          {analysis.scenarios.map((scenario, i) => (
            <div
              key={i}
              className={`rounded-lg p-4 border ${
                scenario.severity === "none"
                  ? "bg-green-500/5 border-green-500/20"
                  : scenario.severity === "low"
                    ? "bg-blue-500/5 border-blue-500/20"
                    : scenario.severity === "medium"
                      ? "bg-yellow-500/5 border-yellow-500/20"
                      : "bg-red-500/5 border-red-500/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-white">{scenario.name}</h4>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    scenario.severity === "none"
                      ? "bg-green-500/20 text-green-400"
                      : scenario.severity === "low"
                        ? "bg-blue-500/20 text-blue-400"
                        : scenario.severity === "medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {scenario.severity === "none" ? "Normal" : scenario.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{scenario.description}</p>
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Available capacity: </span>
                  <span className="text-white">{scenario.availableCapacity}</span>
                </div>
                <div>
                  <span className="text-gray-500">Subscriber impact: </span>
                  <span className={
                    scenario.severity === "high" ? "text-red-400" : "text-white"
                  }>{scenario.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Cost Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <div className="text-xs text-gray-400 mb-1">Total Backhaul CapEx</div>
          <div className="text-2xl font-bold text-white">
            ${analysis.totalCapex.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            <div>Fiber setup ({lagCount}x): ${analysis.lagSetupCost.toLocaleString()}</div>
            <div>Wireless PtP: ${analysis.wirelessCapex.toLocaleString()}</div>
            <div>Router: ${analysis.routerCost.toLocaleString()}</div>
            <div>Caching infra: ${analysis.cachingCost.toLocaleString()}</div>
            <div>ASN: ${analysis.asnCost}</div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <div className="text-xs text-gray-400 mb-1">Monthly Connectivity OpEx</div>
          <div className="text-2xl font-bold text-white">
            ${analysis.totalMonthlyOpex.toLocaleString()}/mo
          </div>
          <div className="text-xs text-gray-500 mt-1 space-y-1">
            <div>Fiber lease ({lagCount}x): ${analysis.lagMonthlyCost.toLocaleString()}/mo</div>
            <div>Transit ({transitCommitGbps}G commit): ${analysis.transitMonthlyCost.toLocaleString()}/mo</div>
            <div>Annual: ${(analysis.totalMonthlyOpex * 12).toLocaleString()}/yr</div>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
          <div className="text-xs text-gray-400 mb-1">Gross Margin Target</div>
          <div className="text-2xl font-bold text-green-400">
            ~85%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Typical WISP gross margin on connectivity.
            ${analysis.totalMonthlyOpex.toLocaleString()}/mo OpEx against subscriber revenue
            means strong margins even at 200 subscribers.
          </div>
        </div>
      </div>

      {/* Fiber Providers to Contact */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Fiber Providers to Contact (Mendota/LaSalle County)
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              name: "Zayo Group",
              type: "Dark Fiber / Lit Services",
              notes: "Major fiber along I-80 corridor. Most likely source for dark fiber near Mendota.",
              priority: "High",
            },
            {
              name: "Lumen (CenturyLink)",
              type: "Lit Services / Enterprise",
              notes: "Has fiber infrastructure in LaSalle County. CO presence in LaSalle-Peru confirmed.",
              priority: "High",
            },
            {
              name: "i3 Broadband",
              type: "Regional Fiber ISP",
              notes: "Illinois regional provider, expanding aggressively in central IL. May partner on last-mile.",
              priority: "Medium",
            },
            {
              name: "Illinois Century Network",
              type: "State Fiber Network",
              notes: "State-run fiber backbone. May have POP in LaSalle-Peru. Worth investigating for transit.",
              priority: "Medium",
            },
          ].map((provider) => (
            <div
              key={provider.name}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">{provider.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  provider.priority === "High"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-slate-600/50 text-gray-400"
                }`}>
                  {provider.priority}
                </span>
              </div>
              <div className="text-xs text-blue-400 mb-2">{provider.type}</div>
              <p className="text-xs text-gray-500">{provider.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
