/**
 * Agent 13: Compliance - Validator Tests
 *
 * Tests for disclaimer presence, false claim detection, and investment language validation.
 */

import { describe, it, expect } from 'vitest';
import {
  validateDisclaimerPresence,
  validateNoFalseClaims,
  validateNoInvestmentLanguage,
  validateSourceAttribution,
  validateAll,
} from '../src/validators';

describe('validateDisclaimerPresence', () => {
  it('should pass when AI-generated disclaimer is present', () => {
    const content = 'This is AI-generated theoretical content about energy systems.';
    const result = validateDisclaimerPresence(content);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should pass when theoretical framework disclaimer is present', () => {
    const content = 'This theoretical framework describes a possible energy network.';
    const result = validateDisclaimerPresence(content);
    expect(result.isValid).toBe(true);
  });

  it('should pass when conceptual framework disclaimer is present', () => {
    const content = 'This conceptual framework outlines future possibilities.';
    const result = validateDisclaimerPresence(content);
    expect(result.isValid).toBe(true);
  });

  it('should pass when content is marked as not operational', () => {
    const content = 'Note: This system is not operational and exists only as a concept.';
    const result = validateDisclaimerPresence(content);
    expect(result.isValid).toBe(true);
  });

  it('should fail when no disclaimer is present', () => {
    const content = 'The plasma network distributes energy to all nodes efficiently.';
    const result = validateDisclaimerPresence(content);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      'Content must include a disclaimer about AI-generated theoretical nature'
    );
  });
});

describe('validateNoFalseClaims', () => {
  it('should pass when no false claims are present', () => {
    const content = 'This theoretical system could potentially enable wireless energy transfer.';
    const result = validateNoFalseClaims(content);
    expect(result.isValid).toBe(true);
  });

  it('should fail when "working energy device" claim is present', () => {
    const content = 'Our working energy device generates unlimited power.';
    const result = validateNoFalseClaims(content);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('working energy'))).toBe(true);
  });

  it('should fail when "proven technology" claim is present', () => {
    const content = 'This is proven technology that has been validated.';
    const result = validateNoFalseClaims(content);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('proof'))).toBe(true);
  });

  it('should fail when "operational system" claim is present', () => {
    const content = 'The operational system is now delivering power to homes.';
    const result = validateNoFalseClaims(content);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('operational'))).toBe(true);
  });

  it('should fail when "generates energy" claim is present', () => {
    const content = 'This device generates energy from the quantum field.';
    const result = validateNoFalseClaims(content);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('energy generation'))).toBe(true);
  });
});

describe('validateNoInvestmentLanguage', () => {
  it('should pass when no investment language is present', () => {
    const content = 'This research explores theoretical possibilities for energy distribution.';
    const result = validateNoInvestmentLanguage(content);
    expect(result.isValid).toBe(true);
  });

  it('should fail when "investment opportunity" is present', () => {
    const content = 'This is a great investment opportunity in free energy.';
    const result = validateNoInvestmentLanguage(content);
    expect(result.isValid).toBe(false);
  });

  it('should fail when "guaranteed returns" is present', () => {
    const content = 'Get guaranteed returns on your energy technology investment.';
    const result = validateNoInvestmentLanguage(content);
    expect(result.isValid).toBe(false);
  });

  it('should fail when "profit potential" is present', () => {
    const content = 'The profit potential of this technology is unlimited.';
    const result = validateNoInvestmentLanguage(content);
    expect(result.isValid).toBe(false);
  });

  it('should fail when "buy now" is present', () => {
    const content = 'Buy now to secure your position in this revolutionary technology.';
    const result = validateNoInvestmentLanguage(content);
    expect(result.isValid).toBe(false);
  });

  it('should warn when "financial gain" is present', () => {
    const content = 'There may be financial gain from supporting this research.';
    const result = validateNoInvestmentLanguage(content);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('should warn when "limited time" is present', () => {
    const content = 'This is a limited time opportunity to participate.';
    const result = validateNoInvestmentLanguage(content);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('validateSourceAttribution', () => {
  it('should pass when historical claim has nearby source', () => {
    const content = `Tesla invented the rotating magnetic field.
    Source: https://patents.google.com/patent/US381968A`;
    const result = validateSourceAttribution(content);
    expect(result.warnings).toHaveLength(0);
  });

  it('should warn when historical claim lacks source', () => {
    const content = 'Tesla invented revolutionary wireless power transmission.';
    const result = validateSourceAttribution(content);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.includes('Tesla'))).toBe(true);
  });

  it('should pass when source is markdown link format', () => {
    const content = `Mallove demonstrated the reality of cold fusion
    [source](https://lenr-canr.org/acrobat/MalloveEfirefromi.pdf)`;
    const result = validateSourceAttribution(content);
    expect(result.warnings.filter(w => w.includes('Mallove'))).toHaveLength(0);
  });
});

describe('validateAll', () => {
  it('should pass fully compliant content', () => {
    const content = `
      # Theoretical Framework

      This AI-generated theoretical framework describes a possible energy network.

      Tesla developed the rotating magnetic field (patent US381968A: https://patents.google.com/patent/US381968A).

      This system could potentially enable wireless energy distribution.
    `;
    const result = validateAll(content);
    expect(result.isValid).toBe(true);
  });

  it('should fail content with multiple violations', () => {
    const content = `
      This working energy device generates unlimited power.
      It's a great investment opportunity with guaranteed returns.
      Buy now to secure your position.
    `;
    const result = validateAll(content);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(2);
  });

  it('should collect all errors and warnings', () => {
    const content = `
      Tesla invented something amazing.
      This is a limited time offer.
    `;
    const result = validateAll(content);
    // Should have disclaimer error and source warning
    expect(result.errors.length + result.warnings.length).toBeGreaterThan(0);
  });
});
