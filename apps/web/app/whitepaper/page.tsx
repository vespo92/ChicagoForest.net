import { FileText, Download, Github, Home } from "lucide-react"
import Link from "next/link"
import fs from 'fs'
import path from 'path'

async function getWhitepaperContent() {
  const filePath = path.join(process.cwd(), 'PROTOCOL_WHITEPAPER.md')
  const content = fs.readFileSync(filePath, 'utf8')
  return content
}

export default async function WhitepaperPage() {
  const content = await getWhitepaperContent()
  
  // Convert markdown to formatted sections
  const sections = content.split('\n## ').map((section, index) => {
    if (index === 0) {
      // First section includes the title
      const lines = section.split('\n')
      return {
        title: 'Chicago Plasma Forest Network Protocol',
        content: lines.slice(3).join('\n')
      }
    }
    const lines = section.split('\n')
    return {
      title: lines[0],
      content: lines.slice(1).join('\n')
    }
  })

  return (
    <main className="min-h-screen py-24 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Protocol Whitepaper
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Complete technical specification for the Electromagnetic Network Protocol (ENP)
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Back to Network</span>
            </Link>
            <a
              href="/PROTOCOL_WHITEPAPER.md"
              download
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Download PDF</span>
            </a>
            <a
              href="https://github.com/chicago-forest/protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 p-6 rounded-lg bg-card border">
          <h2 className="text-2xl font-semibold mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            {sections.slice(1).map((section, index) => (
              <a
                key={index}
                href={`#section-${index + 1}`}
                className="block text-primary hover:underline"
              >
                {index + 1}. {section.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          {sections.map((section, index) => (
            <section
              key={index}
              id={`section-${index}`}
              className="mb-12 p-8 rounded-lg bg-card border"
            >
              <h2 className="text-2xl font-bold mb-6">{section.title}</h2>
              <div className="whitespace-pre-wrap font-mono text-sm">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 p-6 rounded-lg bg-primary/5 border border-primary/20 text-center">
          <p className="text-sm text-muted-foreground">
            This document is released under Creative Commons CC-BY-SA 4.0 License
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last Updated: August 2024 • Version 0.1.0-alpha
          </p>
        </div>
      </div>
    </main>
  )
}