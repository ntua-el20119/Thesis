/* ------------------------------------------------------------------ */
/*  store.ts – central wizard state (UPDATED for new DB schema)        */
/*  Purpose:                                                           */
/*    - Holds the canonical client-side state for the Rules-as-Code    */
/*      wizard using Zustand (with persistence).                       */
/*    - Aligns client identifiers with the NEW database contract:      */
/*        MethodologyStep is uniquely identified by                     */
/*          (projectId, phase:int, stepNumber:int)                     */
/*      while the UI may still display human-friendly labels.          */
/*  Key Ideas (new contract):                                          */
/*    - Navigation is based on strict global ordering and approval     */
/*      gates (approved=true).                                         */
/*    - Steps in the store are keyed by `${phase}-${stepNumber}`       */
/*      (phase and stepNumber are integers), matching DB uniqueness.   */
/*    - Store persists only project identity; step data is rehydrated  */
/*      from backend on project selection.                             */
/* ------------------------------------------------------------------ */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ------------------------------------------------------------------ */
/* Types aligned to the NEW DB schema                                  */
/* ------------------------------------------------------------------ */
/**
 * Mirrors the fields you persist in MethodologyStep (new schema).
 * - input / llmOutput / humanOutput are JSON (Prisma Json/Json?).
 * - approval + validation flags are first-class.
 */
export type DBStep = {
  id?: number;

  projectId: number;

  phase: number; // 1 | 2
  stepNumber: number; // 1..5
  stepName: string;

  input: any; // Json
  llmOutput: any; // Json
  humanOutput?: any | null; // Json?
  confidenceScore?: string | number | null;

  schemaValid: boolean;
  humanModified: boolean;
  approved: boolean;

  reviewNotes?: string | null;
};

/* ------------------------------------------------------------------ */
/* Methodology definition (UPDATED to the new 5-step workflow)         */
/* ------------------------------------------------------------------ */
/**
 * IMPORTANT:
 * - Phase order is the global order.
 * - Step ordering is encoded by stepNumber within each phase.
 * - These constants should match the rows you create during project init.
 */
export const methodology: Record<
  number,
  { stepNumber: number; stepName: string }[]
> = {
  1: [
    { stepNumber: 1, stepName: "Segment Text" },
    { stepNumber: 2, stepName: "Extract Rules" },
    { stepNumber: 3, stepName: "Detect Conflicts" },
  ],
  2: [
    { stepNumber: 4, stepName: "Data Model" },
    { stepNumber: 5, stepName: "Business Rules" },
    { stepNumber: 6, stepName: "GoRules Format" },
  ],
  3: [
    { stepNumber: 7, stepName: "Download File" },
  ],
};

const PHASE_ORDER = Object.keys(methodology)
  .map((x) => Number(x))
  .sort((a, b) => a - b);

/* ------------------------------------------------------------------ */
/* stepIterator                                                        */
/* ------------------------------------------------------------------ */
/**
 * Provides a generator over the full methodology in global order.
 * This is used for:
 * - gated navigation (all prerequisites must be approved)
 * - deterministic next-step advancement
 */
function* stepIterator() {
  for (const phase of PHASE_ORDER) {
    for (const { stepNumber, stepName } of methodology[phase]) {
      yield { phase, stepNumber, stepName };
    }
  }
}

/* ------------------------------------------------------------------ */
/* Helper: canonical key for store lookup                              */
/* ------------------------------------------------------------------ */
/**
 * Store key matches DB identity shape (phase:int + stepNumber:int).
 * This avoids brittle string-based identifiers ("Preparation", "Segment Text")
 * and aligns with @@unique([projectId, phase, stepNumber]).
 */
const stepKey = (phase: number, stepNumber: number) => `${phase}-${stepNumber}`;

/* ------------------------------------------------------------------ */
/* WizardState interface                                               */
/* ------------------------------------------------------------------ */
interface WizardState {
  // Configuration (Ephemeral - not persisted)
  apiKey: string | null;
  llmModel: string | null;
  setApiKey: (key: string) => void;
  setLlmModel: (model: string) => void;

  projectId: number | null;
  projectName: string | null;

  // Cursor uses DB identifiers now
  currentPhase: number; // 1|2
  currentStepNumber: number; // 1..5

