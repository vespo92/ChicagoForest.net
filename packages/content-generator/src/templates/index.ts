/**
 * Content Templates
 *
 * Agent 12: Scribe - Standardized templates for content generation
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import { STANDARD_LABELS, DISCLAIMERS } from '../labeling';

/**
 * Template types supported by Scribe
 */
export type TemplateType =
  | 'patent_summary'
  | 'paper_abstract'
  | 'company_profile'
  | 'researcher_bio'
  | 'technology_overview'
  | 'timeline_entry'
  | 'source_card';

/**
 * Base template interface
 */
export interface ContentTemplate {
  type: TemplateType;
  version: string;
  render: (data: Record<string, unknown>) => string;
  renderHtml: (data: Record<string, unknown>) => string;
  renderMarkdown: (data: Record<string, unknown>) => string;
}

/**
 * Patent Summary Template
 */
export const patentSummaryTemplate: ContentTemplate = {
  type: 'patent_summary',
  version: '1.0.0',

  render: (data) => {
    const { patentNumber, title, inventor, filingDate, abstract, keyInnovations, url } = data as {
      patentNumber: string;
      title: string;
      inventor: string;
      filingDate?: string;
      abstract: string;
      keyInnovations?: string[];
      url?: string;
    };

    return `
${STANDARD_LABELS.AI_SUMMARIZED}

PATENT: ${patentNumber}
${title}

Inventor: ${inventor}
${filingDate ? `Filing Date: ${filingDate}` : ''}

ABSTRACT:
${abstract}

${keyInnovations?.length ? `KEY INNOVATIONS:\n${keyInnovations.map(k => `• ${k}`).join('\n')}` : ''}

SOURCE: ${url || `https://patents.google.com/patent/${patentNumber}`}

---
${DISCLAIMERS.ai_summarized}
    `.trim();
  },

  renderHtml: (data) => {
    const { patentNumber, title, inventor, filingDate, abstract, keyInnovations, url } = data as {
      patentNumber: string;
      title: string;
      inventor: string;
      filingDate?: string;
      abstract: string;
      keyInnovations?: string[];
      url?: string;
    };

    const sourceUrl = url || `https://patents.google.com/patent/${patentNumber}`;

    return `
<article class="patent-summary">
  <aside class="ai-label warning">${STANDARD_LABELS.AI_SUMMARIZED}</aside>

  <header>
    <span class="patent-number">${patentNumber}</span>
    <h2>${title}</h2>
    <p class="inventor">Inventor: <strong>${inventor}</strong></p>
    ${filingDate ? `<p class="filing-date">Filed: ${filingDate}</p>` : ''}
  </header>

  <section class="abstract">
    <h3>Abstract</h3>
    <p>${abstract}</p>
  </section>

  ${keyInnovations?.length ? `
  <section class="innovations">
    <h3>Key Innovations</h3>
    <ul>
      ${keyInnovations.map(k => `<li>${k}</li>`).join('\n')}
    </ul>
  </section>
  ` : ''}

  <footer>
    <a href="${sourceUrl}" target="_blank" rel="noopener" class="source-link">
      View Original Patent →
    </a>
    <p class="disclaimer">${DISCLAIMERS.ai_summarized}</p>
  </footer>
</article>
    `.trim();
  },

  renderMarkdown: (data) => {
    const { patentNumber, title, inventor, filingDate, abstract, keyInnovations, url } = data as {
      patentNumber: string;
      title: string;
      inventor: string;
      filingDate?: string;
      abstract: string;
      keyInnovations?: string[];
      url?: string;
    };

    const sourceUrl = url || `https://patents.google.com/patent/${patentNumber}`;

    return `
> ${STANDARD_LABELS.AI_SUMMARIZED}

## ${patentNumber}: ${title}

**Inventor:** ${inventor}
${filingDate ? `**Filing Date:** ${filingDate}` : ''}

### Abstract

${abstract}

${keyInnovations?.length ? `
### Key Innovations

${keyInnovations.map(k => `- ${k}`).join('\n')}
` : ''}

---

**Source:** [${patentNumber}](${sourceUrl})

> *${DISCLAIMERS.ai_summarized}*
    `.trim();
  },
};

/**
 * Research Paper Abstract Template
 */
