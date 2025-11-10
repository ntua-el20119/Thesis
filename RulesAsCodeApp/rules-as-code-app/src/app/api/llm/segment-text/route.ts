import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// -----------------------------------------------------------------------------
// Type: SegmentTextBody
// -----------------------------------------------------------------------------
// Defines the expected shape of the request body received by this route.
// Fields:
//   - text: Raw legal text that will be segmented by the LLM.
//   - projectId: Numeric identifier linking the segmentation to a specific project.
//
interface SegmentTextBody {
  text: string;
  projectId: number;
}

/**
 * POST /api/llm/segment-text
 * -----------------------------------------------------------------------------
 * Purpose:
 *   - Segment legal text into logical sections (rules, clauses, paragraphs)
 *     using an external LLM API.
 *   - Serve as the first stage of the "Preparation" phase in the Rules-as-Code
 *     methodology.
 *   - Persist results in the database via Prisma for later use by subsequent
 *     steps (e.g., normalization, categorization).
 *
 * Workflow:
 *   1. Validate request parameters and environment configuration.
 *   2. Construct a precise prompt instructing the LLM to segment text.
 *   3. Submit a chat completion request via the OpenRouter API.
 *   4. Parse and validate JSON response from the model.
 *   5. Store results using Prisma’s upsert pattern for idempotency.
 *   6. Return the structured segmentation result to the client.
 *
 * Input:
 *   - JSON body containing { text, projectId }
 *
 * Output:
 *   - 200: Structured JSON result of segmented sections.
 *   - 400: Invalid/missing projectId.
 *   - 500: Internal errors or malformed LLM response.
 */
export async function POST(request: NextRequest) {
  // ---------------------------------------------------------------------------
  // 1. Parse and validate request payload
  // ---------------------------------------------------------------------------
  const body: SegmentTextBody = await request.json();
  const { text, projectId } = body;

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json(
      { error: "Missing or invalid projectId" },
      { status: 400 }
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Validate OpenRouter API key configuration
  // ---------------------------------------------------------------------------
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "Server configuration error: Missing OPENROUTER_API_KEY" },
      { status: 500 }
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Construct LLM prompt
  // ---------------------------------------------------------------------------
  // The prompt defines:
  //   - How to segment the text (by structure, headings, numbering, etc.).
  //   - Expected schema for each section (id, title, content, referenceId).
  //   - JSON-only output requirement to support deterministic parsing.
  //   - An example for the model to mimic expected behavior.
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
    // -------------------------------------------------------------------------
    // 4. Execute API call to external LLM
    // -------------------------------------------------------------------------
    // Model: Meta Llama 3.3 8B Instruct (free tier)
    // Configuration:
    //   - max_tokens: ensures large outputs are captured.
    //   - temperature: 0.3 for stability (minimize randomness).
    //   - Referer/X-Title headers identify the application context to OpenRouter.
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
          model: "meta-llama/llama-3.3-8b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 10000,
          temperature: 0.3,
        }),
      }
    );

    // -------------------------------------------------------------------------
    // 5. Handle non-200 responses from OpenRouter
    // -------------------------------------------------------------------------
    // Logs and forwards the error, preserving upstream context and status.
    if (!response.ok) {
      const errorData = await response.json();
      console.error("LLM API error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Failed to process text with LLM" },
        { status: response.status }
      );
    }

    // -------------------------------------------------------------------------
    // 6. Parse LLM response
    // -------------------------------------------------------------------------
    // Extract the message content containing JSON-formatted segmentation data.
    const data = await response.json();
    const rawText = data.choices[0].message.content;

    // Attempt strict JSON parsing; invalid responses trigger 500 for debugging.
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

    // -------------------------------------------------------------------------
    // 7. Persist segmentation result
    // -------------------------------------------------------------------------
    // Uses Prisma’s `upsert` to achieve idempotent writes:
    //   - If this step exists for the given project, update it.
    //   - Otherwise, create a new record.
    // Stores the raw `content` JSON to preserve structure for later steps.
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

    // -------------------------------------------------------------------------
    // 8. Send structured response to client
    // -------------------------------------------------------------------------
    // Returns LLM-structured JSON as-is for rendering in the UI.
    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    // -------------------------------------------------------------------------
    // 9. Catch-all error handling
    // -------------------------------------------------------------------------
    // Captures network, Prisma, or runtime errors with consistent reporting.
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("Segment-text route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
