"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/lib/store";
import StepRenderer from "@/components/stages/StepRenderer";
import { methodology, Step } from "@/lib/types";

interface Project {
  id: number;
  name: string;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-800 text-white rounded shadow-lg p-6 w-full max-w-md">
        {children}
        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component: Home
// Responsibility:
//   - Orchestrates the Rules-as-Code wizard shell (project lifecycle, phase/step
//     navigation, persistence integration, and rendering of the active step).
// Design Notes:
//   - State is split between a global store (wizard/navigation, step data) and
//     local UI state (modals, input controls, expansion toggles).
//   - I/O side-effects are performed via fetch() against API routes, with
//     defensive logging and conservative failure handling.
//   - Rendering branches handle two main modes: pre-start (project picker)
//     and active workflow (stage/step explorer and step renderer).
// ============================================================================
export default function Home() {
  // --------------------------------------------------------------------------
  // Global wizard state (Zustand store)
  // - projectId / projectName: current project identity (persisted server-side).
  // - setProjectId / setProjectName: mutations for identity.
  // - currentPhase / currentStep: navigation cursor in methodology.
  // - steps: canonical in-memory cache of step records keyed by `${phase}-${step}`.
  // - setStepContent: central mutator to upsert step content and status.
  // - approveStep: domain action to mark a step as approved (server/store-coordinated).
  // - setCurrentStep: navigation action updating the cursor.
  // - canNavigateTo: policy gate controlling step reachability based on business rules.
  // --------------------------------------------------------------------------
  const {
    projectId,
    projectName,
    setProjectId,
    setProjectName,
    currentPhase,
    currentStep,
    steps,
    setStepContent,
    approveStep,
    setCurrentStep,
    canNavigateTo,
  } = useWizardStore();

  // --------------------------------------------------------------------------
  // Local UI state
  // - started: toggles between onboarding view and workspace view.
  // - isApproving: shows a transient "processing" state while awaiting approval.
  // - expanded: per-phase disclosure state for stage/step list UI.
  // - showCreate / showLoad: modal visibility for project creation/loading UX.
  // - newName: controlled input model for project creation.
  // - projects: client-side list for "Load Project" modal.
  // --------------------------------------------------------------------------
  const [started, setStarted] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [newName, setNewName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

  // --------------------------------------------------------------------------
  // Diagnostics: component mount trace for timeline correlation in logs.
  // --------------------------------------------------------------------------
  console.log("[DEBUG] Home component mounted at", new Date().toISOString());

  // --------------------------------------------------------------------------
  // Helper: initialize phase disclosure map
  // - Initializes all methodology phases to "collapsed" in the UI.
  // - Called after project creation/selection to reset the navigator affordance.
  // --------------------------------------------------------------------------
  const initPhaseExpansion = () => {
    console.log(
      "[DEBUG] Initializing phase expansion state at",
      new Date().toISOString()
    );
    setExpanded(
      Object.fromEntries(
        Object.keys(methodology).map((phase) => [phase, false])
      )
    );
  };

  // --------------------------------------------------------------------------
  // Action: submitCreate
  // - Creates a new project via POST /api/projects.
  // - On success, hydrates the store with the new project identity, marks the
  //   wizard as started, sets the initial navigation cursor, resets UI state.
  // - On failure, provides user feedback and avoids partial state updates.
  // Trust/Validation:
  //   - Validates non-empty name client-side; server enforces uniqueness.
  // Error Handling:
  //   - Logs failures and preserves UX continuity (modals/state).
  // --------------------------------------------------------------------------
  const submitCreate = async () => {
    if (!newName.trim()) {
      console.log("[DEBUG] Create project skipped: Empty project name");
      return;
    }
    try {
      console.log("[DEBUG] Creating new project with name:", newName.trim());
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (!res.ok) {
        console.warn("[DEBUG] Create project failed:", await res.text());
        alert("Name already in use or server error.");
        return;
      }
      const proj = await res.json();
      console.log("[DEBUG] Project created:", { id: proj.id, name: proj.name });
      setProjectId(proj.id);
      setProjectName(proj.name);
      setStarted(true);
      setCurrentStep("Preparation", "Segment Text");
      initPhaseExpansion();
      setShowCreate(false);
      setNewName("");
    } catch (err) {
      console.error("[DEBUG] Error creating project:", err);
    }
  };

  // --------------------------------------------------------------------------
  // Effect: fetch project list when the "Load Project" modal opens
  // - Lazy-loads available projects (GET /api/projects) upon modal visibility.
  // - Ensures network work is not performed unless UX requires it.
  // - Populates `projects` used by the selection list.
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!showLoad) return;
    console.log(
      "[DEBUG] Load modal opened, fetching projects at",
      new Date().toISOString()
    );
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const fetchedProjects = await res.json();
          console.log("[DEBUG] Fetched projects:", fetchedProjects);
          setProjects(fetchedProjects);
        } else {
          console.warn("[DEBUG] Fetch projects failed:", await res.text());
        }
      } catch (err) {
        console.error("[DEBUG] Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, [showLoad]);

  // --------------------------------------------------------------------------
  // Action: selectProject
  // - Binds the chosen project to the global store (identity and UX state).
  // - Fetches persisted steps (GET /api/saved_steps?projectId=…) and rehydrates
  //   the in-memory store via setStepContent() to ensure continuity of work.
  // - Navigation policy:
  //     1) If "Preparation → Normalize Terminology" is approved, jump there.
  //     2) Else, jump to the last approved step, if any.
  //     3) Else, default to "Preparation → Segment Text".
  // - Robustness:
  //     - On fetch errors or non-OK responses, falls back to initial step.
  // - Observability:
  //     - Rich logs of inputs, transitions, and post-conditions for debugging.
  // --------------------------------------------------------------------------
  const selectProject = async (project: Project) => {
    console.log("[DEBUG] Selecting project:", {
      id: project.id,
      name: project.name,
      time: new Date().toISOString(),
    });
    setProjectId(project.id);
    setProjectName(project.name);
    setStarted(true);
    initPhaseExpansion();
    setShowLoad(false);

    try {
      console.log("[DEBUG] Fetching steps for projectId:", project.id);
      const res = await fetch(`/api/saved_steps?projectId=${project.id}`);
      if (!res.ok) {
        console.warn("[DEBUG] Failed to load steps:", await res.text());
        console.log("[DEBUG] Defaulting to first step due to fetch failure");
        setCurrentStep("Preparation", "Segment Text");
        return;
      }

      const loadedSteps: Step[] = await res.json();
      console.log(
        "[DEBUG] Loaded steps from DB:",
        loadedSteps.map((s) => ({
          phase: s.phase,
          stepName: s.stepName,
          approved: s.approved,
          content: JSON.stringify(s.content).slice(0, 50) + "...",
          input: s.input ? `${s.input.slice(0, 50)}...` : null,
          output: s.output ? `${s.output.slice(0, 50)}...` : null,
        }))
      );

      console.log("[DEBUG] Updating store with loaded steps");
      for (const step of loadedSteps) {
        setStepContent(
          step.phase,
          step.stepName,
          step.content,
          step.input ?? "",
          step.output ?? "",
          step.approved
        );
      }

      console.log("[DEBUG] Store state after loading steps:", {
        currentPhase,
        currentStep,
        stepsKeys: Object.keys(steps),
      });

      // --------------------------------------------------------------------------
      // Build linear methodology order: [{ phase, stepName }, ...]
      // --------------------------------------------------------------------------
      const orderedSteps = Object.entries(methodology).flatMap(
        ([phase, stepsInPhase]) =>
          (stepsInPhase as string[]).map((stepName) => ({ phase, stepName }))
      );

      // Map approved DB steps to their indices in the global order
      const approvedIndexes = loadedSteps
        .filter((s) => s.approved)
        .map((s) =>
          orderedSteps.findIndex(
            (os) => os.phase === s.phase && os.stepName === s.stepName
          )
        )
        .filter((idx) => idx >= 0);

      // If none approved, target is the first step (index 0), backfill nothing.
      if (approvedIndexes.length === 0) {
        const target = orderedSteps[0] ?? {
          phase: "Preparation",
          stepName: "Segment Text",
        };

        // Ensure target exists in store as not approved (create minimal if missing)
        const tKey = `${target.phase}-${target.stepName}`;
        const tExisting = useWizardStore.getState().steps[tKey];
        if (!tExisting) {
          setStepContent(target.phase, target.stepName, {}, "", "", false);
        }

        console.log(
          "[DEBUG] No approvals; navigating to first step as current:",
          target
        );
        setCurrentStep(target.phase, target.stepName);
        console.log("[DEBUG] After setCurrentStep, store state:", {
          currentPhase: useWizardStore.getState().currentPhase,
          currentStep: useWizardStore.getState().currentStep,
          stepExists: !!useWizardStore.getState().steps[tKey],
        });
        return;
      }

      // Furthest approved index
      const furthestIdx = Math.max(...approvedIndexes);

      // Next step after the furthest approved (or clamp to last if none)
      const targetIdx = Math.min(furthestIdx + 1, orderedSteps.length - 1);
      const target = orderedSteps[targetIdx];

      // --------------------------------------------------------------------------
      // Backfill: mark ALL previous steps (<= furthestIdx) as approved in the store.
      // Create minimal records if missing to ensure UI shows "(Approved)" and access.
      // --------------------------------------------------------------------------
      for (let i = 0; i <= furthestIdx; i++) {
        const { phase, stepName } = orderedSteps[i];
        const key = `${phase}-${stepName}`;
        const existing = useWizardStore.getState().steps[key];

        if (!existing || !existing.approved) {
          setStepContent(
            phase,
            stepName,
            existing?.content ?? {}, // preserve if present
            existing?.input ?? "",
            existing?.output ?? "",
            true // mark as approved
          );
        }
      }

      // Ensure the target step itself exists (should be not approved by definition)
      const tKey = `${target.phase}-${target.stepName}`;
      const tExisting = useWizardStore.getState().steps[tKey];
      if (!tExisting) {
        setStepContent(target.phase, target.stepName, {}, "", "", false);
      }

      console.log(
        "[DEBUG] Backfill complete; navigating to NEXT after latest approved:",
        {
          furthestApprovedIndex: furthestIdx,
          targetIndex: targetIdx,
          target,
        }
      );

      // Navigate to target (the "current" step)
      setCurrentStep(target.phase, target.stepName);

      // Post-condition diagnostics
      console.log("[DEBUG] After setCurrentStep, store state:", {
        currentPhase: useWizardStore.getState().currentPhase,
        currentStep: useWizardStore.getState().currentStep,
        stepExists: !!useWizardStore.getState().steps[tKey],
      });
    } catch (err) {
      console.error("[DEBUG] Error loading steps:", err);
      console.log(
        "[DEBUG] Defaulting to first step due to error at",
        new Date().toISOString()
      );
      setCurrentStep("Preparation", "Segment Text");
      console.log("[DEBUG] After setCurrentStep, store state:", {
        currentPhase: useWizardStore.getState().currentPhase,
        currentStep: useWizardStore.getState().currentStep,
        stepExists:
          !!useWizardStore.getState().steps["Preparation-Segment Text"],
      });
    }
  };

  // --------------------------------------------------------------------------
  // Onboarding / Pre-start Mode
  // - Renders a non-interactive methodology summary and entry points for:
  //     * Creating a new project (modal with text input)
  //     * Loading an existing project (modal with selectable list)
  // - UX principle: minimize initial friction; explain stages before starting.
  // --------------------------------------------------------------------------
  if (!started) {
    return (
      <div className="container mx-auto p-6 text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Rules as Code Text Wizard
        </h1>
        <p className="mb-6 leading-relaxed text-gray-300">
          Welcome to the Rules as Code Text Wizard...
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4 text-white text-center">
          Methodology Overview
        </h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full table-auto border border-gray-700 text-left text-sm text-gray-300">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-2 w-1/5">Stage</th>
                <th className="px-4 py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {Object.entries(methodology).map(([phase, _]) => (
                <tr key={phase}>
                  <td className="px-4 py-3 font-bold">{phase}</td>
                  <td className="px-4 py-3">
                    {phase === "Preparation" && "Break down the legal text..."}
                    {phase === "Analysis" && "Extract legal entities..."}
                    {phase === "Implementation" &&
                      "Translate formalized rules..."}
                    {phase === "Testing" && "Validate rule correctness..."}
                    {phase === "Documentation" &&
                      "Produce formal documentation..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mb-6 leading-relaxed text-gray-300 text-center">
          To get started, create a new project or load an existing one below.
        </p>
        <div className="flex gap-4 justify-center">
          {/* Entry points: create or load workflows */}
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-green-500 rounded hover:bg-green-600"
          >
            Create New Project
          </button>
          <button
            onClick={() => setShowLoad(true)}
            className="px-6 py-3 bg-blue-500 rounded hover:bg-blue-600"
          >
            Load Project
          </button>
        </div>

        {/* Modal: Create Project (controlled by showCreate) */}
        <Modal open={showCreate} onClose={() => setShowCreate(false)}>
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name"
            className="w-full p-2 bg-gray-700 rounded"
          />
          <button
            onClick={submitCreate}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </Modal>

        {/* Modal: Load Project (controlled by showLoad) */}
        <Modal open={showLoad} onClose={() => setShowLoad(false)}>
          <h2 className="text-xl font-semibold mb-4">Load Project</h2>
          {projects.length ? (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    className="w-full text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    onClick={() => {
                      console.log("[DEBUG] Load project button clicked:", {
                        id: p.id,
                        name: p.name,
                        time: new Date().toISOString(),
                      });
                      selectProject(p);
                    }}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven't created any projects.</p>
          )}
        </Modal>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Derived rendering context for the active workspace
  // - stepKey: canonical key for current step lookup.
  // - currentStepData: store-backed record (if loaded), else undefined.
  // - firstSegment: sentinel indicating the very first step (no data yet) to
  //   enable initial rendering of the StepRenderer with defaults.
  // - Extensive debug log: traces current rendering state and data preview.
  // --------------------------------------------------------------------------
  const stepKey = `${currentPhase}-${currentStep}`;
  const currentStepData = steps[stepKey];
  const firstSegment =
    !currentStepData &&
    currentPhase === "Preparation" &&
    currentStep === "Segment Text";
  console.log("[DEBUG] Rendering step:", {
    stepKey,
    currentPhase,
    currentStep,
    hasData: !!currentStepData,
    isFirstSegment: firstSegment,
    stepData: currentStepData
      ? {
          phase: currentStepData.phase,
          stepName: currentStepData.stepName,
          approved: currentStepData.approved,
          content: JSON.stringify(currentStepData.content).slice(0, 50) + "...",
          input: currentStepData.input
            ? `${currentStepData.input.slice(0, 50)}...`
            : null,
          output: currentStepData.output
            ? `${currentStepData.output.slice(0, 50)}...`
            : null,
        }
      : null,
    time: new Date().toISOString(),
  });

  // --------------------------------------------------------------------------
  // Active Workspace Rendering
  // - Header: displays project identity.
  // - Stage Navigator:
  //     * Lists all methodology phases with per-phase expand/collapse.
  //     * Indicates current/approved states and enforces reachability policy.
  // - Step Title: reflects currentPhase/currentStep for user awareness.
  // - Approval Status: transient indicator during approval side-effect.
  // - StepRenderer:
  //     * Renders the active step either from store or first-step defaults.
  //     * onEdit bridges child edits to the store write API (setStepContent).
  //     * onApprove triggers approveStep with optimistic UX signaling.
  // --------------------------------------------------------------------------
  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">
        Project ID: {projectId} | Name: {projectName ?? "Unnamed"}
      </h1>

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
                {list.map((step) => {
                  const key = `${phase}-${step}`;
                  const isCurrent =
                    currentPhase === phase && currentStep === step;
                  const isApproved = steps[key]?.approved;
                  const reachable = canNavigateTo(phase, step);
                  return (
                    <li
                      key={key}
                      onClick={() => reachable && setCurrentStep(phase, step)}
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

      {/* Current step title for context */}
      {currentPhase && currentStep && (
        <h2 className="text-xl font-bold text-center mt-8 mb-4">
          {currentPhase} – {currentStep}
        </h2>
      )}

      {/* Approval progress indicator */}
      {isApproving && (
        <p className="text-blue-400 mt-2">Processing approval…</p>
      )}

      {/* StepRenderer binds to either existing store data or first-step defaults */}
      {(currentStepData || firstSegment) && (
        <StepRenderer
          step={
            currentStepData ?? {
              phase: "Preparation",
              stepName: "Segment Text",
              content: {},
              input: "",
              output: "",
              approved: false,
              projectId: projectId ?? -1,
            }
          }
          onEdit={setStepContent}
          onApprove={async (phase, stepName) => {
            console.log("[DEBUG] Approving step:", {
              phase,
              stepName,
              time: new Date().toISOString(),
            });
            setIsApproving(true);
            try {
              await approveStep(phase, stepName);
              console.log("[DEBUG] Step approved:", { phase, stepName });
            } finally {
              setIsApproving(false);
            }
          }}
        />
      )}
    </div>
  );
}
