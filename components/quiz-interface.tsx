"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  BookOpenIcon,
  LoaderIcon,
  AlertTriangleIcon,
} from "lucide-react"
import Link from "next/link"

interface Question {
  id: number
  type: "multiple-choice" | "true-false" | "short-answer" | "calculation"
  question: string
  options?: string[]
  correctAnswer: number | boolean | string
  sampleAnswers?: string[]
  tolerance?: number
  explanation: string
  points: number
}

interface Quiz {
  id: string
  experimentId: string
  title: string
  description: string
  timeLimit: number
  passingScore: number
  questions: Question[]
}

interface QuizInterfaceProps {
  experimentId: string
}

interface QuizResult {
  experimentId: number
  userId: string
  score: number
  answers: { [key: number]: any }
  completedAt: string
  passed: boolean
}

export function QuizInterface({ experimentId }: QuizInterfaceProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: any }>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/quiz/${experimentId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch quiz data")
        }

        const data = await response.json()

        // Transform API data to match component interface
        const transformedQuiz: Quiz = {
          id: experimentId,
          experimentId: experimentId,
          title: data.quiz.title,
          description: "Test your understanding of the experiment concepts",
          timeLimit: 15, // Default 15 minutes
          passingScore: 70, // Default 70%
          questions: data.quiz.questions.map((q: any) => ({
            ...q,
            points: 10, // Default 10 points per question
            sampleAnswers: q.type === "short-answer" ? [q.correctAnswer] : undefined,
          })),
        }

        setQuiz(transformedQuiz)
        setTimeRemaining(transformedQuiz.timeLimit * 60)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz")
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [experimentId])

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setQuizCompleted(true)
            submitQuizToAPI()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizStarted, quizCompleted, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const calculateScore = () => {
    if (!quiz) return 0

    let totalScore = 0
    let maxScore = 0

    quiz.questions.forEach((question) => {
      maxScore += question.points
      const userAnswer = answers[question.id]

      if (question.type === "multiple-choice") {
        if (userAnswer === question.correctAnswer) {
          totalScore += question.points
        }
      } else if (question.type === "true-false") {
        if (userAnswer === question.correctAnswer) {
          totalScore += question.points
        }
      } else if (question.type === "calculation") {
        const numericAnswer = Number.parseFloat(userAnswer)
        const correctAnswer = Number.parseFloat(question.correctAnswer as string)
        const tolerance = question.tolerance || 0.01

        if (Math.abs(numericAnswer - correctAnswer) <= tolerance) {
          totalScore += question.points
        }
      } else if (question.type === "short-answer") {
        // Simple keyword matching for short answers
        const userText = (userAnswer || "").toLowerCase()
        const sampleAnswers = question.sampleAnswers || []
        const hasMatch = sampleAnswers.some(
          (sample) => userText.includes(sample.toLowerCase()) || sample.toLowerCase().includes(userText),
        )
        if (hasMatch && userText.length > 3) {
          totalScore += question.points
        }
      }
    })

    return Math.round((totalScore / maxScore) * 100)
  }

  const submitQuizToAPI = async () => {
    if (!quiz) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/quiz/${experimentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          userId: "anonymous", // In a real app, this would be the logged-in user ID
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit quiz")
      }

      const data = await response.json()
      setResult(data.result)
      setShowResults(true)
    } catch (err) {
      console.error("Error submitting quiz:", err)
      // Fallback to local calculation if API fails
      const localScore = calculateScore()
      const fallbackResult: QuizResult = {
        experimentId: Number.parseInt(experimentId),
        userId: "anonymous",
        score: localScore,
        answers,
        completedAt: new Date().toISOString(),
        passed: localScore >= (quiz?.passingScore || 70),
      }
      setResult(fallbackResult)
      setShowResults(true)
    } finally {
      setSubmitting(false)
    }
  }

  const submitQuiz = () => {
    setQuizCompleted(true)
    submitQuizToAPI()
  }

  const startQuiz = () => {
    setQuizStarted(true)
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setTimeRemaining(quiz ? quiz.timeLimit * 60 : 0)
    setQuizStarted(false)
    setQuizCompleted(false)
    setShowResults(false)
    setResult(null)
  }

  const nextQuestion = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-lab-primary" />
              <p className="text-muted-foreground">Loading quiz...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (error || !quiz) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <AlertTriangleIcon className="w-8 h-8 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2">Quiz Not Available</h3>
              <p className="text-muted-foreground mb-4">{error || "No quiz found for this experiment."}</p>
              <Link href={`/experiment/${experimentId}`}>
                <Button variant="outline" className="bg-transparent">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Experiment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  if (!quizStarted) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-4">{quiz.title}</CardTitle>
              <p className="text-muted-foreground">{quiz.description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-muted/50 rounded-lg p-4">
                  <ClockIcon className="w-6 h-6 mx-auto mb-2 text-lab-primary" />
                  <p className="font-semibold">{quiz.timeLimit} minutes</p>
                  <p className="text-sm text-muted-foreground">Time limit</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <TrophyIcon className="w-6 h-6 mx-auto mb-2 text-lab-secondary" />
                  <p className="font-semibold">{quiz.passingScore}%</p>
                  <p className="text-sm text-muted-foreground">Passing score</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Quiz Instructions</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Answer all {quiz.questions.length} questions within the time limit</li>
                  <li>• You can navigate between questions before submitting</li>
                  <li>• Review your answers before final submission</li>
                  <li>• Achieve {quiz.passingScore}% or higher to pass</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Link href={`/experiment/${quiz.experimentId}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Experiment
                  </Button>
                </Link>
                <Button onClick={startQuiz} className="flex-1 lab-gradient text-white">
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (showResults && result) {
    const passed = result.passed
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  passed ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {passed ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircleIcon className="w-8 h-8 text-red-600" />
                )}
              </div>
              <CardTitle className="text-2xl mb-2">{passed ? "Congratulations!" : "Keep Learning!"}</CardTitle>
              <p className="text-muted-foreground">
                {passed ? "You passed the quiz!" : "You can retake the quiz to improve your score."}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{result.score}%</div>
                <Badge variant={passed ? "default" : "destructive"} className="mb-4">
                  {passed ? "Passed" : "Failed"} (Required: {quiz.passingScore}%)
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-semibold">{Object.keys(result.answers).length}</p>
                  <p className="text-xs text-muted-foreground">Answered</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-semibold">{quiz.questions.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-semibold">{formatTime(quiz.timeLimit * 60 - timeRemaining)}</p>
                  <p className="text-xs text-muted-foreground">Time used</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Quiz Completed</h4>
                <p className="text-sm text-muted-foreground">
                  Completed on {new Date(result.completedAt).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={resetQuiz} className="flex-1 bg-transparent" disabled={submitting}>
                  <RotateCcwIcon className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
                <Link href={`/experiment/${quiz.experimentId}`} className="flex-1">
                  <Button className="w-full lab-gradient text-white">
                    <BookOpenIcon className="w-4 h-4 mr-2" />
                    Review Material
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const currentQ = quiz.questions[currentQuestion]

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Quiz Header */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </Badge>
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="w-4 h-4" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{currentQ.points} points</div>
            </div>
            <Progress value={progress} className="mb-2" />
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQ.type === "multiple-choice" && (
              <RadioGroup
                value={answers[currentQ.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(currentQ.id, Number.parseInt(value))}
              >
                {currentQ.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.type === "true-false" && (
              <RadioGroup
                value={answers[currentQ.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(currentQ.id, value === "true")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="cursor-pointer">
                    True
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="cursor-pointer">
                    False
                  </Label>
                </div>
              </RadioGroup>
            )}

            {currentQ.type === "calculation" && (
              <div>
                <Input
                  type="number"
                  step="any"
                  placeholder="Enter your numerical answer"
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter your answer as a decimal number (e.g., 0.0992)
                </p>
              </div>
            )}

            {currentQ.type === "short-answer" && (
              <Textarea
                placeholder="Type your answer here..."
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                className="min-h-[100px]"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button onClick={submitQuiz} className="lab-gradient text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Quiz"
                )}
              </Button>
            ) : (
              <Button onClick={nextQuestion}>
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
