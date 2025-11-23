/**
 * Triage System Tests
 * Agent 17: Ambassador - Community Manager
 */
import { describe, it, expect } from 'vitest';
import {
  applyTriageRules,
  findRelatedIssues,
  defaultRules,
  TriageRule,
} from '../src/triage';

describe('applyTriageRules', () => {
  it('should detect security issues and set critical priority', () => {
    const result = applyTriageRules(
      'Security vulnerability in auth module',
      'There is a potential XSS vulnerability.',
      defaultRules
    );

    expect(result.labels).toContain('security');
    expect(result.labels).toContain('priority-critical');
    expect(result.priority).toBe('critical');
  });

  it('should detect bug reports', () => {
    const result = applyTriageRules(
      'Bug: Application crashes on startup',
      'Error message appears when launching.',
      defaultRules
    );

    expect(result.labels).toContain('bug');
    expect(result.labels).toContain('needs-investigation');
    expect(result.priority).toBe('high');
  });

  it('should detect feature requests', () => {
    const result = applyTriageRules(
      'Feature request: Add dark mode',
      'Would be nice to have a dark theme.',
      defaultRules
    );

    expect(result.labels).toContain('enhancement');
    expect(result.labels).toContain('needs-discussion');
    expect(result.priority).toBe('medium');
  });

  it('should detect documentation issues', () => {
    const result = applyTriageRules(
      'Typo in README',
      'Found a spelling mistake in the documentation.',
      defaultRules
    );

    expect(result.labels).toContain('documentation');
    expect(result.labels).toContain('good-first-issue');
    expect(result.priority).toBe('low');
  });

  it('should detect Tesla archive related issues', () => {
    const result = applyTriageRules(
      'Missing Tesla patent US645576A',
      'The Wardenclyffe patent is not in the archive.',
      defaultRules
    );

    expect(result.labels).toContain('agent-5-archivist');
    expect(result.labels).toContain('research');
  });

  it('should detect LENR research issues', () => {
    const result = applyTriageRules(
      'LENR paper DOI incorrect',
      'Cold fusion reference has wrong DOI link.',
      defaultRules
    );

    expect(result.labels).toContain('agent-5-archivist');
    expect(result.labels).toContain('research');
  });

  it('should detect mycelium network issues', () => {
    const result = applyTriageRules(
      'Hyphal connection timeout',
      'Mycelium topology is not updating.',
      defaultRules
    );

    expect(result.labels).toContain('agent-1-mycelia');
    expect(result.labels).toContain('core');
  });

  it('should detect sentinel security package issues', () => {
    const result = applyTriageRules(
      'Encryption key rotation',
      'Sentinel crypto module needs update.',
      defaultRules
    );

    expect(result.labels).toContain('agent-4-sentinel');
    expect(result.labels).toContain('security');
  });

  it('should return highest priority when multiple rules match', () => {
    const result = applyTriageRules(
      'Critical security bug',
      'Vulnerability causes crash.',
      defaultRules
    );

    expect(result.priority).toBe('critical');
  });

  it('should collect all applicable labels', () => {
    const result = applyTriageRules(
      'Security bug in documentation',
      'Found vulnerability described in docs.',
      defaultRules
    );

    expect(result.labels).toContain('security');
    expect(result.labels).toContain('bug');
    expect(result.labels).toContain('documentation');
  });

  it('should generate comments for critical issues', () => {
    const result = applyTriageRules(
      'Critical security issue',
      'Need immediate attention.',
      defaultRules
    );

    expect(result.comments.length).toBeGreaterThan(0);
  });

  it('should work with custom rules', () => {
    const customRules: TriageRule[] = [
      {
        name: 'custom-tag',
        patterns: [/custom/i],
        action: {
          addLabels: ['custom-label'],
          priority: 'high',
        },
      },
    ];

    const result = applyTriageRules(
      'Custom feature',
      'This is custom.',
      customRules
    );

    expect(result.labels).toContain('custom-label');
    expect(result.priority).toBe('high');
  });
});

describe('findRelatedIssues', () => {
  const existingIssues = [
    { id: 1, title: 'Tesla patent missing', body: 'Wardenclyffe patent not found' },
    { id: 2, title: 'LENR database error', body: 'Cold fusion papers not loading' },
    { id: 3, title: 'Network topology bug', body: 'Mycelium connections failing' },
    { id: 4, title: 'Security vulnerability', body: 'Encryption key exposed' },
    { id: 5, title: 'Documentation update', body: 'README needs refresh' },
  ];

  it('should find related issues based on word overlap', () => {
    const newIssue = {
      title: 'Another Tesla patent issue',
      body: 'Missing Wardenclyffe reference',
    };

    const related = findRelatedIssues(newIssue, existingIssues);

    expect(related).toContain(1);
  });

  it('should return empty array when no issues are related', () => {
    const newIssue = {
      title: 'Completely unrelated',
      body: 'Nothing matches here xyz123',
    };

    const related = findRelatedIssues(newIssue, existingIssues);

    expect(related.length).toBe(0);
  });

  it('should limit results to 5 most related', () => {
    const manyIssues = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      title: `Issue about network ${i}`,
      body: 'Network topology mycelium connections',
    }));

    const newIssue = {
      title: 'Network problem',
      body: 'Mycelium topology network issue',
    };

    const related = findRelatedIssues(newIssue, manyIssues);

    expect(related.length).toBeLessThanOrEqual(5);
  });

  it('should sort by relevance score', () => {
    const newIssue = {
      title: 'Tesla Wardenclyffe',
      body: 'Patent issue with Tesla archive',
    };

    const related = findRelatedIssues(newIssue, existingIssues);

    if (related.length > 0) {
      expect(related[0]).toBe(1); // Most related issue
    }
  });
});
