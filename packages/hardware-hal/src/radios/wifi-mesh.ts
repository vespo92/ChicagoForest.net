/**
 * WiFi Mesh Hardware Specifications
 *
 * Real WiFi mesh hardware specifications for community network planning.
 * Documents actual products from major manufacturers with verified specs.
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications. Not operational infrastructure.
 *
 * Sources:
 * - IEEE 802.11s Mesh Standard: https://standards.ieee.org/standard/802_11s-2011.html
 * - WiFi Alliance: https://www.wi-fi.org/
 * - FCC Equipment Authorization: https://www.fcc.gov/oet/ea/
 *
 * @module @chicago-forest/hardware-hal/radios/wifi-mesh
 */

// =============================================================================
// WIFI STANDARDS AND BANDS
// =============================================================================

/**
 * WiFi standard specifications
 */
export interface WiFiStandard {
  /** IEEE standard name */
  standard: string;
  /** Marketing name */
  marketingName: string;
  /** Year ratified */
  yearRatified: number;
  /** Supported frequency bands */
  bands: WiFiBand[];
  /** Maximum PHY rate (Mbps) */
  maxPhyRate: number;
  /** Channel width options (MHz) */
  channelWidths: number[];
  /** MIMO configuration */
  mimo: string;
  /** Key features */
  features: string[];
}

export interface WiFiBand {
  /** Band name */
  name: '2.4GHz' | '5GHz' | '6GHz';
  /** Frequency range (MHz) */
  frequencyRange: { start: number; end: number };
  /** Available channels */
  channels: number[];
  /** Regulatory considerations */
  regulatory: string;
}

/**
 * WiFi 6 (802.11ax) Standard
 */
export const WIFI6_STANDARD: WiFiStandard = {
  standard: '802.11ax',
  marketingName: 'WiFi 6',
  yearRatified: 2021,
  bands: [
    {
      name: '2.4GHz',
      frequencyRange: { start: 2400, end: 2495 },
      channels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      regulatory: 'FCC Part 15.247',
    },
    {
      name: '5GHz',
      frequencyRange: { start: 5150, end: 5850 },
      channels: [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 149, 153, 157, 161, 165],
      regulatory: 'FCC Part 15.407 (U-NII)',
    },
  ],
  maxPhyRate: 9608,
  channelWidths: [20, 40, 80, 160],
  mimo: '8x8 MU-MIMO',
  features: ['OFDMA', 'BSS Coloring', 'Target Wake Time', '1024-QAM'],
};

/**
 * WiFi 6E (802.11ax extended)
 */
export const WIFI6E_STANDARD: WiFiStandard = {
  standard: '802.11ax',
  marketingName: 'WiFi 6E',
  yearRatified: 2021,
  bands: [
    ...WIFI6_STANDARD.bands,
    {
      name: '6GHz',
      frequencyRange: { start: 5925, end: 7125 },
      channels: Array.from({ length: 59 }, (_, i) => 1 + i * 4),
      regulatory: 'FCC Part 15E (6GHz U-NII)',
    },
  ],
  maxPhyRate: 9608,
  channelWidths: [20, 40, 80, 160],
  mimo: '8x8 MU-MIMO',
  features: ['OFDMA', 'BSS Coloring', '6GHz Band', '1200MHz Spectrum'],
};

/**
 * WiFi 5 (802.11ac) Standard - Still widely deployed
 */
export const WIFI5_STANDARD: WiFiStandard = {
  standard: '802.11ac',
  marketingName: 'WiFi 5',
  yearRatified: 2013,
  bands: [
    {
      name: '5GHz',
      frequencyRange: { start: 5150, end: 5850 },
      channels: [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 120, 124, 128, 132, 136, 140, 144, 149, 153, 157, 161, 165],
      regulatory: 'FCC Part 15.407',
    },
  ],
  maxPhyRate: 6933,
  channelWidths: [20, 40, 80, 160],
  mimo: '8x8 MU-MIMO',
  features: ['MU-MIMO', 'Beamforming', '256-QAM'],
};

// =============================================================================
// 802.11s MESH NETWORKING
// =============================================================================

/**
 * IEEE 802.11s Mesh Configuration
 */
export interface MeshConfig {
  /** Mesh ID (like SSID for mesh) */
  meshId: string;
  /** Channel */
  channel: number;
  /** Band */
  band: '2.4GHz' | '5GHz';
  /** Mesh Gate (connects to wired network) */
  isMeshGate: boolean;
  /** Path selection protocol */
  pathProtocol: MeshPathProtocol;
  /** Maximum number of peer links */
  maxPeerLinks: number;
  /** Beacon interval (TUs, 1 TU = 1.024ms) */
  beaconInterval: number;
  /** DTIM period */
  dtimPeriod: number;
}

