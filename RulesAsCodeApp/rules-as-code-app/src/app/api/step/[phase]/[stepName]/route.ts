import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { phase: string; stepName: string } }
) {
  const phase = await context.params.phase;
  const stepName = await context.params.stepName;

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const pid = Number(projectId);
  if (!pid || Number.isNaN(pid)) {
    return NextResponse.json(
      { error: "Missing or invalid projectId" },
      { status: 400 }
    );
  }

  try {
    const step = await prisma.methodologyStep.findUnique({
      where: {
        projectId_phase_stepName: {
          projectId: pid,
          phase,
          stepName,
        },
      },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    return NextResponse.json(step);
  } catch (err) {
    console.error("GET step error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
