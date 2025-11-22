import Hero from "@/components/Hero"
import Disclaimer from "@/components/Disclaimer"
import NetworkArchitecture from "@/components/NetworkArchitecture"
import PlasmaForestDiagram from "@/components/PlasmaForestDiagram"
import ProtocolSpecs from "@/components/ProtocolSpecs"
import CommunityOnboarding from "@/components/CommunityOnboarding"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <div className="container mx-auto px-4">
        <Disclaimer />
      </div>
      <NetworkArchitecture />
      <PlasmaForestDiagram />
      <ProtocolSpecs />
      <CommunityOnboarding />
    </main>
  )
}
