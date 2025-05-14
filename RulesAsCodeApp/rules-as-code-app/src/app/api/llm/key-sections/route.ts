// src/app/api/llm/key-sections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ------------------------------------------------------------------ */
/*  POST /api/llm/key-sections                                        */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  const { text } = await req.json();

  /* ------------- API-key guard ------------- */
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not set" },
      { status: 500 }
    );
  }

  /* ------------- Prompt -------------------- */
  const prompt = `
You are processing legal text to identify the most important sections for implementation as code. Analyse the provided sections and mark those that contain rules, definitions or decision procedures.

[SYSTEM INSTRUCTIONS]
• Assign an importance score (0–1) to every section.  
• Categorise each section as one of RULE, DEFINITION, PROCEDURE, CONTEXT or OTHER
  • RULE – conditional logic / constraints  
  • DEFINITION – defines entities / terms  
  • PROCEDURE – workflows / admin steps  
  • CONTEXT – background / purpose  
  • OTHER – anything else

[EXPECTED OUTPUT FORMAT] **JSON only**
{
  "result": {
    "sections": [
      {
        "id": "...",
        "title": "...",
        "content": "...",
        "importance": 0.85,
        "category": "RULE"
      }
      // every input section appears once
    ]
  },
  "confidence": 0.93
}

[IMPORTANT]
• Include *all* sections.  
• Confidence < 0.5 if you are unsure.  
• No extra prose, no markdown fences.  
• Any newline *inside a JSON string* must be written as “\\n”.

These are the sections:
${text}
`;

  try {
    /* ------------- LLM call ---------------- */
    const llm = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    /* forward OpenRouter error as-is */
    if (!llm.ok) {
      const e = await llm.json().catch(() => ({}));
      return NextResponse.json(
        { error: e.error || "LLM request failed" },
        { status: llm.status }
      );
    }

    const raw: string = (await llm.json()).choices[0].message.content.trim();
    console.log("🔵 key-sections raw:", raw);

    /* ------------- graceful JSON parse ----- */
    const tryJSON = (s: string) => {
      try {
        return JSON.parse(s);
      } catch {
        return undefined;
      }
    };

    let parsed: any = tryJSON(raw);

    if (!parsed) {
      // trim to outer braces
      const trimmed = raw.replace(/^[\s\S]*?{/, "{").replace(/}[\s\S]*$/, "}");
      parsed = tryJSON(trimmed);
    }

    if (!parsed) {
      // repair: escape bare LF inside quoted strings
      const escaped = raw.replace(
        /"(?:[^"\\]|\\.)*"/gs,
        (m) => m.replace(/\n/g, "\\n")
      );
      parsed = tryJSON(escaped);
    }

    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid JSON returned by LLM" },
        { status: 500 }
      );
    }

    /* ------------- build raw-JSON output ---- */
    const output = JSON.stringify(parsed, null, 2); // raw, pretty-printed

    /* ------------- persist ------------------ */
    await prisma.methodologyStep.upsert({
      where: {
        phase_stepName: {
          phase: "Preparation",
          stepName: "Key Sections",
        },
      },
      update: { input: text, output, content: parsed },
      create: {
        phase: "Preparation",
        stepName: "Key Sections",
        input: text,
        output,
        content: parsed,
        approved: false,
      },
    });

    /* ------------- respond ------------------ */
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("key-sections route error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
