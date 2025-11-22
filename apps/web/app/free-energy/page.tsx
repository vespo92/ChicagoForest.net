import ResearchHero from "@/components/research/ResearchHero"
import TeslaSection from "@/components/research/TeslaSection"
import MalloveSection from "@/components/research/MalloveSection"
import MoraySection from "@/components/research/MoraySection"
import QuantumTheory from "@/components/research/QuantumTheory"
import ModernImplementations from "@/components/research/ModernImplementations"
import SourceLibrary from "@/components/research/SourceLibrary"

export default function FreeEnergyPage() {
  return (
    <main className="min-h-screen">
      <ResearchHero />
      <TeslaSection />
      <MalloveSection />
      <MoraySection />
      <QuantumTheory />
      <ModernImplementations />
      <SourceLibrary />
    </main>
  )
}