export type MeshPathProtocol = 'HWMP' | 'vendor-specific';

/**
 * HWMP (Hybrid Wireless Mesh Protocol) settings
 */
export interface HWMPConfig {
  /** Path request retries */
  preqRetries: number;
  /** Path request timeout (ms) */
  preqTimeout: number;
  /** Root announcement interval (ms) */
  rootInterval: number;
  /** Path lifetime (ms) */
  pathLifetime: number;
  /** Airtime link metric */
  useAirtimeMetric: boolean;
}

/**
 * Default HWMP configuration (Linux defaults)
 */
export const DEFAULT_HWMP_CONFIG: HWMPConfig = {
  preqRetries: 4,
  preqTimeout: 4096,
  rootInterval: 5000,
  pathLifetime: 5000,
  useAirtimeMetric: true,
};

/**
 * Create 802.11s mesh interface configuration
 */
export function createMeshConfig(options: {
  meshId: string;
  channel?: number;
  band?: '2.4GHz' | '5GHz';
  isMeshGate?: boolean;
}): MeshConfig {
  return {
    meshId: options.meshId,
    channel: options.channel || (options.band === '5GHz' ? 36 : 6),
    band: options.band || '2.4GHz',
    isMeshGate: options.isMeshGate || false,
    pathProtocol: 'HWMP',
    maxPeerLinks: 10,
    beaconInterval: 1000,
    dtimPeriod: 2,
  };
}

// =============================================================================
// MESH-CAPABLE HARDWARE
// =============================================================================

/**
 * WiFi mesh hardware specification
 */
export interface WiFiMeshHardwareSpec {
  /** Product name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Model number */
  model: string;
  /** Product URL */
  productUrl: string;
  /** Price (USD, approximate) */
  price: number;
  /** WiFi standard */
  wifiStandard: '802.11n' | '802.11ac' | '802.11ax';
  /** Radio configuration */
  radios: RadioConfig[];
  /** Ethernet ports */
  ethernetPorts: { count: number; speed: string };
  /** Power method */
  power: PowerMethod;
  /** Operating temperature (Celsius) */
  operatingTemp: { min: number; max: number };
  /** IP rating */
  ipRating?: string;
  /** Form factor */
  formFactor: 'indoor' | 'outdoor' | 'industrial';
  /** Mesh protocol support */
  meshProtocols: string[];
  /** Management interface */
  management: string[];
  /** Best use case */
  useCase: string;
}

interface RadioConfig {
  band: '2.4GHz' | '5GHz' | '6GHz';
  maxTxPower: number;
  chains: number;
  maxChannelWidth: number;
  antennaGain: number;
}

type PowerMethod = 'PoE' | 'PoE+' | 'PoE++' | 'DC' | 'USB' | 'Battery';

/**
 * GL.iNet GL-MT3000 (Beryl AX) - Budget mesh node
 * https://www.gl-inet.com/products/gl-mt3000/
 */
export const GLINET_MT3000: WiFiMeshHardwareSpec = {
  name: 'GL-MT3000 (Beryl AX)',
  manufacturer: 'GL.iNet',
  model: 'GL-MT3000',
  productUrl: 'https://www.gl-inet.com/products/gl-mt3000/',
  price: 89,
  wifiStandard: '802.11ax',
  radios: [
    { band: '2.4GHz', maxTxPower: 20, chains: 2, maxChannelWidth: 40, antennaGain: 3 },
    { band: '5GHz', maxTxPower: 23, chains: 2, maxChannelWidth: 160, antennaGain: 3 },
  ],
  ethernetPorts: { count: 3, speed: '2.5G + 1G' },
  power: 'DC',
  operatingTemp: { min: 0, max: 40 },
  formFactor: 'indoor',
  meshProtocols: ['802.11s', 'B.A.T.M.A.N.', 'OpenWRT Mesh'],
  management: ['LuCI', 'GL.iNet App', 'SSH'],
  useCase: 'Portable mesh node, travel router, home mesh',
};

/**
 * MikroTik hAP ax3 - OpenWRT compatible mesh
 * https://mikrotik.com/product/hap_ax3
 */
