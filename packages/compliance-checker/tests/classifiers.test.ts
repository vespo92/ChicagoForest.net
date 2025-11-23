/**
 * Agent 13: Compliance - Classifier Tests
 *
 * Tests for content classification (factual, theoretical, AI-generated).
 */

import { describe, it, expect } from 'vitest';
import {
  classifyContent,
  requiresAiLabel,
  requiresSourceAttribution,
  type ContentType,
} from '../src/classifiers';

describe('classifyContent', () => {
  it('should classify AI-generated content correctly', () => {
    const content = 'This AI-generated content describes theoretical possibilities.';
    const result = classifyContent(content);
    expect(result.type).toBe('ai_generated');
    expect(result.needsDisclaimer).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('should classify theoretical content correctly', () => {
    const content = `
      This conceptual framework could potentially enable new forms of energy distribution.
      The proposed system might enable wireless power transfer theoretically.
    `;
    const result = classifyContent(content);
    expect(result.type).toBe('theoretical');
    expect(result.needsDisclaimer).toBe(true);
  });

  it('should classify factual content with patents', () => {
    const content = `
      Tesla's patent US645576A describes wireless energy transmission.
      This was published in 1900 and demonstrated at the World's Fair.
      According to documented records from 1899.
    `;
    const result = classifyContent(content);
    expect(result.type).toBe('factual');
    expect(result.needsDisclaimer).toBe(false);
  });

  it('should classify factual content with DOIs', () => {
    const content = `
      The study published in 2020 with DOI: 10.1234/example found significant results.
      According to the researchers who published this work.
    `;
    const result = classifyContent(content);
    expect(result.type).toBe('factual');
  });

  it('should classify mixed content', () => {
    const content = `
      Tesla's patent US645576A describes the concept.
      This could potentially enable new applications.
    `;
    const result = classifyContent(content);
    expect(result.type).toBe('mixed');
    expect(result.needsDisclaimer).toBe(true);
  });

  it('should classify unknown content with low confidence', () => {
    const content = 'Some random text without indicators.';
    const result = classifyContent(content);
    expect(result.type).toBe('unknown');
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('should include indicators in result', () => {
    const content = 'This AI-generated theoretical framework is proposed.';
    const result = classifyContent(content);
    expect(result.indicators.length).toBeGreaterThan(0);
    expect(result.indicators.some(i => i.includes('AI'))).toBe(true);
  });
});

describe('requiresAiLabel', () => {
  it('should return true for AI-generated content', () => {
    const content = 'This AI-generated content needs labeling.';
    expect(requiresAiLabel(content)).toBe(true);
  });

  it('should return true for theoretical content', () => {
    const content = 'This conceptual framework theoretically could enable new possibilities.';
    expect(requiresAiLabel(content)).toBe(true);
  });

  it('should return false for factual content', () => {
    const content = `
      Patent US645576A published in 1900.
      According to documented sources from that era.
    `;
    expect(requiresAiLabel(content)).toBe(false);
  });
});

describe('requiresSourceAttribution', () => {
  it('should return true for Tesla claims', () => {
    const content = 'Tesla invented wireless power transmission.';
    expect(requiresSourceAttribution(content)).toBe(true);
  });

  it('should return true for Mallove claims', () => {
    const content = 'Mallove wrote extensively about cold fusion.';
    expect(requiresSourceAttribution(content)).toBe(true);
  });

  it('should return true for Moray claims', () => {
    const content = 'Moray built a radiant energy device.';
    expect(requiresSourceAttribution(content)).toBe(true);
  });

  it('should return true for research claims', () => {
    const content = 'Research shows that LENR is possible.';
    expect(requiresSourceAttribution(content)).toBe(true);
  });

  it('should return true for "according to" phrases', () => {
    const content = 'According to the FBI files, Tesla had many patents.';
    expect(requiresSourceAttribution(content)).toBe(true);
  });

  it('should return false for generic statements', () => {
    const content = 'Energy can be transmitted through various methods.';
    expect(requiresSourceAttribution(content)).toBe(false);
  });
});
