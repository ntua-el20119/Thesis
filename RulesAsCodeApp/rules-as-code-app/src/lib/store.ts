// src/lib/store.ts
import { create } from "zustand";
import { Step, JsonValue } from "./types";

interface WizardState {
  currentStep: string | null;
  steps: Record<string, Step>;
  setStepContent: (phase: string, stepName: string, content: JsonValue) => void;
  approveStep: (phase: string, stepName: string) => Promise<void>;
  setCurrentStep: (step: string | null) => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  currentStep: null,
  steps: {},
  setStepContent: (phase, stepName, content) =>
    set((state) => ({
      steps: {
        ...state.steps,
        [`${phase}-${stepName}`]: { phase, stepName, content, approved: false },
      },
    })),
  approveStep: async (phase, stepName) => {
    const step = get().steps[`${phase}-${stepName}`];
    if (!step) {
      throw new Error(`Step ${phase}-${stepName} not found`);
    }
    const response = await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase, stepName, content: step.content }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to approve step");
    }
    set((state) => ({
      steps: {
        ...state.steps,
        [`${phase}-${stepName}`]: { ...state.steps[`${phase}-${stepName}`], approved: true },
      },
    }));
  },
  setCurrentStep: (step) => set({ currentStep: step }),
}));