"use client"

import { Zap, Network, Trees } from "lucide-react"

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
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">
              AI-Generated Theoretical Framework for Net-Zero Energy Vision
            </div>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              A revolutionary peer-to-peer network for wireless energy distribution across the entire Chicago metropolitan area - from downtown to Tinley Park, Joliet, Naperville, Schaumburg, and Evanston
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
              <Network className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">P2P Protocol</h3>
              <p className="text-sm text-muted-foreground text-center">
                Beyond TCP/IP - quantum-entangled mesh network for instant communication
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-card/50 backdrop-blur border">
              <Trees className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-semibold">Community Owned</h3>
              <p className="text-sm text-muted-foreground text-center">
                Decentralized infrastructure owned and operated by Chicago residents
              </p>
            </div>
          </div>

          {/* Real Implementation Banner */}
          <div className="mt-8 p-6 rounded-lg bg-green-600/20 border-2 border-green-500 max-w-3xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl">🌐</span>
              <h3 className="text-xl font-bold text-green-400">Real Implementation Available!</h3>
            </div>
            <p className="text-gray-300 mb-4 text-center">
              While the plasma energy network is theoretical, we have developed a <strong>real, deployable mesh network</strong> using proven technologies (B.A.T.M.A.N., Yggdrasil, UniFi hardware).
            </p>
            <div className="flex justify-center">
              <a
                href="/mesh"
                className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors inline-flex items-center gap-2"
              >
                <span>Build a Real Mesh Network</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              Explore Vision (Theoretical)
            </button>
            <a
              href="/free-energy"
              className="px-8 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors text-center"
            >
              View Research Archive
            </a>
          </div>

          {/* Live Stats */}
          <div className="mt-12 p-6 rounded-lg bg-card/30 backdrop-blur border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Active Nodes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0 kW</div>
                <div className="text-sm text-muted-foreground">Power Shared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0 GB</div>
                <div className="text-sm text-muted-foreground">Data Transferred</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">0</div>
                <div className="text-sm text-muted-foreground">Communities</div>
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