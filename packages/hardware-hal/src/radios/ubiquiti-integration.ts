/**
 * Ubiquiti Hardware Integration
 *
 * Specifications for Ubiquiti Networks equipment commonly used in
 * WISP and community network deployments.
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications. Ubiquiti and UISP are trademarks of
 * Ubiquiti Inc. This project is not affiliated with Ubiquiti.
 *
 * Sources:
 * - Ubiquiti Product Specs: https://ui.com/
 * - Ubiquiti DataSheets: https://dl.ubnt.com/
 * - UISP Documentation: https://help.ui.com/hc/en-us/categories/6583256751383-UISP
 *
 * @module @chicago-forest/hardware-hal/radios/ubiquiti-integration
 */

// =============================================================================
// UBIQUITI PRODUCT LINES
// =============================================================================

/**
 * Ubiquiti product line categories
 */
export type UbiquitiProductLine =
  | 'UniFi'           // Enterprise WiFi/Network
  | 'airMAX'          // WISP PtP/PtMP
  | 'airFiber'        // High-capacity backhaul
  | 'LTU'             // Long-range PtMP
  | 'UISP'            // Service Provider management
  | 'EdgeMAX';        // Routing/switching

/**
 * Base Ubiquiti hardware specification
 */
export interface UbiquitiSpec {
  /** Product name */
  name: string;
  /** Product line */
  productLine: UbiquitiProductLine;
  /** Model/SKU */
  model: string;
  /** Product page URL */
  productUrl: string;
  /** Datasheet URL */
  datasheetUrl: string;
  /** Price (USD MSRP) */
  price: number;
  /** Form factor */
  formFactor: 'indoor' | 'outdoor' | 'pole-mount' | 'tower-mount';
  /** Power requirements */
  power: {
    method: 'PoE' | 'PoE+' | 'PoE++' | 'Passive PoE 24V' | 'Passive PoE 48V' | 'DC';
    consumption: number; // Watts
  };
  /** Operating temperature (C) */
  operatingTemp: { min: number; max: number };
  /** IP/Weather rating */
  weatherRating?: string;
  /** Management compatibility */
  management: string[];
}

// =============================================================================
// AIRMAX - POINT-TO-POINT & POINT-TO-MULTIPOINT
// =============================================================================

/**
 * airMAX radio specification
 */
export interface AirMaxSpec extends UbiquitiSpec {
  productLine: 'airMAX';
  /** Radio specifications */
  radio: {
    /** Frequency band */
    band: '2.4GHz' | '5GHz' | '60GHz';
    /** Frequency range (MHz) */
    frequencyRange: { start: number; end: number };
    /** TX power (dBm) */
    txPower: number;
    /** Antenna gain (dBi) */
    antennaGain: number;
    /** Beam width (degrees) */
    beamWidth: { horizontal: number; vertical: number };
    /** Channel width options (MHz) */
    channelWidths: number[];
    /** MIMO configuration */
    mimo: string;
  };
  /** Performance specs */
  performance: {
    /** Max throughput (Mbps) */
    maxThroughput: number;
    /** Max range (km) with clear LoS */
    maxRange: number;
  };
}

/**
 * LiteBeam 5AC Gen 2 - Entry-level PtP
 * https://store.ui.com/us/en/collections/operator-airmax-702-702/products/litebeam-5ac-gen2
 */
export const LITEBEAM_5AC_GEN2: AirMaxSpec = {
  name: 'LiteBeam 5AC Gen 2',
  productLine: 'airMAX',
  model: 'LBE-5AC-Gen2',
  productUrl: 'https://store.ui.com/us/en/collections/operator-airmax-702-702/products/litebeam-5ac-gen2',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/LiteBeam_ac/LiteBeam_ac_DS.pdf',
  price: 59,
  formFactor: 'outdoor',
  power: { method: 'Passive PoE 24V', consumption: 7 },
  operatingTemp: { min: -40, max: 70 },
  weatherRating: 'IP65',
  management: ['UISP', 'airOS', 'UNMS'],
  radio: {
    band: '5GHz',
    frequencyRange: { start: 5150, end: 5875 },
    txPower: 25,
    antennaGain: 23,
    beamWidth: { horizontal: 12, vertical: 6 },
    channelWidths: [20, 40, 80],
    mimo: '2x2',
  },
  performance: {
    maxThroughput: 450,
    maxRange: 30,
  },
};

