"use client";

import { StepEditorProps } from "@/lib/types";
import { useEffect, useState } from "react";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";

import { useWizardStore } from "@/store/wizardStore";

/**
 * Phase1SegmentText
 * -----------------------------------------------------------------------------
 * Step 1 of the (new) 5-step methodology.
 *
 * Responsibilities:
 *   - Accept raw legal text from the user.
 *   - Call /api/llm/segment-text to segment into sections.
 *   - Produce a readable "approved output" for downstream steps.
 */
export default function SegmentText({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;

  const { apiKey, llmModel } = useWizardStore();

  // Step 1 → no previous step
  const io = useStepDataLoader(step, null);

  const { phase, stepName, content, projectId, output: persistedOutput, reviewNotes: persistedNotes } = io;

  const [inputText, setInputText] = useState(io.initialInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState(persistedNotes || "");

  useEffect(() => {
    if (persistedNotes !== reviewNotes) setReviewNotes(persistedNotes || "");
  }, [persistedNotes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result && typeof evt.target.result === 'string') {
        setInputText(evt.target.result);
      }
    };
    reader.readAsText(file);
    // Reset file input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  useEffect(() => {
    setInputText(io.initialInput);
  }, [io.initialInput]);

  function buildReadable(src: any): string {
    const sections = src?.result?.sections ?? [];
    if (!Array.isArray(sections) || sections.length === 0) {
      return JSON.stringify(src, null, 2);
    }

    return sections
      .map(
        (s: any) =>
          `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${
            s.content
          }\nReference ID: ${s.referenceId || "None"}`
      )
      .join("\n\n");
  }

  const hasLlmResponse =
    io.hasLlmContent &&
    typeof content === "object" &&
    content !== null &&
    Object.keys(content as any).length > 0;

  const readableOutput = hasLlmResponse ? buildReadable(content) : "";

  const [outputValue, setOutputValue] = useState(
    (typeof persistedOutput === "string" && persistedOutput.trim().length > 0)
      ? persistedOutput
      : readableOutput
  );

  useEffect(() => {
    setOutputValue(
      (typeof persistedOutput === "string" && persistedOutput.trim().length > 0)
        ? persistedOutput
        : readableOutput
    );
  }, [persistedOutput, readableOutput]); 
  // Dependency on readableOutput handles re-renders when LLM content updates

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
        headers: { 
          "Content-Type": "application/json",
          "X-OpenRouter-Key": apiKey || "",
          "X-LLM-Model": llmModel || "",
        },
        body: JSON.stringify({ projectId, text: inputText }),
        cache: "no-store",
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(`API error: ${response.status} - ${msg}`);
      }

      const data = await response.json();
      const outputText = buildReadable(data);

      const confidence = typeof data?.confidence === 'number' ? data.confidence : null;

      // Update local UI immediately
      setOutputValue(outputText);

      // Persist to store (and DB via onEdit)
      onEdit(
        Number(phase),
        step.stepNumber,
        stepName,
        data,
        inputText,
        outputText,
        confidence,
        reviewNotes
      );
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

    const finalOutput = (outputValue ?? "").trim();
    if (!finalOutput) {
      alert("Nothing to approve yet. Please process the text first.");
      return;
    }

    setIsApproving(true);
    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          phase: Number(phase),
          stepNumber: step.stepNumber,
          stepName,
          input: inputText,
          humanOutput: { text: finalOutput }, // Fix: Send humanOutput for persistence
          content: step?.content,
          reviewNotes,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Approve failed: ${res.status} - ${msg}`);
      }

      await onApprove(Number(phase), step.stepNumber, stepName);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Unknown approve error");
    } finally {
      setIsApproving(false);
    }
  };

  const showOutput = hasLlmResponse || !!step?.output;

  return (
    <div>
      <StepLayout
        showOutput={showOutput}
        input={{
          title: "Original Legal Text",
          description: (
            <>
              {showOutput
                ? "Change text and click Process Again to re-segment it."
                : "Paste the legal text below, or import a text file, then press Process Text."}
            </>
          ),
          actions: (
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium text-slate-300 transition-colors shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              Import File
              <input
                type="file"
                accept=".txt,.md,.json,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
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
          showOutput ? {
            title: "Segmented Text",
            description: "This is the segmented text. You can edit segments.",
            value: outputValue,
            onChange: (v) => {
               setOutputValue(v);
               onEdit(Number(phase), step.stepNumber, stepName, content, inputText, v, typeof step?.confidenceScore === 'number' ? step.confidenceScore : null, reviewNotes);
            }, // Local state only + Persistence
            onApprove: handleApprove,
            onReset: () => {
               // Reset by sending undefined output to onEdit (clearing DB)
               // AND resetting local state to original readableOutput
               setOutputValue(readableOutput);
               onEdit(Number(phase), step.stepNumber, stepName, content, inputText, undefined);
            },
            isApproving: false,
            confidence: typeof step?.confidenceScore === 'number' ? step.confidenceScore : null,
          } : undefined
        }
        reviewNotes={{
          value: reviewNotes,
          onChange: (val) => {
            setReviewNotes(val);
             // Optional: Sync draft to store on change
            onEdit(Number(phase), step.stepNumber, stepName, content, inputText, outputValue, typeof step?.confidenceScore === 'number' ? step.confidenceScore : null, val);
          },
          stepName: stepName
        }}
      />

      {processError && (
        <p className="mt-2 text-sm text-red-500">{processError}</p>
      )}
      {processError && (
        <p className="mt-2 text-sm text-red-500">{processError}</p>
      )}
    </div>
  );
}
