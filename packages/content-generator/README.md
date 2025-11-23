# @chicago-forest/content-generator

> **Agent 12: Scribe** - AI-assisted content generation with transparent labeling

**⚠️ DISCLAIMER: This is part of an AI-generated theoretical framework for the Chicago Forest Network. All generated content is clearly labeled as AI-generated per project guidelines.**

## Overview

The Scribe agent provides content generation capabilities with a strong emphasis on **transparency** and **AI labeling**. Every piece of AI-generated content is clearly marked to maintain honesty and trust within the Chicago Forest Network ecosystem.

### Core Principles

1. **Transparency First**: All AI-generated content MUST be labeled
2. **Source Verification**: Link to real, verifiable sources whenever possible
3. **Clear Disclaimers**: Distinguish between facts and theoretical content
4. **Proper Attribution**: Credit original researchers and sources

## Installation

```bash
pnpm add @chicago-forest/content-generator
```

## Features

### AI Labeling System

The comprehensive labeling system ensures all content is properly classified:

```typescript
import {
  createAILabel,
  wrapWithAILabel,
  validateAILabeling,
  STANDARD_LABELS,
} from '@chicago-forest/content-generator';

// Create a label for AI-generated content
const label = createAILabel('ai_generated');
console.log(label.shortLabel); // "⚠️ AI-GENERATED CONTENT"
console.log(label.markdownLabel); // Full markdown disclaimer block

// Wrap content with appropriate label
const content = 'This is some generated content about Tesla patents.';
const labeled = wrapWithAILabel(content, 'ai_generated', 'markdown');

// Validate that content has proper labeling
const validation = validateAILabeling(content);
if (!validation.isLabeled) {
  console.warn('Content needs labeling:', validation.recommendations);
}
```

### Content Classifications

| Classification | Label | Use Case |
|---------------|-------|----------|
| `ai_generated` | ⚠️ AI-GENERATED CONTENT | Fully AI-created content |
| `ai_enhanced` | 🤖 AI-ENHANCED CONTENT | Human content improved by AI |
| `ai_summarized` | 📝 AI-SUMMARIZED FROM VERIFIED SOURCES | AI summaries of real sources |
| `theoretical` | 💡 THEORETICAL FRAMEWORK | Speculative content |
| `verified_source` | ✅ VERIFIED SOURCE | Direct from verified archives |
| `historical_fact` | 📚 HISTORICAL DOCUMENTATION | Documented historical info |

### Templates

Pre-built templates for common content types:

```typescript
import { renderTemplate } from '@chicago-forest/content-generator';

// Render a patent summary
const patentHtml = renderTemplate('patent_summary', {
  patentNumber: 'US645576A',
  title: 'System of Transmission of Electrical Energy',
  inventor: 'Nikola Tesla',
  filingDate: '1900-03-20',
  abstract: 'A system for transmitting electrical energy wirelessly...',
  keyInnovations: ['Wireless transmission', 'Earth resonance'],
}, 'html');

// Render a research paper abstract
const paperMarkdown = renderTemplate('paper_abstract', {
  doi: '10.1016/j.fusengdes.2015.06.030',
  title: 'LENR Research Progress',
  authors: ['Researcher A', 'Researcher B'],
  year: 2015,
  abstract: 'This paper reviews recent progress...',
}, 'markdown');

// Render a company profile
const companyProfile = renderTemplate('company_profile', {
  name: 'Brillouin Energy',
  website: 'https://brillouinenergy.com',
  focus: 'LENR technology',
  status: 'active',
  researchAreas: ['LENR', 'Heat generation'],
});
```

### Available Templates

- `patent_summary` - Patent documentation with key innovations
- `paper_abstract` - Research paper summaries with DOI links
- `company_profile` - Company profiles with status tracking
- `timeline_entry` - Historical timeline entries
- `source_card` - Source verification cards

### Content Generators

Generate structured content with automatic labeling:

```typescript
import {
  generateResearchTimeline,
  generateAbstract,
  generateKeywords,
  generateCrossReferences,
} from '@chicago-forest/content-generator';

// Generate a research timeline
const timeline = generateResearchTimeline('Nikola Tesla', [
  {
    date: '1856-07-10',
    title: 'Birth',
    description: 'Nikola Tesla born in Smiljan, Croatia',
    sources: ['https://teslauniverse.com/nikola-tesla/biography'],
  },
  // ... more events
]);

// Generate keywords from text
const keywords = generateKeywords(articleText, 10);

// Find cross-references between sources
const related = generateCrossReferences('source-1', allSources);
```

### Content Formatters

