/**
 * Coverage Area Calculator
 *
 * Tools for estimating wireless coverage areas for mesh network planning.
 * Includes calculations for omnidirectional and directional antennas.
 *
 * DISCLAIMER: This is an AI-generated educational framework. Coverage
 * estimates are theoretical and actual coverage varies significantly
 * based on terrain, buildings, foliage, and interference.
 *
 * @module @chicago-forest/hardware-hal/calculators/coverage-area
 */

import {
  calculateLinkBudget,
  calculateEnvironmentPathLoss,
  calculateMaxDistanceFromFSPL,
  calculateFSPL,
  type PropagationEnvironment,
  ENVIRONMENT_LOSS_FACTORS,
} from './link-budget';

// =============================================================================
// COVERAGE PARAMETERS
// =============================================================================

/**
 * Coverage area input parameters
 */
export interface CoverageInput {
  /** Transmitter power (dBm) */
  txPowerDbm: number;
  /** Antenna gain (dBi) */
  antennaGainDbi: number;
  /** Antenna type */
  antennaType: 'omni' | 'sector' | 'directional';
  /** Horizontal beamwidth (degrees) - for sector/directional */
  horizontalBeamwidth?: number;
  /** Cable/connector loss (dB) */
  cableLossDb: number;
  /** Frequency (MHz) */
  frequencyMhz: number;
  /** Target receiver sensitivity (dBm) */
  rxSensitivityDbm: number;
  /** Receiver antenna gain (dBi) */
  rxAntennaGainDbi: number;
  /** Fade margin (dB) */
  fadeMarginDb: number;
  /** Propagation environment */
  environment: PropagationEnvironment;
  /** Antenna height (m) */
  antennaHeightM: number;
}

/**
 * Coverage area result
 */
export interface CoverageResult {
  /** Maximum range (km) */
  maxRangeKm: number;
  /** Coverage area (sq km) */
  coverageAreaSqKm: number;
  /** Coverage shape */
  shape: 'circle' | 'sector' | 'ellipse';
  /** Sector angle (degrees) - if applicable */
  sectorAngle?: number;
  /** Range at different signal levels */
  rangeBySignal: {
    excellent: number; // > -65 dBm
    good: number; // -65 to -75 dBm
    fair: number; // -75 to -85 dBm
    weak: number; // -85 to sensitivity
  };
  /** Environment impact notes */
  notes: string[];
}

// =============================================================================
// COVERAGE CALCULATOR
// =============================================================================

/**
 * Calculate coverage area for a given configuration
 */
export function calculateCoverage(input: CoverageInput): CoverageResult {
  // Calculate EIRP
  const eirp = input.txPowerDbm + input.antennaGainDbi - input.cableLossDb;

  // Calculate maximum available path loss
  const maxPathLoss =
    eirp +
    input.rxAntennaGainDbi -
    input.rxSensitivityDbm -
    input.fadeMarginDb;

  // Get environment factors
  const envFactor = ENVIRONMENT_LOSS_FACTORS[input.environment];

  // Calculate maximum range accounting for environment
  // Path Loss = FSPL + Environment Loss
  // We need to solve for distance iteratively since environment loss is distance-dependent
  const maxRangeKm = calculateMaxRangeWithEnvironment(
    maxPathLoss,
    input.frequencyMhz,
    input.environment
  );

  // Calculate coverage area based on antenna type
  let coverageAreaSqKm: number;
  let shape: CoverageResult['shape'];
  let sectorAngle: number | undefined;

  if (input.antennaType === 'omni') {
    coverageAreaSqKm = Math.PI * maxRangeKm * maxRangeKm;
    shape = 'circle';
  } else {
    const beamwidth = input.horizontalBeamwidth || 90;
    sectorAngle = beamwidth;
    // Sector area = (angle/360) * pi * r^2
    coverageAreaSqKm = (beamwidth / 360) * Math.PI * maxRangeKm * maxRangeKm;
    shape = 'sector';
  }

  // Calculate range at different signal levels
  const rangeBySignal = {
    excellent: calculateRangeForSignal(eirp, input.rxAntennaGainDbi, -65, input),
    good: calculateRangeForSignal(eirp, input.rxAntennaGainDbi, -75, input),
    fair: calculateRangeForSignal(eirp, input.rxAntennaGainDbi, -85, input),
    weak: maxRangeKm,
  };

  // Generate notes
  const notes = [
    `Environment: ${input.environment} (${envFactor.description})`,
    `EIRP: ${eirp.toFixed(1)} dBm`,
    `Max path loss budget: ${maxPathLoss.toFixed(1)} dB`,
  ];

  if (input.environment !== 'free-space') {
    notes.push(`Environment adds ~${envFactor.baseExtraLossDb} dB base loss`);
  }

  if (input.antennaHeightM > 0) {
    notes.push(`Higher antenna placement may improve coverage`);
  }

  return {
    maxRangeKm: Math.round(maxRangeKm * 100) / 100,
    coverageAreaSqKm: Math.round(coverageAreaSqKm * 100) / 100,
    shape,
    sectorAngle,
    rangeBySignal,
    notes,
  };
}

