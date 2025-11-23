/**
 * Newsletter Generator
 *
 * Generate community newsletters from commits, releases, and contributions.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for the Chicago Plasma Forest Network.
 */

export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: Date;
  files: string[];
}

export interface Release {
  tag: string;
  name: string;
  body: string;
  publishedAt: Date;
  author: string;
}

export interface NewsletterSection {
  title: string;
  content: string;
  priority: number;
}

export interface NewsletterConfig {
  projectName: string;
  period: {
    start: Date;
    end: Date;
  };
  includeContributorSpotlight: boolean;
  includeUpcomingWork: boolean;
  maxHighlights: number;
}

export interface Newsletter {
  title: string;
  date: Date;
  sections: NewsletterSection[];
  footer: string;
}

/**
 * Categorize commits by type based on conventional commit prefixes
 */
export function categorizeCommits(
  commits: Commit[]
): Map<string, Commit[]> {
  const categories = new Map<string, Commit[]>();

  for (const commit of commits) {
    const match = commit.message.match(/^(feat|fix|docs|test|refactor|chore|perf)\(?/i);
    const category = match ? match[1].toLowerCase() : 'other';

    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(commit);
  }

  return categories;
}

/**
 * Extract agent-related changes from commits
 */
export function extractAgentChanges(
  commits: Commit[]
): Map<number, { commits: Commit[]; summary: string }> {
  const agentChanges = new Map<number, { commits: Commit[]; summary: string }>();

  const agentPatterns = [
    { id: 1, pattern: /mycelium|mycelia/i, name: 'Mycelia (Core Network)' },
    { id: 2, pattern: /rhizome|spore/i, name: 'Rhizome (Propagation)' },
    { id: 3, pattern: /symbiont|symbiosis/i, name: 'Symbiont (Federation)' },
    { id: 4, pattern: /sentinel|security|firewall/i, name: 'Sentinel (Security)' },
    { id: 5, pattern: /tesla|lenr|archivist/i, name: 'Archivist (Research)' },
    { id: 6, pattern: /beacon|hardware|deploy/i, name: 'Beacon (Hardware)' },
    { id: 7, pattern: /nexus|api|canopy/i, name: 'Nexus (API)' },
    { id: 8, pattern: /delegate|governance|hive/i, name: 'Delegate (Governance)' },
    { id: 9, pattern: /weaver|test/i, name: 'Weaver (Testing)' },
    { id: 10, pattern: /oracle|web|research/i, name: 'Oracle (Web)' },
    { id: 11, pattern: /verifier|source/i, name: 'Verifier (Sources)' },
    { id: 12, pattern: /scribe|content/i, name: 'Scribe (Content)' },
    { id: 13, pattern: /compliance|disclaimer/i, name: 'Compliance (Accuracy)' },
    { id: 14, pattern: /prophet|doc-gen/i, name: 'Prophet (Docs)' },
    { id: 15, pattern: /simulator/i, name: 'Simulator (Network Sim)' },
    { id: 16, pattern: /auditor/i, name: 'Auditor (Security Audit)' },
    { id: 17, pattern: /ambassador|community/i, name: 'Ambassador (Community)' },
    { id: 18, pattern: /synchronizer|sync/i, name: 'Synchronizer (Data Sync)' },
    { id: 19, pattern: /benchmarker|performance/i, name: 'Benchmarker (Perf)' },
    { id: 20, pattern: /validator|ecosystem/i, name: 'Validator (Ecosystem)' },
  ];

  for (const commit of commits) {
    const content = commit.message + ' ' + commit.files.join(' ');
    for (const { id, pattern, name } of agentPatterns) {
      if (pattern.test(content)) {
        if (!agentChanges.has(id)) {
          agentChanges.set(id, { commits: [], summary: name });
        }
        agentChanges.get(id)!.commits.push(commit);
        break; // Assign to first matching agent only
      }
    }
  }

  return agentChanges;
}

/**
 * Generate newsletter from commits and releases
 */
export function generateNewsletter(
  commits: Commit[],
  releases: Release[],
  contributors: string[],
  config: NewsletterConfig
): Newsletter {
  const sections: NewsletterSection[] = [];

  // Header section
  sections.push({
    title: 'Overview',
    content: generateOverviewSection(commits, releases, contributors, config),
    priority: 1,
  });

  // Releases section
  if (releases.length > 0) {
    sections.push({
      title: 'Releases',
      content: generateReleasesSection(releases),
      priority: 2,
    });
  }

  // Highlights section
  const categorized = categorizeCommits(commits);
  const features = categorized.get('feat') || [];
  const fixes = categorized.get('fix') || [];

  if (features.length > 0) {
    sections.push({
      title: 'New Features',
      content: generateFeatureSection(features.slice(0, config.maxHighlights)),
      priority: 3,
    });
  }

  if (fixes.length > 0) {
    sections.push({
      title: 'Bug Fixes',
      content: generateFixSection(fixes.slice(0, config.maxHighlights)),
      priority: 4,
    });
  }

  // Agent activity section
  const agentChanges = extractAgentChanges(commits);
  if (agentChanges.size > 0) {
    sections.push({
      title: 'Agent Activity',
      content: generateAgentActivitySection(agentChanges),
      priority: 5,
    });
  }

  // Contributor spotlight
  if (config.includeContributorSpotlight && contributors.length > 0) {
    sections.push({
      title: 'Contributor Spotlight',
      content: generateContributorSpotlight(commits, contributors),
      priority: 6,
    });
  }

  return {
    title: `${config.projectName} Newsletter - ${formatDate(config.period.end)}`,
    date: config.period.end,
    sections: sections.sort((a, b) => a.priority - b.priority),
    footer: generateFooter(),
  };
}

function generateOverviewSection(
  commits: Commit[],
  releases: Release[],
  contributors: string[],
  config: NewsletterConfig
): string {
  const days = Math.ceil(
    (config.period.end.getTime() - config.period.start.getTime()) / (1000 * 60 * 60 * 24)
  );

  return `
This newsletter covers ${days} days of activity on the Chicago Forest Network.

**Summary:**
- ${commits.length} commits
- ${releases.length} releases
- ${contributors.length} contributors

---
*This is part of an AI-generated theoretical framework for decentralized energy networks.*
  `.trim();
}

function generateReleasesSection(releases: Release[]): string {
  const lines: string[] = [];

  for (const release of releases) {
    lines.push(`### ${release.name} (${release.tag})`);
    lines.push(`Released by @${release.author} on ${formatDate(release.publishedAt)}`);
    lines.push('');
    lines.push(release.body.slice(0, 500) + (release.body.length > 500 ? '...' : ''));
    lines.push('');
  }

  return lines.join('\n');
}

function generateFeatureSection(features: Commit[]): string {
  const lines: string[] = [];

  for (const commit of features) {
    const title = commit.message.replace(/^feat(\([^)]+\))?:\s*/i, '');
    lines.push(`- **${title}** by @${commit.author}`);
  }

  return lines.join('\n');
}

