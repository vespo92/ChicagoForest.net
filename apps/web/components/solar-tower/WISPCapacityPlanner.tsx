"use client";

import { useState, useMemo } from "react";

interface RadioTier {
  id: string;
  name: string;
  technology: string;
  band: string;
  color: string;
  borderColor: string;
  bgColor: string;
  towerPosition: string;
  maxSubsPerSector: number;
  defaultSubsPerSector: number;
  sectors: number;
  phyRateMbps: number;
  realWorldEfficiency: number; // percentage of PHY rate achievable
  defaultDownMbps: number;
  defaultUpMbps: number;
  cpePrice: number;
  baseStationPrice: number;
  sectorAntennaPrice: number;
  monthlyPlanPrice: number;
  oversubscription: number;
  notes: string[];
}

const radioTiers: RadioTier[] = [
  {
    id: "tarana",
    name: "Premium Tier",
    technology: "Tarana G1",
    band: "5 GHz (interference-canceling)",
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/10",
    towerPosition: "Top (60m+)",
    maxSubsPerSector: 32,
    defaultSubsPerSector: 24,
    sectors: 4,
    phyRateMbps: 800,
    realWorldEfficiency: 0.65,
    defaultDownMbps: 200,
    defaultUpMbps: 50,
    cpePrice: 500,
    baseStationPrice: 3500,
    sectorAntennaPrice: 0, // integrated
    monthlyPlanPrice: 99,
    oversubscription: 3,
    notes: [
      "Active interference cancellation",
      "Adaptive beamforming per client",
      "Competes with fiber on speed",
      "Best for businesses & power users",
    ],
  },
  {
    id: "cambium6g",
    name: "High-Capacity Tier",
    technology: "Cambium ePMP 4600",
    band: "6 GHz AFC (unlicensed, empty spectrum)",
    color: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    bgColor: "bg-cyan-500/10",
    towerPosition: "Upper-Mid (40-55m)",
    maxSubsPerSector: 80,
    defaultSubsPerSector: 40,
    sectors: 4,
    phyRateMbps: 1200,
    realWorldEfficiency: 0.6,
    defaultDownMbps: 150,
    defaultUpMbps: 30,
    cpePrice: 250,
    baseStationPrice: 1800,
    sectorAntennaPrice: 200,
    monthlyPlanPrice: 85,
    oversubscription: 5,
    notes: [
      "6 GHz AFC - 1,200 MHz of empty spectrum",
      "No DFS, no interference, no license fee",
      "Wi-Fi 6E based - 4x4 MU-MIMO",
      "cnMaestro cloud management",
      "8 km effective range",
    ],
  },
  {
    id: "cbrs",
    name: "Standard Tier",
    technology: "CBRS (Baicells/Cambium)",
    band: "3.5 GHz (licensed via SAS)",
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/10",
    towerPosition: "Mid (30-40m)",
    maxSubsPerSector: 96,
    defaultSubsPerSector: 50,
    sectors: 4,
    phyRateMbps: 400,
    realWorldEfficiency: 0.6,
    defaultDownMbps: 100,
    defaultUpMbps: 20,
    cpePrice: 300,
    baseStationPrice: 2500,
    sectorAntennaPrice: 200,
    monthlyPlanPrice: 75,
    oversubscription: 5,
    notes: [
      "Licensed spectrum - no interference",
      "PAL license ~$1-5K for rural county",
      "Best NLOS penetration (lower freq)",
      "10 km effective range",
    ],
  },
  {
    id: "ltu",
    name: "Basic Tier",
    technology: "Ubiquiti LTU Rocket",
    band: "5 GHz (unlicensed)",
    color: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/10",
    towerPosition: "Lower (10-30m)",
    maxSubsPerSector: 120,
    defaultSubsPerSector: 50,
    sectors: 4,
    phyRateMbps: 600,
    realWorldEfficiency: 0.5,
    defaultDownMbps: 50,
    defaultUpMbps: 10,
    cpePrice: 199,
    baseStationPrice: 299,
    sectorAntennaPrice: 150,
    monthlyPlanPrice: 55,
    oversubscription: 8,
    notes: [
      "Cost-effective entry tier",
      "GPS sync for frequency reuse",
      "Good for budget residential & farms",
      "Up to 30 km range with LTU LR CPE",
    ],
  },
  {
    id: "mikrotik60g",
    name: "In-Town Gigabit",
    technology: "MikroTik wAP 60Gx3",
    band: "60 GHz V-band (unlicensed)",
    color: "text-rose-400",
    borderColor: "border-rose-500/30",
    bgColor: "bg-rose-500/10",
    towerPosition: "Street-level (poles/buildings)",
    maxSubsPerSector: 8,
    defaultSubsPerSector: 6,
    sectors: 12, // distributed across town on poles
    phyRateMbps: 1800,
    realWorldEfficiency: 0.55,
    defaultDownMbps: 500,
    defaultUpMbps: 100,
    cpePrice: 75,
    baseStationPrice: 200,
    sectorAntennaPrice: 0, // integrated
    monthlyPlanPrice: 89,
    oversubscription: 4,
    notes: [
      "60 GHz mmWave - near-gigabit speeds",
      "$200 AP + $75 CPE = cheapest gig deploy",
      "500m range max (LOS required)",
      "In-town Mendota density only",
      "12 APs on poles/buildings covers downtown",
    ],
  },
];

