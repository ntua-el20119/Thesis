// src/components/StepEditor.tsx
"use client";

import { Step, JsonValue } from "@/lib/types";

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
  const renderSections = () => {
    if (!content || typeof content !== "object" || !Array.isArray((content as any).result?.sections)) {
      return <p>No sections to display. Please process text first.</p>;
    }
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
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl">{`${phase} - ${stepName}`}</h2>
      {renderSections()}
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
        disabled={!content || !content.result?.sections?.length}
      >
        Approve
      </button>
    </div>
  );
}