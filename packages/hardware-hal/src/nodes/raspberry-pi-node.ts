/**
 * Raspberry Pi Node Specifications
 *
 * Hardware specifications for Raspberry Pi-based mesh network nodes.
 * Documents real Raspberry Pi models and compatible accessories for
 * building community network infrastructure.
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications for community network planning.
 *
 * Sources:
 * - Raspberry Pi Foundation: https://www.raspberrypi.com/
 * - Raspberry Pi Documentation: https://www.raspberrypi.com/documentation/
 * - GitHub Pi HAT Registry: https://github.com/raspberrypi/hats
 *
 * @module @chicago-forest/hardware-hal/nodes/raspberry-pi-node
 */

// =============================================================================
// RASPBERRY PI MODELS
// =============================================================================

/**
 * Raspberry Pi board specification
 */
export interface RaspberryPiSpec {
  /** Model name */
  model: string;
  /** Model identifier */
  modelId: string;
  /** Product URL */
  productUrl: string;
  /** Price (USD MSRP) */
  price: number;
  /** Processor */
  processor: {
    name: string;
    architecture: 'armv7l' | 'aarch64';
    cores: number;
    clockSpeed: number; // MHz
  };
  /** Memory options (MB) */
  memoryOptions: number[];
  /** Storage */
  storage: {
    type: 'microSD' | 'eMMC' | 'nvme' | 'usb';
    interface?: string;
  };
  /** Networking */
  networking: {
    ethernet?: { speed: string; poe?: boolean };
    wifi?: { standard: string; bands: string[] };
    bluetooth?: string;
  };
  /** GPIO pins */
  gpio: number;
  /** USB ports */
  usb: {
    usb2: number;
    usb3: number;
    usbC?: number;
  };
  /** Power requirements */
  power: {
    voltage: number;
    typicalCurrent: number; // mA
    maxCurrent: number; // mA
    connector: string;
  };
  /** Dimensions (mm) */
  dimensions: { width: number; height: number; depth: number };
  /** Operating temperature (C) */
  operatingTemp: { min: number; max: number };
  /** Release date */
  releaseDate: string;
  /** Suitability for mesh networking */
  meshSuitability: 'excellent' | 'good' | 'adequate' | 'limited';
  /** Notes */
  notes: string[];
}

/**
 * Raspberry Pi 5 - Latest flagship
 * https://www.raspberrypi.com/products/raspberry-pi-5/
 */
export const RASPBERRY_PI_5: RaspberryPiSpec = {
  model: 'Raspberry Pi 5',
  modelId: 'rpi5',
  productUrl: 'https://www.raspberrypi.com/products/raspberry-pi-5/',
  price: 60, // 4GB version
  processor: {
    name: 'Broadcom BCM2712',
    architecture: 'aarch64',
    cores: 4,
    clockSpeed: 2400,
  },
  memoryOptions: [4096, 8192],
  storage: {
    type: 'microSD',
    interface: 'PCIe for NVMe via HAT',
  },
  networking: {
    ethernet: { speed: '1Gbps', poe: true },
    wifi: { standard: '802.11ac', bands: ['2.4GHz', '5GHz'] },
    bluetooth: '5.0',
  },
  gpio: 40,
  usb: { usb2: 2, usb3: 2 },
  power: {
    voltage: 5,
    typicalCurrent: 3000,
    maxCurrent: 5000,
    connector: 'USB-C PD',
  },
  dimensions: { width: 85, height: 56, depth: 17 },
  operatingTemp: { min: 0, max: 50 },
  releaseDate: '2023-10',
  meshSuitability: 'excellent',
  notes: [
    'Most powerful Pi, best for compute-intensive mesh roles',
    'Native PCIe support for NVMe storage',
    'PoE+ HAT available for powered deployment',
    'Higher power consumption than Pi 4',
  ],
};

/**
 * Raspberry Pi 4 Model B - Proven workhorse
 * https://www.raspberrypi.com/products/raspberry-pi-4-model-b/
 */
