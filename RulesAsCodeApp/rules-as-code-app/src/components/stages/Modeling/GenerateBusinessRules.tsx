"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader, unwrapInputText } from "@/components/stages/StepDataLoader";
import { useWizardStore } from "@/lib/store";

/*
  Step 5: Generate Business Rules
  -------------------------------
  Input:  Rules (Step 2) AND Data Model (Step 4).
  Output: Executable Business Logic / Pseudo-code / Tests.
*/

export default function GenerateBusinessRules({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;

  // 1. Fetch data from Step 4 (Data Model) - "2-4" in methodology
  // Note: Previous step key depends on how phases are defined.
  // Phase 2 Step 1 is "Create Data Model" in our mind, but store defines it as stepNumber 4.
  const io = useStepDataLoader(step, "2-4");
  const { phase, stepName, content, projectId, output: persistedOutput } = io;

  // 2. Fetch data from Step 2 (Extract Rules) manually
  const steps = useWizardStore((s) => s.steps);
  const step2Raw = steps["1-2"]; // Canonical key for Phase 1, Step 2

  // Helper to reliably get text
  const getStepText = (rawStep: any) => {
    if (!rawStep) return "";
    const text = unwrapInputText(
      rawStep.humanModified && rawStep.humanOutput
        ? rawStep.humanOutput
        : rawStep.llmOutput
    );
    if (text) return text;
    // Fallback: if unwrap fails (no .text), but we have structured result (e.g. unapproved Step 4)
    if (rawStep.llmOutput?.result) return JSON.stringify(rawStep.llmOutput.result, null, 2);
    return "";
  };

  // Helper to get structured entities from Step 2 (reused logic from Step 4 for consistency)
  const getStepEntities = (rawStep: any) => {
    if (!rawStep) return "";
    let entities: any[] = [];
    if (rawStep.llmOutput?.result?.entities && Array.isArray(rawStep.llmOutput.result.entities)) {
         entities = rawStep.llmOutput.result.entities;
    } else if (rawStep.humanOutput) {
         if (Array.isArray(rawStep.humanOutput)) entities = rawStep.humanOutput;
         else if (typeof rawStep.humanOutput.text === "string" && (rawStep.humanOutput.text.startsWith('[') || rawStep.humanOutput.text.startsWith('{'))) {
             try { const p = JSON.parse(rawStep.humanOutput.text); if (Array.isArray(p)) entities = p; } catch {}
         }
    }
    // Return readable list if possible, or raw text
    if (entities.length > 0) {
        return entities.map((e: any) => `- ${e.name}: ${e.description || ""}`).join("\n");
    }
    return getStepText(rawStep) || "(No rules found)";
  };

  // Specific extractor for Rules only (ignoring Entities from Step 2)
  const getRulesOnly = (rawStep: any) => {
    if (!rawStep) return "";
    
    // 1. Try human output (if edited)
    const text = unwrapInputText(rawStep.humanModified && rawStep.humanOutput ? rawStep.humanOutput : null);
    
    if (text) {
        // Try match plain "Rules" section (plain text format)
        // Look for "Rules" followed by newlines at start or after a newline
        const rulesMatch = text.match(/(?:^|\n)Rules\s*\n+([\s\S]*?)(?:$)/i);
        if (rulesMatch && rulesMatch[1]) {
             return rulesMatch[1].trim();
        }
        // Legacy fallback: === RULES ===
        const legacyMatch = text.match(/=== RULES ===([\s\S]*?)(?:===|$)/);
        if (legacyMatch && legacyMatch[1]) return legacyMatch[1].trim();

        // If valid JSON?
        if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
             try {
                const p = JSON.parse(text);
                const r = p.result?.rules ?? p.rules ?? (Array.isArray(p) ? p : []);
                if (Array.isArray(r) && r.length > 0) return r.map((x: any) => `- [${x.id}] ${x.condition} -> ${x.action}`).join("\n");
             } catch {}
        }
        return text; // Return everything if we can't split it
    }

    // 2. Fallback to LLM Output (Structure)
    const structured = rawStep.llmOutput?.result?.rules;
    if (Array.isArray(structured) && structured.length > 0) {
        return structured.map((r: any) => `- [${r.id}] ${r.condition} -> ${r.action}`).join("\n");
    }
    
    return "";
  };

  const rulesText = getRulesOnly(step2Raw);
  const dataModelText = getStepText(io.previousStep ? (steps["2-4"] as any) : null) || io.initialInput; // Step 4 output (Mermaid or JSON?)

  // Combined input text for display
  const [combinedInput, setCombinedInput] = useState("");

  useEffect(() => {
    const text = `
Extracted Rules (Step 2)
${rulesText || "(No rules found)"}

Data Model (Step 4)
${dataModelText || "(No data model found)"}
`.trim();
    setCombinedInput(text);
  }, [rulesText, dataModelText]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  
  // Local state for output editing
  const [outputValue, setOutputValue] = useState<string>("");

  useEffect(() => {
      if (typeof persistedOutput === "string" && persistedOutput.trim().length > 0) {
          setOutputValue(persistedOutput);
      } else if (io.hasLlmContent) {
          setOutputValue(buildReadable(content));
      }
  }, [persistedOutput, io.hasLlmContent, content]);

  function buildReadable(src: any): string {
    const result = src?.result;
    if (!result) return JSON.stringify(src, null, 2);

    let output = "";

    // 1. Business Rules
    if (Array.isArray(result.businessRules) && result.businessRules.length > 0) {
        output += "Business Rules\n\n";
        result.businessRules.forEach((br: any) => {
            output += `id: ${br.id}\n`;
            output += `name: ${br.name || "Untitled"}\n`;
            if (br.description) output += `description: ${br.description}\n`;
            if (br.priority) output += `priority: ${br.priority}\n`;
            if (br.category) output += `category: ${br.category}\n`;
            
            if (br.conditions && br.conditions.length > 0) {
                output += "conditions:\n";
                br.conditions.forEach((c: any) => {
                    let cond = `  - entity: ${c.entity}, property: ${c.property}, operator: ${c.operator}, value: ${c.value}`;
                    if (c.logicalOperator) cond += `, logical: ${c.logicalOperator}`;
                    output += `${cond}\n`;
                });
            }

            if (br.actions && br.actions.length > 0) {
                output += "actions:\n";
                br.actions.forEach((a: any) => {
                    output += `  - type: ${a.type}, entity: ${a.entity}, property: ${a.property}, value: ${a.value}\n`;
                });
            }
            // Adequate spacing between rules
            output += "\n\n\n";
        });
    }

    // 2. Decision Tables / Rule Categories
    if (Array.isArray(result.ruleCategories) && result.ruleCategories.length > 0) {
         output += "Rule Categories\n\n";
         result.ruleCategories.forEach((cat: any) => {
             output += `name: ${cat.name}\n`;
             if (cat.description) output += `description: ${cat.description}\n`;
             output += `rules: ${cat.rules?.join(", ")}\n\n`;
         });
         output += "\n";
    }

    // 3. Test Scenarios
    if (Array.isArray(result.testScenarios) && result.testScenarios.length > 0) {
        output += "Test Scenarios\n\n";
        result.testScenarios.forEach((ts: any) => {
            output += `id: ${ts.id}\n`;
            output += `name: ${ts.name}\n`;
            output += `type: ${ts.type}\n`;
            output += `inputData: ${JSON.stringify(ts.inputData)}\n`;
            output += `expectedOutput: ${JSON.stringify(ts.expectedOutput)}\n`;
            output += `testedRules: ${ts.testedRules?.join(", ")}\n\n`;
        });
    }

    // Fallback
    if (!output.trim()) return JSON.stringify(result, null, 2);
    return output;
  }

  const showOutputPanel = io.hasLlmContent || !!step?.output;

  const handleProcess = async () => {
    if (!projectId) return alert("No project selected.");
    setIsProcessing(true);
    try {
      // Save draft
      await fetch("/api/approve", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            projectId,
            phase,
            stepNumber: step.stepNumber,
            stepName,
            input: combinedInput,
            output: outputValue
         })
      });

      const res = await fetch("/api/llm/generate-business-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            rules: rulesText, 
            dataModel: dataModelText, 
            projectId 
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const readable = buildReadable(data);
      const confidence = typeof data?.confidence === 'number' ? data.confidence : null;

      setOutputValue(readable);
      onEdit(Number(phase), step.stepNumber, stepName, data, combinedInput, readable, confidence);
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
           input: combinedInput,
           humanOutput: { text: outputValue },
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
      showOutput={showOutputPanel}
      input={{
        title: "Input Context",
        description: "Rules (Step 2) & Data Model (Step 4).",
        value: combinedInput,
        onChange: setCombinedInput,
        processLabel: "Generate Business Rules",
        onProcess: handleProcess,
        isProcessing,
        disabled: !rulesText
      }}
      output={
         showOutputPanel ? {
            title: "Business Logic Specifications",
            description: "Formalized rules and test scenarios.",
            value: outputValue,
            onChange: (v) => {
                setOutputValue(v);
                onEdit(Number(phase), step.stepNumber, stepName, content, combinedInput, v);
            },
            onApprove: handleApprove,
            onReset: () => {
                const r = buildReadable(content);
                setOutputValue(r);
                onEdit(Number(phase), step.stepNumber, stepName, content, combinedInput, r);
            },
            isApproving,
            confidence: typeof step.confidenceScore === 'number' ? step.confidenceScore : null,
         } : undefined
      }
    />
  );
}
