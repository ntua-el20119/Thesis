import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const pid = Number(projectId);
  if (!pid || Number.isNaN(pid)) {
    return NextResponse.json({ error: "Invalid projectId" }, { status: 400 });
  }

  try {
    const steps = await prisma.methodologyStep.findMany({
      where: { projectId: pid },
    });

    return NextResponse.json(steps);
  } catch (error) {
    console.error("Error loading saved steps:", error);
    return NextResponse.json(
      { error: "Failed to load saved steps" },
      { status: 500 }
    );
  }
}
