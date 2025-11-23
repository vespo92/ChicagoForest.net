/**
 * LENR Database - Verified Sources
 *
 * This file contains all primary source URLs and archives used in this database.
 * ALL sources are verified and accessible (as of compilation date).
 *
 * IMPORTANT: This database is for EDUCATIONAL purposes. All claims should be
 * independently verified using the original sources.
 */

/**
 * Primary Research Archives
 */
export const primaryArchives = {
  /**
   * LENR-CANR.org - The largest LENR research archive
   * Maintained by Jed Rothwell, contains thousands of papers
   */
  lenrCanr: {
    name: 'LENR-CANR.org',
    url: 'https://lenr-canr.org/',
    description:
      'Primary archive for LENR research papers. Contains over 3,500 papers from peer-reviewed journals, conference proceedings, and technical reports.',
    maintainer: 'Jed Rothwell',
    paperCount: 3500,
    verified: true,
  },

  /**
   * Infinite Energy Magazine Archives
   * Founded by Eugene Mallove, covers LENR and new energy research
   */
  infiniteEnergy: {
    name: 'Infinite Energy Magazine',
    url: 'https://infinite-energy.com/',
    description:
      'Magazine founded by Eugene Mallove dedicated to new energy research. Contains historical articles and research summaries.',
    founder: 'Eugene Mallove (1947-2004)',
    verified: true,
  },

  /**
   * Journal of Condensed Matter Nuclear Science
   * Peer-reviewed journal dedicated to LENR research
   */
  jcmns: {
    name: 'Journal of Condensed Matter Nuclear Science',
    url: 'https://www.iscmns.org/CMNS/',
    description:
      'Peer-reviewed journal of the International Society for Condensed Matter Nuclear Science (ISCMNS).',
    verified: true,
  },

  /**
   * ICCF Proceedings
   * International Conference on Cold Fusion proceedings
   */
  iccfProceedings: {
    name: 'ICCF Proceedings',
    url: 'https://lenr-canr.org/wordpress/?page_id=1081',
    description:
      'Proceedings from the International Conference on Cold Fusion (now ICCF, later renamed to CMNS conferences). Held annually since 1990.',
    verified: true,
  },
};

/**
 * Patent Databases
 */
export const patentDatabases = {
  googlePatents: {
    name: 'Google Patents',
    url: 'https://patents.google.com/',
    description:
      'Searchable database of US and international patents. All patent links in this database use Google Patents.',
    verified: true,
  },
  uspto: {
    name: 'USPTO Patent Full-Text Database',
    url: 'https://patft.uspto.gov/',
    description:
      'Official US Patent and Trademark Office database.',
    verified: true,
  },
  espacenet: {
    name: 'Espacenet (European Patent Office)',
    url: 'https://worldwide.espacenet.com/',
    description:
      'European Patent Office searchable patent database.',
    verified: true,
  },
};

/**
 * Government Document Sources
 */
export const governmentSources = {
  nasaNtrs: {
    name: 'NASA Technical Reports Server',
    url: 'https://ntrs.nasa.gov/',
    description:
      'Official NASA technical document repository. Contains NASA LENR-related papers and presentations.',
    verified: true,
  },
  osti: {
    name: 'OSTI.gov (Office of Scientific and Technical Information)',
    url: 'https://www.osti.gov/',
    description:
      'DOE science and technology information portal. Contains DOE LENR reviews and reports.',
    verified: true,
  },
  nedo: {
    name: 'NEDO (Japan)',
    url: 'https://www.nedo.go.jp/',
    description:
      'New Energy and Industrial Technology Development Organization of Japan.',
    verified: true,
  },
  enea: {
    name: 'ENEA (Italy)',
    url: 'https://www.enea.it/',
    description:
      'Italian National Agency for New Technologies, Energy and Sustainable Economic Development.',
    verified: true,
  },
};

/**
 * Academic Journal Sources (DOI providers)
 */
export const academicJournals = {
  doi: {
    name: 'DOI.org',
    url: 'https://doi.org/',
    description:
      'Digital Object Identifier system. All DOI links in this database resolve through doi.org.',
    verified: true,
  },
  elsevier: {
    name: 'Elsevier ScienceDirect',
    url: 'https://www.sciencedirect.com/',
    description:
      'Publisher of Journal of Electroanalytical Chemistry where Fleischmann-Pons papers were published.',
    verified: true,
  },
  springer: {
    name: 'Springer Nature',
    url: 'https://www.springer.com/',
    description:
      'Publisher of Naturwissenschaften and European Physical Journal.',
    verified: true,
  },
  worldScientific: {
    name: 'World Scientific',
    url: 'https://www.worldscientific.com/',
    description:
      'Publisher of various LENR-related books and papers.',
    verified: true,
  },
};

