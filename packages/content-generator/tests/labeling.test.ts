/**
 * Agent 12: Scribe - AI Labeling System Tests
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import { describe, it, expect } from 'vitest';
import {
  createAILabel,
  wrapWithAILabel,
  validateAILabeling,
  batchLabel,
  createAttestation,
  STANDARD_LABELS,
  DISCLAIMERS,
} from '../src/labeling';

describe('AI Labeling System', () => {
  describe('createAILabel', () => {
    it('should create a label for AI-generated content', () => {
      const label = createAILabel('ai_generated');

      expect(label.classification).toBe('ai_generated');
      expect(label.severity).toBe('warning');
      expect(label.shortLabel).toBe(STANDARD_LABELS.AI_GENERATED);
      expect(label.disclaimer).toBe(DISCLAIMERS.ai_generated);
      expect(label.generatedAt).toBeInstanceOf(Date);
    });

    it('should create a label for verified source content', () => {
      const label = createAILabel('verified_source');

      expect(label.classification).toBe('verified_source');
      expect(label.severity).toBe('info');
      expect(label.shortLabel).toBe(STANDARD_LABELS.VERIFIED_SOURCE);
    });

    it('should create a label for theoretical content', () => {
      const label = createAILabel('theoretical');

      expect(label.classification).toBe('theoretical');
      expect(label.severity).toBe('warning');
      expect(label.shortLabel).toBe(STANDARD_LABELS.THEORETICAL);
    });

    it('should accept custom options', () => {
      const label = createAILabel('ai_generated', {
        model: 'claude-3',
        confidence: 0.95,
        customDisclaimer: 'Custom disclaimer text',
      });

      expect(label.model).toBe('claude-3');
      expect(label.confidence).toBe(0.95);
      expect(label.disclaimer).toBe('Custom disclaimer text');
    });

    it('should generate valid HTML label', () => {
      const label = createAILabel('ai_generated');

      expect(label.htmlLabel).toContain('<aside');
      expect(label.htmlLabel).toContain(STANDARD_LABELS.AI_GENERATED);
      expect(label.htmlLabel).toContain('background-color');
    });

    it('should generate valid Markdown label', () => {
      const label = createAILabel('ai_generated');

      expect(label.markdownLabel).toContain('>');
      expect(label.markdownLabel).toContain('**');
      expect(label.markdownLabel).toContain(STANDARD_LABELS.AI_GENERATED);
    });
  });

  describe('wrapWithAILabel', () => {
    const testContent = 'This is test content about Tesla patents.';

    it('should wrap content with markdown label', () => {
      const wrapped = wrapWithAILabel(testContent, 'ai_generated', 'markdown');

      expect(wrapped).toContain(STANDARD_LABELS.AI_GENERATED);
      expect(wrapped).toContain(testContent);
      expect(wrapped).toContain('---');
    });

    it('should wrap content with HTML label', () => {
      const wrapped = wrapWithAILabel(testContent, 'ai_generated', 'html');

      expect(wrapped).toContain('<aside');
      expect(wrapped).toContain(testContent);
    });

    it('should wrap content with plaintext label', () => {
      const wrapped = wrapWithAILabel(testContent, 'ai_generated', 'plaintext');

      expect(wrapped).toContain(STANDARD_LABELS.AI_GENERATED);
      expect(wrapped).toContain(testContent);
    });

    it('should handle different classifications', () => {
      const wrappedTheoretical = wrapWithAILabel(testContent, 'theoretical');
      const wrappedVerified = wrapWithAILabel(testContent, 'verified_source');

      expect(wrappedTheoretical).toContain(STANDARD_LABELS.THEORETICAL);
      expect(wrappedVerified).toContain(STANDARD_LABELS.VERIFIED_SOURCE);
    });
  });

  describe('validateAILabeling', () => {
    it('should detect AI-generated label', () => {
      const content = `${STANDARD_LABELS.AI_GENERATED}\n\nSome content here.`;
      const result = validateAILabeling(content);

      expect(result.isLabeled).toBe(true);
      expect(result.detectedLabels).toContain('AI_GENERATED');
    });

    it('should detect theoretical label', () => {
      const content = `${STANDARD_LABELS.THEORETICAL}\n\nTheoretical content here.`;
      const result = validateAILabeling(content);

      expect(result.isLabeled).toBe(true);
      expect(result.detectedLabels).toContain('THEORETICAL');
    });

    it('should detect verified source label', () => {
      const content = `${STANDARD_LABELS.VERIFIED_SOURCE}\n\nVerified content here.`;
      const result = validateAILabeling(content);

      expect(result.isLabeled).toBe(true);
      expect(result.detectedLabels).toContain('VERIFIED_SOURCE');
    });

    it('should recommend labeling for unlabeled content', () => {
      const content = 'Unlabeled content without any markers.';
      const result = validateAILabeling(content);

      expect(result.isLabeled).toBe(false);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain('AI content label');
    });

    it('should detect missing disclaimer', () => {
      const content = `${STANDARD_LABELS.AI_GENERATED}\n\nContent without disclaimer.`;
      const result = validateAILabeling(content);

      expect(result.missingDisclaimer).toBe(true);
    });

    it('should not flag missing disclaimer for properly labeled content', () => {
      const content = `${STANDARD_LABELS.AI_GENERATED}\n\nThis is AI-generated content with disclaimer.`;
      const result = validateAILabeling(content);

      expect(result.isLabeled).toBe(true);
    });
  });

  describe('batchLabel', () => {
    it('should label multiple items', () => {
      const items = [
        { content: 'Content 1', classification: 'ai_generated' as const },
        { content: 'Content 2', classification: 'theoretical' as const },
        { content: 'Content 3', classification: 'verified_source' as const },
      ];

      const results = batchLabel(items);

      expect(results).toHaveLength(3);
      expect(results[0].labeled).toContain(STANDARD_LABELS.AI_GENERATED);
      expect(results[1].labeled).toContain(STANDARD_LABELS.THEORETICAL);
      expect(results[2].labeled).toContain(STANDARD_LABELS.VERIFIED_SOURCE);
    });

    it('should preserve original content', () => {
      const items = [
        { content: 'Original content', classification: 'ai_generated' as const },
      ];

      const results = batchLabel(items);

      expect(results[0].original).toBe('Original content');
      expect(results[0].labeled).toContain('Original content');
    });
  });

  describe('createAttestation', () => {
    it('should create attestation for content', () => {
      const content = 'Test content for attestation';
      const sources = ['https://example.com/source1'];

      const attestation = createAttestation(content, 'ai_generated', sources);

      expect(attestation.classification).toBe('ai_generated');
      expect(attestation.sourceRefs).toEqual(sources);
      expect(attestation.attestedBy).toBe('agent-12-scribe');
      expect(attestation.verificationStatus).toBe('verified');
    });

    it('should mark as pending when no sources', () => {
      const attestation = createAttestation('Test content', 'ai_generated', []);

      expect(attestation.verificationStatus).toBe('pending');
    });

    it('should generate content hash', () => {
      const attestation = createAttestation('Test content', 'ai_generated', []);

      expect(attestation.contentHash).toBeDefined();
      expect(attestation.contentHash.length).toBe(8);
    });

    it('should generate different hashes for different content', () => {
      const attestation1 = createAttestation('Content 1', 'ai_generated', []);
      const attestation2 = createAttestation('Content 2', 'ai_generated', []);

      expect(attestation1.contentHash).not.toBe(attestation2.contentHash);
    });
  });
});

describe('Standard Labels', () => {
  it('should have all required labels', () => {
    expect(STANDARD_LABELS.AI_GENERATED).toBeDefined();
    expect(STANDARD_LABELS.AI_ENHANCED).toBeDefined();
    expect(STANDARD_LABELS.AI_SUMMARIZED).toBeDefined();
    expect(STANDARD_LABELS.THEORETICAL).toBeDefined();
    expect(STANDARD_LABELS.VERIFIED_SOURCE).toBeDefined();
    expect(STANDARD_LABELS.HISTORICAL_FACT).toBeDefined();
    expect(STANDARD_LABELS.NEEDS_VERIFICATION).toBeDefined();
  });

  it('should include emoji indicators', () => {
    expect(STANDARD_LABELS.AI_GENERATED).toContain('⚠️');
    expect(STANDARD_LABELS.VERIFIED_SOURCE).toContain('✅');
    expect(STANDARD_LABELS.HISTORICAL_FACT).toContain('📚');
  });
});

describe('Disclaimers', () => {
  it('should have disclaimers for all classifications', () => {
    expect(DISCLAIMERS.ai_generated).toBeDefined();
    expect(DISCLAIMERS.ai_enhanced).toBeDefined();
    expect(DISCLAIMERS.ai_summarized).toBeDefined();
    expect(DISCLAIMERS.theoretical).toBeDefined();
    expect(DISCLAIMERS.verified_source).toBeDefined();
    expect(DISCLAIMERS.historical_fact).toBeDefined();
  });

  it('should mention AI in AI-related disclaimers', () => {
    expect(DISCLAIMERS.ai_generated.toLowerCase()).toContain('ai');
    expect(DISCLAIMERS.ai_enhanced.toLowerCase()).toContain('ai');
    expect(DISCLAIMERS.ai_summarized.toLowerCase()).toContain('ai');
  });

  it('should mention theoretical framework disclaimer correctly', () => {
    expect(DISCLAIMERS.theoretical.toLowerCase()).toContain('theoretical');
    expect(DISCLAIMERS.theoretical.toLowerCase()).toContain('chicago forest');
  });
});
