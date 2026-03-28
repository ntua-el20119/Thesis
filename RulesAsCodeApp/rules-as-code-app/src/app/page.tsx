"use client";

import { useState, useEffect, useMemo } from "react";
import { useWizardStore } from "@/store/wizardStore";
import StepRenderer from "@/components/stages/StepRenderer";
import StartingPage from "@/components/views/StartingPage";
import StageNavigator from "@/components/stages/StageNavigator";
import { usePhaseExpansion } from "@/hooks/usePhaseExpansion";
import ConfigurationModal from "@/components/ui/ConfigurationModal";

interface Project {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

function phaseLabel(phase: number) {
  if (phase === 1) return "Analysis";
  if (phase === 2) return "Modeling";
  return "Testing";
}

function stepLabel(stepNumber: number) {
  if (stepNumber === 1) return "Segment Text";
  if (stepNumber === 2) return "Extract Rules";
  if (stepNumber === 3) return "Detect Conflicts";
  if (stepNumber === 4) return "Data Model";
  if (stepNumber === 5) return "Business Rules";
  if (stepNumber === 6) return "GoRules Format";
  return "Download File";
}

const STEP_SEQUENCE = [
  { p: 1, s: 1 },
  { p: 1, s: 2 },
  { p: 1, s: 3 },
  { p: 2, s: 4 },
  { p: 2, s: 5 },
  { p: 2, s: 6 },
  { p: 3, s: 7 },
];

export default function Home() {
  // --- Store (new contract)
  const {
    projectId,
    projectName,
    setProjectId,
    setProjectName,

    apiKey,
    llmModel,

    currentPhase,
    currentStepNumber,
    steps,

    setStepsFromDB,
    setStepData,
    approveStep,
    setCurrentStep,
    canNavigateTo,
    getEffectiveOutput,
  } = useWizardStore();

  // --- Local UI state
  const [started, setStarted] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showLoad, setShowLoad] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [newName, setNewName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  // Check configuration whenever we are in "started" mode
  useEffect(() => {
    if (started && (!apiKey || !llmModel)) {
      setShowConfig(true);
    } else {
      setShowConfig(false);
    }
  }, [started, apiKey, llmModel]);

  const { expanded, setExpanded, initPhaseExpansion } = usePhaseExpansion();


  // --- Derived (ALWAYS compute hooks before any return)
  const activeKey = `${currentPhase}-${currentStepNumber}`;
  const activeStep = steps[activeKey];
  const firstSegment =
    !activeStep && currentPhase === 1 && currentStepNumber === 1;

  const stepForRenderer = useMemo(() => {
    if (activeStep) {
      const effective = getEffectiveOutput(
        activeStep.phase,
        activeStep.stepNumber
      );

      return {
        projectId: activeStep.projectId,
        phase: activeStep.phase,
        stepNumber: activeStep.stepNumber,
        stepName: activeStep.stepName,

        content: activeStep.llmOutput ?? {},

        input:
          typeof activeStep.input === "string"
            ? activeStep.input
            : activeStep.input && Object.keys(activeStep.input).length > 0
            ? JSON.stringify(activeStep.input, null, 2)
            : "",
        output: effective == null ? "" : JSON.stringify(effective, null, 2),
        confidenceScore: activeStep.confidenceScore,
        approved: activeStep.approved,
        reviewNotes: activeStep.reviewNotes,
      };
    }

    return {
      projectId: projectId ?? -1,
      phase: 1,
      stepNumber: 1,
      stepName: "Segment Text",
      content: {},
      input: "",
      output: "",
      confidenceScore: null,
      approved: false,
      reviewNotes: null,
    };
  }, [activeStep, getEffectiveOutput, projectId]);

  // --- Create project
  const submitCreate = async () => {
    if (!newName.trim()) return;

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), legalText: "" }),
    });

    if (!res.ok) {
      alert("Name already in use or server error.");
      return;
    }

    const { project, steps: dbSteps } = await res.json();

    setProjectId(project.id);
    setProjectName(project.name);
    setStarted(true);

    setStepsFromDB(dbSteps);
    setCurrentStep(1, 1);

    initPhaseExpansion();
    setShowCreate(false);
    setNewName("");
  };

  // --- Load projects list when modal opens
  useEffect(() => {
    if (!showLoad && !showDelete) return;

    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const fetched = await res.json();
          setProjects(fetched);
        }
      } catch (err) {
        console.error("[DEBUG] Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, [showLoad, showDelete]);

  // --- Delete project
  const deleteProject = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return; 
    }
    // Note: The UI for confirmation is handled in StartingPage, but a safety check here is fine. 
    // Actually, user requested a specific modal flow, so this alert might be redundant if StartingPage handles it, 
    // but the request said "popup... warning...". I'll implement the backend call here.

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete project.");
        return;
      }
      // Refresh list
      setProjects((prev) => prev.filter((p) => p.id !== id));
      // Close delete modal if open (handled via state in StartingPage usually, but we have showDelete here)
      // Actually StartingPage receives showDelete/setShowDelete.
      
      // If the deleted project was active, we might want to reset? 
      if (projectId === id) {
          setProjectId(0); // Reset ID
          setStarted(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting project.");
    }
  };

  // --- Select project
  const selectProject = async (project: Project) => {
    setProjectId(project.id);
    setProjectName(project.name);
    setStarted(true);
    initPhaseExpansion();
    setShowLoad(false);

    try {
      const res = await fetch(`/api/saved_steps?projectId=${project.id}`);
      if (!res.ok) {
        setCurrentStep(1, 1);
        return;
      }

      const loadedSteps = await res.json();
      setStepsFromDB(loadedSteps);

      const sorted = [...loadedSteps].sort(
        (a: any, b: any) => a.phase - b.phase || a.stepNumber - b.stepNumber
      );

      const firstNotApproved = sorted.find((s: any) => !s.approved);
      if (firstNotApproved) {
        setCurrentStep(firstNotApproved.phase, firstNotApproved.stepNumber);
      } else {
        const last = sorted[sorted.length - 1];
        setCurrentStep(last?.phase ?? 1, last?.stepNumber ?? 1);
      }
    } catch (err) {
      console.error("[DEBUG] Error loading steps:", err);
      setCurrentStep(1, 1);
    }
  };

  // --- Rename project
  const renameProject = async (id: number, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        alert((await res.json()).error ?? "Failed to rename project.");
        return;
      }
      // Update local list
      setProjects((prev) => prev.map((p) => p.id === id ? { ...p, name: trimmed } : p));
      // If this is the active project, update the name in the store too
      if (projectId === id) setProjectName(trimmed);
    } catch (err) {
      console.error("Rename error:", err);
      alert("Error renaming project.");
    }
  };

  // --- Pre-start mode
  if (!started) {
    return (
      <StartingPage
        showCreate={showCreate}
        setShowCreate={setShowCreate}
        showLoad={showLoad}
        setShowLoad={setShowLoad}
        showDelete={showDelete}
        setShowDelete={setShowDelete}
        newName={newName}
        setNewName={setNewName}
        projects={projects}
        submitCreate={submitCreate}
        selectProject={selectProject}
        deleteProject={deleteProject}
        renameProject={renameProject}
      />
    );
  }

  // --- Active workspace
  return (
    <div className="container mx-auto p-4 text-white">
      {showConfig && (
        <ConfigurationModal onSave={() => setShowConfig(false)} />
      )}
      <div className="relative flex flex-col md:flex-row items-center justify-center mb-8 pt-4">
        <button
          onClick={() => {
            setStarted(false);
            setProjectId(0);
          }}
          className="md:absolute md:left-0 px-4 py-2 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-all flex items-center gap-2 mb-4 md:mb-0 border border-gray-700"
        >
          <span>←</span> Back to Starting Page
        </button>

        <div className="text-center">
          <div className="text-xs text-gray-500 font-mono mb-1">PROJECT ID: {projectId}</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
             {projectName ?? "Unnamed Project"}
          </h1>
        </div>
      </div>

      <StageNavigator
        steps={steps as any}
        currentPhase={currentPhase}
        currentStep={currentStepNumber}
        canNavigateTo={canNavigateTo}
        onSelect={(p, s) => setCurrentStep(Number(p), Number(s))}
        expanded={expanded}
        setExpanded={setExpanded}
      />

      <div className="flex items-center justify-center max-w-4xl mx-auto mt-8 mb-4 px-4">
        {(() => {
          const currentIndex = STEP_SEQUENCE.findIndex(
            (x) => x.p === currentPhase && x.s === currentStepNumber
          );
          const prev = currentIndex > 0 ? STEP_SEQUENCE[currentIndex - 1] : null;
          const next = currentIndex >= 0 && currentIndex < STEP_SEQUENCE.length - 1 ? STEP_SEQUENCE[currentIndex + 1] : null;

          return (
            <div className="flex items-center justify-center gap-6 mt-8 mb-4 px-4">
              {prev && (
                 <button
                   onClick={() => setCurrentStep(prev!.p, prev!.s)}
                   className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold text-white transition-colors"
                 >
                   ← Prev
                 </button>
              )}
              
              <h2 className="text-xl font-bold text-slate-100 whitespace-nowrap">
                {phaseLabel(currentPhase)} <span className="text-slate-600 mx-2">/</span> {stepLabel(currentStepNumber)}
              </h2>

              {next && (
                <button
                  onClick={() => setCurrentStep(next!.p, next!.s)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-semibold text-white transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {isApproving && (
        <p className="text-blue-400 mt-2">Processing approval…</p>
      )}

      {(activeStep || firstSegment) && (
        <StepRenderer
          step={stepForRenderer as any}
          onEdit={(
            phase: number,
            stepNumber: number,
            stepName: string,
            content: any,
            input?: string,
            output?: string,
            confidenceScore?: number | null,
            reviewNotes?: string | null
          ) => {
            const phaseInt = Number(phase);
            console.log("[DEBUG] page.tsx onEdit called:", { phase, stepNumber, output, inputLength: input?.length, reviewNotes });

            setStepData(phaseInt, stepNumber, {
              stepName, 
              llmOutput: content ?? {},
              input: input && input.length > 0 ? input : null,
              humanOutput: output ? { text: output } : null,
              humanModified: Boolean(output),
              confidenceScore: confidenceScore,
              reviewNotes: reviewNotes,
            });
          }}
          onApprove={async (
            phase: number,
            stepNumber: number,
            stepName: string
          ) => {
            const phaseInt = Number(phase);

            setIsApproving(true);
            try {
              // (προαιρετικά) μπορείς να χρησιμοποιήσεις stepName αν το χρειάζεσαι για persistence
              await approveStep(phaseInt, stepNumber);
            } finally {
              setIsApproving(false);
            }
          }}
        />
      )}
    </div>
  );
}
