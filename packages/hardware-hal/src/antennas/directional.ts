/**
 * Directional Antenna Specifications
 *
 * Documentation for directional antennas used in point-to-point and
 * point-to-multipoint wireless links. Includes commercial products
 * and specification guidelines.
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications for community network planning.
 *
 * Sources:
 * - L-com: https://www.l-com.com/
 * - KP Performance Antennas: https://www.kpperformance.com/
 * - Ubiquiti Antennas: https://store.ui.com/
 * - RF Elements: https://www.rfelements.com/
 *
 * @module @chicago-forest/hardware-hal/antennas/directional
 */

// =============================================================================
// DIRECTIONAL ANTENNA TYPES
// =============================================================================

/**
 * Directional antenna specification
 */
export interface DirectionalAntennaSpec {
  /** Product name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Product URL */
  productUrl: string;
  /** Antenna type */
  type: DirectionalAntennaType;
  /** Frequency range (MHz) */
  frequencyRange: { min: number; max: number };
  /** Gain (dBi) */
  gain: number;
  /** Half-power beamwidth (degrees) */
  beamwidth: { horizontal: number; vertical: number };
  /** Front-to-back ratio (dB) */
  frontToBackRatio: number;
  /** Polarization */
  polarization: Polarization;
  /** VSWR */
  vswr: number;
  /** Connector type */
  connector: ConnectorType;
  /** Wind survival (km/h) */
  windSurvival: number;
  /** Weight (kg) */
  weight: number;
  /** Dimensions (mm) */
  dimensions: { width: number; height: number; depth: number };
  /** Price (USD) */
  price: number;
  /** Use case description */
  useCase: string;
}

export type DirectionalAntennaType =
  | 'yagi'        // Yagi-Uda
  | 'parabolic'   // Parabolic dish
  | 'panel'       // Flat panel
  | 'sector'      // Sector antenna
  | 'horn'        // Horn antenna
  | 'helix';      // Helical

export type Polarization =
  | 'vertical'
  | 'horizontal'
  | 'dual-linear'     // V+H
  | 'dual-slant'      // +45/-45
  | 'circular-left'
  | 'circular-right';

export type ConnectorType =
  | 'N-Female'
  | 'N-Male'
  | 'SMA-Female'
  | 'SMA-Male'
  | 'RP-SMA'
  | 'RPSMA-Female'
  | 'MMCX'
  | 'U.FL'
  | 'Type-F';

// =============================================================================
// PARABOLIC DISH ANTENNAS
// =============================================================================

/**
 * Ubiquiti RocketDish 5G-30 - High-gain PtP
 * https://store.ui.com/us/en/collections/operator-airmax-702-702/products/rocketdish-5g-30
 */
export const RD_5G30: DirectionalAntennaSpec = {
  name: 'RocketDish 5G-30',
  manufacturer: 'Ubiquiti',
  productUrl: 'https://store.ui.com/us/en/collections/operator-airmax-702-702/products/rocketdish-5g-30',
  type: 'parabolic',
  frequencyRange: { min: 5100, max: 5800 },
  gain: 30,
  beamwidth: { horizontal: 5, vertical: 5 },
  frontToBackRatio: 35,
  polarization: 'dual-linear',
  vswr: 1.4,
  connector: 'N-Female',
  windSurvival: 200,
  weight: 4.3,
  dimensions: { width: 648, height: 648, depth: 368 },
  price: 179,
  useCase: 'Long-range point-to-point backhaul links up to 50+ km',
};

/**
 * Ubiquiti RocketDish LW (Lightweight)
 * https://store.ui.com/us/en/collections/operator-airmax-702-702/products/rd-5g31-ac
 */
export const RD_5G31_AC: DirectionalAntennaSpec = {
  name: 'RocketDish 5G-31 AC',
  manufacturer: 'Ubiquiti',
  productUrl: 'https://store.ui.com/us/en/collections/operator-airmax-702-702/products/rd-5g31-ac',
  type: 'parabolic',
  frequencyRange: { min: 5100, max: 5800 },
  gain: 31,
  beamwidth: { horizontal: 5, vertical: 5 },
  frontToBackRatio: 35,
  polarization: 'dual-linear',
  vswr: 1.5,
  connector: 'N-Female',
  windSurvival: 200,
  weight: 5.5,
  dimensions: { width: 710, height: 710, depth: 400 },
  price: 229,
  useCase: 'Maximum range PtP with airFiber or Rocket radios',
};

