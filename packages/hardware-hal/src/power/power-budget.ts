/**
 * Power Budget Calculator
 *
 * Tools for calculating power budgets for mesh network nodes.
 * Includes component power consumption data and optimization strategies.
 *
 * DISCLAIMER: This is an AI-generated educational framework. Power
 * consumption values are typical estimates and may vary by specific
 * hardware revision and configuration.
 *
 * @module @chicago-forest/hardware-hal/power/power-budget
 */

// =============================================================================
// COMPONENT POWER CONSUMPTION
// =============================================================================

/**
 * Power consumption specification for a component
 */
export interface PowerConsumption {
  /** Component name */
  name: string;
  /** Category */
  category: ComponentCategory;
  /** Idle power (Watts) */
  idle: number;
  /** Active power (Watts) */
  active: number;
  /** Peak power (Watts) */
  peak: number;
  /** Sleep power (Watts) */
  sleep?: number;
  /** Duty cycle typical (0-1) */
  typicalDutyCycle: number;
  /** Notes */
  notes: string[];
}

export type ComponentCategory =
  | 'compute'       // SBC, router CPU
  | 'radio-wifi'    // WiFi radios
  | 'radio-lora'    // LoRa radios
  | 'radio-cellular'// LTE/5G
  | 'storage'       // SD, SSD, HDD
  | 'display'       // Screens, LEDs
  | 'sensor'        // Environmental sensors
  | 'peripheral'    // USB devices, etc.
  | 'power-system'; // Converters, UPS

/**
 * Common component power consumptions
 */
export const COMPONENT_POWER: Record<string, PowerConsumption> = {
  // Compute
  raspberry_pi_5: {
    name: 'Raspberry Pi 5 (4GB)',
    category: 'compute',
    idle: 3.0,
    active: 5.0,
    peak: 12.0,
    sleep: 0.5,
    typicalDutyCycle: 0.7,
    notes: ['Heavy compute increases power', 'Use governor to limit'],
  },
  raspberry_pi_4: {
    name: 'Raspberry Pi 4 (4GB)',
    category: 'compute',
    idle: 2.7,
    active: 4.0,
    peak: 7.5,
    sleep: 0.4,
    typicalDutyCycle: 0.6,
    notes: ['Lower power than Pi 5', 'Disable USB/HDMI to save power'],
  },
  raspberry_pi_zero_2w: {
    name: 'Raspberry Pi Zero 2 W',
    category: 'compute',
    idle: 0.4,
    active: 1.0,
    peak: 2.0,
    sleep: 0.1,
    typicalDutyCycle: 0.5,
    notes: ['Excellent for solar', 'Limited connectivity'],
  },
  glinet_mt3000: {
    name: 'GL.iNet MT3000',
    category: 'compute',
    idle: 4.0,
    active: 6.0,
    peak: 10.0,
    typicalDutyCycle: 0.8,
    notes: ['WiFi 6 router', 'CPU-bound tasks increase power'],
  },
  esp32: {
    name: 'ESP32 Module',
    category: 'compute',
    idle: 0.05,
    active: 0.24,
    peak: 0.5,
    sleep: 0.00001, // 10uA deep sleep
    typicalDutyCycle: 0.1,
    notes: ['Excellent for IoT', 'Deep sleep is key'],
  },

  // WiFi Radios
  wifi_2x2_ac: {
    name: '2x2 WiFi AC Radio',
    category: 'radio-wifi',
    idle: 1.0,
    active: 2.5,
    peak: 4.0,
    typicalDutyCycle: 0.5,
    notes: ['Power scales with TX', '5GHz uses more than 2.4GHz'],
  },
  wifi_4x4_ax: {
    name: '4x4 WiFi 6 Radio',
    category: 'radio-wifi',
    idle: 1.5,
    active: 4.0,
    peak: 6.0,
    typicalDutyCycle: 0.5,
    notes: ['Higher power for WiFi 6', 'Target wake time saves power'],
  },
  usb_wifi_adapter: {
    name: 'USB WiFi Adapter',
    category: 'radio-wifi',
    idle: 0.3,
    active: 1.5,
    peak: 2.5,
    typicalDutyCycle: 0.4,
    notes: ['Additional adapter for mesh', 'Quality varies widely'],
  },

  // LoRa Radios
  lora_sx1262: {
    name: 'LoRa SX1262 Module',
    category: 'radio-lora',
    idle: 0.002, // 2mW
    active: 0.5, // TX @ 22dBm
    peak: 0.6,
    sleep: 0.0001, // 100uW
    typicalDutyCycle: 0.01, // Very low duty
    notes: ['Low duty cycle protocol', 'TX power dominates'],
  },
  lora_gateway_8ch: {
    name: '8-Channel LoRa Gateway',
    category: 'radio-lora',
    idle: 2.0,
    active: 3.5,
    peak: 5.0,
    typicalDutyCycle: 0.3,
    notes: ['Always listening', 'GPS adds ~0.1W'],
  },
  meshtastic_tbeam: {
    name: 'Meshtastic T-Beam',
    category: 'radio-lora',
    idle: 0.3,
    active: 1.5,
    peak: 2.5,
    sleep: 0.02,
    typicalDutyCycle: 0.1,
    notes: ['ESP32 + LoRa + GPS', 'Sleep mode important'],
  },

  // Cellular
  lte_modem: {
    name: 'LTE Modem (Quectel)',
    category: 'radio-cellular',
    idle: 0.5,
    active: 2.5,
    peak: 5.0,
    typicalDutyCycle: 0.3,
    notes: ['Varies with signal strength', 'Weak signal = more power'],
  },

  // Storage
  microsd_card: {
    name: 'MicroSD Card',
    category: 'storage',
    idle: 0.05,
    active: 0.2,
    peak: 0.3,
    typicalDutyCycle: 0.1,
    notes: ['Low power option', 'Write activity spikes'],
  },
  sata_ssd: {
    name: 'SATA SSD',
    category: 'storage',
    idle: 0.3,
    active: 2.0,
    peak: 3.0,
    typicalDutyCycle: 0.05,
    notes: ['Higher than SD', 'Use for intensive logging'],
  },

  // Power System
  dc_dc_converter: {
    name: 'DC-DC Buck Converter',
    category: 'power-system',
    idle: 0.05,
    active: 0.1,
    peak: 0.2,
    typicalDutyCycle: 1.0,
    notes: ['Quiescent current matters', 'Efficiency ~85-95%'],
  },
  poe_splitter: {
    name: 'PoE Splitter',
    category: 'power-system',
    idle: 0.5,
    active: 1.0,
    peak: 1.5,
    typicalDutyCycle: 1.0,
    notes: ['Conversion losses', 'Get efficient unit'],
  },
};

