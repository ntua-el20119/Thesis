import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Type definition for the request body
interface MethodologyStepBody {
  projectId: number;
  phase: string;
  stepName: string;
  input?: string;
  output?: string;
  content?: Prisma.JsonValue;
}

/**
 * POST Handler for Methodology Step
 * Creates or updates a methodology step in the database using Prisma's upsert.
 * @param request - The incoming Next.js request containing project details
 * @returns JSON response indicating success or failure
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: MethodologyStepBody = await request.json();
    const { projectId, phase, stepName, input, output, content = {} } = body;

    // Validate required fields
    if (!projectId || !phase || !stepName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: projectId, phase, or stepName",
        },
        { status: 400 }
      );
    }

    // Upsert methodology step in the database
    await prisma.methodologyStep.upsert({
      where: {
        projectId_phase_stepName: {
          projectId,
          phase,
          stepName,
        },
      },
      update: {
        input,
        output,
        content,
        approved: true,
        updatedAt: new Date(),
      },
      create: {
        projectId,
        phase,
        stepName,
        input,
        output,
        content,
        approved: true,
      },
    });

    // Return success response
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Handle errors and return appropriate response
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("Error in POST /api/methodology-step:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
