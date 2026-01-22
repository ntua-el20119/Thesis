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
  showDelete: boolean;
  setShowDelete: (v: boolean) => void;
  newName: string;
  setNewName: (v: string) => void;

  // data for load modal
  projects: Project[];

  // actions (lifted from Home)
  submitCreate: () => Promise<void> | void;
  selectProject: (p: Project) => Promise<void> | void;
  deleteProject: (id: number) => Promise<void> | void;
}

/**
 * StartingPage
 * ------------
 * Onboarding / Pre-start Mode
 * - Non-interactive methodology summary
 * - Entry points for:
 *    * Creating a new project (modal with text input)
 *    * Loading an existing project (modal with selectable list)
 *    * Deleting an existing project (modal with selectable list + warning)
 */


function getStepDescription(stepName: string): string {
  switch (stepName) {
    // Analysis
    case "Segment Text": return "Break down the legal text into atomic sections.";
    case "Extract Rules": return "Identify business rules and key entities from the text.";
    case "Detect Conflicts": return "Check for logical contradictions between rules.";
    
    // Modeling
    case "Create Data Model": return "Define the structure of entities and fields.";
    case "Generate Business Rules": return "Create executable Decision Tables from the extracted rules.";
    case "Generate GoRules Format": return "Convert the model into a GoRules-compatible JSON graph.";
    
    // Testing
    case "Download File": return "Export the final project for use in the GoRules engine.";
    
    default: return "";
  }
}

export default function StartingPage({
  showCreate,
  setShowCreate,
  showLoad,
  setShowLoad,
  showDelete,
  setShowDelete,
  newName,
  setNewName,
  projects,
  submitCreate,
  selectProject,
  deleteProject,
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
                A methodology for transforming legal provisions into structured, implementation-ready rules.
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
                    <th className="px-5 py-4 w-1/4 text-sm md:text-base font-bold uppercase tracking-wide text-slate-400">
                      Stage
                    </th>
                    <th className="px-5 py-4 text-sm md:text-base font-bold uppercase tracking-wide text-slate-400">
                      Step Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {Object.entries(methodology).map(([phase, steps]) => (
                    <tr
                      key={phase}
                      className="hover:bg-slate-800/60 transition-colors"
                    >
                      <td className="px-5 py-5 font-bold text-slate-100 align-top w-40 text-base">
                        {phase}
                      </td>
                      <td className="px-5 py-5 text-slate-300 text-base leading-relaxed">
                        <ul className="space-y-3">
                           {steps.map(step => (
                              <li key={step.stepNumber}>
                                 <span className="font-bold text-slate-100">{step.stepName}:</span>{" "}
                                 <span className="text-slate-300">
                                   {getStepDescription(step.stepName)}
                                 </span>
                              </li>
                           ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </section>

          {/* Call to action */}
          <section className="pt-2">
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
              <button
                onClick={() => setShowDelete(true)}
                className="inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-medium border border-red-900/50 bg-red-950/20 hover:bg-red-900/40 text-red-200 shadow-md shadow-red-900/10 transition-colors"
              >
                Delete Project
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Modal: Create Project (controlled by showCreate) */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <div className="space-y-6 text-center">
          <div className="space-y-2">
             <h2 className="text-2xl font-bold text-slate-100">
               Create New Project
             </h2>
             <p className="text-sm text-slate-400 max-w-sm mx-auto">
               Define a descriptive project name to get started.
             </p>
          </div>
          <div className="space-y-3 text-left">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide ml-1">
              Project Name
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Student Meal Eligibility"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-xs font-semibold rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitCreate}
              className="px-4 py-2 text-xs font-bold rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Create Project
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Load Project (controlled by showLoad) */}
      <Modal open={showLoad} onClose={() => setShowLoad(false)}>
        <div className="space-y-6 text-center">
          <div className="space-y-2">
             <h2 className="text-2xl font-bold text-slate-100">
               Load Project
             </h2>
             <p className="text-sm text-slate-400 max-w-sm mx-auto">
               Select an existing project to resume work.
             </p>
          </div>

          {projects.length ? (
            <ul className="space-y-2 max-h-64 overflow-y-auto pr-2 text-left">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    className="w-full text-center px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-sm text-slate-100 transition-all group"
                    onClick={() => {
                        selectProject(p);
                      }}
                  >
                    <span className="font-semibold group-hover:text-emerald-400 transition-colors block">{p.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-slate-500 italic">
               No pages found.
            </div>
          )}

          <button
            onClick={() => setShowLoad(false)}
            className="px-6 py-2 text-xs font-medium rounded-full border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors mt-4"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Modal: Delete Project (controlled by showDelete) */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)}>
        <div className="space-y-6 text-center">
            <div className="space-y-2">
             <h2 className="text-2xl font-bold ">
               Delete Project
             </h2>
             <p className="text-sm text-slate-400 max-w-sm mx-auto">
               This action is <strong className="text-red-400">irreversible</strong>. 
               <br />
              Delete all of the data related to the selected project.
             </p>
            </div>

          {projects.length ? (
            <ul className="space-y-2 max-h-64 overflow-y-auto pr-2 text-left">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    className="w-full text-center px-4 py-3 rounded-lg bg-red-950/10 hover:bg-red-950/20 border border-red-900/30 hover:border-red-900/50 text-sm text-slate-100 transition-all group"
                    onClick={() => {
                      deleteProject(p.id);
                    }}
                  >
                    <span className="font-semibold text-slate-300 group-hover:text-red-200 transition-colors block">{p.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-slate-500 italic">
               No projects found.
            </div>
          )}

          <button
              onClick={() => setShowDelete(false)}
               className="px-6 py-2 text-xs font-medium rounded-full border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors mt-4"
            >
              Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
