import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface Body {
  projectId: number;
  phase: string;
  stepName: string;
  input?: string;
  output?: string;
  content?: Prisma.JsonValue;
}

export async function POST(request: NextRequest) {
  try {
    const {
      projectId,
      phase,
      stepName,
      input,
      output,
      content = {},
    }: Body = await request.json();

    if (!projectId || !phase || !stepName) {
      return NextResponse.json(
        { success: false, error: "Missing projectId, phase, or stepName" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
