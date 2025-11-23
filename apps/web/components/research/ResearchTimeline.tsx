"use client"

import { useState } from "react"
import { ExternalLink, Filter } from "lucide-react"

export type TimelineEvent = {
  year: number
  month?: string
  title: string
  description: string
  category: string
  significance: "major" | "minor"
  source?: string
  sourceUrl?: string
}

export type CategoryConfig = {
  label: string
  color: string
}

interface ResearchTimelineProps {
  events: TimelineEvent[]
  categories: Record<string, CategoryConfig>
  showFilters?: boolean
  defaultMajorOnly?: boolean
}

export default function ResearchTimeline({
  events,
  categories,
  showFilters = true,
  defaultMajorOnly = false,
}: ResearchTimelineProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    Object.keys(categories)
  )
  const [showMajorOnly, setShowMajorOnly] = useState(defaultMajorOnly)

  const filteredEvents = events
    .filter((event) => selectedCategories.includes(event.category))
    .filter((event) => !showMajorOnly || event.significance === "major")
    .sort((a, b) => a.year - b.year)

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Filter Timeline</h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(categories).map(([key, config]) => (
              <button
                key={key}
                onClick={() => toggleCategory(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategories.includes(key)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                <span>{config.label}</span>
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
      )}

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredEvents.length} of {events.length} events
      </p>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

        {/* Events */}
        <div className="space-y-6">
          {filteredEvents.map((event, idx) => {
            const catConfig = categories[event.category]
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
                <div
                  className={`w-4 h-4 rounded-full ${catConfig.color} border-4 border-background z-10 flex-shrink-0`}
                ></div>

                {/* Content */}
                <div
                  className={`flex-1 p-4 rounded-xl bg-card border ${
                    event.significance === "major" ? "border-primary/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${catConfig.color}`}></div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-secondary">
                        {catConfig.label}
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

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No events found matching your criteria.
        </div>
      )}

      {/* Legend */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Legend</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(categories).map(([key, config]) => (
            <div key={key} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
              <span className="text-sm">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
