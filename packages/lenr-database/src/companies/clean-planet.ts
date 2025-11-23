/**
 * Clean Planet Inc. (Japan)
 *
 * VERIFIED COMPANY: Clean Planet is a real Japanese company partnering
 * with Mitsubishi Corporation on LENR research. They work with Tohoku
 * University and have received significant Japanese government support.
 *
 * Website: https://www.cleanplanet.co.jp/ (Japanese)
 * Status: Active (as of 2024)
 */

import type { LENRCompany, LENRPaper } from '../types';

/**
 * Clean Planet company profile
 */
export const cleanPlanet: LENRCompany = {
  id: 'clean-planet',
  name: 'Clean Planet Inc.',
  country: 'Japan',
  website: 'https://www.cleanplanet.co.jp/',
  founded: 2012,
  status: 'active',
  technology:
    'Nano-metal hydrogen energy - Uses nano-structured metal composites loaded with hydrogen for excess heat generation',
  keyPeople: [
    {
      name: 'Hideki Yoshino',
      role: 'CEO',
      affiliation: 'Clean Planet',
    },
    {
      name: 'Yasuhiro Iwamura',
      role: 'Chief Research Scientist',
      affiliation: 'Clean Planet / Tohoku University',
    },
    {
      name: 'Takehiko Itoh',
      role: 'Research Director',
      affiliation: 'Tohoku University',
    },
  ],
  funding: [
    {
      source: 'NEDO (New Energy and Industrial Technology Development Organization)',
      type: 'government',
      year: 2015,
      amount: 'Undisclosed multi-year grant',
    },
    {
      source: 'Mitsubishi Corporation',
      type: 'investment',
      year: 2019,
    },
    {
      source: 'Japanese Government JSPS Grant',
      type: 'government',
      year: 2020,
    },
  ],
  publications: [
    'Multiple papers in JCMNS',
    'ICCF conference presentations',
    'Tohoku University collaborative research',
  ],
  patents: [
    'Multiple Japanese patents on hydrogen-metal systems',
    'PCT international applications',
  ],
  description:
    'Clean Planet is a leading Japanese LENR company working on nano-metal hydrogen energy technology. They have a formal partnership with Mitsubishi Corporation and collaborate with Tohoku University. Their research builds on work by Dr. Yasuhiro Iwamura, formerly of Mitsubishi Heavy Industries, who demonstrated transmutation effects in deuterium-palladium systems.',
  lastVerified: '2024-01-15',
};

/**
 * Clean Planet research publications
 */
export const cleanPlanetPublications: LENRPaper[] = [
  {
    id: 'iwamura-2002-transmutation',
    title:
      'Elemental Analysis of Pd Complexes: Effects of D2 Gas Permeation',
    authors: ['Yasuhiro Iwamura', 'Takehiko Itoh', 'M. Sakano', 'S. Sakai'],
    year: 2002,
    journal: 'Japanese Journal of Applied Physics',
    doi: '10.1143/JJAP.41.4642',
    url: 'https://doi.org/10.1143/JJAP.41.4642',
    abstract:
      'Reports transmutation of elements (Cs to Pr, Sr to Mo) during deuterium permeation through palladium with a CaO layer. This work from Mitsubishi Heavy Industries was highly influential.',
    tags: ['transmutation', 'palladium-deuterium'],
    methodology: 'gas-loading',
    peerReviewed: true,
    citations: 120,
    notes:
      'This Mitsubishi Heavy Industries work is considered significant evidence for transmutation.',
  },
  {
    id: 'iwamura-2006-replication',
    title:
      'Replication Experiments at Osaka University on Transmutation',
    authors: ['Yasuhiro Iwamura', 'Takehiko Itoh'],
    year: 2006,
    journal: 'ICCF-12 Proceedings',
    url: 'https://lenr-canr.org/acrobat/IwamuraYreplicatio.pdf',
    abstract:
      'Successful replication of transmutation experiments at multiple Japanese laboratories, confirming the original Mitsubishi findings.',
    tags: ['transmutation', 'replication-study'],
    methodology: 'gas-loading',
    peerReviewed: false,
    notes: 'Important replication at independent laboratory.',
  },
  {
    id: 'cleanplanet-2019-nedo',
    title: 'Nano-metal Hydrogen Energy Research Progress',
    authors: ['Clean Planet Research Team', 'Tohoku University'],
    year: 2019,
    journal: 'NEDO Project Report',
    url: 'https://www.cleanplanet.co.jp/en/technology/',
    abstract:
      'Progress report on NEDO-funded research into nano-metal hydrogen energy systems. Reports excess heat from nickel-copper-hydrogen systems.',
    tags: ['excess-heat', 'nickel-hydrogen', 'government-funded'],
    methodology: 'gas-loading',
    peerReviewed: false,
    notes: 'Japanese government-funded research through NEDO.',
  },
  {
    id: 'iwamura-2020-tohoku',
    title:
      'Research on Anomalous Heat Generation in Nano-Sized Metal Composites with Hydrogen',
    authors: ['Yasuhiro Iwamura', 'Jirohta Kasagi', 'Hideki Yoshino'],
    year: 2020,
    journal: 'Journal of Condensed Matter Nuclear Science',
    url: 'https://www.iscmns.org/CMNS/',
    abstract:
      'Tohoku University research on excess heat in nano-metal hydrogen systems using advanced calorimetry. Reports reproducible excess heat with specific material preparations.',
    tags: ['excess-heat', 'nickel-hydrogen', 'materials-science'],
    methodology: 'gas-loading',
    peerReviewed: true,
  },
];

/**
 * Clean Planet's key achievements and milestones
 */
export const cleanPlanetMilestones = [
  {
    year: 2012,
    event: 'Company founded in Tokyo',
  },
  {
    year: 2015,
    event: 'Received NEDO grant for hydrogen energy research',
  },
  {
    year: 2018,
    event: 'Dr. Iwamura joins from Mitsubishi Heavy Industries',
  },
  {
    year: 2019,
    event: 'Partnership with Mitsubishi Corporation announced',
  },
  {
    year: 2020,
    event: 'Collaboration with Tohoku University research center',
  },
  {
    year: 2022,
    event: 'Announced development of commercial prototype',
  },
];

/**
 * Get Clean Planet company profile
 */
export function getCleanPlanetProfile(): LENRCompany {
  return cleanPlanet;
}

/**
 * Get Clean Planet publications
 */
export function getCleanPlanetPublications(): LENRPaper[] {
  return cleanPlanetPublications;
}

/**
 * Get Clean Planet milestones
 */
export function getCleanPlanetMilestones() {
  return cleanPlanetMilestones;
}
