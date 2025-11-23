/**
 * @chicago-forest/community-manager
 *
 * Agent 17: Ambassador - Community Management
 *
 * Automate contributor onboarding, issue triage, PR validation,
 * and community engagement workflows.
 */

export * from './triage';
export * from './onboarding';
export * from './metrics';

export interface Contributor {
  username: string;
  email?: string;
  firstContribution: Date;
  totalContributions: number;
  areasOfFocus: string[];
  recognitions: string[];
}

export interface Issue {
  id: number;
  title: string;
  body: string;
  labels: string[];
  author: string;
  createdAt: Date;
  assignee?: string;
}

export interface PullRequest {
  id: number;
  title: string;
  body: string;
  author: string;
  changedFiles: string[];
  additions: number;
  deletions: number;
  labels: string[];
}

export interface TriageResult {
  suggestedLabels: string[];
  suggestedAssignee?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  relatedIssues: number[];
  agentOwnership?: number;
}

export class CommunityManager {
  private readonly agentOwnership: Map<number, string[]>;

  constructor() {
    // Map agent IDs to their exclusive file patterns
    this.agentOwnership = new Map([
      [1, ['packages/mycelium-core/']],
      [2, ['packages/spore-propagation/']],
      [3, ['packages/symbiosis/']],
      [4, ['packages/sentinel/', 'packages/anon-routing/', 'packages/firewall/']],
      [5, ['packages/tesla-archive/', 'packages/lenr-database/']],
      [6, ['packages/hardware-hal/', 'packages/node-deploy/']],
      [7, ['packages/canopy-api/']],
      [8, ['packages/hive-mind/', 'packages/forest-registry/']],
      [9, ['packages/test-utils/']],
      [10, ['apps/web/app/research/', 'apps/web/app/network/', 'apps/web/app/governance/']],
      [11, ['packages/source-verifier/']],
      [12, ['packages/content-generator/']],
      [13, ['packages/compliance-checker/']],
      [14, ['packages/doc-generator/']],
      [15, ['packages/network-simulator/']],
      [16, ['packages/security-auditor/']],
      [17, ['packages/community-manager/']],
      [18, ['packages/data-sync/']],
      [19, ['packages/performance-suite/']],
      [20, ['packages/ecosystem-validator/']],
    ]);
  }

  triageIssue(issue: Issue): TriageResult {
    const labels: string[] = [];
    let priority: TriageResult['priority'] = 'medium';

    // Auto-label based on content
    const titleLower = issue.title.toLowerCase();
    const bodyLower = issue.body.toLowerCase();
    const content = titleLower + ' ' + bodyLower;

    if (content.includes('bug') || content.includes('error') || content.includes('broken')) {
      labels.push('bug');
    }
    if (content.includes('feature') || content.includes('enhancement')) {
      labels.push('enhancement');
    }
    if (content.includes('documentation') || content.includes('docs')) {
      labels.push('documentation');
    }
    if (content.includes('security') || content.includes('vulnerability')) {
      labels.push('security');
      priority = 'critical';
    }
    if (content.includes('performance') || content.includes('slow')) {
      labels.push('performance');
    }

    // Priority based on keywords
    if (content.includes('critical') || content.includes('urgent') || content.includes('crash')) {
      priority = 'critical';
    } else if (content.includes('important') || content.includes('blocking')) {
      priority = 'high';
    }

    return {
      suggestedLabels: labels,
      priority,
      relatedIssues: [],
    };
  }

  validatePR(pr: PullRequest): { valid: boolean; issues: string[]; owningAgent?: number } {
    const issues: string[] = [];
    let owningAgent: number | undefined;

    // Check which agent owns the changed files
    const agentCounts = new Map<number, number>();
    for (const file of pr.changedFiles) {
      for (const [agentId, patterns] of this.agentOwnership) {
        if (patterns.some(p => file.startsWith(p))) {
          agentCounts.set(agentId, (agentCounts.get(agentId) || 0) + 1);
        }
      }
    }

    // Find dominant agent
    let maxCount = 0;
    for (const [agentId, count] of agentCounts) {
      if (count > maxCount) {
        maxCount = count;
        owningAgent = agentId;
      }
    }

    // Check for cross-agent violations
    if (agentCounts.size > 1) {
      issues.push(`PR touches files owned by ${agentCounts.size} different agents. Consider splitting.`);
    }

    // Check PR size
    if (pr.additions + pr.deletions > 1000) {
      issues.push('Large PR (>1000 lines). Consider breaking into smaller PRs.');
    }

    // Check for test changes
    const hasTestChanges = pr.changedFiles.some(f => f.includes('.test.') || f.includes('/tests/'));
    const hasCodeChanges = pr.changedFiles.some(f => f.includes('/src/') && !f.includes('.test.'));
    if (hasCodeChanges && !hasTestChanges) {
      issues.push('Code changes without corresponding test changes.');
    }

    return {
      valid: issues.length === 0,
      issues,
      owningAgent,
    };
  }

  generateWelcomeMessage(contributor: string, isFirstTime: boolean): string {
    if (isFirstTime) {
      return `
Welcome to the Chicago Forest Network, @${contributor}! 🌲

Thank you for your first contribution! Here are some things to know:

- This is an AI-generated theoretical framework for decentralized energy networks
- All content must include appropriate disclaimers
- Check out CLAUDE.md for project guidelines
- Each package has an "owning agent" - check agents.json

Feel free to ask questions in the discussions!
      `.trim();
    }

    return `Thanks for the contribution, @${contributor}! 🌳`;
  }
}

export default CommunityManager;
