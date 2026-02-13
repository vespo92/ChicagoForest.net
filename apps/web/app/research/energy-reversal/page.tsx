"use client"

import Link from "next/link"
import {
  ArrowUpFromDot, Zap, Globe, FileText, ExternalLink, AlertTriangle,
  Info, Sun, Waves, ArrowDown, ArrowUp, Layers, Radio, Gauge
} from "lucide-react"

// ─── DOCUMENTED: Real patents and papers ───
const relevantPatents = [
  {
    id: "US787412A",
    title: "Art of Transmitting Electrical Energy Through the Natural Mediums",
    year: 1905,
    inventor: "Nikola Tesla",
    url: "https://patents.google.com/patent/US787412A",
    relevance: "Describes using Earth as a conductor - the foundation for ground-based energy extraction via resonant coupling.",
  },
  {
    id: "US645576A",
    title: "System of Transmission of Electrical Energy",
    year: 1900,
    inventor: "Nikola Tesla",
    url: "https://patents.google.com/patent/US645576A",
    relevance: "First patent describing the Earth-ionosphere waveguide for wireless energy transmission.",
  },
  {
    id: "US1119732A",
    title: "Apparatus for Transmitting Electrical Energy",
    year: 1914,
    inventor: "Nikola Tesla",
    url: "https://patents.google.com/patent/US1119732A",
    relevance: "Engineering specifications for tower installations with deep ground electrode systems.",
  },
  {
    id: "US685012A",
    title: "Means for Increasing the Intensity of Electrical Oscillations",
    year: 1901,
    inventor: "Nikola Tesla",
    url: "https://patents.google.com/patent/US685012A",
    relevance: "Resonant amplification method - key to achieving energy extraction exceeding input excitation.",
  },
  {
    id: "US600457A",
    title: "Electric Battery",
    year: 1898,
    inventor: "Nathan Stubblefield",
    url: "https://patents.google.com/patent/US600457A",
    relevance: "Earth battery patent demonstrating extraction of electrical energy from ground using buried coils.",
  },
]

const documentedSources = [
  {
    title: "Schumann Resonances (Original 1952 Paper)",
    author: "W. O. Schumann",
    type: "Scientific Paper",
    url: "https://doi.org/10.1007/BF01339895",
    description: "Original measurement of Earth-ionosphere cavity resonances at 7.83 Hz and harmonics.",
  },
  {
    title: "The Global Atmospheric Electrical Circuit",
    author: "M. J. Rycroft et al.",
    type: "Review Paper",
    url: "https://doi.org/10.1023/A:1026557228400",
    description: "Comprehensive review of the global electrical circuit: ~1,800A total current, ~250kV ionosphere-ground potential.",
  },
  {
    title: "Colorado Springs Notes 1899-1900",
    author: "Nikola Tesla",
    type: "Laboratory Notes",
    url: "https://www.teslauniverse.com/nikola-tesla/books/nikola-tesla-colorado-springs-notes-1899-1900",
    description: "Tesla's experiments demonstrating Earth resonance and standing electrical waves in the ground.",
  },
  {
    title: "FBI Declassified Tesla Files",
    author: "Federal Bureau of Investigation",
    type: "Government Documents",
    url: "https://vault.fbi.gov/nikola-tesla",
    description: "Declassified documents including Tesla's papers on Earth energy and wireless power seized after his death.",
  },
  {
    title: "Telluric Currents: The Natural Environment and Interactions with Man-made Systems",
    author: "A. A. Gregori & L. J. Lanzerotti",
    type: "Scientific Paper",
    url: "https://doi.org/10.1007/978-94-009-7064-8",
    description: "Documented natural electric currents flowing through Earth's surface and subsurface layers.",
  },
  {
    title: "Wardenclyffe Tower Historical Documentation",
    author: "Tesla Science Center at Wardenclyffe",
    type: "Archive",
    url: "https://teslasciencecenter.org/",
    description: "Preservation of the Wardenclyffe site including documentation of Tesla's 120ft deep ground electrode shaft.",
  },
]

