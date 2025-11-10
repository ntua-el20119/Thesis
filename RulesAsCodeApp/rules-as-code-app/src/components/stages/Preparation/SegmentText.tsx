"use client"; // Marks this component as a Client Component — required for React hooks and interactivity.

import { StepEditorProps } from "@/lib/types";
import { useState, useEffect } from "react";
import { useWizardStore } from "@/lib/store";

/**
 * PreparationSegmentText
 * -----------------------------------------------------------------------------
 * Purpose:
 *   Implements the “Segment Text” step in the Preparation phase.
 *   This is the first step of the Rules-as-Code text transformation pipeline.
 *
 * Responsibilities:
 *   - Accepts raw legal text from the user as input.
 *   - Calls the LLM segmentation endpoint (`/api/llm/segment-text`) to divide
 *     text into discrete, identifiable legal sections.
 *   - Displays both the editable input and the model’s segmented output.
 *   - Supports approval workflow through `onApprove`, advancing the wizard.
 *
 * Data flow:
 *   - Input → processed by LLM → structured output (sections) → stored via onEdit.
 *   - Approved step persists via `/api/approve` route.
 *
 * Dependencies:
 *   - `useWizardStore`: Provides the active project ID and maintains global state.
 *   - `StepEditorProps`: Supplies `step`, `onEdit`, and `onApprove` bindings.
 */
export default function PreparationSegmentText({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  // ---------------------------------------------------------------------------
  // 1. Context and base destructuring
  // ---------------------------------------------------------------------------
  // Extract metadata from the current step or fallback to empty placeholders.
  const { phase, stepName, content } = step ?? {
    phase: "",
    stepName: "",
    content: {},
  };

  // Retrieve project ID from the global wizard store to associate API actions.
  const projectId = useWizardStore((s) => s.projectId);

  // ---------------------------------------------------------------------------
  // 2. Local UI state
  // ---------------------------------------------------------------------------
  // - inputText: user-provided or prefilled legal text
  // - isProcessing / isApproving: indicate network or async state
  // - processError: captures API errors for inline feedback
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  // Extract LLM segmentation result if available (determines current mode).
  const resultSections = (content as any)?.result?.sections;
  const hasLlmResponse = !!resultSections;

  // ---------------------------------------------------------------------------
  // 3. Initialization effect
  // ---------------------------------------------------------------------------
  // Auto-populate the input field from any existing `step.input` value
  // when the step loads or updates.
  useEffect(() => {
    if (typeof step?.input === "string") {
      setInputText(step.input);
    }
  }, [step?.input]);

  // ---------------------------------------------------------------------------
  // 4. Helpers
  // ---------------------------------------------------------------------------
  // buildReadable():
  //   Converts the structured section array into a readable text format for display.
  //   Each section includes its ID, title, content, and reference ID (if any).
  const buildReadable = (sections: any[]): string =>
    sections
      .map(
        (s: any) =>
          `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${
            s.content
          }\nReference ID: ${s.referenceId || "None"}`
      )
      .join("\n\n");

  // Readable version of the model output, used to populate the right-hand panel.
  const readableOutput = hasLlmResponse ? buildReadable(resultSections) : "";

  // ---------------------------------------------------------------------------
  // 5. Handlers
  // ---------------------------------------------------------------------------

  /**
   * handleProcessText
   * ----------------------------------------------------------
   * Invokes the LLM API to segment legal text into logical sections.
   * Workflow:
   *   1. Validates presence of active project ID.
   *   2. Sends POST to `/api/llm/segment-text` with text and projectId.
   *   3. Parses JSON response and updates store via `onEdit`.
   *   4. Captures errors and toggles UI state accordingly.
   */
  const handleProcessText = async () => {
    if (!projectId) {
      alert("No project selected.");
      return;
    }

    setIsProcessing(true);
    setProcessError(null);

    try {
      const response = await fetch("/api/llm/segment-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, text: inputText }), // Include project ID for DB linkage.
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`API error: ${response.status} - ${msg}`);
      }

      const data = await response.json();
      const outputText = buildReadable(data.result.sections);

      // Commit results to the global store.
      onEdit(phase, stepName, data, inputText, outputText);
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * handleApprove
   * ----------------------------------------------------------
   * Marks this step as approved in both backend and global state.
   *   - Sends POST to `/api/approve` with step data.
   *   - Invokes `onApprove` to trigger store update and navigation.
   */
  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          phase,
          stepName,
          input: inputText,
          output: step?.output ?? readableOutput,
          content: step?.content,
        }),
      });
      await onApprove(phase, stepName);
    } finally {
      setIsApproving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. UI Rendering
  // ---------------------------------------------------------------------------
  // The UI has two states:
  //   - Before LLM processing: Single-column with text input + “Process Text”.
  //   - After processing: Two-column layout (input + LLM output).
  if (!hasLlmResponse) {
    // --------------------------------------------------------------
    // Pre-processing state: user provides input to feed into the LLM
    // --------------------------------------------------------------
    return (
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          Paste or edit your legal text below, then press <em>Process Text</em>.
        </p>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={25}
          className="w-full p-2 border rounded bg-black text-white font-mono"
        />

        <button
          onClick={handleProcessText}
          disabled={isProcessing || !inputText.trim()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isProcessing ? "Processing..." : "Process Text"}
        </button>

        {processError && <p className="text-red-500 mt-2">{processError}</p>}
      </div>
    );
  }

  // --------------------------------------------------------------
  // Post-processing state: LLM output displayed alongside input
  // --------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column: editable input */}
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          Change text and click <em>Process Again</em> to re-segment it.
        </p>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={25}
          className="w-full p-2 border rounded bg-black text-white font-mono"
        />

        <button
          onClick={handleProcessText}
          disabled={isProcessing || !inputText.trim()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isProcessing ? "Processing..." : "Process Again"}
        </button>
      </div>

      {/* Right column: editable LLM output */}
      <div>
        <h3 className="text-lg font-semibold mb-2">LLM Response</h3>
        <p className="text-sm text-gray-400 mb-2">
          This is the output of the LLM.
        </p>

        <textarea
          value={step?.output ?? readableOutput}
          onChange={(e) =>
            onEdit(phase, stepName, content, inputText, e.target.value)
          }
          rows={25}
          className="w-full p-2 border rounded bg-black text-white font-mono"
        />

        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>
      </div>
    </div>
  );
}
