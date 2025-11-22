/**
 * Platform-Specific Configurations
 *
 * Optimized configurations for different hardware platforms in
 * Chicago Forest Network deployments.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @module @chicago-forest/hardware-hal/platforms/platform-configs
 */

import type { PlatformType, PlatformInfo } from './platform-detector';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Service configuration for a platform
 */
export interface ServiceConfig {
  /** Enable this service */
  enabled: boolean;
  /** Memory limit in MB */
  memoryLimitMb?: number;
  /** CPU limit (0.0-1.0 per core) */
  cpuLimit?: number;
  /** Service-specific settings */
  settings?: Record<string, unknown>;
}

/**
 * Complete platform configuration
 */
export interface PlatformConfig {
  /** Platform identifier */
  platform: PlatformType;
  /** Human-readable name */
  name: string;
  /** Node type recommendation */
  recommendedRole: 'full-node' | 'relay-node' | 'edge-node' | 'gateway';
  /** System configuration */
  system: {
    /** Maximum memory usage percent */
    maxMemoryPercent: number;
    /** Enable swap */
    enableSwap: boolean;
    /** Swap size in MB */
    swapSizeMb: number;
    /** Enable watchdog */
    enableWatchdog: boolean;
    /** CPU governor */
    cpuGovernor: 'performance' | 'ondemand' | 'powersave';
  };
  /** Network configuration */
  network: {
    /** Maximum connections */
    maxConnections: number;
    /** Enable relay mode */
    enableRelay: boolean;
    /** Enable storage */
    enableStorage: boolean;
    /** Storage limit in GB */
    storageLimitGb: number;
  };
  /** Service configurations */
  services: {
    mesh: ServiceConfig;
    firewall: ServiceConfig;
    api: ServiceConfig;
    storage: ServiceConfig;
    monitoring: ServiceConfig;
  };
  /** Kernel parameters */
  kernelParams: Record<string, string | number>;
  /** Docker settings */
  docker: {
    /** Enable Docker */
    enabled: boolean;
    /** Use host network */
    useHostNetwork: boolean;
    /** Container runtime */
    runtime: 'docker' | 'containerd' | 'podman';
    /** Log driver */
    logDriver: 'json-file' | 'journald' | 'none';
    /** Max log size */
    logMaxSize: string;
  };
}

// =============================================================================
// PLATFORM CONFIGURATIONS
// =============================================================================

/**
 * Raspberry Pi 5 - High performance single-board computer
 */
const RASPBERRY_PI_5_CONFIG: PlatformConfig = {
  platform: 'raspberry-pi-5',
  name: 'Raspberry Pi 5',
  recommendedRole: 'full-node',
  system: {
    maxMemoryPercent: 85,
    enableSwap: true,
    swapSizeMb: 2048,
    enableWatchdog: true,
    cpuGovernor: 'ondemand',
  },
  network: {
    maxConnections: 200,
    enableRelay: true,
    enableStorage: true,
    storageLimitGb: 50,
  },
  services: {
    mesh: {
      enabled: true,
      memoryLimitMb: 512,
      cpuLimit: 2.0,
    },
    firewall: {
      enabled: true,
      memoryLimitMb: 128,
      cpuLimit: 0.5,
    },
    api: {
      enabled: true,
      memoryLimitMb: 256,
      cpuLimit: 1.0,
    },
    storage: {
      enabled: true,
      memoryLimitMb: 256,
      cpuLimit: 0.5,
    },
    monitoring: {
      enabled: true,
      memoryLimitMb: 128,
      cpuLimit: 0.25,
    },
  },
  kernelParams: {
    'net.core.rmem_max': 16777216,
    'net.core.wmem_max': 16777216,
    'net.ipv4.tcp_rmem': '4096 87380 16777216',
    'net.ipv4.tcp_wmem': '4096 65536 16777216',
    'net.ipv4.ip_forward': 1,
    'net.ipv4.conf.all.rp_filter': 0,
  },
  docker: {
    enabled: true,
    useHostNetwork: true,
    runtime: 'docker',
    logDriver: 'journald',
    logMaxSize: '50m',
  },
};