  // Steps indexed by `${phase}-${stepNumber}`
  steps: Record<string, DBStep>;

  // identity
  setProjectId: (id: number) => void;
  setProjectName: (name: string) => void;

  // navigation
  canNavigateTo: (phase: number, stepNumber: number) => boolean;
  setCurrentStep: (phase: number, stepNumber: number) => void;

  // data mutations
  /**
   * Hydrate from DB:
   * - This is the preferred way after selecting a project.
   * - It overwrites/merges steps by canonical key.
   */
  setStepsFromDB: (steps: DBStep[]) => void;

  /**
   * Upsert a step payload by (phase, stepNumber).
   * - Use this after LLM processing or user edits.
   */
  setStepData: (
    phase: number,
    stepNumber: number,
    patch: Partial<Omit<DBStep, "projectId" | "phase" | "stepNumber">>
  ) => void;

  /**
   * Approval marks the step as approved and advances to the next step.
   * NOTE: In the new architecture, approval should ideally be persisted
   * server-side as well; client-side approval is kept for UI continuity.
   */
  approveStep: (phase: number, stepNumber: number) => Promise<void>;

  nextStep: () => void;

  /**
   * Effective output rule:
   * - If approved and humanModified and humanOutput exists -> humanOutput
   * - Else if approved -> llmOutput
   * - Else null
   */
  getEffectiveOutput: (phase: number, stepNumber: number) => any;

  /**
   * Convenience: return UI display label like "1. Segment Text"
   */
  getStepDisplayName: (phase: number, stepNumber: number) => string;

  /**
   * Check if any *subsequent* steps (after phase/stepNumber) have data or approval.
   * Used for UI warnings before rerunning a step.
   */
  hasSubsequentStepsData: (phase: number, stepNumber: number) => boolean;
}

