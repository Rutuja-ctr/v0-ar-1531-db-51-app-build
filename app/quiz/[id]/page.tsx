import { QuizInterface } from "@/components/quiz-interface"
import { LabHeader } from "@/components/lab-header"
import { ChemistryBackground } from "@/components/chemistry-background"

interface QuizPageProps {
  params: {
    id: string
  }
}

export default function QuizPage({ params }: QuizPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ChemistryBackground />
      <div className="relative z-10">
        <LabHeader />
        <QuizInterface experimentId={params.id} />
      </div>
    </div>
  )
}
