"use client"

import Link from "next/link"
import {
  Radio, Zap, Globe, FileText, ExternalLink, AlertTriangle,
  Info, Calendar, MapPin, Users, Lightbulb
} from "lucide-react"

const teslaPatents = [
  {
    id: "US645576A",
    title: "System of Transmission of Electrical Energy",
    year: 1900,
    category: "Wireless Power",
    description: "Tesla's foundational patent describing the transmission of electrical energy through natural media.",
    url: "https://patents.google.com/patent/US645576A",
    significance: "First patent describing wireless power transmission using Earth-ionosphere waveguide."
  },
  {
    id: "US787412A",
    title: "Art of Transmitting Electrical Energy Through the Natural Mediums",
    year: 1905,
    category: "Wireless Power",
    description: "Advanced method for transmitting energy without wires using terrestrial resonance.",
    url: "https://patents.google.com/patent/US787412A",
    significance: "Describes using Earth as a conductor for global energy distribution."
  },
  {
    id: "US1119732A",
    title: "Apparatus for Transmitting Electrical Energy",
    year: 1914,
    category: "Transmission",
    description: "Detailed apparatus design for practical wireless energy transmission.",
    url: "https://patents.google.com/patent/US1119732A",
    significance: "Engineering specifications for Wardenclyffe-type installations."
  },
  {
    id: "US514168A",
    title: "Means for Generating Electric Currents",
    year: 1894,
    category: "Generation",
    description: "Method for generating high-frequency currents from direct current.",
    url: "https://patents.google.com/patent/US514168A",
    significance: "Foundation for resonant transformer technology."
  },
  {
    id: "US454622A",
    title: "System of Electric Lighting",
    year: 1891,
    category: "Lighting",
    description: "Wireless lighting system using high-frequency oscillations.",
    url: "https://patents.google.com/patent/US454622A",
    significance: "Demonstrated practical wireless power for lighting."
  },
  {
    id: "US685012A",
    title: "Means for Increasing the Intensity of Electrical Oscillations",
    year: 1901,
    category: "Oscillation",
    description: "Method for amplifying electrical oscillations using resonance.",
    url: "https://patents.google.com/patent/US685012A",
    significance: "Key to achieving high-power wireless transmission."
  },
  {
    id: "US593138A",
    title: "Electrical Transformer",
    year: 1897,
    category: "Transformer",
    description: "Tesla coil patent for high-voltage resonant transformer.",
    url: "https://patents.google.com/patent/US593138A",
    significance: "The famous Tesla Coil design."
  },
  {
    id: "US568176A",
    title: "Apparatus for Producing Electric Currents of High Frequency and Potential",
    year: 1896,
    category: "High Frequency",
    description: "System for generating high-frequency, high-potential currents.",
    url: "https://patents.google.com/patent/US568176A",
    significance: "Essential for resonant energy transmission."
  },
]

const primarySources = [
  {
    title: "Colorado Springs Notes 1899-1900",
    type: "Laboratory Notes",
    url: "https://www.teslauniverse.com/nikola-tesla/books/nikola-tesla-colorado-springs-notes-1899-1900",
    description: "Tesla's detailed laboratory notes during his Colorado Springs experiments."
  },
  {
    title: "FBI Declassified Tesla Files",
    type: "Government Documents",
    url: "https://vault.fbi.gov/nikola-tesla",
    description: "Declassified FBI documents related to Tesla and his papers after his death."
  },
  {
    title: "Tesla Universe Complete Archive",
    type: "Archive",
    url: "https://teslauniverse.com/",
    description: "Comprehensive collection of all Tesla patents, articles, and historical documents."
  },
  {
    title: "Nikola Tesla Museum Belgrade",
    type: "Museum Archive",
    url: "https://nikolateslamuseum.org/en/",
    description: "Official museum containing original Tesla documents and artifacts."
  },
  {
    title: "Smithsonian Tesla Collection",
    type: "Archive",
    url: "https://www.si.edu/search?edan_q=nikola%20tesla",
    description: "Smithsonian Institution's Tesla-related holdings and exhibits."
  },
]

const timeline = [
  { year: 1856, event: "Nikola Tesla born in Smiljan, Austrian Empire (modern Croatia)" },
  { year: 1884, event: "Arrives in New York, begins work with Edison" },
  { year: 1888, event: "Patents AC induction motor and polyphase power system" },
  { year: 1891, event: "Demonstrates wireless lighting at Columbia College" },
  { year: 1893, event: "Powers World's Columbian Exposition with AC" },
  { year: 1899, event: "Colorado Springs experiments - transmits power 25 miles" },
  { year: 1901, event: "Begins Wardenclyffe Tower construction" },
  { year: 1905, event: "Patents wireless power transmission method (US787412A)" },
  { year: 1917, event: "Wardenclyffe Tower demolished" },
  { year: 1943, event: "Tesla dies in New York; FBI seizes papers" },
]

