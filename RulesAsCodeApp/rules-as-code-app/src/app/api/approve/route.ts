// src/app/api/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JsonValue } from "@/lib/types"; // Import JsonValue for typing
import { Prisma } from "@prisma/client"; // Import Prisma namespace

export async function POST(request: NextRequest) {
  const { phase, stepName, content }: { phase: string; stepName: string; content: JsonValue } = await request.json();
  try {
    await prisma.methodologyStep.upsert({
      where: { phase_stepName: { phase, stepName } },
      update: { content: content as Prisma.JsonValue, approved: true, updatedAt: new Date() },
      create: { phase, stepName, content: content as Prisma.InputJsonValue, approved: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}