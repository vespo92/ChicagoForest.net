import TowerDataExplorer from "@/components/tower-research/TowerDataExplorer";
import NodeHopAnalyzer from "@/components/tower-research/NodeHopAnalyzer";
import FCCDataSources from "@/components/tower-research/FCCDataSources";

export const metadata = {
  title: "Tower Research - US Tower Data & Node Hop Analysis | Chicago Forest Network",
  description:
    "Strategic tower research using FCC ASR data for the Chicago Forest Network expansion. Geographic calculations, node-hop analysis, and data source aggregation for optimal network planning.",
};

export default function TowerResearchPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-blue-950/20 to-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-blue-400 text-sm font-semibold">
                TOWER RESEARCH &amp; DATA AGGREGATION
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              Tower Research
              <br />
              &amp; Node Planning
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              Aggregate US tower data from FCC ASR, HIFLD, and open databases to
              strategically plan the Chicago Forest Network expansion. Geographic
              calculations, node-hop analysis, and co-location opportunities.
            </p>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto mb-8">
              Data sourced from public FCC databases and HIFLD open datasets.
              All coordinates and calculations use WGS84 / NAD 83.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="#explorer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Tower Explorer
              </a>
              <a
                href="#hop-analyzer"
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition border border-slate-700"
              >
                Node Hop Analyzer
              </a>
              <a
                href="#data-sources"
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition border border-slate-700"
              >
                FCC Data Sources
              </a>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">14</div>
              <div className="text-xs text-gray-400">Strategic Nodes</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">6</div>
              <div className="text-xs text-gray-400">Data Sources</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">~350 km</div>
              <div className="text-xs text-gray-400">Network Span</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">~4M+</div>
              <div className="text-xs text-gray-400">Population Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-200/80">
            <strong className="text-amber-400">AI-Generated Theoretical Framework:</strong>{" "}
            This page presents a conceptual network planning tool built from public FCC data.
            Tower locations and calculations are based on publicly available government databases.
            The Chicago Forest Network is a theoretical framework — no operational network exists.
            Co-location opportunities are speculative and would require formal agreements with tower owners.
          </div>
        </div>
      </section>

      {/* Tower Data Explorer */}
      <section id="explorer" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Strategic Tower Explorer
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8">
            Interactive map of strategic tower locations for the Chicago Forest
            Network. Filter by phase and type, click nodes for details and
            distance calculations from Mendota.
          </p>
          <TowerDataExplorer />
        </div>
      </section>

      {/* Node Hop Analyzer */}
      <section id="hop-analyzer" className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Node Hop Analyzer
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-4">
            Select an origin and destination to find the optimal intermediate hop
            node. The analyzer scores candidates based on line-of-sight viability,
            path efficiency, tower height, elevation advantage, and link balance.
          </p>
          <p className="text-sm text-gray-500 text-center max-w-2xl mx-auto mb-8">
            Uses Haversine distance, 4/3 Earth radius LOS model, and Fresnel zone
            calculations. All calculations performed client-side using the{" "}
            <span className="text-blue-400 font-mono text-xs">@chicago-forest/tower-data</span>{" "}
            package algorithms.
          </p>
          <NodeHopAnalyzer />
        </div>
      </section>

      {/* Expansion Corridors */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Expansion Corridors
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8">
            Prioritized corridors for network expansion based on population density,
            existing tower infrastructure, and terrain characteristics.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "I-39 Corridor (Mendota → Rockford)",
                priority: "High",
                priorityColor: "text-red-400",
                pop: "200K",
                density: "Medium",
                description: "Primary backbone route north. Flat terrain, existing tower infrastructure along I-39.",
                hops: "Direct or 1 relay",
                distance: "80 km",
              },
              {
                name: "I-88 Corridor (DeKalb → Chicago)",
                priority: "High",
                priorityColor: "text-red-400",
                pop: "1.5M+",
                density: "High",
                description: "East-West Tollway into Chicago suburbs. Dense tower infrastructure, highest population.",
                hops: "2-3 relays",
                distance: "113 km",
              },
              {
                name: "Chicago Metro (Naperville → Loop)",
                priority: "High",
                priorityColor: "text-red-400",
                pop: "9.5M",
                density: "Very High",
                description: "Dense urban tower infrastructure. Many co-location opportunities available.",
                hops: "Multiple options",
                distance: "50 km",
              },
              {
                name: "I-80 West (Sterling → Quad Cities)",
                priority: "Medium",
                priorityColor: "text-amber-400",
                pop: "200K",
                density: "Low",
                description: "Western expansion along I-80. More rural, longer hops needed. Iowa border potential.",
                hops: "1-2 relays",
                distance: "110 km",
              },
              {
                name: "Illinois River (LaSalle → Peoria)",
                priority: "Medium",
                priorityColor: "text-amber-400",
                pop: "200K",
                density: "Medium",
                description: "Southward expansion following Illinois River valley. Mixed terrain conditions.",
                hops: "1-2 relays",
                distance: "100 km",
              },
              {
                name: "Central IL (Bloomington → Springfield)",
                priority: "Future",
                priorityColor: "text-purple-400",
                pop: "400K",
                density: "Low",
                description: "Phase 3+ long-range expansion. State capital and university cities.",
                hops: "3-4 relays",
                distance: "220 km",
              },
            ].map((corridor) => (
              <div
                key={corridor.name}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-5"
              >
                <h4 className="font-semibold text-white mb-2">{corridor.name}</h4>
                <div className="flex gap-2 mb-3">
                  <span className={`text-xs font-semibold ${corridor.priorityColor}`}>
                    {corridor.priority}
                  </span>
                  <span className="text-xs text-gray-500">&middot;</span>
                  <span className="text-xs text-gray-500">{corridor.distance}</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{corridor.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Pop: {corridor.pop}</span>
                  <span>Tower density: {corridor.density}</span>
                  <span>Hops: {corridor.hops}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FCC Data Sources */}
      <section id="data-sources" className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            FCC &amp; Public Tower Data Sources
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8">
            Aggregated data sources for US tower infrastructure research.
            All sources are publicly accessible or require only a free API key.
          </p>
          <FCCDataSources />
        </div>
      </section>

      {/* NPM Package Info */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Tower Data Package
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8">
            All geographic calculations and data parsing utilities are available as the{" "}
            <span className="text-blue-400 font-mono">@chicago-forest/tower-data</span>{" "}
            package within this monorepo.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Geographic Calculations
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { fn: "haversineDistance(a, b)", desc: "Great-circle distance between coordinates" },
                  { fn: "calculateBearing(a, b)", desc: "Initial bearing with cardinal direction" },
                  { fn: "maxLineOfSight(hA, hB)", desc: "Max LOS using 4/3 Earth radius model" },
                  { fn: "fresnelZoneRadius(dist, freq)", desc: "First Fresnel zone radius at midpoint" },
                  { fn: "freeSpacePathLoss(dist, freq)", desc: "FSPL in dB" },
                  { fn: "rainAttenuation(dist, freq)", desc: "ITU-R P.838 rain attenuation estimate" },
                  { fn: "analyzeTowerLink(a, b, freq)", desc: "Full link analysis between two towers" },
                  { fn: "calculateLinkBudget(...)", desc: "Complete RF link budget calculation" },
                  { fn: "scoreTowerAsHop(o, c, d)", desc: "Multi-factor hop candidate scoring" },
                  { fn: "intermediatePoint(a, b, f)", desc: "Point along great circle path" },
                ].map((item) => (
                  <div key={item.fn} className="flex items-start gap-2">
                    <code className="text-amber-400 text-xs font-mono whitespace-nowrap">{item.fn}</code>
                    <span className="text-gray-400 text-xs">&mdash; {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                FCC Data Utilities
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { fn: "buildHIFLDQuery(filter)", desc: "ArcGIS REST API query builder for HIFLD ASR data" },
                  { fn: "parseHIFLDFeature(feature)", desc: "Parse GeoJSON feature to standardized record" },
                  { fn: "buildFCCSearchUrl(lat, lon, r)", desc: "FCC ASR search URL builder" },
                  { fn: "STRATEGIC_TOWERS", desc: "14 strategic IL tower locations with metadata" },
                  { fn: "EXPANSION_ZONES", desc: "6 prioritized expansion corridors" },
                  { fn: "MAJOR_TOWER_COMPANIES", desc: "US tower company reference data" },
                  { fn: "MAJOR_CARRIERS", desc: "US wireless carrier reference data" },
                  { fn: "DATA_SOURCES", desc: "Data source URLs and format details" },
                ].map((item) => (
                  <div key={item.fn} className="flex items-start gap-2">
                    <code className="text-blue-400 text-xs font-mono whitespace-nowrap">{item.fn}</code>
                    <span className="text-gray-400 text-xs">&mdash; {item.desc}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-slate-900/50 rounded p-3">
                <code className="text-xs text-gray-400 font-mono">
                  packages/tower-data/src/
                </code>
                <div className="mt-1 text-xs text-gray-500">
                  geo.ts &middot; fcc-asr.ts &middot; illinois-towers.ts &middot; index.ts
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 px-4 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm text-gray-400">
            Tower data sourced from the{" "}
            <a
              href="https://www.fcc.gov/wireless/data/public-access-files-database-downloads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              FCC Public Access Files
            </a>
            {" "}and{" "}
            <a
              href="https://hifld-geoplatform.opendata.arcgis.com/datasets/geoplatform::antenna-structure-registrate-8/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              HIFLD Open Data
            </a>
            . Geographic calculations use WGS84 datum and Haversine formula. LOS analysis
            uses the standard 4/3 Earth radius radio propagation model. All tower co-location
            concepts are theoretical and would require formal agreements with registered tower owners.
          </div>
        </div>
      </section>
    </div>
  );
}
