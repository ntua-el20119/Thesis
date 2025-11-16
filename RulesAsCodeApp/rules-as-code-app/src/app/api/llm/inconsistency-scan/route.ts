import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

// Type definition for the request body
interface InconsistencyScanBody {
  text: string;
  projectId: number;
}

/**
 * POST Handler for Inconsistency Scan
 * Analyzes legal text to identify inconsistencies, contradictions, ambiguities, gaps, and overlaps
 * using an external LLM API and stores the result in the database using Prisma's upsert.
 * @param req - The incoming Next.js request containing the text to analyze
 * @returns JSON response with identified inconsistencies or error details
 */
export async function POST(req: NextRequest) {
  // Parse request body
  const { text, projectId }: InconsistencyScanBody = await req.json();

  // Validate projectId (same pattern as other steps)
  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json(
      { error: "Missing or invalid projectId" },
      { status: 400 }
    );
  }

  // Construct prompt for LLM to identify inconsistencies
  const prompt = `
You are analyzing legal text to identify inconsistencies as part of a Rules as Code implementation methodology. Your task is to detect contradictions, ambiguities, gaps, and overlaps in the legal text.

[SYSTEM INSTRUCTIONS]

Identify inconsistencies within each section and across different sections
Focus on aspects that would impact implementation as code
For each inconsistency, provide:
  • A clear description of the issue
  • The exact location in the text
  • The relevant text excerpt containing the inconsistency
Look specifically for:
  • Contradictions – rules that conflict with each other
  • Ambiguities   – unclear terms, conditions, or processes
  • Gaps          – missing information required to implement the rules
  • Overlaps      – redundant or duplicative rules or definitions

[EXPECTED OUTPUT FORMAT]  (strict JSON; NO extra prose)
{
  "result": {
    "inconsistencies": [
      {
        "id": "inconsist-1",
        "description": "…",
        "location": "sec-2",
        "text": "…",
        "type": "contradiction"
      }
      // …
    ],
    "analysisApproach": "…"
  },
  "confidence": 0.78,
  "analysisCompleteness": "…"
}

[SUCCESS CRITERIA]
• Include every inconsistency you can find, avoid false positives
• Confidence < 0.4 if you found none
only include the JSON output without any additional text or explanations.

Text to analyse:
${text}
`;

  try {
    // 🔹 Common OpenRouter call with shared JSON cleaning
    const { parsed } = await callOpenRouterJson({
      prompt,
      // model: you can override here if you want a different model for this step
      maxTokens: 4096,
      temperature: 0.3,
    });

    console.log("Parsed inconsistency-scan response:", parsed);

    // Format raw JSON output for storage (pretty-printed)
    const output = JSON.stringify(parsed, null, 2);

    // Store analysis results in database using Prisma upsert
    await prisma.methodologyStep.upsert({
      where: {
        projectId_phase_stepName: {
          projectId,
          phase: "Preparation",
          stepName: "Inconsistency Scan",
        },
      },
      update: {
        input: text,
        output,
        content: parsed,
        updatedAt: new Date(),
      },
      create: {
        projectId,
        phase: "Preparation",
        stepName: "Inconsistency Scan",
        input: text,
        output,
        content: parsed,
        approved: false,
      },
    });

    // Return the inconsistency analysis
    return NextResponse.json(parsed, { status: 200 });
  } catch (err: any) {
    if (err instanceof LlmApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("inconsistency-scan route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
