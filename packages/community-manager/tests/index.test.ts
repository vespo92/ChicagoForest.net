/**
 * Community Manager Integration Tests
 * Agent 17: Ambassador - Community Manager
 */
import { describe, it, expect } from 'vitest';
import {
  CommunityManager,
  Issue,
  PullRequest,
  Contributor,
} from '../src/index';

describe('CommunityManager', () => {
  let manager: CommunityManager;

  beforeEach(() => {
    manager = new CommunityManager();
  });

  describe('triageIssue', () => {
    it('should detect bug reports', () => {
      const issue: Issue = {
        id: 1,
        title: 'Bug: Application crashes',
        body: 'The app throws an error on startup.',
        labels: [],
        author: 'testuser',
        createdAt: new Date(),
      };

      const result = manager.triageIssue(issue);

      expect(result.suggestedLabels).toContain('bug');
    });

    it('should detect feature requests', () => {
      const issue: Issue = {
        id: 2,
        title: 'Feature request: Dark mode',
        body: 'Please add a dark theme option.',
        labels: [],
        author: 'testuser',
        createdAt: new Date(),
      };

      const result = manager.triageIssue(issue);

      expect(result.suggestedLabels).toContain('enhancement');
    });

    it('should prioritize security issues', () => {
      const issue: Issue = {
        id: 3,
        title: 'Security vulnerability found',
        body: 'Potential XSS attack vector.',
        labels: [],
        author: 'testuser',
        createdAt: new Date(),
      };

      const result = manager.triageIssue(issue);

      expect(result.suggestedLabels).toContain('security');
      expect(result.priority).toBe('critical');
    });

    it('should detect documentation issues', () => {
      const issue: Issue = {
        id: 4,
        title: 'Docs need update',
        body: 'The documentation is outdated.',
        labels: [],
        author: 'testuser',
        createdAt: new Date(),
      };

      const result = manager.triageIssue(issue);

      expect(result.suggestedLabels).toContain('documentation');
    });

    it('should detect performance issues', () => {
      const issue: Issue = {
        id: 5,
        title: 'Slow response time',
        body: 'The API is slow to respond.',
        labels: [],
        author: 'testuser',
        createdAt: new Date(),
      };

      const result = manager.triageIssue(issue);

      expect(result.suggestedLabels).toContain('performance');
    });
  });

  describe('validatePR', () => {
    it('should validate PR with single agent ownership', () => {
      const pr: PullRequest = {
        id: 1,
        title: 'Update mycelium core',
        body: 'Fixes topology calculation.',
        author: 'testuser',
        changedFiles: ['packages/mycelium-core/src/index.ts'],
        additions: 50,
        deletions: 10,
        labels: [],
      };

      const result = manager.validatePR(pr);

      expect(result.valid).toBe(true);
      expect(result.owningAgent).toBe(1);
    });

    it('should flag cross-agent violations', () => {
      const pr: PullRequest = {
        id: 2,
        title: 'Big refactor',
        body: 'Changes multiple packages.',
        author: 'testuser',
        changedFiles: [
          'packages/mycelium-core/src/index.ts',
          'packages/tesla-archive/src/patents.ts',
          'packages/sentinel/src/crypto.ts',
        ],
        additions: 100,
        deletions: 50,
        labels: [],
      };

      const result = manager.validatePR(pr);

      expect(result.valid).toBe(false);
      expect(result.issues).toContain(expect.stringContaining('different agents'));
    });

    it('should flag large PRs', () => {
      const pr: PullRequest = {
        id: 3,
        title: 'Huge update',
        body: 'Many changes.',
        author: 'testuser',
        changedFiles: ['packages/mycelium-core/src/index.ts'],
        additions: 800,
        deletions: 300,
        labels: [],
      };

      const result = manager.validatePR(pr);

      expect(result.issues).toContain(expect.stringContaining('Large PR'));
    });

    it('should flag missing tests', () => {
      const pr: PullRequest = {
        id: 4,
        title: 'Add feature',
        body: 'New functionality.',
        author: 'testuser',
        changedFiles: ['packages/mycelium-core/src/feature.ts'],
        additions: 100,
        deletions: 0,
        labels: [],
      };

      const result = manager.validatePR(pr);

      expect(result.issues).toContain(expect.stringContaining('test changes'));
    });

    it('should accept PR with tests', () => {
      const pr: PullRequest = {
        id: 5,
        title: 'Add feature with tests',
        body: 'New functionality with tests.',
        author: 'testuser',
        changedFiles: [
          'packages/mycelium-core/src/feature.ts',
          'packages/mycelium-core/tests/feature.test.ts',
        ],
        additions: 150,
        deletions: 10,
        labels: [],
      };

      const result = manager.validatePR(pr);

      expect(result.issues).not.toContain(expect.stringContaining('test changes'));
    });
  });

  describe('generateWelcomeMessage', () => {
    it('should generate first-time contributor message', () => {
      const message = manager.generateWelcomeMessage('newuser', true);

      expect(message).toContain('Welcome');
      expect(message).toContain('@newuser');
      expect(message).toContain('first contribution');
      expect(message).toContain('CLAUDE.md');
      expect(message).toContain('AI-generated');
    });

    it('should generate returning contributor message', () => {
      const message = manager.generateWelcomeMessage('returning', false);

      expect(message).toContain('Thanks for the contribution');
      expect(message).toContain('@returning');
    });

    it('should include agent system info for first-timers', () => {
      const message = manager.generateWelcomeMessage('newuser', true);

      expect(message).toContain('agents.json');
    });
  });
});

describe('Type exports', () => {
  it('should export Contributor interface', () => {
    const contributor: Contributor = {
      username: 'testuser',
      firstContribution: new Date(),
      totalContributions: 10,
      areasOfFocus: ['mycelium-core'],
      recognitions: ['Growing Contributor'],
    };

    expect(contributor.username).toBe('testuser');
  });

  it('should export Issue interface', () => {
    const issue: Issue = {
      id: 1,
      title: 'Test',
      body: 'Body',
      labels: [],
      author: 'user',
      createdAt: new Date(),
    };

    expect(issue.id).toBe(1);
  });

  it('should export PullRequest interface', () => {
    const pr: PullRequest = {
      id: 1,
      title: 'Test',
      body: 'Body',
      author: 'user',
      changedFiles: [],
      additions: 0,
      deletions: 0,
      labels: [],
    };

    expect(pr.id).toBe(1);
  });
});
