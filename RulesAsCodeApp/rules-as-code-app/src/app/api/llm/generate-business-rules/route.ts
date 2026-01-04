import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

interface GenBusinessRulesBody {
  text: string; // Rules + Data Model
  projectId: number;
}

const PHASE = 2;
const STEP_NUMBER = 5;
const STEP_NAME = "Generate Business Rules";

export async function POST(req: NextRequest) {
  const { text, projectId }: GenBusinessRulesBody = await req.json();

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  const prompt = `
# Prompt: Step 5 - Generate Business Rules

## Your Task
Convert the extracted legal rules and the designed data model into formal implementation logic (Pseudo-code or Decision Tables).

## Instructions
1. **Map Rules to Data**: Show how each legal rule checks the definition attributes from Step 4.
2. **Logic Flow**: Write pseudo-code (IF/THEN/ELSE) for each major decision.
3. **Decision Table**: Create a tabular representation for complex conditional logic.

## Input Context
${text}

## Required Output Format
Respond with valid JSON:
{
  "result": {
    "pseudoCode": [
      {
        "name": "Check Application Validity",
        "code": "IF Applicant.age >= 18 AND Application.isComplete THEN RETURN TRUE ELSE RETURN FALSE"
      }
    ],
    "decisionTables": [
      {
         "name": "Eligibility Matrix",
         "rows": [
            { "condition": "Age < 18", "result": "Reject" },
            { "condition": "Age >= 18", "result": "Approve" }
         ]
      }
    ]
  },
  "confidence": 0.95
}
`;

  try {
    const { parsed } = await callOpenRouterJson({
      prompt,
      maxTokens: 5000,
      temperature: 0.1, 
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
