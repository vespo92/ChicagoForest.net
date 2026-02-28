import IllinoisNetworkMap from "@/components/solar-tower/IllinoisNetworkMap";
import TowerSitePlanner from "@/components/solar-tower/TowerSitePlanner";
import MendotaLinkBudget from "@/components/solar-tower/MendotaLinkBudget";
import TowerRevenueModel from "@/components/solar-tower/TowerRevenueModel";

export const metadata = {
  title: "Mendota Solar Tower - Infrastructure Planning | Chicago Forest Network",
  description:
    "Planning framework for a communications tower co-located at the Mendota, Illinois solar distribution site. Junction tower connecting Rockford, Chicago, Quad Cities, and Peoria.",
};

export default function SolarTowerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-amber-400 text-sm font-semibold">
                ACTIVE PLANNING - MENDOTA, ILLINOIS
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-6">
              Solar Tower
              <br />
              Junction Hub
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              A communications tower co-located at the Mendota solar
              distribution site, serving as the first junction hub for a
              statewide municipal ISP and carrier tower network across Illinois.
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Strategically positioned between Rockford, Chicago/Naperville,
              Quad Cities, and Peoria to connect northern Illinois via
              high-powered point-to-point radio links.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="#network-map"
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                View Network Map
              </a>
              <a
                href="#link-budget"
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition border border-slate-700"
              >
                RF Calculations
              </a>
              <a
                href="#revenue"
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-semibold transition border border-slate-700"
              >
                Revenue Model
              </a>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">751 ft</div>
              <div className="text-xs text-gray-400">Elevation ASL</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">5</div>
              <div className="text-xs text-gray-400">Metro Areas Connected</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">~120 km</div>
              <div className="text-xs text-gray-400">Network Radius</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">Flat</div>
              <div className="text-xs text-gray-400">Prairie Terrain</div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Overview */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Why Mendota?
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-12">
            Mendota, Illinois sits at the geographic crossroads of northern
            Illinois. Co-locating a communications tower at an existing solar
            distribution site creates a dual-use infrastructure asset.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-3xl mb-4">&#9741;</div>
              <h3 className="text-xl font-bold text-white mb-3">
                Geographic Center
              </h3>
              <p className="text-gray-400">
                Equidistant from Rockford (80km N), Chicago/Naperville (113km
                E), Quad Cities (110km W), and Peoria (100km SW). A single tower
                here becomes the junction for the entire northern Illinois
                network.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-3xl mb-4">&#9728;&#65039;</div>
              <h3 className="text-xl font-bold text-white mb-3">
                Solar Co-Location
              </h3>
              <p className="text-gray-400">
                An active solar distribution site provides existing power
                infrastructure, land access, and aligned interests. The tower
                adds revenue to the solar project without significant impact on
                panel output.
              </p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <div className="text-3xl mb-4">&#128225;</div>
              <h3 className="text-xl font-bold text-white mb-3">
                Flat Prairie = Clear LOS
              </h3>
              <p className="text-gray-400">
                Illinois prairie terrain is ideal for long-range radio links.
                With minimal obstructions, a 60m tower at Mendota has
                line-of-sight to relay points in every direction, enabling
                multi-gigabit backhaul links.
              </p>
            </div>
          </div>

          {/* Mendota Details */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Site Specifications
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">Mendota, LaSalle County, IL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Coordinates:</span>
                  <span className="text-white font-mono">
                    41.5475&deg;N, 89.1178&deg;W
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Elevation:</span>
                  <span className="text-white">751 ft (229m) ASL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Terrain:</span>
                  <span className="text-white">Flat glaciated prairie</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Population (City):</span>
                  <span className="text-white">~7,300</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">County:</span>
                  <span className="text-white">LaSalle County</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Major Highways:</span>
                  <span className="text-white">I-39, US-51, IL-251</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Distance to Major Markets
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Rockford, IL</span>
                  <div className="text-right">
                    <span className="text-white">80 km (50 mi)</span>
                    <span className="text-gray-500 ml-2">North via I-39</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Chicago / Naperville</span>
                  <div className="text-right">
                    <span className="text-white">113 km (70 mi)</span>
                    <span className="text-gray-500 ml-2">East via I-88</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Quad Cities (Moline)</span>
                  <div className="text-right">
                    <span className="text-white">110 km (68 mi)</span>
                    <span className="text-gray-500 ml-2">West via I-80</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Peoria, IL</span>
                  <div className="text-right">
                    <span className="text-white">100 km (62 mi)</span>
                    <span className="text-gray-500 ml-2">SW via IL-251</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">DeKalb, IL (relay)</span>
                  <div className="text-right">
                    <span className="text-white">46 km (29 mi)</span>
                    <span className="text-gray-500 ml-2">NE</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">LaSalle-Peru (relay)</span>
                  <div className="text-right">
                    <span className="text-white">23 km (14 mi)</span>
                    <span className="text-gray-500 ml-2">South</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Illinois Network Map */}
      <section id="network-map" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Illinois Tower Network Map
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8">
            Mendota as the central junction connecting northern Illinois metro
            areas via point-to-point radio links. Click nodes and links for
            details.
          </p>
          <IllinoisNetworkMap />
        </div>
      </section>

      {/* Tower Site Planning */}
      <section id="site-planning" className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Tower Site Planning
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-4">
            Configure tower placement on the solar parcel. Tower must be
            positioned to minimize shadow impact on solar panels and minimize
            fiber boring across the property.
          </p>
          <p className="text-sm text-amber-400 text-center max-w-2xl mx-auto mb-8">
            At Mendota&apos;s latitude (41.55&deg;N), the sun is always in the
            southern sky. Shadows fall north. NW or NE corner placement keeps
            shadows away from the majority of the panel array.
          </p>
          <TowerSitePlanner />
        </div>
      </section>

      {/* RF Link Budget Calculator */}
      <section id="link-budget" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            RF Link Budget Calculator
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-4">
            Calculate signal viability for each Mendota-to-city link using
            real radio equipment specifications. Includes free space path loss,
            rain attenuation, Fresnel zone clearance, and line-of-sight geometry.
          </p>
          <p className="text-sm text-gray-500 text-center max-w-2xl mx-auto mb-8">
            Based on{" "}
            <a
              href="https://www.ve2dbe.com/english1.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              VE2DBE Radio Mobile
            </a>{" "}
            methodologies and standard RF engineering formulas. Use{" "}
            <a
              href="https://www.ve2dbe.com/english1.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Radio Mobile Online
            </a>{" "}
            for site-specific terrain analysis with real elevation data.
          </p>
          <MendotaLinkBudget />
        </div>
      </section>

      {/* Tower Configuration */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Tower Tier Architecture
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8">
            The tower is designed with distinct tiers: lower sections for mobile
            carrier tenants (revenue), upper sections for high-powered narrow-beam
            backbone radios connecting the statewide network.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Lower Tiers */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-4">
                Lower Tower (0-50m) - Revenue Tiers
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-gray-500 pl-4">
                  <h4 className="font-semibold text-white">
                    Ground Level (0-10m)
                  </h4>
                  <p className="text-sm text-gray-400">
                    Equipment shelters, fiber demarcation, power distribution,
                    network switching gear
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-white">
                    Lower Antennas (10-30m)
                  </h4>
                  <p className="text-sm text-gray-400">
                    Mobile carrier antennas (AT&amp;T, Verizon, T-Mobile),
                    local WISP sector antennas, county emergency services
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      4G/5G
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      Public Safety
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      WISP Sectors
                    </span>
                  </div>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-white">
                    Mid Tower (30-50m)
                  </h4>
                  <p className="text-sm text-gray-400">
                    Higher-gain carrier antennas, 5G small cell backhaul,
                    regional ISP point-to-point links
                  </p>
                </div>
              </div>
            </div>

            {/* Upper Tiers */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-amber-400 mb-4">
                Upper Tower (50m+) - Backbone Links
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h4 className="font-semibold text-white">
                    Backbone Level (50-80m)
                  </h4>
                  <p className="text-sm text-gray-400">
                    Municipal ISP backbone radios, inter-city point-to-point
                    links to relay towers at DeKalb, Sterling, LaSalle-Peru
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                      5 GHz PTP
                    </span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">
                      11 GHz Licensed
                    </span>
                  </div>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-white">
                    Top of Tower (80m+)
                  </h4>
                  <p className="text-sm text-gray-400">
                    Highest-powered, narrowest-beam radios for the longest
                    links. High-gain dish antennas (33-38 dBi) aimed at
                    Rockford, Chicago, Quad Cities, and Peoria relay points.
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                      High-Power PTP
                    </span>
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                      Narrow Beam
                    </span>
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                      Multi-Gbps
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-slate-900/50 rounded text-sm text-gray-400">
                <strong className="text-amber-400">Key principle:</strong>{" "}
                Lower tiers generate revenue from carrier leases. Upper tiers
                carry the municipal ISP backbone. Revenue from carriers
                subsidizes the community network infrastructure.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Model */}
      <section id="revenue" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Revenue &amp; Business Model
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8">
            Dual revenue streams: tower co-location leases from mobile carriers
            and municipal ISP subscriber fees. Adjust tenant counts and tower
            height to model different scenarios.
          </p>
          <TowerRevenueModel />
        </div>
      </section>

      {/* Fiber & Infrastructure */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Fiber Optic &amp; Infrastructure Requirements
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8">
            The tower requires fiber optic backhaul bored to the property for
            internet transit. Routing must minimize disruption to existing
            solar panel infrastructure.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Fiber Boring Requirements
              </h3>
              <div className="space-y-4 text-sm">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-white">
                    Directional Boring
                  </h4>
                  <p className="text-gray-400">
                    Horizontal directional drilling (HDD) is the preferred
                    method. Bores underground without disturbing surface
                    infrastructure including solar panel foundations and underground
                    wiring.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-white">Route Planning</h4>
                  <p className="text-gray-400">
                    Route fiber from the nearest road right-of-way to the tower
                    base, following property edges. Avoid cutting through the
                    active solar array. NW corner placement offers the shortest
                    bore path in most parcel configurations.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-white">Cost Factors</h4>
                  <p className="text-gray-400">
                    Illinois prairie soil (clay/loam) is favorable for boring at
                    $15-25/ft. Total bore of 300-700 ft typically runs $5,000 -
                    $18,000. Add conduit and fiber cable costs ($2-5/ft
                    materials).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                Infrastructure Checklist
              </h3>
              <div className="space-y-3">
                {[
                  {
                    item: "Tower foundation engineering & permits",
                    status: "Planning",
                  },
                  {
                    item: "FAA obstruction evaluation (if >60m / 200ft)",
                    status: "Required",
                  },
                  {
                    item: "FCC antenna structure registration",
                    status: "Required",
                  },
                  {
                    item: "Fiber optic bore to road ROW",
                    status: "Planning",
                  },
                  {
                    item: "Electrical service to tower compound",
                    status: "Available (solar site)",
                  },
                  {
                    item: "Equipment shelter / cabinet",
                    status: "Spec needed",
                  },
                  {
                    item: "Grounding & lightning protection system",
                    status: "Required",
                  },
                  {
                    item: "Access road to tower base",
                    status: "Planning",
                  },
                  {
                    item: "Security fencing (tower compound)",
                    status: "Required",
                  },
                  {
                    item: "FCC spectrum licensing (11 GHz PTP)",
                    status: "If using licensed bands",
                  },
                ].map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm bg-slate-900/50 rounded p-2"
                  >
                    <span className="text-gray-300">{task.item}</span>
                    <span className="text-xs text-amber-400 whitespace-nowrap ml-2">
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tower Type Options */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h4 className="font-bold text-white mb-2">
                Monopole (100-200 ft)
              </h4>
              <div className="text-sm text-gray-400 mb-3">
                Single steel pole, smallest footprint
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost:</span>
                  <span className="text-white">$150K-$400K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Footprint:</span>
                  <span className="text-white">~25 ft radius</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tenants:</span>
                  <span className="text-white">3-4 max</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Best for:</span>
                  <span className="text-white">Suburban, zoning-sensitive</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
              <h4 className="font-bold text-amber-400 mb-2">
                Self-Support Lattice (200-400 ft)
              </h4>
              <div className="text-sm text-gray-400 mb-3">
                Steel lattice, high capacity, no guy wires
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost:</span>
                  <span className="text-white">$200K-$600K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Footprint:</span>
                  <span className="text-white">~40 ft base</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tenants:</span>
                  <span className="text-white">5-8+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Best for:</span>
                  <span className="text-white font-semibold">
                    This project
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-amber-300">
                Recommended: High capacity with manageable footprint
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
              <h4 className="font-bold text-white mb-2">
                Guyed Tower (300-2000 ft)
              </h4>
              <div className="text-sm text-gray-400 mb-3">
                Cheapest per foot, requires large land footprint
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost:</span>
                  <span className="text-white">Lowest per ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Footprint:</span>
                  <span className="text-white">60-80% of height radius</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tenants:</span>
                  <span className="text-white">Many</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Concern:</span>
                  <span className="text-yellow-400">
                    Guy wires conflict with solar panels
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Municipal ISP Vision */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            Municipal ISP: The Bigger Picture
          </h2>
          <p className="text-gray-400 text-center max-w-3xl mx-auto mb-8">
            The Mendota tower is the first node in a community-owned broadband
            network. By combining tower lease revenue with ISP subscriber fees,
            the infrastructure pays for itself while serving the community.
          </p>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-amber-400 mb-4">
                  The Model
                </h3>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-3">
                    <span className="text-amber-400 font-bold">1.</span>
                    <span>
                      <strong className="text-white">Build the tower</strong>{" "}
                      at the Mendota solar site. Fiber backhaul bored to the
                      property. Solar power available on-site.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-400 font-bold">2.</span>
                    <span>
                      <strong className="text-white">
                        Lease lower tower space
                      </strong>{" "}
                      to AT&amp;T, Verizon, T-Mobile for cellular coverage.
                      Revenue: $3,000-7,000/mo. This covers ongoing costs.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-400 font-bold">3.</span>
                    <span>
                      <strong className="text-white">
                        Launch municipal ISP
                      </strong>{" "}
                      using the upper tower for backbone and sector antennas
                      for local coverage. Competitive broadband at $65/mo.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-400 font-bold">4.</span>
                    <span>
                      <strong className="text-white">
                        Connect to neighboring cities
                      </strong>{" "}
                      via point-to-point backbone links. Each city can
                      replicate the model with their own tower.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-400 font-bold">5.</span>
                    <span>
                      <strong className="text-white">
                        Scale statewide
                      </strong>{" "}
                      as each junction tower connects to the next. Solar +
                      tower co-location at every site. Community-owned
                      infrastructure, not corporate.
                    </span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-4">
                  Why This Works
                </h3>
                <div className="space-y-4 text-sm text-gray-300">
                  <div className="bg-slate-900/50 rounded p-3">
                    <strong className="text-white">
                      Carrier leases fund infrastructure.
                    </strong>{" "}
                    Mobile carriers need rural tower sites. They pay
                    $1,500-3,500/mo per tenant. With 2-3 carriers, the tower
                    generates $50,000-100,000/year before a single ISP
                    subscriber signs up.
                  </div>
                  <div className="bg-slate-900/50 rounded p-3">
                    <strong className="text-white">
                      Solar co-location reduces costs.
                    </strong>{" "}
                    Existing land, existing power infrastructure, existing road
                    access. No need to buy new property or build a power line.
                  </div>
                  <div className="bg-slate-900/50 rounded p-3">
                    <strong className="text-white">
                      Flat terrain = long range.
                    </strong>{" "}
                    Illinois prairie gives a 60m tower clear line of sight to
                    30+ km. Most states would need 2-3x more relay towers to
                    cover the same area.
                  </div>
                  <div className="bg-slate-900/50 rounded p-3">
                    <strong className="text-white">
                      Community ownership = community benefit.
                    </strong>{" "}
                    Revenue stays local. Pricing stays competitive. No
                    corporate extraction. The network serves the people who
                    built it.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16 px-4 bg-amber-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            From Framework to Reality
          </h2>
          <p className="text-amber-100 mb-8">
            The Mendota Solar Tower is the first step toward a community-owned,
            solar-powered communications network spanning Illinois. The tower
            pays for itself through carrier leases while delivering broadband
            to underserved communities.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="#site-planning"
              className="bg-white hover:bg-gray-100 text-amber-700 px-6 py-3 rounded-lg font-semibold transition"
            >
              Site Planning Tools
            </a>
            <a
              href="#link-budget"
              className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              RF Calculator
            </a>
            <a
              href="https://www.ve2dbe.com/english1.html"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              VE2DBE Radio Mobile
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-gray-400">
            <strong className="text-yellow-400">Disclaimer:</strong> This page
            contains planning calculations and projections for a proposed tower
            infrastructure project. RF calculations are based on standard
            engineering formulas and should be validated with site-specific
            terrain analysis using tools like{" "}
            <a
              href="https://www.ve2dbe.com/english1.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              VE2DBE Radio Mobile
            </a>
            . Revenue projections are estimates based on typical Illinois tower
            lease rates and should not be considered guaranteed. All tower
            construction requires proper engineering, permitting, and regulatory
            compliance (FAA, FCC, local zoning). This framework is provided for
            planning and proposal purposes.
          </div>
        </div>
      </section>
    </div>
  );
}