/**
 * PowerBeam 5AC Gen 2 - Mid-range PtP
 * https://store.ui.com/us/en/collections/operator-airmax-702-702/products/powerbeam-5ac-gen2
 */
export const POWERBEAM_5AC_GEN2: AirMaxSpec = {
  name: 'PowerBeam 5AC Gen 2',
  productLine: 'airMAX',
  model: 'PBE-5AC-Gen2',
  productUrl: 'https://store.ui.com/us/en/collections/operator-airmax-702-702/products/powerbeam-5ac-gen2',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/PowerBeam_ac_ISO/PowerBeam_ac_ISO_DS.pdf',
  price: 109,
  formFactor: 'outdoor',
  power: { method: 'Passive PoE 24V', consumption: 8.5 },
  operatingTemp: { min: -40, max: 70 },
  weatherRating: 'IP65',
  management: ['UISP', 'airOS', 'UNMS'],
  radio: {
    band: '5GHz',
    frequencyRange: { start: 5150, end: 5875 },
    txPower: 25,
    antennaGain: 25,
    beamWidth: { horizontal: 8, vertical: 4 },
    channelWidths: [20, 40, 80],
    mimo: '2x2',
  },
  performance: {
    maxThroughput: 450,
    maxRange: 25,
  },
};

/**
 * Rocket 5AC Prism - High-capacity base station
 * https://store.ui.com/us/en/collections/operator-airmax-702-702/products/rocket-5ac-prism
 */
export const ROCKET_5AC_PRISM: AirMaxSpec = {
  name: 'Rocket 5AC Prism',
  productLine: 'airMAX',
  model: 'R5AC-Prism',
  productUrl: 'https://store.ui.com/us/en/collections/operator-airmax-702-702/products/rocket-5ac-prism',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/Rocket_5ac_Prism/Rocket_5ac_Prism_DS.pdf',
  price: 219,
  formFactor: 'pole-mount',
  power: { method: 'Passive PoE 24V', consumption: 13 },
  operatingTemp: { min: -40, max: 70 },
  weatherRating: 'IP67',
  management: ['UISP', 'airOS', 'UNMS'],
  radio: {
    band: '5GHz',
    frequencyRange: { start: 5150, end: 5875 },
    txPower: 27,
    antennaGain: 0, // Requires external antenna
    beamWidth: { horizontal: 360, vertical: 360 }, // Depends on antenna
    channelWidths: [20, 40, 80],
    mimo: '2x2',
  },
  performance: {
    maxThroughput: 500,
    maxRange: 50,
  },
};

/**
 * NanoStation 5AC Loco - Compact CPE
 * https://store.ui.com/us/en/collections/operator-airmax-702-702/products/nanostation-5ac-loco
 */
export const NANOSTATION_5AC_LOCO: AirMaxSpec = {
  name: 'NanoStation 5AC Loco',
  productLine: 'airMAX',
  model: 'NS-5ACL',
  productUrl: 'https://store.ui.com/us/en/collections/operator-airmax-702-702/products/nanostation-5ac-loco',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/NanoStation_ac/NanoStation_5AC_loco_DS.pdf',
  price: 49,
  formFactor: 'outdoor',
  power: { method: 'Passive PoE 24V', consumption: 5.5 },
  operatingTemp: { min: -40, max: 70 },
  weatherRating: 'IP65',
  management: ['UISP', 'airOS', 'UNMS'],
  radio: {
    band: '5GHz',
    frequencyRange: { start: 5150, end: 5875 },
    txPower: 23,
    antennaGain: 13,
    beamWidth: { horizontal: 45, vertical: 45 },
    channelWidths: [20, 40],
    mimo: '2x2',
  },
  performance: {
    maxThroughput: 450,
    maxRange: 10,
  },
};

// =============================================================================
// AIRFIBER - HIGH CAPACITY BACKHAUL
// =============================================================================

/**
 * airFiber specification
 */
