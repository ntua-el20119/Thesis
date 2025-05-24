/* ------------------------------------------------------------------ */
/*  store.ts – central wizard state                                   */
/* ------------------------------------------------------------------ */
import { create } from "zustand";
import { Step, JsonValue } from "./types";

/* ========== Methodology definition ========== */
export const methodology: Record<string, string[]> = {
  Preparation: ["Segment Text", 
      "Normalize Terminology", 
      "Key Sections",
      "Inconsistency Scan"],
  // …add Analysis, Implementation, etc. when ready
};

/* ========== Helper: linear traversal order ========== */
const PHASE_ORDER = Object.keys(methodology);           // ["Preparation", …]

function* stepIterator() {
  for (const phase of PHASE_ORDER) {
    for (const step of methodology[phase]) {
      yield { phase, step };
    }
  }
}

/* ========== Zustand store ========== */
interface WizardState {
  /* current position */
  currentPhase: string;
  currentStep: string;

  /* map "Phase-Step" → Step object */
  steps: Record<string, Step>;

  /* helpers / actions */
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

export const useWizardStore = create<WizardState>((set, get) => ({
  /* ­------------ state ------------ */
  currentPhase: "Preparation",
  currentStep : "Segment Text",
  steps       : {},

  /* ­------------ navigation guard ------------ */
  canNavigateTo: (phase, step) => {
    const { steps } = get();
    for (const { phase: p, step: s } of stepIterator()) {
      if (p === phase && s === step) return true;      // reached target
      const key = `${p}-${s}`;
      if (!steps[key]?.approved) return false;         // found a gap
    }
    return false;                                     // target not found
  },

  setCurrentStep: (phase, step) => {
    if (get().canNavigateTo(phase, step)) {
      set({ currentPhase: phase, currentStep: step });
    }
  },

  /* ­------------ content handling ------------ */
  setStepContent: (phase, stepName, content, input, output) =>
    set((state) => {
      const key = `${phase}-${stepName}`;
      return {
        steps: {
          ...state.steps,
          [key]: {
            phase,
            stepName,
            content,
            input,
            output,
            approved: state.steps[key]?.approved ?? false,
          },
        },
      };
    }),

  /* ­------------ approval ------------ */
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

    // advance automatically
    get().nextStep();
  },

  /* ­------------ advance to next sequential step ------------ */
  nextStep: () => {
    const { 
      currentPhase, 
      currentStep, 
      steps, 
      setCurrentStep, 
      setStepContent 
    } = get();

    // find current position in iterator
    let advance = false;
    for (const { phase, step } of stepIterator()) {
      if (!advance) {
        if (phase === currentPhase && step === currentStep) advance = true;
        continue;
      }

      // next unvisited step
      const nextKey = `${phase}-${step}`;
      const prevKey = `${currentPhase}-${currentStep}`;

      // carry forward previous content if desired
      if (!steps[nextKey]) {
        setStepContent(phase, step, steps[prevKey]?.content ?? null);
      }

      setCurrentStep(phase, step);
      return;
    }

    console.log("🚩  End of methodology reached.");
  },
}));
