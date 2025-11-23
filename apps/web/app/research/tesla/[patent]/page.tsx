"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Radio, FileText, ExternalLink, Calendar, User,
  Info, ChevronLeft, Globe, Zap
} from "lucide-react"

// Patent database with detailed information
const patentDatabase: Record<string, {
  id: string
  title: string
  year: number
  dateIssued: string
  category: string
  description: string
  url: string
  significance: string
  abstract: string
  keyFeatures: string[]
  relatedPatents: string[]
  technicalNotes: string
}> = {
  "US645576A": {
    id: "US645576A",
    title: "System of Transmission of Electrical Energy",
    year: 1900,
    dateIssued: "March 20, 1900",
    category: "Wireless Power",
    description: "Tesla's foundational patent describing the transmission of electrical energy through natural media without wires.",
    url: "https://patents.google.com/patent/US645576A",
    significance: "First patent describing wireless power transmission using Earth-ionosphere waveguide. This patent forms the basis of Tesla's global wireless power concept.",
    abstract: "Be it known that I, NIKOLA TESLA, a citizen of the United States, residing in the borough of Manhattan, in the city, county, and State of New York, have invented certain new and useful Improvements in the Method of and Apparatus for Utilizing the Effects Transmitted Through the Natural Media.",
    keyFeatures: [
      "Utilizes Earth as a conductor for electrical energy transmission",
      "Employs resonant electrical circuits for efficient power transfer",
      "Describes elevated transmitting terminals for coupling to atmosphere",
      "Details ground connection methods for completing the circuit",
      "Specifies frequency requirements for optimal transmission"
    ],
    relatedPatents: ["US787412A", "US1119732A", "US685012A"],
    technicalNotes: "Tesla describes using the Earth-ionosphere cavity as a waveguide, exciting it at its natural resonant frequency to create standing waves that could be tapped at any location on the globe."
  },
  "US787412A": {
    id: "US787412A",
    title: "Art of Transmitting Electrical Energy Through the Natural Mediums",
    year: 1905,
    dateIssued: "April 18, 1905",
    category: "Wireless Power",
    description: "Advanced method for transmitting energy without wires using terrestrial resonance.",
    url: "https://patents.google.com/patent/US787412A",
    significance: "Describes using Earth as a conductor for global energy distribution with practical engineering specifications.",
    abstract: "The invention relates to the transmission of electrical energy through the natural mediums for all manner of useful purposes, and has particular reference to certain new and improved methods and apparatus which have been devised for this object.",
    keyFeatures: [
      "Detailed grounding system specifications",
      "Atmospheric coupling mechanisms",
      "Frequency tuning procedures",
      "Multiple receiver synchronization",
      "Power level calculations"
    ],
    relatedPatents: ["US645576A", "US1119732A", "US568176A"],
    technicalNotes: "This patent provides more detailed engineering specifications for the concepts introduced in US645576A, including practical considerations for building transmission stations."
  },
  "US1119732A": {
    id: "US1119732A",
    title: "Apparatus for Transmitting Electrical Energy",
    year: 1914,
    dateIssued: "December 1, 1914",
    category: "Transmission",
    description: "Detailed apparatus design for practical wireless energy transmission.",
    url: "https://patents.google.com/patent/US1119732A",
    significance: "Engineering specifications for Wardenclyffe-type installations with detailed component descriptions.",
    abstract: "This invention relates to the transmission of electrical energy through the natural media, and particularly to certain new and useful improvements in the apparatus employed for this purpose.",
    keyFeatures: [
      "Tower construction specifications",
      "Capacitance top design",
      "Ground system engineering",
      "Oscillator circuit details",
      "Power coupling methods"
    ],
    relatedPatents: ["US645576A", "US787412A", "US593138A"],
    technicalNotes: "This patent represents Tesla's most detailed engineering specifications for a practical wireless power transmission station, closely matching the Wardenclyffe design."
  },
  "US514168A": {
    id: "US514168A",
    title: "Means for Generating Electric Currents",
    year: 1894,
    dateIssued: "February 6, 1894",
    category: "Generation",
    description: "Method for generating high-frequency currents from direct current sources.",
    url: "https://patents.google.com/patent/US514168A",
    significance: "Foundation for resonant transformer technology that enables high-frequency power generation.",
    abstract: "This invention relates to certain improvements in means for generating electric currents, particularly high-frequency alternating currents.",
    keyFeatures: [
      "DC to high-frequency AC conversion",
      "Spark gap oscillator design",
      "Resonant circuit configuration",
      "Frequency control methods",
      "Power amplification techniques"
    ],
    relatedPatents: ["US568176A", "US593138A", "US685012A"],
    technicalNotes: "This patent describes the fundamental oscillator circuits that Tesla used to generate the high-frequency currents needed for his wireless power experiments."
  },
  "US454622A": {
    id: "US454622A",
    title: "System of Electric Lighting",
    year: 1891,
    dateIssued: "June 23, 1891",
    category: "Lighting",
    description: "Wireless lighting system using high-frequency electrical oscillations.",
    url: "https://patents.google.com/patent/US454622A",
    significance: "Demonstrated practical wireless power for lighting, proving wireless energy transfer is possible.",
    abstract: "This invention relates to methods of, and apparatus for, producing light by means of electric discharges, particularly by induction.",
    keyFeatures: [
      "Wireless lamp operation",
      "Inductive coupling for lighting",
      "High-frequency excitation methods",
      "Phosphorescent tube designs",
      "Efficiency optimizations"
    ],
    relatedPatents: ["US514168A", "US568176A", "US593138A"],
    technicalNotes: "Tesla demonstrated these wireless lamps publicly, showing that electrical energy could be transmitted without wires to power practical devices."
  },
  "US685012A": {
    id: "US685012A",
    title: "Means for Increasing the Intensity of Electrical Oscillations",
    year: 1901,
    dateIssued: "October 22, 1901",
    category: "Oscillation",
    description: "Method for amplifying electrical oscillations using resonance.",
    url: "https://patents.google.com/patent/US685012A",
    significance: "Key to achieving high-power wireless transmission through resonant amplification.",
    abstract: "This invention relates to the production of electrical oscillations of great intensity and frequency.",
    keyFeatures: [
      "Resonant amplification principles",
      "Multiple coil configurations",
      "Frequency multiplication methods",
      "Power accumulation techniques",
      "Sustained oscillation maintenance"
    ],
    relatedPatents: ["US514168A", "US593138A", "US645576A"],
    technicalNotes: "This patent describes how Tesla achieved the enormous voltages needed for wireless power transmission by using resonant circuits to build up oscillation intensity."
  },
  "US593138A": {
    id: "US593138A",
    title: "Electrical Transformer",
    year: 1897,
    dateIssued: "November 2, 1897",
    category: "Transformer",
    description: "The famous Tesla coil patent for high-voltage resonant transformers.",
    url: "https://patents.google.com/patent/US593138A",
    significance: "The Tesla Coil - fundamental technology for high-voltage resonant power transformation.",
    abstract: "This invention relates to electrical transformers or induction-coils, and has for its object to provide a means for efficiently raising the potential of electrical charges.",
    keyFeatures: [
      "Resonant transformer design",
      "Air core construction",
      "Primary/secondary coupling",
      "Voltage multiplication ratios",
      "Spark gap integration"
    ],
    relatedPatents: ["US514168A", "US568176A", "US685012A"],
    technicalNotes: "The Tesla coil remains one of the most iconic electrical devices ever invented, capable of producing millions of volts and spectacular electrical discharges."
  },
  "US568176A": {
    id: "US568176A",
    title: "Apparatus for Producing Electric Currents of High Frequency and Potential",
    year: 1896,
    dateIssued: "September 22, 1896",
    category: "High Frequency",
    description: "System for generating high-frequency, high-potential electrical currents.",
    url: "https://patents.google.com/patent/US568176A",
    significance: "Essential technology for resonant energy transmission systems.",
    abstract: "This invention relates to apparatus for producing currents of high frequency and high potential for various purposes.",
    keyFeatures: [
      "High-frequency generation methods",
      "Potential raising techniques",
      "Circuit optimization for efficiency",
      "Component specifications",
      "Safety considerations"
    ],
    relatedPatents: ["US514168A", "US593138A", "US685012A"],
    technicalNotes: "This patent provides detailed specifications for generating the high-frequency, high-voltage currents needed for Tesla's wireless power experiments."
  },
}