interface ChannelPlan {
  sector: string;
  channel: string;
  frequency: string;
  band: string;
  dfs: boolean;
}

const ltuChannelPlan: ChannelPlan[] = [
  { sector: "North", channel: "Ch 36 (40 MHz)", frequency: "5180-5220 MHz", band: "UNII-1", dfs: false },
  { sector: "East", channel: "Ch 52 (40 MHz)", frequency: "5260-5300 MHz", band: "UNII-2", dfs: true },
  { sector: "South", channel: "Ch 100 (40 MHz)", frequency: "5500-5540 MHz", band: "UNII-2e", dfs: true },
  { sector: "West", channel: "Ch 149 (40 MHz)", frequency: "5745-5785 MHz", band: "UNII-3", dfs: false },
];

const sixGhzChannelPlan: ChannelPlan[] = [
  { sector: "North", channel: "Ch 1 (160 MHz)", frequency: "5955-6115 MHz", band: "UNII-5", dfs: false },
  { sector: "East", channel: "Ch 65 (160 MHz)", frequency: "6275-6435 MHz", band: "UNII-6", dfs: false },
  { sector: "South", channel: "Ch 129 (160 MHz)", frequency: "6595-6755 MHz", band: "UNII-7", dfs: false },
  { sector: "West", channel: "Ch 193 (160 MHz)", frequency: "6915-7075 MHz", band: "UNII-8", dfs: false },
];

