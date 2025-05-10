// src/app/api/llm/normalize-terminology/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not set" }, { status: 500 });
  }

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
  [EXAMPLE NORMALIZATION] Original segment: "The operator must monitor all discharges quarterly. Emission monitoring results must be reported..."

  Normalized segment: "The operator must monitor all emissions quarterly. Emission monitoring results must be reported..."

  Normalization recorded: {"original": "discharges", "normalized": "emissions", "occurrences": 1}
  
  [EXPECTED OUTPUT FORMAT] Your response must strictly follow this JSON format: { "result": { "sections": [ { "id": "[section id from input]", "title": "[section title]", "content": "[section content with normalized terminology]", "referenceId": "[reference identifier if present in input]", "normalizations": [ { "original": "[original term]", "normalized": "[standardized term]", "occurrences": [number of replacements in this section] } // Additional normalizations... ] } // Additional sections... ], "terminologyMap": { "[original term 1]": "[normalized term 1]", "[original term 2]": "[normalized term 2]" // Additional mappings... }, "normalizationStrategy": "[brief explanation of your approach to terminology standardization]" }, "confidence": [score between 0 and 1], "normalizationSummary": "[summary of key normalizations performed and their impact on regulatory interpretation]" }

  [SUCCESS CRITERIA] Your response will be evaluated based on:

  Identification of all terminology variations that impact rule interpretation
  Consistent application of the normalized terms throughout the document
  Proper handling of technical terms and abbreviations
  Appropriate confidence score that reflects the quality of normalization
  Your confidence score should be below 0.5 if you identify zero normalizations

  IMPORTANT: Keep all sections from the input intact, changing only terminology where needed for consistency. 
  The terminologyMap must contain ALL normalizations performed. 
  If you find no terminology to normalize after thorough examination, your confidence score should reflect this limitation.

  Only include the JSON response without any additional text or explanations.

  This is the sections that you have to normalise: ${text}
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to process request" },
        { status: response.status }
      );
    }
  
    const data = await response.json();
    const rawText = data.choices[0].message.content;
  
    console.log("Raw LLM response:", rawText);
  
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      console.warn("Response is not valid JSON:", rawText);
      return NextResponse.json(
        { error: "Invalid response format from LLM" },
        { status: 500 }
      );
    }
  
    return NextResponse.json(parsed);
  } catch (error) {
    console.error(
      "Error processing request:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
  