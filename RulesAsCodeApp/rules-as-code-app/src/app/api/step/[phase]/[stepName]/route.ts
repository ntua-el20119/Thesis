import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/step/[phase]/[stepName]?projectId=123
 *
 * Compatibility route (old client contract) over the new DB schema.
 * New DB key is: (projectId, phase:int, stepNumber:int).
 *
 * This route maps:
 *   - phase string -> phase int (1|2)
 *   - stepName string -> stepNumber (1..5)
 */
function mapPhaseToInt(phase: string): number | null {
  // Accept both old and new UI labels
  const normalized = decodeURIComponent(phase).trim().toLowerCase();

  if (
    normalized === "preparation" ||
    normalized === "phase 1" ||
    normalized === "phase1" ||
    normalized === "1"
  )
    return 1;
  if (normalized === "phase 2" || normalized === "phase2" || normalized === "2")
    return 2;

  // If you still have legacy phases in URLs, you can decide how to handle them:
  // return null to force 404/400 rather than silently mis-map.
  return null;
}

function mapStepNameToNumber(stepName: string): number | null {
  const normalized = decodeURIComponent(stepName).trim().toLowerCase();

  // Accept both numbered and unnumbered labels
  if (
    normalized === "segment text" ||
    normalized === "1. segment text" ||
    normalized === "1 segment text"
  )
    return 1;
  if (
    normalized === "extract rules" ||
    normalized === "2. extract rules" ||
    normalized === "2 extract rules"
  )
    return 2;
  if (
    normalized === "detect conflicts" ||
    normalized === "3. detect conflicts" ||
    normalized === "3 detect conflicts"
  )
    return 3;
  if (
    normalized === "create data model" ||
    normalized === "4. create data model" ||
    normalized === "4 create data model"
  )
    return 4;
  if (
    normalized === "generate business rules" ||
    normalized === "5. generate business rules" ||
    normalized === "5 generate business rules"
  )
    return 5;

  // Accept numeric strings
  if (normalized === "1") return 1;
  if (normalized === "2") return 2;
  if (normalized === "3") return 3;
  if (normalized === "4") return 4;
  if (normalized === "5") return 5;

  return null;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ phase: string; stepName: string }> }
) {
  console.log(
    "[DEBUG] Handling GET /api/step/[phase]/[stepName] request at",
    new Date().toISOString()
  );

  try {
    const { phase: phaseRaw, stepName: stepNameRaw } = await context.params;
    console.log("[DEBUG] Extracted params:", {
      phase: phaseRaw,
      stepName: stepNameRaw,
    });

    const { searchParams } = new URL(request.url);
    const projectId = Number(searchParams.get("projectId"));
    console.log("[DEBUG] Extracted projectId:", projectId);

    if (!projectId || Number.isNaN(projectId)) {
      console.warn("[DEBUG] Invalid projectId:", projectId);
      return NextResponse.json(
        { error: "Missing or invalid projectId" },
        { status: 400 }
      );
    }

    const phase = mapPhaseToInt(phaseRaw);
    const stepNumber = mapStepNameToNumber(stepNameRaw);

    if (!phase || !stepNumber) {
      console.warn("[DEBUG] Invalid phase/step mapping:", {
        phaseRaw,
        stepNameRaw,
        phase,
        stepNumber,
      });
      return NextResponse.json(
        { error: "Invalid phase or stepName for the new methodology" },
        { status: 400 }
      );
    }

    console.log("[DEBUG] Fetching step by compound unique:", {
      projectId,
      phase,
      stepNumber,
    });

    const step = await prisma.methodologyStep.findUnique({
      where: {
        projectId_phase_stepNumber: {
          projectId,
          phase,
          stepNumber,
        },
      },
      select: {
        phase: true,
        stepNumber: true,
        stepName: true,
        input: true,
        llmOutput: true,
        humanOutput: true,
        approved: true,
        humanModified: true,
        schemaValid: true,
      },
    });

    if (!step) {
      console.log("[DEBUG] Step not found:", { projectId, phase, stepNumber });
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    // ---- Compatibility output: keep old client fields (content/input/output/approved)
    // content: return the structured LLM output (llmOutput) as "content"
    // output: prefer humanOutput if modified+approved, otherwise serialize llmOutput (or return empty string)
    const effectiveStructured =
      step.approved && step.humanModified && step.humanOutput != null
        ? step.humanOutput
        : step.llmOutput;

    const responsePayload = {
      phase: phase, // number
      stepNumber: stepNumber, // number
      stepName: step.stepName,
      content: step.llmOutput, // legacy "content" = structured model output
      input:
        typeof step.input === "string"
          ? step.input
          : JSON.stringify(step.input ?? {}, null, 2),
      output: JSON.stringify(effectiveStructured ?? {}, null, 2),
      approved: step.approved,
    };

    console.log("[DEBUG] Fetched step (compat):", {
      phase: responsePayload.phase,
      stepNumber: responsePayload.stepNumber,
      stepName: responsePayload.stepName,
      approved: responsePayload.approved,
    });

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("[DEBUG] Error fetching step:", message);

    return NextResponse.json(
      { error: "Failed to fetch step" },
      { status: 500 }
    );
  }
}
