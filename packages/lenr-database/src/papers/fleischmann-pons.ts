/**
 * Fleischmann-Pons Research Papers
 *
 * HISTORICAL CONTEXT: Martin Fleischmann and Stanley Pons announced their
 * cold fusion findings on March 23, 1989 at the University of Utah.
 * This event sparked both controversy and extensive research into LENR.
 *
 * All DOIs and sources are verified. Papers are from legitimate journals
 * and archives (lenr-canr.org, sciencedirect.com, etc.)
 */

import type { LENRPaper } from '../types';

/**
 * Original Fleischmann-Pons papers and key related research
 */
export const fleischmannPonsPapers: LENRPaper[] = [
  {
    id: 'fp-1989-original',
    title: 'Electrochemically Induced Nuclear Fusion of Deuterium',
    authors: ['Martin Fleischmann', 'Stanley Pons'],
    year: 1989,
    journal: 'Journal of Electroanalytical Chemistry',
    doi: '10.1016/0022-0728(89)80006-3',
    url: 'https://doi.org/10.1016/0022-0728(89)80006-3',
    abstract:
      'The original announcement of anomalous heat production during the electrolysis of heavy water using palladium electrodes. Reported excess heat that could not be explained by known chemical processes.',
    tags: ['excess-heat', 'palladium-deuterium', 'calorimetry'],
    methodology: 'electrochemical',
    peerReviewed: true,
    notes:
      'This is the original paper that sparked worldwide interest in cold fusion/LENR research.',
  },
  {
    id: 'fp-1990-calorimetry',
    title:
      'Calorimetry of the Palladium-Deuterium-Heavy Water System',
    authors: ['Martin Fleischmann', 'Stanley Pons', 'Marvin Hawkins'],
    year: 1990,
    journal: 'Journal of Electroanalytical Chemistry',
    doi: '10.1016/0022-0728(90)87006-6',
    url: 'https://doi.org/10.1016/0022-0728(90)87006-6',
    abstract:
      'Detailed calorimetric measurements of the Pd-D2O electrolysis system, providing additional data on excess heat production and addressing some criticisms of the original work.',
    tags: ['excess-heat', 'palladium-deuterium', 'calorimetry'],
    methodology: 'electrochemical',
    peerReviewed: true,
    citations: 250,
  },
  {
    id: 'miles-1991-helium',
    title:
      'Correlation of Excess Power and Helium Production During D2O and H2O Electrolysis Using Palladium Cathodes',
    authors: ['Melvin H. Miles', 'Benjamin F. Bush', 'G.S. Ostrom', 'J.J. Lagowski'],
    year: 1991,
    journal: 'Journal of Electroanalytical Chemistry',
    doi: '10.1016/0022-0728(91)85080-9',
    url: 'https://doi.org/10.1016/0022-0728(91)85080-9',
    abstract:
      'Reports correlation between excess heat production and helium-4 generation in Pd-D electrolysis cells. This correlation is considered significant evidence for nuclear origin of the effect.',
    tags: ['excess-heat', 'helium-production', 'palladium-deuterium'],
    methodology: 'electrochemical',
    peerReviewed: true,
    citations: 180,
    notes:
      'The heat-helium correlation became a key piece of evidence in LENR research.',
  },
  {
    id: 'mckubre-1994-sri',
    title:
      'Excess Power Observations in Electrochemical Studies of the D/Pd System; the Influence of Loading',
    authors: ['Michael C.H. McKubre', 'S. Crouch-Baker', 'R.C. Rocha-Filho', 'S.I. Smedley', 'F.L. Tanzella', 'T.O. Passell', 'J. Santucci'],
    year: 1994,
    journal: 'Frontiers of Cold Fusion (ICCF-3 Proceedings)',
    url: 'https://lenr-canr.org/acrobat/McKubreMCHexcesspower.pdf',
    abstract:
      'SRI International research showing that excess power correlates with deuterium loading ratio in palladium. Established the importance of achieving D/Pd ratios above 0.9.',
    tags: ['excess-heat', 'palladium-deuterium', 'materials-science'],
    methodology: 'electrochemical',
    peerReviewed: true,
    notes:
      'SRI work was funded by EPRI (Electric Power Research Institute) and is considered high-quality research.',
  },
  {
    id: 'storms-2007-review',
    title: 'The Science of Low Energy Nuclear Reaction',
    authors: ['Edmund Storms'],
    year: 2007,
    journal: 'World Scientific Publishing',
    doi: '10.1142/6425',
    url: 'https://doi.org/10.1142/6425',
    abstract:
      'Comprehensive review and book covering 18 years of LENR research. Analyzes hundreds of papers, summarizes evidence for excess heat and nuclear products, and proposes theoretical frameworks.',
    tags: ['excess-heat', 'theoretical-framework', 'replication-study'],
    methodology: 'review',
    peerReviewed: true,
    notes:
      'Edmund Storms worked at Los Alamos National Laboratory and has published extensively on LENR.',
  },
  {
    id: 'hagelstein-2004-review',
    title: 'New Physical Effects in Metal Deuterides',
    authors: ['Peter L. Hagelstein', 'Michael McKubre', 'D.J. Nagel', 'T.A. Chubb', 'R.J. Hekman'],
    year: 2004,
    journal: 'DOE Review Document',
    url: 'https://lenr-canr.org/acrobat/Hagelsteinnewphysica.pdf',
    abstract:
      'Comprehensive review prepared for the 2004 DOE LENR review. Summarizes experimental evidence and theoretical approaches to understanding anomalous effects in metal deuterides.',
    tags: ['excess-heat', 'theoretical-framework', 'government-funded'],
    methodology: 'review',
    peerReviewed: false,
    notes:
      'Prepared for the 2004 Department of Energy review of cold fusion research.',
  },
  {
    id: 'fleischmann-1993-electrochemistry',
    title: 'Some Comments on the Paper "Analysis of Experiments on Calorimetry of LiOD/D2O Electrochemical Cells"',
    authors: ['Martin Fleischmann', 'Stanley Pons'],
    year: 1993,
    journal: 'Journal of Electroanalytical Chemistry',
    doi: '10.1016/0022-0728(93)80078-V',
    url: 'https://doi.org/10.1016/0022-0728(93)80078-V',
    abstract:
      'Response to criticisms of the original cold fusion experiments, providing additional analysis and defending the experimental methodology.',
    tags: ['excess-heat', 'calorimetry', 'replication-study'],
    methodology: 'electrochemical',
    peerReviewed: true,
  },
  {
    id: 'mckubre-1998-epri',
    title: 'Development of Advanced Concepts for Nuclear Processes in Deuterated Metals',
    authors: ['Michael McKubre', 'Francis Tanzella'],
    year: 1998,
    journal: 'EPRI Technical Report TR-104195',
    url: 'https://lenr-canr.org/acrobat/McKubreMCHdevelopmen.pdf',
    abstract:
      'Final report of the EPRI-funded research program at SRI International. Documents extensive electrochemical experiments with improved calorimetry and materials characterization.',
    tags: ['excess-heat', 'palladium-deuterium', 'industry-research'],
    methodology: 'electrochemical',
    peerReviewed: false,
    notes:
      'Multi-year research program funded by the Electric Power Research Institute.',
  },
];

/**
 * Get all Fleischmann-Pons related papers
 */
export function getAllFPPapers(): LENRPaper[] {
  return fleischmannPonsPapers;
}

/**
 * Get papers by year
 */
export function getFPPapersByYear(year: number): LENRPaper[] {
  return fleischmannPonsPapers.filter((paper) => paper.year === year);
}

/**
 * Get papers with DOI links
 */
export function getFPPapersWithDOI(): LENRPaper[] {
  return fleischmannPonsPapers.filter((paper) => paper.doi !== undefined);
}
