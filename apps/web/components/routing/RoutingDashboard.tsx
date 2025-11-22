'use client';

/**
 * Routing Dashboard Component
 *
 * DISCLAIMER: This displays simulated routing data for educational purposes.
 */

import { useState, useEffect } from 'react';

interface Route {
  id: string;
  destination: string;
  protocol: 'dht' | 'mesh' | 'sdwan' | 'onion' | 'direct';
  state: 'active' | 'degraded' | 'failed';
  metrics: {
    latencyMs: number;
    bandwidthMbps: number;
    hopCount: number;
    packetLoss: number;
  };
  path: string[];
}

interface RoutingStats {
  totalRoutes: number;
  activeRoutes: number;
  degradedRoutes: number;
  failedRoutes: number;
  routesByProtocol: Record<string, number>;
  averageLatency: number;
  averageHopCount: number;
}

const PROTOCOL_COLORS: Record<string, string> = {
  dht: 'bg-green-500',
  mesh: 'bg-blue-500',
  sdwan: 'bg-purple-500',
  onion: 'bg-orange-500',
  direct: 'bg-cyan-500',
};

const STATE_COLORS: Record<string, string> = {
  active: 'text-green-500',
  degraded: 'text-yellow-500',
  failed: 'text-red-500',
};

export function RoutingDashboard() {
  const [stats, setStats] = useState<RoutingStats | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedProtocol]);

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      // Fetch stats
      const statsRes = await fetch('/api/routing?type=stats');
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch routes
      const routesUrl = selectedProtocol
        ? `/api/routing?type=routes&protocol=${selectedProtocol}`
        : '/api/routing?type=routes';
      const routesRes = await fetch(routesUrl);
      const routesData = await routesRes.json();

      if (routesData.success) {
        setRoutes(routesData.data.routes);
      }
    } catch (err) {
      setError('Failed to fetch routing data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDiscover() {
    try {
      const res = await fetch('/api/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover' }),
      });
      const data = await res.json();

      if (data.success) {
        // Refresh data after discovery
        fetchData();
      }
    } catch (err) {
      setError('Failed to discover routes');
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading routing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Routes"
            value={stats.totalRoutes}
            color="cyan"
          />
          <StatCard
            label="Active"
            value={stats.activeRoutes}
            color="green"
          />
          <StatCard
            label="Degraded"
            value={stats.degradedRoutes}
            color="yellow"
          />
          <StatCard
            label="Failed"
            value={stats.failedRoutes}
            color="red"
          />
        </div>
      )}

      {/* Protocol Distribution */}
      {stats && (
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Protocol Distribution</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(stats.routesByProtocol).map(([protocol, count]) => (
              <button
                key={protocol}
                onClick={() => setSelectedProtocol(selectedProtocol === protocol ? null : protocol)}
                className={`p-4 rounded-lg border transition-all ${
                  selectedProtocol === protocol
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-border hover:border-cyan-500/50'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${PROTOCOL_COLORS[protocol]} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-center">{count}</p>
                <p className="text-xs text-muted-foreground text-center uppercase">{protocol}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Average Latency</h3>
            <p className="text-4xl font-bold text-cyan-400">{stats.averageLatency}ms</p>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                style={{ width: `${Math.min(stats.averageLatency / 2, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Target: &lt;50ms | Good: &lt;100ms | Acceptable: &lt;200ms
            </p>
          </div>
          <div className="bg-card border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Average Hop Count</h3>
            <p className="text-4xl font-bold text-purple-400">{stats.averageHopCount}</p>
            <div className="flex gap-1 mt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded ${
                    i < stats.averageHopCount ? 'bg-purple-500' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Fewer hops = lower latency and higher reliability
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleDiscover}
          className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
        >
          Discover Routes
        </button>
        <button
          onClick={fetchData}
          className="px-6 py-3 bg-card border rounded-lg hover:bg-muted transition-colors font-medium"
        >
          Refresh Data
        </button>
        {selectedProtocol && (
          <button
            onClick={() => setSelectedProtocol(null)}
            className="px-6 py-3 bg-card border rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Route Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            Route Table
            {selectedProtocol && (
              <span className="ml-2 text-sm text-muted-foreground">
                (filtered by {selectedProtocol.toUpperCase()})
              </span>
            )}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Destination
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Protocol
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Latency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Bandwidth
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Hops
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                  Loss
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-sm">{route.destination}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-medium`}>
                      <span className={`w-2 h-2 rounded-full ${PROTOCOL_COLORS[route.protocol]}`} />
                      {route.protocol.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${STATE_COLORS[route.state]}`}>
                      {route.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">{route.metrics.latencyMs.toFixed(1)}ms</td>
                  <td className="px-4 py-3 font-mono text-sm">{route.metrics.bandwidthMbps.toFixed(0)} Mbps</td>
                  <td className="px-4 py-3 font-mono text-sm">{route.metrics.hopCount}</td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {(route.metrics.packetLoss * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'cyan' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    cyan: 'border-cyan-500/30 bg-cyan-500/5',
    green: 'border-green-500/30 bg-green-500/5',
    yellow: 'border-yellow-500/30 bg-yellow-500/5',
    red: 'border-red-500/30 bg-red-500/5',
  };

  const textColors = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
  };

  return (
    <div className={`p-6 border rounded-xl ${colorClasses[color]}`}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-3xl font-bold ${textColors[color]}`}>{value}</p>
    </div>
  );
}
