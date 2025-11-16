"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { useWizardStore } from "@/lib/store";
import { StepLayout } from "@/components/stages/StepLayout";

/**
 * PreparationInconsistencyScan
 * ---------------------------------------------------------------------------
 * Purpose:
 *   Implements the "Inconsistency Scan" step in the Preparation phase.
 *   It takes the structured sections from the previous step ("Key Sections"),
 *   converts them into a readable textual form for the LLM, and displays the
 *   inconsistency report produced by the LLM.
 *
 * Contracts:
 *   - Previous step (Key Sections):
 *       steps["Preparation-Key Sections"].content:
 *         {
 *           result: {
 *             sections: [
 *               { id, title, content, importance, category },
 *               ...
 *             ]
 *           },
 *           confidence: number
 *         }
 *   - Current step (Inconsistency Scan):
 *       step.content:
 *         {
 *           result: {
 *             inconsistencies: [
 *               { id, description, location, text, type },
 *               ...
 *             ],
 *             analysisApproach: string
 *           },
 *           confidence: number,
 *           analysisCompleteness: string
 *         }
 *   - For all steps:
 *       content = structured JSON (for machines)
 *       output  = readable string (for humans / next step)
 */

export default function PreparationInconsistencyScan({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  // ---------------------------------------------------------------------------
  // 1. Context: previous step content + project context
  // ---------------------------------------------------------------------------
  const prevKeySectionsContent = useWizardStore(
    (s) => s.steps["Preparation-Key Sections"]?.content
  );
  const { projectId } = useWizardStore();

  const { phase = "", stepName = "", content = {} } = step ?? {};

  // ---------------------------------------------------------------------------
  // 2. Local state
  // ---------------------------------------------------------------------------
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [hasProcessedThisSession, setHasProcessedThisSession] = useState(false);

  // ---------------------------------------------------------------------------
  // 3. Helpers
  // ---------------------------------------------------------------------------

  const hasLlmRes =
    typeof content === "object" &&
    content !== null &&
    "result" in content &&
    typeof (content as any).result === "object" &&
    (content as any).result !== null &&
    "inconsistencies" in (content as any).result;

  /**
   * Build the text fed into the inconsistency scan LLM from the
   * structured Key Sections JSON. We focus on ID, Title and Content,
   * because those carry the legal substance.
   */
  const buildKeySectionsSeed = (src: any): string => {
    const sections = src?.result?.sections ?? [];
    if (!Array.isArray(sections) || sections.length === 0) return "";

    return sections
      .map(
        (s: any) =>
          `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}\nImportance: ${s.importance}\nCategory: ${s.category}`
      )
      .join("\n\n");
  };

  /**
   * Human-readable inconsistency report from this step's `content`.
   */
  const buildReadable = (src: any): string => {
    const incs = src?.result?.inconsistencies ?? [];
    const approach = src?.result?.analysisApproach ?? "N/A";
    const conf =
      typeof src?.confidence !== "undefined" ? src.confidence : "N/A";
    const compl = src?.analysisCompleteness ?? "N/A";

    if (!incs.length) {
      // Fallback: if we have no structured inconsistencies, show raw JSON.
      return JSON.stringify(src, null, 2);
    }

    let out = incs
      .map(
        (i: any) =>
          `ID: ${i.id}\nDescription: ${i.description}\nLocation: ${i.location}\nType: ${i.type}\nText:\n${i.text}`
      )
      .join("\n\n");

    out += "\n\n=== Analysis Approach ===\n" + approach;
    out += "\n\n=== Confidence ===\n" + conf;
    out += "\n\n=== Analysis Completeness ===\n" + compl;

    return out;
  };

  const initialReadable = buildReadable(content);

  // ---------------------------------------------------------------------------
  // 4. Effect – pre-fill input from Key Sections or persisted input
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // If we already have a persisted input for this step, respect it.
    if (step?.input && step.input.trim().length > 0) {
      setInputText(step.input);
      return;
    }

    // Otherwise, seed from Key Sections structured content.
    if (prevKeySectionsContent) {
      const seed = buildKeySectionsSeed(prevKeySectionsContent);
      if (seed.trim().length > 0) {
        setInputText(seed);
      }
    }
  }, [prevKeySectionsContent, step?.input]);

  // ---------------------------------------------------------------------------
  // 5. Actions – process & approve
  // ---------------------------------------------------------------------------
  const handleProcessText = async () => {
    setIsProcessing(true);
    setProcessError(null);

    try {
      // Draft save of current input & existing content
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

      const res = await fetch("/api/llm/inconsistency-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          projectId,
        }),
      });

      if (!res.ok) {
        throw new Error(`LLM error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();

      // Build a readable report from the fresh response
      const readable = buildReadable(data);

      // Store both raw JSON and readable string in the wizard store
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
          // Persist a readable string in the DB, like other steps:
          output: step?.output ?? buildReadable(content),
          content: step?.content,
          projectId,
        }),
      });

      await onApprove(phase, stepName);
    } finally {
      setIsApproving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. Layout flags & output text
  // ---------------------------------------------------------------------------
  const showOutput = hasProcessedThisSession || step?.approved;

  // For display: prefer persisted readable output, otherwise derive from content
  const outputValue = step?.output ?? initialReadable;

  // ---------------------------------------------------------------------------
  // 7. Render via shared StepLayout
  // ---------------------------------------------------------------------------
  return (
    <div>
      <StepLayout
        showOutput={showOutput}
        input={{
          title: "User Input",
          description: showOutput ? (
            <>
              Edit and click <em>Process Again</em> to re-run the inconsistency
              scan on the updated sections.
            </>
          ) : (
            <>
              Pre-filled with the sections from <em>Key Sections</em> (ID,
              Title, Content, Importance, Category). Edit if needed and click{" "}
              <em>Process Text</em> to scan for contradictions, ambiguities,
              gaps and overlaps.
            </>
          ),
          value: inputText,
          onChange: setInputText,
          processLabel: showOutput ? "Process Again" : "Process Text",
          onProcess: handleProcessText,
          isProcessing,
          disabled: !inputText.trim(),
          rows: 25,
        }}
        output={
          showOutput
            ? {
                title: "Inconsistency Report",
                description:
                  "Detected contradictions, ambiguities, gaps, overlaps and the overall analysis summary.",
                value: outputValue,
                onChange: (value: string) =>
                  onEdit(phase, stepName, content, inputText, value),
                onApprove: handleApprove,
                isApproving,
                disabled: !hasLlmRes,
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
