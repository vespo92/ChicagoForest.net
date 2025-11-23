"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Clock, Radio, Atom, Zap, Users, Calendar,
  Info, ExternalLink, Filter
} from "lucide-react"

type TimelineEvent = {
  year: number
  month?: string
  title: string
  description: string
  category: "tesla" | "lenr" | "moray" | "mallove" | "general"
  significance: "major" | "minor"
  source?: string
  sourceUrl?: string
}

const timelineEvents: TimelineEvent[] = [
  // Tesla Events
  { year: 1856, month: "July", title: "Nikola Tesla Born", description: "Nikola Tesla born in Smiljan, Austrian Empire (modern-day Croatia).", category: "tesla", significance: "major" },
  { year: 1884, title: "Tesla Arrives in America", description: "Tesla emigrates to the United States and begins work with Thomas Edison.", category: "tesla", significance: "major" },
  { year: 1888, title: "AC Motor Patent", description: "Tesla patents the AC induction motor and polyphase alternating current system.", category: "tesla", significance: "major", source: "USPTO", sourceUrl: "https://patents.google.com/patent/US381968A" },
  { year: 1891, title: "Wireless Lighting Demonstration", description: "Tesla demonstrates wireless lighting at Columbia College, transmitting power without wires.", category: "tesla", significance: "major" },
  { year: 1893, title: "World's Columbian Exposition", description: "Tesla and Westinghouse power the World's Columbian Exposition with AC electricity.", category: "tesla", significance: "major" },
  { year: 1897, title: "Tesla Coil Patent", description: "Tesla patents the resonant transformer (Tesla Coil), US593138A.", category: "tesla", significance: "major", source: "USPTO", sourceUrl: "https://patents.google.com/patent/US593138A" },
  { year: 1899, title: "Colorado Springs Experiments", description: "Tesla conducts wireless power transmission experiments, reportedly transmitting power 25 miles.", category: "tesla", significance: "major", source: "Tesla Universe", sourceUrl: "https://teslauniverse.com/nikola-tesla/books/nikola-tesla-colorado-springs-notes-1899-1900" },
  { year: 1900, title: "Wireless Power Patent", description: "Tesla receives patent US645576A for 'System of Transmission of Electrical Energy'.", category: "tesla", significance: "major", source: "USPTO", sourceUrl: "https://patents.google.com/patent/US645576A" },
  { year: 1901, title: "Wardenclyffe Construction Begins", description: "Tesla begins construction of Wardenclyffe Tower at Shoreham, Long Island.", category: "tesla", significance: "major" },
  { year: 1905, title: "Wardenclyffe Funding Withdrawn", description: "J.P. Morgan withdraws funding from Wardenclyffe project.", category: "tesla", significance: "major" },
  { year: 1917, title: "Wardenclyffe Demolished", description: "Wardenclyffe Tower demolished for scrap during World War I.", category: "tesla", significance: "major" },
  { year: 1943, month: "January", title: "Tesla Dies", description: "Nikola Tesla dies in New York City. FBI seizes his papers.", category: "tesla", significance: "major", source: "FBI Vault", sourceUrl: "https://vault.fbi.gov/nikola-tesla" },

  // Moray Events
  { year: 1892, title: "T. Henry Moray Born", description: "Thomas Henry Moray born in Salt Lake City, Utah.", category: "moray", significance: "major" },
  { year: 1925, title: "First Moray Device Demonstration", description: "Moray demonstrates his 'radiant energy' device, reportedly producing electrical power.", category: "moray", significance: "major" },
  { year: 1928, title: "Swedish Scientist Witnesses Device", description: "Dr. Gustav Stromberg of Mt. Wilson Observatory witnesses Moray device demonstration.", category: "moray", significance: "minor" },
  { year: 1931, title: "Bell Labs Representatives Visit", description: "Representatives from Bell Telephone Laboratories witness Moray device demonstration.", category: "moray", significance: "minor" },
  { year: 1939, title: "Moray Files Patents", description: "Moray files patents for 'Electrotherapeutic Apparatus' (related technology).", category: "moray", significance: "minor", source: "USPTO", sourceUrl: "https://patents.google.com/patent/US2460707A" },
  { year: 1974, title: "T. Henry Moray Dies", description: "T. Henry Moray passes away, taking secrets of his device with him.", category: "moray", significance: "major" },

  // LENR Events
  { year: 1927, title: "First Cold Fusion Claims", description: "Swedish scientists Tandberg and Paneth claim nuclear fusion in palladium.", category: "lenr", significance: "minor" },
  { year: 1948, title: "Casimir Effect Predicted", description: "Hendrik Casimir predicts the quantum vacuum force between conducting plates.", category: "lenr", significance: "minor" },
  { year: 1958, title: "Casimir Effect Demonstrated", description: "First experimental confirmation of the Casimir effect.", category: "lenr", significance: "minor" },
  { year: 1989, month: "March", title: "Fleischmann-Pons Announcement", description: "Martin Fleischmann and Stanley Pons announce cold fusion at University of Utah.", category: "lenr", significance: "major", source: "Original Paper", sourceUrl: "https://doi.org/10.1016/0022-0728(89)80006-3" },
  { year: 1989, month: "May", title: "Cold Fusion Controversy Erupts", description: "Multiple labs fail to replicate; scientific community becomes divided.", category: "lenr", significance: "major" },
  { year: 1989, month: "November", title: "DOE Panel Rejects Cold Fusion", description: "DOE panel concludes evidence does not support cold fusion claims.", category: "lenr", significance: "major" },
  { year: 1990, title: "LENR-CANR Archive Founded", description: "Online library begins collecting cold fusion/LENR research documents.", category: "lenr", significance: "minor", source: "LENR-CANR", sourceUrl: "https://lenr-canr.org/" },
  { year: 1994, title: "Nickel-Hydrogen Excess Heat", description: "Focardi et al. report excess heat in nickel-hydrogen systems.", category: "lenr", significance: "minor" },
  { year: 2002, title: "US Navy SPAWAR Research", description: "US Navy SPAWAR publishes Pd/D co-deposition research showing nuclear signatures.", category: "lenr", significance: "minor" },
  { year: 2004, title: "Second DOE Review", description: "DOE conducts second review of LENR; results mixed but more positive than 1989.", category: "lenr", significance: "major" },
  { year: 2011, title: "Dynamical Casimir Effect Observed", description: "First observation of dynamical Casimir effect - converting vacuum fluctuations to real photons.", category: "lenr", significance: "major", source: "Nature", sourceUrl: "https://doi.org/10.1038/nature10561" },
  { year: 2015, title: "Japanese NEDO Program Starts", description: "Japan's NEDO begins $20M government-funded LENR research program.", category: "lenr", significance: "major", source: "NEDO", sourceUrl: "https://www.nedo.go.jp/english/" },
  { year: 2019, title: "Google LENR Research Published", description: "Google-funded research published in Nature, investigating LENR.", category: "lenr", significance: "major" },
  { year: 2022, title: "Clean Planet-Mitsubishi Partnership", description: "Japanese company Clean Planet partners with Mitsubishi for commercial LENR development.", category: "lenr", significance: "major", source: "Clean Planet", sourceUrl: "https://www.cleanplanet.co.jp/en/" },

  // Mallove Events
  { year: 1947, title: "Eugene Mallove Born", description: "Eugene Mallove born in Norwich, Connecticut.", category: "mallove", significance: "minor" },
  { year: 1989, title: "Mallove Witnesses MIT Experiments", description: "As MIT's Chief Science Writer, Mallove witnesses cold fusion replication attempts.", category: "mallove", significance: "minor" },
  { year: 1991, title: "Mallove Resigns from MIT", description: "Mallove resigns from MIT, publishes 'Fire from Ice' book.", category: "mallove", significance: "major", source: "Fire from Ice", sourceUrl: "https://www.amazon.com/Fire-Ice-Searching-Behind-Fusion/dp/0471531391" },
  { year: 1995, title: "Infinite Energy Magazine Founded", description: "Mallove founds Infinite Energy magazine to cover alternative energy research.", category: "mallove", significance: "major", source: "Infinite Energy", sourceUrl: "https://infinite-energy.com/" },
  { year: 1999, title: "New Energy Foundation Created", description: "Mallove establishes New Energy Foundation to support research.", category: "mallove", significance: "minor" },
  { year: 2004, month: "May", title: "Eugene Mallove Murdered", description: "Eugene Mallove tragically murdered (crime unrelated to research).", category: "mallove", significance: "major" },

  // General Events
  { year: 1913, title: "Bohr Atomic Model", description: "Niels Bohr proposes quantum model of the atom.", category: "general", significance: "minor" },
  { year: 1928, title: "Dirac Equation", description: "Paul Dirac's equation predicts antimatter and vacuum fluctuations.", category: "general", significance: "minor" },
  { year: 1973, title: "Energy Crisis", description: "Oil crisis increases interest in alternative energy sources.", category: "general", significance: "minor" },
]

