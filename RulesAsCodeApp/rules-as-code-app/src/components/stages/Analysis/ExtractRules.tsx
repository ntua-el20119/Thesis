"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader } from "@/components/stages/StepDataLoader";

/*
  Step 2: Extract Rules
  ---------------------
  Input:  Approved output of "Segment Text" (Step 1).
  Output: Structured JSON of rules (Obligations, Permissions, etc.).
*/

export default function ExtractRules({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;
  // Chain from Step 1 (phase 1, step 1) -> use previousKey logic if needed, 
  // but simpler to relying on StepDataLoader to find the *previous sequential step* 
  // if you passed the key correctly. Or simpler: just standard loader.
  // The Store knows sequential ordering. Key for Step 1 is "1-1".
  const io = useStepDataLoader(step, "1-1"); 
  console.log("[DEBUG] ExtractRules io.initialInput:", io.initialInput);

  const { phase, stepName, content, projectId, output: persistedOutput } = io;

  // -- Input Formatter: Turn Step 1 sections into readable text --
  function formatInput(val: any): string {
    if (!val) return "";
    
    // If it's already a string, check if it's the raw JSON of Step 1
    let parsed = val;
    if (typeof val === "string") {
      // If it looks like valid text (not JSON), just return it
      if (!val.trim().startsWith("{")) return val;
      try {
        parsed = JSON.parse(val);
      } catch {
        return val;
      }
    }

    // Check for Step 1 structure: { result: { sections: [...] } }
    const sections = parsed?.result?.sections;
    if (Array.isArray(sections)) {
      return sections
        .map(
          (s: any) =>
            `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}`
        )
        .join("\n\n");
    }

    // Fallback: just return string form
    return typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2);
  }

  const [inputText, setInputText] = useState(formatInput(io.initialInput));
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  // Keep input sync
  useEffect(() => {
    setInputText(formatInput(io.initialInput));
  }, [io.initialInput]);

  // -- View Builder: Turn JSON Rules into readable text (for the textarea) --
  function buildReadable(src: any): string {
    const result = src?.result;
    if (!result) return "";

    const entities = result.entities ?? [];
    const rules = result.rules ?? [];

    if ((!Array.isArray(entities) || entities.length === 0) && (!Array.isArray(rules) || rules.length === 0)) {
      return JSON.stringify(src, null, 2);
    }

    let output = "";

    if (Array.isArray(entities) && entities.length > 0) {
      output += "Entities\n\n";
      output += entities.map((e: any) => 
`type: ${e.type || "Unknown"}
name: ${e.name}
description: ${e.description}
source: ${e.sourceSection || "N/A"}`
      ).join("\n\n\n");
      output += "\n\n\n";
    }

    if (Array.isArray(rules) && rules.length > 0) {
      output += "Rules\n\n";
      output += rules.map((r: any) => 
`id: ${r.id}
condition: ${r.condition}
action: ${r.action}
source: ${r.sourceSection || "N/A"}
text: "${r.sourceText}"`
      ).join("\n\n\n");
    }

    return output;
  }

  const hasLlmRes = io.hasLlmContent;
  const showOutput = hasLlmRes || !!step?.output;
  // Use OR to fallback if persistedOutput is empty string (common when unwrapInputText returns "" for raw objects)
  const [outputValue, setOutputValue] = useState(
    (persistedOutput && persistedOutput.trim().length > 0) 
      ? persistedOutput 
      : buildReadable(content)
  );

  // Sync state when step/content changes (e.g. navigation)
  useEffect(() => {
    setOutputValue(
      (persistedOutput && persistedOutput.trim().length > 0) 
        ? persistedOutput 
        : buildReadable(content)
    );
  }, [persistedOutput, content]);


  // -- Handlers --
  const handleProcess = async () => {
    if (!projectId) return alert("No project selected.");
    setIsProcessing(true);
    try {
      // 1. Draft save current input
      await saveDraft();

      // 2. Call LLM
      const res = await fetch("/api/llm/extract-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, projectId }),
      });
      if (!res.ok) throw new Error(await res.text());
      
      const data = await res.json();
      const readable = buildReadable(data);

      // 3. Update Client State
      const confidence = typeof data?.confidence === 'number' ? data.confidence : null;
      
      // Update local state immediately so user sees it
      setOutputValue(readable);

      // Persist to store/DB
      onEdit(Number(phase), step.stepNumber, stepName, data, inputText, readable, confidence);
      
    } catch (err) {
      alert("Error processing rules: " + err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!projectId) return;
    setIsApproving(true);
    try {
      await saveDraft(outputValue, true); // Save with Approved=true
      await onApprove(Number(phase), step.stepNumber, stepName);
    } finally {
      setIsApproving(false);
    }
  };

  // Helper to save via /api/approve (which acts as a general 'upsert step' endpoint)
  async function saveDraft(finalOutput?: string, approved = false) {
    await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        phase,
        stepNumber: step.stepNumber,
        stepName,
        input: inputText,
        humanOutput: { text: finalOutput ?? outputValue }, // Use local outputValue
        content: step?.content,
      }),
    });
  }

  return (
    <StepLayout
      showOutput={showOutput}
      input={{
        title: "Source Attributes (Segments)",
        description: "Approved text segments from Step 1.",
        value: inputText,
        onChange: setInputText,
        processLabel: showOutput ? "Re-Extract" : "Extract Rules",
        onProcess: handleProcess,
        isProcessing,
        disabled: !inputText,
      }}
      output={
        showOutput ? {
          title: "Extracted Rules",
          description: "Atomic rules (obligations, permissions) extracted from text.",
          value: outputValue,
          onChange: setOutputValue, // Local state update only (matches Left side)
          onApprove: handleApprove,
          isApproving,
          confidence: typeof step.confidenceScore === 'number' ? step.confidenceScore : null,
        } : undefined
      }
    />
  );
}
