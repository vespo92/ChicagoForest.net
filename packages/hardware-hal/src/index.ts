/**
 * @chicago-forest/hardware-hal
 *
 * Hardware Abstraction Layer for Chicago Forest Network.
 * Supports custom-built radio equipment, DIY antennas, and
 * UISP-compatible management for community-owned infrastructure.
 *
 * Supported hardware:
 * - WiFi adapters (2.4GHz, 5GHz, 6GHz)
 * - LoRa radios (SX1262, SX1276)
 * - 900MHz ISM band equipment
 * - 60GHz backhaul (802.11ad/ay)
 * - Custom DIY equipment
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes. Not operational infrastructure.
 *
 * @example
 * ```typescript
 * import {
 *   HardwareManager,
 *   WiFiDevice,
 *   LoRaRadio,
 * } from '@chicago-forest/hardware-hal';
 *
 * const manager = new HardwareManager();
 * await manager.discover();
 *
 * const devices = manager.getDevices();
 * for (const device of devices) {
 *   console.log(`Found: ${device.name} (${device.type})`);
 * }
 * ```
 */

import type {
  HardwareDevice,
  HardwareDeviceType,
  HardwareMetrics,
  FrequencyBand,
} from '@chicago-forest/shared-types';

// =============================================================================
// DEVICE ABSTRACTIONS
// =============================================================================

/**
 * Base hardware device interface
 */
export interface BaseDevice {
  /** Device ID */
  id: string;
  /** Device type */
  type: HardwareDeviceType;
  /** Human-readable name */
  name: string;
  /** Initialize the device */
  init(): Promise<void>;
  /** Get device status */
  getStatus(): HardwareDevice;
  /** Get device metrics */
  getMetrics(): Promise<HardwareMetrics>;
  /** Reset the device */
  reset(): Promise<void>;
  /** Shutdown the device */
  shutdown(): Promise<void>;
}

/**
 * Radio device interface
 */
export interface RadioDevice extends BaseDevice {
  /** Frequency band */
  band: FrequencyBand;
  /** Current channel */
  channel: number;
  /** TX power in dBm */
  txPower: number;
  /** Set channel */
  setChannel(channel: number): Promise<void>;
  /** Set TX power */
  setTxPower(dbm: number): Promise<void>;
  /** Get RSSI */
  getRSSI(): Promise<number>;
  /** Scan for signals */
  scan(): Promise<ScanResult[]>;
}

/**
 * Scan result
 */
export interface ScanResult {
  frequency: number;
  rssi: number;
  noise: number;
  utilization: number;
}

// =============================================================================
// WIFI DEVICE
// =============================================================================

/**
 * WiFi device configuration
 */
export interface WiFiConfig {
  interface: string;
  band: '2.4ghz' | '5ghz' | '6ghz';
  channel?: number;
  txPower?: number;
  mode?: 'managed' | 'adhoc' | 'ap' | 'mesh';
}

/**
 * WiFi device implementation
 */
export class WiFiDevice implements RadioDevice {
  readonly id: string;
  readonly type: HardwareDeviceType = 'wifi-adapter';
  readonly name: string;
  readonly band: FrequencyBand;
  channel: number;
  txPower: number;
  private config: WiFiConfig;
  private status: 'online' | 'offline' | 'error' = 'offline';

  constructor(config: WiFiConfig) {
    this.id = `wifi-${config.interface}`;
    this.name = `WiFi Adapter (${config.interface})`;
    this.config = config;
    this.band = config.band;
    this.channel = config.channel || 1;
    this.txPower = config.txPower || 20;
  }

  async init(): Promise<void> {
    // In production: Configure interface using iw/iwconfig
    this.status = 'online';
  }

  getStatus(): HardwareDevice {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      capabilities: ['mesh', 'adhoc', 'ap'],
      status: this.status,
    };
  }

  async getMetrics(): Promise<HardwareMetrics> {
    return {
      uptime: Date.now(),
    };
  }

  async reset(): Promise<void> {
    this.status = 'offline';
    await this.init();
  }

  async shutdown(): Promise<void> {
    this.status = 'offline';
  }

  async setChannel(channel: number): Promise<void> {
    this.channel = channel;
    // In production: iw dev wlan0 set channel <channel>
  }

  async setTxPower(dbm: number): Promise<void> {
    this.txPower = Math.min(dbm, 30); // Cap at 30 dBm
    // In production: iw dev wlan0 set txpower fixed <mBm>
  }

  async getRSSI(): Promise<number> {
    // In production: Parse from iw or /proc
    return -50;
  }

  async scan(): Promise<ScanResult[]> {
    // In production: iw dev wlan0 scan
    return [];
  }
}

// =============================================================================
// LORA RADIO
// =============================================================================

/**
 * LoRa radio configuration
 */
export interface LoRaConfig {
  device: string;         // SPI device or serial port
  chip: 'sx1262' | 'sx1276' | 'sx1278';
  frequency: number;      // Hz (e.g., 915000000 for 915MHz)
  spreadingFactor: number; // 7-12
  bandwidth: number;       // Hz
  codingRate: number;      // 5-8 (4/5 to 4/8)
  txPower: number;         // dBm
}

