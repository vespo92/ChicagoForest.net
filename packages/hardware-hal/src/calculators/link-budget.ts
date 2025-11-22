/**
 * RF Link Budget Calculator
 *
 * Comprehensive link budget calculations for wireless network planning.
 * Implements standard RF propagation models for various scenarios.
 *
 * DISCLAIMER: This is an AI-generated educational framework. Link budget
 * calculations are theoretical estimates. Real-world performance varies
 * due to terrain, weather, interference, and equipment variations.
 *
 * References:
 * - ITU-R P.525: Free Space Propagation
 * - ITU-R P.1411: Urban Propagation
 * - Friis Transmission Equation
 * - LoRa Link Budget Application Notes
 *
 * @module @chicago-forest/hardware-hal/calculators/link-budget
 */

// =============================================================================
// CONSTANTS AND TYPES
// =============================================================================

/**
 * Speed of light in m/s
 */
const SPEED_OF_LIGHT = 299792458;

/**
 * Link budget input parameters
 */
export interface LinkBudgetInput {
  /** Transmit power (dBm) */
  txPowerDbm: number;
  /** Transmit antenna gain (dBi) */
  txAntennaGainDbi: number;
  /** Transmit cable/connector loss (dB) */
  txCableLossDb: number;
  /** Receive antenna gain (dBi) */
  rxAntennaGainDbi: number;
  /** Receive cable/connector loss (dB) */
  rxCableLossDb: number;
  /** Receiver sensitivity (dBm) */
  rxSensitivityDbm: number;
  /** Frequency (MHz) */
  frequencyMhz: number;
  /** Distance (km) */
  distanceKm: number;
  /** Fade margin (dB) - typically 10-20 dB */
  fadeMarginDb: number;
  /** Additional losses (dB) - rain, foliage, etc. */
  additionalLossesDb?: number;
}

/**
 * Link budget result
 */
export interface LinkBudgetResult {
  /** Effective Isotropic Radiated Power (dBm) */
  eirpDbm: number;
  /** Free Space Path Loss (dB) */
  fsplDb: number;
  /** Total path loss with additional factors (dB) */
  totalPathLossDb: number;
  /** Received signal strength (dBm) */
  receivedPowerDbm: number;
  /** Link margin (dB) */
  linkMarginDb: number;
  /** Link viable (margin > fade margin) */
  isViable: boolean;
  /** Reliability estimate (%) */
  reliabilityPercent: number;
  /** Maximum viable distance (km) */
  maxDistanceKm: number;
  /** Detailed breakdown */
  breakdown: {
    txPower: number;
    txAntennaGain: number;
    txCableLoss: number;
    eirp: number;
    fspl: number;
    additionalLosses: number;
    rxAntennaGain: number;
    rxCableLoss: number;
    receivedPower: number;
    sensitivity: number;
    margin: number;
  };
}

// =============================================================================
// FREE SPACE PATH LOSS
// =============================================================================

/**
 * Calculate Free Space Path Loss (FSPL)
 *
 * FSPL = 20*log10(d) + 20*log10(f) + 20*log10(4*pi/c)
 * Simplified: FSPL = 20*log10(d) + 20*log10(f) - 147.55
 * Where d is in km and f is in MHz
 *
 * @param distanceKm Distance in kilometers
 * @param frequencyMhz Frequency in MHz
 * @returns Path loss in dB
 */
export function calculateFSPL(distanceKm: number, frequencyMhz: number): number {
  if (distanceKm <= 0 || frequencyMhz <= 0) {
    throw new Error('Distance and frequency must be positive');
  }

  // FSPL formula with distance in km and frequency in MHz
  const fspl = 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMhz) + 32.44;
  return Math.round(fspl * 100) / 100;
}

/**
 * Calculate maximum distance for given path loss
 */
export function calculateMaxDistanceFromFSPL(
  pathLossDb: number,
  frequencyMhz: number
): number {
  // Rearranged: d = 10^((FSPL - 20*log10(f) - 32.44) / 20)
  const distanceKm = Math.pow(10, (pathLossDb - 20 * Math.log10(frequencyMhz) - 32.44) / 20);
  return Math.round(distanceKm * 100) / 100;
}

// =============================================================================
// PROPAGATION MODELS
// =============================================================================

/**
 * Propagation environment type
 */
export type PropagationEnvironment =
  | 'free-space'
  | 'urban-dense'
  | 'urban'
  | 'suburban'
  | 'rural'
  | 'indoor';

/**
 * Additional path loss beyond free space for different environments
 * These are typical values - actual losses vary significantly
 */
export const ENVIRONMENT_LOSS_FACTORS: Record<PropagationEnvironment, {
  baseExtraLossDb: number;
  lossPerKmDb: number;
  description: string;
}> = {
  'free-space': {
    baseExtraLossDb: 0,
    lossPerKmDb: 0,
    description: 'Clear line of sight, no obstructions',
  },
  'urban-dense': {
    baseExtraLossDb: 20,
    lossPerKmDb: 15,
    description: 'Dense urban with tall buildings, heavy NLOS',
  },
  urban: {
    baseExtraLossDb: 15,
    lossPerKmDb: 10,
    description: 'Urban environment with moderate buildings',
  },
  suburban: {
    baseExtraLossDb: 8,
    lossPerKmDb: 5,
    description: 'Suburban with houses and trees',
  },
  rural: {
    baseExtraLossDb: 3,
    lossPerKmDb: 2,
    description: 'Rural with minimal obstructions',
  },
  indoor: {
    baseExtraLossDb: 25,
    lossPerKmDb: 30,
    description: 'Indoor propagation through walls',
  },
};

