/**
 * LoRa Radio Specifications
 *
 * Comprehensive LoRa hardware specifications based on real hardware and
 * LoRa Alliance specifications (https://lora-alliance.org/about-lorawan/).
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications for community mesh network planning.
 *
 * Sources:
 * - LoRa Alliance: https://lora-alliance.org/
 * - Semtech SX1262 Datasheet: https://www.semtech.com/products/wireless-rf/lora-connect/sx1262
 * - Semtech SX1276 Datasheet: https://www.semtech.com/products/wireless-rf/lora-connect/sx1276
 * - US FCC Part 15.247: https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-15
 *
 * @module @chicago-forest/hardware-hal/radios/lora-specs
 */

// =============================================================================
// LORA REGIONAL PARAMETERS (LoRa Alliance RP002-1.0.4)
// =============================================================================

/**
 * LoRa regional frequency plans
 * Based on LoRa Alliance Regional Parameters RP002-1.0.4
 * https://resources.lora-alliance.org/technical-specifications
 */
export interface LoRaRegionalPlan {
  /** Region identifier */
  region: LoRaRegion;
  /** Frequency range start (Hz) */
  frequencyStart: number;
  /** Frequency range end (Hz) */
  frequencyEnd: number;
  /** Available channels */
  channels: LoRaChannel[];
  /** Maximum TX power (dBm) */
  maxTxPower: number;
  /** Duty cycle limit (percentage, 0-100) */
  dutyCycle: number;
  /** Dwell time limit (ms, 0 = no limit) */
  dwellTime: number;
  /** Regulatory body */
  regulatory: string;
}

export type LoRaRegion =
  | 'US915'    // Americas
  | 'EU868'    // Europe
  | 'AU915'    // Australia
  | 'AS923'    // Asia
  | 'KR920'    // Korea
  | 'IN865'    // India
  | 'RU864';   // Russia

export interface LoRaChannel {
  /** Channel number */
  number: number;
  /** Center frequency (Hz) */
  frequency: number;
  /** Bandwidth (Hz) */
  bandwidth: number;
  /** Spreading factors allowed */
  spreadingFactors: number[];
}

/**
 * US915 Regional Plan - Americas ISM Band
 * FCC Part 15.247 compliant
 */
export const US915_PLAN: LoRaRegionalPlan = {
  region: 'US915',
  frequencyStart: 902_000_000,
  frequencyEnd: 928_000_000,
  maxTxPower: 30, // With antenna gain
  dutyCycle: 100, // No duty cycle limit in US
  dwellTime: 400, // 400ms max dwell time
  regulatory: 'FCC Part 15.247',
  channels: [
    // Upstream 125kHz channels (64 channels, 200kHz spacing)
    ...Array.from({ length: 64 }, (_, i) => ({
      number: i,
      frequency: 902_300_000 + i * 200_000,
      bandwidth: 125_000,
      spreadingFactors: [7, 8, 9, 10],
    })),
    // Upstream 500kHz channels (8 channels)
    ...Array.from({ length: 8 }, (_, i) => ({
      number: 64 + i,
      frequency: 903_000_000 + i * 1_600_000,
      bandwidth: 500_000,
      spreadingFactors: [8],
    })),
  ],
};

/**
 * EU868 Regional Plan - Europe ISM Band
 * ETSI EN 300 220 compliant
 */
export const EU868_PLAN: LoRaRegionalPlan = {
  region: 'EU868',
  frequencyStart: 863_000_000,
  frequencyEnd: 870_000_000,
  maxTxPower: 16, // 14 dBm ERP + 2 dBi antenna
  dutyCycle: 1, // 1% duty cycle in most sub-bands
  dwellTime: 0, // No dwell time limit
  regulatory: 'ETSI EN 300 220',
  channels: [
    { number: 0, frequency: 868_100_000, bandwidth: 125_000, spreadingFactors: [7, 8, 9, 10, 11, 12] },
    { number: 1, frequency: 868_300_000, bandwidth: 125_000, spreadingFactors: [7, 8, 9, 10, 11, 12] },
    { number: 2, frequency: 868_500_000, bandwidth: 125_000, spreadingFactors: [7, 8, 9, 10, 11, 12] },
    { number: 3, frequency: 867_100_000, bandwidth: 125_000, spreadingFactors: [7, 8, 9, 10, 11, 12] },
    { number: 4, frequency: 867_300_000, bandwidth: 125_000, spreadingFactors: [7, 8, 9, 10, 11, 12] },
    { number: 5, frequency: 867_500_000, bandwidth: 125_000, spreadingFactors: [7, 8, 9, 10, 11, 12] },
    { number: 6, frequency: 867_700_000, bandwidth: 125_000, spreadingFactors: [7, 8, 9, 10, 11, 12] },
    { number: 7, frequency: 867_900_000, bandwidth: 125_000, spreadingFactors: [7, 8, 9, 10, 11, 12] },
  ],
};

