'use client';

/**
 * Routing Hero Section
 */

export function RoutingHero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-cyan-900/20 via-background to-purple-900/20 py-20">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Animated network nodes background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-500/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0" />
              <stop offset="50%" stopColor="rgb(6, 182, 212)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={i}
              x1={`${10 + Math.random() * 30}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${60 + Math.random() * 30}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-sm font-medium">Unified Routing Layer</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Multi-Protocol Routing
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Intelligent path selection across DHT, mesh, SD-WAN, and anonymous routing protocols
            for resilient peer-to-peer connectivity.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">DHT Discovery</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Mesh Routing</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm">SD-WAN Tunnels</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 border rounded-lg px-4 py-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm">Onion Routing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
