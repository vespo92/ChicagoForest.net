/**
 * RF Calculators
 *
 * Exports for all RF calculation tools including link budget
 * and coverage area estimation.
 *
 * @module @chicago-forest/hardware-hal/calculators
 */

// Link Budget Calculator
export {
  // Types
  type LinkBudgetInput,
  type LinkBudgetResult,
  type PropagationEnvironment,
  type RadioPreset,
  // Functions
  calculateLinkBudget,
  quickLinkBudget,
  calculateFSPL,
  calculateMaxDistanceFromFSPL,
  calculateEnvironmentPathLoss,
  calculateFresnelRadius,
  calculateRequiredClearance,
  // Data
  RADIO_PRESETS,
  ENVIRONMENT_LOSS_FACTORS,
  // Aggregate export
  LINK_BUDGET,
} from './link-budget';

// Coverage Area Calculator
export {
  // Types
  type CoverageInput,
  type CoverageResult,
  type NodePlacement,
  type TerrainImpact,
  type TerrainType,
  // Functions
  calculateCoverage,
  calculateNodePlacements,
  adjustCoverageForTerrain,
  getChicagoCoverage,
  // Data
  TERRAIN_IMPACTS,
  CHICAGO_NEIGHBORHOODS,
  // Aggregate export
  COVERAGE_CALCULATOR,
} from './coverage-area';
