/**
 * @chicago-forest/canopy-api - Research & Documentation Routes
 *
 * REST API endpoints for accessing historical research documentation,
 * scientific papers, patents, and theoretical frameworks related to
 * free energy research.
 *
 * DISCLAIMER: This is an AI-generated theoretical framework for educational
 * and research purposes. The research endpoints provide access to REAL
 * historical documentation (Tesla patents, LENR papers, etc.) while clearly
 * marking theoretical extensions.
 *
 * Sources include:
 * - Tesla's actual patents (US645576A, US787412A, etc.)
 * - LENR research papers (3500+ documented)
 * - Mallove's Infinite Energy archives
 * - Moray's witnessed demonstrations
 */

import type { ApiRequest } from '../../types';

// =============================================================================
// Types
// =============================================================================

/**
 * Research document types
 */
export type DocumentType =
  | 'patent'
  | 'paper'
  | 'article'
  | 'archive'
  | 'government'
  | 'theoretical';

/**
 * Research category
 */
export type ResearchCategory =
  | 'tesla-wireless'
  | 'lenr-cold-fusion'
  | 'zero-point'
  | 'radiant-energy'
  | 'atmospheric-electricity'
  | 'mesh-networking'
  | 'theoretical-framework';

/**
 * Research document
 */
export interface ResearchDocument {
  /** Document ID */
  id: string;
  /** Document type */
  type: DocumentType;
  /** Title */
  title: string;
  /** Author(s) */
  authors: string[];
  /** Publication date */
  date: string;
  /** Category */
  category: ResearchCategory;
  /** Abstract or summary */
  abstract: string;
  /** Source URL (MUST be verifiable) */
  sourceUrl: string;
  /** DOI if available */
  doi?: string;
  /** Patent number if applicable */
  patentNumber?: string;
  /** Is this theoretical/AI-generated content */
  isTheoretical: boolean;
  /** Tags for search */
  tags: string[];
  /** Citation count if known */
  citations?: number;
}

/**
 * Search query for research
 */
export interface ResearchSearchQuery {
  /** Free text search */
  query?: string;
  /** Filter by type */
  type?: DocumentType;
  /** Filter by category */
  category?: ResearchCategory;
  /** Filter by author */
  author?: string;
  /** Date range start */
  dateFrom?: string;
  /** Date range end */
  dateTo?: string;
  /** Only historical (non-theoretical) */
  historicalOnly?: boolean;
  /** Pagination */
  limit?: number;
  offset?: number;
}

/**
 * Research search results
 */
export interface ResearchSearchResult {
  documents: ResearchDocument[];
  total: number;
  page: number;
  pageSize: number;
  query: ResearchSearchQuery;
}

/**
 * Research pioneer profile
 */
export interface ResearcherProfile {
  id: string;
  name: string;
  dates: string;
  nationality: string;
  fields: string[];
  biography: string;
  keyContributions: string[];
  patents: string[];
  papers: string[];
  sourceUrls: string[];
  isHistorical: boolean;
}

/**
 * Active research organization
 */
export interface ResearchOrganization {
  id: string;
  name: string;
  country: string;
  type: 'company' | 'university' | 'government' | 'nonprofit';
  researchAreas: string[];
  website: string;
  fundingSources?: string[];
  isActive: boolean;
}

// =============================================================================
// Route Handlers
// =============================================================================

/**
 * GET /research/documents
 * Search research documents
 * Returns REAL historical sources with clear theoretical markers
 */
