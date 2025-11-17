"use client"; // Marks this component as a Client Component — required for React hooks and interactivity.

import { StepEditorProps } from "@/lib/types";
import { useState, useEffect } from "react";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";

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
 * Data flow (legal pipeline perspective):
 *   - Input (natural language legal text)
 *   - → LLM segmentation (computational rule application)
 *   - → structured JSON (sections in `content.result.sections`)
 *   - → human-readable view (via `buildReadable`)
 *   - → persisted in DB and propagated to subsequent steps.
 */
export default function PreparationSegmentText({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  // ---------------------------------------------------------------------------
  // 1. Unified data access using StepDataLoader
  // ---------------------------------------------------------------------------
  // First step in the phase → no previous step key.
  const io = useStepDataLoader(step, null);

  const { phase, stepName, content, projectId, output: persistedOutput } = io;

  // ---------------------------------------------------------------------------
  // 2. Local UI state
  // ---------------------------------------------------------------------------
  const [inputText, setInputText] = useState(io.initialInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  // Keep inputText aligned with whatever initialInput is (e.g. after project load).
  useEffect(() => {
    setInputText(io.initialInput);
  }, [io.initialInput]);

  // ---------------------------------------------------------------------------
  // 3. Shared readable builder (same name across all steps)
  // ---------------------------------------------------------------------------
  /**
   * buildReadable
   * -------------------------------------------------------------------------
   * Normalises the structured LLM segmentation result (`content`) into
   * a human-readable textual representation. This is what:
   *   - the user reads in the UI,
   *   - the next step uses as its upstream "approved output".
   */
  function buildReadable(src: any): string {
    const sections = src?.result?.sections ?? [];
    if (!Array.isArray(sections) || sections.length === 0) {
      return JSON.stringify(src, null, 2);
    }

    return sections
      .map(
        (s: any) =>
          `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${
            s.content
          }\nReference ID: ${s.referenceId || "None"}`
      )
      .join("\n\n");
  }

  const hasLlmResponse =
    io.hasLlmContent &&
    Array.isArray((content as any)?.result?.sections) &&
    (content as any).result.sections.length > 0;

  const readableOutput = hasLlmResponse ? buildReadable(content) : "";

  // ---------------------------------------------------------------------------
  // 4. Handlers – process & approve
  // ---------------------------------------------------------------------------

  /**
   * Invokes the LLM API to segment legal text into logical sections.
   * This is the computational instantiation of the "segmentation" rule.
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
      const outputText = buildReadable(data);

      // Commit results to the global store (and, indirectly, to the DB via approve).
      onEdit(phase, stepName, data, inputText, outputText);
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Marks this step as approved (legally "frozen" for downstream use)
   * in both backend and global state.
   */
  const handleApprove = async () => {
    if (!projectId) {
      alert("No project selected.");
      return;
    }

    setIsApproving(true);
    try {
      const finalOutput = persistedOutput ?? readableOutput;

      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          phase,
          stepName,
          input: inputText,
          output: finalOutput,
          content: step?.content,
        }),
      });

      await onApprove(phase, stepName);
    } finally {
      setIsApproving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. Layout wiring – StepLayout
  // ---------------------------------------------------------------------------
  const showOutput = hasLlmResponse || !!step?.output;
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
                description: "Segmented legal sections produced by the model.",
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
