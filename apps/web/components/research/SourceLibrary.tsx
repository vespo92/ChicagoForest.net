"use client"

import { useState } from "react"
import { BookOpen, FileText, Globe, Building, Users, Search, ExternalLink, Download } from "lucide-react"

export default function SourceLibrary() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { id: "all", label: "All Sources", icon: BookOpen, count: 156 },
    { id: "patents", label: "Patents", icon: FileText, count: 10 },
    { id: "papers", label: "Scientific Papers", icon: FileText, count: 50 },
    { id: "companies", label: "Companies", icon: Building, count: 15 },
    { id: "archives", label: "Online Archives", icon: Globe, count: 12 },
    { id: "organizations", label: "Research Orgs", icon: Users, count: 20 },
  ]

  const sources = {
    patents: [
      { title: "US645576A - Tesla Wireless Power", url: "https://patents.google.com/patent/US645576A" },
      { title: "US787412A - Tesla Energy Transmission", url: "https://patents.google.com/patent/US787412A" },
      { title: "US2460707A - Moray Apparatus", url: "https://patents.google.com/patent/US2460707A" },
      { title: "WO1990013124A1 - Fleischmann-Pons Fusion", url: "https://patents.google.com/patent/WO1990013124A1" },
      { title: "US9115913B2 - Rossi E-Cat", url: "https://patents.google.com/patent/US9115913B2" },
    ],
    papers: [
      { title: "Casimir Effect (1948)", url: "https://www.dwc.knaw.nl/DL/publications/PU00018547.pdf" },
      { title: "Cold Fusion Original (1989)", url: "https://doi.org/10.1016/0022-0728(89)80006-3" },
      { title: "Zero-Point Energy (1993)", url: "https://doi.org/10.1103/PhysRevE.48.1562" },
      { title: "Dynamical Casimir (2011)", url: "https://doi.org/10.1038/nature10561" },
      { title: "LENR Review (2015)", url: "https://www.currentscience.ac.in/Volumes/108/04/0574.pdf" },
    ],
    companies: [
      { title: "Brillouin Energy", url: "https://brillouinenergy.com/" },
      { title: "Leonardo Corp (E-Cat)", url: "https://ecat.com/" },
      { title: "Clean Planet Japan", url: "https://www.cleanplanet.co.jp/en/" },
      { title: "Aureon Energy (SAFIRE)", url: "https://aureon.ca/" },
      { title: "WiTricity", url: "https://witricity.com/" },
    ],
    archives: [
      { title: "LENR-CANR Library (3500+ docs)", url: "https://lenr-canr.org/" },
      { title: "Tesla Universe Archive", url: "https://teslauniverse.com/" },
      { title: "Rex Research", url: "https://www.rexresearch.com/" },
      { title: "Infinite Energy Magazine", url: "https://infinite-energy.com/" },
      { title: "New Energy Times", url: "https://newenergytimes.com/" },
    ],
    organizations: [
      { title: "MIT Energy Initiative", url: "https://energy.mit.edu/" },
      { title: "SRI International", url: "https://www.sri.com/" },
      { title: "NASA Glenn Research", url: "https://www.nasa.gov/glenn" },
      { title: "Japanese NEDO", url: "https://www.nedo.go.jp/english/" },
      { title: "DARPA Energy", url: "https://www.darpa.mil/" },
    ]
  }

  const filteredSources = () => {
    let allSources: Array<{title: string, url: string, category?: string}> = []
    
    if (activeCategory === "all") {
      Object.entries(sources).forEach(([category, items]) => {
        allSources = [...allSources, ...items.map(item => ({ ...item, category }))]
      })
    } else {
      allSources = sources[activeCategory as keyof typeof sources]?.map(item => ({ ...item, category: activeCategory })) || []
    }

    if (searchQuery) {
      return allSources.filter(source => 
        source.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return allSources
  }

  return (
    <section id="sources" className="py-24 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Source Library</h2>
            <p className="text-lg text-muted-foreground">
              156+ verified sources including patents, papers, and active research
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border hover:bg-secondary"
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.label}</span>
                <span className="text-sm opacity-70">({category.count})</span>
              </button>
            ))}
          </div>

          {/* Sources Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {filteredSources().map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-card border hover:shadow-lg transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">{source.title}</div>
                    {source.category && (
                      <div className="text-xs text-muted-foreground capitalize">
                        {source.category}
                      </div>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
              </a>
            ))}
          </div>

          {/* Download Links */}
          <div className="grid md:grid-cols-3 gap-6 p-6 rounded-lg bg-card border">
            <div className="text-center">
              <Download className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Complete Bibliography</h3>
              <p className="text-sm text-muted-foreground mb-3">
                All 156+ sources with descriptions
              </p>
              <a
                href="/research/BIBLIOGRAPHY.md"
                className="text-primary hover:underline text-sm font-medium"
              >
                Download Bibliography →
              </a>
            </div>
            
            <div className="text-center">
              <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Protocol Whitepaper</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Complete ENP protocol specification
              </p>
              <a
                href="/PROTOCOL_WHITEPAPER.md"
                className="text-primary hover:underline text-sm font-medium"
              >
                View Whitepaper →
              </a>
            </div>
            
            <div className="text-center">
              <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">JSON Database</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Machine-readable source database
              </p>
              <a
                href="/research/sources.json"
                className="text-primary hover:underline text-sm font-medium"
              >
                Download JSON →
              </a>
            </div>
          </div>

          {/* Key Archives */}
          <div className="mt-12 p-6 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="text-xl font-semibold mb-4">Essential Online Archives</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <a
                href="https://lenr-canr.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-background hover:bg-secondary transition-colors"
              >
                <div className="font-semibold mb-1">LENR-CANR.org</div>
                <div className="text-sm text-muted-foreground">
                  3500+ documents on cold fusion and LENR research
                </div>
              </a>
              <a
                href="https://teslauniverse.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-background hover:bg-secondary transition-colors"
              >
                <div className="font-semibold mb-1">Tesla Universe</div>
                <div className="text-sm text-muted-foreground">
                  Complete archive of Tesla&apos;s patents, articles, and books
                </div>
              </a>
              <a
                href="https://infinite-energy.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-background hover:bg-secondary transition-colors"
              >
                <div className="font-semibold mb-1">Infinite Energy Magazine</div>
                <div className="text-sm text-muted-foreground">
                  Eugene Mallove&apos;s publication on new energy research
                </div>
              </a>
              <a
                href="https://vault.fbi.gov/nikola-tesla"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-background hover:bg-secondary transition-colors"
              >
                <div className="font-semibold mb-1">FBI Tesla Files</div>
                <div className="text-sm text-muted-foreground">
                  Declassified government documents on Tesla&apos;s work
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}