/**
 * Raspberry Pi 4 - Popular for community nodes
 */
const RASPBERRY_PI_4_CONFIG: PlatformConfig = {
  platform: 'raspberry-pi-4',
  name: 'Raspberry Pi 4',
  recommendedRole: 'full-node',
  system: {
    maxMemoryPercent: 80,
    enableSwap: true,
    swapSizeMb: 1024,
    enableWatchdog: true,
    cpuGovernor: 'ondemand',
  },
  network: {
    maxConnections: 150,
    enableRelay: true,
    enableStorage: true,
    storageLimitGb: 32,
  },
  services: {
    mesh: {
      enabled: true,
      memoryLimitMb: 384,
      cpuLimit: 1.5,
    },
    firewall: {
      enabled: true,
      memoryLimitMb: 96,
      cpuLimit: 0.5,
    },
    api: {
      enabled: true,
      memoryLimitMb: 192,
      cpuLimit: 0.75,
    },
    storage: {
      enabled: true,
      memoryLimitMb: 192,
      cpuLimit: 0.5,
    },
    monitoring: {
      enabled: true,
      memoryLimitMb: 96,
      cpuLimit: 0.25,
    },
  },
  kernelParams: {
    'net.core.rmem_max': 8388608,
    'net.core.wmem_max': 8388608,
    'net.ipv4.ip_forward': 1,
    'net.ipv4.conf.all.rp_filter': 0,
  },
  docker: {
    enabled: true,
    useHostNetwork: true,
    runtime: 'docker',
    logDriver: 'journald',
    logMaxSize: '25m',
  },
};

/**
 * Raspberry Pi 3 - Entry level node
 */
const RASPBERRY_PI_3_CONFIG: PlatformConfig = {
  platform: 'raspberry-pi-3',
  name: 'Raspberry Pi 3',
  recommendedRole: 'edge-node',
  system: {
    maxMemoryPercent: 75,
    enableSwap: true,
    swapSizeMb: 512,
    enableWatchdog: true,
    cpuGovernor: 'powersave',
  },
  network: {
    maxConnections: 50,
    enableRelay: false,
    enableStorage: false,
    storageLimitGb: 8,
  },
  services: {
    mesh: {
      enabled: true,
      memoryLimitMb: 256,
      cpuLimit: 1.0,
    },
    firewall: {
      enabled: true,
      memoryLimitMb: 64,
      cpuLimit: 0.25,
    },
    api: {
      enabled: false,
    },
    storage: {
      enabled: false,
    },
    monitoring: {
      enabled: true,
      memoryLimitMb: 48,
      cpuLimit: 0.1,
    },
  },
  kernelParams: {
    'net.ipv4.ip_forward': 1,
    'net.ipv4.conf.all.rp_filter': 0,
  },
  docker: {
    enabled: true,
    useHostNetwork: true,
    runtime: 'docker',
    logDriver: 'journald',
    logMaxSize: '10m',
  },
};

/**
 * Raspberry Pi Zero 2 W - Minimal edge node
 */
const RASPBERRY_PI_ZERO_2_CONFIG: PlatformConfig = {
  platform: 'raspberry-pi-zero-2',
  name: 'Raspberry Pi Zero 2 W',
  recommendedRole: 'edge-node',
  system: {
    maxMemoryPercent: 70,
    enableSwap: true,
    swapSizeMb: 256,
    enableWatchdog: true,
    cpuGovernor: 'powersave',
  },
  network: {
    maxConnections: 25,
    enableRelay: false,
    enableStorage: false,
    storageLimitGb: 4,
  },
  services: {
    mesh: {
      enabled: true,
      memoryLimitMb: 192,
      cpuLimit: 0.75,
    },
    firewall: {
      enabled: true,
      memoryLimitMb: 48,
      cpuLimit: 0.25,
    },
    api: {
      enabled: false,
    },
    storage: {
      enabled: false,
    },
    monitoring: {
      enabled: false,
    },
  },
  kernelParams: {
    'net.ipv4.ip_forward': 1,
  },
  docker: {
    enabled: false,
    useHostNetwork: true,
    runtime: 'docker',
    logDriver: 'none',
    logMaxSize: '5m',
  },
};

