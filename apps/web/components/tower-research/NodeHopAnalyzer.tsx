"use client";

import { useState, useMemo } from "react";

interface Tower {
  id: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
  elevationFt: number;
  heightAglFt: number;
}

const TOWERS: Tower[] = [
  { id: "mendota", name: "Mendota Solar Tower", city: "Mendota", lat: 41.5475, lon: -89.1178, elevationFt: 751, heightAglFt: 200 },
  { id: "lasalle", name: "LaSalle-Peru Relay", city: "LaSalle", lat: 41.3454, lon: -89.0916, elevationFt: 659, heightAglFt: 200 },
  { id: "dekalb", name: "DeKalb Relay", city: "DeKalb", lat: 41.9295, lon: -88.7502, elevationFt: 879, heightAglFt: 300 },
  { id: "ottawa", name: "Ottawa Relay", city: "Ottawa", lat: 41.3456, lon: -88.8426, elevationFt: 481, heightAglFt: 200 },
  { id: "sterling", name: "Sterling Relay", city: "Sterling", lat: 41.7886, lon: -89.6962, elevationFt: 643, heightAglFt: 200 },
  { id: "rockford", name: "Rockford Hub", city: "Rockford", lat: 42.2711, lon: -89.094, elevationFt: 728, heightAglFt: 300 },
  { id: "naperville", name: "Naperville Hub", city: "Naperville", lat: 41.7508, lon: -88.1535, elevationFt: 690, heightAglFt: 250 },
  { id: "quadcities", name: "Quad Cities Hub", city: "Moline", lat: 41.5067, lon: -90.5151, elevationFt: 581, heightAglFt: 300 },
  { id: "peoria", name: "Peoria Hub", city: "Peoria", lat: 40.6936, lon: -89.589, elevationFt: 470, heightAglFt: 300 },
  { id: "bloomington", name: "Bloomington Hub", city: "Bloomington", lat: 40.4842, lon: -88.9937, elevationFt: 829, heightAglFt: 250 },
  { id: "chicago", name: "Chicago Loop", city: "Chicago", lat: 41.8781, lon: -87.6298, elevationFt: 596, heightAglFt: 400 },
  { id: "joliet", name: "Joliet Hub", city: "Joliet", lat: 41.525, lon: -88.0817, elevationFt: 545, heightAglFt: 250 },
  { id: "champaign", name: "Champaign Hub", city: "Champaign", lat: 40.1164, lon: -88.2434, elevationFt: 741, heightAglFt: 300 },
  { id: "springfield", name: "Springfield Hub", city: "Springfield", lat: 39.7817, lon: -89.6501, elevationFt: 597, heightAglFt: 300 },
];

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function maxLOS(heightAM: number, heightBM: number) {
  const effectiveR = 6371 * (4 / 3);
  return Math.sqrt(2 * effectiveR * (heightAM / 1000)) + Math.sqrt(2 * effectiveR * (heightBM / 1000));
}

function fspl(distKm: number, freqGhz: number) {
  return 92.45 + 20 * Math.log10(freqGhz) + 20 * Math.log10(distKm);
}

function fresnelRadius(distKm: number, freqGhz: number) {
  return Math.sqrt((0.3 / freqGhz) * (distKm * 1000)) / 2;
}

interface HopAnalysis {
  hop: Tower;
  distToHop: number;
  distFromHop: number;
  totalDist: number;
  pathEfficiency: number;
  losViableA: boolean;
  losViableB: boolean;
  fsplA: number;
  fsplB: number;
  fresnelA: number;
  fresnelB: number;
  elevAdvantage: number;
  score: number;
}

