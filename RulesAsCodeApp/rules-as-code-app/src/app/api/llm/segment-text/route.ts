// app/api/llm/segment-text/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

// -----------------------------------------------------------------------------
// Type: SegmentTextBody
// -----------------------------------------------------------------------------
interface SegmentTextBody {
  text: string;
  projectId: number;
}

export async function POST(request: NextRequest) {
  const body: SegmentTextBody = await request.json();
  const { text, projectId } = body;

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json(
      { error: "Missing or invalid projectId" },
      { status: 400 }
    );
  }

  // Prompt unchanged
  const prompt = `
    You are processing legal text as part of a Rules as Code implementation methodology. Your task is to divide the legal text into logical sections.

    [SYSTEM INSTRUCTIONS]
    - Identify natural divisions in the text based on headings, numbering, and topic shifts.
    - Create a unique ID for each section (e.g., "sec-1", "sec-2").
    - Provide a descriptive title for each section that reflects its content.
    - Ensure the entire text is segmented with no content lost.

    [EXPECTED OUTPUT FORMAT] Your response must strictly follow this JSON format: 
    { "result": { "sections": [ { "id": "[unique section identifier]", "title": "[clear section title]", "content": "[full section text]", "referenceId": "[optional reference to section numbering in original document]" } ] }, "confidence": [score between 0 and 1] }

    Dont include any other text or explanations outside of this JSON format.

    IMPORTANT: Your response MUST include all content from the original document divided into appropriate sections. The confidence score should reflect your certainty in the segmentation quality. 

    [EXAMPLE]
    For input: "Section 1: Rule A. Section 2: Rule B."
    Output: {"result": {"sections": [{"id": "sec-1", "title": "Rule A", "content": "Rule A.", "referenceId": "Section 1"}, {"id": "sec-2", "title": "Rule B", "content": "Rule B.", "referenceId": "Section 2"}]}, "confidence": 0.95}

    Text to segment: ${text}
  `;

  try {
    // 🔹 Single call handling fetch + cleaning
    const { parsed } = await callOpenRouterJson({
      prompt,
      maxTokens: 10000,
      temperature: 0.3,
    });

    await prisma.methodologyStep.upsert({
      where: {
        projectId_phase_stepName: {
          projectId,
          phase: "Preparation",
          stepName: "Segment Text",
        },
      },
      update: {
        input: text,
        content: parsed,
        updatedAt: new Date(),
      },
      create: {
        projectId,
        phase: "Preparation",
        stepName: "Segment Text",
        input: text,
        content: parsed,
        approved: false,
      },
    });

    return NextResponse.json(parsed, { status: 200 });
  } catch (error: any) {
    if (error instanceof LlmApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("Segment-text route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
