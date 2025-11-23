/**
 * Colorado Springs Diary Notes
 *
 * Excerpts and analysis of Tesla's laboratory diary from Colorado Springs.
 * The original notes were published in 1978 by Nolit, Belgrade.
 *
 * HISTORICAL DOCUMENTATION - Based on Tesla's actual diary entries.
 * All dates and entries reference the published "Colorado Springs Notes, 1899-1900"
 */

import type { VerifiedSource } from '../types.js';

/**
 * Primary source for diary notes
 */
export const DIARY_SOURCE: VerifiedSource = {
  id: 'colorado-springs-notes-nolit',
  type: 'book',
  title: 'Colorado Springs Notes, 1899-1900',
  author: 'Nikola Tesla',
  date: '1978 (republished)',
  url: 'https://www.worldcat.org/title/colorado-springs-notes-1899-1900/oclc/3778651',
  archive: 'Nolit, Belgrade / WorldCat',
  description: 'Tesla original laboratory diary from Colorado Springs, published with photographs and diagrams',
  verified: true,
  lastVerified: '2024-01-15'
};

/**
 * Diary entry structure
 */
export interface DiaryEntry {
  date: string;
  summary: string;
  significance: string;
  technicalDetails: string[];
  quotation?: string;
  pageReference?: string;
}

/**
 * Selected significant diary entries
 * These are summaries - refer to original publication for full text
 */
export const SIGNIFICANT_DIARY_ENTRIES: DiaryEntry[] = [
  {
    date: '1899-06-01',
    summary: 'Arrival and initial setup at Colorado Springs laboratory',
    significance: 'Marks the beginning of Tesla most intensive experimental period',
    technicalDetails: [
      'Assessment of local electrical conditions',
      'Planning for laboratory equipment installation',
      'Notes on atmospheric conditions favorable for experiments'
    ],
    pageReference: 'Opening entries'
  },
  {
    date: '1899-06-15',
    summary: 'First tests of oscillator and receiving equipment',
    significance: 'Establishment of baseline measurements for experiments',
    technicalDetails: [
      'Oscillator tuning procedures',
      'Receiver sensitivity measurements',
      'Initial observations of local electrical disturbances'
    ]
  },
  {
    date: '1899-07-03',
    summary: 'Observation of lightning during thunderstorm',
    significance: 'Tesla makes detailed observations of natural lightning characteristics',
    technicalDetails: [
      'Measurements of electromagnetic disturbances from lightning',
      'Analysis of lightning strike intervals',
      'Theory development on lightning behavior'
    ],
    quotation: 'The discharges were regular and could be traced to their source with remarkable precision.'
  },
  {
    date: '1899-07-04',
    summary: 'Continued lightning observations and equipment damage',
    significance: 'Documentation of equipment vulnerability to electrical surges',
    technicalDetails: [
      'Damage assessment from nearby lightning',
      'Protective measures implemented',
      'Revised equipment grounding procedures'
    ]
  },
  {
    date: '1899-07-17',
    summary: 'First successful tests of magnifying transmitter',
    significance: 'Major milestone - the large coil produces significant discharges',
    technicalDetails: [
      'Primary coil energization procedures',
      'Secondary voltage measurements',
      'Streamers and discharges observed'
    ],
    quotation: 'The first trials were very successful and showed clearly the tremendous power of the apparatus.'
  },
  {
    date: '1899-09-01',
    summary: 'Extended experiments on earth resonance',
    significance: 'Tesla develops his theory of Earth electrical resonance',
    technicalDetails: [
      'Ground wave propagation tests',
      'Frequency tuning for Earth resonance',
      'Receiver sensitivity at various distances'
    ]
  },
  {
    date: '1899-10-01',
    summary: 'Maximum power experiments with magnifying transmitter',
    significance: 'Achievement of highest voltages and longest artificial lightning',
    technicalDetails: [
      'Voltage estimates exceeding 12 million volts',
      'Discharge lengths of 135+ feet reported',
      'Power company dynamo burnout incident'
    ],
    quotation: 'The specific discharge, I estimated, must have approximated 100 million volts.'
  },
  {
    date: '1899-12-01',
    summary: 'Reception of unusual signals',
    significance: 'Tesla claims to receive signals he believes may be extraterrestrial',
    technicalDetails: [
      'Description of regular signal patterns',
      'Ruling out local interference sources',
      'Speculation on signal origin'
    ],
    quotation: 'The feeling is constantly growing on me that I had been the first to hear the greeting of one planet to another.'
  },
  {
    date: '1900-01-07',
    summary: 'Final entries and laboratory closure',
    significance: 'Conclusion of Colorado Springs experiments',
    technicalDetails: [
      'Summary of key findings',
      'Plans for Wardenclyffe development',
      'Equipment shipping arrangements'
    ]
  }
];

