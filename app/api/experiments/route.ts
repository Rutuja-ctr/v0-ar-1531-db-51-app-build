import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const experiments = [
      {
        id: 1,
        title: "Limit Test for Chloride",
        description:
          "Determine the chloride content in pharmaceutical samples using silver nitrate precipitation method",
        difficulty: "Intermediate",
        duration: "45 minutes",
        category: "Analytical Chemistry",
        materials: [
          "Test sample solution",
          "Standard chloride solution (100 ppm Cl⁻)",
          "Silver nitrate solution (AgNO₃) - 0.1 M",
          "Potassium chloride solution (KCl) - for preparation",
          "Distilled water",
          "Test tubes",
          "Test tube rack",
          "Measuring cylinders",
          "Beakers (100 mL, 250 mL)",
        ],
        steps: [
          {
            id: 1,
            title: "Prepare Standard Solution",
            description: "Add 5 mL of standard chloride solution (100 ppm Cl⁻) to a test tube",
            equipment: ["test_tube", "standard_solution"],
            chemicals: ["standard_chloride"],
            expectedResult: "Clear colorless solution in test tube",
          },
          {
            id: 2,
            title: "Prepare Test Solution",
            description: "Add 5 mL of test sample solution to another test tube",
            equipment: ["test_tube", "test_solution"],
            chemicals: ["test_sample"],
            expectedResult: "Clear solution in test tube (color may vary)",
          },
          {
            id: 3,
            title: "Add Silver Nitrate to Standard",
            description: "Add 1 mL of 0.1 M AgNO₃ solution to the standard solution tube",
            equipment: ["agno3_beaker"],
            chemicals: ["silver_nitrate"],
            expectedResult: "White precipitate formation (AgCl)",
          },
          {
            id: 4,
            title: "Add Silver Nitrate to Test",
            description: "Add 1 mL of 0.1 M AgNO₃ solution to the test solution tube",
            equipment: ["agno3_beaker"],
            chemicals: ["silver_nitrate"],
            expectedResult: "Precipitate formation - compare with standard",
          },
          {
            id: 5,
            title: "Compare Solutions",
            description: "Compare the turbidity/precipitate in both tubes visually",
            equipment: ["test_tube_rack"],
            chemicals: [],
            expectedResult: "Visual comparison to determine chloride content",
          },
        ],
        theory:
          "The limit test for chloride is based on the precipitation reaction between chloride ions and silver nitrate to form silver chloride precipitate. The intensity of turbidity is proportional to the chloride concentration.",
        safetyGuidelines: [
          "Wear safety goggles and gloves",
          "Handle silver nitrate with care - it can stain skin and clothing",
          "Work in well-ventilated area",
          "Dispose of silver-containing waste properly",
        ],
      },
      {
        id: 2,
        title: "pH Determination",
        description: "Measure and analyze pH of various solutions using indicators and pH meter",
        difficulty: "Beginner",
        duration: "30 minutes",
        category: "General Chemistry",
        materials: ["pH strips", "pH meter", "Buffer solutions", "Test solutions"],
        steps: [
          {
            id: 1,
            title: "Calibrate pH Meter",
            description: "Calibrate the pH meter using standard buffer solutions",
            equipment: ["ph_meter"],
            chemicals: ["buffer_solutions"],
            expectedResult: "pH meter shows correct readings for buffers",
          },
        ],
        theory: "pH is a measure of hydrogen ion concentration in solution.",
        safetyGuidelines: ["Handle chemicals carefully", "Clean electrodes properly"],
      },
    ]

    return NextResponse.json({ experiments })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experiments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Creating new experiment:", body)

    // In a real app, this would save to database
    const newExperiment = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ experiment: newExperiment }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create experiment" }, { status: 500 })
  }
}