/**
 * OpenWRT Router - Router-based deployment
 */
const OPENWRT_CONFIG: PlatformConfig = {
  platform: 'openwrt',
  name: 'OpenWRT Router',
  recommendedRole: 'gateway',
  system: {
    maxMemoryPercent: 60,
    enableSwap: false,
    swapSizeMb: 0,
    enableWatchdog: true,
    cpuGovernor: 'ondemand',
  },
  network: {
    maxConnections: 100,
    enableRelay: true,
    enableStorage: false,
    storageLimitGb: 0,
  },
  services: {
    mesh: {
      enabled: true,
      memoryLimitMb: 64,
      cpuLimit: 0.5,
    },
    firewall: {
      enabled: true,
      memoryLimitMb: 32,
      cpuLimit: 0.25,
      settings: {
        useNftables: true,
      },
    },
    api: {
      enabled: false,
    },
    storage: {
      enabled: false,
    },
    monitoring: {
      enabled: true,
      memoryLimitMb: 16,
      cpuLimit: 0.1,
    },
  },
  kernelParams: {
    'net.ipv4.ip_forward': 1,
  },
  docker: {
    enabled: false,
    useHostNetwork: true,
    runtime: 'docker',
    logDriver: 'none',
    logMaxSize: '1m',
  },
};

/**
 * Linux x86_64 - Server/VM deployment
 */
const LINUX_X86_64_CONFIG: PlatformConfig = {
  platform: 'linux-x86_64',
  name: 'Linux x86_64 Server',
  recommendedRole: 'full-node',
  system: {
    maxMemoryPercent: 80,
    enableSwap: true,
    swapSizeMb: 4096,
    enableWatchdog: false,
    cpuGovernor: 'performance',
  },
  network: {
    maxConnections: 500,
    enableRelay: true,
    enableStorage: true,
    storageLimitGb: 100,
  },
  services: {
    mesh: {
      enabled: true,
      memoryLimitMb: 1024,
      cpuLimit: 4.0,
    },
    firewall: {
      enabled: true,
      memoryLimitMb: 256,
      cpuLimit: 1.0,
    },
    api: {
      enabled: true,
      memoryLimitMb: 512,
      cpuLimit: 2.0,
    },
    storage: {
      enabled: true,
      memoryLimitMb: 512,
      cpuLimit: 1.0,
    },
    monitoring: {
      enabled: true,
      memoryLimitMb: 256,
      cpuLimit: 0.5,
    },
  },
  kernelParams: {
    'net.core.rmem_max': 33554432,
    'net.core.wmem_max': 33554432,
    'net.ipv4.tcp_rmem': '4096 87380 33554432',
    'net.ipv4.tcp_wmem': '4096 65536 33554432',
    'net.ipv4.ip_forward': 1,
    'net.ipv4.conf.all.rp_filter': 0,
    'net.netfilter.nf_conntrack_max': 524288,
  },
  docker: {
    enabled: true,
    useHostNetwork: true,
    runtime: 'docker',
    logDriver: 'json-file',
    logMaxSize: '100m',
  },
};

/**
 * Docker container configuration
 */
const DOCKER_CONFIG: PlatformConfig = {
  platform: 'docker',
  name: 'Docker Container',
  recommendedRole: 'relay-node',
  system: {
    maxMemoryPercent: 90,
    enableSwap: false,
    swapSizeMb: 0,
    enableWatchdog: false,
    cpuGovernor: 'performance',
  },
  network: {
    maxConnections: 200,
    enableRelay: true,
    enableStorage: true,
    storageLimitGb: 20,
  },
  services: {
    mesh: {
      enabled: true,
    },
    firewall: {
      enabled: false, // Host handles firewall
    },
    api: {
      enabled: true,
    },
    storage: {
      enabled: true,
    },
    monitoring: {
      enabled: true,
    },
  },
  kernelParams: {},
  docker: {
    enabled: false, // Already in container
    useHostNetwork: true,
    runtime: 'docker',
    logDriver: 'json-file',
    logMaxSize: '50m',
  },
};

/**
 * Kubernetes pod configuration
 */