export default function WISPCapacityPlanner() {
  const [tierConfigs, setTierConfigs] = useState<
    Record<string, { subsPerSector: number; downMbps: number; upMbps: number; planPrice: number }>
  >({
    tarana: { subsPerSector: 24, downMbps: 200, upMbps: 50, planPrice: 99 },
    cambium6g: { subsPerSector: 40, downMbps: 150, upMbps: 30, planPrice: 85 },
    cbrs: { subsPerSector: 50, downMbps: 100, upMbps: 20, planPrice: 75 },
    ltu: { subsPerSector: 50, downMbps: 50, upMbps: 10, planPrice: 55 },
    mikrotik60g: { subsPerSector: 6, downMbps: 500, upMbps: 100, planPrice: 89 },
  });

  const updateTier = (tierId: string, field: string, value: number) => {
    setTierConfigs((prev) => ({
      ...prev,
      [tierId]: { ...prev[tierId], [field]: value },
    }));
  };

  const analysis = useMemo(() => {
    const tiers = radioTiers.map((tier) => {
      const config = tierConfigs[tier.id];
      const totalSubs = config.subsPerSector * tier.sectors;
      const aggregatePerSector = tier.phyRateMbps * tier.realWorldEfficiency;
      const requiredBwPerSector = (config.subsPerSector * config.downMbps) / tier.oversubscription;
      const sectorUtilization = (requiredBwPerSector / aggregatePerSector) * 100;

      // Peak concurrent users (assume 20% active at peak)
      const peakConcurrent = Math.ceil(totalSubs * 0.2);
      const peakPerUserDown = aggregatePerSector / peakConcurrent * tier.sectors / tier.sectors;

      // Equipment costs
      const baseStationCost = (tier.baseStationPrice + tier.sectorAntennaPrice) * tier.sectors;
      const cpeCost = totalSubs * tier.cpePrice;

      // Revenue
      const monthlyRevenue = totalSubs * config.planPrice;
      const annualRevenue = monthlyRevenue * 12;

      // Total backhaul demand (all sectors concurrent at peak)
      const backhaulDemandMbps = aggregatePerSector * tier.sectors;

      return {
        ...tier,
        config,
        totalSubs,
        aggregatePerSector: Math.round(aggregatePerSector),
        requiredBwPerSector: Math.round(requiredBwPerSector),
        sectorUtilization: Math.min(sectorUtilization, 100),
        peakConcurrent,
        baseStationCost,
        cpeCost,
        monthlyRevenue,
        annualRevenue,
        backhaulDemandMbps: Math.round(backhaulDemandMbps),
      };
    });

    const totalSubs = tiers.reduce((sum, t) => sum + t.totalSubs, 0);
    const totalMonthlyRevenue = tiers.reduce((sum, t) => sum + t.monthlyRevenue, 0);
    const totalAnnualRevenue = totalMonthlyRevenue * 12;
    const totalBaseStationCost = tiers.reduce((sum, t) => sum + t.baseStationCost, 0);
    const totalCpeCost = tiers.reduce((sum, t) => sum + t.cpeCost, 0);
    const totalBackhaulDemand = tiers.reduce((sum, t) => sum + t.backhaulDemandMbps, 0);
    // Realistic peak demand is ~30% of aggregate (not all sectors maxed simultaneously)
    const realisticPeakBackhaul = Math.round(totalBackhaulDemand * 0.3);

    return {
      tiers,
      totalSubs,
      totalMonthlyRevenue,
      totalAnnualRevenue,
      totalBaseStationCost,
      totalCpeCost,
      totalBackhaulDemand,
      realisticPeakBackhaul,
    };
  }, [tierConfigs]);

  const getUtilColor = (pct: number) => {
    if (pct < 50) return "bg-green-500";
    if (pct < 75) return "bg-yellow-500";
    if (pct < 90) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-8">
      {/* Mixed Architecture Overview */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Mixed-Architecture Tower Layout
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Tower Visual */}
          <div className="relative bg-slate-900/50 rounded-lg p-6 flex flex-col items-center justify-end h-96">
            <div className="text-xs text-gray-500 absolute top-3 left-3">Tower + Street-Level</div>
            {/* Tower */}
            <div className="relative w-8 bg-gradient-to-t from-gray-600 to-gray-400 rounded-t h-72">
              {/* Tarana - Top */}
              <div className="absolute -left-20 -right-20 top-1 flex justify-center">
                <div className="bg-purple-500/20 border border-purple-500/40 rounded px-2 py-1">
                  <span className="text-[10px] text-purple-300 font-semibold">TARANA G1 (60m+)</span>
                </div>
              </div>
              {/* Cambium 6G - Upper-Mid */}
              <div className="absolute -left-20 -right-20 top-14 flex justify-center">
                <div className="bg-cyan-500/20 border border-cyan-500/40 rounded px-2 py-1">
                  <span className="text-[10px] text-cyan-300 font-semibold">CAMBIUM 6 GHz (40-55m)</span>
                </div>
              </div>
              {/* CBRS - Mid */}
              <div className="absolute -left-20 -right-20 top-28 flex justify-center">
                <div className="bg-blue-500/20 border border-blue-500/40 rounded px-2 py-1">
                  <span className="text-[10px] text-blue-300 font-semibold">CBRS 3.5 GHz (30-40m)</span>
                </div>
              </div>
              {/* LTU - Lower */}
              <div className="absolute -left-20 -right-20 top-44 flex justify-center">
                <div className="bg-amber-500/20 border border-amber-500/40 rounded px-2 py-1">
                  <span className="text-[10px] text-amber-300 font-semibold">LTU 5 GHz (10-30m)</span>
                </div>
              </div>
            </div>
            {/* MikroTik 60G - Street level */}
            <div className="mt-3 flex items-center gap-2">
              <div className="bg-rose-500/20 border border-rose-500/40 rounded px-2 py-1">
                <span className="text-[10px] text-rose-300 font-semibold">MikroTik 60G (street poles)</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2">4 sectors per tower tier + 12 street APs</div>
          </div>

          {/* Tier Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {analysis.tiers.map((tier) => (
              <div
                key={tier.id}
                className={`${tier.bgColor} border ${tier.borderColor} rounded-lg p-3`}
              >
                <div className={`text-sm font-bold ${tier.color} mb-1`}>
                  {tier.name}
                </div>
                <div className="text-xs text-gray-400 mb-2">{tier.technology}</div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span className="text-white">{tier.towerPosition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sectors:</span>
                    <span className="text-white">{tier.sectors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Agg/sector:</span>
                    <span className="text-white font-mono">{tier.aggregatePerSector} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total subs:</span>
                    <span className="text-white font-bold">{tier.totalSubs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Speed:</span>
                    <span className="text-white font-mono">
                      {tier.config.downMbps}/{tier.config.upMbps}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className={`font-bold ${tier.color}`}>
                      ${tier.config.planPrice}/mo
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-Tier Configuration */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">
          Tier Configuration
        </h3>
        {analysis.tiers.map((tier) => (
          <div
            key={tier.id}
            className={`${tier.bgColor} border ${tier.borderColor} rounded-lg p-5`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className={`text-lg font-bold ${tier.color}`}>
                  {tier.name}: {tier.technology}
                </h4>
                <p className="text-xs text-gray-400">{tier.band}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  {tier.totalSubs} subscribers
                </div>
                <div className={`text-sm font-semibold ${tier.color}`}>
                  ${tier.monthlyRevenue.toLocaleString()}/mo
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              {/* Subscribers per sector */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Subscribers per sector
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max={tier.maxSubsPerSector}
                    value={tierConfigs[tier.id].subsPerSector}
                    onChange={(e) => updateTier(tier.id, "subsPerSector", parseInt(e.target.value))}
                    className="flex-1 accent-current"
                  />
                  <span className="text-white text-sm font-mono w-10 text-right">
                    {tierConfigs[tier.id].subsPerSector}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  x {tier.sectors} sectors = {tier.totalSubs} total
                </div>
              </div>

              {/* Download speed */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Download (Mbps)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max={Math.round(tier.phyRateMbps * tier.realWorldEfficiency * 0.8)}
                    step="5"
                    value={tierConfigs[tier.id].downMbps}
                    onChange={(e) => updateTier(tier.id, "downMbps", parseInt(e.target.value))}
                    className="flex-1 accent-current"
                  />
                  <span className="text-white text-sm font-mono w-12 text-right">
                    {tierConfigs[tier.id].downMbps}
                  </span>
                </div>
              </div>

              {/* Upload speed */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Upload (Mbps)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max={Math.round(tierConfigs[tier.id].downMbps * 0.5)}
                    step="5"
                    value={tierConfigs[tier.id].upMbps}
                    onChange={(e) => updateTier(tier.id, "upMbps", parseInt(e.target.value))}
                    className="flex-1 accent-current"
                  />
                  <span className="text-white text-sm font-mono w-10 text-right">
                    {tierConfigs[tier.id].upMbps}
                  </span>
                </div>
              </div>

              {/* Monthly price */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Monthly price ($)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="25"
                    max="199"
                    step="5"
                    value={tierConfigs[tier.id].planPrice}
                    onChange={(e) => updateTier(tier.id, "planPrice", parseInt(e.target.value))}
                    className="flex-1 accent-current"
                  />
                  <span className="text-white text-sm font-mono w-10 text-right">
                    ${tierConfigs[tier.id].planPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Sector Utilization Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">
                  Sector utilization ({tier.oversubscription}:1 oversubscription)
                </span>
                <span className={tier.sectorUtilization > 85 ? "text-red-400" : "text-gray-400"}>
                  {tier.requiredBwPerSector} / {tier.aggregatePerSector} Mbps ({tier.sectorUtilization.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div
                  className={`${getUtilColor(tier.sectorUtilization)} h-3 rounded-full transition-all`}
                  style={{ width: `${Math.min(tier.sectorUtilization, 100)}%` }}
                />
              </div>
              {tier.sectorUtilization > 85 && (
                <div className="text-xs text-red-400 mt-1">
                  Sector overloaded! Reduce subscribers or lower plan speeds.
                </div>
              )}
            </div>

            {/* Tier notes */}
            <div className="flex flex-wrap gap-2">
              {tier.notes.map((note, i) => (
                <span
                  key={i}
                  className="text-xs bg-slate-800/50 text-gray-400 px-2 py-1 rounded"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Aggregate Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
          <div className="text-xs text-gray-400 mb-1">Total Subscribers</div>
          <div className="text-3xl font-bold text-green-400">
            {analysis.totalSubs}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            across {analysis.tiers.length} tiers, {analysis.tiers.reduce((s, t) => s + t.sectors, 0)} sectors/APs
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
          <div className="text-xs text-gray-400 mb-1">Monthly ISP Revenue</div>
          <div className="text-3xl font-bold text-green-400">
            ${analysis.totalMonthlyRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ${analysis.totalAnnualRevenue.toLocaleString()}/year
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <div className="text-xs text-gray-400 mb-1">Base Station CapEx</div>
          <div className="text-2xl font-bold text-white">
            ${analysis.totalBaseStationCost.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {analysis.tiers.reduce((s, t) => s + t.sectors, 0)} base stations + antennas
          </div>
        </div>

        <div className={`rounded-lg p-5 border ${
          analysis.realisticPeakBackhaul > 10000
            ? "bg-red-500/10 border-red-500/30"
            : analysis.realisticPeakBackhaul > 5000
              ? "bg-yellow-500/10 border-yellow-500/30"
              : "bg-slate-800/50 border-slate-700"
        }`}>
          <div className="text-xs text-gray-400 mb-1">Peak Backhaul Demand</div>
          <div className="text-2xl font-bold text-white">
            {(analysis.realisticPeakBackhaul / 1000).toFixed(1)} Gbps
          </div>
          <div className="text-xs text-gray-500 mt-1">
            30% of {(analysis.totalBackhaulDemand / 1000).toFixed(1)} Gbps theoretical max
          </div>
        </div>
      </div>

      {/* Bandwidth Distribution Visualization */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Bandwidth Distribution by Tier
        </h3>
        <div className="space-y-4">
          {analysis.tiers.map((tier) => {
            const pctOfTotal = (tier.backhaulDemandMbps / analysis.totalBackhaulDemand) * 100;
            const pctOfRevenue = (tier.monthlyRevenue / analysis.totalMonthlyRevenue) * 100;
            return (
              <div key={tier.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-semibold ${tier.color}`}>{tier.name} ({tier.technology})</span>
                  <span className="text-gray-400">
                    {tier.totalSubs} subs | {tier.backhaulDemandMbps} Mbps | ${tier.monthlyRevenue.toLocaleString()}/mo
                  </span>
                </div>
                {/* Bandwidth bar */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Bandwidth share ({pctOfTotal.toFixed(0)}%)</div>
                    <div className="w-full bg-slate-700 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          tier.id === "tarana" ? "bg-purple-500" : tier.id === "cambium6g" ? "bg-cyan-500" : tier.id === "cbrs" ? "bg-blue-500" : tier.id === "mikrotik60g" ? "bg-rose-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${pctOfTotal}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Revenue share ({pctOfRevenue.toFixed(0)}%)</div>
                    <div className="w-full bg-slate-700 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          tier.id === "tarana" ? "bg-purple-500" : tier.id === "cambium6g" ? "bg-cyan-500" : tier.id === "cbrs" ? "bg-blue-500" : tier.id === "mikrotik60g" ? "bg-rose-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${pctOfRevenue}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revenue per Mbps efficiency */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-semibold text-white mb-3">Revenue Efficiency ($/Mbps consumed)</h4>
          <div className="grid grid-cols-5 gap-3">
            {analysis.tiers.map((tier) => {
              const revenuePerMbps = tier.monthlyRevenue / (tier.backhaulDemandMbps || 1);
              return (
                <div key={tier.id} className={`${tier.bgColor} border ${tier.borderColor} rounded-lg p-3 text-center`}>
                  <div className={`text-lg font-bold ${tier.color}`}>
                    ${revenuePerMbps.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">{tier.technology}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spectrum & Channel Plans */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-2">
          Spectrum Allocation Across All Bands
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          Five bands across four tiers, plus 60 GHz for in-town. Each operates independently
          with zero co-channel interference between tiers.
        </p>

        {/* 5 GHz Plan */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-amber-400 mb-2">5 GHz — LTU + Tarana Sectors</h4>
          <p className="text-xs text-gray-500 mb-3">
            Tarana handles its own interference cancellation. LTU requires clean channel separation with GPS sync.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-gray-400 font-normal">Sector</th>
                  <th className="text-left py-2 text-gray-400 font-normal">Channel</th>
                  <th className="text-left py-2 text-gray-400 font-normal">Frequency</th>
                  <th className="text-left py-2 text-gray-400 font-normal">Band</th>
                  <th className="text-left py-2 text-gray-400 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {ltuChannelPlan.map((ch) => (
                  <tr key={ch.sector} className="border-b border-slate-700/50">
                    <td className="py-2 text-white font-semibold">{ch.sector}</td>
                    <td className="py-2 text-white font-mono">{ch.channel}</td>
                    <td className="py-2 text-gray-300 font-mono">{ch.frequency}</td>
                    <td className="py-2 text-gray-300">{ch.band}</td>
                    <td className="py-2">
                      {ch.dfs ? (
                        <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-0.5 rounded">
                          DFS - radar detection
                        </span>
                      ) : (
                        <span className="text-green-400 text-xs bg-green-400/10 px-2 py-0.5 rounded">
                          Clean
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6 GHz Plan */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">6 GHz AFC — Cambium ePMP 4600 Sectors</h4>
          <p className="text-xs text-gray-500 mb-3">
            1,200 MHz of brand new spectrum. 160 MHz channels = 4x the bandwidth of 5 GHz 40 MHz channels.
            No DFS, no radar issues. AFC (Automated Frequency Coordination) database ensures no incumbent interference.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-gray-400 font-normal">Sector</th>
                  <th className="text-left py-2 text-gray-400 font-normal">Channel</th>
                  <th className="text-left py-2 text-gray-400 font-normal">Frequency</th>
                  <th className="text-left py-2 text-gray-400 font-normal">Band</th>
                  <th className="text-left py-2 text-gray-400 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {sixGhzChannelPlan.map((ch) => (
                  <tr key={ch.sector} className="border-b border-slate-700/50">
                    <td className="py-2 text-white font-semibold">{ch.sector}</td>
                    <td className="py-2 text-white font-mono">{ch.channel}</td>
                    <td className="py-2 text-gray-300 font-mono">{ch.frequency}</td>
                    <td className="py-2 text-gray-300">{ch.band}</td>
                    <td className="py-2">
                      <span className="text-green-400 text-xs bg-green-400/10 px-2 py-0.5 rounded">
                        Clean — no DFS required
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional bands summary */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">3.5 GHz CBRS</h4>
            <p className="text-xs text-gray-400">
              150 MHz of spectrum managed by SAS (Spectrum Access System). PAL licenses purchased
              at FCC auction give priority access. GAA (General Authorized Access) available without
              license but lower priority. Rural LaSalle County PAL licenses are cheap ($1-5K).
            </p>
          </div>
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-rose-400 mb-2">60 GHz V-Band</h4>
            <p className="text-xs text-gray-400">
              14 GHz of unlicensed spectrum (57-71 GHz). Massive bandwidth but oxygen absorption
              limits range to ~500m. Perfect for in-town last-mile. No license, no coordination needed.
              Self-interference is minimal due to narrow beams and short range.
            </p>
          </div>
        </div>
      </div>

      {/* CPE Cost Calculator */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          CPE Cost Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-gray-400 font-normal">Tier</th>
                <th className="text-right py-2 text-gray-400 font-normal">CPE Unit</th>
                <th className="text-right py-2 text-gray-400 font-normal">Subscribers</th>
                <th className="text-right py-2 text-gray-400 font-normal">CPE Total</th>
                <th className="text-right py-2 text-gray-400 font-normal">Base Stations</th>
                <th className="text-right py-2 text-gray-400 font-normal">Tier Total CapEx</th>
                <th className="text-right py-2 text-gray-400 font-normal">Payback (months)</th>
              </tr>
            </thead>
            <tbody>
              {analysis.tiers.map((tier) => {
                const tierCapex = tier.baseStationCost + tier.cpeCost;
                const paybackMonths = Math.ceil(tierCapex / tier.monthlyRevenue);
                return (
                  <tr key={tier.id} className="border-b border-slate-700/50">
                    <td className={`py-2 font-semibold ${tier.color}`}>{tier.technology}</td>
                    <td className="py-2 text-right text-white font-mono">${tier.cpePrice}</td>
                    <td className="py-2 text-right text-white">{tier.totalSubs}</td>
                    <td className="py-2 text-right text-white font-mono">
                      ${tier.cpeCost.toLocaleString()}
                    </td>
                    <td className="py-2 text-right text-white font-mono">
                      ${tier.baseStationCost.toLocaleString()}
                    </td>
                    <td className="py-2 text-right text-white font-mono font-bold">
                      ${tierCapex.toLocaleString()}
                    </td>
                    <td className="py-2 text-right">
                      <span className={paybackMonths <= 12 ? "text-green-400" : paybackMonths <= 24 ? "text-yellow-400" : "text-orange-400"}>
                        {paybackMonths} mo
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-slate-600">
                <td className="py-2 font-bold text-white">TOTAL</td>
                <td className="py-2" />
                <td className="py-2 text-right text-white font-bold">{analysis.totalSubs}</td>
                <td className="py-2 text-right text-white font-mono font-bold">
                  ${analysis.totalCpeCost.toLocaleString()}
                </td>
                <td className="py-2 text-right text-white font-mono font-bold">
                  ${analysis.totalBaseStationCost.toLocaleString()}
                </td>
                <td className="py-2 text-right text-green-400 font-mono font-bold">
                  ${(analysis.totalBaseStationCost + analysis.totalCpeCost).toLocaleString()}
                </td>
                <td className="py-2 text-right text-green-400 font-bold">
                  {Math.ceil(
                    (analysis.totalBaseStationCost + analysis.totalCpeCost) / analysis.totalMonthlyRevenue
                  )} mo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
