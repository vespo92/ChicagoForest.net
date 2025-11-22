/**
 * DIY Antenna Designs
 *
 * THEORETICAL/EDUCATIONAL designs for building antennas. These designs are
 * based on well-documented amateur radio and wireless networking principles.
 *
 * DISCLAIMER: This is an AI-generated educational framework presenting
 * THEORETICAL DIY designs. Building and operating radio equipment may require
 * licenses and must comply with local regulations. Test all builds before
 * deployment. Performance claims are theoretical and vary with construction.
 *
 * WARNING: Improper antenna construction can damage radio equipment and
 * violate FCC regulations. Always verify compliance before transmitting.
 *
 * Educational References:
 * - ARRL Antenna Book: http://www.arrl.org/arrl-antenna-book
 * - Antenna-Theory.com: https://www.antenna-theory.com/
 * - FCC Part 97 (Amateur Radio): https://www.ecfr.gov/current/title-47/chapter-I/subchapter-D/part-97
 *
 * @module @chicago-forest/hardware-hal/antennas/diy-designs
 */

// =============================================================================
// DIY ANTENNA BASE TYPES
// =============================================================================

/**
 * DIY antenna design specification
 *
 * THEORETICAL: These are educational designs, not tested products
 */
export interface DIYAntennaDesign {
  /** Design name */
  name: string;
  /** Antenna type */
  type: DIYAntennaType;
  /** Target frequency (MHz) */
  targetFrequency: number;
  /** Frequency range (MHz) */
  frequencyRange: { min: number; max: number };
  /** Theoretical gain (dBi) */
  theoreticalGain: number;
  /** Beamwidth estimate */
  beamwidthEstimate: { horizontal: number; vertical: number };
  /** Required materials */
  materials: Material[];
  /** Estimated cost (USD) */
  estimatedCost: number;
  /** Difficulty level */
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  /** Build time (hours) */
  buildTimeHours: number;
  /** Required tools */
  tools: string[];
  /** Design source/reference */
  reference: string;
  /** Build notes and warnings */
  notes: string[];
  /** Calculated dimensions */
  dimensions: Record<string, number>;
}

export type DIYAntennaType =
  | 'dipole'
  | 'ground-plane'
  | 'yagi'
  | 'cantenna'
  | 'biquad'
  | 'moxon'
  | 'collinear'
  | 'j-pole'
  | 'slim-jim';

interface Material {
  name: string;
  quantity: string;
  notes?: string;
  approximate_cost: number;
}

// =============================================================================
// FREQUENCY CALCULATION HELPERS
// =============================================================================

/**
 * Speed of light in mm/s for wavelength calculations
 */
const SPEED_OF_LIGHT_MM = 299792458000;

/**
 * Calculate wavelength in mm for a given frequency
 */
export function calculateWavelength(frequencyMHz: number): number {
  const frequencyHz = frequencyMHz * 1e6;
  return SPEED_OF_LIGHT_MM / frequencyHz;
}

/**
 * Calculate half-wavelength dipole length
 * Includes 0.95 velocity factor for typical wire
 */
export function calculateDipoleLength(frequencyMHz: number, velocityFactor: number = 0.95): number {
  const wavelength = calculateWavelength(frequencyMHz);
  return (wavelength / 2) * velocityFactor;
}

/**
 * Calculate quarter-wavelength for ground plane elements
 */
export function calculateQuarterWave(frequencyMHz: number, velocityFactor: number = 0.95): number {
  const wavelength = calculateWavelength(frequencyMHz);
  return (wavelength / 4) * velocityFactor;
}

// =============================================================================
// LORA 915 MHZ DESIGNS (US ISM BAND)
// =============================================================================

/**
 * Half-wave dipole for 915 MHz LoRa
 *
 * THEORETICAL: Simple, effective design for beginners
 */
