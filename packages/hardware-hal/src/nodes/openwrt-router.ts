/**
 * OpenWRT Router Specifications
 *
 * Hardware specifications for OpenWRT-compatible routers suitable for
 * community mesh networking. Documents real products with verified specs.
 *
 * DISCLAIMER: This is an AI-generated educational framework documenting
 * REAL hardware specifications for community network planning.
 *
 * Sources:
 * - OpenWRT Table of Hardware: https://openwrt.org/toh/start
 * - OpenWRT Supported Devices: https://openwrt.org/supported_devices
 * - Device-specific datasheets from manufacturers
 *
 * @module @chicago-forest/hardware-hal/nodes/openwrt-router
 */

// =============================================================================
// OPENWRT ROUTER SPECIFICATION
// =============================================================================

/**
 * OpenWRT router specification
 */
export interface OpenWRTRouterSpec {
  /** Device name */
  name: string;
  /** Manufacturer */
  manufacturer: string;
  /** Model identifier */
  model: string;
  /** OpenWRT device page */
  openwrtUrl: string;
  /** Product/purchase URL */
  productUrl: string;
  /** Price (USD approximate) */
  price: number;
  /** OpenWRT support status */
  supportStatus: 'current' | 'supported' | 'limited' | 'unsupported';
  /** Latest supported OpenWRT version */
  openwrtVersion: string;
  /** Hardware specifications */
  hardware: {
    soc: string;
    cpu: { cores: number; speed: number };
    ram: number; // MB
    flash: number; // MB
  };
  /** Networking capabilities */
  networking: {
    wifiChips: WifiChipInfo[];
    ethernet: { ports: number; speed: string };
    usb?: { version: string; ports: number };
  };
  /** Power specifications */
  power: {
    input: string;
    consumption: number; // Watts typical
    poe?: boolean;
  };
  /** Form factor */
  formFactor: 'desktop' | 'outdoor' | 'industrial' | 'travel';
  /** Mesh capability assessment */
  meshCapability: MeshCapabilityAssessment;
  /** Best use cases */
  useCases: string[];
  /** Notes */
  notes: string[];
}

interface WifiChipInfo {
  chip: string;
  bands: string[];
  standard: string;
  streams: string; // e.g., "4x4"
  driver: string;
}

interface MeshCapabilityAssessment {
  rating: 'excellent' | 'good' | 'adequate' | 'limited';
  supports802_11s: boolean;
  supportsBatman: boolean;
  maxMeshPeers: number;
  notes: string;
}

// =============================================================================
// BUDGET MESH ROUTERS
// =============================================================================

/**
 * GL.iNet GL-MT3000 (Beryl AX)
 * https://openwrt.org/toh/gl.inet/gl-mt3000
 */
export const GLINET_MT3000_ROUTER: OpenWRTRouterSpec = {
  name: 'GL-MT3000 Beryl AX',
  manufacturer: 'GL.iNet',
  model: 'GL-MT3000',
  openwrtUrl: 'https://openwrt.org/toh/gl.inet/gl-mt3000',
  productUrl: 'https://www.gl-inet.com/products/gl-mt3000/',
  price: 89,
  supportStatus: 'current',
  openwrtVersion: '23.05',
  hardware: {
    soc: 'MediaTek MT7981B',
    cpu: { cores: 2, speed: 1300 },
    ram: 512,
    flash: 256,
  },
  networking: {
    wifiChips: [
      { chip: 'MT7976C', bands: ['2.4GHz'], standard: '802.11ax', streams: '2x2', driver: 'mt76' },
      { chip: 'MT7976C', bands: ['5GHz'], standard: '802.11ax', streams: '2x2', driver: 'mt76' },
    ],
    ethernet: { ports: 3, speed: '2.5G + 1G' },
    usb: { version: '3.0', ports: 1 },
  },
  power: {
    input: '5V/4A USB-C',
    consumption: 8,
    poe: false,
  },
  formFactor: 'travel',
  meshCapability: {
    rating: 'excellent',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 10,
    notes: 'Great mesh node, excellent driver support',
  },
  useCases: ['Portable mesh node', 'Home mesh AP', 'Travel router'],
  notes: [
    'Ships with GL.iNet firmware (OpenWRT-based)',
    'Pure OpenWRT available',
    'Excellent mt76 WiFi driver support',
    '2.5G WAN port for fiber connections',
  ],
};

