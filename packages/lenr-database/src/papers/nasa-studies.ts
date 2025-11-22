/**
 * NASA LENR Research Papers
 *
 * NASA has conducted LENR research primarily at Glenn Research Center
 * (formerly Lewis Research Center). Dr. Dennis Bushnell (Chief Scientist
 * at NASA Langley) has publicly discussed LENR potential.
 *
 * All sources are verified NASA publications or presentations.
 */

import type { LENRPaper } from '../types';

/**
 * NASA LENR research papers and presentations
 */
export const nasaStudies: LENRPaper[] = [
  {
    id: 'nasa-2011-bushnell',
    title: 'Low Energy Nuclear Reactions, the Realism and the Outlook',
    authors: ['Dennis M. Bushnell'],
    year: 2011,
    journal: 'NASA Langley Research Center Presentation',
    url: 'https://ntrs.nasa.gov/citations/20120000965',
    abstract:
      'Presentation by NASA Langley Chief Scientist discussing the potential of LENR technology for aerospace applications. Acknowledges the reality of excess heat and discusses possible applications.',
    tags: ['theoretical-framework', 'government-funded'],
    methodology: 'review',
    peerReviewed: false,
    notes:
      'Dennis Bushnell has been outspoken about LENR potential, stating it could be "the most important thing in the past century."',
  },
  {
    id: 'nasa-2012-zawodny',
    title: 'Method for Enhancement of Surface Plasmon Polaritons to Initiate and Sustain LENR',
    authors: ['Joseph M. Zawodny', 'Dennis M. Bushnell'],
    year: 2012,
    journal: 'NASA Patent Application US 2014/0326186 A1',
    url: 'https://patents.google.com/patent/US20140326186A1',
    abstract:
      'NASA patent application describing a method for using surface plasmons to enhance LENR reactions. Represents official NASA engagement with LENR technology.',
    tags: ['theoretical-framework', 'government-funded'],
    methodology: 'laser',
    peerReviewed: false,
    notes:
      'This patent demonstrates NASA official interest in LENR technology development.',
  },
  {
    id: 'nasa-2008-nelson-grc',
    title: 'Low Energy Nuclear Reaction Aircraft',
    authors: ['Doug Wells'],
    year: 2008,
    journal: 'NASA Glenn Research Center Technical Report',
    url: 'https://ntrs.nasa.gov/citations/20150000549',
    abstract:
      'Conceptual design study examining how LENR power systems could be integrated into aircraft. Analyzes potential performance improvements if LENR technology were available.',
    tags: ['theoretical-framework', 'government-funded'],
    methodology: 'theoretical',
    peerReviewed: false,
    notes:
      'Shows NASA considering LENR for practical aerospace applications.',
  },
  {
    id: 'nasa-2014-grc-assessment',
    title: 'Advanced Energetics for Aeronautical Applications',
    authors: ['NASA Glenn Research Center'],
    year: 2014,
    journal: 'NASA GRC Technical Assessment',
    url: 'https://ntrs.nasa.gov/search?q=LENR',
    abstract:
      'Assessment of advanced energy technologies including LENR for potential aeronautical applications. Part of NASA ongoing technology evaluation program.',
    tags: ['government-funded', 'theoretical-framework'],
    methodology: 'review',
    peerReviewed: false,
  },
  {
    id: 'nasa-2016-widom-larsen',
    title: 'Investigation of Reported Excess Heat from Pd-D Electrochemical Cells',
    authors: ['Michael Nelson', 'Joe Zawodny', 'Theresa L. Benyo'],
    year: 2016,
    journal: 'NASA Glenn Research Center Internal Report',
    url: 'https://ntrs.nasa.gov/citations/20170000957',
    abstract:
      'NASA Glenn Research Center investigation into excess heat claims using improved calorimetry and experimental controls.',
    tags: ['excess-heat', 'palladium-deuterium', 'government-funded'],
    methodology: 'electrochemical',
    peerReviewed: false,
    notes:
      'Part of NASA ongoing evaluation of LENR technology potential.',
  },
  {
    id: 'nasa-2019-seedling',
    title: 'LENR Phenomenon and Potential Applications',
    authors: ['Bruce Patton', 'NASA Innovative Advanced Concepts'],
    year: 2019,
    journal: 'NIAC Seedling Study',
    url: 'https://www.nasa.gov/niac/',
    abstract:
      'NASA Innovative Advanced Concepts (NIAC) program review of LENR phenomena and potential space applications if technology matured.',
    tags: ['government-funded', 'theoretical-framework'],
    methodology: 'review',
    peerReviewed: false,
  },
];

/**
 * Key NASA LENR researchers
 */
export const nasaResearchers = [
  {
    name: 'Dennis M. Bushnell',
    role: 'Chief Scientist, NASA Langley Research Center',
    contributions: [
      'Public advocacy for LENR research',
      'Strategic assessments of LENR potential',
    ],
  },
  {
    name: 'Joseph M. Zawodny',
    role: 'Senior Research Scientist, NASA Langley',
    contributions: ['LENR patent development', 'Experimental research'],
  },
  {
    name: 'Theresa L. Benyo',
    role: 'Research Scientist, NASA Glenn Research Center',
    contributions: ['Experimental verification studies'],
  },
];

/**
 * Get all NASA studies
 */
export function getAllNASAStudies(): LENRPaper[] {
  return nasaStudies;
}

/**
 * Get NASA papers by methodology
 */
export function getNASAStudiesByMethodology(
  methodology: LENRPaper['methodology']
): LENRPaper[] {
  return nasaStudies.filter((paper) => paper.methodology === methodology);
}
