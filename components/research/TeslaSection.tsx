"use client"

import { Zap, Radio, Globe, FileText, ExternalLink } from "lucide-react"

export default function TeslaSection() {
  const patents = [
    { id: "US645576A", title: "System of Transmission of Electrical Energy", year: 1900, url: "https://patents.google.com/patent/US645576A" },
    { id: "US787412A", title: "Art of Transmitting Electrical Energy", year: 1905, url: "https://patents.google.com/patent/US787412A" },
    { id: "US1119732A", title: "Apparatus for Transmitting Electrical Energy", year: 1914, url: "https://patents.google.com/patent/US1119732A" },
  ]

  const keyDocuments = [
    { title: "Colorado Springs Notes 1899-1900", url: "https://www.teslauniverse.com/nikola-tesla/books/nikola-tesla-colorado-springs-notes-1899-1900" },
    { title: "FBI Declassified Tesla Files", url: "https://vault.fbi.gov/nikola-tesla" },
    { title: "Tesla Universe Archive", url: "https://teslauniverse.com/" },
  ]

  return (
    <section className="py-24 px-4 md:px-6 bg-secondary/5">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Radio className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Nikola Tesla's Wardenclyffe Tower</h2>
              <p className="text-muted-foreground">Wireless Power Transmission System (1901-1917)</p>
            </div>
          </div>

          {/* Overview */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-card border">
                <h3 className="text-xl font-semibold mb-4">Revolutionary Concepts</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Earth-Ionosphere Waveguide</div>
                      <div className="text-sm text-muted-foreground">Using Earth as a conductor for global energy transmission</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Globe className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Schumann Resonance Coupling</div>
                      <div className="text-sm text-muted-foreground">7.83 Hz fundamental frequency matching Earth's natural resonance</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Radio className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Standing Wave Formation</div>
                      <div className="text-sm text-muted-foreground">Creating energy nodes and antinodes globally</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-lg bg-card border">
                <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tower Height:</span>
                    <span className="font-medium">187 feet (57 meters)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Power Capacity:</span>
                    <span className="font-medium">200 kW Westinghouse alternator</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operating Frequency:</span>
                    <span className="font-medium">150-200 kHz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transmission Range:</span>
                    <span className="font-medium">Global (theoretical)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Efficiency:</span>
                    <span className="font-medium">80% (calculated)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-card border">
                <h3 className="text-xl font-semibold mb-4">Key Patents</h3>
                <div className="space-y-3">
                  {patents.map((patent) => (
                    <a
                      key={patent.id}
                      href={patent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div>
                        <div className="font-medium">{patent.id}</div>
                        <div className="text-sm text-muted-foreground">{patent.title}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{patent.year}</span>
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-lg bg-card border">
                <h3 className="text-xl font-semibold mb-4">Primary Sources</h3>
                <div className="space-y-3">
                  {keyDocuments.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{doc.title}</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Key Equations */}
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="text-xl font-semibold mb-4">Fundamental Equations</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Resonant Frequency</div>
                <code className="text-sm font-mono">f = c/(2πR)</code>
                <div className="text-xs text-muted-foreground mt-1">R = Earth radius ≈ 6,371 km</div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Power Transmission</div>
                <code className="text-sm font-mono">η = Q₁Q₂k²/(1 + Q₁Q₂k²)</code>
                <div className="text-xs text-muted-foreground mt-1">Q = Quality factor, k = coupling</div>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Voltage Multiplication</div>
                <code className="text-sm font-mono">V_out = V_in × √(L₂/L₁)</code>
                <div className="text-xs text-muted-foreground mt-1">100:1 ratio achieved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}