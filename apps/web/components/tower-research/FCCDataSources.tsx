"use client";

import { useState } from "react";

interface DataSource {
  name: string;
  url: string;
  format: string;
  updateFrequency: string;
  description: string;
  fields: string[];
  access: "public" | "api-key" | "request";
}

const DATA_SOURCES: DataSource[] = [
  {
    name: "FCC Public Access Files (ASR)",
    url: "https://www.fcc.gov/wireless/data/public-access-files-database-downloads",
    format: "Pipe-delimited .dat (CO.dat, RA.dat, EN.dat)",
    updateFrequency: "Weekly full + daily incremental",
    description:
      "The authoritative source for all FCC-registered antenna structures. Contains coordinates (CO.dat), registration data (RA.dat), and entity/owner information (EN.dat). Structures >200ft or near airports.",
    fields: [
      "Registration Number",
      "Latitude/Longitude (NAD 83)",
      "Structure Height AGL (ft)",
      "Overall Height AMSL (ft)",
      "Elevation (ft)",
      "Structure Type",
      "Owner/Entity Name",
      "Status Code",
      "FAA Study Number",
      "Marking & Lighting",
    ],
    access: "public",
  },
  {
    name: "HIFLD Antenna Structure Registration",
    url: "https://hifld-geoplatform.opendata.arcgis.com/datasets/geoplatform::antenna-structure-registrate-8/",
    format: "GeoJSON, CSV, KML, Shapefile",
    updateFrequency: "Periodic",
    description:
      "Homeland Infrastructure Foundation-Level Data (HIFLD) hosts a spatial version of the FCC ASR data. Supports ArcGIS REST API queries with spatial filters (bounding box, radius).",
    fields: [
      "REGNUM",
      "LAT_DD / LONG_DD",
      "STRUC_HGT",
      "OVERALL_HG",
      "OVERALL_AM",
      "ELEV_FT",
      "STRUC_TYPE",
      "ENTITY_NAM",
      "STATECD",
      "STATUS_COD",
    ],
    access: "public",
  },
  {
    name: "FCC ASR Registration Search",
    url: "https://wireless2.fcc.gov/UlsApp/AsrSearch/asrRegistrationSearch.jsp",
    format: "Web interface + API",
    updateFrequency: "Real-time",
    description:
      "Interactive search for FCC antenna structure registrations. Supports search by location (lat/lon + radius), registration number, call sign, or owner name.",
    fields: [
      "Registration Number",
      "Owner Name",
      "Location (lat/lon)",
      "Height",
      "Structure Type",
      "Status",
      "FAA Determination",
    ],
    access: "public",
  },
  {
    name: "Illinois Office of Broadband - Cellular Towers",
    url: "https://illinois-broadband-cngis.hub.arcgis.com/datasets/il-cellular-towers",
    format: "ArcGIS Hub dataset",
    updateFrequency: "Periodic",
    description:
      "Illinois-specific dataset of cellular tower locations from the state broadband office. Filtered for Illinois from the national dataset.",
    fields: [
      "Tower location",
      "Carrier info",
      "Structure type",
      "Height",
      "State/county",
    ],
    access: "public",
  },
  {
    name: "OpenCelliD",
    url: "https://opencellid.org/",
    format: "CSV bulk download / REST API",
    updateFrequency: "Crowd-sourced, continuous",
    description:
      "Open database of cell tower locations crowd-sourced from mobile devices. Provides MCC/MNC/LAC/CID identifiers with lat/lon coordinates. Requires free API key.",
    fields: [
      "MCC (country)",
      "MNC (network)",
      "LAC (area code)",
      "CID (cell ID)",
      "Latitude/Longitude",
      "Signal range",
      "Sample count",
      "Radio type (GSM/UMTS/LTE/NR)",
    ],
    access: "api-key",
  },
  {
    name: "AntennaSearch",
    url: "https://www.antennasearch.com/",
    format: "Web interface",
    updateFrequency: "Real-time (FCC-sourced)",
    description:
      "Commercial tool that searches FCC databases for registered towers and antennas near any address. Shows tower count, distances, and owner information.",
    fields: [
      "Tower locations near address",
      "Distance from search point",
      "Owner/registrant",
      "Structure height",
      "FCC registration number",
    ],
    access: "public",
  },
];

const ASR_TABLE_SCHEMA = [
  {
    file: "CO.dat",
    table: "PUBACC_CO",
    description: "Coordinates",
    fields: ["Registration Number", "Latitude DD (NAD 83)", "Longitude DD (NAD 83)", "Lat/Lon source"],
  },
  {
    file: "RA.dat",
    table: "PUBACC_RA",
    description: "Registration / Application Data",
    fields: [
      "FCC Registration Number",
      "Structure Type Code",
      "Height AGL (ft)",
      "Overall Height AGL (ft)",
      "Elevation AMSL (ft)",
      "Overall Height AMSL (ft)",
      "Date Issued",
      "Date Constructed",
      "FAA Study Number",
      "Marking Code",
      "Lighting Code",
    ],
  },
  {
    file: "EN.dat",
    table: "PUBACC_EN",
    description: "Entity / Owner",
    fields: [
      "Entity Name",
      "Street Address",
      "City",
      "State",
      "ZIP",
      "Phone",
      "FCC Registration Number (FRN)",
      "Entity Type",
    ],
  },
];

