/* ------------------------------------------------------------------ */
/*  store.ts – central wizard state                                   */
/* ------------------------------------------------------------------ */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Step, JsonValue } from "./types";

/* ========== Methodology definition ========== */
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

const PHASE_ORDER = Object.keys(methodology);

function* stepIterator() {
  for (const phase of PHASE_ORDER) {
    for (const step of methodology[phase]) {
      yield { phase, step };
    }
  }
}

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
    output?: string
  ) => void;

  approveStep: (phase: string, stepName: string) => Promise<void>;
  nextStep: () => void;
}

export const useWizardStore = create(
  persist<WizardState>(
    (set, get) => ({
      projectId: null,
      projectName: null,

      currentPhase: "Preparation",
      currentStep: "Segment Text",
      steps: {},

      setProjectId: (id) => set({ projectId: id }),
      setProjectName: (name) => set({ projectName: name }),

      canNavigateTo: (phase, step) => {
        const { steps } = get();
        for (const { phase: p, step: s } of stepIterator()) {
          if (p === phase && s === step) return true;
          const key = `${p}-${s}`;
          if (!steps[key]?.approved) return false;
        }
        return false;
      },

      setCurrentStep: (phase, step) => {
        if (get().canNavigateTo(phase, step)) {
          set({ currentPhase: phase, currentStep: step });
        }
      },

      setStepContent: (phase, stepName, content, input, output) =>
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
                approved: state.steps[key]?.approved ?? false,
              },
            },
          };
        }),

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
      name: "wizard-storage",
      partialize: (state) => ({
        projectId: state.projectId,
        projectName: state.projectName,
      }),
    }
  )
);
