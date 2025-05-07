// src/lib/types.ts
export type JsonValue =
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
  Preparation: 
    [
      "Segment Text", 
      "Normalize Terminology", 
      "Key Sections", 
      "Inconsistency Scan",
      "Inconsistency Categorization",
    ],
  
  Analysis: 
    [
      "Extract Entities",
      "Entity Refinement",
      "Data Requirement Identification",
      "Data Types and Validation Rules",
      "Ambiguity Tagging",
      "Uncertainty Modeling",
      "Entity Relationship Mapping",
      "Rule Extraction",
      "Rule Formalisation",
      "Rule Depencies Mapping",
      "Decision Requirement Diagram Creation",
      "Incosistency Detection",
      "Execution Path Conflicts Analysis",
      "Rule Categorisation",
      "Conflict Resolution Modeling"
    ],
  Implementation: ["GenerateCode"],
  Testing:[],
  Documentation:[]
};