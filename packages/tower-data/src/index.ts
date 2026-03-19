export {
  haversineDistance,
  calculateBearing,
  maxLineOfSight,
  fresnelZoneRadius,
  freeSpacePathLoss,
  rainAttenuation,
  analyzeTowerLink,
  calculateLinkBudget,
  intermediatePoint,
  scoreTowerAsHop,
  conversions,
} from "./geo";

export type {
  Coordinate,
  TowerLocation,
  DistanceResult,
  BearingResult,
  LineOfSightResult,
  LinkBudgetResult,
} from "./geo";

export {
  buildHIFLDQuery,
  parseHIFLDFeature,
  buildFCCSearchUrl,
  MAJOR_TOWER_COMPANIES,
  MAJOR_CARRIERS,
  DATA_SOURCES,
} from "./fcc-asr";

export type {
  FCCTowerRecord,
  StructureType,
  TowerFilter,
} from "./fcc-asr";

export {
  STRATEGIC_TOWERS,
  EXPANSION_ZONES,
} from "./illinois-towers";

export type {
  StrategicTower,
  ExpansionZone,
} from "./illinois-towers";
