/**
 * Tesla Radiant Energy Patents
 *
 * This file documents Tesla's patents related to "radiant energy" - his term
 * for various electromagnetic phenomena and energy capture methods.
 *
 * IMPORTANT HISTORICAL CONTEXT:
 * Tesla's "radiant energy" patents are real and verified. However, modern
 * interpretations vary widely. These patents describe real electromagnetic
 * phenomena, not "free energy" in the perpetual motion sense.
 *
 * All patent numbers and URLs link to official Google Patents database.
 *
 * HISTORICAL DOCUMENTATION - These are verified historical records.
 */

import type { TeslaPatent } from '../types.js';

/**
 * Apparatus for the Utilization of Radiant Energy - US685957A
 *
 * Describes a device for capturing energy from radiant sources
 * Filed: March 21, 1901
 * Granted: November 5, 1901
 */
export const US685957A: TeslaPatent = {
  patentNumber: 'US685957A',
  title: 'Apparatus for the Utilization of Radiant Energy',
  filingDate: '1901-03-21',
  grantDate: '1901-11-05',
  googlePatentsUrl: 'https://patents.google.com/patent/US685957A',
  abstract: 'An apparatus for utilizing radiant energy comprising an insulated conducting body positioned to receive rays or radiations, connected to a capacitor and means for utilizing the accumulated energy.',
  keyClaims: [
    'Elevated insulated plate for energy collection',
    'Capacitor storage of collected charge',
    'Circuit for utilizing accumulated energy',
    'Grounding arrangements for operation',
    'Methods for maximizing energy collection'
  ],
  relatedPatents: ['US685958A', 'US577670A'],
  modernRelevance: 'Early concept related to atmospheric electricity collection. Modern solar panels and RF energy harvesting use different principles but share the goal of capturing radiant energy.',
  category: 'radiant-energy'
};

/**
 * Method of Utilizing Radiant Energy - US685958A
 *
 * Companion method patent to the apparatus
 * Filed: March 21, 1901
 * Granted: November 5, 1901
 */
export const US685958A: TeslaPatent = {
  patentNumber: 'US685958A',
  title: 'Method of Utilizing Radiant Energy',
  filingDate: '1901-03-21',
  grantDate: '1901-11-05',
  googlePatentsUrl: 'https://patents.google.com/patent/US685958A',
  abstract: 'A method of utilizing radiant energy consisting in exposing a polished conducting body to radiant energy while insulated and providing a means for collecting and storing the electrical energy.',
  keyClaims: [
    'Method of exposing conductor to radiant energy',
    'Insulation requirements for energy accumulation',
    'Process of energy storage in capacitor',
    'Method of discharging accumulated energy for useful work'
  ],
  relatedPatents: ['US685957A', 'US577670A'],
  modernRelevance: 'Theoretical precursor to concepts in energy harvesting, though modern implementations use semiconductor photovoltaics rather than atmospheric charge collection.',
  category: 'radiant-energy'
};

/**
 * Apparatus for Producing Electric Currents of High Frequency - US577670A
 *
 * Related to high-frequency current generation
 * Filed: March 20, 1896
 * Granted: February 23, 1897
 */
export const US577670A: TeslaPatent = {
  patentNumber: 'US577670A',
  title: 'Apparatus for Producing Electric Currents of High Frequency',
  filingDate: '1896-03-20',
  grantDate: '1897-02-23',
  googlePatentsUrl: 'https://patents.google.com/patent/US577670A',
  abstract: 'An apparatus for producing electric currents of high frequency using a combination of capacitors, inductors, and spark gap switching.',
  keyClaims: [
    'Specific circuit arrangements for high-frequency generation',
    'Spark gap switching methods',
    'Capacitor-inductor resonant combinations',
    'Cooling and safety mechanisms'
  ],
  relatedPatents: ['US685957A', 'US568176A'],
  modernRelevance: 'Foundation for many high-frequency generation techniques used in radio, telecommunications, and power electronics.',
  category: 'radiant-energy'
};

/**
 * Method of and Apparatus for Controlling Mechanism of Moving Vessels - US613809A
 *
 * Radio control patent, related to radiant energy transmission
 * Filed: July 1, 1898
 * Granted: November 8, 1898
 */
export const US613809A: TeslaPatent = {
  patentNumber: 'US613809A',
  title: 'Method of and Apparatus for Controlling Mechanism of Moving Vessels or Vehicles',
  filingDate: '1898-07-01',
  grantDate: '1898-11-08',
  googlePatentsUrl: 'https://patents.google.com/patent/US613809A',
  abstract: 'A method and apparatus for remotely controlling mechanisms using transmitted electromagnetic waves, demonstrated with a radio-controlled boat.',
  keyClaims: [
    'Wireless transmission of control signals',
    'Selective receiver circuits',
    'Multiple command transmission capability',
    'Secure signaling methods'
  ],
  relatedPatents: ['US685012A', 'US645576A'],
  modernRelevance: 'Foundation for all radio-controlled devices, drone technology, and wireless remote control systems.',
  category: 'radiant-energy'
};

/**
 * All radiant energy patents
 */
export const RADIANT_ENERGY_PATENTS: TeslaPatent[] = [
  US685957A,
  US685958A,
  US577670A,
  US613809A
];

/**
 * Get patent by number
 */
export function getRadiantPatentByNumber(patentNumber: string): TeslaPatent | undefined {
  return RADIANT_ENERGY_PATENTS.find(p => p.patentNumber === patentNumber);
}

/**
 * Get all radiant energy patent URLs
 */
export function getRadiantPatentUrls(): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const patent of RADIANT_ENERGY_PATENTS) {
    urls[patent.patentNumber] = patent.googlePatentsUrl;
  }
  return urls;
}

/**
 * IMPORTANT DISCLAIMER - HISTORICAL VS MODERN CLAIMS
 *
 * Tesla's "radiant energy" patents are authentic historical documents describing
 * real electromagnetic phenomena Tesla observed and attempted to harness.
 *
 * WHAT THESE PATENTS ARE:
 * - Documentation of Tesla's experiments with atmospheric electricity
 * - Early concepts for energy harvesting from electromagnetic sources
 * - Foundation for radio control technology
 * - Historical records of Tesla's scientific thinking
 *
 * WHAT THESE PATENTS ARE NOT:
 * - Proof of "free energy" devices
 * - Working plans for perpetual motion machines
 * - Evidence of suppressed technology
 * - Blueprints for over-unity devices
 *
 * Modern energy harvesting (solar panels, RF energy harvesting) works on
 * well-understood physical principles. Claims of "radiant energy" devices
 * producing more energy than input should be evaluated with scientific skepticism.
 */
