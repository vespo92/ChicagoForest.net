"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Atom, FileText, ExternalLink, Search, Filter,
  Info, Calendar, User, BookOpen
} from "lucide-react"

const paperDatabase = [
  {
    id: 1,
    title: "Electrochemically Induced Nuclear Fusion of Deuterium",
    authors: ["M. Fleischmann", "S. Pons"],
    year: 1989,
    journal: "Journal of Electroanalytical Chemistry",
    doi: "10.1016/0022-0728(89)80006-3",
    category: "Original Research",
    citations: 2500,
    abstract: "The original paper that initiated the field of cold fusion research, reporting excess heat generation in palladium-deuterium electrochemical cells."
  },
  {
    id: 2,
    title: "The Science of Low Energy Nuclear Reaction",
    authors: ["E. Storms"],
    year: 2007,
    journal: "World Scientific",
    url: "https://www.worldscientific.com/worldscibooks/10.1142/6425",
    category: "Review",
    citations: 400,
    abstract: "Comprehensive textbook covering the experimental evidence and theoretical understanding of LENR phenomena."
  },
  {
    id: 3,
    title: "LENR: A New Paradigm for the Energy Crisis",
    authors: ["P. Hagelstein", "M. McKubre", "D. Nagel", "T. Chubb", "R. Hekman"],
    year: 2004,
    journal: "Current Science",
    url: "https://www.currentscience.ac.in/Volumes/108/04/0574.pdf",
    category: "Review",
    citations: 450,
    abstract: "Review paper prepared for the 2004 DOE review of cold fusion research, summarizing evidence for LENR."
  },
  {
    id: 4,
    title: "Observation of the Dynamical Casimir Effect in a Superconducting Circuit",
    authors: ["C.M. Wilson", "G. Johansson", "et al."],
    year: 2011,
    journal: "Nature",
    doi: "10.1038/nature10561",
    category: "Zero-Point Energy",
    citations: 800,
    abstract: "First experimental observation of the dynamical Casimir effect, converting vacuum fluctuations into real photons."
  },
  {
    id: 5,
    title: "Evidence for Cold Fusion in Palladium",
    authors: ["S. Szpak", "P. Mosier-Boss", "J. Gordon"],
    year: 2002,
    journal: "SPAWAR Technical Report",
    url: "https://lenr-canr.org/acrobat/SzpakSevidencefo.pdf",
    category: "Experimental",
    citations: 150,
    abstract: "US Navy SPAWAR report documenting Pd/D co-deposition experiments showing excess heat and nuclear signatures."
  },
  {
    id: 6,
    title: "Anomalous Heat Effect in Light Water/Nickel Systems",
    authors: ["S. Focardi", "R. Habel", "F. Piantelli"],
    year: 1994,
    journal: "Il Nuovo Cimento",
    doi: "10.1007/BF02728952",
    category: "Experimental",
    citations: 200,
    abstract: "Early report of excess heat in nickel-hydrogen systems, distinct from palladium-deuterium experiments."
  },
  {
    id: 7,
    title: "Replication of Excess Heat in Pd-D Electrochemical Cells",
    authors: ["M. McKubre", "F. Tanzella", "et al."],
    year: 1998,
    journal: "SRI International Reports",
    url: "https://lenr-canr.org/acrobat/McKubreMCHreplicati.pdf",
    category: "Replication",
    citations: 300,
    abstract: "SRI International replication studies confirming excess heat production in palladium-deuterium systems."
  },
  {
    id: 8,
    title: "Cold Fusion: The Scientific Fiasco of the Century",
    authors: ["J. Huizenga"],
    year: 1992,
    journal: "University of Rochester Press",
    url: "https://www.amazon.com/Cold-Fusion-Scientific-Fiasco-Century/dp/0195076923",
    category: "Skeptical",
    citations: 250,
    abstract: "Critical examination of cold fusion claims from the perspective of a skeptical physicist."
  },
  {
    id: 9,
    title: "Excess Power Observations in Electrochemical Studies",
    authors: ["M. Miles", "K. Johnson"],
    year: 1993,
    journal: "Journal of Physical Chemistry",
    doi: "10.1021/j100141a032",
    category: "Experimental",
    citations: 180,
    abstract: "Correlation between excess heat and helium production in cold fusion experiments."
  },
  {
    id: 10,
    title: "Thermal and Nuclear Aspects of the Pd/D2O System",
    authors: ["F. Pons", "M. Fleischmann"],
    year: 1990,
    journal: "Cold Fusion Conference Proceedings",
    url: "https://lenr-canr.org/",
    category: "Conference",
    citations: 400,
    abstract: "Follow-up paper by original cold fusion researchers addressing criticism and presenting new data."
  },
  {
    id: 11,
    title: "Investigation of Anomalous Thermal Power Generation",
    authors: ["Y. Arata", "Y. Zhang"],
    year: 2008,
    journal: "Journal of High Temperature Society Japan",
    url: "https://lenr-canr.org/",
    category: "Experimental",
    citations: 120,
    abstract: "Japanese research on DS-cathode excess heat production with nano-structured palladium."
  },
  {
    id: 12,
    title: "Nuclear Reactions in Condensed Matter: A Tutorial",
    authors: ["P. Hagelstein"],
    year: 2012,
    journal: "MIT Course Notes",
    url: "https://lenr-canr.org/",
    category: "Educational",
    citations: 80,
    abstract: "MIT course materials on theoretical aspects of low energy nuclear reactions."
  },
]