/**
 * GL.iNet GL-A1300 (Slate Plus)
 * https://openwrt.org/toh/gl.inet/gl-a1300
 */
export const GLINET_A1300: OpenWRTRouterSpec = {
  name: 'GL-A1300 Slate Plus',
  manufacturer: 'GL.iNet',
  model: 'GL-A1300',
  openwrtUrl: 'https://openwrt.org/toh/gl.inet/gl-a1300',
  productUrl: 'https://www.gl-inet.com/products/gl-a1300/',
  price: 79,
  supportStatus: 'current',
  openwrtVersion: '23.05',
  hardware: {
    soc: 'Qualcomm IPQ6000',
    cpu: { cores: 4, speed: 1200 },
    ram: 256,
    flash: 128,
  },
  networking: {
    wifiChips: [
      { chip: 'QCN5052', bands: ['2.4GHz'], standard: '802.11ax', streams: '2x2', driver: 'ath11k' },
      { chip: 'QCN5052', bands: ['5GHz'], standard: '802.11ax', streams: '2x2', driver: 'ath11k' },
    ],
    ethernet: { ports: 3, speed: '1G' },
    usb: { version: '3.0', ports: 1 },
  },
  power: {
    input: '5V/3A USB-C',
    consumption: 6,
  },
  formFactor: 'travel',
  meshCapability: {
    rating: 'good',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 8,
    notes: 'Qualcomm WiFi with good mesh support',
  },
  useCases: ['Compact mesh node', 'VPN router', 'Travel mesh'],
  notes: [
    'Compact form factor',
    'Good for tight spaces',
    'IPQ6000 platform well supported',
  ],
};

/**
 * TP-Link Archer C7 v5 - Budget classic
 * https://openwrt.org/toh/tp-link/archer_c7
 */
export const TPLINK_ARCHER_C7: OpenWRTRouterSpec = {
  name: 'Archer C7 v5',
  manufacturer: 'TP-Link',
  model: 'Archer C7 v5',
  openwrtUrl: 'https://openwrt.org/toh/tp-link/archer_c7',
  productUrl: 'https://www.tp-link.com/us/home-networking/wifi-router/archer-c7/',
  price: 50,
  supportStatus: 'current',
  openwrtVersion: '23.05',
  hardware: {
    soc: 'Qualcomm QCA9563',
    cpu: { cores: 1, speed: 775 },
    ram: 128,
    flash: 16,
  },
  networking: {
    wifiChips: [
      { chip: 'QCA9563', bands: ['2.4GHz'], standard: '802.11n', streams: '3x3', driver: 'ath9k' },
      { chip: 'QCA9880', bands: ['5GHz'], standard: '802.11ac', streams: '3x3', driver: 'ath10k' },
    ],
    ethernet: { ports: 5, speed: '1G' },
    usb: { version: '2.0', ports: 1 },
  },
  power: {
    input: '12V/2.5A',
    consumption: 12,
  },
  formFactor: 'desktop',
  meshCapability: {
    rating: 'good',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 6,
    notes: 'Proven mesh device, limited RAM for complex setups',
  },
  useCases: ['Budget mesh node', 'Basic routing', 'Guest network'],
  notes: [
    'Very well supported, tons of documentation',
    'Limited RAM constrains package installation',
    '16MB flash fills quickly - choose packages carefully',
    'External antennas can be upgraded',
  ],
};

// =============================================================================
// HIGH-PERFORMANCE ROUTERS
// =============================================================================

/**
 * Ubiquiti UniFi Dream Machine (Original)
 * Note: Running OpenWRT requires significant effort
 */
