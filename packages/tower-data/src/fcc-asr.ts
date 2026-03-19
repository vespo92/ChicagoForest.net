/**
 * FCC Antenna Structure Registration (ASR) data types and parsing utilities.
 *
 * Data sources:
 * - FCC Public Access Files: https://www.fcc.gov/wireless/data/public-access-files-database-downloads
 * - HIFLD GeoJSON: https://hifld-geoplatform.opendata.arcgis.com/datasets/geoplatform::antenna-structure-registrate-8/
 * - FCC ASR Search: https://wireless2.fcc.gov/UlsApp/AsrSearch/asrRegistrationSearch.jsp
 */

export interface FCCTowerRecord {
  registrationNumber: string;
  callSign: string;
  structureType: StructureType;
  lat: number;
  lon: number;
  elevationFt: number;
  heightAglFt: number;
  overallHeightFt: number;
  overallHeightAmslFt: number;
  ownerName: string;
  ownerCity: string;
  ownerState: string;
  statusCode: string;
  statusDate: string;
  constructionDate: string;
  faaStudyNumber: string;
  marking: string;
  lighting: string;
}

export type StructureType =
  | "TOWER"
  | "POLE"
  | "MAST"
  | "BUILDING"
  | "LATTICE"
  | "MONOPOLE"
  | "GUYED"
  | "SELF-SUPPORT"
  | "TANK"
  | "SIGN"
  | "UTILITY"
  | "OTHER";

export interface TowerFilter {
  state?: string;
  minHeightFt?: number;
  maxHeightFt?: number;
  structureTypes?: StructureType[];
  boundingBox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  radiusKm?: number;
  centerLat?: number;
  centerLon?: number;
  ownerName?: string;
}

/**
 * HIFLD ArcGIS REST API query builder for ASR data.
 * The HIFLD dataset is publicly accessible and supports spatial queries.
 */
export function buildHIFLDQuery(filter: TowerFilter): string {
  const baseUrl = "https://services1.arcgis.com/Hp6G80Pky0om6HgQ/arcgis/rest/services/Antenna_Structure_Registration_-ASR-/FeatureServer/0/query";
  const params = new URLSearchParams();

  // Build WHERE clause
  const conditions: string[] = [];

  if (filter.state) {
    conditions.push(`STATECD='${filter.state}'`);
  }

  if (filter.minHeightFt !== undefined) {
    conditions.push(`OVERALL_HG>=${filter.minHeightFt}`);
  }

  if (filter.maxHeightFt !== undefined) {
    conditions.push(`OVERALL_HG<=${filter.maxHeightFt}`);
  }

  if (filter.structureTypes && filter.structureTypes.length > 0) {
    const types = filter.structureTypes.map((t) => `'${t}'`).join(",");
    conditions.push(`STRUC_TYPE IN (${types})`);
  }

  if (filter.ownerName) {
    conditions.push(`ENTITY_NAM LIKE '%${filter.ownerName}%'`);
  }

  params.set("where", conditions.length > 0 ? conditions.join(" AND ") : "1=1");
  params.set("outFields", "REGNUM,STRUC_TYPE,LAT_DD,LONG_DD,ELEV_FT,STRUC_HGT,OVERALL_HG,OVERALL_AM,ENTITY_NAM,CITY,STATECD,STATUS_COD,STATUS_DAT,FAA_STUDY,MARKING,LIGHTING");
  params.set("returnGeometry", "true");
  params.set("f", "geojson");
  params.set("resultRecordCount", "2000");

  // Bounding box spatial filter
  if (filter.boundingBox) {
    const { west, south, east, north } = filter.boundingBox;
    params.set("geometryType", "esriGeometryEnvelope");
    params.set("geometry", `${west},${south},${east},${north}`);
    params.set("inSR", "4326");
    params.set("spatialRel", "esriSpatialRelIntersects");
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Parse a HIFLD GeoJSON feature into our standardized tower record.
 */
export function parseHIFLDFeature(feature: {
  properties: Record<string, unknown>;
  geometry: { coordinates: [number, number] };
}): FCCTowerRecord {
  const p = feature.properties;
  return {
    registrationNumber: String(p.REGNUM ?? ""),
    callSign: String(p.CALLSIGN ?? ""),
    structureType: (String(p.STRUC_TYPE ?? "OTHER")).toUpperCase() as StructureType,
    lat: feature.geometry.coordinates[1],
    lon: feature.geometry.coordinates[0],
    elevationFt: Number(p.ELEV_FT ?? 0),
    heightAglFt: Number(p.STRUC_HGT ?? 0),
    overallHeightFt: Number(p.OVERALL_HG ?? 0),
    overallHeightAmslFt: Number(p.OVERALL_AM ?? 0),
    ownerName: String(p.ENTITY_NAM ?? ""),
    ownerCity: String(p.CITY ?? ""),
    ownerState: String(p.STATECD ?? ""),
    statusCode: String(p.STATUS_COD ?? ""),
    statusDate: String(p.STATUS_DAT ?? ""),
    constructionDate: String(p.CONSTR_DAT ?? ""),
    faaStudyNumber: String(p.FAA_STUDY ?? ""),
    marking: String(p.MARKING ?? ""),
    lighting: String(p.LIGHTING ?? ""),
  };
}

/**
 * FCC ASR Registration Search URL builder.
 */
export function buildFCCSearchUrl(
  lat: number,
  lon: number,
  radiusMiles: number = 50
): string {
  return `https://wireless2.fcc.gov/UlsApp/AsrSearch/asrRegistrationSearch.jsp?latitude=${lat}&longitude=${lon}&radius=${radiusMiles}`;
}

/**
 * Illinois-specific tower data with known major tower companies.
 */
export const MAJOR_TOWER_COMPANIES = [
  "AMERICAN TOWER",
  "CROWN CASTLE",
  "SBA COMMUNICATIONS",
  "UNITI TOWERS",
  "PHOENIX TOWER",
  "VERTICAL BRIDGE",
  "TILLMAN INFRASTRUCTURE",
] as const;

export const MAJOR_CARRIERS = [
  "AT&T",
  "VERIZON",
  "T-MOBILE",
  "DISH NETWORK",
  "US CELLULAR",
] as const;

/**
 * Data source references for attribution.
 */
export const DATA_SOURCES = {
  fccPublicAccess: {
    name: "FCC Public Access Files",
    url: "https://www.fcc.gov/wireless/data/public-access-files-database-downloads",
    format: "Pipe-delimited .dat files (CO.dat, RA.dat, EN.dat)",
    updateFrequency: "Weekly full + daily incremental",
  },
  hifldArcGIS: {
    name: "HIFLD Antenna Structure Registration",
    url: "https://hifld-geoplatform.opendata.arcgis.com/datasets/geoplatform::antenna-structure-registrate-8/",
    format: "GeoJSON, CSV, KML, Shapefile",
    updateFrequency: "Periodic",
  },
  fccAsrSearch: {
    name: "FCC ASR Registration Search",
    url: "https://wireless2.fcc.gov/UlsApp/AsrSearch/asrRegistrationSearch.jsp",
    format: "Web interface + API",
    updateFrequency: "Real-time",
  },
  illinoisBroadband: {
    name: "Illinois Office of Broadband - Cellular Towers",
    url: "https://illinois-broadband-cngis.hub.arcgis.com/datasets/il-cellular-towers",
    format: "ArcGIS Hub dataset",
    updateFrequency: "Periodic",
  },
} as const;
