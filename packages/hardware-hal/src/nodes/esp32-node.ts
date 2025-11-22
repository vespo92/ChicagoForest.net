/**
 * ESP32 Node Specifications
 *
 * Hardware specifications for ESP32-based mesh network nodes.
 * Documents real ESP32 modules and development boards suitable for
 * Meshtastic, LoRa mesh, and WiFi mesh applications.
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications for community network planning.
 *
 * Sources:
 * - Espressif ESP32-S3 Datasheet: https://www.espressif.com/sites/default/files/documentation/esp32-s3_datasheet_en.pdf
 * - Espressif ESP32-C3 Datasheet: https://www.espressif.com/sites/default/files/documentation/esp32-c3_datasheet_en.pdf
 * - Meshtastic Supported Hardware: https://meshtastic.org/docs/hardware/
 *
 * @module @chicago-forest/hardware-hal/nodes/esp32-node
 */

// =============================================================================
// ESP32 CHIP SPECIFICATIONS
// =============================================================================

/**
 * ESP32 chip variant specification
 */
export interface ESP32ChipSpec {
  /** Chip model */
  model: string;
  /** Product URL */
  productUrl: string;
  /** CPU cores */
  cores: number;
  /** CPU architecture */
  architecture: 'Xtensa LX6' | 'Xtensa LX7' | 'RISC-V';
  /** Clock speed (MHz) */
  clockMhz: number;
  /** Internal SRAM (KB) */
  sramKb: number;
  /** Flash support (MB) */
  flashSupportMb: number[];
  /** PSRAM support (MB) */
  psramSupportMb: number[];
  /** WiFi standard */
  wifi: string;
  /** Bluetooth version */
  bluetooth: string;
  /** GPIO count */
  gpio: number;
  /** ADC channels */
  adcChannels: number;
  /** DAC channels */
  dacChannels: number;
  /** USB support */
  usb: 'none' | 'OTG' | 'Serial/JTAG';
  /** Operating voltage (V) */
  operatingVoltage: { min: number; max: number };
  /** Deep sleep current (uA) */
  deepSleepCurrentUa: number;
  /** Active current WiFi TX (mA) */
  activeCurrentMa: number;
  /** Best for use cases */
  bestFor: string[];
}

/**
 * ESP32-S3 - Latest flagship with AI acceleration
 * https://www.espressif.com/en/products/socs/esp32-s3
 */
export const ESP32_S3_SPEC: ESP32ChipSpec = {
  model: 'ESP32-S3',
  productUrl: 'https://www.espressif.com/en/products/socs/esp32-s3',
  cores: 2,
  architecture: 'Xtensa LX7',
  clockMhz: 240,
  sramKb: 512,
  flashSupportMb: [4, 8, 16],
  psramSupportMb: [2, 8],
  wifi: '802.11 b/g/n',
  bluetooth: 'BLE 5.0',
  gpio: 45,
  adcChannels: 20,
  dacChannels: 0,
  usb: 'OTG',
  operatingVoltage: { min: 3.0, max: 3.6 },
  deepSleepCurrentUa: 8,
  activeCurrentMa: 355,
  bestFor: ['Meshtastic', 'WiFi mesh', 'AI/ML edge', 'USB devices'],
};

/**
 * ESP32-C3 - RISC-V low cost option
 * https://www.espressif.com/en/products/socs/esp32-c3
 */
export const ESP32_C3_SPEC: ESP32ChipSpec = {
  model: 'ESP32-C3',
  productUrl: 'https://www.espressif.com/en/products/socs/esp32-c3',
  cores: 1,
  architecture: 'RISC-V',
  clockMhz: 160,
  sramKb: 400,
  flashSupportMb: [4],
  psramSupportMb: [],
  wifi: '802.11 b/g/n',
  bluetooth: 'BLE 5.0',
  gpio: 22,
  adcChannels: 6,
  dacChannels: 0,
  usb: 'Serial/JTAG',
  operatingVoltage: { min: 3.0, max: 3.6 },
  deepSleepCurrentUa: 5,
  activeCurrentMa: 320,
  bestFor: ['Low cost nodes', 'Simple sensors', 'BLE beacons'],
};

/**
 * ESP32 (original) - Widely deployed
 * https://www.espressif.com/en/products/socs/esp32
 */