export const UBIQUITI_UDM: OpenWRTRouterSpec = {
  name: 'UniFi Dream Machine',
  manufacturer: 'Ubiquiti',
  model: 'UDM',
  openwrtUrl: 'https://openwrt.org/toh/ubiquiti/unifi_dream_machine',
  productUrl: 'https://store.ui.com/us/en/collections/unifi-dream-machine',
  price: 299,
  supportStatus: 'limited',
  openwrtVersion: 'N/A (custom builds only)',
  hardware: {
    soc: 'Alpine AL-324',
    cpu: { cores: 4, speed: 1700 },
    ram: 2048,
    flash: 16000, // eMMC
  },
  networking: {
    wifiChips: [
      { chip: 'IPQ4018', bands: ['2.4GHz', '5GHz'], standard: '802.11ac', streams: '4x4', driver: 'ath10k' },
    ],
    ethernet: { ports: 5, speed: '1G' },
  },
  power: {
    input: '12V/3A',
    consumption: 25,
  },
  formFactor: 'desktop',
  meshCapability: {
    rating: 'limited',
    supports802_11s: false,
    supportsBatman: false,
    maxMeshPeers: 0,
    notes: 'Designed for UniFi ecosystem, not open mesh',
  },
  useCases: ['UniFi infrastructure', 'NOT recommended for open mesh'],
  notes: [
    'Powerful hardware but locked ecosystem',
    'OpenWRT support is experimental',
    'Better options exist for mesh networking',
    'Included for completeness - prefer other options',
  ],
};

/**
 * Linksys WRT3200ACM - Power user choice
 * https://openwrt.org/toh/linksys/wrt3200acm
 */
export const LINKSYS_WRT3200ACM: OpenWRTRouterSpec = {
  name: 'WRT3200ACM',
  manufacturer: 'Linksys',
  model: 'WRT3200ACM',
  openwrtUrl: 'https://openwrt.org/toh/linksys/wrt3200acm',
  productUrl: 'https://www.linksys.com/wrt3200acm-ac3200-mu-mimo-gigabit-wi-fi-router/WRT3200ACM.html',
  price: 200,
  supportStatus: 'current',
  openwrtVersion: '23.05',
  hardware: {
    soc: 'Marvell Armada 385 88F6820',
    cpu: { cores: 2, speed: 1800 },
    ram: 512,
    flash: 256,
  },
  networking: {
    wifiChips: [
      { chip: 'Marvell 88W8964', bands: ['2.4GHz'], standard: '802.11ac', streams: '3x3', driver: 'mwlwifi' },
      { chip: 'Marvell 88W8964', bands: ['5GHz'], standard: '802.11ac', streams: '3x3', driver: 'mwlwifi' },
    ],
    ethernet: { ports: 5, speed: '1G' },
    usb: { version: '3.0', ports: 1 },
  },
  power: {
    input: '12V/4A',
    consumption: 24,
  },
  formFactor: 'desktop',
  meshCapability: {
    rating: 'good',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 10,
    notes: 'Powerful but Marvell WiFi driver has quirks',
  },
  useCases: ['Power user router', 'VPN gateway', 'Advanced routing'],
  notes: [
    'Designed for OpenWRT compatibility',
    'Marvell WiFi drivers are open source',
    'DFS channels may have issues',
    'Good USB 3.0 throughput for storage',
  ],
};

/**
 * Dynalink DL-WRX36 - WiFi 6 bargain
 * https://openwrt.org/toh/dynalink/dl-wrx36
 */
