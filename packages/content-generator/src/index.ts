/**
 * @chicago-forest/content-generator
 *
 * Agent 12: Scribe - Content Generation
 *
 * Generate and enrich research content with AI-assisted summaries, citations,
 * and abstracts while maintaining transparency about AI-generated content.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 * All generated content is clearly labeled as AI-generated.
 */

export * from './generators';
export * from './formatters';
export * from './enrichers';

// Content labels
export const AI_GENERATED_LABEL = '⚠️ AI-GENERATED CONTENT';
export const THEORETICAL_LABEL = '⚠️ THEORETICAL FRAMEWORK';
export const VERIFIED_SOURCE_LABEL = '✅ VERIFIED SOURCE';

export interface GeneratedContent {
  content: string;
  isAiGenerated: boolean;
  generatedAt: Date;
  sourceRefs: string[];
  disclaimer: string;
}

export interface PatentSummary extends GeneratedContent {
  patentNumber: string;
  title: string;
  inventor: string;
  filingDate?: Date;
  abstract: string;
  keyInnovations: string[];
}

export interface ResearchPaperSummary extends GeneratedContent {
  doi: string;
  title: string;
  authors: string[];
  journal?: string;
  year: number;
  abstract: string;
  keyFindings: string[];
}

export interface CompanyProfile extends GeneratedContent {
  name: string;
  website?: string;
  founded?: number;
  focus: string;
  status: 'active' | 'inactive' | 'acquired' | 'unknown';
  researchAreas: string[];
}

export interface Citation {
  style: 'APA' | 'MLA' | 'Chicago' | 'IEEE';
  formatted: string;
  raw: {
    authors: string[];
    title: string;
    year: number;
    source: string;
    doi?: string;
    url?: string;
  };
}

export class ContentGenerator {
  private readonly disclaimerTemplate: string;

  constructor() {
    this.disclaimerTemplate = `
This content was generated using AI assistance as part of the Chicago Forest Network
theoretical framework. While sources are verified against real archives and databases,
the synthesis and analysis should be considered an AI-generated interpretation.
Always verify original sources for critical research purposes.
    `.trim();
  }

  generatePatentSummary(patent: {
    number: string;
    title: string;
    inventor: string;
    filingDate?: Date;
    description: string;
  }): PatentSummary {
    return {
      patentNumber: patent.number,
      title: patent.title,
      inventor: patent.inventor,
      filingDate: patent.filingDate,
      abstract: `${AI_GENERATED_LABEL}\n\n${patent.description.slice(0, 500)}...`,
      keyInnovations: [],
      content: patent.description,
      isAiGenerated: true,
      generatedAt: new Date(),
      sourceRefs: [`https://patents.google.com/patent/${patent.number}`],
      disclaimer: this.disclaimerTemplate,
    };
  }

  generatePaperSummary(paper: {
    doi: string;
    title: string;
    authors: string[];
    year: number;
    abstract: string;
  }): ResearchPaperSummary {
    return {
      doi: paper.doi,
      title: paper.title,
      authors: paper.authors,
      year: paper.year,
      abstract: `${AI_GENERATED_LABEL}\n\n${paper.abstract}`,
      keyFindings: [],
      content: paper.abstract,
      isAiGenerated: true,
      generatedAt: new Date(),
      sourceRefs: [`https://doi.org/${paper.doi}`],
      disclaimer: this.disclaimerTemplate,
    };
  }

  generateCompanyProfile(company: {
    name: string;
    website?: string;
    focus: string;
  }): CompanyProfile {
    return {
      name: company.name,
      website: company.website,
      focus: company.focus,
      status: 'unknown',
      researchAreas: [],
      content: `${AI_GENERATED_LABEL}\n\nCompany profile for ${company.name}`,
      isAiGenerated: true,
      generatedAt: new Date(),
      sourceRefs: company.website ? [company.website] : [],
      disclaimer: this.disclaimerTemplate,
    };
  }

  formatCitation(data: Citation['raw'], style: Citation['style']): Citation {
    let formatted: string;

    switch (style) {
      case 'APA':
        formatted = `${data.authors.join(', ')} (${data.year}). ${data.title}. ${data.source}.${data.doi ? ` https://doi.org/${data.doi}` : ''}`;
        break;
      case 'MLA':
        formatted = `${data.authors.join(', ')}. "${data.title}." ${data.source}, ${data.year}.`;
        break;
      case 'Chicago':
        formatted = `${data.authors.join(', ')}. "${data.title}." ${data.source} (${data.year}).`;
        break;
      case 'IEEE':
        formatted = `${data.authors.join(', ')}, "${data.title}," ${data.source}, ${data.year}.`;
        break;
    }

    return { style, formatted, raw: data };
  }
}

export default ContentGenerator;
