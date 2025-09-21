import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const experimentId = Number.parseInt(params.id)

    // In a real app, this would fetch from database
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
    ]

    const experiment = experiments.find((exp) => exp.id === experimentId)

    if (!experiment) {
      return NextResponse.json({ error: "Experiment not found" }, { status: 404 })
    }

    return NextResponse.json({ experiment })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch experiment" }, { status: 500 })
  }
}