export const ESP32_SPEC: ESP32ChipSpec = {
  model: 'ESP32',
  productUrl: 'https://www.espressif.com/en/products/socs/esp32',
  cores: 2,
  architecture: 'Xtensa LX6',
  clockMhz: 240,
  sramKb: 520,
  flashSupportMb: [4, 8, 16],
  psramSupportMb: [4, 8],
  wifi: '802.11 b/g/n',
  bluetooth: 'Classic + BLE 4.2',
  gpio: 34,
  adcChannels: 18,
  dacChannels: 2,
  usb: 'none',
  operatingVoltage: { min: 2.2, max: 3.6 },
  deepSleepCurrentUa: 10,
  activeCurrentMa: 260,
  bestFor: ['Legacy projects', 'Classic Bluetooth', 'Audio applications'],
};

// =============================================================================
// ESP32 DEVELOPMENT BOARDS
// =============================================================================

/**
 * ESP32 development board specification
 */
export interface ESP32BoardSpec {
  /** Board name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Product URL */
  productUrl: string;
  /** Price (USD) */
  price: number;
  /** ESP32 chip used */
  chip: 'ESP32' | 'ESP32-S3' | 'ESP32-C3';
  /** Flash size (MB) */
  flashMb: number;
  /** PSRAM size (MB) */
  psramMb: number;
  /** LoRa radio included */
  loraRadio?: {
    chip: 'SX1262' | 'SX1276' | 'SX1278';
    frequency: string;
    connector: 'U.FL' | 'SMA' | 'Integrated';
  };
  /** GPS included */
  gps?: {
    chip: string;
    antenna: 'Integrated' | 'U.FL' | 'SMA';
  };
  /** Display */
  display?: {
    type: 'OLED' | 'TFT' | 'E-Ink';
    size: string;
    resolution: string;
  };
  /** Battery support */
  battery: {
    connector: 'JST-PH' | '18650' | 'LiPo pad' | 'none';
    charging: boolean;
    monitoring: boolean;
  };
  /** USB connector */
  usb: 'USB-C' | 'micro-USB' | 'USB-A';
  /** Dimensions (mm) */
  dimensions: { width: number; height: number; depth: number };
  /** Meshtastic compatible */
  meshtasticCompatible: boolean;
  /** Notes */
  notes: string[];
}

/**
 * LILYGO T-Beam Supreme - Best Meshtastic board
 * https://lilygo.cc/products/t-beam-supreme
 */
export const TBEAM_SUPREME: ESP32BoardSpec = {
  name: 'LILYGO T-Beam Supreme',
  manufacturer: 'LILYGO',
  productUrl: 'https://lilygo.cc/products/t-beam-supreme',
  price: 55,
  chip: 'ESP32-S3',
  flashMb: 16,
  psramMb: 8,
  loraRadio: {
    chip: 'SX1262',
    frequency: 'US915/EU868',
    connector: 'SMA',
  },
  gps: {
    chip: 'L76K',
    antenna: 'U.FL',
  },
  display: {
    type: 'OLED',
    size: '0.96"',
    resolution: '128x64',
  },
  battery: {
    connector: '18650',
    charging: true,
    monitoring: true,
  },
  usb: 'USB-C',
  dimensions: { width: 30, height: 108, depth: 22 },
  meshtasticCompatible: true,
  notes: [
    'Best-in-class Meshtastic board',
    'ESP32-S3 with native USB',
    '18650 battery holder',
    'Solar input supported',
  ],
};

/**
 * LILYGO T-Beam v1.2 - Classic Meshtastic board
 * https://lilygo.cc/products/t-beam-v1-1-esp32-lora-gps
 */
export const TBEAM_V12: ESP32BoardSpec = {
  name: 'LILYGO T-Beam v1.2',
  manufacturer: 'LILYGO',
  productUrl: 'https://lilygo.cc/products/t-beam-v1-1-esp32-lora-gps',
  price: 35,
  chip: 'ESP32',
  flashMb: 4,
  psramMb: 8,
  loraRadio: {
    chip: 'SX1262',
    frequency: 'US915/EU868',
    connector: 'SMA',
  },
  gps: {
    chip: 'NEO-6M',
    antenna: 'Integrated',
  },
  battery: {
    connector: '18650',
    charging: true,
    monitoring: true,
  },
  usb: 'micro-USB',
  dimensions: { width: 30, height: 100, depth: 22 },
  meshtasticCompatible: true,
  notes: [
    'Proven reliable Meshtastic board',
    'Good GPS accuracy',
    'AXP192 power management',
    'Lower cost than Supreme',
  ],
};