export const MIKROTIK_HAP_AX3: WiFiMeshHardwareSpec = {
  name: 'hAP ax3',
  manufacturer: 'MikroTik',
  model: 'C53UiG+5HPaxD2HPaxD',
  productUrl: 'https://mikrotik.com/product/hap_ax3',
  price: 129,
  wifiStandard: '802.11ax',
  radios: [
    { band: '2.4GHz', maxTxPower: 22, chains: 2, maxChannelWidth: 40, antennaGain: 3 },
    { band: '5GHz', maxTxPower: 25, chains: 2, maxChannelWidth: 80, antennaGain: 3.5 },
  ],
  ethernetPorts: { count: 5, speed: '1G + 2.5G' },
  power: 'DC',
  operatingTemp: { min: -40, max: 70 },
  formFactor: 'indoor',
  meshProtocols: ['802.11s', 'RouterOS Mesh'],
  management: ['WinBox', 'WebFig', 'CLI', 'API'],
  useCase: 'WISP infrastructure, enterprise mesh, community networks',
};

/**
 * TP-Link EAP670 - Business-grade WiFi 6 AP
 * https://www.tp-link.com/us/business-networking/omada-sdn-access-point/eap670/
 */
export const TPLINK_EAP670: WiFiMeshHardwareSpec = {
  name: 'EAP670',
  manufacturer: 'TP-Link',
  model: 'EAP670',
  productUrl: 'https://www.tp-link.com/us/business-networking/omada-sdn-access-point/eap670/',
  price: 169,
  wifiStandard: '802.11ax',
  radios: [
    { band: '2.4GHz', maxTxPower: 23, chains: 4, maxChannelWidth: 40, antennaGain: 4 },
    { band: '5GHz', maxTxPower: 27, chains: 4, maxChannelWidth: 160, antennaGain: 5 },
  ],
  ethernetPorts: { count: 1, speed: '2.5G' },
  power: 'PoE+',
  operatingTemp: { min: 0, max: 40 },
  formFactor: 'indoor',
  meshProtocols: ['Omada Mesh'],
  management: ['Omada SDN Controller', 'Cloud', 'App'],
  useCase: 'Office mesh, retail, hospitality',
};

/**
 * EnGenius ENS620EXT - Outdoor mesh node
 * https://www.engeniustech.com/outdoor-access-points/ens620ext.html
 */
export const ENGENIUS_ENS620EXT: WiFiMeshHardwareSpec = {
  name: 'ENS620EXT',
  manufacturer: 'EnGenius',
  model: 'ENS620EXT',
  productUrl: 'https://www.engeniustech.com/outdoor-access-points/ens620ext.html',
  price: 199,
  wifiStandard: '802.11ac',
  radios: [
    { band: '2.4GHz', maxTxPower: 26, chains: 2, maxChannelWidth: 40, antennaGain: 5 },
    { band: '5GHz', maxTxPower: 27, chains: 2, maxChannelWidth: 80, antennaGain: 5 },
  ],
  ethernetPorts: { count: 2, speed: '1G' },
  power: 'PoE',
  operatingTemp: { min: -20, max: 60 },
  ipRating: 'IP55',
  formFactor: 'outdoor',
  meshProtocols: ['EnMesh'],
  management: ['Cloud Controller', 'Standalone'],
  useCase: 'Outdoor mesh, parks, campgrounds, campus',
};

// =============================================================================
// COMMUNITY MESH PLATFORMS
// =============================================================================

/**
 * Open-source mesh firmware options
 */
export interface MeshFirmware {
  name: string;
  projectUrl: string;
  protocol: string;
  description: string;
  supportedHardware: string[];
  features: string[];
}

/**
 * OpenWRT 802.11s Mesh
 */
export const OPENWRT_MESH: MeshFirmware = {
  name: 'OpenWRT 802.11s',
  projectUrl: 'https://openwrt.org/docs/guide-user/network/wifi/mesh/80211s',
  protocol: '802.11s',
  description: 'Native IEEE 802.11s mesh implementation in OpenWRT',
  supportedHardware: ['Most ath9k/ath10k/mt76 devices'],
  features: [
    'Native kernel support',
    'HWMP path selection',
    'Mesh gate capability',
    'WPA3 SAE encryption',
    'Easy configuration via LuCI',
  ],
};

/**
 * B.A.T.M.A.N. Advanced
 */
export const BATMAN_ADV: MeshFirmware = {
  name: 'B.A.T.M.A.N. Advanced',
  projectUrl: 'https://www.open-mesh.org/projects/batman-adv/wiki',
  protocol: 'B.A.T.M.A.N. IV/V',
  description: 'Layer 2 mesh networking protocol operating on kernel level',
  supportedHardware: ['Any Linux device'],
  features: [
    'Layer 2 transparent bridge',
    'Multi-link optimization',
    'Gateway selection',
    'Bridge loop avoidance',
    'Network coding (optional)',
  ],
};

/**
 * LibreMesh
 */
