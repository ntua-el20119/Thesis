"use client";

/*
|--------------------------------------------------------------------------|
| Imports                                                                   |
|--------------------------------------------------------------------------|
*/
import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";

/*
|--------------------------------------------------------------------------|
| Component: PreparationNormaliseTerminology                               |
|--------------------------------------------------------------------------|
| Renders the "Normalize Terminology" step UI. It:
|  - Prefills user input from the approved output of "Segment Text"
|    (via StepDataLoader with previousKey = "Preparation-Segment Text").
|  - Calls the normalize-terminology API.
|  - Renders a readable view of the LLM output.
|  - Persists approval and integrates with the wizard flow.
*/
export default function PreparationNormaliseTerminology({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  /*
  |--------------------------------------------------------------------------|
  | Unified Data Access via StepDataLoader                                   |
  |--------------------------------------------------------------------------|
  */
  const io = useStepDataLoader(step, "Preparation-Segment Text");

  const { phase, stepName, content, projectId, output: persistedOutput } = io;

  /*
  |--------------------------------------------------------------------------|
  | Local State                                                              |
  |--------------------------------------------------------------------------|
  */
  const [inputText, setInputText] = useState(io.initialInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [hasProcessedThisSession, setHasProcessedThisSession] = useState(false);

  /*
  |--------------------------------------------------------------------------|
  | Effects                                                                  |
  |--------------------------------------------------------------------------|
  | Keep inputText in sync with initialInput (DB or previous step output).
  */
  useEffect(() => {
    setInputText(io.initialInput);
  }, [io.initialInput]);

  /*
  |--------------------------------------------------------------------------|
  | View Helper: buildReadable                                               |
  |--------------------------------------------------------------------------|
  | Normalises the structured LLM output into a human-readable composite:
  |  - Per-section normalizations
  |  - Global terminology map
  |  - Strategy / confidence / summary
  */
  function buildReadable(src: any): string {
    if (!src || typeof src !== "object") {
      return JSON.stringify(src, null, 2);
    }

    const parsed = src as any;

    const sections = parsed?.result?.sections ?? [];
    const terminology = parsed?.result?.terminologyMap ?? {};
    const strategy = parsed?.result?.normalizationStrategy ?? "No strategy";
    const confidence = parsed?.confidence ?? "N/A";
    const summary = parsed?.normalizationSummary ?? "No summary";

    const sectionReadable = (s: any) => {
      const normList =
        s.normalizations &&
        Array.isArray(s.normalizations) &&
        s.normalizations.length
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

    const secPart = Array.isArray(sections)
      ? sections.map(sectionReadable).join("\n\n")
      : "";

    const mapPart =
      terminology && Object.keys(terminology).length > 0
        ? Object.entries(terminology)
            .map(([o, n]) => `- ${o} → ${n}`)
            .join("\n")
        : "None";

    return (
      (secPart || "") +
      "\n\n=== Terminology Map ===\n" +
      mapPart +
      "\n\n=== Strategy ===\n" +
      strategy +
      "\n\n=== Confidence ===\n" +
      confidence +
      "\n\n=== Summary ===\n" +
      summary
    );
  }

  /*
  |--------------------------------------------------------------------------|
  | Derived Layout Flags                                                     |
  |--------------------------------------------------------------------------|
  */
  const twoColumn = hasProcessedThisSession || step?.approved;
  const showOutput = twoColumn;
  const outputValue = persistedOutput ?? buildReadable(content);

  /*
  |--------------------------------------------------------------------------|
  | Action Handlers                                                          |
  |--------------------------------------------------------------------------|
  */

  const handleProcessText = async () => {
    if (!projectId) {
      alert("No project selected.");
      return;
    }

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
      const res = await fetch("/api/llm/normalize-terminology", {
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
      const readable = buildReadable(data);

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
    if (!projectId) {
      alert("No project selected.");
      return;
    }

    setIsApproving(true);
    try {
      const finalOutput = step?.output ?? buildReadable(content);

      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          stepName,
          input: inputText,
          output: finalOutput,
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