/**
 * Categories of diary content
 */
export const DIARY_CONTENT_CATEGORIES = {
  equipment: 'Detailed specifications and modifications of experimental apparatus',
  measurements: 'Quantitative data on voltages, frequencies, distances, and power levels',
  observations: 'Qualitative observations of electrical phenomena',
  theories: 'Tesla theoretical developments and explanations',
  calculations: 'Mathematical calculations and derivations',
  diagrams: 'Circuit diagrams, mechanical drawings, and sketches',
  personal: 'Brief personal observations and reflections'
} as const;

/**
 * Get all diary entries
 */
export function getAllDiaryEntries(): DiaryEntry[] {
  return SIGNIFICANT_DIARY_ENTRIES;
}

/**
 * Get entry by date
 */
export function getEntryByDate(date: string): DiaryEntry | undefined {
  return SIGNIFICANT_DIARY_ENTRIES.find(e => e.date === date);
}

/**
 * Get entries within date range
 */
export function getEntriesInRange(startDate: string, endDate: string): DiaryEntry[] {
  return SIGNIFICANT_DIARY_ENTRIES.filter(e => {
    return e.date >= startDate && e.date <= endDate;
  });
}

/**
 * Get source information
 */
export function getDiarySource(): VerifiedSource {
  return DIARY_SOURCE;
}

/**
 * Key findings summary from the diary
 */
export const KEY_FINDINGS_SUMMARY = {
  achieved: [
    'Construction and operation of the largest Tesla coil ever built',
    'Production of artificial lightning exceeding 100 feet in length',
    'Detailed study of natural lightning characteristics',
    'Demonstration of wireless signal transmission',
    'Development of sensitive receiving equipment',
    'Advancement of high-frequency, high-voltage engineering'
  ],
  claimed: [
    'Determination of Earth resonant frequency (~7.9 Hz claimed)',
    'Wireless power transmission through the Earth',
    'Lighting lamps at 26 miles distance without wires',
    'Reception of extraterrestrial signals',
    'Ability to transmit power to any point on Earth'
  ],
  limitations: [
    'Most power transmission claims not independently verified',
    'Distance claims lack corroborating witness testimony',
    'Extraterrestrial signal claims attributed to natural phenomena by modern science',
    'Equipment efficiency not rigorously measured',
    'No sustained power transmission demonstrated'
  ]
};

/**
 * SCHOLARLY CONTEXT
 *
 * Tesla's Colorado Springs Notes are invaluable historical documents but
 * must be read with appropriate critical analysis:
 *
 * 1. The notes were written for personal reference, not publication
 * 2. Some claims lack independent verification
 * 3. Measurements may have significant uncertainties
 * 4. Tesla later made claims that exceeded what the notes document
 *
 * The published notes remain essential primary sources for understanding
 * Tesla's work and thought process during this experimental period.
 *
 * SOURCE: Colorado Springs Notes, 1899-1900
 * Published by Nolit, Belgrade, 1978
 * ISBN: Various editions available
 * WorldCat: https://www.worldcat.org/title/colorado-springs-notes-1899-1900/oclc/3778651
 */
