import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Type definition for the request body
interface InconsistencyScanBody {
  text: string;
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
  const { text }: InconsistencyScanBody = await req.json();

  // Validate API key configuration
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "Server configuration error: Missing OPENROUTER_API_KEY" },
      { status: 500 }
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
    // Call external LLM API to analyze text for inconsistencies
    const llmRes = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title":
            process.env.NEXT_PUBLIC_SITE_NAME || "Rules as Code Text Wizard",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
          temperature: 0.3,
        }),
      }
    );

    // Handle non-200 responses from LLM API
    if (!llmRes.ok) {
      const err = await llmRes.json().catch(() => ({}));
      console.error("LLM API error:", err);
      return NextResponse.json(
        { error: err.error || "LLM request failed" },
        { status: llmRes.status }
      );
    }

    // Parse LLM response
    const raw = (await llmRes.json()).choices[0].message.content.trim();

    // Utility function to attempt JSON parsing with error handling
    const safeParse = (s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return undefined;
      }
    };

    // Attempt to parse raw JSON response
    let parsed: any = safeParse(raw);

    // Fallback: Trim to outer braces if initial parse fails
    if (!parsed) {
      const salvaged = raw.replace(/^[\s\S]*?{/, "{").replace(/}[\s\S]*$/, "}");
      parsed = safeParse(salvaged);
    }

    // Return error if JSON parsing fails after attempts
    if (!parsed) {
      console.warn("Invalid JSON returned by LLM:", raw);
      return NextResponse.json(
        { error: "Invalid JSON returned by LLM" },
        { status: 500 }
      );
    }

    // Format raw JSON output for storage
    const output = JSON.stringify(parsed, null, 2); // Pretty-printed JSON

    // Store analysis results in database using Prisma upsert
    await prisma.methodologyStep.upsert({
      where: {
        phase_stepName: {
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
  } catch (err) {
    // Handle unexpected errors
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("inconsistency-scan route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
