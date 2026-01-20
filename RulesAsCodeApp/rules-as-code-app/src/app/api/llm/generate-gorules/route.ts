import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOpenRouterJson, LlmApiError } from "@/lib/openrouter";

interface GenGoRulesBody {
  businessRules: string;
  dataModel: string;
  projectId: number;
}

const PHASE = 2;
const STEP_NUMBER = 6;
const STEP_NAME = "Generate GoRules Format";

export async function POST(req: NextRequest) {
  const { businessRules, dataModel, projectId }: GenGoRulesBody = await req.json();

  if (!projectId || typeof projectId !== "number") {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  const combinedText = `
### Business Rules (Step 5)
${businessRules || "(No business rules available)"}

### Data Model (Step 4)
${dataModel || "(No data model available)"}
`.trim();

  const prompt = `
# Prompt: Step 5b - Generate GoRules Format

## Your Task

Transform business rules into GoRules decision engine format—a visual, node-based decision graph that can be directly imported and executed.

## GoRules Overview

GoRules uses a visual graph structure with nodes (decision tables, functions, input/output points), edges (connections showing decision flow), and decision tables (rules organized in tabular format with inputs/outputs).

## Instructions

Based on the business rules and data model, create:

1. **Input Node**: Entry point for data
2. **Decision Table Nodes**: One per rule category
3. **Function Nodes**: For complex calculations or aggregations
4. **Output Node**: Final results
5. **Edges**: Connect nodes in execution order

## Input

Business Rules from Step 5 and Data Model from Step 4:

${combinedText}

## Required Output Format

\`\`\`json
{
  "result": {
    "contentType": "application/vnd.gorules.decision",
    "nodes": [
      {
        "id": "unique-uuid",
        "name": "nodeName",
        "type": "inputNode|outputNode|decisionTableNode|functionNode",
        "position": {"x": 100, "y": 200},
        "content": {}
      }
    ],
    "edges": [
      {
        "id": "unique-uuid",
        "type": "edge",
        "sourceId": "source-node-id",
        "targetId": "target-node-id"
      }
    ],
    "meta": null
  },
  "confidence": 0.90,
  "traceability": {
    "nodeToRule": {"node-id": "br-1"},
    "ruleToLegalText": {"br-1": "sec-3"}
  }
}
\`\`\`

## Node Types

**Input Node:**
\`\`\`json
{"id": "input-uuid", "name": "Request", "type": "inputNode", "content": {"schema": ""}, "position": {"x": 50, "y": 200}}
\`\`\`

**Decision Table Node:**
\`\`\`json
{
  "id": "table-uuid",
  "name": "eligibilityCheck",
  "type": "decisionTableNode",
  "content": {
    "hitPolicy": "first",
    "inputs": [{"id": "input_id", "name": "Input Name", "field": "entity.property"}],
    "outputs": [{"id": "output_id", "name": "Output Name", "field": "result.property", "defaultValue": "false"}],
    "rules": [{"_id": "rule-1", "input_id": "true", "output_id": "true"}]
  },
  "position": {"x": 350, "y": 200}
}
\`\`\`

**Function Node:**
\`\`\`json
{
  "id": "function-uuid",
  "name": "finalResult",
  "type": "functionNode",
  "content": {"source": "export const handler = async (input) => {\\n  return { result: input.check1 && input.check2 };\\n};"},
  "position": {"x": 650, "y": 200}
}
\`\`\`

**Output Node:**
\`\`\`json
{"id": "output-uuid", "name": "Response", "type": "outputNode", "content": {"schema": ""}, "position": {"x": 950, "y": 200}}
\`\`\`

## Decision Table Structure

**Inputs**: Properties being evaluated
\`\`\`json
{"id": "property_name", "name": "Display Name", "field": "entity.property"}
\`\`\`

**Outputs**: Results produced
\`\`\`json
{"id": "result_name", "name": "Display Name", "field": "output.property", "defaultValue": "default"}
\`\`\`

**Rules**: Conditions and values
\`\`\`json
{"_id": "unique-rule-id", "input1_id": "condition_value", "input2_id": "condition_value", "output_id": "result_value"}
\`\`\`

## Layout Guidelines

Position nodes horizontally based on execution order:
- Input: x=50
- First decision tables: x=350
- Second level: x=650
- Output: x=950

Space vertically by 110 pixels for each parallel node.

## Success Criteria

Your output will be evaluated on: all business rules converted to decision tables, data model properties used in input/output fields, nodes positioned logically, all nodes connected with edges, and traceability maintained to original rules.

## Important Notes

- Use UUIDs for all IDs
- Connect nodes with edges showing execution flow
- Use hitPolicy "first" for exclusive rules
- Include traceability mapping
- Set confidence below 0.8 if conversion incomplete

Now generate GoRules format from the provided business rules and data model.
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
