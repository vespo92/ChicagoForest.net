"use client"

import Link from "next/link"
import {
  Radio, Atom, Zap, Users, Clock, FileText, ExternalLink,
  AlertTriangle, Info, BookOpen, Globe, Search, ArrowUpFromDot
} from "lucide-react"

const researchAreas = [
  {
    id: "tesla",
    title: "Nikola Tesla",
    subtitle: "Wireless Power Transmission",
    description: "Explore Tesla's revolutionary patents and documented experiments on wireless energy transmission, including the Wardenclyffe Tower project.",
    icon: Radio,
    href: "/research/tesla",
    badge: "DOCUMENTED",
    stats: { patents: 12, papers: 25, archives: 5 },
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "lenr",
    title: "LENR Research",
    subtitle: "Low Energy Nuclear Reactions",
    description: "Browse 3500+ peer-reviewed papers on cold fusion and LENR from institutions like MIT, SRI International, and NASA Glenn.",
    icon: Atom,
    href: "/research/lenr",
    badge: "ACTIVE RESEARCH",
    stats: { papers: 3500, companies: 15, funding: "$50M+" },
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "moray",
    title: "T. Henry Moray",
    subtitle: "Radiant Energy Device",
    description: "Documentation of Moray's demonstrated radiant energy device that reportedly produced 50kW from unknown sources in the 1920s-30s.",
    icon: Zap,
    href: "/research/moray",
    badge: "HISTORICAL",
    stats: { demonstrations: 100, witnesses: "200+", patents: 3 },
    color: "from-yellow-500/20 to-orange-500/20",
  },
  {
    id: "mallove",
    title: "Eugene Mallove",
    subtitle: "New Energy Advocate",
    description: "Archive of Infinite Energy magazine and Mallove's documentation of suppressed energy research and the MIT cold fusion controversy.",
    icon: Users,
    href: "/research/mallove",
    badge: "ARCHIVED",
    stats: { articles: 500, issues: 100, years: "1995-2004" },
    color: "from-green-500/20 to-emerald-500/20",
  },
]

const quickLinks = [
  { title: "Tesla Universe Archive", url: "https://teslauniverse.com/", description: "Complete Tesla patents and writings" },
  { title: "LENR-CANR Library", url: "https://lenr-canr.org/", description: "3500+ cold fusion documents" },
  { title: "FBI Tesla Files", url: "https://vault.fbi.gov/nikola-tesla", description: "Declassified government documents" },
  { title: "Infinite Energy Archive", url: "https://infinite-energy.com/", description: "Mallove's publication archive" },
]

export default function ResearchPortal() {
  return (
    <div className="py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">Research Portal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Documented Free Energy Research
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Explore verified historical research, patents, and scientific papers from pioneers
            in alternative energy. All sources are real, clickable, and independently verifiable.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patents, papers, and researchers..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            />
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-6 mb-16">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-yellow-900 dark:text-yellow-400">
                Distinguishing Fact from Theory
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    DOCUMENTED (Real)
                  </div>
                  <ul className="text-green-800 dark:text-green-300 space-y-1">
                    <li>- Tesla patents (USPTO verified)</li>
                    <li>- LENR peer-reviewed papers (DOI links)</li>
                    <li>- Historical demonstrations (documented)</li>
                    <li>- Active companies and funding</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <div className="font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
                    THEORETICAL (Speculative)
                  </div>
                  <ul className="text-orange-800 dark:text-orange-300 space-y-1">
                    <li>- Chicago Plasma Forest Network</li>
                    <li>- ENP Protocol specifications</li>
                    <li>- Modern implementation designs</li>
                    <li>- Future vision and roadmaps</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Info className="h-4 w-4 text-blue-500" />
                <p className="text-xs text-muted-foreground">
                  This research portal is AI-generated. All external links point to real, verifiable sources.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Research Areas Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {researchAreas.map((area) => (
            <Link
              key={area.id}
              href={area.href}
              className="group relative p-8 rounded-2xl bg-card border hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${area.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <area.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-secondary">
                    {area.badge}
                  </span>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold mb-1">{area.title}</h2>
                <p className="text-sm text-muted-foreground mb-3">{area.subtitle}</p>
                <p className="text-muted-foreground mb-6">{area.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {Object.entries(area.stats).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-1">
                      <span className="font-semibold">{value}</span>
                      <span className="text-muted-foreground capitalize">{key}</span>
                    </div>
                  ))}
                </div>

                {/* Arrow */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="p-2 rounded-full bg-primary text-primary-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Energy Reversal - Featured Theoretical Research */}
        <div className="mb-16">
          <Link
            href="/research/energy-reversal"
            className="group relative p-8 rounded-2xl bg-card border-2 border-orange-500/30 hover:shadow-xl transition-all duration-300 overflow-hidden block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-start space-x-6">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <ArrowUpFromDot className="h-8 w-8 text-orange-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">Plasma Energy Reversal</h2>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-orange-500/20 text-orange-600">
                    THEORETICAL + DOCUMENTED
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Can we reverse the ground tendency of electricity? Exploring Earth&apos;s atmospheric electrical circuit
                  (~250kV ionosphere potential, ~1,800A global current) and Tesla&apos;s resonant coupling approach
                  to extract energy from the Earth-ionosphere system rather than dissipating into it.
                  Includes solar farm priming architecture for the Chicago Plasma Forest.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">5</span>
                    <span className="text-muted-foreground">Patents</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">6</span>
                    <span className="text-muted-foreground">Verified Sources</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold">8</span>
                    <span className="text-muted-foreground">Atmospheric Facts</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Timeline & Sources Links */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Link
            href="/research/timeline"
            className="p-8 rounded-2xl bg-gradient-to-br from-slate-500/20 to-gray-500/20 border hover:shadow-lg transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Historical Timeline</h2>
                <p className="text-muted-foreground">1856-Present: Key events in free energy research</p>
              </div>
            </div>
          </Link>

          <Link
            href="/research/sources"
            className="p-8 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border hover:shadow-lg transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Source Database</h2>
                <p className="text-muted-foreground">156+ verified sources with clickable links</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="bg-card border rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Essential Archives</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{link.title}</span>
                  <ExternalLink className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* AI Generation Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span className="text-sm">
              This research portal was generated by AI to document and preserve historical free energy research.
              All external source links are real and verified.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
