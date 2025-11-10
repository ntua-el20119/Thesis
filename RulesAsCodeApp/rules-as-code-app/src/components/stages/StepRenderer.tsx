"use client"; // Marks this file as a Client Component (enables hooks, browser APIs, and client-side interactivity)

import { useEffect } from "react";
import { stepComponentMap } from "@/components/stages";
import { StepEditorProps } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

/**
 * StepRenderer
 * -----------------------------------------------------------------------------
 * Responsibility
 *   - Dynamically select and render the correct UI component for a given
 *     methodology step (determined by phase + stepName).
 *   - Opportunistically hydrate an "empty" step by fetching its data from the
 *     backend (idempotent read) when it first becomes active.
 *
 * Key design points
 *   - Decoupling via `stepComponentMap`: keeps routing logic (which component
 *     to render) separate from data orchestration.
 *   - Defensive hydration: only fetches if the step is "empty" (no content,
 *     input, or output), preventing redundant network traffic.
 *   - Store-aligned updates: pushes fetched data back through `onEdit` (the
 *     canonical mutation path) so the global state remains the source of truth.
 *
 * Error handling & observability
 *   - Structured debug logs aid traceability without leaking large payloads.
 *   - Non-OK responses are logged but do not crash the UI; rendering proceeds.
 *
 * Contract
 *   - props.step may be null during initial transitions; component renders null.
 *   - The backing store must provide a valid `projectId` for fetch calls.
 */
export default function StepRenderer(props: StepEditorProps) {
  // Extract the bound step and the mutation callback.
  // - `onEdit` is the authoritative way to commit step data back to the store/UI.
  const { step, onEdit } = props;

  // Associate data operations with the active project context.
  // - Required for API routes that scope by projectId server-side.
  const projectId = useWizardStore((s) => s.projectId);

  // Diagnostics: summarize what's being rendered without dumping full payloads.
  console.log("[DEBUG] StepRenderer rendering:", {
    phase: step?.phase,
    stepName: step?.stepName,
    approved: step?.approved,
    content: step?.content
      ? JSON.stringify(step.content).slice(0, 50) + "..."
      : null,
    input: step?.input ? `${step.input.slice(0, 50)}...` : null,
    output: step?.output ? `${step.output.slice(0, 50)}...` : null,
    projectId,
    time: new Date().toISOString(),
  });

  // Side-effect: Hydrate step data on demand.
  // Triggers when:
  //   - The step identity/content changes, or
  //   - The project context changes (new project selection).
  // Skip when:
  //   - No step or no projectId (insufficient context to fetch), or
  //   - The step is already hydrated (has content/input/output).
  useEffect(() => {
    if (!step || !projectId) return;

    const { phase, stepName, content, input, output } = step;

    // Determine "emptiness":
    // - No content (null/undefined/empty object) AND no input AND no output.
    const isEmpty =
      (!content ||
        (typeof content === "object" && Object.keys(content).length === 0)) &&
      !input &&
      !output;

    if (!isEmpty) return; // Already hydrated; no fetch needed.

    // Fire-and-forget async fetch to hydrate the step from the DB.
    (async () => {
      try {
        // Note: phase/stepName are URL-encoded to safely address dynamic routes.
        const res = await fetch(
          `/api/step/${encodeURIComponent(phase)}/${encodeURIComponent(
            stepName
          )}?projectId=${projectId}`,
          { cache: "no-store" } // Avoid stale reads; always retrieve fresh state.
        );

        // Soft-fail on non-OK to keep UI responsive; log for debugging.
        if (!res.ok) {
          console.warn(
            `⚠️ Failed to load step ${phase}/${stepName}:`,
            await res.text()
          );
          return;
        }

        // Expected row shape aligns with `Step` contract from shared types.
        const row = await res.json();
        console.log("[DEBUG] Loaded step from DB:", {
          phase: row.phase,
          stepName: row.stepName,
          approved: row.approved,
          content: row.content
            ? JSON.stringify(row.content).slice(0, 50) + "..."
            : null,
          input: row.input ? `${row.input.slice(0, 50)}...` : null,
          output: row.output ? `${row.output.slice(0, 50)}...` : null,
          time: new Date().toISOString(),
        });

        // Write-through to global state via the provided mutation callback.
        // This maintains a single source of truth for the step’s data.
        onEdit(row.phase, row.stepName, row.content, row.input, row.output);
      } catch (err) {
        // Network/parse/unexpected error guard.
        console.error("[DEBUG] Error loading step:", err);
      }
    })();
  }, [
    // Dependencies ensure hydration re-checks on identity or content deltas.
    step?.phase,
    step?.stepName,
    step?.content,
    step?.input,
    step?.output,
    step?.approved,
    projectId,
    step, // structural change guard
    onEdit, // ensures latest callback is used
  ]);

  // If the step isn't available yet, render nothing.
  // Parent components typically gate rendering or pass a default.
  if (!step) return null;

  // Component lookup:
  // - Key convention `{phase}{stepName}` without spaces must match the map.
  // - This avoids deep switch/case trees and keeps registry centralized.
  const key = `${step.phase}${step.stepName}`.replace(/\s+/g, "");

  // Resolve the concrete UI component for the current step from the registry.
  const Component = stepComponentMap[key];

  // Guard: unknown step mapping → visible error for quicker integration fixes.
  if (!Component) {
    return <p className="text-red-500">Unsupported step: {key}</p>;
  }

  // Happy path: delegate rendering to the step-specific component.
  // - Pass through the full props so children get `onEdit`/`onApprove` etc.
  return <Component {...props} />;
}
