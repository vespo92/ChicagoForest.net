/**
 * Content Enrichers
 *
 * Enrich existing content with additional metadata and cross-references.
 */

export interface EnrichmentResult {
  original: string;
  enriched: string;
  addedMetadata: Record<string, unknown>;
  linkedSources: string[];
}

export function enrichWithMetadata(
  content: string,
  metadata: Record<string, unknown>
): EnrichmentResult {
  const metadataBlock = Object.entries(metadata)
    .map(([key, value]) => `- **${key}**: ${value}`)
    .join('\n');

  return {
    original: content,
    enriched: `## Metadata\n\n${metadataBlock}\n\n---\n\n${content}`,
    addedMetadata: metadata,
    linkedSources: [],
  };
}

export function enrichWithSourceLinks(
  content: string,
  sources: { pattern: RegExp; url: string }[]
): EnrichmentResult {
  let enriched = content;
  const linkedSources: string[] = [];

  for (const { pattern, url } of sources) {
    if (pattern.test(enriched)) {
      enriched = enriched.replace(pattern, `[$&](${url})`);
      linkedSources.push(url);
    }
  }

  return {
    original: content,
    enriched,
    addedMetadata: {},
    linkedSources,
  };
}

export function enrichPatentReferences(content: string): EnrichmentResult {
  const patentPattern = /US\d{6,}[A-Z]?\d?/g;
  const matches = content.match(patentPattern) || [];
  let enriched = content;
  const linkedSources: string[] = [];

  for (const patent of new Set(matches)) {
    const url = `https://patents.google.com/patent/${patent}`;
    enriched = enriched.replace(
      new RegExp(patent, 'g'),
      `[${patent}](${url})`
    );
    linkedSources.push(url);
  }

  return {
    original: content,
    enriched,
    addedMetadata: { patentCount: matches.length },
    linkedSources,
  };
}

export function enrichDOIReferences(content: string): EnrichmentResult {
  const doiPattern = /10\.\d{4,}\/[^\s]+/g;
  const matches = content.match(doiPattern) || [];
  let enriched = content;
  const linkedSources: string[] = [];

  for (const doi of new Set(matches)) {
    const url = `https://doi.org/${doi}`;
    enriched = enriched.replace(
      new RegExp(doi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      `[${doi}](${url})`
    );
    linkedSources.push(url);
  }

  return {
    original: content,
    enriched,
    addedMetadata: { doiCount: matches.length },
    linkedSources,
  };
}

export function addFreshnessIndicator(
  content: string,
  lastVerified: Date
): EnrichmentResult {
  const daysSinceVerification = Math.floor(
    (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60 * 24)
  );

  let freshnessLabel: string;
  if (daysSinceVerification < 7) {
    freshnessLabel = '🟢 Recently verified';
  } else if (daysSinceVerification < 30) {
    freshnessLabel = '🟡 Verified this month';
  } else {
    freshnessLabel = '🔴 Needs re-verification';
  }

  return {
    original: content,
    enriched: `${freshnessLabel} (${lastVerified.toLocaleDateString()})\n\n${content}`,
    addedMetadata: { daysSinceVerification, freshnessLabel },
    linkedSources: [],
  };
}
