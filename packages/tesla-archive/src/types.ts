/**
 * Tesla Archive Types
 *
 * DISCLAIMER: This package documents REAL historical research by Nikola Tesla.
 * All sources are verified and linked to official archives.
 * Theoretical extensions are clearly marked as AI-generated speculation.
 */

/**
 * Represents a verified historical source
 */
export interface VerifiedSource {
  /** Unique identifier for the source */
  id: string;
  /** Type of source document */
  type: 'patent' | 'paper' | 'archive' | 'government' | 'book' | 'article';
  /** Title of the source */
  title: string;
  /** Author(s) of the source */
  author: string;
  /** Publication or filing date */
  date: string;
  /** Verified URL to the source - MUST be real and clickable */
  url: string;
  /** Archive or database hosting the source */
  archive: string;
  /** Brief description of content */
  description: string;
  /** Whether URL has been verified as accessible */
  verified: boolean;
  /** Date of last verification */
  lastVerified?: string;
}

/**
 * Represents a Tesla patent
 */
export interface TeslaPatent {
  /** US Patent number (e.g., "US645576A") */
  patentNumber: string;
  /** Patent title */
  title: string;
  /** Filing date */
  filingDate: string;
  /** Grant date */
  grantDate: string;
  /** Direct link to Google Patents */
  googlePatentsUrl: string;
  /** Patent abstract */
  abstract: string;
  /** Key claims from the patent */
  keyClaims: string[];
  /** Related patents */
  relatedPatents: string[];
  /** Modern relevance and applications */
  modernRelevance: string;
  /** Category of invention */
  category: 'wireless-transmission' | 'magnifying-transmitter' | 'radiant-energy' | 'oscillator' | 'motor' | 'lighting' | 'other';
}

/**
 * Historical experiment record
 */
export interface ExperimentRecord {
  /** Unique identifier */
  id: string;
  /** Location of experiment */
  location: 'colorado-springs' | 'wardenclyffe' | 'new-york-lab' | 'other';
  /** Date or date range */
  date: string;
  /** Description of experiment */
  description: string;
  /** Documented results */
  results: string;
  /** Witnesses present (if documented) */
  witnesses?: string[];
  /** Source references */
  sources: VerifiedSource[];
  /** Whether results were independently verified */
  independentlyVerified: boolean;
}

/**
 * Facility specification
 */
export interface FacilitySpec {
  /** Facility name */
  name: string;
  /** Location */
  location: string;
  /** Date range of operation */
  operationalPeriod: string;
  /** Physical specifications */
  specifications: Record<string, string | number>;
  /** Purpose and goals */
  purpose: string;
  /** Historical significance */
  historicalSignificance: string;
  /** Current status */
  currentStatus: string;
  /** Source documentation */
  sources: VerifiedSource[];
}

/**
 * Declassified document reference
 */
export interface DeclassifiedDocument {
  /** Document identifier */
  id: string;
  /** Agency that declassified it */
  agency: 'FBI' | 'DOD' | 'DOE' | 'other';
  /** Document title */
  title: string;
  /** Declassification date */
  declassificationDate: string;
  /** Direct URL to document */
  url: string;
  /** Number of pages */
  pageCount: number;
  /** Summary of contents */
  summary: string;
  /** Key revelations or findings */
  keyFindings: string[];
}

/**
 * Theoretical extension (AI-generated speculation)
 * MUST be clearly marked as non-historical
 */
export interface TheoreticalExtension {
  /** Clear label that this is theoretical */
  readonly isTheoretical: true;
  /** AI-generated disclaimer */
  readonly disclaimer: string;
  /** What historical basis this builds upon */
  historicalBasis: VerifiedSource[];
  /** The theoretical concept */
  concept: string;
  /** Why this is speculative */
  speculativeNature: string;
  /** Potential future research directions */
  researchDirections: string[];
}

/**
 * Archive search parameters
 */
export interface ArchiveSearchParams {
  /** Search query */
  query?: string;
  /** Filter by category */
  category?: TeslaPatent['category'];
  /** Filter by date range */
  dateRange?: {
    start: string;
    end: string;
  };
  /** Filter by location */
  location?: ExperimentRecord['location'];
  /** Include only verified sources */
  verifiedOnly?: boolean;
}

/**
 * Archive statistics
 */
export interface ArchiveStats {
  /** Total patents catalogued */
  totalPatents: number;
  /** Total experiments documented */
  totalExperiments: number;
  /** Total verified sources */
  totalVerifiedSources: number;
  /** Declassified documents referenced */
  declassifiedDocuments: number;
  /** Date of last update */
  lastUpdated: string;
}
