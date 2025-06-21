"use client";

import { useEffect } from "react";
import { stepComponentMap } from "@/components/stages";
import { StepEditorProps } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

/**
 * StepRenderer Component
 * Dynamically renders a methodology step's UI based on its phase and step name, and loads
 * step data from the database if the step is empty. It integrates with the wizard store to
 * manage step content and state.
 * @param props - StepEditorProps containing step details and callbacks for editing/approving
 * @returns A React component for the specified step or an error message if unsupported
 */
export default function StepRenderer(props: StepEditorProps) {
  // Destructure step and onEdit callback from props
  const { step, onEdit } = props;

  // Retrieve projectId from the global Zustand store to associate API requests with a project
  const projectId = useWizardStore((s) => s.projectId);

  // Log the step being rendered
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

  // Effect to load step data from the database when step or projectId changes
  useEffect(() => {
    // Skip execution if step or projectId is missing, as they are required for API requests
    if (!step || !projectId) return;

    // Extract step properties for validation and API request
    const { phase, stepName, content, input, output } = step;

    // Determine if the step is empty (no content, input, or output)
    const isEmpty =
      (!content ||
        (typeof content === "object" && Object.keys(content).length === 0)) &&
      !input &&
      !output;

    // Skip fetching if the step is already hydrated with data
    if (!isEmpty) return;

    // Asynchronously fetch step data from the database
    (async () => {
      try {
        // Make a GET request to the step API endpoint with encoded phase and stepName
        const res = await fetch(
          `/api/step/${encodeURIComponent(phase)}/${encodeURIComponent(
            stepName
          )}?projectId=${projectId}`,
          { cache: "no-store" } // Disable caching to ensure fresh data
        );

        // Handle non-200 responses, logging the error for debugging
        if (!res.ok) {
          console.warn(
            `⚠️ Failed to load step ${phase}/${stepName}:`,
            await res.text()
          );
          return;
        }

        // Parse the response and log the fetched step details
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

        // Update the store with the fetched step data using the onEdit callback
        onEdit(row.phase, row.stepName, row.content, row.input, row.output);
      } catch (err) {
        // Log any unexpected errors during the fetch operation
        console.error("[DEBUG] Error loading step:", err);
      }
    })();
  }, [
    step?.phase,
    step?.stepName,
    step?.content,
    step?.input,
    step?.output,
    projectId,
    step,
    onEdit,
  ]);

  // Return null if no step is provided to prevent rendering
  if (!step) return null;

  // Generate a unique key for the step by combining phase and stepName, removing spaces
  const key = `${step.phase}${step.stepName}`.replace(/\s+/g, "");

  // Retrieve the corresponding component for the step from the stepComponentMap
  const Component = stepComponentMap[key];

  // Render an error message if no component is found for the step
  if (!Component) {
    return <p className="text-red-500">Unsupported step: {key}</p>;
  }

  // Render the step-specific component, passing all props
  return <Component {...props} />;
}
