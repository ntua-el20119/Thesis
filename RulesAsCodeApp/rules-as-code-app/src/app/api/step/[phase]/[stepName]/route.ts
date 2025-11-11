import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Step } from "@/lib/types";

/**
 * GET /api/step/[phase]/[stepName]?projectId=123
 *
 * Purpose
 * -------
 * Fetch the persisted state of a single methodology step for a specific project.
 * The route is dynamic on `phase` and `stepName` and expects a `projectId` query parameter.
 *
 * Contract
 * --------
 * Inputs:
 *   - Path params:   phase: string, stepName: string
 *   - Query string:  projectId: number (required)
 *
 * Outputs:
 *   - 200 OK:        JSON body with the step record { phase, stepName, content, input, output, approved }
 *   - 400 Bad Req:   Missing or invalid projectId
 *   - 404 Not Found: No step exists for the given (projectId, phase, stepName)
 *   - 500 ServerErr: Unhandled server issue (caught and logged)
 *
 * Security/Privacy Notes
 * ----------------------
 * - This endpoint reads data only (no mutations).
 * - Ensure upstream authentication/authorization guards that the caller is allowed
 *   to access the project data (e.g., middleware or a wrapper not shown here).
 * - Returned payload may include step `content` which can be large; the `select` clause
 *   restricts fields to only those needed by the client.
 */
export async function GET(
  request: NextRequest,
  // In Next.js App Router, dynamic segments become `context.params`.
  // Here it's typed as a Promise resolving to `{ phase, stepName }`—so we await it below.
  context: { params: Promise<{ phase: string; stepName: string }> }
) {
  // ---- Observability: request receipt log with timestamp for traceability.
  console.log(
    "[DEBUG] Handling GET /api/step/[phase]/[stepName] request at",
    new Date().toISOString()
  );

  try {
    // ---- Path parameter extraction (awaited because it's a Promise in this signature).
    const { phase, stepName } = await context.params;
    console.log("[DEBUG] Extracted params:", { phase, stepName });

    // ---- Read and validate projectId from the query string (?projectId=...)
    const { searchParams } = new URL(request.url);
    const projectId = Number(searchParams.get("projectId"));
    console.log("[DEBUG] Extracted projectId:", projectId);

    // ---- Defensive validation: projectId must be a finite positive number.
    if (!projectId || Number.isNaN(projectId)) {
      console.warn("[DEBUG] Invalid projectId:", projectId);
      return NextResponse.json(
        { error: "Missing or invalid projectId" },
        { status: 400 }
      );
    }

    // ---- DB Lookup: fetch exactly one step for (projectId, phase, stepName).
    // Using `findFirst` with a composite where-filter. If you have a unique
    // constraint on (projectId, phase, stepName), `findUnique` would be even stricter.
    console.log("[DEBUG] Fetching step:", { projectId, phase, stepName });
    const step = await prisma.methodologyStep.findUnique({
      where: { projectId_phase_stepName: { projectId, phase, stepName } },
      // `select` narrows the payload to only what the client actually needs.
      select: {
        phase: true,
        stepName: true,
        content: true,
        input: true,
        output: true,
        approved: true,
      },
    });

    // ---- 404 Handling: no record found for the given triplet.
    if (!step) {
      console.log("[DEBUG] Step not found:", { projectId, phase, stepName });
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    // ---- Success path: minimal, safe logging of the payload.
    // Avoid logging full content to keep logs readable and reduce risk of sensitive data exposure.
    console.log("[DEBUG] Fetched step:", {
      phase: step.phase,
      stepName: step.stepName,
      approved: step.approved,
      content: JSON.stringify(step.content).slice(0, 50) + "...",
      input: step.input ? `${step.input.slice(0, 50)}...` : null,
      output: step.output ? `${step.output.slice(0, 50)}...` : null,
    });

    // ---- 200 OK with the selected fields.
    return NextResponse.json(step, { status: 200 });
  } catch (error) {
    // ---- Centralized error guard: we never leak raw errors to clients.
    // We do log the message for server-side diagnostics.
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("[DEBUG] Error fetching step:", message);

    // ---- Generic 500 response; the client can handle this and retry or show a toast.
    return NextResponse.json(
      { error: "Failed to fetch step" },
      { status: 500 }
    );
  }
}
