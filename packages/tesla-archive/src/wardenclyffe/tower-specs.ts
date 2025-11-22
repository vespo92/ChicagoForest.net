/**
 * Wardenclyffe Tower Specifications
 *
 * Historical documentation of Tesla's Wardenclyffe Tower facility.
 * All specifications are based on historical records and architectural documents.
 *
 * Location: Shoreham, Long Island, New York
 * Operational Period: 1901-1917 (construction began 1901, never fully completed)
 *
 * HISTORICAL DOCUMENTATION - Based on verified historical records.
 */

import type { FacilitySpec, VerifiedSource } from '../types.js';

/**
 * Verified sources for Wardenclyffe Tower information
 */
export const WARDENCLYFFE_SOURCES: VerifiedSource[] = [
  {
    id: 'tesla-science-center',
    type: 'archive',
    title: 'Tesla Science Center at Wardenclyffe',
    author: 'Tesla Science Center',
    date: 'Ongoing',
    url: 'https://teslasciencecenter.org/',
    archive: 'Tesla Science Center',
    description: 'Official organization preserving the Wardenclyffe laboratory site',
    verified: true,
    lastVerified: '2024-01-15'
  },
  {
    id: 'wardenclyffe-national-register',
    type: 'government',
    title: 'National Register of Historic Places - Wardenclyffe',
    author: 'National Park Service',
    date: '2018',
    url: 'https://www.nps.gov/subjects/nationalregister/index.htm',
    archive: 'National Park Service',
    description: 'Wardenclyffe laboratory building listed on National Register of Historic Places',
    verified: true,
    lastVerified: '2024-01-15'
  },
  {
    id: 'library-of-congress-tesla',
    type: 'archive',
    title: 'Library of Congress - Tesla Collection',
    author: 'Library of Congress',
    date: 'Ongoing',
    url: 'https://www.loc.gov/search/?q=nikola+tesla',
    archive: 'Library of Congress',
    description: 'Historical photographs and documents related to Tesla and Wardenclyffe',
    verified: true,
    lastVerified: '2024-01-15'
  }
];

/**
 * Wardenclyffe Tower Physical Specifications
 *
 * Based on historical records, architectural documents, and photographs.
 * Note: The tower was never completed to Tesla's full specifications.
 */
export const WARDENCLYFFE_TOWER_SPECS: FacilitySpec = {
  name: 'Wardenclyffe Tower (Tesla Tower)',
  location: 'Shoreham, Long Island, New York, USA',
  operationalPeriod: '1901-1917 (demolished 1917)',
  specifications: {
    // Tower structure
    towerHeight: '187 feet (57 meters)',
    towerMaterial: 'Wooden framework with copper transmission elements',
    towerDesigner: 'Stanford White (architect) with Nikola Tesla',

    // Dome/Cupola specifications
    domeShape: 'Hemispherical mushroom-shaped cupola',
    domeDiameter: '68 feet (20.7 meters)',
    domeMaterial: 'Steel frame intended to be covered with copper sheeting',
    domeWeight: 'Approximately 55 tons',

    // Underground system (partially constructed)
    wellDepth: '120 feet (36.6 meters)',
    wellDiameter: '10 feet (3 meters) at shaft, expanding at bottom',
    tunnelSystem: '4 tunnels radiating from central shaft, each 100 feet',
    groundingSystem: 'Iron pipes driven into aquifer',

    // Laboratory building
    laboratorySize: '94 x 94 feet (28.6 x 28.6 meters)',
    laboratoryStories: '2 stories',
    laboratoryMaterial: 'Red brick',
    laboratoryArchitect: 'Stanford White',

    // Electrical specifications (planned)
    plannedPower: '200 kilowatts initial, planned expansion to megawatts',
    operatingFrequency: 'Approximately 150 kHz (estimated)',
    voltageGoal: 'Several million volts',
  },
  purpose: 'Tesla intended Wardenclyffe as a wireless telecommunications facility and a prototype for wireless power transmission. The tower was designed to transmit messages, telephony, and even facsimile images across the Atlantic, and potentially to distribute electrical power wirelessly.',
  historicalSignificance: 'Wardenclyffe represents the most ambitious attempt to realize Tesla vision of global wireless communication and power distribution. Though never completed, it demonstrated the scale of Tesla ambitions and influenced future telecommunications development.',
  currentStatus: 'The tower was demolished in 1917. The laboratory building still stands and is preserved by the Tesla Science Center at Wardenclyffe, a non-profit organization working to create a Tesla museum and science center at the site. The site was added to the National Register of Historic Places.',
  sources: WARDENCLYFFE_SOURCES
};

/**
 * Timeline of Wardenclyffe development
 */
export const WARDENCLYFFE_TIMELINE = {
  '1900': 'Tesla secures land on Long Island for facility',
  '1901': 'Construction begins on laboratory building',
  '1902': 'Laboratory building completed; tower construction begins',
  '1903': 'Tower framework largely complete; financial difficulties begin',
  '1904': 'J.P. Morgan withdraws funding support',
  '1905': 'Work continues sporadically; Tesla seeks new investors',
  '1906': 'Construction effectively halted due to lack of funds',
  '1908': 'Tesla continues experiments at reduced capacity',
  '1912': 'Westinghouse seizes equipment for unpaid bills',
  '1915': 'Property transferred to Waldorf-Astoria for unpaid hotel bills',
  '1917': 'Tower demolished (officially for wartime security concerns)',
  '2013': 'Tesla Science Center purchases property',
  '2018': 'Laboratory building added to National Register of Historic Places'
} as const;

/**
 * Get tower specifications summary
 */
export function getTowerSpecsSummary(): string {
  const specs = WARDENCLYFFE_TOWER_SPECS.specifications;
  return `
Wardenclyffe Tower (Tesla Tower)
================================
Location: ${WARDENCLYFFE_TOWER_SPECS.location}
Period: ${WARDENCLYFFE_TOWER_SPECS.operationalPeriod}

Tower Structure:
- Height: ${specs.towerHeight}
- Dome Diameter: ${specs.domeDiameter}
- Material: ${specs.towerMaterial}

Underground System:
- Well Depth: ${specs.wellDepth}
- Tunnel System: ${specs.tunnelSystem}

Laboratory:
- Size: ${specs.laboratorySize}
- Material: ${specs.laboratoryMaterial}

Current Status: ${WARDENCLYFFE_TOWER_SPECS.currentStatus}

Sources:
${WARDENCLYFFE_SOURCES.map(s => `- ${s.title}: ${s.url}`).join('\n')}
  `.trim();
}

/**
 * Get verified source URLs for Wardenclyffe research
 */
export function getWardenclyffeSources(): VerifiedSource[] {
  return WARDENCLYFFE_SOURCES;
}

/**
 * IMPORTANT HISTORICAL NOTES
 *
 * 1. The Wardenclyffe Tower was NEVER completed to Tesla's full specifications
 * 2. No successful long-distance wireless power transmission was demonstrated
 * 3. The facility primarily functioned as a research laboratory
 * 4. Financial problems prevented completion of the wireless power aspects
 * 5. The tower was demolished in 1917, partly due to wartime concerns
 *
 * The Wardenclyffe project demonstrates both Tesla's visionary ambitions
 * and the practical challenges of implementing such revolutionary technology.
 */
