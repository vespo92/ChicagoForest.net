/**
 * RF Propagation Calculations Library
 *
 * Based on methodologies from VE2DBE Radio Mobile software and standard RF engineering formulas.
 *
 * Sources:
 * - Radio Mobile by Roger Coudé VE2DBE: https://www.ve2dbe.com/english1.html
 * - ITM Longley-Rice Model: https://its.ntia.gov/software/itm
 * - Free Space Path Loss: https://en.wikipedia.org/wiki/Free-space_path_loss
 * - Two-Ray Ground Reflection: https://en.wikipedia.org/wiki/Two-ray_ground-reflection_model
 * - Fresnel Zones: https://en.wikipedia.org/wiki/Fresnel_zone
 *
 * DISCLAIMER: These calculations are for educational and planning purposes only.
 * Real-world RF propagation depends on many factors not captured in simplified models.
 */

// Physical constants
export const SPEED_OF_LIGHT = 299792458; // m/s
export const PI = Math.PI;

/**
 * Free Space Path Loss (FSPL)
 *
 * The fundamental equation for signal loss in ideal free space conditions.
 * Based on Friis transmission equation.
 *
 * Formula: FSPL(dB) = 20log₁₀(d) + 20log₁₀(f) + K
 * Where K depends on units used.
 *
 * Source: https://en.wikipedia.org/wiki/Free-space_path_loss
 *
 * @param distanceKm - Distance between antennas in kilometers
 * @param frequencyMHz - Frequency in MHz
 * @returns Path loss in dB
 */
export function freeSpacePathLoss(distanceKm: number, frequencyMHz: number): number {
  // FSPL = 20log₁₀(d_km) + 20log₁₀(f_MHz) + 32.45
  if (distanceKm <= 0 || frequencyMHz <= 0) return 0;
  return 20 * Math.log10(distanceKm) + 20 * Math.log10(frequencyMHz) + 32.45;
}

/**
 * Free Space Path Loss with distance in meters and frequency in GHz
 *
 * @param distanceM - Distance in meters
 * @param frequencyGHz - Frequency in GHz
 * @returns Path loss in dB
 */
export function freeSpacePathLossMetric(distanceM: number, frequencyGHz: number): number {
  // FSPL = 20log₁₀(d_m) + 20log₁₀(f_GHz) + 92.45
  if (distanceM <= 0 || frequencyGHz <= 0) return 0;
  return 20 * Math.log10(distanceM) + 20 * Math.log10(frequencyGHz) + 92.45;
}

/**
 * Wavelength calculation
 *
 * @param frequencyMHz - Frequency in MHz
 * @returns Wavelength in meters
 */
export function wavelength(frequencyMHz: number): number {
  if (frequencyMHz <= 0) return 0;
  return SPEED_OF_LIGHT / (frequencyMHz * 1e6);
}

/**
 * First Fresnel Zone Radius
 *
 * The Fresnel zone represents the ellipsoidal area around the line of sight
 * where radio wave propagation occurs. 60% clearance of the first Fresnel zone
 * is typically required for near-free-space propagation.
 *
 * Formula: r₁ = 17.3 × √((d₁ × d₂) / (f × D))
 *
 * Source: VE2DBE Radio Mobile, https://www.ve2dbe.com/english1.html
 *
 * @param d1Km - Distance from transmitter to obstacle in km
 * @param d2Km - Distance from obstacle to receiver in km
 * @param frequencyGHz - Frequency in GHz
 * @returns First Fresnel zone radius in meters
 */
export function fresnelZoneRadius(d1Km: number, d2Km: number, frequencyGHz: number): number {
  if (d1Km <= 0 || d2Km <= 0 || frequencyGHz <= 0) return 0;
  const totalDistance = d1Km + d2Km;
  // r1 (m) = 17.3 × √((d1 × d2) / (f_GHz × D))
  return 17.3 * Math.sqrt((d1Km * d2Km) / (frequencyGHz * totalDistance));
}

/**
 * First Fresnel Zone Radius at midpoint
 *
 * @param totalDistanceKm - Total link distance in km
 * @param frequencyGHz - Frequency in GHz
 * @returns First Fresnel zone radius at midpoint in meters
 */
export function fresnelZoneRadiusMidpoint(totalDistanceKm: number, frequencyGHz: number): number {
  const d1 = totalDistanceKm / 2;
  const d2 = totalDistanceKm / 2;
  return fresnelZoneRadius(d1, d2, frequencyGHz);
}

