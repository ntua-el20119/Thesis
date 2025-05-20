// src/app/api/llm/key-sections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  POST /api/llm/key-sections                                        */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  const { text } = await req.json();

  /* ------------- API-key guard ------------- */
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not set" },
      { status: 500 }
    );
  }

  /* ------------- Prompt -------------------- */
  const prompt = `
You are processing legal text to identify the most important sections for implementation as code. Analyze the provided legal text sections and identify which ones are most important for implementation, focusing specifically on rules, definitions, and decision procedures.

[SYSTEM INSTRUCTIONS]

Analyze each section to determine its importance for code implementation
Assign an importance score (0-1) to each section based on implementation relevance
Categorize each section as one of: RULE, DEFINITION, PROCEDURE, CONTEXT, or OTHER
RULE: Contains conditional logic, requirements, or constraints
DEFINITION: Defines entities, terms, or concepts
PROCEDURE: Describes processes, workflows, or administrative steps
CONTEXT: Provides background or purpose information
OTHER: Miscellaneous content that doesn't fit other categories

[EXPECTED OUTPUT FORMAT] Your response must strictly follow this JSON format: { "result": { "sections": [ { "id": "[section id from input]", "title": "[section title from input]", "content": "[section content from input]", "importance": [score between 0 and 1], "category": "[RULE|DEFINITION|PROCEDURE|CONTEXT|OTHER]" } // Additional sections... ] }, "confidence": [score between 0 and 1] }

[SUCCESS CRITERIA] Your response will be evaluated based on:

Completeness - ALL sections from the input must be included in the output
Accurate categorization - Each section must be correctly categorized based on its content
Meaningful importance scores - Importance scores must reflect true implementation relevance
Rule identification - All sections containing conditional logic must be categorized as RULES
Definition identification - All sections defining entities must be categorized as DEFINITIONS

IMPORTANT: Your response MUST include ALL sections from the input, even those with low importance. Do not filter or omit any sections. 
Assign an appropriate importance score (0-1) to each section based on its relevance for implementation. 
Your confidence score should be below 0.5 if your categorization is uncertain or if you've rated all sections with similar importance scores.

[EXPECTED OUTPUT FORMAT] Your response must strictly follow this JSON format: 
{ "result": { "sections": [ { "id": "[section id from input]", "title": "[section title from input]", 
 "content": "[section content from input]", "importance": [score between 0 and 1], 
 "category": "[RULE|DEFINITION|PROCEDURE|CONTEXT|OTHER]" } // Additional sections... ] }, 
 // "confidence": [score between 0 and 1] }

 only include the JSON output without any additional text or explanations.

These are the sections:
${text}
`;

  try {
    /* ------------- LLM call ---------------- */
    const llm = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    });

    /* forward OpenRouter error as-is */
    if (!llm.ok) {
      const e = await llm.json().catch(() => ({}));
      return NextResponse.json(
        { error: e.error || "LLM request failed" },
        { status: llm.status }
      );
    }

    const raw: string = (await llm.json()).choices[0].message.content.trim();
    console.log("🔵 key-sections raw:", raw);

    /* ------------- graceful JSON parse ----- */
    const tryJSON = (s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return undefined;
      }
    };

    let parsed: any = tryJSON(raw);

    if (!parsed) {
      // trim to outer braces
      const trimmed = raw.replace(/^[\s\S]*?{/, "{").replace(/}[\s\S]*$/, "}");
      parsed = tryJSON(trimmed);
    }

    if (!parsed) {
      // repair: escape bare LF inside quoted strings
      const escaped = raw.replace(
        /"(?:[^"\\]|\\.)*"/gs,
        (m) => m.replace(/\n/g, "\\n")
      );
      parsed = tryJSON(escaped);
    }

    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid JSON returned by LLM" },
        { status: 500 }
      );
    }

    /* ------------- build raw-JSON output ---- */
    const output = JSON.stringify(parsed, null, 2); // raw, pretty-printed

    /* ------------- persist ------------------ */
    await prisma.methodologyStep.upsert({
      where: {
        phase_stepName: {
          phase: "Preparation",
          stepName: "Key Sections",
        },
      },
      update: { input: text, output, content: parsed },
      create: {
        phase: "Preparation",
        stepName: "Key Sections",
        input: text,
        output,
        content: parsed,
        approved: false,
      },
    });

    /* ------------- respond ------------------ */
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("key-sections route error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
