"use client";

import { useWizardStore } from "@/store/wizardStore";

export interface StepDataLoaderResult {
  phase: string;
  stepName: string;
  content: any;
  input?: any;
  output?: string;
  approved?: boolean;
  projectId: number | null;
  previousStep?: {
    input?: any;
    output?: any;
    content?: any;
    approved?: boolean;
  };
  initialInput: any;
  hasLlmContent: boolean;
  reviewNotes: string;
}

/**
 * unwrapInputText
 * -----------------------------------------------------------------------------
 * Extracts text from the stored input object.
 * Expected format: { text: "..." } -> "..."
 * If input is already a string, return it.
 */
export function unwrapInputText(input: any): string {
  if (input === null || input === undefined) return "";
  
  // 1. If object with .text, return it
  if (typeof input === "object" && "text" in input) {
    return String(input.text);
  }

  // 2. If it's a string, it might be the stringified wrapper from page.tsx props
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          // If it's a valid wrapper, return content
          if ("text" in parsed) {
            return String(parsed.text);
          }
          // If it's a bare object without .text (likely corrupted/raw data), return empty
          // This allows the component to fall back to the clean LLM readableOutput
          return "";
        }
      } catch {
        // Not JSON, return as plain text
      }
    }
    return input;
  }

  return "";
}

export function useStepDataLoader(
  step: any,
  previousKey?: string | null
): StepDataLoaderResult {
  const {
    phase = "",
    stepName = "",
    // DBStep fields
    llmOutput: rawLlmOutput,
    humanOutput: rawHumanOutput,
    humanModified,
    
    // Legacy/Component fields
    content: rawContent, 
    input, 
    output: rawOutput, 
    approved,
    reviewNotes,
  } = step ?? {};

  // Robust iterative parser: handle double/triple encoded JSON strings
  const iterativeParse = (val: any): any => {
    let current = val;
    // Try parsing up to 3 times to unwrap nested stringification
    for (let i = 0; i < 3; i++) {
        if (typeof current === 'string') {
            try {
                const parsed = JSON.parse(current);
                current = parsed;
            } catch {
                // If parse fails, it's just a string
                break;
            }
        } else {
            // Not a string, strict object/null/number
            break;
        }
    }
    return current;
  };

  const llmOutput = iterativeParse(rawLlmOutput);
  const humanOutput = iterativeParse(rawHumanOutput);
  const content = iterativeParse(rawContent) ?? llmOutput ?? {};

  if (stepName === "Segment Text" || stepName === "Extract Rules") {
    console.log(`[DEBUG] SDL ${stepName} Input values:`, { llmOutput, humanOutput, humanModified, rawOutput, rawContent });
  }

  // Output calculation:
  // We ignore 'rawOutput' (passed from page.tsx) because page.tsx blindly stringifies the object.
  // Instead, we always re-derive the clean string from the structured source of truth.
  const output = unwrapInputText(
    (humanModified && humanOutput) ? humanOutput : llmOutput
  );

  const projectId = useWizardStore((s) => s.projectId);
  const steps = useWizardStore((s) => s.steps);

  const previousRaw =
    previousKey && typeof previousKey === "string"
      ? (steps as any)[previousKey]
      : undefined;

  const previousStep = previousRaw
    ? {
        input: previousRaw.input,
        output: previousRaw.humanModified && previousRaw.humanOutput
            ? unwrapInputText(iterativeParse(previousRaw.humanOutput))
            : iterativeParse(previousRaw.llmOutput),
        content: iterativeParse(previousRaw.llmOutput),
        approved: previousRaw.approved,
      }
    : undefined;

  // ✅ Readable unwrapped current input (JSON -> string)
  const readableCurrentInput = unwrapInputText(input);

  let initialInput = "";

  // Approval gate: previous output becomes binding input only if approved
  // Prioritize upstream output to ensure changes in previous steps propagate downstream.
  
  if (
    previousStep?.approved &&
    previousStep.output != null &&
    String(previousStep.output).trim().length > 0
  ) {
    // 1. Fallback to previous step output (if approved)
    // If it's an object (LLM output), stringify it for the UI/TextArea, 
    // but the component (e.g. ExtractRules) can re-parse it if it wants.
    initialInput = typeof previousStep.output === "string" 
        ? previousStep.output 
        : JSON.stringify(previousStep.output, null, 2);
  } else if (readableCurrentInput.trim().length > 0) {
    // 2. Saved input exists -> Use it (restore draft/edits if no upstream or not approved)
    initialInput = readableCurrentInput;
  } else {
    // 3. Nothing to show
    initialInput = "";
  }

  const hasLlmContent =
    typeof content === "object" &&
    content !== null &&
    "result" in content &&
    typeof (content as any).result === "object" &&
    (content as any).result !== null;

  return {
    phase,
    stepName,
    content,
    input,
    output,
    approved,
    projectId,
    previousStep,
    initialInput,
    hasLlmContent,
    reviewNotes: reviewNotes ?? "",
  };
}
