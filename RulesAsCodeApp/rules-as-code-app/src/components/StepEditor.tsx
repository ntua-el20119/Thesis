"use client";

import { useState } from "react";
import { Step, JsonValue } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

interface StepEditorProps {
  step: Step | null;
  onEdit: (
    phase: string,
    stepName: string,
    content: JsonValue,
    input?: string,
    output?: string
  ) => void;
  onApprove: (phase: string, stepName: string) => Promise<void>;
}

export default function StepEditor({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  const get = useWizardStore.getState;

  const { phase, stepName, content } = step || {
    phase: "",
    stepName: "",
    content: {},
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  const handleApprove = async () => {
    try {
      await onApprove(phase, stepName);
    } catch (error) {
      console.error("Failed to approve step:", error);
    }
  };

  const handleProcessText = async () => {
    setIsProcessing(true);
    setProcessError(null);

    try {
      let inputText = "";
      const inputSections = (content as any)?.result?.sections;
      const textToProcess = inputSections?.map((s: any) => s.content).join("\n") || "";
      inputText = textToProcess;

      const response = await fetch(
        `/api/llm/${stepName.toLowerCase().replace(/\s+/g, "-")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            stepName === "Key Sections"
              ? { sections: inputSections }
              : { text: textToProcess }
          ),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.error || `API error: ${response.status} - ${response.statusText}`
          );
        } catch (parseError) {
          throw new Error(
            `API error: ${response.status} - ${response.statusText} - ${errorText || "No error details"}`
          );
        }
      }

      const data = await response.json();
      const result = data.result;
      const normalizedSections = result?.sections || [];
      const terminologyMap = data.terminologyMap || {};
      const normalizationStrategy = data.normalizationStrategy || "No strategy provided.";
      const confidence = data.confidence ?? "N/A";
      const summary = data.normalizationSummary || "No summary provided.";

      let outputTextFormatted = normalizedSections
        .map((s: any) => {
          const normDetails =
            s.normalizations?.map((n: any) =>
              `- ${n.original} → ${n.normalized} (${n.occurrences} occurrence${n.occurrences > 1 ? "s" : ""})`
            ).join("\n") || "None";

          return [
            `ID: ${s.id}`,
            `Title: ${s.title}`,
            `Content:\n${s.content}`,
            `Reference ID: ${s.referenceId ?? "None"}`,
            `Normalizations:\n${normDetails}`
          ].join("\n");
        })
        .join("\n\n");

      outputTextFormatted += "\n\n=== Terminology Map ===\n";
      outputTextFormatted += Object.entries(terminologyMap)
        .map(([o, n]) => `- ${o} → ${String(n)}`)
        .join("\n") || "None";

      outputTextFormatted += "\n\n=== Normalization Strategy ===\n" + normalizationStrategy;
      outputTextFormatted += "\n\n=== Confidence ===\n" + confidence;
      outputTextFormatted += "\n\n=== Normalization Summary ===\n" + summary;

      onEdit(phase, stepName, data, inputText, outputTextFormatted);
    } catch (error) {
      console.error("Error processing text:", error);
      setProcessError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const getOutputText = (): string => {
    const output = (step as any)?.output;
    if (output) return output;

    const result = (content as any)?.result;

    if (stepName === "Segment Text" && result?.sections) {
      return result.sections.map((s: any) =>
        `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}\nReference ID: ${s.referenceId || "None"}`
      ).join("\n\n");
    }

    if (stepName === "Normalize Terminology" && result?.sections) {
      return result.sections.map((s: any) =>
        `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}\nReference ID: ${s.referenceId || "None"}`
      ).join("\n\n");
    }

    return typeof content === "string"
      ? content
      : JSON.stringify(content, null, 2);
  };

  const hasFullResponse =
    stepName === "Normalize Terminology" &&
    typeof content === "object" &&
    content !== null 

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">{`${phase} - ${stepName}`}</h2>

      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const editedText = e.currentTarget.innerText;
          onEdit(phase, stepName, content, (content as any)?.input ?? "", editedText);
        }}
        className="w-full whitespace-pre-wrap p-2 border rounded mt-2 font-mono min-h-[400px] outline-none focus:ring focus:ring-blue-300"
      >
        {getOutputText()}
      </div>

      {stepName === "Segment Text" &&(
        <button
          onClick={handleApprove}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Approve
        </button>
      )}

      {stepName === "Normalize Terminology" && !hasFullResponse && (
        <button
          onClick={handleProcessText}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isProcessing || !content}
        >
          {isProcessing ? "Processing..." : "Process Text"}
        </button>
      )}

      {stepName === "Normalize Terminology" && hasFullResponse && (
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
