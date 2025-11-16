// app/api/methodology/key-sections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

interface KeySectionsBody {
  text: string;
  projectId: number;
}

export async function POST(req: NextRequest) {
  const { text, projectId }: KeySectionsBody = await req.json();

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json(
      { error: "Missing or invalid projectId" },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "Server configuration error: Missing OPENROUTER_API_KEY" },
      { status: 500 }
    );
  }

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
    const { parsed } = await callOpenRouterJson({
      prompt,
      // model omitted → uses process.env.LLM_MODEL (same as Normalize Terminology)
      maxTokens: 4096,
      temperature: 0.3,
    });

    console.log("Parsed key-sections response:", parsed);

    const output = JSON.stringify(parsed, null, 2);

    await prisma.methodologyStep.upsert({
      where: {
        projectId_phase_stepName: {
          projectId,
          phase: "Preparation",
          stepName: "Key Sections",
        },
      },
      update: { input: text, output, content: parsed },
      create: {
        projectId,
        phase: "Preparation",
        stepName: "Key Sections",
        input: text,
        output,
        content: parsed,
        approved: false,
      },
    });

    return NextResponse.json(parsed, { status: 200 });
  } catch (err: any) {
    if (err instanceof LlmApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.error("key-sections route error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
