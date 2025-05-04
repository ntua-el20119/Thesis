// src/lib/types.ts
type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export type Step = {
  phase: string;
  stepName: string;
  content: JsonValue;
  approved: boolean;
};

export const methodology = {
  Preparation: ["SegmentText"],
  Analysis: ["ExtractEntities", "FormalizeRules"],
  Implementation: ["GenerateCode"],
};