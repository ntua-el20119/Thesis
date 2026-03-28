"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import { methodology } from "@/lib/types";

interface Project {
  id: number;
  name: string;
  status: string;
  createdAt: string;
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
  renameProject: (id: number, newName: string) => Promise<void> | void;
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
    case "Data Model": return "Define the structure of entities and fields.";
    case "Business Rules": return "Create executable Decision Tables from the extracted rules.";
    case "GoRules Format": return "Convert the model into a GoRules-compatible JSON graph.";
    
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
  renameProject,
}: StartingPageProps) {
  // Load modal: status filter
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Load modal: inline rename state { id, value }
  const [editState, setEditState] = useState<{ id: number; value: string } | null>(null);

  const filteredProjects = projects.filter((p) =>
    statusFilter === "all" ? true : p.status === statusFilter
  );
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
      <Modal open={showLoad} onClose={() => { setShowLoad(false); setEditState(null); }} maxWidth="max-w-2xl">
        <div className="space-y-5 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-100">Load Project</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">Select an existing project to resume work.</p>
          </div>

          {/* Status filter with counts */}
          <div className="flex items-center justify-center gap-2">
            {(["all", "in_progress", "completed"] as const).map((f) => {
              const count = f === "all" ? projects.length : projects.filter((p) => p.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 text-xs rounded-full font-medium border transition-colors ${
                    statusFilter === f
                      ? f === "completed"
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : f === "in_progress"
                        ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                        : "bg-slate-700 border-slate-600 text-slate-100"
                      : "bg-transparent border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {f === "all" ? "All" : f === "in_progress" ? "In Progress" : "Completed"}
                  <span className="ml-1.5 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {filteredProjects.length ? (
            <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2 text-left">
              {filteredProjects.map((p) => (
                <li key={p.id}>
                  {editState?.id === p.id ? (
                    /* ── Inline rename row ── */
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-800 border border-emerald-500/40">
                      <input
                        autoFocus
                        value={editState.value}
                        onChange={(e) => setEditState({ id: p.id, value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            renameProject(p.id, editState.value);
                            setEditState(null);
                          }
                          if (e.key === "Escape") setEditState(null);
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      <button
                        onClick={() => { renameProject(p.id, editState.value); setEditState(null); }}
                        className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors"
                      >Save</button>
                      <button
                        onClick={() => setEditState(null)}
                        className="px-3 py-1.5 text-xs rounded-md border border-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
                      >Cancel</button>
                    </div>
                  ) : (
                    /* ── Normal row ── */
                    <div
                      className="w-full flex items-center justify-between px-5 py-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all group cursor-pointer"
                      onClick={() => selectProject(p)}
                    >
                      <div className="flex-1 flex flex-col items-start gap-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-base group-hover:text-emerald-400 transition-colors">{p.name}</span>
                          {/* Rename button — stops propagation so it doesn't load the project */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditState({ id: p.id, value: p.name }); }}
                            className="p-1 rounded text-slate-600 hover:text-slate-300 hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                            title="Rename project"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                        </div>
                        <span className="text-xs text-slate-400 block tracking-wide">
                          Created: {new Date(p.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          p.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {p.status === 'in_progress' ? 'In Progress' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-slate-500 italic">
              {statusFilter === "all" ? "No projects found." : `No ${statusFilter === "in_progress" ? "in-progress" : "completed"} projects.`}
            </div>
          )}

          <button
            onClick={() => { setShowLoad(false); setEditState(null); }}
            className="px-6 py-2 text-xs font-medium rounded-full border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors mt-2"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Modal: Delete Project (controlled by showDelete) */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} maxWidth="max-w-2xl">
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
            <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2 text-left">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 rounded-lg bg-red-950/10 hover:bg-red-950/20 border border-red-900/30 hover:border-red-900/50 text-sm text-slate-100 transition-all group"
                    onClick={() => {
                      deleteProject(p.id);
                    }}
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-semibold text-base text-slate-300 group-hover:text-red-200 transition-colors block">{p.name}</span>
                      <span className="text-xs text-slate-500 block tracking-wide">
                        Created: {new Date(p.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        p.status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {p.status === 'in_progress' ? 'In Progress' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                      </span>
                      <span className="text-red-900/50 group-hover:text-red-400 transition-colors">🗑</span>
                    </div>
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
