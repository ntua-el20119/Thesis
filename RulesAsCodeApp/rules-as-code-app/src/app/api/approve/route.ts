// src/app/api/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface Body {
  phase: string;
  stepName: string;
  input?: string;               // raw user input
  output?: string;              // human-readable LLM output
  content?: Prisma.JsonValue;   // full LLM JSON
}

export async function POST(request: NextRequest) {
  try {
    const { phase, stepName, input, output, content = {} }: Body =
      await request.json();

    if (!phase || !stepName) {
      return NextResponse.json(
        { success: false, error: "Missing phase or stepName" },
        { status: 400 }
      );
    }

    await prisma.methodologyStep.upsert({
      where: { phase_stepName: { phase, stepName } },

      update: {
        input,
        output,
        content,
        approved: true,
        updatedAt: new Date(),
      },

      create: {
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
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