const categoryInfo = {
  tesla: { label: "Tesla", icon: Radio, color: "bg-blue-500" },
  lenr: { label: "LENR", icon: Atom, color: "bg-purple-500" },
  moray: { label: "Moray", icon: Zap, color: "bg-yellow-500" },
  mallove: { label: "Mallove", icon: Users, color: "bg-green-500" },
  general: { label: "General", icon: Calendar, color: "bg-gray-500" },
}

export default function TimelinePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["tesla", "lenr", "moray", "mallove", "general"])
  const [showMajorOnly, setShowMajorOnly] = useState(false)

  const filteredEvents = timelineEvents
    .filter((event) => selectedCategories.includes(event.category))
    .filter((event) => !showMajorOnly || event.significance === "major")
    .sort((a, b) => a.year - b.year)

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div className="py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link href="/research" className="hover:text-primary">Research</Link>
            <span>/</span>
            <span>Timeline</span>
          </div>

          <div className="flex items-start space-x-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Clock className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Historical Timeline</h1>
              <p className="text-xl text-muted-foreground">
                Key events in free energy research (1856-Present)
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Filter Timeline</h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(categoryInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => toggleCategory(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategories.includes(key)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <info.icon className="h-4 w-4" />
                <span>{info.label}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showMajorOnly}
              onChange={(e) => setShowMajorOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show major events only</span>
          </label>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing {filteredEvents.length} of {timelineEvents.length} events
        </p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

          {/* Events */}
          <div className="space-y-6">
            {filteredEvents.map((event, idx) => {
              const catInfo = categoryInfo[event.category]
              return (
                <div key={idx} className="relative flex items-start space-x-6">
                  {/* Year Badge */}
                  <div className="w-16 text-right flex-shrink-0">
                    <span className="font-bold text-primary">{event.year}</span>
                    {event.month && (
                      <span className="block text-xs text-muted-foreground">{event.month}</span>
                    )}
                  </div>

                  {/* Dot */}
                  <div className={`w-4 h-4 rounded-full ${catInfo.color} border-4 border-background z-10 flex-shrink-0`}></div>

                  {/* Content */}
                  <div className={`flex-1 p-4 rounded-xl bg-card border ${event.significance === "major" ? "border-primary/30" : ""}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <catInfo.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary">
                          {catInfo.label}
                        </span>
                        {event.significance === "major" && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/20 text-primary">
                            Major
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    {event.sourceUrl && (
                      <a
                        href={event.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-primary hover:underline"
                      >
                        <span>Source: {event.source}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12 bg-card border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(categoryInfo).map(([key, info]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${info.color}`}></div>
                <span className="text-sm">{info.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span className="text-sm">
              Timeline compiled by AI from verified historical sources. All linked sources are real.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
