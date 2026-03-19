"use client";

import { useState, useMemo } from "react";

interface TowerEntry {
  id: string;
  name: string;
  city: string;
  county: string;
  lat: number;
  lon: number;
  elevationFt: number;
  heightAglFt: number;
  owner: string;
  structureType: string;
  population: number;
  notes: string;
  type: "origin" | "relay" | "hub" | "future";
  phase: string;
}

const TOWERS: TowerEntry[] = [
  {
    id: "mendota-primary",
    name: "Mendota Solar Tower",
    city: "Mendota",
    county: "LaSalle",
    lat: 41.5475,
    lon: -89.1178,
    elevationFt: 751,
    heightAglFt: 200,
    owner: "Chicago Forest Network",
    structureType: "Self-Support Lattice",
    population: 7300,
    notes: "Primary junction hub",
    type: "origin",
    phase: "Phase 1",
  },
  {
    id: "lasalle-relay",
    name: "LaSalle-Peru Relay",
    city: "LaSalle",
    county: "LaSalle",
    lat: 41.3454,
    lon: -89.0916,
    elevationFt: 659,
    heightAglFt: 200,
    owner: "Co-location target",
    structureType: "Monopole",
    population: 20000,
    notes: "Illinois River corridor relay",
    type: "relay",
    phase: "Phase 1",
  },
  {
    id: "dekalb-relay",
    name: "DeKalb Relay",
    city: "DeKalb",
    county: "DeKalb",
    lat: 41.9295,
    lon: -88.7502,
    elevationFt: 879,
    heightAglFt: 300,
    owner: "Co-location target",
    structureType: "Lattice",
    population: 44000,
    notes: "Highest elevation in network - key Chicago relay",
    type: "relay",
    phase: "Phase 2",
  },
  {
    id: "ottawa-relay",
    name: "Ottawa Relay",
    city: "Ottawa",
    county: "LaSalle",
    lat: 41.3456,
    lon: -88.8426,
    elevationFt: 481,
    heightAglFt: 200,
    owner: "Co-location target",
    structureType: "Monopole",
    population: 19000,
    notes: "Illinois River valley relay",
    type: "relay",
    phase: "Phase 2",
  },
  {
    id: "sterling-relay",
    name: "Sterling Relay",
    city: "Sterling",
    county: "Whiteside",
    lat: 41.7886,
    lon: -89.6962,
    elevationFt: 643,
    heightAglFt: 200,
    owner: "Co-location target",
    structureType: "Guyed",
    population: 15000,
    notes: "Western relay toward Quad Cities",
    type: "relay",
    phase: "Phase 2",
  },
  {
    id: "rockford-hub",
    name: "Rockford Hub",
    city: "Rockford",
    county: "Winnebago",
    lat: 42.2711,
    lon: -89.094,
    elevationFt: 728,
    heightAglFt: 300,
    owner: "Co-location target",
    structureType: "Lattice",
    population: 148000,
    notes: "Northern anchor - 2nd largest IL city outside Chicago metro",
    type: "hub",
    phase: "Phase 2",
  },
  {
    id: "naperville-hub",
    name: "Naperville / Aurora Hub",
    city: "Naperville",
    county: "DuPage",
    lat: 41.7508,
    lon: -88.1535,
    elevationFt: 690,
    heightAglFt: 250,
    owner: "Co-location target",
    structureType: "Monopole",
    population: 203000,
    notes: "Gateway to Chicago metro",
    type: "hub",
    phase: "Phase 2",
  },
  {
    id: "quadcities-hub",
    name: "Quad Cities Hub",
    city: "Moline",
    county: "Rock Island",
    lat: 41.5067,
    lon: -90.5151,
    elevationFt: 581,
    heightAglFt: 300,
    owner: "Co-location target",
    structureType: "Self-Support",
    population: 150000,
    notes: "Western anchor - Iowa border expansion",
    type: "hub",
    phase: "Phase 2",
  },
  {
    id: "peoria-hub",
    name: "Peoria Hub",
    city: "Peoria",
    county: "Peoria",
    lat: 40.6936,
    lon: -89.589,
    elevationFt: 470,
    heightAglFt: 300,
    owner: "Co-location target",
    structureType: "Lattice",
    population: 113000,
    notes: "Central IL anchor - Caterpillar HQ",
    type: "hub",
    phase: "Phase 3",
  },
  {
    id: "bloomington-hub",
    name: "Bloomington-Normal Hub",
    city: "Bloomington",
    county: "McLean",
    lat: 40.4842,
    lon: -88.9937,
    elevationFt: 829,
    heightAglFt: 250,
    owner: "Co-location target",
    structureType: "Self-Support",
    population: 133000,
    notes: "High elevation advantage - State Farm HQ",
    type: "hub",
    phase: "Phase 3",
  },
  {
    id: "chicago-loop",
    name: "Chicago Loop",
    city: "Chicago",
    county: "Cook",
    lat: 41.8781,
    lon: -87.6298,
    elevationFt: 596,
    heightAglFt: 400,
    owner: "Target rooftop or tower",
    structureType: "Building",
    population: 2700000,
    notes: "Ultimate Chicago endpoint",
    type: "hub",
    phase: "Phase 3",
  },
  {
    id: "joliet-hub",
    name: "Joliet Hub",
    city: "Joliet",
    county: "Will",
    lat: 41.525,
    lon: -88.0817,
    elevationFt: 545,
    heightAglFt: 250,
    owner: "Co-location target",
    structureType: "Monopole",
    population: 150000,
    notes: "Southern Chicago suburbs - data center corridor",
    type: "future",
    phase: "Phase 4",
  },
  {
    id: "champaign-hub",
    name: "Champaign-Urbana",
    city: "Champaign",
    county: "Champaign",
    lat: 40.1164,
    lon: -88.2434,
    elevationFt: 741,
    heightAglFt: 300,
    owner: "Co-location / UIUC",
    structureType: "Lattice",
    population: 108000,
    notes: "University of Illinois research corridor",
    type: "future",
    phase: "Phase 4",
  },
  {
    id: "springfield-hub",
    name: "Springfield Hub",
    city: "Springfield",
    county: "Sangamon",
    lat: 39.7817,
    lon: -89.6501,
    elevationFt: 597,
    heightAglFt: 300,
    owner: "Co-location target",
    structureType: "Self-Support",
    population: 115000,
    notes: "State capital - government connectivity",
    type: "future",
    phase: "Phase 4",
  },
];

