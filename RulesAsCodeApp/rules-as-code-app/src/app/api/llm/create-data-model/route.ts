import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

interface CreateDataModelBody {
  text: string; // Rules + Segments
  projectId: number;
}

const PHASE = 2;
const STEP_NUMBER = 4;
const STEP_NAME = "Create Data Model";

export async function POST(req: NextRequest) {
  const { text, projectId }: CreateDataModelBody = await req.json();

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  const prompt = `
# Prompt: Step 4 - Create Data Model

## Your Task
Based on the provided legal rules, design a data model (Entities, Attributes, Relationships) that can support the enforcement of these rules.

## Instructions
1. **Identify Entities**: Nouns representing actors, objects, or documents (e.g., Applicant, Application, License).
2. **Identify Attributes**: Properties required to evaluate the rules (e.g., age, submissionDate, isValid).
3. **Identify Relationships**: Associations between entities (e.g., Applicant *submits* Application).
4. **Generate Mermaid Diagram**: Provide a text-based class diagram in Mermaid syntax.

## Input Rules
${text}

## Required Output Format
Respond with valid JSON:
{
  "result": {
    "entities": [
      {
        "name": "Applicant",
        "description": "The person or org applying.",
        "attributes": [
           { "name": "age", "type": "Integer", "description": "Age in years" }
        ]
      }
    ],
    "mermaidDiagram": "classDiagram\\n    class Applicant {\\n      +int age\\n    }..."
  },
  "confidence": 0.95
}
`;

  try {
    const { parsed } = await callOpenRouterJson({
      prompt,
      maxTokens: 5000,
      temperature: 0.1, // Very low temp for structural schema tasks
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
