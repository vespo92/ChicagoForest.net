/**
 * Hardware Manager Tests
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  HardwareManager,
  WiFiDevice,
  LoRaRadio,
  BackhaulRadio,
  Antenna,
  toUISPFormat,
  type WiFiConfig,
  type LoRaConfig,
  type AntennaConfig,
} from '../src/index';

describe('Hardware Manager', () => {
  let manager: HardwareManager;

  beforeEach(() => {
    manager = new HardwareManager();
  });

  // ===========================================================================
  // Device Registration Tests
  // ===========================================================================
  describe('Device Registration', () => {
    it('should register WiFi device', () => {
      const wifi = new WiFiDevice({ interface: 'wlan0', band: '5ghz' });
      manager.registerDevice(wifi);
      expect(manager.getDevices()).toContain(wifi);
    });

    it('should register LoRa device', () => {
      const lora = new LoRaRadio({
        device: '/dev/spidev0.0',
        chip: 'sx1262',
        frequency: 915000000,
        spreadingFactor: 10,
        bandwidth: 125000,
        codingRate: 5,
        txPower: 22,
      });
      manager.registerDevice(lora);
      expect(manager.getDevices()).toContain(lora);
    });

    it('should register multiple devices', () => {
      const wifi1 = new WiFiDevice({ interface: 'wlan0', band: '2.4ghz' });
      const wifi2 = new WiFiDevice({ interface: 'wlan1', band: '5ghz' });
      const lora = new LoRaRadio({
        device: '/dev/spidev0.0',
        chip: 'sx1276',
        frequency: 915000000,
        spreadingFactor: 12,
        bandwidth: 125000,
        codingRate: 8,
        txPower: 20,
      });

      manager.registerDevice(wifi1);
      manager.registerDevice(wifi2);
      manager.registerDevice(lora);

      expect(manager.getDevices().length).toBe(3);
    });

    it('should remove device', () => {
      const wifi = new WiFiDevice({ interface: 'wlan0', band: '5ghz' });
      manager.registerDevice(wifi);
      expect(manager.getDevices().length).toBe(1);

      manager.removeDevice(wifi.id);
      expect(manager.getDevices().length).toBe(0);
    });

    it('should get device by ID', () => {
      const wifi = new WiFiDevice({ interface: 'wlan0', band: '5ghz' });
      manager.registerDevice(wifi);

      const found = manager.getDevice(wifi.id);
      expect(found).toBe(wifi);
    });

    it('should return null for unknown device ID', () => {
      const found = manager.getDevice('unknown-id');
      expect(found).toBeNull();
    });
  });

  // ===========================================================================
  // Device Type Filtering Tests
  // ===========================================================================
  describe('Device Type Filtering', () => {
    beforeEach(() => {
      manager.registerDevice(new WiFiDevice({ interface: 'wlan0', band: '2.4ghz' }));
      manager.registerDevice(new WiFiDevice({ interface: 'wlan1', band: '5ghz' }));
      manager.registerDevice(new LoRaRadio({
        device: '/dev/spidev0.0',
        chip: 'sx1262',
        frequency: 915000000,
        spreadingFactor: 10,
        bandwidth: 125000,
        codingRate: 5,
        txPower: 22,
      }));
      manager.registerDevice(new BackhaulRadio('wl60ghz0'));
    });

    it('should filter by WiFi type', () => {
      const wifiDevices = manager.getDevicesByType('wifi-adapter');
      expect(wifiDevices.length).toBe(2);
    });

    it('should filter by LoRa type', () => {
      const loraDevices = manager.getDevicesByType('lora-radio');
      expect(loraDevices.length).toBe(1);
    });

    it('should filter by backhaul type', () => {
      const backhaulDevices = manager.getDevicesByType('backhaul-radio');
      expect(backhaulDevices.length).toBe(1);
    });

    it('should return empty for non-existent type', () => {
      const unknownDevices = manager.getDevicesByType('unknown-type' as any);
      expect(unknownDevices.length).toBe(0);
    });
  });

  // ===========================================================================
  // Antenna Registration Tests
  // ===========================================================================
  describe('Antenna Registration', () => {
    it('should register antenna', () => {
      const antenna = new Antenna('ant-1', {
        type: 'omni',
        gain: 6,
        beamwidth: 360,
        azimuth: 0,
        elevation: 0,
        polarization: 'vertical',
      });
      manager.registerAntenna(antenna);
      expect(manager.getAntennas()).toContain(antenna);
    });

    it('should register multiple antennas', () => {
      manager.registerAntenna(new Antenna('ant-1', {
        type: 'omni',
        gain: 6,
        beamwidth: 360,
        azimuth: 0,
        elevation: 0,
        polarization: 'vertical',
      }));
      manager.registerAntenna(new Antenna('ant-2', {
        type: 'sector',
        gain: 15,
        beamwidth: 90,
        azimuth: 45,
        elevation: -5,
        polarization: 'horizontal',
      }));

      expect(manager.getAntennas().length).toBe(2);
    });
  });

  // ===========================================================================
  // Hardware Summary Tests
  // ===========================================================================
  describe('Hardware Summary', () => {
    it('should return empty summary initially', () => {
      const summary = manager.getSummary();
      expect(summary.totalDevices).toBe(0);
      expect(summary.wifiAdapters).toBe(0);
      expect(summary.loraRadios).toBe(0);
      expect(summary.backhaulRadios).toBe(0);
      expect(summary.antennas).toBe(0);
    });

    it('should count devices by type', () => {
      manager.registerDevice(new WiFiDevice({ interface: 'wlan0', band: '2.4ghz' }));
      manager.registerDevice(new WiFiDevice({ interface: 'wlan1', band: '5ghz' }));
      manager.registerDevice(new LoRaRadio({
        device: '/dev/spidev0.0',
        chip: 'sx1262',
        frequency: 915000000,
        spreadingFactor: 10,
        bandwidth: 125000,
        codingRate: 5,
        txPower: 22,
      }));
      manager.registerAntenna(new Antenna('ant-1', {
        type: 'omni',
        gain: 6,
        beamwidth: 360,
        azimuth: 0,
        elevation: 0,
        polarization: 'vertical',
      }));

      const summary = manager.getSummary();
      expect(summary.totalDevices).toBe(3);
      expect(summary.wifiAdapters).toBe(2);
      expect(summary.loraRadios).toBe(1);
      expect(summary.backhaulRadios).toBe(0);
      expect(summary.antennas).toBe(1);
    });

    it('should report partial status for offline devices', () => {
      manager.registerDevice(new WiFiDevice({ interface: 'wlan0', band: '2.4ghz' }));
      const summary = manager.getSummary();
      // New devices start offline
      expect(summary.status).toBe('partial');
    });
  });

  // ===========================================================================
  // Device Lifecycle Tests
  // ===========================================================================
  describe('Device Lifecycle', () => {
    it('should initialize all devices', async () => {
      const wifi = new WiFiDevice({ interface: 'wlan0', band: '5ghz' });
      manager.registerDevice(wifi);

      await manager.initAll();

      const status = wifi.getStatus();
      expect(status.status).toBe('online');
    });

    it('should shutdown all devices', async () => {
      const wifi = new WiFiDevice({ interface: 'wlan0', band: '5ghz' });
      manager.registerDevice(wifi);

      await manager.initAll();
      await manager.shutdownAll();

      const status = wifi.getStatus();
      expect(status.status).toBe('offline');
    });
  });
});

// ===========================================================================
// WiFi Device Tests
// ===========================================================================
describe('WiFiDevice', () => {
  const config: WiFiConfig = {
    interface: 'wlan0',
    band: '5ghz',
    channel: 36,
    txPower: 23,
    mode: 'mesh',
  };

  it('should create with correct ID', () => {
    const wifi = new WiFiDevice(config);
    expect(wifi.id).toBe('wifi-wlan0');
  });

  it('should have correct type', () => {
    const wifi = new WiFiDevice(config);
    expect(wifi.type).toBe('wifi-adapter');
  });

  it('should use default values', () => {
    const wifi = new WiFiDevice({ interface: 'wlan0', band: '2.4ghz' });
    expect(wifi.channel).toBe(1);
    expect(wifi.txPower).toBe(20);
  });

  it('should start offline', () => {
    const wifi = new WiFiDevice(config);
    expect(wifi.getStatus().status).toBe('offline');
  });

  it('should go online after init', async () => {
    const wifi = new WiFiDevice(config);
    await wifi.init();
    expect(wifi.getStatus().status).toBe('online');
  });

  it('should set channel', async () => {
    const wifi = new WiFiDevice(config);
    await wifi.setChannel(44);
    expect(wifi.channel).toBe(44);
  });

  it('should cap TX power at 30 dBm', async () => {
    const wifi = new WiFiDevice(config);
    await wifi.setTxPower(40);
    expect(wifi.txPower).toBe(30);
  });

  it('should reset correctly', async () => {
    const wifi = new WiFiDevice(config);
    await wifi.init();
    expect(wifi.getStatus().status).toBe('online');
    await wifi.reset();
    expect(wifi.getStatus().status).toBe('online');
  });

  it('should shutdown correctly', async () => {
    const wifi = new WiFiDevice(config);
    await wifi.init();
    await wifi.shutdown();
    expect(wifi.getStatus().status).toBe('offline');
  });

  it('should have mesh capability', () => {
    const wifi = new WiFiDevice(config);
    expect(wifi.getStatus().capabilities).toContain('mesh');
  });
});

// ===========================================================================
// LoRa Radio Tests
// ===========================================================================
describe('LoRaRadio', () => {
  const config: LoRaConfig = {
    device: '/dev/spidev0.0',
    chip: 'sx1262',
    frequency: 915000000,
    spreadingFactor: 10,
    bandwidth: 125000,
    codingRate: 5,
    txPower: 22,
  };

  it('should create with correct ID', () => {
    const lora = new LoRaRadio(config);
    expect(lora.id).toBe('lora-/dev/spidev0.0');
  });

  it('should have correct type', () => {
    const lora = new LoRaRadio(config);
    expect(lora.type).toBe('lora-radio');
  });

  it('should calculate US915 channel', () => {
    const lora = new LoRaRadio(config);
    // (915000000 - 902000000) / 200000 = 65
    expect(lora.channel).toBe(65);
  });

  it('should start offline', () => {
    const lora = new LoRaRadio(config);
    expect(lora.getStatus().status).toBe('offline');
  });

  it('should include chip model in status', () => {
    const lora = new LoRaRadio(config);
    expect(lora.getStatus().model).toBe('SX1262');
  });

  it('should cap TX power at 22 dBm', async () => {
    const lora = new LoRaRadio(config);
    await lora.setTxPower(30);
    expect(lora.txPower).toBe(22);
  });

  it('should calculate time on air', () => {
    const lora = new LoRaRadio(config);
    const toa = lora.calculateTimeOnAir(50);
    expect(toa).toBeGreaterThan(0);
  });

  it('should have LoRa capabilities', () => {
    const lora = new LoRaRadio(config);
    const caps = lora.getStatus().capabilities;
    expect(caps).toContain('lora');
    expect(caps).toContain('long-range');
  });
});

// ===========================================================================
// Backhaul Radio Tests
// ===========================================================================
describe('BackhaulRadio', () => {
  it('should create with correct ID', () => {
    const backhaul = new BackhaulRadio('wl60ghz0');
    expect(backhaul.id).toBe('backhaul-wl60ghz0');
  });

  it('should have correct band', () => {
    const backhaul = new BackhaulRadio('wl60ghz0');
    expect(backhaul.band).toBe('60ghz');
  });

  it('should have backhaul capabilities', () => {
    const backhaul = new BackhaulRadio('wl60ghz0');
    const caps = backhaul.getStatus().capabilities;
    expect(caps).toContain('backhaul');
    expect(caps).toContain('high-bandwidth');
    expect(caps).toContain('point-to-point');
  });
});

// ===========================================================================
// Antenna Tests
// ===========================================================================
describe('Antenna', () => {
  const omniConfig: AntennaConfig = {
    type: 'omni',
    gain: 6,
    beamwidth: 360,
    azimuth: 0,
    elevation: 0,
    polarization: 'vertical',
  };

  const sectorConfig: AntennaConfig = {
    type: 'sector',
    gain: 15,
    beamwidth: 90,
    azimuth: 45,
    elevation: -5,
    polarization: 'horizontal',
  };

  describe('ERP Calculation', () => {
    it('should calculate ERP correctly', () => {
      const antenna = new Antenna('ant-1', omniConfig);
      // 20 dBm + 6 dBi - 0 dB = 26 dBm
      expect(antenna.getERPdBm(20)).toBe(26);
    });

    it('should subtract cable loss', () => {
      const antenna = new Antenna('ant-1', omniConfig);
      // 20 dBm + 6 dBi - 2 dB = 24 dBm
      expect(antenna.getERPdBm(20, 2)).toBe(24);
    });

    it('should handle high gain antenna', () => {
      const antenna = new Antenna('ant-1', { ...sectorConfig, gain: 25 });
      // 20 dBm + 25 dBi = 45 dBm
      expect(antenna.getERPdBm(20)).toBe(45);
    });
  });

  describe('Beam Coverage', () => {
    it('should detect target in omni beam', () => {
      const antenna = new Antenna('ant-1', omniConfig);
      expect(antenna.isTargetInBeam(90, 0)).toBe(true);
      expect(antenna.isTargetInBeam(180, 0)).toBe(true);
    });

    it('should detect target in sector beam', () => {
      const antenna = new Antenna('ant-1', sectorConfig);
      // Azimuth 45, beamwidth 90, so valid range is 0-90
      expect(antenna.isTargetInBeam(45, -5)).toBe(true);
      expect(antenna.isTargetInBeam(0, -5)).toBe(true);
      expect(antenna.isTargetInBeam(90, -5)).toBe(true);
    });

    it('should reject target outside sector beam', () => {
      const antenna = new Antenna('ant-1', sectorConfig);
      expect(antenna.isTargetInBeam(180, 0)).toBe(false);
    });
  });
});

// ===========================================================================
// UISP Format Tests
// ===========================================================================
describe('toUISPFormat', () => {
  it('should convert WiFi device to UISP format', () => {
    const wifi = new WiFiDevice({ interface: 'wlan0', band: '5ghz' });
    const uisp = toUISPFormat(wifi);

    expect(uisp.identification.id).toBe('wifi-wlan0');
    expect(uisp.identification.type).toBe('wifi-adapter');
    expect(uisp.overview.status).toBe('offline');
  });

  it('should include overview metrics', () => {
    const wifi = new WiFiDevice({ interface: 'wlan0', band: '5ghz' });
    const uisp = toUISPFormat(wifi);

    expect(uisp.overview.uptime).toBeDefined();
    expect(uisp.overview.cpu).toBeDefined();
    expect(uisp.overview.ram).toBeDefined();
  });

  it('should include interfaces array', () => {
    const wifi = new WiFiDevice({ interface: 'wlan0', band: '5ghz' });
    const uisp = toUISPFormat(wifi);

    expect(uisp.interfaces).toBeDefined();
    expect(Array.isArray(uisp.interfaces)).toBe(true);
  });
});