// Haversine distance
function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const km = R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return { km, mi: km * 0.621371 };
}

function bearing(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const deg = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return { deg, cardinal: dirs[Math.round(deg / 22.5) % 16] };
}

const typeColors: Record<string, string> = {
  origin: "#f59e0b",
  relay: "#6b7280",
  hub: "#3b82f6",
  future: "#8b5cf6",
};

const typeLabels: Record<string, string> = {
  origin: "Origin Tower",
  relay: "Relay Node",
  hub: "Metro Hub",
  future: "Future Expansion",
};

export default function TowerDataExplorer() {
  const [selectedTower, setSelectedTower] = useState<string>("mendota-primary");
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredTowers = useMemo(() => {
    return TOWERS.filter((t) => {
      if (filterPhase !== "all" && t.phase !== filterPhase) return false;
      if (filterType !== "all" && t.type !== filterType) return false;
      return true;
    });
  }, [filterPhase, filterType]);

  const selected = TOWERS.find((t) => t.id === selectedTower);
  const mendota = TOWERS[0];

  // Map coordinate projection (simple Mercator-like for IL area)
  const mapBounds = { north: 42.5, south: 39.5, east: -87.0, west: -91.0 };
  const toMapX = (lon: number) => ((lon - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
  const toMapY = (lat: number) => ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100;

  // Links from Mendota to each node (simplified network)
  const networkLinks = [
    { from: "mendota-primary", to: "lasalle-relay" },
    { from: "mendota-primary", to: "dekalb-relay" },
    { from: "mendota-primary", to: "sterling-relay" },
    { from: "mendota-primary", to: "ottawa-relay" },
    { from: "mendota-primary", to: "rockford-hub" },
    { from: "dekalb-relay", to: "naperville-hub" },
    { from: "dekalb-relay", to: "rockford-hub" },
    { from: "naperville-hub", to: "chicago-loop" },
    { from: "naperville-hub", to: "joliet-hub" },
    { from: "sterling-relay", to: "quadcities-hub" },
    { from: "lasalle-relay", to: "peoria-hub" },
    { from: "ottawa-relay", to: "lasalle-relay" },
    { from: "peoria-hub", to: "bloomington-hub" },
    { from: "bloomington-hub", to: "champaign-hub" },
    { from: "peoria-hub", to: "springfield-hub" },
  ];

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Phase:</label>
          <select
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
          >
            <option value="all">All Phases</option>
            <option value="Phase 1">Phase 1</option>
            <option value="Phase 2">Phase 2</option>
            <option value="Phase 3">Phase 3</option>
            <option value="Phase 4">Phase 4</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white"
          >
            <option value="all">All Types</option>
            <option value="origin">Origin</option>
            <option value="relay">Relay</option>
            <option value="hub">Metro Hub</option>
            <option value="future">Future</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredTowers.length} of {TOWERS.length} towers
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Map */}
        <div className="lg:col-span-2">
          <div className="relative bg-slate-900 border border-slate-700 rounded-lg p-4 h-[600px]">
            <div className="absolute top-4 left-4 text-xs text-gray-500">
              Illinois Tower Network - Strategic Node Map
            </div>
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid */}
              {[20, 40, 60, 80].map((pos) => (
                <g key={pos}>
                  <line x1={pos} y1="0" x2={pos} y2="100" stroke="#1e293b" strokeWidth="0.3" />
                  <line x1="0" y1={pos} x2="100" y2={pos} stroke="#1e293b" strokeWidth="0.3" />
                </g>
              ))}

              {/* Illinois rough outline */}
              <path
                d="M 65,3 L 73,3 L 78,8 L 78,25 L 75,30 L 73,28 L 68,32 L 65,45 L 60,55 L 55,62 L 48,68 L 42,75 L 35,82 L 28,88 L 22,92 L 18,95 L 15,92 L 12,88 L 10,80 L 8,70 L 5,60 L 3,50 L 5,40 L 8,30 L 12,20 L 18,12 L 25,6 L 35,3 L 45,2 L 55,2 Z"
                fill="none"
                stroke="#334155"
                strokeWidth="0.5"
                opacity="0.5"
              />

              {/* Network links */}
              {networkLinks.map((link, idx) => {
                const fromTower = TOWERS.find((t) => t.id === link.from);
                const toTower = TOWERS.find((t) => t.id === link.to);
                if (!fromTower || !toTower) return null;

                const fromVisible = filteredTowers.includes(fromTower);
                const toVisible = filteredTowers.includes(toTower);
                if (!fromVisible && !toVisible) return null;

                const isMendota = link.from === "mendota-primary";
                const isSelected =
                  selectedTower === link.from || selectedTower === link.to;

                return (
                  <line
                    key={idx}
                    x1={toMapX(fromTower.lon)}
                    y1={toMapY(fromTower.lat)}
                    x2={toMapX(toTower.lon)}
                    y2={toMapY(toTower.lat)}
                    stroke={isSelected ? "#f59e0b" : isMendota ? "#f59e0b" : "#475569"}
                    strokeWidth={isSelected ? "0.8" : isMendota ? "0.5" : "0.3"}
                    strokeDasharray={isMendota ? "none" : "2 2"}
                    opacity={isSelected ? 0.8 : isMendota ? 0.4 : 0.2}
                  />
                );
              })}

              {/* Towers */}
              {filteredTowers.map((tower) => {
                const x = toMapX(tower.lon);
                const y = toMapY(tower.lat);
                const isSelected = selectedTower === tower.id;
                const color = typeColors[tower.type];
                const radius = tower.type === "origin" ? 3.5 : tower.type === "hub" ? 2.8 : 2;

                return (
                  <g
                    key={tower.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedTower(tower.id)}
                  >
                    {tower.type === "origin" && (
                      <circle
                        cx={x} cy={y} r="15"
                        fill="#f59e0b" opacity="0.06"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={x} cy={y} r={radius}
                      fill={color}
                      stroke={isSelected ? "#fff" : color}
                      strokeWidth={isSelected ? "1" : "0.5"}
                      opacity={tower.type === "future" ? 0.6 : 0.9}
                    />
                    <text
                      x={x}
                      y={y - (tower.type === "origin" ? 6 : 4)}
                      textAnchor="middle"
                      className={`fill-white ${tower.type === "origin" ? "text-[3px] font-bold" : "text-[2.5px]"}`}
                    >
                      {tower.city}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 space-y-1.5">
              {Object.entries(typeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center space-x-2">
                  <div
                    className="rounded-full"
                    style={{
                      backgroundColor: typeColors[type],
                      width: type === "origin" ? "12px" : type === "hub" ? "10px" : "8px",
                      height: type === "origin" ? "12px" : type === "hub" ? "10px" : "8px",
                      opacity: type === "future" ? 0.6 : 1,
                    }}
                  />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-4">
          {selected && (
            <>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: typeColors[selected.type] }}
                  />
                  <h3 className="text-lg font-bold text-white">{selected.name}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">City:</span>
                    <span className="text-white">{selected.city}, IL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">County:</span>
                    <span className="text-white">{selected.county}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coordinates:</span>
                    <span className="text-white font-mono text-xs">
                      {selected.lat.toFixed(4)}N, {Math.abs(selected.lon).toFixed(4)}W
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Elevation:</span>
                    <span className="text-white">{selected.elevationFt} ft ASL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tower Height:</span>
                    <span className="text-white">{selected.heightAglFt} ft AGL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total AMSL:</span>
                    <span className="text-amber-400 font-semibold">
                      {selected.elevationFt + selected.heightAglFt} ft
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Structure:</span>
                    <span className="text-white">{selected.structureType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Population:</span>
                    <span className="text-white">{selected.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phase:</span>
                    <span style={{ color: typeColors[selected.type] }}>{selected.phase}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 italic">{selected.notes}</p>
              </div>

              {/* Distance from Mendota */}
              {selected.id !== "mendota-primary" && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                  <h4 className="font-semibold text-white mb-3">Distance from Mendota</h4>
                  {(() => {
                    const dist = haversine(mendota, selected);
                    const bear = bearing(mendota, selected);
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Distance:</span>
                          <span className="text-white">
                            {dist.km.toFixed(1)} km ({dist.mi.toFixed(1)} mi)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bearing:</span>
                          <span className="text-white">
                            {bear.deg.toFixed(1)}&deg; ({bear.cardinal})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Elevation Delta:</span>
                          <span className={selected.elevationFt >= mendota.elevationFt ? "text-green-400" : "text-red-400"}>
                            {selected.elevationFt >= mendota.elevationFt ? "+" : ""}
                            {selected.elevationFt - mendota.elevationFt} ft
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </>
          )}

          {/* Tower Table */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <h4 className="font-semibold text-white mb-3">All Nodes ({filteredTowers.length})</h4>
            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {filteredTowers.map((tower) => {
                const dist = tower.id !== "mendota-primary" ? haversine(mendota, tower) : null;
                return (
                  <button
                    key={tower.id}
                    onClick={() => setSelectedTower(tower.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex items-center justify-between transition ${
                      selectedTower === tower.id
                        ? "bg-slate-700 text-white"
                        : "hover:bg-slate-800 text-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: typeColors[tower.type] }}
                      />
                      <span>{tower.city}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {dist ? `${dist.km.toFixed(0)} km` : "Origin"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