export const DYNALINK_WRX36: OpenWRTRouterSpec = {
  name: 'DL-WRX36',
  manufacturer: 'Dynalink',
  model: 'DL-WRX36',
  openwrtUrl: 'https://openwrt.org/toh/dynalink/dl-wrx36',
  productUrl: 'https://www.amazon.com/dp/B08R8JWX9V',
  price: 60,
  supportStatus: 'current',
  openwrtVersion: '23.05',
  hardware: {
    soc: 'Qualcomm IPQ8072A',
    cpu: { cores: 4, speed: 2200 },
    ram: 512,
    flash: 128,
  },
  networking: {
    wifiChips: [
      { chip: 'QCN5024', bands: ['2.4GHz'], standard: '802.11ax', streams: '2x2', driver: 'ath11k' },
      { chip: 'QCN5054', bands: ['5GHz'], standard: '802.11ax', streams: '4x4', driver: 'ath11k' },
    ],
    ethernet: { ports: 5, speed: '1G' },
  },
  power: {
    input: '12V/3A',
    consumption: 18,
  },
  formFactor: 'desktop',
  meshCapability: {
    rating: 'excellent',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 12,
    notes: 'Excellent WiFi 6 mesh node, great value',
  },
  useCases: ['WiFi 6 mesh', 'High-performance AP', 'Primary router'],
  notes: [
    'Amazing value for WiFi 6 hardware',
    'IPQ8072A is high-end SoC',
    'ath11k driver actively developed',
    'Often available at deep discount',
  ],
};

// =============================================================================
// SBC / BOARD-LEVEL ROUTERS
// =============================================================================

/**
 * BananaPi BPI-R3 - MediaTek Filogic SBC router
 * https://openwrt.org/toh/sinovoip/bananapi_bpi-r3
 */
export const BANANAPI_BPI_R3: OpenWRTRouterSpec = {
  name: 'BPI-R3',
  manufacturer: 'BananaPi',
  model: 'BPI-R3',
  openwrtUrl: 'https://openwrt.org/toh/sinovoip/bananapi_bpi-r3',
  productUrl: 'https://www.banana-pi.org/en/banana-pi-sbcs/93.html',
  price: 80,
  supportStatus: 'current',
  openwrtVersion: '23.05.5',
  hardware: {
    soc: 'MediaTek MT7986A',
    cpu: { cores: 4, speed: 2000 },
    ram: 2048,
    flash: 8192, // 8GB eMMC + 128MB SPI-NAND
  },
  networking: {
    wifiChips: [
      { chip: 'MT7986A', bands: ['2.4GHz'], standard: '802.11ax', streams: '4x4', driver: 'mt76' },
      { chip: 'MT7986A', bands: ['5GHz'], standard: '802.11ax', streams: '4x4', driver: 'mt76' },
    ],
    ethernet: { ports: 5, speed: '1G + 2x SFP 2.5G' },
  },
  power: {
    input: '12V/2A DC',
    consumption: 12,
  },
  formFactor: 'desktop',
  meshCapability: {
    rating: 'excellent',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 32,
    notes: 'High-performance SBC router with SFP cages for fiber uplinks',
  },
  useCases: ['Community mesh gateway', 'Fiber-connected mesh node', 'DIY router platform'],
  notes: [
    'OpenWrt target: mediatek/filogic, profile: bananapi_bpi-r3',
    'Dual SFP 2.5G cages for fiber connections',
    'Built-in WiFi 6 via MT7986A SoC',
    '2GB RAM supports heavy routing workloads',
    '128MB SPI-NAND for boot, 8GB eMMC for storage',
  ],
};

/**
 * BananaPi BPI-R4 - Next-gen MediaTek Filogic SBC router with WiFi 7
 * https://openwrt.org/toh/sinovoip/bananapi_bpi-r4
 */
