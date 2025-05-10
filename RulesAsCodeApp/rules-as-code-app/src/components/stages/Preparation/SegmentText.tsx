"use client";

import { StepEditorProps } from "@/lib/types";
import { useState } from "react";

export default function PreparationSegmentText({ step, onEdit, onApprove }: StepEditorProps) {
  const { phase, stepName, content } = step ?? {
    phase: "",
    stepName: "",
    content: {},
  };

  const [isApproving, setIsApproving] = useState(false);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const edited = e.currentTarget.innerText;
    onEdit(phase, stepName, content, (content as any)?.input ?? "", edited);
  };

  const getReadableOutput = (): string => {
    const sections = (content as any)?.result?.sections || [];
    return sections.map((s: any) =>
      `ID: ${s.id}\nTitle: ${s.title}\nContent:\n${s.content}\nReference ID: ${s.referenceId || "None"}`
    ).join("\n\n");
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">{`${phase} - ${stepName}`}</h2>

      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        className="w-full whitespace-pre-wrap p-2 border rounded mt-2 font-mono min-h-[400px] outline-none focus:ring focus:ring-blue-300"
      >
        {getReadableOutput()}
      </div>

      <button
        onClick={async () => {
          setIsApproving(true);
          try {
            await onApprove(phase, stepName);
          } finally {
            setIsApproving(false);
          }
        }}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        {isApproving ? "Approving..." : "Approve"}
      </button>
    </div>
  );
}
