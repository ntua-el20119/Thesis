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

  useEffect(() => {
    setInputText(io.initialInput);
  }, [io.initialInput]);

  function buildReadable(src: any): string {
    const conflicts = src?.result?.conflicts ?? [];
    if (!Array.isArray(conflicts) || conflicts.length === 0) {
      if (src && src.result && src.result.noConflicts) return "No conflicts detected.";
      return JSON.stringify(src, null, 2);
    }
    return conflicts.map((c: any) =>
`[CONFLICT] ${c.id}
Type: ${c.type}
Severity: ${c.severity}
Description: ${c.description}
Rules Involved: ${c.rulesInvolved?.join(", ")}
Recommendation: ${c.resolutionSuggestion}
----------------------------------------`
    ).join("\n\n");
  }

  const outputValue = persistedOutput ?? buildReadable(content);
  const showOutput = io.hasLlmContent || !!step?.output;

  const handleProcess = async () => {
    if (!projectId) return alert("No project selected.");
    setIsProcessing(true);
    try {
      await fetch("/api/approve", { // draft save
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            projectId,
            phase,
            stepNumber: step.stepNumber,
            stepName,
            input: inputText,
            output: outputValue
         })
      });

      const res = await fetch("/api/llm/detect-conflicts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules: inputText, projectId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const readable = buildReadable(data);

      const confidence = typeof data?.confidence === 'number' ? data.confidence : null;

      onEdit(Number(phase), step.stepNumber, stepName, data, inputText, readable, confidence);
    } catch (err) {
      alert("Error: " + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // Upsert full state
      await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           projectId,
           phase,
           stepNumber: step.stepNumber,
           stepName,
           input: inputText,
           humanOutput: { text: outputValue }, // Fix: Send humanOutput
           content: step?.content,
           approved: true
        })
      });
      await onApprove(Number(phase), step.stepNumber, stepName);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <StepLayout
      showOutput={showOutput}
      input={{
        title: "Extracted Rules",
        description: "Rules from Step 2.",
        value: inputText,
        onChange: setInputText,
        processLabel: "Detect Conflicts",
        onProcess: handleProcess,
        isProcessing,
        disabled: !inputText
      }}
      output={
         showOutput ? {
            title: "Conflict Report",
            description: "Logical inconsistencies found.",
            value: outputValue,
            onChange: (v) => onEdit(Number(phase), step.stepNumber, stepName, content, inputText, v),
            onApprove: handleApprove,
            isApproving,
            confidence: typeof step.confidenceScore === 'number' ? step.confidenceScore : null,
         } : undefined
      }
    />
  );
}
