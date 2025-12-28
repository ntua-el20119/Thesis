"use client";

import { useEffect } from "react";
import { stepComponentMap } from "@/components/stages";
import { StepEditorProps, JsonValue } from "@/lib/types";
import { useWizardStore } from "@/lib/store";

function jsonToTextareaString(v: unknown): string {
  // DB Json is non-null. Empty object should render as empty textarea.
  if (!v) return "";
  if (typeof v === "string") return v;

  if (typeof v === "object") {
    const keys = Object.keys(v as Record<string, unknown>);
    if (keys.length === 0) return "";
    return JSON.stringify(v, null, 2);
  }
  return String(v);
}

function structuredToOutputString(v: unknown): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    const keys = Object.keys(v as Record<string, unknown>);
    if (keys.length === 0) return "";
    return JSON.stringify(v, null, 2);
  }
  return String(v);
}

export default function StepRenderer(props: StepEditorProps) {
  const { step, onEdit } = props;
  const projectId = useWizardStore((s) => s.projectId);

  useEffect(() => {
    if (!step || !projectId) return;

    const { phase, stepNumber, stepName, content, input, output } = step;

    const isEmptyContent =
      !content ||
      (typeof content === "object" && Object.keys(content as any).length === 0);

    const isEmpty = isEmptyContent && !input && !output;
    if (!isEmpty) return;

    (async () => {
      try {
        const res = await fetch(
          `/api/step/${encodeURIComponent(String(phase))}/${encodeURIComponent(
            String(stepNumber)
          )}?projectId=${projectId}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          console.warn(
            `⚠️ Failed to load step ${phase}/${stepNumber}:`,
            await res.text()
          );
          return;
        }

        // Expected new DB row shape:
        // { phase, stepNumber, stepName, input, llmOutput, humanOutput, approved, humanModified, ... }
        const row = await res.json();

        const inputStr = jsonToTextareaString(row.input);

        const effectiveStructured =
          row.approved && row.humanModified && row.humanOutput
            ? row.humanOutput
            : row.llmOutput;

        const outputStr = structuredToOutputString(effectiveStructured);

        // content used by step component: keep llmOutput (or llmOutput.result if you prefer)
        const contentObj: JsonValue = (row.llmOutput ?? {}) as JsonValue;

        onEdit(
          row.phase,
          row.stepNumber,
          row.stepName,
          contentObj,
          inputStr,
          outputStr
        );
      } catch (err) {
        console.error("[DEBUG] Error loading step:", err);
      }
    })();
  }, [
    step?.phase,
    step?.stepNumber,
    step?.stepName,
    step?.content,
    step?.input,
    step?.output,
    projectId,
    step,
    onEdit,
  ]);

  if (!step) return null;

  // Component mapping still uses stepName
  const key = String(step.stepName).replace(/\s+/g, "");
  const Component = stepComponentMap[key];

  if (!Component) {
    return <p className="text-red-500">Unsupported step: {key}</p>;
  }

  return <Component {...props} />;
}
