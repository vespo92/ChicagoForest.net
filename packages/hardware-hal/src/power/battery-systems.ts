/**
 * Battery Systems Specifications
 *
 * Extended battery specifications and management for mesh network
 * power systems. Includes chemistry comparisons, BMS specifications,
 * and sizing calculations.
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications. Battery systems should be designed and
 * installed by qualified personnel following safety guidelines.
 *
 * Sources:
 * - BatteryUniversity: https://batteryuniversity.com/
 * - Victron Energy: https://www.victronenergy.com/
 * - PowerTech Systems: https://www.powertechsystems.eu/
 *
 * @module @chicago-forest/hardware-hal/power/battery-systems
 */

// =============================================================================
// BATTERY CHEMISTRY COMPARISON
// =============================================================================

/**
 * Battery chemistry characteristics
 */
export interface BatteryChemistry {
  /** Chemistry name */
  name: string;
  /** Chemical designation */
  designation: string;
  /** Nominal cell voltage */
  nominalVoltage: number;
  /** Charge voltage per cell */
  chargeVoltage: number;
  /** Discharge cutoff per cell */
  cutoffVoltage: number;
  /** Typical cycle life at 80% DoD */
  cycleLife: number;
  /** Energy density (Wh/kg) */
  energyDensity: number;
  /** Self discharge per month (%) */
  selfDischargePercent: number;
  /** Operating temperature range (C) */
  operatingTemp: { min: number; max: number };
  /** Requires BMS */
  requiresBMS: boolean;
  /** Safety rating */
  safetyRating: 'high' | 'medium' | 'low';
  /** Cost per kWh (USD) */
  costPerKwh: number;
  /** Best for */
  bestFor: string[];
  /** Avoid for */
  avoidFor: string[];
}

/**
 * LiFePO4 (Lithium Iron Phosphate)
 */
export const LIFEPO4_CHEMISTRY: BatteryChemistry = {
  name: 'Lithium Iron Phosphate',
  designation: 'LiFePO4',
  nominalVoltage: 3.2,
  chargeVoltage: 3.65,
  cutoffVoltage: 2.5,
  cycleLife: 3000,
  energyDensity: 130,
  selfDischargePercent: 2,
  operatingTemp: { min: -20, max: 60 },
  requiresBMS: true,
  safetyRating: 'high',
  costPerKwh: 400,
  bestFor: [
    'Solar off-grid systems',
    'Mesh network nodes',
    'Temperature extremes',
    'Long-term deployment',
  ],
  avoidFor: [
    'Very cold without heating',
    'Ultra-budget builds',
  ],
};

/**
 * Lead Acid AGM
 */
export const AGM_CHEMISTRY: BatteryChemistry = {
  name: 'Absorbed Glass Mat',
  designation: 'AGM',
  nominalVoltage: 2.0,
  chargeVoltage: 2.4,
  cutoffVoltage: 1.75,
  cycleLife: 400,
  energyDensity: 35,
  selfDischargePercent: 3,
  operatingTemp: { min: -40, max: 60 },
  requiresBMS: false,
  safetyRating: 'high',
  costPerKwh: 150,
  bestFor: [
    'Budget builds',
    'Cold weather',
    'Simple systems',
    'Widely available',
  ],
  avoidFor: [
    'Weight-sensitive applications',
    'Daily deep cycling',
    'Space-constrained',
  ],
};

/**
 * Lithium-ion NMC
 */
export const NMC_CHEMISTRY: BatteryChemistry = {
  name: 'Lithium Nickel Manganese Cobalt',
  designation: 'NMC',
  nominalVoltage: 3.6,
  chargeVoltage: 4.2,
  cutoffVoltage: 2.5,
  cycleLife: 1000,
  energyDensity: 200,
  selfDischargePercent: 5,
  operatingTemp: { min: 0, max: 45 },
  requiresBMS: true,
  safetyRating: 'medium',
  costPerKwh: 300,
  bestFor: [
    'High energy density needs',
    'Portable applications',
    'Indoor controlled temp',
  ],
  avoidFor: [
    'Outdoor without temp control',
    'Safety-critical applications',
    'Hot environments',
  ],
};

// =============================================================================
// BATTERY MANAGEMENT SYSTEMS
// =============================================================================

/**
 * BMS specification
 */
