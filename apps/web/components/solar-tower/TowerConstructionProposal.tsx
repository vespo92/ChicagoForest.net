export default function TowerConstructionProposal() {
  return (
    <section id="construction-proposal" className="py-16 px-4 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
            <span className="text-amber-400 text-sm font-semibold">
              CONSTRUCTION COST PROPOSAL
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            400&apos; Self-Support Lattice Tower
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-6">
            Detailed cost breakdown for a 400-foot (122m) self-support lattice
            tower at the Mendota, IL solar distribution site. Designed for
            multi-tenant carrier co-location and municipal ISP backbone.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-400">400 ft</div>
              <div className="text-xs text-gray-400">Tower Height</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-400">122m</div>
              <div className="text-xs text-gray-400">Metric Height</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-400">Self-Support</div>
              <div className="text-xs text-gray-400">Tower Type</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-400">5-8+</div>
              <div className="text-xs text-gray-400">Tenant Capacity</div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Tower Structure & Erection */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-1">
              Tower Structure &amp; Erection
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Fabrication, delivery, and crane erection of lattice sections
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  400&apos; galvanized steel lattice (fabrication)
                </span>
                <span className="text-white">$250K–$450K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery &amp; logistics</span>
                <span className="text-white">$25K–$50K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Crane erection (300-ton crane)
                </span>
                <span className="text-white">$100K–$175K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Climbing pegs, platforms, cable ladders
                </span>
                <span className="text-white">$25K–$40K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  FAA lighting (dual medium-intensity)
                </span>
                <span className="text-white">$15K–$25K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tower paint / marking</span>
                <span className="text-white">$10K–$15K</span>
              </div>
              <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                <span className="text-amber-400">Subtotal</span>
                <span className="text-amber-400">$425K–$750K</span>
              </div>
            </div>
          </div>

          {/* Foundation */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-1">Foundation</h3>
            <p className="text-xs text-gray-500 mb-4">
              Geotechnical, concrete pier foundation for 400&apos; lattice
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Geotechnical survey &amp; engineering
                </span>
                <span className="text-white">$15K–$30K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Concrete pier foundations (4 legs)
                </span>
                <span className="text-white">$80K–$150K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Excavation &amp; backfill
                </span>
                <span className="text-white">$15K–$30K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Anchor bolts &amp; rebar</span>
                <span className="text-white">$5K–$10K</span>
              </div>
              <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                <span className="text-amber-400">Subtotal</span>
                <span className="text-amber-400">$115K–$220K</span>
              </div>
            </div>
          </div>

          {/* FAA & Regulatory */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-1">
              FAA &amp; Regulatory
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Required federal/state/local permits for 400&apos; structure
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  FAA Obstruction Evaluation / Aeronautical Study
                </span>
                <span className="text-white">$3K–$8K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  FCC Antenna Structure Registration (ASR)
                </span>
                <span className="text-white">$2.5K–$5K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  NEPA environmental review
                </span>
                <span className="text-white">$5K–$15K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Structural engineering (PE stamped)
                </span>
                <span className="text-white">$20K–$50K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  County zoning / CUP / building permit
                </span>
                <span className="text-white">$5K–$15K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  FCC spectrum license (11 GHz)
                </span>
                <span className="text-white">$10K–$25K</span>
              </div>
              <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                <span className="text-amber-400">Subtotal</span>
                <span className="text-amber-400">$45.5K–$118K</span>
              </div>
            </div>
          </div>

          {/* Site Infrastructure */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-1">
              Site Infrastructure
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Compound, power, grounding, and access improvements
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Equipment shelter / outdoor cabinet
                </span>
                <span className="text-white">$15K–$40K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Electrical service &amp; metering
                </span>
                <span className="text-white">$10K–$25K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Backup generator (20kW diesel)
                </span>
                <span className="text-white">$15K–$35K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Grounding &amp; lightning protection
                </span>
                <span className="text-white">$8K–$20K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Security fencing (100&apos; x 100&apos; compound)
                </span>
                <span className="text-white">$10K–$25K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Access road / gravel pad
                </span>
                <span className="text-white">$8K–$15K</span>
              </div>
              <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                <span className="text-amber-400">Subtotal</span>
                <span className="text-amber-400">$66K–$160K</span>
              </div>
            </div>
          </div>

          {/* Fiber Optic Backhaul */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-1">
              Fiber Optic Backhaul
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Directional bore from road ROW to tower compound
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Directional boring (300-700 ft @ $15-25/ft)
                </span>
                <span className="text-white">$5K–$18K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Conduit &amp; fiber cable materials
                </span>
                <span className="text-white">$2K–$5K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Fiber termination &amp; testing
                </span>
                <span className="text-white">$2K–$6K</span>
              </div>
              <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                <span className="text-amber-400">Subtotal</span>
                <span className="text-amber-400">$9K–$29K</span>
              </div>
            </div>
          </div>

          {/* Radio Equipment Phase 1 */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-1">
              Radio Equipment (Phase 1)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Initial backbone links and local coverage radios
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  PTP backbone radios (2-3 links)
                </span>
                <span className="text-white">$15K–$45K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  High-gain dish antennas (33-38 dBi)
                </span>
                <span className="text-white">$6K–$15K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Network switching &amp; routing gear
                </span>
                <span className="text-white">$8K–$20K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Sector antennas (local coverage)
                </span>
                <span className="text-white">$5K–$10K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  Installation &amp; alignment
                </span>
                <span className="text-white">$5K–$7K</span>
              </div>
              <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                <span className="text-amber-400">Subtotal</span>
                <span className="text-amber-400">$39K–$97K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Project Cost */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-amber-400 mb-4 text-center">
            Total Project Cost Summary
          </h3>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-800/80 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Low Estimate</div>
              <div className="text-2xl font-bold text-green-400">$700K</div>
              <div className="text-xs text-gray-500">
                Minimal site work, competitive bids
              </div>
            </div>
            <div className="bg-slate-800/80 rounded-lg p-4 text-center border-2 border-amber-500/50">
              <div className="text-xs text-amber-400 mb-1 font-semibold">
                Realistic Budget Target
              </div>
              <div className="text-3xl font-bold text-amber-400">~$1M</div>
              <div className="text-xs text-gray-500">
                Mid-range with contingency
              </div>
            </div>
            <div className="bg-slate-800/80 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">High Estimate</div>
              <div className="text-2xl font-bold text-red-400">$1.37M</div>
              <div className="text-xs text-gray-500">
                Premium vendors, complex site conditions
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Cost ranges reflect 2025-2026 Illinois market pricing. Actual costs
            depend on vendor selection, soil conditions, permitting timeline, and
            material pricing at time of construction.
          </p>
        </div>

        {/* Revenue & Payback */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-green-400 mb-4 text-center">
            Revenue Projections &amp; Payback
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">
                Annual Revenue Streams
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Carrier leases (3 tenants @ $2K-3.5K/mo)
                  </span>
                  <span className="text-green-400">$72K–$126K/yr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Municipal ISP subscribers (500 @ $65/mo)
                  </span>
                  <span className="text-green-400">$390K/yr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    Government / emergency services lease
                  </span>
                  <span className="text-green-400">$24K–$48K/yr</span>
                </div>
                <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                  <span className="text-white">
                    Total Annual Revenue (at scale)
                  </span>
                  <span className="text-green-400">$486K–$564K/yr</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">
                Payback Analysis
              </h4>
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Year 1 (tower leases only)
                    </span>
                    <span className="text-green-400 text-sm font-semibold">
                      $72K–$126K
                    </span>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      Year 2 (leases + ISP ramp)
                    </span>
                    <span className="text-green-400 text-sm font-semibold">
                      $250K–$400K
                    </span>
                  </div>
                </div>
                <div className="bg-green-500/20 rounded p-3 border border-green-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-semibold">
                      Full payback target
                    </span>
                    <span className="text-green-400 font-bold">
                      18–24 months
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    With carrier leases starting month 1, ISP subscribers
                    ramping by month 6
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 400 ft vs 200 ft Comparison */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            Why 400&apos; vs 200&apos;?
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left text-gray-400 py-2 pr-4">Factor</th>
                  <th className="text-center text-gray-400 py-2 px-4">
                    200&apos; Tower
                  </th>
                  <th className="text-center text-amber-400 py-2 pl-4">
                    400&apos; Tower
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="text-gray-300 py-3 pr-4">
                    Line-of-sight radius
                  </td>
                  <td className="text-center text-gray-400 py-3 px-4">
                    ~28 km (17 mi)
                  </td>
                  <td className="text-center text-white py-3 pl-4 font-semibold">
                    ~40 km (25 mi)
                  </td>
                </tr>
                <tr>
                  <td className="text-gray-300 py-3 pr-4">
                    Carrier tenant capacity
                  </td>
                  <td className="text-center text-gray-400 py-3 px-4">
                    3-4 tenants
                  </td>
                  <td className="text-center text-white py-3 pl-4 font-semibold">
                    5-8+ tenants
                  </td>
                </tr>
                <tr>
                  <td className="text-gray-300 py-3 pr-4">
                    Annual lease revenue potential
                  </td>
                  <td className="text-center text-gray-400 py-3 px-4">
                    $50K–$80K
                  </td>
                  <td className="text-center text-green-400 py-3 pl-4 font-semibold">
                    $96K–$175K
                  </td>
                </tr>
                <tr>
                  <td className="text-gray-300 py-3 pr-4">
                    Construction cost
                  </td>
                  <td className="text-center text-gray-400 py-3 px-4">
                    $350K–$600K
                  </td>
                  <td className="text-center text-white py-3 pl-4">
                    $700K–$1.37M
                  </td>
                </tr>
                <tr>
                  <td className="text-gray-300 py-3 pr-4">FAA requirements</td>
                  <td className="text-center text-gray-400 py-3 px-4">
                    Evaluation required
                  </td>
                  <td className="text-center text-white py-3 pl-4">
                    Full study + lighting
                  </td>
                </tr>
                <tr>
                  <td className="text-gray-300 py-3 pr-4">
                    Backbone link quality
                  </td>
                  <td className="text-center text-gray-400 py-3 px-4">
                    Good (relay needed for 80km+)
                  </td>
                  <td className="text-center text-green-400 py-3 pl-4 font-semibold">
                    Excellent (direct 100km+ links)
                  </td>
                </tr>
                <tr>
                  <td className="text-gray-300 py-3 pr-4">
                    Payback period
                  </td>
                  <td className="text-center text-gray-400 py-3 px-4">
                    24–36 months
                  </td>
                  <td className="text-center text-green-400 py-3 pl-4 font-semibold">
                    18–24 months
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            The 400&apos; tower costs ~2x more but generates ~2-3x more revenue
            through additional tenants and premium lease rates. The taller tower
            also enables direct backbone links to all target cities without
            intermediate relays, reducing long-term operating costs.
          </p>
        </div>

        {/* Implementation Timeline */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Implementation Timeline
          </h3>
          <div className="space-y-6">
            {/* Phase 1 */}
            <div className="border-l-4 border-amber-500 pl-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full">
                  PHASE 1
                </span>
                <span className="text-gray-400 text-sm">
                  Q2 2026 – Q4 2026
                </span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Planning &amp; Permitting
              </h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-400">
                <div>- Geotechnical survey &amp; soil testing</div>
                <div>- Structural engineering (PE stamped drawings)</div>
                <div>- FAA Obstruction Evaluation filing</div>
                <div>- FCC ASR registration</div>
                <div>- NEPA environmental review</div>
                <div>- County zoning / conditional use permit</div>
                <div>- Fiber backhaul ISP contract</div>
                <div>- Tower vendor RFP &amp; selection</div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="border-l-4 border-blue-500 pl-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
                  PHASE 2
                </span>
                <span className="text-gray-400 text-sm">
                  Q1 2027 – Q3 2027
                </span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Construction &amp; Commissioning
              </h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-400">
                <div>- Foundation excavation &amp; concrete pour</div>
                <div>- Tower fabrication &amp; delivery</div>
                <div>- Crane erection (2-3 day operation)</div>
                <div>- FAA lighting installation &amp; certification</div>
                <div>- Fiber bore &amp; termination</div>
                <div>- Equipment shelter &amp; power install</div>
                <div>- Backbone radio installation &amp; alignment</div>
                <div>- Carrier lease marketing begins</div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="border-l-4 border-green-500 pl-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full">
                  PHASE 3
                </span>
                <span className="text-gray-400 text-sm">
                  Q4 2027 – 2028+
                </span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Revenue &amp; Expansion
              </h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-400">
                <div>- First carrier tenants go live</div>
                <div>- Municipal ISP subscriber launch</div>
                <div>- Backbone links to relay towers activated</div>
                <div>- Government / emergency services leases</div>
                <div>- Second tower site selection (network expansion)</div>
                <div>- Revenue-funded growth to adjacent communities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
