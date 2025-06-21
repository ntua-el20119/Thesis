import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Step } from "@/lib/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ phase: string; stepName: string }> }
) {
  console.log(
    "[DEBUG] Handling GET /api/step/[phase]/[stepName] request at",
    new Date().toISOString()
  );
  try {
    const { phase, stepName } = await context.params;
    console.log("[DEBUG] Extracted params:", { phase, stepName });

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

    console.log("[DEBUG] Fetching step:", { projectId, phase, stepName });
    const step = await prisma.methodologyStep.findFirst({
      where: { projectId, phase, stepName },
      select: {
        phase: true,
        stepName: true,
        content: true,
        input: true,
        output: true,
        approved: true,
      },
    });

    if (!step) {
      console.log("[DEBUG] Step not found:", { projectId, phase, stepName });
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    console.log("[DEBUG] Fetched step:", {
      phase: step.phase,
      stepName: step.stepName,
      approved: step.approved,
      content: JSON.stringify(step.content).slice(0, 50) + "...",
      input: step.input ? `${step.input.slice(0, 50)}...` : null,
      output: step.output ? `${step.output.slice(0, 50)}...` : null,
    });

    return NextResponse.json(step, { status: 200 });
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
