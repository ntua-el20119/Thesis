"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";

/**
 * First render = one-column view with the Key-Sections JSON already in `step.content`.
 * After the user runs the LLM (Process Text) we switch to the usual two-column view.
 */
export default function PreparationInconsistencyScan({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  const { phase, stepName, content } = step ?? {};
  const prevSections = (content as any)?.result?.sections ?? [];

  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (!hasProcessed && prevSections.length) {
      const seed = prevSections
        .map((s: any) => `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}`)
        .join("\n\n");
      setInputText(seed);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const buildReadable = () => {
    const incs = (content as any)?.result?.inconsistencies ?? [];
    const approach = (content as any)?.result?.analysisApproach ?? "N/A";
    const conf = (content as any)?.confidence ?? "N/A";
    const compl = (content as any)?.analysisCompleteness ?? "N/A";

    if (!incs.length) return "";

    let out = incs
      .map(
        (i: any) =>
          `ID: ${i.id}\nDescription: ${i.description}\nLocation: ${i.location}\nType: ${
            i.type
          }\nText:\n${i.text}`
      )
      .join("\n\n");

    out += "\n\n=== Analysis Approach ===\n" + approach;
    out += "\n\n=== Confidence ===\n" + conf;
    out += "\n\n=== Analysis Completeness ===\n" + compl;

    return out;
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/llm/inconsistency-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      if (!res.ok) throw new Error(`LLM error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      onEdit(phase ?? "", stepName ?? "", data, inputText, buildReadable());
      setHasProcessed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
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
          input: step?.input ?? "",
          output: step?.output,
          content: step?.content,
        }),
      });
      await onApprove(phase ?? "", stepName ?? "");
    } finally {
      setIsApproving(false);
    }
  };

  const oneColumn = !hasProcessed;

  if (oneColumn) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          These are the sections from <em>Key Sections</em>. Edit if you wish and click{" "}
          <em>Process Text</em>.
        </p>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={25}
          className="w-full p-2 border rounded bg-black text-white font-mono"
        />

        <button
          onClick={handleProcess}
          disabled={isProcessing || !inputText.trim()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isProcessing ? "Processing…" : "Process Text"}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          Edit and click <em>Process Again</em> to re-run inconsistency scan.
        </p>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={25}
          className="w-full p-2 border rounded bg-black text-white font-mono"
        />
        <button
          onClick={handleProcess}
          disabled={isProcessing || !inputText.trim()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isProcessing ? "Processing…" : "Process Again"}
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">LLM Inconsistency Report</h3>
        <textarea
          value={buildReadable()}
          onChange={(e) =>
            onEdit(phase ?? "", stepName ?? "", content ?? "", inputText, e.target.value)
          }
          rows={25}
          className="w-full p-2 border rounded bg-black text-white font-mono"
        />
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {isApproving ? "Approving…" : "Approve"}
        </button>
      </div>
    </div>
  );
}
