/**
 * Platform Detection
 *
 * Automatically detects the hardware platform and provides system information
 * for optimized deployment configurations.
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * Supported platforms:
 * - Raspberry Pi (all versions)
 * - OpenWRT routers
 * - Generic Linux (x86_64, ARM64)
 * - Docker containers
 * - Kubernetes pods
 *
 * @module @chicago-forest/hardware-hal/platforms/platform-detector
 */

import { promises as fs } from 'fs';
import * as os from 'os';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Detected platform type
 */
export type PlatformType =
  | 'raspberry-pi-5'
  | 'raspberry-pi-4'
  | 'raspberry-pi-3'
  | 'raspberry-pi-zero-2'
  | 'raspberry-pi-zero'
  | 'openwrt'
  | 'linux-x86_64'
  | 'linux-arm64'
  | 'linux-armv7'
  | 'docker'
  | 'kubernetes'
  | 'unknown';

/**
 * Platform capabilities
 */
export interface PlatformCapabilities {
  /** CPU architecture */
  arch: string;
  /** Number of CPU cores */
  cpuCores: number;
  /** Total RAM in MB */
  ramMb: number;
  /** GPU available */
  hasGpu: boolean;
  /** Hardware watchdog available */
  hasWatchdog: boolean;
  /** Can run containers */
  canRunContainers: boolean;
  /** Has SPI interface */
  hasSpi: boolean;
  /** Has I2C interface */
  hasI2c: boolean;
  /** Has GPIO */
  hasGpio: boolean;
  /** Has WiFi */
  hasWifi: boolean;
  /** Has Bluetooth */
  hasBluetooth: boolean;
  /** Has Ethernet */
  hasEthernet: boolean;
  /** Number of USB ports */
  usbPorts: number;
  /** Max recommended services */
  maxRecommendedServices: number;
}

/**
 * Platform detection result
 */
export interface PlatformInfo {
  /** Detected platform type */
  platform: PlatformType;
  /** Human-readable name */
  name: string;
  /** Platform capabilities */
  capabilities: PlatformCapabilities;
  /** Is running in container */
  isContainer: boolean;
  /** Is running in Kubernetes */
  isKubernetes: boolean;
  /** Kernel version */
  kernelVersion: string;
  /** OS release */
  osRelease: string;
  /** Hostname */
  hostname: string;
  /** Detection timestamp */
  detectedAt: Date;
  /** Detection notes/warnings */
  notes: string[];
}

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Detect Raspberry Pi model from /proc/device-tree/model
 */
async function detectRaspberryPi(): Promise<PlatformType | null> {
  try {
    const model = await fs.readFile('/proc/device-tree/model', 'utf8');
    const modelLower = model.toLowerCase();

    if (modelLower.includes('raspberry pi 5')) {
      return 'raspberry-pi-5';
    } else if (modelLower.includes('raspberry pi 4')) {
      return 'raspberry-pi-4';
    } else if (modelLower.includes('raspberry pi 3')) {
      return 'raspberry-pi-3';
    } else if (modelLower.includes('raspberry pi zero 2')) {
      return 'raspberry-pi-zero-2';
    } else if (modelLower.includes('raspberry pi zero')) {
      return 'raspberry-pi-zero';
    }
  } catch {
    // Not a Raspberry Pi or can't read model file
  }
  return null;
}

/**
 * Detect if running in Docker container
 */