/**
 * Heltec WiFi LoRa 32 V3 - Compact LoRa board
 * https://heltec.org/project/wifi-lora-32-v3/
 */
export const HELTEC_LORA_V3: ESP32BoardSpec = {
  name: 'Heltec WiFi LoRa 32 V3',
  manufacturer: 'Heltec',
  productUrl: 'https://heltec.org/project/wifi-lora-32-v3/',
  price: 22,
  chip: 'ESP32-S3',
  flashMb: 8,
  psramMb: 8,
  loraRadio: {
    chip: 'SX1262',
    frequency: 'US915/EU868',
    connector: 'U.FL',
  },
  display: {
    type: 'OLED',
    size: '0.96"',
    resolution: '128x64',
  },
  battery: {
    connector: 'JST-PH',
    charging: true,
    monitoring: false,
  },
  usb: 'USB-C',
  dimensions: { width: 25, height: 50, depth: 10 },
  meshtasticCompatible: true,
  notes: [
    'Very compact form factor',
    'ESP32-S3 with USB-C',
    'Good for portable nodes',
    'Lower power than T-Beam',
  ],
};

/**
 * RAK WisBlock Starter Kit - Modular LoRa platform
 * https://store.rakwireless.com/products/wisblock-starter-kit
 */
export const RAK_WISBLOCK_STARTER: ESP32BoardSpec = {
  name: 'RAK WisBlock Starter Kit',
  manufacturer: 'RAK Wireless',
  productUrl: 'https://store.rakwireless.com/products/wisblock-starter-kit',
  price: 35,
  chip: 'ESP32', // Note: Uses nRF52840, listed as ESP32 for compatibility
  flashMb: 4,
  psramMb: 0,
  loraRadio: {
    chip: 'SX1262',
    frequency: 'US915/EU868',
    connector: 'U.FL',
  },
  battery: {
    connector: 'JST-PH',
    charging: true,
    monitoring: true,
  },
  usb: 'USB-C',
  dimensions: { width: 30, height: 60, depth: 10 },
  meshtasticCompatible: true,
  notes: [
    'Actually uses nRF52840 (ARM Cortex-M4)',
    'Modular sensor ecosystem',
    'Industrial grade quality',
    'Great for custom deployments',
  ],
};

/**
 * Station G2 - Professional Meshtastic device
 * https://shop.uniteng.com/product/meshtastic-mesh-device-station-g2/
 */
export const STATION_G2: ESP32BoardSpec = {
  name: 'Station G2',
  manufacturer: 'B&Q Consulting / Unit Engineering',
  productUrl: 'https://shop.uniteng.com/product/meshtastic-mesh-device-station-g2/',
  price: 90,
  chip: 'ESP32-S3',
  flashMb: 16,
  psramMb: 8,
  loraRadio: {
    chip: 'SX1262',
    frequency: 'US915/EU868',
    connector: 'SMA',
  },
  gps: {
    chip: 'L76K',
    antenna: 'U.FL',
  },
  display: {
    type: 'TFT',
    size: '1.3"',
    resolution: '240x240',
  },
  battery: {
    connector: 'LiPo pad',
    charging: true,
    monitoring: true,
  },
  usb: 'USB-C',
  dimensions: { width: 60, height: 85, depth: 20 },
  meshtasticCompatible: true,
  notes: [
    'Premium build quality',
    'Color TFT display',
    'Pre-installed Meshtastic',
    'Weatherproof enclosure available',
  ],
};

// =============================================================================
// ESP32 NODE CONFIGURATIONS
// =============================================================================

/**
 * Complete ESP32 mesh node configuration
 */
export interface ESP32NodeConfig {
  /** Configuration name */
  name: string;
  /** Description */
  description: string;
  /** Primary use case */
  useCase: 'portable' | 'fixed-relay' | 'solar-relay' | 'router-client' | 'sensor';
  /** Board used */
  board: ESP32BoardSpec;
  /** External hardware */
  externalHardware: string[];
  /** Firmware */
  firmware: string;
  /** Estimated cost (USD) */
  estimatedCost: number;
  /** Battery life estimate */
  batteryLife?: {
    capacityMah: number;
    estimatedHours: number;
    notes: string;
  };
  /** Power consumption */
  powerConsumption: {
    sleepMa: number;
    activeMa: number;
    txMa: number;
  };
  /** Notes */
  notes: string[];
}