// =============================================================================
// SEMTECH CHIP SPECIFICATIONS
// =============================================================================

/**
 * LoRa transceiver chip specifications
 */
export interface LoRaChipSpec {
  /** Chip model */
  model: string;
  /** Manufacturer */
  manufacturer: 'Semtech';
  /** Product page URL */
  productUrl: string;
  /** Frequency range (Hz) */
  frequencyRange: { min: number; max: number };
  /** Maximum TX power (dBm) */
  maxTxPower: number;
  /** Sensitivity (dBm) at SF12 BW125 */
  sensitivity: number;
  /** Supported spreading factors */
  spreadingFactors: number[];
  /** Supported bandwidths (Hz) */
  bandwidths: number[];
  /** Supply voltage range (V) */
  supplyVoltage: { min: number; max: number };
  /** TX current draw (mA) at max power */
  txCurrentMax: number;
  /** RX current draw (mA) */
  rxCurrent: number;
  /** Sleep current (uA) */
  sleepCurrent: number;
  /** FSK support */
  fskSupport: boolean;
  /** TCXO support */
  tcxoSupport: boolean;
}

/**
 * Semtech SX1262 - Latest generation, best performance
 * https://www.semtech.com/products/wireless-rf/lora-connect/sx1262
 */
export const SX1262_SPEC: LoRaChipSpec = {
  model: 'SX1262',
  manufacturer: 'Semtech',
  productUrl: 'https://www.semtech.com/products/wireless-rf/lora-connect/sx1262',
  frequencyRange: { min: 150_000_000, max: 960_000_000 },
  maxTxPower: 22,
  sensitivity: -148, // dBm at SF12 BW125
  spreadingFactors: [5, 6, 7, 8, 9, 10, 11, 12],
  bandwidths: [7_800, 10_400, 15_600, 20_800, 31_250, 41_700, 62_500, 125_000, 250_000, 500_000],
  supplyVoltage: { min: 1.8, max: 3.7 },
  txCurrentMax: 118, // mA at +22dBm
  rxCurrent: 4.6,
  sleepCurrent: 0.16, // 160nA
  fskSupport: true,
  tcxoSupport: true,
};

/**
 * Semtech SX1276 - Previous generation, widely deployed
 * https://www.semtech.com/products/wireless-rf/lora-connect/sx1276
 */
export const SX1276_SPEC: LoRaChipSpec = {
  model: 'SX1276',
  manufacturer: 'Semtech',
  productUrl: 'https://www.semtech.com/products/wireless-rf/lora-connect/sx1276',
  frequencyRange: { min: 137_000_000, max: 1020_000_000 },
  maxTxPower: 20,
  sensitivity: -148, // dBm at SF12 BW125
  spreadingFactors: [6, 7, 8, 9, 10, 11, 12],
  bandwidths: [7_800, 10_400, 15_600, 20_800, 31_250, 41_700, 62_500, 125_000, 250_000, 500_000],
  supplyVoltage: { min: 1.8, max: 3.7 },
  txCurrentMax: 120, // mA at +20dBm
  rxCurrent: 10.3,
  sleepCurrent: 0.2, // 200nA
  fskSupport: true,
  tcxoSupport: false,
};

/**
 * Semtech SX1278 - 433MHz optimized variant
 */
