"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

/**
 * PreparationKeySections
 * -----------------------------------------------------------------------------
 * Purpose:
 *   Implements the "Key Sections" step in the Preparation phase of the Rules-as-Code
 *   workflow. This step uses the output from “Normalize Terminology” as input,
 *   sends the text to an LLM endpoint to extract and categorize key legal sections,
 *   and allows user approval once reviewed.
 *
 * Responsibilities:
 *   - Pre-fills input from the prior approved step (Normalize Terminology).
 *   - Invokes the `/api/llm/key-sections` API route to process text via LLM.
 *   - Displays structured output (sections, categories, importance scores, etc.).
 *   - Supports editing and approval workflow integrated with the global store.
 *
 * Dependencies:
 *   - useWizardStore: retrieves previous step data and maintains current project state.
 *   - StepEditorProps: defines contract for `onEdit` and `onApprove` callbacks.
 */

export default function PreparationKeySections({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  // ---------------------------------------------------------------------------
  // 1. Context: Retrieve previous step output
  // ---------------------------------------------------------------------------
  // The "Key Sections" step consumes the normalized text output
  // from the previous "Normalize Terminology" step.

  const previousOutput = useWizardStore(
    (s) => s.steps["Preparation-Normalize Terminology"]?.output ?? ""
  );

  // ---------------------------------------------------------------------------
  // 2. Step decomposition and local state
  // ---------------------------------------------------------------------------
  // `step` contains the phase, step name, and LLM results stored in the global state.
  // Local state variables track user input, loading indicators, errors, and
  // whether processing has occurred during this session.

  const { phase, stepName, content } = step ?? {
    phase: "",
    stepName: "",
    content: {},
  };

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [hasProcessedThisSession, setHasProcessedThisSession] = useState(false);

  // ---------------------------------------------------------------------------
  // 3. Derived flags
  // ---------------------------------------------------------------------------
  // hasLlmRes determines whether the step’s content contains a valid LLM response.

  const hasLlmRes =
    typeof content === "object" &&
    content !== null &&
    "result" in content &&
    typeof content.result === "object" &&
    content.result !== null &&
    "sections" in content.result;

  // ---------------------------------------------------------------------------
  // 4. Utility: buildReadable()
  // ---------------------------------------------------------------------------
  // Converts structured JSON output into a user-friendly text format for review.
  // Displays each section’s metadata (id, title, importance, category, etc.)
  // and optionally appends a confidence score.

  const buildReadable = (src: any) => {
    if (!src?.result?.sections) return JSON.stringify(src, null, 2);
    const txt =
      src.result.sections
        .map(
          (s: any) =>
            `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}\nImportance: ${s.importance}\nCategory: ${s.category}`
        )
        .join("\n\n") +
      (typeof src.confidence !== "undefined"
        ? `\n\n=== Confidence ===\n${src.confidence}`
        : "");
    return txt;
  };

  const initialReadable = buildReadable(content);

  // ---------------------------------------------------------------------------
  // 5. Effect: Pre-fill user input
  // ---------------------------------------------------------------------------
  // When the component mounts or the previous step’s output changes,
  // initialize the input text field with the normalized text from that step.
  useEffect(() => {
    setInputText(previousOutput);
  }, [previousOutput]);

  // ---------------------------------------------------------------------------
  // 6. Action: handleProcessText()
  // ---------------------------------------------------------------------------
  // Workflow:
  //   1. Send a lightweight POST to `/api/approve` (internal bookkeeping).
  //   2. Call the `/api/llm/key-sections` endpoint to process text with LLM.
  //   3. On success, update global state via `onEdit`.
  //   4. Capture and surface any network or parsing errors gracefully.
  const handleProcessText = async () => {
    setIsProcessing(true);
    setProcessError(null);

    try {
      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          stepName,
          input: inputText,
          content: step?.content ?? {},
        }),
      });

      const res = await fetch("/api/llm/key-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) {
        throw new Error(`LLM error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      onEdit(phase, stepName, data, inputText, JSON.stringify(data, null, 2));
      setHasProcessedThisSession(true);
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 7. Action: handleApprove()
  // ---------------------------------------------------------------------------
  // Marks this step as approved:
  //   - Updates the backend record via `/api/approve`.
  //   - Invokes `onApprove` callback to advance wizard navigation and state.
  const handleApprove = async () => {
    setIsApproving(true);

    try {
      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          stepName,
          input: inputText,
          output: step?.output,
          content: step?.content,
        }),
      });

      await onApprove(phase, stepName);
    } finally {
      setIsApproving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 8. Layout selection
  // ---------------------------------------------------------------------------
  // Two-column layout is shown after successful processing or when already approved.
  // Before that, a single-column input-only view is rendered.
  const twoColumn = hasProcessedThisSession || step?.approved;

  // ---------------------------------------------------------------------------
  // 9. Initial state: Pre-processing view
  // ---------------------------------------------------------------------------
  // Displays editable input (pre-filled text from previous step) and a button
  // to invoke the LLM for processing.
  if (!twoColumn) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          Pre-filled with the approved output of “Normalize Terminology”. Edit
          and click <em>Process&nbsp;Text</em>.
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
          {isProcessing ? "Processing…" : "Process Text"}
        </button>

        {processError && <p className="text-red-500 mt-2">{processError}</p>}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 10. Post-processing view
  // ---------------------------------------------------------------------------
  // Once the LLM result exists, display a two-column layout:
  //   - Left: editable input field for re-processing.
  //   - Right: structured output for inspection and approval.
  /* ---------- format whatever is in step.output ---------- */
  let displayText = initialReadable;
  if (step?.output) {
    try {
      const parsed = JSON.parse(step.output);
      displayText = buildReadable(parsed);
    } catch {
      displayText = step.output;
    }
  }

  // ---------------------------------------------------------------------------
  // 11. Render finalized layout
  // ---------------------------------------------------------------------------
  // Left column → editable input, right column → processed LLM results.
  // The "Approve" button is enabled only when the response structure is valid.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          Edit and click <em>Process Again</em> to re-run identification.
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
          {isProcessing ? "Processing…" : "Process Again"}
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Key Sections</h3>
        <p className="text-sm text-gray-400 mb-2">
          ID, title, content, importance, category and overall confidence.
        </p>

        <textarea
          value={displayText}
          onChange={(e) =>
            onEdit(phase, stepName, content, inputText, e.target.value)
          }
          rows={25}
          className="w-full p-2 border rounded bg-black text-white font-mono"
        />

        <button
          onClick={handleApprove}
          disabled={isApproving || !hasLlmRes}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {isApproving ? "Approving…" : "Approve"}
        </button>
      </div>
    </div>
  );
}
