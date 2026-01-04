// app/api/llm/segment-text/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

interface SegmentTextBody {
  text: string;
  projectId: number;
}

/**
 * Step Identity (new simplified 5-step methodology)
 * Step 1: Segment Text
 * - phase: 1
 * - stepNumber: 1
 * - stepName: "Segment Text"
 */
const PHASE = 1;
const STEP_NUMBER = 1;
const STEP_NAME = "Segment Text";

function isValidSegmentationPayload(parsed: any): {
  ok: boolean;
  confidence: number | null;
} {
  // Expected: { result: { sections: [...] }, confidence: number }
  const confidenceRaw = parsed?.confidence;
  const confidence =
    typeof confidenceRaw === "number" &&
    Number.isFinite(confidenceRaw) &&
    confidenceRaw >= 0 &&
    confidenceRaw <= 1
      ? confidenceRaw
      : null;

  const sections = parsed?.result?.sections;
  const ok =
    parsed &&
    typeof parsed === "object" &&
    parsed.result &&
    typeof parsed.result === "object" &&
    Array.isArray(sections) &&
    sections.length >= 0 &&
    // Each section should minimally have id/title/content
    sections.every(
      (s: any) =>
        s &&
        typeof s === "object" &&
        typeof s.id === "string" &&
        typeof s.title === "string" &&
        typeof s.content === "string"
      // referenceId is optional per prompt
    );

  return { ok, confidence };
}

export async function POST(request: NextRequest) {
  let body: SegmentTextBody;

  try {
    body = (await request.json()) as SegmentTextBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, projectId } = body;

  if (!projectId || typeof projectId !== "number" || Number.isNaN(projectId)) {
    return NextResponse.json(
      { error: "Missing or invalid projectId" },
      { status: 400 }
    );
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or empty text" },
      { status: 400 }
    );
  }

  // Updated prompt (exact structure you provided)
  const prompt = `
# Prompt: Step 1 - Segment Legal Text

## Your Task

You are processing legal text as part of a Rules as Code methodology. Your task is to divide the legal document into logical sections while preserving all content.

## Instructions

1. **Identify natural divisions** in the text based on:
   - Explicit numbering (Article 1, Section 2.1, etc.)
   - Headings and topic shifts
   - Document structure (definitions, provisions, annexes)

2. **Create sections** that:
   - Are neither too large nor too small
   - Keep related content together
   - Preserve all original text
   - Maintain cross-references

3. **Assign unique IDs** using format: sec-1, sec-2, sec-3, etc.

4. **Extract or create titles** that clearly describe each section's content

## Input

Legal text will be provided between the markers below:

---START LEGAL TEXT---
${text}
---END LEGAL TEXT---

## Required Output Format

Respond with ONLY valid JSON in this exact structure:

{
  "result": {
    "sections": [
      {
        "id": "sec-1",
        "title": "Clear section title",
        "content": "Complete section text...",
        "referenceId": "Article 3"
      }
    ]
  },
  "confidence": 0.95
}

## Field Requirements

- **id**: Unique identifier (sec-1, sec-2, etc.)
- **title**: 3-10 word descriptive title
- **content**: Complete text with all formatting preserved
- **referenceId**: Original document reference (Article X, Section Y, etc.)
- **confidence**: Number between 0 and 1

Now process the legal text provided above.
  `;

  try {
    const { parsed } = await callOpenRouterJson({
      prompt,
      maxTokens: 10000,
      temperature: 0.3,
    });


    const { ok: schemaValid, confidence } = isValidSegmentationPayload(parsed);

    // Persist according to new DB schema:
    // - unique: (projectId, phase, stepNumber)
    // - input: JSON
    // - llmOutput: JSON
    // - confidenceScore: Decimal? (Prisma accepts number; it will coerce)
    await prisma.methodologyStep.upsert({
      where: {
        projectId_phase_stepNumber: {
          projectId,
          phase: PHASE,
          stepNumber: STEP_NUMBER,
        },
      },
      update: {
        stepName: STEP_NAME, // keep name consistent (safe even if already same)
        input: { text }, // JSON
        llmOutput: parsed, // JSON
        confidenceScore: confidence, // number|null -> Decimal? OK
        schemaValid,
        // This is an LLM run, not a human edit:
        humanModified: false,
        // Do NOT set approved here; approval happens in /api/approve
      },
      create: {
        projectId,
        phase: PHASE,
        stepNumber: STEP_NUMBER,
        stepName: STEP_NAME,
        input: { text },
        llmOutput: parsed,
        confidenceScore: confidence,
        schemaValid,
        approved: false,
        humanModified: false,
        // humanOutput remains null on create
      },
    });

    const responsePayload = JSON.parse(JSON.stringify(parsed));
    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error: any) {
    if (error instanceof LlmApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("segment-text route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

