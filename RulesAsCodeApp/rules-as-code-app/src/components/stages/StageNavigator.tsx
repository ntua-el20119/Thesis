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
 * Professional, slate/emerald-styled navigator for methodology phases & steps.
 *
 * Behaviour (unchanged):
 *  - Per-phase expand/collapse (driven by `expanded` + `setExpanded`)
 *  - Step list with reachability gating via `canNavigateTo`
 *  - Status indication: current, approved, locked
 *  - Emits `onSelect(phase, step)` when a reachable step is clicked
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
    <nav className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm md:text-base font-semibold text-slate-100">
            Methodology Stages
          </h2>
          <p className="text-[11px] md:text-xs text-slate-400">
            Navigate through the Rules-as-Code pipeline in a controlled order.
          </p>
        </div>
      </div>

      {/* Per-phase cards */}
      <div className="space-y-3">
        {Object.entries(methodology).map(([phase, list]) => {
          const isCurrentPhase = currentPhase === phase;
          const isExpanded = !!expanded[phase];

          return (
            <section
              key={phase}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur-sm shadow-sm"
            >
              {/* Phase header */}
              <header className="flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 border-b border-slate-800/80">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm md:text-base font-semibold ${
                        isCurrentPhase ? "text-emerald-300" : "text-slate-100"
                      }`}
                    >
                      {phase}
                    </h3>
                    {isCurrentPhase && (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-[2px] text-[10px] font-medium text-emerald-300">
                        Current phase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {Array.isArray(list) ? list.length : 0} step
                    {Array.isArray(list) && list.length === 1 ? "" : "s"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [phase]: !prev[phase] }))
                  }
                  className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900 px-3 py-1.5 text-[11px] md:text-xs font-medium text-slate-100 hover:bg-slate-800 hover:border-slate-500 transition-colors"
                >
                  {isExpanded ? "Hide steps" : "Show steps"}
                </button>
              </header>

              {/* Step list */}
              {isExpanded && (
                <ul className="px-3 py-2.5 md:px-4 md:py-3 space-y-1.5">
                  {(list as string[]).map((step) => {
                    const key = `${phase}-${step}`;
                    const isCurrent =
                      currentPhase === phase && currentStep === step;
                    const isApproved = steps[key]?.approved;
                    const reachable = canNavigateTo(phase, step);

                    let textClass = "";
                    if (isCurrent) {
                      textClass = "text-emerald-300";
                    } else if (isApproved) {
                      textClass = "text-slate-400";
                    } else if (reachable) {
                      textClass = "text-slate-100";
                    } else {
                      textClass = "text-slate-600";
                    }

                    const statusLabel = isCurrent
                      ? "Current"
                      : isApproved
                      ? "Approved"
                      : reachable
                      ? "Available"
                      : "Locked";

                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => reachable && onSelect(phase, step)}
                          className={`group w-full text-left flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs md:text-sm transition-colors ${
                            reachable
                              ? "hover:bg-slate-900 cursor-pointer"
                              : "cursor-default"
                          }`}
                        >
                          <span className={`truncate ${textClass}`}>
                            {step}
                          </span>
                          <span
                            className={`
                              ml-3 inline-flex items-center rounded-full border px-2 py-[1px] text-[10px] font-medium
                              ${
                                isCurrent
                                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                                  : isApproved
                                  ? "border-slate-500/60 bg-slate-800/80 text-slate-200"
                                  : reachable
                                  ? "border-slate-600 bg-slate-900 text-slate-200"
                                  : "border-slate-700 bg-slate-950 text-slate-500"
                              }
                            `}
                          >
                            {statusLabel}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </nav>
  );
}
