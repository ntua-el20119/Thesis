import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const projectId = Number(req.nextUrl.searchParams.get("projectId"));

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 }
    );
  }

  const steps = await prisma.methodologyStep.findMany({
    where: { projectId },
    orderBy: [{ phase: "asc" }, { stepNumber: "asc" }],
    select: {
      id: true,
      phase: true,
      stepNumber: true,
      stepName: true,
      input: true,
      llmOutput: true,
      humanOutput: true,
      schemaValid: true,
      humanModified: true,
      approved: true,
      confidenceScore: true,
    },
  });

  const serialized = steps.map((s) => ({
    ...s,
    confidenceScore: s.confidenceScore ? Number(s.confidenceScore) : null,
  }));

  return NextResponse.json(serialized);
}