export const BANANAPI_BPI_R4: OpenWRTRouterSpec = {
  name: 'BPI-R4',
  manufacturer: 'BananaPi',
  model: 'BPI-R4',
  openwrtUrl: 'https://openwrt.org/toh/sinovoip/bananapi_bpi-r4',
  productUrl: 'https://www.banana-pi.org/en/banana-pi-sbcs/230.html',
  price: 120,
  supportStatus: 'current',
  openwrtVersion: '24.10.5',
  hardware: {
    soc: 'MediaTek MT7988A',
    cpu: { cores: 4, speed: 1800 },
    ram: 4096,
    flash: 8192, // 8GB eMMC + 128MB SPI-NAND
  },
  networking: {
    wifiChips: [
      { chip: 'MT7996AN', bands: ['2.4GHz'], standard: '802.11be', streams: '4x4', driver: 'mt76' },
      { chip: 'MT7996AN', bands: ['5GHz'], standard: '802.11be', streams: '4x4', driver: 'mt76' },
      { chip: 'MT7996AN', bands: ['6GHz'], standard: '802.11be', streams: '4x4', driver: 'mt76' },
    ],
    ethernet: { ports: 4, speed: '2.5G + 2x SFP+ 10G' },
  },
  power: {
    input: '12V/3A DC',
    consumption: 15,
  },
  formFactor: 'desktop',
  meshCapability: {
    rating: 'excellent',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 64,
    notes: 'WiFi 7 tri-band with 10G SFP+ for backbone links',
  },
  useCases: ['High-capacity mesh gateway', '10G fiber backbone node', 'WiFi 7 mesh testbed'],
  notes: [
    'OpenWrt target: mediatek/filogic, profile: bananapi_bpi-r4',
    'WiFi 7 (802.11be) via MT7996AN module',
    'Dual SFP+ 10G cages for high-speed backbone',
    '4GB RAM handles large routing tables and many clients',
    '128MB SPI-NAND for boot, 8GB eMMC for storage',
  ],
};

/**
 * GL.iNet Flint 2 (GL-MT6000) - High-performance WiFi 6 router
 * https://openwrt.org/toh/gl.inet/gl-mt6000
 */
export const GLINET_MT6000: OpenWRTRouterSpec = {
  name: 'Flint 2 (GL-MT6000)',
  manufacturer: 'GL.iNet',
  model: 'GL-MT6000',
  openwrtUrl: 'https://openwrt.org/toh/gl.inet/gl-mt6000',
  productUrl: 'https://www.gl-inet.com/products/gl-mt6000/',
  price: 90,
  supportStatus: 'current',
  openwrtVersion: '23.05.5',
  hardware: {
    soc: 'MediaTek MT7986A',
    cpu: { cores: 4, speed: 2000 },
    ram: 1024,
    flash: 8192, // 8GB eMMC
  },
  networking: {
    wifiChips: [
      { chip: 'MT7986A', bands: ['2.4GHz'], standard: '802.11ax', streams: '4x4', driver: 'mt76' },
      { chip: 'MT7986A', bands: ['5GHz-1'], standard: '802.11ax', streams: '4x4', driver: 'mt76' },
      { chip: 'MT7986A', bands: ['5GHz-2'], standard: '802.11ax', streams: '4x4', driver: 'mt76' },
    ],
    ethernet: { ports: 2, speed: '2.5G' },
    usb: { version: '3.0', ports: 1 },
  },
  power: {
    input: '12V/2.5A DC',
    consumption: 14,
  },
  formFactor: 'desktop',
  meshCapability: {
    rating: 'excellent',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 16,
    notes: 'Tri-band WiFi 6 with dedicated mesh backhaul radio',
  },
  useCases: ['Tri-band mesh node', 'High-performance home router', 'Mesh backhaul node'],
  notes: [
    'OpenWrt target: mediatek/filogic, profile: glinet_gl-mt6000',
    'Ships with GL.iNet firmware (OpenWRT-based), pure OpenWRT available',
    'Tri-band WiFi 6 allows dedicated mesh backhaul',
    'Dual 2.5G Ethernet ports',
    '8GB eMMC provides ample storage for packages',
  ],
};

/**
 * FriendlyElec NanoPi R5S - Compact wired router/gateway
 * https://openwrt.org/toh/friendlyarm/nanopi_r5s
 */
