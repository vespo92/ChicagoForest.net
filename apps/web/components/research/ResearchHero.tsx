"use client"

import { Zap, FlaskConical, Atom } from "lucide-react"
import Link from "next/link"

export default function ResearchHero() {
  return (
    <section className="relative py-24 px-4 md:px-6 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <FlaskConical className="h-10 w-10 text-primary" />
            <Zap className="h-12 w-12 text-primary" />
            <Atom className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Free Energy Research Archive
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive documentation of revolutionary energy technologies from Tesla, Mallove, Moray, and modern researchers
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/" 
              className="px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors font-semibold"
            >
              ← Back to Network
            </Link>
            <a 
              href="#sources" 
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
            >
              View All Sources
            </a>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-lg bg-card/50 backdrop-blur border">
            <div>
              <div className="text-3xl font-bold text-primary">156+</div>
              <div className="text-sm text-muted-foreground">Source Documents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Patents Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Scientific Papers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Revolutionary Technologies</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}