export default function FCCDataSources() {
  const [expandedSource, setExpandedSource] = useState<string | null>(
    "FCC Public Access Files (ASR)"
  );

  return (
    <div className="space-y-8">
      {/* Data Sources */}
      <div className="space-y-4">
        {DATA_SOURCES.map((source) => (
          <div
            key={source.name}
            className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedSource(
                  expandedSource === source.name ? null : source.name
                )
              }
              className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-slate-800/80 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    source.access === "public"
                      ? "bg-green-500"
                      : source.access === "api-key"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                />
                <div>
                  <h4 className="font-semibold text-white">{source.name}</h4>
                  <span className="text-xs text-gray-500">
                    {source.format} &middot; {source.updateFrequency}
                  </span>
                </div>
              </div>
              <span className="text-gray-500 text-xl">
                {expandedSource === source.name ? "\u2212" : "+"}
              </span>
            </button>

            {expandedSource === source.name && (
              <div className="px-5 pb-5 border-t border-slate-700/50">
                <p className="text-sm text-gray-400 mt-3 mb-4">
                  {source.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {source.fields.map((field) => (
                    <span
                      key={field}
                      className="text-xs bg-slate-900/80 text-gray-300 px-2 py-1 rounded"
                    >
                      {field}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Open Data Source &rarr;
                  </a>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      source.access === "public"
                        ? "bg-green-500/20 text-green-300"
                        : source.access === "api-key"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {source.access === "public"
                      ? "Public Access"
                      : source.access === "api-key"
                        ? "API Key Required"
                        : "Request Access"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ASR Schema Reference */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          FCC ASR File Schema Reference
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          The FCC distributes ASR data as pipe-delimited (.dat) files. Three key
          files contain the data needed for tower mapping: coordinates, registration
          details, and owner information. Files are joined by FCC Registration Number.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {ASR_TABLE_SCHEMA.map((table) => (
            <div
              key={table.file}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-400 font-mono font-bold text-sm">
                  {table.file}
                </span>
                <span className="text-xs text-gray-500">({table.table})</span>
              </div>
              <p className="text-sm text-gray-300 mb-3">{table.description}</p>
              <ul className="space-y-1">
                {table.fields.map((field) => (
                  <li
                    key={field}
                    className="text-xs text-gray-400 flex items-center gap-1.5"
                  >
                    <span className="text-gray-600">&bull;</span>
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Documentation:{" "}
          <a
            href="https://www.fcc.gov/sites/default/files/pubacc_asr_intro.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            ASR Introduction (PDF)
          </a>
          {" "}&middot;{" "}
          <a
            href="https://www.fcc.gov/sites/default/files/pubacc_asr_codes_data_elem.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            ASR Codes &amp; Data Elements (PDF)
          </a>
        </div>
      </div>

      {/* Chicago Area Stats */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Chicago / Illinois Tower Landscape
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900/50 rounded p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">~130,000+</div>
            <div className="text-xs text-gray-400">FCC Registered Structures (US)</div>
          </div>
          <div className="bg-slate-900/50 rounded p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">~2,500+</div>
            <div className="text-xs text-gray-400">Towers in Illinois</div>
          </div>
          <div className="bg-slate-900/50 rounded p-4 text-center">
            <div className="text-2xl font-bold text-green-400">5</div>
            <div className="text-xs text-gray-400">Major Tower Companies</div>
          </div>
          <div className="bg-slate-900/50 rounded p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">3-5</div>
            <div className="text-xs text-gray-400">Carriers per Tower (avg)</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Major Tower Companies (Illinois)</h4>
            <div className="space-y-2">
              {[
                { name: "American Tower Corp", towers: "~40,000 US", note: "Largest US tower company" },
                { name: "Crown Castle International", towers: "~40,000 US", note: "Strong Chicago metro presence" },
                { name: "SBA Communications", towers: "~17,000 US", note: "Growing IL portfolio" },
                { name: "Vertical Bridge", towers: "~11,000 US", note: "Independent tower operator" },
                { name: "Phoenix Tower International", towers: "~5,000 US", note: "Rural/suburban focus" },
              ].map((co) => (
                <div key={co.name} className="flex items-center justify-between text-sm bg-slate-900/50 rounded p-2">
                  <span className="text-gray-300">{co.name}</span>
                  <span className="text-xs text-gray-500">{co.towers}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Major Carriers</h4>
            <div className="space-y-2">
              {[
                { name: "AT&T", color: "#00a8e0", note: "Densest IL coverage" },
                { name: "Verizon", color: "#cd040b", note: "Strong metro coverage" },
                { name: "T-Mobile / Sprint", color: "#e20074", note: "Merged network" },
                { name: "US Cellular", color: "#00923f", note: "Strong rural IL presence" },
                { name: "Dish / Boost", color: "#ec1944", note: "Building 5G network" },
              ].map((carrier) => (
                <div key={carrier.name} className="flex items-center justify-between text-sm bg-slate-900/50 rounded p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: carrier.color }} />
                    <span className="text-gray-300">{carrier.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{carrier.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
