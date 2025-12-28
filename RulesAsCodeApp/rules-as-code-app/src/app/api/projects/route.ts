// POST /api/projects  → create project + initialize 5 methodology steps
// GET  /api/projects  → list projects

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CreateProjectBody = {
  name?: string;
  description?: string;
  legalText?: string;
};

const STEPS: Array<{ phase: number; stepNumber: number; stepName: string }> = [
  { phase: 1, stepNumber: 1, stepName: "Segment Text" },
  { phase: 1, stepNumber: 2, stepName: "Extract Rules" },
  { phase: 1, stepNumber: 3, stepName: "Detect Conflicts" },
  { phase: 2, stepNumber: 4, stepName: "Create Data Model" },
  { phase: 2, stepNumber: 5, stepName: "Generate Business Rules" },
];

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreateProjectBody;

  const name = body?.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // legalText is required at DB level in the new schema.
  // If you want it mandatory from the client too, change this to a 400 when empty.
  const legalText = (body.legalText ?? "").toString();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1) Create project
      const project = await tx.project.create({
        data: {
          name,
          description: body.description?.trim() || null,
          legalText,
          // status defaults to in_progress via prisma schema
        },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 2) Initialize all 5 steps (procedural skeleton)
      await tx.methodologyStep.createMany({
        data: STEPS.map((s) => ({
          projectId: project.id,
          phase: s.phase,
          stepNumber: s.stepNumber,
          stepName: s.stepName,
          input: {}, // Json
          llmOutput: {}, // Json
          humanOutput: null, // Json?
          confidenceScore: null,
          schemaValid: false,
          humanModified: false,
          approved: false,
          reviewNotes: null,
        })),
        skipDuplicates: true, // respects @@unique(projectId, phase, stepNumber)
      });

      // 3) Return project + initialized steps (ordered)
      const steps = await tx.methodologyStep.findMany({
        where: { projectId: project.id },
        orderBy: [{ phase: "asc" }, { stepNumber: "asc" }],
        select: {
          id: true,
          phase: true,
          stepNumber: true,
          stepName: true,
          schemaValid: true,
          approved: true,
          humanModified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { project, steps };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      // unique-constraint on Project.name
      return NextResponse.json(
        { error: "A project with that name already exists." },
        { status: 409 }
      );
    }
    console.error("[api/projects] create error:", err);
    return NextResponse.json(
      { error: "Unable to create project." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(projects);
}
