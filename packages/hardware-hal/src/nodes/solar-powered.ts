/**
 * Solar-Powered Node Specifications
 *
 * Complete solar power system specifications for off-grid mesh network nodes.
 * Includes real solar panels, charge controllers, and battery recommendations.
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications. Solar installations should follow local
 * electrical codes and may require permits.
 *
 * Sources:
 * - Victron Energy: https://www.victronenergy.com/
 * - Renogy: https://www.renogy.com/
 * - Genasun: https://www.genasun.com/
 * - BatteryUniversity: https://batteryuniversity.com/
 *
 * @module @chicago-forest/hardware-hal/nodes/solar-powered
 */

// =============================================================================
// SOLAR POWER SYSTEM COMPONENTS
// =============================================================================

/**
 * Solar panel specification
 */
export interface SolarPanelSpec {
  /** Product name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Product URL */
  productUrl: string;
  /** Price (USD) */
  price: number;
  /** Panel type */
  type: SolarPanelType;
  /** Rated power (Watts) */
  ratedPower: number;
  /** Open circuit voltage (Voc) */
  voc: number;
  /** Maximum power voltage (Vmp) */
  vmp: number;
  /** Short circuit current (Isc) */
  isc: number;
  /** Maximum power current (Imp) */
  imp: number;
  /** Efficiency (%) */
  efficiency: number;
  /** Dimensions (mm) */
  dimensions: { width: number; height: number; depth: number };
  /** Weight (kg) */
  weight: number;
  /** Temperature coefficient (%/C) */
  tempCoefficient: number;
  /** Warranty (years) */
  warranty: number;
  /** Use case */
  useCase: string;
}

export type SolarPanelType =
  | 'monocrystalline'
  | 'polycrystalline'
  | 'thin-film'
  | 'flexible';

/**
 * Renogy 100W Monocrystalline
 * https://www.renogy.com/100-watt-12-volt-monocrystalline-solar-panel/
 */
export const RENOGY_100W_MONO: SolarPanelSpec = {
  name: '100W 12V Monocrystalline',
  manufacturer: 'Renogy',
  productUrl: 'https://www.renogy.com/100-watt-12-volt-monocrystalline-solar-panel/',
  price: 95,
  type: 'monocrystalline',
  ratedPower: 100,
  voc: 22.3,
  vmp: 18.9,
  isc: 5.75,
  imp: 5.29,
  efficiency: 21.0,
  dimensions: { width: 1066, height: 508, depth: 35 },
  weight: 7.3,
  tempCoefficient: -0.35,
  warranty: 25,
  useCase: 'Medium mesh node, ~20-30Wh daily load',
};

/**
 * Renogy 50W Monocrystalline
 * https://www.renogy.com/50-watt-12-volt-monocrystalline-solar-panel/
 */
export const RENOGY_50W_MONO: SolarPanelSpec = {
  name: '50W 12V Monocrystalline',
  manufacturer: 'Renogy',
  productUrl: 'https://www.renogy.com/50-watt-12-volt-monocrystalline-solar-panel/',
  price: 60,
  type: 'monocrystalline',
  ratedPower: 50,
  voc: 22.6,
  vmp: 18.4,
  isc: 2.96,
  imp: 2.72,
  efficiency: 21.0,
  dimensions: { width: 630, height: 545, depth: 30 },
  weight: 4.0,
  tempCoefficient: -0.35,
  warranty: 25,
  useCase: 'Small mesh node, Meshtastic relay',
};

/**
 * Voltaic 6W USB Panel
 * https://voltaicsystems.com/6-watt-panel/
 */
export const VOLTAIC_6W: SolarPanelSpec = {
  name: '6W USB Solar Panel',
  manufacturer: 'Voltaic Systems',
  productUrl: 'https://voltaicsystems.com/6-watt-panel/',
  price: 69,
  type: 'monocrystalline',
  ratedPower: 6,
  voc: 6.6,
  vmp: 5.5,
  isc: 1.2,
  imp: 1.1,
  efficiency: 22.0,
  dimensions: { width: 175, height: 280, depth: 6 },
  weight: 0.35,
  tempCoefficient: -0.4,
  warranty: 10,
  useCase: 'Meshtastic node, Pi Zero, low-power IoT',
};