/**
 * LoRa radio implementation for long-range communication
 */
export class LoRaRadio implements RadioDevice {
  readonly id: string;
  readonly type: HardwareDeviceType = 'lora-radio';
  readonly name: string;
  readonly band: FrequencyBand = '900mhz';
  channel: number;
  txPower: number;
  private config: LoRaConfig;
  private status: 'online' | 'offline' | 'error' = 'offline';

  constructor(config: LoRaConfig) {
    this.id = `lora-${config.device}`;
    this.name = `LoRa Radio (${config.chip})`;
    this.config = config;
    this.channel = Math.floor((config.frequency - 902000000) / 200000); // US channel
    this.txPower = config.txPower;
  }

  async init(): Promise<void> {
    // In production: Initialize SPI, configure radio registers
    this.status = 'online';
  }

  getStatus(): HardwareDevice {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      manufacturer: 'Semtech',
      model: this.config.chip.toUpperCase(),
      capabilities: ['lora', 'mesh', 'long-range'],
      status: this.status,
    };
  }

  async getMetrics(): Promise<HardwareMetrics> {
    return {
      uptime: Date.now(),
    };
  }

  async reset(): Promise<void> {
    this.status = 'offline';
    await this.init();
  }

  async shutdown(): Promise<void> {
    this.status = 'offline';
  }

  async setChannel(channel: number): Promise<void> {
    this.channel = channel;
    // Update frequency based on channel
  }

  async setTxPower(dbm: number): Promise<void> {
    this.txPower = Math.min(dbm, 22); // LoRa max typically 22 dBm
  }

  async getRSSI(): Promise<number> {
    // Read from radio register
    return -100;
  }

  async scan(): Promise<ScanResult[]> {
    // LoRa CAD (Channel Activity Detection)
    return [];
  }

  /**
   * Send LoRa packet
   */
  async send(data: Uint8Array): Promise<void> {
    // In production: Write to radio FIFO and trigger TX
  }

  /**
   * Receive LoRa packet (blocking)
   */
  async receive(timeout: number): Promise<Uint8Array | null> {
    // In production: Wait for RX interrupt
    return null;
  }

  /**
   * Calculate time on air for a packet
   */
  calculateTimeOnAir(payloadSize: number): number {
    // LoRa time on air formula
    const sf = this.config.spreadingFactor;
    const bw = this.config.bandwidth;
    const symbolDuration = (2 ** sf) / bw * 1000; // ms

    // Simplified calculation
    const symbols = 8 + Math.ceil((8 * payloadSize - 4 * sf + 44) / (4 * sf)) * (this.config.codingRate + 4);
    return symbols * symbolDuration;
  }
}

// =============================================================================
// BACKHAUL RADIO
// =============================================================================

/**
 * 60GHz backhaul radio (802.11ad/ay style)
 */
export class BackhaulRadio implements RadioDevice {
  readonly id: string;
  readonly type: HardwareDeviceType = 'backhaul-radio';
  readonly name: string;
  readonly band: FrequencyBand = '60ghz';
  channel: number = 1;
  txPower: number = 10;
  private status: 'online' | 'offline' | 'error' = 'offline';

  constructor(interfaceName: string) {
    this.id = `backhaul-${interfaceName}`;
    this.name = `60GHz Backhaul (${interfaceName})`;
  }

  async init(): Promise<void> {
    this.status = 'online';
  }

  getStatus(): HardwareDevice {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      capabilities: ['backhaul', 'high-bandwidth', 'point-to-point'],
      status: this.status,
    };
  }

  async getMetrics(): Promise<HardwareMetrics> {
    return { uptime: Date.now() };
  }

  async reset(): Promise<void> {
    this.status = 'offline';
    await this.init();
  }

  async shutdown(): Promise<void> {
    this.status = 'offline';
  }

  async setChannel(channel: number): Promise<void> {
    this.channel = channel;
  }

  async setTxPower(dbm: number): Promise<void> {
    this.txPower = dbm;
  }

  async getRSSI(): Promise<number> {
    return -60;
  }

  async scan(): Promise<ScanResult[]> {
    return [];
  }
}

// =============================================================================
// ANTENNA
// =============================================================================

/**
 * Antenna types
 */
export type AntennaType =
  | 'omni'           // Omnidirectional
  | 'sector'         // Sector antenna
  | 'panel'          // Panel/patch antenna
  | 'yagi'           // Yagi-Uda
  | 'parabolic'      // Parabolic dish
  | 'custom';        // DIY/custom

/**
 * Antenna configuration
 */
export interface AntennaConfig {
  type: AntennaType;
  gain: number;          // dBi
  beamwidth: number;     // degrees
  azimuth: number;       // degrees (0-360)
  elevation: number;     // degrees (-90 to 90)
  polarization: 'vertical' | 'horizontal' | 'circular';
}

/**
 * Antenna abstraction
 */
