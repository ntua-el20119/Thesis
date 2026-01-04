"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";

/*
  Step 3: Detect Conflicts
  ------------------------
  Input:  Approved Rules from Step 2.
  Output: Analysis of contradictions/gaps.
*/

export default function DetectConflicts({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;

  // Chain from previous
  const io = useStepDataLoader(step, "1-2"); // Expects output of Extract Rules

  const { phase, stepName, content, projectId, output: persistedOutput } = io;

  const [inputText, setInputText] = useState(io.initialInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  useEffect(() => {
    setInputText(io.initialInput);
  }, [io.initialInput]);

  function buildReadable(src: any): string {
    const conflicts = src?.result?.conflicts ?? [];
    if (!Array.isArray(conflicts) || conflicts.length === 0) {
      if (src && src.result && src.result.noConflicts) return "No conflicts detected.";
      // If result is empty object or null, return empty string
      if (!src || Object.keys(src).length === 0) return "";
      return JSON.stringify(src, null, 2);
    }
    
    return conflicts.map((c: any) =>
`id: ${c.id}
type: ${c.type}
severity: ${c.severity}
description: ${c.description}
affectedRules: ${c.affectedRules?.join(", ") || "N/A"}
affectedEntities: ${c.affectedEntities?.join(", ") || "N/A"}
sourceText: "${c.sourceText || "N/A"}"
resolution: ${c.resolutionStrategy}`
    ).join("\n\n\n");
  }

  const hasLlmResponse = io.hasLlmContent || !!step?.output;
  const readableOutput = hasLlmResponse ? buildReadable(content) : "";

  // Local state for output editing
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


  const handleProcess = async () => {
    if (!projectId) return alert("No project selected.");
    setIsProcessing(true);
    setProcessError(null);

    try {
      // Save input draft before processing
      await fetch("/api/approve", { 
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            projectId,
            phase,
            stepNumber: step.stepNumber,
            stepName,
            input: inputText,
            output: outputValue // Save current draft
         })
      });

      const res = await fetch("/api/llm/detect-conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, projectId }), // Note: API expects 'text', not 'rules'
      });

      if (!res.ok) {
         const msg = await res.text();
         throw new Error(`API error: ${res.status} - ${msg}`);
      }
      
      const data = await res.json();
      const readable = buildReadable(data);
      const confidence = typeof data?.confidence === 'number' ? data.confidence : null;

      // Update local state immediately
      setOutputValue(readable);

      // Persist
      onEdit(Number(phase), step.stepNumber, stepName, data, inputText, readable, confidence);
    } catch (err) {
      setProcessError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const finalOutput = (outputValue ?? "").trim();
      if (!finalOutput) {
          alert("Nothing to approve yet.");
          return;
      }

      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           projectId,
           phase,
           stepNumber: step.stepNumber,
           stepName,
           input: inputText,
           humanOutput: { text: finalOutput },
           content: step?.content,
           approved: true
        })
      });
      await onApprove(Number(phase), step.stepNumber, stepName);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setIsApproving(false);
    }
  };

  const showOutputPanel = hasLlmResponse || !!step?.output;

  return (
    <div>
      <StepLayout
        showOutput={showOutputPanel}
        input={{
          title: "Extracted Rules",
          description: "Rules from Step 2.",
          value: inputText,
          onChange: setInputText,
          processLabel: "Detect Conflicts",
          onProcess: handleProcess,
          isProcessing,
          disabled: !inputText.trim()
        }}
        output={
           showOutputPanel ? {
              title: "Conflict Analysis",
              description: "Review detected contradictions and gaps.",
              value: outputValue,
              onChange: setOutputValue, // Local state
              onApprove: handleApprove,
              onReset: () => {
                  setOutputValue(readableOutput);
                  onEdit(Number(phase), step.stepNumber, stepName, content, inputText, undefined);
              },
              isApproving,
              confidence: typeof step.confidenceScore === 'number' ? step.confidenceScore : null,
           } : undefined
        }
      />
      {processError && (
        <p className="mt-2 text-sm text-red-500">{processError}</p>
      )}
    </div>
  );
}
