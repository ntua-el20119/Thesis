"use client";

import { StepEditorProps } from "@/lib/types";
import { useEffect, useState } from "react";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";

/**
 * Phase1SegmentText
 * -----------------------------------------------------------------------------
 * Step 1 of the (new) 5-step methodology.
 *
 * Responsibilities:
 *   - Accept raw legal text from the user.
 *   - Call /api/llm/segment-text to segment into sections.
 *   - Produce a readable "approved output" for downstream steps.
 */
export default function SegmentText({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;

  // Step 1 → no previous step
  const io = useStepDataLoader(step, null);

  const { phase, stepName, content, projectId, output: persistedOutput } = io;

  const [inputText, setInputText] = useState(io.initialInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  useEffect(() => {
    setInputText(io.initialInput);
  }, [io.initialInput]);

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
    typeof content === "object" &&
    content !== null &&
    Object.keys(content as any).length > 0;

  const readableOutput = hasLlmResponse ? buildReadable(content) : "";

  const [outputValue, setOutputValue] = useState(
    (typeof persistedOutput === "string" && persistedOutput.trim().length > 0)
      ? persistedOutput
      : readableOutput
  );

  useEffect(() => {
    setOutputValue(
      (typeof persistedOutput === "string" && persistedOutput.trim().length > 0)
        ? persistedOutput
        : readableOutput
    );
  }, [persistedOutput, readableOutput]); 
  // Dependency on readableOutput handles re-renders when LLM content updates

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
        cache: "no-store",
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`API error: ${response.status} - ${msg}`);
      }

      const data = await response.json();
      const outputText = buildReadable(data);

      const confidence = typeof data?.confidence === 'number' ? data.confidence : null;

      // Update local UI immediately
      setOutputValue(outputText);

      // Persist to store (and DB via onEdit)
      onEdit(
        Number(phase),
        step.stepNumber,
        stepName,
        data,
        inputText,
        outputText,
        confidence
      );
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

    const finalOutput = (outputValue ?? "").trim();
    if (!finalOutput) {
      alert("Nothing to approve yet. Please process the text first.");
      return;
    }

    setIsApproving(true);
    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          phase: Number(phase),
          stepNumber: step.stepNumber,
          stepName,
          input: inputText,
          humanOutput: { text: finalOutput }, // Fix: Send humanOutput for persistence
          content: step?.content,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Approve failed: ${res.status} - ${msg}`);
      }

      await onApprove(Number(phase), step.stepNumber, stepName);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unknown approve error");
    } finally {
      setIsApproving(false);
    }
  };

  const showOutput = hasLlmResponse || !!step?.output;

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
          showOutput ? {
            title: "LLM Response",
            description: "Segmented text. You can edit invalid segments.",
            value: outputValue,
            onChange: setOutputValue, // Local state only
            onApprove: handleApprove,
            onReset: () => {
               // Reset by sending undefined output to onEdit (clearing DB)
               // AND resetting local state to original readableOutput
               setOutputValue(readableOutput);
               onEdit(Number(phase), step.stepNumber, stepName, content, inputText, undefined);
            },
            isApproving: false,
            confidence: typeof step?.confidenceScore === 'number' ? step.confidenceScore : null,
          } : undefined
        }
      />

      {processError && (
        <p className="mt-2 text-sm text-red-500">{processError}</p>
      )}
      {processError && (
        <p className="mt-2 text-sm text-red-500">{processError}</p>
      )}
    </div>
  );
}