export interface BMSSpec {
  /** Product name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Product URL */
  productUrl: string;
  /** Price (USD) */
  price: number;
  /** Supported chemistry */
  chemistry: string[];
  /** Cell count (series) */
  cellCount: number | string; // e.g., "4S" or "4-8S"
  /** Continuous current (A) */
  continuousCurrent: number;
  /** Peak current (A) */
  peakCurrent: number;
  /** Balance current (mA) */
  balanceCurrent: number;
  /** Balance method */
  balanceMethod: 'passive' | 'active';
  /** Protection features */
  protections: string[];
  /** Communication interface */
  communication?: string[];
  /** Quiescent current (uA) */
  quiescentCurrent: number;
  /** Notes */
  notes: string[];
}

/**
 * Daly 4S LiFePO4 BMS
 */
export const DALY_4S_100A: BMSSpec = {
  name: 'Daly 4S 100A LiFePO4 BMS',
  manufacturer: 'Daly',
  productUrl: 'https://www.dalyelec.com/',
  price: 35,
  chemistry: ['LiFePO4'],
  cellCount: '4S',
  continuousCurrent: 100,
  peakCurrent: 200,
  balanceCurrent: 60,
  balanceMethod: 'passive',
  protections: [
    'Over-voltage',
    'Under-voltage',
    'Over-current',
    'Short circuit',
    'Over-temperature',
    'Cell balancing',
  ],
  communication: ['UART', 'Bluetooth (optional)'],
  quiescentCurrent: 100,
  notes: [
    'Popular budget option',
    'Bluetooth app available',
    'Configurable parameters',
  ],
};

/**
 * JBD (JiaYiBeiDa) Smart BMS
 */
export const JBD_4S_60A: BMSSpec = {
  name: 'JBD 4S 60A Smart BMS',
  manufacturer: 'JiaYiBeiDa',
  productUrl: 'https://www.jiabaida.com/',
  price: 45,
  chemistry: ['LiFePO4', 'NMC'],
  cellCount: '4S',
  continuousCurrent: 60,
  peakCurrent: 120,
  balanceCurrent: 68,
  balanceMethod: 'passive',
  protections: [
    'Over-voltage',
    'Under-voltage',
    'Over-current',
    'Short circuit',
    'Temperature monitoring',
    'Cell balancing',
  ],
  communication: ['UART', 'Bluetooth', 'RS485 (optional)'],
  quiescentCurrent: 80,
  notes: [
    'Good smart BMS features',
    'Excellent app interface',
    'SOC tracking',
  ],
};

/**
 * Victron VE.Bus BMS
 */
export const VICTRON_VE_BMS: BMSSpec = {
  name: 'VE.Bus BMS',
  manufacturer: 'Victron Energy',
  productUrl: 'https://www.victronenergy.com/battery-management-systems/ve-bus-bms',
  price: 180,
  chemistry: ['LiFePO4'],
  cellCount: '4S',
  continuousCurrent: 400, // With appropriate cells
  peakCurrent: 600,
  balanceCurrent: 0, // External balancer
  balanceMethod: 'passive',
  protections: [
    'Over-voltage',
    'Under-voltage',
    'Pre-alarm signaling',
    'Remote on/off',
    'VE.Bus integration',
  ],
  communication: ['VE.Bus', 'VE.Direct'],
  quiescentCurrent: 500,
  notes: [
    'Premium Victron integration',
    'Works with MultiPlus/Quattro',
    'Remote monitoring via VRM',
    'Requires separate balancer',
  ],
};

// =============================================================================
// BATTERY SIZING CALCULATIONS
// =============================================================================

/**
 * Calculate battery requirements
 */
export function calculateBatteryRequirements(
  dailyLoadWh: number,
  daysAutonomy: number,
  depthOfDischarge: number,
  temperatureDerating: number = 1.0, // 1.0 = no derating
  agingFactor: number = 0.8 // Account for capacity loss
): {
  requiredCapacityWh: number;
  requiredCapacityAh12V: number;
  requiredCapacityAh24V: number;
  calculationBreakdown: string[];
} {
  const baseCapacity = dailyLoadWh * daysAutonomy;
  const dodAdjusted = baseCapacity / depthOfDischarge;
  const tempAdjusted = dodAdjusted / temperatureDerating;
  const agingAdjusted = tempAdjusted / agingFactor;

  return {
    requiredCapacityWh: Math.ceil(agingAdjusted),
    requiredCapacityAh12V: Math.ceil(agingAdjusted / 12),
    requiredCapacityAh24V: Math.ceil(agingAdjusted / 24),
    calculationBreakdown: [
      `Daily load: ${dailyLoadWh}Wh`,
      `Days autonomy: ${daysAutonomy}`,
      `Base capacity: ${baseCapacity}Wh`,
      `DoD adjusted (${depthOfDischarge * 100}%): ${Math.ceil(dodAdjusted)}Wh`,
      `Temp adjusted (${temperatureDerating}): ${Math.ceil(tempAdjusted)}Wh`,
      `Aging adjusted (${agingFactor * 100}%): ${Math.ceil(agingAdjusted)}Wh`,
    ],
  };
}

