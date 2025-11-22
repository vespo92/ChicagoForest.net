/**
 * LENR Database - Main Database Interface
 *
 * This module provides a unified interface to query all LENR research data
 * including papers, companies, and government programs.
 *
 * DISCLAIMER: This database documents REAL scientific research. All sources
 * are verified. Inclusion does not constitute endorsement of claims.
 */

import type {
  LENRPaper,
  LENRCompany,
  GovernmentProgram,
  DatabaseStats,
  SearchParams,
  ResearchMethodology,
} from './types';

// Import papers
import { fleischmannPonsPapers } from './papers/fleischmann-pons';
import { nasaStudies } from './papers/nasa-studies';
import { mitColloquiumPapers } from './papers/mit-colloquium';

// Import companies
import {
  brillouinEnergy,
  brillouinPublications,
} from './companies/brillouin-energy';
import { cleanPlanet, cleanPlanetPublications } from './companies/clean-planet';
import {
  industrialHeat,
  otherLENRCompanies,
  historicalLENRCompanies,
} from './companies/industrial-heat';

// Import government programs
import {
  usGovernmentPrograms,
  navalLENRPapers,
} from './government/darpa';
import {
  japanGovernmentPrograms,
  europeanPrograms,
  otherInternationalPrograms,
  japanLENRPapers,
  eneaLENRPapers,
} from './government/japan-nedo';

/**
 * Complete collection of all LENR papers in the database
 */
export function getAllPapers(): LENRPaper[] {
  return [
    ...fleischmannPonsPapers,
    ...nasaStudies,
    ...mitColloquiumPapers,
    ...brillouinPublications,
    ...cleanPlanetPublications,
    ...navalLENRPapers,
    ...japanLENRPapers,
    ...eneaLENRPapers,
  ];
}

/**
 * Complete collection of all LENR companies
 */
export function getAllCompanies(): LENRCompany[] {
  return [
    brillouinEnergy,
    cleanPlanet,
    industrialHeat,
    ...otherLENRCompanies,
    ...historicalLENRCompanies,
  ];
}

/**
 * Complete collection of all government programs
 */
export function getAllPrograms(): GovernmentProgram[] {
  return [
    ...usGovernmentPrograms,
    ...japanGovernmentPrograms,
    ...europeanPrograms,
    ...otherInternationalPrograms,
  ];
}

/**
 * Get all papers with verified DOI links
 */
export function getPapersWithDOI(): LENRPaper[] {
  return getAllPapers().filter((paper) => paper.doi !== undefined);
}

/**
 * Get papers by methodology
 */
export function getPapersByMethodology(
  methodology: ResearchMethodology
): LENRPaper[] {
  return getAllPapers().filter((paper) => paper.methodology === methodology);
}

/**
 * Get papers by year range
 */
export function getPapersByYearRange(
  startYear: number,
  endYear: number
): LENRPaper[] {
  return getAllPapers().filter(
    (paper) => paper.year >= startYear && paper.year <= endYear
  );
}

/**
 * Get peer-reviewed papers only
 */
export function getPeerReviewedPapers(): LENRPaper[] {
  return getAllPapers().filter((paper) => paper.peerReviewed);
}

/**
 * Get government-funded papers
 */
export function getGovernmentFundedPapers(): LENRPaper[] {
  return getAllPapers().filter((paper) =>
    paper.tags.includes('government-funded')
  );
}

/**
 * Search papers with flexible parameters
 */
