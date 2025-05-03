// src/components/StepEditor.tsx
"use client";

import { Step, JsonValue } from "@/lib/types"; // Import JsonValue

interface StepEditorProps {
  step: Step | null;
  onEdit: (phase: string, stepName: string, content: JsonValue) => void; // Update type
  onApprove: (phase: string, stepName: string) => Promise<void>;
}

export default function StepEditor({ step, onEdit, onApprove }: StepEditorProps) {
  const { phase, stepName, content } = step || { phase: "", stepName: "", content: {} };

  const handleEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newContent: JsonValue = JSON.parse(e.target.value); // Type the parsed value
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

  return (
    <div className="mb-4">
      <h2 className="text-xl">{`${phase} - ${stepName}`}</h2>
      <textarea
        value={JSON.stringify(content, null, 2)}
        onChange={handleEdit}
        className="w-full p-2 border rounded"
        rows={5}
      />
      <button
        onClick={handleApprove}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
      >
        Approve
      </button>
    </div>
  );
}