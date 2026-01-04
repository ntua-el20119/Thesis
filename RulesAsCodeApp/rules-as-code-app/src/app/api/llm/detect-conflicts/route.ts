import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

interface DetectConflictsBody {
  text: string; // This will actually be the stringified JSON of the previous step's rules
  projectId: number;
}

const PHASE = 1;
const STEP_NUMBER = 3;
const STEP_NAME = "Detect Conflicts";

export async function POST(req: NextRequest) {
  const { text, projectId }: DetectConflictsBody = await req.json();

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  const prompt = `
# Prompt: Step 3 - Detect Conflicts

## Your Task
Analyze the following set of extracted legal rules and identify logical contradictions, ambiguities, or gaps.

## Instructions
1. **Compare** every rule against every other rule.
2. **Identify Contradictions**: Where two rules prescribe opposite behaviors for the same condition.
3. **Identify Ambiguities**: Where terms are used inconsistently.
4. **Identify Gaps**: Where a condition is mentioned but not defined/handled.

## Input Rules
${text}

## Required Output Format
Respond with valid JSON:
{
  "result": {
    "conflicts": [
      {
        "id": "conflict-1",
        "ruleIds": ["rule-1", "rule-5"],
        "type": "CONTRADICTION",
        "description": "Rule 1 requires form A, but Rule 5 explicitly forbids form A for this category.",
        "severity": "HIGH"
      }
    ],
    "analysisSummary": "..."
  },
  "confidence": 0.9
}
`;

  try {
    const { parsed } = await callOpenRouterJson({
      prompt,
      maxTokens: 5000,
      temperature: 0.2,
    });

    await prisma.methodologyStep.upsert({
      where: {
        projectId_phase_stepNumber: {
          projectId,
          phase: PHASE,
          stepNumber: STEP_NUMBER,
        },
      },
      update: {
        stepName: STEP_NAME,
        input: { text },
        llmOutput: parsed,
        // llmOutput set above
        confidenceScore: parsed.confidence,
        schemaValid: true,
        humanModified: false,
      },
      create: {
        projectId,
        phase: PHASE,
        stepNumber: STEP_NUMBER,
        stepName: STEP_NAME,
        input: { text },
        llmOutput: parsed,
        // llmOutput set above
        confidenceScore: parsed.confidence,
        schemaValid: true,
        approved: false,
        humanModified: false,
      },
    });

    return NextResponse.json(parsed);
  } catch (err: any) {
    if (err instanceof LlmApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
