"use client";

/*
|--------------------------------------------------------------------------
| Imports
|--------------------------------------------------------------------------
| Keep framework hooks and project-specific types/stores up top.
*/
import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

/*
|--------------------------------------------------------------------------
| Component: PreparationNormaliseTerminology
|--------------------------------------------------------------------------
| Renders the "Normalize Terminology" step UI. It:
|  - Prefills user input from the approved output of "Segment Text"
|  - Calls the normalize-terminology API
|  - Renders a readable view of the LLM output
|  - Persists approval
*/
export default function PreparationNormaliseTerminology({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  /*
  |--------------------------------------------------------------------------
  | Store Selectors
  |--------------------------------------------------------------------------
  | Pull previously approved output to prefill the user input and the projectId
  | used for server-side association.
  */
  const previousOutput = useWizardStore(
    (s) => s.steps["Preparation-Segment Text"]?.output ?? ""
  );
  const { projectId } = useWizardStore();

  /*
  |--------------------------------------------------------------------------
  | Props Deconstruction & Defaults
  |--------------------------------------------------------------------------
  | Maintain robust defaults to avoid undefined access when the step is not set.
  */
  const { phase, stepName, content } = step ?? {
    phase: "",
    stepName: "",
    content: {},
  };

  /*
  |--------------------------------------------------------------------------
  | Local State
  |--------------------------------------------------------------------------
  | - inputText: editable user input (prefilled from "Segment Text")
  | - isProcessing / isApproving: button/loading management
  | - processError: user-visible error from processing action
  | - hasProcessedThisSession: governs one- vs two-column layout
  */
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [hasProcessedThisSession, setHasProcessedThisSession] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Derived Model From Step Content
  |--------------------------------------------------------------------------
  | The server persists the parsed LLM output in `step.content`.
  | Shape (from your logs):
  | {
  |   result: {
  |     sections: [...],
  |     terminologyMap: {...},
  |     normalizationStrategy: string   // (if nested in result; prefer root below)
  |   },
  |   confidence: number,
  |   normalizationStrategy: string,    // top-level (preferred)
  |   normalizationSummary: string      // top-level (preferred)
  | }
  */
  const parsed = content as any;
  const resultSecs = parsed?.result?.sections ?? [];
  const terminology = parsed?.result?.terminologyMap ?? {};
  const strategy = parsed?.result?.normalizationStrategy ?? "No strategy";
  const confidence = parsed?.confidence ?? "N/A";
  const summary = parsed?.normalizationSummary ?? "No summary";

  /*
  |--------------------------------------------------------------------------
  | Effects
  |--------------------------------------------------------------------------
  | Prefill user input when the upstream "Segment Text" approved output changes.
  */
  useEffect(() => {
    setInputText(previousOutput);
  }, [previousOutput]);

  /*
  |--------------------------------------------------------------------------
  | View Helpers (Formatting)
  |--------------------------------------------------------------------------
  | - sectionReadable: produces a single-section readable text block
  | - buildFullReadable: produces the composite text block with all metadata
  */
  const sectionReadable = (s: any) => {
    const normList =
      s.normalizations && s.normalizations.length
        ? s.normalizations
            .map(
              (n: any) =>
                `- ${n.original} → ${n.normalized} (${n.occurrences ?? "?"})`
            )
            .join("\n")
        : "None";

    return [
      `ID: ${s.id ?? "—"}`,
      `Title: ${s.title ?? "—"}`,
      `Content:\n${s.content ?? "—"}`,
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

  /*
  |--------------------------------------------------------------------------
  | Action Handlers
  |--------------------------------------------------------------------------
  | - handleProcessText:
  |     1) Upfront save of the input via /api/approve (draft context)
  |     2) Calls /api/llm/normalize-terminology
  |     3) Builds a human-readable version and emits onEdit with parsed data
  |
  | - handleApprove:
  |     1) Persists the final readable output via /api/approve
  |     2) Triggers onApprove to mark the step as approved
  */
  const handleProcessText = async () => {
    setIsProcessing(true);
    setProcessError(null);
    try {
      // Upfront draft save of current input and any prior content
      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          stepName,
          input: inputText,
          content: step?.content ?? {},
          projectId, // safeguard association
        }),
      });

      // Call the normalization API
      const res = await fetch("/api/llm/normalize-terminology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          projectId,
        }),
      });

      if (!res.ok) {
        // Provide actionable error information
        const text = await res.text();
        try {
          const j = JSON.parse(text);
          throw new Error(j.error || text);
        } catch {
          throw new Error(text);
        }
      }

      const data = await res.json();

      // Build a readable composite from the fresh response (note: read root fields)
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

      // Persist in the client store (and possibly server in your onEdit implementation)
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
      // Persist the current readable output and mark as approved
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

  /*
  |--------------------------------------------------------------------------
  | Layout Logic
  |--------------------------------------------------------------------------
  | If we have just processed in this session or the step is approved, show
  | the two-column layout (input left, output right). Otherwise, show only
  | a single input column with a Process action.
  */
  const twoColumn = hasProcessedThisSession || step?.approved;

  /*
  |--------------------------------------------------------------------------
  | Render: Single-Column (pre-first-run)
  |--------------------------------------------------------------------------
  */
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

  /*
  |--------------------------------------------------------------------------
  | Render: Two-Column (after processing or when approved)
  |--------------------------------------------------------------------------
  */
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: User Input and re-run */}
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

      {/* Right: LLM Output and approval */}
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