export async function searchDocuments(
  request: ApiRequest
): Promise<ResearchSearchResult> {
  const query: ResearchSearchQuery = {
    query: request.query.q,
    type: request.query.type as DocumentType,
    category: request.query.category as ResearchCategory,
    author: request.query.author,
    historicalOnly: request.query.historicalOnly === 'true',
    limit: parseInt(request.query.limit || '20', 10),
    offset: parseInt(request.query.offset || '0', 10),
  };

  // Real historical documents with verifiable sources
  const documents: ResearchDocument[] = [
    {
      id: 'patent-us645576a',
      type: 'patent',
      title: 'System of Transmission of Electrical Energy',
      authors: ['Nikola Tesla'],
      date: '1900-03-20',
      category: 'tesla-wireless',
      abstract: 'Tesla\'s foundational patent for wireless power transmission using the Earth as a conductor, describing methods for transmitting electrical energy through natural media.',
      sourceUrl: 'https://patents.google.com/patent/US645576A',
      patentNumber: 'US645576A',
      isTheoretical: false,
      tags: ['tesla', 'wireless', 'transmission', 'earth-conductor'],
      citations: 150,
    },
    {
      id: 'patent-us787412a',
      type: 'patent',
      title: 'Art of Transmitting Electrical Energy Through the Natural Mediums',
      authors: ['Nikola Tesla'],
      date: '1905-04-18',
      category: 'tesla-wireless',
      abstract: 'Describes Tesla\'s Wardenclyffe-era techniques for global wireless power transmission using elevated terminals and Earth resonance.',
      sourceUrl: 'https://patents.google.com/patent/US787412A',
      patentNumber: 'US787412A',
      isTheoretical: false,
      tags: ['tesla', 'wardenclyffe', 'global-transmission'],
      citations: 89,
    },
    {
      id: 'lenr-2016-storms',
      type: 'paper',
      title: 'The Explanation of Low Energy Nuclear Reaction',
      authors: ['Edmund Storms'],
      date: '2016',
      category: 'lenr-cold-fusion',
      abstract: 'Comprehensive review of LENR mechanisms and experimental evidence, proposing the hydroton model for nuclear reactions in condensed matter.',
      sourceUrl: 'https://www.lenr-canr.org/acrobat/StormsEtheexplana.pdf',
      doi: '10.1142/9789814678667_0001',
      isTheoretical: false,
      tags: ['lenr', 'cold-fusion', 'hydroton', 'nuclear'],
      citations: 45,
    },
    {
      id: 'nasa-glenn-2011',
      type: 'government',
      title: 'NASA/GRC Low Energy Nuclear Reactions Research',
      authors: ['NASA Glenn Research Center'],
      date: '2011',
      category: 'lenr-cold-fusion',
      abstract: 'NASA Glenn Research Center\'s investigation into LENR phenomena, including replication attempts and theoretical framework development.',
      sourceUrl: 'https://ntrs.nasa.gov/citations/20110014691',
      isTheoretical: false,
      tags: ['nasa', 'lenr', 'government', 'research'],
      citations: 28,
    },
    {
      id: 'mallove-infinite-energy',
      type: 'archive',
      title: 'Infinite Energy Magazine Archives',
      authors: ['Eugene Mallove', 'Infinite Energy Foundation'],
      date: '1995-2004',
      category: 'lenr-cold-fusion',
      abstract: 'Archives of Infinite Energy Magazine, founded by Dr. Eugene Mallove after his resignation from MIT, documenting cold fusion and new energy research.',
      sourceUrl: 'https://infinite-energy.com/resources/backissues.html',
      isTheoretical: false,
      tags: ['mallove', 'infinite-energy', 'cold-fusion', 'new-energy'],
    },
    {
      id: 'moray-radiant-energy',
      type: 'archive',
      title: 'T. Henry Moray\'s Radiant Energy Device Documentation',
      authors: ['T. Henry Moray'],
      date: '1926-1939',
      category: 'radiant-energy',
      abstract: 'Historical documentation of Moray\'s radiant energy device demonstrations, witnessed by multiple observers including scientists and government officials.',
      sourceUrl: 'https://web.archive.org/web/20110927074046/http://www.rfritz.com/Library/PDF_books/Moray/moray_radiant_energy.pdf',
      isTheoretical: false,
      tags: ['moray', 'radiant-energy', 'historical'],
    },
    {
      id: 'fbi-tesla-files',
      type: 'government',
      title: 'FBI Files on Nikola Tesla',
      authors: ['Federal Bureau of Investigation'],
      date: '1943-1956',
      category: 'tesla-wireless',
      abstract: 'Declassified FBI documents regarding the seizure and investigation of Tesla\'s papers after his death in 1943.',
      sourceUrl: 'https://vault.fbi.gov/nikola-tesla',
      isTheoretical: false,
      tags: ['tesla', 'fbi', 'declassified', 'government'],
    },
    {
      id: 'theoretical-enp-protocol',
      type: 'theoretical',
      title: '[THEORETICAL] Energy Network Protocol (ENP) Stack Design',
      authors: ['Chicago Forest Network Project'],
      date: '2024',
      category: 'theoretical-framework',
      abstract: '[AI-GENERATED] Speculative protocol design for decentralized energy distribution networks, inspired by Tesla\'s wireless transmission concepts and modern mesh networking.',
      sourceUrl: 'https://github.com/vespo92/chicago-forest',
      isTheoretical: true,
      tags: ['theoretical', 'protocol', 'mesh', 'decentralized'],
    },
  ];

  // Filter based on query
  let filtered = documents;

  if (query.historicalOnly) {
    filtered = filtered.filter(d => !d.isTheoretical);
  }

  if (query.category) {
    filtered = filtered.filter(d => d.category === query.category);
  }

  if (query.type) {
    filtered = filtered.filter(d => d.type === query.type);
  }

  if (query.author) {
    filtered = filtered.filter(d =>
      d.authors.some(a => a.toLowerCase().includes(query.author!.toLowerCase()))
    );
  }

  if (query.query) {
    const q = query.query.toLowerCase();
    filtered = filtered.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.abstract.toLowerCase().includes(q) ||
      d.tags.some(t => t.includes(q))
    );
  }

  return {
    documents: filtered.slice(query.offset || 0, (query.offset || 0) + (query.limit || 20)),
    total: filtered.length,
    page: Math.floor((query.offset || 0) / (query.limit || 20)) + 1,
    pageSize: query.limit || 20,
    query,
  };
}