export interface AirFiberSpec extends UbiquitiSpec {
  productLine: 'airFiber';
  /** Radio specifications */
  radio: {
    band: '5GHz' | '24GHz' | '60GHz';
    frequencyRange: { start: number; end: number };
    txPower: number;
    antennaGain: number;
    beamWidth: { horizontal: number; vertical: number };
    channelWidths: number[];
    modulation: string;
  };
  /** Performance */
  performance: {
    maxThroughput: number;
    latency: number; // ms
    maxRange: number;
    fullDuplex: boolean;
  };
}

/**
 * airFiber 60 LR - Long Range 60GHz
 * https://store.ui.com/us/en/collections/operator-airfiber-702-702/products/airfiber-60-lr
 */
export const AIRFIBER_60_LR: AirFiberSpec = {
  name: 'airFiber 60 LR',
  productLine: 'airFiber',
  model: 'AF60-LR',
  productUrl: 'https://store.ui.com/us/en/collections/operator-airfiber-702-702/products/airfiber-60-lr',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/airfiber/airFiber_60_LR_DS.pdf',
  price: 199,
  formFactor: 'outdoor',
  power: { method: 'PoE+', consumption: 17 },
  operatingTemp: { min: -40, max: 55 },
  weatherRating: 'IP66',
  management: ['UISP', 'UNMS'],
  radio: {
    band: '60GHz',
    frequencyRange: { start: 57000, end: 66000 },
    txPower: 26,
    antennaGain: 38,
    beamWidth: { horizontal: 1.2, vertical: 1.2 },
    channelWidths: [2160],
    modulation: '64-QAM',
  },
  performance: {
    maxThroughput: 1800,
    latency: 1,
    maxRange: 12,
    fullDuplex: true,
  },
};

/**
 * airFiber 5XHD - Long Range 5GHz Backhaul
 * https://store.ui.com/us/en/collections/operator-airfiber-702-702/products/airfiber-5xhd
 */
export const AIRFIBER_5XHD: AirFiberSpec = {
  name: 'airFiber 5XHD',
  productLine: 'airFiber',
  model: 'AF-5XHD',
  productUrl: 'https://store.ui.com/us/en/collections/operator-airfiber-702-702/products/airfiber-5xhd',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/airfiber/airFiber_5XHD_DS.pdf',
  price: 399,
  formFactor: 'pole-mount',
  power: { method: 'PoE+', consumption: 40 },
  operatingTemp: { min: -40, max: 55 },
  weatherRating: 'IP67',
  management: ['UISP', 'UNMS'],
  radio: {
    band: '5GHz',
    frequencyRange: { start: 5150, end: 5925 },
    txPower: 29,
    antennaGain: 0, // External antenna
    beamWidth: { horizontal: 360, vertical: 360 },
    channelWidths: [10, 20, 30, 40, 50],
    modulation: '256-QAM',
  },
  performance: {
    maxThroughput: 1000,
    latency: 2,
    maxRange: 100,
    fullDuplex: true,
  },
};

// =============================================================================
// LTU - LONG RANGE PTMP
// =============================================================================

/**
 * LTU specification
 */
export interface LTUSpec extends UbiquitiSpec {
  productLine: 'LTU';
  radio: {
    band: '5GHz';
    frequencyRange: { start: number; end: number };
    txPower: number;
    antennaGain: number;
    beamWidth: { horizontal: number; vertical: number };
    channelWidths: number[];
    mimo: string;
  };
  performance: {
    maxThroughput: number;
    maxClients: number;
    maxRange: number;
  };
}

/**
 * LTU Rocket - Base Station
 * https://store.ui.com/us/en/collections/operator-ltu-702-702/products/ltu-rocket
 */
export const LTU_ROCKET: LTUSpec = {
  name: 'LTU Rocket',
  productLine: 'LTU',
  model: 'LTU-Rocket',
  productUrl: 'https://store.ui.com/us/en/collections/operator-ltu-702-702/products/ltu-rocket',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/LTU/LTU-Rocket_DS.pdf',
  price: 299,
  formFactor: 'pole-mount',
  power: { method: 'PoE+', consumption: 19 },
  operatingTemp: { min: -40, max: 55 },
  weatherRating: 'IP67',
  management: ['UISP', 'UNMS'],
  radio: {
    band: '5GHz',
    frequencyRange: { start: 5150, end: 6200 },
    txPower: 29,
    antennaGain: 0, // External
    beamWidth: { horizontal: 360, vertical: 360 },
    channelWidths: [10, 20, 30, 40, 50],
    mimo: '4x4',
  },
  performance: {
    maxThroughput: 600,
    maxClients: 512,
    maxRange: 50,
  },
};

