"use client";

import React, { useEffect } from "react";

/**
 * NewProject
 * ----------
 * Encapsulates the submitCreate logic that originally lived inside page.tsx.
 * It exposes a ready-to-use submitCreate() function (no arguments) to the
 * parent via the `onReady` callback and reads `newName` from props.
 */

interface NewProjectProps {
  newName: string; // <-- we read the current project name from here

  setProjectId: (id: number) => void;
  setProjectName: (name: string) => void;
  setStarted: (v: boolean) => void;
  setStepContent: (
    phase: string,
    stepName: string,
    content: any,
    input?: string,
    output?: string,
    approved?: boolean
  ) => void;
  setCurrentStep: (phase: string, step: string) => void;
  initPhaseExpansion: () => void;
  setShowCreate: (open: boolean) => void;
  setNewName: (name: string) => void;

  // Parent receives the zero-arg function here
  onReady: (submitCreate: () => Promise<void>) => void;
}

export default function NewProject({
  newName,
  setProjectId,
  setProjectName,
  setStarted,
  setStepContent,
  setCurrentStep,
  initPhaseExpansion,
  setShowCreate,
  setNewName,
  onReady,
}: NewProjectProps) {
  // This mirrors your original submitCreate, but now it takes NO arguments.
  const submitCreate = async (): Promise<void> => {
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

  // Expose the zero-arg function to the parent once on mount
  useEffect(() => {
    onReady(submitCreate);
    // we intentionally omit submitCreate from deps to avoid re-registering on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady]);

  // This component has no UI; it only wires logic.
  return null;
}
