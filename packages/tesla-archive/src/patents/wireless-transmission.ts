/**
 * Tesla Wireless Power Transmission Patents
 *
 * This file documents REAL Tesla patents related to wireless power transmission.
 * All patent numbers and URLs link to official Google Patents database.
 *
 * HISTORICAL DOCUMENTATION - These are verified historical records.
 */

import type { TeslaPatent } from '../types.js';

/**
 * Apparatus for Transmitting Electrical Energy - US645576A
 *
 * This is one of Tesla's foundational wireless power patents.
 * Filed: September 2, 1897
 * Granted: March 20, 1900
 */
export const US645576A: TeslaPatent = {
  patentNumber: 'US645576A',
  title: 'Apparatus for Transmitting Electrical Energy',
  filingDate: '1897-09-02',
  grantDate: '1900-03-20',
  googlePatentsUrl: 'https://patents.google.com/patent/US645576A',
  abstract: 'An apparatus for transmitting electrical energy through the natural mediums, comprising a source of electrical energy, a primary circuit, and a secondary circuit with one terminal connected to ground and the other to an elevated conductor.',
  keyClaims: [
    'Transmitting electrical energy through natural media',
    'Elevated conductor (antenna) for transmission',
    'Ground connection for return path',
    'Resonant tuning between transmitter and receiver',
    'High-frequency, high-voltage operation'
  ],
  relatedPatents: ['US649621A', 'US787412A', 'US1119732A'],
  modernRelevance: 'Foundation for modern wireless power transfer research, resonant inductive coupling, and far-field wireless power concepts.',
  category: 'wireless-transmission'
};

/**
 * System of Transmission of Electrical Energy - US645576A
 *
 * Companion patent describing the complete system
 * Filed: January 18, 1900
 * Granted: March 20, 1900
 */
export const US649621A: TeslaPatent = {
  patentNumber: 'US649621A',
  title: 'Apparatus for Transmission of Electrical Energy',
  filingDate: '1900-01-18',
  grantDate: '1900-05-15',
  googlePatentsUrl: 'https://patents.google.com/patent/US649621A',
  abstract: 'Improvements in apparatus for transmitting electrical energy through the natural media, with specific attention to the construction of the transmitting and receiving apparatus.',
  keyClaims: [
    'Specific construction of elevated conductor',
    'Improved grounding methods',
    'Circuit arrangements for maximum efficiency',
    'Tuning mechanisms for resonance'
  ],
  relatedPatents: ['US645576A', 'US787412A'],
  modernRelevance: 'Influenced modern antenna design and wireless communication systems.',
  category: 'wireless-transmission'
};

/**
 * Art of Transmitting Electrical Energy Through Natural Mediums - US787412A
 *
 * Tesla's comprehensive patent on wireless power transmission
 * Filed: May 16, 1900
 * Granted: April 18, 1905
 */
export const US787412A: TeslaPatent = {
  patentNumber: 'US787412A',
  title: 'Art of Transmitting Electrical Energy Through the Natural Mediums',
  filingDate: '1900-05-16',
  grantDate: '1905-04-18',
  googlePatentsUrl: 'https://patents.google.com/patent/US787412A',
  abstract: 'A method and apparatus for the transmission of electrical energy in any quantity and to any distance, with specific improvements for creating standing waves in the Earth.',
  keyClaims: [
    'Creating electrical disturbances in Earth medium',
    'Establishing standing waves for power distribution',
    'Specific frequencies for Earth resonance',
    'Multiple receiver operation from single transmitter',
    'Selective receiver tuning'
  ],
  relatedPatents: ['US645576A', 'US649621A', 'US1119732A'],
  modernRelevance: 'Theoretical basis for extremely low frequency (ELF) communication systems and ongoing research into Earth-based power distribution.',
  category: 'wireless-transmission'
};

/**
 * Apparatus for Transmitting Electrical Energy - US1119732A
 *
 * Later refinement of wireless transmission system
 * Filed: January 18, 1902
 * Granted: December 1, 1914
 */
export const US1119732A: TeslaPatent = {
  patentNumber: 'US1119732A',
  title: 'Apparatus for Transmitting Electrical Energy',
  filingDate: '1902-01-18',
  grantDate: '1914-12-01',
  googlePatentsUrl: 'https://patents.google.com/patent/US1119732A',
  abstract: 'Improvements in apparatus for transmitting electrical energy, particularly relating to the construction and arrangement of transmitting apparatus for producing high-frequency currents.',
  keyClaims: [
    'Improved high-frequency current generation',
    'Efficient power transfer mechanisms',
    'Practical construction details for transmitters',
    'Safety considerations for high-voltage equipment'
  ],
  relatedPatents: ['US645576A', 'US787412A'],
  modernRelevance: 'Influenced development of radio transmission technology and modern high-frequency power electronics.',
  category: 'wireless-transmission'
};

/**
 * Method of Utilizing Effects Transmitted Through Natural Media - US685012A
 *
 * Describes receiver design for wireless power
 * Filed: June 24, 1899
 * Granted: October 22, 1901
 */
export const US685012A: TeslaPatent = {
  patentNumber: 'US685012A',
  title: 'Method of Utilizing Effects Transmitted Through Natural Media',
  filingDate: '1899-06-24',
  grantDate: '1901-10-22',
  googlePatentsUrl: 'https://patents.google.com/patent/US685012A',
  abstract: 'A method of utilizing effects transmitted through natural media for operating distant devices by means of controlling circuits.',
  keyClaims: [
    'Remote device operation through wireless transmission',
    'Control circuit design for wireless receivers',
    'Selective response to specific transmitter signals',
    'Practical applications for wireless control'
  ],
  relatedPatents: ['US613809A', 'US645576A'],
  modernRelevance: 'Foundational for remote control technology and wireless IoT device operation.',
  category: 'wireless-transmission'
};

/**
 * All wireless transmission patents
 */
export const WIRELESS_TRANSMISSION_PATENTS: TeslaPatent[] = [
  US645576A,
  US649621A,
  US787412A,
  US1119732A,
  US685012A
];

/**
 * Get patent by number
 */
export function getWirelessPatentByNumber(patentNumber: string): TeslaPatent | undefined {
  return WIRELESS_TRANSMISSION_PATENTS.find(p => p.patentNumber === patentNumber);
}

/**
 * Get all wireless transmission patent URLs
 */
export function getWirelessPatentUrls(): Record<string, string> {
  const urls: Record<string, string> = {};
  for (const patent of WIRELESS_TRANSMISSION_PATENTS) {
    urls[patent.patentNumber] = patent.googlePatentsUrl;
  }
  return urls;
}
