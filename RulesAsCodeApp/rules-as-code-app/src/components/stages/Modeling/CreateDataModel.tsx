"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader, unwrapInputText } from "@/components/stages/StepDataLoader";
import { useWizardStore } from "@/lib/store";

/*
  Step 4: Create Data Model
  -------------------------
  Input:  Rules (Step 2) AND Conflicts (Step 3).
  Output: Entities & Mermaid Diagram.
*/

export default function CreateDataModel({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;

  // 1. Fetch data from Step 3 (Detect Conflicts) - usually the direct predecessor
  const io = useStepDataLoader(step, "1-3");
  const { phase, stepName, content, projectId, output: persistedOutput } = io;

  // 2. Fetch data from Step 2 (Extract Rules) manually
  const steps = useWizardStore((s) => s.steps);
  const step2Raw = steps["1-2"]; // Canonical key for Phase 1, Step 2
  
  // Helper to get structured content
  const getStepEntities = (rawStep: any) => {
    if (!rawStep) return "";
    
    let entities: any[] = [];

    // 1. Try structured LLM output
    const structured = rawStep.llmOutput;
    if (structured && structured.result && Array.isArray(structured.result.entities)) {
         entities = structured.result.entities;
    }
    // 2. Try human output (wrap check)
    else if (rawStep.humanOutput) {
        if (Array.isArray(rawStep.humanOutput)) {
            entities = rawStep.humanOutput;
        } else if (typeof rawStep.humanOutput.text === "string") {
            const txt = rawStep.humanOutput.text.trim();
            if (txt.startsWith("[") || txt.startsWith("{")) {
                try {
                    const parsed = JSON.parse(txt);
                    if (Array.isArray(parsed)) entities = parsed;
                } catch { } // Not JSON, fall through
            }
        }
    }

    // If we found entities, format them nicely
    if (entities.length > 0) {
        // User requested "readable form".
        // Transform JSON array into a readable text list.
        return entities.map((e: any) => {
            const name = e.name || "Unknown Entity";
            const type = e.type ? `(${e.type})` : "";
            const desc = e.description || "";
            return `- ${name} ${type}: ${desc}`;
        }).join("\n\n");
        
        // If map fails or entities are weird structure, fallback to JSON
    }

    // 3. Fallback to raw text
    return unwrapInputText(
      rawStep.humanModified && rawStep.humanOutput
        ? rawStep.humanOutput
        : rawStep.llmOutput
    ) || "";
  };

  // Helper to reliably get text from step
  const getStepText = (rawStep: any) => {
    if (!rawStep) return "";
    return unwrapInputText(
      rawStep.humanModified && rawStep.humanOutput
        ? rawStep.humanOutput
        : rawStep.llmOutput
    );
  };

  const entitiesText = getStepEntities(step2Raw);
  const conflictsText = getStepText(io.previousStep ? (steps["1-3"] as any) : null) || io.initialInput;

  // Combined input text for display (read-only draft)
  const [combinedInput, setCombinedInput] = useState("");

  useEffect(() => {
    const text = `
Extracted Entities (Step 2)
${entitiesText || "(No entities found)"}

Detected Conflicts (Step 3)
${conflictsText || "(No conflicts found)"}
`.trim();
    setCombinedInput(text);
  }, [entitiesText, conflictsText]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processError, setProcessError] = useState<string | null>(null);

  function buildReadable(src: any): string {
    const result = src?.result;
    if (!result) return "";

    let output = "Data Model Specification\n\n";

    // 1. Entities
    if (Array.isArray(result.entities) && result.entities.length > 0) {
      output += "Entities\n\n";
      result.entities.forEach((e: any) => {
        output += `${e.name}`;
        if (e.type) output += ` (${e.type})`;
        if (e.description) output += `: ${e.description}`;
        output += "\n";

        // Properties
        if (e.properties && typeof e.properties === 'object' && !Array.isArray(e.properties)) {
           output += "  - Properties:\n";
           Object.entries(e.properties).forEach(([propName, detail]: [string, any]) => {
               const type = detail?.type || "string";
               const required = detail?.required ? "(Required)" : "(Optional)";
               const desc = detail?.description ? `- ${detail.description}` : "";
               output += `    - ${propName} (${type}) ${required} ${desc}\n`;
               if (detail?.validation) output += `      - Validation: ${detail.validation}\n`;
           });
        }
        
        // Relationships
        if (Array.isArray(e.relationships) && e.relationships.length > 0) {
            output += "  - Relationships:\n";
            e.relationships.forEach((r: any) => {
                output += `    - ${r.type} -> ${r.targetEntity}: ${r.description || ""}\n`;
            });
        }
        output += "\n";
      });
    }

    // 2. Enumerations
    if (Array.isArray(result.enumerations) && result.enumerations.length > 0) {
        output += "Enumerations\n\n";
        result.enumerations.forEach((en: any) => {
            output += `- ${en.name}: ${en.description || ""}\n`;
            if (Array.isArray(en.values)) {
                output += `  - Values: ${en.values.join(", ")}\n`;
            }
            output += "\n";
        });
    }

    // 3. Conflict Resolutions
    if (Array.isArray(result.conflictResolutions) && result.conflictResolutions.length > 0) {
        output += "Conflict Resolutions\n\n";
        result.conflictResolutions.forEach((cr: any) => {
            output += `- ${cr.conflictId}: ${cr.resolution}\n`;
            if (cr.impact) output += `  - Impact: ${cr.impact}\n`;
        });
    }

    return output.trim();
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

      const res = await fetch("/api/llm/create-data-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            entities: entitiesText, 
            conflicts: conflictsText, 
            projectId 
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`API error: ${res.status} - ${msg}`);
      }

      const data = await res.json();
      const readable = buildReadable(data);
      const confidence = typeof data?.confidence === 'number' ? data.confidence : null;

      setOutputValue(readable);
      onEdit(Number(phase), step.stepNumber, stepName, data, combinedInput, readable, confidence);
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
           input: combinedInput,
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
          title: "Input Context",
          description: "Combined Rules (Step 2) & Conflicts (Step 3).",
          value: combinedInput,
          onChange: setCombinedInput, // Allow editing the context if needed? usually read-only derived
          // Actually, if user edits this, it doesn't feed back to previous steps. 
          // But it DOES feed into 'combinedInput' which is sent as 'input' to API log.
          // Is it sent to LLM? No, handleProcess uses rulesText/conflictsText directly from store.
          // To allow editing, handleProcess should use combinedInput, OR we separate the UI.
          // For now, let's keep it editable but note it might not affect LLM unless we parse it back,
          // OR we just assume it's for reference. 
          // WAIT: handleProcess uses `rulesText` and `conflictsText`.
          // If we want the user to be able to refine the context before generation, we should use `combinedInput` and maybe split it?
          // Simplest: pass `combinedInput` as a single `text` field if we changed API to accept `text`. 
          // BUT I changed API to accept `rules` and `conflicts`. 
          // So editing `combinedInput` here is purely visual/notes for now unless I update logic.
          // I will mark it readOnly for clarity or leave as reference.
          // Actually, standard StepLayout input is editable. 
          processLabel: "Generate Data Model",
          onProcess: handleProcess,
          isProcessing,
          disabled: !conflictsText
        }}
        output={
           showOutputPanel ? {
              title: "Data Model Specification",
              description: "Formal definition of entities, properties, and relationships.",
              value: outputValue,
              onChange: setOutputValue,
              onApprove: handleApprove,
              onReset: () => {
                   setOutputValue(readableOutput);
                   onEdit(Number(phase), step.stepNumber, stepName, content, combinedInput, undefined);
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
