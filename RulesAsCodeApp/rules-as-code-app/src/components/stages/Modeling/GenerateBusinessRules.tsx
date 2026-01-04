"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";

/*
  Step 5: Generate Business Rules
  -------------------------------
  Input:  Data Model (Step 4) + context implies original rules.
  Output: Executable Business Logic / Pseudo-code.
*/

export default function GenerateBusinessRules({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;

  // Chain from Step 4 (Data Model) or directly from Rules (2) + Model (4)?
  // Usually step 5 needs Rules + Model.
  // useStepDataLoader gets 2-1 (Model) by default if we ask "2-1".
  // But "phase 2 step 1" is "Create Data Model" (=4).
  // "Generate Business Rules" is phase 2 step 2 (=5).
  // So referencing "2-1" gives us the Model.
  // But we mostly need the text rules from Phase 1. 
  // However, let's treat input as the Model JSON or the Rules text?
  // The system seems linear. The user probably copies rules into input if needed, 
  // or the loader aggregates?
  // For now: Input is Step 4 output (Model).
  const io = useStepDataLoader(step, "2-1"); 

  const { phase, stepName, content, projectId, output: persistedOutput } = io;
  const [inputText, setInputText] = useState(io.initialInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    setInputText(io.initialInput);
  }, [io.initialInput]);

  function buildReadable(src: any): string {
    const rules = src?.result?.businessRules ?? [];
    if (!Array.isArray(rules) || rules.length === 0) {
      return JSON.stringify(src, null, 2);
    }
    return rules.map((br: any) => 
`// Rule: ${br.ruleId}
// Desc: ${br.description}
IF (${br.logic?.condition || "..."}) THEN
  ${br.logic?.action || "..."}
ELSE
  ${br.logic?.alternative || "..."}
END IF`
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

      const res = await fetch("/api/llm/generate-business-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: inputText, projectId }),
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
           content: content,
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
        title: "Model & Context",
        description: "Data model or augmented rules.",
        value: inputText,
        onChange: setInputText,
        processLabel: "Generate Logic",
        onProcess: handleProcess,
        isProcessing,
        disabled: !inputText
      }}
      output={
         showOutput ? {
            title: "Business Rules (e.g. DMN/Pseudocode)",
            description: "Executable decision logic.",
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