/**
 * Flexible panel for curved surfaces
 */
export const RENOGY_100W_FLEX: SolarPanelSpec = {
  name: '100W 12V Flexible Panel',
  manufacturer: 'Renogy',
  productUrl: 'https://www.renogy.com/100-watt-12-volt-flexible-monocrystalline-solar-panel/',
  price: 140,
  type: 'flexible',
  ratedPower: 100,
  voc: 21.6,
  vmp: 18.0,
  isc: 6.39,
  imp: 5.56,
  efficiency: 22.0,
  dimensions: { width: 1194, height: 536, depth: 2.5 },
  weight: 2.0,
  tempCoefficient: -0.35,
  warranty: 5,
  useCase: 'Curved mounting, lightweight requirements',
};

// =============================================================================
// CHARGE CONTROLLERS
// =============================================================================

/**
 * Solar charge controller specification
 */
export interface ChargeControllerSpec {
  /** Product name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Product URL */
  productUrl: string;
  /** Price (USD) */
  price: number;
  /** Controller type */
  type: ControllerType;
  /** Max solar input voltage (V) */
  maxInputVoltage: number;
  /** Max charge current (A) */
  maxCurrent: number;
  /** System voltages supported */
  systemVoltages: number[];
  /** Max solar wattage per voltage */
  maxSolarWatts: Record<number, number>;
  /** Battery types supported */
  batteryTypes: BatteryType[];
  /** Features */
  features: string[];
  /** Efficiency (%) */
  efficiency: number;
  /** Self consumption (mA) */
  selfConsumption: number;
  /** Operating temperature (C) */
  operatingTemp: { min: number; max: number };
  /** Notes */
  notes: string[];
}

export type ControllerType = 'PWM' | 'MPPT';
export type BatteryType = 'lead-acid' | 'agm' | 'gel' | 'lifepo4' | 'lithium-ion';

/**
 * Victron SmartSolar 75/15
 * https://www.victronenergy.com/solar-charge-controllers/smartsolar-mppt-75-10-75-15-100-15-100-20
 */
export const VICTRON_75_15: ChargeControllerSpec = {
  name: 'SmartSolar MPPT 75/15',
  manufacturer: 'Victron Energy',
  productUrl: 'https://www.victronenergy.com/solar-charge-controllers/smartsolar-mppt-75-10-75-15-100-15-100-20',
  price: 120,
  type: 'MPPT',
  maxInputVoltage: 75,
  maxCurrent: 15,
  systemVoltages: [12, 24],
  maxSolarWatts: { 12: 220, 24: 440 },
  batteryTypes: ['lead-acid', 'agm', 'gel', 'lifepo4'],
  features: [
    'Bluetooth built-in',
    'VictronConnect app',
    'Load output',
    'Battery temperature sensor option',
    'Programmable LED',
  ],
  efficiency: 98,
  selfConsumption: 10, // 10mA
  operatingTemp: { min: -30, max: 60 },
  notes: [
    'Excellent for mesh node deployments',
    'Bluetooth monitoring via app',
    'Ultra-low self consumption',
    '5-year warranty',
  ],
};

/**
 * Genasun GV-5 LiFePO4
 * https://www.genasun.com/solar-charge-controllers
 */
export const GENASUN_GV5: ChargeControllerSpec = {
  name: 'GV-5 MPPT Controller',
  manufacturer: 'Genasun',
  productUrl: 'https://www.genasun.com/solar-charge-controllers',
  price: 90,
  type: 'MPPT',
  maxInputVoltage: 50,
  maxCurrent: 5,
  systemVoltages: [12, 14.4], // LiFePO4 specific
  maxSolarWatts: { 12: 65 },
  batteryTypes: ['lifepo4'],
  features: [
    'Optimized for LiFePO4',
    'No load output (direct connection)',
    'Potted electronics',
    'Weatherproof design',
  ],
  efficiency: 96,
  selfConsumption: 4, // Ultra-low
  operatingTemp: { min: -40, max: 85 },
  notes: [
    'Best for small LiFePO4 systems',
    'Extremely robust',
    'Set and forget operation',
    'Very low quiescent draw',
  ],
};

