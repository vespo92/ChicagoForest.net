"use client"

import { Radio, Cpu, Zap, FileText, ExternalLink, Eye } from "lucide-react"

export default function MoraySection() {
  const keyDocuments = [
    {
      title: "The Sea of Energy (1960)",
      description: "Moray&apos;s original manuscript",
      url: "https://www.rexresearch.com/moray2/morayrer.htm"
    },
    {
      title: "US Patent 2,460,707",
      description: "Electrotherapeutic Apparatus",
      url: "https://patents.google.com/patent/US2460707A"
    },
    {
      title: "Witness Affidavits (1930s)",
      description: "Sworn testimonies of device demonstrations",
      url: "https://www.nuenergy.org/moray-radiant-energy/"
    }
  ]

  const demonstrations = [
    { date: "1925", witnesses: "Scientists", power: "50-60 watts", duration: "Continuous" },
    { date: "1928", witnesses: "Congressmen", power: "3.5 kW", duration: "Several hours" },
    { date: "1930", witnesses: "Engineers", power: "50 kW", duration: "Weeks" },
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
              <h2 className="text-3xl md:text-4xl font-bold">T. Henry Moray&apos;s Radiant Energy Device</h2>
              <p className="text-muted-foreground">Cosmic Ray Energy Harvesting (1920s-1940s)</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Device Specifications */}
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-card border">
                <h3 className="text-xl font-semibold mb-4">Device Specifications</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Cpu className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">Physical Dimensions</div>
                      <div className="text-sm text-muted-foreground">
                        2&apos; × 1.5&apos; × 1&apos; wooden box, ~60 pounds
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Zap className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">Power Output</div>
                      <div className="text-sm text-muted-foreground">
                        50 watts to 50 kilowatts demonstrated
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Radio className="h-5 w-5 text-primary mt-0.5 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">No External Power</div>
                      <div className="text-sm text-muted-foreground">
                        No connection to grid or batteries required
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-card border">
                <h3 className="text-xl font-semibold mb-4">The Swedish Stone</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Material:</span>
                    <div className="font-medium">Germanium-silver compound (natural semiconductor)</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Properties:</span>
                    <div className="font-medium">Natural radioactive doping, crystalline structure</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Function:</span>
                    <div className="font-medium">Detector/rectifier for cosmic ray energy</div>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded mt-3">
                    <div className="font-medium mb-1">Synthetic Recipe (Partial):</div>
                    <code className="text-xs">
                      Base: Germanium oxide<br/>
                      Dopants: Silver, iron, bismuth traces<br/>
                      Process: Zone refining at 900-1000°C
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Demonstrations & Evidence */}
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-card border">
                <h3 className="text-xl font-semibold mb-4">Witnessed Demonstrations</h3>
                <div className="space-y-3">
                  {demonstrations.map((demo, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{demo.date}</div>
                          <div className="text-sm text-muted-foreground">
                            Witnesses: {demo.witnesses}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-primary">{demo.power}</div>
                          <div className="text-sm text-muted-foreground">{demo.duration}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Eye className="h-4 w-4 text-primary mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium">Notable Witnesses:</div>
                      <div className="text-muted-foreground">
                        Dr. Harvey Fletcher (Bell Labs), Multiple university professors, Government officials
                      </div>
                    </div>
                  </div>
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
                      className="block p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span>{doc.title}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {doc.description}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-primary mt-1" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Circuit Diagram */}
          <div className="p-6 rounded-lg bg-card border">
            <h3 className="text-xl font-semibold mb-4">Circuit Architecture</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium mb-2">Stage 1: Detection</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Antenna coupling</li>
                  <li>• Swedish Stone detector</li>
                  <li>• High-Q resonant circuit</li>
                  <li>• Impedance: &gt;10 MΩ</li>
                </ul>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium mb-2">Stage 2: Amplification</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Cold cathode tubes (6-12)</li>
                  <li>• Capacitive coupling</li>
                  <li>• Regenerative feedback</li>
                  <li>• Gain: &gt;10⁶ estimated</li>
                </ul>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium mb-2">Stage 3: Output</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Resonant transformer</li>
                  <li>• Impedance matching</li>
                  <li>• Frequency: ~500 kHz</li>
                  <li>• Output: AC/DC convertible</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/20">
            <blockquote className="text-lg italic">
              &quot;The detector is the heart of the machine. Without it, nothing would be possible.&quot;
            </blockquote>
            <cite className="block mt-2 text-sm text-muted-foreground">— T. Henry Moray</cite>
          </div>
        </div>
      </div>
    </section>
  )
}