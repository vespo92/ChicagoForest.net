/**
 * Colorado Springs Experiments (1899-1900)
 *
 * Historical documentation of Tesla's experimental work at Colorado Springs.
 * This was Tesla's most intensive period of wireless power research.
 *
 * Location: Colorado Springs, Colorado, USA
 * Period: May 1899 - January 1900
 *
 * HISTORICAL DOCUMENTATION - Based on verified historical records,
 * including Tesla's own laboratory notes.
 */

import type { ExperimentRecord, VerifiedSource, FacilitySpec } from '../types.js';

/**
 * Verified sources for Colorado Springs experiments
 */
export const COLORADO_SPRINGS_SOURCES: VerifiedSource[] = [
  {
    id: 'colorado-springs-notes-book',
    type: 'book',
    title: 'Colorado Springs Notes, 1899-1900',
    author: 'Nikola Tesla',
    date: '1978 (original notes 1899-1900)',
    url: 'https://www.worldcat.org/title/colorado-springs-notes-1899-1900/oclc/3778651',
    archive: 'WorldCat / Nolit Belgrade',
    description: 'Published collection of Tesla daily laboratory notes from Colorado Springs experiments',
    verified: true,
    lastVerified: '2024-01-15'
  },
  {
    id: 'tesla-museum-colorado',
    type: 'archive',
    title: 'Nikola Tesla Museum - Colorado Springs Collection',
    author: 'Nikola Tesla Museum Belgrade',
    date: 'Ongoing',
    url: 'https://tesla-museum.org/',
    archive: 'Nikola Tesla Museum',
    description: 'Original documents and photographs from Colorado Springs period',
    verified: true,
    lastVerified: '2024-01-15'
  },
  {
    id: 'century-magazine-1900',
    type: 'article',
    title: 'The Problem of Increasing Human Energy',
    author: 'Nikola Tesla',
    date: '1900-06',
    url: 'https://teslauniverse.com/nikola-tesla/articles/problem-increasing-human-energy',
    archive: 'Tesla Universe',
    description: 'Tesla own account of Colorado Springs experiments published in Century Magazine',
    verified: true,
    lastVerified: '2024-01-15'
  }
];

/**
 * Colorado Springs Laboratory Specifications
 */
export const COLORADO_SPRINGS_FACILITY: FacilitySpec = {
  name: 'Tesla Experimental Station',
  location: 'East Pikes Peak Avenue, Colorado Springs, Colorado, USA',
  operationalPeriod: 'May 1899 - January 1900 (approximately 8 months)',
  specifications: {
    // Building
    buildingType: 'Wooden barn-like structure',
    buildingSize: 'Approximately 100 x 100 feet (30 x 30 meters)',
    roofFeature: 'Retractable roof section for tower extension',

    // Tower/Mast
    mastHeight: '80 feet (24 meters) wooden mast',
    mastTopFeature: 'Copper sphere 3 feet (0.9 meters) diameter',
    mastExtension: '142-foot (43 meter) metal rod extending from sphere',

    // Primary equipment
    magnifyingTransmitter: 'Largest Tesla coil ever built at that time',
    primaryCoilDiameter: '51 feet (15.5 meters)',
    secondaryCoilSpecifications: 'Multiple configurations tested',

    // Power source
    powerSource: 'Colorado Springs Electric Company',
    powerCapacity: '300 kilowatts available',
    voltageInput: 'Stepped up from utility supply',

    // Location advantages
    altitude: '6,035 feet (1,839 meters) above sea level',
    atmosphericConditions: 'Dry air, frequent thunderstorms for study',
    isolation: 'Remote location for high-voltage safety'
  },
  purpose: 'Tesla primary objectives were: (1) Study natural lightning and electrical phenomena, (2) Develop and test the magnifying transmitter, (3) Investigate wireless power transmission through the Earth, (4) Study resonance effects in electrical systems.',
  historicalSignificance: 'The Colorado Springs experiments represent Tesla most intensive period of wireless power research. He developed the largest Tesla coil ever built and conducted experiments that informed his later Wardenclyffe project.',
  currentStatus: 'The original laboratory was demolished after Tesla departure. A historical marker exists at the site. Original equipment was shipped to New York.',
  sources: COLORADO_SPRINGS_SOURCES
};

/**
 * Documented experiments at Colorado Springs
 *
 * Based on Tesla's published notes and contemporary accounts.
 * Note: Some claimed results remain scientifically disputed.
 */
