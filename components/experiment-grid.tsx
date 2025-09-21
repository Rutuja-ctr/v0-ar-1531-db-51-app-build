import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FlaskConicalIcon, TestTubeIcon, ClockIcon, UsersIcon } from "lucide-react"
import Link from "next/link"

const experiments = [
  {
    id: 1,
    title: "Limit Test for Chloride",
    description:
      "Perform semi-quantitative test to detect chloride impurities using Nessler cylinders and silver nitrate",
    icon: TestTubeIcon,
    difficulty: "Intermediate",
    duration: "15 min",
    participants: "1",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Limit Test for Sulfate",
    description: "Detect sulfate impurities using barium chloride precipitation method with turbidity comparison",
    icon: FlaskConicalIcon,
    difficulty: "Intermediate",
    duration: "15 min",
    participants: "1",
    color: "from-teal-500 to-blue-500",
  },
]

export function ExperimentGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {experiments.map((experiment) => {
        const IconComponent = experiment.icon
        return (
          <Card
            key={experiment.id}
            className="glass-card hover:glow-effect transition-all duration-300 group cursor-pointer"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${experiment.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {experiment.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-xl group-hover:text-lab-primary transition-colors">
                {experiment.title}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">{experiment.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {experiment.duration}
                </div>
                <div className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  {experiment.participants}
                </div>
              </div>
              <Link href={`/experiment/${experiment.id}`}>
                <Button className="w-full lab-gradient text-white hover:opacity-90 transition-opacity">
                  Start Experiment
                </Button>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
