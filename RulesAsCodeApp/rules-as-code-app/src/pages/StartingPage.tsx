"use client";

import React from "react";
import Modal from "@/components/Modal"; // keep your current import path
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
 * This component renders the entire "Onboarding / Pre-start Mode" UI that lived inside Home.
 * It keeps the same comments and structure; Home simply passes the state/handlers as props.
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
  // --------------------------------------------------------------------------
  // Onboarding / Pre-start Mode
  // - Renders a non-interactive methodology summary and entry points for:
  //     * Creating a new project (modal with text input)
  //     * Loading an existing project (modal with selectable list)
  // - UX principle: minimize initial friction; explain stages before starting.
  // --------------------------------------------------------------------------
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
          <p>You haven&apos;t created any projects.</p>
        )}
      </Modal>
    </div>
  );
}
