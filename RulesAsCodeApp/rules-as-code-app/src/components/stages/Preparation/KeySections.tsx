"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { useWizardStore } from "@/lib/store";
import { StepLayout } from "@/components/stages/StepLayout";

/**
 * PreparationKeySections
 * -----------------------------------------------------------------------------
 * Purpose:
 *   Implements the "Key Sections" step in the Preparation phase of the
 *   Rules-as-Code workflow. This step uses the output from “Normalize
 *   Terminology” as input, sends the text to an LLM endpoint to extract and
 *   categorize key legal sections, and allows user approval once reviewed.
 *
 * Responsibilities:
 *   - Pre-fills input from the prior approved step (Normalize Terminology).
 *   - Invokes the `/api/llm/key-sections` API route to process text via LLM.
 *   - Displays structured output (sections, categories, importance scores, etc.).
 *   - Supports editing and approval workflow integrated with the global store.
 *
 * Dependencies:
 *   - useWizardStore: retrieves previous step data and current project state.
 *   - StepEditorProps: defines contract for `onEdit` and `onApprove` callbacks.
 *   - StepLayout: shared UI shell for “input + process + output + approve”.
 */

export default function PreparationKeySections({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  // ---------------------------------------------------------------------------
  // 1. Context: previous step output + project context
  // ---------------------------------------------------------------------------
  const previousOutput = useWizardStore(
    (s) => s.steps["Preparation-Normalize Terminology"]?.output ?? ""
  );
  const { projectId } = useWizardStore();

  // `step` contains phase/stepName and any persisted LLM results.
  const { phase, stepName, content } = step ?? {
    phase: "",
    stepName: "",
    content: {},
  };

  // ---------------------------------------------------------------------------
  // 2. Local state
  // ---------------------------------------------------------------------------
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [hasProcessedThisSession, setHasProcessedThisSession] = useState(false);

  // ---------------------------------------------------------------------------
  // 3. Derived flags and helpers
  // ---------------------------------------------------------------------------
  const hasLlmRes =
    typeof content === "object" &&
    content !== null &&
    "result" in content &&
    typeof (content as any).result === "object" &&
    (content as any).result !== null &&
    "sections" in (content as any).result;

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
  // 4. Effects – pre-fill input from Normalize Terminology
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setInputText(previousOutput);
  }, [previousOutput]);

  // ---------------------------------------------------------------------------
  // 5. Actions – process and approve
  // ---------------------------------------------------------------------------

  const handleProcessText = async () => {
    setIsProcessing(true);
    setProcessError(null);

    try {
      // Draft save of current input & content
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
      // Persist the raw JSON and also a pretty stringified version as output

      onEdit(phase, stepName, data, inputText, JSON.stringify(data, null, 2));
      setHasProcessedThisSession(true);
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

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
          output: buildReadable(step?.content),
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
  // 6. Layout logic & output value for StepLayout
  // ---------------------------------------------------------------------------
  const twoColumn = hasProcessedThisSession || step?.approved;

  // Reproduce previous "displayText" logic: prefer parsed step.output, otherwise
  // fall back to a readable rendering of `content`.
  let displayText = initialReadable;
  if (step?.output) {
    try {
      const parsed = JSON.parse(step.output);
      displayText = buildReadable(parsed);
    } catch {
      displayText = step.output;
    }
  }

  const showOutput = twoColumn;
  const outputValue = displayText;

  // ---------------------------------------------------------------------------
  // 7. Render via shared StepLayout
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
