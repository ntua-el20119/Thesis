"use client";

import { useState, useEffect, useMemo } from "react";
import { useWizardStore } from "@/lib/store";
import StepRenderer from "@/components/stages/StepRenderer";
import StartingPage from "@/pages/StartingPage";
import StageNavigator from "@/components/stages/StageNavigator";
import { usePhaseExpansion } from "@/pages/usePhaseExpansion";

interface Project {
  id: number;
  name: string;
}

function phaseLabel(phase: number) {
  return phase === 1 ? "Phase 1" : "Phase 2";
}

function stepLabel(stepNumber: number) {
  if (stepNumber === 1) return "Segment Text";
  if (stepNumber === 2) return "Extract Rules";
  if (stepNumber === 3) return "Detect Conflicts";
  if (stepNumber === 4) return "Create Data Model";
  return "Generate Business Rules";
}

export default function Home() {
  // --- Store (new contract)
  const {
    projectId,
    projectName,
    setProjectId,
    setProjectName,

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
  const [newName, setNewName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

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

        approved: activeStep.approved,
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
      approved: false,
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
    if (!showLoad) return;

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
  }, [showLoad]);

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

  // --- Pre-start mode
  if (!started) {
    return (
      <StartingPage
        showCreate={showCreate}
        setShowCreate={setShowCreate}
        showLoad={showLoad}
        setShowLoad={setShowLoad}
        newName={newName}
        setNewName={setNewName}
        projects={projects}
        submitCreate={submitCreate}
        selectProject={selectProject}
      />
    );
  }

  // --- Active workspace
  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">
        Project ID: {projectId} | Name: {projectName ?? "Unnamed"}
      </h1>

      <StageNavigator
        steps={steps as any}
        currentPhase={currentPhase}
        currentStep={currentStepNumber}
        canNavigateTo={canNavigateTo}
        onSelect={(p, s) => setCurrentStep(Number(p), Number(s))}
        expanded={expanded}
        setExpanded={setExpanded}
      />

      <h2 className="text-xl font-bold text-center mt-8 mb-4">
        {phaseLabel(currentPhase)} – {stepLabel(currentStepNumber)}
      </h2>

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
            output?: string
          ) => {
            const phaseInt = Number(phase);

            setStepData(phaseInt, stepNumber, {
              stepName, // ✅ κράτα και το stepName
              llmOutput: content ?? {},
              input: input && input.length > 0 ? input : null,
              humanOutput: output ? { text: output } : null,
              humanModified: Boolean(output),
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