export function design915MHzDipole(): DIYAntennaDesign {
  const freq = 915;
  const elementLength = calculateDipoleLength(freq);

  return {
    name: '915 MHz Half-Wave Dipole',
    type: 'dipole',
    targetFrequency: 915,
    frequencyRange: { min: 902, max: 928 },
    theoreticalGain: 2.15, // dBi (reference dipole)
    beamwidthEstimate: { horizontal: 360, vertical: 78 },
    estimatedCost: 15,
    difficulty: 'beginner',
    buildTimeHours: 1,
    materials: [
      { name: 'Copper wire (12-14 AWG)', quantity: '350mm', approximate_cost: 2 },
      { name: 'SMA or N-Type connector', quantity: '1', approximate_cost: 5 },
      { name: 'Coax cable (RG-58 or RG-316)', quantity: '1m', approximate_cost: 5 },
      { name: 'PVC pipe or enclosure', quantity: '1', notes: 'For weatherproofing', approximate_cost: 3 },
    ],
    tools: ['Soldering iron', 'Wire cutters', 'Ruler/calipers', 'Multimeter'],
    reference: 'https://www.antenna-theory.com/antennas/dipole.php',
    notes: [
      'THEORETICAL DESIGN - Test before deployment',
      'Each dipole arm should be ~155mm (quarter wavelength)',
      'Total length ~310mm plus connector',
      'Mount vertically for vertical polarization',
      'Requires clear area from metal objects',
    ],
    dimensions: {
      totalLengthMm: Math.round(elementLength),
      eachArmMm: Math.round(elementLength / 2),
      wireGaugeMm: 1.6, // 14 AWG
    },
  };
}

/**
 * Ground plane antenna for 915 MHz
 *
 * THEORETICAL: Good gain, simple construction
 */
export function design915MHzGroundPlane(): DIYAntennaDesign {
  const freq = 915;
  const quarterWave = calculateQuarterWave(freq);

  return {
    name: '915 MHz Ground Plane Antenna',
    type: 'ground-plane',
    targetFrequency: 915,
    frequencyRange: { min: 902, max: 928 },
    theoreticalGain: 3.5, // dBi with drooped radials
    beamwidthEstimate: { horizontal: 360, vertical: 60 },
    estimatedCost: 25,
    difficulty: 'beginner',
    buildTimeHours: 2,
    materials: [
      { name: 'Brass or copper rod (3mm)', quantity: '5 x 82mm pieces', approximate_cost: 8 },
      { name: 'SO-239 chassis mount connector', quantity: '1', approximate_cost: 5 },
      { name: 'Brass plate or copper PCB', quantity: '100mm x 100mm', approximate_cost: 5 },
      { name: 'Coax cable (RG-58)', quantity: '1m', approximate_cost: 5 },
      { name: 'Weatherproofing tape', quantity: '1 roll', approximate_cost: 2 },
    ],
    tools: ['Soldering iron', 'Drill', 'File', 'Ruler/calipers'],
    reference: 'https://www.antenna-theory.com/antennas/groundplane.php',
    notes: [
      'THEORETICAL DESIGN - Test before deployment',
      'Vertical element: ~82mm (quarter wavelength)',
      '4 radials at 45 degree droop angle improves impedance match',
      'Radial length: ~82mm each',
      'Mount with vertical element pointing up',
      'Keep away from metal surfaces',
    ],
    dimensions: {
      verticalElementMm: Math.round(quarterWave),
      radialLengthMm: Math.round(quarterWave),
      radialAngleDegrees: 45,
      numberOfRadials: 4,
    },
  };
}

/**
 * 3-element Yagi for 915 MHz
 *
 * THEORETICAL: Higher gain directional
 */
