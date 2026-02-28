"use client";

import { useState, useMemo } from "react";

interface TenantTier {
  name: string;
  heightRange: string;
  heightMinM: number;
  heightMaxM: number;
  monthlyRate: number;
  description: string;
  tenantTypes: string[];
}

const tenantTiers: TenantTier[] = [
  {
    name: "Ground Level",
    heightRange: "0-10m (0-33ft)",
    heightMinM: 0,
    heightMaxM: 10,
    monthlyRate: 800,
    description: "Equipment shelters, power distribution, fiber termination",
    tenantTypes: ["Fiber ISP handoff", "Power equipment", "Network switching"],
  },
  {
    name: "Lower Tower",
    heightRange: "10-30m (33-100ft)",
    heightMinM: 10,
    heightMaxM: 30,
    monthlyRate: 1500,
    description: "Mobile carrier antennas (2G/3G/4G/5G), local WISP coverage",
    tenantTypes: ["AT&T / Verizon / T-Mobile", "Local WISP sectors", "County emergency services"],
  },
  {
    name: "Mid Tower",
    heightRange: "30-50m (100-164ft)",
    heightMinM: 30,
    heightMaxM: 50,
    monthlyRate: 2200,
    description: "Higher-gain carrier antennas, regional WISP backhaul",
    tenantTypes: ["5G small cell backhaul", "Regional ISP PTP links", "Public safety radio"],
  },
  {
    name: "Upper Tower",
    heightRange: "50-80m (164-262ft)",
    heightMinM: 50,
    heightMaxM: 80,
    monthlyRate: 3000,
    description: "Long-range point-to-point backbone links",
    tenantTypes: ["Municipal ISP backbone", "Inter-city PTP links", "Enterprise WAN"],
  },
  {
    name: "Top of Tower",
    heightRange: "80m+ (262ft+)",
    heightMinM: 80,
    heightMaxM: 150,
    monthlyRate: 3500,
    description: "Highest-powered, narrowest-beam long-haul links to distant cities",
    tenantTypes: [
      "High-power backbone radios",
      "Chicago/Rockford/Quad Cities links",
      "Weather/environmental monitoring",
    ],
  },
];