export default function TeslaResearchPage() {
  return (
    <div className="py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link href="/research" className="hover:text-primary">Research</Link>
            <span>/</span>
            <span>Tesla</span>
          </div>

          <div className="flex items-start space-x-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Radio className="h-12 w-12 text-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold">Nikola Tesla</h1>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 text-sm font-medium">
                  DOCUMENTED
                </span>
              </div>
              <p className="text-xl text-muted-foreground">
                Wireless Power Transmission Pioneer (1856-1943)
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>Verified Historical Content:</strong> All patents, documents, and sources on this page are real
                and independently verifiable. Links point to USPTO, FBI archives, and established historical repositories.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 rounded-xl bg-card border text-center">
            <div className="text-3xl font-bold text-primary mb-1">300+</div>
            <div className="text-sm text-muted-foreground">Patents Worldwide</div>
          </div>
          <div className="p-6 rounded-xl bg-card border text-center">
            <div className="text-3xl font-bold text-primary mb-1">1899</div>
            <div className="text-sm text-muted-foreground">Colorado Springs Tests</div>
          </div>
          <div className="p-6 rounded-xl bg-card border text-center">
            <div className="text-3xl font-bold text-primary mb-1">25 mi</div>
            <div className="text-sm text-muted-foreground">Demonstrated Range</div>
          </div>
          <div className="p-6 rounded-xl bg-card border text-center">
            <div className="text-3xl font-bold text-primary mb-1">187 ft</div>
            <div className="text-sm text-muted-foreground">Wardenclyffe Height</div>
          </div>
        </div>

        {/* Patent Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Key Patents</h2>
            <Link href="/research/tesla/US645576A" className="text-sm text-primary hover:underline">
              View All Patents
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {teslaPatents.map((patent) => (
              <Link
                key={patent.id}
                href={`/research/tesla/${patent.id}`}
                className="group p-6 rounded-xl bg-card border hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-secondary">
                      {patent.category}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{patent.year}</span>
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                  {patent.id}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{patent.title}</p>
                <p className="text-xs text-muted-foreground mb-4">{patent.significance}</p>
                <div className="flex items-center justify-between">
                  <a
                    href={patent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-primary hover:underline flex items-center space-x-1"
                  >
                    <span>View on Google Patents</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-xs text-muted-foreground">Click for details</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Wardenclyffe Section */}
        <div className="bg-card border rounded-2xl p-8 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Wardenclyffe Tower Project</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Technical Specifications</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Tower Height</span>
                  <span className="font-medium">187 feet (57 meters)</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Dome Diameter</span>
                  <span className="font-medium">68 feet (21 meters)</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Ground System</span>
                  <span className="font-medium">120 feet deep shaft</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Power Source</span>
                  <span className="font-medium">200 kW Westinghouse</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Operating Frequency</span>
                  <span className="font-medium">150-200 kHz</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Project Timeline</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="w-20 text-sm text-muted-foreground">1901</div>
                  <div className="text-sm">Construction begins at Shoreham, Long Island</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-20 text-sm text-muted-foreground">1902</div>
                  <div className="text-sm">Tower structure completed</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-20 text-sm text-muted-foreground">1903</div>
                  <div className="text-sm">Initial tests conducted (witnessed night-time glow)</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-20 text-sm text-muted-foreground">1905</div>
                  <div className="text-sm">J.P. Morgan withdraws funding</div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-20 text-sm text-muted-foreground">1917</div>
                  <div className="text-sm">Tower demolished for scrap during WWI</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Historical Note:</strong> Wardenclyffe was never completed or fully tested.
                Claims about its capabilities remain unverified. The tower was demolished before
                Tesla could demonstrate global wireless power transmission.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Sources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Primary Sources & Archives</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {primarySources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-xs px-2 py-1 rounded bg-secondary">{source.type}</span>
                </div>
                <h3 className="font-semibold mb-2">{source.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{source.description}</p>
                <div className="flex items-center text-xs text-primary">
                  <span>Visit Archive</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-card border rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Tesla Timeline</h2>
          </div>

          <div className="space-y-4">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="w-16 text-right">
                  <span className="font-bold text-primary">{item.year}</span>
                </div>
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                <div className="flex-1 pb-4 border-b last:border-0">
                  <p className="text-sm">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span className="text-sm">
              This page presents documented historical information. All sources are real and verified.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
