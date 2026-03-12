import Hero from "@/components/Hero"
import NetworkArchitecture from "@/components/NetworkArchitecture"
import PlasmaForestDiagram from "@/components/PlasmaForestDiagram"
import ProtocolSpecs from "@/components/ProtocolSpecs"
import CommunityOnboarding from "@/components/CommunityOnboarding"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <NetworkArchitecture />
      <PlasmaForestDiagram />
      <ProtocolSpecs />
      <CommunityOnboarding />
    </main>
  )
}