export class Antenna {
  readonly id: string;
  readonly config: AntennaConfig;

  constructor(id: string, config: AntennaConfig) {
    this.id = id;
    this.config = config;
  }

  /**
   * Calculate effective radiated power
   */
  getERPdBm(txPowerDbm: number, cableLossDb: number = 0): number {
    return txPowerDbm + this.config.gain - cableLossDb;
  }

  /**
   * Check if target is within beam
   */
  isTargetInBeam(targetAzimuth: number, targetElevation: number): boolean {
    const azDiff = Math.abs(this.config.azimuth - targetAzimuth);
    const elDiff = Math.abs(this.config.elevation - targetElevation);
    const halfBeam = this.config.beamwidth / 2;

    return azDiff <= halfBeam && elDiff <= halfBeam;
  }
}

// =============================================================================
// HARDWARE MANAGER
// =============================================================================

/**
 * Hardware manager - discovers and manages all devices
 */
export class HardwareManager {
  private devices: Map<string, BaseDevice> = new Map();
  private antennas: Map<string, Antenna> = new Map();

  /**
   * Discover hardware devices
   */
  async discover(): Promise<void> {
    // In production:
    // - Scan /sys/class/net for network interfaces
    // - Check for LoRa devices on SPI/serial
    // - Detect USB devices
    // - Parse udev rules

    // For now, simulate discovery
    console.log('Hardware discovery would run here');
  }

  /**
   * Register a device manually
   */
  registerDevice(device: BaseDevice): void {
    this.devices.set(device.id, device);
  }

  /**
   * Remove a device
   */
  removeDevice(deviceId: string): void {
    this.devices.delete(deviceId);
  }

  /**
   * Get all devices
   */
  getDevices(): BaseDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get device by ID
   */
  getDevice(deviceId: string): BaseDevice | null {
    return this.devices.get(deviceId) ?? null;
  }

  /**
   * Get devices by type
   */
  getDevicesByType(type: HardwareDeviceType): BaseDevice[] {
    return Array.from(this.devices.values()).filter((d) => d.type === type);
  }

  /**
   * Register an antenna
   */
  registerAntenna(antenna: Antenna): void {
    this.antennas.set(antenna.id, antenna);
  }

  /**
   * Get antennas
   */
  getAntennas(): Antenna[] {
    return Array.from(this.antennas.values());
  }

  /**
   * Initialize all devices
   */
  async initAll(): Promise<void> {
    for (const device of this.devices.values()) {
      await device.init();
    }
  }

  /**
   * Shutdown all devices
   */
  async shutdownAll(): Promise<void> {
    for (const device of this.devices.values()) {
      await device.shutdown();
    }
  }

  /**
   * Get hardware summary
   */
  getSummary(): HardwareSummary {
    const devices = this.getDevices();
    return {
      totalDevices: devices.length,
      wifiAdapters: devices.filter((d) => d.type === 'wifi-adapter').length,
      loraRadios: devices.filter((d) => d.type === 'lora-radio').length,
      backhaulRadios: devices.filter((d) => d.type === 'backhaul-radio').length,
      antennas: this.antennas.size,
      status: devices.every((d) => d.getStatus().status === 'online')
        ? 'all-online'
        : devices.some((d) => d.getStatus().status === 'error')
          ? 'has-errors'
          : 'partial',
    };
  }
}

/**
 * Hardware summary
 */
export interface HardwareSummary {
  totalDevices: number;
  wifiAdapters: number;
  loraRadios: number;
  backhaulRadios: number;
  antennas: number;
  status: 'all-online' | 'partial' | 'has-errors';
}

// =============================================================================
// UISP COMPATIBILITY
// =============================================================================

/**
 * UISP-compatible device info (for management systems)
 */
export interface UISPDeviceInfo {
  identification: {
    id: string;
    name: string;
    model: string;
    type: string;
    mac: string;
  };
  overview: {
    status: string;
    uptime: number;
    cpu: number;
    ram: number;
    signal: number;
  };
  interfaces: Array<{
    name: string;
    type: string;
    status: string;
    speed: number;
  }>;
}

/**
 * Convert device to UISP format
 */
export function toUISPFormat(device: BaseDevice): UISPDeviceInfo {
  const status = device.getStatus();
  return {
    identification: {
      id: device.id,
      name: device.name,
      model: status.model || 'Unknown',
      type: device.type,
      mac: '00:00:00:00:00:00', // Would be real MAC
    },
    overview: {
      status: status.status,
      uptime: status.metrics?.uptime || 0,
      cpu: status.metrics?.cpuUsage || 0,
      ram: status.metrics?.memoryUsage || 0,
      signal: 0,
    },
    interfaces: [],
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  WiFiDevice,
  LoRaRadio,
  BackhaulRadio,
  Antenna,
  HardwareManager,
  toUISPFormat,
};

export type {
  BaseDevice,
  RadioDevice,
  ScanResult,
  WiFiConfig,
  LoRaConfig,
  AntennaType,
  AntennaConfig,
  HardwareSummary,
  UISPDeviceInfo,
};
