// src/components/StepEditor.tsx
"use client";

import { Step, JsonValue } from "@/lib/types";
//import { useEffect } from "react";

interface StepEditorProps {
  step: Step | null;
  onEdit: (phase: string, stepName: string, content: JsonValue) => void;
  onApprove: (phase: string, stepName: string) => Promise<void>;
}

export default function StepEditor({ step, onEdit, onApprove }: StepEditorProps) {
  const { phase, stepName, content } = step || { phase: "", stepName: "", content: {} };

  const handleEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newContent: JsonValue = JSON.parse(e.target.value);
      onEdit(phase, stepName, newContent);
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  const handleApprove = async () => {
    try {
      await onApprove(phase, stepName);
    } catch (error) {
      console.error("Failed to approve step:", error);
    }
  };

  // Render sections if content is an array (from LLM response)
  const renderContent = () => {
    if (!content) {
      return <p>No content to display. Please process text first.</p>;
    }

    // Handle "Segment Text" output (sections)
    if (stepName === "Segment Text" && typeof content === "object" && content !== null && "result" in content && Array.isArray((content as any).result?.sections)) {
      const sections = (content as any).result.sections;
      return (
        <ul className="list-disc pl-5">
          {sections.map((section: any, index: number) => (
            <li key={index} className="mb-2">
              <strong>{section.title} (ID: {section.id})</strong>
              <p>{section.content}</p>
              {section.referenceId && <p>Reference: {section.referenceId}</p>}
            </li>
          ))}
        </ul>
      );
    }

    // Handle "Normalize Terminology" output
    if (stepName === "Normalize Terminology" && typeof content === "object" && content !== null && "normalized" in content) {
      const { text, terminologyMap } = (content as any).normalized;
      return (
        <div>
          <h4 className="font-semibold">Normalized Text:</h4>
          <p>{text}</p>
          <h4 className="font-semibold mt-2">Terminology Map:</h4>
          <ul className="list-disc pl-5">
            {Object.entries(terminologyMap).map(([original, standardized], index) => (
              <li key={index}>
                {original} → {standardized}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Fallback: Display raw content
    return (
      <div>
        <p className="text-yellow-500">Content format not recognized. Showing raw output:</p>
        <pre className="p-2 bg-gray-100 rounded">{typeof content === "string" ? content : JSON.stringify(content, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl">{`${phase} - ${stepName}`}</h2>
      {renderContent()}
      <textarea
        value={JSON.stringify(content, null, 2)}
        onChange={handleEdit}
        className="w-full p-2 border rounded mt-2"
        rows={5}
        placeholder="Edit the JSON structure here if needed"
      />
      <button
        onClick={handleApprove}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
        disabled={!content}
      >
        Approve
      </button>
    </div>
  );
}