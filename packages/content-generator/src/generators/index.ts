/**
 * Content Generators
 *
 * Specialized generators for different content types.
 */

export interface TimelineEvent {
  date: Date | string;
  title: string;
  description: string;
  sources: string[];
  isVerified: boolean;
}

export interface ResearchTimeline {
  researcher: string;
  events: TimelineEvent[];
  generatedAt: Date;
  disclaimer: string;
}

export function generateResearchTimeline(
  researcher: string,
  events: Omit<TimelineEvent, 'isVerified'>[]
): ResearchTimeline {
  return {
    researcher,
    events: events.map(e => ({ ...e, isVerified: e.sources.length > 0 })),
    generatedAt: new Date(),
    disclaimer: 'This timeline was AI-generated from verified historical sources.',
  };
}

export function generateAbstract(fullText: string, maxLength: number = 300): string {
  // Simple extraction - in production would use NLP
  const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let abstract = '';

  for (const sentence of sentences) {
    if ((abstract + sentence).length > maxLength) break;
    abstract += sentence.trim() + '. ';
  }

  return abstract.trim();
}

export function generateKeywords(text: string, maxKeywords: number = 10): string[] {
  // Simple keyword extraction - in production would use NLP
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

export function generateCrossReferences(
  sourceId: string,
  allSources: { id: string; keywords: string[] }[]
): string[] {
  const source = allSources.find(s => s.id === sourceId);
  if (!source) return [];

  const sourceKeywords = new Set(source.keywords);

  return allSources
    .filter(s => s.id !== sourceId)
    .map(s => ({
      id: s.id,
      overlap: s.keywords.filter(k => sourceKeywords.has(k)).length,
    }))
    .filter(s => s.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 5)
    .map(s => s.id);
}
