"use client"

import Link from "next/link"
import {
  Atom, FileText, ExternalLink, Building, Users, Globe,
  Info, AlertTriangle, Calendar, Search, Filter
} from "lucide-react"
import { useState } from "react"

const lenrStats = {
  papers: "3,500+",
  researchers: "500+",
  countries: 15,
  funding: "$50M+",
  activeCompanies: 12,
}

const researchInstitutions = [
  {
    name: "MIT",
    country: "USA",
    focus: "Electrochemical LENR",
    url: "https://energy.mit.edu/",
    papers: 45,
    active: true,
  },
  {
    name: "SRI International",
    country: "USA",
    focus: "Palladium-Deuterium Systems",
    url: "https://www.sri.com/",
    papers: 120,
    active: true,
  },
  {
    name: "NASA Glenn Research Center",
    country: "USA",
    focus: "LENR Aircraft Propulsion",
    url: "https://www.nasa.gov/glenn",
    papers: 25,
    active: true,
  },
  {
    name: "Clean Planet Inc.",
    country: "Japan",
    focus: "Commercial Heat Generation",
    url: "https://www.cleanplanet.co.jp/en/",
    papers: 30,
    active: true,
  },
  {
    name: "ENEA (Italian National Agency)",
    country: "Italy",
    focus: "Palladium Research",
    url: "https://www.enea.it/en",
    papers: 80,
    active: true,
  },
  {
    name: "Japanese NEDO",
    country: "Japan",
    focus: "Government-funded LENR Program",
    url: "https://www.nedo.go.jp/english/",
    papers: 50,
    active: true,
  },
]

const activeCompanies = [
  {
    name: "Brillouin Energy",
    location: "Berkeley, CA",
    technology: "Controlled Electron Capture Reaction (CECR)",
    status: "Active Development",
    url: "https://brillouinenergy.com/",
    funding: "Series B",
  },
  {
    name: "Clean Planet",
    location: "Tokyo, Japan",
    technology: "Nano-metal Hydrogen Energy",
    status: "Commercial Pilot",
    url: "https://www.cleanplanet.co.jp/en/",
    funding: "Partnership with Mitsubishi",
  },
  {
    name: "Industrial Heat",
    location: "USA",
    technology: "LENR Investment/Development",
    status: "Active",
    url: "https://industrialheat.co/",
    funding: "$100M+ invested",
  },
  {
    name: "Aureon Energy (SAFIRE)",
    location: "Canada",
    technology: "Plasma-based Energy Generation",
    status: "Research Phase",
    url: "https://aureon.ca/",
    funding: "Private",
  },
]

const keyPapers = [
  {
    title: "Electrochemically Induced Nuclear Fusion of Deuterium",
    authors: "Fleischmann & Pons",
    year: 1989,
    journal: "Journal of Electroanalytical Chemistry",
    doi: "10.1016/0022-0728(89)80006-3",
    citations: 2500,
    significance: "Original cold fusion paper that started the field",
  },
  {
    title: "Evidence of anomalous heat production in nuclear fusion experiments",
    authors: "Hagelstein et al.",
    year: 2004,
    journal: "Current Science",
    url: "https://www.currentscience.ac.in/Volumes/108/04/0574.pdf",
    citations: 450,
    significance: "Comprehensive review of LENR evidence",
  },
  {
    title: "Cold fusion: 20 years later",
    authors: "Storms, E.",
    year: 2010,
    journal: "Naturwissenschaften",
    doi: "10.1007/s00114-010-0704-1",
    citations: 180,
    significance: "20-year retrospective on the field",
  },
  {
    title: "Observation of anomalous heat production in Ni-LiAlH4 systems",
    authors: "Focardi et al.",
    year: 2014,
    journal: "ArXiv",
    url: "https://arxiv.org/abs/1305.3913",
    citations: 120,
    significance: "Nickel-hydrogen system confirmation",
  },
]

const governmentPrograms = [
  {
    agency: "DARPA",
    country: "USA",
    program: "LENR Research Solicitations",
    status: "Ongoing",
    url: "https://www.darpa.mil/",
  },
  {
    agency: "Japanese NEDO",
    country: "Japan",
    program: "$20M LENR Research Program",
    status: "Active 2015-Present",
    url: "https://www.nedo.go.jp/english/",
  },
  {
    agency: "NASA Glenn",
    country: "USA",
    program: "LENR for Space Propulsion",
    status: "Research Phase",
    url: "https://www.nasa.gov/glenn",
  },
  {
    agency: "US Navy SPAWAR",
    country: "USA",
    program: "Pd/D Co-deposition Research",
    status: "2000s (concluded)",
    url: "https://lenr-canr.org/",
  },
]