/**
 * KP Performance 2ft Parabolic
 * https://www.kpperformance.com/
 */
export const KP_2FT_DISH: DirectionalAntennaSpec = {
  name: 'KP Performance 2ft Parabolic',
  manufacturer: 'KP Performance',
  productUrl: 'https://www.kpperformance.com/collections/5-ghz-point-to-point-antennas',
  type: 'parabolic',
  frequencyRange: { min: 4900, max: 6000 },
  gain: 29,
  beamwidth: { horizontal: 6, vertical: 6 },
  frontToBackRatio: 32,
  polarization: 'dual-slant',
  vswr: 1.5,
  connector: 'N-Female',
  windSurvival: 240,
  weight: 3.2,
  dimensions: { width: 610, height: 610, depth: 350 },
  price: 159,
  useCase: 'Professional-grade PtP antenna for WISP backhaul',
};

// =============================================================================
// SECTOR ANTENNAS
// =============================================================================

/**
 * Ubiquiti airMAX Sector AM-5G20-90
 * https://store.ui.com/us/en/collections/operator-airmax-702-702/products/am-5g20-90
 */
export const AM_5G20_90: DirectionalAntennaSpec = {
  name: 'airMAX Sector 5G-20-90',
  manufacturer: 'Ubiquiti',
  productUrl: 'https://store.ui.com/us/en/collections/operator-airmax-702-702/products/am-5g20-90',
  type: 'sector',
  frequencyRange: { min: 5150, max: 5850 },
  gain: 20,
  beamwidth: { horizontal: 90, vertical: 6 },
  frontToBackRatio: 25,
  polarization: 'dual-slant',
  vswr: 1.5,
  connector: 'N-Female',
  windSurvival: 200,
  weight: 4.0,
  dimensions: { width: 175, height: 700, depth: 70 },
  price: 149,
  useCase: 'Base station PtMP coverage for 90-degree sector',
};

/**
 * RF Elements Sector Horn
 * https://www.rfelements.com/products/carrier-class-horns/
 */
export const RF_SECTOR_HORN_30: DirectionalAntennaSpec = {
  name: 'Sector Horn SH-CC-5-30',
  manufacturer: 'RF Elements',
  productUrl: 'https://www.rfelements.com/products/carrier-class-horns/',
  type: 'horn',
  frequencyRange: { min: 5150, max: 5950 },
  gain: 18,
  beamwidth: { horizontal: 30, vertical: 30 },
  frontToBackRatio: 40,
  polarization: 'dual-slant',
  vswr: 1.4,
  connector: 'N-Female',
  windSurvival: 200,
  weight: 2.3,
  dimensions: { width: 370, height: 370, depth: 210 },
  price: 299,
  useCase: 'High-isolation sector for dense deployments, reduced interference',
};

/**
 * RF Elements Horn TP 60
 * https://www.rfelements.com/
 */
export const RF_HORN_TP_60: DirectionalAntennaSpec = {
  name: 'Asymmetrical Horn TwistPort 60',
  manufacturer: 'RF Elements',
  productUrl: 'https://www.rfelements.com/products/twist-port-adapter/',
  type: 'horn',
  frequencyRange: { min: 5150, max: 5950 },
  gain: 16,
  beamwidth: { horizontal: 60, vertical: 30 },
  frontToBackRatio: 38,
  polarization: 'dual-slant',
  vswr: 1.5,
  connector: 'N-Female',
  windSurvival: 200,
  weight: 1.8,
  dimensions: { width: 280, height: 280, depth: 180 },
  price: 249,
  useCase: 'Asymmetrical coverage for urban PtMP',
};

// =============================================================================
// YAGI ANTENNAS
// =============================================================================

/**
 * L-com 5 GHz 16 dBi Yagi
 * https://www.l-com.com/
 */
export const LCOM_YAGI_16: DirectionalAntennaSpec = {
  name: 'HG5818Y - 5 GHz 16 dBi Yagi',
  manufacturer: 'L-com',
  productUrl: 'https://www.l-com.com/wireless-antenna-5-ghz-16-dbi-yagi-antenna',
  type: 'yagi',
  frequencyRange: { min: 5150, max: 5850 },
  gain: 16,
  beamwidth: { horizontal: 24, vertical: 21 },
  frontToBackRatio: 20,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'N-Female',
  windSurvival: 160,
  weight: 0.5,
  dimensions: { width: 42, height: 580, depth: 42 },
  price: 89,
  useCase: 'Short to medium range PtP, cost-effective directional coverage',
};

