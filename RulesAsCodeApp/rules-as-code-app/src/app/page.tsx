// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/lib/store";
import TextArea from "@/components/TextArea";
import StepEditor from "@/components/StepEditor";
import { JsonValue, methodology } from "@/lib/types";

export default function Home() {
  const { currentPhase, currentStep, steps, setStepContent, approveStep, setCurrentStep } = useWizardStore();
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentStep) {
      setCurrentStep("Preparation", "Segment Text");
    }
    const initialExpanded = Object.keys(methodology).reduce((acc, phase) => ({ ...acc, [phase]: false }), {});
    setExpandedChapters(initialExpanded);
  }, [currentStep, setCurrentStep]);

  const handleTextSubmit = async () => {
    setError(null);
    console.log("Submitting text to /api/llm/segment-text:", inputText);
    try {
      const response = await fetch("/api/llm/segment-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      console.log("Response status:", response.status, "OK:", response.ok);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        setError(errorData.error || "Failed to process text");
        return;
      }
      const data = await response.json();
      console.log("API response data:", data);
      let content: JsonValue = data.sections;

      if (Array.isArray(content)) {
        content = {
          result: {
            sections: content,
          },
          confidence: 0.9,
        };
      } else if (typeof content === "string") {
        content = { sections: content };
      } else if (content?.result?.sections) {
        content = content;
      }

      setStepContent("Preparation", "Segment Text", content);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error: Unable to reach the API");
    }
  };

  const showTextArea = currentStep === "Segment Text" && !steps["Preparation-Segment Text"]?.content;

  const toggleChapter = (phase: string) => {
    setExpandedChapters((prev) => ({ ...prev, [phase]: !prev[phase] }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Rules as Code Text Wizard</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Methodology Stages</h2>
        {Object.entries(methodology).map(([phase, stepsList], phaseIndex) => (
          <div key={phaseIndex} className="mb-2">
            <div className="flex items-center justify-between bg-gray-200 p-2 rounded-t">
              <h3
                className={`font-semibold ${currentPhase === phase ? "text-blue-600" : "text-black"}`}
              >
                {phase} {currentPhase === phase ? "(Current)" : ""}
              </h3>
              <button
                onClick={() => toggleChapter(phase)}
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {expandedChapters[phase] ? "Hide Steps" : "Show Steps"}
              </button>
            </div>
            {expandedChapters[phase] && (
              <ul className="list-disc pl-5 bg-gray-100 p-2 rounded-b">
                {stepsList.map((step, stepIndex) => (
                  <li
                    key={stepIndex}
                    className={`${
                      currentPhase === phase && currentStep === step
                        ? "text-green-600"
                        : steps[`${phase}-${step}`]?.approved
                        ? "text-gray-500 line-through"
                        : "text-black"
                    }`}
                  >
                    {step}{" "}
                    {currentPhase === phase && currentStep === step
                      ? "(Current)"
                      : steps[`${phase}-${step}`]?.approved
                      ? "(Approved)"
                      : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <p>Current Phase: {currentPhase}, Step: {currentStep || "Not started"}</p>
      {showTextArea && (
        <TextArea value={inputText} onChange={setInputText} onSubmit={handleTextSubmit} />
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {isApproving && <p className="text-blue-500 mt-2">Processing approval...</p>}
      {currentPhase && currentStep && steps[`${currentPhase}-${currentStep}`] && (
        <StepEditor
          step={steps[`${currentPhase}-${currentStep}`]}
          onEdit={setStepContent}
          onApprove={async (phase, stepName) => {
            setIsApproving(true);
            try {
              await approveStep(phase, stepName);
            } finally {
              setIsApproving(false);
            }
          }}
        />
      )}
    </div>
  );
}