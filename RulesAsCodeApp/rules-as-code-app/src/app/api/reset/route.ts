import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest) {
  await prisma.methodologyStep.deleteMany();     // ⚠ wipes ALL rows
  return NextResponse.json({ success: true });
}
