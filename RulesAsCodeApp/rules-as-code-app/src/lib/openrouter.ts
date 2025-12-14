// src/lib/openrouter.ts

/**
 * Common OpenRouter JSON call + cleaning for RaC steps.
 *
 * Responsibilities:
 *  - Validate OPENROUTER_API_KEY and model.
 *  - Call OpenRouter chat completions endpoint.
 *  - Extract `choices[0].message.content`.
 *  - Clean markdown fences and repair common JSON issues.
 *  - Return both raw text and parsed JSON.
 *  - Throw typed error when upstream (OpenRouter) fails.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export class LlmApiError extends Error {
  status: number;
  payload: any;

  constructor(message: string, status: number, payload: any) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export interface CallOpenRouterJsonOptions {
  prompt: string;
  model?: string; // if omitted, falls back to process.env.LLM_MODEL
  maxTokens?: number;
  temperature?: number;
}

export interface CallOpenRouterJsonResult {
  rawText: string;
  parsed: any;
}

export async function callOpenRouterJson(
  opts: CallOpenRouterJsonOptions
): Promise<CallOpenRouterJsonResult> {
  const { prompt, maxTokens = 10000, temperature = 0.3 } = opts;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  const model = opts.model || process.env.LLM_MODEL;
  if (!model) {
    throw new Error(
      "No LLM model configured: set LLM_MODEL in env or pass opts.model"
    );
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // Optional, but nice to keep for all calls
  const referer = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const title =
    process.env.NEXT_PUBLIC_SITE_NAME || "Rules as Code Text Wizard";

  headers["HTTP-Referer"] = referer;
  headers["X-Title"] = title;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("LLM API error:", errorData);
    throw new LlmApiError(
      errorData.error || "Failed to process request with LLM",
      response.status,
      errorData
    );
  }

  const data = await response.json();
  const rawText: string = data.choices?.[0]?.message?.content?.trim() || "";
  console.log("LLM response:", rawText);

  let parsed: any;

  try {
    // Step 1: strip fences and parse
    const cleaned = rawText
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();

    parsed = JSON.parse(cleaned);
  } catch {
    try {
      // Step 2: repair newlines inside JSON string values and parse again
      const repaired = rawText
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .replace(/"(?:[^"\\]|\\.)*?"/gs, (m) => m.replace(/\n/g, "\\n"))
        .trim();

      parsed = JSON.parse(repaired);
    } catch {
      console.warn(
        "Response is not valid JSON even after repair:",
        rawText.slice(0, 1000) // avoid logging huge blobs
      );
      throw new Error("Invalid response format from LLM");
    }
  }

  return { rawText, parsed };
}
