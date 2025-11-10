/* ------------------------------------------------------------------ */
/*  store.ts – central wizard state                                   */
/*  Purpose:                                                           */
/*    - Holds the canonical client-side state for the Rules-as-Code    */
/*      wizard using Zustand (with persistence).                       */
/*    - Defines methodology ordering, navigation policy, step data,    */
/*      and actions (approve, advance, set content).                   */
/*  Key Ideas:                                                         */
/*    - Methodology order is the single source of truth for navigation */
/*      constraints (gated by approvals).                              */
/*    - Steps are keyed by `${phase}-${stepName}` for O(1) lookup.     */
/*    - Persistence only stores project identity; step data is re-     */
/*      hydrated from the backend to avoid stale/large local payloads. */
/* ------------------------------------------------------------------ */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Step, JsonValue } from "./types";

/* ========== Methodology definition ========== */
/*  Role: Declarative definition of phases and ordered steps.          */
/*  Contract:                                                          
      - Object key order encodes phase order.                          
      - Array index order encodes step order within a phase.           
    Consumers:
      - PHASE_ORDER / stepIterator() for deterministic traversal.      */
export const methodology: Record<string, string[]> = {
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

/* Phase order is captured once to ensure consistent iteration semantics. */
const PHASE_ORDER = Object.keys(methodology);

/* ------------------------------------------------------------------ */
/* stepIterator                                                        */
/* ------------------------------------------------------------------ */
/*  Purpose:                                                          
      - Provide a generator over the full methodology in global order. 
    Why a generator:
      - Avoid materializing arrays for large structures.
      - Enables single-pass scans (e.g., gating via approvals).        */
function* stepIterator() {
  for (const phase of PHASE_ORDER) {
    for (const step of methodology[phase]) {
      yield { phase, step };
    }
  }
}

/* ------------------------------------------------------------------ */
/* WizardState interface                                               */
/* ------------------------------------------------------------------ */
/*  Describes the shape of the Zustand store and the domain actions.   */
/*  Notes:                                                            
      - `steps` is a sparse, normalized map keyed by `${phase}-${step}`.
      - `canNavigateTo` enforces linear progression (approval-gated). 
      - `setStepContent` is the canonical mutation for step data.      
      - `approveStep` flips approval and triggers advancement.         */
interface WizardState {
  projectId: number | null;
  projectName: string | null;

  currentPhase: string;
  currentStep: string;

  steps: Record<string, Step>;

  setProjectId: (id: number) => void;
  setProjectName: (name: string) => void;

  canNavigateTo: (phase: string, step: string) => boolean;
  setCurrentStep: (phase: string, step: string) => void;

  setStepContent: (
    phase: string,
    stepName: string,
    content: JsonValue,
    input?: string,
    output?: string,
    approved?: boolean
  ) => void;

  approveStep: (phase: string, stepName: string) => Promise<void>;
  nextStep: () => void;
}

/* ------------------------------------------------------------------ */
/* useWizardStore (Zustand + persist)                                  */
/* ------------------------------------------------------------------ */
/*  Responsibilities:                                                  
      - Initialize and expose wizard state and operations.             
      - Apply persistence for cross-session continuity of project ID/Name.
    Persistence Strategy:
      - `partialize` limits storage to project identity only, avoiding
        large or sensitive step payloads in local storage.              */
export const useWizardStore = create(
  persist<WizardState>(
    (set, get) => ({
      /* ---------- Identity & Cursor ---------- */
      projectId: null,
      projectName: null,

      currentPhase: "Preparation",
      currentStep: "Segment Text",
      steps: {},

      /* ---------- Identity Mutations ---------- */
      setProjectId: (id) => set({ projectId: id }),
      setProjectName: (name) => set({ projectName: name }),

      /* ------------------------------------------------------------------ */
      /* canNavigateTo                                                      */
      /* ------------------------------------------------------------------ */
      /*  Rule:                                                             *
       *    - Navigation is strictly linear in methodology order.           *
       *    - A user can navigate to a target (phase, step) iff every       *
       *      preceding step in the global order is approved.               *
       *  Implementation:                                                   *
       *    - Iterate from the start; stop on the target or the first       *
       *      unapproved step.                                              *
       *  Returns:                                                          *
       *    - true  -> target reached before encountering unapproved step.  *
       *    - false -> encountered an unapproved prerequisite first.        */
      canNavigateTo: (phase, step) => {
        const { steps } = get();
        for (const { phase: p, step: s } of stepIterator()) {
          if (p === phase && s === step) return true;
          const key = `${p}-${s}`;
          if (!steps[key]?.approved) return false;
        }
        return false;
      },

      /* ------------------------------------------------------------------ */
      /* setCurrentStep                                                     */
      /* ------------------------------------------------------------------ */
      /*  Behavior:
       *    - Moves the cursor iff policy (`canNavigateTo`) allows it.
       *  Rationale:
       *    - Centralized guard prevents UI components from bypassing
       *      progression policy.                                           */
      setCurrentStep: (phase, step) => {
        if (get().canNavigateTo(phase, step)) {
          set({ currentPhase: phase, currentStep: step });
        }
      },

      /* ------------------------------------------------------------------ */
      /* setStepContent                                                     */
      /* ------------------------------------------------------------------ */
      /*  Purpose:
       *    - Upsert step data and (optionally) approval status.
       *  Notes:
       *    - Uses normalized key `${phase}-${stepName}`.
       *    - Associates the step with current `projectId` for tracing.
       *    - `approved` defaults to false to prevent accidental promotion. */
      setStepContent: (
        phase,
        stepName,
        content,
        input,
        output,
        approved = false
      ) =>
        set((state) => {
          const key = `${phase}-${stepName}`;
          return {
            steps: {
              ...state.steps,
              [key]: {
                phase,
                stepName,
                projectId: state.projectId!,
                content,
                input,
                output,
                approved,
              },
            },
          };
        }),

      /* ------------------------------------------------------------------ */
      /* approveStep                                                        */
      /* ------------------------------------------------------------------ */
      /*  Behavior:
       *    - Marks a step as approved in the store.
       *    - Immediately advances to the next logical step via `nextStep`.
       *  Async signature:
       *    - Kept async for future-proofing (e.g., server ack) even though
       *      it currently operates synchronously on the client state.      */
      approveStep: async (phase, stepName) => {
        const key = `${phase}-${stepName}`;
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
      /* nextStep                                                           */
      /* ------------------------------------------------------------------ */
      /*  Algorithm:
       *    1) Iterate the global methodology order using `stepIterator`.
       *    2) Set a flag once the current cursor is encountered.
       *    3) The very next item after the current cursor is the target.
       *    4) If the next step has no record yet, seed it with the previous
       *       step's content (content carry-forward for continuity).
       *    5) Update the cursor via `setCurrentStep`.
       *    6) If iteration completes, we are at the end of the methodology.
       *  Notes:
       *    - Carry-forward simplifies UX when subsequent steps build on prior
       *      outputs (can be overridden later by actual LLM/API results).   */
      nextStep: () => {
        const {
          currentPhase,
          currentStep,
          steps,
          setCurrentStep,
          setStepContent,
        } = get();

        let advance = false;
        for (const { phase, step } of stepIterator()) {
          if (!advance) {
            if (phase === currentPhase && step === currentStep) advance = true;
            continue;
          }

          const nextKey = `${phase}-${step}`;
          const prevKey = `${currentPhase}-${currentStep}`;

          if (!steps[nextKey]) {
            setStepContent(phase, step, steps[prevKey]?.content ?? null);
          }

          setCurrentStep(phase, step);
          return;
        }

        console.log("🚩  End of methodology reached.");
      },
    }),
    {
      /* ------------------------------------------------------------------ */
      /* Persistence configuration                                          */
      /* ------------------------------------------------------------------ */
      /*  Storage key: "wizard-storage"                                     *
       *  partialize:
       *    - Persist only project identity to avoid large local payloads    *
       *      and reduce privacy risk; step data is expected to be fetched   *
       *      from the server per project selection.                         */
      name: "wizard-storage",
      partialize: (state) => ({
        projectId: state.projectId,
        projectName: state.projectName,
      }),
    }
  )
);