export const paperAbstractTemplate: ContentTemplate = {
  type: 'paper_abstract',
  version: '1.0.0',

  render: (data) => {
    const { doi, title, authors, journal, year, abstract, keyFindings } = data as {
      doi: string;
      title: string;
      authors: string[];
      journal?: string;
      year: number;
      abstract: string;
      keyFindings?: string[];
    };

    return `
${STANDARD_LABELS.AI_SUMMARIZED}

${title}

Authors: ${authors.join(', ')}
${journal ? `Journal: ${journal}` : ''}
Year: ${year}

ABSTRACT:
${abstract}

${keyFindings?.length ? `KEY FINDINGS:\n${keyFindings.map(f => `• ${f}`).join('\n')}` : ''}

DOI: https://doi.org/${doi}

---
${DISCLAIMERS.ai_summarized}
    `.trim();
  },

  renderHtml: (data) => {
    const { doi, title, authors, journal, year, abstract, keyFindings } = data as {
      doi: string;
      title: string;
      authors: string[];
      journal?: string;
      year: number;
      abstract: string;
      keyFindings?: string[];
    };

    return `
<article class="paper-abstract">
  <aside class="ai-label warning">${STANDARD_LABELS.AI_SUMMARIZED}</aside>

  <header>
    <h2>${title}</h2>
    <p class="authors">${authors.join(', ')}</p>
    ${journal ? `<p class="journal">${journal} (${year})</p>` : `<p class="year">${year}</p>`}
  </header>

  <section class="abstract">
    <h3>Abstract</h3>
    <p>${abstract}</p>
  </section>

  ${keyFindings?.length ? `
  <section class="findings">
    <h3>Key Findings</h3>
    <ul>
      ${keyFindings.map(f => `<li>${f}</li>`).join('\n')}
    </ul>
  </section>
  ` : ''}

  <footer>
    <a href="https://doi.org/${doi}" target="_blank" rel="noopener" class="doi-link">
      DOI: ${doi} →
    </a>
    <p class="disclaimer">${DISCLAIMERS.ai_summarized}</p>
  </footer>
</article>
    `.trim();
  },

  renderMarkdown: (data) => {
    const { doi, title, authors, journal, year, abstract, keyFindings } = data as {
      doi: string;
      title: string;
      authors: string[];
      journal?: string;
      year: number;
      abstract: string;
      keyFindings?: string[];
    };

    return `
> ${STANDARD_LABELS.AI_SUMMARIZED}

## ${title}

**Authors:** ${authors.join(', ')}
${journal ? `**Journal:** ${journal}` : ''}
**Year:** ${year}

### Abstract

${abstract}

${keyFindings?.length ? `
### Key Findings

${keyFindings.map(f => `- ${f}`).join('\n')}
` : ''}

---

**DOI:** [${doi}](https://doi.org/${doi})

> *${DISCLAIMERS.ai_summarized}*
    `.trim();
  },
};

/**
 * Company Profile Template
 */
export const companyProfileTemplate: ContentTemplate = {
  type: 'company_profile',
  version: '1.0.0',

  render: (data) => {
    const { name, website, founded, focus, status, researchAreas, description } = data as {
      name: string;
      website?: string;
      founded?: number;
      focus: string;
      status: string;
      researchAreas?: string[];
      description?: string;
    };

    return `
${STANDARD_LABELS.AI_GENERATED}

COMPANY PROFILE: ${name}

${website ? `Website: ${website}` : ''}
${founded ? `Founded: ${founded}` : ''}
Status: ${status}
Focus: ${focus}

${description || ''}

${researchAreas?.length ? `RESEARCH AREAS:\n${researchAreas.map(r => `• ${r}`).join('\n')}` : ''}

---
${DISCLAIMERS.ai_generated}
    `.trim();
  },

  renderHtml: (data) => {
    const { name, website, founded, focus, status, researchAreas, description } = data as {
      name: string;
      website?: string;
      founded?: number;
      focus: string;
      status: string;
      researchAreas?: string[];
      description?: string;
    };

    const statusColor = status === 'active' ? 'green' : status === 'inactive' ? 'gray' : 'orange';

    return `
<article class="company-profile">
  <aside class="ai-label warning">${STANDARD_LABELS.AI_GENERATED}</aside>

  <header>
    <h2>${name}</h2>
    <span class="status" style="color: ${statusColor}">${status.toUpperCase()}</span>
  </header>

  <section class="details">
    ${website ? `<p><strong>Website:</strong> <a href="${website}" target="_blank" rel="noopener">${website}</a></p>` : ''}
    ${founded ? `<p><strong>Founded:</strong> ${founded}</p>` : ''}
    <p><strong>Focus:</strong> ${focus}</p>
  </section>

  ${description ? `<section class="description"><p>${description}</p></section>` : ''}

  ${researchAreas?.length ? `
  <section class="research-areas">
    <h3>Research Areas</h3>
    <ul>
      ${researchAreas.map(r => `<li>${r}</li>`).join('\n')}
    </ul>
  </section>
  ` : ''}

  <footer>
    <p class="disclaimer">${DISCLAIMERS.ai_generated}</p>
  </footer>
</article>
    `.trim();
  },

  renderMarkdown: (data) => {
    const { name, website, founded, focus, status, researchAreas, description } = data as {
      name: string;
      website?: string;
      founded?: number;
      focus: string;
      status: string;
      researchAreas?: string[];
      description?: string;
    };

    return `
> ${STANDARD_LABELS.AI_GENERATED}

## ${name}

**Status:** ${status.toUpperCase()}
${website ? `**Website:** [${website}](${website})` : ''}
${founded ? `**Founded:** ${founded}` : ''}
**Focus:** ${focus}

${description || ''}

${researchAreas?.length ? `
### Research Areas

${researchAreas.map(r => `- ${r}`).join('\n')}
` : ''}

---

> *${DISCLAIMERS.ai_generated}*
    `.trim();
  },
};

