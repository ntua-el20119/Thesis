import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Type definition for the request body
interface SegmentTextBody {
  text: string;
  projectId: number;
}

/**
 * POST Handler for Segment Text
 * Processes legal text by segmenting it into logical sections using an external LLM API
 * and stores the result in the database using Prisma's upsert.
 * @param request - The incoming Next.js request containing text and projectId
 * @returns JSON response with segmented text or error details
 */
export async function POST(request: NextRequest) {
  // Parse and validate request body
  const body: SegmentTextBody = await request.json();
  const { text, projectId } = body;

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json(
      { error: "Missing or invalid projectId" },
      { status: 400 }
    );
  }

  // Validate API key configuration
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "Server configuration error: Missing OPENROUTER_API_KEY" },
      { status: 500 }
    );
  }

  // Construct prompt for LLM to segment legal text
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
    // Call external LLM API to segment the text
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

    // Handle non-200 responses from LLM API
    if (!response.ok) {
      const errorData = await response.json();
      console.error("LLM API error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Failed to process text with LLM" },
        { status: response.status }
      );
    }

    // Parse LLM response
    const data = await response.json();
    const rawText = data.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      console.warn("Invalid JSON from LLM:", rawText);
      return NextResponse.json(
        { error: "Invalid JSON format returned from LLM", err },
        { status: 500 }
      );
    }

    // Store segmented text in database using Prisma upsert
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

    // Return the segmented text
    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    // Handle unexpected errors
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("Segment-text route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
