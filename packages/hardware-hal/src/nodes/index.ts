/**
 * Node Hardware Specifications
 *
 * Exports for all mesh node hardware including Raspberry Pi configurations,
 * OpenWRT routers, and solar power systems.
 *
 * @module @chicago-forest/hardware-hal/nodes
 */

// Raspberry Pi Node Specifications
export {
  // Types
  type RaspberryPiSpec,
  type PiHATSpec,
  type PiHATType,
  type PiEnclosureSpec,
  type MeshNodeConfig,
  // Pi Models
  RASPBERRY_PI_5,
  RASPBERRY_PI_4B,
  RASPBERRY_PI_ZERO_2W,
  RASPBERRY_PI_3B_PLUS,
  // Pi HATs
  PI_POE_PLUS_HAT,
  RAK2287_PI_HAT,
  WAVESHARE_SX1262_HAT,
  PIJUICE_HAT,
  SIXFAB_LTE_HAT,
  // Enclosures
  OUTDOOR_PI_ENCLOSURE,
  // Node Configurations
  LORAWAN_GATEWAY_CONFIG,
  MESHTASTIC_RELAY_CONFIG,
  WIFI_MESH_GATEWAY_CONFIG,
  // Software Images
  PI_MESH_IMAGES,
  // Aggregate export
  RASPBERRY_PI_SPECS,
} from './raspberry-pi-node';

// OpenWRT Router Specifications
export {
  // Types
  type OpenWRTRouterSpec,
  type MeshConfigTemplate,
  // Budget Routers
  GLINET_MT3000_ROUTER,
  GLINET_A1300,
  TPLINK_ARCHER_C7,
  // High-Performance Routers
  LINKSYS_WRT3200ACM,
  DYNALINK_WRX36,
  // Outdoor Routers
  MIKROTIK_HAP_AC3,
  TPLINK_CPE510,
  // Config Templates
  MESH_802_11S_TEMPLATE,
  MESH_BATMAN_TEMPLATE,
  // Functions
  assessMeshSuitability,
  // Aggregate export
  OPENWRT_ROUTERS,
} from './openwrt-router';

// Solar Power Specifications
export {
  // Types
  type SolarPanelSpec,
  type SolarPanelType,
  type ChargeControllerSpec,
  type ControllerType,
  type BatteryType,
  type BatterySpec,
  type SolarSystemSpec,
  // Solar Panels
  RENOGY_100W_MONO,
  RENOGY_50W_MONO,
  VOLTAIC_6W,
  RENOGY_100W_FLEX,
  // Charge Controllers
  VICTRON_75_15,
  GENASUN_GV5,
  RENOGY_WANDERER,
  // Batteries
  BATTLEBORN_50AH,
  AMPERE_TIME_12AH,
  UNIVERSAL_UB12180,
  DIY_18650_PACK,
  // Complete Kits
  MESHTASTIC_SOLAR_KIT,
  PI_MESH_SOLAR_KIT,
  BUDGET_MESH_SOLAR_KIT,
  // Reference Data
  US_PEAK_SUN_HOURS,
  // Functions
  calculateSolarRequirements,
  estimateBatteryRuntime,
  // Aggregate export
  SOLAR_SPECS,
} from './solar-powered';
