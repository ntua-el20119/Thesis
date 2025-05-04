// src/lib/store.ts
import { create } from "zustand";
import { Step, JsonValue, methodology } from "./types";

interface WizardState {
  currentPhase: string;
  currentStep: string | null;
  steps: Record<string, Step>;
  setStepContent: (phase: string, stepName: string, content: JsonValue) => void;
  approveStep: (phase: string, stepName: string) => Promise<void>;
  setCurrentStep: (phase: string, stepName: string | null) => void;
  nextStep: () => Promise<void>; // Make async to handle API calls
}

export const useWizardStore = create<WizardState>((set, get) => ({
  currentPhase: "Preparation",
  currentStep: "SegmentText",
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
    await get().nextStep(); // Wait for next step initialization
  },
  setCurrentStep: (phase, stepName) =>
    set({ currentPhase: phase, currentStep: stepName }),
  nextStep: async () => {
    const { currentPhase, currentStep } = get();
    const steps = methodology[currentPhase];
    const currentIndex = steps.indexOf(currentStep!);
    if (currentIndex < steps.length - 1) {
      const nextStepName = steps[currentIndex + 1];
      set({ currentStep: nextStepName });
      // Initialize content for the next step if it’s an LLM-based step
      if (nextStepName === "ExtractEntities") {
        const response = await fetch("/api/llm/extract-entities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: (get().steps[`${currentPhase}-${currentStep}`]?.content as any)?.result?.sections?.map((s: any) => s.content).join(" ") || "" }),
        });
        if (response.ok) {
          const data = await response.json();
          set((state) => ({
            steps: {
              ...state.steps,
              [`${currentPhase}-${nextStepName}`]: { phase: currentPhase, stepName: nextStepName, content: data.entities, approved: false },
            },
          }));
        }
      }
    } else {
      const phases = Object.keys(methodology);
      const currentPhaseIndex = phases.indexOf(currentPhase);
      if (currentPhaseIndex < phases.length - 1) {
        const nextPhase = phases[currentPhaseIndex + 1];
        const nextStepName = methodology[nextPhase][0];
        set({ currentPhase: nextPhase, currentStep: nextStepName });
        // Initialize content for the first step of the new phase if needed
        if (nextStepName === "ExtractEntities") {
          const response = await fetch("/api/llm/extract-entities", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: "" }), // Adjust text source as needed
          });
          if (response.ok) {
            const data = await response.json();
            set((state) => ({
              steps: {
                ...state.steps,
                [`${nextPhase}-${nextStepName}`]: { phase: nextPhase, stepName: nextStepName, content: data.entities, approved: false },
              },
            }));
          }
        }
      } else {
        console.log("Methodology complete!");
      }
    }
  },
}));