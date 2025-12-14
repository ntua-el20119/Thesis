import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

interface InconsistencyCategorisationBody {
  text: string;
  projectId: number;
}

/**
 * POST Handler for Inconsistency Categorisation
 * Categorizes inconsistencies (contradiction, ambiguity, gap, overlap),
 * assigns severity (HIGH/MEDIUM/LOW), and identifies implementation impact.
 */
export async function POST(req: NextRequest) {
  const { text, projectId }: InconsistencyCategorisationBody = await req.json();

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json(
      { error: "Missing or invalid projectId" },
      { status: 400 }
    );
  }

  // ---------------------------------------------------------------------------
  // Prompt for the Categorisation LLM
  // ---------------------------------------------------------------------------
  const prompt = `
You are categorizing inconsistencies identified in legal text as part of a Rules as Code implementation methodology. Your task is to categorize each inconsistency by type and assign a severity level.

[SYSTEM INSTRUCTIONS]

Categorize each inconsistency as one of:
Contradiction: Rules that directly conflict with each other
Ambiguity: Unclear or vague terms, conditions, or processes
Gap: Missing information required to implement the rules
Overlap: Redundant or duplicative rules or definitions

Assign a severity level (HIGH, MEDIUM, LOW) to each inconsistency based on:
HIGH: Critical issue that prevents proper implementation or changes outcomes
MEDIUM: Important issue that affects some cases but has workarounds
LOW: Minor issue that has minimal impact on implementation

Identify the affected sections for each inconsistency.

[EXPECTED OUTPUT FORMAT] (strict JSON ONLY)
{
  "result": {
    "categorizedInconsistencies": {
      "contradictions": [
        {
          "id": "[inconsistency id from input]",
          "description": "[description from input]",
          "severity": "[HIGH|MEDIUM|LOW]",
          "affectedSections": ["[section id]", "[section id]"],
          "implementationImpact": "[explanation]"
        }
      ],
      "ambiguities": [
        {
          "id": "...",
          "description": "...",
          "severity": "[HIGH|MEDIUM|LOW]",
          "affectedSections": ["sec-x"],
          "implementationImpact": "..."
        }
      ],
      "gaps": [
        {
          "id": "...",
          "description": "...",
          "severity": "[HIGH|MEDIUM|LOW]",
          "affectedSections": [],
          "implementationImpact": "..."
        }
      ],
      "overlaps": [
        {
          "id": "...",
          "description": "...",
          "severity": "[HIGH|MEDIUM|LOW]",
          "affectedSections": [],
          "implementationImpact": "..."
        }
      ]
    },
    "categorizationStrategy": "[explanation of your approach]"
  },
  "confidence": 0.42
}

[SUCCESS CRITERIA]
• All inconsistencies must be included in one of the four categories  
• Severity must reflect code-implementation impact  
• Affected sections must be identified  
• Implementation impact must be explicitly described  
• Confidence < 0.5 if classification required interpretation  

ONLY return the JSON.  
No prose, no explanation, no markdown.

Text to categorize:
${text}
`;

  try {
    // Call OpenRouter through your JSON-clean wrapper
    const { parsed } = await callOpenRouterJson({
      prompt,
      maxTokens: 4096,
      temperature: 0.2,
    });

    console.log("Parsed inconsistency-categorisation response:", parsed);

    const output = JSON.stringify(parsed, null, 2);

    // Store the categorisation in the DB
    await prisma.methodologyStep.upsert({
      where: {
        projectId_phase_stepName: {
          projectId,
          phase: "Preparation",
          stepName: "Inconsistency Categorisation",
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
        stepName: "Inconsistency Categorisation",
        input: text,
        output,
        content: parsed,
        approved: false,
      },
    });

    return NextResponse.json(parsed, { status: 200 });
  } catch (err: any) {
    if (err instanceof LlmApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("inconsistency-categorisation route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
