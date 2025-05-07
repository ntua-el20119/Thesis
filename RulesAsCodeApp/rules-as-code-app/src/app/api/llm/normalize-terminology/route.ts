// src/app/api/llm/normalize-terminology/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not set" }, { status: 500 });
  }

  const prompt = `
    You are processing legal text as part of a Rules as Code implementation methodology. Your task is to normalize terminology in the provided text by identifying synonyms, abbreviations, or variations of terms, and standardizing them to a consistent form.

    [SYSTEM INSTRUCTIONS]
    - Identify terms that may have synonyms or variations (e.g., "installation" vs. "facility", "emission limit values" vs. "limits").
    - Choose a standard form for each term and replace all variations with the standard form.
    - Return the result **ONLY** as a JSON object in the following format:
      {
        "normalized": {
          "text": "[normalized text with standardized terms]",
          "terminologyMap": {
            "[original term]": "[standardized term]",
            ...
          }
        },
        "confidence": [score between 0 and 1]
      }
    - Do NOT include any explanatory text, the prompt, instructions, or any content outside this JSON format in your response.
    - Ensure the response is valid JSON.

    [EXAMPLE]
    For input: "The installation emits pollutants. The facility must comply with limits."
    Output: {"normalized": {"text": "The installation emits pollutants. The installation must comply with limits.", "terminologyMap": {"facility": "installation", "limits": "emission limit values"}}, "confidence": 0.92}

    Text to normalize: ${text}
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
      return NextResponse.json({ error: errorData.error || "Failed to process request" }, { status: response.status });
    }

    const data = await response.json();
    let normalized = data.choices[0].message.content;

    console.log("Raw LLM response:", normalized);

    try {
      normalized = JSON.parse(normalized);
    } catch (parseError) {
      console.warn("Response is not valid JSON, returning as text:", normalized);
      return NextResponse.json({ error: "Invalid response format from LLM" }, { status: 500 });
    }

    return NextResponse.json({ normalized });
  } catch (error) {
    console.error("Error processing request:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}