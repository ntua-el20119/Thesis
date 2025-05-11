"use client";

import { useState } from "react";
import { StepEditorProps } from "@/lib/types";

export default function PreparationNormaliseTerminology({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  const { phase, stepName, content } = step ?? {
    phase: "",
    stepName: "",
    content: {},
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  const result = (content as any)?.result;
  const hasFullResponse =
    Array.isArray(result?.sections) &&
    !!(content as any)?.terminologyMap &&
    !!(content as any)?.normalizationSummary &&
    typeof (content as any)?.confidence !== "undefined" &&
    !!(content as any)?.normalizationStrategy;

  const handleProcessText = async () => {
    setIsProcessing(true);
    setProcessError(null);
    try {
      const inputSections = result?.sections || [];
      const textToProcess = inputSections.map((s: any) => s.content).join("\n");

      const response = await fetch("/api/llm/normalize-terminology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToProcess }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `API error: ${response.status}`);
        } catch {
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();

      const sections = data.result?.sections || [];
      const terminologyMap = data.terminologyMap || {};
      const normalizationStrategy = data.normalizationStrategy || "No strategy";
      const confidence = data.confidence ?? "N/A";
      const summary = data.normalizationSummary || "No summary";

      let outputText = sections
        .map((s: any) => {
          const normDetails =
            s.normalizations?.map((n: any) =>
              `- ${n.original} → ${n.normalized} (${n.occurrences})`
            ).join("\n") || "None";

          return [
            `ID: ${s.id}`,
            `Title: ${s.title}`,
            `Content:\n${s.content}`,
            `Reference ID: ${s.referenceId || "None"}`,
            `Normalizations:\n${normDetails}`,
          ].join("\n");
        })
        .join("\n\n");

      outputText += "\n\n=== Terminology Map ===\n";
      const terms = Object.entries(terminologyMap);
      outputText += terms.length
        ? terms.map(([from, to]) => `- ${from} → ${to}`).join("\n")
        : "None";

      outputText += "\n\n=== Strategy ===\n" + normalizationStrategy;
      outputText += "\n\n=== Confidence ===\n" + confidence;
      outputText += "\n\n=== Summary ===\n" + summary;

      // Save input and content now
      onEdit(phase, stepName, data, textToProcess, outputText);
    } catch (error) {
      setProcessError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phase,
        stepName,
        output: step?.output,
        content: step?.content,
      }),
    });
    await onApprove(phase, stepName);
  };

  const getDisplayText = (): string => {
    if (step.output) return step.output;

    const sections = result?.sections || [];
    return sections
      .map((s: any) =>
        `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}\nReference ID: ${s.referenceId || "None"}`
      )
      .join("\n\n");
  };

  return (
    <div className="mb-4">

      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          onEdit(phase, stepName, content, step?.input ?? "", e.currentTarget.innerText);
        }}
        className="w-full whitespace-pre-wrap p-2 border rounded mt-2 font-mono min-h-[400px] outline-none focus:ring"
      >
        {getDisplayText()}
      </div>

      {!hasFullResponse && (
        <button
          onClick={handleProcessText}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Process Text"}
        </button>
      )}

      {hasFullResponse && (
        <button
          onClick={handleApprove}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Approve
        </button>
      )}

      {processError && <p className="text-red-500 mt-2">{processError}</p>}
    </div>
  );
}
