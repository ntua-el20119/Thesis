"use client";

import { useWizardStore } from "@/lib/store";

/**
 * StepDataLoader.ts
 * -----------------------------------------------------------------------------
 * Provides a unified interface for:
 *   - reading the current step
 *   - reading the previous step (optional)
 *   - computing a canonical initialInput value
 *   - exposing projectId and LLM-content flags
 *
 * NOTE:
 *   This file DOES NOT fetch data from the database.
 *   It ONLY reads data already loaded into the Zustand store.
 */
export interface StepDataLoaderResult {
  phase: string;
  stepName: string;
  content: any;
  input?: string;
  output?: string;
  approved?: boolean;

  projectId: number | null;

  previousStep?: {
    input?: string;
    output?: string;
    content?: any;
    approved?: boolean;
  };

  /**
   * Standard initial input rules:
   * 1. If DB-saved step.input exists → use it.
   * 2. Else if previousStep.output exists → use that.
   * 3. Else → "".
   */
  initialInput: string;

  /**
   * Whether the step has structured LLM content:
   * i.e. content.result exists and is an object.
   */
  hasLlmContent: boolean;
}

export function useStepDataLoader(
  step: any,
  previousKey?: string | null
): StepDataLoaderResult {
  const {
    phase = "",
    stepName = "",
    content = {},
    input,
    output,
    approved,
  } = step ?? {};

  //Hooks are called unconditionally and in the same order
  const projectId = useWizardStore((s) => s.projectId);
  const steps = useWizardStore((s) => s.steps);

  // Conditional logic is applied to the *result*, not to the hook call
  const previousRaw =
    previousKey && typeof previousKey === "string"
      ? steps[previousKey]
      : undefined;

  const previousStep = previousRaw
    ? {
        input: previousRaw.input,
        output: previousRaw.output,
        content: previousRaw.content,
        approved: previousRaw.approved,
      }
    : undefined;

  let initialInput: string;

  if (previousKey && previousStep?.output) {
    // For non-first steps: always follow the approved output of the previous step
    initialInput = previousStep.output;
  } else if (typeof input === "string" && input.trim().length > 0) {
    // For the first step (or if no previous output exists): use this step's saved input
    initialInput = input;
  } else {
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
  };
}
