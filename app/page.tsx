import { ExperimentGrid } from "@/components/experiment-grid"
import { LabHeader } from "@/components/lab-header"
import { ChemistryBackground } from "@/components/chemistry-background"

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ChemistryBackground />
      <div className="relative z-10">
        <LabHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-lab-primary via-lab-secondary to-lab-accent bg-clip-text text-transparent">
              Virtual Chemistry Lab
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Experience immersive chemistry experiments with AR-like 3D interactions, AI-guided instructions, and
              real-time observations.
            </p>
          </div>
          <ExperimentGrid />
        </main>
      </div>
    </div>
  )
}
