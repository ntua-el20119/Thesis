"use client";

import { useState, useEffect } from "react";
import { useWizardStore } from "@/lib/store";
import StepRenderer from "@/components/stages/StepRenderer";
import { methodology } from "@/lib/types";

/* ---------- Tiny utility modal ---------- */
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
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

export default function Home() {
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

  const [started, setStarted] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [newName, setNewName] = useState("");
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);

  const initPhaseExpansion = () =>
    setExpanded(
      Object.fromEntries(Object.keys(methodology).map((p) => [p, false]))
    );

  const submitCreate = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (!res.ok) {
      alert("Name already in use or server error.");
      return;
    }
    const proj = await res.json();
    setProjectId(proj.id);
    setProjectName(proj.name);
    setStarted(true);
    setCurrentStep("Preparation", "Segment Text");
    initPhaseExpansion();
    setShowCreate(false);
    setNewName("");
  };

  useEffect(() => {
    if (!showLoad) return;
    (async () => {
      const res = await fetch("/api/projects");
      if (res.ok) setProjects(await res.json());
    })();
  }, [showLoad]);

  const selectProject = (p: { id: number; name: string }) => {
    setProjectId(p.id);
    setProjectName(p.name);
    setStarted(true);
    initPhaseExpansion();
    setShowLoad(false);
  };

  useEffect(() => {
    if (!started || !projectId) return;

    (async () => {
      try {
        const res = await fetch(`/api/saved_steps?projectId=${projectId}`);
        if (!res.ok) {
          console.warn("⚠️ Failed to preload steps:", await res.text());
          return;
        }

        const loadedSteps = await res.json();

        for (const step of loadedSteps) {
          setStepContent(
            step.phase,
            step.stepName,
            step.content,
            step.input,
            step.output
          );
        }

        const PHASE_ORDER = Object.keys(methodology);
        let latestPhase = "Preparation";
        let latestStep = "Segment Text";

        outer: for (const phase of PHASE_ORDER) {
          for (const step of methodology[phase]) {
            const found = loadedSteps.find(
              (s: any) => s.phase === phase && s.stepName === step
            );
            if (!found || !found.approved) break outer;
            latestPhase = phase;
            latestStep = step;
          }
        }

        setCurrentStep(latestPhase, latestStep);
      } catch (err) {
        console.error("🔥 Error preloading steps:", err);
      }
    })();
  }, [started, projectId]);

  if (!started) {
    return (
      <div className="container mx-auto p-6 text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Rules as Code Text Wizard
        </h1>

        <p className="mb-6 leading-relaxed text-gray-300">
          Welcome to the Rules as Code Text Wizard. This tool guides you through
          a structured methodology for converting legal documents into
          computable logic.
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
              <tr>
                <td className="px-4 py-3 font-bold">Preparation</td>
                <td className="px-4 py-3">
                  Break down the legal text into segments, normalize
                  terminology, identify key sections, and scan for
                  inconsistencies and ambiguity categories.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold">Analysis</td>
                <td className="px-4 py-3">
                  Extract legal entities, define data inputs and validation
                  rules, formalize rule logic, model uncertainty, and map
                  interdependencies and execution paths.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold">Implementation</td>
                <td className="px-4 py-3">
                  Translate formalized rules into executable logic such as code,
                  decision tables, or structured data models.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold">Testing</td>
                <td className="px-4 py-3">
                  Validate rule correctness and behavior through sample test
                  cases, scenario reviews, and consistency checks. (Coming soon)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-bold">Documentation</td>
                <td className="px-4 py-3">
                  Produce formal documentation describing methodology outputs,
                  assumptions, sources, and unresolved issues. (Coming soon)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mb-6 leading-relaxed text-gray-300 text-center">
          To get started, create a new project or load an existing one below.
        </p>

        <div className="flex gap-4 justify-center">
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

        <Modal open={showLoad} onClose={() => setShowLoad(false)}>
          <h2 className="text-xl font-semibold mb-4">Load Project</h2>
          {projects.length ? (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    className="w-full text-left px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                    onClick={() => selectProject(p)}
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>You haven&apos;t created any projects.</p>
          )}
        </Modal>
      </div>
    );
  }

  const stepKey = `${currentPhase}-${currentStep}`;
  const currentStepData = steps[stepKey];
  const firstSegment =
    !currentStepData &&
    currentPhase === "Preparation" &&
    currentStep === "Segment Text";

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">
        Project ID: {projectId} | Name: {projectName ?? "Unnamed"}
      </h1>

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
                  setExpanded((p) => ({ ...p, [phase]: !p[phase] }))
                }
                className="px-2 py-1 bg-blue-500 rounded hover:bg-blue-600"
              >
                {expanded[phase] ? "Hide Steps" : "Show Steps"}
              </button>
            </div>

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

      {currentPhase && currentStep && (
        <h2 className="text-xl font-bold text-center mt-8 mb-4">
          {currentPhase} – {currentStep}
        </h2>
      )}

      {isApproving && (
        <p className="text-blue-400 mt-2">Processing approval…</p>
      )}

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
