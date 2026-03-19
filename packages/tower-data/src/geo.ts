/**
 * Geographic calculation utilities for tower placement and node-hop analysis.
 * All calculations use the WGS84 ellipsoid model.
 */

const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_MI = 3958.8;
const KM_TO_MI = 0.621371;
const MI_TO_KM = 1.60934;
const FT_TO_M = 0.3048;
const M_TO_FT = 3.28084;

export interface Coordinate {
  lat: number;
  lon: number;
}

export interface TowerLocation extends Coordinate {
  elevationFt: number;
  heightAglFt: number;
}

export interface DistanceResult {
  km: number;
  mi: number;
  meters: number;
}

export interface BearingResult {
  degrees: number;
  cardinal: string;
  cardinalDetailed: string;
}

export interface LineOfSightResult {
  distanceKm: number;
  distanceMi: number;
  bearingDeg: number;
  bearingCardinal: string;
  maxLosKm: number;
  maxLosMi: number;
  fresnelClearanceM: number;
  isViable: boolean;
  requiredTowerHeightM: number;
  requiredTowerHeightFt: number;
}

export interface LinkBudgetResult {
  fsplDb: number;
  rainAttenuationDb: number;
  totalPathLossDb: number;
  receivedPowerDbm: number;
  fadeMarginDb: number;
  isViable: boolean;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/**
 * Calculate the great-circle distance between two coordinates using the Haversine formula.
 */
export function haversineDistance(a: Coordinate, b: Coordinate): DistanceResult {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  const km = EARTH_RADIUS_KM * c;
  return {
    km,
    mi: km * KM_TO_MI,
    meters: km * 1000,
  };
}

/**
 * Calculate the initial bearing from point A to point B.
 */
export function calculateBearing(a: Coordinate, b: Coordinate): BearingResult {
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLon = toRad(b.lon - a.lon);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;

  return {
    degrees: bearing,
    cardinal: degreesToCardinal(bearing),
    cardinalDetailed: degreesToCardinalDetailed(bearing),
  };
}

function degreesToCardinal(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function degreesToCardinalDetailed(deg: number): string {
  const dirs = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

/**
 * Calculate maximum line-of-sight distance given tower heights and earth curvature.
 * Uses the standard 4/3 earth radius model for radio propagation.
 */
export function maxLineOfSight(
  heightAMeters: number,
  heightBMeters: number,
  kFactor: number = 4 / 3
): DistanceResult {
  const effectiveRadius = EARTH_RADIUS_KM * kFactor;
  const losKm =
    Math.sqrt(2 * effectiveRadius * (heightAMeters / 1000)) +
    Math.sqrt(2 * effectiveRadius * (heightBMeters / 1000));

  return {
    km: losKm,
    mi: losKm * KM_TO_MI,
    meters: losKm * 1000,
  };
}

/**
 * Calculate the first Fresnel zone radius at the midpoint of a link.
 */
export function fresnelZoneRadius(
  distanceKm: number,
  frequencyGhz: number
): number {
  const distanceM = distanceKm * 1000;
  const wavelengthM = 0.3 / frequencyGhz;
  // First Fresnel zone radius at midpoint
  return Math.sqrt((wavelengthM * distanceM) / 4);
}

/**
 * Calculate Free Space Path Loss in dB.
 */
export function freeSpacePathLoss(
  distanceKm: number,
  frequencyGhz: number
): number {
  return 92.45 + 20 * Math.log10(frequencyGhz) + 20 * Math.log10(distanceKm);
}

/**
 * Estimate rain attenuation for a given distance and frequency.
 * Uses ITU-R P.838 simplified model for moderate rain (25 mm/hr).
 */
export function rainAttenuation(
  distanceKm: number,
  frequencyGhz: number,
  rainRateMmHr: number = 25
): number {
  // Simplified specific attenuation coefficients
  let k: number, alpha: number;
  if (frequencyGhz <= 6) {
    k = 0.00123;
    alpha = 1.18;
  } else if (frequencyGhz <= 15) {
    k = 0.0367;
    alpha = 1.154;
  } else {
    k = 0.124;
    alpha = 1.061;
  }

  const specificAttenuation = k * Math.pow(rainRateMmHr, alpha);
  const effectivePathLength = distanceKm / (1 + distanceKm / 35);
  return specificAttenuation * effectivePathLength;
}

/**
 * Full link analysis between two tower locations.
 */
export function analyzeTowerLink(
  towerA: TowerLocation,
  towerB: TowerLocation,
  frequencyGhz: number = 11
): LineOfSightResult {
  const dist = haversineDistance(towerA, towerB);
  const bearing = calculateBearing(towerA, towerB);

  const heightAM = towerA.heightAglFt * FT_TO_M;
  const heightBM = towerB.heightAglFt * FT_TO_M;

  const los = maxLineOfSight(heightAM, heightBM);
  const fresnel = fresnelZoneRadius(dist.km, frequencyGhz);

  // Earth curvature drop at midpoint
  const midpointDropM = (dist.km * 1000) ** 2 / (8 * EARTH_RADIUS_KM * 1000 * (4 / 3));

  const isViable = dist.km <= los.km * 0.9;

  // Minimum tower height needed if current height is insufficient
  const requiredHeightM = isViable
    ? Math.max(heightAM, heightBM)
    : midpointDropM + fresnel + 10; // 10m safety margin

  return {
    distanceKm: dist.km,
    distanceMi: dist.mi,
    bearingDeg: bearing.degrees,
    bearingCardinal: bearing.cardinalDetailed,
    maxLosKm: los.km,
    maxLosMi: los.mi,
    fresnelClearanceM: fresnel,
    isViable,
    requiredTowerHeightM: requiredHeightM,
    requiredTowerHeightFt: requiredHeightM * M_TO_FT,
  };
}

/**
 * Calculate a complete link budget.
 */
export function calculateLinkBudget(
  distanceKm: number,
  frequencyGhz: number,
  txPowerDbm: number = 23,
  txAntennaGainDbi: number = 38,
  rxAntennaGainDbi: number = 38,
  rxSensitivityDbm: number = -65,
  miscLossDb: number = 2
): LinkBudgetResult {
  const fspl = freeSpacePathLoss(distanceKm, frequencyGhz);
  const rain = rainAttenuation(distanceKm, frequencyGhz);
  const totalPathLoss = fspl + rain + miscLossDb;

  const eirp = txPowerDbm + txAntennaGainDbi;
  const receivedPower = eirp - totalPathLoss + rxAntennaGainDbi;
  const fadeMargin = receivedPower - rxSensitivityDbm;

  return {
    fsplDb: fspl,
    rainAttenuationDb: rain,
    totalPathLossDb: totalPathLoss,
    receivedPowerDbm: receivedPower,
    fadeMarginDb: fadeMargin,
    isViable: fadeMargin > 10, // 10 dB minimum fade margin
  };
}

/**
 * Find the optimal intermediate hop point between two distant towers.
 * Returns a coordinate at the given fraction along the great circle path.
 */
export function intermediatePoint(
  a: Coordinate,
  b: Coordinate,
  fraction: number
): Coordinate {
  const d = haversineDistance(a, b).km / EARTH_RADIUS_KM;
  const lat1 = toRad(a.lat);
  const lon1 = toRad(a.lon);
  const lat2 = toRad(b.lat);
  const lon2 = toRad(b.lon);

  const sinD = Math.sin(d);
  const cosA = Math.sin((1 - fraction) * d) / sinD;
  const cosB = Math.sin(fraction * d) / sinD;

  const x = cosA * Math.cos(lat1) * Math.cos(lon1) + cosB * Math.cos(lat2) * Math.cos(lon2);
  const y = cosA * Math.cos(lat1) * Math.sin(lon1) + cosB * Math.cos(lat2) * Math.sin(lon2);
  const z = cosA * Math.sin(lat1) + cosB * Math.sin(lat2);

  return {
    lat: toDeg(Math.atan2(z, Math.sqrt(x ** 2 + y ** 2))),
    lon: toDeg(Math.atan2(y, x)),
  };
}

/**
 * Score a potential tower as a hop candidate based on multiple factors.
 * Higher score = better candidate.
 */
export function scoreTowerAsHop(
  origin: TowerLocation,
  candidate: TowerLocation,
  destination: TowerLocation,
  frequencyGhz: number = 11
): {
  score: number;
  factors: Record<string, number>;
  linkToCandidate: LineOfSightResult;
  linkToDestination: LineOfSightResult;
} {
  const linkA = analyzeTowerLink(origin, candidate, frequencyGhz);
  const linkB = analyzeTowerLink(candidate, destination, frequencyGhz);
  const directDist = haversineDistance(origin, destination);

  // Factor: LOS viability (both links must work)
  const losScore = (linkA.isViable ? 50 : 0) + (linkB.isViable ? 50 : 0);

  // Factor: Path efficiency (how much extra distance the hop adds)
  const totalHopDist = linkA.distanceKm + linkB.distanceKm;
  const pathEfficiency = Math.max(0, 100 - ((totalHopDist / directDist.km - 1) * 100));

  // Factor: Tower height (taller = better relay)
  const heightScore = Math.min(100, (candidate.heightAglFt / 300) * 100);

  // Factor: Elevation advantage
  const avgElevation = (origin.elevationFt + destination.elevationFt) / 2;
  const elevAdvantage = Math.min(100, Math.max(0, ((candidate.elevationFt - avgElevation) / 200) * 100 + 50));

  // Factor: Balanced link distances (prefer roughly equal legs)
  const ratio = Math.min(linkA.distanceKm, linkB.distanceKm) / Math.max(linkA.distanceKm, linkB.distanceKm);
  const balanceScore = ratio * 100;

  const score = (losScore * 0.35 + pathEfficiency * 0.25 + heightScore * 0.15 + elevAdvantage * 0.1 + balanceScore * 0.15);

  return {
    score,
    factors: {
      losViability: losScore,
      pathEfficiency,
      towerHeight: heightScore,
      elevationAdvantage: elevAdvantage,
      linkBalance: balanceScore,
    },
    linkToCandidate: linkA,
    linkToDestination: linkB,
  };
}

export const conversions = {
  kmToMi: (km: number) => km * KM_TO_MI,
  miToKm: (mi: number) => mi * MI_TO_KM,
  ftToM: (ft: number) => ft * FT_TO_M,
  mToFt: (m: number) => m * M_TO_FT,
};
