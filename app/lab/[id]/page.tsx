import { VirtualLabInterface } from "@/components/virtual-lab-interface"
import { ChemistryBackground } from "@/components/chemistry-background"
import { notFound } from "next/navigation"

const experiments = [
  {
    id: "1",
    title: "Acid-Base Titration",
    description: "Interactive titration with 3D equipment",
    equipment: ["burette", "flask", "pipette", "indicator"],
    steps: [
      {
        id: 1,
        title: "Setup Equipment",
        instruction: "Click on the burette to fill it with NaOH solution",
        equipment: "burette",
        action: "fill",
      },
      {
        id: 2,
        title: "Prepare Sample",
        instruction: "Use the pipette to transfer 25ml of HCl to the flask",
        equipment: "pipette",
        action: "transfer",
      },
      {
        id: 3,
        title: "Add Indicator",
        instruction: "Add 2-3 drops of phenolphthalein indicator",
        equipment: "indicator",
        action: "add",
      },
      {
        id: 4,
        title: "Begin Titration",
        instruction: "Slowly turn the burette tap to add NaOH drop by drop",
        equipment: "burette",
        action: "titrate",
      },
    ],
  },
  {
    id: "2",
    title: "Chemical Bonding",
    description: "3D molecular modeling and visualization",
    equipment: ["atoms", "bonds", "electron-cloud"],
    steps: [
      {
        id: 1,
        title: "Build Water Molecule",
        instruction: "Drag oxygen and hydrogen atoms to form H2O",
        equipment: "atoms",
        action: "build",
      },
      {
        id: 2,
        title: "Add Electron Clouds",
        instruction: "Visualize electron distribution around atoms",
        equipment: "electron-cloud",
        action: "visualize",
      },
    ],
  },
]

interface VirtualLabPageProps {
  params: {
    id: string
  }
}

export default function VirtualLabPage({ params }: VirtualLabPageProps) {
  const experiment = experiments.find((exp) => exp.id === params.id)

  if (!experiment) {
    notFound()
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900">
      <ChemistryBackground />
      <div className="relative z-10">
        <VirtualLabInterface experiment={experiment} />
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return experiments.map((experiment) => ({
    id: experiment.id,
  }))
}