export const RASPBERRY_PI_4B: RaspberryPiSpec = {
  model: 'Raspberry Pi 4 Model B',
  modelId: 'rpi4b',
  productUrl: 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/',
  price: 35, // 2GB version
  processor: {
    name: 'Broadcom BCM2711',
    architecture: 'aarch64',
    cores: 4,
    clockSpeed: 1800,
  },
  memoryOptions: [1024, 2048, 4096, 8192],
  storage: { type: 'microSD' },
  networking: {
    ethernet: { speed: '1Gbps', poe: true },
    wifi: { standard: '802.11ac', bands: ['2.4GHz', '5GHz'] },
    bluetooth: '5.0',
  },
  gpio: 40,
  usb: { usb2: 2, usb3: 2 },
  power: {
    voltage: 5,
    typicalCurrent: 2500,
    maxCurrent: 3000,
    connector: 'USB-C',
  },
  dimensions: { width: 85, height: 56, depth: 17 },
  operatingTemp: { min: 0, max: 50 },
  releaseDate: '2019-06',
  meshSuitability: 'excellent',
  notes: [
    'Well-supported, extensive community documentation',
    'PoE HAT available for clean deployment',
    'Good balance of performance and power efficiency',
    'Thermal management important for enclosed deployments',
  ],
};

/**
 * Raspberry Pi Zero 2 W - Compact node
 * https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/
 */
export const RASPBERRY_PI_ZERO_2W: RaspberryPiSpec = {
  model: 'Raspberry Pi Zero 2 W',
  modelId: 'rpiz2w',
  productUrl: 'https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/',
  price: 15,
  processor: {
    name: 'Broadcom BCM2710A1',
    architecture: 'aarch64',
    cores: 4,
    clockSpeed: 1000,
  },
  memoryOptions: [512],
  storage: { type: 'microSD' },
  networking: {
    wifi: { standard: '802.11n', bands: ['2.4GHz'] },
    bluetooth: '4.2',
  },
  gpio: 40,
  usb: { usb2: 1, usb3: 0 },
  power: {
    voltage: 5,
    typicalCurrent: 300,
    maxCurrent: 500,
    connector: 'micro-USB',
  },
  dimensions: { width: 65, height: 30, depth: 5 },
  operatingTemp: { min: 0, max: 50 },
  releaseDate: '2021-10',
  meshSuitability: 'good',
  notes: [
    'Excellent for low-power solar nodes',
    'Limited to 2.4 GHz WiFi only',
    'Add USB Ethernet adapter for wired connectivity',
    'Good for LoRa gateway or Meshtastic node',
  ],
};

/**
 * Raspberry Pi 3 Model B+ - Budget option
 * https://www.raspberrypi.com/products/raspberry-pi-3-model-b-plus/
 */
export const RASPBERRY_PI_3B_PLUS: RaspberryPiSpec = {
  model: 'Raspberry Pi 3 Model B+',
  modelId: 'rpi3bp',
  productUrl: 'https://www.raspberrypi.com/products/raspberry-pi-3-model-b-plus/',
  price: 35,
  processor: {
    name: 'Broadcom BCM2837B0',
    architecture: 'aarch64',
    cores: 4,
    clockSpeed: 1400,
  },
  memoryOptions: [1024],
  storage: { type: 'microSD' },
  networking: {
    ethernet: { speed: '300Mbps', poe: true }, // Limited by USB 2.0
    wifi: { standard: '802.11ac', bands: ['2.4GHz', '5GHz'] },
    bluetooth: '4.2',
  },
  gpio: 40,
  usb: { usb2: 4, usb3: 0 },
  power: {
    voltage: 5,
    typicalCurrent: 1200,
    maxCurrent: 2500,
    connector: 'micro-USB',
  },
  dimensions: { width: 85, height: 56, depth: 17 },
  operatingTemp: { min: 0, max: 50 },
  releaseDate: '2018-03',
  meshSuitability: 'good',
  notes: [
    'Good budget option for simple mesh nodes',
    'Ethernet limited to ~300 Mbps (shared USB bus)',
    'PoE HAT available',
    'Lower power than Pi 4, better for solar',
  ],
};

// =============================================================================
// PI HATS AND ACCESSORIES
// =============================================================================

/**
 * Pi HAT (Hardware Attached on Top) specification
 */
export interface PiHATSpec {
  /** Product name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Product URL */
  productUrl: string;
  /** Price (USD) */
  price: number;
  /** HAT type */
  type: PiHATType;
  /** Compatible Pi models */
  compatibleModels: string[];
  /** Power draw (mA) */
  powerDraw: number;
  /** Features */
  features: string[];
  /** Notes */
  notes: string[];
}

