"use client"

import { useState } from "react"
import { FileText, ExternalLink, Calendar, User, Search, Filter } from "lucide-react"

export type Paper = {
  id: number
  title: string
  authors: string[]
  year: number
  journal: string
  doi?: string
  url?: string
  category: string
  citations?: number
  abstract?: string
}

interface PaperDatabaseProps {
  papers: Paper[]
  categories?: string[]
  showSearch?: boolean
  showFilters?: boolean
}

export default function PaperDatabase({
  papers,
  categories = [],
  showSearch = true,
  showFilters = true,
}: PaperDatabaseProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<"year" | "citations">("year")

  const filteredPapers = papers
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
      return (b.citations || 0) - (a.citations || 0)
    })

  const allCategories = categories.length > 0
    ? categories
    : [...new Set(papers.map((p) => p.category))]

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="bg-card border rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {showSearch && (
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
            )}

            {showFilters && (
              <>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-background border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "year" | "citations")}
                  className="px-4 py-3 rounded-lg bg-background border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="year">Sort by Year</option>
                  <option value="citations">Sort by Citations</option>
                </select>
              </>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredPapers.length} of {papers.length} papers
      </p>

      {/* Papers List */}
      <div className="space-y-4">
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
                {paper.citations && (
                  <span>{paper.citations} citations</span>
                )}
              </div>
            </div>

            <h3 className="font-bold text-lg mb-2">{paper.title}</h3>

            <div className="flex items-center space-x-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {paper.authors.join(", ")}
              </p>
            </div>

            {paper.abstract && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {paper.abstract}
              </p>
            )}

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

      {filteredPapers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No papers found matching your criteria.
        </div>
      )}
    </div>
  )
}
