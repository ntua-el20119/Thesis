"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

export default function PreparationKeySections({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  const previousOutput = useWizardStore(
    (s) => s.steps["Preparation-Normalize Terminology"]?.output ?? ""
  );

  const { phase, stepName, content } = step ?? {
    phase: "",
    stepName: "",
    content: {},
  };

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [hasProcessedThisSession, setHasProcessedThisSession] = useState(false);

  const hasLlmRes =
    typeof content === "object" &&
    content !== null &&
    "result" in content &&
    typeof content.result === "object" &&
    content.result !== null &&
    "sections" in content.result;

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

  useEffect(() => {
    setInputText(previousOutput);
  }, [previousOutput]);

  const handleProcessText = async () => {
    setIsProcessing(true);
    setProcessError(null);

    try {
      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          stepName,
          input: inputText,
          content: step?.content ?? {},
        }),
      });

      const res = await fetch("/api/llm/key-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) {
        throw new Error(`LLM error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
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
          output: step?.output,
          content: step?.content,
        }),
      });

      await onApprove(phase, stepName);
    } finally {
      setIsApproving(false);
    }
  };

  const twoColumn = hasProcessedThisSession || step?.approved;

  if (!twoColumn) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          Pre-filled with the approved output of “Normalize Terminology”. Edit and
          click <em>Process&nbsp;Text</em>.
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
          {isProcessing ? "Processing…" : "Process Text"}
        </button>

        {processError && <p className="text-red-500 mt-2">{processError}</p>}
      </div>
    );
  }

  /* ---------- format whatever is in step.output ---------- */
  let displayText = initialReadable;
  if (step?.output) {
    try {
      const parsed = JSON.parse(step.output);
      displayText = buildReadable(parsed);
    } catch {
      displayText = step.output;
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          Edit and click <em>Process Again</em> to re-run identification.
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
          {isProcessing ? "Processing…" : "Process Again"}
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Key Sections</h3>
        <p className="text-sm text-gray-400 mb-2">
          ID, title, content, importance, category and overall confidence.
        </p>

        <textarea
          value={displayText}
          onChange={(e) =>
            onEdit(phase, stepName, content, inputText, e.target.value)
          }
          rows={25}
          className="w-full p-2 border rounded bg-black text-white font-mono"
        />

        <button
          onClick={handleApprove}
          disabled={isApproving || !hasLlmRes}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {isApproving ? "Approving…" : "Approve"}
        </button>
      </div>
    </div>
  );
}
