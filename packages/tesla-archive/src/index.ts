/**
 * Tesla Deep Research Archive
 *
 * A comprehensive historical documentation package for Nikola Tesla's
 * wireless power transmission research, patents, and experiments.
 *
 * ==========================================================================
 * IMPORTANT DISCLAIMER
 * ==========================================================================
 *
 * This package documents REAL historical research by Nikola Tesla.
 * All sources are verified and linked to official archives including:
 * - Google Patents (https://patents.google.com)
 * - FBI Vault (https://vault.fbi.gov)
 * - Tesla Universe (https://teslauniverse.com)
 * - Library of Congress (https://www.loc.gov)
 * - Nikola Tesla Museum Belgrade (https://tesla-museum.org)
 *
 * Theoretical extensions are clearly marked as AI-generated speculation.
 * This package does NOT claim any system is operational or that "free energy"
 * devices exist. It preserves and shares historical research for educational
 * purposes.
 *
 * ==========================================================================
 *
 * @packageDocumentation
 * @module @chicago-forest/tesla-archive
 */

// Types
export type {
  VerifiedSource,
  TeslaPatent,
  ExperimentRecord,
  FacilitySpec,
  DeclassifiedDocument,
  TheoreticalExtension,
  ArchiveSearchParams,
  ArchiveStats
} from './types.js';

// Sources
export {
  PATENT_DATABASES,
  TESLA_ARCHIVES,
  TESLA_PRIMARY_SOURCES,
  ACADEMIC_SOURCES,
  FBI_DECLASSIFIED_DOCUMENTS,
  getAllVerifiedSources,
  getFBIDeclassifiedDocuments,
  getSourceById,
  getSourceUrl
} from './sources.js';

// Patents - Wireless Transmission
export {
  US645576A,
  US649621A,
  US787412A,
  US1119732A,
  US685012A,
  WIRELESS_TRANSMISSION_PATENTS,
  getWirelessPatentByNumber,
  getWirelessPatentUrls
} from './patents/wireless-transmission.js';

// Patents - Magnifying Transmitter
export {
  US593138A,
  US568176A,
  US512340A,
  US454622A,
  US514168A,
  MAGNIFYING_TRANSMITTER_PATENTS,
  getMagnifyingPatentByNumber,
  getMagnifyingPatentUrls
} from './patents/magnifying-transmitter.js';

// Patents - Radiant Energy
export {
  US685957A,
  US685958A,
  US577670A,
  US613809A,
  RADIANT_ENERGY_PATENTS,
  getRadiantPatentByNumber,
  getRadiantPatentUrls
} from './patents/radiant-energy.js';

// Wardenclyffe
export {
  WARDENCLYFFE_TOWER_SPECS,
  WARDENCLYFFE_TIMELINE,
  WARDENCLYFFE_SOURCES,
  getTowerSpecsSummary,
  getWardenclyffeSources
} from './wardenclyffe/tower-specs.js';

export {
  WARDENCLYFFE_INVESTMENTS,
  FINANCIAL_TIMELINE,
  FINANCIAL_ANALYSIS,
  FINANCIAL_SOURCES,
  getFinancialSummary,
  getInvestmentRecords
} from './wardenclyffe/financial-history.js';

// Colorado Springs
export {
  COLORADO_SPRINGS_FACILITY,
  COLORADO_SPRINGS_SOURCES,
  DOCUMENTED_EXPERIMENTS,
  getExperimentById,
  getAllExperiments,
  getVerifiedExperiments,
  getFacilitySpecs
} from './colorado-springs/experiments.js';

export {
  DIARY_SOURCE,
  SIGNIFICANT_DIARY_ENTRIES,
  DIARY_CONTENT_CATEGORIES,
  KEY_FINDINGS_SUMMARY,
  getAllDiaryEntries,
  getEntryByDate,
  getEntriesInRange,
  getDiarySource
} from './colorado-springs/diary-notes.js';

// Convenience exports
import { WIRELESS_TRANSMISSION_PATENTS } from './patents/wireless-transmission.js';
import { MAGNIFYING_TRANSMITTER_PATENTS } from './patents/magnifying-transmitter.js';
import { RADIANT_ENERGY_PATENTS } from './patents/radiant-energy.js';
import { getAllVerifiedSources, getFBIDeclassifiedDocuments } from './sources.js';
import { DOCUMENTED_EXPERIMENTS } from './colorado-springs/experiments.js';

import type { TeslaPatent, ArchiveStats } from './types.js';

/**
 * Get all Tesla patents in the archive
 */
export function getAllPatents(): TeslaPatent[] {
  return [
    ...WIRELESS_TRANSMISSION_PATENTS,
    ...MAGNIFYING_TRANSMITTER_PATENTS,
    ...RADIANT_ENERGY_PATENTS
  ];
}

/**
 * Get patent by patent number (searches all categories)
 */
export function getPatentByNumber(patentNumber: string): TeslaPatent | undefined {
  return getAllPatents().find(p => p.patentNumber === patentNumber);
}

/**
 * Get archive statistics
 */
export function getArchiveStats(): ArchiveStats {
  return {
    totalPatents: getAllPatents().length,
    totalExperiments: DOCUMENTED_EXPERIMENTS.length,
    totalVerifiedSources: getAllVerifiedSources().length,
    declassifiedDocuments: getFBIDeclassifiedDocuments().length,
    lastUpdated: '2024-01-15'
  };
}

/**
 * Get all patent URLs for quick reference
 */
export function getAllPatentUrls(): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const patent of getAllPatents()) {
    urls[patent.patentNumber] = patent.googlePatentsUrl;
  }
  return urls;
}

/**
 * Package version
 */
export const VERSION = '1.0.0';

/**
 * Package disclaimer - MUST be displayed in any application using this package
 */
export const DISCLAIMER = `
==========================================================================
TESLA ARCHIVE DISCLAIMER
==========================================================================

This package documents REAL historical research by Nikola Tesla.
Sources are verified and linked to official archives.

WHAT THIS PACKAGE PROVIDES:
- Verified patent information with Google Patents links
- Historical facility specifications based on documentation
- Experiment records from Tesla's own laboratory notes
- FBI declassified documents with vault.fbi.gov links

WHAT THIS PACKAGE DOES NOT CLAIM:
- That any "free energy" device exists or is operational
- That wireless power transmission at scale is currently practical
- That suppressed technology is being hidden
- That the theoretical concepts represent proven science

All theoretical extensions are clearly marked as AI-generated speculation.
This is an educational resource for historical research preservation.

For more information, visit the official archives:
- Google Patents: https://patents.google.com
- FBI Vault: https://vault.fbi.gov/nikola-tesla
- Tesla Universe: https://teslauniverse.com
- Tesla Museum Belgrade: https://tesla-museum.org
==========================================================================
`;
