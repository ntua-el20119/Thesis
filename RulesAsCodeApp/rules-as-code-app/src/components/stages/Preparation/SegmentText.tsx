"use client";

import { StepEditorProps } from "@/lib/types";
import { useState, useEffect } from "react";

export default function PreparationSegmentText({ step, onEdit, onApprove }: StepEditorProps) {
  const { phase, stepName, content } = step ?? {
    phase: "",
    stepName: "",
    content: {},
  };

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  const resultSections = (content as any)?.result?.sections;
  const hasLlmResponse = !!resultSections;

  useEffect(() => {
    if (step?.input && typeof step.input === "string") {
      setInputText(step.input);
    }
  }, [step?.input]);

  const handleProcessText = async () => {
    setIsProcessing(true);
    setProcessError(null);

    try {
      const response = await fetch("/api/llm/segment-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      onEdit(phase, stepName, data, inputText, null);
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
          output: step?.output,
          content: step?.content,
        }),
      });
      await onApprove(phase, stepName);
    } finally {
      setIsApproving(false);
    }
  };

  const getReadableOutput = (): string => {
    return resultSections
      ?.map((s: any) =>
        `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}\nReference ID: ${
          s.referenceId || "None"
        }`
      )
      .join("\n\n") || "";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: User Input */}
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          If you want to change the input and re-run the query, edit below and click Process Again.
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
        {processError && <p className="text-red-500 mt-2">{processError}</p>}
      </div>

      {/* Right: LLM Output */}
      <div>
        <h3 className="text-lg font-semibold mb-2">LLM Response</h3>
        <p className="text-sm text-gray-400 mb-2">This is the output of the LLM.</p>
        <textarea
          value={getReadableOutput() || "No output yet. Submit input to see result."}
          onChange={(e) => {
            const edited = e.target.value;
            onEdit(phase, stepName, content, inputText, edited);
          }}
          rows={25}
          className="w-full p-2 border rounded bg-black text-white font-mono"
        />
        <button
          onClick={handleApprove}
          disabled={isApproving || !resultSections}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>
      </div>
    </div>
  );
}
