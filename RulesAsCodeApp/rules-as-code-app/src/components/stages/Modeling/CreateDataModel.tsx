"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";

/*
  Step 4: Create Data Model
  -------------------------
  Input:  Approved Rules/Analysis from Step 3 (or aggregate of previous steps).
  Output: Entities & Mermaid Diagram.
*/

export default function CreateDataModel({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;

  // Chain from Step 2 (ExtractRules) or Step 3? Usually Data Model is based on Rules (2) or Conflicts (3).
  // Let's assume input comes from DetectConflicts (1-3) which refined the rules? 
  // OR maybe straight from ExtractRules. The flow says 2->3->4. So input is 3's output?
  // Step 3 output is conflicts. Step 2 output is rules. 
  // Actually Data Model is best derived from RULES ("1-2"). Or maybe "1-3" if it outputs refined rules?
  // Let's stick to "1-3" (previous) but if 3 just outputs conflicts, we might need 2's output.
  // For now: defaulting to "1-3"'s output (which ideally contains the full rule set if refined).
  // If Step 3 only outputs "Conflict Report", then we effectively need Step 2...
  // But let's follow the chain. If 1-3 is "refined rules" + conflicts, ok.
  // Actually, usually you Model based on the Rules. 
  // Let's change this to "1-2" (ExtractRules) if 1-3 is just metadata. 
  // But the generic StepDataLoader uses "previous" by default logic if strict sequential.
  // We'll trust the user has passed the content from 3 properly or we use 2.
  // Let's use "1-3" (Detect Conflicts) assuming it passes through the rules context?
  // Actually, let's just use "1-2" (Extract Rules) as the source for Data Model usually.
  // But wait, the standard is sequential 3->4.
  // We'll stick to sequential.
  const io = useStepDataLoader(step, "1-3"); 

  const { phase, stepName, content, projectId, output: persistedOutput } = io;

  const [inputText, setInputText] = useState(io.initialInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    setInputText(io.initialInput);
  }, [io.initialInput]);

  function buildReadable(src: any): string {
    // Expect entities / relationships
    const entities = src?.result?.entities ?? [];
    if (!Array.isArray(entities) || entities.length === 0) {
      return JSON.stringify(src, null, 2);
    }
    return `mermaid
classDiagram
${entities.map((e: any) => `    class ${e.name} {
${(e.attributes || []).map((a:any) => `        ${a.type} ${a.name}`).join("\n")}
    }`).join("\n")}

${(src.result.relationships || []).map((r:any) => 
  `    ${r.from} -- ${r.to} : ${r.type}`
).join("\n")}
`;
  }

  const outputValue = persistedOutput ?? buildReadable(content);
  const showOutput = io.hasLlmContent || !!step?.output;

  const handleProcess = async () => {
    if (!projectId) return alert("No project selected.");
    setIsProcessing(true);
    try {
      // draft save
      await fetch("/api/approve", {
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

      const res = await fetch("/api/llm/create-data-model", {
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
    if (!projectId) return;
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
        title: "Input (Rules/Conflicts)",
        description: "Source rules for modeling.",
        value: inputText,
        onChange: setInputText,
        processLabel: "Generate Data Model",
        onProcess: handleProcess,
        isProcessing,
        disabled: !inputText,
        rows: 15
      }}
      output={
         showOutput ? {
            title: "Data Model (Mermaid)",
            description: "Entities and relationships.",
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