export const FRIENDLYELEC_NANOPI_R5S: OpenWRTRouterSpec = {
  name: 'NanoPi R5S',
  manufacturer: 'FriendlyElec',
  model: 'NanoPi R5S',
  openwrtUrl: 'https://openwrt.org/toh/friendlyarm/nanopi_r5s',
  productUrl: 'https://www.friendlyelec.com/index.php?route=product/product&product_id=287',
  price: 60,
  supportStatus: 'current',
  openwrtVersion: '24.10.5',
  hardware: {
    soc: 'Rockchip RK3568',
    cpu: { cores: 4, speed: 2000 },
    ram: 4096,
    flash: 32768, // 32GB eMMC
  },
  networking: {
    wifiChips: [],
    ethernet: { ports: 3, speed: '2x 2.5G + 1G' },
  },
  power: {
    input: '5V/3A USB-C',
    consumption: 5,
  },
  formFactor: 'desktop',
  meshCapability: {
    rating: 'good',
    supports802_11s: false,
    supportsBatman: true,
    maxMeshPeers: 8,
    notes: 'Wired mesh only - no WiFi. Excellent as wired batman-adv node or VPN gateway',
  },
  useCases: ['Wired mesh gateway', 'VPN concentrator', 'Firewall appliance', 'Docker host'],
  notes: [
    'OpenWrt target: rockchip/armv8, profile: friendlyarm_nanopi-r5s',
    'No WiFi - pair with external AP for wireless mesh',
    '4GB RAM and 32GB eMMC support heavy workloads',
    'Dual 2.5G ports ideal for wired backbone links',
    'Very low power consumption (~5W)',
    'Metal case acts as heatsink',
  ],
};

/**
 * OpenWrt One - Official OpenWrt community hardware
 * https://openwrt.org/toh/openwrt/one
 */
export const OPENWRT_ONE: OpenWRTRouterSpec = {
  name: 'OpenWrt One',
  manufacturer: 'OpenWrt',
  model: 'OpenWrt One',
  openwrtUrl: 'https://openwrt.org/toh/openwrt/one',
  productUrl: 'https://openwrt.org/toh/openwrt/one',
  price: 89,
  supportStatus: 'current',
  openwrtVersion: '24.10.5',
  hardware: {
    soc: 'MediaTek MT7981B',
    cpu: { cores: 2, speed: 1300 },
    ram: 1024,
    flash: 256, // 256MB NAND + 4MB NOR
  },
  networking: {
    wifiChips: [
      { chip: 'MT7976C', bands: ['2.4GHz'], standard: '802.11ax', streams: '2x2', driver: 'mt76' },
      { chip: 'MT7976C', bands: ['5GHz'], standard: '802.11ax', streams: '2x2', driver: 'mt76' },
    ],
    ethernet: { ports: 2, speed: '2.5G' },
  },
  power: {
    input: '12V/1.5A DC or USB-C',
    consumption: 8,
  },
  formFactor: 'desktop',
  meshCapability: {
    rating: 'excellent',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 16,
    notes: 'Official OpenWrt hardware - guaranteed first-class support',
  },
  useCases: ['Community mesh node', 'Reference OpenWrt platform', 'Mesh AP'],
  notes: [
    'OpenWrt target: mediatek/filogic, profile: openwrt_one',
    'Official OpenWrt community-designed hardware',
    'Guaranteed long-term OpenWrt support',
    '4MB NOR flash for failsafe recovery, 256MB NAND for main OS',
    'Dual 2.5G Ethernet ports',
    'Designed specifically for open-source networking',
  ],
};

// =============================================================================
// OUTDOOR/INDUSTRIAL ROUTERS
// =============================================================================

/**
 * MikroTik hAP ac3 - Outdoor capable
 * https://openwrt.org/toh/mikrotik/hap_ac3
 */
