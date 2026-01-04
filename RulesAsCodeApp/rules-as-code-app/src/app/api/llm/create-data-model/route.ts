import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

interface CreateDataModelBody {
  entities?: string;
  conflicts?: string;
  projectId: number;
}

const PHASE = 2;
const STEP_NUMBER = 4;
const STEP_NAME = "Create Data Model";

export async function POST(req: NextRequest) {
  const { entities, conflicts, projectId }: CreateDataModelBody = await req.json();

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  // Combine inputs
  const combinedText = `
### Extracted Entities (Step 2)
${entities || "No entities provided."}

### Detected Conflicts (Step 3)
${conflicts || "No conflicts provided."}
`;

  const prompt = `
# Prompt: Step 4 - Create Data Model

## Your Task

Transform extracted entities into formal data structures with properties, types, validations, and relationships. Incorporate conflict resolutions from Step 3.

## Instructions

For each entity:

1. **Define structure**:
   - Choose data type (object, string, number, date, boolean, array)
   - List all properties with types
   - Mark required vs optional
   - Add validation rules
   - Add description and sourceSection

2. **Model relationships**:
   - One-to-one, one-to-many, many-to-many
   - Specify target entities
   - Describe relationship purpose

3. **Create enumerations** for categorical values

4. **Resolve conflicts** from Step 3 through design

## Input

Entities from Step 2 and Conflicts from Step 3:

${combinedText}

## Required Output Format

\`\`\`json
{
  "result": {
    "entities": [
      {
        "name": "EntityName",
        "type": "original_type",
        "dataType": "object",
        "properties": {
          "propertyName": {
            "type": "string|number|date|boolean|array",
            "required": true|false,
            "validation": "Validation rule description",
            "description": "Property description"
          }
        },
        "relationships": [
          {
            "targetEntity": "OtherEntity",
            "type": "one-to-one|one-to-many|many-to-many",
            "description": "Relationship description"
          }
        ],
        "sourceEntity": "OriginalEntityName"
      }
    ],
    "enumerations": [
      {
        "name": "EnumName",
        "values": ["value1", "value2", "value3"],
        "description": "Purpose of this enumeration"
      }
    ],
    "conflictResolutions": [
      {
        "conflictId": "conflict-1",
        "resolution": "How conflict was resolved in design",
        "impact": "Impact on implementation"
      }
    ]
  },
  "confidence": 0.85
}
\`\`\`

## Data Types

- **string**: Text, IDs, codes
- **number**: Integers, decimals, amounts
- **date**: Dates, timestamps
- **boolean**: True/false flags
- **object**: Complex nested structures
- **array**: Lists, collections

## Validation Rules

- Format: "UUID format", "Email format"
- Range: "0-100", "Positive number"
- Constraints: "Not null", "Unique"
- References: "Must exist in X", "From enum Y"

## Success Criteria

Your output will be evaluated on: all entities having formal definitions, properties with appropriate types, validation rules being testable, relationships properly specified, and conflicts addressed in design.

## Important Notes

- Use standard data types only
- Make validations specific and testable
- Document how conflicts were resolved
- Ensure model is implementation-ready
- Set confidence below 0.8 if model incomplete

Now create the data model from the provided inputs.
`;

  // Use combinedText as the "input" record for the DB to preserve context
  const text = combinedText; 

  try {
    const { parsed } = await callOpenRouterJson({
      prompt,
      maxTokens: 50000,
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
