"use client";

import React from "react";

// IMPORTANT:
// We now prefer methodology coming from the store, because the store is the
// client-side single source of truth for ordering/navigation logic.
// If your project still exports methodology from "@/lib/types", you can switch
// this import back accordingly.
import { methodology as methodologyRaw } from "@/lib/store";

/**
 * The navigator must work with BOTH shapes during migration:
 *  A) Legacy: methodology: Record<string, string[]>
 *  B) New:    methodology: Record<number | string, Array<{ stepNumber: number; stepName: string }>>
 *
 * And similarly for cursor + canNavigateTo/onSelect signatures.
 */

type LegacyMethodology = Record<string, string[]>;
type NewStepDef = { stepNumber: number; stepName: string };
type NewMethodology = Record<string, NewStepDef[]>;

type StepsMap = Record<string, { approved?: boolean } | undefined>;

interface StageNavigatorProps {
  steps: StepsMap;

  // During migration, these may be strings (legacy) or numbers (new).
  currentPhase: string | number;
  currentStep: string | number;

  canNavigateTo: (phase: number, step: number) => boolean;
  onSelect: (phase: string | number, step: string | number) => void;

  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

/** Type guard: detect new step definitions */
function isNewStepDefArray(list: unknown): list is NewStepDef[] {
  return (
    Array.isArray(list) &&
    list.length >= 0 &&
    (list.length === 0 ||
      (typeof list[0] === "object" &&
        list[0] !== null &&
        "stepNumber" in (list[0] as any) &&
        "stepName" in (list[0] as any)))
  );
}

/** Normalise phase label (UI only) */
function phaseLabel(phaseKey: string) {
  // If phaseKey is numeric, render Phase N; else render as-is
  const asNum = Number(phaseKey);
  return Number.isFinite(asNum) && phaseKey.trim() !== ""
    ? `Phase ${asNum}`
    : phaseKey;
}

export default function StageNavigator({
  steps,
  currentPhase,
  currentStep,
  canNavigateTo,
  onSelect,
  expanded,
  setExpanded,
}: StageNavigatorProps) {
  // Methodology can be legacy or new; treat as unknown and normalise via guards.
  const methodology = methodologyRaw as unknown as
    | LegacyMethodology
    | NewMethodology;

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
        {Object.entries(methodology).map(([phaseKey, list]) => {
          const pKey = String(phaseKey);
          const isCurrentPhase = String(currentPhase) === pKey;
          const isExpanded = !!expanded[pKey];

          const stepCount = Array.isArray(list) ? list.length : 0;

          return (
            <section
              key={pKey}
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
                      {phaseLabel(pKey)}
                    </h3>

                    {isCurrentPhase && (
                      <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-[2px] text-[10px] font-medium text-emerald-300">
                        Current phase
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500">
                    {stepCount} step{stepCount === 1 ? "" : "s"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [pKey]: !prev[pKey] }))
                  }
                  className="inline-flex items-center rounded-full border border-slate-600 bg-slate-900 px-3 py-1.5 text-[11px] md:text-xs font-medium text-slate-100 hover:bg-slate-800 hover:border-slate-500 transition-colors"
                >
                  {isExpanded ? "Hide steps" : "Show steps"}
                </button>
              </header>

              {/* Step list */}
              {isExpanded && (
                <ul className="px-3 py-2.5 md:px-4 md:py-3 space-y-1.5">
                  {/* NEW schema: steps are objects {stepNumber, stepName} */}
                  {isNewStepDefArray(list) &&
                    list.map((s) => {
                      const stepId = s.stepNumber; // for navigation & gating
                      const display = `${s.stepNumber}. ${s.stepName}`;

                      // Steps map key in the new store is assumed: `${phase}-${stepNumber}`
                      const key = `${pKey}-${stepId}`;

                      const isCurrent =
                        String(currentPhase) === pKey &&
                        String(currentStep) === String(stepId);

                      const isApproved = steps[key]?.approved;
                      const reachable = canNavigateTo(Number(pKey), stepId);

                      const textClass = isCurrent
                        ? "text-emerald-300"
                        : isApproved
                        ? "text-slate-400"
                        : reachable
                        ? "text-slate-100"
                        : "text-slate-600";

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
                            onClick={() =>
                              reachable && onSelect(Number(pKey), stepId)
                            }
                            className={`group w-full text-left flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs md:text-sm transition-colors ${
                              reachable
                                ? "hover:bg-slate-900 cursor-pointer"
                                : "cursor-default"
                            }`}
                          >
                            <span className={`truncate ${textClass}`}>
                              {display}
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

                  {/* LEGACY schema: steps are strings */}
                  {!isNewStepDefArray(list) &&
                    (list as string[]).map((stepName) => {
                      const key = `${pKey}-${stepName}`;
                      const isCurrent =
                        String(currentPhase) === pKey &&
                        String(currentStep) === String(stepName);

                      const isApproved = steps[key]?.approved;
                      const reachable = canNavigateTo(pKey, stepName);

                      const textClass = isCurrent
                        ? "text-emerald-300"
                        : isApproved
                        ? "text-slate-400"
                        : reachable
                        ? "text-slate-100"
                        : "text-slate-600";

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
                            onClick={() =>
                              reachable && onSelect(pKey, stepName)
                            }
                            className={`group w-full text-left flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs md:text-sm transition-colors ${
                              reachable
                                ? "hover:bg-slate-900 cursor-pointer"
                                : "cursor-default"
                            }`}
                          >
                            <span className={`truncate ${textClass}`}>
                              {stepName}
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
