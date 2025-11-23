/**
 * Omnidirectional Antenna Specifications
 *
 * Documentation for omnidirectional antennas providing 360-degree coverage
 * for mesh networks, base stations, and mobile applications.
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications for community network planning.
 *
 * Sources:
 * - L-com: https://www.l-com.com/
 * - Taoglas: https://www.taoglas.com/
 * - Laird Connectivity: https://www.lairdconnect.com/
 * - Mobile Mark: https://www.mobilemark.com/
 *
 * @module @chicago-forest/hardware-hal/antennas/omnidirectional
 */

import type { ConnectorType, Polarization } from './directional';

// =============================================================================
// OMNIDIRECTIONAL ANTENNA TYPES
// =============================================================================

/**
 * Omnidirectional antenna specification
 */
export interface OmniAntennaSpec {
  /** Product name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Product URL */
  productUrl: string;
  /** Antenna type */
  type: OmniAntennaType;
  /** Frequency range (MHz) */
  frequencyRange: { min: number; max: number };
  /** Gain (dBi) */
  gain: number;
  /** Vertical beamwidth (degrees) - horizontal is 360 */
  verticalBeamwidth: number;
  /** Polarization */
  polarization: Polarization;
  /** VSWR */
  vswr: number;
  /** Connector type */
  connector: ConnectorType;
  /** Height (mm) */
  height: number;
  /** Diameter (mm) */
  diameter: number;
  /** Weight (kg) */
  weight: number;
  /** Wind survival (km/h) */
  windSurvival: number;
  /** Mounting type */
  mounting: MountingType;
  /** Weather rating */
  weatherRating?: string;
  /** Price (USD) */
  price: number;
  /** Use case */
  useCase: string;
}

export type OmniAntennaType =
  | 'collinear'     // Collinear array
  | 'dipole'        // Half-wave dipole
  | 'ground-plane'  // Ground plane antenna
  | 'sleeve'        // Sleeve dipole
  | 'rubber-duck'   // Rubber duck (handheld)
  | 'whip';         // Whip antenna

export type MountingType =
  | 'mast-mount'
  | 'pole-mount'
  | 'wall-mount'
  | 'magnetic'
  | 'screw-mount'
  | 'pigtail';

// =============================================================================
// WIFI OMNIDIRECTIONAL ANTENNAS
// =============================================================================

/**
 * Ubiquiti AMO-5G13 - High-gain 5 GHz Omni
 * https://store.ui.com/us/en/collections/operator-airmax-702-702/products/amo-5g13
 */
export const AMO_5G13: OmniAntennaSpec = {
  name: 'airMAX Omni 5G-13',
  manufacturer: 'Ubiquiti',
  productUrl: 'https://store.ui.com/us/en/collections/operator-airmax-702-702/products/amo-5g13',
  type: 'collinear',
  frequencyRange: { min: 5150, max: 5850 },
  gain: 13,
  verticalBeamwidth: 7,
  polarization: 'dual-linear',
  vswr: 1.5,
  connector: 'N-Female',
  height: 940,
  diameter: 56,
  weight: 2.1,
  windSurvival: 200,
  mounting: 'mast-mount',
  weatherRating: 'IP65',
  price: 149,
  useCase: 'WISP base station, marina, campground coverage',
};

/**
 * L-com 5 GHz 12 dBi Omni
 * https://www.l-com.com/
 */
export const HG5812U_PRO: OmniAntennaSpec = {
  name: 'HG5812U-PRO - 5 GHz 12 dBi Omni',
  manufacturer: 'L-com',
  productUrl: 'https://www.l-com.com/wireless-antenna-5-ghz-12-dbi-omni-antenna',
  type: 'collinear',
  frequencyRange: { min: 5150, max: 5850 },
  gain: 12,
  verticalBeamwidth: 8,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'N-Female',
  height: 860,
  diameter: 40,
  weight: 1.2,
  windSurvival: 160,
  mounting: 'mast-mount',
  weatherRating: 'IP67',
  price: 99,
  useCase: 'General outdoor WiFi coverage, mesh network hub',
};

