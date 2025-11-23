/**
 * Solar Panel Specifications (Extended)
 *
 * Extended solar panel specifications and selection helpers for
 * mesh network deployments. Supplements the solar-powered nodes module.
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications. Solar installations should comply with
 * local codes and regulations.
 *
 * Sources:
 * - EnergySage: https://www.energysage.com/
 * - NREL PVWatts: https://pvwatts.nrel.gov/
 * - SolarEdge: https://www.solaredge.com/
 *
 * @module @chicago-forest/hardware-hal/power/solar-specs
 */

// =============================================================================
// SOLAR IRRADIANCE DATA
// =============================================================================

/**
 * Monthly solar irradiance data (kWh/m2/day)
 */
export interface MonthlyIrradiance {
  month: string;
  irradiance: number;
}

/**
 * Chicago solar irradiance (41.88N, -87.63W)
 * Data from NREL PVWatts
 */
export const CHICAGO_SOLAR_DATA: MonthlyIrradiance[] = [
  { month: 'January', irradiance: 2.0 },
  { month: 'February', irradiance: 2.8 },
  { month: 'March', irradiance: 3.7 },
  { month: 'April', irradiance: 4.5 },
  { month: 'May', irradiance: 5.3 },
  { month: 'June', irradiance: 5.8 },
  { month: 'July', irradiance: 5.7 },
  { month: 'August', irradiance: 5.2 },
  { month: 'September', irradiance: 4.2 },
  { month: 'October', irradiance: 3.1 },
  { month: 'November', irradiance: 2.1 },
  { month: 'December', irradiance: 1.7 },
];

/**
 * US city solar data averages (annual peak sun hours)
 */
export const US_CITY_SOLAR_DATA: Record<string, { lat: number; peakSunHours: number; worstMonth: number }> = {
  chicago: { lat: 41.88, peakSunHours: 3.8, worstMonth: 1.7 },
  phoenix: { lat: 33.45, peakSunHours: 6.5, worstMonth: 4.5 },
  seattle: { lat: 47.61, peakSunHours: 3.2, worstMonth: 1.2 },
  miami: { lat: 25.76, peakSunHours: 5.2, worstMonth: 4.0 },
  denver: { lat: 39.74, peakSunHours: 5.5, worstMonth: 3.5 },
  boston: { lat: 42.36, peakSunHours: 3.5, worstMonth: 1.8 },
  losAngeles: { lat: 34.05, peakSunHours: 5.6, worstMonth: 3.8 },
  newYork: { lat: 40.71, peakSunHours: 3.6, worstMonth: 1.9 },
  austin: { lat: 30.27, peakSunHours: 5.0, worstMonth: 3.2 },
  minneapolis: { lat: 44.98, peakSunHours: 3.6, worstMonth: 1.5 },
};

// =============================================================================
// PANEL ORIENTATION
// =============================================================================

/**
 * Calculate optimal solar panel tilt angle for a given latitude
 * Rule of thumb: tilt = latitude for year-round optimization
 */
export function calculateOptimalSolarTilt(latitude: number): {
  yearRound: number;
  winterOptimized: number;
  summerOptimized: number;
} {
  return {
    yearRound: Math.abs(latitude),
    winterOptimized: Math.abs(latitude) + 15, // Steeper for winter sun
    summerOptimized: Math.abs(latitude) - 15, // Flatter for summer sun
  };
}

/**
 * Calculate panel output adjustment for non-optimal orientation
 */
export function calculateOrientationLoss(
  actualTilt: number,
  optimalTilt: number,
  actualAzimuth: number, // 180 = South in northern hemisphere
  optimalAzimuth: number = 180
): {
  lossPercent: number;
  effectiveOutput: number; // Multiplier 0-1
} {
  // Simplified loss calculation
  // Real calculation would use cosine of incident angle
  const tiltDiff = Math.abs(actualTilt - optimalTilt);
  const azimuthDiff = Math.abs(actualAzimuth - optimalAzimuth);

  // Approximate losses (simplified)
  const tiltLoss = Math.min(tiltDiff * 0.5, 25); // Up to 25% loss
  const azimuthLoss = Math.min(azimuthDiff * 0.1, 30); // Up to 30% loss

  const totalLoss = Math.min(tiltLoss + azimuthLoss, 50); // Cap at 50%
  return {
    lossPercent: totalLoss,
    effectiveOutput: (100 - totalLoss) / 100,
  };
}

