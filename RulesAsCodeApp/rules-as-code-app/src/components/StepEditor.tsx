// src/components/StepEditor.tsx
"use client";

import { useState } from "react";
import { Step, JsonValue } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

interface StepEditorProps {
  step: Step | null;
  onEdit: (phase: string, stepName: string, content: JsonValue) => void;
  onApprove: (phase: string, stepName: string) => Promise<void>;
}

export default function StepEditor({ step, onEdit, onApprove }: StepEditorProps) {
  const { phase, stepName, content } = step || { phase: "", stepName: "", content: {} };
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  const handleEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newContent: JsonValue = JSON.parse(e.target.value);
      onEdit(phase, stepName, newContent);
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

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
      const textToNormalize = (content as any)?.result?.sections?.map((s: any) => s.content).join("\n") || "";
      const response = await fetch("/api/llm/normalize-terminology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToNormalize }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to normalize terminology");
      }
      const data = await response.json();
      const normalizedContent = { normalized: { text: data.normalized.text } };
      onEdit(phase, stepName, normalizedContent);
    } catch (error) {
      console.error("Error processing text:", error);
      setProcessError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const getTextareaValue = () => {
    if (!content) return "Waiting for content...";

    // For "Segment Text", display the sections with ID, Title, Content, and Reference
    if (stepName === "Segment Text" && typeof content === "object" && content !== null && "result" in content && Array.isArray((content as any).result?.sections)) {
      const sections = (content as any).result.sections;
      return sections.map((s: any) => `ID: ${s.id}\nTitle: ${s.title}\nContent: ${s.content}${s.referenceId ? `\nReference: ${s.referenceId}` : ""}`).join("\n\n");
    }

    // For "Normalize Terminology", display the sections in the same format before API call, and normalized text after
    if (stepName === "Normalize Terminology" && typeof content === "object" && content !== null) {
      if ("normalized" in content) {
        return (content as any).normalized.text; // After API call
      }
      if ("result" in content && Array.isArray((content as any).result?.sections)) {
        const sections = (content as any).result.sections;
        return sections.map((s: any) => `ID: ${s.id}\nTitle: ${s.title}\nContent: ${s.content}${s.referenceId ? `\nReference: ${s.referenceId} \n` 
                             : ""}`).join("\n\n");
      }
    }

    // Fallback for unexpected content
    return typeof content === "string" ? content : JSON.stringify(content, null, 2);
  };

  const hasNormalizedContent = stepName === "Normalize Terminology" && typeof content === "object" && content !== null && "normalized" in content;

  return (
    <div className="mb-4">
      <h2 className="text-xl">{`${phase} - ${stepName}`}</h2>
      <textarea
        value={getTextareaValue()}
        onChange={handleEdit}
        className="w-full p-2 border rounded mt-2"
        rows={10}
        placeholder="Content will appear here after processing"
        readOnly // Prevent manual edits
      />
      {stepName === "Segment Text" && content && (
        <button
          onClick={handleApprove}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Approve
        </button>
      )}
      {stepName === "Normalize Terminology" && !hasNormalizedContent && (
        <button
          onClick={handleProcessText}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={isProcessing || !content}
        >
          {isProcessing ? "Processing..." : "Process Text"}
        </button>
      )}
      {hasNormalizedContent && (
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