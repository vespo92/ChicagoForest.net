"use client"

import { Atom, FlaskConical, Flame, FileText, ExternalLink, TrendingUp } from "lucide-react"

export default function MalloveSection() {
  const keyPapers = [
    { 
      title: "Fire from Ice (1991)", 
      description: "Comprehensive overview of cold fusion",
      url: "https://infinite-energy.com/images/pdfs/FireFromIceUpdate.pdf"
    },
    {
      title: "Fleischmann-Pons Original Paper",
      description: "Electrochemically induced nuclear fusion (1989)",
      url: "https://doi.org/10.1016/0022-0728(89)80006-3"
    },
    {
      title: "Defense Intelligence Agency Report",
      description: "Worldwide Research on LENR (2009)",
      url: "https://www.dtic.mil/sti/pdfs/ADA509926.pdf"
    }
  ]

  const activeCompanies = [
    { name: "Brillouin Energy", tech: "Q-Pulse LENR", url: "https://brillouinenergy.com/" },
    { name: "Leonardo Corp (E-Cat)", tech: "Ni-H Reactor", url: "https://ecat.com/" },
    { name: "Clean Planet (Japan)", tech: "Quantum Hydrogen", url: "https://www.cleanplanet.co.jp/en/" },
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
              <h2 className="text-3xl md:text-4xl font-bold">Eugene Mallove&apos;s Cold Fusion / LENR</h2>
              <p className="text-muted-foreground">Low Energy Nuclear Reactions Research (1989-Present)</p>
            </div>
          </div>

          {/* Overview Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Fleischmann-Pons Experiment */}
            <div className="p-6 rounded-lg bg-card border">
              <FlaskConical className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Original Experiment</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Setup:</span>
                  <div className="font-medium">Heavy water (D₂O) electrolysis</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Cathode:</span>
                  <div className="font-medium">Palladium rod (D/Pd &gt; 0.85)</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Result:</span>
                  <div className="font-medium">10-50% excess heat observed</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Products:</span>
                  <div className="font-medium">Helium-4, Tritium detected</div>
                </div>
              </div>
            </div>

            {/* Energy Yields */}
            <div className="p-6 rounded-lg bg-card border">
              <Flame className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Energy Production</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Power Density:</span>
                  <div className="font-medium">1-100 W/cm³ of Pd</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Energy:</span>
                  <div className="font-medium">100-4000 MJ/mol Pd</div>
                </div>
                <div>
                  <span className="text-muted-foreground">COP Range:</span>
                  <div className="font-medium">1.1 to 30 (claimed)</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <div className="font-medium">Hours to months continuous</div>
                </div>
              </div>
            </div>

            {/* Validation Status */}
            <div className="p-6 rounded-lg bg-card border">
              <TrendingUp className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">Validation Progress</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Replications:</span>
                  <div className="font-medium">200+ laboratories worldwide</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Success Rate:</span>
                  <div className="font-medium">~70% with proper protocol</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Gov Programs:</span>
                  <div className="font-medium">NASA, Navy, DARPA active</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Investment:</span>
                  <div className="font-medium">$100M+ venture funding</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Documents and Companies */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Key Documents */}
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-xl font-semibold mb-4">Essential Documents</h3>
              <div className="space-y-3">
                {keyPapers.map((paper, idx) => (
                  <a
                    key={idx}
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span>{paper.title}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {paper.description}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-primary mt-1" />
                    </div>
                  </a>
                ))}
              </div>
              <div className="mt-4 text-center">
                <a
                  href="https://lenr-canr.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  View Complete LENR Library (3500+ documents) →
                </a>
              </div>
            </div>

            {/* Active Companies */}
            <div className="p-6 rounded-lg bg-card border">
              <h3 className="text-xl font-semibold mb-4">Commercial Development</h3>
              <div className="space-y-3">
                {activeCompanies.map((company, idx) => (
                  <a
                    key={idx}
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">{company.tech}</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </div>
                  </a>
                ))}
              </div>
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <div className="text-sm">
                  <div className="font-medium mb-1">Investment Status:</div>
                  <div className="text-muted-foreground">
                    Over $2 billion invested in LENR research since 2000
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theory Section */}
          <div className="mt-8 p-6 rounded-lg bg-card border">
            <h3 className="text-xl font-semibold mb-4">Theoretical Models</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Lattice-Assisted Nuclear Reactions</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Peter Hagelstein&apos;s coherent energy transfer model explains how phonon coupling in metal lattices 
                  can overcome Coulomb barriers, enabling fusion at low temperatures.
                </p>
                <div className="p-3 bg-secondary/50 rounded">
                  <code className="text-xs font-mono">
                    D + D → ⁴He + 23.8 MeV (lattice)
                  </code>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Electron Screening Effect</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  In condensed matter, electron clouds reduce the effective Coulomb barrier by up to 300 eV, 
                  increasing tunneling probability by factor of 10⁴⁰.
                </p>
                <div className="p-3 bg-secondary/50 rounded">
                  <code className="text-xs font-mono">
                    V_screened = V_Coulomb × exp(-r/λ_TF)
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}