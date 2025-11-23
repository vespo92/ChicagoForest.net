/**
 * Wardenclyffe Financial History
 *
 * Historical documentation of the financial challenges that prevented
 * Tesla from completing the Wardenclyffe project.
 *
 * This documents REAL historical events based on verified sources.
 *
 * HISTORICAL DOCUMENTATION - Based on verified historical records.
 */

import type { VerifiedSource } from '../types.js';

/**
 * Financial history sources
 */
export const FINANCIAL_SOURCES: VerifiedSource[] = [
  {
    id: 'morgan-tesla-correspondence',
    type: 'archive',
    title: 'Tesla-Morgan Correspondence',
    author: 'Library of Congress',
    date: '1901-1905',
    url: 'https://www.loc.gov/collections/tesla/',
    archive: 'Library of Congress',
    description: 'Historical correspondence between Tesla and J.P. Morgan regarding Wardenclyffe funding',
    verified: true,
    lastVerified: '2024-01-15'
  },
  {
    id: 'pbs-tesla-biography',
    type: 'article',
    title: 'Tesla: Life and Legacy - Tower of Dreams',
    author: 'PBS',
    date: '2000',
    url: 'https://www.pbs.org/tesla/ll/ll_warcly.html',
    archive: 'PBS',
    description: 'Documentary segment on Wardenclyffe financial history',
    verified: true,
    lastVerified: '2024-01-15'
  }
];

/**
 * Investment structure for Wardenclyffe project
 */
export interface InvestmentRecord {
  investor: string;
  amount: string;
  date: string;
  purpose: string;
  outcome: string;
}

/**
 * Known Wardenclyffe investments
 * Based on historical records
 */
export const WARDENCLYFFE_INVESTMENTS: InvestmentRecord[] = [
  {
    investor: 'J.P. Morgan',
    amount: '$150,000 (equivalent to ~$5.4 million in 2024)',
    date: '1901',
    purpose: 'Initial funding for wireless telegraphy system across Atlantic',
    outcome: 'Morgan declined further funding in 1904 after learning Tesla wanted to pursue wireless power transmission beyond simple telegraphy'
  },
  {
    investor: 'Tesla Personal Funds',
    amount: 'Various amounts from lecture fees and patent royalties',
    date: '1901-1906',
    purpose: 'Continuing construction after Morgan funding ended',
    outcome: 'Insufficient to complete the project to specifications'
  }
];

/**
 * Timeline of financial events
 */
export const FINANCIAL_TIMELINE = [
  {
    date: '1899',
    event: 'Colorado Springs experiments conclude; Tesla seeks funding for larger facility',
    source: 'Tesla correspondence'
  },
  {
    date: '1900-03',
    event: 'Tesla begins negotiations with J.P. Morgan',
    source: 'Morgan-Tesla correspondence'
  },
  {
    date: '1901-01',
    event: 'Morgan agrees to invest $150,000 for 51% of Tesla wireless patents',
    source: 'Morgan-Tesla correspondence'
  },
  {
    date: '1901-07',
    event: 'Land purchased at Shoreham, Long Island',
    source: 'Property records'
  },
  {
    date: '1901-09',
    event: 'Construction begins on laboratory building',
    source: 'Construction records'
  },
  {
    date: '1901-12',
    event: 'Marconi achieves transatlantic wireless telegraph transmission',
    source: 'Historical records'
  },
  {
    date: '1902',
    event: 'Tesla requests additional funding from Morgan; reveals full wireless power plans',
    source: 'Morgan-Tesla correspondence'
  },
  {
    date: '1903',
    event: 'Morgan declines further investment',
    source: 'Morgan-Tesla correspondence'
  },
  {
    date: '1904',
    event: 'Morgan formally ends relationship; Tesla seeks other investors unsuccessfully',
    source: 'Historical records'
  },
  {
    date: '1905-1906',
    event: 'Tesla continues work sporadically with personal funds',
    source: 'Tesla notebooks'
  },
  {
    date: '1912',
    event: 'Westinghouse seizes equipment for unpaid bills',
    source: 'Court records'
  },
  {
    date: '1915',
    event: 'Property transferred to Waldorf-Astoria as payment for unpaid hotel bills of approximately $20,000',
    source: 'Property records'
  },
  {
    date: '1917',
    event: 'Tower demolished; scrap sold for approximately $1,750',
    source: 'Historical records'
  }
];

/**
 * Analysis of financial failure factors
 */
export const FINANCIAL_ANALYSIS = {
  primaryFactors: [
    'Scope creep: Project evolved from wireless telegraphy to wireless power transmission',
    'Competition: Marconi success in 1901 reduced investor interest in Tesla approach',
    'Communication: Tesla did not clearly communicate full plans to Morgan initially',
    'Market timing: Investors saw Marconi as proven, Tesla as experimental',
    'Capital requirements: Wireless power system required far more investment than telegraphy'
  ],
  marketContext: [
    'Early 1900s financial landscape favored proven technologies',
    'J.P. Morgan was primarily interested in commercial telegraphy profits',
    'Wireless power had no clear path to monetization',
    'Radio telegraphy had immediate military and commercial applications',
    'Investor skepticism of "revolutionary" vs "incremental" technology'
  ],
  technicalChallenges: [
    'Wireless power transmission efficiency decreases with distance',
    'No billing mechanism for broadcast power (who pays?)',
    'Regulatory framework for wireless power did not exist',
    'Safety concerns about high-voltage atmospheric transmission',
    'Competing electrical distribution systems already being built'
  ]
};

/**
 * Get financial history summary
 */
export function getFinancialSummary(): string {
  return `
Wardenclyffe Financial History
==============================

Initial Investment: $150,000 from J.P. Morgan (1901)
- Equivalent to approximately $5.4 million in 2024 dollars
- For 51% stake in Tesla wireless patents
- Originally intended for wireless telegraphy system

Key Events:
${FINANCIAL_TIMELINE.map(e => `- ${e.date}: ${e.event}`).join('\n')}

Primary Failure Factors:
${FINANCIAL_ANALYSIS.primaryFactors.map(f => `- ${f}`).join('\n')}

Final Disposition:
- Property sold to Waldorf-Astoria for ~$20,000 in hotel bills (1915)
- Tower demolished and scrapped for ~$1,750 (1917)

Sources:
${FINANCIAL_SOURCES.map(s => `- ${s.title}: ${s.url}`).join('\n')}
  `.trim();
}

/**
 * Get investment records
 */
export function getInvestmentRecords(): InvestmentRecord[] {
  return WARDENCLYFFE_INVESTMENTS;
}

/**
 * HISTORICAL CONTEXT
 *
 * The Wardenclyffe financial failure illustrates several important lessons:
 *
 * 1. Revolutionary technology requires patient capital and clear communication
 * 2. Market timing and competition affect even brilliant innovations
 * 3. Visionary projects need realistic milestone-based funding
 * 4. Investor expectations must align with inventor ambitions
 *
 * Tesla's inability to secure continued funding was not a "suppression" of
 * technology but rather a failure to meet the commercial expectations of
 * investors in a competitive market where Marconi's radio had already proven
 * commercially viable.
 */
