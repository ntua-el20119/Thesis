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


  if (!step) return null;

  // Component mapping still uses stepName
  const key = String(step.stepName).replace(/\s+/g, "");
  const Component = stepComponentMap[key];

  if (!Component) {
    return <p className="text-red-500">Unsupported step: {key}</p>;
  }

  return <Component {...props} />;
}