/**
 * Calculate parallel battery configuration
 */
export function calculateBatteryParallel(
  requiredAh: number,
  availableBatteryAh: number
): {
  batteriesNeeded: number;
  totalAh: number;
  margin: number;
} {
  const batteriesNeeded = Math.ceil(requiredAh / availableBatteryAh);
  const totalAh = batteriesNeeded * availableBatteryAh;
  const margin = ((totalAh - requiredAh) / requiredAh) * 100;

  return {
    batteriesNeeded,
    totalAh,
    margin: Math.round(margin),
  };
}

/**
 * Temperature derating factors for batteries
 */
export const TEMPERATURE_DERATING: Record<string, Record<string, number>> = {
  LiFePO4: {
    '-20C': 0.6,
    '-10C': 0.7,
    '0C': 0.85,
    '10C': 0.95,
    '25C': 1.0,
    '40C': 0.95,
    '50C': 0.85,
  },
  AGM: {
    '-20C': 0.5,
    '-10C': 0.6,
    '0C': 0.75,
    '10C': 0.9,
    '25C': 1.0,
    '40C': 1.0,
    '50C': 0.95,
  },
  NMC: {
    '0C': 0.7,
    '10C': 0.85,
    '25C': 1.0,
    '40C': 0.9,
    '45C': 0.8,
  },
};

// =============================================================================
// BATTERY MONITORING
// =============================================================================

/**
 * Battery monitor specification
 */
export interface BatteryMonitorSpec {
  name: string;
  manufacturer: string;
  productUrl: string;
  price: number;
  features: string[];
  accuracy: {
    voltage: string;
    current: string;
    soc: string;
  };
  interface: string[];
  notes: string[];
}

/**
 * Victron BMV-712
 */
export const VICTRON_BMV712: BatteryMonitorSpec = {
  name: 'BMV-712 Smart',
  manufacturer: 'Victron Energy',
  productUrl: 'https://www.victronenergy.com/battery-monitors/bmv-712-smart',
  price: 180,
  features: [
    'Voltage monitoring',
    'Current monitoring',
    'State of charge',
    'Time remaining',
    'Historical data',
    'Programmable relay',
    'Temperature sensor option',
  ],
  accuracy: {
    voltage: '0.01V',
    current: '0.01A',
    soc: '1%',
  },
  interface: ['Bluetooth', 'VE.Direct'],
  notes: [
    'Industry standard monitor',
    'Excellent app interface',
    'Integrates with Victron ecosystem',
  ],
};

/**
 * Budget shunt monitor
 */
export const BUDGET_SHUNT_MONITOR: BatteryMonitorSpec = {
  name: 'DC 0-300V Battery Monitor',
  manufacturer: 'Generic',
  productUrl: 'https://www.amazon.com/s?k=battery+monitor+shunt',
  price: 25,
  features: [
    'Voltage display',
    'Current display',
    'Power display',
    'Ah counter',
  ],
  accuracy: {
    voltage: '0.1V',
    current: '0.1A',
    soc: 'Manual calibration required',
  },
  interface: ['Display only'],
  notes: [
    'Basic monitoring',
    'No remote access',
    'Good for simple setups',
  ],
};

// =============================================================================
// EXPORTS
// =============================================================================

export const BATTERY_SYSTEMS = {
  chemistry: {
    LiFePO4: LIFEPO4_CHEMISTRY,
    AGM: AGM_CHEMISTRY,
    NMC: NMC_CHEMISTRY,
  },
  bms: {
    DALY_4S_100A,
    JBD_4S_60A,
    VICTRON_VE_BMS,
  },
  monitors: {
    VICTRON_BMV712,
    BUDGET_SHUNT_MONITOR,
  },
  derating: TEMPERATURE_DERATING,
};