/* ------------------------------------------------------------------ */
/* useWizardStore (Zustand + persist)                                  */
/* ------------------------------------------------------------------ */
export const useWizardStore = create(
  persist<WizardState>(
    (set, get) => ({
      /* ---------- Configuration (Ephemeral) ---------- */
      apiKey: null,
      llmModel: null,

      setApiKey: (key) => set({ apiKey: key }),
      setLlmModel: (model) => set({ llmModel: model }),

      /* ---------- Identity & Cursor ---------- */
      projectId: null,
      projectName: null,

      currentPhase: 1,
      currentStepNumber: 1,

      steps: {},

      /* ---------- Identity Mutations ---------- */
      setProjectId: (id) => set({ projectId: id }),
      setProjectName: (name) => set({ projectName: name }),

      /* ------------------------------------------------------------------ */
      /* canNavigateTo (approval-gated)                                      */
      /* ------------------------------------------------------------------ */
      canNavigateTo: (phase, stepNumber) => {
        const { steps } = get();

        // First step is always reachable
        if (phase === 1 && stepNumber === 1) return true;

        for (const it of stepIterator()) {
          // If we've reached the target, all prerequisites are satisfied
          if (it.phase === phase && it.stepNumber === stepNumber) return true;

          const key = stepKey(it.phase, it.stepNumber);
          if (!steps[key]?.approved) return false;
        }

        // If target not found in methodology (invalid), deny
        return false;
      },

      /* ------------------------------------------------------------------ */
      /* setCurrentStep                                                      */
      /* ------------------------------------------------------------------ */
      setCurrentStep: (phase, stepNumber) => {
        if (get().canNavigateTo(phase, stepNumber)) {
          set({ currentPhase: phase, currentStepNumber: stepNumber });
        }
      },

      /* ------------------------------------------------------------------ */
      /* setStepsFromDB                                                      */
      /* ------------------------------------------------------------------ */
      setStepsFromDB: (dbSteps) =>
        set((state) => {
          const merged: Record<string, DBStep> = { ...state.steps };

          for (const s of dbSteps) {
            const key = stepKey(s.phase, s.stepNumber);
            merged[key] = {
              // ensure required fields exist, even if backend omits optional ones
              projectId: s.projectId ?? state.projectId ?? 0,
              phase: s.phase,
              stepNumber: s.stepNumber,
              stepName: s.stepName,

              input: s.input ?? {},
              llmOutput: s.llmOutput ?? {},
              humanOutput: s.humanOutput ?? null,

              confidenceScore: s.confidenceScore ?? null,
              schemaValid: Boolean(s.schemaValid),
              humanModified: Boolean(s.humanModified),
              approved: Boolean(s.approved),

              reviewNotes: s.reviewNotes ?? null,
              id: s.id,
            };
          }

          return { steps: merged };
        }),

      /* ------------------------------------------------------------------ */
      /* setStepData (upsert patch by canonical key)                          */
      /* ------------------------------------------------------------------ */
      setStepData: (phase, stepNumber, patch) =>
        set((state) => {
          const key = stepKey(phase, stepNumber);
          const prev = state.steps[key];

          // Detect meaningful content changes
          // Note: patch.llmOutput comes from the component. If it's passed from store -> component -> onEdit -> patch,
          // it might be referentially equal. If not, we use JSON stringify as a backup.
          
          // Detect meaningful content changes
          // Note: patch.llmOutput comes from the component. If it's passed from store -> component -> onEdit -> patch,
          // it might be referentially equal. If not, we use JSON stringify as a backup.
          
          const isLlmChanged = (() => {
            if (!patch || !('llmOutput' in patch)) return false;
            if (patch.llmOutput === prev?.llmOutput) return false;
            // Backup deep check (stringify is acceptable for these sizes)
            const changed = JSON.stringify(patch.llmOutput) !== JSON.stringify(prev?.llmOutput);
            if (changed) console.log(`[DEBUG] llmOutput changed. Prev: ${JSON.stringify(prev?.llmOutput)}, Patch: ${JSON.stringify(patch.llmOutput)}`);
            return changed;
          })();

          const isHumanChanged = (() => {
            if (!patch || !('humanOutput' in patch)) return false;
            // Human output is usually a new object { text: ... } from page.tsx, so deep check is needed
            const changed = JSON.stringify(patch.humanOutput) !== JSON.stringify(prev?.humanOutput);
            if (changed) console.log(`[DEBUG] humanOutput changed. Prev: ${JSON.stringify(prev?.humanOutput)}, Patch: ${JSON.stringify(patch.humanOutput)}`);
            return changed;
          })();

          const isInputChanged = (() => {
             if (!patch || !('input' in patch)) return false;
             // Input might flip between object/string, check value equality
             const changed = JSON.stringify(patch.input) !== JSON.stringify(prev?.input);
             if (changed) console.log(`[DEBUG] input changed. Prev: ${JSON.stringify(prev?.input)}, Patch: ${JSON.stringify(patch.input)}`);
             return changed;
          })();

          const contentChanged = isLlmChanged || isHumanChanged || isInputChanged;
          if (contentChanged) {
             console.log("[DEBUG] contentChanged=true, resetting approval.");
          } else {
             console.log("[DEBUG] contentChanged=false, preserving approval.");
          }

          // 1. If 'llmOutput' changed (implies a Rerun), we must RESET subsequent steps.
          if (isLlmChanged && Object.keys(patch?.llmOutput || {}).length > 0) {
             const allKeys = Object.keys(state.steps);
             
             // iterate all steps
             for (const k of allKeys) {
                const s = state.steps[k];
                const isSubsequent = (s.phase > phase) || (s.phase === phase && s.stepNumber > stepNumber);
                
                if (isSubsequent) {
                   // MUTATION: Reset this step
                   state.steps[k] = {
                      ...s,
                      input: {},
                      llmOutput: {},
                      humanOutput: null,
                      confidenceScore: null,
                      schemaValid: false,
                      humanModified: false,
                      approved: false, 
                      reviewNotes: null
                   };
                }
             }
          }

          const phaseSteps = methodology[phase] ?? [];
          const def = phaseSteps.find((x) => x.stepNumber === stepNumber);

          const base: DBStep = prev ?? {
            projectId: state.projectId ?? 0,
            phase,
            stepNumber,
            stepName: def?.stepName ?? `Step ${stepNumber}`,
            input: {},
            llmOutput: {},
            humanOutput: null,
            confidenceScore: null,
            schemaValid: false,
            humanModified: false,
            approved: false,
            reviewNotes: null,
          };

          return {
            steps: {
              ...state.steps,
              [key]: {
                ...base,
                ...patch,
                // Never allow phase/stepNumber drift through patch
                phase,
                stepNumber,
                projectId: base.projectId,
                // Only reset approved if content changed. 
                // If only reviewNotes changed, keep existing approval status.
                approved: contentChanged ? false : (prev?.approved ?? false),
              },
            },
          };
        }),

      /* ------------------------------------------------------------------ */
      /* approveStep                                                         */
      /* ------------------------------------------------------------------ */
      approveStep: async (phase, stepNumber) => {
        const key = stepKey(phase, stepNumber);

        set((state) => ({
          steps: {
            ...state.steps,
            [key]: {
              ...state.steps[key],
              approved: true,
            },
          },
        }));

        get().nextStep();
      },

      /* ------------------------------------------------------------------ */
      /* nextStep                                                            */
      /* ------------------------------------------------------------------ */
      nextStep: () => {
        const {
          currentPhase,
          currentStepNumber,
          steps,
          setCurrentStep,
          setStepData,
        } = get();

        let advance = false;

        for (const it of stepIterator()) {
          if (!advance) {
            if (
              it.phase === currentPhase &&
              it.stepNumber === currentStepNumber
            ) {
              advance = true;
            }
            continue;
          }

          const nextKey = stepKey(it.phase, it.stepNumber);

          // Seed an empty record if missing (do NOT carry-forward LLM output automatically in the new model)
          // Rationale: downstream steps should rely on effective approved output via explicit loader logic,
          // not implicit state copying, to preserve auditability.
          if (!steps[nextKey]) {
            setStepData(it.phase, it.stepNumber, {
              stepName: it.stepName,
              input: {},
              llmOutput: {},
              humanOutput: null,
              schemaValid: false,
              humanModified: false,
              approved: false,
              reviewNotes: null,
            });
          }

          setCurrentStep(it.phase, it.stepNumber);
          return;
        }

        console.log("🚩 End of methodology reached.");
      },

      /* ------------------------------------------------------------------ */
      /* getEffectiveOutput                                                  */
      /* ------------------------------------------------------------------ */
      getEffectiveOutput: (phase, stepNumber) => {
        const key = stepKey(phase, stepNumber);
        const s = get().steps[key];
        if (!s || !s.approved) return null;

        if (s.humanModified && s.humanOutput != null) return s.humanOutput;
        return s.llmOutput;
      },

      /* ------------------------------------------------------------------ */
      /* getStepDisplayName                                                  */
      /* ------------------------------------------------------------------ */
      getStepDisplayName: (phase, stepNumber) => {
        const key = stepKey(phase, stepNumber);
        const s = get().steps[key];
        const name =
          s?.stepName ??
          methodology[phase]?.find((x) => x.stepNumber === stepNumber)
            ?.stepName ??
          "";
        return `${stepNumber}. ${name || `Step ${stepNumber}`}`;
      },

      /* ------------------------------------------------------------------ */
      /* hasSubsequentStepsData                                              */
      /* ------------------------------------------------------------------ */
      hasSubsequentStepsData: (phase, stepNumber) => {
        const { steps } = get();
        for (const k in steps) {
           const s = steps[k];
           const isSubsequent = (s.phase > phase) || (s.phase === phase && s.stepNumber > stepNumber);
           if (!isSubsequent) continue;

           // Check if it has data
           const hasData = s.approved || 
                           (s.llmOutput && Object.keys(s.llmOutput).length > 0) || 
                           (s.humanOutput);
           if (hasData) return true;
        }
        return false;
      },
    }),
    {
      name: "wizard-storage",
      partialize: (state) => ({
        projectId: state.projectId,
        projectName: state.projectName,
      }) as WizardState,
    }
  )
);

/* ------------------------------------------------------------------ */
/* Notes for integrating with existing UI code                         */
/* ------------------------------------------------------------------ */
/**
 * Your existing UI components likely still use string phases/steps:
 *   - currentPhase: "Preparation"
 *   - currentStep: "Segment Text"
 * and keys like: `${phase}-${stepName}`
 *
 * With this updated store:
 *   - currentPhase is number (1|2)
 *   - currentStepNumber is number
 *   - step key is `${phase}-${stepNumber}`
 *
 * Therefore, update UI to call:
 *   setCurrentStep(1, 1)
 * and to render labels using:
 *   getStepDisplayName(phase, stepNumber)
 *
 * This change is essential to align the UI with the DB's unique key
 * (projectId, phase, stepNumber).
 */
