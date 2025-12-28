"use client";

import React from "react";
import Modal from "@/components/Modal";
import { methodology } from "@/lib/types";

interface Project {
  id: number;
  name: string;
}

interface StartingPageProps {
  // local UI state (lifted from Home)
  showCreate: boolean;
  setShowCreate: (v: boolean) => void;
  showLoad: boolean;
  setShowLoad: (v: boolean) => void;
  newName: string;
  setNewName: (v: string) => void;

  // data for load modal
  projects: Project[];

  // actions (lifted from Home)
  submitCreate: () => Promise<void> | void;
  selectProject: (p: Project) => Promise<void> | void;
}

/**
 * StartingPage
 * ------------
 * Onboarding / Pre-start Mode
 * - Non-interactive methodology summary
 * - Entry points for:
 *    * Creating a new project (modal with text input)
 *    * Loading an existing project (modal with selectable list)
 */
export default function StartingPage({
  showCreate,
  setShowCreate,
  showLoad,
  setShowLoad,
  newName,
  setNewName,
  projects,
  submitCreate,
  selectProject,
}: StartingPageProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex justify-center px-4 py-16 md:py-24">
      <div className="max-w-6xl w-full">
        {/* Main card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-sm px-6 py-8 md:px-10 md:py-10 space-y-10">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Rules as Code Text Wizard
              </h1>
              <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
                A structured workflow for transforming natural-language legal
                provisions into structured, implementation-ready rules.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2 text-xs md:text-sm mt-1">
              <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-medium text-emerald-300">
                RaC Methodology Assistant
              </span>
            </div>
          </header>

          {/* Methodology Overview */}
          <section className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
              <h2 className="text-lg md:text-xl font-semibold text-slate-100">
                Methodology Overview
              </h2>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
              <table className="w-full table-auto text-left text-sm text-slate-200">
                <thead className="bg-slate-900/90 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 w-1/4 text-xs md:text-sm font-semibold uppercase tracking-wide text-slate-400">
                      Stage
                    </th>
                    <th className="px-5 py-3 text-xs md:text-sm font-semibold uppercase tracking-wide text-slate-400">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {Object.entries(methodology).map(([phase, _]) => (
                    <tr
                      key={phase}
                      className="hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-100 align-top">
                        {phase}
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm leading-relaxed">
                        {phase === "Preparation" &&
                          "Analyse and segment the legal text into coherent units, identify scope and assumptions, and prepare it for downstream formalisation."}
                        {phase === "Analysis" &&
                          "Extract legal entities, conditions, parameters and decision points. Resolve ambiguity and make implicit logic explicit."}
                        {phase === "Implementation" &&
                          "Translate the analysed rules into a formal or executable representation (e.g. DSL, logic program, or code artefact)."}
                        {phase === "Testing" &&
                          "Validate the encoded rules against test scenarios, edge cases, and reference interpretations to ensure correctness and consistency."}
                        {phase === "Documentation" &&
                          "Produce technical and legal documentation that links formal rules back to their sources, ensuring traceability and auditability."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-center text-sm md:text-base text-slate-300 mt-4 leading-relaxed">
              The wizard will guide you step by step through this lifecycle,
              preserving a clear link between legal text and executable rules.
            </p>
          </section>

          {/* Call to action */}
          <section className="pt-2">
            <p className="mb-4 text-center text-sm text-slate-400">
              Choose how you want to proceed:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-lg shadow-emerald-500/25 transition-colors"
              >
                Create New Project
              </button>
              <button
                onClick={() => setShowLoad(true)}
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium border border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-100 shadow-md shadow-slate-900/40 transition-colors"
              >
                Load Existing Project
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modal: Create Project (controlled by showCreate) */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-slate-100">
            Create New Project
          </h2>
          <p className="text-sm text-slate-400">
            Define a descriptive project name. You can later associate this
            project with specific regulations, articles, or use cases.
          </p>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Project name
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Student Meal Eligibility – KYA Φ5/68535/Β3/2012"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm rounded-full border border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={submitCreate}
              className="px-5 py-2 text-sm font-medium rounded-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-md shadow-emerald-500/30"
            >
              Create Project
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Load Project (controlled by showLoad) */}
      <Modal open={showLoad} onClose={() => setShowLoad(false)}>
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-slate-100">
            Load Project
          </h2>
          <p className="text-sm text-slate-400">
            Select an existing project to resume work on its legal text
            preparation and rule encoding workflow.
          </p>

          {projects.length ? (
            <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    className="w-full text-left px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sm text-slate-100 transition-colors"
                    onClick={() => {
                      console.log("[DEBUG] Load project button clicked:", {
                        id: p.id,
                        name: p.name,
                        time: new Date().toISOString(),
                      });
                      selectProject(p);
                    }}
                  >
                    <span className="font-medium">{p.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">
              You have not created any projects yet.
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowLoad(false)}
              className="px-4 py-2 text-sm rounded-full border border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-100"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