/**
 * Yagi for 900 MHz (LoRa/ISM)
 */
export const YAGI_900_14: DirectionalAntennaSpec = {
  name: 'ASPD1351 - 900 MHz 14 dBi Yagi',
  manufacturer: 'L-com',
  productUrl: 'https://www.l-com.com/wireless-antenna-900-mhz-14-dbi-heavy-duty-yagi-antenna',
  type: 'yagi',
  frequencyRange: { min: 890, max: 960 },
  gain: 14,
  beamwidth: { horizontal: 32, vertical: 28 },
  frontToBackRatio: 18,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'N-Female',
  windSurvival: 180,
  weight: 2.0,
  dimensions: { width: 200, height: 1200, depth: 200 },
  price: 149,
  useCase: 'Long-range LoRa/Meshtastic, ISM band IoT',
};

// =============================================================================
// PANEL ANTENNAS
// =============================================================================

/**
 * Ubiquiti UniFi Mesh Antenna
 * https://store.ui.com/us/en/products/uma-d
 */
export const UMA_D: DirectionalAntennaSpec = {
  name: 'UniFi Mesh Antenna',
  manufacturer: 'Ubiquiti',
  productUrl: 'https://store.ui.com/us/en/products/uma-d',
  type: 'panel',
  frequencyRange: { min: 5150, max: 5875 },
  gain: 15,
  beamwidth: { horizontal: 45, vertical: 45 },
  frontToBackRatio: 22,
  polarization: 'dual-slant',
  vswr: 1.5,
  connector: 'N-Female',
  windSurvival: 200,
  weight: 0.8,
  dimensions: { width: 230, height: 230, depth: 60 },
  price: 99,
  useCase: 'UniFi mesh outdoor directional coverage',
};

/**
 * Generic 2.4 GHz Panel
 */
export const PANEL_24_14: DirectionalAntennaSpec = {
  name: 'HG2414P - 2.4 GHz 14 dBi Panel',
  manufacturer: 'L-com',
  productUrl: 'https://www.l-com.com/wireless-antenna-24-ghz-14-dbi-flat-panel-antenna',
  type: 'panel',
  frequencyRange: { min: 2400, max: 2500 },
  gain: 14,
  beamwidth: { horizontal: 30, vertical: 30 },
  frontToBackRatio: 25,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'N-Female',
  windSurvival: 160,
  weight: 0.9,
  dimensions: { width: 250, height: 250, depth: 30 },
  price: 69,
  useCase: 'WiFi client bridge, directional 2.4 GHz coverage',
};

// =============================================================================
// ANTENNA SELECTION HELPERS
// =============================================================================

/**
 * Antenna requirements for a given application
 */
export interface AntennaRequirements {
  /** Frequency band */
  frequency: number; // MHz
  /** Required gain (dBi) */
  minGain: number;
  /** Maximum beamwidth (degrees) */
  maxBeamwidth?: number;
  /** Environment type */
  environment: 'urban' | 'suburban' | 'rural';
  /** Application type */
  application: 'ptp' | 'ptmp-base' | 'ptmp-cpe' | 'mesh-node';
  /** Budget constraint */
  maxBudget?: number;
}

/**
 * Select appropriate directional antenna
 */
export function selectDirectionalAntenna(
  requirements: AntennaRequirements
): DirectionalAntennaSpec[] {
  const allAntennas: DirectionalAntennaSpec[] = [
    RD_5G30,
    RD_5G31_AC,
    KP_2FT_DISH,
    AM_5G20_90,
    RF_SECTOR_HORN_30,
    RF_HORN_TP_60,
    LCOM_YAGI_16,
    YAGI_900_14,
    UMA_D,
    PANEL_24_14,
  ];

  return allAntennas.filter((antenna) => {
    // Check frequency compatibility
    if (
      requirements.frequency < antenna.frequencyRange.min ||
      requirements.frequency > antenna.frequencyRange.max
    ) {
      return false;
    }

    // Check gain requirement
    if (antenna.gain < requirements.minGain) {
      return false;
    }

    // Check beamwidth constraint
    if (requirements.maxBeamwidth) {
      if (antenna.beamwidth.horizontal > requirements.maxBeamwidth) {
        return false;
      }
    }

    // Check budget
    if (requirements.maxBudget && antenna.price > requirements.maxBudget) {
      return false;
    }

    return true;
  });
}