// =============================================================================
// POWER BUDGET CALCULATOR
// =============================================================================

/**
 * Power budget entry
 */
export interface PowerBudgetEntry {
  component: PowerConsumption;
  quantity: number;
  customDutyCycle?: number;
}

/**
 * Power budget result
 */
export interface PowerBudgetResult {
  /** Total idle power (W) */
  totalIdle: number;
  /** Total active power (W) */
  totalActive: number;
  /** Total peak power (W) */
  totalPeak: number;
  /** Weighted average power (W) */
  weightedAverage: number;
  /** Daily energy (Wh) */
  dailyEnergy: number;
  /** Component breakdown */
  breakdown: Array<{
    name: string;
    idle: number;
    active: number;
    weighted: number;
    percentage: number;
  }>;
  /** Optimization suggestions */
  suggestions: string[];
}

/**
 * Calculate power budget
 */
export function calculatePowerBudget(
  entries: PowerBudgetEntry[],
  systemEfficiency: number = 0.9
): PowerBudgetResult {
  let totalIdle = 0;
  let totalActive = 0;
  let totalPeak = 0;
  let weightedTotal = 0;

  const breakdown: PowerBudgetResult['breakdown'] = [];
  const suggestions: string[] = [];

  for (const entry of entries) {
    const { component, quantity, customDutyCycle } = entry;
    const dutyCycle = customDutyCycle ?? component.typicalDutyCycle;

    const idle = component.idle * quantity;
    const active = component.active * quantity;
    const peak = component.peak * quantity;
    const weighted = idle * (1 - dutyCycle) + active * dutyCycle;

    totalIdle += idle;
    totalActive += active;
    totalPeak += peak;
    weightedTotal += weighted;

    breakdown.push({
      name: component.name,
      idle,
      active,
      weighted,
      percentage: 0, // Calculate after totals
    });

    // Generate suggestions
    if (component.sleep !== undefined && component.sleep < component.idle * 0.1) {
      suggestions.push(`${component.name}: Consider sleep mode for ${Math.round((1 - dutyCycle) * 100)}% idle time savings`);
    }
  }

  // Calculate percentages
  for (const item of breakdown) {
    item.percentage = Math.round((item.weighted / weightedTotal) * 100);
  }

  // Sort by percentage descending
  breakdown.sort((a, b) => b.percentage - a.percentage);

  // Add general suggestions
  if (weightedTotal > 10) {
    suggestions.push('Consider lower-power alternatives for high consumption components');
  }

  // Account for system efficiency losses
  const adjustedWeighted = weightedTotal / systemEfficiency;
  const dailyEnergy = adjustedWeighted * 24;

  return {
    totalIdle,
    totalActive,
    totalPeak,
    weightedAverage: Math.round(adjustedWeighted * 100) / 100,
    dailyEnergy: Math.round(dailyEnergy),
    breakdown,
    suggestions,
  };
}

// =============================================================================
// PREDEFINED NODE BUDGETS
// =============================================================================

