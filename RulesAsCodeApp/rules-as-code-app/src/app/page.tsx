// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/lib/store";
import TextArea from "@/components/TextArea";
import StepEditor from "@/components/StepEditor";
import { JsonValue } from "@/lib/types";

export default function Home() {
  const { currentPhase, currentStep, steps, setStepContent, approveStep, setCurrentStep } = useWizardStore();
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize with the first step
  useEffect(() => {
    if (!currentStep) {
      setCurrentStep("Preparation", "SegmentText");
    }
  }, [currentStep, setCurrentStep]);

  const handleTextSubmit = async () => {
    setError(null);
    const response = await fetch("/api/llm/segment-text", {
      method: "POST",
      body: JSON.stringify({ text: inputText }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || "Failed to process text");
      return;
    }
    const data = await response.json();
    let content: JsonValue = data.sections;
    if (typeof content === "string") {
      content = { sections: content };
    } else if (data.sections?.result?.sections) {
      content = data.sections.result.sections;
    }
    setStepContent("Preparation", "SegmentText", content);
  };

  // Show TextArea only if the first step (SegmentText) has no content
  const showTextArea = currentStep === "SegmentText" && !steps["Preparation-SegmentText"]?.content;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rules as Code Text Wizard</h1>
      <p>Current Phase: {currentPhase}, Step: {currentStep || "Not started"}</p>
      {showTextArea && (
        <TextArea value={inputText} onChange={setInputText} onSubmit={handleTextSubmit} />
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {currentStep && steps[`${currentPhase}-${currentStep}`] && (
        <StepEditor
          step={steps[`${currentPhase}-${currentStep}`]}
          onEdit={setStepContent}
          onApprove={approveStep}
        />
      )}
    </div>
  );
}