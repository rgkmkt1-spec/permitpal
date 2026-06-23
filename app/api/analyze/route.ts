import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zip, city, projectLabel, sqft, height, contractor, timeline } = body;

    const prompt = `You are PermitPal, a US building permit expert. Return ONLY a valid JSON object, no markdown, no extra text.

Project: ${projectLabel} in ZIP ${zip}${city ? ` (${city})` : ""}
Size: ${sqft || "unspecified"}, Height: ${height || "unspecified"}
Contractor: ${contractor || "unspecified"}, Timeline: ${timeline || "unspecified"}

Return this exact JSON structure with SHORT values (keep each string under 100 characters):

{"municipality":"City, State","summary":"One sentence summary.","permits_required":[{"name":"Permit name","icon":"emoji","description":"Short description under 80 chars.","typical_cost":"$X-$Y","typical_timeline":"X-Y weeks","who_files":"Homeowner or Contractor"}],"permits_not_required":[{"name":"Item","reason":"Short reason."}],"checklist":["Step 1","Step 2","Step 3","Step 4","Step 5"],"warnings":["Warning 1","Warning 2"],"cost_estimate":{"permit_fees_low":100,"permit_fees_high":500,"inspection_fees_low":75,"inspection_fees_high":250,"notes":"Short note."},"inspector_tips":["Tip 1","Tip 2"]}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.map((b: any) => (b.type === "text" ? b.text : "")).join("");
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}