/**
 * Predefined power budgets for common node types
 */
export const PREDEFINED_BUDGETS: Record<string, PowerBudgetEntry[]> = {
  meshtastic_relay: [
    { component: COMPONENT_POWER.meshtastic_tbeam, quantity: 1, customDutyCycle: 0.1 },
  ],
  meshtastic_router: [
    { component: COMPONENT_POWER.meshtastic_tbeam, quantity: 1, customDutyCycle: 1.0 },
  ],
  pi_zero_lora: [
    { component: COMPONENT_POWER.raspberry_pi_zero_2w, quantity: 1 },
    { component: COMPONENT_POWER.lora_sx1262, quantity: 1 },
    { component: COMPONENT_POWER.microsd_card, quantity: 1 },
    { component: COMPONENT_POWER.dc_dc_converter, quantity: 1 },
  ],
  pi4_mesh_gateway: [
    { component: COMPONENT_POWER.raspberry_pi_4, quantity: 1 },
    { component: COMPONENT_POWER.usb_wifi_adapter, quantity: 1 },
    { component: COMPONENT_POWER.microsd_card, quantity: 1 },
  ],
  lorawan_gateway: [
    { component: COMPONENT_POWER.raspberry_pi_4, quantity: 1 },
    { component: COMPONENT_POWER.lora_gateway_8ch, quantity: 1 },
    { component: COMPONENT_POWER.microsd_card, quantity: 1 },
    { component: COMPONENT_POWER.poe_splitter, quantity: 1 },
  ],
  openwrt_mesh_node: [
    { component: COMPONENT_POWER.glinet_mt3000, quantity: 1 },
    { component: COMPONENT_POWER.wifi_2x2_ac, quantity: 1, customDutyCycle: 0.3 },
  ],
  cellular_backhaul: [
    { component: COMPONENT_POWER.raspberry_pi_4, quantity: 1 },
    { component: COMPONENT_POWER.lte_modem, quantity: 1 },
    { component: COMPONENT_POWER.microsd_card, quantity: 1 },
  ],
};

/**
 * Get power budget for predefined node type
 */
export function getPredefinedBudget(nodeType: keyof typeof PREDEFINED_BUDGETS): PowerBudgetResult {
  const entries = PREDEFINED_BUDGETS[nodeType];
  if (!entries) {
    throw new Error(`Unknown node type: ${nodeType}`);
  }
  return calculatePowerBudget(entries);
}

// =============================================================================
// POWER OPTIMIZATION STRATEGIES
// =============================================================================

/**
 * Power optimization strategy
 */
export interface PowerOptimization {
  name: string;
  description: string;
  savingsPercent: number;
  complexity: 'low' | 'medium' | 'high';
  applicableTo: ComponentCategory[];
  implementation: string[];
}

export const POWER_OPTIMIZATIONS: PowerOptimization[] = [
  {
    name: 'CPU Governor Tuning',
    description: 'Use powersave or ondemand governor',
    savingsPercent: 20,
    complexity: 'low',
    applicableTo: ['compute'],
    implementation: [
      'echo powersave > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor',
      'Or configure in /etc/default/cpufrequtils',
    ],
  },
  {
    name: 'Disable Unused Interfaces',
    description: 'Turn off HDMI, unused USB, Bluetooth',
    savingsPercent: 15,
    complexity: 'low',
    applicableTo: ['compute'],
    implementation: [
      '/usr/bin/tvservice -o # Disable HDMI',
      'Add dtoverlay=disable-bt to /boot/config.txt',
      'Unbind unused USB devices',
    ],
  },
  {
    name: 'WiFi Power Management',
    description: 'Enable power save mode on WiFi',
    savingsPercent: 30,
    complexity: 'medium',
    applicableTo: ['radio-wifi'],
    implementation: [
      'iw dev wlan0 set power_save on',
      'May increase latency',
    ],
  },
  {
    name: 'LoRa Duty Cycle Optimization',
    description: 'Reduce TX frequency, use appropriate SF',
    savingsPercent: 50,
    complexity: 'medium',
    applicableTo: ['radio-lora'],
    implementation: [
      'Use lowest SF that provides reliable links',
      'Reduce beacon/heartbeat frequency',
      'Enable sleep between transmissions',
    ],
  },
  {
    name: 'Scheduled Operation',
    description: 'Sleep during low-traffic hours',
    savingsPercent: 40,
    complexity: 'high',
    applicableTo: ['compute', 'radio-wifi', 'radio-lora'],
    implementation: [
      'Use RTC for scheduled wake',
      'Requires careful network design',
      'May miss messages during sleep',
    ],
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export const POWER_BUDGET = {
  components: COMPONENT_POWER,
  predefined: PREDEFINED_BUDGETS,
  optimizations: POWER_OPTIMIZATIONS,
  calculate: calculatePowerBudget,
  getPredefined: getPredefinedBudget,
};