/**
 * Calculate max range accounting for environment losses
 */
function calculateMaxRangeWithEnvironment(
  maxPathLoss: number,
  frequencyMhz: number,
  environment: PropagationEnvironment
): number {
  const envFactor = ENVIRONMENT_LOSS_FACTORS[environment];

  // Binary search for max range
  let low = 0.01;
  let high = 100; // Start with 100 km max
  let result = 0;

  while (high - low > 0.01) {
    const mid = (low + high) / 2;
    const actualLoss = calculateEnvironmentPathLoss(mid, frequencyMhz, environment);

    if (actualLoss <= maxPathLoss) {
      result = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  return result;
}

/**
 * Calculate range for specific signal level
 */
function calculateRangeForSignal(
  eirp: number,
  rxGain: number,
  targetSignal: number,
  input: CoverageInput
): number {
  const pathLoss = eirp + rxGain - targetSignal;
  return calculateMaxRangeWithEnvironment(pathLoss, input.frequencyMhz, input.environment);
}

// =============================================================================
// NETWORK COVERAGE PLANNING
// =============================================================================

/**
 * Node placement for area coverage
 */
export interface NodePlacement {
  x: number; // km from origin
  y: number; // km from origin
  range: number; // km
  coverageArea: number; // sq km
}

/**
 * Calculate node placements for area coverage
 *
 * Uses hexagonal grid pattern for efficient coverage
 */
export function calculateNodePlacements(
  targetAreaSqKm: number,
  nodeRange: number,
  overlapPercent: number = 20
): {
  nodes: NodePlacement[];
  totalCoverage: number;
  efficiency: number;
  notes: string[];
} {
  // Effective range with overlap
  const effectiveRange = nodeRange * (1 - overlapPercent / 100);

  // Hexagonal grid spacing
  // Horizontal spacing = 2 * range * cos(30) = range * sqrt(3)
  // Vertical spacing = 1.5 * range
  const hSpacing = effectiveRange * Math.sqrt(3);
  const vSpacing = effectiveRange * 1.5;

  // Calculate area dimensions (assume square target area)
  const sideLength = Math.sqrt(targetAreaSqKm);

  // Calculate grid
  const nodes: NodePlacement[] = [];
  let row = 0;

  for (let y = 0; y <= sideLength; y += vSpacing) {
    const offset = row % 2 === 0 ? 0 : hSpacing / 2;

    for (let x = offset; x <= sideLength; x += hSpacing) {
      nodes.push({
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        range: nodeRange,
        coverageArea: Math.PI * nodeRange * nodeRange,
      });
    }
    row++;
  }

  // Calculate total coverage (with overlap)
  const nodeArea = Math.PI * nodeRange * nodeRange;
  const rawCoverage = nodes.length * nodeArea;
  const efficiency = Math.min(targetAreaSqKm / rawCoverage, 1) * 100;

  return {
    nodes,
    totalCoverage: Math.round(rawCoverage * 100) / 100,
    efficiency: Math.round(efficiency),
    notes: [
      `${nodes.length} nodes needed for ${targetAreaSqKm} sq km`,
      `Using hexagonal grid with ${overlapPercent}% overlap`,
      `Horizontal spacing: ${hSpacing.toFixed(2)} km`,
      `Vertical spacing: ${vSpacing.toFixed(2)} km`,
    ],
  };
}

// =============================================================================
// TERRAIN IMPACT
// =============================================================================

/**
 * Terrain type and its impact on coverage
 */
export interface TerrainImpact {
  type: TerrainType;
  rangeMultiplier: number;
  description: string;
  recommendations: string[];
}

export type TerrainType =
  | 'flat-open'
  | 'rolling-hills'
  | 'hilly'
  | 'mountainous'
  | 'dense-urban'
  | 'urban'
  | 'suburban'
  | 'forest'
  | 'water';

export const TERRAIN_IMPACTS: Record<TerrainType, TerrainImpact> = {
  'flat-open': {
    type: 'flat-open',
    rangeMultiplier: 1.0,
    description: 'Flat terrain with minimal obstructions',
    recommendations: ['Ideal for long-range links', 'Watch for earth curvature on very long links'],
  },
  'rolling-hills': {
    type: 'rolling-hills',
    rangeMultiplier: 0.7,
    description: 'Gentle terrain variations',
    recommendations: ['Position nodes on high points', 'Consider terrain profile'],
  },
  hilly: {
    type: 'hilly',
    rangeMultiplier: 0.5,
    description: 'Significant elevation changes',
    recommendations: ['Hilltop placement critical', 'May need relay nodes'],
  },
  mountainous: {
    type: 'mountainous',
    rangeMultiplier: 0.3,
    description: 'Steep terrain with valleys',
    recommendations: ['Line of sight is challenging', 'Use repeaters on ridges'],
  },
  'dense-urban': {
    type: 'dense-urban',
    rangeMultiplier: 0.2,
    description: 'High-rise buildings, heavy NLOS',
    recommendations: ['Rooftop deployments', 'Many more nodes needed', 'Consider small cells'],
  },
  urban: {
    type: 'urban',
    rangeMultiplier: 0.35,
    description: 'Mixed buildings, some NLOS',
    recommendations: ['Elevated placements help', 'Higher frequencies may penetrate better'],
  },
  suburban: {
    type: 'suburban',
    rangeMultiplier: 0.6,
    description: 'Houses, trees, light obstructions',
    recommendations: ['Good coverage potential', 'Watch for seasonal foliage changes'],
  },
  forest: {
    type: 'forest',
    rangeMultiplier: 0.25,
    description: 'Dense vegetation',
    recommendations: ['Lower frequencies penetrate better', 'Above canopy placement ideal'],
  },
  water: {
    type: 'water',
    rangeMultiplier: 1.2,
    description: 'Over water propagation',
    recommendations: ['Excellent for overwater links', 'Watch for multipath from reflections'],
  },
};

/**
 * Adjust coverage estimate for terrain
 */
export function adjustCoverageForTerrain(
  baseCoverage: CoverageResult,
  terrain: TerrainType
): CoverageResult {
  const impact = TERRAIN_IMPACTS[terrain];

  return {
    ...baseCoverage,
    maxRangeKm: Math.round(baseCoverage.maxRangeKm * impact.rangeMultiplier * 100) / 100,
    coverageAreaSqKm:
      Math.round(
        baseCoverage.coverageAreaSqKm * impact.rangeMultiplier * impact.rangeMultiplier * 100
      ) / 100,
    rangeBySignal: {
      excellent: baseCoverage.rangeBySignal.excellent * impact.rangeMultiplier,
      good: baseCoverage.rangeBySignal.good * impact.rangeMultiplier,
      fair: baseCoverage.rangeBySignal.fair * impact.rangeMultiplier,
      weak: baseCoverage.rangeBySignal.weak * impact.rangeMultiplier,
    },
    notes: [
      ...baseCoverage.notes,
      `Terrain: ${terrain} (${impact.description})`,
      `Range multiplier: ${impact.rangeMultiplier}x`,
      ...impact.recommendations,
    ],
  };
}

// =============================================================================
// CHICAGO-SPECIFIC PLANNING
// =============================================================================

/**
 * Chicago neighborhood coverage characteristics
 */
export const CHICAGO_NEIGHBORHOODS: Record<string, {
  terrain: TerrainType;
  notes: string[];
}> = {
  loop: {
    terrain: 'dense-urban',
    notes: ['High-rise canyon effects', 'Consider rooftop-to-rooftop links'],
  },
  lincoln_park: {
    terrain: 'urban',
    notes: ['Mixed density', 'Park areas provide better propagation'],
  },
  hyde_park: {
    terrain: 'suburban',
    notes: ['University area', 'Good mix of open and built areas'],
  },
  pilsen: {
    terrain: 'urban',
    notes: ['Lower density', 'Good community network potential'],
  },
  rogers_park: {
    terrain: 'suburban',
    notes: ['Near lake for good propagation', 'Residential with good coverage'],
  },
  south_shore: {
    terrain: 'suburban',
    notes: ['Lake proximity helps', 'Residential focus'],
  },
  humboldt_park: {
    terrain: 'suburban',
    notes: ['Park areas for node placement', 'Community-focused'],
  },
  garfield_park: {
    terrain: 'suburban',
    notes: ['Conservatory area for placement', 'Coverage opportunity'],
  },
};

/**
 * Get coverage estimate for Chicago neighborhood
 */
export function getChicagoCoverage(
  neighborhood: keyof typeof CHICAGO_NEIGHBORHOODS,
  coverageInput: Omit<CoverageInput, 'environment'>
): CoverageResult {
  const neighborhoodInfo = CHICAGO_NEIGHBORHOODS[neighborhood];

  const fullInput: CoverageInput = {
    ...coverageInput,
    environment: neighborhoodInfo.terrain === 'dense-urban' ? 'urban-dense' :
      neighborhoodInfo.terrain === 'urban' ? 'urban' :
        'suburban',
  };

  const baseCoverage = calculateCoverage(fullInput);
  const adjustedCoverage = adjustCoverageForTerrain(baseCoverage, neighborhoodInfo.terrain);

  return {
    ...adjustedCoverage,
    notes: [
      ...adjustedCoverage.notes,
      `Chicago neighborhood: ${neighborhood}`,
      ...neighborhoodInfo.notes,
    ],
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const COVERAGE_CALCULATOR = {
  calculate: calculateCoverage,
  nodePlacements: calculateNodePlacements,
  terrain: TERRAIN_IMPACTS,
  adjustForTerrain: adjustCoverageForTerrain,
  chicago: {
    neighborhoods: CHICAGO_NEIGHBORHOODS,
    getCoverage: getChicagoCoverage,
  },
};
