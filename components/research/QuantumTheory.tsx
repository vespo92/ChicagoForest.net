"use client"

import { Atom, Activity, Sparkles, FileText, ExternalLink } from "lucide-react"

export default function QuantumTheory() {
  const keyPapers = [
    {
      title: "Casimir Effect - Original Paper (1948)",
      author: "H.B.G. Casimir",
      url: "https://doi.org/10.1016/S0031-8914(48)80074-7"
    },
    {
      title: "Extracting Energy from the Vacuum (1993)",
      author: "Cole & Puthoff",
      url: "https://doi.org/10.1103/PhysRevA.48.1562"
    },
    {
      title: "Observation of Dynamical Casimir Effect (2011)",
      author: "Wilson et al.",
      url: "https://doi.org/10.1103/PhysRevLett.105.233907"
    }
  ]

  return (
    <section className="py-24 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Atom className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Quantum Vacuum Energy Theory</h2>
              <p className="text-muted-foreground">Zero-Point Field and Energy Extraction Mechanisms</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Zero-Point Energy */}
            <div className="p-6 rounded-lg bg-card border">
              <Sparkles className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-4">Zero-Point Energy Field</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The quantum vacuum is a seething cauldron of virtual particle pairs constantly appearing and annihilating, 
                giving rise to measurable effects.
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="text-sm font-medium mb-1">Energy Density Calculation:</div>
                  <code className="text-xs font-mono">ρ = (ħc/2) ∫ k³ dk / (2π²)</code>
                  <div className="text-xs text-muted-foreground mt-1">
                    Result: ~10¹¹³ J/m³ at Planck scale
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="text-sm font-medium mb-1">Casimir Force:</div>
                  <code className="text-xs font-mono">F = -π²ħc/240d⁴</code>
                  <div className="text-xs text-muted-foreground mt-1">
                    Measurable attractive force between plates
                  </div>
                </div>
              </div>
            </div>

            {/* Extraction Mechanisms */}
            <div className="p-6 rounded-lg bg-card border">
              <Activity className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-4">Energy Extraction Methods</h3>
              <div className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Dynamic Casimir Effect</div>
                  <div className="text-xs text-muted-foreground">
                    Oscillating boundaries create photons from vacuum
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Parametric Amplification</div>
                  <div className="text-xs text-muted-foreground">
                    Time-varying parameters extract vacuum fluctuations
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Coherent Energy States</div>
                  <div className="text-xs text-muted-foreground">
                    Bose-Einstein condensation enables macroscopic quantum effects
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Stochastic Electrodynamics</div>
                  <div className="text-xs text-muted-foreground">
                    Random EM radiation at all frequencies (ħω/2 per mode)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Papers */}
          <div className="p-6 rounded-lg bg-card border mb-8">
            <h3 className="text-xl font-semibold mb-4">Foundational Research Papers</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {keyPapers.map((paper, idx) => (
                <a
                  key={idx}
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>{paper.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {paper.author}
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-primary mt-1" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Resonance & Coupling */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-xl font-semibold mb-4">Schumann Resonances</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Earth-ionosphere cavity resonant frequencies provide a global energy distribution mechanism.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fundamental:</span>
                  <span className="font-medium">7.83 Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">2nd Harmonic:</span>
                  <span className="font-medium">14.3 Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">3rd Harmonic:</span>
                  <span className="font-medium">20.8 Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Power Source:</span>
                  <span className="font-medium">~2000 thunderstorms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Power:</span>
                  <span className="font-medium">~1.5 × 10⁹ watts</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-xl font-semibold mb-4">Quantum Coherence in Nature</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Recent discoveries show quantum effects in biological systems at ambient conditions.
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Photosynthesis</div>
                  <div className="text-xs text-muted-foreground">&gt;95% efficiency via quantum coherence</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Avian Navigation</div>
                  <div className="text-xs text-muted-foreground">Radical pair quantum compass</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Enzyme Catalysis</div>
                  <div className="text-xs text-muted-foreground">Quantum tunneling in reactions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Energy Extraction Conditions */}
          <div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="text-xl font-semibold mb-4">Requirements for Net Energy Extraction</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">1</div>
                <div className="text-sm">System must couple to vacuum modes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">2</div>
                <div className="text-sm">Asymmetry in space, time, or phase required</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">3</div>
                <div className="text-sm">Energy flow must exceed system losses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">4</div>
                <div className="text-sm">Coherence time &gt; decoherence time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}