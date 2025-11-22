/**
 * Radio Hardware Specifications
 *
 * Exports for all radio-related hardware specifications including LoRa,
 * WiFi mesh, and commercial WISP equipment from Ubiquiti.
 *
 * @module @chicago-forest/hardware-hal/radios
 */

// LoRa Specifications
export {
  // Types
  type LoRaRegionalPlan,
  type LoRaRegion,
  type LoRaChannel,
  type LoRaChipSpec,
  type LoRaModuleSpec,
  type LoRaDataRate,
  type MeshtasticPreset,
  // Regional Plans
  US915_PLAN,
  EU868_PLAN,
  // Chip Specifications
  SX1262_SPEC,
  SX1276_SPEC,
  SX1278_SPEC,
  // Module Specifications
  RAK4631_SPEC,
  TBEAM_SPEC,
  HELTEC_V3_SPEC,
  E22_900T30S_SPEC,
  // Data Rates
  US915_DATA_RATES,
  // Meshtastic Presets
  MESHTASTIC_PRESETS,
  // Functions
  calculateLoRaAirtime,
  estimateLoRaRange,
  // Aggregate export
  LORA_SPECS,
} from './lora-specs';

// WiFi Mesh Specifications
export {
  // Types
  type WiFiStandard,
  type WiFiBand,
  type MeshConfig,
  type MeshPathProtocol,
  type HWMPConfig,
  type WiFiMeshHardwareSpec,
  type MeshFirmware,
  // WiFi Standards
  WIFI5_STANDARD,
  WIFI6_STANDARD,
  WIFI6E_STANDARD,
  // Hardware
  GLINET_MT3000,
  MIKROTIK_HAP_AX3,
  TPLINK_EAP670,
  ENGENIUS_ENS620EXT,
  // Firmware
  OPENWRT_MESH,
  BATMAN_ADV,
  LIBREMESH,
  ALTHEA_MESH,
  // Config
  DEFAULT_HWMP_CONFIG,
  // Functions
  createMeshConfig,
  estimateMeshPerformance,
  selectMeshChannels,
  // Aggregate export
  WIFI_MESH_SPECS,
} from './wifi-mesh';

// Ubiquiti Integration
export {
  // Types
  type UbiquitiProductLine,
  type UbiquitiSpec,
  type AirMaxSpec,
  type AirFiberSpec,
  type LTUSpec,
  type UniFiAPSpec,
  type UISPDeviceResponse,
  type UISPApiClient,
  // airMAX Products
  LITEBEAM_5AC_GEN2,
  POWERBEAM_5AC_GEN2,
  NANOSTATION_5AC_LOCO,
  ROCKET_5AC_PRISM,
  // airFiber Products
  AIRFIBER_60_LR,
  AIRFIBER_5XHD,
  // LTU Products
  LTU_ROCKET,
  LTU_LR,
  // UniFi Products
  U6_PRO,
  U6_ENTERPRISE,
  U6_MESH,
  // Config
  UISP_CONFIG_EXAMPLE,
  // Functions
  fromUISPDevice,
  planPtPLink,
  planPtMPSector,
  // Aggregate export
  UBIQUITI_SPECS,
} from './ubiquiti-integration';
