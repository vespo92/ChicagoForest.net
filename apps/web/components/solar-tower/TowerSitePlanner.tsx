"use client";

import { useState, useMemo } from "react";

interface ParcelConfig {
  corner: "NW" | "NE";
  towerHeight: number; // meters
  towerBaseSize: number; // meters
  fiberApproach: "north" | "road";
}

export default function TowerSitePlanner() {
  const [config, setConfig] = useState<ParcelConfig>({
    corner: "NW",
    towerHeight: 60,
    towerBaseSize: 6,
    fiberApproach: "road",
  });

  // Shadow calculations for Mendota, IL latitude (41.55°N)
  // Winter solstice sun angle ~25°, Summer ~72°
  const shadowAnalysis = useMemo(() => {
    const latRad = (41.55 * Math.PI) / 180;
    // Sun altitude at winter solstice solar noon = 90 - lat - 23.44
    const winterSunAlt = 90 - 41.55 - 23.44; // ~25.01°
    // Sun altitude at equinox solar noon = 90 - lat
    const equinoxSunAlt = 90 - 41.55; // ~48.45°
    // Sun altitude at summer solstice solar noon = 90 - lat + 23.44
    const summerSunAlt = 90 - 41.55 + 23.44; // ~71.89°

    const winterShadow =
      config.towerHeight / Math.tan((winterSunAlt * Math.PI) / 180);
    const equinoxShadow =
      config.towerHeight / Math.tan((equinoxSunAlt * Math.PI) / 180);
    const summerShadow =
      config.towerHeight / Math.tan((summerSunAlt * Math.PI) / 180);

    return {
      winterSunAlt: winterSunAlt.toFixed(1),
      equinoxSunAlt: equinoxSunAlt.toFixed(1),
      summerSunAlt: summerSunAlt.toFixed(1),
      winterShadowM: winterShadow.toFixed(1),
      equinoxShadowM: equinoxShadow.toFixed(1),
      summerShadowM: summerShadow.toFixed(1),
      winterShadowFt: (winterShadow * 3.281).toFixed(0),
      equinoxShadowFt: (equinoxShadow * 3.281).toFixed(0),
      summerShadowFt: (summerShadow * 3.281).toFixed(0),
    };
  }, [config.towerHeight]);

  // Fiber boring estimate
  const fiberEstimate = useMemo(() => {
    // NW corner: road access likely from the west/north
    // NE corner: road access likely from the east/north
    // Typical bore rate: $15-25/ft for directional boring
    const approachDistanceFt = config.fiberApproach === "road" ? 200 : 500;
    const propertyBoreFt = config.corner === "NW" ? 150 : 200; // NW closer to likely road access
    const totalFt = approachDistanceFt + propertyBoreFt;
    const costLow = totalFt * 15;
    const costHigh = totalFt * 25;
    return {
      approachDistanceFt,
      propertyBoreFt,
      totalFt,
      costLow,
      costHigh,
    };
  }, [config.corner, config.fiberApproach]);

  return (
    <div className="space-y-8">
      {/* Configuration Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-white mb-4">
            Tower Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Tower Placement Corner
              </label>
              <div className="flex gap-3">
                {(["NW", "NE"] as const).map((corner) => (
                  <button
                    key={corner}
                    onClick={() => setConfig({ ...config, corner })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      config.corner === corner
                        ? "bg-amber-500 text-black"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    {corner} Corner
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Tower Height: {config.towerHeight}m (
                {(config.towerHeight * 3.281).toFixed(0)} ft)
              </label>
              <input
                type="range"
                min="30"
                max="120"
                value={config.towerHeight}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    towerHeight: parseInt(e.target.value),
                  })
                }
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>30m (100ft)</span>
                <span>120m (394ft)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Fiber Approach
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setConfig({ ...config, fiberApproach: "road" })
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    config.fiberApproach === "road"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  Road Right-of-Way
                </button>
                <button
                  onClick={() =>
                    setConfig({ ...config, fiberApproach: "north" })
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    config.fiberApproach === "north"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }`}
                >
                  North Property Edge
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Parcel Visual */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-white mb-4">
            Site Layout (Top-Down View)
          </h3>
          <div className="relative">
            <svg viewBox="0 0 300 250" className="w-full">
              {/* Parcel boundary */}
              <rect
                x="30"
                y="30"
                width="240"
                height="190"
                fill="#1a2e1a"
                stroke="#4a7c4a"
                strokeWidth="2"
                rx="2"
              />

              {/* Solar panel grid */}
              {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 10 }).map((_, col) => {
                  const px = 50 + col * 22;
                  const py = 55 + row * 22;
                  // Skip cells near tower
                  const towerX = config.corner === "NW" ? 55 : 245;
                  const towerY = 55;
                  const dist = Math.sqrt(
                    (px - towerX) ** 2 + (py - towerY) ** 2
                  );
                  if (dist < 35) return null;
                  return (
                    <rect
                      key={`${row}-${col}`}
                      x={px}
                      y={py}
                      width="18"
                      height="12"
                      fill="#2563eb"
                      opacity="0.6"
                      rx="1"
                    />
                  );
                })
              )}

              {/* Shadow projection (winter - longest) */}
              {(() => {
                const towerX = config.corner === "NW" ? 55 : 245;
                const towerY = 55;
                // Shadow falls south in northern hemisphere
                const shadowLengthScaled = Math.min(
                  parseFloat(shadowAnalysis.winterShadowM) * 0.8,
                  180
                );
                return (
                  <g>
                    {/* Shadow polygon - cast to south */}
                    <polygon
                      points={`${towerX - 5},${towerY + 5} ${towerX + 5},${towerY + 5} ${towerX + 15},${towerY + shadowLengthScaled} ${towerX - 15},${towerY + shadowLengthScaled}`}
                      fill="#000"
                      opacity="0.15"
                    />
                    <text
                      x={towerX}
                      y={towerY + shadowLengthScaled + 12}
                      textAnchor="middle"
                      className="text-[8px] fill-gray-500"
                    >
                      Winter shadow: {shadowAnalysis.winterShadowM}m
                    </text>
                  </g>
                );
              })()}

              {/* Tower icon */}
              {(() => {
                const towerX = config.corner === "NW" ? 55 : 245;
                const towerY = 55;
                return (
                  <g>
                    {/* Tower base */}
                    <rect
                      x={towerX - 8}
                      y={towerY - 8}
                      width="16"
                      height="16"
                      fill="#f59e0b"
                      rx="2"
                    />
                    <text
                      x={towerX}
                      y={towerY + 3}
                      textAnchor="middle"
                      className="text-[8px] fill-black font-bold"
                    >
                      T
                    </text>
                    {/* Label */}
                    <text
                      x={towerX}
                      y={towerY - 14}
                      textAnchor="middle"
                      className="text-[7px] fill-amber-400 font-bold"
                    >
                      TOWER
                    </text>
                  </g>
                );
              })()}

              {/* Fiber route */}
              {(() => {
                const towerX = config.corner === "NW" ? 55 : 245;
                const towerY = 55;
                return (
                  <g>
                    <line
                      x1={towerX}
                      y1={towerY}
                      x2={config.fiberApproach === "road" ? towerX : towerX}
                      y2="30"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                    />
                    {config.fiberApproach === "road" && (
                      <line
                        x1={towerX}
                        y1="30"
                        x2={config.corner === "NW" ? 30 : 270}
                        y2="25"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />
                    )}
                    <text
                      x={config.corner === "NW" ? 30 : 270}
                      y="18"
                      textAnchor={config.corner === "NW" ? "start" : "end"}
                      className="text-[7px] fill-red-400"
                    >
                      Fiber bore path
                    </text>
                  </g>
                );
              })()}

              {/* Road indication */}
              <rect
                x="25"
                y="15"
                width="250"
                height="12"
                fill="#374151"
                opacity="0.5"
                rx="1"
              />
              <text
                x="150"
                y="24"
                textAnchor="middle"
                className="text-[7px] fill-gray-400"
              >
                Road / Right-of-Way
              </text>

              {/* Property edge labels */}
              <text
                x="150"
                y="42"
                textAnchor="middle"
                className="text-[6px] fill-green-500"
              >
                North Property Line
              </text>
              <text
                x="150"
                y="228"
                textAnchor="middle"
                className="text-[6px] fill-green-500"
              >
                South Property Line
              </text>

              {/* Compass */}
              <g transform="translate(260, 215)">
                <circle r="12" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                <text
                  y="-4"
                  textAnchor="middle"
                  className="text-[7px] fill-white font-bold"
                >
                  N
                </text>
                <line
                  x1="0"
                  y1="-2"
                  x2="0"
                  y2="6"
                  stroke="#fff"
                  strokeWidth="1"
                />
                <polygon points="0,-8 -3,-2 3,-2" fill="#ef4444" />
              </g>

              {/* Legend */}
              <g transform="translate(35, 200)">
                <rect
                  width="8"
                  height="5"
                  fill="#2563eb"
                  opacity="0.6"
                  rx="1"
                />
                <text x="12" y="5" className="text-[6px] fill-gray-400">
                  Solar Panels
                </text>

                <rect
                  y="10"
                  width="8"
                  height="8"
                  fill="#f59e0b"
                  rx="1"
                />
                <text x="12" y="17" className="text-[6px] fill-gray-400">
                  Tower Base
                </text>

                <line
                  x1="0"
                  y1="25"
                  x2="8"
                  y2="25"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="3 1"
                />
                <text x="12" y="28" className="text-[6px] fill-gray-400">
                  Fiber Route
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Shadow Analysis Results */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-amber-400 mb-3">
            Winter Solstice (Dec 21)
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Sun Angle:</span>
              <span className="text-white">
                {shadowAnalysis.winterSunAlt}&deg;
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shadow Length:</span>
              <span className="text-red-400 font-semibold">
                {shadowAnalysis.winterShadowM}m (
                {shadowAnalysis.winterShadowFt}ft)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Longest shadow of the year. Critical for placement.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-blue-400 mb-3">
            Equinox (Mar/Sep)
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Sun Angle:</span>
              <span className="text-white">
                {shadowAnalysis.equinoxSunAlt}&deg;
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shadow Length:</span>
              <span className="text-yellow-400 font-semibold">
                {shadowAnalysis.equinoxShadowM}m (
                {shadowAnalysis.equinoxShadowFt}ft)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Moderate shadow. Represents average annual impact.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h4 className="text-sm font-semibold text-green-400 mb-3">
            Summer Solstice (Jun 21)
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Sun Angle:</span>
              <span className="text-white">
                {shadowAnalysis.summerSunAlt}&deg;
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shadow Length:</span>
              <span className="text-green-400 font-semibold">
                {shadowAnalysis.summerShadowM}m (
                {shadowAnalysis.summerShadowFt}ft)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Minimal shadow impact during peak solar production.
            </p>
          </div>
        </div>
      </div>

      {/* Placement Recommendation */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-amber-400 mb-3">
          Placement Recommendation
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-2">
              NW Corner (Recommended)
            </h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>
                + Shadow falls south/southeast - away from majority of panels
              </li>
              <li>+ Shortest fiber bore path to road right-of-way</li>
              <li>+ Minimal disruption to panel array during construction</li>
              <li>+ Easy equipment access from road</li>
              <li>
                + Morning shadow falls west (off-property or minimal panel area)
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">NE Corner</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>+ Shadow falls south/southwest in afternoon</li>
              <li>
                - Afternoon shadow may impact more panels (shadow moves west)
              </li>
              <li>- Slightly longer fiber bore depending on road access</li>
              <li>+ Good if road access is from the east</li>
              <li>= Consider if NE has better road proximity</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-slate-800/50 rounded text-sm text-gray-400">
          <strong className="text-white">Key Insight:</strong> At Mendota&apos;s
          latitude (41.55&deg;N), the sun is always in the southern sky. A tower
          in the NW corner casts its shadow primarily to the south and east
          during peak hours. With a {config.towerHeight}m tower, the worst-case
          winter shadow extends {shadowAnalysis.winterShadowM}m — plan your
          panel-free exclusion zone accordingly. Consider keeping a{" "}
          {Math.ceil(parseFloat(shadowAnalysis.winterShadowM) * 1.1)}m buffer
          zone south of the tower.
        </div>
      </div>

      {/* Fiber Boring Estimate */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-3">
          Fiber Optic Boring Estimate
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">
                Approach (road to property):
              </span>
              <span className="text-white">
                ~{fiberEstimate.approachDistanceFt} ft
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">
                On-property bore (to tower base):
              </span>
              <span className="text-white">
                ~{fiberEstimate.propertyBoreFt} ft
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-2">
              <span className="text-gray-400 font-medium">Total bore:</span>
              <span className="text-white font-semibold">
                ~{fiberEstimate.totalFt} ft
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estimated cost range:</span>
              <span className="text-blue-400 font-semibold">
                ${fiberEstimate.costLow.toLocaleString()} - $
                {fiberEstimate.costHigh.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            <p className="mb-2">
              <strong className="text-white">Directional boring</strong> is the
              preferred method to avoid disturbing solar panel foundations and
              underground wiring.
            </p>
            <p className="mb-2">
              Rate: $15-25/ft typical for Illinois (varies by soil conditions
              and existing utilities).
            </p>
            <p>
              <strong className="text-white">
                Minimizing on-property boring:
              </strong>{" "}
              Placing the tower in the {config.corner} corner reduces the fiber
              run across active solar infrastructure. Route should follow
              property edges, not cut through panel arrays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
