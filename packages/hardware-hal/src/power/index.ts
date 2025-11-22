/**
 * Power System Specifications
 *
 * Exports for all power-related specifications including solar systems,
 * battery management, and power budget calculations.
 *
 * @module @chicago-forest/hardware-hal/power
 */

// Solar Specifications (Extended)
export {
  // Types
  type MonthlyIrradiance,
  type PowerProfile,
  type PanelConfiguration,
  // Data
  CHICAGO_SOLAR_DATA,
  US_CITY_SOLAR_DATA,
  POWER_PROFILES,
  PANEL_SIZE_GUIDE,
  PANEL_CONFIGS,
  // Functions
  calculateOptimalSolarTilt,
  calculateOrientationLoss,
  calculateSolarSystem,
  // Aggregate export
  SOLAR_EXTENDED_SPECS,
} from './solar-specs';

// Battery Systems
export {
  // Types
  type BatteryChemistry,
  type BMSSpec,
  type BatteryMonitorSpec,
  // Chemistry Data
  LIFEPO4_CHEMISTRY,
  AGM_CHEMISTRY,
  NMC_CHEMISTRY,
  // BMS Products
  DALY_4S_100A,
  JBD_4S_60A,
  VICTRON_VE_BMS,
  // Monitors
  VICTRON_BMV712,
  BUDGET_SHUNT_MONITOR,
  // Reference Data
  TEMPERATURE_DERATING,
  // Functions
  calculateBatteryRequirements,
  calculateBatteryParallel,
  // Aggregate export
  BATTERY_SYSTEMS,
} from './battery-systems';

// Power Budget Calculator
export {
  // Types
  type PowerConsumption,
  type ComponentCategory,
  type PowerBudgetEntry,
  type PowerBudgetResult,
  type PowerOptimization,
  // Component Data
  COMPONENT_POWER,
  // Predefined Budgets
  PREDEFINED_BUDGETS,
  // Optimization Strategies
  POWER_OPTIMIZATIONS,
  // Functions
  calculatePowerBudget,
  getPredefinedBudget,
  // Aggregate export
  POWER_BUDGET,
} from './power-budget';
