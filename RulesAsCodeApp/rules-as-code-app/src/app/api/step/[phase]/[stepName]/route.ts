// src/app/api/step/[phase]/[stepName]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";          // <- your existing Prisma helper

export async function GET(
  _req: NextRequest,
  { params }: { params: { phase: string; stepName: string } }
) {
  const { phase, stepName } = params;

  // 1.  look-up
  const row = await prisma.methodologyStep.findUnique({
    where: { phase_stepName: { phase: phase, stepName: stepName } },
  });

  // 2.  return
  return row
    ? NextResponse.json(row)                   // 200 OK
    : NextResponse.json({}, { status: 404 });  // not found
}
