/**
 * Platform Capability Matrix
 *
 * Defines what features are available on each platform and provides
 * compatibility checking for Chicago Forest Network deployments.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @module @chicago-forest/hardware-hal/platforms/capability-matrix
 */

import type { PlatformType } from './platform-detector';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Feature availability status
 */
export type FeatureStatus =
  | 'supported'      // Fully supported
  | 'limited'        // Supported with limitations
  | 'experimental'   // May work but not tested
  | 'unsupported';   // Not available

/**
 * Hardware interface requirements
 */
export interface HardwareRequirements {
  /** Minimum RAM in MB */
  minRamMb: number;
  /** Minimum CPU cores */
  minCpuCores: number;
  /** Requires SPI interface */
  requiresSpi: boolean;
  /** Requires I2C interface */
  requiresI2c: boolean;
  /** Requires GPIO access */
  requiresGpio: boolean;
  /** Requires specific kernel modules */
  requiredModules: string[];
  /** Requires network capabilities */
  requiresNetAdmin: boolean;
}

/**
 * Feature definition
 */
export interface FeatureDefinition {
  /** Feature name */
  name: string;
  /** Feature description */
  description: string;
  /** Hardware requirements */
  requirements: HardwareRequirements;
  /** Platform support status */
  platformSupport: Record<PlatformType, FeatureStatus>;
  /** Notes for specific platforms */
  platformNotes?: Partial<Record<PlatformType, string>>;
}

// =============================================================================
// FEATURE DEFINITIONS
// =============================================================================

