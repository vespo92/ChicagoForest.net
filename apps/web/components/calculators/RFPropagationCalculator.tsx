"use client";

import { useState, useMemo } from "react";
import {
  freeSpacePathLoss,
  fresnelZoneRadiusMidpoint,
  requiredClearance,
  twoRayGroundReflection,
  criticalDistance,
  linkBudget,
  fadeMargin,
  maxRange,
  analyzeLinkBudget,
  wavelength,
  eirp,
  dbmToMw,
  wattsToDbm,
} from "@/lib/calculations/rfPropagation";

interface CalculatorTab {
  id: string;
  name: string;
  description: string;
}

const tabs: CalculatorTab[] = [
  {
    id: "fspl",
    name: "Free Space Path Loss",
    description: "Calculate signal loss in ideal free space conditions",
  },
  {
    id: "fresnel",
    name: "Fresnel Zone",
    description: "Calculate required clearance for line-of-sight links",
  },
  {
    id: "tworay",
    name: "Two-Ray Model",
    description: "Ground reflection model for terrestrial links",
  },
  {
    id: "linkbudget",
    name: "Link Budget",
    description: "Complete link analysis for mesh network planning",
  },
  {
    id: "range",
    name: "Max Range",
    description: "Estimate maximum communication range",
  },
];

