"use client"

import { Users, Wrench, BookOpen, MessageSquare, Calendar, MapPin } from "lucide-react"

export default function CommunityOnboarding() {
  return (
    <section className="py-24 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Chicago Plasma Forest
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Be part of the energy revolution. Build, operate, and benefit from community-owned infrastructure.
          </p>
        </div>

        {/* Participation Paths */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-lg bg-card border text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Node Operator</h3>
            <p className="text-muted-foreground mb-6">
              Host a plasma node at your home or business. Share energy and earn network credits.
            </p>
            <ul className="text-left space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Receive free hardware kit</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Professional installation support</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Monthly energy credits</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-lg bg-card border text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Technical Contributor</h3>
            <p className="text-muted-foreground mb-6">
              Help develop the protocol, build hardware, or maintain the network infrastructure.
            </p>
            <ul className="text-left space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Open source development</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Hardware design workshops</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Research collaboration</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-lg bg-card border text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community Advocate</h3>
            <p className="text-muted-foreground mb-6">
              Spread awareness, organize local events, and help onboard new members.
            </p>
            <ul className="text-left space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Educational materials</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Event organization support</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span>Community governance rights</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold mb-8 text-center">Upcoming Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg bg-card border">
              <div className="flex items-start space-x-4">
                <Calendar className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Introduction to Plasma Networks</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Learn about wireless energy transmission and P2P protocols
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">Jan 15, 2026</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">7:00 PM CST</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <div className="flex items-start space-x-4">
                <Wrench className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Node Building Workshop</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Hands-on session to build your own plasma node
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">Jan 22, 2026</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">2:00 PM CST</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Lincoln Park Pilot Launch</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Witness the first live demonstration of the plasma forest
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">Feb 1, 2026</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">12:00 PM CST</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-card border">
              <div className="flex items-start space-x-4">
                <MessageSquare className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Community Governance Meeting</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Participate in network decisions and protocol development
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">Feb 10, 2026</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">6:00 PM CST</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12 px-8 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border">
          <h3 className="text-2xl font-bold mb-4">Ready to Join the Revolution?</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sign up for updates and be the first to know when node applications open
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-background border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Get Started
            </button>
          </form>
        </div>

        {/* Contact Links */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="text-primary hover:underline">Discord Community</a>
            <a href="#" className="text-primary hover:underline">Telegram Channel</a>
            <a href="#" className="text-primary hover:underline">GitHub Discussions</a>
            <a href="#" className="text-primary hover:underline">Email Support</a>
          </div>
        </div>
      </div>
    </section>
  )
}