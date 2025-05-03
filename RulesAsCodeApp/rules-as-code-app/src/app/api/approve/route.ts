// src/app/api/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JsonValue } from "@/lib/types"; // Import JsonValue for typing

export async function POST(request: NextRequest) {
  const { phase, stepName, content }: { phase: string; stepName: string; content: JsonValue } = await request.json();
  try {
    await prisma.methodologyStep.upsert({
      where: { phase_stepName: { phase, stepName } },
      update: { content, approved: true, updatedAt: new Date() },
      create: { phase, stepName, content, approved: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}