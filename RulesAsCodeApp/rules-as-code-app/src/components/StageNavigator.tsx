"use client";

import React from "react";
import { methodology } from "@/lib/types";

type StepsMap = Record<string, { approved?: boolean } | undefined>;

interface StageNavigatorProps {
  steps: StepsMap;
  currentPhase: string;
  currentStep: string;
  canNavigateTo: (phase: string, step: string) => boolean;
  onSelect: (phase: string, step: string) => void;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

/**
 * StageNavigator
 * --------------
 * Renders the phase/step navigator UI that lived inside Home:
 * - Per-phase expand/collapse controls
 * - Step list with reachability gating and status (current/approved)
 * - Emits `onSelect(phase, step)` when a reachable item is clicked
 *
 * All original comments and styling from the Home component are preserved.
 */
export default function StageNavigator({
  steps,
  currentPhase,
  currentStep,
  canNavigateTo,
  onSelect,
  expanded,
  setExpanded,
}: StageNavigatorProps) {
  return (
    <>
      {/* Stage navigator with per-phase expansion and step list */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Methodology Stages</h2>
        {Object.entries(methodology).map(([phase, list]) => (
          <div key={phase} className="mb-2">
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
                  setExpanded((prev) => ({ ...prev, [phase]: !prev[phase] }))
                }
                className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
              >
                {expanded[phase] ? "Hide Steps" : "Show Steps"}
              </button>
            </div>

            {/* Per-phase step list with reachability and status styling */}
            {expanded[phase] && (
              <ul className="list-disc pl-5 bg-gray-900 p-2 rounded-b">
                {(list as string[]).map((step) => {
                  const key = `${phase}-${step}`;
                  const isCurrent =
                    currentPhase === phase && currentStep === step;
                  const isApproved = steps[key]?.approved;
                  const reachable = canNavigateTo(phase, step);
                  return (
                    <li
                      key={key}
                      onClick={() => reachable && onSelect(phase, step)}
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
                      {isCurrent ? "(Current)" : isApproved ? "(Approved)" : ""}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