const KUBERNETES_CONFIG: PlatformConfig = {
  platform: 'kubernetes',
  name: 'Kubernetes Pod',
  recommendedRole: 'relay-node',
  system: {
    maxMemoryPercent: 95,
    enableSwap: false,
    swapSizeMb: 0,
    enableWatchdog: false,
    cpuGovernor: 'performance',
  },
  network: {
    maxConnections: 300,
    enableRelay: true,
    enableStorage: true,
    storageLimitGb: 50,
  },
  services: {
    mesh: {
      enabled: true,
    },
    firewall: {
      enabled: false,
    },
    api: {
      enabled: true,
    },
    storage: {
      enabled: true,
    },
    monitoring: {
      enabled: true,
    },
  },
  kernelParams: {},
  docker: {
    enabled: false,
    useHostNetwork: false,
    runtime: 'containerd',
    logDriver: 'json-file',
    logMaxSize: '50m',
  },
};

// =============================================================================
// CONFIG REGISTRY
// =============================================================================

const CONFIGS: Record<PlatformType, PlatformConfig> = {
  'raspberry-pi-5': RASPBERRY_PI_5_CONFIG,
  'raspberry-pi-4': RASPBERRY_PI_4_CONFIG,
  'raspberry-pi-3': RASPBERRY_PI_3_CONFIG,
  'raspberry-pi-zero-2': RASPBERRY_PI_ZERO_2_CONFIG,
  'raspberry-pi-zero': RASPBERRY_PI_ZERO_2_CONFIG, // Same as Zero 2 but more limited
  'openwrt': OPENWRT_CONFIG,
  'linux-x86_64': LINUX_X86_64_CONFIG,
  'linux-arm64': LINUX_X86_64_CONFIG, // Similar to x86_64
  'linux-armv7': RASPBERRY_PI_4_CONFIG, // Similar to Pi 4
  'docker': DOCKER_CONFIG,
  'kubernetes': KUBERNETES_CONFIG,
  'unknown': LINUX_X86_64_CONFIG, // Default to server config
};

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Get configuration for a specific platform
 */
export function getConfigForPlatform(platform: PlatformType): PlatformConfig {
  return CONFIGS[platform] || CONFIGS.unknown;
}

/**
 * Get optimized configuration based on detected platform info
 */
export function getOptimizedConfig(info: PlatformInfo): PlatformConfig {
  const baseConfig = getConfigForPlatform(info.platform);

  // Adjust based on actual capabilities
  const config = { ...baseConfig };

  // Adjust memory limits based on actual RAM
  const memoryScaleFactor = info.capabilities.ramMb / 4096; // Normalized to 4GB
  if (memoryScaleFactor < 1) {
    // Scale down memory limits for low-RAM systems
    for (const [key, service] of Object.entries(config.services)) {
      if (service.memoryLimitMb) {
        (config.services as any)[key].memoryLimitMb = Math.round(
          service.memoryLimitMb * memoryScaleFactor
        );
      }
    }
  }

  // Adjust connections based on RAM
  if (info.capabilities.ramMb < 512) {
    config.network.maxConnections = Math.min(config.network.maxConnections, 25);
  } else if (info.capabilities.ramMb < 1024) {
    config.network.maxConnections = Math.min(config.network.maxConnections, 50);
  }

  return config;
}

/**
 * Generate sysctl configuration for platform
 */
export function generateSysctlConfig(config: PlatformConfig): string {
  const lines = [
    '# Chicago Forest Network - Kernel Parameters',
    `# Platform: ${config.name}`,
    '# Auto-generated configuration',
    '',
  ];

  for (const [key, value] of Object.entries(config.kernelParams)) {
    lines.push(`${key} = ${value}`);
  }

  return lines.join('\n');
}

/**
 * Generate Docker Compose resource limits
 */
export function generateDockerLimits(config: PlatformConfig): Record<string, unknown> {
  return {
    deploy: {
      resources: {
        limits: {
          cpus: String(config.services.mesh.cpuLimit || '2'),
          memory: `${config.services.mesh.memoryLimitMb || 512}M`,
        },
        reservations: {
          cpus: '0.5',
          memory: '256M',
        },
      },
    },
  };
}
