"use client";

import { useState } from "react";
import { useWizardStore } from "@/lib/store";
import StepRenderer from "@/components/stages/StepRenderer";
import { methodology } from "@/lib/types";

export default function Home() {
  const {
    currentPhase,
    currentStep,
    steps,
    setStepContent,
    approveStep,
    setCurrentStep,
  } = useWizardStore();

  const [started, setStarted] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const handleStart = () => {
    setStarted(true);
    setCurrentStep("Preparation", "Segment Text");
    const initialExpanded = Object.keys(methodology).reduce(
      (acc, phase) => ({ ...acc, [phase]: false }),
      {}
    );
    setExpandedChapters(initialExpanded);
  };

  const currentStepKey = `${currentPhase}-${currentStep}`;
  const currentStepData = steps[currentStepKey];

  const isSegmentTextFirstStep =
    !currentStepData && currentPhase === "Preparation" && currentStep === "Segment Text";

  if (!started) {
    return (
      <div className="container mx-auto p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">Welcome to the Rules as Code Text Wizard</h1>
        <p className="mb-4 text-lg leading-relaxed">
          This tool walks you step-by-step through a structured Rules as Code methodology.
          The methodology is divided into distinct phases:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Preparation</strong>: Structure and segment the legal text, normalize terminology, identify key sections.</li>
          <li><strong>Analysis</strong>: Extract entities, identify data types, model uncertainty and ambiguity, and derive rule logic.</li>
          <li><strong>Implementation</strong>: Generate formal representations and code artifacts.</li>
          <li><strong>Testing</strong> and <strong>Documentation</strong> stages (planned).</li>
        </ul>
        <p className="mb-6">
          You will be guided through each step interactively, with the option to edit and approve results before moving forward.
        </p>
        <button
          onClick={handleStart}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Start the Methodology
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Rules as Code Text Wizard</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Methodology Stages</h2>
        {Object.entries(methodology).map(([phase, stepsList], phaseIndex) => (
          <div key={phaseIndex} className="mb-2">
            <div className="flex items-center justify-between bg-gray-800 p-2 rounded-t">
              <h3 className={`font-semibold ${currentPhase === phase ? "text-blue-400" : "text-white"}`}>
                {phase} {currentPhase === phase ? "(Current)" : ""}
              </h3>
              <button
                onClick={() =>
                  setExpandedChapters((prev) => ({ ...prev, [phase]: !prev[phase] }))
                }
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {expandedChapters[phase] ? "Hide Steps" : "Show Steps"}
              </button>
            </div>
            {expandedChapters[phase] && (
              <ul className="list-disc pl-5 bg-gray-900 p-2 rounded-b">
                {stepsList.map((step, stepIndex) => {
                  const stepKey = `${phase}-${step}`;
                  const isCurrent = currentPhase === phase && currentStep === step;
                  const isApproved = steps[stepKey]?.approved;
                  return (
                    <li
                      key={stepIndex}
                      className={`${
                        isCurrent
                          ? "text-green-400"
                          : isApproved
                          ? "text-gray-400 line-through"
                          : "text-white"
                      }`}
                    >
                      {step} {isCurrent ? "(Current)" : isApproved ? "(Approved)" : ""}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      {currentPhase && currentStep && (
        <h2 className="text-xl font-bold text-center mt-8 mb-4">
          {currentPhase} - {currentStep}
        </h2>
      )}

      {isApproving && <p className="text-blue-400 mt-2">Processing approval...</p>}

      {(currentStepData || isSegmentTextFirstStep) && (
        <StepRenderer
          step={
            currentStepData ?? {
              phase: "Preparation",
              stepName: "Segment Text",
              content: {},
              input: "",
              output: "",
              approved: false,
            }
          }
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
