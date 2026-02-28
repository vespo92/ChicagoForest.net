"use client"

import Link from "next/link"
import {
  Users, FileText, ExternalLink, Calendar, BookOpen,
  Info, AlertTriangle, Award, Newspaper
} from "lucide-react"

const malloveTimeline = [
  { year: 1947, event: "Eugene Mallove born in Norwich, Connecticut" },
  { year: 1969, event: "Bachelor's degree in Aeronautical Engineering from MIT" },
  { year: 1975, event: "Master's degree in Environmental Engineering from Harvard" },
  { year: 1989, event: "Present at MIT cold fusion experiments as science writer" },
  { year: 1991, event: "Resigns from MIT, publishes 'Fire from Ice'" },
  { year: 1995, event: "Founds Infinite Energy magazine" },
  { year: 1999, event: "Establishes New Energy Foundation" },
  { year: 2004, event: "Eugene Mallove murdered (unrelated to research)" },
]

const publications = [
  {
    title: "Fire from Ice: Searching for the Truth Behind the Cold Fusion Furor",
    year: 1991,
    type: "Book",
    url: "https://www.amazon.com/Fire-Ice-Searching-Behind-Fusion/dp/0471531391",
    description: "Detailed account of cold fusion controversy and alleged data manipulation at MIT.",
  },
  {
    title: "Infinite Energy Magazine",
    year: "1995-2004",
    type: "Publication",
    url: "https://infinite-energy.com/",
    description: "Bi-monthly magazine covering new energy research and cold fusion developments.",
  },
  {
    title: "MIT Special Report on Cold Fusion",
    year: 1991,
    type: "Report",
    url: "https://infinite-energy.com/resources/mitcfreport.html",
    description: "Mallove's analysis of alleged data manipulation in MIT cold fusion experiments.",
  },
]

const keyContributions = [
  {
    title: "MIT Cold Fusion Controversy",
    description: "Mallove documented apparent data manipulation in MIT's 1989 cold fusion replication attempt, where raw data allegedly showed excess heat that was later 'normalized' to show no effect.",
    significance: "Raised questions about scientific integrity in cold fusion research.",
  },
  {
    title: "Infinite Energy Magazine",
    description: "Published 100+ issues covering LENR, zero-point energy, and other alternative energy research, providing a platform for researchers marginalized by mainstream journals.",
    significance: "Created lasting archive of alternative energy research documentation.",
  },
  {
    title: "New Energy Foundation",
    description: "Non-profit organization dedicated to supporting new energy research and public education about alternative energy technologies.",
    significance: "Funded and promoted legitimate scientific research into unconventional energy sources.",
  },
  {
    title: "Public Advocacy",
    description: "Testified before Congress and appeared on numerous media programs advocating for cold fusion research funding.",
    significance: "Brought public attention to suppressed energy research.",
  },
]

const magazineHighlights = [
  { issue: "Issue #1", year: 1995, topic: "Cold Fusion: The Real Story" },
  { issue: "Issue #25", year: 1999, topic: "Zero-Point Energy Extraction" },
  { issue: "Issue #50", year: 2002, topic: "Ten Years of LENR Progress" },
  { issue: "Issue #55", year: 2003, topic: "NASA's Interest in LENR" },
  { issue: "Issue #64", year: 2004, topic: "Commercial LENR Developments" },
]

const archives = [
  {
    title: "Infinite Energy Archive",
    url: "https://infinite-energy.com/",
    description: "Complete archive of Infinite Energy magazine issues and articles.",
  },
  {
    title: "LENR-CANR Mallove Collection",
    url: "https://lenr-canr.org/",
    description: "Mallove's papers and articles archived in the LENR library.",
  },
  {
    title: "New Energy Foundation",
    url: "https://www.newenergyfoundation.org/",
    description: "Organization founded by Mallove to support new energy research.",
  },
]

