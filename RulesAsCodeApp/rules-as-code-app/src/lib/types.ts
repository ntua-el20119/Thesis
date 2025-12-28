// ============================================================================
// src/lib/types.ts (UPDATED for new DB schema)
// ============================================================================

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

/**
 * Step
 * ---------------------------------------------------------------------------
 * DB-aligned identity:
 *   - phase: number
 *   - stepNumber: number
 * UI identity:
 *   - stepName: string (used for display + component mapping)
 *
 * Data:
 *   - content: structured object used for rendering (typically llmOutput.result or llmOutput)
 *   - input/output: UI-friendly string snapshots (textarea) (optional)
 *   - approved: workflow gate
 */
export type Step = {
  phase: number; // NEW: numeric (Phase 1 -> 1)
  stepNumber: number; // NEW: numeric (Segment Text -> 1)
  stepName: string; // still needed for UI/component mapping

  content: JsonValue; // what the UI renders as "current structured state"
  input?: string; // textarea string (NOT the DB JSON input)
  output?: string; // textarea/preview string

  approved: boolean;
};

/**
 * StepEditorProps
 * ---------------------------------------------------------------------------
 * Keep legacy signature but now uses numeric identity.
 */
export interface StepEditorProps {
  step: Step | null;

  onEdit: (
    phase: number,
    stepNumber: number,
    stepName: string,
    content: JsonValue,
    input?: string,
    output?: string
  ) => void;

  onApprove: (
    phase: number,
    stepNumber: number,
    stepName: string
  ) => Promise<void>;
}

/**
 * Methodology (DB aligned)
 * ---------------------------------------------------------------------------
 * We keep a declarative map but each step is now an object with both stepNumber
 * and stepName (source of truth for navigation + API routing).
 */
export type MethodologyStepDef = { stepNumber: number; stepName: string };
export type Methodology = Record<string, MethodologyStepDef[]>;

export const methodology: Methodology = {
  "Phase 1": [
    { stepNumber: 1, stepName: "Segment Text" },
    { stepNumber: 2, stepName: "Extract Rules" },
    { stepNumber: 3, stepName: "Detect Conflicts" },
  ],
  "Phase 2": [
    { stepNumber: 4, stepName: "Create Data Model" },
    { stepNumber: 5, stepName: "Generate Business Rules" },
  ],
};