/**
 * LTU LR - Long Range Client
 * https://store.ui.com/us/en/collections/operator-ltu-702-702/products/ltu-lr
 */
export const LTU_LR: LTUSpec = {
  name: 'LTU LR',
  productLine: 'LTU',
  model: 'LTU-LR',
  productUrl: 'https://store.ui.com/us/en/collections/operator-ltu-702-702/products/ltu-lr',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/LTU/LTU-LR_DS.pdf',
  price: 199,
  formFactor: 'outdoor',
  power: { method: 'PoE', consumption: 12 },
  operatingTemp: { min: -40, max: 55 },
  weatherRating: 'IP67',
  management: ['UISP', 'UNMS'],
  radio: {
    band: '5GHz',
    frequencyRange: { start: 5150, end: 6200 },
    txPower: 26,
    antennaGain: 26,
    beamWidth: { horizontal: 6, vertical: 3 },
    channelWidths: [10, 20, 30, 40, 50],
    mimo: '2x2',
  },
  performance: {
    maxThroughput: 600,
    maxClients: 1,
    maxRange: 30,
  },
};

// =============================================================================
// UNIFI - ENTERPRISE WIRELESS
// =============================================================================

/**
 * UniFi Access Point specification
 */
export interface UniFiAPSpec extends UbiquitiSpec {
  productLine: 'UniFi';
  /** Radio configuration */
  radios: Array<{
    band: '2.4GHz' | '5GHz' | '6GHz';
    txPower: number;
    antennaGain: number;
    mimo: string;
    channelWidths: number[];
  }>;
  /** Performance */
  performance: {
    maxClients: number;
    maxThroughput: number;
  };
  /** Ethernet */
  ethernet: {
    ports: number;
    speed: string;
  };
}

/**
 * U6 Pro - WiFi 6 Enterprise AP
 * https://store.ui.com/us/en/collections/unifi-wifi-flagship-high-capacity/products/u6-pro
 */
export const U6_PRO: UniFiAPSpec = {
  name: 'U6 Pro',
  productLine: 'UniFi',
  model: 'U6-Pro',
  productUrl: 'https://store.ui.com/us/en/collections/unifi-wifi-flagship-high-capacity/products/u6-pro',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/unifi/U6-Pro_DS.pdf',
  price: 179,
  formFactor: 'indoor',
  power: { method: 'PoE', consumption: 13 },
  operatingTemp: { min: -10, max: 45 },
  management: ['UniFi Network', 'UISP'],
  radios: [
    { band: '2.4GHz', txPower: 22, antennaGain: 4, mimo: '2x2', channelWidths: [20, 40] },
    { band: '5GHz', txPower: 26, antennaGain: 6, mimo: '4x4', channelWidths: [20, 40, 80] },
  ],
  performance: {
    maxClients: 300,
    maxThroughput: 5300,
  },
  ethernet: {
    ports: 1,
    speed: '1G',
  },
};

/**
 * U6 Enterprise - WiFi 6E AP
 * https://store.ui.com/us/en/collections/unifi-wifi-flagship-high-capacity/products/u6-enterprise
 */
export const U6_ENTERPRISE: UniFiAPSpec = {
  name: 'U6 Enterprise',
  productLine: 'UniFi',
  model: 'U6-Enterprise',
  productUrl: 'https://store.ui.com/us/en/collections/unifi-wifi-flagship-high-capacity/products/u6-enterprise',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/unifi/U6-Enterprise_DS.pdf',
  price: 349,
  formFactor: 'indoor',
  power: { method: 'PoE+', consumption: 23 },
  operatingTemp: { min: -10, max: 50 },
  management: ['UniFi Network', 'UISP'],
  radios: [
    { band: '2.4GHz', txPower: 23, antennaGain: 4, mimo: '2x2', channelWidths: [20, 40] },
    { band: '5GHz', txPower: 26, antennaGain: 6, mimo: '4x4', channelWidths: [20, 40, 80, 160] },
    { band: '6GHz', txPower: 26, antennaGain: 6, mimo: '4x4', channelWidths: [20, 40, 80, 160] },
  ],
  performance: {
    maxClients: 600,
    maxThroughput: 10530,
  },
  ethernet: {
    ports: 1,
    speed: '2.5G',
  },
};

