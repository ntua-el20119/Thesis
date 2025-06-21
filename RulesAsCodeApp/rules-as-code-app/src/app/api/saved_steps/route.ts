import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Step } from "@/lib/types";

/**
 * GET Handler for Fetching All Saved Steps
 * Retrieves all methodology steps for a specific project from the database.
 * @param request - The incoming Next.js request containing projectId as a query parameter
 * @returns JSON response with an array of steps or error details
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and validate projectId from query parameters
    console.log(
      "[DEBUG] Handling GET /api/saved_steps request at",
      new Date().toISOString()
    );
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

    // Fetch all steps for the project from the database
    console.log("[DEBUG] Fetching steps for projectId:", projectId);
    const steps: Step[] = await prisma.methodologyStep.findMany({
      where: { projectId },
      select: {
        phase: true,
        stepName: true,
        content: true,
        input: true,
        output: true,
        approved: true,
      },
    });
    console.log(
      "[DEBUG] Fetched steps:",
      steps.map((s) => ({
        phase: s.phase,
        stepName: s.stepName,
        approved: s.approved,
        content: JSON.stringify(s.content).slice(0, 50) + "...",
        input: s.input ? `${s.input.slice(0, 50)}...` : null,
        output: s.output ? `${s.output.slice(0, 50)}...` : null,
      }))
    );

    // Return the steps
    console.log(
      "[DEBUG] Returning steps for projectId:",
      projectId,
      "count:",
      steps.length
    );
    return NextResponse.json(steps, { status: 200 });
  } catch (error) {
    // Handle unexpected errors during database query
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("[DEBUG] Error fetching saved steps:", message);
    return NextResponse.json(
      { error: "Failed to fetch steps" },
      { status: 500 }
    );
  }
}
