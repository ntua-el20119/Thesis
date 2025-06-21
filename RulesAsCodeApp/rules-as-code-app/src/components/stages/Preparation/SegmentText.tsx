"use client";

import { StepEditorProps } from "@/lib/types";
import { useState, useEffect } from "react";
import { useWizardStore } from "@/lib/store";

export default function PreparationSegmentText({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  const { phase, stepName, content } = step ?? {
    phase: "",
    stepName: "",
    content: {},
  };

  const projectId = useWizardStore((s) => s.projectId); // ✅ Get current project ID from store

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  const resultSections = (content as any)?.result?.sections;
  const hasLlmResponse = !!resultSections;

  /* ------------------------------------------------------------------ */
  /*  Initialize input from store                                        */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (typeof step?.input === "string") {
      setInputText(step.input);
    }
  }, [step?.input]);

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                           */
  /* ------------------------------------------------------------------ */
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
        body: JSON.stringify({ projectId, text: inputText }), // ✅ Send projectId
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`API error: ${response.status} - ${msg}`);
      }

      const data = await response.json();
      const outputText = buildReadable(data.result.sections);

      onEdit(phase, stepName, data, inputText, outputText);
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
          projectId, // ✅ Include for approval if needed
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

  /* ------------------------------------------------------------------ */
  /*  UI                                                                 */
  /* ------------------------------------------------------------------ */
  if (!hasLlmResponse) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          Paste or edit your legal text below, then press <em>Process Text</em>.
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
          {isProcessing ? "Processing..." : "Process Text"}
        </button>

        {processError && <p className="text-red-500 mt-2">{processError}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column: editable input */}
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          Change text and click <em>Process Again</em> to re-segment it.
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
      </div>

      {/* Right column: editable LLM output */}
      <div>
        <h3 className="text-lg font-semibold mb-2">LLM Response</h3>
        <p className="text-sm text-gray-400 mb-2">
          This is the output of the LLM.
        </p>

        <textarea
          value={step?.output ?? readableOutput}
          onChange={(e) =>
            onEdit(phase, stepName, content, inputText, e.target.value)
          }
          rows={25}
          className="w-full p-2 border rounded bg-black text-white font-mono"
        />

        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>
      </div>
    </div>
  );
}