/**
 * Budget PWM controller
 */
export const RENOGY_WANDERER: ChargeControllerSpec = {
  name: 'Wanderer 10A PWM',
  manufacturer: 'Renogy',
  productUrl: 'https://www.renogy.com/wanderer-10a-pwm-charge-controller/',
  price: 20,
  type: 'PWM',
  maxInputVoltage: 25,
  maxCurrent: 10,
  systemVoltages: [12],
  maxSolarWatts: { 12: 130 },
  batteryTypes: ['lead-acid', 'agm', 'gel'],
  features: [
    'LCD display',
    'Load output',
    'Temperature compensation',
    'USB output (5V/2A)',
  ],
  efficiency: 85,
  selfConsumption: 15,
  operatingTemp: { min: -25, max: 55 },
  notes: [
    'Budget option for simple setups',
    'PWM less efficient than MPPT',
    'Good for matched panel voltage',
    'USB output useful for small loads',
  ],
};

// =============================================================================
// BATTERIES
// =============================================================================

/**
 * Battery specification
 */
export interface BatterySpec {
  /** Product name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Product URL */
  productUrl: string;
  /** Price (USD) */
  price: number;
  /** Battery chemistry */
  chemistry: BatteryType;
  /** Nominal voltage (V) */
  voltage: number;
  /** Capacity (Ah) */
  capacity: number;
  /** Energy (Wh) */
  energy: number;
  /** Cycle life (cycles to 80% DoD) */
  cycleLife: number;
  /** Max discharge rate (C) */
  maxDischargeRate: number;
  /** Dimensions (mm) */
  dimensions: { width: number; height: number; depth: number };
  /** Weight (kg) */
  weight: number;
  /** Operating temperature (C) */
  operatingTemp: { min: number; max: number };
  /** Built-in BMS */
  hasBMS: boolean;
  /** Notes */
  notes: string[];
}

/**
 * Battleborn 50Ah LiFePO4
 * https://battlebornbatteries.com/product/50-ah-12v-lifepo4-deep-cycle-battery/
 */
export const BATTLEBORN_50AH: BatterySpec = {
  name: '50Ah 12V LiFePO4',
  manufacturer: 'Battle Born',
  productUrl: 'https://battlebornbatteries.com/product/50-ah-12v-lifepo4-deep-cycle-battery/',
  price: 550,
  chemistry: 'lifepo4',
  voltage: 12.8,
  capacity: 50,
  energy: 640,
  cycleLife: 3000,
  maxDischargeRate: 0.5, // 25A continuous
  dimensions: { width: 197, height: 131, depth: 167 },
  weight: 6.8,
  operatingTemp: { min: -20, max: 60 },
  hasBMS: true,
  notes: [
    'Premium LiFePO4 with integrated BMS',
    '10-year warranty',
    'Safe chemistry, no thermal runaway',
    'Excellent for solar cycling',
  ],
};

/**
 * Budget LiFePO4 option
 */
export const AMPERE_TIME_12AH: BatterySpec = {
  name: '12Ah 12V LiFePO4',
  manufacturer: 'Ampere Time',
  productUrl: 'https://www.amperetime.com/products/ampere-time-12v-12ah-lithium-lifepo4-battery',
  price: 60,
  chemistry: 'lifepo4',
  voltage: 12.8,
  capacity: 12,
  energy: 153.6,
  cycleLife: 4000,
  maxDischargeRate: 1.0, // 12A continuous
  dimensions: { width: 150, height: 65, depth: 95 },
  weight: 1.4,
  operatingTemp: { min: 0, max: 50 },
  hasBMS: true,
  notes: [
    'Compact and affordable',
    'Good for small nodes',
    'Built-in BMS',
    'Perfect for Pi + LoRa setups',
  ],
};

/**
 * AGM battery for budget builds
 */