export default function MalloveResearchPage() {
  return (
    <div className="py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link href="/research" className="hover:text-primary">Research</Link>
            <span>/</span>
            <span>Mallove</span>
          </div>

          <div className="flex items-start space-x-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold">Eugene Mallove</h1>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-600 text-sm font-medium">
                  ARCHIVED
                </span>
              </div>
              <p className="text-xl text-muted-foreground">
                New Energy Advocate & Science Writer (1947-2004)
              </p>
            </div>
          </div>
        </div>

        {/* Bio Notice */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-green-800 dark:text-green-300">
                <strong>Documented Individual:</strong> Eugene Mallove was a real scientist, engineer,
                and science writer. His work documenting cold fusion research and founding Infinite Energy
                magazine is verifiable through multiple independent sources.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Bio */}
        <div className="bg-card border rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Biography</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="mb-4">
                Dr. Eugene Mallove was an American scientist, engineer, and science writer who became
                one of the most prominent advocates for cold fusion and alternative energy research.
                With degrees from MIT and Harvard, he brought scientific credibility to the field.
              </p>
              <p className="mb-4">
                While working as the Chief Science Writer at MIT's News Office in 1989, Mallove
                witnessed the institution's cold fusion replication attempts firsthand. He later
                claimed to have discovered data manipulation that affected the experiment's conclusions.
              </p>
              <p>
                His 1991 book "Fire from Ice" detailed the cold fusion controversy and his allegations
                of scientific misconduct. He went on to found Infinite Energy magazine, which became
                the primary publication for alternative energy research for nearly a decade.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="font-semibold mb-2">Education</h4>
                <ul className="text-sm space-y-1">
                  <li>B.S. Aeronautical Engineering - MIT (1969)</li>
                  <li>M.S. Environmental Engineering - Harvard (1975)</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <h4 className="font-semibold mb-2">Career Highlights</h4>
                <ul className="text-sm space-y-1">
                  <li>Chief Science Writer, MIT News Office</li>
                  <li>Founder, Infinite Energy magazine</li>
                  <li>President, New Energy Foundation</li>
                  <li>Author, "Fire from Ice"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Key Contributions */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Award className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Key Contributions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {keyContributions.map((contrib, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-card border">
                <h3 className="font-bold text-lg mb-2">{contrib.title}</h3>
                <p className="text-muted-foreground mb-3">{contrib.description}</p>
                <p className="text-sm text-primary">{contrib.significance}</p>
              </div>
            ))}
          </div>
        </div>

        {/* MIT Controversy */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 mb-12">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-400 mb-4">
                The MIT Controversy
              </h2>
              <p className="text-yellow-800 dark:text-yellow-300 mb-4">
                Mallove's most controversial claim involved the 1989 MIT cold fusion replication experiment.
                He alleged that raw data showing excess heat was later "shifted" in the official report
                to show no effect. This accusation was never formally investigated by MIT.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-yellow-500/10 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">Mallove's Claim</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Raw data allegedly showed positive results that were "normalized" away in final reports.
                  </p>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">MIT's Position</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    MIT maintained that proper scientific methodology was followed in their experiments.
                  </p>
                </div>
              </div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-4">
                This controversy remains unresolved and highlights the challenges in evaluating
                disputed scientific claims.
              </p>
            </div>
          </div>
        </div>

        {/* Publications */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Major Publications</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {publications.map((pub, idx) => (
              <a
                key={idx}
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-secondary">
                    {pub.type}
                  </span>
                  <ExternalLink className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{pub.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{pub.year}</p>
                <p className="text-sm text-muted-foreground">{pub.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Infinite Energy Magazine */}
        <div className="bg-card border rounded-2xl p-8 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Newspaper className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Infinite Energy Magazine</h2>
          </div>

          <p className="text-muted-foreground mb-6">
            Founded in 1995, Infinite Energy became the primary publication for cold fusion and
            alternative energy research, publishing 100+ issues over nearly a decade and providing
            a platform for researchers marginalized by mainstream scientific journals.
          </p>

          <div className="grid md:grid-cols-5 gap-4 mb-6">
            {magazineHighlights.map((issue, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-secondary/50 text-center">
                <div className="font-semibold text-primary">{issue.issue}</div>
                <div className="text-xs text-muted-foreground mb-1">{issue.year}</div>
                <div className="text-xs">{issue.topic}</div>
              </div>
            ))}
          </div>

          <a
            href="https://infinite-energy.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <span>Browse Magazine Archive</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Timeline */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Timeline</h2>
              </div>

              <div className="space-y-4">
                {malloveTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="w-16 text-right">
                      <span className="font-bold text-primary">{item.year}</span>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5"></div>
                    <div className="flex-1 pb-4 border-b last:border-0">
                      <p>{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Archives */}
          <div>
            <div className="bg-card border rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">Archives</h2>
              </div>

              <div className="space-y-4">
                {archives.map((archive, idx) => (
                  <a
                    key={idx}
                    href={archive.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-semibold">{archive.title}</span>
                      <ExternalLink className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground">{archive.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legacy */}
        <div className="bg-linear-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">Legacy</h2>
          <p className="text-muted-foreground mb-4">
            Eugene Mallove's work continues to influence alternative energy research. The Infinite Energy
            archive remains one of the most comprehensive resources for LENR documentation, and his
            advocacy brought attention to what he saw as the suppression of legitimate scientific research.
          </p>
          <p className="text-muted-foreground">
            His tragic death in 2004 (unrelated to his research) cut short his advocacy, but the
            New Energy Foundation and Infinite Energy archives preserve his contributions to the field.
          </p>
        </div>

        {/* AI Notice */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span className="text-sm">
              This page documents a real historical figure. All sources are verifiable.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
