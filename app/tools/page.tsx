import RFPropagationCalculator from "@/components/calculators/RFPropagationCalculator";
import Disclaimer from "@/components/Disclaimer";

export const metadata = {
  title: "RF Propagation Tools | Chicago Plasma Forest Network",
  description:
    "Radio frequency propagation calculators for mesh network planning. Based on VE2DBE Radio Mobile methodologies.",
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            RF Propagation{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Calculators
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional radio frequency propagation tools for planning mesh network
            deployments. Based on industry-standard methodologies from VE2DBE Radio Mobile
            and ITM Longley-Rice models.
          </p>
        </div>

        {/* Disclaimer */}
        <Disclaimer />

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          <div className="p-6 rounded-xl bg-card border">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Path Loss Models</h3>
            <p className="text-sm text-muted-foreground">
              Free space, two-ray ground reflection, and knife-edge diffraction
              calculations for accurate range estimation.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Link Budget Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Complete link budget calculations including EIRP, fade margin, and
              receiver sensitivity analysis.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Fresnel Zone Planning</h3>
            <p className="text-sm text-muted-foreground">
              Calculate required clearance heights for optimal line-of-sight radio
              links between mesh nodes.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl bg-card border shadow-lg">
            <RFPropagationCalculator />
          </div>
        </div>
      </section>

      {/* Theory Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Understanding RF Propagation</h2>

          <div className="space-y-8">
            {/* FSPL */}
            <div className="p-6 rounded-xl bg-card border">
              <h3 className="text-lg font-semibold mb-3">Free Space Path Loss (FSPL)</h3>
              <p className="text-muted-foreground mb-4">
                The fundamental model for signal attenuation in ideal conditions. Signal power
                decreases with the square of distance due to the inverse square law of
                electromagnetic radiation.
              </p>
              <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
                FSPL(dB) = 20log<sub>10</sub>(d) + 20log<sub>10</sub>(f) + 32.45
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Where d = distance in km, f = frequency in MHz
              </p>
            </div>

            {/* Two-Ray Model */}
            <div className="p-6 rounded-xl bg-card border">
              <h3 className="text-lg font-semibold mb-3">Two-Ray Ground Reflection Model</h3>
              <p className="text-muted-foreground mb-4">
                More accurate for terrestrial links where ground reflection creates multipath.
                Beyond the critical distance, path loss increases at 40 dB/decade instead of
                20 dB/decade.
              </p>
              <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
                <div>Critical Distance: d<sub>c</sub> = 4h<sub>t</sub>h<sub>r</sub>/&lambda;</div>
                <div className="mt-2">
                  Far Field: P<sub>r</sub> &prop; h<sub>t</sub><sup>2</sup>h<sub>r</sub><sup>2</sup>/d<sup>4</sup>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Used by VE2DBE Radio Mobile for terrain-aware propagation modeling
              </p>
            </div>

            {/* Fresnel Zones */}
            <div className="p-6 rounded-xl bg-card border">
              <h3 className="text-lg font-semibold mb-3">Fresnel Zone Clearance</h3>
              <p className="text-muted-foreground mb-4">
                Radio waves don&apos;t travel in a laser-thin line. The Fresnel zone is an
                ellipsoidal region where most signal energy propagates. Obstructions within
                this zone cause additional attenuation.
              </p>
              <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
                r<sub>1</sub> = 17.3 &times; &radic;((d<sub>1</sub> &times; d<sub>2</sub>) / (f &times; D))
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                60% clearance of the first Fresnel zone is typically required for near-free-space
                propagation characteristics
              </p>
            </div>

            {/* Link Budget */}
            <div className="p-6 rounded-xl bg-card border">
              <h3 className="text-lg font-semibold mb-3">Link Budget Analysis</h3>
              <p className="text-muted-foreground mb-4">
                The complete accounting of all gains and losses in a radio link. A positive
                fade margin indicates a viable link with headroom for atmospheric variations.
              </p>
              <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm">
                <div>P<sub>rx</sub> = P<sub>tx</sub> + G<sub>tx</sub> + G<sub>rx</sub> - PL - L<sub>misc</sub></div>
                <div className="mt-2">Fade Margin = P<sub>rx</sub> - Sensitivity</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Essential for planning reliable mesh network node placement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Mesh Network Applications</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <h3 className="font-semibold mb-3">Node Placement Planning</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <span className="text-blue-400">1.</span> Calculate maximum range between nodes
                </li>
                <li>
                  <span className="text-blue-400">2.</span> Verify Fresnel zone clearance for obstacles
                </li>
                <li>
                  <span className="text-blue-400">3.</span> Ensure adequate fade margin (10+ dB)
                </li>
                <li>
                  <span className="text-blue-400">4.</span> Account for rain fade at higher frequencies
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <h3 className="font-semibold mb-3">Equipment Selection</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>
                  <span className="text-green-400">1.</span> Choose appropriate TX power for range
                </li>
                <li>
                  <span className="text-green-400">2.</span> Select antenna gain for link distance
                </li>
                <li>
                  <span className="text-green-400">3.</span> Match receiver sensitivity requirements
                </li>
                <li>
                  <span className="text-green-400">4.</span> Consider frequency band trade-offs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sources Footer */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto p-6 rounded-xl bg-muted/20 border">
          <h3 className="font-semibold mb-4">References & Sources</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-muted-foreground mb-2">Primary Sources</h4>
              <ul className="space-y-1">
                <li>
                  <a
                    href="https://www.ve2dbe.com/english1.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    VE2DBE Radio Mobile
                  </a>{" "}
                  - Roger Coud&eacute;
                </li>
                <li>
                  <a
                    href="https://its.ntia.gov/software/itm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    ITM Longley-Rice Model
                  </a>{" "}
                  - NTIA ITS
                </li>
                <li>
                  <a
                    href="http://radiomobile.pe1mew.nl/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Radio Mobile Tutorials
                  </a>{" "}
                  - PE1MEW
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-muted-foreground mb-2">Technical References</h4>
              <ul className="space-y-1">
                <li>
                  <a
                    href="https://en.wikipedia.org/wiki/Free-space_path_loss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Free Space Path Loss
                  </a>{" "}
                  - Wikipedia
                </li>
                <li>
                  <a
                    href="https://en.wikipedia.org/wiki/Two-ray_ground-reflection_model"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Two-Ray Ground Reflection
                  </a>{" "}
                  - Wikipedia
                </li>
                <li>
                  <a
                    href="https://en.wikipedia.org/wiki/Fresnel_zone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Fresnel Zones
                  </a>{" "}
                  - Wikipedia
                </li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            These calculators are for educational and planning purposes. Real-world RF
            propagation is affected by terrain, buildings, vegetation, weather, and other
            factors not captured in simplified models. Always perform site surveys for
            critical deployments.
          </p>
        </div>
      </section>
    </main>
  );
}
