/**
 * Industrial Heat LLC and Related Ventures
 *
 * VERIFIED COMPANY: Industrial Heat is a real company that was involved
 * in LENR research and notably licensed Andrea Rossi's E-Cat technology
 * before a contentious legal dispute. They have invested in multiple
 * LENR companies and continue to support research in the field.
 *
 * Status: Active but pivoted focus (as of 2024)
 */

import type { LENRCompany, LENRPaper } from '../types';

/**
 * Industrial Heat company profile
 */
export const industrialHeat: LENRCompany = {
  id: 'industrial-heat',
  name: 'Industrial Heat LLC',
  country: 'United States',
  website: 'https://industrialheat.co/', // Note: limited public web presence
  founded: 2012,
  status: 'active',
  technology:
    'Investment and development of various LENR approaches - Previously licensed E-Cat technology, now supports multiple research efforts',
  keyPeople: [
    {
      name: 'Tom Darden',
      role: 'Founder & CEO',
      affiliation: 'Cherokee Investment Partners',
    },
    {
      name: 'J.T. Vaughn',
      role: 'Co-Founder',
      affiliation: 'Industrial Heat',
    },
  ],
  funding: [
    {
      source: 'Cherokee Investment Partners',
      type: 'private',
      year: 2012,
      amount: '$11.5 million initial funding',
    },
    {
      source: 'Woodford Investment Management',
      type: 'investment',
      year: 2015,
      amount: 'Reported $50 million',
    },
  ],
  publications: [
    'Various due diligence reports (proprietary)',
    'Support for academic research',
  ],
  patents: [],
  description:
    'Industrial Heat was founded by Tom Darden of Cherokee Investment Partners to commercialize LENR technology. They famously licensed Andrea Rossi E-Cat technology but later had a contentious legal dispute. Despite the Rossi situation, they continued to support LENR research through investments in Brillouin Energy and support for academic research. They represent the most significant venture capital interest in LENR.',
  lastVerified: '2024-01-15',
};

/**
 * Other notable LENR companies
 */
export const otherLENRCompanies: LENRCompany[] = [
  {
    id: 'rossi-leonardo',
    name: 'Leonardo Corporation',
    country: 'United States',
    website: 'https://ecat.com/',
    founded: 2011,
    status: 'active',
    technology: 'E-Cat (Energy Catalyzer) - Nickel-hydrogen reactor',
    keyPeople: [
      {
        name: 'Andrea Rossi',
        role: 'Founder & CEO',
        affiliation: 'Leonardo Corporation',
      },
    ],
    publications: [
      'Multiple patent applications',
      'E-Cat demonstration videos',
    ],
    patents: ['US 9,115,913 B1', 'Various international applications'],
    description:
      'Andrea Rossi E-Cat technology is the most publicized but also most controversial LENR claim. The technology has never been independently verified to scientific standards, and Rossi has been involved in legal disputes. CAUTION: Claims should be treated with skepticism until independent verification.',
    lastVerified: '2024-01-15',
  },
  {
    id: 'unified-gravity',
    name: 'Unified Gravity Corporation',
    country: 'United States',
    website: 'https://unifiedgravity.com/',
    founded: 2015,
    status: 'unknown',
    technology: 'Theoretical LENR approaches',
    keyPeople: [],
    publications: [],
    description:
      'Company pursuing theoretical approaches to LENR. Limited public information available.',
    lastVerified: '2023-06-01',
  },
  {
    id: 'safire-project',
    name: 'Aureon Energy Ltd (SAFIRE Project)',
    country: 'Canada',
    website: 'https://aureon.ca/',
    founded: 2019,
    status: 'active',
    technology:
      'Plasma-based transmutation and energy generation derived from SAFIRE project',
    keyPeople: [
      {
        name: 'Montgomery Childs',
        role: 'Project Lead',
        affiliation: 'SAFIRE Project',
      },
    ],
    publications: ['SAFIRE project videos and reports'],
    description:
      'The SAFIRE project, now commercialized as Aureon Energy, claims to have observed transmutation and excess energy in plasma discharge experiments. Research is ongoing and claims require independent verification.',
    lastVerified: '2024-01-15',
  },
];

/**
 * Historical LENR companies no longer active
 */
export const historicalLENRCompanies: LENRCompany[] = [
  {
    id: 'patterson-power',
    name: 'Patterson Power Cell',
    country: 'United States',
    website: '',
    founded: 1995,
    status: 'closed',
    technology: 'Thin-film palladium microspheres electrolysis',
    keyPeople: [
      {
        name: 'James Patterson',
        role: 'Inventor',
        affiliation: 'Clean Energy Technologies Inc.',
      },
    ],
    publications: [
      'Several patents on power cell design',
      'Demonstrations for ABC News (1996)',
    ],
    patents: ['US 5,494,559', 'US 5,318,675'],
    description:
      'James Patterson developed a LENR cell using thin-film palladium on microspheres. The technology received media attention in the 1990s but was never commercialized. Patterson died in 2008.',
    lastVerified: '2023-01-01',
  },
  {
    id: 'defkalion',
    name: 'Defkalion Green Technologies',
    country: 'Greece',
    website: '',
    founded: 2011,
    status: 'closed',
    technology: 'Hyperion reactor (nickel-hydrogen)',
    keyPeople: [],
    publications: [],
    description:
      'Greek company that claimed to develop Hyperion LENR reactor. Company ceased operations around 2015 without delivering commercial products. Status is cautionary tale for LENR investment.',
    lastVerified: '2023-01-01',
  },
];

/**
 * The Industrial Heat - Rossi litigation summary
 * IMPORTANT: This is documented legal history, not endorsement of claims
 */
export const industrialHeatRossiCase = {
  parties: ['Industrial Heat LLC', 'Leonardo Corporation (Andrea Rossi)'],
  filingDate: '2016-04-05',
  resolution: 'Settlement (2017)',
  caseNumber: '1:16-cv-21199-CMA',
  jurisdiction: 'U.S. District Court, Southern District of Florida',
  summary:
    'Andrea Rossi sued Industrial Heat for $89 million, claiming they failed to pay for successful technology demonstration. Industrial Heat countersued, claiming the technology did not perform as promised. Case was settled confidentially in 2017.',
  relevance:
    'This case highlights the challenges of commercializing LENR technology and the importance of independent verification. Neither party claims were definitively proven in court.',
  documentUrl: 'https://www.courtlistener.com/docket/4488550/andrea-rossi-v-thomas-darden/',
};

/**
 * Get Industrial Heat profile
 */
export function getIndustrialHeatProfile(): LENRCompany {
  return industrialHeat;
}

/**
 * Get all active LENR companies
 */
export function getAllLENRCompanies(): LENRCompany[] {
  return [industrialHeat, ...otherLENRCompanies];
}

/**
 * Get historical LENR companies
 */
export function getHistoricalCompanies(): LENRCompany[] {
  return historicalLENRCompanies;
}

/**
 * Get companies by status
 */
export function getCompaniesByStatus(status: LENRCompany['status']): LENRCompany[] {
  return getAllLENRCompanies().filter((c) => c.status === status);
}
