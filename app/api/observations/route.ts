import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { experimentId, step, observation, userId = "anonymous" } = body

    console.log("[v0] Saving observation:", { experimentId, step, observation, userId })

    // In a real app, this would save to database
    const savedObservation = {
      id: Date.now(),
      experimentId,
      step,
      observation,
      userId,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ observation: savedObservation }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save observation" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const experimentId = searchParams.get("experimentId")
    const userId = searchParams.get("userId") || "anonymous"

    // In a real app, this would fetch from database
    const observations = [
      {
        id: 1,
        experimentId: Number.parseInt(experimentId || "1"),
        step: 1,
        observation: "Clear colorless solution prepared in test tube",
        userId,
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        experimentId: Number.parseInt(experimentId || "1"),
        step: 2,
        observation: "Test solution prepared - slightly yellowish color",
        userId,
        timestamp: new Date().toISOString(),
      },
    ]

    return NextResponse.json({ observations })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch observations" }, { status: 500 })
  }
}