/**
 * Required clearance height for 60% Fresnel zone
 *
 * @param totalDistanceKm - Total link distance in km
 * @param frequencyGHz - Frequency in GHz
 * @returns Required clearance in meters (60% of F1)
 */
export function requiredClearance(totalDistanceKm: number, frequencyGHz: number): number {
  return fresnelZoneRadiusMidpoint(totalDistanceKm, frequencyGHz) * 0.6;
}

/**
 * Two-Ray Ground Reflection Model
 *
 * More accurate than FSPL for terrestrial links where ground reflection
 * is significant. Used by VE2DBE Radio Mobile for terrain analysis.
 *
 * Near field (d < dc): Uses free space model
 * Far field (d > dc): Path loss increases at 40 dB/decade
 *
 * Formula: PL = 40log₁₀(d) - 10log₁₀(Gt × Gr × ht² × hr²)
 *
 * Source: https://en.wikipedia.org/wiki/Two-ray_ground-reflection_model
 *
 * @param distanceM - Distance in meters
 * @param txHeightM - Transmitter height in meters
 * @param rxHeightM - Receiver height in meters
 * @param frequencyMHz - Frequency in MHz (for critical distance calculation)
 * @returns Path loss in dB
 */
export function twoRayGroundReflection(
  distanceM: number,
  txHeightM: number,
  rxHeightM: number,
  frequencyMHz: number
): number {
  if (distanceM <= 0 || txHeightM <= 0 || rxHeightM <= 0 || frequencyMHz <= 0) return 0;

  const lambda = wavelength(frequencyMHz);

  // Critical distance: dc = 4 × ht × hr / λ
  const criticalDistance = (4 * txHeightM * rxHeightM) / lambda;

  if (distanceM < criticalDistance) {
    // Use free space model in near field
    return freeSpacePathLoss(distanceM / 1000, frequencyMHz);
  } else {
    // Two-ray model in far field: PL = 40log(d) - 20log(ht) - 20log(hr)
    return 40 * Math.log10(distanceM) - 20 * Math.log10(txHeightM) - 20 * Math.log10(rxHeightM);
  }
}

/**
 * Critical Distance for Two-Ray Model
 *
 * The distance at which the propagation model transitions from
 * free-space behavior to inverse fourth power behavior.
 *
 * @param txHeightM - Transmitter height in meters
 * @param rxHeightM - Receiver height in meters
 * @param frequencyMHz - Frequency in MHz
 * @returns Critical distance in meters
 */
export function criticalDistance(txHeightM: number, rxHeightM: number, frequencyMHz: number): number {
  const lambda = wavelength(frequencyMHz);
  if (lambda <= 0) return 0;
  return (4 * txHeightM * rxHeightM) / lambda;
}

/**
 * Link Budget Calculation
 *
 * Calculates the received signal strength based on transmitter power,
 * antenna gains, and path loss.
 *
 * Formula: Pr = Pt + Gt + Gr - PL - Lmisc
 *
 * @param txPowerDbm - Transmitter power in dBm
 * @param txGainDbi - Transmitter antenna gain in dBi
 * @param rxGainDbi - Receiver antenna gain in dBi
 * @param pathLossDb - Path loss in dB
 * @param miscLossDb - Miscellaneous losses (cables, connectors) in dB
 * @returns Received power in dBm
 */
export function linkBudget(
  txPowerDbm: number,
  txGainDbi: number,
  rxGainDbi: number,
  pathLossDb: number,
  miscLossDb: number = 0
): number {
  return txPowerDbm + txGainDbi + rxGainDbi - pathLossDb - miscLossDb;
}

/**
 * EIRP - Effective Isotropic Radiated Power
 *
 * @param txPowerDbm - Transmitter power in dBm
 * @param antennaGainDbi - Antenna gain in dBi
 * @param cableLossDb - Cable/connector losses in dB
 * @returns EIRP in dBm
 */
export function eirp(txPowerDbm: number, antennaGainDbi: number, cableLossDb: number = 0): number {
  return txPowerDbm + antennaGainDbi - cableLossDb;
}

/**
 * Fade Margin
 *
 * The difference between received signal strength and receiver sensitivity.
 * Positive values indicate successful link. Used by VE2DBE Radio Mobile
 * for link viability assessment.
 *
 * @param receivedPowerDbm - Received power in dBm
 * @param sensitivityDbm - Receiver sensitivity in dBm
 * @returns Fade margin in dB (positive = link works)
 */