function generateFixSection(fixes: Commit[]): string {
  const lines: string[] = [];

  for (const commit of fixes) {
    const title = commit.message.replace(/^fix(\([^)]+\))?:\s*/i, '');
    lines.push(`- ${title} by @${commit.author}`);
  }

  return lines.join('\n');
}

function generateAgentActivitySection(
  agentChanges: Map<number, { commits: Commit[]; summary: string }>
): string {
  const lines: string[] = [
    'Activity across the 20-agent ecosystem:',
    '',
  ];

  const sorted = Array.from(agentChanges.entries())
    .sort((a, b) => b[1].commits.length - a[1].commits.length);

  for (const [id, { commits, summary }] of sorted) {
    lines.push(`- **Agent ${id}: ${summary}** - ${commits.length} commits`);
  }

  return lines.join('\n');
}

function generateContributorSpotlight(commits: Commit[], contributors: string[]): string {
  // Count commits per contributor
  const counts = new Map<string, number>();
  for (const commit of commits) {
    counts.set(commit.author, (counts.get(commit.author) || 0) + 1);
  }

  // Sort by commit count
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const lines: string[] = ['Top contributors this period:', ''];

  for (const [author, count] of sorted) {
    lines.push(`- @${author}: ${count} commits`);
  }

  return lines.join('\n');
}

function generateFooter(): string {
  return `
---

**Chicago Forest Network** - *Documenting real research, envisioning sustainable futures*

This newsletter is auto-generated by Agent 17 (Ambassador).
For more information, see our [GitHub repository](https://github.com/vespo92/ChicagoForest.net).

*DISCLAIMER: The Chicago Plasma Forest Network is an AI-generated theoretical framework.
It documents REAL historical research while creating speculative visions of decentralized energy.*
  `.trim();
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Render newsletter to Markdown
 */
export function renderNewsletter(newsletter: Newsletter): string {
  const lines: string[] = [
    `# ${newsletter.title}`,
    '',
    `*Published: ${formatDate(newsletter.date)}*`,
    '',
    '---',
    '',
  ];

  for (const section of newsletter.sections) {
    lines.push(`## ${section.title}`);
    lines.push('');
    lines.push(section.content);
    lines.push('');
  }

  lines.push(newsletter.footer);

  return lines.join('\n');
}
