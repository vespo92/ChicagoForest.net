/**
 * LENR Database Type Definitions
 *
 * DISCLAIMER: This package documents REAL scientific research on Low Energy
 * Nuclear Reactions (LENR). All sources are verified and include DOI links
 * or institutional references. LENR research is ongoing - inclusion here
 * does not constitute endorsement of any specific claims.
 */

/**
 * Research paper entry with verified DOI
 */
export interface LENRPaper {
  /** Unique identifier for this paper */
  id: string;

  /** Paper title as published */
  title: string;

  /** List of authors */
  authors: string[];

  /** Publication year */
  year: number;

  /** Journal or publication venue */
  journal: string;

  /** DOI if available (must be verified) */
  doi?: string;

  /** Direct URL to paper or archive */
  url: string;

  /** Brief abstract or summary */
  abstract: string;

  /** Categorization tags */
  tags: LENRTag[];

  /** Research methodology category */
  methodology: ResearchMethodology;

  /** Whether peer-reviewed */
  peerReviewed: boolean;

  /** Citation count if known */
  citations?: number;

  /** Additional notes about this paper */
  notes?: string;
}

/**
 * Company or organization actively researching LENR
 */
export interface LENRCompany {
  /** Unique identifier */
  id: string;

  /** Company/organization name */
  name: string;

  /** Country of operation */
  country: string;

  /** Official website */
  website: string;

  /** Year founded or began LENR research */
  founded: number;

  /** Current operational status */
  status: CompanyStatus;

  /** Primary technology or approach */
  technology: string;

  /** Key personnel and their roles */
  keyPeople: Person[];

  /** Known funding sources or amounts */
  funding?: FundingInfo[];

  /** Published research or patents */
  publications: string[];

  /** Patent numbers if applicable */
  patents?: string[];

  /** Brief description of their work */
  description: string;

  /** Last verified date of information */
  lastVerified: string;
}

/**
 * Government program funding LENR research
 */
export interface GovernmentProgram {
  /** Unique identifier */
  id: string;

  /** Program name */
  name: string;

  /** Sponsoring agency */
  agency: string;

  /** Country */
  country: string;

  /** Program start year */
  startYear: number;

  /** Program end year if concluded */
  endYear?: number;

  /** Current status */
  status: ProgramStatus;

  /** Known budget if public */
  budget?: string;

  /** Official program page or documentation */
  url?: string;

  /** Description of program goals */
  description: string;

  /** Key researchers involved */
  researchers?: string[];

  /** Published results or reports */
  publications?: string[];

  /** Whether classified components exist */
  hasClassifiedComponents?: boolean;
}

/**
 * Person associated with LENR research
 */
export interface Person {
  name: string;
  role: string;
  affiliation?: string;
}

/**
 * Funding information
 */
export interface FundingInfo {
  source: string;
  amount?: string;
  year?: number;
  type: 'grant' | 'investment' | 'government' | 'private';
}

/**
 * Research methodology categories
 */
export type ResearchMethodology =
  | 'electrochemical'    // Fleischmann-Pons type
  | 'gas-loading'        // Hydrogen/deuterium gas loading
  | 'plasma'             // Plasma-based experiments
  | 'laser'              // Laser-triggered reactions
  | 'acoustic'           // Sonofusion/acoustic cavitation
  | 'biological'         // Biological transmutation
  | 'theoretical'        // Theoretical frameworks
  | 'review'             // Review/meta-analysis
  | 'other';

/**
 * Topic tags for categorization
 */
export type LENRTag =
  | 'excess-heat'
  | 'transmutation'
  | 'tritium-production'
  | 'helium-production'
  | 'neutron-detection'
  | 'palladium-deuterium'
  | 'nickel-hydrogen'
  | 'replication-study'
  | 'calorimetry'
  | 'materials-science'
  | 'theoretical-framework'
  | 'government-funded'
  | 'industry-research';

/**
 * Company operational status
 */
export type CompanyStatus =
  | 'active'
  | 'acquired'
  | 'closed'
  | 'stealth'
  | 'unknown';

/**
 * Government program status
 */
export type ProgramStatus =
  | 'active'
  | 'completed'
  | 'suspended'
  | 'classified'
  | 'unknown';

/**
 * Database statistics
 */
export interface DatabaseStats {
  totalPapers: number;
  totalCompanies: number;
  totalPrograms: number;
  papersByYear: Record<number, number>;
  papersByMethodology: Record<ResearchMethodology, number>;
  companiesByCountry: Record<string, number>;
  lastUpdated: string;
}

/**
 * Search parameters for querying the database
 */
export interface SearchParams {
  query?: string;
  authors?: string[];
  yearRange?: { start: number; end: number };
  methodology?: ResearchMethodology[];
  tags?: LENRTag[];
  peerReviewedOnly?: boolean;
  limit?: number;
  offset?: number;
}