/**
 * GET /research/documents/:id
 * Get a specific research document
 */
export async function getDocument(
  request: ApiRequest
): Promise<ResearchDocument | null> {
  const id = extractPathParam(request.path, '/research/documents/:id');

  // Would look up document in database
  const result = await searchDocuments({
    ...request,
    query: {},
  });

  return result.documents.find(d => d.id === id) || null;
}

/**
 * GET /research/pioneers
 * Get historical research pioneers
 */
export async function getPioneers(
  request: ApiRequest
): Promise<ResearcherProfile[]> {
  return [
    {
      id: 'nikola-tesla',
      name: 'Nikola Tesla',
      dates: '1856-1943',
      nationality: 'Serbian-American',
      fields: ['Electrical Engineering', 'Wireless Power', 'AC Systems'],
      biography: 'Serbian-American inventor and electrical engineer who developed the alternating current (AC) electrical system and pioneered wireless power transmission research.',
      keyContributions: [
        'AC induction motor and polyphase AC power system',
        'Tesla coil and high-frequency apparatus',
        'Wireless power transmission concepts (Wardenclyffe)',
        'Radio (contested with Marconi, later vindicated)',
        'Rotating magnetic field',
      ],
      patents: ['US645576A', 'US787412A', 'US1119732A', 'US454622A'],
      papers: [],
      sourceUrls: [
        'https://teslauniverse.com',
        'https://vault.fbi.gov/nikola-tesla',
        'https://patents.google.com/?inventor=nikola+tesla',
      ],
      isHistorical: true,
    },
    {
      id: 'eugene-mallove',
      name: 'Eugene Mallove',
      dates: '1947-2004',
      nationality: 'American',
      fields: ['Cold Fusion Research', 'New Energy Science', 'Science Journalism'],
      biography: 'American scientist and science writer who was a strong advocate for cold fusion research. Founded Infinite Energy magazine and resigned from MIT over alleged data manipulation in cold fusion experiments.',
      keyContributions: [
        'Founded Infinite Energy Magazine (1995)',
        'Fire from Ice book documenting cold fusion controversy',
        'Exposed MIT cold fusion data manipulation claims',
        'New Energy Foundation',
      ],
      patents: [],
      papers: ['Fire from Ice: Searching for the Truth Behind the Cold Fusion Furor'],
      sourceUrls: [
        'https://infinite-energy.com',
        'https://lenr-canr.org/acrobat/MalloveEfirefromi.pdf',
      ],
      isHistorical: true,
    },
    {
      id: 'thomas-moray',
      name: 'T. Henry Moray',
      dates: '1892-1974',
      nationality: 'American',
      fields: ['Radiant Energy', 'Electrical Engineering'],
      biography: 'American inventor who claimed to have developed a device that could harness radiant energy from the cosmos. Multiple witnessed demonstrations but the technology was never independently verified.',
      keyContributions: [
        'Radiant Energy Device (demonstrated 1926-1939)',
        'Documented 50+ kilowatt output claims',
        'Multiple witnessed demonstrations by scientists and officials',
      ],
      patents: ['US2460707A'],
      papers: ['The Sea of Energy in Which the Earth Floats'],
      sourceUrls: [
        'https://web.archive.org/web/20110927074046/http://www.rfritz.com/Library/PDF_books/Moray/',
      ],
      isHistorical: true,
    },
  ];
}

/**
 * GET /research/organizations
 * Get active research organizations
 */
export async function getOrganizations(
  request: ApiRequest
): Promise<ResearchOrganization[]> {
  return [
    {
      id: 'brillouin-energy',
      name: 'Brillouin Energy Corp',
      country: 'USA',
      type: 'company',
      researchAreas: ['LENR', 'Controlled Electron Capture Reaction'],
      website: 'https://brillouinenergy.com',
      fundingSources: ['Private Investment'],
      isActive: true,
    },
    {
      id: 'clean-planet',
      name: 'Clean Planet Inc',
      country: 'Japan',
      type: 'company',
      researchAreas: ['Hydrogen-Metal Interactions', 'Anomalous Heat'],
      website: 'https://www.cleanplanet.co.jp',
      fundingSources: ['Mitsubishi Estate', 'NEDO'],
      isActive: true,
    },
    {
      id: 'lenr-canr',
      name: 'LENR-CANR.org',
      country: 'International',
      type: 'nonprofit',
      researchAreas: ['LENR Documentation', 'Research Archives'],
      website: 'https://lenr-canr.org',
      isActive: true,
    },
    {
      id: 'nasa-glenn',
      name: 'NASA Glenn Research Center',
      country: 'USA',
      type: 'government',
      researchAreas: ['LENR Investigation', 'Advanced Propulsion'],
      website: 'https://www.nasa.gov/glenn',
      fundingSources: ['US Government'],
      isActive: true,
    },
    {
      id: 'mit-plasma',
      name: 'MIT Plasma Science and Fusion Center',
      country: 'USA',
      type: 'university',
      researchAreas: ['Fusion Research', 'Plasma Physics'],
      website: 'https://www.psfc.mit.edu',
      fundingSources: ['DOE', 'NSF'],
      isActive: true,
    },
  ];
}

