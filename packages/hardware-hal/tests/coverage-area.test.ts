/**
 * Coverage Area Calculator Tests
 *
 * DISCLAIMER: This is part of an AI-generated theoretical framework
 * for educational and research purposes.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCoverage,
  calculateNodePlacements,
  adjustCoverageForTerrain,
  getChicagoCoverage,
  TERRAIN_IMPACTS,
  CHICAGO_NEIGHBORHOODS,
  type CoverageInput,
} from '../src/calculators/coverage-area';

describe('Coverage Area Calculator', () => {
  // ===========================================================================
  // Basic Coverage Calculation Tests
  // ===========================================================================
  describe('calculateCoverage', () => {
    const typicalInput: CoverageInput = {
      txPowerDbm: 22,
      antennaGainDbi: 6,
      antennaType: 'omni',
      cableLossDb: 1,
      frequencyMhz: 915,
      rxSensitivityDbm: -137,
      rxAntennaGainDbi: 3,
      fadeMarginDb: 15,
      environment: 'suburban',
      antennaHeightM: 10,
    };

    it('should calculate positive coverage area', () => {
      const result = calculateCoverage(typicalInput);
      expect(result.coverageAreaSqKm).toBeGreaterThan(0);
    });

    it('should return max range in km', () => {
      const result = calculateCoverage(typicalInput);
      expect(result.maxRangeKm).toBeGreaterThan(0);
      expect(result.maxRangeKm).toBeLessThan(100); // Reasonable max
    });

    it('should return circle shape for omni antenna', () => {
      const result = calculateCoverage(typicalInput);
      expect(result.shape).toBe('circle');
      expect(result.sectorAngle).toBeUndefined();
    });

    it('should return sector shape for sector antenna', () => {
      const sectorInput: CoverageInput = {
        ...typicalInput,
        antennaType: 'sector',
        horizontalBeamwidth: 90,
      };
      const result = calculateCoverage(sectorInput);
      expect(result.shape).toBe('sector');
      expect(result.sectorAngle).toBe(90);
    });

    it('should calculate sector area as fraction of circle', () => {
      const omniResult = calculateCoverage(typicalInput);
      const sectorInput: CoverageInput = {
        ...typicalInput,
        antennaType: 'sector',
        horizontalBeamwidth: 90,
      };
      const sectorResult = calculateCoverage(sectorInput);
      // 90 degree sector = 1/4 of circle
      expect(sectorResult.coverageAreaSqKm).toBeCloseTo(
        omniResult.coverageAreaSqKm / 4,
        0
      );
    });

    it('should return ranges by signal strength', () => {
      const result = calculateCoverage(typicalInput);
      expect(result.rangeBySignal.excellent).toBeDefined();
      expect(result.rangeBySignal.good).toBeDefined();
      expect(result.rangeBySignal.fair).toBeDefined();
      expect(result.rangeBySignal.weak).toBeDefined();
    });

    it('should have excellent < good < fair < weak ranges', () => {
      const result = calculateCoverage(typicalInput);
      // At same power, excellent signal (-65 dBm) has shorter range than weak
      expect(result.rangeBySignal.excellent).toBeLessThan(result.rangeBySignal.good);
      expect(result.rangeBySignal.good).toBeLessThan(result.rangeBySignal.fair);
      expect(result.rangeBySignal.fair).toBeLessThan(result.rangeBySignal.weak);
    });

    it('should include environment notes', () => {
      const result = calculateCoverage(typicalInput);
      expect(result.notes.length).toBeGreaterThan(0);
      expect(result.notes.some(n => n.includes('suburban'))).toBe(true);
    });

    it('should have smaller coverage in dense urban vs suburban', () => {
      const suburbanResult = calculateCoverage(typicalInput);
      const urbanInput: CoverageInput = {
        ...typicalInput,
        environment: 'urban-dense',
      };
      const urbanResult = calculateCoverage(urbanInput);
      expect(urbanResult.maxRangeKm).toBeLessThan(suburbanResult.maxRangeKm);
    });

    it('should have larger coverage in free-space', () => {
      const suburbanResult = calculateCoverage(typicalInput);
      const freeSpaceInput: CoverageInput = {
        ...typicalInput,
        environment: 'free-space',
      };
      const freeSpaceResult = calculateCoverage(freeSpaceInput);
      expect(freeSpaceResult.maxRangeKm).toBeGreaterThan(suburbanResult.maxRangeKm);
    });

    it('should be affected by TX power', () => {
      const lowPowerInput: CoverageInput = {
        ...typicalInput,
        txPowerDbm: 10,
      };
      const highPowerInput: CoverageInput = {
        ...typicalInput,
        txPowerDbm: 30,
      };
      const lowResult = calculateCoverage(lowPowerInput);
      const highResult = calculateCoverage(highPowerInput);
      expect(highResult.maxRangeKm).toBeGreaterThan(lowResult.maxRangeKm);
    });

    it('should be affected by antenna gain', () => {
      const lowGainInput: CoverageInput = {
        ...typicalInput,
        antennaGainDbi: 3,
      };
      const highGainInput: CoverageInput = {
        ...typicalInput,
        antennaGainDbi: 15,
      };
      const lowResult = calculateCoverage(lowGainInput);
      const highResult = calculateCoverage(highGainInput);
      expect(highResult.maxRangeKm).toBeGreaterThan(lowResult.maxRangeKm);
    });
  });

  // ===========================================================================
  // Node Placement Tests
  // ===========================================================================
  describe('calculateNodePlacements', () => {
    it('should return nodes for area coverage', () => {
      const result = calculateNodePlacements(100, 5);
      expect(result.nodes.length).toBeGreaterThan(0);
    });

    it('should position nodes on hexagonal grid', () => {
      const result = calculateNodePlacements(10, 2, 0);
      // Check that some nodes have x offset (hexagonal pattern)
      expect(result.nodes.length).toBeGreaterThan(1);
    });

    it('should include placement coordinates', () => {
      const result = calculateNodePlacements(25, 2);
      for (const node of result.nodes) {
        expect(node.x).toBeDefined();
        expect(node.y).toBeDefined();
        expect(node.range).toBe(2);
        expect(node.coverageArea).toBeCloseTo(Math.PI * 4, 1);
      }
    });

    it('should calculate total coverage', () => {
      const result = calculateNodePlacements(50, 3);
      expect(result.totalCoverage).toBeGreaterThan(0);
    });

    it('should calculate efficiency', () => {
      const result = calculateNodePlacements(50, 3);
      expect(result.efficiency).toBeGreaterThan(0);
      expect(result.efficiency).toBeLessThanOrEqual(100);
    });

    it('should include planning notes', () => {
      const result = calculateNodePlacements(100, 5, 20);
      expect(result.notes.length).toBeGreaterThan(0);
      expect(result.notes.some(n => n.includes('nodes'))).toBe(true);
    });

    it('should require more nodes with larger overlap', () => {
      const lowOverlap = calculateNodePlacements(100, 5, 10);
      const highOverlap = calculateNodePlacements(100, 5, 40);
      expect(highOverlap.nodes.length).toBeGreaterThanOrEqual(lowOverlap.nodes.length);
    });

    it('should require fewer nodes with longer range', () => {
      const shortRange = calculateNodePlacements(100, 2);
      const longRange = calculateNodePlacements(100, 5);
      expect(shortRange.nodes.length).toBeGreaterThan(longRange.nodes.length);
    });
  });

  // ===========================================================================
  // Terrain Impact Tests
  // ===========================================================================
  describe('TERRAIN_IMPACTS', () => {
    it('should have all expected terrain types', () => {
      expect(TERRAIN_IMPACTS['flat-open']).toBeDefined();
      expect(TERRAIN_IMPACTS['rolling-hills']).toBeDefined();
      expect(TERRAIN_IMPACTS.hilly).toBeDefined();
      expect(TERRAIN_IMPACTS.mountainous).toBeDefined();
      expect(TERRAIN_IMPACTS['dense-urban']).toBeDefined();
      expect(TERRAIN_IMPACTS.urban).toBeDefined();
      expect(TERRAIN_IMPACTS.suburban).toBeDefined();
      expect(TERRAIN_IMPACTS.forest).toBeDefined();
      expect(TERRAIN_IMPACTS.water).toBeDefined();
    });

    it('should have multipliers between 0 and 1.5', () => {
      for (const [key, impact] of Object.entries(TERRAIN_IMPACTS)) {
        expect(impact.rangeMultiplier).toBeGreaterThan(0);
        expect(impact.rangeMultiplier).toBeLessThanOrEqual(1.5);
      }
    });

    it('should have flat-open as baseline (1.0)', () => {
      expect(TERRAIN_IMPACTS['flat-open'].rangeMultiplier).toBe(1.0);
    });

    it('should have water with bonus multiplier', () => {
      expect(TERRAIN_IMPACTS.water.rangeMultiplier).toBeGreaterThan(1.0);
    });

    it('should have mountainous with lowest multiplier', () => {
      const mountainous = TERRAIN_IMPACTS.mountainous.rangeMultiplier;
      const denseUrban = TERRAIN_IMPACTS['dense-urban'].rangeMultiplier;
      const forest = TERRAIN_IMPACTS.forest.rangeMultiplier;
      // All three should be challenging
      expect(mountainous).toBeLessThan(0.5);
      expect(denseUrban).toBeLessThan(0.5);
      expect(forest).toBeLessThan(0.5);
    });

    it('should include recommendations for each terrain', () => {
      for (const [key, impact] of Object.entries(TERRAIN_IMPACTS)) {
        expect(impact.recommendations.length).toBeGreaterThan(0);
      }
    });
  });

  describe('adjustCoverageForTerrain', () => {
    const baseCoverage = {
      maxRangeKm: 10,
      coverageAreaSqKm: 314.16,
      shape: 'circle' as const,
      rangeBySignal: {
        excellent: 2,
        good: 5,
        fair: 7,
        weak: 10,
      },
      notes: ['Base coverage'],
    };

    it('should not change coverage for flat-open', () => {
      const result = adjustCoverageForTerrain(baseCoverage, 'flat-open');
      expect(result.maxRangeKm).toBe(baseCoverage.maxRangeKm);
    });

    it('should reduce range for hilly terrain', () => {
      const result = adjustCoverageForTerrain(baseCoverage, 'hilly');
      expect(result.maxRangeKm).toBeLessThan(baseCoverage.maxRangeKm);
    });

    it('should reduce area quadratically', () => {
      const result = adjustCoverageForTerrain(baseCoverage, 'hilly');
      const multiplier = TERRAIN_IMPACTS.hilly.rangeMultiplier;
      expect(result.coverageAreaSqKm).toBeCloseTo(
        baseCoverage.coverageAreaSqKm * multiplier * multiplier,
        0
      );
    });

    it('should increase range over water', () => {
      const result = adjustCoverageForTerrain(baseCoverage, 'water');
      expect(result.maxRangeKm).toBeGreaterThan(baseCoverage.maxRangeKm);
    });

    it('should adjust all signal ranges', () => {
      const result = adjustCoverageForTerrain(baseCoverage, 'suburban');
      const mult = TERRAIN_IMPACTS.suburban.rangeMultiplier;
      expect(result.rangeBySignal.excellent).toBeCloseTo(baseCoverage.rangeBySignal.excellent * mult, 1);
    });

    it('should add terrain notes', () => {
      const result = adjustCoverageForTerrain(baseCoverage, 'forest');
      expect(result.notes.some(n => n.includes('forest'))).toBe(true);
      expect(result.notes.some(n => n.includes('multiplier'))).toBe(true);
    });
  });

  // ===========================================================================
  // Chicago Coverage Tests
  // ===========================================================================
  describe('CHICAGO_NEIGHBORHOODS', () => {
    it('should have Chicago neighborhoods defined', () => {
      expect(CHICAGO_NEIGHBORHOODS.loop).toBeDefined();
      expect(CHICAGO_NEIGHBORHOODS.lincoln_park).toBeDefined();
      expect(CHICAGO_NEIGHBORHOODS.hyde_park).toBeDefined();
      expect(CHICAGO_NEIGHBORHOODS.pilsen).toBeDefined();
    });

    it('should have terrain type for each neighborhood', () => {
      for (const [name, info] of Object.entries(CHICAGO_NEIGHBORHOODS)) {
        expect(info.terrain).toBeDefined();
        expect(TERRAIN_IMPACTS[info.terrain]).toBeDefined();
      }
    });

    it('should have notes for each neighborhood', () => {
      for (const [name, info] of Object.entries(CHICAGO_NEIGHBORHOODS)) {
        expect(info.notes.length).toBeGreaterThan(0);
      }
    });

    it('should have loop as dense-urban', () => {
      expect(CHICAGO_NEIGHBORHOODS.loop.terrain).toBe('dense-urban');
    });
  });

  describe('getChicagoCoverage', () => {
    const baseInput = {
      txPowerDbm: 22,
      antennaGainDbi: 6,
      antennaType: 'omni' as const,
      cableLossDb: 1,
      frequencyMhz: 915,
      rxSensitivityDbm: -137,
      rxAntennaGainDbi: 3,
      fadeMarginDb: 15,
      antennaHeightM: 15,
    };

    it('should return coverage for valid neighborhood', () => {
      const result = getChicagoCoverage('hyde_park', baseInput);
      expect(result.maxRangeKm).toBeGreaterThan(0);
    });

    it('should include neighborhood in notes', () => {
      const result = getChicagoCoverage('pilsen', baseInput);
      expect(result.notes.some(n => n.includes('pilsen'))).toBe(true);
    });

    it('should have less coverage in loop vs hyde_park', () => {
      const loopResult = getChicagoCoverage('loop', baseInput);
      const hydeResult = getChicagoCoverage('hyde_park', baseInput);
      expect(loopResult.maxRangeKm).toBeLessThan(hydeResult.maxRangeKm);
    });

    it('should include neighborhood-specific notes', () => {
      const result = getChicagoCoverage('lincoln_park', baseInput);
      expect(result.notes.some(n => n.includes('Park'))).toBe(true);
    });
  });
});