/**
 * Calculate EIRP (Effective Isotropic Radiated Power)
 */
export function calculateEIRP(
  txPowerDbm: number,
  cableLossDb: number,
  antennaGainDbi: number
): number {
  return txPowerDbm - cableLossDb + antennaGainDbi;
}

/**
 * Check FCC EIRP compliance for 5 GHz
 * FCC Part 15.407 limits:
 * - U-NII-1 (5.15-5.25 GHz): 4W EIRP max
 * - U-NII-2 (5.25-5.35 GHz): 1W EIRP max
 * - U-NII-3 (5.725-5.85 GHz): Point-to-Point: 4W + 1dB per 3dB over 6dBi antenna
 */
export function checkEIRPCompliance(
  eirpDbm: number,
  frequency: number,
  isPtP: boolean
): { compliant: boolean; limit: number; message: string } {
  // Convert dBm to Watts: W = 10^((dBm-30)/10)
  const eirpWatts = Math.pow(10, (eirpDbm - 30) / 10);

  let limitWatts: number;
  let message: string;

  if (frequency >= 5150 && frequency <= 5250) {
    // U-NII-1 - Indoor only, 4W EIRP max
    limitWatts = 4;
    message = 'U-NII-1 band (5.15-5.25 GHz): Indoor use only, 4W EIRP max';
  } else if (frequency >= 5250 && frequency <= 5350) {
    // U-NII-2A - DFS required, 1W EIRP max
    limitWatts = 1;
    message = 'U-NII-2A band (5.25-5.35 GHz): DFS required, 1W EIRP max';
  } else if (frequency >= 5470 && frequency <= 5725) {
    // U-NII-2C - DFS required, 1W EIRP max
    limitWatts = 1;
    message = 'U-NII-2C band (5.47-5.725 GHz): DFS required, 1W EIRP max';
  } else if (frequency >= 5725 && frequency <= 5850) {
    // U-NII-3 - Higher power allowed
    if (isPtP) {
      // PtP can go higher with high-gain antennas
      limitWatts = 200; // Effectively no practical limit for licensed links
      message = 'U-NII-3 band (5.725-5.85 GHz): PtP with high-gain antenna allowed';
    } else {
      limitWatts = 4;
      message = 'U-NII-3 band (5.725-5.85 GHz): 4W EIRP max for PtMP';
    }
  } else {
    limitWatts = 1;
    message = 'Frequency not in standard U-NII bands';
  }

  return {
    compliant: eirpWatts <= limitWatts,
    limit: 10 * Math.log10(limitWatts) + 30, // Convert back to dBm
    message,
  };
}

/**
 * Estimate antenna alignment tolerance
 */
export function calculateAlignmentTolerance(
  beamwidth: number,
  maxAcceptableLoss: number = 3 // dB
): {
  tolerance: number;
  recommendation: string;
} {
  // At half-power (beamwidth), loss is 3dB
  // Approximate Gaussian beam pattern
  const tolerance = beamwidth * Math.sqrt(maxAcceptableLoss / 3) / 2;

  let recommendation: string;
  if (tolerance < 1) {
    recommendation = 'Critical alignment required. Use GPS coordinates and professional installation.';
  } else if (tolerance < 3) {
    recommendation = 'Precise alignment needed. Use alignment tools or spectrum analyzer.';
  } else if (tolerance < 5) {
    recommendation = 'Moderate alignment precision. Visual alignment with signal meter sufficient.';
  } else {
    recommendation = 'Forgiving alignment. Manual adjustment with signal feedback works well.';
  }

  return { tolerance: Math.round(tolerance * 10) / 10, recommendation };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const DIRECTIONAL_ANTENNAS = {
  parabolic: { RD_5G30, RD_5G31_AC, KP_2FT_DISH },
  sector: { AM_5G20_90, RF_SECTOR_HORN_30, RF_HORN_TP_60 },
  yagi: { LCOM_YAGI_16, YAGI_900_14 },
  panel: { UMA_D, PANEL_24_14 },
};
