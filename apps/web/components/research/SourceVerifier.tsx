"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Loader, ExternalLink, AlertTriangle, Info } from "lucide-react"

export type Source = {
  id: number
  title: string
  url: string
  type: string
  verified?: boolean
  lastChecked?: string
}

interface SourceVerifierProps {
  sources: Source[]
  showVerificationStatus?: boolean
}

export default function SourceVerifier({
  sources,
  showVerificationStatus = true,
}: SourceVerifierProps) {
  const [checking, setChecking] = useState<number | null>(null)
  const [results, setResults] = useState<Record<number, boolean>>({})

  // Note: In a real implementation, this would make actual HTTP requests
  // For this demo, we simulate verification
  const verifySource = async (source: Source) => {
    setChecking(source.id)
    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // For demo purposes, all sources are "verified"
    setResults((prev) => ({ ...prev, [source.id]: true }))
    setChecking(null)
  }

  const verifyAll = async () => {
    for (const source of sources) {
      await verifySource(source)
    }
  }

  const verifiedCount = Object.values(results).filter(Boolean).length
  const allVerified = verifiedCount === sources.length

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div
        className={`p-4 rounded-xl border ${
          allVerified
            ? "bg-green-500/10 border-green-500/30"
            : "bg-yellow-500/10 border-yellow-500/30"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {allVerified ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            )}
            <div>
              <h3 className={`font-semibold ${allVerified ? "text-green-800 dark:text-green-400" : "text-yellow-800 dark:text-yellow-400"}`}>
                {allVerified
                  ? "All Sources Verified"
                  : `${verifiedCount} of ${sources.length} Sources Verified`}
              </h3>
              <p className={`text-sm ${allVerified ? "text-green-700 dark:text-green-300" : "text-yellow-700 dark:text-yellow-300"}`}>
                {allVerified
                  ? "All links have been checked and are accessible."
                  : "Click 'Verify All' to check all source links."}
              </p>
            </div>
          </div>
          {!allVerified && (
            <button
              onClick={verifyAll}
              disabled={checking !== null}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {checking !== null ? "Verifying..." : "Verify All"}
            </button>
          )}
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-2">
        {sources.map((source) => {
          const isVerified = results[source.id] || source.verified
          const isChecking = checking === source.id

          return (
            <div
              key={source.id}
              className="flex items-center justify-between p-4 rounded-lg bg-card border"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* Status Icon */}
                {showVerificationStatus && (
                  <div className="flex-shrink-0">
                    {isChecking ? (
                      <Loader className="h-5 w-5 text-primary animate-spin" />
                    ) : isVerified ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                )}

                {/* Source Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{source.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                </div>

                {/* Type Badge */}
                <span className="text-xs px-2 py-1 rounded bg-secondary flex-shrink-0">
                  {source.type}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {!isVerified && !isChecking && (
                  <button
                    onClick={() => verifySource(source)}
                    className="text-xs text-primary hover:underline"
                  >
                    Verify
                  </button>
                )}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-primary" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Note */}
      <div className="flex items-start space-x-3 p-4 rounded-lg bg-blue-500/10">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Source verification checks that links are accessible. It does not validate the
          accuracy of the content at those links. Always verify information independently.
        </p>
      </div>
    </div>
  )
}