/**
 * U6 Mesh - Outdoor mesh node
 * https://store.ui.com/us/en/collections/unifi-wifi-outdoor-702-702/products/u6-mesh
 */
export const U6_MESH: UniFiAPSpec = {
  name: 'U6 Mesh',
  productLine: 'UniFi',
  model: 'U6-Mesh',
  productUrl: 'https://store.ui.com/us/en/collections/unifi-wifi-outdoor-702-702/products/u6-mesh',
  datasheetUrl: 'https://dl.ubnt.com/datasheets/unifi/U6-Mesh_DS.pdf',
  price: 179,
  formFactor: 'outdoor',
  power: { method: 'PoE', consumption: 10 },
  operatingTemp: { min: -40, max: 60 },
  weatherRating: 'IP65',
  management: ['UniFi Network', 'UISP'],
  radios: [
    { band: '2.4GHz', txPower: 22, antennaGain: 3, mimo: '2x2', channelWidths: [20, 40] },
    { band: '5GHz', txPower: 25, antennaGain: 4, mimo: '2x2', channelWidths: [20, 40, 80] },
  ],
  performance: {
    maxClients: 250,
    maxThroughput: 5300,
  },
  ethernet: {
    ports: 1,
    speed: '1G',
  },
};

// =============================================================================
// UISP API INTEGRATION
// =============================================================================

/**
 * UISP device API response structure
 * Based on https://help.ui.com/hc/en-us/articles/115003357567-UISP-API
 */
export interface UISPDeviceResponse {
  identification: {
    id: string;
    site: { id: string; name: string };
    mac: string;
    name: string;
    serialNumber: string;
    firmwareVersion: string;
    model: string;
    type: 'airMax' | 'airFiber' | 'ltu' | 'unifi' | 'other';
    category: 'wireless' | 'wired';
    authorized: boolean;
  };
  overview: {
    status: 'active' | 'inactive' | 'disconnected' | 'unauthorized';
    lastSeen: string;
    uptime: number;
    cpu: number;
    ram: number;
    signal: number;
    frequency: number;
    transmitPower: number;
    downlinkCapacity: number;
    uplinkCapacity: number;
  };
  interfaces: Array<{
    identification: {
      name: string;
      type: 'eth' | 'bridge' | 'wireless';
      mac: string;
    };
    status: {
      plugged: boolean;
      speed: number;
      duplex: 'full' | 'half';
    };
    statistics: {
      rxbytes: number;
      txbytes: number;
      rxpackets: number;
      txpackets: number;
    };
  }>;
  attributes: {
    ssid?: string;
    country?: string;
    apMac?: string;
    stationCount?: number;
  };
}

/**
 * Convert UISP device to internal format
 */
export function fromUISPDevice(uisp: UISPDeviceResponse): {
  id: string;
  name: string;
  model: string;
  status: string;
  metrics: {
    cpu: number;
    memory: number;
    signal: number;
    uptime: number;
  };
} {
  return {
    id: uisp.identification.id,
    name: uisp.identification.name,
    model: uisp.identification.model,
    status: uisp.overview.status,
    metrics: {
      cpu: uisp.overview.cpu,
      memory: uisp.overview.ram,
      signal: uisp.overview.signal,
      uptime: uisp.overview.uptime,
    },
  };
}

/**
 * UISP API client interface (for type definitions only)
 */
export interface UISPApiClient {
  /** Base URL of UISP instance */
  baseUrl: string;
  /** API key */
  apiKey: string;
  /** Get all devices */
  getDevices(): Promise<UISPDeviceResponse[]>;
  /** Get device by ID */
  getDevice(id: string): Promise<UISPDeviceResponse>;
  /** Get sites */
  getSites(): Promise<Array<{ id: string; name: string; devices: string[] }>>;
  /** Reboot device */
  rebootDevice(id: string): Promise<void>;
  /** Upgrade firmware */
  upgradeFirmware(id: string, version: string): Promise<void>;
}

/**
 * Example UISP configuration
 */
