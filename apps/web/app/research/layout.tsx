import { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Radio, Atom, Zap, Users, Clock, FileText, ArrowUpFromDot } from "lucide-react"

export const metadata: Metadata = {
  title: "Research Portal | Chicago Plasma Forest Network",
  description: "Explore documented historical research on free energy technologies from Tesla, Mallove, Moray, and modern LENR scientists.",
}

const researchNav = [
  { href: "/research", label: "Overview", icon: BookOpen },
  { href: "/research/tesla", label: "Tesla", icon: Radio },
  { href: "/research/lenr", label: "LENR", icon: Atom },
  { href: "/research/moray", label: "Moray", icon: Zap },
  { href: "/research/mallove", label: "Mallove", icon: Users },
  { href: "/research/energy-reversal", label: "Energy Reversal", icon: ArrowUpFromDot },
  { href: "/research/timeline", label: "Timeline", icon: Clock },
  { href: "/research/sources", label: "Sources", icon: FileText },
]

export default function ResearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* AI-Generated Disclaimer Banner */}
      <div className="bg-yellow-500/20 border-b border-yellow-500/50 py-2 px-4">
        <div className="container mx-auto">
          <p className="text-xs text-center text-yellow-800 dark:text-yellow-300">
            <strong>DISCLAIMER:</strong> This research portal contains AI-generated theoretical frameworks alongside documented historical research.
            All speculative content is clearly marked. Historical sources are real and verifiable.
          </p>
        </div>
      </div>

      {/* Research Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-1 overflow-x-auto py-2">
            {researchNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors whitespace-nowrap"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