/**
 * 2.4 GHz High-Gain Omni
 */
export const HG2415U_PRO: OmniAntennaSpec = {
  name: 'HG2415U-PRO - 2.4 GHz 15 dBi Omni',
  manufacturer: 'L-com',
  productUrl: 'https://www.l-com.com/wireless-antenna-24-ghz-15-dbi-omni-antenna',
  type: 'collinear',
  frequencyRange: { min: 2400, max: 2500 },
  gain: 15,
  verticalBeamwidth: 6,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'N-Female',
  height: 1200,
  diameter: 45,
  weight: 1.8,
  windSurvival: 160,
  mounting: 'mast-mount',
  weatherRating: 'IP67',
  price: 129,
  useCase: 'Wide-area 2.4 GHz coverage, legacy device support',
};

/**
 * Dual-band WiFi Omni
 */
export const DUAL_BAND_OMNI: OmniAntennaSpec = {
  name: 'HG2458-08U - Dual-Band 8 dBi Omni',
  manufacturer: 'L-com',
  productUrl: 'https://www.l-com.com/wireless-antenna-dual-band-24-58-ghz-8-dbi-omni',
  type: 'collinear',
  frequencyRange: { min: 2400, max: 5850 },
  gain: 8, // 5 dBi @ 2.4, 8 dBi @ 5 GHz
  verticalBeamwidth: 12,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'N-Female',
  height: 450,
  diameter: 30,
  weight: 0.5,
  windSurvival: 140,
  mounting: 'mast-mount',
  weatherRating: 'IP65',
  price: 69,
  useCase: 'Compact dual-band access point, mesh node',
};

// =============================================================================
// LORA / ISM BAND OMNIDIRECTIONAL
// =============================================================================

/**
 * 900 MHz ISM Band Omni - LoRa/Meshtastic
 */
export const OMNI_900_8: OmniAntennaSpec = {
  name: 'HG908U-PRO - 900 MHz 8 dBi Omni',
  manufacturer: 'L-com',
  productUrl: 'https://www.l-com.com/wireless-antenna-900-mhz-8-dbi-omni',
  type: 'collinear',
  frequencyRange: { min: 890, max: 960 },
  gain: 8,
  verticalBeamwidth: 15,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'N-Female',
  height: 920,
  diameter: 38,
  weight: 1.1,
  windSurvival: 160,
  mounting: 'mast-mount',
  weatherRating: 'IP67',
  price: 109,
  useCase: 'LoRa gateway, Meshtastic base station, ISM band coverage',
};

/**
 * Taoglas 915 MHz Omni - LoRa optimized
 * https://www.taoglas.com/
 */
export const TAOGLAS_915: OmniAntennaSpec = {
  name: 'OMB.915.B06 - 915 MHz 6 dBi Omni',
  manufacturer: 'Taoglas',
  productUrl: 'https://www.taoglas.com/product/omb-915-b06/',
  type: 'collinear',
  frequencyRange: { min: 902, max: 928 },
  gain: 6,
  verticalBeamwidth: 20,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'SMA-Male',
  height: 350,
  diameter: 25,
  weight: 0.15,
  windSurvival: 120,
  mounting: 'mast-mount',
  price: 45,
  useCase: 'Compact LoRa node, IoT gateway, Meshtastic',
};

/**
 * Laird 900 MHz Phantom
 * https://www.lairdconnect.com/
 */
export const LAIRD_PHANTOM_900: OmniAntennaSpec = {
  name: 'Phantom 900 - 900 MHz 3 dBi',
  manufacturer: 'Laird Connectivity',
  productUrl: 'https://www.lairdconnect.com/rf-antennas/phantom-antennas',
  type: 'sleeve',
  frequencyRange: { min: 860, max: 960 },
  gain: 3,
  verticalBeamwidth: 40,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'SMA-Male',
  height: 180,
  diameter: 20,
  weight: 0.08,
  windSurvival: 100,
  mounting: 'screw-mount',
  price: 25,
  useCase: 'Indoor LoRa node, portable Meshtastic device',
};