export const UISP_CONFIG_EXAMPLE = {
  baseUrl: 'https://uisp.example.com',
  apiKey: 'YOUR_API_KEY_HERE',
  pollingInterval: 60000, // 1 minute
  alertThresholds: {
    cpuHigh: 80,
    memoryHigh: 80,
    signalLow: -75,
  },
};

// =============================================================================
// LINK PLANNING HELPERS
// =============================================================================

/**
 * Calculate required equipment for a point-to-point link
 */
export function planPtPLink(
  distance: number, // km
  requiredThroughput: number, // Mbps
  budget: 'low' | 'medium' | 'high'
): {
  equipment: AirMaxSpec | AirFiberSpec;
  quantity: number;
  estimatedCost: number;
  notes: string[];
} {
  const notes: string[] = [];

  // Select equipment based on distance and throughput
  if (distance > 15 || requiredThroughput > 1000) {
    // Long range or high capacity - airFiber
    if (distance > 5) {
      return {
        equipment: AIRFIBER_5XHD,
        quantity: 2,
        estimatedCost: AIRFIBER_5XHD.price * 2 + 200, // Includes antennas
        notes: [
          'Long-range 5GHz backhaul link',
          'Requires external sector/dish antennas',
          'Full duplex operation',
        ],
      };
    } else {
      return {
        equipment: AIRFIBER_60_LR,
        quantity: 2,
        estimatedCost: AIRFIBER_60_LR.price * 2,
        notes: [
          '60GHz link for high capacity',
          'Requires clear line of sight',
          'Weather sensitive (rain fade)',
        ],
      };
    }
  } else if (distance > 5) {
    // Medium range - PowerBeam
    return {
      equipment: POWERBEAM_5AC_GEN2,
      quantity: 2,
      estimatedCost: POWERBEAM_5AC_GEN2.price * 2,
      notes: [
        'Medium-range 5GHz PtP link',
        'Integrated high-gain antenna',
        'Easy alignment with InnerFeed design',
      ],
    };
  } else {
    // Short range - LiteBeam
    return {
      equipment: LITEBEAM_5AC_GEN2,
      quantity: 2,
      estimatedCost: LITEBEAM_5AC_GEN2.price * 2,
      notes: [
        'Cost-effective short-range link',
        'Good for building-to-building connections',
        'Simple deployment',
      ],
    };
  }
}

/**
 * Calculate equipment for point-to-multipoint sector
 */
export function planPtMPSector(
  subscribers: number,
  avgDistance: number, // km
  sectorAngle: number, // degrees
): {
  baseStation: AirMaxSpec | LTUSpec;
  cpe: AirMaxSpec | LTUSpec;
  estimatedCost: { baseStation: number; perSubscriber: number };
  notes: string[];
} {
  // Use LTU for large deployments, airMAX for smaller
  if (subscribers > 50 || avgDistance > 10) {
    return {
      baseStation: LTU_ROCKET,
      cpe: LTU_LR,
      estimatedCost: {
        baseStation: LTU_ROCKET.price + 150, // Includes sector antenna
        perSubscriber: LTU_LR.price,
      },
      notes: [
        'High-capacity LTU system',
        'GPS sync for frequency reuse',
        'Supports up to 512 clients per AP',
      ],
    };
  } else {
    return {
      baseStation: ROCKET_5AC_PRISM,
      cpe: NANOSTATION_5AC_LOCO,
      estimatedCost: {
        baseStation: ROCKET_5AC_PRISM.price + 100, // Includes sector
        perSubscriber: NANOSTATION_5AC_LOCO.price,
      },
      notes: [
        'Standard airMAX deployment',
        'Cost-effective for small to medium WISPs',
        'Easy customer self-install possible',
      ],
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const UBIQUITI_SPECS = {
  airMAX: {
    LITEBEAM_5AC_GEN2,
    POWERBEAM_5AC_GEN2,
    NANOSTATION_5AC_LOCO,
    ROCKET_5AC_PRISM,
  },
  airFiber: {
    AIRFIBER_60_LR,
    AIRFIBER_5XHD,
  },
  LTU: {
    LTU_ROCKET,
    LTU_LR,
  },
  UniFi: {
    U6_PRO,
    U6_ENTERPRISE,
    U6_MESH,
  },
};
