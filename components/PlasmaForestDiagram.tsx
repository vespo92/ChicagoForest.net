"use client"

import { useState } from "react"
import { MapPin, Zap, Home, Building2, Trees } from "lucide-react"

export default function PlasmaForestDiagram() {
  const [selectedNode, setSelectedNode] = useState<number | null>(null)

  const nodes = [
    // Central Chicago Hubs
    { id: 1, name: "Loop Tower", type: "hub", x: 50, y: 50, power: 1000 },
    { id: 2, name: "Lincoln Park", type: "hub", x: 52, y: 38, power: 500 },
    { id: 3, name: "O'Hare Hub", type: "hub", x: 25, y: 25, power: 750 },
    
    // North Suburbs
    { id: 4, name: "Evanston", type: "community", x: 55, y: 15, power: 200 },
    { id: 5, name: "Skokie", type: "community", x: 47, y: 18, power: 150 },
    { id: 6, name: "Schaumburg", type: "hub", x: 15, y: 32, power: 500 },
    
    // West Suburbs
    { id: 7, name: "Naperville", type: "hub", x: 12, y: 58, power: 600 },
    { id: 8, name: "Oak Park", type: "community", x: 38, y: 48, power: 150 },
    { id: 9, name: "Aurora", type: "community", x: 5, y: 65, power: 200 },
    
    // South Suburbs
    { id: 10, name: "Joliet", type: "hub", x: 18, y: 82, power: 500 },
    { id: 11, name: "Tinley Park", type: "community", x: 38, y: 78, power: 200 },
    { id: 12, name: "Oak Lawn", type: "community", x: 45, y: 65, power: 150 },
    { id: 13, name: "Orland Park", type: "community", x: 30, y: 75, power: 150 },
    
    // East/Southeast
    { id: 14, name: "Hyde Park", type: "community", x: 58, y: 58, power: 150 },
    { id: 15, name: "South Shore", type: "community", x: 65, y: 63, power: 100 },
    { id: 16, name: "Calumet", type: "community", x: 60, y: 75, power: 100 },
    
    // Northwest Suburbs
    { id: 17, name: "Arlington Hts", type: "community", x: 25, y: 15, power: 150 },
    { id: 18, name: "Palatine", type: "community", x: 18, y: 20, power: 100 },
    { id: 19, name: "Des Plaines", type: "community", x: 35, y: 28, power: 100 },
    
    // Additional City Nodes
    { id: 20, name: "Wicker Park", type: "community", x: 45, y: 43, power: 100 },
    { id: 21, name: "Logan Square", type: "community", x: 40, y: 38, power: 100 },
  ]

  const connections = [
    // Main Hub Connections
    { from: 1, to: 2 }, { from: 1, to: 3 }, { from: 1, to: 6 }, { from: 1, to: 7 },
    { from: 1, to: 10 }, { from: 1, to: 14 }, { from: 1, to: 20 },
    
    // North Network
    { from: 2, to: 4 }, { from: 4, to: 5 }, { from: 3, to: 17 }, { from: 17, to: 18 },
    { from: 3, to: 6 }, { from: 6, to: 18 }, { from: 3, to: 19 },
    
    // West Network
    { from: 6, to: 7 }, { from: 7, to: 9 }, { from: 1, to: 8 }, { from: 8, to: 7 },
    
    // South Network
    { from: 7, to: 10 }, { from: 10, to: 11 }, { from: 11, to: 13 }, { from: 10, to: 13 },
    { from: 1, to: 12 }, { from: 12, to: 11 }, { from: 12, to: 13 },
    
    // East Network
    { from: 1, to: 14 }, { from: 14, to: 15 }, { from: 15, to: 16 }, { from: 11, to: 16 },
    
    // City Mesh
    { from: 2, to: 21 }, { from: 21, to: 20 }, { from: 20, to: 8 },
  ]

  return (
    <section className="py-24 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Greater Chicago Metropolitan Plasma Forest Network
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive energy network covering Chicago and all surrounding suburbs including Tinley Park, Joliet, Naperville, Schaumburg, and Evanston
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Network Map */}
          <div className="lg:col-span-2">
            <div className="relative bg-card border rounded-lg p-8 h-[600px]">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {/* Connection lines */}
                {connections.map((conn, idx) => {
                  const fromNode = nodes.find(n => n.id === conn.from)
                  const toNode = nodes.find(n => n.id === conn.to)
                  if (!fromNode || !toNode) return null
                  
                  return (
                    <g key={idx}>
                      {/* Energy flow animation */}
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                        opacity="0.3"
                      />
                      <circle r="1" fill="hsl(var(--primary))">
                        <animateMotion
                          dur="3s"
                          repeatCount="indefinite"
                          path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                        />
                      </circle>
                    </g>
                  )
                })}

                {/* Nodes */}
                {nodes.map(node => (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedNode(node.id)}
                  >
                    {/* Node range circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.type === "hub" ? 15 : node.type === "community" ? 10 : 5}
                      fill="hsl(var(--primary))"
                      opacity="0.1"
                      className="animate-pulse"
                    />
                    
                    {/* Node icon */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="3"
                      fill={selectedNode === node.id ? "hsl(var(--primary))" : "hsl(var(--foreground))"}
                      stroke="hsl(var(--background))"
                      strokeWidth="1"
                    />
                    
                    {/* Node label */}
                    <text
                      x={node.x}
                      y={node.y - 5}
                      textAnchor="middle"
                      className="text-[3px] fill-foreground"
                    >
                      {node.name}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-primary/20" />
                  <span className="text-sm">Hub Station (500+ kW)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary/15" />
                  <span className="text-sm">Community Node (100-500 kW)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary/10" />
                  <span className="text-sm">Residential (&lt;100 kW)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Node Details */}
          <div className="space-y-6">
            {/* Selected Node Info */}
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-xl font-semibold mb-4">
                {selectedNode ? nodes.find(n => n.id === selectedNode)?.name : "Select a Node"}
              </h3>
              
              {selectedNode && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{nodes.find(n => n.id === selectedNode)?.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Power Capacity:</span>
                    <span>{nodes.find(n => n.id === selectedNode)?.power} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-500">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connected Nodes:</span>
                    <span>{connections.filter(c => c.from === selectedNode || c.to === selectedNode).length}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Network Stats */}
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-xl font-semibold mb-4">Network Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Nodes:</span>
                  <span>{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hub Stations:</span>
                  <span>{nodes.filter(n => n.type === "hub").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Capacity:</span>
                  <span>{nodes.reduce((sum, n) => sum + n.power, 0).toLocaleString()} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coverage Area:</span>
                  <span>~10,856 km²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Population Served:</span>
                  <span>9.5 million</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Efficiency:</span>
                  <span>87%</span>
                </div>
              </div>
            </div>

            {/* Coverage Areas */}
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-xl font-semibold mb-4">Metropolitan Coverage</h3>
              <div className="space-y-2 text-sm">
                <div className="font-medium text-primary">Major Hub Locations:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Loop Tower (Central Chicago)</li>
                  <li>• O'Hare International Hub</li>
                  <li>• Naperville Technology Center</li>
                  <li>• Schaumburg Business Hub</li>
                  <li>• Joliet Industrial Complex</li>
                </ul>
                <div className="font-medium text-primary mt-3">Key Suburban Nodes:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Tinley Park Station</li>
                  <li>• Evanston University District</li>
                  <li>• Aurora Energy Center</li>
                  <li>• Arlington Heights</li>
                  <li>• Orland Park</li>
                </ul>
              </div>
            </div>

            {/* Node Types */}
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-xl font-semibold mb-4">Node Types</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-semibold">Hub Stations</div>
                    <div className="text-sm text-muted-foreground">
                      Major transmission towers with Tesla coils
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Trees className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-semibold">Community Nodes</div>
                    <div className="text-sm text-muted-foreground">
                      Neighborhood distribution centers
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Home className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-semibold">Residential</div>
                    <div className="text-sm text-muted-foreground">
                      Home receivers and transmitters
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}