"use client";

import { useWizardStore } from "@/lib/store";

/**
 * StepDataLoader.ts (updated)
 * -----------------------------------------------------------------------------
 * Unified interface for:
 *   - reading current step
 *   - reading previous step (optional)
 *   - computing a canonical initialInput
 *
 * RULE (approval gate):
 *   - If previous step exists, we ONLY use its output if it is APPROVED.
 *     Otherwise, initialInput falls back to this step's saved input (if any).
 *
 * IMPORTANT UPDATE:
 * - In the new DB schema, "input" is stored as JSON, typically:
 *     input: { text: "<plain text>" }
 * - Therefore, the loader must "unwrap" that JSON and return a readable string
 *   for UI display (textarea expects string).
 */

export interface StepDataLoaderResult {
  phase: string;
  stepName: string;
  content: any;

  // NOTE: these may not always be plain strings anymore (DB stores JSON),
  // but we keep them as-is for downstream use. initialInput is the readable string.
  input?: any;
  output?: string;
  approved?: boolean;

  projectId: number | null;

  previousStep?: {
    input?: any;
    output?: string;
    content?: any;
    approved?: boolean;
  };

  /**
   * Standard initial input rules:
   * 1. If previousStep exists AND is approved AND previousStep.output exists → use it.
   * 2. Else if this step.input exists → use the readable unwrapped input text.
   * 3. Else → "".
   */
  initialInput: string;

  /**
   * Whether the step has structured LLM content:
   * i.e. content.result exists and is an object.
   */
  hasLlmContent: boolean;
}

/**
 * unwrapInputText
 * -----------------------------------------------------------------------------
 * Converts stored JSON input (e.g., { text: "..." }) to a readable string.
 *
 * Handles:
 * - Correct form: { text: "plain..." }
 * - Legacy/buggy form: { text: "{ \"text\": \"plain...\" }" } (double-wrapped)
 * - Legacy/buggy form: "{\"text\":\"plain...\"}" (stringified JSON)
 * - Plain string input
 */
function unwrapInputText(input: unknown): string {
  if (input == null) return "";

  // Case A: plain string or JSON-string
  if (typeof input === "string") {
    const s = input.trim();

    // If it looks like JSON, try parsing and unwrap recursively
    if (
      (s.startsWith("{") && s.endsWith("}")) ||
      (s.startsWith("[") && s.endsWith("]"))
    ) {
      try {
        return unwrapInputText(JSON.parse(s));
      } catch {
        // Not valid JSON; treat as plain text
        return input;
      }
    }

    return input;
  }

  // Case B: object form, likely { text: ... }
  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;
    if ("text" in obj) {
      return unwrapInputText(obj.text);
    }
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
    content = {},
    input,
    output,
    approved,
  } = step ?? {};

  const projectId = useWizardStore((s) => s.projectId);
  const steps = useWizardStore((s) => s.steps);

  const previousRaw =
    previousKey && typeof previousKey === "string"
      ? (steps as any)[previousKey]
      : undefined;

  const previousStep = previousRaw
    ? {
        input: previousRaw.input,
        output: previousRaw.output,
        content: previousRaw.content,
        approved: previousRaw.approved,
      }
    : undefined;

  // ✅ Readable unwrapped current input (JSON -> string)
  const readableCurrentInput = unwrapInputText(input);

  let initialInput = "";

  // ✅ Approval gate: previous output becomes binding input only if approved
  if (
    previousStep?.approved &&
    typeof previousStep.output === "string" &&
    previousStep.output.trim().length > 0
  ) {
    initialInput = previousStep.output;
  } else if (readableCurrentInput.trim().length > 0) {
    // ✅ Use readable input (not JSON/stringified JSON)
    initialInput = readableCurrentInput;
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
