"use client";

import { useState, useMemo } from "react";
import {
  freeSpacePathLoss,
  fresnelZoneRadiusMidpoint,
  requiredClearance,
  linkBudget,
  fadeMargin,
  maxRange,
  analyzeLinkBudget,
  eirp,
  rainAttenuation,
  atmosphericAttenuation,
} from "@/lib/calculations/rfPropagation";

interface CityLink {
  id: string;
  name: string;
  distanceKm: number;
  bearing: string;
  elevationFt: number;
  terrain: string;
  directLink: boolean; // can Mendota reach directly?
  relayVia?: string;
}

const cityLinks: CityLink[] = [
  {
    id: "lasalle",
    name: "LaSalle-Peru",
    distanceKm: 23,
    bearing: "S",
    elevationFt: 659,
    terrain: "Flat agricultural, clear LOS",
    directLink: true,
  },
  {
    id: "ottawa",
    name: "Ottawa",
    distanceKm: 30,
    bearing: "SE",
    elevationFt: 481,
    terrain: "Flat, Illinois River valley",
    directLink: true,
  },
  {
    id: "dekalb",
    name: "DeKalb",
    distanceKm: 46,
    bearing: "NE",
    elevationFt: 879,
    terrain: "Flat prairie, minimal obstructions",
    directLink: true,
  },
  {
    id: "sterling",
    name: "Sterling-Rock Falls",
    distanceKm: 53,
    bearing: "W",
    elevationFt: 643,
    terrain: "Flat agricultural",
    directLink: true,
  },
  {
    id: "rockford",
    name: "Rockford",
    distanceKm: 80,
    bearing: "N",
    elevationFt: 728,
    terrain: "Flat to rolling prairie",
    directLink: true,
  },
  {
    id: "peoria",
    name: "Peoria",
    distanceKm: 100,
    bearing: "SW",
    elevationFt: 470,
    terrain: "Illinois River corridor, some tree cover",
    directLink: false,
    relayVia: "LaSalle-Peru",
  },
  {
    id: "quadcities",
    name: "Quad Cities (Moline)",
    distanceKm: 110,
    bearing: "W",
    elevationFt: 581,
    terrain: "Flat prairie, Mississippi River approach",
    directLink: false,
    relayVia: "Sterling",
  },
  {
    id: "naperville",
    name: "Chicago / Naperville",
    distanceKm: 113,
    bearing: "E",
    elevationFt: 690,
    terrain: "Flat suburban sprawl, need relay",
    directLink: false,
    relayVia: "DeKalb",
  },
];

// Radio equipment presets
interface RadioPreset {
  name: string;
  txPowerDbm: number;
  gainDbi: number;
  sensitivityDbm: number;
  frequencyMHz: number;
  bandwidthMbps: string;
  notes: string;
}

const radioPresets: RadioPreset[] = [
  {
    name: "Ubiquiti AirFiber 24HD",
    txPowerDbm: 20,
    gainDbi: 33,
    sensitivityDbm: -68,
    frequencyMHz: 24250,
    bandwidthMbps: "2 Gbps",
    notes: "24 GHz, licensed, heavy rain attenuation, short-medium range",
  },
  {
    name: "Ubiquiti AirFiber 11FX",
    txPowerDbm: 27,
    gainDbi: 38,
    sensitivityDbm: -67,
    frequencyMHz: 11000,
    bandwidthMbps: "1.2 Gbps",
    notes: "11 GHz, licensed, moderate rain impact, medium-long range",
  },
  {
    name: "Cambium PTP 820S (11 GHz)",
    txPowerDbm: 23,
    gainDbi: 37,
    sensitivityDbm: -72,
    frequencyMHz: 11000,
    bandwidthMbps: "900 Mbps",
    notes: "11 GHz, carrier-grade, licensed, excellent reliability",
  },
  {
    name: "Ubiquiti AirFiber 5XHD",
    txPowerDbm: 27,
    gainDbi: 23,
    sensitivityDbm: -91,
    frequencyMHz: 5800,
    bandwidthMbps: "1 Gbps",
    notes: "5 GHz, PTMP/PTP, unlicensed, good range, rain-resistant",
  },
  {
    name: "Cambium PTP 670 (5 GHz)",
    txPowerDbm: 27,
    gainDbi: 23,
    sensitivityDbm: -93,
    frequencyMHz: 5400,
    bandwidthMbps: "750 Mbps",
    notes: "5 GHz, carrier-grade, unlicensed, long range",
  },
  {
    name: "Mikrotik Cube 60G (60 GHz)",
    txPowerDbm: 14,
    gainDbi: 38,
    sensitivityDbm: -58,
    frequencyMHz: 60000,
    bandwidthMbps: "1.8 Gbps",
    notes: "60 GHz, very short range, oxygen absorption, massive bandwidth",
  },
];