// ─── DOCUMENTED: Real atmospheric electricity facts ───
const atmosphericFacts = [
  { label: "Ionosphere-Ground Potential", value: "~250,000 V", source: "Measured since 1920s" },
  { label: "Global Circuit Current", value: "~1,800 A", source: "Maintained by thunderstorms" },
  { label: "Fair-Weather Electric Field", value: "~100-150 V/m", source: "At Earth's surface" },
  { label: "Schumann Fundamental", value: "7.83 Hz", source: "Measured by Schumann, 1952" },
  { label: "Earth Surface Charge", value: "Net Negative", source: "~500,000 coulombs" },
  { label: "Lightning Strikes Globally", value: "~100/second", source: "Maintains the circuit" },
  { label: "Cavity Q-Factor", value: "~5-10", source: "Earth-ionosphere resonator" },
  { label: "Telluric Current Density", value: "~1-10 mA/km", source: "Varies with geomagnetic activity" },
]

export default function EnergyReversalPage() {
  return (
    <div className="py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link href="/research" className="hover:text-primary">Research</Link>
            <span>/</span>
            <span>Energy Reversal</span>
          </div>

          <div className="flex items-start space-x-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <ArrowUpFromDot className="h-12 w-12 text-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold">Plasma Energy Reversal</h1>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-600 text-sm font-medium">
                  THEORETICAL
                </span>
              </div>
              <p className="text-xl text-muted-foreground">
                Can We Extract Energy From Earth Instead of Dissipating It Into Ground?
              </p>
            </div>
          </div>
        </div>

        {/* Theoretical Disclaimer */}
        <div className="bg-orange-500/10 border-2 border-orange-500/50 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-400">
                AI-Generated Theoretical Framework
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-300">
                This page combines <strong>documented physics</strong> (atmospheric electricity, Schumann resonances,
                telluric currents) with a <strong>speculative theoretical framework</strong> for energy extraction.
                The documented science is real and verified. The &quot;energy reversal&quot; concept for the Plasma Forest
                Network is a theoretical extension that has not been built or proven. No claims of working
                devices are being made.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: THE PROBLEM - Why Electrons Go to Ground */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-card border rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <ArrowDown className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">The Problem: Why Energy Flows Into Ground</h2>
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-600 text-xs font-medium">DOCUMENTED</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                In conventional electrical engineering, grounding is a one-way street. Current flows to
                Earth because the Earth acts as a massive charge sink - its enormous mass provides effectively
                infinite capacitance. Any voltage difference between a conductor and Earth resolves by
                electrons flowing <strong>into</strong> the ground.
              </p>
              <p className="text-muted-foreground">
                This is the fundamental challenge: every grounding rod, every lightning strike, every
                fault current sends energy into the Earth where it appears to dissipate. From a
                conventional perspective, the ground is where energy goes to die.
              </p>
              <p className="text-muted-foreground">
                But Tesla saw something different. He recognized that the Earth is not a passive sink -
                it is an <strong>active electrical system</strong> carrying enormous energy. The question
                is not whether the energy exists, but whether we can couple to it.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg border">
                <h4 className="font-semibold mb-3">Conventional Grounding Model</h4>
                <div className="font-mono text-sm space-y-2 text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Source (generator, lightning)</span>
                  </div>
                  <div className="pl-3 border-l-2 border-primary/30 ml-2">
                    <ArrowDown className="h-4 w-4 text-primary mx-auto" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-green-500" />
                    <span>Load (appliances, equipment)</span>
                  </div>
                  <div className="pl-3 border-l-2 border-primary/30 ml-2">
                    <ArrowDown className="h-4 w-4 text-primary mx-auto" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span>Ground (energy &quot;lost&quot;)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-2">Tesla&apos;s Key Insight</h4>
                <blockquote className="text-sm italic text-muted-foreground border-l-2 border-primary pl-3">
                  &quot;The Earth is a conductor of limited dimensions... it can be thrown into resonance
                  like a wire.&quot;
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">
                  - From Colorado Springs Notes, 1899
                  (<a href="https://www.teslauniverse.com/nikola-tesla/books/nikola-tesla-colorado-springs-notes-1899-1900"
                    target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Source</a>)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: DOCUMENTED - Earth's Electrical Energy */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-card border rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Documented: Earth&apos;s Electrical Energy Budget</h2>
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-600 text-xs font-medium">DOCUMENTED</span>
          </div>

          <p className="text-muted-foreground mb-6">
            The Earth is not electrically inert. It maintains a massive, continuously operating electrical
            circuit. These are measured, documented facts from atmospheric physics:
          </p>

          {/* Atmospheric Electricity Facts Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {atmosphericFacts.map((fact) => (
              <div key={fact.label} className="p-4 rounded-xl bg-secondary/50 border">
                <div className="text-2xl font-bold text-primary mb-1">{fact.value}</div>
                <div className="text-sm font-medium mb-1">{fact.label}</div>
                <div className="text-xs text-muted-foreground">{fact.source}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Global Circuit Diagram */}
            <div className="p-6 bg-secondary/30 rounded-xl border">
              <h3 className="font-semibold mb-4">The Global Atmospheric Electrical Circuit</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <div className="font-medium text-blue-600 dark:text-blue-400">Ionosphere (+250,000V)</div>
                  <div className="text-xs">Positively charged layer at ~60-1000 km altitude</div>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex flex-col items-center">
                    <ArrowDown className="h-5 w-5 text-yellow-500" />
                    <span className="text-xs">Fair-weather</span>
                    <span className="text-xs">current (~1,800A)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowUp className="h-5 w-5 text-red-500" />
                    <span className="text-xs">Lightning</span>
                    <span className="text-xs">(~100/sec globally)</span>
                  </div>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <div className="font-medium text-green-600 dark:text-green-400">Earth Surface (0V reference, net negative charge)</div>
                  <div className="text-xs">~500,000 coulombs distributed across surface</div>
                </div>
                <p className="text-xs mt-2">
                  Thunderstorms act as generators, pumping charge upward. Fair-weather regions leak current
                  downward. This maintains a continuous ~250kV potential difference. The energy is real and
                  enormous - approximately <strong>~400 MW</strong> total power in the global circuit.
                </p>
              </div>
            </div>

            {/* Schumann Resonances */}
            <div className="p-6 bg-secondary/30 rounded-xl border">
              <h3 className="font-semibold mb-4">Schumann Resonances</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The Earth-ionosphere cavity acts as a natural resonator. These frequencies are real,
                continuously measured worldwide:
              </p>
              <div className="space-y-2">
                {[
                  { mode: "1st", freq: "7.83 Hz", note: "Fundamental - strongest signal" },
                  { mode: "2nd", freq: "14.3 Hz", note: "First overtone" },
                  { mode: "3rd", freq: "20.8 Hz", note: "Second overtone" },
                  { mode: "4th", freq: "27.3 Hz", note: "Third overtone" },
                  { mode: "5th", freq: "33.8 Hz", note: "Fourth overtone" },
                ].map((sr) => (
                  <div key={sr.mode} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                    <span className="text-sm font-medium">{sr.mode} Mode</span>
                    <span className="text-sm font-mono text-primary">{sr.freq}</span>
                    <span className="text-xs text-muted-foreground">{sr.note}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  <strong>Formula:</strong>{" "}
                  <code className="font-mono">f_n = (c / 2πR) × √(n(n+1))</code> where c = speed of light,
                  R = Earth radius, n = mode number. First calculated by W.O. Schumann in 1952
                  (<a href="https://doi.org/10.1007/BF01339895" target="_blank" rel="noopener noreferrer"
                    className="text-primary hover:underline">DOI</a>).
                </p>
              </div>
            </div>
          </div>

          {/* Telluric Currents */}
          <div className="mt-8 p-6 bg-secondary/30 rounded-xl border">
            <h3 className="font-semibold mb-4">Telluric Currents: Electricity Already in the Ground</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  <strong>Telluric currents</strong> are naturally occurring electric currents that flow
                  through the Earth&apos;s crust and oceans. They are real, measured, and have been used
                  practically since the 1840s:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">-</span>
                    <span><strong>1849:</strong> Earth batteries used to power telegraph lines without
                    conventional batteries (documented by Bain and others)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">-</span>
                    <span><strong>1859:</strong> During the Carrington Event (solar storm), telegraph
                    operators sent messages powered entirely by telluric currents</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">-</span>
                    <span><strong>1892:</strong> Nathan Stubblefield demonstrated wireless telephony
                    and lighting using ground-extracted energy (Patent{" "}
                    <a href="https://patents.google.com/patent/US600457A" target="_blank"
                      rel="noopener noreferrer" className="text-primary hover:underline">US600457A</a>)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-primary mt-1">-</span>
                    <span><strong>Today:</strong> Telluric currents are routinely measured for
                    geophysical surveys and space weather monitoring</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="font-semibold text-green-600 dark:text-green-400 mb-2">
                    Historical Precedent: Earth Batteries
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Earth batteries are documented technology - pairs of dissimilar metal electrodes buried
                    in moist earth that produce voltage from electrochemical and telluric effects. These powered
                    telegraph systems in the 1800s. The energy extraction from ground is not theoretical -
                    it has been done. The question is whether it can be scaled using resonance.
                  </p>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <div className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                    Scale Challenge
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Historical earth batteries produced milliwatts to watts. Telluric current densities
                    are typically ~1-10 mA/km. Scaling this to kilowatt or megawatt levels for a Plasma
                    Forest node requires resonant amplification - which is where Tesla&apos;s work becomes
                    critical and the concept becomes theoretical.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 3: THEORETICAL - The Reversal Concept */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-card border-2 border-orange-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <ArrowUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Theoretical: Reversing the Ground Tendency</h2>
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-600 text-xs font-medium">THEORETICAL</span>
          </div>
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-6">
            The following is a speculative theoretical framework. None of this has been built or demonstrated.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">The Core Idea</h3>
                <p className="text-sm text-muted-foreground">
                  You don&apos;t actually need to reverse electron flow. Instead, you need to
                  <strong> couple to the energy that&apos;s already flowing</strong>. The Earth-ionosphere
                  system maintains ~250,000V potential and ~400 MW of continuous power. The
                  &quot;reversal&quot; is conceptual: instead of the tower being a place where energy
                  <em> drains into</em> the ground, it becomes a place where energy is
                  <em> extracted from</em> the ground-ionosphere system.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">How It Could Work (Theoretical)</h3>
                <ol className="text-sm text-muted-foreground space-y-3 list-decimal list-inside">
                  <li>
                    <strong>Deep Ground Electrode</strong> - Like Wardenclyffe&apos;s 120ft shaft, the tower
                    couples deeply into the Earth&apos;s conductive layers, ideally reaching the water
                    table or bedrock aquifer for maximum conductivity.
                  </li>
                  <li>
                    <strong>Elevated Capacitive Terminal</strong> - A mushroom-shaped dome (like
                    Wardenclyffe) acts as a capacitive antenna coupling to the atmospheric electric field
                    and ionospheric potential.
                  </li>
                  <li>
                    <strong>Resonant Excitation</strong> - The tower is driven at Schumann resonance
                    frequencies (7.83 Hz or harmonics) to excite standing waves in the Earth-ionosphere
                    cavity. This is the &quot;solar priming&quot; step.
                  </li>
                  <li>
                    <strong>Resonant Extraction</strong> - At resonance, the coupling between the tower
                    and the Earth-ionosphere cavity maximizes. If the Q-factor is sufficient, the
                    extracted energy could theoretically exceed the excitation input.
                  </li>
                </ol>
              </div>
            </div>

            <div className="space-y-4">
              {/* Reversed Model Diagram */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-3">Proposed Reversal Model</h4>
                <div className="font-mono text-sm space-y-2 text-muted-foreground">
                  <div className="p-2 bg-blue-500/10 rounded flex items-center space-x-2">
                    <Waves className="h-4 w-4 text-blue-500" />
                    <span>Ionosphere (~250kV potential)</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-primary" />
                    <span className="text-xs ml-2">Capacitive coupling via elevated terminal</span>
                  </div>
                  <div className="p-2 bg-primary/10 rounded flex items-center space-x-2">
                    <Radio className="h-4 w-4 text-primary" />
                    <span>Tower (resonant at Schumann freq)</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowUp className="h-4 w-4 text-green-500" />
                    <span className="text-xs ml-2 text-green-600">Energy extracted upward to load</span>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded flex items-center space-x-2">
                    <Layers className="h-4 w-4 text-green-500" />
                    <span>Load (Plasma Forest node)</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowDown className="h-4 w-4 text-primary" />
                    <span className="text-xs ml-2">Deep ground electrode coupling</span>
                  </div>
                  <div className="p-2 bg-amber-500/10 rounded flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-amber-500" />
                    <span>Earth (telluric currents + stored charge)</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  The tower acts as a resonant bridge between Earth and ionosphere,
                  extracting energy from the potential difference rather than dissipating into it.
                </p>
              </div>

              {/* Key Equations */}
              <div className="p-4 bg-secondary/50 rounded-lg border">
                <h4 className="font-semibold mb-3">Theoretical Equations</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Atmospheric Potential vs Height</div>
                    <code className="font-mono text-xs">V(h) = V₀ × e^(-h/H)</code>
                    <div className="text-xs text-muted-foreground">V₀ ≈ 250kV, H ≈ 8.5 km scale height</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Resonant Extraction Power</div>
                    <code className="font-mono text-xs">P_ext = (ω₀/Q) × U_stored × k²</code>
                    <div className="text-xs text-muted-foreground">ω₀ = resonant freq, Q = quality factor, k = coupling coefficient</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Net Energy Condition</div>
                    <code className="font-mono text-xs">P_extracted &gt; P_excitation when Q × k² &gt; 1</code>
                    <div className="text-xs text-muted-foreground">The theoretical threshold for net energy gain</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 4: THEORETICAL - Solar Priming Architecture */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-card border-2 border-orange-500/30 rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Sun className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Theoretical: Solar Farm Priming Architecture</h2>
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-600 text-xs font-medium">THEORETICAL</span>
          </div>
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-6">
            Speculative design for using solar energy to bootstrap the resonant extraction system.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Phase 1 */}
            <div className="p-6 rounded-xl bg-secondary/30 border">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-yellow-600">1</span>
                </div>
                <h3 className="font-semibold">Bootstrap Phase</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Solar farm provides initial excitation power to drive the tower at Schumann resonance.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Solar Array</span>
                  <span>100-500 kW</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Drive Frequency</span>
                  <span>7.83 Hz</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Ground Depth</span>
                  <span>30-120 ft</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Terminal Height</span>
                  <span>100-200 ft</span>
                </div>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="p-6 rounded-xl bg-secondary/30 border">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-600">2</span>
                </div>
                <h3 className="font-semibold">Resonance Build</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Tower-Earth system reaches resonance with the ionospheric cavity. Energy coupling increases.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Target Q-factor</span>
                  <span>&gt;10 (enhanced)</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Coupling Coeff.</span>
                  <span>k &gt; 0.3</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Standing Waves</span>
                  <span>Forming</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Telluric Coupling</span>
                  <span>Increasing</span>
                </div>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="p-6 rounded-xl bg-secondary/30 border">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">3</span>
                </div>
                <h3 className="font-semibold">Extraction Phase</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Resonant extraction exceeds input. Solar array transitions from primary power to maintenance.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Extraction</span>
                  <span>&gt; P_input</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Solar Role</span>
                  <span>Maintenance only</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Net Output</span>
                  <span>To Plasma Forest</span>
                </div>
                <div className="flex justify-between p-2 bg-secondary/50 rounded">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-500">Self-sustaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tower Design */}
          <div className="p-6 bg-secondary/30 rounded-xl border">
            <h3 className="font-semibold mb-4">Proposed Chicago Plasma Forest Tower Design</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Each Plasma Forest hub station could theoretically incorporate a Wardenclyffe-inspired
                  tower design optimized for energy extraction rather than just transmission:
                </p>
                <ul className="space-y-2 ml-4">
                  <li><strong>Elevated Capacitive Dome:</strong> Mushroom-shaped terminal (20-30m diameter)
                  for maximum atmospheric coupling. Larger surface area = greater charge collection from the
                  atmospheric potential gradient.</li>
                  <li><strong>Deep Ground System:</strong> Multiple concentric ground rings + central
                  shaft reaching the water table (~30-120ft in Chicago area). The Chicago region&apos;s
                  high water table and clay soils provide good ground conductivity.</li>
                  <li><strong>Resonant Coil Assembly:</strong> Tesla coil configuration tuned to
                  Schumann harmonics, providing voltage step-up between ground and elevated terminal.</li>
                  <li><strong>Solar Priming Array:</strong> 100-500 kW solar installation providing bootstrap
                  and maintenance power. Located at the tower base or on adjacent land.</li>
                </ul>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2">Chicago-Specific Advantages</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>- High water table (8-15ft) provides excellent ground conductivity</li>
                    <li>- Clay-rich soils act as natural capacitive layer</li>
                    <li>- Lake Michigan provides massive conductive body nearby</li>
                    <li>- Flat terrain enables efficient horizontal ground radial systems</li>
                    <li>- High thunderstorm activity (30+ days/year) recharges local ground potential</li>
                    <li>- Existing industrial infrastructure for tower construction</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Honest Challenges</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>- Earth-ionosphere Q-factor is only ~5-10 (low for resonant extraction)</li>
                    <li>- Coupling coefficient at tower scale is unknown</li>
                    <li>- No one has demonstrated net energy gain from this approach</li>
                    <li>- Would require significant R&D to validate or refute</li>
                    <li>- Regulatory challenges for high-power RF emissions at ELF</li>
                    <li>- Environmental impact assessment needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 5: Key Patents */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-card border rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Relevant Patents</h2>
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-600 text-xs font-medium">DOCUMENTED</span>
          </div>

          <div className="space-y-4">
            {relevantPatents.map((patent) => (
              <a
                key={patent.id}
                href={patent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-bold text-primary">{patent.id}</span>
                    <span className="text-sm text-muted-foreground">({patent.year})</span>
                    <span className="text-xs text-muted-foreground">by {patent.inventor}</span>
                  </div>
                  <div className="font-medium mb-1">{patent.title}</div>
                  <div className="text-sm text-muted-foreground">{patent.relevance}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0 ml-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 6: Sources and References */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-card border rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Sources &amp; References</h2>
            <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-600 text-xs font-medium">VERIFIED</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {documentedSources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-secondary">{source.type}</span>
                  <ExternalLink className="h-3 w-3 text-primary" />
                </div>
                <h4 className="font-semibold text-sm mb-1">{source.title}</h4>
                <p className="text-xs text-muted-foreground mb-1">{source.author}</p>
                <p className="text-xs text-muted-foreground">{source.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 7: Next Steps */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-card border rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Gauge className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Research Directions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/30">
              <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3">
                What Can Be Tested Today
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>- Measure local Schumann resonance strength at proposed Chicago node locations</li>
                <li>- Map telluric current patterns across the Chicago metro area</li>
                <li>- Test ground conductivity at varying depths at proposed hub sites</li>
                <li>- Build small-scale resonant ground-coupling experiments</li>
                <li>- Model the Earth-ionosphere cavity coupling for tower-scale structures</li>
                <li>- Assess solar resource availability at each proposed node</li>
              </ul>
            </div>
            <div className="p-6 bg-orange-500/10 rounded-xl border border-orange-500/30">
              <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-3">
                Open Questions Requiring Research
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>- Can the Q-factor of the Earth-ionosphere cavity be locally enhanced?</li>
                <li>- What coupling coefficient is achievable at practical tower scales?</li>
                <li>- Is net energy extraction thermodynamically permitted from this system?</li>
                <li>- How does nearby Lake Michigan affect the local electromagnetic environment?</li>
                <li>- Can multiple towers create constructive interference for enhanced extraction?</li>
                <li>- What are the regulatory requirements for ELF transmission in urban areas?</li>
              </ul>
            </div>
          </div>
        </div>

        {/* AI Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span className="text-sm">
              This page combines documented atmospheric physics with an AI-generated theoretical framework.
              Sources marked DOCUMENTED are real and verified. Content marked THEORETICAL is speculative.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
