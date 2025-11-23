"use client"

import { FileText, ExternalLink, Copy, Check } from "lucide-react"
import { useState } from "react"

export type Citation = {
  title: string
  authors?: string[]
  year: number
  source: string
  url: string
  type: "patent" | "paper" | "book" | "archive" | "website"
  doi?: string
  patentNumber?: string
  publisher?: string
}

interface CitationCardProps {
  citation: Citation
  showCopyButton?: boolean
  compact?: boolean
}

export default function CitationCard({
  citation,
  showCopyButton = true,
  compact = false,
}: CitationCardProps) {
  const [copied, setCopied] = useState(false)

  const formatCitation = (): string => {
    const authors = citation.authors?.join(", ") || "Unknown"
    const year = citation.year
    const title = citation.title
    const source = citation.source

    switch (citation.type) {
      case "patent":
        return `${citation.patentNumber || title}. ${authors} (${year}). ${source}. ${citation.url}`
      case "paper":
        return `${authors} (${year}). ${title}. ${source}. ${citation.doi ? `https://doi.org/${citation.doi}` : citation.url}`
      case "book":
        return `${authors} (${year}). ${title}. ${citation.publisher || source}.`
      default:
        return `${title}. (${year}). Retrieved from ${citation.url}`
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(formatCitation())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const typeColors = {
    patent: "bg-blue-500/20 text-blue-600",
    paper: "bg-purple-500/20 text-purple-600",
    book: "bg-green-500/20 text-green-600",
    archive: "bg-yellow-500/20 text-yellow-600",
    website: "bg-gray-500/20 text-gray-600",
  }

  if (compact) {
    return (
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-3 p-3 rounded-lg bg-card border hover:shadow-md transition-all"
      >
        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{citation.title}</p>
          <p className="text-xs text-muted-foreground">
            {citation.authors?.[0] || citation.source} ({citation.year})
          </p>
        </div>
        <ExternalLink className="h-3 w-3 text-primary flex-shrink-0" />
      </a>
    )
  }

  return (
    <div className="p-6 rounded-xl bg-card border">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded ${typeColors[citation.type]}`}>
            {citation.type.toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">{citation.year}</span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg mb-2">{citation.title}</h3>

      {/* Authors */}
      {citation.authors && citation.authors.length > 0 && (
        <p className="text-sm text-muted-foreground mb-2">
          {citation.authors.join(", ")}
        </p>
      )}

      {/* Source */}
      <p className="text-sm text-muted-foreground mb-4">{citation.source}</p>

      {/* DOI/Patent Number */}
      {citation.doi && (
        <p className="text-xs text-muted-foreground mb-2">
          DOI: <span className="font-mono">{citation.doi}</span>
        </p>
      )}
      {citation.patentNumber && (
        <p className="text-xs text-muted-foreground mb-2">
          Patent: <span className="font-mono">{citation.patentNumber}</span>
        </p>
      )}

      {/* Citation Text */}
      <div className="p-3 rounded-lg bg-secondary/50 mb-4">
        <p className="text-xs font-mono text-muted-foreground break-all">
          {formatCitation()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {showCopyButton && (
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Citation</span>
              </>
            )}
          </button>
        )}
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm"
        >
          <span>View Source</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
