/**
 * Known tower locations and strategic data for Illinois network expansion.
 * This represents FCC-registered towers and strategic locations relevant
 * to the Chicago Forest Network expansion plan.
 *
 * Sources:
 * - FCC ASR Database: https://www.fcc.gov/wireless/data/public-access-files-database-downloads
 * - HIFLD: https://hifld-geoplatform.opendata.arcgis.com/datasets/geoplatform::antenna-structure-registrate-8/
 * - AntennaSearch: https://www.antennasearch.com/
 */

import type { TowerLocation } from "./geo";

export interface StrategicTower extends TowerLocation {
  id: string;
  name: string;
  city: string;
  county: string;
  owner: string;
  structureType: string;
  fccRegNumber?: string;
  population: number;
  notes: string;
}

export interface ExpansionZone {
  id: string;
  name: string;
  centerLat: number;
  centerLon: number;
  radiusKm: number;
  priority: "high" | "medium" | "low";
  population: number;
  towerDensity: "high" | "medium" | "low";
  description: string;
}

/**
 * Strategic tower locations for the Chicago Forest Network expansion.
 * These represent key infrastructure points for node-hopping.
 */
export const STRATEGIC_TOWERS: StrategicTower[] = [
  // Origin - Mendota Solar Tower
  {
    id: "mendota-primary",
    name: "Mendota Solar Tower",
    city: "Mendota",
    county: "LaSalle",
    lat: 41.5475,
    lon: -89.1178,
    elevationFt: 751,
    heightAglFt: 200,
    owner: "Chicago Forest Network",
    structureType: "SELF-SUPPORT",
    population: 7300,
    notes: "Primary junction hub - Phase 1 active planning",
  },
  // Chicago Metro Corridor
  {
    id: "dekalb-relay",
    name: "DeKalb Relay",
    city: "DeKalb",
    county: "DeKalb",
    lat: 41.9295,
    lon: -88.7502,
    elevationFt: 879,
    heightAglFt: 300,
    owner: "Existing tower co-location",
    structureType: "LATTICE",
    population: 44000,
    notes: "Key relay to Chicago corridor - highest elevation in network",
  },
  {
    id: "naperville-hub",
    name: "Naperville / Aurora Hub",
    city: "Naperville",
    county: "DuPage",
    lat: 41.7508,
    lon: -88.1535,
    elevationFt: 690,
    heightAglFt: 250,
    owner: "Target co-location",
    structureType: "MONOPOLE",
    population: 203000,
    notes: "Gateway to Chicago metro - high population density",
  },
  {
    id: "chicago-loop",
    name: "Chicago Loop",
    city: "Chicago",
    county: "Cook",
    lat: 41.8781,
    lon: -87.6298,
    elevationFt: 596,
    heightAglFt: 400,
    owner: "Target building-top or tower",
    structureType: "BUILDING",
    population: 2700000,
    notes: "Ultimate Chicago endpoint - dense tower infrastructure",
  },
  // Northern Corridor
  {
    id: "rockford-hub",
    name: "Rockford Hub",
    city: "Rockford",
    county: "Winnebago",
    lat: 42.2711,
    lon: -89.094,
    elevationFt: 728,
    heightAglFt: 300,
    owner: "Target co-location",
    structureType: "LATTICE",
    population: 148000,
    notes: "Northern anchor - 2nd largest IL city outside Chicago metro",
  },
  // Western Corridor
  {
    id: "sterling-relay",
    name: "Sterling Relay",
    city: "Sterling",
    county: "Whiteside",
    lat: 41.7886,
    lon: -89.6962,
    elevationFt: 643,
    heightAglFt: 200,
    owner: "Existing tower co-location",
    structureType: "GUYED",
    population: 15000,
    notes: "Western relay point toward Quad Cities",
  },
  {
    id: "quadcities-hub",
    name: "Quad Cities Hub",
    city: "Moline",
    county: "Rock Island",
    lat: 41.5067,
    lon: -90.5151,
    elevationFt: 581,
    heightAglFt: 300,
    owner: "Target co-location",
    structureType: "SELF-SUPPORT",
    population: 150000,
    notes: "Western anchor - cross-state border potential (Iowa)",
  },
  // Southern Corridor
  {
    id: "lasalle-relay",
    name: "LaSalle-Peru Relay",
    city: "LaSalle",
    county: "LaSalle",
    lat: 41.3454,
    lon: -89.0916,
    elevationFt: 659,
    heightAglFt: 200,
    owner: "Existing tower co-location",
    structureType: "MONOPOLE",
    population: 20000,
    notes: "Southern relay on Illinois River corridor",
  },
  {
    id: "ottawa-relay",
    name: "Ottawa Relay",
    city: "Ottawa",
    county: "LaSalle",
    lat: 41.3456,
    lon: -88.8426,
    elevationFt: 481,
    heightAglFt: 200,
    owner: "Existing tower co-location",
    structureType: "MONOPOLE",
    population: 19000,
    notes: "Illinois River valley relay",
  },
  {
    id: "peoria-hub",
    name: "Peoria Hub",
    city: "Peoria",
    county: "Peoria",
    lat: 40.6936,
    lon: -89.589,
    elevationFt: 470,
    heightAglFt: 300,
    owner: "Target co-location",
    structureType: "LATTICE",
    population: 113000,
    notes: "Central IL anchor - Caterpillar HQ, strong economic base",
  },
  {
    id: "bloomington-hub",
    name: "Bloomington-Normal Hub",
    city: "Bloomington",
    county: "McLean",
    lat: 40.4842,
    lon: -88.9937,
    elevationFt: 829,
    heightAglFt: 250,
    owner: "Target co-location",
    structureType: "SELF-SUPPORT",
    population: 133000,
    notes: "State Farm HQ, ISU/IWU - high elevation advantage",
  },
  // Future expansion targets
  {
    id: "joliet-hub",
    name: "Joliet Hub",
    city: "Joliet",
    county: "Will",
    lat: 41.525,
    lon: -88.0817,
    elevationFt: 545,
    heightAglFt: 250,
    owner: "Target co-location",
    structureType: "MONOPOLE",
    population: 150000,
    notes: "Southern Chicago suburbs - data center corridor",
  },
  {
    id: "champaign-hub",
    name: "Champaign-Urbana Hub",
    city: "Champaign",
    county: "Champaign",
    lat: 40.1164,
    lon: -88.2434,
    elevationFt: 741,
    heightAglFt: 300,
    owner: "Target co-location / UIUC",
    structureType: "LATTICE",
    population: 108000,
    notes: "University of Illinois - research corridor potential",
  },
  {
    id: "springfield-hub",
    name: "Springfield Hub",
    city: "Springfield",
    county: "Sangamon",
    lat: 39.7817,
    lon: -89.6501,
    elevationFt: 597,
    heightAglFt: 300,
    owner: "Target co-location",
    structureType: "SELF-SUPPORT",
    population: 115000,
    notes: "State capital - government connectivity potential",
  },
];

