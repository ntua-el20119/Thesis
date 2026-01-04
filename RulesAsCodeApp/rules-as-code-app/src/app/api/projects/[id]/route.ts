
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = Number(params.id);

  if (!projectId || isNaN(projectId)) {
    return NextResponse.json(
      { error: "Invalid project ID" },
      { status: 400 }
    );
  }

  try {
    // Delete project. Steps will be deleted automatically due to onDelete: Cascade in schema
    const deleted = await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true, deletedId: deleted.id });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    console.error("[api/projects/[id]] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
