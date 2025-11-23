/**
 * Issue Triage System
 *
 * Automatically categorize and route issues.
 */

export interface TriageRule {
  name: string;
  patterns: RegExp[];
  action: {
    addLabels?: string[];
    assignTo?: string;
    priority?: 'critical' | 'high' | 'medium' | 'low';
    comment?: string;
  };
}

export const defaultRules: TriageRule[] = [
  {
    name: 'security-issue',
    patterns: [/security/i, /vulnerability/i, /cve-\d+/i, /exploit/i],
    action: {
      addLabels: ['security', 'priority-critical'],
      priority: 'critical',
      comment: '⚠️ This issue has been flagged as security-related and will be prioritized.',
    },
  },
  {
    name: 'bug-report',
    patterns: [/bug/i, /error/i, /broken/i, /crash/i, /fail/i],
    action: {
      addLabels: ['bug', 'needs-investigation'],
      priority: 'high',
    },
  },
  {
    name: 'feature-request',
    patterns: [/feature/i, /enhancement/i, /request/i, /add support/i],
    action: {
      addLabels: ['enhancement', 'needs-discussion'],
      priority: 'medium',
    },
  },
  {
    name: 'documentation',
    patterns: [/docs?/i, /documentation/i, /typo/i, /readme/i],
    action: {
      addLabels: ['documentation', 'good-first-issue'],
      priority: 'low',
    },
  },
  {
    name: 'tesla-archive',
    patterns: [/tesla/i, /patent/i, /wardenclyffe/i, /colorado springs/i],
    action: {
      addLabels: ['agent-5-archivist', 'research'],
    },
  },
  {
    name: 'lenr-research',
    patterns: [/lenr/i, /cold fusion/i, /lattice confined/i],
    action: {
      addLabels: ['agent-5-archivist', 'research'],
    },
  },
  {
    name: 'network-core',
    patterns: [/mycelium/i, /hyphal/i, /topology/i, /propagation/i],
    action: {
      addLabels: ['agent-1-mycelia', 'core'],
    },
  },
  {
    name: 'security-package',
    patterns: [/sentinel/i, /encryption/i, /crypto/i, /privacy/i],
    action: {
      addLabels: ['agent-4-sentinel', 'security'],
    },
  },
];

export function applyTriageRules(
  title: string,
  body: string,
  rules: TriageRule[] = defaultRules
): {
  labels: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  comments: string[];
  assignee?: string;
} {
  const labels = new Set<string>();
  const comments: string[] = [];
  let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
  let assignee: string | undefined;

  const content = title + ' ' + body;

  for (const rule of rules) {
    const matches = rule.patterns.some(p => p.test(content));
    if (matches) {
      if (rule.action.addLabels) {
        rule.action.addLabels.forEach(l => labels.add(l));
      }
      if (rule.action.assignTo) {
        assignee = rule.action.assignTo;
      }
      if (rule.action.priority) {
        const priorityOrder = ['critical', 'high', 'medium', 'low'];
        if (priorityOrder.indexOf(rule.action.priority) < priorityOrder.indexOf(priority)) {
          priority = rule.action.priority;
        }
      }
      if (rule.action.comment) {
        comments.push(rule.action.comment);
      }
    }
  }

  return {
    labels: Array.from(labels),
    priority,
    comments,
    assignee,
  };
}

export function findRelatedIssues(
  newIssue: { title: string; body: string },
  existingIssues: { id: number; title: string; body: string }[]
): number[] {
  const newWords = new Set(
    (newIssue.title + ' ' + newIssue.body)
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3)
  );

  const scores: { id: number; score: number }[] = [];

  for (const issue of existingIssues) {
    const issueWords = (issue.title + ' ' + issue.body)
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3);

    const overlap = issueWords.filter(w => newWords.has(w)).length;
    const score = overlap / Math.max(newWords.size, issueWords.length);

    if (score > 0.3) {
      scores.push({ id: issue.id, score });
    }
  }

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.id);
}