// =============================================================================
// SOLAR SIZING FOR MESH NODES
// =============================================================================

/**
 * Common mesh node power profiles
 */
export interface PowerProfile {
  name: string;
  description: string;
  avgPowerWatts: number;
  peakPowerWatts: number;
  dailyEnergyWh: number;
  dutyCycle: number; // 0-1
}

export const POWER_PROFILES: Record<string, PowerProfile> = {
  meshtastic_relay: {
    name: 'Meshtastic Relay',
    description: 'T-Beam or similar LoRa mesh relay',
    avgPowerWatts: 1.5,
    peakPowerWatts: 3,
    dailyEnergyWh: 36,
    dutyCycle: 0.1, // Mostly sleeping
  },
  meshtastic_router: {
    name: 'Meshtastic Router',
    description: 'Always-on mesh router node',
    avgPowerWatts: 2.5,
    peakPowerWatts: 4,
    dailyEnergyWh: 60,
    dutyCycle: 1.0, // Always on
  },
  pi_zero_lora: {
    name: 'Pi Zero + LoRa',
    description: 'Raspberry Pi Zero with LoRa HAT',
    avgPowerWatts: 3,
    peakPowerWatts: 5,
    dailyEnergyWh: 72,
    dutyCycle: 1.0,
  },
  pi4_mesh_gateway: {
    name: 'Pi 4 Mesh Gateway',
    description: 'Full Raspberry Pi 4 mesh gateway',
    avgPowerWatts: 8,
    peakPowerWatts: 15,
    dailyEnergyWh: 192,
    dutyCycle: 1.0,
  },
  openwrt_mesh_node: {
    name: 'OpenWRT Mesh Node',
    description: 'GL.iNet or similar OpenWRT router',
    avgPowerWatts: 6,
    peakPowerWatts: 10,
    dailyEnergyWh: 144,
    dutyCycle: 1.0,
  },
  lorawan_gateway: {
    name: 'LoRaWAN Gateway',
    description: 'Full 8-channel LoRaWAN gateway',
    avgPowerWatts: 7,
    peakPowerWatts: 12,
    dailyEnergyWh: 168,
    dutyCycle: 1.0,
  },
  wifi_repeater: {
    name: 'WiFi Repeater',
    description: 'Outdoor WiFi repeater/AP',
    avgPowerWatts: 10,
    peakPowerWatts: 18,
    dailyEnergyWh: 240,
    dutyCycle: 1.0,
  },
  ubiquiti_ptp: {
    name: 'Ubiquiti PtP Link',
    description: 'LiteBeam or PowerBeam PtP radio',
    avgPowerWatts: 8,
    peakPowerWatts: 12,
    dailyEnergyWh: 192,
    dutyCycle: 1.0,
  },
};

/**
 * Calculate complete solar system requirements
 */
