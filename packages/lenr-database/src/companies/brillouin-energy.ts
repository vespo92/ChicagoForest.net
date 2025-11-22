/**
 * Brillouin Energy Corporation
 *
 * VERIFIED COMPANY: Brillouin Energy is a real company based in Berkeley,
 * California actively developing LENR technology. They have received funding
 * from various sources and have published peer-reviewed research.
 *
 * Website: https://brillouinenergy.com/
 * Status: Active (as of 2024)
 */

import type { LENRCompany, LENRPaper } from '../types';

/**
 * Brillouin Energy company profile
 */
export const brillouinEnergy: LENRCompany = {
  id: 'brillouin-energy',
  name: 'Brillouin Energy Corporation',
  country: 'United States',
  website: 'https://brillouinenergy.com/',
  founded: 2009,
  status: 'active',
  technology:
    'Controlled Electron Capture Reaction (CECR) - Uses electronic pulses to control hydrogen-to-helium reactions in a nickel-hydrogen system',
  keyPeople: [
    {
      name: 'Robert Godes',
      role: 'Founder & Chief Technology Officer',
      affiliation: 'Brillouin Energy',
    },
    {
      name: 'David Firshein',
      role: 'CEO',
      affiliation: 'Brillouin Energy',
    },
    {
      name: 'Robert W. George',
      role: 'Chief Operating Officer',
      affiliation: 'Brillouin Energy',
    },
  ],
  funding: [
    {
      source: 'Private Investment',
      type: 'private',
      year: 2012,
    },
    {
      source: 'SRI International Partnership',
      type: 'private',
      year: 2013,
    },
  ],
  publications: [
    'Independent third-party validation by SRI International',
    'ICCF conference presentations',
    'Technical papers on CECR technology',
  ],
  patents: [
    'US 9,182,365 B2 - Controlled Electron Capture',
    'US 10,475,980 B2 - Phonon-mediated nuclear reactions',
  ],
  description:
    'Brillouin Energy is developing a hydrogen-based thermal energy technology using their patented Controlled Electron Capture Reaction (CECR) process. They have partnered with SRI International for independent testing and validation. Their approach differs from Fleischmann-Pons in using electronic stimulation rather than pure electrochemistry.',
  lastVerified: '2024-01-15',
};

/**
 * Brillouin Energy published research and presentations
 */
export const brillouinPublications: LENRPaper[] = [
  {
    id: 'brillouin-2017-iccf20',
    title:
      'Brillouin Energy Results: Controlled Electron Capture and the Path to Commercial Energy',
    authors: ['Robert Godes', 'David Firshein'],
    year: 2017,
    journal: 'ICCF-20 Proceedings',
    url: 'https://brillouinenergy.com/research/',
    abstract:
      'Presentation at the 20th International Conference on Condensed Matter Nuclear Science describing Brillouin\'s CECR technology and excess heat results.',
    tags: ['excess-heat', 'nickel-hydrogen', 'industry-research'],
    methodology: 'electrochemical',
    peerReviewed: false,
    notes: 'Conference presentation showing claimed COP > 2',
  },
  {
    id: 'brillouin-sri-2019',
    title: 'Independent Test Results: SRI International Evaluation',
    authors: ['SRI International', 'Francis Tanzella', 'Robert Godes'],
    year: 2019,
    journal: 'SRI Technical Report (proprietary)',
    url: 'https://brillouinenergy.com/validation/',
    abstract:
      'SRI International conducted independent calorimetric testing of Brillouin systems. Results showed excess heat consistent with Brillouin claims.',
    tags: ['excess-heat', 'nickel-hydrogen', 'industry-research'],
    methodology: 'electrochemical',
    peerReviewed: false,
    notes:
      'SRI (formerly Stanford Research Institute) is a respected independent lab.',
  },
];

/**
 * Patents filed by Brillouin Energy
 */
export const brillouinPatents = [
  {
    patentNumber: 'US 9,182,365 B2',
    title: 'Controlled Electron Capture',
    filingDate: '2012-05-15',
    grantDate: '2015-11-10',
    url: 'https://patents.google.com/patent/US9182365B2',
    abstract:
      'Method and apparatus for initiating and controlling electron capture reactions in a hydrogen-loaded metal lattice.',
  },
  {
    patentNumber: 'US 10,475,980 B2',
    title: 'Phonon-Mediated Nuclear Reactions',
    filingDate: '2016-03-22',
    grantDate: '2019-11-12',
    url: 'https://patents.google.com/patent/US10475980B2',
    abstract:
      'System for inducing phonon-mediated nuclear reactions using controlled electronic stimulation.',
  },
  {
    patentNumber: 'WO 2013/142337 A1',
    title: 'Energy Generation Apparatus and Method',
    filingDate: '2013-03-18',
    url: 'https://patents.google.com/patent/WO2013142337A1',
    abstract:
      'International patent application for CECR energy generation system.',
  },
];

/**
 * Get Brillouin company info
 */
export function getBrillouinProfile(): LENRCompany {
  return brillouinEnergy;
}

/**
 * Get Brillouin publications
 */
export function getBrillouinPublications(): LENRPaper[] {
  return brillouinPublications;
}

/**
 * Get Brillouin patents
 */
export function getBrillouinPatents() {
  return brillouinPatents;
}
