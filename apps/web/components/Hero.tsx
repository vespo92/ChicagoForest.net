"use client"

import { Zap, Network, Trees, Radio } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-b from-background to-secondary/20">
      {/* Animated background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/30 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          {/* Logo/Icon */}
          <div className="flex items-center justify-center space-x-3">
            <Trees className="h-12 w-12 text-primary animate-pulse" />
            <Zap className="h-16 w-16 text-primary" />
            <Network className="h-12 w-12 text-primary animate-pulse delay-500" />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Chicago <span className="text-primary">Plasma Forest</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Community-owned wireless energy and communications infrastructure connecting Illinois &mdash; from Chicago to the Quad Cities, Rockford to Peoria, with Mendota at the center.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
            <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-card/50 backdrop-blur border">
              <Zap className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">Wireless Power</h3>
              <p className="text-sm text-muted-foreground text-center">
                Tesla-inspired wireless energy transmission using resonant frequencies
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-card/50 backdrop-blur border">
              <Radio className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">Statewide Backbone</h3>
              <p className="text-sm text-muted-foreground text-center">
                Point-to-point radio links connecting 5 metro areas across northern Illinois via tower network
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-card/50 backdrop-blur border">
              <Trees className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">Community Owned</h3>
              <p className="text-sm text-muted-foreground text-center">
                Decentralized infrastructure owned and operated by Illinois communities
              </p>
            </div>
          </div>

          {/* Illinois Network Overview */}
          <div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/20 max-w-4xl">
            <h3 className="text-xl font-bold mb-4">The Illinois Network</h3>
            <p className="text-muted-foreground mb-4 text-center">
              A solar-powered tower network connecting northern Illinois metro areas through high-powered point-to-point radio links, starting with the Mendota Solar Tower as the central junction hub.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded bg-card/50 border text-center">
                <div className="text-sm font-semibold">Chicago / Naperville</div>
                <div className="text-xs text-muted-foreground">113 km East</div>
              </div>
              <div className="p-3 rounded bg-card/50 border text-center">
                <div className="text-sm font-semibold">Quad Cities</div>
                <div className="text-xs text-muted-foreground">110 km West</div>
              </div>
              <div className="p-3 rounded bg-card/50 border text-center">
                <div className="text-sm font-semibold">Rockford</div>
                <div className="text-xs text-muted-foreground">80 km North</div>
              </div>
              <div className="p-3 rounded bg-card/50 border text-center">
                <div className="text-sm font-semibold">Peoria</div>
                <div className="text-xs text-muted-foreground">100 km Southwest</div>
              </div>
              <div className="p-3 rounded bg-card/50 border text-center">
                <div className="text-sm font-semibold">Bloomington</div>
                <div className="text-xs text-muted-foreground">118 km Southeast</div>
              </div>
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-center">
                <div className="text-sm font-semibold text-amber-400">Mendota Hub</div>
                <div className="text-xs text-muted-foreground">Central Junction</div>
              </div>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="/solar-tower"
                className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors inline-flex items-center gap-2"
              >
                <span>Mendota Solar Tower</span>
                <span>&rarr;</span>
              </a>
              <a
                href="/mesh"
                className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors inline-flex items-center gap-2"
              >
                <span>Mesh Network Guide</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a
              href="/solar-tower"
              className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-center"
            >
              Explore the Network
            </a>
            <a
              href="/free-energy"
              className="px-8 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors text-center"
            >
              View Research Archive
            </a>
          </div>

          {/* Network Stats */}
          <div className="mt-12 p-6 rounded-lg bg-card/30 backdrop-blur border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">Metro Areas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">~120 km</div>
                <div className="text-sm text-muted-foreground">Network Radius</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.5M</div>
                <div className="text-sm text-muted-foreground">Population Reach</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10+</div>
                <div className="text-sm text-muted-foreground">Tower Sites</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  )
}
