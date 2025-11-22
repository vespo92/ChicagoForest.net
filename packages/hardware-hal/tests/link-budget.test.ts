/**
 * Link Budget Calculator Tests
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFSPL,
  calculateMaxDistanceFromFSPL,
  calculateLinkBudget,
  calculateEnvironmentPathLoss,
  quickLinkBudget,
  calculateFresnelRadius,
  calculateRequiredClearance,
  RADIO_PRESETS,
  ENVIRONMENT_LOSS_FACTORS,
  type LinkBudgetInput,
} from '../src/calculators/link-budget';

describe('Link Budget Calculator', () => {
  // ===========================================================================
  // Free Space Path Loss (FSPL) Tests
  // ===========================================================================
  describe('calculateFSPL', () => {
    it('should calculate FSPL for 1 km at 915 MHz', () => {
      const fspl = calculateFSPL(1, 915);
      // FSPL = 20*log10(1) + 20*log10(915) + 32.44 = 0 + 59.23 + 32.44 = 91.67 dB
      expect(fspl).toBeCloseTo(91.67, 1);
    });

    it('should calculate FSPL for 5 km at 2.4 GHz', () => {
      const fspl = calculateFSPL(5, 2400);
      // FSPL = 20*log10(5) + 20*log10(2400) + 32.44 = 13.98 + 67.6 + 32.44 = 114 dB
      expect(fspl).toBeCloseTo(114.02, 1);
    });

    it('should calculate FSPL for 10 km at 5.5 GHz', () => {
      const fspl = calculateFSPL(10, 5500);
      // FSPL = 20*log10(10) + 20*log10(5500) + 32.44 = 20 + 74.81 + 32.44 = 127.25 dB
      expect(fspl).toBeCloseTo(127.25, 1);
    });

    it('should throw error for zero distance', () => {
      expect(() => calculateFSPL(0, 915)).toThrow('Distance and frequency must be positive');
    });

    it('should throw error for negative frequency', () => {
      expect(() => calculateFSPL(1, -915)).toThrow('Distance and frequency must be positive');
    });

    it('should increase with distance (10x = +20 dB)', () => {
      const fspl1km = calculateFSPL(1, 915);
      const fspl10km = calculateFSPL(10, 915);
      expect(fspl10km - fspl1km).toBeCloseTo(20, 1);
    });

    it('should increase with frequency (10x = +20 dB)', () => {
      const fspl915 = calculateFSPL(1, 915);
      const fspl9150 = calculateFSPL(1, 9150);
      expect(fspl9150 - fspl915).toBeCloseTo(20, 1);
    });
  });

  // ===========================================================================
  // Max Distance from FSPL Tests
  // ===========================================================================
  describe('calculateMaxDistanceFromFSPL', () => {
    it('should inverse FSPL calculation correctly', () => {
      const distance = 5;
      const frequency = 915;
      const fspl = calculateFSPL(distance, frequency);
      const calculatedDistance = calculateMaxDistanceFromFSPL(fspl, frequency);
      expect(calculatedDistance).toBeCloseTo(distance, 1);
    });

    it('should calculate max distance for typical LoRa link budget', () => {
      // LoRa SF12: ~140 dB path loss budget at 915 MHz
      const maxDist = calculateMaxDistanceFromFSPL(140, 915);
      expect(maxDist).toBeGreaterThan(50); // Should be >50 km
    });

    it('should calculate shorter distance for higher frequency', () => {
      const distLoRa = calculateMaxDistanceFromFSPL(120, 915);
      const distWifi = calculateMaxDistanceFromFSPL(120, 5500);
      expect(distLoRa).toBeGreaterThan(distWifi);
    });
  });

  // ===========================================================================
  // Environment Path Loss Tests
  // ===========================================================================
  describe('calculateEnvironmentPathLoss', () => {
    it('should equal FSPL in free-space environment', () => {
      const fspl = calculateFSPL(1, 915);
      const envLoss = calculateEnvironmentPathLoss(1, 915, 'free-space');
      expect(envLoss).toBeCloseTo(fspl, 2);
    });

    it('should add extra loss for urban environment', () => {
      const fspl = calculateFSPL(1, 915);
      const urbanLoss = calculateEnvironmentPathLoss(1, 915, 'urban');
      expect(urbanLoss).toBeGreaterThan(fspl);
      // Urban base loss = 15 dB + 10 dB/km * 1 km = 25 dB extra
      expect(urbanLoss - fspl).toBeCloseTo(25, 1);
    });

    it('should add more loss for indoor environment', () => {
      const suburbanLoss = calculateEnvironmentPathLoss(0.1, 2400, 'suburban');
      const indoorLoss = calculateEnvironmentPathLoss(0.1, 2400, 'indoor');
      expect(indoorLoss).toBeGreaterThan(suburbanLoss);
    });

    it('should scale loss with distance', () => {
      const loss1km = calculateEnvironmentPathLoss(1, 915, 'suburban');
      const loss2km = calculateEnvironmentPathLoss(2, 915, 'suburban');
      // Should increase due to both FSPL and environment factor
      expect(loss2km).toBeGreaterThan(loss1km);
    });
  });

  // ===========================================================================
  // Link Budget Calculation Tests
  // ===========================================================================
  describe('calculateLinkBudget', () => {
    const typicalLoRaInput: LinkBudgetInput = {
      txPowerDbm: 22,
      txAntennaGainDbi: 6,
      txCableLossDb: 1,
      rxAntennaGainDbi: 6,
      rxCableLossDb: 1,
      rxSensitivityDbm: -137,
      frequencyMhz: 915,
      distanceKm: 5,
      fadeMarginDb: 15,
    };

    it('should calculate EIRP correctly', () => {
      const result = calculateLinkBudget(typicalLoRaInput);
      // EIRP = 22 + 6 - 1 = 27 dBm
      expect(result.eirpDbm).toBe(27);
    });

    it('should calculate link margin', () => {
      const result = calculateLinkBudget(typicalLoRaInput);
      expect(result.linkMarginDb).toBeGreaterThan(0);
    });

    it('should determine link viability', () => {
      const result = calculateLinkBudget(typicalLoRaInput);
      expect(result.isViable).toBe(true);
    });

    it('should show link as non-viable at extreme distance', () => {
      const extremeInput: LinkBudgetInput = {
        ...typicalLoRaInput,
        distanceKm: 500, // 500 km - way too far
      };
      const result = calculateLinkBudget(extremeInput);
      expect(result.isViable).toBe(false);
      expect(result.linkMarginDb).toBeLessThan(0);
    });

    it('should include breakdown details', () => {
      const result = calculateLinkBudget(typicalLoRaInput);
      expect(result.breakdown.txPower).toBe(22);
      expect(result.breakdown.txAntennaGain).toBe(6);
      expect(result.breakdown.sensitivity).toBe(-137);
    });

    it('should calculate max distance', () => {
      const result = calculateLinkBudget(typicalLoRaInput);
      expect(result.maxDistanceKm).toBeGreaterThan(typicalLoRaInput.distanceKm);
    });

    it('should estimate reliability percentage', () => {
      const result = calculateLinkBudget(typicalLoRaInput);
      expect(result.reliabilityPercent).toBeGreaterThanOrEqual(0);
      expect(result.reliabilityPercent).toBeLessThanOrEqual(99.9);
    });

    it('should handle additional losses', () => {
      const withLosses: LinkBudgetInput = {
        ...typicalLoRaInput,
        additionalLossesDb: 10,
      };
      const baseResult = calculateLinkBudget(typicalLoRaInput);
      const lossyResult = calculateLinkBudget(withLosses);
      expect(lossyResult.linkMarginDb).toBe(baseResult.linkMarginDb - 10);
    });
  });

  // ===========================================================================
  // Quick Link Budget with Presets Tests
  // ===========================================================================
  describe('quickLinkBudget', () => {
    it('should use LoRa SF7 preset correctly', () => {
      const preset = RADIO_PRESETS.lora_915_sf7;
      const result = quickLinkBudget(preset, 1);
      expect(result.breakdown.txPower).toBe(22);
      expect(result.breakdown.sensitivity).toBe(-123);
    });

    it('should use WiFi 5GHz preset correctly', () => {
      const preset = RADIO_PRESETS.wifi_5_ac;
      const result = quickLinkBudget(preset, 0.5);
      expect(result.breakdown.txPower).toBe(23);
    });

    it('should allow antenna gain override', () => {
      const preset = RADIO_PRESETS.lora_915_sf10;
      const result = quickLinkBudget(preset, 1, { txAntennaGain: 10 });
      // EIRP should be higher with 10 dBi vs default 3 dBi
      expect(result.eirpDbm).toBeGreaterThan(
        quickLinkBudget(preset, 1).eirpDbm
      );
    });

    it('should allow fade margin override', () => {
      const preset = RADIO_PRESETS.ubiquiti_litebeam;
      const result10 = quickLinkBudget(preset, 5, { fadeMargin: 10 });
      const result20 = quickLinkBudget(preset, 5, { fadeMargin: 20 });
      // Lower margin requirement = more likely viable
      expect(result10.isViable || result10.linkMarginDb).toBeGreaterThanOrEqual(
        result20.linkMarginDb
      );
    });

    it('should have longer range for SF12 vs SF7', () => {
      const sf7 = quickLinkBudget(RADIO_PRESETS.lora_915_sf7, 10);
      const sf12 = quickLinkBudget(RADIO_PRESETS.lora_915_sf12, 10);
      expect(sf12.linkMarginDb).toBeGreaterThan(sf7.linkMarginDb);
    });
  });

  // ===========================================================================
  // Fresnel Zone Tests
  // ===========================================================================
  describe('calculateFresnelRadius', () => {
    it('should calculate first Fresnel zone radius at midpoint', () => {
      const radius = calculateFresnelRadius(10, 5, 915);
      // First Fresnel zone at midpoint of 10 km link at 915 MHz
      expect(radius).toBeGreaterThan(0);
      expect(radius).toBeLessThan(100); // Should be reasonable meters
    });

    it('should have maximum radius at midpoint', () => {
      const midRadius = calculateFresnelRadius(10, 5, 915);
      const quarterRadius = calculateFresnelRadius(10, 2.5, 915);
      expect(midRadius).toBeGreaterThan(quarterRadius);
    });

    it('should have larger radius at lower frequencies', () => {
      const radius900 = calculateFresnelRadius(5, 2.5, 900);
      const radius5500 = calculateFresnelRadius(5, 2.5, 5500);
      expect(radius900).toBeGreaterThan(radius5500);
    });

    it('should increase for higher zones', () => {
      const zone1 = calculateFresnelRadius(5, 2.5, 915, 1);
      const zone2 = calculateFresnelRadius(5, 2.5, 915, 2);
      expect(zone2).toBeGreaterThan(zone1);
    });
  });

  describe('calculateRequiredClearance', () => {
    it('should return clearance at midpoint', () => {
      const result = calculateRequiredClearance(10, 915);
      expect(result.atDistanceKm).toBe(5);
    });

    it('should calculate 60% clearance by default', () => {
      const result = calculateRequiredClearance(10, 915, 60);
      expect(result.requiredClearanceM).toBe(
        Math.round(result.maxRadiusM * 0.6 * 100) / 100
      );
    });

    it('should require more clearance for longer links', () => {
      const short = calculateRequiredClearance(5, 915);
      const long = calculateRequiredClearance(20, 915);
      expect(long.requiredClearanceM).toBeGreaterThan(short.requiredClearanceM);
    });
  });

  // ===========================================================================
  // Radio Presets Tests
  // ===========================================================================
  describe('RADIO_PRESETS', () => {
    it('should have all required fields', () => {
      for (const [key, preset] of Object.entries(RADIO_PRESETS)) {
        expect(preset.name).toBeDefined();
        expect(preset.txPowerDbm).toBeDefined();
        expect(preset.sensitivity).toBeLessThan(0);
        expect(preset.frequencyMhz).toBeGreaterThan(0);
        expect(preset.typicalAntennaGain).toBeDefined();
        expect(preset.description).toBeDefined();
      }
    });

    it('should have LoRa presets with correct sensitivity ordering', () => {
      expect(RADIO_PRESETS.lora_915_sf7.sensitivity).toBeGreaterThan(
        RADIO_PRESETS.lora_915_sf10.sensitivity
      );
      expect(RADIO_PRESETS.lora_915_sf10.sensitivity).toBeGreaterThan(
        RADIO_PRESETS.lora_915_sf12.sensitivity
      );
    });

    it('should have Ubiquiti presets with high antenna gains', () => {
      expect(RADIO_PRESETS.ubiquiti_litebeam.typicalAntennaGain).toBeGreaterThan(20);
      expect(RADIO_PRESETS.ubiquiti_powerbeam.typicalAntennaGain).toBeGreaterThan(20);
    });
  });

  // ===========================================================================
  // Environment Loss Factors Tests
  // ===========================================================================
  describe('ENVIRONMENT_LOSS_FACTORS', () => {
    it('should have free-space with no extra loss', () => {
      expect(ENVIRONMENT_LOSS_FACTORS['free-space'].baseExtraLossDb).toBe(0);
      expect(ENVIRONMENT_LOSS_FACTORS['free-space'].lossPerKmDb).toBe(0);
    });

    it('should order environments by increasing loss', () => {
      const freeSpace = ENVIRONMENT_LOSS_FACTORS['free-space'].baseExtraLossDb;
      const rural = ENVIRONMENT_LOSS_FACTORS.rural.baseExtraLossDb;
      const suburban = ENVIRONMENT_LOSS_FACTORS.suburban.baseExtraLossDb;
      const urban = ENVIRONMENT_LOSS_FACTORS.urban.baseExtraLossDb;
      const denseUrban = ENVIRONMENT_LOSS_FACTORS['urban-dense'].baseExtraLossDb;

      expect(freeSpace).toBeLessThan(rural);
      expect(rural).toBeLessThan(suburban);
      expect(suburban).toBeLessThan(urban);
      expect(urban).toBeLessThan(denseUrban);
    });

    it('should have indoor with highest loss', () => {
      expect(ENVIRONMENT_LOSS_FACTORS.indoor.baseExtraLossDb).toBeGreaterThan(
        ENVIRONMENT_LOSS_FACTORS['urban-dense'].baseExtraLossDb
      );
    });
  });
});
