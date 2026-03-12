"use client";

import { useState } from "react";

interface TowerNode {
  id: string;
  name: string;
  lat: number;
  lon: number;
  x: number;
  y: number;
  elevation: number; // ft above sea level
  distanceFromMendota: number; // km
  distanceMiles: number;
  type: "primary" | "target" | "future";
  status: string;
}

interface TowerLink {
  from: string;
  to: string;
  distanceKm: number;
  bearing: string;
  terrain: string;
  technology: string;
  frequency: string;
  capacity: string;
}

const nodes: TowerNode[] = [
  {
    id: "mendota",
    name: "Mendota Solar Tower",
    lat: 41.5475,
    lon: -89.1178,
    x: 50,
    y: 45,
    elevation: 751,
    distanceFromMendota: 0,
    distanceMiles: 0,
    type: "primary",
    status: "Phase 1 - Active Planning",
  },
  {
    id: "rockford",
    name: "Rockford",
    lat: 42.2711,
    lon: -89.094,
    x: 51,
    y: 12,
    elevation: 728,
    distanceFromMendota: 80,
    distanceMiles: 50,
    type: "target",
    status: "Phase 2 - 2027",
  },
  {
    id: "naperville",
    name: "Chicago / Naperville",
    lat: 41.7508,
    lon: -88.1535,
    x: 78,
    y: 36,
    elevation: 690,
    distanceFromMendota: 113,
    distanceMiles: 70,
    type: "target",
    status: "Phase 2 - 2027",
  },
  {
    id: "quadcities",
    name: "Quad Cities (Moline)",
    lat: 41.5067,
    lon: -90.5151,
    x: 10,
    y: 47,
    elevation: 581,
    distanceFromMendota: 110,
    distanceMiles: 68,
    type: "target",
    status: "Phase 2 - 2027",
  },
  {
    id: "peoria",
    name: "Peoria",
    lat: 40.6936,
    lon: -89.589,
    x: 36,
    y: 82,
    elevation: 470,
    distanceFromMendota: 100,
    distanceMiles: 62,
    type: "target",
    status: "Phase 3 - 2028",
  },
  {
    id: "dekalb",
    name: "DeKalb",
    lat: 41.9295,
    lon: -88.7502,
    x: 60,
    y: 28,
    elevation: 879,
    distanceFromMendota: 46,
    distanceMiles: 29,
    type: "future",
    status: "Relay - Phase 2",
  },
  {
    id: "lasalle",
    name: "LaSalle-Peru",
    lat: 41.3454,
    lon: -89.0916,
    x: 51,
    y: 54,
    elevation: 659,
    distanceFromMendota: 23,
    distanceMiles: 14,
    type: "future",
    status: "Relay - Phase 1",
  },
  {
    id: "ottawa",
    name: "Ottawa",
    lat: 41.3456,
    lon: -88.8426,
    x: 58,
    y: 54,
    elevation: 481,
    distanceFromMendota: 30,
    distanceMiles: 19,
    type: "future",
    status: "Relay - Phase 2",
  },
  {
    id: "sterling",
    name: "Sterling",
    lat: 41.7886,
    lon: -89.6962,
    x: 33,
    y: 35,
    elevation: 643,
    distanceFromMendota: 53,
    distanceMiles: 33,
    type: "future",
    status: "Relay - Phase 2",
  },
  {
    id: "bloomington",
    name: "Bloomington-Normal",
    lat: 40.4842,
    lon: -88.9937,
    x: 53,
    y: 90,
    elevation: 829,
    distanceFromMendota: 118,
    distanceMiles: 73,
    type: "target",
    status: "Phase 3 - 2028",
  },
];

const links: TowerLink[] = [
  {
    from: "mendota",
    to: "lasalle",
    distanceKm: 23,
    bearing: "S",
    terrain: "Flat agricultural",
    technology: "Licensed PTP",
    frequency: "11 GHz",
    capacity: "10 Gbps",
  },
  {
    from: "mendota",
    to: "dekalb",
    distanceKm: 46,
    bearing: "NE",
    terrain: "Flat agricultural",
    technology: "Licensed PTP",
    frequency: "11 GHz",
    capacity: "10 Gbps",
  },
  {
    from: "mendota",
    to: "sterling",
    distanceKm: 53,
    bearing: "W",
    terrain: "Flat agricultural",
    technology: "Licensed PTP",
    frequency: "11 GHz",
    capacity: "5 Gbps",
  },
  {
    from: "mendota",
    to: "ottawa",
    distanceKm: 30,
    bearing: "SE",
    terrain: "Flat, Illinois River valley",
    technology: "Unlicensed PTP",
    frequency: "5 GHz",
    capacity: "2 Gbps",
  },
  {
    from: "dekalb",
    to: "naperville",
    distanceKm: 67,
    bearing: "E",
    terrain: "Flat suburban",
    technology: "Licensed PTP",
    frequency: "11 GHz",
    capacity: "10 Gbps",
  },
  {
    from: "dekalb",
    to: "rockford",
    distanceKm: 50,
    bearing: "NW",
    terrain: "Rolling prairie",
    technology: "Licensed PTP",
    frequency: "11 GHz",
    capacity: "10 Gbps",
  },
  {
    from: "sterling",
    to: "quadcities",
    distanceKm: 65,
    bearing: "W",
    terrain: "River valley",
    technology: "Licensed PTP",
    frequency: "11 GHz",
    capacity: "5 Gbps",
  },
  {
    from: "lasalle",
    to: "peoria",
    distanceKm: 80,
    bearing: "SW",
    terrain: "Illinois River corridor",
    technology: "Licensed PTP",
    frequency: "11 GHz",
    capacity: "5 Gbps",
  },
  {
    from: "ottawa",
    to: "lasalle",
    distanceKm: 16,
    bearing: "W",
    terrain: "Illinois River valley",
    technology: "Unlicensed PTP",
    frequency: "60 GHz",
    capacity: "10 Gbps",
  },
  {
    from: "peoria",
    to: "bloomington",
    distanceKm: 60,
    bearing: "SE",
    terrain: "Flat agricultural",
    technology: "Licensed PTP",
    frequency: "11 GHz",
    capacity: "5 Gbps",
  },
  {
    from: "mendota",
    to: "rockford",
    distanceKm: 80,
    bearing: "N",
    terrain: "Flat agricultural",
    technology: "Licensed PTP",
    frequency: "11 GHz",
    capacity: "10 Gbps",
  },
];