export const FEATURES: Record<string, FeatureDefinition> = {
  /**
   * LoRa Radio Support
   */
  loraRadio: {
    name: 'LoRa Radio',
    description: 'Support for SX1262/SX1276 LoRa transceivers via SPI',
    requirements: {
      minRamMb: 256,
      minCpuCores: 1,
      requiresSpi: true,
      requiresI2c: false,
      requiresGpio: true,
      requiredModules: ['spidev'],
      requiresNetAdmin: false,
    },
    platformSupport: {
      'raspberry-pi-5': 'supported',
      'raspberry-pi-4': 'supported',
      'raspberry-pi-3': 'supported',
      'raspberry-pi-zero-2': 'supported',
      'raspberry-pi-zero': 'limited',
      'openwrt': 'experimental',
      'linux-x86_64': 'unsupported',
      'linux-arm64': 'experimental',
      'linux-armv7': 'experimental',
      'docker': 'unsupported',
      'kubernetes': 'unsupported',
      'unknown': 'unsupported',
    },
    platformNotes: {
      'raspberry-pi-zero': 'Limited by single-core CPU and RAM',
      'openwrt': 'Depends on router model SPI support',
      'docker': 'No hardware access in containers',
    },
  },

  /**
   * WiFi Mesh Networking
   */
  wifiMesh: {
    name: 'WiFi Mesh',
    description: 'Ad-hoc and mesh mode WiFi networking',
    requirements: {
      minRamMb: 256,
      minCpuCores: 1,
      requiresSpi: false,
      requiresI2c: false,
      requiresGpio: false,
      requiredModules: ['cfg80211', 'mac80211'],
      requiresNetAdmin: true,
    },
    platformSupport: {
      'raspberry-pi-5': 'supported',
      'raspberry-pi-4': 'supported',
      'raspberry-pi-3': 'supported',
      'raspberry-pi-zero-2': 'supported',
      'raspberry-pi-zero': 'unsupported',
      'openwrt': 'supported',
      'linux-x86_64': 'limited',
      'linux-arm64': 'limited',
      'linux-armv7': 'limited',
      'docker': 'limited',
      'kubernetes': 'limited',
      'unknown': 'experimental',
    },
    platformNotes: {
      'raspberry-pi-zero': 'No built-in WiFi',
      'linux-x86_64': 'Requires compatible WiFi adapter',
      'docker': 'Requires host network and CAP_NET_ADMIN',
    },
  },

  /**
   * WireGuard VPN
   */
  wireguard: {
    name: 'WireGuard VPN',
    description: 'Modern VPN protocol for secure tunnels',
    requirements: {
      minRamMb: 128,
      minCpuCores: 1,
      requiresSpi: false,
      requiresI2c: false,
      requiresGpio: false,
      requiredModules: ['wireguard'],
      requiresNetAdmin: true,
    },
    platformSupport: {
      'raspberry-pi-5': 'supported',
      'raspberry-pi-4': 'supported',
      'raspberry-pi-3': 'supported',
      'raspberry-pi-zero-2': 'supported',
      'raspberry-pi-zero': 'limited',
      'openwrt': 'supported',
      'linux-x86_64': 'supported',
      'linux-arm64': 'supported',
      'linux-armv7': 'supported',
      'docker': 'supported',
      'kubernetes': 'supported',
      'unknown': 'experimental',
    },
    platformNotes: {
      'docker': 'Requires CAP_NET_ADMIN capability',
      'kubernetes': 'Requires privileged container or NET_ADMIN',
    },
  },

  /**
   * BATMAN-adv Mesh Routing
   */
  batmanAdv: {
    name: 'BATMAN-adv',
    description: 'Layer 2 mesh routing protocol',
    requirements: {
      minRamMb: 256,
      minCpuCores: 1,
      requiresSpi: false,
      requiresI2c: false,
      requiresGpio: false,
      requiredModules: ['batman_adv'],
      requiresNetAdmin: true,
    },
    platformSupport: {
      'raspberry-pi-5': 'supported',
      'raspberry-pi-4': 'supported',
      'raspberry-pi-3': 'supported',
      'raspberry-pi-zero-2': 'limited',
      'raspberry-pi-zero': 'limited',
      'openwrt': 'supported',
      'linux-x86_64': 'supported',
      'linux-arm64': 'supported',
      'linux-armv7': 'supported',
      'docker': 'experimental',
      'kubernetes': 'experimental',
      'unknown': 'experimental',
    },
  },

  /**
   * Data Storage/Relay
   */
  dataStorage: {
    name: 'Data Storage',
    description: 'Store and relay network data',
    requirements: {
      minRamMb: 512,
      minCpuCores: 2,
      requiresSpi: false,
      requiresI2c: false,
      requiresGpio: false,
      requiredModules: [],
      requiresNetAdmin: false,
    },
    platformSupport: {
      'raspberry-pi-5': 'supported',
      'raspberry-pi-4': 'supported',
      'raspberry-pi-3': 'limited',
      'raspberry-pi-zero-2': 'unsupported',
      'raspberry-pi-zero': 'unsupported',
      'openwrt': 'unsupported',
      'linux-x86_64': 'supported',
      'linux-arm64': 'supported',
      'linux-armv7': 'limited',
      'docker': 'supported',
      'kubernetes': 'supported',
      'unknown': 'experimental',
    },
    platformNotes: {
      'raspberry-pi-3': 'Limited by RAM and SD card speed',
      'openwrt': 'Insufficient storage on most routers',
    },
  },

  /**
   * API Server
   */
  apiServer: {
    name: 'API Server',
    description: 'REST/GraphQL API for network interaction',
    requirements: {
      minRamMb: 256,
      minCpuCores: 1,
      requiresSpi: false,
      requiresI2c: false,
      requiresGpio: false,
      requiredModules: [],
      requiresNetAdmin: false,
    },
    platformSupport: {
      'raspberry-pi-5': 'supported',
      'raspberry-pi-4': 'supported',
      'raspberry-pi-3': 'supported',
      'raspberry-pi-zero-2': 'limited',
      'raspberry-pi-zero': 'unsupported',
      'openwrt': 'unsupported',
      'linux-x86_64': 'supported',
      'linux-arm64': 'supported',
      'linux-armv7': 'supported',
      'docker': 'supported',
      'kubernetes': 'supported',
      'unknown': 'experimental',
    },
  },

  /**
   * Solar Power Management
   */
  solarPower: {
    name: 'Solar Power',
    description: 'Solar charge controller integration via I2C/UART',
    requirements: {
      minRamMb: 128,
      minCpuCores: 1,
      requiresSpi: false,
      requiresI2c: true,
      requiresGpio: true,
      requiredModules: ['i2c-dev'],
      requiresNetAdmin: false,
    },
    platformSupport: {
      'raspberry-pi-5': 'supported',
      'raspberry-pi-4': 'supported',
      'raspberry-pi-3': 'supported',
      'raspberry-pi-zero-2': 'supported',
      'raspberry-pi-zero': 'supported',
      'openwrt': 'experimental',
      'linux-x86_64': 'unsupported',
      'linux-arm64': 'experimental',
      'linux-armv7': 'experimental',
      'docker': 'unsupported',
      'kubernetes': 'unsupported',
      'unknown': 'unsupported',
    },
    platformNotes: {
      'linux-x86_64': 'Servers typically dont have I2C',
      'docker': 'No hardware access in containers',
    },
  },
};

