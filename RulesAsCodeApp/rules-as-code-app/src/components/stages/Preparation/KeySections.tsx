"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

export default function PreparationKeySections({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  /* -------------------------------------------------- */
  /*  Pull NORMALISE-TERMINOLOGY output to pre-fill      */
  /* -------------------------------------------------- */
  const previousOutput = useWizardStore(
    (s) => s.steps["Preparation-Normalize Terminology"]?.output ?? ""
  );

  /* -------------------------------------------------- */
  /*  Local state                                       */
  /* -------------------------------------------------- */
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

  /* Use raw JSON (pretty-printed) for display */
  const rawJson   = JSON.stringify(content, null, 2);
  const hasLlmRes = !!content?.result?.sections; // simple presence check

  /* -------------------------------------------------- */
  /*  Initialise textarea – always previous step output */
  /* -------------------------------------------------- */
  useEffect(() => {
    setInputText(previousOutput); // ignore stored input
  }, [previousOutput]);

  /* -------------------------------------------------- */
  /*  PROCESS                                            */
  /* -------------------------------------------------- */
  const handleProcessText = async () => {
    setIsProcessing(true);
    setProcessError(null);

    try {
      /* Persist user input immediately (optional) */
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

      /* Call LLM */
      const res = await fetch("/api/llm/key-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) {
        throw new Error(`LLM error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();

      /* Save to store – raw JSON as output for now */
      onEdit(phase, stepName, data, inputText, JSON.stringify(data, null, 2));
      setHasProcessedThisSession(true);
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  /* -------------------------------------------------- */
  /*  APPROVE                                            */
  /* -------------------------------------------------- */
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
          output: step.output,
          content: step.content,
        }),
      });

      await onApprove(phase, stepName);
    } finally {
      setIsApproving(false);
    }
  };

  /* -------------------------------------------------- */
  /*  Layout switch                                     */
  /* -------------------------------------------------- */
  const twoColumn = hasProcessedThisSession;

  /* ---------------- ONE-COLUMN ---------------- */
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

  /* ---------------- TWO-COLUMN ---------------- */
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column – user input */}
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

      {/* Right column – RAW LLM output */}
      <div>
        <h3 className="text-lg font-semibold mb-2">LLM Raw Output</h3>
        <p className="text-sm text-gray-400 mb-2">
          Raw JSON returned by the LLM.
        </p>

        <textarea
          value={step.output ?? rawJson}
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
