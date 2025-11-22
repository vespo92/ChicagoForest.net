/**
 * Tesla Archive Unit Tests
 *
 * Tests for Tesla historical research documentation.
 * Validates data integrity, source verification, and API functionality.
 */

import { describe, it, expect } from 'vitest';
import {
  getAllPatents,
  getPatentByNumber,
  getArchiveStats,
  getAllPatentUrls,
  VERSION,
  DISCLAIMER,
  // Patents
  US645576A,
  US787412A,
  US685957A,
  WIRELESS_TRANSMISSION_PATENTS,
  MAGNIFYING_TRANSMITTER_PATENTS,
  RADIANT_ENERGY_PATENTS,
  // Sources
  getAllVerifiedSources,
  getFBIDeclassifiedDocuments,
  getSourceById,
  FBI_DECLASSIFIED_DOCUMENTS,
  PATENT_DATABASES,
  TESLA_ARCHIVES,
  // Wardenclyffe
  WARDENCLYFFE_TOWER_SPECS,
  getTowerSpecsSummary,
  // Colorado Springs
  DOCUMENTED_EXPERIMENTS,
  getAllExperiments,
  getVerifiedExperiments,
  // Diary
  SIGNIFICANT_DIARY_ENTRIES,
  getAllDiaryEntries,
  getEntryByDate,
} from '../src';

