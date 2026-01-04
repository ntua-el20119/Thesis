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

Identify contradictions, ambiguities, gaps, and implementation issues in the extracted rules and entities.

## Instructions

Analyze the entities and rules for:

1. **Contradictions**: Rules that conflict with each other
2. **Ambiguities**: Unclear or subjective terms
3. **Gaps**: Missing information needed for implementation
4. **Overlaps**: Redundant or duplicate provisions

For each issue found:
- Classify its type
- Assess severity (high/medium/low)
- Identify affected rules/entities
- Propose practical resolution

## Input

Entities and rules from Step 2:

${text}

## Required Output Format

\`\`\`json
{
  "result": {
    "conflicts": [
      {
        "id": "conflict-1",
        "type": "contradiction|ambiguity|gap|overlap",
        "description": "Clear description of the issue",
        "severity": "high|medium|low",
        "affectedRules": ["rule-1", "rule-3"],
        "affectedEntities": ["EntityName"],
        "sourceText": "Relevant text showing the conflict",
        "resolutionStrategy": "Specific, actionable resolution approach"
      }
    ]
  },
  "confidence": 0.80
}
\`\`\`

## Conflict Types

**Contradiction**: Rules with conflicting requirements (Rule-1: IF income < 20000 THEN eligible = true; Rule-2: IF income < 25000 THEN eligible = false)

**Ambiguity**: Undefined or subjective terms ("reasonable time period", "appropriate documentation", "qualifying institution")

**Gap**: Missing necessary information (rule references "RegistrationDate" but no such entity exists; rule requires calculation but no formula provided)

**Overlap**: Redundant provisions (two rules specify identical conditions and actions)

## Severity Assessment

**High**: Blocks implementation entirely
**Medium**: Creates significant ambiguity
**Low**: Minor clarification needed

## Resolution Strategies

**Parameterization**: Make configurable ("Create parameter 'review_period' (default: 30 days)")

**Clarification**: Request expert input ("Requires legal clarification on threshold precedence")

**Standard**: Apply standard definition ("Use ISO definition for 'business day'")

**Human Review**: Flag for case-by-case ("Implement as human decision point with criteria")

## Success Criteria

Your output will be evaluated on identifying all significant conflicts, correctly assigning types, appropriately assessing severity, and providing specific, actionable resolutions.

## Important Notes

- Avoid false positives (valid alternatives are not contradictions)
- Check cross-section issues, not just within sections
- Provide concrete resolutions, not vague suggestions
- Consider legal context before flagging
- Set confidence below 0.8 if analysis incomplete

Now analyze the entities and rules provided above.
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
