/**
 * Onboarding System Tests
 * Agent 17: Ambassador - Community Manager
 */
import { describe, it, expect } from 'vitest';
import {
  onboardingSteps,
  generateOnboardingChecklist,
  generateContributorGuide,
  detectFirstTimeContributor,
} from '../src/onboarding';

describe('onboardingSteps', () => {
  it('should have required steps marked correctly', () => {
    const requiredSteps = onboardingSteps.filter(s => s.required);
    const optionalSteps = onboardingSteps.filter(s => !s.required);

    expect(requiredSteps.length).toBeGreaterThan(0);
    expect(optionalSteps.length).toBeGreaterThan(0);
  });

  it('should include reading guidelines as required', () => {
    const guidelinesStep = onboardingSteps.find(s => s.id === 'read-guidelines');
    expect(guidelinesStep).toBeDefined();
    expect(guidelinesStep?.required).toBe(true);
  });

  it('should include understanding agent system', () => {
    const agentsStep = onboardingSteps.find(s => s.id === 'understand-agents');
    expect(agentsStep).toBeDefined();
    expect(agentsStep?.required).toBe(true);
  });

  it('should include dev environment setup', () => {
    const setupStep = onboardingSteps.find(s => s.id === 'setup-dev-env');
    expect(setupStep).toBeDefined();
  });
});

describe('generateOnboardingChecklist', () => {
  it('should include username in greeting', () => {
    const checklist = generateOnboardingChecklist('testuser');
    expect(checklist).toContain('@testuser');
  });

  it('should include all onboarding steps', () => {
    const checklist = generateOnboardingChecklist('testuser');

    for (const step of onboardingSteps) {
      expect(checklist).toContain(step.title);
    }
  });

  it('should mark required steps as required', () => {
    const checklist = generateOnboardingChecklist('testuser');
    expect(checklist).toContain('**[Required]**');
  });

  it('should mark optional steps as optional', () => {
    const checklist = generateOnboardingChecklist('testuser');
    expect(checklist).toContain('[Optional]');
  });

  it('should include disclaimer about AI-generated content', () => {
    const checklist = generateOnboardingChecklist('testuser');
    expect(checklist).toContain('AI-generated theoretical framework');
  });

  it('should include checkbox format', () => {
    const checklist = generateOnboardingChecklist('testuser');
    expect(checklist).toContain('- [ ]');
  });

  it('should include important notes section', () => {
    const checklist = generateOnboardingChecklist('testuser');
    expect(checklist).toContain('## Important Notes');
  });
});

describe('generateContributorGuide', () => {
  it('should include getting started section', () => {
    const guide = generateContributorGuide();
    expect(guide).toContain('## Getting Started');
  });

  it('should include clone instructions', () => {
    const guide = generateContributorGuide();
    expect(guide).toContain('git clone');
    expect(guide).toContain('pnpm install');
  });

  it('should mention the agent system', () => {
    const guide = generateContributorGuide();
    expect(guide).toContain('Agent System');
    expect(guide).toContain('agents.json');
  });

  it('should include PR guidelines', () => {
    const guide = generateContributorGuide();
    expect(guide).toContain('## PR Guidelines');
  });

  it('should mention commit convention', () => {
    const guide = generateContributorGuide();
    expect(guide).toContain('feat(agent-N)');
  });

  it('should include content guidelines', () => {
    const guide = generateContributorGuide();
    expect(guide).toContain('## Content Guidelines');
    expect(guide).toContain('theoretical');
    expect(guide).toContain('disclaimers');
  });

  it('should reference source links', () => {
    const guide = generateContributorGuide();
    expect(guide).toContain('source links');
  });
});

describe('detectFirstTimeContributor', () => {
  const existingContributors = ['alice', 'bob', 'charlie'];

  it('should detect first time contributor', () => {
    const isFirstTime = detectFirstTimeContributor('newuser', existingContributors);
    expect(isFirstTime).toBe(true);
  });

  it('should detect returning contributor', () => {
    const isFirstTime = detectFirstTimeContributor('alice', existingContributors);
    expect(isFirstTime).toBe(false);
  });

  it('should handle case-sensitive usernames', () => {
    const isFirstTime = detectFirstTimeContributor('Alice', existingContributors);
    expect(isFirstTime).toBe(true); // 'Alice' !== 'alice'
  });

  it('should handle empty contributor list', () => {
    const isFirstTime = detectFirstTimeContributor('anyuser', []);
    expect(isFirstTime).toBe(true);
  });
});