Format content for different outputs:

```typescript
import {
  formatAsMarkdown,
  formatAsHtml,
  formatAsPlaintext,
  addAiGeneratedLabel,
} from '@chicago-forest/content-generator';

const content = {
  title: 'Tesla Patent Summary',
  body: 'Analysis of patent US645576A...',
  sources: ['https://patents.google.com/patent/US645576A'],
  disclaimer: 'This is an AI-generated summary.',
};

const markdown = formatAsMarkdown(content, {
  includeDisclaimer: true,
  includeSourceLinks: true,
});
```

### Content Enrichers

Enrich existing content with metadata and links:

```typescript
import {
  enrichPatentReferences,
  enrichDOIReferences,
  addFreshnessIndicator,
} from '@chicago-forest/content-generator';

// Auto-link patent numbers
const enrichedPatents = enrichPatentReferences(
  'Tesla\'s patent US645576A describes...'
);
// Result: 'Tesla's patent [US645576A](https://patents.google.com/patent/US645576A) describes...'

// Auto-link DOIs
const enrichedDOIs = enrichDOIReferences(
  'See paper 10.1016/j.fusengdes.2015.06.030'
);

// Add freshness indicator
const withFreshness = addFreshnessIndicator(content, new Date('2024-01-15'));
// Adds: "🟢 Recently verified (1/15/2024)"
```

### Content Attestation

Create audit trails for generated content:

```typescript
import { createAttestation } from '@chicago-forest/content-generator';

const attestation = createAttestation(
  content,
  'ai_generated',
  ['https://patents.google.com/patent/US645576A']
);

console.log(attestation);
// {
//   contentHash: 'a1b2c3d4',
//   classification: 'ai_generated',
//   generatedAt: Date,
//   attestedBy: 'agent-12-scribe',
//   sourceRefs: [...],
//   verificationStatus: 'verified'
// }
```

## API Reference

### Labeling Module

| Function | Description |
|----------|-------------|
| `createAILabel(classification, options?)` | Create a content label |
| `wrapWithAILabel(content, classification, format)` | Wrap content with label |
| `validateAILabeling(content)` | Check if content is properly labeled |
| `batchLabel(items, format)` | Label multiple content items |
| `createAttestation(content, classification, sources)` | Create audit attestation |

### Templates Module

| Function | Description |
|----------|-------------|
| `renderTemplate(type, data, format)` | Render content using template |
| `patentSummaryTemplate` | Patent documentation template |
| `paperAbstractTemplate` | Research paper template |
| `companyProfileTemplate` | Company profile template |
| `timelineEntryTemplate` | Timeline entry template |
| `sourceCardTemplate` | Source verification template |

### Generators Module

| Function | Description |
|----------|-------------|
| `generateResearchTimeline(researcher, events)` | Generate timeline |
| `generateAbstract(text, maxLength)` | Generate abstract |
| `generateKeywords(text, count)` | Extract keywords |
| `generateCrossReferences(sourceId, allSources)` | Find related sources |

### Formatters Module

| Function | Description |
|----------|-------------|
| `formatAsMarkdown(content, options)` | Format as Markdown |
| `formatAsHtml(content, options)` | Format as HTML |
| `formatAsPlaintext(content, options)` | Format as plain text |
| `addAiGeneratedLabel(content)` | Add AI label to content |

### Enrichers Module

| Function | Description |
|----------|-------------|
| `enrichPatentReferences(content)` | Auto-link patent numbers |
| `enrichDOIReferences(content)` | Auto-link DOI references |
| `addFreshnessIndicator(content, lastVerified)` | Add verification status |
| `enrichWithMetadata(content, metadata)` | Add metadata block |
| `enrichWithSourceLinks(content, sources)` | Add source links |

## Testing

```bash
pnpm test
```

## Dependencies

- `@chicago-forest/tesla-archive` - Tesla patent data
- `@chicago-forest/lenr-database` - LENR research data
- `@chicago-forest/source-verifier` - Source verification

## Related Agents

- **Agent 5: Archivist** - Historical research documentation
- **Agent 11: Verifier** - Source verification
- **Agent 13: Compliance** - Content compliance checking
- **Agent 14: Prophet** - Documentation automation

## License

MIT - Part of the Chicago Forest Network theoretical framework.

---

**⚠️ AI-GENERATED CONTENT NOTICE**

This package and its documentation are part of an AI-generated theoretical framework. The Chicago Forest Network is a conceptual exploration of decentralized energy systems, inspired by the historical research of Tesla, Mallove, and others. All content generated by this package is clearly labeled to maintain transparency and honesty.