/**
 * Portable Meshtastic Node
 */
export const PORTABLE_MESHTASTIC_NODE: ESP32NodeConfig = {
  name: 'Portable Meshtastic Node',
  description: 'Handheld Meshtastic device for on-the-go mesh messaging',
  useCase: 'portable',
  board: TBEAM_SUPREME,
  externalHardware: [
    '18650 3000mAh LiIon battery',
    '915MHz stubby antenna (SMA)',
    'GPS external antenna (optional)',
  ],
  firmware: 'Meshtastic',
  estimatedCost: 75,
  batteryLife: {
    capacityMah: 3000,
    estimatedHours: 24,
    notes: 'With screen off, Long/Fast preset, 5 min position updates',
  },
  powerConsumption: {
    sleepMa: 15,
    activeMa: 80,
    txMa: 180,
  },
  notes: [
    'Best for hiking, events, and mobile use',
    'GPS provides position updates',
    'Screen shows messages and status',
    'Can charge via USB-C',
  ],
};

/**
 * Solar-Powered Relay Node
 */
export const SOLAR_RELAY_NODE: ESP32NodeConfig = {
  name: 'Solar Relay Node',
  description: 'Off-grid solar-powered mesh relay for network extension',
  useCase: 'solar-relay',
  board: HELTEC_LORA_V3,
  externalHardware: [
    '6W solar panel',
    '3.7V 6000mAh LiPo battery',
    '915MHz 5dBi fiberglass antenna',
    'U.FL to SMA pigtail',
    'Weatherproof enclosure (IP65)',
    'Solar charge controller module',
  ],
  firmware: 'Meshtastic (router mode)',
  estimatedCost: 120,
  batteryLife: {
    capacityMah: 6000,
    estimatedHours: 72,
    notes: 'Without solar; with solar, indefinite operation',
  },
  powerConsumption: {
    sleepMa: 8,
    activeMa: 50,
    txMa: 150,
  },
  notes: [
    'Configure as router (no GPS, no screen)',
    'Position for maximum coverage',
    'Ensure solar panel faces south (N. hemisphere)',
    'Check battery charge level via MQTT',
  ],
};

/**
 * Fixed Infrastructure Relay
 */
export const FIXED_RELAY_NODE: ESP32NodeConfig = {
  name: 'Fixed Infrastructure Relay',
  description: 'Permanent installation mesh relay with external power',
  useCase: 'fixed-relay',
  board: TBEAM_V12,
  externalHardware: [
    '5V 2A power supply',
    '915MHz 8dBi outdoor omni antenna',
    'SMA extension cable (if needed)',
    'Outdoor enclosure with cable glands',
    'Lightning arrestor (recommended)',
  ],
  firmware: 'Meshtastic (router mode)',
  estimatedCost: 100,
  powerConsumption: {
    sleepMa: 20,
    activeMa: 100,
    txMa: 200,
  },
  notes: [
    'Ideal for rooftop or tower installation',
    'Disable GPS to save power',
    'Configure hop limit appropriately',
    'Consider adding remote monitoring',
  ],
};

/**
 * WiFi-to-Meshtastic Gateway
 */
export const WIFI_GATEWAY_NODE: ESP32NodeConfig = {
  name: 'WiFi Gateway Node',
  description: 'Bridge between Meshtastic mesh and IP network via MQTT',
  useCase: 'router-client',
  board: HELTEC_LORA_V3,
  externalHardware: [
    '5V 2A USB power supply',
    '915MHz 3dBi antenna',
  ],
  firmware: 'Meshtastic (client mode with MQTT)',
  estimatedCost: 40,
  powerConsumption: {
    sleepMa: 30,
    activeMa: 120,
    txMa: 180,
  },
  notes: [
    'Connects to WiFi for MQTT bridge',
    'Enables web interface and remote management',
    'Position near WiFi router',
    'Configure MQTT server address',
  ],
};

// =============================================================================
// POWER CALCULATIONS
// =============================================================================

/**
 * Calculate ESP32 battery life
 */
