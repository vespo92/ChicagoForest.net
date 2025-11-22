/**
 * RF Calculator Tests
 *
 * Unit tests for link budget, coverage area, and LoRa airtime calculators.
 *
 * @module @chicago-forest/hardware-hal/tests/calculators
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFSPL,
  calculateMaxDistanceFromFSPL,
  calculateLinkBudget,
  quickLinkBudget,
  calculateFresnelRadius,
  calculateRequiredClearance,
  calculateEnvironmentPathLoss,
  RADIO_PRESETS,
  ENVIRONMENT_LOSS_FACTORS,
} from '../src/calculators/link-budget';

import {
  calculateLoRaAirtime,
  estimateLoRaRange,
  MESHTASTIC_PRESETS,
  US915_PLAN,
  EU868_PLAN,
  SX1262_SPEC,
  SX1276_SPEC,
} from '../src/radios/lora-specs';

// =============================================================================
// FREE SPACE PATH LOSS TESTS
// =============================================================================

describe('Free Space Path Loss (FSPL)', () => {
  it('should calculate FSPL correctly for 1km at 915MHz', () => {
    const fspl = calculateFSPL(1, 915);
    // FSPL = 20*log10(1) + 20*log10(915) + 32.44 = 0 + 59.23 + 32.44 = 91.67
    expect(fspl).toBeCloseTo(91.67, 1);
  });

  it('should calculate FSPL correctly for 10km at 915MHz', () => {
    const fspl = calculateFSPL(10, 915);
    // FSPL = 20*log10(10) + 20*log10(915) + 32.44 = 20 + 59.23 + 32.44 = 111.67
    expect(fspl).toBeCloseTo(111.67, 1);
  });

  it('should calculate FSPL correctly for 1km at 2.4GHz', () => {
    const fspl = calculateFSPL(1, 2400);
    // FSPL = 20*log10(1) + 20*log10(2400) + 32.44 = 0 + 67.6 + 32.44 = 100.04
    expect(fspl).toBeCloseTo(100.04, 1);
  });

  it('should calculate FSPL correctly for 1km at 5.8GHz', () => {
    const fspl = calculateFSPL(1, 5800);
    // Higher frequency = higher path loss
    expect(fspl).toBeGreaterThan(calculateFSPL(1, 2400));
  });

  it('should throw error for zero distance', () => {
    expect(() => calculateFSPL(0, 915)).toThrow();
  });

  it('should throw error for negative frequency', () => {
    expect(() => calculateFSPL(1, -915)).toThrow();
  });

  it('should increase with distance', () => {
    const fspl1 = calculateFSPL(1, 915);
    const fspl2 = calculateFSPL(2, 915);
    const fspl10 = calculateFSPL(10, 915);

    expect(fspl2).toBeGreaterThan(fspl1);
    expect(fspl10).toBeGreaterThan(fspl2);

    // Doubling distance adds ~6dB
    expect(fspl2 - fspl1).toBeCloseTo(6.02, 1);
  });

  it('should increase with frequency', () => {
    const fspl915 = calculateFSPL(1, 915);
    const fspl2400 = calculateFSPL(1, 2400);
    const fspl5800 = calculateFSPL(1, 5800);

    expect(fspl2400).toBeGreaterThan(fspl915);
    expect(fspl5800).toBeGreaterThan(fspl2400);
  });
});

describe('Max Distance from FSPL', () => {
  it('should calculate inverse of FSPL correctly', () => {
    const distance = 5;
    const frequency = 915;
    const fspl = calculateFSPL(distance, frequency);
    const calculatedDistance = calculateMaxDistanceFromFSPL(fspl, frequency);

    expect(calculatedDistance).toBeCloseTo(distance, 1);
  });

  it('should handle high path loss values', () => {
    const distance = calculateMaxDistanceFromFSPL(130, 915);
    expect(distance).toBeGreaterThan(0);
  });
});

// =============================================================================
// LINK BUDGET TESTS
// =============================================================================

describe('Link Budget Calculator', () => {
  const standardInput = {
    txPowerDbm: 22,
    txAntennaGainDbi: 3,
    txCableLossDb: 1,
    rxAntennaGainDbi: 3,
    rxCableLossDb: 1,
    rxSensitivityDbm: -137,
    frequencyMhz: 915,
    distanceKm: 5,
    fadeMarginDb: 15,
  };

  it('should calculate EIRP correctly', () => {
    const result = calculateLinkBudget(standardInput);
    // EIRP = TX Power + TX Antenna Gain - TX Cable Loss
    // EIRP = 22 + 3 - 1 = 24
    expect(result.eirpDbm).toBe(24);
  });

  it('should calculate received power correctly', () => {
    const result = calculateLinkBudget(standardInput);
    // Received = EIRP - FSPL + RX Gain - RX Cable Loss
    const expectedFspl = calculateFSPL(5, 915);
    const expectedRx = 24 - expectedFspl + 3 - 1;
    expect(result.receivedPowerDbm).toBeCloseTo(expectedRx, 1);
  });

  it('should determine link viability correctly', () => {
    // With good margin, link should be viable
    const viableResult = calculateLinkBudget(standardInput);
    expect(viableResult.isViable).toBe(true);
    expect(viableResult.linkMarginDb).toBeGreaterThan(15);

    // At extreme distance, link should not be viable
    const extremeInput = { ...standardInput, distanceKm: 100 };
    const extremeResult = calculateLinkBudget(extremeInput);
    expect(extremeResult.isViable).toBe(false);
  });

  it('should include additional losses', () => {
    const withLosses = calculateLinkBudget({
      ...standardInput,
      additionalLossesDb: 10,
    });
    const withoutLosses = calculateLinkBudget(standardInput);

    expect(withLosses.receivedPowerDbm).toBe(withoutLosses.receivedPowerDbm - 10);
  });

  it('should calculate max distance correctly', () => {
    const result = calculateLinkBudget(standardInput);
    expect(result.maxDistanceKm).toBeGreaterThan(standardInput.distanceKm);
  });

  it('should provide detailed breakdown', () => {
    const result = calculateLinkBudget(standardInput);

    expect(result.breakdown).toHaveProperty('txPower');
    expect(result.breakdown).toHaveProperty('txAntennaGain');
    expect(result.breakdown).toHaveProperty('txCableLoss');
    expect(result.breakdown).toHaveProperty('eirp');
    expect(result.breakdown).toHaveProperty('fspl');
    expect(result.breakdown).toHaveProperty('rxAntennaGain');
    expect(result.breakdown).toHaveProperty('rxCableLoss');
    expect(result.breakdown).toHaveProperty('receivedPower');
    expect(result.breakdown).toHaveProperty('sensitivity');
    expect(result.breakdown).toHaveProperty('margin');
  });
});

describe('Quick Link Budget', () => {
  it('should work with LoRa presets', () => {
    const result = quickLinkBudget(RADIO_PRESETS.lora_915_sf12, 5);

    expect(result.eirpDbm).toBeDefined();
    expect(result.isViable).toBeDefined();
    expect(result.maxDistanceKm).toBeGreaterThan(0);
  });

  it('should work with WiFi presets', () => {
    const result = quickLinkBudget(RADIO_PRESETS.wifi_24_n, 0.5);

    expect(result.eirpDbm).toBeDefined();
    expect(result.isViable).toBeDefined();
  });

  it('should accept custom options', () => {
    const result = quickLinkBudget(RADIO_PRESETS.lora_915_sf12, 5, {
      txAntennaGain: 10,
      fadeMargin: 20,
    });

    expect(result.breakdown.txAntennaGain).toBe(10);
  });

  it('should have higher range with higher SF', () => {
    const sf7 = quickLinkBudget(RADIO_PRESETS.lora_915_sf7, 10);
    const sf12 = quickLinkBudget(RADIO_PRESETS.lora_915_sf12, 10);

    // SF12 has better sensitivity, so should have higher margin
    expect(sf12.linkMarginDb).toBeGreaterThan(sf7.linkMarginDb);
  });
});

// =============================================================================
// ENVIRONMENT PATH LOSS TESTS
// =============================================================================

describe('Environment Path Loss', () => {
  it('should add no extra loss for free-space', () => {
    const fspl = calculateFSPL(1, 915);
    const envLoss = calculateEnvironmentPathLoss(1, 915, 'free-space');
    expect(envLoss).toBe(fspl);
  });

  it('should add extra loss for urban environments', () => {
    const fspl = calculateFSPL(1, 915);
    const urbanLoss = calculateEnvironmentPathLoss(1, 915, 'urban');
    const denseUrbanLoss = calculateEnvironmentPathLoss(1, 915, 'urban-dense');

    expect(urbanLoss).toBeGreaterThan(fspl);
    expect(denseUrbanLoss).toBeGreaterThan(urbanLoss);
  });

  it('should scale with distance', () => {
    const urban1km = calculateEnvironmentPathLoss(1, 915, 'urban');
    const urban5km = calculateEnvironmentPathLoss(5, 915, 'urban');

    expect(urban5km).toBeGreaterThan(urban1km);
  });

  it('should have all environment types defined', () => {
    expect(ENVIRONMENT_LOSS_FACTORS).toHaveProperty('free-space');
    expect(ENVIRONMENT_LOSS_FACTORS).toHaveProperty('urban');
    expect(ENVIRONMENT_LOSS_FACTORS).toHaveProperty('urban-dense');
    expect(ENVIRONMENT_LOSS_FACTORS).toHaveProperty('suburban');
    expect(ENVIRONMENT_LOSS_FACTORS).toHaveProperty('rural');
    expect(ENVIRONMENT_LOSS_FACTORS).toHaveProperty('indoor');
  });
});

// =============================================================================
// FRESNEL ZONE TESTS
// =============================================================================

describe('Fresnel Zone Calculator', () => {
  it('should calculate maximum radius at midpoint', () => {
    const totalDistance = 10; // km
    const midpoint = 5; // km

    const midRadius = calculateFresnelRadius(totalDistance, midpoint, 915);
    const quarterRadius = calculateFresnelRadius(totalDistance, 2.5, 915);

    // Radius should be maximum at midpoint
    expect(midRadius).toBeGreaterThan(quarterRadius);
  });

  it('should be zero at endpoints', () => {
    const radius0 = calculateFresnelRadius(10, 0.001, 915);
    const radius10 = calculateFresnelRadius(10, 9.999, 915);

    // Radius should be very small near endpoints
    expect(radius0).toBeLessThan(1);
    expect(radius10).toBeLessThan(1);
  });

  it('should increase with zone number', () => {
    const zone1 = calculateFresnelRadius(10, 5, 915, 1);
    const zone2 = calculateFresnelRadius(10, 5, 915, 2);

    expect(zone2).toBeGreaterThan(zone1);
  });

  it('should decrease with frequency', () => {
    const radius915 = calculateFresnelRadius(10, 5, 915);
    const radius5800 = calculateFresnelRadius(10, 5, 5800);

    expect(radius915).toBeGreaterThan(radius5800);
  });
});

describe('Required Clearance Calculator', () => {
  it('should calculate 60% clearance by default', () => {
    const clearance = calculateRequiredClearance(10, 915);

    expect(clearance.requiredClearanceM).toBe(
      Math.round(clearance.maxRadiusM * 0.6 * 100) / 100
    );
  });

  it('should calculate at midpoint', () => {
    const clearance = calculateRequiredClearance(10, 915);
    expect(clearance.atDistanceKm).toBe(5);
  });

  it('should respect custom clearance percentage', () => {
    const c60 = calculateRequiredClearance(10, 915, 60);
    const c80 = calculateRequiredClearance(10, 915, 80);

    expect(c80.requiredClearanceM).toBeGreaterThan(c60.requiredClearanceM);
  });
});

// =============================================================================
// LORA AIRTIME TESTS
// =============================================================================

describe('LoRa Airtime Calculator', () => {
  it('should calculate airtime for different SFs', () => {
    const sf7 = calculateLoRaAirtime(50, 7, 125000);
    const sf12 = calculateLoRaAirtime(50, 12, 125000);

    // Higher SF = longer airtime
    expect(sf12).toBeGreaterThan(sf7);
  });

  it('should calculate airtime for different bandwidths', () => {
    const bw125 = calculateLoRaAirtime(50, 10, 125000);
    const bw250 = calculateLoRaAirtime(50, 10, 250000);
    const bw500 = calculateLoRaAirtime(50, 10, 500000);

    // Higher BW = shorter airtime
    expect(bw125).toBeGreaterThan(bw250);
    expect(bw250).toBeGreaterThan(bw500);
  });

  it('should increase with payload size', () => {
    const small = calculateLoRaAirtime(10, 10, 125000);
    const large = calculateLoRaAirtime(100, 10, 125000);

    expect(large).toBeGreaterThan(small);
  });

  it('should return reasonable values', () => {
    // Typical Meshtastic message ~50 bytes at SF11
    const airtime = calculateLoRaAirtime(50, 11, 250000);

    // Should be in reasonable range (100ms - 2s)
    expect(airtime).toBeGreaterThan(100);
    expect(airtime).toBeLessThan(2000);
  });
});

// =============================================================================
// LORA RANGE ESTIMATOR TESTS
// =============================================================================

describe('LoRa Range Estimator', () => {
  it('should estimate range for different environments', () => {
    const range = estimateLoRaRange(22, 3, 12, 125000);

    expect(range.urban).toBeDefined();
    expect(range.suburban).toBeDefined();
    expect(range.rural).toBeDefined();
    expect(range.los).toBeDefined();

    // Range should increase: urban < suburban < rural < los
    expect(range.suburban).toBeGreaterThan(range.urban);
    expect(range.rural).toBeGreaterThan(range.suburban);
    expect(range.los).toBeGreaterThan(range.rural);
  });

  it('should increase with TX power', () => {
    const low = estimateLoRaRange(14, 3, 12, 125000);
    const high = estimateLoRaRange(22, 3, 12, 125000);

    expect(high.urban).toBeGreaterThan(low.urban);
  });

  it('should increase with antenna gain', () => {
    const low = estimateLoRaRange(22, 0, 12, 125000);
    const high = estimateLoRaRange(22, 6, 12, 125000);

    expect(high.urban).toBeGreaterThan(low.urban);
  });

  it('should increase with spreading factor', () => {
    const sf7 = estimateLoRaRange(22, 3, 7, 125000);
    const sf12 = estimateLoRaRange(22, 3, 12, 125000);

    expect(sf12.urban).toBeGreaterThan(sf7.urban);
  });
});

// =============================================================================
// REGIONAL PLAN TESTS
// =============================================================================

describe('Regional Plans', () => {
  it('should have valid US915 plan', () => {
    expect(US915_PLAN.region).toBe('US915');
    expect(US915_PLAN.frequencyStart).toBe(902_000_000);
    expect(US915_PLAN.frequencyEnd).toBe(928_000_000);
    expect(US915_PLAN.maxTxPower).toBe(30);
    expect(US915_PLAN.channels.length).toBeGreaterThan(0);
  });

  it('should have valid EU868 plan', () => {
    expect(EU868_PLAN.region).toBe('EU868');
    expect(EU868_PLAN.frequencyStart).toBe(863_000_000);
    expect(EU868_PLAN.frequencyEnd).toBe(870_000_000);
    expect(EU868_PLAN.dutyCycle).toBe(1); // 1% duty cycle
  });

  it('should have correct channel structure', () => {
    const channel = US915_PLAN.channels[0];
    expect(channel).toHaveProperty('number');
    expect(channel).toHaveProperty('frequency');
    expect(channel).toHaveProperty('bandwidth');
    expect(channel).toHaveProperty('spreadingFactors');
  });
});

// =============================================================================
// CHIP SPECIFICATION TESTS
// =============================================================================

describe('LoRa Chip Specifications', () => {
  it('should have valid SX1262 specifications', () => {
    expect(SX1262_SPEC.model).toBe('SX1262');
    expect(SX1262_SPEC.manufacturer).toBe('Semtech');
    expect(SX1262_SPEC.maxTxPower).toBe(22);
    expect(SX1262_SPEC.sensitivity).toBe(-148);
    expect(SX1262_SPEC.productUrl).toContain('semtech.com');
  });

  it('should have valid SX1276 specifications', () => {
    expect(SX1276_SPEC.model).toBe('SX1276');
    expect(SX1276_SPEC.maxTxPower).toBe(20);
    expect(SX1276_SPEC.fskSupport).toBe(true);
  });

  it('should have frequency range including 915MHz', () => {
    expect(SX1262_SPEC.frequencyRange.min).toBeLessThan(915_000_000);
    expect(SX1262_SPEC.frequencyRange.max).toBeGreaterThan(915_000_000);
  });
});

// =============================================================================
// MESHTASTIC PRESET TESTS
// =============================================================================

describe('Meshtastic Presets', () => {
  it('should have all standard presets', () => {
    expect(MESHTASTIC_PRESETS).toHaveProperty('SHORT_FAST');
    expect(MESHTASTIC_PRESETS).toHaveProperty('SHORT_SLOW');
    expect(MESHTASTIC_PRESETS).toHaveProperty('MEDIUM_FAST');
    expect(MESHTASTIC_PRESETS).toHaveProperty('MEDIUM_SLOW');
    expect(MESHTASTIC_PRESETS).toHaveProperty('LONG_FAST');
    expect(MESHTASTIC_PRESETS).toHaveProperty('LONG_SLOW');
  });

  it('should have valid preset structure', () => {
    const preset = MESHTASTIC_PRESETS.LONG_FAST;

    expect(preset).toHaveProperty('name');
    expect(preset).toHaveProperty('spreadingFactor');
    expect(preset).toHaveProperty('bandwidth');
    expect(preset).toHaveProperty('codingRate');
    expect(preset).toHaveProperty('txPower');
    expect(preset).toHaveProperty('description');
  });

  it('should have increasing range presets', () => {
    // Short presets should have lower SF than Long presets
    expect(MESHTASTIC_PRESETS.SHORT_FAST.spreadingFactor).toBeLessThan(
      MESHTASTIC_PRESETS.LONG_FAST.spreadingFactor
    );
  });
});

// =============================================================================
// RADIO PRESET TESTS
// =============================================================================

describe('Radio Presets', () => {
  it('should have LoRa presets', () => {
    expect(RADIO_PRESETS).toHaveProperty('lora_915_sf7');
    expect(RADIO_PRESETS).toHaveProperty('lora_915_sf10');
    expect(RADIO_PRESETS).toHaveProperty('lora_915_sf12');
  });

  it('should have WiFi presets', () => {
    expect(RADIO_PRESETS).toHaveProperty('wifi_24_n');
    expect(RADIO_PRESETS).toHaveProperty('wifi_5_ac');
  });

  it('should have Ubiquiti presets', () => {
    expect(RADIO_PRESETS).toHaveProperty('ubiquiti_litebeam');
    expect(RADIO_PRESETS).toHaveProperty('ubiquiti_powerbeam');
    expect(RADIO_PRESETS).toHaveProperty('airfiber_60');
  });

  it('should have valid preset structure', () => {
    const preset = RADIO_PRESETS.lora_915_sf12;

    expect(preset).toHaveProperty('name');
    expect(preset).toHaveProperty('txPowerDbm');
    expect(preset).toHaveProperty('sensitivity');
    expect(preset).toHaveProperty('frequencyMhz');
    expect(preset).toHaveProperty('typicalAntennaGain');
    expect(preset).toHaveProperty('description');
  });
});
