import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = Number(params.id);
  if (!projectId) {
    return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { phase, stepNumber } = body;

    if (!phase || !stepNumber) {
        return NextResponse.json({ error: "Missing phase or stepNumber" }, { status: 400 });
    }

    // 1. Delete subsequent steps (strictly AFTER the current one)
    // "Subsequent" means:
    // (s.phase > phase) OR (s.phase == phase && s.stepNumber > stepNumber)
    await prisma.methodologyStep.deleteMany({
      where: {
        projectId,
        OR: [
          { phase: { gt: phase } },
          { phase, stepNumber: { gt: stepNumber } },
        ],
      },
    });

    // 2. Un-approve the CURRENT step (since we are about to modify it)
    // We could simple update it.
    await prisma.methodologyStep.updateMany({
        where: {
            projectId,
            phase,
            stepNumber
        },
        data: {
            approved: false,
            // We don't wipe the content of the current step here; 
            // the LLM generation or user edit will overwrite it shortly after locally 
            // and then save via onEdit -> /api/save_step. 
            // But we MUST revoke approval.
        }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error resetting steps:", error);
    return NextResponse.json(
      { error: "Failed to reset subsequent steps" },
      { status: 500 }
    );
  }
}