export const SX1278_SPEC: LoRaChipSpec = {
  model: 'SX1278',
  manufacturer: 'Semtech',
  productUrl: 'https://www.semtech.com/products/wireless-rf/lora-connect/sx1278',
  frequencyRange: { min: 137_000_000, max: 525_000_000 },
  maxTxPower: 20,
  sensitivity: -148,
  spreadingFactors: [6, 7, 8, 9, 10, 11, 12],
  bandwidths: [7_800, 10_400, 15_600, 20_800, 31_250, 41_700, 62_500, 125_000, 250_000, 500_000],
  supplyVoltage: { min: 1.8, max: 3.7 },
  txCurrentMax: 120,
  rxCurrent: 10.3,
  sleepCurrent: 0.2,
  fskSupport: true,
  tcxoSupport: false,
};

// =============================================================================
// LORA MODULE SPECIFICATIONS (Commercial Products)
// =============================================================================

/**
 * Complete LoRa module specification
 */
export interface LoRaModuleSpec {
  /** Module name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Product URL */
  productUrl: string;
  /** Datasheet URL */
  datasheetUrl: string;
  /** Base chip */
  chip: 'SX1262' | 'SX1276' | 'SX1278' | 'SX1261';
  /** Frequency variants */
  frequencyVariants: string[];
  /** Module dimensions (mm) */
  dimensions: { width: number; height: number; depth: number };
  /** Antenna connector type */
  antennaConnector: 'U.FL' | 'SMA' | 'Integrated' | 'Pin';
  /** Interface type */
  interface: 'SPI' | 'UART' | 'I2C';
  /** Price range (USD) */
  priceRange: { min: number; max: number };
  /** Certifications */
  certifications: string[];
  /** Notes */
  notes: string;
}

/**
 * RAK Wireless RAK4631 - nRF52840 + SX1262
 * https://store.rakwireless.com/products/rak4631-lpwan-node
 */
export const RAK4631_SPEC: LoRaModuleSpec = {
  name: 'RAK4631',
  manufacturer: 'RAK Wireless',
  productUrl: 'https://store.rakwireless.com/products/rak4631-lpwan-node',
  datasheetUrl: 'https://docs.rakwireless.com/Product-Categories/WisBlock/RAK4631/Datasheet/',
  chip: 'SX1262',
  frequencyVariants: ['US915', 'EU868', 'AU915', 'AS923'],
  dimensions: { width: 20, height: 30, depth: 3 },
  antennaConnector: 'U.FL',
  interface: 'SPI',
  priceRange: { min: 15, max: 25 },
  certifications: ['FCC', 'CE', 'TELEC', 'KC'],
  notes: 'Integrated nRF52840 BLE + LoRa. WisBlock ecosystem compatible.',
};

/**
 * LILYGO TTGO T-Beam
 * https://lilygo.cc/products/t-beam-v1-1-esp32-lora-gps-neo-6m
 */
export const TBEAM_SPEC: LoRaModuleSpec = {
  name: 'TTGO T-Beam',
  manufacturer: 'LILYGO',
  productUrl: 'https://lilygo.cc/products/t-beam-v1-1-esp32-lora-gps-neo-6m',
  datasheetUrl: 'https://github.com/LilyGO/TTGO-T-Beam',
  chip: 'SX1262',
  frequencyVariants: ['US915', 'EU868'],
  dimensions: { width: 30, height: 100, depth: 15 },
  antennaConnector: 'SMA',
  interface: 'SPI',
  priceRange: { min: 25, max: 45 },
  certifications: ['FCC'],
  notes: 'ESP32 + GPS + LoRa. Popular for Meshtastic. 18650 battery holder.',
};

/**
 * Heltec WiFi LoRa 32 V3
 * https://heltec.org/project/wifi-lora-32-v3/
 */
export const HELTEC_V3_SPEC: LoRaModuleSpec = {
  name: 'WiFi LoRa 32 V3',
  manufacturer: 'Heltec',
  productUrl: 'https://heltec.org/project/wifi-lora-32-v3/',
  datasheetUrl: 'https://resource.heltec.cn/download/WiFi_LoRa32_V3/HTIT-WB32LA(F)_V3_Schematic_Diagram.pdf',
  chip: 'SX1262',
  frequencyVariants: ['US915', 'EU868', 'AU915', 'AS923'],
  dimensions: { width: 25, height: 50, depth: 10 },
  antennaConnector: 'U.FL',
  interface: 'SPI',
  priceRange: { min: 18, max: 30 },
  certifications: ['FCC', 'CE'],
  notes: 'ESP32-S3 + OLED display + LoRa. Low power consumption.',
};