/**
 * Timeline Entry Template
 */
export const timelineEntryTemplate: ContentTemplate = {
  type: 'timeline_entry',
  version: '1.0.0',

  render: (data) => {
    const { date, title, description, sources, isVerified } = data as {
      date: string;
      title: string;
      description: string;
      sources: string[];
      isVerified: boolean;
    };

    const label = isVerified ? STANDARD_LABELS.HISTORICAL_FACT : STANDARD_LABELS.AI_GENERATED;

    return `
${label}

[${date}] ${title}

${description}

${sources.length ? `Sources: ${sources.join(', ')}` : ''}
    `.trim();
  },

  renderHtml: (data) => {
    const { date, title, description, sources, isVerified } = data as {
      date: string;
      title: string;
      description: string;
      sources: string[];
      isVerified: boolean;
    };

    const label = isVerified ? STANDARD_LABELS.HISTORICAL_FACT : STANDARD_LABELS.AI_GENERATED;

    return `
<article class="timeline-entry ${isVerified ? 'verified' : 'ai-generated'}">
  <span class="label">${label}</span>
  <time datetime="${date}">${date}</time>
  <h3>${title}</h3>
  <p>${description}</p>
  ${sources.length ? `
  <div class="sources">
    ${sources.map(s => `<a href="${s}" target="_blank" rel="noopener">${s}</a>`).join(' | ')}
  </div>
  ` : ''}
</article>
    `.trim();
  },

  renderMarkdown: (data) => {
    const { date, title, description, sources, isVerified } = data as {
      date: string;
      title: string;
      description: string;
      sources: string[];
      isVerified: boolean;
    };

    const label = isVerified ? STANDARD_LABELS.HISTORICAL_FACT : STANDARD_LABELS.AI_GENERATED;

    return `
### ${date}: ${title}

${label}

${description}

${sources.length ? `**Sources:** ${sources.map(s => `[${s}](${s})`).join(' | ')}` : ''}
    `.trim();
  },
};

/**
 * Source Card Template
 */
export const sourceCardTemplate: ContentTemplate = {
  type: 'source_card',
  version: '1.0.0',

  render: (data) => {
    const { title, type, url, lastVerified, status } = data as {
      title: string;
      type: string;
      url: string;
      lastVerified?: string;
      status: 'verified' | 'pending' | 'broken';
    };

    const statusIcon = status === 'verified' ? '✅' : status === 'broken' ? '❌' : '⏳';

    return `
${statusIcon} SOURCE: ${title}

Type: ${type}
URL: ${url}
${lastVerified ? `Last Verified: ${lastVerified}` : ''}
Status: ${status}
    `.trim();
  },

  renderHtml: (data) => {
    const { title, type, url, lastVerified, status } = data as {
      title: string;
      type: string;
      url: string;
      lastVerified?: string;
      status: 'verified' | 'pending' | 'broken';
    };

    const statusColor = status === 'verified' ? 'green' : status === 'broken' ? 'red' : 'orange';

    return `
<div class="source-card" data-status="${status}">
  <h4>${title}</h4>
  <span class="source-type">${type}</span>
  <a href="${url}" target="_blank" rel="noopener">${url}</a>
  ${lastVerified ? `<time>Verified: ${lastVerified}</time>` : ''}
  <span class="status" style="color: ${statusColor}">${status.toUpperCase()}</span>
</div>
    `.trim();
  },

  renderMarkdown: (data) => {
    const { title, type, url, lastVerified, status } = data as {
      title: string;
      type: string;
      url: string;
      lastVerified?: string;
      status: 'verified' | 'pending' | 'broken';
    };

    const statusIcon = status === 'verified' ? '✅' : status === 'broken' ? '❌' : '⏳';

    return `
${statusIcon} **${title}** (${type})

[${url}](${url})
${lastVerified ? `*Last Verified: ${lastVerified}*` : ''}
    `.trim();
  },
};

/**
 * Template registry
 */
export const templates: Record<TemplateType, ContentTemplate> = {
  patent_summary: patentSummaryTemplate,
  paper_abstract: paperAbstractTemplate,
  company_profile: companyProfileTemplate,
  researcher_bio: patentSummaryTemplate, // Placeholder
  technology_overview: companyProfileTemplate, // Placeholder
  timeline_entry: timelineEntryTemplate,
  source_card: sourceCardTemplate,
};

/**
 * Render content using a template
 */
export function renderTemplate(
  templateType: TemplateType,
  data: Record<string, unknown>,
  format: 'plaintext' | 'html' | 'markdown' = 'markdown'
): string {
  const template = templates[templateType];
  if (!template) {
    throw new Error(`Unknown template type: ${templateType}`);
  }

  switch (format) {
    case 'html':
      return template.renderHtml(data);
    case 'markdown':
      return template.renderMarkdown(data);
    case 'plaintext':
    default:
      return template.render(data);
  }
}