export function design915MHz3ElementYagi(): DIYAntennaDesign {
  const freq = 915;
  const wavelength = calculateWavelength(freq);

  // Yagi element lengths (typical design)
  const reflectorLength = wavelength * 0.495;
  const drivenLength = wavelength * 0.473;
  const directorLength = wavelength * 0.440;
  const reflectorSpacing = wavelength * 0.20;
  const directorSpacing = wavelength * 0.15;

  return {
    name: '915 MHz 3-Element Yagi',
    type: 'yagi',
    targetFrequency: 915,
    frequencyRange: { min: 905, max: 925 },
    theoreticalGain: 7.5, // dBi
    beamwidthEstimate: { horizontal: 65, vertical: 70 },
    estimatedCost: 35,
    difficulty: 'intermediate',
    buildTimeHours: 4,
    materials: [
      { name: 'Aluminum rod (6mm)', quantity: '1m', notes: 'For elements', approximate_cost: 8 },
      { name: 'PVC pipe (25mm)', quantity: '400mm', notes: 'Boom', approximate_cost: 3 },
      { name: 'Coax cable (RG-58)', quantity: '2m', approximate_cost: 8 },
      { name: 'Balun or choke', quantity: '1', notes: 'RF choke on feedline', approximate_cost: 10 },
      { name: 'Mounting hardware', quantity: '1 set', approximate_cost: 6 },
    ],
    tools: ['Hacksaw', 'Drill', 'Ruler/calipers', 'Soldering iron', 'SWR meter (recommended)'],
    reference: 'http://www.arrl.org/arrl-antenna-book',
    notes: [
      'THEORETICAL DESIGN - Requires tuning and SWR measurement',
      'Elements must be precisely cut and aligned',
      'Boom should be non-conductive (PVC or fiberglass)',
      'Driven element requires gamma match or hairpin match',
      'Point director toward target for maximum gain',
      'Bandwidth is narrow - tune for center frequency',
    ],
    dimensions: {
      reflectorLengthMm: Math.round(reflectorLength),
      drivenElementLengthMm: Math.round(drivenLength),
      directorLengthMm: Math.round(directorLength),
      reflectorToDriverMm: Math.round(reflectorSpacing),
      driverToDirectorMm: Math.round(directorSpacing),
      totalBoomLengthMm: Math.round(reflectorSpacing + directorSpacing),
    },
  };
}

// =============================================================================
// WIFI 2.4 GHZ DESIGNS
// =============================================================================

/**
 * Classic "Cantenna" waveguide antenna for 2.4 GHz
 *
 * THEORETICAL: Simple high-gain directional
 */
export function design24GHzCantenna(): DIYAntennaDesign {
  const freq = 2437; // Channel 6 center
  const wavelength = calculateWavelength(freq);
  const quarterWave = wavelength / 4;

  // Can dimensions (Pringles can or similar)
  // Optimal can diameter: 83mm (between 0.6 and 0.75 wavelength)
  // N-connector probe at 1/4 wavelength from back

  return {
    name: '2.4 GHz Cantenna (Waveguide)',
    type: 'cantenna',
    targetFrequency: 2437,
    frequencyRange: { min: 2400, max: 2500 },
    theoreticalGain: 12, // dBi (varies with construction)
    beamwidthEstimate: { horizontal: 30, vertical: 30 },
    estimatedCost: 20,
    difficulty: 'beginner',
    buildTimeHours: 2,
    materials: [
      { name: 'Metal can (83-90mm diameter)', quantity: '1', notes: 'Coffee can or similar', approximate_cost: 0 },
      { name: 'N-Type chassis connector', quantity: '1', approximate_cost: 8 },
      { name: 'Copper wire (12 AWG)', quantity: '35mm', notes: 'Probe element', approximate_cost: 1 },
      { name: 'Coax cable (LMR-200 or better)', quantity: '1m', approximate_cost: 8 },
      { name: 'Mounting bracket', quantity: '1', approximate_cost: 3 },
    ],
    tools: ['Drill', 'Step drill bit or chassis punch', 'Ruler', 'Soldering iron'],
    reference: 'https://www.turnpoint.net/wireless/cantennahowto.html',
    notes: [
      'THEORETICAL DESIGN - Classic amateur project',
      'Can must be conductive (metal, not plastic lined)',
      'Optimal diameter: 83-90mm for 2.4 GHz',
      'Probe position from closed end: ~31mm',
      'Probe length above connector: ~31mm',
      'Longer can = higher gain (diminishing returns past 150mm)',
      'Seal with weatherproof cover for outdoor use',
    ],
    dimensions: {
      canDiameterMm: 85,
      canLengthMm: 150,
      probeFromEndMm: Math.round(quarterWave),
      probeLengthMm: Math.round(quarterWave),
    },
  };
}

/**
 * Biquad antenna for 2.4 GHz
 *
 * THEORETICAL: Higher gain than cantenna, more complex
 */