export const UNIVERSAL_UB12180: BatterySpec = {
  name: 'UB12180 AGM Battery',
  manufacturer: 'Universal Power Group',
  productUrl: 'https://www.amazon.com/Universal-UB12180-Sealed-Lead-Battery/dp/B00A82A2ZS',
  price: 45,
  chemistry: 'agm',
  voltage: 12,
  capacity: 18,
  energy: 216,
  cycleLife: 300, // At 50% DoD
  maxDischargeRate: 0.3, // 5.4A
  dimensions: { width: 181, height: 167, depth: 76 },
  weight: 5.5,
  operatingTemp: { min: -20, max: 60 },
  hasBMS: false,
  notes: [
    'Budget option, widely available',
    'Heavier than lithium',
    'Shorter cycle life',
    'Requires charge controller protection',
  ],
};

/**
 * 18650 pack option (DIY)
 */
export const DIY_18650_PACK: BatterySpec = {
  name: 'DIY 3S4P 18650 Pack',
  manufacturer: 'DIY Build',
  productUrl: 'https://batteryhookup.com/',
  price: 40, // Cells only
  chemistry: 'lithium-ion',
  voltage: 11.1,
  capacity: 12, // 4 x 3Ah cells
  energy: 133,
  cycleLife: 500,
  maxDischargeRate: 2.0,
  dimensions: { width: 75, height: 70, depth: 70 },
  weight: 0.6,
  operatingTemp: { min: 0, max: 45 },
  hasBMS: false, // Need to add
  notes: [
    'REQUIRES BMS MODULE',
    'Advanced build - fire risk if improper',
    'Use quality cells (Samsung, LG, Panasonic)',
    'Spot welder recommended',
  ],
};

// =============================================================================
// COMPLETE SOLAR KITS
// =============================================================================

/**
 * Complete solar power system specification
 */
export interface SolarSystemSpec {
  /** System name */
  name: string;
  /** Description */
  description: string;
  /** Target daily energy (Wh) */
  targetDailyEnergy: number;
  /** Days of autonomy */
  daysOfAutonomy: number;
  /** Solar panel */
  panel: SolarPanelSpec;
  /** Panel quantity */
  panelQuantity: number;
  /** Charge controller */
  controller: ChargeControllerSpec;
  /** Battery */
  battery: BatterySpec;
  /** Battery quantity */
  batteryQuantity: number;
  /** Total system cost (USD) */
  totalCost: number;
  /** Suitable for */
  suitableFor: string[];
  /** Design notes */
  designNotes: string[];
}

/**
 * Meshtastic/LoRa relay solar kit
 */
export const MESHTASTIC_SOLAR_KIT: SolarSystemSpec = {
  name: 'Meshtastic Solar Kit',
  description: 'Complete solar power for Meshtastic relay node',
  targetDailyEnergy: 20, // ~2W average = 48Wh/day, but 20Wh usable with margin
  daysOfAutonomy: 3,
  panel: VOLTAIC_6W,
  panelQuantity: 1,
  controller: GENASUN_GV5,
  battery: AMPERE_TIME_12AH,
  batteryQuantity: 1,
  totalCost: 220,
  suitableFor: [
    'Meshtastic relay',
    'LoRa gateway (low duty)',
    'Weather station',
    'Remote sensor',
  ],
  designNotes: [
    'Sized for ~2W continuous load',
    '6W panel provides 3x typical consumption',
    '12Ah battery provides 3+ days backup',
    'Works in partial shade with lower output',
  ],
};

/**
 * Raspberry Pi mesh node solar kit
 */
export const PI_MESH_SOLAR_KIT: SolarSystemSpec = {
  name: 'Pi Mesh Node Solar Kit',
  description: 'Solar power for Raspberry Pi 4 mesh node',
  targetDailyEnergy: 100, // ~8W with radio = 192Wh/day, size for margin
  daysOfAutonomy: 2,
  panel: RENOGY_100W_MONO,
  panelQuantity: 1,
  controller: VICTRON_75_15,
  battery: BATTLEBORN_50AH,
  batteryQuantity: 1,
  totalCost: 800,
  suitableFor: [
    'Raspberry Pi 4 mesh gateway',
    'OpenWRT router node',
    'LoRaWAN gateway',
    'WiFi repeater',
  ],
  designNotes: [
    'Sized for 8-10W continuous load',
    '100W panel provides 4-5 hours peak charging',
    '50Ah LiFePO4 provides 2+ days autonomy',
    'Consider adding second panel in cloudy regions',
  ],
};