describe('Tesla Archive', () => {
  describe('Package Metadata', () => {
    it('should have a valid version', () => {
      expect(VERSION).toBe('1.0.0');
    });

    it('should have a comprehensive disclaimer', () => {
      expect(DISCLAIMER).toContain('TESLA ARCHIVE DISCLAIMER');
      expect(DISCLAIMER).toContain('Google Patents');
      expect(DISCLAIMER).toContain('FBI Vault');
      expect(DISCLAIMER).toContain('DOES NOT CLAIM');
    });
  });

  describe('Patent Collection', () => {
    it('should return all patents', () => {
      const patents = getAllPatents();
      expect(patents.length).toBeGreaterThan(10);
    });

    it('should have wireless transmission patents', () => {
      expect(WIRELESS_TRANSMISSION_PATENTS.length).toBeGreaterThan(0);
      expect(WIRELESS_TRANSMISSION_PATENTS.every(p => p.category === 'wireless-transmission')).toBe(true);
    });

    it('should have magnifying transmitter patents', () => {
      expect(MAGNIFYING_TRANSMITTER_PATENTS.length).toBeGreaterThan(0);
      expect(MAGNIFYING_TRANSMITTER_PATENTS.every(p => p.category === 'magnifying-transmitter')).toBe(true);
    });

    it('should have radiant energy patents', () => {
      expect(RADIANT_ENERGY_PATENTS.length).toBeGreaterThan(0);
      expect(RADIANT_ENERGY_PATENTS.every(p => p.category === 'radiant-energy')).toBe(true);
    });

    it('should find patent by number', () => {
      const patent = getPatentByNumber('US645576A');
      expect(patent).toBeDefined();
      expect(patent?.title).toBe('Apparatus for Transmitting Electrical Energy');
    });

    it('should return undefined for unknown patent', () => {
      const patent = getPatentByNumber('US000000X');
      expect(patent).toBeUndefined();
    });
  });

  describe('Patent Data Integrity', () => {
    it('should have valid Google Patents URLs', () => {
      const patents = getAllPatents();
      patents.forEach(patent => {
        expect(patent.googlePatentsUrl).toMatch(/^https:\/\/patents\.google\.com\/patent\//);
        expect(patent.googlePatentsUrl).toContain(patent.patentNumber);
      });
    });

    it('should have valid date formats', () => {
      const patents = getAllPatents();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      patents.forEach(patent => {
        expect(patent.filingDate).toMatch(dateRegex);
        expect(patent.grantDate).toMatch(dateRegex);
      });
    });

    it('should have non-empty key claims', () => {
      const patents = getAllPatents();
      patents.forEach(patent => {
        expect(patent.keyClaims.length).toBeGreaterThan(0);
        patent.keyClaims.forEach(claim => {
          expect(claim.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have valid categories', () => {
      const validCategories = ['wireless-transmission', 'magnifying-transmitter', 'radiant-energy', 'oscillator', 'motor', 'lighting', 'other'];
      const patents = getAllPatents();
      patents.forEach(patent => {
        expect(validCategories).toContain(patent.category);
      });
    });
  });

  describe('Specific Patent Tests', () => {
    it('should have correct US645576A details', () => {
      expect(US645576A.patentNumber).toBe('US645576A');
      expect(US645576A.title).toBe('Apparatus for Transmitting Electrical Energy');
      expect(US645576A.filingDate).toBe('1897-09-02');
      expect(US645576A.grantDate).toBe('1900-03-20');
      expect(US645576A.googlePatentsUrl).toBe('https://patents.google.com/patent/US645576A');
    });

    it('should have correct US787412A details', () => {
      expect(US787412A.patentNumber).toBe('US787412A');
      expect(US787412A.title).toContain('Natural Mediums');
      expect(US787412A.category).toBe('wireless-transmission');
    });

    it('should have correct US685957A (radiant energy) details', () => {
      expect(US685957A.patentNumber).toBe('US685957A');
      expect(US685957A.title).toContain('Radiant Energy');
      expect(US685957A.category).toBe('radiant-energy');
    });
  });

  describe('Verified Sources', () => {
    it('should return all verified sources', () => {
      const sources = getAllVerifiedSources();
      expect(sources.length).toBeGreaterThan(5);
    });

    it('should have valid URLs for all sources', () => {
      const sources = getAllVerifiedSources();
      sources.forEach(source => {
        expect(source.url).toMatch(/^https?:\/\//);
      });
    });

    it('should have patent database sources', () => {
      expect(PATENT_DATABASES.length).toBeGreaterThan(0);
      expect(PATENT_DATABASES.some(s => s.url.includes('patents.google.com'))).toBe(true);
    });

    it('should have Tesla archive sources', () => {
      expect(TESLA_ARCHIVES.length).toBeGreaterThan(0);
      expect(TESLA_ARCHIVES.some(s => s.url.includes('teslauniverse.com'))).toBe(true);
    });

    it('should find source by ID', () => {
      const source = getSourceById('google-patents');
      expect(source).toBeDefined();
      expect(source?.title).toBe('Google Patents');
    });
  });

  describe('FBI Declassified Documents', () => {
    it('should have FBI documents', () => {
      const docs = getFBIDeclassifiedDocuments();
      expect(docs.length).toBeGreaterThan(0);
    });

    it('should have valid FBI vault URLs', () => {
      FBI_DECLASSIFIED_DOCUMENTS.forEach(doc => {
        expect(doc.url).toMatch(/^https:\/\/vault\.fbi\.gov/);
      });
    });

    it('should have page counts and key findings', () => {
      FBI_DECLASSIFIED_DOCUMENTS.forEach(doc => {
        expect(doc.pageCount).toBeGreaterThan(0);
        expect(doc.keyFindings.length).toBeGreaterThan(0);
      });
    });

    it('should have correct declassification dates', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      FBI_DECLASSIFIED_DOCUMENTS.forEach(doc => {
        expect(doc.declassificationDate).toMatch(dateRegex);
      });
    });
  });

  describe('Wardenclyffe Documentation', () => {
    it('should have tower specifications', () => {
      expect(WARDENCLYFFE_TOWER_SPECS).toBeDefined();
      expect(WARDENCLYFFE_TOWER_SPECS.name).toContain('Wardenclyffe');
    });

    it('should have tower specs summary', () => {
      const summary = getTowerSpecsSummary();
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
    });
  });

  describe('Colorado Springs Experiments', () => {
    it('should have documented experiments', () => {
      expect(DOCUMENTED_EXPERIMENTS.length).toBeGreaterThan(0);
    });

    it('should get all experiments', () => {
      const experiments = getAllExperiments();
      expect(experiments.length).toBeGreaterThan(0);
    });

    it('should get verified experiments only', () => {
      const verified = getVerifiedExperiments();
      verified.forEach(exp => {
        expect(exp.sources.length).toBeGreaterThan(0);
      });
    });

    it('experiments should have valid location', () => {
      const experiments = getAllExperiments();
      experiments.forEach(exp => {
        expect(['colorado-springs', 'wardenclyffe', 'new-york-lab', 'other']).toContain(exp.location);
      });
    });
  });

  describe('Diary Notes', () => {
    it('should have significant diary entries', () => {
      expect(SIGNIFICANT_DIARY_ENTRIES.length).toBeGreaterThan(0);
    });

    it('should get all diary entries', () => {
      const entries = getAllDiaryEntries();
      expect(entries.length).toBeGreaterThan(0);
    });

    it('should find entry by date', () => {
      const entries = getAllDiaryEntries();
      if (entries.length > 0) {
        const firstEntry = entries[0];
        const found = getEntryByDate(firstEntry.date);
        expect(found).toBeDefined();
      }
    });
  });

  describe('Archive Statistics', () => {
    it('should return accurate statistics', () => {
      const stats = getArchiveStats();

      expect(stats.totalPatents).toBe(getAllPatents().length);
      expect(stats.totalExperiments).toBe(DOCUMENTED_EXPERIMENTS.length);
      expect(stats.totalVerifiedSources).toBe(getAllVerifiedSources().length);
      expect(stats.declassifiedDocuments).toBe(FBI_DECLASSIFIED_DOCUMENTS.length);
      expect(stats.lastUpdated).toBeDefined();
    });
  });

  describe('Patent URL Helper', () => {
    it('should return all patent URLs', () => {
      const urls = getAllPatentUrls();
      const patents = getAllPatents();

      expect(Object.keys(urls).length).toBe(patents.length);
      patents.forEach(patent => {
        expect(urls[patent.patentNumber]).toBe(patent.googlePatentsUrl);
      });
    });
  });
});
