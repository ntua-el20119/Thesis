"use client";

import React, { useEffect } from "react";

/**
 * NewProject (updated for new DB / 5-step methodology)
 * ---------------------------------------------------
 * Creates a new Project via /api/projects and initializes
 * all 5 methodology steps in the client store so the wizard
 * has deterministic state from the start.
 *
 * Methodology steps (per README):
 *  1 Segment Text
 *  2 Extract Rules
 *  3 Detect Conflicts
 *  4 Create Data Model
 *  5 Generate Business Rules
 */

interface NewProjectProps {
  newName: string;

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

  onReady: (submitCreate: () => Promise<void>) => void;
}

/**
 * UI-phase mapping (client-side labels).
 * Keep these stable: they are "presentation names" and should not be confused
 * with DB fields phase=1/2.
 */
const PHASE_1 = "Phase 1";
const PHASE_2 = "Phase 2";

/**
 * Canonical step names (UI-level), aligned with the 5-step methodology.
 * (You can change these labels later, but keep them consistent everywhere.)
 */
const STEP_1 = "1. Segment Text";
const STEP_2 = "2. Extract Rules";
const STEP_3 = "3. Detect Conflicts";
const STEP_4 = "4. Create Data Model";
const STEP_5 = "5. Generate Business Rules";

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
  const submitCreate = async (): Promise<void> => {
    if (!newName.trim()) {
      console.log("[DEBUG] Create project skipped: Empty project name");
      return;
    }

    try {
      const trimmed = newName.trim();
      console.log("[DEBUG] Creating new project with name:", trimmed);

      /**
       * IMPORTANT:
       * - If your new backend requires legalText as well, extend the body here
       *   (e.g., { name: trimmed, legalText }).
       * - With the new DB, the API can also create the 5 MethodologyStep rows,
       *   but even if it does, we still initialize the client store for UX determinism.
       */
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
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

      /**
       * Initialize ALL steps in the client store (empty placeholders).
       * The DB is empty/new; these placeholders let the wizard render immediately.
       *
       * We set approved=false everywhere initially.
       * content: {} to keep it JSON-friendly and consistent with the LLM artifacts.
       */
      setStepContent(PHASE_1, STEP_1, {}, "", "", false);
      setStepContent(PHASE_1, STEP_2, {}, "", "", false);
      setStepContent(PHASE_1, STEP_3, {}, "", "", false);
      setStepContent(PHASE_2, STEP_4, {}, "", "", false);
      setStepContent(PHASE_2, STEP_5, {}, "", "", false);

      // Start the wizard at Step 1
      setCurrentStep(PHASE_1, STEP_1);
      initPhaseExpansion();

      setShowCreate(false);
      setNewName("");
    } catch (err) {
      console.error("[DEBUG] Error creating project:", err);
      alert("Unexpected error while creating project.");
    }
  };

  useEffect(() => {
    onReady(submitCreate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady]);

  return null;
}
