"use client";

import React, { useEffect } from "react";
import { methodology, Step } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

interface Project {
  id: number;
  name: string;
}

interface ProjectStatusProps {
  showLoad: boolean;
  setProjects: (p: Project[]) => void;
  setStarted: (v: boolean) => void;
  setShowLoad: (v: boolean) => void;
  setNewName: (v: string) => void;
  setShowCreate: (v: boolean) => void;
  setProjectId: (id: number) => void;
  setProjectName: (name: string) => void;
  initPhaseExpansion: () => void;
  setCurrentStep: (phase: string, step: string) => void;
  setStepContent: (
    phase: string,
    stepName: string,
    content: any,
    input?: string,
    output?: string,
    approved?: boolean
  ) => void;

  onActionsReady?: (actions: {
    submitCreate: (newName: string) => Promise<void>;
    selectProject: (project: Project) => Promise<void>;
  }) => void;
}

/**
 * ProjectStatus
 * -------------
 * This component centralizes the logic that manages the project lifecycle:
 * - Project creation
 * - Fetching the list of existing projects
 * - Selecting (loading) a project and hydrating its saved steps
 * - Computing the current cursor (furthest approved → next)
 *
 * It keeps the same comments and functionality as your `Home` file, but
 * modularizes the behavior into a reusable component.
 */
export default function ProjectStatus({
  showLoad,
  setProjects,
  setStarted,
  setShowLoad,
  setNewName,
  setShowCreate,
  setProjectId,
  setProjectName,
  initPhaseExpansion,
  setCurrentStep,
  setStepContent,
}: ProjectStatusProps) {
  // --------------------------------------------------------------------------
  // Effect: fetch project list when the "Load Project" modal opens
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
  }, [showLoad, setProjects]);

  // --------------------------------------------------------------------------
  // Action: submitCreate
  // --------------------------------------------------------------------------
  const submitCreate = async (newName: string) => {
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

      // Ensure first step is present in the store for a brand-new project.
      setStepContent("Preparation", "Segment Text", {}, "", "", false);
      setCurrentStep("Preparation", "Segment Text");
      initPhaseExpansion();
      setShowCreate(false);
      setNewName("");
    } catch (err) {
      console.error("[DEBUG] Error creating project:", err);
    }
  };

  // --------------------------------------------------------------------------
  // Action: selectProject
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
      console.log("[DEBUG] Loaded steps from DB:", loadedSteps);

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

      // Build linear methodology order and map approved DB steps to indices
      const orderedSteps = Object.entries(methodology).flatMap(
        ([phase, stepsInPhase]) =>
          (stepsInPhase as string[]).map((stepName) => ({ phase, stepName }))
      );

      const approvedIndexes = loadedSteps
        .filter((s) => s.approved)
        .map((s) =>
          orderedSteps.findIndex(
            (os) => os.phase === s.phase && os.stepName === s.stepName
          )
        )
        .filter((idx) => idx >= 0);

      if (approvedIndexes.length === 0) {
        const target = orderedSteps[0] ?? {
          phase: "Preparation",
          stepName: "Segment Text",
        };
        const tKey = `${target.phase}-${target.stepName}`;
        const tExisting = useWizardStore.getState().steps[tKey];
        if (!tExisting) {
          setStepContent(target.phase, target.stepName, {}, "", "", false);
        }
        console.log("[DEBUG] No approvals; navigating to first step:", target);
        setCurrentStep(target.phase, target.stepName);
        return;
      }

      const furthestIdx = Math.max(...approvedIndexes);
      const targetIdx = Math.min(furthestIdx + 1, orderedSteps.length - 1);
      const target = orderedSteps[targetIdx];

      for (let i = 0; i <= furthestIdx; i++) {
        const { phase, stepName } = orderedSteps[i];
        const key = `${phase}-${stepName}`;
        const existing = useWizardStore.getState().steps[key];
        if (!existing || !existing.approved) {
          setStepContent(
            phase,
            stepName,
            existing?.content ?? {},
            existing?.input ?? "",
            existing?.output ?? "",
            true
          );
        }
      }

      const tKey = `${target.phase}-${target.stepName}`;
      const tExisting = useWizardStore.getState().steps[tKey];
      if (!tExisting) {
        setStepContent(target.phase, target.stepName, {}, "", "", false);
      }

      console.log("[DEBUG] Backfill complete; navigating to:", target);
      setCurrentStep(target.phase, target.stepName);
    } catch (err) {
      console.error("[DEBUG] Error loading steps:", err);
      console.log(
        "[DEBUG] Defaulting to first step due to error at",
        new Date().toISOString()
      );
      setCurrentStep("Preparation", "Segment Text");
    }
  };

  // --------------------------------------------------------------------------
  // Render nothing — this is a logic provider, not a UI component
  // --------------------------------------------------------------------------
  return null;
}
