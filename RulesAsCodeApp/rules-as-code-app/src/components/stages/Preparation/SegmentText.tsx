"use client"; // Marks this component as a Client Component — required for React hooks and interactivity.

import { StepEditorProps } from "@/lib/types";
import { useState, useEffect } from "react";
import { useWizardStore } from "@/lib/store";
import { StepLayout } from "@/components/stages/StepLayout";

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
 *   - `StepLayout`: Shared UI shell for “input + process + output + approve”.
 */
export default function PreparationSegmentText({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  // ---------------------------------------------------------------------------
  // 1. Context and base destructuring
  // ---------------------------------------------------------------------------
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
  useEffect(() => {
    if (typeof step?.input === "string") {
      setInputText(step.input);
    }
  }, [step?.input]);

  // ---------------------------------------------------------------------------
  // 4. Helpers
  // ---------------------------------------------------------------------------
  const buildReadable = (sections: any[]): string =>
    sections
      .map(
        (s: any) =>
          `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${
            s.content
          }\nReference ID: ${s.referenceId || "None"}`
      )
      .join("\n\n");

  const readableOutput = hasLlmResponse ? buildReadable(resultSections) : "";

  // ---------------------------------------------------------------------------
  // 5. Handlers
  // ---------------------------------------------------------------------------

  /**
   * Invokes the LLM API to segment legal text into logical sections.
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
        body: JSON.stringify({ projectId, text: inputText }),
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
   * Marks this step as approved in both backend and global state.
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
  // 6. UI Rendering via shared StepLayout
  // ---------------------------------------------------------------------------
  const showOutput = hasLlmResponse;
  const outputValue = step?.output ?? readableOutput;

  return (
    <div>
      <StepLayout
        showOutput={showOutput}
        input={{
          title: "User Input",
          description: showOutput ? (
            <>
              Change text and click <em>Process Again</em> to re-segment it.
            </>
          ) : (
            <>
              Paste or edit your legal text below, then press{" "}
              <em>Process Text</em>.
            </>
          ),
          value: inputText,
          onChange: setInputText,
          processLabel: showOutput ? "Process Again" : "Process Text",
          onProcess: handleProcessText,
          isProcessing,
          disabled: !inputText.trim(),
          rows: 25,
        }}
        output={
          showOutput
            ? {
                title: "LLM Response",
                description: "This is the output of the LLM.",
                value: outputValue,
                onChange: (value: string) =>
                  onEdit(phase, stepName, content, inputText, value),
                onApprove: handleApprove,
                isApproving,
                rows: 25,
              }
            : undefined
        }
      />

      {processError && (
        <p className="mt-2 text-sm text-red-500">{processError}</p>
      )}
    </div>
  );
}