export const LIBREMESH: MeshFirmware = {
  name: 'LibreMesh',
  projectUrl: 'https://libremesh.org/',
  protocol: 'BMX6/BMX7 + 802.11s',
  description: 'Modular framework for community mesh networks',
  supportedHardware: ['OpenWRT supported devices'],
  features: [
    'Zero-config mesh deployment',
    'Automatic IP assignment',
    'Multi-protocol support',
    'Community governance tools',
    'QoS and bandwidth sharing',
  ],
};

/**
 * Althea Mesh
 */
export const ALTHEA_MESH: MeshFirmware = {
  name: 'Althea',
  projectUrl: 'https://althea.net/',
  protocol: 'Babel',
  description: 'Incentivized mesh network with micropayments',
  supportedHardware: ['Selected routers'],
  features: [
    'Per-packet payments',
    'Crypto incentives',
    'Automatic routing',
    'Exit node support',
    'ISP integration',
  ],
};

// =============================================================================
// MESH NETWORK PLANNING
// =============================================================================

/**
 * Estimate mesh hop count and latency
 */
export function estimateMeshPerformance(
  nodes: number,
  avgHops: number,
  channelWidth: number,
  interference: 'low' | 'medium' | 'high'
): {
  effectiveThroughput: number;
  avgLatency: number;
  recommendation: string;
} {
  // Each hop typically halves throughput due to half-duplex operation
  const baseRate = channelWidth === 80 ? 400 : channelWidth === 40 ? 200 : 100; // Mbps estimate
  const hopPenalty = Math.pow(0.5, avgHops - 1);

  const interferenceMultiplier = interference === 'low' ? 0.9 : interference === 'medium' ? 0.6 : 0.3;

  const effectiveThroughput = Math.round(baseRate * hopPenalty * interferenceMultiplier);
  const avgLatency = avgHops * 5 + (interference === 'high' ? 20 : interference === 'medium' ? 10 : 5);

  let recommendation = '';
  if (avgHops > 3) {
    recommendation = 'Consider adding gateway nodes to reduce hop count.';
  } else if (interference === 'high') {
    recommendation = 'Use 5GHz band or add DFS channels for better performance.';
  } else if (effectiveThroughput < 50) {
    recommendation = 'Upgrade to WiFi 6 hardware or add more gateway nodes.';
  } else {
    recommendation = 'Network topology is suitable for mesh deployment.';
  }

  return { effectiveThroughput, avgLatency, recommendation };
}

/**
 * WiFi channel planning helper
 */
export function selectMeshChannels(
  nodes: number,
  bands: ('2.4GHz' | '5GHz')[],
  avoidDfs: boolean = false
): { channel: number; band: string }[] {
  const channels: { channel: number; band: string }[] = [];

  if (bands.includes('2.4GHz')) {
    // Only 3 non-overlapping channels in 2.4GHz
    channels.push({ channel: 1, band: '2.4GHz' });
    channels.push({ channel: 6, band: '2.4GHz' });
    channels.push({ channel: 11, band: '2.4GHz' });
  }

  if (bands.includes('5GHz')) {
    // U-NII-1 (no DFS required)
    channels.push({ channel: 36, band: '5GHz' });
    channels.push({ channel: 44, band: '5GHz' });

    if (!avoidDfs) {
      // U-NII-2C (DFS required, more channels)
      channels.push({ channel: 100, band: '5GHz' });
      channels.push({ channel: 108, band: '5GHz' });
      channels.push({ channel: 116, band: '5GHz' });
      channels.push({ channel: 124, band: '5GHz' });
      channels.push({ channel: 132, band: '5GHz' });
      channels.push({ channel: 140, band: '5GHz' });
    }

    // U-NII-3 (no DFS, limited)
    channels.push({ channel: 149, band: '5GHz' });
    channels.push({ channel: 157, band: '5GHz' });
    channels.push({ channel: 165, band: '5GHz' });
  }

  return channels;
}

// =============================================================================
// EXPORTS
// =============================================================================

export const WIFI_MESH_SPECS = {
  standards: { WIFI5: WIFI5_STANDARD, WIFI6: WIFI6_STANDARD, WIFI6E: WIFI6E_STANDARD },
  hardware: {
    GLINET_MT3000,
    MIKROTIK_HAP_AX3,
    TPLINK_EAP670,
    ENGENIUS_ENS620EXT,
  },
  firmware: {
    OPENWRT_MESH,
    BATMAN_ADV,
    LIBREMESH,
    ALTHEA_MESH,
  },
  hwmpConfig: DEFAULT_HWMP_CONFIG,
};