export function searchPapers(params: SearchParams): LENRPaper[] {
  let results = getAllPapers();

  // Filter by query (searches title, abstract, authors)
  if (params.query) {
    const query = params.query.toLowerCase();
    results = results.filter(
      (paper) =>
        paper.title.toLowerCase().includes(query) ||
        paper.abstract.toLowerCase().includes(query) ||
        paper.authors.some((author) =>
          author.toLowerCase().includes(query)
        )
    );
  }

  // Filter by authors
  if (params.authors && params.authors.length > 0) {
    results = results.filter((paper) =>
      params.authors!.some((searchAuthor) =>
        paper.authors.some((paperAuthor) =>
          paperAuthor.toLowerCase().includes(searchAuthor.toLowerCase())
        )
      )
    );
  }

  // Filter by year range
  if (params.yearRange) {
    results = results.filter(
      (paper) =>
        paper.year >= params.yearRange!.start &&
        paper.year <= params.yearRange!.end
    );
  }

  // Filter by methodology
  if (params.methodology && params.methodology.length > 0) {
    results = results.filter((paper) =>
      params.methodology!.includes(paper.methodology)
    );
  }

  // Filter by tags
  if (params.tags && params.tags.length > 0) {
    results = results.filter((paper) =>
      params.tags!.some((tag) => paper.tags.includes(tag))
    );
  }

  // Filter by peer-reviewed only
  if (params.peerReviewedOnly) {
    results = results.filter((paper) => paper.peerReviewed);
  }

  // Apply offset and limit
  const offset = params.offset || 0;
  const limit = params.limit || results.length;
  results = results.slice(offset, offset + limit);

  return results;
}

/**
 * Get companies by country
 */
export function getCompaniesByCountry(country: string): LENRCompany[] {
  return getAllCompanies().filter(
    (company) => company.country.toLowerCase() === country.toLowerCase()
  );
}

/**
 * Get active companies only
 */
export function getActiveCompanies(): LENRCompany[] {
  return getAllCompanies().filter((company) => company.status === 'active');
}

/**
 * Get programs by country
 */
export function getProgramsByCountry(country: string): GovernmentProgram[] {
  return getAllPrograms().filter(
    (program) => program.country.toLowerCase() === country.toLowerCase()
  );
}

/**
 * Get active programs
 */
export function getActivePrograms(): GovernmentProgram[] {
  return getAllPrograms().filter(
    (program) => program.status === 'active' || program.status === 'classified'
  );
}

/**
 * Get database statistics
 */
export function getDatabaseStats(): DatabaseStats {
  const papers = getAllPapers();
  const companies = getAllCompanies();
  const programs = getAllPrograms();

  // Papers by year
  const papersByYear: Record<number, number> = {};
  papers.forEach((paper) => {
    papersByYear[paper.year] = (papersByYear[paper.year] || 0) + 1;
  });

  // Papers by methodology
  const papersByMethodology: Record<ResearchMethodology, number> = {
    electrochemical: 0,
    'gas-loading': 0,
    plasma: 0,
    laser: 0,
    acoustic: 0,
    biological: 0,
    theoretical: 0,
    review: 0,
    other: 0,
  };
  papers.forEach((paper) => {
    papersByMethodology[paper.methodology]++;
  });

  // Companies by country
  const companiesByCountry: Record<string, number> = {};
  companies.forEach((company) => {
    companiesByCountry[company.country] =
      (companiesByCountry[company.country] || 0) + 1;
  });

  return {
    totalPapers: papers.length,
    totalCompanies: companies.length,
    totalPrograms: programs.length,
    papersByYear,
    papersByMethodology,
    companiesByCountry,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

/**
 * Get a paper by ID
 */
export function getPaperById(id: string): LENRPaper | undefined {
  return getAllPapers().find((paper) => paper.id === id);
}

/**
 * Get a company by ID
 */
export function getCompanyById(id: string): LENRCompany | undefined {
  return getAllCompanies().find((company) => company.id === id);
}

/**
 * Get a program by ID
 */
export function getProgramById(id: string): GovernmentProgram | undefined {
  return getAllPrograms().find((program) => program.id === id);
}

/**
 * Validate all DOI links in the database
 * Returns list of papers with DOIs for verification
 */
export function getDOIList(): Array<{ id: string; doi: string; url: string }> {
  return getPapersWithDOI().map((paper) => ({
    id: paper.id,
    doi: paper.doi!,
    url: `https://doi.org/${paper.doi}`,
  }));
}
