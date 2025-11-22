/**
 * Antenna Hardware Specifications
 *
 * Exports for all antenna-related specifications including directional,
 * omnidirectional, and DIY designs.
 *
 * @module @chicago-forest/hardware-hal/antennas
 */

// Directional Antennas
export {
  // Types
  type DirectionalAntennaSpec,
  type DirectionalAntennaType,
  type Polarization,
  type ConnectorType,
  // Parabolic Dishes
  RD_5G30,
  RD_5G31_AC,
  KP_2FT_DISH,
  // Sector Antennas
  AM_5G20_90,
  RF_SECTOR_HORN_30,
  RF_HORN_TP_60,
  // Yagi Antennas
  LCOM_YAGI_16,
  YAGI_900_14,
  // Panel Antennas
  UMA_D,
  PANEL_24_14,
  // Functions
  selectDirectionalAntenna,
  calculateEIRP,
  checkEIRPCompliance,
  calculateAlignmentTolerance,
  // Aggregate export
  DIRECTIONAL_ANTENNAS,
} from './directional';

// Omnidirectional Antennas
export {
  // Types
  type OmniAntennaSpec,
  type OmniAntennaType,
  type MountingType,
  type CoveragePattern,
  // WiFi Omnis
  AMO_5G13,
  HG5812U_PRO,
  HG2415U_PRO,
  DUAL_BAND_OMNI,
  // LoRa/ISM Omnis
  OMNI_900_8,
  TAOGLAS_915,
  LAIRD_PHANTOM_900,
  OMNI_868_6,
  // Mobile Antennas
  RUBBER_DUCK_915,
  MOBILE_MARK_900,
  // Functions
  calculateOmniCoverage,
  selectOmniAntenna,
  calculateOptimalTilt,
  // Aggregate export
  OMNI_ANTENNAS,
} from './omnidirectional';

// DIY Antenna Designs (THEORETICAL)
export {
  // Types
  type DIYAntennaDesign,
  type DIYAntennaType,
  // Design Functions
  design915MHzDipole,
  design915MHzGroundPlane,
  design915MHz3ElementYagi,
  design915MHzCollinear,
  design24GHzCantenna,
  design24GHzBiquad,
  design5GHzBiquad,
  // Generators
  generateDipoleDesign,
  generateGroundPlaneDesign,
  // Calculations
  calculateWavelength,
  calculateDipoleLength,
  calculateQuarterWave,
  // Aggregate export
  DIY_DESIGNS,
} from './diy-designs';