export function design24GHzBiquad(): DIYAntennaDesign {
  const freq = 2437;
  const wavelength = calculateWavelength(freq);
  const sideLength = wavelength / 4 * 1.05; // Slightly more than quarter wave

  return {
    name: '2.4 GHz Biquad Antenna',
    type: 'biquad',
    targetFrequency: 2437,
    frequencyRange: { min: 2400, max: 2500 },
    theoreticalGain: 11, // dBi
    beamwidthEstimate: { horizontal: 50, vertical: 50 },
    estimatedCost: 25,
    difficulty: 'intermediate',
    buildTimeHours: 3,
    materials: [
      { name: 'Copper wire (12 AWG solid)', quantity: '300mm', notes: 'For elements', approximate_cost: 2 },
      { name: 'Copper-clad PCB or metal plate', quantity: '120mm x 120mm', notes: 'Reflector', approximate_cost: 5 },
      { name: 'N-Type connector', quantity: '1', approximate_cost: 8 },
      { name: 'Standoffs (15mm)', quantity: '4', approximate_cost: 3 },
      { name: 'Coax cable (LMR-200)', quantity: '1m', approximate_cost: 7 },
    ],
    tools: ['Pliers', 'Ruler/calipers', 'Soldering iron', 'Drill'],
    reference: 'https://martybugs.net/wireless/biquad/',
    notes: [
      'THEORETICAL DESIGN - Requires precision bending',
      'Each square side should be ~30.5mm',
      'Wire forms two squares in "figure 8" pattern',
      'Feed point at center where squares meet',
      'Reflector spacing: ~15mm (0.12 wavelength)',
      'Element must be parallel to reflector',
      'Ground one feed point, connect other to center conductor',
    ],
    dimensions: {
      squareSideMm: Math.round(sideLength),
      totalWidthMm: Math.round(sideLength * 2),
      reflectorSizeMm: 120,
      elementToReflectorMm: 15,
    },
  };
}

// =============================================================================
// 5 GHZ WIFI DESIGNS
// =============================================================================

/**
 * Biquad for 5 GHz WiFi
 *
 * THEORETICAL: Scaled version for 5 GHz
 */
export function design5GHzBiquad(): DIYAntennaDesign {
  const freq = 5500; // Mid 5 GHz band
  const wavelength = calculateWavelength(freq);
  const sideLength = wavelength / 4 * 1.05;

  return {
    name: '5 GHz Biquad Antenna',
    type: 'biquad',
    targetFrequency: 5500,
    frequencyRange: { min: 5150, max: 5850 },
    theoreticalGain: 11, // dBi
    beamwidthEstimate: { horizontal: 50, vertical: 50 },
    estimatedCost: 25,
    difficulty: 'intermediate',
    buildTimeHours: 3,
    materials: [
      { name: 'Copper wire (14 AWG solid)', quantity: '150mm', approximate_cost: 1 },
      { name: 'Copper-clad PCB', quantity: '60mm x 60mm', approximate_cost: 3 },
      { name: 'SMA connector', quantity: '1', approximate_cost: 5 },
      { name: 'Spacers (7mm)', quantity: '4', approximate_cost: 2 },
      { name: 'Coax cable (RG-316)', quantity: '0.5m', approximate_cost: 5 },
    ],
    tools: ['Fine pliers', 'Precision ruler', 'Soldering iron with fine tip', 'Magnifier'],
    reference: 'https://martybugs.net/wireless/biquad/',
    notes: [
      'THEORETICAL DESIGN - Small dimensions require precision',
      'Each square side: ~13.6mm',
      'Element to reflector: ~7mm',
      'Use thinner wire (14-16 AWG) for easier forming',
      'Smaller scale makes construction more challenging',
      'SMA connector preferred due to size',
    ],
    dimensions: {
      squareSideMm: Math.round(sideLength),
      totalWidthMm: Math.round(sideLength * 2),
      reflectorSizeMm: 60,
      elementToReflectorMm: 7,
    },
  };
}

// =============================================================================
// COLLINEAR DESIGNS
// =============================================================================

/**
 * Collinear array for 915 MHz
 *
 * THEORETICAL: High-gain omnidirectional
 */
