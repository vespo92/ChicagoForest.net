"use client"

import Link from "next/link"
import {
  Zap, FileText, ExternalLink, Calendar, Users,
  Info, AlertTriangle, Eye, Radio
} from "lucide-react"

const morayTimeline = [
  { year: 1909, event: "T. Henry Moray born in Salt Lake City, Utah" },
  { year: 1925, event: "First successful demonstration of radiant energy device" },
  { year: 1926, event: "Multiple witnessed demonstrations producing 50kW" },
  { year: 1928, event: "Swedish scientist Dr. Gustav Stromberg witnesses device" },
  { year: 1929, event: "Attempted theft and sabotage of equipment" },
  { year: 1931, event: "Demonstration for Bell Labs representatives" },
  { year: 1939, event: "Multiple patents filed for 'Electrotherapeutic Apparatus'" },
  { year: 1943, event: "Continued private demonstrations" },
  { year: 1974, event: "T. Henry Moray passes away" },
]

const patents = [
  {
    id: "US2460707A",
    title: "Electrotherapeutic Apparatus",
    year: 1949,
    url: "https://patents.google.com/patent/US2460707A",
    description: "Device for producing electrical impulses for therapeutic purposes",
  },
  {
    id: "US3185847A",
    title: "Methods and Apparatus for Producing Neutrons",
    year: 1965,
    url: "https://patents.google.com/patent/US3185847A",
    description: "Related technology for nuclear applications",
  },
]

const witnesses = [
  {
    name: "Dr. Gustav Stromberg",
    affiliation: "Swedish Scientist, Mt. Wilson Observatory",
    year: 1928,
    testimony: "Witnessed device operating and producing substantial power without visible power source.",
  },
  {
    name: "Dr. Harvey Fletcher",
    affiliation: "Bell Telephone Labs",
    year: 1931,
    testimony: "Observed demonstration and examined equipment without detecting conventional power source.",
  },
  {
    name: "Multiple Engineers",
    affiliation: "Various companies",
    year: "1926-1943",
    testimony: "Over 100 private demonstrations documented with engineers and scientists.",
  },
]

const deviceSpecs = [
  { label: "Claimed Output", value: "50 kW" },
  { label: "Input Power", value: "None visible" },
  { label: "Operating Frequency", value: "Unknown (kept secret)" },
  { label: "Key Component", value: "Swedish Stone / Moray Valve" },
  { label: "Demonstrations", value: "100+ documented" },
  { label: "Witnesses", value: "200+ individuals" },
]

const sources = [
  {
    title: "The Sea of Energy in Which the Earth Floats",
    author: "T. Henry Moray",
    type: "Book",
    url: "https://www.rexresearch.com/moray/moray.htm",
    description: "Moray's own account of his research and device development.",
  },
  {
    title: "Rex Research - Moray Archive",
    author: "Various",
    type: "Archive",
    url: "https://www.rexresearch.com/moray/moray.htm",
    description: "Collection of Moray documents, patents, and historical records.",
  },
  {
    title: "Moray King's Zero-Point Energy Research",
    author: "Moray King",
    type: "Research",
    url: "https://www.amazon.com/Quest-Zero-Point-Energy-Moray/dp/0932813941",
    description: "Modern analysis of Moray's work and zero-point energy concepts.",
  },
]