export const MIKROTIK_HAP_AC3: OpenWRTRouterSpec = {
  name: 'hAP ac3',
  manufacturer: 'MikroTik',
  model: 'RBD53iG-5HacD2HnD',
  openwrtUrl: 'https://openwrt.org/toh/mikrotik/hap_ac3',
  productUrl: 'https://mikrotik.com/product/hap_ac3',
  price: 129,
  supportStatus: 'current',
  openwrtVersion: '23.05',
  hardware: {
    soc: 'Qualcomm IPQ4019',
    cpu: { cores: 4, speed: 716 },
    ram: 256,
    flash: 128,
  },
  networking: {
    wifiChips: [
      { chip: 'IPQ4019', bands: ['2.4GHz'], standard: '802.11n', streams: '2x2', driver: 'ath10k' },
      { chip: 'IPQ4019', bands: ['5GHz'], standard: '802.11ac', streams: '2x2', driver: 'ath10k' },
    ],
    ethernet: { ports: 5, speed: '1G' },
    usb: { version: '3.0', ports: 1 },
  },
  power: {
    input: '24V passive PoE or DC',
    consumption: 16,
    poe: true,
  },
  formFactor: 'desktop',
  meshCapability: {
    rating: 'good',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 8,
    notes: 'PoE input makes deployment flexible',
  },
  useCases: ['PoE mesh node', 'WISP CPE', 'Industrial deployment'],
  notes: [
    'Passive PoE simplifies installation',
    'Wide operating temperature',
    'RouterOS or OpenWRT options',
    'Good for outdoor enclosure deployment',
  ],
};

/**
 * TP-Link CPE510 - Outdoor PtP/PtMP
 * https://openwrt.org/toh/tp-link/cpe510
 */
export const TPLINK_CPE510: OpenWRTRouterSpec = {
  name: 'CPE510',
  manufacturer: 'TP-Link',
  model: 'CPE510 v1/v2/v3',
  openwrtUrl: 'https://openwrt.org/toh/tp-link/cpe510',
  productUrl: 'https://www.tp-link.com/us/business-networking/outdoor-radio/cpe510/',
  price: 45,
  supportStatus: 'current',
  openwrtVersion: '23.05',
  hardware: {
    soc: 'Qualcomm Atheros QCA9531',
    cpu: { cores: 1, speed: 650 },
    ram: 64,
    flash: 8,
  },
  networking: {
    wifiChips: [
      { chip: 'QCA9531', bands: ['5GHz'], standard: '802.11n', streams: '2x2', driver: 'ath9k' },
    ],
    ethernet: { ports: 2, speed: '100M' },
  },
  power: {
    input: '24V passive PoE',
    consumption: 8,
    poe: true,
  },
  formFactor: 'outdoor',
  meshCapability: {
    rating: 'adequate',
    supports802_11s: true,
    supportsBatman: true,
    maxMeshPeers: 4,
    notes: 'Limited RAM but works for simple mesh',
  },
  useCases: ['Outdoor PtP link', 'Budget outdoor mesh', 'WISP CPE'],
  notes: [
    'Integrated 13dBi directional antenna',
    'IP65 weatherproof enclosure',
    'Very limited flash/RAM - minimal packages',
    'Great budget outdoor option',
  ],
};

// =============================================================================
// MESH CONFIGURATION HELPERS
// =============================================================================

/**
 * OpenWRT mesh configuration template
 */
export interface MeshConfigTemplate {
  /** Configuration name */
  name: string;
  /** Mesh protocol */
  protocol: '802.11s' | 'batman-adv' | 'babel';
  /** Required packages */
  packages: string[];
  /** UCI configuration */
  uciConfig: Record<string, string>;
  /** Notes */
  notes: string[];
}

/**
 * 802.11s mesh configuration template
 */
export const MESH_802_11S_TEMPLATE: MeshConfigTemplate = {
  name: '802.11s Mesh',
  protocol: '802.11s',
  packages: ['wpad-mesh-openssl', 'mesh11sd'],
  uciConfig: {
    'wireless.radio0.channel': '6',
    'wireless.mesh0': 'wifi-iface',
    'wireless.mesh0.device': 'radio0',
    'wireless.mesh0.network': 'mesh',
    'wireless.mesh0.mode': 'mesh',
    'wireless.mesh0.mesh_id': 'community-mesh',
    'wireless.mesh0.encryption': 'sae',
    'wireless.mesh0.key': 'your-mesh-key',
  },
  notes: [
    'Replace wpad-basic with wpad-mesh-openssl',
    'Use SAE encryption for WPA3 mesh security',
    'mesh11sd provides enhanced mesh management',
    'All nodes need same mesh_id and key',
  ],
};

