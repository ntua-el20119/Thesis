import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ApproveBody {
  projectId: number;
  phase: number;
  stepNumber: number;
  stepName?: string;

  // JSON payload (do NOT type as Prisma.JsonValue)
  humanOutput?: unknown;

  reviewNotes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ApproveBody = await request.json();
    const { projectId, phase, stepNumber, stepName, humanOutput, reviewNotes } =
      body;

    if (
      !projectId ||
      typeof projectId !== "number" ||
      Number.isNaN(projectId) ||
      typeof phase !== "number" ||
      Number.isNaN(phase) ||
      typeof stepNumber !== "number" ||
      Number.isNaN(stepNumber)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing/invalid required fields: projectId, phase, stepNumber",
        },
        { status: 400 }
      );
    }

    const hasHumanOutput = humanOutput !== undefined;

    // Since Json columns are NON-NULL, we must always provide valid JSON objects.
    const DEFAULT_JSON = {};

    await prisma.methodologyStep.upsert({
      where: {
        projectId_phase_stepNumber: {
          projectId,
          phase,
          stepNumber,
        },
      },

      update: {
        approved: true,
        ...(stepName ? { stepName } : {}),
        ...(reviewNotes !== undefined ? { reviewNotes } : {}),

        // Only apply human override if provided (do not clobber existing humanOutput)
        ...(hasHumanOutput
          ? {
              humanOutput: (humanOutput ?? DEFAULT_JSON) as any,
              humanModified: true,
            }
          : {}),
      },

      create: {
        projectId,
        phase,
        stepNumber,
        stepName: stepName ?? `Step ${stepNumber}`,

        // NON-NULL JSON fields
        input: DEFAULT_JSON as any,
        llmOutput: DEFAULT_JSON as any,

        approved: true,

        // If your schema defines humanOutput as NON-NULL too, keep it DEFAULT_JSON.
        // If it is nullable, you can set it to null here, but you told me the JSON fields are non-null.
        humanModified: hasHumanOutput,
        humanOutput: (hasHumanOutput ? humanOutput : DEFAULT_JSON) as any,

        // If confidenceScore is NON-NULL in your schema, set a default number (e.g., 0).
        confidenceScore: null as any,

        schemaValid: true,
        reviewNotes: (reviewNotes ?? null) as any,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("Error in POST /api/approve:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
