// ============================================================================
// src/lib/types.ts
// Role:
//   - Central place for shared type definitions used across the Rules-as-Code
//     wizard (domain model for steps, editor props, and JSON payloads).
//   - Exports a declarative methodology map used by UI and navigation logic.
// Design notes:
//   - Keep types minimal and framework-agnostic to enable reuse in server/API
//     code and client components.
//   - JsonValue is a recursive union representing safe, serializable payloads.
//   - Methodology here defines phase/step order; consumers rely on key/index
//     order for deterministic traversal.
// ============================================================================

// ----------------------------------------------------------------------------
// JsonValue
// ----------------------------------------------------------------------------
// Purpose:
//   - Canonical representation of JSON-compatible data exchanged between UI,
//     LLM endpoints, and persistence layer.
// Contract:
//   - Must remain serializable to/from JSON without loss.
//   - Recursive definition allows arbitrarily nested objects/arrays.
// Considerations:
//   - Avoid functions, Dates, Maps/Sets here—encode those explicitly upstream.
//   - When narrowing in consumers, prefer type guards to improve safety.
// ----------------------------------------------------------------------------
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

// ----------------------------------------------------------------------------
// Step
// ----------------------------------------------------------------------------
// Purpose:
//   - Domain entity representing a single methodology step instance for a given
//     project, including raw/processed text and approval status.
// Fields:
//   - phase / stepName: identify the step (composite key in client store).
//   - content: structured payload (LLM result or user-edited data) as JsonValue.
//   - input / output: optional raw input and processed output text snapshots.
//   - approved: workflow gate used by navigation and progression policy.
// Notes:
//   - `projectId` is intentionally not part of this shared type to keep it
//     lightweight; if needed, extend locally where project-bound context matters.
// ----------------------------------------------------------------------------
export type Step = {
  phase: string;
  stepName: string;
  content: JsonValue;
  input?: string; // Added for raw input text
  output?: string; // Added for processed output text
  approved: boolean;
};

// ----------------------------------------------------------------------------
// StepEditorProps
// ----------------------------------------------------------------------------
// Purpose:
//   - Props contract for the Step Editor component(s), decoupling UI from store.
// Events:
//   - onEdit: authoritative mutation pathway for step content and I/O fields.
//   - onApprove: triggers approval flow (often leads to navigation/advance).
// Notes:
//   - `step` may be null for initial render; UI should guard accordingly.
//   - onApprove returns a Promise to support async server acknowledgements.
// ----------------------------------------------------------------------------
export interface StepEditorProps {
  step: Step | null;
  onEdit: (
    phase: string,
    stepName: string,
    content: JsonValue,
    input?: string,
    output?: string
  ) => void;
  onApprove: (phase: string, stepName: string) => Promise<void>;
}

// ----------------------------------------------------------------------------
// methodology
// ----------------------------------------------------------------------------
// Purpose:
//   - Declarative definition of the methodology: phases with an ordered list of
//     steps per phase. Consumers (navigation, UI) rely on:
//       * Object key order for phase sequencing.
//       * Array index order for step sequencing within a phase.
// Usage:
//   - Drives foldable stage lists, reachability checks, and "next step" logic.
// Caution:
//   - This file declares `methodology`. Ensure consistency with any other
//     `methodology` declarations (e.g., in store/config). Prefer a single source
//     of truth to avoid drift; if duplication is intentional, document it clearly.
// ----------------------------------------------------------------------------
export const methodology = {
  Preparation: [
    "Segment Text",
    "Normalize Terminology",
    "Key Sections",
    "Inconsistency Scan",
    "Inconsistency Categorization",
  ],

  Analysis: [
    "Extract Entities",
    "Entity Refinement",
    "Data Requirement Identification",
    "Data Types and Validation Rules",
    "Ambiguity Tagging",
    "Uncertainty Modeling",
    "Entity Relationship Mapping",
    "Rule Extraction",
    "Rule Formalisation",
    "Rule Depencies Mapping",
    "Decision Requirement Diagram Creation",
    "Incosistency Detection",
    "Execution Path Conflicts Analysis",
    "Rule Categorisation",
    "Conflict Resolution Modeling",
  ],
  Implementation: ["GenerateCode"],
  Testing: [],
  Documentation: [],
};
