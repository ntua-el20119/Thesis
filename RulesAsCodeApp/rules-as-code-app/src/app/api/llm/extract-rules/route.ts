import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

interface ExtractRulesBody {
  text: string;
  projectId: number;
}

const PHASE = 1;
const STEP_NUMBER = 2;
const STEP_NAME = "Extract Rules";

export async function POST(req: NextRequest) {
  const { text, projectId }: ExtractRulesBody = await req.json();

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  // Prompt focused on atomic rule extraction
  const prompt = `
# Prompt: Step 2 - Extract Rules

## Your Task

Extract domain entities and formalize conditional logic into IF-THEN rules from segmented legal text.

## Instructions

### Part 1: Identify Entities

For each significant entity mentioned in the text:

**Entity Types:**
- Person: individuals, applicants, students, beneficiaries
- Organization: institutions, authorities, companies
- Amount: monetary values, thresholds, limits
- Date: deadlines, time periods, durations
- Concept: statuses, categories, abstract legal concepts
- Document: forms, certificates, records

**Capture:**
- Clear, consistent name
- Appropriate type
- Precise description
- Source section reference

### Part 2: Formalize Rules

Transform legal provisions into IF-THEN structure:

\`\`\`
IF [condition(s)]
THEN [action/outcome]
\`\`\`

**Guidelines:**
- Conditions must be testable
- Actions must be specific
- Include source text for traceability
- Use clear, unambiguous language

## Input

${text}

## Required Output Format

\`\`\`json
{
  "result": {
    "entities": [
      {
        "name": "EntityName",
        "type": "person|organization|amount|date|concept|document",
        "description": "Clear description of what this entity represents",
        "sourceSection": "sec-1"
      }
    ],
    "rules": [
      {
        "id": "rule-1",
        "condition": "IF clear, testable condition",
        "action": "THEN specific, implementable action",
        "sourceSection": "sec-2",
        "sourceText": "Original legal text from which rule was derived"
      }
    ]
  },
  "confidence": 0.85
}
\`\`\`

## Success Criteria

Your output will be evaluated on entity completeness (all significant entities identified), entity clarity (names consistent, descriptions precise), rule implementability (conditions testable, actions executable), and traceability (every element links to source).

## Important Notes

- Extract all entities, even if they seem obvious
- Make rules as specific as possible
- Use entity.property notation in rules
- Include original text for every rule
- Set confidence below 0.8 if extraction is incomplete

Now process the segmented text provided above.
`;

  try {
    const { parsed } = await callOpenRouterJson({
      prompt,
      maxTokens: 5000,
      temperature: 0.2, // Low temp for precision
    });

    // Upsert to DB
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
        // llmOutput already set above
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
        // llmOutput already set above
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