export function fadeMargin(receivedPowerDbm: number, sensitivityDbm: number): number {
  return receivedPowerDbm - sensitivityDbm;
}

/**
 * Maximum Range Estimation
 *
 * Estimates the maximum distance for a given link budget and required fade margin.
 *
 * @param txPowerDbm - Transmitter power in dBm
 * @param txGainDbi - Transmitter antenna gain in dBi
 * @param rxGainDbi - Receiver antenna gain in dBi
 * @param rxSensitivityDbm - Receiver sensitivity in dBm
 * @param frequencyMHz - Frequency in MHz
 * @param requiredFadeMarginDb - Required fade margin in dB
 * @returns Maximum range in kilometers
 */
export function maxRange(
  txPowerDbm: number,
  txGainDbi: number,
  rxGainDbi: number,
  rxSensitivityDbm: number,
  frequencyMHz: number,
  requiredFadeMarginDb: number = 10
): number {
  // Maximum allowable path loss
  const maxPathLoss = txPowerDbm + txGainDbi + rxGainDbi - rxSensitivityDbm - requiredFadeMarginDb;

  // Solve FSPL equation for distance
  // PL = 20log(d) + 20log(f) + 32.45
  // d = 10^((PL - 20log(f) - 32.45) / 20)
  const distanceKm = Math.pow(10, (maxPathLoss - 20 * Math.log10(frequencyMHz) - 32.45) / 20);

  return distanceKm;
}

/**
 * Knife-Edge Diffraction Loss (Simplified)
 *
 * Approximation of signal loss when path is obstructed.
 * Based on ITM model simplifications used in Radio Mobile.
 *
 * Source: NTIA ITM Model https://its.ntia.gov/software/itm
 *
 * @param v - Fresnel-Kirchoff diffraction parameter
 * @returns Diffraction loss in dB
 */
export function knifeEdgeDiffraction(v: number): number {
  if (v <= -1) {
    return 0; // No obstruction
  } else if (v <= 0) {
    return 6.02 + 9.11 * v - 1.27 * v * v;
  } else if (v <= 2.4) {
    return 6.02 + 9 * v + 1.65 * v * v;
  } else {
    return 13.82 + 20 * Math.log10(v);
  }
}

/**
 * Fresnel-Kirchoff Diffraction Parameter
 *
 * @param clearanceM - Clearance above obstacle (negative if obstructed)
 * @param d1M - Distance from TX to obstacle in meters
 * @param d2M - Distance from obstacle to RX in meters
 * @param frequencyMHz - Frequency in MHz
 * @returns Diffraction parameter v
 */
export function fresnelKirchoffParameter(
  clearanceM: number,
  d1M: number,
  d2M: number,
  frequencyMHz: number
): number {
  const lambda = wavelength(frequencyMHz);
  const totalDistance = d1M + d2M;

  // v = h × √(2(d1 + d2) / (λ × d1 × d2))
  // where h is negative for obstruction below LOS
  return -clearanceM * Math.sqrt((2 * totalDistance) / (lambda * d1M * d2M));
}

/**
 * Rain Attenuation (ITU-R P.838)
 *
 * Simplified rain attenuation for frequencies above 1 GHz.
 *
 * @param frequencyGHz - Frequency in GHz
 * @param rainRateMmH - Rain rate in mm/hour
 * @param pathLengthKm - Path length in km
 * @returns Rain attenuation in dB
 */
export function rainAttenuation(
  frequencyGHz: number,
  rainRateMmH: number,
  pathLengthKm: number
): number {
  // Simplified model: A = γR × d_eff
  // γR = k × R^α (specific attenuation)
  // Using approximate values for k and α

  if (frequencyGHz < 1) return 0; // Rain attenuation negligible below 1 GHz

  // Approximate k and α coefficients (horizontal polarization)
  const k = 0.0000998 * Math.pow(frequencyGHz, 1.6);
  const alpha = 1.0 + 0.01 * frequencyGHz;

  const specificAttenuation = k * Math.pow(rainRateMmH, alpha);

  // Effective path length reduction factor
  const reductionFactor = 1 / (1 + pathLengthKm / 35);

  return specificAttenuation * pathLengthKm * reductionFactor;
}

