import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Type definition for the request body
interface NormalizeTerminologyBody {
  text: string;
  projectId: number;
}

/**
 * POST Handler for Normalize Terminology
 * Normalizes terminology in legal text using an external LLM API and stores the result
 * in the database using Prisma's upsert.
 * @param request - The incoming Next.js request containing text and projectId
 * @returns JSON response with normalized terminology or error details
 */
export async function POST(request: NextRequest) {
  // Parse and validate request body
  const body: NormalizeTerminologyBody = await request.json();
  const { text, projectId } = body;

  // Validate API key configuration
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set in environment variables");
    return NextResponse.json(
      { error: "Server configuration error: Missing OPENROUTER_API_KEY" },
      { status: 500 }
    );
  }

  // Validate projectId
  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json(
      { error: "Missing or invalid projectId" },
      { status: 400 }
    );
  }

  // Construct prompt for LLM to normalize terminology
  const prompt = `
    You are normalizing terminology in legal text as part of a Rules as Code implementation methodology. Your task is to standardize terms throughout the document for consistency.

    [SYSTEM INSTRUCTIONS]
    Identify all terms that have variations or synonyms across different sections
    Create a consistent terminology map that standardizes these variations
    Update the text to use the standardized terminology consistently
    Record each normalization (original term → normalized term)
    Prioritize terminology normalization in the following order:
    Technical regulatory terms (e.g., "emissions", "installation", "authority")
    Abbreviations and their full forms (e.g., BAT vs. "best available techniques")
    Grammatical variations (singular/plural forms) ONLY when they affect clarity
    DO NOT change the meaning of the text
    If you identify no terminology variations to normalize, explain your reasoning and re-examine the text
    Your confidence score should directly reflect the comprehensiveness of your normalization effort

    [NORMALIZATION GUIDELINES]
    Regulatory terms should use consistent forms throughout the document
    Abbreviations should be introduced properly (full term followed by abbreviation in parentheses) and then used consistently
    Terms with the same meaning should use identical wording
    Technical legal terms should maintain singular or plural form consistently
    When terms are used in different contexts, evaluate whether they should be treated as distinct terms

    [EXAMPLE NORMALIZATION]
    Original segment: "The operator must monitor all discharges quarterly. Emission monitoring results must be reported..."
    Normalized segment: "The operator must monitor all emissions quarterly. Emission monitoring results must be reported..."
    Normalization recorded: {"original": "discharges", "normalized": "emissions", "occurrences": 1}

    [EXPECTED OUTPUT FORMAT] Your response must strictly follow this JSON format: 
    { "result": 
      { "sections": [ 
        { "id": "[section id from input]", 
          "title": "[section title]", 
          "content": "[section content with normalized terminology]",
          "referenceId": "[reference identifier if present in input]", 
          "normalizations": [ { "original": "[original term]", "normalized": "[standardized term]", 
          "occurrences": [number of replacements in this section] } 
          // Additional normalizations... ] } 
          // // Additional sections... ],
        } 
        "terminologyMap": { 
        "[original term 1]": "[normalized term 1]", 
        "[original term 2]": "[normalized term 2]" 
        },
        "normalizationStrategy": "[brief explanation of your approach to terminology standardization]" 
      }, 
      "confidence": [score between 0 and 1], 
      "normalizationSummary": "[summary of key normalizations performed and their impact on regulatory interpretation]" 
    }

    [SUCCESS CRITERIA]
    Your response will be evaluated based on:
    - Identification of all terminology variations that impact rule interpretation
    - Consistent application of the normalized terms throughout the document
    - Proper handling of technical terms and abbreviations
    - Appropriate confidence score that reflects the quality of normalization

    Only include the JSON response without any additional text or explanations.
    Every newline that appears **inside a JSON string value** must be written as the two characters “\\n”.  
    Do NOT insert literal carriage-returns or line-feeds inside any JSON string.
    
    This is the sections that you have to normalise: ${text}
  `;

  try {
    // Call external LLM API to normalize terminology
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-small-3.1-24b-instruct:free",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
          temperature: 0.3,
        }),
      }
    );

    // Handle non-200 responses from LLM API
    if (!response.ok) {
      const errorData = await response.json();
      console.error("LLM API error:", errorData);
      return NextResponse.json(
        { error: errorData.error || "Failed to process request with LLM" },
        { status: response.status }
      );
    }

    // Parse and validate LLM response
    const data = await response.json();
    const rawText: string = data.choices?.[0]?.message?.content?.trim() || "";
    console.log("Raw LLM response:", rawText);

    let parsed: any;

    try {
      // ------------------------------------------------------------------
      // Step 1: Sanitize LLM output
      // Some models return JSON wrapped in Markdown code fences (```json ... ```),
      // or include extra whitespace. This removes such formatting before parsing.
      // ------------------------------------------------------------------
      const cleaned = rawText
        .replace(/^```(?:json)?/i, "") // Remove leading ```json or ```
        .replace(/```$/, "") // Remove trailing ```
        .trim();

      // ------------------------------------------------------------------
      // Step 2: Attempt direct JSON parse
      // ------------------------------------------------------------------
      parsed = JSON.parse(cleaned);
    } catch {
      try {
        // ------------------------------------------------------------------
        // Step 3: Attempt to repair malformed JSON
        // This replaces unescaped newlines inside quoted strings,
        // which are a common cause of JSON parsing errors.
        // ------------------------------------------------------------------
        const repaired = rawText
          .replace(/^```(?:json)?/i, "")
          .replace(/```$/, "")
          .replace(/"(?:[^"\\]|\\.)*?"/gs, (m) => m.replace(/\n/g, "\\n"))
          .trim();

        parsed = JSON.parse(repaired);
      } catch {
        // ------------------------------------------------------------------
        // Step 4: Handle irreparable JSON responses
        // If the response cannot be parsed even after repair attempts,
        // log the raw output for debugging and return a 500 error.
        // ------------------------------------------------------------------
        console.warn("Response is not valid JSON even after repair:", rawText);
        return NextResponse.json(
          { error: "Invalid response format from LLM" },
          { status: 500 }
        );
      }
    }

    console.log("Parsed LLM response:", parsed);

    // Extract and format output for storage
    const sections = parsed.result?.sections || [];
    const terminologyMap = parsed.result?.terminologyMap || {};
    const strategy = parsed.normalizationStrategy || {};
    const confidence = parsed.confidence ?? {};
    const summary = parsed.normalizationSummary || {};

    const output =
      sections
        .map((s: any) => {
          const norm =
            s.normalizations
              ?.map(
                (n: any) =>
                  `- ${n.original} → ${n.normalized} (${n.occurrences})`
              )
              .join("\n") || "None";

          return [
            `ID: ${s.id}`,
            `Title: ${s.title}`,
            `Content:\n${s.content}`,
            `Reference ID: ${s.referenceId ?? "None"}`,
            `Normalizations:\n${norm}`,
          ].join("\n");
        })
        .join("\n\n") +
      "\n\n=== Terminology Map ===\n" +
      (Object.entries(terminologyMap).length
        ? Object.entries(terminologyMap)
            .map(([o, n]) => `- ${o} → ${n}`)
            .join("\n")
        : "None") +
      "\n\n=== Strategy ===\n" +
      strategy +
      "\n\n=== Confidence ===\n" +
      confidence +
      "\n\n=== Summary ===\n" +
      summary;

    // Store normalized terminology in database using Prisma upsert
    await prisma.methodologyStep.upsert({
      where: {
        projectId_phase_stepName: {
          projectId,
          phase: "Preparation",
          stepName: "Normalize Terminology",
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
        stepName: "Normalize Terminology",
        input: text,
        output,
        content: parsed,
        approved: false,
      },
    });

    // Return the normalized terminology
    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    // Handle unexpected errors
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("Normalize-terminology route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
