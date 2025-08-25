"use client"

import { Building2, TrendingUp, AlertCircle, ExternalLink } from "lucide-react"

export default function ModernImplementations() {
  const activeProjects = [
    {
      name: "Brillouin Energy",
      technology: "Controlled Electron Capture Reaction",
      status: "Commercial pilot",
      cop: "4.0",
      url: "https://brillouinenergy.com/"
    },
    {
      name: "SAFIRE Project",
      technology: "Plasma-based transmutation",
      status: "R&D phase",
      cop: "Not disclosed",
      url: "https://aureon.ca/"
    },
    {
      name: "E-Cat SKLed",
      technology: "Direct electricity from LENR",
      status: "Pre-commercial",
      cop: "10+",
      url: "https://ecat.com/"
    },
    {
      name: "Clean Planet",
      technology: "Quantum Hydrogen Energy",
      status: "Commercial development",
      cop: "2-3",
      url: "https://www.cleanplanet.co.jp/en/"
    }
  ]

  const governmentPrograms = [
    { org: "NASA Glenn", focus: "LENR for space applications", budget: "$5M/year" },
    { org: "US Navy SPAWAR", focus: "LENR verification", budget: "Classified" },
    { org: "DARPA", focus: "Low-energy nuclear reactions", budget: "$10M (2021)" },
    { org: "Japanese NEDO", focus: "Clean energy tech", budget: "$100M total" },
  ]

  return (
    <section className="py-24 px-4 md:px-6 bg-secondary/5">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Contemporary Implementations</h2>
              <p className="text-muted-foreground">Current Commercial and Research Projects</p>
            </div>
          </div>

          {/* Active Projects */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">Active Commercial Projects</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {activeProjects.map((project, idx) => (
                <a
                  key={idx}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-6 rounded-lg bg-card border hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold">{project.name}</h4>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Technology:</span>
                      <span className="font-medium">{project.technology}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{project.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">COP:</span>
                      <span className="font-medium text-primary">{project.cop}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Government Programs */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6">Government Research Programs</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {governmentPrograms.map((program, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-card border">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{program.org}</div>
                      <div className="text-sm text-muted-foreground mt-1">{program.focus}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-primary">{program.budget}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment & Validation */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-lg bg-card border">
              <TrendingUp className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-4">Investment Landscape</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Investment (2000-2024):</span>
                  <span className="font-medium">$2+ Billion</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Investment Firms:</span>
                  <span className="font-medium">50+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Government Funding:</span>
                  <span className="font-medium">$500M+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-medium">&lt;1% (so far)</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-secondary/50 rounded">
                <div className="text-xs text-muted-foreground">
                  Major investors include Industrial Heat, Woodford Investment, Cherokee Investment Partners
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <AlertCircle className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-4">Validation Challenges</h3>
              <div className="space-y-3">
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Reproducibility</div>
                  <div className="text-xs text-muted-foreground">
                    Material properties and preparation critical
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Measurement Accuracy</div>
                  <div className="text-xs text-muted-foreground">
                    Calorimetry errors can mask or fake results
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Theory Gap</div>
                  <div className="text-xs text-muted-foreground">
                    No unified theory explains all observations
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 rounded">
                  <div className="font-medium text-sm">Patent Issues</div>
                  <div className="text-xs text-muted-foreground">
                    &quot;Perpetual motion&quot; rejection challenges
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Promising Technologies */}
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="text-xl font-semibold mb-4">Most Promising Near-Term Technologies</h3>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">1</div>
                <div className="text-sm font-medium">LENR/Cold Fusion</div>
                <div className="text-xs text-muted-foreground mt-1">70% reproducible</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">2</div>
                <div className="text-sm font-medium">Atmospheric Harvesting</div>
                <div className="text-xs text-muted-foreground mt-1">Proven concept</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">3</div>
                <div className="text-sm font-medium">RF Energy Collection</div>
                <div className="text-xs text-muted-foreground mt-1">Commercial products</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">4</div>
                <div className="text-sm font-medium">Thermal Gradients</div>
                <div className="text-xs text-muted-foreground mt-1">OTEC operational</div>
              </div>
              <div className="text-center p-4 bg-secondary/50 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">5</div>
                <div className="text-sm font-medium">Piezoelectric</div>
                <div className="text-xs text-muted-foreground mt-1">Micro-scale ready</div>
              </div>
            </div>
          </div>

          {/* Future Timeline */}
          <div className="mt-12 p-6 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="text-xl font-semibold mb-6">Development Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 text-right text-sm font-medium">2026</div>
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div className="flex-1 text-sm">First commercial LENR products hit market</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-20 text-right text-sm font-medium">2027</div>
                <div className="w-3 h-3 rounded-full bg-primary/70" />
                <div className="flex-1 text-sm">Wireless power transmission pilots in cities</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-20 text-right text-sm font-medium">2030</div>
                <div className="w-3 h-3 rounded-full bg-primary/50" />
                <div className="flex-1 text-sm">Quantum energy harvesting demonstrated</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-20 text-right text-sm font-medium">2035</div>
                <div className="w-3 h-3 rounded-full bg-primary/30" />
                <div className="flex-1 text-sm">Grid-scale free energy deployment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}