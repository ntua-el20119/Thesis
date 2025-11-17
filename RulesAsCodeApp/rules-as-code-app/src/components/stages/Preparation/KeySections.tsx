"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";

/**
 * PreparationKeySections
 * -----------------------------------------------------------------------------
 * Purpose:
 *   Implements the "Key Sections" step in the Preparation phase.
 *   It takes the (approved) normalized text from “Normalize Terminology”,
 *   calls the `/api/llm/key-sections` endpoint, and renders the structured
 *   key sections in a human-readable way.
 *
 * Dependencies:
 *   - Previous step: "Preparation-Normalize Terminology"
 *   - Uses StepDataLoader to:
 *       • read current step data (phase, stepName, content, output, etc.)
 *       • read previous step output as canonical input
 *       • access projectId
 */
export default function PreparationKeySections({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  // ---------------------------------------------------------------------------
  // 1. Unified data access via StepDataLoader
  // ---------------------------------------------------------------------------
  const io = useStepDataLoader(step, "Preparation-Normalize Terminology");

  const { phase, stepName, content, projectId, output: persistedOutput } = io;

  // ---------------------------------------------------------------------------
  // 2. Local state
  // ---------------------------------------------------------------------------
  const [inputText, setInputText] = useState(io.initialInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [hasProcessedThisSession, setHasProcessedThisSession] = useState(false);

  // Keep the input in sync with canonical initialInput
  useEffect(() => {
    setInputText(io.initialInput);
  }, [io.initialInput]);

  // ---------------------------------------------------------------------------
  // 3. Human-readable builder (same name across steps)
  // ---------------------------------------------------------------------------
  /**
   * buildReadable
   * -------------------------------------------------------------------------
   * Takes the structured LLM output for Key Sections and transforms it into
   * a human-readable representation (ID, title, content, importance, category,
   * and confidence metadata).
   */
  function buildReadable(src: any): string {
    const result = src?.result;
    const sections = result?.sections ?? [];

    if (!Array.isArray(sections) || sections.length === 0) {
      return JSON.stringify(src, null, 2);
    }

    const base = sections
      .map(
        (s: any) =>
          `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}\nImportance: ${s.importance}\nCategory: ${s.category}`
      )
      .join("\n\n");

    const conf =
      typeof src?.confidence !== "undefined"
        ? `\n\n=== Confidence ===\n${src.confidence}`
        : "";

    return base + conf;
  }

  // Is there structured LLM content with sections?
  const hasLlmRes =
    io.hasLlmContent &&
    Array.isArray((content as any)?.result?.sections) &&
    (content as any).result.sections.length > 0;

  // Base readable from content
  const initialReadable = buildReadable(content);

  // Backward-compatible display logic:
  // - If step.output exists:
  //     • try to parse as JSON; if that looks like structured data, render via buildReadable
  //     • otherwise, treat as pre-formatted text
  // - Else, use readable from `content`.
  let displayText = initialReadable;
  if (step?.output) {
    try {
      const parsed = JSON.parse(step.output);
      displayText = buildReadable(parsed);
    } catch {
      displayText = step.output;
    }
  }

  const twoColumn = hasProcessedThisSession || step?.approved;
  const showOutput = twoColumn;
  const outputValue = persistedOutput ?? displayText;

  // ---------------------------------------------------------------------------
  // 4. Actions – process & approve
  // ---------------------------------------------------------------------------

  const handleProcessText = async () => {
    if (!projectId) {
      alert("No project selected.");
      return;
    }

    setIsProcessing(true);
    setProcessError(null);

    try {
      // Draft save of current input & existing content
      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          stepName,
          input: inputText,
          content: step?.content ?? {},
          projectId,
        }),
      });

      // Call the key-sections LLM endpoint
      const res = await fetch("/api/llm/key-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          projectId,
        }),
      });

      if (!res.ok) {
        throw new Error(`LLM error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const readable = buildReadable(data);

      // Persist structured JSON and human-readable form
      onEdit(phase, stepName, data, inputText, readable);
      setHasProcessedThisSession(true);
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!projectId) {
      alert("No project selected.");
      return;
    }

    setIsApproving(true);

    try {
      const finalOutput = step?.output ?? buildReadable(content);

      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          stepName,
          input: inputText,
          output: finalOutput,
          content: step?.content,
          projectId,
        }),
      });

      await onApprove(phase, stepName);
    } finally {
      setIsApproving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. Render via shared StepLayout
  // ---------------------------------------------------------------------------
  return (
    <div>
      <StepLayout
        showOutput={showOutput}
        input={{
          title: "User Input",
          description: showOutput ? (
            <>
              Edit and click <em>Process Again</em> to re-run identification of
              key sections.
            </>
          ) : (
            <>
              Pre-filled with the approved output of{" "}
              <em>Normalize Terminology</em>. Edit if needed and click{" "}
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
                title: "Key Sections",
                description:
                  "ID, title, content, importance, category and overall confidence.",
                value: outputValue,
                onChange: (value: string) =>
                  onEdit(phase, stepName, content, inputText, value),
                onApprove: handleApprove,
                isApproving,
                disabled: !hasLlmRes,
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