export function calculateESP32BatteryLife(
  batteryCapacityMah: number,
  dutyCyclePercent: number,
  sleepCurrentMa: number,
  activeCurrentMa: number,
  txDutyCyclePercent: number = 5,
  txCurrentMa: number = 180
): {
  estimatedHours: number;
  averageCurrentMa: number;
  dailyConsumptionMah: number;
} {
  // Calculate average current
  const sleepTime = 100 - dutyCyclePercent;
  const activeTime = dutyCyclePercent - txDutyCyclePercent;
  const txTime = txDutyCyclePercent;

  const averageCurrentMa =
    (sleepCurrentMa * sleepTime +
      activeCurrentMa * activeTime +
      txCurrentMa * txTime) / 100;

  const estimatedHours = batteryCapacityMah / averageCurrentMa;
  const dailyConsumptionMah = averageCurrentMa * 24;

  return {
    estimatedHours: Math.round(estimatedHours),
    averageCurrentMa: Math.round(averageCurrentMa * 10) / 10,
    dailyConsumptionMah: Math.round(dailyConsumptionMah),
  };
}

/**
 * Calculate solar panel size for ESP32 node
 */
export function calculateESP32SolarSize(
  averageCurrentMa: number,
  peakSunHours: number = 4,
  safetyFactor: number = 1.5
): {
  panelWatts: number;
  batteryMah: number;
  notes: string[];
} {
  // Daily consumption in Wh (at 3.7V nominal)
  const dailyConsumptionWh = (averageCurrentMa * 24 * 3.7) / 1000;

  // Panel size with safety factor
  const panelWatts = Math.ceil((dailyConsumptionWh / peakSunHours) * safetyFactor);

  // Battery for 2 days autonomy
  const batteryMah = Math.ceil(averageCurrentMa * 48);

  return {
    panelWatts,
    batteryMah,
    notes: [
      `Based on ${peakSunHours} peak sun hours`,
      `${safetyFactor}x safety factor applied`,
      'Size up for winter or cloudy conditions',
    ],
  };
}

// =============================================================================
// FIRMWARE OPTIONS
// =============================================================================

/**
 * ESP32 mesh firmware options
 */
export const ESP32_FIRMWARE_OPTIONS = {
  meshtastic: {
    name: 'Meshtastic',
    url: 'https://meshtastic.org/',
    description: 'LoRa mesh for text messaging and location sharing',
    features: ['Text messaging', 'GPS tracking', 'Mesh networking', 'MQTT bridge'],
    languages: ['C++'],
  },
  espNow: {
    name: 'ESP-NOW',
    url: 'https://www.espressif.com/en/products/software/esp-now/overview',
    description: 'Low-latency WiFi mesh protocol from Espressif',
    features: ['Low latency', 'No router needed', 'Peer-to-peer', 'Up to 20 peers'],
    languages: ['C', 'C++', 'MicroPython'],
  },
  painlessMesh: {
    name: 'painlessMesh',
    url: 'https://gitlab.com/painlessMesh/painlessMesh',
    description: 'WiFi mesh library for ESP8266/ESP32',
    features: ['Self-healing mesh', 'JSON messaging', 'OTA updates', 'Web interface'],
    languages: ['C++', 'Arduino'],
  },
  espHome: {
    name: 'ESPHome',
    url: 'https://esphome.io/',
    description: 'YAML-based smart home device firmware',
    features: ['Home Assistant integration', 'YAML config', 'OTA updates', 'Many sensors'],
    languages: ['YAML', 'C++'],
  },
};

// =============================================================================
// EXPORTS
// =============================================================================

export const ESP32_SPECS = {
  chips: {
    ESP32: ESP32_SPEC,
    ESP32_S3: ESP32_S3_SPEC,
    ESP32_C3: ESP32_C3_SPEC,
  },
  boards: {
    TBEAM_SUPREME: TBEAM_SUPREME,
    TBEAM_V12: TBEAM_V12,
    HELTEC_LORA_V3: HELTEC_LORA_V3,
    RAK_WISBLOCK: RAK_WISBLOCK_STARTER,
    STATION_G2: STATION_G2,
  },
  configurations: {
    PORTABLE: PORTABLE_MESHTASTIC_NODE,
    SOLAR_RELAY: SOLAR_RELAY_NODE,
    FIXED_RELAY: FIXED_RELAY_NODE,
    WIFI_GATEWAY: WIFI_GATEWAY_NODE,
  },
  firmware: ESP32_FIRMWARE_OPTIONS,
  calculators: {
    batteryLife: calculateESP32BatteryLife,
    solarSize: calculateESP32SolarSize,
  },
};