export function calculateSolarSystem(
  profile: PowerProfile,
  city: string,
  daysAutonomy: number = 3,
  systemEfficiency: number = 0.85,
  batteryDoD: number = 0.8
): {
  recommendedPanelWatts: number;
  recommendedBatteryWh: number;
  recommendedBatteryAh: number; // At 12V
  designNotes: string[];
  winterMargin: number; // Percentage
  summerExcess: number; // Percentage
} {
  const cityData = US_CITY_SOLAR_DATA[city] || US_CITY_SOLAR_DATA.chicago;

  // Size for worst month (winter)
  const dailyEnergyNeeded = profile.dailyEnergyWh / systemEfficiency;
  const panelWatts = Math.ceil(dailyEnergyNeeded / cityData.worstMonth);

  // Battery sizing
  const batteryWh = Math.ceil((profile.dailyEnergyWh * daysAutonomy) / batteryDoD);
  const batteryAh = Math.ceil(batteryWh / 12);

  // Calculate margins
  const winterProduction = panelWatts * cityData.worstMonth * systemEfficiency;
  const summerProduction = panelWatts * cityData.peakSunHours * systemEfficiency;

  const winterMargin = ((winterProduction - profile.dailyEnergyWh) / profile.dailyEnergyWh) * 100;
  const summerExcess = ((summerProduction - profile.dailyEnergyWh) / profile.dailyEnergyWh) * 100;

  return {
    recommendedPanelWatts: panelWatts,
    recommendedBatteryWh: batteryWh,
    recommendedBatteryAh: batteryAh,
    designNotes: [
      `Designed for ${profile.name} in ${city}`,
      `Daily consumption: ${profile.dailyEnergyWh}Wh`,
      `Sized for worst month: ${cityData.worstMonth} peak sun hours`,
      `System efficiency: ${systemEfficiency * 100}%`,
      `Battery sized for ${daysAutonomy} days at ${batteryDoD * 100}% DoD`,
    ],
    winterMargin: Math.round(winterMargin),
    summerExcess: Math.round(summerExcess),
  };
}

// =============================================================================
// PANEL SELECTION
// =============================================================================

/**
 * Panel size recommendations
 */
export const PANEL_SIZE_GUIDE: Record<string, { minWatts: number; maxWatts: number; notes: string }> = {
  '0-50': {
    minWatts: 6,
    maxWatts: 20,
    notes: 'Meshtastic nodes, sensors, very low power devices',
  },
  '50-100': {
    minWatts: 20,
    maxWatts: 50,
    notes: 'Pi Zero, small LoRa gateways, low-duty applications',
  },
  '100-200': {
    minWatts: 50,
    maxWatts: 100,
    notes: 'Pi 4, OpenWRT routers, WiFi repeaters',
  },
  '200-400': {
    minWatts: 100,
    maxWatts: 200,
    notes: 'Multiple devices, high-power radios, backhaul',
  },
  '400+': {
    minWatts: 200,
    maxWatts: 400,
    notes: 'Full installations, multiple high-power nodes',
  },
};

/**
 * Common panel configurations
 */
export interface PanelConfiguration {
  name: string;
  panels: Array<{ watts: number; quantity: number }>;
  totalWatts: number;
  wiring: '12V-parallel' | '24V-series' | '24V-series-parallel';
  notes: string[];
}

export const PANEL_CONFIGS: PanelConfiguration[] = [
  {
    name: 'Single 50W',
    panels: [{ watts: 50, quantity: 1 }],
    totalWatts: 50,
    wiring: '12V-parallel',
    notes: ['Simple single panel setup', 'Good for small nodes'],
  },
  {
    name: 'Single 100W',
    panels: [{ watts: 100, quantity: 1 }],
    totalWatts: 100,
    wiring: '12V-parallel',
    notes: ['Most common for Pi mesh nodes', 'Single cable run'],
  },
  {
    name: 'Dual 100W Parallel',
    panels: [{ watts: 100, quantity: 2 }],
    totalWatts: 200,
    wiring: '12V-parallel',
    notes: ['Double current output', 'Faster charging', '12V system'],
  },
  {
    name: 'Dual 100W Series',
    panels: [{ watts: 100, quantity: 2 }],
    totalWatts: 200,
    wiring: '24V-series',
    notes: ['24V system voltage', 'Lower current losses', 'Longer wire runs'],
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export const SOLAR_EXTENDED_SPECS = {
  irradiance: {
    chicago: CHICAGO_SOLAR_DATA,
    cities: US_CITY_SOLAR_DATA,
  },
  profiles: POWER_PROFILES,
  panelGuide: PANEL_SIZE_GUIDE,
  panelConfigs: PANEL_CONFIGS,
};