export default function IllinoisNetworkMap() {
  const [selectedNode, setSelectedNode] = useState<string | null>("mendota");
  const [selectedLink, setSelectedLink] = useState<TowerLink | null>(null);

  const selected = nodes.find((n) => n.id === selectedNode);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "primary":
        return "#f59e0b";
      case "target":
        return "#3b82f6";
      case "future":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getNodeRadius = (type: string) => {
    switch (type) {
      case "primary":
        return 4;
      case "target":
        return 3;
      case "future":
        return 2.5;
      default:
        return 2;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Map */}
      <div className="lg:col-span-2">
        <div className="relative bg-slate-900 border border-slate-700 rounded-lg p-4 h-[550px]">
          <div className="absolute top-4 left-4 text-xs text-gray-500">
            North-Central Illinois Tower Network
          </div>
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* State outline hint */}
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              fill="none"
              stroke="#1e293b"
              strokeWidth="0.5"
              rx="2"
            />

            {/* Grid lines */}
            {[20, 40, 60, 80].map((pos) => (
              <g key={pos}>
                <line
                  x1={pos}
                  y1="2"
                  x2={pos}
                  y2="98"
                  stroke="#1e293b"
                  strokeWidth="0.3"
                />
                <line
                  x1="2"
                  y1={pos}
                  x2="98"
                  y2={pos}
                  stroke="#1e293b"
                  strokeWidth="0.3"
                />
              </g>
            ))}

            {/* Links */}
            {links.map((link, idx) => {
              const fromNode = nodes.find((n) => n.id === link.from);
              const toNode = nodes.find((n) => n.id === link.to);
              if (!fromNode || !toNode) return null;

              const isMendotaLink =
                link.from === "mendota" || link.to === "mendota";
              const isLicensed = link.frequency === "11 GHz";

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedLink(link);
                    setSelectedNode(null);
                  }}
                >
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isMendotaLink ? "#f59e0b" : isLicensed ? "#3b82f6" : "#10b981"}
                    strokeWidth={isMendotaLink ? "0.8" : "0.4"}
                    strokeDasharray={isMendotaLink ? "none" : "2 2"}
                    opacity={isMendotaLink ? 0.6 : 0.3}
                  />
                  {/* Distance label */}
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 1.5}
                    textAnchor="middle"
                    className="text-[2.5px] fill-gray-500"
                  >
                    {link.distanceKm}km
                  </text>
                  {/* Animated signal */}
                  {isMendotaLink && (
                    <circle r="0.8" fill="#f59e0b" opacity="0.8">
                      <animateMotion
                        dur="4s"
                        repeatCount="indefinite"
                        path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedNode(node.id);
                  setSelectedLink(null);
                }}
              >
                {/* Coverage ring */}
                {node.type === "primary" && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill="#f59e0b"
                    opacity="0.05"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={getNodeRadius(node.type)}
                  fill={getNodeColor(node.type)}
                  stroke={
                    selectedNode === node.id
                      ? "#fff"
                      : getNodeColor(node.type)
                  }
                  strokeWidth={selectedNode === node.id ? "1" : "0.5"}
                  opacity={node.type === "primary" ? 1 : 0.8}
                />
                {/* Sun icon for primary */}
                {node.type === "primary" && (
                  <>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="6"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="0.3"
                      opacity="0.4"
                      className="animate-pulse"
                    />
                  </>
                )}
                {/* Label */}
                <text
                  x={node.x}
                  y={node.y - (node.type === "primary" ? 7 : 5)}
                  textAnchor="middle"
                  className={`fill-white ${
                    node.type === "primary" ? "text-[3.5px] font-bold" : "text-[3px]"
                  }`}
                >
                  {node.name}
                </text>
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs text-gray-400">
                Mendota Primary Tower
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-400">Target Metro Areas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-xs text-gray-400">
                Relay / Junction Nodes
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-6 h-0.5 bg-amber-500" />
              <span className="text-xs text-gray-400">Primary backbone</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-0.5 bg-blue-500" style={{backgroundImage: "repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 4px, transparent 4px, transparent 8px)"}} />
              <span className="text-xs text-gray-400">11 GHz licensed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-0.5 bg-emerald-500" style={{backgroundImage: "repeating-linear-gradient(90deg, #10b981 0, #10b981 4px, transparent 4px, transparent 8px)"}} />
              <span className="text-xs text-gray-400">5/60 GHz unlicensed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Panel */}
      <div className="space-y-4">
        {/* Node Detail */}
        {selected && !selectedLink && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getNodeColor(selected.type) }}
              />
              <h3 className="text-lg font-bold text-white">{selected.name}</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Coordinates:</span>
                <span className="text-white font-mono text-xs">
                  {selected.lat.toFixed(4)}N, {Math.abs(selected.lon).toFixed(4)}W
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Elevation:</span>
                <span className="text-white">{selected.elevation} ft ASL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Distance to Mendota:</span>
                <span className="text-white">
                  {selected.distanceFromMendota === 0
                    ? "Origin"
                    : `${selected.distanceFromMendota} km (${selected.distanceMiles} mi)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span
                  className={
                    selected.type === "primary"
                      ? "text-amber-400"
                      : "text-blue-400"
                  }
                >
                  {selected.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Connections:</span>
                <span className="text-white">
                  {
                    links.filter(
                      (l) =>
                        l.from === selected.id || l.to === selected.id
                    ).length
                  }{" "}
                  links
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Link Detail */}
        {selectedLink && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <h3 className="text-lg font-bold text-white mb-3">Link Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">From:</span>
                <span className="text-white">
                  {nodes.find((n) => n.id === selectedLink.from)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">To:</span>
                <span className="text-white">
                  {nodes.find((n) => n.id === selectedLink.to)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Distance:</span>
                <span className="text-white">
                  {selectedLink.distanceKm} km
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bearing:</span>
                <span className="text-white">{selectedLink.bearing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Terrain:</span>
                <span className="text-white">{selectedLink.terrain}</span>
              </div>
              <div className="border-t border-slate-600 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Technology:</span>
                  <span className="text-amber-400 font-semibold">{selectedLink.technology}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Frequency:</span>
                  <span className="text-white">{selectedLink.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Capacity:</span>
                  <span className="text-green-400 font-semibold">{selectedLink.capacity}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Communication Technology */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-white mb-3">
            Tower-to-Tower Communication
          </h3>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-900/50 rounded p-3">
              <div className="font-semibold text-amber-400 mb-1">Primary Backbone: 11 GHz Licensed PTP</div>
              <p className="text-gray-400 text-xs">
                High-capacity licensed microwave links using narrow-beam dish antennas (33-38 dBi). Up to 10 Gbps per link. Requires FCC Part 101 licensing. Used for all long-haul backbone connections.
              </p>
            </div>
            <div className="bg-slate-900/50 rounded p-3">
              <div className="font-semibold text-blue-400 mb-1">Short-haul: 5 GHz / 60 GHz Unlicensed</div>
              <p className="text-gray-400 text-xs">
                Shorter relay links under 30 km use unlicensed 5 GHz (Ubiquiti, Cambium) for 1-2 Gbps, or 60 GHz (Siklu) for 10 Gbps over short distances. No licensing fees.
              </p>
            </div>
            <div className="bg-slate-900/50 rounded p-3">
              <div className="font-semibold text-green-400 mb-1">Fiber Backhaul at Each Hub</div>
              <p className="text-gray-400 text-xs">
                Each primary tower site connects to fiber internet for upstream transit. The radio backbone provides redundancy and connects communities between fiber points.
              </p>
            </div>
          </div>
        </div>

        {/* Strategic Value */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-white mb-3">
            Strategic Position
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            Mendota sits at the geographic center of northern Illinois, making
            it the ideal junction point for connecting the state&apos;s major
            metropolitan areas via high-powered point-to-point radio links.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-300">
                ~80 km to Rockford (N)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-300">
                ~113 km to Chicago/Naperville (E)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-300">
                ~110 km to Quad Cities (W)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-300">
                ~100 km to Peoria (SW)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-sm text-gray-300">
                ~118 km to Bloomington (SE)
              </span>
            </div>
          </div>
        </div>

        {/* Network Reach */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <h3 className="text-lg font-bold text-amber-400 mb-3">
            Network Coverage
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Population Reach:</span>
              <span className="text-white font-semibold">~4.5 million</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Metro Areas Connected:</span>
              <span className="text-white font-semibold">5 major</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network Radius:</span>
              <span className="text-white font-semibold">~120 km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Terrain:</span>
              <span className="text-white font-semibold">
                Flat prairie (ideal)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Backbone Capacity:</span>
              <span className="text-white font-semibold">
                5-10 Gbps per link
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