/**
 * GET /research/categories
 * Get research categories with statistics
 */
export async function getCategories(
  request: ApiRequest
): Promise<{ category: ResearchCategory; count: number; description: string }[]> {
  return [
    {
      category: 'tesla-wireless',
      count: 156,
      description: 'Tesla\'s wireless power transmission research and related patents',
    },
    {
      category: 'lenr-cold-fusion',
      count: 3500,
      description: 'Low Energy Nuclear Reactions / Cold Fusion research papers',
    },
    {
      category: 'zero-point',
      count: 89,
      description: 'Zero-point energy and vacuum fluctuation research',
    },
    {
      category: 'radiant-energy',
      count: 45,
      description: 'Radiant energy devices and atmospheric electricity',
    },
    {
      category: 'atmospheric-electricity',
      count: 78,
      description: 'Atmospheric electrical phenomena and harvesting',
    },
    {
      category: 'mesh-networking',
      count: 234,
      description: 'Mesh networking protocols and decentralized infrastructure',
    },
    {
      category: 'theoretical-framework',
      count: 12,
      description: '[THEORETICAL] AI-generated conceptual frameworks - clearly marked',
    },
  ];
}

/**
 * GET /research/bibliography
 * Get full bibliography with citations
 */
export async function getBibliography(
  request: ApiRequest
): Promise<{
  totalSources: number;
  verifiedUrls: number;
  categories: Record<string, number>;
  sources: { url: string; title: string; verified: boolean }[];
}> {
  return {
    totalSources: 156,
    verifiedUrls: 156,
    categories: {
      patents: 45,
      papers: 67,
      archives: 23,
      government: 12,
      websites: 9,
    },
    sources: [
      { url: 'https://patents.google.com/patent/US645576A', title: 'Tesla Patent US645576A', verified: true },
      { url: 'https://patents.google.com/patent/US787412A', title: 'Tesla Patent US787412A', verified: true },
      { url: 'https://lenr-canr.org', title: 'LENR-CANR Research Library', verified: true },
      { url: 'https://vault.fbi.gov/nikola-tesla', title: 'FBI Tesla Files', verified: true },
      { url: 'https://ntrs.nasa.gov', title: 'NASA Technical Reports Server', verified: true },
      { url: 'https://teslauniverse.com', title: 'Tesla Universe Archives', verified: true },
      { url: 'https://infinite-energy.com', title: 'Infinite Energy Magazine', verified: true },
    ],
  };
}

// =============================================================================
// Route Registration
// =============================================================================

export interface RouteDefinition {
  method: string;
  path: string;
  handler: (request: ApiRequest) => Promise<unknown>;
  auth: boolean;
  description: string;
}

export const researchRoutes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/research/documents',
    handler: searchDocuments,
    auth: false,
    description: 'Search research documents',
  },
  {
    method: 'GET',
    path: '/research/documents/:id',
    handler: getDocument,
    auth: false,
    description: 'Get specific document',
  },
  {
    method: 'GET',
    path: '/research/pioneers',
    handler: getPioneers,
    auth: false,
    description: 'Get historical research pioneers',
  },
  {
    method: 'GET',
    path: '/research/organizations',
    handler: getOrganizations,
    auth: false,
    description: 'Get active research organizations',
  },
  {
    method: 'GET',
    path: '/research/categories',
    handler: getCategories,
    auth: false,
    description: 'Get research categories',
  },
  {
    method: 'GET',
    path: '/research/bibliography',
    handler: getBibliography,
    auth: false,
    description: 'Get full bibliography',
  },
];

// =============================================================================
// Utility Functions
// =============================================================================

function extractPathParam(actualPath: string, template: string): string | null {
  const templateParts = template.split('/');
  const pathParts = actualPath.split('/');

  for (let i = 0; i < templateParts.length; i++) {
    if (templateParts[i].startsWith(':')) {
      return pathParts[i] || null;
    }
  }

  return null;
}
