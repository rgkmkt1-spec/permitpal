import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectLabel, sqft, contractor, municipality, materialQuality, locationType } = body;

    const prompt = `You are a construction cost expert using current RSMeans 2024 pricing data.

Project details:
- Type: ${projectLabel}
- Size: ${sqft || "not specified"}
- Location: ${municipality || "US average"}
- Location type: ${locationType || "Suburban"} (Rural = 0.85x labor multiplier, Suburban = 1.0x, Urban = 1.25x)
- Material quality: ${materialQuality || "Mid-range"} (Budget = 0.75x materials, Mid-range = 1.0x, Premium = 1.5x)
- Using contractor: ${contractor || "not specified"}

Using RSMeans 2024 national average pricing data, apply the location and quality multipliers to generate a TIGHT, ACCURATE cost estimate. The low and high estimates should be within 20% of each other — not a wide range. Be specific and realistic.

For each material category, provide current 2024 average retail prices (what you'd pay at Home Depot or Lowe's).

Return ONLY valid JSON, no markdown:

{
  "project": "${projectLabel}",
  "size": "${sqft || "not specified"}",
  "quality": "${materialQuality || "Mid-range"}",
  "location_type": "${locationType || "Suburban"}",
  "cost_per_sqft_low": 18,
  "cost_per_sqft_high": 22,
  "total_low": 7200,
  "total_high": 8800,
  "materials": [
    {
      "category": "Lumber",
      "description": "Pressure treated 2x6 deck boards, joists, beams",
      "cost_low": 1200,
      "cost_high": 1500,
      "unit": "materials",
      "home_depot_search": "pressure treated deck boards",
      "lowes_search": "pressure treated lumber decking"
    }
  ],
  "labor_low": 2500,
  "labor_high": 3200,
  "timeline": "3-4 weeks",
  "money_saving_tips": [
    "Specific actionable tip to reduce cost for this project and quality level"
  ],
  "notes": "Brief note explaining the estimate basis and key cost drivers"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.map((b: any) => (b.type === "text" ? b.text : "")).join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Estimate error:", err);
    return NextResponse.json({ error: "Estimate failed" }, { status: 500 });
  }
}