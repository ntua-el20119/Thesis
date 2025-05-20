// ─────────────────────────────────────────────────────────────
//  /src/app/api/llm/inconsistency-scan/route.ts
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not set" },
      { status: 500 }
    );
  }

  /* ---------------- Build the LLM prompt ------------------- */
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
    /* ---------------- Call OpenRouter ---------------------- */
    const llmRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method : "POST",
      headers: {
        Authorization : `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL  || "http://localhost:3000",
        "X-Title"     : process.env.NEXT_PUBLIC_SITE_NAME || "Rules as Code Text Wizard",
      },
      body: JSON.stringify({
        model      : "meta-llama/llama-3.1-8b-instruct:free",
        messages   : [{ role: "user", content: prompt }],
        max_tokens : 4096,
        temperature: 0.3,
      }),
    });

    if (!llmRes.ok) {
      const err = await llmRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error || "LLM request failed" },
        { status: llmRes.status }
      );
    }

    const raw = (await llmRes.json()).choices[0].message.content.trim();
    /* ------------- Graceful JSON parse -------------------- */
    const safeParse = (s: string) => {
      try { return JSON.parse(s); } catch { return undefined; }
    };

    let parsed: any = safeParse(raw);
    if (!parsed) {
      // remove everything before first “{” and after last “}”
      const salvaged = raw.replace(/^[\s\S]*?{/, "{").replace(/}[\s\S]*$/, "}");
      parsed = safeParse(salvaged);
    }
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid JSON returned by LLM" },
        { status: 500 }
      );
    }

    /* ------------- Persist to DB -------------------------- */
    await prisma.methodologyStep.upsert({
      where : {
        phase_stepName: { phase: "Preparation", stepName: "Inconsistency Scan" },
      },
      update: { input: text, output: JSON.stringify(parsed, null, 2), content: parsed },
      create: {
        phase    : "Preparation",
        stepName : "Inconsistency Scan",
        input    : text,
        output   : JSON.stringify(parsed, null, 2),
        content  : parsed,
        approved : false,
      },
    });

    /* ------------- Return JSON to UI ---------------------- */
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("inconsistency-scan route error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 }
    );
  }
}
