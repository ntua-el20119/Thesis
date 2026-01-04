import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

interface GenBusinessRulesBody {
  rules: string;
  dataModel: string;
  projectId: number;
}

const PHASE = 2;
const STEP_NUMBER = 5;
const STEP_NAME = "Generate Business Rules";

export async function POST(req: NextRequest) {
  const { rules, dataModel, projectId }: GenBusinessRulesBody = await req.json();

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  const combinedText = `
### Extracted Rules (Step 2)
${rules || "(No rules available)"}

### Data Model (Step 4)
${dataModel || "(No data model available)"}
`.trim();

  const prompt = `
# Prompt: Step 5 - Generate Business Rules and Tests

## Your Task

Transform IF-THEN rules into formal, executable business rule specifications that reference the data model. Generate test scenarios for validation.

## Instructions

For each rule from Step 2:

1. **Formalize conditions**:
   - Use entity.property notation
   - Apply appropriate operators
   - Combine with logical operators (AND, OR)
   - Reference data model properties

2. **Specify actions**:
   - Property assignments
   - Status changes
   - Calculations
   - Procedures

3. **Organize rules**:
   - Assign priorities
   - Group into categories
   - Define dependencies

4. **Generate tests**:
   - Positive cases (should trigger)
   - Negative cases (should NOT trigger)
   - Edge cases (boundaries)

## Input

Data Model from Step 4 and Rules from Step 2:

${combinedText}

## Required Output Format

\`\`\`json
{
  "result": {
    "businessRules": [
      {
        "id": "br-1",
        "name": "Rule name",
        "description": "What this rule does",
        "conditions": [
          {
            "entity": "EntityName",
            "property": "propertyName",
            "operator": "equals|less_than|greater_than|contains|in",
            "value": "comparison value",
            "logicalOperator": "AND|OR"
          }
        ],
        "actions": [
          {
            "type": "set_property|calculate|notify",
            "entity": "EntityName",
            "property": "propertyName",
            "value": "new value or formula"
          }
        ],
        "priority": 100,
        "category": "CategoryName",
        "sourceRule": "rule-1"
      }
    ],
    "ruleCategories": [
      {
        "name": "CategoryName",
        "description": "Purpose of this category",
        "rules": ["br-1", "br-2"]
      }
    ],
    "dependencies": [
      {
        "ruleId": "br-2",
        "dependsOn": ["br-1"],
        "type": "prerequisite|sequence"
      }
    ],
    "testScenarios": [
      {
        "id": "test-1",
        "name": "Test scenario name",
        "type": "positive|negative|edge",
        "inputData": {
          "EntityName": {
            "property": "value"
          }
        },
        "expectedOutput": {
          "EntityName.property": "expected value"
        },
        "testedRules": ["br-1"]
      }
    ]
  },
  "confidence": 0.90
}
\`\`\`

## Operators

**Comparison**: equals, not_equals, greater_than, less_than, greater_than_or_equal, less_than_or_equal

**Collection**: in, not_in, contains, not_contains

**Existence**: is_null, is_not_null

**Logical**: AND, OR, NOT

## Test Types

**Positive**: Should trigger the rule
**Negative**: Should NOT trigger the rule  
**Edge**: Boundary conditions

## Success Criteria

Your output will be evaluated on: all rules formalized with data model references, operators appropriate for property types, actions specific and executable, and adequate test coverage.

## Important Notes

- Validate all entity/property references against data model
- Use correct operators for data types
- Include both positive and negative tests
- Cover edge cases at thresholds
- Set confidence below 0.8 if incomplete

Now generate business rules and tests from the provided inputs.
`;

  try {
    const { parsed } = await callOpenRouterJson({
      prompt,
      maxTokens: 50000,
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
        input: { text: combinedText },
        llmOutput: parsed,
        confidenceScore: parsed.confidence,
        schemaValid: true,
        humanModified: false,
      },
      create: {
        projectId,
        phase: PHASE,
        stepNumber: STEP_NUMBER,
        stepName: STEP_NAME,
        input: { text: combinedText },
        llmOutput: parsed,
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