export type PiHATType =
  | 'poe'           // Power over Ethernet
  | 'lora'          // LoRa radio
  | 'cellular'      // LTE/5G modem
  | 'storage'       // NVMe/SSD
  | 'power'         // UPS/battery
  | 'interface';    // General I/O

/**
 * Raspberry Pi PoE+ HAT
 * https://www.raspberrypi.com/products/poe-plus-hat/
 */
export const PI_POE_PLUS_HAT: PiHATSpec = {
  name: 'Raspberry Pi PoE+ HAT',
  manufacturer: 'Raspberry Pi Foundation',
  productUrl: 'https://www.raspberrypi.com/products/poe-plus-hat/',
  price: 20,
  type: 'poe',
  compatibleModels: ['rpi4b', 'rpi3bp'],
  powerDraw: 0, // Provides power
  features: [
    '802.3at PoE+ compliant (25.5W)',
    'Integrated fan for cooling',
    'Powers Pi and accessories',
    'No separate power supply needed',
  ],
  notes: [
    'Ideal for outdoor/remote deployments',
    'Single cable for power and data',
    'Fan can be noisy; PWM control available',
  ],
};

/**
 * RAK2287 Pi HAT - LoRa Concentrator
 * https://store.rakwireless.com/products/rak2287-pi-hat
 */
export const RAK2287_PI_HAT: PiHATSpec = {
  name: 'RAK2287 Pi HAT',
  manufacturer: 'RAK Wireless',
  productUrl: 'https://store.rakwireless.com/products/rak2287-pi-hat',
  price: 149,
  type: 'lora',
  compatibleModels: ['rpi5', 'rpi4b', 'rpi3bp', 'rpiz2w'],
  powerDraw: 500,
  features: [
    'SX1302 baseband processor',
    '8-channel LoRa concentrator',
    'GPS for timing synchronization',
    'Full LoRaWAN gateway capable',
  ],
  notes: [
    'Required for full LoRaWAN gateway',
    'Works with ChirpStack, TTN',
    'US915 and EU868 variants',
  ],
};

/**
 * Waveshare SX1262 LoRa HAT
 * https://www.waveshare.com/sx1262-lorawan-gateway-hat.htm
 */
export const WAVESHARE_SX1262_HAT: PiHATSpec = {
  name: 'Waveshare SX1262 LoRa HAT',
  manufacturer: 'Waveshare',
  productUrl: 'https://www.waveshare.com/sx1262-lorawan-gateway-hat.htm',
  price: 30,
  type: 'lora',
  compatibleModels: ['rpi5', 'rpi4b', 'rpi3bp', 'rpiz2w'],
  powerDraw: 150,
  features: [
    'SX1262 LoRa transceiver',
    'Single channel operation',
    'OLED display option',
    'Good for Meshtastic',
  ],
  notes: [
    'Single channel - not full gateway',
    'Good for Meshtastic or simple LoRa',
    'Low cost entry point',
  ],
};

/**
 * PiJuice HAT - UPS/Battery
 * https://uk.pi-supply.com/products/pijuice-standard
 */
export const PIJUICE_HAT: PiHATSpec = {
  name: 'PiJuice HAT',
  manufacturer: 'Pi Supply',
  productUrl: 'https://uk.pi-supply.com/products/pijuice-standard',
  price: 60,
  type: 'power',
  compatibleModels: ['rpi5', 'rpi4b', 'rpi3bp'],
  powerDraw: 50, // Management overhead
  features: [
    'Intelligent UPS functionality',
    'Solar panel input (6-10V)',
    '1820mAh onboard battery',
    'RTC for scheduled wake',
    'Safe shutdown on power loss',
  ],
  notes: [
    'Essential for solar deployments',
    'Programmable via Python API',
    'Multiple battery options available',
  ],
};

/**
 * Sixfab Raspberry Pi 4G/LTE Cellular HAT
 * https://sixfab.com/product/raspberry-pi-4g-lte-modem-kit/
 */
