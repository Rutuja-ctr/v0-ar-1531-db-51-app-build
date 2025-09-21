import { ExperimentDetails } from "@/components/experiment-details"
import { LabHeader } from "@/components/lab-header"
import { ChemistryBackground } from "@/components/chemistry-background"
import { notFound } from "next/navigation"

const experiments = [
  {
    id: "1",
    title: "Limit Test for Chloride",
    description:
      "Perform semi-quantitative test to detect chloride impurities using Nessler cylinders and silver nitrate",
    difficulty: "Intermediate",
    duration: "15 min",
    participants: "1",
    color: "from-blue-500 to-cyan-500",
    objectives: [
      "Understand the principle of limit tests for impurity detection",
      "Learn to use Nessler cylinders for comparative analysis",
      "Observe silver chloride precipitation and opalescence formation",
      "Compare sample turbidity with standard solution",
      "Determine pass/fail criteria for chloride impurity limits",
    ],
    materials: [
      "Nessler cylinders (2 pieces)",
      "Glass rod for stirring",
      "Test tube stand",
      "Measuring cylinders (50ml)",
      "Pipettes (1ml and 10ml)",
    ],
    chemicals: [
      "Dilute Nitric Acid (10ml)",
      "0.1M Silver Nitrate solution (1ml)",
      "Sodium Chloride Standard Solution (10ml)",
      "Distilled Water (as required)",
      "Test sample compound",
    ],
    procedure: [
      {
        step: 1,
        title: "Prepare Test Solution",
        description: "Dissolve the test compound in distilled water and transfer to first Nessler cylinder.",
        safety: "Handle chemicals with gloves and ensure proper ventilation.",
      },
      {
        step: 2,
        title: "Prepare Standard Solution",
        description: "Take 1ml of Sodium Chloride standard solution in the second Nessler cylinder.",
        safety: "Use accurate measuring pipettes for precise volumes.",
      },
      {
        step: 3,
        title: "Add Nitric Acid",
        description: "Add 10ml of dilute nitric acid to both cylinders to create acidic conditions.",
        safety: "Add acid slowly and avoid splashing. Nitric acid is corrosive.",
      },
      {
        step: 4,
        title: "Dilute Solutions",
        description: "Dilute both solutions to 50ml mark with distilled water and mix thoroughly.",
        safety: "Ensure both solutions have equal volumes for accurate comparison.",
      },
      {
        step: 5,
        title: "Add Silver Nitrate",
        description: "Add 1ml of 0.1M silver nitrate solution to both cylinders simultaneously.",
        safety: "Silver nitrate can stain skin and clothing. Handle carefully.",
      },
      {
        step: 6,
        title: "Mix and Wait",
        description: "Stir both solutions with glass rod and keep undisturbed for 5 minutes.",
        safety: "Use separate glass rods or clean thoroughly between solutions.",
      },
      {
        step: 7,
        title: "Observe and Compare",
        description: "Compare the turbidity/opalescence in both cylinders against a dark background.",
        safety: "Make observations immediately after the waiting period.",
      },
    ],
    theory:
      "Limit test for chloride is a semi-quantitative analytical method used to detect and estimate chloride impurities in pharmaceutical compounds. The principle is based on the reaction between chloride ions and silver nitrate in the presence of dilute nitric acid, forming silver chloride precipitate (AgCl). The reaction is: Cl⁻ + AgNO₃ → AgCl↓ + NO₃⁻. The silver chloride appears as white opalescence or turbidity. The intensity of turbidity is proportional to the chloride concentration. By comparing the test solution turbidity with a standard chloride solution of known concentration, we can determine if the chloride impurity is within acceptable limits.",
    safetyNotes: [
      "Always wear safety goggles and lab coat",
      "Handle nitric acid with extreme care - it is highly corrosive",
      "Silver nitrate can cause permanent stains - avoid contact with skin and clothing",
      "Work in a well-ventilated area",
      "Wash hands thoroughly after handling chemicals",
      "Dispose of silver-containing waste in designated containers",
      "Keep solutions away from direct sunlight during observation",
    ],
  },
  {
    id: "2",
    title: "Limit Test for Sulfate",
    description: "Detect sulfate impurities using barium chloride precipitation method with turbidity comparison",
    difficulty: "Intermediate",
    duration: "15 min",
    participants: "1",
    color: "from-teal-500 to-blue-500",
    objectives: [
      "Understand sulfate limit test methodology",
      "Learn barium sulfate precipitation technique",
      "Compare turbidity levels for quantitative analysis",
      "Apply limit test principles to pharmaceutical analysis",
    ],
    materials: [
      "Nessler cylinders (2 pieces)",
      "Glass rod for stirring",
      "Test tube stand",
      "Measuring cylinders",
      "Pipettes",
    ],
    chemicals: [
      "Dilute Hydrochloric Acid",
      "Barium Chloride solution",
      "Potassium Sulfate Standard Solution",
      "Distilled Water",
    ],
    procedure: [
      {
        step: 1,
        title: "Sample Preparation",
        description: "Prepare test solution and standard sulfate solution in separate Nessler cylinders.",
        safety: "Handle all chemicals with appropriate protective equipment.",
      },
      {
        step: 2,
        title: "Add Hydrochloric Acid",
        description: "Add dilute HCl to both solutions to create acidic conditions.",
        safety: "Add acid slowly to prevent violent reactions.",
      },
      {
        step: 3,
        title: "Add Barium Chloride",
        description: "Add barium chloride solution to precipitate sulfate as barium sulfate.",
        safety: "Barium compounds are toxic - handle with care.",
      },
      {
        step: 4,
        title: "Compare Turbidity",
        description: "Compare the turbidity in both cylinders after 5 minutes.",
        safety: "Make observations under consistent lighting conditions.",
      },
    ],
    theory:
      "Sulfate limit test detects sulfate impurities through precipitation with barium chloride, forming insoluble barium sulfate (BaSO₄). The reaction is: SO₄²⁻ + BaCl₂ → BaSO₄↓ + 2Cl⁻. The turbidity intensity indicates sulfate concentration.",
    safetyNotes: [
      "Barium compounds are highly toxic",
      "Wear protective equipment at all times",
      "Dispose of barium waste properly",
      "Avoid inhalation of chemical vapors",
    ],
  },
]

interface ExperimentPageProps {
  params: {
    id: string
  }
}

export default function ExperimentPage({ params }: ExperimentPageProps) {
  const experiment = experiments.find((exp) => exp.id === params.id)

  if (!experiment) {
    notFound()
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ChemistryBackground />
      <div className="relative z-10">
        <LabHeader />
        <ExperimentDetails experiment={experiment} />
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return experiments.map((experiment) => ({
    id: experiment.id,
  }))
}
