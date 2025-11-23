/**
 * Contributor Onboarding
 *
 * Automate new contributor welcome and guidance.
 */

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  checkFn?: (username: string) => Promise<boolean>;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'read-guidelines',
    title: 'Read Project Guidelines',
    description: 'Review CLAUDE.md for project ethics and content guidelines',
    required: true,
  },
  {
    id: 'understand-agents',
    title: 'Understand Agent System',
    description: 'Review agents.json to understand package ownership',
    required: true,
  },
  {
    id: 'setup-dev-env',
    title: 'Set Up Development Environment',
    description: 'Clone repo, run pnpm install, verify tests pass',
    required: true,
  },
  {
    id: 'first-issue',
    title: 'Find Your First Issue',
    description: 'Look for issues labeled "good-first-issue"',
    required: false,
  },
  {
    id: 'join-discussion',
    title: 'Introduce Yourself',
    description: 'Say hello in GitHub Discussions',
    required: false,
  },
];

export function generateOnboardingChecklist(username: string): string {
  const lines: string[] = [
    `# Welcome to Chicago Forest Network, @${username}! 🌲`,
    '',
    'Thank you for your interest in contributing! Please complete these steps:',
    '',
  ];

  for (const step of onboardingSteps) {
    const required = step.required ? '**[Required]**' : '[Optional]';
    lines.push(`- [ ] ${required} **${step.title}**`);
    lines.push(`  ${step.description}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Important Notes');
  lines.push('');
  lines.push('- This project is an **AI-generated theoretical framework**');
  lines.push('- All content must include appropriate disclaimers');
  lines.push('- We document REAL historical research while envisioning theoretical possibilities');
  lines.push('- Never claim theoretical systems are operational');
  lines.push('');
  lines.push('Feel free to ask questions! We\'re happy to help.');

  return lines.join('\n');
}

export function generateContributorGuide(): string {
  return `
# Contributor Guide

## Getting Started

1. **Fork and Clone**
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/ChicagoForest.net
   cd ChicagoForest.net
   pnpm install
   \`\`\`

2. **Run Tests**
   \`\`\`bash
   pnpm test
   \`\`\`

3. **Create a Branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

## Agent System

This project uses 20 AI agents with exclusive file ownership:

| Agent | Domain | Packages |
|-------|--------|----------|
| 1. Mycelia | Neural Network Core | mycelium-core |
| 2. Rhizome | Network Propagation | spore-propagation |
| 3. Symbiont | Cross-Network Federation | symbiosis |
| 4. Sentinel | Security & Privacy | sentinel, anon-routing, firewall |
| 5. Archivist | Historical Research | tesla-archive, lenr-database |
| ... | ... | ... |

See \`.claude/agents.json\` for the full list.

## PR Guidelines

- Keep PRs focused on single agent's domain when possible
- Include tests for new functionality
- Add disclaimers to any content files
- Follow the commit convention: \`feat(agent-N): description\`

## Content Guidelines

- Always distinguish factual (documented) from theoretical content
- Include verifiable source links (patents.google.com, doi.org, etc.)
- Never claim theoretical systems are operational
- Mark AI-generated content clearly
  `.trim();
}

export function detectFirstTimeContributor(
  author: string,
  previousContributors: string[]
): boolean {
  return !previousContributors.includes(author);
}
