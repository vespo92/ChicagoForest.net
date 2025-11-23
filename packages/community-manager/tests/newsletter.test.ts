/**
 * Newsletter Generator Tests
 * Agent 17: Ambassador - Community Manager
 */
import { describe, it, expect } from 'vitest';
import {
  categorizeCommits,
  extractAgentChanges,
  generateNewsletter,
  renderNewsletter,
  Commit,
  Release,
  NewsletterConfig,
} from '../src/newsletter';

describe('categorizeCommits', () => {
  const commits: Commit[] = [
    { sha: 'a1', message: 'feat: Add new feature', author: 'alice', date: new Date(), files: [] },
    { sha: 'a2', message: 'fix: Fix bug', author: 'bob', date: new Date(), files: [] },
    { sha: 'a3', message: 'docs: Update README', author: 'charlie', date: new Date(), files: [] },
    { sha: 'a4', message: 'test: Add unit tests', author: 'alice', date: new Date(), files: [] },
    { sha: 'a5', message: 'refactor: Clean up code', author: 'bob', date: new Date(), files: [] },
    { sha: 'a6', message: 'Random commit message', author: 'charlie', date: new Date(), files: [] },
  ];

  it('should categorize commits by type', () => {
    const categories = categorizeCommits(commits);

    expect(categories.get('feat')?.length).toBe(1);
    expect(categories.get('fix')?.length).toBe(1);
    expect(categories.get('docs')?.length).toBe(1);
    expect(categories.get('test')?.length).toBe(1);
    expect(categories.get('refactor')?.length).toBe(1);
  });

  it('should put non-conventional commits in other', () => {
    const categories = categorizeCommits(commits);
    expect(categories.get('other')?.length).toBe(1);
  });

  it('should handle empty commit list', () => {
    const categories = categorizeCommits([]);
    expect(categories.size).toBe(0);
  });

  it('should handle parenthesized scopes', () => {
    const scopedCommits: Commit[] = [
      { sha: 'b1', message: 'feat(api): Add endpoint', author: 'alice', date: new Date(), files: [] },
      { sha: 'b2', message: 'fix(auth): Fix login', author: 'bob', date: new Date(), files: [] },
    ];

    const categories = categorizeCommits(scopedCommits);
    expect(categories.get('feat')?.length).toBe(1);
    expect(categories.get('fix')?.length).toBe(1);
  });
});

describe('extractAgentChanges', () => {
  it('should extract Tesla archive changes', () => {
    const commits: Commit[] = [
      { sha: 'c1', message: 'feat: Add Tesla patent', author: 'alice', date: new Date(), files: ['packages/tesla-archive/src/patents.ts'] },
    ];

    const changes = extractAgentChanges(commits);
    expect(changes.has(5)).toBe(true);
    expect(changes.get(5)?.commits.length).toBe(1);
  });

  it('should extract mycelium core changes', () => {
    const commits: Commit[] = [
      { sha: 'c2', message: 'feat: Update mycelium topology', author: 'bob', date: new Date(), files: ['packages/mycelium-core/src/index.ts'] },
    ];

    const changes = extractAgentChanges(commits);
    expect(changes.has(1)).toBe(true);
  });

  it('should extract sentinel security changes', () => {
    const commits: Commit[] = [
      { sha: 'c3', message: 'fix: Security patch', author: 'charlie', date: new Date(), files: ['packages/sentinel/src/crypto.ts'] },
    ];

    const changes = extractAgentChanges(commits);
    expect(changes.has(4)).toBe(true);
  });

  it('should handle commits matching no agent', () => {
    const commits: Commit[] = [
      { sha: 'c4', message: 'chore: Update package.json', author: 'alice', date: new Date(), files: ['package.json'] },
    ];

    const changes = extractAgentChanges(commits);
    expect(changes.size).toBe(0);
  });

  it('should assign commit to first matching agent only', () => {
    const commits: Commit[] = [
      { sha: 'c5', message: 'feat: Tesla and security', author: 'alice', date: new Date(), files: [] },
    ];

    const changes = extractAgentChanges(commits);
    // Should match Tesla (agent 5) first due to order in patterns
    expect(changes.size).toBe(1);
  });
});