export default function RFPropagationCalculator() {
  const [activeTab, setActiveTab] = useState("fspl");

  // FSPL inputs
  const [fsplDistance, setFsplDistance] = useState(1);
  const [fsplFrequency, setFsplFrequency] = useState(2400);

  // Fresnel inputs
  const [fresnelDistance, setFresnelDistance] = useState(5);
  const [fresnelFrequency, setFresnelFrequency] = useState(2.4);

  // Two-ray inputs
  const [twoRayDistance, setTwoRayDistance] = useState(1000);
  const [twoRayTxHeight, setTwoRayTxHeight] = useState(30);
  const [twoRayRxHeight, setTwoRayRxHeight] = useState(10);
  const [twoRayFrequency, setTwoRayFrequency] = useState(900);

  // Link budget inputs
  const [lbTxPower, setLbTxPower] = useState(20);
  const [lbTxGain, setLbTxGain] = useState(6);
  const [lbRxGain, setLbRxGain] = useState(6);
  const [lbDistance, setLbDistance] = useState(2);
  const [lbFrequency, setLbFrequency] = useState(2400);
  const [lbMiscLoss, setLbMiscLoss] = useState(2);
  const [lbSensitivity, setLbSensitivity] = useState(-90);

  // Max range inputs
  const [rangeTxPower, setRangeTxPower] = useState(20);
  const [rangeTxGain, setRangeTxGain] = useState(6);
  const [rangeRxGain, setRangeRxGain] = useState(6);
  const [rangeSensitivity, setRangeSensitivity] = useState(-90);
  const [rangeFrequency, setRangeFrequency] = useState(2400);
  const [rangeFadeMargin, setRangeFadeMargin] = useState(10);

  // Calculated results
  const fsplResult = useMemo(
    () => freeSpacePathLoss(fsplDistance, fsplFrequency),
    [fsplDistance, fsplFrequency]
  );

  const fresnelResult = useMemo(
    () => ({
      radius: fresnelZoneRadiusMidpoint(fresnelDistance, fresnelFrequency),
      clearance: requiredClearance(fresnelDistance, fresnelFrequency),
      wavelengthM: wavelength(fresnelFrequency * 1000),
    }),
    [fresnelDistance, fresnelFrequency]
  );

  const twoRayResult = useMemo(
    () => ({
      pathLoss: twoRayGroundReflection(
        twoRayDistance,
        twoRayTxHeight,
        twoRayRxHeight,
        twoRayFrequency
      ),
      criticalDist: criticalDistance(twoRayTxHeight, twoRayRxHeight, twoRayFrequency),
      fspl: freeSpacePathLoss(twoRayDistance / 1000, twoRayFrequency),
    }),
    [twoRayDistance, twoRayTxHeight, twoRayRxHeight, twoRayFrequency]
  );

  const linkBudgetResult = useMemo(
    () =>
      analyzeLinkBudget({
        txPowerDbm: lbTxPower,
        txGainDbi: lbTxGain,
        rxGainDbi: lbRxGain,
        distanceKm: lbDistance,
        frequencyMHz: lbFrequency,
        miscLossDb: lbMiscLoss,
        rxSensitivityDbm: lbSensitivity,
      }),
    [lbTxPower, lbTxGain, lbRxGain, lbDistance, lbFrequency, lbMiscLoss, lbSensitivity]
  );

  const rangeResult = useMemo(
    () =>
      maxRange(
        rangeTxPower,
        rangeTxGain,
        rangeRxGain,
        rangeSensitivity,
        rangeFrequency,
        rangeFadeMargin
      ),
    [rangeTxPower, rangeTxGain, rangeRxGain, rangeSensitivity, rangeFrequency, rangeFadeMargin]
  );

  const renderInput = (
    label: string,
    value: number,
    setter: (v: number) => void,
    unit: string,
    min?: number,
    max?: number,
    step?: number
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-muted-foreground">
        {label} <span className="text-xs">({unit})</span>
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => setter(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step || 1}
        className="px-3 py-2 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );

  const renderResult = (label: string, value: number | string, unit: string, highlight?: boolean) => (
    <div
      className={`p-3 rounded-md ${
        highlight ? "bg-primary/10 border border-primary/30" : "bg-muted/50"
      }`}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-mono ${highlight ? "text-primary font-bold" : ""}`}>
        {typeof value === "number" ? value.toFixed(2) : value} {unit}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Description */}
      <p className="text-muted-foreground">
        {tabs.find((t) => t.id === activeTab)?.description}
      </p>

      {/* Calculator Content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Inputs Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Input Parameters</h3>

          {activeTab === "fspl" && (
            <div className="space-y-4">
              {renderInput("Distance", fsplDistance, setFsplDistance, "km", 0.001, 1000, 0.1)}
              {renderInput("Frequency", fsplFrequency, setFsplFrequency, "MHz", 1, 100000, 1)}
              <div className="p-4 bg-muted/30 rounded-md text-sm">
                <div className="font-medium mb-2">Formula:</div>
                <code className="text-xs">
                  FSPL(dB) = 20log₁₀(d) + 20log₁₀(f) + 32.45
                </code>
                <div className="mt-2 text-muted-foreground text-xs">
                  Where d = distance (km), f = frequency (MHz)
                </div>
              </div>
            </div>
          )}

          {activeTab === "fresnel" && (
            <div className="space-y-4">
              {renderInput("Link Distance", fresnelDistance, setFresnelDistance, "km", 0.1, 100, 0.1)}
              {renderInput("Frequency", fresnelFrequency, setFresnelFrequency, "GHz", 0.1, 100, 0.1)}
              <div className="p-4 bg-muted/30 rounded-md text-sm">
                <div className="font-medium mb-2">Formula:</div>
                <code className="text-xs">
                  r₁ = 17.3 × √((d₁ × d₂) / (f × D))
                </code>
                <div className="mt-2 text-muted-foreground text-xs">
                  60% clearance of first Fresnel zone required for near-free-space propagation
                </div>
              </div>
            </div>
          )}

          {activeTab === "tworay" && (
            <div className="space-y-4">
              {renderInput("Distance", twoRayDistance, setTwoRayDistance, "m", 10, 50000, 10)}
              {renderInput("TX Antenna Height", twoRayTxHeight, setTwoRayTxHeight, "m", 1, 500, 1)}
              {renderInput("RX Antenna Height", twoRayRxHeight, setTwoRayRxHeight, "m", 1, 500, 1)}
              {renderInput("Frequency", twoRayFrequency, setTwoRayFrequency, "MHz", 1, 100000, 1)}
              <div className="p-4 bg-muted/30 rounded-md text-sm">
                <div className="font-medium mb-2">Formula (far field):</div>
                <code className="text-xs">
                  PL = 40log₁₀(d) - 20log₁₀(ht) - 20log₁₀(hr)
                </code>
                <div className="mt-2 text-muted-foreground text-xs">
                  Path loss increases at 40 dB/decade beyond critical distance
                </div>
              </div>
            </div>
          )}

          {activeTab === "linkbudget" && (
            <div className="space-y-4">
              {renderInput("TX Power", lbTxPower, setLbTxPower, "dBm", -30, 50, 1)}
              {renderInput("TX Antenna Gain", lbTxGain, setLbTxGain, "dBi", 0, 30, 0.5)}
              {renderInput("RX Antenna Gain", lbRxGain, setLbRxGain, "dBi", 0, 30, 0.5)}
              {renderInput("Distance", lbDistance, setLbDistance, "km", 0.01, 100, 0.1)}
              {renderInput("Frequency", lbFrequency, setLbFrequency, "MHz", 1, 100000, 1)}
              {renderInput("Cable/Misc Losses", lbMiscLoss, setLbMiscLoss, "dB", 0, 20, 0.5)}
              {renderInput("RX Sensitivity", lbSensitivity, setLbSensitivity, "dBm", -120, -30, 1)}
            </div>
          )}

          {activeTab === "range" && (
            <div className="space-y-4">
              {renderInput("TX Power", rangeTxPower, setRangeTxPower, "dBm", -30, 50, 1)}
              {renderInput("TX Antenna Gain", rangeTxGain, setRangeTxGain, "dBi", 0, 30, 0.5)}
              {renderInput("RX Antenna Gain", rangeRxGain, setRangeRxGain, "dBi", 0, 30, 0.5)}
              {renderInput("RX Sensitivity", rangeSensitivity, setRangeSensitivity, "dBm", -120, -30, 1)}
              {renderInput("Frequency", rangeFrequency, setRangeFrequency, "MHz", 1, 100000, 1)}
              {renderInput("Required Fade Margin", rangeFadeMargin, setRangeFadeMargin, "dB", 0, 30, 1)}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Results</h3>

          {activeTab === "fspl" && (
            <div className="space-y-3">
              {renderResult("Free Space Path Loss", fsplResult, "dB", true)}
              {renderResult("Wavelength", wavelength(fsplFrequency) * 100, "cm")}
              {renderResult(
                "Signal at 1W TX",
                -fsplResult + 30,
                "dBm"
              )}
            </div>
          )}

          {activeTab === "fresnel" && (
            <div className="space-y-3">
              {renderResult("1st Fresnel Zone Radius", fresnelResult.radius, "m", true)}
              {renderResult("Required Clearance (60%)", fresnelResult.clearance, "m", true)}
              {renderResult("Wavelength", fresnelResult.wavelengthM * 100, "cm")}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md text-sm">
                <div className="font-medium text-yellow-600 mb-1">Planning Note</div>
                <div className="text-muted-foreground">
                  Ensure obstacles are at least {fresnelResult.clearance.toFixed(1)}m below the
                  line-of-sight path at the midpoint for optimal signal quality.
                </div>
              </div>
            </div>
          )}

          {activeTab === "tworay" && (
            <div className="space-y-3">
              {renderResult("Path Loss (Two-Ray)", twoRayResult.pathLoss, "dB", true)}
              {renderResult("Path Loss (Free Space)", twoRayResult.fspl, "dB")}
              {renderResult("Critical Distance", twoRayResult.criticalDist, "m")}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-md text-sm">
                <div className="font-medium text-blue-600 mb-1">Model Selection</div>
                <div className="text-muted-foreground">
                  {twoRayDistance < twoRayResult.criticalDist
                    ? "Distance is below critical distance - using Free Space model"
                    : "Distance exceeds critical distance - using Two-Ray Ground Reflection model (40 dB/decade)"}
                </div>
              </div>
            </div>
          )}

          {activeTab === "linkbudget" && (
            <div className="space-y-3">
              {renderResult(
                "Link Status",
                linkBudgetResult.linkViable ? "VIABLE" : "NOT VIABLE",
                "",
                true
              )}
              {renderResult("Path Loss", linkBudgetResult.pathLossDb, "dB")}
              {renderResult("Received Power", linkBudgetResult.receivedPowerDbm, "dBm")}
              {renderResult("Fade Margin", linkBudgetResult.fadeMarginDb, "dB", true)}
              {renderResult("EIRP", eirp(lbTxPower, lbTxGain, lbMiscLoss), "dBm")}
              {renderResult("Fresnel Radius", linkBudgetResult.fresnelRadiusM, "m")}
              {renderResult("Required Clearance", linkBudgetResult.requiredClearanceM, "m")}
              <div
                className={`p-4 rounded-md text-sm ${
                  linkBudgetResult.linkViable
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}
              >
                <div
                  className={`font-medium mb-1 ${
                    linkBudgetResult.linkViable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {linkBudgetResult.linkViable ? "Link Analysis: Good" : "Link Analysis: Insufficient"}
                </div>
                <div className="text-muted-foreground">
                  {linkBudgetResult.linkViable
                    ? `Link has ${linkBudgetResult.fadeMarginDb.toFixed(1)} dB fade margin. Suitable for mesh node deployment.`
                    : `Link is ${Math.abs(linkBudgetResult.fadeMarginDb).toFixed(1)} dB below required threshold. Consider higher gain antennas or reduced distance.`}
                </div>
              </div>
            </div>
          )}

          {activeTab === "range" && (
            <div className="space-y-3">
              {renderResult("Maximum Range", rangeResult, "km", true)}
              {renderResult("Maximum Range", rangeResult * 1000, "m")}
              {renderResult("Maximum Range", rangeResult * 0.621371, "miles")}
              {renderResult(
                "Total System Gain",
                rangeTxPower + rangeTxGain + rangeRxGain - rangeSensitivity - rangeFadeMargin,
                "dB"
              )}
              <div className="p-4 bg-muted/30 rounded-md text-sm">
                <div className="font-medium mb-2">Common WiFi Ranges (2.4 GHz):</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>Consumer router (100mW, 2dBi): ~0.5 km</li>
                  <li>Mesh node (200mW, 6dBi): ~2 km</li>
                  <li>Point-to-point (1W, 24dBi): ~15 km</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Source Attribution */}
      <div className="mt-8 p-4 bg-muted/20 rounded-lg border text-sm">
        <div className="font-medium mb-2">Sources & References</div>
        <div className="text-muted-foreground space-y-1 text-xs">
          <p>
            Calculations based on methodologies from{" "}
            <a
              href="https://www.ve2dbe.com/english1.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              VE2DBE Radio Mobile
            </a>{" "}
            by Roger Coud&eacute;
          </p>
          <p>
            ITM Longley-Rice Model:{" "}
            <a
              href="https://its.ntia.gov/software/itm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              NTIA ITS
            </a>
          </p>
          <p>
            Free Space Path Loss:{" "}
            <a
              href="https://en.wikipedia.org/wiki/Free-space_path_loss"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Wikipedia
            </a>
          </p>
          <p>
            Two-Ray Model:{" "}
            <a
              href="https://en.wikipedia.org/wiki/Two-ray_ground-reflection_model"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Wikipedia
            </a>
          </p>
          <p>
            Fresnel Zones:{" "}
            <a
              href="https://en.wikipedia.org/wiki/Fresnel_zone"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Wikipedia
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