async function detectDocker(): Promise<boolean> {
  try {
    const cgroup = await fs.readFile('/proc/1/cgroup', 'utf8');
    return cgroup.includes('docker') || cgroup.includes('containerd');
  } catch {
    // Check for .dockerenv file
    try {
      await fs.access('/.dockerenv');
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Detect if running in Kubernetes
 */
function detectKubernetes(): boolean {
  return (
    !!process.env.KUBERNETES_SERVICE_HOST ||
    !!process.env.KUBERNETES_PORT
  );
}

/**
 * Detect OpenWRT
 */
async function detectOpenWRT(): Promise<boolean> {
  try {
    const osRelease = await fs.readFile('/etc/os-release', 'utf8');
    return osRelease.toLowerCase().includes('openwrt');
  } catch {
    return false;
  }
}

/**
 * Get OS release information
 */
async function getOsRelease(): Promise<string> {
  try {
    const content = await fs.readFile('/etc/os-release', 'utf8');
    const lines = content.split('\n');
    const prettyName = lines.find(l => l.startsWith('PRETTY_NAME='));
    if (prettyName) {
      return prettyName.split('=')[1].replace(/"/g, '');
    }
  } catch {
    // Ignore
  }
  return `${os.type()} ${os.release()}`;
}

/**
 * Check for hardware interface availability
 */
async function checkInterface(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// CAPABILITY MAPPINGS
// =============================================================================

const PLATFORM_CAPABILITIES: Record<PlatformType, Partial<PlatformCapabilities>> = {
  'raspberry-pi-5': {
    hasGpu: true,
    hasWatchdog: true,
    canRunContainers: true,
    hasSpi: true,
    hasI2c: true,
    hasGpio: true,
    hasWifi: true,
    hasBluetooth: true,
    hasEthernet: true,
    usbPorts: 4,
    maxRecommendedServices: 10,
  },
  'raspberry-pi-4': {
    hasGpu: true,
    hasWatchdog: true,
    canRunContainers: true,
    hasSpi: true,
    hasI2c: true,
    hasGpio: true,
    hasWifi: true,
    hasBluetooth: true,
    hasEthernet: true,
    usbPorts: 4,
    maxRecommendedServices: 8,
  },
  'raspberry-pi-3': {
    hasGpu: true,
    hasWatchdog: true,
    canRunContainers: true,
    hasSpi: true,
    hasI2c: true,
    hasGpio: true,
    hasWifi: true,
    hasBluetooth: true,
    hasEthernet: true,
    usbPorts: 4,
    maxRecommendedServices: 5,
  },
  'raspberry-pi-zero-2': {
    hasGpu: true,
    hasWatchdog: true,
    canRunContainers: true,
    hasSpi: true,
    hasI2c: true,
    hasGpio: true,
    hasWifi: true,
    hasBluetooth: true,
    hasEthernet: false,
    usbPorts: 1,
    maxRecommendedServices: 4,
  },
  'raspberry-pi-zero': {
    hasGpu: true,
    hasWatchdog: true,
    canRunContainers: false,
    hasSpi: true,
    hasI2c: true,
    hasGpio: true,
    hasWifi: false,
    hasBluetooth: false,
    hasEthernet: false,
    usbPorts: 1,
    maxRecommendedServices: 2,
  },
  'openwrt': {
    hasGpu: false,
    hasWatchdog: true,
    canRunContainers: false,
    hasSpi: false,
    hasI2c: false,
    hasGpio: true,
    hasWifi: true,
    hasEthernet: true,
    usbPorts: 1,
    maxRecommendedServices: 5,
  },
  'linux-x86_64': {
    hasGpu: false,
    hasWatchdog: false,
    canRunContainers: true,
    hasSpi: false,
    hasI2c: false,
    hasGpio: false,
    hasWifi: false,
    hasEthernet: true,
    usbPorts: 4,
    maxRecommendedServices: 20,
  },
  'linux-arm64': {
    hasGpu: false,
    hasWatchdog: false,
    canRunContainers: true,
    hasSpi: true,
    hasI2c: true,
    hasGpio: true,
    hasWifi: false,
    hasEthernet: true,
    usbPorts: 2,
    maxRecommendedServices: 15,
  },
  'linux-armv7': {
    hasGpu: false,
    hasWatchdog: false,
    canRunContainers: true,
    hasSpi: true,
    hasI2c: true,
    hasGpio: true,
    hasWifi: false,
    hasEthernet: true,
    usbPorts: 2,
    maxRecommendedServices: 8,
  },
  'docker': {
    hasGpu: false,
    hasWatchdog: false,
    canRunContainers: false,
    hasSpi: false,
    hasI2c: false,
    hasGpio: false,
    hasWifi: false,
    hasEthernet: true,
    usbPorts: 0,
    maxRecommendedServices: 5,
  },
  'kubernetes': {
    hasGpu: false,
    hasWatchdog: false,
    canRunContainers: false,
    hasSpi: false,
    hasI2c: false,
    hasGpio: false,
    hasWifi: false,
    hasEthernet: true,
    usbPorts: 0,
    maxRecommendedServices: 5,
  },
  'unknown': {
    hasGpu: false,
    hasWatchdog: false,
    canRunContainers: true,
    hasSpi: false,
    hasI2c: false,
    hasGpio: false,
    hasWifi: false,
    hasEthernet: true,
    usbPorts: 0,
    maxRecommendedServices: 5,
  },
};

const PLATFORM_NAMES: Record<PlatformType, string> = {
  'raspberry-pi-5': 'Raspberry Pi 5',
  'raspberry-pi-4': 'Raspberry Pi 4',
  'raspberry-pi-3': 'Raspberry Pi 3',
  'raspberry-pi-zero-2': 'Raspberry Pi Zero 2 W',
  'raspberry-pi-zero': 'Raspberry Pi Zero',
  'openwrt': 'OpenWRT Router',
  'linux-x86_64': 'Linux x86_64',
  'linux-arm64': 'Linux ARM64',
  'linux-armv7': 'Linux ARMv7',
  'docker': 'Docker Container',
  'kubernetes': 'Kubernetes Pod',
  'unknown': 'Unknown Platform',
};

// =============================================================================
// MAIN DETECTOR
// =============================================================================

/**
 * Detect the current platform and its capabilities
 */
export async function detectPlatform(): Promise<PlatformInfo> {
  const notes: string[] = [];
  let platform: PlatformType = 'unknown';

  // Check for container environments first
  const isKubernetes = detectKubernetes();
  const isDocker = await detectDocker();

  if (isKubernetes) {
    platform = 'kubernetes';
    notes.push('Running in Kubernetes pod');
  } else if (isDocker) {
    platform = 'docker';
    notes.push('Running in Docker container');
  } else {
    // Try to detect specific platforms
    const rpiPlatform = await detectRaspberryPi();
    if (rpiPlatform) {
      platform = rpiPlatform;
    } else if (await detectOpenWRT()) {
      platform = 'openwrt';
    } else {
      // Fall back to architecture detection
      const arch = os.arch();
      if (arch === 'x64') {
        platform = 'linux-x86_64';
      } else if (arch === 'arm64') {
        platform = 'linux-arm64';
      } else if (arch === 'arm') {
        platform = 'linux-armv7';
      }
    }
  }

  // Get base capabilities for platform
  const baseCaps = PLATFORM_CAPABILITIES[platform];

  // Build actual capabilities
  const capabilities: PlatformCapabilities = {
    arch: os.arch(),
    cpuCores: os.cpus().length,
    ramMb: Math.round(os.totalmem() / (1024 * 1024)),
    hasGpu: baseCaps.hasGpu ?? false,
    hasWatchdog: baseCaps.hasWatchdog ?? false,
    canRunContainers: baseCaps.canRunContainers ?? true,
    hasSpi: baseCaps.hasSpi ?? (await checkInterface('/dev/spidev0.0')),
    hasI2c: baseCaps.hasI2c ?? (await checkInterface('/dev/i2c-1')),
    hasGpio: baseCaps.hasGpio ?? (await checkInterface('/sys/class/gpio')),
    hasWifi: baseCaps.hasWifi ?? false,
    hasBluetooth: baseCaps.hasBluetooth ?? false,
    hasEthernet: baseCaps.hasEthernet ?? true,
    usbPorts: baseCaps.usbPorts ?? 0,
    maxRecommendedServices: baseCaps.maxRecommendedServices ?? 5,
  };

  // Add capability-based notes
  if (capabilities.ramMb < 512) {
    notes.push('Low memory: Consider disabling non-essential services');
  }
  if (capabilities.cpuCores < 2) {
    notes.push('Single core: Limit concurrent operations');
  }
  if (capabilities.hasSpi) {
    notes.push('SPI available for LoRa radio');
  }
  if (capabilities.hasGpio) {
    notes.push('GPIO available for hardware control');
  }

  return {
    platform,
    name: PLATFORM_NAMES[platform],
    capabilities,
    isContainer: isDocker || isKubernetes,
    isKubernetes,
    kernelVersion: os.release(),
    osRelease: await getOsRelease(),
    hostname: os.hostname(),
    detectedAt: new Date(),
    notes,
  };
}

/**
 * Quick platform check (synchronous, less accurate)
 */
export function quickDetect(): { platform: PlatformType; arch: string } {
  const arch = os.arch();

  // Check environment variables for containers
  if (process.env.KUBERNETES_SERVICE_HOST) {
    return { platform: 'kubernetes', arch };
  }

  // Basic arch-based detection
  if (arch === 'x64') {
    return { platform: 'linux-x86_64', arch };
  } else if (arch === 'arm64') {
    return { platform: 'linux-arm64', arch };
  } else if (arch === 'arm') {
    return { platform: 'linux-armv7', arch };
  }

  return { platform: 'unknown', arch };
}

/**
 * Check if platform meets minimum requirements for Forest node
 */
export function checkMinimumRequirements(info: PlatformInfo): {
  meets: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Minimum requirements
  if (info.capabilities.ramMb < 256) {
    issues.push('Insufficient RAM: Minimum 256 MB required');
  } else if (info.capabilities.ramMb < 512) {
    warnings.push('Low RAM: 512 MB recommended for optimal performance');
  }

  if (info.capabilities.cpuCores < 1) {
    issues.push('No CPU detected');
  }

  // Platform-specific checks
  if (info.platform === 'raspberry-pi-zero') {
    warnings.push('Pi Zero has limited resources, consider Pi Zero 2 W or Pi 3+');
  }

  return {
    meets: issues.length === 0,
    issues,
    warnings,
  };
}
