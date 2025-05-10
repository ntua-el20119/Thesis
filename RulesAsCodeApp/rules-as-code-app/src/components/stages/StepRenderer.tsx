import { stepComponentMap } from "@/components/stages";
import { StepEditorProps } from "@/lib/types";

export default function StepRenderer(props: StepEditorProps) {
  const { step } = props;
  if (!step) return null;

  const key = `${step.phase}${step.stepName}`.replace(/\s+/g, "");
  const Component = stepComponentMap[key];

  if (!Component) {
    return <p className="text-red-500">Unsupported step: {key}</p>;
  }

  return <Component {...props} />;
}