export default function MorayResearchPage() {
  return (
    <div className="py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link href="/research" className="hover:text-primary">Research</Link>
            <span>/</span>
            <span>Moray</span>
          </div>

          <div className="flex items-start space-x-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Zap className="h-12 w-12 text-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold">T. Henry Moray</h1>
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-600 text-sm font-medium">
                  HISTORICAL
                </span>
              </div>
              <p className="text-xl text-muted-foreground">
                Radiant Energy Device Inventor (1892-1974)
              </p>
            </div>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-6 mb-12">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-yellow-900 dark:text-yellow-400 mb-3">
                Historical Documentation - Unverified Claims
              </h3>
              <p className="text-yellow-800 dark:text-yellow-300 mb-3">
                T. Henry Moray claimed to have built a device that extracted energy from an unknown source,
                reportedly producing up to 50kW of power. While there are numerous documented demonstrations
                and witnesses, <strong>no working device exists today</strong>, the technology was never
                independently replicated, and the scientific basis remains unexplained.
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                This page documents the historical record of Moray's claims and demonstrations.
                We present this information for historical interest, not as proof of working technology.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {deviceSpecs.map((spec, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-card border text-center">
              <div className="text-lg font-bold text-primary mb-1">{spec.value}</div>
              <div className="text-xs text-muted-foreground">{spec.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Overview */}
          <div className="lg:col-span-2 space-y-8">
            {/* The Device */}
            <div className="bg-card border rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Radio className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">The Moray Device</h2>
              </div>

              <div className="space-y-4">
                <p>
                  T. Henry Moray claimed to have developed a device capable of extracting "radiant energy"
                  from the surrounding environment. He called this the "Moray Valve" or "Swedish Stone"
                  device, named after a key component he reportedly acquired.
                </p>
                <p>
                  According to Moray's accounts and witness testimonies, the device was demonstrated
                  over 100 times between 1925 and the early 1940s, producing electrical power sufficient
                  to light banks of light bulbs and power electrical equipment.
                </p>

                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Key Claims:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>- No visible power input (batteries, wires, or connections)</li>
                    <li>- Output reportedly up to 50,000 watts</li>
                    <li>- Could be taken miles from any power source and still operate</li>
                    <li>- Used a special "detector" tube of unknown composition</li>
                    <li>- Required precise tuning to operate</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Witnesses */}
            <div className="bg-card border rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Eye className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Documented Witnesses</h2>
              </div>

              <div className="space-y-4">
                {witnesses.map((witness, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{witness.name}</h4>
                        <p className="text-sm text-muted-foreground">{witness.affiliation}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-background">{witness.year}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{witness.testimony}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Note:</strong> While witnesses were documented, independent scientific
                  verification was never completed. The device's inner workings were kept secret,
                  preventing replication.
                </p>
              </div>
            </div>

            {/* Patents */}
            <div className="bg-card border rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Related Patents</h2>
              </div>

              <div className="space-y-4">
                {patents.map((patent) => (
                  <a
                    key={patent.id}
                    href={patent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{patent.id}</h4>
                        <p className="text-sm">{patent.title}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">{patent.year}</span>
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{patent.description}</p>
                  </a>
                ))}
              </div>

              <div className="mt-4 p-4 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> These patents do not describe the actual radiant energy device.
                  Moray never patented the core technology, fearing it would be suppressed or stolen.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Timeline & Sources */}
          <div className="space-y-8">
            {/* Timeline */}
            <div className="bg-card border rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">Timeline</h2>
              </div>

              <div className="space-y-4">
                {morayTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-12 text-right">
                      <span className="text-sm font-bold text-primary">{item.year}</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="bg-card border rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">Sources</h2>
              </div>

              <div className="space-y-4">
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold text-sm">{source.title}</span>
                      <ExternalLink className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{source.author} - {source.type}</p>
                    <p className="text-xs text-muted-foreground">{source.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modern Relevance */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">Modern Relevance</h2>
          <p className="text-muted-foreground mb-4">
            While Moray's device was never replicated or scientifically validated, his work has influenced
            modern research into zero-point energy and vacuum fluctuations. Researchers like Moray King
            have attempted to connect Moray's observations to contemporary physics concepts.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card">
              <h4 className="font-semibold mb-2">Zero-Point Energy</h4>
              <p className="text-sm text-muted-foreground">
                Modern physics acknowledges vacuum energy, though extracting usable power remains theoretical.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card">
              <h4 className="font-semibold mb-2">Casimir Effect</h4>
              <p className="text-sm text-muted-foreground">
                Demonstrated vacuum fluctuation forces, validating some concepts Moray may have observed.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card">
              <h4 className="font-semibold mb-2">Research Continues</h4>
              <p className="text-sm text-muted-foreground">
                Some researchers continue attempting to understand and replicate Moray-type phenomena.
              </p>
            </div>
          </div>
        </div>

        {/* AI Notice */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span className="text-sm">
              This page documents historical claims. No verification of working technology is implied.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
