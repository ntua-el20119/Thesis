"use client";

/*
|--------------------------------------------------------------------------|
| Imports                                                                   |
|--------------------------------------------------------------------------|
*/
import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { useWizardStore } from "@/lib/store";
import { StepLayout } from "@/components/stages/StepLayout";

/*
|--------------------------------------------------------------------------|
| Component: PreparationNormaliseTerminology                               |
|--------------------------------------------------------------------------|
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
  |--------------------------------------------------------------------------|
  | Store Selectors                                                          |
  |--------------------------------------------------------------------------|
  */
  const previousOutput = useWizardStore(
    (s) => s.steps["Preparation-Segment Text"]?.output ?? ""
  );
  const { projectId } = useWizardStore();

  /*
  |--------------------------------------------------------------------------|
  | Props Deconstruction & Defaults                                          |
  |--------------------------------------------------------------------------|
  */
  const { phase, stepName, content } = step ?? {
    phase: "",
    stepName: "",
    content: {},
  };

  /*
  |--------------------------------------------------------------------------|
  | Local State                                                              |
  |--------------------------------------------------------------------------|
  */
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [hasProcessedThisSession, setHasProcessedThisSession] = useState(false);

  /*
  |--------------------------------------------------------------------------|
  | Derived Model From Step Content                                          |
  |--------------------------------------------------------------------------|
  | Shape (from logs):
  | {
  |   result: {
  |     sections: [...],
  |     terminologyMap: {...},
  |     normalizationStrategy: string
  |   },
  |   confidence: number,
  |   normalizationStrategy: string,
  |   normalizationSummary: string
  | }
  */
  const parsed = content as any;
  const resultSecs = parsed?.result?.sections ?? [];
  const terminology = parsed?.result?.terminologyMap ?? {};
  const strategy = parsed?.result?.normalizationStrategy ?? "No strategy";
  const confidence = parsed?.confidence ?? "N/A";
  const summary = parsed?.normalizationSummary ?? "No summary";

  /*
  |--------------------------------------------------------------------------|
  | Effects                                                                  |
  |--------------------------------------------------------------------------|
  | Prefill user input when the upstream "Segment Text" approved output changes.
  */
  useEffect(() => {
    setInputText(previousOutput);
  }, [previousOutput]);

  /*
  |--------------------------------------------------------------------------|
  | View Helpers (Formatting)                                                |
  |--------------------------------------------------------------------------|
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
  |--------------------------------------------------------------------------|
  | Action Handlers                                                          |
  |--------------------------------------------------------------------------|
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
          projectId,
        }),
      });

      // Call the normalization API
      const res = await fetch("/api/llm/preparation/normalize-terminology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          projectId,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const j = JSON.parse(text);
          throw new Error(j.error || text);
        } catch {
          throw new Error(text);
        }
      }

      const data = await res.json();

      // Build a readable composite from the fresh response
      const readable = (() => {
        const secs = data.result?.sections ?? [];
        const tMap = data.result?.terminologyMap ?? {};
        const strat = data.result?.normalizationStrategy ?? "No strategy";
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

      // Persist in the client store
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
          output: step?.output ?? buildFullReadable(),
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
  |--------------------------------------------------------------------------|
  | Layout Logic                                                             |
  |--------------------------------------------------------------------------|
  | If we have processed in this session or the step is approved,
  | show the two-column layout (input left, output right).
  */
  const twoColumn = hasProcessedThisSession || step?.approved;
  const showOutput = twoColumn;
  const outputValue = step?.output ?? buildFullReadable();

  /*
  |--------------------------------------------------------------------------|
  | Render via shared StepLayout                                             |
  |--------------------------------------------------------------------------|
  */
  return (
    <div>
      <StepLayout
        showOutput={showOutput}
        input={{
          title: "User Input",
          description: twoColumn ? (
            <>
              Edit and click <em>Process Again</em> to re-run normalization.
            </>
          ) : (
            <>
              Pre-filled with the approved output of “Segment Text”. Edit and
              click <em>Process Text</em>.
            </>
          ),
          value: inputText,
          onChange: setInputText,
          processLabel: twoColumn ? "Process Again" : "Process Text",
          onProcess: handleProcessText,
          isProcessing,
          disabled: !inputText.trim(),
          rows: 25,
        }}
        output={
          showOutput
            ? {
                title: "Normalized Output",
                description:
                  "Sections with their normalizations, the terminology map, and summary metadata.",
                value: outputValue,
                onChange: (value: string) =>
                  onEdit(phase, stepName, content, inputText, value),
                onApprove: handleApprove,
                isApproving,
                rows: 25,
              }
            : undefined
        }
      />

      {processError && (
        <p className="mt-2 text-sm text-red-500">{processError}</p>
      )}
    </div>
  );
}