/**
 * Ebyte E22-900T30S - High power module
 * https://www.ebyte.com/en/product-view-news.aspx?id=437
 */
export const E22_900T30S_SPEC: LoRaModuleSpec = {
  name: 'E22-900T30S',
  manufacturer: 'Ebyte',
  productUrl: 'https://www.ebyte.com/en/product-view-news.aspx?id=437',
  datasheetUrl: 'https://www.ebyte.com/en/pdf-down.aspx?id=1437',
  chip: 'SX1262',
  frequencyVariants: ['US915'],
  dimensions: { width: 24, height: 40, depth: 4 },
  antennaConnector: 'SMA',
  interface: 'UART',
  priceRange: { min: 12, max: 20 },
  certifications: ['FCC'],
  notes: '30dBm (1W) output power. Simple UART interface. Good for long range.',
};

// =============================================================================
// LORA DATA RATES AND AIRTIME
// =============================================================================

/**
 * LoRa data rate configuration
 */
export interface LoRaDataRate {
  /** Data rate index (DR0-DR15) */
  drIndex: number;
  /** Spreading factor */
  spreadingFactor: number;
  /** Bandwidth (Hz) */
  bandwidth: number;
  /** Bit rate (bits/second) */
  bitRate: number;
  /** Max payload size (bytes) */
  maxPayload: number;
  /** Sensitivity (dBm) */
  sensitivity: number;
  /** Link budget advantage over DR5 (dB) */
  linkBudgetAdvantage: number;
}

/**
 * US915 Data Rates (LoRa Alliance specification)
 */
export const US915_DATA_RATES: LoRaDataRate[] = [
  { drIndex: 0, spreadingFactor: 10, bandwidth: 125_000, bitRate: 980, maxPayload: 19, sensitivity: -132, linkBudgetAdvantage: 7.5 },
  { drIndex: 1, spreadingFactor: 9, bandwidth: 125_000, bitRate: 1760, maxPayload: 61, sensitivity: -129, linkBudgetAdvantage: 5 },
  { drIndex: 2, spreadingFactor: 8, bandwidth: 125_000, bitRate: 3125, maxPayload: 133, sensitivity: -126, linkBudgetAdvantage: 2.5 },
  { drIndex: 3, spreadingFactor: 7, bandwidth: 125_000, bitRate: 5470, maxPayload: 250, sensitivity: -123, linkBudgetAdvantage: 0 },
  { drIndex: 4, spreadingFactor: 8, bandwidth: 500_000, bitRate: 12500, maxPayload: 250, sensitivity: -120, linkBudgetAdvantage: -3 },
];

/**
 * Calculate LoRa airtime for a packet
 */
export function calculateLoRaAirtime(
  payloadBytes: number,
  spreadingFactor: number,
  bandwidth: number,
  codingRate: number = 5, // 4/5
  preambleSymbols: number = 8,
  explicitHeader: boolean = true,
  crcEnabled: boolean = true,
  lowDataRateOptimize: boolean = false
): number {
  // Symbol duration
  const ts = (2 ** spreadingFactor) / bandwidth * 1000; // ms

  // Preamble duration
  const tPreamble = (preambleSymbols + 4.25) * ts;

  // Payload symbols calculation
  const de = lowDataRateOptimize ? 1 : 0;
  const h = explicitHeader ? 0 : 1;
  const crc = crcEnabled ? 16 : 0;

  const payloadBits = 8 * payloadBytes + crc;
  const numerator = 8 * payloadBytes - 4 * spreadingFactor + 28 + crc - 20 * h;
  const denominator = 4 * (spreadingFactor - 2 * de);
  const payloadSymbols = 8 + Math.max(Math.ceil(numerator / denominator) * (codingRate), 0);

  // Total airtime
  return tPreamble + payloadSymbols * ts;
}

/**
 * Estimate LoRa range based on parameters
 * Returns estimated range in km for different environments
 */
