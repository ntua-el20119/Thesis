"use client";

import { useState, useEffect } from "react";
import { StepEditorProps } from "@/lib/types";
import { StepLayout } from "@/components/stages/StepLayout";
import { useStepDataLoader, unwrapInputText } from "@/components/stages/StepDataLoader";
import { useWizardStore } from "@/lib/store";

/*
  Step 6: Generate GoRules Format
  -------------------------------
  Input:  Business Rules (Step 5) AND Data Model (Step 4).
  Output: GoRules decision graph JSON.
*/

export default function GenerateGoRules({
  step,
  onEdit,
  onApprove,
}: StepEditorProps) {
  if (!step) return null;

  // 1. Fetch data from Step 5 (Business Rules) to use as INPUT
  const previousStepIO = useStepDataLoader(step, "2-5");
  
  // 2. Current Step State (Step 6) comes from props or store lookup (props is simpler/sufficient here)
  const { 
      phase, 
      stepNumber, 
      stepName, 
      content: currentContent, 
      output: currentHumanOutput, 
      reviewNotes: currentReviewNotes 
  } = step;

  // 3. Get Project ID from store (global context)
  const projectId = useWizardStore(s => s.projectId);

  // 4. Fetch data from Step 4 (Data Model) manually - "2-4"
  const steps = useWizardStore((s) => s.steps);
  const step4Raw = steps["2-4"]; 

  // Helper to reliably get text
  const getStepText = (rawStep: any) => {
    if (!rawStep) return "";
    const text = unwrapInputText(
      rawStep.humanModified && rawStep.humanOutput
        ? rawStep.humanOutput
        : rawStep.llmOutput
    );
    if (text) return text;
    // Fallback: structured result
    if (rawStep.llmOutput?.result) return JSON.stringify(rawStep.llmOutput.result, null, 2);
    return "";
  };


  // Specific extractor to get ONLY businessRules from Step 5, excluding categories/tests
  const getBusinessRulesOnly = (rawStep: any) => {
    if (!rawStep) return "";
    
    // 1. Get the raw text content (whether it's JSON or human-readable text)
    // Note: Step 5 humanOutput is typically the readable text string.
    let content = rawStep.humanModified && rawStep.humanOutput ? rawStep.humanOutput : rawStep.llmOutput;
    const text = unwrapInputText(content);
    
    // 2. Try to parse as JSON first (if it looks like JSON)
    if (text && (text.trim().startsWith("{") || text.trim().startsWith("["))) {
        try {
            const p = JSON.parse(text);
            const r = p.result ?? p;
            if (r.businessRules && Array.isArray(r.businessRules)) {
                return JSON.stringify(r.businessRules, null, 2);
            }
        } catch {}
    }

    // 3. Regex extraction for the Readable format
    // Match anything after "Business Rules" headers, until we hit "Rule Categories" or "Test Scenarios"
    // or the end of the string.
    // We match "Business Rules" followed by newlines at the start or after a newline.
    const ruleSectionMatch = text.match(/(?:^|\n)Business Rules\s*\n+([\s\S]*?)(?=(?:\nRule Categories|\nTest Scenarios|$))/i);
    
    if (ruleSectionMatch && ruleSectionMatch[1]) {
        return ruleSectionMatch[1].trim();
    }
    
    // 4. Fallback: if we see "Rule Categories", just chop it off
    if (text.match(/Rule Categories/i) || text.match(/Test Scenarios/i)) {
       const split1 = text.split(/\nRule Categories/i)[0];
       const split2 = split1.split(/\nTest Scenarios/i)[0];
       return split2.trim();
    }
    
    return text || "";
  };

  const businessRulesText = getBusinessRulesOnly(previousStepIO.previousStep ? (steps["2-5"] as any) : null) || previousStepIO.initialInput;
  const dataModelText = getStepText(step4Raw);

  // Combined input text for display
  const [combinedInput, setCombinedInput] = useState("");

  useEffect(() => {
    const text = `
Business Rules (Step 5)
${businessRulesText || "(No business rules found)"}

Data Model (Step 4)
${dataModelText || "(No data model found)"}
`.trim();
    setCombinedInput(text);
  }, [businessRulesText, dataModelText]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(currentReviewNotes || "");

  useEffect(() => {
      if (currentReviewNotes !== reviewNotes) setReviewNotes(currentReviewNotes || "");
  }, [currentReviewNotes]);
  
  // Helper: aggressively unwrap nested stringified JSON (common from LLM providers)
  const unwrapGoRulesOutput = (raw: any): string => {
      try {
          if (!raw) return "";
          
          let obj = raw;
          // 1. If string, parse to object
          if (typeof raw === "string") {
              try {
                  obj = JSON.parse(raw);
              } catch {
                  return raw; // Not JSON, return as is
              }
          }
          
          // 2. Handle { result: ... } wrapper from some APIs
          if (obj && typeof obj === 'object' && 'result' in obj) {
              return unwrapGoRulesOutput(obj.result);
          }

          // 3. Handle { text: "..." } wrapper (the issue at hand)
          if (obj && typeof obj === 'object' && 'text' in obj && typeof obj.text === 'string') {
               try {
                  const inner = JSON.parse(obj.text);
                  return JSON.stringify(inner, null, 2);
               } catch {
                  return obj.text;
               }
          }

          // 4. Return pretty-printed object
          return JSON.stringify(obj, null, 2);
      } catch (err) {
          return typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
      }
  };

  // Local state for output editing
  const [outputValue, setOutputValue] = useState<string>("");

  useEffect(() => {
      // Prioritize human output if it exists, but UNWRAP it just in case it was saved in a wrapped state
      if (typeof currentHumanOutput === "string" && currentHumanOutput.trim().length > 0) {
          setOutputValue(unwrapGoRulesOutput(currentHumanOutput));
      } else if (currentContent) {
          setOutputValue(unwrapGoRulesOutput(currentContent));
      }
  }, [currentHumanOutput, currentContent]);

  const showOutputPanel = (!!currentContent && Object.keys(currentContent).length > 0) || !!currentHumanOutput;

  const handleProcess = async () => {
    if (!projectId) return alert("No project selected.");
    setIsProcessing(true);
    try {
      // Save draft (optional but good practice)
      await fetch("/api/approve", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            projectId,
            phase,
            stepNumber: step.stepNumber,
            stepName,
            input: combinedInput,
            output: outputValue,
            reviewNotes
         })
      });

      const res = await fetch("/api/llm/generate-gorules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            businessRules: businessRulesText, 
            dataModel: dataModelText, 
            projectId 
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      // Use the helper to ensure we get clean string
      const readable = unwrapGoRulesOutput(data);
      const confidence = typeof data?.confidence === 'number' ? data.confidence : null;

      setOutputValue(readable);
      onEdit(Number(phase), step.stepNumber, stepName, data, combinedInput, readable, confidence, reviewNotes);
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
           content: currentContent,
           approved: true,
           reviewNotes
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
        description: "Business Rules from Step 5 & Data Model from Step 4.",
        value: combinedInput,
        onChange: setCombinedInput,
        processLabel: "Generate GoRules Graph",
        onProcess: handleProcess,
        isProcessing,
        disabled: !businessRulesText
      }}
      output={
         showOutputPanel ? {
            title: "GoRules Decision Graph",
            description: "JSON content for GoRules decision engine.",
            value: outputValue,
            onChange: (v) => {
                setOutputValue(v);
                onEdit(Number(phase), step.stepNumber, stepName, currentContent, combinedInput, v, typeof step?.confidenceScore === 'number' ? step.confidenceScore : null, reviewNotes);
            },
            onApprove: handleApprove,
            onReset: () => {
                const c = currentContent as any;
                const r = JSON.stringify(c?.result ?? c, null, 2);
                setOutputValue(r);
                onEdit(Number(phase), step.stepNumber, stepName, currentContent, combinedInput, r, typeof step?.confidenceScore === 'number' ? step.confidenceScore : null, reviewNotes);
            },
            isApproving,
            confidence: typeof step.confidenceScore === 'number' ? step.confidenceScore : null,
          } : undefined
       }
       reviewNotes={{
          value: reviewNotes,
          onChange: (val) => {
            setReviewNotes(val);
            onEdit(Number(phase), step.stepNumber, stepName, currentContent, combinedInput, outputValue, typeof step?.confidenceScore === 'number' ? step.confidenceScore : null, val);
          },
          stepName: stepName
       }}
    />
  );
}
