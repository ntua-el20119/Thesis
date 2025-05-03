// src/app/page.tsx
"use client";

import { useState } from "react";
import { useWizardStore } from "@/lib/store";
import TextArea from "@/components/TextArea";
import StepEditor from "@/components/StepEditor";
//import { JsonValue } from "@/lib/types"; // Import JsonValue

export default function Home() {
  const { currentStep, steps, setStepContent, approveStep } = useWizardStore();
  const [inputText, setInputText] = useState("");

  // src/app/page.tsx
  const handleTextSubmit = async () => {
    const response = await fetch("/api/llm/segment-text", {
      method: "POST",
      body: JSON.stringify({ text: inputText }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("LLM Error:", error.error);
      return;
    }
    const data = await response.json();
    setStepContent("Preparation", "SegmentText", data);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rules as Code Text Wizard</h1>
      <TextArea value={inputText} onChange={setInputText} onSubmit={handleTextSubmit} />
      {currentStep && (
        <StepEditor
          step={steps[currentStep]}
          onEdit={setStepContent}
          onApprove={approveStep}
        />
      )}
    </div>
  );
}