/**
 * Atmospheric Attenuation (Simplified)
 *
 * Oxygen and water vapor absorption for frequencies above 10 GHz.
 *
 * @param frequencyGHz - Frequency in GHz
 * @param pathLengthKm - Path length in km
 * @returns Atmospheric attenuation in dB
 */
export function atmosphericAttenuation(frequencyGHz: number, pathLengthKm: number): number {
  if (frequencyGHz < 10) return 0; // Negligible below 10 GHz

  // Simplified specific attenuation (dB/km)
  // Peaks at ~22 GHz (water vapor) and ~60 GHz (oxygen)
  let specificAtten = 0;

  if (frequencyGHz >= 10 && frequencyGHz < 57) {
    specificAtten = 0.01 + 0.0001 * Math.pow(frequencyGHz - 10, 1.5);
  } else if (frequencyGHz >= 57 && frequencyGHz <= 63) {
    specificAtten = 15; // Oxygen absorption peak
  } else if (frequencyGHz > 63) {
    specificAtten = 0.05 + 0.001 * (frequencyGHz - 63);
  }

  return specificAtten * pathLengthKm;
}

/**
 * dBm to Watts conversion
 */
export function dbmToWatts(dbm: number): number {
  return Math.pow(10, (dbm - 30) / 10);
}

/**
 * Watts to dBm conversion
 */
export function wattsToDbm(watts: number): number {
  if (watts <= 0) return -Infinity;
  return 10 * Math.log10(watts) + 30;
}

/**
 * dBm to milliwatts conversion
 */
export function dbmToMw(dbm: number): number {
  return Math.pow(10, dbm / 10);
}

/**
 * Milliwatts to dBm conversion
 */
export function mwToDbm(mw: number): number {
  if (mw <= 0) return -Infinity;
  return 10 * Math.log10(mw);
}

/**
 * Signal-to-Noise Ratio
 *
 * @param signalDbm - Signal power in dBm
 * @param noiseDbm - Noise power in dBm
 * @returns SNR in dB
 */
export function snr(signalDbm: number, noiseDbm: number): number {
  return signalDbm - noiseDbm;
}

/**
 * Thermal Noise Power
 *
 * @param bandwidthHz - Bandwidth in Hz
 * @param temperatureK - Temperature in Kelvin (default 290K)
 * @returns Noise power in dBm
 */
export function thermalNoise(bandwidthHz: number, temperatureK: number = 290): number {
  // N = kTB
  const k = 1.38e-23; // Boltzmann constant
  const noiseWatts = k * temperatureK * bandwidthHz;
  return wattsToDbm(noiseWatts);
}

// Export type definitions
export interface LinkBudgetInput {
  txPowerDbm: number;
  txGainDbi: number;
  rxGainDbi: number;
  distanceKm: number;
  frequencyMHz: number;
  miscLossDb?: number;
  rxSensitivityDbm: number;
}

export interface LinkBudgetResult {
  pathLossDb: number;
  receivedPowerDbm: number;
  fadeMarginDb: number;
  linkViable: boolean;
  fresnelRadiusM: number;
  requiredClearanceM: number;
}

/**
 * Complete Link Analysis
 *
 * Performs a comprehensive link budget analysis combining multiple models.
 * This is the primary function for mesh network planning.
 *
 * @param input - Link budget input parameters
 * @returns Complete analysis results
 */
export function analyzeLinkBudget(input: LinkBudgetInput): LinkBudgetResult {
  const {
    txPowerDbm,
    txGainDbi,
    rxGainDbi,
    distanceKm,
    frequencyMHz,
    miscLossDb = 0,
    rxSensitivityDbm
  } = input;

  const pathLossDb = freeSpacePathLoss(distanceKm, frequencyMHz);
  const receivedPowerDbm = linkBudget(txPowerDbm, txGainDbi, rxGainDbi, pathLossDb, miscLossDb);
  const fadeMarginDb = fadeMargin(receivedPowerDbm, rxSensitivityDbm);
  const frequencyGHz = frequencyMHz / 1000;
  const fresnelRadiusM = fresnelZoneRadiusMidpoint(distanceKm, frequencyGHz);
  const requiredClearanceM = requiredClearance(distanceKm, frequencyGHz);

  return {
    pathLossDb,
    receivedPowerDbm,
    fadeMarginDb,
    linkViable: fadeMarginDb > 0,
    fresnelRadiusM,
    requiredClearanceM
  };
}
