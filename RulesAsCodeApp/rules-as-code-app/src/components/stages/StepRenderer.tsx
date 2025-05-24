/* src/components/stages/StepRenderer.tsx */
"use client";

import { useEffect } from "react";
import { stepComponentMap } from "@/components/stages";
import { StepEditorProps } from "@/lib/types";

export default function StepRenderer(props: StepEditorProps) {
  const { step, onEdit } = props;

  /* -------------------------------------------------- */
  /*  Fetch from DB the very first time the step loads  */
  /* -------------------------------------------------- */
  useEffect(() => {
    if (!step) return;

    const { phase, stepName, content, input, output } = step;

    const empty =
      (!content ||
        (typeof content === "object" && Object.keys(content).length === 0)) &&
      !input &&
      !output;

    if (!empty) return; // already have data in the store

    (async () => {
      const res = await fetch(
        `/api/step/${encodeURIComponent(phase)}/${encodeURIComponent(
          stepName
        )}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const row = await res.json();
        onEdit(row.phase, row.stepName, row.content, row.input, row.output);
      }
    })();
  }, [step?.phase, step?.stepName]); // run when phase-step changes

  /* -------------------------------------------------- */
  /*  Normal rendering                                  */
  /* -------------------------------------------------- */
  if (!step) return null;

  const key = `${step.phase}${step.stepName}`.replace(/\s+/g, "");
  const Component = stepComponentMap[key];

  if (!Component) {
    return <p className="text-red-500">Unsupported step: {key}</p>;
  }

  return <Component {...props} />;
}
