/**
 * AI Labeling System
 *
 * Agent 12: Scribe - Core AI content labeling functionality
 *
 * CRITICAL: This system ensures ALL AI-generated content is properly labeled
 * per CLAUDE.md requirements for transparency and honesty.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

/**
 * Content classification types for transparency labeling
 */
export type ContentClassification =
  | 'ai_generated'        // Fully AI-generated content
  | 'ai_enhanced'         // Human content enhanced by AI
  | 'ai_summarized'       // AI summary of verified sources
  | 'human_authored'      // Pure human content
  | 'verified_source'     // Direct quotes/data from verified sources
  | 'theoretical'         // Speculative/theoretical content
  | 'historical_fact';    // Documented historical information

/**
 * Label severity levels
 */
export type LabelSeverity = 'info' | 'warning' | 'critical';

/**
 * Complete AI content label with metadata
 */
export interface AIContentLabel {
  classification: ContentClassification;
  severity: LabelSeverity;
  generatedAt: Date;
  model?: string;
  confidence?: number;
  disclaimer: string;
  shortLabel: string;
  fullLabel: string;
  htmlLabel: string;
  markdownLabel: string;
}

/**
 * Standard labels used throughout the Chicago Forest Network
 */
export const STANDARD_LABELS = {
  AI_GENERATED: '⚠️ AI-GENERATED CONTENT',
  AI_ENHANCED: '🤖 AI-ENHANCED CONTENT',
  AI_SUMMARIZED: '📝 AI-SUMMARIZED FROM VERIFIED SOURCES',
  THEORETICAL: '💡 THEORETICAL FRAMEWORK',
  VERIFIED_SOURCE: '✅ VERIFIED SOURCE',
  HISTORICAL_FACT: '📚 HISTORICAL DOCUMENTATION',
  NEEDS_VERIFICATION: '❓ NEEDS VERIFICATION',
} as const;

/**
 * Standard disclaimers for different content types
 */
export const DISCLAIMERS = {
  ai_generated: `
This content was generated using AI assistance as part of the Chicago Forest Network
theoretical framework. While based on verified historical sources, the synthesis,
analysis, and conclusions should be considered AI-generated interpretation.
Always verify original sources for critical research purposes.
  `.trim(),

  ai_enhanced: `
This content combines human-authored material with AI-assisted enhancements.
AI was used to improve clarity, add context, or expand on existing content.
Original source material has been preserved where possible.
  `.trim(),

  ai_summarized: `
This is an AI-generated summary of verified source material. The original sources
have been validated and links are provided. For academic or research purposes,
please consult the original documents directly.
  `.trim(),

  theoretical: `
This content describes a THEORETICAL framework and does not represent operational
technology or proven scientific claims. The Chicago Forest Network is a conceptual
exploration of possible future energy systems, inspired by historical research.
  `.trim(),

  verified_source: `
This content is directly sourced from verified archives, patents, or academic
publications. Links to original sources are provided for verification.
  `.trim(),

  historical_fact: `
This content documents historical events, research, and publications. While
care has been taken to ensure accuracy, readers are encouraged to verify
through the provided primary sources.
  `.trim(),
} as const;

/**
 * Creates a comprehensive AI content label
 */
export function createAILabel(
  classification: ContentClassification,
  options: {
    model?: string;
    confidence?: number;
    customDisclaimer?: string;
  } = {}
): AIContentLabel {
  const disclaimer = options.customDisclaimer || DISCLAIMERS[classification] || DISCLAIMERS.ai_generated;
  const shortLabel = getShortLabel(classification);
  const severity = getSeverity(classification);

  return {
    classification,
    severity,
    generatedAt: new Date(),
    model: options.model,
    confidence: options.confidence,
    disclaimer,
    shortLabel,
    fullLabel: `${shortLabel}\n\n${disclaimer}`,
    htmlLabel: createHtmlLabel(shortLabel, disclaimer, severity),
    markdownLabel: createMarkdownLabel(shortLabel, disclaimer, severity),
  };
}

/**
 * Gets the short label for a classification
 */
function getShortLabel(classification: ContentClassification): string {
  switch (classification) {
    case 'ai_generated':
      return STANDARD_LABELS.AI_GENERATED;
    case 'ai_enhanced':
      return STANDARD_LABELS.AI_ENHANCED;
    case 'ai_summarized':
      return STANDARD_LABELS.AI_SUMMARIZED;
    case 'theoretical':
      return STANDARD_LABELS.THEORETICAL;
    case 'verified_source':
      return STANDARD_LABELS.VERIFIED_SOURCE;
    case 'historical_fact':
      return STANDARD_LABELS.HISTORICAL_FACT;
    case 'human_authored':
      return '✍️ HUMAN-AUTHORED CONTENT';
    default:
      return STANDARD_LABELS.NEEDS_VERIFICATION;
  }
}

/**
 * Determines severity level based on classification
 */