/**
 * 868 MHz EU ISM Band Omni
 */
export const OMNI_868_6: OmniAntennaSpec = {
  name: 'OMB.868.B05F - 868 MHz 5 dBi Omni',
  manufacturer: 'Taoglas',
  productUrl: 'https://www.taoglas.com/product/omb-868-b05f/',
  type: 'collinear',
  frequencyRange: { min: 863, max: 870 },
  gain: 5,
  verticalBeamwidth: 25,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'SMA-Male',
  height: 280,
  diameter: 20,
  weight: 0.12,
  windSurvival: 120,
  mounting: 'mast-mount',
  price: 40,
  useCase: 'European LoRa deployment, IoT gateway',
};

// =============================================================================
// COMPACT / MOBILE ANTENNAS
// =============================================================================

/**
 * Rubber duck antenna for handheld devices
 */
export const RUBBER_DUCK_915: OmniAntennaSpec = {
  name: 'Standard 915 MHz Rubber Duck',
  manufacturer: 'Generic',
  productUrl: 'https://www.amazon.com/915MHz-Antenna-LoRa/dp/B086ZG5WBR',
  type: 'rubber-duck',
  frequencyRange: { min: 900, max: 930 },
  gain: 2,
  verticalBeamwidth: 60,
  polarization: 'vertical',
  vswr: 2.0,
  connector: 'SMA-Male',
  height: 120,
  diameter: 12,
  weight: 0.02,
  windSurvival: 50,
  mounting: 'screw-mount',
  price: 8,
  useCase: 'Handheld LoRa device, basic Meshtastic node',
};

/**
 * Mobile Mark 900 MHz Mobile Antenna
 * https://www.mobilemark.com/
 */
export const MOBILE_MARK_900: OmniAntennaSpec = {
  name: 'OD3-900-BLK - 900 MHz 3 dBi Mobile',
  manufacturer: 'Mobile Mark',
  productUrl: 'https://www.mobilemark.com/product/od-series/',
  type: 'whip',
  frequencyRange: { min: 870, max: 960 },
  gain: 3,
  verticalBeamwidth: 35,
  polarization: 'vertical',
  vswr: 1.5,
  connector: 'N-Female',
  height: 380,
  diameter: 20,
  weight: 0.2,
  windSurvival: 160,
  mounting: 'magnetic',
  weatherRating: 'IP67',
  price: 65,
  useCase: 'Vehicle-mounted LoRa, mobile IoT gateway',
};

// =============================================================================
// ANTENNA SELECTION AND PLANNING
// =============================================================================

/**
 * Coverage pattern calculation
 */
export interface CoveragePattern {
  /** Radius at which signal reaches threshold (km) */
  radius: number;
  /** Elevation angle limits */
  elevationLimits: { min: number; max: number };
  /** Estimated coverage area (sq km) */
  coverageArea: number;
}

/**
 * Calculate omnidirectional coverage pattern
 */
export function calculateOmniCoverage(
  antenna: OmniAntennaSpec,
  txPowerDbm: number,
  cableLossDb: number,
  targetRssiDbm: number,
  heightMeters: number
): CoveragePattern {
  // EIRP calculation
  const eirp = txPowerDbm + antenna.gain - cableLossDb;

  // Free space path loss to determine radius
  // FSPL = 20*log10(d) + 20*log10(f) + 20*log10(4*pi/c)
  // Simplified: FSPL = 20*log10(d) + 20*log10(f) - 147.55 (d in km, f in MHz)
  const centerFreq = (antenna.frequencyRange.min + antenna.frequencyRange.max) / 2;
  const allowableLoss = eirp - targetRssiDbm;
  const radiusKm = Math.pow(10, (allowableLoss - 20 * Math.log10(centerFreq) + 147.55) / 20);

  // Vertical beamwidth determines elevation coverage
  const halfBeam = antenna.verticalBeamwidth / 2;
  const elevationLimits = { min: -halfBeam, max: halfBeam };

  // Coverage area (circular)
  const coverageArea = Math.PI * radiusKm * radiusKm;

  return {
    radius: Math.round(radiusKm * 100) / 100,
    elevationLimits,
    coverageArea: Math.round(coverageArea * 100) / 100,
  };
}

