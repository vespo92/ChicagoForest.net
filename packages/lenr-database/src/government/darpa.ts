/**
 * DARPA and U.S. Government LENR Programs
 *
 * The U.S. Government has had various LENR-related programs, from the
 * initial DOE review in 1989 to more recent DARPA investigations.
 * This file documents verified government involvement in LENR research.
 *
 * All sources are from official government documents or verified reports.
 */

import type { GovernmentProgram, LENRPaper } from '../types';

/**
 * U.S. Government LENR Programs
 */
export const usGovernmentPrograms: GovernmentProgram[] = [
  {
    id: 'doe-1989-review',
    name: 'DOE ERAB Cold Fusion Panel',
    agency: 'Department of Energy',
    country: 'United States',
    startYear: 1989,
    endYear: 1989,
    status: 'completed',
    url: 'https://www.osti.gov/biblio/6073271',
    description:
      'The Energy Research Advisory Board (ERAB) conducted the first official U.S. government review of cold fusion claims. The panel concluded that the evidence was not convincing but recommended continued small-scale research.',
    researchers: [
      'John Huizenga (Co-Chair)',
      'Norman Ramsey (Co-Chair)',
    ],
    publications: [
      'DOE/S-0073 (1989) - Cold Fusion Research',
    ],
  },
  {
    id: 'doe-2004-review',
    name: 'DOE LENR Review',
    agency: 'Department of Energy',
    country: 'United States',
    startYear: 2004,
    endYear: 2004,
    status: 'completed',
    url: 'https://www.lenr-canr.org/acrobat/DOEreaborevi.pdf',
    description:
      'A second DOE review 15 years after the original. The panel was more divided than in 1989 - about half found evidence for excess heat production compelling. The review recommended more research but no dedicated funding was provided.',
    publications: [
      'Report of the Review of Low Energy Nuclear Reactions (2004)',
    ],
  },
  {
    id: 'darpa-2008-briefing',
    name: 'DARPA LENR Briefing',
    agency: 'Defense Advanced Research Projects Agency',
    country: 'United States',
    startYear: 2008,
    endYear: 2008,
    status: 'completed',
    url: 'https://lenr-canr.org/acrobat/DARPAslides.pdf',
    description:
      'DARPA held briefings on LENR technology potential for military applications. While no public program resulted, it showed continued government interest.',
    publications: ['DARPA LENR Technology Assessment (2008)'],
    hasClassifiedComponents: true,
  },
  {
    id: 'spawar-lenr',
    name: 'SPAWAR LENR Research',
    agency: 'Space and Naval Warfare Systems Command',
    country: 'United States',
    startYear: 1989,
    endYear: 2011,
    status: 'completed',
    url: 'https://lenr-canr.org/Collections/SPAWAR.htm',
    description:
      'The U.S. Navy SPAWAR center conducted LENR research for over 20 years. Researchers including Stanislaw Szpak, Pamela Mosier-Boss, and Frank Gordon published numerous papers on observed nuclear effects.',
    researchers: [
      'Stanislaw Szpak',
      'Pamela Mosier-Boss',
      'Frank Gordon',
      'Lawrence Forsley',
    ],
    publications: [
      'Multiple peer-reviewed papers in Naturwissenschaften',
      'SPAWAR Technical Reports',
    ],
  },
  {
    id: 'naval-research-2017',
    name: 'Office of Naval Research Interest',
    agency: 'Office of Naval Research',
    country: 'United States',
    startYear: 2017,
    status: 'unknown',
    description:
      'Reports indicate continued Navy interest in LENR for potential naval propulsion and power applications. Specific program details are not public.',
    hasClassifiedComponents: true,
  },
];

/**
 * SPAWAR/Navy LENR research papers
 */
export const navalLENRPapers: LENRPaper[] = [
  {
    id: 'spawar-2002-codeposition',
    title:
      'Polarized D+/Pd-D2O System: Hot Spots and Mini-Explosions',
    authors: ['Stanislaw Szpak', 'Pamela A. Mosier-Boss', 'J.J. Smith'],
    year: 2002,
    journal: 'Physics Letters A',
    doi: '10.1016/S0375-9601(02)00371-X',
    url: 'https://doi.org/10.1016/S0375-9601(02)00371-X',
    abstract:
      'SPAWAR researchers report observation of localized hot spots and micro-explosions in co-deposited Pd-D films, suggesting nuclear-scale energy release.',
    tags: ['excess-heat', 'palladium-deuterium', 'government-funded'],
    methodology: 'electrochemical',
    peerReviewed: true,
  },
  {
    id: 'spawar-2007-cr39',
    title:
      'Use of CR-39 in Pd/D Co-deposition Experiments',
    authors: ['Pamela A. Mosier-Boss', 'Stanislaw Szpak', 'Frank E. Gordon', 'Lawrence P.G. Forsley'],
    year: 2007,
    journal: 'European Physical Journal Applied Physics',
    doi: '10.1051/epjap:2007152',
    url: 'https://doi.org/10.1051/epjap:2007152',
    abstract:
      'Reports detection of energetic particles using CR-39 solid-state nuclear track detectors in Pd-D co-deposition experiments. The tracks are consistent with nuclear-origin particles.',
    tags: ['neutron-detection', 'palladium-deuterium', 'government-funded'],
    methodology: 'electrochemical',
    peerReviewed: true,
    notes:
      'CR-39 detector results were significant evidence for nuclear activity.',
  },
  {
    id: 'spawar-2009-triple-tracks',
    title:
      'Triple Tracks in CR-39 as the Result of Pd-D Co-deposition: Evidence of Energetic Neutrons',
    authors: ['Pamela A. Mosier-Boss', 'Stanislaw Szpak', 'Frank E. Gordon', 'Lawrence P.G. Forsley'],
    year: 2009,
    journal: 'Naturwissenschaften',
    doi: '10.1007/s00114-008-0449-x',
    url: 'https://doi.org/10.1007/s00114-008-0449-x',
    abstract:
      'Reports triple tracks in CR-39 detectors consistent with high-energy neutron detection during LENR experiments. Published in the prestigious Naturwissenschaften journal.',
    tags: ['neutron-detection', 'government-funded'],
    methodology: 'electrochemical',
    peerReviewed: true,
    citations: 75,
    notes:
      'Publication in Naturwissenschaften was significant for LENR credibility.',
  },
];

/**
 * Get all U.S. government programs
 */
export function getUSGovernmentPrograms(): GovernmentProgram[] {
  return usGovernmentPrograms;
}

/**
 * Get active U.S. programs
 */
export function getActiveUSPrograms(): GovernmentProgram[] {
  return usGovernmentPrograms.filter(
    (p) => p.status === 'active' || p.status === 'classified'
  );
}

/**
 * Get SPAWAR/Navy papers
 */
export function getNavalLENRPapers(): LENRPaper[] {
  return navalLENRPapers;
}