function getSeverity(classification: ContentClassification): LabelSeverity {
  switch (classification) {
    case 'ai_generated':
    case 'theoretical':
      return 'warning';
    case 'ai_enhanced':
    case 'ai_summarized':
      return 'info';
    case 'verified_source':
    case 'historical_fact':
    case 'human_authored':
      return 'info';
    default:
      return 'critical';
  }
}

/**
 * Creates an HTML label element
 */
function createHtmlLabel(
  shortLabel: string,
  disclaimer: string,
  severity: LabelSeverity
): string {
  const bgColor = severity === 'warning' ? '#fff3cd' :
                  severity === 'critical' ? '#f8d7da' : '#cce5ff';
  const borderColor = severity === 'warning' ? '#ffc107' :
                      severity === 'critical' ? '#dc3545' : '#0d6efd';

  return `
<aside class="ai-content-label" style="
  background-color: ${bgColor};
  border-left: 4px solid ${borderColor};
  padding: 12px 16px;
  margin: 16px 0;
  font-family: system-ui, sans-serif;
">
  <strong style="display: block; margin-bottom: 8px;">${shortLabel}</strong>
  <p style="margin: 0; font-size: 0.9em; color: #333;">${disclaimer}</p>
</aside>
  `.trim();
}

/**
 * Creates a Markdown label block
 */
function createMarkdownLabel(
  shortLabel: string,
  disclaimer: string,
  severity: LabelSeverity
): string {
  const prefix = severity === 'warning' ? '> ⚠️' :
                 severity === 'critical' ? '> 🚨' : '> ℹ️';

  const lines = disclaimer.split('\n').map(line => `> ${line.trim()}`).join('\n');

  return `
${prefix} **${shortLabel}**
>
${lines}
  `.trim();
}

/**
 * Wraps content with appropriate AI label
 */
export function wrapWithAILabel(
  content: string,
  classification: ContentClassification,
  format: 'markdown' | 'html' | 'plaintext' = 'markdown',
  options: { model?: string; confidence?: number } = {}
): string {
  const label = createAILabel(classification, options);

  switch (format) {
    case 'html':
      return `${label.htmlLabel}\n\n${content}`;
    case 'markdown':
      return `${label.markdownLabel}\n\n---\n\n${content}`;
    case 'plaintext':
    default:
      return `${label.shortLabel}\n\n${label.disclaimer}\n\n---\n\n${content}`;
  }
}

/**
 * Validates that content has proper AI labeling
 */
export function validateAILabeling(content: string): {
  isLabeled: boolean;
  detectedLabels: string[];
  missingDisclaimer: boolean;
  recommendations: string[];
} {
  const detectedLabels: string[] = [];
  const recommendations: string[] = [];

  // Check for standard labels
  for (const [key, label] of Object.entries(STANDARD_LABELS)) {
    if (content.includes(label)) {
      detectedLabels.push(key);
    }
  }

  // Check for disclaimer presence
  const hasDisclaimer = content.toLowerCase().includes('disclaimer') ||
                        content.includes('AI-generated') ||
                        content.includes('theoretical framework') ||
                        content.includes('verified source');

  const isLabeled = detectedLabels.length > 0;

  if (!isLabeled) {
    recommendations.push('Add an AI content label to indicate content origin');
  }

  if (!hasDisclaimer && detectedLabels.some(l =>
    ['AI_GENERATED', 'AI_ENHANCED', 'AI_SUMMARIZED', 'THEORETICAL'].includes(l)
  )) {
    recommendations.push('Add a disclaimer explaining the AI-generated nature of the content');
  }

  return {
    isLabeled,
    detectedLabels,
    missingDisclaimer: !hasDisclaimer && detectedLabels.length > 0,
    recommendations,
  };
}

/**
 * Batch label multiple content items
 */
export function batchLabel(
  items: Array<{ content: string; classification: ContentClassification }>,
  format: 'markdown' | 'html' | 'plaintext' = 'markdown'
): Array<{ original: string; labeled: string; label: AIContentLabel }> {
  return items.map(item => {
    const label = createAILabel(item.classification);
    const labeled = wrapWithAILabel(item.content, item.classification, format);
    return { original: item.content, labeled, label };
  });
}

/**
 * Creates a content attestation for audit purposes
 */
export interface ContentAttestation {
  contentHash: string;
  classification: ContentClassification;
  generatedAt: Date;
  attestedBy: string;
  sourceRefs: string[];
  verificationStatus: 'verified' | 'pending' | 'failed';
}

export function createAttestation(
  content: string,
  classification: ContentClassification,
  sourceRefs: string[]
): ContentAttestation {
  // Simple hash for demo - in production would use crypto
  const contentHash = simpleHash(content);

  return {
    contentHash,
    classification,
    generatedAt: new Date(),
    attestedBy: 'agent-12-scribe',
    sourceRefs,
    verificationStatus: sourceRefs.length > 0 ? 'verified' : 'pending',
  };
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