describe('generateNewsletter', () => {
  const config: NewsletterConfig = {
    projectName: 'Chicago Forest Network',
    period: {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    },
    includeContributorSpotlight: true,
    includeUpcomingWork: true,
    maxHighlights: 5,
  };

  const commits: Commit[] = [
    { sha: 'd1', message: 'feat: New feature A', author: 'alice', date: new Date(), files: [] },
    { sha: 'd2', message: 'feat: New feature B', author: 'bob', date: new Date(), files: [] },
    { sha: 'd3', message: 'fix: Bug fix', author: 'alice', date: new Date(), files: [] },
  ];

  const releases: Release[] = [
    { tag: 'v1.0.0', name: 'Version 1.0.0', body: 'First release', publishedAt: new Date(), author: 'alice' },
  ];

  const contributors = ['alice', 'bob'];

  it('should generate newsletter with correct title', () => {
    const newsletter = generateNewsletter(commits, releases, contributors, config);
    expect(newsletter.title).toContain('Chicago Forest Network');
    expect(newsletter.title).toContain('Newsletter');
  });

  it('should include overview section', () => {
    const newsletter = generateNewsletter(commits, releases, contributors, config);
    const overview = newsletter.sections.find(s => s.title === 'Overview');
    expect(overview).toBeDefined();
    expect(overview?.content).toContain('commits');
  });

  it('should include releases section when releases exist', () => {
    const newsletter = generateNewsletter(commits, releases, contributors, config);
    const releasesSection = newsletter.sections.find(s => s.title === 'Releases');
    expect(releasesSection).toBeDefined();
    expect(releasesSection?.content).toContain('v1.0.0');
  });

  it('should include features section', () => {
    const newsletter = generateNewsletter(commits, releases, contributors, config);
    const features = newsletter.sections.find(s => s.title === 'New Features');
    expect(features).toBeDefined();
  });

  it('should include bug fixes section', () => {
    const newsletter = generateNewsletter(commits, releases, contributors, config);
    const fixes = newsletter.sections.find(s => s.title === 'Bug Fixes');
    expect(fixes).toBeDefined();
  });

  it('should include contributor spotlight when enabled', () => {
    const newsletter = generateNewsletter(commits, releases, contributors, config);
    const spotlight = newsletter.sections.find(s => s.title === 'Contributor Spotlight');
    expect(spotlight).toBeDefined();
  });

  it('should sort sections by priority', () => {
    const newsletter = generateNewsletter(commits, releases, contributors, config);
    const priorities = newsletter.sections.map(s => s.priority);
    const sorted = [...priorities].sort((a, b) => a - b);
    expect(priorities).toEqual(sorted);
  });

  it('should include footer with disclaimer', () => {
    const newsletter = generateNewsletter(commits, releases, contributors, config);
    expect(newsletter.footer).toContain('DISCLAIMER');
    expect(newsletter.footer).toContain('AI-generated');
  });
});

describe('renderNewsletter', () => {
  it('should render newsletter to markdown', () => {
    const newsletter = {
      title: 'Test Newsletter',
      date: new Date('2024-01-31'),
      sections: [
        { title: 'Section 1', content: 'Content 1', priority: 1 },
        { title: 'Section 2', content: 'Content 2', priority: 2 },
      ],
      footer: 'Test footer',
    };

    const markdown = renderNewsletter(newsletter);

    expect(markdown).toContain('# Test Newsletter');
    expect(markdown).toContain('## Section 1');
    expect(markdown).toContain('Content 1');
    expect(markdown).toContain('## Section 2');
    expect(markdown).toContain('Content 2');
    expect(markdown).toContain('Test footer');
  });

  it('should include publication date', () => {
    const newsletter = {
      title: 'Test Newsletter',
      date: new Date('2024-01-31'),
      sections: [],
      footer: '',
    };

    const markdown = renderNewsletter(newsletter);
    expect(markdown).toContain('2024-01-31');
  });
});