export default function TowerRevenueModel() {
  const [towerHeightM, setTowerHeightM] = useState(60);
  const [occupancy, setOccupancy] = useState<Record<string, number>>({
    "Ground Level": 1,
    "Lower Tower": 2,
    "Mid Tower": 1,
    "Upper Tower": 1,
    "Top of Tower": 1,
  });

  const revenue = useMemo(() => {
    const availableTiers = tenantTiers.filter(
      (t) => t.heightMinM < towerHeightM
    );

    let monthlyTotal = 0;
    const breakdown: {
      tier: string;
      tenants: number;
      monthly: number;
      annual: number;
    }[] = [];

    for (const tier of availableTiers) {
      const tenants = occupancy[tier.name] || 0;
      const monthly = tenants * tier.monthlyRate;
      monthlyTotal += monthly;
      breakdown.push({
        tier: tier.name,
        tenants,
        monthly,
        annual: monthly * 12,
      });
    }

    // Municipal ISP revenue (separate from tower lease)
    const ispSubscribers = 500; // conservative starting estimate
    const ispMonthlyRate = 65; // competitive rural pricing
    const ispMonthly = ispSubscribers * ispMonthlyRate;

    return {
      towerMonthly: monthlyTotal,
      towerAnnual: monthlyTotal * 12,
      ispMonthly,
      ispAnnual: ispMonthly * 12,
      totalMonthly: monthlyTotal + ispMonthly,
      totalAnnual: (monthlyTotal + ispMonthly) * 12,
      breakdown,
      availableTiers,
    };
  }, [towerHeightM, occupancy]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tower Lease Revenue */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-white mb-4">
            Tower Lease Revenue Model
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Revenue from leasing tower space to mobile carriers, WISPs, and
            public safety agencies. Rates based on typical Illinois rural tower
            co-location pricing.
          </p>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">
              Tower Height: {towerHeightM}m ({(towerHeightM * 3.281).toFixed(0)}{" "}
              ft)
            </label>
            <input
              type="range"
              min="30"
              max="120"
              value={towerHeightM}
              onChange={(e) => setTowerHeightM(parseInt(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div className="space-y-3">
            {revenue.availableTiers.map((tier) => (
              <div
                key={tier.name}
                className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-white">
                    {tier.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {tier.heightRange}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  ${tier.monthlyRate.toLocaleString()}/mo per tenant
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Tenants:</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={occupancy[tier.name] || 0}
                    onChange={(e) =>
                      setOccupancy({
                        ...occupancy,
                        [tier.name]: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-16 bg-slate-700 text-white rounded px-2 py-1 text-sm border border-slate-600"
                  />
                  <span className="text-sm text-gray-400 ml-auto">
                    $
                    {(
                      (occupancy[tier.name] || 0) * tier.monthlyRate
                    ).toLocaleString()}
                    /mo
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {tier.tenantTypes.join(" | ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="space-y-4">
          {/* Tower Revenue */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5">
            <h4 className="text-sm font-semibold text-amber-400 mb-3">
              Tower Co-Location Revenue
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Monthly:</span>
                <span className="text-white font-semibold text-lg">
                  ${revenue.towerMonthly.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Annual:</span>
                <span className="text-amber-400 font-bold text-xl">
                  ${revenue.towerAnnual.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Municipal ISP Revenue */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
            <h4 className="text-sm font-semibold text-blue-400 mb-3">
              Municipal ISP Revenue (Projected)
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subscribers (est.):</span>
                <span className="text-white">500 households</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly rate:</span>
                <span className="text-white">$65/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly revenue:</span>
                <span className="text-white font-semibold text-lg">
                  ${revenue.ispMonthly.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Annual revenue:</span>
                <span className="text-blue-400 font-bold text-xl">
                  ${revenue.ispAnnual.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Based on comparable municipal ISPs in rural Illinois. Mendota city
              population ~7,000 with surrounding rural area.
            </p>
          </div>

          {/* Combined Total */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5">
            <h4 className="text-sm font-semibold text-green-400 mb-3">
              Combined Revenue
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Monthly:</span>
                <span className="text-white font-semibold text-xl">
                  ${revenue.totalMonthly.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Annual:</span>
                <span className="text-green-400 font-bold text-2xl">
                  ${revenue.totalAnnual.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Tower Tiers Visual */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <h4 className="text-sm font-semibold text-white mb-3">
              Tower Tier Layout
            </h4>
            <div className="relative h-64">
              {/* Tower visualization */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-4 bg-gradient-to-t from-gray-600 to-gray-400 rounded-t"
                style={{ height: `${Math.min((towerHeightM / 120) * 100, 100)}%` }}
              />
              {/* Tier markers */}
              {revenue.availableTiers.map((tier, i) => {
                const midHeight = (tier.heightMinM + Math.min(tier.heightMaxM, towerHeightM)) / 2;
                const bottomPct = (midHeight / 120) * 100;
                const tenantCount = occupancy[tier.name] || 0;
                return (
                  <div
                    key={i}
                    className="absolute left-1/2 ml-6 flex items-center gap-2"
                    style={{ bottom: `${bottomPct}%` }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        tenantCount > 0 ? "bg-green-400" : "bg-gray-600"
                      }`}
                    />
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {tier.name}{" "}
                      {tenantCount > 0 && (
                        <span className="text-green-400">
                          ({tenantCount}x)
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
              {/* Height label */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-6 text-xs text-amber-400 font-semibold">
                {towerHeightM}m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Plan */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Deployment Phases
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border-l-4 border-amber-500 pl-4">
            <h4 className="font-semibold text-amber-400 mb-2">
              Phase 1: Foundation (2026)
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>- Tower construction at solar site</li>
              <li>- Fiber optic bore to property</li>
              <li>- Municipal ISP launch (Mendota)</li>
              <li>- First relay link to LaSalle-Peru</li>
              <li>- Begin carrier lease negotiations</li>
            </ul>
            <div className="text-xs text-gray-500 mt-2">
              Est. CapEx: $250K-400K (tower + fiber + radios)
            </div>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold text-blue-400 mb-2">
              Phase 2: Expansion (2027)
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>- Relay towers at DeKalb, Sterling</li>
              <li>- Connect Rockford, Quad Cities</li>
              <li>- Connect Chicago/Naperville via DeKalb</li>
              <li>- 2-3 carrier tenants operational</li>
              <li>- Municipal ISP serving 500+ homes</li>
            </ul>
            <div className="text-xs text-gray-500 mt-2">
              Est. CapEx: $150K-250K per relay site
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-semibold text-green-400 mb-2">
              Phase 3: Statewide (2028+)
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>- Peoria link via LaSalle relay</li>
              <li>- Bloomington-Normal connection</li>
              <li>- Full carrier occupancy</li>
              <li>- Regional ISP network serving 2000+ homes</li>
              <li>- Replicate model at other solar farms</li>
            </ul>
            <div className="text-xs text-gray-500 mt-2">
              Revenue target: $500K+/year combined
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
