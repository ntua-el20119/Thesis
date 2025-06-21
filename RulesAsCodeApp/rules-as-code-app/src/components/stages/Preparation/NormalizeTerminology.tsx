"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

export default function PreparationNormaliseTerminology({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  const previousOutput = useWizardStore(
    (s) => s.steps["Preparation-Segment Text"]?.output ?? ""
  );

  const {
    projectId, // ✅ pull from store
  } = useWizardStore();

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

  const parsed = content as any;
  const resultSecs = parsed?.result?.sections ?? [];
  const terminology = parsed?.result?.terminologyMap ?? {};
  const strategy = parsed?.result?.normalizationStrategy ?? "No strategy";
  const confidence = parsed?.result?.confidence ?? "N/A";
  const summary = parsed?.result?.normalizationSummary ?? "No summary";

  useEffect(() => {
    setInputText(previousOutput);
  }, [previousOutput]);

  const sectionReadable = (s: any) => {
    const normList =
      s.normalizations && s.normalizations.length
        ? s.normalizations
            .map(
              (n: any) => `- ${n.original} → ${n.normalized} (${n.occurrences})`
            )
            .join("\n")
        : "None";

    return [
      `ID: ${s.id}`,
      `Title: ${s.title}`,
      `Content:\n${s.content}`,
      `Reference ID: ${s.referenceId || "None"}`,
      `Normalizations:\n${normList}`,
    ].join("\n");
  };

  const buildFullReadable = () => {
    const secPart = resultSecs.map(sectionReadable).join("\n\n") || "";
    const mapPart =
      Object.keys(terminology).length > 0
        ? Object.entries(terminology)
            .map(([o, n]) => `- ${o} → ${n}`)
            .join("\n")
        : "None";

    return (
      secPart +
      "\n\n=== Terminology Map ===\n" +
      mapPart +
      "\n\n=== Strategy ===\n" +
      strategy +
      "\n\n=== Confidence ===\n" +
      confidence +
      "\n\n=== Summary ===\n" +
      summary
    );
  };

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
          projectId, // optional safeguard
        }),
      });

      const res = await fetch("/api/llm/normalize-terminology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          projectId, // ✅ pass it here
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      const readable = (() => {
        const secs = data.result?.sections ?? [];
        const tMap = data.result?.terminologyMap ?? {};
        const strat = data.normalizationStrategy ?? "No strategy";
        const conf = data.confidence ?? "N/A";
        const summ = data.normalizationSummary ?? "No summary";

        const secTxt = secs.map(sectionReadable).join("\n\n");
        const mapTxt = Object.keys(tMap).length
          ? Object.entries(tMap)
              .map(([o, n]) => `- ${o} → ${n}`)
              .join("\n")
          : "None";

        return (
          secTxt +
          "\n\n=== Terminology Map ===\n" +
          mapTxt +
          "\n\n=== Strategy ===\n" +
          strat +
          "\n\n=== Confidence ===\n" +
          conf +
          "\n\n=== Summary ===\n" +
          summ
        );
      })();

      onEdit(phase, stepName, data, inputText, readable);
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
          output: buildFullReadable(),
          content: step?.content,
          projectId,
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
          Pre-filled with the approved output of “Segment Text”. Edit and click{" "}
          <em>Process Text</em>.
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">User Input</h3>
        <p className="text-sm text-gray-400 mb-2">
          Edit and click <em>Process Again</em> to re-run normalization.
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
        <h3 className="text-lg font-semibold mb-2">LLM Output</h3>
        <p className="text-sm text-gray-400 mb-2">
          This is the output of the LLM, including per-section normalizations,
          the terminology map and metadata.
        </p>

        <textarea
          value={buildFullReadable()}
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
          {isApproving ? "Approving…" : "Approve"}
        </button>
      </div>
    </div>
  );
}
