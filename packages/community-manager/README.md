# @chicago-forest/community-manager

**Agent 17: Ambassador** - Community Management & Onboarding

Part of the Chicago Plasma Forest Network ecosystem.

## Disclaimer

> **IMPORTANT:** This package is part of an AI-generated theoretical framework for the Chicago Plasma Forest Network. It provides tools for community management and contributor onboarding for this open-source project. The Chicago Forest Network itself is a conceptual framework documenting real historical research while envisioning future possibilities for decentralized energy.

## Overview

The Community Manager package automates contributor onboarding, issue triage, PR validation, and community engagement workflows for the Chicago Forest Network ecosystem.

### Features

- **Issue Triage** - Automatic categorization and routing of GitHub issues
- **PR Validation** - Verify PRs against agent file ownership rules
- **Contributor Onboarding** - Welcome messages and onboarding checklists
- **Community Metrics** - Track and report on community health
- **Newsletter Generation** - Generate community newsletters from commits
- **Discussion Summarization** - Analyze and summarize GitHub discussions

## Installation

```bash
pnpm add @chicago-forest/community-manager
```

## Usage

### Issue Triage

```typescript
import { applyTriageRules, defaultRules } from '@chicago-forest/community-manager/triage';

const result = applyTriageRules(
  'Bug: Tesla archive not loading',
  'The patents page throws an error',
  defaultRules
);

console.log(result.labels);    // ['bug', 'needs-investigation', 'agent-5-archivist', 'research']
console.log(result.priority);  // 'high'
```

### PR Validation

```typescript
import { CommunityManager } from '@chicago-forest/community-manager';

const manager = new CommunityManager();

const validation = manager.validatePR({
  id: 123,
  title: 'Update Tesla archive',
  body: 'Add new patents',
  author: 'contributor',
  changedFiles: ['packages/tesla-archive/src/patents.ts'],
  additions: 50,
  deletions: 10,
  labels: [],
});

console.log(validation.owningAgent); // 5 (Archivist)
console.log(validation.valid);       // true
```

### Contributor Onboarding

```typescript
import { generateOnboardingChecklist, detectFirstTimeContributor } from '@chicago-forest/community-manager/onboarding';

const isNewContributor = detectFirstTimeContributor('newuser', existingContributors);

if (isNewContributor) {
  const checklist = generateOnboardingChecklist('newuser');
  // Post as a comment on their first PR
}
```

### Community Metrics

```typescript
import { calculateMetrics, generateMetricsReport } from '@chicago-forest/community-manager/metrics';

const metrics = calculateMetrics(contributors, issues, prs);
const report = generateMetricsReport(metrics);
// Generates markdown health report
```

### Newsletter Generation

```typescript
import { generateNewsletter, renderNewsletter } from '@chicago-forest/community-manager/newsletter';

const newsletter = generateNewsletter(commits, releases, contributors, {
  projectName: 'Chicago Forest Network',
  period: { start: new Date('2024-01-01'), end: new Date('2024-01-31') },
  includeContributorSpotlight: true,
  includeUpcomingWork: false,
  maxHighlights: 5,
});

const markdown = renderNewsletter(newsletter);
```

### Discussion Summarization

```typescript
import { summarizeDiscussion, generateDiscussionDigest } from '@chicago-forest/community-manager/discussions';

const summary = summarizeDiscussion(discussion);
console.log(summary.keyPoints);
console.log(summary.sentiment);
console.log(summary.relatedTopics);

const digest = generateDiscussionDigest(discussions, period);
```

## Agent Ownership

This package tracks file ownership across all 20 agents in the ecosystem:

| Agent | Codename | Owned Packages |
|-------|----------|----------------|
| 1 | Mycelia | mycelium-core |
| 2 | Rhizome | spore-propagation |
| 3 | Symbiont | symbiosis |
| 4 | Sentinel | sentinel, anon-routing, firewall |
| 5 | Archivist | tesla-archive, lenr-database |
| 6 | Beacon | hardware-hal, node-deploy |
| 7 | Nexus | canopy-api |
| 8 | Delegate | hive-mind, forest-registry |
| 9 | Weaver | test-utils |
| 10 | Oracle | apps/web |
| 11 | Verifier | source-verifier |
| 12 | Scribe | content-generator |
| 13 | Compliance | compliance-checker |
| 14 | Prophet | doc-generator |
| 15 | Simulator | network-simulator |
| 16 | Auditor | security-auditor |
| 17 | Ambassador | community-manager, .github |
| 18 | Synchronizer | data-sync |
| 19 | Benchmarker | performance-suite |
| 20 | Validator | ecosystem-validator |

## Triage Rules

The package includes default triage rules for:

- Security issues (priority: critical)
- Bug reports (priority: high)
- Feature requests (priority: medium)
- Documentation (priority: low, good-first-issue)
- Tesla/LENR research (routes to Agent 5)
- Network/mycelium issues (routes to Agent 1)
- Security package issues (routes to Agent 4)

## Contributor Recognition

Contributors receive recognition badges based on their contributions:

- 🌳 **Century Contributor** (100+ commits)
- 🌲 **Forest Guardian** (50+ commits)
- 🌱 **Growing Contributor** (10+ commits)
- 🔀 **PR Master** (20+ merged PRs)
- 👀 **Review Champion** (50+ reviews)
- 🔧 **Issue Resolver** (30+ issues closed)

## API Reference

### Triage

- `applyTriageRules(title, body, rules?)` - Apply triage rules to issue
- `findRelatedIssues(newIssue, existingIssues)` - Find related issues
- `defaultRules` - Default triage rule set

### Onboarding

- `generateOnboardingChecklist(username)` - Generate onboarding checklist
- `generateContributorGuide()` - Generate contributor guide
- `detectFirstTimeContributor(author, previousContributors)` - Check if first-time contributor

### Metrics

- `calculateMetrics(contributors, issues, prs)` - Calculate community metrics
- `generateMetricsReport(metrics)` - Generate markdown report
- `identifyTopContributors(contributors, limit?)` - Get top contributors
- `generateRecognition(contributor)` - Generate recognition badges

### Newsletter

- `categorizeCommits(commits)` - Categorize by commit type
- `extractAgentChanges(commits)` - Extract agent-related changes
- `generateNewsletter(commits, releases, contributors, config)` - Generate newsletter
- `renderNewsletter(newsletter)` - Render to markdown

### Discussions

- `summarizeDiscussion(discussion)` - Summarize a discussion
- `generateDiscussionDigest(discussions, period)` - Generate digest
- `findUnansweredQuestions(discussions, maxAge?)` - Find unanswered Q&A
- `analyzeSentiment(comments)` - Analyze discussion sentiment
- `extractRelatedTopics(body, comments)` - Extract related topics

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

## License

Part of the Chicago Plasma Forest Network - An AI-generated theoretical framework for decentralized energy research.

---

*Agent 17: Ambassador - Serving the community, preserving research, inspiring the future.*
