/**
 * Content Formatters
 *
 * Format content for different output targets.
 */

export type OutputFormat = 'markdown' | 'html' | 'plaintext' | 'json';

export interface FormatterOptions {
  includeDisclaimer: boolean;
  includeSourceLinks: boolean;
  includeMetadata: boolean;
}

const defaultOptions: FormatterOptions = {
  includeDisclaimer: true,
  includeSourceLinks: true,
  includeMetadata: true,
};

export function formatAsMarkdown(
  content: { title: string; body: string; sources: string[]; disclaimer?: string },
  options: Partial<FormatterOptions> = {}
): string {
  const opts = { ...defaultOptions, ...options };
  const lines: string[] = [];

  if (opts.includeDisclaimer && content.disclaimer) {
    lines.push('> ⚠️ **DISCLAIMER**');
    lines.push(`> ${content.disclaimer}`);
    lines.push('');
  }

  lines.push(`# ${content.title}`);
  lines.push('');
  lines.push(content.body);

  if (opts.includeSourceLinks && content.sources.length > 0) {
    lines.push('');
    lines.push('## Sources');
    lines.push('');
    content.sources.forEach((source, i) => {
      lines.push(`${i + 1}. [${source}](${source})`);
    });
  }

  return lines.join('\n');
}

export function formatAsHtml(
  content: { title: string; body: string; sources: string[]; disclaimer?: string },
  options: Partial<FormatterOptions> = {}
): string {
  const opts = { ...defaultOptions, ...options };

  let html = '';

  if (opts.includeDisclaimer && content.disclaimer) {
    html += `<aside class="disclaimer"><strong>⚠️ DISCLAIMER:</strong> ${content.disclaimer}</aside>`;
  }

  html += `<article>`;
  html += `<h1>${content.title}</h1>`;
  html += `<div class="content">${content.body}</div>`;

  if (opts.includeSourceLinks && content.sources.length > 0) {
    html += `<section class="sources"><h2>Sources</h2><ol>`;
    content.sources.forEach(source => {
      html += `<li><a href="${source}" target="_blank" rel="noopener">${source}</a></li>`;
    });
    html += `</ol></section>`;
  }

  html += `</article>`;

  return html;
}

export function formatAsPlaintext(
  content: { title: string; body: string; sources: string[]; disclaimer?: string },
  options: Partial<FormatterOptions> = {}
): string {
  const opts = { ...defaultOptions, ...options };
  const lines: string[] = [];

  if (opts.includeDisclaimer && content.disclaimer) {
    lines.push('DISCLAIMER: ' + content.disclaimer);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push(content.title.toUpperCase());
  lines.push('='.repeat(content.title.length));
  lines.push('');
  lines.push(content.body);

  if (opts.includeSourceLinks && content.sources.length > 0) {
    lines.push('');
    lines.push('SOURCES:');
    content.sources.forEach((source, i) => {
      lines.push(`  ${i + 1}. ${source}`);
    });
  }

  return lines.join('\n');
}

export function addAiGeneratedLabel(content: string): string {
  return `⚠️ AI-GENERATED CONTENT\n\n${content}`;
}