export const DOCUMENTED_EXPERIMENTS: ExperimentRecord[] = [
  {
    id: 'magnifying-transmitter-tests',
    location: 'colorado-springs',
    date: 'June-August 1899',
    description: 'Construction and testing of the largest Tesla coil ever built, capable of producing millions of volts.',
    results: 'Tesla reported producing artificial lightning discharges of up to 135 feet (41 meters). The experiments occasionally knocked out the local power station.',
    witnesses: ['Fritz Lowenstein (assistant)', 'Kolman Czito (assistant)'],
    sources: COLORADO_SPRINGS_SOURCES,
    independentlyVerified: false
  },
  {
    id: 'earth-resonance-experiments',
    location: 'colorado-springs',
    date: 'July-September 1899',
    description: 'Experiments to determine electrical resonance properties of the Earth for wireless transmission.',
    results: 'Tesla claimed to have determined the Earth resonant frequency and successfully transmitted electrical energy through the ground. He reported lighting lamps at distances of up to 26 miles (42 km) without wires.',
    witnesses: ['Fritz Lowenstein (assistant)'],
    sources: COLORADO_SPRINGS_SOURCES,
    independentlyVerified: false
  },
  {
    id: 'lightning-study',
    location: 'colorado-springs',
    date: 'Summer 1899',
    description: 'Study of natural lightning using receivers and recording equipment to understand atmospheric electricity.',
    results: 'Tesla made detailed observations of lightning characteristics and claimed to have developed methods for predicting and potentially controlling lightning paths.',
    witnesses: ['Fritz Lowenstein (assistant)', 'Kolman Czito (assistant)'],
    sources: COLORADO_SPRINGS_SOURCES,
    independentlyVerified: true // General lightning observations verified, control claims not verified
  },
  {
    id: 'wireless-telegraphy-tests',
    location: 'colorado-springs',
    date: 'Fall 1899',
    description: 'Experiments in transmitting messages without wires using high-frequency equipment.',
    results: 'Tesla demonstrated wireless message transmission within the local area, predating Marconi transatlantic transmission.',
    witnesses: ['Local observers'],
    sources: COLORADO_SPRINGS_SOURCES,
    independentlyVerified: true // Wireless telegraphy confirmed; specific range claims vary
  },
  {
    id: 'extraterrestrial-signals-claim',
    location: 'colorado-springs',
    date: 'December 1899',
    description: 'Tesla claimed to have received signals he believed were of extraterrestrial origin while operating his receiver.',
    results: 'Tesla reported receiving regular signals he attributed to intelligent beings on Mars or Venus. Modern analysis suggests these were likely natural radio emissions or interference.',
    witnesses: ['None documented'],
    sources: COLORADO_SPRINGS_SOURCES,
    independentlyVerified: false // Generally attributed to natural phenomena or equipment artifacts
  }
];

/**
 * Get experiment by ID
 */
export function getExperimentById(id: string): ExperimentRecord | undefined {
  return DOCUMENTED_EXPERIMENTS.find(e => e.id === id);
}

/**
 * Get all Colorado Springs experiments
 */
export function getAllExperiments(): ExperimentRecord[] {
  return DOCUMENTED_EXPERIMENTS;
}

/**
 * Get only independently verified experiments
 */
export function getVerifiedExperiments(): ExperimentRecord[] {
  return DOCUMENTED_EXPERIMENTS.filter(e => e.independentlyVerified);
}

/**
 * Get facility specifications
 */
export function getFacilitySpecs(): FacilitySpec {
  return COLORADO_SPRINGS_FACILITY;
}

/**
 * IMPORTANT SCIENTIFIC CONTEXT
 *
 * Tesla's Colorado Springs experiments are historically significant but
 * scientifically controversial:
 *
 * VERIFIED ACHIEVEMENTS:
 * - Constructed the largest Tesla coil of its time
 * - Produced artificial lightning of significant magnitude
 * - Advanced understanding of high-frequency, high-voltage phenomena
 * - Demonstrated wireless electrical transmission over short distances
 *
 * DISPUTED CLAIMS:
 * - Long-distance wireless power transmission efficiency
 * - Earth resonance properties as described by Tesla
 * - Ability to transmit useful power without wires at long distances
 * - Extraterrestrial signal reception
 *
 * Modern physics understands the limitations of wireless power transmission
 * through air and ground. While Tesla's experiments were groundbreaking for
 * their time, his claims of global wireless power distribution remain
 * physically impractical due to inverse-square law energy dissipation.
 */
