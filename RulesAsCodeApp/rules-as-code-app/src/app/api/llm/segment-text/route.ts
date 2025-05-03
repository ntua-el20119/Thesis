// src/app/api/llm/segment-text/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { text } = await request.json();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set in environment variables");
    return NextResponse.json({ error: "OPENROUTER_API_KEY is not set" }, { status: 500 });
  }

  const prompt = `
    You are processing legal text as part of a Rules as Code implementation methodology. Your task is to divide the legal text into logical sections.

    [SYSTEM INSTRUCTIONS]
    - Identify natural divisions in the text based on headings, numbering, and topic shifts.
    - Create a unique ID for each section (e.g., "sec-1", "sec-2").
    - Provide a descriptive title for each section that reflects its content.
    - Ensure the entire text is segmented with no content lost.
    - Return the result as a JSON array of objects, where each object has 'id', 'title', and 'content' fields.

    Text to segment: 
    
    ${text}
  `;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`, // Use the environment variable
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", // Dynamic or default
        "X-Title": process.env.NEXT_PUBLIC_SITE_NAME || "Rules as Code Text Wizard", // Dynamic or default
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v3-base:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096, // Limit response length
        temperature: 0.3, // Control randomness for structured output
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData.error);
      return NextResponse.json({ error: errorData.error || "Failed to process request" }, { status: response.status });
    }

    const data = await response.json();
    let sections = data.choices[0].message.content;

    // Attempt to parse the response as JSON if the model followed the instruction
    try {
      sections = JSON.parse(sections);
    } catch (parseError) {
      console.warn("Response is not valid JSON, returning as text:", sections);
    }

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Error processing request:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}