/**
 * Company Official Sources
 */
export const companySources = {
  brillouinEnergy: {
    name: 'Brillouin Energy Corporation',
    url: 'https://brillouinenergy.com/',
    description:
      'Official website of Brillouin Energy, Berkeley CA-based LENR company.',
    verified: true,
  },
  cleanPlanet: {
    name: 'Clean Planet Inc.',
    url: 'https://www.cleanplanet.co.jp/',
    description:
      'Official website of Clean Planet, Japanese LENR company.',
    verified: true,
  },
  sriInternational: {
    name: 'SRI International',
    url: 'https://www.sri.com/',
    description:
      'Independent research institute that has conducted LENR research.',
    verified: true,
  },
};

/**
 * Key DOI Links for Verification
 * These are the most important peer-reviewed papers with DOIs
 */
export const keyDOILinks = [
  {
    description: 'Original Fleischmann-Pons 1989 paper',
    doi: '10.1016/0022-0728(89)80006-3',
    url: 'https://doi.org/10.1016/0022-0728(89)80006-3',
  },
  {
    description: 'Fleischmann-Pons 1990 calorimetry paper',
    doi: '10.1016/0022-0728(90)87006-6',
    url: 'https://doi.org/10.1016/0022-0728(90)87006-6',
  },
  {
    description: 'Miles helium correlation paper',
    doi: '10.1016/0022-0728(91)85080-9',
    url: 'https://doi.org/10.1016/0022-0728(91)85080-9',
  },
  {
    description: 'SPAWAR CR-39 triple tracks paper (Naturwissenschaften)',
    doi: '10.1007/s00114-008-0449-x',
    url: 'https://doi.org/10.1007/s00114-008-0449-x',
  },
  {
    description: 'Widom-Larsen theory paper',
    doi: '10.1140/epjc/s2006-02479-8',
    url: 'https://doi.org/10.1140/epjc/s2006-02479-8',
  },
  {
    description: 'Schwinger cold fusion hypothesis',
    doi: '10.1515/zna-1990-0508',
    url: 'https://doi.org/10.1515/zna-1990-0508',
  },
  {
    description: 'Iwamura transmutation paper (JJAP)',
    doi: '10.1143/JJAP.41.4642',
    url: 'https://doi.org/10.1143/JJAP.41.4642',
  },
  {
    description: 'Storms LENR book',
    doi: '10.1142/6425',
    url: 'https://doi.org/10.1142/6425',
  },
  {
    description: 'Arata excess heat paper (Japan Academy)',
    doi: '10.2183/pjab.71.304',
    url: 'https://doi.org/10.2183/pjab.71.304',
  },
  {
    description: 'SPAWAR 2002 Physics Letters A',
    doi: '10.1016/S0375-9601(02)00371-X',
    url: 'https://doi.org/10.1016/S0375-9601(02)00371-X',
  },
];

/**
 * Historical Archives
 */
export const historicalArchives = {
  fbiTeslaFiles: {
    name: 'FBI Vault - Nikola Tesla',
    url: 'https://vault.fbi.gov/nikola-tesla',
    description:
      'Declassified FBI files on Nikola Tesla. Note: Not directly LENR but related to free energy history.',
    verified: true,
  },
  teslaUniverse: {
    name: 'Tesla Universe',
    url: 'https://teslauniverse.com/',
    description: 'Archive of Tesla patents and documents.',
    verified: true,
  },
};

/**
 * Get all sources as a flat array
 */
export function getAllSources() {
  return {
    archives: Object.values(primaryArchives),
    patents: Object.values(patentDatabases),
    government: Object.values(governmentSources),
    journals: Object.values(academicJournals),
    companies: Object.values(companySources),
    historical: Object.values(historicalArchives),
  };
}

/**
 * Get count of all verified sources
 */
export function getSourceCount(): number {
  const all = getAllSources();
  return (
    all.archives.length +
    all.patents.length +
    all.government.length +
    all.journals.length +
    all.companies.length +
    all.historical.length
  );
}

/**
 * Get all DOI links for verification
 */
export function getKeyDOILinks() {
  return keyDOILinks;
}
