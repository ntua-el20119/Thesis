"use client";

import { useState } from "react";
import { useWizardStore } from "@/lib/store";
import StepRenderer from "@/components/stages/StepRenderer";
import { methodology } from "@/lib/types";

export default function Home() {
  /* ------------------------------------------------------------------ */
  /*  Store hooks & local state                                         */
  /* ------------------------------------------------------------------ */
  const {
    currentPhase,
    currentStep,
    steps,
    setStepContent,
    approveStep,
    setCurrentStep,
    canNavigateTo,             //  ←  new guard from updated store
  } = useWizardStore();

  const [started, setStarted]         = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [expanded, setExpanded]       = useState<Record<string, boolean>>({});

  /* ------------------------------------------------------------------ */
  /*  Helper: initialise & start                                        */
  /* ------------------------------------------------------------------ */
  const handleStart = () => {
    setStarted(true);
    setCurrentStep("Preparation", "Segment Text");

    const init = Object.fromEntries(
      Object.keys(methodology).map((p) => [p, false])
    );
    setExpanded(init);
  };

  /* ------------------------------------------------------------------ */
  /*  Current step object (may be empty first time)                     */
  /* ------------------------------------------------------------------ */
  const stepKey          = `${currentPhase}-${currentStep}`;
  const currentStepData  = steps[stepKey];
  const firstSegmentStep =
    !currentStepData &&
    currentPhase === "Preparation" &&
    currentStep === "Segment Text";

  /* ------------------------------------------------------------------ */
  /*  Welcome screen                                                    */
  /* ------------------------------------------------------------------ */
  if (!started) {
    return (
      <div className="container mx-auto p-6 text-white">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to the Rules as Code Text Wizard
        </h1>

        <p className="mb-4 text-lg leading-relaxed">
          This tool walks you step-by-step through a structured Rules as Code
          methodology.  The methodology is divided into distinct phases:
        </p>

        <ul className="list-disc pl-6 mb-4">
          <li>
            <strong>Preparation</strong> – segment text, normalise terminology,
            identify key sections.
          </li>
          <li>
            <strong>Analysis</strong> – extract entities, model ambiguity …
          </li>
          <li>
            <strong>Implementation</strong> – generate formal artefacts.
          </li>
          <li>
            <strong>Testing / Documentation</strong> – planned.
          </li>
        </ul>

        <button
          onClick={handleStart}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Start the methodology
        </button>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Main UI                                                           */
  /* ------------------------------------------------------------------ */
  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Rules as Code Text Wizard</h1>

      {/* ---------------- PHASE / STEP NAV ---------------- */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Methodology Stages</h2>

        {Object.entries(methodology).map(([phase, list]) => (
          <div key={phase} className="mb-2">
            {/* Phase header */}
            <div className="flex items-center justify-between bg-gray-800 p-2 rounded-t">
              <h3
                className={`font-semibold ${
                  currentPhase === phase ? "text-blue-400" : "text-white"
                }`}
              >
                {phase} {currentPhase === phase && "(Current)"}
              </h3>

              <button
                onClick={() =>
                  setExpanded((p) => ({ ...p, [phase]: !p[phase] }))
                }
                className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {expanded[phase] ? "Hide Steps" : "Show Steps"}
              </button>
            </div>

            {/* Step list */}
            {expanded[phase] && (
              <ul className="list-disc pl-5 bg-gray-900 p-2 rounded-b">
                {list.map((step) => {
                  const key        = `${phase}-${step}`;
                  const isCurrent  = currentPhase === phase && currentStep === step;
                  const isApproved = steps[key]?.approved;
                  const reachable  = canNavigateTo(phase, step);

                  /* click handler honours guard */
                  const handleClick = () => {
                    if (reachable) setCurrentStep(phase, step);
                  };

                  return (
                    <li
                      key={key}
                      onClick={handleClick}
                      className={`
                        cursor-${reachable ? "pointer" : "default"}
                        ${
                          isCurrent
                            ? "text-green-400"
                            : isApproved
                            ? "text-gray-400"
                            : reachable
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                    >
                      {step}{" "}
                      {isCurrent
                        ? "(Current)"
                        : isApproved
                        ? "(Approved)"
                        : ""}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* current step label */}
      {currentPhase && currentStep && (
        <h2 className="text-xl font-bold text-center mt-8 mb-4">
          {currentPhase} – {currentStep}
        </h2>
      )}

      {isApproving && (
        <p className="text-blue-400 mt-2">Processing approval…</p>
      )}

      {/* ---------- renderer (bootstrap Segment Text first time) ---------- */}
      {(currentStepData || firstSegmentStep) && (
        <StepRenderer
          step={
            currentStepData ?? {
              phase   : "Preparation",
              stepName: "Segment Text",
              content : {},
              input   : "",
              output  : "",
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