export const SIXFAB_LTE_HAT: PiHATSpec = {
  name: 'Sixfab 4G/LTE Cellular HAT',
  manufacturer: 'Sixfab',
  productUrl: 'https://sixfab.com/product/raspberry-pi-4g-lte-modem-kit/',
  price: 130,
  type: 'cellular',
  compatibleModels: ['rpi5', 'rpi4b', 'rpi3bp'],
  powerDraw: 800,
  features: [
    'Quectel EC25 LTE modem',
    'Global 4G coverage',
    'GPS receiver included',
    'Mini PCIe slot for modem upgrades',
  ],
  notes: [
    'Requires SIM card and data plan',
    'Good for backhaul in remote areas',
    'High power consumption',
  ],
};

// =============================================================================
// ENCLOSURES
// =============================================================================

/**
 * Enclosure specification for Pi nodes
 */
export interface PiEnclosureSpec {
  /** Product name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Product URL */
  productUrl: string;
  /** Price (USD) */
  price: number;
  /** IP rating */
  ipRating: string;
  /** Compatible Pi models */
  compatibleModels: string[];
  /** Mounting options */
  mounting: string[];
  /** Allows HATs */
  allowsHats: boolean;
  /** Internal dimensions (mm) */
  internalDimensions: { width: number; height: number; depth: number };
  /** Features */
  features: string[];
}

/**
 * Outdoor Pi enclosure example
 */
export const OUTDOOR_PI_ENCLOSURE: PiEnclosureSpec = {
  name: 'IP67 Raspberry Pi Enclosure',
  manufacturer: 'Generic Industrial',
  productUrl: 'https://www.amazon.com/s?k=raspberry+pi+outdoor+enclosure',
  price: 35,
  ipRating: 'IP67',
  compatibleModels: ['rpi4b', 'rpi3bp'],
  mounting: ['pole', 'wall', 'din-rail'],
  allowsHats: true,
  internalDimensions: { width: 120, height: 80, depth: 50 },
  features: [
    'Weatherproof cable glands',
    'Vented design with Gore-Tex membrane',
    'Aluminum construction for heat dissipation',
    'Mounting flanges included',
  ],
};

// =============================================================================
// NODE CONFIGURATIONS
// =============================================================================

/**
 * Complete mesh node configuration
 */
export interface MeshNodeConfig {
  /** Configuration name */
  name: string;
  /** Description */
  description: string;
  /** Primary use case */
  useCase: 'gateway' | 'relay' | 'edge' | 'backhaul' | 'lora-gateway';
  /** Pi model */
  piModel: RaspberryPiSpec;
  /** HATs used */
  hats: PiHATSpec[];
  /** External hardware */
  externalHardware: string[];
  /** Recommended OS */
  recommendedOS: string;
  /** Software stack */
  software: string[];
  /** Total estimated cost */
  estimatedCost: number;
  /** Power consumption (W) */
  powerConsumption: { typical: number; max: number };
  /** Notes */
  notes: string[];
}

/**
 * LoRaWAN Gateway Node Configuration
 */
export const LORAWAN_GATEWAY_CONFIG: MeshNodeConfig = {
  name: 'LoRaWAN Gateway Node',
  description: 'Full 8-channel LoRaWAN gateway for community IoT network',
  useCase: 'lora-gateway',
  piModel: RASPBERRY_PI_4B,
  hats: [RAK2287_PI_HAT, PI_POE_PLUS_HAT],
  externalHardware: [
    '915 MHz outdoor omni antenna',
    'N-type to U.FL pigtail',
    'IP67 outdoor enclosure',
    'PoE switch or injector',
  ],
  recommendedOS: 'Raspberry Pi OS Lite (64-bit)',
  software: [
    'ChirpStack Gateway OS',
    'Packet forwarder',
    'Node-RED (optional)',
    'Prometheus/Grafana monitoring',
  ],
  estimatedCost: 350,
  powerConsumption: { typical: 6, max: 10 },
  notes: [
    'Position antenna for maximum coverage',
    'GPS required for Class B device support',
    'Configure for your network server (TTN, ChirpStack)',
  ],
};

/**
 * Meshtastic Relay Node Configuration
 */
