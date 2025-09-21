import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "anonymous"

    // In a real app, this would fetch from database
    const progress = {
      userId,
      experiments: [
        {
          experimentId: 1,
          status: "in-progress",
          currentStep: 3,
          totalSteps: 5,
          completedAt: null,
          observations: [
            { step: 1, observation: "Clear colorless solution prepared", timestamp: new Date().toISOString() },
            { step: 2, observation: "Test solution prepared", timestamp: new Date().toISOString() },
          ],
        },
      ],
      quizzes: [
        {
          experimentId: 1,
          score: null,
          completedAt: null,
          attempts: 0,
        },
      ],
    }

    return NextResponse.json({ progress })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Updating progress:", body)

    // In a real app, this would update database
    const updatedProgress = {
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ progress: updatedProgress })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