// =============================================================================
// CAPABILITY CHECKING
// =============================================================================

/**
 * Check if a feature is supported on a platform
 */
export function isFeatureSupported(
  feature: keyof typeof FEATURES,
  platform: PlatformType
): boolean {
  const def = FEATURES[feature];
  if (!def) return false;
  const status = def.platformSupport[platform];
  return status === 'supported' || status === 'limited';
}

/**
 * Get all supported features for a platform
 */
export function getSupportedFeatures(platform: PlatformType): string[] {
  return Object.entries(FEATURES)
    .filter(([, def]) => {
      const status = def.platformSupport[platform];
      return status === 'supported' || status === 'limited';
    })
    .map(([key]) => key);
}

/**
 * Get feature compatibility report for a platform
 */
export function getCompatibilityReport(platform: PlatformType): {
  platform: PlatformType;
  supported: string[];
  limited: string[];
  unsupported: string[];
  notes: Record<string, string>;
} {
  const supported: string[] = [];
  const limited: string[] = [];
  const unsupported: string[] = [];
  const notes: Record<string, string> = {};

  for (const [key, def] of Object.entries(FEATURES)) {
    const status = def.platformSupport[platform];
    switch (status) {
      case 'supported':
        supported.push(key);
        break;
      case 'limited':
        limited.push(key);
        if (def.platformNotes?.[platform]) {
          notes[key] = def.platformNotes[platform]!;
        }
        break;
      default:
        unsupported.push(key);
        if (def.platformNotes?.[platform]) {
          notes[key] = def.platformNotes[platform]!;
        }
    }
  }

  return { platform, supported, limited, unsupported, notes };
}

/**
 * Check if platform meets requirements for a feature
 */
export function checkRequirements(
  feature: keyof typeof FEATURES,
  capabilities: {
    ramMb: number;
    cpuCores: number;
    hasSpi: boolean;
    hasI2c: boolean;
    hasGpio: boolean;
  }
): { meets: boolean; missing: string[] } {
  const def = FEATURES[feature];
  if (!def) return { meets: false, missing: ['Unknown feature'] };

  const missing: string[] = [];
  const reqs = def.requirements;

  if (capabilities.ramMb < reqs.minRamMb) {
    missing.push(`RAM: ${capabilities.ramMb}MB < ${reqs.minRamMb}MB required`);
  }
  if (capabilities.cpuCores < reqs.minCpuCores) {
    missing.push(`CPU: ${capabilities.cpuCores} cores < ${reqs.minCpuCores} required`);
  }
  if (reqs.requiresSpi && !capabilities.hasSpi) {
    missing.push('SPI interface required');
  }
  if (reqs.requiresI2c && !capabilities.hasI2c) {
    missing.push('I2C interface required');
  }
  if (reqs.requiresGpio && !capabilities.hasGpio) {
    missing.push('GPIO access required');
  }

  return {
    meets: missing.length === 0,
    missing,
  };
}

/**
 * Get recommended platform for a set of features
 */
export function recommendPlatform(
  requiredFeatures: (keyof typeof FEATURES)[]
): {
  recommended: PlatformType;
  alternatives: PlatformType[];
  reason: string;
} {
  const platforms: PlatformType[] = [
    'raspberry-pi-5',
    'raspberry-pi-4',
    'raspberry-pi-3',
    'raspberry-pi-zero-2',
    'linux-x86_64',
    'linux-arm64',
    'openwrt',
  ];

  // Score each platform
  const scores: Record<PlatformType, number> = {} as any;

  for (const platform of platforms) {
    let score = 0;
    for (const feature of requiredFeatures) {
      const def = FEATURES[feature];
      if (!def) continue;
      const status = def.platformSupport[platform];
      if (status === 'supported') score += 2;
      else if (status === 'limited') score += 1;
    }
    scores[platform] = score;
  }

  // Sort by score
  const sorted = platforms.sort((a, b) => scores[b] - scores[a]);

  return {
    recommended: sorted[0],
    alternatives: sorted.slice(1, 3),
    reason: `${sorted[0]} supports all ${requiredFeatures.length} requested features`,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const CAPABILITY_MATRIX = {
  features: FEATURES,
  isSupported: isFeatureSupported,
  getSupported: getSupportedFeatures,
  report: getCompatibilityReport,
  check: checkRequirements,
  recommend: recommendPlatform,
};