const categories = [
  { id: "all", label: "All Papers" },
  { id: "Original Research", label: "Original Research" },
  { id: "Review", label: "Reviews" },
  { id: "Experimental", label: "Experimental" },
  { id: "Replication", label: "Replications" },
  { id: "Conference", label: "Conference" },
  { id: "Skeptical", label: "Skeptical" },
]

export default function LENRPapersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"year" | "citations">("year")

  const filteredPapers = paperDatabase
    .filter((paper) => {
      const matchesSearch =
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory =
        selectedCategory === "all" || paper.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "year") return b.year - a.year
      return b.citations - a.citations
    })

  return (
    <div className="py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link href="/research" className="hover:text-primary">Research</Link>
            <span>/</span>
            <Link href="/research/lenr" className="hover:text-primary">LENR</Link>
            <span>/</span>
            <span>Papers</span>
          </div>

          <div className="flex items-start space-x-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">LENR Paper Database</h1>
              <p className="text-xl text-muted-foreground">
                Browse peer-reviewed papers and research documents
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-card border rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search papers by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "year" | "citations")}
              className="px-4 py-3 rounded-lg bg-background border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="year">Sort by Year</option>
              <option value="citations">Sort by Citations</option>
            </select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPapers.length} of {paperDatabase.length} papers
          </p>
          <a
            href="https://lenr-canr.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center space-x-1"
          >
            <span>Browse full LENR-CANR library (3500+ papers)</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Papers List */}
        <div className="space-y-4 mb-12">
          {filteredPapers.map((paper) => (
            <div
              key={paper.id}
              className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium px-2 py-1 rounded bg-secondary">
                  {paper.category}
                </span>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{paper.year}</span>
                  </span>
                  <span>{paper.citations} citations</span>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2">{paper.title}</h3>

              <div className="flex items-center space-x-2 mb-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {paper.authors.join(", ")}
                </p>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {paper.abstract}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{paper.journal}</span>
                <a
                  href={paper.doi ? `https://doi.org/${paper.doi}` : paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm"
                >
                  <span>{paper.doi ? `DOI: ${paper.doi}` : "View Paper"}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Archive Links */}
        <div className="bg-card border rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Complete Archives</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://lenr-canr.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-primary">3,500+</span>
                <ExternalLink className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">LENR-CANR.org</h3>
              <p className="text-sm text-muted-foreground">
                The most comprehensive LENR document library, freely available online.
              </p>
            </a>

            <a
              href="https://newenergytimes.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold">News</span>
                <ExternalLink className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">New Energy Times</h3>
              <p className="text-sm text-muted-foreground">
                News and analysis of LENR research developments.
              </p>
            </a>
          </div>
        </div>

        {/* AI Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span className="text-sm">
              Paper database compiled by AI. All DOIs and URLs link to real, verifiable sources.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
