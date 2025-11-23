/**
 * Agent 12: Scribe - Templates Tests
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework.
 */

import { describe, it, expect } from 'vitest';
import {
  renderTemplate,
  patentSummaryTemplate,
  paperAbstractTemplate,
  companyProfileTemplate,
  timelineEntryTemplate,
  sourceCardTemplate,
  templates,
} from '../src/templates';
import { STANDARD_LABELS, DISCLAIMERS } from '../src/labeling';

describe('Templates', () => {
  describe('patentSummaryTemplate', () => {
    const patentData = {
      patentNumber: 'US645576A',
      title: 'System of Transmission of Electrical Energy',
      inventor: 'Nikola Tesla',
      filingDate: '1900-03-20',
      abstract: 'A system for transmitting electrical energy wirelessly...',
      keyInnovations: ['Wireless transmission', 'Earth resonance', 'High frequency'],
      url: 'https://patents.google.com/patent/US645576A',
    };

    it('should render plaintext format', () => {
      const output = patentSummaryTemplate.render(patentData);

      expect(output).toContain(STANDARD_LABELS.AI_SUMMARIZED);
      expect(output).toContain(patentData.patentNumber);
      expect(output).toContain(patentData.title);
      expect(output).toContain(patentData.inventor);
      expect(output).toContain('Wireless transmission');
    });

    it('should render HTML format', () => {
      const output = patentSummaryTemplate.renderHtml(patentData);

      expect(output).toContain('<article');
      expect(output).toContain(patentData.patentNumber);
      expect(output).toContain(patentData.url);
      expect(output).toContain('target="_blank"');
    });

    it('should render Markdown format', () => {
      const output = patentSummaryTemplate.renderMarkdown(patentData);

      expect(output).toContain('##');
      expect(output).toContain('**Inventor:**');
      expect(output).toContain(`[${patentData.patentNumber}]`);
    });

    it('should include disclaimer', () => {
      const output = patentSummaryTemplate.render(patentData);

      expect(output).toContain(DISCLAIMERS.ai_summarized);
    });
  });

  describe('paperAbstractTemplate', () => {
    const paperData = {
      doi: '10.1016/j.fusengdes.2015.06.030',
      title: 'LENR Research Progress',
      authors: ['Researcher A', 'Researcher B'],
      journal: 'Fusion Engineering and Design',
      year: 2015,
      abstract: 'This paper reviews recent progress in LENR research...',
      keyFindings: ['Excess heat observed', 'Reproducible results'],
    };

    it('should render plaintext format', () => {
      const output = paperAbstractTemplate.render(paperData);

      expect(output).toContain(paperData.title);
      expect(output).toContain(paperData.authors[0]);
      expect(output).toContain(paperData.journal!);
      expect(output).toContain(`https://doi.org/${paperData.doi}`);
    });

    it('should render HTML format with DOI link', () => {
      const output = paperAbstractTemplate.renderHtml(paperData);

      expect(output).toContain(`href="https://doi.org/${paperData.doi}"`);
      expect(output).toContain('paper-abstract');
    });

    it('should render Markdown format', () => {
      const output = paperAbstractTemplate.renderMarkdown(paperData);

      expect(output).toContain('**Authors:**');
      expect(output).toContain('**DOI:**');
      expect(output).toContain('### Key Findings');
    });
  });

  describe('companyProfileTemplate', () => {
    const companyData = {
      name: 'Brillouin Energy',
      website: 'https://brillouinenergy.com',
      founded: 2005,
      focus: 'LENR technology development',
      status: 'active',
      researchAreas: ['LENR', 'Heat generation', 'Energy systems'],
      description: 'A company developing controlled low energy nuclear reactions.',
    };

    it('should render plaintext format', () => {
      const output = companyProfileTemplate.render(companyData);

      expect(output).toContain(STANDARD_LABELS.AI_GENERATED);
      expect(output).toContain(companyData.name);
      expect(output).toContain(companyData.website!);
      expect(output).toContain('LENR');
    });

    it('should render HTML format with status', () => {
      const output = companyProfileTemplate.renderHtml(companyData);

      expect(output).toContain('company-profile');
      expect(output).toContain('ACTIVE');
      expect(output).toContain('color: green');
    });

    it('should render Markdown format', () => {
      const output = companyProfileTemplate.renderMarkdown(companyData);

      expect(output).toContain('## Brillouin Energy');
      expect(output).toContain('**Status:** ACTIVE');
      expect(output).toContain('### Research Areas');
    });
  });

  describe('timelineEntryTemplate', () => {
    const timelineData = {
      date: '1899-05-17',
      title: 'Tesla begins Colorado Springs experiments',
      description: 'Nikola Tesla started his famous experiments at Colorado Springs...',
      sources: ['https://teslaresearch.org/colorado'],
      isVerified: true,
    };

    it('should render verified entries with historical fact label', () => {
      const output = timelineEntryTemplate.render(timelineData);

      expect(output).toContain(STANDARD_LABELS.HISTORICAL_FACT);
      expect(output).toContain(timelineData.date);
      expect(output).toContain(timelineData.title);
    });

    it('should render unverified entries with AI-generated label', () => {
      const unverifiedData = { ...timelineData, isVerified: false };
      const output = timelineEntryTemplate.render(unverifiedData);

      expect(output).toContain(STANDARD_LABELS.AI_GENERATED);
    });

    it('should include source links', () => {
      const output = timelineEntryTemplate.render(timelineData);

      expect(output).toContain(timelineData.sources[0]);
    });
  });

  describe('sourceCardTemplate', () => {
    const sourceData = {
      title: 'Tesla Patent US645576A',
      type: 'Patent',
      url: 'https://patents.google.com/patent/US645576A',
      lastVerified: '2024-01-15',
      status: 'verified' as const,
    };

    it('should render verified status', () => {
      const output = sourceCardTemplate.render(sourceData);

      expect(output).toContain('✅');
      expect(output).toContain(sourceData.title);
      expect(output).toContain(sourceData.url);
    });

    it('should render pending status', () => {
      const pendingData = { ...sourceData, status: 'pending' as const };
      const output = sourceCardTemplate.render(pendingData);

      expect(output).toContain('⏳');
    });

    it('should render broken status', () => {
      const brokenData = { ...sourceData, status: 'broken' as const };
      const output = sourceCardTemplate.render(brokenData);

      expect(output).toContain('❌');
    });

    it('should render HTML with correct status color', () => {
      const output = sourceCardTemplate.renderHtml(sourceData);

      expect(output).toContain('color: green');
      expect(output).toContain('data-status="verified"');
    });
  });

  describe('renderTemplate', () => {
    it('should render template by type', () => {
      const output = renderTemplate('patent_summary', {
        patentNumber: 'US787412A',
        title: 'Magnifying Transmitter',
        inventor: 'Nikola Tesla',
        abstract: 'A system for amplifying electrical oscillations...',
      });

      expect(output).toContain('US787412A');
      expect(output).toContain('Nikola Tesla');
    });

    it('should support different formats', () => {
      const data = {
        patentNumber: 'US787412A',
        title: 'Test Patent',
        inventor: 'Test Inventor',
        abstract: 'Test abstract',
      };

      const plaintext = renderTemplate('patent_summary', data, 'plaintext');
      const html = renderTemplate('patent_summary', data, 'html');
      const markdown = renderTemplate('patent_summary', data, 'markdown');

      expect(plaintext).not.toContain('<');
      expect(html).toContain('<article');
      expect(markdown).toContain('##');
    });

    it('should throw for unknown template type', () => {
      expect(() => {
        renderTemplate('unknown_type' as any, {});
      }).toThrow('Unknown template type');
    });
  });

  describe('templates registry', () => {
    it('should have all required templates', () => {
      expect(templates.patent_summary).toBeDefined();
      expect(templates.paper_abstract).toBeDefined();
      expect(templates.company_profile).toBeDefined();
      expect(templates.timeline_entry).toBeDefined();
      expect(templates.source_card).toBeDefined();
    });

    it('should have version for all templates', () => {
      Object.values(templates).forEach(template => {
        expect(template.version).toBeDefined();
        expect(template.version).toMatch(/^\d+\.\d+\.\d+$/);
      });
    });

    it('should have all render methods', () => {
      Object.values(templates).forEach(template => {
        expect(typeof template.render).toBe('function');
        expect(typeof template.renderHtml).toBe('function');
        expect(typeof template.renderMarkdown).toBe('function');
      });
    });
  });
});