/**
 * batman-adv mesh configuration template
 */
export const MESH_BATMAN_TEMPLATE: MeshConfigTemplate = {
  name: 'B.A.T.M.A.N. Advanced Mesh',
  protocol: 'batman-adv',
  packages: ['kmod-batman-adv', 'batctl'],
  uciConfig: {
    'network.bat0': 'interface',
    'network.bat0.proto': 'batadv',
    'network.bat0.routing_algo': 'BATMAN_V',
    'network.bat0.aggregated_ogms': '1',
    'network.mesh': 'interface',
    'network.mesh.proto': 'batadv_hardif',
    'network.mesh.master': 'bat0',
  },
  notes: [
    'batman-adv operates at Layer 2',
    'BATMAN_V algorithm recommended',
    'Can bridge WiFi mesh with Ethernet',
    'Good for heterogeneous networks',
  ],
};

/**
 * Calculate if router is suitable for mesh deployment
 */
export function assessMeshSuitability(
  router: OpenWRTRouterSpec,
  requirements: {
    minRam?: number;
    minFlash?: number;
    needsPoe?: boolean;
    outdoorRequired?: boolean;
    wifiStandard?: string;
  }
): {
  suitable: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // RAM check
  if (requirements.minRam && router.hardware.ram < requirements.minRam) {
    issues.push(`RAM ${router.hardware.ram}MB below required ${requirements.minRam}MB`);
    score -= 30;
  }

  // Flash check
  if (requirements.minFlash && router.hardware.flash < requirements.minFlash) {
    issues.push(`Flash ${router.hardware.flash}MB below required ${requirements.minFlash}MB`);
    score -= 20;
  }

  // PoE check
  if (requirements.needsPoe && !router.power.poe) {
    issues.push('PoE required but not supported');
    recommendations.push('Consider PoE splitter/injector');
    score -= 15;
  }

  // Outdoor check
  if (requirements.outdoorRequired && router.formFactor !== 'outdoor') {
    issues.push('Outdoor deployment required but device is indoor');
    recommendations.push('Use weatherproof enclosure');
    score -= 10;
  }

  // WiFi standard check
  if (requirements.wifiStandard) {
    if (router.networking.wifiChips.length === 0) {
      issues.push('WiFi required but device has no WiFi radios');
      recommendations.push('Pair with external WiFi AP or USB adapter');
      score -= 30;
    } else {
      const hasRequiredStandard = router.networking.wifiChips.some(
        (chip) => chip.standard === requirements.wifiStandard
      );
      if (!hasRequiredStandard) {
        const available = Array.from(new Set(router.networking.wifiChips.map((c) => c.standard))).join(', ');
        issues.push(`Requires ${requirements.wifiStandard} but device supports: ${available}`);
        score -= 15;
      }
    }
  }

  // Mesh capability check
  if (router.meshCapability.rating === 'limited') {
    issues.push('Limited mesh capability');
    score -= 25;
  }

  // Support status
  if (router.supportStatus === 'limited' || router.supportStatus === 'unsupported') {
    issues.push('OpenWRT support is limited or unsupported');
    score -= 30;
  }

  return {
    suitable: score >= 60 && issues.length < 3,
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const OPENWRT_ROUTERS = {
  budget: {
    GLINET_MT3000: GLINET_MT3000_ROUTER,
    GLINET_A1300,
    TPLINK_ARCHER_C7,
  },
  highPerformance: {
    LINKSYS_WRT3200ACM,
    DYNALINK_WRX36,
    GLINET_MT6000,
  },
  sbcRouters: {
    BANANAPI_BPI_R3,
    BANANAPI_BPI_R4,
    FRIENDLYELEC_NANOPI_R5S,
    OPENWRT_ONE,
  },
  outdoor: {
    MIKROTIK_HAP_AC3,
    TPLINK_CPE510,
  },
  templates: {
    MESH_802_11S: MESH_802_11S_TEMPLATE,
    MESH_BATMAN: MESH_BATMAN_TEMPLATE,
  },
};
