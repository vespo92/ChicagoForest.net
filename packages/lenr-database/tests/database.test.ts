/**
 * LENR Database Unit Tests
 *
 * Tests for LENR research documentation.
 * Validates data integrity, source verification, and API functionality.
 */

import { describe, it, expect } from 'vitest';
import {
  getAllPapers,
  getAllCompanies,
  getAllPrograms,
  getPapersWithDOI,
  getPapersByMethodology,
  getPapersByYearRange,
  getPeerReviewedPapers,
  getGovernmentFundedPapers,
  searchPapers,
  getCompaniesByCountry,
  getActiveCompanies,
  getProgramsByCountry,
  getActivePrograms,
  getDatabaseStats,
  getPaperById,
  getCompanyById,
  getProgramById,
  getDOIList,
  getDatabaseSummary,
  // Paper collections
  fleischmannPonsPapers,
  nasaStudies,
  mitColloquiumPapers,
  // Companies
  brillouinEnergy,
  cleanPlanet,
  industrialHeat,
  // Government programs
  usGovernmentPrograms,
  japanGovernmentPrograms,
  // Sources
  primaryArchives,
  keyDOILinks,
  getAllSources,
} from '../src';

describe('LENR Database', () => {
  describe('Paper Collection', () => {
    it('should return all papers', () => {
      const papers = getAllPapers();
      expect(papers.length).toBeGreaterThan(20);
    });

    it('should have Fleischmann-Pons papers', () => {
      expect(fleischmannPonsPapers.length).toBeGreaterThan(0);
    });

    it('should have NASA studies', () => {
      expect(nasaStudies.length).toBeGreaterThan(0);
    });

    it('should have MIT colloquium papers', () => {
      expect(mitColloquiumPapers.length).toBeGreaterThan(0);
    });

    it('should find paper by ID', () => {
      const paper = getPaperById('fp-1989-original');
      expect(paper).toBeDefined();
      expect(paper?.title).toContain('Electrochemically Induced');
    });

    it('should return undefined for unknown paper', () => {
      const paper = getPaperById('unknown-paper-xyz');
      expect(paper).toBeUndefined();
    });
  });

  describe('Paper Data Integrity', () => {
    it('should have valid years', () => {
      const papers = getAllPapers();
      papers.forEach(paper => {
        expect(paper.year).toBeGreaterThanOrEqual(1989);
        expect(paper.year).toBeLessThanOrEqual(new Date().getFullYear());
      });
    });

    it('should have valid URLs', () => {
      const papers = getAllPapers();
      papers.forEach(paper => {
        expect(paper.url).toMatch(/^https?:\/\//);
      });
    });

    it('should have non-empty authors', () => {
      const papers = getAllPapers();
      papers.forEach(paper => {
        expect(paper.authors.length).toBeGreaterThan(0);
        paper.authors.forEach(author => {
          expect(author.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have valid methodologies', () => {
      const validMethodologies = ['electrochemical', 'gas-loading', 'plasma', 'laser', 'acoustic', 'biological', 'theoretical', 'review', 'other'];
      const papers = getAllPapers();
      papers.forEach(paper => {
        expect(validMethodologies).toContain(paper.methodology);
      });
    });
  });

  describe('DOI Validation', () => {
    it('should have papers with DOIs', () => {
      const papersWithDOI = getPapersWithDOI();
      expect(papersWithDOI.length).toBeGreaterThan(0);
    });

    it('should have valid DOI format', () => {
      const papersWithDOI = getPapersWithDOI();
      papersWithDOI.forEach(paper => {
        expect(paper.doi).toBeDefined();
        expect(paper.doi).toMatch(/^10\./);
      });
    });

    it('should get DOI list with URLs', () => {
      const doiList = getDOIList();
      doiList.forEach(entry => {
        expect(entry.url).toMatch(/^https:\/\/doi\.org\/10\./);
      });
    });

    it('should have key DOI links', () => {
      expect(keyDOILinks.length).toBeGreaterThan(0);
    });
  });

  describe('Paper Filtering', () => {
    it('should filter by methodology', () => {
      const electrochemical = getPapersByMethodology('electrochemical');
      electrochemical.forEach(paper => {
        expect(paper.methodology).toBe('electrochemical');
      });
    });

    it('should filter by year range', () => {
      const papers1990s = getPapersByYearRange(1990, 1999);
      papers1990s.forEach(paper => {
        expect(paper.year).toBeGreaterThanOrEqual(1990);
        expect(paper.year).toBeLessThanOrEqual(1999);
      });
    });

    it('should filter peer-reviewed papers', () => {
      const peerReviewed = getPeerReviewedPapers();
      peerReviewed.forEach(paper => {
        expect(paper.peerReviewed).toBe(true);
      });
    });

    it('should filter government-funded papers', () => {
      const govFunded = getGovernmentFundedPapers();
      govFunded.forEach(paper => {
        expect(paper.tags).toContain('government-funded');
      });
    });
  });

  describe('Paper Search', () => {
    it('should search by query', () => {
      const results = searchPapers({ query: 'fleischmann' });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search by author', () => {
      const results = searchPapers({ authors: ['McKubre'] });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter peer-reviewed only', () => {
      const results = searchPapers({ peerReviewedOnly: true });
      results.forEach(paper => {
        expect(paper.peerReviewed).toBe(true);
      });
    });

    it('should apply limit and offset', () => {
      const allPapers = getAllPapers();
      const limited = searchPapers({ limit: 5 });
      const offset = searchPapers({ offset: 2, limit: 3 });

      expect(limited.length).toBeLessThanOrEqual(5);
      expect(offset.length).toBeLessThanOrEqual(3);
    });

    it('should filter by tags', () => {
      const results = searchPapers({ tags: ['excess-heat'] });
      results.forEach(paper => {
        expect(paper.tags).toContain('excess-heat');
      });
    });
  });

  describe('Company Collection', () => {
    it('should return all companies', () => {
      const companies = getAllCompanies();
      expect(companies.length).toBeGreaterThan(5);
    });

    it('should have Brillouin Energy', () => {
      expect(brillouinEnergy).toBeDefined();
      expect(brillouinEnergy.name).toBe('Brillouin Energy Corporation');
      expect(brillouinEnergy.country).toBe('United States');
      expect(brillouinEnergy.status).toBe('active');
    });

    it('should have Clean Planet', () => {
      expect(cleanPlanet).toBeDefined();
      expect(cleanPlanet.country).toBe('Japan');
    });

    it('should have Industrial Heat', () => {
      expect(industrialHeat).toBeDefined();
    });

    it('should find company by ID', () => {
      const company = getCompanyById('brillouin-energy');
      expect(company).toBeDefined();
      expect(company?.name).toBe('Brillouin Energy Corporation');
    });

    it('should return undefined for unknown company', () => {
      const company = getCompanyById('unknown-company');
      expect(company).toBeUndefined();
    });
  });

  describe('Company Data Integrity', () => {
    it('should have valid websites', () => {
      const companies = getAllCompanies();
      companies.forEach(company => {
        expect(company.website).toMatch(/^https?:\/\//);
      });
    });

    it('should have valid founded years', () => {
      const companies = getAllCompanies();
      companies.forEach(company => {
        expect(company.founded).toBeGreaterThan(1980);
        expect(company.founded).toBeLessThanOrEqual(new Date().getFullYear());
      });
    });

    it('should have valid statuses', () => {
      const validStatuses = ['active', 'acquired', 'closed', 'stealth', 'unknown'];
      const companies = getAllCompanies();
      companies.forEach(company => {
        expect(validStatuses).toContain(company.status);
      });
    });

    it('should have key people defined', () => {
      const companies = getAllCompanies();
      companies.forEach(company => {
        expect(company.keyPeople.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Company Filtering', () => {
    it('should filter by country', () => {
      const usCompanies = getCompaniesByCountry('United States');
      usCompanies.forEach(company => {
        expect(company.country.toLowerCase()).toBe('united states');
      });
    });

    it('should filter active companies', () => {
      const active = getActiveCompanies();
      active.forEach(company => {
        expect(company.status).toBe('active');
      });
    });
  });

  describe('Government Programs', () => {
    it('should return all programs', () => {
      const programs = getAllPrograms();
      expect(programs.length).toBeGreaterThan(5);
    });

    it('should have US government programs', () => {
      expect(usGovernmentPrograms.length).toBeGreaterThan(0);
    });

    it('should have Japan programs', () => {
      expect(japanGovernmentPrograms.length).toBeGreaterThan(0);
    });

    it('should find program by ID', () => {
      const program = getProgramById('doe-1989-review');
      expect(program).toBeDefined();
      expect(program?.agency).toBe('Department of Energy');
    });

    it('should return undefined for unknown program', () => {
      const program = getProgramById('unknown-program');
      expect(program).toBeUndefined();
    });
  });

  describe('Program Data Integrity', () => {
    it('should have valid start years', () => {
      const programs = getAllPrograms();
      programs.forEach(program => {
        expect(program.startYear).toBeGreaterThan(1980);
        expect(program.startYear).toBeLessThanOrEqual(new Date().getFullYear());
      });
    });

    it('should have valid statuses', () => {
      const validStatuses = ['active', 'completed', 'suspended', 'classified', 'unknown'];
      const programs = getAllPrograms();
      programs.forEach(program => {
        expect(validStatuses).toContain(program.status);
      });
    });
  });

  describe('Program Filtering', () => {
    it('should filter by country', () => {
      const usPrograms = getProgramsByCountry('United States');
      usPrograms.forEach(program => {
        expect(program.country.toLowerCase()).toBe('united states');
      });
    });

    it('should filter active programs', () => {
      const active = getActivePrograms();
      active.forEach(program => {
        expect(['active', 'classified']).toContain(program.status);
      });
    });
  });

  describe('Database Statistics', () => {
    it('should return accurate statistics', () => {
      const stats = getDatabaseStats();

      expect(stats.totalPapers).toBe(getAllPapers().length);
      expect(stats.totalCompanies).toBe(getAllCompanies().length);
      expect(stats.totalPrograms).toBe(getAllPrograms().length);
      expect(stats.lastUpdated).toBeDefined();
    });

    it('should have papers by year breakdown', () => {
      const stats = getDatabaseStats();
      expect(Object.keys(stats.papersByYear).length).toBeGreaterThan(0);
    });

    it('should have papers by methodology breakdown', () => {
      const stats = getDatabaseStats();
      expect(Object.keys(stats.papersByMethodology).length).toBeGreaterThan(0);
    });

    it('should have companies by country breakdown', () => {
      const stats = getDatabaseStats();
      expect(Object.keys(stats.companiesByCountry).length).toBeGreaterThan(0);
    });
  });

  describe('Database Summary', () => {
    it('should return summary string', () => {
      const summary = getDatabaseSummary();
      expect(typeof summary).toBe('string');
      expect(summary).toContain('LENR Database Summary');
      expect(summary).toContain('Total Papers');
      expect(summary).toContain('Total Companies');
    });
  });

  describe('Source Verification', () => {
    it('should have primary archives', () => {
      expect(primaryArchives.length).toBeGreaterThan(0);
    });

    it('should get all sources', () => {
      const sources = getAllSources();
      expect(sources.length).toBeGreaterThan(10);
    });

    it('should have LENR-CANR archive', () => {
      const sources = getAllSources();
      const lenrCanr = sources.find(s => s.url.includes('lenr-canr'));
      expect(lenrCanr).toBeDefined();
    });
  });

  describe('Fleischmann-Pons Papers', () => {
    it('should have the original 1989 paper', () => {
      const original = fleischmannPonsPapers.find(p => p.id === 'fp-1989-original');
      expect(original).toBeDefined();
      expect(original?.authors).toContain('Martin Fleischmann');
      expect(original?.authors).toContain('Stanley Pons');
      expect(original?.year).toBe(1989);
      expect(original?.doi).toBe('10.1016/0022-0728(89)80006-3');
    });

    it('should have peer-reviewed papers', () => {
      const peerReviewed = fleischmannPonsPapers.filter(p => p.peerReviewed);
      expect(peerReviewed.length).toBeGreaterThan(0);
    });
  });
});