export function estimateLoRaRange(
  txPowerDbm: number,
  antennaGainDbi: number,
  spreadingFactor: number,
  bandwidth: number
): { urban: number; suburban: number; rural: number; los: number } {
  // Calculate link budget
  const sensitivity = -137 + 10 * Math.log10(bandwidth / 125_000) - 2.5 * (spreadingFactor - 7);
  const linkBudget = txPowerDbm + antennaGainDbi - sensitivity;

  // Path loss model estimates (simplified Okumura-Hata)
  // These are rough estimates and actual range varies significantly
  const urbanRange = Math.pow(10, (linkBudget - 69.55 - 26.16 * Math.log10(915)) / 35.22);
  const suburbanRange = urbanRange * 1.8;
  const ruralRange = urbanRange * 3.5;
  const losRange = urbanRange * 8; // Line of sight

  return {
    urban: Math.round(urbanRange * 100) / 100,
    suburban: Math.round(suburbanRange * 100) / 100,
    rural: Math.round(ruralRange * 100) / 100,
    los: Math.round(losRange * 100) / 100,
  };
}

// =============================================================================
// MESHTASTIC COMPATIBILITY
// =============================================================================

/**
 * Meshtastic channel presets
 * https://meshtastic.org/docs/configuration/radio/lora/
 */
export interface MeshtasticPreset {
  name: string;
  spreadingFactor: number;
  bandwidth: number;
  codingRate: number;
  txPower: number;
  description: string;
}

export const MESHTASTIC_PRESETS: Record<string, MeshtasticPreset> = {
  SHORT_FAST: {
    name: 'Short/Fast',
    spreadingFactor: 7,
    bandwidth: 250_000,
    codingRate: 5,
    txPower: 22,
    description: 'Fastest speed, shortest range. Good for dense urban areas.',
  },
  SHORT_SLOW: {
    name: 'Short/Slow',
    spreadingFactor: 8,
    bandwidth: 250_000,
    codingRate: 5,
    txPower: 22,
    description: 'Fast with slightly better range than Short/Fast.',
  },
  MEDIUM_FAST: {
    name: 'Medium/Fast',
    spreadingFactor: 9,
    bandwidth: 250_000,
    codingRate: 5,
    txPower: 22,
    description: 'Balanced option for suburban environments.',
  },
  MEDIUM_SLOW: {
    name: 'Medium/Slow',
    spreadingFactor: 10,
    bandwidth: 250_000,
    codingRate: 5,
    txPower: 22,
    description: 'Good range with reasonable speed.',
  },
  LONG_FAST: {
    name: 'Long/Fast',
    spreadingFactor: 11,
    bandwidth: 250_000,
    codingRate: 5,
    txPower: 22,
    description: 'Long range with decent throughput. Default preset.',
  },
  LONG_MODERATE: {
    name: 'Long/Moderate',
    spreadingFactor: 11,
    bandwidth: 125_000,
    codingRate: 8,
    txPower: 22,
    description: 'Extended range, slower but more reliable.',
  },
  LONG_SLOW: {
    name: 'Long/Slow',
    spreadingFactor: 12,
    bandwidth: 125_000,
    codingRate: 8,
    txPower: 22,
    description: 'Maximum range, slowest speed. Rural/mountain terrain.',
  },
  VERY_LONG_SLOW: {
    name: 'Very Long/Slow',
    spreadingFactor: 12,
    bandwidth: 62_500,
    codingRate: 8,
    txPower: 22,
    description: 'Extreme range for very sparse networks.',
  },
};

// =============================================================================
// EXPORTS
// =============================================================================

export const LORA_SPECS = {
  regions: { US915: US915_PLAN, EU868: EU868_PLAN },
  chips: { SX1262: SX1262_SPEC, SX1276: SX1276_SPEC, SX1278: SX1278_SPEC },
  modules: {
    RAK4631: RAK4631_SPEC,
    TBEAM: TBEAM_SPEC,
    HELTEC_V3: HELTEC_V3_SPEC,
    E22_900T30S: E22_900T30S_SPEC,
  },
  dataRates: { US915: US915_DATA_RATES },
  meshtasticPresets: MESHTASTIC_PRESETS,
};