/**
 * Calculate environment-adjusted path loss
 */
export function calculateEnvironmentPathLoss(
  distanceKm: number,
  frequencyMhz: number,
  environment: PropagationEnvironment
): number {
  const fspl = calculateFSPL(distanceKm, frequencyMhz);
  const envFactor = ENVIRONMENT_LOSS_FACTORS[environment];
  const extraLoss = envFactor.baseExtraLossDb + envFactor.lossPerKmDb * distanceKm;
  return Math.round((fspl + extraLoss) * 100) / 100;
}

// =============================================================================
// LINK BUDGET CALCULATOR
// =============================================================================

/**
 * Calculate complete link budget
 */
export function calculateLinkBudget(input: LinkBudgetInput): LinkBudgetResult {
  const additionalLosses = input.additionalLossesDb || 0;

  // EIRP = TX Power + TX Antenna Gain - TX Cable Loss
  const eirpDbm = input.txPowerDbm + input.txAntennaGainDbi - input.txCableLossDb;

  // Free Space Path Loss
  const fsplDb = calculateFSPL(input.distanceKm, input.frequencyMhz);

  // Total path loss
  const totalPathLossDb = fsplDb + additionalLosses;

  // Received power = EIRP - Path Loss + RX Antenna Gain - RX Cable Loss
  const receivedPowerDbm =
    eirpDbm - totalPathLossDb + input.rxAntennaGainDbi - input.rxCableLossDb;

  // Link margin = Received Power - Sensitivity
  const linkMarginDb = receivedPowerDbm - input.rxSensitivityDbm;

  // Is link viable?
  const isViable = linkMarginDb >= input.fadeMarginDb;

  // Reliability estimate (rough approximation)
  // More margin = higher reliability
  let reliabilityPercent: number;
  if (linkMarginDb < 0) {
    reliabilityPercent = 0;
  } else if (linkMarginDb < 5) {
    reliabilityPercent = 50 + linkMarginDb * 8;
  } else if (linkMarginDb < 15) {
    reliabilityPercent = 90 + (linkMarginDb - 5) * 0.8;
  } else {
    reliabilityPercent = 99 + Math.min((linkMarginDb - 15) * 0.05, 0.9);
  }
  reliabilityPercent = Math.min(99.9, Math.round(reliabilityPercent * 10) / 10);

  // Calculate maximum viable distance
  const availablePathLoss =
    eirpDbm +
    input.rxAntennaGainDbi -
    input.rxCableLossDb -
    input.rxSensitivityDbm -
    input.fadeMarginDb;
  const maxDistanceKm = calculateMaxDistanceFromFSPL(
    availablePathLoss - additionalLosses,
    input.frequencyMhz
  );

  return {
    eirpDbm: Math.round(eirpDbm * 100) / 100,
    fsplDb,
    totalPathLossDb: Math.round(totalPathLossDb * 100) / 100,
    receivedPowerDbm: Math.round(receivedPowerDbm * 100) / 100,
    linkMarginDb: Math.round(linkMarginDb * 100) / 100,
    isViable,
    reliabilityPercent,
    maxDistanceKm: Math.max(0, Math.round(maxDistanceKm * 100) / 100),
    breakdown: {
      txPower: input.txPowerDbm,
      txAntennaGain: input.txAntennaGainDbi,
      txCableLoss: input.txCableLossDb,
      eirp: Math.round(eirpDbm * 100) / 100,
      fspl: fsplDb,
      additionalLosses,
      rxAntennaGain: input.rxAntennaGainDbi,
      rxCableLoss: input.rxCableLossDb,
      receivedPower: Math.round(receivedPowerDbm * 100) / 100,
      sensitivity: input.rxSensitivityDbm,
      margin: Math.round(linkMarginDb * 100) / 100,
    },
  };
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

/**
 * Common radio preset for quick calculations
 */
export interface RadioPreset {
  name: string;
  txPowerDbm: number;
  sensitivity: number;
  frequencyMhz: number;
  typicalAntennaGain: number;
  description: string;
}

export const RADIO_PRESETS: Record<string, RadioPreset> = {
  lora_915_sf7: {
    name: 'LoRa 915MHz SF7',
    txPowerDbm: 22,
    sensitivity: -123,
    frequencyMhz: 915,
    typicalAntennaGain: 3,
    description: 'LoRa US915 at SF7 (fastest)',
  },
  lora_915_sf10: {
    name: 'LoRa 915MHz SF10',
    txPowerDbm: 22,
    sensitivity: -132,
    frequencyMhz: 915,
    typicalAntennaGain: 3,
    description: 'LoRa US915 at SF10 (longer range)',
  },
  lora_915_sf12: {
    name: 'LoRa 915MHz SF12',
    txPowerDbm: 22,
    sensitivity: -137,
    frequencyMhz: 915,
    typicalAntennaGain: 3,
    description: 'LoRa US915 at SF12 (maximum range)',
  },
  wifi_24_n: {
    name: 'WiFi 2.4GHz 802.11n',
    txPowerDbm: 20,
    sensitivity: -82,
    frequencyMhz: 2437,
    typicalAntennaGain: 5,
    description: 'Standard WiFi N at MCS7',
  },
  wifi_5_ac: {
    name: 'WiFi 5GHz 802.11ac',
    txPowerDbm: 23,
    sensitivity: -77,
    frequencyMhz: 5500,
    typicalAntennaGain: 5,
    description: 'WiFi AC at MCS9',
  },
  ubiquiti_litebeam: {
    name: 'Ubiquiti LiteBeam 5AC',
    txPowerDbm: 25,
    sensitivity: -96,
    frequencyMhz: 5500,
    typicalAntennaGain: 23,
    description: 'LiteBeam 5AC Gen2 PtP',
  },
  ubiquiti_powerbeam: {
    name: 'Ubiquiti PowerBeam 5AC',
    txPowerDbm: 25,
    sensitivity: -96,
    frequencyMhz: 5500,
    typicalAntennaGain: 25,
    description: 'PowerBeam 5AC Gen2 PtP',
  },
  airfiber_60: {
    name: 'Ubiquiti airFiber 60',
    txPowerDbm: 26,
    sensitivity: -70,
    frequencyMhz: 60000,
    typicalAntennaGain: 38,
    description: '60GHz backhaul link',
  },
};

/**
 * Quick link budget with preset
 */
export function quickLinkBudget(
  preset: RadioPreset,
  distanceKm: number,
  options?: {
    txAntennaGain?: number;
    rxAntennaGain?: number;
    cableLoss?: number;
    fadeMargin?: number;
    additionalLosses?: number;
  }
): LinkBudgetResult {
  const txGain = options?.txAntennaGain ?? preset.typicalAntennaGain;
  const rxGain = options?.rxAntennaGain ?? preset.typicalAntennaGain;
  const cableLoss = options?.cableLoss ?? 1;
  const fadeMargin = options?.fadeMargin ?? 15;

  return calculateLinkBudget({
    txPowerDbm: preset.txPowerDbm,
    txAntennaGainDbi: txGain,
    txCableLossDb: cableLoss,
    rxAntennaGainDbi: rxGain,
    rxCableLossDb: cableLoss,
    rxSensitivityDbm: preset.sensitivity,
    frequencyMhz: preset.frequencyMhz,
    distanceKm,
    fadeMarginDb: fadeMargin,
    additionalLossesDb: options?.additionalLosses,
  });
}

// =============================================================================
// FRESNEL ZONE CALCULATIONS
// =============================================================================

/**
 * Calculate Fresnel zone radius at a given point
 *
 * @param distanceKm Total link distance in km
 * @param pointDistanceKm Distance from transmitter to calculation point
 * @param frequencyMhz Frequency in MHz
 * @param zoneNumber Fresnel zone number (1, 2, 3...)
 * @returns Fresnel zone radius in meters
 */
export function calculateFresnelRadius(
  distanceKm: number,
  pointDistanceKm: number,
  frequencyMhz: number,
  zoneNumber: number = 1
): number {
  const wavelength = SPEED_OF_LIGHT / (frequencyMhz * 1e6); // meters
  const d1 = pointDistanceKm * 1000; // meters
  const d2 = (distanceKm - pointDistanceKm) * 1000; // meters

  const radius = Math.sqrt(
    (zoneNumber * wavelength * d1 * d2) / (d1 + d2)
  );

  return Math.round(radius * 100) / 100;
}

/**
 * Calculate required clearance for 60% Fresnel zone
 * 60% clearance is typically required for reliable links
 */
export function calculateRequiredClearance(
  distanceKm: number,
  frequencyMhz: number,
  clearancePercent: number = 60
): {
  maxRadiusM: number;
  requiredClearanceM: number;
  atDistanceKm: number;
} {
  // Maximum radius is at midpoint
  const midpoint = distanceKm / 2;
  const maxRadius = calculateFresnelRadius(distanceKm, midpoint, frequencyMhz);
  const requiredClearance = maxRadius * (clearancePercent / 100);

  return {
    maxRadiusM: maxRadius,
    requiredClearanceM: Math.round(requiredClearance * 100) / 100,
    atDistanceKm: midpoint,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const LINK_BUDGET = {
  presets: RADIO_PRESETS,
  environments: ENVIRONMENT_LOSS_FACTORS,
  calculate: calculateLinkBudget,
  quick: quickLinkBudget,
  fspl: calculateFSPL,
  fresnel: calculateFresnelRadius,
  clearance: calculateRequiredClearance,
  maxDistance: calculateMaxDistanceFromFSPL,
  environmentLoss: calculateEnvironmentPathLoss,
};