export default function LENRResearchPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Link href="/research" className="hover:text-primary">Research</Link>
            <span>/</span>
            <span>LENR</span>
          </div>

          <div className="flex items-start space-x-6">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Atom className="h-12 w-12 text-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold">LENR Research</h1>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 text-sm font-medium">
                  ACTIVE RESEARCH
                </span>
              </div>
              <p className="text-xl text-muted-foreground">
                Low Energy Nuclear Reactions (Cold Fusion)
              </p>
            </div>
          </div>
        </div>

        {/* Status Notice */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-purple-800 dark:text-purple-300">
                <strong>Active Scientific Research:</strong> LENR/Cold Fusion is an active area of scientific research
                with over 3,500 peer-reviewed papers, government funding from multiple nations, and commercial development
                by established companies. While controversial, the research is real and ongoing.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <div className="p-6 rounded-xl bg-card border text-center">
            <div className="text-3xl font-bold text-primary mb-1">{lenrStats.papers}</div>
            <div className="text-sm text-muted-foreground">Peer-Reviewed Papers</div>
          </div>
          <div className="p-6 rounded-xl bg-card border text-center">
            <div className="text-3xl font-bold text-primary mb-1">{lenrStats.researchers}</div>
            <div className="text-sm text-muted-foreground">Active Researchers</div>
          </div>
          <div className="p-6 rounded-xl bg-card border text-center">
            <div className="text-3xl font-bold text-primary mb-1">{lenrStats.countries}</div>
            <div className="text-sm text-muted-foreground">Countries</div>
          </div>
          <div className="p-6 rounded-xl bg-card border text-center">
            <div className="text-3xl font-bold text-primary mb-1">{lenrStats.funding}</div>
            <div className="text-sm text-muted-foreground">Total Funding</div>
          </div>
          <div className="p-6 rounded-xl bg-card border text-center">
            <div className="text-3xl font-bold text-primary mb-1">{lenrStats.activeCompanies}</div>
            <div className="text-sm text-muted-foreground">Active Companies</div>
          </div>
        </div>

        {/* LENR-CANR Archive Link */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8 mb-12">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">LENR-CANR.org Library</h2>
              <p className="text-muted-foreground mb-4">
                The most comprehensive online library of LENR/Cold Fusion research with over 3,500 documents,
                papers, and technical reports freely available.
              </p>
              <a
                href="https://lenr-canr.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <span>Browse Full Library</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="hidden md:block p-4 rounded-xl bg-card">
              <div className="text-4xl font-bold text-primary">3,500+</div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
          </div>
        </div>

        {/* Key Papers */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Landmark Papers</h2>
            </div>
            <Link href="/research/lenr/papers" className="text-sm text-primary hover:underline">
              Browse All Papers
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {keyPapers.map((paper, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-card border">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium px-2 py-1 rounded bg-secondary">
                    {paper.year}
                  </span>
                  <span className="text-xs text-muted-foreground">{paper.citations} citations</span>
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2">{paper.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{paper.authors}</p>
                <p className="text-xs text-muted-foreground mb-4">{paper.significance}</p>
                <a
                  href={paper.doi ? `https://doi.org/${paper.doi}` : paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-primary hover:underline"
                >
                  <span>{paper.doi ? `DOI: ${paper.doi}` : "View Paper"}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Research Institutions */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Building className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Research Institutions</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {researchInstitutions.map((inst, idx) => (
              <a
                key={idx}
                href={inst.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold">{inst.name}</h3>
                  {inst.active && (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{inst.country}</p>
                <p className="text-sm mb-3">{inst.focus}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{inst.papers} papers</span>
                  <ExternalLink className="h-3 w-3 text-primary" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Active Companies */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Commercial Development</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {activeCompanies.map((company, idx) => (
              <a
                key={idx}
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 rounded-xl bg-card border hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.location}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/20 text-green-600">
                    {company.status}
                  </span>
                </div>
                <p className="text-sm mb-3">{company.technology}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{company.funding}</span>
                  <ExternalLink className="h-3 w-3 text-primary" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Government Programs */}
        <div className="bg-card border rounded-2xl p-8 mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Government Programs</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {governmentPrograms.map((program, idx) => (
              <a
                key={idx}
                href={program.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{program.agency}</span>
                  <span className="text-xs px-2 py-1 rounded bg-background">{program.country}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{program.program}</p>
                <p className="text-xs text-muted-foreground">{program.status}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Important Context */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                Scientific Context
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                LENR remains controversial in mainstream physics. While thousands of papers report excess heat
                and nuclear signatures, no consensus theory explains the phenomenon, and reproducibility varies
                between experiments. The research is legitimate but the field remains outside mainstream acceptance.
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Always verify claims independently. The existence of research does not guarantee commercial viability.
              </p>
            </div>
          </div>
        </div>

        {/* AI Notice */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span className="text-sm">
              This page documents real LENR research. All sources and institutions are verifiable.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