export default function NodeHopAnalyzer() {
  const [origin, setOrigin] = useState("mendota");
  const [destination, setDestination] = useState("chicago");
  const [frequency, setFrequency] = useState(11);

  const originTower = TOWERS.find((t) => t.id === origin)!;
  const destTower = TOWERS.find((t) => t.id === destination)!;
  const directDist = haversine(originTower, destTower);

  const analysis = useMemo<HopAnalysis[]>(() => {
    if (origin === destination) return [];

    const candidates = TOWERS.filter((t) => t.id !== origin && t.id !== destination);

    return candidates
      .map((hop) => {
        const distA = haversine(originTower, hop);
        const distB = haversine(hop, destTower);
        const total = distA + distB;
        const efficiency = (directDist / total) * 100;

        const heightAM_A = originTower.heightAglFt * 0.3048;
        const heightAM_hop = hop.heightAglFt * 0.3048;
        const heightAM_B = destTower.heightAglFt * 0.3048;

        const losA = maxLOS(heightAM_A, heightAM_hop);
        const losB = maxLOS(heightAM_hop, heightAM_B);

        const avgElev = (originTower.elevationFt + destTower.elevationFt) / 2;

        return {
          hop,
          distToHop: distA,
          distFromHop: distB,
          totalDist: total,
          pathEfficiency: efficiency,
          losViableA: distA <= losA * 0.9,
          losViableB: distB <= losB * 0.9,
          fsplA: fspl(distA, frequency),
          fsplB: fspl(distB, frequency),
          fresnelA: fresnelRadius(distA, frequency),
          fresnelB: fresnelRadius(distB, frequency),
          elevAdvantage: hop.elevationFt - avgElev,
          score: 0,
        };
      })
      .map((a) => {
        const losScore = (a.losViableA ? 50 : 0) + (a.losViableB ? 50 : 0);
        const effScore = Math.max(0, a.pathEfficiency);
        const heightScore = Math.min(100, (a.hop.heightAglFt / 300) * 100);
        const elevScore = Math.min(100, Math.max(0, (a.elevAdvantage / 200) * 100 + 50));
        const ratio = Math.min(a.distToHop, a.distFromHop) / Math.max(a.distToHop, a.distFromHop);
        const balanceScore = ratio * 100;
        a.score = losScore * 0.35 + effScore * 0.25 + heightScore * 0.15 + elevScore * 0.1 + balanceScore * 0.15;
        return a;
      })
      .sort((a, b) => b.score - a.score);
  }, [origin, destination, frequency, originTower, destTower, directDist]);

  const best = analysis[0];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Origin Tower</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
          >
            {TOWERS.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Destination Tower</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
          >
            {TOWERS.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Frequency (GHz)</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
          >
            <option value={5}>5 GHz (Unlicensed)</option>
            <option value={11}>11 GHz (Licensed PTP)</option>
            <option value={18}>18 GHz (Licensed)</option>
            <option value={60}>60 GHz (V-Band)</option>
          </select>
        </div>
      </div>

      {/* Direct link info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
        <h4 className="font-semibold text-white mb-3">Direct Link Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400 block">Distance</span>
            <span className="text-white font-semibold">
              {directDist.toFixed(1)} km ({(directDist * 0.621371).toFixed(1)} mi)
            </span>
          </div>
          <div>
            <span className="text-gray-400 block">FSPL</span>
            <span className="text-white font-semibold">{fspl(directDist, frequency).toFixed(1)} dB</span>
          </div>
          <div>
            <span className="text-gray-400 block">LOS Viable</span>
            {(() => {
              const los = maxLOS(originTower.heightAglFt * 0.3048, destTower.heightAglFt * 0.3048);
              const viable = directDist <= los * 0.9;
              return (
                <span className={`font-semibold ${viable ? "text-green-400" : "text-red-400"}`}>
                  {viable ? "Yes" : "No"} (max {los.toFixed(0)} km)
                </span>
              );
            })()}
          </div>
          <div>
            <span className="text-gray-400 block">Fresnel Zone</span>
            <span className="text-white font-semibold">{fresnelRadius(directDist, frequency).toFixed(1)} m</span>
          </div>
        </div>
      </div>

      {/* Best hop recommendation */}
      {best && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <h4 className="font-semibold text-amber-400">
              Recommended Hop: {best.hop.name}
            </h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-400 block">Score</span>
              <span className="text-amber-400 font-bold text-lg">{best.score.toFixed(0)}/100</span>
            </div>
            <div>
              <span className="text-gray-400 block">Leg 1</span>
              <span className="text-white">{best.distToHop.toFixed(1)} km</span>
              <span className={`block text-xs ${best.losViableA ? "text-green-400" : "text-red-400"}`}>
                LOS: {best.losViableA ? "OK" : "Blocked"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Leg 2</span>
              <span className="text-white">{best.distFromHop.toFixed(1)} km</span>
              <span className={`block text-xs ${best.losViableB ? "text-green-400" : "text-red-400"}`}>
                LOS: {best.losViableB ? "OK" : "Blocked"}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Path Efficiency</span>
              <span className="text-white">{best.pathEfficiency.toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-gray-400 block">Elevation Advantage</span>
              <span className={best.elevAdvantage >= 0 ? "text-green-400" : "text-red-400"}>
                {best.elevAdvantage >= 0 ? "+" : ""}{best.elevAdvantage.toFixed(0)} ft
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hop rankings table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h4 className="font-semibold text-white">All Hop Candidates (Ranked)</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/50">
              <tr className="text-gray-400 text-left">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Hop Node</th>
                <th className="px-4 py-2">Score</th>
                <th className="px-4 py-2">Leg 1</th>
                <th className="px-4 py-2">Leg 2</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Efficiency</th>
                <th className="px-4 py-2">LOS</th>
                <th className="px-4 py-2">Elev. Adv.</th>
              </tr>
            </thead>
            <tbody>
              {analysis.map((a, i) => (
                <tr
                  key={a.hop.id}
                  className={`border-t border-slate-700/50 ${i === 0 ? "bg-amber-500/5" : "hover:bg-slate-800/50"}`}
                >
                  <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-2 text-white font-medium">{a.hop.city}</td>
                  <td className="px-4 py-2">
                    <span className={`font-semibold ${a.score >= 70 ? "text-green-400" : a.score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                      {a.score.toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-300">{a.distToHop.toFixed(0)} km</td>
                  <td className="px-4 py-2 text-gray-300">{a.distFromHop.toFixed(0)} km</td>
                  <td className="px-4 py-2 text-gray-300">{a.totalDist.toFixed(0)} km</td>
                  <td className="px-4 py-2 text-gray-300">{a.pathEfficiency.toFixed(0)}%</td>
                  <td className="px-4 py-2">
                    <span className={a.losViableA && a.losViableB ? "text-green-400" : a.losViableA || a.losViableB ? "text-amber-400" : "text-red-400"}>
                      {a.losViableA && a.losViableB ? "Both OK" : a.losViableA ? "Leg 1 OK" : a.losViableB ? "Leg 2 OK" : "Neither"}
                    </span>
                  </td>
                  <td className={`px-4 py-2 ${a.elevAdvantage >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {a.elevAdvantage >= 0 ? "+" : ""}{a.elevAdvantage.toFixed(0)} ft
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring methodology */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
        <h4 className="font-semibold text-white mb-3">Scoring Methodology</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          <div className="bg-slate-900/50 rounded p-3">
            <div className="font-semibold text-amber-400 mb-1">LOS Viability (35%)</div>
            <p className="text-gray-400 text-xs">
              Both legs must have clear line-of-sight using 4/3 Earth radius model. 50 points per viable leg.
            </p>
          </div>
          <div className="bg-slate-900/50 rounded p-3">
            <div className="font-semibold text-blue-400 mb-1">Path Efficiency (25%)</div>
            <p className="text-gray-400 text-xs">
              Ratio of direct distance to total hop distance. 100% = no extra distance.
            </p>
          </div>
          <div className="bg-slate-900/50 rounded p-3">
            <div className="font-semibold text-green-400 mb-1">Tower Height (15%)</div>
            <p className="text-gray-400 text-xs">
              Taller towers provide better relay capability. Normalized to 300 ft reference.
            </p>
          </div>
          <div className="bg-slate-900/50 rounded p-3">
            <div className="font-semibold text-purple-400 mb-1">Elevation (10%)</div>
            <p className="text-gray-400 text-xs">
              Higher ground elevation improves LOS. Measured vs. average of origin/destination.
            </p>
          </div>
          <div className="bg-slate-900/50 rounded p-3">
            <div className="font-semibold text-cyan-400 mb-1">Link Balance (15%)</div>
            <p className="text-gray-400 text-xs">
              Equal-length legs are preferred. Ratio of shorter to longer leg distance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
