/**
 * Community Metrics Tests
 * Agent 17: Ambassador - Community Manager
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateMetrics,
  generateMetricsReport,
  identifyTopContributors,
  generateRecognition,
  ContributorStats,
  CommunityMetrics,
} from '../src/metrics';

describe('calculateMetrics', () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const contributors: ContributorStats[] = [
    {
      username: 'active-user',
      commits: 50,
      prsOpened: 10,
      prsMerged: 8,
      issuesOpened: 5,
      issuesClosed: 3,
      reviewsGiven: 20,
      firstContribution: sixtyDaysAgo,
      lastContribution: new Date(), // Active
    },
    {
      username: 'inactive-user',
      commits: 30,
      prsOpened: 5,
      prsMerged: 4,
      issuesOpened: 2,
      issuesClosed: 1,
      reviewsGiven: 10,
      firstContribution: sixtyDaysAgo,
      lastContribution: sixtyDaysAgo, // Inactive
    },
  ];

  const issues = [
    { createdAt: thirtyDaysAgo, closedAt: new Date(), firstResponseAt: new Date(thirtyDaysAgo.getTime() + 2 * 60 * 60 * 1000) },
    { createdAt: thirtyDaysAgo, closedAt: undefined, firstResponseAt: undefined },
  ];

  const prs = [
    { createdAt: thirtyDaysAgo, mergedAt: new Date() },
    { createdAt: thirtyDaysAgo, mergedAt: undefined },
  ];

  it('should calculate total contributors', () => {
    const metrics = calculateMetrics(contributors, issues, prs);
    expect(metrics.totalContributors).toBe(2);
  });

  it('should calculate active contributors', () => {
    const metrics = calculateMetrics(contributors, issues, prs);
    expect(metrics.activeContributors).toBe(1);
  });

  it('should calculate PR stats', () => {
    const metrics = calculateMetrics(contributors, issues, prs);
    expect(metrics.totalPRs).toBe(2);
    expect(metrics.mergedPRs).toBe(1);
  });

  it('should calculate issue stats', () => {
    const metrics = calculateMetrics(contributors, issues, prs);
    expect(metrics.totalIssues).toBe(2);
    expect(metrics.closedIssues).toBe(1);
    expect(metrics.openIssues).toBe(1);
  });

  it('should calculate average response time', () => {
    const metrics = calculateMetrics(contributors, issues, prs);
    expect(metrics.averageTimeToFirstResponse).toBeGreaterThan(0);
  });

  it('should handle empty data', () => {
    const metrics = calculateMetrics([], [], []);
    expect(metrics.totalContributors).toBe(0);
    expect(metrics.averageTimeToFirstResponse).toBe(0);
    expect(metrics.averageTimeToClose).toBe(0);
  });
});

describe('generateMetricsReport', () => {
  const metrics: CommunityMetrics = {
    totalContributors: 50,
    activeContributors: 20,
    totalPRs: 100,
    mergedPRs: 80,
    totalIssues: 150,
    openIssues: 30,
    closedIssues: 120,
    averageTimeToFirstResponse: 4.5,
    averageTimeToClose: 48.0,
  };

  it('should generate markdown report', () => {
    const report = generateMetricsReport(metrics);
    expect(report).toContain('# Community Health Report');
  });

  it('should include contributor stats', () => {
    const report = generateMetricsReport(metrics);
    expect(report).toContain('Total Contributors:** 50');
    expect(report).toContain('Active (30 days):** 20');
  });

  it('should include PR stats', () => {
    const report = generateMetricsReport(metrics);
    expect(report).toContain('Total PRs:** 100');
    expect(report).toContain('Merged PRs:** 80');
    expect(report).toContain('Merge Rate:** 80.0%');
  });

  it('should include issue stats', () => {
    const report = generateMetricsReport(metrics);
    expect(report).toContain('Total Issues:** 150');
    expect(report).toContain('Close Rate:** 80.0%');
  });

  it('should include response times', () => {
    const report = generateMetricsReport(metrics);
    expect(report).toContain('Avg Time to First Response:** 4.5 hours');
    expect(report).toContain('Avg Time to Close:** 48.0 hours');
  });

  it('should include agent attribution', () => {
    const report = generateMetricsReport(metrics);
    expect(report).toContain('Agent 17');
    expect(report).toContain('Ambassador');
  });
});

describe('identifyTopContributors', () => {
  const contributors: ContributorStats[] = [
    { username: 'high-contributor', commits: 100, prsOpened: 20, prsMerged: 18, issuesOpened: 10, issuesClosed: 8, reviewsGiven: 30, firstContribution: new Date(), lastContribution: new Date() },
    { username: 'medium-contributor', commits: 50, prsOpened: 10, prsMerged: 8, issuesOpened: 5, issuesClosed: 4, reviewsGiven: 15, firstContribution: new Date(), lastContribution: new Date() },
    { username: 'low-contributor', commits: 5, prsOpened: 1, prsMerged: 1, issuesOpened: 1, issuesClosed: 0, reviewsGiven: 0, firstContribution: new Date(), lastContribution: new Date() },
  ];

  it('should return top contributors by score', () => {
    const top = identifyTopContributors(contributors, 2);
    expect(top.length).toBe(2);
    expect(top[0].username).toBe('high-contributor');
    expect(top[1].username).toBe('medium-contributor');
  });

  it('should respect limit parameter', () => {
    const top = identifyTopContributors(contributors, 1);
    expect(top.length).toBe(1);
  });

  it('should handle empty list', () => {
    const top = identifyTopContributors([], 10);
    expect(top.length).toBe(0);
  });

  it('should use default limit of 10', () => {
    const manyContributors = Array.from({ length: 20 }, (_, i) => ({
      username: `user-${i}`,
      commits: i,
      prsOpened: 0,
      prsMerged: 0,
      issuesOpened: 0,
      issuesClosed: 0,
      reviewsGiven: 0,
      firstContribution: new Date(),
      lastContribution: new Date(),
    }));

    const top = identifyTopContributors(manyContributors);
    expect(top.length).toBe(10);
  });
});

describe('generateRecognition', () => {
  it('should recognize century contributors', () => {
    const contributor: ContributorStats = {
      username: 'super-contributor',
      commits: 150,
      prsOpened: 30,
      prsMerged: 25,
      issuesOpened: 20,
      issuesClosed: 35,
      reviewsGiven: 60,
      firstContribution: new Date(),
      lastContribution: new Date(),
    };

    const recognitions = generateRecognition(contributor);
    expect(recognitions).toContain('Century Contributor (100+ commits)');
  });

  it('should recognize forest guardians', () => {
    const contributor: ContributorStats = {
      username: 'forest-guardian',
      commits: 75,
      prsOpened: 10,
      prsMerged: 8,
      issuesOpened: 5,
      issuesClosed: 4,
      reviewsGiven: 10,
      firstContribution: new Date(),
      lastContribution: new Date(),
    };

    const recognitions = generateRecognition(contributor);
    expect(recognitions).toContain('Forest Guardian (50+ commits)');
  });

  it('should recognize growing contributors', () => {
    const contributor: ContributorStats = {
      username: 'growing',
      commits: 15,
      prsOpened: 3,
      prsMerged: 2,
      issuesOpened: 2,
      issuesClosed: 1,
      reviewsGiven: 5,
      firstContribution: new Date(),
      lastContribution: new Date(),
    };

    const recognitions = generateRecognition(contributor);
    expect(recognitions).toContain('Growing Contributor (10+ commits)');
  });

  it('should recognize PR masters', () => {
    const contributor: ContributorStats = {
      username: 'pr-master',
      commits: 5,
      prsOpened: 30,
      prsMerged: 25,
      issuesOpened: 2,
      issuesClosed: 1,
      reviewsGiven: 5,
      firstContribution: new Date(),
      lastContribution: new Date(),
    };

    const recognitions = generateRecognition(contributor);
    expect(recognitions).toContain('PR Master (20+ merged PRs)');
  });

  it('should recognize review champions', () => {
    const contributor: ContributorStats = {
      username: 'reviewer',
      commits: 5,
      prsOpened: 2,
      prsMerged: 2,
      issuesOpened: 2,
      issuesClosed: 1,
      reviewsGiven: 60,
      firstContribution: new Date(),
      lastContribution: new Date(),
    };

    const recognitions = generateRecognition(contributor);
    expect(recognitions).toContain('Review Champion (50+ reviews)');
  });

  it('should recognize issue resolvers', () => {
    const contributor: ContributorStats = {
      username: 'resolver',
      commits: 5,
      prsOpened: 2,
      prsMerged: 2,
      issuesOpened: 5,
      issuesClosed: 35,
      reviewsGiven: 5,
      firstContribution: new Date(),
      lastContribution: new Date(),
    };

    const recognitions = generateRecognition(contributor);
    expect(recognitions).toContain('Issue Resolver (30+ issues closed)');
  });

  it('should return multiple recognitions', () => {
    const contributor: ContributorStats = {
      username: 'super-contributor',
      commits: 150,
      prsOpened: 30,
      prsMerged: 25,
      issuesOpened: 20,
      issuesClosed: 35,
      reviewsGiven: 60,
      firstContribution: new Date(),
      lastContribution: new Date(),
    };

    const recognitions = generateRecognition(contributor);
    expect(recognitions.length).toBeGreaterThan(1);
  });

  it('should return empty array for new contributors', () => {
    const contributor: ContributorStats = {
      username: 'newbie',
      commits: 1,
      prsOpened: 1,
      prsMerged: 0,
      issuesOpened: 0,
      issuesClosed: 0,
      reviewsGiven: 0,
      firstContribution: new Date(),
      lastContribution: new Date(),
    };

    const recognitions = generateRecognition(contributor);
    expect(recognitions.length).toBe(0);
  });
});
