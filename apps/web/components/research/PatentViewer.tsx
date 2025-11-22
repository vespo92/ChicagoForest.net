"use client"

import { FileText, ExternalLink, Calendar, User, Globe, Zap } from "lucide-react"

export type Patent = {
  id: string
  title: string
  year: number
  dateIssued?: string
  inventor: string
  category: string
  description: string
  url: string
  significance?: string
  keyFeatures?: string[]
}

interface PatentViewerProps {
  patent: Patent
  compact?: boolean
}

export default function PatentViewer({ patent, compact = false }: PatentViewerProps) {
  if (compact) {
    return (
      <a
        href={patent.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 rounded-lg bg-card border hover:shadow-lg transition-all"
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-medium px-2 py-1 rounded bg-secondary">
            {patent.category}
          </span>
          <span className="text-sm text-muted-foreground">{patent.year}</span>
        </div>
        <h3 className="font-bold mb-1">{patent.id}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{patent.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{patent.inventor}</span>
          <ExternalLink className="h-3 w-3 text-primary" />
        </div>
      </a>
    )
  }

  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/20 text-green-600">
                VERIFIED USPTO PATENT
              </span>
            </div>
          </div>
          <a
            href={patent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <span>View on Google Patents</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <h1 className="text-3xl font-bold mb-2">{patent.id}</h1>
        <p className="text-xl text-muted-foreground mb-6">{patent.title}</p>

        {/* Meta Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {patent.dateIssued && (
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Date Issued</span>
              </div>
              <span className="font-medium">{patent.dateIssued}</span>
            </div>
          )}
          <div className="p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center space-x-2 mb-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Inventor</span>
            </div>
            <span className="font-medium">{patent.inventor}</span>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center space-x-2 mb-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Category</span>
            </div>
            <span className="font-medium">{patent.category}</span>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center space-x-2 mb-1">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Jurisdiction</span>
            </div>
            <span className="font-medium">United States</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-6">
        {/* Description */}
        <div>
          <h3 className="font-semibold mb-3">Description</h3>
          <p className="text-muted-foreground">{patent.description}</p>
        </div>

        {/* Significance */}
        {patent.significance && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Historical Significance</h3>
            </div>
            <p className="text-muted-foreground">{patent.significance}</p>
          </div>
        )}

        {/* Key Features */}
        {patent.keyFeatures && patent.keyFeatures.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2">
              {patent.keyFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-primary">{idx + 1}</span>
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