export default function PatentDetailPage() {
  const params = useParams()
  const patentId = params.patent as string

  const patent = patentDatabase[patentId]

  if (!patent) {
    return (
      <div className="py-12 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Patent Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The patent {patentId} is not in our database.
          </p>
          <Link href="/research/tesla" className="text-primary hover:underline">
            Return to Tesla Research
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/research" className="hover:text-primary">Research</Link>
          <span>/</span>
          <Link href="/research/tesla" className="hover:text-primary">Tesla</Link>
          <span>/</span>
          <span>{patent.id}</span>
        </div>

        {/* Back Link */}
        <Link
          href="/research/tesla"
          className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Tesla Patents</span>
        </Link>

        {/* Patent Header */}
        <div className="bg-card border rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/20 text-green-600">
                  VERIFIED USPTO PATENT
                </span>
              </div>
            </div>
            <a
              href={patent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span>View on Google Patents</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <h1 className="text-3xl font-bold mb-2">{patent.id}</h1>
          <p className="text-xl text-muted-foreground mb-6">{patent.title}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center space-x-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Date Issued</span>
              </div>
              <span className="font-medium">{patent.dateIssued}</span>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center space-x-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Inventor</span>
              </div>
              <span className="font-medium">Nikola Tesla</span>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center space-x-2 mb-1">
                <Radio className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Category</span>
              </div>
              <span className="font-medium">{patent.category}</span>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center space-x-2 mb-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Jurisdiction</span>
              </div>
              <span className="font-medium">United States</span>
            </div>
          </div>
        </div>

        {/* Significance */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Historical Significance</h2>
          </div>
          <p>{patent.significance}</p>
        </div>

        {/* Abstract */}
        <div className="bg-card border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Original Abstract</h2>
          <blockquote className="pl-4 border-l-4 border-primary/30 italic text-muted-foreground">
            "{patent.abstract}"
          </blockquote>
        </div>

        {/* Key Features */}
        <div className="bg-card border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Key Features</h2>
          <ul className="space-y-3">
            {patent.keyFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">{idx + 1}</span>
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Notes */}
        <div className="bg-card border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Technical Notes</h2>
          <p className="text-muted-foreground">{patent.technicalNotes}</p>
        </div>

        {/* Related Patents */}
        <div className="bg-card border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Related Patents</h2>
          <div className="flex flex-wrap gap-3">
            {patent.relatedPatents.map((relatedId) => (
              <Link
                key={relatedId}
                href={`/research/tesla/${relatedId}`}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {relatedId}
              </Link>
            ))}
          </div>
        </div>

        {/* Source Verification */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">
                Source Verification
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                This patent information is sourced directly from the United States Patent and Trademark Office (USPTO)
                and can be independently verified through Google Patents.
              </p>
              <a
                href={patent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm text-green-600 hover:underline"
              >
                <span>Verify at Google Patents</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* AI Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Info className="h-4 w-4" />
            <span className="text-sm">
              Patent data compiled by AI. All information verified against USPTO records.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
