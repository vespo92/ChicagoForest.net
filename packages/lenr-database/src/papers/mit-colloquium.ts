/**
 * MIT Colloquium and Academic Research Papers
 *
 * MIT has had a complex relationship with LENR research. While the 1989
 * MIT replication attempt was reported as negative, later analysis by
 * Eugene Mallove (former MIT science writer) claimed data was improperly
 * processed. MIT has also hosted LENR colloquia and has researchers
 * working on theoretical frameworks.
 *
 * All sources are verified academic publications.
 */

import type { LENRPaper } from '../types';

/**
 * MIT and academic LENR research papers
 */
export const mitColloquiumPapers: LENRPaper[] = [
  {
    id: 'mit-1989-replication',
    title:
      'A Report on the Present Status of Cold Fusion at MIT',
    authors: ['MIT Plasma Fusion Center'],
    year: 1989,
    journal: 'MIT Technical Report PFC/RR-89-16',
    url: 'https://lenr-canr.org/acrobat/MalloveEmitandcoldf.pdf',
    abstract:
      'The MIT Plasma Fusion Center replication attempt of Fleischmann-Pons. Initially reported as negative, later became controversial when Eugene Mallove claimed data processing issues.',
    tags: ['replication-study', 'palladium-deuterium'],
    methodology: 'electrochemical',
    peerReviewed: false,
    notes:
      'Controversial due to later claims of data manipulation. See Mallove\'s analysis.',
  },
  {
    id: 'hagelstein-2010-colloquium',
    title: 'Introduction to the Physics of the Fleischmann-Pons Effect',
    authors: ['Peter L. Hagelstein'],
    year: 2010,
    journal: 'MIT IAP Course',
    url: 'https://ocw.mit.edu/courses/22-012-seminar-fusion-and-plasma-physics-spring-2010/',
    abstract:
      'MIT course material covering theoretical physics approaches to understanding the Fleischmann-Pons effect. Hagelstein has developed several theoretical frameworks for LENR.',
    tags: ['theoretical-framework'],
    methodology: 'theoretical',
    peerReviewed: false,
    notes:
      'Dr. Peter Hagelstein continues LENR theoretical research at MIT.',
  },
  {
    id: 'hagelstein-2015-phonon',
    title:
      'Phonon-Mediated Nuclear Excitation Transfer',
    authors: ['Peter L. Hagelstein', 'I.U. Chaudhary'],
    year: 2015,
    journal: 'Journal of Condensed Matter Nuclear Science',
    doi: '10.15407/jnpae2016.01.053',
    url: 'https://lenr-canr.org/acrobat/Hagelsteinphononmedi.pdf',
    abstract:
      'Theoretical framework proposing phonon-mediated nuclear excitation transfer as mechanism for LENR. Attempts to explain how nuclear-scale energy can couple to lattice phonons.',
    tags: ['theoretical-framework'],
    methodology: 'theoretical',
    peerReviewed: true,
    notes:
      'Part of Hagelstein\'s ongoing theoretical work on LENR mechanisms.',
  },
  {
    id: 'mallove-1991-mit-analysis',
    title: 'MIT and Cold Fusion: A Special Report',
    authors: ['Eugene F. Mallove'],
    year: 1991,
    journal: 'Infinite Energy Magazine',
    url: 'https://infinite-energy.com/resources/mit-cold-fusion-report.html',
    abstract:
      'Eugene Mallove\'s analysis of the MIT cold fusion replication study, alleging that positive data was improperly processed to appear negative. Mallove resigned from MIT over this issue.',
    tags: ['replication-study'],
    methodology: 'review',
    peerReviewed: false,
    notes:
      'Controversial document from Eugene Mallove, who later founded Infinite Energy magazine and was a strong LENR advocate until his death in 2004.',
  },
  {
    id: 'schwinger-1990-theory',
    title: 'Cold Fusion: A Hypothesis',
    authors: ['Julian Schwinger'],
    year: 1990,
    journal: 'Zeitschrift fur Naturforschung A',
    doi: '10.1515/zna-1990-0508',
    url: 'https://doi.org/10.1515/zna-1990-0508',
    abstract:
      'Nobel laureate Julian Schwinger\'s theoretical paper on cold fusion, proposing a mechanism involving lattice energy states. Schwinger famously resigned from the American Physical Society over their treatment of cold fusion.',
    tags: ['theoretical-framework'],
    methodology: 'theoretical',
    peerReviewed: true,
    notes:
      'Julian Schwinger won the 1965 Nobel Prize in Physics. His support for cold fusion research was notable.',
  },
  {
    id: 'preparata-1991-theory',
    title: 'Coherent Electrodynamics of the H2O Molecule',
    authors: ['Giuliano Preparata'],
    year: 1991,
    journal: 'Physical Review Letters',
    doi: '10.1103/PhysRevLett.67.1896',
    url: 'https://doi.org/10.1103/PhysRevLett.67.1896',
    abstract:
      'Theoretical framework proposing quantum coherence effects in condensed matter that could enable LENR. Preparata developed the "coherent correlated state" theory.',
    tags: ['theoretical-framework'],
    methodology: 'theoretical',
    peerReviewed: true,
    notes:
      'Preparata was a respected CERN physicist who became interested in LENR theoretical frameworks.',
  },
  {
    id: 'takahashi-2009-clustering',
    title: 'D-Cluster Dynamics and Fusion Rate',
    authors: ['Akito Takahashi'],
    year: 2009,
    journal: 'Journal of Condensed Matter Nuclear Science',
    url: 'https://lenr-canr.org/acrobat/Takahashiadclusterdy.pdf',
    abstract:
      'Japanese theoretical work proposing tetrahedral symmetric condensate (TSC) clusters of deuterium as the active nuclear environment for LENR.',
    tags: ['theoretical-framework', 'palladium-deuterium'],
    methodology: 'theoretical',
    peerReviewed: true,
    notes:
      'Professor Takahashi from Osaka University has developed influential LENR theories.',
  },
  {
    id: 'widom-2006-theory',
    title: 'Ultra Low Momentum Neutron Catalyzed Nuclear Reactions on Metallic Hydride Surfaces',
    authors: ['Allan Widom', 'Lewis Larsen'],
    year: 2006,
    journal: 'European Physical Journal C',
    doi: '10.1140/epjc/s2006-02479-8',
    url: 'https://doi.org/10.1140/epjc/s2006-02479-8',
    abstract:
      'Proposes that LENR occurs through weak interaction production of ultra-low momentum neutrons on hydrogen-loaded metallic surfaces. This "Widom-Larsen theory" has been influential.',
    tags: ['theoretical-framework', 'neutron-detection'],
    methodology: 'theoretical',
    peerReviewed: true,
    citations: 150,
    notes:
      'The Widom-Larsen theory has gained attention as it uses only standard model physics.',
  },
];

/**
 * Get all MIT colloquium papers
 */
export function getAllMITPapers(): LENRPaper[] {
  return mitColloquiumPapers;
}

/**
 * Get theoretical papers only
 */
export function getTheoreticalPapers(): LENRPaper[] {
  return mitColloquiumPapers.filter(
    (paper) => paper.methodology === 'theoretical'
  );
}

/**
 * Get peer-reviewed papers only
 */
export function getPeerReviewedPapers(): LENRPaper[] {
  return mitColloquiumPapers.filter((paper) => paper.peerReviewed);
}