export const MESHTASTIC_RELAY_CONFIG: MeshNodeConfig = {
  name: 'Meshtastic Relay Node',
  description: 'Solar-powered Meshtastic relay for mesh network extension',
  useCase: 'relay',
  piModel: RASPBERRY_PI_ZERO_2W,
  hats: [WAVESHARE_SX1262_HAT, PIJUICE_HAT],
  externalHardware: [
    '6W solar panel',
    '915 MHz 5dBi omni antenna',
    'SMA to U.FL pigtail',
    'Weatherproof enclosure',
  ],
  recommendedOS: 'Raspberry Pi OS Lite (32-bit)',
  software: [
    'Meshtastic Python CLI',
    'MQTT bridge (optional)',
    'Watchdog service',
  ],
  estimatedCost: 150,
  powerConsumption: { typical: 1.5, max: 3 },
  notes: [
    'Optimized for low power operation',
    'Can operate on solar with adequate battery',
    'Position for line-of-sight to other nodes',
  ],
};

/**
 * WiFi Mesh Gateway Configuration
 */
export const WIFI_MESH_GATEWAY_CONFIG: MeshNodeConfig = {
  name: 'WiFi Mesh Gateway Node',
  description: 'OpenWRT-based WiFi mesh gateway with internet backhaul',
  useCase: 'gateway',
  piModel: RASPBERRY_PI_4B,
  hats: [PI_POE_PLUS_HAT],
  externalHardware: [
    'USB WiFi adapter (802.11ac)',
    'Outdoor enclosure',
    'Dual-band omni antenna',
    'Ethernet cable to upstream',
  ],
  recommendedOS: 'OpenWRT (Raspberry Pi build)',
  software: [
    'OpenWRT with 802.11s mesh',
    'batman-adv',
    'dnsmasq',
    'firewall4',
    'sqm-scripts (traffic shaping)',
  ],
  estimatedCost: 120,
  powerConsumption: { typical: 8, max: 15 },
  notes: [
    'Second WiFi adapter required for mesh',
    'Configure VLANs for traffic separation',
    'Enable mesh on one radio, AP on other',
  ],
};

// =============================================================================
// SOFTWARE IMAGES
// =============================================================================

/**
 * Recommended OS images for mesh nodes
 */
export const PI_MESH_IMAGES = {
  'Raspberry Pi OS Lite': {
    url: 'https://www.raspberrypi.com/software/operating-systems/',
    description: 'Official lightweight OS, good starting point',
    bestFor: ['Custom builds', 'General purpose'],
  },
  OpenWRT: {
    url: 'https://openwrt.org/toh/raspberry_pi_foundation/raspberry_pi',
    description: 'Router-focused Linux with excellent mesh support',
    bestFor: ['WiFi mesh', 'Routing', 'Firewall'],
  },
  'ChirpStack Gateway OS': {
    url: 'https://www.chirpstack.io/docs/chirpstack-gateway-os/',
    description: 'Purpose-built for LoRaWAN gateways',
    bestFor: ['LoRaWAN gateway', 'IoT infrastructure'],
  },
  DietPi: {
    url: 'https://dietpi.com/',
    description: 'Highly optimized minimal Debian',
    bestFor: ['Low resource usage', 'Solar nodes'],
  },
  'Ubuntu Server': {
    url: 'https://ubuntu.com/download/raspberry-pi',
    description: 'Full Ubuntu experience on Pi',
    bestFor: ['Development', 'Containers', 'Kubernetes'],
  },
};

// =============================================================================
// EXPORTS
// =============================================================================

export const RASPBERRY_PI_SPECS = {
  models: {
    PI_5: RASPBERRY_PI_5,
    PI_4B: RASPBERRY_PI_4B,
    PI_ZERO_2W: RASPBERRY_PI_ZERO_2W,
    PI_3B_PLUS: RASPBERRY_PI_3B_PLUS,
  },
  hats: {
    POE_PLUS: PI_POE_PLUS_HAT,
    RAK2287: RAK2287_PI_HAT,
    WAVESHARE_LORA: WAVESHARE_SX1262_HAT,
    PIJUICE: PIJUICE_HAT,
    SIXFAB_LTE: SIXFAB_LTE_HAT,
  },
  configurations: {
    LORAWAN_GATEWAY: LORAWAN_GATEWAY_CONFIG,
    MESHTASTIC_RELAY: MESHTASTIC_RELAY_CONFIG,
    WIFI_MESH_GATEWAY: WIFI_MESH_GATEWAY_CONFIG,
  },
  images: PI_MESH_IMAGES,
};