/**
 * Budget mesh node solar kit
 */
export const BUDGET_MESH_SOLAR_KIT: SolarSystemSpec = {
  name: 'Budget Mesh Solar Kit',
  description: 'Affordable solar for Pi Zero/low-power mesh',
  targetDailyEnergy: 30,
  daysOfAutonomy: 3,
  panel: RENOGY_50W_MONO,
  panelQuantity: 1,
  controller: RENOGY_WANDERER,
  battery: UNIVERSAL_UB12180,
  batteryQuantity: 1,
  totalCost: 125,
  suitableFor: [
    'Raspberry Pi Zero mesh node',
    'Basic WiFi repeater',
    'LoRa relay',
    'Educational projects',
  ],
  designNotes: [
    'Budget option with compromises',
    'AGM battery has shorter life than LiFePO4',
    'PWM controller less efficient',
    'Good for learning/testing',
  ],
};

// =============================================================================
// SOLAR CALCULATIONS
// =============================================================================

/**
 * Calculate required solar panel size
 */
export function calculateSolarRequirements(
  dailyLoadWh: number,
  peakSunHours: number,
  systemEfficiency: number = 0.85,
  daysAutonomy: number = 2,
  maxDepthOfDischarge: number = 0.8
): {
  panelWatts: number;
  batteryWh: number;
  batteryAh12V: number;
  notes: string[];
} {
  // Account for system losses
  const adjustedLoad = dailyLoadWh / systemEfficiency;

  // Panel sizing
  const panelWatts = Math.ceil(adjustedLoad / peakSunHours);

  // Battery sizing
  const batteryWh = Math.ceil((dailyLoadWh * daysAutonomy) / maxDepthOfDischarge);
  const batteryAh12V = Math.ceil(batteryWh / 12);

  return {
    panelWatts,
    batteryWh,
    batteryAh12V,
    notes: [
      `Based on ${dailyLoadWh}Wh daily consumption`,
      `Assumes ${peakSunHours} peak sun hours per day`,
      `${systemEfficiency * 100}% system efficiency assumed`,
      `${daysAutonomy} days autonomy with ${maxDepthOfDischarge * 100}% DoD`,
    ],
  };
}

/**
 * Peak sun hours by US region (annual average)
 */
export const US_PEAK_SUN_HOURS: Record<string, number> = {
  southwest: 6.0,  // Arizona, Nevada, SoCal
  southeast: 4.5,  // Florida, Georgia
  midwest: 4.0,    // Illinois, Ohio
  northeast: 3.5,  // New York, Massachusetts
  northwest: 3.0,  // Washington, Oregon
  chicago: 3.8,    // Chicago specific
};

/**
 * Estimate battery runtime
 */
export function estimateBatteryRuntime(
  batteryWh: number,
  loadWatts: number,
  depthOfDischarge: number = 0.8,
  efficiency: number = 0.9
): {
  runtimeHours: number;
  runtimeDays: number;
} {
  const usableWh = batteryWh * depthOfDischarge * efficiency;
  const runtimeHours = usableWh / loadWatts;

  return {
    runtimeHours: Math.round(runtimeHours * 10) / 10,
    runtimeDays: Math.round((runtimeHours / 24) * 10) / 10,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const SOLAR_SPECS = {
  panels: {
    RENOGY_100W_MONO,
    RENOGY_50W_MONO,
    VOLTAIC_6W,
    RENOGY_100W_FLEX,
  },
  controllers: {
    VICTRON_75_15,
    GENASUN_GV5,
    RENOGY_WANDERER,
  },
  batteries: {
    BATTLEBORN_50AH,
    AMPERE_TIME_12AH,
    UNIVERSAL_UB12180,
    DIY_18650_PACK,
  },
  kits: {
    MESHTASTIC: MESHTASTIC_SOLAR_KIT,
    PI_MESH: PI_MESH_SOLAR_KIT,
    BUDGET: BUDGET_MESH_SOLAR_KIT,
  },
  peakSunHours: US_PEAK_SUN_HOURS,
};
