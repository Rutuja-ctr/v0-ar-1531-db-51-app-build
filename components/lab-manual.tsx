import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FlaskConicalIcon, TestTubeIcon, AtomIcon, ZapIcon, ClockIcon, UsersIcon, ArrowRightIcon } from "lucide-react"
import Link from "next/link"

const experiments = [
  {
    id: "1",
    title: "Acid-Base Titration",
    description: "Learn pH indicators and neutralization reactions with interactive 3D equipment",
    icon: TestTubeIcon,
    difficulty: "Beginner",
    duration: "15 min",
    participants: "1-2",
    color: "from-blue-500 to-cyan-500",
    category: "Analytical Chemistry",
  },
  {
    id: "2",
    title: "Chemical Bonding",
    description: "Visualize molecular structures and electron interactions in 3D space",
    icon: AtomIcon,
    difficulty: "Intermediate",
    duration: "20 min",
    participants: "1",
    color: "from-purple-500 to-pink-500",
    category: "Physical Chemistry",
  },
  {
    id: "3",
    title: "Electrochemistry",
    description: "Explore redox reactions and electrochemical cells with real-time data",
    icon: ZapIcon,
    difficulty: "Advanced",
    duration: "25 min",
    participants: "1-3",
    color: "from-orange-500 to-red-500",
    category: "Physical Chemistry",
  },
  {
    id: "4",
    title: "Organic Synthesis",
    description: "Build complex organic molecules step-by-step with guided instructions",
    icon: FlaskConicalIcon,
    difficulty: "Advanced",
    duration: "30 min",
    participants: "1-2",
    color: "from-green-500 to-teal-500",
    category: "Organic Chemistry",
  },
]

export function LabManual() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-balance mb-6">Laboratory Manual</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Comprehensive guides for all virtual chemistry experiments with detailed procedures, safety guidelines, and
            theoretical background.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-lab-primary mb-2">4</div>
              <div className="text-sm text-muted-foreground">Experiments</div>
            </CardContent>
          </Card>
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-lab-secondary mb-2">90</div>
              <div className="text-sm text-muted-foreground">Total Minutes</div>
            </CardContent>
          </Card>
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-lab-accent mb-2">3</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
          <Card className="glass-card text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-lab-primary mb-2">AR</div>
              <div className="text-sm text-muted-foreground">3D Interactive</div>
            </CardContent>
          </Card>
        </div>

        {/* Experiments List */}
        <div className="space-y-6">
          {experiments.map((experiment) => {
            const IconComponent = experiment.icon
            return (
              <Card key={experiment.id} className="glass-card hover:glow-effect transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-r ${experiment.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{experiment.title}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-3">{experiment.description}</p>
                        </div>
                        <Badge variant="outline" className="ml-4 flex-shrink-0">
                          {experiment.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
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

                        <Link href={`/experiment/${experiment.id}`}>
                          <Button variant="outline" className="gap-2 bg-transparent">
                            View Details
                            <ArrowRightIcon className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
