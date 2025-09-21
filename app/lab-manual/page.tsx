import { LabHeader } from "@/components/lab-header"
import { ChemistryBackground } from "@/components/chemistry-background"
import { LabManual } from "@/components/lab-manual"

export default function LabManualPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ChemistryBackground />
      <div className="relative z-10">
        <LabHeader />
        <LabManual />
      </div>
    </div>
  )
}