export default function MendotaLinkBudget() {
  const [selectedLink, setSelectedLink] = useState("dekalb");
  const [selectedRadio, setSelectedRadio] = useState(0);
  const [towerHeight, setTowerHeight] = useState(60); // meters
  const [remoteHeight, setRemoteHeight] = useState(30); // meters
  const [miscLossDb, setMiscLossDb] = useState(3);

  const link = cityLinks.find((l) => l.id === selectedLink)!;
  const radio = radioPresets[selectedRadio];

  const analysis = useMemo(() => {
    const freqGHz = radio.frequencyMHz / 1000;

    // Full link budget
    const result = analyzeLinkBudget({
      txPowerDbm: radio.txPowerDbm,
      txGainDbi: radio.gainDbi,
      rxGainDbi: radio.gainDbi,
      distanceKm: link.distanceKm,
      frequencyMHz: radio.frequencyMHz,
      miscLossDb: miscLossDb,
      rxSensitivityDbm: radio.sensitivityDbm,
    });

    // Rain attenuation (moderate rain: 25 mm/hr for Illinois thunderstorms)
    const rainLoss = rainAttenuation(freqGHz, 25, link.distanceKm);
    const heavyRainLoss = rainAttenuation(freqGHz, 50, link.distanceKm);

    // Atmospheric
    const atmosLoss = atmosphericAttenuation(freqGHz, link.distanceKm);

    // Rain-adjusted fade margin
    const rainAdjustedFadeMargin = result.fadeMarginDb - rainLoss;
    const heavyRainFadeMargin = result.fadeMarginDb - heavyRainLoss - atmosLoss;

    // Earth curvature for this distance (approximate)
    // h = d² / (2 * R * k) where R=6371km, k=4/3 (standard atmosphere)
    const earthCurvatureM =
      (link.distanceKm * link.distanceKm) / (2 * 6371 * (4 / 3));

    // Line of sight check
    const mendotaElevM = 751 * 0.3048;
    const remoteElevM = link.elevationFt * 0.3048;
    const losDistanceKm = 3.57 * (Math.sqrt(towerHeight) + Math.sqrt(remoteHeight));

    // Max range with this radio
    const maxRangeKm = maxRange(
      radio.txPowerDbm,
      radio.gainDbi,
      radio.gainDbi,
      radio.sensitivityDbm,
      radio.frequencyMHz,
      10
    );

    // EIRP
    const eirpDbm = eirp(radio.txPowerDbm, radio.gainDbi, miscLossDb);

    return {
      ...result,
      rainLoss,
      heavyRainLoss,
      atmosLoss,
      rainAdjustedFadeMargin,
      heavyRainFadeMargin,
      earthCurvatureM,
      losDistanceKm,
      maxRangeKm,
      eirpDbm,
    };
  }, [selectedLink, selectedRadio, towerHeight, remoteHeight, miscLossDb, link, radio]);

  const getStatusColor = (margin: number) => {
    if (margin > 20) return "text-green-400";
    if (margin > 10) return "text-yellow-400";
    if (margin > 0) return "text-orange-400";
    return "text-red-400";
  };

  const getStatusText = (margin: number) => {
    if (margin > 20) return "Excellent";
    if (margin > 10) return "Good";
    if (margin > 0) return "Marginal";
    return "Not Viable";
  };

  return (
    <div className="space-y-6">
      {/* Selector Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Destination Selector */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <label className="block text-sm font-semibold text-white mb-2">
            Destination City
          </label>
          <select
            value={selectedLink}
            onChange={(e) => setSelectedLink(e.target.value)}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600"
          >
            {cityLinks.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name} — {city.distanceKm} km ({city.bearing})
                {!city.directLink ? " [relay needed]" : ""}
              </option>
            ))}
          </select>

          <div className="mt-3 text-xs text-gray-400 space-y-1">
            <div>
              Bearing: <span className="text-white">{link.bearing}</span> |
              Distance:{" "}
              <span className="text-white">{link.distanceKm} km</span>
            </div>
            <div>
              Remote elevation:{" "}
              <span className="text-white">{link.elevationFt} ft ASL</span>
            </div>
            <div>
              Terrain: <span className="text-white">{link.terrain}</span>
            </div>
            {!link.directLink && (
              <div className="text-amber-400">
                Relay recommended via: {link.relayVia}
              </div>
            )}
          </div>
        </div>

        {/* Radio Selector */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <label className="block text-sm font-semibold text-white mb-2">
            Radio Equipment
          </label>
          <select
            value={selectedRadio}
            onChange={(e) => setSelectedRadio(parseInt(e.target.value))}
            className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600"
          >
            {radioPresets.map((r, i) => (
              <option key={i} value={i}>
                {r.name} ({r.bandwidthMbps})
              </option>
            ))}
          </select>

          <div className="mt-3 text-xs text-gray-400 space-y-1">
            <div>
              TX Power:{" "}
              <span className="text-white">{radio.txPowerDbm} dBm</span> |
              Gain: <span className="text-white">{radio.gainDbi} dBi</span>
            </div>
            <div>
              Sensitivity:{" "}
              <span className="text-white">{radio.sensitivityDbm} dBm</span> |
              Freq:{" "}
              <span className="text-white">
                {(radio.frequencyMHz / 1000).toFixed(1)} GHz
              </span>
            </div>
            <div className="text-gray-500">{radio.notes}</div>
          </div>
        </div>
      </div>

      {/* Tower Heights */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <label className="block text-sm text-gray-400 mb-1">
            Mendota Tower Height
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="30"
              max="120"
              value={towerHeight}
              onChange={(e) => setTowerHeight(parseInt(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="text-white text-sm font-mono w-16 text-right">
              {towerHeight}m
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ({(towerHeight * 3.281).toFixed(0)} ft)
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <label className="block text-sm text-gray-400 mb-1">
            Remote Tower Height
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="120"
              value={remoteHeight}
              onChange={(e) => setRemoteHeight(parseInt(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-white text-sm font-mono w-16 text-right">
              {remoteHeight}m
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ({(remoteHeight * 3.281).toFixed(0)} ft)
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <label className="block text-sm text-gray-400 mb-1">
            Cable/Misc Losses
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="10"
              value={miscLossDb}
              onChange={(e) => setMiscLossDb(parseInt(e.target.value))}
              className="flex-1 accent-gray-500"
            />
            <span className="text-white text-sm font-mono w-16 text-right">
              {miscLossDb} dB
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Cables, connectors, alignment
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Link Status */}
        <div
          className={`rounded-lg p-4 border ${
            analysis.fadeMarginDb > 10
              ? "bg-green-500/10 border-green-500/30"
              : analysis.fadeMarginDb > 0
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-red-500/10 border-red-500/30"
          }`}
        >
          <div className="text-xs text-gray-400">Clear-Sky Link Status</div>
          <div
            className={`text-2xl font-bold ${getStatusColor(analysis.fadeMarginDb)}`}
          >
            {getStatusText(analysis.fadeMarginDb)}
          </div>
          <div className="text-xs text-gray-500">
            Fade margin: {analysis.fadeMarginDb.toFixed(1)} dB
          </div>
        </div>

        {/* Rain-adjusted */}
        <div
          className={`rounded-lg p-4 border ${
            analysis.rainAdjustedFadeMargin > 10
              ? "bg-green-500/10 border-green-500/30"
              : analysis.rainAdjustedFadeMargin > 0
                ? "bg-yellow-500/10 border-yellow-500/30"
                : "bg-red-500/10 border-red-500/30"
          }`}
        >
          <div className="text-xs text-gray-400">
            Rain-Adjusted (25mm/hr)
          </div>
          <div
            className={`text-2xl font-bold ${getStatusColor(analysis.rainAdjustedFadeMargin)}`}
          >
            {getStatusText(analysis.rainAdjustedFadeMargin)}
          </div>
          <div className="text-xs text-gray-500">
            Rain loss: {analysis.rainLoss.toFixed(1)} dB | Net margin:{" "}
            {analysis.rainAdjustedFadeMargin.toFixed(1)} dB
          </div>
        </div>

        {/* Path Loss */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-xs text-gray-400">Free Space Path Loss</div>
          <div className="text-2xl font-bold text-white font-mono">
            {analysis.pathLossDb.toFixed(1)} dB
          </div>
          <div className="text-xs text-gray-500">
            EIRP: {analysis.eirpDbm.toFixed(1)} dBm
          </div>
        </div>

        {/* Fresnel */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-xs text-gray-400">Fresnel Zone (60%)</div>
          <div className="text-2xl font-bold text-white font-mono">
            {analysis.requiredClearanceM.toFixed(1)} m
          </div>
          <div className="text-xs text-gray-500">
            Full F1: {analysis.fresnelRadiusM.toFixed(1)} m
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-white mb-3">
            Link Parameters
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">FSPL:</span>
              <span className="text-white font-mono">
                {analysis.pathLossDb.toFixed(2)} dB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Received Power:</span>
              <span className="text-white font-mono">
                {analysis.receivedPowerDbm.toFixed(2)} dBm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fade Margin (clear):</span>
              <span
                className={`font-mono font-semibold ${getStatusColor(analysis.fadeMarginDb)}`}
              >
                {analysis.fadeMarginDb.toFixed(2)} dB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rain Attenuation (25mm/hr):</span>
              <span className="text-yellow-400 font-mono">
                {analysis.rainLoss.toFixed(2)} dB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">
                Heavy Rain (50mm/hr):
              </span>
              <span className="text-red-400 font-mono">
                {analysis.heavyRainLoss.toFixed(2)} dB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Atmospheric Loss:</span>
              <span className="text-white font-mono">
                {analysis.atmosLoss.toFixed(2)} dB
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-2">
              <span className="text-gray-400">Max Radio Range (FSPL):</span>
              <span className="text-white font-mono">
                {analysis.maxRangeKm.toFixed(1)} km
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-white mb-3">
            Geometry &amp; LOS
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Mendota Elevation:</span>
              <span className="text-white">751 ft (229 m) ASL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mendota + Tower:</span>
              <span className="text-white font-mono">
                {(229 + towerHeight).toFixed(0)} m ASL
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Remote Elevation:</span>
              <span className="text-white">
                {link.elevationFt} ft (
                {(link.elevationFt * 0.3048).toFixed(0)} m) ASL
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Remote + Tower:</span>
              <span className="text-white font-mono">
                {(link.elevationFt * 0.3048 + remoteHeight).toFixed(0)} m ASL
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Earth Curvature:</span>
              <span className="text-white font-mono">
                {analysis.earthCurvatureM.toFixed(1)} m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">
                Radio Horizon (4/3 Earth):
              </span>
              <span className="text-white font-mono">
                {analysis.losDistanceKm.toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-2">
              <span className="text-gray-400">LOS vs. Distance:</span>
              <span
                className={
                  analysis.losDistanceKm > link.distanceKm
                    ? "text-green-400 font-semibold"
                    : "text-red-400 font-semibold"
                }
              >
                {analysis.losDistanceKm > link.distanceKm
                  ? `CLEAR (+${(analysis.losDistanceKm - link.distanceKm).toFixed(1)} km margin)`
                  : `OBSTRUCTED (${(link.distanceKm - analysis.losDistanceKm).toFixed(1)} km short)`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Source Attribution */}
      <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 text-xs text-gray-500">
        <span className="font-medium text-gray-400">
          Calculations based on:{" "}
        </span>
        <a
          href="https://www.ve2dbe.com/english1.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          VE2DBE Radio Mobile
        </a>
        {" | "}
        <a
          href="https://en.wikipedia.org/wiki/Free-space_path_loss"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          FSPL (Wikipedia)
        </a>
        {" | "}
        <a
          href="https://its.ntia.gov/software/itm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          ITM Longley-Rice (NTIA)
        </a>
        . For site-specific path analysis, use{" "}
        <a
          href="https://www.ve2dbe.com/english1.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Radio Mobile Online
        </a>{" "}
        with actual terrain elevation data.
      </div>
    </div>
  );
}
