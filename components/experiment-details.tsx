import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ClockIcon,
  UsersIcon,
  PlayIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  FlaskConicalIcon,
  TargetIcon,
  ListIcon,
  BrainIcon,
} from "lucide-react"
import Link from "next/link"

interface ExperimentDetailsProps {
  experiment: {
    id: string
    title: string
    description: string
    difficulty: string
    duration: string
    participants: string
    color: string
    objectives: string[]
    materials: string[]
    procedure: Array<{
      step: number
      title: string
      description: string
      safety: string
    }>
    theory: string
    safetyNotes: string[]
  }
}

export function ExperimentDetails({ experiment }: ExperimentDetailsProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-balance mb-4">{experiment.title}</h1>
              <p className="text-lg text-muted-foreground text-pretty mb-6">{experiment.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary">{experiment.difficulty}</Badge>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {experiment.duration}
                </div>
                <div className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  {experiment.participants}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href={`/lab/${experiment.id}`}>
              <Button size="lg" className="lab-gradient text-white hover:opacity-90">
                <PlayIcon className="w-5 h-5 mr-2" />
                Start Virtual Lab
              </Button>
            </Link>
            <Link href={`/quiz/${experiment.id}`}>
              <Button variant="outline" size="lg">
                <BrainIcon className="w-5 h-5 mr-2" />
                Take Quiz
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              <BookOpenIcon className="w-5 h-5 mr-2" />
              Download Manual
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 glass-card">
            <TabsTrigger value="overview" className="gap-2">
              <TargetIcon className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="procedure" className="gap-2">
              <ListIcon className="w-4 h-4" />
              Procedure
            </TabsTrigger>
            <TabsTrigger value="theory" className="gap-2">
              <BookOpenIcon className="w-4 h-4" />
              Theory
            </TabsTrigger>
            <TabsTrigger value="safety" className="gap-2">
              <ShieldCheckIcon className="w-4 h-4" />
              Safety
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TargetIcon className="w-5 h-5" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {experiment.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-lab-primary mt-2 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConicalIcon className="w-5 h-5" />
                    Materials & Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {experiment.materials.map((material, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-lab-secondary mt-2 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{material}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="procedure" className="space-y-4">
            {experiment.procedure.map((step, index) => (
              <Card key={index} className="glass-card">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full lab-gradient flex items-center justify-center text-white font-bold text-sm">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription className="mt-2 leading-relaxed">{step.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <ShieldCheckIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800">{step.safety}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="theory">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Theoretical Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{experiment.theory}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="safety">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5" />
                  Safety Guidelines
                </CardTitle>
                <CardDescription>
                  Please read and follow all safety instructions before beginning the experiment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {experiment.safetyNotes.map((note, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <ShieldCheckIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
