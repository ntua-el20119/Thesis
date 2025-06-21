// POST /api/projects         → create project
// GET  /api/projects         → list projects

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name } = (await req.json()) as { name?: string };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const project = await prisma.project.create({
      data: { name: name.trim() },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      // unique-constraint
      return NextResponse.json(
        { error: "A project with that name already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Unable to create project." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdAt: true },
  });
  return NextResponse.json(projects);
}
