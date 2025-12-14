"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";

/**
 * PreparationInconsistencyCategorisation
 * ---------------------------------------------------------------------------
 * Purpose:
 *   Implements the "Inconsistency Categorisation" step in the Preparation phase.
 *   It takes the structured inconsistencies from the previous step
 *   ("Inconsistency Scan"), provides them as input to the LLM, and displays
 *   the categorisation / prioritisation report produced by the LLM.
 */
export default function PreparationInconsistencyCategorisation({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  // ---------------------------------------------------------------------------
  // 1. Unified data access: current + previous step via StepDataLoader
  //    Previous step: "Preparation-Inconsistency Scan"
  // ---------------------------------------------------------------------------
  const io = useStepDataLoader(step, "Preparation-Inconsistency Scan");

  const {
    phase,
    stepName,
    content,
    projectId,
    previousStep,
    output: persistedOutput,
    hasLlmContent,
  } = io;

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

  /**
   * Build the text fed into the inconsistency categorisation LLM from the
   * structured "Inconsistency Scan" JSON.
   * We focus on the core attributes of each inconsistency.
   * It is intentionally tolerant to schema differences from the scan step.
   */
  function buildInconsistencySeed(src: any): string {
    const incs =
      src?.result?.inconsistencies ??
      src?.result?.issues ??
      src?.inconsistencies ??
      [];

    if (!Array.isArray(incs) || incs.length === 0) return "";

    return incs
      .map((i: any) => {
        const id = i.id ?? i.inconsistencyId ?? "N/A";
        const description = i.description ?? i.summary ?? "N/A";
        const location = i.location ?? i.sectionId ?? "N/A";
        const type = i.type ?? i.category ?? "N/A";
        const text = i.text ?? i.snippet ?? "";

        return (
          `Inconsistency ID: ${id}\n` +
          `Description: ${description}\n` +
          `Location: ${location}\n` +
          `Type: ${type}\n` +
          (text ? `Text:\n${text}` : "")
        );
      })
      .join("\n\n");
  }

  /**
   * buildReadable
   * -------------------------------------------------------------------------
   * Human-readable categorisation report from this step's `content`.
   *
   * Expected LLM response shape (from your prompt):
   * {
   *   "result": {
   *     "categorizedInconsistencies": {
   *       "contradictions": [ { ... } ],
   *       "ambiguities": [ { ... } ],
   *       "gaps": [ { ... } ],
   *       "overlaps": [ { ... } ]
   *     },
   *     "categorizationStrategy": "..."
   *   },
   *   "confidence": number
   * }
   *
   * Each inconsistency item:
   * {
   *   "id": "...",
   *   "description": "...",
   *   "severity": "HIGH|MEDIUM|LOW",
   *   "affectedSections": ["sec-1", "sec-2"],
   *   "implementationImpact": "..."
   * }
   *
   * If the structure is missing, we fall back to raw JSON.
   */
  function buildReadable(src: any): string {
    const categorized = src?.result?.categorizedInconsistencies;
    const strategy =
      src?.result?.categorizationStrategy ??
      src?.categorizationStrategy ??
      "N/A";
    const conf =
      typeof src?.confidence !== "undefined" ? src.confidence : "N/A";

    if (!categorized || typeof categorized !== "object") {
      // Fallback: if we have no structured categories, show raw JSON.
      return JSON.stringify(src, null, 2);
    }

    const groups: Array<[string, keyof typeof categorized]> = [
      ["Contradictions", "contradictions"],
      ["Ambiguities", "ambiguities"],
      ["Gaps", "gaps"],
      ["Overlaps", "overlaps"],
    ];

    const blocks: string[] = [];

    for (const [label, key] of groups) {
      const arr = (categorized as any)[key];

      if (!Array.isArray(arr) || arr.length === 0) continue;

      const itemsBlock = arr
        .map((item: any, idx: number) => {
          const id = item.id ?? "N/A";
          const description = item.description ?? "N/A";
          const severity = item.severity ?? "N/A";
          const affectedSections = Array.isArray(item.affectedSections)
            ? item.affectedSections.length > 0
              ? item.affectedSections.join(", ")
              : "N/A"
            : "N/A";
          const implementationImpact = item.implementationImpact ?? "N/A";

          return (
            `(${idx + 1}) ID: ${id}\n` +
            `Description: ${description}\n` +
            `Severity: ${severity}\n` +
            `Affected Sections: ${affectedSections}\n` +
            `Implementation Impact: ${implementationImpact}`
          );
        })
        .join("\n\n");

      blocks.push(`=== ${label} ===\n${itemsBlock}`);
    }

    if (blocks.length === 0) {
      // No categorized lists populated; again, fallback to raw JSON
      return JSON.stringify(src, null, 2);
    }

    let out = blocks.join("\n\n");
    out += "\n\n=== Categorisation Strategy ===\n" + strategy;
    out += "\n\n=== Confidence ===\n" + conf;

    return out;
  }

  const hasLlmRes =
    hasLlmContent &&
    !!(content as any)?.result?.categorizedInconsistencies &&
    Object.values(
      (content as any).result.categorizedInconsistencies as Record<
        string,
        unknown
      >
    ).some((v) => Array.isArray(v) && v.length > 0);

  const initialReadable = buildReadable(content);

  // ---------------------------------------------------------------------------
  // 4. Effect – pre-fill input from Inconsistency Scan or persisted input
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // If we already have a persisted input for this step, respect it.
    if (step?.input && step.input.trim().length > 0) {
      setInputText(step.input);
      return;
    }

    // Otherwise, seed from "Inconsistency Scan" structured content.
    if (previousStep?.content) {
      const seed = buildInconsistencySeed(previousStep.content);
      if (seed.trim().length > 0) {
        setInputText(seed);
      }
    }
  }, [step?.input, previousStep?.content]);

  // ---------------------------------------------------------------------------
  // 5. Actions – process & approve
  // ---------------------------------------------------------------------------
  const handleProcessText = async () => {
    if (!projectId) {
      alert("No project selected.");
      return;
    }

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

      const res = await fetch("/api/llm/inconsistency-categorisation", {
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
    if (!projectId) {
      alert("No project selected.");
      return;
    }

    setIsApproving(true);

    try {
      const finalOutput = persistedOutput ?? buildReadable(content);

      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          stepName,
          input: inputText,
          // Persist a readable string in the DB, like other steps:
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

  // ---------------------------------------------------------------------------
  // 6. Layout flags & output text
  // ---------------------------------------------------------------------------
  const showOutput = hasProcessedThisSession || step?.approved;

  // For display: prefer persisted readable output, otherwise derive from content
  const outputValue = persistedOutput ?? initialReadable;

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
              Edit and click <em>Process Again</em> to re-run the categorisation
              on the updated inconsistency list.
            </>
          ) : (
            <>
              Pre-filled with the inconsistencies detected in{" "}
              <em>Inconsistency Scan</em> (ID, Description, Location, Type,
              Text). Edit if needed and click <em>Process Text</em> to generate
              a structured categorisation and severity assessment.
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
                title: "Inconsistency Categorisation Report",
                description:
                  "Categories (contradictions, ambiguities, gaps, overlaps), severity levels and implementation impact for each detected inconsistency.",
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
