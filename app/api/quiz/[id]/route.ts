import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const experimentId = Number.parseInt(params.id)

    const quizzes = [
      {
        experimentId: 1,
        title: "Limit Test for Chloride - Quiz",
        questions: [
          {
            id: 1,
            type: "multiple-choice",
            question: "What is the chemical formula of the precipitate formed in the chloride limit test?",
            options: ["AgCl", "AgNO₃", "KCl", "AgOH"],
            correctAnswer: 0,
            explanation:
              "Silver chloride (AgCl) is the white precipitate formed when silver nitrate reacts with chloride ions.",
          },
          {
            id: 2,
            type: "true-false",
            question: "The intensity of turbidity is directly proportional to chloride concentration.",
            correctAnswer: true,
            explanation: "Yes, more chloride ions result in more AgCl precipitate, causing greater turbidity.",
          },
          {
            id: 3,
            type: "short-answer",
            question: "What safety precaution should be taken when handling silver nitrate?",
            correctAnswer: "Wear gloves and avoid skin contact as it can cause staining",
            explanation:
              "Silver nitrate can permanently stain skin and clothing, so proper protective equipment is essential.",
          },
          {
            id: 4,
            type: "multiple-choice",
            question: "What is the purpose of comparing the test solution with a standard solution?",
            options: [
              "To make the test more colorful",
              "To determine if chloride levels are within acceptable limits",
              "To speed up the reaction",
              "To neutralize the solution",
            ],
            correctAnswer: 1,
            explanation:
              "The standard solution provides a reference point to determine if the sample's chloride content is acceptable.",
          },
          {
            id: 5,
            type: "calculation",
            question:
              "If the standard solution contains 200 ppm chloride, and your test solution shows similar turbidity, what can you conclude about the chloride concentration?",
            correctAnswer: "200",
            tolerance: 50,
            explanation: "Similar turbidity indicates similar chloride concentration, approximately 200 ppm.",
          },
        ],
      },
    ]

    const quiz = quizzes.find((q) => q.experimentId === experimentId)

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    return NextResponse.json({ quiz })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { answers, userId = "anonymous" } = body

    console.log("[v0] Submitting quiz answers:", { experimentId: params.id, answers, userId })

    const experimentId = Number.parseInt(params.id)

    // Get the quiz data for scoring
    const quizzes = [
      {
        experimentId: 1,
        questions: [
          { id: 1, type: "multiple-choice", correctAnswer: 0, points: 20 },
          { id: 2, type: "true-false", correctAnswer: true, points: 20 },
          {
            id: 3,
            type: "short-answer",
            correctAnswer: "Wear gloves and avoid skin contact as it can cause staining",
            points: 20,
          },
          { id: 4, type: "multiple-choice", correctAnswer: 1, points: 20 },
          { id: 5, type: "calculation", correctAnswer: "200", tolerance: 50, points: 20 },
        ],
      },
    ]

    const quiz = quizzes.find((q) => q.experimentId === experimentId)

    let score = 0
    let maxScore = 0

    if (quiz) {
      quiz.questions.forEach((question) => {
        maxScore += question.points
        const userAnswer = answers[question.id]

        if (question.type === "multiple-choice") {
          if (userAnswer === question.correctAnswer) {
            score += question.points
          }
        } else if (question.type === "true-false") {
          if (userAnswer === question.correctAnswer) {
            score += question.points
          }
        } else if (question.type === "calculation") {
          const numericAnswer = Number.parseFloat(userAnswer)
          const correctAnswer = Number.parseFloat(question.correctAnswer as string)
          const tolerance = question.tolerance || 0.01

          if (Math.abs(numericAnswer - correctAnswer) <= tolerance) {
            score += question.points
          }
        } else if (question.type === "short-answer") {
          const userText = (userAnswer || "").toLowerCase()
          const correctText = (question.correctAnswer as string).toLowerCase()

          // Simple keyword matching
          const keywords = ["gloves", "avoid", "skin", "contact", "staining", "safety"]
          const matchedKeywords = keywords.filter((keyword) => userText.includes(keyword))

          if (matchedKeywords.length >= 2 && userText.length > 10) {
            score += question.points
          }
        }
      })
    }

    const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0

    const result = {
      experimentId: Number.parseInt(params.id),
      userId,
      score: finalScore,
      answers,
      completedAt: new Date().toISOString(),
      passed: finalScore >= 70,
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("[v0] Quiz submission error:", error)
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 })
  }
}