/**
 * Expansion zones for prioritizing tower research and co-location.
 */
export const EXPANSION_ZONES: ExpansionZone[] = [
  {
    id: "i39-corridor",
    name: "I-39 Corridor (Mendota to Rockford)",
    centerLat: 41.9,
    centerLon: -89.1,
    radiusKm: 15,
    priority: "high",
    population: 200000,
    towerDensity: "medium",
    description: "Primary backbone route north along I-39. Flat terrain, existing tower infrastructure.",
  },
  {
    id: "i88-corridor",
    name: "I-88 Corridor (DeKalb to Chicago)",
    centerLat: 41.85,
    centerLon: -88.4,
    radiusKm: 20,
    priority: "high",
    population: 1500000,
    towerDensity: "high",
    description: "East-West Tollway corridor into Chicago suburbs. Dense tower infrastructure, high population.",
  },
  {
    id: "i80-west",
    name: "I-80 West (Mendota to Quad Cities)",
    centerLat: 41.5,
    centerLon: -89.8,
    radiusKm: 15,
    priority: "medium",
    population: 200000,
    towerDensity: "low",
    description: "Western expansion along I-80. More rural, fewer existing towers, longer hops needed.",
  },
  {
    id: "il-river-south",
    name: "Illinois River South (LaSalle to Peoria)",
    centerLat: 41.0,
    centerLon: -89.3,
    radiusKm: 20,
    priority: "medium",
    population: 200000,
    towerDensity: "medium",
    description: "Southward expansion following Illinois River valley. Mixed terrain.",
  },
  {
    id: "chicago-metro",
    name: "Chicago Metropolitan Area",
    centerLat: 41.85,
    centerLon: -87.65,
    radiusKm: 40,
    priority: "high",
    population: 9500000,
    towerDensity: "high",
    description: "Dense urban tower infrastructure. Many co-location opportunities. Highest population density.",
  },
  {
    id: "central-il",
    name: "Central Illinois (Bloomington to Springfield)",
    centerLat: 40.1,
    centerLon: -89.3,
    radiusKm: 40,
    priority: "low",
    population: 400000,
    towerDensity: "low",
    description: "Phase 3+ expansion. Long-range links needed. State capital and university cities.",
  },
];
