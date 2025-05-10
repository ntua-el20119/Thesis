import { create } from "zustand";
import { Step, JsonValue } from "./types";

// Define your methodology (this can also be imported from a config file)
export const methodology: Record<string, string[]> = {
  Preparation: ["Segment Text", "Normalize Terminology", "Key Sections"],
};

interface WizardState {
  currentPhase: string;
  currentStep: string;
  steps: Record<string, Step>;
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
  currentPhase: "Preparation",
  currentStep: "Segment Text",
  steps: {},

  setCurrentStep: (phase, step) => {
    set({ currentPhase: phase, currentStep: step });
  },

  setStepContent: (phase, stepName, content, input, output) => {
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
            approved: false,
          },
        },
      };
    });
  },

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

    // Automatically move to the next step
    get().nextStep();
  },

  nextStep: () => {
    const { currentPhase, currentStep, steps, setCurrentStep, setStepContent } = get();
    const phaseSteps = methodology[currentPhase];

    const currentIndex = phaseSteps.indexOf(currentStep);
    const nextIndex = currentIndex + 1;

    if (nextIndex < phaseSteps.length) {
      const nextStep = phaseSteps[nextIndex];
      const currentKey = `${currentPhase}-${currentStep}`;
      const nextKey = `${currentPhase}-${nextStep}`;

      const previousContent = steps[currentKey]?.content || null;

      setCurrentStep(currentPhase, nextStep);

      // Propagate content forward if needed
      if (!steps[nextKey]) {
        setStepContent(currentPhase, nextStep, previousContent, undefined, undefined);
      }
    } else {
      console.log("End of methodology phase.");
    }
  },
}));
