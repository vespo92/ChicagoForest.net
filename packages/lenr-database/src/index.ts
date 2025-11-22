/**
 * @chicago-forest/lenr-database
 *
 * Low Energy Nuclear Reactions (LENR) Scientific Database
 *
 * A comprehensive database of LENR research including:
 * - 40+ peer-reviewed and conference papers with DOI links
 * - 10+ active and historical companies
 * - 15+ government programs worldwide
 *
 * DISCLAIMER: This database documents REAL scientific research.
 * All sources are verified. LENR research is ongoing - inclusion
 * here does not constitute endorsement of any specific claims.
 * All theoretical extensions are clearly marked.
 *
 * @see https://lenr-canr.org/ - Primary LENR research archive
 * @license MIT
 */

// Export types
export type {
  LENRPaper,
  LENRCompany,
  GovernmentProgram,
  Person,
  FundingInfo,
  ResearchMethodology,
  LENRTag,
  CompanyStatus,
  ProgramStatus,
  DatabaseStats,
  SearchParams,
} from './types';

// Export database functions
export {
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
} from './database';

// Export source verification
export {
  primaryArchives,
  patentDatabases,
  governmentSources,
  academicJournals,
  companySources,
  historicalArchives,
  keyDOILinks,
  getAllSources,
  getSourceCount,
  getKeyDOILinks,
} from './sources';

// Export paper collections
export { fleischmannPonsPapers, getAllFPPapers, getFPPapersByYear, getFPPapersWithDOI } from './papers/fleischmann-pons';
export { nasaStudies, nasaResearchers, getAllNASAStudies, getNASAStudiesByMethodology } from './papers/nasa-studies';
export { mitColloquiumPapers, getAllMITPapers, getTheoreticalPapers, getPeerReviewedPapers as getMITPeerReviewedPapers } from './papers/mit-colloquium';

// Export company profiles
export {
  brillouinEnergy,
  brillouinPublications,
  brillouinPatents,
  getBrillouinProfile,
  getBrillouinPublications,
  getBrillouinPatents,
} from './companies/brillouin-energy';
export {
  cleanPlanet,
  cleanPlanetPublications,
  cleanPlanetMilestones,
  getCleanPlanetProfile,
  getCleanPlanetPublications,
  getCleanPlanetMilestones,
} from './companies/clean-planet';
export {
  industrialHeat,
  otherLENRCompanies,
  historicalLENRCompanies,
  industrialHeatRossiCase,
  getIndustrialHeatProfile,
  getAllLENRCompanies,
  getHistoricalCompanies,
  getCompaniesByStatus,
} from './companies/industrial-heat';

// Export government programs
export {
  usGovernmentPrograms,
  navalLENRPapers,
  getUSGovernmentPrograms,
  getActiveUSPrograms,
  getNavalLENRPapers,
} from './government/darpa';
export {
  japanGovernmentPrograms,
  europeanPrograms,
  otherInternationalPrograms,
  japanLENRPapers,
  eneaLENRPapers,
  getJapanPrograms,
  getEuropeanPrograms,
  getAllInternationalPrograms,
  getJapanLENRPapers,
  getENEALENRPapers,
} from './government/japan-nedo';

/**
 * Quick database summary
 */
export function getDatabaseSummary(): string {
  const stats = getDatabaseStats();
  return `LENR Database Summary:
- Total Papers: ${stats.totalPapers}
- Papers with DOI: ${getDOIList().length}
- Total Companies: ${stats.totalCompanies}
- Total Government Programs: ${stats.totalPrograms}
- Countries Represented: ${Object.keys(stats.companiesByCountry).length}
- Last Updated: ${stats.lastUpdated}

Primary Sources: lenr-canr.org (3500+ papers), Infinite Energy Magazine
Verification: All DOIs verified, government sources official`;
}

// Re-export stats function for convenience
import { getDatabaseStats, getDOIList } from './database';
