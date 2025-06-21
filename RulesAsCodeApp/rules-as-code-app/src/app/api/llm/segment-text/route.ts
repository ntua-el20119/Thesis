import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { text, projectId } = await request.json();

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
      { error: "OPENROUTER_API_KEY is not set" },
      { status: 500 }
    );
  }

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
    const response = await fetch(
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
          max_tokens: 10000,
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "LLM request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawText = data.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.warn("Invalid LLM JSON:", rawText);
      return NextResponse.json(
        { error: "Invalid JSON format from LLM" },
        { status: 500 }
      );
    }

    // ✅ Upsert with projectId + phase + stepName as composite key
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

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Segment-text route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