export function design915MHzCollinear(): DIYAntennaDesign {
  const freq = 915;
  const halfWave = calculateDipoleLength(freq);
  const quarterWave = halfWave / 2;

  return {
    name: '915 MHz 4-Element Collinear',
    type: 'collinear',
    targetFrequency: 915,
    frequencyRange: { min: 902, max: 928 },
    theoreticalGain: 6, // dBi
    beamwidthEstimate: { horizontal: 360, vertical: 20 },
    estimatedCost: 35,
    difficulty: 'advanced',
    buildTimeHours: 5,
    materials: [
      { name: 'RG-58 or RG-213 coax', quantity: '2m', notes: 'For phasing sections', approximate_cost: 10 },
      { name: 'Copper wire (12 AWG)', quantity: '1.5m', notes: 'For elements', approximate_cost: 5 },
      { name: 'PVC pipe (20mm)', quantity: '1m', notes: 'Housing', approximate_cost: 5 },
      { name: 'N-Type connector', quantity: '1', approximate_cost: 8 },
      { name: 'End caps and sealant', quantity: '1 set', approximate_cost: 5 },
    ],
    tools: ['Soldering iron', 'Coax stripping tool', 'Ruler/calipers', 'Heat shrink'],
    reference: 'http://www.arrl.org/arrl-antenna-book',
    notes: [
      'THEORETICAL DESIGN - Complex construction',
      'Each radiating element: half wavelength (~164mm)',
      'Phasing stubs: half wavelength of coax (account for velocity factor)',
      'Elements must be in phase - critical for gain',
      'Coax velocity factor typically 0.66 for RG-58',
      'Actual stub length = electrical half-wave * velocity factor',
      'Requires careful measurement and testing',
    ],
    dimensions: {
      elementLengthMm: Math.round(halfWave),
      phasingSectionMm: Math.round(halfWave * 0.66), // Coax velocity factor
      numberOfElements: 4,
      totalLengthMm: Math.round(halfWave * 4 + (halfWave * 0.66 * 3)),
    },
  };
}

// =============================================================================
// DESIGN GENERATORS
// =============================================================================

/**
 * Generate custom dipole dimensions for any frequency
 */
export function generateDipoleDesign(frequencyMHz: number): {
  frequency: number;
  totalLength: number;
  eachArm: number;
  notes: string[];
} {
  const totalLength = calculateDipoleLength(frequencyMHz);
  return {
    frequency: frequencyMHz,
    totalLength: Math.round(totalLength),
    eachArm: Math.round(totalLength / 2),
    notes: [
      'THEORETICAL - dimensions based on standard formulas',
      'Actual length may need adjustment (typically -5% for end effects)',
      `Wavelength at ${frequencyMHz} MHz: ${Math.round(calculateWavelength(frequencyMHz))}mm`,
      'Use SWR meter to fine-tune by trimming element ends',
    ],
  };
}

/**
 * Generate ground plane antenna dimensions for any frequency
 */
export function generateGroundPlaneDesign(frequencyMHz: number): {
  frequency: number;
  verticalElement: number;
  radialLength: number;
  numberOfRadials: number;
  radialAngle: number;
  notes: string[];
} {
  const quarterWave = calculateQuarterWave(frequencyMHz);
  return {
    frequency: frequencyMHz,
    verticalElement: Math.round(quarterWave),
    radialLength: Math.round(quarterWave),
    numberOfRadials: 4,
    radialAngle: 45,
    notes: [
      'THEORETICAL - standard ground plane design',
      'Droop radials at 45 degrees for ~50 ohm impedance',
      'Horizontal radials (0 degrees) give ~36 ohms',
      'Radial length affects impedance match',
      'More radials (8) can improve ground plane effectiveness',
    ],
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export const DIY_DESIGNS = {
  lora_915: {
    dipole: design915MHzDipole,
    groundPlane: design915MHzGroundPlane,
    yagi: design915MHz3ElementYagi,
    collinear: design915MHzCollinear,
  },
  wifi_24: {
    cantenna: design24GHzCantenna,
    biquad: design24GHzBiquad,
  },
  wifi_5: {
    biquad: design5GHzBiquad,
  },
  generators: {
    dipole: generateDipoleDesign,
    groundPlane: generateGroundPlaneDesign,
  },
  calculations: {
    wavelength: calculateWavelength,
    dipoleLength: calculateDipoleLength,
    quarterWave: calculateQuarterWave,
  },
};