/**
 * Select omnidirectional antenna for application
 */
export function selectOmniAntenna(criteria: {
  frequency: number;
  minGain?: number;
  maxHeight?: number;
  environment: 'indoor' | 'outdoor' | 'mobile';
  budget?: number;
}): OmniAntennaSpec[] {
  const allAntennas: OmniAntennaSpec[] = [
    AMO_5G13,
    HG5812U_PRO,
    HG2415U_PRO,
    DUAL_BAND_OMNI,
    OMNI_900_8,
    TAOGLAS_915,
    LAIRD_PHANTOM_900,
    OMNI_868_6,
    RUBBER_DUCK_915,
    MOBILE_MARK_900,
  ];

  return allAntennas.filter((antenna) => {
    // Frequency check
    if (
      criteria.frequency < antenna.frequencyRange.min ||
      criteria.frequency > antenna.frequencyRange.max
    ) {
      return false;
    }

    // Gain check
    if (criteria.minGain && antenna.gain < criteria.minGain) {
      return false;
    }

    // Height check
    if (criteria.maxHeight && antenna.height > criteria.maxHeight) {
      return false;
    }

    // Environment check
    if (criteria.environment === 'indoor') {
      // Indoor needs compact, doesn't need weather rating
      if (antenna.height > 500) return false;
    } else if (criteria.environment === 'outdoor') {
      // Outdoor needs weather rating
      if (!antenna.weatherRating && antenna.mounting !== 'screw-mount') {
        return false;
      }
    } else if (criteria.environment === 'mobile') {
      // Mobile needs magnetic or compact mount
      if (antenna.mounting !== 'magnetic' && antenna.mounting !== 'screw-mount') {
        return false;
      }
    }

    // Budget check
    if (criteria.budget && antenna.price > criteria.budget) {
      return false;
    }

    return true;
  });
}

/**
 * Calculate downtilt for omni antenna
 * Higher gain omnis have narrower vertical beamwidth and may need physical tilt
 */
export function calculateOptimalTilt(
  antennaHeightM: number,
  desiredCoverageRadiusM: number,
  verticalBeamwidth: number
): {
  tiltDegrees: number;
  coverageNote: string;
} {
  // Calculate angle to coverage edge
  const angleToEdge = Math.atan(antennaHeightM / desiredCoverageRadiusM) * (180 / Math.PI);

  // If vertical beamwidth covers this angle, no tilt needed
  if (angleToEdge < verticalBeamwidth / 2) {
    return {
      tiltDegrees: 0,
      coverageNote: 'No tilt needed - beamwidth covers desired area',
    };
  }

  // Calculate required downtilt
  const tilt = angleToEdge - verticalBeamwidth / 2;

  return {
    tiltDegrees: Math.round(tilt * 10) / 10,
    coverageNote: `Downtilt recommended to cover area ${desiredCoverageRadiusM}m from ${antennaHeightM}m height`,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const OMNI_ANTENNAS = {
  wifi: {
    AMO_5G13,
    HG5812U_PRO,
    HG2415U_PRO,
    DUAL_BAND_OMNI,
  },
  lora: {
    OMNI_900_8,
    TAOGLAS_915,
    LAIRD_PHANTOM_900,
    OMNI_868_6,
  },
  mobile: {
    RUBBER_DUCK_915,
    MOBILE_MARK_900,
  },
};
